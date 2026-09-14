// --- LOCAL STORAGE SQLITE SYNC SYSTEM ---
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;
const originalClear = localStorage.clear;

const SYNC_KEYS = [
    'school_settings',
    'school_class_fees',
    'school_id_reg_settings',
    'school_classes',
    'school_class_sections',
    'school_class_id_prefixes',
    'school_students',
    'contact_messages',
    'school_notices', // Fixed from 'notice_board_messages' to match actual localStorage key
    'school_slider_images',
    'school_logo',
    'school_exam_schedules',
    'school_subjects',
    'school_marking_system',
    'school_student_marks',
    'school_ticker_notices'
];

let isPullingDb = false;
let hasSyncedInitially = false;
const lastLocalWrites = {};

async function syncDatabaseFromServer() {
    try {
        const response = await fetch('/api/db');
        if (response.ok) {
            const data = await response.json();
            
            isPullingDb = true;
            try {
                if (!hasSyncedInitially) {
                    // INITIAL SYNC ON PAGE LOAD:
                    // 1. If server has data, write it to local storage.
                    // 2. If server does not have data, but client has it, push client data to server.
                    for (const key of SYNC_KEYS) {
                        const serverVal = data[key];
                        const localVal = localStorage.getItem(key);
                        
                        if (serverVal !== undefined && serverVal !== null) {
                            if (localVal !== serverVal) {
                                originalSetItem.call(localStorage, key, serverVal);
                            }
                        } else if (localVal !== null) {
                            // Server doesn't have it, but client does. Push client's data to initialize server.
                            await pushToServer(key, localVal);
                        }
                    }
                    hasSyncedInitially = true;
                } else {
                    // PERIODIC SYNC (POLLING):
                    // 1. Sync present keys from server to client
                    Object.keys(data).forEach(key => {
                        if (!SYNC_KEYS.includes(key)) return;
                        
                        const lastWrite = lastLocalWrites[key];
                        if (lastWrite && (Date.now() - lastWrite < 5000)) {
                            return; // Skip if we recently wrote this key locally
                        }
                        if (localStorage.getItem(key) !== data[key]) {
                            originalSetItem.call(localStorage, key, data[key]);
                        }
                    });

                    // 2. Remove keys deleted/absent on server
                    SYNC_KEYS.forEach(key => {
                        const lastWrite = lastLocalWrites[key];
                        if (lastWrite && (Date.now() - lastWrite < 5000)) {
                            return;
                        }
                        if (data[key] === undefined && localStorage.getItem(key) !== null) {
                            originalRemoveItem.call(localStorage, key);
                        }
                    });
                }
            } finally {
                isPullingDb = false;
            }
            
            // Re-apply school settings once database is pulled
            applySchoolSettings();
            
            // Dispatch event for page-specific scripts to reload
            window.dispatchEvent(new Event('dbSynced'));
        }
    } catch (e) {
        console.error("Failed to sync database from server:", e);
    }
}

localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (!isPullingDb) {
        lastLocalWrites[key] = Date.now();
        
        // If initial sync hasn't completed yet, we defer pushing to server
        // until the initial sync completes (which will push any local values not on the server).
        if (hasSyncedInitially) {
            pushToServer(key, value);
        }
    }
};

localStorage.removeItem = function(key) {
    originalRemoveItem.apply(this, arguments);
    if (!isPullingDb) {
        lastLocalWrites[key] = Date.now();
        if (hasSyncedInitially) {
            deleteFromServer(key);
        }
    }
};

localStorage.clear = function() {
    originalClear.apply(this, arguments);
    if (!isPullingDb) {
        SYNC_KEYS.forEach(key => {
            lastLocalWrites[key] = Date.now();
        });
        if (hasSyncedInitially) {
            clearOnServer();
        }
    }
};

async function pushToServer(key, value) {
    try {
        await fetch('/api/db/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value })
        });
    } catch (e) {
        console.error("Failed to push setItem to server:", e);
    }
}

async function deleteFromServer(key) {
    try {
        await fetch('/api/db/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
    } catch (e) {
        console.error("Failed to push removeItem to server:", e);
    }
}

async function clearOnServer() {
    try {
        await fetch('/api/db/clear', {
            method: 'POST'
        });
    } catch (e) {
        console.error("Failed to push clear to server:", e);
    }
}

// Function to update notice ticker dynamically
function updateNoticeTicker() {
    const noticeTextElement = document.querySelector('.notice-text');
    if (!noticeTextElement) return;

    let storedNotices = localStorage.getItem('school_ticker_notices');
    if (storedNotices) {
        try {
            const notices = JSON.parse(storedNotices);
            if (Array.isArray(notices) && notices.length > 0) {
                // Join notices with bullet character and spacing
                noticeTextElement.innerText = notices.join("    ★    ");
                
                // Dynamically adjust marquee speed based on text length to keep it readable
                const textLength = noticeTextElement.innerText.length;
                const speed = Math.max(15, Math.round(textLength * 0.25));
                noticeTextElement.style.animationDuration = `${speed}s`;
                
                const noticeBar = document.querySelector('.notice-bar');
                if (noticeBar) noticeBar.style.display = 'block';
                return;
            }
        } catch (e) {
            console.error("Failed to parse school_ticker_notices:", e);
        }
    }
    
    // Default fallback
    noticeTextElement.innerText = "সকল ছাত্র-ছাত্রীর অবগতির জন্য জানানো যাচ্ছে যে, আগামী কাল ১৬ ডিসে্বর বিদ্যালয় বন্ধ থাকিবে";
    noticeTextElement.style.animationDuration = "28s";
    const noticeBar = document.querySelector('.notice-bar');
    if (noticeBar) noticeBar.style.display = 'block';
}

// Global listener to update UI components when DB sync completes
window.addEventListener('dbSynced', () => {
    if (typeof loadCurrentSettings === 'function') loadCurrentSettings();
    if (typeof loadClassFeesForm === 'function') loadClassFeesForm();
    if (typeof loadIdRegForm === 'function') loadIdRegForm();
    if (typeof renderClassSectionList === 'function') renderClassSectionList();
    if (typeof renderStudentList === 'function') renderStudentList();
    if (typeof renderPromotionList === 'function') renderPromotionList();
    if (typeof renderNotices === 'function') renderNotices();
    if (typeof initializeFeeLabels === 'function') {
        initializeFeeLabels();
        if (typeof calculateFees === 'function') calculateFees();
    }
    if (typeof renderSlider === 'function') renderSlider();
    updateNoticeTicker();
});

// Start initial pull immediately and poll every 3 seconds for dynamic multi-user sync
syncDatabaseFromServer();
setInterval(syncDatabaseFromServer, 3000);

// Initialize ticker text on load
document.addEventListener('DOMContentLoaded', updateNoticeTicker);
updateNoticeTicker(); // Run immediately in case DOM is already loaded


// --- 1. HERO SLIDESHOW JAVASCRIPT ---
let currentSlideIndex = 0;
let slides = [];
let dotsContainer = document.getElementById('slider-dots-container');
let sliderTimer;

const DEFAULT_SLIDES = [
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1470&auto=format&fit=crop'
];

function loadSliderImages() {
    let stored = localStorage.getItem('school_slider_images');
    if (!stored) {
        stored = JSON.stringify(DEFAULT_SLIDES);
        localStorage.setItem('school_slider_images', stored);
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        return DEFAULT_SLIDES;
    }
}

function renderSlider() {
    const images = loadSliderImages();
    const header = document.querySelector('.hero-slider-container');
    if (!header) return;

    // Remove all old slide elements
    const oldSlides = header.querySelectorAll('.slide');
    oldSlides.forEach(s => s.remove());

    // Clear dots
    dotsContainer = document.getElementById('slider-dots-container');
    if (dotsContainer) dotsContainer.innerHTML = '';

    slides = [];
    const overlay = header.querySelector('.hero-overlay');

    images.forEach((imgSrc, index) => {
        // Create slide
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        if (index === currentSlideIndex) {
            slideDiv.classList.add('active');
        }
        slideDiv.style.backgroundImage = `url('${imgSrc}')`;
        // Insert right before overlay
        header.insertBefore(slideDiv, overlay);
        slides.push(slideDiv);

        // Create dot
        if (dotsContainer) {
            const dotSpan = document.createElement('span');
            dotSpan.className = 'dot';
            if (index === currentSlideIndex) {
                dotSpan.classList.add('active');
            }
            dotSpan.onclick = () => setSlide(index);
            dotsContainer.appendChild(dotSpan);
        }
    });

    // Handle index out of bounds
    if (currentSlideIndex >= images.length) {
        currentSlideIndex = 0;
    }
    
    if (slides.length > 0) {
        slides.forEach((s, idx) => {
            if (idx === currentSlideIndex) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        updateDots();
    }

    startSliderTimer();
}

function initializeSliderControls() {
    const uploaderBtn = document.querySelector('.uploader-overlay-btn');
    if (uploaderBtn && !document.getElementById('slider-remove-btn')) {
        const removeBtn = document.createElement('button');
        removeBtn.id = 'slider-remove-btn';
        removeBtn.className = 'uploader-overlay-btn remove-btn';
        removeBtn.type = 'button';
        removeBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            <span>Remove Image</span>
        `;
        removeBtn.onclick = handleImageRemove;
        uploaderBtn.parentNode.insertBefore(removeBtn, uploaderBtn);
    }
}

// Start Auto Slider
function startSliderTimer() {
    stopSliderTimer();
    if (slides.length <= 1) return;
    sliderTimer = setInterval(() => {
        changeSlide(1);
    }, 5000); // 5 Seconds interval
}

function stopSliderTimer() {
    if (sliderTimer) clearInterval(sliderTimer);
}

// Change slide by +1 or -1
function changeSlide(direction) {
    if (slides.length <= 1) return;
    slides[currentSlideIndex].classList.remove('active');
    currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
    slides[currentSlideIndex].classList.add('active');
    updateDots();
}

// Set specific slide index
function setSlide(index) {
    if (slides.length === 0) return;
    slides[currentSlideIndex].classList.remove('active');
    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add('active');
    updateDots();
    startSliderTimer();
}

// Synchronize dots with active slide
function updateDots() {
    if (!dotsContainer) return;
    let dots = Array.from(dotsContainer.querySelectorAll('.dot'));
    dots.forEach((dot, index) => {
        if (index === currentSlideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Maximum dimensions for slider images
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 600;

            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }
            if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.7 quality (highly efficient compression)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(dataUrl);
        };
        img.src = event.target.result;
    };
    reader.onerror = function(err) {
        console.error("FileReader error:", err);
    };
    reader.readAsDataURL(file);
}

// Dynamic Image Upload to Slideshow
function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    let images = loadSliderImages();
    let loadedCount = 0;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        alert("Please select valid image files only.");
        return;
    }

    imageFiles.forEach(file => {
        compressImage(file, function(compressedBase64) {
            images.push(compressedBase64);
            loadedCount++;
            
            if (loadedCount === imageFiles.length) {
                try {
                    // Update write timestamp to prevent immediate sync poll overwrite
                    lastLocalWrites['school_slider_images'] = Date.now();
                    localStorage.setItem('school_slider_images', JSON.stringify(images));
                    currentSlideIndex = images.length - imageFiles.length; // switch to the first uploaded image
                    renderSlider();
                    alert("Successfully uploaded " + imageFiles.length + " image(s) and saved permanently!");
                } catch (error) {
                    console.error("Storage write failed:", error);
                    alert("Failed to save images. Storage is full. Try deleting some existing images first.");
                }
            }
        });
    });

    // Reset file input so same file can be uploaded again
    event.target.value = '';
}

// Dynamic Image Remove
function handleImageRemove() {
    let images = loadSliderImages();
    if (images.length <= 1) {
        alert("At least one image must remain in the slideshow!");
        return;
    }

    if (confirm("Are you sure you want to remove the current image?")) {
        images.splice(currentSlideIndex, 1);
        localStorage.setItem('school_slider_images', JSON.stringify(images));
        
        // Adjust current slide index
        if (currentSlideIndex >= images.length) {
            currentSlideIndex = images.length - 1;
        }
        
        renderSlider();
        alert("Image removed successfully!");
    }
}


// --- 2. MOBILE MENU ---
function toggleMobileMenu() {
    const menu = document.getElementById('nav-menu-list');
    menu.classList.toggle('open');
}


// --- 3. DYNAMIC SETTINGS & DATABASE LOADER (localStorage) ---
function applySchoolSettings() {
    let settings = localStorage.getItem('school_settings');
    if (!settings) {
        settings = {
            schoolName: "CREATIVE MODEL SCHOOL",
            schoolEmail: "info@creativemodelschool.edu",
            schoolPhone: "+88 02-9876543",
            schoolSubtitle: "Pioneer of Digital & Smart Education"
        };
        localStorage.setItem('school_settings', JSON.stringify(settings));
    } else {
        try {
            settings = JSON.parse(settings);
        } catch (e) {
            settings = {
                schoolName: "CREATIVE MODEL SCHOOL",
                schoolEmail: "info@creativemodelschool.edu",
                schoolPhone: "+88 02-9876543",
                schoolSubtitle: "Pioneer of Digital & Smart Education"
            };
        }
    }

    // Update document title if it contains the old or default school name
    const oldTitle = document.title;
    if (oldTitle.includes("CREATIVE MODEL SCHOOL")) {
        document.title = oldTitle.replace(/CREATIVE MODEL SCHOOL/g, settings.schoolName);
    }

    // Update Hero Title
    const heroTitle = document.getElementById('school-name');
    if (heroTitle) {
        heroTitle.textContent = settings.schoolName;
    }
    
    // Update Hero Subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroSubtitle.textContent = settings.schoolSubtitle || "Pioneer of Digital & Smart Education";
    }

    // Update ID card school name
    const idSchool = document.querySelector('.id-school-name');
    if (idSchool) {
        idSchool.textContent = settings.schoolName;
    }

    // Update Fees Receipt Title
    const receiptTitle = document.querySelector('.receipt-title');
    if (receiptTitle) {
        receiptTitle.textContent = settings.schoolName;
    }

    // Update Result Marksheet School Name
    const marksheetSchool = document.querySelector('.marksheet-header p:last-child');
    if (marksheetSchool && marksheetSchool.textContent.trim().includes("CREATIVE MODEL SCHOOL")) {
        marksheetSchool.textContent = settings.schoolName;
    }

    // Update Footer Text
    const footerParas = document.querySelectorAll('footer p');
    footerParas.forEach(p => {
        if (p.textContent.includes("CREATIVE MODEL SCHOOL")) {
            p.textContent = p.textContent.replace(/CREATIVE MODEL SCHOOL/g, settings.schoolName);
        }
    });

    // Update Contact Info Page (if on contact page)
    const contactItems = document.querySelectorAll('.contact-info-list li');
    contactItems.forEach(li => {
        if (li.textContent.includes("Phone & Email")) {
            const p = li.querySelector('p');
            if (p) {
                p.textContent = `Phone: ${settings.schoolPhone}, Email: ${settings.schoolEmail}`;
            }
        }
    });

    // Apply custom logo
    applySchoolLogo();
}

function applySchoolLogo() {
    const logoContainers = document.querySelectorAll('.school-logo-container');
    const customLogo = localStorage.getItem('school_logo');
    
    logoContainers.forEach(container => {
        if (customLogo) {
            container.innerHTML = `<img src="${customLogo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
        } else {
            // Default SVG logo
            container.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5.89 12.55L12 15.88l6.11-3.33c.6.3 1.89.88 1.89 1.45 0 .58-1.29 1.15-1.89 1.45L12 18.78l-6.11-3.33C5.29 15.15 4 14.58 4 14c0-.58 1.29-1.15 1.89-1.45z"/>
                </svg>
            `;
        }
    });
}

// Run immediately or on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        applySchoolSettings();
        initMobileDropdowns();
        initializeNavbarLogin();
        renderSlider();
        initializeSliderControls();
    });
} else {
    applySchoolSettings();
    initMobileDropdowns();
    initializeNavbarLogin();
    renderSlider();
    initializeSliderControls();
}


function initMobileDropdowns() {
    const dropdownToggles = document.querySelectorAll('.nav-item.dropdown > a');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            }
        });
    });
}

// --- 4. GLOBAL LOGIN FLOW SYSTEM ---
function openLoginModal() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // Perform logout
        sessionStorage.removeItem('isLoggedIn');
        alert("Logout successful!");
        updateLoginButtonState();
        location.reload();
        return;
    }
    
    const overlay = document.getElementById('global-login-modal');
    if (overlay) {
        // Clear old inputs and messages
        document.getElementById('login-user-id').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('login-success').style.display = 'none';
        overlay.classList.add('active');
    }
}

function closeLoginModal() {
    const overlay = document.getElementById('global-login-modal');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const userIdInput = document.getElementById('login-user-id').value.trim();
    const passwordInput = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');
    const successEl = document.getElementById('login-success');
    
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
    
    // Check credentials (admin / admin or admin / 12345)
    if (userIdInput === 'admin' && (passwordInput === 'admin' || passwordInput === '12345')) {
        successEl.textContent = "Login Successful! Redirecting...";
        successEl.style.display = 'block';
        
        sessionStorage.setItem('isLoggedIn', 'true');
        updateLoginButtonState();
        
        setTimeout(() => {
            closeLoginModal();
            location.reload();
        }, 1200);
    } else {
        errorEl.textContent = "Invalid User ID or Password!";
        errorEl.style.display = 'block';
    }
}

function updateLoginButtonState() {
    const loginBtns = document.querySelectorAll('#nav-login-btn');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    loginBtns.forEach(btn => {
        if (isLoggedIn) {
            btn.textContent = 'Logout';
            btn.classList.add('logged-in');
        } else {
            btn.textContent = 'Login';
            btn.classList.remove('logged-in');
        }
    });
}

function injectLoginModal() {
    if (document.getElementById('global-login-modal')) return;
    
    const modalHTML = `
        <div id="global-login-modal" class="login-modal-overlay" onclick="closeLoginModal()">
            <div class="login-modal-container" onclick="event.stopPropagation()">
                <button class="login-modal-close" onclick="closeLoginModal()">&times;</button>
                <h3 class="login-modal-title">System Administrator Login</h3>
                
                <div id="login-error" class="login-error-msg"></div>
                <div id="login-success" class="login-success-msg"></div>
                
                <form id="global-login-form" onsubmit="handleLoginSubmit(event)">
                    <div class="form-group">
                        <label for="login-user-id">User ID:</label>
                        <input type="text" id="login-user-id" class="form-control" placeholder="e.g. admin" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password:</label>
                        <input type="password" id="login-password" class="form-control" placeholder="e.g. admin" required autocomplete="current-password">
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px; background: var(--accent-grad); box-shadow: var(--cyan-glow);">Login</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function initializeNavbarLogin() {
    // Inject Login button in the hero slider container at the top right
    const heroSlider = document.querySelector('.hero-slider-container');
    if (heroSlider && !document.getElementById('nav-login-btn')) {
        const loginBtn = document.createElement('button');
        loginBtn.id = 'nav-login-btn';
        loginBtn.className = 'hero-login-btn';
        
        loginBtn.textContent = 'Login';
        loginBtn.addEventListener('click', openLoginModal);
        
        heroSlider.appendChild(loginBtn);
    }
    
    // Inject Modal
    injectLoginModal();
    
    // Set active button label state
    updateLoginButtonState();
}

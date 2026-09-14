
        // --- GLOBAL STATE & CMS DATA STORE ---
        let ERP_SETTINGS = {};
        let ERP_STAFF = [];
        let ERP_CLASSES = [];
        let ERP_SECTIONS = [];
        let ERP_SUBJECTS = {};
        let ERP_NOTICES = [];
        let ERP_TICKER = [];
        let ERP_FEES = {};
        let ERP_SLIDERS = [];
        let ERP_QUICK_LINKS = [];
        let CMS_CONFIG = {};
        let currentSlideIdx = 0;
        let slideTimer = null;
        let cmsRealtimePollInterval = null;

        // --- HELPER: SAFE GET LOCALSTORAGE OR SERVER DATA ---
        function safeParse(raw, fallback = null) {
            if (!raw && raw !== 0) return fallback;
            if (typeof raw === 'object') return raw;
            try {
                return JSON.parse(raw);
            } catch (e) {
                return fallback;
            }
        }

        function getStoreData(key, fallback = null) {
            try {
                if (window.__SERVER_SYNC_DATA__ && window.__SERVER_SYNC_DATA__[key]) {
                    const raw = window.__SERVER_SYNC_DATA__[key];
                    return safeParse(raw, fallback);
                }
                const local = localStorage.getItem(key);
                if (local) {
                    return safeParse(local, fallback);
                }
            } catch (e) {
                console.warn("Parse error for " + key, e);
            }
            return fallback;
        }

        // --- LOAD AND HYDRATE ALL ERP DATA TO CMS ---
        async function loadCmsDataEngine() {
            try {
                // 1. School Profile & Settings
                ERP_SETTINGS = getStoreData('school_settings', {}) || {};

                // 2. Staff Directory
                ERP_STAFF = getStoreData('school_staff', []) || [];

                // 3. Classes & Sections
                ERP_CLASSES = getStoreData('school_classes', ["Six", "Seven", "Eight", "Nine", "Ten"]) || [];
                ERP_SECTIONS = getStoreData('school_class_sections', []) || [];
                ERP_SUBJECTS = getStoreData('school_subjects', {}) || {};

                // 4. Notices & Tickers
                ERP_TICKER = getStoreData('school_ticker_notices', []) || [];
                ERP_NOTICES = getStoreData('school_notices', []) || [];

                // 5. Fees & Sliders
                ERP_FEES = getStoreData('school_class_fees', {}) || {};
                ERP_SLIDERS = getStoreData('school_slider_images', []) || [];
                ERP_QUICK_LINKS = getStoreData('school_important_links', null) || getStoreData('school_quick_links', []) || [];
                CMS_CONFIG = getStoreData('school_cms_settings', {}) || {};

                // Initial render from local/bootstrap cache (0ms instant)
                renderAllCmsSections();

                // If remote server is reachable, fetch latest async
                fetch('/api/db')
                    .then(res => res.json())
                    .then(data => {
                        if (data && typeof data === 'object') {
                            if (data.school_settings) ERP_SETTINGS = safeParse(data.school_settings, ERP_SETTINGS);
                            if (data.school_staff) ERP_STAFF = safeParse(data.school_staff, ERP_STAFF);
                            if (data.school_classes) ERP_CLASSES = safeParse(data.school_classes, ERP_CLASSES);
                            if (data.school_class_sections) ERP_SECTIONS = safeParse(data.school_class_sections, ERP_SECTIONS);
                            if (data.school_subjects) ERP_SUBJECTS = safeParse(data.school_subjects, ERP_SUBJECTS);
                            if (data.school_ticker_notices) ERP_TICKER = safeParse(data.school_ticker_notices, ERP_TICKER);
                            if (data.school_notices) ERP_NOTICES = safeParse(data.school_notices, ERP_NOTICES);
                            if (data.school_class_fees) ERP_FEES = safeParse(data.school_class_fees, ERP_FEES);
                            if (data.school_slider_images) ERP_SLIDERS = safeParse(data.school_slider_images, ERP_SLIDERS);
                            if (data.school_important_links) {
                                ERP_QUICK_LINKS = safeParse(data.school_important_links, ERP_QUICK_LINKS);
                            } else if (data.school_quick_links) {
                                ERP_QUICK_LINKS = safeParse(data.school_quick_links, ERP_QUICK_LINKS);
                            }
                            if (data.school_cms_settings) CMS_CONFIG = safeParse(data.school_cms_settings, CMS_CONFIG);
                            renderAllCmsSections();
                        }
                    })
                    .catch(e => {
                        console.log("Offline mode active for CMS:", e);
                    });

            } catch (err) {
                console.error("Error initializing CMS:", err);
            }
        }

        // --- REALTIME DATA SYNC REFRESH ---
        async function refreshCmsRealtimeData() {
            try {
                const res = await fetch('/api/db');
                if (!res.ok) return;
                const data = await res.json();
                if (data && typeof data === 'object') {
                    let hasChanges = false;
                    if (data.school_notices) { ERP_NOTICES = safeParse(data.school_notices, ERP_NOTICES); hasChanges = true; }
                    if (data.school_ticker_notices) { ERP_TICKER = safeParse(data.school_ticker_notices, ERP_TICKER); hasChanges = true; }
                    if (data.school_important_links) {
                        ERP_QUICK_LINKS = safeParse(data.school_important_links, ERP_QUICK_LINKS);
                        hasChanges = true;
                    } else if (data.school_quick_links) {
                        ERP_QUICK_LINKS = safeParse(data.school_quick_links, ERP_QUICK_LINKS);
                        hasChanges = true;
                    }
                    if (data.school_settings) { ERP_SETTINGS = safeParse(data.school_settings, ERP_SETTINGS); }
                    if (data.school_staff) { ERP_STAFF = safeParse(data.school_staff, ERP_STAFF); }
                    if (data.school_classes) {
                        ERP_CLASSES = safeParse(data.school_classes, ERP_CLASSES);
                        initAdmissionClassDropdown();
                    }
                    if (data.school_class_sections) {
                        ERP_SECTIONS = safeParse(data.school_class_sections, ERP_SECTIONS);
                        const targetCls = document.getElementById('admTargetClass') ? document.getElementById('admTargetClass').value : '';
                        if (targetCls && isClassNineOrTenMatch(targetCls)) {
                            handleAdmClassChange(targetCls);
                        }
                    }
                    if (data.school_subjects) {
                        ERP_SUBJECTS = safeParse(data.school_subjects, ERP_SUBJECTS);
                        const targetCls = document.getElementById('admTargetClass') ? document.getElementById('admTargetClass').value : '';
                        const targetGrp = document.getElementById('admGroup') ? document.getElementById('admGroup').value : '';
                        if (targetCls && isClassNineOrTenMatch(targetCls)) {
                            handleAdmGroupChange(targetGrp);
                        }
                    }

                    if (data.bd_geo_admission_data) {
                        const newGeoStr = typeof data.bd_geo_admission_data === 'string' ? data.bd_geo_admission_data : JSON.stringify(data.bd_geo_admission_data);
                        const oldGeoStr = localStorage.getItem('bd_geo_admission_data');
                        if (newGeoStr !== oldGeoStr) {
                            localStorage.setItem('bd_geo_admission_data', newGeoStr);
                            initAdmissionGeoDropdowns();
                        }
                    }

                    if (data.school_admission_applications) {
                        const newAdmStr = typeof data.school_admission_applications === 'string' ? data.school_admission_applications : JSON.stringify(data.school_admission_applications);
                        const oldAdmStr = localStorage.getItem('school_admission_applications');
                        if (newAdmStr && newAdmStr !== oldAdmStr) {
                            localStorage.setItem('school_admission_applications', newAdmStr);
                        }
                    }

                    if (hasChanges) {
                        renderTicker();
                        renderNotices();
                        renderQuickLinks();
                        renderStatistics();
                        renderClassesAndCurriculum();
                    }
                }
            } catch (e) {
                // Offline or background silent fail
            }
        }

        // --- RENDER ALL CMS SECTIONS ---
        function renderAllCmsSections() {
            renderSchoolIdentity();
            renderTicker();
            renderHeroSliders();
            renderSpeeches();
            renderStatistics();
            renderClassesAndCurriculum();
            renderStaffDirectory(ERP_STAFF);
            renderNotices();
            renderQuickLinks();
            renderFeeStructure();
            renderGallery();
            applySectionVisibilities();
        }

        // --- 1. RENDER SCHOOL IDENTITY ---
        function renderSchoolIdentity() {
            const nameEn = ERP_SETTINGS.schoolName || "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
            const nameBn = ERP_SETTINGS.schoolSubtitle || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
            const email = ERP_SETTINGS.schoolEmail || ERP_SETTINGS.schoolGmail || "nironjoray40@gmail.com";
            const phone = ERP_SETTINGS.schoolPhone || "+8801794918384";
            const address = ERP_SETTINGS.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
            const logo = localStorage.getItem('school_logo') || ERP_SETTINGS.schoolLogo || "school_logo.svg";

            document.title = nameBn + " - অফিসিয়াল CMS পোর্টাল";

            const logoEl = document.getElementById('cmsSchoolLogo');
            if (logoEl) logoEl.src = logo;

            // Header & Modals
            const brandName = document.getElementById('cmsSchoolName');
            if (brandName) brandName.textContent = nameEn;
            const brandSub = document.getElementById('cmsSchoolSubtitle');
            if (brandSub) brandSub.textContent = nameBn;

            const modalLogoEl = document.getElementById('modalLoginSchoolLogo');
            if (modalLogoEl) modalLogoEl.src = logo;
            const modalNameEl = document.getElementById('modalLoginSchoolName');
            if (modalNameEl) modalNameEl.textContent = nameEn;

            // Extract EIIN & Code from schoolOther if present
            let eiin = "124915";
            let code = "465056";
            let estd = "১৯৯০ ইং";
            const otherText = ERP_SETTINGS.schoolOther || '';
            if (otherText) {
                const eiinMatch = otherText.match(/EIIN\s*:\s*([0-9]+)/i);
                if (eiinMatch && eiinMatch[1]) eiin = eiinMatch[1];
                const codeMatch = otherText.match(/(?:কোড|code)\s*:\s*([0-9]+)/i);
                if (codeMatch && codeMatch[1]) code = codeMatch[1];
                const estdMatch = otherText.match(/স্থাপিত\s*:\s*([^\s]+)/i);
                if (estdMatch && estdMatch[1]) estd = estdMatch[1];
            }

            // Top Bar
            const topEiin = document.getElementById('topEiinBadge');
            if (topEiin) topEiin.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> EIIN: <strong>${eiin}</strong>`;
            const topCode = document.getElementById('topCodeBadge');
            if (topCode) topCode.innerHTML = `<i class="fa-solid fa-barcode"></i> কোড: <strong>${code}</strong>`;
            const topPhone = document.getElementById('topPhone');
            if (topPhone) topPhone.innerHTML = `<i class="fa-solid fa-phone"></i> ${phone}`;
            const topEmail = document.getElementById('topEmail');
            if (topEmail) topEmail.innerHTML = `<i class="fa-solid fa-envelope"></i> ${email}`;

            // About Section
            const aboutHead = document.getElementById('aboutSchoolHeading');
            if (aboutHead) aboutHead.textContent = nameBn;
            const aboutEiinEl = document.getElementById('aboutEiin');
            if (aboutEiinEl) aboutEiinEl.textContent = eiin;
            const aboutCodeEl = document.getElementById('aboutCode');
            if (aboutCodeEl) aboutCodeEl.textContent = code;
            const aboutEstdEl = document.getElementById('aboutEstd');
            if (aboutEstdEl) aboutEstdEl.textContent = estd;
            const aboutLoc = document.getElementById('aboutLocation');
            if (aboutLoc) aboutLoc.textContent = address;

            // Contact Section
            const cAdd = document.getElementById('contactAddress');
            if (cAdd) cAdd.textContent = address;
            const cPh = document.getElementById('contactPhone');
            if (cPh) cPh.textContent = phone;
            const cEm = document.getElementById('contactEmail');
            if (cEm) cEm.textContent = email;

            // Footer
            const fName = document.getElementById('footerSchoolName');
            if (fName) fName.textContent = nameEn;
            const fSub = document.getElementById('footerSchoolSubtitle');
            if (fSub) fSub.textContent = `${nameBn}, ${address}। আধুনিক শিক্ষা ও নৈতিক মূল্যবোধের নির্ভরযোগ্য প্রতিষ্ঠান।`;

            if (ERP_SETTINGS.facebookLink) {
                const fb = document.getElementById('footerFbLink');
                if (fb) fb.href = ERP_SETTINGS.facebookLink;
            }
            if (ERP_SETTINGS.youtubeLink) {
                const yt = document.getElementById('footerYtLink');
                if (yt) yt.href = ERP_SETTINGS.youtubeLink;
            }
            if (ERP_SETTINGS.twitterLink) {
                const tw = document.getElementById('footerTwLink');
                if (tw) tw.href = ERP_SETTINGS.twitterLink;
            }
        }

        // --- 2. RENDER TICKER NOTICES ---
        function renderTicker() {
            const tickerEl = document.getElementById('cmsTickerText');
            if (!tickerEl) return;

            let texts = [];
            if (ERP_TICKER && ERP_TICKER.length > 0) {
                texts = ERP_TICKER.map(t => {
                    if (typeof t === 'string') return t;
                    if (t.text) return t.text;
                    if (t.title) return t.title + (t.date ? ` (${t.date})` : '');
                    if (t.fileName) return `বিজ্ঞপ্তি: ${t.fileName}` + (t.date ? ` (${t.date})` : '');
                    return '';
                }).filter(Boolean);
            }

            if (texts.length > 0) {
                tickerEl.innerHTML = texts.join(' &nbsp; &bull; &nbsp; ');
            } else {
                tickerEl.textContent = "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়ে আপনাকে স্বাগতম। সকল প্রকার নোটিশ, পরীক্ষার ফলাফল এবং ভর্তির তথ্য ওয়েবসাইট থেকে পাওয়া যাবে।";
            }
        }

        // --- 3. RENDER HERO SLIDERS ---
        function renderHeroSliders() {
            const container = document.getElementById('heroSliderContainer');
            if (!container) return;

            let slidesList = ERP_SLIDERS;
            if (!slidesList || slidesList.length === 0) {
                slidesList = [
                    {
                        title: "জ্ঞানের আলোয় আলোকিত হোক প্রতিটি ভবিষ্যৎ",
                        subtitle: "নৈতিক শিক্ষা, আধুনিক প্রযুক্তি এবং সৃষ্টিশীল মেধার সমন্বয়ে গড়ে উঠছে দেশ গড়ার যোগ্য কারিগর।",
                        badge: "আধুনিক ও ডিজিটাল শিক্ষা প্রতিষ্ঠান"
                    },
                    {
                        title: "স্মার্ট বাংলাদেশ বিনির্মাণে গুণগত শিক্ষা",
                        subtitle: "অভিজ্ঞ শিক্ষকমণ্ডলী, অত্যাধুনিক বিজ্ঞান ও কম্পিউটার ল্যাব এবং সুশৃঙ্খল পরিবেশ।",
                        badge: "বিজ্ঞান ও প্রযুক্তিমনস্ক শিক্ষা"
                    },
                    {
                        title: "২০২৬ শিক্ষাবর্ষে সকল শ্রেণিতে ভর্তি চলছে",
                        subtitle: "সীমিত আসনে অনলাইনে সরাসরি আবেদন করুন এবং ভবিষ্যৎ সুনিশ্চিত করুন।",
                        badge: "অনলাইন ভর্তি পোর্টাল ২০২৬"
                    }
                ];
            }

            let html = '';
            slidesList.forEach((slide, idx) => {
                const activeClass = idx === 0 ? 'active' : '';
                const title = (slide.title || slide.desc || "জ্ঞানের আলোয় আলোকিত হোক প্রতিটি ভবিষ্যৎ");
                const subtitle = (slide.subtitle || slide.description || "নৈতিক শিক্ষা, আধুনিক প্রযুক্তি এবং সৃষ্টিশীল মেধার সমন্বয়ে গড়ে উঠছে দেশ গড়ার যোগ্য কারিগর।");
                const badge = (slide.badge || "আধুনিক ও ডিজিটাল শিক্ষা প্রতিষ্ঠান");
                const imgUrl = (typeof slide === 'string' ? slide : (slide.url || slide.src || slide.photo || slide.image || ''));

                const bgStyle = imgUrl
                    ? `background-image: url('${imgUrl}'); background-size: cover; background-position: center;`
                    : `background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0369a1 100%);`;

                html += `
                    <div class="hero-slide ${activeClass}" style="${bgStyle}">
                        <div class="container">
                            <div class="hero-content">
                                <span class="hero-badge"><i class="fa-solid fa-sparkles"></i> ${badge}</span>
                                <h1 class="hero-title">${title}</h1>
                                <p class="hero-subtitle">${subtitle}</p>
                                <div class="hero-btns">
                                    <button type="button" class="btn-portal-action" onclick="openAdmissionModal()">
                                        <i class="fa-solid fa-graduation-cap"></i> ভর্তি আবেদন করুন
                                    </button>
                                    <a href="#academics" class="btn-outline-portal" style="color: #ffffff !important; border-color: rgba(255,255,255,0.4);">
                                        <i class="fa-solid fa-book-bookmark"></i> একাডেমিক তথ্য
                                    </a>
                                    <a href="#notices" class="btn-outline-portal" style="color: #ffffff !important; border-color: rgba(255,255,255,0.4);">
                                        <i class="fa-solid fa-bullhorn"></i> নোটিশ বোর্ড
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
            startSlideInterval();
        }

        function nextCmsSlide() {
            const slides = document.querySelectorAll('.hero-slide');
            if (slides.length <= 1) return;
            slides[currentSlideIdx].classList.remove('active');
            currentSlideIdx = (currentSlideIdx + 1) % slides.length;
            slides[currentSlideIdx].classList.add('active');
        }

        function prevCmsSlide() {
            const slides = document.querySelectorAll('.hero-slide');
            if (slides.length <= 1) return;
            slides[currentSlideIdx].classList.remove('active');
            currentSlideIdx = (currentSlideIdx - 1 + slides.length) % slides.length;
            slides[currentSlideIdx].classList.add('active');
        }

        function startSlideInterval() {
            if (slideTimer) clearInterval(slideTimer);
            slideTimer = setInterval(nextCmsSlide, 6000);
        }

        // --- 4. RENDER SPEECHES ---
        function renderSpeeches() {
            // Chairman
            const cName = ERP_SETTINGS.chairmanName || "শাহ মোঃ রোকনুজ্জামান চৌধুরী";
            const cTitle = ERP_SETTINGS.chairmanTitle || "সভাপতি, পরিচালনা পর্ষদ";
            const cMsg = ERP_SETTINGS.chairmanMsg || "প্রিয় শিক্ষার্থীরা, তোমাদের সবাইকে আমার পক্ষ থেকে আন্তরিক শুভেচ্ছা ও ভালোবাসা। তোমরা আমাদের ভবিষ্যৎ। আদর্শ নাগরিক হিসেবে গড়ে ওঠার জন্য নিয়মনিষ্ঠা ও সততা বজায় রেখে পড়াশোনায় আত্মনিয়োগ করবে।";

            const cNameEl = document.getElementById('chairmanNameText');
            if (cNameEl) cNameEl.textContent = cName;
            const cTitleEl = document.getElementById('chairmanTitleText');
            if (cTitleEl) cTitleEl.textContent = cTitle;
            const cMsgEl = document.getElementById('chairmanMsgText');
            if (cMsgEl) cMsgEl.textContent = cMsg;

            const cPhoto = ERP_SETTINGS.chairmanPhoto || '';
            const cPhotoEl = document.getElementById('chairmanPhotoImg');
            const cFallbackEl = document.getElementById('chairmanAvatarFallback');
            if (cPhotoEl) {
                if (cPhoto && cPhoto.trim() !== '') {
                    cPhotoEl.src = cPhoto;
                    cPhotoEl.style.display = 'block';
                    if (cFallbackEl) cFallbackEl.style.display = 'none';
                    cPhotoEl.onerror = function () {
                        this.style.display = 'none';
                        if (cFallbackEl) cFallbackEl.style.display = 'flex';
                    };
                } else {
                    cPhotoEl.style.display = 'none';
                    if (cFallbackEl) cFallbackEl.style.display = 'flex';
                }
            }

            // Headmaster
            const hmName = ERP_SETTINGS.headmasterName || "শাহ মোঃ রোকনুজ্জামান চৌধুরী";
            const hmTitle = ERP_SETTINGS.headmasterTitle || "প্রধান শিক্ষক";
            const hmMsg = ERP_SETTINGS.headmasterMsg || "প্রিয় শিক্ষার্থীরা, আধুনিক বিশ্বের সাথে তাল মিলিয়ে চলতে হলে পুঁথিগত শিক্ষার পাশাপাশি সৃজনশীল মেধার বিকাশ ঘটাতে হবে। শিক্ষক ও অভিভাবকদের সম্মিলিত প্রচেষ্টায় আমরা আদর্শ শিক্ষা নিশ্চিত করতে অঙ্গীকারবদ্ধ।";

            const hmNameEl = document.getElementById('headmasterNameText');
            if (hmNameEl) hmNameEl.textContent = hmName;
            const hmTitleEl = document.getElementById('headmasterTitleText');
            if (hmTitleEl) hmTitleEl.textContent = hmTitle;
            const hmMsgEl = document.getElementById('headmasterMsgText');
            if (hmMsgEl) hmMsgEl.textContent = hmMsg;

            let hmPhoto = ERP_SETTINGS.headmasterPhoto || '';
            if (!hmPhoto && Array.isArray(ERP_STAFF)) {
                const hmStaff = ERP_STAFF.find(s => (s.designation && s.designation.includes('প্রধান শিক্ষক')) || (s.role && s.role.includes('headmaster')));
                if (hmStaff && (hmStaff.photo || hmStaff.image || hmStaff.avatar)) {
                    hmPhoto = hmStaff.photo || hmStaff.image || hmStaff.avatar;
                }
            }

            const hmPhotoEl = document.getElementById('headmasterPhotoImg');
            const hmFallbackEl = document.getElementById('headmasterAvatarFallback');
            if (hmPhotoEl) {
                if (hmPhoto && hmPhoto.trim() !== '') {
                    hmPhotoEl.src = hmPhoto;
                    hmPhotoEl.style.display = 'block';
                    if (hmFallbackEl) hmFallbackEl.style.display = 'none';
                    hmPhotoEl.onerror = function () {
                        this.style.display = 'none';
                        if (hmFallbackEl) hmFallbackEl.style.display = 'flex';
                    };
                } else {
                    hmPhotoEl.style.display = 'none';
                    if (hmFallbackEl) hmFallbackEl.style.display = 'flex';
                }
            }
        }

        function openSpeechModal(type) {
            const isChairman = type === 'chairman';
            const name = isChairman ? (ERP_SETTINGS.chairmanName || "শাহ মোঃ রোকনুজ্জামান চৌধুরী") : (ERP_SETTINGS.headmasterName || "শাহ মোঃ রোকনুজ্জামান চৌধুরী");
            const title = isChairman ? (ERP_SETTINGS.chairmanTitle || "সভাপতি, পরিচালনা পর্ষদ") : (ERP_SETTINGS.headmasterTitle || "প্রধান শিক্ষক");
            const msg = isChairman ? (ERP_SETTINGS.chairmanMsg || (document.getElementById('chairmanMsgText') ? document.getElementById('chairmanMsgText').textContent : '')) : (ERP_SETTINGS.headmasterMsg || (document.getElementById('headmasterMsgText') ? document.getElementById('headmasterMsgText').textContent : ''));
            let photo = isChairman ? ERP_SETTINGS.chairmanPhoto : ERP_SETTINGS.headmasterPhoto;
            if (!photo && !isChairman && Array.isArray(ERP_STAFF)) {
                const hmStaff = ERP_STAFF.find(s => (s.designation && s.designation.includes('প্রধান শিক্ষক')) || (s.role && s.role.includes('headmaster')));
                if (hmStaff && (hmStaff.photo || hmStaff.image || hmStaff.avatar)) {
                    photo = hmStaff.photo || hmStaff.image || hmStaff.avatar;
                }
            }

            document.getElementById('modalSpeechTitle').textContent = isChairman ? "সভাপতির বাণী" : "প্রধান শিক্ষকের বাণী";
            document.getElementById('modalSpeechPersonName').textContent = name;
            document.getElementById('modalSpeechPersonTitle').textContent = title;

            const photoEl = document.getElementById('modalSpeechPhoto');
            if (photo && photo.trim() !== '') {
                photoEl.src = photo;
                photoEl.style.display = 'inline-block';
                photoEl.onerror = function () {
                    this.style.display = 'none';
                };
            } else {
                photoEl.style.display = 'none';
            }
            document.getElementById('modalSpeechContent').innerHTML = `<p>${msg}</p>`;

            const modal = document.getElementById('speechModalOverlay');
            modal.classList.add('active');
        }

        function closeSpeechModal() {
            document.getElementById('speechModalOverlay').classList.remove('active');
        }

        // --- 5. RENDER STATISTICS ---
        function renderStatistics() {
            const students = getStoreData('school_students', []) || [];
            if (students.length > 0) {
                document.getElementById('statTotalStudents').textContent = `${students.length}+`;
            } else {
                document.getElementById('statTotalStudents').textContent = `1,250+`;
            }

            if (ERP_STAFF && ERP_STAFF.length > 0) {
                document.getElementById('statTotalStaff').textContent = `${ERP_STAFF.length}+`;
            } else {
                document.getElementById('statTotalStaff').textContent = `32+`;
            }

            const rooms = getStoreData('school_rooms', []) || [];
            if (rooms.length > 0) {
                document.getElementById('statTotalRooms').textContent = `${rooms.length}+`;
            } else {
                document.getElementById('statTotalRooms').textContent = `24+`;
            }

            document.getElementById('statPassRate').textContent = `99.2%`;
        }

        // --- 6. RENDER CLASSES & CURRICULUM ---
        function renderClassesAndCurriculum() {
            const nav = document.getElementById('classNavPills');
            if (!nav) return;
            const classes = (ERP_CLASSES && ERP_CLASSES.length > 0) ? ERP_CLASSES : ["Six", "Seven", "Eight", "Nine", "Ten"];

            let html = '';
            classes.forEach((cls, idx) => {
                const active = idx === 0 ? 'active' : '';
                html += `<button type="button" class="class-pill-btn ${active}" onclick="selectClassView('${cls}', this)"><i class="fa-solid fa-graduation-cap"></i> Class ${cls}</button>`;
            });
            nav.innerHTML = html;

            if (classes.length > 0) {
                showClassDetails(classes[0]);
            }
        }

        function selectClassView(className, btnEl) {
            document.querySelectorAll('#classNavPills .class-pill-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            showClassDetails(className);
        }

        function showClassDetails(className) {
            document.getElementById('activeClassName').textContent = `Class ${className}`;

            // Filter sections
            const classSecs = (ERP_SECTIONS || []).filter(s => s.class === className);
            const secNames = classSecs.map(s => s.section || s.name || s).join(', ') || 'A (গোলাপ), B (শাপলা)';
            document.getElementById('activeClassMeta').textContent = `শাখা: ${secNames} | শিফট: সকাল ও দিবা`;
            document.getElementById('activeClassSectionCount').innerHTML = `<i class="fa-solid fa-users-rectangle"></i> ${classSecs.length || 2}টি শাখা`;

            // Filter subjects
            let subList = [];
            if (ERP_SUBJECTS) {
                if (Array.isArray(ERP_SUBJECTS)) {
                    subList = ERP_SUBJECTS;
                } else if (ERP_SUBJECTS[className]) {
                    subList = ERP_SUBJECTS[className];
                }
            }

            if (!subList || subList.length === 0) {
                subList = [
                    { name: 'Bangla 1st Paper', nameBn: 'বাংলা ১ম পত্র', code: '101' },
                    { name: 'Bangla 2nd Paper', nameBn: 'বাংলা ২য় পত্র', code: '102' },
                    { name: 'English 1st Paper', nameBn: 'ইংরেজি ১ম পত্র', code: '107' },
                    { name: 'English 2nd Paper', nameBn: 'ইংরেজি ২য় পত্র', code: '108' },
                    { name: 'Mathematics', nameBn: 'সাধারণ গণিত', code: '109' },
                    { name: 'Science', nameBn: 'বিজ্ঞান', code: '127' },
                    { name: 'ICT', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', code: '154' },
                    { name: 'BGS', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', code: '150' },
                    { name: 'Religion', nameBn: 'ধর্ম ও নৈতিক শিক্ষা', code: '111' }
                ];
            }

            document.getElementById('activeClassSubjectCount').innerHTML = `<i class="fa-solid fa-book"></i> ${subList.length}টি বিষয়`;

            const subContainer = document.getElementById('activeClassSubjectsList');
            let subHtml = '';
            subList.forEach(sub => {
                const sName = (typeof sub === 'string' ? sub : (sub.nameBn || sub.name || 'বিষয়'));
                const sCode = (typeof sub === 'object' && sub.code) ? ` <small style="opacity:0.75;">(${sub.code})</small>` : '';
                subHtml += `<span class="subject-badge"><i class="fa-solid fa-book-bookmark" style="color: var(--primary);"></i> ${sName}${sCode}</span>`;
            });
            subContainer.innerHTML = subHtml;
        }

        // --- 7. RENDER TEACHERS & STAFF DIRECTORY ---
        function renderStaffDirectory(staffList) {
            const container = document.getElementById('staffContainerGrid');
            if (!container) return;

            let list = staffList;
            if (!list || list.length === 0) {
                list = [
                    { staffId: 'R1027928', name: 'SHAH MD ROKONUZZAMAN CHOWDHURY', nameBn: 'শাহ মোঃ রোকনুজ্জামান চৌধুরী', designation: 'প্রধান শিক্ষক', subject: 'গণিত ও বিজ্ঞান', mobile: '01712345678', qualification: 'এম.এসসি (১ম শ্রেণি), বি.এড' },
                    { staffId: 'R552186', name: 'MD MAHTAB UDDIN', nameBn: 'মোঃ মাহতাব উদ্দিন', designation: 'সহকারী প্রধান শিক্ষক', subject: 'ইংরেজি', mobile: '01812345679', qualification: 'এম.এ (ইংরেজি), বি.এড' },
                    { staffId: 'N56878529', name: 'PALASH CHANDRO ROY', nameBn: 'পলাশ চন্দ্র রায়', designation: 'কম্পিউটার অপারেটর', subject: 'আইসিটি ও অফিস ম্যানেজমেন্ট', mobile: '01794918384', qualification: 'ডিপ্লোমা ইন কম্পিউটার সায়েন্স' },
                    { staffId: 'T882910', name: 'ABDUL JALIL', nameBn: 'মোঃ আব্দুল জলিল', designation: 'সিনিয়র শিক্ষক', subject: 'বাংলা ভাষা ও সাহিত্য', mobile: '01711223344', qualification: 'এম.এ (বাংলা)' }
                ];
            }

            let html = '';
            list.forEach(staff => {
                const name = staff.nameBn || staff.name || 'শিক্ষক / স্টাফ';
                const desig = staff.designation || 'শিক্ষক';
                const subject = staff.subject || staff.teachingSubject || 'সাধারণ বিষয়';
                const mobile = staff.mobile || staff.phone || '০১৭XXXXXXXX';
                const qual = staff.qualification || staff.degree || 'স্নাতক / স্নাতকোত্তর';
                const photo = staff.photo || '';

                const avatarHtml = photo
                    ? `<img class="staff-avatar" src="${photo}" alt="${name}" onerror="this.outerHTML='<div class=\\'staff-avatar\\' style=\\'display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0052ff,#0284c7);color:#ffffff;font-size:2rem;\\'><i class=\\'fa-solid fa-user-tie\\'></i></div>'">`
                    : `<div class="staff-avatar" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0052ff,#0284c7);color:#ffffff;font-size:2rem;"><i class="fa-solid fa-user-tie"></i></div>`;

                html += `
                    <div class="staff-card">
                        <div class="staff-avatar-wrap">
                            ${avatarHtml}
                        </div>
                        <div class="staff-body">
                            <h3>${name}</h3>
                            <div class="staff-desig">${desig}</div>
                            <ul class="staff-meta-list">
                                <li><i class="fa-solid fa-book"></i> <strong>বিষয়:</strong> ${subject}</li>
                                <li><i class="fa-solid fa-graduation-cap"></i> <strong>যোগ্যতা:</strong> ${qual}</li>
                                <li><i class="fa-solid fa-phone"></i> <strong>মোবাইল:</strong> ${mobile}</li>
                            </ul>
                            <button type="button" class="btn-outline-portal" style="width: 100%; justify-content: center; font-size: 0.82rem;" onclick="viewTeacherProfile('${staff.staffId || ''}', '${encodeURIComponent(name)}')">
                                <i class="fa-solid fa-id-badge"></i> বিস্তারিত প্রোফাইল
                            </button>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function filterStaffCategory(cat) {
            if (cat === 'all') {
                renderStaffDirectory(ERP_STAFF);
            } else if (cat === 'teacher') {
                const filtered = ERP_STAFF.filter(s => (s.designation || '').includes('সহকারী') || (s.designation || '').includes('শিক্ষক'));
                renderStaffDirectory(filtered.length ? filtered : ERP_STAFF);
            } else if (cat === 'senior') {
                const filtered = ERP_STAFF.filter(s => (s.designation || '').includes('প্রধান') || (s.designation || '').includes('সিনিয়র'));
                renderStaffDirectory(filtered.length ? filtered : ERP_STAFF);
            } else if (cat === 'staff') {
                const filtered = ERP_STAFF.filter(s => (s.designation || '').includes('অফিস') || (s.designation || '').includes('সহকারী') || (s.designation || '').includes('কম্পিউটার') || (s.category || '') === 'Staff');
                renderStaffDirectory(filtered.length ? filtered : ERP_STAFF);
            }
        }

        function handleStaffSearch(query) {
            const q = query.trim().toLowerCase();
            if (!q) {
                renderStaffDirectory(ERP_STAFF);
                return;
            }
            const filtered = ERP_STAFF.filter(s => {
                const n = (s.name || '').toLowerCase();
                const nBn = (s.nameBn || '').toLowerCase();
                const d = (s.designation || '').toLowerCase();
                const sub = (s.subject || '').toLowerCase();
                return n.includes(q) || nBn.includes(q) || d.includes(q) || sub.includes(q);
            });
            renderStaffDirectory(filtered);
        }

        function viewTeacherProfile(staffId, encodedName) {
            const name = decodeURIComponent(encodedName);
            const staff = ERP_STAFF.find(s => s.staffId === staffId || s.name === name || s.nameBn === name) || {};

            document.getElementById('modalSpeechTitle').textContent = "শিক্ষক / স্টাফ প্রোফাইল বিবরণ";
            document.getElementById('modalSpeechPersonName').textContent = staff.nameBn || staff.name || name;
            document.getElementById('modalSpeechPersonTitle').textContent = staff.designation || "সহকারী শিক্ষক";

            const photoEl = document.getElementById('modalSpeechPhoto');
            if (staff.photo) {
                photoEl.src = staff.photo;
                photoEl.style.display = 'inline-block';
            } else {
                photoEl.style.display = 'none';
            }

            const detailsHtml = `
                <div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem;">
                    <div><strong>স্টাফ আইডি:</strong> ${staff.staffId || 'N/A'}</div>
                    <div><strong>বিষয়:</strong> ${staff.subject || 'সাধারণ'}</div>
                    <div><strong>শিক্ষাগত যোগ্যতা:</strong> ${staff.qualification || 'স্নাতকোত্তর'}</div>
                    <div><strong>মোবাইল নম্বর:</strong> ${staff.mobile || 'N/A'}</div>
                    <div><strong>পদবি:</strong> ${staff.designation || 'সহকারী শিক্ষক'}</div>
                    <div><strong>রক্তের গ্রুপ:</strong> ${staff.bloodGroup || staff.blood || 'N/A'}</div>
                    <div style="grid-column: 1/-1;"><strong>যোগদানের তারিখ:</strong> ${staff.joining || staff.joiningDate || '০১/০১/২০২০'}</div>
                </div>
            `;
            document.getElementById('modalSpeechContent').innerHTML = detailsHtml;
            document.getElementById('speechModalOverlay').classList.add('active');
        }

        // --- OPEN TEACHERS PAGE ON CLICK ---
        function openTeachersSection(e) {
            if (e && e.preventDefault) e.preventDefault();
            window.location.href = 'teachers.html';
        }

        let currentRenderedNotices = [];

        // --- 8. RENDER NOTICES ---
        function renderNotices() {
            const container = document.getElementById('noticeListWrapper');
            if (!container) return;

            let notices = [];
            // 1. Check ERP_NOTICES and merge with any ticker notices that have PDF/file attachments
            if (ERP_NOTICES && ERP_NOTICES.length > 0) {
                notices = [...ERP_NOTICES];
                if (ERP_TICKER && ERP_TICKER.length > 0) {
                    ERP_TICKER.forEach(t => {
                        if (t && (t.pdf || t.fileName || t.file)) {
                            const title = t.title || t.fileName || t.text;
                            const exists = notices.some(n => (n.title === title || (n.fileName && n.fileName === t.fileName)));
                            if (!exists) {
                                notices.unshift({
                                    id: notices.length + 1,
                                    title: title || 'বিদ্যালয়ের জরুরি বিজ্ঞপ্তি',
                                    date: t.date || '২০২৬',
                                    category: 'জরুরি বিজ্ঞপ্তি',
                                    pdf: t.pdf || '',
                                    fileName: t.fileName || t.file || '',
                                    fileSize: t.fileSize || ''
                                });
                            }
                        }
                    });
                }
            } else if (ERP_TICKER && ERP_TICKER.length > 0) {
                notices = ERP_TICKER.map((t, idx) => ({
                    id: idx + 1,
                    title: t.title || t.fileName || t.text || 'বিদ্যালয়ের জরুরি বিজ্ঞপ্তি',
                    date: t.date || '২০২৬',
                    category: 'সাধারণ বিজ্ঞপ্তি',
                    file: t.fileName || t.file || '',
                    pdf: t.pdf || '',
                    fileName: t.fileName || t.file || '',
                    fileSize: t.fileSize || ''
                }));
            }

            if (!notices || notices.length === 0) {
                notices = [
                    { id: 1, title: "২০২৬ শিক্ষাবর্ষে সকল শ্রেণিতে ভর্তি কার্যক্রম ও অনলাইন আবেদন সংক্রান্ত বিজ্ঞপ্তি", date: "১৫ জানুয়ারি ২০২৬", category: "ভর্তি", fileName: "ভর্তি_বিজ্ঞপ্তি_২০২৬.pdf" },
                    { id: 2, title: "আসন্ন বার্ষিক পরীক্ষার চূড়ান্ত সময়সূচি, রুটিন ও আসন বিন্যাস প্রকাশ", date: "১০ জানুয়ারি ২০২৬", category: "পরীক্ষা", fileName: "পরীক্ষার_রুটিন_২০২৬.pdf" },
                    { id: 3, title: "পবিত্র ঈদুল ফিতর ও গ্রীষ্মকালীন অবকাশ উপলক্ষে বিদ্যালয় বন্ধের নোটিশ", date: "০২ জানুয়ারি ২০২৬", category: "ছুটি" },
                    { id: 4, title: "অর্ধ-বার্ষিক পরীক্ষার ফলাফল ও মেধা তালিকা প্রকাশ সংক্রান্ত বিজ্ঞপ্তি", date: "২৫ ডিসেম্বর ২০২৫", category: "ফলাফল" }
                ];
            }

            currentRenderedNotices = notices;

            let html = '';
            notices.forEach((n, idx) => {
                const title = n.title || n.text || n.fileName || "বিদ্যালয়ের প্রয়োজনীয় বিজ্ঞপ্তি";
                const dateStr = n.date || "২০২৬";
                const parts = dateStr.split(/[\/\-\s]/);
                const day = parts[0] || "১৫";
                const month = parts[1] ? (isNaN(parts[1]) ? parts[1] : 'মাস ' + parts[1]) : "বিজ্ঞপ্তি";

                // Check if this notice has an attached PDF file
                const hasPdf = Boolean(n.pdf || n.file || n.pdfUrl || n.attachment || (n.fileName && n.fileName.toLowerCase().endsWith('.pdf')));
                const fileName = n.fileName || n.title || 'নোটিশ-ডকুমেন্ট.pdf';

                html += `
                    <div class="notice-item">
                        <div class="notice-date-box">
                            <span class="day">${day}</span>
                            <span class="month">${month}</span>
                        </div>
                        <div class="notice-content">
                            <h4>
                                ${title}
                                ${hasPdf ? `<span class="notice-pdf-tag" title="PDF ডকুমেন্ট সংযুক্ত"><i class="fa-solid fa-file-pdf"></i> PDF</span>` : ''}
                            </h4>
                            <p><i class="fa-regular fa-clock"></i> প্রকাশের তারিখ: ${dateStr}</p>
                        </div>
                        <div class="notice-actions">
                            ${hasPdf ? `
                                <button type="button" class="btn-notice-pdf" title="সংযুক্ত PDF ফাইল ডাউনলোড করুন (${fileName})" onclick="downloadNoticePdf('${idx}', event)">
                                    <i class="fa-solid fa-file-pdf"></i>
                                </button>
                            ` : ''}
                            <button type="button" class="btn-notice-view" title="নোটিশ বিস্তারিত দেখুন" onclick="viewNoticeDetails('${idx}')">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        // --- PDF DOWNLOAD / OPEN HANDLER ---
        function downloadNoticePdf(idx, event) {
            if (event && event.stopPropagation) event.stopPropagation();
            const notice = currentRenderedNotices[idx];
            if (!notice) return;

            const pdfData = notice.pdf || notice.file || notice.pdfUrl || notice.attachment;
            let fileName = notice.fileName || notice.title || 'নোটিশ-ডকুমেন্ট.pdf';
            if (!fileName.toLowerCase().endsWith('.pdf')) fileName += '.pdf';

            if (!pdfData) {
                // If it's a mock notice or metadata without raw base64, create printable view
                const win = window.open('', '_blank');
                if (win) {
                    win.document.write(`
                        <!DOCTYPE html>
                        <html lang="bn">
                        <head>
                            <meta charset="UTF-8">
                            <title>${notice.title || fileName}</title>
                            <link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
                            <style>
                                body { font-family: 'Tiro Bangla', 'Hind Siliguri', serif; padding: 40px; color: #0f172a; line-height: 1.8; max-width: 800px; margin: 0 auto; }
                                .header { text-align: center; border-bottom: 2px solid #0052ff; padding-bottom: 20px; margin-bottom: 30px; }
                                h1 { font-family: 'Tiro Bangla', serif; color: #0052ff; font-size: 1.6rem; margin: 0 0 6px; }
                                .badge { display: inline-block; background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; margin-bottom: 12px; }
                                .btn-print { background: #0052ff; color: #fff; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; }
                                @media print { .no-print { display: none; } }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়</h1>
                                <p style="margin:0; color:#64748b;">অফিসিয়াল বিজ্ঞপ্তি পত্র</p>
                            </div>
                            <span class="badge">প্রকাশের তারিখ: ${notice.date || '২০২৬'}</span>
                            <h2 style="font-size: 1.3rem; margin-top: 10px;">${notice.title || fileName}</h2>
                            <p style="margin-top: 15px;">${notice.description || notice.text || 'এতদ্বারা অত্র বিদ্যালয়ের সকল শিক্ষার্থী, অভিভাবক ও সংশ্লিষ্ট শিক্ষক-কর্মচারীদের অবগতির জন্য জানানো যাচ্ছে যে, উক্ত নোটিশ মোতাবেক প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।'}</p>
                            <div style="margin-top: 50px; text-align: right;">
                                <strong>স্বাক্ষর/-</strong><br>
                                প্রধান শিক্ষক<br>
                                আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়
                            </div>
                            <div class="no-print" style="margin-top: 40px; text-align: center;">
                                <button class="btn-print" onclick="window.print()">🖨️ প্রিন্ট / সেভ PDF</button>
                            </div>
                        </body>
                        </html>
                    `);
                    win.document.close();
                }
                return;
            }

            try {
                if (pdfData.startsWith('data:application/pdf') || pdfData.startsWith('data:')) {
                    const base64Parts = pdfData.split(',');
                    const mimeMatch = base64Parts[0].match(/:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
                    const byteString = atob(base64Parts[1] || '');
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], { type: mimeType });
                    const blobUrl = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = fileName;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);
                } else {
                    const a = document.createElement('a');
                    a.href = pdfData;
                    a.download = fileName;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            } catch (e) {
                console.error("PDF download error, fallback to open:", e);
                window.open(pdfData, '_blank');
            }
        }

        function viewNoticeDetails(idx) {
            const notice = currentRenderedNotices[idx] || {};
            const title = notice.title || notice.text || notice.fileName || "বিদ্যালয়ের প্রয়োজনীয় বিজ্ঞপ্তি";
            const dateStr = notice.date || "২০২৬";
            const hasPdf = Boolean(notice.pdf || notice.file || notice.pdfUrl || notice.attachment || (notice.fileName && notice.fileName.toLowerCase().endsWith('.pdf')));
            const fileName = notice.fileName || notice.title || 'নোটিশ-ডকুমেন্ট.pdf';

            document.getElementById('modalNoticeTitle').textContent = "নোটিশ বিস্তারিত";
            document.getElementById('modalNoticeDate').textContent = "প্রকাশের তারিখ: " + dateStr;

            let pdfDownloadBlock = '';
            if (hasPdf) {
                pdfDownloadBlock = `
                    <div style="margin-top: 18px; padding: 14px 18px; background: #fef2f2; border: 1.5px dashed #fca5a5; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: #dc2626; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 4px 10px rgba(220,38,38,0.25);">
                                <i class="fa-solid fa-file-pdf"></i>
                            </div>
                            <div>
                                <strong style="color: #991b1b; display: block; font-size: 0.95rem;">সংযুক্ত অফিশিয়াল PDF ফাইল</strong>
                                <span style="font-size: 0.82rem; color: #64748b;">${fileName}</span>
                            </div>
                        </div>
                        <button type="button" class="btn-portal-action" onclick="downloadNoticePdf('${idx}', event)" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; color: #ffffff; box-shadow: 0 4px 12px rgba(220,38,38,0.3);">
                            <i class="fa-solid fa-download"></i> PDF ডাউনলোড করুন
                        </button>
                    </div>
                `;
            }

            document.getElementById('modalNoticeContent').innerHTML = `
                <div style="padding: 18px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px;">
                    <div style="display:inline-block;background:#eff6ff;color:#1e40af;padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:700;margin-bottom:12px;">
                        <i class="fa-solid fa-bullhorn"></i> অফিসিয়াল সার্কুলার
                    </div>
                    <h3 style="color: var(--primary); margin-bottom: 12px; font-size: 1.25rem;">${title}</h3>
                    <p style="line-height: 1.8; color: #334155;">${notice.description || notice.text || 'এতদ্বারা অত্র বিদ্যালয়ের সকল শিক্ষার্থী, অভিভাবক ও সংশ্লিষ্ট শিক্ষক-কর্মচারীদের অবগতির জন্য জানানো যাচ্ছে যে, উক্ত নোটিশ মোতাবেক প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো। বিস্তারিত তথ্য জানতে বিদ্যালয়ের অফিস শাখায় যোগাযোগ করুন।'}</p>
                    
                    ${pdfDownloadBlock}

                    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end;">
                        <span style="font-size: 0.85rem; color: #64748b;">স্মারক নং: অমঅবিউবি/২০২৬/নোটিশ-${parseInt(idx) + 1}</span>
                        <div style="text-align: right; font-weight: 700; color: #0f172a; font-size: 0.92rem;">
                            স্বাক্ষর/-<br>
                            <span style="color: #0052ff;">প্রধান শিক্ষক</span><br>
                            আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('noticeModalOverlay').classList.add('active');
        }

        function closeNoticeModal() {
            document.getElementById('noticeModalOverlay').classList.remove('active');
        }

        // --- 8.1 RENDER DYNAMIC QUICK SERVICES & LINKS (প্রতিনিয়ত আপডেট) ---
        function renderQuickLinks() {
            const container = document.getElementById('quickLinksWrapper');
            if (!container) return;

            // Default vital services and government official portals
            const defaultLinks = [
                {
                    id: 'result_portal',
                    title: 'অনলাইন রেজাল্ট ও মার্কশিট পোর্টাল',
                    subtitle: 'গ্রেডশিট, টেবুলেশন ও ফলাফল অনুসন্ধান',
                    url: 'result-portal.html',
                    icon: 'fa-solid fa-square-poll-vertical',
                    badge: 'লাইভ',
                    isExternal: false
                },
                {
                    id: 'seat_plan',
                    title: 'পরীক্ষার রুটিন ও আসন বিন্যাস',
                    subtitle: 'রুম সিটপ্ল্যান ও টপশিট ডাউনলোড',
                    url: 'seat-plan.html',
                    icon: 'fa-solid fa-id-card-clip',
                    badge: 'আপডেট',
                    isExternal: false
                },
                {
                    id: 'student_portal',
                    title: 'ডিজিটাল স্টুডেন্ট ডাটাবেজ',
                    subtitle: 'শিক্ষার্থী প্রোফাইল ও আইডি কার্ড সেবা',
                    url: 'student-portal.html',
                    icon: 'fa-solid fa-user-graduate',
                    badge: 'ERP',
                    isExternal: false
                },
                {
                    id: 'teachers_directory',
                    title: 'শিক্ষক ও স্টাফ ডিরেক্টরি',
                    subtitle: 'শিক্ষকমণ্ডলীর তথ্য ও যোগাযোগ প্রোফাইল',
                    url: 'teachers.html',
                    icon: 'fa-solid fa-chalkboard-user',
                    badge: 'নতুন পেজ',
                    isExternal: false
                },
                {
                    id: 'admission_apply',
                    title: 'অনলাইন ভর্তি আবেদন ফরম',
                    subtitle: 'নতুন শিক্ষাবর্ষে ঘরে বসেই আবেদন করুন',
                    url: 'javascript:openAdmissionModal()',
                    icon: 'fa-solid fa-file-signature',
                    badge: 'ভর্তি সেশন',
                    isExternal: false
                },
                {
                    id: 'notice_archive',
                    title: 'অফিসিয়াল নোটিশ ও সার্কুলার আর্কাইভ',
                    subtitle: 'জরুরি বিজ্ঞপ্তি ও পিডিএফ ডাউনলোড',
                    url: 'notice-board.html',
                    icon: 'fa-solid fa-bullhorn',
                    badge: '',
                    isExternal: false
                },
                {
                    id: 'dinajpur_board',
                    title: 'দিনাজপুর শিক্ষা বোর্ড',
                    subtitle: 'মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড',
                    url: 'http://www.dinajpureducationboard.gov.bd',
                    icon: 'fa-solid fa-award',
                    badge: 'বোর্ড',
                    isExternal: true
                },
                {
                    id: 'moedu_portal',
                    title: 'শিক্ষা মন্ত্রণালয় (MoEdu)',
                    subtitle: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার',
                    url: 'http://moedu.gov.bd',
                    icon: 'fa-solid fa-building-columns',
                    badge: 'সরকারি',
                    isExternal: true
                },
                {
                    id: 'dshe_portal',
                    title: 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (DSHE)',
                    subtitle: 'সরকারি পরিপত্র, প্রজ্ঞাপন ও নির্দেশনা',
                    url: 'http://www.dshe.gov.bd',
                    icon: 'fa-solid fa-landmark',
                    badge: 'সরকারি',
                    isExternal: true
                },
                {
                    id: 'nctb_portal',
                    title: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)',
                    subtitle: 'পাঠ্যপুস্তক ও কারিকুলাম নির্দেশিকা',
                    url: 'http://www.nctb.gov.bd',
                    icon: 'fa-solid fa-book-bookmark',
                    badge: 'কারিকুলাম',
                    isExternal: true
                }
            ];

            let links = [];
            if (ERP_QUICK_LINKS && Array.isArray(ERP_QUICK_LINKS) && ERP_QUICK_LINKS.length > 0) {
                // If custom links are configured in database/ERP, map and render them
                const colorMap = {
                    sky: '#0284c7',
                    blue: '#0052ff',
                    amber: '#d97706',
                    yellow: '#eab308',
                    emerald: '#059669',
                    green: '#10b981',
                    rose: '#e11d48',
                    red: '#dc2626',
                    purple: '#7c3aed',
                    indigo: '#4f46e5'
                };

                links = ERP_QUICK_LINKS.map(item => {
                    const url = item.url || item.link || '#';
                    const isExt = item.isExternal || url.startsWith('http://') || url.startsWith('https://');
                    let icon = item.icon || (isExt ? 'fa-solid fa-arrow-up-right-from-square' : 'fa-solid fa-link');
                    if (icon && !icon.includes(' ')) {
                        icon = `fa-solid ${icon}`;
                    }
                    const itemColor = colorMap[item.color] || 'var(--primary)';
                    return {
                        id: item.id || ('link_' + Math.random().toString(36).substr(2, 9)),
                        title: item.title || item.name || 'সেবা লিংক',
                        subtitle: item.subtitle || item.desc || '',
                        url: url,
                        icon: icon,
                        iconColor: itemColor,
                        badge: item.badge || (isExt ? 'ই-সেবা' : ''),
                        isExternal: isExt
                    };
                });
            } else {
                links = defaultLinks.map(l => ({ ...l, iconColor: 'var(--primary)' }));
            }

            let html = '';
            links.forEach(link => {
                const isJs = (link.url || '').startsWith('javascript:');
                const targetAttr = (link.isExternal && !isJs) ? 'target="_blank" rel="noopener noreferrer"' : '';
                const rightIcon = link.isExternal
                    ? '<i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem; opacity: 0.75; flex-shrink: 0; margin-left: 8px;"></i>'
                    : '<i class="fa-solid fa-chevron-right" style="font-size: 0.8rem; flex-shrink: 0; margin-left: 8px;"></i>';

                const badgeHtml = link.badge
                    ? `<span class="link-tag-badge" style="font-size: 0.7rem; font-weight: 700; background: rgba(0, 82, 255, 0.1); color: ${link.iconColor || 'var(--primary)'}; padding: 2px 7px; border-radius: 10px; margin-left: 6px; transition: var(--transition); white-space: nowrap;">${link.badge}</span>`
                    : '';

                html += `
                    <li>
                        <a href="${link.url}" class="quick-link-item" ${targetAttr}>
                            <span style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
                                <i class="${link.icon}" style="color: ${link.iconColor || 'var(--primary)'}; font-size: 1.05rem; width: 20px; text-align: center; flex-shrink: 0; transition: var(--transition);"></i>
                                <span style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                                    <span style="display: flex; align-items: center; gap: 4px; font-weight: 700; line-height: 1.35; flex-wrap: wrap;">
                                        <span>${link.title}</span>
                                        ${badgeHtml}
                                    </span>
                                    ${link.subtitle ? `<span class="link-sub-text" style="font-size: 0.76rem; color: var(--text-muted); font-weight: 500; line-height: 1.25; margin-top: 2px; transition: var(--transition);">${link.subtitle}</span>` : ''}
                                </span>
                            </span>
                            ${rightIcon}
                        </a>
                    </li>
                `;
            });

            container.innerHTML = html;
        }

        // --- 9. RENDER FEE STRUCTURE ---
        function renderFeeStructure() {
            const tbody = document.getElementById('feeTableTbody');
            if (!tbody) return;

            const classes = (ERP_CLASSES && ERP_CLASSES.length > 0) ? ERP_CLASSES : ["Six", "Seven", "Eight", "Nine", "Ten"];
            let html = '';

            classes.forEach((cls, idx) => {
                const feeData = (ERP_FEES && ERP_FEES[cls]) ? ERP_FEES[cls] : {};
                const tuition = feeData.tuition || feeData.monthly || (300 + idx * 50);
                const session = feeData.session || (1200 + idx * 100);
                const exam = feeData.exam || (300 + idx * 50);

                html += `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 12px 20px; font-weight: 700;">০${idx + 1}</td>
                        <td style="padding: 12px 20px; font-weight: 800; color: var(--primary);">Class ${cls}</td>
                        <td style="padding: 12px 20px; font-weight: 700;">৳ ${tuition} /-</td>
                        <td style="padding: 12px 20px;">৳ ${session} /-</td>
                        <td style="padding: 12px 20px;">৳ ${exam} /-</td>
                        <td style="padding: 12px 20px; text-align: center;">
                            <button type="button" class="btn-portal-action" style="padding: 4px 12px; font-size: 0.8rem;" onclick="openAdmissionModal()">
                                ভর্তি তথ্য ও আবেদন
                            </button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        // --- 10. RENDER GALLERY ---
        function renderGallery() {
            const container = document.getElementById('galleryContainerGrid');
            if (!container) return;

            const items = [
                { title: "বার্ষিক ক্রীড়া প্রতিযোগিতা ও পুরস্কার বিতরণী", icon: "fa-trophy", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)" },
                { title: "মহান স্বাধীনতা ও জাতীয় দিবস উদযাপন", icon: "fa-flag", gradient: "linear-gradient(135deg, #065f46, #10b981)" },
                { title: "ডিজিটাল কম্পিউটার ল্যাব ও বিজ্ঞান মেলা", icon: "fa-laptop-code", gradient: "linear-gradient(135deg, #4c1d95, #8b5cf6)" },
                { title: "বিদ্যালয়ের কেন্দ্রীয় শহীদ মিনার ও শ্রদ্ধাঞ্জলি", icon: "fa-monument", gradient: "linear-gradient(135deg, #831843, #ec4899)" }
            ];

            let html = '';
            items.forEach(item => {
                html += `
                    <div class="gallery-item" onclick="openLightboxIcon('${item.icon}', '${item.title}', '${item.gradient}')" style="background: ${item.gradient}; height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; border-radius: 16px; position: relative; overflow: hidden; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.1); transition: all 0.3s ease;">
                        <i class="fa-solid ${item.icon}" style="font-size: 3.5rem; opacity: 0.9; margin-bottom: 12px;"></i>
                        <h4 style="color: #ffffff; font-size: 1rem; text-align: center; padding: 0 15px; font-weight: 700;">${item.title}</h4>
                        <div class="gallery-overlay" style="background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
                            <span style="color: #ffffff; font-weight: 700; font-size: 0.9rem;"><i class="fa-solid fa-expand" style="margin-right: 6px;"></i> প্রিভিউ দেখুন</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function openLightboxIcon(icon, title, gradient) {
            document.getElementById('modalSpeechTitle').textContent = "ইভেন্ট গ্যালারি বিবরণ";
            document.getElementById('modalSpeechPhoto').style.display = 'none';
            document.getElementById('modalSpeechPersonName').textContent = title;
            document.getElementById('modalSpeechPersonTitle').textContent = "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
            document.getElementById('modalSpeechContent').innerHTML = `
                <div style="background: ${gradient}; border-radius: 12px; padding: 50px 20px; text-align: center; color: #ffffff; margin-bottom: 15px;">
                    <i class="fa-solid ${icon}" style="font-size: 5rem; margin-bottom: 15px;"></i>
                    <h3 style="color: #ffffff; font-size: 1.4rem;">${title}</h3>
                </div>
                <p style="text-align: center; color: #64748b; font-size: 0.95rem;">বিদ্যালয়ের বার্ষিক সহশিক্ষা কার্যক্রম, সাংস্কৃতিক উৎসব এবং শিক্ষার্থীদের ক্রীড়া ও মেধা বিকাশের দৃশ্যমালা।</p>
            `;
            document.getElementById('speechModalOverlay').classList.add('active');
        }

        // --- 11. APPLY CMS SECTION VISIBILITY SETTINGS ---
        function applySectionVisibilities() {
            // Default hide about section and its navigation links
            hideSection('about');
            const navAbout = document.getElementById('navItemAbout');
            if (navAbout) navAbout.style.display = 'none';
            const footAbout = document.getElementById('footerItemAbout');
            if (footAbout) footAbout.style.display = 'none';

            // Default hide fees section and its navigation links
            hideSection('fees');
            const navFee = document.getElementById('navItemFees');
            if (navFee) navFee.style.display = 'none';
            const admFee = document.getElementById('admissionFeeBtn');
            if (admFee) admFee.style.display = 'none';
            const footFee = document.getElementById('footerItemFees');
            if (footFee) footFee.style.display = 'none';

            // Default hide teachers section on home page load (opens on menu click)
            if (window.location.hash !== '#teachers') {
                hideSection('teachers');
            }

            if (!CMS_CONFIG || !CMS_CONFIG.sections) return;
            const s = CMS_CONFIG.sections;

            if (s.ticker === false) hideSection('section-ticker');
            if (s.hero === false) hideSection('hero');
            if (s.stats === false) hideSection('section-stats');
            if (s.about === true) {
                const el = document.getElementById('about');
                if (el) el.style.display = '';
                if (navAbout) navAbout.style.display = '';
                if (footAbout) footAbout.style.display = '';
            } else {
                hideSection('about');
            }
            if (s.speeches === false) hideSection('speeches');
            if (s.academics === false) hideSection('academics');
            if (s.teachers === false || window.location.hash !== '#teachers') {
                hideSection('teachers');
            }
            if (s.notices === false) hideSection('notices');
            
            // --- ONLINE ADMISSION VISIBILITY (বাটন ও সেকশন দৃশ্যমানতা নিয়ন্ত্রণ) ---
            const isAdmissionEnabled = (s.admission !== false);
            
            // 1. Header CTA button
            const headerAdmBtn = document.getElementById('cmsHeaderAdmissionBtn') || document.querySelector('.nav-cta-btns .btn-portal-action');
            if (headerAdmBtn) {
                headerAdmBtn.style.display = isAdmissionEnabled ? 'inline-flex' : 'none';
            }
            
            // 2. Mobile Drawer CTA button
            const mobileAdmBtn = document.getElementById('cmsMobileAdmissionBtn') || document.querySelector('#mobileDrawer .btn-portal-action');
            if (mobileAdmBtn) {
                mobileAdmBtn.style.display = isAdmissionEnabled ? 'inline-flex' : 'none';
            }
            
            // 3. Hero & Banner admission buttons
            document.querySelectorAll('.cms-admission-btn, .hero-slide-btn-adm, button[onclick*="openAdmissionModal"]').forEach(btn => {
                if (btn !== headerAdmBtn && btn !== mobileAdmBtn) {
                    btn.style.display = isAdmissionEnabled ? '' : 'none';
                }
            });
            
            // 4. Section #admission
            if (!isAdmissionEnabled) {
                hideSection('admission');
            } else {
                const admSec = document.getElementById('admission');
                if (admSec) admSec.style.display = '';
            }
            if (s.fees === true) {
                const el = document.getElementById('fees');
                if (el) el.style.display = '';
                if (navFee) navFee.style.display = '';
                if (admFee) admFee.style.display = '';
                if (footFee) footFee.style.display = '';
            } else {
                hideSection('fees');
            }
            if (s.facilities === false) hideSection('facilities');
            if (s.gallery === false) hideSection('gallery');
            if (s.contact === false) hideSection('contact');
        }

        function hideSection(id) {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        }

        // --- ADMISSION FORM & OFFICIAL VOUCHER HANDLERS ---
        let admissionPhotoDataUrl = '';

        function formatClassDisplayName(cls) {
            if (!cls) return '';
            const c = String(cls).trim();
            const cLower = c.toLowerCase();
            if (cLower === 'play' || c === 'প্লে') return 'প্লে (Play)';
            if (cLower === 'nursery' || c === 'নার্সারি') return 'নার্সারি (Nursery)';
            if (cLower === 'kg' || c === 'কেজি') return 'কেজি (KG)';
            if (cLower === 'one' || c === '১' || c === '1' || cLower === 'class 1' || c === '১ম শ্রেণি' || cLower === 'class one') return '১ম শ্রেণি (Class 1)';
            if (cLower === 'two' || c === '২' || c === '2' || cLower === 'class 2' || c === '২য় শ্রেণি' || cLower === 'class two') return '২য় শ্রেণি (Class 2)';
            if (cLower === 'three' || c === '৩' || c === '3' || cLower === 'class 3' || c === '৩য় শ্রেণি' || cLower === 'class three') return '৩য় শ্রেণি (Class 3)';
            if (cLower === 'four' || c === '৪' || c === '4' || cLower === 'class 4' || c === '৪র্থ শ্রেণি' || cLower === 'class four') return '৪র্থ শ্রেণি (Class 4)';
            if (cLower === 'five' || c === '৫' || c === '5' || cLower === 'class 5' || c === '৫ম শ্রেণি' || cLower === 'class five') return '৫ম শ্রেণি (Class 5)';
            if (cLower === 'six' || c === '৬' || c === '6' || cLower === 'class 6' || c === '৬ষ্ঠ শ্রেণি' || cLower === 'class six') return '৬ষ্ঠ শ্রেণি (Class 6)';
            if (cLower === 'seven' || c === '৭' || c === '7' || cLower === 'class 7' || c === '৭ম শ্রেণি' || cLower === 'class seven') return '৭ম শ্রেণি (Class 7)';
            if (cLower === 'eight' || c === '৮' || c === '8' || cLower === 'class 8' || c === '৮ম শ্রেণি' || cLower === 'class eight') return '৮ম শ্রেণি (Class 8)';
            if (cLower === 'nine' || c === '৯' || c === '9' || cLower === 'class 9' || c === '৯ম শ্রেণি' || cLower === 'class nine') return '৯ম শ্রেণি (Class 9)';
            if (cLower === 'ten' || c === '১০' || c === '10' || cLower === 'class 10' || c === '১০ম শ্রেণি' || cLower === 'class ten') return '১০ম শ্রেণি (Class 10)';
            return c;
        }

        function formatGroupDisplayName(grp) {
            if (!grp) return '';
            const g = String(grp).trim();
            const gLower = g.toLowerCase();
            if (g === 'বিজ্ঞান' || gLower === 'science') return 'বিজ্ঞান (Science)';
            if (g === 'মানবিক' || gLower === 'humanities' || gLower === 'arts') return 'মানবিক (Humanities)';
            if (g === 'ব্যবসায়' || g === 'ব্যবসায় শিক্ষা' || gLower === 'business' || gLower === 'business studies' || gLower === 'commerce') return 'ব্যবসায় শিক্ষা (Business Studies)';
            return g;
        }

        function isClassNineMatch(val) {
            if (!val) return false;
            const s = String(val).toLowerCase().trim();
            return s === 'nine' || s === 'class 9' || s === 'class-9' || s === 'class nine' || s === '৯' || s === '9' || s.includes('৯ম') || s.includes('nine');
        }

        function isClassTenMatch(val) {
            if (!val) return false;
            const s = String(val).toLowerCase().trim();
            return s === 'ten' || s === 'class 10' || s === 'class-10' || s === 'class ten' || s === '১০' || s === '10' || s.includes('১০ম') || s.includes('ten');
        }

        function isClassNineOrTenMatch(val) {
            return isClassNineMatch(val) || isClassTenMatch(val);
        }

        function getAdmissionClassesList() {
            let storedClasses = getStoreData('school_classes', null);
            if (!storedClasses || !Array.isArray(storedClasses) || storedClasses.length === 0) {
                try {
                    const local = localStorage.getItem('school_classes');
                    if (local) storedClasses = JSON.parse(local);
                } catch (e) { }
            }
            if (Array.isArray(storedClasses) && storedClasses.length > 0) {
                return storedClasses;
            }
            if (Array.isArray(ERP_CLASSES) && ERP_CLASSES.length > 0) {
                return ERP_CLASSES;
            }
            return ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
        }

        function getAdmissionGroupsForClass(classVal) {
            let sections = getStoreData('school_class_sections', null);
            if (!sections || !Array.isArray(sections) || sections.length === 0) {
                try {
                    const local = localStorage.getItem('school_class_sections');
                    if (local) sections = JSON.parse(local);
                } catch (e) { }
            }
            if (!sections || !Array.isArray(sections)) {
                sections = ERP_SECTIONS || [];
            }

            const isNine = isClassNineMatch(classVal);
            const isTen = isClassTenMatch(classVal);

            let matchedSections = [];
            if (Array.isArray(sections)) {
                matchedSections = sections.filter(s => {
                    const secClass = String(s.class || '').trim();
                    if (isNine && isClassNineMatch(secClass)) return true;
                    if (isTen && isClassTenMatch(secClass)) return true;
                    return false;
                }).map(s => String(s.section || s.name || s).trim()).filter(Boolean);
            }

            if (matchedSections.length > 0) {
                const unique = [...new Set(matchedSections)];
                return unique;
            }

            return ['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'];
        }

        function initAdmissionClassDropdown() {
            const select = document.getElementById('admTargetClass');
            if (!select) return;

            const currentVal = select.value;
            const classesList = getAdmissionClassesList();

            let html = '<option value="" disabled' + (!currentVal ? ' selected' : '') + '>-- শ্রেণি নির্বাচন করুন --</option>';
            classesList.forEach(cls => {
                const display = formatClassDisplayName(cls);
                const isSelected = (currentVal === cls || currentVal === display) ? ' selected' : '';
                html += `<option value="${escapeHtml(cls)}"${isSelected}>${escapeHtml(display)}</option>`;
            });

            select.innerHTML = html;

            if (currentVal) {
                handleAdmClassChange(currentVal);
            }
        }

        function switchAdmissionTab(tab) {
            const formTabBtn = document.getElementById('admTabBtnForm');
            const printTabBtn = document.getElementById('admTabBtnPrint');
            const formContainer = document.getElementById('admissionFormContainer');
            const searchContainer = document.getElementById('admissionSearchContainer');
            const receiptContainer = document.getElementById('admissionReceiptContainer');

            if (tab === 'form') {
                if (formTabBtn) formTabBtn.classList.add('active');
                if (printTabBtn) printTabBtn.classList.remove('active');
                if (formContainer) formContainer.style.display = 'block';
                if (searchContainer) searchContainer.style.display = 'none';
                if (receiptContainer) receiptContainer.style.display = 'none';
            } else if (tab === 'search') {
                if (formTabBtn) formTabBtn.classList.remove('active');
                if (printTabBtn) printTabBtn.classList.add('active');
                if (formContainer) formContainer.style.display = 'none';
                if (searchContainer) searchContainer.style.display = 'block';
                if (receiptContainer) receiptContainer.style.display = 'none';

                // Automatically try to load the latest application preview in search view if available
                loadLatestAdmissionApplication(false);
            } else if (tab === 'receipt') {
                if (formTabBtn) formTabBtn.classList.remove('active');
                if (printTabBtn) printTabBtn.classList.add('active');
                if (formContainer) formContainer.style.display = 'none';
                if (searchContainer) searchContainer.style.display = 'none';
                if (receiptContainer) receiptContainer.style.display = 'block';
            }

            const modalBody = document.getElementById('admissionModalBody');
            if (modalBody) modalBody.scrollTop = 0;
            const modalCard = document.querySelector('#admissionModalOverlay .modal-card');
            if (modalCard) modalCard.scrollTop = 0;
        }

        function openAdmissionModal(mode = 'form') {
            initAdmissionClassDropdown();
            initAdmissionGeoDropdowns();
            const schoolNameEl = document.getElementById('admissionHeaderSchoolName');
            if (schoolNameEl) {
                const sName = (ERP_SETTINGS && (ERP_SETTINGS.schoolSubtitle || ERP_SETTINGS.schoolName)) || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
                schoolNameEl.textContent = sName;
            }
            const overlay = document.getElementById('admissionModalOverlay');
            if (overlay) {
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            if (mode === 'print' || mode === 'receipt' || mode === 'search') {
                switchAdmissionTab('search');
            } else {
                switchAdmissionTab('form');
            }

            const modalBody = document.getElementById('admissionModalBody');
            if (modalBody) modalBody.scrollTop = 0;
        }

        function closeAdmissionModal() {
            const overlay = document.getElementById('admissionModalOverlay');
            if (overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (window.location.hash === '#admission' || window.location.hash === '#apply' || window.location.hash === '#admission-form') {
                try { history.replaceState(null, null, window.location.pathname + window.location.search); } catch (e) { }
            }
        }

        function openOptionalPolicyModal() {
            const overlay = document.getElementById('optionalPolicyModalOverlay');
            if (!overlay) return;

            // Check currently selected group to auto-switch tab
            const grpSelect = document.getElementById('admGroup');
            const grpVal = grpSelect ? grpSelect.value : '';
            if (grpVal === 'মানবিক' || grpVal.includes('মানবিক')) {
                switchPolicyTab('humanities');
            } else if (grpVal === 'ব্যবসায় শিক্ষা' || grpVal.includes('ব্যবসায়')) {
                switchPolicyTab('business');
            } else {
                switchPolicyTab('science');
            }

            overlay.classList.add('active');
        }

        function closeOptionalPolicyModal() {
            const overlay = document.getElementById('optionalPolicyModalOverlay');
            if (overlay) overlay.classList.remove('active');
        }

        function switchPolicyTab(tabKey) {
            const tabs = ['science', 'humanities', 'business'];
            tabs.forEach(k => {
                const btn = document.getElementById('policyTab' + k.charAt(0).toUpperCase() + k.slice(1));
                const content = document.getElementById('policyContent' + k.charAt(0).toUpperCase() + k.slice(1));
                if (btn) {
                    if (k === tabKey) btn.classList.add('active');
                    else btn.classList.remove('active');
                }
                if (content) {
                    content.style.display = (k === tabKey) ? 'block' : 'none';
                }
            });
        }

        function clearAdmissionForm() {
            const form = document.getElementById('onlineAdmissionForm');
            if (form) {
                form.reset();
            }
            removeAdmissionPhoto();

            // 1. Reset Class, Session, Shift, Medium, Application Type
            const classSelect = document.getElementById('admTargetClass');
            if (classSelect) {
                classSelect.value = '';
            }
            handleAdmClassChange('');

            const sessionEl = document.getElementById('admSession');
            if (sessionEl) sessionEl.value = '2026';

            const shiftEl = document.getElementById('admShift');
            if (shiftEl) shiftEl.value = 'দিবা শাখা';

            const medEl = document.getElementById('admMedium');
            if (medEl) medEl.value = 'বাংলা মাধ্যম';

            const typeEl = document.getElementById('admAppType');
            if (typeEl) typeEl.value = 'নতুন ভর্তি';

            // 2. Reset Student Information Fields
            ['admNameBn', 'admNameEn', 'admBirthReg', 'admDob'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const genderEl = document.getElementById('admGender');
            if (genderEl) genderEl.value = '';
            const relEl = document.getElementById('admReligion');
            if (relEl) relEl.value = '';
            const bloodEl = document.getElementById('admBloodGroup');
            if (bloodEl) bloodEl.value = 'জানা নেই';
            const natEl = document.getElementById('admNationality');
            if (natEl) natEl.value = 'বাংলাদেশী';
            const disEl = document.getElementById('admDisability');
            if (disEl) disEl.value = 'প্রযোজ্য নয়';

            // 3. Reset Parents Information Fields
            ['admFatherBn', 'admFatherEn', 'admFatherNid', 'admFatherPhone',
                'admMotherBn', 'admMotherEn', 'admMotherNid', 'admMotherPhone'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            const fJobEl = document.getElementById('admFatherJob');
            if (fJobEl) fJobEl.value = '';
            const mJobEl = document.getElementById('admMotherJob');
            if (mJobEl) mJobEl.value = '';
            const incEl = document.getElementById('admFamilyIncome');
            if (incEl) incEl.value = '';

            // 4. Reset Guardian Information
            const guardianType = document.getElementById('admGuardianType');
            if (guardianType) {
                guardianType.value = 'Father';
            }
            ['admGuardianName', 'admGuardianNid', 'admGuardianPhone', 'admGuardianEmail'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const gRel = document.getElementById('admGuardianRelation');
            if (gRel) gRel.value = 'পিতা';

            // 5. Reset Address Hierarchy
            const sameChk = document.getElementById('admSameAddressCheckbox');
            if (sameChk) {
                sameChk.checked = false;
                toggleSameAddress(false);
            }
            handleDivisionChange('Pres', '');
            handleDivisionChange('Perm', '');
            const presVil = document.getElementById('admPresVillage');
            if (presVil) presVil.value = '';
            const permVil = document.getElementById('admPermVillage');
            if (permVil) permVil.value = '';

            // 6. Reset Previous School & Quota Details
            ['admPrevSchool', 'admPrevClassRoll', 'admPrevGpa', 'admPrevTc', 'admExtracurricular'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const prevYearEl = document.getElementById('admPrevYear');
            if (prevYearEl) prevYearEl.value = '2025';
            const quotaEl = document.getElementById('admQuota');
            if (quotaEl) quotaEl.value = 'সাধারণ';

            // 7. Reset Agreement Checkbox
            const agreeChk = document.getElementById('admAgreementCheckbox');
            if (agreeChk) agreeChk.checked = false;
        }

        function showAdmissionFormView(clearForm = false) {
            if (clearForm) {
                clearAdmissionForm();
            }
            switchAdmissionTab('form');
        }

        function handleAdmClassChange(classVal) {
            const isNineOrTen = isClassNineOrTenMatch(classVal);

            const grpContainer = document.getElementById('admGroupContainer');
            const grpSelect = document.getElementById('admGroup');
            const optContainer = document.getElementById('admOptionalContainer');
            const optSelect = document.getElementById('admOptionalSubject');

            if (isNineOrTen) {
                if (grpContainer) grpContainer.style.display = 'block';
                if (optContainer) optContainer.style.display = 'block';

                const groups = getAdmissionGroupsForClass(classVal);
                if (grpSelect) {
                    const prevVal = grpSelect.value;
                    let grpHtml = '<option value="" disabled' + (!prevVal ? ' selected' : '') + '>-- বিভাগ / গ্রুপ নির্বাচন করুন --</option>';
                    groups.forEach(g => {
                        const displayG = formatGroupDisplayName(g);
                        const isSel = (prevVal === g || prevVal === displayG) ? ' selected' : '';
                        grpHtml += `<option value="${escapeHtml(g)}"${isSel}>${escapeHtml(displayG)}</option>`;
                    });
                    grpSelect.innerHTML = grpHtml;

                    if (prevVal && groups.some(g => g === prevVal || formatGroupDisplayName(g) === prevVal)) {
                        grpSelect.value = prevVal;
                        handleAdmGroupChange(prevVal);
                    } else if (groups.length > 0) {
                        grpSelect.value = groups[0];
                        handleAdmGroupChange(groups[0]);
                    }
                }
            } else {
                if (grpContainer) grpContainer.style.display = 'none';
                if (optContainer) optContainer.style.display = 'none';
                if (grpSelect) grpSelect.value = 'সাধারণ';
                if (optSelect) optSelect.value = '';
            }
        }

        function getAdmissionOptionalSubjects(classVal, groupVal) {
            let allSubjects = getStoreData('school_subjects', null);
            if (!allSubjects || typeof allSubjects !== 'object') {
                try {
                    const local = localStorage.getItem('school_subjects');
                    if (local) allSubjects = JSON.parse(local);
                } catch (e) { }
            }
            if (!allSubjects || typeof allSubjects !== 'object') {
                allSubjects = ERP_SUBJECTS || {};
            }

            // Find class subjects list
            let classSubs = [];
            const isNine = isClassNineMatch(classVal);
            const isTen = isClassTenMatch(classVal);

            if (Array.isArray(allSubjects)) {
                classSubs = allSubjects;
            } else if (typeof allSubjects === 'object' && allSubjects !== null) {
                // 1. Direct key match or matched class name
                const keys = Object.keys(allSubjects);
                for (const k of keys) {
                    if (isNine && isClassNineMatch(k)) {
                        classSubs = allSubjects[k] || [];
                        break;
                    } else if (isTen && isClassTenMatch(k)) {
                        classSubs = allSubjects[k] || [];
                        break;
                    } else if (k.toLowerCase() === String(classVal).toLowerCase()) {
                        classSubs = allSubjects[k] || [];
                        break;
                    }
                }
                // 2. Fallback key checks
                if (classSubs.length === 0) {
                    if (isNine) {
                        classSubs = allSubjects['Nine'] || allSubjects['Class 9'] || allSubjects['৯ম শ্রেণি'] || [];
                    } else if (isTen) {
                        classSubs = allSubjects['Ten'] || allSubjects['Class 10'] || allSubjects['১০ম শ্রেণি'] || [];
                    }
                }
            }

            const cleanGrp = String(groupVal || '').trim().toLowerCase();

            // Filter optional subjects
            let optionalSubs = [];
            if (Array.isArray(classSubs) && classSubs.length > 0) {
                optionalSubs = classSubs.filter(sub => {
                    if (!sub) return false;
                    const isOpt = (sub.isOptional === true || sub.isOptional === 'true' || sub.isOptional === 1);
                    if (!isOpt) return false;

                    if (cleanGrp) {
                        const subSec = String(sub.section || sub.group || 'All').trim().toLowerCase();
                        if (subSec === 'all' || !subSec) return true;
                        if (subSec.includes(cleanGrp)) return true;
                        if (cleanGrp.includes('বিজ্ঞান') || cleanGrp.includes('science')) {
                            return subSec.includes('বিজ্ঞান') || subSec.includes('science');
                        }
                        if (cleanGrp.includes('মানবিক') || cleanGrp.includes('humanities') || cleanGrp.includes('arts')) {
                            return subSec.includes('মানবিক') || subSec.includes('humanities') || subSec.includes('arts');
                        }
                        if (cleanGrp.includes('ব্যবসায়') || cleanGrp.includes('business') || cleanGrp.includes('commerce')) {
                            return subSec.includes('ব্যবসায়') || subSec.includes('business') || subSec.includes('commerce');
                        }
                        return false;
                    }
                    return true;
                });
            }

            // Return dynamically retrieved subjects from Exam Portal -> Academic Subject Management
            if (optionalSubs.length > 0) {
                return optionalSubs.map(s => {
                    const nameBn = (s.nameBn || '').trim();
                    const nameEn = (s.name || '').trim();
                    const val = nameBn || nameEn;
                    let label = val;
                    if (nameBn && nameEn && nameBn !== nameEn) {
                        label = `${nameBn} (${nameEn})`;
                    }
                    return { val: val, label: label, code: s.code || '' };
                });
            }

            // Default fallback if no optional subjects are configured yet in Academic Subject Management
            if (cleanGrp.includes('বিজ্ঞান') || cleanGrp.includes('science')) {
                return [
                    { val: 'উচ্চতর গণিত', label: 'উচ্চতর গণিত (Higher Math)' },
                    { val: 'জীববিজ্ঞান', label: 'জীববিজ্ঞান (Biology)' },
                    { val: 'কৃষি শিক্ষা', label: 'কৃষি শিক্ষা (Agriculture)' },
                    { val: 'গার্হস্থ্য বিজ্ঞান', label: 'গার্হস্থ্য বিজ্ঞান (Home Science)' }
                ];
            } else if (cleanGrp.includes('মানবিক') || cleanGrp.includes('humanities') || cleanGrp.includes('arts')) {
                return [
                    { val: 'কৃষি শিক্ষা', label: 'কৃষি শিক্ষা (Agriculture)' },
                    { val: 'গার্হস্থ্য বিজ্ঞান', label: 'গার্হস্থ্য বিজ্ঞান (Home Science)' },
                    { val: 'পৌরনীতি ও নাগরিকতা', label: 'পৌরনীতি ও নাগরিকতা (Civics)' },
                    { val: 'অর্থনীতি', label: 'অর্থনীতি (Economics)' },
                    { val: 'ভূগোল ও পরিবেশ', label: 'ভূগোল ও পরিবেশ (Geography)' }
                ];
            } else if (cleanGrp.includes('ব্যবসায়') || cleanGrp.includes('business') || cleanGrp.includes('commerce')) {
                return [
                    { val: 'কৃষি শিক্ষা', label: 'কৃষি শিক্ষা (Agriculture)' },
                    { val: 'গার্হস্থ্য বিজ্ঞান', label: 'গার্হস্থ্য বিজ্ঞান (Home Science)' },
                    { val: 'ফিন্যান্স ও ব্যাংকিং', label: 'ফিন্যান্স ও ব্যাংকিং (Finance & Banking)' },
                    { val: 'অর্থনীতি', label: 'অর্থনীতি (Economics)' },
                    { val: 'ভূগোল ও পরিবেশ', label: 'ভূগোল ও পরিবেশ (Geography)' }
                ];
            }

            return [
                { val: 'উচ্চতর গণিত', label: 'উচ্চতর গণিত (Higher Math)' },
                { val: 'জীববিজ্ঞান', label: 'জীববিজ্ঞান (Biology)' },
                { val: 'কৃষি শিক্ষা', label: 'কৃষি শিক্ষা (Agriculture)' },
                { val: 'গার্হস্থ্য বিজ্ঞান', label: 'গার্হস্থ্য বিজ্ঞান (Home Science)' },
                { val: 'পৌরনীতি ও নাগরিকতা', label: 'পৌরনীতি ও নাগরিকতা (Civics)' },
                { val: 'অর্থনীতি', label: 'অর্থনীতি (Economics)' },
                { val: 'ভূগোল ও পরিবেশ', label: 'ভূগোল ও পরিবেশ (Geography)' },
                { val: 'ফিন্যান্স ও ব্যাংকিং', label: 'ফিন্যান্স ও ব্যাংকিং (Finance & Banking)' }
            ];
        }

        function handleAdmGroupChange(groupVal) {
            const optSelect = document.getElementById('admOptionalSubject');
            if (!optSelect) return;

            const targetClass = document.getElementById('admTargetClass') ? document.getElementById('admTargetClass').value : '';
            const optionalOptions = getAdmissionOptionalSubjects(targetClass, groupVal);

            const prevVal = optSelect.value;
            let html = '<option value="">-- অপশনাল বিষয় নির্বাচন করুন --</option>';
            optionalOptions.forEach(opt => {
                const isSel = (prevVal === opt.val || prevVal === opt.label) ? ' selected' : '';
                html += `<option value="${escapeHtml(opt.val)}"${isSel}>${escapeHtml(opt.label)}</option>`;
            });

            optSelect.innerHTML = html;
            if (prevVal && optionalOptions.some(o => o.val === prevVal || o.label === prevVal)) {
                optSelect.value = prevVal;
            }
        }

        function previewAdmissionPhoto(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            if (file.size > 150 * 1024) {
                alert('ছবির ফাইল সাইজ সর্বোচ্চ 150 KB হতে পারবে। অনুগ্রহ করে 150 KB বা তার কম সাইজের ছবি নির্বাচন করুন।');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                admissionPhotoDataUrl = e.target.result;
                const img = document.getElementById('admPhotoImgPreview');
                const placeholder = document.getElementById('admPhotoPlaceholder');
                const removeBtn = document.getElementById('admPhotoRemoveBtn');
                if (img) {
                    img.src = admissionPhotoDataUrl;
                    img.style.display = 'block';
                }
                if (placeholder) placeholder.style.display = 'none';
                if (removeBtn) removeBtn.style.display = 'inline-flex';
            };
            reader.readAsDataURL(file);
        }

        function removeAdmissionPhoto() {
            admissionPhotoDataUrl = '';
            const input = document.getElementById('admPhotoInput');
            const img = document.getElementById('admPhotoImgPreview');
            const placeholder = document.getElementById('admPhotoPlaceholder');
            const removeBtn = document.getElementById('admPhotoRemoveBtn');
            if (input) input.value = '';
            if (img) {
                img.src = '';
                img.style.display = 'none';
            }
            if (placeholder) placeholder.style.display = 'block';
            if (removeBtn) removeBtn.style.display = 'none';
        }

        // --- BANGLADESH ADMINISTRATIVE GEO DATA (DIVISIONS, DISTRICTS, UPAZILAS, UNIONS, POST OFFICES) ---
        const BD_GEO_DATA = {
            'রংপুর': {
                'নীলফামারী': {
                    'জলঢাকা': {
                        'unions': ['মাথাভাঙ্গা ইউনিয়ন', 'জলঢাকা পৌরসভা', 'গোলমুন্ডা ইউনিয়ন', 'মীরগঞ্জ ইউনিয়ন', 'ডাউয়াবাড়ী ইউনিয়ন', 'বালাগ্রাম ইউনিয়ন', 'কৈমারী ইউনিয়ন', 'শিমুলবাড়ী ইউনিয়ন', 'ধর্মপাল ইউনিয়ন', 'গোলনা ইউনিয়ন', 'খুটামারা ইউনিয়ন', 'কাঁঠালী ইউনিয়ন'],
                        'posts': ['মাথাভাঙ্গা ডাকঘর (৫৩৩১)', 'জলঢাকা প্রধান ডাকঘর (৫৩৩০)', 'মীরগঞ্জ ডাকঘর (৫৩৩২)', 'কৈমারী ডাকঘর (৫৩৩৩)', 'বালাগ্রাম ডাকঘর (৫৩৩৪)', 'ডাউয়াবাড়ী ডাকঘর (৫৩৩৫)', 'গোলমুন্ডা ডাকঘর (৫৩৬০)', 'ধর্মপাল ডাকঘর (৫৩৩৭)', 'শিমুলবাড়ী ডাকঘর (৫৩৩৮)']
                    },
                    'নীলফামারী সদর': {
                        'unions': ['নীলফামারী পৌরসভা', 'চওড়া বড়গাছা', 'গোড়গ্রাম', 'খোকশাবাড়ী', 'পলাশবাড়ী', 'রামনগর', 'কচুকাটা', 'পঞ্চপুকুর', 'ইটাখোলা', 'কুন্দপুকুর', 'সোনারায়', 'সংগলশী', 'চড়াইখোলা', 'চাপড়া সরমজানী', 'টুপামারী', 'লক্ষ্মীচাপ'],
                        'posts': ['নীলফামারী প্রধান ডাকঘর (৫৩০০)', 'নীলফামারী সুগার মিল (৫৩০১)', 'রামনগর ডাকঘর (৫৩০২)', 'টুপামারী ডাকঘর (৫৩০৩)', 'কচুকাটা ডাকঘর (৫৩০৪)']
                    },
                    'সৈয়দপুর': {
                        'unions': ['সৈয়দপুর পৌরসভা', 'কামারপুকুর', 'কাশিরাম বেলপুকুর', 'বাঙালিপুর', 'বোতলাগাড়ী', 'খাতামধুপুর'],
                        'posts': ['সৈয়দপুর প্রধান ডাকঘর (৫৩১০)', 'সৈয়দপুর রেল কারখানা (৫৩১১)', 'সৈয়দপুর বিমানবন্দর (৫৩১২)']
                    },
                    'ডোমার': {
                        'unions': ['ডোমার পৌরসভা', 'ডোমার সদর', 'জোড়াবাড়ী', 'বামুনিয়া', 'পাঙ্গা মটুকপুর', 'গোমনাতি', 'চিলাহাটি / ভোগডাবুড়ী', 'কেতকীবাড়ী', 'হরিণচড়া', 'সোনারায়', 'বোড়াগাড়ী'],
                        'posts': ['ডোমার ডাকঘর (৫৩২০)', 'চিলাহাটি ডাকঘর (৫৩২২)', 'গোমনাতি ডাকঘর (৫৩২১)', 'পাঙ্গা ডাকঘর (৫৩২৩)']
                    },
                    'ডিমলা': {
                        'unions': ['ডিমলা সদর', 'পশ্চিম ছাতনাই', 'বালাপাড়া', 'খগাখড়িবাড়ী', 'গয়াবাড়ী', 'টেপাখড়িবাড়ী', 'খালিশা চাপানী', 'ঝুনাগাছ চাপানী', 'ডালিয়া', 'নাউতারা'],
                        'posts': ['ডিমলা ডাকঘর (৫৩৪০)', 'ডালিয়া ডাকঘর (৫৩৪১)', 'নাউতারা ডাকঘর (৫৩৪২)', 'বালাপাড়া ডাকঘর (৫৩৪৩)']
                    },
                    'কিশোরগঞ্জ': {
                        'unions': ['কিশোরগঞ্জ সদর', 'বড়ভিটা', 'পুটিমারী', 'রণচণ্ডী', 'মাগুড়া', 'চাঁদখানা', 'কিশোরগঞ্জ', 'বাহাগিলি', 'নিতাই'],
                        'posts': ['কিশোরগঞ্জ ডাকঘর (৫৩৫০)', 'মাগুড়া ডাকঘর (৫৩৫১)', 'রণচণ্ডী ডাকঘর (৫৩৫২)', 'বড়ভিটা ডাকঘর (৫৩৫৩)']
                    }
                },
                'রংপুর': {
                    'রংপুর সদর': { 'unions': ['রংপুর সিটি কর্পোরেশন', 'চন্দনপাট', 'হরিদেবপুর', 'সদ্যপুষ্করিণী', 'উত্তম', 'মমিনপুর'], 'posts': ['রংপুর প্রধান ডাকঘর (৫৪০০)', 'রংপুর মেডিকেল কলেজ (৫৪০১)', 'রংপুর বিশ্ববিদ্যালয় (৫৪০৪)'] },
                    'গংগাচড়া': { 'unions': ['গংগাচড়া সদর', 'বেতগাড়ী', 'নোহালী', 'কোলকোন্দ', 'লক্ষ্মীটারী', 'গজঘণ্টা', 'আলমবিদিতর'], 'posts': ['গংগাচড়া ডাকঘর (৫৪০২)', 'নোহালী ডাকঘর (৫৪০৩)'] },
                    'বদরগঞ্জ': { 'unions': ['বদরগঞ্জ পৌরসভা', 'গোপীনাথপুর', 'দামোদরপুর', 'রাধাকৃষ্ণপুর', 'কালুপাড়া', 'বিষ্ণুপুর'], 'posts': ['বদরগঞ্জ ডাকঘর (৫৪২০)', 'শ্যামপুর ডাকঘর (৫৪২১)'] },
                    'কাউনিয়া': { 'unions': ['কাউনিয়া সদর', 'হারাগাছ পৌরসভা', 'সারাই', 'টেপামধুপুর', 'কুর্শা', 'শহীদবাগ'], 'posts': ['কাউনিয়া ডাকঘর (৫৪০০)', 'হারাগাছ ডাকঘর (৫৪১০)'] },
                    'পীরগাছা': { 'unions': ['পীরগাছা সদর', 'ইটাকুমারী', 'অন্নদানগর', 'ছাওলা', 'পারুল', 'তাম্বুলপুর'], 'posts': ['পীরগাছা ডাকঘর (৫৪৫০)', 'অন্নদানগর ডাকঘর (৫৪৫১)'] },
                    'মিঠাপুকুর': { 'unions': ['মিঠাপুকুর সদর', 'খোড়াগাছ', 'বালারহাট', 'কাফ্রিখাল', 'ইমাদপুর', 'দূর্গাপুর'], 'posts': ['মিঠাপুকুর ডাকঘর (৫৪৬০)', 'বালারহাট ডাকঘর (৫৪৬১)'] },
                    'পীরগঞ্জ': { 'unions': ['পীরগঞ্জ পৌরসভা', 'চৈত্রকোল', 'ভেন্ডাবাড়ী', 'বড়দরগাহ', 'কুমেদপুর', 'রায়পুর'], 'posts': ['পীরগঞ্জ ডাকঘর (৫৪৪০)', 'বড়দরগাহ ডাকঘর (৫৪৪১)'] },
                    'তারাগঞ্জ': { 'unions': ['তারাগঞ্জ সদর', 'কুর্শা', 'ইকরচালী', 'হাড়িয়ালকুঠি', 'সয়ার'], 'posts': ['তারাগঞ্জ ডাকঘর (৫৪৩০)'] }
                },
                'দিনাজপুর': {
                    'দিনাজপুর সদর': { 'unions': ['দিনাজপুর পৌরসভা', 'চেহেলগাজী', 'সুন্দরবন', 'ফাযিলপুর', 'শশরা', 'আউলিয়াপুর'], 'posts': ['দিনাজপুর প্রধান ডাকঘর (৫২০০)', 'রাজবাটী ডাকঘর (৫২০১)'] },
                    'পার্বতীপুর': { 'unions': ['পার্বতীপুর পৌরসভা', 'মনমথপুর', 'চণ্ডীপুর', 'মোমিনপুর', 'মোস্তফাপুর', 'হাবড়া'], 'posts': ['পার্বতীপুর প্রধান ডাকঘর (৫২৫০)', 'খোলাহাটি সেনানিবাস (৫২৫২)'] },
                    'চিরিরবন্দর': { 'unions': ['চিরিরবন্দর সদর', 'আব্দুলপুর', 'সাইতাড়া', 'ইসবপুর', 'নশরতপুর'], 'posts': ['চিরিরবন্দর ডাকঘর (৫২২০)', 'রাণীরবন্দর ডাকঘর (৫২২১)'] },
                    'বীরগঞ্জ': { 'unions': ['বীরগঞ্জ পৌরসভা', 'শিবরামপুর', 'পলাশবাড়ী', 'শতগ্রাম', 'সুজালপুর'], 'posts': ['বীরগঞ্জ ডাকঘর (৫২১০)'] },
                    'ফুলবাড়ী': { 'unions': ['ফুলবাড়ী পৌরসভা', 'এলাহীগঞ্জ', 'আলাদিপুর', 'বেতদিঘী', 'দৌলতপুর'], 'posts': ['ফুলবাড়ী ডাকঘর (৫২৬০)'] },
                    'বিরামপুর': { 'unions': ['বিরামপুর পৌরসভা', 'মুখনপুর', 'কাটলা', 'দিওড়', 'পলিপ্রয়াগপুর'], 'posts': ['বিরামপুর ডাকঘর (৫২৭০)'] },
                    'নবাবগঞ্জ': { 'unions': ['নবাবগঞ্জ সদর', 'জয়পুর', 'গোলাপগঞ্জ', 'দিলদাড়পুর', 'মাহমুদপুর'], 'posts': ['নবাবগঞ্জ ডাকঘর (৫২৮০)'] },
                    'বোচাগঞ্জ': { 'unions': ['সেতাবগঞ্জ পৌরসভা', 'নাফানগর', 'ইশানিয়া', 'মুর্শিদহাট', 'রোনগাঁও'], 'posts': ['সেতাবগঞ্জ ডাকঘর (৫২৮০)'] },
                    'কাহারোল': { 'unions': ['কাহারোল সদর', 'ডাবর', 'রসুলপুর', 'তারগাঁও'], 'posts': ['কাহারোল ডাকঘর (৫২২০)'] },
                    'খানসামা': { 'unions': ['খানসামা সদর', 'ভেড়ভেড়ী', 'আঙ্গারপাড়া', 'খামারপাড়া'], 'posts': ['খানসামা ডাকঘর (৫২৩০)'] },
                    'হাকিমপুর': { 'unions': ['হিলী পৌরসভা', 'আলীহাট', 'বোয়ালদাড়', 'খট্টামাধবপাড়া'], 'posts': ['হিলী ডাকঘর (৫২৭২)'] },
                    'ঘোড়াঘাট': { 'unions': ['ঘোড়াঘাট পৌরসভা', 'বুলাকীপুর', 'পালশা', 'সিংড়া'], 'posts': ['ঘোড়াঘাট ডাকঘর (৫২৯০)'] },
                    'বিরল': { 'unions': ['বিরল সদর', 'আজিমপুর', 'ফরক্কাবাদ', 'ধর্মপুর'], 'posts': ['বিরল ডাকঘর (৫২১০)'] }
                },
                'কুড়িগ্রাম': {
                    'কুড়িগ্রাম সদর': { 'unions': ['কুড়িগ্রাম পৌরসভা', 'হোলখানা', 'ভোগডাঙ্গা', 'ঘোগাদহ', 'বেলগাছা', 'মোগলবাসা'], 'posts': ['কুড়িগ্রাম প্রধান ডাকঘর (৫৬০০)', 'চিলমারী বন্দর (৫৬১০)'] },
                    'নাগেশ্বরী': { 'unions': ['নাগেশ্বরী পৌরসভা', 'রামখানা', 'রায়গঞ্জ', 'বামনডাঙ্গা', 'সন্তোষপুর'], 'posts': ['নাগেশ্বরী ডাকঘর (৫৬৬০)'] },
                    'ভুরুঙ্গামারী': { 'unions': ['ভুরুঙ্গামারী সদর', 'জয়মনিরহাট', 'পাথরডুবি', 'তিলাই', 'বলদিয়া'], 'posts': ['ভুরুঙ্গামারী ডাকঘর (৫৬৭০)'] },
                    'উলিপুর': { 'unions': ['উলিপুর পৌরসভা', 'দূর্গাপুর', 'বেগমগঞ্জ', 'বুড়াবুড়ী', 'হাতিয়া', 'সাহেবের আলগা'], 'posts': ['উলিপুর ডাকঘর (৫৬২০)'] },
                    'রাজারহাট': { 'unions': ['রাজারহাট সদর', 'ঘড়িয়ালডাঙ্গা', 'চাকিরপশার', 'বিদ্যানন্দ', 'উমর মজিদ'], 'posts': ['রাজারহাট ডাকঘর (৫৬৩০)'] },
                    'ফুলবাড়ী': { 'unions': ['ফুলবাড়ী সদর', 'নাওডাঙ্গা', 'শিমুলবাড়ী', 'ভাঙ্গামোড়'], 'posts': ['ফুলবাড়ী ডাকঘর (৫৬৪০)'] },
                    'চিলমারী': { 'unions': ['চিলমারী সদর', 'রাণীগঞ্জ', 'রমনা', 'নয়ারহাট'], 'posts': ['চিলমারী ডাকঘর (৫৬১০)'] },
                    'রৌমারী': { 'unions': ['রৌমারী সদর', 'দাঁতভাঙ্গা', 'বন্দবেড়', 'যাদুরাচর'], 'posts': ['রৌমারী ডাকঘর (৫৬৫০)'] },
                    'চর রাজিবপুর': { 'unions': ['রাজিবপুর সদর', 'কোদাণ্ডী', 'মোহনগঞ্জ'], 'posts': ['রাজিবপুর ডাকঘর (৫৬৫১)'] }
                },
                'লালমনিরহাট': {
                    'লালমনিরহাট সদর': { 'unions': ['লালমনিরহাট পৌরসভা', 'মোগলহাট', 'কুলাঘাট', 'মহেন্দ্রনগর', 'হারাটি', 'গোকুন্ডা'], 'posts': ['লালমনিরহাট প্রধান ডাকঘর (৫৫০০)'] },
                    'আদিতমারী': { 'unions': ['আদিতমারী সদর', 'কমলাবাড়ী', 'সারপুকুর', 'ভেলাবাড়ী', 'মহিষখোচা'], 'posts': ['আদিতমারী ডাকঘর (৫৫১০)'] },
                    'কালীগঞ্জ': { 'unions': ['কালীগঞ্জ সদর', 'তুষভাণ্ডার', 'চলবলা', 'মদাতী', 'ভোটমারী'], 'posts': ['তুষভাণ্ডার ডাকঘর (৫৫২০)'] },
                    'হাতিবান্ধা': { 'unions': ['হাতিবান্ধা সদর', 'টঙ্গভাঙ্গা', 'বড়খাতা', 'গড্ডিমারী', 'সিংগীমারী'], 'posts': ['হাতিবান্ধা ডাকঘর (৫৫৩০)', 'বুড়িমারী ডাকঘর (৫৫৩১)'] },
                    'পাটগ্রাম': { 'unions': ['পাটগ্রাম পৌরসভা', 'পাটগ্রাম সদর', 'বাউরা', 'কুচলীবাড়ী', 'দহগ্রাম ছিটমহল'], 'posts': ['পাটগ্রাম ডাকঘর (৫৫৪০)', 'বাউরা ডাকঘর (৫৫৪১)'] }
                },
                'গাইবান্ধা': {
                    'গাইবান্ধা সদর': { 'unions': ['গাইবান্ধা পৌরসভা', 'বোয়ালী', 'ঘাগোয়া', 'গিদারী', 'মালিবাড়ী'], 'posts': ['গাইবান্ধা প্রধান ডাকঘর (৫৭০০)'] },
                    'গোবিন্দগঞ্জ': { 'unions': ['গোবিন্দগঞ্জ পৌরসভা', 'কামারদহ', 'কোচাশহর', 'মহিমাগঞ্জ', 'নাকাই'], 'posts': ['গোবিন্দগঞ্জ ডাকঘর (৫৭৪০)'] },
                    'সাদুল্লাপুর': { 'unions': ['সাদুল্লাপুর সদর', 'রসুলপুর', 'নলডাঙ্গা', 'দামোদরপুর'], 'posts': ['সাদুল্লাপুর ডাকঘর (৫৭১০)'] },
                    'সুন্দরগঞ্জ': { 'unions': ['সুন্দরগঞ্জ পৌরসভা', 'বামনডাঙ্গা', 'তারাপুর', 'বেলকা'], 'posts': ['সুন্দরগঞ্জ ডাকঘর (৫৭২০)'] },
                    'পলাশবাড়ী': { 'unions': ['পলাশবাড়ী পৌরসভা', 'কিশোরগাড়ী', 'হোসেনপুর', 'পবনাপুর'], 'posts': ['পলাশবাড়ী ডাকঘর (৫৭৩০)'] },
                    'সাঘাটা': { 'unions': ['সাঘাটা সদর', 'ভরতখালী', 'কামালেরপাড়া', 'জুমারবাড়ী'], 'posts': ['সাঘাটা ডাকঘর (৫৭৫০)'] },
                    'ফুলছড়ি': { 'unions': ['ফুলছড়ি সদর', 'উড়িয়া', 'উদাখালী', 'গজারিয়া'], 'posts': ['ফুলছড়ি ডাকঘর (৫৭৬০)'] }
                },
                'পঞ্চগড়': {
                    'পঞ্চগড় সদর': { 'unions': ['পঞ্চগড় পৌরসভা', 'অমরখানা', 'হাফিজাবাদ', 'মাগুড়া', 'চাকলাহাট'], 'posts': ['পঞ্চগড় প্রধান ডাকঘর (৫০১০)'] },
                    'তেঁতুলিয়া': { 'unions': ['তেঁতুলিয়া সদর', 'বাংলাবান্ধা', 'তিরনইহাট', 'ভজনপুর'], 'posts': ['তেঁতুলিয়া ডাকঘর (৫০২০)', 'বাংলাবান্ধা ডাকঘর (৫০২১)'] },
                    'বোদা': { 'unions': ['বোদা পৌরসভা', 'ঝলইশালশিরি', 'ময়দানদিঘী', 'সাকোয়া'], 'posts': ['বোদা ডাকঘর (৫০৩০)'] },
                    'দেবীগঞ্জ': { 'unions': ['দেবীগঞ্জ পৌরসভা', 'চেলপারা', 'পামুলী', 'সুন্দরদিঘী'], 'posts': ['দেবীগঞ্জ ডাকঘর (৫০৪০)'] },
                    'আটোয়ারী': { 'unions': ['আটোয়ারী সদর', 'মির্জাপুর', 'তোড়িয়া', 'রাধানগর'], 'posts': ['আটোয়ারী ডাকঘর (৫০৫০)'] }
                },
                'ঠাকুরগাঁও': {
                    'ঠাকুরগাঁও সদর': { 'unions': ['ঠাকুরগাঁও পৌরসভা', 'রুহিয়া', 'আখানগর', 'আকচা', 'বড়গাঁও'], 'posts': ['ঠাকুরগাঁও প্রধান ডাকঘর (৫১০০)', 'রুহিয়া ডাকঘর (৫১০১)'] },
                    'পীরগঞ্জ': { 'unions': ['পীরগঞ্জ পৌরসভা', 'ভোমরাদহ', 'কোষারাণীগঞ্জ', 'খনগাঁও'], 'posts': ['পীরগঞ্জ ডাকঘর (৫১২০)'] },
                    'বালিয়াডাঙ্গী': { 'unions': ['বালিয়াডাঙ্গী সদর', 'লাহিড়ী', 'ভাড়ালী', 'দুপসড়িয়া'], 'posts': ['বালিয়াডাঙ্গী ডাকঘর (৫১১০)'] },
                    'রাণীশংকৈল': { 'unions': ['রাণীশংকৈল পৌরসভা', 'ধর্মগড়', 'নেকমরদ', 'হোসেনগাঁও'], 'posts': ['রাণীশংকৈল ডাকঘর (৫১৩০)'] },
                    'হরিপুর': { 'unions': ['হরিপুর সদর', 'গেদুড়া', 'আমগাঁও', 'বকুয়া'], 'posts': ['হরিপুর ডাকঘর (৫১৪০)'] }
                }
            },
            'ঢাকা': {
                'ঢাকা': {
                    'ঢাকা উত্তর': { 'unions': ['উত্তরা', 'গুলশান', 'মিরপুর', 'মোহাম্মদপুর', 'বনানী', 'বাড্ডা', 'খিলগাঁও', 'রামপুরা'], 'posts': ['উত্তরা প্রধান ডাকঘর (১২৩০)', 'মিরপুর ডাকঘর (১২১৬)', 'গুলশান ডাকঘর (১২১২)', 'মোহাম্মদপুর ডাকঘর (১২০৭)'] },
                    'ঢাকা দক্ষিণ': { 'unions': ['ধানমন্ডি', 'কোতোয়ালী', 'মতিঝিল', 'পল্টন', 'লালবাগ', 'সূত্রাপুর', 'ওয়ারী', 'যাত্রাবাড়ী'], 'posts': ['ঢাকা জিপিও (১০০০)', 'ধানমন্ডি ডাকঘর (১২০৯)', 'মতিঝিল ডাকঘর (১০০০)', 'যাত্রাবাড়ী ডাকঘর (১২০৪)'] },
                    'সাভার': { 'unions': ['সাভার পৌরসভা', 'আশুলিয়া', 'ধামসোনা', 'বিরুলিয়া', 'তেঁতুলঝোড়া', 'আমিনবাজার', 'ভাকুর্তা'], 'posts': ['সাভার ডাকঘর (১৩৪০)', 'সাভার সেনানিবাস (১৩৪১)', 'ইপিজেড ডাকঘর (১৩৪৯)'] },
                    'ধামরাই': { 'unions': ['ধামরাই পৌরসভা', 'আমতা', 'কুশুরা', 'গাংগুটিয়া', 'সুয়াপুর'], 'posts': ['ধামরাই ডাকঘর (১৩৫০)'] },
                    'কেরানীগঞ্জ': { 'unions': ['জিনজিরা', 'কালিন্দী', 'তারানগর', 'রোহিতপুর', 'শাক্তা'], 'posts': ['কেরানীগঞ্জ ডাকঘর (১৩১০)', 'জিনজিরা ডাকঘর (১৩১১)'] },
                    'দোহার': { 'unions': ['দোহার পৌরসভা', 'জয়পড়া', 'রাইপাড়া', 'সুতারপাড়া'], 'posts': ['জয়পড়া ডাকঘর (১৩৩০)'] },
                    'নবাবগঞ্জ': { 'unions': ['নবাবগঞ্জ সদর', 'কলাকোপা', 'বান্দুরা', 'বক্সনগর'], 'posts': ['নবাবগঞ্জ ডাকঘর (১৩২০)', 'বান্দুরা ডাকঘর (১৩২১)'] }
                },
                'গাজীপুর': {
                    'গাজীপুর সদর': { 'unions': ['গাজীপুর সিটি কর্পোরেশন', 'জয়দেবপুর', 'কাউনিয়া', 'পূবাইল'], 'posts': ['গাজীপুর প্রধান ডাকঘর (১৭০০)', 'জয়দেবপুর ডাকঘর (১৭০১)', 'বিইউটি ডাকঘর (১৭০৩)'] },
                    'কালিয়াকৈর': { 'unions': ['কালিয়াকৈর পৌরসভা', 'মৌচাক', 'মধ্যপাড়া', 'বোয়ালী'], 'posts': ['কালিয়াকৈর ডাকঘর (১৭৫০)', 'সফিপুর ডাকঘর (১৭৫১)'] },
                    'শ্রীপুর': { 'unions': ['শ্রীপুর পৌরসভা', 'মাওনা', 'কাওরাইদ', 'তেলিহাটি'], 'posts': ['শ্রীপুর ডাকঘর (১৭৪০)', 'মাওনা ডাকঘর (১৭৪১)'] },
                    'কাপাসিয়া': { 'unions': ['কাপাসিয়া সদর', 'রায়েদ', 'টোক', 'বারিসাব'], 'posts': ['কাপাসিয়া ডাকঘর (১৭৩০)'] },
                    'কালীগঞ্জ': { 'unions': ['কালীগঞ্জ পৌরসভা', 'তুমুলিয়া', 'বক্তাবরপুর', 'মোক্তারপুর'], 'posts': ['কালীগঞ্জ ডাকঘর (১৭২০)'] }
                },
                'নারায়ণগঞ্জ': {
                    'নারায়ণগঞ্জ সদর': { 'unions': ['নারায়ণগঞ্জ সিটি কর্পোরেশন', 'ফতুল্লা', 'সিদ্ধিরগঞ্জ', 'এনায়েতনগর'], 'posts': ['নারায়ণগঞ্জ প্রধান ডাকঘর (১৪০০)', 'ফতুল্লা ডাকঘর (১৪২০)'] },
                    'রূপগঞ্জ': { 'unions': ['রূপগঞ্জ সদর', 'কাঞ্চন পৌরসভা', 'তারাব পৌরসভা', 'ভুলতা', 'মুড়াপাড়া'], 'posts': ['রূপগঞ্জ ডাকঘর (১৪৬০)', 'ভুলতা ডাকঘর (১৪৬২)'] },
                    'সোনারগাঁ': { 'unions': ['সোনারগাঁ পৌরসভা', 'বারদী', 'মোগরাপাড়া', 'পীরোজপুর'], 'posts': ['সোনারগাঁ ডাকঘর (১৪৪০)'] },
                    'আড়াইহাজার': { 'unions': ['আড়াইহাজার পৌরসভা', 'গোপালদী পৌরসভা', 'হাইমাদী', 'উচিতপুর'], 'posts': ['আড়াইহাজার ডাকঘর (১৪৫০)'] },
                    'বন্দর': { 'unions': ['বন্দর পৌরসভা', 'কলাগাছিয়া', 'মদনপুর', 'ধামগড়'], 'posts': ['বন্দর ডাকঘর (১৪১০)'] }
                },
                'কিশোরগঞ্জ': {
                    'কিশোরগঞ্জ সদর': { 'unions': ['কিশোরগঞ্জ পৌরসভা', 'দানাপাটুলী', 'মহিনন্দ', 'যশোদল'], 'posts': ['কিশোরগঞ্জ প্রধান ডাকঘর (২৩০০)'] },
                    'ভৈরব': { 'unions': ['ভৈরব পৌরসভা', 'সাদেকপুর', 'শিমুলকান্দি', 'শ্রীনগর'], 'posts': ['ভৈরব ডাকঘর (২৩৫০)'] },
                    'বাজিতপুর': { 'unions': ['বাজিতপুর পৌরসভা', 'সরারচর', 'পিরিজপুর', 'দিলালপুর'], 'posts': ['বাজিতপুর ডাকঘর (২৩৩০)'] }
                },
                'টাঙ্গাইল': {
                    'টাঙ্গাইল সদর': { 'unions': ['টাঙ্গাইল পৌরসভা', 'করটিয়া', 'পোড়াবাড়ী', 'গালা'], 'posts': ['টাঙ্গাইল প্রধান ডাকঘর (১৯০০)', 'করটিয়া ডাকঘর (১৯০৩)'] },
                    'মির্জাপুর': { 'unions': ['মির্জাপুর পৌরসভা', 'গোড়াই', 'জামুর্কী', 'উয়ার্শী'], 'posts': ['মির্জাপুর ডাকঘর (১৯৪০)'] },
                    'মধুপুর': { 'unions': ['মধুপুর পৌরসভা', 'অরণখোলা', 'আলোকদিয়া', 'কুড়ালিয়া'], 'posts': ['মধুপুর ডাকঘর (১৯২০)'] }
                },
                'মানিকগঞ্জ': { 'মানিকগঞ্জ সদর': { 'unions': ['মানিকগঞ্জ পৌরসভা', 'নাভাঙ্গা', 'দিঘী', 'বেউথা'], 'posts': ['মানিকগঞ্জ প্রধান ডাকঘর (১৮০০)'] }, 'সিংগাইর': { 'unions': ['সিংগাইর পৌরসভা', 'সায়েস্তা', 'ধল্লা'], 'posts': ['সিংগাইর ডাকঘর (১৮২০)'] } },
                'মুন্সীগঞ্জ': { 'মুন্সীগঞ্জ সদর': { 'unions': ['মুন্সীগঞ্জ পৌরসভা', 'মিরকাদিম পৌরসভা', 'রামপাল'], 'posts': ['মুন্সীগঞ্জ প্রধান ডাকঘর (১৫০০)'] }, 'শ্রীনগর': { 'unions': ['শ্রীনগর সদর', 'ভাগ্যকুল', 'বাড়ৈখালী'], 'posts': ['শ্রীনগর ডাকঘর (১৫৫০)'] } },
                'নরসিংদী': { 'নরসিংদী সদর': { 'unions': ['নরসিংদী পৌরসভা', 'মাধবদী পৌরসভা', 'চিনাদিশপুর'], 'posts': ['নরসিংদী প্রধান ডাকঘর (১৬০০)', 'মাধবদী ডাকঘর (১৬০৪)'] } },
                'ফরিদপুর': { 'ফরিদপুর সদর': { 'unions': ['ফরিদপুর পৌরসভা', 'অম্বিকাপুর', 'কানাইপুর'], 'posts': ['ফরিদপুর প্রধান ডাকঘর (৭৮০০)'] } },
                'গোপালগঞ্জ': { 'গোপালগঞ্জ সদর': { 'unions': ['গোপালগঞ্জ পৌরসভা', 'হরিদাসপুর', 'বড়গাতি'], 'posts': ['গোপালগঞ্জ প্রধান ডাকঘর (৮১০০)'] }, 'টুঙ্গিপাড়া': { 'unions': ['টুঙ্গিপাড়া পৌরসভা', 'পাটগাতী', 'কুশলী'], 'posts': ['টুঙ্গিপাড়া ডাকঘর (৮১২০)'] } },
                'মাদারীপুর': { 'মাদারীপুর সদর': { 'unions': ['মাদারীপুর পৌরসভা', 'মুস্তফাপুর', 'শিরখাড়া'], 'posts': ['মাদারীপুর প্রধান ডাকঘর (৭৯০০)'] }, 'শিবচর': { 'unions': ['শিবচর পৌরসভা', 'কাঁঠালবাড়ী', 'বহেরাতলা'], 'posts': ['শিবচর ডাকঘর (৭৯৩০)'] } },
                'রাজবাড়ী': { 'রাজবাড়ী সদর': { 'unions': ['রাজবাড়ী পৌরসভা', 'খানখানাপুর', 'বসন্তপুর'], 'posts': ['রাজবাড়ী প্রধান ডাকঘর (৭৭০০)'] } },
                'শরীয়তপুর': { 'শরীয়তপুর সদর': { 'unions': ['শরীয়তপুর পৌরসভা', 'পালং', 'আংগারিয়া'], 'posts': ['শরীয়তপুর প্রধান ডাকঘর (৮০০০)'] } }
            },
            'চট্টগ্রাম': {
                'চট্টগ্রাম': {
                    'কোতোয়ালী': { 'unions': ['চট্টগ্রাম সিটি কর্পোরেশন', 'আন্দরকিল্লা', 'ফিরিঙ্গিবাজার', 'পাথরঘাটা'], 'posts': ['চট্টগ্রাম প্রধান জিপিও (৪০০০)'] },
                    'পাঁচলাইশ': { 'unions': ['পাঁচলাইশ', 'মুরাদপুর', 'চকবাজার', 'শোলকবহর'], 'posts': ['পাঁচলাইশ ডাকঘর (৪২০০)', 'চকবাজার ডাকঘর (৪২০৩)'] },
                    'পটিয়া': { 'unions': ['পটিয়া পৌরসভা', 'হালিশহর', 'কুসুমপুরা', 'কোলাগাঁও'], 'posts': ['পটিয়া ডাকঘর (৪৩৭০)'] },
                    'সীতাকুণ্ড': { 'unions': ['সীতাকুণ্ড পৌরসভা', 'কুমিরা', 'ভাটিয়ারী', 'বারবকুন্ড'], 'posts': ['সীতাকুণ্ড ডাকঘর (৪৩১০)', 'ভাটিয়ারী ডাকঘর (৪৩১৫)'] },
                    'হাটহাজারী': { 'unions': ['হাটহাজারী পৌরসভা', 'ফতেহপুর', 'ফরহাদাবাদ'], 'posts': ['হাটহাজারী ডাকঘর (৪৩৩০)', 'চট্টগ্রাম বিশ্ববিদ্যালয় (৪৩৩১)'] }
                },
                'কুমিল্লা': {
                    'কুমিল্লা আদর্শ সদর': { 'unions': ['কুমিল্লা সিটি কর্পোরেশন', 'আমতলী', 'জগন্নাথপুর', 'কালিরবাজার'], 'posts': ['কুমিল্লা প্রধান ডাকঘর (৩৫০০)', 'কুমিল্লা সেনানিবাস (৩৫০১)'] },
                    'দাউদকান্দি': { 'unions': ['দাউদকান্দি পৌরসভা', 'গৌরীপুর', 'সুন্দলপুর', 'বিটেশ্বর'], 'posts': ['দাউদকান্দি ডাকঘর (৩৫১৬)', 'গৌরীপুর ডাকঘর (৩৫১৭)'] },
                    'চান্দিনা': { 'unions': ['চান্দিনা পৌরসভা', 'মাইজখার', 'বাড়েরা', 'মহিচাইল'], 'posts': ['চান্দিনা ডাকঘর (৩৫১০)'] }
                },
                'কক্সবাজার': {
                    'কক্সবাজার সদর': { 'unions': ['কক্সবাজার পৌরসভা', 'ঝিলংজা', 'পিএমখালী', 'খুরুশকুল'], 'posts': ['কক্সবাজার প্রধান ডাকঘর (৪৭০০)'] },
                    'চকরিয়া': { 'unions': ['চকরিয়া পৌরসভা', 'বড়ইতলী', 'হারবাং', 'ডুলাহাজারা'], 'posts': ['চকরিয়া ডাকঘর (৪৭৪০)'] },
                    'টেকনাফ': { 'unions': ['টেকনাফ পৌরসভা', 'সেন্টমার্টিন', 'বাহারছড়া', 'সাবরাং'], 'posts': ['টেকনাফ ডাকঘর (৪৭৬১)'] }
                },
                'ফেনী': { 'ফেনী সদর': { 'unions': ['ফেনী পৌরসভা', 'ধর্মপুর', 'ফাজিলপুর'], 'posts': ['ফেনী প্রধান ডাকঘর (৩৯০০)'] } },
                'ব্রাহ্মণবাড়িয়া': { 'ব্রাহ্মণবাড়িয়া সদর': { 'unions': ['ব্রাহ্মণবাড়িয়া পৌরসভা', 'মজলিশপুর', 'বুধল'], 'posts': ['ব্রাহ্মণবাড়িয়া প্রধান ডাকঘর (৩৪০০)'] } },
                'নোয়াখালী': { 'নোয়াখালী সদর': { 'unions': ['নোয়াখালী পৌরসভা', 'মাইজদী', 'এওয়াজবালিয়া'], 'posts': ['মাইজদী প্রধান ডাকঘর (৩৮০০)'] }, 'বেগমগঞ্জ': { 'unions': ['চৌমুহনী পৌরসভা', 'রাজগঞ্জ', 'বেগমগঞ্জ'], 'posts': ['চৌমুহনী ডাকঘর (৩৮২১)'] } },
                'লক্ষ্মীপুর': { 'লক্ষ্মীপুর সদর': { 'unions': ['লক্ষ্মীপুর পৌরসভা', 'দালাল বাজার', 'চররুহিতা'], 'posts': ['লক্ষ্মীপুর প্রধান ডাকঘর (৩৭০০)'] } },
                'চাঁদপুর': { 'চাঁদপুর সদর': { 'unions': ['চাঁদপুর পৌরসভা', 'বিষ্ণুপুর', 'আশিকাটি'], 'posts': ['চাঁদপুর প্রধান ডাকঘর (৩৬০০)'] } },
                'খাগড়াছড়ি': { 'খাগড়াছড়ি সদর': { 'unions': ['খাগড়াছড়ি পৌরসভা', 'পেরাছড়া', 'গোলাবাড়ী'], 'posts': ['খাগড়াছড়ি প্রধান ডাকঘর (৪৪০০)'] } },
                'রাঙ্গামাটি': { 'রাঙ্গামাটি সদর': { 'unions': ['রাঙ্গামাটি পৌরসভা', 'জীবতলী', 'মগবান'], 'posts': ['রাঙ্গামাটি প্রধান ডাকঘর (৪৫০০)'] } },
                'বান্দরবান': { 'বান্দরবান সদর': { 'unions': ['বান্দরবান পৌরসভা', 'কুহালং', 'রাজবিলা'], 'posts': ['বান্দরবান প্রধান ডাকঘর (৪৬০০)'] } }
            },
            'রাজশাহী': {
                'রাজশাহী': {
                    'বোয়ালিয়া': { 'unions': ['রাজশাহী সিটি কর্পোরেশন', 'সাহেব বাজার', 'রামচন্দ্রপুর', 'হেতেমখাঁ'], 'posts': ['রাজশাহী প্রধান জিপিও (৬০০০)'] },
                    'পবা': { 'unions': ['নওহাটা পৌরসভা', 'কাটাখালী পৌরসভা', 'হরিয়ান', 'দামকুড়া'], 'posts': ['পবা ডাকঘর (৬২০১)', 'কাটাখালী ডাকঘর (৬২০২)'] }
                },
                'বগুড়া': {
                    'বগুড়া সদর': { 'unions': ['বগুড়া পৌরসভা', 'এরুলিয়া', 'শাখারিয়া', 'লাহিড়ীপাড়া', 'গোকুল'], 'posts': ['বগুড়া প্রধান ডাকঘর (৫৮০০)', 'বগুড়া সেনানিবাস (৫৮০১)'] },
                    'শেরপুর': { 'unions': ['শেরপুর পৌরসভা', 'কুসুম্বী', 'গাড়ীদহ', 'খামারকান্দি'], 'posts': ['শেরপুর ডাকঘর (৫৮৪০)'] }
                },
                'পাবনা': { 'পাবনা সদর': { 'unions': ['পাবনা পৌরসভা', 'মালঞ্চি', 'দোগাছী'], 'posts': ['পাবনা প্রধান ডাকঘর (৬৬০০)'] }, 'ঈশ্বরদী': { 'unions': ['ঈশ্বরদী পৌরসভা', 'পাকশী', 'সাহাপুর'], 'posts': ['ঈশ্বরদী ডাকঘর (৬৬২০)'] } },
                'সিরাজগঞ্জ': { 'সিরাজগঞ্জ সদর': { 'unions': ['সিরাজগঞ্জ পৌরসভা', 'বাগবাটি', 'রতনকান্দি'], 'posts': ['সিরাজগঞ্জ প্রধান ডাকঘর (৬৭০০)'] }, 'শাহজাদপুর': { 'unions': ['শাহজাদপুর পৌরসভা', 'পোতাজিয়া', 'গাড়েদহ'], 'posts': ['শাহজাদপুর ডাকঘর (৬৭৭০)'] } },
                'নওগাঁ': { 'নওগাঁ সদর': { 'unions': ['নওগাঁ পৌরসভা', 'বোয়ালিয়া', 'হাপানিয়া'], 'posts': ['নওগাঁ প্রধান ডাকঘর (৬৫০০)'] } },
                'নাটোর': { 'নাটোর সদর': { 'unions': ['নাটোর পৌরসভা', 'ছাতনী', 'তেবাড়িয়া'], 'posts': ['নাটোর প্রধান ডাকঘর (৬৪০০)'] } },
                'চাঁপাইনবাবগঞ্জ': { 'চাঁপাইনবাবগঞ্জ সদর': { 'unions': ['চাঁপাইনবাবগঞ্জ পৌরসভা', 'বালিয়াডাঙ্গা', 'সুন্দরপুর'], 'posts': ['চাঁপাইনবাবগঞ্জ প্রধান ডাকঘর (৬৩০০)'] } },
                'জয়পুরহাট': { 'জয়পুরহাট সদর': { 'unions': ['জয়পুরহাট পৌরসভা', 'দোগাছী', 'ভাদশা'], 'posts': ['জয়পুরহাট প্রধান ডাকঘর (৫৯০০)'] } }
            },
            'খুলনা': {
                'খুলনা': {
                    'খুলনা সদর': { 'unions': ['খুলনা সিটি কর্পোরেশন', 'টুটপাড়া', 'বানিয়াখামার', 'বানরগাতী'], 'posts': ['খুলনা প্রধান জিপিও (৯০০০)'] },
                    'রূপসা': { 'unions': ['রূপসা সদর', 'আইচগাতী', 'শ্রীফলতলা', 'নৈহাটী'], 'posts': ['রূপসা ডাকঘর (৯২৪০)'] }
                },
                'যশোর': {
                    'যশোর সদর': { 'unions': ['যশোর পৌরসভা', 'নওয়াপাড়া', 'লেবুতলা', 'ফতেপুর'], 'posts': ['যশোর প্রধান ডাকঘর (৭৪০০)', 'যশোর সেনানিবাস (৭৪০১)'] }
                },
                'সাতক্ষীরা': { 'সাতক্ষীরা সদর': { 'unions': ['সাতক্ষীরা পৌরসভা', 'ঝাউডাঙ্গা', 'আলিয়া'], 'posts': ['সাতক্ষীরা প্রধান ডাকঘর (৯৪০০)'] } },
                'বাগেরহাট': { 'বাগেরহাট সদর': { 'unions': ['বাগেরহাট পৌরসভা', 'যাত্রাপুর', 'কাড়াপাড়া'], 'posts': ['বাগেরহাট প্রধান ডাকঘর (৯৩০০)'] } },
                'ঝিনাইদহ': { 'ঝিনাইদহ সদর': { 'unions': ['ঝিনাইদহ পৌরসভা', 'কালিকাপুর', 'সাধুহাটি'], 'posts': ['ঝিনাইদহ প্রধান ডাকঘর (৭৩০০)'] } },
                'কুষ্টিয়া': { 'কুষ্টিয়া সদর': { 'unions': ['কুষ্টিয়া পৌরসভা', 'ঝাউদিয়া', 'হরিনারায়ণপুর'], 'posts': ['কুষ্টিয়া প্রধান ডাকঘর (৭০০০)'] } },
                'মাগুরা': { 'মাগুরা সদর': { 'unions': ['মাগুরা পৌরসভা', 'রাঘবদাইড়', 'জগদল'], 'posts': ['মাগুরা প্রধান ডাকঘর (৭৬০০)'] } },
                'মেহেরপুর': { 'মেহেরপুর সদর': { 'unions': ['মেহেরপুর পৌরসভা', 'কুতুবপুর', 'বুড়িপোতা'], 'posts': ['মেহেরপুর প্রধান ডাকঘর (৭১০০)'] } },
                'নড়াইল': { 'নড়াইল সদর': { 'unions': ['নড়াইল পৌরসভা', 'মাইজপাড়া', 'শাহাবাদ'], 'posts': ['নড়াইল প্রধান ডাকঘর (৭৫০০)'] } },
                'চুয়াডাঙ্গা': { 'চুয়াডাঙ্গা সদর': { 'unions': ['চুয়াডাঙ্গা পৌরসভা', 'আলুকদিয়া', 'শংকরচন্দ্র'], 'posts': ['চুয়াডাঙ্গা প্রধান ডাকঘর (৭২০০)'] } }
            },
            'বরিশাল': {
                'বরিশাল': {
                    'বরিশাল সদর': { 'unions': ['বরিশাল সিটি কর্পোরেশন', 'কাউনিয়া', 'চন্দ্রমোহন', 'চরবাড়িয়া'], 'posts': ['বরিশাল প্রধান জিপিও (৮২০০)'] },
                    'বাবুগঞ্জ': { 'unions': ['বাবুগঞ্জ সদর', 'রহমতপুর', 'মাধবপাশা', 'চাঁদপাশা'], 'posts': ['বাবুগঞ্জ ডাকঘর (৮২১০)'] }
                },
                'পটুয়াখালী': { 'পটুয়াখালী সদর': { 'unions': ['পটুয়াখালী পৌরসভা', 'লাউকাঠি', 'ছোটবিঘাই'], 'posts': ['পটুয়াখালী প্রধান ডাকঘর (৮৬০০)'] } },
                'ভোলা': { 'ভোলা সদর': { 'unions': ['ভোলা পৌরসভা', 'ইলিশা', 'ভেদুরিয়া'], 'posts': ['ভোলা প্রধান ডাকঘর (৮৩০০)'] } },
                'পিরোজপুর': { 'পিরোজপুর সদর': { 'unions': ['পিরোজপুর পৌরসভা', 'কলাখালী', 'টোনা'], 'posts': ['পিরোজপুর প্রধান ডাকঘর (৮৫০০)'] } },
                'বরগুনা': { 'বরগুনা সদর': { 'unions': ['বরগুনা পৌরসভা', 'গৌরীচন্না', 'বদরখালী'], 'posts': ['বরগুনা প্রধান ডাকঘর (৮৭০০)'] } },
                'ঝালকাঠি': { 'ঝালকাঠি সদর': { 'unions': ['ঝালকাঠি পৌরসভা', 'গাভারামচন্দ্রপুর', 'নবগ্রাম'], 'posts': ['ঝালকাঠি প্রধান ডাকঘর (৮৪০০)'] } }
            },
            'সিলেট': {
                'সিলেট': {
                    'সিলেট সদর': { 'unions': ['সিলেট সিটি কর্পোরেশন', 'মোগলগাঁও', 'কান্দিগাঁও', 'খাদিমনগর', 'টুকেরবাজার'], 'posts': ['সিলেট প্রধান জিপিও (৩১০০)', 'শাহজালাল বিশ্ববিদ্যালয় (৩১০১)'] },
                    'গোলাপগঞ্জ': { 'unions': ['গোলাপগঞ্জ পৌরসভা', 'গোলাপগঞ্জ সদর', 'বাঘা', 'ফুলবাড়ী'], 'posts': ['গোলাপগঞ্জ ডাকঘর (৩১৬০)'] }
                },
                'মৌলভীবাজার': { 'মৌলভীবাজার সদর': { 'unions': ['মৌলভীবাজার পৌরসভা', 'আমতৈল', 'খলিলপুর'], 'posts': ['মৌলভীবাজার প্রধান ডাকঘর (৩২০০)'] }, 'শ্রীমঙ্গল': { 'unions': ['শ্রীমঙ্গল পৌরসভা', 'কালীঘাট', 'সিন্দুরখান'], 'posts': ['শ্রীমঙ্গল ডাকঘর (৩২১০)'] } },
                'হবিগঞ্জ': { 'হবিগঞ্জ সদর': { 'unions': ['হবিগঞ্জ পৌরসভা', 'লুকড়া', 'রিচি'], 'posts': ['হবিগঞ্জ প্রধান ডাকঘর (৩৩০০)'] } },
                'সুনামগঞ্জ': { 'সুনামগঞ্জ সদর': { 'unions': ['সুনামগঞ্জ পৌরসভা', 'রঙ্গারচর', 'সুরমা'], 'posts': ['সুনামগঞ্জ প্রধান ডাকঘর (৩৪০০)'] } }
            },
            'ময়মনসিংহ': {
                'ময়মনসিংহ': {
                    'ময়মনসিংহ সদর': { 'unions': ['ময়মনসিংহ সিটি কর্পোরেশন', 'বোররচর', 'পরাণগঞ্জ', 'সিরতা', 'ভাবখালী'], 'posts': ['ময়মনসিংহ প্রধান ডাকঘর (২২০০)', 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (২২০২)'] },
                    'ত্রিশাল': { 'unions': ['ত্রিশাল পৌরসভা', 'ত্রিশাল সদর', 'বৈলর', 'কাঁঠাল'], 'posts': ['ত্রিশাল ডাকঘর (২২২০)', 'কাজী নজরুল বিশ্ববিদ্যালয় (২২২১)'] }
                },
                'জামালপুর': { 'জামালপুর সদর': { 'unions': ['জামালপুর পৌরসভা', 'নরুন্দি', 'কেন্দুয়া'], 'posts': ['জামালপুর প্রধান ডাকঘর (২০০০)'] } },
                'নেত্রকোণা': { 'নেত্রকোণা সদর': { 'unions': ['নেত্রকোণা পৌরসভা', 'কালিয়াগাবড়া', 'মেদনী'], 'posts': ['নেত্রকোণা প্রধান ডাকঘর (২৪০০)'] } },
                'শেরপুর': { 'শেরপুর সদর': { 'unions': ['শেরপুর পৌরসভা', 'বলাইরচর', 'কামারিয়া'], 'posts': ['শেরপুর প্রধান ডাকঘর (২১০০)'] } }
            }
        };

        // Complete 64 District fallback mapping
        const BD_ALL_DISTRICTS_FALLBACK = {
            'রংপুর': ['নীলফামারী', 'রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম', 'লালমনিরহাট', 'গাইবান্ধা', 'পঞ্চগড়', 'ঠাকুরগাঁও'],
            'ঢাকা': ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'কিশোরগঞ্জ', 'মানিকগঞ্জ', 'মুন্সীগঞ্জ', 'নরসিংদী', 'ফরিদপুর', 'গোপালগঞ্জ', 'মাদারীপুর', 'রাজবাড়ী', 'শরীয়তপুর', 'টাঙ্গাইল'],
            'চট্টগ্রাম': ['চট্টগ্রাম', 'কক্সবাজার', 'কুমিল্লা', 'ফেনী', 'ব্রাহ্মণবাড়িয়া', 'নোয়াখালী', 'লক্ষ্মীপুর', 'চাঁদপুর', 'খাগড়াছড়ি', 'রাঙ্গামাটি', 'বান্দরবান'],
            'রাজশাহী': ['রাজশাহী', 'বগুড়া', 'পাবনা', 'সিরাজগঞ্জ', 'নওগাঁ', 'নাটোর', 'চাঁপাইনবাবগঞ্জ', 'জয়পুরহাট'],
            'খুলনা': ['খুলনা', 'যশোর', 'সাতক্ষীরা', 'বাগেরহাট', 'ঝিনাইদহ', 'কুষ্টিয়া', 'মাগুরা', 'মেহেরপুর', 'নড়াইল', 'চুয়াডাঙ্গা'],
            'বরিশাল': ['বরিশাল', 'পটুয়াখালী', 'ভোলা', 'পিরোজপুর', 'বরগুনা', 'ঝালকাঠি'],
            'সিলেট': ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ'],
            'ময়মনসিংহ': ['ময়মনসিংহ', 'জামালপুর', 'নেত্রকোণা', 'শেরপুর']
        };

        function escapeHtml(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function getAdmissionGeoData() {
            try {
                const saved = localStorage.getItem('bd_geo_admission_data');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.warn('Could not read bd_geo_admission_data from localStorage:', e);
            }
            if (window.__SERVER_SYNC_DATA__ && window.__SERVER_SYNC_DATA__.bd_geo_admission_data) {
                try {
                    const serverVal = window.__SERVER_SYNC_DATA__.bd_geo_admission_data;
                    const parsed = typeof serverVal === 'string' ? JSON.parse(serverVal) : serverVal;
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        return parsed;
                    }
                } catch (e) { }
            }
            return BD_GEO_DATA;
        }

        function initAdmissionGeoDropdowns() {
            const geoData = getAdmissionGeoData();
            const divKeys = Object.keys(geoData);

            ['Pres', 'Perm'].forEach(prefix => {
                const divSelect = document.getElementById('adm' + prefix + 'Division');
                if (divSelect) {
                    const currentVal = divSelect.value;
                    let optsHtml = '<option value="" disabled' + (!currentVal ? ' selected' : '') + '>বিভাগ নির্বাচন করুন</option>';
                    divKeys.forEach(d => {
                        const isSel = (currentVal === d) ? ' selected' : '';
                        optsHtml += '<option value="' + escapeHtml(d) + '"' + isSel + '>' + escapeHtml(d) + '</option>';
                    });
                    divSelect.innerHTML = optsHtml;

                    if (currentVal && divKeys.includes(currentVal)) {
                        refreshCascadingGeoDropdowns(prefix, currentVal);
                    }
                }
            });
        }

        function refreshCascadingGeoDropdowns(prefix, divVal) {
            const geoData = getAdmissionGeoData();
            const distSelect = document.getElementById('adm' + prefix + 'District');
            const upzSelect = document.getElementById('adm' + prefix + 'Upazila');
            const unionSelect = document.getElementById('adm' + prefix + 'Union');
            const postSelect = document.getElementById('adm' + prefix + 'Post');

            if (!distSelect) return;

            const currentDist = distSelect.value;
            let distList = [];
            if (geoData[divVal]) {
                distList = Object.keys(geoData[divVal]);
            } else if (BD_ALL_DISTRICTS_FALLBACK[divVal]) {
                distList = BD_ALL_DISTRICTS_FALLBACK[divVal];
            }

            let distHtml = '<option value="" disabled' + (!currentDist ? ' selected' : '') + '>জেলা নির্বাচন করুন</option>';
            distList.forEach(d => {
                const isSel = (currentDist === d) ? ' selected' : '';
                distHtml += '<option value="' + escapeHtml(d) + '"' + isSel + '>' + escapeHtml(d) + '</option>';
            });
            distSelect.innerHTML = distHtml;

            if (currentDist && distList.includes(currentDist) && upzSelect) {
                const currentUpz = upzSelect.value;
                let upzList = [];
                if (geoData[divVal] && geoData[divVal][currentDist]) {
                    upzList = Object.keys(geoData[divVal][currentDist]);
                } else {
                    upzList = [currentDist + ' সদর', currentDist + ' পৌরসভা', 'উপজেলা - ১', 'উপজেলা - ২'];
                }

                let upzHtml = '<option value="" disabled' + (!currentUpz ? ' selected' : '') + '>উপজেলা / থানা নির্বাচন করুন</option>';
                upzList.forEach(u => {
                    const isSel = (currentUpz === u) ? ' selected' : '';
                    upzHtml += '<option value="' + escapeHtml(u) + '"' + isSel + '>' + escapeHtml(u) + '</option>';
                });
                upzSelect.innerHTML = upzHtml;

                if (currentUpz && upzList.includes(currentUpz)) {
                    let unionList = [];
                    let postList = [];
                    if (geoData[divVal] && geoData[divVal][currentDist] && geoData[divVal][currentDist][currentUpz]) {
                        const node = geoData[divVal][currentDist][currentUpz];
                        unionList = node.unions || [];
                        postList = node.posts || [];
                    }

                    if (unionSelect) {
                        const currentUnion = unionSelect.value;
                        let unionHtml = '<option value="" disabled' + (!currentUnion ? ' selected' : '') + '>ইউনিয়ন / পৌরসভা নির্বাচন করুন</option>';
                        unionList.forEach(un => {
                            const isSel = (currentUnion === un) ? ' selected' : '';
                            unionHtml += '<option value="' + escapeHtml(un) + '"' + isSel + '>' + escapeHtml(un) + '</option>';
                        });
                        unionSelect.innerHTML = unionHtml;
                    }

                    if (postSelect) {
                        const currentPost = postSelect.value;
                        let postHtml = '<option value="" disabled' + (!currentPost ? ' selected' : '') + '>ডাকঘর নির্বাচন করুন</option>';
                        postList.forEach(po => {
                            const isSel = (currentPost === po) ? ' selected' : '';
                            postHtml += '<option value="' + escapeHtml(po) + '"' + isSel + '>' + escapeHtml(po) + '</option>';
                        });
                        postSelect.innerHTML = postHtml;
                    }
                }
            }
        }

        // --- CASCADING ADDRESS EVENT HANDLERS ---
        function handleDivisionChange(prefix, divVal) {
            const geoData = getAdmissionGeoData();
            const distSelect = document.getElementById('adm' + prefix + 'District');
            const upzSelect = document.getElementById('adm' + prefix + 'Upazila');
            const unionSelect = document.getElementById('adm' + prefix + 'Union');
            const postSelect = document.getElementById('adm' + prefix + 'Post');

            if (distSelect) {
                let distList = [];
                if (geoData[divVal]) {
                    distList = Object.keys(geoData[divVal]);
                } else if (BD_ALL_DISTRICTS_FALLBACK[divVal]) {
                    distList = BD_ALL_DISTRICTS_FALLBACK[divVal];
                }
                distSelect.innerHTML = '<option value="" disabled selected>জেলা নির্বাচন করুন</option>' +
                    distList.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
                distSelect.value = '';
            }

            if (upzSelect) {
                upzSelect.innerHTML = '<option value="" disabled selected>প্রথমে জেলা নির্বাচন করুন</option>';
            }
            if (unionSelect) {
                unionSelect.innerHTML = '<option value="" disabled selected>প্রথমে উপজেলা নির্বাচন করুন</option>';
            }
            if (postSelect) {
                postSelect.innerHTML = '<option value="" disabled selected>প্রথমে ইউনিয়ন নির্বাচন করুন</option>';
            }

            if (prefix === 'Pres') {
                syncPermanentAddress();
            }
        }

        function handleDistrictChange(prefix, distVal) {
            const geoData = getAdmissionGeoData();
            const divVal = document.getElementById('adm' + prefix + 'Division') ? document.getElementById('adm' + prefix + 'Division').value : '';
            const upzSelect = document.getElementById('adm' + prefix + 'Upazila');
            const unionSelect = document.getElementById('adm' + prefix + 'Union');
            const postSelect = document.getElementById('adm' + prefix + 'Post');

            if (upzSelect) {
                let upzList = [];
                if (geoData[divVal] && geoData[divVal][distVal]) {
                    upzList = Object.keys(geoData[divVal][distVal]);
                } else {
                    upzList = [distVal + ' সদর', distVal + ' পৌরসভা', 'উপজেলা - ১', 'উপজেলা - ২'];
                }
                upzSelect.innerHTML = '<option value="" disabled selected>উপজেলা / থানা নির্বাচন করুন</option>' +
                    upzList.map(u => '<option value="' + escapeHtml(u) + '">' + escapeHtml(u) + '</option>').join('');
                upzSelect.value = '';
            }

            if (unionSelect) {
                unionSelect.innerHTML = '<option value="" disabled selected>প্রথমে উপজেলা নির্বাচন করুন</option>';
            }
            if (postSelect) {
                postSelect.innerHTML = '<option value="" disabled selected>প্রথমে ইউনিয়ন নির্বাচন করুন</option>';
            }

            if (prefix === 'Pres') {
                syncPermanentAddress();
            }
        }

        function handleUpazilaChange(prefix, upzVal) {
            const geoData = getAdmissionGeoData();
            const divVal = document.getElementById('adm' + prefix + 'Division') ? document.getElementById('adm' + prefix + 'Division').value : '';
            const distVal = document.getElementById('adm' + prefix + 'District') ? document.getElementById('adm' + prefix + 'District').value : '';
            const unionSelect = document.getElementById('adm' + prefix + 'Union');
            const postSelect = document.getElementById('adm' + prefix + 'Post');

            let unionList = [];
            let postList = [];

            if (geoData[divVal] && geoData[divVal][distVal] && geoData[divVal][distVal][upzVal]) {
                const node = geoData[divVal][distVal][upzVal];
                unionList = node.unions || [];
                postList = node.posts || [];
            } else {
                unionList = [upzVal + ' পৌরসভা', upzVal + ' সদর ইউনিয়ন', '১নং ওয়ার্ড', '২নং ওয়ার্ড', '৩নং ওয়ার্ড', '৪নং ওয়ার্ড', '৫নং ওয়ার্ড', '৬নং ওয়ার্ড', '৭নং ওয়ার্ড', '৮নং ওয়ার্ড', '৯নং ওয়ার্ড', 'অন্যান্য ইউনিয়ন'];
                postList = [upzVal + ' প্রধান ডাকঘর', upzVal + ' সাব-পোস্ট অফিস', 'উপজেলা সদর ডাকঘর'];
            }

            if (unionSelect) {
                unionSelect.innerHTML = '<option value="" disabled selected>ইউনিয়ন / পৌরসভা নির্বাচন করুন</option>' +
                    unionList.map(un => '<option value="' + escapeHtml(un) + '">' + escapeHtml(un) + '</option>').join('');
                unionSelect.value = '';
            }

            if (postSelect) {
                postSelect.innerHTML = '<option value="" disabled selected>ডাকঘর নির্বাচন করুন</option>' +
                    postList.map(po => '<option value="' + escapeHtml(po) + '">' + escapeHtml(po) + '</option>').join('');
                postSelect.value = '';
            }

            if (prefix === 'Pres') {
                syncPermanentAddress();
            }
        }

        function handleUnionChange(prefix, unionVal) {
            const geoData = getAdmissionGeoData();
            const divVal = document.getElementById('adm' + prefix + 'Division') ? document.getElementById('adm' + prefix + 'Division').value : '';
            const distVal = document.getElementById('adm' + prefix + 'District') ? document.getElementById('adm' + prefix + 'District').value : '';
            const upzVal = document.getElementById('adm' + prefix + 'Upazila') ? document.getElementById('adm' + prefix + 'Upazila').value : '';
            const postSelect = document.getElementById('adm' + prefix + 'Post');

            if (postSelect && geoData[divVal] && geoData[divVal][distVal] && geoData[divVal][distVal][upzVal]) {
                const posts = geoData[divVal][distVal][upzVal].posts || [];
                const cleanUnion = unionVal.replace(' ইউনিয়ন', '').replace(' পৌরসভা', '').trim();
                const matchedPost = posts.find(p => p.includes(cleanUnion));
                if (matchedPost) {
                    postSelect.value = matchedPost;
                }
            }

            if (prefix === 'Pres') {
                syncPermanentAddress();
            }
        }

        function handlePostChange(prefix, postVal) {
            if (prefix === 'Pres') {
                syncPermanentAddress();
            }
        }

        function toggleSameAddress(isChecked) {
            if (isChecked) {
                syncPermanentAddress();
            }
        }

        function syncPermanentAddress() {
            const sameChk = document.getElementById('admSameAddressCheckbox');
            if (!sameChk || !sameChk.checked) return;

            const presDiv = document.getElementById('admPresDivision') ? document.getElementById('admPresDivision').value : '';
            const presDist = document.getElementById('admPresDistrict') ? document.getElementById('admPresDistrict').value : '';
            const presUpz = document.getElementById('admPresUpazila') ? document.getElementById('admPresUpazila').value : '';
            const presUnion = document.getElementById('admPresUnion') ? document.getElementById('admPresUnion').value : '';
            const presPost = document.getElementById('admPresPost') ? document.getElementById('admPresPost').value : '';
            const presVillage = document.getElementById('admPresVillage') ? document.getElementById('admPresVillage').value : '';

            const permDiv = document.getElementById('admPermDivision');
            const permDist = document.getElementById('admPermDistrict');
            const permUpz = document.getElementById('admPermUpazila');
            const permUnion = document.getElementById('admPermUnion');
            const permPost = document.getElementById('admPermPost');
            const permVillage = document.getElementById('admPermVillage');

            if (permDiv && presDiv && permDiv.value !== presDiv) {
                permDiv.value = presDiv;
                handleDivisionChange('Perm', presDiv);
            }
            if (permDist && presDist && permDist.value !== presDist) {
                permDist.value = presDist;
                handleDistrictChange('Perm', presDist);
            }
            if (permUpz && presUpz && permUpz.value !== presUpz) {
                permUpz.value = presUpz;
                handleUpazilaChange('Perm', presUpz);
            }
            if (permUnion && presUnion) {
                permUnion.value = presUnion;
            }
            if (permPost && presPost) {
                permPost.value = presPost;
            }
            if (permVillage) {
                permVillage.value = presVillage;
            }
        }

        function handleGuardianTypeChange(typeVal) {
            const gName = document.getElementById('admGuardianName');
            const gRel = document.getElementById('admGuardianRelation');
            const gNid = document.getElementById('admGuardianNid');
            const gPhone = document.getElementById('admGuardianPhone');

            if (typeVal.includes('Father') || typeVal.includes('পিতা')) {
                const fName = document.getElementById('admFatherBn') ? document.getElementById('admFatherBn').value : '';
                const fNid = document.getElementById('admFatherNid') ? document.getElementById('admFatherNid').value : '';
                const fPhone = document.getElementById('admFatherPhone') ? document.getElementById('admFatherPhone').value : '';
                if (gName) gName.value = fName;
                if (gRel) gRel.value = 'পিতা';
                if (gNid) gNid.value = fNid;
                if (gPhone) gPhone.value = fPhone;
            } else if (typeVal.includes('Mother') || typeVal.includes('মাতা')) {
                const mName = document.getElementById('admMotherBn') ? document.getElementById('admMotherBn').value : '';
                const mNid = document.getElementById('admMotherNid') ? document.getElementById('admMotherNid').value : '';
                const mPhone = document.getElementById('admMotherPhone') ? document.getElementById('admMotherPhone').value : '';
                if (gName) gName.value = mName;
                if (gRel) gRel.value = 'মাতা';
                if (gNid) gNid.value = mNid;
                if (gPhone) gPhone.value = mPhone;
            } else {
                if (gName) gName.value = '';
                if (gRel) gRel.value = 'স্থানীয় অভিভাবক';
                if (gNid) gNid.value = '';
                if (gPhone) gPhone.value = '';
            }
        }

        function resetAdmissionFormInputs() {
            if (confirm('আপনি কি ফরমের সকল তথ্য রিসেট করতে চান?')) {
                clearAdmissionForm();
            }
        }

        // Helper to get latest real-time school logo
        function getLatestSchoolLogo() {
            let logo = localStorage.getItem('school_logo');
            if (!logo) {
                try {
                    const s = JSON.parse(localStorage.getItem('school_settings') || '{}');
                    if (s.schoolLogo) logo = s.schoolLogo;
                } catch(e) {}
            }
            if (!logo && typeof ERP_SETTINGS !== 'undefined' && ERP_SETTINGS.schoolLogo) {
                logo = ERP_SETTINGS.schoolLogo;
            }
            return logo || 'school_logo.svg';
        }

        // Generate 9-Digit Standard Tracking ID (Format: YYDDMMSSS e.g. 260212001)
        // 1. Session last 2 digits (e.g. 2026 -> 26)
        // 2. Application date and month (e.g. 02 December -> 0212)
        // 3. Serial Sequence 3 digits starting from 001 (e.g. 001, 002, 003...)
        function generateAdmissionTrackingId(session, dateObj) {
            const d = dateObj || new Date();
            let sYear = session ? String(session).trim() : '';
            sYear = sYear.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
            const yearMatch = sYear.match(/\d{4}/) || sYear.match(/\d{2}/);
            const sessionPart = yearMatch ? yearMatch[0].slice(-2) : String(d.getFullYear()).slice(-2);

            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const datePart = day + month;

            let serial = 1;
            try {
                const apps = JSON.parse(localStorage.getItem('school_admission_applications') || '[]');
                const prefix = sessionPart + datePart;
                let maxSeq = 0;
                apps.forEach(app => {
                    if (app && app.trackingId) {
                        const tId = String(app.trackingId).trim();
                        if (tId.startsWith(prefix) && tId.length === 9) {
                            const seqNum = parseInt(tId.slice(6), 10);
                            if (!isNaN(seqNum) && seqNum > maxSeq) {
                                maxSeq = seqNum;
                            }
                        }
                    }
                });
                serial = maxSeq + 1;
            } catch(e) {
                serial = 1;
            }

            const serialPart = String(serial).padStart(3, '0');
            return sessionPart + datePart + serialPart;
        }

        // Helper to create sample default admission record for preview
        function getSampleAdmissionRecord() {
            const now = new Date();
            const submitDate = now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
            const submitTime = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
            return {
                id: 'APP-' + Date.now(),
                trackingId: generateAdmissionTrackingId('2026', new Date(2026, 11, 2)),
                submittedAt: now.toISOString(),
                formattedDate: submitDate + ', ' + submitTime,
                targetClass: 'ষষ্ঠ শ্রেণি',
                session: '2026',
                shift: 'দিবা শাখা',
                group: 'সাধারণ',
                optionalSubject: 'প্রযোজ্য নয়',
                medium: 'বাংলা মাধ্যম',
                appType: 'নতুন ভর্তি',
                photo: typeof admissionPhotoDataUrl !== 'undefined' ? admissionPhotoDataUrl : '',
                student: {
                    nameBn: 'তানভীর আহমেদ',
                    nameEn: 'TANVIR AHMED',
                    birthReg: '20121012345678901',
                    dob: '2012-05-15',
                    gender: 'ছাত্র',
                    religion: 'ইসলাম',
                    bloodGroup: 'B+',
                    nationality: 'বাংলাদেশী',
                    disability: 'প্রযোজ্য নয়'
                },
                parents: {
                    fatherBn: 'আব্দুর রহিম',
                    fatherEn: 'ABDUR RAHIM',
                    fatherNid: '1980123456789',
                    fatherJob: 'ব্যবসায়',
                    fatherPhone: '01712345678',
                    motherBn: 'মোসাঃ ফাতেমা বেগম',
                    motherEn: 'MOSA FATEMA BEGUM',
                    motherNid: '1985123456789',
                    motherJob: 'গৃহিণী',
                    motherPhone: '01798765432',
                    familyIncome: '২৫,০০০'
                },
                guardian: {
                    type: 'পিতা',
                    name: 'আব্দুর রহিম',
                    relation: 'পিতা',
                    nid: '1980123456789',
                    phone: '01712345678',
                    email: '-'
                },
                address: {
                    present: 'গ্রাম: মাথাভাঙ্গা, ডাকঘর: জলঢাকা, উপজেলা: জলঢাকা, জেলা: নীলফামারী, রংপুর বিভাগ',
                    permanent: 'গ্রাম: মাথাভাঙ্গা, ডাকঘর: জলঢাকা, উপজেলা: জলঢাকা, জেলা: নীলফামারী, রংপুর বিভাগ'
                },
                previous: {
                    school: 'মাথাভাঙ্গা সরকারি প্রাথমিক বিদ্যালয়',
                    classRoll: '৫ম শ্রেণি, রোল: ০১',
                    year: '2025',
                    gpa: '৫.০০',
                    tc: 'TC-8892'
                },
                quota: 'সাধারণ',
                extracurricular: 'ক্রিকেট ও বিতর্ক',
                status: 'Submitted'
            };
        }

        // Build Official Printable 2-Page A4 Voucher HTML (Page 1: প্রতিষ্ঠান কপি, Page 2: শিক্ষার্থী কপি)
        function buildAdmissionVoucherHtml(record) {
            if (!record) record = getSampleAdmissionRecord();
            const schoolBn = (typeof ERP_SETTINGS !== 'undefined' && ERP_SETTINGS.schoolSubtitle) || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
            const schoolEn = (typeof ERP_SETTINGS !== 'undefined' && ERP_SETTINGS.schoolName) || "Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School";
            const schoolAddr = (typeof ERP_SETTINGS !== 'undefined' && ERP_SETTINGS.schoolAddress) || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
            const schoolPhone = (typeof ERP_SETTINGS !== 'undefined' && ERP_SETTINGS.schoolPhone) || "+8801794918384";
            const schoolLogo = getLatestSchoolLogo();

            let schoolEiin = "124915";
            let schoolCode = "465056";
            if (typeof ERP_SETTINGS !== 'undefined' && ERP_SETTINGS.schoolOther) {
                const eiinM = ERP_SETTINGS.schoolOther.match(/EIIN\\s*:\\s*([0-9]+)/i);
                if (eiinM && eiinM[1]) schoolEiin = eiinM[1];
                const codeM = ERP_SETTINGS.schoolOther.match(/(?:কোড|code)\\s*:\\s*([0-9]+)/i);
                if (codeM && codeM[1]) schoolCode = codeM[1];
            }

            const trackingId = record.trackingId || generateAdmissionTrackingId(session, new Date());
            const formattedDate = record.formattedDate || new Date().toLocaleDateString('bn-BD');
            const targetClass = record.targetClass || '-';
            const session = record.session || '2026';
            const shift = record.shift || 'দিবা শাখা';
            const displayGroup = record.group || 'সাধারণ';
            const displayOptional = record.optionalSubject || 'প্রযোজ্য নয়';
            const medium = record.medium || 'বাংলা মাধ্যম';
            const appType = record.appType || 'নতুন ভর্তি';

            const st = record.student || {};
            const pa = record.parents || {};
            const gd = record.guardian || {};
            const addr = record.address || {};
            const prev = record.previous || {};

            const nameBn = st.nameBn || '-';
            const nameEn = st.nameEn || '-';
            const birthReg = st.birthReg || '-';
            const dob = st.dob || '-';
            const gender = st.gender || '-';
            const religion = st.religion || '-';
            const bloodGroup = st.bloodGroup || 'জানা নেই';
            const nationality = st.nationality || 'বাংলাদেশী';
            const disability = st.disability || 'প্রযোজ্য নয়';

            const fatherBn = pa.fatherBn || '-';
            const fatherEn = pa.fatherEn || '';
            const fatherNid = pa.fatherNid || '-';
            const fatherJob = pa.fatherJob || '-';
            const fatherPhone = pa.fatherPhone || '-';

            const motherBn = pa.motherBn || '-';
            const motherEn = pa.motherEn || '';
            const motherNid = pa.motherNid || '-';
            const motherJob = pa.motherJob || '-';
            const motherPhone = pa.motherPhone || '-';
            const familyIncome = pa.familyIncome || '-';

            const guardianType = gd.type || 'পিতা';
            const guardianName = gd.name || fatherBn;
            const guardianRelation = gd.relation || 'পিতা';
            const guardianNid = gd.nid || fatherNid;
            const guardianPhone = gd.phone || fatherPhone;
            const guardianEmail = gd.email || '-';

            const fullPresAddress = addr.present || '-';
            const fullPermAddress = addr.permanent || '-';

            const prevSchool = prev.school || '-';
            const prevClassRoll = prev.classRoll || '-';
            const prevYear = prev.year || '-';
            const prevGpa = prev.gpa || '-';
            const prevTc = prev.tc || '-';

            const quota = record.quota || 'সাধারণ';
            const extracurricular = record.extracurricular || '-';

            const photoHtml = record.photo
                ? `<img src="${record.photo}" class="voucher-student-photo-img" style="width: 74px; height: 88px; object-fit: cover; border-radius: 4px; border: 1.5px solid #0f172a; box-shadow: 0 2px 5px rgba(0,0,0,0.12);" alt="Student Photo">`
                : `<div class="voucher-student-photo-box" style="width: 74px; height: 88px; border: 1.5px dashed #475569; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.60rem; color: #475569; background: #f8fafc; text-align: center; padding: 2px; box-sizing: border-box;">
                     <i class="fa-solid fa-user-plus" style="font-size: 1.3rem; margin-bottom: 2px; color: #94a3b8;"></i>
                     <span style="font-weight: 700; line-height: 1.1;">পাসপোর্ট ছবি সংযুক্ত করুন</span>
                   </div>`;

            return `
                <div class="admission-pages-container">
                    
                    <!-- ========================================================
                         PAGE 1: প্রতিষ্ঠান কপি (INSTITUTION / OFFICE COPY)
                         ======================================================== -->
                    <div class="admission-page-wrapper page-1">
                        <div class="admission-a4-page">
                            <!-- HEADER: 3-COLUMNS (Left Logo | Center Info | Right Photo) -->
                            <div class="voucher-header" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; gap: 10px !important; padding-bottom: 6px !important; border-bottom: 2px solid #0f172a !important; margin-bottom: 6px !important; width: 100% !important;">
                                <!-- Left Side: Updated School Logo (Red Arrow Left Spot) -->
                                <div class="voucher-header-left" style="flex: 0 0 76px !important; width: 76px !important; text-align: left !important; display: flex !important; align-items: center !important; justify-content: flex-start !important;">
                                    <img class="voucher-school-logo-img" src="${schoolLogo}" onerror="this.src='school_logo.svg'" style="width: 70px !important; height: 70px !important; object-fit: contain !important; display: block !important;" alt="School Logo">
                                </div>
                                <!-- Center: School Information -->
                                <div class="voucher-school-info voucher-header-center" style="flex: 1 1 auto !important; text-align: center !important; padding: 0 6px !important;">
                                    <h2 style="font-size: 1.20rem; color: #0f172a; font-weight: 800; margin: 0 0 2px 0; line-height: 1.18;">${schoolBn}</h2>
                                    <h4 style="font-size: 0.80rem; color: #475569; font-weight: 600; margin: 0 0 2px 0;">${schoolEn}</h4>
                                    <p style="font-size: 0.70rem; color: #64748b; margin: 0; line-height: 1.25;"><i class="fa-solid fa-location-dot"></i> ${schoolAddr} | <i class="fa-solid fa-phone"></i> ${schoolPhone} | EIIN: <strong>${schoolEiin}</strong> | কোড: <strong>${schoolCode}</strong></p>
                                </div>
                                <!-- Right Side: Student Photo (Red Arrow Right Spot) -->
                                <div class="voucher-header-right" style="flex: 0 0 80px !important; width: 80px !important; display: flex !important; align-items: center !important; justify-content: flex-end !important; text-align: right !important;">
                                    ${photoHtml}
                                </div>
                            </div>

                            <!-- TITLE BANNER & COPY STRIP -->
                            <div class="voucher-banner-strip">
                                <span><i class="fa-solid fa-graduation-cap"></i> অনলাইন ভর্তি আবেদনপত্র — শিক্ষাবর্ষ ${session}</span>
                                <span class="voucher-copy-badge office">🏛️ প্রতিষ্ঠান কপি (Office Copy)</span>
                            </div>

                            <!-- APPLICATION SUMMARY BAR -->
                            <div class="voucher-summary-grid">
                                <div class="voucher-summary-item">
                                    <span>ট্র্যাকিং আইডি (Tracking ID):</span>
                                    <strong style="color: #0052ff; font-size: 0.95rem; letter-spacing: 0.5px;">${trackingId}</strong>
                                </div>
                                <div class="voucher-summary-item">
                                    <span>আবেদনের তারিখ:</span>
                                    <strong>${formattedDate}</strong>
                                </div>
                                <div class="voucher-summary-item">
                                    <span>ভর্তি ইচ্ছুক শ্রেণি:</span>
                                    <strong style="color: #0052ff;">${targetClass}</strong>
                                </div>
                                <div class="voucher-summary-item">
                                    <span>আবেদনের অবস্থা:</span>
                                    <span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 700; display: inline-block; width: fit-content;">
                                        <i class="fa-solid fa-circle-check"></i> দাখিলকৃত (Submitted)
                                    </span>
                                </div>
                            </div>

                            <!-- 1. ACADEMIC DETAILS -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-graduation-cap"></i> ১. প্রাতিষ্ঠানিক ও ভর্তি তথ্য</th>
                                </tr>
                                <tr>
                                    <th>ভর্তি ইচ্ছুক শ্রেণি</th>
                                    <td><strong>${targetClass}</strong></td>
                                    <th>শিক্ষাবর্ষ ও মাধ্যম</th>
                                    <td><strong>${session}</strong> (${medium})</td>
                                </tr>
                                <tr>
                                    <th>বিভাগ / গ্রুপ</th>
                                    <td>${displayGroup}</td>
                                    <th>অপশনাল বিষয়</th>
                                    <td><strong>${displayOptional}</strong></td>
                                </tr>
                                <tr>
                                    <th>শিফট ও ভর্তির ধরণ</th>
                                    <td>${shift || 'দিবা শাখা'} (${appType})</td>
                                    <th>কোটা সংক্রান্ত তথ্য</th>
                                    <td>${quota}</td>
                                </tr>
                            </table>

                            <!-- 2. STUDENT PERSONAL DETAILS -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-user-graduate"></i> ২. শিক্ষার্থীর ব্যক্তিগত তথ্য</th>
                                </tr>
                                <tr>
                                    <th>শিক্ষার্থীর নাম (বাংলা)</th>
                                    <td><strong>${nameBn}</strong></td>
                                    <th>নাম (ইংরেজিতে)</th>
                                    <td><strong>${nameEn}</strong></td>
                                </tr>
                                <tr>
                                    <th>জন্ম নিবন্ধন নম্বর (BRN)</th>
                                    <td><strong style="color: #0052ff;">${birthReg}</strong></td>
                                    <th>জন্ম তারিখ</th>
                                    <td>${dob}</td>
                                </tr>
                                <tr>
                                    <th>লিঙ্গ ও ধর্ম</th>
                                    <td>${gender} | ${religion}</td>
                                    <th>রক্তের গ্রুপ ও জাতীয়তা</th>
                                    <td>${bloodGroup} | ${nationality}</td>
                                </tr>
                                <tr>
                                    <th>শারীরিক প্রতিবন্ধকতা</th>
                                    <td>${disability}</td>
                                    <th>সহশিক্ষা কার্যক্রম</th>
                                    <td>${extracurricular}</td>
                                </tr>
                            </table>

                            <!-- 3. PARENTS & GUARDIAN DETAILS -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-people-roof"></i> ৩. পিতা, মাতা ও অভিভাবকের তথ্য</th>
                                </tr>
                                <tr>
                                    <th>পিতার নাম (বাংলা ও ইংরেজি)</th>
                                    <td>${fatherBn} ${fatherEn ? `(${fatherEn})` : ''}</td>
                                    <th>পিতার পেশা ও মোবাইল</th>
                                    <td>${fatherJob} | <strong>${fatherPhone}</strong></td>
                                </tr>
                                <tr>
                                    <th>পিতার NID নম্বর</th>
                                    <td>${fatherNid}</td>
                                    <th>পারিবারিক মাসিক আয়</th>
                                    <td>${familyIncome}</td>
                                </tr>
                                <tr>
                                    <th>মাতার নাম (বাংলা ও ইংরেজি)</th>
                                    <td>${motherBn} ${motherEn ? `(${motherEn})` : ''}</td>
                                    <th>মাতার পেশা ও মোবাইল</th>
                                    <td>${motherJob} | ${motherPhone}</td>
                                </tr>
                                <tr>
                                    <th>মাতার NID নম্বর</th>
                                    <td>${motherNid}</td>
                                    <th>আইনগত অভিভাবক</th>
                                    <td>${guardianType} (${guardianRelation})</td>
                                </tr>
                                <tr>
                                    <th>অভিভাবকের নাম ও NID</th>
                                    <td>${guardianName} (NID: ${guardianNid})</td>
                                    <th>জরুরি যোগাযোগ ও ইমেইল</th>
                                    <td><strong style="color: #0052ff;">${guardianPhone}</strong> ${guardianEmail !== '-' ? `| ${guardianEmail}` : ''}</td>
                                </tr>
                            </table>

                            <!-- 4. ADDRESS DETAILS -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-map-location-dot"></i> ৪. বর্তমান ও স্থায়ী ঠিকানা</th>
                                </tr>
                                <tr>
                                    <th>বর্তমান ঠিকানা</th>
                                    <td colspan="3">${fullPresAddress}</td>
                                </tr>
                                <tr>
                                    <th>স্থায়ী ঠিকানা</th>
                                    <td colspan="3">${fullPermAddress}</td>
                                </tr>
                            </table>

                            <!-- 5. PREVIOUS SCHOOL DETAILS -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-award"></i> ৫. পূর্ববর্তী বিদ্যালয়ের তথ্য</th>
                                </tr>
                                <tr>
                                    <th>পূর্ববর্তী বিদ্যালয়ের নাম</th>
                                    <td>${prevSchool}</td>
                                    <th>শ্রেণি ও রোল</th>
                                    <td>${prevClassRoll}</td>
                                </tr>
                                <tr>
                                    <th>পাশের সন ও ফলাফল</th>
                                    <td>${prevYear} (জিপিএ/গ্রেড: ${prevGpa})</td>
                                    <th>ছাড়পত্র (TC) নম্বর</th>
                                    <td>${prevTc}</td>
                                </tr>
                            </table>

                            <!-- APPLICANT UNDERTAKING -->
                            <div class="voucher-note-box">
                                <strong><i class="fa-solid fa-signature"></i> আবেদনকারীর অঙ্গীকারনামা:</strong> আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। ভবিষ্যতে কোনো তথ্য অসত্য বা ভুল প্রমাণিত হলে অত্র বিদ্যালয়ে আমার ভর্তি বাতিল বলে গণ্য হবে এবং কর্তৃপক্ষের যেকোনো সিদ্ধান্ত মেনে নিতে বাধ্য থাকব।
                            </div>

                            <!-- OFFICE SCRUTINY BOX -->
                            <div class="voucher-office-box">
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 2px; margin-bottom: 3px;">
                                    <strong style="color: #0f172a;"><i class="fa-solid fa-clipboard-check"></i> অফিস ব্যবহারের জন্য (যাচাইকরণ ও মূল্যায়ন):</strong>
                                    <span style="font-size: 0.66rem; color: #64748b;">ফরম ও কাগজপত্র স্ক্রুটিনি</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; gap: 6px; flex-wrap: wrap; margin-bottom: 2px;">
                                    <span>কাগজপত্র: [ ] জন্ম সনদ [ ] পিতা-মাতার NID [ ] ২ কপি ছবি [ ] মার্কশীট/TC</span>
                                    <span>ভর্তির ফলাফল: [ ] অনুমোদিত [ ] অপেক্ষমাণ [ ] বাতিল</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                                    <span>ভর্তি পরীক্ষার প্রাপ্ত নম্বর: ____________</span>
                                    <span>মেধাক্রম: ____________</span>
                                    <span>বরাদ্দকৃত রোল: ____________</span>
                                    <span>শাখা/সেকশন: ____________</span>
                                </div>
                            </div>

                            <!-- SIGNATURES (PAGE 1) -->
                            <div class="voucher-signature-grid">
                                <div class="voucher-signature-box">
                                    শিক্ষার্থীর স্বাক্ষর ও তারিখ
                                </div>
                                <div class="voucher-signature-box">
                                    অভিভাবকের স্বাক্ষর ও তারিখ
                                </div>
                                <div class="voucher-signature-box">
                                    যাচাইকারী কর্মকর্তার স্বাক্ষর
                                </div>
                                <div class="voucher-signature-box">
                                    প্রধান শিক্ষকের স্বাক্ষর ও সীল
                                </div>
                            </div>
                        </div>
                    </div>



                    <!-- ========================================================
                         PAGE 2: শিক্ষার্থী কপি (STUDENT / APPLICANT COPY)
                         ======================================================== -->
                    <div class="admission-page-wrapper page-2">
                        <div class="admission-a4-page">
                            <!-- HEADER: 3-COLUMNS (Left Logo | Center Info | Right Photo) -->
                            <div class="voucher-header" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; gap: 10px !important; padding-bottom: 6px !important; border-bottom: 2px solid #0f172a !important; margin-bottom: 6px !important; width: 100% !important;">
                                <!-- Left Side: Updated School Logo (Red Arrow Left Spot) -->
                                <div class="voucher-header-left" style="flex: 0 0 76px !important; width: 76px !important; text-align: left !important; display: flex !important; align-items: center !important; justify-content: flex-start !important;">
                                    <img class="voucher-school-logo-img" src="${schoolLogo}" onerror="this.src='school_logo.svg'" style="width: 70px !important; height: 70px !important; object-fit: contain !important; display: block !important;" alt="School Logo">
                                </div>
                                <!-- Center: School Information -->
                                <div class="voucher-school-info voucher-header-center" style="flex: 1 1 auto !important; text-align: center !important; padding: 0 6px !important;">
                                    <h2 style="font-size: 1.20rem; color: #0f172a; font-weight: 800; margin: 0 0 2px 0; line-height: 1.18;">${schoolBn}</h2>
                                    <h4 style="font-size: 0.80rem; color: #475569; font-weight: 600; margin: 0 0 2px 0;">${schoolEn}</h4>
                                    <p style="font-size: 0.70rem; color: #64748b; margin: 0; line-height: 1.25;"><i class="fa-solid fa-location-dot"></i> ${schoolAddr} | <i class="fa-solid fa-phone"></i> ${schoolPhone} | EIIN: <strong>${schoolEiin}</strong> | কোড: <strong>${schoolCode}</strong></p>
                                </div>
                                <!-- Right Side: Student Photo (Red Arrow Right Spot) -->
                                <div class="voucher-header-right" style="flex: 0 0 80px !important; width: 80px !important; display: flex !important; align-items: center !important; justify-content: flex-end !important; text-align: right !important;">
                                    ${photoHtml}
                                </div>
                            </div>

                            <!-- TITLE BANNER & COPY STRIP -->
                            <div class="voucher-banner-strip">
                                <span><i class="fa-solid fa-graduation-cap"></i> অনলাইন ভর্তি আবেদনপত্র ও ট্র্যাকিং রসিদ — শিক্ষাবর্ষ ${session}</span>
                                <span class="voucher-copy-badge student">👨‍🎓 শিক্ষার্থী কপি (Student Copy)</span>
                            </div>

                            <!-- APPLICATION SUMMARY BAR -->
                            <div class="voucher-summary-grid">
                                <div class="voucher-summary-item">
                                    <span>ট্র্যাকিং আইডি (Tracking ID):</span>
                                    <strong style="color: #0052ff; font-size: 0.95rem; letter-spacing: 0.5px;">${trackingId}</strong>
                                </div>
                                <div class="voucher-summary-item">
                                    <span>আবেদনের তারিখ:</span>
                                    <strong>${formattedDate}</strong>
                                </div>
                                <div class="voucher-summary-item">
                                    <span>ভর্তি ইচ্ছুক শ্রেণি:</span>
                                    <strong style="color: #0052ff;">${targetClass}</strong>
                                </div>
                                <div class="voucher-summary-item">
                                    <span>আবেদনের অবস্থা:</span>
                                    <span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 700; display: inline-block; width: fit-content;">
                                        <i class="fa-solid fa-circle-check"></i> দাখিলকৃত (Submitted)
                                    </span>
                                </div>
                            </div>

                            <!-- 1. ACADEMIC & BASIC DETAILS -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-graduation-cap"></i> ১. প্রাতিষ্ঠানিক ও ভর্তি সংক্রান্ত তথ্য</th>
                                </tr>
                                <tr>
                                    <th>ভর্তি ইচ্ছুক শ্রেণি</th>
                                    <td><strong>${targetClass}</strong></td>
                                    <th>শিক্ষাবর্ষ ও মাধ্যম</th>
                                    <td><strong>${session}</strong> (${medium})</td>
                                </tr>
                                <tr>
                                    <th>বিভাগ / গ্রুপ</th>
                                    <td>${displayGroup}</td>
                                    <th>অপশনাল বিষয়</th>
                                    <td><strong>${displayOptional}</strong></td>
                                </tr>
                                <tr>
                                    <th>শিক্ষার্থীর নাম (বাংলা)</th>
                                    <td><strong>${nameBn}</strong></td>
                                    <th>নাম (ইংরেজি)</th>
                                    <td><strong>${nameEn}</strong></td>
                                </tr>
                                <tr>
                                    <th>জন্ম নিবন্ধন নম্বর (BRN)</th>
                                    <td><strong style="color: #0052ff;">${birthReg}</strong></td>
                                    <th>জন্ম তারিখ</th>
                                    <td>${dob}</td>
                                </tr>
                                <tr>
                                    <th>লিঙ্গ ও ধর্ম</th>
                                    <td>${gender} | ${religion}</td>
                                    <th>রক্তের গ্রুপ ও কোটা</th>
                                    <td>${bloodGroup} | ${quota}</td>
                                </tr>
                            </table>

                            <!-- 2. PARENTS & GUARDIAN DETAILS -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-people-roof"></i> ২. অভিভাবকের তথ্য</th>
                                </tr>
                                <tr>
                                    <th>পিতার নাম ও পেশা</th>
                                    <td>${fatherBn} (${fatherJob})</td>
                                    <th>পিতার মোবাইল নম্বর</th>
                                    <td><strong>${fatherPhone}</strong></td>
                                </tr>
                                <tr>
                                    <th>মাতার নাম ও পেশা</th>
                                    <td>${motherBn} (${motherJob})</td>
                                    <th>মাতার মোবাইল নম্বর</th>
                                    <td>${motherPhone}</td>
                                </tr>
                                <tr>
                                    <th>আইনগত অভিভাবক</th>
                                    <td>${guardianName} (${guardianRelation})</td>
                                    <th>জরুরি যোগাযোগের মোবাইল</th>
                                    <td><strong style="color: #0052ff;">${guardianPhone}</strong></td>
                                </tr>
                            </table>

                            <!-- 3. ADDRESS DETAILS -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-map-location-dot"></i> ৩. শিক্ষার্থীর ঠিকানা</th>
                                </tr>
                                <tr>
                                    <th>বর্তমান ঠিকানা</th>
                                    <td colspan="3">${fullPresAddress}</td>
                                </tr>
                                <tr>
                                    <th>স্থায়ী ঠিকানা</th>
                                    <td colspan="3">${fullPermAddress}</td>
                                </tr>
                            </table>

                            <!-- 4. PREVIOUS SCHOOL (IF ANY) -->
                            <table class="voucher-table">
                                <tr>
                                    <th colspan="4" class="section-th"><i class="fa-solid fa-award"></i> ৪. পূর্ববর্তী বিদ্যালয়ের তথ্য</th>
                                </tr>
                                <tr>
                                    <th>পূর্ববর্তী বিদ্যালয়ের নাম</th>
                                    <td>${prevSchool}</td>
                                    <th>শ্রেণি, রোল ও পাশের সন</th>
                                    <td>${prevClassRoll} | সন: ${prevYear} (জিপিএ: ${prevGpa})</td>
                                </tr>
                            </table>

                            <!-- STUDENT INSTRUCTIONS -->
                            <div class="voucher-note-box">
                                <strong><i class="fa-solid fa-triangle-exclamation"></i> ভর্তিচ্ছু শিক্ষার্থী ও অভিভাবকের জন্য নির্দেশনাবলী:</strong>
                                <ul style="margin: 2px 0 0 16px; padding: 0;">
                                    <li>১. এই কপিটি যত্নসহকারে সংরক্ষণ করুন এবং ভর্তি পরীক্ষা/মৌখিক সাক্ষাৎকারের সময় অবশ্যই সাথে নিয়ে আসুন।</li>
                                    <li>২. ভর্তির সময় মূল জন্ম সনদ, পিতা-মাতার এনআইডি, পূর্ববর্তী ক্লাসের মার্কশীট/টিসি ও ২ কপি পাসপোর্ট ছবি সাথে আনতে হবে।</li>
                                    <li>৩. ভর্তি সংক্রান্ত সকল তথ্যের জন্য ওয়েবসাইট ও হেল্পলাইনে যোগাযোগ করুন: <strong>${schoolPhone}</strong></li>
                                </ul>
                            </div>

                            <!-- MONEY RECEIPT & ACKNOWLEDGMENT BOX -->
                            <div class="voucher-receipt-box">
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #86efac; padding-bottom: 3px; margin-bottom: 4px;">
                                    <strong style="font-size: 0.80rem; color: #166534;"><i class="fa-solid fa-receipt"></i> ভর্তি আবেদন ফি / মানি রসিদ (অফিস প্রাপ্তিস্বীকার অংশ):</strong>
                                    <span style="font-size: 0.70rem; color: #15803d;">ট্র্যাকিং আইডি: <strong>${trackingId}</strong></span>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; font-size: 0.72rem;">
                                    <div>আবেদন ট্র্যাকিং নম্বর: <strong style="color: #0052ff;">${trackingId}</strong></div>
                                    <div>মানি রসিদ ক্রমিক নং: ____________________</div>
                                    <div>আবেদন ও ফরম ফি বাবদ প্রাপ্ত: ______________ টাকা</div>
                                    <div>কথায়: ___________________________________</div>
                                    <div>ফি গ্রহণের তারিখ: _____________________</div>
                                    <div>গ্রহণকারী কর্মকর্তার স্বাক্ষর ও সীল: _________________</div>
                                </div>
                            </div>

                            <!-- SIGNATURES (PAGE 2) -->
                            <div class="voucher-signature-grid">
                                <div class="voucher-signature-box">
                                    শিক্ষার্থীর স্বাক্ষর ও তারিখ
                                </div>
                                <div class="voucher-signature-box">
                                    অভিভাবকের স্বাক্ষর ও তারিখ
                                </div>
                                <div class="voucher-signature-box">
                                    হিসাব রক্ষক / ফি গ্রহণকারীর স্বাক্ষর
                                </div>
                                <div class="voucher-signature-box">
                                    প্রধান শিক্ষকের স্বাক্ষর ও সীল
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            `;
        }

        // Render Voucher into Area
        function renderAdmissionVoucher(record) {
            const voucherArea = document.getElementById('admissionVoucherPrintArea');
            if (voucherArea) {
                voucherArea.innerHTML = buildAdmissionVoucherHtml(record);
            }
        }

        // Search & Retrieve Saved Application
        function handleAdmissionSearch() {
            const qEl = document.getElementById('admSearchQuery');
            const query = qEl ? qEl.value.trim().toLowerCase() : '';
            const msgEl = document.getElementById('admSearchMessage');

            if (!query) {
                if (msgEl) msgEl.innerHTML = '<span style="color: #fca5a5;"><i class="fa-solid fa-triangle-exclamation"></i> অনুগ্রহ করে ট্র্যাকিং আইডি, মোবাইল নম্বর বা জন্ম নিবন্ধন নম্বর লিখুন।</span>';
                return;
            }

            let apps = [];
            try {
                apps = JSON.parse(localStorage.getItem('school_admission_applications') || '[]');
            } catch(e) {}

            const found = apps.find(a => {
                const tId = (a.trackingId || '').toLowerCase();
                const bReg = (a.student && a.student.birthReg || '').toLowerCase();
                const fPhone = (a.parents && a.parents.fatherPhone || '').toLowerCase();
                const gPhone = (a.guardian && a.guardian.phone || '').toLowerCase();
                const sNameBn = (a.student && a.student.nameBn || '').toLowerCase();
                const sNameEn = (a.student && a.student.nameEn || '').toLowerCase();
                return tId.includes(query) || bReg.includes(query) || fPhone.includes(query) || gPhone.includes(query) || sNameBn.includes(query) || sNameEn.includes(query);
            });

            if (found) {
                if (msgEl) msgEl.innerHTML = `<span style="color: #86efac;"><i class="fa-solid fa-circle-check"></i> আবেদনপত্র পাওয়া গেছে: <strong>${found.trackingId}</strong> (${found.student?.nameBn || ''})</span>`;
                renderAdmissionVoucher(found);
                switchAdmissionTab('receipt');
            } else {
                if (msgEl) msgEl.innerHTML = '<span style="color: #fca5a5;"><i class="fa-solid fa-circle-xmark"></i> কোনো আবেদনপত্র পাওয়া যায়নি। নম্বরটি সঠিক কিনা যাচাই করুন অথবা নতুন আবেদন ফরম পূরণ করুন।</span>';
            }
        }

        // Load Latest Saved Application or Sample Preview
        function loadLatestAdmissionApplication(showReceipt = true) {
            const msgEl = document.getElementById('admSearchMessage');
            let apps = [];
            try {
                apps = JSON.parse(localStorage.getItem('school_admission_applications') || '[]');
            } catch(e) {}

            if (apps && apps.length > 0) {
                const latest = apps[0];
                renderAdmissionVoucher(latest);
                if (msgEl) msgEl.innerHTML = `<span style="color: #86efac;"><i class="fa-solid fa-circle-check"></i> সর্বশেষ আবেদন: <strong>${latest.trackingId}</strong> (${latest.student?.nameBn || ''}) প্রস্তুত করা হয়েছে।</span>`;
                if (showReceipt) {
                    switchAdmissionTab('receipt');
                }
            } else {
                const sampleRecord = getSampleAdmissionRecord();
                renderAdmissionVoucher(sampleRecord);
                if (msgEl) msgEl.innerHTML = `<span style="color: #38bdf8;"><i class="fa-solid fa-circle-info"></i> ডেমো প্রিভিউ প্রস্তুত রয়েছে।</span>`;
                if (showReceipt) {
                    switchAdmissionTab('receipt');
                }
            }
        }

        // Handle Admission Form Submission
        function handleAdmissionSubmit(e) {
            if (e && e.preventDefault) e.preventDefault();

            // 1. Collect Form Data
            const targetClassSelect = document.getElementById('admTargetClass');
            const targetClassRaw = targetClassSelect ? targetClassSelect.value : '';
            const targetClass = formatClassDisplayName(targetClassRaw) || targetClassRaw;
            const session = document.getElementById('admSession') ? document.getElementById('admSession').value : '2026';
            const shift = document.getElementById('admShift') ? document.getElementById('admShift').value : '';
            const group = document.getElementById('admGroup') ? document.getElementById('admGroup').value : 'সাধারণ';
            const optionalSubject = document.getElementById('admOptionalSubject') ? document.getElementById('admOptionalSubject').value : '';
            const medium = document.getElementById('admMedium') ? document.getElementById('admMedium').value : 'বাংলা মাধ্যম';
            const appType = document.getElementById('admAppType') ? document.getElementById('admAppType').value : 'নতুন ভর্তি';

            const nameBnEl = document.getElementById('admNameBn');
            const nameBn = nameBnEl ? nameBnEl.value.trim() : '';
            const nameEn = document.getElementById('admNameEn') ? document.getElementById('admNameEn').value.trim().toUpperCase() : '';
            const birthRegEl = document.getElementById('admBirthReg');
            const birthReg = birthRegEl ? birthRegEl.value.trim() : '';
            const dobEl = document.getElementById('admDob');
            const dob = dobEl ? dobEl.value : '';
            const gender = document.getElementById('admGender') ? document.getElementById('admGender').value : 'ছাত্র';
            const religion = document.getElementById('admReligion') ? document.getElementById('admReligion').value : 'ইসলাম';
            const bloodGroup = document.getElementById('admBloodGroup') ? document.getElementById('admBloodGroup').value : 'জানা নেই';
            const nationality = document.getElementById('admNationality') ? document.getElementById('admNationality').value : 'বাংলাদেশী';
            const disability = document.getElementById('admDisability') ? document.getElementById('admDisability').value : 'প্রযোজ্য নয়';

            const fatherBn = document.getElementById('admFatherBn') ? document.getElementById('admFatherBn').value.trim() : '';
            const fatherEn = document.getElementById('admFatherEn') ? document.getElementById('admFatherEn').value.trim().toUpperCase() : '';
            const fatherNid = document.getElementById('admFatherNid') ? document.getElementById('admFatherNid').value.trim() : '-';
            const fatherJob = document.getElementById('admFatherJob') ? document.getElementById('admFatherJob').value : '-';
            const fatherPhone = document.getElementById('admFatherPhone') ? document.getElementById('admFatherPhone').value.trim() : '';

            const motherBn = document.getElementById('admMotherBn') ? document.getElementById('admMotherBn').value.trim() : '';
            const motherEn = document.getElementById('admMotherEn') ? document.getElementById('admMotherEn').value.trim().toUpperCase() : '';
            const motherNid = document.getElementById('admMotherNid') ? document.getElementById('admMotherNid').value.trim() : '-';
            const motherJob = document.getElementById('admMotherJob') ? document.getElementById('admMotherJob').value : '-';
            const motherPhone = document.getElementById('admMotherPhone') ? document.getElementById('admMotherPhone').value.trim() : '-';
            const familyIncome = document.getElementById('admFamilyIncome') ? document.getElementById('admFamilyIncome').value : '-';

            const guardianType = document.getElementById('admGuardianType') ? document.getElementById('admGuardianType').value : 'Father';
            const guardianName = document.getElementById('admGuardianName') ? document.getElementById('admGuardianName').value.trim() : (fatherBn || nameBn);
            const guardianRelation = document.getElementById('admGuardianRelation') ? document.getElementById('admGuardianRelation').value.trim() : 'পিতা';
            const guardianNid = document.getElementById('admGuardianNid') ? document.getElementById('admGuardianNid').value.trim() : fatherNid;
            const guardianPhone = document.getElementById('admGuardianPhone') ? document.getElementById('admGuardianPhone').value.trim() : fatherPhone;
            const guardianEmail = document.getElementById('admGuardianEmail') ? document.getElementById('admGuardianEmail').value.trim() : '-';

            // Hierarchical Address Extraction
            const presDivision = document.getElementById('admPresDivision') ? document.getElementById('admPresDivision').value : '';
            const presDistrict = document.getElementById('admPresDistrict') ? document.getElementById('admPresDistrict').value : '';
            const presUpazila = document.getElementById('admPresUpazila') ? document.getElementById('admPresUpazila').value : '';
            const presUnion = document.getElementById('admPresUnion') ? document.getElementById('admPresUnion').value : '';
            const presPost = document.getElementById('admPresPost') ? document.getElementById('admPresPost').value : '';
            const presVillage = document.getElementById('admPresVillage') ? document.getElementById('admPresVillage').value.trim() : '';

            const permDivision = document.getElementById('admPermDivision') ? document.getElementById('admPermDivision').value : presDivision;
            const permDistrict = document.getElementById('admPermDistrict') ? document.getElementById('admPermDistrict').value : presDistrict;
            const permUpazila = document.getElementById('admPermUpazila') ? document.getElementById('admPermUpazila').value : presUpazila;
            const permUnion = document.getElementById('admPermUnion') ? document.getElementById('admPermUnion').value : presUnion;
            const permPost = document.getElementById('admPermPost') ? document.getElementById('admPermPost').value : presPost;
            const permVillage = document.getElementById('admPermVillage') ? document.getElementById('admPermVillage').value.trim() : presVillage;

            const fullPresAddress = [presVillage, presPost, presUnion, presUpazila, presDistrict, presDivision ? (presDivision + ' বিভাগ') : ''].filter(Boolean).join(', ') || '-';
            const fullPermAddress = [permVillage, permPost, permUnion, permUpazila, permDistrict, permDivision ? (permDivision + ' বিভাগ') : ''].filter(Boolean).join(', ') || '-';

            const prevSchool = document.getElementById('admPrevSchool') ? document.getElementById('admPrevSchool').value.trim() : '-';
            const prevClassRoll = document.getElementById('admPrevClassRoll') ? document.getElementById('admPrevClassRoll').value.trim() : '-';
            const prevYear = document.getElementById('admPrevYear') ? document.getElementById('admPrevYear').value.trim() : '-';
            const prevGpa = document.getElementById('admPrevGpa') ? document.getElementById('admPrevGpa').value.trim() : '-';
            const prevTc = document.getElementById('admPrevTc') ? document.getElementById('admPrevTc').value.trim() : '-';

            const quota = document.getElementById('admQuota') ? document.getElementById('admQuota').value : 'সাধারণ';
            const extracurricular = document.getElementById('admExtracurricular') ? document.getElementById('admExtracurricular').value.trim() : '-';

            // Smart Validation with Friendly User Feedback
            if (!targetClassRaw) {
                alert('অনুগ্রহ করে ভর্তি ইচ্ছুক শ্রেণি নির্বাচন করুন।');
                if (targetClassSelect) {
                    targetClassSelect.focus();
                    targetClassSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return false;
            }
            if (!nameBn) {
                alert('অনুগ্রহ করে শিক্ষার্থীর নাম (বাংলায়) লিখুন।');
                if (nameBnEl) {
                    nameBnEl.focus();
                    nameBnEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return false;
            }
            const agreeChk = document.getElementById('admAgreementCheckbox');
            if (agreeChk && !agreeChk.checked) {
                alert('অনুগ্রহ করে ফরমের নিচের অঙ্গীকারনামায় টিক চিহ্ন দিন (সম্মত হন)।');
                agreeChk.focus();
                agreeChk.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return false;
            }

            const isClass9or10 = isClassNineOrTenMatch(targetClassRaw);
            const displayGroup = isClass9or10 ? (formatGroupDisplayName(group) || group || 'সাধারণ') : 'প্রযোজ্য নয়';
            const displayOptional = isClass9or10 ? (optionalSubject || 'প্রযোজ্য নয়') : 'প্রযোজ্য নয়';

            // Generate Tracking ID & Submission Timestamp (Format: 260212001)
            const now = new Date();
            const trackingId = generateAdmissionTrackingId(session, now);
            const submitDate = now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
            const submitTime = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

            // Construct Application Record Object
            const applicationRecord = {
                id: 'APP-' + Date.now(),
                trackingId: trackingId,
                submittedAt: now.toISOString(),
                formattedDate: submitDate + ', ' + submitTime,
                targetClass: targetClass,
                session: session,
                shift: shift || 'দিবা শাখা',
                group: displayGroup,
                optionalSubject: displayOptional,
                medium: medium,
                appType: appType,
                photo: admissionPhotoDataUrl || '',
                student: {
                    nameBn: nameBn,
                    nameEn: nameEn || nameBn,
                    birthReg: birthReg || '-',
                    dob: dob || '-',
                    gender: gender,
                    religion: religion,
                    bloodGroup: bloodGroup,
                    nationality: nationality,
                    disability: disability
                },
                parents: {
                    fatherBn: fatherBn || '-',
                    fatherEn: fatherEn,
                    fatherNid: fatherNid,
                    fatherJob: fatherJob,
                    fatherPhone: fatherPhone || guardianPhone || '-',
                    motherBn: motherBn || '-',
                    motherEn: motherEn,
                    motherNid: motherNid,
                    motherJob: motherJob,
                    motherPhone: motherPhone,
                    familyIncome: familyIncome
                },
                guardian: {
                    type: guardianType,
                    name: guardianName || fatherBn || nameBn,
                    relation: guardianRelation,
                    nid: guardianNid,
                    phone: guardianPhone || fatherPhone || '-',
                    email: guardianEmail
                },
                address: {
                    present: fullPresAddress,
                    permanent: fullPermAddress
                },
                previous: {
                    school: prevSchool,
                    classRoll: prevClassRoll,
                    year: prevYear,
                    gpa: prevGpa,
                    tc: prevTc
                },
                quota: quota,
                extracurricular: extracurricular,
                status: 'Submitted'
            };

            // Save to localStorage and backend database for persistent tracking & ERP sync
            try {
                const existingApps = JSON.parse(localStorage.getItem('school_admission_applications') || '[]');
                existingApps.unshift(applicationRecord);
                const updatedStr = JSON.stringify(existingApps);
                localStorage.setItem('school_admission_applications', updatedStr);

                // Push to server SQLite database
                if (typeof fetch === 'function') {
                    fetch('/api/db/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            key: 'school_admission_applications',
                            value: updatedStr
                        })
                    }).catch(err => {
                        console.warn('Could not sync admission application to server:', err);
                    });
                }

                // Cross-tab real-time broadcast
                if (window.BroadcastChannel) {
                    try {
                        const bc = new BroadcastChannel('school_realtime_db_channel');
                        bc.postMessage({ type: 'set', key: 'school_admission_applications', value: updatedStr, ver: Date.now() });
                        bc.close();
                    } catch (e) {}
                }
            } catch (err) {
                console.warn('Could not save application to localStorage:', err);
            }

            // Render Voucher & Switch to Printable Receipt View
            renderAdmissionVoucher(applicationRecord);
            switchAdmissionTab('receipt');

            // Clear form for fresh new input if user wants to create another
            clearAdmissionForm();

            return false;
        }

        // Print handler for admission form and receipt
        function printAdmissionApplication() {
            const latestLogo = getLatestSchoolLogo();
            const logoImgs = document.querySelectorAll('#admissionVoucherPrintArea .voucher-school-logo-img');
            logoImgs.forEach(img => {
                if (img && latestLogo) {
                    img.src = latestLogo;
                }
            });
            window.print();
        }

        // --- RESULT SEARCH MODAL HANDLERS ---
        function openResultSearchModal() {
            document.getElementById('resultModalOverlay').classList.add('active');
        }

        function closeResultSearchModal() {
            document.getElementById('resultModalOverlay').classList.remove('active');
        }

        function handleQuickResultSearch(e) {
            e.preventDefault();
            const cls = document.getElementById('quickResultClass').value;
            const exam = document.getElementById('quickResultExam').value;
            const roll = document.getElementById('quickResultRoll').value;
            window.location.href = `result-portal.html?class=${cls}&exam=${encodeURIComponent(exam)}&roll=${roll}`;
        }

        // --- CONTACT INQUIRY SUBMIT ---
        function handleContactSubmit(e) {
            e.preventDefault();
            alert("ধন্যবাদ! আপনার বার্তাটি আমাদের কাছে পৌঁছেছে। দ্রুত যোগাযোগ করা হবে।");
            document.getElementById('contactInquiryForm').reset();
        }

        // --- MOBILE NAV TOGGLE ---
        function toggleMobileNav() {
            const d = document.getElementById('mobileDrawer');
            if (d.style.display === 'none' || !d.style.display) {
                d.style.display = 'block';
            } else {
                d.style.display = 'none';
            }
        }

        // --- SCROLL TO TOP & NAVBAR SHADOW ---
        window.addEventListener('scroll', () => {
            const btn = document.getElementById('scrollTopBtn');
            const nav = document.getElementById('headerNavbar');
            if (window.scrollY > 300) {
                if (btn) btn.classList.add('visible');
                if (nav) nav.classList.add('scrolled');
            } else {
                if (btn) btn.classList.remove('visible');
                if (nav) nav.classList.remove('scrolled');
            }
        });

        // --- 12. CMS LOGIN & ERP AUTHENTICATION SYSTEM ---
        function openCmsLoginModal(noticeMessage = '') {
            const modal = document.getElementById('cmsLoginModalOverlay');
            if (!modal) return;

            // Reset views
            const loginContainer = document.getElementById('cmsLoginViewContainer');
            const forgotContainer = document.getElementById('cmsForgotContainer');
            if (loginContainer) loginContainer.style.display = 'block';
            if (forgotContainer) forgotContainer.style.display = 'none';

            if (passwordRecoveryState && passwordRecoveryState.timerInterval) {
                clearInterval(passwordRecoveryState.timerInterval);
            }

            const errEl = document.getElementById('cmsLoginError');
            const succEl = document.getElementById('cmsLoginSuccess');
            const noticeBox = document.getElementById('cmsLoginNoticeBox');
            const noticeMsg = document.getElementById('cmsLoginNoticeMsg');

            if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
            if (succEl) { succEl.style.display = 'none'; succEl.textContent = ''; }
            const submitBtn = document.getElementById('cmsLoginSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.background = 'linear-gradient(135deg, #0052ff 0%, #0284c7 100%)';
                submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> লগইন`;
            }

            if (noticeMessage && noticeBox && noticeMsg) {
                noticeMsg.textContent = noticeMessage;
                noticeBox.style.display = 'block';
            } else if (noticeBox) {
                noticeBox.style.display = 'none';
            }

            modal.classList.add('active');
            setTimeout(() => {
                const uInput = document.getElementById('cmsLoginUserId');
                if (uInput) uInput.focus();
            }, 100);
        }

        function closeCmsLoginModal() {
            const modal = document.getElementById('cmsLoginModalOverlay');
            if (modal) modal.classList.remove('active');
            if (passwordRecoveryState && passwordRecoveryState.timerInterval) {
                clearInterval(passwordRecoveryState.timerInterval);
            }
        }

        function toggleCmsPasswordVis() {
            const pInput = document.getElementById('cmsLoginPassword');
            const icon = document.getElementById('cmsPassToggleIcon');
            if (!pInput || !icon) return;

            if (pInput.type === 'password') {
                pInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                pInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        // --- 13. PASSWORD RECOVERY (পাসওয়ার্ড পুনরুদ্ধার) SYSTEM ---
        let passwordRecoveryState = {
            userId: '',
            targetUser: null,
            isMasterAdmin: false,
            matchedStaff: null,
            mobile: '',
            otp: '',
            expiresAt: 0,
            timerInterval: null
        };

        function maskPhoneNumber(phone) {
            if (!phone) return 'মোবাইল নম্বর';
            const clean = String(phone).replace(/[^0-9]/g, '');
            if (clean.length < 6) return phone;
            const prefix = clean.substring(0, 3);
            const suffix = clean.substring(clean.length - 3);
            return `${prefix}****${suffix}`;
        }

        function showForgotError(msg) {
            const errEl = document.getElementById('cmsForgotError');
            const succEl = document.getElementById('cmsForgotSuccess');
            if (succEl) succEl.style.display = 'none';
            if (errEl) {
                errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="margin-right: 6px;"></i> ${msg}`;
                errEl.style.display = 'block';
            }
        }

        function showForgotSuccess(msg) {
            const errEl = document.getElementById('cmsForgotError');
            const succEl = document.getElementById('cmsForgotSuccess');
            if (errEl) errEl.style.display = 'none';
            if (succEl) {
                succEl.innerHTML = `<i class="fa-solid fa-circle-check" style="margin-right: 6px;"></i> ${msg}`;
                succEl.style.display = 'block';
            }
        }

        function hideForgotAlerts() {
            const errEl = document.getElementById('cmsForgotError');
            const succEl = document.getElementById('cmsForgotSuccess');
            if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
            if (succEl) { succEl.style.display = 'none'; succEl.textContent = ''; }
        }

        function openPasswordRecoveryStep1() {
            if (passwordRecoveryState.timerInterval) {
                clearInterval(passwordRecoveryState.timerInterval);
            }
            hideForgotAlerts();

            const loginContainer = document.getElementById('cmsLoginViewContainer');
            const forgotContainer = document.getElementById('cmsForgotContainer');
            const step1 = document.getElementById('cmsForgotStep1');
            const step2 = document.getElementById('cmsForgotStep2');
            const step3 = document.getElementById('cmsForgotStep3');

            if (loginContainer) loginContainer.style.display = 'none';
            if (forgotContainer) forgotContainer.style.display = 'block';
            if (step1) step1.style.display = 'block';
            if (step2) step2.style.display = 'none';
            if (step3) step3.style.display = 'none';

            const loginUserId = document.getElementById('cmsLoginUserId')?.value || '';
            const forgotUserInput = document.getElementById('forgotUserIdInput');
            if (forgotUserInput) {
                if (loginUserId) forgotUserInput.value = loginUserId;
                setTimeout(() => forgotUserInput.focus(), 150);
            }
        }

        function backToLoginForm() {
            if (passwordRecoveryState.timerInterval) {
                clearInterval(passwordRecoveryState.timerInterval);
            }
            hideForgotAlerts();

            const loginContainer = document.getElementById('cmsLoginViewContainer');
            const forgotContainer = document.getElementById('cmsForgotContainer');
            if (loginContainer) loginContainer.style.display = 'block';
            if (forgotContainer) forgotContainer.style.display = 'none';

            setTimeout(() => {
                const uInput = document.getElementById('cmsLoginUserId');
                if (uInput) uInput.focus();
            }, 100);
        }

        function startPasswordRecovery() {
            hideForgotAlerts();
            const rawInput = (document.getElementById('forgotUserIdInput')?.value || '').trim();
            if (!rawInput) {
                showForgotError("দয়া করে আপনার ইউজার আইডি বা মোবাইল নম্বর লিখুন।");
                return;
            }

            const cleanInput = rawInput.replace(/[^0-9a-zA-Z]/g, '');
            const hmPhone = (ERP_SETTINGS.headmasterPhone || ERP_SETTINGS.schoolPhone || '').replace(/[^0-9a-zA-Z]/g, '');
            const isMasterAdmin = (rawInput.toLowerCase() === 'admin') || (hmPhone && hmPhone.length >= 8 && cleanInput === hmPhone);

            const users = getStoreData('school_users', []) || [];
            const staffList = getStoreData('school_staff', []) || [];

            let targetUser = null;
            let targetStaff = null;
            let userMobile = '';
            let userName = '';

            if (isMasterAdmin) {
                userName = ERP_SETTINGS.headmasterName || 'প্রধান শিক্ষক / অ্যাডমিন';
                userMobile = ERP_SETTINGS.headmasterPhone || ERP_SETTINGS.schoolPhone || '01700000000';
            } else {
                targetUser = users.find(u => {
                    const uMob = (u.mobile || '').replace(/[^0-9a-zA-Z]/g, '');
                    const uName = (u.username || '').replace(/[^0-9a-zA-Z]/g, '');
                    return (uMob && uMob === cleanInput) || (uName && uName === cleanInput) || (u.mobile === rawInput);
                });

                if (targetUser) {
                    userName = targetUser.name || targetUser.username || 'ব্যবহারকারী';
                    userMobile = targetUser.mobile || '';
                } else {
                    targetStaff = staffList.find(s => {
                        const sMob = (s.mobile || '').replace(/[^0-9a-zA-Z]/g, '');
                        return (sMob && sMob === cleanInput) || (s.mobile === rawInput);
                    });
                    if (targetStaff) {
                        userName = targetStaff.name || 'শিক্ষক / স্টাফ';
                        userMobile = targetStaff.mobile || '';
                    }
                }
            }

            if (!isMasterAdmin && !targetUser && !targetStaff) {
                showForgotError("❌ উক্ত ইউজার আইডি বা মোবাইল নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক তথ্য দিন।");
                return;
            }

            if (!userMobile || userMobile.length < 8) {
                showForgotError("❌ এই অ্যাকাউন্টের সাথে কোনো বৈধ মোবাইল নম্বর পাওয়া যায়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।");
                return;
            }

            // Generate 4-digit OTP code (1000 - 9999)
            const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
            const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes validity

            passwordRecoveryState = {
                userId: rawInput,
                targetUser: targetUser,
                isMasterAdmin: isMasterAdmin,
                matchedStaff: targetStaff,
                mobile: userMobile,
                otp: otpCode,
                expiresAt: expiryTime,
                timerInterval: null
            };

            // Switch to Step 2
            const step1 = document.getElementById('cmsForgotStep1');
            const step2 = document.getElementById('cmsForgotStep2');
            const step3 = document.getElementById('cmsForgotStep3');
            if (step1) step1.style.display = 'none';
            if (step2) step2.style.display = 'block';
            if (step3) step3.style.display = 'none';

            const maskedPhoneEl = document.getElementById('forgotMaskedPhone');
            if (maskedPhoneEl) maskedPhoneEl.textContent = maskPhoneNumber(userMobile);

            const smsOtpDisplay = document.getElementById('smsOtpCodeDisplay');
            if (smsOtpDisplay) smsOtpDisplay.textContent = otpCode;

            const otpInput = document.getElementById('forgotOtpInput');
            if (otpInput) {
                otpInput.value = '';
                setTimeout(() => otpInput.focus(), 150);
            }

            const verifyBtn = document.getElementById('forgotVerifyOtpBtn');
            if (verifyBtn) verifyBtn.disabled = false;

            showForgotSuccess(`✅ ${maskPhoneNumber(userMobile)} নম্বরে ৪ ডিজিটের OTP পাঠানো হয়েছে।`);
            startOtpCountdown();
        }

        function startOtpCountdown() {
            if (passwordRecoveryState.timerInterval) {
                clearInterval(passwordRecoveryState.timerInterval);
            }

            function updateTimer() {
                const now = Date.now();
                const diff = Math.max(0, Math.floor((passwordRecoveryState.expiresAt - now) / 1000));
                const minutes = Math.floor(diff / 60);
                const seconds = diff % 60;
                const displayStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                const timerEl = document.getElementById('forgotOtpTimer');
                const verifyBtn = document.getElementById('forgotVerifyOtpBtn');

                if (timerEl) {
                    timerEl.textContent = displayStr;
                    if (diff < 60) {
                        timerEl.style.color = '#dc2626';
                    } else {
                        timerEl.style.color = '#0284c7';
                    }
                }

                if (diff <= 0) {
                    clearInterval(passwordRecoveryState.timerInterval);
                    if (timerEl) timerEl.textContent = "00:00 (মেয়াদ শেষ)";
                    if (verifyBtn) verifyBtn.disabled = true;
                    showForgotError("⏳ OTP কোডের ৫ মিনিট মেয়াদ শেষ হয়ে গেছে। 'পুনরায় কোড পাঠান' বাটনে ক্লিক করুন।");
                }
            }

            updateTimer();
            passwordRecoveryState.timerInterval = setInterval(updateTimer, 1000);
        }

        function resendForgotOtp() {
            if (!passwordRecoveryState.mobile) {
                showForgotError("কোনো সক্রিয় রিকোয়েস্ট পাওয়া যায়নি। অনুগ্রহ করে আবার শুরু করুন।");
                return;
            }

            const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            passwordRecoveryState.otp = newOtp;
            passwordRecoveryState.expiresAt = Date.now() + 5 * 60 * 1000;

            const verifyBtn = document.getElementById('forgotVerifyOtpBtn');
            if (verifyBtn) verifyBtn.disabled = false;

            const smsOtpDisplay = document.getElementById('smsOtpCodeDisplay');
            if (smsOtpDisplay) smsOtpDisplay.textContent = newOtp;

            const otpInput = document.getElementById('forgotOtpInput');
            if (otpInput) {
                otpInput.value = '';
                otpInput.focus();
            }

            hideForgotAlerts();
            showForgotSuccess("✅ আপনার মোবাইলে নতুন ৪ ডিজিটের OTP পাঠানো হয়েছে।");
            startOtpCountdown();
        }

        function verifyForgotOtp() {
            hideForgotAlerts();
            const inputOtp = (document.getElementById('forgotOtpInput')?.value || '').trim();

            if (!inputOtp || inputOtp.length !== 4) {
                showForgotError("দয়া করে সঠিক ৪ ডিজিটের OTP কোডটি লিখুন।");
                return;
            }

            if (Date.now() > passwordRecoveryState.expiresAt) {
                showForgotError("⏳ OTP কোডের ৫ মিনিট মেয়াদ শেষ হয়ে গেছে। 'পুনরায় কোড পাঠান' বাটনে ক্লিক করে নতুন কোড নিন।");
                return;
            }

            if (inputOtp !== passwordRecoveryState.otp) {
                showForgotError("❌ ভুল OTP কোড! SMS-এ প্রাপ্ত ৪ ডিজিটের কোডটি সঠিকভাবে প্রদান করুন।");
                return;
            }

            // OTP Verified Successfully!
            if (passwordRecoveryState.timerInterval) {
                clearInterval(passwordRecoveryState.timerInterval);
            }

            const step1 = document.getElementById('cmsForgotStep1');
            const step2 = document.getElementById('cmsForgotStep2');
            const step3 = document.getElementById('cmsForgotStep3');
            if (step1) step1.style.display = 'none';
            if (step2) step2.style.display = 'none';
            if (step3) step3.style.display = 'block';

            const userDisplay = document.getElementById('forgotUserNameDisplay');
            if (userDisplay) {
                const displayName = passwordRecoveryState.targetUser?.name ||
                    passwordRecoveryState.matchedStaff?.name ||
                    (passwordRecoveryState.isMasterAdmin ? 'প্রধান শিক্ষক / অ্যাডমিন' : 'ব্যবহারকারী');
                userDisplay.textContent = `${displayName} (${maskPhoneNumber(passwordRecoveryState.mobile)})`;
            }

            const newPassInput = document.getElementById('forgotNewPassword');
            const confPassInput = document.getElementById('forgotConfirmPassword');
            if (newPassInput) newPassInput.value = '';
            if (confPassInput) confPassInput.value = '';
            setTimeout(() => { if (newPassInput) newPassInput.focus(); }, 150);

            showForgotSuccess("✅ OTP সফলভাবে যাচাই হয়েছে! আপনার নতুন পাসওয়ার্ড সেট করুন।");
        }

        function toggleForgotNewPassVis(inputId, iconId) {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            if (!input || !icon) return;

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        function saveNewPasswordSubmit(e) {
            e.preventDefault();
            hideForgotAlerts();

            const newPass = (document.getElementById('forgotNewPassword')?.value || '').trim();
            const confPass = (document.getElementById('forgotConfirmPassword')?.value || '').trim();
            const saveBtn = document.getElementById('forgotSavePassBtn');

            if (!newPass || newPass.length < 4) {
                showForgotError("পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে।");
                return;
            }

            if (newPass !== confPass) {
                showForgotError("❌ উভয় পাসওয়ার্ড হুবহু এক হতে হবে! পুনরায় চেক করুন।");
                return;
            }

            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> পাসওয়ার্ড সংরক্ষণ হচ্ছে...`;
            }

            try {
                let users = getStoreData('school_users', []) || [];
                const staffList = getStoreData('school_staff', []) || [];

                if (passwordRecoveryState.isMasterAdmin) {
                    ERP_SETTINGS.adminPassword = newPass;
                    localStorage.setItem('school_settings', JSON.stringify(ERP_SETTINGS));
                    fetch('/api/db/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'school_settings', value: JSON.stringify(ERP_SETTINGS) })
                    }).catch(e => console.log(e));

                    let adminIdx = users.findIndex(u => u.role === 'admin' || (u.username || '').toLowerCase() === 'admin');
                    if (adminIdx !== -1) {
                        users[adminIdx].password = newPass;
                    }
                }

                if (passwordRecoveryState.targetUser) {
                    let userIdx = users.findIndex(u =>
                        (u.id && u.id === passwordRecoveryState.targetUser.id) ||
                        (u.mobile && u.mobile === passwordRecoveryState.targetUser.mobile) ||
                        (u.username && u.username === passwordRecoveryState.targetUser.username)
                    );
                    if (userIdx !== -1) {
                        users[userIdx].password = newPass;
                    } else {
                        passwordRecoveryState.targetUser.password = newPass;
                        users.push(passwordRecoveryState.targetUser);
                    }
                } else if (passwordRecoveryState.matchedStaff) {
                    const staff = passwordRecoveryState.matchedStaff;
                    let existingUserIdx = users.findIndex(u => (u.mobile && u.mobile === staff.mobile) || (u.staffId && u.staffId === staff.id));
                    if (existingUserIdx !== -1) {
                        users[existingUserIdx].password = newPass;
                    } else {
                        users.push({
                            id: 'user_' + Date.now(),
                            name: staff.name,
                            designation: staff.designation || 'শিক্ষক',
                            mobile: staff.mobile,
                            username: staff.mobile,
                            password: newPass,
                            role: 'teacher',
                            role_key: 'teacher',
                            status: 'active',
                            isApproved: true,
                            createdAt: new Date().toISOString()
                        });
                    }
                }

                // Save to localStorage & Server Sync
                localStorage.setItem('school_users', JSON.stringify(users));
                fetch('/api/db/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'school_users', value: JSON.stringify(users) })
                }).catch(e => console.log(e));

                showForgotSuccess("🎉 পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে! লগইন স্ক্রিনে নিয়ে যাওয়া হচ্ছে...");

                // Pre-fill login input
                const loginUserIdInput = document.getElementById('cmsLoginUserId');
                const loginPassInput = document.getElementById('cmsLoginPassword');
                if (loginUserIdInput) loginUserIdInput.value = passwordRecoveryState.userId || passwordRecoveryState.mobile;
                if (loginPassInput) loginPassInput.value = newPass;

                setTimeout(() => {
                    backToLoginForm();
                    const loginSuccess = document.getElementById('cmsLoginSuccess');
                    if (loginSuccess) {
                        loginSuccess.innerHTML = `<i class="fa-solid fa-circle-check"></i> ✅ পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন "লগইন" বাটনে ক্লিক করুন।`;
                        loginSuccess.style.display = 'block';
                    }
                    if (saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk" style="margin-right: 6px;"></i> পাসওয়ার্ড সংরক্ষণ করুন`;
                    }
                }, 1400);

            } catch (err) {
                console.error("Password reset error:", err);
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk" style="margin-right: 6px;"></i> পাসওয়ার্ড সংরক্ষণ করুন`;
                }
                showForgotError("পাসওয়ার্ড সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            }
        }

        function handleCmsLoginSubmit(e) {
            e.preventDefault();
            const userIdInput = (document.getElementById('cmsLoginUserId')?.value || '').trim();
            const passwordInput = (document.getElementById('cmsLoginPassword')?.value || '').trim();
            const errorEl = document.getElementById('cmsLoginError');
            const successEl = document.getElementById('cmsLoginSuccess');
            const submitBtn = document.getElementById('cmsLoginSubmitBtn');

            if (errorEl) errorEl.style.display = 'none';
            if (successEl) successEl.style.display = 'none';

            if (!userIdInput || !passwordInput) {
                if (errorEl) {
                    errorEl.textContent = "দয়া করে ইউজার আইডি এবং পাসওয়ার্ড প্রদান করুন!";
                    errorEl.style.display = 'block';
                }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> যাচাই করা হচ্ছে...`;
            }

            // Fixed Master Admin Credentials Check
            const cleanUserId = userIdInput.replace(/[^0-9a-zA-Z]/g, '');
            const hmPhone = (ERP_SETTINGS.headmasterPhone || ERP_SETTINGS.schoolPhone || '').replace(/[^0-9a-zA-Z]/g, '');
            const isMasterAdminId = (userIdInput.toLowerCase() === 'admin') || (hmPhone && hmPhone.length >= 8 && cleanUserId === hmPhone);

            if (isMasterAdminId && (
                passwordInput === (ERP_SETTINGS.adminPassword || '') ||
                passwordInput.toLowerCase() === 'admin' ||
                passwordInput === '12345' ||
                passwordInput === '123456' ||
                passwordInput === (ERP_SETTINGS.headmasterPhone || '')
            )) {
                const adminName = ERP_SETTINGS.headmasterName || "প্রধান শিক্ষক / অ্যাডমিন";
                loginSuccessRedirect(adminName, 'প্রধান শিক্ষক / অ্যাডমিন', 'admin', 'admin', ERP_SETTINGS.headmasterPhoto || '');
                return;
            }

            // Registered Staff & Users Directory Check
            const users = getStoreData('school_users', []) || [];
            const staffList = getStoreData('school_staff', []) || [];

            let matchedUser = users.find(u => {
                const uMob = (u.mobile || '').replace(/[^0-9a-zA-Z]/g, '');
                const uName = (u.username || '').replace(/[^0-9a-zA-Z]/g, '');
                return (uMob && uMob === cleanUserId) || (uName && uName === cleanUserId) || (u.mobile === userIdInput);
            });

            if (!matchedUser) {
                const matchedStaff = staffList.find(s => {
                    const sMob = (s.mobile || '').replace(/[^0-9a-zA-Z]/g, '');
                    return (sMob && sMob === cleanUserId) || (s.mobile === userIdInput);
                });
                if (matchedStaff) {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> ERP অ্যাকাউন্টে প্রবেশ করুন`;
                    }
                    if (errorEl) {
                        errorEl.textContent = "❌ আপনার শিক্ষক/স্টাফ প্রোফাইল সংরক্ষিত আছে, কিন্তু অ্যাকাউন্ট অনুমোদন করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।";
                        errorEl.style.display = 'block';
                    }
                    return;
                }
            }

            if (matchedUser) {
                if (matchedUser.isApproved === false || matchedUser.status === 'pending' || matchedUser.status === 'pending_approval') {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> ERP অ্যাকাউন্টে প্রবেশ করুন`;
                    }
                    if (errorEl) {
                        errorEl.textContent = "⏳ আপনার একাউন্টটি অনুমোদনের অপেক্ষায় রয়েছে (Pending Approval)।";
                        errorEl.style.display = 'block';
                    }
                    return;
                }

                if (matchedUser.status === 'inactive') {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> ERP অ্যাকাউন্টে প্রবেশ করুন`;
                    }
                    if (errorEl) {
                        errorEl.textContent = "❌ আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে। অ্যাডমিনের সাথে যোগাযোগ করুন।";
                        errorEl.style.display = 'block';
                    }
                    return;
                }

                const validPassword = matchedUser.password || matchedUser.mobile;
                if (passwordInput === validPassword || (matchedUser.mobile && passwordInput === matchedUser.mobile)) {
                    loginSuccessRedirect(
                        matchedUser.name,
                        matchedUser.designation || 'শিক্ষক',
                        matchedUser.role || 'teacher',
                        matchedUser.mobile || userIdInput,
                        matchedUser.photo || '',
                        matchedUser.permissions || []
                    );
                    return;
                }
            }

            // Invalid credentials
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> লগইন`;
            }
            if (errorEl) {
                errorEl.textContent = "❌ ভুল ইউজার আইডি বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।";
                errorEl.style.display = 'block';
            }
        }

        function loginSuccessRedirect(name, role, roleKey, mobile, photo, perms = null) {
            const successEl = document.getElementById('cmsLoginSuccess');
            const submitBtn = document.getElementById('cmsLoginSubmitBtn');

            if (successEl) {
                successEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ✅ স্বাগতম <strong>${name}</strong>! সফলভাবে লগইন হয়েছে। ERP ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...`;
                successEl.style.display = 'block';
            }

            if (submitBtn) {
                submitBtn.style.background = '#10b981';
                submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> লগইন সফল! ড্যাশবোর্ডে যাচ্ছি...`;
            }

            // Set ERP Authentication State
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', name);
            localStorage.setItem('school_user_name', name);
            localStorage.setItem('school_user_role', role);
            localStorage.setItem('school_user_role_key', roleKey);
            localStorage.setItem('school_user_mobile', mobile);
            localStorage.setItem('school_user_id', mobile);
            localStorage.setItem('school_user_photo', photo || '');
            const allPerms = ['*'];
            localStorage.setItem('school_user_permissions', JSON.stringify(roleKey === 'admin' ? allPerms : (perms || [])));
            localStorage.setItem('__school_user_login_time', Date.now().toString());

            // Notify Server Heartbeat
            try {
                fetch('/api/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_name: name,
                        role: role,
                        page: 'CMS Login -> Home.html',
                        joined_at: Date.now()
                    })
                }).catch(e => console.log(e));
            } catch (e) { }

            // Redirect smoothly to ERP Home.html
            setTimeout(() => {
                window.location.href = 'Home.html';
            }, 800);
        }

        function handleCmsLogout() {
            if (confirm("আপনি কি নিশ্চিত যে ERP সেশন থেকে লগআউট করতে চান?")) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('school_user_name');
                localStorage.removeItem('school_user_role');
                localStorage.removeItem('school_user_role_key');
                localStorage.removeItem('school_user_mobile');
                localStorage.removeItem('school_user_id');
                localStorage.removeItem('school_user_photo');
                localStorage.removeItem('school_user_permissions');
                localStorage.removeItem('__school_user_login_time');

                try {
                    fetch('/api/logout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'logout' })
                    }).catch(e => console.log(e));
                } catch (e) { }

                updateCmsAuthUI();
                alert("সফলভাবে লগআউট করা হয়েছে।");
            }
        }

        function updateCmsAuthUI() {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const topAuth = document.getElementById('topAuthContainer');
            const navLoginBtn = document.getElementById('navLoginBtn');
            const mobileLoginBtn = document.getElementById('mobileLoginBtn');

            if (isLoggedIn) {
                const name = localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || 'ব্যবহারকারী';
                const role = localStorage.getItem('school_user_role') || 'স্টাফ';

                if (topAuth) {
                    topAuth.innerHTML = `
                        <span style="font-size: 0.8rem; color: #94a3b8; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-circle-user" style="color: #38bdf8;"></i> ${name} (${role})
                        </span>
                        <a href="Home.html" class="top-btn-erp" title="ড্যাশবোর্ডে প্রবেশ করুন" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            <i class="fa-solid fa-gauge-high"></i> ড্যাশবোর্ড
                        </a>
                        <button type="button" onclick="handleCmsLogout()" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="লগআউট করুন">
                            <i class="fa-solid fa-right-from-bracket"></i> লগআউট
                        </button>
                    `;
                }

                if (navLoginBtn) {
                    navLoginBtn.style.display = 'none';
                    navLoginBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    navLoginBtn.innerHTML = `<i class="fa-solid fa-gauge-high"></i> <span>ড্যাশবোর্ড</span>`;
                    navLoginBtn.onclick = () => { window.location.href = 'Home.html'; };
                }

                if (mobileLoginBtn) {
                    mobileLoginBtn.innerHTML = `<i class="fa-solid fa-gauge"></i> ড্যাশবোর্ড`;
                    mobileLoginBtn.onclick = () => { window.location.href = 'Home.html'; };
                }
            } else {
                if (topAuth) {
                    topAuth.innerHTML = `
                        <span class="sync-indicator-pill" id="syncStatusBadge" title="ERP ডেটাবেজের সাথে সরাসরি সংযুক্ত">
                            <span class="sync-dot"></span> Live
                        </span>
                        <a href="javascript:void(0)" onclick="openCmsLoginModal()" class="top-btn-erp" id="topLoginCtaBtn" title="লগইন করুন">
                            <i class="fa-solid fa-right-to-bracket"></i> <span>লগইন</span>
                        </a>
                    `;
                }

                if (navLoginBtn) {
                    navLoginBtn.style.display = 'none';
                    navLoginBtn.style.background = 'linear-gradient(135deg, #0052ff 0%, #003db3 100%)';
                    navLoginBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> <span>লগইন</span>`;
                    navLoginBtn.onclick = () => { openCmsLoginModal(); };
                }

                if (mobileLoginBtn) {
                    mobileLoginBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> লগইন`;
                    mobileLoginBtn.onclick = () => { toggleMobileNav(); openCmsLoginModal(); };
                }
            }
        }

        // --- INITIALIZE CMS ON LOAD & REAL-TIME SYNC ENGINE ---
        document.addEventListener('DOMContentLoaded', () => {
            loadCmsDataEngine();
            updateCmsAuthUI();
            initAdmissionGeoDropdowns();
            initAdmissionClassDropdown();

            // Setup real-time background sync polling every 20 seconds
            if (!cmsRealtimePollInterval) {
                cmsRealtimePollInterval = setInterval(refreshCmsRealtimeData, 20000);
            }

            // Sync immediately when user switches tabs back to page
            window.addEventListener('focus', () => {
                refreshCmsRealtimeData();
            });

            // Real-time BroadcastChannel listener for instant cross-tab sync
            if (window.BroadcastChannel) {
                try {
                    const bc = new BroadcastChannel('school_realtime_db_channel');
                    bc.onmessage = (ev) => {
                        if (ev.data && ev.data.key === 'school_cms_settings') {
                            CMS_CONFIG = safeParse(ev.data.value, CMS_CONFIG);
                            applySectionVisibilities();
                        }
                    };
                } catch(e) {}
            }

            // Instant cross-tab sync when ERP saves updates
            window.addEventListener('storage', (e) => {
                if (e.key === 'school_cms_settings' || !e.key) {
                    CMS_CONFIG = getStoreData('school_cms_settings', {}) || {};
                    applySectionVisibilities();
                }
                if (e.key === 'school_important_links' || e.key === 'school_quick_links') {
                    ERP_QUICK_LINKS = getStoreData('school_important_links', null) || getStoreData('school_quick_links', []) || [];
                    renderQuickLinks();
                } else if (e.key === 'school_notices') {
                    ERP_NOTICES = getStoreData('school_notices', []) || [];
                    renderNotices();
                } else if (e.key === 'school_ticker_notices') {
                    ERP_TICKER = getStoreData('school_ticker_notices', []) || [];
                    renderTicker();
                } else if (e.key === 'school_settings') {
                    ERP_SETTINGS = getStoreData('school_settings', {}) || {};
                    renderSchoolIdentity();
                    renderSpeeches();
                } else if (e.key === 'school_classes' || e.key === 'school_class_sections') {
                    if (e.key === 'school_classes') ERP_CLASSES = getStoreData('school_classes', ERP_CLASSES);
                    if (e.key === 'school_class_sections') ERP_SECTIONS = getStoreData('school_class_sections', ERP_SECTIONS);
                    initAdmissionClassDropdown();
                    renderClassesAndCurriculum();
                } else if (e.key === 'school_subjects') {
                    ERP_SUBJECTS = getStoreData('school_subjects', ERP_SUBJECTS) || {};
                    const targetCls = document.getElementById('admTargetClass') ? document.getElementById('admTargetClass').value : '';
                    const targetGrp = document.getElementById('admGroup') ? document.getElementById('admGroup').value : '';
                    if (targetCls && isClassNineOrTenMatch(targetCls)) {
                        handleAdmGroupChange(targetGrp);
                    }
                } else if (e.key === 'bd_geo_admission_data' || !e.key) {
                    initAdmissionGeoDropdowns();
                    initAdmissionClassDropdown();
                }
            });

            // Instant Custom Event Sync
            window.addEventListener('importantLinksUpdated', () => {
                ERP_QUICK_LINKS = getStoreData('school_important_links', null) || getStoreData('school_quick_links', []) || [];
                renderQuickLinks();
            });

            // Instant School Classes & Sections Sync Event Listener
            window.addEventListener('school_classes_synced', () => {
                ERP_CLASSES = getStoreData('school_classes', ERP_CLASSES);
                ERP_SECTIONS = getStoreData('school_class_sections', ERP_SECTIONS);
                initAdmissionClassDropdown();
                renderClassesAndCurriculum();
            });

            // Instant School Subjects Sync Event Listener
            window.addEventListener('school_subjects_synced', () => {
                ERP_SUBJECTS = getStoreData('school_subjects', ERP_SUBJECTS) || {};
                const targetCls = document.getElementById('admTargetClass') ? document.getElementById('admTargetClass').value : '';
                const targetGrp = document.getElementById('admGroup') ? document.getElementById('admGroup').value : '';
                if (targetCls && isClassNineOrTenMatch(targetCls)) {
                    handleAdmGroupChange(targetGrp);
                }
            });

            // Database Sync Event Listener
            window.addEventListener('dbSynced', (e) => {
                if (!e.detail || !e.detail.key || e.detail.key === 'bd_geo_admission_data') {
                    initAdmissionGeoDropdowns();
                }
                if (!e.detail || !e.detail.key || e.detail.key === 'school_classes' || e.detail.key === 'school_class_sections') {
                    ERP_CLASSES = getStoreData('school_classes', ERP_CLASSES);
                    ERP_SECTIONS = getStoreData('school_class_sections', ERP_SECTIONS);
                    initAdmissionClassDropdown();
                    renderClassesAndCurriculum();
                }
                if (!e.detail || !e.detail.key || e.detail.key === 'school_subjects') {
                    ERP_SUBJECTS = getStoreData('school_subjects', ERP_SUBJECTS) || {};
                    const targetCls = document.getElementById('admTargetClass') ? document.getElementById('admTargetClass').value : '';
                    const targetGrp = document.getElementById('admGroup') ? document.getElementById('admGroup').value : '';
                    if (targetCls && isClassNineOrTenMatch(targetCls)) {
                        handleAdmGroupChange(targetGrp);
                    }
                }
            });

            // Check if URL requests teachers section
            if (window.location.hash === '#teachers') {
                window.location.href = 'teachers.html';
            }

            // Check if URL requests login
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('login') || window.location.hash === '#login') {
                const isReq = urlParams.get('login') === 'required';
                openCmsLoginModal(isReq ? 'ERP ড্যাশবোর্ডে প্রবেশের জন্য অনুগ্রহ করে লগইন করুন।' : '');
            }

            // Check if URL requests admission form directly
            if (urlParams.has('admission') || urlParams.has('apply') || urlParams.get('view') === 'admission' || window.location.hash === '#admission' || window.location.hash === '#apply' || window.location.hash === '#admission-form') {
                setTimeout(openAdmissionModal, 150);
            }
        });

        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#teachers') {
                window.location.href = 'teachers.html';
            } else if (window.location.hash === '#admission' || window.location.hash === '#apply' || window.location.hash === '#admission-form') {
                openAdmissionModal();
            }
        });
    
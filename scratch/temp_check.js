
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.replace('cms.html?login=required');
        }
    
;

// Draggable Logo Functionality across entire sheet
(function() {
    const logo = document.getElementById('draggableLogo');
    const container = document.querySelector('.certificate-sheet');
    if (!logo || !container) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    // Default position
    const DEFAULT_LEFT = 64; // ~17mm
    const DEFAULT_TOP = 60;  // ~16mm

    // Load saved position from localStorage
    const savedPos = localStorage.getItem('marksheet_logo_pos_v2');
    if (savedPos) {
        try {
            const { left, top } = JSON.parse(savedPos);
            logo.style.left = left + 'px';
            logo.style.top = top + 'px';
        } catch(e) {}
    }

    function onPointerDown(e) {
        if (e.button && e.button !== 0) return; // Only left click
        isDragging = true;
        logo.classList.add('is-dragging');

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const containerRect = container.getBoundingClientRect();
        const logoRect = logo.getBoundingClientRect();

        startX = clientX;
        startY = clientY;
        
        // Accurate position relative to container
        initialLeft = logoRect.left - containerRect.left;
        initialTop = logoRect.top - containerRect.top;

        document.addEventListener('mousemove', onPointerMove, { passive: false });
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);

        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        // Allow moving anywhere inside the full A4 sheet
        const containerRect = container.getBoundingClientRect();
        const logoWidth = logo.offsetWidth || 70;
        const logoHeight = logo.offsetHeight || 70;

        newLeft = Math.max(5, Math.min(newLeft, containerRect.width - logoWidth - 5));
        newTop = Math.max(5, Math.min(newTop, containerRect.height - logoHeight - 5));

        logo.style.left = newLeft + 'px';
        logo.style.top = newTop + 'px';

        if (e.cancelable) e.preventDefault();
    }

    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        logo.classList.remove('is-dragging');

        // Save position to localStorage
        const containerRect = container.getBoundingClientRect();
        const logoRect = logo.getBoundingClientRect();
        const left = logoRect.left - containerRect.left;
        const top = logoRect.top - containerRect.top;

        localStorage.setItem('marksheet_logo_pos_v2', JSON.stringify({ left, top }));
        document.querySelectorAll('#batch-marksheets-container .header-logo-box').forEach(bLogo => {
            bLogo.style.left = left + 'px';
            bLogo.style.top = top + 'px';
        });

        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
    }

    // Double click on logo to reset to original top-left position
    logo.addEventListener('dblclick', function() {
        logo.style.left = DEFAULT_LEFT + 'px';
        logo.style.top = DEFAULT_TOP + 'px';
        localStorage.removeItem('marksheet_logo_pos_v2');
        document.querySelectorAll('#batch-marksheets-container .header-logo-box').forEach(bLogo => {
            bLogo.style.left = DEFAULT_LEFT + 'px';
            bLogo.style.top = DEFAULT_TOP + 'px';
        });
    });

    logo.addEventListener('mousedown', onPointerDown);
    logo.addEventListener('touchstart', onPointerDown, { passive: false });
})();

function normalizeClassString(str) {
    if (!str) return '10';
    const s = String(str).toLowerCase().trim();
    if (s.includes('দশম') || s.includes('ten') || /\b10\b/.test(s) || s === '10' || s === '10th' || s.includes('১০')) return '10';
    if (s.includes('নবম') || s.includes('nine') || /\b9\b/.test(s) || s === '9' || s === '9th' || s.includes('৯')) return '9';
    if (s.includes('অষ্টম') || s.includes('eight') || /\b8\b/.test(s) || s === '8' || s === '8th' || s.includes('৮')) return '8';
    if (s.includes('সপ্তম') || s.includes('seven') || /\b7\b/.test(s) || s === '7' || s === '7th' || s.includes('৭')) return '7';
    if (s.includes('ষষ্ঠ') || s.includes('six') || /\b6\b/.test(s) || s === '6' || s === '6th' || s.includes('৬')) return '6';
    if (s.includes('পঞ্চম') || s.includes('five') || /\b5\b/.test(s) || s === '5' || s === '5th' || s.includes('৫')) return '5';
    if (s.includes('চতুর্থ') || s.includes('four') || /\b4\b/.test(s) || s === '4' || s === '4th' || s.includes('৪')) return '4';
    if (s.includes('তৃতীয়') || s.includes('তৃতীয়') || s.includes('three') || /\b3\b/.test(s) || s === '3' || s === '3rd' || s.includes('৩')) return '3';
    if (s.includes('দ্বিতীয়') || s.includes('দ্বিতীয়') || s.includes('two') || /\b2\b/.test(s) || s === '2' || s === '2nd' || s.includes('২')) return '2';
    if (s.includes('প্রথম') || s.includes('one') || /\b1\b/.test(s) || s === '1' || s === '1st' || s.includes('১')) return '1';
    if (s.includes('কেজি') || s.includes('kg')) return 'kg';
    if (s.includes('নার্সারি') || s.includes('nursery')) return 'nursery';
    if (s.includes('প্লে') || s.includes('play')) return 'play';
    return s;
}

function formatClassNameDisplay(c) {
    if (!c) return '';
    const norm = normalizeClassString(c);
    const map = {
        'play': 'Play',
        'nursery': 'Nursery',
        'kg': 'KG',
        '1': 'One',
        '2': 'Two',
        '3': 'Three',
        '4': 'Four',
        '5': 'Five',
        '6': 'Six',
        '7': 'Seven',
        '8': 'Eight',
        '9': 'Nine',
        '10': 'Ten'
    };
    if (map[norm]) return map[norm];
    return c.replace(/^class\s*/i, '').replace(/শ্রেণি|শ্রেণী/g, '').trim() || c;
}

function sortClassesSequential(classes) {
    const classOrderMap = {
        'play': 1,
        'nursery': 2,
        'kg': 3,
        '1': 4,
        '2': 5,
        '3': 6,
        '4': 7,
        '5': 8,
        '6': 9,
        '7': 10,
        '8': 11,
        '9': 12,
        '10': 13
    };
    return Array.from(classes).sort((a, b) => {
        const oa = classOrderMap[normalizeClassString(a)] || 99;
        const ob = classOrderMap[normalizeClassString(b)] || 99;
        return oa - ob;
    });
}

function toBnDigits(n) {
    if (n === null || n === undefined) return '';
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(n).replace(/[0-9]/g, d => bn[d]);
}

function toEnDigits(n) {
    if (n === null || n === undefined) return '';
    const en = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
    return String(n).replace(/[০-৯]/g, d => en[d]);
}

// Bilingual Support System
let currentLanguage = 'bn';
try {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam === 'en' || langParam === 'bn') {
        currentLanguage = langParam;
    } else {
        currentLanguage = 'bn'; // Strict default on initial launch
    }
} catch(e) {
    currentLanguage = 'bn';
}
window.currentLanguage = currentLanguage;

function formatDigits(n) {
    if (n === null || n === undefined || n === '') return '';
    return currentLanguage === 'en' ? toEnDigits(n) : toBnDigits(n);
}

function switchLanguage(lang) {
    currentLanguage = (lang === 'en') ? 'en' : 'bn';
    try {
        window.currentLanguage = currentLanguage;
        localStorage.setItem('marksheet_language', currentLanguage);
    } catch(e) {}
    const sLang = document.getElementById('filter-language');
    if (sLang && sLang.value !== currentLanguage) sLang.value = currentLanguage;
    if (typeof updateLanguageUI === 'function') updateLanguageUI();
    if (typeof updateLanguageUI1 === 'function') updateLanguageUI1();
    syncCascadingFilters('language_switched');
}

const subjectTranslations = {
    'bangla 1st paper': { bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper' },
    'bangla 1st': { bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper' },
    'bangla 2nd paper': { bn: 'বাংলা ২য় পত্র', en: 'Bangla 2nd Paper' },
    'bangla 2nd': { bn: 'বাংলা ২য় পত্র', en: 'Bangla 2nd Paper' },
    'bangla sahitya': { bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper' },
    'bangla': { bn: 'বাংলা', en: 'Bangla' },
    'বাংলা ১ম পত্র': { bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper' },
    'বাংলা ২য় পত্র': { bn: 'বাংলা ২য় পত্র', en: 'Bangla 2nd Paper' },
    'বাংলা সাহিত্য': { bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper' },
    'বাংলা ব্যাকরণ': { bn: 'বাংলা ২য় পত্র', en: 'Bangla 2nd Paper' },
    'বাংলা ভাষার ব্যাকরণ ও নির্মিতি': { bn: 'বাংলা ২য় পত্র', en: 'Bangla 2nd Paper' },
    'বাংলা': { bn: 'বাংলা', en: 'Bangla' },
    'english 1st paper': { bn: 'ইংরেজি ১ম পত্র', en: 'English 1st Paper' },
    'english 1st': { bn: 'ইংরেজি ১ম পত্র', en: 'English 1st Paper' },
    'english for today': { bn: 'English For Today', en: 'English For Today' },
    'english 2nd paper': { bn: 'ইংরেজি ২য় পত্র', en: 'English 2nd Paper' },
    'english 2nd': { bn: 'ইংরেজি ২য় পত্র', en: 'English 2nd Paper' },
    'english grammar': { bn: 'ইংরেজি ২য় পত্র', en: 'English 2nd Paper' },
    'english': { bn: 'ইংরেজি', en: 'English' },
    'ইংরেজি ১ম পত্র': { bn: 'ইংরেজি ১ম পত্র', en: 'English 1st Paper' },
    'ইংরেজি ২য় পত্র': { bn: 'ইংরেজি ২য় পত্র', en: 'English 2nd Paper' },
    'ইংরেজি': { bn: 'ইংরেজি', en: 'English' },
    'mathematics': { bn: 'গণিত', en: 'Mathematics' },
    'math': { bn: 'গণিত', en: 'Mathematics' },
    'general mathematics': { bn: 'সাধারণ গণিত', en: 'General Mathematics' },
    'গণিত': { bn: 'গণিত', en: 'Mathematics' },
    'সাধারণ গণিত': { bn: 'সাধারণ গণিত', en: 'General Mathematics' },
    'science': { bn: 'বিজ্ঞান', en: 'Science' },
    'general science': { bn: 'সাধারণ বিজ্ঞান', en: 'General Science' },
    'বিজ্ঞান': { bn: 'বিজ্ঞান', en: 'Science' },
    'সাধারণ বিজ্ঞান': { bn: 'সাধারণ বিজ্ঞান', en: 'General Science' },
    'bangladesh and global studies': { bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'Bangladesh & Global Studies' },
    'bangladesh & global studies': { bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'Bangladesh & Global Studies' },
    'বাংলাদেশ ও বিশ্বপরিচয়': { bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'Bangladesh & Global Studies' },
    'বাংলাদেশ ও বিশ্ব পরিচয়': { bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'Bangladesh & Global Studies' },
    'islamic studies': { bn: 'ইসলাম ও নৈতিক শিক্ষা', en: 'Islam & Moral Education' },
    'islam and moral education': { bn: 'ইসলাম ও নৈতিক শিক্ষা', en: 'Islam & Moral Education' },
    'islam': { bn: 'ইসলাম ও নৈতিক শিক্ষা', en: 'Islam & Moral Education' },
    'ইসলাম ও নৈতিক শিক্ষা': { bn: 'ইসলাম ও নৈতিক শিক্ষা', en: 'Islam & Moral Education' },
    'ইসলাম': { bn: 'ইসলাম ও নৈতিক শিক্ষা', en: 'Islam & Moral Education' },
    'hindu religion studies': { bn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', en: 'Hindu & Moral Education' },
    'hindu and moral education': { bn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', en: 'Hindu & Moral Education' },
    'hinduism studies': { bn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', en: 'Hindu & Moral Education' },
    'hindu': { bn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', en: 'Hindu & Moral Education' },
    'হিন্দুধর্ম ও নৈতিক শিক্ষা': { bn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', en: 'Hindu & Moral Education' },
    'হিন্দুধর্ম': { bn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', en: 'Hindu & Moral Education' },
    'buddhist and moral education': { bn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা', en: 'Buddhist & Moral Education' },
    'বৌদ্ধধর্ম ও নৈতিক শিক্ষা': { bn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা', en: 'Buddhist & Moral Education' },
    'christian and moral education': { bn: 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা', en: 'Christian & Moral Education' },
    'খ্রিস্টধর্ম ও নৈতিক শিক্ষা': { bn: 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা', en: 'Christian & Moral Education' },
    'information and communication technology': { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT' },
    'ict': { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT' },
    'তথ্য ও যোগাযোগ প্রযুক্তি (ict)': { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT' },
    'তথ্য ও যোগাযোগ প্রযুক্তি': { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT' },
    'physics': { bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
    'পদার্থবিজ্ঞান': { bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
    'পদার্থ': { bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
    'chemistry': { bn: 'রসায়ন', en: 'Chemistry' },
    'রসায়ন': { bn: 'রসায়ন', en: 'Chemistry' },
    'biology': { bn: 'জীববিজ্ঞান', en: 'Biology' },
    'জীববিজ্ঞান': { bn: 'জীববিজ্ঞান', en: 'Biology' },
    'higher mathematics': { bn: 'উচ্চতর গণিত', en: 'Higher Mathematics' },
    'higher math': { bn: 'উচ্চতর গণিত', en: 'Higher Mathematics' },
    'উচ্চতর গণিত': { bn: 'উচ্চতর গণিত', en: 'Higher Mathematics' },
    'agriculture studies': { bn: 'কৃষি শিক্ষা', en: 'Agriculture Studies' },
    'agriculture': { bn: 'কৃষি শিক্ষা', en: 'Agriculture Studies' },
    'কৃষি শিক্ষা': { bn: 'কৃষি শিক্ষা', en: 'Agriculture Studies' },
    'home science': { bn: 'গার্হস্থ্য বিজ্ঞান', en: 'Home Science' },
    'গার্হস্থ্য বিজ্ঞান': { bn: 'গার্হস্থ্য বিজ্ঞান', en: 'Home Science' },
    'accounting': { bn: 'হিসাববিজ্ঞান', en: 'Accounting' },
    'হিসাববিজ্ঞান': { bn: 'হিসাববিজ্ঞান', en: 'Accounting' },
    'business entrepreneurship': { bn: 'ব্যবসায় উদ্যোগ', en: 'Business Entrepreneurship' },
    'ব্যবসায় উদ্যোগ': { bn: 'ব্যবসায় উদ্যোগ', en: 'Business Entrepreneurship' },
    'ব্যবসায় উদ্যোগ': { bn: 'ব্যবসায় উদ্যোগ', en: 'Business Entrepreneurship' },
    'finance and banking': { bn: 'ফিন্যান্স ও ব্যাংকিং', en: 'Finance & Banking' },
    'finance & banking': { bn: 'ফিন্যান্স ও ব্যাংকিং', en: 'Finance & Banking' },
    'ফিন্যান্স ও ব্যাংকিং': { bn: 'ফিন্যান্স ও ব্যাংকিং', en: 'Finance & Banking' },
    'history of bangladesh and world civilization': { bn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', en: 'History of Bangladesh & World Civilization' },
    'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা': { bn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', en: 'History of Bangladesh & World Civilization' },
    'history and social science': { bn: 'ইতিহাস ও সামাজিক বিজ্ঞান', en: 'History & Social Science' },
    'ইতিহাস ও সামাজিক বিজ্ঞান': { bn: 'ইতিহাস ও সামাজিক বিজ্ঞান', en: 'History & Social Science' },
    'civics and citizenship': { bn: 'পৌরনীতি ও নাগরিকতা', en: 'Civics & Citizenship' },
    'civics': { bn: 'পৌরনীতি ও নাগরিকতা', en: 'Civics & Citizenship' },
    'পৌরনীতি ও নাগরিকতা': { bn: 'পৌরনীতি ও নাগরিকতা', en: 'Civics & Citizenship' },
    'পৌরনীতি': { bn: 'পৌরনীতি ও নাগরিকতা', en: 'Civics & Citizenship' },
    'geography and environment': { bn: 'ভূগোল ও পরিবেশ', en: 'Geography & Environment' },
    'ভূগোল ও পরিবেশ': { bn: 'ভূগোল ও পরিবেশ', en: 'Geography & Environment' },
    'physical education': { bn: 'শারীরিক শিক্ষা ও স্বাস্থ্য', en: 'Physical Education' },
    'physical education and health': { bn: 'শারীরিক শিক্ষা ও স্বাস্থ্য', en: 'Physical Education & Health' },
    'শারীরিক শিক্ষা ও স্বাস্থ্য': { bn: 'শারীরিক শিক্ষা ও স্বাস্থ্য', en: 'Physical Education & Health' },
    'শারীরিক শিক্ষা': { bn: 'শারীরিক শিক্ষা ও স্বাস্থ্য', en: 'Physical Education' },
    'arts and crafts': { bn: 'চারু ও কারুকলা', en: 'Arts & Crafts' },
    'চারু ও কারুকলা': { bn: 'চারু ও কারুকলা', en: 'Arts & Crafts' },
    'career education': { bn: 'ক্যারিয়ার শিক্ষা', en: 'Career Education' },
    'ক্যারিয়ার শিক্ষা': { bn: 'ক্যারিয়ার শিক্ষা', en: 'Career Education' },
    'কর্ম ও জীবনমুখী শিক্ষা': { bn: 'কর্ম ও জীবনমুখী শিক্ষা', en: 'Work & Life-Oriented Education' },
    'work and life-oriented education': { bn: 'কর্ম ও জীবনমুখী শিক্ষা', en: 'Work & Life-Oriented Education' }
};

function getDisplaySubjectName(name) {
    if (!name) return '';
    const clean = String(name).trim();
    const norm = clean.toLowerCase().replace(/[-_()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (subjectTranslations[norm]) {
        return currentLanguage === 'en' ? subjectTranslations[norm].en : subjectTranslations[norm].bn;
    }
    for (const key of Object.keys(subjectTranslations)) {
        if (norm === key || norm.includes(key) || key.includes(norm)) {
            return currentLanguage === 'en' ? subjectTranslations[key].en : subjectTranslations[key].bn;
        }
    }
    if (currentLanguage === 'en') {
        return toEnDigits(clean);
    } else {
        return (typeof getSubjectNameBangla === 'function' ? getSubjectNameBangla(clean) : clean) || clean;
    }
}

function getEnglishExamName(examName) {
    if (!examName) return '';
    let name = String(examName).trim();
    const map = [
        [/অর্ধ-বার্ষিক\s*পরীক্ষা/gi, 'Half-Yearly Examination'],
        [/বার্ষিক\s*পরীক্ষা/gi, 'Annual Examination'],
        [/প্রাক-নির্বাচনী\s*পরীক্ষা/gi, 'Pre-Test Examination'],
        [/নির্বাচনী\s*পরীক্ষা/gi, 'Test Examination'],
        [/১ম\s*সাময়িক\s*পরীক্ষা/gi, '1st Terminal Examination'],
        [/২য়\s*সাময়িক\s*পরীক্ষা/gi, '2nd Terminal Examination'],
        [/মডেল\s*টেস্ট/gi, 'Model Test Examination'],
        [/ক্লাস\s*টেষ্ট\s*পরীক্ষা/gi, 'Class Test Examination'],
        [/টিউটোরিয়াল\s*পরীক্ষা/gi, 'Tutorial Examination'],
        [/মাসিক\s*পরীক্ষা/gi, 'Monthly Examination'],
        [/পরীক্ষা/gi, 'Examination']
    ];
    for (const [re, rep] of map) {
        name = name.replace(re, rep);
    }
    name = toEnDigits(name);
    return name;
}

function getDisplayExamName(examName) {
    if (!examName) return '';
    return currentLanguage === 'en' ? getEnglishExamName(examName) : examName;
}

function getEnglishClassName(cls) {
    const norm = normalizeClassString(cls);
    const map = {
        'play': 'Play',
        'nursery': 'Nursery',
        'kg': 'KG',
        '1': 'One',
        '2': 'Two',
        '3': 'Three',
        '4': 'Four',
        '5': 'Five',
        '6': 'Six',
        '7': 'Seven',
        '8': 'Eight',
        '9': 'Nine',
        '10': 'Ten'
    };
    return map[norm] || cls || '';
}

function getBanglaClassName(cls) {
    const norm = normalizeClassString(cls);
    const map = {
        'play': 'প্লে',
        'nursery': 'নার্সারি',
        'kg': 'কেজি',
        '1': 'প্রথম',
        '2': 'দ্বিতীয়',
        '3': 'তৃতীয়',
        '4': 'চতুর্থ',
        '5': 'পঞ্চম',
        '6': 'ষষ্ঠ',
        '7': 'সপ্তম',
        '8': 'অষ্টম',
        '9': 'নবম',
        '10': 'দশম'
    };
    return map[norm] || cls || '';
}

function getDisplayClassName(cls) {
    return currentLanguage === 'en' ? getEnglishClassName(cls) : getBanglaClassName(cls);
}

function getEnglishSectionName(sec) {
    if (!sec) return '';
    const s = String(sec).trim().toLowerCase();
    if (s.includes('বিজ্ঞান') || s === 'science') return 'Science';
    if (s.includes('মানবিক') || s === 'humanities') return 'Humanities';
    if (s.includes('ব্যবসায়') || s.includes('ব্যবসায়') || s.includes('business')) return 'Business Studies';
    if (s === 'ক' || s === 'a') return 'A';
    if (s === 'খ' || s === 'b') return 'B';
    if (s === 'গ' || s === 'c') return 'C';
    if (s === 'ঘ' || s === 'd') return 'D';
    return sec;
}

function getDisplaySectionName(sec) {
    if (!sec) return '';
    if (currentLanguage === 'en') {
        return getEnglishSectionName(sec);
    } else {
        const s = String(sec).trim();
        if (s.toLowerCase() === 'science') return 'বিজ্ঞান';
        if (s.toLowerCase() === 'humanities') return 'মানবিক';
        if (s.toLowerCase() === 'business' || s.toLowerCase() === 'commerce') return 'ব্যবসায় শিক্ষা';
        return s;
    }
}


function updateLanguageUI1() {
    const isEn = (currentLanguage === 'en');
    
    // 1. Toolbar Labels
    const lExam = document.getElementById('label-exam');
    if (lExam) lExam.innerText = isEn ? 'Exam:' : 'পরীক্ষা:';
    const lClass = document.getElementById('label-class');
    if (lClass) lClass.innerText = isEn ? 'Class:' : 'শ্রেণি:';
    const lSec = document.getElementById('label-section');
    if (lSec) lSec.innerText = isEn ? 'Section:' : 'শাখা:';
    const lSearch = document.getElementById('label-search');
    if (lSearch) lSearch.innerText = isEn ? 'Search:' : 'খুঁজুন:';
    const sInput = document.getElementById('filter-student-search');
    if (sInput) sInput.placeholder = isEn ? 'Roll / Name / ID...' : 'রোল / নাম / আইডি লিখুন...';
    const lLang = document.getElementById('label-language');
    if (lLang) lLang.innerText = isEn ? 'Language:' : 'ভাষা:';
    const sLang = document.getElementById('filter-language');
    if (sLang && sLang.value !== currentLanguage) sLang.value = currentLanguage;
    const lTemp = document.getElementById('label-template');
    if (lTemp) lTemp.innerText = isEn ? 'Filter:' : 'Filter:';
    const btnAllText = document.getElementById('create-all-btn-text');
    if (btnAllText) {
        if (isCreateAllMode) {
            btnAllText.innerText = isEn ? 'All Students' : 'সকল শিক্ষার্থী (All)';
        } else {
            btnAllText.innerText = isEn ? 'Single Student' : 'একক শিক্ষার্থী (Single)';
        }
    }
    const btnPrint = document.getElementById('btn-print-text');
    if (btnPrint) btnPrint.innerText = isEn ? 'Print' : 'প্রিন্ট (Print)';

    // 2. Profile Card Labels
    const pName = document.getElementById('p-label-name');
    if (pName) pName.innerText = isEn ? 'Student Name' : 'শিক্ষার্থীর নাম';
    const pCls = document.getElementById('p-label-class');
    if (pCls) pCls.innerText = isEn ? 'Class' : 'শ্রেণি';
    const pSec = document.getElementById('p-label-section');
    if (pSec) pSec.innerText = isEn ? 'Section / Group' : 'শাখা / গ্রুপ';
    const pId = document.getElementById('p-label-id');
    if (pId) pId.innerText = isEn ? 'ID / Reg' : 'আইডি / রেজি';
    const pRoll = document.getElementById('p-label-roll');
    if (pRoll) pRoll.innerText = isEn ? 'Roll No' : 'রোল নং';
    const pRel = document.getElementById('p-label-religion');
    if (pRel) pRel.innerText = isEn ? 'Religion' : 'ধর্ম (Religion)';
    const pOpt = document.getElementById('label-opt-val');
    if (pOpt) pOpt.innerText = isEn ? 'Optional Subject' : 'ঐচ্ছিক বিষয়';

    // 3. Legend Table Labels
    const legTitle = document.getElementById('legend-title-1');
    if (legTitle) legTitle.innerText = isEn ? 'Grading Scale' : 'গ্রেডিং নির্দেশিকা (Grading Scale)';
    const legRange = document.getElementById('legend-th-range-1');
    if (legRange) legRange.innerText = isEn ? 'Marks Range' : 'নম্বর সীমা';
    const legGrd = document.getElementById('legend-th-grade-1');
    if (legGrd) legGrd.innerText = isEn ? 'Grade' : 'গ্রেড';
    const legGp = document.getElementById('legend-th-gp-1');
    if (legGp) legGp.innerText = isEn ? 'GPA' : 'পয়েন্ট';

    // 4. Transcript Table Headers
    const thSub = document.getElementById('th-header-sub-1');
    if (thSub) thSub.innerText = isEn ? 'Subjects' : 'পাঠ্য বিষয়সমূহ';
    const thFull = document.getElementById('th-header-full-1');
    if (thFull) thFull.innerText = isEn ? 'Full Marks' : 'পূর্ণমান';
    const thObt = document.getElementById('th-header-obtained-1');
    if (thObt) thObt.innerText = isEn ? 'Marks Obtained' : 'প্রাপ্ত নম্বর';
    const thMcq = document.getElementById('th-header-mcq-1');
    if (thMcq) thMcq.innerText = isEn ? 'MCQ' : 'বহুনির্বাচনি';
    const thCq = document.getElementById('th-header-cq-1');
    if (thCq) thCq.innerText = isEn ? 'CQ' : 'লিখিত';
    const thPrac = document.getElementById('th-header-prac-1');
    if (thPrac) thPrac.innerText = isEn ? 'Prac.' : 'ব্যবহারিক';
    const thTot = document.getElementById('th-header-total-1');
    if (thTot) thTot.innerText = isEn ? 'Total' : 'মোট নম্বর';
    const thComb = document.getElementById('th-header-combined-1');
    if (thComb) thComb.innerText = isEn ? 'Grand Total' : 'সর্বমোট';
    const thGrdTbl = document.getElementById('th-header-grade-1');
    if (thGrdTbl) thGrdTbl.innerText = isEn ? 'Letter Grade' : 'লেটার গ্রেড';
    const thGpTbl = document.getElementById('th-header-gp-1');
    if (thGpTbl) thGpTbl.innerText = isEn ? 'Grade Point (GP)' : 'গ্রেড পয়েন্ট (GP)';

    // 5. KPI Row Labels
    const kpiTot = document.getElementById('kpi-label-total');
    if (kpiTot) kpiTot.innerText = isEn ? 'Total Marks Obtained' : 'সর্বমোট প্রাপ্ত নম্বর';
    const kpiGpa = document.getElementById('kpi-label-gpa');
    if (kpiGpa) kpiGpa.innerText = isEn ? 'GPA' : 'জিপিএ (GPA)';
    const kpiGrd = document.getElementById('kpi-label-grade');
    if (kpiGrd) kpiGrd.innerText = isEn ? 'Final Grade' : 'চূড়ান্ত গ্রেড';
    const kpiPos = document.getElementById('kpi-label-pos');
    if (kpiPos) kpiPos.innerText = isEn ? 'Merit Position' : 'মেধাক্রম (Merit Position)';

    // 6. Signatures Labels
    const sigG = document.getElementById('label-sig-guardian-1');
    if (sigG) sigG.innerText = isEn ? "Guardian's Signature" : 'অভিভাবকের স্বাক্ষর';
    const sigT = document.getElementById('label-sig-teacher-1');
    if (sigT) sigT.innerText = isEn ? "Class Teacher's Signature" : 'শ্রেণি শিক্ষকের স্বাক্ষর';
    const sigH = document.getElementById('label-sig-head-1');
    if (sigH) sigH.innerText = isEn ? "Head Teacher's Signature & Seal" : 'প্রধান শিক্ষকের স্বাক্ষর ও সিল';
}


function normalizeSectionString(str) {
    if (!str) return 'science';
    const s = String(str).toLowerCase().trim();
    if (s.includes('বিজ্ঞান') || s.includes('science') || s === 'a' || s === 'ক') return 'science';
    if (s.includes('মানবিক') || s.includes('humanities') || s.includes('arts') || s === 'b' || s === 'খ') return 'humanities';
    if (s.includes('ব্যবসায়') || s.includes('ব্যবসায়') || s.includes('business') || s.includes('commerce') || s === 'c' || s === 'গ') return 'business';
    return s;
}

const DEFAULT_GRADE_RULES = [
    { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
    { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
    { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
    { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
    { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
    { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
    { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
];

// Dynamic Grading Scale loader from "Marking System" (school_marking_system)
function loadMarkingSystem() {
    try {
        const raw = localStorage.getItem('school_marking_system');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch(e) {}
    return DEFAULT_GRADE_RULES;
}

// Calculate Grade & GP dynamically based on Grading Scale (% Percentage Scale) & full marks
function calculateGradeAndGP(marks, fullMarks = 100) {
    if (marks === null || marks === undefined || isNaN(marks)) {
        return { grade: 'F', gp: 0.00 };
    }
    const fMarks = Number(fullMarks) > 0 ? Number(fullMarks) : 100;
    const pct = (Number(marks) / fMarks) * 100;

    const rules = loadMarkingSystem();
    const sortedRules = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: 'F', gp: 0.00 };

    // Find matching rule based on customized percentage threshold
    let match = sortedRules.find(r => pct >= parseFloat(r.min) && pct <= parseFloat(r.max));
    if (!match) {
        match = sortedRules.find(r => (pct + 0.001) >= parseFloat(r.min));
    }
    if (match) {
        return { grade: match.name, gp: parseFloat(match.gp) || 0.00 };
    }
    return { grade: failRule.name, gp: parseFloat(failRule.gp) || 0.00 };
}

function getMaxScaleGP() {
    const rules = loadMarkingSystem();
    const gps = rules.map(r => parseFloat(r.gp) || 0);
    return gps.length > 0 ? Math.max(...gps, 1.0) : 5.00;
}

function getFinalGradeFromGPA(gpa, isFailed) {
    const rules = loadMarkingSystem();
    const sortedRules = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0.0 };
    if (isFailed || gpa <= 0) return failRule.name;

    const sortedByGP = [...sortedRules].sort((a, b) => (parseFloat(b.gp) || 0) - (parseFloat(a.gp) || 0));
    const matched = sortedByGP.find(r => (gpa + 0.001) >= parseFloat(r.gp));
    return matched ? matched.name : failRule.name;
}

function renderGradingScaleLegend1() {
    const rules = loadMarkingSystem();
    const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    const tbody = document.getElementById('grading-legend-tbody-1');
    if (tbody) {
        let rowsHtml = '';
        sorted.forEach(r => {
            const minStr = formatDigits(String(r.min).padStart(2, '0'));
            const maxStr = formatDigits(String(r.max));
            const gpStr = formatDigits(parseFloat(r.gp || 0).toFixed(2));
            rowsHtml += `<tr><td>${minStr}-${maxStr}</td><td><strong>${r.name}</strong></td><td>${gpStr}</td></tr>`;
        });
        tbody.innerHTML = rowsHtml;
    }
}

function getGradingScaleLegendRowsHTML1() {
    const rules = loadMarkingSystem();
    const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    return sorted.map(r => {
        const minStr = formatDigits(String(r.min).padStart(2, '0'));
        const maxStr = formatDigits(String(r.max));
        const gpStr = formatDigits(parseFloat(r.gp || 0).toFixed(2));
        return `<tr><td>${minStr}-${maxStr}</td><td><strong>${r.name}</strong></td><td>${gpStr}</td></tr>`;
    }).join('');
}

function getSubjectNameBangla(sub) {
    if (!sub) return '';
    if (typeof sub === 'string') sub = { name: sub };
    if (sub.nameBn && sub.nameBn.trim()) {
        const b = sub.nameBn.trim();
        if (b === 'বাংলা ১ম পত্র' || b === 'বাংলা ১ম' || b.includes('বাংলা সাহিত্য')) return 'বাংলা সাহিত্য';
        if (b === 'বাংলা ২য় পত্র' || b === 'বাংলা ২য়' || b.includes('ব্যাকরণ')) return 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি';
        if (b === 'ইংরেজি ১ম পত্র' || b === 'ইংরেজি ১ম') return 'ইংরেজি ১ম পত্র';
        if (b === 'ইংরেজি ২য় পত্র' || b === 'ইংরেজি ২য়') return 'ইংরেজি ২য় পত্র';
        return b;
    }

    const raw = (sub.name || sub.subject || '').trim();
    const short = (sub.shortName || '').trim().toLowerCase();
    const cleanLower = raw.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

    const dictionary = {
        'bangla sahitya': 'বাংলা সাহিত্য',
        'bangla 1st': 'বাংলা সাহিত্য',
        'bangla 1st paper': 'বাংলা সাহিত্য',
        'bangla first paper': 'বাংলা সাহিত্য',
        'bangla bhashar byakaran and nirmiti': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
        'bangla bhashar byakaran o nirmiti': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
        'bangla 2nd': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
        'bangla 2nd paper': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
        'bangla second paper': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
        'bangla grammar': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
        'english for today': 'ইংরেজি ১ম পত্র',
        'english 1st': 'ইংরেজি ১ম পত্র',
        'english 1st paper': 'ইংরেজি ১ম পত্র',
        'english first paper': 'ইংরেজি ১ম পত্র',
        'english grammar and composition': 'ইংরেজি ২য় পত্র',
        'english 2nd': 'ইংরেজি ২য় পত্র',
        'english 2nd paper': 'ইংরেজি ২য় পত্র',
        'english second paper': 'ইংরেজি ২য় পত্র',
        'english grammar': 'ইংরেজি ২য় পত্র',
        'mathematics': 'গণিত',
        'math': 'গণিত',
        'general mathematics': 'সাধারণ গণিত',
        'higher mathematics': 'উচ্চতর গণিত',
        'higher math': 'উচ্চতর গণিত',
        'general science': 'সাধারণ বিজ্ঞান',
        'science': 'বিজ্ঞান',
        'physics': 'পদার্থবিজ্ঞান',
        'chemistry': 'রসায়ন',
        'biology': 'জীববিজ্ঞান',
        'bangladesh and global studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
        'bangladesh & global studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
        'bgs': 'বাংলাদেশ ও বিশ্বপরিচয়',
        'information and communication technology': 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
        'information & communication technology': 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
        'ict': 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
        'agriculture studies': 'কৃষি শিক্ষা',
        'agricultural studies': 'কৃষি শিক্ষা',
        'agriculture': 'কৃষি শিক্ষা',
        'islamic studies': 'ইসলাম ও নৈতিক শিক্ষা',
        'islam and moral education': 'ইসলাম ও নৈতিক শিক্ষা',
        'islam & moral education': 'ইসলাম ও নৈতিক শিক্ষা',
        'islam': 'ইসলাম ও নৈতিক শিক্ষা',
        'hindu religion studies': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
        'hindu religion and moral education': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
        'hindu religion & moral education': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
        'hindu': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
        'christian religion and moral education': 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
        'buddhist religion and moral education': 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
        'home science': 'গার্হস্থ্য বিজ্ঞান',
        'physical education and health': 'শারীরিক শিক্ষা ও স্বাস্থ্য',
        'physical education': 'শারীরিক শিক্ষা ও স্বাস্থ্য',
        'arts and crafts': 'চারু ও কারুকলা',
        'fine arts': 'চারু ও কারুকলা',
        'accounting': 'হিসাববিজ্ঞান',
        'finance and banking': 'ফিন্যান্স ও ব্যাংকিং',
        'finance & banking': 'ফিন্যান্স ও ব্যাংকিং',
        'finance': 'ফিন্যান্স ও ব্যাংকিং',
        'business entrepreneurship': 'ব্যবসায় উদ্যোগ',
        'business studies': 'ব্যবসায় উদ্যোগ',
        'geography and environment': 'ভূগোল ও পরিবেশ',
        'geography & environment': 'ভূগোল ও পরিবেশ',
        'geography': 'ভূগোল ও পরিবেশ',
        'history of bangladesh and world civilization': 'ইতিহাস ও সামাজিক বিজ্ঞান',
        'history': 'ইতিহাস ও সামাজিক বিজ্ঞান',
        'civics and citizenship': 'পৌরনীতি ও নাগরিকতা',
        'civics': 'পৌরনীতি ও নাগরিকতা',
        'economics': 'অর্থনীতি'
    };

    if (short && dictionary[short]) return dictionary[short];
    if (dictionary[cleanLower]) return dictionary[cleanLower];

    for (let key in dictionary) {
        if (cleanLower.includes(key)) {
            return dictionary[key];
        }
    }

    return raw || 'বিষয়';
}

function getSubjectSortRank(sub) {
    const raw = (typeof sub === 'string' ? sub : (sub.name || sub.subject || sub.rawName || sub.nameBn || '')).trim().toLowerCase();
    const isOpt = typeof sub === 'object' && (sub.isOptional || sub.group === 'optional');
    if (isOpt) return 999;

    if (raw.includes('বাংলা সাহিত্য') || raw.includes('বাংলা ১ম') || raw.includes('bangla 1')) return 1;
    if (raw.includes('বাংলা ভাষার ব্যাকরণ') || raw.includes('বাংলা ২য়') || raw.includes('bangla 2') || raw.includes('ব্যাকরণ')) return 2;
    if (raw.includes('ইংরেজি ১ম') || raw.includes('english 1') || raw.includes('english for today')) return 3;
    if (raw.includes('ইংরেজি ২য়') || raw.includes('english 2') || raw.includes('grammar')) return 4;
    if (raw.includes('গণিত') || raw.includes('mathematics') || raw === 'math') return 5;
    if (raw.includes('তথ্য ও যোগাযোগ') || raw.includes('ict') || raw.includes('আইসিটি')) return 6;
    if (raw.includes('ইসলাম') || raw.includes('হিন্দু') || raw.includes('বৌদ্ধ') || raw.includes('খ্রিস্ট') || raw.includes('ধর্ম') || raw.includes('religion') || raw.includes('islam') || raw.includes('hindu')) return 7;
    if (raw.includes('বাংলাদেশ ও বিশ্বপরিচয়') || raw.includes('bangladesh and global studies') || raw.includes('science') || raw.includes('বিজ্ঞান')) return 8;
    if (raw.includes('পদার্থবিজ্ঞান') || raw.includes('physics') || raw.includes('পৌরনীতি') || raw.includes('civics') || raw.includes('হিসাববিজ্ঞান') || raw.includes('accounting')) return 9;
    if (raw.includes('রসায়ন') || raw.includes('chemistry') || raw.includes('ইতিহাস') || raw.includes('history') || raw.includes('ব্যবসায়') || raw.includes('business')) return 10;
    if (raw.includes('জীববিজ্ঞান') || raw.includes('biology') || raw.includes('ভূগোল') || raw.includes('geography') || raw.includes('ফিন্যান্স') || raw.includes('finance')) return 11;
    if (raw.includes('অর্থনীতি') || raw.includes('economics') || raw.includes('চারু') || raw.includes('arts')) return 12;
    if (raw.includes('শারীরিক') || raw.includes('physical')) return 13;
    return 50;
}

function getStudentReligionInfo(student) {
    const r = String(student?.religion || student?.religionBn || 'Islam').toLowerCase();
    if (r.includes('hindu') || r.includes('হিন্দু') || r.includes('সনাতন')) {
        return {
            name: 'Hindu Religion Studies',
            nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
            display: 'হিন্দু (সনাতন)',
            en: 'Hinduism'
        };
    } else if (r.includes('buddh') || r.includes('বৌদ্ধ')) {
        return {
            name: 'Buddhist Religion Studies',
            nameBn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
            display: 'বৌদ্ধ',
            en: 'Buddhism'
        };
    } else if (r.includes('christ') || r.includes('খ্রিস্ট') || r.includes('ঈসায়ী')) {
        return {
            name: 'Christian Religion Studies',
            nameBn: 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
            display: 'খ্রিস্টান',
            en: 'Christianity'
        };
    }
    return {
        name: 'Islamic Studies',
        nameBn: 'ইসলাম ও নৈতিক শিক্ষা',
        display: 'ইসলাম',
        en: 'Islam'
    };
}

function getStudentOptionalSubjectInfo(student, normS) {
    let raw = student ? (student.optionalSubject || student.optional_subject || student.fourthSubject || student.optional || '') : '';
    let optBn = '';
    if (raw) {
        optBn = getSubjectNameBangla(raw);
    }
    if (!optBn || optBn === 'বিষয়') {
        if (normS === 'science') {
            optBn = 'উচ্চতর গণিত';
            raw = 'Higher Mathematics';
        } else if (normS === 'humanities') {
            optBn = 'কৃষি শিক্ষা';
            raw = 'Agriculture Studies';
        } else if (normS === 'business') {
            optBn = 'কৃষি শিক্ষা';
            raw = 'Agriculture Studies';
        } else {
            optBn = 'কৃষি শিক্ষা';
            raw = 'Agriculture Studies';
        }
    }
    return {
        name: raw || optBn,
        nameBn: optBn
    };
}

// Helper to extract student marks for a given subject from school_student_marks (Exam List & Evaluations)
function getStudentMarksForSubject(student, subjectObj, selectedExam, savedMarks) {
    if (!student || !savedMarks || typeof savedMarks !== 'object') {
        return { mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false };
    }
    const stIds = [
        student.id,
        student.studentId,
        student.regNo,
        student.roll,
        student.rollNo,
        student.code
    ].filter(Boolean).map(x => String(x).trim());

    const schedIds = [];
    if (subjectObj.scheduleId) schedIds.push(String(subjectObj.scheduleId).trim());
    if (Array.isArray(subjectObj.scheduleIds)) {
        subjectObj.scheduleIds.forEach(id => {
            if (id && !schedIds.includes(String(id).trim())) schedIds.push(String(id).trim());
        });
    }

    const subCodes = [];
    if (subjectObj.code) subCodes.push(String(subjectObj.code).trim());
    const subNames = [
        subjectObj.name,
        subjectObj.rawName,
        subjectObj.nameBn
    ].filter(Boolean).map(x => String(x).trim());

    let markRecord = null;

    // 1. Check schedule-specific mark keys: marks_{stId}_{schedId}
    for (const stId of stIds) {
        for (const schId of schedIds) {
            const k = `marks_${stId}_${schId}`;
            if (savedMarks[k]) {
                markRecord = savedMarks[k];
                break;
            }
        }
        if (markRecord) break;
    }

    // 2. Check exam-name mark keys: marks_{stId}_{exam}
    if (!markRecord && selectedExam) {
        const examKeys = [selectedExam, selectedExam.trim()];
        for (const stId of stIds) {
            for (const exKey of examKeys) {
                const k = `marks_${stId}_${exKey}`;
                if (savedMarks[k]) {
                    markRecord = savedMarks[k];
                    break;
                }
            }
            if (markRecord) break;
        }
    }

    if (!markRecord) {
        return { mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false };
    }

    if (typeof markRecord === 'string') {
        const upper = markRecord.trim().toUpperCase();
        if (upper === 'A' || upper === 'ABS') {
            return { mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true };
        }
    }

    let markData = null;
    if (typeof markRecord === 'object' && markRecord !== null) {
        for (const code of subCodes) {
            if (markRecord[code] !== undefined) {
                markData = markRecord[code];
                break;
            }
        }
        if (markData === null) {
            for (const name of subNames) {
                if (markRecord[name] !== undefined) {
                    markData = markRecord[name];
                    break;
                }
            }
        }
        if (markData === null) {
            const recKeys = Object.keys(markRecord);
            for (const rk of recKeys) {
                const rkLower = rk.toLowerCase().trim();
                for (const name of subNames) {
                    const nLower = name.toLowerCase().trim();
                    if (rkLower === nLower || rkLower.includes(nLower) || nLower.includes(rkLower)) {
                        markData = markRecord[rk];
                        break;
                    }
                }
                if (markData !== null) break;
            }
        }
        if (markData === null) {
            const keys = Object.keys(markRecord).filter(k => k !== 'timestamp');
            if (keys.length === 1 && typeof markRecord[keys[0]] === 'object') {
                markData = markRecord[keys[0]];
            } else if (markRecord.mcq !== undefined || markRecord.cq !== undefined || markRecord.total !== undefined || markRecord.isAbsent !== undefined) {
                markData = markRecord;
            }
        }
    }

    if (markData === null || markData === undefined) {
        return { mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false };
    }

    let isAbsent = false;
    let mcq = '';
    let cq = '';
    let pr = '';
    let total = null;

    if (typeof markData === 'object' && markData !== null) {
        isAbsent = !!markData.isAbsent;
        if (!isAbsent && (String(markData.cq).toUpperCase() === 'A' || String(markData.mcq).toUpperCase() === 'A' || String(markData.practical).toUpperCase() === 'A')) {
            isAbsent = true;
        }

        if (isAbsent) {
            return { mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true };
        }

        if (markData.mcq !== undefined && markData.mcq !== null && markData.mcq !== '' && markData.mcq !== '-') {
            mcq = Number(markData.mcq);
        }
        if (markData.cq !== undefined && markData.cq !== null && markData.cq !== '' && markData.cq !== '-') {
            cq = Number(markData.cq);
        }
        if (markData.practical !== undefined && markData.practical !== null && markData.practical !== '' && markData.practical !== '-') {
            pr = Number(markData.practical);
        }
        if (markData.total !== undefined && markData.total !== null && markData.total !== '' && markData.total !== '-') {
            total = Number(markData.total);
        } else if (mcq !== '' || cq !== '' || pr !== '') {
            total = (Number(mcq) || 0) + (Number(cq) || 0) + (Number(pr) || 0);
        }
    } else if (typeof markData === 'number' || (typeof markData === 'string' && markData.trim() !== '' && markData !== '-')) {
        const str = markData.toString().trim().toUpperCase();
        if (str === 'A' || str === 'ABS') {
            return { mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true };
        }
        total = Number(markData) || 0;
        cq = total;
    }

    const hasMarks = isAbsent || total !== null || mcq !== '' || cq !== '' || pr !== '';
    return { mcq, cq, pr, total, isAbsent, hasMarks };
}

// Dynamic Subject Finder: Subject names are strictly taken from "Exam List" (school_exam_schedules) and update continuously
function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {
    const normC = normalizeClassString(selectedClass);
    const normS = normalizeSectionString(selectedSection);
    const isSecondary = ['9', '10'].includes(normC);
    const isJunior = ['6', '7', '8'].includes(normC);
    const isPrimary = ['play', 'nursery', 'kg', '1', '2', '3', '4', '5'].includes(normC);

    const relInfo = getStudentReligionInfo(student);
    const optInfo = getStudentOptionalSubjectInfo(student, normS);

    let rawList = [];

    let savedMarks = {};
    try {
        const rawSavedMarks = localStorage.getItem('school_student_marks');
        if (rawSavedMarks) savedMarks = JSON.parse(rawSavedMarks);
    } catch(e) {}

    // 1. PRIMARY: Read subjects strictly created under this Exam Name in "Exam List" (school_exam_schedules)
    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const schedules = JSON.parse(rawSchedules);
            if (Array.isArray(schedules) && schedules.length > 0) {
                const matchedSchedules = schedules.filter(sc => {
                    if (!sc) return false;
                    const matchExam = isExamMatch(sc.term || sc.examName, selectedExam);
                    const matchClass = normalizeClassString(sc.className || sc.class) === normC;
                    let matchSec = true;
                    if (normS && sc.section && sc.section !== 'All' && sc.section !== '(প্রযোজ্য না)') {
                        const scSecNorm = normalizeSectionString(sc.section);
                        const scSecs = sc.section.toString().toLowerCase().split(',').map(x => x.trim());
                        matchSec = scSecNorm === normS || scSecs.includes(normS) || scSecs.includes((selectedSection || '').toLowerCase().trim());
                    }
                    return matchExam && matchClass && matchSec;
                });

                if (matchedSchedules.length > 0) {
                    const subjectGroups = new Map();
                    matchedSchedules.forEach(sc => {
                        // Exact subject name as created in Exam List!
                        const exactSubName = (sc.subject || sc.subjectName || sc.name || '').trim();
                        if (!exactSubName) return;

                        // Filter out religion subjects that do not match student religion
                        const normSub = exactSubName.toLowerCase();
                        const isRelSub = normSub.includes('ইসলাম') || normSub.includes('islam') ||
                                         normSub.includes('হিন্দু') || normSub.includes('hindu') ||
                                         normSub.includes('বৌদ্ধ') || normSub.includes('buddhist') ||
                                         normSub.includes('খ্রিস্ট') || normSub.includes('christian') ||
                                         normSub.includes('ধর্ম') || normSub.includes('religion');
                        if (isRelSub) {
                            const studentRel = String(student?.religion || '').toLowerCase();
                            const isIslamStudent = !studentRel || studentRel.includes('islam') || studentRel.includes('ইসলাম');
                            const isHinduStudent = studentRel.includes('hindu') || studentRel.includes('হিন্দু') || studentRel.includes('সনাতন');
                            const isBuddhStudent = studentRel.includes('buddh') || studentRel.includes('বৌদ্ধ');
                            const isChristStudent = studentRel.includes('christ') || studentRel.includes('খ্রিস্ট');

                            const isIslamSub = normSub.includes('islam') || normSub.includes('ইসলাম');
                            const isHinduSub = normSub.includes('hindu') || normSub.includes('হিন্দু');
                            const isBuddhSub = normSub.includes('buddh') || normSub.includes('বৌদ্ধ');
                            const isChristSub = normSub.includes('christ') || normSub.includes('খ্রিস্ট');

                            if ((isIslamSub && !isIslamStudent) || (isHinduSub && !isHinduStudent) || (isBuddhSub && !isBuddhStudent) || (isChristSub && !isChristStudent)) {
                                return;
                            }
                        }

                        const groupKey = exactSubName.toLowerCase();

                        if (!subjectGroups.has(groupKey)) {
                            let subFull = parseInt(sc.totalMarks || sc.fullMarks) || 0;
                        let subCqFull = null;
                        let subMcqFull = null;
                        let subPracFull = null;
                        if (sc.examType) {
                            try {
                                const rawTypes = localStorage.getItem('school_exam_types');
                                if (rawTypes) {
                                    const exTypes = JSON.parse(rawTypes);
                                    const exMatch = exTypes.find(t => isExamMatch(t.name, selectedExam));
                                    if (exMatch && Array.isArray(exMatch.examTypes)) {
                                        const stMatch = exMatch.examTypes.find(t => (t.typeName || '').trim().toLowerCase() === (sc.examType || '').trim().toLowerCase());
                                        if (stMatch) {
                                            if (stMatch.defaultCQ !== undefined && stMatch.defaultCQ !== null) subCqFull = Number(stMatch.defaultCQ);
                                            if (stMatch.defaultMCQ !== undefined && stMatch.defaultMCQ !== null) subMcqFull = Number(stMatch.defaultMCQ);
                                            if (stMatch.defaultPractical !== undefined && stMatch.defaultPractical !== null) subPracFull = Number(stMatch.defaultPractical);
                                            subFull = (subCqFull || 0) + (subMcqFull || 0) + (subPracFull || 0);
                                        }
                                    }
                                    if (subCqFull === null && exMatch) {
                                        if (exMatch.defaultCQ !== undefined && exMatch.defaultCQ !== null) subCqFull = Number(exMatch.defaultCQ);
                                        if (exMatch.defaultMCQ !== undefined && exMatch.defaultMCQ !== null) subMcqFull = Number(exMatch.defaultMCQ);
                                        if (exMatch.defaultPractical !== undefined && exMatch.defaultPractical !== null) subPracFull = Number(exMatch.defaultPractical);
                                    }
                                }
                            } catch(e) {}
                        }

                        const normSubName = exactSubName.toLowerCase();
                        const isEngSub = normSubName.includes('english') || normSubName.includes('ইংরেজি');
                        if (isEngSub) {
                            if (subCqFull === null || subCqFull === undefined) subCqFull = subFull || 100;
                            subMcqFull = 0;
                            subPracFull = 0;
                            if (!subFull) subFull = subCqFull;
                        } else if (subCqFull === null || subMcqFull === null || subPracFull === null) {
                            const curDist = getExamDistribution(selectedExam, selectedClass);
                            if (subCqFull === null) subCqFull = curDist.cq;
                            if (subMcqFull === null) subMcqFull = curDist.mcq;
                            if (subPracFull === null) subPracFull = curDist.prac;
                            if (!subFull && curDist.total) subFull = curDist.total;
                        }
                        if (!subFull) {
                            subFull = (normSubName.includes('ict') || normSubName.includes('আইসিটি')) ? 50 : 100;
                        }

                            subjectGroups.set(groupKey, {
                                        schedule: sc,
                                        scheduleIds: [sc.id],
                                        name: exactSubName,
                                        rawName: exactSubName,
                                        nameBn: exactSubName,
                                        code: sc.code || '',
                                        fullMarks: subFull,
                                        cqFull: subCqFull,
                                        mcqFull: subMcqFull,
                                        pracFull: subPracFull,
                                        isOptional: !!sc.isOptional
                                    });
                        } else {
                            const grp = subjectGroups.get(groupKey);
                            if (sc.id && !grp.scheduleIds.includes(sc.id)) {
                                grp.scheduleIds.push(sc.id);
                            }
                            if (sc.hasMarks) {
                                grp.schedule = sc;
                                grp.scheduleId = sc.id;
                            }
                        }
                    });

                    subjectGroups.forEach(grp => {
                                const sc = grp.schedule;
                                rawList.push({
                                    scheduleId: grp.scheduleId || sc.id,
                                    scheduleIds: grp.scheduleIds,
                                    name: grp.name,
                                    rawName: grp.rawName,
                                    nameBn: grp.name,
                                    code: grp.code,
                                    fullMarks: grp.fullMarks,
                                    cqFull: grp.cqFull,
                                    mcqFull: grp.mcqFull,
                                    pracFull: grp.pracFull,
                                    isOptional: grp.isOptional
                                });
                            });
                }
            }
        }
    } catch(e) {
        console.error("Error reading exam schedules from Exam List:", e);
    }

    // 2. Secondary fallback: check school_subjects catalog if no schedule found for this exam
    if (rawList.length === 0) {
        try {
            const rawSubjectsMap = localStorage.getItem('school_subjects');
            if (rawSubjectsMap) {
                const subMap = JSON.parse(rawSubjectsMap);
                if (typeof subMap === 'object' && subMap !== null) {
                    const classKeys = Object.keys(subMap);
                    const matchedKey = classKeys.find(k => {
                        const nk = normalizeClassString(k);
                        return nk === normC || k.toLowerCase().trim() === (selectedClass || '').toLowerCase().trim();
                    });
                    if (matchedKey && Array.isArray(subMap[matchedKey]) && subMap[matchedKey].length > 0) {
                        subMap[matchedKey].forEach(s => {
                            if (!s) return;
                            const sec = (s.section || 'All').toString().trim().toLowerCase();
                            const sBnName = getSubjectNameBangla(s);
                            const isRelSub = sBnName.includes('ইসলাম') || sBnName.includes('হিন্দু') || sBnName.includes('বৌদ্ধ') || sBnName.includes('খ্রিস্ট') || sBnName.includes('ধর্ম');
                            if (isRelSub && !sBnName.includes(relInfo.display) && !sBnName.includes('ধর্ম ও নৈতিক')) {
                                return;
                            }
                            if (sec === 'all' || sec === '' || sec.includes(normS) || normS.includes(sec)) {
                                rawList.push({
                                    name: s.name || sBnName,
                                    nameBn: isRelSub ? relInfo.nameBn : sBnName,
                                    code: s.code || '',
                                    fullMarks: s.fullMarks || 100,
                                    isOptional: !!s.isOptional
                                });
                            }
                        });
                    }
                }
            }
        } catch(e) {}
    }

    // 3. Fallback standard curriculum subjects if none configured
    if (rawList.length === 0) {
        if (isPrimary) {
            rawList = [
                { name: 'বাংলা', nameBn: 'বাংলা', fullMarks: 100 },
                { name: 'ইংরেজি', nameBn: 'ইংরেজি', fullMarks: 100 },
                { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100 },
                { name: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', nameBn: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', fullMarks: 100 },
                { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100 }
            ];
        } else if (isJunior) {
            rawList = [
                { name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', fullMarks: 100 },
                { name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', fullMarks: 100 },
                { name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', fullMarks: 100 },
                { name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', fullMarks: 100 },
                { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100 },
                { name: 'বিজ্ঞান', nameBn: 'বিজ্ঞান', fullMarks: 100 },
                { name: 'বাংলাদেশ ও বিশ্বপরিচয়', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', fullMarks: 100 },
                { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100 },
                { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', fullMarks: 50 },
                { name: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', nameBn: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', fullMarks: 100 }
            ];
        } else {
            const isSci = normS === 'science';
            const isHum = normS === 'humanities';
            rawList = [
                { name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', fullMarks: 100, group: 'compulsory' },
                { name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', fullMarks: 100, group: 'compulsory' },
                { name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', fullMarks: 100, group: 'compulsory' },
                { name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', fullMarks: 100, group: 'compulsory' },
                { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100, group: 'compulsory' },
                { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', fullMarks: 50, group: 'compulsory' },
                { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100, group: 'compulsory' },
                { name: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', nameBn: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', fullMarks: 100, group: 'compulsory' }
            ];
            if (isSci) {
                rawList.push({ name: 'পদার্থবিজ্ঞান', nameBn: 'পদার্থবিজ্ঞান', fullMarks: 100, group: 'elective' });
                rawList.push({ name: 'রসায়ন', nameBn: 'রসায়ন', fullMarks: 100, group: 'elective' });
                rawList.push({ name: 'জীববিজ্ঞান', nameBn: 'জীববিজ্ঞান', fullMarks: 100, group: 'elective' });
                rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true });
            } else if (isHum) {
                rawList.push({ name: 'পৌরনীতি ও নাগরিকতা', nameBn: 'পৌরনীতি ও নাগরিকতা', fullMarks: 100, group: 'elective' });
                rawList.push({ name: 'ইতিহাস ও সামাজিক বিজ্ঞান', nameBn: 'ইতিহাস ও সামাজিক বিজ্ঞান', fullMarks: 100, group: 'elective' });
                rawList.push({ name: 'ভূগোল ও পরিবেশ', nameBn: 'ভূগোল ও পরিবেশ', fullMarks: 100, group: 'elective' });
                rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true });
            } else {
                rawList.push({ name: 'হিসাববিজ্ঞান', nameBn: 'হিসাববিজ্ঞান', fullMarks: 100, group: 'elective' });
                rawList.push({ name: 'ব্যবসায় উদ্যোগ', nameBn: 'ব্যবসায় উদ্যোগ', fullMarks: 100, group: 'elective' });
                rawList.push({ name: 'ফিন্যান্স ও ব্যাংকিং', nameBn: 'ফিন্যান্স ও ব্যাংকিং', fullMarks: 100, group: 'elective' });
                rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true });
            }
        }
    }

    // Sort rawList strictly by curriculum hierarchy rank
    rawList.sort((a, b) => getSubjectSortRank(a) - getSubjectSortRank(b));

    // Extract real student marks from savedMarks for each subject in rawList
    rawList.forEach(item => {
                const markRes = getStudentMarksForSubject(student, item, selectedExam, savedMarks);
                item.mcq = markRes.mcq;
                item.cq = markRes.cq;
                item.pr = markRes.pr;
                item.total = markRes.total;
                item.isAbsent = markRes.isAbsent;
                item.hasMarks = markRes.hasMarks;

                const normN = (item.name || '').toLowerCase();
                const isEng = normN.includes('english') || normN.includes('ইংরেজি');
                if (item.mcqFull === 0 || isEng) {
                    item.mcq = '';
                }
                if (item.pracFull === 0 || isEng) {
                    item.pr = '';
                }
            });

    // Format rawList into structured marksheet rows (combining 1st & 2nd papers where applicable)
    const rows = [];
    const pairedIndices = new Set();

    for (let i = 0; i < rawList.length; i++) {
        if (pairedIndices.has(i)) continue;
        const current = rawList[i];
        const curName = (current.name || current.rawName || current.nameBn || current.subject || '').trim();
        const curFull = parseInt(current.fullMarks || current.totalMarks) || (curName.toLowerCase().includes('ict') || curName.includes('আইসিটি') ? 50 : 100);

        let isFirstPaper = false;
        let pairIndex = -1;

        const normCur = curName.toLowerCase();
        const isBangla1 = normCur.includes('bangla 1') || normCur.includes('bangla 1st') || normCur.includes('বাংলা ১ম') || normCur.includes('বাংলা সাহিত্য');
        const isEnglish1 = normCur.includes('english 1') || normCur.includes('english 1st') || normCur.includes('english for today') || normCur.includes('ইংরেজি ১ম');

        if (isBangla1) {
            pairIndex = rawList.findIndex((item, idx) => {
                if (idx === i || pairedIndices.has(idx)) return false;
                const normP = (item.name || item.rawName || item.nameBn || item.subject || '').toLowerCase();
                return normP.includes('bangla 2') || normP.includes('bangla 2nd') || normP.includes('বাংলা ২য়') || normP.includes('ব্যাকরণ');
            });
            if (pairIndex !== -1) isFirstPaper = true;
        } else if (isEnglish1) {
            pairIndex = rawList.findIndex((item, idx) => {
                if (idx === i || pairedIndices.has(idx)) return false;
                const normP = (item.name || item.rawName || item.nameBn || item.subject || '').toLowerCase();
                return normP.includes('english 2') || normP.includes('english 2nd') || normP.includes('grammar') || normP.includes('ইংরেজি ২য়');
            });
            if (pairIndex !== -1) isFirstPaper = true;
        }

        let groupType = current.group || (current.isOptional ? 'optional' : 'compulsory');
        if (!current.group && (normCur.includes('chemistry') || normCur.includes('physics') || normCur.includes('biology') || normCur.includes('accounting') || normCur.includes('civics') || normCur.includes('history') || normCur.includes('geography') || normCur.includes('business') || normCur.includes('রসায়ন') || normCur.includes('পদার্থ') || normCur.includes('জীব') || normCur.includes('হিসাব') || normCur.includes('পৌরনীতি') || normCur.includes('ইতিহাস') || normCur.includes('ভূগোল') || normCur.includes('ব্যবসায়'))) {
            groupType = 'elective';
        } else if (!current.group && (normCur.includes('higher') || normCur.includes('agri') || normCur.includes('উচ্চতর') || normCur.includes('কৃষি') || current.isOptional)) {
            groupType = 'optional';
        }

        if (isFirstPaper && pairIndex !== -1) {
            pairedIndices.add(i);
            pairedIndices.add(pairIndex);
            const pairItem = rawList[pairIndex];
            // Exact subject name from Exam List for Paper 2!
            const pairName = (pairItem.name || pairItem.rawName || pairItem.nameBn || pairItem.subject || '').trim();
            const pairFull = parseInt(pairItem.fullMarks || pairItem.totalMarks) || 100;

            rows.push({
                        name: curName,
                        fullMarks: curFull,
                        cqFull: current.cqFull !== undefined ? current.cqFull : null,
                        mcqFull: current.mcqFull !== undefined ? current.mcqFull : null,
                        pracFull: current.pracFull !== undefined ? current.pracFull : null,
                        mcq: current.mcq,
                        cq: current.cq,
                        pr: current.pr,
                        total: current.total,
                        hasMarks: current.hasMarks,
                        isAbsent: current.isAbsent,
                        isCombined: true,
                        pairWith: pairName,
                        pairFull: pairFull,
                        pairCqFull: pairItem.cqFull !== undefined ? pairItem.cqFull : null,
                        pairMcqFull: pairItem.mcqFull !== undefined ? pairItem.mcqFull : null,
                        pairPracFull: pairItem.pracFull !== undefined ? pairItem.pracFull : null,
                        pairMcq: pairItem.mcq,
                        pairCq: pairItem.cq,
                        pairPr: pairItem.pr,
                        pairTotal: pairItem.total,
                        pairHasMarks: pairItem.hasMarks,
                        pairIsAbsent: pairItem.isAbsent,
                        group: groupType,
                        isOptional: false
                    });
        } else {
            pairedIndices.add(i);
            rows.push({
                        name: curName,
                        fullMarks: curFull,
                        cqFull: current.cqFull !== undefined ? current.cqFull : null,
                        mcqFull: current.mcqFull !== undefined ? current.mcqFull : null,
                        pracFull: current.pracFull !== undefined ? current.pracFull : null,
                        mcq: current.mcq,
                        cq: current.cq,
                        pr: current.pr,
                        total: current.total,
                        hasMarks: current.hasMarks,
                        isAbsent: current.isAbsent,
                        isCombined: false,
                        group: groupType,
                        isOptional: current.isOptional || groupType === 'optional'
                    });
        }
    }

    if (isSecondary) {
        const optIdx = rows.findIndex(r => r.group === 'optional' || r.isOptional);
        if (optIdx !== -1 && optIdx !== rows.length - 1) {
            const optRow = rows.splice(optIdx, 1)[0];
            rows.push(optRow);
        }
    }

    return rows;
}

// Get Exam full marks breakdown (MCQ, Written/CQ, Practical, Total) from Exam List & Exam Types
function getExamDistribution(selectedExam, selectedClass) {
    let cq = 70;
    let mcq = 30;
    let prac = 0;
    let total = 100;

    try {
        const rawTypes = localStorage.getItem('school_exam_types');
        if (rawTypes) {
            const types = JSON.parse(rawTypes);
            if (Array.isArray(types)) {
                const matchedExam = types.find(t => isExamMatch(t.name, selectedExam));
                if (matchedExam) {
                    if (matchedExam.defaultCQ !== undefined && matchedExam.defaultCQ !== null) cq = Number(matchedExam.defaultCQ);
                    if (matchedExam.defaultMCQ !== undefined && matchedExam.defaultMCQ !== null) mcq = Number(matchedExam.defaultMCQ);
                    if (matchedExam.defaultPractical !== undefined && matchedExam.defaultPractical !== null) prac = Number(matchedExam.defaultPractical);
                    total = cq + mcq + prac;

                    // Check matched schedules to find the dominant subtype for this class
                    const rawSchedules = localStorage.getItem('school_exam_schedules');
                    if (rawSchedules) {
                        const schedules = JSON.parse(rawSchedules);
                        if (Array.isArray(schedules)) {
                            const normC = normalizeClassString(selectedClass);
                            const classSchedules = schedules.filter(sc => {
                                if (!sc) return false;
                                const mEx = isExamMatch(sc.term || sc.examName, selectedExam);
                                const mCls = !normC || normalizeClassString(sc.className || sc.class) === normC;
                                return mEx && mCls;
                            });

                            if (classSchedules.length > 0 && Array.isArray(matchedExam.examTypes) && matchedExam.examTypes.length > 0) {
                                const typeCounts = {};
                                classSchedules.forEach(sc => {
                                    const et = sc.examType || sc.type;
                                    if (et) typeCounts[et] = (typeCounts[et] || 0) + 1;
                                });
                                let bestType = null;
                                let maxCount = 0;
                                Object.keys(typeCounts).forEach(et => {
                                    if (typeCounts[et] > maxCount) {
                                        maxCount = typeCounts[et];
                                        bestType = et;
                                    }
                                });
                                if (bestType) {
                                    const st = matchedExam.examTypes.find(t => (t.typeName || '').trim().toLowerCase() === bestType.trim().toLowerCase());
                                    if (st) {
                                        if (st.defaultCQ !== undefined) cq = Number(st.defaultCQ);
                                        if (st.defaultMCQ !== undefined) mcq = Number(st.defaultMCQ);
                                        if (st.defaultPractical !== undefined) prac = Number(st.defaultPractical);
                                        total = cq + mcq + prac;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch(e) {
        console.error("Error finding exam distribution:", e);
    }

    return { cq, mcq, prac, total };
}

// Dynamically update the table header column titles with exam full marks
function updateTableHeaderMarks(exam, selectedClass) {
    const dist = getExamDistribution(exam, selectedClass);
    const thMcq = document.getElementById('th-header-mcq-1');
    const thCq = document.getElementById('th-header-cq-1');
    const thPrac = document.getElementById('th-header-prac-1');
    const thTotal = document.getElementById('th-header-total-1');
    const isEn = (currentLanguage === 'en');

    if (thMcq) thMcq.innerText = isEn ? `MCQ (${formatDigits(dist.mcq)})` : `বহুনির্বাচনি (${formatDigits(dist.mcq)})`;
    if (thCq) thCq.innerText = isEn ? `CQ (${formatDigits(dist.cq)})` : `লিখিত (${formatDigits(dist.cq)})`;
    if (thPrac) thPrac.innerText = isEn ? `Prac. (${formatDigits(dist.prac)})` : `ব্যবহারিক (${formatDigits(dist.prac)})`;
    if (thTotal) thTotal.innerText = isEn ? `Total (${formatDigits(dist.total)})` : `মোট নম্বর (${formatDigits(dist.total)})`;
}

function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {
    const tbody = document.getElementById('transcript-tbody-1');
    if (tbody) {
        updateTableHeaderMarks(exam, selectedClass);
    }
    if (!tbody) return;

    const isEn = (currentLanguage === 'en');
    const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);
    let html = '';
    let grandTotal = 0;
    let totalFullMarks = 0;
    let totalGP = 0;
    let subjectCount = 0;
    let hasFailed = false;
    let hasAnyMarks = false;

    let hasCompulsoryHeader = false;
    let hasElectiveHeader = false;
    let hasOptionalHeader = false;

    let mainSubjectsGP = 0;
    let mainSubjectCount = 0;
    let optionalBonusGP = 0;

    subjects.forEach((sub, idx) => {
        const isOpt = !!(sub.isOptional || sub.group === 'optional');
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`;
            hasOptionalHeader = true;
        }

        if (sub.isCombined) {
            const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;
            const m1 = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const m2 = sub.pairTotal !== null ? sub.pairTotal : ((parseInt(sub.pairMcq) || 0) + (parseInt(sub.pairCq) || 0) + (parseInt(sub.pairPr) || 0));
            const combTotal = m1 + m2;
            const fullTotal = (sub.fullMarks || 100) + (sub.pairFull || 100);
            const res = hasPaperMarks ? calculateGradeAndGP(combTotal, fullTotal) : { grade: '—', gp: 0 };

            if (hasPaperMarks) {
                hasAnyMarks = true;
                grandTotal += combTotal;
                totalFullMarks += fullTotal;
                totalGP += res.gp;
                subjectCount++;
                if (isOpt) {
                    if (res.gp > 2.00) optionalBonusGP += (res.gp - 2.00);
                } else {
                    mainSubjectsGP += res.gp;
                    mainSubjectCount++;
                    if (res.gp === 0) hasFailed = true;
                }
            }

            const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const p1TotDisplay = sub.hasMarks ? formatDigits(m1) : '<span class="blank-field">—</span>';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '<span class="blank-field">—</span>');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '<span class="blank-field">—</span>');
                    const p2TotDisplay = sub.pairHasMarks ? formatDigits(m2) : '<span class="blank-field">—</span>';

            const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '<span class="blank-field">—</span>';
            const combGradeDisplay = hasPaperMarks ? res.grade : '—';
            const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            html += `<tr>
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${getDisplaySubjectName(sub.pairWith)}</td>
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;
        } else {
            const tot = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const res = sub.hasMarks ? calculateGradeAndGP(tot, sub.fullMarks) : { grade: '—', gp: 0 };

            if (sub.hasMarks) {
                hasAnyMarks = true;
                grandTotal += tot;
                totalFullMarks += sub.fullMarks;
                totalGP += res.gp;
                subjectCount++;
                if (isOpt) {
                    if (res.gp > 2.00) optionalBonusGP += (res.gp - 2.00);
                } else {
                    mainSubjectsGP += res.gp;
                    mainSubjectCount++;
                    if (res.gp === 0) hasFailed = true;
                }
            }

            const isOptional = sub.group === 'optional';
            const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const totDisplay = sub.hasMarks ? formatDigits(tot) : '<span class="blank-field">—</span>';
            const gradeDisplay = sub.hasMarks ? res.grade : '—';
            const gpDisplay = sub.hasMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            html += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;
        }
    });

    tbody.innerHTML = html;

    renderGradingScaleLegend1();
    if (mainSubjectCount === 0) mainSubjectCount = subjectCount || 1;
    const maxGP = getMaxScaleGP();
    const rawGpa = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
    const boundedGpa = Math.min(maxGP, rawGpa);
    const zeroGpaStr = isEn ? '0.00' : '০.০০';
    const finalGpaStr = hasAnyMarks ? (hasFailed ? zeroGpaStr : formatDigits(boundedGpa.toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';

    const gtEl = document.getElementById('display-grand-total-1');
    if (gtEl) gtEl.innerText = hasAnyMarks ? (formatDigits(grandTotal) + ' / ' + formatDigits(totalFullMarks)) : '—';
    const gpaEl = document.getElementById('display-gpa-1');
    if (gpaEl) gpaEl.innerText = finalGpaStr;
    const gradeEl = document.getElementById('display-final-grade-1');
    if (gradeEl) gradeEl.innerText = finalGrade;
    const meritEl = document.getElementById('display-merit-pos-1');
    if (meritEl) meritEl.innerText = (student && student.roll ? formatDigits(student.roll) : formatDigits('1'));
}


// Helper to match exam names flexibly across routines, schedules, and types
function isExamMatch(target, selected) {
    if (!target || !selected) return false;
    const t = String(target).trim().toLowerCase();
    const s = String(selected).trim().toLowerCase();
    if (t === s) return true;
    const stripYr = str => str.replace(/২০২[০-৯]|202[0-9]/g, '').trim();
    const tNoYr = stripYr(t);
    const sNoYr = stripYr(s);
    if (tNoYr && sNoYr) {
        if (tNoYr === sNoYr) return true;
        if (tNoYr.includes(sNoYr) || sNoYr.includes(tNoYr)) return true;
    }
    return false;
}

// 1. Get all available Exams from "Exam List" (school_exam_schedules) that have an exam created with a subject
function getAllExams() {
    const examList = [];
    const seen = new Set();

    function addExam(name) {
        if (!name || typeof name !== 'string') return;
        const clean = name.trim();
        if (!clean) return;
        const key = clean.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            examList.push(clean);
        }
    }

    // "Exam List" (school_exam_schedules) এ যে Exam Name এর নামে Subject সহ Exam Create করা থাকবে, শুধুমাত্র সেই Exam Name-ই Marksheet সেকশনে দৃশ্যমান হবে
    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && typeof s === 'object') {
                        const examName = (s.term || s.examName || '').trim();
                        const subject = (s.subject || s.subjectName || s.sub || '').trim();
                        if (examName && subject) {
                            addExam(examName);
                        }
                    }
                });
            }
        }
    } catch(e) {}

    return examList;
}

// 2. Get Classes based strictly on Selected Exam Name ("Exam List" schedules with subject)
function getClassesForExam(examName) {
    const classSet = new Set();

    // 1. Check "Exam List" (school_exam_schedules) for schedules with a subject
    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && typeof s === 'object') {
                        const sExam = (s.term || s.examName || '').trim();
                        const sSubject = (s.subject || s.subjectName || s.sub || '').trim();
                        if (sExam && sSubject && (!examName || isExamMatch(sExam, examName))) {
                            const rawCls = s.class || s.className;
                            if (rawCls) {
                                String(rawCls).split(',').forEach(part => {
                                    const fmt = formatClassNameDisplay(part.trim());
                                    if (fmt) classSet.add(fmt);
                                });
                            }
                        }
                    }
                });
            }
        }
    } catch(e) {}

    // 2. Also include classes from routines if they match this created exam
    try {
        const rawRoutines = localStorage.getItem('school_exam_routines');
        if (rawRoutines) {
            const parsed = JSON.parse(rawRoutines);
            if (Array.isArray(parsed)) {
                parsed.forEach(r => {
                    if (r) {
                        const rExam = r.examName || r.term;
                        if (!examName || isExamMatch(rExam, examName)) {
                            const rawCls = r.className || r.class;
                            if (rawCls) {
                                String(rawCls).split(',').forEach(part => {
                                    const fmt = formatClassNameDisplay(part.trim());
                                    if (fmt) classSet.add(fmt);
                                });
                            }
                        }
                    }
                });
            }
        }
    } catch(e) {}

    return sortClassesSequential(classSet);
}

// 3. Get Sections / Groups based on Selected Class (Cascading: Class -> Sections)
function getSectionsForClass(className, examName) {
    const sectionSet = new Set();
    const normClass = normalizeClassString(className);
    const isSecondary = ['9', '10'].includes(normClass);

    try {
        const rawStudents = localStorage.getItem('school_students');
        if (rawStudents) {
            const parsed = JSON.parse(rawStudents);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && normalizeClassString(s.class || s.className) === normClass) {
                        if (isSecondary) {
                            if (s.group && s.group !== '(প্রযোজ্য না)') sectionSet.add(s.group.trim());
                            if (s.section && s.section !== '(প্রযোজ্য না)' && !['ক','খ','গ','A','B','C'].includes(s.section)) sectionSet.add(s.section.trim());
                        } else {
                            if (s.section && s.section !== '(প্রযোজ্য না)') sectionSet.add(s.section.trim());
                        }
                    }
                });
            }
        }
    } catch(e) {}

    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && normalizeClassString(s.className || s.class) === normClass && s.section && s.section !== 'All' && s.section !== '(প্রযোজ্য না)') {
                        sectionSet.add(s.section.trim());
                    }
                });
            }
        }
    } catch(e) {}

    if (sectionSet.size === 0) {
        if (isSecondary) {
            ["বিজ্ঞান", "মানবিক", "ব্যবসায় শিক্ষা"].forEach(s => sectionSet.add(s));
        } else {
            ["ক", "খ", "গ"].forEach(s => sectionSet.add(s));
        }
    }

    return Array.from(sectionSet);
}


        // Student Search State & Helpers
        let currentSearchQuery = '';
        let currentSelectedStudent = null;

        function escapeHtml(text) {
            if (!text) return '';
            return String(text).replace(/[&<>"']/g, function(m) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
            });
        }

        function getAllStudentsList() {
            let raw = localStorage.getItem('school_students');
            let list = [];
            if (raw) {
                try { list = JSON.parse(raw); } catch(e) {}
            }
            if (Array.isArray(list) && list.length > 0) return list;
            return [
                { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', name: 'Md. Abdullah Al Noman', studentId: '2610001', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' },
                { roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', name: 'Mst. Fatema Akter', studentId: '2610002', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Biology' },
                { roll: '3', nameBn: 'সৌরভ কুমার রায়', name: 'Sourav Kumar Roy', studentId: '2610003', class: 'Ten', section: 'বিজ্ঞান', religion: 'Hindu', optionalSubject: 'Higher Mathematics' },
                { roll: '4', nameBn: 'তানভীর হাসান', name: 'Tanvir Hasan', studentId: '2610004', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' },
                { roll: '5', nameBn: 'সাদিয়া জাহান', name: 'Sadia Jahan', studentId: '2610005', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' },
                { roll: '6', nameBn: 'প্রিয়াংকা সরকার', name: 'Priyanka Sarkar', studentId: '2610006', class: 'Ten', section: 'বিজ্ঞান', religion: 'Hindu', optionalSubject: 'Higher Mathematics' },
                { roll: '7', nameBn: 'মেহেদী হাসান', name: 'Mehedi Hasan', studentId: '2610007', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' },
                { roll: '8', nameBn: 'সুমাইয়া জান্নাত', name: 'Sumaiya Jannat', studentId: '2610008', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' }
            ];
        }

                function getEffectiveStudentId(st, currentClass = '', rankNum = 1) {
            if (!st) return '';
            const reg = String(st.regNo || '').trim();
            const sid = String(st.studentId || '').trim();

            // 1. Valid registration / student number from database (e.g. 260091, 2606001, 2607001, 2608001)
            if (reg && !reg.startsWith('178') && reg.length <= 12) {
                return reg;
            }

            // 2. Full studentId (longer than 4 characters, e.g. 2606001, 2610001, 2026101001)
            if (sid && sid.length > 4 && !sid.startsWith('178')) {
                return sid;
            }

            // 3. Clean studentId (not internal timestamp uuid)
            if (sid && !sid.startsWith('178') && !sid.includes('-')) {
                return sid;
            }

            // 4. Standard school ID formula: '26' + 2-digit class code + 3-digit roll/rank
            const normC = normalizeClassString(st.class || st.className || currentClass || '10');
            const classCode = String(normC).padStart(2, '0');
            const rollVal = st.roll || st.rollNo || rankNum || 1;
            const rollDigits = String(toEnDigits(rollVal)).replace(/\D/g, '') || String(rankNum || 1);
            const serial = String(rollDigits).padStart(3, '0');
            return `26${classCode}${serial}`;
        }

        function matchesStudentQuery(student, query) {
            if (!query) return true;
            const cleanQ = query.trim().toLowerCase();
            const cleanQEn = toEnDigits(cleanQ).replace(/^0+/, '');

            const rollStr = String(student.roll || student.rollNo || '');
            const rollEn = toEnDigits(rollStr).replace(/^0+/, '');

            // Exact roll match or startsWith
            if (cleanQEn && (rollEn === cleanQEn || rollEn.startsWith(cleanQEn))) return true;

            // Student ID & Registration match
            const effId = typeof getEffectiveStudentId === 'function' ? getEffectiveStudentId(student) : '';
            const effIdEn = toEnDigits(effId);
            const sidEn = toEnDigits(String(student.studentId || ''));
            const regEn = toEnDigits(String(student.regNo || ''));
            if (cleanQEn && (effIdEn.includes(cleanQEn) || sidEn.includes(cleanQEn) || regEn.includes(cleanQEn))) return true;

            // Name match (Bangla & English)
            const nameBn = (student.nameBn || '').toLowerCase();
            const nameEn = (student.name || student.studentName || '').toLowerCase();
            if (nameBn.includes(cleanQ) || nameEn.includes(cleanQ)) return true;

            return false;
        }

        function handleStudentSearchInput(val) {
            currentSearchQuery = (val || '').trim();
            const clearBtn = document.getElementById('btn-clear-search');
            if (clearBtn) clearBtn.style.display = currentSearchQuery ? 'inline-block' : 'none';

            if (!currentSearchQuery) {
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
                currentSelectedStudent = null;
                if (isCreateAllMode) {
                    const selClass = document.getElementById('filter-class')?.value || 'Ten';
                    const selSec = document.getElementById('filter-section')?.value || 'বিজ্ঞান';
                    const selExam = document.getElementById('filter-exam')?.value || localStorage.getItem('school_marksheet_exam') || (typeof getAllExams === 'function' ? (getAllExams()[0] || 'বার্ষিক পরীক্ষা') : 'বার্ষিক পরীক্ষা');
                    renderBatchMarksheets1(selClass, selSec, selExam);
                } else {
                    syncCascadingFilters('search_cleared');
                }
                return;
            }

            renderSearchSuggestions(currentSearchQuery);

            if (isCreateAllMode) {
                const selClass = document.getElementById('filter-class')?.value || 'Ten';
                const selSec = document.getElementById('filter-section')?.value || 'বিজ্ঞান';
                const selExam = document.getElementById('filter-exam')?.value || localStorage.getItem('school_marksheet_exam') || (typeof getAllExams === 'function' ? (getAllExams()[0] || 'বার্ষিক পরীক্ষা') : 'বার্ষিক পরীক্ষা');
                renderBatchMarksheets1(selClass, selSec, selExam);
            } else {
                syncCascadingFilters('search_typing');
            }
        }

        function renderSearchSuggestions(query) {
            const dropdown = document.getElementById('search-suggestions-dropdown');
            if (!dropdown) return;

            if (!query) {
                dropdown.style.display = 'none';
                dropdown.innerHTML = '';
                return;
            }

            const currentClass = document.getElementById('filter-class')?.value || localStorage.getItem('school_marksheet_class') || '';
            const currentSection = document.getElementById('filter-section')?.value || localStorage.getItem('school_marksheet_section') || '';
            const normC = normalizeClassString(currentClass);
            const normS = normalizeSectionString(currentSection);

            const allStudents = getAllStudentsList();
            // নির্বাচন করা "শ্রেণি" এর নাম অনুসারে শুধুমাত্র উক্ত শ্রেণির শিক্ষার্থীদের ফিল্টার করা হচ্ছে
            const classStudents = allStudents.filter(st => {
                const sClass = normalizeClassString(st.class || st.className);
                return sClass === normC;
            });

            const matches = classStudents.filter(st => matchesStudentQuery(st, query));

            if (matches.length === 0) {
                dropdown.innerHTML = `<div class="search-no-result">${escapeHtml(currentClass)} শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি</div>`;
                dropdown.style.display = 'block';
                window._currentSearchMatches = [];
                return;
            }

            matches.sort((a, b) => {
                const aS = normalizeSectionString(a.section || a.group || a.sectionName);
                const bS = normalizeSectionString(b.section || b.group || b.sectionName);

                const aSame = (aS === normS || !normS) ? 1 : 0;
                const bSame = (bS === normS || !normS) ? 1 : 0;
                if (aSame !== bSame) return bSame - aSame;

                const aRoll = parseInt(toEnDigits(a.roll || 0), 10) || 0;
                const bRoll = parseInt(toEnDigits(b.roll || 0), 10) || 0;
                return aRoll - bRoll;
            });

            const topMatches = matches.slice(0, 10);
            window._currentSearchMatches = topMatches;

            let itemsHtml = topMatches.map((st, idx) => {
                const name = escapeHtml(st.nameBn || st.name || 'শিক্ষার্থী');
                const roll = toBnDigits(st.roll || st.rollNo || '');
                const stClass = escapeHtml(st.class || st.className || currentClass);
                const stSec = escapeHtml(st.section || st.group || st.sectionName || '—');
                const stId = getEffectiveStudentId(st, currentClass, idx + 1);

                return `
                <div class="search-suggestion-item" onmousedown="selectSearchedStudentByIndex(${idx})">
                    <div class="search-suggestion-name">${name}</div>
                    <div class="search-suggestion-meta">
                        <span class="search-suggestion-badge roll">রোল: ${roll}</span>
                        <span class="search-suggestion-badge">শ্রেণি: ${stClass}</span>
                        <span class="search-suggestion-badge">শাখা: ${stSec}</span>
                        ${stId ? `<span class="search-suggestion-badge">ID: ${toBnDigits(stId)}</span>` : ''}
                    </div>
                </div>`;
            }).join('');

            dropdown.innerHTML = itemsHtml;
            dropdown.style.display = 'block';
        }

        function selectSearchedStudentByIndex(idx) {
            if (window._currentSearchMatches && window._currentSearchMatches[idx]) {
                selectSearchedStudent(window._currentSearchMatches[idx]);
            }
        }

        function selectSearchedStudent(student) {
            currentSelectedStudent = student;
            currentSearchQuery = '';

            const input = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            const dropdown = document.getElementById('search-suggestions-dropdown');

            const rollBn = toBnDigits(student.roll || student.rollNo || '০১');
            const name = student.nameBn || student.name || 'শিক্ষার্থী';
            if (input) {
                input.value = `[রোল ${rollBn}] ${name}`;
            }
            if (clearBtn) clearBtn.style.display = 'inline-block';
            if (dropdown) dropdown.style.display = 'none';

            const stSec = student.section || student.group || student.sectionName;
            if (stSec) {
                localStorage.setItem('school_marksheet_section', stSec);
                const secSelect = document.getElementById('filter-section');
                if (secSelect) secSelect.value = stSec;
            }

            if (isCreateAllMode) {
                isCreateAllMode = false;
                const btn = document.getElementById('btn-create-all');
                const btnText = document.getElementById('create-all-btn-text');
                if (btn) {
                    btn.classList.remove('active');
                    if (btnText) btnText.innerText = 'একক শিক্ষার্থী (Single)';
                }
            }

            syncCascadingFilters('student_searched');
        }

        function clearStudentSearch() {
            currentSearchQuery = '';
            currentSelectedStudent = null;

            const input = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            const dropdown = document.getElementById('search-suggestions-dropdown');

            if (input) input.value = '';
            if (clearBtn) clearBtn.style.display = 'none';
            if (dropdown) dropdown.style.display = 'none';

            syncCascadingFilters('search_cleared');
        }

        function handleStudentSearchKeydown(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (window._currentSearchMatches && window._currentSearchMatches.length > 0) {
                    selectSearchedStudent(window._currentSearchMatches[0]);
                } else {
                    const query = (document.getElementById('filter-student-search')?.value || '').trim();
                    if (query) {
                        const currentClass = document.getElementById('filter-class')?.value || localStorage.getItem('school_marksheet_class') || '';
                        const normC = normalizeClassString(currentClass);
                        const all = getAllStudentsList();
                        const classStudents = all.filter(st => normalizeClassString(st.class || st.className) === normC);
                        const matched = classStudents.find(s => matchesStudentQuery(s, query));
                        if (matched) {
                            selectSearchedStudent(matched);
                        }
                    }
                }
                if (dropdown) dropdown.style.display = 'none';
            } else if (e.key === 'Escape') {
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
            }
        }

        function handleStudentSearchFocus() {
            const input = document.getElementById('filter-student-search');
            const query = input ? input.value.trim() : '';
            if (query && !query.startsWith('[রোল')) {
                renderSearchSuggestions(query);
            }
        }

        // Close search suggestions on outside click
        document.addEventListener('click', function(e) {
            const wrapper = document.querySelector('.search-input-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
            }
        });

        // Master Cascading Filter Function for Marksheet1
function syncCascadingFilters(trigger = 'all') {
    try {
        const examSelect = document.getElementById('filter-exam');
        const classSelect = document.getElementById('filter-class');
        const sectionSelect = document.getElementById('filter-section');

        const allExams = getAllExams();

        // 1. Sync Exams from "Exam List" (Only exams with a subject created)
        if (examSelect && (trigger === 'all' || trigger === 'exam_sync')) {
            const currentExam = examSelect.value || localStorage.getItem('school_marksheet_exam') || '';
            const currExamOpts = Array.from(examSelect.options).map(o => o.value);
            const isDiff = allExams.length !== currExamOpts.length || allExams.some((ex, i) => ex !== currExamOpts[i]);
            if (isDiff) {
                if (allExams.length > 0) {
                    examSelect.innerHTML = allExams.map(ex => `<option value="${ex}">${ex}</option>`).join('');
                    const matchedOpt = allExams.find(ex => isExamMatch(ex, currentExam));
                    if (matchedOpt) {
                        examSelect.value = matchedOpt;
                    } else {
                        examSelect.selectedIndex = 0;
                    }
                } else {
                    examSelect.innerHTML = '<option value="">(কোনো পরীক্ষা পাওয়া যায়নি)</option>';
                    examSelect.value = '';
                }
            }
        }

        const selectedExam = examSelect && examSelect.value ? examSelect.value : (allExams[0] || '');
        localStorage.setItem('school_marksheet_exam', selectedExam);
        const examPill = document.getElementById('display-exam-name-pill');
        if (examPill) examPill.innerText = selectedExam;

        // 2. Sync Classes (Dependent on selectedExam)
        if (classSelect && (trigger === 'all' || trigger === 'exam_sync' || trigger === 'exam_changed')) {
            const currentClass = classSelect.value || localStorage.getItem('school_marksheet_class') || '';
            const availableClasses = selectedExam ? getClassesForExam(selectedExam) : [];
            const currClassOpts = Array.from(classSelect.options).map(o => o.value);
            const isClassDiff = availableClasses.length !== currClassOpts.length || availableClasses.some((c, i) => c !== currClassOpts[i]);
            if (isClassDiff) {
                if (availableClasses.length > 0) {
                    classSelect.innerHTML = availableClasses.map(c => `<option value="${c}">${c}</option>`).join('');
                    const matchedOpt = availableClasses.find(c => normalizeClassString(c) === normalizeClassString(currentClass));
                    if (matchedOpt) {
                        classSelect.value = matchedOpt;
                    } else {
                        classSelect.selectedIndex = 0;
                    }
                } else {
                    classSelect.innerHTML = '<option value="">(কোনো শ্রেণি পাওয়া যায়নি)</option>';
                    classSelect.value = '';
                }
            }
        }

        const selectedClass = classSelect && classSelect.value ? classSelect.value : (localStorage.getItem('school_marksheet_class') || 'Ten');
        localStorage.setItem('school_marksheet_class', selectedClass);
        const cVal = document.getElementById('display-class-val');
        if (cVal) cVal.innerText = formatClassNameDisplay(selectedClass);

        // If currently searched/selected student is from a different class, clear it
        if (currentSelectedStudent && normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className) !== normalizeClassString(selectedClass)) {
            currentSelectedStudent = null;
            currentSearchQuery = '';
            const searchInput = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            if (searchInput) searchInput.value = '';
            if (clearBtn) clearBtn.style.display = 'none';
        }

        // 3. Sync Sections (Dependent on selectedClass)
        if (sectionSelect) {
            const currentSec = sectionSelect.value || localStorage.getItem('school_marksheet_section') || '';
            const availableSections = getSectionsForClass(selectedClass, selectedExam);
            const currSecOpts = Array.from(sectionSelect.options).map(o => o.value);
            const isSecDiff = availableSections.length !== currSecOpts.length || availableSections.some((s, i) => s !== currSecOpts[i]);
            if (isSecDiff) {
                sectionSelect.innerHTML = availableSections.map(s => `<option value="${s}">${s}</option>`).join('');
                if (currentSec && availableSections.includes(currentSec)) {
                    sectionSelect.value = currentSec;
                } else if (availableSections.length > 0) {
                    sectionSelect.selectedIndex = 0;
                }
            }
        }

        const selectedSection = sectionSelect && sectionSelect.value ? sectionSelect.value : (localStorage.getItem('school_marksheet_section') || 'বিজ্ঞান');
        localStorage.setItem('school_marksheet_section', selectedSection);
        const scVal = document.getElementById('display-section-val');
        if (scVal) scVal.innerText = selectedSection;

        // 4. Update Student Meta and Render Transcript Table
        const normClass = normalizeClassString(selectedClass);
        const normSec = normalizeSectionString(selectedSection);

        let rawStudents = localStorage.getItem('school_students');
        let students = [];
        if (rawStudents) {
            try { students = JSON.parse(rawStudents); } catch(e) {}
        }

        let matchedStudent = null;

        // Priority 1: Specifically selected student from search (must match current class)
        if (currentSelectedStudent) {
            const stNormC = normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className);
            if (stNormC === normClass) {
                matchedStudent = currentSelectedStudent;
            } else {
                currentSelectedStudent = null;
            }
        }

        if (!matchedStudent && currentSearchQuery) {
            // Priority 2: Student matching current search query within selected class only
            const classSecStudents = getAllStudentsForClassAndSection(selectedClass, selectedSection);
            matchedStudent = classSecStudents.find(s => matchesStudentQuery(s, currentSearchQuery));
            if (!matchedStudent) {
                const allSts = getAllStudentsList();
                matchedStudent = allSts.find(s => {
                    const stC = normalizeClassString(s.class || s.className);
                    return stC === normClass && matchesStudentQuery(s, currentSearchQuery);
                });
            }
        }

        if (!matchedStudent && Array.isArray(students) && students.length > 0) {
            matchedStudent = students.find(s => {
                const sClass = normalizeClassString(s.class || s.className);
                const sSec = normalizeSectionString(s.section || s.group || s.sectionName);
                return sClass === normClass && (sSec === normSec || !normSec);
            });

            if (!matchedStudent) {
                matchedStudent = students.find(s => {
                    const sClass = normalizeClassString(s.class || s.className);
                    return sClass === normClass;
                });
            }

            if (!matchedStudent && students.length > 0) {
                matchedStudent = students[0];
            }
        }

        const effectiveClass = (matchedStudent && (matchedStudent.class || matchedStudent.className)) ? (matchedStudent.class || matchedStudent.className) : selectedClass;
        const effectiveSec = (matchedStudent && (matchedStudent.section || matchedStudent.group || matchedStudent.sectionName)) ? (matchedStudent.section || matchedStudent.group || matchedStudent.sectionName) : selectedSection;
        const effectiveNormClass = normalizeClassString(effectiveClass);
        const effectiveNormSec = normalizeSectionString(effectiveSec);

        const isEn = (currentLanguage === 'en');
        let studentName = 'মো: আব্দুল্লাহ আল নোমান';
        if (matchedStudent) {
            studentName = isEn && matchedStudent.nameEn ? matchedStudent.nameEn : (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || (isEn ? 'Student Name' : 'মো: আব্দুল্লাহ আল নোমান'));
        } else if (isEn) {
            studentName = 'MD. ABDULLAH AL NOMAN';
        }

        const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '01') : '01';
        const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

        const sVal = document.getElementById('display-student-val');
        if (sVal && sVal.innerText !== studentName) sVal.innerText = studentName;
        const rVal = document.getElementById('display-roll-val');
        if (rVal) rVal.innerText = formatDigits(rollNo);
        const idVal = document.getElementById('display-id-val');
        if (idVal) idVal.innerText = formatDigits(studentId);

        if (cVal) cVal.innerText = getDisplayClassName(effectiveClass);
        if (scVal) scVal.innerText = isEn ? getEnglishSectionName(effectiveSec) : effectiveSec;

        const pillTitle = document.getElementById('display-exam-name-pill');
        if (pillTitle) pillTitle.innerText = getDisplayExamName(selectedExam);

        const isSecondary = ['9', '10'].includes(effectiveNormClass);
        const relInfo = getStudentReligionInfo(matchedStudent);
        const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

        const relVal = document.getElementById('display-religion-val');
        if (relVal) relVal.innerText = isEn ? (relInfo.en || 'Islam') : relInfo.display;

        const optVal = document.getElementById('display-optional-val');
        const optLbl = document.getElementById('label-opt-val');
        const optCol = document.getElementById('colon-opt-val');
        if (optVal) {
            if (isSecondary) {
                if (optLbl) { optLbl.style.visibility = 'visible'; optLbl.innerText = isEn ? 'Optional Subject' : 'ঐচ্ছিক বিষয়'; }
                if (optCol) optCol.style.visibility = 'visible';
                optVal.style.visibility = 'visible';
                optVal.innerText = isEn ? optInfo.name : optInfo.nameBn;
            } else {
                if (optLbl) optLbl.style.visibility = 'hidden';
                if (optCol) optCol.style.visibility = 'hidden';
                optVal.style.visibility = 'hidden';
                optVal.innerText = '—';
            }
        }

        updateTableHeaderMarks(selectedExam, selectedClass);

        if (isCreateAllMode) {
            renderBatchMarksheets1(selectedClass, selectedSection, selectedExam);
        } else {
            const batchContainer = document.getElementById('batch-marksheets-container');
            const singleContainer = document.getElementById('single-certificate-sheet');
            if (batchContainer) batchContainer.style.display = 'none';
            if (singleContainer) singleContainer.style.display = 'block';
            renderMarksheet1Table(effectiveClass, effectiveSec, matchedStudent || { roll: rollNo }, selectedExam);
        }
    } catch(e) {
        console.error("Error in syncCascadingFilters in Marksheet1:", e);
    }
}

let isCreateAllMode = true;

function toggleCreateAll() {
    isCreateAllMode = !isCreateAllMode;
    const btn = document.getElementById('btn-create-all');
    const btnText = document.getElementById('create-all-btn-text');
    if (btn) {
        if (isCreateAllMode) {
            btn.classList.add('active');
            if (btnText) btnText.innerText = 'সকল শিক্ষার্থী (All)';
        } else {
            btn.classList.remove('active');
            if (btnText) btnText.innerText = 'একক শিক্ষার্থী (Single)';
        }
    }
    syncCascadingFilters('mode_toggled');
}

function getAllStudentsForClassAndSection(selectedClass, selectedSection) {
    const normC = normalizeClassString(selectedClass);
    const normS = normalizeSectionString(selectedSection);
    const isSci = normS === 'science';

    let rawStudents = localStorage.getItem('school_students');
    let students = [];
    if (rawStudents) {
        try { students = JSON.parse(rawStudents); } catch(e) {}
    }

    let filtered = [];
    if (Array.isArray(students) && students.length > 0) {
        filtered = students.filter(s => {
            const sClass = normalizeClassString(s.class || s.className);
            const sSec = normalizeSectionString(s.section || s.group || s.sectionName);
            return sClass === normC && (sSec === normS || !normS);
        });
    }

    if (filtered.length > 0) {
        filtered.sort((a, b) => (parseInt(a.roll || 0) || 0) - (parseInt(b.roll || 0) || 0));
        return filtered;
    }

    // Fallback cohort if none present in storage
    const fallbackCohort = [
        { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', name: 'Md. Abdullah Al Noman', studentId: '2610001', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', name: 'Mst. Fatema Akter', studentId: '2610002', religion: 'Islam', optionalSubject: isSci ? 'Biology' : 'Agriculture Studies' },
        { roll: '3', nameBn: 'সৌরভ কুমার রায়', name: 'Sourav Kumar Roy', studentId: '2610003', religion: 'Hindu', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '4', nameBn: 'তানভীর হাসান', name: 'Tanvir Hasan', studentId: '2610004', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '5', nameBn: 'সাদিয়া জাহান', name: 'Sadia Jahan', studentId: '2610005', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '6', nameBn: 'প্রিয়াংকা সরকার', name: 'Priyanka Sarkar', studentId: '2610006', religion: 'Hindu', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '7', nameBn: 'মেহেদী হাসান', name: 'Mehedi Hasan', studentId: '2610007', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '8', nameBn: 'সুমাইয়া জান্নাত', name: 'Sumaiya Jannat', studentId: '2610008', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' }
    ];

    return fallbackCohort;
}

function generateMarksheet1CardHTML(student, selectedClass, selectedSection, exam, rankNum) {
    const isEn = (currentLanguage === 'en');
    const examDist = getExamDistribution(exam, selectedClass);
    const normClass = normalizeClassString(selectedClass);
    const normSec = normalizeSectionString(selectedSection);
    const isSecondary = ['9', '10'].includes(normClass);
    const relInfo = getStudentReligionInfo(student);
    const optInfo = getStudentOptionalSubjectInfo(student, normSec);

    const studentName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
    const rollNo = student ? (student.roll || student.rollNo || rankNum) : rankNum;
    const studentId = getEffectiveStudentId(student, selectedClass, rankNum);
    const displayCls = getDisplayClassName(selectedClass);
    const displaySec = isEn ? getEnglishSectionName(selectedSection) : (selectedSection || 'বিজ্ঞান');
    const displayExam = getDisplayExamName(exam);
    const displayRel = isEn ? (relInfo.en || 'Islam') : relInfo.display;
    const displayOpt = isEn ? optInfo.name : optInfo.nameBn;

    let rawSettings = localStorage.getItem('school_settings');
    let settings = {};
    if (rawSettings) { try { settings = JSON.parse(rawSettings); } catch(e) {} }
    const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাপীঠ উচ্চ বিদ্যালয়";
    let addressText = settings.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
    const extraParts = [];
    if (settings.schoolEIIN || settings.eiin) extraParts.push("ইআইআইএন: " + (settings.schoolEIIN || settings.eiin));
    else extraParts.push("ইআইআইএন: ১২৭৫৪৩");
    if (settings.schoolCode || settings.code) extraParts.push("কোড: " + (settings.schoolCode || settings.code));
    else extraParts.push("কোড: ৫৬১২");
    const fullSubtitle = addressText + " | " + extraParts.join(" | ");

    const customLogo = localStorage.getItem('school_logo') || (settings && settings.schoolLogo) || 'school_logo.svg';
    let logoPosStyle = '';
    const savedPos = localStorage.getItem('marksheet_logo_pos_v2');
    if (savedPos) {
        try {
            const { left, top } = JSON.parse(savedPos);
            if (left !== undefined && top !== undefined) {
                logoPosStyle = ` style="left: ${left}px; top: ${top}px;"`;
            }
        } catch(e) {}
    }

    const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);

    let tableHtml = '';
    let grandTotal = 0;
    let totalFullMarks = 0;
    let totalGP = 0;
    let subjectCount = 0;
    let hasFailed = false;
    let hasAnyMarks = false;

    let hasCompulsoryHeader = false;
    let hasElectiveHeader = false;
    let hasOptionalHeader = false;

    let mainSubjectsGP = 0;
    let mainSubjectCount = 0;
    let optionalBonusGP = 0;

    subjects.forEach(sub => {
        const isOpt = !!(sub.isOptional || sub.group === 'optional');
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            tableHtml += `<tr class="group-header-row"><td colspan="9">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            tableHtml += `<tr class="group-header-row"><td colspan="9">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            tableHtml += `<tr class="group-header-row"><td colspan="9">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`;
            hasOptionalHeader = true;
        }

        if (sub.isCombined) {
            const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;
            const m1 = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const m2 = sub.pairTotal !== null ? sub.pairTotal : ((parseInt(sub.pairMcq) || 0) + (parseInt(sub.pairCq) || 0) + (parseInt(sub.pairPr) || 0));
            const combTotal = m1 + m2;
            const fullTotal = (sub.fullMarks || 100) + (sub.pairFull || 100);
            const res = hasPaperMarks ? calculateGradeAndGP(combTotal, fullTotal) : { grade: '—', gp: 0 };

            if (hasPaperMarks) {
                hasAnyMarks = true;
                grandTotal += combTotal;
                totalFullMarks += fullTotal;
                totalGP += res.gp;
                subjectCount++;
                if (isOpt) {
                    if (res.gp > 2.00) optionalBonusGP += (res.gp - 2.00);
                } else {
                    mainSubjectsGP += res.gp;
                    mainSubjectCount++;
                    if (res.gp === 0) hasFailed = true;
                }
            }

            const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const p1TotDisplay = sub.hasMarks ? formatDigits(m1) : '<span class="blank-field">—</span>';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '<span class="blank-field">—</span>');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '<span class="blank-field">—</span>');
                    const p2TotDisplay = sub.pairHasMarks ? formatDigits(m2) : '<span class="blank-field">—</span>';

            const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '<span class="blank-field">—</span>';
            const combGradeDisplay = hasPaperMarks ? res.grade : '—';
            const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            tableHtml += `<tr>
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${getDisplaySubjectName(sub.pairWith)}</td>
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;
        } else {
            const tot = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const res = sub.hasMarks ? calculateGradeAndGP(tot, sub.fullMarks) : { grade: '—', gp: 0 };

            if (sub.hasMarks) {
                hasAnyMarks = true;
                grandTotal += tot;
                totalFullMarks += sub.fullMarks;
                totalGP += res.gp;
                subjectCount++;
                if (isOpt) {
                    if (res.gp > 2.00) optionalBonusGP += (res.gp - 2.00);
                } else {
                    mainSubjectsGP += res.gp;
                    mainSubjectCount++;
                    if (res.gp === 0) hasFailed = true;
                }
            }

            const isOptional = sub.group === 'optional';
            const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const totDisplay = sub.hasMarks ? formatDigits(tot) : '<span class="blank-field">—</span>';
            const gradeDisplay = sub.hasMarks ? res.grade : '—';
            const gpDisplay = sub.hasMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            tableHtml += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;
        }
    });

    renderGradingScaleLegend1();
    if (mainSubjectCount === 0) mainSubjectCount = subjectCount || 1;
    const maxGP = getMaxScaleGP();
    const rawGpa = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
    const boundedGpa = Math.min(maxGP, rawGpa);
    const zeroGpaStr = isEn ? '0.00' : '০.০০';
    const finalGpaStr = hasAnyMarks ? (hasFailed ? zeroGpaStr : formatDigits(boundedGpa.toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';
    const rankStr = formatDigits(rankNum);

    return `
    <div class="certificate-sheet" style="margin-bottom: 25px;">
        <div class="inner-border">
            
            <!-- Header Section -->
            <div class="institution-header">
                <div class="header-text-box">
                    <div class="inst-title-bn">${schoolName}</div>
                    <div class="inst-subtitle">${fullSubtitle}</div>
                    <div>
                        <span class="report-pill-title">${displayExam}</span>
                    </div>
                </div>
            </div>

            <!-- Student Meta & Grading Scale -->
            <div class="header-meta-row">
                <div class="student-profile-cell">
                    <div class="profile-card">
                        <table class="profile-grid">
                            <tr>
                                <td class="p-label" style="font-size: 15.1px; font-weight: 800;">${isEn ? "Student Name" : "শিক্ষার্থীর নাম"}</td>
                                <td class="p-colon" style="font-size: 15.1px; font-weight: 800;">:</td>
                                <td class="p-val" colspan="4" style="font-size: 15.6px; font-weight: 800;">${studentName}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "Class" : "শ্রেণি"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val" style="width: 25%;">${displayCls}</td>
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Section / Group" : "শাখা / গ্রুপ"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displaySec}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "ID / Reg" : "আইডি / রেজি"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${formatDigits(studentId)}</td>
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Roll No" : "রোল নং"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${formatDigits(String(rollNo).padStart(2, '0'))}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "Religion" : "ধর্ম (Religion)"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displayRel}</td>
                                ${isSecondary ? `
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Optional Subject" : "ঐচ্ছিক বিষয়"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displayOpt}</td>
                                ` : `
                                <td class="p-label" style="padding-left: 15px; visibility: hidden;">—</td>
                                <td class="p-colon" style="visibility: hidden;">:</td>
                                <td class="p-val" style="visibility: hidden;">—</td>
                                `}
                            </tr>
                        </table>
                    </div>
                </div>

                <div class="grading-legend-cell">
                    <div class="legend-card">
                        <div class="legend-title">${isEn ? "Grading Scale" : "গ্রেডিং নির্দেশিকা (Grading Scale)"}</div>
                        <table class="legend-table">
                            <thead>
                                <tr>
                                    <th>${isEn ? "Marks Range" : "নম্বর সীমা"}</th>
                                    <th>${isEn ? "Grade" : "গ্রেড"}</th>
                                    <th>${isEn ? "GPA" : "পয়েন্ট"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${getGradingScaleLegendRowsHTML1()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Academic Evaluation Table -->
            <table class="transcript-table">
                <thead>
                    <tr>
                        <th rowspan="2" id="th-header-sub-1" style="width: 27%;">${isEn ? "Subjects" : "পাঠ্য বিষয়সমূহ"}</th>
                        <th rowspan="2" id="th-header-full-1" style="width: 8%;">${isEn ? "Full Marks" : "পূর্ণমান"}</th>
                        <th colspan="3" id="th-header-obtained-1" style="width: 25%;">${isEn ? "Marks Obtained" : "প্রাপ্ত নম্বর"}</th>
                        <th rowspan="2" style="width: 9%;">${isEn ? "Total (" + formatDigits(examDist.total) + ")" : "মোট নম্বর (" + formatDigits(examDist.total) + ")"}</th>
                        <th rowspan="2" id="th-header-combined-1" style="width: 11%;">${isEn ? "Grand Total" : "সর্বমোট"}</th>
                        <th rowspan="2" id="th-header-grade-1" style="width: 9%;">${isEn ? "Letter Grade" : "লেটার গ্রেড"}</th>
                        <th rowspan="2" id="th-header-gp-1" style="width: 11%;">${isEn ? "Grade Point (GP)" : "গ্রেড পয়েন্ট (GP)"}</th>
                    </tr>
                    <tr>
                        <th style="width: 8%;">${isEn ? "MCQ (" + formatDigits(examDist.mcq) + ")" : "বহুনির্বাচনি (" + formatDigits(examDist.mcq) + ")"}</th>
                        <th style="width: 8%;">${isEn ? "CQ (" + formatDigits(examDist.cq) + ")" : "লিখিত (" + formatDigits(examDist.cq) + ")"}</th>
                        <th style="width: 9%;">${isEn ? "Prac. (" + formatDigits(examDist.prac) + ")" : "ব্যবহারিক (" + formatDigits(examDist.prac) + ")"}</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableHtml}
                </tbody>
            </table>

            <!-- Result KPI Badges -->
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-label">${isEn ? "Total Marks Obtained" : "সর্বমোট প্রাপ্ত নম্বর"}</div>
                    <div class="kpi-value">${hasAnyMarks ? (formatDigits(grandTotal) + ' / ' + formatDigits(totalFullMarks)) : '—'}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "GPA" : "জিপিএ (GPA)"}</div>
                    <div class="kpi-value" style="color: #000000; font-weight:800;">${finalGpaStr}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "Final Grade" : "চূড়ান্ত গ্রেড"}</div>
                    <div class="kpi-value" style="color: #000000; font-weight:800;">${finalGrade}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "Merit Position" : "মেধাক্রম (Merit Position)"}</div>
                    <div class="kpi-value">${rankStr}</div>
                </div>
            </div>

            <!-- Signatures -->
            <div class="signature-grid">
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Guardian's Signature" : "অভিভাবকের স্বাক্ষর"}</div>
                </div>
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Class Teacher's Signature" : "শ্রেণি শিক্ষকের স্বাক্ষর"}</div>
                </div>
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Head Teacher's Signature & Seal" : "প্রধান শিক্ষকের স্বাক্ষর ও সিল"}</div>
                </div>
            </div>

        </div>

        <div class="header-logo-box"${logoPosStyle}>
            <img src="${customLogo}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; pointer-events: none; display: block;" onerror="this.src='school_logo.svg'">
        </div>
    </div>`;
}

function renderBatchMarksheets1(selectedClass, selectedSection, exam) {
    const batchContainer = document.getElementById('batch-marksheets-container');
    const singleContainer = document.getElementById('single-certificate-sheet');
    if (!batchContainer) return;

    const allStudents = getAllStudentsForClassAndSection(selectedClass, selectedSection);
    const isFiltered = Boolean(currentSearchQuery);
    const students = isFiltered
        ? allStudents.filter(st => matchesStudentQuery(st, currentSearchQuery))
        : allStudents;

    if (students.length === 0) {
        batchContainer.innerHTML = `
        <div class="batch-status-banner no-print" style="flex-direction: column; text-align: center; padding: 25px 20px; gap: 12px; justify-content: center; margin: 20px auto;">
            <div style="font-size: 16px; font-weight: 700; color: #f87171;">
                "${escapeHtml(currentSearchQuery)}" এর সাথে কোনো শিক্ষার্থীর মার্কশীট পাওয়া যায়নি!
            </div>
            <div style="font-size: 13px; color: #cbd5e1;">
                রোল নম্বর, শিক্ষার্থীর নাম অথবা আইডি পুনরায় যাচাই করুন।
            </div>
            <button type="button" class="btn-batch-action btn-batch-single" onclick="clearStudentSearch()" style="background: #3b82f6; color: #fff; margin-top: 5px; padding: 6px 16px;">
                সকল শিক্ষার্থীর মার্কশীট প্রদর্শন করুন
            </button>
        </div>`;
        batchContainer.style.display = 'block';
        if (singleContainer) singleContainer.style.display = 'none';
        return;
    }

    let html = `
    <div class="batch-status-banner no-print">
        <div class="batch-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>শ্রেণি: <strong>${selectedClass}</strong> | শাখা: <strong>${selectedSection}</strong> | পরীক্ষা: <strong>${exam}</strong></span>
            <span class="badge-count">মোট ${toBnDigits(students.length)} জন শিক্ষার্থী${isFiltered ? ' (অনুসন্ধান)' : ''}</span>
        </div>
        <div class="batch-actions">
            ${isFiltered ? `
            <button type="button" class="btn-batch-action btn-batch-single" onclick="clearStudentSearch()" title="সার্চ মুছুন এবং সকল শিক্ষার্থী দেখুন">
                <span>সকল শিক্ষার্থী</span>
            </button>` : ''}
            <button type="button" class="btn-batch-action btn-batch-print" onclick="window.print()" title="প্রদর্শিত সকল শিক্ষার্থীর মার্কশীট প্রিন্ট করুন">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span>Print ${isFiltered ? 'Filtered' : 'All'}</span>
            </button>
            <button type="button" class="btn-batch-action btn-batch-single" onclick="toggleCreateAll()" title="একক শিক্ষার্থী ভিউতে ফিরে যান">
                <span>Single View</span>
            </button>
        </div>
    </div>`;

    students.forEach((st, idx) => {
        html += generateMarksheet1CardHTML(st, selectedClass, selectedSection, exam, idx + 1);
    });

    batchContainer.innerHTML = html;
    batchContainer.style.display = 'block';
    if (singleContainer) singleContainer.style.display = 'none';
}

function updateMarksheetExam(val) {
    localStorage.setItem('school_marksheet_exam', val);
    syncCascadingFilters('exam_changed');
}

function updateMarksheetClass(val) {
            localStorage.setItem('school_marksheet_class', val);
            if (currentSelectedStudent && normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className) !== normalizeClassString(val)) {
                currentSelectedStudent = null;
                currentSearchQuery = '';
                const input = document.getElementById('filter-student-search');
                const clearBtn = document.getElementById('btn-clear-search');
                if (input) input.value = '';
                if (clearBtn) clearBtn.style.display = 'none';
            }
            syncCascadingFilters('class_changed');
        }

function updateMarksheetSection(val) {
            localStorage.setItem('school_marksheet_section', val);
            if (currentSelectedStudent && normalizeSectionString(currentSelectedStudent.section || currentSelectedStudent.group) !== normalizeSectionString(val)) {
                currentSelectedStudent = null;
                currentSearchQuery = '';
                const input = document.getElementById('filter-student-search');
                const clearBtn = document.getElementById('btn-clear-search');
                if (input) input.value = '';
                if (clearBtn) clearBtn.style.display = 'none';
            }
            syncCascadingFilters('section_changed');
        }

function switchTemplate(val) {
            let extra = isCreateAllMode ? '?mode=all' : '?mode=single';
            const roll = currentSelectedStudent ? (currentSelectedStudent.roll || currentSelectedStudent.rollNo) : '';
            if (roll) {
                extra += '&roll=' + encodeURIComponent(toEnDigits(roll));
            }
            if (currentLanguage) {
                extra += '&lang=' + encodeURIComponent(currentLanguage);
            }
            if (val === 'Temp-01') {
                window.location.href = 'Marksheet.html' + extra;
            } else if (val === 'Temp-02') {
                window.location.href = 'Marksheet1.html' + extra;
            }
        }

// Dynamically sync School Header Information from main website settings
function syncSchoolHeaderInfo() {
    try {
        let rawSettings = localStorage.getItem('school_settings');
        let settings = {};
        if (rawSettings) {
            try { settings = JSON.parse(rawSettings); } catch(e) {}
        }
        const customLogo = localStorage.getItem('school_logo') || (settings && settings.schoolLogo);

        // Update School Name
        const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাপীঠ উচ্চ বিদ্যালয়";
        const nameEl = document.getElementById('display-school-name');
        if (nameEl && nameEl.innerText !== schoolName) {
            nameEl.innerText = schoolName;
        }

        // Update Subtitle / Address line
        let addressText = settings.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
        const extraParts = [];
        if (settings.schoolEIIN || settings.eiin) extraParts.push("ইআইআইএন: " + (settings.schoolEIIN || settings.eiin));
        else extraParts.push("ইআইআইএন: ১২৭৫৪৩");
        if (settings.schoolCode || settings.code) extraParts.push("কোড: " + (settings.schoolCode || settings.code));
        else extraParts.push("কোড: ৫৬১২");

        const subEl = document.getElementById('display-school-subtitle');
        if (subEl) {
            const fullSubtitle = addressText + " | " + extraParts.join(" | ");
            if (subEl.innerText !== fullSubtitle) {
                subEl.innerText = fullSubtitle;
            }
        }

        // Update Logo (Website School Logo)
        const targetLogo = customLogo || 'school_logo.svg';
        const logoImg = document.getElementById('school-logo-img-1');
        if (logoImg) {
            if (logoImg.getAttribute('src') !== targetLogo) {
                logoImg.src = targetLogo;
            }
            logoImg.style.display = 'block';
        }

        // Also update all batch marksheet logos in DOM
        document.querySelectorAll('#batch-marksheets-container .header-logo-box img').forEach(img => {
            if (img.getAttribute('src') !== targetLogo) {
                img.src = targetLogo;
            }
        });

        // Background live sync from website server database (/api/db)
        if (!window._lastLogoApiFetch || Date.now() - window._lastLogoApiFetch > 3000) {
            window._lastLogoApiFetch = Date.now();
            fetch('/api/db?keys=school_logo,school_settings')
                .then(r => r.json())
                .then(data => {
                    if (data) {
                        let updated = false;
                        if (data.school_logo && typeof data.school_logo === 'string') {
                            if (localStorage.getItem('school_logo') !== data.school_logo) {
                                localStorage.setItem('school_logo', data.school_logo);
                                updated = true;
                            }
                        }
                        if (data.school_settings) {
                            const strVal = typeof data.school_settings === 'string' ? data.school_settings : JSON.stringify(data.school_settings);
                            if (localStorage.getItem('school_settings') !== strVal) {
                                localStorage.setItem('school_settings', strVal);
                                updated = true;
                            }
                        }
                        if (updated) {
                            syncSchoolHeaderInfo();
                        }
                    }
                })
                .catch(() => {});
        }
    } catch (e) {
        console.error("Error syncing school header from website settings:", e);
    }
}

// Background live sync from website server database (/api/db)
function syncLiveExamData() {
    if (window._lastExamApiFetch && (Date.now() - window._lastExamApiFetch < 3000)) return;
    window._lastExamApiFetch = Date.now();
    fetch('/api/db?keys=school_exam_schedules,school_student_marks,school_students,school_subjects,school_classes,school_exam_types,school_exam_routines,school_omr_exams,school_marking_system,school_settings,school_logo')
        .then(r => r.json())
        .then(data => {
            if (data && typeof data === 'object') {
                let hasChanged = false;
                ['school_exam_schedules', 'school_student_marks', 'school_students', 'school_subjects', 'school_classes', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_marking_system'].forEach(k => {
                    if (data[k]) {
                        const strVal = typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]);
                        if (localStorage.getItem(k) !== strVal) {
                            localStorage.setItem(k, strVal);
                            hasChanged = true;
                        }
                    }
                });
                if (data.school_settings) {
                    const strVal = typeof data.school_settings === 'string' ? data.school_settings : JSON.stringify(data.school_settings);
                    if (localStorage.getItem('school_settings') !== strVal) {
                        localStorage.setItem('school_settings', strVal);
                        if (typeof syncSchoolHeaderInfo === 'function') syncSchoolHeaderInfo();
                    }
                }
                if (data.school_logo && typeof data.school_logo === 'string') {
                    if (localStorage.getItem('school_logo') !== data.school_logo) {
                        localStorage.setItem('school_logo', data.school_logo);
                        if (typeof syncSchoolHeaderInfo === 'function') syncSchoolHeaderInfo();
                    }
                }
                if (hasChanged) {
                    syncCascadingFilters('exam_sync');
                }
            }
        })
        .catch(() => {});
}

// Continuous Live Sync of Filter Options from Exam Portal
function syncFiltersFromExamPortal() {
    syncLiveExamData();
    syncCascadingFilters('exam_sync');
}

// Initialize saved filters & header on load
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramRoll = urlParams.get('roll') || urlParams.get('search') || urlParams.get('id');

    if (urlParams.get('exam')) localStorage.setItem('school_marksheet_exam', urlParams.get('exam'));
    if (urlParams.get('class')) localStorage.setItem('school_marksheet_class', urlParams.get('class'));
    if (urlParams.get('section')) localStorage.setItem('school_marksheet_section', urlParams.get('section'));

    if (paramRoll) {
        isCreateAllMode = false;
        const selClass = urlParams.get('class') || localStorage.getItem('school_marksheet_class') || 'Ten';
        const normC = normalizeClassString(selClass);
        const all = getAllStudentsList();
        const found = all.find(s => {
            const stC = normalizeClassString(s.class || s.className);
            return (!normC || stC === normC) && matchesStudentQuery(s, paramRoll);
});
        if (found) {
            currentSelectedStudent = found;
            const input = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            if (input) input.value = currentLanguage === 'en' ? `[Roll ${formatDigits(found.roll || '1')}] ${found.nameEn || found.nameBn || found.name || 'Student'}` : `[রোল ${toBnDigits(found.roll || '১')}] ${found.nameBn || found.name || 'শিক্ষার্থী'}`;
            if (clearBtn) clearBtn.style.display = 'inline-block';
            if (found.class) localStorage.setItem('school_marksheet_class', found.class);
            if (found.section) localStorage.setItem('school_marksheet_section', found.section);
        }
    } else if (urlParams.get('mode') === 'single') {
        isCreateAllMode = false;
    } else {
        isCreateAllMode = true;
    }

    const btn = document.getElementById('btn-create-all');
    const btnText = document.getElementById('create-all-btn-text');
    if (btn) {
        if (isCreateAllMode) {
            btn.classList.add('active');
            if (btnText) btnText.innerText = 'সকল শিক্ষার্থী (All)';
        } else {
            btn.classList.remove('active');
            if (btnText) btnText.innerText = 'একক শিক্ষার্থী (Single)';
        }
    }

    syncSchoolHeaderInfo();
    updateLanguageUI1();
    syncCascadingFilters('all');
});

// Listen for live changes from Exam Portal & main website settings across tabs and database sync
window.addEventListener('storage', function(e) {
    if (!e.key || e.key === 'school_settings' || e.key === 'school_logo') {
        syncSchoolHeaderInfo();
    }
    if (!e.key || e.key.startsWith('school_exam_') || e.key === 'school_student_marks' || e.key === 'school_classes' || e.key === 'school_sections' || e.key === 'school_groups' || e.key === 'school_students' || e.key === 'school_subjects' || e.key === 'school_marking_system') {
        syncCascadingFilters('all');
    }
});
window.addEventListener('dbSynced', function() {
    syncSchoolHeaderInfo();
    syncCascadingFilters('all');
});

// Continuous heartbeat sync every 2.5 seconds
setInterval(function() {
    syncSchoolHeaderInfo();
    syncLiveExamData();
    syncCascadingFilters('exam_sync');
}, 2500);

;

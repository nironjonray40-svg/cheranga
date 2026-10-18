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

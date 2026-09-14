// --- ERP AUTHENTICATION ENFORCEMENT GUARD ---
(function enforceErpAuth() {
    try {
        const rawPath = window.location.pathname.toLowerCase();
        let cleanName = rawPath.substring(rawPath.lastIndexOf('/') + 1);
        if (cleanName.endsWith('.html')) cleanName = cleanName.slice(0, -5);
        
        // Allowed public pages
        const publicPages = ['cms', 'teachers', 'contact', ''];
        const isPublic = publicPages.includes(cleanName) || rawPath === '/' || rawPath === '';

        if (!isPublic) {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                window.location.replace('cms.html?login=required');
            }
        }
    } catch (e) {
        console.error('Auth check error:', e);
    }
})();

// --- HIDE .HTML EXTENSIONS FROM URL ADDRESS BAR ---
(function cleanUrlExtension() {
    if (window.location.pathname && window.location.pathname.endsWith('.html')) {
        let cleanPath = window.location.pathname.slice(0, -5);
        if (cleanPath.endsWith('/index')) {
            cleanPath = cleanPath.slice(0, -6) || '/';
        }
        try {
            window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
        } catch (e) { }
    }
})();

// --- DETECT DESKTOP VIEW ON MOBILE & TABLET DEVICES AND EXPAND WIDTH BY 50% ON THE RIGHT ---
(function handleDesktopViewOnMobile() {
    function applyDesktopViewStyle() {
        const isMobileOrTablet = (navigator.maxTouchPoints > 0 ||
            /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent));
        const isDesktopView = window.innerWidth >= 980;

        if (isMobileOrTablet && isDesktopView) {
            document.documentElement.classList.add('desktop-view-on-mobile');
            document.body.classList.add('desktop-view-on-mobile');
        } else {
            document.documentElement.classList.remove('desktop-view-on-mobile');
            document.body.classList.remove('desktop-view-on-mobile');
        }
    }

    window.addEventListener('DOMContentLoaded', applyDesktopViewStyle);
    window.addEventListener('resize', applyDesktopViewStyle);
    applyDesktopViewStyle();
})();

// --- GLOBAL TOAST NOTIFICATION SYSTEM ---
function showToastNotification(message, type = 'success') {
    let container = document.getElementById('global-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        container.style.cssText = 'position: fixed; bottom: 25px; right: 25px; z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; max-width: 90vw;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'error' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    const icon = type === 'error' ? '⚠️' : '✅';

    toast.style.cssText = `
        background: ${bg};
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', sans-serif;
        font-size: 0.94rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
        pointer-events: auto;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 350);
    }, 3200);
}
window.showToastNotification = showToastNotification;

// --- GLOBAL ESCAPE HTML HELPER ---
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

// --- ROLE & PERMISSIONS SCHEMA AND ACCESS CONTROLS ---
const ALL_PERMISSIONS = [
    // 1. Dashboard & Live Chat
    { id: 'dashboard_view', category: 'dashboard', name: 'ড্যাশবোর্ড ও পরিসংখ্যান পরিদর্শন', desc: 'ওয়েবসাইটের মূল ড্যাশবোর্ড ও সকল সংক্ষিপ্ত পরিসংখ্যান দেখতে পারবেন' },
    { id: 'live_chat', category: 'dashboard', name: 'লাইভ কমিউনিটি চ্যাট', desc: 'অন্যান্য শিক্ষক ও অ্যাডমিনের সাথে রিয়েল-টাইম চ্যাট ও বার্তা আদান-প্রদান' },
    { id: 'active_users', category: 'dashboard', name: 'সক্রিয় ব্যবহারকারী ও ডিভাইস ট্র্যাকিং', desc: 'কে কোন ডিভাইস ও জেলা থেকে সক্রিয় তা পর্যবেক্ষণ' },

    // 2. Staff Management
    { id: 'staff_view', category: 'staff', name: 'শিক্ষক-কর্মচারী তালিকা পরিদর্শন', desc: 'সকল শিক্ষক ও কর্মচারীদের তথ্য ও ডিরেক্টরি দেখা' },
    { id: 'staff_add', category: 'staff', name: 'নতুন শিক্ষক/স্টাফ যুক্ত করা', desc: 'স্টাফ ডিরেক্টরিতে নতুন সদস্য যুক্ত করার অনুমতি' },
    { id: 'staff_edit', category: 'staff', name: 'শিক্ষক/স্টাফ তথ্য এডিট', desc: 'বিদ্যমান শিক্ষক ও কর্মচারীদের ব্যক্তিগত ও পেশাগত তথ্য আপডেট' },
    { id: 'staff_delete', category: 'staff', name: 'শিক্ষক/স্টাফ মুছে ফেলা', desc: 'তালিকা থেকে শিক্ষক বা কর্মচারীর তথ্য মুছে ফেলার অনুমতি' },
    { id: 'staff_excel', category: 'staff', name: 'এক্সেল ইমপোর্ট ও ডাউনলোড', desc: 'বালক এক্সেল ফাইল থেকে স্টাফ ডাটা আপলোড ও টেমপ্লেট ডাউনলোড' },

    // 3. Student Portal
    { id: 'student_view', category: 'student', name: 'শিক্ষার্থী তালিকা ও প্রোফাইল পরিদর্শন', desc: 'সকল শিক্ষার্থীর বিস্তারিত তথ্য, রোল ও প্রোফাইল দেখা' },
    { id: 'student_add', category: 'student', name: 'নতুন শিক্ষার্থী ভর্তি ও নিবন্ধন', desc: 'নতুন শিক্ষার্থী এন্ট্রি ও ভর্তি ফরম পূরণ' },
    { id: 'student_edit', category: 'student', name: 'শিক্ষার্থীর তথ্য ও রোল এডিট', desc: 'শিক্ষার্থীর নাম, রোল, বিভাগ ও অভিভাবকের তথ্য সংশোধন' },
    { id: 'student_delete', category: 'student', name: 'শিক্ষার্থী প্রোফাইল মুছে ফেলা', desc: 'ডাটাবেজ থেকে শিক্ষার্থীর তথ্য ডিলিট করার অনুমতি' },
    { id: 'student_promote', category: 'student', name: 'শ্রেণি প্রমোশন ও ট্রান্সফার', desc: 'শিক্ষার্থীদের পরবর্তী শ্রেণিতে উত্তীর্ণ বা সেকশন পরিবর্তন' },
    { id: 'student_idcard', category: 'student', name: 'ডিজিটাল স্টুডেন্ট আইডি কার্ড তৈরি', desc: 'কিউআর কোডসহ শিক্ষার্থীদের আইডি কার্ড জেনারেট ও প্রিন্ট' },
    { id: 'student_excel', category: 'student', name: 'এক্সেল থেকে বালক শিক্ষার্থী ইমপোর্ট', desc: 'এক্সেল শিটের মাধ্যমে একসাথে একাধিক শিক্ষার্থীর তথ্য আপলোড' },

    // 4. Fees & Payments
    { id: 'fees_collect', category: 'fees', name: 'মাসিক ও সেশন ফি কালেকশন', desc: 'শিক্ষার্থীদের বেতন, সেশন ফি ও অন্যান্য ফি গ্রহণ ও এন্ট্রি' },
    { id: 'fees_receipt', category: 'fees', name: 'ফি মানি রিসিট প্রিন্ট ও তৈরি', desc: 'শিক্ষার্থীদের ফি জমার ডিজিটাল রশিদ প্রিন্ট ও প্রদান' },
    { id: 'fees_reports', category: 'fees', name: 'দৈনিক ও মাসিক ফি কালেকশন রিপোর্ট', desc: 'ফি আদায়ের মোট হিসাব, বকেয়া তালিকা ও আর্থিক রিপোর্ট দেখা' },
    { id: 'fees_structure', category: 'fees', name: 'শ্রেণিভিত্তিক ফি কাঠামো এডিট', desc: 'কোন শ্রেণির কত বেতন ও পরীক্ষার ফি তা কনফিগার করা' },

    // 5. Seat Plan
    { id: 'seat_generate', category: 'seat', name: 'পরীক্ষার আসন বিন্যাস তৈরি', desc: 'রোল অনুযায়ী স্বয়ংক্রিয়ভাবে পরীক্ষার সিট প্ল্যান জেনারেশন' },
    { id: 'seat_print', category: 'seat', name: 'বেঞ্চ স্লিপ ও সিট প্ল্যান প্রিন্ট', desc: 'পরীক্ষার্থীদের বেঞ্চে লাগানোর স্লিপ ও তালিকা প্রিন্ট' },
    { id: 'seat_attendance', category: 'seat', name: 'পরীক্ষার হাজিরা ও স্বাক্ষর শীট', desc: 'পরীক্ষা হলের শিক্ষার্থী হাজিরা ও স্বাক্ষর তালিকা প্রিন্ট' },
    { id: 'seat_topsheet', category: 'seat', name: 'রুম টপশীট তৈরি', desc: 'প্রতিটি রুমের জন্য রুম টপশীট রিপোর্ট তৈরি ও প্রিন্ট' },

    // 6. Exam Portal
    { id: 'exam_routine', category: 'exam', name: 'পরীক্ষার রুটিন ও সময়সূচি তৈরি', desc: 'সকল শ্রেণির পরীক্ষার রুটিন প্রস্তুত ও ওয়েবসাইটে প্রকাশ' },
    { id: 'exam_marks', category: 'exam', name: 'বিষয়ভিত্তিক নম্বর এন্ট্রি ও মূল্যায়ন', desc: 'শিক্ষার্থীদের বিষয়ভিত্তিক প্রাপ্ত নম্বর ইনপুট ও সংরক্ষণ' },
    { id: 'exam_admit', category: 'exam', name: 'এডমিট কার্ড তৈরি ও প্রিন্ট', desc: 'পরীক্ষার্থীদের প্রবেশপত্র (Admit Card) প্রিন্ট ও বিতরণ' },
    { id: 'exam_tabulation', category: 'exam', name: 'টেবুলেশন শীট জেনারেশন', desc: 'সকল বিষয়ের নম্বরসহ সমন্বিত টেবুলেশন শীট তৈরি' },

    // 7. Result Management
    { id: 'result_publish', category: 'result', name: 'পরীক্ষার ফলাফল প্রস্তুত ও প্রকাশ', desc: 'জিপিএ ও গ্রেড অনুযায়ী ফলাফল চূড়ান্ত ও প্রকাশ' },
    { id: 'result_marksheet', category: 'result', name: 'পূর্ণাঙ্গ মার্কশীট প্রিন্ট', desc: 'গ্রেড পয়েন্ট ও লেটার গ্রেডসহ মার্কশীট প্রিন্ট' },
    { id: 'result_analytics', category: 'result', name: 'মেধা তালিকা ও পাসের হার বিশ্লেষণ', desc: 'মেধাক্রম, পাসের হার ও পরিসংখ্যনিক এনালাইসিস' },

    // 8. Notice & Content
    { id: 'notice_publish', category: 'notice', name: 'নতুন নোটিশ প্রকাশ ও এডিট', desc: 'জরুরি নোটিশ, ছুটির বিজ্ঞপ্তি ও নোটিশ আপলোড' },
    { id: 'notice_delete', category: 'notice', name: 'নোটিশ মুছে ফেলা', desc: 'পুরনো বা অপ্রয়োজনীয় নোটিশ মুছে ফেলার অনুমতি' },
    { id: 'speeches_edit', category: 'notice', name: 'সভাপতি ও প্রধান শিক্ষকের বাণী', desc: 'হোমপেজে প্রদর্শিত সভাপতি ও প্রধান শিক্ষকের বাণী আপডেট' },
    { id: 'slider_edit', category: 'notice', name: 'হোমপেজ হিরো স্লাইডার ও ব্যানার', desc: 'ওয়েবসাইটের মূল স্লাইডারের ছবি পরিবর্তন ও পরিচালনা' },
    { id: 'ticker_edit', category: 'notice', name: 'জরুরি নোটিশ টিকার লাইন', desc: 'হোমপেজে চলমান নোটিশ টিকার টেক্সট পরিবর্তন' },

    // 9. Advance Settings
    { id: 'advance_general', category: 'advance', name: 'স্কুল তথ্য ও মূল ওয়েবসাইট সেটিংস', desc: 'প্রতিষ্ঠানের নাম, ইমেইল, মোবাইল ও ঠিকানা সেটিংস' },
    { id: 'advance_classes', category: 'advance', name: 'শ্রেণি ও শাখা কনফিগারেশন', desc: 'নতুন ক্লাস, সেকশন ও শাখা তৈরি বা পরিবর্তন' },
    { id: 'advance_designations', category: 'advance', name: 'স্টাফ পদবী কাঠামো পরিচালনা', desc: 'শিক্ষক ও কর্মচারীদের ডেজিগনেশন লিস্ট কাস্টমাইজ' },
    { id: 'advance_id_format', category: 'advance', name: 'স্টুডেন্ট আইডি ও রেজিস্ট্রেশন ফরম্যাট', desc: 'আইডি নাম্বার তৈরির নিয়ম ও ফরম্যাট পরিবর্তন' },
    { id: 'advance_user_mgmt', category: 'advance', name: 'ইউজার অ্যাকাউন্ট ও পাসওয়ার্ড কন্ট্রোল', desc: 'অন্যান্য শিক্ষক ও কর্মচারীদের ইউজার আইডি ও পাসওয়ার্ড তৈরি' },
    { id: 'advance_db_backup', category: 'advance', name: 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ ও এক্সপোর্ট', desc: 'স্কুলের সম্পূর্ণ ডাটাবেজ ব্যাকআপ ও JSON ডাউনলোড' }
];

const PERMISSION_CATEGORIES = [
    { id: 'dashboard', name: '🏠 ড্যাশবোর্ড ও লাইভ চ্যাট', color: '#0052ff' },
    { id: 'staff', name: '👨‍🏫 শিক্ষক ও স্টাফ ম্যানেজমেন্ট', color: '#7c3aed' },
    { id: 'student', name: '🎓 স্টুডেন্ট পোর্টাল', color: '#0284c7' },
    { id: 'fees', name: '💳 ফি ও হিসাব ব্যবস্থাপনা', color: '#059669' },
    { id: 'seat', name: '🪑 সিট প্ল্যান ও হাজিরা', color: '#d97706' },
    { id: 'exam', name: '📝 পরীক্ষা পোর্টাল ও রুটিন', color: '#dc2626' },
    { id: 'result', name: '🏆 ফলাফল ও মার্কশীট', color: '#db2777' },
    { id: 'notice', name: '📢 নোটিশ ও ওয়েবসাইট কনটেন্ট', color: '#4f46e5' },
    { id: 'advance', name: '⚙️ অ্যাডভান্স সেটিংস ও ডাটাবেজ', color: '#0f172a' }
];

const ROLE_DEFAULT_PRESETS = {
    admin: ALL_PERMISSIONS.map(p => p.id),
    teacher: [
        'dashboard_view', 'live_chat', 
        'student_view', 'student_add', 'student_edit', 'student_promote', 'student_idcard',
        'seat_print', 'seat_attendance', 
        'exam_routine', 'exam_marks', 'exam_admit', 'exam_tabulation', 
        'result_publish', 'result_marksheet', 
        'notice_publish'
    ],
    accountant: [
        'dashboard_view', 'live_chat', 
        'student_view', 
        'fees_collect', 'fees_receipt', 'fees_reports', 'fees_structure', 
        'notice_publish'
    ],
    exam_incharge: [
        'dashboard_view', 'live_chat', 
        'student_view', 
        'exam_routine', 'exam_marks', 'exam_admit', 'exam_tabulation', 
        'result_publish', 'result_marksheet', 'result_analytics', 
        'notice_publish'
    ],
    seat_incharge: [
        'dashboard_view', 'live_chat', 
        'student_view', 
        'seat_generate', 'seat_print', 'seat_attendance', 'seat_topsheet',
        'notice_publish'
    ],
    staff: [
        'dashboard_view', 'live_chat', 
        'staff_view', 'student_view', 
        'notice_publish'
    ],
    custom: []
};

window.ALL_PERMISSIONS = ALL_PERMISSIONS;
window.PERMISSION_CATEGORIES = PERMISSION_CATEGORIES;
window.ROLE_DEFAULT_PRESETS = ROLE_DEFAULT_PRESETS;

function getUserPermissions(user) {
    if (!user) return [];
    if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
        return user.permissions;
    }
    const role = user.role || 'teacher';
    return ROLE_DEFAULT_PRESETS[role] || ROLE_DEFAULT_PRESETS['teacher'] || [];
}
window.getUserPermissions = getUserPermissions;

function hasUserPermission(user, permissionId) {
    if (!user || !permissionId) return false;
    if (user.role === 'admin') return true;
    const perms = getUserPermissions(user);
    return perms.includes(permissionId);
}
window.hasUserPermission = hasUserPermission;

// Helper to check if designation represents Headmaster / Head Teacher
function isHeadmasterDesignation(designation) {
    if (!designation) return false;
    const des = String(designation).trim().toLowerCase();
    if (des.includes('সহকারী') || des.includes('সহ:') || des.includes('উপাধ্যক্ষ') || des.includes('assistant') || des.includes('asst') || des.includes('vice') || des.includes('deputy')) {
        return false;
    }
    return des.includes('প্রধান শিক্ষক') || 
           des.includes('প্রধান শিক্ষিকা') ||
           des.includes('headmaster') || 
           des.includes('head master') || 
           des.includes('headteacher') || 
           des.includes('head teacher') || 
           des.includes('principal') || 
           des.includes('অধ্যক্ষ') || 
           des.includes('সুপারিনটেনডেন্ট') || 
           des.includes('superintendent');
}
window.isHeadmasterDesignation = isHeadmasterDesignation;

// Helper to retrieve Head Teacher profile and signature by Department or Class
function getHeadmasterByDepartment(deptOrClass) {
    let staffList = [];
    try {
        staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
    } catch (e) {
        staffList = [];
    }

    if (!Array.isArray(staffList) || staffList.length === 0) {
        return null;
    }

    const checkIsHm = (s) => {
        if (!s) return false;
        if (typeof isHeadmasterDesignation === 'function') {
            return isHeadmasterDesignation(s.designation || s.designationBn || s.post);
        }
        const des = String(s.designation || s.designationBn || s.post || '').toLowerCase();
        if (des.includes('সহকারী') || des.includes('সহ:') || des.includes('উপাধ্যক্ষ') || des.includes('assistant') || des.includes('asst') || des.includes('vice') || des.includes('deputy')) {
            return false;
        }
        return des.includes('প্রধান শিক্ষক') || des.includes('প্রধান শিক্ষিকা') || des.includes('headmaster') || des.includes('head master') || des.includes('headteacher') || des.includes('head teacher') || des.includes('principal') || des.includes('অধ্যক্ষ') || des.includes('সুপারিনটেনডেন্ট') || des.includes('superintendent');
    };

    let targetDept = '';
    if (deptOrClass) {
        const d = String(deptOrClass).trim().toLowerCase();
        const primaryKeywords = ['primary', 'primary level', 'প্রাথমিক', 'play', 'nursery', 'kg', 'one', 'two', 'three', 'four', 'five', 'প্লে', 'নার্সারি', 'কেজি', 'প্রথম', 'দ্বিতীয়', 'দ্বিতীয়', 'তৃতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', '1', '2', '3', '4', '5'];
        const highKeywords = ['high', 'high level', 'মাধ্যমিক', 'উচ্চ', 'six', 'seven', 'eight', 'nine', 'ten', 'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম', '6', '7', '8', '9', '10'];

        if (primaryKeywords.some(k => d === k || d.includes(k))) {
            targetDept = 'primary level';
        } else if (highKeywords.some(k => d === k || d.includes(k))) {
            targetDept = 'high level';
        } else {
            targetDept = d;
        }
    }

    // 1. Primary priority: Headmaster specifically assigned to targetDept
    if (targetDept) {
        const hm = staffList.find(s => {
            if (!checkIsHm(s)) return false;
            const sDept = String(s.department || s.dept || '').trim().toLowerCase();
            return sDept === targetDept || sDept.includes(targetDept) || targetDept.includes(sDept);
        });
        if (hm) return hm;
    }

    // 2. Fallback: Any registered headmaster in the staff list
    const anyHm = staffList.find(s => checkIsHm(s));
    return anyHm || null;
}
window.getHeadmasterByDepartment = getHeadmasterByDepartment;


function getFixedAdminUser() {
    let hmName = 'শাহ মোঃ রোকনুজ্জামান চৌধুরী';
    let hmPhone = 'admin';
    let hmPhoto = '';
    
    try {
        const settings = JSON.parse(localStorage.getItem('school_settings') || '{}');
        const staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
        const hm = staffList.find(s => isHeadmasterDesignation(s.designation || s.designationBn));
        
        if (settings.headmasterName && settings.headmasterName.trim()) {
            hmName = settings.headmasterName.trim();
        } else if (hm && (hm.nameBn || hm.name)) {
            hmName = (hm.nameBn || hm.name).trim();
        }
        
        if (settings.headmasterPhone && settings.headmasterPhone.trim()) {
            hmPhone = settings.headmasterPhone.trim();
        } else if (hm && hm.mobile) {
            hmPhone = hm.mobile.trim();
        }
        
        if (settings.headmasterPhoto) {
            hmPhoto = settings.headmasterPhoto;
        } else if (hm && hm.photo) {
            hmPhoto = hm.photo;
        }
    } catch(e) {}

    const allPermIds = window.ALL_PERMISSIONS ? window.ALL_PERMISSIONS.map(p => p.id) : [];

    return {
        id: 'usr_admin',
        staffId: 'ADMIN-01',
        name: hmName || 'প্রধান শিক্ষক (অ্যাডমিন)',
        designation: 'প্রধান শিক্ষক / পূর্ণ অ্যাডমিন',
        mobile: 'admin',
        headmasterPhone: hmPhone,
        username: 'admin',
        password: 'admin',
        role: 'admin',
        status: 'active',
        photo: hmPhoto || '',
        permissions: allPermIds,
        isFixedAdmin: true
    };
}
function getActiveUserPermissions() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return null;

    const userMobile = (localStorage.getItem('school_user_mobile') || '').trim();
    const userRoleKey = (localStorage.getItem('school_user_role_key') || '').trim();
    const userRole = (localStorage.getItem('school_user_role') || '').trim();
    const userName = (localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || '').trim();
    const userId = (localStorage.getItem('school_user_id') || '').trim();

    // Master Admin Check: ONLY true Master Admin account or admin role key
    const isMasterAdmin = (userMobile === 'admin' || userId === 'admin' || userRoleKey === 'admin' || (userRole === 'প্রধান শিক্ষক / অ্যাডমিন' && userMobile === 'admin'));
    if (isMasterAdmin) {
        return window.ALL_PERMISSIONS ? window.ALL_PERMISSIONS.map(p => p.id) : ['*'];
    }

    // 1. Check live permissions from school_users directory for this logged in user
    try {
        const users = JSON.parse(localStorage.getItem('school_users') || '[]');
        const cleanMob = userMobile.replace(/[^0-9a-zA-Z]/g, '');
        const matched = users.find(u => {
            const uMob = (u.mobile || '').replace(/[^0-9a-zA-Z]/g, '');
            const uName = (u.username || '').replace(/[^0-9a-zA-Z]/g, '');
            return (cleanMob && (uMob === cleanMob || uName === cleanMob)) || (u.mobile === userMobile) || (u.username === userMobile) || (u.staffId && u.staffId === userId);
        });
        if (matched) {
            if (matched.role === 'admin' && (cleanMob === 'admin' || matched.username === 'admin')) {
                return window.ALL_PERMISSIONS ? window.ALL_PERMISSIONS.map(p => p.id) : ['*'];
            }
            const perms = window.getUserPermissions ? window.getUserPermissions(matched) : (matched.permissions || []);
            if (Array.isArray(perms) && perms.length > 0) {
                localStorage.setItem('school_user_permissions', JSON.stringify(perms));
                if (matched.role) localStorage.setItem('school_user_role_key', matched.role);
                return perms;
            }
        }
    } catch(e) {}

    // 2. Check stored session permissions
    try {
        const stored = JSON.parse(localStorage.getItem('school_user_permissions') || 'null');
        if (Array.isArray(stored) && stored.length > 0) {
            return stored;
        }
    } catch(e) {}

    // 3. Fallback to role presets
    const presets = window.ROLE_DEFAULT_PRESETS || {};
    return presets[userRoleKey] || presets[userRole] || presets['teacher'] || [];
}
window.getActiveUserPermissions = getActiveUserPermissions;

function currentUserHasPermission(permissionKeyOrKeys) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return false;

    const permissions = getActiveUserPermissions();
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) return false;
    if (permissions.includes('*')) return true;

    if (Array.isArray(permissionKeyOrKeys)) {
        return permissionKeyOrKeys.some(k => permissions.includes(k));
    }
    return permissions.includes(permissionKeyOrKeys);
}
window.currentUserHasPermission = currentUserHasPermission;

function applyUserPermissionsUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        document.querySelectorAll('.nav-item').forEach(el => el.style.display = '');
        document.querySelectorAll('.nav-item.dropdown .dropdown-menu li').forEach(el => el.style.display = '');
        document.querySelectorAll('.advance-nav-pill').forEach(el => el.style.display = '');
        return;
    }

    const permissions = getActiveUserPermissions();
    if (!permissions || !Array.isArray(permissions)) return;

    const userMobile = (localStorage.getItem('school_user_mobile') || '').trim();
    const userRoleKey = (localStorage.getItem('school_user_role_key') || '').trim();
    const userRole = (localStorage.getItem('school_user_role') || '').trim();
    const userId = (localStorage.getItem('school_user_id') || '').trim();
    const isMasterAdmin = (userMobile === 'admin' || userId === 'admin' || userRoleKey === 'admin' || permissions.includes('*'));

    if (isMasterAdmin) {
        document.querySelectorAll('.nav-item').forEach(el => el.style.display = '');
        document.querySelectorAll('.nav-item.dropdown .dropdown-menu li').forEach(el => el.style.display = '');
        document.querySelectorAll('.advance-nav-pill').forEach(el => el.style.display = '');
        document.querySelectorAll('.action-icon-btn.view-btn, .action-icon-btn.edit-btn, .action-icon-btn.delete-btn, .btn-add-staff, #btn-add-staff, .btn-staff-excel, #btn-staff-excel, .btn-delete-staff, .btn-add-student, #btn-add-student, .btn-promote-student, #btn-promote-student, .btn-student-excel, #btn-student-excel, .btn-view-card, .btn-view-profile, .btn-edit-student, .btn-delete-student, .btn-fee-collect, #btn-fee-collect, .btn-exam-marks, #btn-exam-marks, .btn-publish-notice, #btn-publish-notice').forEach(el => {
            el.style.display = '';
        });
        return;
    }

    // Module -> Required Permissions mapping
    const TAB_PERMISSIONS = {
        'dashboard': ['dashboard_view', 'live_chat', 'active_users'],
        'staff': ['staff_view', 'staff_add', 'staff_edit', 'staff_delete', 'staff_excel'],
        'student-portal': ['student_view', 'student_add', 'student_edit', 'student_delete', 'student_promote', 'student_idcard', 'student_excel'],
        'fees': ['fees_collect', 'fees_receipt', 'fees_reports', 'fees_structure'],
        'seat-plan': ['seat_generate', 'seat_print', 'seat_attendance', 'seat_topsheet', 'exam_routine'],
        'exam-portal': ['exam_routine', 'exam_marks', 'exam_admit', 'exam_tabulation'],
        'result-portal': ['result_publish', 'result_marksheet', 'result_analytics', 'exam_tabulation'],
        'notice-board': ['notice_publish', 'notice_delete', 'slider_edit', 'ticker_edit', 'speeches_edit'],
        'others': ['notice_publish', 'slider_edit', 'dashboard_view'],
        'advance': ['advance_general', 'advance_classes', 'advance_designations', 'advance_id_format', 'advance_user_mgmt', 'advance_db_backup', 'fees_structure', 'slider_edit', 'speeches_edit', 'live_chat']
    };

    // Sub-link pattern -> Permissions mapping
    const LINK_PERMISSIONS = {
        'student-portal.html?view=add': ['student_add'],
        'student-portal.html?view=list': ['student_view', 'student_edit', 'student_delete'],
        'student-portal.html?view=online-admissions': ['student_view', 'student_add', 'student_edit', 'student_delete'],
        'student-portal.html?view=admissions': ['student_view', 'student_add', 'student_edit', 'student_delete'],
        'student-portal.html?view=promote': ['student_promote'],
        'student-portal.html?view=idcard': ['student_idcard'],
        'Money Collect.html': ['fees_collect', 'fees_receipt'],
        'fees.html': ['fees_reports', 'fees_structure', 'fees_collect'],
        'seat-plan.html?view=exam-routine': ['exam_routine', 'seat_generate'],
        'seat-plan?view=exam-routine': ['exam_routine', 'seat_generate'],
        'seat-plan.html?view=building-mgmt': ['seat_generate'],
        'seat-plan.html?view=seat-distribution': ['seat_generate'],
        'seat-plan.html?view=seating-details': ['seat_print'],
        'seat-plan.html?view=room-topshet': ['seat_print', 'seat_topsheet'],
        'seat-plan?view=room-topshet': ['seat_print', 'seat_topsheet'],
        'seat-plan?view=student-attendance': ['seat_attendance', 'seat_print'],
        'seat-plan.html?view=student-attendance': ['seat_attendance', 'seat_print'],
        'seat-plan.html?view=admit-card': ['exam_admit'],
        'seat-plan.html?view=find-seat': ['seat_print'],
        'seat-plan.html?view=exam-document-report': ['seat_attendance', 'seat_topsheet'],
        'Seating arrangement details.html': ['seat_print'],
        'Room Seat Topshet.html': ['seat_print', 'seat_topsheet'],
        'Student attendance sheet.html': ['seat_attendance'],
        'Student Data Topsheet.html': ['seat_topsheet'],
        'exam-portal.html?view=exam-entry': ['exam_routine', 'exam_marks'],
        'exam-portal.html?view=result-report': ['exam_marks', 'result_publish'],
        'exam-portal.html?view=marking-system': ['exam_marks'],
        'exam-portal.html?view=all-subject': ['exam_marks'],
        'exam-portal.html?view=sms': ['exam_marks'],
        'Admit Card.html': ['exam_admit'],
        'result-portal.html': ['result_publish', 'result_analytics'],
        'Tabulation Sheet.html': ['exam_tabulation', 'result_publish'],
        'Marksheet.html': ['result_marksheet'],
        'Marksheet1.html': ['result_marksheet'],
        'Teacher Report.html': ['staff_view', 'staff_excel'],
        'advance.html?view=fee-structure': ['fees_structure', 'advance_general'],
        'advance.html?view=id-reg-structure': ['advance_id_format', 'advance_general'],
        'advance.html?view=class-section-structure': ['advance_classes', 'advance_general'],
        'advance.html?view=slider-management': ['slider_edit', 'ticker_edit', 'advance_general'],
        'advance.html?view=designation-structure': ['advance_designations', 'advance_general'],
        'advance.html?view=speeches-management': ['speeches_edit', 'advance_general'],
        'advance.html?view=chat': ['live_chat', 'active_users', 'advance_general'],
        'advance.html?view=user-management': ['advance_user_mgmt', 'advance_general'],
        'advance.html?view=sms-settings': ['advance_general'],
        'advance.html?view=cms-portal': ['advance_general'],
        'advance.html?view=address-structure': ['advance_general'],
        'advance.html?view=general': ['advance_general', 'advance_db_backup']
    };

    // 1. Filter Top Navigation Tabs and Dropdown Sub-Items
    document.querySelectorAll('.nav-item').forEach(navItem => {
        const tabKey = navItem.getAttribute('data-tab');
        if (!tabKey) return;

        const dropdown = navItem.querySelector('.dropdown-menu');
        let hasVisibleSubItems = false;

        if (dropdown) {
            const subLinks = dropdown.querySelectorAll('li');
            subLinks.forEach(subLi => {
                const anchor = subLi.querySelector('a');
                if (!anchor) return;
                const href = (anchor.getAttribute('href') || '').trim();
                
                let requiredPerms = null;
                for (const [pattern, perms] of Object.entries(LINK_PERMISSIONS)) {
                    if (href.includes(pattern) || pattern.includes(href)) {
                        requiredPerms = perms;
                        break;
                    }
                }

                if (!requiredPerms && TAB_PERMISSIONS[tabKey]) {
                    requiredPerms = TAB_PERMISSIONS[tabKey];
                }

                if (requiredPerms) {
                    const isPermitted = requiredPerms.some(k => permissions.includes(k));
                    if (!isPermitted) {
                        subLi.style.display = 'none';
                    } else {
                        subLi.style.display = '';
                        hasVisibleSubItems = true;
                    }
                } else {
                    hasVisibleSubItems = true;
                }
            });
        }

        const tabPerms = TAB_PERMISSIONS[tabKey];
        if (tabPerms) {
            const hasTabPerm = tabPerms.some(k => permissions.includes(k));
            if (!hasTabPerm || (dropdown && !hasVisibleSubItems)) {
                navItem.style.display = 'none';
            } else {
                navItem.style.display = '';
            }
        }
    });

    // 2. Filter Sub-nav pills in advance.html
    const ADVANCE_SUBVIEW_PERMISSIONS = {
        'general': ['advance_general', 'advance_db_backup'],
        'fee-structure': ['fees_structure', 'advance_general'],
        'id-reg-structure': ['advance_id_format', 'advance_general'],
        'class-section-structure': ['advance_classes', 'advance_general'],
        'slider-management': ['slider_edit', 'ticker_edit', 'advance_general'],
        'designation-structure': ['advance_designations', 'advance_general'],
        'speeches-management': ['speeches_edit', 'advance_general'],
        'chat': ['live_chat', 'active_users', 'advance_general'],
        'user-management': ['advance_user_mgmt', 'advance_general'],
        'sms-settings': ['advance_general'],
        'cms-portal': ['advance_general'],
        'address-structure': ['advance_general']
    };

    const advancePills = document.querySelectorAll('.advance-nav-pill');
    let firstVisiblePillView = null;
    let activePillIsVisible = false;

    advancePills.forEach(pill => {
        const viewName = pill.getAttribute('data-view');
        const reqPerms = ADVANCE_SUBVIEW_PERMISSIONS[viewName] || ['advance_general'];
        const isPermitted = reqPerms.some(k => permissions.includes(k));

        if (!isPermitted) {
            pill.style.display = 'none';
        } else {
            pill.style.display = '';
            if (!firstVisiblePillView) firstVisiblePillView = viewName;
            if (pill.classList.contains('active')) activePillIsVisible = true;
        }
    });

    if (advancePills.length > 0 && !activePillIsVisible && firstVisiblePillView && typeof window.navigateToAdvanceView === 'function') {
        window.navigateToAdvanceView(firstVisiblePillView);
    }

    // 3. Filter Staff Management Actions & Buttons
    const canAddStaff = permissions.includes('staff_add');
    const canEditStaff = permissions.includes('staff_edit');
    const canDeleteStaff = permissions.includes('staff_delete');
    const canStaffExcel = permissions.includes('staff_excel');
    const canViewStaff = permissions.includes('staff_view');

    document.querySelectorAll('.btn-add-staff, #btn-add-staff, [data-perm="staff_add"]').forEach(el => {
        el.style.display = canAddStaff ? '' : 'none';
    });
    document.querySelectorAll('.btn-staff-excel, #btn-staff-excel, [data-perm="staff_excel"]').forEach(el => {
        el.style.display = canStaffExcel ? '' : 'none';
    });
    document.querySelectorAll('.action-icon-btn.edit-btn, .btn-edit-staff, [data-perm="staff_edit"]').forEach(el => {
        el.style.display = canEditStaff ? '' : 'none';
    });
    document.querySelectorAll('.action-icon-btn.delete-btn, .btn-delete-staff, [data-perm="staff_delete"]').forEach(el => {
        el.style.display = canDeleteStaff ? '' : 'none';
    });
    document.querySelectorAll('.action-icon-btn.view-btn, [data-perm="staff_view"]').forEach(el => {
        el.style.display = canViewStaff ? '' : 'none';
    });

    // 4. Filter Student Portal Actions & Tabs
    const canAddStudent = permissions.includes('student_add');
    const canEditStudent = permissions.includes('student_edit');
    const canDeleteStudent = permissions.includes('student_delete');
    const canPromoteStudent = permissions.includes('student_promote');
    const canStudentIdCard = permissions.includes('student_idcard');
    const canStudentExcel = permissions.includes('student_excel');
    const canViewStudent = permissions.includes('student_view');

    document.querySelectorAll('.btn-add-student, #btn-add-student, [data-tab="add"], [data-perm="student_add"]').forEach(el => {
        el.style.display = canAddStudent ? '' : 'none';
    });
    document.querySelectorAll('.btn-promote-student, #btn-promote-student, [data-tab="promote"], [data-perm="student_promote"]').forEach(el => {
        el.style.display = canPromoteStudent ? '' : 'none';
    });
    document.querySelectorAll('[data-tab="idcard"], [data-perm="student_idcard"]').forEach(el => {
        el.style.display = canStudentIdCard ? '' : 'none';
    });
    document.querySelectorAll('.btn-student-excel, #btn-student-excel, #excel-import-box, #excel-export-btn, [data-perm="student_excel"]').forEach(el => {
        el.style.display = canStudentExcel ? '' : 'none';
    });
    document.querySelectorAll('.btn-view-card, [data-perm="student_idcard"]').forEach(el => {
        el.style.display = canStudentIdCard ? '' : 'none';
    });
    document.querySelectorAll('.btn-view-profile, [data-perm="student_view"]').forEach(el => {
        el.style.display = canViewStudent ? '' : 'none';
    });
    document.querySelectorAll('.btn-edit-student, [data-perm="student_edit"]').forEach(el => {
        el.style.display = canEditStudent ? '' : 'none';
    });
    document.querySelectorAll('.btn-delete-student, #delete-selected-btn, [data-perm="student_delete"]').forEach(el => {
        el.style.display = canDeleteStudent ? '' : 'none';
    });

    // 5. Filter Fees & Payments Actions
    const canCollectFees = permissions.includes('fees_collect');
    const canPrintReceipt = permissions.includes('fees_receipt');
    const canFeeReports = permissions.includes('fees_reports');
    const canFeeStructure = permissions.includes('fees_structure');

    document.querySelectorAll('.btn-fee-collect, #btn-fee-collect, [data-perm="fees_collect"]').forEach(el => {
        el.style.display = canCollectFees ? '' : 'none';
    });
    document.querySelectorAll('.btn-fee-receipt, .print-receipt-btn, [data-perm="fees_receipt"]').forEach(el => {
        el.style.display = canPrintReceipt ? '' : 'none';
    });
    document.querySelectorAll('[data-perm="fees_reports"]').forEach(el => {
        el.style.display = canFeeReports ? '' : 'none';
    });
    document.querySelectorAll('[data-perm="fees_structure"]').forEach(el => {
        el.style.display = canFeeStructure ? '' : 'none';
    });

    // 6. Filter Exam Portal & Marks Entry
    const canExamRoutine = permissions.includes('exam_routine');
    const canExamMarks = permissions.includes('exam_marks');
    const canExamAdmit = permissions.includes('exam_admit');
    const canTabulation = permissions.includes('exam_tabulation');

    document.querySelectorAll('.btn-exam-routine, [data-perm="exam_routine"]').forEach(el => {
        el.style.display = canExamRoutine ? '' : 'none';
    });
    document.querySelectorAll('.btn-exam-marks, #btn-exam-marks, [data-perm="exam_marks"]').forEach(el => {
        el.style.display = canExamMarks ? '' : 'none';
    });
    document.querySelectorAll('.btn-admit-card, .print-admit-btn, [data-perm="exam_admit"]').forEach(el => {
        el.style.display = canExamAdmit ? '' : 'none';
    });
    document.querySelectorAll('.btn-tabulation-sheet, [data-perm="exam_tabulation"]').forEach(el => {
        el.style.display = canTabulation ? '' : 'none';
    });

    // 7. Filter Seat Plan Actions
    const canSeatGenerate = permissions.includes('seat_generate');
    const canSeatPrint = permissions.includes('seat_print');
    const canSeatAttendance = permissions.includes('seat_attendance');
    const canSeatTopsheet = permissions.includes('seat_topsheet');

    document.querySelectorAll('.btn-generate-seat, #generate-seat-btn, [data-perm="seat_generate"]').forEach(el => {
        el.style.display = canSeatGenerate ? '' : 'none';
    });
    document.querySelectorAll('.btn-print-seat, .print-slips-btn, [data-perm="seat_print"]').forEach(el => {
        el.style.display = canSeatPrint ? '' : 'none';
    });
    document.querySelectorAll('.btn-attendance-sheet, [data-perm="seat_attendance"]').forEach(el => {
        el.style.display = canSeatAttendance ? '' : 'none';
    });
    document.querySelectorAll('.btn-room-topsheet, [data-perm="seat_topsheet"]').forEach(el => {
        el.style.display = canSeatTopsheet ? '' : 'none';
    });

    // 8. Filter Result Management
    const canPublishResult = permissions.includes('result_publish');
    const canMarksheet = permissions.includes('result_marksheet');
    const canAnalytics = permissions.includes('result_analytics');

    document.querySelectorAll('.btn-publish-result, #publish-result-btn, [data-perm="result_publish"]').forEach(el => {
        el.style.display = canPublishResult ? '' : 'none';
    });
    document.querySelectorAll('.btn-marksheet-print, [data-perm="result_marksheet"]').forEach(el => {
        el.style.display = canMarksheet ? '' : 'none';
    });
    document.querySelectorAll('.btn-result-analytics, [data-perm="result_analytics"]').forEach(el => {
        el.style.display = canAnalytics ? '' : 'none';
    });

    // 9. Filter Notice Board & Content
    const canPublishNotice = permissions.includes('notice_publish');
    const canDeleteNotice = permissions.includes('notice_delete');
    const canSliderEdit = permissions.includes('slider_edit');
    const canSpeechesEdit = permissions.includes('speeches_edit');

    document.querySelectorAll('.btn-publish-notice, #btn-publish-notice, #ticker-notice-form, #notice-add-card, [data-perm="notice_publish"]').forEach(el => {
        el.style.display = canPublishNotice ? '' : 'none';
    });
    document.querySelectorAll('.btn-delete-notice, .notice-delete-btn, [data-perm="notice_delete"]').forEach(el => {
        el.style.display = canDeleteNotice ? '' : 'none';
    });
    document.querySelectorAll('.btn-slider-edit, [data-perm="slider_edit"]').forEach(el => {
        el.style.display = canSliderEdit ? '' : 'none';
    });
    document.querySelectorAll('.btn-speeches-edit, [data-perm="speeches_edit"]').forEach(el => {
        el.style.display = canSpeechesEdit ? '' : 'none';
    });

    // 10. Filter Generic [data-perm] elements
    document.querySelectorAll('[data-perm]').forEach(el => {
        const required = el.getAttribute('data-perm');
        if (required) {
            const hasP = permissions.includes(required) || permissions.includes('*');
            el.style.display = hasP ? '' : 'none';
        }
    });

    // 11. Page-level Route & Subview Protection
    enforcePageModuleGuard(permissions);
}
window.applyUserPermissionsUI = applyUserPermissionsUI;

// --- MASTER PERMISSION ROUTING & "NOT ACCESS PERMISSIONS" SECURITY ENGINE ---
const URL_PERMISSION_RULES = [
    // 1. Staff Management
    { pattern: /staff(\.html)?/i, required: ['staff_view', 'staff_add', 'staff_edit', 'staff_delete', 'staff_excel'], name: 'শিক্ষক ও স্টাফ ম্যানেজমেন্ট', page: 'staff.html' },
    { pattern: /teacher report(\.html)?/i, required: ['staff_view', 'staff_excel'], name: 'শিক্ষক রিপোর্ট ও তালিকা', page: 'Teacher Report.html' },
    { pattern: /teachers(\.html)?/i, required: ['staff_view'], name: 'শিক্ষক তালিকা', page: 'teachers.html' },

    // 2. Student Portal Sub-views & Page
    { pattern: /student-portal(\.html)?.*[?&]view=add/i, required: ['student_add'], name: 'নতুন শিক্ষার্থী ভর্তি ও নিবন্ধন', view: 'add', page: 'student-portal.html' },
    { pattern: /student-portal(\.html)?.*[?&]view=promote/i, required: ['student_promote'], name: 'শ্রেণি প্রমোশন ও ট্রান্সফার', view: 'promote', page: 'student-portal.html' },
    { pattern: /student-portal(\.html)?.*[?&]view=idcard/i, required: ['student_idcard'], name: 'স্টুডেন্ট আইডি কার্ড', view: 'idcard', page: 'student-portal.html' },
    { pattern: /student-portal(\.html)?.*[?&]view=list/i, required: ['student_view'], name: 'শিক্ষার্থী তালিকা পরিদর্শন', view: 'list', page: 'student-portal.html' },
    { pattern: /student-portal(\.html)?/i, required: ['student_view', 'student_add', 'student_edit', 'student_delete', 'student_promote', 'student_idcard', 'student_excel'], name: 'স্টুডেন্ট পোর্টাল', page: 'student-portal.html' },

    // 3. Fees & Payments
    { pattern: /money collect(\.html)?/i, required: ['fees_collect', 'fees_receipt'], name: 'ফি কালেকশন ও রিসিট', page: 'Money Collect.html' },
    { pattern: /fees(\.html)?/i, required: ['fees_reports', 'fees_structure', 'fees_collect', 'fees_receipt'], name: 'ফি ও হিসাব ব্যবস্থাপনা', page: 'fees.html' },

    // 4. Seat Plan Sub-views & Pages
    { pattern: /seat-plan(\.html)?.*[?&]view=exam-routine/i, required: ['exam_routine', 'seat_generate'], name: 'পরীক্ষার রুটিন ব্যবস্থাপনা', view: 'exam-routine', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=building-mgmt/i, required: ['seat_generate'], name: 'বিল্ডিং ও রুম ম্যানেজমেন্ট', view: 'building-mgmt', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=seat-distribution/i, required: ['seat_generate'], name: 'আসন বিন্যাস তৈরি', view: 'seat-distribution', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=seating-details/i, required: ['seat_print'], name: 'সিট প্ল্যান বিস্তারিত রিপোর্ট', view: 'seating-details', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=room-topshet/i, required: ['seat_print', 'seat_topsheet'], name: 'রুম সিট টপশীট', view: 'room-topshet', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=student-attendance/i, required: ['seat_attendance', 'seat_print'], name: 'শিক্ষার্থী হাজিরা শীট', view: 'student-attendance', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=student-data-topsheet/i, required: ['seat_topsheet'], name: 'স্টুডেন্ট ডাটা টপশীট', view: 'student-data-topsheet', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=admit-card/i, required: ['exam_admit'], name: 'এডমিট কার্ড তৈরি ও প্রিন্ট', view: 'admit-card', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=find-seat/i, required: ['seat_print'], name: 'সিট প্ল্যান সার্চ ও রিপোর্ট', view: 'find-seat', page: 'seat-plan.html' },
    { pattern: /seat-plan(\.html)?.*[?&]view=exam-document-report/i, required: ['seat_attendance', 'seat_topsheet'], name: 'ডকুমেন্ট রিপোর্ট', view: 'exam-document-report', page: 'seat-plan.html' },
    { pattern: /seating arrangement details(\.html)?/i, required: ['seat_print'], name: 'সিট প্ল্যান বিস্তারিত রিপোর্ট', page: 'Seating arrangement details.html' },
    { pattern: /room seat topshet(\.html)?/i, required: ['seat_print', 'seat_topsheet'], name: 'রুম সিট টপশীট', page: 'Room Seat Topshet.html' },
    { pattern: /student attendance sheet(\.html)?/i, required: ['seat_attendance'], name: 'শিক্ষার্থী হাজিরা শীট', page: 'Student attendance sheet.html' },
    { pattern: /student data topsheet(\.html)?/i, required: ['seat_topsheet'], name: 'স্টুডেন্ট ডাটা টপশীট', page: 'Student Data Topsheet.html' },
    { pattern: /seat-plan(\.html)?/i, required: ['seat_generate', 'seat_print', 'seat_attendance', 'seat_topsheet', 'exam_routine'], name: 'সিট প্ল্যান পোর্টাল', page: 'seat-plan.html' },

    // 5. Exam Portal Sub-views & Pages
    { pattern: /exam-portal(\.html)?.*[?&]view=exam-entry/i, required: ['exam_routine', 'exam_marks'], name: 'পরীক্ষার সময়সূচি ও নম্বর এন্ট্রি', view: 'exam-entry', page: 'exam-portal.html' },
    { pattern: /exam-portal(\.html)?.*[?&]view=result-report/i, required: ['exam_marks', 'result_publish'], name: 'নম্বর এন্ট্রি ও রেজাল্ট রিপোর্ট', view: 'result-report', page: 'exam-portal.html' },
    { pattern: /exam-portal(\.html)?.*[?&]view=marking-system/i, required: ['exam_marks'], name: 'মার্কিং সিস্টেম ও গ্রেডিং', view: 'marking-system', page: 'exam-portal.html' },
    { pattern: /exam-portal(\.html)?.*[?&]view=exam-types/i, required: ['exam_routine'], name: 'পরীক্ষার ধরন কনফিগারেশন', view: 'exam-types', page: 'exam-portal.html' },
    { pattern: /exam-portal(\.html)?.*[?&]view=all-subject/i, required: ['exam_marks'], name: 'বিষয়সমূহ কনফিগারেশন', view: 'all-subject', page: 'exam-portal.html' },
    { pattern: /exam-portal(\.html)?.*[?&]view=sms/i, required: ['exam_marks'], name: 'রেজাল্ট এসএমএস', view: 'sms', page: 'exam-portal.html' },
    { pattern: /admit card(\.html)?/i, required: ['exam_admit'], name: 'এডমিট কার্ড', page: 'Admit Card.html' },
    { pattern: /exam-portal(\.html)?/i, required: ['exam_routine', 'exam_marks', 'exam_admit', 'exam_tabulation'], name: 'পরীক্ষা পোর্টাল', page: 'exam-portal.html' },

    // 6. Result Portal & Sheets
    { pattern: /tabulation sheet(\.html)?/i, required: ['exam_tabulation', 'result_publish'], name: 'টেবুলেশন শীট', page: 'Tabulation Sheet.html' },
    { pattern: /marksheet1(\.html)?/i, required: ['result_marksheet'], name: 'মার্কশীট প্রিন্ট (ফরম্যাট ২)', page: 'Marksheet1.html' },
    { pattern: /marksheet(\.html)?/i, required: ['result_marksheet'], name: 'মার্কশীট প্রিন্ট', page: 'Marksheet.html' },
    { pattern: /result-portal(\.html)?/i, required: ['result_publish', 'result_marksheet', 'result_analytics', 'exam_tabulation'], name: 'ফলাফল পোর্টাল', page: 'result-portal.html' },

    // 7. Notice Board & Website Content
    { pattern: /notice-board(\.html)?/i, required: ['notice_publish', 'notice_delete', 'slider_edit', 'ticker_edit', 'speeches_edit'], name: 'নোটিশ বোর্ড ও কনটেন্ট', page: 'notice-board.html' },

    // 8. Advance Settings Sub-views & Page
    { pattern: /advance(\.html)?.*[?&]view=user-management/i, required: ['advance_user_mgmt'], name: 'ইউজার ও পাসওয়ার্ড ম্যানেজমেন্ট', view: 'user-management', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=fee-structure/i, required: ['fees_structure'], name: 'ফি কাঠামো সেটিংস', view: 'fee-structure', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=id-reg-structure/i, required: ['advance_id_format'], name: 'আইডি ও রেজিস্ট্রেশন ফরম্যাট', view: 'id-reg-structure', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=id-structure/i, required: ['advance_id_format'], name: 'আইডি ফরম্যাট', view: 'id-structure', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=class-section-structure/i, required: ['advance_classes'], name: 'শ্রেণি ও শাখা কাঠামো', view: 'class-section-structure', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=reg-structure/i, required: ['advance_classes'], name: 'শ্রেণি ও শাখা কাঠামো', view: 'reg-structure', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=slider-management/i, required: ['slider_edit', 'ticker_edit'], name: 'হিরো স্লাইডার ম্যানেজমেন্ট', view: 'slider-management', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=designation-structure/i, required: ['advance_designations'], name: 'পদবী কাঠামো', view: 'designation-structure', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=speeches-management/i, required: ['speeches_edit'], name: 'বাণী ম্যানেজমেন্ট', view: 'speeches-management', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=chat/i, required: ['live_chat', 'active_users'], name: 'লাইভ চ্যাট সেটিংস', view: 'chat', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=sms-settings/i, required: ['advance_general'], name: 'এসএমএস সেটিংস', view: 'sms-settings', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=cms-portal/i, required: ['advance_general'], name: 'সিএমএস পোর্টাল', view: 'cms-portal', page: 'advance.html' },
    { pattern: /advance(\.html)?.*[?&]view=general/i, required: ['advance_general', 'advance_db_backup'], name: 'সাধারণ সেটিংস ও ব্যাকআপ', view: 'general', page: 'advance.html' },
    { pattern: /advance(\.html)?/i, required: ['advance_general', 'advance_classes', 'advance_designations', 'advance_id_format', 'advance_user_mgmt', 'advance_db_backup', 'fees_structure', 'slider_edit', 'speeches_edit', 'live_chat'], name: 'অ্যাডভান্স সেটিংস', page: 'advance.html' },
    { pattern: /cms(\.html)?/i, required: ['advance_general'], name: 'সিএমএস ম্যানেজমেন্ট', page: 'cms.html' }
];
window.URL_PERMISSION_RULES = URL_PERMISSION_RULES;

// Helper: Check if a URL / href or subview is permitted for the active user
function checkResourceAccessPermission(targetUrlOrPath) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return { allowed: true };

    const userMobile = (localStorage.getItem('school_user_mobile') || '').trim();
    const userRoleKey = (localStorage.getItem('school_user_role_key') || '').trim();
    const userId = (localStorage.getItem('school_user_id') || '').trim();
    if (userMobile === 'admin' || userId === 'admin' || userRoleKey === 'admin') {
        return { allowed: true };
    }

    const permissions = getActiveUserPermissions();
    if (!permissions || !Array.isArray(permissions)) {
        return { allowed: false, name: 'সংরক্ষিত অপশন', required: [] };
    }
    if (permissions.includes('*')) {
        return { allowed: true };
    }

    let cleanUrl = (targetUrlOrPath || '').trim();
    if (!cleanUrl) return { allowed: true };

    try {
        cleanUrl = decodeURIComponent(cleanUrl);
    } catch (e) { }

    // If relative query only (e.g. ?view=add), prepend current page
    if (cleanUrl.startsWith('?') || cleanUrl.startsWith('#')) {
        const currentPage = (typeof window !== 'undefined' && window.location && window.location.pathname) ? (window.location.pathname.split('/').pop() || 'Home.html') : 'Home.html';
        cleanUrl = currentPage + cleanUrl;
    }

    for (const rule of URL_PERMISSION_RULES) {
        if (rule.pattern.test(cleanUrl)) {
            const hasPerm = rule.required.some(req => permissions.includes(req));
            if (!hasPerm) {
                return {
                    allowed: false,
                    rule: rule,
                    name: rule.name,
                    required: rule.required
                };
            }
            return { allowed: true };
        }
    }

    return { allowed: true };
}
window.checkResourceAccessPermission = checkResourceAccessPermission;

// Render full-page / container "Not Access Permissions" Screen
function renderNotAccessPermissionsScreen(targetContainer, details = {}) {
    if (typeof document !== 'undefined' && document.head && !document.getElementById('not-access-permission-style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'not-access-permission-style';
        styleEl.innerHTML = `@keyframes notAccessFadeIn { 0% { opacity: 0; transform: scale(0.96) translateY(6px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }`;
        document.head.appendChild(styleEl);
    }

    const userName = (localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || 'ব্যবহারকারী').trim();
    const userRole = (localStorage.getItem('school_user_role') || localStorage.getItem('school_user_role_key') || 'সাধারণ ইউজার').trim();
    const optionName = details.name || 'এই অপশনটি';

    const html = `
        <div id="not-access-permission-screen" class="not-access-permission-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 65vh; padding: 40px 20px; text-align: center; width: 100%; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif;">
            <div style="background: #ffffff; border: 2px solid #ef4444; border-radius: 24px; box-shadow: 0 20px 45px rgba(239, 68, 68, 0.15); max-width: 620px; width: 100%; padding: 40px 30px; position: relative; box-sizing: border-box; animation: notAccessFadeIn 0.3s ease-out;">
                <div style="width: 86px; height: 86px; margin: 0 auto 20px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 38px; color: #dc2626; box-shadow: 0 8px 24px rgba(220, 38, 38, 0.25);">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 6px; background: #fee2e2; color: #991b1b; padding: 6px 18px; border-radius: 20px; font-weight: 800; font-size: 0.84rem; margin-bottom: 14px; letter-spacing: 0.5px; border: 1px solid #fca5a5;">
                    <i class="fa-solid fa-ban"></i> ACCESS RESTRICTED
                </div>
                <h2 style="color: #0f172a; font-size: 1.65rem; font-weight: 900; margin: 0 0 12px; letter-spacing: -0.5px;">
                    Not Access Permissions
                </h2>
                <p style="color: #475569; font-size: 0.96rem; font-weight: 600; line-height: 1.6; margin: 0 0 22px;">
                    আপনার ইউজার প্রোফাইলে <strong>"${escapeHtml(optionName)}"</strong> ব্যবহারের অনুমতি (Permission) দেওয়া নেই। "🛡️ ভূমিকা ও পারমিশন লেভেল (Role & Permissions)" অনুযায়ী এই অপশনটি আপনার জন্য সংরক্ষিত।
                </p>
                <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 14px; padding: 14px 18px; margin-bottom: 26px; text-align: left; font-size: 0.88rem; color: #334155; line-height: 1.6;">
                    <div><strong>👤 ইউজার নাম:</strong> ${escapeHtml(userName)}</div>
                    <div><strong>🏷️ পদবী / ভূমিকা:</strong> <span style="background: #e2e8f0; color: #0f172a; padding: 2px 8px; border-radius: 6px; font-weight: 700;">${escapeHtml(userRole)}</span></div>
                    <div style="margin-top: 4px; color: #dc2626; font-weight: 700;"><strong>🛡️ স্ট্যাটাস:</strong> অনুমতি নেই (Not Access Permissions)</div>
                </div>
                <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
                    <a href="Home.html" style="background: #0052ff; color: #ffffff; padding: 12px 26px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 0.92rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 6px 18px rgba(0, 82, 255, 0.28); transition: transform 0.15s ease;">
                        <i class="fa-solid fa-house"></i> ড্যাশবোর্ডে ফিরে যান
                    </a>
                    <button type="button" onclick="if (window.history.length > 1) { window.history.back(); } else { window.location.href = 'Home.html'; }" style="background: #f1f5f9; color: #1e293b; border: 1.5px solid #cbd5e1; padding: 12px 22px; border-radius: 12px; font-weight: 700; font-size: 0.92rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s ease;">
                        <i class="fa-solid fa-arrow-left"></i> পূর্বের পেজে ফিরে যান
                    </button>
                </div>
            </div>
        </div>
    `;

    if (targetContainer) {
        targetContainer.innerHTML = html;
    } else {
        const mainContainer = document.querySelector('.main-content, .portal-container, .dashboard-container, main') || document.body;
        if (mainContainer) {
            mainContainer.innerHTML = html;
        }
    }
}
window.renderNotAccessPermissionsScreen = renderNotAccessPermissionsScreen;

// Interactive Modal for link clicks
function showNotAccessPermissionsModal(details = {}) {
    if (typeof document !== 'undefined' && document.head && !document.getElementById('not-access-permission-style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'not-access-permission-style';
        styleEl.innerHTML = `@keyframes notAccessFadeIn { 0% { opacity: 0; transform: scale(0.96) translateY(6px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }`;
        document.head.appendChild(styleEl);
    }

    const existing = document.getElementById('not-access-permission-modal');
    if (existing) existing.remove();

    const userName = (localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || 'ব্যবহারকারী').trim();
    const userRole = (localStorage.getItem('school_user_role') || localStorage.getItem('school_user_role_key') || 'সাধারণ ইউজার').trim();
    const optionName = details.name || 'এই অপশনটি';

    const modal = document.createElement('div');
    modal.id = 'not-access-permission-modal';
    modal.style.cssText = 'position: fixed; inset: 0; z-index: 999999; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;';
    modal.innerHTML = `
        <div style="background: #ffffff; border: 2px solid #ef4444; border-radius: 20px; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25); max-width: 520px; width: 100%; padding: 32px 24px; text-align: center; position: relative; box-sizing: border-box; animation: notAccessFadeIn 0.25s ease-out; font-family: system-ui, -apple-system, sans-serif;">
            <button type="button" onclick="document.getElementById('not-access-permission-modal').remove()" style="position: absolute; top: 16px; right: 16px; background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 16px; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div style="width: 70px; height: 70px; margin: 0 auto 16px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #dc2626; box-shadow: 0 6px 18px rgba(220, 38, 38, 0.25);">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: #fee2e2; color: #991b1b; padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 0.78rem; margin-bottom: 12px; border: 1px solid #fca5a5;">
                🚫 ACCESS RESTRICTED
            </div>
            <h3 style="color: #0f172a; font-size: 1.35rem; font-weight: 900; margin: 0 0 10px;">
                Not Access Permissions
            </h3>
            <p style="color: #475569; font-size: 0.92rem; font-weight: 600; line-height: 1.5; margin: 0 0 18px;">
                আপনার ইউজার প্রোফাইলে <strong>"${escapeHtml(optionName)}"</strong> চালু করার অনুমতি দেওয়া নেই।
            </p>
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 10px 14px; margin-bottom: 22px; text-align: left; font-size: 0.82rem; color: #334155;">
                <div><strong>👤 ইউজার:</strong> ${escapeHtml(userName)} (${escapeHtml(userRole)})</div>
                <div><strong>🛡️ কারণ:</strong> "🛡️ ভূমিকা ও পারমিশন লেভেল" অনুযায়ী পারমিশন দেওয়া নেই</div>
            </div>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button type="button" onclick="document.getElementById('not-access-permission-modal').remove()" style="background: #dc2626; color: #ffffff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 0.90rem; cursor: pointer; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                    ঠিক আছে (OK)
                </button>
                <a href="Home.html" style="background: #0052ff; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 0.90rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0, 82, 255, 0.25);">
                    <i class="fa-solid fa-house"></i> হোম
                </a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
window.showNotAccessPermissionsModal = showNotAccessPermissionsModal;

// Page-level Route Guard to prevent unauthorized view on direct URL access, refresh, or link
function enforcePageModuleGuard(permissions) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return;
    if (!permissions || !Array.isArray(permissions)) return;
    if (permissions.includes('*')) return;

    const userMobile = (localStorage.getItem('school_user_mobile') || '').trim();
    const userRoleKey = (localStorage.getItem('school_user_role_key') || '').trim();
    const userId = (localStorage.getItem('school_user_id') || '').trim();
    if (userMobile === 'admin' || userId === 'admin' || userRoleKey === 'admin') return;

    const fullCurrentUrl = (window.location.pathname.split('/').pop() || '') + window.location.search;
    const check = checkResourceAccessPermission(fullCurrentUrl);
    if (!check.allowed) {
        const mainContainer = document.querySelector('.main-content, .portal-container, .dashboard-container, main') || document.body;
        if (mainContainer && !document.getElementById('not-access-permission-screen')) {
            renderNotAccessPermissionsScreen(mainContainer, check);
        }
    }
}

// Global click listener to intercept any link click targeting unauthorized resources
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = (link.getAttribute('href') || '').trim();
    if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:')) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return;

    const userMobile = (localStorage.getItem('school_user_mobile') || '').trim();
    const userRoleKey = (localStorage.getItem('school_user_role_key') || '').trim();
    const userId = (localStorage.getItem('school_user_id') || '').trim();
    if (userMobile === 'admin' || userId === 'admin' || userRoleKey === 'admin') return;

    const check = checkResourceAccessPermission(href);
    if (!check.allowed) {
        e.preventDefault();
        e.stopPropagation();
        showNotAccessPermissionsModal(check);
        return false;
    }
}, true);

// Global Interceptor Hooks for SPA Subview Switchers
function attachGlobalSubviewGuards() {
    // 1. Advance Portal Switcher Guard
    if (typeof window.switchAdvanceView === 'function' && !window.switchAdvanceView.__guarded) {
        const originalSwitch = window.switchAdvanceView;
        window.switchAdvanceView = function(viewName) {
            const check = checkResourceAccessPermission('advance.html?view=' + viewName);
            if (!check.allowed) {
                const subview = document.getElementById('subview-' + viewName) || document.querySelector('.portal-container') || document.getElementById('advance');
                renderNotAccessPermissionsScreen(subview, check);
                return;
            }
            return originalSwitch.apply(this, arguments);
        };
        window.switchAdvanceView.__guarded = true;
    }

    // 2. Student Portal Switcher Guard
    if (typeof window.switchPortalView === 'function' && !window.switchPortalView.__guarded) {
        const originalSwitch = window.switchPortalView;
        window.switchPortalView = function(viewName) {
            const check = checkResourceAccessPermission('student-portal.html?view=' + viewName);
            if (!check.allowed) {
                const subview = document.getElementById('subview-' + viewName) || document.querySelector('.portal-container');
                renderNotAccessPermissionsScreen(subview, check);
                return;
            }
            return originalSwitch.apply(this, arguments);
        };
        window.switchPortalView.__guarded = true;
    }

    // 3. Seat Plan Switcher Guard
    if (typeof window.switchSeatTab === 'function' && !window.switchSeatTab.__guarded) {
        const originalSwitch = window.switchSeatTab;
        window.switchSeatTab = function(tabName, updateHistory) {
            const check = checkResourceAccessPermission('seat-plan.html?view=' + tabName);
            if (!check.allowed) {
                const subview = document.getElementById('subview-' + tabName) || document.querySelector('.seat-portal-container');
                renderNotAccessPermissionsScreen(subview, check);
                return;
            }
            return originalSwitch.apply(this, arguments);
        };
        window.switchSeatTab.__guarded = true;
    }

    // 4. Exam Portal Switcher Guard
    if (typeof window.switchExamView === 'function' && !window.switchExamView.__guarded) {
        const originalSwitch = window.switchExamView;
        window.switchExamView = function(viewName) {
            const check = checkResourceAccessPermission('exam-portal.html?view=' + viewName);
            if (!check.allowed) {
                const subview = document.getElementById('subview-' + viewName) || document.querySelector('.portal-container');
                renderNotAccessPermissionsScreen(subview, check);
                return;
            }
            return originalSwitch.apply(this, arguments);
        };
        window.switchExamView.__guarded = true;
    }
}
window.addEventListener('DOMContentLoaded', attachGlobalSubviewGuards);
setTimeout(attachGlobalSubviewGuards, 500);

// --- ULTRA-FAST LOCAL STORAGE SQLITE REAL-TIME SYNC SYSTEM ---
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;
const originalClear = localStorage.clear;

const INITIAL_SYNC_KEYS = [
    'school_settings',
    'school_class_fees',
    'school_id_reg_settings',
    'school_classes',
    'school_class_sections',
    'school_class_id_prefixes',
    'school_class_reg_prefixes',
    'school_class_custom_levels',
    'school_students',
    'school_admission_applications',
    'contact_messages',
    'school_notices',
    'school_slider_images',
    'school_hero_bg_image',
    'school_important_links',
    'school_logo',
    'school_exam_schedules',
    'school_exam_routines',
    'school_shift_times',
    'school_buildings',
    'school_rooms',
    'school_subjects',
    'school_marking_system',
    'school_student_marks',
    'school_ticker_notices',
    'school_staff',
    'school_users',
    'school_designations',
    'school_exam_types',
    'school_saved_seat_allocations',
    'school_seat_plans_store',
    'school_others_clubs',
    'school_others_gallery',
    'school_payments',
    'school_excluded_buildings',
    'school_excluded_rooms',
    'school_seat_allocations',
    'school_dist_excluded_class_sections',
    'school_dist_included_sections',
    'school_seat_generator_panel_collapsed',
    'school_seat_layout_view_mode',
    'seat_token_language',
    'seat_token_fontsize',
    'seat_token_headline_fontsize',
    'admit_card_font_size',
    'teacher_report_memo_no',
    'teacher_report_sig_positions',
    'topsheet_font_family',
    'tabulation_gpa_method'
];

const SYNC_KEYS_SET = new Set(INITIAL_SYNC_KEYS);

// Helper to determine if a key is syncable with the main SQLite database
function isSyncableKey(key) {
    if (!key || typeof key !== 'string') return false;
    // Client-local session and device keys must NEVER be overwritten by shared DB sync
    const sessionKeys = [
        'isLoggedIn', 'currentUser', 'school_user_name', 'school_user_role', 
        'school_user_role_key', 'school_user_mobile', 'school_user_id', 
        'school_user_photo', 'school_user_permissions', '__school_user_login_time',
        '__school_session_id', '__school_device_mac', 'school_user_district'
    ];
    if (sessionKeys.includes(key)) return false;
    if (key.startsWith('__sync_') || key.startsWith('__temp_') || key.startsWith('temp_') || key.startsWith('session_') || key.startsWith('debug_')) {
        return false;
    }
    return true;
}

let isPullingDb = false;
let hasSyncedInitially = false;
window.lastLocalWrites = {};
const lastLocalWrites = window.lastLocalWrites;

// Cross-tab real-time sync channel
const dbBroadcast = ('BroadcastChannel' in window) ? new BroadcastChannel('school_realtime_db_channel') : null;
if (dbBroadcast) {
    dbBroadcast.onmessage = (event) => {
        try {
            const msg = event.data;
            if (!msg || !msg.type) return;
            if (msg.type === 'set' && msg.key && isSyncableKey(msg.key)) {
                isPullingDb = true;
                try {
                    originalSetItem.call(localStorage, msg.key, msg.value);
                    if (msg.ver) setLocalVersion(msg.key, msg.ver);
                } finally {
                    isPullingDb = false;
                }
                triggerAllUIRefresh();
            } else if (msg.type === 'delete' && msg.key) {
                isPullingDb = true;
                try {
                    originalRemoveItem.call(localStorage, msg.key);
                    deleteLocalVersion(msg.key);
                } finally {
                    isPullingDb = false;
                }
                triggerAllUIRefresh();
            } else if (msg.type === 'clear') {
                isPullingDb = true;
                try {
                    originalClear.call(localStorage);
                } finally {
                    isPullingDb = false;
                }
                triggerAllUIRefresh();
            }
        } catch (e) {
            console.warn("BroadcastChannel sync error:", e);
        }
    };
}

// Helper to determine the API Endpoint dynamically
function getApiUrl(path) {
    if (window.location.protocol === 'file:') {
        const savedServerIp = localStorage.getItem('__sync_server_ip');
        const proto = localStorage.getItem('__sync_server_proto') || 'https';
        if (!savedServerIp) {
            const ip = prompt("লাইভ ডেটা সিঙ্ক করার জন্য অনুগ্রহ করে সার্ভার পিসির আইপি (Server IP) দিন:\n(যেমন: 192.168.0.10)", "192.168.0.10");
            if (ip) {
                localStorage.setItem('__sync_server_ip', ip.trim());
                return `${proto}://${ip.trim()}:8000${path}`;
            }
            return `${proto}://localhost:8000${path}`;
        }
        return `${proto}://${savedServerIp}:8000${path}`;
    }
    return path;
}

// Local version helpers to store server timestamps
function getLocalVersion(key) {
    const ver = localStorage.getItem(`__sync_ver_${key}`);
    return ver ? parseInt(ver, 10) : 0;
}

function setLocalVersion(key, version) {
    originalSetItem.call(localStorage, `__sync_ver_${key}`, version.toString());
}

function deleteLocalVersion(key) {
    originalRemoveItem.call(localStorage, `__sync_ver_${key}`);
}

// Visual Sync Status Badge Management
function updateSyncStatus(status, message = "") {
    let badge = document.getElementById('sync-status-badge');
    if (!badge) {
        const brand = document.querySelector('.nav-brand');
        if (brand) {
            badge = document.createElement('span');
            badge.id = 'sync-status-badge';
            badge.style.fontSize = '0.75rem';
            badge.style.padding = '3px 8px';
            badge.style.borderRadius = '20px';
            badge.style.marginLeft = '8px';
            badge.style.fontWeight = 'bold';
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.gap = '4px';
            brand.appendChild(badge);
        }
    }

    if (badge) {
        if (status === 'connected') {
            badge.style.background = 'rgba(16, 185, 129, 0.15)';
            badge.style.color = '#10b981';
            badge.innerHTML = '<span style="color: #10b981;">●</span> Live';
            badge.title = "Sync Active: Real-time connected to database";
        } else if (status === 'error') {
            badge.style.background = 'rgba(239, 68, 68, 0.15)';
            badge.style.color = '#ef4444';
            badge.innerHTML = '<span style="color: #ef4444;">●</span> Offline';
            badge.title = message || "Sync Error: Could not connect to SQLite database server";
        } else {
            badge.style.background = 'rgba(148, 163, 184, 0.15)';
            badge.style.color = '#94a3b8';
            badge.innerHTML = '<span style="color: #94a3b8;">●</span> Offline';
            badge.title = "Local system only";
        }
    }
}

// Global UI Trigger to refresh all components across pages immediately
let isTriggeringRefresh = false;
function triggerAllUIRefresh() {
    if (isTriggeringRefresh) return;
    isTriggeringRefresh = true;

    try {
        if (typeof applySchoolSettings === 'function') applySchoolSettings();
    } catch (e) { }
    try {
        if (typeof updateNoticeTicker === 'function') updateNoticeTicker();
    } catch (e) { }

    // Dispatch standard events for pages listening to changes
    try {
        window.dispatchEvent(new Event('dbSynced'));
        window.dispatchEvent(new Event('storage'));
    } catch (e) { }

    // Call page-specific refresh handlers if present in DOM
    const refreshFunctions = [
        'updateHomeDataFromWebsite',
        'initDynamicHeroSlider',
        'populateStudentPortalClassDropdowns',
        'populateStudentPortalFilterDropdowns',
        'handleClassSelectChange',
        'updateIdRegPreviews',
        'updateCardPreview',
        'renderStudentList',
        'renderPromotionList',
        'renderNotices',
        'loadCurrentSettings',
        'loadClassFeesForm',
        'loadIdRegForm',
        'renderClassSectionList',
        'initializeFeeLabels',
        'calculateFees',
        'refreshTabulationSheetData',
        'refreshAdmitCardsData',
        'refreshStudentDataTopsheetData',
        'refreshAttendanceSheetData',
        'refreshSeatingDetailsData',
        'refreshRoomTopshetData',
        'renderStaffList',
        'renderStaff',
        'renderDesignations',
        'renderClubs',
        'renderGallery',
        'renderExamSchedules',
        'renderExamRoutines',
        'renderSeatPlan',
        'renderSeatPlans',
        'renderSavedSeatPlansTable',
        'renderBuildingRoomInventory',
        'renderShiftTimeTable',
        'populateExamTitleDropdown',
        'populateAllShiftDropdowns',
        'debouncedSyncRender',
        'refreshSeatPlanData',
        'renderSpeeches',
        'renderTeacherReport',
        'populateStaffSelectDropdown',
        'renderStaffUsersTable',
        'updateUserManagementStats'
    ];

    for (const fnName of refreshFunctions) {
        try {
            if (typeof window[fnName] === 'function') {
                window[fnName]();
            }
        } catch (e) {
            console.warn(`Error calling ${fnName} during refresh:`, e);
        }
    }

    // Crucial: Always re-apply user role and permissions after rendering components!
    try {
        if (typeof applyUserPermissionsUI === 'function') {
            applyUserPermissionsUI();
        }
    } catch (e) {
        console.warn("Error applying user permissions after UI refresh:", e);
    }

    isTriggeringRefresh = false;
}

// Fast Instant Bootstrapper: fetches full SQLite DB in ONE single compressed request on 1st load
async function instantDatabaseBoot() {
    // 1. Immediate sync from server-injected snapshot if available (0ms delay)
    try {
        if (window.__SERVER_SYNC_DATA__ && typeof window.__SERVER_SYNC_DATA__ === 'object') {
            const meta = window.__SERVER_SYNC_META__ || {};
            for (const [key, val] of Object.entries(window.__SERVER_SYNC_DATA__)) {
                if (val !== undefined && val !== null && isSyncableKey(key)) {
                    SYNC_KEYS_SET.add(key);
                    originalSetItem.call(localStorage, key, val);
                    const ver = meta[key] || Date.now();
                    setLocalVersion(key, ver);
                }
            }
            hasSyncedInitially = true;
            localStorage.setItem('__sync_initialized', 'true');
            updateSyncStatus('connected');
            triggerAllUIRefresh();
            if (typeof applyUserPermissionsUI === 'function') applyUserPermissionsUI();
        }
    } catch (e) { }

    isPullingDb = true;
    try {
        const [metaRes, fullDbRes] = await Promise.all([
            fetch(getApiUrl(`/api/db/meta?t=${Date.now()}`)),
            fetch(getApiUrl(`/api/db?t=${Date.now()}`))
        ]);

        if (metaRes.ok && fullDbRes.ok) {
            const serverMeta = await metaRes.json();
            const serverData = await fullDbRes.json();

            for (const [key, val] of Object.entries(serverData)) {
                if (val !== undefined && val !== null && isSyncableKey(key)) {
                    SYNC_KEYS_SET.add(key);
                    originalSetItem.call(localStorage, key, val);
                    const ver = serverMeta[key] || Date.now();
                    setLocalVersion(key, ver);
                }
            }

            hasSyncedInitially = true;
            localStorage.setItem('__sync_initialized', 'true');
            updateSyncStatus('connected');

            // Trigger immediate render with real database data
            triggerAllUIRefresh();
            if (typeof applyUserPermissionsUI === 'function') applyUserPermissionsUI();

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    triggerAllUIRefresh();
                    if (typeof applyUserPermissionsUI === 'function') applyUserPermissionsUI();
                }, { once: true });
            }
            return true;
        }
    } catch (e) {
        console.warn("Instant DB boot fallback to regular sync:", e);
    }
    return false;
}

// Ultra-fast Micro-Batching Push Queue Engine
let pendingPushMap = new Map();
let pendingDeleteSet = new Set();
let pushQueueTimer = null;
let isPushingBatch = false;

function schedulePushQueueFlush(delayMs = 15) {
    if (pushQueueTimer) clearTimeout(pushQueueTimer);
    pushQueueTimer = setTimeout(() => {
        pushQueueTimer = null;
        flushPushQueueNow();
    }, delayMs);
}

async function flushPushQueueNow() {
    if (isPushingBatch) return;
    if (pendingPushMap.size === 0 && pendingDeleteSet.size === 0) return;

    isPushingBatch = true;
    const toPush = new Map(pendingPushMap);
    const toDelete = Array.from(pendingDeleteSet);

    pendingPushMap.clear();
    pendingDeleteSet.clear();

    try {
        // 1. Bulk Push all pending writes in ONE single fast request
        if (toPush.size > 0) {
            const dataObj = {};
            for (const [k, v] of toPush.entries()) {
                dataObj[k] = v;
            }

            const res = await fetch(getApiUrl('/api/db/bulk-save'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: dataObj })
            });

            if (res.ok) {
                const resData = await res.json();
                const nowTs = resData.updated_at || Date.now();
                for (const k of toPush.keys()) {
                    setLocalVersion(k, nowTs);
                    originalRemoveItem.call(localStorage, `__sync_pending_set_${k}`);
                }
                updateSyncStatus('connected');
            } else {
                // Re-queue on failure
                for (const [k, v] of toPush.entries()) {
                    if (!pendingPushMap.has(k)) pendingPushMap.set(k, v);
                }
            }
        }

        // 2. Process pending deletes
        if (toDelete.length > 0) {
            for (const k of toDelete) {
                await deleteFromServer(k);
                originalRemoveItem.call(localStorage, `__sync_pending_del_${k}`);
            }
        }
    } catch (e) {
        console.warn("Error flushing push queue to server:", e);
        // Re-queue
        for (const [k, v] of toPush.entries()) {
            if (!pendingPushMap.has(k)) pendingPushMap.set(k, v);
        }
    } finally {
        isPushingBatch = false;
        if (pendingPushMap.size > 0 || pendingDeleteSet.size > 0) {
            schedulePushQueueFlush(300);
        }
    }
}

let isSyncing = false; // Prevent overlapping runs

async function syncDatabaseFromServer() {
    if (isSyncing) return;
    isSyncing = true;

    try {
        // 1. Flush any pending local writes first
        if (pendingPushMap.size > 0 || pendingDeleteSet.size > 0) {
            await flushPushQueueNow();
        }

        // 2. Fetch server metadata
        const response = await fetch(getApiUrl(`/api/db/meta?t=${Date.now()}`));
        if (response.ok) {
            const serverMeta = await response.json();
            updateSyncStatus('connected');

            // Dynamically register all keys from server
            for (const k of Object.keys(serverMeta)) {
                if (isSyncableKey(k)) {
                    SYNC_KEYS_SET.add(k);
                }
            }

            const keysToFetch = [];
            let hasChanges = false;

            isPullingDb = true;
            try {
                for (const key of SYNC_KEYS_SET) {
                    const lastWriteTime = (window.lastLocalWrites && window.lastLocalWrites[key]) || 0;
                    if (Date.now() - lastWriteTime < 6000) {
                        continue;
                    }
                    if (pendingPushMap.has(key) || pendingDeleteSet.has(key) ||
                        localStorage.getItem(`__sync_pending_set_${key}`) === 'true' ||
                        localStorage.getItem(`__sync_pending_del_${key}`) === 'true') {
                        continue;
                    }

                    const serverVer = serverMeta[key];
                    const localVer = getLocalVersion(key);
                    const localVal = localStorage.getItem(key);

                    if (serverVer !== undefined && serverVer !== null) {
                        if (localVal === null || localVer !== serverVer) {
                            keysToFetch.push(key);
                        }
                    } else if (localVal !== null) {
                        // Key exists locally but not on server yet -> push to server instead of deleting
                        pendingPushMap.set(key, localVal);
                        schedulePushQueueFlush(50);
                    }
                }

                // If many keys changed, fetch full snapshot at once
                if (keysToFetch.length > 5 || (!hasSyncedInitially && keysToFetch.length > 0)) {
                    const fetchRes = await fetch(getApiUrl(`/api/db?t=${Date.now()}`));
                    if (fetchRes.ok) {
                        const fetchedData = await fetchRes.json();
                        for (const [k, v] of Object.entries(fetchedData)) {
                            const lastWriteTime = (window.lastLocalWrites && window.lastLocalWrites[k]) || 0;
                            if (Date.now() - lastWriteTime < 6000) {
                                continue;
                            }
                            if (pendingPushMap.has(k) || pendingDeleteSet.has(k) ||
                                localStorage.getItem(`__sync_pending_set_${k}`) === 'true' ||
                                localStorage.getItem(`__sync_pending_del_${k}`) === 'true') {
                                continue;
                            }
                            if (v !== undefined && v !== null && isSyncableKey(k)) {
                                SYNC_KEYS_SET.add(k);
                                originalSetItem.call(localStorage, k, v);
                                if (serverMeta[k] !== undefined) {
                                    setLocalVersion(k, serverMeta[k]);
                                }
                                hasChanges = true;
                            }
                        }
                    }
                } else if (keysToFetch.length > 0) {
                    const fetchRes = await fetch(getApiUrl(`/api/db?keys=${keysToFetch.join(',')}&t=${Date.now()}`));
                    if (fetchRes.ok) {
                        const fetchedData = await fetchRes.json();
                        for (const key of keysToFetch) {
                            const lastWriteTime = (window.lastLocalWrites && window.lastLocalWrites[key]) || 0;
                            if (Date.now() - lastWriteTime < 6000) {
                                continue;
                            }
                            if (pendingPushMap.has(key) || pendingDeleteSet.has(key) ||
                                localStorage.getItem(`__sync_pending_set_${key}`) === 'true' ||
                                localStorage.getItem(`__sync_pending_del_${key}`) === 'true') {
                                continue;
                            }
                            const val = fetchedData[key];
                            if (val !== undefined && val !== null) {
                                originalSetItem.call(localStorage, key, val);
                                setLocalVersion(key, serverMeta[key]);
                                hasChanges = true;
                            }
                        }
                    }
                }
            } finally {
                isPullingDb = false;
                hasSyncedInitially = true;
            }

            if (hasChanges) {
                triggerAllUIRefresh();
            }
        } else {
            updateSyncStatus('error', `Server returned status ${response.status}`);
        }
    } catch (e) {
        console.error("Failed to sync database from server:", e);
        updateSyncStatus('error', e.message || "Network connection failed");
    } finally {
        isSyncing = false;
        hasSyncedInitially = true;
    }
}

async function pushToServer(key, value) {
    try {
        const response = await fetch(getApiUrl('/api/db/save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value })
        });
        if (response.ok) {
            const resData = await response.json();
            if (resData.updated_at) {
                setLocalVersion(key, resData.updated_at);
            }
            return true;
        }
    } catch (e) {
        console.error("Failed to push setItem to server:", e);
    }
    return false;
}

async function deleteFromServer(key) {
    try {
        const response = await fetch(getApiUrl('/api/db/delete'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        if (response.ok) {
            deleteLocalVersion(key);
            return true;
        }
    } catch (e) {
        console.error("Failed to push removeItem to server:", e);
    }
    return false;
}

async function clearOnServer() {
    try {
        const response = await fetch(getApiUrl('/api/db/clear'), {
            method: 'POST'
        });
        if (response.ok) {
            SYNC_KEYS_SET.forEach(key => {
                deleteLocalVersion(key);
            });
            return true;
        }
    } catch (e) {
        console.error("Failed to push clear to server:", e);
    }
    return false;
}

// Global Storage Interceptors with Lightning Real-time Dispatch
localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (!isPullingDb && isSyncableKey(key)) {
        SYNC_KEYS_SET.add(key);
        originalSetItem.call(localStorage, `__sync_pending_set_${key}`, 'true');
        originalRemoveItem.call(localStorage, `__sync_pending_del_${key}`);

        // Broadcast to other open browser tabs immediately (0ms)
        if (dbBroadcast) {
            try {
                dbBroadcast.postMessage({ type: 'set', key, value, ver: Date.now() });
            } catch (e) {}
        }

        // Queue for server persistence
        pendingPushMap.set(key, value);
        pendingDeleteSet.delete(key);
        schedulePushQueueFlush(10);
    }
};

localStorage.removeItem = function (key) {
    originalRemoveItem.apply(this, arguments);
    if (!isPullingDb && isSyncableKey(key)) {
        originalSetItem.call(localStorage, `__sync_pending_del_${key}`, 'true');
        originalRemoveItem.call(localStorage, `__sync_pending_set_${key}`);

        // Broadcast to other open tabs
        if (dbBroadcast) {
            try {
                dbBroadcast.postMessage({ type: 'delete', key });
            } catch (e) {}
        }

        pendingDeleteSet.add(key);
        pendingPushMap.delete(key);
        schedulePushQueueFlush(10);
    }
};

localStorage.clear = function () {
    originalClear.apply(this, arguments);
    if (!isPullingDb) {
        if (dbBroadcast) {
            try {
                dbBroadcast.postMessage({ type: 'clear' });
            } catch (e) {}
        }
        SYNC_KEYS_SET.forEach(key => {
            originalSetItem.call(localStorage, `__sync_pending_del_${key}`, 'true');
            originalRemoveItem.call(localStorage, `__sync_pending_set_${key}`);
        });
        clearOnServer();
    }
};

window.clearOnServer = clearOnServer;
window.flushPushQueueNow = flushPushQueueNow;
window.syncDatabaseFromServer = syncDatabaseFromServer;

// Immediate Tab Bar, Option, and Action Click Listeners
function setupTabBarFastSyncListeners() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, .advance-nav-pill, .nav-item, .tab-btn, .tab-button, .menu-item, select');
        if (target) {
            // Instantly flush any pending writes and trigger quick sync check
            flushPushQueueNow();
        }
    }, { capture: true });

    document.addEventListener('change', (e) => {
        const target = e.target.closest('input, select, textarea');
        if (target) {
            flushPushQueueNow();
        }
    }, { capture: true });
}

// Page visibility, Tab focus, and Unload handlers for guaranteed zero data loss
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        flushPushQueueNow();
    } else if (document.visibilityState === 'visible') {
        syncDatabaseFromServer();
    }
});

window.addEventListener('focus', () => {
    syncDatabaseFromServer();
});

window.addEventListener('beforeunload', () => {
    flushPushQueueNow();
});

window.addEventListener('pagehide', () => {
    flushPushQueueNow();
});

// Function to update notice ticker dynamically
function updateNoticeTicker() {
    const noticeElements = document.querySelectorAll('.notice-text, #homeNoticeMarquee');
    if (noticeElements.length === 0) return;

    let tickerItems = [];

    // 1. Try explicitly managed ticker notices first
    let storedTicker = localStorage.getItem('school_ticker_notices');
    if (storedTicker) {
        try {
            const parsed = JSON.parse(storedTicker);
            if (Array.isArray(parsed) && parsed.length > 0) {
                tickerItems = parsed.map((item, idx) => {
                    if (!item) return null;
                    if (typeof item === 'string' && item.trim() !== '') {
                        return { text: item.trim(), pdf: null, index: idx };
                    }
                    if (typeof item === 'object') {
                        const txt = (item.text || item.title || '').trim();
                        if (!txt) return null;
                        return { text: txt, pdf: item.pdf || null, fileName: item.fileName || '', index: idx };
                    }
                    return null;
                }).filter(Boolean);
            }
        } catch (e) {
            console.error("Failed to parse school_ticker_notices:", e);
        }
    }

    // 2. If no custom ticker list, dynamically generate from published website notices (school_notices)
    if (tickerItems.length === 0) {
        let storedNotices = localStorage.getItem('school_notices');
        if (storedNotices) {
            try {
                const notices = JSON.parse(storedNotices);
                if (Array.isArray(notices) && notices.length > 0) {
                    tickerItems = notices.slice(0, 8).map((n, idx) => {
                        const dateStr = n.date ? ` (${n.date})` : '';
                        const titleStr = n.title || n.desc || 'বিজ্ঞপ্তি';
                        const descStr = (n.desc && n.title && n.desc !== n.title) ? ` — ${n.desc}` : '';
                        return { text: `${titleStr}${dateStr}${descStr}`, pdf: n.pdf || n.file || null, index: idx };
                    });
                }
            } catch (e) {
                console.error("Failed to parse school_notices:", e);
            }
        }
    }

    // 3. Fallback default notices
    if (tickerItems.length === 0) {
        tickerItems = [
            { text: "বার্ষিক মডেল টেস্ট পরীক্ষা ২০২৬-এর সময়সূচি ও প্রবেশপত্র বিতরণ সংক্রান্ত জরুরি বিজ্ঞপ্তি।", pdf: null },
            { text: "ষষ্ঠ থেকে দশম শ্রেণির অর্ধবার্ষিক পারফরম্যান্স মূল্যায়ন প্রকাশিত হয়েছে।", pdf: null },
            { text: "বিজ্ঞান মেলা এবং বার্ষিক ক্রীড়া প্রতিযোগিতা সংক্রান্ত বিশেষ বিজ্ঞপ্তি।", pdf: null }
        ];
    }

    const fullHtml = tickerItems.map(item => {
        if (item.pdf) {
            return `<span>✦ ${item.text} <a href="javascript:void(0)" onclick="openTickerPdfFromGlobal(${item.index})" class="ticker-pdf-badge" style="color: #1e40af; background: #e0e7ff; padding: 1px 7px; border-radius: 4px; font-weight: 700; text-decoration: none; font-size: 0.82rem; margin-left: 6px; border: 1px solid #c7d2fe; display: inline-flex; align-items: center; gap: 3px; cursor: pointer;">📄 PDF</a></span>`;
        }
        return `<span>✦ ${item.text}</span>`;
    }).join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

    const plainText = tickerItems.map(item => item.text).join("    ");
    const speed = Math.max(22, Math.round(plainText.length * 0.18));

    noticeElements.forEach(el => {
        el.innerHTML = fullHtml;
        el.style.animationDuration = `${speed}s`;
    });

    const noticeBars = document.querySelectorAll('.notice-bar');
    noticeBars.forEach(bar => {
        bar.style.display = 'block';
    });
}

function openNoticePdf(pdfData, title) {
    if (!pdfData) return;
    title = title || 'নোটিশ ডকুমেন্ট';
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
            
            const newTab = window.open(blobUrl, '_blank');
            if (!newTab) {
                const a = document.createElement('a');
                a.href = blobUrl;
                a.target = '_blank';
                a.download = (title.endsWith('.pdf') ? title : title + '.pdf');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } else {
            window.open(pdfData, '_blank');
        }
    } catch (e) {
        console.warn("Blob PDF opening failed, falling back to window.open iframe:", e);
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <style>body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #525659; }</style>
                </head>
                <body>
                    <iframe src="${pdfData}" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
                </body>
                </html>
            `);
        } else {
            const a = document.createElement('a');
            a.href = pdfData;
            a.download = (title.endsWith('.pdf') ? title : title + '.pdf');
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
}
window.openNoticePdf = openNoticePdf;

function downloadNoticePdf(pdfData, title) {
    if (!pdfData) return;
    title = title || 'নোটিশ ডকুমেন্ট';
    const fileName = (title.endsWith('.pdf') ? title : title + '.pdf');
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
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
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
        console.error("Error downloading PDF:", e);
    }
}
window.downloadNoticePdf = downloadNoticePdf;

function openTickerPdfFromGlobal(index) {
    try {
        const stored = localStorage.getItem('school_ticker_notices');
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed) || !parsed[index]) return;
        const item = parsed[index];
        const pdfData = (typeof item === 'object') ? item.pdf : null;
        if (!pdfData) return;
        openNoticePdf(pdfData, item.fileName || item.title || item.text || 'নোটিশ-ডকুমেন্ট.pdf');
    } catch (e) {
        console.error("Error opening ticker PDF:", e);
    }
}
window.openTickerPdfFromGlobal = openTickerPdfFromGlobal;

// Ensure notice ticker updates on database sync and storage changes
window.updateNoticeTicker = updateNoticeTicker;
window.addEventListener('dbSynced', updateNoticeTicker);
window.addEventListener('storage', (e) => {
    if (e.key === 'school_notices' || e.key === 'school_ticker_notices') {
        updateNoticeTicker();
    }
    if (e.key === 'school_settings' || e.key === 'school_logo' || e.key === 'school_hero_bg_image') {
        applySchoolSettings();
    }
});

// Start Instant DB Boot immediately on script evaluation
window.dbBootPromise = (async function initSyncEngine() {
    setupTabBarFastSyncListeners();
    const booted = await instantDatabaseBoot();
    if (!booted) {
        await syncDatabaseFromServer();
    }
    // High-performance background polling interval (1.8 seconds)
    setInterval(syncDatabaseFromServer, 1800);
    return true;
})();

// Re-verify UI after DOM is fully constructed
document.addEventListener('DOMContentLoaded', () => {
    setupTabBarFastSyncListeners();
    updateNoticeTicker();
    if (hasSyncedInitially) {
        triggerAllUIRefresh();
    }
});


// --- 1. HERO SLIDESHOW JAVASCRIPT ---
let currentSlideIndex = 0;
let slides = [];
let dotsContainer = document.getElementById('slider-dots-container');
let sliderTimer;

const DEFAULT_SLIDES = [];

function loadSliderImages() {
    let stored = localStorage.getItem('school_slider_images');
    if (!stored) {
        return [];
    }
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function renderSlider() {
    const header = document.querySelector('.hero-slider-container');
    if (!header) return;

    // Remove all old slide elements
    const oldSlides = header.querySelectorAll('.slide');
    oldSlides.forEach(s => s.remove());

    // Clear dots
    dotsContainer = document.getElementById('slider-dots-container');
    if (dotsContainer) dotsContainer.innerHTML = '';

    slides = [];
    stopSliderTimer();
    const prevBtn = header.querySelector('.slider-btn-prev');
    const nextBtn = header.querySelector('.slider-btn-next');
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none';
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
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
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
    reader.onerror = function (err) {
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
        compressImage(file, function (compressedBase64) {
            images.push({
                url: compressedBase64,
                title: 'গুণগত শিক্ষা ও মনোরম পরিবেশের সেরা ঠিকানা',
                badge: 'স্মার্ট ক্যাম্পাস ২০২৬',
                badgeColor: 'bg-amber-500 text-slate-950',
                desc: 'Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School — শিক্ষার্থীদের সার্বিক বিকাশে প্রতিশ্রুতিবদ্ধ।'
            });
            loadedCount++;

            if (loadedCount === imageFiles.length) {
                try {
                    // Update write timestamp to prevent immediate sync poll overwrite
                    if (typeof lastLocalWrites === 'object') {
                        lastLocalWrites['school_slider_images'] = Date.now();
                    }
                    localStorage.setItem('school_slider_images', JSON.stringify(images));
                    if (typeof flushPushQueueNow === 'function') {
                        flushPushQueueNow();
                    }
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
        if (typeof lastLocalWrites === 'object') {
            lastLocalWrites['school_slider_images'] = Date.now();
        }
        localStorage.setItem('school_slider_images', JSON.stringify(images));
        if (typeof flushPushQueueNow === 'function') {
            flushPushQueueNow();
        }

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
    let rawSettings = localStorage.getItem('school_settings');
    if (!rawSettings) {
        // Wait for server SQLite DB sync to arrive, never overwrite with dummy defaults
        return;
    }
    let settings = {};
    try {
        settings = JSON.parse(rawSettings);
    } catch (e) {
        return;
    }

    if (!settings || typeof settings !== 'object') return;

    // Update document title if it contains the old or default school name
    const oldTitle = document.title;
    if (oldTitle.includes("Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School") || oldTitle.includes("আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়")) {
        document.title = oldTitle.replace(/Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School|আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়/g, settings.schoolName);
    }

    // Update Hero Title
    const heroTitle = document.getElementById('school-name');
    if (heroTitle) {
        heroTitle.textContent = settings.schoolName;
    }

    // Update Home Page Title
    const homeTitle = document.getElementById('homeSchoolTitle');
    if (homeTitle) {
        homeTitle.textContent = settings.schoolName;
    }

    // Update Hero Subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroSubtitle.textContent = settings.schoolSubtitle || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
    }

    // Update Home Page Subtitle
    const homeSubTitle = document.getElementById('homeSchoolSubTitle');
    if (homeSubTitle) {
        homeSubTitle.textContent = settings.schoolSubtitle || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
    }

    // Update Hero Gmail
    const heroGmail = document.querySelector('.hero-gmail');
    if (heroGmail) {
        if (settings.schoolGmail) {
            heroGmail.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 6px; position: relative; top: -1.5px;"><path fill="#4285F4" d="M20 18h1.5V8L17 5v13h3z"/><path fill="#34A853" d="M4 18h3V5L2.5 8v10H4z"/><path fill="#EA4335" d="M17 5L12 8.5 7 5v13h10V5z"/><path fill="#FBBC05" d="M12 8.5l5-3.5L12 1.5 7 5l5 3.5z"/></svg><span style="vertical-align: middle;">${settings.schoolGmail}</span>`;
            heroGmail.style.display = 'block';
        } else {
            heroGmail.style.display = 'none';
        }
    }

    // Update Hero Other
    const heroOther = document.querySelector('.hero-other');
    if (heroOther) {
        if (settings.schoolOther) {
            heroOther.textContent = settings.schoolOther;
            heroOther.style.display = 'block';
        } else {
            heroOther.style.display = 'none';
        }
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

    // Update Seat Token School Name
    const tokenSchoolNames = document.querySelectorAll('.token-school-name');
    tokenSchoolNames.forEach(el => {
        el.textContent = settings.schoolName;
    });

    // Update Result Marksheet School Name
    const marksheetSchool = document.querySelector('.marksheet-header p:last-child');
    if (marksheetSchool && marksheetSchool.textContent.trim().includes("Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School")) {
        marksheetSchool.textContent = settings.schoolName;
    }
    const marksheetModalSchool = document.getElementById('marksheet-school-name-title');
    if (marksheetModalSchool && settings.schoolName) {
        marksheetModalSchool.textContent = settings.schoolName;
    }

    // Update Footer Text
    const footerParas = document.querySelectorAll('footer p');
    footerParas.forEach(p => {
        if (p.textContent.includes("Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School")) {
            p.textContent = p.textContent.replace(/Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School/g, settings.schoolName);
        }
    });

    // Helper to format/validate external URL
    function formatSocialMediaUrl(url) {
        if (!url) return '';
        url = url.toString().trim();
        if (!url || url === '#' || url.toLowerCase() === 'javascript:void(0)') return '';
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        return url;
    }

    const fbUrl = formatSocialMediaUrl(settings.facebookLink);
    const ytUrl = formatSocialMediaUrl(settings.youtubeLink);
    const twUrl = formatSocialMediaUrl(settings.twitterLink);

    // Update Footer Social Media Links (Facebook, YouTube, Twitter)
    function setupSocialLink(elements, url, platformName) {
        elements.forEach(el => {
            if (url) {
                el.href = url;
                el.target = "_blank";
                el.rel = "noopener noreferrer";
                el.setAttribute('title', `${platformName}: ${url}`);
                el.setAttribute('aria-label', platformName);
                el.style.cursor = 'pointer';
                el.onclick = null;
            } else {
                el.href = "javascript:void(0)";
                el.removeAttribute('target');
                el.removeAttribute('rel');
                el.setAttribute('title', `${platformName} লিংক সংযুক্ত করা নেই (Advance অপশন থেকে লিংক যোগ করুন)`);
                el.setAttribute('aria-label', platformName);
                el.onclick = (e) => {
                    e.preventDefault();
                    if (typeof showToastNotification === 'function') {
                        showToastNotification(`${platformName} লিংক এখনও যুক্ত করা হয়নি। Advance অপশনে গিয়ে লিংক যোগ করুন।`, 'error');
                    } else {
                        alert(`${platformName} লিংক এখনও যুক্ত করা হয়নি। Advance অপশনে গিয়ে লিংক যোগ করুন।`);
                    }
                };
            }
        });
    }

    // 1. Facebook
    const fbElements = document.querySelectorAll('.social-icon[aria-label="Facebook"], .social-icon[aria-label="facebook"], a.footer-social-facebook, [data-social="facebook"]');
    setupSocialLink(fbElements, fbUrl, "Facebook");

    // 2. YouTube
    const ytElements = document.querySelectorAll('.social-icon[aria-label="YouTube"], .social-icon[aria-label="youtube"], a.footer-social-youtube, [data-social="youtube"]');
    setupSocialLink(ytElements, ytUrl, "YouTube");

    // 3. Twitter / X
    const twElements = document.querySelectorAll('.social-icon[aria-label="Twitter"], .social-icon[aria-label="twitter"], .social-icon[aria-label="Twitter / X"], a.footer-social-twitter, [data-social="twitter"]');
    setupSocialLink(twElements, twUrl, "Twitter");

    // Fallback: any .footer-socials container where child links might not have matched the aria-labels
    document.querySelectorAll('.footer-socials').forEach(container => {
        const anchors = container.querySelectorAll('a.social-icon, a');
        if (anchors.length >= 1 && (!anchors[0].getAttribute('aria-label') || anchors[0].getAttribute('aria-label').toLowerCase().includes('facebook'))) {
            setupSocialLink([anchors[0]], fbUrl, "Facebook");
        }
        if (anchors.length >= 2 && (!anchors[1].getAttribute('aria-label') || anchors[1].getAttribute('aria-label').toLowerCase().includes('youtube'))) {
            setupSocialLink([anchors[1]], ytUrl, "YouTube");
        }
        if (anchors.length >= 3 && (!anchors[2].getAttribute('aria-label') || anchors[2].getAttribute('aria-label').toLowerCase().includes('twitter'))) {
            setupSocialLink([anchors[2]], twUrl, "Twitter");
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

    // Update Chairman Info (Home page & others)
    const chNameEl = document.getElementById('homeChairmanName');
    if (chNameEl) {
        chNameEl.textContent = settings.chairmanName || "";
    }
    const chTitleEl = document.getElementById('homeChairmanTitle');
    if (chTitleEl) {
        chTitleEl.textContent = settings.chairmanTitle || "";
    }
    const chTextEl = document.getElementById('homeChairmanText');
    if (chTextEl) {
        chTextEl.textContent = settings.chairmanMsg ? `"${settings.chairmanMsg}"` : "";
    }
    const chPhotoEl = document.getElementById('homeChairmanPhoto');
    const chIconEl = document.getElementById('homeChairmanIcon');
    if (chPhotoEl) {
        if (settings.chairmanPhoto) {
            chPhotoEl.src = settings.chairmanPhoto;
            chPhotoEl.classList.remove('hidden');
            chPhotoEl.style.display = 'block';
            if (chIconEl) {
                chIconEl.classList.add('hidden');
                chIconEl.style.display = 'none';
            }
        } else {
            chPhotoEl.src = "";
            chPhotoEl.classList.add('hidden');
            chPhotoEl.style.display = 'none';
            if (chIconEl) {
                chIconEl.classList.remove('hidden');
                chIconEl.style.display = 'inline-block';
            }
        }
    }

    // Update Headmaster Info (Home page & others)
    let headmaster = null;
    try {
        const staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
        headmaster = staffList.find(s => isHeadmasterDesignation(s.designation || s.designationBn));
    } catch (e) { }

    let hmName = "";
    if (headmaster && headmaster.nameBn) {
        if (settings.headmasterName && !/^[A-Za-z\s.,'-]+$/.test(settings.headmasterName.trim())) {
            hmName = settings.headmasterName;
        } else {
            hmName = headmaster.nameBn;
        }
    } else if (settings.headmasterName) {
        hmName = settings.headmasterName;
    } else if (headmaster) {
        hmName = headmaster.nameBn || headmaster.name || "শাহ মোঃ রোকনুজ্জামান চৌধুরী";
    } else {
        hmName = "শাহ মোঃ রোকনুজ্জামান চৌধুরী";
    }
    const hmTitle = settings.headmasterTitle !== undefined ? settings.headmasterTitle : (headmaster && headmaster.designation);
    const hmMsg = settings.headmasterMsg !== undefined ? settings.headmasterMsg : (headmaster && headmaster.message);
    const hmPhoto = settings.headmasterPhoto !== undefined ? settings.headmasterPhoto : (headmaster && headmaster.photo);

    const hmNameEl = document.getElementById('homeHeadmasterName');
    if (hmNameEl && hmName) {
        hmNameEl.textContent = hmName;
    }
    const hmTitleEl = document.getElementById('homeHeadmasterTitle');
    if (hmTitleEl && hmTitle !== undefined) {
        hmTitleEl.textContent = hmTitle;
    }
    const hmTextEl = document.getElementById('homeHeadmasterText');
    if (hmTextEl && hmMsg !== undefined) {
        hmTextEl.textContent = hmMsg ? `"${hmMsg}"` : "";
    }
    const hmPhotoEl = document.getElementById('homeHeadmasterPhoto');
    const hmIconEl = document.getElementById('homeHeadmasterIcon');
    if (hmPhotoEl) {
        if (hmPhoto) {
            hmPhotoEl.src = hmPhoto;
            hmPhotoEl.classList.remove('hidden');
            hmPhotoEl.style.display = 'block';
            if (hmIconEl) {
                hmIconEl.classList.add('hidden');
                hmIconEl.style.display = 'none';
            }
        } else if (hmIconEl) {
            hmPhotoEl.classList.add('hidden');
            hmPhotoEl.style.display = 'none';
            hmIconEl.classList.remove('hidden');
            hmIconEl.style.display = 'inline-block';
        }
    }

    // Apply custom logo
    applySchoolLogo();

    // Apply static hero title background picture
    applyHeroTitleBg();
}

function applySchoolLogo() {
    const logoContainers = document.querySelectorAll('.school-logo-container, #homeSchoolLogoContainer');
    const customLogo = localStorage.getItem('school_logo');

    logoContainers.forEach(container => {
        const isHomeLogo = container.id === 'homeSchoolLogoContainer';
        const imgIdAttr = isHomeLogo ? ' id="homeSchoolLogo"' : '';
        if (customLogo) {
            container.innerHTML = `<img${imgIdAttr} src="${customLogo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
        } else {
            // Default school logo SVG file
            container.innerHTML = `<img${imgIdAttr} src="school_logo.svg" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;
        }
    });
}

function applyHeroTitleBg() {
    const heroBg = localStorage.getItem('school_hero_bg_image');
    const headers = document.querySelectorAll('.hero-slider-container');

    headers.forEach(header => {
        let bgLayer = header.querySelector('.hero-title-bg-layer');
        if (!bgLayer) {
            bgLayer = document.createElement('div');
            bgLayer.className = 'hero-title-bg-layer';
            bgLayer.id = 'hero-title-bg-layer';
            const heroOverlay = header.querySelector('.hero-overlay');
            if (heroOverlay && heroOverlay.nextSibling) {
                header.insertBefore(bgLayer, heroOverlay.nextSibling);
            } else {
                const heroContent = header.querySelector('.hero-content');
                if (heroContent) {
                    header.insertBefore(bgLayer, heroContent);
                } else {
                    header.appendChild(bgLayer);
                }
            }
        }
        if (heroBg) {
            bgLayer.style.backgroundImage = `url('${heroBg}')`;
            bgLayer.style.display = 'block';
        } else {
            bgLayer.style.backgroundImage = 'none';
            bgLayer.style.display = 'none';
        }
    });

    // Update preview elements on settings page if present
    const previews = document.querySelectorAll('#hero-bg-preview, #general-hero-bg-preview');
    previews.forEach(p => {
        if (heroBg) {
            p.innerHTML = `<img src="${heroBg}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block;">`;
        } else {
            p.innerHTML = `<div style="color: #94a3b8; font-size: 0.75rem; text-align: center; padding: 8px; font-weight: 600;">কোনো ছবি নেই (ডিফল্ট)</div>`;
        }
    });
}

// Run immediately or on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        applySchoolSettings();
        applyHeroTitleBg();
        updateNoticeTicker();
        initMobileDropdowns();
        initializeNavbarLogin();
        applyUserPermissionsUI();
        renderSlider();
        initializeSliderControls();
    });
} else {
    applySchoolSettings();
    applyHeroTitleBg();
    updateNoticeTicker();
    initMobileDropdowns();
    initializeNavbarLogin();
    applyUserPermissionsUI();
    renderSlider();
    initializeSliderControls();
}

// Global storage sync listener for permissions and login state
window.addEventListener('storage', (e) => {
    if (e.key === 'isLoggedIn' || e.key === 'school_user_permissions' || e.key === 'school_users' || e.key === 'school_user_role_key') {
        if (typeof updateLoginButtonState === 'function') updateLoginButtonState();
        if (typeof applyUserPermissionsUI === 'function') applyUserPermissionsUI();
    }
});

// Automatic MutationObserver to keep newly rendered tables & modals strictly in sync with permissions
(function initPermissionsObserver() {
    let permDebounceTimer = null;
    const observer = new MutationObserver((mutations) => {
        let shouldApply = false;
        for (const m of mutations) {
            if (m.addedNodes && m.addedNodes.length > 0) {
                for (const node of m.addedNodes) {
                    if (node.nodeType === 1 && (
                        node.tagName === 'TR' || 
                        node.classList?.contains('action-icon-btn') || 
                        node.classList?.contains('action-icons-wrapper') ||
                        node.querySelector?.('.action-icon-btn, [data-perm], .btn-add-staff, .btn-add-student, .btn-fee-collect, .btn-exam-marks, .btn-publish-notice')
                    )) {
                        shouldApply = true;
                        break;
                    }
                }
            }
            if (shouldApply) break;
        }
        if (shouldApply) {
            if (permDebounceTimer) clearTimeout(permDebounceTimer);
            permDebounceTimer = setTimeout(() => {
                permDebounceTimer = null;
                if (typeof applyUserPermissionsUI === 'function') {
                    applyUserPermissionsUI();
                }
            }, 20);
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
})();


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
function getLoggedInUserPhoto() {
    let photo = localStorage.getItem('school_user_photo');
    if (photo && photo.trim().length > 0) return photo;

    try {
        const userMobile = localStorage.getItem('school_user_mobile');
        const userName = localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || '';
        const staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');

        if (userMobile === 'admin' || userName.includes('অ্যাডমিন') || userName.includes('প্রধান শিক্ষক')) {
            const settings = JSON.parse(localStorage.getItem('school_settings') || '{}');
            if (settings.headmasterPhoto) return settings.headmasterPhoto;
            const hm = staffList.find(s => isHeadmasterDesignation(s.designation || s.designationBn));
            if (hm && hm.photo) return hm.photo;
        } else if (userMobile) {
            const cleanMobile = userMobile.replace(/[^0-9a-zA-Z]/g, '');
            const staff = staffList.find(s => {
                const sMob = (s.mobile || '').replace(/[^0-9a-zA-Z]/g, '');
                return sMob && sMob === cleanMobile;
            });
            if (staff && staff.photo) return staff.photo;
        } else if (userName) {
            const staff = staffList.find(s => s.name && s.name.trim() === userName.trim());
            if (staff && staff.photo) return staff.photo;
        }
    } catch (e) {
        console.error("Error fetching user photo:", e);
    }
    return '';
}

function openLoginModal() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        performUserLogout();
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

function toggleUserDropdown(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const dropdown = document.getElementById('user-profile-dropdown');
    const toggleBtn = document.getElementById('user-avatar-toggle');
    if (!dropdown) return;

    // Attach directly to document.body to ensure it is always in TOP view above all containers and never clipped
    if (dropdown.parentElement !== document.body) {
        document.body.appendChild(dropdown);
    }

    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    } else {
        if (toggleBtn) {
            const rect = toggleBtn.getBoundingClientRect();
            dropdown.style.position = 'fixed';
            dropdown.style.top = Math.max(12, rect.bottom + 8) + 'px';
            dropdown.style.right = Math.max(12, window.innerWidth - rect.right) + 'px';
            dropdown.style.zIndex = '99999999';
        }
        dropdown.classList.add('show');
    }
}

function closeUserDropdown(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const dropdown = document.getElementById('user-profile-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

// Global listener to close user dropdown if clicked outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-profile-dropdown');
    const toggleBtn = document.getElementById('user-avatar-toggle');
    if (dropdown && dropdown.classList.contains('show')) {
        if (!dropdown.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
            dropdown.classList.remove('show');
        }
    }
});

function performUserLogout() {
    if (confirm("আপনি কি নিশ্চিত যে ওয়েবসাইট থেকে লগআউট করতে চান?")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('school_user_name');
        localStorage.removeItem('school_user_role');
        localStorage.removeItem('school_user_mobile');
        localStorage.removeItem('school_user_id');
        localStorage.removeItem('school_user_photo');
        localStorage.removeItem('school_user_permissions');
        localStorage.removeItem('school_user_role_key');
        localStorage.removeItem('__school_user_login_time');
        
        if (typeof updateLoginButtonState === 'function') {
            updateLoginButtonState();
        }
        if (typeof applyUserPermissionsUI === 'function') {
            applyUserPermissionsUI();
        }

        if (window.sendSchoolLogout) {
            window.sendSchoolLogout(() => {
                window.location.href = '/';
            });
        } else {
            window.location.href = '/';
        }
    }
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const userIdInput = (document.getElementById('login-user-id')?.value || '').trim();
    const passwordInput = (document.getElementById('login-password')?.value || '').trim();
    const errorEl = document.getElementById('login-error');
    const successEl = document.getElementById('login-success');

    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';

    if (!userIdInput || !passwordInput) {
        if (errorEl) {
            errorEl.textContent = "দয়া করে ইউজার আইডি এবং পাসওয়ার্ড লিখুন!";
            errorEl.style.display = 'block';
        }
        return;
    }

    // 1. Check Master Admin (admin / admin or admin / 12345 or Headmaster Mobile Number)
    const fixedAdmin = getFixedAdminUser();
    const cleanUserId = userIdInput.replace(/[^0-9a-zA-Z]/g, '');
    const cleanHmPhone = (fixedAdmin.headmasterPhone || '').replace(/[^0-9a-zA-Z]/g, '');
    const isHeadmasterIdMatch = (userIdInput.toLowerCase() === 'admin') || (cleanHmPhone && cleanHmPhone.length >= 8 && cleanUserId === cleanHmPhone);

    if (isHeadmasterIdMatch && (passwordInput.toLowerCase() === 'admin' || passwordInput === '12345' || passwordInput === fixedAdmin.headmasterPhone)) {
        if (successEl) {
            successEl.textContent = `👑 প্রধান শিক্ষক / অ্যাডমিন (${fixedAdmin.name}) লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...`;
            successEl.style.display = 'block';
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', fixedAdmin.name);
        localStorage.setItem('school_user_name', fixedAdmin.name);
        localStorage.setItem('school_user_role', 'প্রধান শিক্ষক / অ্যাডমিন');
        localStorage.setItem('school_user_role_key', 'admin');
        localStorage.setItem('school_user_mobile', 'admin');
        localStorage.setItem('school_user_photo', fixedAdmin.photo || '');
        localStorage.setItem('school_user_permissions', JSON.stringify(window.ALL_PERMISSIONS ? window.ALL_PERMISSIONS.map(p => p.id) : []));
        localStorage.setItem('__school_user_login_time', Date.now().toString());
        updateLoginButtonState();
        applyUserPermissionsUI();

        if (window.sendSchoolHeartbeat) window.sendSchoolHeartbeat();

        setTimeout(() => {
            closeLoginModal();
            location.reload();
        }, 1000);
        return;
    }

    // 2. Check Teacher & Staff Users Directory
    let staffUsers = [];
    try {
        staffUsers = JSON.parse(localStorage.getItem('school_users') || '[]');
    } catch (e) {
        staffUsers = [];
    }

    // If school_users is empty or not yet generated, fallback check in school_staff
    let staffList = [];
    try {
        staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
    } catch (e) {
        staffList = [];
    }

    const cleanInputId = userIdInput.replace(/[^0-9a-zA-Z]/g, '');

    // Search in school_users first
    let matchedUser = staffUsers.find(u => {
        const uMob = (u.mobile || '').replace(/[^0-9a-zA-Z]/g, '');
        const uName = (u.username || '').replace(/[^0-9a-zA-Z]/g, '');
        return (uMob && uMob === cleanInputId) || (uName && uName === cleanInputId) || (u.mobile === userIdInput);
    });

    // If not found in school_users, check school_staff (requires admin approval)
    if (!matchedUser) {
        const matchedStaff = staffList.find(s => {
            const sMob = (s.mobile || '').replace(/[^0-9a-zA-Z]/g, '');
            return (sMob && sMob === cleanInputId) || (s.mobile === userIdInput);
        });
        if (matchedStaff) {
            if (errorEl) {
                errorEl.textContent = "❌ আপনার শিক্ষক/স্টাফ প্রোফাইল যুক্ত আছে, কিন্তু ইউজার অ্যাকাউন্ট এখনো অ্যাডমিন কর্তৃক অনুমোদন (Approve) করা হয়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।";
                errorEl.style.display = 'block';
            }
            return;
        }
    }

    if (matchedUser) {
        if (matchedUser.isApproved === false || matchedUser.status === 'pending_approval' || matchedUser.status === 'pending') {
            if (errorEl) {
                errorEl.textContent = "⏳ আপনার একাউন্টটি অ্যাডমিনের অনুমোদনের অপেক্ষায় রয়েছে (Pending Approval)। অ্যাডমিন অনুমোদন করলে আপনি লগইন করতে পারবেন।";
                errorEl.style.display = 'block';
            }
            return;
        }

        if (matchedUser.status === 'inactive') {
            if (errorEl) {
                errorEl.textContent = "❌ দুঃখিত! এই একাউন্টটি নিষ্ক্রিয় করা আছে। অ্যাডমিনের সাথে যোগাযোগ করুন।";
                errorEl.style.display = 'block';
            }
            return;
        }

        // Verify Password (custom password or default mobile number)
        const validPassword = matchedUser.password || matchedUser.mobile;
        if (passwordInput === validPassword || (matchedUser.mobile && passwordInput === matchedUser.mobile)) {
            if (successEl) {
                successEl.textContent = `✅ স্বাগতম ${matchedUser.name}! সফলভাবে লগইন হয়েছে...`;
                successEl.style.display = 'block';
            }

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', matchedUser.name);
            localStorage.setItem('school_user_name', matchedUser.name);
            localStorage.setItem('school_user_role', matchedUser.designation || 'শিক্ষক / স্টাফ');
            localStorage.setItem('school_user_role_key', matchedUser.role || 'teacher');
            localStorage.setItem('school_user_mobile', matchedUser.mobile || '');
            localStorage.setItem('school_user_id', matchedUser.mobile || '');
            localStorage.setItem('school_user_photo', matchedUser.photo || '');
            const userPerms = window.getUserPermissions ? window.getUserPermissions(matchedUser) : (matchedUser.permissions || []);
            localStorage.setItem('school_user_permissions', JSON.stringify(userPerms));
            localStorage.setItem('__school_user_login_time', Date.now().toString());
            updateLoginButtonState();
            applyUserPermissionsUI();

            if (window.sendSchoolHeartbeat) window.sendSchoolHeartbeat();

            setTimeout(() => {
                closeLoginModal();
                location.reload();
            }, 1000);
            return;
        }
    }

    // Invalid credentials error
    if (errorEl) {
        errorEl.textContent = "❌ ভুল ইউজার আইডি বা পাসওয়ার্ড! প্রোফাইলে যুক্ত থাকা সঠিক মোবাইল নাম্বার দিন।";
        errorEl.style.display = 'block';
    }
}

function updateLoginButtonState() {
    const heroSlider = document.querySelector('.hero-slider-container');
    if (!heroSlider) return;

    let widget = document.getElementById('nav-user-header-widget');
    if (!widget) {
        const oldBtn = document.getElementById('nav-login-btn');
        if (oldBtn && oldBtn.parentElement === heroSlider) oldBtn.remove();

        widget = document.createElement('div');
        widget.id = 'nav-user-header-widget';
        widget.className = 'nav-user-header-widget';
        heroSlider.appendChild(widget);
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        widget.innerHTML = `
            <button id="nav-login-btn" class="hero-login-btn" onclick="openLoginModal()" title="লগইন করুন">
                <i class="fa-solid fa-right-to-bracket" style="margin-right: 6px;"></i>Login
            </button>
        `;
    } else {
        const userName = localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || 'ব্যবহারকারী';
        const userRole = localStorage.getItem('school_user_role') || 'শিক্ষক / স্টাফ';
        const userMobile = localStorage.getItem('school_user_mobile') || '';
        const userPhoto = getLoggedInUserPhoto();
        const isAdmin = userMobile === 'admin' || userName.includes('অ্যাডমিন') || userRole.includes('অ্যাডমিন');
        const defaultIcon = isAdmin ? 'fa-solid fa-user-shield' : 'fa-solid fa-user-tie';

        widget.innerHTML = `
            <div class="nav-user-profile-widget" id="nav-user-profile-widget">
                <div class="user-avatar-btn" id="user-avatar-toggle" onclick="toggleUserDropdown(event)" title="ইউজার মেনু দেখতে ক্লিক করুন">
                    <div class="user-avatar-img-wrap">
                        ${userPhoto ? `
                            <img src="${userPhoto}" alt="${userName}" class="user-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                            <div class="user-avatar-fallback" style="display:none;"><i class="${defaultIcon}"></i></div>
                        ` : `
                            <div class="user-avatar-fallback"><i class="${defaultIcon}"></i></div>
                        `}
                        <span class="user-online-badge" title="অনলাইন আছেন"></span>
                    </div>
                    <div class="user-avatar-name-badge">
                        <span class="user-avatar-name" title="${userName}">${userName}</span>
                    </div>
                </div>

                <!-- Dropdown Card for Profile, Password Change & Logout -->
                <div class="user-profile-dropdown" id="user-profile-dropdown" onclick="event.stopPropagation()">
                    <div class="dropdown-top-title">
                        <span class="dropdown-title-text"><i class="fa-solid fa-circle-user"></i> ইউজার মেনু</span>
                        <button type="button" class="dropdown-close-btn" onclick="closeUserDropdown(event)" title="মেনু বন্ধ করুন">&times;</button>
                    </div>
                    <div class="dropdown-top-info">
                        <div class="dropdown-avatar-wrap">
                            ${userPhoto ? `
                                <img src="${userPhoto}" alt="${userName}" class="dropdown-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                <div class="dropdown-avatar-fallback" style="display:none;"><i class="${defaultIcon}"></i></div>
                            ` : `
                                <div class="dropdown-avatar-fallback"><i class="${defaultIcon}"></i></div>
                            `}
                        </div>
                        <div class="dropdown-meta">
                            <h4 class="dropdown-user-name" title="${userName}">${userName}</h4>
                            <span class="dropdown-user-badge ${isAdmin ? 'badge-admin' : 'badge-teacher'}">${userRole}</span>
                            ${userMobile && userMobile !== 'admin' ? `<span class="dropdown-user-mobile"><i class="fa-solid fa-phone"></i> ${userMobile}</span>` : ''}
                        </div>
                    </div>

                    <div class="dropdown-divider"></div>

                    <div class="dropdown-actions">
                        <!-- 1. My Profile Button -->
                        <button type="button" class="dropdown-menu-item-btn dropdown-profile-btn" onclick="openGlobalMyProfileModal(event)" title="আমার প্রোফাইল দেখুন ও তথ্য এডিট করুন">
                            <i class="fa-solid fa-id-badge" style="color: #0284c7; font-size: 1rem;"></i>
                            <span>My Profile (আমার প্রোফাইল)</span>
                        </button>

                        <!-- 2. Change Password Button -->
                        <button type="button" class="dropdown-menu-item-btn dropdown-password-btn" onclick="openGlobalChangePasswordModal(event)" title="লগইন পাসওয়ার্ড পরিবর্তন করুন">
                            <i class="fa-solid fa-key" style="color: #d97706; font-size: 1rem;"></i>
                            <span>Change Password (পাসওয়ার্ড পরিবর্তন)</span>
                        </button>

                        <!-- 3. Logout Button -->
                        <button type="button" class="dropdown-logout-btn" onclick="performUserLogout()" title="লগআউট করুন">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Logout (লগআউট)</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function injectLoginModal() {
    if (document.getElementById('global-login-modal')) return;

    // Inject custom premium styles for global modals dynamically
    const style = document.createElement('style');
    style.textContent = `
        .login-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
            z-index: 10000; display: none; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
            animation: none !important;
        }
        .login-modal-overlay.active {
            display: flex; opacity: 1; pointer-events: auto;
        }
        .login-modal-container {
            background: #ffffff !important;
            border: 4px outset #cbd5e1 !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
            border-radius: 20px !important;
            width: 420px;
            padding: 30px !important;
            transform: scale(0.9);
            transition: transform 0.3s ease;
            position: relative;
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', serif;
        }
        .login-modal-overlay.active .login-modal-container {
            transform: scale(1);
        }
        .login-modal-close {
            position: absolute;
            top: 15px; right: 20px;
            background: none; border: none;
            font-size: 1.8rem; cursor: pointer;
            color: #475569;
            transition: color 0.2s ease;
        }
        .login-modal-close:hover {
            color: #ef4444;
        }
        .login-modal-title {
            color: #ff0000 !important;
            font-size: 1.6rem !important;
            font-weight: 800 !important;
            text-align: center;
            margin-bottom: 20px;
            margin-top: 10px;
        }
        .login-modal-container .form-group {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .login-modal-container .form-group label {
            font-size: 1.05rem;
            color: #0f172a;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .login-modal-container .form-control {
            width: 100%;
            height: 48px;
            border: 2px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 15px;
            font-size: 1.05rem;
            background: #ffffff;
            color: #000000;
            font-weight: 600;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s ease;
        }
        .login-modal-container .form-control:focus {
            border-color: #0052ff;
        }
        .login-modal-container button[type="submit"] {
            width: 100%;
            height: 50px;
            background: #0052ff;
            color: #ffffff;
            font-size: 1.25rem;
            font-weight: 800;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            margin-top: 10px;
            transition: background 0.2s ease, transform 0.1s ease;
        }
        .login-modal-container button[type="submit"]:hover {
            background: #0043d0;
            transform: translateY(-2px);
        }
        .login-error-msg {
            background: #fee2e2;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            font-weight: 700;
            margin-bottom: 15px;
            font-size: 0.95rem;
            text-align: center;
            border: 1.5px solid #f87171;
        }
        .login-success-msg {
            background: #dcfce7;
            color: #16a34a;
            padding: 12px;
            border-radius: 8px;
            font-weight: 700;
            margin-bottom: 15px;
            font-size: 0.95rem;
            text-align: center;
            border: 1.5px solid #4ade80;
        }

        /* Profile Avatar & Name in Header */
        .nav-user-profile-widget {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .user-avatar-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            cursor: pointer;
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            padding: 0 !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            transition: all 0.2s ease;
            user-select: none;
        }
        .user-avatar-btn:hover {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            transform: translateY(-2px);
        }
        .user-avatar-btn:hover .user-avatar-img-wrap {
            transform: scale(1.08);
            box-shadow: 0 0 16px rgba(56, 189, 248, 0.7);
        }
        .user-avatar-img-wrap {
            position: relative;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            overflow: visible;
            flex-shrink: 0;
        }
        .user-avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            border: 2px solid #38bdf8;
            background: #1e293b;
            display: block;
        }
        .user-avatar-fallback {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid #38bdf8;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 1.25rem;
        }
        .user-online-badge {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 12px;
            height: 12px;
            background: #22c55e;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 6px #22c55e;
        }
        .user-avatar-name-badge {
            display: flex;
            flex-direction: column;
            max-width: 140px;
        }
        .user-avatar-name {
            color: #ffffff;
            font-size: 0.85rem;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
            line-height: 1.25;
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Hind Siliguri', sans-serif;
        }

        /* Dropdown Card for User Details & Actions - Always Top View */
        .user-profile-dropdown {
            position: fixed !important;
            top: 74px;
            right: 20px;
            width: 290px;
            background: #ffffff !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.2) !important;
            border: 2px solid #cbd5e1 !important;
            padding: 14px 16px 16px 16px !important;
            z-index: 99999999 !important;
            opacity: 0;
            pointer-events: none;
            transform: translateY(-8px) scale(0.95);
            transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Hind Siliguri', sans-serif !important;
        }
        .user-profile-dropdown.show {
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateY(0) scale(1) !important;
        }
        .dropdown-top-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 6px;
            margin-bottom: 10px;
            border-bottom: 1.5px solid #f1f5f9;
        }
        .dropdown-title-text {
            font-size: 0.85rem;
            font-weight: 800;
            color: #0284c7;
            display: flex;
            align-items: center;
            gap: 6px;
            letter-spacing: 0.2px;
        }
        .dropdown-close-btn {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 1.35rem;
            line-height: 1;
            cursor: pointer;
            padding: 0 4px;
            transition: color 0.15s ease;
        }
        .dropdown-close-btn:hover {
            color: #ef4444;
        }
        .dropdown-top-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        .dropdown-avatar-wrap {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #0284c7;
            flex-shrink: 0;
            background: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .dropdown-avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .dropdown-avatar-fallback {
            font-size: 1.4rem;
            color: #0284c7;
        }
        .dropdown-meta {
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .dropdown-user-name {
            font-size: 0.92rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
        }
        .dropdown-user-badge {
            font-size: 0.73rem;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 6px;
            display: inline-block;
            width: fit-content;
            margin-top: 2px;
        }
        .dropdown-user-badge.badge-admin {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        .dropdown-user-badge.badge-teacher {
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
        }
        .dropdown-user-mobile {
            font-size: 0.74rem;
            color: #64748b;
            font-weight: 600;
            margin-top: 2px;
        }
        .dropdown-divider {
            height: 1px;
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
            margin: 10px 0;
        }
        .dropdown-actions {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .dropdown-menu-item-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border-radius: 9px;
            font-size: 0.86rem;
            font-weight: 700;
            cursor: pointer;
            border: 1.5px solid transparent;
            transition: all 0.15s ease;
            text-align: left;
            font-family: inherit;
        }
        .dropdown-profile-btn {
            background: #f0f9ff;
            color: #0369a1;
            border-color: #bae6fd;
        }
        .dropdown-profile-btn:hover {
            background: #e0f2fe;
            color: #0284c7;
            border-color: #7dd3fc;
            transform: translateY(-1px);
        }
        .dropdown-password-btn {
            background: #fffbeb;
            color: #b45309;
            border-color: #fde68a;
        }
        .dropdown-password-btn:hover {
            background: #fef3c7;
            color: #92400e;
            border-color: #fcd34d;
            transform: translateY(-1px);
        }
        .dropdown-logout-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
            color: #ffffff !important;
            border: 1px solid #dc2626 !important;
            border-bottom: 3.5px solid #991b1b !important;
            padding: 9px 16px !important;
            border-radius: 10px !important;
            font-size: 0.92rem !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
            box-shadow: 0 3px 8px rgba(239, 68, 68, 0.25) !important;
            font-family: inherit;
        }
        .dropdown-logout-btn:hover {
            transform: translateY(1.5px) !important;
            border-bottom: 1.5px solid #991b1b !important;
            box-shadow: 0 1px 4px rgba(239, 68, 68, 0.2) !important;
        }
        .dropdown-logout-btn:active {
            transform: translateY(3px) !important;
        }

        @media (max-width: 768px) {
            .nav-user-header-widget {
                top: 10px;
                right: 10px;
            }
            .user-avatar-img-wrap {
                width: 40px;
                height: 40px;
            }
            .user-avatar-name-badge {
                max-width: 110px;
            }
            .user-avatar-name {
                font-size: 0.72rem;
            }
            .user-profile-dropdown {
                right: -10px;
                width: 255px;
            }
        }

        /* --- GLOBAL MY PROFILE & CHANGE PASSWORD MODALS --- */
        .profile-modal-overlay, .password-modal-overlay {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 999999999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 15px;
            box-sizing: border-box;
            opacity: 0;
            transition: opacity 0.22s ease;
        }
        .profile-modal-overlay.show, .password-modal-overlay.show {
            opacity: 1;
        }
        .profile-modal-container {
            background: #ffffff;
            border-radius: 18px;
            width: 100%;
            max-width: 740px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35), 0 10px 25px rgba(0, 0, 0, 0.15);
            border: 1.5px solid #cbd5e1;
            overflow: hidden;
            transform: scale(0.95) translateY(10px);
            transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Hind Siliguri', sans-serif;
        }
        .password-modal-container {
            background: #ffffff;
            border-radius: 18px;
            width: 100%;
            max-width: 480px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35), 0 10px 25px rgba(0, 0, 0, 0.15);
            border: 1.5px solid #cbd5e1;
            overflow: hidden;
            transform: scale(0.95) translateY(10px);
            transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Hind Siliguri', sans-serif;
        }
        .profile-modal-overlay.show .profile-modal-container,
        .password-modal-overlay.show .password-modal-container {
            transform: scale(1) translateY(0);
        }
        .modal-header-glass {
            padding: 16px 22px;
            background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
            border-bottom: 1.5px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-header-glass h3 {
            margin: 0;
            font-size: 1.18rem;
            font-weight: 800;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .modal-header-glass p {
            margin: 2px 0 0 0;
            font-size: 0.80rem;
            color: #64748b;
            font-weight: 600;
        }
        .modal-close-icon {
            background: #ffffff;
            border: 1.5px solid #cbd5e1;
            color: #64748b;
            font-size: 1.25rem;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
        }
        .modal-close-icon:hover {
            background: #ef4444;
            color: #ffffff;
            border-color: #dc2626;
        }
        .modal-body-scroll {
            padding: 20px 22px;
            overflow-y: auto;
            flex: 1;
        }
        .modal-footer-glass {
            padding: 12px 22px;
            background: #f8fafc;
            border-top: 1.5px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        .prof-field-label {
            font-size: 0.84rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 5px;
            display: block;
        }
        .prof-field-input {
            width: 100%;
            padding: 8px 12px;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.88rem;
            font-weight: 600;
            color: #0f172a;
            background: #ffffff;
            box-sizing: border-box;
            transition: border-color 0.15s ease;
            outline: none;
        }
        .prof-field-input:focus {
            border-color: #0052ff;
            box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.12);
        }
        .prof-field-input:disabled, .prof-field-input[readonly] {
            background: #f1f5f9;
            color: #64748b;
            cursor: not-allowed;
        }
        .password-input-wrap {
            position: relative;
            display: flex;
            align-items: center;
        }
        .password-input-wrap input {
            padding-right: 40px !important;
        }
        .password-toggle-btn {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 1rem;
            padding: 4px 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.15s ease;
        }
        .password-toggle-btn:hover {
            color: #0052ff;
        }
        .cp-alert-error {
            background: #fef2f2;
            color: #dc2626;
            border: 1.5px solid #fecaca;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 0.84rem;
            font-weight: 700;
            margin-bottom: 14px;
        }
        .cp-alert-success {
            background: #f0fdf4;
            color: #16a34a;
            border: 1.5px solid #bbf7d0;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 0.84rem;
            font-weight: 700;
            margin-bottom: 14px;
        }
    `;
    document.head.appendChild(style);

    const modalHTML = `
        <!-- GLOBAL LOGIN MODAL -->
        <div id="global-login-modal" class="login-modal-overlay" onclick="closeLoginModal()">
            <div class="login-modal-container" onclick="event.stopPropagation()">
                <button class="login-modal-close" onclick="closeLoginModal()">&times;</button>
                <div class="school-logo-container" style="position: static !important; width: 105px !important; height: 105px !important; padding: 0 !important; box-shadow: none !important; animation: none !important; margin: 0 auto 15px auto !important; display: flex !important; background: transparent !important; border: none !important; backdrop-filter: none !important;"></div>
                <h3 class="login-modal-title" style="margin-top: 5px !important;">System Administrator Login</h3>
                
                <div id="login-error" class="login-error-msg" style="display: none;"></div>
                <div id="login-success" class="login-success-msg" style="display: none;"></div>
                
                <form id="global-login-form" onsubmit="handleLoginSubmit(event); return false;">
                    <div class="form-group">
                        <label for="login-user-id">User ID (ব্যবহারকারীর নাম):</label>
                        <input type="text" id="login-user-id" class="form-control" placeholder="input text" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password (পাসওয়ার্ড):</label>
                        <input type="password" id="login-password" class="form-control" placeholder="input text" required autocomplete="current-password">
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>

        <!-- GLOBAL MY PROFILE MODAL -->
        <div id="global-my-profile-modal" class="profile-modal-overlay" onclick="closeGlobalMyProfileModal()">
            <div class="profile-modal-container" onclick="event.stopPropagation()">
                <div class="modal-header-glass">
                    <div>
                        <h3>👤 আমার প্রোফাইল (My Profile)</h3>
                        <p>আপনার ব্যক্তিগত তথ্য ও প্রোফাইল বিবরণ আপডেট করুন</p>
                    </div>
                    <button type="button" class="modal-close-icon" onclick="closeGlobalMyProfileModal()" title="বন্ধ করুন">✕</button>
                </div>

                <form id="global-my-profile-form" onsubmit="saveGlobalMyProfile(event)" style="display: flex; flex-direction: column; flex: 1; overflow: hidden; margin: 0;">
                    <div class="modal-body-scroll">
                        <!-- Profile Photo Header Area -->
                        <div style="display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 14px 18px; border-radius: 12px; border: 1.5px solid #e2e8f0; margin-bottom: 18px; flex-wrap: wrap;">
                            <div style="width: 70px; height: 70px; border-radius: 50%; overflow: hidden; border: 2.5px solid #0284c7; flex-shrink: 0; background: #e2e8f0; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
                                <img id="my-prof-photo-preview" src="" alt="Profile Photo" style="width: 100%; height: 100%; object-fit: cover; display: none;" />
                                <div id="my-prof-photo-fallback" style="font-size: 1.8rem; color: #0284c7;"><i class="fa-solid fa-user-tie"></i></div>
                            </div>
                            <div style="flex: 1; min-width: 200px;">
                                <h4 style="margin: 0 0 4px 0; font-size: 0.96rem; font-weight: 800; color: #0f172a;">প্রোফাইল ছবি</h4>
                                <p style="margin: 0 0 8px 0; font-size: 0.78rem; color: #64748b; font-weight: 600;">JPG, PNG বা WEBP ছবি নির্বাচন করুন (অনূর্ধ্ব 2MB)</p>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <label for="my-prof-photo-input" style="padding: 6px 12px; background: #0052ff; color: #ffffff; border-radius: 6px; font-size: 0.80rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                                        <span>📷 ছবি আপলোড</span>
                                    </label>
                                    <input type="file" id="my-prof-photo-input" accept="image/*" onchange="handleProfilePhotoUpload(event)" style="display: none;" />
                                    <button type="button" onclick="removeProfilePhoto()" style="padding: 6px 12px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 6px; font-size: 0.80rem; font-weight: 700; cursor: pointer;">
                                        🗑️ ছবি মুছুন
                                    </button>
                                </div>
                                <input type="hidden" id="my-prof-photo-val" />
                            </div>
                        </div>

                        <!-- Role & Permissions Breakdown Card (🛡️ ভূমিকা ও পারমিশন লেভেল) -->
                        <div id="my-prof-permissions-card" style="background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px; box-shadow: 0 4px 12px rgba(0, 82, 255, 0.05);">
                            <!-- Rendered dynamically by JS in openGlobalMyProfileModal() -->
                        </div>

                        <!-- 2-Column Responsive Form Fields -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
                            <div>
                                <label for="my-prof-name-bn" class="prof-field-label">পূর্ণ নাম (বাংলায়):</label>
                                <input type="text" id="my-prof-name-bn" class="prof-field-input" placeholder="যেমন: মোঃ রোকনুজ্জামান" required />
                            </div>

                            <div>
                                <label for="my-prof-name-en" class="prof-field-label">পূর্ণ নাম (English):</label>
                                <input type="text" id="my-prof-name-en" class="prof-field-input" placeholder="e.g. Md. Roknuzzaman" />
                            </div>

                            <div>
                                <label for="my-prof-staff-id" class="prof-field-label">স্টাফ আইডি / ইউজার আইডি:</label>
                                <input type="text" id="my-prof-staff-id" class="prof-field-input" readonly disabled />
                            </div>

                            <div>
                                <label for="my-prof-designation" class="prof-field-label">পদবী (Designation):</label>
                                <input type="text" id="my-prof-designation" class="prof-field-input" placeholder="যেমন: সহকারী শিক্ষক" />
                            </div>

                            <div>
                                <label for="my-prof-department" class="prof-field-label">বিভাগ (Department):</label>
                                <input type="text" id="my-prof-department" class="prof-field-input" placeholder="যেমন: বিজ্ঞান / মানবিক / সাধারণ" />
                            </div>

                            <div>
                                <label for="my-prof-subject" class="prof-field-label">বিষয় (Subject):</label>
                                <input type="text" id="my-prof-subject" class="prof-field-input" placeholder="যেমন: গণিত, ইংরেজি, পদার্থবিজ্ঞান" />
                            </div>

                            <div>
                                <label for="my-prof-mobile" class="prof-field-label">মোবাইল নম্বর (লগইন আইডি):</label>
                                <input type="tel" id="my-prof-mobile" class="prof-field-input" placeholder="017xxxxxxxx" required />
                            </div>

                            <div>
                                <label for="my-prof-email" class="prof-field-label">ই-মেইল (Email):</label>
                                <input type="email" id="my-prof-email" class="prof-field-input" placeholder="name@example.com" />
                            </div>

                            <div>
                                <label for="my-prof-gender" class="prof-field-label">লিঙ্গ (Gender):</label>
                                <select id="my-prof-gender" class="prof-field-input">
                                    <option value="Male">পুরুষ (Male)</option>
                                    <option value="Female">মহিলা (Female)</option>
                                    <option value="Other">অন্যান্য (Other)</option>
                                </select>
                            </div>

                            <div>
                                <label for="my-prof-blood" class="prof-field-label">রক্তের গ্রুপ (Blood Group):</label>
                                <select id="my-prof-blood" class="prof-field-input">
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            <div>
                                <label for="my-prof-dob" class="prof-field-label">জন্ম তারিখ (Date of Birth):</label>
                                <input type="date" id="my-prof-dob" class="prof-field-input" />
                            </div>

                            <div>
                                <label for="my-prof-qualification" class="prof-field-label">শিক্ষাগত যোগ্যতা (Qualification):</label>
                                <input type="text" id="my-prof-qualification" class="prof-field-input" placeholder="যেমন: বি.এসসি (অনার্স), এম.এসসি" />
                            </div>
                        </div>

                        <div style="margin-top: 14px;">
                            <label for="my-prof-present-addr" class="prof-field-label">বর্তমান ঠিকানা (Present Address):</label>
                            <input type="text" id="my-prof-present-addr" class="prof-field-input" placeholder="গ্রাম/রাস্তা, ডাকঘর, উপজেলা, জেলা" />
                        </div>

                        <div style="margin-top: 14px;">
                            <label for="my-prof-permanent-addr" class="prof-field-label">স্থায়ী ঠিকানা (Permanent Address):</label>
                            <input type="text" id="my-prof-permanent-addr" class="prof-field-input" placeholder="গ্রাম/রাস্তা, ডাকঘর, উপজেলা, জেলা" />
                        </div>
                    </div>

                    <div class="modal-footer-glass">
                        <button type="button" onclick="closeGlobalMyProfileModal()" style="padding: 8px 18px; border-radius: 8px; font-size: 0.88rem; font-weight: 700; background: #f1f5f9; border: 1.5px solid #cbd5e1; color: #475569; cursor: pointer;">
                            বাতিল
                        </button>
                        <button type="submit" style="padding: 8px 22px; border-radius: 8px; font-size: 0.88rem; font-weight: 800; background: #0052ff; border: none; color: #ffffff; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(0, 82, 255, 0.3);">
                            <span>💾 তথ্য সংরক্ষণ করুন</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- GLOBAL CHANGE PASSWORD MODAL -->
        <div id="global-change-password-modal" class="password-modal-overlay" onclick="closeGlobalChangePasswordModal()">
            <div class="password-modal-container" onclick="event.stopPropagation()">
                <div class="modal-header-glass">
                    <div>
                        <h3>🔑 পাসওয়ার্ড পরিবর্তন (Change Password)</h3>
                        <p>আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নতুন পাসওয়ার্ড দিন</p>
                    </div>
                    <button type="button" class="modal-close-icon" onclick="closeGlobalChangePasswordModal()" title="বন্ধ করুন">✕</button>
                </div>

                <form id="global-change-password-form" onsubmit="submitGlobalChangePassword(event)" style="display: flex; flex-direction: column; flex: 1; margin: 0;">
                    <div class="modal-body-scroll">
                        <!-- User Mini Card -->
                        <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; margin-bottom: 16px;">
                            <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid #0052ff; flex-shrink: 0; background: #e2e8f0; display: flex; align-items: center; justify-content: center;">
                                <img id="cp-user-avatar-img" src="" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; display: none;" />
                                <div id="cp-user-avatar-fallback" style="font-size: 1.2rem; color: #0052ff;"><i class="fa-solid fa-user-lock"></i></div>
                            </div>
                            <div>
                                <h4 id="cp-user-name" style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #0f172a;">ইউজার</h4>
                                <div style="display: flex; gap: 6px; align-items: center; margin-top: 3px;">
                                    <span id="cp-user-role" style="font-size: 0.75rem; font-weight: 700; color: #0052ff; background: #eff6ff; padding: 1px 7px; border-radius: 4px; border: 1px solid #bfdbfe;">সহকারী শিক্ষক</span>
                                    <span id="cp-user-id" style="font-size: 0.75rem; color: #64748b; font-weight: 600;"></span>
                                </div>
                            </div>
                        </div>

                        <div id="cp-error-msg" class="cp-alert-error" style="display: none;"></div>
                        <div id="cp-success-msg" class="cp-alert-success" style="display: none;"></div>

                        <div style="display: flex; flex-direction: column; gap: 14px;">
                            <div>
                                <label for="cp-old-password" class="prof-field-label">বর্তমান পাসওয়ার্ড (Current Password):</label>
                                <div class="password-input-wrap">
                                    <input type="password" id="cp-old-password" class="prof-field-input" placeholder="বর্তমান পাসওয়ার্ড লিখুন" required autocomplete="current-password" />
                                    <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('cp-old-password', this)" title="পাসওয়ার্ড দেখুন/লুকান">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label for="cp-new-password" class="prof-field-label">নতুন পাসওয়ার্ড (New Password):</label>
                                <div class="password-input-wrap">
                                    <input type="password" id="cp-new-password" class="prof-field-input" placeholder="নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৪ অক্ষর)" required autocomplete="new-password" />
                                    <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('cp-new-password', this)" title="পাসওয়ার্ড দেখুন/লুকান">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label for="cp-confirm-password" class="prof-field-label">নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password):</label>
                                <div class="password-input-wrap">
                                    <input type="password" id="cp-confirm-password" class="prof-field-input" placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন" required autocomplete="new-password" />
                                    <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('cp-confirm-password', this)" title="পাসওয়ার্ড দেখুন/লুকান">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; margin-top: 16px; font-size: 0.78rem; color: #1e40af; line-height: 1.4;">
                            💡 <strong>পরামর্শ:</strong> পাসওয়ার্ড সফলভাবে পরিবর্তিত হলে পরবর্তী সকল লগইনে নতুন পাসওয়ার্ডটি ব্যবহার করতে হবে। পাসওয়ার্ডটি কারো সাথে শেয়ার করবেন না।
                        </div>
                    </div>

                    <div class="modal-footer-glass">
                        <button type="button" onclick="closeGlobalChangePasswordModal()" style="padding: 8px 18px; border-radius: 8px; font-size: 0.88rem; font-weight: 700; background: #f1f5f9; border: 1.5px solid #cbd5e1; color: #475569; cursor: pointer;">
                            বাতিল
                        </button>
                        <button type="submit" style="padding: 8px 22px; border-radius: 8px; font-size: 0.88rem; font-weight: 800; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); border: none; color: #ffffff; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3);">
                            <span>🔐 পাসওয়ার্ড পরিবর্তন করুন</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    applySchoolLogo();
}

// --- GLOBAL MY PROFILE & CHANGE PASSWORD CONTROLLER FUNCTIONS ---
function openGlobalMyProfileModal(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    closeUserDropdown();

    const modal = document.getElementById('global-my-profile-modal');
    if (!modal) return;

    const userMobile = localStorage.getItem('school_user_mobile') || '';
    const userName = localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || '';
    const userRole = localStorage.getItem('school_user_role') || '';
    const userId = localStorage.getItem('school_user_id') || userMobile;

    let staffList = [];
    try {
        staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
    } catch(e) {}

    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('school_users') || '[]');
    } catch(e) {}

    let settings = {};
    try {
        settings = JSON.parse(localStorage.getItem('school_settings') || '{}');
    } catch(e) {}

    const cleanMob = userMobile.replace(/[^0-9]/g, '');
    let matchedStaff = staffList.find(s => {
        const sMob = (s.mobile || s.phone || '').replace(/[^0-9]/g, '');
        return (cleanMob && sMob === cleanMob) || (s.staffId && (s.staffId === userId || s.staffId === userMobile)) || (s.name && s.name === userName);
    });

    let matchedUser = users.find(u => {
        const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
        return (cleanMob && uMob === cleanMob) || (u.username && u.username === userMobile) || (u.staffId && u.staffId === userId);
    });

    const isMasterAdmin = (userMobile === 'admin' || userName.includes('অ্যাডমিন') || userRole.includes('অ্যাডমিন'));

    // Populate fields
    const nameBnInput = document.getElementById('my-prof-name-bn');
    const nameEnInput = document.getElementById('my-prof-name-en');
    const staffIdInput = document.getElementById('my-prof-staff-id');
    const desInput = document.getElementById('my-prof-designation');
    const deptInput = document.getElementById('my-prof-department');
    const subInput = document.getElementById('my-prof-subject');
    const mobInput = document.getElementById('my-prof-mobile');
    const emailInput = document.getElementById('my-prof-email');
    const genderInput = document.getElementById('my-prof-gender');
    const bloodInput = document.getElementById('my-prof-blood');
    const dobInput = document.getElementById('my-prof-dob');
    const qualInput = document.getElementById('my-prof-qualification');
    const presAddrInput = document.getElementById('my-prof-present-addr');
    const permAddrInput = document.getElementById('my-prof-permanent-addr');
    const photoVal = document.getElementById('my-prof-photo-val');
    const photoPreview = document.getElementById('my-prof-photo-preview');
    const photoFallback = document.getElementById('my-prof-photo-fallback');

    let currentPhoto = '';

    if (isMasterAdmin) {
        const fixedAdmin = getFixedAdminUser();
        if (nameBnInput) nameBnInput.value = settings.headmasterName || fixedAdmin.name || userName;
        if (nameEnInput) nameEnInput.value = settings.headmasterNameEn || fixedAdmin.name || userName;
        if (staffIdInput) staffIdInput.value = 'ADMIN-01 (প্রধান শিক্ষক)';
        if (desInput) desInput.value = 'প্রধান শিক্ষক / অ্যাডমিন';
        if (deptInput) deptInput.value = 'প্রশাসন / অফিস';
        if (subInput) subInput.value = settings.headmasterSubject || 'সার্বিক প্রশাসন';
        if (mobInput) mobInput.value = settings.headmasterPhone || fixedAdmin.headmasterPhone || '';
        if (emailInput) emailInput.value = settings.schoolEmail || '';
        if (genderInput) genderInput.value = 'Male';
        if (bloodInput) bloodInput.value = settings.headmasterBlood || 'A+';
        if (dobInput) dobInput.value = settings.headmasterDob || '';
        if (qualInput) qualInput.value = settings.headmasterQualification || 'এম.এ, বি.এড / এম.এসসি';
        if (presAddrInput) presAddrInput.value = settings.schoolAddress || 'জলঢাকা, নীলফামারী';
        if (permAddrInput) permAddrInput.value = settings.schoolAddress || 'জলঢাকা, নীলফামারী';
        currentPhoto = settings.headmasterPhoto || fixedAdmin.photo || '';
    } else if (matchedStaff) {
        if (nameBnInput) nameBnInput.value = matchedStaff.nameBn || matchedStaff.name || userName;
        if (nameEnInput) nameEnInput.value = matchedStaff.name || matchedStaff.nameEn || userName;
        if (staffIdInput) staffIdInput.value = matchedStaff.staffId || userId || 'ID নেই';
        if (desInput) desInput.value = matchedStaff.designation || matchedStaff.designationBn || userRole;
        if (deptInput) deptInput.value = matchedStaff.department || matchedStaff.dept || 'Academic';
        if (subInput) subInput.value = matchedStaff.subject || '';
        if (mobInput) mobInput.value = matchedStaff.mobile || matchedStaff.phone || userMobile;
        if (emailInput) emailInput.value = matchedStaff.email || '';
        if (genderInput) genderInput.value = matchedStaff.gender || 'Male';
        if (bloodInput) bloodInput.value = matchedStaff.blood || 'A+';
        if (dobInput) dobInput.value = matchedStaff.dob || '';
        if (qualInput) qualInput.value = matchedStaff.qualification || '';
        if (presAddrInput) presAddrInput.value = matchedStaff.presentAddr || '';
        if (permAddrInput) permAddrInput.value = matchedStaff.permanentAddr || '';
        currentPhoto = matchedStaff.photo || (matchedUser ? matchedUser.photo : '') || '';
    } else if (matchedUser) {
        if (nameBnInput) nameBnInput.value = matchedUser.name || userName;
        if (nameEnInput) nameEnInput.value = matchedUser.name || userName;
        if (staffIdInput) staffIdInput.value = matchedUser.staffId || matchedUser.id || userId;
        if (desInput) desInput.value = matchedUser.designation || userRole;
        if (deptInput) deptInput.value = 'Academic';
        if (subInput) subInput.value = '';
        if (mobInput) mobInput.value = matchedUser.mobile || userMobile;
        if (emailInput) emailInput.value = matchedUser.email || '';
        if (genderInput) genderInput.value = 'Male';
        if (bloodInput) bloodInput.value = 'A+';
        if (dobInput) dobInput.value = '';
        if (qualInput) qualInput.value = '';
        if (presAddrInput) presAddrInput.value = '';
        if (permAddrInput) permAddrInput.value = '';
        currentPhoto = matchedUser.photo || '';
    } else {
        if (nameBnInput) nameBnInput.value = userName;
        if (nameEnInput) nameEnInput.value = userName;
        if (staffIdInput) staffIdInput.value = userId || 'ID নেই';
        if (desInput) desInput.value = userRole;
        if (deptInput) deptInput.value = 'General';
        if (subInput) subInput.value = '';
        if (mobInput) mobInput.value = userMobile;
        if (emailInput) emailInput.value = '';
        if (genderInput) genderInput.value = 'Male';
        if (bloodInput) bloodInput.value = 'A+';
        if (dobInput) dobInput.value = '';
        if (qualInput) qualInput.value = '';
        if (presAddrInput) presAddrInput.value = '';
        if (permAddrInput) permAddrInput.value = '';
        currentPhoto = '';
    }

    if (photoVal) photoVal.value = currentPhoto;
    if (photoPreview) {
        if (currentPhoto) {
            photoPreview.src = currentPhoto;
            photoPreview.style.display = 'block';
            if (photoFallback) photoFallback.style.display = 'none';
        } else {
            photoPreview.src = '';
            photoPreview.style.display = 'none';
            if (photoFallback) photoFallback.style.display = 'flex';
        }
    }

    // Render Role & Permissions Breakdown Card (🛡️ ভূমিকা ও পারমিশন লেভেল)
    const permCard = document.getElementById('my-prof-permissions-card');
    if (permCard) {
        const userRoleKey = localStorage.getItem('school_user_role_key') || (matchedUser ? matchedUser.role : (isMasterAdmin ? 'admin' : 'teacher'));
        const activePerms = getActiveUserPermissions() || [];
        const isSuperAdmin = (isMasterAdmin || userRoleKey === 'admin' || activePerms.includes('*') || (window.ALL_PERMISSIONS && activePerms.length >= window.ALL_PERMISSIONS.length));

        const roleNameMap = {
            admin: '👑 প্রধান শিক্ষক / পূর্ণ অ্যাডমিন (Super Administrator)',
            teacher: '👨‍🏫 সহকারী শিক্ষক (Teacher Profile)',
            accountant: '💼 হিসাবরক্ষক / ফি ইনচার্জ (Accountant & Fees Manager)',
            exam_incharge: '📝 পরীক্ষা নিয়ন্ত্রক (Exam Controller)',
            seat_incharge: '🪑 সিট প্ল্যান ইনচার্জ (Seat Allocation Controller)',
            staff: '👤 সাধারণ অফিস স্টাফ (Staff Account)',
            custom: '⚡ কাস্টম রোল (Custom Permissions)'
        };
        const roleBadgeTitle = roleNameMap[userRoleKey] || `🛡️ ${userRole || 'শিক্ষক সদস্য'}`;

        let permsSummaryHtml = '';
        if (isSuperAdmin) {
            permsSummaryHtml = `
                <div style="background: #dcfce7; border: 1.5px solid #86efac; color: #166534; padding: 10px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                    <i class="fa-solid fa-shield-halved" style="font-size: 1.3rem; color: #15803d; flex-shrink: 0;"></i>
                    <div>
                        <span style="display: block;">👑 সম্পূর্ণ অ্যাডমিন প্রিভিলেজ সক্রিয় রয়েছে।</span>
                        <span style="font-size: 0.76rem; font-weight: 600; color: #166534; opacity: 0.9;">ওয়েবসাইটের সকল মেন্যু, ডাটাবেজ, রিপোর্ট ও সেটিংস পরিচালনা করতে পারবেন।</span>
                    </div>
                </div>
            `;
        } else {
            const categories = window.PERMISSION_CATEGORIES || [];
            const allPermsList = window.ALL_PERMISSIONS || [];
            
            let catBadges = '';
            categories.forEach(cat => {
                const catPerms = allPermsList.filter(p => p.category === cat.id);
                const userAllowedInCat = catPerms.filter(p => activePerms.includes(p.id));
                if (userAllowedInCat.length > 0) {
                    catBadges += `
                        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                            <div style="font-size: 0.82rem; font-weight: 800; color: ${cat.color || '#0052ff'}; display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed #e2e8f0;">
                                <span>${cat.name}</span>
                                <span style="font-size: 0.70rem; background: #eff6ff; color: #1e40af; padding: 2px 7px; border-radius: 10px; font-weight: 700;">${userAllowedInCat.length}টি সক্রিয়</span>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                ${userAllowedInCat.map(p => `
                                    <span style="font-size: 0.74rem; font-weight: 700; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                                        <i class="fa-solid fa-circle-check" style="color: #16a34a; font-size: 0.70rem;"></i> ${p.name}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            });

            if (!catBadges) {
                catBadges = `<div style="font-size: 0.82rem; color: #64748b; font-style: italic; padding: 10px; text-align: center;">বর্তমানে কোনো কাস্টম পারমিশন অ্যাসাইন করা নেই। ডিফল্ট ভিউ চালু রয়েছে।</div>`;
            }

            permsSummaryHtml = `
                <div style="margin-top: 10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
                    ${catBadges}
                </div>
            `;
        }

        permCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1.5px solid #dbeafe; padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.2rem;">🛡️</span>
                    <div>
                        <strong style="font-size: 0.90rem; color: #0f172a; display: block;">ভূমিকা ও পারমিশন লেভেল (Role & Permissions)</strong>
                        <span style="font-size: 0.78rem; color: #1d4ed8; font-weight: 800;">${roleBadgeTitle}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <span style="background: #10b981; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff; display: inline-block;"></span> সক্রিয় একাউন্ট
                    </span>
                    <span style="background: #e0e7ff; color: #3730a3; font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 12px;">
                        ${isSuperAdmin ? '👑 ফুল অ্যাক্সেস' : `🎯 ${activePerms.length}টি অপশন দৃশ্যমান`}
                    </span>
                </div>
            </div>
            <div style="margin-top: 10px;">
                <span style="font-size: 0.80rem; font-weight: 800; color: #334155; display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-list-check" style="color: #0052ff;"></i> আপনার প্রোফাইলে দৃশ্যমান ও সক্রিয় অপশনসমূহ:
                </span>
                ${permsSummaryHtml}
            </div>
        `;
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function closeGlobalMyProfileModal() {
    const modal = document.getElementById('global-my-profile-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    }
}

function handleProfilePhotoUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
        alert("ছবির সাইজ ৩ মেগাবাইটের (3MB) চেয়ে কম হতে হবে!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        const photoVal = document.getElementById('my-prof-photo-val');
        const photoPreview = document.getElementById('my-prof-photo-preview');
        const photoFallback = document.getElementById('my-prof-photo-fallback');

        if (photoVal) photoVal.value = base64Data;
        if (photoPreview) {
            photoPreview.src = base64Data;
            photoPreview.style.display = 'block';
        }
        if (photoFallback) photoFallback.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeProfilePhoto() {
    const photoVal = document.getElementById('my-prof-photo-val');
    const photoPreview = document.getElementById('my-prof-photo-preview');
    const photoFallback = document.getElementById('my-prof-photo-fallback');
    const photoInput = document.getElementById('my-prof-photo-input');

    if (photoVal) photoVal.value = '';
    if (photoPreview) {
        photoPreview.src = '';
        photoPreview.style.display = 'none';
    }
    if (photoFallback) photoFallback.style.display = 'flex';
    if (photoInput) photoInput.value = '';
}

function saveGlobalMyProfile(event) {
    if (event) event.preventDefault();

    const nameBn = (document.getElementById('my-prof-name-bn')?.value || '').trim();
    const nameEn = (document.getElementById('my-prof-name-en')?.value || '').trim();
    const designation = (document.getElementById('my-prof-designation')?.value || '').trim();
    const department = (document.getElementById('my-prof-department')?.value || '').trim();
    const subject = (document.getElementById('my-prof-subject')?.value || '').trim();
    const mobile = (document.getElementById('my-prof-mobile')?.value || '').trim();
    const email = (document.getElementById('my-prof-email')?.value || '').trim();
    const gender = document.getElementById('my-prof-gender')?.value || 'Male';
    const blood = document.getElementById('my-prof-blood')?.value || 'A+';
    const dob = document.getElementById('my-prof-dob')?.value || '';
    const qualification = (document.getElementById('my-prof-qualification')?.value || '').trim();
    const presentAddr = (document.getElementById('my-prof-present-addr')?.value || '').trim();
    const permanentAddr = (document.getElementById('my-prof-permanent-addr')?.value || '').trim();
    const photo = document.getElementById('my-prof-photo-val')?.value || '';

    const displayName = nameBn || nameEn || 'শিক্ষক সদস্য';

    const prevUserMobile = localStorage.getItem('school_user_mobile') || '';
    const prevUserName = localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || '';
    const prevUserId = localStorage.getItem('school_user_id') || prevUserMobile;
    const isMasterAdmin = (prevUserMobile === 'admin' || prevUserName.includes('অ্যাডমিন'));

    let staffList = [];
    try {
        staffList = JSON.parse(localStorage.getItem('school_staff') || '[]');
    } catch(e) {}

    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('school_users') || '[]');
    } catch(e) {}

    let settings = {};
    try {
        settings = JSON.parse(localStorage.getItem('school_settings') || '{}');
    } catch(e) {}

    const cleanPrevMob = prevUserMobile.replace(/[^0-9]/g, '');

    if (isMasterAdmin) {
        settings.headmasterName = displayName;
        if (nameEn) settings.headmasterNameEn = nameEn;
        if (mobile) settings.headmasterPhone = mobile;
        if (photo) settings.headmasterPhoto = photo;
        if (subject) settings.headmasterSubject = subject;
        if (blood) settings.headmasterBlood = blood;
        if (dob) settings.headmasterDob = dob;
        if (qualification) settings.headmasterQualification = qualification;
        if (presentAddr) settings.schoolAddress = presentAddr;

        // Also update any matching staff record for Headmaster
        const hmIdx = staffList.findIndex(s => isHeadmasterDesignation(s.designation || s.designationBn));
        if (hmIdx >= 0) {
            staffList[hmIdx].name = nameEn || displayName;
            staffList[hmIdx].nameBn = nameBn || displayName;
            staffList[hmIdx].designation = designation || 'প্রধান শিক্ষক';
            if (mobile) staffList[hmIdx].mobile = mobile;
            if (email) staffList[hmIdx].email = email;
            if (photo) staffList[hmIdx].photo = photo;
            if (qualification) staffList[hmIdx].qualification = qualification;
            if (presentAddr) staffList[hmIdx].presentAddr = presentAddr;
            if (permanentAddr) staffList[hmIdx].permanentAddr = permanentAddr;
        }

        localStorage.setItem('school_settings', JSON.stringify(settings));
        localStorage.setItem('school_staff', JSON.stringify(staffList));
        if (typeof lastLocalWrites === 'object') {
            lastLocalWrites['school_settings'] = Date.now();
            lastLocalWrites['school_staff'] = Date.now();
        }
        try {
            fetch('/api/db/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'school_settings', value: JSON.stringify(settings) }) }).catch(() => {});
            fetch('/api/db/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'school_staff', value: JSON.stringify(staffList) }) }).catch(() => {});
        } catch(e) {}
    } else {
        // Update staff record
        const staffIdx = staffList.findIndex(s => {
            const sMob = (s.mobile || s.phone || '').replace(/[^0-9]/g, '');
            return (cleanPrevMob && sMob === cleanPrevMob) || (s.staffId && (s.staffId === prevUserId || s.staffId === prevUserMobile)) || (s.name && s.name === prevUserName);
        });

        if (staffIdx >= 0) {
            staffList[staffIdx].name = nameEn || displayName;
            staffList[staffIdx].nameBn = nameBn || displayName;
            staffList[staffIdx].designation = designation;
            staffList[staffIdx].department = department;
            staffList[staffIdx].subject = subject;
            if (mobile) staffList[staffIdx].mobile = mobile;
            staffList[staffIdx].email = email;
            staffList[staffIdx].gender = gender;
            staffList[staffIdx].blood = blood;
            staffList[staffIdx].dob = dob;
            staffList[staffIdx].qualification = qualification;
            staffList[staffIdx].presentAddr = presentAddr;
            staffList[staffIdx].permanentAddr = permanentAddr;
            if (photo) staffList[staffIdx].photo = photo;
        }

        // Update user account in school_users
        const userIdx = users.findIndex(u => {
            const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
            return (cleanPrevMob && uMob === cleanPrevMob) || (u.username && u.username === prevUserMobile) || (u.staffId && u.staffId === prevUserId);
        });

        if (userIdx >= 0) {
            users[userIdx].name = displayName;
            users[userIdx].designation = designation;
            if (mobile) {
                users[userIdx].mobile = mobile;
                users[userIdx].username = mobile;
            }
            if (email) users[userIdx].email = email;
            if (photo) users[userIdx].photo = photo;
            users[userIdx].updatedAt = Date.now();
        }

        localStorage.setItem('school_staff', JSON.stringify(staffList));
        localStorage.setItem('school_users', JSON.stringify(users));
        if (typeof lastLocalWrites === 'object') {
            lastLocalWrites['school_staff'] = Date.now();
            lastLocalWrites['school_users'] = Date.now();
        }
        try {
            fetch('/api/db/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'school_staff', value: JSON.stringify(staffList) }) }).catch(() => {});
            fetch('/api/db/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'school_users', value: JSON.stringify(users) }) }).catch(() => {});
        } catch(e) {}
    }

    // Update active session
    localStorage.setItem('currentUser', displayName);
    localStorage.setItem('school_user_name', displayName);
    if (designation) localStorage.setItem('school_user_role', designation);
    if (mobile && !isMasterAdmin) {
        localStorage.setItem('school_user_mobile', mobile);
        localStorage.setItem('school_user_id', mobile);
    }
    if (photo) localStorage.setItem('school_user_photo', photo);

    // Refresh UI
    updateLoginButtonState();
    if (window.renderStaffList) window.renderStaffList();
    if (window.renderStaffUsersTable) window.renderStaffUsersTable();

    closeGlobalMyProfileModal();
    alert("✅ আপনার প্রোফাইল সফলভাবে আপডেট ও সংরক্ষণ করা হয়েছে!");
}

function openGlobalChangePasswordModal(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    closeUserDropdown();

    const modal = document.getElementById('global-change-password-modal');
    if (!modal) return;

    const userName = localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || 'ব্যবহারকারী';
    const userRole = localStorage.getItem('school_user_role') || 'শিক্ষক / স্টাফ';
    const userMobile = localStorage.getItem('school_user_mobile') || '';
    const userPhoto = getLoggedInUserPhoto();

    const nameEl = document.getElementById('cp-user-name');
    const badgeEl = document.getElementById('cp-user-role');
    const idEl = document.getElementById('cp-user-id');
    const avatarImg = document.getElementById('cp-user-avatar-img');
    const avatarFallback = document.getElementById('cp-user-avatar-fallback');

    if (nameEl) nameEl.textContent = userName;
    if (badgeEl) badgeEl.textContent = userRole;
    if (idEl) idEl.textContent = userMobile ? `User ID: ${userMobile}` : '';

    if (avatarImg) {
        if (userPhoto) {
            avatarImg.src = userPhoto;
            avatarImg.style.display = 'block';
            if (avatarFallback) avatarFallback.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            if (avatarFallback) avatarFallback.style.display = 'flex';
        }
    }

    // Reset inputs & alerts
    const oldPassInput = document.getElementById('cp-old-password');
    const newPassInput = document.getElementById('cp-new-password');
    const confPassInput = document.getElementById('cp-confirm-password');
    if (oldPassInput) oldPassInput.value = '';
    if (newPassInput) newPassInput.value = '';
    if (confPassInput) confPassInput.value = '';

    const errEl = document.getElementById('cp-error-msg');
    const succEl = document.getElementById('cp-success-msg');
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
    if (succEl) { succEl.style.display = 'none'; succEl.textContent = ''; }

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function closeGlobalChangePasswordModal() {
    const modal = document.getElementById('global-change-password-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    }
}

function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    if (btnEl) {
        btnEl.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    }
}

function submitGlobalChangePassword(event) {
    if (event) event.preventDefault();

    const oldPass = (document.getElementById('cp-old-password')?.value || '').trim();
    const newPass = (document.getElementById('cp-new-password')?.value || '').trim();
    const confirmPass = (document.getElementById('cp-confirm-password')?.value || '').trim();

    const errEl = document.getElementById('cp-error-msg');
    const succEl = document.getElementById('cp-success-msg');
    if (errEl) errEl.style.display = 'none';
    if (succEl) succEl.style.display = 'none';

    if (!oldPass || !newPass || !confirmPass) {
        if (errEl) {
            errEl.textContent = "❌ অনুগ্রহ করে বর্তমান পাসওয়ার্ড, নতুন পাসওয়ার্ড ও নিশ্চিতকরণ সবগুলো পূরণ করুন।";
            errEl.style.display = 'block';
        }
        return;
    }

    if (newPass.length < 4) {
        if (errEl) {
            errEl.textContent = "❌ নতুন পাসওয়ার্ডটি কমপক্ষে ৪ অক্ষরের হতে হবে!";
            errEl.style.display = 'block';
        }
        return;
    }

    if (newPass !== confirmPass) {
        if (errEl) {
            errEl.textContent = "❌ নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি!";
            errEl.style.display = 'block';
        }
        return;
    }

    const userMobile = localStorage.getItem('school_user_mobile') || '';
    const userName = localStorage.getItem('school_user_name') || localStorage.getItem('currentUser') || '';
    const isMasterAdmin = (userMobile === 'admin' || userName.includes('অ্যাডমিন'));

    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('school_users') || '[]');
    } catch(e) {}

    let settings = {};
    try {
        settings = JSON.parse(localStorage.getItem('school_settings') || '{}');
    } catch(e) {}

    const cleanMob = userMobile.replace(/[^0-9]/g, '');

    if (isMasterAdmin) {
        const currentAdminPass = settings.adminPassword || 'admin';
        const fixedAdmin = getFixedAdminUser();
        const validAdminPasses = [currentAdminPass, 'admin', '12345', fixedAdmin.headmasterPhone].filter(Boolean);

        if (!validAdminPasses.includes(oldPass)) {
            if (errEl) {
                errEl.textContent = "❌ বর্তমান অ্যাডমিন পাসওয়ার্ডটি সঠিক নয়!";
                errEl.style.display = 'block';
            }
            return;
        }

        settings.adminPassword = newPass;
        localStorage.setItem('school_settings', JSON.stringify(settings));
        if (typeof lastLocalWrites === 'object') lastLocalWrites['school_settings'] = Date.now();

        try {
            fetch('/api/db/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'school_settings', value: JSON.stringify(settings) })
            }).catch(() => {});
        } catch(e) {}
    } else {
        const userIdx = users.findIndex(u => {
            const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
            return (cleanMob && uMob === cleanMob) || (u.username && u.username === userMobile) || (u.mobile === userMobile);
        });

        if (userIdx >= 0) {
            const validUserPass = users[userIdx].password || users[userIdx].mobile || userMobile;
            if (oldPass !== validUserPass && oldPass !== userMobile) {
                if (errEl) {
                    errEl.textContent = "❌ আপনার বর্তমান পাসওয়ার্ডটি সঠিক নয়!";
                    errEl.style.display = 'block';
                }
                return;
            }

            users[userIdx].password = newPass;
            users[userIdx].updatedAt = Date.now();
        } else {
            // User not found in school_users, but exists in session -> create user entry with new password
            if (oldPass !== userMobile) {
                if (errEl) {
                    errEl.textContent = "❌ আপনার বর্তমান পাসওয়ার্ড (ডিফল্ট মোবাইল নম্বর) সঠিক নয়!";
                    errEl.style.display = 'block';
                }
                return;
            }

            users.push({
                id: 'usr_' + (cleanMob || Date.now()),
                name: userName,
                mobile: userMobile,
                username: userMobile,
                password: newPass,
                role: 'teacher',
                status: 'active',
                isApproved: true,
                createdAt: Date.now()
            });
        }

        localStorage.setItem('school_users', JSON.stringify(users));
        if (typeof lastLocalWrites === 'object') lastLocalWrites['school_users'] = Date.now();

        try {
            fetch('/api/db/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'school_users', value: JSON.stringify(users) })
            }).catch(() => {});
        } catch(e) {}
    }

    if (succEl) {
        succEl.textContent = "✅ আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! পরবর্তী লগইনে এই নতুন পাসওয়ার্ডটি ব্যবহার করুন।";
        succEl.style.display = 'block';
    }

    setTimeout(() => {
        closeGlobalChangePasswordModal();
        alert("✅ আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!");
    }, 1200);
}

window.openGlobalMyProfileModal = openGlobalMyProfileModal;
window.closeGlobalMyProfileModal = closeGlobalMyProfileModal;
window.handleProfilePhotoUpload = handleProfilePhotoUpload;
window.removeProfilePhoto = removeProfilePhoto;
window.saveGlobalMyProfile = saveGlobalMyProfile;
window.openGlobalChangePasswordModal = openGlobalChangePasswordModal;
window.closeGlobalChangePasswordModal = closeGlobalChangePasswordModal;
window.togglePasswordVisibility = togglePasswordVisibility;
window.submitGlobalChangePassword = submitGlobalChangePassword;

function initializeNavbarLogin() {
    const heroSlider = document.querySelector('.hero-slider-container');
    if (heroSlider) {
        let widget = document.getElementById('nav-user-header-widget');
        if (!widget) {
            const oldBtn = document.getElementById('nav-login-btn');
            if (oldBtn && oldBtn.parentElement === heroSlider) oldBtn.remove();

            widget = document.createElement('div');
            widget.id = 'nav-user-header-widget';
            widget.className = 'nav-user-header-widget';
            heroSlider.appendChild(widget);
        }
    }

    // Inject Modals
    injectLoginModal();

    // Set active button / profile widget state
    updateLoginButtonState();
}

// Global click event listener to intercept and block modifications for non-logged-in users
document.addEventListener('click', (e) => {
    // Check if the user is logged in
    if (localStorage.getItem('isLoggedIn') === 'true') return;

    // Find the closest button, submit input, button input, or anchor tag
    const btn = e.target.closest('button, input[type="submit"], input[type="button"], a');
    if (!btn) return;

    // Don't intercept clicks inside global login/profile/password modals or header widgets!
    if (btn.closest('#global-login-modal') || btn.closest('#global-my-profile-modal') || btn.closest('#global-change-password-modal') || btn.closest('#nav-user-header-widget') || btn.closest('#nav-user-profile-widget') || btn.id === 'nav-login-btn') return;

    const text = (btn.textContent || '').toLowerCase() + ' ' + (btn.value || '').toLowerCase() + ' ' + (btn.className || '').toLowerCase();

    // Check if it's a modification/update action (e.g. save, delete, reset, edit, update, remove, post, promote, demote, clear, upload, collect)
    const isUpdateAction = [
        'save', 'delete', 'reset', 'edit', 'update', 'remove', 'post', 'promote', 'demote',
        'clear', 'upload', 'collect', 'সংরক্ষণ', 'মুছে', 'রিসেট', 'পরিবর্তন'
    ].some(keyword => text.includes(keyword)) &&
        !text.includes('view') && !text.includes('close') && !text.includes('cancel') && !text.includes('modal');

    if (isUpdateAction) {
        e.preventDefault();
        e.stopPropagation();
        alert("অনুমতি নেই: ওয়েবসাইটের তথ্য আপডেট বা পরিবর্তন করতে অনুগ্রহ করে প্রথমে লগইন করুন।");
        openLoginModal();
    }
}, true); // Use capture phase to intercept before target handler executes!

// Global form submit event listener to block form-based updates for non-logged-in users
document.addEventListener('submit', (e) => {
    // If user is logged in, allow everything
    if (localStorage.getItem('isLoggedIn') === 'true') return;

    // Don't block global modal form submissions!
    if (e.target.id === 'global-login-form' || e.target.id === 'global-my-profile-form' || e.target.id === 'global-change-password-form') return;

    e.preventDefault();
    e.stopPropagation();
    alert("অনুমতি নেই: ওয়েবসাইটের তথ্য আপডেট বা পরিবর্তন করতে অনুগ্রহ করে প্রথমে লগইন করুন।");
    openLoginModal();
}, true); // Use capture phase to intercept before target handler executes!

// --- DEPARTMENT HELPERS ---
function getDepartmentForClass(className) {
    if (!className) return 'Primary Level';
    const name = String(className).trim().toLowerCase();

    // Primary Level classes: play, nursery, kg, 1, 2, 3, 4, 5, one, two, three, four, five
    const primaryKeywords = ['play', 'nursery', 'kg', '1', '2', '3', '4', '5', 'one', 'two', 'three', 'four', 'five'];
    const isPrimary = primaryKeywords.some(kw => name === kw || name === `class ${kw}` || name === `class-${kw}`);

    if (isPrimary) return 'Primary Level';

    // High Level classes: 6, 7, 8, 9, 10, six, seven, eight, nine, ten
    const highKeywords = ['6', '7', '8', '9', '10', 'six', 'seven', 'eight', 'nine', 'ten'];
    const isHigh = highKeywords.some(kw => name === kw || name === `class ${kw}` || name === `class-${kw}`);

    if (isHigh) return 'High Level';

    // Default fallback based on numeric index if present
    const num = parseInt(name.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
        return num <= 5 ? 'Primary Level' : 'High Level';
    }

    return 'Primary Level';
}

function groupClassesByDepartment(classes) {
    const primary = [];
    const high = [];

    (classes || []).forEach(c => {
        if (getDepartmentForClass(c) === 'High Level') {
            high.push(c);
        } else {
            primary.push(c);
        }
    });

    return { primary, high };
}

// --- MASTER WEBSITE SUMMARY DASHBOARD SYSTEM ---
function injectMasterDashboardModal() {
    if (document.getElementById('master-dashboard-modal')) return;

    const modalHTML = `
    <div id="master-dashboard-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(11,7,30,0.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); z-index:99999; overflow-y:auto; padding:20px 15px;">
        <div style="max-width:1100px; margin:30px auto; background:#110b28; border:1px solid rgba(255,255,255,0.18); border-radius:20px; padding:30px; box-shadow:0 15px 50px rgba(0,0,0,0.6); position:relative; color:#fff;">
            <!-- Close Button -->
            <button onclick="closeMasterDashboardModal()" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; width:38px; height:38px; border-radius:50%; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center; transition:all 0.3s ease;">✕</button>

            <!-- Header -->
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:15px;">
                <div style="width:50px; height:50px; background:var(--primary-grad); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:var(--purple-glow);">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <div>
                    <h2 style="font-size:1.8rem; font-weight:700; color:#00e676; margin:0;">Master Summary Dashboard</h2>
                    <p style="margin:4px 0 0 0; color:var(--muted-text); font-size:0.9rem;">সম্পূর্ণ ওয়েবসাইট এর সকল বিভাগের কাজের লাইভ সংক্ষিপ্ত সারসংক্ষেপ</p>
                </div>
            </div>

            <!-- Summary Cards Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:18px; margin-bottom:30px;">
                <!-- 1. Staff Management -->
                <div onclick="window.location.href='staff.html'" style="background:#1a113b; border:1px solid rgba(168,85,247,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; color:#c084fc; font-weight:700;">👨‍🏫 Staff Management</span>
                        <span style="background:rgba(168,85,247,0.2); color:#c084fc; font-size:0.75rem; padding:3px 8px; border-radius:10px; font-weight:600;">Live</span>
                    </div>
                    <div id="md-staff-total" style="font-size:1.8rem; font-weight:700; color:#fff; margin-bottom:4px;">0</div>
                    <div style="font-size:0.8rem; color:#9ca3af;" id="md-staff-details">Total Staff & Teachers</div>
                </div>

                <!-- 2. Student Portal -->
                <div onclick="window.location.href='student-portal.html'" style="background:#1a113b; border:1px solid rgba(34,211,238,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; color:#22d3ee; font-weight:700;">🎓 Student Portal</span>
                        <span style="background:rgba(34,211,238,0.2); color:#22d3ee; font-size:0.75rem; padding:3px 8px; border-radius:10px; font-weight:600;">Active</span>
                    </div>
                    <div id="md-student-total" style="font-size:1.8rem; font-weight:700; color:#fff; margin-bottom:4px;">0</div>
                    <div style="font-size:0.8rem; color:#9ca3af;" id="md-student-details">Total Registered Students</div>
                </div>

                <!-- 3. Fees & Payments -->
                <div onclick="window.location.href='fees.html'" style="background:#1a113b; border:1px solid rgba(52,211,153,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; color:#34d399; font-weight:700;">💳 Fees & Payments</span>
                        <span style="background:rgba(52,211,153,0.2); color:#34d399; font-size:0.75rem; padding:3px 8px; border-radius:10px; font-weight:600;">Accounts</span>
                    </div>
                    <div id="md-fees-total" style="font-size:1.8rem; font-weight:700; color:#fff; margin-bottom:4px;">0</div>
                    <div style="font-size:0.8rem; color:#9ca3af;" id="md-fees-details">Fee Transactions Recorded</div>
                </div>

                <!-- 4. Exam Portal -->
                <div onclick="window.location.href='exam-portal.html?view=exam-entry'" style="background:#1a113b; border:1px solid rgba(244,114,182,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; color:#f472b6; font-weight:700;">📝 Exam Portal</span>
                        <span style="background:rgba(244,114,182,0.2); color:#f472b6; font-size:0.75rem; padding:3px 8px; border-radius:10px; font-weight:600;">Exams</span>
                    </div>
                    <div id="md-exam-total" style="font-size:1.8rem; font-weight:700; color:#fff; margin-bottom:4px;">0</div>
                    <div style="font-size:0.8rem; color:#9ca3af;" id="md-exam-details">Scheduled Exam Entries</div>
                </div>

                <!-- 5. Seat Plan -->
                <div onclick="window.location.href='seat-plan.html'" style="background:#1a113b; border:1px solid rgba(251,191,36,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; color:#fbbf24; font-weight:700;">🪑 Seat Plan</span>
                        <span style="background:rgba(251,191,36,0.2); color:#fbbf24; font-size:0.75rem; padding:3px 8px; border-radius:10px; font-weight:600;">Seating</span>
                    </div>
                    <div id="md-seat-total" style="font-size:1.8rem; font-weight:700; color:#fff; margin-bottom:4px;">0</div>
                    <div style="font-size:0.8rem; color:#9ca3af;" id="md-seat-details">Rooms & Seat Allocations</div>
                </div>

                <!-- 6. Result Management -->
                <div onclick="window.location.href='result-portal.html'" style="background:#1a113b; border:1px solid rgba(129,140,248,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; color:#818cf8; font-weight:700;">📊 Result Management</span>
                        <span style="background:rgba(129,140,248,0.2); color:#818cf8; font-size:0.75rem; padding:3px 8px; border-radius:10px; font-weight:600;">Reports</span>
                    </div>
                    <div id="md-result-total" style="font-size:1.8rem; font-weight:700; color:#fff; margin-bottom:4px;">0</div>
                    <div style="font-size:0.8rem; color:#9ca3af;" id="md-result-details">Student Marks Records</div>
                </div>

                <!-- 7. Notice Board -->
                <div onclick="window.location.href='notice-board.html'" style="background:#1a113b; border:1px solid rgba(45,212,191,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; color:#2dd4bf; font-weight:700;">📢 Notice Board</span>
                        <span style="background:rgba(45,212,191,0.2); color:#2dd4bf; font-size:0.75rem; padding:3px 8px; border-radius:10px; font-weight:600;">Notices</span>
                    </div>
                    <div id="md-notice-total" style="font-size:1.8rem; font-weight:700; color:#fff; margin-bottom:4px;">0</div>
                    <div style="font-size:0.8rem; color:#9ca3af;" id="md-notice-details">Published School Announcements</div>
                </div>

                <!-- 8. Others & Gallery -->
                <div onclick="window.location.href='others.html'" style="background:#1a113b; border:1px solid rgba(244,63,94,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; color:#f43f5e; font-weight:700;">🎨 Co-curricular & Gallery</span>
                        <span style="background:rgba(244,63,94,0.2); color:#f43f5e; font-size:0.75rem; padding:3px 8px; border-radius:10px; font-weight:600;">Gallery</span>
                    </div>
                    <div id="md-others-total" style="font-size:1.8rem; font-weight:700; color:#fff; margin-bottom:4px;">0</div>
                    <div style="font-size:0.8rem; color:#9ca3af;" id="md-others-details">Active Clubs & Gallery Photos</div>
                </div>
            </div>

            <!-- Quick Module Navigation Shortcuts -->
            <div style="background:#170f33; border:1px solid rgba(255,255,255,0.12); border-radius:16px; padding:20px;">
                <h3 style="font-size:1.1rem; color:#22d3ee; margin:0 0 15px 0; font-weight:700;">⚡ Quick Portal Navigation Shortcuts</h3>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px;">
                    <a href="staff.html" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Staff Directory</a>
                    <a href="student-portal.html?view=list" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Student Directory</a>
                    <a href="fees" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Fees & Collection</a>
                    <a href="exam-portal?view=exam-entry" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Exam Schedule List</a>
                    <a href="seat-plan" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Seat Plan Tokens</a>
                    <a href="result-portal" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Result Transcripts</a>
                    <a href="notice-board" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Notice Board</a>
                    <a href="others" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Co-curricular Clubs</a>
                    <a href="advance" style="background:#201547; color:#fff; text-decoration:none; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:0.88rem; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s;">Advance Settings</a>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal on clicking overlay
    const overlay = document.getElementById('master-dashboard-modal');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeMasterDashboardModal();
            }
        });
    }
}

function openMasterDashboardModal() {
    injectMasterDashboardModal();
    updateMasterDashboardStats();
    const modal = document.getElementById('master-dashboard-modal');
    if (modal) modal.style.display = 'block';
}

function closeMasterDashboardModal() {
    const modal = document.getElementById('master-dashboard-modal');
    if (modal) modal.style.display = 'none';
}

function updateMasterDashboardStats() {
    try {
        // Staff
        const staff = JSON.parse(localStorage.getItem('school_staff') || '[]');
        const teachers = staff.filter(s => s.role === 'teacher').length;
        const totalStaff = staff.length;
        const elStaffTotal = document.getElementById('md-staff-total');
        if (elStaffTotal) elStaffTotal.textContent = totalStaff;
        const elStaffDet = document.getElementById('md-staff-details');
        if (elStaffDet) elStaffDet.textContent = `${teachers} Teachers, ${totalStaff - teachers} Office Staff`;

        // Students
        const students = JSON.parse(localStorage.getItem('school_students') || '[]');
        const elStuTotal = document.getElementById('md-student-total');
        if (elStuTotal) elStuTotal.textContent = students.length;

        // Fees
        const fees = JSON.parse(localStorage.getItem('school_class_fees') || '[]');
        const elFeesTotal = document.getElementById('md-fees-total');
        if (elFeesTotal) elFeesTotal.textContent = fees.length;

        // Exams
        const exams = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]');
        const elExamTotal = document.getElementById('md-exam-total');
        if (elExamTotal) elExamTotal.textContent = exams.length;

        // Seat Plan
        const seatPlans = JSON.parse(localStorage.getItem('school_seat_plans_store') || '[]');
        const rooms = JSON.parse(localStorage.getItem('school_rooms') || '[]');
        const elSeatTotal = document.getElementById('md-seat-total');
        if (elSeatTotal) elSeatTotal.textContent = seatPlans.length > 0 ? seatPlans.length : rooms.length;

        // Results
        const marksMap = JSON.parse(localStorage.getItem('school_student_marks') || '{}');
        const marksCount = Object.keys(marksMap).length;
        const elResultTotal = document.getElementById('md-result-total');
        if (elResultTotal) elResultTotal.textContent = marksCount;

        // Notices
        const notices = JSON.parse(localStorage.getItem('school_notices') || '[]');
        const elNoticeTotal = document.getElementById('md-notice-total');
        if (elNoticeTotal) elNoticeTotal.textContent = notices.length;

        // Others
        const clubs = JSON.parse(localStorage.getItem('school_others_clubs') || '[]');
        const gallery = JSON.parse(localStorage.getItem('school_others_gallery') || '[]');
        const elOthersTotal = document.getElementById('md-others-total');
        if (elOthersTotal) elOthersTotal.textContent = clubs.length + gallery.length;
        const elOthersDet = document.getElementById('md-others-details');
        if (elOthersDet) elOthersDet.textContent = `${clubs.length} Clubs, ${gallery.length} Gallery Photos`;
    } catch (e) {
        console.error("Error updating master dashboard stats:", e);
    }
}

// Intercept Home Icon (.nav-brand) clicks globally to navigate directly to index.html
document.addEventListener('DOMContentLoaded', () => {
    injectMasterDashboardModal();
    const brands = document.querySelectorAll('.nav-brand');
    brands.forEach(brand => {
        brand.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    });
});

// Synchronize login status across multiple browser tabs in real-time
window.addEventListener('storage', (e) => {
    if (e.key === 'isLoggedIn') {
        updateLoginButtonState();
    }
});

// --- SITEWIDE REAL-TIME DEVICE PRESENCE & HEARTBEAT ---
(function initDevicePresence() {
    function getSessionId() {
        let sid = localStorage.getItem('__school_session_id');
        if (!sid) {
            sid = 'sid_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
            localStorage.setItem('__school_session_id', sid);
        }
        return sid;
    }

    function getDeviceMac() {
        let mac = localStorage.getItem('__school_device_mac');
        if (!mac) {
            const hex = () => Math.floor((1 + Math.random()) * 0x100).toString(16).substring(1).toUpperCase();
            mac = `5C:26:0A:${hex()}:${hex()}:${hex()}`;
            localStorage.setItem('__school_device_mac', mac);
        }
        return mac;
    }

    function getSessionJoinedAt() {
        let loginTime = localStorage.getItem('__school_user_login_time');
        if (!loginTime) {
            loginTime = sessionStorage.getItem('__school_session_joined_at');
        }
        if (!loginTime) {
            loginTime = Date.now().toString();
            localStorage.setItem('__school_user_login_time', loginTime);
            sessionStorage.setItem('__school_session_joined_at', loginTime);
        }
        return parseInt(loginTime, 10);
    }

    function detectDeviceModel() {
        const ua = navigator.userAgent || '';
        let os = 'PC / Desktop';
        if (/windows nt 10\.0|windows nt 11\.0/i.test(ua)) os = 'Windows 11/10 PC';
        else if (/windows/i.test(ua)) os = 'Windows PC';
        else if (/android/i.test(ua)) {
            const match = ua.match(/Android [^;)]+; ([^;)]+)\)/i);
            os = match ? `${match[1].trim()} (Android)` : 'Android Mobile';
        } else if (/iphone/i.test(ua)) os = 'Apple iPhone (iOS)';
        else if (/ipad/i.test(ua)) os = 'Apple iPad (iPadOS)';
        else if (/macintosh|mac os x/i.test(ua)) os = 'Apple Mac (macOS)';
        else if (/linux/i.test(ua)) os = 'Linux PC';

        let browser = 'Browser';
        if (/edg/i.test(ua)) browser = 'Edge';
        else if (/chrome/i.test(ua)) browser = 'Chrome';
        else if (/firefox/i.test(ua)) browser = 'Firefox';
        else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

        return `${os} • ${browser}`;
    }

    function getUserName() {
        let name = localStorage.getItem('school_user_name');
        if (!name) {
            const headName = localStorage.getItem('headmaster_name');
            if (headName && (window.location.pathname.includes('advance') || window.location.href.includes('advance'))) {
                name = 'অ্যাডমিন (' + headName + ')';
            } else {
                name = localStorage.getItem('currentUser') || 'স্কুল ব্যবহারকারী';
            }
        }
        return name;
    }

    function getUserRole() {
        let role = localStorage.getItem('school_user_role');
        if (!role) {
            if (window.location.pathname.includes('advance') || window.location.href.includes('advance')) {
                role = 'প্রধান শিক্ষক / অ্যাডমিন';
            } else if (window.location.pathname.includes('staff') || window.location.href.includes('staff')) {
                role = 'শিক্ষক / স্টাফ';
            } else if (window.location.pathname.includes('student') || window.location.href.includes('student')) {
                role = 'শিক্ষার্থী';
            } else {
                role = 'ব্যবহারকারী / সদস্য';
            }
        }
        return role;
    }

    function getUserDistrict() {
        return localStorage.getItem('school_user_district') || 'নীলফামারী (জলঢাকা)';
    }

    window.sendSchoolHeartbeat = function() {
        const payload = {
            session_id: getSessionId(),
            user_name: getUserName(),
            role: getUserRole(),
            device_name: detectDeviceModel(),
            device_mac: getDeviceMac(),
            joined_at: getSessionJoinedAt(),
            location: getUserDistrict(),
            page: (window.location.pathname.split('/').pop() || 'Home').replace('.html', '')
        };

        fetch('/api/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => {
            if (r.ok) return r.json();
        }).then(data => {
            if (data) {
                window.__CURRENT_DEVICE_IP = data.device_ip;
                window.__CURRENT_DEVICE_MAC = data.mac_address;
                window.__ACTIVE_USERS_DATA = data.users;
                if (data.mac_address && data.mac_address !== "N/A") {
                    localStorage.setItem('__school_device_mac', data.mac_address);
                }
                window.dispatchEvent(new CustomEvent('school_active_users_updated', { detail: data }));
            }
        }).catch(() => {});
    };

    window.sendSchoolLogout = function(callback) {
        const sid = localStorage.getItem('__school_session_id') || ('sid_' + (window.__CURRENT_DEVICE_IP || '127.0.0.1'));
        fetch('/api/heartbeat/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sid })
        }).catch(() => {}).finally(() => {
            sessionStorage.removeItem('__school_session_joined_at');
            if (typeof callback === 'function') callback();
        });
    };

    window.logUserActivity = function(module, action, details) {
        const payload = {
            user_name: getUserName(),
            role: getUserRole(),
            module: module || 'সিস্টেম',
            action: action || 'তথ্য আপডেট',
            details: details || '',
            device_name: detectDeviceModel(),
            device_ip: window.__CURRENT_DEVICE_IP || '',
            mac_address: window.__CURRENT_DEVICE_MAC || getDeviceMac(),
            location: getUserDistrict()
        };

        fetch('/api/activity-logs/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => {
            if (r.ok) {
                window.dispatchEvent(new CustomEvent('school_activity_logged', { detail: payload }));
            }
        }).catch(() => {});
    };

    // Send immediately on load and interval every 12 seconds
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        window.sendSchoolHeartbeat();
    } else {
        document.addEventListener('DOMContentLoaded', window.sendSchoolHeartbeat);
    }
    setInterval(window.sendSchoolHeartbeat, 12000);
})();

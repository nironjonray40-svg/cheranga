// Test dropdown sync logic
const assert = require('assert');

// Mock localStorage
const storage = {};
global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; }
};

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
        'play': 'Play', 'nursery': 'Nursery', 'kg': 'KG',
        '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
        '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight',
        '9': 'Nine', '10': 'Ten'
    };
    if (map[norm]) return map[norm];
    return c.replace(/^class\s*/i, '').replace(/শ্রেণি|শ্রেণী/g, '').trim() || c;
}

function sortClassesSequential(classes) {
    const classOrderMap = {
        'play': 1, 'nursery': 2, 'kg': 3, '1': 4, '2': 5,
        '3': 6, '4': 7, '5': 8, '6': 9, '7': 10, '8': 11,
        '9': 12, '10': 13
    };
    return Array.from(classes).sort((a, b) => {
        const oa = classOrderMap[normalizeClassString(a)] || 99;
        const ob = classOrderMap[normalizeClassString(b)] || 99;
        return oa - ob;
    });
}

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

// 1. Get all available Exams from "Exam List" (school_exam_schedules)
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

    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && typeof s === 'object') {
                        const examName = (s.term || s.examName || '').trim();
                        if (examName) {
                            addExam(examName);
                        }
                    }
                });
            }
        }
    } catch(e) {}

    try {
        const rawTypes = localStorage.getItem('school_exam_types');
        if (rawTypes) {
            const parsed = JSON.parse(rawTypes);
            if (Array.isArray(parsed)) {
                parsed.forEach(t => {
                    const name = typeof t === 'string' ? t : (t && t.name ? t.name : '');
                    if (name) addExam(name);
                });
            }
        }
    } catch(e) {}

    try {
        const rawRoutines = localStorage.getItem('school_exam_routines');
        if (rawRoutines) {
            const parsed = JSON.parse(rawRoutines);
            if (Array.isArray(parsed)) {
                parsed.forEach(r => {
                    if (r) {
                        const name = (r.examName || r.term || '').trim();
                        if (name) addExam(name);
                    }
                });
            }
        }
    } catch(e) {}

    if (examList.length === 0) {
        ['অর্ধ-বার্ষিক পরীক্ষা ২০২৫', 'বার্ষিক পরীক্ষা ২০২৫', 'প্রাক-নির্বাচনী পরীক্ষা ২০২৫', 'নির্বাচনী পরীক্ষা ২০২৫'].forEach(addExam);
    }

    return examList;
}

// 2. Get Classes based on Selected Exam Name ("Exam List" schedules)
function getClassesForExam(examName) {
    const classSet = new Set();

    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && typeof s === 'object') {
                        const sExam = (s.term || s.examName || '').trim();
                        if (sExam && (!examName || isExamMatch(sExam, examName))) {
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

    try {
        const rawRoutines = localStorage.getItem('school_exam_routines');
        if (rawRoutines) {
            const parsed = JSON.parse(rawRoutines);
            if (Array.isArray(parsed)) {
                parsed.forEach(r => {
                    if (r) {
                        const rExam = (r.examName || r.term || '').trim();
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

    if (classSet.size === 0) {
        try {
            const rawClasses = localStorage.getItem('school_classes');
            if (rawClasses) {
                const parsed = JSON.parse(rawClasses);
                if (Array.isArray(parsed)) {
                    parsed.forEach(c => {
                        const cName = typeof c === 'string' ? c : (c && (c.name || c.className) ? (c.name || c.className) : '');
                        const fmt = formatClassNameDisplay(cName);
                        if (fmt) classSet.add(fmt);
                    });
                }
            }
        } catch(e) {}
    }

    if (classSet.size === 0) {
        ['Play', 'Nursery', 'KG', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'].forEach(c => classSet.add(c));
    }

    return sortClassesSequential(classSet);
}

// TEST CASES
// 1. When schedules has Exam 1 for Class 9 and 10, and Exam 2 for Class 6 and 7
storage['school_exam_schedules'] = JSON.stringify([
    { term: '১ম সাময়িক পরীক্ষা ২০২৬', class: 'Nine', subject: 'Bangla' },
    { term: '১ম সাময়িক পরীক্ষা ২০২৬', class: 'Ten', subject: 'Bangla' },
    { term: 'বার্ষিক পরীক্ষা ২০২৬', class: 'Six', subject: 'Math' },
    { term: 'বার্ষিক পরীক্ষা ২০২৬', class: 'Seven', subject: 'Math' }
]);

const exams = getAllExams();
console.log('Exams from Exam List:', exams);
assert.deepStrictEqual(exams, ['১ম সাময়িক পরীক্ষা ২০২৬', 'বার্ষিক পরীক্ষা ২০২৬']);

const classesExam1 = getClassesForExam('১ম সাময়িক পরীক্ষা ২০২৬');
console.log('Classes for ১ম সাময়িক পরীক্ষা ২০২৬:', classesExam1);
assert.deepStrictEqual(classesExam1, ['Nine', 'Ten']);

const classesExam2 = getClassesForExam('বার্ষিক পরীক্ষা ২০২৬');
console.log('Classes for বার্ষিক পরীক্ষা ২০২৬:', classesExam2);
assert.deepStrictEqual(classesExam2, ['Six', 'Seven']);

console.log('All dropdown cascading tests passed 100%!');

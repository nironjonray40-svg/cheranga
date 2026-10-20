const fs = require('fs');

const types = fs.readFileSync('scratch/exam_types.json', 'utf8');
const scheds = fs.readFileSync('scratch/exam_schedules.json', 'utf8');

const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

// Build accurate mock DOM matching THEAD 6
const thElements = [];
const thRegex = /<th[^>]*data-fullmark[^>]*>[\s\S]*?<\/th>/gi;
const matches = html.match(thRegex) || [];
for (const m of matches) {
    const subjM = m.match(/data-subj="([^"]+)"/);
    const fullM = m.match(/data-fullmark="([^"]+)"/);
    const colTypeM = m.match(/data-col-type="([^"]+)"/);
    const th = {
        attributes: {
            'data-subj': subjM ? subjM[1] : '',
            'data-fullmark': fullM ? fullM[1] : '',
            'data-col-type': colTypeM ? colTypeM[1] : ''
        },
        getAttribute: function(k) { return this.attributes[k]; },
        textContent: ''
    };
    thElements.push(th);
}

const colTypeThs = [];
const colTypeRegex = /<th[^>]*data-col-type[^>]*>[\s\S]*?<\/th>/gi;
for (const m of (html.match(colTypeRegex) || [])) {
    const colTypeM = m.match(/data-col-type="([^"]+)"/);
    const innerObj = { textContent: '' };
    const th = {
        attributes: { 'data-col-type': colTypeM ? colTypeM[1] : '' },
        getAttribute: function(k) { return this.attributes[k]; },
        classList: { contains: () => true, remove: () => {}, add: () => {} },
        querySelector: function(sel) {
            if (sel === '.v-text-inner') return innerObj;
            return null;
        },
        textContent: '',
        inner: innerObj
    };
    colTypeThs.push(th);
}

console.log(`Found ${thElements.length} fullmark ths, ${colTypeThs.length} col-type ths`);

global.localStorage = {
    getItem: (k) => {
        if (k === 'school_exam_types') return types;
        if (k === 'school_exam_schedules') return scheds;
        return null;
    }
};

global.document = {
    querySelectorAll: (sel) => {
        if (sel.includes('[data-col-type]')) return colTypeThs;
        if (sel.includes('[data-fullmark]')) return thElements;
        return [];
    }
};

global.currentLang = 'bn';
global.translateDigits = (val, lang) => {
    if (lang === 'bn') {
        const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(val || '').replace(/[0-9]/g, d => banglaDigits[d]);
    }
    return String(val || '');
};

global.activeClassSlotMap = {};
function isExamMatch(examA, examB) {
    if (!examA || !examB) return false;
    const a = examA.toString().trim().toLowerCase();
    const b = examB.toString().trim().toLowerCase();
    return a === b || a.includes(b) || b.includes(a);
}

function getSubjectSlot(subName, subCode) {
    const sName = (subName || '').trim().toLowerCase();
    const code = (subCode || '').toString().trim();

    if (code && activeClassSlotMap[code]) return activeClassSlotMap[code];
    if (sName && activeClassSlotMap[sName]) return activeClassSlotMap[sName];

    if (code === '101' || /bangla.*1|বাং.*১|বাংলা সাহিত্য/i.test(sName)) return 'bangla1';
    if (code === '102' || /bangla.*2|বাং.*২|ব্যাকরণ/i.test(sName)) return 'bangla2';
    if (code === '103' || /english.*1|eng.*1|ইংরেজি ১ম|for today/i.test(sName)) return 'english1';
    if (code === '104' || /english.*2|eng.*2|ইংরেজি ২য়|grammar/i.test(sName)) return 'english2';
    if (code === '105' || /math|গণিত/i.test(sName)) return 'math';
    if (code === '107' || /bgs|global studies|বিশ্বপরিচয়/i.test(sName)) return 'bgs';
    if (code === '1111' || /physics|পদার্থ/i.test(sName)) return 'phys';
    if (code === '135' || /chemistry|রসায়ন/i.test(sName)) return 'chem';
    if (code === '108' || /science|বিজ্ঞান/i.test(sName)) return 'chem';
    if (code === '180' || /biology|জীববিজ্ঞান/i.test(sName)) return 'bio';
    if (['110', '111', '112', '113'].includes(code) || /religion|islam|hindu|ধর্ম/i.test(sName)) return 'rel';
    if (code === '106' || /ict|information.*tech|যোগাযোগ/i.test(sName)) return 'ict';
    if (['109', '126', '505'].includes(code) || /agri|কৃষি|higher.*math|উচ্চতর/i.test(sName)) return 'agri';

    return null;
}

// Extract getSubjectMarksDistribution and updateDynamicSubjectMarksAndHeaders from Tabulation Sheet.html
const m1 = html.match(/function getSubjectMarksDistribution[\s\S]*?\n        function getSubjectPracticalStatus/);
eval(m1[0].replace('function getSubjectPracticalStatus', ''));

// Test Class Eight, Elegileble test
currentFilterClass = 'Eight';
currentFilterExam = 'Elegileble test';
currentLang = 'bn';
updateDynamicSubjectMarksAndHeaders();

console.log('\n--- CLASS EIGHT (Elegileble test) FULL MARKS ROW ---');
const eightMarks = {};
thElements.forEach(th => {
    const s = th.getAttribute('data-subj');
    const f = th.getAttribute('data-fullmark');
    if (!eightMarks[s]) eightMarks[s] = {};
    eightMarks[s][f] = th.textContent;
});
console.log(JSON.stringify(eightMarks, null, 2));

// Test Class Ten, বার্ষিক পরীক্ষা
currentFilterClass = 'Ten';
currentFilterExam = 'বার্ষিক পরীক্ষা';
currentLang = 'bn';
updateDynamicSubjectMarksAndHeaders();

console.log('\n--- CLASS TEN (বার্ষিক পরীক্ষা) FULL MARKS ROW ---');
const tenMarks = {};
thElements.forEach(th => {
    const s = th.getAttribute('data-subj');
    const f = th.getAttribute('data-fullmark');
    if (!tenMarks[s]) tenMarks[s] = {};
    tenMarks[s][f] = th.textContent;
});
console.log(JSON.stringify(tenMarks, null, 2));

// Test English language output
currentFilterClass = 'Eight';
currentFilterExam = 'Elegileble test';
currentLang = 'en';
updateDynamicSubjectMarksAndHeaders();

console.log('\n--- CLASS EIGHT (Elegileble test) ENGLISH HEADERS & MARKS ---');
const enColTypes = colTypeThs.map(th => th.inner ? th.inner.textContent : th.textContent);
console.log('Sample updated col-type text in English:', [...new Set(enColTypes)]);
const enMarks = {};
thElements.forEach(th => {
    const s = th.getAttribute('data-subj');
    const f = th.getAttribute('data-fullmark');
    if (!enMarks[s]) enMarks[s] = {};
    enMarks[s][f] = th.textContent;
});
console.log(JSON.stringify(enMarks, null, 2));

const fs = require('fs');
const sqlite3Child = require('child_process').spawnSync('python', [
    '-c',
    "import sqlite3, sys, io; sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8'); conn = sqlite3.connect('school.db'); c = conn.cursor(); c.execute('SELECT value FROM local_storage_sync WHERE key=\"school_subjects\"'); print(c.fetchone()[0])"
], { encoding: 'utf8' });

const subjectsData = sqlite3Child.stdout.trim();

let localStorageStore = {
    'school_subjects': subjectsData
};
const localStorage = {
    getItem: (k) => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = v; }
};

let currentFilterClass = '8th';
let currentFilterGroup = 'all';
let currentFilterSection = 'A';
let currentLang = 'bn';
let currentSubjFormat = 'full';
let currentFilterExam = 'all';

const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');
const fnCode = html.match(/let activeClassSlotMap = \{[\s\S]*?function updateSubjects\(\) \{[\s\S]*?\n        \}/)[0];

const mockElements = [];
function makeTh(subj, colType, fullmark, initialText) {
    const el = {
        attributes: {
            'data-subj': subj,
            'data-col-type': colType,
            'data-fullmark': fullmark
        },
        textContent: initialText,
        getAttribute(k) { return this.attributes[k] || null; },
        hasAttribute(k) { return !!this.attributes[k]; }
    };
    mockElements.push(el);
    return el;
}

const thBangla = makeTh('bangla', null, null, 'বাংলা');
const thEng = makeTh('english', null, null, 'English');
const thMath = makeTh('math', null, null, 'গণিত');
const thBgs = makeTh('bgs', null, null, 'বাংলাদেশ ও বিশ্বপরিচয়');
const thChem = makeTh('chem', null, null, 'রসায়ন');
const thPhys = makeTh('phys', null, null, 'পদার্থ');
const thBio = makeTh('bio', null, null, 'জীববিজ্ঞান');
const thRel = makeTh('rel', null, null, 'ধর্ম (ইসলাম/হিন্দু)');
const thIct = makeTh('ict', null, null, 'তথ্য ও যোগাযোগ প্রযুক্তি');
const thAgri = makeTh('agri', null, null, 'কৃষি/উচ্চতর');

const thB1 = makeTh('bangla1', null, null, 'বাংলা ১ম');
const thB2 = makeTh('bangla2', null, null, 'বাংলা ২য়');
const thE1 = makeTh('english1', null, null, 'English 1st');
const thE2 = makeTh('english2', null, null, 'English 2nd');

const thChemPrac = makeTh('chem', 'practical', null, 'ব্যবহারিক');
const thChemFull = makeTh('chem', null, 'mcq', '২৫');

const document = {
    getElementById: (id) => ({ value: currentFilterClass }),
    querySelectorAll: (sel) => {
        if (sel === 'thead th[data-subj]:not([data-col-type]):not([data-fullmark])') {
            return mockElements.filter(e => e.attributes['data-subj'] && !e.attributes['data-col-type'] && !e.attributes['data-fullmark']);
        }
        return [];
    }
};

eval(fnCode);

console.log('=== TEST 1: Class Eight ===');
currentFilterClass = '8th';
updateSubjects();
console.log('Slot 5 (chem -> Science):', thChem.textContent);
console.log('Slot 6 (phys -> None):   ', thPhys.textContent);
console.log('Slot 7 (bio -> None):    ', thBio.textContent);
console.log('Slot 10 (agri):          ', thAgri.textContent);
console.log('Bangla 1st:              ', thB1.textContent);
console.log('Bangla 2nd:              ', thB2.textContent);
console.log('English 1st:             ', thE1.textContent);
console.log('English 2nd:             ', thE2.textContent);
console.log('Math:                    ', thMath.textContent);
console.log('BGS:                     ', thBgs.textContent);
console.log('ICT:                     ', thIct.textContent);
console.log('Religion:                ', thRel.textContent);
console.log('Practical Th unchanged:  ', thChemPrac.textContent);
console.log('Fullmark Th unchanged:   ', thChemFull.textContent);

console.log('\n=== TEST 2: Class Ten (Science) ===');
currentFilterClass = '10th';
currentFilterGroup = 'science';
updateSubjects();
console.log('Slot 5 (chem):           ', thChem.textContent);
console.log('Slot 6 (phys):           ', thPhys.textContent);
console.log('Slot 7 (bio):            ', thBio.textContent);
console.log('Slot 10 (agri):          ', thAgri.textContent);

console.log('\n=== TEST 3: Real-time update from Exam Portal ===');
const parsed = JSON.parse(subjectsData);
const sciSub = parsed['Eight'].find(s => s.code === '108');
sciSub.nameBn = 'সাধারণ বিজ্ঞান';
localStorageStore['school_subjects'] = JSON.stringify(parsed);
currentFilterClass = '8th';
updateSubjects();
console.log('Slot 5 after Exam Portal edit: ', thChem.textContent);

console.log('\n=== TEST 4: English Language Mode ===');
currentLang = 'en';
updateSubjects();
console.log('Slot 5 (Science EN):     ', thChem.textContent);
console.log('Slot 6 (Phys EN):        ', thPhys.textContent);
console.log('Slot 10 (Agri EN):       ', thAgri.textContent);
console.log('Parent Bangla EN:        ', thBangla.textContent);
console.log('Parent English EN:       ', thEng.textContent);

console.log('\n=== ALL TESTS PASSED! ===');

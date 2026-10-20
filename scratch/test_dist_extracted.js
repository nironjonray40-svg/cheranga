const fs = require('fs');

const types = JSON.parse(fs.readFileSync('scratch/exam_types.json', 'utf8'));
const scheds = JSON.parse(fs.readFileSync('scratch/exam_schedules.json', 'utf8'));

global.localStorage = {
    getItem: (k) => {
        if (k === 'school_exam_types') return JSON.stringify(types);
        if (k === 'school_exam_schedules') return JSON.stringify(scheds);
        return null;
    }
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

// Extract getSubjectMarksDistribution from Tabulation Sheet.html
const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');
const fnMatch = html.match(/function getSubjectMarksDistribution[\s\S]*?\n        function updateDynamicSubjectMarksAndHeaders/);
if (fnMatch) {
    const fnCode = fnMatch[0].replace('function updateDynamicSubjectMarksAndHeaders', '');
    eval(fnCode);
    console.log("Extracted function!");
    const resB1 = getSubjectMarksDistribution('bangla1', 'Eight', 'Elegileble test');
    console.log('Result for bangla1:', resB1);

    const resE1 = getSubjectMarksDistribution('english1', 'Eight', 'Elegileble test');
    console.log('Result for english1:', resE1);

    const resMath = getSubjectMarksDistribution('math', 'Eight', 'Elegileble test');
    console.log('Result for math:', resMath);

    const resChem = getSubjectMarksDistribution('chem', 'Eight', 'Elegileble test');
    console.log('Result for chem (science):', resChem);
} else {
    console.log("Could not extract function");
}

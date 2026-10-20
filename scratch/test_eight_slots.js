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
global.isExamMatch = function(a, b) {
    if (!a || !b) return false;
    const s1 = a.toString().trim().toLowerCase();
    const s2 = b.toString().trim().toLowerCase();
    return s1 === s2 || s1.includes(s2) || s2.includes(s1);
};

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

// Test getSubjectSlot for each Eight schedule subject
scheds.forEach(s => {
    if (s.class && s.class.toLowerCase().includes('eight')) {
        console.log(`Subject: "${s.subject}" -> slot: ${getSubjectSlot(s.subject, s.code)}`);
    }
});

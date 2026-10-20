const fs = require('fs');

const examTypes = JSON.parse(fs.readFileSync('scratch/exam_types.json', 'utf8'));
const schedules = JSON.parse(fs.readFileSync('scratch/exam_schedules.json', 'utf8'));

// Test isExamMatch
function isExamMatch(examA, examB) {
    if (!examA || !examB) return false;
    const a = examA.toString().trim().toLowerCase();
    const b = examB.toString().trim().toLowerCase();
    if (a === b) return true;
    const stripYear = s => s.replace(/২০২[০-৯]|202[0-9]/g, '').replace(/[-_]/g, ' ').trim();
    const aNoYr = stripYear(a);
    const bNoYr = stripYear(b);
    if (aNoYr && bNoYr && (aNoYr === bNoYr || aNoYr.includes(bNoYr) || bNoYr.includes(aNoYr))) {
        return true;
    }
    return false;
}

const activeClassSlotMap = {};
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

const targetExam = 'Elegileble test';
const targetClass = 'Eight';
const slotKey = 'bangla1';

schedules.forEach(s => {
    const matchExam = isExamMatch(s.term || s.examName, targetExam);
    const sClass = (s.class || s.className || '').toString().toLowerCase().trim();
    const tClass = targetClass.toLowerCase();
    const sNorm = ['10', 'ten', '১০ম'].some(k => sClass.includes(k)) ? '10' :
                  ['9', 'nine', '৯ম'].some(k => sClass.includes(k)) ? '9' :
                  ['8', 'eight', '৮ম'].some(k => sClass.includes(k)) ? '8' :
                  ['7', 'seven', '৭ম'].some(k => sClass.includes(k)) ? '7' :
                  ['6', 'six', '৬ষ্ঠ'].some(k => sClass.includes(k)) ? '6' : sClass;
    const tNorm = ['10', 'ten', '১০ম'].some(k => tClass.includes(k)) ? '10' :
                  ['9', 'nine', '৯ম'].some(k => tClass.includes(k)) ? '9' :
                  ['8', 'eight', '৮ম'].some(k => tClass.includes(k)) ? '8' :
                  ['7', 'seven', '৭ম'].some(k => tClass.includes(k)) ? '7' :
                  ['6', 'six', '৬ষ্ঠ'].some(k => tClass.includes(k)) ? '6' : tClass;
    const matchClass = sNorm === tNorm;
    const slot = getSubjectSlot(s.subject || s.subjectName, s.code || s.subjectCode);
    console.log(`Sched: "${s.subject}" | matchExam: ${matchExam} | matchClass: ${matchClass} (${sNorm} vs ${tNorm}) | slot: ${slot}`);
});

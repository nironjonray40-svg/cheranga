const fs = require('fs');

const { schedules, examTypes } = JSON.parse(fs.readFileSync('scratch/db_sim_data.json', 'utf8'));

// Mock localStorage
const localStorage = {
    getItem(key) {
        if (key === 'school_exam_schedules') return JSON.stringify(schedules);
        if (key === 'school_exam_types') return JSON.stringify(examTypes);
        return null;
    }
};

let currentFilterClass = '৮ম';
let currentFilterExam = 'Elegileble test';
let currentLang = 'bn';

function isExamMatch(examA, examB) {
    if (!examA || !examB) return false;
    const a = examA.toString().trim().toLowerCase();
    const b = examB.toString().trim().toLowerCase();
    return a === b || a.includes(b) || b.includes(a);
}

function getSubjectSlot(subName, subCode) {
    const sName = (subName || '').trim().toLowerCase();
    const code = (subCode || '').toString().trim();

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

function getSubjectMarksDistribution(slotKey, className, examName) {
    let schedulesList = [];
    let examTypesList = [];
    try { schedulesList = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]'); } catch (e) { }
    try { examTypesList = JSON.parse(localStorage.getItem('school_exam_types') || '[]'); } catch (e) { }

    const targetClass = (className || currentFilterClass || 'Ten').toString().trim();
    const targetExam = (examName || currentFilterExam || 'all').toString().trim();
    const isSeniorClass = ['ten', 'nine', '10', '9', '১০ম', '৯ম'].some(k => targetClass.toLowerCase().includes(k));

    const baselines = {
        bangla1: { cq: 70, mcq: 30, practical: 0 },
        bangla2: { cq: 70, mcq: 30, practical: 0 },
        english1: { cq: 100, mcq: 0, practical: 0 },
        english2: { cq: 100, mcq: 0, practical: 0 },
        math: { cq: 70, mcq: 30, practical: 0 },
        bgs: { cq: 70, mcq: 30, practical: 0 },
        chem: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 70, mcq: 30, practical: 0 },
        phys: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 0, mcq: 0, practical: 0 },
        bio: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 0, mcq: 0, practical: 0 },
        rel: { cq: 70, mcq: 30, practical: 0 },
        ict: { cq: 35, mcq: 15, practical: 0 },
        agri: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 70, mcq: 30, practical: 0 }
    };

    const defaultDist = baselines[slotKey] || { cq: 70, mcq: 30, practical: 0 };

    let matchedSchedule = null;
    if (Array.isArray(schedulesList) && schedulesList.length > 0) {
        matchedSchedule = schedulesList.find(s => {
            if (!s) return false;
            if (targetExam !== 'all' && !isExamMatch(s.term || s.examName, targetExam)) return false;
            if (targetClass !== 'all') {
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
                if (sNorm !== tNorm) return false;
            }
            return getSubjectSlot(s.subject || s.subjectName, s.code || s.subjectCode) === slotKey;
        });
    }

    if (matchedSchedule) {
        const sTerm = matchedSchedule.term || matchedSchedule.examName || targetExam;
        const examDef = Array.isArray(examTypesList) ? examTypesList.find(et => isExamMatch(et.name, sTerm)) : null;

        if (examDef) {
            const subTypes = Array.isArray(examDef.examTypes) ? examDef.examTypes : [];
            const matchedSubType = subTypes.find(st => st.typeName && matchedSchedule.examType && st.typeName.trim().toLowerCase() === matchedSchedule.examType.trim().toLowerCase())
                                || subTypes.find(st => st.typeName && examDef.type && st.typeName.trim().toLowerCase() === examDef.type.trim().toLowerCase())
                                || subTypes[0]
                                || examDef;

            const overrides = matchedSubType.overrides || examDef.overrides || [];
            const subNameClean = (matchedSchedule.subject || matchedSchedule.subjectName || '').trim().toLowerCase();
            const subCodeClean = (matchedSchedule.code || matchedSchedule.subjectCode || '').toString().trim();

            let override = null;
            if (subCodeClean) {
                override = overrides.find(o => String(o.subjectCode).trim() === subCodeClean);
            }
            if (!override && subNameClean) {
                override = overrides.find(o => o.subjectName && (o.subjectName.trim().toLowerCase() === subNameClean || subNameClean.includes(o.subjectName.trim().toLowerCase())));
            }

            if (override) {
                const cq = override.cq !== undefined ? Number(override.cq) : defaultDist.cq;
                const mcq = override.mcq !== undefined ? Number(override.mcq) : defaultDist.mcq;
                const practical = override.practical !== undefined ? Number(override.practical) : defaultDist.practical;
                return { cq, mcq, practical, total: cq + mcq + practical, hasSchedule: true, scheduleSubject: matchedSchedule.subject, examType: matchedSchedule.examType };
            }

            const cq = matchedSubType.defaultCQ !== undefined ? Number(matchedSubType.defaultCQ) : defaultDist.cq;
            const mcq = matchedSubType.defaultMCQ !== undefined ? Number(matchedSubType.defaultMCQ) : defaultDist.mcq;
            const practical = matchedSubType.defaultPractical !== undefined ? Number(matchedSubType.defaultPractical) : defaultDist.practical;
            return { cq, mcq, practical, total: cq + mcq + practical, hasSchedule: true, scheduleSubject: matchedSchedule.subject, examType: matchedSchedule.examType };
        }
    }

    return { ...defaultDist, total: defaultDist.cq + defaultDist.mcq + defaultDist.practical, hasSchedule: false };
}

console.log('distB1:', getSubjectMarksDistribution('bangla1', '৮ম', 'Elegileble test'));
console.log('distB2:', getSubjectMarksDistribution('bangla2', '৮ম', 'Elegileble test'));
console.log('distEng1:', getSubjectMarksDistribution('english1', '৮ম', 'Elegileble test'));
console.log('distMath:', getSubjectMarksDistribution('math', '৮ম', 'Elegileble test'));
console.log('distChem:', getSubjectMarksDistribution('chem', '৮ম', 'Elegileble test'));

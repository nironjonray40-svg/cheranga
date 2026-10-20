const fs = require('fs');

const examTypes = JSON.parse(fs.readFileSync('scratch/exam_types.json', 'utf8'));
const schedules = JSON.parse(fs.readFileSync('scratch/exam_schedules.json', 'utf8'));

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

function normalizeClassName(cls) {
    if (!cls) return 'Ten';
    const val = cls.toString().toLowerCase().trim();
    if (val === '10th' || val === 'ten' || val === '10' || val === '১০ম' || val.includes('ten') || val.includes('10')) return 'Ten';
    if (val === '9th' || val === 'nine' || val === '9' || val === '৯ম' || val.includes('nine') || val.includes('9')) return 'Nine';
    if (val === '8th' || val === 'eight' || val === '8' || val === '৮ম' || val.includes('eight') || val.includes('8')) return 'Eight';
    if (val === '7th' || val === 'seven' || val === '7' || val === '৭ম' || val.includes('seven') || val.includes('7')) return 'Seven';
    if (val === '6th' || val === 'six' || val === '6' || val === '৬ষ্ঠ' || val.includes('six') || val.includes('6')) return 'Six';
    if (val === 'five' || val === '5' || val === '৫ম' || val.includes('five') || val.includes('5')) return 'Five';
    if (val === 'four' || val === '4' || val === '৪র্থ' || val.includes('four') || val.includes('4')) return 'Four';
    if (val === 'three' || val === '3' || val === '৩য়' || val.includes('three') || val.includes('3')) return 'Three';
    if (val === 'two' || val === '2' || val === '২য়' || val.includes('two') || val.includes('2')) return 'Two';
    if (val === 'one' || val === '1' || val === '১ম' || val.includes('one') || val.includes('1')) return 'One';
    if (val.includes('kg') || val.includes('কেজি')) return 'KG';
    if (val.includes('nursery') || val.includes('নার্সারি')) return 'Nursery';
    if (val.includes('play') || val.includes('প্লে')) return 'Play';
    return cls;
}

function getSubjectMarksDistribution(slotKey, className, examName) {
    const normClass = normalizeClassName(className);
    const isSenior = ['Ten', 'Nine'].includes(normClass);

    // Standard baseline distributions
    const baselines = {
        bangla1: { cq: 70, mcq: 30, practical: 0 },
        bangla2: { cq: 70, mcq: 30, practical: 0 },
        english1: { cq: 100, mcq: 0, practical: 0 },
        english2: { cq: 100, mcq: 0, practical: 0 },
        math: { cq: 70, mcq: 30, practical: 0 },
        bgs: { cq: 70, mcq: 30, practical: 0 },
        chem: isSenior ? { cq: 50, mcq: 25, practical: 25 } : { cq: 70, mcq: 30, practical: 0 },
        phys: isSenior ? { cq: 50, mcq: 25, practical: 25 } : { cq: 0, mcq: 0, practical: 0 },
        bio: isSenior ? { cq: 50, mcq: 25, practical: 25 } : { cq: 0, mcq: 0, practical: 0 },
        rel: { cq: 70, mcq: 30, practical: 0 },
        ict: { cq: 35, mcq: 15, practical: 0 },
        agri: isSenior ? { cq: 50, mcq: 25, practical: 25 } : { cq: 70, mcq: 30, practical: 0 }
    };

    const defaultDist = baselines[slotKey] || { cq: 70, mcq: 30, practical: 0 };

    // Match schedule for this slot
    const sch = schedules.find(s => {
        if (!s) return false;
        if (examName && examName !== 'all' && !isExamMatch(s.term || s.examName, examName)) return false;
        if (className && className !== 'all' && normalizeClassName(s.class || s.className) !== normClass) return false;

        const sub = (s.subject || s.subjectName || '').toLowerCase().trim();
        const code = (s.code || s.subjectCode || '').toString().trim();

        if (slotKey === 'bangla1') return code === '101' || (/bangla.*1|বাংলা.*১/i.test(sub));
        if (slotKey === 'bangla2') return code === '102' || (/bangla.*2|বাংলা.*২/i.test(sub));
        if (slotKey === 'english1') return code === '103' || (/english.*1|ইংরেজি.*১/i.test(sub));
        if (slotKey === 'english2') return code === '104' || (/english.*2|ইংরেজি.*২/i.test(sub));
        if (slotKey === 'math') return (code === '105' || /math|গণিত/i.test(sub)) && !/higher|উচ্চতর/i.test(sub);
        if (slotKey === 'bgs') return code === '107' || /bgs|bangladesh|বাংলাদেশ.*বিশ্ব/i.test(sub);
        if (slotKey === 'chem') return isSenior ? (code === '135' || /chemistry|রসায়ন/i.test(sub)) : (code === '108' || /science|বিজ্ঞান/i.test(sub));
        if (slotKey === 'phys') return code === '1111' || /physics|পদার্থ/i.test(sub);
        if (slotKey === 'bio') return code === '180' || /biology|জীববিজ্ঞান/i.test(sub);
        if (slotKey === 'rel') return code === '110' || code === '111' || /islam|hindu|religion|ধর্ম/i.test(sub);
        if (slotKey === 'ict') return code === '106' || /ict|তথ্য/i.test(sub);
        if (slotKey === 'agri') return code === '109' || code === '505' || /agri|কৃষি|higher.*math|উচ্চতর/i.test(sub);

        return false;
    });

    if (sch) {
        const sExam = sch.term || sch.examName || examName;
        const examDef = examTypes.find(et => isExamMatch(et.name, sExam));
        if (examDef) {
            const subTypes = examDef.examTypes || [];
            const matchedType = subTypes.find(st => st.typeName && sch.examType && st.typeName.trim().toLowerCase() === sch.examType.trim().toLowerCase()) 
                             || subTypes.find(st => st.typeName && examDef.type && st.typeName.trim().toLowerCase() === examDef.type.trim().toLowerCase())
                             || subTypes[0] 
                             || examDef;

            const overrides = matchedType.overrides || examDef.overrides || [];
            const subNameClean = (sch.subject || '').trim().toLowerCase();
            const subCodeClean = (sch.code || sch.subjectCode || '').toString().trim();

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
                return { cq, mcq, practical, total: cq + mcq + practical, hasSchedule: true, scheduleSubject: sch.subject, examType: sch.examType };
            }

            const cq = matchedType.defaultCQ !== undefined ? Number(matchedType.defaultCQ) : defaultDist.cq;
            const mcq = matchedType.defaultMCQ !== undefined ? Number(matchedType.defaultMCQ) : defaultDist.mcq;
            const practical = matchedType.defaultPractical !== undefined ? Number(matchedType.defaultPractical) : defaultDist.practical;
            return { cq, mcq, practical, total: cq + mcq + practical, hasSchedule: true, scheduleSubject: sch.subject, examType: sch.examType };
        }
    }

    return { ...defaultDist, total: defaultDist.cq + defaultDist.mcq + defaultDist.practical, hasSchedule: false };
}

console.log("=== Test Class Eight, Exam: Elegileble test ===");
['bangla1', 'bangla2', 'english1', 'english2', 'math', 'bgs', 'chem'].forEach(k => {
    console.log(k, JSON.stringify(getSubjectMarksDistribution(k, 'Eight', 'Elegileble test')));
});

console.log("\n=== Test Class Ten, Exam: বার্ষিক পরীক্ষা ===");
['bangla1', 'bangla2', 'english1', 'english2', 'math', 'bgs', 'chem', 'phys', 'ict', 'agri'].forEach(k => {
    console.log(k, JSON.stringify(getSubjectMarksDistribution(k, 'Ten', 'বার্ষিক পরীক্ষা')));
});

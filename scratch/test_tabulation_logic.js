const fs = require('fs');
const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));
const schedules = JSON.parse(dbData.school_exam_schedules || '[]');
const routines = JSON.parse(dbData.school_exam_routines || '[]');
const omrExams = JSON.parse(dbData.school_omr_exams || '[]');
const subjectsMap = JSON.parse(dbData.school_subjects || '{}');

function normalizeClassName(cls) {
    if (!cls || cls === 'all') return 'Ten';
    const val = cls.toString().toLowerCase().trim();
    if (val === '10th' || val === 'ten' || val === '10' || val === '১০ম' || val.includes('ten') || val.includes('10')) return 'Ten';
    if (val === '9th' || val === 'nine' || val === '9' || val === '৯ম' || val.includes('nine') || val.includes('9')) return 'Nine';
    if (val === '8th' || val === 'eight' || val === '8' || val === '৮ম' || val.includes('eight') || val.includes('8')) return 'Eight';
    if (val === '7th' || val === 'seven' || val === '7' || val === '৭ম' || val.includes('seven') || val.includes('7')) return 'Seven';
    if (val === '6th' || val === 'six' || val === '6' || val === '৬ষ্ঠ' || val.includes('six') || val.includes('6')) return 'Six';
    return cls;
}

const parseCombinedSubName = (rawStr) => {
    let nameEn = (rawStr || '').trim();
    let nameBn = (rawStr || '').trim();
    const m = (rawStr || '').match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (m) {
        const p1 = m[1].trim();
        const p2 = m[2].trim();
        if (/[\u0980-\u09FF]/.test(p1)) {
            nameBn = p1;
            nameEn = p2;
        } else {
            nameEn = p1;
            nameBn = p2;
        }
    }
    return { nameEn, nameBn };
};

function buildDynamicSubjectMap(currentFilterClass, currentFilterExam, currentFilterGroup, currentFilterSection, currentSubjFormat) {
    const targetClass = normalizeClassName(currentFilterClass);
    const isSeniorClass = ['Ten', 'Nine'].includes(targetClass);
    const activeExam = (currentFilterExam || 'all').trim();
    const activeExamLower = activeExam.toLowerCase();

    let examSubjects = [];
    const seenKeys = new Set();

    const addExamSub = (name, nameBn, code, isOpt, sec) => {
        if (!name && !nameBn) return;
        const cleanName = (name || nameBn || '').trim();
        const cleanBn = (nameBn || name || '').trim();
        const key = (code ? code.toString().trim() : '') || cleanName.toLowerCase();
        if (seenKeys.has(key)) return;
        seenKeys.add(key);
        examSubjects.push({
            name: cleanName,
            nameBn: cleanBn,
            code: code ? code.toString().trim() : '',
            isOptional: !!isOpt,
            section: sec || 'All'
        });
    };

    if (activeExamLower !== 'all') {
        schedules.forEach(s => {
            if (!s) return;
            const sTerm = (s.term || s.examName || '').trim().toLowerCase();
            if (sTerm !== activeExamLower) return;
            if (normalizeClassName(s.class) !== targetClass) return;
            const parsed = parseCombinedSubName(s.subject || '');
            addExamSub(parsed.nameEn, parsed.nameBn, s.code || s.subjectCode, s.isOptional, s.section);
        });

        routines.forEach(r => {
            if (!r) return;
            const rExam = (r.examName || '').trim().toLowerCase();
            if (rExam !== activeExamLower) return;
            const rClass = (r.class || r.className || '').trim();
            if (normalizeClassName(rClass) !== targetClass) return;
            if (isSeniorClass && currentFilterGroup && currentFilterGroup !== 'all') {
                const rClassLower = rClass.toLowerCase();
                if (currentFilterGroup === 'science' && !rClassLower.includes('বিজ্ঞান') && !rClassLower.includes('science')) return;
                if (currentFilterGroup === 'humanities' && !rClassLower.includes('মানবিক') && !rClassLower.includes('arts')) return;
                if (currentFilterGroup === 'business' && !rClassLower.includes('ব্যবসায়') && !rClassLower.includes('commerce')) return;
            }
            const parsed = parseCombinedSubName(r.subject || r.subjectName || '');
            addExamSub(parsed.nameEn, parsed.nameBn, r.code || r.subjectCode, r.isOptional, r.section || r.dept);
        });

        omrExams.forEach(o => {
            if (!o) return;
            const oExam = (o.examName || '').trim().toLowerCase();
            if (oExam !== activeExamLower) return;
            if (normalizeClassName(o.class) !== targetClass) return;
            const parsed = parseCombinedSubName(o.subject || '');
            addExamSub(parsed.nameEn, parsed.nameBn, o.code, o.isOptional, o.section);
        });
    }

    let classSubjects = subjectsMap[targetClass] || subjectsMap[currentFilterClass] || [];
    if (!Array.isArray(classSubjects)) classSubjects = [];

    let activeSubs = [];
    if (examSubjects.length > 0) {
        activeSubs = [...examSubjects];
        classSubjects.forEach(cs => {
            const csCode = (cs.code || '').toString().trim();
            const csName = (cs.name || '').trim().toLowerCase();
            const csNameBn = (cs.nameBn || '').trim().toLowerCase();
            const exists = activeSubs.some(es => 
                (csCode && es.code && es.code === csCode) ||
                (csName && (es.name.toLowerCase() === csName || es.nameBn.toLowerCase() === csName)) ||
                (csNameBn && (es.nameBn.toLowerCase() === csNameBn || es.name.toLowerCase() === csNameBn))
            );
            if (!exists) activeSubs.push(cs);
        });
    } else {
        activeSubs = [...classSubjects];
    }

    const dynamicSubjectMap = {
        "bn": {
            "full": {
                "bangla": "বাংলা", "bangla1": "বাংলা ১ম", "bangla2": "বাংলা ২য়",
                "english": "English", "english1": "English 1st", "english2": "English 2nd",
                "math": "গণিত", "bgs": "বাংলাদেশ ও বিশ্বপরিচয়", "chem": isSeniorClass ? "রসায়ন" : "বিজ্ঞান",
                "phys": isSeniorClass ? "পদার্থ" : "-", "bio": isSeniorClass ? "জীববিজ্ঞান" : "-", "rel": "ধর্ম",
                "ict": "তথ্য ও যোগাযোগ প্রযুক্তি", "agri": isSeniorClass ? "কৃষি/উচ্চতর" : "কৃষি শিক্ষা"
            },
            "short": {
                "bangla": "বাংলা", "bangla1": "বাং ১ম", "bangla2": "বাং ২য়",
                "english": "English", "english1": "ইং ১ম", "english2": "ইং ২য়",
                "math": "গণিত", "bgs": "বা.বি.প", "chem": isSeniorClass ? "রসা" : "বিজ্ঞান",
                "phys": isSeniorClass ? "পদা" : "-", "bio": isSeniorClass ? "জীব" : "-", "rel": "ধর্ম",
                "ict": "আইসিটি", "agri": isSeniorClass ? "কৃ/উ" : "কৃষি"
            }
        },
        "en": {
            "full": {
                "bangla": "Bangla", "bangla1": "Bangla 1st", "bangla2": "Bangla 2nd",
                "english": "English", "english1": "English 1st", "english2": "English 2nd",
                "math": "Mathematics", "bgs": "BGS", "chem": isSeniorClass ? "Chemistry" : "Science",
                "phys": isSeniorClass ? "Physics" : "-", "bio": isSeniorClass ? "Biology" : "-", "rel": "Religion",
                "ict": "ICT", "agri": isSeniorClass ? "Agri/Higher" : "Agriculture"
            },
            "short": {
                "bangla": "BAN", "bangla1": "BAN 1st", "bangla2": "BAN 2nd",
                "english": "ENG", "english1": "ENG 1st", "english2": "ENG 2nd",
                "math": "MAT", "bgs": "BGS", "chem": isSeniorClass ? "CHE" : "SCI",
                "phys": isSeniorClass ? "PHY" : "-", "bio": isSeniorClass ? "BIO" : "-", "rel": "REL",
                "ict": "ICT", "agri": isSeniorClass ? "AGR/HM" : "AGRI"
            }
        }
    };

    const usedCodes = new Set();
    const slotAssignments = {};
    const assignSlot = (slotKey, s) => {
        if (!s || slotAssignments[slotKey]) return;
        slotAssignments[slotKey] = s;
        if (s.code) usedCodes.add(s.code.toString().trim());

        const nameEn = (s.name || '').trim();
        const nameBn = (s.nameBn || s.name || '').trim();
        const shortEn = (s.shortName || s.name || '').trim();
        const shortBn = (s.shortName || s.nameBn || s.name || '').trim();

        if (nameEn) dynamicSubjectMap.en.full[slotKey] = nameEn;
        if (nameBn) dynamicSubjectMap.bn.full[slotKey] = nameBn;
        if (shortEn) dynamicSubjectMap.en.short[slotKey] = shortEn;
        if (shortBn) dynamicSubjectMap.bn.short[slotKey] = shortBn;
    };

    let islamSub = null, hinduSub = null;
    let higherMathSub = null, agriSub = null;

    activeSubs.forEach(s => {
        const code = (s.code || '').toString().trim();
        const comb = ((s.name || '') + ' ' + (s.nameBn || '')).toLowerCase();

        if (code === '110' || code === '111' || /islam|hindu|religion|ধর্ম|নৈতিক/i.test(comb)) {
            if (code === '110' || /islam|ইসলাম/i.test(comb)) islamSub = s;
            if (code === '111' || /hindu|হিন্দু/i.test(comb)) hinduSub = s;
            return;
        }

        if (code === '505' || code === '109' || s.isOptional || /higher.*math|agri|উচ্চতর.*গণিত|কৃষি/i.test(comb)) {
            if (code === '505' || /higher.*math|উচ্চতর.*গণিত/i.test(comb)) higherMathSub = s;
            if (code === '109' || /agri|কৃষি/i.test(comb)) agriSub = s;
            return;
        }

        if (code === '101' || /bangla.*1|bangla.*sahitya|বাংলা.*১|বাংলা.*সাহিত্য/i.test(comb)) {
            assignSlot('bangla1', s);
        } else if (code === '102' || /bangla.*2|byakaran|nirmiti|বাংলা.*২|ব্যাকরণ|নির্মিতি/i.test(comb)) {
            assignSlot('bangla2', s);
        } else if (code === '103' || /english.*1|english.*today|ইংরেজি.*১/i.test(comb)) {
            assignSlot('english1', s);
        } else if (code === '104' || /english.*2|grammar|composition|ইংরেজি.*২|গ্রামার/i.test(comb)) {
            assignSlot('english2', s);
        } else if ((code === '105' || /math|গণিত/i.test(comb)) && !/higher|উচ্চতর/i.test(comb) && !s.isOptional) {
            assignSlot('math', s);
        } else if (code === '107' || /bgs|bangladesh.*global|বাংলাদেশ.*বিশ্ব/i.test(comb)) {
            assignSlot('bgs', s);
        } else if (code === '1111' || /physics|পদার্থ/i.test(comb)) {
            assignSlot('phys', s);
        } else if (code === '135' || /chemistry|রসায়ন/i.test(comb)) {
            assignSlot('chem', s);
        } else if (code === '180' || /biology|জীববিজ্ঞান/i.test(comb)) {
            assignSlot('bio', s);
        } else if ((code === '108' || /science|বিজ্ঞান/i.test(comb)) && (!isSeniorClass || currentFilterGroup !== 'science')) {
            assignSlot('chem', s);
        } else if (code === '106' || /ict|information.*tech|তথ্য.*যোগাযোগ/i.test(comb)) {
            assignSlot('ict', s);
        }
    });

    if (islamSub || hinduSub) {
        assignSlot('rel', islamSub || hinduSub);
    }
    if (higherMathSub || agriSub) {
        assignSlot('agri', higherMathSub || agriSub);
    }

    return dynamicSubjectMap;
}

console.log("\n=== Test dynamicSubjectMap for Eight + Elegileble test ===");
const map1 = buildDynamicSubjectMap('Eight', 'Elegileble test', 'all', 'all');
console.log("Bengali Full:", map1.bn.full);
console.log("English Full:", map1.en.full);

console.log("\n=== Test dynamicSubjectMap for Six + বার্ষিক পরীক্ষা ===");
const map2 = buildDynamicSubjectMap('Six', 'বার্ষিক পরীক্ষা', 'all', 'all');
console.log("Bengali Full:", map2.bn.full);

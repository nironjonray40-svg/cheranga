const fs = require('fs');

const schedules = JSON.parse(fs.readFileSync('scratch/exam_schedules.json', 'utf8'));
const subjects = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'))['school_subjects'];

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

function normalizeClassName(cls) {
    if (!cls || cls === 'all') cls = 'Ten';
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

function resolveSubjectBilingual(rawStr, subCode, classSubs, currentLang) {
    if (!rawStr && !subCode) return null;
    const cleanRaw = (rawStr || '').trim();
    const cleanLower = cleanRaw.toLowerCase();
    const codeStr = (subCode || '').toString().trim();

    // 1. Try to find match in classSubjects
    if (Array.isArray(classSubs)) {
        const found = classSubs.find(cs => {
            if (!cs) return false;
            const csCode = (cs.code || '').toString().trim();
            const csName = (cs.name || '').trim().toLowerCase();
            const csBn = (cs.nameBn || '').trim().toLowerCase();
            const csShort = (cs.shortName || '').trim().toLowerCase();
            if (codeStr && csCode && csCode === codeStr) return true;
            if (cleanLower && (csName === cleanLower || csBn === cleanLower || csShort === cleanLower)) return true;
            return false;
        });
        if (found) {
            return {
                name: (found.name || cleanRaw).trim(),
                nameBn: (found.nameBn || cleanRaw).trim(),
                shortName: (found.shortName || '').trim(),
                shortEn: (found.shortName || '').trim(),
                shortBn: (found.shortName || '').trim(),
                code: (found.code || codeStr).toString().trim(),
                isOptional: !!found.isOptional,
                section: found.section || 'All'
            };
        }
    }

    // 2. Check standard curriculum dictionary
    const dict = [
        { regex: /bangla.*1|bangla.*sahitya|বাংলা.*১|বাংলা.*সাহিত্য/i, name: 'Bangla 1st Paper', nameBn: 'বাংলা ১ম পত্র', shortEn: 'BAN 1st', shortBn: 'বাং ১ম', code: '101' },
        { regex: /bangla.*2|byakaran|nirmiti|বাংলা.*২|ব্যাকরণ|নির্মিতি/i, name: 'Bangla 2nd Paper', nameBn: 'বাংলা ২য় পত্র', shortEn: 'BAN 2nd', shortBn: 'বাং ২য়', code: '102' },
        { regex: /english.*1|english.*today|ইংরেজি.*১/i, name: 'English 1st Paper', nameBn: 'ইংরেজি ১ম পত্র', shortEn: 'ENG 1st', shortBn: 'ইং ১ম', code: '103' },
        { regex: /english.*2|grammar|composition|ইংরেজি.*২|গ্রামার/i, name: 'English 2nd Paper', nameBn: 'ইংরেজি ২য় পত্র', shortEn: 'ENG 2nd', shortBn: 'ইং ২য়', code: '104' },
        { regex: /(general\s*)?math(ematics)?|গণিত|সাধারণ গণিত/i, notRegex: /higher|উচ্চতর/i, name: 'Mathematics', nameBn: 'সাধারণ গণিত', shortEn: 'MAT', shortBn: 'গণিত', code: '105' },
        { regex: /higher.*math|উচ্চতর.*গণিত/i, name: 'Higher Mathematics', nameBn: 'উচ্চতর গণিত', shortEn: 'H.MATH', shortBn: 'উ/গণিত', code: '505', isOptional: true },
        { regex: /bgs|bangladesh.*global|বাংলাদেশ.*বিশ্ব/i, name: 'Bangladesh And Global Studies', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', shortEn: 'BGS', shortBn: 'বা.বি.প', code: '107' },
        { regex: /physics|পদার্থ/i, name: 'Physics', nameBn: 'পদার্থবিজ্ঞান', shortEn: 'PHY', shortBn: 'পদা', code: '1111' },
        { regex: /chemistry|রসায়ন/i, name: 'Chemistry', nameBn: 'রসায়ন', shortEn: 'CHE', shortBn: 'রসা', code: '135' },
        { regex: /biology|জীববিজ্ঞান/i, name: 'Biology', nameBn: 'জীববিজ্ঞান', shortEn: 'BIO', shortBn: 'জীব', code: '180' },
        { regex: /general.*science|science|বিজ্ঞান|সাধারণ বিজ্ঞান/i, name: 'Science', nameBn: 'বিজ্ঞান', shortEn: 'SCI', shortBn: 'বিজ্ঞান', code: '108' },
        { regex: /ict|information.*tech|তথ্য.*যোগাযোগ|আইসিটি/i, name: 'ICT', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', shortEn: 'ICT', shortBn: 'আইসিটি', code: '106' },
        { regex: /islam|ইসলাম/i, name: 'Islam Studies', nameBn: 'ইসলাম ও নৈতিক শিক্ষা', shortEn: 'ISL', shortBn: 'ইসলাম', code: '110' },
        { regex: /hindu|হিন্দু/i, name: 'Hindu Studies', nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', shortEn: 'HIN', shortBn: 'হিন্দু', code: '111' },
        { regex: /religion|ধর্ম/i, name: 'Religion', nameBn: 'ধর্ম ও নৈতিক শিক্ষা', shortEn: 'REL', shortBn: 'ধর্ম', code: '110' },
        { regex: /agri|কৃষি/i, name: 'Agriculture Studies', nameBn: 'কৃষি শিক্ষা', shortEn: 'AGRI', shortBn: 'কৃষি', code: '109', isOptional: true }
    ];

    for (const item of dict) {
        if (item.notRegex && item.notRegex.test(cleanLower)) continue;
        if (item.regex.test(cleanLower) || (codeStr && item.code === codeStr)) {
            return {
                name: item.name,
                nameBn: item.nameBn,
                shortName: (currentLang === 'en' ? item.shortEn : item.shortBn),
                shortEn: item.shortEn,
                shortBn: item.shortBn,
                code: item.code,
                isOptional: !!item.isOptional,
                section: 'All'
            };
        }
    }

    // Fallback: Custom Subject entered in Exam List
    const parsed = parseCombinedSubName(cleanRaw);
    return {
        name: parsed.nameEn || cleanRaw,
        nameBn: parsed.nameBn || cleanRaw,
        shortName: cleanRaw.slice(0, 8),
        shortEn: cleanRaw.slice(0, 8),
        shortBn: cleanRaw.slice(0, 8),
        code: codeStr,
        isOptional: false,
        section: 'All'
    };
}

function testRun(currentFilterClass, currentFilterExam, currentLang, currentSubjFormat) {
    let subjectsMap = subjects;
    const targetClass = normalizeClassName(currentFilterClass);
    const isSeniorClass = ['Ten', 'Nine'].includes(targetClass);
    const activeExam = (currentFilterExam || 'all').trim();
    const activeExamLower = activeExam.toLowerCase();

    // Baseline class subjects
    let classSubjects = subjectsMap[targetClass] || subjectsMap[currentFilterClass] || [];
    if (!Array.isArray(classSubjects) || classSubjects.length === 0) {
        for (const k of Object.keys(subjectsMap)) {
            if (normalizeClassName(k) === targetClass || k.toLowerCase() === targetClass.toLowerCase()) {
                classSubjects = subjectsMap[k];
                break;
            }
        }
    }
    if (!Array.isArray(classSubjects)) classSubjects = [];

    // Gather subjects from Exam List (school_exam_schedules)
    let examSubjects = [];
    const seenExamSubKeys = new Set();

    if (activeExamLower !== 'all') {
        schedules.forEach(s => {
            if (!s) return;
            const sTerm = (s.term || s.examName || '').trim();
            if (!isExamMatch(sTerm, activeExam) && sTerm.toLowerCase() !== activeExamLower) return;
            if (normalizeClassName(s.class) !== targetClass) return;

            const res = resolveSubjectBilingual(s.subject, s.code || s.subjectCode, classSubjects, currentLang);
            if (!res) return;
            const key = (res.code ? res.code : '') || res.name.toLowerCase();
            if (seenExamSubKeys.has(key)) return;
            seenExamSubKeys.add(key);
            examSubjects.push(res);
        });
    }

    // Merge: Exam List subjects take top priority
    let activeSubs = [];
    if (examSubjects.length > 0) {
        activeSubs = [...examSubjects];
        classSubjects.forEach(cs => {
            const csCode = (cs.code || '').toString().trim();
            const csName = (cs.name || '').trim().toLowerCase();
            const csNameBn = (cs.nameBn || '').trim().toLowerCase();
            const alreadyPresent = activeSubs.some(es =>
                (csCode && es.code && es.code === csCode) ||
                (csName && (es.name.toLowerCase() === csName || es.nameBn.toLowerCase() === csName)) ||
                (csNameBn && (es.nameBn.toLowerCase() === csNameBn || es.name.toLowerCase() === csNameBn))
            );
            if (!alreadyPresent) {
                const res = resolveSubjectBilingual(cs.name || cs.nameBn, cs.code, classSubjects, currentLang);
                if (res) activeSubs.push(res);
            }
        });
    } else {
        classSubjects.forEach(cs => {
            const res = resolveSubjectBilingual(cs.name || cs.nameBn, cs.code, classSubjects, currentLang);
            if (res) activeSubs.push(res);
        });
    }

    const dynamicSubjectMap = {
        "bn": {
            "full": {
                "bangla": "বাংলা", "bangla1": "বাংলা ১ম পত্র", "bangla2": "বাংলা ২য় পত্র",
                "english": "ইংরেজি", "english1": "ইংরেজি ১ম পত্র", "english2": "ইংরেজি ২য় পত্র",
                "math": "গণিত", "bgs": "বাংলাদেশ ও বিশ্বপরিচয়", "chem": isSeniorClass ? "রসায়ন" : "বিজ্ঞান",
                "phys": isSeniorClass ? "পদার্থ" : "-", "bio": isSeniorClass ? "জীববিজ্ঞান" : "-", "rel": "ধর্ম",
                "ict": "তথ্য ও যোগাযোগ প্রযুক্তি", "agri": isSeniorClass ? "কৃষি/উচ্চতর" : "কৃষি শিক্ষা"
            },
            "short": {
                "bangla": "বাংলা", "bangla1": "বাং ১ম", "bangla2": "বাং ২য়",
                "english": "ইং", "english1": "ইং ১ম", "english2": "ইং ২য়",
                "math": "গণিত", "bgs": "বা.বি.প", "chem": isSeniorClass ? "রসা" : "বিজ্ঞান",
                "phys": isSeniorClass ? "পদা" : "-", "bio": isSeniorClass ? "জীব" : "-", "rel": "ধর্ম",
                "ict": "আইসিটি", "agri": isSeniorClass ? "কৃ/উ" : "কৃষি"
            }
        },
        "en": {
            "full": {
                "bangla": "Bangla", "bangla1": "Bangla 1st Paper", "bangla2": "Bangla 2nd Paper",
                "english": "English", "english1": "English 1st Paper", "english2": "English 2nd Paper",
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

    const slotAssignments = {};
    const assignedSubKeys = new Set();
    let hasIslam = false, hasHindu = false, islamSub = null, hinduSub = null;
    let hasHigherMath = false, hasAgri = false, higherMathSub = null, agriSub = null;

    const assignSlot = (slotKey, s) => {
        if (!s || slotAssignments[slotKey]) return;
        slotAssignments[slotKey] = s;
        const subKey = (s.code ? s.code.toString().trim() : '') || (s.name || '').toLowerCase();
        if (subKey) assignedSubKeys.add(subKey);

        const nameEn = (s.name || '').trim();
        const nameBn = (s.nameBn || s.name || '').trim();
        const shortEn = (s.shortEn || s.shortName || s.name || '').trim();
        const shortBn = (s.shortBn || s.shortName || s.nameBn || s.name || '').trim();

        if (nameEn) dynamicSubjectMap.en.full[slotKey] = nameEn;
        if (nameBn) dynamicSubjectMap.bn.full[slotKey] = nameBn;
        if (shortEn) dynamicSubjectMap.en.short[slotKey] = shortEn;
        if (shortBn) dynamicSubjectMap.bn.short[slotKey] = shortBn;
    };

    activeSubs.forEach(s => {
        const code = (s.code || '').toString().trim();
        const name = (s.name || '').trim();
        const nameBn = (s.nameBn || '').trim();
        const comb = (name + ' ' + nameBn).toLowerCase();

        // Religion
        if (code === '110' || code === '111' || /islam|hindu|religion|ধর্ম|নৈতিক/i.test(comb)) {
            if (code === '110' || /islam|ইসলাম/i.test(comb)) { hasIslam = true; islamSub = s; }
            if (code === '111' || /hindu|হিন্দু/i.test(comb)) { hasHindu = true; hinduSub = s; }
            const subKey = (code ? code : '') || name.toLowerCase();
            if (subKey) assignedSubKeys.add(subKey);
            return;
        }

        // 4th / Optional
        if (code === '505' || code === '109' || s.isOptional || /higher.*math|agri|উচ্চতর.*গণিত|কৃষি/i.test(comb)) {
            if (code === '505' || /higher.*math|উচ্চতর.*গণিত/i.test(comb)) { hasHigherMath = true; higherMathSub = s; }
            if (code === '109' || /agri|কৃষি/i.test(comb)) { hasAgri = true; agriSub = s; }
            const subKey = (code ? code : '') || name.toLowerCase();
            if (subKey) assignedSubKeys.add(subKey);
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
        } else if ((code === '108' || /science|বিজ্ঞান/i.test(comb)) && (!isSeniorClass)) {
            assignSlot('chem', s);
        } else if (code === '106' || /ict|information.*tech|তথ্য.*যোগাযোগ/i.test(comb)) {
            assignSlot('ict', s);
        }
    });

    if (hasIslam || hasHindu) {
        slotAssignments['rel'] = islamSub || hinduSub;
        if (hasIslam && hasHindu && islamSub && hinduSub) {
            dynamicSubjectMap.bn.full['rel'] = "ধর্ম (ইসলাম/হিন্দু)";
            dynamicSubjectMap.en.full['rel'] = "Religion (Islam/Hindu)";
            dynamicSubjectMap.bn.short['rel'] = "ধর্ম";
            dynamicSubjectMap.en.short['rel'] = "REL";
        } else {
            const single = islamSub || hinduSub;
            dynamicSubjectMap.bn.full['rel'] = single.nameBn || "ধর্ম";
            dynamicSubjectMap.en.full['rel'] = single.name || "Religion";
            dynamicSubjectMap.bn.short['rel'] = single.shortBn || "ধর্ম";
            dynamicSubjectMap.en.short['rel'] = single.shortEn || "REL";
        }
    }

    if (hasHigherMath || hasAgri) {
        slotAssignments['agri'] = higherMathSub || agriSub;
        if (hasHigherMath && hasAgri && higherMathSub && agriSub) {
            dynamicSubjectMap.bn.full['agri'] = "কৃষি/উচ্চতর";
            dynamicSubjectMap.en.full['agri'] = "Agri/Higher";
            dynamicSubjectMap.bn.short['agri'] = "কৃ/উ";
            dynamicSubjectMap.en.short['agri'] = "AGR/HM";
        } else {
            const single = higherMathSub || agriSub;
            dynamicSubjectMap.bn.full['agri'] = single.nameBn || (isSeniorClass ? "কৃষি/উচ্চতর" : "কৃষি শিক্ষা");
            dynamicSubjectMap.en.full['agri'] = single.name || (isSeniorClass ? "Agri/Higher" : "Agriculture");
            dynamicSubjectMap.bn.short['agri'] = single.shortBn || (isSeniorClass ? "কৃ/উ" : "কৃষি");
            dynamicSubjectMap.en.short['agri'] = single.shortEn || (isSeniorClass ? "AGR/HM" : "AGRI");
        }
    }

    // Remaining unassigned subjects into empty slots
    const remainingSubs = activeSubs.filter(s => {
        const subKey = (s.code ? s.code.toString().trim() : '') || (s.name || '').toLowerCase();
        return !assignedSubKeys.has(subKey);
    });
    const candidateSlots = isSeniorClass ? ['chem', 'phys', 'bio', 'bgs', 'agri'] : ['chem', 'bgs', 'agri'];
    candidateSlots.forEach(slotKey => {
        if (!slotAssignments[slotKey] && remainingSubs.length > 0) {
            assignSlot(slotKey, remainingSubs.shift());
        }
    });

    console.log(`\n=== RESULTS: Class: ${currentFilterClass}, Exam: ${currentFilterExam}, Lang: ${currentLang}, Fmt: ${currentSubjFormat} ===`);
    ['bangla', 'english', 'math', 'bgs', 'chem', 'phys', 'bio', 'rel', 'ict', 'agri', 'bangla1', 'bangla2', 'english1', 'english2'].forEach(slot => {
        console.log(`  ${slot.padEnd(10)}: ${dynamicSubjectMap[currentLang][currentSubjFormat][slot]}`);
    });
}

testRun('Eight', 'Elegileble test', 'bn', 'full');
testRun('Eight', 'Elegileble test', 'en', 'full');
testRun('Eight', 'Elegileble test', 'bn', 'short');
testRun('Six', 'বার্ষিক পরীক্ষা', 'bn', 'full');
testRun('Ten', 'বার্ষিক পরীক্ষা', 'bn', 'full');

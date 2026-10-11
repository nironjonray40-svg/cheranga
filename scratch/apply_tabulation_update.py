import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update updateSubjects()
start_marker = "function updateSubjects() {"
end_marker = "function changeSubjectFormat(format) {"

idx_start = content.find(start_marker)
idx_end = content.find(end_marker)

if idx_start == -1 or idx_end == -1:
    print("Error: Could not locate updateSubjects boundaries!")
    sys.exit(1)

new_update_subjects = """function updateSubjects() {
            let subjectsMap = {};
            let schedules = [];
            let routines = [];
            let omrExams = [];
            try {
                subjectsMap = JSON.parse(localStorage.getItem('school_subjects') || '{}');
            } catch (e) { }
            try {
                schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]');
            } catch (e) { }
            try {
                routines = JSON.parse(localStorage.getItem('school_exam_routines') || '[]');
            } catch (e) { }
            try {
                omrExams = JSON.parse(localStorage.getItem('school_omr_exams') || '[]');
            } catch (e) { }

            function normalizeClassName(cls) {
                if (!cls || cls === 'all') {
                    const classSelect = document.getElementById('class-filter');
                    if (classSelect && classSelect.value && classSelect.value !== 'all') {
                        cls = classSelect.value;
                    }
                    if (!cls || cls === 'all') cls = 'Ten';
                }
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

            const targetClass = normalizeClassName(currentFilterClass);
            const isSeniorClass = ['Ten', 'Nine'].includes(targetClass);

            const activeExam = (currentFilterExam || document.getElementById('exam-filter')?.value || 'all').trim();
            const activeExamLower = activeExam.toLowerCase();

            // Helper to clean and split combined English/Bengali names like "ইংরেজি ১ম পত্র (English For Today)"
            const parseCombinedSubName = (rawStr) => {
                let nameEn = (rawStr || '').trim();
                let nameBn = (rawStr || '').trim();
                const m = (rawStr || '').match(/^([^(]+)\\s*\\(([^)]+)\\)$/);
                if (m) {
                    const p1 = m[1].trim();
                    const p2 = m[2].trim();
                    if (/[\\u0980-\\u09FF]/.test(p1)) {
                        nameBn = p1;
                        nameEn = p2;
                    } else {
                        nameEn = p1;
                        nameBn = p2;
                    }
                }
                return { nameEn, nameBn };
            };

            // 1. Gather subjects specifically configured for this Exam & Class from Exam Portal schedules, routines, and OMR
            let examSubjects = [];
            const seenExamSubKeys = new Set();

            const addExamSub = (name, nameBn, code, isOpt, sec) => {
                if (!name && !nameBn) return;
                const cleanName = (name || nameBn || '').trim();
                const cleanBn = (nameBn || name || '').trim();
                const key = (code ? code.toString().trim() : '') || cleanName.toLowerCase();
                if (seenExamSubKeys.has(key)) return;
                seenExamSubKeys.add(key);
                examSubjects.push({
                    name: cleanName,
                    nameBn: cleanBn,
                    shortName: '',
                    code: code ? code.toString().trim() : '',
                    isOptional: !!isOpt,
                    section: sec || 'All'
                });
            };

            if (activeExamLower !== 'all') {
                // A. Check school_exam_schedules
                if (Array.isArray(schedules)) {
                    schedules.forEach(s => {
                        if (!s) return;
                        const sTerm = (s.term || s.examName || '').trim().toLowerCase();
                        if (sTerm !== activeExamLower) return;
                        if (normalizeClassName(s.class) !== targetClass) return;
                        const parsed = parseCombinedSubName(s.subject || '');
                        addExamSub(parsed.nameEn, parsed.nameBn, s.code || s.subjectCode, s.isOptional, s.section);
                    });
                }

                // B. Check school_exam_routines
                if (Array.isArray(routines)) {
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
                }

                // C. Check school_omr_exams
                if (Array.isArray(omrExams)) {
                    omrExams.forEach(o => {
                        if (!o) return;
                        const oExam = (o.examName || '').trim().toLowerCase();
                        if (oExam !== activeExamLower) return;
                        if (normalizeClassName(o.class) !== targetClass) return;
                        const parsed = parseCombinedSubName(o.subject || '');
                        addExamSub(parsed.nameEn, parsed.nameBn, o.code, o.isOptional, o.section);
                    });
                }
            }

            // D. Load class baseline subjects from school_subjects
            let classSubjects = subjectsMap[targetClass] || subjectsMap[currentFilterClass];
            if (!classSubjects || !Array.isArray(classSubjects) || classSubjects.length === 0) {
                for (const k of Object.keys(subjectsMap)) {
                    if (normalizeClassName(k) === targetClass || k.toLowerCase() === targetClass.toLowerCase()) {
                        classSubjects = subjectsMap[k];
                        break;
                    }
                }
            }
            if (!Array.isArray(classSubjects)) classSubjects = [];

            // Merge exam subjects with baseline
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
                        activeSubs.push(cs);
                    }
                });
            } else {
                activeSubs = [...classSubjects];
            }

            // Filter subjects by section / group
            let filteredSubs = [];
            if (activeSubs.length > 0) {
                activeSubs.forEach(s => {
                    const sec = (s.section || 'All').toString().trim();
                    if (sec === 'All' || sec === 'all' || sec === '') {
                        filteredSubs.push(s);
                    } else if (isSeniorClass) {
                        const secLower = sec.toLowerCase();
                        if (currentFilterGroup === 'all') {
                            filteredSubs.push(s);
                        } else if (currentFilterGroup === 'science' && (secLower.includes('বিজ্ঞান') || secLower.includes('science') || secLower.includes('a'))) {
                            filteredSubs.push(s);
                        } else if (currentFilterGroup === 'humanities' && (secLower.includes('মানবিক') || secLower.includes('humanities') || secLower.includes('arts') || secLower.includes('b'))) {
                            filteredSubs.push(s);
                        } else if (currentFilterGroup === 'business' && (secLower.includes('ব্যবসায়') || secLower.includes('business') || secLower.includes('commerce') || secLower.includes('c'))) {
                            filteredSubs.push(s);
                        }
                    } else {
                        if (currentFilterSection === 'all' || sec.toUpperCase().includes(currentFilterSection.toUpperCase())) {
                            filteredSubs.push(s);
                        }
                    }
                });
            }
            if (filteredSubs.length > 0) activeSubs = filteredSubs;

            // Defaults fallback
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
            activeClassSlotMap = {};
            let hasIslam = false;
            let hasHindu = false;
            let islamSub = null;
            let hinduSub = null;

            let hasHigherMath = false;
            let hasAgri = false;
            let higherMathSub = null;
            let agriSub = null;

            const assignSlot = (slotKey, s) => {
                if (!s || slotAssignments[slotKey]) return;
                slotAssignments[slotKey] = s;
                if (s.code) {
                    const cStr = s.code.toString().trim();
                    usedCodes.add(cStr);
                    activeClassSlotMap[cStr] = slotKey;
                }
                if (s.name) activeClassSlotMap[s.name.trim().toLowerCase()] = slotKey;
                if (s.nameBn) activeClassSlotMap[s.nameBn.trim().toLowerCase()] = slotKey;
                if (s.shortName) activeClassSlotMap[s.shortName.trim().toLowerCase()] = slotKey;

                const nameEn = (s.name || '').trim();
                const nameBn = (s.nameBn || s.name || '').trim();
                const shortEn = (s.shortName || s.name || '').trim();
                const shortBn = (s.shortName || s.nameBn || s.name || '').trim();

                if (nameEn) dynamicSubjectMap.en.full[slotKey] = nameEn;
                if (nameBn) dynamicSubjectMap.bn.full[slotKey] = nameBn;
                if (shortEn) dynamicSubjectMap.en.short[slotKey] = shortEn;
                if (shortBn) dynamicSubjectMap.bn.short[slotKey] = shortBn;
            };

            if (activeSubs.length > 0) {
                activeSubs.forEach(s => {
                    const code = (s.code || '').toString().trim();
                    const name = (s.name || '').trim();
                    const nameBn = (s.nameBn || '').trim();
                    const comb = (name + ' ' + nameBn).toLowerCase();

                    // Combined Religion check (Islam + Hindu mixed in single column)
                    if (code === '110' || code === '111' || /islam|hindu|religion|ধর্ম|নৈতিক/i.test(comb)) {
                        usedCodes.add(code);
                        usedCodes.add('110');
                        usedCodes.add('111');
                        if (code === '110' || /islam|ইসলাম/i.test(comb)) { hasIslam = true; islamSub = s; }
                        if (code === '111' || /hindu|হিন্দু/i.test(comb)) { hasHindu = true; hinduSub = s; }
                        return;
                    }

                    // Combined 4th / Optional Subject check (Higher Math + Agriculture mixed in single column)
                    if (code === '505' || code === '109' || s.isOptional || /higher.*math|agri|উচ্চতর.*গণিত|কৃষি/i.test(comb)) {
                        usedCodes.add(code);
                        usedCodes.add('505');
                        usedCodes.add('109');
                        if (code === '505' || /higher.*math|উচ্চতর.*গণিত/i.test(comb)) {
                            hasHigherMath = true;
                            higherMathSub = s;
                        }
                        if (code === '109' || /agri|কৃষি/i.test(comb)) {
                            hasAgri = true;
                            agriSub = s;
                        }
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

                // Assign combined Religion to 'rel' slot dynamically from All Subject
                if (hasIslam || hasHindu) {
                    slotAssignments['rel'] = islamSub || hinduSub;
                    if (islamSub) {
                        const ic = (islamSub.code || '110').toString().trim();
                        activeClassSlotMap[ic] = 'rel';
                        if (islamSub.name) activeClassSlotMap[islamSub.name.trim().toLowerCase()] = 'rel';
                        if (islamSub.nameBn) activeClassSlotMap[islamSub.nameBn.trim().toLowerCase()] = 'rel';
                    }
                    if (hinduSub) {
                        const hc = (hinduSub.code || '111').toString().trim();
                        activeClassSlotMap[hc] = 'rel';
                        if (hinduSub.name) activeClassSlotMap[hinduSub.name.trim().toLowerCase()] = 'rel';
                        if (hinduSub.nameBn) activeClassSlotMap[hinduSub.nameBn.trim().toLowerCase()] = 'rel';
                    }
                    
                    let relBn = "ধর্ম";
                    let relEn = "Religion";
                    let relShortBn = "ধর্ম";
                    let relShortEn = "REL";

                    if (hasIslam && hasHindu && islamSub && hinduSub) {
                        const iBn = (islamSub.nameBn || islamSub.name || '').trim();
                        const hBn = (hinduSub.nameBn || hinduSub.name || '').trim();
                        const iEn = (islamSub.name || '').trim();
                        const hEn = (hinduSub.name || '').trim();
                        const iShort = (islamSub.shortName || '').trim();
                        const hShort = (hinduSub.shortName || '').trim();

                        const cleanIBn = iBn.replace(/ ও নৈতিক শিক্ষা|ধর্ম| শিক্ষা/g, '').trim() || iBn;
                        const cleanHBn = hBn.replace(/ ও নৈতিক শিক্ষা|ধর্ম| শিক্ষা/g, '').trim() || hBn;
                        const cleanIEn = iEn.replace(/ Studies| Religion| Education/gi, '').trim() || iEn;
                        const cleanHEn = hEn.replace(/ Studies| Religion| Education/gi, '').trim() || hEn;

                        if (cleanIBn && cleanHBn && cleanIBn !== iBn) {
                            relBn = `ধর্ম (${cleanIBn}/${cleanHBn})`;
                        } else if (iBn && hBn) {
                            relBn = `${iBn} / ${hBn}`;
                        } else {
                            relBn = iBn || hBn || "ধর্ম (ইসলাম/হিন্দু)";
                        }

                        if (cleanIEn && cleanHEn && cleanIEn !== iEn) {
                            relEn = `Religion (${cleanIEn}/${cleanHEn})`;
                        } else if (iEn && hEn) {
                            relEn = `${iEn} / ${hEn}`;
                        } else {
                            relEn = iEn || hEn || "Religion (Islam/Hindu)";
                        }

                        if (iShort && hShort) {
                            relShortEn = `${iShort}/${hShort}`;
                            relShortBn = `${iShort}/${hShort}`;
                        } else if (iShort || hShort) {
                            relShortEn = iShort || hShort;
                            relShortBn = iShort || hShort;
                        }
                    } else {
                        const singleSub = islamSub || hinduSub;
                        if (singleSub) {
                            relBn = (singleSub.nameBn || singleSub.name || '').trim() || "ধর্ম";
                            relEn = (singleSub.name || singleSub.nameBn || '').trim() || "Religion";
                            relShortBn = (singleSub.shortName || singleSub.nameBn || '').trim() || "ধর্ম";
                            relShortEn = (singleSub.shortName || singleSub.name || '').trim() || "REL";
                        }
                    }

                    dynamicSubjectMap.bn.full['rel'] = relBn;
                    dynamicSubjectMap.en.full['rel'] = relEn;
                    dynamicSubjectMap.bn.short['rel'] = relShortBn;
                    dynamicSubjectMap.en.short['rel'] = relShortEn;
                }

                // Assign combined Higher Math / Agriculture to 'agri' slot dynamically from All Subject
                if (hasHigherMath || hasAgri) {
                    slotAssignments['agri'] = higherMathSub || agriSub;
                    if (higherMathSub) {
                        const mc = (higherMathSub.code || '505').toString().trim();
                        activeClassSlotMap[mc] = 'agri';
                        if (higherMathSub.name) activeClassSlotMap[higherMathSub.name.trim().toLowerCase()] = 'agri';
                        if (higherMathSub.nameBn) activeClassSlotMap[higherMathSub.nameBn.trim().toLowerCase()] = 'agri';
                    }
                    if (agriSub) {
                        const ac = (agriSub.code || '109').toString().trim();
                        activeClassSlotMap[ac] = 'agri';
                        if (agriSub.name) activeClassSlotMap[agriSub.name.trim().toLowerCase()] = 'agri';
                        if (agriSub.nameBn) activeClassSlotMap[agriSub.nameBn.trim().toLowerCase()] = 'agri';
                    }

                    let optBn = "কৃষি/উচ্চতর";
                    let optEn = "Agri/Higher";
                    let optShortBn = "কৃ/উ";
                    let optShortEn = "AGR/HM";

                    if (hasHigherMath && hasAgri && higherMathSub && agriSub) {
                        const mBn = (higherMathSub.nameBn || higherMathSub.name || '').trim();
                        const aBn = (agriSub.nameBn || agriSub.name || '').trim();
                        const mEn = (higherMathSub.name || '').trim();
                        const aEn = (agriSub.name || '').trim();
                        const mShort = (higherMathSub.shortName || '').trim();
                        const aShort = (agriSub.shortName || '').trim();

                        const cleanMBn = mBn.replace(/ গণিত/g, '').trim() || mBn;
                        const cleanABn = aBn.replace(/ শিক্ষা/g, '').trim() || aBn;
                        const cleanMEn = mEn.replace(/ Mathematics| Math/gi, '').trim() || mEn;
                        const cleanAEn = aEn.replace(/ Studies| Agriculture/gi, '').trim() || aEn;

                        if (cleanABn && cleanMBn && cleanABn !== aBn && cleanMBn !== mBn) {
                            optBn = `${cleanABn}/${cleanMBn}`;
                        } else if (aBn && mBn) {
                            optBn = `${aBn} / ${mBn}`;
                        } else {
                            optBn = aBn || mBn || "কৃষি/উচ্চতর";
                        }

                        if (cleanAEn && cleanMEn && cleanAEn !== aEn && cleanMEn !== mEn) {
                            optEn = `${cleanAEn}/${cleanMEn}`;
                        } else if (aEn && mEn) {
                            optEn = `${aEn} / ${mEn}`;
                        } else {
                            optEn = aEn || mEn || "Agri/Higher";
                        }

                        if (aShort && mShort) {
                            optShortEn = `${aShort}/${mShort}`;
                            optShortBn = `${aShort}/${mShort}`;
                        } else if (aShort || mShort) {
                            optShortEn = aShort || mShort;
                            optShortBn = aShort || mShort;
                        }
                    } else {
                        const singleOpt = higherMathSub || agriSub;
                        if (singleOpt) {
                            optBn = (singleOpt.nameBn || singleOpt.name || '').trim() || "কৃষি শিক্ষা";
                            optEn = (singleOpt.name || singleOpt.nameBn || '').trim() || "Agriculture";
                            optShortBn = (singleOpt.shortName || singleOpt.nameBn || '').trim() || "কৃষি";
                            optShortEn = (singleOpt.shortName || singleOpt.name || '').trim() || "AGRI";
                        }
                    }

                    dynamicSubjectMap.bn.full['agri'] = optBn;
                    dynamicSubjectMap.en.full['agri'] = optEn;
                    dynamicSubjectMap.bn.short['agri'] = optShortBn;
                    dynamicSubjectMap.en.short['agri'] = optShortEn;
                }

                // Assign any remaining unassigned subjects to empty department slots
                const remainingSubs = activeSubs.filter(s => !usedCodes.has((s.code || '').toString().trim()));
                ['chem', 'phys', 'bio', 'bgs', 'agri'].forEach(slotKey => {
                    if (!slotAssignments[slotKey] && remainingSubs.length > 0) {
                        assignSlot(slotKey, remainingSubs.shift());
                    }
                });
            }

            // Apply all mapped names to table header DOM elements
            const lang = (currentLang === 'en') ? 'en' : 'bn';
            const fmt = (currentSubjFormat === 'short') ? 'short' : 'full';

            document.querySelectorAll('thead th[data-subj]:not([data-col-type]):not([data-fullmark])').forEach(el => {
                let key = el.getAttribute('data-subj');
                if (!key) return;

                if (key === 'bangla') {
                    el.textContent = dynamicSubjectMap[lang]?.[fmt]?.['bangla'] || ((lang === 'en') ? 'Bangla' : 'বাংলা');
                    return;
                }
                if (key === 'english') {
                    el.textContent = dynamicSubjectMap[lang]?.[fmt]?.['english'] || 'English';
                    return;
                }

                if (dynamicSubjectMap[lang] && dynamicSubjectMap[lang][fmt] && dynamicSubjectMap[lang][fmt][key] !== undefined) {
                    el.textContent = dynamicSubjectMap[lang][fmt][key];
                }
            });
        }

        """

content = content[:idx_start] + new_update_subjects + content[idx_end:]

# 2. Update applyFilters()
start_af = "function applyFilters() {"
end_af = "function sortStudents(criteria) {"
idx_af_start = content.find(start_af)
idx_af_end = content.find(end_af)

if idx_af_start == -1 or idx_af_end == -1:
    print("Error: Could not locate applyFilters boundaries!")
    sys.exit(1)

new_apply_filters = """function applyFilters() {
            const valLower = (currentFilterClass || '').toLowerCase();
            const isJuniorClass = ['6', '7', '8', '6th', '7th', '8th', 'six', 'seven', 'eight', '৬ষ্ঠ', '৭ম', '৮ম', 'five', 'four', 'three', 'two', 'one', 'play', 'nursery', 'kg'].some(k => valLower.includes(k));
            const isSeniorClass = ['9', '10', '9th', '10th', 'nine', 'ten', '৯ম', '১০ম'].some(k => valLower.includes(k));

            // 1. Show/Hide section divider rows
            document.querySelectorAll('.section-divider-row').forEach(row => {
                const secName = row.getAttribute('data-section-name');
                const hasVisibleStudents = Array.from(document.querySelectorAll(`tbody tr[data-section="${secName}"][data-has-student="true"]`)).length > 0;
                if (!hasVisibleStudents) {
                    row.style.display = 'none';
                    return;
                }

                let rowGroup = (secName === 'A' ? 'science' : (secName === 'B' ? 'humanities' : (secName === 'C' ? 'business' : 'none')));
                if (isSeniorClass) {
                    if (rowGroup === 'none') {
                        row.style.display = 'none';
                    } else if (currentFilterGroup === 'all' || rowGroup === currentFilterGroup) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                } else {
                    if (currentFilterSection === 'all' || secName === currentFilterSection) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });

            // 2. Show/Hide student rows strictly matching assigned real students
            document.querySelectorAll('tbody tr[data-section]').forEach(row => {
                const hasStudent = row.getAttribute('data-has-student') === 'true';
                if (!hasStudent) {
                    row.style.display = 'none';
                    return;
                }

                const sec = row.getAttribute('data-section');
                let rowGroup = row.getAttribute('data-group') || (sec === 'A' ? 'science' : (sec === 'B' ? 'humanities' : (sec === 'C' ? 'business' : 'none')));

                if (isSeniorClass) {
                    if (currentFilterGroup === 'all' || rowGroup === currentFilterGroup) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                } else {
                    if (currentFilterSection === 'all' || sec === currentFilterSection) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });

            updateHeaderMeta();
            recalculateTableGradesAndRanks();
        }

        """

content = content[:idx_af_start] + new_apply_filters + content[idx_af_end:]

# 3. Update filterClass() and filterExam()
start_fc = "function filterClass(val) {"
end_fe = "function changePaperSize(size) {"
idx_fc_start = content.find(start_fc)
idx_fe_end = content.find(end_fe)

if idx_fc_start == -1 or idx_fe_end == -1:
    print("Error: Could not locate filterClass/filterExam boundaries!")
    sys.exit(1)

new_filter_class_exam = """function filterClass(val) {
            currentFilterClass = val;
            const filterEl = document.getElementById('class-filter');
            if (filterEl) filterEl.value = val;

            const secSelect = document.getElementById('section-filter');
            const groupSelect = document.getElementById('group-filter');
            const secControlGroup = secSelect ? secSelect.closest('.control-group') : null;
            const groupControlGroup = groupSelect ? groupSelect.closest('.control-group') : null;

            const valLower = (val || '').toLowerCase();
            const isJuniorClass = ['6', '7', '8', '6th', '7th', '8th', 'six', 'seven', 'eight', '৬ষ্ঠ', '৭ম', '৮ম'].some(k => valLower.includes(k));
            const isSeniorClass = ['9', '10', '9th', '10th', 'nine', 'ten', '৯ম', '১০ম'].some(k => valLower.includes(k));

            if (isJuniorClass) {
                if (!['A', 'B', 'C', 'D'].includes(currentFilterSection) || currentFilterSection === 'all') {
                    currentFilterSection = getDefaultSectionForClass(val);
                }
                currentFilterGroup = 'all';
                if (secControlGroup) secControlGroup.style.display = '';
                if (groupControlGroup) groupControlGroup.style.display = 'none';
            } else if (isSeniorClass) {
                if (!['science', 'humanities', 'business'].includes(currentFilterGroup) || currentFilterGroup === 'all') {
                    currentFilterGroup = getDefaultGroupForClass(val);
                }
                currentFilterSection = 'all';
                if (secControlGroup) secControlGroup.style.display = 'none';
                if (groupControlGroup) groupControlGroup.style.display = '';
            } else {
                if (!['A', 'B', 'C', 'D'].includes(currentFilterSection) || currentFilterSection === 'all') {
                    currentFilterSection = 'A';
                }
                if (!['science', 'humanities', 'business'].includes(currentFilterGroup) || currentFilterGroup === 'all') {
                    currentFilterGroup = 'science';
                }
                if (secControlGroup) secControlGroup.style.display = '';
                if (groupControlGroup) groupControlGroup.style.display = '';
            }

            if (groupSelect) groupSelect.value = currentFilterGroup;
            if (secSelect) secSelect.value = currentFilterSection;

            updateHeaderMeta();
            updateSubjects();
            syncStudentNamesFromDatabase();
            populateStudentMarksFromDatabase();
            applyTableSettings();
            recalculateTableGradesAndRanks();
            highlightFailures();

            const sortOrderEl = document.getElementById('sort-order');
            if (sortOrderEl) {
                sortStudents(sortOrderEl.value);
            } else {
                applyFilters();
            }
        }

        function filterExam(val) {
            currentFilterExam = val;
            const filterEl = document.getElementById('exam-filter');
            if (filterEl) filterEl.value = val;

            if (val && val !== 'all') {
                localStorage.setItem('school_active_exam_filter', val);
            }

            updateHeaderMeta();
            updateSubjects();
            syncStudentNamesFromDatabase();
            populateStudentMarksFromDatabase();
            applyTableSettings();
            recalculateTableGradesAndRanks();
            highlightFailures();
            applyFilters();
        }

        function filterGroup(val) {
            currentFilterGroup = val;
            const filterEl = document.getElementById('group-filter');
            if (filterEl) filterEl.value = val;

            updateSubjects();
            applyTableSettings();
            applyFilters();
        }

        function filterSection(val) {
            currentFilterSection = val;
            const filterEl = document.getElementById('section-filter');
            if (filterEl) filterEl.value = val;

            updateSubjects();
            applyTableSettings();
            applyFilters();
        }

        """

content = content[:idx_fc_start] + new_filter_class_exam + content[idx_fe_end:]

# 4. Update syncStudentNamesFromDatabase()
start_sync = "function syncStudentNamesFromDatabase() {"
end_sync = "// --- LIVE MARKS INJECTION FROM EXAM PORTAL (Exam List / school_student_marks) ---"
idx_sync_start = content.find(start_sync)
idx_sync_end = content.find(end_sync)

if idx_sync_start == -1 or idx_sync_end == -1:
    print("Error: Could not locate syncStudentNamesFromDatabase boundaries!")
    sys.exit(1)

new_sync_students = """function syncStudentNamesFromDatabase() {
            let studentsList = [];
            try {
                studentsList = JSON.parse(localStorage.getItem('school_students') || '[]');
            } catch (e) { }

            function normalizeClassName(cls) {
                if (!cls) return '';
                const val = cls.toString().toLowerCase().trim();
                if (val === '10th' || val === 'ten' || val === '10' || val === '১০ম' || val.includes('ten') || val.includes('10')) return 'ten';
                if (val === '9th' || val === 'nine' || val === '9' || val === '৯ম' || val.includes('nine') || val.includes('9')) return 'nine';
                if (val === '8th' || val === 'eight' || val === '8' || val === '৮ম' || val.includes('eight') || val.includes('8')) return 'eight';
                if (val === '7th' || val === 'seven' || val === '7' || val === '৭ম' || val.includes('seven') || val.includes('7')) return 'seven';
                if (val === '6th' || val === 'six' || val === '6' || val === '৬ষ্ঠ' || val.includes('six') || val.includes('6')) return 'six';
                if (val === 'five' || val === '5' || val === '৫ম' || val.includes('five') || val.includes('5')) return 'five';
                if (val === 'four' || val === '4' || val === '৪র্থ' || val.includes('four') || val.includes('4')) return 'four';
                if (val === 'three' || val === '3' || val === '৩য়' || val.includes('three') || val.includes('3')) return 'three';
                if (val === 'two' || val === '2' || val === '২য়' || val.includes('two') || val.includes('2')) return 'two';
                if (val === 'one' || val === '1' || val === '১ম' || val.includes('one') || val.includes('1')) return 'one';
                if (val.includes('kg') || val.includes('কেজি')) return 'kg';
                if (val.includes('nursery') || val.includes('নার্সারি')) return 'nursery';
                if (val.includes('play') || val.includes('প্লে')) return 'play';
                return val;
            }

            function normalizeGroupName(grp) {
                if (!grp) return 'none';
                const val = grp.toString().toLowerCase().trim();
                if (val === 'science' || val === 'বিজ্ঞান') return 'science';
                if (val === 'humanities' || val === 'মানবিক' || val === 'arts') return 'humanities';
                if (val === 'business' || val === 'ব্যবসায়' || val === 'commerce' || val === 'business studies') return 'business';
                return val;
            }

            // Extract the Student ID/Roll directly from the Student Directory schema (with leading zeros removed)
            function getStudentIdRoll(st) {
                if (!st) return '';
                let id = (st.studentId || '').toString().trim();
                let roll = (st.roll || '').toString().trim();
                const isPlaceholderRoll = /^(general|high|science|humanities|business|arts|commerce|none)$/i.test(roll);
                let result = '';
                if (id) result = id;
                else if (roll && !isPlaceholderRoll) result = roll;
                else result = id || roll || '';

                if (result) {
                    result = result.replace(/^0+(?=\\d)/, '').replace(/^০+(?=[০-৯])/g, '');
                }
                return result;
            }

            function getRollInt(st) {
                const idRoll = getStudentIdRoll(st);
                const digits = idRoll.replace(/\\D/g, '');
                if (digits) {
                    if (digits.length >= 5) {
                        return parseInt(digits.slice(-3), 10) || parseInt(digits, 10) || 0;
                    }
                    return parseInt(digits, 10) || 0;
                }
                return 0;
            }

            const sortFunc = (a, b) => {
                const rollDiff = getRollInt(a) - getRollInt(b);
                if (rollDiff !== 0) return rollDiff;
                const idA = getStudentIdRoll(a);
                const idB = getStudentIdRoll(b);
                return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
            };

            const targetClass = normalizeClassName(currentFilterClass);
            const isJunior = ['six', 'seven', 'eight', 'five', 'four', 'three', 'two', 'one', 'play', 'nursery', 'kg'].includes(targetClass);

            // Group database students by section/group
            const sectionStudents = { 'A': [], 'B': [], 'C': [], 'D': [] };

            if (Array.isArray(studentsList)) {
                studentsList.forEach(st => {
                    const stClass = normalizeClassName(st.class || st.className);
                    if (stClass !== targetClass) return;

                    // Group checking with name suffix fallback
                    let stGroup = normalizeGroupName(st.group || st.branch);
                    if (stGroup === 'none' || !stGroup) {
                        const nameLower = (st.name || '').toLowerCase().trim();
                        const nameBnLower = (st.nameBn || '').toLowerCase().trim();
                        if (nameLower.endsWith('s') || nameLower.includes(' s') || nameLower.includes('— s') || nameLower.includes('- s') || nameLower.includes('– s') || nameBnLower.includes('— s') || nameBnLower.includes('- s')) {
                            stGroup = 'science';
                        } else if (nameLower.endsWith('a') || nameLower.includes(' a') || nameLower.includes('— a') || nameLower.includes('- a') || nameLower.includes('– a') || nameBnLower.includes('— a') || nameBnLower.includes('- a')) {
                            stGroup = 'humanities';
                        } else if (nameLower.endsWith('b') || nameLower.includes(' b') || nameLower.includes('— b') || nameLower.includes('- b') || nameLower.includes('– b') || nameBnLower.includes('— b') || nameBnLower.includes('- b')) {
                            stGroup = 'business';
                        }
                    }

                    let secLetter = (st.section || st.sectionName || '').toString().toUpperCase().trim().replace(/^SECTION\\s*/i, '').replace(/^শাখা\\s*/i, '').trim();
                    if (secLetter === 'বিজ্ঞান' || secLetter === 'SCIENCE') { stGroup = 'science'; secLetter = 'A'; }
                    else if (secLetter === 'মানবিক' || secLetter === 'HUMANITIES' || secLetter === 'ARTS') { stGroup = 'humanities'; secLetter = 'B'; }
                    else if (secLetter === 'ব্যবসায়' || secLetter === 'BUSINESS' || secLetter === 'COMMERCE') { stGroup = 'business'; secLetter = 'C'; }

                    if (isJunior) {
                        if (secLetter && ['A', 'B', 'C', 'D'].includes(secLetter)) {
                            sectionStudents[secLetter].push(st);
                        } else {
                            if (!sectionStudents[secLetter]) sectionStudents[secLetter] = [];
                            sectionStudents[secLetter].push(st);
                        }
                    } else {
                        // Senior classes (9th, 10th)
                        if (stGroup === 'science') sectionStudents['A'].push(st);
                        else if (stGroup === 'humanities') sectionStudents['B'].push(st);
                        else if (stGroup === 'business') sectionStudents['C'].push(st);
                        else if (['A', 'B', 'C', 'D'].includes(secLetter)) {
                            sectionStudents[secLetter].push(st);
                        } else {
                            sectionStudents['A'].push(st);
                        }
                    }
                });
            }

            let clonedAny = false;
            const allSecKeys = ['A', 'B', 'C', 'D'];

            allSecKeys.forEach(secLetter => {
                let sectionRows = Array.from(document.querySelectorAll(`tbody tr[data-section="${secLetter}"]`));
                const dbList = sectionStudents[secLetter] || [];
                dbList.sort(sortFunc);

                if (sectionRows.length === 0 && dbList.length > 0) {
                    const existingRow = document.querySelector('tbody tr[data-section]');
                    if (existingRow) {
                        const newRow = existingRow.cloneNode(true);
                        newRow.setAttribute('data-section', secLetter);
                        const newCells = newRow.querySelectorAll('td');
                        newCells.forEach((c, idx) => {
                            if (idx >= 2) {
                                c.textContent = '-';
                                c.removeAttribute('data-orig-val');
                                c.style.backgroundColor = '';
                            }
                        });
                        const tbody = document.querySelector('table tbody');
                        tbody.appendChild(newRow);
                        sectionRows.push(newRow);
                        clonedAny = true;
                    }
                }

                // If database has more students than rows, dynamically clone new rows
                if (dbList.length > 0) {
                    while (sectionRows.length < dbList.length) {
                        const lastRow = sectionRows[sectionRows.length - 1];
                        if (!lastRow) break;
                        const newRow = lastRow.cloneNode(true);
                        newRow.setAttribute('data-section', secLetter);

                        const newCells = newRow.querySelectorAll('td');
                        newCells.forEach((c, idx) => {
                            if (idx >= 2) {
                                c.textContent = '-';
                                c.removeAttribute('data-orig-val');
                                c.style.backgroundColor = '';
                            }
                        });

                        lastRow.parentNode.insertBefore(newRow, lastRow.nextSibling);
                        sectionRows.push(newRow);
                        clonedAny = true;
                    }
                }

                // Map database students to table rows
                sectionRows.forEach((row, idx) => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 2) return;

                    const rollCell = cells[0];
                    const nameCell = cells[1];

                    if (idx < dbList.length) {
                        const dbStudent = dbList[idx];
                        const displayRoll = getStudentIdRoll(dbStudent);

                        const dbBn = dbStudent.nameBn || dbStudent.name || dbStudent.studentName || '';
                        const dbEn = dbStudent.name || dbStudent.studentName || dbStudent.nameBn || '';

                        const cleanBn = dbBn.replace(/\\s*[-—–]\\s*[SABsab]\\s*$/, '');
                        const cleanEn = dbEn.replace(/\\s*[-—–]\\s*[SABsab]\\s*$/, '');

                        rollCell.textContent = translateDigits(displayRoll, currentLang);
                        rollCell.setAttribute('data-original-roll', displayRoll);
                        rollCell.setAttribute('data-db-roll', displayRoll);

                        nameCell.textContent = currentLang === 'en' ? cleanEn : cleanBn;
                        nameCell.setAttribute('data-original-bn', cleanBn);
                        nameCell.setAttribute('data-original-en', cleanEn);

                        row.setAttribute('data-student-id', dbStudent.id || '');
                        row.setAttribute('data-student-code', dbStudent.studentId || '');
                        row.setAttribute('data-student-roll', displayRoll);
                        row.setAttribute('data-class', currentFilterClass);
                        row.setAttribute('data-exam', currentFilterExam);
                        row.setAttribute('data-has-student', 'true');

                        let showSection = false;
                        if (!isJunior) {
                            const groupName = secLetter === 'A' ? 'science' : (secLetter === 'B' ? 'humanities' : (secLetter === 'C' ? 'business' : 'none'));
                            showSection = (currentFilterGroup === 'all' || currentFilterGroup === groupName);
                        } else {
                            showSection = (currentFilterSection === 'all' || currentFilterSection === secLetter);
                        }

                        row.style.display = showSection ? '' : 'none';
                    } else {
                        // Extra row without matching real student: hide and clear
                        row.style.display = 'none';
                        row.removeAttribute('data-has-student');
                        row.removeAttribute('data-student-id');
                        row.removeAttribute('data-student-code');
                        row.removeAttribute('data-student-roll');
                    }
                });
            });

            // Update section divider rows
            document.querySelectorAll('.section-divider-row').forEach(row => {
                const secName = row.getAttribute('data-section-name');
                const hasStudentsInSec = (sectionStudents[secName] || []).length > 0;
                if (!hasStudentsInSec) {
                    row.style.display = 'none';
                    return;
                }
                if (!isJunior) {
                    const groupName = secName === 'A' ? 'science' : (secName === 'B' ? 'humanities' : (secName === 'C' ? 'business' : 'none'));
                    row.style.display = (currentFilterGroup === 'all' || currentFilterGroup === groupName) ? '' : 'none';
                } else {
                    row.style.display = (currentFilterSection === 'all' || secName === currentFilterSection) ? '' : 'none';
                }
            });

            // Dynamically update section-filter dropdown with actually available sections
            if (typeof updateSectionFilterOptions === 'function') {
                const activeSections = Object.keys(sectionStudents).filter(k => sectionStudents[k].length > 0);
                updateSectionFilterOptions(activeSections.length > 0 ? activeSections : ['A']);
            }

            if (clonedAny) {
                applyTableSettings();
            }
            populateStudentMarksFromDatabase();
        }

        """

content = content[:idx_sync_start] + new_sync_students + content[idx_sync_end:]

# 5. Update populateDynamicFilters() auto-class hijacking
start_pdf_class = "// Smart auto-class detection for the active exam from Exam Portal schedules"
end_pdf_class = "} else {\n                    [...examSelect.options].forEach(opt => {"
idx_pdf_class_start = content.find(start_pdf_class)
idx_pdf_class_end = content.find(end_pdf_class)

if idx_pdf_class_start != -1 and idx_pdf_class_end != -1:
    new_pdf_class = """// Respect URL ?class= parameter if present, otherwise preserve user's selected Class
                    try {
                        const urlParams = new URLSearchParams(window.location.search);
                        const paramClass = urlParams.get('class');
                        const classSelect = document.getElementById('class-filter');
                        if (paramClass && classSelect && [...classSelect.options].some(o => o.value.toLowerCase() === paramClass.toLowerCase())) {
                            classSelect.value = paramClass;
                            currentFilterClass = classSelect.value;
                        }
                    } catch (e) {}
                """
    content = content[:idx_pdf_class_start] + new_pdf_class + content[idx_pdf_class_end:]

with open('Tabulation Sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied updates to Tabulation Sheet.html!")

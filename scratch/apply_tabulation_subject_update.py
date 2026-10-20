import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace activeClassSlotMap and updateSubjects()
start_marker = "        let activeClassSlotMap = {};\n\n        function updateSubjects() {"
end_marker = "        function changeSubjectFormat(format) {"

idx_start = content.find(start_marker)
idx_end = content.find(end_marker)

if idx_start == -1:
    # Try alternative matching
    start_marker = "let activeClassSlotMap = {};"
    idx_start = content.find(start_marker)

if idx_start == -1 or idx_end == -1:
    print(f"Error: Could not locate updateSubjects boundaries! (start: {idx_start}, end: {idx_end})")
    sys.exit(1)

new_update_subjects = '''        let activeClassSlotMap = {};

        function getSubjectNameBangla(sub) {
            if (!sub) return '';
            if (typeof sub === 'string') sub = { name: sub };
            if (sub.nameBn && sub.nameBn.trim()) {
                const b = sub.nameBn.trim();
                if (b === 'বাংলা ১ম পত্র' || b === 'বাংলা ১ম' || b.includes('বাংলা সাহিত্য')) return 'বাংলা ১ম পত্র';
                if (b === 'বাংলা ২য় পত্র' || b === 'বাংলা ২য়' || b.includes('ব্যাকরণ')) return 'বাংলা ২য় পত্র';
                if (b === 'ইংরেজি ১ম পত্র' || b === 'ইংরেজি ১ম') return 'ইংরেজি ১ম পত্র';
                if (b === 'ইংরেজি ২য় পত্র' || b === 'ইংরেজি ২য়') return 'ইংরেজি ২য় পত্র';
                return b;
            }

            const raw = (sub.name || sub.subject || '').trim();
            const cleanLower = raw.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\\s+/g, ' ').trim();

            const dict = {
                'bangla sahitya': 'বাংলা ১ম পত্র',
                'bangla 1st': 'বাংলা ১ম পত্র',
                'bangla 1st paper': 'বাংলা ১ম পত্র',
                'bangla first paper': 'বাংলা ১ম পত্র',
                'bangla bhashar byakaran and nirmiti': 'বাংলা ২য় পত্র',
                'bangla bhashar byakaran o nirmiti': 'বাংলা ২য় পত্র',
                'bangla 2nd': 'বাংলা ২য় পত্র',
                'bangla 2nd paper': 'বাংলা ২য় পত্র',
                'bangla second paper': 'বাংলা ২য় পত্র',
                'bangla grammar': 'বাংলা ২য় পত্র',
                'english for today': 'ইংরেজি ১ম পত্র',
                'english 1st': 'ইংরেজি ১ম পত্র',
                'english 1st paper': 'ইংরেজি ১ম পত্র',
                'english first paper': 'ইংরেজি ১ম পত্র',
                'english grammar and composition': 'ইংরেজি ২য় পত্র',
                'english 2nd': 'ইংরেজি ২য় পত্র',
                'english 2nd paper': 'ইংরেজি ২য় পত্র',
                'english second paper': 'ইংরেজি ২য় পত্র',
                'english grammar': 'ইংরেজি ২য় পত্র',
                'mathematics': 'সাধারণ গণিত',
                'math': 'গণিত',
                'general mathematics': 'সাধারণ গণিত',
                'higher mathematics': 'উচ্চতর গণিত',
                'higher math': 'উচ্চতর গণিত',
                'general science': 'বিজ্ঞান',
                'science': 'বিজ্ঞান',
                'physics': 'পদার্থবিজ্ঞান',
                'chemistry': 'রসায়ন',
                'biology': 'জীববিজ্ঞান',
                'bangladesh and global studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
                'bangladesh & global studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
                'bgs': 'বাংলাদেশ ও বিশ্বপরিচয়',
                'information and communication technology': 'তথ্য ও যোগাযোগ প্রযুক্তি',
                'information & communication technology': 'তথ্য ও যোগাযোগ প্রযুক্তি',
                'ict': 'তথ্য ও যোগাযোগ প্রযুক্তি',
                'islam and moral education': 'ইসলাম ও নৈতিক শিক্ষা',
                'islam': 'ইসলাম ও নৈতিক শিক্ষা',
                'hindu religion and moral education': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'hindu': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'religion': 'ধর্ম ও নৈতিক শিক্ষা',
                'agriculture studies': 'কৃষি শিক্ষা',
                'agriculture': 'কৃষি শিক্ষা',
                'agri': 'কৃষি শিক্ষা'
            };

            for (const k in dict) {
                if (cleanLower === k || cleanLower.includes(k)) return dict[k];
            }
            return raw;
        }

        function resolveSubjectBilingual(rawStr, subCode, classSubs, lang) {
            if (!rawStr && !subCode) return null;
            const cleanRaw = (rawStr || '').trim();
            const cleanLower = cleanRaw.toLowerCase();
            const codeStr = (subCode || '').toString().trim();

            // 1. Try to find match in classSubjects from school_subjects
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
                { regex: /(general\\s*)?math(ematics)?|গণিত|সাধারণ গণিত/i, notRegex: /higher|উচ্চতর/i, name: 'Mathematics', nameBn: 'সাধারণ গণিত', shortEn: 'MAT', shortBn: 'গণিত', code: '105' },
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
                        shortName: (lang === 'en' ? item.shortEn : item.shortBn),
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

        function updateSubjects() {
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

            // Baseline class subjects from school_subjects
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

            // 1. Gather subjects specifically configured for this Exam & Class from Exam List (school_exam_schedules), routines, and OMR
            let examSubjects = [];
            const seenExamSubKeys = new Set();

            const addExamSub = (rawName, subCode, isOpt, sec) => {
                if (!rawName) return;
                const res = resolveSubjectBilingual(rawName, subCode, classSubjects, currentLang);
                if (!res) return;
                const key = (res.code ? res.code.toString().trim() : '') || res.name.toLowerCase();
                if (seenExamSubKeys.has(key)) return;
                seenExamSubKeys.add(key);
                if (isOpt !== undefined) res.isOptional = !!isOpt;
                if (sec) res.section = sec;
                examSubjects.push(res);
            };

            if (activeExamLower !== 'all') {
                // A. Check school_exam_schedules (Exam List - Primary Source)
                if (Array.isArray(schedules)) {
                    schedules.forEach(s => {
                        if (!s) return;
                        const sTerm = (s.term || s.examName || '').trim();
                        if (!isExamMatch(sTerm, activeExam) && sTerm.toLowerCase() !== activeExamLower) return;
                        if (normalizeClassName(s.class) !== targetClass && normalizeClassString(s.class) !== normalizeClassString(targetClass)) return;
                        addExamSub(s.subject, s.code || s.subjectCode, s.isOptional, s.section);
                    });
                }

                // B. Check school_exam_routines
                if (Array.isArray(routines)) {
                    routines.forEach(r => {
                        if (!r) return;
                        const rExam = (r.examName || '').trim();
                        if (!isExamMatch(rExam, activeExam) && rExam.toLowerCase() !== activeExamLower) return;
                        const rClass = (r.class || r.className || '').trim();
                        if (normalizeClassName(rClass) !== targetClass && normalizeClassString(rClass) !== normalizeClassString(targetClass)) return;
                        if (isSeniorClass && currentFilterGroup && currentFilterGroup !== 'all') {
                            const rClassLower = rClass.toLowerCase();
                            if (currentFilterGroup === 'science' && !rClassLower.includes('বিজ্ঞান') && !rClassLower.includes('science')) return;
                            if (currentFilterGroup === 'humanities' && !rClassLower.includes('মানবিক') && !rClassLower.includes('arts')) return;
                            if (currentFilterGroup === 'business' && !rClassLower.includes('ব্যবসায়') && !rClassLower.includes('commerce')) return;
                        }
                        addExamSub(r.subject || r.subjectName, r.code || r.subjectCode, r.isOptional, r.section || r.dept);
                    });
                }

                // C. Check school_omr_exams
                if (Array.isArray(omrExams)) {
                    omrExams.forEach(o => {
                        if (!o) return;
                        const oExam = (o.examName || '').trim();
                        if (!isExamMatch(oExam, activeExam) && oExam.toLowerCase() !== activeExamLower) return;
                        if (normalizeClassName(o.class) !== targetClass && normalizeClassString(o.class) !== normalizeClassString(targetClass)) return;
                        addExamSub(o.subject, o.code, o.isOptional, o.section);
                    });
                }
            }

            // Merge: Exam List subjects take top priority, complemented by baseline
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
                        "bangla": "বাংলা", "bangla1": "বাংলা ১ম পত্র", "bangla2": "বাংলা ২য় পত্র",
                        "english": "ইংরেজি", "english1": "ইংরেজি ১ম পত্র", "english2": "ইংরেজি ২য় পত্র",
                        "math": "সাধারণ গণিত", "bgs": "বাংলাদেশ ও বিশ্বপরিচয়", "chem": isSeniorClass ? "রসায়ন" : "বিজ্ঞান",
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
                const subKey = (s.code ? s.code.toString().trim() : '') || (s.name || '').toLowerCase();
                if (subKey) assignedSubKeys.add(subKey);

                if (s.code) {
                    const cStr = s.code.toString().trim();
                    activeClassSlotMap[cStr] = slotKey;
                }
                if (s.name) activeClassSlotMap[s.name.trim().toLowerCase()] = slotKey;
                if (s.nameBn) activeClassSlotMap[s.nameBn.trim().toLowerCase()] = slotKey;
                if (s.shortName) activeClassSlotMap[s.shortName.trim().toLowerCase()] = slotKey;

                const nameEn = (s.name || '').trim();
                const nameBn = (s.nameBn || s.name || '').trim();
                const shortEn = (s.shortEn || s.shortName || s.name || '').trim();
                const shortBn = (s.shortBn || s.shortName || s.nameBn || s.name || '').trim();

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
                        const subKey = (code ? code : '') || name.toLowerCase();
                        if (subKey) assignedSubKeys.add(subKey);
                        if (code === '110' || /islam|ইসলাম/i.test(comb)) { hasIslam = true; islamSub = s; }
                        if (code === '111' || /hindu|হিন্দু/i.test(comb)) { hasHindu = true; hinduSub = s; }
                        return;
                    }

                    // Combined 4th / Optional Subject check (Higher Math + Agriculture mixed in single column)
                    if (code === '505' || code === '109' || s.isOptional || /higher.*math|agri|উচ্চতর.*গণিত|কৃষি/i.test(comb)) {
                        const subKey = (code ? code : '') || name.toLowerCase();
                        if (subKey) assignedSubKeys.add(subKey);
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
                        const iShort = (islamSub.shortBn || islamSub.shortName || '').trim();
                        const hShort = (hinduSub.shortBn || hinduSub.shortName || '').trim();

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
                            relShortBn = (singleSub.shortBn || singleSub.shortName || singleSub.nameBn || '').trim() || "ধর্ম";
                            relShortEn = (singleSub.shortEn || singleSub.shortName || singleSub.name || '').trim() || "REL";
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

                    let optBn = isSeniorClass ? "কৃষি/উচ্চতর" : "কৃষি শিক্ষা";
                    let optEn = isSeniorClass ? "Agri/Higher" : "Agriculture";
                    let optShortBn = isSeniorClass ? "কৃ/উ" : "কৃষি";
                    let optShortEn = isSeniorClass ? "AGR/HM" : "AGRI";

                    if (hasHigherMath && hasAgri && higherMathSub && agriSub) {
                        const mBn = (higherMathSub.nameBn || higherMathSub.name || '').trim();
                        const aBn = (agriSub.nameBn || agriSub.name || '').trim();
                        const mEn = (higherMathSub.name || '').trim();
                        const aEn = (agriSub.name || '').trim();
                        const mShort = (higherMathSub.shortBn || higherMathSub.shortName || '').trim();
                        const aShort = (agriSub.shortBn || agriSub.shortName || '').trim();

                        const cleanMBn = mBn.replace(/ গণিত/g, '').trim() || mBn;
                        const cleanABn = aBn.replace(/ শিক্ষা/g, '').trim() || aBn;
                        const cleanMEn = mEn.replace(/ Mathematics| Math/gi, '').trim() || mEn;
                        const cleanAEn = aEn.replace(/ Studies| Agriculture/gi, '').trim() || aEn;

                        if (cleanABn && cleanMBn && cleanABn !== aBn && cleanMBn !== mBn) {
                            optBn = `${cleanABn}/${cleanMBn}`;
                        } else if (aBn && mBn) {
                            optBn = `${aBn} / ${mBn}`;
                        } else {
                            optBn = aBn || mBn || (isSeniorClass ? "কৃষি/উচ্চতর" : "কৃষি শিক্ষা");
                        }

                        if (cleanAEn && cleanMEn && cleanAEn !== aEn && cleanMEn !== mEn) {
                            optEn = `${cleanAEn}/${cleanMEn}`;
                        } else if (aEn && mEn) {
                            optEn = `${aEn} / ${mEn}`;
                        } else {
                            optEn = aEn || mEn || (isSeniorClass ? "Agri/Higher" : "Agriculture");
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
                            optBn = (singleOpt.nameBn || singleOpt.name || '').trim() || (isSeniorClass ? "কৃষি/উচ্চতর" : "কৃষি শিক্ষা");
                            optEn = (singleOpt.name || singleOpt.nameBn || '').trim() || (isSeniorClass ? "Agri/Higher" : "Agriculture");
                            optShortBn = (singleOpt.shortBn || singleOpt.shortName || singleOpt.nameBn || '').trim() || (isSeniorClass ? "কৃ/উ" : "কৃষি");
                            optShortEn = (singleOpt.shortEn || singleOpt.shortName || singleOpt.name || '').trim() || (isSeniorClass ? "AGR/HM" : "AGRI");
                        }
                    }

                    dynamicSubjectMap.bn.full['agri'] = optBn;
                    dynamicSubjectMap.en.full['agri'] = optEn;
                    dynamicSubjectMap.bn.short['agri'] = optShortBn;
                    dynamicSubjectMap.en.short['agri'] = optShortEn;
                }

                // Assign any remaining unassigned subjects to empty department slots
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
            }

            // Apply all mapped names to table header DOM elements
            const lang = (currentLang === 'en') ? 'en' : 'bn';
            const fmt = (currentSubjFormat === 'short') ? 'short' : 'full';

            document.querySelectorAll('thead th[data-subj]:not([data-col-type]):not([data-fullmark])').forEach(el => {
                let key = el.getAttribute('data-subj');
                if (!key) return;

                if (dynamicSubjectMap[lang] && dynamicSubjectMap[lang][fmt] && dynamicSubjectMap[lang][fmt][key] !== undefined) {
                    el.textContent = dynamicSubjectMap[lang][fmt][key];
                }
            });

            // Dynamically update full marks and component headers
            if (typeof updateDynamicSubjectMarksAndHeaders === 'function') {
                updateDynamicSubjectMarksAndHeaders();
            }
        }
'''

content = content[:idx_start] + new_update_subjects + content[idx_end:]

# 2. Update getSubjectSlot to use activeClassSlotMap
old_get_sub_slot = """        // --- LIVE MARKS INJECTION FROM EXAM PORTAL (Exam List / school_student_marks) ---
        function getSubjectSlot(subName, subCode) {
            const sName = (subName || '').toLowerCase();
            const code = (subCode || '').toString().trim();

            if (code === '101' || /bangla.*1|বাং.*১|বাংলা সাহিত্য/i.test(sName)) return 'bangla1';
            if (code === '102' || /bangla.*2|বাং.*২|ব্যাকরণ/i.test(sName)) return 'bangla2';
            if (code === '103' || /english.*1|eng.*1|ইংরেজি ১ম|for today/i.test(sName)) return 'english1';
            if (code === '104' || /english.*2|eng.*2|ইংরেজি ২য়|grammar/i.test(sName)) return 'english2';
            if (code === '105' || /math|গণিত/i.test(sName)) return 'math';
            if (code === '107' || /bgs|global studies|বিশ্বপরিচয়/i.test(sName)) return 'bgs';
            if (code === '1111' || /physics|পদার্থ/i.test(sName)) return 'phys';
            if (code === '135' || /chemistry|রসায়ন/i.test(sName)) return 'chem';
            if (code === '108' || /science|বিজ্ঞান/i.test(sName)) return 'chem'; // General Science maps to slot 5 (chem)
            if (code === '180' || /biology|জীববিজ্ঞান/i.test(sName)) return 'bio';
            if (['110', '111', '112', '113'].includes(code) || /religion|islam|hindu|ধর্ম/i.test(sName)) return 'rel';
            if (code === '106' || /ict|information.*tech|যোগাযোগ/i.test(sName)) return 'ict';
            if (['109', '126'].includes(code) || /agri|কৃষি|higher.*math|উচ্চতর/i.test(sName)) return 'agri';

            return null;
        }"""

new_get_sub_slot = """        // --- LIVE MARKS INJECTION FROM EXAM PORTAL (Exam List / school_student_marks) ---
        function getSubjectSlot(subName, subCode) {
            const sName = (subName || '').toLowerCase().trim();
            const code = (subCode || '').toString().trim();

            if (code && typeof activeClassSlotMap !== 'undefined' && activeClassSlotMap && activeClassSlotMap[code]) return activeClassSlotMap[code];
            if (sName && typeof activeClassSlotMap !== 'undefined' && activeClassSlotMap && activeClassSlotMap[sName]) return activeClassSlotMap[sName];

            if (code === '101' || /bangla.*1|বাং.*১|বাংলা সাহিত্য/i.test(sName)) return 'bangla1';
            if (code === '102' || /bangla.*2|বাং.*২|ব্যাকরণ/i.test(sName)) return 'bangla2';
            if (code === '103' || /english.*1|eng.*1|ইংরেজি ১ম|for today/i.test(sName)) return 'english1';
            if (code === '104' || /english.*2|eng.*2|ইংরেজি ২য়|grammar/i.test(sName)) return 'english2';
            if (code === '105' || /math|গণিত/i.test(sName)) return 'math';
            if (code === '107' || /bgs|global studies|বিশ্বপরিচয়/i.test(sName)) return 'bgs';
            if (code === '1111' || /physics|পদার্থ/i.test(sName)) return 'phys';
            if (code === '135' || /chemistry|রসায়ন/i.test(sName)) return 'chem';
            if (code === '108' || /science|বিজ্ঞান/i.test(sName)) return 'chem'; // General Science maps to slot 5 (chem)
            if (code === '180' || /biology|জীববিজ্ঞান/i.test(sName)) return 'bio';
            if (['110', '111', '112', '113'].includes(code) || /religion|islam|hindu|ধর্ম/i.test(sName)) return 'rel';
            if (code === '106' || /ict|information.*tech|যোগাযোগ/i.test(sName)) return 'ict';
            if (['109', '126', '505'].includes(code) || /agri|কৃষি|higher.*math|উচ্চতর/i.test(sName)) return 'agri';

            return null;
        }"""

if old_get_sub_slot in content:
    content = content.replace(old_get_sub_slot, new_get_sub_slot)
    print("getSubjectSlot replaced successfully!")
else:
    print("Warning: old_get_sub_slot not found directly!")

with open('Tabulation Sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Tabulation Sheet.html updated successfully!")

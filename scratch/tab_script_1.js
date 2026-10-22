

        const translationMap = {

            "উচ্চ বিদ্যালয়": "Alhaj Mobarak Hossain Anirban Bidyatirtha High School",

            "গড় প্রাপ্ত": "Avg. Marks",

            "জলঢাকা, নীলফামারী।": "Jaldhaka, Nilphamari.",

            "অর্ধ-বার্ষিক পরীক্ষা-২০২৫ এর ফলাফল শীট": "Half-Yearly Examination-2025 Result Sheet",

            "শ্রেণি: ১০ম, শাখা: বিজ্ঞান": "Class: 10th, Section: Science",

            "রোল": "Roll",

            "শিক্ষার্থীর নাম": "Student's Name",

            "সর্বমোট": "Grand Total",

            "গ্রেড": "Grade",

            "পয়েন্ট": "Point",

            "পয়েন্ট": "Point",

            "বহুনির্বাচনি": "MCQ",

            "লিখিত": "Written",

            "মোট": "Total",

            "ফেল বিষয়": "Failed Subjects",

            "জিপিএ\n(অপশনাল বিষয় ছাড়া)": "GPA\n(w/o Optional)",

            "জিপিএ (অপশনাল বিষয় ছাড়া)": "GPA (w/o Optional)",

            "জিপিএ": "GPA",

            "ধর্ম (ইসলাম/হিন্দু)": "Religion (Islam/Hindu)",

            "ধর্ম": "Religion",

            "কৃষি/উচ্চতর": "Agri/Higher",

            "কৃষি/উচ্চতর গণিত": "Higher Math / Agri",

            "জিপিএ পদ্ধতি (GPA System):": "GPA System:",

            "দিনাজপুর বোর্ড GPA পদ্ধতি": "Dinajpur Board GPA System",

            "দিনাজপুর বোর্ড মোট মার্ক পদ্ধতি": "Dinajpur Board Total Mark System",

            "মেধা স্থান": "Merit Rank",

            "প্রস্তুতকারীর স্বাক্ষর": "Prepared by Signature",

            "প্রধান শিক্ষকের স্বাক্ষর": "Headmaster's Signature"

        };



        const studentNameMap = {};



        const subjectNames = {

            "bn": {

                "full": {

                    "bangla": "বাংলা",

                    "bangla1": "বাংলা ১ম",

                    "bangla2": "বাংলা ২য়",

                    "english": "English",

                    "english1": "English 1st",

                    "english2": "English 2nd",

                    "math": "গণিত",

                    "bgs": "বাংলাদেশ ও বিশ্বপরিচয়",

                    "chem": "রসায়ন",

                    "phys": "পদার্থ",

                    "bio": "জীববিজ্ঞান",

                    "rel": "ধর্ম (ইসলাম/হিন্দু)",

                    "ict": "তথ্য ও যোগাযোগ যুক্তি",

                    "agri": "কৃষি/উচ্চতর"

                },

                "short": {

                    "bangla": "বাংলা",

                    "bangla1": "বাং ১ম",

                    "bangla2": "বাং ২য়",

                    "english": "English",

                    "english1": "ইং ১ম",

                    "english2": "ইং ২য়",

                    "math": "গণি",

                    "bgs": "বা.বি.প",

                    "chem": "রসা",

                    "phys": "পদা",

                    "bio": "জীব",

                    "rel": "ধর্ম",

                    "ict": "আইসিটি",

                    "agri": "কৃ/উ"

                }

            },

            "en": {

                "full": {

                    "bangla": "বাংলা",

                    "bangla1": "Bangla 1st",

                    "bangla2": "Bangla 2nd",

                    "english": "English",

                    "english1": "English 1st",

                    "english2": "English 2nd",

                    "math": "Mathematics",

                    "bgs": "BGS",

                    "chem": "Chemistry",

                    "phys": "Physics",

                    "bio": "Biology",

                    "rel": "Religion (Islam/Hindu)",

                    "ict": "ICT",

                    "agri": "Agri/Higher"

                },

                "short": {

                    "bangla": "বাংলা",

                    "bangla1": "BAN 1st",

                    "bangla2": "BAN 2nd",

                    "english": "English",

                    "english1": "ENG 1st",

                    "english2": "ENG 2nd",

                    "math": "MAT",

                    "bgs": "BGS",

                    "chem": "CHE",

                    "phys": "PHY",

                    "bio": "BIO",

                    "rel": "REL",

                    "ict": "ICT",

                    "agri": "AGR/HM"

                }

            }

        };



        const reverseTranslationMap = {};

        for (let key in translationMap) {

            reverseTranslationMap[translationMap[key]] = key;

        }



        const reverseStudentNameMap = {};

        for (let key in studentNameMap) {

            reverseStudentNameMap[studentNameMap[key]] = key;

        }



        const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

        const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];



        function translateDigits(text, toLang) {

            let res = text;

            if (toLang === 'en') {

                for (let i = 0; i < 10; i++) {

                    res = res.replaceAll(bnDigits[i], enDigits[i]);

                }

            } else {

                for (let i = 0; i < 10; i++) {

                    res = res.replaceAll(enDigits[i], bnDigits[i]);

                }

            }

            return res;

        }



        let currentLang = 'bn';

        let currentSubjFormat = 'full';



        let activeClassSlotMap = {};

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
            const cleanLower = raw.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

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
                    const hasBnChars = /[\u0980-\u09FF]/.test(cleanRaw);
                    const hasEnChars = /[a-zA-Z]/.test(cleanRaw);
                    return {
                        name: (hasEnChars && !hasBnChars) ? cleanRaw : (found.name || cleanRaw).trim(),
                        nameBn: (hasBnChars && !hasEnChars) ? cleanRaw : (found.nameBn || cleanRaw).trim(),
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
                { regex: /bangla.*1|bangla.*sahitya|বাংলা.*১|বাংলা.*সাহিত্য|^bangla$|^বাংলা$/i, name: 'Bangla 1st Paper', nameBn: 'বাংলা ১ম পত্র', shortEn: 'BAN 1st', shortBn: 'বাং ১ম', code: '101' },
                { regex: /bangla.*2|byakaran|nirmiti|বাংলা.*২|ব্যাকরণ|নির্মিতি/i, name: 'Bangla 2nd Paper', nameBn: 'বাংলা ২য় পত্র', shortEn: 'BAN 2nd', shortBn: 'বাং ২য়', code: '102' },
                { regex: /english.*1|english.*today|ইংরেজি.*১|^english$|^ইংরেজি$/i, name: 'English 1st Paper', nameBn: 'ইংরেজি ১ম পত্র', shortEn: 'ENG 1st', shortBn: 'ইং ১ম', code: '103' },
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
                    const hasBnChars = /[\u0980-\u09FF]/.test(cleanRaw);
                    const hasEnChars = /[a-zA-Z]/.test(cleanRaw);
                    return {
                        name: (hasEnChars && !hasBnChars) ? cleanRaw : item.name,
                        nameBn: (hasBnChars && !hasEnChars) ? cleanRaw : item.nameBn,
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
                // Check school_exam_schedules (Exam List - Authoritative source for created exams)
                if (Array.isArray(schedules)) {
                    schedules.forEach(s => {
                        if (!s) return;
                        const sTerm = (s.term || s.examName || '').trim();
                        if (!isExamMatch(sTerm, activeExam) && sTerm.toLowerCase() !== activeExamLower) return;
                        const sClass = (s.class || s.className || '').trim();
                        if (normalizeClassName(sClass) !== targetClass && normalizeClassString(sClass) !== normalizeClassString(targetClass)) return;
                        addExamSub(s.subject || s.subjectName, s.code || s.subjectCode, s.isOptional, s.section);
                    });
                }
            }

            // Exam List subjects: ONLY the subjects for which an Exam is Created in Exam List are active!
            let activeSubs = [];
            const isSpecificExam = (activeExamLower !== 'all');

            if (isSpecificExam) {
                // When an exam is selected, strictly display ONLY the subjects created in Exam List for this exam & class
                activeSubs = [...examSubjects];
            } else {
                if (examSubjects.length > 0) {
                    activeSubs = [...examSubjects];
                } else {
                    classSubjects.forEach(cs => {
                        const res = resolveSubjectBilingual(cs.name || cs.nameBn, cs.code, classSubjects, currentLang);
                        if (res) activeSubs.push(res);
                    });
                }
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

            // When an Exam is selected, ONLY subjects created in Exam List for this exam will be visible (others default to '-')
            const dynamicSubjectMap = {
                "bn": {
                    "full": isSpecificExam ? {
                        "bangla": "-", "bangla1": "-", "bangla2": "-",
                        "english": "-", "english1": "-", "english2": "-",
                        "math": "-", "bgs": "-", "chem": "-",
                        "phys": "-", "bio": "-", "rel": "-",
                        "ict": "-", "agri": "-"
                    } : {
                        "bangla": "বাংলা", "bangla1": "বাংলা ১ম পত্র", "bangla2": "বাংলা ২য় পত্র",
                        "english": "ইংরেজি", "english1": "ইংরেজি ১ম পত্র", "english2": "ইংরেজি ২য় পত্র",
                        "math": "সাধারণ গণিত", "bgs": "বাংলাদেশ ও বিশ্বপরিচয়", "chem": isSeniorClass ? "রসায়ন" : "বিজ্ঞান",
                        "phys": isSeniorClass ? "পদার্থ" : "-", "bio": isSeniorClass ? "জীববিজ্ঞান" : "-", "rel": "ধর্ম",
                        "ict": "তথ্য ও যোগাযোগ প্রযুক্তি", "agri": isSeniorClass ? "কৃষি/উচ্চতর" : "কৃষি শিক্ষা"
                    },
                    "short": isSpecificExam ? {
                        "bangla": "-", "bangla1": "-", "bangla2": "-",
                        "english": "-", "english1": "-", "english2": "-",
                        "math": "-", "bgs": "-", "chem": "-",
                        "phys": "-", "bio": "-", "rel": "-",
                        "ict": "-", "agri": "-"
                    } : {
                        "bangla": "বাংলা", "bangla1": "বাং ১ম", "bangla2": "বাং ২য়",
                        "english": "ইং", "english1": "ইং ১ম", "english2": "ইং ২য়",
                        "math": "গণিত", "bgs": "বা.বি.প", "chem": isSeniorClass ? "রসা" : "বিজ্ঞান",
                        "phys": isSeniorClass ? "পদা" : "-", "bio": isSeniorClass ? "জীব" : "-", "rel": "ধর্ম",
                        "ict": "আইসিটি", "agri": isSeniorClass ? "কৃ/উ" : "কৃষি"
                    }
                },
                "en": {
                    "full": isSpecificExam ? {
                        "bangla": "-", "bangla1": "-", "bangla2": "-",
                        "english": "-", "english1": "-", "english2": "-",
                        "math": "-", "bgs": "-", "chem": "-",
                        "phys": "-", "bio": "-", "rel": "-",
                        "ict": "-", "agri": "-"
                    } : {
                        "bangla": "Bangla", "bangla1": "Bangla 1st Paper", "bangla2": "Bangla 2nd Paper",
                        "english": "English", "english1": "English 1st Paper", "english2": "English 2nd Paper",
                        "math": "Mathematics", "bgs": "BGS", "chem": isSeniorClass ? "Chemistry" : "Science",
                        "phys": isSeniorClass ? "Physics" : "-", "bio": isSeniorClass ? "Biology" : "-", "rel": "Religion",
                        "ict": "ICT", "agri": isSeniorClass ? "Agri/Higher" : "Agriculture"
                    },
                    "short": isSpecificExam ? {
                        "bangla": "-", "bangla1": "-", "bangla2": "-",
                        "english": "-", "english1": "-", "english2": "-",
                        "math": "-", "bgs": "-", "chem": "-",
                        "phys": "-", "bio": "-", "rel": "-",
                        "ict": "-", "agri": "-"
                    } : {
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

                    if (code === '101' || /bangla.*1|bangla.*sahitya|বাংলা.*১|বাংলা.*সাহিত্য|^bangla$|^বাংলা$/i.test(comb)) {
                        assignSlot('bangla1', s);
                    } else if (code === '102' || /bangla.*2|byakaran|nirmiti|বাংলা.*২|ব্যাকরণ|নির্মিতি/i.test(comb)) {
                        assignSlot('bangla2', s);
                    } else if (code === '103' || /english.*1|english.*today|ইংরেজি.*১|^english$|^ইংরেজি$/i.test(comb)) {
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

            // If an Exam is selected, ensure parent subjects Bangla and English reflect whether child papers exist in this exam
            if (isSpecificExam) {
                const hasBangla = slotAssignments['bangla1'] || slotAssignments['bangla2'];
                dynamicSubjectMap.bn.full['bangla'] = hasBangla ? "বাংলা" : "-";
                dynamicSubjectMap.en.full['bangla'] = hasBangla ? "Bangla" : "-";
                dynamicSubjectMap.bn.short['bangla'] = hasBangla ? "বাংলা" : "-";
                dynamicSubjectMap.en.short['bangla'] = hasBangla ? "BAN" : "-";

                const hasEnglish = slotAssignments['english1'] || slotAssignments['english2'];
                dynamicSubjectMap.bn.full['english'] = hasEnglish ? "ইংরেজি" : "-";
                dynamicSubjectMap.en.full['english'] = hasEnglish ? "English" : "-";
                dynamicSubjectMap.bn.short['english'] = hasEnglish ? "ইং" : "-";
                dynamicSubjectMap.en.short['english'] = hasEnglish ? "ENG" : "-";
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

            // Record active/visible subject slots
            window.activeSubjectSlots = {
                bangla: dynamicSubjectMap.bn.full['bangla'] !== '-' && dynamicSubjectMap.bn.full['bangla'] !== '',
                english: dynamicSubjectMap.bn.full['english'] !== '-' && dynamicSubjectMap.bn.full['english'] !== '',
                math: dynamicSubjectMap.bn.full['math'] !== '-' && dynamicSubjectMap.bn.full['math'] !== '',
                bgs: dynamicSubjectMap.bn.full['bgs'] !== '-' && dynamicSubjectMap.bn.full['bgs'] !== '',
                chem: dynamicSubjectMap.bn.full['chem'] !== '-' && dynamicSubjectMap.bn.full['chem'] !== '',
                phys: dynamicSubjectMap.bn.full['phys'] !== '-' && dynamicSubjectMap.bn.full['phys'] !== '',
                bio: dynamicSubjectMap.bn.full['bio'] !== '-' && dynamicSubjectMap.bn.full['bio'] !== '',
                rel: dynamicSubjectMap.bn.full['rel'] !== '-' && dynamicSubjectMap.bn.full['rel'] !== '',
                ict: dynamicSubjectMap.bn.full['ict'] !== '-' && dynamicSubjectMap.bn.full['ict'] !== '',
                agri: dynamicSubjectMap.bn.full['agri'] !== '-' && dynamicSubjectMap.bn.full['agri'] !== ''
            };

            // Dynamically update full marks and component headers
            if (typeof updateDynamicSubjectMarksAndHeaders === 'function') {
                updateDynamicSubjectMarksAndHeaders();
            }

            // Dynamically update table column visibility (hide empty/uncreated subject columns)
            if (typeof applyTableSettings === 'function') {
                applyTableSettings();
            }
        }
        function changeSubjectFormat(format) {

            currentSubjFormat = format;

            document.getElementById('subj-format').value = format; // Sync UI

            updateSubjects();

        }



        function changeLanguage(lang) {

            const tempLayout = currentLayout;

            if (tempLayout === 'compact') {

                changeTableLayout('default');

            }

            

            currentLang = lang;

            document.getElementById('page-lang').value = lang; // Sync UI

            

            // 1. Translate page headers and school info

            document.querySelectorAll('h2, .meta-info').forEach(el => {

                let text = el.textContent.trim();

                if (lang === 'en') {

                    if (translationMap[text]) {

                        el.textContent = translationMap[text];

                    }

                } else {

                    if (reverseTranslationMap[text]) {

                        el.textContent = reverseTranslationMap[text];

                    }

                }

            });

            

            // 2. Translate non-subject table headers
            document.querySelectorAll('thead th:not([data-subj])').forEach(el => {
                const targetEl = el.querySelector('.v-text-inner') || el;
                const gtTextSpan = targetEl.querySelector('.grand-total-text');
                if (gtTextSpan) {
                    let text = gtTextSpan.textContent.trim();
                    if (lang === 'en') {
                        if (translationMap[text]) gtTextSpan.textContent = translationMap[text];
                    } else {
                        if (reverseTranslationMap[text]) gtTextSpan.textContent = reverseTranslationMap[text];
                    }
                    return;
                }

                const gpaNoOptSpan = targetEl.querySelector('.gpa-no-opt-text');
                if (gpaNoOptSpan) {
                    let text = gpaNoOptSpan.textContent.trim();
                    if (lang === 'en') {
                        if (translationMap[text]) {
                            gpaNoOptSpan.innerHTML = translationMap[text].replace(/\n/g, '<br>');
                        } else if (translationMap["জিপিএ\n(অপশনাল বিষয় ছাড়া)"]) {
                            gpaNoOptSpan.innerHTML = translationMap["জিপিএ\n(অপশনাল বিষয় ছাড়া)"].replace(/\n/g, '<br>');
                        }
                    } else {
                        if (reverseTranslationMap[text]) {
                            gpaNoOptSpan.innerHTML = reverseTranslationMap[text].replace(/\n/g, '<br>');
                        } else {
                            gpaNoOptSpan.innerHTML = 'জিপিএ<br>(অপশনাল বিষয় ছাড়া)';
                        }
                    }
                    return;
                }

                const finalGpaSpan = targetEl.querySelector('.final-gpa-text');
                if (finalGpaSpan) {
                    let text = finalGpaSpan.textContent.trim();
                    if (lang === 'en') {
                        if (translationMap[text]) finalGpaSpan.textContent = translationMap[text];
                    } else {
                        if (reverseTranslationMap[text]) finalGpaSpan.textContent = reverseTranslationMap[text];
                    }
                    return;
                }

                const finalGradeSpan = targetEl.querySelector('.final-grade-text');
                if (finalGradeSpan) {
                    let text = finalGradeSpan.textContent.trim();
                    if (lang === 'en') {
                        if (translationMap[text]) finalGradeSpan.textContent = translationMap[text];
                    } else {
                        if (reverseTranslationMap[text]) finalGradeSpan.textContent = reverseTranslationMap[text];
                    }
                    return;
                }

                const meritRankSpan = targetEl.querySelector('.merit-rank-text');
                if (meritRankSpan) {
                    let text = meritRankSpan.textContent.trim();
                    if (lang === 'en') {
                        if (translationMap[text]) meritRankSpan.textContent = translationMap[text];
                    } else {
                        if (reverseTranslationMap[text]) meritRankSpan.textContent = reverseTranslationMap[text];
                    }
                    return;
                }

                let text = targetEl.textContent.trim();
                if (lang === 'en') {
                    if (translationMap[text]) {
                        targetEl.textContent = translationMap[text];
                    }
                } else {
                    if (reverseTranslationMap[text]) {
                        targetEl.textContent = reverseTranslationMap[text];
                    }
                }
            });

            

            // 3. Update subject headers based on new language and format

            updateSubjects();

            

            // 4. Translate table body rows

            document.querySelectorAll('tbody tr').forEach(row => {

                if (row.classList.contains('section-divider-row')) return;

                let cells = row.querySelectorAll('td');

                cells.forEach((cell, idx) => {

                    if (idx === 1) {

                        // Student Name cell is handled separately by syncStudentNamesFromDatabase()

                    } else {

                        // Roll, marks, GPAs, ranks

                        cell.textContent = translateDigits(cell.textContent, lang);

                        if (cell.hasAttribute('data-orig-val')) {

                            let origVal = cell.getAttribute('data-orig-val');

                            cell.setAttribute('data-orig-val', translateDigits(origVal, lang));

                        }

                    }

                });

            });

            

            if (tempLayout === 'compact') {

                changeTableLayout('compact');

            }

            

            // Translate font size display digits

            const displayEl = document.getElementById('font-size-display');

            if (displayEl) {

                displayEl.textContent = translateDigits(displayEl.textContent, lang);

            }



            // Translate signature labels

            document.querySelectorAll('.signature-item-left span, .signature-item-right span').forEach(el => {

                let text = el.textContent.trim();

                if (lang === 'en') {

                    if (translationMap[text]) {

                        el.textContent = translationMap[text];

                    }

                } else {

                    if (reverseTranslationMap[text]) {

                        el.textContent = reverseTranslationMap[text];

                    }

                }

            });



            // Translate Select Dropdown Options

            const classSelect = document.getElementById('class-filter');

            if (classSelect) {

                [...classSelect.options].forEach(opt => {

                    const bn = opt.getAttribute('data-bn');

                    const en = opt.getAttribute('data-en');

                    if (lang === 'en') {

                        if (en) opt.textContent = en;

                    } else {

                        if (bn) opt.textContent = bn;

                    }

                });

            }



            const examSelect = document.getElementById('exam-filter');

            if (examSelect) {

                [...examSelect.options].forEach(opt => {

                    const bn = opt.getAttribute('data-bn');

                    const en = opt.getAttribute('data-en');

                    if (lang === 'en') {

                        if (en) opt.textContent = en;

                    } else {

                        if (bn) opt.textContent = bn;

                    }

                });

            }



            const gpaMethodSelect = document.getElementById('gpa-calc-method');
            if (gpaMethodSelect) {
                [...gpaMethodSelect.options].forEach(opt => {
                    if (opt.value === 'gpa') {
                        opt.textContent = lang === 'en' ? 'Board GPA' : 'বোর্ড GPA';
                    } else if (opt.value === 'total') {
                        opt.textContent = lang === 'en' ? 'Board Total Mark' : 'বোর্ড মোট মার্ক';
                    }
                });
            }

            // Translate GPA System label
            document.querySelectorAll('label[for="gpa-calc-method"]').forEach(el => {
                el.textContent = lang === 'en' ? 'GPA System:' : 'GPA পদ্ধতি:';
            });

            // Re-sort to refresh translated section divider texts and numbers

            const sortOrderEl = document.getElementById('sort-order');

            if (sortOrderEl) {

                sortStudents(sortOrderEl.value);

            }

        }



        let currentGPACalcMethod = 'gpa';
        try {
            currentGPACalcMethod = localStorage.getItem('tabulation_gpa_method') || 'gpa';
        } catch (e) { }

        const DEFAULT_GRADE_RULES = [
            { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
            { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
            { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
            { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
            { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
            { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
            { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
        ];

        function loadMarkingSystem() {
            let rules = null;
            try {
                const str = localStorage.getItem('school_marking_system');
                if (str) rules = JSON.parse(str);
            } catch (e) { }
            if (!Array.isArray(rules) || rules.length === 0) {
                try {
                    localStorage.setItem('school_marking_system', JSON.stringify(DEFAULT_GRADE_RULES));
                } catch (e) { }
                return DEFAULT_GRADE_RULES.map(r => ({ ...r }));
            }
            return rules.map(r => ({
                id: r.id || '',
                name: (r.name || '').trim(),
                min: parseFloat(r.min) || 0,
                max: parseFloat(r.max) || 0,
                gp: parseFloat(r.gp) || 0
            })).sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
        }

        function getGradeForPercentage(pct, passMarkPercent = null) {
            if (isNaN(pct) || pct === null) {
                return { name: '-', gp: 0.0 };
            }
            const rules = loadMarkingSystem();
            const sortedRules = (Array.isArray(rules) && rules.length > 0 ? [...rules] : [...DEFAULT_GRADE_RULES]).sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
            const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: "F", gp: 0.0 };
            const passingRules = sortedRules.filter(r => parseFloat(r.gp) > 0 && r.name !== 'F');
            const minPassingPct = (passMarkPercent !== null && !isNaN(passMarkPercent)) 
                ? passMarkPercent 
                : (passingRules.length > 0 ? Math.min(...passingRules.map(r => r.min)) : 33);

            if (pct < minPassingPct) {
                return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
            }

            let match = sortedRules.find(r => pct >= parseFloat(r.min) && pct <= parseFloat(r.max));
            if (!match) {
                match = sortedRules.find(r => (pct + 0.001) >= parseFloat(r.min));
            }
            if (match && parseFloat(match.gp) > 0 && match.name !== 'F') {
                return { name: match.name, gp: parseFloat(match.gp) };
            }
            return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
        }

        function getGradeForGPA(gpa) {
            const rules = loadMarkingSystem();
            const sortedRules = (Array.isArray(rules) && rules.length > 0 ? [...rules] : [...DEFAULT_GRADE_RULES]).sort((a, b) => (parseFloat(b.gp) || 0) - (parseFloat(a.gp) || 0));
            const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: "F", gp: 0.0 };
            const passingRules = sortedRules.filter(r => parseFloat(r.gp) > 0 && r.name !== 'F');
            const minPassingGP = passingRules.length > 0 ? Math.min(...passingRules.map(r => r.gp)) : 1.0;

            if (isNaN(gpa) || gpa < minPassingGP) {
                return failRule.name;
            }

            let match = sortedRules.find(r => (gpa + 0.001) >= parseFloat(r.gp));
            return match ? match.name : failRule.name;
        }

        function changeGPACalcMethod(method) {
            currentGPACalcMethod = method;
            try {
                localStorage.setItem('tabulation_gpa_method', method);
            } catch (e) { }
            const sel = document.getElementById('gpa-calc-method');
            if (sel) sel.value = method;
            recalculateTableGradesAndRanks();
            const sortOrderEl = document.getElementById('sort-order');
            if (sortOrderEl && sortOrderEl.value === 'merit') {
                sortStudents('merit');
            }
        }

        function getTabulationTbody() {
            const mainTable = document.getElementById('tabulation-main-table');
            if (mainTable) {
                const tb = mainTable.querySelector('tbody');
                if (tb) return tb;
            }
            const studentRow = document.querySelector('tr[data-section]');
            if (studentRow) {
                const tb = studentRow.closest('tbody');
                if (tb) return tb;
            }
            const allTbodies = document.querySelectorAll('table tbody');
            for (const tb of allTbodies) {
                if (tb.querySelector('tr[data-section]')) return tb;
            }
            return document.querySelector('table tbody');
        }

        function recalculateTableGradesAndRanks() {
            const tbody = getTabulationTbody();
            if (!tbody) return;
            const rows = Array.from(tbody.querySelectorAll('tr[data-section]'));
            if (rows.length === 0) return;

            const rules = loadMarkingSystem();
            const maxScaleGP = Math.max(...rules.map(r => parseFloat(r.gp) || 0), 1.0);
            const failRule = rules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0.0 };

            const allStudentList = [];

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 68) return;

                const getCellFloat = (idx) => {
                    const txt = banglaToEnglishDigits(cells[idx].textContent.trim());
                    if (txt === '-' || txt === '') return NaN;
                    return parseFloat(txt);
                };

                const isCellAbsent = (idx) => {
                    if (!cells[idx]) return false;
                    const txt = cells[idx].textContent.trim().toUpperCase();
                    return txt === 'A' || txt === 'ABS';
                };

                const setCellVal = (idx, num, isFloat = false) => {
                    if (isNaN(num)) {
                        cells[idx].textContent = '-';
                    } else {
                        const str = isFloat ? num.toFixed(2) : (num % 1 === 0 ? num.toString() : num.toFixed(1));
                        const translated = translateDigits(str, currentLang);
                        cells[idx].textContent = translated;
                        if (cells[idx].hasAttribute('data-orig-val')) {
                            cells[idx].setAttribute('data-orig-val', translated);
                        }
                    }
                };

                const curClass = currentFilterClass || 'Ten';
                const curExam = currentFilterExam || 'all';

                let examDef = null;
                try {
                    const examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]');
                    examDef = Array.isArray(examTypes) ? examTypes.find(et => isExamMatch(et.name, curExam)) : null;
                } catch (e) { }

                const passPct = (examDef && examDef.passMarkPercent !== undefined && !isNaN(examDef.passMarkPercent))
                    ? Number(examDef.passMarkPercent)
                    : 33;

                // Component-wise pass check: Pass if mark meets the component's minimum pass mark
                const checkComponentPass = (mark, fullMarks) => {
                    if (!fullMarks || fullMarks <= 0) return true; // Component not attached
                    if (mark === null || mark === undefined || isNaN(mark)) return false; // Absent / missing
                    const minPass = Math.round(fullMarks * (passPct / 100));
                    return (mark >= minPass) || ((mark / fullMarks) * 100 >= passPct);
                };

                // Subject marks distributions dynamically retrieved from Exam List
                const distB1 = getSubjectMarksDistribution('bangla1', curClass, curExam);
                const distB2 = getSubjectMarksDistribution('bangla2', curClass, curExam);
                const distEng1 = getSubjectMarksDistribution('english1', curClass, curExam);
                const distEng2 = getSubjectMarksDistribution('english2', curClass, curExam);
                const distMath = getSubjectMarksDistribution('math', curClass, curExam);
                const distBgs = getSubjectMarksDistribution('bgs', curClass, curExam);
                const distChem = getSubjectMarksDistribution('chem', curClass, curExam);
                const distPhys = getSubjectMarksDistribution('phys', curClass, curExam);
                const distBio = getSubjectMarksDistribution('bio', curClass, curExam);
                const distRel = getSubjectMarksDistribution('rel', curClass, curExam);
                const distIct = getSubjectMarksDistribution('ict', curClass, curExam);
                const distAgri = getSubjectMarksDistribution('agri', curClass, curExam);

                const pracStatus = (typeof getSubjectPracticalStatus === 'function') 
                    ? getSubjectPracticalStatus() 
                    : { chem: distChem.practical > 0, phys: distPhys.practical > 0, bio: distBio.practical > 0, agri: distAgri.practical > 0 };

                // 1. Bangla
                // Sub-paper 1: MCQ (cell 2), Written (cell 3), Total (cell 4)
                const b1MCQ = getCellFloat(2);
                const b1Wri = getCellFloat(3);
                let b1Total = getCellFloat(4);
                if (!isNaN(b1MCQ) || !isNaN(b1Wri)) {
                    b1Total = (isNaN(b1MCQ) ? 0 : b1MCQ) + (isNaN(b1Wri) ? 0 : b1Wri);
                    setCellVal(4, b1Total);
                }

                // Sub-paper 2: MCQ (cell 5), Written (cell 6), Total (cell 7)
                const b2MCQ = getCellFloat(5);
                const b2Wri = getCellFloat(6);
                let b2Total = getCellFloat(7);
                if (!isNaN(b2MCQ) || !isNaN(b2Wri)) {
                    b2Total = (isNaN(b2MCQ) ? 0 : b2MCQ) + (isNaN(b2Wri) ? 0 : b2Wri);
                    setCellVal(7, b2Total);
                }

                // Bangla Grand Total (cell 8) & Avg (cell 9)
                let bGrandTotal = getCellFloat(8);
                if (!isNaN(b1Total) || !isNaN(b2Total)) {
                    bGrandTotal = (isNaN(b1Total) ? 0 : b1Total) + (isNaN(b2Total) ? 0 : b2Total);
                    setCellVal(8, bGrandTotal);
                }

                const hasB1 = distB1.hasSchedule || !isNaN(b1Total);
                const hasB2 = distB2.hasSchedule || !isNaN(b2Total);
                const bPaperCount = (hasB1 && hasB2) ? 2 : 1;
                const bFullMarksTotal = (hasB1 ? (distB1.total || 100) : 0) + (hasB2 ? (distB2.total || 100) : 0) || (distB1.total || 100);
                let banglaAvg = NaN;
                if (!isNaN(bGrandTotal)) {
                    banglaAvg = bGrandTotal / bPaperCount;
                    setCellVal(9, banglaAvg);
                } else {
                    setCellVal(9, NaN);
                }

                const bFullMCQ = (hasB1 ? (distB1.mcq || 0) : 0) + (hasB2 ? (distB2.mcq || 0) : 0);
                const bFullCQ = (hasB1 ? (distB1.cq || 0) : 0) + (hasB2 ? (distB2.cq || 0) : 0);
                const bTotalMCQ = (isNaN(b1MCQ) ? 0 : b1MCQ) + (isNaN(b2MCQ) ? 0 : b2MCQ);
                const bTotalCQ = (isNaN(b1Wri) ? 0 : b1Wri) + (isNaN(b2Wri) ? 0 : b2Wri);

                const bMCQPass = (bFullMCQ <= 0) || checkComponentPass(bTotalMCQ, bFullMCQ);
                const bCQPass = (bFullCQ <= 0) || checkComponentPass(bTotalCQ, bFullCQ);
                const banglaPct = (!isNaN(bGrandTotal) && bFullMarksTotal > 0) ? (bGrandTotal / bFullMarksTotal) * 100 : banglaAvg;
                const bAbsent = isCellAbsent(2) || isCellAbsent(3) || isCellAbsent(4) || isCellAbsent(5) || isCellAbsent(6) || isCellAbsent(7);
                const hasBMarks = !isNaN(b1Total) || !isNaN(b2Total) || bAbsent;

                let banglaInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasBMarks) {
                    const bOverallPass = !bAbsent && bMCQPass && bCQPass && (banglaPct >= passPct);
                    banglaInfo = bAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!bOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(banglaPct, passPct), isAbsent: false });
                    cells[10].textContent = banglaInfo.name;
                    cells[11].textContent = translateDigits(banglaInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[10].textContent = '-';
                    cells[11].textContent = '-';
                }

                // 2. English
                // 1st Paper (cell 12), 2nd Paper (cell 13), Grand Total (cell 14), Avg (cell 15)
                const eng1 = getCellFloat(12);
                const eng2 = getCellFloat(13);
                let engGrandTotal = getCellFloat(14);
                if (!isNaN(eng1) || !isNaN(eng2)) {
                    engGrandTotal = (isNaN(eng1) ? 0 : eng1) + (isNaN(eng2) ? 0 : eng2);
                    setCellVal(14, engGrandTotal);
                }

                const hasEng1 = distEng1.hasSchedule || !isNaN(eng1);
                const hasEng2 = distEng2.hasSchedule || !isNaN(eng2);
                const engPaperCount = (hasEng1 && hasEng2) ? 2 : 1;
                const engFullMarksTotal = (hasEng1 ? (distEng1.total || 100) : 0) + (hasEng2 ? (distEng2.total || 100) : 0) || (distEng1.total || 100);
                let engAvg = NaN;
                if (!isNaN(engGrandTotal)) {
                    engAvg = engGrandTotal / engPaperCount;
                    setCellVal(15, engAvg);
                } else {
                    setCellVal(15, NaN);
                }

                const engPct = (!isNaN(engGrandTotal) && engFullMarksTotal > 0) ? (engGrandTotal / engFullMarksTotal) * 100 : engAvg;
                const engAbsent = isCellAbsent(12) || isCellAbsent(13) || isCellAbsent(14);
                const hasEngMarks = !isNaN(engGrandTotal) || engAbsent;

                let engInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasEngMarks) {
                    const engCQPass = checkComponentPass(engGrandTotal, engFullMarksTotal);
                    const engOverallPass = !engAbsent && engCQPass && (engPct >= passPct);
                    engInfo = engAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!engOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(engPct, passPct), isAbsent: false });
                    cells[16].textContent = engInfo.name;
                    cells[17].textContent = translateDigits(engInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[16].textContent = '-';
                    cells[17].textContent = '-';
                }

                // 3. Math (MCQ cell 18, Written cell 19, Total cell 20)
                const mathMCQ = getCellFloat(18);
                const mathWri = getCellFloat(19);
                let mathTotal = getCellFloat(20);
                if (!isNaN(mathMCQ) || !isNaN(mathWri)) {
                    mathTotal = (isNaN(mathMCQ) ? 0 : mathMCQ) + (isNaN(mathWri) ? 0 : mathWri);
                    setCellVal(20, mathTotal);
                }
                const mathFull = distMath.total || 100;
                const mathPct = !isNaN(mathTotal) ? (mathTotal / mathFull) * 100 : NaN;
                const mathAbsent = isCellAbsent(18) || isCellAbsent(19) || isCellAbsent(20);
                const hasMathMarks = !isNaN(mathTotal) || mathAbsent;

                let mathInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasMathMarks) {
                    const mathMCQFull = distMath.mcq || 0;
                    const mathCQFull = distMath.cq || 0;
                    const mathMCQPass = (mathMCQFull <= 0) || checkComponentPass(mathMCQ, mathMCQFull);
                    const mathCQPass = (mathCQFull <= 0) || checkComponentPass(mathWri, mathCQFull);
                    const mathOverallPass = !mathAbsent && mathMCQPass && mathCQPass && (mathPct >= passPct);

                    mathInfo = mathAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!mathOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(mathPct, passPct), isAbsent: false });
                    cells[21].textContent = mathInfo.name;
                    cells[22].textContent = translateDigits(mathInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[21].textContent = '-';
                    cells[22].textContent = '-';
                }

                // 4. BGS (MCQ cell 23, Written cell 24, Total cell 25)
                const bgsMCQ = getCellFloat(23);
                const bgsWri = getCellFloat(24);
                let bgsTotal = getCellFloat(25);
                if (!isNaN(bgsMCQ) || !isNaN(bgsWri)) {
                    bgsTotal = (isNaN(bgsMCQ) ? 0 : bgsMCQ) + (isNaN(bgsWri) ? 0 : bgsWri);
                    setCellVal(25, bgsTotal);
                }
                const bgsFull = distBgs.total || 100;
                const bgsPct = !isNaN(bgsTotal) ? (bgsTotal / bgsFull) * 100 : NaN;
                const bgsAbsent = isCellAbsent(23) || isCellAbsent(24) || isCellAbsent(25);
                const hasBgsMarks = !isNaN(bgsTotal) || bgsAbsent;

                let bgsInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasBgsMarks) {
                    const bgsMCQFull = distBgs.mcq || 0;
                    const bgsCQFull = distBgs.cq || 0;
                    const bgsMCQPass = (bgsMCQFull <= 0) || checkComponentPass(bgsMCQ, bgsMCQFull);
                    const bgsCQPass = (bgsCQFull <= 0) || checkComponentPass(bgsWri, bgsCQFull);
                    const bgsOverallPass = !bgsAbsent && bgsMCQPass && bgsCQPass && (bgsPct >= passPct);

                    bgsInfo = bgsAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!bgsOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(bgsPct, passPct), isAbsent: false });
                    cells[26].textContent = bgsInfo.name;
                    cells[27].textContent = translateDigits(bgsInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[26].textContent = '-';
                    cells[27].textContent = '-';
                }

                // 5. Chemistry / Science (MCQ cell 28, Written cell 29, Practical cell 30, Total cell 31)
                const chemMCQ = getCellFloat(28);
                const chemWri = getCellFloat(29);
                const chemPrac = pracStatus.chem ? getCellFloat(30) : 0;
                let chemTotal = getCellFloat(31);
                if (!isNaN(chemMCQ) || !isNaN(chemWri) || (pracStatus.chem && !isNaN(chemPrac))) {
                    chemTotal = (isNaN(chemMCQ) ? 0 : chemMCQ) + (isNaN(chemWri) ? 0 : chemWri) + (pracStatus.chem && !isNaN(chemPrac) ? chemPrac : 0);
                    setCellVal(31, chemTotal);
                }
                const chemFull = distChem.total || 100;
                const chemPct = !isNaN(chemTotal) ? (chemTotal / chemFull) * 100 : NaN;
                const chemAbsent = isCellAbsent(28) || isCellAbsent(29) || (pracStatus.chem && isCellAbsent(30)) || isCellAbsent(31);
                const hasChemMarks = !isNaN(chemTotal) || chemAbsent;

                let chemInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasChemMarks) {
                    const chemMCQFull = distChem.mcq || 0;
                    const chemCQFull = distChem.cq || 0;
                    const chemPracFull = (pracStatus.chem && distChem.practical) ? distChem.practical : 0;
                    const chemMCQPass = (chemMCQFull <= 0) || checkComponentPass(chemMCQ, chemMCQFull);
                    const chemCQPass = (chemCQFull <= 0) || checkComponentPass(chemWri, chemCQFull);
                    const chemPracPass = (chemPracFull <= 0) || checkComponentPass(chemPrac, chemPracFull);
                    const chemOverallPass = !chemAbsent && chemMCQPass && chemCQPass && chemPracPass && (chemPct >= passPct);

                    chemInfo = chemAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!chemOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(chemPct, passPct), isAbsent: false });
                    cells[32].textContent = chemInfo.name;
                    cells[33].textContent = translateDigits(chemInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[32].textContent = '-';
                    cells[33].textContent = '-';
                }

                // 6. Physics (MCQ cell 34, Written cell 35, Practical cell 36, Total cell 37)
                const physMCQ = getCellFloat(34);
                const physWri = getCellFloat(35);
                const physPrac = pracStatus.phys ? getCellFloat(36) : 0;
                let physTotal = getCellFloat(37);
                if (!isNaN(physMCQ) || !isNaN(physWri) || (pracStatus.phys && !isNaN(physPrac))) {
                    physTotal = (isNaN(physMCQ) ? 0 : physMCQ) + (isNaN(physWri) ? 0 : physWri) + (pracStatus.phys && !isNaN(physPrac) ? physPrac : 0);
                    setCellVal(37, physTotal);
                }
                const physFull = distPhys.total || 100;
                const physPct = !isNaN(physTotal) ? (physTotal / physFull) * 100 : NaN;
                const physAbsent = isCellAbsent(34) || isCellAbsent(35) || (pracStatus.phys && isCellAbsent(36)) || isCellAbsent(37);
                const hasPhysMarks = !isNaN(physTotal) || physAbsent;

                let physInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasPhysMarks) {
                    const physMCQFull = distPhys.mcq || 0;
                    const physCQFull = distPhys.cq || 0;
                    const physPracFull = (pracStatus.phys && distPhys.practical) ? distPhys.practical : 0;
                    const physMCQPass = (physMCQFull <= 0) || checkComponentPass(physMCQ, physMCQFull);
                    const physCQPass = (physCQFull <= 0) || checkComponentPass(physWri, physCQFull);
                    const physPracPass = (physPracFull <= 0) || checkComponentPass(physPrac, physPracFull);
                    const physOverallPass = !physAbsent && physMCQPass && physCQPass && physPracPass && (physPct >= passPct);

                    physInfo = physAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!physOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(physPct, passPct), isAbsent: false });
                    cells[38].textContent = physInfo.name;
                    cells[39].textContent = translateDigits(physInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[38].textContent = '-';
                    cells[39].textContent = '-';
                }

                // 7. Biology (MCQ cell 40, Written cell 41, Practical cell 42, Total cell 43)
                const bioMCQ = getCellFloat(40);
                const bioWri = getCellFloat(41);
                const bioPrac = pracStatus.bio ? getCellFloat(42) : 0;
                let bioTotal = getCellFloat(43);
                if (!isNaN(bioMCQ) || !isNaN(bioWri) || (pracStatus.bio && !isNaN(bioPrac))) {
                    bioTotal = (isNaN(bioMCQ) ? 0 : bioMCQ) + (isNaN(bioWri) ? 0 : bioWri) + (pracStatus.bio && !isNaN(bioPrac) ? bioPrac : 0);
                    setCellVal(43, bioTotal);
                }
                const bioFull = distBio.total || 100;
                const bioPct = !isNaN(bioTotal) ? (bioTotal / bioFull) * 100 : NaN;
                const bioAbsent = isCellAbsent(40) || isCellAbsent(41) || (pracStatus.bio && isCellAbsent(42)) || isCellAbsent(43);
                const hasBioMarks = !isNaN(bioTotal) || bioAbsent;

                let bioInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasBioMarks) {
                    const bioMCQFull = distBio.mcq || 0;
                    const bioCQFull = distBio.cq || 0;
                    const bioPracFull = (pracStatus.bio && distBio.practical) ? distBio.practical : 0;
                    const bioMCQPass = (bioMCQFull <= 0) || checkComponentPass(bioMCQ, bioMCQFull);
                    const bioCQPass = (bioCQFull <= 0) || checkComponentPass(bioWri, bioCQFull);
                    const bioPracPass = (bioPracFull <= 0) || checkComponentPass(bioPrac, bioPracFull);
                    const bioOverallPass = !bioAbsent && bioMCQPass && bioCQPass && bioPracPass && (bioPct >= passPct);

                    bioInfo = bioAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!bioOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(bioPct, passPct), isAbsent: false });
                    cells[44].textContent = bioInfo.name;
                    cells[45].textContent = translateDigits(bioInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[44].textContent = '-';
                    cells[45].textContent = '-';
                }

                // 8. Religion (MCQ cell 46, Written cell 47, Total cell 48)
                const relMCQ = getCellFloat(46);
                const relWri = getCellFloat(47);
                let relTotal = getCellFloat(48);
                if (!isNaN(relMCQ) || !isNaN(relWri)) {
                    relTotal = (isNaN(relMCQ) ? 0 : relMCQ) + (isNaN(relWri) ? 0 : relWri);
                    setCellVal(48, relTotal);
                }
                const relFull = distRel.total || 100;
                const relPct = !isNaN(relTotal) ? (relTotal / relFull) * 100 : NaN;
                const relAbsent = isCellAbsent(46) || isCellAbsent(47) || isCellAbsent(48);
                const hasRelMarks = !isNaN(relTotal) || relAbsent;

                let relInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasRelMarks) {
                    const relMCQFull = distRel.mcq || 0;
                    const relCQFull = distRel.cq || 0;
                    const relMCQPass = (relMCQFull <= 0) || checkComponentPass(relMCQ, relMCQFull);
                    const relCQPass = (relCQFull <= 0) || checkComponentPass(relWri, relCQFull);
                    const relOverallPass = !relAbsent && relMCQPass && relCQPass && (relPct >= passPct);

                    relInfo = relAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!relOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(relPct, passPct), isAbsent: false });
                    cells[49].textContent = relInfo.name;
                    cells[50].textContent = translateDigits(relInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[49].textContent = '-';
                    cells[50].textContent = '-';
                }

                // 9. ICT (MCQ cell 51, Written cell 52, Total cell 53)
                const ictMCQ = getCellFloat(51);
                const ictWri = getCellFloat(52);
                let ictTotal = getCellFloat(53);
                if (!isNaN(ictMCQ) || !isNaN(ictWri)) {
                    ictTotal = (isNaN(ictMCQ) ? 0 : ictMCQ) + (isNaN(ictWri) ? 0 : ictWri);
                    setCellVal(53, ictTotal);
                }
                const ictFull = distIct.total || 50;
                const ictPct = !isNaN(ictTotal) ? (ictTotal / ictFull) * 100 : NaN;
                const ictAbsent = isCellAbsent(51) || isCellAbsent(52) || isCellAbsent(53);
                const hasIctMarks = !isNaN(ictTotal) || ictAbsent;

                let ictInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasIctMarks) {
                    const ictMCQFull = distIct.mcq || 0;
                    const ictCQFull = distIct.cq || 0;
                    const ictMCQPass = (ictMCQFull <= 0) || checkComponentPass(ictMCQ, ictMCQFull);
                    const ictCQPass = (ictCQFull <= 0) || checkComponentPass(ictWri, ictCQFull);
                    const ictOverallPass = !ictAbsent && ictMCQPass && ictCQPass && (ictPct >= passPct);

                    ictInfo = ictAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!ictOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(ictPct, passPct), isAbsent: false });
                    cells[54].textContent = ictInfo.name;
                    cells[55].textContent = translateDigits(ictInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[54].textContent = '-';
                    cells[55].textContent = '-';
                }

                // 10. Agriculture / Higher Math (Optional Subject)
                const optMCQ = getCellFloat(56);
                const optWri = getCellFloat(57);
                const optPrac = pracStatus.agri ? getCellFloat(58) : 0;
                let optTotal = getCellFloat(59);
                if (!isNaN(optMCQ) || !isNaN(optWri) || (pracStatus.agri && !isNaN(optPrac))) {
                    optTotal = (isNaN(optMCQ) ? 0 : optMCQ) + (isNaN(optWri) ? 0 : optWri) + (pracStatus.agri && !isNaN(optPrac) ? optPrac : 0);
                    setCellVal(59, optTotal);
                }
                const optFull = distAgri.total || 100;
                const optPct = !isNaN(optTotal) ? (optTotal / optFull) * 100 : NaN;
                const optAbsent = isCellAbsent(56) || isCellAbsent(57) || (pracStatus.agri && isCellAbsent(58)) || isCellAbsent(59);
                const hasOptMarks = !isNaN(optTotal) || optAbsent;

                let optInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasOptMarks) {
                    const optMCQFull = distAgri.mcq || 0;
                    const optCQFull = distAgri.cq || 0;
                    const optPracFull = (pracStatus.agri && distAgri.practical) ? distAgri.practical : 0;
                    const optMCQPass = (optMCQFull <= 0) || checkComponentPass(optMCQ, optMCQFull);
                    const optCQPass = (optCQFull <= 0) || checkComponentPass(optWri, optCQFull);
                    const optPracPass = (optPracFull <= 0) || checkComponentPass(optPrac, optPracFull);
                    const optOverallPass = !optAbsent && optMCQPass && optCQPass && optPracPass && (optPct >= passPct);

                    optInfo = optAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!optOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(optPct, passPct), isAbsent: false });
                    cells[60].textContent = optInfo.name;
                    cells[61].textContent = translateDigits(optInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[60].textContent = '-';
                    cells[61].textContent = '-';
                }

                // Main Subjects List (Only include active slots for current class)
                const candidateSubjects = [
                    { slot: 'bangla', info: banglaInfo, total: bGrandTotal, full: bFullMarksTotal, isAbsent: bAbsent },
                    { slot: 'english', info: engInfo, total: engGrandTotal, full: engFullMarksTotal, isAbsent: engAbsent },
                    { slot: 'math', info: mathInfo, total: mathTotal, full: mathFull, isAbsent: mathAbsent },
                    { slot: 'bgs', info: bgsInfo, total: bgsTotal, full: bgsFull, isAbsent: bgsAbsent },
                    { slot: 'chem', info: chemInfo, total: chemTotal, full: chemFull, isAbsent: chemAbsent },
                    { slot: 'phys', info: physInfo, total: physTotal, full: physFull, isAbsent: physAbsent },
                    { slot: 'bio', info: bioInfo, total: bioTotal, full: bioFull, isAbsent: bioAbsent },
                    { slot: 'rel', info: relInfo, total: relTotal, full: relFull, isAbsent: relAbsent },
                    { slot: 'ict', info: ictInfo, total: ictTotal, full: ictFull, isAbsent: ictAbsent }
                ];
                const activeMain = candidateSubjects.filter(cs => isSubjectSlotActive(cs.slot));
                const mainSubjects = activeMain.map(cs => cs.info);
                const hasValidMainSubjects = mainSubjects.some(s => s.name !== '-');

                // Check if student has Abs in one or more active subjects
                const isOptActive = isSubjectSlotActive('agri');
                const hasAnyAbsent = activeMain.some(cs => cs.isAbsent) || (isOptActive && optAbsent);

                let failsCount = 0;
                let mainGPSum = 0;
                let mainSubCount = 0;

                if (hasValidMainSubjects) {
                    mainSubjects.forEach(sub => {
                        if (sub.name !== '-') {
                            mainSubCount++;
                            mainGPSum += sub.gp;
                            if (sub.gp === 0 || sub.name === failRule.name || sub.name === 'F' || sub.name === 'A' || sub.isAbsent) {
                                failsCount++;
                            }
                        }
                    });
                }

                // Find minimum percentage for GP 2.00 (defaults to 40) from active scale
                const ruleFor2GP = rules.find(r => parseFloat(r.gp) === 2.00) || { min: 40 };
                const optBaseDeductPct = parseFloat(ruleFor2GP.min) || 40;
                const optBaseDeductMarks = (optBaseDeductPct / 100) * optFull;

                // Optional bonus: extra GP above 2.00 and extra marks above 2.00 threshold
                const optionalBonusGP = (isOptActive && !isNaN(optTotal) && !optAbsent && optInfo.name !== '-' && optInfo.gp > 2.00) ? (optInfo.gp - 2.00) : 0;
                const optionalBonusMarks = (isOptActive && !isNaN(optTotal) && !optAbsent && optTotal > optBaseDeductMarks) ? (optTotal - optBaseDeductMarks) : 0;

                // Grand Total (Cell 62): Sum of active main subjects + Optional extra marks above 2.00 (above 40 marks)
                let computedGrandTotal = 0;
                let hasAnySubject = false;
                activeMain.forEach(item => {
                    if (!isNaN(item.total)) {
                        computedGrandTotal += item.total;
                        hasAnySubject = true;
                    } else if (item.isAbsent) {
                        hasAnySubject = true;
                    }
                });
                if (isOptActive && (!isNaN(optTotal) || optAbsent)) {
                    hasAnySubject = true;
                    if (!isNaN(optTotal) && !optAbsent) {
                        computedGrandTotal += optionalBonusMarks;
                    }
                }
                const grandTotalRaw = hasAnySubject ? computedGrandTotal : 0;

                let displayGpaNoOpt = 0.00;
                let displayFinalGpa = 0.00;
                let displayFinalGrade = hasAnyAbsent ? 'A' : (failRule.name || 'F');

                if (hasValidMainSubjects && mainSubCount > 0) {
                    if (hasAnyAbsent) {
                        // Policy: If student is Abs in one or more subjects, final Grade is 'A' (Absent), GPA is 0.00
                        displayFinalGrade = 'A';
                        displayFinalGpa = 0.00;
                        displayGpaNoOpt = 0.00;
                    } else if (failsCount > 0) {
                        displayFinalGpa = 0.00;
                        displayFinalGrade = failRule.name || 'F';
                        displayGpaNoOpt = 0.00;
                    } else {
                        if (currentGPACalcMethod === 'total') {
                            // Total Mark Based Method (dynamically calculated from all active main subject full marks)
                            const totalMax = activeMain.reduce((sum, item) => sum + (item.full || 100), 0);
                            const pct = (totalMax > 0) ? (grandTotalRaw / totalMax) * 100 : 0;
                            const totalGradeInfo = getGradeForPercentage(pct);
                            displayFinalGpa = totalGradeInfo.gp;
                            displayFinalGrade = totalGradeInfo.name;
                            displayGpaNoOpt = totalGradeInfo.gp;
                        } else {
                            // Standard Board GPA Method
                            displayGpaNoOpt = mainGPSum / mainSubCount;
                            const rawFinalGPA = (mainGPSum + optionalBonusGP) / mainSubCount;
                            displayFinalGpa = Math.min(maxScaleGP, rawFinalGPA);
                            displayFinalGrade = getGradeForGPA(displayFinalGpa);
                        }
                    }
                }

                // If student has no entered marks, display '-' for all summary cells
                if (!hasAnySubject) {
                    cells[62].textContent = '-';
                    cells[63].textContent = '-';
                    cells[64].textContent = '-';
                    cells[65].textContent = '-';
                    cells[66].textContent = '-';
                    cells[67].textContent = '-';
                } else {
                    setCellVal(62, grandTotalRaw);
                    cells[63].textContent = translateDigits(failsCount.toString(), currentLang);
                    cells[64].textContent = translateDigits(displayGpaNoOpt.toFixed(2), currentLang);
                    cells[65].textContent = translateDigits(displayFinalGpa.toFixed(2), currentLang);
                    cells[66].textContent = displayFinalGrade;
                }

                const rollRaw = banglaToEnglishDigits(cells[0].textContent.trim());
                const digitsOnly = rollRaw.replace(/\D/g, '');
                const sec = row.getAttribute('data-section') || 'Unassigned';

                allStudentList.push({
                    row: row,
                    sec: sec,
                    hasAnySubject: hasAnySubject,
                    computedGpa: displayFinalGpa,
                    computedGrade: displayFinalGrade,
                    fails: failsCount,
                    hasAbsent: hasAnyAbsent,
                    grandTotal: grandTotalRaw,
                    rollInt: parseInt(digitsOnly, 10) || 0
                });
            });

            // Calculate strictly UNIQUE sequential Merit Ranks across all students (No duplicate ranks!)
            const rankedStudents = allStudentList.filter(s => s.hasAnySubject);
            if (currentGPACalcMethod === 'total') {
                rankedStudents.sort((a, b) => {
                    const aFailed = a.fails > 0 || a.hasAbsent;
                    const bFailed = b.fails > 0 || b.hasAbsent;
                    if (aFailed !== bFailed) return aFailed ? 1 : -1;
                    if (aFailed && bFailed) {
                        // Failed / absent students are ranked strictly based on "সর্বমোট" (Grand Total) marks
                        if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
                        if (a.rollInt !== b.rollInt) return a.rollInt - b.rollInt;
                        return a.sec.localeCompare(b.sec);
                    }
                    if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
                    if (b.computedGpa !== a.computedGpa) return b.computedGpa - a.computedGpa;
                    if (a.rollInt !== b.rollInt) return a.rollInt - b.rollInt;
                    return a.sec.localeCompare(b.sec);
                });
            } else {
                rankedStudents.sort((a, b) => {
                    const aFailed = a.fails > 0 || a.hasAbsent;
                    const bFailed = b.fails > 0 || b.hasAbsent;
                    if (aFailed !== bFailed) return aFailed ? 1 : -1;
                    if (aFailed && bFailed) {
                        // Failed / absent students are ranked strictly based on "সর্বমোট" (Grand Total) marks
                        if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
                        if (a.rollInt !== b.rollInt) return a.rollInt - b.rollInt;
                        return a.sec.localeCompare(b.sec);
                    }
                    if (b.computedGpa !== a.computedGpa) return b.computedGpa - a.computedGpa;
                    if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
                    if (a.rollInt !== b.rollInt) return a.rollInt - b.rollInt;
                    return a.sec.localeCompare(b.sec);
                });
            }

            // Assign unique 1..N rank with ZERO duplicate ranks for students with marks
            allStudentList.forEach(st => {
                const rankCell = st.row.querySelectorAll('td')[67];
                if (rankCell) rankCell.textContent = '-';
            });
            rankedStudents.forEach((st, idx) => {
                const rankNum = idx + 1;
                const rankCell = st.row.querySelectorAll('td')[67];
                if (rankCell) {
                    rankCell.textContent = translateDigits(rankNum.toString(), currentLang);
                }
            });

            if (currentLayout === 'compact') {
                applyTableSettings();
            }

            highlightFailures();
        }

        // --- Attach table live editing listeners ---
        document.addEventListener('DOMContentLoaded', () => {
            const tableBody = getTabulationTbody();
            if (tableBody) {
                tableBody.addEventListener('input', () => recalculateTableGradesAndRanks());
                tableBody.addEventListener('blur', () => recalculateTableGradesAndRanks(), true);
            }
        });


        // --- Grading System Preview Modal Helpers ---
        function openGradingSystemModal() {
            renderGradingSystemModalContent();
            const modal = document.getElementById('grading-system-modal');
            if (modal) modal.style.display = 'flex';
        }

        function closeGradingSystemModal() {
            const modal = document.getElementById('grading-system-modal');
            if (modal) modal.style.display = 'none';
        }

        function renderGradingSystemModalContent() {
            const container = document.getElementById('grading-scale-table-container');
            if (!container) return;

            const rules = loadMarkingSystem();
            const maxGP = Math.max(...rules.map(r => parseFloat(r.gp) || 0), 1.0);

            let html = `
                <div style="margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <span style="font-size:0.88rem; color:#0f172a; font-weight:700;">
                        স্কেল টাইপ: <span style="color:#2563eb; background:#eff6ff; padding:2px 8px; border-radius:6px; border:1px solid #bfdbfe;">${maxGP.toFixed(2)} Scale</span>
                    </span>
                    <span style="font-size:0.8rem; color:#16a34a; font-weight:700; background:#f0fdf4; border:1px solid #bbf7d0; padding:2px 8px; border-radius:6px;">
                        ● লাইভ সক্রিয় স্কেল
                    </span>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:0.9rem; text-align:center; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden;">
                    <thead>
                        <tr style="background:#f1f5f9; color:#0f172a; font-weight:800; border-bottom:1.5px solid #cbd5e1;">
                            <th style="padding:8px; border:1px solid #cbd5e1;">লেটার গ্রেড</th>
                            <th style="padding:8px; border:1px solid #cbd5e1;">নম্বর পরিসীমা (%)</th>
                            <th style="padding:8px; border:1px solid #cbd5e1;">গ্রেড পয়েন্ট (GP)</th>
                            <th style="padding:8px; border:1px solid #cbd5e1;">অবস্থা (Status)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            rules.forEach(rule => {
                const isFail = parseFloat(rule.gp) === 0 || rule.name === 'F';
                const gradeColor = isFail ? '#dc2626' : (rule.gp >= 4.0 ? '#16a34a' : (rule.gp >= 3.0 ? '#2563eb' : '#d97706'));
                const gradeBg = isFail ? '#fef2f2' : (rule.gp >= 4.0 ? '#f0fdf4' : (rule.gp >= 3.0 ? '#eff6ff' : '#fffbeb'));
                const gradeBorder = isFail ? '#fca5a5' : (rule.gp >= 4.0 ? '#bbf7d0' : (rule.gp >= 3.0 ? '#bfdbfe' : '#fde68a'));

                html += `
                    <tr style="border-bottom:1px solid #e2e8f0; background:${isFail ? '#fff8f8' : '#ffffff'};">
                        <td style="padding:8px; border:1px solid #cbd5e1;">
                            <span style="display:inline-block; min-width:40px; padding:3px 8px; border-radius:6px; font-weight:800; color:${gradeColor}; background:${gradeBg}; border:1px solid ${gradeBorder};">
                                ${rule.name}
                            </span>
                        </td>
                        <td style="padding:8px; border:1px solid #cbd5e1; font-weight:700; color:#0f172a;">
                            ${translateDigits(rule.min.toString(), currentLang)}% - ${translateDigits(rule.max.toString(), currentLang)}%
                        </td>
                        <td style="padding:8px; border:1px solid #cbd5e1; font-weight:800; color:#0f766e;">
                            ${translateDigits(parseFloat(rule.gp).toFixed(2), currentLang)}
                        </td>
                        <td style="padding:8px; border:1px solid #cbd5e1; font-weight:700; font-size:0.84rem;">
                            <span style="color:${isFail ? '#dc2626' : '#16a34a'};">${isFail ? 'ফেল (Fail)' : 'উত্তীর্ণ (Pass)'}</span>
                        </td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            container.innerHTML = html;
        }

        // --- Grand Total (সর্বমোট) Policy Modal Helpers ---
        function openGrandTotalPolicyModal(event) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const modal = document.getElementById('grand-total-policy-modal');
            if (modal) modal.style.display = 'flex';
        }

        function closeGrandTotalPolicyModal() {
            const modal = document.getElementById('grand-total-policy-modal');
            if (modal) modal.style.display = 'none';
        }

        // --- GPA Without Optional (জিপিএ - অপশনাল বিষয় ছাড়া) Policy Modal Helpers ---
        function openGpaNoOptPolicyModal(event) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const modal = document.getElementById('gpa-no-opt-policy-modal');
            if (modal) modal.style.display = 'flex';
        }

        function closeGpaNoOptPolicyModal() {
            const modal = document.getElementById('gpa-no-opt-policy-modal');
            if (modal) modal.style.display = 'none';
        }

        // --- Final GPA (চূড়ান্ত জিপিএ) Policy Modal Helpers ---
        function openFinalGpaPolicyModal(event) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const modal = document.getElementById('final-gpa-policy-modal');
            if (modal) modal.style.display = 'flex';
        }

        function closeFinalGpaPolicyModal() {
            const modal = document.getElementById('final-gpa-policy-modal');
            if (modal) modal.style.display = 'none';
        }

        // --- Final Letter Grade (চূড়ান্ত গ্রেড) Policy Modal Helpers ---
        function openFinalGradePolicyModal(event) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const modal = document.getElementById('final-grade-policy-modal');
            if (modal) modal.style.display = 'flex';
        }

        function closeFinalGradePolicyModal() {
            const modal = document.getElementById('final-grade-policy-modal');
            if (modal) modal.style.display = 'none';
        }

        // --- Merit Rank (মেধা স্থান) Policy Modal Helpers ---
        function openMeritRankPolicyModal(event) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const modal = document.getElementById('merit-rank-policy-modal');
            if (modal) modal.style.display = 'flex';
        }

        function closeMeritRankPolicyModal() {
            const modal = document.getElementById('merit-rank-policy-modal');
            if (modal) modal.style.display = 'none';
        }


        let currentLayout = 'default';

        let currentMCQWritten = 'show';



        function changeTableLayout(layout) {

            currentLayout = layout;

            applyTableSettings();

        }



        function changeMCQWritten(val) {
            currentMCQWritten = val;
            applyTableSettings();
        }

        // --- SUBJECT & PRACTICAL STATUS RESOLUTION (from Exam List & Schedules) ---
        function getSubjectSlot(subName, subCode) {
            const sName = (subName || '').trim().toLowerCase();
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
        }

        // Dynamic Marks Distribution (MCQ, CQ, Practical, Total) extracted directly from "Exam List" (school_exam_schedules & school_exam_types)
        function getSubjectMarksDistribution(slotKey, className, examName) {
            let schedules = [];
            let examTypes = [];
            try { schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]'); } catch (e) { }
            try { examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]'); } catch (e) { }

            const targetClass = (className || currentFilterClass || 'Ten').toString().trim();
            const targetExam = (examName || currentFilterExam || 'all').toString().trim();
            const isSeniorClass = ['ten', 'nine', '10', '9', '১০ম', '৯ম'].some(k => targetClass.toLowerCase().includes(k));

            // Standard baseline distributions
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

            // Find matching schedule for this slot in (targetExam, targetClass)
            let matchedSchedule = null;
            if (Array.isArray(schedules) && schedules.length > 0) {
                matchedSchedule = schedules.find(s => {
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
                // Find corresponding exam type config in school_exam_types
                const sTerm = matchedSchedule.term || matchedSchedule.examName || targetExam;
                const examDef = Array.isArray(examTypes) ? examTypes.find(et => isExamMatch(et.name, sTerm)) : null;

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

        // Dynamically updates component headers (MCQ / CQ / Prac / Total) and Row 5 Full Marks from Exam List
        function updateDynamicSubjectMarksAndHeaders() {
            const cls = currentFilterClass || 'Ten';
            const exam = currentFilterExam || 'all';
            const lang = (currentLang === 'en') ? 'en' : 'bn';

            const slots = ['bangla1', 'bangla2', 'english1', 'english2', 'math', 'bgs', 'chem', 'phys', 'bio', 'rel', 'ict', 'agri'];
            const distMap = {};
            slots.forEach(k => {
                distMap[k] = getSubjectMarksDistribution(k, cls, exam);
            });

            // 1. Update component headers (MCQ / বহুনির্বাচনি, Written / লিখিত, Prac / ব্যবহারিক, Total / মোট)
            const componentLabels = {
                bn: {
                    mcq: 'বহুনির্বাচনি',
                    written: 'লিখিত',
                    practical: 'ব্যবহারিক',
                    total: 'মোট',
                    grand_total: 'সর্বমোট',
                    grade: 'গ্রেড',
                    point: 'পয়েন্ট',
                    avg: 'গড় প্রাপ্ত'
                },
                en: {
                    mcq: 'MCQ',
                    written: 'Written',
                    practical: 'Prac',
                    total: 'Total',
                    grand_total: 'Total',
                    grade: 'Grade',
                    point: 'Point',
                    avg: 'Avg'
                }
            };

            document.querySelectorAll('thead th[data-col-type]:not([data-fullmark])').forEach(th => {
                const type = th.getAttribute('data-col-type');
                if (type && componentLabels[lang] && componentLabels[lang][type]) {
                    const label = componentLabels[lang][type];
                    let inner = th.querySelector('.v-text-inner');
                    if (!inner) {
                        inner = document.createElement('div');
                        inner.className = 'v-text-inner';
                        inner.textContent = label;
                        th.textContent = '';
                        th.appendChild(inner);
                    } else {
                        inner.textContent = label;
                    }
                    if (!th.classList.contains('v-text-cell')) {
                        th.classList.remove('v-text');
                        th.classList.add('v-text-cell');
                    }
                }
            });

            // 2. Update Row 5 (Full Marks Row)
            document.querySelectorAll('thead th[data-fullmark]').forEach(th => {
                const subj = th.getAttribute('data-subj');
                const ftype = th.getAttribute('data-fullmark');
                if (!subj || !ftype) return;

                let markVal = 0;
                let hasSched = true;
                if (ftype === 'grand_total') {
                    const b1Has = distMap.bangla1?.hasSchedule;
                    const b2Has = distMap.bangla2?.hasSchedule;
                    const e1Has = distMap.english1?.hasSchedule;
                    const e2Has = distMap.english2?.hasSchedule;
                    if (subj === 'bangla') {
                        if (!b1Has && !b2Has && exam !== 'all') {
                            hasSched = false;
                        } else {
                            markVal = (b1Has ? (distMap.bangla1?.total || 0) : 0) + (b2Has ? (distMap.bangla2?.total || 0) : 0);
                        }
                    } else if (subj === 'english') {
                        if (!e1Has && !e2Has && exam !== 'all') {
                            hasSched = false;
                        } else {
                            markVal = (e1Has ? (distMap.english1?.total || 0) : 0) + (e2Has ? (distMap.english2?.total || 0) : 0);
                        }
                    }
                } else if (distMap[subj]) {
                    if (!distMap[subj].hasSchedule && exam !== 'all') {
                        hasSched = false;
                    } else {
                        if (ftype === 'mcq') markVal = distMap[subj].mcq;
                        else if (ftype === 'written') markVal = distMap[subj].cq;
                        else if (ftype === 'practical') markVal = distMap[subj].practical;
                        else if (ftype === 'total') markVal = distMap[subj].total;
                    }
                }

                th.textContent = hasSched ? translateDigits(String(markVal), lang) : '-';
            });
        }

        function getSubjectPracticalStatus() {
            const cls = currentFilterClass || 'Ten';
            const exam = currentFilterExam || 'all';

            const dChem = getSubjectMarksDistribution('chem', cls, exam);
            const dPhys = getSubjectMarksDistribution('phys', cls, exam);
            const dBio = getSubjectMarksDistribution('bio', cls, exam);
            const dAgri = getSubjectMarksDistribution('agri', cls, exam);

            const isSpecific = (exam !== 'all');
            return {
                chem: (!isSpecific || dChem.hasSchedule) && dChem.practical > 0,
                phys: (!isSpecific || dPhys.hasSchedule) && dPhys.practical > 0,
                bio: (!isSpecific || dBio.hasSchedule) && dBio.practical > 0,
                agri: (!isSpecific || dAgri.hasSchedule) && dAgri.practical > 0
            };
        }

        function banglaToEnglishDigits(str) {
            if (str === null || str === undefined) return '';
            const banglaDigits = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
            return (str + '').replace(/[০-৯]/g, match => banglaDigits[match]);
        }

        function isSubjectSlotActive(slotKey) {
            if (window.activeSubjectSlots && window.activeSubjectSlots[slotKey] !== undefined) {
                return !!window.activeSubjectSlots[slotKey];
            }
            const th = document.querySelector(`thead th[data-subj="${slotKey}"]:not([data-col-type]):not([data-fullmark])`);
            if (th) {
                const txt = th.textContent.trim();
                return txt !== '-' && txt !== '';
            }
            return true;
        }

        function getSubjectColspanCount(k, isCompact, isHideMCQW, pracStatus) {
            if (k === 'bangla') {
                let cols = 10;
                if (isCompact) cols -= 2;
                if (isHideMCQW) cols -= 4;
                return cols;
            }
            if (k === 'english') {
                let cols = 6;
                if (isCompact) cols -= 2;
                return cols;
            }
            if (['math', 'bgs', 'rel', 'ict'].includes(k)) {
                let cols = 5;
                if (isCompact) cols -= 2;
                if (isHideMCQW) cols -= 2;
                return cols;
            }
            if (['chem', 'phys', 'bio', 'agri'].includes(k)) {
                let cols = (pracStatus && pracStatus[k]) ? 6 : 5;
                if (isCompact) cols -= 2;
                if (isHideMCQW) cols -= 2;
                return cols;
            }
            return 5;
        }

        function getActiveColspan() {
            const slots = ['bangla', 'english', 'math', 'bgs', 'chem', 'phys', 'bio', 'rel', 'ict', 'agri'];
            const isCompact = (currentLayout === 'compact');
            const isHideMCQW = (currentMCQWritten === 'hide');
            const pracStatus = (typeof getSubjectPracticalStatus === 'function') ? getSubjectPracticalStatus() : { chem: false, phys: false, bio: false, agri: false };

            let total = 2; // Roll, Name
            slots.forEach(k => {
                if (isSubjectSlotActive(k)) {
                    total += getSubjectColspanCount(k, isCompact, isHideMCQW, pracStatus);
                }
            });
            total += 6; // Summary columns: GT, Fail, GPA no opt, Final GPA, Final Grade, Merit
            return total;
        }

        function applyTableSettings() {
            // Sync dropdowns
            const layoutSelect = document.getElementById('table-layout');
            if (layoutSelect) layoutSelect.value = currentLayout;
            const mcqwSelect = document.getElementById('mcq-written');
            if (mcqwSelect) mcqwSelect.value = currentMCQWritten;

            const isCompact = (currentLayout === 'compact');
            const isHideMCQW = (currentMCQWritten === 'hide');

            const pracStatus = (typeof getSubjectPracticalStatus === 'function')
                ? getSubjectPracticalStatus()
                : { chem: false, phys: false, bio: false, agri: false };

            const slots = ['bangla', 'english', 'math', 'bgs', 'chem', 'phys', 'bio', 'rel', 'ict', 'agri'];

            // 1. Calculate and set colspans / visibility for main subjects in Row 1
            slots.forEach(k => {
                const th = document.querySelector(`thead th[data-subj="${k}"]:not([data-col-type]):not([data-fullmark])`);
                if (th) {
                    if (isSubjectSlotActive(k)) {
                        th.style.display = '';
                        th.setAttribute('colspan', getSubjectColspanCount(k, isCompact, isHideMCQW, pracStatus));
                    } else {
                        th.style.display = 'none';
                    }
                }
            });

            // 2. Set colspans for inside-header-row, signatures & section dividers
            const activeColspan = getActiveColspan();
            const insideHeaderTh = document.querySelector('#inside-header-row th');
            if (insideHeaderTh) insideHeaderTh.setAttribute('colspan', activeColspan);
            const tfootTd = document.querySelector('#print-tfoot-signatures td');
            if (tfootTd) tfootTd.setAttribute('colspan', activeColspan);
            document.querySelectorAll('.section-divider-cell').forEach(td => {
                td.setAttribute('colspan', activeColspan);
            });

            // 3. Update Row 4 Full Marks and Component Headers dynamically from Exam List
            if (typeof updateDynamicSubjectMarksAndHeaders === 'function') {
                updateDynamicSubjectMarksAndHeaders();
            }

            // 4. Toggle thead subject headers (Row 2, Row 3, Row 4)
            slots.forEach(k => {
                const isActive = isSubjectSlotActive(k);
                if (!isActive) {
                    // Completely hide ALL header cells for uncreated/empty subject
                    if (k === 'bangla') {
                        document.querySelectorAll('thead th[data-subj="bangla"], thead th[data-subj="bangla1"], thead th[data-subj="bangla2"]').forEach(th => th.style.display = 'none');
                    } else if (k === 'english') {
                        document.querySelectorAll('thead th[data-subj="english"], thead th[data-subj="english1"], thead th[data-subj="english2"]').forEach(th => th.style.display = 'none');
                    } else {
                        document.querySelectorAll(`thead th[data-subj="${k}"]`).forEach(th => th.style.display = 'none');
                    }
                } else {
                    // Subject is active: apply sub-paper, compact, hideMCQW, and practical visibility
                    if (k === 'bangla') {
                        const b1Th = document.querySelector('thead th[data-subj="bangla1"]:not([data-fullmark]):not([data-col-type])');
                        const b2Th = document.querySelector('thead th[data-subj="bangla2"]:not([data-fullmark]):not([data-col-type])');
                        if (b1Th) { b1Th.style.display = ''; b1Th.setAttribute('colspan', isHideMCQW ? 1 : 3); }
                        if (b2Th) { b2Th.style.display = ''; b2Th.setAttribute('colspan', isHideMCQW ? 1 : 3); }

                        document.querySelectorAll('thead th[data-col-type="grand_total"][data-subj="bangla"]').forEach(th => th.style.display = '');
                        document.querySelectorAll('thead th[data-col-type="avg"][data-subj="bangla"]').forEach(th => th.style.display = '');
                        document.querySelectorAll('thead th[data-col-type="grade"][data-subj="bangla"]').forEach(th => th.style.display = isCompact ? 'none' : '');
                        document.querySelectorAll('thead th[data-col-type="point"][data-subj="bangla"]').forEach(th => th.style.display = isCompact ? 'none' : '');

                        // Row 3 (Detail)
                        document.querySelectorAll('thead th[data-col-type="mcq"][data-subj="bangla1"], thead th[data-col-type="written"][data-subj="bangla1"], thead th[data-col-type="mcq"][data-subj="bangla2"], thead th[data-col-type="written"][data-subj="bangla2"]').forEach(th => {
                            th.style.display = isHideMCQW ? 'none' : '';
                        });
                        document.querySelectorAll('thead th[data-col-type="total"][data-subj="bangla1"], thead th[data-col-type="total"][data-subj="bangla2"]').forEach(th => {
                            th.style.display = '';
                        });

                        // Row 4 (Full Marks)
                        document.querySelectorAll('thead th[data-fullmark="mcq"][data-subj="bangla1"], thead th[data-fullmark="written"][data-subj="bangla1"], thead th[data-fullmark="mcq"][data-subj="bangla2"], thead th[data-fullmark="written"][data-subj="bangla2"]').forEach(th => {
                            th.style.display = isHideMCQW ? 'none' : '';
                        });
                        document.querySelectorAll('thead th[data-fullmark="total"][data-subj="bangla1"], thead th[data-fullmark="total"][data-subj="bangla2"], thead th[data-fullmark="grand_total"][data-subj="bangla"]').forEach(th => {
                            th.style.display = '';
                        });
                    } else if (k === 'english') {
                        document.querySelectorAll('thead th[data-subj="english1"]:not([data-fullmark]):not([data-col-type]), thead th[data-subj="english2"]:not([data-fullmark]):not([data-col-type])').forEach(th => th.style.display = '');
                        document.querySelectorAll('thead th[data-col-type="grand_total"][data-subj="english"]').forEach(th => th.style.display = '');
                        document.querySelectorAll('thead th[data-col-type="avg"][data-subj="english"]').forEach(th => th.style.display = '');
                        document.querySelectorAll('thead th[data-col-type="grade"][data-subj="english"]').forEach(th => th.style.display = isCompact ? 'none' : '');
                        document.querySelectorAll('thead th[data-col-type="point"][data-subj="english"]').forEach(th => th.style.display = isCompact ? 'none' : '');

                        // Row 3 (Detail)
                        document.querySelectorAll('thead th[data-col-type="written"][data-subj="english1"], thead th[data-col-type="written"][data-subj="english2"]').forEach(th => {
                            th.style.display = '';
                        });

                        // Row 4 (Full Marks)
                        document.querySelectorAll('thead th[data-fullmark="written"][data-subj="english1"], thead th[data-fullmark="written"][data-subj="english2"], thead th[data-fullmark="grand_total"][data-subj="english"]').forEach(th => {
                            th.style.display = '';
                        });
                    } else {
                        // General subjects (math, bgs, chem, phys, bio, rel, ict, agri)
                        document.querySelectorAll(`thead th[data-col-type="mcq"][data-subj="${k}"]`).forEach(th => th.style.display = isHideMCQW ? 'none' : '');
                        document.querySelectorAll(`thead th[data-col-type="written"][data-subj="${k}"]`).forEach(th => th.style.display = isHideMCQW ? 'none' : '');
                        document.querySelectorAll(`thead th[data-col-type="practical"][data-subj="${k}"]`).forEach(th => th.style.display = (pracStatus && pracStatus[k]) ? '' : 'none');
                        document.querySelectorAll(`thead th[data-col-type="total"][data-subj="${k}"]`).forEach(th => th.style.display = '');
                        document.querySelectorAll(`thead th[data-col-type="grade"][data-subj="${k}"]`).forEach(th => th.style.display = isCompact ? 'none' : '');
                        document.querySelectorAll(`thead th[data-col-type="point"][data-subj="${k}"]`).forEach(th => th.style.display = isCompact ? 'none' : '');

                        // Row 4 (Full Marks)
                        document.querySelectorAll(`thead th[data-fullmark="mcq"][data-subj="${k}"]`).forEach(th => th.style.display = isHideMCQW ? 'none' : '');
                        document.querySelectorAll(`thead th[data-fullmark="written"][data-subj="${k}"]`).forEach(th => th.style.display = isHideMCQW ? 'none' : '');
                        document.querySelectorAll(`thead th[data-fullmark="practical"][data-subj="${k}"]`).forEach(th => th.style.display = (pracStatus && pracStatus[k]) ? '' : 'none');
                        document.querySelectorAll(`thead th[data-fullmark="total"][data-subj="${k}"]`).forEach(th => th.style.display = '');
                    }
                }
            });

            // 5. Update and toggle cells in tbody
            const subjectColMap = {
                bangla: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                english: [12, 13, 14, 15, 16, 17],
                math: [18, 19, 20, 21, 22],
                bgs: [23, 24, 25, 26, 27],
                chem: [28, 29, 30, 31, 32, 33],
                phys: [34, 35, 36, 37, 38, 39],
                bio: [40, 41, 42, 43, 44, 45],
                rel: [46, 47, 48, 49, 50],
                ict: [51, 52, 53, 54, 55],
                agri: [56, 57, 58, 59, 60, 61]
            };

            const allTotalCells = [
                { idxs: [4, 7, 8, 9], gradeIdx: 10, pointIdx: 11, subj: 'bangla' },
                { idxs: [12, 13, 14, 15], gradeIdx: 16, pointIdx: 17, subj: 'english' },
                { idxs: [20], gradeIdx: 21, pointIdx: 22, subj: 'math' },
                { idxs: [25], gradeIdx: 26, pointIdx: 27, subj: 'bgs' },
                { idxs: [31], gradeIdx: 32, pointIdx: 33, subj: 'chem' },
                { idxs: [37], gradeIdx: 38, pointIdx: 39, subj: 'phys' },
                { idxs: [43], gradeIdx: 44, pointIdx: 45, subj: 'bio' },
                { idxs: [48], gradeIdx: 49, pointIdx: 50, subj: 'rel' },
                { idxs: [53], gradeIdx: 54, pointIdx: 55, subj: 'ict' },
                { idxs: [59], gradeIdx: 60, pointIdx: 61, subj: 'agri' }
            ];

            document.querySelectorAll('tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 68) return; // Not a student data row

                slots.forEach(k => {
                    const colIndices = subjectColMap[k];
                    if (!isSubjectSlotActive(k)) {
                        // Completely hide all cells of this uncreated / empty subject
                        colIndices.forEach(idx => {
                            cells[idx].style.display = 'none';
                        });
                    } else {
                        // Subject is active -> apply display rules
                        if (k === 'bangla') {
                            [2, 3, 5, 6].forEach(idx => cells[idx].style.display = isHideMCQW ? 'none' : '');
                            [4, 7, 8, 9].forEach(idx => cells[idx].style.display = '');
                            [10, 11].forEach(idx => cells[idx].style.display = isCompact ? 'none' : '');
                        } else if (k === 'english') {
                            [12, 13, 14, 15].forEach(idx => cells[idx].style.display = '');
                            [16, 17].forEach(idx => cells[idx].style.display = isCompact ? 'none' : '');
                        } else if (['math', 'bgs', 'rel', 'ict'].includes(k)) {
                            cells[colIndices[0]].style.display = isHideMCQW ? 'none' : ''; // mcq
                            cells[colIndices[1]].style.display = isHideMCQW ? 'none' : ''; // wri
                            cells[colIndices[2]].style.display = '';                     // tot
                            cells[colIndices[3]].style.display = isCompact ? 'none' : '';  // grade
                            cells[colIndices[4]].style.display = isCompact ? 'none' : '';  // point
                        } else if (['chem', 'phys', 'bio', 'agri'].includes(k)) {
                            cells[colIndices[0]].style.display = isHideMCQW ? 'none' : ''; // mcq
                            cells[colIndices[1]].style.display = isHideMCQW ? 'none' : ''; // wri
                            cells[colIndices[2]].style.display = (pracStatus && pracStatus[k]) ? '' : 'none'; // prac
                            cells[colIndices[3]].style.display = '';                     // tot
                            cells[colIndices[4]].style.display = isCompact ? 'none' : '';  // grade
                            cells[colIndices[5]].style.display = isCompact ? 'none' : '';  // point
                        }
                    }
                });

                // Update Total/Avg cells dynamically for compact mode annotations
                allTotalCells.forEach(item => {
                    if (!isSubjectSlotActive(item.subj)) return;
                    const gradeVal = cells[item.gradeIdx].textContent.trim();
                    const pointVal = cells[item.pointIdx].textContent.trim();

                    item.idxs.forEach(idx => {
                        const cell = cells[idx];
                        if (!cell.hasAttribute('data-orig-val')) {
                            cell.setAttribute('data-orig-val', cell.innerHTML);
                        }

                        let showGradePoint = false;
                        if (isCompact) {
                            if (idx === 8 || idx === 14) {
                                showGradePoint = false;
                            } else {
                                showGradePoint = true;
                            }
                        }

                        if (showGradePoint) {
                            const origVal = cell.getAttribute('data-orig-val');
                            cell.innerHTML = origVal + "<br><span style='font-size: 8.5px; font-weight: normal; display: block; margin-top: 1px; line-height: 1.1;'>" + gradeVal + " &nbsp;" + pointVal + "</span>";
                        } else {
                            cell.innerHTML = cell.getAttribute('data-orig-val');
                        }
                    });
                });
            });
        }



        function normalizeClassString(cls) {
            if (!cls) return '';
            const val = cls.toString().toLowerCase().trim();
            const base = val.split(/[\-\(\–\—]/)[0].trim();
            if (base === '10th' || base === 'ten' || base === '10' || base === '১০ম' || base.includes('ten') || base.includes('10')) return 'ten';
            if (base === '9th' || base === 'nine' || base === '9' || base === '৯ম' || base.includes('nine') || base.includes('9')) return 'nine';
            if (base === '8th' || base === 'eight' || base === '8' || base === '৮ম' || base.includes('eight') || base.includes('8')) return 'eight';
            if (base === '7th' || base === 'seven' || base === '7' || base === '৭ম' || base.includes('seven') || base.includes('7')) return 'seven';
            if (base === '6th' || base === 'six' || base === '6' || base === '৬ষ্ঠ' || base.includes('six') || base.includes('6')) return 'six';
            if (base === 'five' || base === '5' || base === '৫ম' || base.includes('five') || base.includes('5')) return 'five';
            if (base === 'four' || base === '4' || base === '৪র্থ' || base.includes('four') || base.includes('4')) return 'four';
            if (base === 'three' || base === '3' || base === '৩য়' || base === '৩য়' || base.includes('three') || base.includes('3')) return 'three';
            if (base === 'two' || base === '2' || base === '২য়' || base === '২য়' || base.includes('two') || base.includes('2')) return 'two';
            if (base === 'one' || base === '1' || base === '১ম' || base.includes('one') || base.includes('1')) return 'one';
            if (base.includes('kg') || base.includes('কেজি')) return 'kg';
            if (base.includes('nursery') || base.includes('নার্সারি')) return 'nursery';
            if (base.includes('play') || base.includes('প্লে')) return 'play';
            return base;
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

        function getExamsForClass(selectedClass) {
            const normTarget = normalizeClassString(selectedClass);
            let schedules = [];
            let routines = [];
            let types = [];
            try {
                schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]');
                routines = JSON.parse(localStorage.getItem('school_exam_routines') || '[]');
                types = JSON.parse(localStorage.getItem('school_exam_types') || '[]');
            } catch (e) { }

            const examSet = [];
            const seen = new Set();

            const addExam = (name) => {
                if (!name || typeof name !== 'string') return;
                const clean = name.trim();
                if (!clean) return;
                const key = clean.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    examSet.push(clean);
                }
            };

            // 1. Prioritize Exam List (school_exam_schedules) matching this class
            if (Array.isArray(schedules) && schedules.length > 0) {
                schedules.forEach(s => {
                    if (!s) return;
                    const sClass = normalizeClassString(s.class || s.className);
                    if (!normTarget || normTarget === 'all' || sClass === normTarget) {
                        addExam(s.term || s.examName);
                    }
                });
            }

            // 2. Fallback to routines matching this class
            if (examSet.length === 0 && Array.isArray(routines)) {
                routines.forEach(r => {
                    if (!r) return;
                    const rClass = normalizeClassString(r.className || r.class);
                    if (!normTarget || normTarget === 'all' || rClass === normTarget) {
                        addExam(r.examName || r.term);
                    }
                });
            }

            // 3. Fallback to general exam schedules / types if this class has no specific exams registered
            if (examSet.length === 0) {
                if (Array.isArray(schedules)) {
                    schedules.forEach(s => { if (s) addExam(s.term || s.examName); });
                }
                if (Array.isArray(types)) {
                    types.forEach(t => {
                        if (typeof t === 'string') addExam(t);
                        else if (t && t.name) addExam(t.name);
                    });
                }
                if (Array.isArray(routines)) {
                    routines.forEach(r => { if (r) addExam(r.examName || r.term); });
                }
            }

            // 4. Default exams
            if (examSet.length === 0) {
                ['বার্ষিক পরীক্ষা', 'অর্ধ-বার্ষিক পরীক্ষা', 'প্রাক-নির্বাচনী পরীক্ষা', 'নির্বাচনী পরীক্ষা'].forEach(addExam);
            }

            return examSet;
        }

        function getSectionsForClassAndExam(selectedClass, selectedExam) {
            const normTarget = normalizeClassString(selectedClass);
            let schedules = [];
            try {
                schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]');
            } catch (e) { }

            const sectionSet = new Set();

            if (Array.isArray(schedules) && schedules.length > 0) {
                schedules.forEach(s => {
                    if (!s) return;
                    const sClass = normalizeClassString(s.class || s.className);
                    if (normTarget && normTarget !== 'all' && sClass !== normTarget) return;

                    const term = s.term || s.examName || '';
                    if (selectedExam && selectedExam !== 'all' && !isExamMatch(term, selectedExam)) return;

                    const rawSec = s.section || '';
                    if (rawSec) {
                        const parts = rawSec.toString().split(',');
                        parts.forEach(p => {
                            const clean = p.trim().toUpperCase();
                            if (clean) sectionSet.add(clean);
                        });
                    }
                });
            }

            // Fallback: check students directory if Exam List didn't explicitly restrict sections
            if (sectionSet.size === 0) {
                try {
                    const students = JSON.parse(localStorage.getItem('school_students') || '[]');
                    if (Array.isArray(students)) {
                        students.forEach(st => {
                            if (!st) return;
                            const stClass = normalizeClassString(st.class);
                            if (normTarget && normTarget !== 'all' && stClass !== normTarget) return;
                            const sec = (st.section || '').trim().toUpperCase();
                            if (sec && ['A', 'B', 'C', 'D'].includes(sec)) {
                                sectionSet.add(sec);
                            }
                        });
                    }
                } catch (e) { }
            }

            // Default fallback
            if (sectionSet.size === 0) {
                ['A', 'B', 'C', 'D'].forEach(s => sectionSet.add(s));
            }

            const order = ['A', 'B', 'C', 'D', 'E', 'F'];
            return Array.from(sectionSet).sort((a, b) => {
                const ia = order.indexOf(a);
                const ib = order.indexOf(b);
                if (ia !== -1 && ib !== -1) return ia - ib;
                return a.localeCompare(b);
            });
        }

        function updateExamFilterOptions(selectedClass, targetExam) {
            const examSelect = document.getElementById('exam-filter');
            if (!examSelect) return;

            const exams = getExamsForClass(selectedClass);
            const savedExam = targetExam || currentFilterExam || localStorage.getItem('school_active_exam_filter') || '';

            examSelect.innerHTML = '<option value="all">All</option>';
            exams.forEach(ex => {
                const opt = document.createElement('option');
                opt.value = ex;
                opt.textContent = ex;
                opt.setAttribute('data-en', ex);
                opt.setAttribute('data-bn', ex);
                examSelect.appendChild(opt);
            });

            let matchedExam = '';
            if (savedExam) {
                const found = exams.find(e => isExamMatch(e, savedExam));
                if (found) matchedExam = found;
            }

            if (!matchedExam && exams.length > 0) {
                matchedExam = exams[0];
            } else if (!matchedExam) {
                matchedExam = 'all';
            }

            examSelect.value = matchedExam;
            currentFilterExam = matchedExam;
            if (matchedExam && matchedExam !== 'all') {
                localStorage.setItem('school_active_exam_filter', matchedExam);
            }
        }

        function updateSectionFilterOptionsForExam(selectedClass, selectedExam) {
            updateSectionFilterOptions();
        }

        function updateSectionFilterOptions(availableSections) {
            const filterEl = document.getElementById('section-filter');
            if (!filterEl) return;

            const examSecs = getSectionsForClassAndExam(currentFilterClass, currentFilterExam);
            const finalSections = (examSecs && examSecs.length > 0) ? examSecs : (availableSections || ['A', 'B', 'C', 'D']);

            const selectedVal = currentFilterSection;
            filterEl.innerHTML = '<option value="all">All</option>';
            finalSections.forEach(sec => {
                const opt = document.createElement('option');
                opt.value = sec;
                opt.textContent = sec;
                filterEl.appendChild(opt);
            });

            if (finalSections.includes(selectedVal)) {
                filterEl.value = selectedVal;
            } else if (finalSections.length > 0) {
                filterEl.value = (selectedVal === 'all') ? 'all' : finalSections[0];
                currentFilterSection = filterEl.value;
            } else {
                filterEl.value = 'all';
                currentFilterSection = 'all';
            }
        }

        let currentFilterClass = '10th';
        let currentFilterExam = 'half_yearly';
        let currentFilterGroup = 'science';
        let currentFilterSection = 'A';



        function getDefaultGroupForClass(classValue) {

            const valLower = (classValue || '').toLowerCase();

            const isSeniorClass = ['9', '10', '9th', '10th', 'nine', 'ten', '৯ম', '১০ম'].some(k => valLower.includes(k));

            if (isSeniorClass) return 'science';

            return 'all';

        }



        function getDefaultSectionForClass(classValue) {

            const valLower = (classValue || '').toLowerCase();

            const isJuniorClass = ['6', '7', '8', '6th', '7th', '8th', 'six', 'seven', 'eight', '৬ষ্ঠ', '৭ম', '৮ম'].some(k => valLower.includes(k));

            if (isJuniorClass) return 'A';

            return 'all';

        }



        function updateHeaderMeta() {

            const classMap = {

                "bn": { 

                    "all": "সকল", 

                    "Play": "প্লে", "Nursery": "নার্সারি", "KG": "কেজি",

                    "One": "১ম", "Two": "২য়", "Three": "৩য়", "Four": "৪র্থ", "Five": "৫ম",

                    "Six": "৬ষ্ঠ", "Seven": "৭ম", "Eight": "৮ম", "Nine": "৯ম", "Ten": "১০ম",

                    "6th": "৬ষ্ঠ", "7th": "৭ম", "8th": "৮ম", "9th": "৯ম", "10th": "১০ম" 

                },

                "en": { 

                    "all": "All", 

                    "Play": "Play", "Nursery": "Nursery", "KG": "KG",

                    "One": "1st", "Two": "2nd", "Three": "3rd", "Four": "4th", "Five": "5th",

                    "Six": "6th", "Seven": "7th", "Eight": "8th", "Nine": "9th", "Ten": "10th",

                    "6th": "6th", "7th": "7th", "8th": "8th", "9th": "9th", "10th": "10th" 

                }

            };

            const sectionMap = {

                "bn": { "all": "সকল", "A": "A", "B": "B", "C": "C", "D": "D" },

                "en": { "all": "All", "A": "A", "B": "B", "C": "C", "D": "D" }

            };

            const groupMap = {

                "bn": { "all": "সকল", "science": "বিজ্ঞান", "humanities": "মানবিক", "business": "ব্যবসায়" },

                "en": { "all": "All", "science": "Science", "humanities": "Humanities", "business": "Business Studies" }

            };



            const isSeniorClass = ['9', '10', '9th', '10th', 'nine', 'ten', '৯ম', '১০ম', 'play', 'nursery', 'kg', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'].some(k => currentFilterClass.toLowerCase().includes(k))

                ? ['9', '10', '9th', '10th', 'nine', 'ten', '৯ম', '১০ম'].some(k => currentFilterClass.toLowerCase().includes(k))

                : true;



            const className = classMap[currentLang][currentFilterClass] || currentFilterClass;

            let branchName = "";

            if (isSeniorClass) {

                branchName = groupMap[currentLang][currentFilterGroup] || currentFilterGroup;

            } else {

                branchName = sectionMap[currentLang][currentFilterSection] || currentFilterSection;

            }



            let metaText = "";

            if (currentLang === 'en') {

                metaText = `Class: ${className}, ${isSeniorClass ? 'Group' : 'Section'}: ${branchName}`;

            } else {

                metaText = `শ্রেণি: ${className}, শাখা: ${branchName}`;

            }



            document.querySelectorAll('.meta-info').forEach(el => {

                el.textContent = metaText;

            });



            // Update Exam name in the printed school header h2 dynamically

            const examSelect = document.getElementById('exam-filter');

            if (examSelect) {

                const selectedExamText = examSelect.options[examSelect.selectedIndex]?.textContent || currentFilterExam || '';

                document.querySelectorAll('.header h2').forEach(el => {

                    if (selectedExamText === 'All' || selectedExamText === 'সকল' || !selectedExamText) {

                        el.textContent = currentLang === 'en' ? 'Result Sheet' : 'ফলাফল শীট';

                    } else {

                        el.textContent = currentLang === 'en' ? `${selectedExamText} Result Sheet` : `${selectedExamText} এর ফলাফল শীট`;

                    }

                });

                if (selectedExamText && selectedExamText !== 'All' && selectedExamText !== 'সকল') {
                    document.title = `${selectedExamText} এর ফলাফল শীট`;
                }

            }

        }



        function applyFilters() {
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

        function sortStudents(criteria) {

            syncStudentNamesFromDatabase();
            recalculateTableGradesAndRanks();

            document.getElementById('sort-order').value = criteria; // Sync UI

            const tbody = getTabulationTbody();
            if (!tbody) return;

            const studentRows = Array.from(tbody.querySelectorAll('tr[data-section]'));



            const sections = {};



            studentRows.forEach(row => {

                const sec = row.getAttribute('data-section') || 'Unassigned';

                if (!sections[sec]) {

                    sections[sec] = [];

                }

                sections[sec].push(row);

            });



            const sortedSecKeys = Object.keys(sections).sort();



            updateSectionFilterOptions(sortedSecKeys);



            const sortFunc = (a, b) => {

                const aCells = a.querySelectorAll('td');

                const bCells = b.querySelectorAll('td');

                if (aCells.length < 68 || bCells.length < 68) return 0;



                let valA, valB;

                if (criteria === 'merit') {

                    const textA = banglaToEnglishDigits(aCells[67].textContent.trim());

                    const textB = banglaToEnglishDigits(bCells[67].textContent.trim());

                    valA = parseInt(textA, 10) || Infinity;

                    valB = parseInt(textB, 10) || Infinity;

                    if (valA !== valB) return valA - valB;

                    const totalA = parseFloat(banglaToEnglishDigits(aCells[62].textContent.trim())) || 0;

                    const totalB = parseFloat(banglaToEnglishDigits(bCells[62].textContent.trim())) || 0;

                    if (totalA !== totalB) return totalB - totalA;

                    const rollA = parseInt(banglaToEnglishDigits(aCells[0].textContent.trim()).replace(/\D/g, ''), 10) || 0;

                    const rollB = parseInt(banglaToEnglishDigits(bCells[0].textContent.trim()).replace(/\D/g, ''), 10) || 0;

                    return rollA - rollB;

                } else {

                    const textA = banglaToEnglishDigits(aCells[0].textContent.trim());

                    const textB = banglaToEnglishDigits(bCells[0].textContent.trim());

                    const numA = parseInt(textA.replace(/\D/g, ''), 10);

                    const numB = parseInt(textB.replace(/\D/g, ''), 10);

                    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {

                        valA = numA;

                        valB = numB;

                    } else {

                        return textA.localeCompare(textB, undefined, { numeric: true, sensitivity: 'base' });

                    }

                }



                return valA - valB;

            };



            sortedSecKeys.forEach(sec => {

                sections[sec].sort(sortFunc);

            });



            tbody.innerHTML = '';



            const createDivider = (name) => {

                const tr = document.createElement('tr');

                tr.className = 'section-divider-row';

                tr.setAttribute('data-section-name', name);

                const td = document.createElement('td');

                td.setAttribute('colspan', getActiveColspan().toString());

                td.className = 'section-divider-cell';

                

                const realStudentsInSec = sections[name].filter(r => r.getAttribute('data-has-student') === 'true');
                const count = realStudentsInSec.length;

                const isSeniorClass = ['9', '10', '9th', '10th', 'nine', 'ten', '৯ম', '১০ম'].some(k => currentFilterClass.toLowerCase().includes(k));

                let groupLabel = '';
                if (isSeniorClass) {
                    if (name === 'A') {
                        groupLabel = currentLang === 'en' ? 'Science' : 'বিজ্ঞান';
                    } else if (name === 'B') {
                        groupLabel = currentLang === 'en' ? 'Humanities' : 'মানবিক';
                    } else if (name === 'C') {
                        groupLabel = currentLang === 'en' ? 'Business Studies' : 'ব্যবসায়';
                    } else {
                        groupLabel = currentLang === 'en' ? 'Other' : 'অন্যান্য';
                    }
                } else {
                    groupLabel = currentLang === 'en' ? 'Section ' + name : 'Section ' + name;
                }

                const countText = currentLang === 'en' ? `(Students: ${count})` : `(শিক্ষার্থী: ${translateDigits(count.toString(), currentLang)})`;
                td.textContent = groupLabel + ' ' + countText;
                tr.appendChild(td);
                return tr;
            };

            sortedSecKeys.forEach(sec => {
                const secRealStudents = sections[sec].filter(r => r.getAttribute('data-has-student') === 'true');
                if (secRealStudents.length > 0) {
                    tbody.appendChild(createDivider(sec));
                    sections[sec].forEach(row => tbody.appendChild(row));
                }
            });



            applyFilters();

        }



        function filterClass(val) {
            currentFilterClass = val;
            const filterEl = document.getElementById('class-filter');
            if (filterEl) filterEl.value = val;

            // 1. Dynamically sync Exam options for this class from Exam List!
            updateExamFilterOptions(val);

            // 2. Dynamically sync Section options for this exam and class from Exam List!
            updateSectionFilterOptions();

            const secSelect = document.getElementById('section-filter');
            const groupSelect = document.getElementById('group-filter');
            const secControlGroup = secSelect ? secSelect.closest('.control-group') : null;
            const groupControlGroup = groupSelect ? groupSelect.closest('.control-group') : null;

            const valLower = (val || '').toLowerCase();
            const isJuniorClass = ['6', '7', '8', '6th', '7th', '8th', 'six', 'seven', 'eight', '৬ষ্ঠ', '৭ম', '৮ম'].some(k => valLower.includes(k));
            const isSeniorClass = ['9', '10', '9th', '10th', 'nine', 'ten', '৯ম', '১০ম'].some(k => valLower.includes(k));

            if (isJuniorClass) {
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

            // Dynamically sync Section options for this exam and class from Exam List!
            updateSectionFilterOptions();

            const secSelect = document.getElementById('section-filter');
            if (secSelect) secSelect.value = currentFilterSection;

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

        function changePaperSize(size) {

            const paperSelect = document.getElementById('paper-size');

            if (paperSelect) paperSelect.value = size;



            let styleEl = document.getElementById('dynamic-print-style');

            if (!styleEl) {

                styleEl = document.createElement('style');

                styleEl.id = 'dynamic-print-style';

                document.head.appendChild(styleEl);

            }

            

            let pageSize = 'A3';

            let tableFontSize = '13px';

            let cellPadding = '3.6px 2.1px';

            let h1Size = '24px';

            let otherSize = '18px';

            

            if (size === 'A4') {

                pageSize = 'A4';

                tableFontSize = '8px';

                cellPadding = '1.9px 1px';

                h1Size = '15px';

                otherSize = '11px';

            } else if (size === 'legal') {

                pageSize = 'legal';

                tableFontSize = '10px';

                cellPadding = '2.9px 1.8px';

                h1Size = '18px';

                otherSize = '14px';

            }

            

            styleEl.innerHTML = `

                @page {

                    size: ${pageSize} landscape;

                    margin: 5mm;

                }

                @media print {

                    body {

                        --header-h1-size: ${h1Size} !important;

                        --header-p-size: ${otherSize} !important;

                        --header-h2-size: ${otherSize} !important;

                        --meta-size: ${otherSize} !important;

                        -webkit-print-color-adjust: exact !important;

                        print-color-adjust: exact !important;

                    }

                    table {

                        font-size: calc(${tableFontSize} * var(--font-scale, 1)) !important;

                    }

                    th {

                        border: 0.75px solid #000000 !important;

                    }

                    td {

                        border: 1px solid #000000 !important;

                    }

                    th, td {

                        padding: ${cellPadding} !important;

                        background-clip: padding-box !important;

                    }

                }

            `;

        }



        let currentScale = 1.0;



        function adjustFontSize(delta) {

            currentScale = Math.round((currentScale + delta) * 100) / 100;

            // Bound between 0.5 (50%) and 2.0 (200%)

            if (currentScale < 0.5) currentScale = 0.5;

            if (currentScale > 2.0) currentScale = 2.0;

            

            applyFontSize();

        }



        function resetFontSize() {

            currentScale = 1.0;

            applyFontSize();

        }



        function applyFontSize() {

            document.body.style.setProperty('--font-scale', currentScale);

            let pctText = Math.round(currentScale * 100) + '%';

            document.getElementById('font-size-display').textContent = translateDigits(pctText, currentLang);

        }



        // Wrap vertical header texts to fix Chrome table border rendering bug

        function wrapVerticalHeaders() {

            document.querySelectorAll('th.v-text, th.v-text-cell').forEach(th => {

                if (!th.querySelector('.v-text-inner')) {

                    const inner = document.createElement('div');

                    inner.className = 'v-text-inner';

                    inner.innerHTML = th.innerHTML;

                    th.innerHTML = '';

                    th.appendChild(inner);

                }

                if (th.classList.contains('v-text')) {

                    th.classList.remove('v-text');

                    th.classList.add('v-text-cell');

                }

            });

        }



        // Highlight subject blocks and overall GPA/Grade cells if student failed (F grade or 0 GP or Absent)
        function highlightFailures() {
            const rules = loadMarkingSystem();
            const failRule = rules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0 };
            const failGradeName = failRule.name || 'F';

            const subjectCellGroups = [
                { indices: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], gradeIdx: 10, gpIdx: 11 }, // Bangla
                { indices: [12, 13, 14, 15, 16, 17], gradeIdx: 16, gpIdx: 17 },         // English
                { indices: [18, 19, 20, 21, 22], gradeIdx: 21, gpIdx: 22 },             // Math
                { indices: [23, 24, 25, 26, 27], gradeIdx: 26, gpIdx: 27 },             // BGS
                { indices: [28, 29, 30, 31, 32, 33], gradeIdx: 32, gpIdx: 33 },         // Chemistry
                { indices: [34, 35, 36, 37, 38, 39], gradeIdx: 38, gpIdx: 39 },         // Physics
                { indices: [40, 41, 42, 43, 44, 45], gradeIdx: 44, gpIdx: 45 },         // Biology
                { indices: [46, 47, 48, 49, 50], gradeIdx: 49, gpIdx: 50 },             // Religion
                { indices: [51, 52, 53, 54, 55], gradeIdx: 54, gpIdx: 55 },             // ICT
                { indices: [56, 57, 58, 59, 60, 61], gradeIdx: 60, gpIdx: 61 }          // Agriculture
            ];

            document.querySelectorAll('tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 68) return; // Not a data row

                // 1. Highlight subject cells if subject grade is F / fail or Absent (A with 0 GP)
                subjectCellGroups.forEach(group => {
                    const gradeVal = cells[group.gradeIdx].textContent.trim();
                    const gpTxt = banglaToEnglishDigits(cells[group.gpIdx]?.textContent.trim() || '');
                    const isZeroGP = gpTxt === '0.00' || gpTxt === '0' || gpTxt === '0.0' || gpTxt === '০.০০';
                    const isSubjectFail = (gradeVal === failGradeName || gradeVal === 'F' || gradeVal === 'ABS' || (gradeVal === 'A' && isZeroGP));
                    if (isSubjectFail) {
                        group.indices.forEach(idx => {
                            cells[idx].style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                        });
                    } else {
                        group.indices.forEach(idx => {
                            if (cells[idx].style.backgroundColor === 'rgba(255, 0, 0, 0.2)') {
                                cells[idx].style.backgroundColor = '';
                            }
                        });
                    }
                });

                // 2. Highlight final GPA and Grade columns if overall grade is F / fail or Absent (A with 0 GPA)
                const finalGradeVal = cells[66].textContent.trim();
                const finalGpaTxt = banglaToEnglishDigits(cells[65].textContent.trim() || '');
                const isFinalFail = (finalGradeVal === failGradeName || finalGradeVal === 'F' || finalGradeVal === 'ABS' || (finalGradeVal === 'A' && (finalGpaTxt === '0.00' || finalGpaTxt === '0' || finalGpaTxt === '০.০০')));
                if (isFinalFail) {
                    cells[65].style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                    cells[66].style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                } else {
                    if (cells[65].style.backgroundColor === 'rgba(255, 0, 0, 0.2)') cells[65].style.backgroundColor = '';
                    if (cells[66].style.backgroundColor === 'rgba(255, 0, 0, 0.2)') cells[66].style.backgroundColor = '';
                }
            });
        }

        

        // Initialize default size A3 and default subjects

        

        function changeHeaderPrint(val) {

            document.body.className = document.body.className.replace(/header-print-\w+/g, '') + ' header-print-' + val;

            document.getElementById('header-print').value = val; // Sync UI

        }



                function syncStudentNamesFromDatabase() {
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
                    result = result.replace(/^0+(?=\d)/, '').replace(/^০+(?=[০-৯])/g, '');
                }
                return result;
            }

            function getRollInt(st) {
                const idRoll = getStudentIdRoll(st);
                const digits = idRoll.replace(/\D/g, '');
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

                    let secLetter = (st.section || st.sectionName || '').toString().toUpperCase().trim().replace(/^SECTION\s*/i, '').replace(/^শাখা\s*/i, '').trim();
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
                        const tbody = getTabulationTbody();
                        if (tbody) tbody.appendChild(newRow);
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

                        const parent = lastRow.parentNode || getTabulationTbody();
                        if (parent) {
                            parent.insertBefore(newRow, lastRow.nextSibling);
                        }
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

                        const cleanBn = dbBn.replace(/\s*[-—–]\s*[SABsab]\s*$/, '');
                        const cleanEn = dbEn.replace(/\s*[-—–]\s*[SABsab]\s*$/, '');

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
                            const examSecs = getSectionsForClassAndExam(currentFilterClass, currentFilterExam);
                            if (currentFilterSection === 'all') {
                                showSection = (examSecs && examSecs.length > 0) ? examSecs.includes(secLetter) : true;
                            } else {
                                showSection = (currentFilterSection === secLetter);
                            }
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
                    const examSecs = getSectionsForClassAndExam(currentFilterClass, currentFilterExam);
                    const isSecInExam = (examSecs && examSecs.length > 0) ? examSecs.includes(secName) : true;
                    if (!isSecInExam) {
                        row.style.display = 'none';
                        return;
                    }
                    row.style.display = (currentFilterSection === 'all' || secName === currentFilterSection) ? '' : 'none';
                }
            });

            // Dynamically update section-filter dropdown with actually available sections from Exam List
            updateSectionFilterOptions();

            if (clonedAny) {
                applyTableSettings();
            }
            populateStudentMarksFromDatabase();
        }

        // --- LIVE MARKS INJECTION FROM EXAM PORTAL (Exam List / school_student_marks) ---

        function populateStudentMarksFromDatabase() {
            const pracStatus = getSubjectPracticalStatus();
            let savedMarks = {};
            let schedules = [];
            let subjectsMap = {};
            try {
                savedMarks = JSON.parse(localStorage.getItem('school_student_marks') || '{}');
            } catch (e) {}
            try {
                schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]');
            } catch (e) {}
            try {
                subjectsMap = JSON.parse(localStorage.getItem('school_subjects') || '{}');
            } catch (e) {}

            function normClass(cls) {
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
                return val;
            }

            const targetClass = normClass(currentFilterClass);
            const classSubjects = subjectsMap[currentFilterClass] || subjectsMap[targetClass] || [];

            const activeExam = (currentFilterExam || 'all').trim();
            const activeExamLower = activeExam.toLowerCase();

            // Find schedules for this class and active exam from Exam Portal's Exam List
            const examSchedules = schedules.filter(s => {
                if (!s) return false;
                const sClass = normClass(s.class);
                if (targetClass && sClass !== targetClass) return false;
                if (activeExamLower === 'all') return true;
                return (s.term || '').trim().toLowerCase() === activeExamLower;
            });

            // Map each schedule to its subject code and slot
            const mappedSchedules = [];
            examSchedules.forEach(s => {
                let subCode = '';
                if (Array.isArray(classSubjects)) {
                    const matchedSub = classSubjects.find(cs => 
                        (cs.name && cs.name.trim().toLowerCase() === (s.subject || '').trim().toLowerCase()) ||
                        (cs.nameBn && cs.nameBn.trim().toLowerCase() === (s.subject || '').trim().toLowerCase()) ||
                        (cs.code && cs.code.toString().trim() === (s.subject || '').trim())
                    );
                    if (matchedSub && matchedSub.code) {
                        subCode = matchedSub.code.toString().trim();
                    }
                }
                const slot = getSubjectSlot(s.subject, subCode);
                mappedSchedules.push({
                    id: s.id,
                    subject: s.subject,
                    term: s.term,
                    subCode: subCode,
                    slot: slot
                });
            });

            const rows = document.querySelectorAll('tbody tr[data-section]');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 68) return;

                const stId = row.getAttribute('data-student-id');
                const stCode = row.getAttribute('data-student-code');
                const stRoll = row.getAttribute('data-student-roll');

                // If this is a database student row
                if (stId || stCode || stRoll) {
                    // Reset all mark cells (index 2 to 61) to '-' before populating for the active exam
                    for (let c = 2; c <= 61; c++) {
                        cells[c].textContent = '-';
                        cells[c].removeAttribute('data-orig-val');
                        cells[c].style.backgroundColor = '';
                    }

                    mappedSchedules.forEach(item => {
                        if (!item.slot) return;

                        // Look up mark object in savedMarks
                        let markRecord = null;
                        if (stId && savedMarks[`marks_${stId}_${item.id}`]) {
                            markRecord = savedMarks[`marks_${stId}_${item.id}`];
                        } else if (stCode && savedMarks[`marks_${stCode}_${item.id}`]) {
                            markRecord = savedMarks[`marks_${stCode}_${item.id}`];
                        } else if (stRoll && savedMarks[`marks_${stRoll}_${item.id}`]) {
                            markRecord = savedMarks[`marks_${stRoll}_${item.id}`];
                        } else if (stId && savedMarks[`marks_${stId}_${activeExam}`]) {
                            markRecord = savedMarks[`marks_${stId}_${activeExam}`];
                        } else if (stCode && savedMarks[`marks_${stCode}_${activeExam}`]) {
                            markRecord = savedMarks[`marks_${stCode}_${activeExam}`];
                        } else if (stRoll && savedMarks[`marks_${stRoll}_${activeExam}`]) {
                            markRecord = savedMarks[`marks_${stRoll}_${activeExam}`];
                        }

                        if (!markRecord) return;

                        let markData = null;
                        if (item.subCode && markRecord[item.subCode] !== undefined) {
                            markData = markRecord[item.subCode];
                        } else if (markRecord[item.subject] !== undefined) {
                            markData = markRecord[item.subject];
                        } else if (typeof markRecord === 'object' && !Array.isArray(markRecord)) {
                            const keys = Object.keys(markRecord);
                            if (keys.length === 1 && typeof markRecord[keys[0]] === 'object') {
                                markData = markRecord[keys[0]];
                            }
                        }

                        if (markData === null || markData === undefined) return;

                        let isAbsent = false;
                        let cq = null;
                        let mcq = null;
                        let prac = null;
                        let total = null;

                        if (typeof markData === 'object') {
                            isAbsent = !!markData.isAbsent;
                            if (!isAbsent) {
                                if (markData.cq !== undefined && markData.cq !== '' && markData.cq !== '-') cq = markData.cq;
                                if (markData.mcq !== undefined && markData.mcq !== '' && markData.mcq !== '-') mcq = markData.mcq;
                                if (markData.practical !== undefined && markData.practical !== '' && markData.practical !== '-') prac = markData.practical;
                                if (markData.total !== undefined && markData.total !== '' && markData.total !== '-') total = markData.total;
                                if (total === null && (cq !== null || mcq !== null || prac !== null)) {
                                    total = (Number(cq) || 0) + (Number(mcq) || 0) + (Number(prac) || 0);
                                }
                            }
                        } else if (typeof markData === 'number' || (typeof markData === 'string' && markData.trim() !== '')) {
                            if (markData.toString().toUpperCase() === 'A' || markData.toString().toUpperCase() === 'ABS') {
                                isAbsent = true;
                            } else {
                                total = markData;
                                cq = markData;
                            }
                        }

                        const formatCell = (val) => {
                            if (isAbsent) return 'A';
                            if (val === null || val === undefined || val === '') return '-';
                            return translateDigits(val.toString(), currentLang);
                        };

                        // Inject values into slot cells
                        switch (item.slot) {
                            case 'bangla1':
                                if (mcq !== null || isAbsent) cells[2].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[3].textContent = formatCell(cq);
                                if (total !== null || isAbsent) cells[4].textContent = formatCell(total);
                                break;
                            case 'bangla2':
                                if (mcq !== null || isAbsent) cells[5].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[6].textContent = formatCell(cq);
                                if (total !== null || isAbsent) cells[7].textContent = formatCell(total);
                                break;
                            case 'english1':
                                cells[12].textContent = formatCell(total !== null ? total : cq);
                                break;
                            case 'english2':
                                cells[13].textContent = formatCell(total !== null ? total : cq);
                                break;
                            case 'math':
                                if (mcq !== null || isAbsent) cells[18].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[19].textContent = formatCell(cq);
                                if (total !== null || isAbsent) cells[20].textContent = formatCell(total);
                                break;
                            case 'bgs':
                                if (mcq !== null || isAbsent) cells[23].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[24].textContent = formatCell(cq);
                                if (total !== null || isAbsent) cells[25].textContent = formatCell(total);
                                break;
                            case 'chem':
                                if (mcq !== null || isAbsent) cells[28].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[29].textContent = formatCell(cq);
                                if (pracStatus.chem) {
                                    if (prac !== null || isAbsent) cells[30].textContent = formatCell(prac);
                                } else {
                                    cells[30].textContent = '-';
                                }
                                if (total !== null || isAbsent) cells[31].textContent = formatCell(total);
                                break;
                            case 'phys':
                                if (mcq !== null || isAbsent) cells[34].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[35].textContent = formatCell(cq);
                                if (pracStatus.phys) {
                                    if (prac !== null || isAbsent) cells[36].textContent = formatCell(prac);
                                } else {
                                    cells[36].textContent = '-';
                                }
                                if (total !== null || isAbsent) cells[37].textContent = formatCell(total);
                                break;
                            case 'bio':
                                if (mcq !== null || isAbsent) cells[40].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[41].textContent = formatCell(cq);
                                if (pracStatus.bio) {
                                    if (prac !== null || isAbsent) cells[42].textContent = formatCell(prac);
                                } else {
                                    cells[42].textContent = '-';
                                }
                                if (total !== null || isAbsent) cells[43].textContent = formatCell(total);
                                break;
                            case 'rel':
                                if (mcq !== null || isAbsent) cells[46].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[47].textContent = formatCell(cq);
                                if (total !== null || isAbsent) cells[48].textContent = formatCell(total);
                                break;
                            case 'ict':
                                if (mcq !== null || isAbsent) cells[51].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[52].textContent = formatCell(cq);
                                if (total !== null || isAbsent) cells[53].textContent = formatCell(total);
                                break;
                            case 'agri':
                                if (mcq !== null || isAbsent) cells[56].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[57].textContent = formatCell(cq);
                                if (pracStatus.agri) {
                                    if (prac !== null || isAbsent) cells[58].textContent = formatCell(prac);
                                } else {
                                    cells[58].textContent = '-';
                                }
                                if (total !== null || isAbsent) cells[59].textContent = formatCell(total);
                                break;
                        }
                    });
                }
            });
            recalculateTableGradesAndRanks();
        }

        function populateDynamicFilters() {
            // 1. Class Filter
            let classesList = [];
            try {
                classesList = JSON.parse(localStorage.getItem('school_classes') || '[]');
            } catch (e) { }

            const classSelect = document.getElementById('class-filter');
            if (classSelect) {
                if (classesList && classesList.length > 0) {
                    const currentVal = classSelect.value || '10th';
                    classSelect.innerHTML = '<option value="all">All</option>';

                    const classBnMap = {
                        "Play": "প্লে", "Nursery": "নার্সারি", "KG": "কেজি",
                        "One": "১ম", "Two": "২য়", "Three": "৩য়", "Four": "৪র্থ", "Five": "৫ম",
                        "Six": "৬ষ্ঠ", "Seven": "৭ম", "Eight": "৮ম", "Nine": "৯ম", "Ten": "১০ম",
                        "6th": "৬ষ্ঠ", "7th": "৭ম", "8th": "৮ম", "9th": "৯ম", "10th": "১০ম"
                    };

                    const classEnMap = {
                        "Play": "Play", "Nursery": "Nursery", "KG": "KG",
                        "One": "1st", "Two": "2nd", "Three": "3rd", "Four": "4th", "Five": "5th",
                        "Six": "6th", "Seven": "7th", "Eight": "8th", "Nine": "9th", "Ten": "10th",
                        "6th": "6th", "7th": "7th", "8th": "8th", "9th": "9th", "10th": "10th"
                    };

                    classesList.forEach(cls => {
                        const opt = document.createElement('option');
                        opt.value = cls;
                        const bnName = classBnMap[cls] || cls;
                        const enName = classEnMap[cls] || cls;
                        opt.textContent = currentLang === 'en' ? enName : bnName;
                        opt.setAttribute('data-en', enName);
                        opt.setAttribute('data-bn', bnName);
                        classSelect.appendChild(opt);
                    });

                    if ([...classSelect.options].some(o => o.value === currentVal)) {
                        classSelect.value = currentVal;
                    } else if (classSelect.options.length > 1) {
                        const tenOpt = [...classSelect.options].find(o => o.value === 'Ten' || o.value === '10th');
                        if (tenOpt) {
                            classSelect.value = tenOpt.value;
                        } else {
                            classSelect.selectedIndex = classSelect.options.length - 1;
                        }
                    }
                } else {
                    [...classSelect.options].forEach(opt => {
                        const val = opt.value;
                        if (val === 'all') { opt.setAttribute('data-bn', 'সকল'); opt.setAttribute('data-en', 'All'); }
                        else if (val === '6th') { opt.setAttribute('data-bn', '৬ষ্ঠ'); opt.setAttribute('data-en', '6th'); }
                        else if (val === '7th') { opt.setAttribute('data-bn', '৭ম'); opt.setAttribute('data-en', '7th'); }
                        else if (val === '8th') { opt.setAttribute('data-bn', '৮ম'); opt.setAttribute('data-en', '8th'); }
                        else if (val === '9th') { opt.setAttribute('data-bn', '৯ম'); opt.setAttribute('data-en', '9th'); }
                        else if (val === '10th') { opt.setAttribute('data-bn', '১০ম'); opt.setAttribute('data-en', '10th'); }
                    });
                }
            }

            // 2. Exam Filter & Section Filter (Dynamically synchronized with Exam Portal's Exam List)
            if (classSelect && classSelect.value) {
                currentFilterClass = classSelect.value;
            }
            updateExamFilterOptions(currentFilterClass, currentFilterExam);
            updateSectionFilterOptions();
        }

        function applySchoolSettings() {
            let settings = {};
            try {
                const storedSettings = localStorage.getItem('school_settings');
                if (storedSettings) {
                    settings = JSON.parse(storedSettings);
                }
            } catch (e) {
                console.error("Error parsing school_settings:", e);
            }

            const schoolName = settings.schoolName || "CHERANGA JHARPARA HIGH SCHOOL";
            const schoolAddress = (settings.schoolAddress && !settings.schoolAddress.includes("Sector-10, Uttara")) 
                ? settings.schoolAddress 
                : "সিংড়িয়া শিবুরহাট, জলঢাকা, নীলফামারী।";

            document.querySelectorAll('.header h1').forEach(el => {
                el.textContent = schoolName;
            });
            document.querySelectorAll('.header p').forEach(el => {
                el.textContent = schoolAddress;
            });
        }
        
        // Respect URL parameters for class, exam, and section
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const paramClass = urlParams.get('class');
            const paramExam = urlParams.get('exam');
            const paramSec = urlParams.get('section');
            if (paramClass) currentFilterClass = paramClass;
            if (paramExam) currentFilterExam = paramExam;
            if (paramSec) currentFilterSection = paramSec;
        } catch (e) { }

        // Populate dynamic filters from local storage
        populateDynamicFilters();

        const defaultClass = document.getElementById('class-filter')?.value || currentFilterClass;
        const defaultExam = document.getElementById('exam-filter')?.value || currentFilterExam;

        // Initialize default header print state
        applySchoolSettings();
        wrapVerticalHeaders();
        changeHeaderPrint('all');
    
        filterClass(defaultClass);
        if (defaultExam) filterExam(defaultExam);
        changePaperSize('A3');
        resetFontSize();
        sortStudents('roll');
        const gpaMethodEl = document.getElementById('gpa-calc-method');
        if (gpaMethodEl) gpaMethodEl.value = currentGPACalcMethod;

        changeTableLayout('default');
        changeMCQWritten('show');
        updateSubjects();
        recalculateTableGradesAndRanks();
        highlightFailures();

        // Listen for storage and database changes to keep filters, subjects, grading rules, student marks, and ranks updated in real-time
        function refreshTabulationSheetData() {
            populateDynamicFilters();
            applySchoolSettings();
            updateHeaderMeta();
            updateSubjects();
            syncStudentNamesFromDatabase();
            populateStudentMarksFromDatabase();
            applyTableSettings();
            recalculateTableGradesAndRanks();
            highlightFailures();
            applyFilters();
            const modal = document.getElementById('grading-system-modal');
            if (modal && modal.style.display !== 'none') {
                renderGradingSystemModalContent();
            }
        }

        window.addEventListener('storage', (e) => {
            if (!e.key || e.key === 'school_classes' || e.key === 'school_subjects' || e.key === 'school_marking_system' || e.key === 'school_exam_schedules' || e.key === 'school_exam_routines' || e.key === 'school_exam_types' || e.key === 'school_settings' || e.key === 'school_students' || e.key === 'school_student_marks' || e.key === 'school_active_exam_filter') {
                refreshTabulationSheetData();
            }
        });

        window.addEventListener('dbSynced', refreshTabulationSheetData);
        window.addEventListener('school_subjects_synced', refreshTabulationSheetData);
        window.addEventListener('school_classes_synced', refreshTabulationSheetData);
        window.addEventListener('localStorageUpdated', refreshTabulationSheetData);
        window.addEventListener('focus', refreshTabulationSheetData);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) refreshTabulationSheetData();
        });

        // Periodic live sync check (detects changes made in Exam Portal, Student Directory, Grading Scale, or Academic Subject Management without needing reload)
        let lastKnownStudentsJson = '';
        let lastKnownSubjectsJson = '';
        let lastKnownMarkingSystemJson = '';
        let lastKnownMarksJson = '';
        let lastKnownSchedulesJson = '';
        let lastKnownActiveExam = '';
        try {
            lastKnownStudentsJson = localStorage.getItem('school_students') || '';
            lastKnownSubjectsJson = localStorage.getItem('school_subjects') || '';
            lastKnownMarkingSystemJson = localStorage.getItem('school_marking_system') || '';
            lastKnownMarksJson = localStorage.getItem('school_student_marks') || '';
            lastKnownSchedulesJson = localStorage.getItem('school_exam_schedules') || '';
            lastKnownActiveExam = localStorage.getItem('school_active_exam_filter') || '';
        } catch (e) { }

        // Background live database sync from server (/api/db)
        function syncLiveTabulationDbData() {
            if (window._lastTabDbFetch && (Date.now() - window._lastTabDbFetch < 2000)) return;
            window._lastTabDbFetch = Date.now();
            fetch('/api/db?keys=school_exam_schedules,school_exam_types,school_exam_routines,school_omr_exams,school_classes,school_students,school_settings,school_student_marks,school_subjects')
                .then(r => r.json())
                .then(data => {
                    if (data && typeof data === 'object') {
                        let hasChanged = false;
                        ['school_exam_schedules', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_classes', 'school_students', 'school_student_marks', 'school_subjects'].forEach(k => {
                            if (data[k]) {
                                const strVal = typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]);
                                if (localStorage.getItem(k) !== strVal) {
                                    localStorage.setItem(k, strVal);
                                    hasChanged = true;
                                }
                            }
                        });
                        if (hasChanged) {
                            refreshTabulationSheetData();
                        }
                    }
                })
                .catch(() => {});
        }

        let lastKnownExamTypesJson = '';

        setInterval(() => {
            try {
                syncLiveTabulationDbData();

                const currentStudentsJson = localStorage.getItem('school_students') || '';
                const currentSubjectsJson = localStorage.getItem('school_subjects') || '';
                const currentMarkingSystemJson = localStorage.getItem('school_marking_system') || '';
                const currentMarksJson = localStorage.getItem('school_student_marks') || '';
                const currentSchedulesJson = localStorage.getItem('school_exam_schedules') || '';
                const currentExamTypesJson = localStorage.getItem('school_exam_types') || '';
                const currentActiveExam = localStorage.getItem('school_active_exam_filter') || '';

                if (currentStudentsJson !== lastKnownStudentsJson || 
                    currentSubjectsJson !== lastKnownSubjectsJson || 
                    currentMarkingSystemJson !== lastKnownMarkingSystemJson ||
                    currentMarksJson !== lastKnownMarksJson ||
                    currentSchedulesJson !== lastKnownSchedulesJson ||
                    currentExamTypesJson !== lastKnownExamTypesJson ||
                    currentActiveExam !== lastKnownActiveExam) {
                    lastKnownStudentsJson = currentStudentsJson;
                    lastKnownSubjectsJson = currentSubjectsJson;
                    lastKnownMarkingSystemJson = currentMarkingSystemJson;
                    lastKnownMarksJson = currentMarksJson;
                    lastKnownSchedulesJson = currentSchedulesJson;
                    lastKnownExamTypesJson = currentExamTypesJson;
                    lastKnownActiveExam = currentActiveExam;
                    refreshTabulationSheetData();
                }
            } catch (e) { }
        }, 1000);


        // --- DETECT DESKTOP VIEW ON MOBILE & TABLET DEVICES ---
        (function handleDesktopViewOnMobile() {
            function applyDesktopViewStyle() {
                const isMobileOrTablet = (navigator.maxTouchPoints > 0 || 
                                          /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent));
                const isDesktopView = window.innerWidth >= 980;
                
                if (isMobileOrTablet && isDesktopView) {
                    document.documentElement.classList.add('desktop-view-on-mobile');
                    document.body.classList.add('desktop-view-on-mobile');
                } else {
                    document.documentElement.classList.remove('desktop-view-on-mobile');
                    document.body.classList.remove('desktop-view-on-mobile');
                }
            }
            
            window.addEventListener('DOMContentLoaded', applyDesktopViewStyle);
            window.addEventListener('resize', applyDesktopViewStyle);
            applyDesktopViewStyle();
        })();
    
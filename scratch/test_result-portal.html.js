
// BLOCK 2

        // --- BENGALI NUMBER CONVERTER ---
        function toBnDigits(num) {
            if (num === null || num === undefined || num === '') return '';
            const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            return num.toString().replace(/\d/g, d => bnDigits[d]);
        }

        function toEnDigits(str) {
            if (!str) return '';
            const bnDigits = {'০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'};
            return str.toString().replace(/[০-৯]/g, d => bnDigits[d] || d);
        }

        // Calculate Grade and Point based on 100-mark scale
        function getGradeAndGP(marks) {
            const m = parseFloat(marks) || 0;
            if (m >= 80) return { grade: 'A+', gp: 5.0 };
            if (m >= 70) return { grade: 'A',  gp: 4.0 };
            if (m >= 60) return { grade: 'A-', gp: 3.5 };
            if (m >= 50) return { grade: 'B',  gp: 3.0 };
            if (m >= 40) return { grade: 'C',  gp: 2.0 };
            if (m >= 33) return { grade: 'D',  gp: 1.0 };
            return { grade: 'F', gp: 0.0 };
        }

        // Dynamic School Identity Sync
        function updateSchoolIdentity() {
            try {
                const customLogo = localStorage.getItem('school_logo');
                let rawSettings = localStorage.getItem('school_settings');
                let settings = null;
                if (rawSettings) {
                    try { settings = JSON.parse(rawSettings); } catch(e) {}
                }

                const logoImg = document.getElementById('sheet-logo-img');
                if (logoImg) {
                    const targetLogo = customLogo || (settings && settings.schoolLogo) || 'school_logo.svg';
                    if (logoImg.getAttribute('src') !== targetLogo) {
                        logoImg.src = targetLogo;
                    }
                }

                if (settings) {
                    if (settings.schoolName) {
                        const nameEl = document.getElementById('sheet-school-name');
                        if (nameEl) nameEl.textContent = settings.schoolName;
                    }
                    if (settings.schoolAddress || settings.schoolSubtitle) {
                        const addrEl = document.getElementById('sheet-school-address');
                        if (addrEl) addrEl.textContent = settings.schoolAddress || settings.schoolSubtitle;
                    }
                }
            } catch (e) {
                console.error("Error updating school identity:", e);
            }
        }

        // Cascading helpers for portal
        function normalizeClassString(str) {
            if (!str) return '';
            const s = String(str).toLowerCase().trim();
            if (s.includes('দশম') || s.includes('ten') || s === '10' || s === '১০') return '10';
            if (s.includes('নবম') || s.includes('nine') || s === '9' || s === '৯') return '9';
            if (s.includes('অষ্টম') || s.includes('eight') || s === '8' || s === '৮') return '8';
            if (s.includes('সপ্তম') || s.includes('seven') || s === '7' || s === '৭') return '7';
            if (s.includes('ষষ্ঠ') || s.includes('six') || s === '6' || s === '৬') return '6';
            if (s.includes('পঞ্চম') || s.includes('five') || s === '5' || s === '৫') return '5';
            if (s.includes('চতুর্থ') || s.includes('four') || s === '4' || s === '৪') return '4';
            if (s.includes('তৃতীয়') || s.includes('three') || s === '3' || s === '৩') return '3';
            if (s.includes('দ্বিতীয়') || s.includes('two') || s === '2' || s === '২') return '2';
            if (s.includes('প্রথম') || s.includes('one') || s === '1' || s === '১') return '1';
            return s;
        }

        function onPortalExamChange() {
            const examSelect = document.getElementById('result-exam');
            const classSelect = document.getElementById('result-class');
            if (!examSelect || !classSelect) return;

            const examName = examSelect.value;
            const classSet = new Set();

            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r && (r.examName === examName || !examName) && (r.className || r.class)) {
                                classSet.add(formatClassNameDisplay(r.className || r.class));
                            }
                        });
                    }
                }
            } catch(e) {}

            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && (s.term === examName || s.examName === examName || !examName) && (s.className || s.class)) {
                                classSet.add(formatClassNameDisplay(s.className || s.class));
                            }
                        });
                    }
                }
            } catch(e) {}

            if (classSet.size === 0) {
                try {
                    const rawClasses = localStorage.getItem('school_classes');
                    if (rawClasses) {
                        const parsed = JSON.parse(rawClasses);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(c => { if (typeof c === 'string' && c.trim()) classSet.add(formatClassNameDisplay(c)); });
                        }
                    }
                } catch(e) {}
            }

            const defaultClasses = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            if (classSet.size === 0) defaultClasses.forEach(c => classSet.add(c));

            const classList = sortClassesSequential(classSet);
            const currentClass = classSelect.value;
            classSelect.innerHTML = classList.map(c => `<option value="${c}">${c}</option>`).join('');
            const matchedOpt = classList.find(c => normalizeClassString(c) === normalizeClassString(currentClass));
            if (matchedOpt) {
                classSelect.value = matchedOpt;
            } else if (classList.length > 0) {
                classSelect.selectedIndex = 0;
            }

            onPortalClassChange();
        }

        function onPortalClassChange() {
            const classSelect = document.getElementById('result-class');
            const sectionSelect = document.getElementById('result-section');
            if (!classSelect || !sectionSelect) return;

            const selectedClass = classSelect.value;
            const normC = normalizeClassString(selectedClass);
            const isSecondary = ['9', '10'].includes(normC);

            const sectionSet = new Set();
            try {
                const rawStudents = localStorage.getItem('school_students');
                if (rawStudents) {
                    const parsed = JSON.parse(rawStudents);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && normalizeClassString(s.class || s.className) === normC) {
                                if (isSecondary) {
                                    if (s.group && s.group !== '(প্রযোজ্য না)') sectionSet.add(s.group.trim());
                                    if (s.section && s.section !== '(প্রযোজ্য না)' && !['ক','খ','গ','A','B','C'].includes(s.section)) sectionSet.add(s.section.trim());
                                } else {
                                    if (s.section && s.section !== '(প্রযোজ্য না)') sectionSet.add(s.section.trim());
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            if (sectionSet.size === 0) {
                if (isSecondary) {
                    ["বিজ্ঞান", "মানবিক", "ব্যবসায় শিক্ষা"].forEach(s => sectionSet.add(s));
                } else {
                    ["ক", "খ", "গ"].forEach(s => sectionSet.add(s));
                }
            }

            const currentSec = sectionSelect.value;
            const secList = Array.from(sectionSet);
            sectionSelect.innerHTML = secList.map(s => `<option value="${s}">${s}</option>`).join('');
            if (currentSec && secList.includes(currentSec)) {
                sectionSelect.value = currentSec;
            } else if (secList.length > 0) {
                sectionSelect.selectedIndex = 0;
            }
        }

        // Populate dropdown options from localStorage dynamically
        function initSearchDropdowns() {
            try {
                // Populate Exam Types
                const storedExams = localStorage.getItem('school_exam_types');
                if (storedExams) {
                    const parsedExams = JSON.parse(storedExams);
                    if (Array.isArray(parsedExams) && parsedExams.length > 0) {
                        const examSelect = document.getElementById('result-exam');
                        const currentVal = examSelect.value;
                        let opts = '';
                        parsedExams.forEach(ex => {
                            const name = ex.name || ex.title || ex;
                            opts += `<option value="${name}">${name}</option>`;
                        });
                        examSelect.innerHTML = opts;
                        if (currentVal) examSelect.value = currentVal;
                    }
                }

                onPortalExamChange();
            } catch (e) {
                console.error("Error initializing dropdowns:", e);
            }
        }

        function normalizeClassString(cls) {
            if (!cls) return '10';
            const c = cls.toString().toLowerCase().trim();
            if (c.includes('দশম') || c.includes('ten') || /\b10\b/.test(c) || c === '10' || c === '10th' || c.includes('১০')) return '10';
            if (c.includes('নবম') || c.includes('nine') || /\b9\b/.test(c) || c === '9' || c === '9th' || c.includes('৯')) return '9';
            if (c.includes('অষ্টম') || c.includes('eight') || /\b8\b/.test(c) || c === '8' || c === '8th' || c.includes('৮')) return '8';
            if (c.includes('সপ্তম') || c.includes('seven') || /\b7\b/.test(c) || c === '7' || c === '7th' || c.includes('৭')) return '7';
            if (c.includes('ষষ্ঠ') || c.includes('six') || /\b6\b/.test(c) || c === '6' || c === '6th' || c.includes('৬')) return '6';
            if (c.includes('পঞ্চম') || c.includes('five') || /\b5\b/.test(c) || c === '5' || c === '5th' || c.includes('৫')) return '5';
            if (c.includes('চতুর্থ') || c.includes('four') || /\b4\b/.test(c) || c === '4' || c === '4th' || c.includes('৪')) return '4';
            if (c.includes('তৃতীয়') || c.includes('তৃতীয়') || c.includes('three') || /\b3\b/.test(c) || c === '3' || c === '3rd' || c.includes('৩')) return '3';
            if (c.includes('দ্বিতীয়') || c.includes('দ্বিতীয়') || c.includes('two') || /\b2\b/.test(c) || c === '2' || c === '2nd' || c.includes('২')) return '2';
            if (c.includes('প্রথম') || c.includes('one') || /\b1\b/.test(c) || c === '1' || c === '1st' || c.includes('১')) return '1';
            if (c.includes('কেজি') || c.includes('kg')) return 'kg';
            if (c.includes('নার্সারি') || c.includes('nursery')) return 'nursery';
            if (c.includes('প্লে') || c.includes('play')) return 'play';
            return c;
        }

        function formatClassNameDisplay(c) {
            if (!c) return '';
            const norm = normalizeClassString(c);
            const map = {
                'play': 'Play',
                'nursery': 'Nursery',
                'kg': 'KG',
                '1': 'One',
                '2': 'Two',
                '3': 'Three',
                '4': 'Four',
                '5': 'Five',
                '6': 'Six',
                '7': 'Seven',
                '8': 'Eight',
                '9': 'Nine',
                '10': 'Ten'
            };
            if (map[norm]) return map[norm];
            return c.replace(/^class\s*/i, '').replace(/শ্রেণি|শ্রেণী/g, '').trim() || c;
        }

        function sortClassesSequential(classes) {
            const classOrderMap = {
                'play': 1,
                'nursery': 2,
                'kg': 3,
                '1': 4,
                '2': 5,
                '3': 6,
                '4': 7,
                '5': 8,
                '6': 9,
                '7': 10,
                '8': 11,
                '9': 12,
                '10': 13
            };
            return Array.from(classes).sort((a, b) => {
                const oa = classOrderMap[normalizeClassString(a)] || 99;
                const ob = classOrderMap[normalizeClassString(b)] || 99;
                return oa - ob;
            });
        }

        function normalizeSectionString(sec) {
            if (!sec) return '';
            const s = sec.toString().toLowerCase().trim();
            if (s.includes('science') || s.includes('বিজ্ঞান') || s.includes('sci')) return 'science';
            if (s.includes('humanities') || s.includes('মানবিক') || s.includes('hum') || s.includes('arts')) return 'humanities';
            if (s.includes('business') || s.includes('ব্যবসায়') || s.includes('বাণিজ্য') || s.includes('com') || s.includes('bus')) return 'business';
            return s;
        }

        function getSubjectNameBangla(sub) {
            if (!sub) return '';
            if (typeof sub === 'string') sub = { name: sub };
            if (sub.nameBn && sub.nameBn.trim()) {
                const b = sub.nameBn.trim();
                if (b === 'বাংলা ১ম পত্র' || b === 'বাংলা ১ম' || b.includes('বাংলা সাহিত্য')) return 'বাংলা সাহিত্য';
                if (b === 'বাংলা ২য় পত্র' || b === 'বাংলা ২য়' || b.includes('ব্যাকরণ')) return 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি';
                if (b === 'ইংরেজি ১ম পত্র' || b === 'ইংরেজি ১ম') return 'ইংরেজি ১ম পত্র';
                if (b === 'ইংরেজি ২য় পত্র' || b === 'ইংরেজি ২য়') return 'ইংরেজি ২য় পত্র';
                return b;
            }

            const raw = (sub.name || sub.subject || '').trim();
            const short = (sub.shortName || '').trim().toLowerCase();
            const cleanLower = raw.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

            const dictionary = {
                'bangla sahitya': 'বাংলা সাহিত্য',
                'bangla 1st': 'বাংলা সাহিত্য',
                'bangla 1st paper': 'বাংলা সাহিত্য',
                'bangla first paper': 'বাংলা সাহিত্য',
                'bangla bhashar byakaran and nirmiti': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
                'bangla bhashar byakaran o nirmiti': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
                'bangla 2nd': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
                'bangla 2nd paper': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
                'bangla second paper': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
                'bangla grammar': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
                'english for today': 'ইংরেজি ১ম পত্র',
                'english 1st': 'ইংরেজি ১ম পত্র',
                'english 1st paper': 'ইংরেজি ১ম পত্র',
                'english first paper': 'ইংরেজি ১ম পত্র',
                'english grammar and composition': 'ইংরেজি ২য় পত্র',
                'english 2nd': 'ইংরেজি ২য় পত্র',
                'english 2nd paper': 'ইংরেজি ২য় পত্র',
                'english second paper': 'ইংরেজি ২য় পত্র',
                'english grammar': 'ইংরেজি ২য় পত্র',
                'mathematics': 'গণিত',
                'math': 'গণিত',
                'general mathematics': 'সাধারণ গণিত',
                'higher mathematics': 'উচ্চতর গণিত',
                'higher math': 'উচ্চতর গণিত',
                'general science': 'সাধারণ বিজ্ঞান',
                'science': 'বিজ্ঞান',
                'physics': 'পদার্থবিজ্ঞান',
                'chemistry': 'রসায়ন',
                'biology': 'জীববিজ্ঞান',
                'bangladesh and global studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
                'bangladesh & global studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
                'bgs': 'বাংলাদেশ ও বিশ্বপরিচয়',
                'information and communication technology': 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
                'information & communication technology': 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
                'ict': 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
                'agriculture studies': 'কৃষি শিক্ষা',
                'agricultural studies': 'কৃষি শিক্ষা',
                'agriculture': 'কৃষি শিক্ষা',
                'islamic studies': 'ইসলাম ও নৈতিক শিক্ষা',
                'islam and moral education': 'ইসলাম ও নৈতিক শিক্ষা',
                'islam & moral education': 'ইসলাম ও নৈতিক শিক্ষা',
                'islam': 'ইসলাম ও নৈতিক শিক্ষা',
                'hindu religion studies': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'hindu religion and moral education': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'hindu religion & moral education': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'hindu': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'christian religion and moral education': 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
                'buddhist religion and moral education': 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
                'home science': 'গার্হস্থ্য বিজ্ঞান',
                'physical education and health': 'শারীরিক শিক্ষা ও স্বাস্থ্য',
                'physical education': 'শারীরিক শিক্ষা ও স্বাস্থ্য',
                'arts and crafts': 'চারু ও কারুকলা',
                'fine arts': 'চারু ও কারুকলা',
                'accounting': 'হিসাববিজ্ঞান',
                'finance and banking': 'ফিন্যান্স ও ব্যাংকিং',
                'finance & banking': 'ফিন্যান্স ও ব্যাংকিং',
                'finance': 'ফিন্যান্স ও ব্যাংকিং',
                'business entrepreneurship': 'ব্যবসায় উদ্যোগ',
                'business studies': 'ব্যবসায় উদ্যোগ',
                'geography and environment': 'ভূগোল ও পরিবেশ',
                'geography & environment': 'ভূগোল ও পরিবেশ',
                'geography': 'ভূগোল ও পরিবেশ',
                'history of bangladesh and world civilization': 'ইতিহাস ও সামাজিক বিজ্ঞান',
                'history': 'ইতিহাস ও সামাজিক বিজ্ঞান',
                'civics and citizenship': 'পৌরনীতি ও নাগরিকতা',
                'civics': 'পৌরনীতি ও নাগরিকতা',
                'economics': 'অর্থনীতি'
            };

            if (short && dictionary[short]) return dictionary[short];
            if (dictionary[cleanLower]) return dictionary[cleanLower];

            for (let key in dictionary) {
                if (cleanLower.includes(key)) {
                    return dictionary[key];
                }
            }

            return raw || 'বিষয়';
        }

        function getSubjectSortRank(sub) {
            const raw = (typeof sub === 'string' ? sub : (sub.nameBn || sub.name || '')).trim();
            const isOpt = typeof sub === 'object' && (sub.isOptional || sub.group === 'optional');
            if (isOpt) return 999; // Optional Subject always at the very bottom row!

            if (raw.includes('বাংলা সাহিত্য') || raw.includes('বাংলা ১ম') || raw.toLowerCase().includes('bangla 1st')) return 1;
            if (raw.includes('বাংলা ভাষার ব্যাকরণ') || raw.includes('বাংলা ২য়') || raw.toLowerCase().includes('bangla 2nd') || raw.includes('ব্যাকরণ')) return 2;
            if (raw.includes('ইংরেজি ১ম') || raw.toLowerCase().includes('english 1st') || raw.toLowerCase().includes('english for today')) return 3;
            if (raw.includes('ইংরেজি ২য়') || raw.toLowerCase().includes('english 2nd') || raw.toLowerCase().includes('grammar and composition')) return 4;
            if (raw === 'গণিত' || raw === 'সাধারণ গণিত' || raw.toLowerCase() === 'mathematics' || raw.toLowerCase() === 'math') return 5;
            if (raw.includes('তথ্য ও যোগাযোগ') || raw.includes('ICT') || raw.includes('আইসিটি')) return 6;
            if (raw.includes('ইসলাম') || raw.includes('হিন্দু') || raw.includes('বৌদ্ধ') || raw.includes('খ্রিস্ট') || raw.includes('ধর্ম')) return 7;
            if (raw.includes('বাংলাদেশ ও বিশ্বপরিচয়') || raw === 'বিজ্ঞান' || raw === 'সাধারণ বিজ্ঞান') return 8;
            if (raw.includes('পদার্থবিজ্ঞান') || raw.includes('পৌরনীতি') || raw.includes('হিসাববিজ্ঞান')) return 9;
            if (raw.includes('রসায়ন') || raw.includes('রসায়ন') || raw.includes('ইতিহাস') || raw.includes('ব্যবসায় উদ্যোগ') || raw.includes('ব্যবসায় উদ্যোগ')) return 10;
            if (raw.includes('জীববিজ্ঞান') || raw.includes('ভূগোল') || raw.includes('ফিন্যান্স')) return 11;
            if (raw.includes('অর্থনীতি') || raw.includes('চারু')) return 12;
            if (raw.includes('শারীরিক')) return 13;
            return 50;
        }

        function getStudentReligionInfo(student) {
            const r = String(student?.religion || student?.religionBn || 'Islam').toLowerCase();
            if (r.includes('hindu') || r.includes('হিন্দু') || r.includes('সনাতন')) {
                return {
                    name: 'Hindu Religion Studies',
                    nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                    display: 'হিন্দু (সনাতন)'
                };
            } else if (r.includes('buddh') || r.includes('বৌদ্ধ')) {
                return {
                    name: 'Buddhist Religion Studies',
                    nameBn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
                    display: 'বৌদ্ধ'
                };
            } else if (r.includes('christ') || r.includes('খ্রিস্ট') || r.includes('ঈসায়ী')) {
                return {
                    name: 'Christian Religion Studies',
                    nameBn: 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
                    display: 'খ্রিস্টান'
                };
            }
            return {
                name: 'Islamic Studies',
                nameBn: 'ইসলাম ও নৈতিক শিক্ষা',
                display: 'ইসলাম'
            };
        }

        function getStudentOptionalSubjectInfo(student, normS) {
            let raw = student ? (student.optionalSubject || student.optional_subject || student.fourthSubject || student.optional || '') : '';
            let optBn = '';
            if (raw) {
                optBn = getSubjectNameBangla(raw);
            }
            if (!optBn || optBn === 'বিষয়') {
                if (normS === 'science') {
                    optBn = 'উচ্চতর গণিত';
                    raw = 'Higher Mathematics';
                } else if (normS === 'humanities') {
                    optBn = 'কৃষি শিক্ষা';
                    raw = 'Agriculture Studies';
                } else if (normS === 'business') {
                    optBn = 'কৃষি শিক্ষা';
                    raw = 'Agriculture Studies';
                } else {
                    optBn = 'কৃষি শিক্ষা';
                    raw = 'Agriculture Studies';
                }
            }
            return {
                name: raw || optBn,
                nameBn: optBn
            };
        }

        // Dynamic Subjects generator based on Exam Portal (school_subjects, school_exam_schedules)
        function getDefaultSubjectRows(className = 'দশম', group = 'বিজ্ঞান', exam = '', student = null) {
            const normC = normalizeClassString(className);
            const normS = normalizeSectionString(group);
            const isSci = normS === 'science' || group.includes('বিজ্ঞান') || group.toLowerCase().includes('science');
            const isHum = normS === 'humanities' || group.includes('মানবিক') || group.toLowerCase().includes('humanities');
            const isBus = normS === 'business' || group.includes('ব্যবসায়') || group.toLowerCase().includes('business');
            const isSecondary = ['9', '10'].includes(normC);
            const isJunior = ['6', '7', '8'].includes(normC);
            const isPrimary = ['play', 'nursery', 'kg', '1', '2', '3', '4', '5'].includes(normC);

            const relInfo = getStudentReligionInfo(student);
            const optInfo = getStudentOptionalSubjectInfo(student, normS);

            let rawList = [];

            try {
                const rawSubjectsMap = localStorage.getItem('school_subjects');
                if (rawSubjectsMap) {
                    const subMap = JSON.parse(rawSubjectsMap);
                    if (typeof subMap === 'object' && subMap !== null) {
                        const classKeys = Object.keys(subMap);
                        const matchedKey = classKeys.find(k => normalizeClassString(k) === normC || k.toLowerCase().trim() === (className || '').toLowerCase().trim());
                        if (matchedKey && Array.isArray(subMap[matchedKey]) && subMap[matchedKey].length > 0) {
                            const candidateSubs = subMap[matchedKey];
                            candidateSubs.forEach(s => {
                                if (!s) return;
                                const sec = (s.section || 'All').toString().trim().toLowerCase();
                                const sBnName = getSubjectNameBangla(s);
                                const isOpt = !!s.isOptional;

                                // Filter out non-matching religions
                                const isRelSub = sBnName.includes('ইসলাম') || sBnName.includes('হিন্দু') || sBnName.includes('বৌদ্ধ') || sBnName.includes('খ্রিস্ট') || sBnName.includes('ধর্ম');
                                if (isRelSub && !sBnName.includes(relInfo.display) && !sBnName.includes('ধর্ম ও নৈতিক')) {
                                    return;
                                }

                                if (sec === 'all' || sec === '') {
                                    if (isSecondary) {
                                        const isGeneralSci = sBnName === 'বিজ্ঞান' || sBnName === 'সাধারণ বিজ্ঞান';
                                        const isBGS = sBnName.includes('বাংলাদেশ ও বিশ্বপরিচয়');
                                        if (isSci && isGeneralSci && !isBGS) return;
                                        if (!isSci && isBGS && !isGeneralSci) return;
                                    }
                                    rawList.push({
                                        name: s.name || sBnName,
                                        nameBn: isRelSub ? relInfo.nameBn : sBnName,
                                        code: s.code || '',
                                        isOptional: isOpt
                                    });
                                } else if (isSecondary) {
                                    let matchesGroup = false;
                                    if (isSci && (sec.includes('বিজ্ঞান') || sec.includes('sci') || sec.includes('a'))) matchesGroup = true;
                                    else if (isHum && (sec.includes('মানবিক') || sec.includes('hum') || sec.includes('b'))) matchesGroup = true;
                                    else if (isBus && (sec.includes('ব্যবসায়') || sec.includes('bus') || sec.includes('c'))) matchesGroup = true;
                                    if (matchesGroup) {
                                        rawList.push({
                                            name: s.name || sBnName,
                                            nameBn: isRelSub ? relInfo.nameBn : sBnName,
                                            code: s.code || '',
                                            isOptional: isOpt
                                        });
                                    }
                                } else {
                                    rawList.push({
                                        name: s.name || sBnName,
                                        nameBn: isRelSub ? relInfo.nameBn : sBnName,
                                        code: s.code || '',
                                        isOptional: isOpt
                                    });
                                }
                            });

                            if (isSecondary) {
                                const hasPhysics = rawList.some(r => r.nameBn.includes('পদার্থ') || (r.name || '').toLowerCase().includes('phys'));
                                const hasAcc = rawList.some(r => r.nameBn.includes('হিসাব') || (r.name || '').toLowerCase().includes('acc'));
                                const hasCivics = rawList.some(r => r.nameBn.includes('পৌরনীতি') || (r.name || '').toLowerCase().includes('civic'));

                                if (isSci && !hasPhysics) {
                                    rawList.push({ name: 'Physics', nameBn: 'পদার্থবিজ্ঞান', group: 'elective' });
                                    rawList.push({ name: 'Chemistry', nameBn: 'রসায়ন', group: 'elective' });
                                    rawList.push({ name: 'Biology', nameBn: 'জীববিজ্ঞান', group: 'elective' });
                                    rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, group: 'optional', isOptional: true });
                                } else if (isHum && !hasCivics) {
                                    rawList.push({ name: 'Civics', nameBn: 'পৌরনীতি ও নাগরিকতা', group: 'elective' });
                                    rawList.push({ name: 'History', nameBn: 'ইতিহাস ও সামাজিক বিজ্ঞান', group: 'elective' });
                                    rawList.push({ name: 'Geography', nameBn: 'ভূগোল ও পরিবেশ', group: 'elective' });
                                    rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, group: 'optional', isOptional: true });
                                } else if (isBus && !hasAcc) {
                                    rawList.push({ name: 'Accounting', nameBn: 'হিসাববিজ্ঞান', group: 'elective' });
                                    rawList.push({ name: 'Business Ent', nameBn: 'ব্যবসায় উদ্যোগ', group: 'elective' });
                                    rawList.push({ name: 'Finance', nameBn: 'ফিন্যান্স ও ব্যাংকিং', group: 'elective' });
                                    rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, group: 'optional', isOptional: true });
                                }
                            }
                        }
                    }
                }
            } catch(e) {}

            if (rawList.length === 0) {
                if (isPrimary) {
                    rawList = [
                        { name: 'বাংলা', nameBn: 'বাংলা' },
                        { name: 'ইংরেজি', nameBn: 'ইংরেজি' },
                        { name: 'গণিত', nameBn: 'গণিত' },
                        { name: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', nameBn: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান' },
                        { name: relInfo.name, nameBn: relInfo.nameBn }
                    ];
                } else if (isJunior) {
                    rawList = [
                        { name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য' },
                        { name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি' },
                        { name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র' },
                        { name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র' },
                        { name: 'গণিত', nameBn: 'গণিত' },
                        { name: 'বিজ্ঞান', nameBn: 'বিজ্ঞান' },
                        { name: 'বাংলাদেশ ও বিশ্বপরিচয়', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়' },
                        { name: relInfo.name, nameBn: relInfo.nameBn },
                        { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)' },
                        { name: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', nameBn: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান' }
                    ];
                } else {
                    rawList = [
                        { name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', group: 'compulsory' },
                        { name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', group: 'compulsory' },
                        { name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', group: 'compulsory' },
                        { name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', group: 'compulsory' },
                        { name: 'গণিত', nameBn: 'গণিত', group: 'compulsory' },
                        { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', group: 'compulsory' },
                        { name: relInfo.name, nameBn: relInfo.nameBn, group: 'compulsory' },
                        { name: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', nameBn: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', group: 'compulsory' }
                    ];

                    if (isSci) {
                        rawList.push({ name: 'পদার্থবিজ্ঞান', nameBn: 'পদার্থবিজ্ঞান', group: 'elective' });
                        rawList.push({ name: 'রসায়ন', nameBn: 'রসায়ন', group: 'elective' });
                        rawList.push({ name: 'জীববিজ্ঞান', nameBn: 'জীববিজ্ঞান', group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, group: 'optional', isOptional: true });
                    } else if (isHum) {
                        rawList.push({ name: 'পৌরনীতি ও নাগরিকতা', nameBn: 'পৌরনীতি ও নাগরিকতা', group: 'elective' });
                        rawList.push({ name: 'ইতিহাস ও সামাজিক বিজ্ঞান', nameBn: 'ইতিহাস ও সামাজিক বিজ্ঞান', group: 'elective' });
                        rawList.push({ name: 'ভূগোল ও পরিবেশ', nameBn: 'ভূগোল ও পরিবেশ', group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, group: 'optional', isOptional: true });
                    } else {
                        rawList.push({ name: 'হিসাববিজ্ঞান', nameBn: 'হিসাববিজ্ঞান', group: 'elective' });
                        rawList.push({ name: 'ব্যবসায় উদ্যোগ', nameBn: 'ব্যবসায় উদ্যোগ', group: 'elective' });
                        rawList.push({ name: 'ফিন্যান্স ও ব্যাংকিং', nameBn: 'ফিন্যান্স ও ব্যাংকিং', group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, group: 'optional', isOptional: true });
                    }
                }
            }

            // Ensure religion subject is strictly present and matches student
            const hasReligionInRaw = rawList.some(r => {
                const b = (r.nameBn || '').trim();
                return b.includes('ইসলাম') || b.includes('হিন্দু') || b.includes('বৌদ্ধ') || b.includes('খ্রিস্ট') || b.includes('ধর্ম');
            });
            if (!hasReligionInRaw) {
                rawList.push({ name: relInfo.name, nameBn: relInfo.nameBn, group: 'compulsory' });
            }

            // If Class 9/10, ensure the optional subject is present and named correctly
            if (isSecondary) {
                let optItem = rawList.find(r => r.group === 'optional' || r.isOptional || (r.nameBn && (r.nameBn.includes('উচ্চতর') || r.nameBn.includes('কৃষি') || r.nameBn.includes('গার্হস্থ্য'))));
                if (optItem) {
                    optItem.name = optInfo.name;
                    optItem.nameBn = optInfo.nameBn;
                    optItem.group = 'optional';
                    optItem.isOptional = true;
                } else {
                    rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, group: 'optional', isOptional: true });
                }
            }

            // Sort rawList strictly by curriculum hierarchy rank (Optional subject always last)
            rawList.sort((a, b) => getSubjectSortRank(a) - getSubjectSortRank(b));

            if (rawList.length > 0) {
                const rows = [];
                const pairedIndices = new Set();

                for (let i = 0; i < rawList.length; i++) {
                    if (pairedIndices.has(i)) continue;
                    const cur = rawList[i];
                    let curName = (cur.nameBn || getSubjectNameBangla(cur) || cur.name || '').trim();

                    let isFirst = false;
                    let pIdx = -1;
                    if (curName.includes('বাংলা সাহিত্য') || curName.includes('বাংলা ১ম') || curName.toLowerCase().includes('bangla 1st')) {
                        curName = 'বাংলা সাহিত্য';
                        pIdx = rawList.findIndex((item, idx) => {
                            if (idx === i || pairedIndices.has(idx)) return false;
                            const iName = (item.nameBn || getSubjectNameBangla(item) || item.name || '').trim();
                            return iName.includes('বাংলা ভাষার ব্যাকরণ') || iName.includes('বাংলা ২য়') || iName.includes('ব্যাকরণ') || iName.toLowerCase().includes('bangla 2nd');
                        });
                        if (pIdx !== -1) isFirst = true;
                    } else if (curName.includes('ইংরেজি ১ম') || curName.toLowerCase().includes('english 1st') || curName.toLowerCase().includes('english for today')) {
                        curName = 'ইংরেজি ১ম পত্র';
                        pIdx = rawList.findIndex((item, idx) => {
                            if (idx === i || pairedIndices.has(idx)) return false;
                            const iName = (item.nameBn || getSubjectNameBangla(item) || item.name || '').trim();
                            return iName.includes('ইংরেজি ২য়') || iName.toLowerCase().includes('english 2nd') || iName.toLowerCase().includes('grammar');
                        });
                        if (pIdx !== -1) isFirst = true;
                    }

                    let rollSeed = 1;
                    if (student && student.roll) {
                        const parsedRoll = parseInt(toEnDigits(student.roll), 10);
                        if (!isNaN(parsedRoll) && parsedRoll > 0) rollSeed = parsedRoll;
                    }
                    const rankDecr = Math.min(22, (rollSeed - 1) * 2.2);

                    const isICT = curName.includes('আইসিটি') || curName.includes('ICT') || curName.includes('তথ্য ও যোগাযোগ');
                    const hasPr = isICT || curName.includes('বিজ্ঞান') || curName.includes('রসায়ন') || curName.includes('রসায়ন') || curName.includes('পদার্থ') || curName.includes('জীব') || curName.includes('কৃষি') || curName.includes('Physics') || curName.includes('Chemistry') || curName.includes('Biology');

                    const mcq = isICT ? 24 : (hasPr ? 22 : (curName.includes('ইংরেজি') ? '' : 28));
                    const cq = isICT ? '' : (hasPr ? 43 : (curName.includes('ইংরেজি') ? 82 : 58));
                    const pr = hasPr ? 24 : '';

                    let groupType = cur.group || (cur.isOptional ? 'optional' : 'compulsory');

                    if (isFirst && pIdx !== -1) {
                        pairedIndices.add(i);
                        pairedIndices.add(pIdx);
                        const pItem = rawList[pIdx];
                        let pName = (pItem.nameBn || getSubjectNameBangla(pItem) || pItem.name || '').trim();
                        if (curName === 'বাংলা সাহিত্য') pName = 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি';
                        if (curName === 'ইংরেজি ১ম পত্র') pName = 'ইংরেজি ২য় পত্র';

                        rows.push({
                            name: curName,
                            mcq: mcq,
                            cq: cq,
                            practical: pr,
                            isCombined: true,
                            pairWith: pName,
                            pairMcq: pName.includes('ইংরেজি') ? '' : 26,
                            pairCq: pName.includes('ইংরেজি') ? 78 : 60,
                            pairPractical: '',
                            group: groupType,
                            isOptional: false
                        });
                    } else {
                        pairedIndices.add(i);
                        rows.push({
                            name: curName,
                            mcq: mcq,
                            cq: cq,
                            practical: pr,
                            isCombined: false,
                            group: groupType,
                            isOptional: cur.isOptional || groupType === 'optional'
                        });
                    }
                }

                // For Class 9 and 10, explicitly ensure that Optional Subject is strictly in the bottom (last) row
                if (isSecondary) {
                    const optIdx = rows.findIndex(r => r.group === 'optional' || r.isOptional);
                    if (optIdx !== -1 && optIdx !== rows.length - 1) {
                        const optRow = rows.splice(optIdx, 1)[0];
                        rows.push(optRow);
                    }
                }

                return rows;
            }

            return [];
        }

        // Render standard Marksheet.html rows
        function renderMarksheetRows(subjectList) {
            const tbody = document.getElementById('marksheet-rows-tbody');
            if (!tbody) return { grandTotal: 0, gpa: '0.00', grade: 'F' };

            let html = '';
            let grandTotal = 0;
            let totalGps = 0;
            let subjectCount = 0;
            let hasFailed = false;

            subjectList.forEach(sub => {
                if (sub.isCombined) {
                    // Combined Subject (e.g. Bangla 1st & 2nd, English 1st & 2nd)
                    const m1 = (sub.mcq || 0) + (sub.cq || 0) + (sub.practical || 0);
                    const m2 = (sub.pairMcq || 0) + (sub.pairCq || 0) + (sub.pairPractical || 0);
                    const combTotal = m1 + m2;
                    const avg100 = combTotal / 2;
                    const res = getGradeAndGP(avg100);

                    grandTotal += combTotal;
                    totalGps += res.gp;
                    subjectCount++;
                    if (res.gp === 0) hasFailed = true;

                    html += `
                        <tr>
                            <td class="subject-col">${sub.name}</td>
                            ${sub.isEng ? `<td colspan="2">${sub.cq !== '' ? toBnDigits(sub.cq) : '-'}</td>` : `<td>${sub.mcq !== '' ? toBnDigits(sub.mcq) : ''}</td><td>${sub.cq !== '' ? toBnDigits(sub.cq) : ''}</td>`}
                            <td>${sub.practical !== '' ? toBnDigits(sub.practical) : ''}</td>
                            <td>${m1 > 0 ? toBnDigits(m1) : ''}</td>
                            <td rowspan="2" style="font-weight:bold; font-size:14px; vertical-align:middle;">${toBnDigits(combTotal)}</td>
                            <td rowspan="2" style="font-weight:bold; font-size:15px; vertical-align:middle;">${res.grade}</td>
                            <td rowspan="2" style="font-weight:bold; vertical-align:middle;">${toBnDigits(res.gp.toFixed(2))}</td>
                        </tr>
                        <tr>
                            <td class="subject-col">${sub.pairWith}</td>
                            ${sub.isEng ? `<td colspan="2">${sub.pairCq !== '' ? toBnDigits(sub.pairCq) : '-'}</td>` : `<td>${sub.pairMcq !== '' ? toBnDigits(sub.pairMcq) : ''}</td><td>${sub.pairCq !== '' ? toBnDigits(sub.pairCq) : ''}</td>`}
                            <td>${sub.pairPractical !== '' ? toBnDigits(sub.pairPractical) : ''}</td>
                            <td>${m2 > 0 ? toBnDigits(m2) : ''}</td>
                        </tr>
                    `;
                } else {
                    // Single Subject
                    const mcqVal = (sub.mcq !== undefined && sub.mcq !== '') ? parseInt(sub.mcq) || 0 : 0;
                    const cqVal = (sub.cq !== undefined && sub.cq !== '') ? parseInt(sub.cq) || 0 : 0;
                    const pracVal = (sub.practical !== undefined && sub.practical !== '') ? parseInt(sub.practical) || 0 : 0;
                    const subTotal = mcqVal + cqVal + pracVal;
                    const res = getGradeAndGP(subTotal);

                    grandTotal += subTotal;
                    totalGps += res.gp;
                    subjectCount++;
                    if (res.gp === 0) hasFailed = true;

                    const pracClass = (sub.practical !== '' && sub.practical !== undefined) ? 'practical-shaded' : '';

                    html += `
                        <tr>
                            <td class="subject-col">${sub.name}</td>
                            <td>${sub.mcq !== '' && sub.mcq !== undefined ? toBnDigits(sub.mcq) : ''}</td>
                            <td>${sub.cq !== '' && sub.cq !== undefined ? toBnDigits(sub.cq) : ''}</td>
                            <td class="${pracClass}">${sub.practical !== '' && sub.practical !== undefined ? toBnDigits(sub.practical) : ''}</td>
                            <td>${subTotal > 0 ? toBnDigits(subTotal) : '০'}</td>
                            <td></td>
                            <td style="font-weight: bold; font-size: 15px;">${res.grade}</td>
                            <td>${toBnDigits(res.gp.toFixed(2))}</td>
                        </tr>
                    `;
                }
            });

            tbody.innerHTML = html;

            const finalGpa = hasFailed || subjectCount === 0 ? 0.0 : Math.min(5.0, (totalGps / subjectCount));
            const overallGrade = hasFailed ? 'F' : (finalGpa >= 5.0 ? 'A+' : (finalGpa >= 4.0 ? 'A' : (finalGpa >= 3.5 ? 'A-' : (finalGpa >= 3.0 ? 'B' : (finalGpa >= 2.0 ? 'C' : (finalGpa >= 1.0 ? 'D' : 'F'))))));

            return {
                grandTotal: grandTotal,
                gpa: finalGpa.toFixed(2),
                grade: overallGrade
            };
        }

        // Main Result Search Function
        function searchResult() {
            const exam = document.getElementById('result-exam').value || 'অর্ধ-বার্ষিক পরীক্ষা ২০২৫';
            const className = document.getElementById('result-class').value || 'দশম';
            const section = document.getElementById('result-section').value || 'বিজ্ঞান';
            const rollInput = document.getElementById('result-roll').value.trim();
            const regInput = document.getElementById('result-reg').value.trim();
            const errorElement = document.getElementById('result-search-error');
            const sheetContainer = document.getElementById('result-sheet-container');

            if (!rollInput) {
                errorElement.innerText = "দয়া করে রোল নম্বরটি লিখুন।";
                errorElement.style.display = "block";
                sheetContainer.style.display = "none";
                return;
            }

            errorElement.style.display = "none";
            sheetContainer.style.display = "block";

            // Search database for student
            let matchedStudent = null;
            try {
                const students = JSON.parse(localStorage.getItem('school_students') || '[]');
                const enRoll = toEnDigits(rollInput);
                const enReg = toEnDigits(regInput);

                matchedStudent = students.find(s => {
                    const sRoll = toEnDigits(s.roll || s.rollNo || s.id || '');
                    const sReg = toEnDigits(s.registration || s.reg || s.studentId || '');
                    const sClass = (s.class || s.className || '').toLowerCase();
                    const reqClass = className.toLowerCase();

                    const rollMatch = (sRoll === enRoll || sRoll === rollInput);
                    const classMatch = !className || sClass.includes(reqClass) || reqClass.includes(sClass);
                    const regMatch = !enReg || (sReg === enReg);

                    return rollMatch && classMatch && regMatch;
                });
            } catch (e) {
                console.error("Error finding student in DB:", e);
            }

            const studentName = matchedStudent ? (matchedStudent.nameBn || matchedStudent.name || 'শিক্ষার্থী') : (rollInput === '১' || rollInput === '1' ? 'মোঃ সাইদুর রহমান' : (rollInput === '৫' || rollInput === '5' ? 'সাব্বির রহমান' : 'শিক্ষার্থী ' + rollInput));
            const studentRoll = toBnDigits(rollInput);
            const studentClass = matchedStudent && matchedStudent.class ? matchedStudent.class : className;
            const studentSection = matchedStudent && (matchedStudent.section || matchedStudent.group) ? (matchedStudent.section || matchedStudent.group) : section;

            // Populate Student Card Details
            document.getElementById('sheet-exam-title').innerText = exam;
            document.getElementById('sheet-student-name').innerText = studentName;
            document.getElementById('sheet-student-roll').innerText = studentRoll;
            document.getElementById('sheet-student-class').innerText = studentClass;
            document.getElementById('sheet-student-section').innerText = studentSection;

            const normC = normalizeClassString(studentClass);
            const normS = normalizeSectionString(studentSection);
            const isSecondary = ['9', '10'].includes(normC);
            const relInfo = getStudentReligionInfo(matchedStudent);
            const optInfo = getStudentOptionalSubjectInfo(matchedStudent, normS);

            const relEl = document.getElementById('sheet-student-religion');
            if (relEl) relEl.innerText = relInfo.display;

            const optRow = document.getElementById('sheet-optional-row');
            const optEl = document.getElementById('sheet-student-optional');
            if (optRow) {
                if (isSecondary) {
                    optRow.style.display = 'block';
                    if (optEl) optEl.innerText = optInfo.nameBn;
                } else {
                    optRow.style.display = 'none';
                }
            }

            // Render Subjects and Calculate Marks
            const subjects = getDefaultSubjectRows(studentClass, studentSection, exam, matchedStudent);
            const summary = renderMarksheetRows(subjects);

            // Populate Summary and Merit
            document.getElementById('sheet-grand-total').innerText = toBnDigits(summary.grandTotal);
            document.getElementById('sheet-gpa').innerText = toBnDigits(summary.gpa);
            document.getElementById('sheet-grade').innerText = summary.grade;
            const rankVal = matchedStudent && (matchedStudent.roll || matchedStudent.rollNo) ? matchedStudent.roll : (rollInput || (summary.gpa === '5.00' ? '1' : (summary.gpa >= '4.00' ? '2' : '3')));
            document.getElementById('sheet-merit-position').innerText = toBnDigits(rankVal);

            // Update school identity & logo
            updateSchoolIdentity();

            // Store active search for Marksheet.html direct view
            try {
                localStorage.setItem('current_marksheet_data', JSON.stringify({
                    exam: exam,
                    name: studentName,
                    roll: rollInput,
                    class: studentClass,
                    section: studentSection,
                    grandTotal: summary.grandTotal,
                    gpa: summary.gpa,
                    grade: summary.grade
                }));
            } catch(e) {}

            // Update Marksheet.html Link with Query Parameters
            const marksheetLink = document.getElementById('btn-open-marksheet-file');
            const templateVal = document.getElementById('portal-template-filter') ? document.getElementById('portal-template-filter').value : 'Marksheet.html';
            if (marksheetLink) {
                marksheetLink.href = `${templateVal}?roll=${encodeURIComponent(rollInput)}&class=${encodeURIComponent(studentClass)}&exam=${encodeURIComponent(exam)}&name=${encodeURIComponent(studentName)}&section=${encodeURIComponent(studentSection)}&mode=all`;
            }

            // Smooth scroll to marksheet
            setTimeout(() => {
                sheetContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        function onPortalTemplateFilterChange(templateFile) {
            const btn = document.getElementById('btn-open-marksheet-file');
            const exam = document.getElementById('result-exam')?.value || 'অর্ধ-বার্ষিক পরীক্ষা ২০২৫';
            const className = document.getElementById('result-class')?.value || 'দশম';
            const section = document.getElementById('result-section')?.value || 'বিজ্ঞান';
            const roll = document.getElementById('result-roll')?.value || '১';
            const templateText = templateFile === 'Marksheet1.html' ? 'Temp-02' : 'Temp-01';

            if (btn) {
                btn.href = `${templateFile}?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&exam=${encodeURIComponent(exam)}&roll=${encodeURIComponent(roll)}&mode=all`;
                btn.innerHTML = `📄 ${templateText} ফাইলে খুলুন`;
            }
        }

        // Generate All Marksheets for Selected Filter Section Options
        function generateAllMarksheetsFromPortal() {
            const exam = document.getElementById('result-exam')?.value || 'অর্ধ-বার্ষিক পরীক্ষা ২০২৫';
            const className = document.getElementById('result-class')?.value || 'দশম';
            const section = document.getElementById('result-section')?.value || 'বিজ্ঞান';
            const templateFile = document.getElementById('portal-template-filter')?.value || 'Marksheet.html';

            // Save to localStorage for instant sync
            localStorage.setItem('school_marksheet_exam', exam);
            localStorage.setItem('school_marksheet_class', className);
            localStorage.setItem('school_marksheet_section', section);

            // Open Marksheet template in all-students mode
            const targetUrl = `${templateFile}?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&exam=${encodeURIComponent(exam)}&mode=all`;
            window.location.href = targetUrl;
        }

        // Quick Sample Marksheet loader
        function loadSampleMarksheet() {
            document.getElementById('result-roll').value = '১';
            document.getElementById('result-class').value = 'দশম';
            document.getElementById('result-section').value = 'বিজ্ঞান';
            searchResult();
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', () => {
            initSearchDropdowns();
            updateSchoolIdentity();
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'school_logo' || e.key === 'school_settings') {
                updateSchoolIdentity();
            }
            if (e.key === 'school_exam_types' || e.key === 'school_classes') {
                initSearchDropdowns();
            }
        });

        window.addEventListener('dbSynced', () => {
            updateSchoolIdentity();
            initSearchDropdowns();
        });
    

// BLOCK 1

        function normalizeClassString(str) {
            if (!str) return '10';
            const s = String(str).toLowerCase().trim();
            if (s.includes('দশম') || s.includes('ten') || /\b10\b/.test(s) || s === '10' || s === '10th' || s.includes('১০')) return '10';
            if (s.includes('নবম') || s.includes('nine') || /\b9\b/.test(s) || s === '9' || s === '9th' || s.includes('৯')) return '9';
            if (s.includes('অষ্টম') || s.includes('eight') || /\b8\b/.test(s) || s === '8' || s === '8th' || s.includes('৮')) return '8';
            if (s.includes('সপ্তম') || s.includes('seven') || /\b7\b/.test(s) || s === '7' || s === '7th' || s.includes('৭')) return '7';
            if (s.includes('ষষ্ঠ') || s.includes('six') || /\b6\b/.test(s) || s === '6' || s === '6th' || s.includes('৬')) return '6';
            if (s.includes('পঞ্চম') || s.includes('five') || /\b5\b/.test(s) || s === '5' || s === '5th' || s.includes('৫')) return '5';
            if (s.includes('চতুর্থ') || s.includes('four') || /\b4\b/.test(s) || s === '4' || s === '4th' || s.includes('৪')) return '4';
            if (s.includes('তৃতীয়') || s.includes('তৃতীয়') || s.includes('three') || /\b3\b/.test(s) || s === '3' || s === '3rd' || s.includes('৩')) return '3';
            if (s.includes('দ্বিতীয়') || s.includes('দ্বিতীয়') || s.includes('two') || /\b2\b/.test(s) || s === '2' || s === '2nd' || s.includes('২')) return '2';
            if (s.includes('প্রথম') || s.includes('one') || /\b1\b/.test(s) || s === '1' || s === '1st' || s.includes('১')) return '1';
            if (s.includes('কেজি') || s.includes('kg')) return 'kg';
            if (s.includes('নার্সারি') || s.includes('nursery')) return 'nursery';
            if (s.includes('প্লে') || s.includes('play')) return 'play';
            return s;
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

        function toBnDigits(n) {
            if (n === null || n === undefined) return '';
            const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
            return String(n).replace(/[0-9]/g, d => bn[d]);
        }

        function toEnDigits(n) {
            if (n === null || n === undefined) return '';
            const en = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
            return String(n).replace(/[০-৯]/g, d => en[d]);
        }

        function normalizeSectionString(str) {
            if (!str) return 'science';
            const s = String(str).toLowerCase().trim();
            if (s.includes('বিজ্ঞান') || s.includes('science') || s === 'a' || s === 'ক') return 'science';
            if (s.includes('মানবিক') || s.includes('humanities') || s.includes('arts') || s === 'b' || s === 'খ') return 'humanities';
            if (s.includes('ব্যবসায়') || s.includes('ব্যবসায়') || s.includes('business') || s.includes('commerce') || s === 'c' || s === 'গ') return 'business';
            return s;
        }

        function calculateGradeAndGP(marks, fullMarks = 100) {
            if (marks === null || marks === undefined || isNaN(marks)) return { grade: 'F', gp: 0.00 };
            const pct = (marks / fullMarks) * 100;
            if (pct >= 80) return { grade: 'A+', gp: 5.00 };
            if (pct >= 70) return { grade: 'A', gp: 4.00 };
            if (pct >= 60) return { grade: 'A-', gp: 3.50 };
            if (pct >= 50) return { grade: 'B', gp: 3.00 };
            if (pct >= 40) return { grade: 'C', gp: 2.00 };
            if (pct >= 33) return { grade: 'D', gp: 1.00 };
            return { grade: 'F', gp: 0.00 };
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
            if (raw.includes('রসায়ন') || raw.includes('ইতিহাস') || raw.includes('ব্যবসায় উদ্যোগ')) return 10;
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

        // Dynamic Subject Finder directly from Exam Portal (school_subjects, school_exam_schedules, school_exam_routines)
        function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {
            const normC = normalizeClassString(selectedClass);
            const normS = normalizeSectionString(selectedSection);
            const isSecondary = ['9', '10'].includes(normC);
            const isJunior = ['6', '7', '8'].includes(normC);
            const isPrimary = ['play', 'nursery', 'kg', '1', '2', '3', '4', '5'].includes(normC);

            const relInfo = getStudentReligionInfo(student);
            const optInfo = getStudentOptionalSubjectInfo(student, normS);

            let rawList = [];

            // 1. Try reading subjects directly from Exam Portal's school_subjects map
            try {
                const rawSubjectsMap = localStorage.getItem('school_subjects');
                if (rawSubjectsMap) {
                    const subMap = JSON.parse(rawSubjectsMap);
                    if (typeof subMap === 'object' && subMap !== null) {
                        const classKeys = Object.keys(subMap);
                        const matchedKey = classKeys.find(k => {
                            const nk = normalizeClassString(k);
                            return nk === normC || k.toLowerCase().trim() === (selectedClass || '').toLowerCase().trim();
                        });
                        if (matchedKey && Array.isArray(subMap[matchedKey]) && subMap[matchedKey].length > 0) {
                            const candidateSubs = subMap[matchedKey];
                            candidateSubs.forEach(s => {
                                if (!s) return;
                                const sec = (s.section || 'All').toString().trim().toLowerCase();
                                const sBnName = getSubjectNameBangla(s);
                                const isOpt = !!s.isOptional;

                                // Filter out religion subjects that don't match student's religion
                                const isRelSub = sBnName.includes('ইসলাম') || sBnName.includes('হিন্দু') || sBnName.includes('বৌদ্ধ') || sBnName.includes('খ্রিস্ট') || sBnName.includes('ধর্ম');
                                if (isRelSub && !sBnName.includes(relInfo.display) && !sBnName.includes('ধর্ম ও নৈতিক')) {
                                    return; // skip religion not matching this student
                                }

                                if (sec === 'all' || sec === '') {
                                    if (isSecondary) {
                                        const isGeneralSci = sBnName === 'বিজ্ঞান' || sBnName === 'সাধারণ বিজ্ঞান';
                                        const isBGS = sBnName.includes('বাংলাদেশ ও বিশ্বপরিচয়');
                                        if (normS === 'science' && isGeneralSci && !isBGS) {
                                            return;
                                        }
                                        if (normS !== 'science' && isBGS && !isGeneralSci) {
                                            return;
                                        }
                                    }
                                    rawList.push({
                                        name: s.name || sBnName,
                                        nameBn: isRelSub ? relInfo.nameBn : sBnName,
                                        code: s.code || '',
                                        fullMarks: s.fullMarks || 100,
                                        isOptional: isOpt
                                    });
                                } else if (isSecondary) {
                                    let matchesGroup = false;
                                    if (normS === 'science' && (sec.includes('বিজ্ঞান') || sec.includes('sci') || sec.includes('a'))) matchesGroup = true;
                                    else if (normS === 'humanities' && (sec.includes('মানবিক') || sec.includes('hum') || sec.includes('arts') || sec.includes('b'))) matchesGroup = true;
                                    else if (normS === 'business' && (sec.includes('ব্যবসায়') || sec.includes('বাণিজ্য') || sec.includes('bus') || sec.includes('com') || sec.includes('c'))) matchesGroup = true;

                                    if (matchesGroup) {
                                        rawList.push({
                                            name: s.name || sBnName,
                                            nameBn: isRelSub ? relInfo.nameBn : sBnName,
                                            code: s.code || '',
                                            fullMarks: s.fullMarks || 100,
                                            isOptional: isOpt
                                        });
                                    }
                                } else {
                                    if (sec.includes(normS) || normS.includes(sec)) {
                                        rawList.push({
                                            name: s.name || sBnName,
                                            nameBn: isRelSub ? relInfo.nameBn : sBnName,
                                            code: s.code || '',
                                            fullMarks: s.fullMarks || 100,
                                            isOptional: isOpt
                                        });
                                    }
                                }
                            });

                            if (isSecondary) {
                                const hasPhysics = rawList.some(r => r.nameBn.includes('পদার্থ') || (r.name || '').toLowerCase().includes('phys'));
                                const hasAcc = rawList.some(r => r.nameBn.includes('হিসাব') || (r.name || '').toLowerCase().includes('acc'));
                                const hasCivics = rawList.some(r => r.nameBn.includes('পৌরনীতি') || (r.name || '').toLowerCase().includes('civic'));

                                if (normS === 'science' && !hasPhysics) {
                                    rawList.push({ name: 'Physics', nameBn: 'পদার্থবিজ্ঞান', fullMarks: 100, code: '136', group: 'elective' });
                                    rawList.push({ name: 'Chemistry', nameBn: 'রসায়ন', fullMarks: 100, code: '137', group: 'elective' });
                                    rawList.push({ name: 'Biology', nameBn: 'জীববিজ্ঞান', fullMarks: 100, code: '138', group: 'elective' });
                                    rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, code: '126', group: 'optional', isOptional: true });
                                } else if (normS === 'humanities' && !hasCivics) {
                                    rawList.push({ name: 'Civics', nameBn: 'পৌরনীতি ও নাগরিকতা', fullMarks: 100, code: '140', group: 'elective' });
                                    rawList.push({ name: 'History', nameBn: 'ইতিহাস ও সামাজিক বিজ্ঞান', fullMarks: 100, code: '153', group: 'elective' });
                                    rawList.push({ name: 'Geography', nameBn: 'ভূগোল ও পরিবেশ', fullMarks: 100, code: '110', group: 'elective' });
                                    rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, code: '134', group: 'optional', isOptional: true });
                                } else if (normS === 'business' && !hasAcc) {
                                    rawList.push({ name: 'Accounting', nameBn: 'হিসাববিজ্ঞান', fullMarks: 100, code: '146', group: 'elective' });
                                    rawList.push({ name: 'Business Ent', nameBn: 'ব্যবসায় উদ্যোগ', fullMarks: 100, code: '143', group: 'elective' });
                                    rawList.push({ name: 'Finance', nameBn: 'ফিন্যান্স ও ব্যাংকিং', fullMarks: 100, code: '152', group: 'elective' });
                                    rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, code: '134', group: 'optional', isOptional: true });
                                }
                            }
                        }
                    }
                }
            } catch(e) {
                console.error("Error reading school_subjects from Exam Portal:", e);
            }

            // 2. If no subjects found in school_subjects, check school_exam_schedules
            if (rawList.length === 0) {
                try {
                    const rawSchedules = localStorage.getItem('school_exam_schedules');
                    if (rawSchedules) {
                        const schedules = JSON.parse(rawSchedules);
                        if (Array.isArray(schedules) && schedules.length > 0) {
                            const matchedSchedules = schedules.filter(sc => {
                                const matchExam = !selectedExam || (sc.term === selectedExam || sc.examName === selectedExam);
                                const matchClass = normalizeClassString(sc.className || sc.class) === normC;
                                const matchSec = !sc.section || sc.section === 'All' || normalizeSectionString(sc.section) === normS;
                                return matchExam && matchClass && matchSec;
                            });
                            if (matchedSchedules.length > 0) {
                                const seenNames = new Set();
                                matchedSchedules.forEach(sc => {
                                    const sName = sc.subject || sc.name;
                                    const sBnName = getSubjectNameBangla(sc);
                                    const isRelSub = sBnName.includes('ইসলাম') || sBnName.includes('হিন্দু') || sBnName.includes('বৌদ্ধ') || sBnName.includes('খ্রিস্ট') || sBnName.includes('ধর্ম');
                                    if (isRelSub && !sBnName.includes(relInfo.display) && !sBnName.includes('ধর্ম ও নৈতিক')) {
                                        return;
                                    }
                                    const finalBnName = isRelSub ? relInfo.nameBn : sBnName;
                                    if (finalBnName && !seenNames.has(finalBnName)) {
                                        seenNames.add(finalBnName);
                                        rawList.push({
                                            name: sName || finalBnName,
                                            nameBn: finalBnName,
                                            code: sc.code || '',
                                            fullMarks: sc.totalMarks || sc.fullMarks || 100,
                                            mcqMarks: sc.mcqMarks,
                                            cqMarks: sc.cqMarks,
                                            practicalMarks: sc.practicalMarks,
                                            isOptional: sc.isOptional || false
                                        });
                                    }
                                });
                            }
                        }
                    }
                } catch(e) {}
            }

            // 3. Fallback standard curriculum subjects if none configured
            if (rawList.length === 0) {
                if (isPrimary) {
                    rawList = [
                        { name: 'বাংলা', nameBn: 'বাংলা', fullMarks: 100, mcq: '', cq: 85, pr: '' },
                        { name: 'ইংরেজি', nameBn: 'ইংরেজি', fullMarks: 100, mcq: '', cq: 82, pr: '' },
                        { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100, mcq: '', cq: 88, pr: '' },
                        { name: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', nameBn: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', fullMarks: 100, mcq: '', cq: 84, pr: '' },
                        { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100, mcq: '', cq: 90, pr: '' }
                    ];
                } else if (isJunior) {
                    rawList = [
                        { name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', fullMarks: 100, mcq: 26, cq: 56, pr: '' },
                        { name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', fullMarks: 100, mcq: 27, cq: 55, pr: '' },
                        { name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', fullMarks: 100, mcq: '', cq: 78, pr: '' },
                        { name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', fullMarks: 100, mcq: '', cq: 76, pr: '' },
                        { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100, mcq: 28, cq: 58, pr: '' },
                        { name: 'বিজ্ঞান', nameBn: 'বিজ্ঞান', fullMarks: 100, mcq: 24, cq: 43, pr: 23 },
                        { name: 'বাংলাদেশ ও বিশ্বপরিচয়', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', fullMarks: 100, mcq: 25, cq: 57, pr: '' },
                        { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100, mcq: 28, cq: 60, pr: '' },
                        { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', fullMarks: 50, mcq: 22, cq: '', pr: 23 },
                        { name: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', nameBn: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', fullMarks: 100, mcq: 23, cq: 42, pr: 24 }
                    ];
                } else {
                    const isSci = normS === 'science' || selectedSection.includes('বিজ্ঞান');
                    const isHum = normS === 'humanities' || selectedSection.includes('মানবিক');

                    rawList = [
                        { name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', fullMarks: 100, mcq: 25, cq: 58, pr: '', group: 'compulsory' },
                        { name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', fullMarks: 100, mcq: 28, cq: 49, pr: '', group: 'compulsory' },
                        { name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', fullMarks: 100, mcq: '', cq: 78, pr: '', group: 'compulsory' },
                        { name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', fullMarks: 100, mcq: '', cq: 76, pr: '', group: 'compulsory' },
                        { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100, mcq: 27, cq: 60, pr: '', group: 'compulsory' },
                        { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', fullMarks: 50, mcq: 22, cq: '', pr: 23, group: 'compulsory' },
                        { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100, mcq: 28, cq: 61, pr: '', group: 'compulsory' },
                        { name: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', nameBn: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', fullMarks: 100, mcq: 26, cq: 55, pr: '', group: 'compulsory' }
                    ];

                    if (isSci) {
                        rawList.push({ name: 'পদার্থবিজ্ঞান', nameBn: 'পদার্থবিজ্ঞান', fullMarks: 100, mcq: 21, cq: 42, pr: 24, group: 'elective' });
                        rawList.push({ name: 'রসায়ন', nameBn: 'রসায়ন', fullMarks: 100, mcq: 22, cq: 41, pr: 23, group: 'elective' });
                        rawList.push({ name: 'জীববিজ্ঞান', nameBn: 'জীববিজ্ঞান', fullMarks: 100, mcq: 23, cq: 39, pr: 24, group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, mcq: 24, cq: 45, pr: 22, group: 'optional', isOptional: true });
                    } else if (isHum) {
                        rawList.push({ name: 'পৌরনীতি ও নাগরিকতা', nameBn: 'পৌরনীতি ও নাগরিকতা', fullMarks: 100, mcq: 25, cq: 58, pr: '', group: 'elective' });
                        rawList.push({ name: 'ইতিহাস ও সামাজিক বিজ্ঞান', nameBn: 'ইতিহাস ও সামাজিক বিজ্ঞান', fullMarks: 100, mcq: 24, cq: 56, pr: '', group: 'elective' });
                        rawList.push({ name: 'ভূগোল ও পরিবেশ', nameBn: 'ভূগোল ও পরিবেশ', fullMarks: 100, mcq: 22, cq: 54, pr: '', group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, mcq: 23, cq: 43, pr: 24, group: 'optional', isOptional: true });
                    } else {
                        rawList.push({ name: 'হিসাববিজ্ঞান', nameBn: 'হিসাববিজ্ঞান', fullMarks: 100, mcq: 26, cq: 58, pr: '', group: 'elective' });
                        rawList.push({ name: 'ব্যবসায় উদ্যোগ', nameBn: 'ব্যবসায় উদ্যোগ', fullMarks: 100, mcq: 25, cq: 57, pr: '', group: 'elective' });
                        rawList.push({ name: 'ফিন্যান্স ও ব্যাংকিং', nameBn: 'ফিন্যান্স ও ব্যাংকিং', fullMarks: 100, mcq: 24, cq: 56, pr: '', group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, mcq: 23, cq: 43, pr: 24, group: 'optional', isOptional: true });
                    }
                }
            }

            // Ensure religion subject is strictly present and matches student
            const hasReligionInRaw = rawList.some(r => {
                const b = (r.nameBn || '').trim();
                return b.includes('ইসলাম') || b.includes('হিন্দু') || b.includes('বৌদ্ধ') || b.includes('খ্রিস্ট') || b.includes('ধর্ম');
            });
            if (!hasReligionInRaw) {
                rawList.push({ name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100, mcq: 28, cq: 61, pr: '', group: 'compulsory' });
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
                    rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, mcq: 24, cq: 45, pr: 22, group: 'optional', isOptional: true });
                }
            }

            // Sort rawList strictly by curriculum hierarchy rank (Optional subject always last)
            rawList.sort((a, b) => getSubjectSortRank(a) - getSubjectSortRank(b));

            // Format rawList into structured marksheet rows (combining 1st & 2nd papers where applicable)
            const rows = [];
            const pairedIndices = new Set();

            for (let i = 0; i < rawList.length; i++) {
                if (pairedIndices.has(i)) continue;
                const current = rawList[i];
                let curName = (current.nameBn || getSubjectNameBangla(current) || current.name || '').trim();
                const curFull = parseInt(current.fullMarks || current.totalMarks) || (curName.includes('আইসিটি') || curName.includes('ICT') ? 50 : 100);

                let isFirstPaper = false;
                let pairIndex = -1;

                if (curName.includes('বাংলা সাহিত্য') || curName.includes('বাংলা ১ম') || curName.toLowerCase().includes('bangla 1st')) {
                    curName = 'বাংলা সাহিত্য';
                    pairIndex = rawList.findIndex((item, idx) => {
                        if (idx === i || pairedIndices.has(idx)) return false;
                        const iName = (item.nameBn || getSubjectNameBangla(item) || item.name || '').trim();
                        return iName.includes('বাংলা ভাষার ব্যাকরণ') || iName.includes('বাংলা ২য়') || iName.includes('ব্যাকরণ') || iName.toLowerCase().includes('bangla 2nd');
                    });
                    if (pairIndex !== -1) isFirstPaper = true;
                } else if (curName.includes('ইংরেজি ১ম') || curName.toLowerCase().includes('english 1st') || curName.toLowerCase().includes('english for today')) {
                    curName = 'ইংরেজি ১ম পত্র';
                    pairIndex = rawList.findIndex((item, idx) => {
                        if (idx === i || pairedIndices.has(idx)) return false;
                        const iName = (item.nameBn || getSubjectNameBangla(item) || item.name || '').trim();
                        return iName.includes('ইংরেজি ২য়') || iName.toLowerCase().includes('english 2nd') || iName.toLowerCase().includes('grammar');
                    });
                    if (pairIndex !== -1) isFirstPaper = true;
                }

                let rollSeed = 1;
                if (student && student.roll) {
                    const parsedRoll = parseInt(toEnDigits(student.roll), 10);
                    if (!isNaN(parsedRoll) && parsedRoll > 0) rollSeed = parsedRoll;
                }
                const rankDecr = Math.min(22, (rollSeed - 1) * 2.2);

                const isICT = curName.includes('আইসিটি') || curName.includes('ICT') || curName.includes('তথ্য ও যোগাযোগ');
                const hasPractical = isICT || curName.includes('বিজ্ঞান') || curName.includes('রসায়ন') || curName.includes('পদার্থ') || curName.includes('জীব') || curName.includes('কৃষি') || curName.includes('Physics') || curName.includes('Chemistry') || curName.includes('Biology');

                const baseMcq = isICT ? 24 : (hasPractical ? 23 : (curName.includes('ইংরেজি') ? '' : 27));
                const baseCq = isICT ? '' : (hasPractical ? 46 : (curName.includes('ইংরেজি') ? 80 : 59));
                const basePr = hasPractical ? 24 : '';

                const defaultMcq = baseMcq !== '' ? Math.max(12, Math.round(baseMcq - (rankDecr * 0.28))) : '';
                const defaultCq = baseCq !== '' ? Math.max(25, Math.round(baseCq - (rankDecr * 0.55))) : '';
                const defaultPr = basePr !== '' ? Math.max(18, Math.round(basePr - (rankDecr * 0.12))) : '';

                const mcqVal = current.mcq !== undefined ? current.mcq : (current.mcqMarks !== undefined ? current.mcqMarks : defaultMcq);
                const cqVal = current.cq !== undefined ? current.cq : (current.cqMarks !== undefined ? current.cqMarks : defaultCq);
                const prVal = current.pr !== undefined ? current.pr : (current.practicalMarks !== undefined ? current.practicalMarks : defaultPr);

                let groupType = current.group || (current.isOptional ? 'optional' : 'compulsory');
                if (!current.group && (curName.includes('রসায়ন') || curName.includes('পদার্থ') || curName.includes('জীব') || curName.includes('হিসাব') || curName.includes('পৌরনীতি') || curName.includes('ইতিহাস') || curName.includes('ভূগোল') || curName.includes('ব্যবসায়'))) {
                    groupType = 'elective';
                } else if (!current.group && (curName.includes('উচ্চতর') || curName.includes('কৃষি') || current.isOptional)) {
                    groupType = 'optional';
                }

                if (isFirstPaper && pairIndex !== -1) {
                    pairedIndices.add(i);
                    pairedIndices.add(pairIndex);
                    const pairItem = rawList[pairIndex];
                    let pairName = (pairItem.nameBn || getSubjectNameBangla(pairItem) || pairItem.name || '').trim();
                    if (curName === 'বাংলা সাহিত্য') pairName = 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি';
                    if (curName === 'ইংরেজি ১ম পত্র') pairName = 'ইংরেজি ২য় পত্র';

                    const pairFull = parseInt(pairItem.fullMarks || pairItem.totalMarks) || 100;
                    const pairBaseMcq = pairName.includes('ইংরেজি') ? '' : 27;
                    const pairBaseCq = pairName.includes('ইংরেজি') ? 78 : 58;
                    const pairDefaultMcq = pairBaseMcq !== '' ? Math.max(12, Math.round(pairBaseMcq - (rankDecr * 0.28))) : '';
                    const pairDefaultCq = pairBaseCq !== '' ? Math.max(25, Math.round(pairBaseCq - (rankDecr * 0.55))) : '';
                    const pairDefaultPr = '';
                    const pairMcq = pairItem.mcq !== undefined ? pairItem.mcq : (pairItem.mcqMarks !== undefined ? pairItem.mcqMarks : pairDefaultMcq);
                    const pairCq = pairItem.cq !== undefined ? pairItem.cq : (pairItem.cqMarks !== undefined ? pairItem.cqMarks : pairDefaultCq);
                    const pairPr = pairItem.pr !== undefined ? pairItem.pr : (pairItem.practicalMarks !== undefined ? pairItem.practicalMarks : pairDefaultPr);

                    rows.push({
                        name: curName,
                        fullMarks: curFull,
                        mcq: mcqVal,
                        cq: cqVal,
                        pr: prVal,
                        isCombined: true,
                        pairWith: pairName,
                        pairFull: pairFull,
                        pairMcq: pairMcq,
                        pairCq: pairCq,
                        pairPr: pairPr,
                        group: groupType,
                        isOptional: false
                    });
                } else {
                    pairedIndices.add(i);
                    rows.push({
                        name: curName,
                        fullMarks: curFull,
                        mcq: mcqVal,
                        cq: cqVal,
                        pr: prVal,
                        isCombined: false,
                        group: groupType,
                        isOptional: current.isOptional || groupType === 'optional'
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

        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {
            const tbody = document.getElementById('marksheet-tbody');
            if (!tbody) return;

            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);
            let html = '';
            let grandTotal = 0;
            let totalFullMarks = 0;
            let totalGP = 0;
            let subjectCount = 0;
            let hasFailed = false;

            subjects.forEach(sub => {
                if (sub.isCombined) {
                    const m1 = (parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0);
                    const m2 = (parseInt(sub.pairMcq) || 0) + (parseInt(sub.pairCq) || 0) + (parseInt(sub.pairPr) || 0);
                    const combTotal = m1 + m2;
                    const fullTotal = sub.fullMarks * 2;
                    const res = calculateGradeAndGP(combTotal, fullTotal);

                    grandTotal += combTotal;
                    totalFullMarks += fullTotal;
                    totalGP += res.gp;
                    subjectCount++;
                    if (res.gp === 0) hasFailed = true;

                    html += `<tr>
                        <td class="subject-col">${sub.name}</td>
                        <td>${sub.mcq !== '' ? toBnDigits(sub.mcq) : '—'}</td>
                        <td>${sub.cq !== '' ? toBnDigits(sub.cq) : '—'}</td>
                        <td>${sub.pr !== '' ? toBnDigits(sub.pr) : '—'}</td>
                        <td>${toBnDigits(m1)}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${toBnDigits(combTotal)}</td>
                        <td rowspan="2" style="font-weight: bold;">${res.grade}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${toBnDigits(res.gp.toFixed(2))}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${sub.pairWith}</td>
                        <td>${sub.pairMcq !== '' ? toBnDigits(sub.pairMcq) : '—'}</td>
                        <td>${sub.pairCq !== '' ? toBnDigits(sub.pairCq) : '—'}</td>
                        <td>${sub.pairPr !== '' ? toBnDigits(sub.pairPr) : '—'}</td>
                        <td>${toBnDigits(m2)}</td>
                    </tr>`;
                } else {
                    const tot = (parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0);
                    const res = calculateGradeAndGP(tot, sub.fullMarks);

                    grandTotal += tot;
                    totalFullMarks += sub.fullMarks;
                    totalGP += res.gp;
                    subjectCount++;
                    if (res.gp === 0) hasFailed = true;

                    const isPracCol = sub.pr !== '';
                    html += `<tr>
                        <td class="subject-col">${sub.name}</td>
                        <td>${sub.mcq !== '' ? toBnDigits(sub.mcq) : '—'}</td>
                        <td>${sub.cq !== '' ? toBnDigits(sub.cq) : '—'}</td>
                        <td class="${isPracCol ? 'bg-gray' : ''}">${sub.pr !== '' ? toBnDigits(sub.pr) : '—'}</td>
                        <td>${toBnDigits(tot)}</td>
                        <td style="font-weight: bold;">${toBnDigits(tot)}</td>
                        <td style="font-weight: bold;">${res.grade}</td>
                        <td style="font-weight: bold;">${toBnDigits(res.gp.toFixed(2))}</td>
                    </tr>`;
                }
            });

            tbody.innerHTML = html;

            const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
            const finalGpaStr = hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2));
            const finalGrade = hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))));

            const gtEl = document.getElementById('display-grand-total');
            if (gtEl) gtEl.innerText = toBnDigits(grandTotal);
            const gpaEl = document.getElementById('display-gpa');
            if (gpaEl) gpaEl.innerText = finalGpaStr;
            const gradeEl = document.getElementById('display-final-grade');
            if (gradeEl) gradeEl.innerText = finalGrade;
            const rankEl = document.getElementById('display-rank-val');
            if (rankEl) rankEl.innerText = (student && student.roll ? toBnDigits(student.roll) : '১');
        }

        // 1. Get all available Exams from Exam Portal / Settings
        function getAllExams() {
            const examSet = new Set();
            try {
                const rawTypes = localStorage.getItem('school_exam_types');
                if (rawTypes) {
                    const parsed = JSON.parse(rawTypes);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(t => {
                            if (t && t.name) examSet.add(t.name.trim());
                            else if (typeof t === 'string' && t.trim()) examSet.add(t.trim());
                        });
                    }
                }
            } catch(e) {}

            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => { if (r && r.examName) examSet.add(r.examName.trim()); });
                    }
                }
            } catch(e) {}

            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && s.term) examSet.add(s.term.trim());
                            if (s && s.examName) examSet.add(s.examName.trim());
                        });
                    }
                }
            } catch(e) {}

            const defaultExams = [
                "বার্ষিক পরীক্ষা ২০২৫",
                "অর্ধ-বার্ষিক পরীক্ষা ২০২৫",
                "প্রাক-নির্বাচনী পরীক্ষা ২০২৫",
                "নির্বাচনী পরীক্ষা ২০২৫",
                "১ম সাময়িক পরীক্ষা ২০২৫",
                "২য় সাময়িক পরীক্ষা ২০২৫",
                "মডেল টেস্ট ২০২৫"
            ];
            if (examSet.size === 0) defaultExams.forEach(e => examSet.add(e));
            return Array.from(examSet);
        }

        // 2. Get Classes based on Selected Exam (Cascading: Exam -> Classes)
        function getClassesForExam(examName) {
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

                try {
                    const rawStudents = localStorage.getItem('school_students');
                    if (rawStudents) {
                        const parsed = JSON.parse(rawStudents);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(s => { if (s && s.class) classSet.add(formatClassNameDisplay(s.class)); });
                        }
                    }
                } catch(e) {}
            }

            const defaultClasses = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            if (classSet.size === 0) defaultClasses.forEach(c => classSet.add(c));
            return sortClassesSequential(classSet);
        }

        // 3. Get Sections / Groups based on Selected Class (Cascading: Class -> Sections)
        function getSectionsForClass(className, examName) {
            const sectionSet = new Set();
            const normClass = normalizeClassString(className);
            const isSecondary = ['9', '10'].includes(normClass);

            try {
                const rawStudents = localStorage.getItem('school_students');
                if (rawStudents) {
                    const parsed = JSON.parse(rawStudents);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && normalizeClassString(s.class || s.className) === normClass) {
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

            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && normalizeClassString(s.className || s.class) === normClass && s.section && s.section !== 'All' && s.section !== '(প্রযোজ্য না)') {
                                sectionSet.add(s.section.trim());
                            }
                        });
                    }
                }
            } catch(e) {}

            if (sectionSet.size === 0) {
                if (isSecondary) {
                    ["বিজ্ঞান", "মানবিক", "ব্যবসায় শিক্ষা"].forEach(s => sectionSet.add(s));
                } else {
                    ["ক", "খ", "গ"].forEach(s => sectionSet.add(s));
                }
            }

            return Array.from(sectionSet);
        }

        // Master Cascading Filter Function
        function syncCascadingFilters(trigger = 'all') {
            try {
                const examSelect = document.getElementById('filter-exam');
                const classSelect = document.getElementById('filter-class');
                const sectionSelect = document.getElementById('filter-section');

                // 1. Sync Exams
                if (examSelect && (trigger === 'all' || trigger === 'exam_sync')) {
                    const currentExam = examSelect.value || localStorage.getItem('school_marksheet_exam') || '';
                    const allExams = getAllExams();
                    const currExamOpts = Array.from(examSelect.options).map(o => o.value);
                    const isDiff = allExams.length !== currExamOpts.length || allExams.some((ex, i) => ex !== currExamOpts[i]);
                    if (isDiff) {
                        examSelect.innerHTML = allExams.map(ex => `<option value="${ex}">${ex}</option>`).join('');
                        if (currentExam && allExams.includes(currentExam)) {
                            examSelect.value = currentExam;
                        } else if (allExams.length > 0) {
                            examSelect.selectedIndex = 0;
                        }
                    }
                }

                const selectedExam = examSelect ? examSelect.value : (localStorage.getItem('school_marksheet_exam') || 'বার্ষিক পরীক্ষা ২০২৫');
                localStorage.setItem('school_marksheet_exam', selectedExam);
                const examBadge = document.getElementById('display-exam-name');
                if (examBadge) examBadge.innerText = selectedExam;

                // 2. Sync Classes (Dependent on selectedExam)
                if (classSelect && (trigger === 'all' || trigger === 'exam_sync' || trigger === 'exam_changed')) {
                    const currentClass = classSelect.value || localStorage.getItem('school_marksheet_class') || '';
                    const availableClasses = getClassesForExam(selectedExam);
                    const currClassOpts = Array.from(classSelect.options).map(o => o.value);
                    const isClassDiff = availableClasses.length !== currClassOpts.length || availableClasses.some((c, i) => c !== currClassOpts[i]);
                    if (isClassDiff) {
                        classSelect.innerHTML = availableClasses.map(c => `<option value="${c}">${c}</option>`).join('');
                        const matchedOpt = availableClasses.find(c => normalizeClassString(c) === normalizeClassString(currentClass));
                        if (matchedOpt) {
                            classSelect.value = matchedOpt;
                        } else if (availableClasses.length > 0) {
                            classSelect.selectedIndex = 0;
                        }
                    }
                }

                const selectedClass = classSelect ? classSelect.value : (localStorage.getItem('school_marksheet_class') || 'Ten');
                localStorage.setItem('school_marksheet_class', selectedClass);
                const classEl = document.getElementById('display-class-name');
                if (classEl) classEl.innerText = formatClassNameDisplay(selectedClass);

                // 3. Sync Sections (Dependent on selectedClass)
                if (sectionSelect) {
                    const currentSec = sectionSelect.value || localStorage.getItem('school_marksheet_section') || '';
                    const availableSections = getSectionsForClass(selectedClass, selectedExam);
                    const currSecOpts = Array.from(sectionSelect.options).map(o => o.value);
                    const isSecDiff = availableSections.length !== currSecOpts.length || availableSections.some((s, i) => s !== currSecOpts[i]);
                    if (isSecDiff) {
                        sectionSelect.innerHTML = availableSections.map(s => `<option value="${s}">${s}</option>`).join('');
                        if (currentSec && availableSections.includes(currentSec)) {
                            sectionSelect.value = currentSec;
                        } else if (availableSections.length > 0) {
                            sectionSelect.selectedIndex = 0;
                        }
                    }
                }

                const selectedSection = sectionSelect ? sectionSelect.value : (localStorage.getItem('school_marksheet_section') || 'বিজ্ঞান');
                localStorage.setItem('school_marksheet_section', selectedSection);
                const secEl = document.getElementById('display-section-name');
                if (secEl) secEl.innerText = 'শাখা = ' + selectedSection;

                // 4. Update Student Meta and Render Marksheet Table
                const normClass = normalizeClassString(selectedClass);
                const normSec = normalizeSectionString(selectedSection);

                let rawStudents = localStorage.getItem('school_students');
                let students = [];
                if (rawStudents) {
                    try { students = JSON.parse(rawStudents); } catch(e) {}
                }

                let matchedStudent = null;
                if (Array.isArray(students) && students.length > 0) {
                    matchedStudent = students.find(s => {
                        const sClass = normalizeClassString(s.class || s.className);
                        const sSec = normalizeSectionString(s.section || s.group || s.sectionName);
                        return sClass === normClass && (sSec === normSec || !normSec);
                    });

                    if (!matchedStudent) {
                        matchedStudent = students.find(s => {
                            const sClass = normalizeClassString(s.class || s.className);
                            return sClass === normClass;
                        });
                    }

                    if (!matchedStudent && students.length > 0) {
                        matchedStudent = students[0];
                    }
                }

                const studentName = matchedStudent ? (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || 'মো: আব্দুল্লাহ আল নোমান') : 'মো: আব্দুল্লাহ আল নোমান';
                const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '১') : '১';
                const studentId = matchedStudent ? (matchedStudent.studentId || matchedStudent.regNo || matchedStudent.id || '২০২৬১০১০০১') : '২০২৬১০১০০১';

                const nameEl = document.getElementById('display-student-name');
                if (nameEl && nameEl.innerText !== studentName) nameEl.innerText = studentName;
                const rollEl = document.getElementById('display-roll-no');
                if (rollEl && rollEl.innerText !== rollNo) rollEl.innerText = rollNo;
                const idEl = document.getElementById('display-student-id');
                if (idEl && idEl.innerText !== studentId) idEl.innerText = studentId;

                const isSecondary = ['9', '10'].includes(normClass);
                const relInfo = getStudentReligionInfo(matchedStudent);
                const optInfo = getStudentOptionalSubjectInfo(matchedStudent, normSec);

                const relEl = document.getElementById('display-student-religion');
                if (relEl) relEl.innerText = relInfo.display;

                const optRow = document.getElementById('row-optional-subject');
                const optEl = document.getElementById('display-optional-subject');
                if (optRow) {
                    if (isSecondary) {
                        optRow.style.display = 'flex';
                        if (optEl) optEl.innerText = optInfo.nameBn;
                    } else {
                        optRow.style.display = 'none';
                    }
                }

                if (isCreateAllMode) {
                    renderBatchMarksheets(selectedClass, selectedSection, selectedExam);
                } else {
                    const batchContainer = document.getElementById('batch-marksheets-container');
                    const singleContainer = document.getElementById('single-marksheet-container');
                    if (batchContainer) batchContainer.style.display = 'none';
                    if (singleContainer) singleContainer.style.display = 'block';
                    renderMarksheetTable(selectedClass, selectedSection, matchedStudent || { roll: rollNo }, selectedExam);
                }
            } catch(e) {
                console.error("Error in syncCascadingFilters:", e);
            }
        }

        let isCreateAllMode = true;

        function toggleCreateAll() {
            isCreateAllMode = !isCreateAllMode;
            const btn = document.getElementById('btn-create-all');
            const btnText = document.getElementById('create-all-btn-text');
            if (btn) {
                if (isCreateAllMode) {
                    btn.classList.add('active');
                    if (btnText) btnText.innerText = 'সকল শিক্ষার্থী (All)';
                } else {
                    btn.classList.remove('active');
                    if (btnText) btnText.innerText = 'একক শিক্ষার্থী (Single)';
                }
            }
            syncCascadingFilters('mode_toggled');
        }

        function getAllStudentsForClassAndSection(selectedClass, selectedSection) {
            const normC = normalizeClassString(selectedClass);
            const normS = normalizeSectionString(selectedSection);
            const isSci = normS === 'science';

            let rawStudents = localStorage.getItem('school_students');
            let students = [];
            if (rawStudents) {
                try { students = JSON.parse(rawStudents); } catch(e) {}
            }

            let filtered = [];
            if (Array.isArray(students) && students.length > 0) {
                filtered = students.filter(s => {
                    const sClass = normalizeClassString(s.class || s.className);
                    const sSec = normalizeSectionString(s.section || s.group || s.sectionName);
                    return sClass === normC && (sSec === normS || !normS);
                });
            }

            if (filtered.length > 0) {
                filtered.sort((a, b) => (parseInt(a.roll || 0) || 0) - (parseInt(b.roll || 0) || 0));
                return filtered;
            }

            // Fallback cohort if none present in storage
            const fallbackCohort = [
                { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', name: 'Md. Abdullah Al Noman', studentId: '২০২৬১০১০০১', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
                { roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', name: 'Mst. Fatema Akter', studentId: '২০২৬১০১০০২', religion: 'Islam', optionalSubject: isSci ? 'Biology' : 'Agriculture Studies' },
                { roll: '3', nameBn: 'সৌরভ কুমার রায়', name: 'Sourav Kumar Roy', studentId: '২০২৬১০১০০৩', religion: 'Hindu', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
                { roll: '4', nameBn: 'তানভীর হাসান', name: 'Tanvir Hasan', studentId: '২০২৬১০১০০৪', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
                { roll: '5', nameBn: 'সাদিয়া জাহান', name: 'Sadia Jahan', studentId: '২০২৬১০১০০৫', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
                { roll: '6', nameBn: 'প্রিয়াংকা সরকার', name: 'Priyanka Sarkar', studentId: '২০২৬১০১০০৬', religion: 'Hindu', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
                { roll: '7', nameBn: 'মেহেদী হাসান', name: 'Mehedi Hasan', studentId: '২০২৬১০১০০৭', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
                { roll: '8', nameBn: 'সুমাইয়া জান্নাত', name: 'Sumaiya Jannat', studentId: '২০২৬১০১০০৮', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' }
            ];

            return fallbackCohort;
        }

        function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {
            const normClass = normalizeClassString(selectedClass);
            const normSec = normalizeSectionString(selectedSection);
            const isSecondary = ['9', '10'].includes(normClass);
            const relInfo = getStudentReligionInfo(student);
            const optInfo = getStudentOptionalSubjectInfo(student, normSec);

            const studentName = student.nameBn || student.name || 'শিক্ষার্থী';
            const rollNo = student.roll || student.rollNo || String(rankNum);
            const studentId = student.studentId || student.regNo || student.id || `২০২৬১০১০০${rankNum}`;

            let rawSettings = localStorage.getItem('school_settings');
            let settings = {};
            if (rawSettings) { try { settings = JSON.parse(rawSettings); } catch(e) {} }
            const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
            const addressText = settings.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
            const customLogo = localStorage.getItem('school_logo') || (settings && settings.schoolLogo) || 'school_logo.svg';

            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);

            let tableHtml = '';
            let grandTotal = 0;
            let totalFullMarks = 0;
            let totalGP = 0;
            let subjectCount = 0;
            let hasFailed = false;

            subjects.forEach(sub => {
                if (sub.isCombined) {
                    const m1 = (parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0);
                    const m2 = (parseInt(sub.pairMcq) || 0) + (parseInt(sub.pairCq) || 0) + (parseInt(sub.pairPr) || 0);
                    const combTotal = m1 + m2;
                    const fullTotal = sub.fullMarks * 2;
                    const res = calculateGradeAndGP(combTotal, fullTotal);

                    grandTotal += combTotal;
                    totalFullMarks += fullTotal;
                    totalGP += res.gp;
                    subjectCount++;
                    if (res.gp === 0) hasFailed = true;

                    tableHtml += `<tr>
                        <td class="subject-col">${sub.name}</td>
                        <td>${sub.mcq !== '' ? toBnDigits(sub.mcq) : '—'}</td>
                        <td>${sub.cq !== '' ? toBnDigits(sub.cq) : '—'}</td>
                        <td>${sub.pr !== '' ? toBnDigits(sub.pr) : '—'}</td>
                        <td>${toBnDigits(m1)}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${toBnDigits(combTotal)}</td>
                        <td rowspan="2" style="font-weight: bold;">${res.grade}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${toBnDigits(res.gp.toFixed(2))}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${sub.pairWith}</td>
                        <td>${sub.pairMcq !== '' ? toBnDigits(sub.pairMcq) : '—'}</td>
                        <td>${sub.pairCq !== '' ? toBnDigits(sub.pairCq) : '—'}</td>
                        <td>${sub.pairPr !== '' ? toBnDigits(sub.pairPr) : '—'}</td>
                        <td>${toBnDigits(m2)}</td>
                    </tr>`;
                } else {
                    const tot = (parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0);
                    const res = calculateGradeAndGP(tot, sub.fullMarks);

                    grandTotal += tot;
                    totalFullMarks += sub.fullMarks;
                    totalGP += res.gp;
                    subjectCount++;
                    if (res.gp === 0) hasFailed = true;

                    const isPracCol = sub.pr !== '';
                    tableHtml += `<tr>
                        <td class="subject-col">${sub.name}</td>
                        <td>${sub.mcq !== '' ? toBnDigits(sub.mcq) : '—'}</td>
                        <td>${sub.cq !== '' ? toBnDigits(sub.cq) : '—'}</td>
                        <td class="${isPracCol ? 'bg-gray' : ''}">${sub.pr !== '' ? toBnDigits(sub.pr) : '—'}</td>
                        <td>${toBnDigits(tot)}</td>
                        <td style="font-weight: bold;">${toBnDigits(tot)}</td>
                        <td style="font-weight: bold;">${res.grade}</td>
                        <td style="font-weight: bold;">${toBnDigits(res.gp.toFixed(2))}</td>
                    </tr>`;
                }
            });

            const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
            const finalGpaStr = hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2));
            const finalGrade = hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))));
            const rankStr = toBnDigits(rankNum);

            return `
            <div class="mark-sheet-container" style="margin-bottom: 25px;">
                <div class="mark-sheet-border">
                    <!-- Header Section -->
                    <div class="header-section">
                        <table class="grading-scale">
                            <tr><th>Range</th><th>Grade</th><th>GPA</th></tr>
                            <tr><td>80-100</td><td>A+</td><td>5.00</td></tr>
                            <tr><td>70-79</td><td>A</td><td>4.00</td></tr>
                            <tr><td>60-69</td><td>A-</td><td>3.50</td></tr>
                            <tr><td>50-59</td><td>B</td><td>3.00</td></tr>
                            <tr><td>40-49</td><td>C</td><td>2.00</td></tr>
                            <tr><td>33-39</td><td>D</td><td>1.00</td></tr>
                        </table>

                        <div class="header-center">
                            <h1 class="school-name">${schoolName}</h1>
                            <p class="address">${addressText}</p>
                            <div class="logo">
                                <img src="${customLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;">
                            </div>
                            <div class="exam-badge">${exam}</div>
                        </div>
                    </div>

                    <!-- Student Info Section -->
                    <div class="student-info">
                        <div style="flex: 1.1;">
                            <div class="info-row">
                                <div class="info-label">শিক্ষার্থীর নাম</div>
                                <div>: <span>${studentName}</span></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">রোল নং</div>
                                <div>: <span>${toBnDigits(rollNo)}</span></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">শ্রেণি</div>
                                <div>: <span>${selectedClass}</span> <span class="branch-info" style="margin-left: 20px;">শাখা = ${selectedSection}</span></div>
                            </div>
                        </div>
                        <div style="flex: 0.9; padding-left: 20px;">
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">ধর্ম (Religion)</div>
                                <div>: <span>${relInfo.display}</span></div>
                            </div>
                            ${isSecondary ? `
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">ঐচ্ছিক বিষয় (৪র্থ)</div>
                                <div>: <span>${optInfo.nameBn}</span></div>
                            </div>` : ''}
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">শিক্ষার্থী আইডি</div>
                                <div>: <span>${toBnDigits(studentId)}</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Marks Table -->
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th class="subject-col">বিষয়</th>
                                <th>বহুনির্বাচনি</th>
                                <th>লিখিত</th>
                                <th>ব্যবহারিক</th>
                                <th>মোট</th>
                                <th>সর্বমোট</th>
                                <th>গ্রেড</th>
                                <th>পয়েন্ট</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableHtml}
                        </tbody>
                    </table>

                    <!-- Bottom Tables -->
                    <div class="bottom-section">
                        <table class="rank-table">
                            <tr>
                                <td style="width: 50%;">স্থান</td>
                                <td style="width: 50%;">${rankStr}</td>
                            </tr>
                        </table>

                        <table class="summary-table">
                            <tr>
                                <td style="width: 50%;">সর্বমোট</td>
                                <td style="width: 50%;">${toBnDigits(grandTotal)}</td>
                            </tr>
                            <tr>
                                <td>পয়েন্ট</td>
                                <td>${finalGpaStr}</td>
                            </tr>
                            <tr>
                                <td>গ্রেড</td>
                                <td>${finalGrade}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Signatures Section -->
                    <div class="signatures">
                        <div class="sig-col">
                            <div class="sig-line"></div>
                            <div class="sig-label">অভিভাবকের স্বাক্ষর</div>
                        </div>
                        <div class="sig-col">
                            <div class="sig-line"></div>
                            <div class="sig-label">প্রধান শিক্ষকের স্বাক্ষর</div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        function renderBatchMarksheets(selectedClass, selectedSection, exam) {
            const batchContainer = document.getElementById('batch-marksheets-container');
            const singleContainer = document.getElementById('single-marksheet-container');
            if (!batchContainer) return;

            const students = getAllStudentsForClassAndSection(selectedClass, selectedSection);

            let html = `
            <div class="batch-status-banner no-print">
                <div class="batch-info">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>শ্রেণি: <strong>${selectedClass}</strong> | শাখা: <strong>${selectedSection}</strong> | পরীক্ষা: <strong>${exam}</strong></span>
                    <span class="badge-count">মোট ${toBnDigits(students.length)} জন শিক্ষার্থী</span>
                </div>
                <div class="batch-actions">
                    <button type="button" class="btn-batch-action btn-batch-print" onclick="window.print()" title="সকল শিক্ষার্থীর মার্কশীট একসাথে প্রিন্ট করুন">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        <span>Print All</span>
                    </button>
                    <button type="button" class="btn-batch-action btn-batch-single" onclick="toggleCreateAll()" title="একক শিক্ষার্থী ভিউতে ফিরে যান">
                        <span>Single View</span>
                    </button>
                </div>
            </div>`;

            students.forEach((st, idx) => {
                html += generateMarksheetCardHTML(st, selectedClass, selectedSection, exam, idx + 1);
            });

            batchContainer.innerHTML = html;
            batchContainer.style.display = 'block';
            if (singleContainer) singleContainer.style.display = 'none';
        }

        function updateMarksheetExam(val) {
            localStorage.setItem('school_marksheet_exam', val);
            syncCascadingFilters('exam_changed');
        }

        function updateMarksheetClass(val) {
            localStorage.setItem('school_marksheet_class', val);
            syncCascadingFilters('class_changed');
        }

        function updateMarksheetSection(val) {
            localStorage.setItem('school_marksheet_section', val);
            syncCascadingFilters('section_changed');
        }

        function switchTemplate(val) {
            const extra = isCreateAllMode ? '?mode=all' : '';
            if (val === 'Temp-01') {
                window.location.href = 'Marksheet.html' + extra;
            } else if (val === 'Temp-02') {
                window.location.href = 'Marksheet1.html' + extra;
            }
        }

        // Dynamically sync School Header Information from main website settings
        function syncSchoolHeaderInfo() {
            try {
                let rawSettings = localStorage.getItem('school_settings');
                let settings = {};
                if (rawSettings) {
                    try { settings = JSON.parse(rawSettings); } catch(e) {}
                }
                const customLogo = localStorage.getItem('school_logo') || (settings && settings.schoolLogo);

                // Update School Name
                const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
                const nameEl = document.getElementById('display-school-name');
                if (nameEl && nameEl.innerText !== schoolName) {
                    nameEl.innerText = schoolName;
                }

                // Update School Address
                let addressText = settings.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
                const addrEl = document.getElementById('display-school-address');
                if (addrEl && addrEl.innerText !== addressText) {
                    addrEl.innerText = addressText;
                }

                // Update School Logo
                const logoImg = document.getElementById('school-logo-img');
                const logoFallback = document.getElementById('school-logo-fallback');
                if (logoImg) {
                    const targetLogo = customLogo || 'school_logo.svg';
                    if (logoImg.getAttribute('src') !== targetLogo) {
                        logoImg.src = targetLogo;
                    }
                    logoImg.style.display = 'block';
                    if (logoFallback) logoFallback.style.display = 'none';
                }
            } catch (e) {
                console.error("Error syncing school header from website settings:", e);
            }
        }

        // Continuous Live Sync of Filter Options from Exam Portal
        function syncFiltersFromExamPortal() {
            syncCascadingFilters('exam_sync');
        }

        // Initialize saved filters & header on load
        window.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('mode') === 'single') {
                isCreateAllMode = false;
            } else {
                isCreateAllMode = true;
            }
            const btn = document.getElementById('btn-create-all');
            const btnText = document.getElementById('create-all-btn-text');
            if (btn) {
                if (isCreateAllMode) {
                    btn.classList.add('active');
                    if (btnText) btnText.innerText = 'সকল শিক্ষার্থী (All)';
                } else {
                    btn.classList.remove('active');
                    if (btnText) btnText.innerText = 'একক শিক্ষার্থী (Single)';
                }
            }
            if (urlParams.get('exam')) localStorage.setItem('school_marksheet_exam', urlParams.get('exam'));
            if (urlParams.get('class')) localStorage.setItem('school_marksheet_class', urlParams.get('class'));
            if (urlParams.get('section')) localStorage.setItem('school_marksheet_section', urlParams.get('section'));

            syncSchoolHeaderInfo();
            syncCascadingFilters('all');
        });

        // Listen for live changes from Exam Portal & main website settings across tabs and database sync
        window.addEventListener('storage', function(e) {
            if (!e.key || e.key === 'school_settings' || e.key === 'school_logo') {
                syncSchoolHeaderInfo();
            }
            if (!e.key || e.key.startsWith('school_exam_') || e.key === 'school_classes' || e.key === 'school_sections' || e.key === 'school_groups' || e.key === 'school_students') {
                syncCascadingFilters('all');
            }
        });
        window.addEventListener('dbSynced', function() {
            syncSchoolHeaderInfo();
            syncCascadingFilters('all');
        });

        // Continuous heartbeat sync every 2.5 seconds
        setInterval(function() {
            syncSchoolHeaderInfo();
            syncCascadingFilters('exam_sync');
        }, 2500);
    

        // --- PAGINATION FOR EXAM LIST ---
        let currentSchedulePage = 1;
        let scheduleRowsPerPage = 20;
        let currentStatusFilter = 'All';

        function onScheduleFilterChange() {
            currentSchedulePage = 1;
            const filterExam = document.getElementById('filter-schedule-exam')?.value;
            if (filterExam && filterExam !== 'All') {
                localStorage.setItem('school_active_exam_filter', filterExam);
                try {
                    window.dispatchEvent(new CustomEvent('dbSynced'));
                } catch (e) { }
            }
            renderScheduleList();
        }

        function navigateToTabulationSheet() {
            const filterExam = document.getElementById('filter-schedule-exam')?.value;
            const filterClass = document.getElementById('filter-schedule-class')?.value;
            let url = 'Tabulation Sheet.html';
            const params = [];
            if (filterExam && filterExam !== 'All') {
                localStorage.setItem('school_active_exam_filter', filterExam);
                params.push(`exam=${encodeURIComponent(filterExam)}`);
            }
            if (filterClass && filterClass !== 'All') {
                params.push(`class=${encodeURIComponent(filterClass)}`);
            }
            if (params.length > 0) {
                url += '?' + params.join('&');
            }
            window.location.href = url;
        }

        function setStatusFilter(status) {
            currentStatusFilter = status;
            currentSchedulePage = 1;

            const config = {
                'All': { border: '#2563eb', text: '#334155', activeBg: '#2563eb', inActiveBg: '#f8fafc', dot: '#2563eb', glow: 'rgba(37,99,235,0.25)' },
                'all': { border: '#bbf7d0', text: '#16a34a', activeBg: '#16a34a', inActiveBg: '#f0fdf4', dot: '#16a34a', glow: 'rgba(22,163,74,0.25)' },
                'partial': { border: '#fde68a', text: '#d97706', activeBg: '#d97706', inActiveBg: '#fffbeb', dot: '#d97706', glow: 'rgba(217,119,6,0.25)' },
                'none': { border: '#fecaca', text: '#dc2626', activeBg: '#dc2626', inActiveBg: '#fef2f2', dot: '#dc2626', glow: 'rgba(220,38,38,0.25)' }
            };

            const pills = document.querySelectorAll('.status-pill');
            pills.forEach(pill => {
                const s = pill.getAttribute('data-status');
                const conf = config[s] || config['All'];
                const dot = pill.querySelector('span');

                if (s === status) {
                    pill.classList.add('active');
                    pill.style.background = conf.activeBg;
                    pill.style.color = '#ffffff';
                    pill.style.borderColor = conf.activeBg;
                    pill.style.boxShadow = `0 2px 8px ${conf.glow}`;
                    if (dot) dot.style.background = '#ffffff';
                } else {
                    pill.classList.remove('active');
                    pill.style.background = conf.inActiveBg;
                    pill.style.color = conf.text;
                    pill.style.borderColor = conf.border;
                    pill.style.boxShadow = 'none';
                    if (dot) dot.style.background = conf.dot;
                }
            });

            renderScheduleList();
        }

        // Returns 'all' | 'partial' | 'none' based on how many students have marks entered for a given exam schedule
        function getExamMarkStatus(sch) {
            const allStudents = loadStudents();
            const targetSections = sch.section && sch.section !== 'All'
                ? sch.section.split(',').map(s => s.trim().toUpperCase()) : [];

            const students = allStudents.filter(s => {
                if (!s.class) return false;
                const sClassClean = s.class.trim().toUpperCase();
                const schClassClean = sch.class.trim().toUpperCase();
                if (sClassClean !== schClassClean && !sClassClean.includes(schClassClean) && !schClassClean.includes(sClassClean)) return false;
                if (targetSections.length > 0 && s.section) {
                    return targetSections.includes(s.section.trim().toUpperCase());
                }
                return true;
            });

            if (students.length === 0) return 'none';

            const subMap = loadSubjects();
            const classSubjects = subMap[sch.class] || [];
            const subObj = classSubjects.find(s => s.name.trim().toLowerCase() === sch.subject.trim().toLowerCase());
            const subCode = subObj ? subObj.code : sch.subject;

            const savedMarks = loadStudentMarks();
            let enteredCount = 0;

            students.forEach(student => {
                const key = `marks_${student.id}_${sch.id}`;
                const marks = savedMarks[key] ? savedMarks[key][subCode] : null;
                if (marks !== null && marks !== undefined) enteredCount++;
            });

            if (enteredCount === 0) return 'none';
            if (enteredCount === students.length) return 'all';
            return 'partial';
        }

        function getExamTypeConfig(termName, examTypeName = '') {
            const types = loadExamTypes();
            const exam = (types || []).find(t => t.name && t.name.trim().toLowerCase() === (termName || '').trim().toLowerCase())
                || (types || []).find(t => t.type && t.type.trim().toLowerCase() === (termName || '').trim().toLowerCase())
                || (types && types.length > 0 ? types[0] : null);

            if (!exam) {
                return {
                    examId: null,
                    examName: termName || '',
                    subTypeId: null,
                    typeName: examTypeName || 'Main Exam',
                    defaultCQ: 70,
                    defaultMCQ: 30,
                    defaultPractical: 0,
                    passMarkPercent: 33,
                    overrides: []
                };
            }

            normalizeExamTypeObject(exam);
            const subTypes = exam.examTypes && Array.isArray(exam.examTypes) ? exam.examTypes : [];

            if (examTypeName && subTypes.length > 0) {
                const matched = subTypes.find(st => st.typeName && st.typeName.trim().toLowerCase() === examTypeName.trim().toLowerCase());
                if (matched) {
                    return {
                        examId: exam.id,
                        examName: exam.name,
                        subTypeId: matched.id,
                        typeName: matched.typeName,
                        defaultCQ: matched.defaultCQ !== undefined ? Number(matched.defaultCQ) : 70,
                        defaultMCQ: matched.defaultMCQ !== undefined ? Number(matched.defaultMCQ) : 30,
                        defaultPractical: matched.defaultPractical !== undefined ? Number(matched.defaultPractical) : 0,
                        passMarkPercent: matched.passMarkPercent !== undefined ? Number(matched.passMarkPercent) : 33,
                        overrides: Array.isArray(matched.overrides) ? matched.overrides : []
                    };
                }
            }

            if (subTypes.length > 0) {
                const primary = subTypes[0];
                return {
                    examId: exam.id,
                    examName: exam.name,
                    subTypeId: primary.id,
                    typeName: primary.typeName,
                    defaultCQ: primary.defaultCQ !== undefined ? Number(primary.defaultCQ) : (exam.defaultCQ !== undefined ? Number(exam.defaultCQ) : 70),
                    defaultMCQ: primary.defaultMCQ !== undefined ? Number(primary.defaultMCQ) : (exam.defaultMCQ !== undefined ? Number(exam.defaultMCQ) : 30),
                    defaultPractical: primary.defaultPractical !== undefined ? Number(primary.defaultPractical) : (exam.defaultPractical !== undefined ? Number(exam.defaultPractical) : 0),
                    passMarkPercent: primary.passMarkPercent !== undefined ? Number(primary.passMarkPercent) : (exam.passMarkPercent !== undefined ? Number(exam.passMarkPercent) : 33),
                    overrides: Array.isArray(primary.overrides) ? primary.overrides : (Array.isArray(exam.overrides) ? exam.overrides : [])
                };
            }

            return {
                examId: exam.id,
                examName: exam.name,
                subTypeId: null,
                typeName: exam.type || 'Main Exam',
                defaultCQ: exam.defaultCQ !== undefined ? Number(exam.defaultCQ) : 70,
                defaultMCQ: exam.defaultMCQ !== undefined ? Number(exam.defaultMCQ) : 30,
                defaultPractical: exam.defaultPractical !== undefined ? Number(exam.defaultPractical) : 0,
                passMarkPercent: exam.passMarkPercent !== undefined ? Number(exam.passMarkPercent) : 33,
                overrides: Array.isArray(exam.overrides) ? exam.overrides : []
            };
        }

        function findSubjectCodeInMap(subMap, className, subjectName) {
            if (!subMap || !subjectName) return '';
            const sNameClean = subjectName.trim().toLowerCase();
            
            // 1. Direct class match
            if (className && subMap[className]) {
                const found = subMap[className].find(s => s.name && s.name.trim().toLowerCase() === sNameClean);
                if (found && found.code) return found.code;
            }

            // 2. Scan all classes in map
            for (const clsKey of Object.keys(subMap)) {
                const list = subMap[clsKey] || [];
                const found = list.find(s => 
                    (s.name && s.name.trim().toLowerCase() === sNameClean) ||
                    (s.shortName && s.shortName.trim().toLowerCase() === sNameClean)
                );
                if (found && found.code) return found.code;
            }

            return '';
        }

        function getSubjectDistribution(subjectCode, examType, subjectName = '') {
            if (!examType) {
                return { cq: 100, mcq: 0, practical: 0 };
            }
            const overrides = examType.overrides || [];
            let override = null;
            if (subjectCode) {
                override = overrides.find(o => String(o.subjectCode).trim() === String(subjectCode).trim());
            }
            if (!override && subjectName) {
                const subClean = String(subjectName).trim().toLowerCase();
                override = overrides.find(o => {
                    if (!o.subjectName) return false;
                    const oClean = o.subjectName.trim().toLowerCase();
                    return oClean === subClean || subClean.includes(oClean) || oClean.includes(subClean);
                });
            }
            if (override) {
                return {
                    cq: override.cq !== undefined ? Number(override.cq) : 0,
                    mcq: override.mcq !== undefined ? Number(override.mcq) : 0,
                    practical: override.practical !== undefined ? Number(override.practical) : 0
                };
            }
            return {
                cq: examType.defaultCQ !== undefined ? Number(examType.defaultCQ) : 70,
                mcq: examType.defaultMCQ !== undefined ? Number(examType.defaultMCQ) : 30,
                practical: examType.defaultPractical !== undefined ? Number(examType.defaultPractical) : 0
            };
        }

        function getScheduleMarksText(className, term, subjectName, examTypeName = '') {
            const subMap = loadSubjects();
            const subCode = findSubjectCodeInMap(subMap, className, subjectName);

            const config = getExamTypeConfig(term, examTypeName);
            const dist = getSubjectDistribution(subCode, config, subjectName);

            let parts = [];
            if (dist.cq > 0) parts.push(`CQ: ${dist.cq}`);
            if (dist.mcq > 0) parts.push(`MCQ: ${dist.mcq}`);
            if (dist.practical > 0) parts.push(`Prac: ${dist.practical}`);
            if (parts.length === 0) {
                const total = dist.cq + dist.mcq + dist.practical;
                parts.push(`Total: ${total}`);
            }
            return parts.join(', ');
        }

        function getScheduleMarksBadgesHtml(className, term, subjectName, examTypeName = '', isDarkTheme = false) {
            const subMap = loadSubjects();
            const subCode = findSubjectCodeInMap(subMap, className, subjectName);

            const config = getExamTypeConfig(term, examTypeName);
            const dist = getSubjectDistribution(subCode, config, subjectName);

            if (isDarkTheme) {
                return `
                    <div style="font-size:0.82rem; margin-top:3px; display:inline-flex; flex-wrap:wrap; gap:4px; align-items:center;">
                        <span style="background:rgba(2,132,199,0.2); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); padding:1px 6px; border-radius:4px; font-weight:700;">CQ: ${dist.cq}</span>
                        <span style="background:rgba(217,119,6,0.2); color:#fbbf24; border:1px solid rgba(251,191,36,0.35); padding:1px 6px; border-radius:4px; font-weight:700;">MCQ: ${dist.mcq}</span>
                        ${dist.practical > 0 ? `<span style="background:rgba(147,51,234,0.2); color:#c084fc; border:1px solid rgba(192,132,252,0.35); padding:1px 6px; border-radius:4px; font-weight:700;">Prac: ${dist.practical}</span>` : ''}
                    </div>
                `;
            }

            return `
                <div style="font-size:0.85rem; margin-top:3px; display:inline-flex; flex-wrap:wrap; gap:4px; align-items:center;">
                    <span style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; padding:1px 7px; border-radius:4px; font-weight:700; font-size:0.8rem;">CQ: ${dist.cq}</span>
                    <span style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:1px 7px; border-radius:4px; font-weight:700; font-size:0.8rem;">MCQ: ${dist.mcq}</span>
                    ${dist.practical > 0 ? `<span style="background:#f3e8ff; color:#7e22ce; border:1px solid #e9d5ff; padding:1px 7px; border-radius:4px; font-weight:700; font-size:0.8rem;">Prac: ${dist.practical}</span>` : ''}
                </div>
            `;
        }

        function updateScheduleDistLivePreview() {
            const previewBox = document.getElementById('schedule-dist-live-preview');
            const previewText = document.getElementById('schedule-dist-preview-text');
            const previewBadges = document.getElementById('schedule-dist-preview-badges');
            if (!previewBox) return;

            const className = document.getElementById('schedule-class')?.value || '';
            const examName = document.getElementById('schedule-exam-name')?.value || '';
            const examType = document.getElementById('schedule-exam-type')?.value || '';
            const subject = document.getElementById('schedule-subject')?.value || '';

            if (!examName) {
                previewBox.style.display = 'none';
                return;
            }

            previewBox.style.display = 'flex';

            const subMap = loadSubjects();
            const subCode = findSubjectCodeInMap(subMap, className, subject);

            const config = getExamTypeConfig(examName, examType);
            const dist = getSubjectDistribution(subCode, config, subject);
            const total = dist.cq + dist.mcq + dist.practical;

            if (previewText) {
                previewText.innerText = `CQ: ${dist.cq} | MCQ: ${dist.mcq}${dist.practical > 0 ? ' | ব্যবঃ: ' + dist.practical : ''} (মোট: ${total})`;
            }

            if (previewBadges) {
                previewBadges.innerHTML = `
                    <span style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; padding:3px 9px; border-radius:12px; font-weight:700; font-size:0.84rem;">CQ: ${dist.cq}</span>
                    <span style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:3px 9px; border-radius:12px; font-weight:700; font-size:0.84rem;">MCQ: ${dist.mcq}</span>
                    ${dist.practical > 0 ? `<span style="background:#f3e8ff; color:#7e22ce; border:1px solid #e9d5ff; padding:3px 9px; border-radius:12px; font-weight:700; font-size:0.84rem;">ব্যবহারিক: ${dist.practical}</span>` : ''}
                    <span style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; padding:3px 9px; border-radius:12px; font-weight:700; font-size:0.84rem;">মোট: ${total}</span>
                `;
            }
        }

        function autoCalculateScheduleExamNo() {
            if (typeof updateScheduleDistLivePreview === 'function') {
                updateScheduleDistLivePreview();
            }
            const editId = document.getElementById('schedule-edit-id')?.value;
            if (editId) return;

            const classVal = document.getElementById('schedule-class')?.value;
            const examVal = document.getElementById('schedule-exam-name')?.value;
            const typeVal = document.getElementById('schedule-exam-type')?.value;
            const subjectVal = document.getElementById('schedule-subject')?.value;

            if (!classVal || !examVal || !subjectVal) {
                const slNoInput = document.getElementById('schedule-sl-no');
                if (slNoInput) slNoInput.value = "";
                return;
            }

            const schedules = loadSchedules();

            // Count existing schedules matching this Class, Subject, Exam Name and Type (if set)
            const count = schedules.filter(s =>
                s.class === classVal &&
                s.term === examVal &&
                (!typeVal || !s.examType || s.examType === typeVal) &&
                s.subject === subjectVal
            ).length;

            const slNoInput = document.getElementById('schedule-sl-no');
            if (slNoInput) slNoInput.value = count + 1;
        }

        // --- UTILITY JSON PARSE ---
        function safeJsonParse(key, defaultValue) {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            try {
                return JSON.parse(item);
            } catch (e) {
                return defaultValue;
            }
        }

        // --- CONSTANT DEFAULT DATA INITIALIZERS ---
        const DEFAULT_SCHEDULES = [];

        const getNewDefaultSubjects = () => {
            const list = [
                { code: "101", name: "Bangla Sahitya", shortName: "Bangla 1st" },
                { code: "102", name: "Bangla Bhashar Byakaran and Nirmiti", shortName: "Bangla 2nd" },
                { code: "103", name: "English For Today", shortName: "English 1st" },
                { code: "104", name: "English Grammar and Composition", shortName: "English 2nd" },
                { code: "105", name: "Mathematics", shortName: "Math" },
                { code: "106", name: "Information And Communication Technology", shortName: "ICT" },
                { code: "107", name: "Bangladesh And Global Studies", shortName: "BGS" },
                { code: "108", name: "Science", shortName: "Science" },
                { code: "109", name: "Agriculture Studies", shortName: "Agri Studies" },
                { code: "110", name: "Islamic Studies", shortName: "Islam" },
                { code: "111", name: "Hindu Religion Studies", shortName: "Hindu" }
            ];
            return {
                "Six": JSON.parse(JSON.stringify(list)),
                "Seven": JSON.parse(JSON.stringify(list)),
                "Eight": JSON.parse(JSON.stringify(list)),
                "Nine": JSON.parse(JSON.stringify(list)),
                "Ten": JSON.parse(JSON.stringify(list))
            };
        };
        const DEFAULT_SUBJECTS = getNewDefaultSubjects();

        const DEFAULT_GRADE_RULES = [
            { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
            { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
            { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
            { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
            { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
            { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
            { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
        ];

        // --- CORE DATABASE DATA GETTERS/SETTERS ---
        function loadClasses() {
            const defaultClasses = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            const parsed = safeJsonParse('school_classes', null);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter(c => c && typeof c === 'string' && c.trim() !== '');
            }
            return defaultClasses;
        }

        function getClassColor(className) {
            if (!className) return 'var(--neon-cyan)';
            const cleanName = className.toString().trim();
            const cleanLower = cleanName.toLowerCase();

            const classColorMap = {
                'six': '#0066ff',         // 100% Blue
                'class six': '#0066ff',
                'class 6': '#0066ff',
                'seven': '#00e676',       // Emerald Green
                'class seven': '#00e676',
                'class 7': '#00e676',
                'eight': '#ff9100',       // Amber Orange
                'class eight': '#ff9100',
                'class 8': '#ff9100',
                'nine': '#e040fb',        // Purple / Pink-Purple
                'class nine': '#e040fb',
                'class 9': '#e040fb',
                'ten': '#ff1744',         // Bright Red / Crimson
                'class ten': '#ff1744',
                'class 10': '#ff1744',
                'five': '#00e5ff',        // Cyan
                'class five': '#00e5ff',
                'class 5': '#00e5ff',
                'four': '#ffea00',        // Yellow
                'class four': '#ffea00',
                'class 4': '#ffea00',
                'three': '#ff4081',       // Pink
                'class three': '#ff4081',
                'class 3': '#ff4081',
                'two': '#7c4dff',         // Deep Purple
                'class two': '#7c4dff',
                'class 2': '#7c4dff',
                'one': '#1de9b6',         // Teal
                'class one': '#1de9b6',
                'class 1': '#1de9b6',
                'play': '#00b0ff',        // Sky Blue
                'nursery': '#ffab00'      // Gold
            };

            if (classColorMap[cleanLower]) {
                return classColorMap[cleanLower];
            }

            let hash = 0;
            for (let i = 0; i < cleanName.length; i++) {
                hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash) % 360;
            return `hsl(${hue}, 95%, 62%)`;
        }

        function loadSubjects() {
            let subjects = localStorage.getItem('school_subjects');
            let needToSave = false;
            let parsed = null;

            const defaultSubjects = getNewDefaultSubjects();

            if (subjects) {
                try {
                    parsed = JSON.parse(subjects);

                    const hasOldClass6 = parsed["Class 6"] !== undefined;
                    const hasSixSahitya = parsed["Six"] && parsed["Six"].some(s => s.name === "Bangla Sahitya");

                    if (hasOldClass6 || !hasSixSahitya) {
                        parsed = defaultSubjects;
                        needToSave = true;
                    } else {
                        // Check if any subject in any class is missing 'shortName', if so, add it.
                        let missingShortName = false;
                        Object.keys(parsed).forEach(cls => {
                            if (Array.isArray(parsed[cls])) {
                                parsed[cls].forEach(sub => {
                                    if (!sub.shortName) {
                                        missingShortName = true;
                                        // Try to match it with a default subject's shortName, otherwise use name
                                        const defaultSub = defaultSubjects["Six"].find(ds => ds.name === sub.name || ds.code === sub.code);
                                        sub.shortName = defaultSub ? defaultSub.shortName : sub.name;
                                    }
                                });
                            }
                        });
                        if (missingShortName) {
                            needToSave = true;
                        }
                    }
                } catch (e) {
                    parsed = defaultSubjects;
                    needToSave = true;
                }
            } else {
                parsed = defaultSubjects;
                needToSave = true;
            }

            const classes = loadClasses();

            // Clean up obsolete class keys from the subject database
            Object.keys(parsed).forEach(key => {
                if (!classes.includes(key)) {
                    delete parsed[key];
                    needToSave = true;
                }
            });

            // Also check if any classes returned by loadClasses() are missing from parsed
            classes.forEach(c => {
                if (!parsed[c]) {
                    const defaultList = defaultSubjects[c] || [];
                    parsed[c] = JSON.parse(JSON.stringify(defaultList));
                    needToSave = true;
                }
            });

            if (needToSave) {
                persistAcademicSubjectsSync(parsed);
            }
            return parsed;
        }

        function loadSchedules() {
            return safeJsonParse('school_exam_schedules', []);
        }

        function loadMarkingSystem() {
            let rules = localStorage.getItem('school_marking_system');
            if (!rules) {
                rules = JSON.stringify(DEFAULT_GRADE_RULES);
                localStorage.setItem('school_marking_system', rules);
            }
            try {
                return JSON.parse(rules);
            } catch (e) {
                return DEFAULT_GRADE_RULES;
            }
        }

        function normalizeExamTypeObject(t) {
            if (!t) return t;
            if (!t.examTypes || !Array.isArray(t.examTypes) || t.examTypes.length === 0) {
                t.examTypes = [
                    {
                        id: t.id ? `${t.id}_t1` : Date.now().toString(),
                        typeName: t.type || "Main Exam",
                        defaultCQ: t.defaultCQ !== undefined ? t.defaultCQ : 70,
                        defaultMCQ: t.defaultMCQ !== undefined ? t.defaultMCQ : 30,
                        defaultPractical: t.defaultPractical !== undefined ? t.defaultPractical : 0,
                        passMarkPercent: t.passMarkPercent !== undefined ? t.passMarkPercent : 33,
                        overrides: Array.isArray(t.overrides) ? [...t.overrides] : []
                    }
                ];
            }
            const primary = t.examTypes[0];
            if (primary) {
                t.type = primary.typeName;
                t.defaultCQ = primary.defaultCQ;
                t.defaultMCQ = primary.defaultMCQ;
                t.defaultPractical = primary.defaultPractical;
                t.passMarkPercent = primary.passMarkPercent;
                t.overrides = primary.overrides;
            }
            return t;
        }

        function loadExamTypes() {
            let stored = localStorage.getItem('school_exam_types');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.map(normalizeExamTypeObject);
                    }
                } catch (e) {
                    // Fallback
                }
            }
            const defaults = [
                {
                    id: "1",
                    name: "Half-Yearly Examination 2026",
                    type: "Half-Yearly Exam",
                    defaultCQ: 70,
                    defaultMCQ: 30,
                    defaultPractical: 0,
                    passMarkPercent: 33,
                    overrides: [
                        { subjectCode: "106", subjectName: "Information And Communication Technology", cq: 25, mcq: 25, practical: 25 },
                        { subjectCode: "103", subjectName: "English For Today", cq: 100, mcq: 0, practical: 0 },
                        { subjectCode: "104", subjectName: "English Grammar and Composition", cq: 100, mcq: 0, practical: 0 }
                    ],
                    examTypes: [
                        {
                            id: "1_t1",
                            typeName: "Half-Yearly Main Exam",
                            defaultCQ: 70,
                            defaultMCQ: 30,
                            defaultPractical: 0,
                            passMarkPercent: 33,
                            overrides: [
                                { subjectCode: "106", subjectName: "Information And Communication Technology", cq: 25, mcq: 25, practical: 25 },
                                { subjectCode: "103", subjectName: "English For Today", cq: 100, mcq: 0, practical: 0 },
                                { subjectCode: "104", subjectName: "English Grammar and Composition", cq: 100, mcq: 0, practical: 0 }
                            ]
                        },
                        {
                            id: "1_t2",
                            typeName: "Continuous Assessment (CA)",
                            defaultCQ: 20,
                            defaultMCQ: 0,
                            defaultPractical: 0,
                            passMarkPercent: 33,
                            overrides: []
                        }
                    ]
                },
                {
                    id: "2",
                    name: "Annual Examination 2026",
                    type: "Annual Exam",
                    defaultCQ: 70,
                    defaultMCQ: 30,
                    defaultPractical: 0,
                    passMarkPercent: 33,
                    overrides: [
                        { subjectCode: "106", subjectName: "Information And Communication Technology", cq: 25, mcq: 25, practical: 25 },
                        { subjectCode: "103", subjectName: "English For Today", cq: 100, mcq: 0, practical: 0 },
                        { subjectCode: "104", subjectName: "English Grammar and Composition", cq: 100, mcq: 0, practical: 0 }
                    ],
                    examTypes: [
                        {
                            id: "2_t1",
                            typeName: "Annual Main Exam",
                            defaultCQ: 70,
                            defaultMCQ: 30,
                            defaultPractical: 0,
                            passMarkPercent: 33,
                            overrides: [
                                { subjectCode: "106", subjectName: "Information And Communication Technology", cq: 25, mcq: 25, practical: 25 },
                                { subjectCode: "103", subjectName: "English For Today", cq: 100, mcq: 0, practical: 0 },
                                { subjectCode: "104", subjectName: "English Grammar and Composition", cq: 100, mcq: 0, practical: 0 }
                            ]
                        }
                    ]
                },
                {
                    id: "3",
                    name: "First Term Exam 2026",
                    type: "Term Exam",
                    defaultCQ: 40,
                    defaultMCQ: 10,
                    defaultPractical: 0,
                    passMarkPercent: 33,
                    overrides: [],
                    examTypes: [
                        {
                            id: "3_t1",
                            typeName: "Term Exam",
                            defaultCQ: 40,
                            defaultMCQ: 10,
                            defaultPractical: 0,
                            passMarkPercent: 33,
                            overrides: []
                        }
                    ]
                }
            ];
            localStorage.setItem('school_exam_types', JSON.stringify(defaults));
            return defaults;
        }

        function loadStudents() {
            return safeJsonParse('school_students', []);
        }

        function loadStudentMarks() {
            return safeJsonParse('school_student_marks', {});
        }

        // --- POPULATE UTILITY DROPDOWNS ---
        function populateClassDropdown(selectId, includeAllOption = false) {
            const el = document.getElementById(selectId);
            if (!el) return;
            const currentVal = el.value;
            const classes = loadClasses();

            let html = "";
            if (includeAllOption) {
                html += `<option value="All">All Classes</option>`;
            }

            const { primary, high } = groupClassesByDepartment(classes);

            if (primary.length > 0) {
                html += `<optgroup label="Primary Level">`;
                html += primary.map(c => `<option value="${c}">${c}</option>`).join('');
                html += `</optgroup>`;
            }

            if (high.length > 0) {
                html += `<optgroup label="High Level">`;
                html += high.map(c => `<option value="${c}">${c}</option>`).join('');
                html += `</optgroup>`;
            }

            el.innerHTML = html;
            if (currentVal && (classes.includes(currentVal) || currentVal === 'All')) {
                el.value = currentVal;
            }
        }

        function populateAllScheduleFilters() {
            populateClassDropdown('filter-schedule-class', true);

            const schedules = loadSchedules();

            // Populate Exam Names
            const examEl = document.getElementById('filter-schedule-exam');
            if (examEl) {
                const currentVal = examEl.value || 'All';
                const exams = [...new Set(schedules.map(s => s.term).filter(Boolean))].sort();
                let html = `<option value="All">All Exams</option>`;
                html += exams.map(e => `<option value="${e}">${e}</option>`).join('');
                examEl.innerHTML = html;
                examEl.value = (currentVal === 'All' || exams.includes(currentVal)) ? currentVal : 'All';
            }

            // Populate Subjects
            const subEl = document.getElementById('filter-schedule-subject');
            if (subEl) {
                const currentVal = subEl.value || 'All';
                const subjects = [...new Set(schedules.map(s => s.subject).filter(Boolean))].sort();
                let html = `<option value="All">All Subjects</option>`;
                html += subjects.map(s => `<option value="${s}">${s}</option>`).join('');
                subEl.innerHTML = html;
                subEl.value = (currentVal === 'All' || subjects.includes(currentVal)) ? currentVal : 'All';
            }

            // Populate Teachers
            const teachEl = document.getElementById('filter-schedule-teacher');
            if (teachEl) {
                const currentVal = teachEl.value || 'All';
                const teachers = [...new Set(schedules.map(s => s.teacher).filter(Boolean))].sort();
                let html = `<option value="All">All Teachers</option>`;
                html += teachers.map(t => `<option value="${t}">${t}</option>`).join('');
                teachEl.innerHTML = html;
                teachEl.value = (currentVal === 'All' || teachers.includes(currentVal)) ? currentVal : 'All';
            }
        }

        // --- SUBVIEWS ROUTING MECHANISM ---
        function checkURLParameters() {
            const params = new URLSearchParams(window.location.search);
            let view = params.get('view') || 'exam-entry';
            if (view === 'exam-list') view = 'exam-entry';
            switchExamView(view);
        }

        function navigateExamView(viewName) {
            if (viewName === 'exam-list') viewName = 'exam-entry';
            window.history.pushState({ view: viewName }, '', '?view=' + viewName);
            switchExamView(viewName);
        }

        function switchExamView(viewName) {
            if (viewName === 'exam-list') viewName = 'exam-entry';
            if (typeof window.checkResourceAccessPermission === 'function') {
                const check = window.checkResourceAccessPermission('exam-portal.html?view=' + viewName);
                if (!check.allowed) {
                    const targetView = document.getElementById('subview-' + viewName) || document.querySelector('.portal-container');
                    if (targetView && typeof window.renderNotAccessPermissionsScreen === 'function') {
                        document.querySelectorAll('.portal-sub-view').forEach(v => v.classList.remove('active'));
                        document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
                        targetView.classList.add('active');
                        window.renderNotAccessPermissionsScreen(targetView, check);
                    }
                    return;
                }
            }

            // Hide all views
            document.querySelectorAll('.portal-sub-view').forEach(v => v.classList.remove('active'));
            document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));

            // Show active view
            const targetView = document.getElementById('subview-' + viewName);
            if (targetView) targetView.classList.add('active');

            const tabBtn = document.getElementById('btn-tab-' + viewName);
            if (tabBtn) tabBtn.classList.add('active');

            // Headings text adjustment
            const titleEl = document.getElementById('portal-title');
            const subtitleEl = document.getElementById('portal-subtitle');
            const titleWrapper = document.querySelector('.section-title-wrapper');

            if (titleWrapper) titleWrapper.style.display = 'none';

            if (viewName === 'dashboard') {
                titleEl.textContent = "Exam Portal";
                subtitleEl.textContent = "Check upcoming exam routines and play live quizzes to test your general knowledge";
                renderDashboardRoutineSummary();
            } else if (viewName === 'exam-entry') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                populateClassDropdown('schedule-class');
                populateAllScheduleFilters();
                populateTeachersDropdown();
                updateScheduleSubjectsDropdown();
                renderScheduleList();
            } else if (viewName === 'result-report') {
                titleEl.textContent = "Exam Portal - Result Report";
                subtitleEl.textContent = "Input class test scores and search/print student report cards";
                populateClassDropdown('search-result-class');
                populateClassDropdown('input-mark-class');
                updateSearchResultStudentDropdown();
                updateInputMarkStudentDropdown();
                generateSubjectMarkInputFields();
            } else if (viewName === 'marking-system') {
                titleEl.textContent = "Exam Portal - Marking System";
                subtitleEl.textContent = "Define and customize grade points and average GPA thresholds";
                renderMarkingSystem();
            } else if (viewName === 'all-subject') {
                titleEl.textContent = "Exam Portal - All Subject";
                subtitleEl.textContent = "Create and list curriculum subjects assigned to class levels";
                populateClassDropdown('subject-class');
                updateSubjectClassFilterDropdown();
                renderSubjectList();
            } else if (viewName === 'sms') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                populateClassDropdown('sms-target-class');
                updateSmsTargetStudentsDropdown();
                updateSmsLivePreview();
            } else if (viewName === 'exam-types') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                populateOverrideSubjectsDropdown();
                resetExamTypeForm();
                renderExamTypes();
            } else if (viewName === 'omr-reader') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                if (typeof initOmrReaderView === 'function') {
                    initOmrReaderView();
                }
            }
        }

        function loadTeachers() {
            const stored = localStorage.getItem('school_staff');
            if (!stored) return [];
            try {
                const staff = JSON.parse(stored);
                return staff.filter(s => s.category === "Teacher");
            } catch (e) {
                return [];
            }
        }

        function populateTeachersDropdown() {
            const el = document.getElementById('schedule-teacher');
            const bulkEl = document.getElementById('bulk-common-teacher');
            const teachers = loadTeachers();

            let html = '<option value="" disabled selected>-- Select Teacher --</option>';
            if (teachers.length === 0) {
                html = '<option value="" disabled selected>-- No Teachers in Staff Management --</option>';
            } else {
                html += teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
            }
            if (el) {
                const currentVal = el.value;
                el.innerHTML = html;
                if (currentVal && teachers.some(t => t.name === currentVal)) {
                    el.value = currentVal;
                }
            }
            if (bulkEl) {
                const currentVal = bulkEl.value;
                bulkEl.innerHTML = '<option value="">-- Choose Common Teacher --</option>' + (teachers.length > 0 ? teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('') : '');
                if (currentVal && teachers.some(t => t.name === currentVal)) {
                    bulkEl.value = currentVal;
                }
            }
        }

        function getFormattedCurrentDate() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            return `${dd}/${mm}/${yyyy}`;
        }

        function toggleCreateScheduleForm() {
            const formCard = document.getElementById('create-schedule-card');
            const listCard = document.getElementById('exam-schedules-list-card');
            const btn = document.getElementById('toggle-schedule-form-btn');
            const icon = btn.querySelector('svg');

            if (formCard.style.display === 'none') {
                formCard.style.display = 'block';
                if (listCard) listCard.style.display = 'none';
                btn.querySelector('span').textContent = 'View Exam List';
                icon.style.transform = 'rotate(45deg)';

                populateClassDropdown('schedule-class');
                populateTeachersDropdown();
                populateExamDropdowns();
                populateScheduleExamTypesDropdown();
                updateScheduleClassDependencies();

                // Pre-fill current date in DD/MM/YYYY format
                const todayStr = getFormattedCurrentDate();
                const dateEl = document.getElementById('schedule-date');
                if (dateEl && !dateEl.value) dateEl.value = todayStr;
                const bulkBaseDateEl = document.getElementById('bulk-base-date');
                if (bulkBaseDateEl && !bulkBaseDateEl.value) bulkBaseDateEl.value = todayStr;

                const modeSwitcher = document.getElementById('schedule-mode-switcher');
                if (modeSwitcher) modeSwitcher.style.display = 'inline-flex';
            } else {
                formCard.style.display = 'none';
                if (listCard) listCard.style.display = 'block';
                btn.querySelector('span').textContent = 'Create Exam Schedule';
                icon.style.transform = 'rotate(0deg)';
            }
        }

        function setScheduleCreationMode(mode) {
            const hiddenMode = document.getElementById('schedule-creation-mode');
            if (hiddenMode) hiddenMode.value = mode;

            const btnSingle = document.getElementById('btn-schedule-mode-single');
            const btnBulk = document.getElementById('btn-schedule-mode-bulk');
            const singleContainer = document.getElementById('single-subject-mode-container');
            const bulkContainer = document.getElementById('bulk-subjects-mode-container');

            if (mode === 'single') {
                if (btnSingle) {
                    btnSingle.style.background = '#2563eb';
                    btnSingle.style.color = '#ffffff';
                    btnSingle.style.boxShadow = '0 2px 8px rgba(37,99,235,0.25)';
                }
                if (btnBulk) {
                    btnBulk.style.background = 'transparent';
                    btnBulk.style.color = '#475569';
                    btnBulk.style.boxShadow = 'none';
                }
                if (singleContainer) singleContainer.style.display = 'block';
                if (bulkContainer) bulkContainer.style.display = 'none';
                updateScheduleSubjectsDropdown();
                updateScheduleDistLivePreview();
            } else {
                if (btnBulk) {
                    btnBulk.style.background = '#059669';
                    btnBulk.style.color = '#ffffff';
                    btnBulk.style.boxShadow = '0 2px 8px rgba(5,150,105,0.25)';
                }
                if (btnSingle) {
                    btnSingle.style.background = 'transparent';
                    btnSingle.style.color = '#475569';
                    btnSingle.style.boxShadow = 'none';
                }
                if (singleContainer) singleContainer.style.display = 'none';
                if (bulkContainer) bulkContainer.style.display = 'block';
                renderBulkSubjectsTable();
            }
        }

        function renderBulkSubjectsTable() {
            const tbody = document.getElementById('bulk-subjects-table-tbody');
            if (!tbody) return;

            const classVal = document.getElementById('schedule-class')?.value;
            const examVal = document.getElementById('schedule-exam-name')?.value || '';
            const examTypeVal = document.getElementById('schedule-exam-type')?.value || '';
            const baseDate = document.getElementById('bulk-base-date')?.value || document.getElementById('schedule-date')?.value || getFormattedCurrentDate();
            const commonTeacher = document.getElementById('bulk-common-teacher')?.value || '';

            if (!classVal) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748b;">অনুগ্রহ করে প্রথমে একটি ক্লাস সিলেক্ট করুন।</td></tr>';
                updateBulkSelectedCount();
                return;
            }

            const subMap = loadSubjects();
            const subjects = subMap[classVal] || [];
            const teachers = loadTeachers();
            const config = getExamTypeConfig(examVal, examTypeVal);

            if (subjects.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#dc2626; font-weight:600;">⚠️ এই ক্লাসের জন্য কোনো বিষয় তৈরি করা হয়নি। "All Subject" ট্যাব থেকে বিষয় যুক্ত করুন।</td></tr>';
                updateBulkSelectedCount();
                return;
            }

            let teacherOptionsHtml = '<option value="">-- No Teacher Assigned --</option>';
            if (teachers.length > 0) {
                teacherOptionsHtml += teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
            }

            const schedules = loadSchedules();

            let html = '';
            subjects.forEach((s, idx) => {
                const bn = getSubjectNameBangla(s);
                const displayName = (bn && bn !== s.name) ? `${s.name} - ${bn}` : s.name;
                const subCode = s.code || '';
                const dist = getSubjectDistribution(subCode, config, s.name);
                const distTotal = dist.cq + dist.mcq + dist.practical;

                // Auto calculate exam no for this subject
                const existingCount = schedules.filter(sch =>
                    sch.class === classVal &&
                    sch.term === examVal &&
                    (!examTypeVal || !sch.examType || sch.examType === examTypeVal) &&
                    sch.subject === s.name
                ).length;
                const calculatedExamNo = existingCount + 1;

                html += `
                    <tr style="transition:all 0.15s ease;" class="bulk-subject-row" data-subname="${s.name}" data-subcode="${subCode}">
                        <td style="text-align:center; vertical-align:middle;">
                            <input type="checkbox" name="bulk-sub-check" checked data-subname="${s.name}" data-subcode="${subCode}"
                                onchange="onBulkSubjectRowToggle(this)" style="cursor:pointer; accent-color:#2563eb; width:17px; height:17px;">
                        </td>
                        <td style="text-align:center; font-weight:700; color:#64748b; vertical-align:middle;">${idx + 1}</td>
                        <td style="vertical-align:middle; padding-left:12px;">
                            <div style="font-weight:700; color:#0f172a; font-size:0.96rem;">${displayName}</div>
                            <div style="font-size:0.8rem; color:#64748b;">Code: <strong style="color:#2563eb;">${subCode || 'N/A'}</strong></div>
                        </td>
                        <td style="vertical-align:middle; padding-left:12px;">
                            <input type="text" class="form-control bulk-row-date" value="${baseDate}" placeholder="dd/mm/yyyy"
                                style="background:#ffffff; color:#0f172a; border:1.5px solid #cbd5e1; font-weight:600; font-size:0.9rem; padding:6px 10px; border-radius:6px; width:100%;">
                        </td>
                        <td style="vertical-align:middle; padding-left:12px;">
                            <select class="form-control bulk-row-teacher"
                                style="background:#ffffff; color:#0f172a; border:1.5px solid #cbd5e1; font-weight:600; font-size:0.9rem; padding:6px 10px; border-radius:6px; width:100%;">
                                ${teacherOptionsHtml}
                            </select>
                        </td>
                        <td style="text-align:center; vertical-align:middle;">
                            <input type="text" class="form-control bulk-row-slno" value="${calculatedExamNo}"
                                style="background:#ffffff; color:#0f172a; border:1.5px solid #cbd5e1; font-weight:700; font-size:0.9rem; padding:6px 6px; border-radius:6px; text-align:center; width:60px; margin:0 auto;">
                        </td>
                        <td style="text-align:center; vertical-align:middle;">
                            <span style="background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-weight:700; font-size:0.8rem; padding:3px 8px; border-radius:12px; white-space:nowrap;" title="CQ: ${dist.cq}, MCQ: ${dist.mcq}${dist.practical ? ', Prac: ' + dist.practical : ''}">
                                ${distTotal} Marks
                            </span>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;

            if (commonTeacher) {
                tbody.querySelectorAll('.bulk-row-teacher').forEach(sel => {
                    sel.value = commonTeacher;
                });
            }

            updateBulkSelectedCount();
        }

        function toggleAllBulkSubjects(checked) {
            const selectAllCb = document.getElementById('bulk-select-all-checkbox');
            if (selectAllCb) selectAllCb.checked = checked;
            const checkboxes = document.querySelectorAll('input[name="bulk-sub-check"]');
            checkboxes.forEach(cb => {
                cb.checked = checked;
                const row = cb.closest('tr');
                if (row) {
                    row.style.opacity = checked ? '1' : '0.5';
                    row.style.background = checked ? '#ffffff' : '#f8fafc';
                }
            });
            updateBulkSelectedCount();
        }

        function onBulkSubjectRowToggle(checkbox) {
            const row = checkbox.closest('tr');
            if (row) {
                row.style.opacity = checkbox.checked ? '1' : '0.5';
                row.style.background = checkbox.checked ? '#ffffff' : '#f8fafc';
            }
            updateBulkSelectedCount();
        }

        function updateBulkSelectedCount() {
            const total = document.querySelectorAll('input[name="bulk-sub-check"]').length;
            const checked = document.querySelectorAll('input[name="bulk-sub-check"]:checked').length;

            const badge = document.getElementById('bulk-selected-badge');
            if (badge) {
                badge.innerText = `(${checked} টি বিষয় নির্বাচিত / মোট ${total})`;
                if (checked === 0) {
                    badge.style.background = '#fee2e2';
                    badge.style.color = '#dc2626';
                    badge.style.borderColor = '#fca5a5';
                } else {
                    badge.style.background = '#dbeafe';
                    badge.style.color = '#1e40af';
                    badge.style.borderColor = '#bfdbfe';
                }
            }

            const btnText = document.getElementById('bulk-submit-btn-text');
            if (btnText) {
                btnText.innerText = `Save All Schedules (${checked} টি বিষয়ের শিডিউল সংরক্ষণ করুন)`;
            }

            const selectAllCb = document.getElementById('bulk-select-all-checkbox');
            if (selectAllCb) {
                selectAllCb.checked = (total > 0 && checked === total);
            }
        }

        function applyBulkDateToAllSelected(isSequential = false) {
            let baseDateStr = document.getElementById('bulk-base-date')?.value?.trim() ||
                              document.getElementById('schedule-date')?.value?.trim() ||
                              getFormattedCurrentDate();

            const rows = document.querySelectorAll('#bulk-subjects-table-tbody tr');
            let currentDate = parseDateString(baseDateStr);
            if (isNaN(currentDate.getTime())) {
                currentDate = new Date();
            }

            rows.forEach((row) => {
                const cb = row.querySelector('input[name="bulk-sub-check"]');
                const dateInput = row.querySelector('.bulk-row-date');
                if (cb && cb.checked && dateInput) {
                    const yyyy = currentDate.getFullYear();
                    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(currentDate.getDate()).padStart(2, '0');
                    dateInput.value = `${dd}/${mm}/${yyyy}`;

                    if (isSequential) {
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            });
        }

        function applyBulkTeacherToAllSelected() {
            const commonTeacher = document.getElementById('bulk-common-teacher')?.value;
            if (!commonTeacher) {
                alert("অনুগ্রহ করে প্রথমে ডিফল্ট শিক্ষক সিলেক্ট করুন!");
                return;
            }
            const rows = document.querySelectorAll('#bulk-subjects-table-tbody tr');
            rows.forEach((row) => {
                const cb = row.querySelector('input[name="bulk-sub-check"]');
                const teacherSelect = row.querySelector('.bulk-row-teacher');
                if (cb && cb.checked && teacherSelect) {
                    teacherSelect.value = commonTeacher;
                }
            });
        }

        function onScheduleExamNameChangedInBulk() {
            const mode = document.getElementById('schedule-creation-mode')?.value;
            if (mode === 'bulk') {
                renderBulkSubjectsTable();
            }
        }

        function onScheduleExamTypeChangedInBulk() {
            const mode = document.getElementById('schedule-creation-mode')?.value;
            if (mode === 'bulk') {
                renderBulkSubjectsTable();
            }
        }

        function saveBulkExamSchedules() {
            const className = document.getElementById('schedule-class')?.value;
            if (!className) {
                alert("অনুগ্রহ করে ক্লাস নির্বাচন করুন!");
                return;
            }

            const checkedBoxes = document.querySelectorAll('input[name="schedule-section-check"]:checked');
            if (checkedBoxes.length === 0) {
                alert("অনুগ্রহ করে কমপক্ষে একটি সেকশন সিলেক্ট করুন! (Please select at least one Section)");
                return;
            }
            const selectedSections = Array.from(checkedBoxes).map(cb => cb.value).join(', ');

            const termName = document.getElementById('schedule-exam-name')?.value;
            if (!termName) {
                alert("অনুগ্রহ করে পরীক্ষার নাম নির্বাচন করুন!");
                return;
            }

            const examType = document.getElementById('schedule-exam-type') ? document.getElementById('schedule-exam-type').value : '';

            const rows = document.querySelectorAll('#bulk-subjects-table-tbody tr');
            const newSchedules = [];
            let missingDateSubject = null;
            const now = Date.now();

            rows.forEach((row, idx) => {
                const cb = row.querySelector('input[name="bulk-sub-check"]');
                if (cb && cb.checked) {
                    const subName = cb.getAttribute('data-subname');
                    const dateInput = row.querySelector('.bulk-row-date');
                    const teacherSelect = row.querySelector('.bulk-row-teacher');
                    const slNoInput = row.querySelector('.bulk-row-slno');

                    const dateVal = dateInput ? dateInput.value.trim() : '';
                    const teacherVal = teacherSelect ? teacherSelect.value.trim() : '';
                    const slNoVal = slNoInput ? slNoInput.value.trim() : (newSchedules.length + 1).toString();

                    if (!dateVal) {
                        missingDateSubject = subName;
                        return;
                    }

                    newSchedules.push({
                        id: (now + idx).toString(),
                        createdAt: now + idx,
                        class: className,
                        section: selectedSections,
                        term: termName,
                        examType: examType,
                        subject: subName,
                        date: dateVal,
                        teacher: teacherVal,
                        slNo: slNoVal
                    });
                }
            });

            if (missingDateSubject) {
                alert(`"${missingDateSubject}" বিষয়ের জন্য পরীক্ষার তারিখ সঠিকভাবে দিন!`);
                return;
            }

            if (newSchedules.length === 0) {
                alert("অনুগ্রহ করে শিডিউল যুক্ত করার জন্য তালিকা থেকে কমপক্ষে একটি বিষয় সিলেক্ট করুন!");
                return;
            }

            let schedules = loadSchedules();
            schedules.push(...newSchedules);
            localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
            if (termName) {
                localStorage.setItem('school_active_exam_filter', termName);
            }
            try {
                window.dispatchEvent(new CustomEvent('dbSynced'));
            } catch (e) { }

            resetScheduleForm();
            populateAllScheduleFilters();
            renderScheduleList();
            renderDashboardRoutineSummary();
            toggleCreateScheduleForm();

            alert(`সফলভাবে ${className}-এর ${newSchedules.length} টি বিষয়ের পরীক্ষার শিডিউল যুক্ত হয়েছে!`);
        }

        function parseDateString(dateStr) {
            if (dateStr && dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    return new Date(year, month, day);
                }
            }
            return new Date(dateStr);
        }

        // --- SUBVIEW 0: DASHBOARD CONTROLLERS ---
        function renderDashboardRoutineSummary() {
            const container = document.getElementById('dashboard-routine-rows');
            const totalCountEl = document.getElementById('dashboard-total-exam-count');
            if (!container) return;
            const schedules = loadSchedules();

            if (totalCountEl) {
                totalCountEl.innerText = `(Total: ${schedules.length})`;
            }

            if (schedules.length === 0) {
                container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted-text); font-style:italic; padding:30px 10px;">No exam schedules created yet.</td></tr>`;
                return;
            }

            // Sort schedules by date
            const sorted = [...schedules].sort((a, b) => parseDateString(a.date) - parseDateString(b.date));

            let html = "";
            const savedMarks = loadStudentMarks();
            sorted.forEach((sch, index) => {
                const marksBadges = getScheduleMarksBadgesHtml(sch.class, sch.term, sch.subject, sch.examType, true);
                const serialNumber = index + 1;
                const clsColor = getClassColor(sch.class);
                const markStatus = getExamMarkStatus(sch);
                const rowClass = markStatus === 'all' ? 'exam-row-marks-all' : markStatus === 'partial' ? 'exam-row-marks-partial' : '';

                let subjectStatusHtml = '';
                if (markStatus === 'all') {
                    const entryTime = sch.marksEntryTime || (savedMarks ? savedMarks['timestamp_' + sch.id] : null) || (sch.date ? `${sch.date} 10:00 AM` : 'Completed');
                    subjectStatusHtml = `
                        <div style="font-size:0.79rem; color:#10b981; margin-top:3px; font-weight:normal; display:flex; align-items:center; gap:4px;" title="Date & Time of Marks Entry">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span>${entryTime}</span>
                        </div>`;
                } else {
                    subjectStatusHtml = `
                        <div style="font-size:0.79rem; color:#f59e0b; margin-top:3px; font-weight:500; display:flex; align-items:center; gap:4px;" title="Marks Entry Pending">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>Pending</span>
                        </div>`;
                }

                html += `
                    <tr ondblclick="openExamMarksEntryModal('${sch.id}')" class="${rowClass}" style="cursor: pointer;" title="Double-click to open Student Marks Entry window">
                        <td style="text-align:center; font-weight:700;">${serialNumber}</td>
                        <td style="font-weight:600; font-size:1.18rem; line-height:1.1; padding-left:14px;">
                            <div style="color:${clsColor};">${sch.class}</div>
                            <div style="font-size:0.83rem; color:var(--neon-pink); margin-top:2px; font-weight:normal;">${sch.section || 'All'}</div>
                        </td>
                        <td style="font-size:1.02rem; line-height:1.1; padding-left:14px;">
                            <div style="font-weight:700;" title="${sch.examType ? 'Exam Type: ' + sch.examType : ''}">${sch.term}</div>
                            ${marksBadges}
                        </td>
                        <td style="line-height:1.1; padding-left:14px;">
                            <div style="font-weight:700;">${sch.date}</div>
                            <div style="font-size:0.83rem; color:var(--muted-text); margin-top:2px; font-weight:normal;">Exam No: ${sch.slNo || '-'}</div>
                        </td>
                        <td style="color:#fff; font-weight:600; line-height:1.2; padding-left:14px;">
                            <div>${sch.subject}</div>
                            ${subjectStatusHtml}
                        </td>
                        <td style="white-space: nowrap; text-align:center;">
                            <div style="display:flex; gap:6px; justify-content:center;">
                                <button class="action-btn-sm" onclick="openExamMarksEntryModal('${sch.id}')" style="padding:6px 10px; background:linear-gradient(135deg, #10b981, #059669); box-shadow:0 2px 8px rgba(16,185,129,0.3); font-weight:600;" title="Entry Marks (or Double-click row)">
                                    Marks
                                </button>
                                <button class="action-btn-sm btn-view-card" onclick="viewExamSchedule('${sch.id}')" style="padding:6px 8px;" title="View Details">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:block;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                </button>
                                <button class="action-btn-sm btn-edit-card" onclick="editExamSchedule('${sch.id}')" style="padding:6px 8px; background:var(--accent-grad);" title="Edit Schedule">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:block;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                </button>
                                <button class="action-btn-sm btn-delete-student" onclick="deleteExamSchedule('${sch.id}')" style="padding:6px 8px; background:#ffffff; color:#333;" title="Delete Schedule">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:block;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            container.innerHTML = html;
        }

        // --- SUBVIEW 1: EXAM ENTRY CONTROLLERS ---
        function loadClassSections() {
            const defaultSections = [
                { class: "Class 6", section: "A", capacity: 50 },
                { class: "Class 6", section: "B", capacity: 50 },
                { class: "Class 7", section: "A", capacity: 50 },
                { class: "Class 7", section: "B", capacity: 50 },
                { class: "Class 8", section: "A", capacity: 45 },
                { class: "Class 8", section: "B", capacity: 45 },
                { class: "Class 9", section: "A", capacity: 45 },
                { class: "Class 9", section: "B", capacity: 45 },
                { class: "Class 9", section: "C", capacity: 45 },
                { class: "Class 10", section: "A", capacity: 40 },
                { class: "Class 10", section: "B", capacity: 40 }
            ];
            const parsed = safeJsonParse('school_class_sections', null);
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter(s => s && typeof s === 'object' && s.class && s.section);
                if (filtered.length > 0) {
                    return filtered;
                }
            }
            return defaultSections;
        }

        function populateScheduleSectionsDropdown() {
            const classVal = document.getElementById('schedule-class').value;
            const container = document.getElementById('schedule-sections-container');
            if (!container) return;

            const sections = loadClassSections();
            const classSections = sections.filter(s => s.class === classVal);

            if (classSections.length === 0) {
                container.innerHTML = '<span style="font-style:italic; color:#64748b; font-size:0.85rem;">No sections configured.</span>';
            } else {
                container.innerHTML = classSections.map(s => `
                    <label class="section-checkbox-badge" style="display:inline-flex; align-items:center; gap:6px; background:#f1f5f9; border:1.5px solid #cbd5e1; padding:4px 12px; border-radius:20px; cursor:pointer; font-weight:700; font-size:0.84rem; color:#334155; transition:all 0.2s ease;">
                        <input type="checkbox" name="schedule-section-check" value="${s.section}" style="accent-color:#2563eb; cursor:pointer;" onchange="toggleSectionBadgeStyle(this)">
                        ${s.section}
                    </label>
                `).join('');
            }
        }

        function toggleSectionBadgeStyle(checkbox) {
            const label = checkbox.parentElement;
            if (checkbox.checked) {
                label.style.background = '#2563eb';
                label.style.borderColor = '#2563eb';
                label.style.color = '#ffffff';
                label.style.boxShadow = '0 2px 8px rgba(37,99,235,0.25)';
            } else {
                label.style.background = '#f1f5f9';
                label.style.borderColor = '#cbd5e1';
                label.style.color = '#334155';
                label.style.boxShadow = 'none';
            }
        }

        function updateScheduleClassDependencies() {
            updateScheduleSubjectsDropdown();
            populateScheduleSectionsDropdown();
            autoCalculateScheduleExamNo();
            renderBulkSubjectsTable();
        }

        function updateScheduleSubjectsDropdown() {
            const classVal = document.getElementById('schedule-class')?.value;
            const el = document.getElementById('schedule-subject');
            if (!el || !classVal) return;

            const prevVal = el.value;

            const subMap = loadSubjects();
            const subjects = subMap[classVal] || [];

            if (subjects.length === 0) {
                el.innerHTML = `<option value="" disabled selected>-- No Subjects Created --</option>`;
            } else {
                el.innerHTML = subjects.map(s => {
                    const bn = getSubjectNameBangla(s);
                    const label = (bn && bn !== s.name) ? `${s.name} - ${bn} (${s.code})` : `${s.name} (${s.code})`;
                    return `<option value="${s.name}">${label}</option>`;
                }).join('');
            }

            if (prevVal && Array.from(el.options).some(o => o.value === prevVal)) {
                el.value = prevVal;
            }
        }

        function saveExamSchedule(event) {
            event.preventDefault();
            const editId = document.getElementById('schedule-edit-id').value;
            const className = document.getElementById('schedule-class').value;

            // Get all checked sections
            const checkedBoxes = document.querySelectorAll('input[name="schedule-section-check"]:checked');
            if (checkedBoxes.length === 0) {
                alert("Please select at least one Section!");
                return;
            }
            const selectedSections = Array.from(checkedBoxes).map(cb => cb.value).join(', ');

            const termName = document.getElementById('schedule-exam-name').value;
            const examType = document.getElementById('schedule-exam-type') ? document.getElementById('schedule-exam-type').value : '';
            const subject = document.getElementById('schedule-subject').value;
            const date = document.getElementById('schedule-date').value;
            const teacher = document.getElementById('schedule-teacher').value.trim();
            const slNo = document.getElementById('schedule-sl-no').value.trim();

            if (!subject) {
                alert("Please select a subject. If none exist, add subjects in the All Subject tab first!");
                return;
            }

            let schedules = loadSchedules();
            if (editId) {
                const idx = schedules.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    const existingCreatedAt = schedules[idx].createdAt || schedules[idx].id;
                    schedules[idx] = {
                        ...schedules[idx],
                        id: editId,
                        class: className,
                        section: selectedSections,
                        term: termName,
                        examType: examType,
                        subject: subject,
                        date: date,
                        teacher: teacher,
                        slNo: slNo,
                        createdAt: existingCreatedAt
                    };
                }
                alert("Exam Schedule Routine updated successfully!");
            } else {
                const now = Date.now();
                const newSchedule = {
                    id: now.toString(),
                    createdAt: now,
                    class: className,
                    section: selectedSections,
                    term: termName,
                    examType: examType,
                    subject: subject,
                    date: date,
                    teacher: teacher,
                    slNo: slNo
                };
                schedules.push(newSchedule);
                alert("Exam Schedule Routine added successfully!");
            }
            localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
            if (termName) {
                localStorage.setItem('school_active_exam_filter', termName);
            }
            try {
                window.dispatchEvent(new CustomEvent('dbSynced'));
            } catch (e) { }

            resetScheduleForm();
            populateAllScheduleFilters();
            renderScheduleList();
            renderDashboardRoutineSummary();
            toggleCreateScheduleForm();
        }

        function deleteExamSchedule(id) {
            if (!confirm("Are you sure you want to delete this schedule?")) return;
            const schedules = loadSchedules();
            const filtered = schedules.filter(s => s.id !== id);
            localStorage.setItem('school_exam_schedules', JSON.stringify(filtered));
            populateAllScheduleFilters();
            renderScheduleList();
            renderDashboardRoutineSummary();
        }

        function resetScheduleForm() {
            document.getElementById('exam-schedule-form').reset();
            document.getElementById('schedule-edit-id').value = "";
            document.querySelector('#create-schedule-card .portal-form-title').innerText = "Create Exam Schedule";
            document.querySelector('#exam-schedule-form button[type="submit"]').innerText = "Save Schedule";

            const modeSwitcher = document.getElementById('schedule-mode-switcher');
            if (modeSwitcher) modeSwitcher.style.display = 'inline-flex';

            // Clear checkbox styles
            document.querySelectorAll('input[name="schedule-section-check"]').forEach(cb => {
                cb.checked = false;
                toggleSectionBadgeStyle(cb);
            });
            setScheduleCreationMode('single');
            updateScheduleClassDependencies();
            populateScheduleExamTypesDropdown();
            updateScheduleDistLivePreview();
        }

        function editExamSchedule(id) {
            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === id);
            if (!sch) return;

            // Open the form
            const formCard = document.getElementById('create-schedule-card');
            const listCard = document.getElementById('exam-schedules-list-card');
            const btn = document.getElementById('toggle-schedule-form-btn');
            const icon = btn.querySelector('svg');

            formCard.style.display = 'block';
            if (listCard) listCard.style.display = 'none';
            btn.querySelector('span').textContent = 'View Exam List';
            icon.style.transform = 'rotate(45deg)';

            // Set edit ID
            document.getElementById('schedule-edit-id').value = sch.id;

            // Set single mode and hide switcher during edit
            setScheduleCreationMode('single');
            const modeSwitcher = document.getElementById('schedule-mode-switcher');
            if (modeSwitcher) modeSwitcher.style.display = 'none';

            // Pre-fill values
            populateClassDropdown('schedule-class');
            document.getElementById('schedule-class').value = sch.class;

            populateTeachersDropdown();
            document.getElementById('schedule-teacher').value = sch.teacher || '';

            // Update class dependencies first
            updateScheduleClassDependencies();

            // Set dynamic section checkboxes based on comma-separated values
            const sectionsList = sch.section ? sch.section.split(',').map(s => s.trim()) : [];
            document.querySelectorAll('input[name="schedule-section-check"]').forEach(cb => {
                cb.checked = sectionsList.includes(cb.value);
                toggleSectionBadgeStyle(cb); // update visual styling
            });

            document.getElementById('schedule-exam-name').value = sch.term;
            populateScheduleExamTypesDropdown(sch.examType || '');
            if (sch.examType && document.getElementById('schedule-exam-type')) {
                document.getElementById('schedule-exam-type').value = sch.examType;
            }
            document.getElementById('schedule-subject').value = sch.subject;
            document.getElementById('schedule-date').value = sch.date;
            document.getElementById('schedule-sl-no').value = sch.slNo || '';

            // Change titles & buttons to Update mode
            document.querySelector('#create-schedule-card .portal-form-title').innerText = "Update Exam Schedule";
            document.querySelector('#exam-schedule-form button[type="submit"]').innerText = "Update Schedule";
            updateScheduleDistLivePreview();
        }

        function viewExamSchedule(id) {
            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === id);
            if (!sch) return;

            const distText = getScheduleMarksText(sch.class, sch.term, sch.subject, sch.examType);

            const container = document.getElementById('schedule-view-details');
            container.innerHTML = `
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Class:</span>
                    <strong style="color:#1e40af; font-weight:700;">${sch.class}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Section(s):</span>
                    <strong style="color:#0f172a; font-weight:700;">${sch.section || 'All'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Exam Name:</span>
                    <strong style="color:#0f172a; font-weight:700;">${sch.term}</strong>
                </div>
                ${sch.examType ? `
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Exam Type:</span>
                    <strong style="color:#2563eb; font-weight:700;">${sch.examType}</strong>
                </div>` : ''}
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Distribution (নম্বর বণ্টন):</span>
                    <strong style="color:#0284c7; font-weight:700;">${distText || 'N/A'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Exam Date:</span>
                    <strong style="color:#0f172a; font-weight:700;">${sch.date}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Subject:</span>
                    <strong style="color:#059669; font-weight:700;">${sch.subject}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Teacher Name:</span>
                    <strong style="color:#0f172a; font-weight:700;">${sch.teacher || 'Not Assigned'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:10px 0; font-size:1.05rem;">
                    <span style="color:#64748b; font-weight:600;">Exam No:</span>
                    <strong style="color:#0f172a; font-weight:700;">${sch.slNo || '-'}</strong>
                </div>
            `;
            document.getElementById('schedule-view-modal').classList.add('active');
        }

        function closeScheduleViewModal() {
            document.getElementById('schedule-view-modal').classList.remove('active');
        }

        function renderScheduleList() {
            const container = document.getElementById('schedule-list-rows');
            if (!container) return;
            // Get all filter values
            const filterClass = document.getElementById('filter-schedule-class').value;
            const filterExam = document.getElementById('filter-schedule-exam').value;
            const filterDate = document.getElementById('filter-schedule-date').value.trim().toLowerCase();
            const filterSubject = document.getElementById('filter-schedule-subject').value;
            const filterTeacher = document.getElementById('filter-schedule-teacher').value;

            const schedules = loadSchedules();

            // Filter logic
            const filtered = schedules.filter(s => {
                if (filterClass !== 'All' && s.class !== filterClass) return false;
                if (filterExam !== 'All' && s.term !== filterExam) return false;
                if (filterDate && (!s.date || !s.date.toLowerCase().includes(filterDate))) return false;
                if (filterSubject !== 'All' && s.subject !== filterSubject) return false;
                if (filterTeacher !== 'All' && s.teacher !== filterTeacher) return false;

                // Status Filter
                if (currentStatusFilter !== 'All') {
                    const markStatus = getExamMarkStatus(s);
                    if (markStatus !== currentStatusFilter) return false;
                }
                return true;
            });

            // Update total exam counting
            const totalCountEl = document.getElementById('total-exam-count');
            if (totalCountEl) {
                totalCountEl.innerText = `(Total: ${filtered.length})`;
            }

            // Update Class Summary Info Cards dynamically based on active filter results
            const cardsContainer = document.getElementById('class-summary-cards-container');
            if (cardsContainer) {
                const classSummaryMap = {};
                filtered.forEach(sch => {
                    const cls = sch.class || 'Other';
                    if (!classSummaryMap[cls]) {
                        classSummaryMap[cls] = { total: 0, completed: 0, pending: 0 };
                    }
                    classSummaryMap[cls].total++;
                    const markStatus = getExamMarkStatus(sch);
                    if (markStatus === 'all') {
                        classSummaryMap[cls].completed++;
                    } else {
                        classSummaryMap[cls].pending++;
                    }
                });

                let cardsHtml = "";
                const allClasses = loadClasses();
                const activeClasses = allClasses.filter(c => classSummaryMap[c]);
                Object.keys(classSummaryMap).forEach(c => {
                    if (!activeClasses.includes(c)) {
                        activeClasses.push(c);
                    }
                });

                activeClasses.forEach(cls => {
                    const stats = classSummaryMap[cls];
                    const classColor = getClassColor(cls);
                    cardsHtml += `
                        <div style="
                            background: #ffffff;
                            border: 1.5px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 10px 18px;
                            display: flex;
                            flex-direction: column;
                            min-width: 160px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                            transition: all 0.2s ease;
                            cursor: pointer;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.07)'; this.style.borderColor='#cbd5e1';"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.03)'; this.style.borderColor='#e2e8f0';"
                        >
                            <!-- Header -->
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
                                <span style="font-weight: 800; color: ${classColor}; font-size: 1.16rem; font-family: 'Outfit', sans-serif;">
                                    ${cls}
                                </span>
                                <span style="
                                    font-weight: 800;
                                    color: #2563eb;
                                    background: #eff6ff;
                                    border: 1px solid #bfdbfe;
                                    padding: 3px 9px;
                                    border-radius: 6px;
                                    font-size: 0.92rem;
                                " title="মোট পরীক্ষা">
                                    ${stats.total}
                                </span>
                            </div>

                            <!-- Footer Stats -->
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; gap: 8px;">
                                <span style="color: #16a34a; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;" title="এন্ট্রি সম্পন্ন">
                                    <span style="display:inline-block; width:6px; height:6px; background:#16a34a; border-radius:50%;"></span>
                                    ${stats.completed}
                                </span>
                                <span style="color: #dc2626; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;" title="এন্ট্রি পেন্ডিং">
                                    <span style="display:inline-block; width:6px; height:6px; background:#dc2626; border-radius:50%;"></span>
                                    ${stats.pending}
                                </span>
                            </div>
                        </div>
                    `;
                });
                cardsContainer.innerHTML = cardsHtml;
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align:center; padding: 48px 20px; background: #ffffff;">
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
                                <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; color: #2563eb;">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </div>
                                <div style="font-size: 1.15rem; font-weight: 700; color: #1e293b;">কোনো পরীক্ষার শিডিউল পাওয়া যায়নি</div>
                                <div style="font-size: 0.96rem; color: #64748b; max-width: 340px;">নতুন পরীক্ষার শিডিউল যোগ করতে "Create Exam Schedule" বাটনে ক্লিক করুন।</div>
                            </div>
                        </td>
                    </tr>`;
                const paginationContainer = document.getElementById('schedule-pagination');
                if (paginationContainer) paginationContainer.innerHTML = '';
                return;
            }

            // Sort by latest created first (Newest first)
            const scheduleIndexMap = new Map();
            schedules.forEach((s, idx) => {
                if (s && s.id) scheduleIndexMap.set(s.id, idx);
            });

            filtered.sort((a, b) => {
                const getCreatedTime = (item) => {
                    if (!item) return 0;
                    if (item.createdAt) {
                        const t = typeof item.createdAt === 'number' ? item.createdAt : new Date(item.createdAt).getTime();
                        if (!isNaN(t) && t > 0) return t;
                    }
                    if (item.id) {
                        const num = parseFloat(item.id);
                        if (!isNaN(num) && num > 1000000000) {
                            return num < 10000000000 ? num * 1000 : num;
                        }
                        if (scheduleIndexMap.has(item.id)) {
                            return scheduleIndexMap.get(item.id);
                        }
                    }
                    return 0;
                };
                return getCreatedTime(b) - getCreatedTime(a);
            });

            // Pagination calculation
            const totalItems = filtered.length;
            const totalPages = Math.ceil(totalItems / scheduleRowsPerPage);
            if (currentSchedulePage > totalPages) {
                currentSchedulePage = Math.max(1, totalPages);
            }

            const startOffset = (currentSchedulePage - 1) * scheduleRowsPerPage;
            const endOffset = startOffset + scheduleRowsPerPage;
            const paginated = filtered.slice(startOffset, endOffset);

            let html = "";
            const savedMarks = loadStudentMarks();
            paginated.forEach((sch, index) => {
                const marksBadges = getScheduleMarksBadgesHtml(sch.class, sch.term, sch.subject, sch.examType, false);
                const serialNumber = startOffset + index + 1;
                const clsColor = getClassColor(sch.class);
                const markStatus = getExamMarkStatus(sch);
                const rowClass = markStatus === 'all' ? 'exam-row-marks-all' : markStatus === 'partial' ? 'exam-row-marks-partial' : '';

                let subjectStatusHtml = '';
                if (markStatus === 'all') {
                    const entryTime = sch.marksEntryTime || (savedMarks ? savedMarks['timestamp_' + sch.id] : null) || (sch.date ? `${sch.date} 10:00 AM` : 'Completed');
                    subjectStatusHtml = `
                        <div style="font-size:0.88rem; color:#16a34a; margin-top:3px; font-weight:600; display:flex; align-items:center; gap:4px;" title="Date & Time of Marks Entry">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span>${entryTime}</span>
                        </div>`;
                } else {
                    subjectStatusHtml = `
                        <div style="font-size:0.88rem; color:#d97706; margin-top:3px; font-weight:600; display:flex; align-items:center; gap:4px;" title="Marks Entry Pending">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>Pending</span>
                        </div>`;
                }

                html += `
                    <tr ondblclick="openExamMarksEntryModal('${sch.id}')" class="${rowClass}" style="cursor: pointer;" title="Double-click to open Student Marks Entry window">
                        <td style="text-align:center; font-weight:700; font-size:1.05rem; color:#64748b;">${serialNumber}</td>
                        <td style="line-height:1.2; padding-left:14px;">
                            <div style="font-weight:800; font-size:1.16rem; color:${clsColor};">${sch.class}</div>
                            <div style="display:inline-block; font-size:0.88rem; font-weight:700; color:#475569; background:#f1f5f9; border:1px solid #cbd5e1; padding:2px 9px; border-radius:10px; margin-top:3px;">
                                ${sch.section || 'All'}
                            </div>
                        </td>
                        <td style="line-height:1.2; padding-left:14px;">
                            <div style="font-weight:700; color:#0f172a; font-size:1.05rem;" title="${sch.examType ? 'Exam Type: ' + sch.examType : ''}">${sch.term}</div>
                            ${marksBadges}
                        </td>
                        <td style="line-height:1.2; padding-left:14px;">
                            <div style="font-weight:700; color:#0f172a; font-size:1.02rem;">${sch.date}</div>
                            <div style="font-size:0.9rem; color:#64748b; margin-top:2px;">Exam No: <strong style="color:#0f172a;">${sch.slNo || '-'}</strong></div>
                        </td>
                        <td style="line-height:1.2; padding-left:14px;">
                            <div style="color:#0f172a; font-weight:700; font-size:1.05rem;">${sch.subject}</div>
                            ${subjectStatusHtml}
                        </td>
                        <td style="white-space: nowrap; text-align:center;">
                            <div style="display:flex; gap:6px; justify-content:center; align-items:center;">
                                <button class="action-btn-sm" onclick="openExamMarksEntryModal('${sch.id}')"
                                    style="padding:7px 14px; background:linear-gradient(135deg, #10b981, #059669); color:#ffffff; border:none; border-radius:6px; font-weight:700; font-size:0.92rem; cursor:pointer; box-shadow:0 2px 6px rgba(16,185,129,0.25);"
                                    title="Entry Marks (or Double-click row)">
                                    Marks
                                </button>
                                <button class="action-btn-sm btn-view-card" onclick="viewExamSchedule('${sch.id}')"
                                    style="padding:7px 9px; background:#f8fafc; border:1.5px solid #cbd5e1; color:#0284c7; border-radius:6px; cursor:pointer;"
                                    title="View Details">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display:block;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                </button>
                                <button class="action-btn-sm btn-edit-card" onclick="editExamSchedule('${sch.id}')"
                                    style="padding:7px 9px; background:#eff6ff; border:1.5px solid #bfdbfe; color:#2563eb; border-radius:6px; cursor:pointer;"
                                    title="Edit Schedule">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display:block;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                </button>
                                <button class="action-btn-sm btn-delete-student" onclick="deleteExamSchedule('${sch.id}')"
                                    style="padding:7px 9px; background:#fef2f2; border:1.5px solid #fecaca; color:#dc2626; border-radius:6px; cursor:pointer;"
                                    title="Delete Schedule">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display:block;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            container.innerHTML = html;

            // Render pagination controls
            renderSchedulePagination(totalPages);

            // Keep Dashboard Upcoming Exam Summary in continuous sync
            if (typeof renderDashboardRoutineSummary === 'function') {
                renderDashboardRoutineSummary();
            }
        }

        function renderSchedulePagination(totalPages) {
            const paginationContainer = document.getElementById('schedule-pagination');
            if (!paginationContainer) return;

            const displayPages = Math.max(1, totalPages);

            let html = `
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 10px;">
                    <span style="color: #475569; font-size: 0.98rem; font-weight: 700;">Page ${currentSchedulePage} of ${displayPages}</span>
                    <div style="display: flex; gap: 6px;">
                        <button class="pagination-btn" onclick="goToSchedulePage(1)" ${currentSchedulePage === 1 ? 'disabled' : ''} title="First Page"
                            style="background: #ffffff; border: 1.5px solid #cbd5e1; color: #1e293b; border-radius: 8px; padding: 7px 14px; font-weight: 700; font-size: 0.95rem; cursor: pointer;">⏮</button>
                        <button class="pagination-btn" onclick="changeSchedulePage(-1)" ${currentSchedulePage === 1 ? 'disabled' : ''} title="Previous Page"
                            style="background: #ffffff; border: 1.5px solid #cbd5e1; color: #1e293b; border-radius: 8px; padding: 7px 14px; font-weight: 700; font-size: 0.95rem; cursor: pointer;">◀</button>
                        <button class="pagination-btn" onclick="changeSchedulePage(1)" ${currentSchedulePage === displayPages ? 'disabled' : ''} title="Next Page"
                            style="background: #ffffff; border: 1.5px solid #cbd5e1; color: #1e293b; border-radius: 8px; padding: 7px 14px; font-weight: 700; font-size: 0.95rem; cursor: pointer;">▶</button>
                        <button class="pagination-btn" onclick="goToSchedulePage(${displayPages})" ${currentSchedulePage === displayPages ? 'disabled' : ''} title="Last Page"
                            style="background: #ffffff; border: 1.5px solid #cbd5e1; color: #1e293b; border-radius: 8px; padding: 7px 14px; font-weight: 700; font-size: 0.95rem; cursor: pointer;">⏭</button>
                    </div>
                </div>
            `;
            paginationContainer.innerHTML = html;
        }

        function changeScheduleRowsPerPage(value) {
            scheduleRowsPerPage = parseInt(value, 10);
            currentSchedulePage = 1;
            renderScheduleList();
        }

        function goToSchedulePage(page) {
            currentSchedulePage = page;
            renderScheduleList();
        }

        function changeSchedulePage(offset) {
            currentSchedulePage += offset;
            renderScheduleList();
        }

        // --- DYNAMIC EXAM MARKS ENTRY MODAL & MARKSHEET CONTROLLERS ---
        let activeExamScheduleId = null;
        let activeExamSubjectCode = null;
        let activeExamDist = { cq: 0, mcq: 0, practical: 0, total: 100 };
        let activeExamStudents = [];

        function showExamToast(msg, isSuccess = true) {
            const existing = document.querySelector('.marks-toast-notification');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = 'marks-toast-notification';
            toast.style.background = isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)';
            toast.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    ${isSuccess ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
                </svg>
                <span>${msg}</span>
            `;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.4s ease';
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }

        function openExamMarksEntryModal(scheduleId) {
            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === scheduleId);
            if (!sch) {
                alert("Exam Schedule not found!");
                return;
            }

            activeExamScheduleId = scheduleId;

            // Find matching subject code
            const subMap = loadSubjects();
            const classSubjects = subMap[sch.class] || [];
            const subObj = classSubjects.find(s => s.name.trim().toLowerCase() === sch.subject.trim().toLowerCase());
            const subCode = subObj ? subObj.code : sch.subject;
            activeExamSubjectCode = subCode;

            // Get Exam Type distribution dynamically according to sch.term and sch.examType
            const examTypeConfig = getExamTypeConfig(sch.term, sch.examType);
            const dist = getSubjectDistribution(subCode, examTypeConfig, sch.subject);
            const subjectTotal = dist.cq + dist.mcq + dist.practical;
            activeExamDist = { ...dist, total: subjectTotal, passPercent: examTypeConfig.passMarkPercent !== undefined ? examTypeConfig.passMarkPercent : 33 };

            // Update modal header badges & text
            document.getElementById('modal-exam-class-badge').innerText = sch.class;
            document.getElementById('modal-exam-section-badge').innerText = `Sec: ${sch.section || 'All'}`;
            document.getElementById('modal-exam-subject-code').innerText = `Code: ${subCode}`;
            document.getElementById('modal-exam-title-text').innerText = `${sch.subject} - ${sch.term}${sch.examType ? ' (' + sch.examType + ')' : ''}`;

            let distParts = [];
            if (dist.cq > 0) distParts.push(`CQ: ${dist.cq}`);
            if (dist.mcq > 0) distParts.push(`MCQ: ${dist.mcq}`);
            if (dist.practical > 0) distParts.push(`Prac: ${dist.practical}`);
            const distStr = distParts.join(', ') || `Total: ${subjectTotal}`;

            document.getElementById('modal-exam-meta-info').innerText = `Date: ${sch.date} | Exam No: ${sch.slNo || '-'} | Type: ${sch.examType || examTypeConfig.typeName || 'Main'} | Teacher: ${sch.teacher || 'N/A'} | Distribution: ${distStr} (Max: ${subjectTotal})`;

            // Configure table columns (show/hide CQ, MCQ, Practical columns depending on distribution)
            const thCq = document.getElementById('modal-th-cq');
            const thMcq = document.getElementById('modal-th-mcq');
            const thPrac = document.getElementById('modal-th-practical');

            if (thCq) thCq.innerText = dist.cq > 0 ? `CQ (${dist.cq})` : 'CQ';
            if (thMcq) thMcq.innerText = dist.mcq > 0 ? `MCQ (${dist.mcq})` : 'MCQ';
            if (thPrac) thPrac.innerText = dist.practical > 0 ? `Prac (${dist.practical})` : 'Prac';

            if (thCq) thCq.style.display = dist.cq > 0 ? '' : 'none';
            if (thMcq) thMcq.style.display = dist.mcq > 0 ? '' : 'none';
            if (thPrac) thPrac.style.display = dist.practical > 0 ? '' : 'none';

            // Restore last saved view type from localStorage (default: 'roll')
            const savedType = localStorage.getItem('school_exam_marks_entry_view_type') || 'roll';
            currentMarksEntryViewType = savedType;
            const typeFilterEl = document.getElementById('modal-marks-entry-type-filter');
            if (typeFilterEl) typeFilterEl.value = savedType;

            // Populate active students list for saved view type
            populateActiveExamStudents(savedType);

            // Reset search input
            const searchInput = document.getElementById('modal-student-search-input');
            if (searchInput) searchInput.value = "";

            // Render table rows
            renderExamMarksModalRows();

            // Open modal
            document.getElementById('exam-marks-entry-modal').classList.add('active');
        }

        let currentMarksEntryViewType = localStorage.getItem('school_exam_marks_entry_view_type') || 'roll';

        function populateActiveExamStudents(viewType = 'roll') {
            if (!activeExamScheduleId) return;
            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === activeExamScheduleId);
            if (!sch) return;

            const allStudents = loadStudents();
            const schClassClean = (sch.class || '').trim().toUpperCase();

            if (viewType === 'reg_no') {
                // Mode: "Reg No" -> Entire class students, sorted by Reg No
                activeExamStudents = allStudents.filter(s => {
                    if (!s.class) return false;
                    const sClassClean = s.class.trim().toUpperCase();
                    return sClassClean === schClassClean || sClassClean.includes(schClassClean) || schClassClean.includes(sClassClean);
                });

                // Sort by Registration No
                activeExamStudents.sort((a, b) => {
                    const rA = String(a.regNo || a.registrationNo || a.studentId || a.id || '').trim();
                    const rB = String(b.regNo || b.registrationNo || b.studentId || b.id || '').trim();
                    const numA = parseInt(rA, 10);
                    const numB = parseInt(rB, 10);
                    if (!isNaN(numA) && !isNaN(numB) && String(numA) === rA && String(numB) === rB) {
                        return numA - numB;
                    }
                    return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
                });

                // Update UI headers
                const secBadge = document.getElementById('modal-exam-section-badge');
                if (secBadge) secBadge.innerText = `Class: All Sections`;
                const thId = document.getElementById('modal-th-student-id');
                if (thId) thId.innerText = 'Reg No';
            } else {
                // Mode: "Student ID/Roll" -> Filter by schedule's Section(s) and sort by Section & Roll
                const targetSections = sch.section && sch.section !== 'All' ? sch.section.split(',').map(s => s.trim().toUpperCase()) : [];

                activeExamStudents = allStudents.filter(s => {
                    if (!s.class) return false;
                    const sClassClean = s.class.trim().toUpperCase();
                    if (sClassClean !== schClassClean && !sClassClean.includes(schClassClean) && !schClassClean.includes(sClassClean)) {
                        return false;
                    }
                    if (targetSections.length > 0 && s.section) {
                        return targetSections.includes(s.section.trim().toUpperCase());
                    }
                    return true;
                });

                // Sort by Section first, then Roll numerically
                activeExamStudents.sort((a, b) => {
                    const secA = (a.section || 'A').trim().toUpperCase();
                    const secB = (b.section || 'A').trim().toUpperCase();
                    if (secA !== secB) {
                        return secA.localeCompare(secB);
                    }
                    const rollA = parseFloat(a.roll) || 0;
                    const rollB = parseFloat(b.roll) || 0;
                    if (rollA !== rollB) {
                        return rollA - rollB;
                    }
                    return String(a.studentId || a.id || '').localeCompare(String(b.studentId || b.id || ''), undefined, { numeric: true });
                });

                // Update UI headers
                const secBadge = document.getElementById('modal-exam-section-badge');
                if (secBadge) secBadge.innerText = `Sec: ${sch.section || 'All'}`;
                const thId = document.getElementById('modal-th-student-id');
                if (thId) thId.innerText = 'Student ID/Roll';
            }
        }

        function autoSaveCurrentModalInputsToMemory() {
            if (!activeExamScheduleId || !activeExamSubjectCode) return;
            const savedMarks = loadStudentMarks();
            activeExamStudents.forEach(student => {
                const row = document.getElementById(`modal-row-student-${student.id}`);
                if (!row) return;
                const cqIn = row.querySelector('.modal-mark-cq');
                const mcqIn = row.querySelector('.modal-mark-mcq');
                const pracIn = row.querySelector('.modal-mark-prac');
                const absIn = row.querySelector('.modal-mark-absent');

                const rawCq = cqIn ? cqIn.value.trim() : "";
                const rawMcq = mcqIn ? mcqIn.value.trim() : "";
                const rawPrac = pracIn ? pracIn.value.trim() : "";

                const hasAType = rawCq.toUpperCase() === "A" || rawCq.toUpperCase() === "ABS" ||
                    rawMcq.toUpperCase() === "A" || rawMcq.toUpperCase() === "ABS" ||
                    rawPrac.toUpperCase() === "A" || rawPrac.toUpperCase() === "ABS";
                const isAbsent = (absIn && absIn.checked) || hasAType;

                if (!isAbsent && rawCq === "" && rawMcq === "" && rawPrac === "") return;

                const key = `marks_${student.id}_${activeExamScheduleId}`;
                savedMarks[key] = savedMarks[key] || {};
                if (isAbsent) {
                    savedMarks[key][activeExamSubjectCode] = {
                        total: 0,
                        isAbsent: true,
                        cq: rawCq ? rawCq.toUpperCase() : "A",
                        mcq: rawMcq ? rawMcq.toUpperCase() : "A",
                        practical: rawPrac ? rawPrac.toUpperCase() : "A"
                    };
                } else {
                    const nCq = parseInt(rawCq, 10) || 0;
                    const nMcq = parseInt(rawMcq, 10) || 0;
                    const nPrac = parseInt(rawPrac, 10) || 0;
                    savedMarks[key][activeExamSubjectCode] = {
                        total: nCq + nMcq + nPrac,
                        isAbsent: false,
                        cq: cqIn && rawCq !== "" ? nCq : undefined,
                        mcq: mcqIn && rawMcq !== "" ? nMcq : undefined,
                        practical: pracIn && rawPrac !== "" ? nPrac : undefined
                    };
                }
            });
            localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
        }

        function changeMarksEntryViewType(newType) {
            autoSaveCurrentModalInputsToMemory();
            currentMarksEntryViewType = newType;
            localStorage.setItem('school_exam_marks_entry_view_type', newType);
            populateActiveExamStudents(newType);
            renderExamMarksModalRows();
        }

        function closeExamMarksEntryModal() {
            document.getElementById('exam-marks-entry-modal').classList.remove('active');
            activeExamScheduleId = null;
        }

        function renderExamMarksModalRows() {
            const container = document.getElementById('modal-student-marks-rows');
            if (!container) return;

            if (activeExamStudents.length === 0) {
                container.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--muted-text); font-style:italic;">No students found for this class and section. Please add students in Student Management first.</td></tr>`;
                updateExamMarksModalLiveStats();
                return;
            }

            const savedMarks = loadStudentMarks();
            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === activeExamScheduleId);
            const examVal = sch ? sch.term : '';

            const searchKey = document.getElementById('modal-student-search-input').value.trim().toLowerCase();

            let html = "";
            let lastRenderedSection = null;

            activeExamStudents.forEach((student, idx) => {
                // Search filter check
                if (searchKey) {
                    const rStr = (student.roll || '').toString().toLowerCase();
                    const nStr = ((student.name || '') + ' ' + (student.nameBn || '')).toLowerCase();
                    const idStr = (student.studentId || student.id || '').toLowerCase();
                    const regStr = (student.regNo || student.registrationNo || '').toLowerCase();
                    if (!rStr.includes(searchKey) && !nStr.includes(searchKey) && !idStr.includes(searchKey) && !regStr.includes(searchKey)) {
                        return;
                    }
                }

                const currentSec = (student.section || 'A').trim();
                
                // Show Section Header Row above the first student of each section only in "Student ID/Roll" mode
                if (currentMarksEntryViewType === 'roll' && currentSec !== lastRenderedSection) {
                    lastRenderedSection = currentSec;
                    const secStudentsCount = activeExamStudents.filter(s => (s.section || 'A').trim() === currentSec).length;
                    
                    html += `
                        <tr class="modal-section-header-row" style="background:#f8fafc; border-top:2px solid #e2e8f0; border-bottom:1.5px solid #cbd5e1;">
                            <td colspan="9" style="padding:8px 16px; text-align:left; background:linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%);">
                                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                                    <div style="display:flex; align-items:center; gap:8px; font-weight:800; color:#1e40af; font-size:1.02rem;">
                                        <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; background:#2563eb; color:#ffffff; border-radius:50%; font-size:0.75rem;">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        </span>
                                        <span>শাখা (Section): <strong style="color:#2563eb; font-size:1.08rem; font-weight:800;">${currentSec}</strong></span>
                                    </div>
                                    <span style="font-size:0.83rem; font-weight:700; color:#475569; background:#ffffff; border:1px solid #cbd5e1; padding:2px 10px; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                                        মোট শিক্ষার্থী: ${secStudentsCount} জন
                                    </span>
                                </div>
                            </td>
                        </tr>
                    `;
                }

                const key = `marks_${student.id}_${activeExamScheduleId}`;
                const studentExamMarks = savedMarks[key] ? savedMarks[key][activeExamSubjectCode] : null;

                let isAbsent = false;
                let cqVal = "";
                let mcqVal = "";
                let pracVal = "";

                if (studentExamMarks !== null && studentExamMarks !== undefined) {
                    if (typeof studentExamMarks === 'object') {
                        isAbsent = studentExamMarks.isAbsent === true ||
                            String(studentExamMarks.cq).toUpperCase() === "A" || String(studentExamMarks.cq).toUpperCase() === "ABS" ||
                            String(studentExamMarks.mcq).toUpperCase() === "A" || String(studentExamMarks.mcq).toUpperCase() === "ABS";
                        cqVal = studentExamMarks.cq !== undefined ? studentExamMarks.cq : "";
                        mcqVal = studentExamMarks.mcq !== undefined ? studentExamMarks.mcq : "";
                        pracVal = studentExamMarks.practical !== undefined ? studentExamMarks.practical : "";
                    } else {
                        cqVal = studentExamMarks;
                        isAbsent = String(cqVal).toUpperCase() === "A" || String(cqVal).toUpperCase() === "ABS";
                    }
                }

                // Calculate initial total, grade, status
                const numCq = parseInt(cqVal, 10) || 0;
                const numMcq = parseInt(mcqVal, 10) || 0;
                const numPrac = parseInt(pracVal, 10) || 0;
                const hasEnteredAny = isAbsent || cqVal !== "" || mcqVal !== "" || pracVal !== "";
                const totalMark = isAbsent ? "A" : (hasEnteredAny ? (numCq + numMcq + numPrac) : "");

                const gradeInfo = hasEnteredAny ? (isAbsent ? { name: "F", gp: 0 } : getGradeDetails(totalMark, activeExamDist.total, activeExamDist.passPercent, { cq: cqVal, mcq: mcqVal, practical: pracVal }, activeExamDist)) : { name: "-", gp: 0 };
                const isPassed = !isAbsent && gradeInfo.gp > 0;

                // ID / Reg display text depending on current view type
                let idDisplay = "";
                if (currentMarksEntryViewType === 'reg_no') {
                    idDisplay = student.regNo || student.registrationNo || student.studentId || student.id || '-';
                } else {
                    idDisplay = student.studentId || (student.roll ? `Roll: ${student.roll}` : student.id) || '-';
                }

                html += `
                    <tr id="modal-row-student-${student.id}" style="border-bottom:1px solid #e2e8f0;">
                        <td style="text-align:center;"><span style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-weight:700; color:#0284c7;">${idx + 1}</span></td>
                        <td style="text-align:center; color:#334155; font-size:1.02rem; font-weight:700; font-family:monospace;">${idDisplay}</td>
                        <td style="text-align:left; color:#0f172a; font-weight:600;">
                            <div>${student.nameBn || student.name}</div>
                            ${currentMarksEntryViewType === 'reg_no' && student.roll ? `<div style="font-size:0.78rem; color:#64748b; font-weight:normal;">Roll: ${student.roll}</div>` : ''}
                        </td>
                        <td style="text-align:center; color:#e11d48; font-size:1.02rem; font-weight:700;">${student.section || 'A'}</td>
                        
                        <td style="text-align:center; ${activeExamDist.cq > 0 ? '' : 'display:none;'}">
                            <input type="text" class="student-mark-input-sm modal-mark-cq" data-studentid="${student.id}" value="${cqVal}" placeholder="" style="background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" oninput="onExamMarkInputChange(this, '${student.id}')" onkeydown="handleInputKeyNavigation(event, this, 'cq')">
                        </td>
                        <td style="text-align:center; ${activeExamDist.mcq > 0 ? '' : 'display:none;'}">
                            <input type="text" class="student-mark-input-sm modal-mark-mcq" data-studentid="${student.id}" value="${mcqVal}" placeholder="" style="background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" oninput="onExamMarkInputChange(this, '${student.id}')" onkeydown="handleInputKeyNavigation(event, this, 'mcq')">
                        </td>
                        <td style="text-align:center; ${activeExamDist.practical > 0 ? '' : 'display:none;'}">
                            <input type="text" class="student-mark-input-sm modal-mark-prac" data-studentid="${student.id}" value="${pracVal}" placeholder="" style="background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" oninput="onExamMarkInputChange(this, '${student.id}')" onkeydown="handleInputKeyNavigation(event, this, 'prac')">
                        </td>

                        <td style="text-align:center; color:#0f172a;" id="modal-cell-totalgrade-${student.id}">
                            ${isAbsent ? `<span class="badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; padding:2px 8px; font-weight:700;">Absent (F - 0.00)</span>` : (hasEnteredAny ? `<span style="font-weight:700; color:#0f172a; margin-right:6px;">${totalMark}</span> <span style="color:${isPassed ? '#059669' : '#dc2626'}; font-weight:bold;">${gradeInfo.name} (${gradeInfo.gp.toFixed(2)})</span>` : '-')}
                        </td>
                        <td style="text-align:center;" id="modal-cell-rank-${student.id}">${isAbsent ? '<span style="color:#dc2626; font-weight:700; font-size:1.075rem;">ABS</span>' : '-'}</td>
                    </tr>
                `;
            });

            container.innerHTML = html;
            updateExamMarksModalLiveStats();
        }

        function filterExamMarksModalStudents() {
            renderExamMarksModalRows();
        }

        function handleInputKeyNavigation(e, currentInput, fieldType) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                const inputs = Array.from(document.querySelectorAll(`.modal-mark-${fieldType}`));
                const currIdx = inputs.indexOf(currentInput);
                if (currIdx !== -1 && currIdx < inputs.length - 1) {
                    inputs[currIdx + 1].focus();
                    inputs[currIdx + 1].select();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const inputs = Array.from(document.querySelectorAll(`.modal-mark-${fieldType}`));
                const currIdx = inputs.indexOf(currentInput);
                if (currIdx > 0) {
                    inputs[currIdx - 1].focus();
                    inputs[currIdx - 1].select();
                }
            }
        }

        function onExamMarkInputChange(inputEl, studentId) {
            const row = document.getElementById(`modal-row-student-${studentId}`);
            if (!row) return;

            const absIn = row.querySelector('.modal-mark-absent');
            const cqIn = row.querySelector('.modal-mark-cq');
            const mcqIn = row.querySelector('.modal-mark-mcq');
            const pracIn = row.querySelector('.modal-mark-prac');

            const rawCq = cqIn ? cqIn.value.trim() : "";
            const rawMcq = mcqIn ? mcqIn.value.trim() : "";
            const rawPrac = pracIn ? pracIn.value.trim() : "";

            const hasAType = rawCq.toUpperCase() === "A" || rawCq.toUpperCase() === "ABS" || rawCq.toUpperCase() === "ABSENT" ||
                rawMcq.toUpperCase() === "A" || rawMcq.toUpperCase() === "ABS" || rawMcq.toUpperCase() === "ABSENT" ||
                rawPrac.toUpperCase() === "A" || rawPrac.toUpperCase() === "ABS" || rawPrac.toUpperCase() === "ABSENT";

            if (inputEl && inputEl.type === 'checkbox') {
                if (absIn.checked) {
                    if (cqIn && (!rawCq || rawCq === "")) cqIn.value = "A";
                }
            } else if (hasAType) {
                if (absIn) absIn.checked = true;
            }

            const isAbsent = (absIn && absIn.checked) || hasAType;

            const nCq = parseInt(rawCq, 10);
            const nMcq = parseInt(rawMcq, 10);
            const nPrac = parseInt(rawPrac, 10);

            // Validation styling
            if (cqIn) {
                if (rawCq !== "" && rawCq.toUpperCase() !== "A" && rawCq.toUpperCase() !== "ABS" && (isNaN(nCq) || nCq < 0 || nCq > activeExamDist.cq)) {
                    cqIn.style.borderColor = "#dc2626";
                } else {
                    cqIn.style.borderColor = "#cbd5e1";
                }
            }

            if (mcqIn) {
                if (rawMcq !== "" && rawMcq.toUpperCase() !== "A" && rawMcq.toUpperCase() !== "ABS" && (isNaN(nMcq) || nMcq < 0 || nMcq > activeExamDist.mcq)) {
                    mcqIn.style.borderColor = "#dc2626";
                } else {
                    mcqIn.style.borderColor = "#cbd5e1";
                }
            }

            if (pracIn) {
                if (rawPrac !== "" && rawPrac.toUpperCase() !== "A" && rawPrac.toUpperCase() !== "ABS" && (isNaN(nPrac) || nPrac < 0 || nPrac > activeExamDist.practical)) {
                    pracIn.style.borderColor = "#dc2626";
                } else {
                    pracIn.style.borderColor = "#cbd5e1";
                }
            }

            const hasEnteredAny = isAbsent || rawCq !== "" || rawMcq !== "" || rawPrac !== "";
            const totalMark = isAbsent ? "A" : (hasEnteredAny ? ((isNaN(nCq) ? 0 : nCq) + (isNaN(nMcq) ? 0 : nMcq) + (isNaN(nPrac) ? 0 : nPrac)) : "");

            const totalGradeCell = document.getElementById(`modal-cell-totalgrade-${studentId}`);

            if (isAbsent) {
                if (totalGradeCell) {
                    totalGradeCell.innerHTML = `<span class="badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; padding:2px 8px; font-weight:700;">Absent (F - 0.00)</span>`;
                }
            } else if (hasEnteredAny) {
                const gradeInfo = getGradeDetails(totalMark, activeExamDist.total, activeExamDist.passPercent, { cq: rawCq, mcq: rawMcq, practical: rawPrac }, activeExamDist);
                const isPassed = gradeInfo.gp > 0;

                if (totalGradeCell) {
                    totalGradeCell.innerHTML = `<span style="font-weight:700; color:#0f172a; margin-right:6px;">${totalMark}</span> <span style="color:${isPassed ? '#059669' : '#dc2626'}; font-weight:bold;">${gradeInfo.name} (${gradeInfo.gp.toFixed(2)})</span>`;
                }
            } else {
                if (totalGradeCell) totalGradeCell.innerText = '-';
            }

            updateExamMarksModalLiveStats();
        }

        function updateExamMarksModalLiveStats() {
            let totalCount = activeExamStudents.length;
            let enteredCount = 0;
            let passedCount = 0;
            let failedCount = 0;
            let absentCount = 0;
            let totalSum = 0;

            const studentMarksList = [];

            activeExamStudents.forEach(student => {
                const row = document.getElementById(`modal-row-student-${student.id}`);
                let absIn = null, rawCq = "", rawMcq = "", rawPrac = "";
                if (row) {
                    absIn = row.querySelector('.modal-mark-absent');
                    const cqIn = row.querySelector('.modal-mark-cq');
                    const mcqIn = row.querySelector('.modal-mark-mcq');
                    const pracIn = row.querySelector('.modal-mark-prac');
                    rawCq = cqIn ? cqIn.value.trim() : "";
                    rawMcq = mcqIn ? mcqIn.value.trim() : "";
                    rawPrac = pracIn ? pracIn.value.trim() : "";
                }

                const hasAType = rawCq.toUpperCase() === "A" || rawCq.toUpperCase() === "ABS" || rawCq.toUpperCase() === "ABSENT" ||
                    rawMcq.toUpperCase() === "A" || rawMcq.toUpperCase() === "ABS" || rawMcq.toUpperCase() === "ABSENT" ||
                    rawPrac.toUpperCase() === "A" || rawPrac.toUpperCase() === "ABS" || rawPrac.toUpperCase() === "ABSENT";
                const isAbsent = (absIn && absIn.checked) || hasAType;
                const hasEntered = isAbsent || rawCq !== "" || rawMcq !== "" || rawPrac !== "";
                let sum = 0;

                if (isAbsent) {
                    enteredCount++;
                    absentCount++;
                    failedCount++;
                } else if (hasEntered) {
                    enteredCount++;
                    sum = (parseInt(rawCq, 10) || 0) + (parseInt(rawMcq, 10) || 0) + (parseInt(rawPrac, 10) || 0);
                    totalSum += sum;
                    const gradeInfo = getGradeDetails(sum, activeExamDist.total, activeExamDist.passPercent, { cq: rawCq, mcq: rawMcq, practical: rawPrac }, activeExamDist);
                    if (gradeInfo.gp > 0) passedCount++;
                    else failedCount++;
                }

                studentMarksList.push({
                    id: student.id,
                    hasEntered: hasEntered && !isAbsent,
                    isAbsent: isAbsent,
                    total: sum
                });
            });

            // Calculate Ranks for students with entered marks (excluding absent)
            const enteredStudents = studentMarksList.filter(s => s.hasEntered).sort((a, b) => b.total - a.total);
            const rankMap = {};
            enteredStudents.forEach((st, idx) => {
                rankMap[st.id] = idx + 1;
            });

            // Update Rank cell in each student row
            studentMarksList.forEach(st => {
                const rankCell = document.getElementById(`modal-cell-rank-${st.id}`);
                if (rankCell) {
                    if (st.isAbsent) {
                        rankCell.innerHTML = `<span style="color:#dc2626; font-weight:700; font-size:1.075rem;">ABS</span>`;
                    } else if (st.hasEntered && rankMap[st.id]) {
                        const rankNum = rankMap[st.id];
                        let rankColor = "#0284c7";
                        if (rankNum === 1) rankColor = "#d97706";
                        else if (rankNum === 2) rankColor = "#475569";
                        else if (rankNum === 3) rankColor = "#b45309";
                        rankCell.innerHTML = `<span style="font-weight:700; color:${rankColor}; font-size:1.202rem;">${rankNum}</span>`;
                    } else {
                        rankCell.innerText = '-';
                    }
                }
            });

            document.getElementById('stat-total-students').innerText = totalCount;
            document.getElementById('stat-entered-students').innerText = `${enteredCount}/${totalCount}`;
            document.getElementById('stat-passed-students').innerText = passedCount;
            document.getElementById('stat-failed-students').innerText = absentCount > 0 ? `${failedCount} (${absentCount} ABS)` : failedCount;
            const nonAbsentExaminees = enteredCount - absentCount;
            document.getElementById('stat-avg-mark').innerText = nonAbsentExaminees > 0 ? (totalSum / nonAbsentExaminees).toFixed(1) : "0.0";
        }

        function saveExamMarksModal() {
            if (!activeExamScheduleId) return;

            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === activeExamScheduleId);
            if (!sch) return;

            const examVal = sch.term;
            const savedMarks = loadStudentMarks();

            let isValid = true;
            let countSaved = 0;

            activeExamStudents.forEach(student => {
                const row = document.getElementById(`modal-row-student-${student.id}`);
                if (!row) return;

                const absIn = row.querySelector('.modal-mark-absent');
                const cqIn = row.querySelector('.modal-mark-cq');
                const mcqIn = row.querySelector('.modal-mark-mcq');
                const pracIn = row.querySelector('.modal-mark-prac');

                const rawCq = cqIn ? cqIn.value.trim() : "";
                const rawMcq = mcqIn ? mcqIn.value.trim() : "";
                const rawPrac = pracIn ? pracIn.value.trim() : "";

                const hasAType = rawCq.toUpperCase() === "A" || rawCq.toUpperCase() === "ABS" || rawCq.toUpperCase() === "ABSENT" ||
                    rawMcq.toUpperCase() === "A" || rawMcq.toUpperCase() === "ABS" || rawMcq.toUpperCase() === "ABSENT" ||
                    rawPrac.toUpperCase() === "A" || rawPrac.toUpperCase() === "ABS" || rawPrac.toUpperCase() === "ABSENT";
                const isAbsent = (absIn && absIn.checked) || hasAType;

                if (!isAbsent && rawCq === "" && rawMcq === "" && rawPrac === "") return;

                const key = `marks_${student.id}_${activeExamScheduleId}`;
                savedMarks[key] = savedMarks[key] || {};

                if (isAbsent) {
                    savedMarks[key][activeExamSubjectCode] = {
                        total: 0,
                        isAbsent: true,
                        cq: rawCq ? rawCq.toUpperCase() : "A",
                        mcq: rawMcq ? rawMcq.toUpperCase() : "A",
                        practical: rawPrac ? rawPrac.toUpperCase() : "A"
                    };
                    countSaved++;
                } else {
                    const nCq = parseInt(rawCq, 10) || 0;
                    const nMcq = parseInt(rawMcq, 10) || 0;
                    const nPrac = parseInt(rawPrac, 10) || 0;

                    if (rawCq !== "" && (isNaN(nCq) || nCq < 0 || nCq > activeExamDist.cq)) isValid = false;
                    if (rawMcq !== "" && (isNaN(nMcq) || nMcq < 0 || nMcq > activeExamDist.mcq)) isValid = false;
                    if (rawPrac !== "" && (isNaN(nPrac) || nPrac < 0 || nPrac > activeExamDist.practical)) isValid = false;

                    savedMarks[key][activeExamSubjectCode] = {
                        total: nCq + nMcq + nPrac,
                        isAbsent: false,
                        cq: cqIn && rawCq !== "" ? nCq : undefined,
                        mcq: mcqIn && rawMcq !== "" ? nMcq : undefined,
                        practical: pracIn && rawPrac !== "" ? nPrac : undefined
                    };
                    countSaved++;
                }
            });

            if (!isValid) {
                alert("Some entered marks exceed the maximum distribution limit! Please check fields highlighted in red.");
                return;
            }

            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const hoursStr = String(hours).padStart(2, '0');
            const formattedTimestamp = `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;

            savedMarks[`timestamp_${activeExamScheduleId}`] = formattedTimestamp;

            if (sch) {
                sch.marksEntryTime = formattedTimestamp;
                const scheduleIdx = schedules.findIndex(s => s.id === activeExamScheduleId);
                if (scheduleIdx !== -1) {
                    schedules[scheduleIdx].marksEntryTime = formattedTimestamp;
                }
                localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
                if (sch.term) {
                    localStorage.setItem('school_active_exam_filter', sch.term);
                }
            }

            localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
            showExamToast(`Saved exam marks for ${countSaved} students successfully!`, true);
            window.dispatchEvent(new CustomEvent('dbSynced'));
            // Refresh schedule list and dashboard routine summary so row colors and statuses update immediately
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            // Close the marks entry modal window automatically after saving
            closeExamMarksEntryModal();
        }

        function downloadExamMarksTemplate() {
            if (!activeExamScheduleId) return;
            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === activeExamScheduleId);
            if (!sch) return;

            const savedMarks = loadStudentMarks();
            const examVal = sch.term;
            const schoolName = document.getElementById('school-name')?.innerText.trim() || 'Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School';

            const line1 = [schoolName];
            const line2 = [`Class: ${sch.class}, Section: ${sch.section || 'All'}, Subject Name: ${sch.subject}, Subject Code: ${activeExamSubjectCode}`];
            const line3 = [`Exam Name: ${sch.term}, Exam Type: ${sch.examType || 'Main'}, Exam Date: ${sch.date}, Exam No: ${sch.slNo || '-'}, Teacher: ${sch.teacher || 'N/A'}`];
            const line4 = [`বি:দ্র: অনুপস্থিত শিক্ষার্থীর ক্ষেত্রে CQ অথবা MCQ এর ঘরে A লিখতে হবে`];
            const line5 = []; // Blank line for spacing

            // Table Headers
            const idHeader = currentMarksEntryViewType === 'reg_no' ? "Reg No" : "Student ID";
            const headers = ["SL", idHeader, "Student Name (Bangla)", "Section"];
            if (activeExamDist.cq > 0) headers.push("CQ");
            if (activeExamDist.mcq > 0) headers.push("MCQ");
            if (activeExamDist.practical > 0) headers.push("Practical");

            const rowsAoa = [line1, line2, line3, line4, line5, headers];

            activeExamStudents.forEach((student, idx) => {
                const key = `marks_${student.id}_${activeExamScheduleId}`;
                const studentExamMarks = savedMarks[key] ? savedMarks[key][activeExamSubjectCode] : null;

                let isAbsent = false;
                let cqVal = "";
                let mcqVal = "";
                let pracVal = "";

                if (studentExamMarks !== null && studentExamMarks !== undefined) {
                    if (typeof studentExamMarks === 'object') {
                        isAbsent = studentExamMarks.isAbsent === true ||
                            String(studentExamMarks.cq).toUpperCase() === "A" || String(studentExamMarks.cq).toUpperCase() === "ABS" ||
                            String(studentExamMarks.mcq).toUpperCase() === "A" || String(studentExamMarks.mcq).toUpperCase() === "ABS";
                        cqVal = studentExamMarks.cq !== undefined ? studentExamMarks.cq : "";
                        mcqVal = studentExamMarks.mcq !== undefined ? studentExamMarks.mcq : "";
                        pracVal = studentExamMarks.practical !== undefined ? studentExamMarks.practical : "";
                    } else {
                        cqVal = studentExamMarks;
                        isAbsent = String(cqVal).toUpperCase() === "A" || String(cqVal).toUpperCase() === "ABS";
                    }
                }

                const idVal = currentMarksEntryViewType === 'reg_no' ? 
                    (student.regNo || student.registrationNo || student.studentId || student.id || '') : 
                    (student.studentId || student.id || (student.roll ? `Roll-${student.roll}` : ''));

                const rData = [
                    idx + 1,
                    idVal,
                    student.nameBn || student.name || '',
                    student.section || 'A'
                ];

                if (activeExamDist.cq > 0) {
                    rData.push(isAbsent ? "A" : (cqVal !== undefined && cqVal !== null ? cqVal : ""));
                }
                if (activeExamDist.mcq > 0) {
                    rData.push(isAbsent ? "A" : (mcqVal !== undefined && mcqVal !== null ? mcqVal : ""));
                }
                if (activeExamDist.practical > 0) {
                    rData.push(isAbsent ? "A" : (pracVal !== undefined && pracVal !== null ? pracVal : ""));
                }

                rowsAoa.push(rData);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(rowsAoa);

            // Set column widths: Student Name (Bangla) 35, CQ/MCQ/Practical 50% smaller (13)
            const colsWidths = [
                { wch: 8 },   // SL
                { wch: 18 },  // Student ID
                { wch: 35 }   // Student Name (Bangla)
            ];
            if (activeExamDist.cq > 0) colsWidths.push({ wch: 13 });       // CQ (50% smaller)
            if (activeExamDist.mcq > 0) colsWidths.push({ wch: 13 });      // MCQ (50% smaller)
            if (activeExamDist.practical > 0) colsWidths.push({ wch: 13 });// Practical (50% smaller)

            worksheet['!cols'] = colsWidths;

            // Apply 30% larger font size (14pt) to ALL cells in the worksheet
            const sheetRange = XLSX.utils.decode_range(worksheet['!ref']);
            for (let R = sheetRange.s.r; R <= sheetRange.e.r; R++) {
                for (let C = sheetRange.s.c; C <= sheetRange.e.c; C++) {
                    const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!worksheet[cellAddr]) continue;
                    if (!worksheet[cellAddr].s) worksheet[cellAddr].s = {};
                    if (!worksheet[cellAddr].s.font) worksheet[cellAddr].s.font = {};
                    worksheet[cellAddr].s.font.sz = 14; // 30% larger than default 11pt
                }
            }

            // Apply 30% Light Blue background style to table header cells (Row 6)
            const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            headers.forEach((_, idx) => {
                const cellRef = `${colLetters[idx]}6`;
                if (worksheet[cellRef]) {
                    worksheet[cellRef].s = {
                        fill: {
                            fgColor: { rgb: "BDD7EE" } // 30% Light Blue Fill
                        },
                        font: {
                            bold: true,
                            name: "Segoe UI",
                            sz: 14, // 30% larger font
                            color: { rgb: "000000" }
                        },
                        alignment: {
                            horizontal: "center",
                            vertical: "center"
                        },
                        border: {
                            top: { style: "thin", color: { rgb: "D9D9D9" } },
                            bottom: { style: "thin", color: { rgb: "D9D9D9" } },
                            left: { style: "thin", color: { rgb: "D9D9D9" } },
                            right: { style: "thin", color: { rgb: "D9D9D9" } }
                        }
                    };
                }
            });

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Marks Template");

            const safeClass = sch.class.replace(/[^a-zA-Z0-9]/g, '_');
            const safeSubject = sch.subject.replace(/[^a-zA-Z0-9]/g, '_');
            const safeTerm = sch.term.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `Exam_Marks_Template_${safeClass}_${safeSubject}_${safeTerm}.xlsx`;

            XLSX.writeFile(workbook, fileName);
            showExamToast("Exam Marks Excel (.xlsx) Template downloaded successfully!", true);
        }

        function triggerImportExamMarks() {
            const fileIn = document.getElementById('exam-marks-import-file');
            if (fileIn) {
                fileIn.value = "";
                fileIn.click();
            }
        }

        function handleExamMarksFileImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                reader.onload = function (e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rawMatrix = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });

                        let headerIdx = rawMatrix.findIndex(r => Array.isArray(r) && r.some(cell => String(cell).toLowerCase().includes('student id') || String(cell).toLowerCase().includes('sl')));
                        if (headerIdx === -1) headerIdx = 0;

                        const rows = XLSX.utils.sheet_to_json(firstSheet, { range: headerIdx });
                        processImportedExamMarksRows(rows);
                    } catch (err) {
                        alert("Error parsing Excel file: " + err.message);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                reader.onload = function (e) {
                    try {
                        const text = e.target.result;
                        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                        if (lines.length <= 1) {
                            alert("File is empty or invalid!");
                            return;
                        }
                        let headerIdx = lines.findIndex(l => l.toLowerCase().includes('student id') || l.toLowerCase().includes('sl'));
                        if (headerIdx === -1) headerIdx = 0;

                        const headers = lines[headerIdx].split(',').map(h => h.replace(/^"|"$/g, '').trim());
                        const rows = [];
                        for (let i = headerIdx + 1; i < lines.length; i++) {
                            const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
                            const row = {};
                            headers.forEach((h, idx) => {
                                row[h] = values[idx] || "";
                            });
                            rows.push(row);
                        }
                        processImportedExamMarksRows(rows);
                    } catch (err) {
                        alert("Error parsing CSV file: " + err.message);
                    }
                };
                reader.readAsText(file);
            }
        }

        function processImportedExamMarksRows(rows) {
            let matchedCount = 0;

            rows.forEach(importedRow => {
                const keys = Object.keys(importedRow);
                const getKeyVal = (pattern) => {
                    const matchedKey = keys.find(k => k.toLowerCase().trim().startsWith(pattern.toLowerCase()));
                    return matchedKey !== undefined ? importedRow[matchedKey] : undefined;
                };

                const impRoll = (getKeyVal('roll') || '').toString().trim();
                const impId = (getKeyVal('student id') || getKeyVal('id') || '').toString().trim();
                const impNameBn = (getKeyVal('student name (bangla)') || getKeyVal('শিক্ষার্থীর নাম') || '').toString().trim().toLowerCase();
                const impNameEn = (getKeyVal('student name') || getKeyVal('name') || '').toString().trim().toLowerCase();

                const student = activeExamStudents.find(s => {
                    if (impRoll && (s.roll || '').toString().trim() === impRoll) return true;
                    if (impId && ((s.studentId || '').toString().trim() === impId || (s.id || '').toString().trim() === impId)) return true;
                    if (impNameBn && (s.nameBn || '').toString().trim().toLowerCase() === impNameBn) return true;
                    if (impNameEn && (s.name || '').toString().trim().toLowerCase() === impNameEn) return true;
                    return false;
                });

                if (student) {
                    const rowEl = document.getElementById(`modal-row-student-${student.id}`);
                    if (rowEl) {
                        const cqIn = rowEl.querySelector('.modal-mark-cq');
                        const mcqIn = rowEl.querySelector('.modal-mark-mcq');
                        const pracIn = rowEl.querySelector('.modal-mark-prac');

                        const impCq = getKeyVal('cq');
                        const impMcq = getKeyVal('mcq');
                        const impPrac = getKeyVal('practical') || getKeyVal('prac');
                        const impTotal = getKeyVal('total');

                        if (cqIn && impCq !== undefined && impCq !== "") cqIn.value = impCq;
                        if (mcqIn && impMcq !== undefined && impMcq !== "") mcqIn.value = impMcq;
                        if (pracIn && impPrac !== undefined && impPrac !== "") pracIn.value = impPrac;

                        if (!cqIn && !mcqIn && !pracIn && impTotal !== undefined && impTotal !== "") {
                            const singleCqIn = rowEl.querySelector('.student-mark-input-sm');
                            if (singleCqIn) singleCqIn.value = impTotal;
                        }

                        onExamMarkInputChange(cqIn || mcqIn || pracIn, student.id);
                        matchedCount++;
                    }
                }
            });

            if (matchedCount > 0) {
                showExamToast(`Successfully imported marks for ${matchedCount} students!`, true);
            } else {
                alert("No matching students found in the uploaded file! Please check Roll/Student ID numbers in your file.");
            }
        }

        function sortStudentResults(list, sortBy) {
            list.sort((a, b) => {
                if (sortBy === 'regNo') {
                    const rA = String(a.regNo || a.registrationNo || a.studentId || a.id || '').trim();
                    const rB = String(b.regNo || b.registrationNo || b.studentId || b.id || '').trim();
                    const numA = parseInt(rA, 10);
                    const numB = parseInt(rB, 10);
                    if (!isNaN(numA) && !isNaN(numB) && String(numA) === rA && String(numB) === rB) {
                        return numA - numB;
                    }
                    return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
                } else {
                    // Default: Student ID/Roll
                    const rollA = parseInt((a.studentId ? a.studentId.slice(-3) : '') || a.roll || '0', 10);
                    const rollB = parseInt((b.studentId ? b.studentId.slice(-3) : '') || b.roll || '0', 10);
                    if (!isNaN(rollA) && !isNaN(rollB) && rollA !== 0 && rollB !== 0 && rollA !== rollB) {
                        return rollA - rollB;
                    }
                    const idA = String(a.studentId || a.id || a.roll || '');
                    const idB = String(b.studentId || b.id || b.roll || '');
                    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                }
            });
        }

        function viewExamMarksheet() {
            if (!activeExamScheduleId) return;

            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === activeExamScheduleId);
            if (!sch) return;

            // Populate Section Filter Dropdown
            const sectionSelect = document.getElementById('marksheet-filter-section');
            if (sectionSelect) {
                const uniqueSections = new Set();
                activeExamStudents.forEach(s => {
                    if (s.section) uniqueSections.add(s.section.trim());
                });

                let optionsHtml = `<option value="All">সব শাখা (All Sections)</option>`;
                Array.from(uniqueSections).sort().forEach(sec => {
                    optionsHtml += `<option value="${sec}">শাখা: ${sec}</option>`;
                });
                sectionSelect.innerHTML = optionsHtml;
                sectionSelect.value = "All";
            }

            // Restore last saved Sort By selection from localStorage (default: 'studentIdRoll')
            const savedSortBy = localStorage.getItem('school_marksheet_sort_by') || 'studentIdRoll';
            const sortSelect = document.getElementById('marksheet-sort-by');
            if (sortSelect) {
                sortSelect.value = savedSortBy;
            }

            // Reset Registration No filter
            const regInput = document.getElementById('marksheet-filter-reg-no');
            if (regInput) regInput.value = "";

            // Render Preview Table
            renderMarksheetTabulationPreview();

            // Open Modal
            document.getElementById('exam-marksheet-preview-modal').classList.add('active');
        }

        function renderMarksheetTabulationPreview() {
            if (!activeExamScheduleId) return;

            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === activeExamScheduleId);
            if (!sch) return;

            const sectionFilter = document.getElementById('marksheet-filter-section') ? document.getElementById('marksheet-filter-section').value : 'All';
            const sortByEl = document.getElementById('marksheet-sort-by');
            let sortBy = 'studentIdRoll';
            if (sortByEl) {
                sortBy = sortByEl.value;
                localStorage.setItem('school_marksheet_sort_by', sortBy);
            } else {
                sortBy = localStorage.getItem('school_marksheet_sort_by') || 'studentIdRoll';
            }
            const lang = document.getElementById('marksheet-language') ? document.getElementById('marksheet-language').value : 'bn';
            const regFilter = document.getElementById('marksheet-filter-reg-no') ? document.getElementById('marksheet-filter-reg-no').value.trim().toLowerCase() : '';

            // Update headline and title
            const schoolSettings = safeJsonParse('school_settings', {});
            const schoolName = schoolSettings.schoolName || document.getElementById('school-name')?.innerText.trim() || 'Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School';
            const schoolTitleEl = document.getElementById('marksheet-school-name-title');
            if (schoolTitleEl) {
                schoolTitleEl.innerText = schoolName;
            }

            let displaySec = '';
            let subInfoText = '';
            if (lang === 'bn') {
                displaySec = sectionFilter === 'All' ? 'সব শাখা' : `শাখা: ${sectionFilter}`;
                subInfoText = `শ্রেণি: ${sch.class} | শাখা: ${displaySec} | তারিখ: ${sch.date} | পরীক্ষা নং: ${sch.slNo || '-'}`;
            } else if (lang === 'en') {
                displaySec = sectionFilter === 'All' ? 'All Sections' : `Section: ${sectionFilter}`;
                subInfoText = `Class: ${sch.class} | Section: ${displaySec} | Date: ${sch.date} | Exam No: ${sch.slNo || '-'}`;
            } else {
                displaySec = sectionFilter === 'All' ? 'সব শাখা (All Sections)' : `শাখা: ${sectionFilter}`;
                subInfoText = `Class / শ্রেণি: ${sch.class} | Section / শাখা: ${displaySec} | Date / তারিখ: ${sch.date} | Exam No: ${sch.slNo || '-'}`;
            }

            document.getElementById('marksheet-exam-name-title').innerText = `${sch.subject} - ${sch.term}`;
            document.getElementById('marksheet-exam-sub-info').innerText = subInfoText;

            const thead = document.getElementById('marksheet-tabulation-thead');
            const tbody = document.getElementById('marksheet-tabulation-rows');
            const statsBox = document.getElementById('marksheet-summary-stats-box');
            const savedMarks = loadStudentMarks();
            const examVal = sch.term;

            const isRegNoSort = sortBy === 'regNo';

            // Dynamically set table header based on sortBy and language
            if (thead) {
                if (isRegNoSort) {
                    if (lang === 'bn') {
                        thead.innerHTML = `
                            <tr>
                                <th style="width:40px; text-align:center;">ক্রম</th>
                                <th style="width:50px; text-align:center;">ছবি</th>
                                <th style="width:120px; text-align:center;">রেজিঃ নং</th>
                                <th style="text-align:left; min-width:140px;">শিক্ষার্থীর নাম</th>
                                <th style="text-align:left; min-width:130px;">পিতার নাম ও মোবাইল</th>
                                <th style="width:50px; text-align:center;">CQ</th>
                                <th style="width:50px; text-align:center;">MCQ</th>
                                <th style="width:50px; text-align:center;">ব্যবহারিক</th>
                                <th style="width:75px; text-align:center;">মোট নম্বর</th>
                                <th style="width:55px; text-align:center;">গ্রেড</th>
                                <th style="width:55px; text-align:center;">পয়েন্ট</th>
                                <th style="width:70px; text-align:center;">ফলাফল</th>
                            </tr>
                        `;
                    } else if (lang === 'en') {
                        thead.innerHTML = `
                            <tr>
                                <th style="width:40px; text-align:center;">Sl</th>
                                <th style="width:50px; text-align:center;">Photo</th>
                                <th style="width:120px; text-align:center;">Reg No:</th>
                                <th style="text-align:left; min-width:140px;">Student Name</th>
                                <th style="text-align:left; min-width:130px;">Father Name & Mobile</th>
                                <th style="width:50px; text-align:center;">CQ</th>
                                <th style="width:50px; text-align:center;">MCQ</th>
                                <th style="width:50px; text-align:center;">Prac</th>
                                <th style="width:75px; text-align:center;">Total Marks</th>
                                <th style="width:55px; text-align:center;">Grade</th>
                                <th style="width:55px; text-align:center;">GPA</th>
                                <th style="width:70px; text-align:center;">Status</th>
                            </tr>
                        `;
                    } else {
                        thead.innerHTML = `
                            <tr>
                                <th style="width:40px; text-align:center;">Sl / ক্রম</th>
                                <th style="width:50px; text-align:center;">Photo</th>
                                <th style="width:120px; text-align:center;">Reg No: / রেজিঃ</th>
                                <th style="text-align:left; min-width:140px;">Student Name / শিক্ষার্থীর নাম</th>
                                <th style="text-align:left; min-width:130px;">Father Name & Mobile</th>
                                <th style="width:50px; text-align:center;">CQ</th>
                                <th style="width:50px; text-align:center;">MCQ</th>
                                <th style="width:50px; text-align:center;">Prac / ব্যবঃ</th>
                                <th style="width:75px; text-align:center;">Total / মোট</th>
                                <th style="width:55px; text-align:center;">Grade</th>
                                <th style="width:55px; text-align:center;">GPA</th>
                                <th style="width:70px; text-align:center;">Status / ফলাফল</th>
                            </tr>
                        `;
                    }
                } else {
                    if (lang === 'bn') {
                        thead.innerHTML = `
                            <tr>
                                <th style="width:40px; text-align:center;">ক্রম</th>
                                <th style="width:50px; text-align:center;">ছবি</th>
                                <th style="width:125px; text-align:center;">আইডি/রোল</th>
                                <th style="text-align:left; min-width:140px;">শিক্ষার্থীর নাম</th>
                                <th style="text-align:left; min-width:130px;">পিতার নাম ও মোবাইল</th>
                                <th style="width:50px; text-align:center;">CQ</th>
                                <th style="width:50px; text-align:center;">MCQ</th>
                                <th style="width:50px; text-align:center;">ব্যবহারিক</th>
                                <th style="width:75px; text-align:center;">মোট নম্বর</th>
                                <th style="width:55px; text-align:center;">গ্রেড</th>
                                <th style="width:55px; text-align:center;">পয়েন্ট</th>
                                <th style="width:70px; text-align:center;">ফলাফল</th>
                            </tr>
                        `;
                    } else if (lang === 'en') {
                        thead.innerHTML = `
                            <tr>
                                <th style="width:40px; text-align:center;">Sl</th>
                                <th style="width:50px; text-align:center;">Photo</th>
                                <th style="width:125px; text-align:center;">Student ID/Roll</th>
                                <th style="text-align:left; min-width:140px;">Student Name</th>
                                <th style="text-align:left; min-width:130px;">Father Name & Mobile</th>
                                <th style="width:50px; text-align:center;">CQ</th>
                                <th style="width:50px; text-align:center;">MCQ</th>
                                <th style="width:50px; text-align:center;">Prac</th>
                                <th style="width:75px; text-align:center;">Total Marks</th>
                                <th style="width:55px; text-align:center;">Grade</th>
                                <th style="width:55px; text-align:center;">GPA</th>
                                <th style="width:70px; text-align:center;">Status</th>
                            </tr>
                        `;
                    } else {
                        thead.innerHTML = `
                            <tr>
                                <th style="width:40px; text-align:center;">Sl / ক্রম</th>
                                <th style="width:50px; text-align:center;">Photo</th>
                                <th style="width:125px; text-align:center;">ID/Roll / রোল</th>
                                <th style="text-align:left; min-width:140px;">Student Name / শিক্ষার্থীর নাম</th>
                                <th style="text-align:left; min-width:130px;">Father Name & Mobile</th>
                                <th style="width:50px; text-align:center;">CQ</th>
                                <th style="width:50px; text-align:center;">MCQ</th>
                                <th style="width:50px; text-align:center;">Prac / ব্যবঃ</th>
                                <th style="width:75px; text-align:center;">Total / মোট</th>
                                <th style="width:55px; text-align:center;">Grade</th>
                                <th style="width:55px; text-align:center;">GPA</th>
                                <th style="width:70px; text-align:center;">Status / ফলাফল</th>
                            </tr>
                        `;
                    }
                }
            }

            const colSpanCount = 12;

            // Filter students
            let filteredStudents = activeExamStudents.filter(student => {
                // Section filter
                if (sectionFilter !== 'All') {
                    const studentSec = (student.section || '').trim().toUpperCase();
                    if (studentSec !== sectionFilter.toUpperCase()) return false;
                }
                // Registration No / Student ID / Roll / Name / Father filter
                if (regFilter) {
                    const regNo = String(student.registrationNo || student.regNo || '').toLowerCase();
                    const sId = String(student.studentId || student.id || '').toLowerCase();
                    const rollNo = String(student.roll || '').toLowerCase();
                    const name = String(student.name || '' + ' ' + (student.nameBn || '')).toLowerCase();
                    const father = String(student.fatherName || '').toLowerCase();
                    if (!regNo.includes(regFilter) && !sId.includes(regFilter) && !rollNo.includes(regFilter) && !name.includes(regFilter) && !father.includes(regFilter)) {
                        return false;
                    }
                }
                return true;
            });

            const studentResults = [];
            filteredStudents.forEach(student => {
                const key = `marks_${student.id}_${activeExamScheduleId}`;
                const fallbackKey = `marks_${student.id}_${examVal}`;
                const markObj = savedMarks[key] ? savedMarks[key][activeExamSubjectCode] : (savedMarks[fallbackKey] ? savedMarks[fallbackKey][activeExamSubjectCode] : null);

                let cqVal = "-";
                let mcqVal = "-";
                let pracVal = "-";
                let totalMark = 0;
                let hasMark = false;

                if (markObj && typeof markObj === 'object') {
                    hasMark = true;
                    cqVal = markObj.cq !== undefined ? markObj.cq : "-";
                    mcqVal = markObj.mcq !== undefined ? markObj.mcq : "-";
                    pracVal = markObj.practical !== undefined ? markObj.practical : "-";
                    totalMark = markObj.total !== undefined ? markObj.total : 0;
                } else if (markObj !== null && markObj !== undefined) {
                    hasMark = true;
                    totalMark = parseInt(markObj, 10) || 0;
                    cqVal = totalMark;
                }

                const gradeInfo = hasMark ? getGradeDetails(totalMark, activeExamDist.total, activeExamDist.passPercent, markObj, activeExamDist) : { name: "-", gp: 0 };
                studentResults.push({
                    id: student.id,
                    studentId: student.studentId || student.id || '-',
                    regNo: student.regNo || student.registrationNo || student.studentId || student.id || '-',
                    roll: student.roll || '-',
                    nameBn: student.nameBn || '',
                    nameEn: student.name || student.nameEn || '',
                    name: student.nameBn || student.name || '-',
                    photo: student.photo || '',
                    class: student.class || sch.class || '',
                    section: student.section || 'A',
                    fatherNameBn: student.fatherNameBn || '',
                    fatherNameEn: student.fatherName || student.fatherNameEn || '',
                    fatherName: student.fatherNameBn || student.fatherName || '-',
                    fatherPhone: student.fatherPhone || student.phone || '-',
                    cq: cqVal,
                    mcq: mcqVal,
                    practical: pracVal,
                    total: totalMark,
                    hasMark: hasMark,
                    grade: gradeInfo.name,
                    gp: gradeInfo.gp,
                    isPassed: gradeInfo.gp > 0
                });
            });

            if (studentResults.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${colSpanCount}" style="text-align:center; padding:25px; color:var(--muted-text); font-style:italic;">${lang === 'en' ? 'No students found for the selected filter.' : 'নির্বাচিত শাখা বা সার্চ অনুযায়ী কোনো শিক্ষার্থী পাওয়া যায়নি।'}</td></tr>`;
                statsBox.innerHTML = '';
                return;
            }

            // Group by section if All Sections, else render single section
            let html = "";
            let passCount = 0;
            let failCount = 0;
            let totalSum = 0;
            let highestMark = 0;
            let lowestMark = 999;

            function renderTableRow(res, idx) {
                const photoHTML = res.photo
                    ? `<img src="${res.photo}" alt="Photo" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1.5px solid #cbd5e1; display:block; margin:0 auto;">`
                    : `<div style="width:34px; height:34px; border-radius:50%; background:#f1f5f9; border:1px solid #cbd5e1; display:inline-flex; align-items:center; justify-content:center; color:#64748b; font-size:0.75rem; margin:0 auto;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;

                const idRollHTML = `<div style="color:#0284c7; font-weight:800; font-family:monospace; font-size:0.95rem;">${res.studentId}</div>`;

                let nameContent = '';
                if (lang === 'bn') {
                    nameContent = `<div style="color:#0f172a; font-size:0.98rem; font-weight:700; line-height:1.2;">${res.nameBn || res.nameEn || res.name}</div>`;
                } else if (lang === 'en') {
                    nameContent = `<div style="color:#0f172a; font-size:0.98rem; font-weight:700; line-height:1.2;">${res.nameEn || res.nameBn || res.name}</div>`;
                } else {
                    if (res.nameBn && res.nameEn && res.nameBn !== res.nameEn) {
                        nameContent = `
                            <div style="color:#0f172a; font-size:0.98rem; font-weight:700; line-height:1.2;">${res.nameBn}</div>
                            <div style="color:#2563eb; font-size:0.85rem; font-weight:600; margin-top:2px;">${res.nameEn}</div>
                        `;
                    } else {
                        nameContent = `<div style="color:#0f172a; font-size:0.98rem; font-weight:700; line-height:1.2;">${res.nameBn || res.nameEn || res.name}</div>`;
                    }
                }

                let fatherContent = '';
                if (lang === 'bn') {
                    fatherContent = `<div style="color:#334155; font-size:0.9rem; font-weight:600; line-height:1.2;">${res.fatherNameBn || res.fatherNameEn || res.fatherName || '-'}</div>`;
                } else if (lang === 'en') {
                    fatherContent = `<div style="color:#334155; font-size:0.9rem; font-weight:600; line-height:1.2;">${res.fatherNameEn || res.fatherNameBn || res.fatherName || '-'}</div>`;
                } else {
                    if (res.fatherNameBn && res.fatherNameEn && res.fatherNameBn !== res.fatherNameEn) {
                        fatherContent = `
                            <div style="color:#334155; font-size:0.9rem; font-weight:600; line-height:1.2;">${res.fatherNameBn}</div>
                            <div style="color:#64748b; font-size:0.8rem; margin-top:1px;">${res.fatherNameEn}</div>
                        `;
                    } else {
                        fatherContent = `<div style="color:#334155; font-size:0.9rem; font-weight:600; line-height:1.2;">${res.fatherNameBn || res.fatherNameEn || res.fatherName || '-'}</div>`;
                    }
                }

                const fatherHTML = `
                    ${fatherContent}
                    <div style="color:#0284c7; font-family:monospace; font-size:0.8rem; font-weight:600; margin-top:2px;">${res.fatherPhone || '-'}</div>
                `;

                let statusBadge = '-';
                if (res.hasMark) {
                    let statusLabel = '';
                    if (lang === 'bn') {
                        statusLabel = res.isPassed ? 'পাস' : 'ফেল';
                    } else if (lang === 'en') {
                        statusLabel = res.isPassed ? 'PASSED' : 'FAILED';
                    } else {
                        statusLabel = res.isPassed ? 'PASSED (পাস)' : 'FAILED (ফেল)';
                    }
                    statusBadge = `<span style="color:${res.isPassed ? '#16a34a' : '#dc2626'}; font-weight:bold;">${statusLabel}</span>`;
                }

                return `
                    <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="font-weight:700; color:#0284c7; text-align:center;">${idx + 1}</td>
                        <td style="text-align:center; padding:4px;">${photoHTML}</td>
                        ${isRegNoSort ? `<td style="text-align:center; font-weight:700; color:#d97706; font-family:monospace; font-size:0.95rem;">${res.regNo}</td>` : `<td style="text-align:center;">${idRollHTML}</td>`}
                        <td style="text-align:left; padding-left:10px;">${nameContent}</td>
                        <td style="text-align:left; padding-left:10px;">${fatherHTML}</td>
                        <td style="text-align:center; color:#0f172a;">${res.cq}</td>
                        <td style="text-align:center; color:#0f172a;">${res.mcq}</td>
                        <td style="text-align:center; color:#0f172a;">${res.practical}</td>
                        <td style="font-weight:800; color:#0f172a; font-size:0.95rem; text-align:center;">${res.hasMark ? res.total : '-'}</td>
                        <td style="font-weight:bold; color:${res.isPassed ? '#16a34a' : '#dc2626'}; text-align:center;">${res.grade}</td>
                        <td style="text-align:center; color:#334155; font-weight:600;">${res.hasMark ? res.gp.toFixed(2) : '-'}</td>
                        <td style="text-align:center;">${statusBadge}</td>
                    </tr>
                `;
            }

            if (isRegNoSort) {
                // When sorting by Reg No, display all students continuously sorted by Reg No
                sortStudentResults(studentResults, 'regNo');

                studentResults.forEach((res, idx) => {
                    if (res.hasMark) {
                        totalSum += res.total;
                        if (res.total > highestMark) highestMark = res.total;
                        if (res.total < lowestMark) lowestMark = res.total;
                        if (res.isPassed) passCount++; else failCount++;
                    }
                    html += renderTableRow(res, idx);
                });
            } else if (sectionFilter === 'All') {
                const sectionsMap = {};
                studentResults.forEach(res => {
                    const sec = res.section || 'A';
                    if (!sectionsMap[sec]) sectionsMap[sec] = [];
                    sectionsMap[sec].push(res);
                });

                const secKeys = Object.keys(sectionsMap).sort();
                secKeys.forEach(secKey => {
                    const secList = sectionsMap[secKey];
                    sortStudentResults(secList, sortBy);

                    const secTitle = lang === 'en' ? `Section: ${secKey} &nbsp; <span style="font-weight:normal; font-size:0.88rem; color:#64748b;">(Total Students: ${secList.length})</span>` : `🏫 শাখা: ${secKey} &nbsp; <span style="font-weight:normal; font-size:0.88rem; color:#64748b;">(মোট শিক্ষার্থী: ${secList.length} জন)</span>`;

                    html += `
                        <tr style="background:#f1f5f9; color:#1e40af; font-weight:700;">
                            <td colspan="${colSpanCount}" style="text-align:left; padding:8px 14px; font-size:1.02rem; border-top:2px solid #cbd5e1; border-bottom:1px solid #e2e8f0; color:#1e40af;">
                                ${secTitle}
                            </td>
                        </tr>
                    `;

                    secList.forEach((res, idx) => {
                        if (res.hasMark) {
                            totalSum += res.total;
                            if (res.total > highestMark) highestMark = res.total;
                            if (res.total < lowestMark) lowestMark = res.total;
                            if (res.isPassed) passCount++; else failCount++;
                        }
                        html += renderTableRow(res, idx);
                    });
                });
            } else {
                sortStudentResults(studentResults, sortBy);

                studentResults.forEach((res, idx) => {
                    if (res.hasMark) {
                        totalSum += res.total;
                        if (res.total > highestMark) highestMark = res.total;
                        if (res.total < lowestMark) lowestMark = res.total;
                        if (res.isPassed) passCount++; else failCount++;
                    }
                    html += renderTableRow(res, idx);
                });
            }

            tbody.innerHTML = html;

            const examinees = studentResults.filter(r => r.hasMark).length;
            const avgMark = examinees > 0 ? (totalSum / examinees).toFixed(1) : 0;
            if (lowestMark === 999) lowestMark = 0;

            if (lang === 'en') {
                statsBox.innerHTML = `
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#0284c7;">${studentResults.length}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">Total Students</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#8b5cf6;">${examinees}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">Examinees</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#16a34a;">${passCount}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">Passed</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#dc2626;">${failCount}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">Failed</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#d97706;">${examinees > 0 ? ((passCount / examinees) * 100).toFixed(1) : 0}%</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">Pass Rate</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#0f172a;">${highestMark}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">Highest Mark</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#0f172a;">${avgMark}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">Average Mark</div></div>
                `;
            } else {
                statsBox.innerHTML = `
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#0284c7;">${studentResults.length}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">মোট শিক্ষার্থী</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#8b5cf6;">${examinees}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">পরীক্ষার্থী</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#16a34a;">${passCount}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">উত্তীর্ণ</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#dc2626;">${failCount}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">অনুত্তীর্ণ</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#d97706;">${examinees > 0 ? ((passCount / examinees) * 100).toFixed(1) : 0}%</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">পাশের হার</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#0f172a;">${highestMark}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">সর্বোচ্চ নম্বর</div></div>
                    <div style="background:#ffffff; border:1px solid #e2e8f0; padding:10px; border-radius:10px;"><div style="font-weight:800; font-size:1.15rem; color:#0f172a;">${avgMark}</div><div style="font-size:0.75rem; color:#64748b; font-weight:600;">গড় নম্বর</div></div>
                `;
            }
        }

        function downloadMarksheetPDF(formatType = 'blank') {
            if (!activeExamScheduleId) return;

            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === activeExamScheduleId);
            if (!sch) return;

            const sectionFilter = document.getElementById('marksheet-filter-section') ? document.getElementById('marksheet-filter-section').value : 'All';
            const sortBy = document.getElementById('marksheet-sort-by') ? document.getElementById('marksheet-sort-by').value : 'studentIdRoll';
            const lang = document.getElementById('marksheet-language') ? document.getElementById('marksheet-language').value : 'bn';
            const regFilter = document.getElementById('marksheet-filter-reg-no') ? document.getElementById('marksheet-filter-reg-no').value.trim().toLowerCase() : '';

            // Filter students
            let filteredStudents = activeExamStudents.filter(student => {
                if (sectionFilter !== 'All') {
                    const studentSec = (student.section || '').trim().toUpperCase();
                    if (studentSec !== sectionFilter.toUpperCase()) return false;
                }
                if (regFilter) {
                    const regNo = String(student.registrationNo || student.regNo || '').toLowerCase();
                    const sId = String(student.studentId || student.id || '').toLowerCase();
                    const rollNo = String(student.roll || '').toLowerCase();
                    const name = String(student.name || '' + ' ' + (student.nameBn || '')).toLowerCase();
                    const father = String(student.fatherName || '').toLowerCase();
                    if (!regNo.includes(regFilter) && !sId.includes(regFilter) && !rollNo.includes(regFilter) && !name.includes(regFilter) && !father.includes(regFilter)) {
                        return false;
                    }
                }
                return true;
            });

            if (filteredStudents.length === 0) {
                alert(lang === 'en' ? "No students found for the selected filter!" : "নির্বাচিত শাখা বা সার্চ অনুযায়ী কোনো শিক্ষার্থী পাওয়া যায়নি!");
                return;
            }

            const savedMarks = loadStudentMarks();
            const examVal = sch.term;

            const studentResults = [];
            filteredStudents.forEach(student => {
                const key = `marks_${student.id}_${activeExamScheduleId}`;
                const fallbackKey = `marks_${student.id}_${examVal}`;
                const markObj = savedMarks[key] ? savedMarks[key][activeExamSubjectCode] : (savedMarks[fallbackKey] ? savedMarks[fallbackKey][activeExamSubjectCode] : null);

                let cqVal = "";
                let mcqVal = "";
                let pracVal = "";
                let totalMark = "";
                let hasMark = false;

                if (markObj && typeof markObj === 'object') {
                    hasMark = true;
                    cqVal = markObj.cq !== undefined ? markObj.cq : "";
                    mcqVal = markObj.mcq !== undefined ? markObj.mcq : "";
                    pracVal = markObj.practical !== undefined ? markObj.practical : "";
                    totalMark = markObj.total !== undefined ? markObj.total : "";
                } else if (markObj !== null && markObj !== undefined) {
                    hasMark = true;
                    totalMark = markObj;
                    cqVal = totalMark;
                }

                studentResults.push({
                    id: student.id,
                    studentId: student.studentId || student.id || '-',
                    regNo: student.regNo || student.registrationNo || student.studentId || student.id || '-',
                    roll: student.roll || '-',
                    nameBn: student.nameBn || '',
                    nameEn: student.name || student.nameEn || '',
                    name: student.nameBn || student.name || '-',
                    photo: student.photo || '',
                    class: student.class || sch.class || '',
                    section: student.section || 'A',
                    fatherNameBn: student.fatherNameBn || '',
                    fatherNameEn: student.fatherName || student.fatherNameEn || '',
                    fatherName: student.fatherNameBn || student.fatherName || '-',
                    fatherPhone: student.fatherPhone || student.phone || '-',
                    cq: cqVal,
                    mcq: mcqVal,
                    practical: pracVal,
                    total: totalMark,
                    hasMark: hasMark
                });
            });

            const isRegNoSort = (sortBy === 'regNo');
            const schoolSettings = safeJsonParse('school_settings', {});
            const schoolName = schoolSettings.schoolName || document.getElementById('school-name')?.innerText.trim() || 'Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School';
            const examName = sch.term || '';
            const teacherName = sch.teacher || 'N/A';
            const subjectName = sch.subject || '';
            const examDate = sch.date || '';
            const schoolLogo = localStorage.getItem('school_logo') || '';

            const showCQ = activeExamDist.cq > 0;
            const showMCQ = activeExamDist.mcq > 0;
            const showPractical = activeExamDist.practical > 0;
            const isBlank = formatType === 'blank';

            // Function to generate formatted student name for PDF
            function getPdfStudentName(res) {
                if (lang === 'bn') {
                    return `<div style="font-weight:700; font-size:9pt; line-height:1.15; text-align:left;">${res.nameBn || res.nameEn || res.name}</div>`;
                } else if (lang === 'en') {
                    return `<div style="font-weight:700; font-size:9pt; line-height:1.15; text-align:left;">${res.nameEn || res.nameBn || res.name}</div>`;
                } else {
                    if (res.nameBn && res.nameEn && res.nameBn !== res.nameEn) {
                        return `<div style="font-weight:700; font-size:8.5pt; line-height:1.1; text-align:left;">${res.nameBn}</div><div style="font-weight:600; font-size:7.5pt; color:#222; text-align:left;">${res.nameEn}</div>`;
                    }
                    return `<div style="font-weight:700; font-size:9pt; line-height:1.15; text-align:left;">${res.nameBn || res.nameEn || res.name}</div>`;
                }
            }

            // Function to get signatures footer based on language
            function getPdfSignaturesHTML() {
                if (lang === 'en') {
                    return `
                        <div class="footer-section">
                            <div class="signature-block"><div class="signature-line">Class Teacher's Signature</div></div>
                            <div class="signature-block"><div class="signature-line">Exam Controller's Signature</div></div>
                            <div class="signature-block"><div class="signature-line">Headmaster's Signature</div></div>
                        </div>
                    `;
                } else if (lang === 'both') {
                    return `
                        <div class="footer-section">
                            <div class="signature-block"><div class="signature-line">শ্রেণি শিক্ষকের স্বাক্ষর (Class Teacher)</div></div>
                            <div class="signature-block"><div class="signature-line">পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর (Controller)</div></div>
                            <div class="signature-block"><div class="signature-line">প্রধান শিক্ষকের স্বাক্ষর (Headmaster)</div></div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="footer-section">
                            <div class="signature-block"><div class="signature-line">শ্রেণি শিক্ষকের স্বাক্ষর</div></div>
                            <div class="signature-block"><div class="signature-line">পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর</div></div>
                            <div class="signature-block"><div class="signature-line">প্রধান শিক্ষকের স্বাক্ষর</div></div>
                        </div>
                    `;
                }
            }

            let bodyContentHTML = '';

            if (isRegNoSort) {
                // When Reg No is selected: All students in one unified list (no section separation), no Student ID/Roll column
                sortStudentResults(studentResults, 'regNo');

                const half = Math.ceil(studentResults.length / 2);
                const leftList = studentResults.slice(0, half);
                const rightList = studentResults.slice(half);

                let leftRowsHTML = '';
                leftList.forEach((res, idx) => {
                    const nameHTML = getPdfStudentName(res);

                    leftRowsHTML += `
                        <tr>
                            <td style="font-weight:600;">${idx + 1}</td>
                            <td style="font-weight:700; font-family:monospace; color:#000;">${res.regNo}</td>
                            <td style="text-align:left;">${nameHTML}</td>
                    `;
                    if (showCQ) leftRowsHTML += `<td>${!isBlank && res.hasMark ? res.cq : ''}</td>`;
                    if (showMCQ) leftRowsHTML += `<td>${!isBlank && res.hasMark ? res.mcq : ''}</td>`;
                    if (showPractical) leftRowsHTML += `<td>${!isBlank && res.hasMark ? res.practical : ''}</td>`;
                    if (!isBlank) leftRowsHTML += `<td style="font-weight:bold;">${res.hasMark ? res.total : ''}</td>`;
                    leftRowsHTML += `</tr>`;
                });

                let rightRowsHTML = '';
                rightList.forEach((res, idx) => {
                    const nameHTML = getPdfStudentName(res);

                    rightRowsHTML += `
                        <tr>
                            <td style="font-weight:600;">${half + idx + 1}</td>
                            <td style="font-weight:700; font-family:monospace; color:#000;">${res.regNo}</td>
                            <td style="text-align:left;">${nameHTML}</td>
                    `;
                    if (showCQ) rightRowsHTML += `<td>${!isBlank && res.hasMark ? res.cq : ''}</td>`;
                    if (showMCQ) rightRowsHTML += `<td>${!isBlank && res.hasMark ? res.mcq : ''}</td>`;
                    if (showPractical) rightRowsHTML += `<td>${!isBlank && res.hasMark ? res.practical : ''}</td>`;
                    if (!isBlank) rightRowsHTML += `<td style="font-weight:bold;">${res.hasMark ? res.total : ''}</td>`;
                    rightRowsHTML += `</tr>`;
                });

                let slHeader = lang === 'en' ? 'SL' : (lang === 'bn' ? 'ক্রম' : 'SL / ক্রম');
                let regHeader = lang === 'en' ? 'Reg No:' : (lang === 'bn' ? 'রেজিঃ নং' : 'Reg No:');
                let nameHeader = lang === 'en' ? 'Student Name' : (lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name / শিক্ষার্থীর নাম');
                let pracHeader = lang === 'bn' ? 'ব্যবহারিক' : (lang === 'both' ? 'Prac / ব্যবঃ' : 'Prac');
                let totalHeader = lang === 'bn' ? 'মোট' : (lang === 'both' ? 'Total / মোট' : 'Total');

                let tableHeaderHTML = `
                    <tr>
                        <th style="width:28px;">${slHeader}</th>
                        <th style="width:75px;">${regHeader}</th>
                        <th style="text-align:left;">${nameHeader}</th>
                `;
                if (showCQ) tableHeaderHTML += `<th style="width:38px;">CQ</th>`;
                if (showMCQ) tableHeaderHTML += `<th style="width:38px;">MCQ</th>`;
                if (showPractical) tableHeaderHTML += `<th style="width:38px;">${pracHeader}</th>`;
                if (!isBlank) tableHeaderHTML += `<th style="width:45px;">${totalHeader}</th>`;
                tableHeaderHTML += `</tr>`;

                let displaySecTitle = '';
                let metaTeacher = '';
                let metaSubject = '';
                let metaDate = '';

                if (lang === 'en') {
                    displaySecTitle = sectionFilter === 'All' ? 'All Sections' : `Section: ${sectionFilter}`;
                    metaTeacher = `<strong>Teacher:</strong> ${teacherName}`;
                    metaSubject = `<strong>Subject:</strong> ${subjectName}`;
                    metaDate = `<strong>Date:</strong> ${examDate}`;
                } else if (lang === 'both') {
                    displaySecTitle = sectionFilter === 'All' ? 'সব শাখা (All Sections)' : `শাখা: ${sectionFilter}`;
                    metaTeacher = `<strong>Teacher / শিক্ষক:</strong> ${teacherName}`;
                    metaSubject = `<strong>Subject / বিষয়:</strong> ${subjectName}`;
                    metaDate = `<strong>Date / তারিখ:</strong> ${examDate}`;
                } else {
                    displaySecTitle = sectionFilter === 'All' ? 'সব শাখা' : `শাখা: ${sectionFilter}`;
                    metaTeacher = `<strong>শিক্ষক:</strong> ${teacherName}`;
                    metaSubject = `<strong>বিষয়:</strong> ${subjectName}`;
                    metaDate = `<strong>তারিখ:</strong> ${examDate}`;
                }

                const subHeaderInfo = lang === 'en'
                    ? `Class: ${sch.class} | Section: ${displaySecTitle} (Total: ${studentResults.length})`
                    : (lang === 'both'
                        ? `Class / শ্রেণি: ${sch.class} | Section / শাখা: ${displaySecTitle} (Total / মোট: ${studentResults.length})`
                        : `শ্রেণি: ${sch.class} | শাখা: ${displaySecTitle} (মোট শিক্ষার্থী: ${studentResults.length} জন)`);

                bodyContentHTML = `
                <div class="page-wrapper">
                    <div>
                        <!-- Main Header -->
                        <div class="header-section">
                            <div class="header-top-row">
                                <div class="header-logo">
                                    ${schoolLogo ? `<img src="${schoolLogo}" alt="Logo">` : ''}
                                </div>
                                <div class="header-center-text">
                                    <div class="school-name">${schoolName}</div>
                                    <div class="exam-name">${examName}</div>
                                    <div class="exam-name-2">${subHeaderInfo}</div>
                                </div>
                                <div style="width:58px; flex-shrink:0;"></div>
                            </div>
                            <div class="info-row">
                                <span class="left">${metaTeacher}</span>
                                <span class="center">${metaSubject}</span>
                                <span class="right">${metaDate}</span>
                            </div>
                        </div>

                        <!-- Single 2-Column Table -->
                        <div class="table-section" style="margin-top: 10px;">
                            <div class="table-column">
                                <table>
                                    <thead>${tableHeaderHTML}</thead>
                                    <tbody>${leftRowsHTML}</tbody>
                                </table>
                            </div>
                            <div class="table-column">
                                <table>
                                    <thead>${tableHeaderHTML}</thead>
                                    <tbody>${rightRowsHTML}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Signatures -->
                    ${getPdfSignaturesHTML()}
                </div>`;
            } else {
                // When Sort By is Student ID/Roll (separate pages per section if All, or single section)
                let sectionsMap = {};
                if (sectionFilter === 'All') {
                    studentResults.forEach(res => {
                        const sec = res.section || 'A';
                        if (!sectionsMap[sec]) sectionsMap[sec] = [];
                        sectionsMap[sec].push(res);
                    });
                } else {
                    sectionsMap[sectionFilter] = studentResults;
                }

                const sectionKeys = Object.keys(sectionsMap).sort();
                let pagesHTML = '';
                sectionKeys.forEach((secKey, idx) => {
                    const secList = sectionsMap[secKey];
                    sortStudentResults(secList, 'studentIdRoll');
                    const isLast = idx === sectionKeys.length - 1;

                    const half = Math.ceil(secList.length / 2);
                    const leftList = secList.slice(0, half);
                    const rightList = secList.slice(half);

                    let leftRowsHTML = '';
                    leftList.forEach((res, i) => {
                        const idRollHTML = `<div style="font-weight:700; font-family:monospace; font-size:9pt;">${res.studentId}</div>`;
                        const nameHTML = getPdfStudentName(res);

                        leftRowsHTML += `
                            <tr>
                                <td style="font-weight:600;">${i + 1}</td>
                                <td>${idRollHTML}</td>
                                <td style="text-align:left;">${nameHTML}</td>
                        `;
                        if (showCQ) leftRowsHTML += `<td>${!isBlank && res.hasMark ? res.cq : ''}</td>`;
                        if (showMCQ) leftRowsHTML += `<td>${!isBlank && res.hasMark ? res.mcq : ''}</td>`;
                        if (showPractical) leftRowsHTML += `<td>${!isBlank && res.hasMark ? res.practical : ''}</td>`;
                        if (!isBlank) leftRowsHTML += `<td style="font-weight:bold;">${res.hasMark ? res.total : ''}</td>`;
                        leftRowsHTML += `</tr>`;
                    });

                    let rightRowsHTML = '';
                    rightList.forEach((res, i) => {
                        const idRollHTML = `<div style="font-weight:700; font-family:monospace; font-size:9pt;">${res.studentId}</div>`;
                        const nameHTML = getPdfStudentName(res);

                        rightRowsHTML += `
                            <tr>
                                <td style="font-weight:600;">${half + i + 1}</td>
                                <td>${idRollHTML}</td>
                                <td style="text-align:left;">${nameHTML}</td>
                        `;
                        if (showCQ) rightRowsHTML += `<td>${!isBlank && res.hasMark ? res.cq : ''}</td>`;
                        if (showMCQ) rightRowsHTML += `<td>${!isBlank && res.hasMark ? res.mcq : ''}</td>`;
                        if (showPractical) rightRowsHTML += `<td>${!isBlank && res.hasMark ? res.practical : ''}</td>`;
                        if (!isBlank) rightRowsHTML += `<td style="font-weight:bold;">${res.hasMark ? res.total : ''}</td>`;
                        rightRowsHTML += `</tr>`;
                    });

                    let slHeader = lang === 'en' ? 'SL' : (lang === 'bn' ? 'ক্রম' : 'SL / ক্রম');
                    let idHeader = lang === 'en' ? 'Student ID/Roll' : (lang === 'bn' ? 'আইডি/রোল' : 'ID/Roll');
                    let nameHeader = lang === 'en' ? 'Student Name' : (lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name / শিক্ষার্থীর নাম');
                    let pracHeader = lang === 'bn' ? 'ব্যবহারিক' : (lang === 'both' ? 'Prac / ব্যবঃ' : 'Prac');
                    let totalHeader = lang === 'bn' ? 'মোট' : (lang === 'both' ? 'Total / মোট' : 'Total');

                    let tableHeaderHTML = `
                        <tr>
                            <th style="width:28px;">${slHeader}</th>
                            <th style="width:85px;">${idHeader}</th>
                            <th style="text-align:left;">${nameHeader}</th>
                    `;
                    if (showCQ) tableHeaderHTML += `<th style="width:40px;">CQ</th>`;
                    if (showMCQ) tableHeaderHTML += `<th style="width:40px;">MCQ</th>`;
                    if (showPractical) tableHeaderHTML += `<th style="width:40px;">${pracHeader}</th>`;
                    if (!isBlank) tableHeaderHTML += `<th style="width:48px;">${totalHeader}</th>`;
                    tableHeaderHTML += `</tr>`;

                    let displaySectionTitle = '';
                    let metaTeacher = '';
                    let metaSubject = '';
                    let metaDate = '';

                    if (lang === 'en') {
                        displaySectionTitle = sectionFilter === 'All' ? `Section: ${secKey}` : (secKey === 'All' ? 'All Sections' : `Section: ${secKey}`);
                        metaTeacher = `<strong>Teacher:</strong> ${teacherName}`;
                        metaSubject = `<strong>Subject:</strong> ${subjectName}`;
                        metaDate = `<strong>Date:</strong> ${examDate}`;
                    } else if (lang === 'both') {
                        displaySectionTitle = sectionFilter === 'All' ? `শাখা: ${secKey}` : (secKey === 'All' ? 'সব শাখা' : `শাখা: ${secKey}`);
                        metaTeacher = `<strong>Teacher / শিক্ষক:</strong> ${teacherName}`;
                        metaSubject = `<strong>Subject / বিষয়:</strong> ${subjectName}`;
                        metaDate = `<strong>Date / তারিখ:</strong> ${examDate}`;
                    } else {
                        displaySectionTitle = sectionFilter === 'All' ? `শাখা: ${secKey}` : (secKey === 'All' ? 'সব শাখা' : `শাখা: ${secKey}`);
                        metaTeacher = `<strong>শিক্ষক:</strong> ${teacherName}`;
                        metaSubject = `<strong>বিষয়:</strong> ${subjectName}`;
                        metaDate = `<strong>তারিখ:</strong> ${examDate}`;
                    }

                    const subHeaderInfo = lang === 'en'
                        ? `Class: ${sch.class} | ${displaySectionTitle} (Total: ${secList.length})`
                        : (lang === 'both'
                            ? `Class / শ্রেণি: ${sch.class} | ${displaySectionTitle} (Total / মোট: ${secList.length})`
                            : `শ্রেণি: ${sch.class} | ${displaySectionTitle} (মোট: ${secList.length} জন)`);

                    pagesHTML += `
                    <div class="page-wrapper" style="${!isLast ? 'page-break-after: always; margin-bottom: 25px;' : ''}">
                        <div>
                            <!-- Header -->
                            <div class="header-section">
                                <div class="header-top-row">
                                    <div class="header-logo">
                                        ${schoolLogo ? `<img src="${schoolLogo}" alt="Logo">` : ''}
                                    </div>
                                    <div class="header-center-text">
                                        <div class="school-name">${schoolName}</div>
                                        <div class="exam-name">${examName}</div>
                                        <div class="exam-name-2">${subHeaderInfo}</div>
                                    </div>
                                    <div style="width:58px; flex-shrink:0;"></div>
                                </div>
                                <div class="info-row">
                                    <span class="left">${metaTeacher}</span>
                                    <span class="center">${metaSubject}</span>
                                    <span class="right">${metaDate}</span>
                                </div>
                            </div>

                            <!-- Two-Column Table -->
                            <div class="table-section" style="margin-top: 10px;">
                                <div class="table-column">
                                    <table>
                                        <thead>${tableHeaderHTML}</thead>
                                        <tbody>${leftRowsHTML}</tbody>
                                    </table>
                                </div>
                                <div class="table-column">
                                    <table>
                                        <thead>${tableHeaderHTML}</thead>
                                        <tbody>${rightRowsHTML}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Signatures -->
                        ${getPdfSignaturesHTML()}
                    </div>`;
                });
                bodyContentHTML = pagesHTML;
            }

            const pdfHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Marksheet - ${sch.term} - ${sch.class}</title>
    <link href="https://fonts.googleapis.com/css2?family=Agbalumo&family=Noto+Rashi+Hebrew:wght@100..900&family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
    <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
    <style>
        @page {
            size: A4 portrait;
            margin-top: 0.3in;
            margin-right: 0.4in;
            margin-bottom: 0.3in;
            margin-left: 0.4in;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Kalpurush', 'SolaimanLipi', serif;
            font-size: 11pt;
            color: #000;
            background: #fff;
            padding: 0;
            margin: 0;
        }
        .page-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        /* Header Section */
        .header-section {
            margin-bottom: 4px;
            padding-bottom: 3px;
            border-bottom: 2px solid #000;
        }
        .header-top-row {
            display: flex;
            align-items: center;
            margin-bottom: 0px;
        }
        .header-logo {
            width: 58px;
            height: 58px;
            flex-shrink: 0;
        }
        .header-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 4px;
        }
        .header-center-text {
            flex: 1;
            text-align: center;
        }
        .school-name {
            font-size: 19pt;
            font-weight: 900;
            margin-bottom: 0px;
            line-height: 0.95;
            text-transform: uppercase;
        }
        .exam-name {
            font-size: 14pt;
            font-weight: 700;
            margin-bottom: 0px;
            line-height: 0.95;
        }
        .exam-name-2 {
            font-size: 11pt;
            font-weight: 600;
            margin-bottom: 0px;
            line-height: 0.95;
            color: #000;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10.5pt;
            padding: 2px 0 0 0;
        }
        .info-row .left { text-align: left; }
        .info-row .center { text-align: center; }
        .info-row .right { text-align: right; }

        /* Section Block */
        .section-block {
            margin-top: 10px;
        }
        .section-header-bar {
            background: #e8edf5;
            border: 1px solid #000;
            padding: 3px 8px;
            font-weight: 700;
            font-size: 10.5pt;
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }

        /* Table Section - Two Column Layout */
        .table-section {
            display: flex;
            gap: 12px;
        }
        .table-column {
            flex: 1;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
        }
        table th, table td {
            border: 1px solid #000;
            padding: 3px 5px;
            text-align: center;
            vertical-align: middle;
        }
        table td {
            background: #ffffff;
        }
        table th {
            background: #e8e8e8;
            font-weight: 700;
            font-size: 9pt;
            text-transform: uppercase;
            border: 1px solid #000;
        }

        /* Footer Signatures Section */
        .footer-section {
            margin-top: 30px;
            padding-top: 0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            page-break-inside: avoid;
        }
        .signature-block {
            text-align: center;
            min-width: 160px;
        }
        .signature-line {
            border-top: 1px solid #000;
            padding-top: 5px;
            font-size: 10pt;
            font-weight: 600;
        }

        @media print {
            @page {
                size: A4 portrait;
                margin-top: 0.3in;
                margin-right: 0.4in;
                margin-bottom: 0.3in;
                margin-left: 0.4in;
            }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            tr { page-break-inside: avoid; }
            .section-header-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    ${bodyContentHTML}

    <script>
        window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
        };
    <\/script>
</body>
</html>`;

            const printWin = window.open('', '_blank');
            if (printWin) {
                printWin.document.open();
                printWin.document.write(pdfHTML);
                printWin.document.close();
            } else {
                alert("পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।");
            }
        }

        function closeExamMarksheetPreview() {
            document.getElementById('exam-marksheet-preview-modal').classList.remove('active');
        }

        function printExamMarksheetDocument() {
            window.print();
        }

        // --- SUBVIEW 2: RESULT REPORT CONTROLLERS ---
        function toggleResultReportSubTab(subtab) {
            document.querySelectorAll('.result-toggle-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.result-subtab-content').forEach(cont => cont.classList.remove('active'));

            document.getElementById('btn-result-' + subtab).classList.add('active');
            document.getElementById('result-subtab-' + subtab).classList.add('active');

            if (subtab === 'input') {
                updateInputMarkStudentDropdown();
                generateSubjectMarkInputFields();
            } else {
                updateSearchResultStudentDropdown();
            }
        }

        function updateSearchResultStudentDropdown() {
            const classVal = document.getElementById('search-result-class').value;
            const el = document.getElementById('search-result-student');
            if (!el) return;

            const students = loadStudents();
            const classStudents = students.filter(s => s.class === classVal);

            if (classStudents.length === 0) {
                el.innerHTML = `<option value="" disabled selected>-- No Students in this Class --</option>`;
            } else {
                el.innerHTML = classStudents.map(s => `<option value="${s.id}">${s.name} (Roll: ${s.roll})</option>`).join('');
            }
        }

        function updateInputMarkStudentDropdown() {
            const classVal = document.getElementById('input-mark-class').value;
            const el = document.getElementById('input-mark-student');
            if (!el) return;

            const students = loadStudents();
            const classStudents = students.filter(s => s.class === classVal);

            if (classStudents.length === 0) {
                el.innerHTML = `<option value="" disabled selected>-- No Students in this Class --</option>`;
            } else {
                el.innerHTML = classStudents.map(s => `<option value="${s.id}">${s.name} (Roll: ${s.roll})</option>`).join('');
            }
        }

        function generateSubjectMarkInputFields() {
            const classVal = document.getElementById('input-mark-class').value;
            const container = document.getElementById('subject-marks-inputs-container');
            const alertEl = document.getElementById('no-subjects-alert');
            const examVal = document.getElementById('input-mark-exam').value;
            if (!container) return;

            const subMap = loadSubjects();
            let subjects = subMap[classVal] || [];

            if (classVal === 'Nine' || classVal === 'Ten') {
                const students = loadStudents();
                const selectedStudentId = document.getElementById('input-mark-student').value;
                const student = students.find(s => s.id === selectedStudentId);
                if (student) {
                    let studentGroup = (student.group || student.branch || student.section || '').toLowerCase();
                    if (!studentGroup || studentGroup === 'none' || studentGroup === 'a') {
                        const nameLower = (student.name || '').toLowerCase().trim();
                        if (nameLower.endsWith('s') || nameLower.includes(' s') || nameLower.includes('— s') || nameLower.includes('- s')) {
                            studentGroup = 'science';
                        } else if (nameLower.endsWith('a') || nameLower.includes(' a') || nameLower.includes('— a') || nameLower.includes('- a')) {
                            studentGroup = 'humanities';
                        } else if (nameLower.endsWith('b') || nameLower.includes(' b') || nameLower.includes('— b') || nameLower.includes('- b')) {
                            studentGroup = 'business';
                        }
                    }
                    const matchGroupAndSection = (stdGrp, sec) => {
                        const sg = stdGrp.toLowerCase().trim();
                        const sc = sec.toLowerCase().trim();
                        if (sg === sc) return true;
                        if (sg === 'science' && sc === 'a') return true;
                        if (sg === 'humanities' && sc === 'b') return true;
                        if (sg === 'business' && sc === 'c') return true;
                        return false;
                    };
                    subjects = subjects.filter(sub => {
                        if (!sub.section || sub.section === 'All') return true;
                        const subSecs = sub.section.split(',').map(s => s.trim().toLowerCase());
                        return subSecs.some(sec => matchGroupAndSection(studentGroup, sec));
                    });
                }
            }

            if (subjects.length === 0) {
                container.innerHTML = "";
                alertEl.style.display = "block";
                document.getElementById('save-marks-btn').style.display = "none";
                return;
            }

            alertEl.style.display = "none";
            document.getElementById('save-marks-btn').style.display = "block";

            const examTypes = loadExamTypes();
            const examType = examTypes.find(t => t.name === examVal) || { defaultCQ: 100, defaultMCQ: 0, defaultPractical: 0, overrides: [] };

            let html = "";
            subjects.forEach(sub => {
                const dist = getSubjectDistribution(sub.code, examType);
                let inputsHTML = "";
                if (dist.cq > 0) {
                    inputsHTML += `
                        <div style="flex:1; min-width:80px;">
                            <span style="font-size:0.75rem; color:var(--muted-text);">CQ (Max ${dist.cq})</span>
                            <input type="number" class="form-control component-mark-input" data-code="${sub.code}" data-component="cq" min="0" max="${dist.cq}" placeholder="CQ" required>
                        </div>
                    `;
                }
                if (dist.mcq > 0) {
                    inputsHTML += `
                        <div style="flex:1; min-width:80px;">
                            <span style="font-size:0.75rem; color:var(--muted-text);">MCQ (Max ${dist.mcq})</span>
                            <input type="number" class="form-control component-mark-input" data-code="${sub.code}" data-component="mcq" min="0" max="${dist.mcq}" placeholder="MCQ" required>
                        </div>
                    `;
                }
                if (dist.practical > 0) {
                    inputsHTML += `
                        <div style="flex:1; min-width:80px;">
                            <span style="font-size:0.75rem; color:var(--muted-text);">Prac (Max ${dist.practical})</span>
                            <input type="number" class="form-control component-mark-input" data-code="${sub.code}" data-component="practical" min="0" max="${dist.practical}" placeholder="Practical" required>
                        </div>
                    `;
                }

                html += `
                    <div class="form-group" style="background:rgba(255,255,255,0.01); padding:12px; border-radius:8px; border:1px solid var(--glass-border); margin-bottom:15px;">
                        <label style="color:#fff; font-weight:600; display:block; margin-bottom:8px;">${sub.name} (${sub.code})</label>
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            ${inputsHTML}
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
            loadExistingStudentMarks();
        }

        function loadExistingStudentMarks() {
            const studentId = document.getElementById('input-mark-student').value;
            const examVal = document.getElementById('input-mark-exam').value;
            if (!studentId) return;

            const savedMarks = loadStudentMarks();
            const key = `marks_${studentId}_${examVal}`;
            const studentExamMarks = savedMarks[key] || {};

            const inputs = document.querySelectorAll('.component-mark-input');
            inputs.forEach(input => {
                const code = input.getAttribute('data-code');
                const comp = input.getAttribute('data-component');
                const markVal = studentExamMarks[code];

                if (markVal !== undefined) {
                    if (typeof markVal === 'object') {
                        input.value = markVal[comp] !== undefined ? markVal[comp] : "";
                    } else {
                        if (comp === 'cq') {
                            input.value = markVal;
                        } else {
                            input.value = "";
                        }
                    }
                } else {
                    input.value = "";
                }
            });
        }

        function saveStudentMarks() {
            const studentId = document.getElementById('input-mark-student').value;
            const examVal = document.getElementById('input-mark-exam').value;
            if (!studentId) {
                alert("Please select a student first!");
                return;
            }

            const inputs = document.querySelectorAll('.component-mark-input');
            const marksData = {};
            let isValid = true;

            const subjectCodes = new Set();
            inputs.forEach(input => {
                subjectCodes.add(input.getAttribute('data-code'));
                input.style.borderColor = "var(--glass-border)";
            });

            const examTypes = loadExamTypes();
            const examType = examTypes.find(t => t.name === examVal) || { defaultCQ: 100, defaultMCQ: 0, defaultPractical: 0, overrides: [] };

            subjectCodes.forEach(code => {
                const dist = getSubjectDistribution(code, examType);
                let cqVal = 0;
                let mcqVal = 0;
                let pracVal = 0;

                const cqInput = document.querySelector(`.component-mark-input[data-code="${code}"][data-component="cq"]`);
                const mcqInput = document.querySelector(`.component-mark-input[data-code="${code}"][data-component="mcq"]`);
                const pracInput = document.querySelector(`.component-mark-input[data-code="${code}"][data-component="practical"]`);

                if (cqInput) {
                    const val = parseInt(cqInput.value, 10);
                    if (isNaN(val) || val < 0 || val > dist.cq) {
                        isValid = false;
                        cqInput.style.borderColor = "var(--neon-pink)";
                    } else {
                        cqVal = val;
                    }
                }
                if (mcqInput) {
                    const val = parseInt(mcqInput.value, 10);
                    if (isNaN(val) || val < 0 || val > dist.mcq) {
                        isValid = false;
                        mcqInput.style.borderColor = "var(--neon-pink)";
                    } else {
                        mcqVal = val;
                    }
                }
                if (pracInput) {
                    const val = parseInt(pracInput.value, 10);
                    if (isNaN(val) || val < 0 || val > dist.practical) {
                        isValid = false;
                        pracInput.style.borderColor = "var(--neon-pink)";
                    } else {
                        pracVal = val;
                    }
                }

                if (isValid) {
                    const total = cqVal + mcqVal + pracVal;
                    marksData[code] = {
                        total: total,
                        cq: cqVal,
                        mcq: mcqVal,
                        practical: pracVal
                    };
                }
            });

            if (!isValid) {
                alert("Please enter valid marks for all subjects according to their distribution!");
                return;
            }

            const savedMarks = loadStudentMarks();
            const key = `marks_${studentId}_${examVal}`;
            savedMarks[key] = marksData;

            localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
            alert("Student Subject Marks saved successfully!");
        }

        function getGradeDetails(mark, subjectTotal = 100, passMarkPercent = 33, markData = null, dist = null) {
            const rules = loadMarkingSystem();
            const sortedRules = (Array.isArray(rules) && rules.length > 0 ? [...rules] : [...DEFAULT_GRADE_RULES]).sort((a, b) => b.min - a.min);
            const failRule = sortedRules.find(r => r.gp === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: "F", gp: 0.0 };

            // Check component-wise pass criteria (Written/CQ, MCQ, Practical minimum passMarkPercent%)
            if (markData && typeof markData === 'object' && dist && typeof dist === 'object') {
                if (dist.cq > 0) {
                    const cqVal = markData.cq !== undefined && markData.cq !== "" && markData.cq !== "-" ? parseFloat(markData.cq) : 0;
                    const cqPercent = (cqVal / dist.cq) * 100;
                    if (isNaN(cqVal) || cqPercent < passMarkPercent) {
                        return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
                    }
                }
                if (dist.mcq > 0) {
                    const mcqVal = markData.mcq !== undefined && markData.mcq !== "" && markData.mcq !== "-" ? parseFloat(markData.mcq) : 0;
                    const mcqPercent = (mcqVal / dist.mcq) * 100;
                    if (isNaN(mcqVal) || mcqPercent < passMarkPercent) {
                        return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
                    }
                }
                if (dist.practical > 0) {
                    const pracVal = markData.practical !== undefined && markData.practical !== "" && markData.practical !== "-" ? parseFloat(markData.practical) : 0;
                    const pracPercent = (pracVal / dist.practical) * 100;
                    if (isNaN(pracVal) || pracPercent < passMarkPercent) {
                        return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
                    }
                }
            }

            const percentageScore = subjectTotal > 0 ? (mark / subjectTotal) * 100 : 0;

            if (percentageScore < passMarkPercent) {
                return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
            }

            // Find matching rule based on customized marking system
            let match = sortedRules.find(r => percentageScore >= r.min && percentageScore <= r.max);
            if (!match) {
                // If boundary lands on a float (e.g. 79.5% between 79 and 80), match top boundary
                match = sortedRules.find(r => (percentageScore + 0.001) >= r.min);
            }
            if (match) return { name: match.name, gp: parseFloat(match.gp) };

            return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
        }

        // Dynamic Grading & 4th Subject Bonus Calculator
        function calculateOverallResult(subjectResults) {
            let mainSubjectsGP = 0;
            let mainSubjectCount = 0;
            let optionalBonusGP = 0;
            let isFailed = false;

            const rules = loadMarkingSystem();
            const sortedRules = (Array.isArray(rules) && rules.length > 0 ? [...rules] : [...DEFAULT_GRADE_RULES]).sort((a, b) => b.min - a.min);
            const failRule = sortedRules.find(r => r.gp === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: "F", gp: 0.0 };

            (subjectResults || []).forEach(sub => {
                const isOptional = !!sub.isOptional;
                const gp = sub.gp !== undefined ? parseFloat(sub.gp) : 0;
                const isAbsent = !!sub.isAbsent;

                if (isOptional) {
                    // 4th Subject Role: Points above 2.00 GP added as bonus
                    if (!isAbsent && gp > 2.00) {
                        optionalBonusGP += (gp - 2.00);
                    }
                    // Failure in optional subject does NOT cause overall failure
                } else {
                    // Main / Compulsory / Elective Subject
                    mainSubjectCount++;
                    mainSubjectsGP += gp;
                    if (gp === 0 || isAbsent) {
                        isFailed = true;
                    }
                }
            });

            if (mainSubjectCount === 0) {
                mainSubjectCount = subjectResults.length || 1;
            }

            if (isFailed) {
                return {
                    gpa: 0.00,
                    gpaString: "0.00",
                    grade: failRule.name,
                    status: "Failed",
                    isFailed: true,
                    mainSubjectsGP: mainSubjectsGP,
                    optionalBonusGP: optionalBonusGP,
                    totalGP: mainSubjectsGP + optionalBonusGP
                };
            }

            // Determine maximum scale GP dynamically (defaults to 5.00 if highest is 5.0)
            const gps = sortedRules.map(r => parseFloat(r.gp) || 0);
            const maxGP = gps.length > 0 ? Math.max(...gps, 1.0) : 5.00;

            const rawGPA = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
            const finalGPA = Math.min(maxGP, rawGPA);

            // Determine overall grade by matching final GPA to rules sorted by GP descending
            const sortedByGP = [...sortedRules].sort((a, b) => parseFloat(b.gp) - parseFloat(a.gp));
            let matchedGrade = sortedByGP.find(r => (finalGPA + 0.001) >= parseFloat(r.gp));
            let grade = matchedGrade ? matchedGrade.name : (finalGPA > 0 ? sortedByGP[sortedByGP.length - 2]?.name || failRule.name : failRule.name);

            return {
                gpa: finalGPA,
                gpaString: finalGPA.toFixed(2),
                grade: grade,
                status: finalGPA === 5.00 ? "Passed (GPA 5.00)" : "Passed",
                isFailed: false,
                mainSubjectsGP: mainSubjectsGP,
                optionalBonusGP: optionalBonusGP,
                totalGP: mainSubjectsGP + optionalBonusGP
            };
        }

        function generateStudentTranscriptCard() {
            const classVal = document.getElementById('search-result-class').value;
            const studentId = document.getElementById('search-result-student').value;
            const examVal = document.getElementById('search-result-exam').value;
            const container = document.getElementById('student-transcript-container');

            if (!studentId) {
                alert("Please select a student to display transcript!");
                return;
            }

            const students = loadStudents();
            const s = students.find(stud => stud.id === studentId);
            if (!s) return;

            const subMap = loadSubjects();
            let subjects = subMap[classVal] || [];

            if (classVal === 'Nine' || classVal === 'Ten') {
                let studentGroup = (s.group || s.branch || s.section || '').toLowerCase();
                if (!studentGroup || studentGroup === 'none' || studentGroup === 'a') {
                    const nameLower = (s.name || '').toLowerCase().trim();
                    if (nameLower.endsWith('s') || nameLower.includes(' s') || nameLower.includes('— s') || nameLower.includes('- s')) {
                        studentGroup = 'science';
                    } else if (nameLower.endsWith('a') || nameLower.includes(' a') || nameLower.includes('— a') || nameLower.includes('- a')) {
                        studentGroup = 'humanities';
                    } else if (nameLower.endsWith('b') || nameLower.includes(' b') || nameLower.includes('— b') || nameLower.includes('- b')) {
                        studentGroup = 'business';
                    }
                }
                const matchGroupAndSection = (stdGrp, sec) => {
                    const sg = stdGrp.toLowerCase().trim();
                    const sc = sec.toLowerCase().trim();
                    if (sg === sc) return true;
                    if (sg === 'science' && sc === 'a') return true;
                    if (sg === 'humanities' && sc === 'b') return true;
                    if (sg === 'business' && sc === 'c') return true;
                    return false;
                };
                subjects = subjects.filter(sub => {
                    if (!sub.section || sub.section === 'All') return true;
                    const subSecs = sub.section.split(',').map(s => s.trim().toLowerCase());
                    return subSecs.some(sec => matchGroupAndSection(studentGroup, sec));
                });
            }

            if (subjects.length === 0) {
                alert("No subjects configured for this class level. Create subjects in the All Subject tab first!");
                return;
            }

            const allMarks = loadStudentMarks();
            const key = `marks_${studentId}_${examVal}`;
            const studentExamMarks = allMarks[key];

            if (!studentExamMarks) {
                container.style.display = "none";
                alert(`No marks entered for "${s.name}" in this exam. Use the Input Marks tab to enter marks or click 'Autofill Mock Marks' to generate testing marks.`);
                return;
            }

            container.style.display = "block";

            document.getElementById('transcript-exam-title').innerText = examVal;
            document.getElementById('transcript-student-name').innerText = s.name;
            document.getElementById('transcript-student-class').innerText = s.class + (s.section ? ` (${s.section})` : '');
            document.getElementById('transcript-student-roll').innerText = s.roll;
            document.getElementById('transcript-student-id').innerText = s.studentId || '-';
            document.getElementById('transcript-student-reg').innerText = s.regNo || '-';
            document.getElementById('transcript-student-group').innerText = s.roll || 'General';

            const examTypes = loadExamTypes();
            const examType = examTypes.find(t => t.name === examVal) || { defaultCQ: 100, defaultMCQ: 0, defaultPractical: 0, overrides: [], passMarkPercent: 33 };
            const passPercent = examType.passMarkPercent !== undefined ? examType.passMarkPercent : 33;

            let subjectResults = [];
            let rowsHTML = "";

            subjects.forEach(sub => {
                const markData = studentExamMarks[sub.code];
                let totalMark = 0;
                let breakdownText = "";
                let isAbsent = false;

                const dist = getSubjectDistribution(sub.code, examType);
                const subjectTotal = dist.cq + dist.mcq + dist.practical;

                if (markData !== undefined) {
                    if (typeof markData === 'object') {
                        totalMark = markData.total !== undefined ? markData.total : 0;
                        isAbsent = !!markData.isAbsent;
                        const components = [];
                        if (markData.cq !== undefined && markData.cq !== "") components.push(`CQ: ${markData.cq}`);
                        if (markData.mcq !== undefined && markData.mcq !== "") components.push(`MCQ: ${markData.mcq}`);
                        if (markData.practical !== undefined && markData.practical !== "") components.push(`Prac: ${markData.practical}`);
                        if (components.length > 0) {
                            breakdownText = `<div style="font-size:0.75rem; color:var(--muted-text); margin-top:2px;">(${components.join(', ')})</div>`;
                        }
                    } else {
                        totalMark = markData;
                    }
                }

                const grade = isAbsent ? { name: "F", gp: 0.0 } : getGradeDetails(totalMark, subjectTotal, passPercent, markData, dist);

                subjectResults.push({
                    code: sub.code,
                    name: sub.name,
                    isOptional: !!sub.isOptional,
                    totalMark: totalMark,
                    subjectTotal: subjectTotal,
                    grade: grade.name,
                    gp: grade.gp,
                    isAbsent: isAbsent
                });

                const isOpt = !!sub.isOptional;
                const optBadge = isOpt ? '<span style="font-size:0.75rem; color:#f59e0b; font-weight:600; font-style:italic;">(4th Subject)</span>' : '';

                rowsHTML += `
                    <tr>
                        <td style="font-family: monospace;">${sub.code}</td>
                        <td style="text-align:left; color:#fff; font-weight:500;">
                            ${sub.name} ${optBadge}
                            ${breakdownText}
                        </td>
                        <td><strong>${isAbsent ? 'ABS' : totalMark}</strong></td>
                        <td><span style="color:${grade.gp >= 1 ? 'var(--neon-green)' : 'var(--neon-pink)'}; font-weight:bold;">${grade.name}</span></td>
                        <td>${grade.gp.toFixed(2)}</td>
                    </tr>
                `;
            });

            document.getElementById('transcript-rows').innerHTML = rowsHTML;

            const overall = calculateOverallResult(subjectResults);

            document.getElementById('transcript-total-gpa').innerText = overall.gpaString;

            const finalGradeEl = document.getElementById('transcript-final-grade');
            finalGradeEl.innerText = overall.grade;
            finalGradeEl.style.color = overall.isFailed ? "var(--neon-pink)" : "var(--neon-green)";

            const statusEl = document.getElementById('transcript-status');
            statusEl.innerText = overall.status;
            statusEl.style.color = overall.isFailed ? "var(--neon-pink)" : "var(--neon-cyan)";

            setTimeout(() => {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }

        function quickAutofillMockMarks() {
            const classVal = document.getElementById('search-result-class').value;
            const studentId = document.getElementById('search-result-student').value;
            const examVal = document.getElementById('search-result-exam').value;

            if (!studentId) {
                alert("Please select a student first!");
                return;
            }

            const subMap = loadSubjects();
            let subjects = subMap[classVal] || [];

            if (classVal === 'Nine' || classVal === 'Ten') {
                const students = loadStudents();
                const s = students.find(stud => stud.id === studentId);
                if (s) {
                    let studentGroup = (s.group || s.branch || s.section || '').toLowerCase();
                    if (!studentGroup || studentGroup === 'none' || studentGroup === 'a') {
                        const nameLower = (s.name || '').toLowerCase().trim();
                        if (nameLower.endsWith('s') || nameLower.includes(' s') || nameLower.includes('— s') || nameLower.includes('- s')) {
                            studentGroup = 'science';
                        } else if (nameLower.endsWith('a') || nameLower.includes(' a') || nameLower.includes('— a') || nameLower.includes('- a')) {
                            studentGroup = 'humanities';
                        } else if (nameLower.endsWith('b') || nameLower.includes(' b') || nameLower.includes('— b') || nameLower.includes('- b')) {
                            studentGroup = 'business';
                        }
                    }
                    const matchGroupAndSection = (stdGrp, sec) => {
                        const sg = stdGrp.toLowerCase().trim();
                        const sc = sec.toLowerCase().trim();
                        if (sg === sc) return true;
                        if (sg === 'science' && sc === 'a') return true;
                        if (sg === 'humanities' && sc === 'b') return true;
                        if (sg === 'business' && sc === 'c') return true;
                        return false;
                    };
                    subjects = subjects.filter(sub => {
                        if (!sub.section || sub.section === 'All') return true;
                        const subSecs = sub.section.split(',').map(s => s.trim().toLowerCase());
                        return subSecs.some(sec => matchGroupAndSection(studentGroup, sec));
                    });
                }
            }

            if (subjects.length === 0) {
                alert("No subjects created for this class. Add subjects in the All Subject tab first!");
                return;
            }

            const mockMarks = {};
            const examTypes = loadExamTypes();
            const examType = examTypes.find(t => t.name === examVal) || { defaultCQ: 100, defaultMCQ: 0, defaultPractical: 0, overrides: [] };

            subjects.forEach(sub => {
                const dist = getSubjectDistribution(sub.code, examType);
                const cqMark = dist.cq > 0 ? Math.floor(Math.random() * (dist.cq - dist.cq * 0.4) + dist.cq * 0.4) : 0;
                const mcqMark = dist.mcq > 0 ? Math.floor(Math.random() * (dist.mcq - dist.mcq * 0.4) + dist.mcq * 0.4) : 0;
                const pracMark = dist.practical > 0 ? Math.floor(Math.random() * (dist.practical - dist.practical * 0.4) + dist.practical * 0.4) : 0;

                mockMarks[sub.code] = {
                    total: cqMark + mcqMark + pracMark,
                    cq: dist.cq > 0 ? cqMark : undefined,
                    mcq: dist.mcq > 0 ? mcqMark : undefined,
                    practical: dist.practical > 0 ? pracMark : undefined
                };
            });

            const saved = loadStudentMarks();
            const key = `marks_${studentId}_${examVal}`;
            saved[key] = mockMarks;

            localStorage.setItem('school_student_marks', JSON.stringify(saved));
            alert("Autofilled dynamic testing marks successfully!");
            generateStudentTranscriptCard();
        }

        function printStudentTranscript() {
            window.print();
        }

        // --- SUBVIEW 3: MARKING SYSTEM CONTROLLERS ---
        let isMarkingSystemTableEditMode = false;
        let editingGradeRuleId = null;

        const GRADING_PRESETS = {
            'bd_national': [
                { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
                { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
                { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
                { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
                { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
                { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
                { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
            ],
            'primary_scale': [
                { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
                { id: "2", name: "A", min: 60, max: 79, gp: 4.0 },
                { id: "3", name: "B", min: 50, max: 59, gp: 3.0 },
                { id: "4", name: "C", min: 40, max: 49, gp: 2.0 },
                { id: "5", name: "D", min: 33, max: 39, gp: 1.0 },
                { id: "6", name: "F", min: 0, max: 32, gp: 0.0 }
            ],
            'scale_4': [
                { id: "1", name: "A+", min: 80, max: 100, gp: 4.00 },
                { id: "2", name: "A", min: 75, max: 79, gp: 3.75 },
                { id: "3", name: "A-", min: 70, max: 74, gp: 3.50 },
                { id: "4", name: "B+", min: 65, max: 69, gp: 3.25 },
                { id: "5", name: "B", min: 60, max: 64, gp: 3.00 },
                { id: "6", name: "B-", min: 55, max: 59, gp: 2.75 },
                { id: "7", name: "C+", min: 50, max: 54, gp: 2.50 },
                { id: "8", name: "C", min: 45, max: 49, gp: 2.25 },
                { id: "9", name: "D", min: 40, max: 44, gp: 2.00 },
                { id: "10", name: "F", min: 0, max: 39, gp: 0.00 }
            ]
        };

        function renderMarkingSystem() {
            const container = document.getElementById('grade-rules-rows');
            if (!container) return;

            const toggleBtn = document.getElementById('btn-toggle-table-edit');
            const actionsBar = document.getElementById('table-edit-actions');
            const rules = loadMarkingSystem();

            // Sort by min descending
            rules.sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));

            if (toggleBtn) {
                toggleBtn.innerHTML = isMarkingSystemTableEditMode ? '👁️ View Mode' : '✏️ Bulk Edit Table';
                toggleBtn.style.background = isMarkingSystemTableEditMode ? '#fef3c7' : '#eff6ff';
                toggleBtn.style.borderColor = isMarkingSystemTableEditMode ? '#f59e0b' : '#93c5fd';
                toggleBtn.style.color = isMarkingSystemTableEditMode ? '#b45309' : '#1d4ed8';
            }

            if (actionsBar) {
                actionsBar.style.display = isMarkingSystemTableEditMode ? 'flex' : 'none';
            }

            let html = "";

            if (!isMarkingSystemTableEditMode) {
                // Regular view mode with interactive edit/delete buttons
                rules.forEach((rule) => {
                    const isFail = parseFloat(rule.gp) === 0 || rule.name === 'F';
                    const gradeColor = isFail ? '#dc2626' : (rule.gp >= 4.0 ? '#16a34a' : (rule.gp >= 3.0 ? '#2563eb' : '#d97706'));
                    const gradeBg = isFail ? '#fef2f2' : (rule.gp >= 4.0 ? '#f0fdf4' : (rule.gp >= 3.0 ? '#eff6ff' : '#fffbeb'));
                    const gradeBorder = isFail ? '#fca5a5' : (rule.gp >= 4.0 ? '#bbf7d0' : (rule.gp >= 3.0 ? '#bfdbfe' : '#fde68a'));
                    const isBeingEdited = editingGradeRuleId === rule.id;
                    const rowHighlight = isBeingEdited ? 'background-color: #fefce8; border: 2px solid #eab308;' : 'border-bottom:1px solid #f1f5f9;';

                    html += `
                        <tr style="${rowHighlight}">
                            <td style="padding:10px 14px; text-align:left;">
                                <span style="display:inline-flex; align-items:center; justify-content:center; min-width:46px; padding:3px 10px; border-radius:6px; font-weight:800; font-size:1.05rem; color:${gradeColor}; background:${gradeBg}; border:1.5px solid ${gradeBorder};">
                                    ${rule.name}
                                </span>
                                ${isBeingEdited ? '<span style="font-size:0.75rem; color:#b45309; font-weight:700; margin-left:6px;">(Editing)</span>' : ''}
                            </td>
                            <td style="padding:10px 14px; text-align:center;">
                                <span style="font-weight:800; font-size:0.96rem; color:#0f172a; background:#f8fafc; border:1px solid #cbd5e1; padding:3px 14px; border-radius:14px; display:inline-flex; align-items:center; gap:4px;">
                                    🎯 <strong>${rule.min}%</strong> থেকে <strong>${rule.max}%</strong>
                                </span>
                            </td>
                            <td style="padding:10px 14px; text-align:center; font-weight:800; font-size:1rem; color:#0f172a;">
                                <span style="color:#0f766e; background:#f0fdfa; border:1px solid #99f6e4; padding:3px 12px; border-radius:6px; font-weight:800;">
                                    ${parseFloat(rule.gp).toFixed(2)}
                                </span>
                            </td>
                            <td style="padding:10px 14px; text-align:center;">
                                <div style="display:flex; gap:6px; justify-content:center;">
                                    <button type="button" class="action-btn-sm btn-view-card" onclick="editGradeRule('${rule.id}')" 
                                        style="padding:5px 12px; font-size:0.84rem; font-weight:700; background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; border-radius:6px; cursor:pointer;" title="Edit this rule">
                                        ✏️ Edit
                                    </button>
                                    <button type="button" class="action-btn-sm" onclick="deleteGradeRule('${rule.id}')" 
                                        style="padding:5px 8px; font-size:0.84rem; font-weight:700; background:#fef2f2; border:1px solid #fca5a5; color:#dc2626; border-radius:6px; cursor:pointer;" title="Delete rule">
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            } else {
                // Table Bulk Edit Mode: Render editable input rows
                rules.forEach((rule, idx) => {
                    html += `
                        <tr class="bulk-grade-row" data-id="${rule.id}" style="border-bottom:1px solid #e2e8f0; background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                            <td style="padding:8px 10px; text-align:left;">
                                <input type="text" class="bulk-grade-name form-control" value="${rule.name || ''}" placeholder="A+" required
                                    style="width:85px; font-weight:800; font-size:0.95rem; text-align:center; padding:6px; border:2px solid #94a3b8; border-radius:6px; background:#ffffff; color:#0f172a;">
                            </td>
                            <td style="padding:8px 10px; text-align:center;">
                                <div style="display:inline-flex; align-items:center; justify-content:center; gap:6px; flex-wrap:nowrap;">
                                    <input type="number" class="bulk-grade-min form-control" value="${rule.min}" min="0" max="100" placeholder="Min %" required
                                        style="width:70px; font-weight:800; font-size:0.95rem; text-align:center; padding:6px; border:2px solid #94a3b8; border-radius:6px; background:#ffffff; color:#0f172a;">
                                    <span style="font-weight:700; color:#475569; font-size:0.85rem;">% থেকে</span>
                                    <input type="number" class="bulk-grade-max form-control" value="${rule.max}" min="0" max="100" placeholder="Max %" required
                                        style="width:70px; font-weight:800; font-size:0.95rem; text-align:center; padding:6px; border:2px solid #94a3b8; border-radius:6px; background:#ffffff; color:#0f172a;">
                                    <span style="font-weight:700; color:#475569; font-size:0.85rem;">%</span>
                                </div>
                            </td>
                            <td style="padding:8px 10px; text-align:center;">
                                <input type="number" step="0.01" min="0" max="10" class="bulk-grade-gp form-control" value="${parseFloat(rule.gp).toFixed(2)}" placeholder="5.00" required
                                    style="width:80px; font-weight:800; font-size:0.95rem; text-align:center; padding:6px; border:2px solid #94a3b8; border-radius:6px; background:#ffffff; color:#0f172a; margin:0 auto; display:block;">
                            </td>
                            <td style="padding:8px 10px; text-align:center;">
                                <button type="button" class="action-btn-sm" onclick="deleteTableRowRule(this)"
                                    style="padding:6px 10px; font-size:0.85rem; font-weight:700; background:#fef2f2; border:1px solid #fca5a5; color:#dc2626; border-radius:6px; cursor:pointer;" title="Remove this row">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            container.innerHTML = html;
        }

        function toggleMarkingSystemTableEdit() {
            isMarkingSystemTableEditMode = !isMarkingSystemTableEditMode;
            renderMarkingSystem();
        }

        function cancelTableEditMode() {
            isMarkingSystemTableEditMode = false;
            renderMarkingSystem();
        }

        function addTableRowGradeRule() {
            const container = document.getElementById('grade-rules-rows');
            if (!container) return;

            const newId = Date.now().toString();
            const tr = document.createElement('tr');
            tr.className = 'bulk-grade-row';
            tr.setAttribute('data-id', newId);
            tr.style.borderBottom = '1px solid #e2e8f0';
            tr.style.backgroundColor = '#f0fdf4';

            tr.innerHTML = `
                <td style="padding:8px 10px; text-align:left;">
                    <input type="text" class="bulk-grade-name form-control" value="" placeholder="New Grade" required
                        style="width:85px; font-weight:800; font-size:0.95rem; text-align:center; padding:6px; border:2px solid #16a34a; border-radius:6px; background:#ffffff; color:#0f172a;">
                </td>
                <td style="padding:8px 10px; text-align:center;">
                    <div style="display:inline-flex; align-items:center; justify-content:center; gap:6px; flex-wrap:nowrap;">
                        <input type="number" class="bulk-grade-min form-control" value="0" min="0" max="100" placeholder="Min" required
                            style="width:70px; font-weight:800; font-size:0.95rem; text-align:center; padding:6px; border:2px solid #16a34a; border-radius:6px; background:#ffffff; color:#0f172a;">
                        <span style="font-weight:700; color:#475569; font-size:0.85rem;">% থেকে</span>
                        <input type="number" class="bulk-grade-max form-control" value="0" min="0" max="100" placeholder="Max" required
                            style="width:70px; font-weight:800; font-size:0.95rem; text-align:center; padding:6px; border:2px solid #16a34a; border-radius:6px; background:#ffffff; color:#0f172a;">
                        <span style="font-weight:700; color:#475569; font-size:0.85rem;">%</span>
                    </div>
                </td>
                <td style="padding:8px 10px; text-align:center;">
                    <input type="number" step="0.01" min="0" max="10" class="bulk-grade-gp form-control" value="0.00" placeholder="0.00" required
                        style="width:80px; font-weight:800; font-size:0.95rem; text-align:center; padding:6px; border:2px solid #16a34a; border-radius:6px; background:#ffffff; color:#0f172a; margin:0 auto; display:block;">
                </td>
                <td style="padding:8px 10px; text-align:center;">
                    <button type="button" class="action-btn-sm" onclick="deleteTableRowRule(this)"
                        style="padding:6px 10px; font-size:0.85rem; font-weight:700; background:#fef2f2; border:1px solid #fca5a5; color:#dc2626; border-radius:6px; cursor:pointer;" title="Remove this row">
                        🗑️
                    </button>
                </td>
            `;

            container.appendChild(tr);
            const firstInput = tr.querySelector('.bulk-grade-name');
            if (firstInput) firstInput.focus();
        }

        function deleteTableRowRule(btnOrId) {
            if (typeof btnOrId === 'string') {
                deleteGradeRule(btnOrId);
                return;
            }
            const tr = btnOrId.closest('tr');
            if (tr) {
                tr.remove();
            }
        }

        function saveBulkMarkingSystem() {
            const rows = document.querySelectorAll('#grade-rules-rows .bulk-grade-row');
            if (!rows || rows.length === 0) {
                alert("At least one grade rule must exist!");
                return;
            }

            const updatedRules = [];
            let isValid = true;
            let errorMessage = "";

            rows.forEach((row, index) => {
                const id = row.getAttribute('data-id') || `rule_${Date.now()}_${index}`;
                const nameInput = row.querySelector('.bulk-grade-name');
                const minInput = row.querySelector('.bulk-grade-min');
                const maxInput = row.querySelector('.bulk-grade-max');
                const gpInput = row.querySelector('.bulk-grade-gp');

                const name = nameInput ? nameInput.value.trim() : "";
                const min = minInput ? parseFloat(minInput.value) : NaN;
                const max = maxInput ? parseFloat(maxInput.value) : NaN;
                const gp = gpInput ? parseFloat(gpInput.value) : NaN;

                if (!name) {
                    isValid = false;
                    errorMessage = `Row #${index + 1}: Letter Grade cannot be empty!`;
                    return;
                }
                if (isNaN(min) || min < 0 || min > 100) {
                    isValid = false;
                    errorMessage = `Row #${index + 1} (${name}): Min % must be between 0 and 100!`;
                    return;
                }
                if (isNaN(max) || max < 0 || max > 100) {
                    isValid = false;
                    errorMessage = `Row #${index + 1} (${name}): Max % must be between 0 and 100!`;
                    return;
                }
                if (min > max) {
                    isValid = false;
                    errorMessage = `Row #${index + 1} (${name}): Min % (${min}%) cannot be greater than Max % (${max}%)!`;
                    return;
                }
                if (isNaN(gp) || gp < 0) {
                    isValid = false;
                    errorMessage = `Row #${index + 1} (${name}): Grade Point must be a valid non-negative number!`;
                    return;
                }

                updatedRules.push({
                    id: id,
                    name: name,
                    min: min,
                    max: max,
                    gp: gp
                });
            });

            if (!isValid) {
                alert(errorMessage);
                return;
            }

            // Sort rules by min percentage descending
            updatedRules.sort((a, b) => b.min - a.min);

            localStorage.setItem('school_marking_system', JSON.stringify(updatedRules));
            isMarkingSystemTableEditMode = false;
            resetGradeRuleForm();
            renderMarkingSystem();
            alert("Grading scale updated and saved successfully! (গ্রেডিং স্কেল সফলভাবে সংরক্ষিত হয়েছে)");
        }

        function saveGradeRule(event) {
            event.preventDefault();
            const id = document.getElementById('grade-rule-id').value;
            const name = document.getElementById('grade-name').value.trim();
            const min = parseFloat(document.getElementById('grade-min').value);
            const max = parseFloat(document.getElementById('grade-max').value);
            const gp = parseFloat(document.getElementById('grade-point').value);

            if (!name) {
                alert("Please enter a letter grade name (e.g. A+, A, B)!");
                return;
            }

            if (isNaN(min) || min < 0 || min > 100) {
                alert("Minimum % must be between 0 and 100!");
                return;
            }

            if (isNaN(max) || max < 0 || max > 100) {
                alert("Maximum % must be between 0 and 100!");
                return;
            }

            if (min > max) {
                alert("Minimum % cannot be greater than maximum %!");
                return;
            }

            if (isNaN(gp) || gp < 0) {
                alert("Grade Point must be a positive number (e.g. 5.00, 4.00)!");
                return;
            }

            const rules = loadMarkingSystem();

            if (id) {
                // Update existing rule
                const idx = rules.findIndex(r => r.id === id);
                if (idx !== -1) {
                    rules[idx] = { id, name, min, max, gp };
                } else {
                    rules.push({ id, name, min, max, gp });
                }
            } else {
                // Create new rule
                rules.push({ id: Date.now().toString(), name, min, max, gp });
            }

            // Sort descending by min %
            rules.sort((a, b) => b.min - a.min);

            localStorage.setItem('school_marking_system', JSON.stringify(rules));
            resetGradeRuleForm();
            renderMarkingSystem();
            alert(`Grade rule "${name}" saved successfully!`);
        }

        function editGradeRule(id) {
            const rules = loadMarkingSystem();
            const rule = rules.find(r => r.id === id);
            if (!rule) return;

            editingGradeRuleId = id;

            document.getElementById('grade-rule-id').value = rule.id;
            document.getElementById('grade-name').value = rule.name;
            document.getElementById('grade-min').value = rule.min;
            document.getElementById('grade-max').value = rule.max;
            document.getElementById('grade-point').value = rule.gp;

            const titleEl = document.getElementById('grade-form-title');
            if (titleEl) {
                titleEl.innerHTML = `✏️ Edit Grade Rule: <span style="color:#1d4ed8;">${rule.name}</span>`;
            }

            const saveBtn = document.getElementById('btn-save-grade-rule');
            if (saveBtn) {
                saveBtn.innerHTML = `💾 Update Grade Rule (${rule.name})`;
            }

            renderMarkingSystem();

            // Smooth scroll to form if needed
            const formCard = document.getElementById('grade-rule-form');
            if (formCard) {
                formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function deleteGradeRule(id) {
            const rules = loadMarkingSystem();
            const targetRule = rules.find(r => r.id === id);
            const targetName = targetRule ? targetRule.name : 'this rule';

            if (!confirm(`Are you sure you want to delete "${targetName}" from the grading scale?`)) return;

            const filtered = rules.filter(r => r.id !== id);
            if (filtered.length === 0) {
                alert("You cannot delete all grade rules! At least one grade rule must remain.");
                return;
            }

            localStorage.setItem('school_marking_system', JSON.stringify(filtered));
            if (editingGradeRuleId === id) {
                resetGradeRuleForm();
            } else {
                renderMarkingSystem();
            }
            alert(`Grade rule "${targetName}" deleted successfully!`);
        }

        function resetGradeRuleForm() {
            editingGradeRuleId = null;
            const form = document.getElementById('grade-rule-form');
            if (form) form.reset();
            const idInput = document.getElementById('grade-rule-id');
            if (idInput) idInput.value = "";

            const titleEl = document.getElementById('grade-form-title');
            if (titleEl) {
                titleEl.innerHTML = `⚙️ Customize Grade Threshold (% Percentage Based)`;
            }

            const saveBtn = document.getElementById('btn-save-grade-rule');
            if (saveBtn) {
                saveBtn.innerHTML = `💾 Save Grade Rule`;
            }

            renderMarkingSystem();
        }

        function applyGradingPreset(presetKey) {
            const preset = GRADING_PRESETS[presetKey];
            if (!preset) return;

            const presetNames = {
                'bd_national': '🇧🇩 BD National Standard (5.00 Scale)',
                'primary_scale': '🏫 Primary 5.00 Scale',
                'scale_4': '🎓 4.00 Scale (College / University)'
            };

            const name = presetNames[presetKey] || presetKey;
            if (!confirm(`Apply the "${name}" preset scale? This will replace the current grading scale.`)) return;

            localStorage.setItem('school_marking_system', JSON.stringify(preset));
            resetGradeRuleForm();
            renderMarkingSystem();
            alert(`Applied "${name}" preset successfully!`);
        }

        function resetMarkingSystemToDefault() {
            if (!confirm("Are you sure you want to restore standard grading thresholds? This will overwrite your current changes.")) return;
            localStorage.setItem('school_marking_system', JSON.stringify(DEFAULT_GRADE_RULES));
            resetGradeRuleForm();
            renderMarkingSystem();
            alert("Grading scale restored to defaults!");
        }

        // --- SUBVIEW 4: ALL SUBJECT CONTROLLERS ---
        function getSubjectNameBangla(sub) {
            if (!sub) return '';
            if (sub.nameBn && sub.nameBn.trim()) return sub.nameBn;

            const name = (sub.name || '').trim();
            const cleanLower = name.toLowerCase();

            const dictionary = {
                'bangla sahitya': 'বাংলা সাহিত্য',
                'bangla 1st': 'বাংলা ১ম পত্র',
                'bangla 1st paper': 'বাংলা ১ম পত্র',
                'bangla bhashar byakaran and nirmiti': 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
                'bangla 2nd': 'বাংলা ২য় পত্র',
                'bangla 2nd paper': 'বাংলা ২য় পত্র',
                'english for today': 'ইংরেজি ফর টুডে',
                'english 1st': 'ইংরেজি ১ম পত্র',
                'english 1st paper': 'ইংরেজি ১ম পত্র',
                'english grammar and composition': 'ইংরেজি ব্যাকরণ ও রচনা',
                'english 2nd': 'ইংরেজি ২য় পত্র',
                'english 2nd paper': 'ইংরেজি ২য় পত্র',
                'mathematics': 'গণিত',
                'math': 'গণিত',
                'general mathematics': 'সাধারণ গণিত',
                'higher mathematics': 'উচ্চতর গণিত',
                'science': 'বিজ্ঞান',
                'general science': 'সাধারণ বিজ্ঞান',
                'physics': 'পদার্থবিজ্ঞান',
                'chemistry': 'রসায়ন',
                'biology': 'জীববিজ্ঞান',
                'bangladesh and global studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
                'bangladesh & global studies': 'বাংলাদেশ ও বিশ্বপরিচয়',
                'information and communication technology': 'তথ্য ও যোগাযোগ প্রযুক্তি',
                'information & communication technology': 'তথ্য ও যোগাযোগ প্রযুক্তি',
                'ict': 'তথ্য ও যোগাযোগ প্রযুক্তি',
                'agriculture studies': 'কৃষি শিক্ষা',
                'agricultural studies': 'কৃষি শিক্ষা',
                'islamic studies': 'ইসলাম ও নৈতিক শিক্ষা',
                'islam and moral education': 'ইসলাম ও নৈতিক শিক্ষা',
                'islam & moral education': 'ইসলাম ও নৈতিক শিক্ষা',
                'hindu religion studies': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'hindu religion and moral education': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'hindu religion & moral education': 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                'christian religion and moral education': 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
                'buddhist religion and moral education': 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
                'home science': 'গার্হস্থ্য বিজ্ঞান',
                'physical education': 'শারীরিক শিক্ষা ও স্বাস্থ্য',
                'physical education and health': 'শারীরিক শিক্ষা ও স্বাস্থ্য',
                'arts and crafts': 'চারু ও কারুকলা',
                'fine arts': 'চারু ও কারুকলা',
                'accounting': 'হিসাববিজ্ঞান',
                'finance and banking': 'ফিন্যান্স ও ব্যাংকিং',
                'finance & banking': 'ফিন্যান্স ও ব্যাংকিং',
                'business entrepreneurship': 'ব্যবসায় উদ্যোগ',
                'geography and environment': 'ভূগোল ও পরিবেশ',
                'history of bangladesh and world civilization': 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা',
                'civics and citizenship': 'পৌরনীতি ও নাগরিকতা',
                'economics': 'অর্থনীতি'
            };

            if (dictionary[cleanLower]) {
                return dictionary[cleanLower];
            }

            for (let key in dictionary) {
                if (cleanLower.includes(key)) {
                    return dictionary[key];
                }
            }

            return name;
        }

        function populateClassCheckboxesContainer(containerId, selectedClasses = []) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const classesAll = loadClasses();
            let html = "";
            classesAll.forEach(cls => {
                const isChecked = (selectedClasses.length === 0 || selectedClasses.includes(cls)) ? "checked" : "";
                html += `
                    <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.86rem; font-weight: 700; color: #ffffff; cursor: pointer; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                        <input type="checkbox" class="subject-target-class-chk" value="${cls}" ${isChecked} style="accent-color: #38bdf8; width: 15px; height: 15px; cursor: pointer;">
                        ${cls}
                    </label>
                `;
            });
            container.innerHTML = html;

            container.querySelectorAll('.subject-target-class-chk').forEach(cb => {
                cb.addEventListener('change', toggleSectionDropdownVisibility);
            });
            toggleSectionDropdownVisibility();
        }

        function populateSubjectSectionDropdown() {
            const container = document.getElementById('subject-section-checkboxes');
            if (!container) return;

            // Load sections from school_class_sections
            let classSections = [];
            try {
                classSections = JSON.parse(localStorage.getItem('school_class_sections') || '[]');
            } catch (e) { }

            // Find which senior classes (Nine/Ten) are currently checked
            const checkedClasses = Array.from(document.querySelectorAll('.subject-target-class-chk:checked')).map(cb => cb.value);
            
            // Get all sections for checked senior classes
            const sectionsForChecked = new Set();
            if (Array.isArray(classSections)) {
                classSections.forEach(s => {
                    if (checkedClasses.includes(s.class) && (s.class === 'Nine' || s.class === 'Ten')) {
                        if (s.section) {
                            sectionsForChecked.add(s.section);
                        }
                    }
                });
            }

            // Also check default sections if database is empty or doesn't have Nine/Ten sections
            if (sectionsForChecked.size === 0) {
                if (checkedClasses.includes('Nine') || checkedClasses.includes('Ten')) {
                    sectionsForChecked.add('A');
                    sectionsForChecked.add('B');
                    sectionsForChecked.add('C');
                }
            }

            // Generate options
            let html = `
                <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.86rem; font-weight: 700; color: #ffffff; cursor: pointer; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); margin-right: 4px;">
                    <input type="checkbox" id="section-chk-all" value="All" style="accent-color: #38bdf8; width: 15px; height: 15px; cursor: pointer;">
                    All Sections (সব সেকশন)
                </label>
            `;
            sectionsForChecked.forEach(sec => {
                html += `
                    <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.86rem; font-weight: 700; color: #ffffff; cursor: pointer; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); margin-right: 4px;">
                        <input type="checkbox" class="subject-target-section-chk" value="${sec}" style="accent-color: #38bdf8; width: 15px; height: 15px; cursor: pointer;">
                        ${sec}
                    </label>
                `;
            });

            container.innerHTML = html;

            const allChk = document.getElementById('section-chk-all');
            const otherChks = container.querySelectorAll('.subject-target-section-chk');

            if (allChk) {
                allChk.addEventListener('change', () => {
                    if (allChk.checked) {
                        otherChks.forEach(cb => cb.checked = false);
                    }
                });
                otherChks.forEach(cb => {
                    cb.addEventListener('change', () => {
                        if (cb.checked) {
                            allChk.checked = false;
                        }
                    });
                });
            }
        }

        function toggleSectionDropdownVisibility() {
            const checkedClasses = Array.from(document.querySelectorAll('.subject-target-class-chk:checked')).map(cb => cb.value.toLowerCase());
            const hasNineOrTen = checkedClasses.includes('nine') || checkedClasses.includes('ten');
            const secGroup = document.getElementById('subject-section-group');
            if (secGroup) {
                secGroup.style.display = hasNineOrTen ? '' : 'none';
            }
            if (hasNineOrTen) {
                const container = document.getElementById('subject-section-checkboxes');
                if (container && container.children.length === 0) {
                    populateSubjectSectionDropdown();
                }
            }
        }

        function selectAllSubjectClasses(mode) {
            const checkboxes = document.querySelectorAll('.subject-target-class-chk');
            const primaryClasses = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five"];
            const highClasses = ["Six", "Seven", "Eight", "Nine", "Ten"];

            checkboxes.forEach(cb => {
                if (mode === 'all') {
                    cb.checked = true;
                } else if (mode === 'clear') {
                    cb.checked = false;
                } else if (mode === 'high') {
                    cb.checked = highClasses.includes(cb.value);
                } else if (mode === 'primary') {
                    cb.checked = primaryClasses.includes(cb.value);
                }
            });
            toggleSectionDropdownVisibility();
        }

        function populateDropdownsForSubjects() {
            populateClassDropdown('subject-class');
            updateSubjectClassFilterDropdown();
        }

        function updateSubjectClassFilterDropdown() {
            const deptEl = document.getElementById('filter-subject-dept');
            const classEl = document.getElementById('filter-subject-class');
            if (!deptEl || !classEl) return;

            const selectedDept = deptEl.value;
            const currentClass = classEl.value;
            const classes = loadClasses();
            const { primary, high } = groupClassesByDepartment(classes);

            let html = "";

            if (selectedDept === 'Primary Level') {
                html = `<option value="All">All Primary Classes</option>`;
                html += primary.map(c => `<option value="${c}">${c}</option>`).join('');
            } else if (selectedDept === 'High Level') {
                html = `<option value="All">All High Level Classes</option>`;
                html += high.map(c => `<option value="${c}">${c}</option>`).join('');
            } else {
                html = `<option value="All">All Classes</option>`;
                if (primary.length > 0) {
                    html += `<optgroup label="Primary Level">`;
                    html += primary.map(c => `<option value="${c}">${c}</option>`).join('');
                    html += `</optgroup>`;
                }
                if (high.length > 0) {
                    html += `<optgroup label="High Level">`;
                    html += high.map(c => `<option value="${c}">${c}</option>`).join('');
                    html += `</optgroup>`;
                }
            }

            classEl.innerHTML = html;

            const isValidValue = Array.from(classEl.options).some(opt => opt.value === currentClass);
            if (currentClass && isValidValue) {
                classEl.value = currentClass;
            } else {
                classEl.value = 'All';
            }
        }

        function persistAcademicSubjectsSync(subjectsMap) {
            try {
                if (!subjectsMap) return;
                const subStr = typeof subjectsMap === 'string' ? subjectsMap : JSON.stringify(subjectsMap);
                localStorage.setItem('school_subjects', subStr);
                fetch('/api/db/set', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'school_subjects', value: subStr })
                }).catch(() => {});
                window.dispatchEvent(new CustomEvent('school_subjects_synced'));
                window.dispatchEvent(new Event('storage'));
            } catch (e) {
                console.error("Error syncing academic subjects:", e);
            }
        }

        function saveSubject(event) {
            event.preventDefault();

            const selectedClasses = Array.from(document.querySelectorAll('.subject-target-class-chk:checked')).map(cb => cb.value);
            const fallbackClass = document.getElementById('subject-class')?.value;
            const targetClasses = selectedClasses.length > 0 ? selectedClasses : (fallbackClass ? [fallbackClass] : []);

            if (targetClasses.length === 0) {
                alert("⚠️ অনুগ্রহ করে অন্তত একটি শ্রেণি নির্বাচন করুন!");
                return;
            }

            const name = document.getElementById('subject-name').value.trim();
            const nameBnEl = document.getElementById('subject-name-bn');
            const nameBn = nameBnEl ? nameBnEl.value.trim() : '';
            const shortName = document.getElementById('subject-short-name').value.trim();
            const codeInput = document.getElementById('subject-code').value.trim();
            const isOptional = document.getElementById('subject-is-optional').checked;
            const syncAll = document.getElementById('subject-sync-all-classes')?.checked;
            let sectionVal = 'All';
            const allChk = document.getElementById('section-chk-all');
            if (!allChk || !allChk.checked) {
                const selectedSecs = Array.from(document.querySelectorAll('.subject-target-section-chk:checked')).map(cb => cb.value);
                if (selectedSecs.length > 0) {
                    sectionVal = selectedSecs.join(', ');
                }
            }

            const editClass = document.getElementById('subject-edit-class').value;
            const editCode = document.getElementById('subject-edit-code').value;

            const subjectsMap = loadSubjects();

            if (editClass && editCode) {
                // Edit Mode
                if (syncAll) {
                    let updatedCount = 0;
                    const targetNameClean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const editCodeClean = (editCode || '').trim().toLowerCase();

                    Object.keys(subjectsMap).forEach(cls => {
                        const list = subjectsMap[cls] || [];
                        list.forEach(s => {
                            if (!s) return;
                            const sNameClean = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                            const sCodeClean = (s.code || '').trim().toLowerCase();

                            if (sCodeClean === editCodeClean || (sNameClean && sNameClean === targetNameClean) || s.shortName === editCode) {
                                s.name = name;
                                s.nameBn = nameBn;
                                s.shortName = shortName;
                                if (targetClasses.includes(cls) && codeInput) {
                                    s.code = codeInput;
                                }
                                s.isOptional = isOptional;
                                if (cls === 'Nine' || cls === 'Ten') {
                                    s.section = sectionVal;
                                } else {
                                    s.section = 'All';
                                }
                                updatedCount++;
                            }
                        });
                    });

                    persistAcademicSubjectsSync(subjectsMap);
                    resetSubjectForm();
                    renderSubjectList();
                    closeAddSubjectModal();
                    alert(`✅ একই বিষয়ের Name ও Short Name ("${shortName}") মোট ${updatedCount} টি শ্রেণিতে একসাথে সফলভাবে আপডেট করা হয়েছে!`);
                    return;
                } else {
                    targetClasses.forEach(classVal => {
                        const classSubs = subjectsMap[classVal] || [];
                        const idx = classSubs.findIndex(s => s.code === editCode || (s.name || '').toLowerCase() === name.toLowerCase());
                        const finalSec = (classVal === 'Nine' || classVal === 'Ten') ? sectionVal : 'All';
                        if (idx !== -1) {
                            classSubs[idx] = { code: codeInput || editCode, name, nameBn, shortName, isOptional, section: finalSec };
                        } else {
                            classSubs.push({ code: codeInput || editCode, name, nameBn, shortName, isOptional, section: finalSec });
                        }
                        subjectsMap[classVal] = classSubs;
                    });
                    persistAcademicSubjectsSync(subjectsMap);
                    resetSubjectForm();
                    renderSubjectList();
                    closeAddSubjectModal();
                    alert("Academic subject updated successfully!");
                    return;
                }
            } else {
                // Add Mode for Multiple Target Classes
                let addedCount = 0;
                targetClasses.forEach((classVal) => {
                    const classSubs = subjectsMap[classVal] || [];

                    let targetCode = codeInput;
                    if (!targetCode) {
                        targetCode = String(101 + classSubs.length);
                    }

                    let finalCode = targetCode;
                    let codeCounter = parseInt(targetCode) || 101;
                    while (classSubs.some(s => s.code === String(finalCode))) {
                        finalCode = String(++codeCounter);
                    }

                    const finalSec = (classVal === 'Nine' || classVal === 'Ten') ? sectionVal : 'All';

                    const existingIdx = classSubs.findIndex(s => (s.name || '').toLowerCase() === name.toLowerCase());
                    if (existingIdx !== -1) {
                        classSubs[existingIdx] = { code: finalCode, name, nameBn, shortName, isOptional, section: finalSec };
                    } else {
                        classSubs.push({ code: finalCode, name, nameBn, shortName, isOptional, section: finalSec });
                    }

                    subjectsMap[classVal] = classSubs;
                    addedCount++;
                });

                persistAcademicSubjectsSync(subjectsMap);
                resetSubjectForm();
                renderSubjectList();
                closeAddSubjectModal();
                alert(`✅ মোট ${addedCount} টি শ্রেণিতে নতুন বিষয়ের নাম ("${name}") এবং Short Name ("${shortName}") সফলভাবে যুক্ত করা হয়েছে!`);
            }
        }

        function openAddSubjectModal(isEdit = false) {
            populateClassDropdown('subject-class');
            if (!isEdit) {
                resetSubjectForm();
                populateClassCheckboxesContainer('subject-class-checkboxes', []);
                selectAllSubjectClasses('all');
            }
            const modal = document.getElementById('add-academic-subject-modal');
            if (modal) modal.classList.add('active');
            toggleSectionDropdownVisibility();
        }

        function closeAddSubjectModal() {
            const modal = document.getElementById('add-academic-subject-modal');
            if (modal) modal.classList.remove('active');
        }

        function deleteSubject(classVal, code) {
            if (!confirm("Are you sure you want to delete this subject?")) return;
            const subjectsMap = loadSubjects();
            const classSubjects = subjectsMap[classVal] || [];

            const filtered = classSubjects.filter(s => s.code !== code);
            subjectsMap[classVal] = filtered;

            persistAcademicSubjectsSync(subjectsMap);

            // If the subject currently being edited is deleted, reset the form
            const editClass = document.getElementById('subject-edit-class').value;
            const editCode = document.getElementById('subject-edit-code').value;
            if (editClass === classVal && editCode === code) {
                resetSubjectForm();
            }

            renderSubjectList();
        }

        function editSubject(classVal, code) {
            const subjectsMap = loadSubjects();
            const classSubjects = subjectsMap[classVal] || [];
            const sub = classSubjects.find(s => s.code === code);
            if (!sub) return;

            document.getElementById('subject-form-title').innerText = "Update Academic Subject";

            document.getElementById('subject-edit-class').value = classVal;
            document.getElementById('subject-edit-code').value = code;

            const classesContainingSub = [];
            const subNameClean = (sub.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            Object.keys(subjectsMap).forEach(cls => {
                const list = subjectsMap[cls] || [];
                if (list.some(s => s.code === code || (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '') === subNameClean)) {
                    classesContainingSub.push(cls);
                }
            });

            populateClassCheckboxesContainer('subject-class-checkboxes', classesContainingSub.length > 0 ? classesContainingSub : [classVal]);
            populateSubjectSectionDropdown();

            document.getElementById('subject-class').value = classVal;
            document.getElementById('subject-name').value = sub.name;
            if (document.getElementById('subject-name-bn')) {
                document.getElementById('subject-name-bn').value = sub.nameBn || getSubjectNameBangla(sub);
            }
            document.getElementById('subject-short-name').value = sub.shortName || sub.name;
            document.getElementById('subject-code').value = sub.code;
            document.getElementById('subject-is-optional').checked = !!sub.isOptional;
            const containerSec = document.getElementById('subject-section-checkboxes');
            if (containerSec) {
                const allChk = document.getElementById('section-chk-all');
                const otherChks = containerSec.querySelectorAll('.subject-target-section-chk');
                
                const sections = (sub.section || 'All').split(',').map(s => s.trim());
                
                if (sections.includes('All')) {
                    if (allChk) allChk.checked = true;
                    otherChks.forEach(cb => cb.checked = false);
                } else {
                    if (allChk) allChk.checked = false;
                    otherChks.forEach(cb => {
                        cb.checked = sections.includes(cb.value);
                    });
                }
            }

            document.getElementById('subject-submit-btn').innerText = "Update Subject";
            document.getElementById('subject-submit-btn').style.background = "var(--primary-grad)";

            openAddSubjectModal(true);
        }

        function resetSubjectForm() {
            document.getElementById('subject-form').reset();
            document.getElementById('subject-edit-class').value = "";
            document.getElementById('subject-edit-code').value = "";
            if (document.getElementById('subject-name-bn')) document.getElementById('subject-name-bn').value = "";
            document.getElementById('subject-is-optional').checked = false;
            const containerSec = document.getElementById('subject-section-checkboxes');
            if (containerSec) containerSec.innerHTML = "";

            document.getElementById('subject-form-title').innerText = "Add Academic Subject";

            document.getElementById('subject-submit-btn').innerText = "Save Subject";
            document.getElementById('subject-submit-btn').style.background = "var(--secondary-grad)";
        }

        function resetSubjectsToDefault() {
            if (!confirm("Are you sure you want to restore the default subject listings? This will overwrite your current subjects for all classes.")) return;
            const defaultSubjects = getNewDefaultSubjects();
            persistAcademicSubjectsSync(defaultSubjects);

            // Reset edit form to prevent editing a subject that might not exist anymore
            resetSubjectForm();

            renderSubjectList();
            alert("Subject listings restored to defaults!");
        }

        function renderSubjectList() {
            const container = document.getElementById('subject-tables-container');
            if (!container) return;

            const filterDept = document.getElementById('filter-subject-dept')?.value || 'All';
            const filterClass = document.getElementById('filter-subject-class')?.value || 'All';
            const subjectsMap = loadSubjects();

            const sortedClasses = loadClasses();

            let html = "";
            let totalCount = 0;

            sortedClasses.forEach(cls => {
                if (filterClass !== 'All' && cls !== filterClass) return;
                const dept = getDepartmentForClass(cls);
                if (filterDept !== 'All' && dept !== filterDept) return;

                const subjects = subjectsMap[cls] || [];
                if (subjects.length === 0) return;

                totalCount += subjects.length;
                const color = getClassColor(cls);

                let tableRows = "";
                subjects.forEach(sub => {
                    const bnName = getSubjectNameBangla(sub);
                    let sectionInfo = "";
                    if ((cls === 'Nine' || cls === 'Ten') && sub.section && sub.section !== 'All') {
                        sectionInfo = `<span style="background: rgba(220, 252, 231, 0.7); border: 1px solid #bbf7d0; font-size: 0.8rem; padding: 2px 8px; border-radius: 6px; color: #166534; margin-left: 8px; font-weight: 700; display: inline-block;">Sec: ${sub.section}</span>`;
                    }

                    tableRows += `
                        <tr ondblclick="openSubjectModal('${cls}', '${sub.code}')" style="cursor: pointer; background: #ffffff; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#ffffff'" title="Double-click to edit details & optional status">
                            <td style="text-align:center; font-family: monospace; font-weight:800; font-size:1.05rem; color:#0f172a; padding: 9px 8px; border-bottom:1px solid #e2e8f0;">${sub.code}</td>
                            <td style="text-align:left; padding: 9px 10px; border-bottom:1px solid #e2e8f0;">
                                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                                    <span style="font-weight:800; color:#0f172a; font-size:1.05rem;">${sub.name}</span>
                                    ${sectionInfo}
                                </div>
                                <div style="font-size:0.92rem; color:#0055ff; font-weight:800; margin-top:2px;">${bnName}</div>
                            </td>
                            <td style="text-align:center; color:#0f172a; font-weight:700; font-size:0.98rem; padding: 9px 8px; border-bottom:1px solid #e2e8f0;">${sub.shortName || sub.name}</td>
                            <td style="text-align:center; padding: 9px 8px; border-bottom:1px solid #e2e8f0;">
                                ${sub.isOptional
                                    ? '<span style="background:#d97706; font-size:0.78rem; padding:3px 8px; border-radius:12px; color:#ffffff; font-weight:800; display:inline-block; box-shadow: 0 1px 2px rgba(217,119,6,0.2);">Optional</span>'
                                    : '<span style="background:#0284c7; font-size:0.78rem; padding:3px 8px; border-radius:12px; color:#ffffff; font-weight:800; display:inline-block; box-shadow: 0 1px 2px rgba(2,132,199,0.2);">Compulsory</span>'}
                            </td>
                            <td style="text-align:center; white-space: nowrap; padding: 9px 8px; border-bottom:1px solid #e2e8f0;">
                                <button class="action-btn-sm btn-view-card" onclick="event.stopPropagation(); editSubject('${cls}', '${sub.code}')" style="padding:6px 9px; margin-right:4px;" title="Edit Subject">
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" style="display:block;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                </button>
                                <button class="action-btn-sm btn-delete-student" onclick="event.stopPropagation(); deleteSubject('${cls}', '${sub.code}')" style="padding:6px 9px;" title="Delete Subject">
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" style="display:block;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            </td>
                        </tr>
                    `;
                });

                html += `
                    <div class="class-subject-card" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); overflow: hidden; margin-bottom: 0;">
                        <div style="background: ${color}; padding: 11px 18px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 800; font-size: 1.15rem; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 8px;">
                                <span>📚 Class: ${cls}</span>
                                ${cls === 'Nine' || cls === 'Ten' ? `<span style="font-size: 0.74rem; background: rgba(255,255,255,0.2); padding: 2px 7px; border-radius: 6px; font-weight: 800; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); text-transform: uppercase;">Senior Level</span>` : ''}
                            </div>
                            <span style="font-size: 0.82rem; background: #ffffff; color: #0f172a; padding: 3px 10px; border-radius: 20px; font-weight: 800; box-shadow: 0 2px 4px rgba(0,0,0,0.06); letter-spacing: 0.5px;">
                                ${subjects.length} Subjects
                            </span>
                        </div>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; margin: 0; font-size: 1.02rem;">
                                <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                    <tr>
                                        <th style="color: #475569; padding: 10px 8px; text-align: center; width: 85px; font-weight: 800; font-size: 0.84rem; text-transform: uppercase; letter-spacing: 0.5px;">Code</th>
                                        <th style="color: #475569; padding: 10px 10px; text-align: left; font-weight: 800; font-size: 0.84rem; text-transform: uppercase; letter-spacing: 0.5px;">Subject Name</th>
                                        <th style="color: #475569; padding: 10px 8px; text-align: center; width: 115px; font-weight: 800; font-size: 0.84rem; text-transform: uppercase; letter-spacing: 0.5px;">Short Name</th>
                                        <th style="color: #475569; padding: 10px 8px; text-align: center; width: 105px; font-weight: 800; font-size: 0.84rem; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                                        <th style="color: #475569; padding: 10px 8px; text-align: center; width: 95px; font-weight: 800; font-size: 0.84rem; text-transform: uppercase; letter-spacing: 0.5px;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });

            if (totalCount === 0) {
                container.innerHTML = `<div style="text-align:center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); color:var(--muted-text); font-style:italic;">No subjects created matching filter.</div>`;
                return;
            }

            container.innerHTML = html;
        }

        // --- DOUBLE-CLICK SUBJECT EDIT MODAL CONTROLLERS ---
        function openSubjectModal(classVal, code) {
            const subjectsMap = loadSubjects();
            const classSubjects = subjectsMap[classVal] || [];
            const sub = classSubjects.find(s => s.code === code);
            if (!sub) return;

            // Populate Class dropdown in modal
            populateClassDropdown('modal-subject-class');

            document.getElementById('modal-edit-class').value = classVal;
            document.getElementById('modal-edit-code').value = code;

            document.getElementById('modal-subject-class').value = classVal;
            document.getElementById('modal-subject-name').value = sub.name;
            if (document.getElementById('modal-subject-name-bn')) {
                document.getElementById('modal-subject-name-bn').value = sub.nameBn || getSubjectNameBangla(sub);
            }
            document.getElementById('modal-subject-short-name').value = sub.shortName || sub.name;
            document.getElementById('modal-subject-code').value = sub.code;
            document.getElementById('modal-subject-optional').checked = !!sub.isOptional;

            document.getElementById('subject-modal').classList.add('active');
        }

        function closeSubjectModal() {
            document.getElementById('subject-modal').classList.remove('active');
            document.getElementById('modal-subject-form').reset();
        }

        function saveModalSubject(event) {
            event.preventDefault();
            const classVal = document.getElementById('modal-subject-class').value;
            const name = document.getElementById('modal-subject-name').value.trim();
            const nameBnEl = document.getElementById('modal-subject-name-bn');
            const nameBn = nameBnEl ? nameBnEl.value.trim() : '';
            const shortName = document.getElementById('modal-subject-short-name').value.trim();
            const code = document.getElementById('modal-subject-code').value.trim();
            const isOptional = document.getElementById('modal-subject-optional').checked;
            const syncAll = document.getElementById('modal-subject-sync-all-classes')?.checked;

            const editClass = document.getElementById('modal-edit-class').value;
            const editCode = document.getElementById('modal-edit-code').value;

            const subjectsMap = loadSubjects();

            if (syncAll) {
                let updatedCount = 0;
                const targetNameClean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const editCodeClean = (editCode || '').trim().toLowerCase();

                Object.keys(subjectsMap).forEach(cls => {
                    const list = subjectsMap[cls] || [];
                    list.forEach(s => {
                        if (!s) return;
                        const sNameClean = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                        const sCodeClean = (s.code || '').trim().toLowerCase();

                        if (sCodeClean === editCodeClean || (sNameClean && sNameClean === targetNameClean) || s.shortName === editCode) {
                            s.name = name;
                            s.nameBn = nameBn;
                            s.shortName = shortName;
                            if (cls === classVal) {
                                s.code = code;
                            }
                            s.isOptional = isOptional;
                            updatedCount++;
                        }
                    });
                });

                persistAcademicSubjectsSync(subjectsMap);
                closeSubjectModal();
                renderSubjectList();
                alert(`✅ একই বিষয়ের Name ও Short Name ("${shortName}") মোট ${updatedCount} টি শ্রেণিতে একসাথে সেভ/আপডেট করা হয়েছে!`);
                return;
            }

            const oldClassSubjects = subjectsMap[editClass] || [];

            // Check code uniqueness if code or class has changed
            if (classVal !== editClass || code !== editCode) {
                const targetClassSubjects = subjectsMap[classVal] || [];
                if (targetClassSubjects.some(s => s.code === code)) {
                    alert("Subject with this code already exists for this class!");
                    return;
                }
            }

            // Remove old entry
            const idx = oldClassSubjects.findIndex(s => s.code === editCode);
            if (idx !== -1) {
                oldClassSubjects.splice(idx, 1);
            }
            subjectsMap[editClass] = oldClassSubjects;

            // Add updated entry
            const targetClassSubjects = subjectsMap[classVal] || [];
            targetClassSubjects.push({ code, name, nameBn, shortName, isOptional });
            subjectsMap[classVal] = targetClassSubjects;

            persistAcademicSubjectsSync(subjectsMap);

            closeSubjectModal();
            renderSubjectList();

            // If the regular subject form was editing the same subject, reset it
            const regularEditClass = document.getElementById('subject-edit-class').value;
            const regularEditCode = document.getElementById('subject-edit-code').value;
            if (regularEditClass === editClass && regularEditCode === editCode) {
                resetSubjectForm();
            }

            alert("Subject details updated successfully!");
        }

        // --- SUBVIEW: EXAM TYPES CONTROLLERS ---
        let currentFormOverrides = [];

        function populateScheduleExamTypesDropdown(selectedType = '') {
            const examNameSelect = document.getElementById('schedule-exam-name');
            const examTypeSelect = document.getElementById('schedule-exam-type');
            if (!examTypeSelect) return;

            const types = loadExamTypes();
            const selectedExamName = examNameSelect ? examNameSelect.value.trim() : '';
            const currentVal = selectedType || examTypeSelect.value;

            let options = [];
            const addedTypes = new Set();

            // Strictly filter and populate Exam Types configured under the selected Exam Name
            if (selectedExamName) {
                const matchingExam = types.find(t => t.name.toLowerCase() === selectedExamName.toLowerCase());
                if (matchingExam) {
                    normalizeExamTypeObject(matchingExam);
                    const subTypes = matchingExam.examTypes || [];
                    subTypes.forEach(st => {
                        const name = st.typeName ? st.typeName.trim() : '';
                        if (name && !addedTypes.has(name.toLowerCase())) {
                            options.push(name);
                            addedTypes.add(name.toLowerCase());
                        }
                    });

                    // Fallback to primary type name if subTypes array was empty
                    if (options.length === 0 && matchingExam.type && matchingExam.type.trim()) {
                        const fb = matchingExam.type.trim();
                        options.push(fb);
                        addedTypes.add(fb.toLowerCase());
                    }
                }
            }

            // Fallback default if no specific types are configured
            if (options.length === 0) {
                options.push("Main Exam");
            }

            let html = '';
            options.forEach(opt => {
                const escaped = typeof escapeHtmlExam === 'function' ? escapeHtmlExam(opt) : opt;
                html += `<option value="${escaped}">${escaped}</option>`;
            });

            examTypeSelect.innerHTML = html;

            // Preserve current selection if it exists under this exam, otherwise default to first type
            if (currentVal && options.some(o => o.toLowerCase() === currentVal.trim().toLowerCase())) {
                const matchOpt = options.find(o => o.toLowerCase() === currentVal.trim().toLowerCase());
                examTypeSelect.value = matchOpt;
            } else if (examTypeSelect.options.length > 0) {
                examTypeSelect.selectedIndex = 0;
            }

            // Update auto-calculated Exam No & Distribution Live Preview
            if (typeof autoCalculateScheduleExamNo === 'function') {
                autoCalculateScheduleExamNo();
            }
            if (typeof updateScheduleDistLivePreview === 'function') {
                updateScheduleDistLivePreview();
            }
        }

        function populateExamDropdowns() {
            const types = loadExamTypes();
            const selects = ['schedule-exam-name', 'search-result-exam', 'input-mark-exam'];
            selects.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const currentVal = el.value;
                    let html = types.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
                    el.innerHTML = html;
                    if (currentVal && types.some(t => t.name === currentVal)) {
                        el.value = currentVal;
                    }
                }
            });
            populateScheduleExamTypesDropdown();
        }

        function populateOverrideSubjectsDropdown() {
            const subMap = loadSubjects();
            const selectEl = document.getElementById('override-subject');
            if (!selectEl) return;

            const uniqueSubs = [];
            const codes = new Set();

            Object.keys(subMap).forEach(cls => {
                const subs = subMap[cls] || [];
                subs.forEach(s => {
                    if (!codes.has(s.code)) {
                        codes.add(s.code);
                        uniqueSubs.push(s);
                    }
                });
            });

            let html = '<option value="" disabled selected>-- Select Subject --</option>';
            uniqueSubs.forEach(s => {
                html += `<option value="${s.code}" data-name="${s.name}">${s.name} (${s.code})</option>`;
            });
            selectEl.innerHTML = html;
        }

        function addSubjectOverride() {
            const selectEl = document.getElementById('override-subject');
            const subjectCode = selectEl.value;
            if (!subjectCode) {
                alert("Please select a subject first!");
                return;
            }
            const selectedOpt = selectEl.options[selectEl.selectedIndex];
            const subjectName = selectedOpt.getAttribute('data-name');

            const cq = parseInt(document.getElementById('override-cq').value, 10) || 0;
            const mcq = parseInt(document.getElementById('override-mcq').value, 10) || 0;
            const practical = parseInt(document.getElementById('override-practical').value, 10) || 0;

            const total = cq + mcq + practical;
            if (total <= 0) {
                alert("Total marks must be greater than 0!");
                return;
            }

            currentFormOverrides = currentFormOverrides.filter(o => o.subjectCode !== subjectCode);
            currentFormOverrides.push({
                subjectCode: subjectCode,
                subjectName: subjectName,
                cq: cq,
                mcq: mcq,
                practical: practical
            });

            renderFormOverridesTable();

            selectEl.value = "";
            document.getElementById('override-cq').value = "";
            document.getElementById('override-mcq').value = "";
            document.getElementById('override-practical').value = "";
        }

        function renderFormOverridesTable() {
            const tbody = document.getElementById('override-rows');
            if (!tbody) return;

            if (currentFormOverrides.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; font-style:italic;">No overrides added.</td></tr>';
                return;
            }

            let html = "";
            currentFormOverrides.forEach(o => {
                html += `
                    <tr>
                        <td style="text-align:left; font-weight:600; color:#fff;">${o.subjectName} (${o.subjectCode})</td>
                        <td>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span>CQ: ${o.cq} | MCQ: ${o.mcq} | Prac: ${o.practical} (Total: ${o.cq + o.mcq + o.practical})</span>
                                <button type="button" class="action-btn-sm" style="background:var(--neon-pink); padding:2px 6px;" onclick="deleteFormOverride('${o.subjectCode}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        function deleteFormOverride(subjectCode) {
            currentFormOverrides = currentFormOverrides.filter(o => o.subjectCode !== subjectCode);
            renderFormOverridesTable();
        }

        function calculateDefaultTotalMark() {
            const cq = parseInt(document.getElementById('exam-type-default-cq').value, 10) || 0;
            const mcq = parseInt(document.getElementById('exam-type-default-mcq').value, 10) || 0;
            const prac = parseInt(document.getElementById('exam-type-default-practical').value, 10) || 0;
            const el = document.getElementById('exam-type-default-total');
            if (el) {
                el.innerText = cq + mcq + prac;
            }
        }

        // --- SUBVIEW: EXAM TYPES CONTROLLERS (MASTER-DETAIL TABLE) ---
        let expandedExamTypeIds = new Set();

        function escapeHtmlExam(str) {
            if (str === undefined || str === null) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function toggleExamDetail(examId, event) {
            if (event) {
                // If clicked on button or select, don't trigger row toggle
                if (event.target.closest('button') && !event.target.closest('.btn-expand-toggle')) return;
                if (event.target.closest('select') || event.target.closest('input')) return;
            }

            const masterRow = document.querySelector(`.master-row[data-id="${examId}"]`);
            const detailRow = document.getElementById(`detail-row-${examId}`);
            const toggleBtn = masterRow ? masterRow.querySelector('.btn-expand-toggle') : null;

            if (!detailRow) return;

            if (expandedExamTypeIds.has(examId)) {
                expandedExamTypeIds.delete(examId);
                detailRow.style.display = 'none';
                if (masterRow) masterRow.classList.remove('is-expanded');
                if (toggleBtn) toggleBtn.classList.remove('active');
            } else {
                expandedExamTypeIds.add(examId);
                detailRow.style.display = '';
                if (masterRow) masterRow.classList.add('is-expanded');
                if (toggleBtn) toggleBtn.classList.add('active');
            }
        }

        function toggleAllExamDetails(expandAll = true) {
            const types = loadExamTypes();
            const masterRows = document.querySelectorAll('.master-row');
            const detailRows = document.querySelectorAll('.exam-detail-row');
            const toggleBtns = document.querySelectorAll('.btn-expand-toggle');

            if (expandAll) {
                types.forEach(t => expandedExamTypeIds.add(t.id));
                detailRows.forEach(row => {
                    const examId = row.id.replace('detail-row-', '');
                    const master = document.querySelector(`.master-row[data-id="${examId}"]`);
                    if (master && master.style.display !== 'none') {
                        row.style.display = '';
                    }
                });
                masterRows.forEach(row => row.classList.add('is-expanded'));
                toggleBtns.forEach(btn => btn.classList.add('active'));
            } else {
                expandedExamTypeIds.clear();
                detailRows.forEach(row => row.style.display = 'none');
                masterRows.forEach(row => row.classList.remove('is-expanded'));
                toggleBtns.forEach(btn => btn.classList.remove('active'));
            }
        }

        function filterExamMasterTable() {
            const searchInput = document.getElementById('filter-exam-master-search');
            const catSelect = document.getElementById('filter-exam-master-category');
            const countBadge = document.getElementById('exam-master-count-badge');

            const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
            const selectedCat = catSelect ? catSelect.value : 'All';

            const masterRows = document.querySelectorAll('.master-row');
            let visibleCount = 0;

            masterRows.forEach(row => {
                const examId = row.getAttribute('data-id');
                const examName = (row.getAttribute('data-name') || '').toLowerCase();
                const examCategory = row.getAttribute('data-category') || '';
                const detailRow = document.getElementById(`detail-row-${examId}`);
                const overrideSubjects = (row.getAttribute('data-overrides-search') || '').toLowerCase();

                const matchesCat = (selectedCat === 'All' || examCategory === selectedCat);
                const matchesQuery = !query || examName.includes(query) || examCategory.toLowerCase().includes(query) || overrideSubjects.includes(query);

                if (matchesCat && matchesQuery) {
                    row.style.display = '';
                    visibleCount++;
                    if (detailRow && expandedExamTypeIds.has(examId)) {
                        detailRow.style.display = '';
                    }
                } else {
                    row.style.display = 'none';
                    if (detailRow) {
                        detailRow.style.display = 'none';
                    }
                }
            });

            if (countBadge) {
                countBadge.innerText = `প্রদর্শিত: ${visibleCount}টি পরীক্ষা`;
            }
        }

        function setExamTypeCategoryPreset(cat) {
            const catInput = document.getElementById('exam-type-category');
            if (catInput) {
                catInput.value = cat;
                catInput.focus();
            }
        }

        function setExamTypeMarksPreset(cq, mcq, prac) {
            const cqEl = document.getElementById('exam-type-default-cq');
            const mcqEl = document.getElementById('exam-type-default-mcq');
            const pracEl = document.getElementById('exam-type-default-practical');
            if (cqEl) cqEl.value = cq;
            if (mcqEl) mcqEl.value = mcq;
            if (pracEl) pracEl.value = prac;
            calculateDefaultTotalMark();
        }

        function deleteSubjectOverrideDirect(examId, subTypeId, subjectCode, event) {
            if (event) event.stopPropagation();
            if (!confirm("আপনি কি এই বিষয়ের বিশেষ নম্বর বণ্টন মুছে ফেলতে চান? মুছে ফেললে বিষয়টিতে মূল ডিফল্ট বণ্টন কার্যকর হবে।")) {
                return;
            }
            let types = loadExamTypes();
            const exam = types.find(x => x.id === examId);
            if (!exam) return;

            // Check inside sub-type or top-level overrides
            if (subTypeId && exam.examTypes) {
                const st = exam.examTypes.find(s => s.id === subTypeId);
                if (st && st.overrides) {
                    st.overrides = st.overrides.filter(o => o.subjectCode !== subjectCode);
                }
            }
            if (exam.overrides) {
                exam.overrides = exam.overrides.filter(o => o.subjectCode !== subjectCode);
            }

            normalizeExamTypeObject(exam);
            localStorage.setItem('school_exam_types', JSON.stringify(types));

            renderExamTypes();
            populateExamDropdowns();
            populateScheduleExamTypesDropdown();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();
        }

        function deleteExamSubType(examId, subTypeId, event) {
            if (event) event.stopPropagation();
            let types = loadExamTypes();
            const exam = types.find(x => x.id === examId);
            if (!exam || !exam.examTypes) return;

            if (exam.examTypes.length <= 1) {
                if (!confirm(`"${exam.name}" পরীক্ষায় শুধু একটিই Exam Type রয়েছে। এটি মুছে ফেললে সম্পূর্ণ পরীক্ষাটি তালিকা থেকে বাদ যাবে। আপনি কি নিশ্চিত?`)) {
                    return;
                }
                deleteExamNameFull(examId, event);
                return;
            }

            const targetType = exam.examTypes.find(s => s.id === subTypeId);
            const typeName = targetType ? targetType.typeName : 'Exam Type';

            if (!confirm(`আপনি কি "${exam.name}" থেকে "${typeName}" ধরনটি মুছে ফেলতে চান?`)) {
                return;
            }

            exam.examTypes = exam.examTypes.filter(s => s.id !== subTypeId);
            normalizeExamTypeObject(exam);
            localStorage.setItem('school_exam_types', JSON.stringify(types));

            renderExamTypes();
            populateExamDropdowns();
            populateScheduleExamTypesDropdown();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();
        }

        function deleteExamNameFull(examId, event) {
            if (event) event.stopPropagation();
            let types = loadExamTypes();
            const exam = types.find(x => x.id === examId);
            const examName = exam ? exam.name : 'পরীক্ষা';

            if (!confirm(`"${examName}" এবং এর অন্তর্ভুক্ত সকল Exam Type মুছে ফেলা হবে। আপনি কি নিশ্চিত?`)) {
                return;
            }

            types = types.filter(t => t.id !== examId);
            expandedExamTypeIds.delete(examId);
            localStorage.setItem('school_exam_types', JSON.stringify(types));

            renderExamTypes();
            populateExamDropdowns();
            populateScheduleExamTypesDropdown();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();
        }

        function renderExamTypes() {
            const types = loadExamTypes();
            const tbody = document.getElementById('exam-master-tbody');
            const catSelect = document.getElementById('filter-exam-master-category');
            if (!tbody) return;

            // Update Top KPI Counters
            const kpiTotalExams = document.getElementById('kpi-total-exam-types');
            const kpiTotalCats = document.getElementById('kpi-total-categories');
            const kpiTotalOverrides = document.getElementById('kpi-total-overrides');

            const uniqueCats = new Set();
            let totalSubTypesCount = 0;
            let totalOverridesCount = 0;

            types.forEach(t => {
                const subTypes = t.examTypes || [];
                totalSubTypesCount += subTypes.length;
                subTypes.forEach(st => {
                    if (st.typeName && st.typeName.trim()) {
                        uniqueCats.add(st.typeName.trim());
                    }
                    if (st.overrides && Array.isArray(st.overrides)) {
                        totalOverridesCount += st.overrides.length;
                    }
                });
            });

            if (kpiTotalExams) kpiTotalExams.innerText = types.length;
            if (kpiTotalCats) kpiTotalCats.innerText = totalSubTypesCount;
            if (kpiTotalOverrides) kpiTotalOverrides.innerText = totalOverridesCount;

            // Update Category Filter Dropdown
            if (catSelect) {
                const currentCat = catSelect.value || 'All';
                let catHtml = '<option value="All">সকল ক্যাটাগরি (All Categories)</option>';
                Array.from(uniqueCats).sort().forEach(cat => {
                    catHtml += `<option value="${escapeHtmlExam(cat)}">${escapeHtmlExam(cat)}</option>`;
                });
                catSelect.innerHTML = catHtml;
                if (Array.from(uniqueCats).includes(currentCat)) {
                    catSelect.value = currentCat;
                } else {
                    catSelect.value = 'All';
                }
            }

            if (types.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align:center; padding:35px 20px; color:#64748b; font-size:1rem;">
                            <div style="font-size:2rem; margin-bottom:8px;">📑</div>
                            কোনো পরীক্ষা বা ধরন তৈরি করা হয়নি। নতুন পরীক্ষা যুক্ত করতে উপরে <b>"Examination Name Creat"</b> বাটনে ক্লিক করুন।
                        </td>
                    </tr>
                `;
                return;
            }

            let html = "";

            types.forEach((t, idx) => {
                const subTypes = (t.examTypes && t.examTypes.length > 0) ? t.examTypes : [
                    {
                        id: `${t.id}_t1`,
                        typeName: t.type || "Main Exam",
                        defaultCQ: t.defaultCQ !== undefined ? t.defaultCQ : 70,
                        defaultMCQ: t.defaultMCQ !== undefined ? t.defaultMCQ : 30,
                        defaultPractical: t.defaultPractical !== undefined ? t.defaultPractical : 0,
                        passMarkPercent: t.passMarkPercent !== undefined ? t.passMarkPercent : 33,
                        overrides: Array.isArray(t.overrides) ? t.overrides : []
                    }
                ];

                const primaryType = subTypes[0];
                const cq = primaryType.defaultCQ !== undefined ? primaryType.defaultCQ : 70;
                const mcq = primaryType.defaultMCQ !== undefined ? primaryType.defaultMCQ : 30;
                const prac = primaryType.defaultPractical !== undefined ? primaryType.defaultPractical : 0;
                const total = cq + mcq + prac;
                const passPercent = primaryType.passMarkPercent !== undefined ? primaryType.passMarkPercent : 33;
                const passMarkTotal = ((total * passPercent) / 100).toFixed(1);

                const cqPct = total > 0 ? ((cq / total) * 100).toFixed(1) : 0;
                const mcqPct = total > 0 ? ((mcq / total) * 100).toFixed(1) : 0;
                const pracPct = total > 0 ? ((prac / total) * 100).toFixed(1) : 0;

                let examTotalOverrides = 0;
                const overridesSearchParts = [];
                subTypes.forEach(st => {
                    const ovs = Array.isArray(st.overrides) ? st.overrides : [];
                    examTotalOverrides += ovs.length;
                    ovs.forEach(o => overridesSearchParts.push(`${o.subjectName} ${o.subjectCode}`));
                });

                const allTypeNames = subTypes.map(st => st.typeName).join(' ');
                const isExpanded = expandedExamTypeIds.has(t.id);

                // --- MASTER ROW ---
                html += `
                    <tr class="master-row ${isExpanded ? 'is-expanded' : ''}" 
                        data-id="${escapeHtmlExam(t.id)}" 
                        data-name="${escapeHtmlExam(t.name)}" 
                        data-category="${escapeHtmlExam(allTypeNames)}" 
                        data-overrides-search="${escapeHtmlExam(overridesSearchParts.join(' '))}"
                        onclick="toggleExamDetail('${escapeHtmlExam(t.id)}', event)">
                        
                        <!-- Toggle Button -->
                        <td style="text-align: center;">
                            <button type="button" class="btn-expand-toggle ${isExpanded ? 'active' : ''}" 
                                onclick="toggleExamDetail('${escapeHtmlExam(t.id)}', event)"
                                title="${isExpanded ? 'সংকুচিত করুন' : 'বিস্তারিত দেখুন'}">
                                <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </td>

                        <!-- SL Number -->
                        <td style="text-align: center; font-weight: 700; color: #64748b;">
                            ${idx + 1}
                        </td>

                        <!-- Exam Name -->
                        <td>
                            <div style="font-weight: 800; color: #0f172a; font-size: 1.04rem; line-height: 1.35;">
                                ${escapeHtmlExam(t.name)}
                            </div>
                            <div style="margin-top: 4px;">
                                <span style="font-size: 0.78rem; font-weight: 700; color: #0f766e; background: #f0fdfa; border: 1px solid #99f6e4; padding: 2px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                                    📂 ${subTypes.length}টি Exam Type যুক্ত
                                </span>
                            </div>
                        </td>

                        <!-- Configured Exam Types Badges -->
                        <td style="text-align: center;">
                            <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; max-width: 260px; margin: 0 auto;">
                                ${subTypes.map(st => `
                                    <span class="badge-exam-category" style="margin: 0; font-size: 0.78rem;" title="${escapeHtmlExam(st.typeName)} (CQ: ${st.defaultCQ}, MCQ: ${st.defaultMCQ}, Prac: ${st.defaultPractical})">
                                        🏷️ ${escapeHtmlExam(st.typeName)}
                                    </span>
                                `).join('')}
                            </div>
                        </td>

                        <!-- Primary Distribution Breakdown (CQ / MCQ / Practical) -->
                        <td style="text-align: center;">
                            <div class="dist-breakdown-badges">
                                <span class="dist-pill dist-pill-cq" title="Creative / লিখিত: ${cq}">CQ: <strong>${cq}</strong></span>
                                <span class="dist-pill dist-pill-mcq" title="MCQ / নৈর্বাচনিক: ${mcq}">MCQ: <strong>${mcq}</strong></span>
                                <span class="dist-pill dist-pill-prac" title="Practical / ব্যবহারিক: ${prac}">Prac: <strong>${prac}</strong></span>
                            </div>
                            <div class="mini-dist-progress" title="CQ: ${cqPct}%, MCQ: ${mcqPct}%, Prac: ${pracPct}%">
                                <div style="width: ${cqPct}%; background: #0284c7;"></div>
                                <div style="width: ${mcqPct}%; background: #d97706;"></div>
                                <div style="width: ${pracPct}%; background: #9333ea;"></div>
                            </div>
                        </td>

                        <!-- Total Marks -->
                        <td style="text-align: center;">
                            <span class="badge-total-marks">
                                ${total}
                            </span>
                            <div style="font-size:0.75rem; color:#16a34a; font-weight:700; margin-top:2px;">
                                ≥ ${passMarkTotal} (${passPercent}%)
                            </div>
                        </td>

                        <!-- Subject Overrides Count -->
                        <td style="text-align: center;">
                            ${examTotalOverrides > 0 
                                ? `<span class="badge-override-active" onclick="toggleExamDetail('${escapeHtmlExam(t.id)}', event)" title="ক্লিক করে বিস্তারিত দেখুন">
                                     ⚡ ${examTotalOverrides}টি বিষয়ের বিশেষ বণ্টন
                                   </span>`
                                : `<span class="badge-override-none">
                                     সকল বিষয়ে ডিফল্ট
                                   </span>`
                            }
                        </td>

                        <!-- Master Actions -->
                        <td style="text-align: center;">
                            <div style="display: flex; gap: 6px; justify-content: center; align-items: center; flex-wrap: wrap;">
                                <button type="button" class="action-btn-sm" 
                                    style="background: #f0fdfa; border: 1.5px solid #99f6e4; color: #0f766e; padding: 6px 10px; font-size: 0.82rem; font-weight: 700; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;"
                                    onclick="event.stopPropagation(); openAddExamTypeForExam('${escapeHtmlExam(t.id)}')" 
                                    title="এই পরীক্ষার অধীনে নতুন Exam Type যুক্ত করুন">
                                    ➕ Add Type
                                </button>
                                <button type="button" class="action-btn-sm" 
                                    style="background: #fee2e2; border: 1.5px solid #fca5a5; color: #dc2626; padding: 6px 9px; font-size: 0.82rem; font-weight: 700; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center;"
                                    onclick="event.stopPropagation(); deleteExamNameFull('${escapeHtmlExam(t.id)}', event)" 
                                    title="এই সম্পূর্ণ পরীক্ষাটি মুছে ফেলুন">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- --- DETAIL ROW --- -->
                    <tr class="exam-detail-row" id="detail-row-${escapeHtmlExam(t.id)}" style="${isExpanded ? '' : 'display:none;'}">
                        <td colspan="8" style="padding: 0;">
                            <div class="exam-detail-box">
                                
                                <!-- Detail Top Header -->
                                <div class="detail-header" style="background:#ffffff; border-bottom:1.5px solid #e2e8f0; padding:14px 20px; border-radius:12px 12px 0 0; margin-bottom:16px;">
                                    <div>
                                        <h4 style="margin:0 0 4px 0; font-size:1.15rem; color:#0f172a; font-weight:800; display:flex; align-items:center; gap:8px;">
                                            <span>📌 ${escapeHtmlExam(t.name)}</span>
                                            <span style="font-size:0.8rem; font-weight:700; color:#0f766e; background:#f0fdfa; border:1px solid #99f6e4; padding:2px 8px; border-radius:10px;">
                                                ${subTypes.length}টি Exam Type কনফিগার করা আছে
                                            </span>
                                        </h4>
                                        <p style="margin:0; font-size:0.84rem; color:#64748b;">
                                            নিচে এই পরীক্ষার আওতাধীন সকল <b>Exam Type</b> এবং প্রতিটির নিজস্ব নম্বর বণ্টন ও বিষয়ের ওভাররাইড দেওয়া হলো:
                                        </p>
                                    </div>
                                    <div>
                                        <button type="button" class="btn-primary" 
                                            style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); border:none; box-shadow:0 2px 8px rgba(13,148,136,0.25); padding:8px 16px; font-size:0.86rem; font-weight:700; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;"
                                            onclick="openAddExamTypeForExam('${escapeHtmlExam(t.id)}')">
                                            ➕ Add Another Exam Type to this Exam
                                        </button>
                                    </div>
                                </div>

                                <!-- List of all Exam Types under this Exam Name -->
                                <div style="display: flex; flex-direction: column; gap: 16px; padding: 0 10px 10px 10px;">
                                    ${subTypes.map((st, sIdx) => {
                                        const stCQ = st.defaultCQ !== undefined ? st.defaultCQ : 70;
                                        const stMCQ = st.defaultMCQ !== undefined ? st.defaultMCQ : 30;
                                        const stPrac = st.defaultPractical !== undefined ? st.defaultPractical : 0;
                                        const stTotal = stCQ + stMCQ + stPrac;
                                        const stPassPercent = st.passMarkPercent !== undefined ? st.passMarkPercent : 33;
                                        const stPassTotal = ((stTotal * stPassPercent) / 100).toFixed(1);
                                        const stPassCQ = ((stCQ * stPassPercent) / 100).toFixed(1);
                                        const stPassMCQ = ((stMCQ * stPassPercent) / 100).toFixed(1);
                                        const stPassPrac = ((stPrac * stPassPercent) / 100).toFixed(1);
                                        const stOverrides = Array.isArray(st.overrides) ? st.overrides : [];

                                        return `
                                            <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:12px; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                                                
                                                <!-- Sub Type Header & Action -->
                                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                                                    <div style="display:flex; align-items:center; gap:10px;">
                                                        <span style="font-weight:800; color:#1e293b; font-size:1.02rem; display:inline-flex; align-items:center; gap:6px;">
                                                            <span style="background:#eff6ff; color:#2563eb; width:26px; height:26px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:0.84rem; font-weight:800;">${sIdx + 1}</span>
                                                            Exam Type: <span style="color:#0f766e; font-weight:800;">${escapeHtmlExam(st.typeName)}</span>
                                                        </span>
                                                        <span style="font-size:0.8rem; font-weight:700; color:#475569; background:#f8fafc; border:1px solid #e2e8f0; padding:2px 8px; border-radius:6px;">
                                                            মোট: ${stTotal} Marks | পাস: ${stPassPercent}% (≥${stPassTotal})
                                                        </span>
                                                    </div>
                                                    <div style="display:flex; gap:6px;">
                                                        <button type="button" class="action-btn-sm btn-edit-card" 
                                                            style="padding:5px 12px; font-size:0.82rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;"
                                                            onclick="editExamSubType('${escapeHtmlExam(t.id)}', '${escapeHtmlExam(st.id)}')">
                                                            ✏️ Edit Type & Overrides
                                                        </button>
                                                        <button type="button" class="action-btn-sm" 
                                                            style="background:#fee2e2; border:1px solid #fca5a5; color:#dc2626; padding:5px 8px; font-size:0.82rem; font-weight:700; border-radius:6px; cursor:pointer;"
                                                            onclick="deleteExamSubType('${escapeHtmlExam(t.id)}', '${escapeHtmlExam(st.id)}', event)" 
                                                            title="এই Exam Type মুছে ফেলুন">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>

                                                <!-- Metric Grid for this Exam Type -->
                                                <div class="detail-metrics-grid" style="margin-bottom:14px;">
                                                    <div class="detail-metric-card" style="border-left: 3.5px solid #0f172a; padding:10px 14px;">
                                                        <div style="font-size:0.74rem; font-weight:700; color:#64748b; text-transform:uppercase;">মোট নম্বর</div>
                                                        <div style="font-size:1.25rem; font-weight:800; color:#0f172a; margin-top:2px;">${stTotal} Marks</div>
                                                        <div style="font-size:0.74rem; color:#64748b;">পাস শর্ত: <b>≥ ${stPassTotal}</b> (${stPassPercent}%)</div>
                                                    </div>
                                                    <div class="detail-metric-card" style="border-left: 3.5px solid #0284c7; padding:10px 14px;">
                                                        <div style="font-size:0.74rem; font-weight:700; color:#0284c7; text-transform:uppercase;">সৃজনশীল / CQ</div>
                                                        <div style="font-size:1.25rem; font-weight:800; color:#0284c7; margin-top:2px;">${stCQ} Marks</div>
                                                        <div style="font-size:0.74rem; color:#0369a1;">পাস নম্বর: <b>≥ ${stPassCQ}</b></div>
                                                    </div>
                                                    <div class="detail-metric-card" style="border-left: 3.5px solid #d97706; padding:10px 14px;">
                                                        <div style="font-size:0.74rem; font-weight:700; color:#d97706; text-transform:uppercase;">নৈর্বাচনিক / MCQ</div>
                                                        <div style="font-size:1.25rem; font-weight:800; color:#d97706; margin-top:2px;">${stMCQ} Marks</div>
                                                        <div style="font-size:0.74rem; color:#b45309;">পাস নম্বর: <b>≥ ${stPassMCQ}</b></div>
                                                    </div>
                                                    <div class="detail-metric-card" style="border-left: 3.5px solid #9333ea; padding:10px 14px;">
                                                        <div style="font-size:0.74rem; font-weight:700; color:#9333ea; text-transform:uppercase;">ব্যবহারিক / Practical</div>
                                                        <div style="font-size:1.25rem; font-weight:800; color:#9333ea; margin-top:2px;">${stPrac} Marks</div>
                                                        <div style="font-size:0.74rem; color:#7e22ce;">পাস নম্বর: <b>≥ ${stPassPrac}</b></div>
                                                    </div>
                                                </div>

                                                <!-- Overrides Table for this Type -->
                                                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
                                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                                        <div style="font-weight:700; color:#334155; font-size:0.88rem; display:flex; align-items:center; gap:6px;">
                                                            <span>⚡ এই টাইপের বিষয়ভিত্তিক বিশেষ নম্বর বণ্টন:</span>
                                                            <span style="font-size:0.78rem; font-weight:700; color:#0f766e; background:#f0fdfa; border:1px solid #99f6e4; padding:1px 6px; border-radius:8px;">
                                                                ${stOverrides.length}টি বিষয়
                                                            </span>
                                                        </div>
                                                    </div>

                                                    ${stOverrides.length > 0 ? `
                                                        <div class="sub-override-table-wrapper">
                                                            <table class="sub-override-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th style="width:40px;">#</th>
                                                                        <th style="text-align:left; min-width:180px;">বিষয় ও কোড (Subject)</th>
                                                                        <th style="width:90px;">CQ</th>
                                                                        <th style="width:90px;">MCQ</th>
                                                                        <th style="width:90px;">ব্যবহারিক</th>
                                                                        <th style="width:95px;">মোট নম্বর</th>
                                                                        <th style="width:120px;">পাস মার্ক (${stPassPercent}%)</th>
                                                                        <th style="width:85px;">অ্যাকশন</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    ${stOverrides.map((o, oIdx) => {
                                                                        const oCQ = o.cq !== undefined ? o.cq : 0;
                                                                        const oMCQ = o.mcq !== undefined ? o.mcq : 0;
                                                                        const oPrac = o.practical !== undefined ? o.practical : 0;
                                                                        const oTotal = oCQ + oMCQ + oPrac;
                                                                        const oPassTotal = ((oTotal * stPassPercent) / 100).toFixed(1);
                                                                        const oPassCQ = ((oCQ * stPassPercent) / 100).toFixed(1);
                                                                        const oPassMCQ = ((oMCQ * stPassPercent) / 100).toFixed(1);
                                                                        const oPassPrac = ((oPrac * stPassPercent) / 100).toFixed(1);

                                                                        return `
                                                                            <tr>
                                                                                <td style="font-weight:700; color:#64748b;">${oIdx + 1}</td>
                                                                                <td style="text-align:left;">
                                                                                    <div style="font-weight:700; color:#0f172a; font-size:0.9rem;">${escapeHtmlExam(o.subjectName)}</div>
                                                                                    <span style="font-size:0.75rem; font-weight:700; color:#475569; background:#ffffff; padding:1px 5px; border-radius:4px; border:1px solid #cbd5e1;">Code: ${escapeHtmlExam(o.subjectCode)}</span>
                                                                                </td>
                                                                                <td><span class="dist-pill dist-pill-cq">${oCQ} <small>(≥${oPassCQ})</small></span></td>
                                                                                <td><span class="dist-pill dist-pill-mcq">${oMCQ} <small>(≥${oPassMCQ})</small></span></td>
                                                                                <td><span class="dist-pill dist-pill-prac">${oPrac} <small>(≥${oPassPrac})</small></span></td>
                                                                                <td><strong style="color:#0f172a;">${oTotal}</strong></td>
                                                                                <td><span style="color:#16a34a; font-weight:800; background:#f0fdf4; padding:2px 6px; border-radius:6px; border:1px solid #bbf7d0; font-size:0.8rem;">≥ ${oPassTotal}</span></td>
                                                                                <td>
                                                                                    <button type="button" class="action-btn-sm" 
                                                                                        style="background:#fee2e2; border:1px solid #fca5a5; color:#dc2626; padding:3px 7px; font-size:0.76rem; font-weight:700; border-radius:6px; cursor:pointer;"
                                                                                        onclick="deleteSubjectOverrideDirect('${escapeHtmlExam(t.id)}', '${escapeHtmlExam(st.id)}', '${escapeHtmlExam(o.subjectCode)}', event)" 
                                                                                        title="এই বিষয়ের বিশেষ বণ্টন মুছে ফেলুন">
                                                                                        🗑️ সরান
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        `;
                                                                    }).join('')}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ` : `
                                                        <div style="font-size:0.84rem; color:#64748b; padding:8px 0; text-align:center;">
                                                            💡 এই Exam Type-এর জন্য সকল বিষয়ে মূল ডিফল্ট বণ্টন (CQ: <b>${stCQ}</b>, MCQ: <b>${stMCQ}</b>, ব্যবহারিক: <b>${stPrac}</b>) কার্যকর রয়েছে।
                                                        </div>
                                                    `}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;

            // Trigger real-time filtering if filter inputs have values
            filterExamMasterTable();
        }

        function populateExamTypeNamesDropdown(selectedName = "") {
            const selectEl = document.getElementById('exam-type-name');
            if (!selectEl) return;

            const types = loadExamTypes();
            let html = '<option value="" disabled selected>-- Select Exam Name --</option>';

            if (selectedName && !types.some(t => t.name === selectedName)) {
                html += `<option value="${escapeHtmlExam(selectedName)}" selected>${escapeHtmlExam(selectedName)}</option>`;
            }

            types.forEach(t => {
                const isSelected = (selectedName && t.name === selectedName) ? 'selected' : '';
                html += `<option value="${escapeHtmlExam(t.name)}" data-id="${escapeHtmlExam(t.id)}" ${isSelected}>${escapeHtmlExam(t.name)}</option>`;
            });

            selectEl.innerHTML = html;
            if (selectedName) {
                selectEl.value = selectedName;
            }
        }

        function onExamNameSelectChange(selectedName) {
            if (!selectedName) return;
            const types = loadExamTypes();
            const exam = types.find(x => x.name === selectedName);
            if (exam) {
                document.getElementById('exam-type-id').value = exam.id;
                // If creating new type under this exam name, keep sub-id empty
                const subIdInput = document.getElementById('exam-type-sub-id');
                if (subIdInput && !subIdInput.value) {
                    document.getElementById('exam-type-category').value = "";
                    document.getElementById('exam-type-pass-percent').value = 33;
                    document.getElementById('exam-type-default-cq').value = 70;
                    document.getElementById('exam-type-default-mcq').value = 30;
                    document.getElementById('exam-type-default-practical').value = 0;
                    currentFormOverrides = [];
                    calculateDefaultTotalMark();
                    renderFormOverridesTable();
                }
            }
        }

        function openAddExamTypeForExam(examId) {
            const types = loadExamTypes();
            const exam = types.find(x => x.id === examId);
            resetExamTypeForm();
            populateOverrideSubjectsDropdown();
            populateExamTypeNamesDropdown(exam ? exam.name : "");

            if (exam) {
                document.getElementById('exam-type-id').value = exam.id;
                document.getElementById('exam-type-name').value = exam.name;
                document.getElementById('exam-type-form-title').innerText = `➕ Add Exam Type under "${exam.name}"`;
            }

            document.getElementById('exam-type-modal').classList.add('active');
        }

        function editExamSubType(examId, subTypeId) {
            const types = loadExamTypes();
            const exam = types.find(x => x.id === examId);
            if (!exam) return;

            normalizeExamTypeObject(exam);
            const st = (exam.examTypes || []).find(s => s.id === subTypeId) || exam.examTypes[0];
            if (!st) return;

            populateOverrideSubjectsDropdown();
            populateExamTypeNamesDropdown(exam.name);

            document.getElementById('exam-type-id').value = exam.id;
            document.getElementById('exam-type-sub-id').value = st.id;
            document.getElementById('exam-type-name').value = exam.name;
            document.getElementById('exam-type-category').value = st.typeName || "";
            document.getElementById('exam-type-default-cq').value = st.defaultCQ !== undefined ? st.defaultCQ : 70;
            document.getElementById('exam-type-default-mcq').value = st.defaultMCQ !== undefined ? st.defaultMCQ : 30;
            document.getElementById('exam-type-default-practical').value = st.defaultPractical !== undefined ? st.defaultPractical : 0;
            document.getElementById('exam-type-pass-percent').value = st.passMarkPercent !== undefined ? st.passMarkPercent : 33;

            currentFormOverrides = st.overrides ? JSON.parse(JSON.stringify(st.overrides)) : [];

            calculateDefaultTotalMark();
            renderFormOverridesTable();

            document.getElementById('exam-type-form-title').innerText = `✏️ Edit Exam Type "${st.typeName}" under "${exam.name}"`;
            document.getElementById('exam-type-modal').classList.add('active');
        }

        function saveExamType(event) {
            event.preventDefault();
            const nameSelect = document.getElementById('exam-type-name');
            const examName = nameSelect ? nameSelect.value.trim() : '';
            let examId = document.getElementById('exam-type-id').value;
            let subId = document.getElementById('exam-type-sub-id').value;
            const typeName = document.getElementById('exam-type-category').value.trim();
            const defaultCQ = parseInt(document.getElementById('exam-type-default-cq').value, 10) || 0;
            const defaultMCQ = parseInt(document.getElementById('exam-type-default-mcq').value, 10) || 0;
            const defaultPractical = parseInt(document.getElementById('exam-type-default-practical').value, 10) || 0;
            const passMarkPercent = parseInt(document.getElementById('exam-type-pass-percent').value, 10) || 33;

            if (!examName) {
                alert("অনুগ্রহ করে পরীক্ষার নাম নির্বাচন করুন (Please select an Exam Name)!");
                return;
            }

            if (!typeName) {
                alert("অনুগ্রহ করে Exam Type-এর নাম লিখুন (Please enter an Exam Type Name)!");
                return;
            }

            const total = defaultCQ + defaultMCQ + defaultPractical;
            if (total <= 0) {
                alert("মোট নম্বর অবশ্যই শূন্যের বেশি হতে হবে (Total marks must be greater than 0)!");
                return;
            }

            const types = loadExamTypes();
            
            // Find existing Exam Name object
            let exam = null;
            if (examId) {
                exam = types.find(t => t.id === examId);
            }
            if (!exam) {
                exam = types.find(t => t.name.toLowerCase() === examName.toLowerCase());
            }

            if (!exam) {
                // If Exam Name doesn't exist yet, create Exam Name with this Exam Type
                const newExamId = Date.now().toString();
                const newSubId = `${newExamId}_t1`;
                exam = {
                    id: newExamId,
                    name: examName,
                    type: typeName,
                    defaultCQ: defaultCQ,
                    defaultMCQ: defaultMCQ,
                    defaultPractical: defaultPractical,
                    passMarkPercent: passMarkPercent,
                    overrides: [...currentFormOverrides],
                    examTypes: [
                        {
                            id: newSubId,
                            typeName: typeName,
                            defaultCQ: defaultCQ,
                            defaultMCQ: defaultMCQ,
                            defaultPractical: defaultPractical,
                            passMarkPercent: passMarkPercent,
                            overrides: [...currentFormOverrides]
                        }
                    ]
                };
                types.push(exam);
                expandedExamTypeIds.add(newExamId);
            } else {
                normalizeExamTypeObject(exam);
                if (subId) {
                    // Update existing Exam Type
                    const stIndex = exam.examTypes.findIndex(s => s.id === subId);
                    if (stIndex !== -1) {
                        const oldTypeName = exam.examTypes[stIndex].typeName;
                        exam.examTypes[stIndex].typeName = typeName;
                        exam.examTypes[stIndex].defaultCQ = defaultCQ;
                        exam.examTypes[stIndex].defaultMCQ = defaultMCQ;
                        exam.examTypes[stIndex].defaultPractical = defaultPractical;
                        exam.examTypes[stIndex].passMarkPercent = passMarkPercent;
                        exam.examTypes[stIndex].overrides = [...currentFormOverrides];

                        // If typeName was changed, keep existing schedules in sync
                        if (oldTypeName && oldTypeName.trim().toLowerCase() !== typeName.trim().toLowerCase()) {
                            const schedules = loadSchedules();
                            let schUpdated = false;
                            schedules.forEach(s => {
                                if (s.term && s.term.trim().toLowerCase() === examName.trim().toLowerCase() &&
                                    s.examType && s.examType.trim().toLowerCase() === oldTypeName.trim().toLowerCase()) {
                                    s.examType = typeName;
                                    schUpdated = true;
                                }
                            });
                            if (schUpdated) {
                                localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
                            }
                        }
                    }
                } else {
                    // Add new Exam Type under this Exam Name
                    const newSubId = `${exam.id}_t${Date.now()}`;
                    exam.examTypes.push({
                        id: newSubId,
                        typeName: typeName,
                        defaultCQ: defaultCQ,
                        defaultMCQ: defaultMCQ,
                        defaultPractical: defaultPractical,
                        passMarkPercent: passMarkPercent,
                        overrides: [...currentFormOverrides]
                    });
                }
                normalizeExamTypeObject(exam);
                expandedExamTypeIds.add(exam.id);
            }

            localStorage.setItem('school_exam_types', JSON.stringify(types));
            alert(`✅ "${examName}" পরীক্ষার অধীনে "${typeName}" ধরনটি সফলভাবে সংরক্ষিত হয়েছে!`);
            closeExamTypeModal();
            renderExamTypes();
            populateExamDropdowns();
            populateScheduleExamTypesDropdown();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();
        }

        function editExamType(id) {
            editExamSubType(id, "");
        }

        function deleteExamType(id) {
            deleteExamNameFull(id);
        }

        function resetExamTypeForm() {
            document.getElementById('exam-type-id').value = "";
            document.getElementById('exam-type-sub-id').value = "";
            document.getElementById('exam-type-form').reset();
            document.getElementById('exam-type-category').value = "";
            document.getElementById('exam-type-pass-percent').value = 33;
            document.getElementById('exam-type-default-cq').value = 70;
            document.getElementById('exam-type-default-mcq').value = 30;
            document.getElementById('exam-type-default-practical').value = 0;
            currentFormOverrides = [];
            renderFormOverridesTable();
            calculateDefaultTotalMark();
            document.getElementById('exam-type-form-title').innerText = "✨ Add / Edit Exam Type under Examination";
        }

        function resetExamTypesToDefault() {
            if (!confirm("Are you sure you want to reset exam types to system defaults? Any custom exam types will be removed.")) {
                return;
            }
            localStorage.removeItem('school_exam_types');
            expandedExamTypeIds.clear();
            loadExamTypes();
            renderExamTypes();
            populateExamDropdowns();
            populateScheduleExamTypesDropdown();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();
            alert("Exam Types reset to defaults successfully!");
        }

        function openExamTypeModal() {
            resetExamTypeForm();
            populateOverrideSubjectsDropdown();
            populateExamTypeNamesDropdown();
            document.getElementById('exam-type-modal').classList.add('active');
        }

        function closeExamTypeModal() {
            document.getElementById('exam-type-modal').classList.remove('active');
            resetExamTypeForm();
        }

        // --- EXAMINATION NAME CREAT CONTROLLERS ---
        function openExamNameCreateModal() {
            const form = document.getElementById('create-exam-name-form');
            if (form) form.reset();
            const nameInput = document.getElementById('custom-exam-name');
            if (nameInput) nameInput.value = "";
            const modal = document.getElementById('create-exam-name-modal');
            if (modal) {
                modal.classList.add('active');
                setTimeout(() => {
                    if (nameInput) nameInput.focus();
                }, 100);
            }
        }

        function closeExamNameCreateModal() {
            const modal = document.getElementById('create-exam-name-modal');
            if (modal) modal.classList.remove('active');
        }

        function setExamNamePreset(namePrefix) {
            const currentYear = new Date().getFullYear();
            const nameInput = document.getElementById('custom-exam-name');
            if (nameInput) {
                nameInput.value = `${namePrefix} ${currentYear}`;
                nameInput.focus();
            }
        }

        function saveCustomExamName(event) {
            event.preventDefault();
            const nameInput = document.getElementById('custom-exam-name');
            const name = nameInput ? nameInput.value.trim() : '';

            if (!name) {
                alert("অনুগ্রহ করে পরীক্ষার নাম লিখুন (Please enter an Examination Name)!");
                return;
            }

            // Determine category from name or default to General Exam
            let detectedType = "Main Exam";
            const lowerName = name.toLowerCase();
            if (lowerName.includes("half-yearly") || lowerName.includes("half yearly") || lowerName.includes("অর্ধ-বার্ষিক") || lowerName.includes("অর্ধবার্ষিক")) {
                detectedType = "Half-Yearly Main Exam";
            } else if (lowerName.includes("annual") || lowerName.includes("বার্ষিক")) {
                detectedType = "Annual Main Exam";
            } else if (lowerName.includes("pre-test") || lowerName.includes("pre test") || lowerName.includes("প্রাক-নির্বাচনী")) {
                detectedType = "Pre-Test Main Exam";
            } else if (lowerName.includes("test") || lowerName.includes("নির্বাচনী")) {
                detectedType = "Test Main Exam";
            } else if (lowerName.includes("term") || lowerName.includes("সাময়িক") || lowerName.includes("সাময়িক")) {
                detectedType = "Term Exam";
            } else if (lowerName.includes("model") || lowerName.includes("মডেল")) {
                detectedType = "Model Test";
            } else if (lowerName.includes("monthly") || lowerName.includes("মাসিক")) {
                detectedType = "Monthly Test";
            }

            const types = loadExamTypes();
            const duplicate = types.find(t => t.name.toLowerCase() === name.toLowerCase());
            if (duplicate) {
                alert(`"${name}" নামের একটি পরীক্ষা ইতিমধ্যে তালিকায় বিদ্যমান আছে!`);
                return;
            }

            const newId = Date.now().toString();
            const newExam = {
                id: newId,
                name: name,
                type: detectedType,
                defaultCQ: 70,
                defaultMCQ: 30,
                defaultPractical: 0,
                passMarkPercent: 33,
                overrides: [],
                examTypes: [
                    {
                        id: `${newId}_t1`,
                        typeName: detectedType,
                        defaultCQ: 70,
                        defaultMCQ: 30,
                        defaultPractical: 0,
                        passMarkPercent: 33,
                        overrides: []
                    }
                ]
            };

            types.push(newExam);
            localStorage.setItem('school_exam_types', JSON.stringify(types));

            // Expand the newly created exam in master-detail table
            expandedExamTypeIds.add(newId);

            closeExamNameCreateModal();
            renderExamTypes();
            populateExamDropdowns();
            populateExamTypeNamesDropdown(name);
            populateScheduleExamTypesDropdown();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();

            alert(`✅ নতুন পরীক্ষার নাম "${name}" সফলভাবে তৈরি হয়েছে! এখন প্রয়োজন অনুসারে এর অধীনে আরও Exam Type যুক্ত করতে পারেন।`);
        }

        // --- SUBVIEW 5: SMS CONTROLLERS ---
        function populateDropdownsForSms() {
            populateClassDropdown('sms-target-class');
        }

        function updateSmsTargetStudentsDropdown() {
            const classVal = document.getElementById('sms-target-class').value;
            const el = document.getElementById('sms-target-student');
            if (!el) return;

            const students = loadStudents();
            const classStudents = students.filter(s => s.class === classVal);

            let html = `<option value="All">All Guardians (Class Level)</option>`;
            html += classStudents.map(s => `<option value="${s.id}">${s.name} (Parent: +88017XXXXXXXX)</option>`).join('');

            el.innerHTML = html;
            updateSmsMessageTemplate();
        }

        function updateSmsMessageTemplate() {
            const template = document.getElementById('sms-template').value;
            const targetStudentId = document.getElementById('sms-target-student').value;
            const classVal = document.getElementById('sms-target-class').value;
            const textarea = document.getElementById('sms-text');

            if (template === 'custom') {
                updateSmsLivePreview();
                return;
            }

            let msg = "";
            let namePlaceholder = "[Student]";
            let gpaPlaceholder = "4.50";
            let gradePlaceholder = "A";

            if (targetStudentId !== 'All') {
                const students = loadStudents();
                const s = students.find(stud => stud.id === targetStudentId);
                if (s) {
                    namePlaceholder = s.name;

                    // Fetch real marks if possible to make preview dynamic
                    const allMarks = loadStudentMarks();
                    const key = `marks_${s.id}_Half-Yearly Examination 2026`;
                    const marks = allMarks[key];
                    if (marks) {
                        const subMap = loadSubjects();
                        let subjects = subMap[classVal] || [];
                        const subjectResults = [];

                        if (classVal === 'Nine' || classVal === 'Ten') {
                            let studentGroup = (s.group || s.branch || s.section || '').toLowerCase();
                            if (!studentGroup || studentGroup === 'none' || studentGroup === 'a') {
                                const nameLower = (s.name || '').toLowerCase().trim();
                                if (nameLower.endsWith('s') || nameLower.includes(' s') || nameLower.includes('— s') || nameLower.includes('- s')) {
                                    studentGroup = 'science';
                                } else if (nameLower.endsWith('a') || nameLower.includes(' a') || nameLower.includes('— a') || nameLower.includes('- a')) {
                                    studentGroup = 'humanities';
                                } else if (nameLower.endsWith('b') || nameLower.includes(' b') || nameLower.includes('— b') || nameLower.includes('- b')) {
                                    studentGroup = 'business';
                                }
                            }
                            const matchGroupAndSection = (stdGrp, sec) => {
                                const sg = stdGrp.toLowerCase().trim();
                                const sc = sec.toLowerCase().trim();
                                if (sg === sc) return true;
                                if (sg === 'science' && sc === 'a') return true;
                                if (sg === 'humanities' && sc === 'b') return true;
                                if (sg === 'business' && sc === 'c') return true;
                                return false;
                            };
                            subjects = subjects.filter(sub => {
                                if (!sub.section || sub.section === 'All') return true;
                                const subSecs = sub.section.split(',').map(s => s.trim().toLowerCase());
                                return subSecs.some(sec => matchGroupAndSection(studentGroup, sec));
                            });
                        }

                        subjects.forEach(sub => {
                            const markVal = marks[sub.code] !== undefined ? marks[sub.code] : 0;
                            let totalMark = 0;
                            let isAbsent = false;
                            if (markVal && typeof markVal === 'object') {
                                totalMark = markVal.total !== undefined ? markVal.total : 0;
                                isAbsent = !!markVal.isAbsent;
                            } else {
                                totalMark = markVal;
                            }

                            const examTypes = loadExamTypes();
                            const examType = examTypes.find(t => t.name === "Half-Yearly Examination 2026") || { defaultCQ: 100, defaultMCQ: 0, defaultPractical: 0, overrides: [], passMarkPercent: 33 };
                            const dist = getSubjectDistribution(sub.code, examType);
                            const subjectTotal = dist.cq + dist.mcq + dist.practical;
                            const passPercent = examType.passMarkPercent !== undefined ? examType.passMarkPercent : 33;

                            const gd = isAbsent ? { name: "F", gp: 0.0 } : getGradeDetails(totalMark, subjectTotal, passPercent);
                            subjectResults.push({
                                isOptional: !!sub.isOptional,
                                gp: gd.gp,
                                isAbsent: isAbsent
                            });
                        });

                        const overall = calculateOverallResult(subjectResults);
                        gpaPlaceholder = overall.gpaString;
                        gradePlaceholder = overall.grade;
                    }
                }
            }

            if (template === 'routine') {
                msg = `Dear Guardian, the Half-Yearly Exam routine for ${classVal} has been published on the smart portal. Routine starts on July 10, 2026. Please check website for details. - Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School`;
            } else if (template === 'results') {
                msg = `Dear Guardian, the Half-Yearly Exam results for ${namePlaceholder} (${classVal}) have been published on the portal. GPA: ${gpaPlaceholder}, Grade: ${gradePlaceholder}. - Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School`;
            }

            textarea.value = msg;
            updateSmsLivePreview();
        }

        function updateSmsLivePreview() {
            const text = document.getElementById('sms-text').value;
            const previewEl = document.getElementById('phone-bubble-text');
            const charCountEl = document.getElementById('sms-char-counter');
            const creditEl = document.getElementById('sms-credit-counter');

            if (!text.trim()) {
                previewEl.innerText = "Message preview will appear here in real-time as you compose...";
            } else {
                previewEl.innerText = text;
            }

            const chars = text.length;
            charCountEl.innerText = `${chars} / 160 characters`;

            const credits = Math.ceil(chars / 160) || 1;
            creditEl.innerText = `${credits} SMS Credit` + (credits > 1 ? 's' : '');
        }

        function simulateBulkSmsSend() {
            const classVal = document.getElementById('sms-target-class').value;
            const targetStudentId = document.getElementById('sms-target-student').value;
            const text = document.getElementById('sms-text').value.trim();

            if (!text) {
                alert("Please compose an SMS message first!");
                return;
            }

            const students = loadStudents();
            let targets = [];

            if (targetStudentId === 'All') {
                targets = students.filter(s => s.class === classVal);
            } else {
                const s = students.find(stud => stud.id === targetStudentId);
                if (s) targets.push(s);
            }

            if (targets.length === 0) {
                alert(`No registered students found in ${classVal}. Add students in the Student Portal first!`);
                return;
            }
 
            // Load configured BulkSMSBD settings
            let smsConfig = {
                provider: "BulkSMSBD",
                apiKey: "Cxo5awXxNbJj8P1BN0Pm",
                senderId: "8809648908844",
                apiUrl: "http://bulksmsbd.net/api/smsapi",
                smsType: "text"
            };
            try {
                const stored = localStorage.getItem('school_sms_config');
                if (stored) smsConfig = { ...smsConfig, ...JSON.parse(stored) };
            } catch (e) { }

            // Show progress overlay
            const progressContainer = document.getElementById('sms-progress-container');
            const progressBar = document.getElementById('sms-progress-bar');
            const progressPercent = document.getElementById('sms-progress-percent');
            const logsContainer = document.getElementById('sms-broadcast-logs');

            progressContainer.style.display = "block";
            progressBar.style.width = "0%";
            progressPercent.innerText = "0%";
            logsContainer.innerHTML = `<div style="color:var(--neon-cyan);">Connecting to BulkSMSBD Gateway (SenderID: ${smsConfig.senderId})...</div>`;

            let currentIndex = 0;
            const total = targets.length;

            const sendInterval = setInterval(() => {
                if (currentIndex >= total) {
                    clearInterval(sendInterval);
                    progressPercent.innerText = "100%";
                    progressBar.style.width = "100%";
                    setTimeout(() => {
                        alert(`SMS Broadcasing Complete! Successfully dispatched ${total} SMS notifications via BulkSMSBD Gateway.`);
                        progressContainer.style.display = "none";
                    }, 500);
                    return;
                }

                const s = targets[currentIndex];
                const cleanPhone = s.phone || "01700000000";

                // Formulate personalized SMS log message
                const personalText = text
                    .replace(/\[Student\]/g, s.name)
                    .replace(/Class \d+/g, s.class);

                // Dispatch via BulkSMSBD API if configured
                if (cleanPhone && smsConfig.apiKey && smsConfig.senderId) {
                    try {
                        let formattedNum = cleanPhone.replace(/[^0-9]/g, '');
                        if (formattedNum.startsWith('01')) formattedNum = '88' + formattedNum;
                        if (formattedNum.length === 10 && formattedNum.startsWith('1')) formattedNum = '880' + formattedNum;
                        
                        const apiReqUrl = `${smsConfig.apiUrl || 'http://bulksmsbd.net/api/smsapi'}?api_key=${encodeURIComponent(smsConfig.apiKey)}&type=${encodeURIComponent(smsConfig.smsType || 'text')}&number=${encodeURIComponent(formattedNum)}&senderid=${encodeURIComponent(smsConfig.senderId)}&message=${encodeURIComponent(personalText)}`;
                        
                        fetch(apiReqUrl, { method: 'GET', mode: 'no-cors' }).catch(() => { });
                        const ping = new Image();
                        ping.src = apiReqUrl + '&_ts=' + Date.now();
                    } catch (e) { }
                }

                const newLog = document.createElement('div');
                newLog.innerHTML = `Dispatched SMS to parent of <strong style="color:#fff;">${s.name}</strong> (${cleanPhone}) - <span style="color:var(--neon-green);">BulkSMSBD SUCCESS ✓</span>`;
                logsContainer.appendChild(newLog);
                logsContainer.scrollTop = logsContainer.scrollHeight;

                currentIndex++;
                const percentage = Math.round((currentIndex / total) * 100);
                progressPercent.innerText = `${percentage}%`;
                progressBar.style.width = `${percentage}%`;

            }, 550); // Small transmission delay to look very premium & realistic
        }

        // --- EXAM PORTAL LIVE QUIZ SYSTEM (PRESERVED) ---
        const quizData = [
            {
                question: "What is the national fruit of Bangladesh?",
                options: ["Mango", "Jackfruit", "Litchi", "Banana"],
                correct: 1
            },
            {
                question: "Which is the largest planet in our solar system?",
                options: ["Mars", "Mercury", "Jupiter", "Saturn"],
                correct: 2
            },
            {
                question: "What is the chemical formula of water?",
                options: ["CO2", "H2O", "O2", "NaCl"],
                correct: 1
            }
        ];

        let quizIndex = 0;
        let quizScore = 0;
        let hasAnswered = false;

        function loadQuizQuestion() {
            hasAnswered = false;
            const nextBtn = document.getElementById('quiz-next-btn');
            if (nextBtn) nextBtn.style.display = "none";

            const qData = quizData[quizIndex];
            const qNumEl = document.getElementById('quiz-q-num');
            const qTextEl = document.getElementById('quiz-question-text');
            const qScoreEl = document.getElementById('quiz-score');

            if (qNumEl) qNumEl.innerText = (quizIndex + 1) + "/" + quizData.length;
            if (qTextEl) qTextEl.innerText = qData.question;
            if (qScoreEl) qScoreEl.innerText = quizScore;

            for (let i = 0; i < 4; i++) {
                const optEl = document.getElementById('opt-' + i);
                const optText = document.getElementById('opt-text-' + i);
                if (optText) optText.innerText = qData.options[i];
                if (optEl) optEl.className = "quiz-option"; // Reset classes
            }
        }

        function checkQuizAnswer(selectedIdx) {
            if (hasAnswered) return;
            hasAnswered = true;

            const correctIdx = quizData[quizIndex].correct;
            const optElSelected = document.getElementById('opt-' + selectedIdx);
            const optElCorrect = document.getElementById('opt-' + correctIdx);

            if (selectedIdx === correctIdx) {
                if (optElSelected) optElSelected.classList.add('correct');
                quizScore += 10;
                const scoreEl = document.getElementById('quiz-score');
                if (scoreEl) scoreEl.innerText = quizScore;
            } else {
                if (optElSelected) optElSelected.classList.add('incorrect');
                if (optElCorrect) optElCorrect.classList.add('correct');
            }

            // Show next button
            const nextBtn = document.getElementById('quiz-next-btn');
            if (nextBtn) nextBtn.style.display = "block";
        }

        function loadNextQuiz() {
            quizIndex++;
            if (quizIndex < quizData.length) {
                loadQuizQuestion();
            } else {
                // Finished quiz
                const quizBlock = document.getElementById('quiz-block');
                if (quizBlock) {
                    quizBlock.innerHTML = `
                        <div style="text-align:center; padding: 20px 0;">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" stroke-width="2" style="margin-bottom:15px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            <h4 style="color:#fff; font-size:1.3rem; margin-bottom:10px;">Congratulations! Quiz Finished</h4>
                            <p style="color:var(--muted-text);">Your total score: <strong style="color:var(--neon-cyan); font-size:1.5rem;">\${quizScore}</strong></p>
                            <button class="btn-primary" style="margin-top:20px;" onclick="resetQuiz()">Play Again</button>
                        </div>
                    `;
                }
            }
        }

        function resetQuiz() {
            quizIndex = 0;
            quizScore = 0;
            const quizBlock = document.getElementById('quiz-block');
            if (quizBlock) {
                quizBlock.innerHTML = `
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--neon-cyan);">
                        <span>Question No: <span id="quiz-q-num">1/3</span></span>
                        <span>Score: <span id="quiz-score">0</span></span>
                    </div>
                    <div class="quiz-question" id="quiz-question-text">Who is the national poet of Bangladesh?</div>
                    
                    <div class="quiz-option" id="opt-0" onclick="checkQuizAnswer(0)">
                        <span style="font-weight:bold;">A.</span> <span id="opt-text-0">Rabindranath Tagore</span>
                    </div>
                    <div class="quiz-option" id="opt-1" onclick="checkQuizAnswer(1)">
                        <span style="font-weight:bold;">B.</span> <span id="opt-text-1">Kazi Nazrul Islam</span>
                    </div>
                    <div class="quiz-option" id="opt-2" onclick="checkQuizAnswer(2)">
                        <span style="font-weight:bold;">C.</span> <span id="opt-text-2">Jasimmudin</span>
                    </div>
                    <div class="quiz-option" id="opt-3" onclick="checkQuizAnswer(3)">
                        <span style="font-weight:bold;">D.</span> <span id="opt-text-3">Jibanananda Das</span>
                    </div>
                    <button class="btn-primary" id="quiz-next-btn" style="margin-top:15px; display:none;" onclick="loadNextQuiz()">Next Question</button>
                `;
            }
            loadQuizQuestion();
        }

        // --- MOBILE PHONE CLOCK ---
        function updateMockPhoneTime() {
            const timeEl = document.getElementById('phone-time');
            if (timeEl) {
                const now = new Date();
                let hours = now.getHours();
                let minutes = now.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                timeEl.textContent = `${hours}:${minutes} \${ampm}`;
            }
        }

        // --- GLOBAL INITIALIZATIONS ---
        document.addEventListener('DOMContentLoaded', () => {
            // Pre-initialize databases
            loadSchedules();
            loadSubjects();
            loadMarkingSystem();
            loadExamTypes();
            populateExamDropdowns();

            // Initial render of Dashboard summary & Exam list
            renderDashboardRoutineSummary();

            // Check view and display the correct panel
            checkURLParameters();

            // Listen to browser popstate (back/forward clicks)
            window.addEventListener('popstate', checkURLParameters);

            // Update live mobile phone preview time clocks
            updateMockPhoneTime();
            setInterval(updateMockPhoneTime, 10000);
        });

        // Listen to Database Sync from Server (Periodic sync)
        window.addEventListener('dbSynced', () => {
            const params = new URLSearchParams(window.location.search);
            let view = params.get('view') || 'exam-entry';
            if (view === 'exam-list') view = 'exam-entry';

            // Always keep summary updated in background
            renderDashboardRoutineSummary();

            // Refresh tables dynamically on active views
            if (view === 'dashboard') {
                renderDashboardRoutineSummary();
            } else if (view === 'exam-entry') {
                renderScheduleList();
                populateClassDropdown('schedule-class');
                populateTeachersDropdown();
                updateScheduleSubjectsDropdown();
            } else if (view === 'marking-system') {
                renderMarkingSystem();
            } else if (view === 'all-subject') {
                renderSubjectList();
                const modal = document.getElementById('add-academic-subject-modal');
                const isModalOpen = modal && modal.classList.contains('active');
                if (!isModalOpen) {
                    populateSubjectSectionDropdown();
                }
            } else if (view === 'exam-types') {
                renderExamTypes();
                populateOverrideSubjectsDropdown();
            }
        });

        // Listen for storage changes to keep schedules, subjects and section dropdowns updated in real-time
        window.addEventListener('storage', (e) => {
            if (e.key === 'school_exam_schedules' || e.key === 'school_student_marks') {
                renderDashboardRoutineSummary();
                if (typeof renderScheduleList === 'function') {
                    renderScheduleList();
                }
            }

            if (e.key === 'school_exam_types') {
                loadExamTypes();
                populateExamDropdowns();
                populateScheduleExamTypesDropdown();
                renderDashboardRoutineSummary();
                if (typeof renderScheduleList === 'function') {
                    renderScheduleList();
                }
                if (typeof renderExamTypes === 'function') {
                    renderExamTypes();
                }
                if (typeof updateScheduleDistLivePreview === 'function') {
                    updateScheduleDistLivePreview();
                }
            }

            if (e.key === 'school_class_sections' || e.key === 'school_classes' || e.key === 'school_subjects') {
                populateDropdownsForSubjects();
                renderSubjectList();
                
                const modal = document.getElementById('add-academic-subject-modal');
                const isModalOpen = modal && modal.classList.contains('active');
                if (!isModalOpen) {
                    populateSubjectSectionDropdown();
                }
            }
        });
    
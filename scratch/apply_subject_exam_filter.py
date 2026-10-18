import sys

sys.stdout.reconfigure(encoding='utf-8')

# ----------------------------------------------------
# 1. Update Marksheet.html
# ----------------------------------------------------
with open('Marksheet.html', 'r', encoding='utf-8') as f:
    m_content = f.read()

old_m_block = """        // 1. Get all available Exams from "Exam List" (school_exam_schedules) and Exam Portal
        function getAllExams() {
            const examList = [];
            const seen = new Set();

            function addExam(name) {
                if (!name || typeof name !== 'string') return;
                const clean = name.trim();
                if (!clean) return;
                const key = clean.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    examList.push(clean);
                }
            }

            // Priority 1: From "Exam List" (school_exam_schedules)
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s) {
                                addExam(s.term || s.examName);
                            }
                        });
                    }
                }
            } catch(e) {}

            // Priority 2: From "Exam Names" (school_exam_types)
            try {
                const rawTypes = localStorage.getItem('school_exam_types');
                if (rawTypes) {
                    const parsed = JSON.parse(rawTypes);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(t => {
                            if (t && t.name) addExam(t.name);
                            else if (typeof t === 'string') addExam(t);
                        });
                    }
                }
            } catch(e) {}

            // Priority 3: From Routines (school_exam_routines)
            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r) addExam(r.examName || r.term);
                        });
                    }
                }
            } catch(e) {}

            // Priority 4: From OMR Exams (school_omr_exams)
            try {
                const rawOmr = localStorage.getItem('school_omr_exams');
                if (rawOmr) {
                    const parsed = JSON.parse(rawOmr);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(o => {
                            if (o) addExam(o.examName || o.term);
                        });
                    }
                }
            } catch(e) {}

            if (examList.length === 0) {
                const defaultExams = [
                    "বার্ষিক পরীক্ষা",
                    "অর্ধ-বার্ষিক পরীক্ষা",
                    "প্রাক-নির্বাচনী পরীক্ষা",
                    "নির্বাচনী পরীক্ষা",
                    "১ম সাময়িক পরীক্ষা",
                    "২য় সাময়িক পরীক্ষা",
                    "মডেল টেস্ট"
                ];
                defaultExams.forEach(addExam);
            }
            return examList;
        }

        // 2. Get Classes based strictly on Selected Exam Name ("Exam List" & Routines)
        function getClassesForExam(examName) {
            const classSet = new Set();

            // 1. Check "Exam List" (school_exam_schedules)
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s) {
                                const sExam = s.term || s.examName;
                                if (!examName || isExamMatch(sExam, examName)) {
                                    const rawCls = s.class || s.className;
                                    if (rawCls) {
                                        String(rawCls).split(',').forEach(part => {
                                            const fmt = formatClassNameDisplay(part.trim());
                                            if (fmt) classSet.add(fmt);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            // 2. Check Routines (school_exam_routines)
            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r) {
                                const rExam = r.examName || r.term;
                                if (!examName || isExamMatch(rExam, examName)) {
                                    const rawCls = r.className || r.class;
                                    if (rawCls) {
                                        String(rawCls).split(',').forEach(part => {
                                            const fmt = formatClassNameDisplay(part.trim());
                                            if (fmt) classSet.add(fmt);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            // 3. Check OMR Exams (school_omr_exams)
            try {
                const rawOmr = localStorage.getItem('school_omr_exams');
                if (rawOmr) {
                    const parsed = JSON.parse(rawOmr);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(o => {
                            if (o) {
                                const oExam = o.examName || o.term;
                                if (!examName || isExamMatch(oExam, examName)) {
                                    const rawCls = o.class || o.className;
                                    if (rawCls) {
                                        String(rawCls).split(',').forEach(part => {
                                            const fmt = formatClassNameDisplay(part.trim());
                                            if (fmt) classSet.add(fmt);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            // Fallback only if this exam has no specific schedules, routines, or omr assigned yet
            if (classSet.size === 0) {
                try {
                    const rawClasses = localStorage.getItem('school_classes');
                    if (rawClasses) {
                        const parsed = JSON.parse(rawClasses);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(c => {
                                const val = typeof c === 'string' ? c : (c && c.name ? c.name : '');
                                if (val && val.trim()) classSet.add(formatClassNameDisplay(val));
                            });
                        }
                    }
                } catch(e) {}

                try {
                    const rawStudents = localStorage.getItem('school_students');
                    if (rawStudents) {
                        const parsed = JSON.parse(rawStudents);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(s => {
                                if (s && (s.class || s.className)) classSet.add(formatClassNameDisplay(s.class || s.className));
                            });
                        }
                    }
                } catch(e) {}
            }

            const defaultClasses = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            if (classSet.size === 0) defaultClasses.forEach(c => classSet.add(c));
            return sortClassesSequential(classSet);
        }"""

new_m_block = """        // 1. Get all available Exams from "Exam List" (school_exam_schedules) that have an exam created with a subject
        function getAllExams() {
            const examList = [];
            const seen = new Set();

            function addExam(name) {
                if (!name || typeof name !== 'string') return;
                const clean = name.trim();
                if (!clean) return;
                const key = clean.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    examList.push(clean);
                }
            }

            // "Exam List" (school_exam_schedules) এ যে Exam Name এর নামে Subject সহ Exam Create করা থাকবে, শুধুমাত্র সেই Exam Name-ই Marksheet সেকশনে দৃশ্যমান হবে
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && typeof s === 'object') {
                                const examName = (s.term || s.examName || '').trim();
                                const subject = (s.subject || s.subjectName || s.sub || '').trim();
                                if (examName && subject) {
                                    addExam(examName);
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            return examList;
        }

        // 2. Get Classes based strictly on Selected Exam Name ("Exam List" schedules with subject)
        function getClassesForExam(examName) {
            const classSet = new Set();

            // 1. Check "Exam List" (school_exam_schedules) for schedules with a subject
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && typeof s === 'object') {
                                const sExam = (s.term || s.examName || '').trim();
                                const sSubject = (s.subject || s.subjectName || s.sub || '').trim();
                                if (sExam && sSubject && (!examName || isExamMatch(sExam, examName))) {
                                    const rawCls = s.class || s.className;
                                    if (rawCls) {
                                        String(rawCls).split(',').forEach(part => {
                                            const fmt = formatClassNameDisplay(part.trim());
                                            if (fmt) classSet.add(fmt);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            // 2. Also include classes from routines if they match this created exam
            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r) {
                                const rExam = r.examName || r.term;
                                if (!examName || isExamMatch(rExam, examName)) {
                                    const rawCls = r.className || r.class;
                                    if (rawCls) {
                                        String(rawCls).split(',').forEach(part => {
                                            const fmt = formatClassNameDisplay(part.trim());
                                            if (fmt) classSet.add(fmt);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            return sortClassesSequential(classSet);
        }"""

assert old_m_block in m_content, "old_m_block not found in Marksheet.html"
m_content = m_content.replace(old_m_block, new_m_block)

old_m_sync_part = """                // 1. Sync Exams from "Exam List"
                if (examSelect && (trigger === 'all' || trigger === 'exam_sync')) {
                    const currentExam = examSelect.value || localStorage.getItem('school_marksheet_exam') || '';
                    const currExamOpts = Array.from(examSelect.options).map(o => o.value);
                    const isDiff = allExams.length !== currExamOpts.length || allExams.some((ex, i) => ex !== currExamOpts[i]);
                    if (isDiff) {
                        examSelect.innerHTML = allExams.map(ex => `<option value="${ex}">${ex}</option>`).join('');
                        const matchedOpt = allExams.find(ex => isExamMatch(ex, currentExam));
                        if (matchedOpt) {
                            examSelect.value = matchedOpt;
                        } else if (allExams.length > 0) {
                            examSelect.selectedIndex = 0;
                        }
                    }
                }

                const selectedExam = examSelect && examSelect.value ? examSelect.value : (allExams[0] || 'বার্ষিক পরীক্ষা');
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
                }"""

new_m_sync_part = """                // 1. Sync Exams from "Exam List" (Only exams with a subject created)
                if (examSelect && (trigger === 'all' || trigger === 'exam_sync')) {
                    const currentExam = examSelect.value || localStorage.getItem('school_marksheet_exam') || '';
                    const currExamOpts = Array.from(examSelect.options).map(o => o.value);
                    const isDiff = allExams.length !== currExamOpts.length || allExams.some((ex, i) => ex !== currExamOpts[i]);
                    if (isDiff) {
                        if (allExams.length > 0) {
                            examSelect.innerHTML = allExams.map(ex => `<option value="${ex}">${ex}</option>`).join('');
                            const matchedOpt = allExams.find(ex => isExamMatch(ex, currentExam));
                            if (matchedOpt) {
                                examSelect.value = matchedOpt;
                            } else {
                                examSelect.selectedIndex = 0;
                            }
                        } else {
                            examSelect.innerHTML = '<option value="">(কোনো পরীক্ষা পাওয়া যায়নি)</option>';
                            examSelect.value = '';
                        }
                    }
                }

                const selectedExam = examSelect && examSelect.value ? examSelect.value : (allExams[0] || '');
                localStorage.setItem('school_marksheet_exam', selectedExam);
                const examBadge = document.getElementById('display-exam-name');
                if (examBadge) examBadge.innerText = selectedExam;

                // 2. Sync Classes (Dependent on selectedExam)
                if (classSelect && (trigger === 'all' || trigger === 'exam_sync' || trigger === 'exam_changed')) {
                    const currentClass = classSelect.value || localStorage.getItem('school_marksheet_class') || '';
                    const availableClasses = selectedExam ? getClassesForExam(selectedExam) : [];
                    const currClassOpts = Array.from(classSelect.options).map(o => o.value);
                    const isClassDiff = availableClasses.length !== currClassOpts.length || availableClasses.some((c, i) => c !== currClassOpts[i]);
                    if (isClassDiff) {
                        if (availableClasses.length > 0) {
                            classSelect.innerHTML = availableClasses.map(c => `<option value="${c}">${c}</option>`).join('');
                            const matchedOpt = availableClasses.find(c => normalizeClassString(c) === normalizeClassString(currentClass));
                            if (matchedOpt) {
                                classSelect.value = matchedOpt;
                            } else {
                                classSelect.selectedIndex = 0;
                            }
                        } else {
                            classSelect.innerHTML = '<option value="">(কোনো শ্রেণি পাওয়া যায়নি)</option>';
                            classSelect.value = '';
                        }
                    }
                }"""

assert old_m_sync_part in m_content, "old_m_sync_part not found in Marksheet.html"
m_content = m_content.replace(old_m_sync_part, new_m_sync_part)

with open('Marksheet.html', 'w', encoding='utf-8') as f:
    f.write(m_content)
print("Marksheet.html successfully updated with strict subject exam filter.")


# ----------------------------------------------------
# 2. Update Marksheet1.html
# ----------------------------------------------------
with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    m1_content = f.read()

old_m1_block = """// 1. Get all available Exams from "Exam List" (school_exam_schedules) and Exam Portal
function getAllExams() {
    const examList = [];
    const seen = new Set();

    function addExam(name) {
        if (!name || typeof name !== 'string') return;
        const clean = name.trim();
        if (!clean) return;
        const key = clean.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            examList.push(clean);
        }
    }

    // Priority 1: From "Exam List" (school_exam_schedules)
    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s) {
                        addExam(s.term || s.examName);
                    }
                });
            }
        }
    } catch(e) {}

    // Priority 2: From "Exam Names" (school_exam_types)
    try {
        const rawTypes = localStorage.getItem('school_exam_types');
        if (rawTypes) {
            const parsed = JSON.parse(rawTypes);
            if (Array.isArray(parsed)) {
                parsed.forEach(t => {
                    if (t && t.name) addExam(t.name);
                    else if (typeof t === 'string') addExam(t);
                });
            }
        }
    } catch(e) {}

    // Priority 3: From Routines (school_exam_routines)
    try {
        const rawRoutines = localStorage.getItem('school_exam_routines');
        if (rawRoutines) {
            const parsed = JSON.parse(rawRoutines);
            if (Array.isArray(parsed)) {
                parsed.forEach(r => {
                    if (r) addExam(r.examName || r.term);
                });
            }
        }
    } catch(e) {}

    // Priority 4: From OMR Exams (school_omr_exams)
    try {
        const rawOmr = localStorage.getItem('school_omr_exams');
        if (rawOmr) {
            const parsed = JSON.parse(rawOmr);
            if (Array.isArray(parsed)) {
                parsed.forEach(o => {
                    if (o) addExam(o.examName || o.term);
                });
            }
        }
    } catch(e) {}

    if (examList.length === 0) {
        const defaultExams = [
            "বার্ষিক পরীক্ষা",
            "অর্ধ-বার্ষিক পরীক্ষা",
            "প্রাক-নির্বাচনী পরীক্ষা",
            "নির্বাচনী পরীক্ষা",
            "১ম সাময়িক পরীক্ষা",
            "২য় সাময়িক পরীক্ষা",
            "মডেল টেস্ট"
        ];
        defaultExams.forEach(addExam);
    }
    return examList;
}

// 2. Get Classes based strictly on Selected Exam Name ("Exam List" & Routines)
function getClassesForExam(examName) {
    const classSet = new Set();

    // 1. Check "Exam List" (school_exam_schedules)
    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s) {
                        const sExam = s.term || s.examName;
                        if (!examName || isExamMatch(sExam, examName)) {
                            const rawCls = s.class || s.className;
                            if (rawCls) {
                                String(rawCls).split(',').forEach(part => {
                                    const fmt = formatClassNameDisplay(part.trim());
                                    if (fmt) classSet.add(fmt);
                                });
                            }
                        }
                    }
                });
            }
        }
    } catch(e) {}

    // 2. Check Routines (school_exam_routines)
    try {
        const rawRoutines = localStorage.getItem('school_exam_routines');
        if (rawRoutines) {
            const parsed = JSON.parse(rawRoutines);
            if (Array.isArray(parsed)) {
                parsed.forEach(r => {
                    if (r) {
                        const rExam = r.examName || r.term;
                        if (!examName || isExamMatch(rExam, examName)) {
                            const rawCls = r.className || r.class;
                            if (rawCls) {
                                String(rawCls).split(',').forEach(part => {
                                    const fmt = formatClassNameDisplay(part.trim());
                                    if (fmt) classSet.add(fmt);
                                });
                            }
                        }
                    }
                });
            }
        }
    } catch(e) {}

    // 3. Check OMR Exams (school_omr_exams)
    try {
        const rawOmr = localStorage.getItem('school_omr_exams');
        if (rawOmr) {
            const parsed = JSON.parse(rawOmr);
            if (Array.isArray(parsed)) {
                parsed.forEach(o => {
                    if (o) {
                        const oExam = o.examName || o.term;
                        if (!examName || isExamMatch(oExam, examName)) {
                            const rawCls = o.class || o.className;
                            if (rawCls) {
                                String(rawCls).split(',').forEach(part => {
                                    const fmt = formatClassNameDisplay(part.trim());
                                    if (fmt) classSet.add(fmt);
                                });
                            }
                        }
                    }
                });
            }
        }
    } catch(e) {}

    // Fallback only if this exam has no specific schedules, routines, or omr assigned yet
    if (classSet.size === 0) {
        try {
            const rawClasses = localStorage.getItem('school_classes');
            if (rawClasses) {
                const parsed = JSON.parse(rawClasses);
                if (Array.isArray(parsed)) {
                    parsed.forEach(c => {
                        const val = typeof c === 'string' ? c : (c && c.name ? c.name : '');
                        if (val && val.trim()) classSet.add(formatClassNameDisplay(val));
                    });
                }
            }
        } catch(e) {}

        try {
            const rawStudents = localStorage.getItem('school_students');
            if (rawStudents) {
                const parsed = JSON.parse(rawStudents);
                if (Array.isArray(parsed)) {
                    parsed.forEach(s => {
                        if (s && (s.class || s.className)) classSet.add(formatClassNameDisplay(s.class || s.className));
                    });
                }
            }
        } catch(e) {}
    }

    const defaultClasses = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
    if (classSet.size === 0) defaultClasses.forEach(c => classSet.add(c));
    return sortClassesSequential(classSet);
}"""

new_m1_block = """// 1. Get all available Exams from "Exam List" (school_exam_schedules) that have an exam created with a subject
function getAllExams() {
    const examList = [];
    const seen = new Set();

    function addExam(name) {
        if (!name || typeof name !== 'string') return;
        const clean = name.trim();
        if (!clean) return;
        const key = clean.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            examList.push(clean);
        }
    }

    // "Exam List" (school_exam_schedules) এ যে Exam Name এর নামে Subject সহ Exam Create করা থাকবে, শুধুমাত্র সেই Exam Name-ই Marksheet সেকশনে দৃশ্যমান হবে
    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && typeof s === 'object') {
                        const examName = (s.term || s.examName || '').trim();
                        const subject = (s.subject || s.subjectName || s.sub || '').trim();
                        if (examName && subject) {
                            addExam(examName);
                        }
                    }
                });
            }
        }
    } catch(e) {}

    return examList;
}

// 2. Get Classes based strictly on Selected Exam Name ("Exam List" schedules with subject)
function getClassesForExam(examName) {
    const classSet = new Set();

    // 1. Check "Exam List" (school_exam_schedules) for schedules with a subject
    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && typeof s === 'object') {
                        const sExam = (s.term || s.examName || '').trim();
                        const sSubject = (s.subject || s.subjectName || s.sub || '').trim();
                        if (sExam && sSubject && (!examName || isExamMatch(sExam, examName))) {
                            const rawCls = s.class || s.className;
                            if (rawCls) {
                                String(rawCls).split(',').forEach(part => {
                                    const fmt = formatClassNameDisplay(part.trim());
                                    if (fmt) classSet.add(fmt);
                                });
                            }
                        }
                    }
                });
            }
        }
    } catch(e) {}

    // 2. Also include classes from routines if they match this created exam
    try {
        const rawRoutines = localStorage.getItem('school_exam_routines');
        if (rawRoutines) {
            const parsed = JSON.parse(rawRoutines);
            if (Array.isArray(parsed)) {
                parsed.forEach(r => {
                    if (r) {
                        const rExam = r.examName || r.term;
                        if (!examName || isExamMatch(rExam, examName)) {
                            const rawCls = r.className || r.class;
                            if (rawCls) {
                                String(rawCls).split(',').forEach(part => {
                                    const fmt = formatClassNameDisplay(part.trim());
                                    if (fmt) classSet.add(fmt);
                                });
                            }
                        }
                    }
                });
            }
        }
    } catch(e) {}

    return sortClassesSequential(classSet);
}"""

assert old_m1_block in m1_content, "old_m1_block not found in Marksheet1.html"
m1_content = m1_content.replace(old_m1_block, new_m1_block)

old_m1_sync_part = """        // 1. Sync Exams from "Exam List"
        if (examSelect && (trigger === 'all' || trigger === 'exam_sync')) {
            const currentExam = examSelect.value || localStorage.getItem('school_marksheet_exam') || '';
            const currExamOpts = Array.from(examSelect.options).map(o => o.value);
            const isDiff = allExams.length !== currExamOpts.length || allExams.some((ex, i) => ex !== currExamOpts[i]);
            if (isDiff) {
                examSelect.innerHTML = allExams.map(ex => `<option value="${ex}">${ex}</option>`).join('');
                const matchedOpt = allExams.find(ex => isExamMatch(ex, currentExam));
                if (matchedOpt) {
                    examSelect.value = matchedOpt;
                } else if (allExams.length > 0) {
                    examSelect.selectedIndex = 0;
                }
            }
        }

        const selectedExam = examSelect && examSelect.value ? examSelect.value : (allExams[0] || 'বার্ষিক পরীক্ষা');
        localStorage.setItem('school_marksheet_exam', selectedExam);
        const examPill = document.getElementById('display-exam-name-pill');
        if (examPill) examPill.innerText = selectedExam;

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
        }"""

new_m1_sync_part = """        // 1. Sync Exams from "Exam List" (Only exams with a subject created)
        if (examSelect && (trigger === 'all' || trigger === 'exam_sync')) {
            const currentExam = examSelect.value || localStorage.getItem('school_marksheet_exam') || '';
            const currExamOpts = Array.from(examSelect.options).map(o => o.value);
            const isDiff = allExams.length !== currExamOpts.length || allExams.some((ex, i) => ex !== currExamOpts[i]);
            if (isDiff) {
                if (allExams.length > 0) {
                    examSelect.innerHTML = allExams.map(ex => `<option value="${ex}">${ex}</option>`).join('');
                    const matchedOpt = allExams.find(ex => isExamMatch(ex, currentExam));
                    if (matchedOpt) {
                        examSelect.value = matchedOpt;
                    } else {
                        examSelect.selectedIndex = 0;
                    }
                } else {
                    examSelect.innerHTML = '<option value="">(কোনো পরীক্ষা পাওয়া যায়নি)</option>';
                    examSelect.value = '';
                }
            }
        }

        const selectedExam = examSelect && examSelect.value ? examSelect.value : (allExams[0] || '');
        localStorage.setItem('school_marksheet_exam', selectedExam);
        const examPill = document.getElementById('display-exam-name-pill');
        if (examPill) examPill.innerText = selectedExam;

        // 2. Sync Classes (Dependent on selectedExam)
        if (classSelect && (trigger === 'all' || trigger === 'exam_sync' || trigger === 'exam_changed')) {
            const currentClass = classSelect.value || localStorage.getItem('school_marksheet_class') || '';
            const availableClasses = selectedExam ? getClassesForExam(selectedExam) : [];
            const currClassOpts = Array.from(classSelect.options).map(o => o.value);
            const isClassDiff = availableClasses.length !== currClassOpts.length || availableClasses.some((c, i) => c !== currClassOpts[i]);
            if (isClassDiff) {
                if (availableClasses.length > 0) {
                    classSelect.innerHTML = availableClasses.map(c => `<option value="${c}">${c}</option>`).join('');
                    const matchedOpt = availableClasses.find(c => normalizeClassString(c) === normalizeClassString(currentClass));
                    if (matchedOpt) {
                        classSelect.value = matchedOpt;
                    } else {
                        classSelect.selectedIndex = 0;
                    }
                } else {
                    classSelect.innerHTML = '<option value="">(কোনো শ্রেণি পাওয়া যায়নি)</option>';
                    classSelect.value = '';
                }
            }
        }"""

assert old_m1_sync_part in m1_content, "old_m1_sync_part not found in Marksheet1.html"
m1_content = m1_content.replace(old_m1_sync_part, new_m1_sync_part)

with open('Marksheet1.html', 'w', encoding='utf-8') as f:
    f.write(m1_content)
print("Marksheet1.html successfully updated with strict subject exam filter.")

print("All updates applied cleanly!")

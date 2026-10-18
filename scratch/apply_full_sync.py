import sys, shutil, subprocess

sys.stdout.reconfigure(encoding='utf-8')

# Restore from backups
with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    m_content = f.read()

with open('Marksheet1.html.bak', 'r', encoding='utf-8') as f:
    m1_content = f.read()

# ----------------------------------------------------------------------------------
# 1. Update Marksheet.html
# ----------------------------------------------------------------------------------
old_m_block = """        // 1. Get all available Exams from Exam Portal / Settings
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
        }"""

new_m_block = """        // Helper to match exam names flexibly across routines, schedules, and types
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

        // 1. Get all available Exams from "Exam List" (school_exam_schedules) and Exam Portal
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

assert old_m_block in m_content, "old_m_block not found in Marksheet.html"
m_content = m_content.replace(old_m_block, new_m_block)

old_m_sync = """        // Master Cascading Filter Function
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
                if (secEl) secEl.innerText = 'শাখা = ' + selectedSection;"""

new_m_sync = """        // Master Cascading Filter Function
        function syncCascadingFilters(trigger = 'all') {
            try {
                const examSelect = document.getElementById('filter-exam');
                const classSelect = document.getElementById('filter-class');
                const sectionSelect = document.getElementById('filter-section');

                const allExams = getAllExams();

                // 1. Sync Exams from "Exam List"
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
                }

                const selectedClass = classSelect && classSelect.value ? classSelect.value : (localStorage.getItem('school_marksheet_class') || 'Ten');
                localStorage.setItem('school_marksheet_class', selectedClass);
                const classEl = document.getElementById('display-class-name');
                if (classEl) classEl.innerText = formatClassNameDisplay(selectedClass);

                // If currently searched/selected student is from a different class, clear it
                if (currentSelectedStudent && normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className) !== normalizeClassString(selectedClass)) {
                    currentSelectedStudent = null;
                    currentSearchQuery = '';
                    const searchInput = document.getElementById('filter-student-search');
                    const clearBtn = document.getElementById('btn-clear-search');
                    if (searchInput) searchInput.value = '';
                    if (clearBtn) clearBtn.style.display = 'none';
                }

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

                const selectedSection = sectionSelect && sectionSelect.value ? sectionSelect.value : (localStorage.getItem('school_marksheet_section') || 'বিজ্ঞান');
                localStorage.setItem('school_marksheet_section', selectedSection);
                const secEl = document.getElementById('display-section-name');
                if (secEl) secEl.innerText = 'শাখা = ' + selectedSection;"""

assert old_m_sync in m_content, "old_m_sync not found in Marksheet.html"
m_content = m_content.replace(old_m_sync, new_m_sync)

old_m_bottom = """        // Continuous Live Sync of Filter Options from Exam Portal
        function syncFiltersFromExamPortal() {
            syncCascadingFilters('exam_sync');
        }"""

new_m_bottom = """        // Background live sync from website server database (/api/db)
        function syncLiveExamData() {
            if (window._lastExamApiFetch && (Date.now() - window._lastExamApiFetch < 3000)) return;
            window._lastExamApiFetch = Date.now();
            fetch('/api/db?keys=school_exam_schedules,school_exam_types,school_exam_routines,school_omr_exams,school_classes,school_students,school_settings,school_logo')
                .then(r => r.json())
                .then(data => {
                    if (data && typeof data === 'object') {
                        let hasChanged = false;
                        ['school_exam_schedules', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_classes', 'school_students'].forEach(k => {
                            if (data[k]) {
                                const strVal = typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]);
                                if (localStorage.getItem(k) !== strVal) {
                                    localStorage.setItem(k, strVal);
                                    hasChanged = true;
                                }
                            }
                        });
                        if (data.school_settings) {
                            const strVal = typeof data.school_settings === 'string' ? data.school_settings : JSON.stringify(data.school_settings);
                            if (localStorage.getItem('school_settings') !== strVal) {
                                localStorage.setItem('school_settings', strVal);
                                if (typeof syncSchoolHeaderInfo === 'function') syncSchoolHeaderInfo();
                            }
                        }
                        if (data.school_logo && typeof data.school_logo === 'string') {
                            if (localStorage.getItem('school_logo') !== data.school_logo) {
                                localStorage.setItem('school_logo', data.school_logo);
                                if (typeof syncSchoolHeaderInfo === 'function') syncSchoolHeaderInfo();
                            }
                        }
                        if (hasChanged) {
                            syncCascadingFilters('exam_sync');
                        }
                    }
                })
                .catch(() => {});
        }

        // Continuous Live Sync of Filter Options from Exam Portal
        function syncFiltersFromExamPortal() {
            syncLiveExamData();
            syncCascadingFilters('exam_sync');
        }"""

assert old_m_bottom in m_content, "old_m_bottom not found in Marksheet.html"
m_content = m_content.replace(old_m_bottom, new_m_bottom)

old_m_interval = """        // Continuous heartbeat sync every 2.5 seconds
        setInterval(function() {
            syncSchoolHeaderInfo();
            syncCascadingFilters('exam_sync');
        }, 2500);"""

new_m_interval = """        // Continuous heartbeat sync every 2.5 seconds
        setInterval(function() {
            syncSchoolHeaderInfo();
            syncLiveExamData();
            syncCascadingFilters('exam_sync');
        }, 2500);"""

assert old_m_interval in m_content, "old_m_interval not found in Marksheet.html"
m_content = m_content.replace(old_m_interval, new_m_interval)

# Replace any hardcoded fallback in search
m_content = m_content.replace(
    "const selExam = document.getElementById('filter-exam')?.value || 'বার্ষিক পরীক্ষা ২০২৫';",
    "const selExam = document.getElementById('filter-exam')?.value || localStorage.getItem('school_marksheet_exam') || (typeof getAllExams === 'function' ? (getAllExams()[0] || 'বার্ষিক পরীক্ষা') : 'বার্ষিক পরীক্ষা');"
)

with open('Marksheet.html', 'w', encoding='utf-8') as f:
    f.write(m_content)
print("Marksheet.html updated successfully.")


# ----------------------------------------------------------------------------------
# 2. Update Marksheet1.html
# ----------------------------------------------------------------------------------
old_m1_block = """// 1. Get all available Exams from Exam Portal / Settings
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
}"""

new_m1_block = """// Helper to match exam names flexibly across routines, schedules, and types
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

// 1. Get all available Exams from "Exam List" (school_exam_schedules) and Exam Portal
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

assert old_m1_block in m1_content, "old_m1_block not found in Marksheet1.html"
m1_content = m1_content.replace(old_m1_block, new_m1_block)

old_m1_sync = """        // Master Cascading Filter Function for Marksheet1
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
        }

        const selectedClass = classSelect ? classSelect.value : (localStorage.getItem('school_marksheet_class') || 'Ten');
        localStorage.setItem('school_marksheet_class', selectedClass);
        const cVal = document.getElementById('display-class-val');
        if (cVal) cVal.innerText = formatClassNameDisplay(selectedClass);

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
        const scVal = document.getElementById('display-section-val');
        if (scVal) scVal.innerText = selectedSection;"""

new_m1_sync = """        // Master Cascading Filter Function for Marksheet1
function syncCascadingFilters(trigger = 'all') {
    try {
        const examSelect = document.getElementById('filter-exam');
        const classSelect = document.getElementById('filter-class');
        const sectionSelect = document.getElementById('filter-section');

        const allExams = getAllExams();

        // 1. Sync Exams from "Exam List"
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
        }

        const selectedClass = classSelect && classSelect.value ? classSelect.value : (localStorage.getItem('school_marksheet_class') || 'Ten');
        localStorage.setItem('school_marksheet_class', selectedClass);
        const cVal = document.getElementById('display-class-val');
        if (cVal) cVal.innerText = formatClassNameDisplay(selectedClass);

        // If currently searched/selected student is from a different class, clear it
        if (currentSelectedStudent && normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className) !== normalizeClassString(selectedClass)) {
            currentSelectedStudent = null;
            currentSearchQuery = '';
            const searchInput = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            if (searchInput) searchInput.value = '';
            if (clearBtn) clearBtn.style.display = 'none';
        }

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

        const selectedSection = sectionSelect && sectionSelect.value ? sectionSelect.value : (localStorage.getItem('school_marksheet_section') || 'বিজ্ঞান');
        localStorage.setItem('school_marksheet_section', selectedSection);
        const scVal = document.getElementById('display-section-val');
        if (scVal) scVal.innerText = selectedSection;"""

assert old_m1_sync in m1_content, "old_m1_sync not found in Marksheet1.html"
m1_content = m1_content.replace(old_m1_sync, new_m1_sync)

old_m1_bottom = """// Continuous Live Sync of Filter Options from Exam Portal
function syncFiltersFromExamPortal() {
    syncCascadingFilters('exam_sync');
}"""

new_m1_bottom = """// Background live sync from website server database (/api/db)
function syncLiveExamData() {
    if (window._lastExamApiFetch && (Date.now() - window._lastExamApiFetch < 3000)) return;
    window._lastExamApiFetch = Date.now();
    fetch('/api/db?keys=school_exam_schedules,school_exam_types,school_exam_routines,school_omr_exams,school_classes,school_students,school_settings,school_logo')
        .then(r => r.json())
        .then(data => {
            if (data && typeof data === 'object') {
                let hasChanged = false;
                ['school_exam_schedules', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_classes', 'school_students'].forEach(k => {
                    if (data[k]) {
                        const strVal = typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]);
                        if (localStorage.getItem(k) !== strVal) {
                            localStorage.setItem(k, strVal);
                            hasChanged = true;
                        }
                    }
                });
                if (data.school_settings) {
                    const strVal = typeof data.school_settings === 'string' ? data.school_settings : JSON.stringify(data.school_settings);
                    if (localStorage.getItem('school_settings') !== strVal) {
                        localStorage.setItem('school_settings', strVal);
                        if (typeof syncSchoolHeaderInfo === 'function') syncSchoolHeaderInfo();
                    }
                }
                if (data.school_logo && typeof data.school_logo === 'string') {
                    if (localStorage.getItem('school_logo') !== data.school_logo) {
                        localStorage.setItem('school_logo', data.school_logo);
                        if (typeof syncSchoolHeaderInfo === 'function') syncSchoolHeaderInfo();
                    }
                }
                if (hasChanged) {
                    syncCascadingFilters('exam_sync');
                }
            }
        })
        .catch(() => {});
}

// Continuous Live Sync of Filter Options from Exam Portal
function syncFiltersFromExamPortal() {
    syncLiveExamData();
    syncCascadingFilters('exam_sync');
}"""

assert old_m1_bottom in m1_content, "old_m1_bottom not found in Marksheet1.html"
m1_content = m1_content.replace(old_m1_bottom, new_m1_bottom)

old_m1_interval = """// Continuous heartbeat sync every 2.5 seconds
setInterval(function() {
    syncSchoolHeaderInfo();
    syncCascadingFilters('exam_sync');
}, 2500);"""

new_m1_interval = """// Continuous heartbeat sync every 2.5 seconds
setInterval(function() {
    syncSchoolHeaderInfo();
    syncLiveExamData();
    syncCascadingFilters('exam_sync');
}, 2500);"""

assert old_m1_interval in m1_content, "old_m1_interval not found in Marksheet1.html"
m1_content = m1_content.replace(old_m1_interval, new_m1_interval)

# Replace any hardcoded fallback in search
m1_content = m1_content.replace(
    "const selExam = document.getElementById('filter-exam')?.value || 'বার্ষিক পরীক্ষা ২০২৫';",
    "const selExam = document.getElementById('filter-exam')?.value || localStorage.getItem('school_marksheet_exam') || (typeof getAllExams === 'function' ? (getAllExams()[0] || 'বার্ষিক পরীক্ষা') : 'বার্ষিক পরীক্ষা');"
)

with open('Marksheet1.html', 'w', encoding='utf-8') as f:
    f.write(m1_content)
print("Marksheet1.html updated successfully.")

print("All files updated successfully!")

import re
import subprocess

# Read Marksheet.html and Marksheet.html.bak
with open('Marksheet.html', 'r', encoding='utf-8') as f:
    cur = f.read()

with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    bak = f.read()

# In cur, locate where renderMarksheetTable starts
start_marker = "        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {"
start_pos = cur.find(start_marker)
if start_pos == -1:
    print("ERROR: start_marker not found!")
    exit(1)

# In cur, locate where updateMarksheetExam starts
end_marker = "        function updateMarksheetExam(val) {"
end_pos = cur.find(end_marker)
if end_pos == -1:
    print("ERROR: end_marker not found!")
    exit(1)

# Extract search helpers from bak
s_start = bak.find("        let currentSearchQuery = '';")
s_end = bak.find("        function syncCascadingFilters(trigger = 'all') {")
search_helpers = bak[s_start:s_end].rstrip()

# Extract getAllStudentsForClassAndSection from bak
st_start = bak.find("        function getAllStudentsForClassAndSection(selectedClass, selectedSection) {")
st_end = bak.find("        function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {")
students_helper = bak[st_start:st_end].rstrip()

new_block = """        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {
            const tbody = document.getElementById('marksheet-tbody');
            if (tbody) {
                updateTableHeaderMarks(exam, selectedClass);
            }
            if (!tbody) return;

            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);
            const summary = calculateOverallMarksheetSummary(subjects, exam, selectedClass);

            let tableHtml = '';
            const isEn = (currentLanguage === 'en');

            summary.evaluatedSubjects.forEach(({ sub, res, isOpt }) => {
                if (sub.isCombined) {
                    const hasPaperMarks = res.hasMarks;
                    const m1 = res.p1Total;
                    const m2 = res.p2Total;
                    const combTotal = res.total;

                    const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const p1TotDisplay = (hasPaperMarks && m1 !== null) ? formatDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = (hasPaperMarks && m2 !== null) ? formatDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    const p1Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                    const p2Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, true);

                    const p1NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), p1Dist, isEn);
                    const p2NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.pairWith), p2Dist, isEn);

                    tableHtml += `<tr>
                        <td class="subject-col">${p1NameHtml}</td>
                        <td>${p1McqDisplay}</td>
                        <td>${p1CqDisplay}</td>
                        <td>${p1PrDisplay}</td>
                        <td>${p1TotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combTotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold;">${combGradeDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combGpDisplay}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${p2NameHtml}</td>
                        <td>${p2McqDisplay}</td>
                        <td>${p2CqDisplay}</td>
                        <td>${p2PrDisplay}</td>
                        <td>${p2TotDisplay}</td>
                    </tr>`;
                } else {
                    const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const totDisplay = res.hasMarks ? formatDigits(res.total) : '—';
                    const gradeDisplay = res.hasMarks ? res.grade : '—';
                    const gpDisplay = res.hasMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    const dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                    const subNameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), dist, isEn);

                    tableHtml += `<tr>
                        <td class="subject-col">${subNameHtml}</td>
                        <td>${mcqDisplay}</td>
                        <td>${cqDisplay}</td>
                        <td class="${isPracCol ? 'bg-gray' : ''}">${prDisplay}</td>
                        <td>${totDisplay}</td>
                        <td style="font-weight: bold; background: #f8fafc;">${totDisplay}</td>
                        <td style="font-weight: bold;">${gradeDisplay}</td>
                        <td style="font-weight: bold; background: #f8fafc;">${gpDisplay}</td>
                    </tr>`;
                }
            });

            tbody.innerHTML = tableHtml;
            renderGradingScaleLegend();

            const zeroGpaStr = isEn ? '0.00' : '০.০০';
            const finalGpaStr = summary.hasAnyMarks ? ((summary.hasFailed || summary.hasAnyAbsent) ? zeroGpaStr : formatDigits(summary.finalGPA.toFixed(2))) : '—';
            const finalGrade = summary.hasAnyMarks ? (summary.hasAnyAbsent ? 'A' : (summary.hasFailed ? (summary.failRule.name || 'F') : summary.finalGradeName)) : '—';
            const grandTotalDisplay = summary.hasAnyMarks ? formatDigits(summary.grandTotal) : '—';
            const rollNo = student ? (student.roll || student.rollNo || '1') : '1';

            const gtEl = document.getElementById('display-grand-total');
            if (gtEl) gtEl.innerText = grandTotalDisplay;
            const gpaEl = document.getElementById('display-gpa');
            if (gpaEl) gpaEl.innerText = finalGpaStr;
            const gradeEl = document.getElementById('display-final-grade');
            if (gradeEl) gradeEl.innerText = finalGrade;
            const rankEl = document.getElementById('display-rank-val');
            if (rankEl) rankEl.innerText = formatDigits(rollNo);
        }

        // Helper to match exam names flexibly across routines, schedules, and types
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

        // 1. Get all available Exams from "Exam List" (school_exam_schedules) - continuously updated
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

            // PRIMARY: Read strictly from "Exam List" (school_exam_schedules)
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && typeof s === 'object') {
                                const examName = (s.term || s.examName || '').trim();
                                if (examName) {
                                    addExam(examName);
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            // SECONDARY: school_exam_types
            try {
                const rawTypes = localStorage.getItem('school_exam_types');
                if (rawTypes) {
                    const parsed = JSON.parse(rawTypes);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(t => {
                            const name = typeof t === 'string' ? t : (t && t.name ? t.name : '');
                            if (name) addExam(name);
                        });
                    }
                }
            } catch(e) {}

            // TERTIARY: school_exam_routines
            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r) {
                                const name = (r.examName || r.term || '').trim();
                                if (name) addExam(name);
                            }
                        });
                    }
                }
            } catch(e) {}

            // Default fallbacks if no schedules exist yet
            if (examList.length === 0) {
                ['অর্ধ-বার্ষিক পরীক্ষা ২০২৫', 'বার্ষিক পরীক্ষা ২০২৫', 'প্রাক-নির্বাচনী পরীক্ষা ২০২৫', 'নির্বাচনী পরীক্ষা ২০২৫'].forEach(addExam);
            }

            return examList;
        }

        // 2. Get Classes based on Selected Exam Name ("Exam List" schedules) - continuously updated
        function getClassesForExam(examName) {
            const classSet = new Set();

            // 1. PRIMARY: Check "Exam List" (school_exam_schedules) for schedules created under this exam
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && typeof s === 'object') {
                                const sExam = (s.term || s.examName || '').trim();
                                if (sExam && (!examName || isExamMatch(sExam, examName))) {
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

            // 2. SECONDARY: Check routines matching this exam
            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r) {
                                const rExam = (r.examName || r.term || '').trim();
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

            // 3. Fallback: If no schedules match this specific exam, load active classes
            if (classSet.size === 0) {
                try {
                    const rawClasses = localStorage.getItem('school_classes');
                    if (rawClasses) {
                        const parsed = JSON.parse(rawClasses);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(c => {
                                const cName = typeof c === 'string' ? c : (c && (c.name || c.className) ? (c.name || c.className) : '');
                                const fmt = formatClassNameDisplay(cName);
                                if (fmt) classSet.add(fmt);
                            });
                        }
                    }
                } catch(e) {}
            }

            if (classSet.size === 0) {
                ['Play', 'Nursery', 'KG', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'].forEach(c => classSet.add(c));
            }

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

""" + search_helpers + """

        function syncCascadingFilters(trigger = 'all') {
            try {
                const examSelect = document.getElementById('filter-exam');
                const classSelect = document.getElementById('filter-class');
                const sectionSelect = document.getElementById('filter-section');

                const allExams = getAllExams();

                // 1. Sync Exams continuously from "Exam List" (school_exam_schedules)
                if (examSelect) {
                    const currentExam = examSelect.value || localStorage.getItem('school_marksheet_exam') || '';
                    const currExamOpts = Array.from(examSelect.options).map(o => o.value);
                    const isDiff = allExams.length !== currExamOpts.length || allExams.some((ex, i) => ex !== currExamOpts[i]);
                    if (isDiff) {
                        if (allExams.length > 0) {
                            examSelect.innerHTML = allExams.map(ex => `<option value="${escapeHtml(ex)}">${escapeHtml(getDisplayExamName(ex))}</option>`).join('');
                            const matchedOpt = allExams.find(ex => isExamMatch(ex, currentExam));
                            if (matchedOpt) {
                                examSelect.value = matchedOpt;
                            } else {
                                examSelect.value = allExams[0];
                                examSelect.selectedIndex = 0;
                            }
                        } else {
                            examSelect.innerHTML = '<option value="">(কোনো পরীক্ষা পাওয়া যায়নি)</option>';
                            examSelect.value = '';
                        }
                    } else if (currentExam && examSelect.value !== currentExam) {
                        const matchedOpt = allExams.find(ex => isExamMatch(ex, currentExam));
                        if (matchedOpt) examSelect.value = matchedOpt;
                    }
                }

                const selectedExam = examSelect && examSelect.value ? examSelect.value : (allExams[0] || '');
                localStorage.setItem('school_marksheet_exam', selectedExam);
                const examBadge = document.getElementById('display-exam-name');
                if (examBadge) examBadge.innerText = getDisplayExamName(selectedExam);

                // 2. Sync Classes continuously according to selected Exam ("Exam List" schedules)
                if (classSelect) {
                    const currentClass = classSelect.value || localStorage.getItem('school_marksheet_class') || '';
                    const availableClasses = selectedExam ? getClassesForExam(selectedExam) : getClassesForExam('');
                    const currClassOpts = Array.from(classSelect.options).map(o => o.value);
                    const isClassDiff = availableClasses.length !== currClassOpts.length || availableClasses.some((c, i) => c !== currClassOpts[i]);
                    if (isClassDiff || trigger === 'exam_changed' || trigger === 'exam_sync') {
                        if (availableClasses.length > 0) {
                            classSelect.innerHTML = availableClasses.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(getDisplayClassName(c))}</option>`).join('');
                            const matchedOpt = availableClasses.find(c => normalizeClassString(c) === normalizeClassString(currentClass));
                            if (matchedOpt) {
                                classSelect.value = matchedOpt;
                            } else {
                                classSelect.value = availableClasses[0];
                                classSelect.selectedIndex = 0;
                            }
                        } else {
                            classSelect.innerHTML = '<option value="">(কোনো শ্রেণি পাওয়া যায়নি)</option>';
                            classSelect.value = '';
                        }
                    } else if (currentClass && classSelect.value !== currentClass) {
                        const matchedOpt = availableClasses.find(c => normalizeClassString(c) === normalizeClassString(currentClass));
                        if (matchedOpt) classSelect.value = matchedOpt;
                    }
                }

                const selectedClass = classSelect && classSelect.value ? classSelect.value : (localStorage.getItem('school_marksheet_class') || 'Ten');
                localStorage.setItem('school_marksheet_class', selectedClass);
                const classEl = document.getElementById('display-class-name');
                if (classEl) classEl.innerText = getDisplayClassName(selectedClass);

                // If currently searched/selected student is from a different class, clear it
                if (currentSelectedStudent && normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className) !== normalizeClassString(selectedClass)) {
                    currentSelectedStudent = null;
                    currentSearchQuery = '';
                    const searchInput = document.getElementById('filter-student-search');
                    const clearBtn = document.getElementById('btn-clear-search');
                    if (searchInput) searchInput.value = '';
                    if (clearBtn) clearBtn.style.display = 'none';
                }

                // 3. Sync Sections (Dependent on selectedClass & selectedExam)
                if (sectionSelect) {
                    const currentSec = sectionSelect.value || localStorage.getItem('school_marksheet_section') || '';
                    const availableSections = getSectionsForClass(selectedClass, selectedExam);
                    const currSecOpts = Array.from(sectionSelect.options).map(o => o.value);
                    const isSecDiff = availableSections.length !== currSecOpts.length || availableSections.some((s, i) => s !== currSecOpts[i]);
                    if (isSecDiff || trigger === 'class_changed') {
                        sectionSelect.innerHTML = availableSections.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(getDisplaySectionName(s))}</option>`).join('');
                        if (currentSec && availableSections.includes(currentSec)) {
                            sectionSelect.value = currentSec;
                        } else if (availableSections.length > 0) {
                            sectionSelect.selectedIndex = 0;
                        }
                    } else if (currentSec && sectionSelect.value !== currentSec) {
                        if (availableSections.includes(currentSec)) sectionSelect.value = currentSec;
                    }
                }

                const selectedSection = sectionSelect && sectionSelect.value ? sectionSelect.value : (localStorage.getItem('school_marksheet_section') || 'বিজ্ঞান');
                localStorage.setItem('school_marksheet_section', selectedSection);
                const secEl = document.getElementById('display-section-name');
                if (secEl) secEl.innerText = (currentLanguage === 'en' ? 'Section = ' : 'শাখা = ') + getDisplaySectionName(selectedSection);

                // 4. Update Student Meta and Render
                const normClass = normalizeClassString(selectedClass);
                const normSec = normalizeSectionString(selectedSection);

                let rawStudents = localStorage.getItem('school_students');
                let students = [];
                if (rawStudents) {
                    try { students = JSON.parse(rawStudents); } catch(e) {}
                }

                let matchedStudent = null;
                if (currentSelectedStudent) {
                    const stNormC = normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className);
                    if (stNormC === normClass) {
                        matchedStudent = currentSelectedStudent;
                    } else {
                        currentSelectedStudent = null;
                    }
                }

                if (!matchedStudent && currentSearchQuery) {
                    const classSecStudents = getAllStudentsForClassAndSection(selectedClass, selectedSection);
                    matchedStudent = classSecStudents.find(s => matchesStudentQuery(s, currentSearchQuery));
                    if (!matchedStudent) {
                        const allSts = getAllStudentsList();
                        matchedStudent = allSts.find(s => {
                            const stC = normalizeClassString(s.class || s.className);
                            return stC === normClass && matchesStudentQuery(s, currentSearchQuery);
                        });
                    }
                }

                if (!matchedStudent && Array.isArray(students) && students.length > 0) {
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

                const effectiveClass = (matchedStudent && (matchedStudent.class || matchedStudent.className)) ? (matchedStudent.class || matchedStudent.className) : selectedClass;
                const effectiveSec = (matchedStudent && (matchedStudent.section || matchedStudent.group || matchedStudent.sectionName)) ? (matchedStudent.section || matchedStudent.group || matchedStudent.sectionName) : selectedSection;
                const effectiveNormClass = normalizeClassString(effectiveClass);
                const effectiveNormSec = normalizeSectionString(effectiveSec);

                const isEn = (currentLanguage === 'en');
                let studentName = isEn ? 'MD. ABDULLAH AL NOMAN' : 'মো: আব্দুল্লাহ আল নোমান';
                if (matchedStudent) {
                    studentName = isEn && matchedStudent.nameEn ? matchedStudent.nameEn : (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || studentName);
                }

                const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '1') : '1';
                const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

                const nameEl = document.getElementById('display-student-name');
                if (nameEl && nameEl.innerText !== studentName) nameEl.innerText = studentName;
                const rollEl = document.getElementById('display-roll-no');
                if (rollEl) rollEl.innerText = formatDigits(rollNo);
                const idEl = document.getElementById('display-student-id');
                if (idEl) idEl.innerText = formatDigits(studentId);

                const isSecondary = ['9', '10'].includes(effectiveNormClass);
                const relInfo = getStudentReligionInfo(matchedStudent);
                const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

                const relEl = document.getElementById('display-student-religion');
                if (relEl) relEl.innerText = isEn ? (relInfo.en || 'Islam') : relInfo.display;

                const optRow = document.getElementById('row-optional-subject');
                const optEl = document.getElementById('display-optional-subject');
                if (optRow) {
                    if (isSecondary) {
                        optRow.style.display = 'flex';
                        if (optEl) optEl.innerText = isEn ? optInfo.name : optInfo.nameBn;
                    } else {
                        optRow.style.display = 'none';
                    }
                }

                updateTableHeaderMarks(selectedExam, selectedClass);

                if (isCreateAllMode) {
                    renderBatchMarksheets(selectedClass, selectedSection, selectedExam);
                } else {
                    const batchContainer = document.getElementById('batch-marksheets-container');
                    const singleContainer = document.getElementById('single-marksheet-container');
                    if (batchContainer) batchContainer.style.display = 'none';
                    if (singleContainer) singleContainer.style.display = 'block';
                    renderMarksheetTable(effectiveClass, effectiveSec, matchedStudent || { roll: rollNo }, selectedExam);
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
                    if (btnText) btnText.innerText = currentLanguage === 'en' ? 'All Students' : 'সকল শিক্ষার্থী (All)';
                } else {
                    btn.classList.remove('active');
                    if (btnText) btnText.innerText = currentLanguage === 'en' ? 'Single Student' : 'একক শিক্ষার্থী (Single)';
                }
            }
            syncCascadingFilters('mode_toggled');
        }

""" + students_helper + """

        function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {
            const isEn = (currentLanguage === 'en');
            const normClass = normalizeClassString(selectedClass);
            const normSec = normalizeSectionString(selectedSection);
            const isSecondary = ['9', '10'].includes(normClass);
            const relInfo = getStudentReligionInfo(student);
            const optInfo = getStudentOptionalSubjectInfo(student, normSec);

            const studentName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
            const rollNo = student ? (student.roll || student.rollNo || rankNum) : rankNum;
            const studentId = getEffectiveStudentId(student, selectedClass, rankNum);
            const displayCls = getDisplayClassName(selectedClass);
            const displaySec = isEn ? getEnglishSectionName(selectedSection) : (selectedSection || 'ক');
            const examBadgeTitle = getDisplayExamName(exam);
            const displayRel = isEn ? (relInfo.en || 'Islam') : relInfo.display;
            const displayOpt = isEn ? optInfo.name : optInfo.nameBn;

            let rawSettings = localStorage.getItem('school_settings');
            let settings = {};
            if (rawSettings) { try { settings = JSON.parse(rawSettings); } catch(e) {} }
            const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
            const addressText = settings.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
            const customLogo = localStorage.getItem('school_logo') || (settings && settings.schoolLogo) || 'school_logo.svg';

            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);
            const summary = calculateOverallMarksheetSummary(subjects, exam, selectedClass);

            let tableHtml = '';

            summary.evaluatedSubjects.forEach(({ sub, res, isOpt }) => {
                if (sub.isCombined) {
                    const hasPaperMarks = res.hasMarks;
                    const m1 = res.p1Total;
                    const m2 = res.p2Total;
                    const combTotal = res.total;

                    const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const p1TotDisplay = (hasPaperMarks && m1 !== null) ? formatDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = (hasPaperMarks && m2 !== null) ? formatDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    const p1Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                    const p2Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, true);

                    const p1NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), p1Dist, isEn);
                    const p2NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.pairWith), p2Dist, isEn);

                    tableHtml += `<tr>
                        <td class="subject-col">${p1NameHtml}</td>
                        <td>${p1McqDisplay}</td>
                        <td>${p1CqDisplay}</td>
                        <td>${p1PrDisplay}</td>
                        <td>${p1TotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combTotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold;">${combGradeDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combGpDisplay}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${p2NameHtml}</td>
                        <td>${p2McqDisplay}</td>
                        <td>${p2CqDisplay}</td>
                        <td>${p2PrDisplay}</td>
                        <td>${p2TotDisplay}</td>
                    </tr>`;
                } else {
                    const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const totDisplay = res.hasMarks ? formatDigits(res.total) : '—';
                    const gradeDisplay = res.hasMarks ? res.grade : '—';
                    const gpDisplay = res.hasMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    const dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                    const subNameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), dist, isEn);

                    tableHtml += `<tr>
                        <td class="subject-col">${subNameHtml}</td>
                        <td>${mcqDisplay}</td>
                        <td>${cqDisplay}</td>
                        <td>${prDisplay}</td>
                        <td>${totDisplay}</td>
                        <td style="font-weight: bold; background: #f8fafc;">${totDisplay}</td>
                        <td style="font-weight: bold;">${gradeDisplay}</td>
                        <td style="font-weight: bold; background: #f8fafc;">${gpDisplay}</td>
                    </tr>`;
                }
            });

            const zeroGpaStr = isEn ? '0.00' : '০.০০';
            const finalGpaStr = summary.hasAnyMarks ? ((summary.hasFailed || summary.hasAnyAbsent) ? zeroGpaStr : formatDigits(summary.finalGPA.toFixed(2))) : '—';
            const finalGrade = summary.hasAnyMarks ? (summary.hasAnyAbsent ? 'A' : (summary.hasFailed ? (summary.failRule.name || 'F') : summary.finalGradeName)) : '—';
            const grandTotalDisplay = summary.hasAnyMarks ? formatDigits(summary.grandTotal) : '—';
            const rankStr = formatDigits(rankNum);

            return `
            <div class="mark-sheet-container" style="margin-bottom: 25px;">
                <div class="mark-sheet-border">
                    <!-- Header Section -->
                    <div class="header-section">
                        ${getGradingScaleTableHTML()}

                        <div class="header-center">
                            <h1 class="school-name">${schoolName}</h1>
                            <p class="address">${addressText}</p>
                            <div class="logo">
                                <img src="${customLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;">
                            </div>
                            <div class="exam-badge">${examBadgeTitle}</div>
                        </div>
                    </div>

                    <!-- Student Info Section -->
                    <div class="student-info">
                        <div style="flex: 1.1;">
                            <div class="info-row">
                                <div class="info-label">${isEn ? "Student Name" : "শিক্ষার্থীর নাম"}</div>
                                <div>: <span>${studentName}</span></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">${isEn ? "Roll No" : "রোল নং"}</div>
                                <div>: <span>${formatDigits(rollNo)}</span></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">${isEn ? "Class" : "শ্রেণি"}</div>
                                <div>: <span>${displayCls}</span> <span class="branch-info" style="margin-left: 20px;">${isEn ? "Section = " + displaySec : "শাখা = " + displaySec}</span></div>
                            </div>
                        </div>
                        <div style="flex: 0.9; padding-left: 20px;">
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">${isEn ? "Religion" : "ধর্ম (Religion)"}</div>
                                <div>: <span>${displayRel}</span></div>
                            </div>
                            ${isSecondary ? `
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">${isEn ? "Optional (4th)" : "ঐচ্ছিক বিষয় (৪র্থ)"}</div>
                                <div>: <span>${displayOpt}</span></div>
                            </div>` : ''}
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">${isEn ? "Student ID" : "শিক্ষার্থী আইডি"}</div>
                                <div>: <span>${formatDigits(studentId)}</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Marks Table -->
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th class="subject-col">${isEn ? "Subject" : "বিষয়"}</th>
                                <th>${isEn ? "MCQ" : "বহুনির্বাচনি"}</th>
                                <th>${isEn ? "CQ" : "লিখিত"}</th>
                                <th>${isEn ? "Practical" : "ব্যবহারিক"}</th>
                                <th>${isEn ? "Total" : "মোট"}</th>
                                <th>${isEn ? "Total" : "সর্বমোট"}</th>
                                <th>${isEn ? "Grade" : "গ্রেড"}</th>
                                <th>${isEn ? "GPA" : "পয়েন্ট"}</th>
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
                                <td style="width: 50%;">${isEn ? "Rank" : "স্থান"}</td>
                                <td style="width: 50%;">${rankStr}</td>
                            </tr>
                        </table>

                        <table class="summary-table">
                            <tr>
                                <td style="width: 50%;">${isEn ? "Total Marks" : "সর্বমোট"}</td>
                                <td style="width: 50%;">${grandTotalDisplay}</td>
                            </tr>
                            <tr>
                                <td>${isEn ? "GPA" : "পয়েন্ট"}</td>
                                <td>${finalGpaStr}</td>
                            </tr>
                            <tr>
                                <td>${isEn ? "Grade" : "গ্রেড"}</td>
                                <td>${finalGrade}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Signatures Section -->
                    <div class="signatures">
                        <div class="sig-col">
                            <div class="sig-line"></div>
                            <div class="sig-label">${isEn ? "Guardian's Signature" : "অভিভাবকের স্বাক্ষর"}</div>
                        </div>
                        <div class="sig-col">
                            <div class="sig-line"></div>
                            <div class="sig-label">${isEn ? "Headmaster's Signature" : "প্রধান শিক্ষকের স্বাক্ষর"}</div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        function renderBatchMarksheets(selectedClass, selectedSection, exam) {
            const batchContainer = document.getElementById('batch-marksheets-container');
            const singleContainer = document.getElementById('single-marksheet-container');
            if (!batchContainer) return;

            const allStudents = getAllStudentsForClassAndSection(selectedClass, selectedSection);
            const isFiltered = Boolean(currentSearchQuery);
            const students = isFiltered
                ? allStudents.filter(st => matchesStudentQuery(st, currentSearchQuery))
                : allStudents;

            if (students.length === 0) {
                batchContainer.innerHTML = `
                <div class="batch-status-banner no-print" style="flex-direction: column; text-align: center; padding: 25px 20px; gap: 12px; justify-content: center; margin: 20px auto;">
                    <div style="font-size: 16px; font-weight: 700; color: #f87171;">
                        "${escapeHtml(currentSearchQuery)}" এর সাথে কোনো শিক্ষার্থীর মার্কশীট পাওয়া যায়নি!
                    </div>
                    <div style="font-size: 13px; color: #cbd5e1;">
                        রোল নম্বর, শিক্ষার্থীর নাম অথবা আইডি পুনরায় যাচাই করুন।
                    </div>
                    <button type="button" class="btn-batch-action btn-batch-single" onclick="clearStudentSearch()" style="background: #3b82f6; color: #fff; margin-top: 5px; padding: 6px 16px;">
                        সকল শিক্ষার্থীর মার্কশীট প্রদর্শন করুন
                    </button>
                </div>`;
                batchContainer.style.display = 'block';
                if (singleContainer) singleContainer.style.display = 'none';
                return;
            }

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
                    <span class="badge-count">মোট ${toBnDigits(students.length)} জন শিক্ষার্থী${isFiltered ? ' (অনুসন্ধান)' : ''}</span>
                </div>
                <div class="batch-actions">
                    ${isFiltered ? `
                    <button type="button" class="btn-batch-action btn-batch-single" onclick="clearStudentSearch()" title="সার্চ মুছুন এবং সকল শিক্ষার্থী দেখুন">
                        <span>সকল শিক্ষার্থী</span>
                    </button>` : ''}
                    <button type="button" class="btn-batch-action btn-batch-print" onclick="window.print()" title="প্রদর্শিত সকল শিক্ষার্থীর মার্কশীট প্রিন্ট করুন">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        <span>Print ${isFiltered ? 'Filtered' : 'All'}</span>
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

"""

updated_cur = cur[:start_pos] + new_block + cur[end_pos:]

with open('Marksheet.html', 'w', encoding='utf-8') as out:
    out.write(updated_cur)

print(f"Updated Marksheet.html successfully! New length: {len(updated_cur)}")

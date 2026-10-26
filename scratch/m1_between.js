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

// 1. Get all available Exams from "Exam List" (school_exam_schedules) that have an exam created with a subject
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
            ["বিজ্ঞান", "মানবিক", "ব্যবসায় শিক্ষা"].forEach(s => sectionSet.add(s));
        } else {
            ["ক", "খ", "গ"].forEach(s => sectionSet.add(s));
        }
    }

    return Array.from(sectionSet);
}


        // Student Search State & Helpers
        let currentSearchQuery = '';
        let currentSelectedStudent = null;

        function escapeHtml(text) {
            if (!text) return '';
            return String(text).replace(/[&<>"']/g, function(m) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
            });
        }

        function getAllStudentsList() {
            let raw = localStorage.getItem('school_students');
            let list = [];
            if (raw) {
                try { list = JSON.parse(raw); } catch(e) {}
            }
            if (Array.isArray(list) && list.length > 0) return list;
            return [
                { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', name: 'Md. Abdullah Al Noman', studentId: '2610001', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' },
                { roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', name: 'Mst. Fatema Akter', studentId: '2610002', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Biology' },
                { roll: '3', nameBn: 'সৌরভ কুমার রায়', name: 'Sourav Kumar Roy', studentId: '2610003', class: 'Ten', section: 'বিজ্ঞান', religion: 'Hindu', optionalSubject: 'Higher Mathematics' },
                { roll: '4', nameBn: 'তানভীর হাসান', name: 'Tanvir Hasan', studentId: '2610004', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' },
                { roll: '5', nameBn: 'সাদিয়া জাহান', name: 'Sadia Jahan', studentId: '2610005', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' },
                { roll: '6', nameBn: 'প্রিয়াংকা সরকার', name: 'Priyanka Sarkar', studentId: '2610006', class: 'Ten', section: 'বিজ্ঞান', religion: 'Hindu', optionalSubject: 'Higher Mathematics' },
                { roll: '7', nameBn: 'মেহেদী হাসান', name: 'Mehedi Hasan', studentId: '2610007', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' },
                { roll: '8', nameBn: 'সুমাইয়া জান্নাত', name: 'Sumaiya Jannat', studentId: '2610008', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' }
            ];
        }

                function getEffectiveStudentId(st, currentClass = '', rankNum = 1) {
            if (!st) return '';
            const reg = String(st.regNo || '').trim();
            const sid = String(st.studentId || '').trim();

            // 1. Valid registration / student number from database (e.g. 260091, 2606001, 2607001, 2608001)
            if (reg && !reg.startsWith('178') && reg.length <= 12) {
                return reg;
            }

            // 2. Full studentId (longer than 4 characters, e.g. 2606001, 2610001, 2026101001)
            if (sid && sid.length > 4 && !sid.startsWith('178')) {
                return sid;
            }

            // 3. Clean studentId (not internal timestamp uuid)
            if (sid && !sid.startsWith('178') && !sid.includes('-')) {
                return sid;
            }

            // 4. Standard school ID formula: '26' + 2-digit class code + 3-digit roll/rank
            const normC = normalizeClassString(st.class || st.className || currentClass || '10');
            const classCode = String(normC).padStart(2, '0');
            const rollVal = st.roll || st.rollNo || rankNum || 1;
            const rollDigits = String(toEnDigits(rollVal)).replace(/\D/g, '') || String(rankNum || 1);
            const serial = String(rollDigits).padStart(3, '0');
            return `26${classCode}${serial}`;
        }

        function matchesStudentQuery(student, query) {
            if (!query) return true;
            const cleanQ = query.trim().toLowerCase();
            const cleanQEn = toEnDigits(cleanQ).replace(/^0+/, '');

            const rollStr = String(student.roll || student.rollNo || '');
            const rollEn = toEnDigits(rollStr).replace(/^0+/, '');

            // Exact roll match or startsWith
            if (cleanQEn && (rollEn === cleanQEn || rollEn.startsWith(cleanQEn))) return true;

            // Student ID & Registration match
            const effId = typeof getEffectiveStudentId === 'function' ? getEffectiveStudentId(student) : '';
            const effIdEn = toEnDigits(effId);
            const sidEn = toEnDigits(String(student.studentId || ''));
            const regEn = toEnDigits(String(student.regNo || ''));
            if (cleanQEn && (effIdEn.includes(cleanQEn) || sidEn.includes(cleanQEn) || regEn.includes(cleanQEn))) return true;

            // Name match (Bangla & English)
            const nameBn = (student.nameBn || '').toLowerCase();
            const nameEn = (student.name || student.studentName || '').toLowerCase();
            if (nameBn.includes(cleanQ) || nameEn.includes(cleanQ)) return true;

            return false;
        }

        function handleStudentSearchInput(val) {
            currentSearchQuery = (val || '').trim();
            const clearBtn = document.getElementById('btn-clear-search');
            if (clearBtn) clearBtn.style.display = currentSearchQuery ? 'inline-block' : 'none';

            if (!currentSearchQuery) {
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
                currentSelectedStudent = null;
                if (isCreateAllMode) {
                    const selClass = document.getElementById('filter-class')?.value || 'Ten';
                    const selSec = document.getElementById('filter-section')?.value || 'বিজ্ঞান';
                    const selExam = document.getElementById('filter-exam')?.value || localStorage.getItem('school_marksheet_exam') || (typeof getAllExams === 'function' ? (getAllExams()[0] || 'বার্ষিক পরীক্ষা') : 'বার্ষিক পরীক্ষা');
                    renderBatchMarksheets1(selClass, selSec, selExam);
                } else {
                    syncCascadingFilters('search_cleared');
                }
                return;
            }

            renderSearchSuggestions(currentSearchQuery);

            if (isCreateAllMode) {
                const selClass = document.getElementById('filter-class')?.value || 'Ten';
                const selSec = document.getElementById('filter-section')?.value || 'বিজ্ঞান';
                const selExam = document.getElementById('filter-exam')?.value || localStorage.getItem('school_marksheet_exam') || (typeof getAllExams === 'function' ? (getAllExams()[0] || 'বার্ষিক পরীক্ষা') : 'বার্ষিক পরীক্ষা');
                renderBatchMarksheets1(selClass, selSec, selExam);
            } else {
                syncCascadingFilters('search_typing');
            }
        }

        function renderSearchSuggestions(query) {
            const dropdown = document.getElementById('search-suggestions-dropdown');
            if (!dropdown) return;

            if (!query) {
                dropdown.style.display = 'none';
                dropdown.innerHTML = '';
                return;
            }

            const currentClass = document.getElementById('filter-class')?.value || localStorage.getItem('school_marksheet_class') || '';
            const currentSection = document.getElementById('filter-section')?.value || localStorage.getItem('school_marksheet_section') || '';
            const normC = normalizeClassString(currentClass);
            const normS = normalizeSectionString(currentSection);

            const allStudents = getAllStudentsList();
            // নির্বাচন করা "শ্রেণি" এর নাম অনুসারে শুধুমাত্র উক্ত শ্রেণির শিক্ষার্থীদের ফিল্টার করা হচ্ছে
            const classStudents = allStudents.filter(st => {
                const sClass = normalizeClassString(st.class || st.className);
                return sClass === normC;
            });

            const matches = classStudents.filter(st => matchesStudentQuery(st, query));

            if (matches.length === 0) {
                dropdown.innerHTML = `<div class="search-no-result">${escapeHtml(currentClass)} শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি</div>`;
                dropdown.style.display = 'block';
                window._currentSearchMatches = [];
                return;
            }

            matches.sort((a, b) => {
                const aS = normalizeSectionString(a.section || a.group || a.sectionName);
                const bS = normalizeSectionString(b.section || b.group || b.sectionName);

                const aSame = (aS === normS || !normS) ? 1 : 0;
                const bSame = (bS === normS || !normS) ? 1 : 0;
                if (aSame !== bSame) return bSame - aSame;

                const aRoll = parseInt(toEnDigits(a.roll || 0), 10) || 0;
                const bRoll = parseInt(toEnDigits(b.roll || 0), 10) || 0;
                return aRoll - bRoll;
            });

            const topMatches = matches.slice(0, 10);
            window._currentSearchMatches = topMatches;

            let itemsHtml = topMatches.map((st, idx) => {
                const name = escapeHtml(st.nameBn || st.name || 'শিক্ষার্থী');
                const roll = toBnDigits(st.roll || st.rollNo || '');
                const stClass = escapeHtml(st.class || st.className || currentClass);
                const stSec = escapeHtml(st.section || st.group || st.sectionName || '—');
                const stId = getEffectiveStudentId(st, currentClass, idx + 1);

                return `
                <div class="search-suggestion-item" onmousedown="selectSearchedStudentByIndex(${idx})">
                    <div class="search-suggestion-name">${name}</div>
                    <div class="search-suggestion-meta">
                        <span class="search-suggestion-badge roll">রোল: ${roll}</span>
                        <span class="search-suggestion-badge">শ্রেণি: ${stClass}</span>
                        <span class="search-suggestion-badge">শাখা: ${stSec}</span>
                        ${stId ? `<span class="search-suggestion-badge">ID: ${toBnDigits(stId)}</span>` : ''}
                    </div>
                </div>`;
            }).join('');

            dropdown.innerHTML = itemsHtml;
            dropdown.style.display = 'block';
        }

        function selectSearchedStudentByIndex(idx) {
            if (window._currentSearchMatches && window._currentSearchMatches[idx]) {
                selectSearchedStudent(window._currentSearchMatches[idx]);
            }
        }

        function selectSearchedStudent(student) {
            currentSelectedStudent = student;
            currentSearchQuery = '';

            const input = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            const dropdown = document.getElementById('search-suggestions-dropdown');

            const rollBn = toBnDigits(student.roll || student.rollNo || '০১');
            const name = student.nameBn || student.name || 'শিক্ষার্থী';
            if (input) {
                input.value = `[রোল ${rollBn}] ${name}`;
            }
            if (clearBtn) clearBtn.style.display = 'inline-block';
            if (dropdown) dropdown.style.display = 'none';

            const stSec = student.section || student.group || student.sectionName;
            if (stSec) {
                localStorage.setItem('school_marksheet_section', stSec);
                const secSelect = document.getElementById('filter-section');
                if (secSelect) secSelect.value = stSec;
            }

            if (isCreateAllMode) {
                isCreateAllMode = false;
                const btn = document.getElementById('btn-create-all');
                const btnText = document.getElementById('create-all-btn-text');
                if (btn) {
                    btn.classList.remove('active');
                    if (btnText) btnText.innerText = 'একক শিক্ষার্থী (Single)';
                }
            }

            syncCascadingFilters('student_searched');
        }

        function clearStudentSearch() {
            currentSearchQuery = '';
            currentSelectedStudent = null;

            const input = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            const dropdown = document.getElementById('search-suggestions-dropdown');

            if (input) input.value = '';
            if (clearBtn) clearBtn.style.display = 'none';
            if (dropdown) dropdown.style.display = 'none';

            syncCascadingFilters('search_cleared');
        }

        function handleStudentSearchKeydown(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (window._currentSearchMatches && window._currentSearchMatches.length > 0) {
                    selectSearchedStudent(window._currentSearchMatches[0]);
                } else {
                    const query = (document.getElementById('filter-student-search')?.value || '').trim();
                    if (query) {
                        const currentClass = document.getElementById('filter-class')?.value || localStorage.getItem('school_marksheet_class') || '';
                        const normC = normalizeClassString(currentClass);
                        const all = getAllStudentsList();
                        const classStudents = all.filter(st => normalizeClassString(st.class || st.className) === normC);
                        const matched = classStudents.find(s => matchesStudentQuery(s, query));
                        if (matched) {
                            selectSearchedStudent(matched);
                        }
                    }
                }
                if (dropdown) dropdown.style.display = 'none';
            } else if (e.key === 'Escape') {
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
            }
        }

        function handleStudentSearchFocus() {
            const input = document.getElementById('filter-student-search');
            const query = input ? input.value.trim() : '';
            if (query && !query.startsWith('[রোল')) {
                renderSearchSuggestions(query);
            }
        }

        // Close search suggestions on outside click
        document.addEventListener('click', function(e) {
            const wrapper = document.querySelector('.search-input-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
            }
        });

        // Master Cascading Filter Function for Marksheet1
function syncCascadingFilters(trigger = 'all') {
    try {
        const examSelect = document.getElementById('filter-exam');
        const classSelect = document.getElementById('filter-class');
        const sectionSelect = document.getElementById('filter-section');

        const allExams = getAllExams();

        // 1. Sync Exams from "Exam List" (Only exams with a subject created)
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
        if (scVal) scVal.innerText = selectedSection;

        // 4. Update Student Meta and Render Transcript Table
        const normClass = normalizeClassString(selectedClass);
        const normSec = normalizeSectionString(selectedSection);

        let rawStudents = localStorage.getItem('school_students');
        let students = [];
        if (rawStudents) {
            try { students = JSON.parse(rawStudents); } catch(e) {}
        }

        let matchedStudent = null;

        // Priority 1: Specifically selected student from search (must match current class)
        if (currentSelectedStudent) {
            const stNormC = normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className);
            if (stNormC === normClass) {
                matchedStudent = currentSelectedStudent;
            } else {
                currentSelectedStudent = null;
            }
        }

        if (!matchedStudent && currentSearchQuery) {
            // Priority 2: Student matching current search query within selected class only
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
        let studentName = 'মো: আব্দুল্লাহ আল নোমান';
        if (matchedStudent) {
            studentName = isEn && matchedStudent.nameEn ? matchedStudent.nameEn : (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || (isEn ? 'Student Name' : 'মো: আব্দুল্লাহ আল নোমান'));
        } else if (isEn) {
            studentName = 'MD. ABDULLAH AL NOMAN';
        }

        const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '01') : '01';
        const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

        const sVal = document.getElementById('display-student-val');
        if (sVal && sVal.innerText !== studentName) sVal.innerText = studentName;
        const rVal = document.getElementById('display-roll-val');
        if (rVal) rVal.innerText = formatDigits(rollNo);
        const idVal = document.getElementById('display-id-val');
        if (idVal) idVal.innerText = formatDigits(studentId);

        if (cVal) cVal.innerText = getDisplayClassName(effectiveClass);
        if (scVal) scVal.innerText = isEn ? getEnglishSectionName(effectiveSec) : effectiveSec;

        const pillTitle = document.getElementById('display-exam-name-pill');
        if (pillTitle) pillTitle.innerText = getDisplayExamName(selectedExam);

        const isSecondary = ['9', '10'].includes(effectiveNormClass);
        const relInfo = getStudentReligionInfo(matchedStudent);
        const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

        const relVal = document.getElementById('display-religion-val');
        if (relVal) relVal.innerText = isEn ? (relInfo.en || 'Islam') : relInfo.display;

        const optVal = document.getElementById('display-optional-val');
        const optLbl = document.getElementById('label-opt-val');
        const optCol = document.getElementById('colon-opt-val');
        if (optVal) {
            if (isSecondary) {
                if (optLbl) { optLbl.style.visibility = 'visible'; optLbl.innerText = isEn ? 'Optional Subject' : 'ঐচ্ছিক বিষয়'; }
                if (optCol) optCol.style.visibility = 'visible';
                optVal.style.visibility = 'visible';
                optVal.innerText = isEn ? optInfo.name : optInfo.nameBn;
            } else {
                if (optLbl) optLbl.style.visibility = 'hidden';
                if (optCol) optCol.style.visibility = 'hidden';
                optVal.style.visibility = 'hidden';
                optVal.innerText = '—';
            }
        }

        updateTableHeaderMarks(selectedExam, selectedClass);

        if (isCreateAllMode) {
            renderBatchMarksheets1(selectedClass, selectedSection, selectedExam);
        } else {
            const batchContainer = document.getElementById('batch-marksheets-container');
            const singleContainer = document.getElementById('single-certificate-sheet');
            if (batchContainer) batchContainer.style.display = 'none';
            if (singleContainer) singleContainer.style.display = 'block';
            renderMarksheet1Table(effectiveClass, effectiveSec, matchedStudent || { roll: rollNo }, selectedExam);
        }
    } catch(e) {
        console.error("Error in syncCascadingFilters in Marksheet1:", e);
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
        { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', name: 'Md. Abdullah Al Noman', studentId: '2610001', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', name: 'Mst. Fatema Akter', studentId: '2610002', religion: 'Islam', optionalSubject: isSci ? 'Biology' : 'Agriculture Studies' },
        { roll: '3', nameBn: 'সৌরভ কুমার রায়', name: 'Sourav Kumar Roy', studentId: '2610003', religion: 'Hindu', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '4', nameBn: 'তানভীর হাসান', name: 'Tanvir Hasan', studentId: '2610004', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '5', nameBn: 'সাদিয়া জাহান', name: 'Sadia Jahan', studentId: '2610005', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '6', nameBn: 'প্রিয়াংকা সরকার', name: 'Priyanka Sarkar', studentId: '2610006', religion: 'Hindu', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '7', nameBn: 'মেহেদী হাসান', name: 'Mehedi Hasan', studentId: '2610007', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' },
        { roll: '8', nameBn: 'সুমাইয়া জান্নাত', name: 'Sumaiya Jannat', studentId: '2610008', religion: 'Islam', optionalSubject: isSci ? 'Higher Mathematics' : 'Agriculture Studies' }
    ];

    return fallbackCohort;
}

function generateMarksheet1CardHTML(student, selectedClass, selectedSection, exam, rankNum) {
    const isEn = (currentLanguage === 'en');
    const examDist = getExamDistribution(exam, selectedClass);
    const normClass = normalizeClassString(selectedClass);
    const normSec = normalizeSectionString(selectedSection);
    const isSecondary = ['9', '10'].includes(normClass);
    const relInfo = getStudentReligionInfo(student);
    const optInfo = getStudentOptionalSubjectInfo(student, normSec);

    const studentName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
    const rollNo = student ? (student.roll || student.rollNo || rankNum) : rankNum;
    const studentId = getEffectiveStudentId(student, selectedClass, rankNum);
    const displayCls = getDisplayClassName(selectedClass);
    const displaySec = isEn ? getEnglishSectionName(selectedSection) : (selectedSection || 'বিজ্ঞান');
    const displayExam = getDisplayExamName(exam);
    const displayRel = isEn ? (relInfo.en || 'Islam') : relInfo.display;
    const displayOpt = isEn ? optInfo.name : optInfo.nameBn;

    let rawSettings = localStorage.getItem('school_settings');
    let settings = {};
    if (rawSettings) { try { settings = JSON.parse(rawSettings); } catch(e) {} }
    const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাপীঠ উচ্চ বিদ্যালয়";
    let addressText = settings.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
    const extraParts = [];
    if (settings.schoolEIIN || settings.eiin) extraParts.push("ইআইআইএন: " + (settings.schoolEIIN || settings.eiin));
    else extraParts.push("ইআইআইএন: ১২৭৫৪৩");
    if (settings.schoolCode || settings.code) extraParts.push("কোড: " + (settings.schoolCode || settings.code));
    else extraParts.push("কোড: ৫৬১২");
    const fullSubtitle = addressText + " | " + extraParts.join(" | ");

    const customLogo = localStorage.getItem('school_logo') || (settings && settings.schoolLogo) || 'school_logo.svg';
    let logoPosStyle = '';
    const savedPos = localStorage.getItem('marksheet_logo_pos_v2');
    if (savedPos) {
        try {
            const { left, top } = JSON.parse(savedPos);
            if (left !== undefined && top !== undefined) {
                logoPosStyle = ` style="left: ${left}px; top: ${top}px;"`;
            }
        } catch(e) {}
    }

    const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);

    let tableHtml = '';
    let grandTotal = 0;
    let totalFullMarks = 0;
    let totalGP = 0;
    let subjectCount = 0;
    let hasFailed = false;
    let hasAnyMarks = false;

    let hasCompulsoryHeader = false;
    let hasElectiveHeader = false;
    let hasOptionalHeader = false;

    let mainSubjectsGP = 0;
    let mainSubjectCount = 0;
    let optionalBonusGP = 0;

    subjects.forEach(sub => {
        const isOpt = !!(sub.isOptional || sub.group === 'optional');
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            tableHtml += `<tr class="group-header-row"><td colspan="8">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            tableHtml += `<tr class="group-header-row"><td colspan="8">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            tableHtml += `<tr class="group-header-row"><td colspan="8">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`;
            hasOptionalHeader = true;
        }

        if (sub.isCombined) {
            const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;
            const m1 = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const m2 = sub.pairTotal !== null ? sub.pairTotal : ((parseInt(sub.pairMcq) || 0) + (parseInt(sub.pairCq) || 0) + (parseInt(sub.pairPr) || 0));
            const combTotal = m1 + m2;
            const fullTotal = (sub.fullMarks || 100) + (sub.pairFull || 100);
            const res = hasPaperMarks ? calculateGradeAndGP(combTotal, fullTotal) : { grade: '—', gp: 0 };

            if (hasPaperMarks) {
                hasAnyMarks = true;
                grandTotal += combTotal;
                totalFullMarks += fullTotal;
                totalGP += res.gp;
                subjectCount++;
                if (isOpt) {
                    if (res.gp > 2.00) optionalBonusGP += (res.gp - 2.00);
                } else {
                    mainSubjectsGP += res.gp;
                    mainSubjectCount++;
                    if (res.gp === 0) hasFailed = true;
                }
            }

            const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const p1TotDisplay = sub.hasMarks ? formatDigits(m1) : '<span class="blank-field">—</span>';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '<span class="blank-field">—</span>');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '<span class="blank-field">—</span>');
                    const p2TotDisplay = sub.pairHasMarks ? formatDigits(m2) : '<span class="blank-field">—</span>';

            const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '<span class="blank-field">—</span>';
            const combGradeDisplay = hasPaperMarks ? res.grade : '—';
            const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            const p1Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
            const p2Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, true);
            const p1NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), p1Dist, isEn);
            const p2NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.pairWith), p2Dist, isEn);

            tableHtml += `<tr>
                <td class="sub-name">${p1NameHtml}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${p2NameHtml}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;
        } else {
            const tot = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const res = sub.hasMarks ? calculateGradeAndGP(tot, sub.fullMarks) : { grade: '—', gp: 0 };

            if (sub.hasMarks) {
                hasAnyMarks = true;
                grandTotal += tot;
                totalFullMarks += sub.fullMarks;
                totalGP += res.gp;
                subjectCount++;
                if (isOpt) {
                    if (res.gp > 2.00) optionalBonusGP += (res.gp - 2.00);
                } else {
                    mainSubjectsGP += res.gp;
                    mainSubjectCount++;
                    if (res.gp === 0) hasFailed = true;
                }
            }

            const isOptional = sub.group === 'optional';
            const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const totDisplay = sub.hasMarks ? formatDigits(tot) : '<span class="blank-field">—</span>';
            const gradeDisplay = sub.hasMarks ? res.grade : '—';
            const gpDisplay = sub.hasMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            const dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
            const subNameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), dist, isEn);

            tableHtml += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${subNameHtml}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;
        }
    });

    renderGradingScaleLegend1();
    if (mainSubjectCount === 0) mainSubjectCount = subjectCount || 1;
    const maxGP = getMaxScaleGP();
    const rawGpa = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
    const boundedGpa = Math.min(maxGP, rawGpa);
    const zeroGpaStr = isEn ? '0.00' : '০.০০';
    const finalGpaStr = hasAnyMarks ? (hasFailed ? zeroGpaStr : formatDigits(boundedGpa.toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';
    const rankStr = formatDigits(rankNum);

    return `
    <div class="certificate-sheet" style="margin-bottom: 25px;">
        <div class="inner-border">
            
            <!-- Header Section -->
            <div class="institution-header">
                <div class="header-logo-box">
                    <img src="${customLogo}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;" onerror="this.src='school_logo.svg'">
                </div>
                <div class="header-text-box">
                    <div class="inst-title-bn"${schoolName.length > 40 ? ' style="font-size: 19.5px;"' : ''}>${schoolName}</div>
                    <div class="inst-subtitle">${fullSubtitle}</div>
                    <div>
                        <span class="report-pill-title">${displayExam}</span>
                    </div>
                </div>
                <div class="header-right-spacer" aria-hidden="true"></div>
            </div>

            <!-- Student Meta & Grading Scale -->
            <div class="header-meta-row">
                <div class="student-profile-cell">
                    <div class="profile-card">
                        <table class="profile-grid">
                            <tr>
                                <td class="p-label" style="font-size: 15.1px; font-weight: 800;">${isEn ? "Student Name" : "শিক্ষার্থীর নাম"}</td>
                                <td class="p-colon" style="font-size: 15.1px; font-weight: 800;">:</td>
                                <td class="p-val" colspan="4" style="font-size: 15.6px; font-weight: 800;">${studentName}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "Class" : "শ্রেণি"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val" style="width: 25%;">${displayCls}</td>
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Section / Group" : "শাখা / গ্রুপ"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displaySec}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "ID / Reg" : "আইডি / রেজি"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${formatDigits(studentId)}</td>
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Roll No" : "রোল নং"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${formatDigits(String(rollNo).padStart(2, '0'))}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "Religion" : "ধর্ম (Religion)"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displayRel}</td>
                                ${isSecondary ? `
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Optional Subject" : "ঐচ্ছিক বিষয়"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displayOpt}</td>
                                ` : `
                                <td class="p-label" style="padding-left: 15px; visibility: hidden;">—</td>
                                <td class="p-colon" style="visibility: hidden;">:</td>
                                <td class="p-val" style="visibility: hidden;">—</td>
                                `}
                            </tr>
                        </table>
                    </div>
                </div>

                <div class="grading-legend-cell">
                    <div class="legend-card">
                        <div class="legend-title">${isEn ? "Grading Scale" : "গ্রেডিং নির্দেশিকা (Grading Scale)"}</div>
                        <table class="legend-table">
                            <thead>
                                <tr>
                                    <th>${isEn ? "Marks Range" : "নম্বর সীমা"}</th>
                                    <th>${isEn ? "Grade" : "গ্রেড"}</th>
                                    <th>${isEn ? "GPA" : "পয়েন্ট"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${getGradingScaleLegendRowsHTML1()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Academic Evaluation Table -->
            <table class="transcript-table">
                <thead>
                    <tr>
                        <th rowspan="2" id="th-header-sub-1" style="width: 35%;">${isEn ? "Subjects" : "পাঠ্য বিষয়সমূহ"}</th>
                        <th colspan="3" id="th-header-obtained-1" style="width: 25%;">${isEn ? "Marks Obtained" : "প্রাপ্ত নম্বর"}</th>
                        <th rowspan="2" style="width: 9%;">${isEn ? "Total" : "মোট নম্বর"}</th>
                        <th rowspan="2" id="th-header-combined-1" style="width: 11%;">${isEn ? "Grand Total" : "সর্বমোট"}</th>
                        <th rowspan="2" id="th-header-grade-1" style="width: 9%;">${isEn ? "Letter Grade" : "লেটার গ্রেড"}</th>
                        <th rowspan="2" id="th-header-gp-1" style="width: 11%;">${isEn ? "Grade Point (GP)" : "গ্রেড পয়েন্ট (GP)"}</th>
                    </tr>
                    <tr>
                        <th style="width: 8%;">${isEn ? "MCQ" : "বহুনির্বাচনি"}</th>
                        <th style="width: 8.5%;">${isEn ? "CQ" : "লিখিত"}</th>
                        <th style="width: 8.5%;">${isEn ? "Prac." : "ব্যবহারিক"}</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableHtml}
                </tbody>
            </table>

            <!-- Result KPI Badges -->
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-label">${isEn ? "Total Marks Obtained" : "সর্বমোট প্রাপ্ত নম্বর"}</div>
                    <div class="kpi-value">${hasAnyMarks ? (formatDigits(grandTotal) + ' / ' + formatDigits(totalFullMarks)) : '—'}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "GPA" : "জিপিএ (GPA)"}</div>
                    <div class="kpi-value" style="color: #000000; font-weight:800;">${finalGpaStr}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "Final Grade" : "চূড়ান্ত গ্রেড"}</div>
                    <div class="kpi-value" style="color: #000000; font-weight:800;">${finalGrade}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "Merit Position" : "মেধাক্রম (Merit Position)"}</div>
                    <div class="kpi-value">${rankStr}</div>
                </div>
            </div>

            <!-- Signatures -->
            <div class="signature-grid">
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Guardian's Signature" : "অভিভাবকের স্বাক্ষর"}</div>
                </div>
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Class Teacher's Signature" : "শ্রেণি শিক্ষকের স্বাক্ষর"}</div>
                </div>
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Head Teacher's Signature & Seal" : "প্রধান শিক্ষকের স্বাক্ষর ও সিল"}</div>
                </div>
            </div>

        </div>


    </div>`;
}


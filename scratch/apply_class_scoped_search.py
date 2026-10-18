import re

def update_marksheet(filename, is_marksheet1=False):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add CSS
    search_css = """
        .search-group {
            position: relative;
            background: #f8fafc;
        }

        .search-input-wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
        }

        .filter-search-input {
            background: #ffffff;
            color: #0f172a;
            border: 1px solid #94a3b8;
            border-radius: 14px;
            padding: 4px 28px 4px 10px;
            font-size: 13px;
            font-weight: 600;
            font-family: inherit;
            outline: none;
            width: 175px;
            transition: all 0.25s ease;
        }

        .filter-search-input:focus {
            width: 220px;
            border-color: #2563eb;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .btn-clear-search {
            position: absolute;
            right: 6px;
            background: transparent;
            border: none;
            color: #64748b;
            font-size: 16px;
            font-weight: bold;
            line-height: 1;
            cursor: pointer;
            padding: 0 4px;
            border-radius: 50%;
            transition: all 0.15s ease;
        }

        .btn-clear-search:hover {
            color: #ef4444;
            background: #fee2e2;
        }

        .search-suggestions-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            min-width: 290px;
            max-width: 350px;
            max-height: 290px;
            overflow-y: auto;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
            z-index: 999999;
            padding: 4px 0;
        }

        .search-suggestion-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.15s ease;
            text-align: left;
        }

        .search-suggestion-item:last-child {
            border-bottom: none;
        }

        .search-suggestion-item:hover, .search-suggestion-item.active {
            background: #eff6ff;
        }

        .search-suggestion-name {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.25;
            margin-bottom: 3px;
        }

        .search-suggestion-meta {
            display: flex;
            align-items: center;
            gap: 5px;
            flex-wrap: wrap;
            font-size: 11.5px;
            color: #64748b;
        }

        .search-suggestion-badge {
            background: #e2e8f0;
            color: #334155;
            padding: 1px 6px;
            border-radius: 6px;
            font-weight: 600;
        }

        .search-suggestion-badge.roll {
            background: #dbeafe;
            color: #1d4ed8;
            font-weight: 700;
        }

        .search-no-result {
            padding: 12px;
            text-align: center;
            font-size: 12.5px;
            color: #94a3b8;
            font-weight: 600;
        }
"""
    if '.search-group {' not in content:
        content = re.sub(
            r'(\.filter-select:hover[^{]*\{[^}]*\})',
            r'\1\n' + search_css,
            content,
            count=1
        )

    # 2. Add Toolbar HTML
    search_html = """
        <!-- Student Search Filter -->
        <div class="filter-group search-group" title="উক্ত শ্রেণির শিক্ষার্থীর রোল, নাম বা আইডি দিয়ে খুঁজুন">
            <label for="filter-student-search" class="filter-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>খুঁজুন:</span>
            </label>
            <div class="search-input-wrapper">
                <input type="text" id="filter-student-search" class="filter-search-input" placeholder="রোল / নাম / আইডি লিখুন..." autocomplete="off" oninput="handleStudentSearchInput(this.value)" onkeydown="handleStudentSearchKeydown(event)" onfocus="handleStudentSearchFocus()">
                <button type="button" class="btn-clear-search" id="btn-clear-search" onclick="clearStudentSearch()" title="সার্চ মুছুন" style="display: none;">&times;</button>
                <div id="search-suggestions-dropdown" class="search-suggestions-dropdown" style="display: none;"></div>
            </div>
        </div>
"""
    if 'id="filter-student-search"' not in content:
        content = re.sub(
            r'(<!--\s*Section Filter\s*-->[\s\S]*?</div>)',
            r'\1\n' + search_html,
            content,
            count=1
        )

    # 3. JS Search Functions
    batch_fn_name = "renderBatchMarksheets1" if is_marksheet1 else "renderBatchMarksheets"
    roll_default = "'০১'" if is_marksheet1 else "'১'"

    js_helpers = f"""
        // Student Search State & Helpers
        let currentSearchQuery = '';
        let currentSelectedStudent = null;

        function escapeHtml(text) {{
            if (!text) return '';
            return String(text).replace(/[&<>"']/g, function(m) {{
                return {{ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }}[m];
            }});
        }}

        function getAllStudentsList() {{
            let raw = localStorage.getItem('school_students');
            let list = [];
            if (raw) {{
                try {{ list = JSON.parse(raw); }} catch(e) {{}}
            }}
            if (Array.isArray(list) && list.length > 0) return list;
            return [
                {{ roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', name: 'Md. Abdullah Al Noman', studentId: '২০২৬১০১০০১', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' }},
                {{ roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', name: 'Mst. Fatema Akter', studentId: '২০২৬১০১০০২', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Biology' }},
                {{ roll: '3', nameBn: 'সৌরভ কুমার রায়', name: 'Sourav Kumar Roy', studentId: '২০২৬১০১০০৩', class: 'Ten', section: 'বিজ্ঞান', religion: 'Hindu', optionalSubject: 'Higher Mathematics' }},
                {{ roll: '4', nameBn: 'তানভীর হাসান', name: 'Tanvir Hasan', studentId: '২০২৬১০১০০৪', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' }},
                {{ roll: '5', nameBn: 'সাদিয়া জাহান', name: 'Sadia Jahan', studentId: '২০২৬১০১০০৫', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' }},
                {{ roll: '6', nameBn: 'প্রিয়াংকা সরকার', name: 'Priyanka Sarkar', studentId: '২০২৬১০১০০৬', class: 'Ten', section: 'বিজ্ঞান', religion: 'Hindu', optionalSubject: 'Higher Mathematics' }},
                {{ roll: '7', nameBn: 'মেহেদী হাসান', name: 'Mehedi Hasan', studentId: '২০২৬১০১০০৭', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' }},
                {{ roll: '8', nameBn: 'সুমাইয়া জান্নাত', name: 'Sumaiya Jannat', studentId: '২০২৬১০১০০৮', class: 'Ten', section: 'বিজ্ঞান', religion: 'Islam', optionalSubject: 'Higher Mathematics' }}
            ];
        }}

        function matchesStudentQuery(student, query) {{
            if (!query) return true;
            const cleanQ = query.trim().toLowerCase();
            const cleanQEn = toEnDigits(cleanQ).replace(/^0+/, '');

            const rollStr = String(student.roll || student.rollNo || '');
            const rollEn = toEnDigits(rollStr).replace(/^0+/, '');

            // Exact roll match or startsWith
            if (cleanQEn && (rollEn === cleanQEn || rollEn.startsWith(cleanQEn))) return true;

            // Student ID match
            const idStr = String(student.studentId || student.regNo || student.id || '');
            const idEn = toEnDigits(idStr);
            if (cleanQEn && idEn.includes(cleanQEn)) return true;

            // Name match (Bangla & English)
            const nameBn = (student.nameBn || '').toLowerCase();
            const nameEn = (student.name || student.studentName || '').toLowerCase();
            if (nameBn.includes(cleanQ) || nameEn.includes(cleanQ)) return true;

            return false;
        }}

        function handleStudentSearchInput(val) {{
            currentSearchQuery = (val || '').trim();
            const clearBtn = document.getElementById('btn-clear-search');
            if (clearBtn) clearBtn.style.display = currentSearchQuery ? 'inline-block' : 'none';

            if (!currentSearchQuery) {{
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
                currentSelectedStudent = null;
                if (isCreateAllMode) {{
                    const selClass = document.getElementById('filter-class')?.value || 'Ten';
                    const selSec = document.getElementById('filter-section')?.value || 'বিজ্ঞান';
                    const selExam = document.getElementById('filter-exam')?.value || 'বার্ষিক পরীক্ষা ২০২৫';
                    {batch_fn_name}(selClass, selSec, selExam);
                }} else {{
                    syncCascadingFilters('search_cleared');
                }}
                return;
            }}

            renderSearchSuggestions(currentSearchQuery);

            if (isCreateAllMode) {{
                const selClass = document.getElementById('filter-class')?.value || 'Ten';
                const selSec = document.getElementById('filter-section')?.value || 'বিজ্ঞান';
                const selExam = document.getElementById('filter-exam')?.value || 'বার্ষিক পরীক্ষা ২০২৫';
                {batch_fn_name}(selClass, selSec, selExam);
            }} else {{
                syncCascadingFilters('search_typing');
            }}
        }}

        function renderSearchSuggestions(query) {{
            const dropdown = document.getElementById('search-suggestions-dropdown');
            if (!dropdown) return;

            if (!query) {{
                dropdown.style.display = 'none';
                dropdown.innerHTML = '';
                return;
            }}

            const currentClass = document.getElementById('filter-class')?.value || localStorage.getItem('school_marksheet_class') || '';
            const currentSection = document.getElementById('filter-section')?.value || localStorage.getItem('school_marksheet_section') || '';
            const normC = normalizeClassString(currentClass);
            const normS = normalizeSectionString(currentSection);

            const allStudents = getAllStudentsList();
            // নির্বাচন করা "শ্রেণি" এর নাম অনুসারে শুধুমাত্র উক্ত শ্রেণির শিক্ষার্থীদের ফিল্টার করা হচ্ছে
            const classStudents = allStudents.filter(st => {{
                const sClass = normalizeClassString(st.class || st.className);
                return sClass === normC;
            }});

            const matches = classStudents.filter(st => matchesStudentQuery(st, query));

            if (matches.length === 0) {{
                dropdown.innerHTML = `<div class="search-no-result">${{escapeHtml(currentClass)}} শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি</div>`;
                dropdown.style.display = 'block';
                window._currentSearchMatches = [];
                return;
            }}

            matches.sort((a, b) => {{
                const aS = normalizeSectionString(a.section || a.group || a.sectionName);
                const bS = normalizeSectionString(b.section || b.group || b.sectionName);

                const aSame = (aS === normS || !normS) ? 1 : 0;
                const bSame = (bS === normS || !normS) ? 1 : 0;
                if (aSame !== bSame) return bSame - aSame;

                const aRoll = parseInt(toEnDigits(a.roll || 0), 10) || 0;
                const bRoll = parseInt(toEnDigits(b.roll || 0), 10) || 0;
                return aRoll - bRoll;
            }});

            const topMatches = matches.slice(0, 10);
            window._currentSearchMatches = topMatches;

            let itemsHtml = topMatches.map((st, idx) => {{
                const name = escapeHtml(st.nameBn || st.name || 'শিক্ষার্থী');
                const roll = toBnDigits(st.roll || st.rollNo || '');
                const stClass = escapeHtml(st.class || st.className || currentClass);
                const stSec = escapeHtml(st.section || st.group || st.sectionName || '—');
                const stId = st.studentId || st.regNo || st.id || '';

                return `
                <div class="search-suggestion-item" onmousedown="selectSearchedStudentByIndex(${{idx}})">
                    <div class="search-suggestion-name">${{name}}</div>
                    <div class="search-suggestion-meta">
                        <span class="search-suggestion-badge roll">রোল: ${{roll}}</span>
                        <span class="search-suggestion-badge">শ্রেণি: ${{stClass}}</span>
                        <span class="search-suggestion-badge">শাখা: ${{stSec}}</span>
                        ${{stId ? `<span class="search-suggestion-badge">ID: ${{toBnDigits(stId)}}</span>` : ''}}
                    </div>
                </div>`;
            }}).join('');

            dropdown.innerHTML = itemsHtml;
            dropdown.style.display = 'block';
        }}

        function selectSearchedStudentByIndex(idx) {{
            if (window._currentSearchMatches && window._currentSearchMatches[idx]) {{
                selectSearchedStudent(window._currentSearchMatches[idx]);
            }}
        }}

        function selectSearchedStudent(student) {{
            currentSelectedStudent = student;
            currentSearchQuery = '';

            const input = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            const dropdown = document.getElementById('search-suggestions-dropdown');

            const rollBn = toBnDigits(student.roll || student.rollNo || {roll_default});
            const name = student.nameBn || student.name || 'শিক্ষার্থী';
            if (input) {{
                input.value = `[রোল ${{rollBn}}] ${{name}}`;
            }}
            if (clearBtn) clearBtn.style.display = 'inline-block';
            if (dropdown) dropdown.style.display = 'none';

            const stSec = student.section || student.group || student.sectionName;
            if (stSec) {{
                localStorage.setItem('school_marksheet_section', stSec);
                const secSelect = document.getElementById('filter-section');
                if (secSelect) secSelect.value = stSec;
            }}

            if (isCreateAllMode) {{
                isCreateAllMode = false;
                const btn = document.getElementById('btn-create-all');
                const btnText = document.getElementById('create-all-btn-text');
                if (btn) {{
                    btn.classList.remove('active');
                    if (btnText) btnText.innerText = 'একক শিক্ষার্থী (Single)';
                }}
            }}

            syncCascadingFilters('student_searched');
        }}

        function clearStudentSearch() {{
            currentSearchQuery = '';
            currentSelectedStudent = null;

            const input = document.getElementById('filter-student-search');
            const clearBtn = document.getElementById('btn-clear-search');
            const dropdown = document.getElementById('search-suggestions-dropdown');

            if (input) input.value = '';
            if (clearBtn) clearBtn.style.display = 'none';
            if (dropdown) dropdown.style.display = 'none';

            syncCascadingFilters('search_cleared');
        }}

        function handleStudentSearchKeydown(e) {{
            if (e.key === 'Enter') {{
                e.preventDefault();
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (window._currentSearchMatches && window._currentSearchMatches.length > 0) {{
                    selectSearchedStudent(window._currentSearchMatches[0]);
                }} else {{
                    const query = (document.getElementById('filter-student-search')?.value || '').trim();
                    if (query) {{
                        const currentClass = document.getElementById('filter-class')?.value || localStorage.getItem('school_marksheet_class') || '';
                        const normC = normalizeClassString(currentClass);
                        const all = getAllStudentsList();
                        const classStudents = all.filter(st => normalizeClassString(st.class || st.className) === normC);
                        const matched = classStudents.find(s => matchesStudentQuery(s, query));
                        if (matched) {{
                            selectSearchedStudent(matched);
                        }}
                    }}
                }}
                if (dropdown) dropdown.style.display = 'none';
            }} else if (e.key === 'Escape') {{
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
            }}
        }}

        function handleStudentSearchFocus() {{
            const input = document.getElementById('filter-student-search');
            const query = input ? input.value.trim() : '';
            if (query && !query.startsWith('[রোল')) {{
                renderSearchSuggestions(query);
            }}
        }}

        // Close search suggestions on outside click
        document.addEventListener('click', function(e) {{
            const wrapper = document.querySelector('.search-input-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {{
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.style.display = 'none';
            }}
        }});
"""
    # Replace existing helpers or insert before syncCascadingFilters
    if 'let currentSearchQuery =' in content:
        content = re.sub(
            r'// Student Search State & Helpers[\s\S]*?(?=// Master Cascading Filter Function)',
            js_helpers + '\n        ',
            content,
            count=1
        )
    else:
        content = re.sub(
            r'(\s*// Master Cascading Filter Function[^\n]*)',
            '\n' + js_helpers + r'\1',
            content,
            count=1
        )

    # 4. Update matchedStudent in syncCascadingFilters
    if is_marksheet1:
        old_matched_block = r"""        let matchedStudent = null;
        if \(Array\.isArray\(students\) && students\.length > 0\) \{[\s\S]*?renderMarksheet1Table\(selectedClass, selectedSection, matchedStudent \|\| \{ roll: rollNo \}, selectedExam\);\s*\}"""
        new_matched_block = """        let matchedStudent = null;

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

        const studentName = matchedStudent ? (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || 'মো: আব্দুল্লাহ আল নোমান') : 'মো: আব্দুল্লাহ আল নোমান';
        const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '০১') : '০১';
        const studentId = matchedStudent ? (matchedStudent.studentId || matchedStudent.regNo || matchedStudent.id || '২০২৪১০১০১') : '২০২৪১০১০১';

        const sVal = document.getElementById('display-student-val');
        if (sVal && sVal.innerText !== studentName) sVal.innerText = studentName;
        const rVal = document.getElementById('display-roll-val');
        if (rVal && rVal.innerText !== rollNo) rVal.innerText = rollNo;
        const idVal = document.getElementById('display-id-val');
        if (idVal && idVal.innerText !== studentId) idVal.innerText = studentId;

        const isSecondary = ['9', '10'].includes(effectiveNormClass);
        const relInfo = getStudentReligionInfo(matchedStudent);
        const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

        const relVal = document.getElementById('display-religion-val');
        if (relVal) relVal.innerText = relInfo.display;

        const optVal = document.getElementById('display-optional-val');
        const optLbl = document.getElementById('label-opt-val');
        const optCol = document.getElementById('colon-opt-val');
        if (optVal) {
            if (isSecondary) {
                if (optLbl) optLbl.style.visibility = 'visible';
                if (optCol) optCol.style.visibility = 'visible';
                optVal.style.visibility = 'visible';
                optVal.innerText = optInfo.nameBn;
            } else {
                if (optLbl) optLbl.style.visibility = 'hidden';
                if (optCol) optCol.style.visibility = 'hidden';
                optVal.style.visibility = 'hidden';
                optVal.innerText = '—';
            }
        }

        if (isCreateAllMode) {
            renderBatchMarksheets1(selectedClass, selectedSection, selectedExam);
        } else {
            const batchContainer = document.getElementById('batch-marksheets-container');
            const singleContainer = document.getElementById('single-certificate-sheet');
            if (batchContainer) batchContainer.style.display = 'none';
            if (singleContainer) singleContainer.style.display = 'block';
            renderMarksheet1Table(effectiveClass, effectiveSec, matchedStudent || { roll: rollNo }, selectedExam);
        }"""
        # If it was already replaced with previous version, match either:
        if 'renderMarksheet1Table(effectiveClass' in content:
            content = re.sub(
                r'        let matchedStudent = null;[\s\S]*?renderMarksheet1Table\(effectiveClass, effectiveSec, matchedStudent \|\| \{ roll: rollNo \}, selectedExam\);\s*\}',
                new_matched_block,
                content,
                count=1
            )
        else:
            content = re.sub(old_matched_block, new_matched_block, content, count=1)
    else:
        new_matched_block = """                let matchedStudent = null;

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

                const studentName = matchedStudent ? (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || 'মো: আব্দুল্লাহ আল নোমান') : 'মো: আব্দুল্লাহ আল নোমান';
                const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '১') : '১';
                const studentId = matchedStudent ? (matchedStudent.studentId || matchedStudent.regNo || matchedStudent.id || '২০২৬১০১০০১') : '২০২৬১০১০০১';

                const nameEl = document.getElementById('display-student-name');
                if (nameEl && nameEl.innerText !== studentName) nameEl.innerText = studentName;
                const rollEl = document.getElementById('display-roll-no');
                if (rollEl && rollEl.innerText !== rollNo) rollEl.innerText = rollNo;
                const idEl = document.getElementById('display-student-id');
                if (idEl && idEl.innerText !== studentId) idEl.innerText = studentId;

                const isSecondary = ['9', '10'].includes(effectiveNormClass);
                const relInfo = getStudentReligionInfo(matchedStudent);
                const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

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
                    renderMarksheetTable(effectiveClass, effectiveSec, matchedStudent || { roll: rollNo }, selectedExam);
                }"""
        old_matched_block = r"""                let matchedStudent = null;
                if \(Array\.isArray\(students\) && students\.length > 0\) \{[\s\S]*?renderMarksheetTable\(selectedClass, selectedSection, matchedStudent \|\| \{ roll: rollNo \}, selectedExam\);\s*\}"""
        if 'renderMarksheetTable(effectiveClass' in content:
            content = re.sub(
                r'                let matchedStudent = null;[\s\S]*?renderMarksheetTable\(effectiveClass, effectiveSec, matchedStudent \|\| \{ roll: rollNo \}, selectedExam\);\s*\}',
                new_matched_block,
                content,
                count=1
            )
        else:
            content = re.sub(old_matched_block, new_matched_block, content, count=1)

    # 5. Batch render update
    if is_marksheet1:
        new_batch_fn = """function renderBatchMarksheets1(selectedClass, selectedSection, exam) {
    const batchContainer = document.getElementById('batch-marksheets-container');
    const singleContainer = document.getElementById('single-certificate-sheet');
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
        html += generateMarksheet1CardHTML(st, selectedClass, selectedSection, exam, idx + 1);
    });

    batchContainer.innerHTML = html;
    batchContainer.style.display = 'block';
    if (singleContainer) singleContainer.style.display = 'none';
}"""
        content = re.sub(
            r'function renderBatchMarksheets1\(selectedClass, selectedSection, exam\) \{[\s\S]*?\n\}',
            new_batch_fn,
            content,
            count=1
        )
    else:
        new_batch_fn = """        function renderBatchMarksheets(selectedClass, selectedSection, exam) {
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
        }"""
        content = re.sub(
            r'        function renderBatchMarksheets\(selectedClass, selectedSection, exam\) \{[\s\S]*?\n        \}',
            new_batch_fn,
            content,
            count=1
        )

    # 6. Update class/section change and switchTemplate
    new_filters_fn = """        function updateMarksheetClass(val) {
            localStorage.setItem('school_marksheet_class', val);
            if (currentSelectedStudent && normalizeClassString(currentSelectedStudent.class || currentSelectedStudent.className) !== normalizeClassString(val)) {
                currentSelectedStudent = null;
                currentSearchQuery = '';
                const input = document.getElementById('filter-student-search');
                const clearBtn = document.getElementById('btn-clear-search');
                if (input) input.value = '';
                if (clearBtn) clearBtn.style.display = 'none';
            }
            syncCascadingFilters('class_changed');
        }

        function updateMarksheetSection(val) {
            localStorage.setItem('school_marksheet_section', val);
            if (currentSelectedStudent && normalizeSectionString(currentSelectedStudent.section || currentSelectedStudent.group) !== normalizeSectionString(val)) {
                currentSelectedStudent = null;
                currentSearchQuery = '';
                const input = document.getElementById('filter-student-search');
                const clearBtn = document.getElementById('btn-clear-search');
                if (input) input.value = '';
                if (clearBtn) clearBtn.style.display = 'none';
            }
            syncCascadingFilters('section_changed');
        }

        function switchTemplate(val) {
            let extra = isCreateAllMode ? '?mode=all' : '?mode=single';
            const roll = currentSelectedStudent ? (currentSelectedStudent.roll || currentSelectedStudent.rollNo) : '';
            if (roll) {
                extra += '&roll=' + encodeURIComponent(toEnDigits(roll));
            }
            if (val === 'Temp-01') {
                window.location.href = 'Marksheet.html' + extra;
            } else if (val === 'Temp-02') {
                window.location.href = 'Marksheet1.html' + extra;
            }
        }"""
    if is_marksheet1:
        new_filters_fn_m1 = new_filters_fn.replace('        function', 'function')
        content = re.sub(
            r'function updateMarksheetClass\(val\) \{[\s\S]*?function switchTemplate\(val\) \{[\s\S]*?\n\}',
            new_filters_fn_m1,
            content,
            count=1
        )
    else:
        content = re.sub(
            r'        function updateMarksheetClass\(val\) \{[\s\S]*?function switchTemplate\(val\) \{[\s\S]*?\n        \}',
            new_filters_fn,
            content,
            count=1
        )

    # 7. Update DOMContentLoaded
    dom_loaded = """        // Initialize saved filters & header on load
        window.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const paramRoll = urlParams.get('roll') || urlParams.get('search') || urlParams.get('id');

            if (urlParams.get('exam')) localStorage.setItem('school_marksheet_exam', urlParams.get('exam'));
            if (urlParams.get('class')) localStorage.setItem('school_marksheet_class', urlParams.get('class'));
            if (urlParams.get('section')) localStorage.setItem('school_marksheet_section', urlParams.get('section'));

            if (paramRoll) {
                isCreateAllMode = false;
                const selClass = urlParams.get('class') || localStorage.getItem('school_marksheet_class') || 'Ten';
                const normC = normalizeClassString(selClass);
                const all = getAllStudentsList();
                const found = all.find(s => {
                    const stC = normalizeClassString(s.class || s.className);
                    return (!normC || stC === normC) && matchesStudentQuery(s, paramRoll);
                });
                if (found) {
                    currentSelectedStudent = found;
                    const input = document.getElementById('filter-student-search');
                    const clearBtn = document.getElementById('btn-clear-search');
                    if (input) input.value = `[রোল ${toBnDigits(found.roll || '১')}] ${found.nameBn || found.name || 'শিক্ষার্থী'}`;
                    if (clearBtn) clearBtn.style.display = 'inline-block';
                    if (found.class) localStorage.setItem('school_marksheet_class', found.class);
                    if (found.section) localStorage.setItem('school_marksheet_section', found.section);
                }
            } else if (urlParams.get('mode') === 'single') {
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

            syncSchoolHeaderInfo();
            syncCascadingFilters('all');
        });"""
    if is_marksheet1:
        dom_loaded_m1 = dom_loaded.replace('        //', '//').replace('        window.', 'window.').replace('            ', '    ').replace('        });', '});')
        content = re.sub(
            r'// Initialize saved filters & header on load[\s\S]*?syncCascadingFilters\(\'all\'\);\s*\}\);',
            dom_loaded_m1,
            content,
            count=1
        )
    else:
        content = re.sub(
            r'        // Initialize saved filters & header on load[\s\S]*?syncCascadingFilters\(\'all\'\);\s*\}\);',
            dom_loaded,
            content,
            count=1
        )

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename} successfully.")

if __name__ == '__main__':
    update_marksheet('Marksheet.html', is_marksheet1=False)
    update_marksheet('Marksheet1.html', is_marksheet1=True)

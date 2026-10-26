// Search Helpers:
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
                    renderBatchMarksheets(selClass, selSec, selExam);
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
                renderBatchMarksheets(selClass, selSec, selExam);
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

            const rollBn = toBnDigits(student.roll || student.rollNo || '১');
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


        // Master Cascading Filter Function

// Students Helper:
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

// BLOCK 4

        function buildStudentLookupMap() {
            const map = {
                byId: new Map(),
                byReg: new Map(),
                byNameClass: new Map()
            };
            try {
                const list = JSON.parse(localStorage.getItem('school_students') || '[]');
                if (Array.isArray(list)) {
                    list.forEach(s => {
                        if (!s) return;
                        if (s.id) map.byId.set(String(s.id).trim(), s);
                        if (s.regNo) map.byReg.set(String(s.regNo).trim(), s);
                        const cKey = String(s.class || '').trim().toLowerCase();
                        const nKey = String(s.name || '').trim().toLowerCase();
                        const nbKey = String(s.nameBn || '').trim().toLowerCase();
                        const rKey = String(s.roll || '').trim();
                        if (cKey && nKey) map.byNameClass.set(`${cKey}___${nKey}`, s);
                        if (cKey && nbKey) map.byNameClass.set(`${cKey}___${nbKey}`, s);
                        if (cKey && rKey) map.byNameClass.set(`${cKey}___roll_${rKey}`, s);
                    });
                }
            } catch (e) {}
            return map;
        }

        function resolveAttendanceLiveStudent(st, studentLookupMap = null) {
            if (!st || typeof st !== 'object') return st;
            const lookup = studentLookupMap || (typeof window !== 'undefined' && window.__currentStudentLookupMap) || buildStudentLookupMap();
            let live = null;
            if (st.id && lookup.byId && lookup.byId.has(String(st.id).trim())) {
                live = lookup.byId.get(String(st.id).trim());
            } else if (st.regNo && lookup.byReg && lookup.byReg.has(String(st.regNo).trim())) {
                live = lookup.byReg.get(String(st.regNo).trim());
            } else {
                const cKey = String(st.class || st.className || '').trim().toLowerCase();
                const nKey = String(st.name || '').trim().toLowerCase();
                const nbKey = String(st.nameBn || '').trim().toLowerCase();
                const rKey = String(st.roll || '').trim();
                if (cKey && nKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___${nKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___${nKey}`);
                } else if (cKey && nbKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___${nbKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___${nbKey}`);
                } else if (cKey && rKey && lookup.byNameClass && lookup.byNameClass.has(`${cKey}___roll_${rKey}`)) {
                    live = lookup.byNameClass.get(`${cKey}___roll_${rKey}`);
                }
            }

            let finalId = '';
            if (live) {
                finalId = live.studentId || (live.roll && !isNaN(parseInt(live.roll)) ? String(parseInt(live.roll)).padStart(4, '0') : '');
            }
            if (!finalId) {
                finalId = st.studentId || '';
            }
            if (!finalId || finalId.startsWith('178') || finalId.length > 10) {
                if (st.roll && !isNaN(parseInt(st.roll))) {
                    finalId = String(parseInt(st.roll)).padStart(4, '0');
                } else if (st.regNo && String(st.regNo).trim()) {
                    finalId = String(st.regNo).trim();
                } else {
                    finalId = '-';
                }
            }

            return {
                ...st,
                studentId: finalId,
                roll: live ? (live.roll || st.roll) : st.roll,
                regNo: live ? (live.regNo || st.regNo) : st.regNo,
                name: live ? (live.name || st.name) : st.name,
                nameBn: live ? (live.nameBn || st.nameBn) : st.nameBn,
                class: live ? (live.class || st.class) : st.class,
                section: live ? (live.section || st.section) : st.section,
                gender: live ? (live.gender || st.gender) : st.gender,
                religion: live ? (live.religion || st.religion) : st.religion,
                optionalSubject: live ? (live.optionalSubject || st.optionalSubject) : st.optionalSubject
            };
        }


        function safeJsonParse(key, fallback) {

            try {

                const item = localStorage.getItem(key);

                return item ? JSON.parse(item) : fallback;

            } catch (e) {

                return fallback;

            }

        }



        function formatClassLabel(cls) {

            if (!cls) return '';

            const c = String(cls).trim();

            const map = {

                'play': 'প্লে (PLAY)',

                'nursery': 'নার্সারি (NURSERY)',

                'kg': 'কেজি (KG)',

                'one': 'প্রথম (ONE)',

                'two': 'দ্বিতীয় (TWO)',

                'three': 'তৃতীয় (THREE)',

                'four': 'চতুর্থ (FOUR)',

                'five': 'পঞ্চম (FIVE)',

                'six': 'ষষ্ঠ (SIX)',

                'seven': 'সপ্তম (SEVEN)',

                'eight': 'অষ্টম (EIGHT)',

                'nine': 'নবম (NINE)',

                'ten': 'দশম (TEN)'

            };

            return map[c.toLowerCase()] || c;

        }



        function formatShiftLabel(shift) {

            if (!shift) return '';

            const s = String(shift).trim();

            if (/morning|sokal|সকাল|প্রভাতি/i.test(s)) {

                return 'সকাল (Morning Shift)';

            }

            if (/afternoon|bikal|বিকাল|দিবা/i.test(s)) {

                return 'বিকাল (Afternoon Shift)';

            }

            return s;

        }



        function onExamFilterChange() {
            populateClassFilter();
            updateSeatingDetailsLive();
        }

        function populateClassFilter() {
            const classSelect = document.getElementById('filter-class');
            if (!classSelect) return;
            const currentSelected = classSelect.value || 'all';
            classSelect.innerHTML = '<option value="all">সকল শ্রেণি (All Classes)</option>';

            const examVal = document.getElementById('filter-exam')?.value || 'all';
            const store = safeJsonParse('school_seat_plans_store', {});
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);

            const discoveredClasses = new Set();

            if (store && typeof store === 'object' && Object.keys(store).length > 0) {
                Object.keys(store).forEach(planKey => {
                    const plan = store[planKey];
                    if (!plan || !plan.allocations) return;

                    let matchesExam = false;
                    if (examVal === 'all') {
                        matchesExam = true;
                    } else {
                        const cleanExam = examVal.toLowerCase().trim();
                        const cleanPlanKey = planKey.toLowerCase().trim();
                        const cleanPlanExam = (plan.examName || '').toLowerCase().trim();
                        matchesExam = (cleanPlanKey === cleanExam) || 
                                      (cleanPlanExam === cleanExam) || 
                                      (cleanPlanKey.includes(cleanExam) && cleanExam.length > 3) ||
                                      (cleanPlanExam.includes(cleanExam) && cleanExam.length > 3);
                    }

                    if (matchesExam && typeof plan.allocations === 'object') {
                        Object.values(plan.allocations).forEach(roomAlloc => {
                            if (roomAlloc && roomAlloc.benches && Array.isArray(roomAlloc.benches)) {
                                roomAlloc.benches.forEach(bench => {
                                    if (bench.left && (bench.left.class || bench.left.className)) {
                                        discoveredClasses.add(bench.left.class || bench.left.className);
                                    }
                                    if (bench.right && (bench.right.class || bench.right.className)) {
                                        discoveredClasses.add(bench.right.class || bench.right.className);
                                    }
                                });
                            }
                        });
                    }
                });
            }

            if (discoveredClasses.size === 0 && savedAlloc && typeof savedAlloc === 'object') {
                Object.values(savedAlloc).forEach(roomAlloc => {
                    if (roomAlloc && roomAlloc.benches && Array.isArray(roomAlloc.benches)) {
                        roomAlloc.benches.forEach(bench => {
                            if (bench.left && (bench.left.class || bench.left.className)) {
                                discoveredClasses.add(bench.left.class || bench.left.className);
                            }
                            if (bench.right && (bench.right.class || bench.right.className)) {
                                discoveredClasses.add(bench.right.class || bench.right.className);
                            }
                        });
                    }
                });
            }

            if (discoveredClasses.size === 0) {
                let classesList = [];
                try {
                    classesList = JSON.parse(localStorage.getItem('school_classes') || '[]');
                } catch (e) { }

                if (!Array.isArray(classesList) || classesList.length === 0) {
                    classesList = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                }
                classesList.forEach(cls => discoveredClasses.add(cls));
            }

            const classOrderMap = {
                'play': 1, 'প্লে': 1,
                'nursery': 2, 'নার্সারি': 2,
                'kg': 3, 'কেজি': 3,
                'one': 4, 'প্রথম': 4, '1': 4,
                'two': 5, 'দ্বিতীয়': 5, '2': 5,
                'three': 6, 'তৃতীয়': 6, '3': 6,
                'four': 7, 'চতুর্থ': 7, '4': 7,
                'five': 8, 'পঞ্চম': 8, '5': 8,
                'six': 9, 'ষষ্ঠ': 9, '6': 9,
                'seven': 10, 'সপ্তম': 10, '7': 10,
                'eight': 11, 'অষ্টম': 11, '8': 11,
                'nine': 12, 'নবম': 12, '9': 12,
                'ten': 13, 'দশম': 13, '10': 13
            };

            const sortedClasses = Array.from(discoveredClasses).sort((a, b) => {
                const keyA = String(a).toLowerCase().trim();
                const keyB = String(b).toLowerCase().trim();
                const orderA = classOrderMap[keyA] || 99;
                const orderB = classOrderMap[keyB] || 99;
                if (orderA !== orderB) return orderA - orderB;
                return String(a).localeCompare(String(b), 'bn', { numeric: true });
            });

            sortedClasses.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls;
                opt.innerText = formatClassLabel(cls);
                classSelect.appendChild(opt);
            });

            if (currentSelected && [...classSelect.options].some(o => o.value === currentSelected)) {
                classSelect.value = currentSelected;
            } else {
                classSelect.value = 'all';
            }
        }

        function populateExamFilter() {
            const examSelect = document.getElementById('filter-exam');
            if (!examSelect) return;
            const currentSelected = examSelect.value || 'all';
            examSelect.innerHTML = '<option value="all">সকল পরীক্ষা (All Exams / Routine Title)</option>';

            const examSet = new Set();
            const store = safeJsonParse('school_seat_plans_store', {});

            if (store && typeof store === 'object' && Object.keys(store).length > 0) {
                Object.values(store).forEach(plan => {
                    if (plan && plan.examName && plan.examName.trim() && plan.examName.trim().toLowerCase() !== 'all') {
                        examSet.add(plan.examName.trim());
                    }
                });
            }

            if (examSet.size === 0) {
                try {
                    const routines = JSON.parse(localStorage.getItem('school_exam_routines') || '[]');
                    if (Array.isArray(routines)) {
                        routines.forEach(r => { if (r && r.examName && r.examName.trim()) examSet.add(r.examName.trim()); });
                    }
                    const examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]');
                    if (Array.isArray(examTypes)) {
                        examTypes.forEach(t => { if (t && t.name && t.name.trim()) examSet.add(t.name.trim()); });
                    }
                } catch (e) {}
            }

            if (examSet.size === 0) {
                const settings = safeJsonParse('school_settings', null);
                if (settings?.examName && settings.examName.trim()) {
                    examSet.add(settings.examName.trim());
                } else {
                    examSet.add('বার্ষিক পরীক্ষা - ২০২৬');
                }
            }

            examSet.forEach(exam => {
                const opt = document.createElement('option');
                opt.value = exam;
                opt.innerText = exam;
                examSelect.appendChild(opt);
            });

            if (currentSelected && [...examSelect.options].some(o => o.value === currentSelected)) {
                examSelect.value = currentSelected;
            } else {
                examSelect.value = 'all';
            }
        }

        function populateShiftFilter() {
            const shiftSelect = document.getElementById('filter-shift');
            if (!shiftSelect) return;
            const currentSelected = shiftSelect.value || 'all';
            shiftSelect.innerHTML = '<option value="all">সকল শিফট (All Shifts)</option>';

            const shiftsSet = new Set();
            const store = safeJsonParse('school_seat_plans_store', {});
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);

            if (store && typeof store === 'object' && Object.keys(store).length > 0) {
                Object.values(store).forEach(plan => {
                    if (plan && plan.shift && plan.shift.trim()) {
                        shiftsSet.add(plan.shift.trim());
                    }
                    if (plan && plan.allocations && typeof plan.allocations === 'object') {
                        Object.values(plan.allocations).forEach(item => {
                            if (item && item.shift && item.shift.trim()) {
                                shiftsSet.add(item.shift.trim());
                            }
                        });
                    }
                });
            }

            if (savedAlloc && typeof savedAlloc === 'object') {
                Object.values(savedAlloc).forEach(item => {
                    if (item && item.shift && item.shift.trim()) {
                        shiftsSet.add(item.shift.trim());
                    }
                });
            }

            if (shiftsSet.size === 0) {
                try {
                    const shiftTimes = JSON.parse(localStorage.getItem('school_shift_times') || '[]');
                    if (Array.isArray(shiftTimes)) {
                        shiftTimes.forEach(st => {
                            if (st && st.shift && st.shift.trim()) shiftsSet.add(st.shift.trim());
                        });
                    }
                } catch (e) {}
            }

            if (shiftsSet.size === 0) {
                shiftsSet.add('Morning Shift');
                shiftsSet.add('Afternoon Shift');
            }

            shiftsSet.forEach(shift => {
                const opt = document.createElement('option');
                opt.value = shift;
                opt.innerText = formatShiftLabel(shift);
                shiftSelect.appendChild(opt);
            });

            if (currentSelected && [...shiftSelect.options].some(o => o.value === currentSelected)) {
                shiftSelect.value = currentSelected;
            } else {
                shiftSelect.value = 'all';
            }
        }

        function updateSeatingDetailsFontSize(val) {

            const valSpan = document.getElementById('font-size-val');

            if (valSpan) valSpan.innerText = val + 'px';



            const numVal = parseFloat(val) || 14;

            const scaleRatio = numVal / 14;



            const tableElements = document.querySelectorAll('.summary-table th, .summary-table td');

            tableElements.forEach(el => {

                el.style.fontSize = (11 * scaleRatio).toFixed(1) + 'pt';

            });



            const sideHeaders = document.querySelectorAll('.header-col-left, .header-col-right');

            sideHeaders.forEach(el => {

                el.style.fontSize = (10.35 * scaleRatio).toFixed(1) + 'pt';

            });



            const centerHeaders = document.querySelectorAll('.header-col-center');

            centerHeaders.forEach(el => {

                el.style.fontSize = (21.56 * scaleRatio).toFixed(1) + 'pt';

                el.style.fontWeight = '900';

            });

        }



        function isClassMatch(studentClass, selectedClass) {

            if (!selectedClass || selectedClass === 'all') return true;

            if (!studentClass) return false;

            const stC = String(studentClass).toLowerCase().trim();

            const selC = String(selectedClass).toLowerCase().trim();

            if (stC === selC || stC.includes(selC) || selC.includes(stC)) return true;



            const map = {

                'six': ['six', 'ষষ্ঠ', '6'],

                'seven': ['seven', 'সপ্তম', '7'],

                'eight': ['eight', 'অষ্টম', '8'],

                'nine': ['nine', 'নবম', '9'],

                'ten': ['ten', 'দশম', '10'],

                'play': ['play', 'প্লে'],

                'nursery': ['nursery', 'নার্সারি'],

                'kg': ['kg', 'কেজি'],

                'one': ['one', 'প্রথম', '1'],

                'two': ['two', 'দ্বিতীয়', '2'],

                'three': ['three', 'তৃতীয়', '3'],

                'four': ['four', 'চতুর্থ', '4'],

                'five': ['five', 'পঞ্চম', '5']

            };



            if (map[selC]) {

                return map[selC].some(keyword => stC.includes(keyword));

            }

            return false;

        }



        function isShiftMatch(studentShift, selectedShift) {

            if (!selectedShift || selectedShift === 'all') return true;

            if (!studentShift) return false;

            const stS = String(studentShift).toLowerCase().trim();

            const selS = String(selectedShift).toLowerCase().trim();

            if (stS === selS || stS.includes(selS) || selS.includes(stS)) return true;



            if (selS.includes('morning') || selS.includes('sokal') || selS.includes('সকাল')) {

                return /morning|sokal|সকাল|প্রভাতি/i.test(stS);

            }

            if (selS.includes('afternoon') || selS.includes('bikal') || selS.includes('বিকাল')) {

                return /afternoon|bikal|বিকাল|দিবা/i.test(stS);

            }

            return false;

        }



        function updateSeatingDetailsLive() {
            const settings = safeJsonParse('school_settings', null);
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);
            const store = safeJsonParse('school_seat_plans_store', {});

            const classVal = document.getElementById('filter-class')?.value || 'all';
            const examVal = document.getElementById('filter-exam')?.value || 'all';
            const shiftVal = document.getElementById('filter-shift')?.value || 'all';
            const langVal = document.getElementById('filter-lang')?.value || 'bn';
            const searchVal = (document.getElementById('search-student')?.value || '').trim().toLowerCase();

            // Build student section lookup map for robust section resolution
            const studentSectionMap = {};
            try {
                const allStudents = JSON.parse(localStorage.getItem('school_students') || '[]');
                if (Array.isArray(allStudents)) {
                    allStudents.forEach(s => {
                        const sec = s.section || s.sec || s.sectionName || '';
                        if (sec) {
                            if (s.studentId) studentSectionMap[String(s.studentId).trim()] = sec.trim();
                            if (s.id) studentSectionMap[String(s.id).trim()] = sec.trim();
                            if (s.class && s.roll) {
                                studentSectionMap[`${String(s.class).trim().toLowerCase()}___${String(s.roll).trim()}`] = sec.trim();
                            }
                        }
                    });
                }
            } catch (e) {}

            let allocList = [];
            let planFoundForExam = false;

            if (store && typeof store === 'object' && Object.keys(store).length > 0) {
                Object.keys(store).forEach(planKey => {
                    const plan = store[planKey];
                    if (!plan || !plan.allocations) return;

                    let matchesExam = false;
                    if (examVal === 'all') {
                        matchesExam = true;
                    } else {
                        const cleanExam = examVal.toLowerCase().trim();
                        const cleanPlanKey = planKey.toLowerCase().trim();
                        const cleanPlanExam = (plan.examName || '').toLowerCase().trim();
                        matchesExam = (cleanPlanKey === cleanExam) || 
                                      (cleanPlanExam === cleanExam) || 
                                      (cleanPlanKey.includes(cleanExam) && cleanExam.length > 3) ||
                                      (cleanPlanExam.includes(cleanExam) && cleanExam.length > 3);
                    }

                    if (matchesExam) {
                        planFoundForExam = true;
                        Object.keys(plan.allocations).forEach(rId => {
                            const item = plan.allocations[rId];
                            if (item) {
                                const itemCopy = JSON.parse(JSON.stringify(item));
                                if (!itemCopy.shift && plan.shift) itemCopy.shift = plan.shift;
                                allocList.push({ rId, item: itemCopy });
                            }
                        });
                    }
                });
            }

            if (allocList.length === 0 && savedAlloc && typeof savedAlloc === 'object' && Object.keys(savedAlloc).length > 0) {
                if (examVal === 'all') {
                    Object.keys(savedAlloc).forEach(rId => {
                        const item = savedAlloc[rId];
                        if (item) allocList.push({ rId, item });
                    });
                }
            }

            // Show sample mock template ONLY when examVal is 'all' and no data exists anywhere in localStorage
            if (allocList.length === 0 && examVal === 'all' && !planFoundForExam && (!savedAlloc || Object.keys(savedAlloc).length === 0)) {
                allocList = [
                    {
                        rId: '201',
                        item: {
                            room: { number: '201' },
                            building: { name: 'একাডেমিক ভবন-ক' },
                            shift: 'Morning Shift',
                            benches: [
                                ...Array(9).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'A', roll: String(i + 1).padStart(2, '0'), studentId: '2026080' + (i + 1) } })),
                                ...Array(8).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'B', roll: String(i + 10).padStart(2, '0'), studentId: '202608' + (i + 10) } })),
                                ...Array(9).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'ক', roll: String(i + 1).padStart(2, '0'), studentId: '2026060' + (i + 1) } })),
                                ...Array(8).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'খ', roll: String(i + 10).padStart(2, '0'), studentId: '202606' + (i + 10) } }))
                            ]
                        }
                    },
                    {
                        rId: '401',
                        item: {
                            room: { number: '401' },
                            building: { name: 'একাডেমিক ভবন-ক' },
                            shift: 'Morning Shift',
                            benches: [
                                ...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'A', roll: String(109 + i), studentId: '202608' + (109 + i) } })),
                                ...Array(4).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'ক', roll: String(66 + i), studentId: '202606' + (66 + i) } })),
                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'দশম (TEN)', section: 'বিজ্ঞান', roll: String(44 + i), studentId: '202610' + (44 + i) } }))
                            ]
                        }
                    },
                    {
                        rId: '501',
                        item: {
                            room: { number: '501' },
                            building: { name: 'গোলাপী ভবন' },
                            shift: 'Afternoon Shift',
                            benches: [
                                ...Array(8).fill(0).map((_, i) => ({ left: { class: 'সপ্তম (SEVEN)', section: 'A', roll: String(i + 1).padStart(2, '0'), studentId: '2026070' + (i + 1) } })),
                                ...Array(7).fill(0).map((_, i) => ({ left: { class: 'সপ্তম (SEVEN)', section: 'B', roll: String(i + 9).padStart(2, '0'), studentId: '2026070' + (i + 9) } })),
                                ...Array(15).fill(0).map((_, i) => ({ right: { class: 'নবম (NINE)', section: 'মানবিক', roll: String(i + 1).padStart(2, '0'), studentId: '2026090' + (i + 1) } }))
                            ]
                        }
                    }
                ];
            }

            const schoolName = settings?.schoolName || (document.getElementById('school-name')?.textContent?.trim()) || 'আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়';
            const activeExamName = (examVal !== 'all') ? examVal : (settings?.examName || 'বার্ষিক পরীক্ষা - ২০২৬');

            const customLogo = localStorage.getItem('school_logo');
            const logoUrl = customLogo || settings?.schoolLogo;
            const logoHtml = logoUrl 
                ? `<img src="${logoUrl}" alt="Logo" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
                : `<span id="seating-site-logo-icon">🎓</span>`;

            // Group rooms by shift and building for selected exam
            const pageGroupMap = {};
            let itemsToProcess = allocList;

            if (searchVal) {
                itemsToProcess = itemsToProcess.filter(({ rId, item }) => {
                    const rNo = String(item.room?.number || rId).toLowerCase();
                    return rNo.includes(searchVal);
                });
            }

            itemsToProcess.forEach(({ rId, item }) => {
                if (!item || !item.benches) return;
                let sName = item.shift || 'Morning Shift';
                if (!isShiftMatch(sName, shiftVal)) return;
                let bName = (item.building && item.building.name && item.building.name.trim()) ? item.building.name.trim() : 'একাডেমিক ভবন-ক';

                const groupKey = sName + '___' + bName;
                if (!pageGroupMap[groupKey]) {
                    pageGroupMap[groupKey] = {
                        shiftName: sName,
                        buildingName: bName,
                        roomList: []
                    };
                }
                pageGroupMap[groupKey].roomList.push({ rId, item });
            });

            const pagesContainer = document.getElementById('pages-container');
            if (!pagesContainer) return;

            const groupKeys = Object.keys(pageGroupMap);
            if (groupKeys.length === 0) {
                const noDataMsg = (examVal !== 'all' && !planFoundForExam)
                    ? `উক্ত পরীক্ষা (${examVal}) এর জন্য কোন সংরক্ষিত সিটপ্ল্যান পাওয়া যায়নি (No saved seat plan data found).`
                    : `কোন তথ্য পাওয়া যায়নি (No matching data found for selected filters).`;

                pagesContainer.innerHTML = `<div style="background:#fff; padding:35px 20px; margin-top:25px; border-radius:10px; text-align:center; font-weight:700; color:#ef4444; font-size:1.1rem; box-shadow:0 4px 15px rgba(0,0,0,0.08); border: 1.5px solid #fca5a5;">⚠️ ${noDataMsg}</div>`;
                return;
            }

            // Ensure Morning Shift comes first, then Afternoon Shift, and within each shift sort by building name
            groupKeys.sort((aKey, bKey) => {
                const groupA = pageGroupMap[aKey];
                const groupB = pageGroupMap[bKey];

                const isAMorning = /morning|sokal|সকাল|প্রভাতি/i.test(groupA.shiftName);
                const isBMorning = /morning|sokal|সকাল|প্রভাতি/i.test(groupB.shiftName);
                if (isAMorning && !isBMorning) return -1;
                if (!isAMorning && isBMorning) return 1;

                if (groupA.shiftName !== groupB.shiftName) {
                    return groupA.shiftName.localeCompare(groupB.shiftName);
                }

                return groupA.buildingName.localeCompare(groupB.buildingName, 'bn', { numeric: true });
            });

            let pagesHtml = '';
            let pageIdx = 1;

            groupKeys.forEach(gKey => {
                const { shiftName, buildingName, roomList } = pageGroupMap[gKey];
                let tbodyHtml = '';
                let sl = 1;
                let grandTotal = 0;

                roomList.forEach(({ rId, item }) => {
                    const roomNo = item.room ? item.room.number : rId;

                    // Group students in this room by Class and then by Section: { [class]: { [section]: [students] } }
                    const classGroup = {};
                    item.benches.forEach(b => {
                        [b.left, b.right].forEach(st => {
                            if (st) {
                                const c = st.class || st.className || 'Unassigned';
                                if (!isClassMatch(c, classVal)) return;

                                let sec = (st.section || st.sec || st.sectionName || '').trim();
                                if (!sec) {
                                    const idKey = String(st.studentId || st.id || '').trim();
                                    if (idKey && studentSectionMap[idKey]) {
                                        sec = studentSectionMap[idKey];
                                    } else {
                                        const crKey = `${String(c).trim().toLowerCase()}___${String(st.roll || '').trim()}`;
                                        if (studentSectionMap[crKey]) {
                                            sec = studentSectionMap[crKey];
                                        }
                                    }
                                }
                                if (!sec) sec = 'A';

                                if (!classGroup[c]) classGroup[c] = {};
                                if (!classGroup[c][sec]) classGroup[c][sec] = [];
                                classGroup[c][sec].push(st);
                            }
                        });
                    });

                    const classes = Object.keys(classGroup);
                    if (classes.length === 0) return;

                    // Calculate total table rows for this room across all classes and their sections
                    let totalRoomRows = 0;
                    classes.forEach(c => {
                        totalRoomRows += Object.keys(classGroup[c]).length;
                    });

                    let isFirstRowInRoom = true;

                    classes.forEach(cls => {
                        const secMap = classGroup[cls];
                        const sections = Object.keys(secMap);
                        const classRowCount = sections.length;

                        sections.forEach((sec, sIdx) => {
                            const stList = secMap[sec];
                            stList.sort((a, b) => {
                                const idA = String(a.studentId || a.id || a.roll || '');
                                const idB = String(b.studentId || b.id || b.roll || '');
                                return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                            });

                            const studentIds = stList.map(st => resolveAttendanceLiveStudent(st).studentId).filter(Boolean);
                            const idDisplay = studentIds.length > 0 ? studentIds.join(', ') : '-';
                            const total = stList.length;
                            grandTotal += total;

                            // Formatted Section Label
                            let secLabel = '';
                            if (langVal === 'en') secLabel = `Section: ${sec}`;
                            else if (langVal === 'both') secLabel = `শাখা (Section): ${sec}`;
                            else secLabel = `শাখা: ${sec}`;

                            tbodyHtml += '<tr>';

                            if (isFirstRowInRoom) {
                                tbodyHtml += `<td rowspan="${totalRoomRows}" style="vertical-align: middle; text-align: center; font-weight: 700;">${String(sl).padStart(2, '0')}</td>`;
                                tbodyHtml += `<td rowspan="${totalRoomRows}" style="vertical-align: middle; text-align: center; font-weight: 800;">${roomNo}</td>`;
                                isFirstRowInRoom = false;
                            }

                            if (sIdx === 0) {
                                tbodyHtml += `<td rowspan="${classRowCount}" style="vertical-align: middle; text-align: center; font-weight: 700;">${formatClassLabel(cls)}</td>`;
                            }

                            tbodyHtml += `<td style="text-align: left; padding: 6px 12px; line-height: 1.6;">
                                <div style="display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; font-weight: 800; font-size: 0.88em; padding: 1px 8px; border-radius: 4px; margin-right: 6px; box-shadow: 0 1px 3px rgba(2, 132, 199, 0.1);">
                                    ${secLabel}
                                </div>
                                <span style="font-weight: 600; color: #1e293b;">${idDisplay}</span>
                            </td>`;

                            tbodyHtml += `<td style="vertical-align: middle; text-align: center; font-weight: 700;">${total}</td>`;

                            tbodyHtml += '</tr>';
                        });
                    });

                    sl++;
                });

                if (sl === 1 || grandTotal === 0) return;

                const sText = shiftName === 'Morning Shift' ? 'সকাল' : (shiftName === 'Afternoon Shift' ? 'বিকাল' : shiftName);
                let shiftDisplay = '';
                if (langVal === 'en') shiftDisplay = 'Shift: ' + shiftName;
                else if (langVal === 'both') shiftDisplay = 'শিফট: ' + sText + ' (' + shiftName + ')';
                else shiftDisplay = 'শিফট: ' + sText;

                let bldgDisplay = '';
                if (langVal === 'en') bldgDisplay = 'Building : ' + buildingName;
                else if (langVal === 'both') bldgDisplay = 'বিল্ডিং / Building : ' + buildingName;
                else bldgDisplay = 'বিল্ডিং : ' + buildingName;

                let centerTitle = '<b>আসন বিন্যাস বিবরণী</b>';
                if (langVal === 'en') centerTitle = '<b>Seating Arrangement Details</b>';
                else if (langVal === 'both') centerTitle = '<b>আসন বিন্যাস বিবরণী / Details</b>';

                let grandTotalLabel = 'সর্বমোট পরীক্ষার্থী =';
                if (langVal === 'en') grandTotalLabel = 'Total Candidates =';
                else if (langVal === 'both') grandTotalLabel = 'সর্বমোট পরীক্ষার্থী / Total =';

                tbodyHtml += `
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 15px; font-weight: bold;">${grandTotalLabel}</td>
                        <td style="font-weight: bold;">${grandTotal}</td>
                    </tr>
                `;

                pagesHtml += `
                    <!-- Page Indicator Pill (Screen Preview Only) -->
                    <div class="no-print" style="margin-top: 30px; margin-bottom: 12px; font-weight: 800; font-size: 0.95rem; color: #0284c7; background: #e0f2fe; padding: 6px 20px; border-radius: 20px; border: 1.5px solid #7dd3fc; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15); display: inline-flex; align-items: center; gap: 8px;">
                        <span>📄 পৃষ্ঠা ${pageIdx} (${buildingName} - ${sText} শিফট)</span>
                    </div>

                    <div class="a4-page" style="margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.18); border: 1px solid #cbd5e1;">
                        <div class="details-container" style="position: relative;">
                            <!-- Website Logo Badge -->
                            <div class="header-logo-badge" style="position: absolute; left: 15px; top: calc(12px - 0.1in); width: 62px; height: 62px; background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 33px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); border: 2.5px solid #0284c7; z-index: 5;">
                                ${logoHtml}
                            </div>

                            <!-- School Header Title (Centered to the right of logo) -->
                            <div class="header-titles-wrapper" style="padding-left: 72px; text-align: center; margin-bottom: 4px;">
                                <div class="school-name">${schoolName}</div>
                                <div class="exam-name">${activeExamName}</div>
                            </div>

                            <!-- Full Page Margin Dashed Line Divider -->
                            <div class="header-dashed-divider" style="width: 100%; border-bottom: 2px dashed #000000; margin-top: 4px; margin-bottom: 12px;"></div>

                            <!-- Header Info Line (Full Page Margin Centered) -->
                            <div class="header-line-3">
                                <div class="header-col-left">${shiftDisplay}</div>
                                <div class="header-col-center">${centerTitle}</div>
                                <div class="header-col-right">${bldgDisplay}</div>
                            </div>

                            <!-- Summary Table for Shift & Building -->
                            <table class="summary-table">
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="col-head-sl">${langVal === 'en' ? 'SL' : 'SL'}</th>
                                        <th rowspan="2" class="col-head-room">${langVal === 'en' ? 'Room No' : (langVal === 'both' ? 'রুম নং / Room' : 'রুম নং')}</th>
                                        <th rowspan="2" class="col-head-class">${langVal === 'en' ? 'Class' : (langVal === 'both' ? 'শ্রেণি / Class' : 'শ্রেণি')}</th>
                                        <th rowspan="2" class="col-head-rollrange">${langVal === 'en' ? 'Student ID' : (langVal === 'both' ? 'শিক্ষার্থীর আইডি / Student ID' : 'শিক্ষার্থীর আইডি')}</th>
                                        <th rowspan="2" class="col-head-total">${langVal === 'en' ? 'Total' : (langVal === 'both' ? 'মোট / Total' : 'মোট')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tbodyHtml}
                                </tbody>
                            </table>

                            <!-- Signatures Section -->
                            <div class="footer-signatures" style="display: none;">
                                <div class="sig-col">
                                    <div class="sig-line"></div>
                                    <span class="sig-title-1">কক্ষ পরিদর্শক</span>
                                </div>
                                <div class="sig-col">
                                    <div class="sig-line"></div>
                                    <span class="sig-title-2">প্রস্তুতকারী</span>
                                </div>
                                <div class="sig-col">
                                    <div class="sig-line"></div>
                                    <span class="sig-title-3">প্রধান শিক্ষক / পরীক্ষা নিয়ন্ত্রক</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                pageIdx++;
            });

            pagesContainer.innerHTML = pagesHtml;

            const currentFontSize = document.getElementById('font-size-slider')?.value;
            if (currentFontSize) {
                updateSeatingDetailsFontSize(currentFontSize);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {

            populateClassFilter();

            populateExamFilter();

            populateShiftFilter();

            updateSeatingDetailsLive();

        });



        function refreshSeatingDetailsData() {

            populateClassFilter();

            populateExamFilter();

            populateShiftFilter();

            updateSeatingDetailsLive();

        }

        window.addEventListener('storage', refreshSeatingDetailsData);

        window.addEventListener('dbSynced', refreshSeatingDetailsData);

        updateSeatingDetailsLive();



        async function downloadSeatingDetailsPDF() {

            const container = document.getElementById('pages-container');

            const pages = container ? container.querySelectorAll('.a4-page') : [];

            if (!container || pages.length === 0) {

                alert('ডাউনলোড করার মতো কোনো তথ্য পাওয়া যায়নি!');

                return;

            }



            if (document.fonts && document.fonts.ready) {

                try {

                    await document.fonts.ready;

                } catch (e) { }

            }



            const examVal = document.getElementById('filter-exam')?.value || 'all';

            const classVal = document.getElementById('filter-class')?.value || 'all';

            const safeExamName = (examVal === 'all' ? 'Seating_Details' : examVal).replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_');

            const safeClassName = (classVal === 'all' ? 'All_Classes' : classVal).replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_');

            const fileName = `Seating_Details_${safeClassName}_${safeExamName}.pdf`;



            const btn = document.getElementById('btn-download-pdf');

            const originalBtnText = btn ? btn.innerHTML : '';

            if (btn) {

                btn.innerHTML = '⏳ পিডিএফ প্রস্তুত হচ্ছে...';

                btn.disabled = true;

            }



            try {

                const JsPDFConstructor = window.jspdf?.jsPDF || window.jsPDF;



                if (JsPDFConstructor && typeof html2canvas !== 'undefined') {

                    const pdf = new JsPDFConstructor({

                        orientation: 'portrait',

                        unit: 'mm',

                        format: 'a4',

                        compress: true

                    });



                    for (let i = 0; i < pages.length; i++) {

                        if (btn) {

                            btn.innerHTML = `⏳ পাতা ${i + 1}/${pages.length} তৈরি হচ্ছে...`;

                        }

                        const pageEl = pages[i];



                        const originalBoxShadow = pageEl.style.boxShadow;

                        const originalBorder = pageEl.style.border;

                        const originalMargin = pageEl.style.marginBottom;



                        pageEl.style.boxShadow = 'none';

                        pageEl.style.border = 'none';

                        pageEl.style.marginBottom = '0';



                        const canvas = await html2canvas(pageEl, {

                            scale: 2,

                            useCORS: true,

                            allowTaint: true,

                            logging: false,

                            backgroundColor: '#ffffff',

                            scrollX: 0,

                            scrollY: 0

                        });



                        pageEl.style.boxShadow = originalBoxShadow;

                        pageEl.style.border = originalBorder;

                        pageEl.style.marginBottom = originalMargin;



                        const imgData = canvas.toDataURL('image/jpeg', 0.95);

                        if (i > 0) {

                            pdf.addPage('a4', 'portrait');

                        }

                        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

                    }



                    pdf.save(fileName);

                    if (btn) {

                        btn.innerHTML = originalBtnText;

                        btn.disabled = false;

                    }

                    return;

                }



                if (typeof html2pdf !== 'undefined') {

                    const opt = {

                        margin: 0,

                        filename: fileName,

                        image: { type: 'jpeg', quality: 0.98 },

                        html2canvas: {

                            scale: 2,

                            useCORS: true,

                            allowTaint: true,

                            logging: false,

                            backgroundColor: '#ffffff'

                        },

                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },

                        pagebreak: { mode: ['css', 'legacy'] }

                    };



                    await html2pdf().set(opt).from(container).save();

                    if (btn) {

                        btn.innerHTML = originalBtnText;

                        btn.disabled = false;

                    }

                    return;

                }



                throw new Error('PDF Engine not loaded');

            } catch (err) {

                console.error('PDF Generation Error:', err);

                if (btn) {

                    btn.innerHTML = originalBtnText;

                    btn.disabled = false;

                }

                alert('সরাসরি ব্রাউজার প্রিন্ট ডায়ালগ থেকে "Destination: Save as PDF" সিলেক্ট করে সংরক্ষণ করতে পারেন।');

                window.print();

            }

        }



        window.downloadSeatingDetailsPDF = downloadSeatingDetailsPDF;

        window.downloadAdmitCardPDF = downloadSeatingDetailsPDF;

    
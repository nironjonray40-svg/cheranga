
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



        function formatClassName(cls) {

            if (!cls) return '';

            const c = String(cls).trim();

            const map = {

                'play': 'প্লে (PLAY)',

                'nursery': 'নার্সারি (NURSERY)',

                'kg': 'কেজি (KG)',

                'one': 'প্রথম (ONE)',

                '1': 'প্রথম (ONE)',

                'two': 'দ্বিতীয় (TWO)',

                '2': 'দ্বিতীয় (TWO)',

                'three': 'তৃতীয় (THREE)',

                '3': 'তৃতীয় (THREE)',

                'four': 'চতুর্থ (FOUR)',

                '4': 'চতুর্থ (FOUR)',

                'five': 'পঞ্চম (FIVE)',

                '5': 'পঞ্চম (FIVE)',

                'six': 'ষষ্ঠ (SIX)',

                '6': 'ষষ্ঠ (SIX)',

                'seven': 'সপ্তম (SEVEN)',

                '7': 'সপ্তম (SEVEN)',

                'eight': 'অষ্টম (EIGHT)',

                '8': 'অষ্টম (EIGHT)',

                'nine': 'নবম (NINE)',

                '9': 'নবম (NINE)',

                'ten': 'দশম (TEN)',

                '10': 'দশম (TEN)'

            };

            const key = c.toLowerCase().replace(/^class\s*/i, '');

            return map[key] || c;

        }



        function formatClassShort(cls) {

            if (!cls) return '';

            const c = String(cls).trim();

            const map = {

                'play': 'প্লে',

                'nursery': 'নার্সারি',

                'kg': 'কেজি',

                'one': 'প্রথম',

                '1': 'প্রথম',

                'two': 'দ্বিতীয়',

                '2': 'দ্বিতীয়',

                'three': 'তৃতীয়',

                '3': 'তৃতীয়',

                'four': 'চতুর্থ',

                '4': 'চতুর্থ',

                'five': 'পঞ্চম',

                '5': 'পঞ্চম',

                'six': 'ষষ্ঠ',

                '6': 'ষষ্ঠ',

                'seven': 'সপ্তম',

                '7': 'সপ্তম',

                'eight': 'অষ্টম',

                '8': 'অষ্টম',

                'nine': 'নবম',

                '9': 'নবম',

                'ten': 'দশম',

                '10': 'দশম'

            };

            const key = c.toLowerCase().replace(/^class\s*/i, '');

            return map[key] || c;

        }



                function formatRoomTopshetSectionBn(sec) {
            if (!sec) return 'ক';
            const s = String(sec).trim();
            if (!s) return 'ক';

            const lower = s.toLowerCase();
            const letterMap = {
                'a': 'ক', 'b': 'খ', 'c': 'গ', 'd': 'ঘ', 'e': 'ঙ',
                'f': 'চ', 'g': 'ছ', 'h': 'জ', 'i': 'ঝ', 'j': 'ঞ'
            };
            if (letterMap[lower]) return letterMap[lower];

            const nameMap = {
                'sec-a': 'ক', 'sec a': 'ক', 'section a': 'ক',
                'sec-b': 'খ', 'sec b': 'খ', 'section b': 'খ',
                'sec-c': 'গ', 'sec c': 'গ', 'section c': 'গ',
                'sec-d': 'ঘ', 'sec d': 'ঘ', 'section d': 'ঘ',
                'science': 'বিজ্ঞান', 'humanities': 'মানবিক', 'arts': 'মানবিক',
                'commerce': 'ব্যবসায় শিক্ষা', 'business': 'ব্যবসায় শিক্ষা', 'business studies': 'ব্যবসায় শিক্ষা',
                'general': 'সাধারণ', 'vocational': 'ভোকেশনাল',
                'padma': 'পদ্মা', 'meghna': 'মেঘনা', 'jamuna': 'যমুনা', 'surma': 'সুরমা',
                'karnafuli': 'কর্ণফুলী', 'karnaphuli': 'কর্ণফুলী', 'tista': 'তিস্তা', 'teesta': 'তিস্তা',
                'rupsha': 'রূপসা', 'rupson': 'রূপসা',
                'rose': 'গোলাপ', 'golap': 'গোলাপ', 'beli': 'বেলী', 'belly': 'বেলী',
                'jaba': 'জবা', 'shapla': 'শাপলা', 'chameli': 'চামেলী', 'tagar': 'টগর',
                'hasnahena': 'হাসনাহেনা', 'bakul': 'বকুল', 'kadam': 'কদম',
                'sunflower': 'সূর্যমুখী', 'surjamukhi': 'সূর্যমুখী',
                'morning': 'প্রভাতি', 'prabhati': 'প্রভাতি', 'day': 'দিবা', 'diba': 'দিবা',
                'boys': 'বালক', 'girls': 'বালিকা'
            };
            if (nameMap[lower]) return nameMap[lower];

            if (/[\u0980-\u09FF]/.test(s)) {
                return s;
            }

            const cleanSec = lower.replace(/^(section|sec|শাখা)\s*[-:]?\s*/i, '').trim();
            if (letterMap[cleanSec]) return letterMap[cleanSec];
            if (nameMap[cleanSec]) return nameMap[cleanSec];

            return s;
        }

        function formatShiftLabel(shift) {

            if (!shift) return 'সকাল (ছাত্র শাখা)';

            const s = String(shift).trim();

            if (/morning|sokal|সকাল|প্রভাতি/i.test(s)) {

                return 'সকাল (ছাত্র শাখা)';

            }

            if (/afternoon|bikal|বিকাল|দিবা/i.test(s)) {

                return 'বিকাল (ছাত্রী শাখা)';

            }

            return s;

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



            const targetVariants = map[selC] || [selC];

            return targetVariants.some(v => stC.includes(v));

        }



        function isShiftMatch(shiftName, selectedShift) {

            if (!selectedShift || selectedShift === 'all') return true;

            if (!shiftName) return false;

            const s1 = String(shiftName).toLowerCase().trim();

            const s2 = String(selectedShift).toLowerCase().trim();



            if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) return true;



            const isMorning1 = /morning|sokal|সকাল|প্রভাতি/i.test(s1);

            const isMorning2 = /morning|sokal|সকাল|প্রভাতি/i.test(s2);

            if (isMorning1 && isMorning2) return true;



            const isAfternoon1 = /afternoon|bikal|বিকাল|দিবা/i.test(s1);

            const isAfternoon2 = /afternoon|bikal|বিকাল|দিবা/i.test(s2);

            if (isAfternoon1 && isAfternoon2) return true;



            return false;

        }



        function populateClassFilter() {

            const classSelect = document.getElementById('filter-class');

            if (!classSelect) return;

            const currentSelected = classSelect.value || 'all';

            classSelect.innerHTML = '<option value="all">All Classes</option>';



            let classesList = [];

            try {

                classesList = JSON.parse(localStorage.getItem('school_classes') || '[]');

            } catch (e) {}



            if (classesList.length === 0) {

                classesList = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

            }



            classesList.forEach(cls => {

                const opt = document.createElement('option');

                opt.value = cls;

                opt.innerText = formatClassName(cls);

                classSelect.appendChild(opt);

            });



            if (currentSelected && [...classSelect.options].some(o => o.value === currentSelected)) {

                classSelect.value = currentSelected;

            }

        }



        function populateExamFilter() {

            const examSelect = document.getElementById('filter-exam');

            if (!examSelect) return;

            const currentSelected = examSelect.value || 'all';

            examSelect.innerHTML = '<option value="all">সকল পরীক্ষা (All Exams / Routine Title)</option>';



            const examSet = new Set();

            examSet.add('বার্ষিক পরীক্ষা - ২০২৬');

            examSet.add('অর্ধ-বার্ষিক পরীক্ষা - ২০২৬');

            examSet.add('প্রাক-নির্বাচনী পরীক্ষা - ২০২৬');

            examSet.add('নির্বাচনী পরীক্ষা - ২০২৬');



            try {

                const store = safeJsonParse('school_seat_plans_store', {});

                const routines = safeJsonParse('school_exam_routines', []);

                const examTypes = safeJsonParse('school_exam_types', []);



                if (store && typeof store === 'object') {

                    Object.values(store).forEach(plan => {

                        if (plan && plan.examName && plan.examName.trim() && plan.examName !== 'All') {

                            examSet.add(plan.examName.trim());

                        }

                    });

                }



                if (Array.isArray(routines)) {

                    routines.forEach(r => {

                        if (r && r.examName && r.examName.trim()) {

                            examSet.add(r.examName.trim());

                        }

                    });

                }



                if (Array.isArray(examTypes)) {

                    examTypes.forEach(t => {

                        if (t && t.name && t.name.trim()) {

                            examSet.add(t.name.trim());

                        }

                    });

                }

            } catch (e) {}



            examSet.forEach(exam => {

                const opt = document.createElement('option');

                opt.value = exam;

                opt.innerText = exam;

                examSelect.appendChild(opt);

            });



            if (currentSelected && [...examSelect.options].some(o => o.value === currentSelected)) {

                examSelect.value = currentSelected;

            }

        }



        function populateShiftFilter() {

            const shiftSelect = document.getElementById('filter-shift');

            if (!shiftSelect) return;

            const currentSelected = shiftSelect.value || 'all';

            shiftSelect.innerHTML = '<option value="all">All Shifts</option>';



            const shiftsSet = new Set();

            shiftsSet.add('Morning Shift');

            shiftsSet.add('Afternoon Shift');



            try {

                const shiftTimes = safeJsonParse('school_shift_times', []);

                if (Array.isArray(shiftTimes)) {

                    shiftTimes.forEach(st => {

                        if (st && st.shift && st.shift.trim()) shiftsSet.add(st.shift.trim());

                    });

                }



                const store = safeJsonParse('school_seat_plans_store', {});

                if (store && typeof store === 'object') {

                    Object.values(store).forEach(plan => {

                        if (plan && plan.shift && plan.shift.trim()) shiftsSet.add(plan.shift.trim());

                    });

                }

            } catch (e) {}



            shiftsSet.forEach(shift => {

                const opt = document.createElement('option');

                opt.value = shift;

                opt.innerText = formatShiftLabel(shift);

                shiftSelect.appendChild(opt);

            });



            if (currentSelected && [...shiftSelect.options].some(o => o.value === currentSelected)) {

                shiftSelect.value = currentSelected;

            }

        }



        function updateRoomTopshetFontSize(val) {

            const valSpan = document.getElementById('font-size-val');

            if (valSpan) valSpan.innerText = val + 'px';



            const numVal = parseFloat(val) || 14;

            const scaleRatio = numVal / 14;



            const tableTd = document.querySelectorAll('.class-table td');

            tableTd.forEach(el => {

                el.style.fontSize = (11.5 * scaleRatio).toFixed(1) + 'pt';

            });



            const tableTh = document.querySelectorAll('.class-table th');

            tableTh.forEach(el => {

                el.style.fontSize = (12.1 * scaleRatio).toFixed(1) + 'pt';

            });



            const schoolName = document.querySelectorAll('.school-name');

            schoolName.forEach(el => {

                el.style.fontSize = (22 * scaleRatio).toFixed(1) + 'pt';

            });

        }



        
        function getRoomTopshetStaffList() {
            try {
                return JSON.parse(localStorage.getItem('school_staff') || '[]');
            } catch (e) {
                return [];
            }
        }

        function getRoomTopshetHeadmasterSignature(deptOrClass) {
            if (typeof getHeadmasterByDepartment === 'function') {
                const hm = getHeadmasterByDepartment(deptOrClass);
                if (hm) {
                    const sig = hm.signature || hm.signatureUrl || hm.signatureData || hm.sign || hm.signatureImage;
                    if (sig) return sig;
                }
            }

            const staffList = getRoomTopshetStaffList();
            const checkIsHm = (s) => {
                if (!s) return false;
                const des = String(s.designation || s.designationBn || s.post || '').toLowerCase();
                if (des.includes('সহকারী') || des.includes('সহ:') || des.includes('উপাধ্যক্ষ') || des.includes('assistant') || des.includes('asst') || des.includes('vice') || des.includes('deputy')) {
                    return false;
                }
                return des.includes('প্রধান শিক্ষক') || des.includes('প্রধান শিক্ষিকা') || des.includes('headmaster') || des.includes('head master') || des.includes('headteacher') || des.includes('head teacher') || des.includes('principal') || des.includes('অধ্যক্ষ') || des.includes('সুপারিনটেনডেন্ট') || des.includes('superintendent');
            };

            const hm = staffList.find(checkIsHm);
            if (hm) {
                const sig = hm.signature || hm.signatureUrl || hm.signatureData || hm.sign || hm.signatureImage;
                if (sig) return sig;
            }

            const settings = safeJsonParse('school_settings', {});
            return settings?.headmasterSignature || '';
        }

        function getRoomTopshetPreparerSignature() {
            const staffList = getRoomTopshetStaffList();

            const checkIsPreparer = (s) => {
                if (!s) return false;
                const des = String(s.designation || s.designationBn || s.post || '').toLowerCase();
                return des.includes('কম্পিউটার অপারেটর') || des.includes('অপারেটর') || des.includes('প্রস্তুতকারী') || des.includes('অফিস সহকারী') || des.includes('ডাটা এন্ট্রি') || des.includes('হিসাব রক্ষক') || des.includes('সহকারী শিক্ষক') || des.includes('সহ: শিক্ষক') || des.includes('operator') || des.includes('clerk') || des.includes('accountant') || des.includes('assistant teacher');
            };

            // 1. Check logged-in user if they match a staff member
            const currentUserId = localStorage.getItem('school_user_id') || localStorage.getItem('school_user_name') || '';
            if (currentUserId) {
                const loggedStaff = staffList.find(s => s && (s.id === currentUserId || s.name === currentUserId || s.nameBn === currentUserId || s.mobile === currentUserId || s.phone === currentUserId));
                if (loggedStaff) {
                    const sig = loggedStaff.signature || loggedStaff.signatureUrl || loggedStaff.signatureData || loggedStaff.sign || loggedStaff.signatureImage;
                    if (sig) return sig;
                }
            }

            // 2. Find staff with preparer/operator designation having signature
            const prepWithSig = staffList.find(s => checkIsPreparer(s) && (s.signature || s.signatureUrl || s.signatureData || s.sign || s.signatureImage));
            if (prepWithSig) {
                return prepWithSig.signature || prepWithSig.signatureUrl || prepWithSig.signatureData || prepWithSig.sign || prepWithSig.signatureImage;
            }

            // 3. Fallback: Any non-headmaster staff member with signature
            const checkIsHm = (s) => {
                if (!s) return false;
                const des = String(s.designation || s.designationBn || s.post || '').toLowerCase();
                return des.includes('প্রধান শিক্ষক') || des.includes('প্রধান শিক্ষিকা') || des.includes('headmaster') || des.includes('head master') || des.includes('principal') || des.includes('অধ্যক্ষ');
            };

            const anyOtherWithSig = staffList.find(s => !checkIsHm(s) && (s.signature || s.signatureUrl || s.signatureData || s.sign || s.signatureImage));
            if (anyOtherWithSig) {
                return anyOtherWithSig.signature || anyOtherWithSig.signatureUrl || anyOtherWithSig.signatureData || anyOtherWithSig.sign || anyOtherWithSig.signatureImage;
            }

            const settings = safeJsonParse('school_settings', {});
            return settings?.preparerSignature || settings?.operatorSignature || '';
        }

        function updateRoomTopshetLive() {

            const settings = safeJsonParse('school_settings', null);

            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);

            const store = safeJsonParse('school_seat_plans_store', {});



            const classVal = document.getElementById('filter-class')?.value || 'all';

            const examVal = document.getElementById('filter-exam')?.value || 'all';

            const shiftVal = document.getElementById('filter-shift')?.value || 'all';

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

                                if (!itemCopy.examName && plan.examName) itemCopy.examName = plan.examName;

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



            // Fallback Sample Data if no stored seat plans exist anywhere

            if (allocList.length === 0 && examVal === 'all' && !planFoundForExam && (!savedAlloc || Object.keys(savedAlloc).length === 0)) {

                allocList = [

                    {

                        rId: '401',

                        item: {

                            room: { number: '৪০১' },

                            building: { name: 'একাডেমিক ভবন-ক' },

                            shift: 'Morning Shift',

                            examName: 'বার্ষিক পরীক্ষা - ২০২৬',

                            benches: [

                                ...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'ক', studentId: '26070' + String(i + 1).padStart(2, '0') } })),

                                ...Array(4).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'ক', studentId: '26060' + String(i + 1).padStart(2, '0') } })),

                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'দশম (TEN)', section: 'বিজ্ঞান', studentId: '26080' + String(i + 1).padStart(2, '0') } }))

                            ]

                        }

                    },

                    {

                        rId: '201',

                        item: {

                            room: { number: '২০১' },

                            building: { name: 'একাডেমিক ভবন-ক' },

                            shift: 'Morning Shift',

                            examName: 'বার্ষিক পরীক্ষা - ২০২৬',

                            benches: [

                                ...Array(15).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', section: 'খ', studentId: '26071' + String(i + 1).padStart(2, '0') } })),

                                ...Array(15).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', section: 'খ', studentId: '26061' + String(i + 1).padStart(2, '0') } }))

                            ]

                        }

                    }

                ];

            }



            const pagesContainer = document.getElementById('pages-container');

            if (!pagesContainer) return;



            if (allocList.length === 0) {

                const noDataMsg = (examVal !== 'all' && !planFoundForExam)

                    ? `উক্ত পরীক্ষা (${examVal}) এর জন্য কোন সংরক্ষিত সিটপ্ল্যান পাওয়া যায়নি (No saved seat plan data found).`

                    : `কোন তথ্য পাওয়া যায়নি (No matching room seat plan data found).`;



                pagesContainer.innerHTML = `

                    <div style="background:#fff; padding:35px 20px; margin-top:25px; border-radius:10px; text-align:center; font-weight:700; color:#ef4444; font-size:1.1rem; box-shadow:0 4px 15px rgba(0,0,0,0.08); border: 1.5px solid #fca5a5; max-width:600px;">

                        ⚠️ ${noDataMsg}

                    </div>`;

                return;

            }



            const schoolName = settings?.schoolName || 'আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়';

            const defaultExamName = settings?.examName || 'বার্ষিক পরীক্ষা - ২০২৬';



            let filteredAllocList = allocList.filter(({ rId, item }) => {

                if (!item || !item.benches) return false;



                const sName = item.shift || 'Morning Shift';

                if (!isShiftMatch(sName, shiftVal)) return false;



                const roomNo = String(item.room?.number || item.room?.name || rId).toLowerCase();

                const bldgName = String(item.building?.name || '').toLowerCase();



                if (searchVal) {

                    const matchRoom = roomNo.includes(searchVal);

                    const matchBldg = bldgName.includes(searchVal);

                    const matchShift = sName.toLowerCase().includes(searchVal);



                    let matchStudent = false;

                    item.benches.forEach(b => {

                        [b.left, b.right].forEach(st => {

                            if (st) {

                                const idStr = String(st.studentId || st.id || st.roll || '').toLowerCase();

                                const clsStr = String(st.class || '').toLowerCase();

                                if (idStr.includes(searchVal) || clsStr.includes(searchVal)) matchStudent = true;

                            }

                        });

                    });



                    if (!matchRoom && !matchBldg && !matchShift && !matchStudent) return false;

                }



                return true;

            });



            if (filteredAllocList.length === 0) {

                pagesContainer.innerHTML = `

                    <div style="background:#fff; padding:35px 20px; margin-top:25px; border-radius:10px; text-align:center; font-weight:700; color:#ef4444; font-size:1.1rem; box-shadow:0 4px 15px rgba(0,0,0,0.08); border: 1.5px solid #fca5a5; max-width:600px;">

                        ⚠️ ফিল্টারকৃত শর্তে কোনো রুমের সিটপ্ল্যান পাওয়া যায়নি।

                    </div>`;

                return;

            }



            let pagesHtml = '';

            let roomIdx = 1;

            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.86in; max-height: 0.86in; max-width: 245px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.86in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.86in; max-height: 0.86in; max-width: 245px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.86in;"></div>`;



            filteredAllocList.forEach(({ rId, item }) => {

                const roomNo = item.room ? (item.room.number || item.room.name || rId) : rId;

                const buildingName = (item.building && item.building.name && item.building.name.trim()) ? item.building.name.trim() : 'একাডেমিক ভবন-ক';

                const activeExamName = (examVal !== 'all') ? examVal : (item.examName || defaultExamName);

                const shiftName = item.shift || 'Morning Shift';



                // Group students by Class

                const classGroup = {};

                item.benches.forEach(b => {

                    [b.left, b.right].forEach(st => {

                        if (st) {

                            const c = st.class || 'Unassigned';

                            if (!isClassMatch(c, classVal)) return;

                            if (!classGroup[c]) classGroup[c] = [];

                            classGroup[c].push(st);

                        }

                    });

                });



                const classes = Object.keys(classGroup);

                if (classes.length === 0) return;



                // Sort classes nicely

                classes.sort((a, b) => {

                    const order = ['play', 'nursery', 'kg', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

                    const getRank = c => {

                        const lc = String(c).toLowerCase();

                        const idx = order.findIndex(o => lc.includes(o));

                        return idx !== -1 ? idx : 99;

                    };

                    return getRank(a) - getRank(b);

                });



                // Generate Header Classes text e.g. "শ্রেণি: ষষ্ঠ, অষ্টম ও দশম"

                const classShortNames = classes.map(c => formatClassShort(c));

                let classHeaderStr = '';

                if (classShortNames.length === 1) {

                    classHeaderStr = classShortNames[0];

                } else if (classShortNames.length === 2) {

                    classHeaderStr = classShortNames.join(' ও ');

                } else if (classShortNames.length > 2) {

                    const last = classShortNames.pop();

                    classHeaderStr = classShortNames.join(', ') + ' ও ' + last;

                }



                // Calculate counts & summary

                let roomTotalCandidates = 0;

                let summaryParts = [];

                summaryParts.push(`শিফট: ${formatShiftLabel(shiftName)}`);



                classes.forEach(cls => {

                    const count = classGroup[cls].length;

                    roomTotalCandidates += count;

                    summaryParts.push(`${formatClassShort(cls)} শ্রেণি: ${count} জন`);

                });

                summaryParts.push(`মোট পরীক্ষার্থী: ${roomTotalCandidates} জন`);



                const summaryText = summaryParts.join(' &nbsp;|&nbsp; ');



                // Sort students inside each class group
                classes.forEach(cls => {
                    classGroup[cls].sort((a, b) => {
                        const idA = String(a.studentId || a.id || a.roll || '');
                        const idB = String(b.studentId || b.id || b.roll || '');
                        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                    });
                });

                // Paginate if student count exceeds single page height
                const maxRowsInRoom = Math.max(...classes.map(cls => classGroup[cls].length));
                const ROWS_PER_PAGE = 15;
                const totalRoomPages = Math.ceil(maxRowsInRoom / ROWS_PER_PAGE) || 1;

                for (let pageNum = 1; pageNum <= totalRoomPages; pageNum++) {
                    const startRow = (pageNum - 1) * ROWS_PER_PAGE;
                    const endRow = startRow + ROWS_PER_PAGE;

                    // Build Class Tables HTML for this page
                    let tablesHtml = '';
                    classes.forEach((cls, idx) => {
                        const fullList = classGroup[cls];
                        const pageSlice = fullList.slice(startRow, endRow);
                        if (pageSlice.length === 0 && fullList.length > 0 && pageNum > 1) {
                            return;
                        }

                        const borderClass = `class-border-${idx % 6}`;

                        let rowsHtml = '';
                        pageSlice.forEach(st => {
                            const liveResolved = resolveAttendanceLiveStudent(st);
                            const studentId = liveResolved.studentId || "-";
                            let secName = (st.section || st.sec || st.sectionName || '').trim();
                            if (!secName) {
                                const idKey = String(st.studentId || st.id || '').trim();
                                if (idKey && studentSectionMap[idKey]) {
                                    secName = studentSectionMap[idKey];
                                } else if (st.class && st.roll) {
                                    const comboKey = `${String(st.class).trim().toLowerCase()}___${String(st.roll).trim()}`;
                                    if (studentSectionMap[comboKey]) {
                                        secName = studentSectionMap[comboKey];
                                    }
                                }
                            }
                            const secDisplay = formatRoomTopshetSectionBn(secName);

                            rowsHtml += `<tr><td>${studentId}</td><td>${secDisplay}</td></tr>`;
                        });

                        tablesHtml += `
                            <div class="class-table-container">
                                <table class="class-table ${borderClass}">
                                    <thead>
                                        <tr>
                                            <th colspan="2">${formatClassName(cls)}</th>
                                        </tr>
                                        <tr class="sub-header-row">
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শিক্ষার্থীর আইডি</th>
                                            <th style="font-size: 10.5pt; font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e0; padding: 4px 4px;">শাখা</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rowsHtml}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    });

                    const pageIndicatorText = (totalRoomPages > 1)
                        ? `📋 রুম টপশীট #${roomIdx} (পৃষ্ঠা ${pageNum}/${totalRoomPages}): রুম নং ${roomNo} (${buildingName})`
                        : `📋 রুম টপশীট #${roomIdx}: রুম নং ${roomNo} (${buildingName})`;

                    const pageHeaderRoomStr = (totalRoomPages > 1)
                        ? `রুম নং: ${roomNo} (পৃষ্ঠা ${pageNum}/${totalRoomPages})`
                        : `রুম নং: ${roomNo}`;

                    pagesHtml += `
                        <!-- Page Indicator Pill (Screen Preview Only) -->
                        <div class="no-print" style="margin-top: 15px; margin-bottom: 8px; font-weight: 800; font-size: 0.92rem; color: #6d28d9; background: #f3e8ff; padding: 5px 18px; border-radius: 20px; border: 1.5px solid #d8b4fe; box-shadow: 0 2px 6px rgba(109, 40, 217, 0.12); display: inline-flex; align-items: center; gap: 8px;">
                            <span>${pageIndicatorText}</span>
                        </div>

                        <!-- A4 Paper Preview Sheet for Room -->
                        <div class="a4-page">
                            <div class="container">
                                <div>
                                    <!-- Line 1: School Name -->
                                    <div class="school-name">${schoolName}</div>

                                    <!-- Line 2: Exam Name -->
                                    <div class="exam-name">${activeExamName}</div>

                                    <!-- Building Name -->
                                    <div class="building-name">বিল্ডিং : ${buildingName}</div>

                                    <!-- Line 3: Header Line -->
                                    <div class="header-line-3">
                                        <div class="header-col-left">${pageHeaderRoomStr}</div>
                                        <div class="header-col-center">আসন বিন্যাস</div>
                                        <div class="header-col-right">শ্রেণি: ${classHeaderStr}</div>
                                    </div>

                                    <!-- Room Summary Info -->
                                    <div class="summary-info">
                                        ${summaryText}
                                    </div>

                                    <!-- Separate Tables for Each Class -->
                                    <div class="tables-wrapper" style="margin-bottom: 3.50in;">
                                        ${tablesHtml}
                                    </div>
                                </div>

                                <!-- Footer Signatures Section -->
                                <div class="footer-signatures" style="margin-top: 0.5in; margin-bottom: 0.5in;">
                                    <div class="sig-col" style="display: none !important;">
                                        <div style="height: 0.86in;"></div>
                                        <div class="sig-line"></div>
                                        কক্ষ পরিদর্শক
                                    </div>
                                    <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                        <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                            ${prepSigImg}
                                        </div>
                                        <div class="sig-line" style="display: none !important;"></div>
                                        <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রস্তুতকারী</div>
                                    </div>
                                    <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                        <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                            ${hmSigImg}
                                        </div>
                                        <div class="sig-line" style="display: none !important;"></div>
                                        <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রধান শিক্ষক</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }



                roomIdx++;

            });



            pagesContainer.innerHTML = pagesHtml;



            const currentFontSize = document.getElementById('font-size-slider')?.value;

            if (currentFontSize) {

                updateRoomTopshetFontSize(currentFontSize);

            }

        }



        document.addEventListener('DOMContentLoaded', () => {

            populateClassFilter();

            populateExamFilter();

            populateShiftFilter();

            updateRoomTopshetLive();

        });



        function refreshRoomTopshetData() {

            populateClassFilter();

            populateExamFilter();

            populateShiftFilter();

            updateRoomTopshetLive();

        }

        window.addEventListener('storage', refreshRoomTopshetData);

        window.addEventListener('dbSynced', refreshRoomTopshetData);



        async function downloadRoomTopshetPDF() {

            const container = document.getElementById('pages-container');

            const pages = container ? container.querySelectorAll('.a4-page') : [];

            if (!container || pages.length === 0) {

                alert('ডাউনলোড করার মতো কোনো তথ্য পাওয়া যায়নি!');

                return;

            }



            if (document.fonts && document.fonts.ready) {

                try { await document.fonts.ready; } catch (e) { }

            }



            const examVal = document.getElementById('filter-exam')?.value || 'all';

            const classVal = document.getElementById('filter-class')?.value || 'all';

            const safeExamName = (examVal === 'all' ? 'Room_Seat_Topshet' : examVal).replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_');

            const safeClassName = (classVal === 'all' ? 'All_Classes' : classVal).replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_');

            const fileName = `Room_Seat_Topshet_${safeClassName}_${safeExamName}.pdf`;



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

                        const originalMargin = pageEl.style.marginBottom;



                        pageEl.style.boxShadow = 'none';

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



        window.downloadRoomTopshetPDF = downloadRoomTopshetPDF;

    


        function safeJsonParse(key, fallback = null) {

            try {

                const item = localStorage.getItem(key);

                return item ? JSON.parse(item) : fallback;

            } catch (e) {

                return fallback;

            }

        }



        function toBengaliNumerals(num) {

            if (num === null || num === undefined || num === '') return '-';

            const str = String(num);

            if (!/^\d+$/.test(str)) return str;

            const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

            return str.split('').map(d => bengaliDigits[parseInt(d)] || d).join('');

        }



        function formatClassName(cls) {

            if (!cls) return '';

            const c = String(cls).trim();

            const map = {

                'play': 'Play',

                'nursery': 'Nursery',

                'kg': 'KG',

                'one': 'One', '1': 'One',

                'two': 'Two', '2': 'Two',

                'three': 'Three', '3': 'Three',

                'four': 'Four', '4': 'Four',

                'five': 'Five', '5': 'Five',

                'six': 'Six', '6': 'Six',

                'seven': 'Seven', '7': 'Seven',

                'eight': 'Eight', '8': 'Eight',

                'nine': 'Nine', '9': 'Nine',

                'ten': 'Ten', '10': 'Ten'

            };

            const key = c.toLowerCase().replace(/^class\s*/i, '');

            return map[key] || c;

        }



        function formatShiftInfo(shiftName) {

            const s = String(shiftName || '').toLowerCase().trim();

            const shiftTimes = safeJsonParse('school_shift_times', []);

            

            if (Array.isArray(shiftTimes)) {

                const match = shiftTimes.find(t => 

                    (t.shift && t.shift.toLowerCase().trim() === s) ||

                    (t.shiftBn && t.shiftBn.toLowerCase().trim() === s)

                );

                if (match) {

                    const bnName = match.shiftBn || (s.includes('morning') || s.includes('sokal') ? 'সকাল' : 'বিকাল');

                    const timeStr = (match.startTime && match.endTime) ? `${match.startTime} - ${match.endTime}` : '';

                    return { name: bnName, time: timeStr, raw: shiftName };

                }

            }



            if (s.includes('morning') || s.includes('sokal') || s.includes('সকাল') || s.includes('প্রভাতি')) {

                return { name: 'সকাল', time: '10:00 AM - 12:30 PM', raw: 'Morning Shift' };

            }

            if (s.includes('afternoon') || s.includes('bikal') || s.includes('বিকাল') || s.includes('দিবা')) {

                return { name: 'বিকাল', time: '01:00 PM - 04:30 PM', raw: 'Afternoon Shift' };

            }



            return { name: shiftName || 'সকাল', time: '', raw: shiftName };

        }



        function updateFontSize(val) {

            const valSpan = document.getElementById('font-size-val');

            if (valSpan) valSpan.innerText = val + 'px';

            const container = document.getElementById('topsheet-render-container');

            if (container) container.style.fontSize = (parseFloat(val) / 14) + 'em';

        }



        function updateFontFamily(fontVal) {

            const container = document.getElementById('topsheet-render-container');

            if (container) {

                container.style.fontFamily = fontVal;

            }

            localStorage.setItem('topsheet_font_family', fontVal);

        }



        function initFontFamily() {

            const savedFont = localStorage.getItem('topsheet_font_family');

            const fontSelect = document.getElementById('filter-font-family');

            if (savedFont && fontSelect) {

                if ([...fontSelect.options].some(o => o.value === savedFont)) {

                    fontSelect.value = savedFont;

                }

            }

            const currentFont = fontSelect?.value || "'Noto Rashi Hebrew', 'Tiro Bangla', 'Kalpurush', serif";

            const container = document.getElementById('topsheet-render-container');

            if (container) {

                container.style.fontFamily = currentFont;

            }

        }



        function populateFilterDropdowns() {

            const examSelect = document.getElementById('filter-exam');

            const buildingSelect = document.getElementById('filter-building');

            const classSelect = document.getElementById('filter-class');



            const store = safeJsonParse('school_seat_plans_store', {});

            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);



            // Populate Exams

            if (examSelect) {

                const currentExam = examSelect.value || 'all';

                examSelect.innerHTML = '<option value="all">সকল সংরক্ষিত সিটপ্ল্যান (All Saved Seat Plans)</option>';

                const examSet = new Set();



                if (store && typeof store === 'object') {

                    Object.values(store).forEach(plan => {

                        if (plan && plan.examName && plan.examName.trim() && plan.examName !== 'All') {

                            examSet.add(plan.examName.trim());

                        }

                    });

                }



                examSet.forEach(ex => {

                    const opt = document.createElement('option');

                    opt.value = ex;

                    opt.innerText = ex;

                    examSelect.appendChild(opt);

                });



                if (currentExam && [...examSelect.options].some(o => o.value === currentExam)) {

                    examSelect.value = currentExam;

                }

            }



            // Populate Buildings

            if (buildingSelect) {

                const currentBuilding = buildingSelect.value || 'all';

                buildingSelect.innerHTML = '<option value="all">সকল বিল্ডিং (All Buildings)</option>';

                const bSet = new Set();



                const buildingsStore = safeJsonParse('school_buildings', []);

                if (Array.isArray(buildingsStore)) {

                    buildingsStore.forEach(b => {

                        if (b && b.name) bSet.add(b.name);

                    });

                }



                if (store && typeof store === 'object') {

                    Object.values(store).forEach(plan => {

                        if (plan && plan.allocations) {

                            Object.values(plan.allocations).forEach(item => {

                                const bName = item.building?.name || item.buildingName || item.building_name;

                                if (bName) bSet.add(bName);

                            });

                        }

                    });

                }



                bSet.forEach(b => {

                    const opt = document.createElement('option');

                    opt.value = b;

                    opt.innerText = b;

                    buildingSelect.appendChild(opt);

                });



                if (currentBuilding && [...buildingSelect.options].some(o => o.value === currentBuilding)) {

                    buildingSelect.value = currentBuilding;

                }

            }



            // Populate Classes

            if (classSelect) {

                const currentClass = classSelect.value || 'all';

                classSelect.innerHTML = '<option value="all">সকল শ্রেণি (All Classes)</option>';

                const classSet = new Set();



                const classesList = safeJsonParse('school_classes', ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"]);

                classesList.forEach(c => classSet.add(c));



                classSet.forEach(cls => {

                    const opt = document.createElement('option');

                    opt.value = cls;

                    opt.innerText = formatClassName(cls);

                    classSelect.appendChild(opt);

                });



                if (currentClass && [...classSelect.options].some(o => o.value === currentClass)) {

                    classSelect.value = currentClass;

                }

            }

        }



        function getRoomGenderSuffix(sData, roomNo) {

            if (!sData || !roomNo) return '';



            // 1. Check tracked room gender info from active allocations

            const rInfo = sData.roomGenders ? sData.roomGenders[roomNo] : null;

            if (rInfo) {

                // If both male and female students are allocated in the room

                if (rInfo.female > 0 && rInfo.male > 0) {

                    return ' (C)';

                }

                const attr = String(rInfo.roomGenderAttr || '').toLowerCase();

                if (attr.includes('both') || attr.includes('coed') || attr.includes('co-ed') || attr.includes('combined') || attr.includes('উভয়')) {

                    return ' (C)';

                }

                if (attr.includes('female') || attr.includes('girl') || attr.includes('ছাত্রী')) {

                    return ' (F)';

                }

                if (attr.includes('male') || attr.includes('boy') || attr.includes('ছাত্র')) {

                    return ' (M)';

                }

            }



            // 2. Check master school_rooms store in localStorage

            const schoolRooms = safeJsonParse('school_rooms', []);

            if (Array.isArray(schoolRooms)) {

                const cleanRNo = String(roomNo).replace(/\D/g, '');

                const found = schoolRooms.find(r => {

                    const rNumStr = String(r.number || r.id || '').replace(/\D/g, '');

                    return rNumStr && cleanRNo && rNumStr === cleanRNo;

                });

                if (found && found.gender) {

                    const gStr = String(found.gender).toLowerCase();

                    if (gStr.includes('both') || gStr.includes('coed') || gStr.includes('co-ed') || gStr.includes('combined') || gStr.includes('উভয়')) return ' (C)';

                    if (/female|girl|girls|ছাত্রী/i.test(gStr)) return ' (F)';

                    if (/male|boy|boys|ছাত্র/i.test(gStr) && !gStr.includes('female')) return ' (M)';

                }

            }



            // 3. Check fallback sample gender rooms lists

            if (sData.combinedRooms && Array.isArray(sData.combinedRooms)) {

                if (sData.combinedRooms.some(cr => String(cr).includes(String(roomNo)) || String(roomNo).includes(String(cr)))) {

                    return ' (C)';

                }

            }

            if (sData.femaleRooms && Array.isArray(sData.femaleRooms)) {

                if (sData.femaleRooms.some(fr => String(fr).includes(String(roomNo)) || String(roomNo).includes(String(fr)))) {

                    return ' (F)';

                }

            }

            if (sData.maleRooms && Array.isArray(sData.maleRooms)) {

                if (sData.maleRooms.some(mr => String(mr).includes(String(roomNo)) || String(roomNo).includes(String(mr)))) {

                    return ' (M)';

                }

            }



            return '';

        }



        function getSampleDataFallback() {

            return {

                'ভবন ক': {

                    'Morning Shift': {

                        shiftInfo: { name: 'সকাল', time: '10:00 AM - 12:30 PM' },

                        rooms: ['১০১', '১০২', '১০৩', '১০৪', '১০৫', '১০৬', '১০৭', '১০৮'],

                        femaleRooms: ['১০২', '১০৪', '১০৬'],

                        maleRooms: ['১০১', '১০৩', '১০৫'],

                        combinedRooms: ['১০৭', '১০৮'],

                        classesData: {

                            'Six': { '১০১': 4, '১০২': 3, '১০৩': 3, '১০৪': 4, '১০৫': 3, '১০৬': 3, '১০৭': 2, '১০৮': 2 },

                            'Eight': { '১০১': 3, '১০২': 4, '১০৩': 3, '১০৪': 3, '১০৫': 4, '১০৬': 3, '১০৭': 2, '১০৮': 2 },

                            'Ten': { '১০১': 3, '১০২': 3, '১০৩': 4, '১০৪': 3, '১০৫': 3, '১০৬': 4, '১০৭': 2, '১০৮': 2 }

                        }

                    },

                    'Afternoon Shift': {

                        shiftInfo: { name: 'বিকাল', time: '01:00 PM - 04:30 PM' },

                        rooms: ['১০১', '১০২', '১০৩', '১০৪', '১০৫', '১০৬', '১০৭', '১০৮'],

                        femaleRooms: ['১০১', '১০৩', '১০৫'],

                        maleRooms: ['১০২', '১০৪'],

                        classesData: {

                            'Seven': { '১০১': 5, '১০২': 5, '১০৩': 5, '১০৪': 5, '১০৫': 0, '১০৬': 0, '১০৭': 0, '১০৮': 0 },

                            'Nine': { '১০১': 5, '১০২': 5, '১০৩': 5, '১০৪': 5, '১০৫': 0, '১০৬': 0, '১০৭': 0, '১০৮': 0 }

                        }

                    }

                }

            };

        }



        function getLang() {

            return document.getElementById('filter-lang')?.value || 'bn';

        }



        function formatNumberByLang(num, lang) {

            if (num === null || num === undefined || num === '') return '-';

            const nStr = String(num);

            if (nStr === '-' || nStr === '0') {

                return nStr === '0' ? (lang === 'en' ? '0' : toBengaliNumerals(0)) : '-';

            }

            if (lang === 'en') return nStr;

            return toBengaliNumerals(nStr);

        }



        function formatClassNameByLang(clsName, lang) {

            const clean = String(clsName || '').trim();

            const classMap = {

                'play': { bn: 'প্লে', en: 'Play' },

                'nursery': { bn: 'নার্সারি', en: 'Nursery' },

                'kg': { bn: 'কেজি', en: 'KG' },

                'one': { bn: 'প্রথম', en: 'One' },

                'two': { bn: 'দ্বিতীয়', en: 'Two' },

                'three': { bn: 'তৃতীয়', en: 'Three' },

                'four': { bn: 'চতুর্থ', en: 'Four' },

                'five': { bn: 'পঞ্চম', en: 'Five' },

                'six': { bn: 'ষষ্ঠ', en: 'Six' },

                'seven': { bn: 'সপ্তম', en: 'Seven' },

                'eight': { bn: 'অষ্টম', en: 'Eight' },

                'nine': { bn: 'নবম', en: 'Nine' },

                'ten': { bn: 'দশম', en: 'Ten' }

            };

            const item = classMap[clean.toLowerCase()];

            if (item) {

                if (lang === 'en') return item.en;

                if (lang === 'both') return `${item.bn} (${item.en})`;

                return item.bn;

            }

            return clean;

        }



        function formatShiftInfoByLang(rawShift, lang) {

            let info = formatShiftInfo(rawShift);

            let nameBn = info.name || 'সকাল';

            let nameEn = 'Morning';

            const clean = String(rawShift).toLowerCase();



            if (clean.includes('afternoon') || clean.includes('বিকাল') || clean.includes('দ্বিপ্রহর')) {

                nameBn = 'বিকাল';

                nameEn = 'Afternoon';

            } else if (clean.includes('evening') || clean.includes('সন্ধ্যা')) {

                nameBn = 'সন্ধ্যা';

                nameEn = 'Evening';

            }



            let dispName = nameBn;

            if (lang === 'en') dispName = nameEn;

            else if (lang === 'both') dispName = `${nameBn} / ${nameEn}`;



            return {

                name: dispName,

                nameBn: nameBn,

                nameEn: nameEn,

                time: info.time

            };

        }



        function formatBuildingNameByLang(bName, lang) {

            const clean = String(bName || 'ভবন ক');

            if (lang === 'en') {

                if (clean.includes('ভবন ক')) return 'Building A';

                if (clean.includes('ভবন খ')) return 'Building B';

                if (clean.includes('ভবন গ')) return 'Building C';

                return clean;

            }

            if (lang === 'both') {

                if (clean.includes('ভবন ক')) return 'ভবন ক / Building A';

                if (clean.includes('ভবন খ')) return 'ভবন খ / Building B';

                if (clean.includes('ভবন গ')) return 'ভবন গ / Building C';

                return clean;

            }

            return clean;

        }



        function getMainTitleByLang(lang) {

            if (lang === 'en') return 'Student Data Topsheet';

            if (lang === 'both') return 'শিক্ষার্থীর তথ্য টপশীট (Student Data Topsheet)';

            return 'শিক্ষার্থীর তথ্য টপশীট';

        }



        function getBuildingLabelByLang(bName, lang) {

            const bDisp = formatBuildingNameByLang(bName, lang);

            if (lang === 'en') return `Building : ${bDisp}`;

            if (lang === 'both') return `বিল্ডিং (Building) : ${bDisp}`;

            return `বিল্ডিং : ${bDisp}`;

        }



        function getShiftLabelPrefix(lang) {

            if (lang === 'en') return 'Shift';

            if (lang === 'both') return 'শিফট (Shift)';

            return 'শিফট';

        }



        function getShiftHeaderByLang(lang) {

            if (lang === 'en') return 'Shift';

            if (lang === 'both') return 'শিফট (Shift)';

            return 'শিফট';

        }



        function getClassHeaderByLang(lang) {

            if (lang === 'en') return 'Class';

            if (lang === 'both') return 'ক্লাস (Class)';

            return 'ক্লাস';

        }



        function getTotalHeaderByLang(lang) {

            if (lang === 'en') return 'Total';

            if (lang === 'both') return 'মোট (Total)';

            return 'মোট';

        }



        function getGrandTotalLabelByLang(lang) {

            if (lang === 'en') return 'Grand Total Students';

            if (lang === 'both') return 'সর্বমোট শিক্ষার্থী (Total Students)';

            return 'সর্বমোট শিক্ষার্থী';

        }



        function formatRoomNumberByLang(roomNo, sData, lang) {

            const suffix = getRoomGenderSuffix(sData, roomNo);

            const bnNum = toBengaliNumerals(roomNo);

            const enNum = String(roomNo).replace(/\D/g, '') || String(roomNo);



            if (lang === 'en') {

                return `${enNum}${suffix}`;

            }

            if (lang === 'both') {

                if (bnNum !== enNum && enNum.length > 0) {

                    return `${bnNum} / ${enNum}${suffix}`;

                }

                return `${bnNum}${suffix}`;

            }

            return `${bnNum}${suffix}`;

        }



        function updateStudentDataTopsheetLive() {

            populateFilterDropdowns();

            initFontFamily();



            const lang = getLang();

            const examVal = document.getElementById('filter-exam')?.value || 'all';

            const shiftVal = document.getElementById('filter-shift')?.value || 'all';

            const buildingVal = document.getElementById('filter-building')?.value || 'all';

            const classVal = document.getElementById('filter-class')?.value || 'all';

            const searchVal = (document.getElementById('search-student')?.value || '').trim().toLowerCase();



            const settings = safeJsonParse('school_settings', {});

            const store = safeJsonParse('school_seat_plans_store', {});

            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);



            // Update School Name

            const schoolName = settings?.schoolName || 'আলহেরা এডুকেয়ার হোম উচ্চ বিদ্যালয়';



            // Update Exam Name

            let activeExamName = 'বার্ষিক পরীক্ষা - ২০২৬';

            if (examVal !== 'all') {

                activeExamName = examVal;

            } else if (store && typeof store === 'object' && Object.keys(store).length > 0) {

                const planKeys = Object.keys(store);

                const lastKey = planKeys[planKeys.length - 1];

                if (store[lastKey] && store[lastKey].examName && store[lastKey].examName !== 'All') {

                    activeExamName = store[lastKey].examName;

                }

            } else {

                const routines = safeJsonParse('school_exam_routines', []);

                if (Array.isArray(routines) && routines.length > 0 && routines[0].examName) {

                    activeExamName = routines[0].examName;

                }

            }



            let activeAllocations = [];

            let hasSavedPlans = false;



            // 1. Gather all allocations from Saved Seat Plans Store (school_seat_plans_store)

            if (store && typeof store === 'object' && Object.keys(store).length > 0) {

                Object.keys(store).forEach(planKey => {

                    const plan = store[planKey];

                    if (!plan || !plan.allocations) return;



                    let matchesExam = false;

                    if (examVal === 'all') {

                        matchesExam = true;

                    } else {

                        const cleanExam = examVal.toLowerCase().trim();

                        const cleanPlanExam = (plan.examName || '').toLowerCase().trim();

                        const cleanPlanKey = planKey.toLowerCase().trim();

                        matchesExam = (cleanPlanExam === cleanExam) || (cleanPlanKey === cleanExam) || cleanPlanExam.includes(cleanExam);

                    }



                    if (matchesExam) {

                        hasSavedPlans = true;

                        Object.keys(plan.allocations).forEach(rId => {

                            const item = plan.allocations[rId];

                            if (item) {

                                const itemCopy = JSON.parse(JSON.stringify(item));

                                if (!itemCopy.shift && plan.shift) itemCopy.shift = plan.shift;

                                activeAllocations.push(itemCopy);

                            }

                        });

                    }

                });

            }



            // 2. Fallback to Active Saved Allocations (school_saved_seat_allocations) if store is empty

            if (activeAllocations.length === 0 && savedAlloc && typeof savedAlloc === 'object' && Object.keys(savedAlloc).length > 0) {

                if (examVal === 'all') {

                    hasSavedPlans = true;

                    Object.keys(savedAlloc).forEach(rId => {

                        if (savedAlloc[rId]) activeAllocations.push(savedAlloc[rId]);

                    });

                }

            }



            const container = document.getElementById('topsheet-render-container');

            if (!container) return;



            // Structure to hold data: buildingMap[buildingName][shiftKey] = { shiftInfo, roomsSet, classRoomCounts }

            let buildingMap = {};



            if (hasSavedPlans && activeAllocations.length > 0) {

                activeAllocations.forEach(alloc => {

                    const buildingName = alloc.building?.name || alloc.buildingName || alloc.building_name || 'ভবন ক';

                    const rawShift = alloc.shift || 'Morning Shift';

                    const shiftInfo = formatShiftInfoByLang(rawShift, lang);

                    const roomNo = alloc.room?.number || alloc.roomNo || alloc.room_no || alloc.roomName || alloc.room || '১০১';



                    // Apply Shift & Building Filter

                    if (buildingVal !== 'all' && buildingName !== buildingVal) return;

                    if (shiftVal !== 'all') {

                        const cleanShiftVal = shiftVal.toLowerCase();

                        const cleanRawShift = rawShift.toLowerCase();

                        const cleanShiftName = shiftInfo.name.toLowerCase();

                        if (!cleanRawShift.includes(cleanShiftVal) && !cleanShiftName.includes(cleanShiftVal)) return;

                    }



                    if (!buildingMap[buildingName]) {

                        buildingMap[buildingName] = {};

                    }

                    if (!buildingMap[buildingName][shiftInfo.name]) {

                        buildingMap[buildingName][shiftInfo.name] = {

                            shiftInfo: shiftInfo,

                            rawShift: rawShift,

                            roomsSet: new Set(),

                            classesData: {},

                            roomGenders: {}

                        };

                    }



                    const shiftObj = buildingMap[buildingName][shiftInfo.name];

                    shiftObj.roomsSet.add(roomNo);



                    if (!shiftObj.roomGenders[roomNo]) {

                        shiftObj.roomGenders[roomNo] = {

                            total: 0,

                            female: 0,

                            male: 0,

                            roomGenderAttr: alloc.room?.gender || alloc.roomGender || alloc.gender || ''

                        };

                    }

                    const rMeta = shiftObj.roomGenders[roomNo];



                    const benches = alloc.benches || [];

                    benches.forEach(bench => {

                        ['left', 'right'].forEach(side => {

                            const student = bench[side];

                            if (student && (student.id || student.studentId || student.name || student.class)) {

                                rMeta.total++;

                                const gStr = String(student.gender || student.sex || '').toLowerCase();

                                if (/female|girl|girls|ছাত্রী|মহিলা|f/i.test(gStr)) {

                                    rMeta.female++;

                                } else if (/male|boy|boys|ছাত্র|পুরুষ|m/i.test(gStr)) {

                                    rMeta.male++;

                                }



                                const rawCls = student.class || student.className || student.studentClass || 'Unassigned';

                                const formattedCls = formatClassName(rawCls);



                                // Apply Class & Search Filter

                                if (classVal !== 'all' && formattedCls.toLowerCase() !== formatClassName(classVal).toLowerCase()) return;

                                if (searchVal) {

                                    const matchSearch = String(roomNo).toLowerCase().includes(searchVal) ||

                                                        formattedCls.toLowerCase().includes(searchVal) ||

                                                        shiftInfo.name.toLowerCase().includes(searchVal);

                                    if (!matchSearch) return;

                                }



                                if (!shiftObj.classesData[formattedCls]) {

                                    shiftObj.classesData[formattedCls] = {};

                                }

                                shiftObj.classesData[formattedCls][roomNo] = (shiftObj.classesData[formattedCls][roomNo] || 0) + 1;

                            }

                        });

                    });

                });

            }



            // Check if processed data is present

            let hasProcessedData = Object.keys(buildingMap).some(b => Object.keys(buildingMap[b]).length > 0);



            // 3. Fallback Sample Dataset if no saved plans match or exist

            if (!hasProcessedData && examVal === 'all' && shiftVal === 'all' && buildingVal === 'all' && classVal === 'all' && !searchVal) {

                const sample = getSampleDataFallback();

                buildingMap = sample;

                hasProcessedData = true;

            }



            if (!hasProcessedData) {

                container.innerHTML = `

                    <div class="page-block">

                        <div class="no-data-alert">

                            ⚠️ কোনো সিটপ্ল্যান তথ্য পাওয়া যায়নি (No saved seat plan data found for selected filters).

                            <br><span style="font-size: 0.9em; font-weight: normal; color: #64748b;">"Generate Auto" বাটন দিয়ে সিটপ্ল্যান তৈরি করে সেভ করুন।</span>

                        </div>

                    </div>

                `;

                return;

            }



            const mainTitleText = getMainTitleByLang(lang);

            const shiftHeaderLabel = getShiftHeaderByLang(lang);

            const classHeaderLabel = getClassHeaderByLang(lang);

            const totalHeaderLabel = getTotalHeaderByLang(lang);

            const grandTotalLabel = getGrandTotalLabelByLang(lang);

            const shiftPrefix = getShiftLabelPrefix(lang);



            // Render Tables with Page Block for each building (Both Morning & Afternoon shifts on same page)

            let html = '';

            Object.keys(buildingMap).forEach(bName => {

                const shiftsData = buildingMap[bName];

                const shiftKeys = Object.keys(shiftsData);



                if (shiftKeys.length === 0) return;



                const bLabelText = getBuildingLabelByLang(bName, lang);



                html += `

                    <div class="page-block">

                        <!-- Printable Headline Header on Every Building Page -->

                        <div class="topsheet-header" style="text-align: center; margin-bottom: 16px; border-bottom: 2px solid #000000; padding-bottom: 10px;">

                            <h1 class="topsheet-school-name" style="margin: 0 0 4px 0; font-size: 1.55em; color: #000000 !important; font-weight: 900; letter-spacing: 0.3px;">

                                ${schoolName}

                            </h1>

                            <div class="topsheet-exam-name" style="font-size: 1.15em; font-weight: 800; color: #000000 !important; margin-bottom: 5px;">

                                ${activeExamName}

                            </div>

                            <h2 class="main-topsheet-title" style="margin: 0; font-size: 1.3em; color: #000000 !important; font-weight: 800;">

                                ${mainTitleText}

                            </h2>

                        </div>

                `;



                shiftKeys.forEach((sKey, shiftIdx) => {

                    const sData = shiftsData[sKey];

                    const shiftInfo = formatShiftInfoByLang(sData.rawShift || sKey, lang);

                    let rooms = Array.from(sData.roomsSet || []);



                    // Sort rooms numerically / alphanumerically

                    rooms.sort((a, b) => {

                        const na = parseInt(String(a).replace(/\D/g, '')) || 0;

                        const nb = parseInt(String(b).replace(/\D/g, '')) || 0;

                        return na - nb || String(a).localeCompare(String(b));

                    });



                    const classesData = sData.classesData || {};

                    let classList = Object.keys(classesData);



                    // Standard Class Sort Order

                    const classOrderMap = {

                        'play': 1, 'nursery': 2, 'kg': 3, 'one': 4, 'two': 5, 'three': 6,

                        'four': 7, 'five': 8, 'six': 9, 'seven': 10, 'eight': 11, 'nine': 12, 'ten': 13

                    };

                    classList.sort((a, b) => {

                        const o1 = classOrderMap[a.toLowerCase()] || 99;

                        const o2 = classOrderMap[b.toLowerCase()] || 99;

                        return o1 - o2;

                    });



                    if (classList.length === 0) return;



                    const marginTop = shiftIdx > 0 ? '20px' : '0px';



                    html += `

                        <div class="shift-section" style="margin-top: ${marginTop}; margin-bottom: 20px;">

                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">

                                <h3 class="shift-title" style="margin: 0; color: #000000 !important;">

                                    ${shiftPrefix}: ${shiftInfo.name} ${shiftInfo.time ? `<span style="font-size: 0.9em; font-weight: normal; color: #000000 !important;">(${shiftInfo.time})</span>` : ''}

                                </h3>

                                <div style="font-size: 1.05em; font-weight: bold; color: #000000 !important;">

                                    ${bLabelText}

                                </div>

                            </div>

                            <table class="topsheet-table hide-col-lines">

                                <thead>

                                    <tr>

                                        <th style="width: 22%;">${shiftHeaderLabel}</th>

                                        <th style="width: 15%;">${classHeaderLabel}</th>

                                        ${rooms.map(r => `<th>${formatRoomNumberByLang(r, sData, lang)}</th>`).join('')}

                                        <th style="width: 12%;">${totalHeaderLabel}</th>

                                    </tr>

                                </thead>

                                <tbody>

                    `;



                    // Calculate totals

                    let roomTotals = {};

                    rooms.forEach(r => roomTotals[r] = 0);

                    let shiftGrandTotal = 0;



                    classList.forEach((clsName, idx) => {

                        let rowTotal = 0;

                        const clsRoomMap = classesData[clsName] || {};

                        const clsDisp = formatClassNameByLang(clsName, lang);



                        html += `<tr>`;

                        if (idx === 0) {

                            html += `

                                <td rowspan="${classList.length}" style="font-weight: bold; background: #ffffff; vertical-align: middle;">

                                    <b>${shiftInfo.name}</b><br>

                                    <span style="font-size: 0.88em; font-weight: normal; color: #475569;">${shiftInfo.time}</span>

                                </td>

                            `;

                        }



                        html += `<td style="font-weight: 600;">${clsDisp}</td>`;



                        rooms.forEach(r => {

                            const cnt = clsRoomMap[r] || 0;

                            rowTotal += cnt;

                            roomTotals[r] += cnt;

                            html += `<td>${formatNumberByLang(cnt, lang)}</td>`;

                        });



                        shiftGrandTotal += rowTotal;

                        html += `<td style="font-weight: bold; background: #fafafa;"><b>${formatNumberByLang(rowTotal, lang)}</b></td>`;

                        html += `</tr>`;

                    });



                    html += `

                                    </tbody>

                                    <tfoot>

                                        <tr>

                                            <td colspan="2">${grandTotalLabel}</td>

                                            ${rooms.map(r => `<td>${formatNumberByLang(roomTotals[r], lang)}</td>`).join('')}

                                            <td><b>${formatNumberByLang(shiftGrandTotal, lang)}</b></td>

                                        </tr>

                                    </tfoot>

                                </table>

                            </div>

                    `;

                });



                html += `</div>`; // Close .page-block for this building

            });



            container.innerHTML = html;

        }



        // Real-Time Event Listeners

        window.addEventListener('DOMContentLoaded', () => {

            updateStudentDataTopsheetLive();

        });



        function refreshStudentDataTopsheetData() {

            updateStudentDataTopsheetLive();

        }

        window.addEventListener('storage', (e) => {

            if (!e.key || e.key === 'school_seat_plans_store' || e.key === 'school_saved_seat_allocations' || e.key === 'school_shift_times' || e.key === 'school_settings' || e.key === 'school_students') {

                refreshStudentDataTopsheetData();

            }

        });

        window.addEventListener('dbSynced', refreshStudentDataTopsheetData);



        window.addEventListener('message', (e) => {

            updateStudentDataTopsheetLive();

        });



        // Global functions for parent iframe calls

        window.updateStudentDataTopsheetLive = updateStudentDataTopsheetLive;

        window.updateAttendanceSheetLive = updateStudentDataTopsheetLive;



        // Periodic Polling Fallback to catch intra-tab updates

        let lastStorageHash = '';

        setInterval(() => {

            const currentHash = (localStorage.getItem('school_seat_plans_store') || '') + (localStorage.getItem('school_saved_seat_allocations') || '') + (localStorage.getItem('school_settings') || '');

            if (currentHash !== lastStorageHash) {

                lastStorageHash = currentHash;

                updateStudentDataTopsheetLive();

            }

        }, 1500);

    
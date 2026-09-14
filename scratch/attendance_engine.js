
        // ==========================================================================
        // STUDENT ATTENDANCE SHEET ENGINE (MERGED FROM Student attendance sheet.html)
        // Dynamically synchronized with Saved Seat Plans (school_seat_plans_store),
        // Active Allocations, Exam Routines, and Student Directory
        // ==========================================================================

        function getAttendanceAllStudentsList() {
            let allStudents = [];
            const store = safeJsonParse('school_seat_plans_store', {});
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);

            // 1. PRIMARY SOURCE: Saved Seat Plans Store (school_seat_plans_store)
            if (store && typeof store === 'object' && Object.keys(store).length > 0) {
                Object.keys(store).forEach(planKey => {
                    const plan = store[planKey];
                    if (!plan || !plan.allocations) return;
                    const planExamName = plan.examName || 'বার্ষিক পরীক্ষা ২০২৬';
                    const planShift = plan.shift || 'Morning Shift';

                    Object.entries(plan.allocations).forEach(([roomId, item]) => {
                        if (item && item.benches && Array.isArray(item.benches)) {
                            const rNo = item.room ? (item.room.number || item.room.name || roomId) : roomId;
                            const bldgName = (item.building && item.building.name && item.building.name.trim()) ? item.building.name.trim() : 'একাডেমিক ভবন-ক';
                            const itemShift = item.shift || planShift;

                            item.benches.forEach(b => {
                                [b.left, b.right].forEach(st => {
                                    if (st) {
                                        const stId = st.studentId || st.id || st.roll;
                                        if (stId) {
                                            allStudents.push({
                                                id: stId,
                                                studentId: stId,
                                                roll: parseInt(st.roll) || (allStudents.length + 1),
                                                name: st.name || st.nameBn || '',
                                                nameBn: st.nameBn || st.name || '',
                                                class: st.class || 'Nine',
                                                shift: itemShift,
                                                buildingName: bldgName,
                                                roomNo: rNo,
                                                examName: planExamName
                                            });
                                        }
                                    }
                                });
                            });
                        }
                    });
                });
            }

            // 2. SECONDARY SOURCE: Active Saved Allocations (school_saved_seat_allocations)
            if (allStudents.length === 0 && savedAlloc && typeof savedAlloc === 'object' && Object.keys(savedAlloc).length > 0) {
                Object.entries(savedAlloc).forEach(([roomId, item]) => {
                    if (item && item.benches && Array.isArray(item.benches)) {
                        const rNo = item.room ? (item.room.number || item.room.name || roomId) : roomId;
                        const bldgName = (item.building && item.building.name && item.building.name.trim()) ? item.building.name.trim() : 'একাডেমিক ভবন-ক';
                        const itemShift = item.shift || 'Morning Shift';

                        item.benches.forEach(b => {
                            [b.left, b.right].forEach(st => {
                                if (st) {
                                    const stId = st.studentId || st.id || st.roll;
                                    if (stId) {
                                        allStudents.push({
                                            id: stId,
                                            studentId: stId,
                                            roll: parseInt(st.roll) || (allStudents.length + 1),
                                            name: st.name || st.nameBn || '',
                                            nameBn: st.nameBn || st.name || '',
                                            class: st.class || 'Nine',
                                            shift: itemShift,
                                            buildingName: bldgName,
                                            roomNo: rNo,
                                            examName: 'বার্ষিক পরীক্ষা ২০২৬'
                                        });
                                    }
                                }
                            });
                        });
                    }
                });
            }

            // 3. TERTIARY SOURCE: Student Directory Database (school_students)
            if (allStudents.length === 0) {
                const directoryStudents = safeJsonParse('school_students', []) || (typeof window !== 'undefined' && Array.isArray(window.studentsData) ? window.studentsData : []);
                if (Array.isArray(directoryStudents) && directoryStudents.length > 0) {
                    directoryStudents.forEach(st => {
                        const stId = st.studentId || st.id || st.regNo;
                        if (stId) {
                            allStudents.push({
                                id: stId,
                                studentId: stId,
                                roll: parseInt(st.roll) || (allStudents.length + 1),
                                name: st.name || st.studentName || st.nameBn || '',
                                nameBn: st.nameBn || st.name || st.studentName || '',
                                class: st.class || st.className || 'Nine',
                                shift: st.shift || 'Morning Shift',
                                buildingName: st.buildingName || st.building || 'একাডেমিক ভবন-ক',
                                roomNo: st.roomNo || '101',
                                examName: st.examName || 'বার্ষিক পরীক্ষা ২০২৬'
                            });
                        }
                    });
                }
            }

            // 4. FALLBACK MOCK DATASET (If no stored data exists in localStorage)
            if (allStudents.length === 0) {
                allStudents = [
                    { id: '2606001', studentId: '2606001', roll: 1, name: 'Abdullah Al Mamun', nameBn: 'আব্দুল্লাহ আল মামুন', class: 'Nine', shift: 'Morning Shift', buildingName: 'একাডেমিক ভবন-ক', roomNo: '101', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2606002', studentId: '2606002', roll: 2, name: 'Farjana Akter', nameBn: 'ফারজানা আক্তার', class: 'Nine', shift: 'Morning Shift', buildingName: 'একাডেমিক ভবন-ক', roomNo: '101', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2606003', studentId: '2606003', roll: 3, name: 'Tanvir Ahmed', nameBn: 'তানভীর আহমেদ', class: 'Nine', shift: 'Morning Shift', buildingName: 'একাডেমিক ভবন-ক', roomNo: '101', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2606004', studentId: '2606004', roll: 4, name: 'Sadia Sultana', nameBn: 'সাদিয়া সুলতানা', class: 'Nine', shift: 'Morning Shift', buildingName: 'একাডেমিক ভবন-ক', roomNo: '101', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2606005', studentId: '2606005', roll: 5, name: 'Md. Rafsan Hossain', nameBn: 'মোঃ রাফসান হোসেন', class: 'Nine', shift: 'Morning Shift', buildingName: 'একাডেমিক ভবন-ক', roomNo: '101', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2610001', studentId: '2610001', roll: 1, name: 'Rakibul Hasan', nameBn: 'রাকিবুল হাসান', class: 'Ten', shift: 'Morning Shift', buildingName: 'একাডেমিক ভবন-ক', roomNo: '102', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2610002', studentId: '2610002', roll: 2, name: 'Jahanara Begum', nameBn: 'জাহানারা বেগম', class: 'Ten', shift: 'Morning Shift', buildingName: 'একাডেমিক ভবন-ক', roomNo: '102', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2610003', studentId: '2610003', roll: 3, name: 'Shahadat Hossain', nameBn: 'শাহাদাত হোসেন', class: 'Ten', shift: 'Morning Shift', buildingName: 'একাডেমিক ভবন-ক', roomNo: '102', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2608001', studentId: '2608001', roll: 1, name: 'Mahir Faisel', nameBn: 'মাহির ফয়সাল', class: 'Eight', shift: 'Afternoon Shift', buildingName: 'গোলাপী ভবন', roomNo: '103', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2608002', studentId: '2608002', roll: 2, name: 'Tasnim Jahan', nameBn: 'তাসনিম জাহান', class: 'Eight', shift: 'Afternoon Shift', buildingName: 'গোলাপী ভবন', roomNo: '103', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2607001', studentId: '2607001', roll: 1, name: 'Ahsan Habib', nameBn: 'আহসান হাবীব', class: 'Seven', shift: 'Afternoon Shift', buildingName: 'গোলাপী ভবন', roomNo: '104', examName: 'বার্ষিক পরীক্ষা ২০২৬' },
                    { id: '2607002', studentId: '2607002', roll: 2, name: 'Nabila Karim', nameBn: 'নাবিলা করিম', class: 'Seven', shift: 'Afternoon Shift', buildingName: 'গোলাপী ভবন', roomNo: '104', examName: 'বার্ষিক পরীক্ষা ২০২৬' }
                ];
            }

            return allStudents;
        }

        function populateAttendanceSheetClassFilter() {
            const classSelect = document.getElementById('attendance-sheet-filter-class');
            if (!classSelect) return;
            const currentSelected = classSelect.value || 'all';
            classSelect.innerHTML = '<option value="all">All Classes</option>';

            const classSet = new Set();
            const allStudents = getAttendanceAllStudentsList();
            allStudents.forEach(st => {
                if (st.class && st.class.trim()) {
                    classSet.add(st.class.trim());
                }
            });

            if (classSet.size === 0) {
                try {
                    const classesList = JSON.parse(localStorage.getItem('school_classes') || '[]');
                    if (Array.isArray(classesList)) {
                        classesList.forEach(c => {
                            const cName = (typeof c === 'string' ? c : (c.name || c.className || ''));
                            if (cName.trim()) classSet.add(cName.trim());
                        });
                    }
                } catch (e) {}
            }

            const predefinedOrder = [
                'play', 'nursery', 'kg',
                'class 1', 'class 2', 'class 3', 'class 4', 'class 5',
                'class 6', 'class 7', 'class 8', 'class 9', 'class 10',
                'six', 'seven', 'eight', 'nine', 'ten',
                'প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম',
                'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম'
            ];

            const sortedClasses = Array.from(classSet).sort((a, b) => {
                const aIdx = predefinedOrder.indexOf(a.toLowerCase());
                const bIdx = predefinedOrder.indexOf(b.toLowerCase());
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                if (aIdx !== -1) return -1;
                if (bIdx !== -1) return 1;
                return a.localeCompare(b, 'bn');
            });

            sortedClasses.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls;
                opt.innerText = cls;
                classSelect.appendChild(opt);
            });

            if (currentSelected && [...classSelect.options].some(o => o.value === currentSelected)) {
                classSelect.value = currentSelected;
            }
        }

        function populateAttendanceSheetExamFilter() {
            const examSelect = document.getElementById('attendance-sheet-filter-exam');
            if (!examSelect) return;
            const currentSelected = examSelect.value || 'all';
            examSelect.innerHTML = '<option value="all">সকল পরীক্ষা (All Exams / Routine Title)</option>';

            const examSet = new Set();
            try {
                const routines = JSON.parse(localStorage.getItem('school_exam_routines') || '[]');
                if (Array.isArray(routines)) {
                    routines.forEach(r => {
                        if (r && r.examName && r.examName.trim()) {
                            examSet.add(r.examName.trim());
                        }
                    });
                }
            } catch (e) {}

            try {
                const seatPlansStore = JSON.parse(localStorage.getItem('school_seat_plans_store') || '{}');
                if (seatPlansStore && typeof seatPlansStore === 'object') {
                    Object.values(seatPlansStore).forEach(plan => {
                        if (plan && plan.examName && plan.examName.trim()) {
                            examSet.add(plan.examName.trim());
                        }
                    });
                }
            } catch (e) {}

            try {
                const examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]');
                if (Array.isArray(examTypes)) {
                    examTypes.forEach(t => {
                        const tName = typeof t === 'string' ? t : (t.name || t.examName || '');
                        if (tName.trim()) examSet.add(tName.trim());
                    });
                }
            } catch (e) {}

            if (examSet.size === 0) {
                const settings = safeJsonParse('school_settings', null);
                if (settings?.examName && settings.examName.trim()) {
                    examSet.add(settings.examName.trim());
                } else {
                    examSet.add('বার্ষিক পরীক্ষা ২০২৬');
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
            }
        }

        function populateAttendanceSheetShiftFilter() {
            const shiftSelect = document.getElementById('attendance-sheet-filter-shift');
            if (!shiftSelect) return;
            const currentSelected = shiftSelect.value || 'all';
            shiftSelect.innerHTML = '<option value="all">All Shifts</option>';

            const shiftSet = new Set();
            const allStudents = getAttendanceAllStudentsList();
            allStudents.forEach(st => {
                if (st.shift && st.shift.trim()) {
                    shiftSet.add(st.shift.trim());
                }
            });

            try {
                const shiftTimes = JSON.parse(localStorage.getItem('school_shift_times') || '[]');
                if (Array.isArray(shiftTimes)) {
                    shiftTimes.forEach(s => {
                        const sName = typeof s === 'string' ? s : (s.name || s.shiftName || '');
                        if (sName.trim()) shiftSet.add(sName.trim());
                    });
                }
            } catch (e) {}

            if (shiftSet.size === 0) {
                shiftSet.add('Morning Shift');
                shiftSet.add('Afternoon Shift');
            }

            shiftSet.forEach(shift => {
                const opt = document.createElement('option');
                opt.value = shift;
                opt.innerText = shift;
                shiftSelect.appendChild(opt);
            });

            if (currentSelected && [...shiftSelect.options].some(o => o.value === currentSelected)) {
                shiftSelect.value = currentSelected;
            }
        }

        function updateAttendanceSheetFontSize(val) {
            const num = parseFloat(val) || 14;
            const valLabel = document.getElementById('attendance-sheet-font-size-val');
            if (valLabel) valLabel.innerText = num + 'px';

            const container = document.getElementById('attendance-pages-container');
            if (!container) return;

            const tds = container.querySelectorAll('td');
            tds.forEach(td => {
                td.style.fontSize = (num * 1.1) + 'px';
            });

            const studentNames = container.querySelectorAll('.student-name');
            studentNames.forEach(sn => {
                sn.style.fontSize = (num * 1.27) + 'px';
            });

            const ths = container.querySelectorAll('th');
            ths.forEach(th => {
                th.style.fontSize = (num * 1.0) + 'px';
            });
        }

        function getAttendanceSubjectShortName(nameStr) {
            if (!nameStr) return 'SUB';
            const s = nameStr.trim();
            const lower = s.toLowerCase();

            if (/bangla.*1st|বাংলা.*১ম|bangla.*first/i.test(lower)) return 'BAN 1st';
            if (/bangla.*2nd|বাংলা.*২য়|বাংলা.*২য়|bangla.*second/i.test(lower)) return 'BAN 2nd';
            if (/bangla|বাংলা/i.test(lower)) return 'BAN';

            if (/english.*1st|ইংরেজি.*১ম|english.*first/i.test(lower)) return 'ENG 1st';
            if (/english.*2nd|ইংরেজি.*২য়|ইংরেজি.*২য়|english.*second/i.test(lower)) return 'ENG 2nd';
            if (/english|ইংরেজি/i.test(lower)) return 'ENG';

            if (/math|গণিত|হিসাব/i.test(lower)) return 'MATH';
            if (/science|বিজ্ঞান/i.test(lower)) return 'SCI';
            if (/social|সমাজ|বাংলাদেশ ও বিশ্ব/i.test(lower)) return 'BGS';
            if (/religion|ইসলাম|ধর্ম|hindu|islam/i.test(lower)) return 'REL';
            if (/ict|তথ্য ও যোগাযোগ/i.test(lower)) return 'ICT';
            if (/agriculture|কৃষি/i.test(lower)) return 'AGRI';
            if (/home science|গার্হস্থ্য/i.test(lower)) return 'HOME';
            if (/art|চারু/i.test(lower)) return 'ART';
            if (/physics|পদার্থ/i.test(lower)) return 'PHY';
            if (/chemistry|রসায়ন|রসায়ন/i.test(lower)) return 'CHEM';
            if (/biology|জীববিজ্ঞান/i.test(lower)) return 'BIO';
            if (/history|ইতিহাস/i.test(lower)) return 'HIST';
            if (/geography|ভূগোল/i.test(lower)) return 'GEO';
            if (/accounting|হিসাববিজ্ঞান/i.test(lower)) return 'ACC';
            if (/business|ব্যবসায়|finance|অর্থনীতি/i.test(lower)) return 'BUS';

            const words = s.split(/[\s\-–—/]+/);
            if (words.length === 1) {
                return words[0].substring(0, 4).toUpperCase();
            }
            return words.map(w => w[0]).join('').substring(0, 4).toUpperCase();
        }

        function getAttendanceSingleSubjectBangla(code, name) {
            const raw = (code || name || '').toUpperCase().trim();
            const lowerName = (name || '').toLowerCase();

            if (/BAN 1|বাংলা ১|BANGLA 1/i.test(raw) || /বাংলা.*১ম/i.test(lowerName)) return 'বাংলা ১ম';
            if (/BAN 2|বাংলা ২|BANGLA 2/i.test(raw) || /বাংলা.*২য়|বাংলা.*২য়/i.test(lowerName)) return 'বাংলা ২য়';
            if (/^BAN$|^বাংলা$/i.test(raw) || /বাংলা/i.test(lowerName)) return 'বাংলা';

            if (/ENG 1|ইংরেজি ১|ENGLISH 1/i.test(raw) || /ইংরেজি.*১ম/i.test(lowerName)) return 'ইংরেজি ১ম';
            if (/ENG 2|ইংরেজি ২|ENGLISH 2/i.test(raw) || /ইংরেজি.*২য়|ইংরেজি.*২য়/i.test(lowerName)) return 'ইংরেজি ২য়';
            if (/^ENG$|^ইংরেজি$/i.test(raw) || /ইংরেজি/i.test(lowerName)) return 'ইংরেজি';

            if (/MATH|গণিত/i.test(raw) || /গণিত/i.test(lowerName)) return 'গণিত';
            if (/SCI|বিজ্ঞান/i.test(raw) || /বিজ্ঞান/i.test(lowerName)) return 'বিজ্ঞান';
            if (/BGS|সমাজ|বিশ্ব/i.test(raw) || /বাংলাদেশ ও বিশ্বপরিচয়|সমাজ/i.test(lowerName)) return 'বি: ও বিশ্ব:';
            if (/REL|ধর্ম|ISLAM|হিন্দু/i.test(raw) || /ধর্ম|ইসলাম|হিন্দু/i.test(lowerName)) return 'ধর্ম';
            if (/ICT|তথ্য/i.test(raw) || /তথ্য ও যোগাযোগ/i.test(lowerName)) return 'আইসিটি';
            if (/AGRI|কৃষি/i.test(raw) || /কৃষি/i.test(lowerName)) return 'কৃষি';
            if (/HOME|গার্হস্থ্য/i.test(raw) || /গার্হস্থ্য/i.test(lowerName)) return 'গার্হস্থ্য';
            if (/ART|চারু/i.test(raw) || /চারু/i.test(lowerName)) return 'চারু ও কারু';
            if (/PHY|পদার্থ/i.test(raw) || /পদার্থ/i.test(lowerName)) return 'পদার্থ';
            if (/CHEM|রসায়ন|রসায়ন/i.test(raw) || /রসায়ন|রসায়ন/i.test(lowerName)) return 'রসায়ন';
            if (/BIO|জীব/i.test(raw) || /জীববিজ্ঞান/i.test(lowerName)) return 'জীববিজ্ঞান';
            if (/HIST|ইতিহাস/i.test(raw) || /ইতিহাস/i.test(lowerName)) return 'ইতিহাস';
            if (/GEO|ভূগোল/i.test(raw) || /ভূগোল/i.test(lowerName)) return 'ভূগোল';
            if (/ACC|হিসাব/i.test(raw) || /হিসাববিজ্ঞান/i.test(lowerName)) return 'হিসাববিজ্ঞান';
            if (/BUS|ব্যবসায়|ব্যবসায়/i.test(raw) || /ব্যবসায় উদ্যোগ|ব্যবসায়/i.test(lowerName)) return 'ব্যবসায় উদ্যোগ';
            if (/FIN|অর্থনীতি/i.test(raw) || /অর্থনীতি|ফিন্যান্স/i.test(lowerName)) return 'ফিন্যান্স';

            if (code) return code;
            return name ? name.substring(0, 6) : 'বিষয়';
        }

        function getAttendanceSubjectHeaderDisplay(subCode, subName, langVal = 'en') {
            if (!subCode) subCode = getAttendanceSubjectShortName(subName);

            const parts = subCode.split('/');
            const nameParts = (subName || '').split(' / ');

            if (langVal === 'en') {
                return subCode;
            } else if (langVal === 'bn') {
                const bnParts = parts.map((p, idx) => getAttendanceSingleSubjectBangla(p, nameParts[idx] || subName));
                return bnParts.join('/');
            } else if (langVal === 'both') {
                if (parts.length > 1) {
                    const combined = parts.map((p, idx) => {
                        const bn = getAttendanceSingleSubjectBangla(p, nameParts[idx] || subName);
                        return `${bn} (${p})`;
                    }).join('<br>');
                    return combined;
                } else {
                    const bn = getAttendanceSingleSubjectBangla(subCode, subName);
                    return `${bn} (${subCode})`;
                }
            }
            return subCode;
        }

        function formatAttendanceRoutineDateForHeader(dateStr) {
            if (!dateStr || dateStr.trim() === '') return '';
            const d = dateStr.trim();
            const parts = d.split(/[-/.]/);
            if (parts.length === 3) {
                let day = parts[2];
                let month = parts[1];
                let year = parts[0];
                if (parts[0].length === 2 && parts[2].length === 4) {
                    day = parts[0];
                    month = parts[1];
                    year = parts[2];
                }
                const monthNum = parseInt(month, 10);
                const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                if (monthNum >= 1 && monthNum <= 12) {
                    return `${parseInt(day, 10)}-${monthNamesEn[monthNum - 1]}`;
                }
            }
            const dt = new Date(d);
            if (!isNaN(dt.getTime())) {
                const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${dt.getDate()}-${monthNamesEn[dt.getMonth()]}`;
            }
            return d.substring(0, 6);
        }

        function normalizeAttendanceClassKey(cls) {
            if (!cls) return '';
            let s = String(cls).toLowerCase().trim();
            s = s.replace(/^class\s+/i, '').replace(/^শ্রেণি\s+/i, '').replace(/^শ্রেণী\s+/i, '');
            const map = {
                'play': 'play', 'প্লে': 'play',
                'nursery': 'nursery', 'নার্সারি': 'nursery', 'নার্সারী': 'nursery',
                'kg': 'kg', 'কেজি': 'kg',
                'one': '1', '1': '1', '১': '1', 'প্রথম': '1',
                'two': '2', '2': '2', '২': '2', 'দ্বিতীয়': '2', 'দ্বিতীয়': '2',
                'three': '3', '3': '3', '৩': '3', 'তৃতীয়': '3', 'তৃতীয়': '3',
                'four': '4', '4': '4', '৪': '4', 'চতুর্থ': '4',
                'five': '5', '5': '5', '৫': '5', 'পঞ্চম': '5',
                'six': '6', '6': '6', '৬': '6', 'ষষ্ঠ': '6',
                'seven': '7', '7': '7', '৭': '7', 'সপ্তম': '7',
                'eight': '8', '8': '8', '৮': '8', 'অষ্টম': '8',
                'nine': '9', '9': '9', '৯': '9', 'নবম': '9',
                'ten': '10', '10': '10', '১০': '10', 'দশম': '10'
            };
            return map[s] || s;
        }

        function isAttendanceClassMatch(routineClass, targetClass) {
            if (!routineClass || !targetClass) return false;
            const normR = normalizeAttendanceClassKey(routineClass);
            const normT = normalizeAttendanceClassKey(targetClass);
            if (normR === normT) return true;

            const rClean = String(routineClass).toLowerCase().trim();
            const tClean = String(targetClass).toLowerCase().trim();
            return rClean.includes(tClean) || tClean.includes(rClean);
        }

        function expandAttendanceSubjectItem(sName, sDate) {
            if (!sName) return [];
            let name = sName.trim();
            let date = sDate || '';

            if (/\+|,|\/|&| ও | এবং /.test(name)) {
                const subParts = name.split(/\s*(?:\+| এবং | ও |,|\/|&)\s*/).filter(p => p.trim().length > 0);
                if (subParts.length > 1) {
                    return subParts.map(sp => {
                        const code = getAttendanceSubjectShortName(sp);
                        return { name: sp.trim(), code: code, date: date };
                    });
                }
            }
            const code = getAttendanceSubjectShortName(name);
            return [{ name: name, code: code, date: date }];
        }

        function getDefaultAttendanceSubjectsForClass(cName) {
            const norm = normalizeAttendanceClassKey(cName);
            if (['play', 'nursery', 'kg'].includes(norm)) {
                return [
                    { name: 'বাংলা', shortName: 'BAN' },
                    { name: 'ইংরেজি', shortName: 'ENG' },
                    { name: 'গণিত', shortName: 'MATH' },
                    { name: 'ড্রয়িং ও সাধারণ জ্ঞান', shortName: 'ART/GK' }
                ];
            }
            if (['1', '2', '3', '4', '5'].includes(norm)) {
                return [
                    { name: 'বাংলা', shortName: 'BAN' },
                    { name: 'ইংরেজি', shortName: 'ENG' },
                    { name: 'গণিত', shortName: 'MATH' },
                    { name: 'প্রাথমিক বিজ্ঞান', shortName: 'SCI' },
                    { name: 'বাংলাদেশ ও বিশ্বপরিচয়', shortName: 'BGS' },
                    { name: 'ধর্ম ও নৈতিক শিক্ষা', shortName: 'REL' }
                ];
            }
            return [
                { name: 'বাংলা ১ম পত্র', shortName: 'BAN 1st' },
                { name: 'বাংলা ২য় পত্র', shortName: 'BAN 2nd' },
                { name: 'ইংরেজি ১ম পত্র', shortName: 'ENG 1st' },
                { name: 'ইংরেজি ২য় পত্র', shortName: 'ENG 2nd' },
                { name: 'গণিত', shortName: 'MATH' },
                { name: 'বিজ্ঞান / পদার্থবিজ্ঞান', shortName: 'SCI/PHY' },
                { name: 'বাংলাদেশ ও বিশ্বপরিচয়', shortName: 'BGS' },
                { name: 'ধর্ম ও নৈতিক শিক্ষা', shortName: 'REL' },
                { name: 'তথ্য ও যোগাযোগ প্রযুক্তি', shortName: 'ICT' },
                { name: 'কৃষি / গার্হস্থ্য বিজ্ঞান', shortName: 'AGRI/HOME' }
            ];
        }

        function getRoutineSubjectsForAttendanceSheet(examVal = 'all', classVal = 'all') {
            const routineData = safeJsonParse('school_exam_routines', null) ||
                                safeJsonParse('school_exam_schedules', null) ||
                                safeJsonParse('school_exam_routine', null) ||
                                safeJsonParse('school_routines', null) ||
                                safeJsonParse('school_saved_routines', null) ||
                                safeJsonParse('exam_routines', []);

            let rawSubjects = [];
            if (Array.isArray(routineData) && routineData.length > 0) {
                let filtered = routineData;
                if (examVal && examVal !== 'all') {
                    const exClean = examVal.toLowerCase().trim();
                    filtered = filtered.filter(r => {
                        const rExam = (r.examName || '').toLowerCase().trim();
                        return rExam === exClean || rExam.includes(exClean) || exClean.includes(rExam);
                    });
                }
                if (classVal && classVal !== 'all') {
                    filtered = filtered.filter(r => isAttendanceClassMatch(r.class || r.className, classVal));
                }

                if (filtered.length > 0) {
                    filtered.forEach(item => {
                        if (Array.isArray(item.subjects)) {
                            item.subjects.forEach(sub => {
                                const sName = sub.subjectName || sub.name || sub.subject || '';
                                const sDate = sub.examDate || sub.date || item.examDate || item.date || '';
                                if (sName) {
                                    const expanded = expandAttendanceSubjectItem(sName, sDate);
                                    rawSubjects.push(...expanded);
                                }
                            });
                        } else if (item.subject || item.subjectName) {
                            const sName = item.subject || item.subjectName || '';
                            const sDate = item.examDate || item.date || '';
                            if (sName) {
                                const expanded = expandAttendanceSubjectItem(sName, sDate);
                                rawSubjects.push(...expanded);
                            }
                        }
                    });
                }
            }

            if (rawSubjects.length === 0) {
                return getDefaultAttendanceSubjectsForClass(classVal);
            }

            const dateGroups = {};
            let autoDateIdx = 1;

            rawSubjects.forEach(subItem => {
                let dKey = subItem.date ? subItem.date.trim() : '';
                if (!dKey) {
                    dKey = `NO_DATE_${autoDateIdx++}`;
                }
                if (!dateGroups[dKey]) {
                    dateGroups[dKey] = [];
                }
                dateGroups[dKey].push(subItem);
            });

            const sortedDateKeys = Object.keys(dateGroups).sort((a, b) => {
                if (a.startsWith('NO_DATE_') && !b.startsWith('NO_DATE_')) return 1;
                if (!a.startsWith('NO_DATE_') && b.startsWith('NO_DATE_')) return -1;
                const dtA = new Date(a);
                const dtB = new Date(b);
                if (!isNaN(dtA.getTime()) && !isNaN(dtB.getTime())) {
                    return dtA.getTime() - dtB.getTime();
                }
                return a.localeCompare(b);
            });

            const finalSubjects = [];
            sortedDateKeys.forEach(dKey => {
                const itemsInDate = dateGroups[dKey];
                const seenCodes = new Set();
                const subCodes = [];
                const subNames = [];

                itemsInDate.forEach(item => {
                    const effectiveCode = item.code || getAttendanceSubjectShortName(item.name);
                    if (effectiveCode && !seenCodes.has(effectiveCode)) {
                        seenCodes.add(effectiveCode);
                        subCodes.push(effectiveCode);
                        subNames.push(item.name);
                    }
                });

                if (subCodes.length > 0) {
                    const combinedCode = subCodes.join('/');
                    const combinedName = subNames.join(' / ');
                    finalSubjects.push({
                        name: combinedName,
                        shortName: combinedCode,
                        date: dKey,
                        subCodes: subCodes,
                        subNames: subNames
                    });
                }
            });

            if (finalSubjects.length > 0) return finalSubjects;
            return getDefaultAttendanceSubjectsForClass(classVal);
        }

        function updateAttendanceSheetLive() {
            const settings = safeJsonParse('school_settings', null);

            const classVal = document.getElementById('attendance-sheet-filter-class')?.value || 'all';
            const examVal = document.getElementById('attendance-sheet-filter-exam')?.value || 'all';
            const shiftVal = document.getElementById('attendance-sheet-filter-shift')?.value || 'all';
            const langVal = document.getElementById('attendance-sheet-filter-lang')?.value || 'en';
            const searchVal = (document.getElementById('attendance-sheet-search-student')?.value || '').trim().toLowerCase();

            const schoolName = settings?.schoolName || 'আলহেরা এডুকেয়ার হোম উচ্চ বিদ্যালয়';
            const customLogo = localStorage.getItem('school_logo');
            const logoUrl = customLogo || settings?.schoolLogo;
            const logoHtml = logoUrl 
                ? `<img src="${logoUrl}" alt="Logo" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
                : `<span id="site-logo-icon">🎓</span>`;

            // 1. Get All Students and filter
            let allStudents = getAttendanceAllStudentsList();
            let filtered = allStudents;

            // Filter Class
            if (classVal !== 'all') {
                const reqClass = classVal.toLowerCase().trim();
                filtered = filtered.filter(s => {
                    const sc = (s.class || '').toLowerCase().trim();
                    return sc === reqClass || sc.includes(reqClass) || reqClass.includes(sc);
                });
            }

            // Filter Exam
            if (examVal !== 'all') {
                const reqExam = examVal.toLowerCase().trim();
                filtered = filtered.filter(s => {
                    const se = (s.examName || '').toLowerCase().trim();
                    return se === reqExam || se.includes(reqExam) || reqExam.includes(se);
                });
            }

            // Filter Shift
            if (shiftVal !== 'all') {
                const reqShift = shiftVal.toLowerCase().trim();
                filtered = filtered.filter(s => {
                    const ss = (s.shift || '').toLowerCase().trim();
                    return ss === reqShift || ss.includes(reqShift) || reqShift.includes(ss);
                });
            }

            // Filter Search Text
            if (searchVal) {
                filtered = filtered.filter(s => {
                    const stId = String(s.studentId || s.id || '').toLowerCase();
                    const stRoll = String(s.roll || '').toLowerCase();
                    const stNameBn = String(s.nameBn || '').toLowerCase();
                    const stNameEn = String(s.name || s.studentName || '').toLowerCase();
                    const stRoom = String(s.roomNo || '').toLowerCase();
                    const stBldg = String(s.buildingName || '').toLowerCase();
                    return stId.includes(searchVal) || stRoll.includes(searchVal) || stNameBn.includes(searchVal) || stNameEn.includes(searchVal) || stRoom.includes(searchVal) || stBldg.includes(searchVal);
                });
            }

            const pagesContainer = document.getElementById('attendance-pages-container');
            if (!pagesContainer) return;

            if (filtered.length === 0) {
                pagesContainer.innerHTML = `
                    <div style="background:#fff; padding:35px 20px; margin-top:25px; border-radius:10px; text-align:center; font-weight:700; color:#ef4444; font-size:1.1rem; box-shadow:0 4px 15px rgba(0,0,0,0.08); border: 1.5px solid #fca5a5; max-width:600px;">
                        ⚠️ কোনো তথ্য পাওয়া যায়নি (No matching student attendance sheet data found for selected filters).
                    </div>`;
                return;
            }

            // 2. Group Students by: (Exam Name + Shift Name + Building Name + Room No + Class Name)
            const pageGroupMap = {};
            filtered.forEach(st => {
                const eName = st.examName || (examVal !== 'all' ? examVal : (settings?.examName || 'বার্ষিক পরীক্ষা ২০২৬'));
                const sName = st.shift || 'Morning Shift';
                const bName = st.buildingName || 'একাডেমিক ভবন-ক';
                const rNo = st.roomNo || '101';
                const cName = st.class || 'Nine';

                const gKey = eName + '___' + sName + '___' + bName + '___' + rNo + '___' + cName;
                if (!pageGroupMap[gKey]) {
                    pageGroupMap[gKey] = {
                        examName: eName,
                        shiftName: sName,
                        buildingName: bName,
                        roomNo: rNo,
                        className: cName,
                        students: []
                    };
                }
                pageGroupMap[gKey].students.push(st);
            });

            const groupKeys = Object.keys(pageGroupMap);

            // Sort group keys logically
            groupKeys.sort((aKey, bKey) => {
                const gA = pageGroupMap[aKey];
                const gB = pageGroupMap[bKey];

                if (gA.examName !== gB.examName) return gA.examName.localeCompare(gB.examName, 'bn');

                const isAMorning = /morning|sokal|সকাল|প্রভাতি/i.test(gA.shiftName);
                const isBMorning = /morning|sokal|সকাল|প্রভাতি/i.test(gB.shiftName);
                if (isAMorning && !isBMorning) return -1;
                if (!isAMorning && isBMorning) return 1;

                if (gA.buildingName !== gB.buildingName) return gA.buildingName.localeCompare(gB.buildingName, 'bn');

                const roomComp = gA.roomNo.localeCompare(gB.roomNo, undefined, { numeric: true });
                if (roomComp !== 0) return roomComp;

                return gA.className.localeCompare(gB.className, 'bn');
            });

            let pagesHtml = '';
            let pageIdx = 1;

            const ROWS_PER_PAGE_STUDENTS = 10;

            groupKeys.forEach(gKey => {
                const { examName, shiftName, buildingName, roomNo, className, students } = pageGroupMap[gKey];

                // Sort students in this page group by roll
                students.sort((a, b) => (parseInt(a.roll) || 0) - (parseInt(b.roll) || 0));

                const studentChunks = [];
                if (students.length === 0) {
                    studentChunks.push([]);
                } else {
                    for (let i = 0; i < students.length; i += ROWS_PER_PAGE_STUDENTS) {
                        studentChunks.push(students.slice(i, i + ROWS_PER_PAGE_STUDENTS));
                    }
                }

                studentChunks.forEach((chunkStudents, chunkIdx) => {
                    // Formatted strings
                    let shiftStrBn = 'বিকাল';
                    let shiftStrEn = 'Afternoon';
                    if (/morning|sokal|সকাল|প্রভাতি/i.test(shiftName)) {
                        shiftStrBn = 'সকাল';
                        shiftStrEn = 'Morning';
                    }

                    let sheetTitleStr = '';
                    if (langVal === 'en') {
                        sheetTitleStr = `Students Attendance Sheet (${shiftStrEn})`;
                    } else if (langVal === 'both') {
                        sheetTitleStr = `পরীক্ষার্থীদের হাজিরা শীট (${shiftStrBn}) / Attendance Sheet (${shiftStrEn})`;
                    } else {
                        sheetTitleStr = `পরীক্ষার্থীদের হাজিরা শীট (${shiftStrBn})`;
                    }

                    const rmNum = (langVal === 'en') ? roomNo : toBnNum(roomNo);
                    let roomBldgDisplay = '';
                    if (langVal === 'en') {
                        roomBldgDisplay = `Room No : ${rmNum} | Building : ${buildingName}`;
                    } else if (langVal === 'both') {
                        roomBldgDisplay = `রুম নং / Room : ${rmNum} | বিল্ডিং / Building : ${buildingName}`;
                    } else {
                        roomBldgDisplay = `রুম নং : ${rmNum} | বিল্ডিং : ${buildingName}`;
                    }

                    const cntNum = (langVal === 'en') ? students.length : toBnNum(students.length);
                    let studentCountDisplay = '';
                    if (langVal === 'en') studentCountDisplay = 'Total Students : ' + cntNum;
                    else if (langVal === 'both') studentCountDisplay = 'পরীক্ষার্থীর সংখ্যা / Total : ' + cntNum;
                    else studentCountDisplay = 'পরীক্ষার্থীর সংখ্যা : ' + cntNum;

                    let classDisplay = '';
                    if (langVal === 'en') classDisplay = 'Class : ' + className;
                    else if (langVal === 'both') classDisplay = 'ক্লাস / Class : ' + className;
                    else classDisplay = 'ক্লাস : ' + className;

                    // Subjects Header
                    const subjects = getRoutineSubjectsForAttendanceSheet(examName, className);
                    const subColsCount = (Array.isArray(subjects) && subjects.length > 0) ? subjects.length : 1;

                    let subThHtml = '';
                    subjects.forEach(sub => {
                        const subCode = sub.shortName || getAttendanceSubjectShortName(sub.name);
                        const displayCode = getAttendanceSubjectHeaderDisplay(subCode, sub.name, langVal);
                        const formattedDate = formatAttendanceRoutineDateForHeader(sub.date);
                        const subDate = formattedDate ? `<span style="display: block; font-size: 11px; font-weight: normal; line-height: 1; margin-top: 2px;">${formattedDate}</span>` : '';
                        subThHtml += `<th style="line-height: 1.15; padding: 2px 1px;">${displayCode}${subDate}</th>`;
                    });

                    const emptySubTds = '<td></td>'.repeat(subColsCount);
                    const blankSubTds = '<td>&nbsp;</td>'.repeat(subColsCount);

                    // Table Rows (Exactly 10 student rows + 2 footer rows + 2 header rows = 14 rows total)
                    let tbodyHtml = '';
                    const startSl = chunkIdx * ROWS_PER_PAGE_STUDENTS;

                    for (let rIdx = 0; rIdx < ROWS_PER_PAGE_STUDENTS; rIdx++) {
                        const st = chunkStudents[rIdx];
                        if (st) {
                            const globalIdx = startSl + rIdx;
                            const slStr = (langVal === 'en') ? (globalIdx + 1) : toBnNum(globalIdx + 1);
                            const stId = st.studentId || st.id || ('2026' + String(st.roll || globalIdx + 1).padStart(4, '0'));
                            
                            let stNameHtml = '';
                            if (langVal === 'both') {
                                const nameBn = st.nameBn || st.name || 'শিক্ষার্থী';
                                const nameEn = (st.name && st.name !== st.nameBn) ? st.name : (st.studentName || '');
                                if (nameEn) {
                                    stNameHtml = `<div style="font-weight: 700; line-height: 1.15;">${nameBn}</div><div style="font-size: 0.85em; color: #334155; font-weight: 600; line-height: 1.1; margin-top: 2px;">${nameEn}</div>`;
                                } else {
                                    stNameHtml = `<div style="font-weight: 700; line-height: 1.15;">${nameBn}</div>`;
                                }
                            } else if (langVal === 'en') {
                                stNameHtml = st.name || st.nameBn || 'Student';
                            } else {
                                stNameHtml = st.nameBn || st.name || 'শিক্ষার্থী';
                            }

                            tbodyHtml += `
                                <tr>
                                    <td>${slStr}</td>
                                    <td>${stId}</td>
                                    <td class="student-name" style="${langVal === 'both' ? 'padding-top: 3px; padding-bottom: 3px;' : ''}">${stNameHtml}</td>
                                    ${emptySubTds}
                                </tr>
                            `;
                        } else {
                            tbodyHtml += `
                                <tr>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td class="student-name">&nbsp;</td>
                                    ${blankSubTds}
                                </tr>
                            `;
                        }
                    }

                    // Footer Signature & Count rows (Rows 10 and 11)
                    let presentLabel = 'উপস্থিত পরীক্ষার্থীর সংখ্যা';
                    let invigLabel = 'ইনভিজিলেটরের স্বাক্ষর';
                    if (langVal === 'en') {
                        presentLabel = 'Present Candidates Count';
                        invigLabel = 'Invigilator Signature';
                    } else if (langVal === 'both') {
                        presentLabel = 'উপস্থিত পরীক্ষার্থীর সংখ্যা / Present Count';
                        invigLabel = 'ইনভিজিলেটরের স্বাক্ষর / Invigilator Signature';
                    }

                    tbodyHtml += `
                        <tr class="present-count-row">
                            <td colspan="3" class="invigilator-label">${presentLabel}</td>
                            ${emptySubTds}
                        </tr>
                        <tr class="invigilator-row">
                            <td colspan="3" class="invigilator-label">${invigLabel}</td>
                            ${emptySubTds}
                        </tr>
                    `;

                    const sigHeaderLabel = (langVal === 'en') ? 'Candidate Signature' : (langVal === 'both' ? 'পরীক্ষার্থীর স্বাক্ষর / Candidate Signature' : 'পরীক্ষার্থীর স্বাক্ষর');
                    const slHeaderLabel = (langVal === 'en') ? 'SL No.' : (langVal === 'both' ? 'ক্র: (SL)' : 'ক্র: নং');
                    const rollHeaderLabel = (langVal === 'en') ? 'Student ID' : (langVal === 'both' ? 'আইডি (ID)' : 'শিক্ষার্থীর আইডি');
                    const nameHeaderLabel = (langVal === 'en') ? 'Candidate Name' : (langVal === 'both' ? 'পরীক্ষার্থীর নাম / Name' : 'পরীক্ষার্থীর নাম');

                    let chunkInfoStr = '';
                    if (studentChunks.length > 1) {
                        const startNum = startSl + 1;
                        const endNum = Math.min(startSl + chunkStudents.length, students.length);
                        chunkInfoStr = ` - ক্র: ${toBnNum(startNum)}-${toBnNum(endNum)}`;
                    }

                    pagesHtml += `
                        <!-- Page Indicator Pill (Screen Preview Only) -->
                        <div class="no-print" style="margin-top: 25px; margin-bottom: 10px; font-weight: 800; font-size: 0.95rem; color: #0284c7; background: #e0f2fe; padding: 6px 20px; border-radius: 20px; border: 1.5px solid #7dd3fc; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15); display: inline-flex; align-items: center; gap: 8px;">
                            <span>📄 পৃষ্ঠা ${pageIdx} (${examName} - ${buildingName} - শ্রেণি ${className} - রুম নং ${roomNo} - ${shiftStrBn} শিফট${chunkInfoStr})</span>
                        </div>

                        <!-- Single Page Attendance Sheet Container -->
                        <div class="container">
                            <div class="header-section">
                                <div class="header-logo-badge" style="position: absolute; left: 0; top: 0; margin-top: -0.03in; transform: translateY(-0.03in); width: 64px; height: 64px; background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 34px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); border: 2.5px solid #0284c7; z-index: 5;">
                                    ${logoHtml}
                                </div>
                                <h1 class="school-name">${schoolName}</h1>
                                <div class="exam-row">
                                    <div class="class-placeholder"></div>
                                    <h2 class="exam-name">${examName}</h2>
                                    <div class="class-name">${classDisplay}</div>
                                </div>
                                <div class="title-row">
                                    <div class="room-no">${roomBldgDisplay}</div>
                                    <h3 class="sheet-title">${sheetTitleStr}</h3>
                                    <div class="student-count">${studentCountDisplay}</div>
                                </div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="col-sl">${slHeaderLabel}</th>
                                        <th rowspan="2" class="col-roll">${rollHeaderLabel}</th>
                                        <th rowspan="2" class="col-name">${nameHeaderLabel}</th>
                                        <th colspan="${subColsCount}" class="sig-header-cell">${sigHeaderLabel}</th>
                                    </tr>
                                    <tr>
                                        ${subThHtml}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tbodyHtml}
                                </tbody>
                            </table>
                        </div>
                    `;

                    pageIdx++;
                });
            });

            pagesContainer.innerHTML = pagesHtml;

            const currentFontSize = document.getElementById('attendance-sheet-font-size-slider')?.value;
            if (currentFontSize) {
                updateAttendanceSheetFontSize(currentFontSize);
            }
        }

        function refreshStudentAttendanceData() {
            populateAttendanceSheetClassFilter();
            populateAttendanceSheetExamFilter();
            populateAttendanceSheetShiftFilter();
            updateAttendanceSheetLive();
        }

        function refreshAttendanceSheetData() {
            refreshStudentAttendanceData();
        }

        function printStudentAttendanceSheet() {
            document.body.classList.add('print-attendance-sheet-mode');
            window.print();
            setTimeout(() => {
                document.body.classList.remove('print-attendance-sheet-mode');
            }, 1000);
        }

        async function downloadStudentAttendancePDF() {
            const container = document.getElementById('attendance-pages-container');
            const pages = container ? container.querySelectorAll('.container') : [];
            if (!container || pages.length === 0) {
                alert('ডাউনলোড করার মতো কোনো তথ্য পাওয়া যায়নি!');
                return;
            }

            if (document.fonts && document.fonts.ready) {
                try { await document.fonts.ready; } catch (e) { }
            }

            const examVal = document.getElementById('attendance-sheet-filter-exam')?.value || 'all';
            const classVal = document.getElementById('attendance-sheet-filter-class')?.value || 'all';
            const safeExamName = (examVal === 'all' ? 'Attendance_Sheet' : examVal).replace(/[^a-zA-Z0-9_ঀ-৿-]/g, '_');
            const safeClassName = (classVal === 'all' ? 'All_Classes' : classVal).replace(/[^a-zA-Z0-9_ঀ-৿-]/g, '_');
            const fileName = `Attendance_Sheet_${safeClassName}_${safeExamName}.pdf`;

            const btn = document.getElementById('attendance-sheet-btn-download-pdf');
            const originalBtnText = btn ? btn.innerHTML : '';
            if (btn) {
                btn.innerHTML = '⏳ পিডিএফ প্রস্তুত হচ্ছে...';
                btn.disabled = true;
            }

            try {
                const JsPDFConstructor = window.jspdf?.jsPDF || window.jsPDF;
                if (JsPDFConstructor && typeof html2canvas !== 'undefined') {
                    const pdf = new JsPDFConstructor({ orientation: 'landscape', unit: 'mm', format: 'legal', compress: true });

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
                            scale: 2, useCORS: true, allowTaint: true, logging: false, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0
                        });

                        pageEl.style.boxShadow = originalBoxShadow;
                        pageEl.style.marginBottom = originalMargin;

                        const imgData = canvas.toDataURL('image/jpeg', 0.95);
                        if (i > 0) {
                            pdf.addPage('legal', 'landscape');
                        }
                        pdf.addImage(imgData, 'JPEG', 0, 0, 355.6, 215.9, undefined, 'FAST');
                    }

                    pdf.save(fileName);
                    if (btn) { btn.innerHTML = originalBtnText; btn.disabled = false; }
                    return;
                }

                if (typeof html2pdf !== 'undefined') {
                    const opt = {
                        margin: 0, filename: fileName, image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, backgroundColor: '#ffffff' },
                        jsPDF: { unit: 'mm', format: 'legal', orientation: 'landscape' },
                        pagebreak: { mode: ['css', 'legacy'] }
                    };
                    await html2pdf().set(opt).from(container).save();
                    if (btn) { btn.innerHTML = originalBtnText; btn.disabled = false; }
                    return;
                }
                throw new Error('PDF Engine not loaded');
            } catch (err) {
                console.error('PDF Generation Error:', err);
                if (btn) { btn.innerHTML = originalBtnText; btn.disabled = false; }
                alert('সরাসরি ব্রাউজার প্রিন্ট ডায়ালগ থেকে "Destination: Save as PDF" সিলেক্ট করে সংরক্ষণ করতে পারেন।');
                printStudentAttendanceSheet();
            }
        }

        window.refreshStudentAttendanceData = refreshStudentAttendanceData;
        window.refreshAttendanceSheetData = refreshStudentAttendanceData;
        window.updateAttendanceSheetLive = updateAttendanceSheetLive;
        window.downloadStudentAttendancePDF = downloadStudentAttendancePDF;
        window.printStudentAttendanceSheet = printStudentAttendanceSheet;

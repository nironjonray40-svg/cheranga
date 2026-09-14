
// BLOCK 1

        const ALL_MONTHS = [
            "জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল", "মে", "জুন",
            "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
        ];

        // Class-based Monthly Tuition Fee Mapping
        const CLASS_TUITION = {
            "Six": 10,
            "Seven": 20,
            "Eight": 30,
            "Nine": 40,
            "Ten": 50
        };

        const CLASS_NAMES_BN = {
            "Play": "Class : Play",
            "Nursery": "Class : Nursery",
            "KG": "Class : KG",
            "Class 1": "Class : One",
            "Class 2": "Class : Two",
            "Class 3": "Class : Three",
            "Class 4": "Class : Four",
            "Class 5": "Class : Five",
            "Six": "Class : Six",
            "Seven": "Class : Seven",
            "Eight": "Class : Eight",
            "Nine": "Class : Nine",
            "Ten": "Class : Ten"
        };

        const CLASS_ORDER = {
            "Play": 0,
            "Nursery": 1,
            "KG": 2,
            "Class 1": 3,
            "Class 2": 4,
            "Class 3": 5,
            "Class 4": 6,
            "Class 5": 7,
            "Six": 8,
            "Seven": 9,
            "Eight": 10,
            "Nine": 11,
            "Ten": 12
        };

        function formatClassName(rawClass) {
            if (!rawClass) return 'Ten';
            const s = rawClass.toString().trim();
            if (s.includes('Play') || s.includes('প্লে')) return 'Play';
            if (s.includes('Nursery') || s.includes('নার্সারি')) return 'Nursery';
            if (s.includes('KG') || s.includes('কেজি')) return 'KG';
            if (s.includes('10') || s.toLowerCase() === 'ten' || s.includes('১০')) return 'Ten';
            if (s.includes('9') || s.toLowerCase() === 'nine' || s.includes('৯')) return 'Nine';
            if (s.includes('8') || s.toLowerCase() === 'eight' || s.includes('৮')) return 'Eight';
            if (s.includes('7') || s.toLowerCase() === 'seven' || s.includes('৭')) return 'Seven';
            if (s.includes('6') || s.toLowerCase() === 'six' || s.includes('৬')) return 'Six';
            if (s.includes('5') || s.toLowerCase() === 'five' || s.includes('৫')) return 'Five';
            if (s.includes('4') || s.toLowerCase() === 'four' || s.includes('৪')) return 'Four';
            if (s.includes('3') || s.toLowerCase() === 'three' || s.includes('৩')) return 'Three';
            if (s.includes('2') || s.toLowerCase() === 'two' || s.includes('২')) return 'Two';
            return s.replace(/^Class\s*:\s*/i, '');
        }

        function getClassNumericCode(className) {
            const norm = String(className || '').trim().toLowerCase();
            if (norm.includes('twelve') || norm.includes('দ্বাদশ') || norm === '12') return '12';
            if (norm.includes('eleven') || norm.includes('একাদশ') || norm === '11') return '11';
            if (norm.includes('ten') || norm.includes('দশম') || norm === '10') return '10';
            if (norm.includes('nine') || norm.includes('নবম') || norm === '9') return '09';
            if (norm.includes('eight') || norm.includes('অষ্টম') || norm === '8') return '08';
            if (norm.includes('seven') || norm.includes('সপ্তম') || norm === '7') return '07';
            if (norm.includes('six') || norm.includes('ষষ্ঠ') || norm === '6') return '06';
            if (norm.includes('five') || norm.includes('পঞ্চম') || norm === '5') return '05';
            if (norm.includes('four') || norm.includes('চতুর্থ') || norm === '4') return '04';
            if (norm.includes('three') || norm.includes('তৃতীয়') || norm.includes('তৃতীয়') || norm === '3') return '03';
            if (norm.includes('two') || norm.includes('দ্বিতীয়') || norm.includes('দ্বিতীয়') || norm === '2') return '02';
            if (norm.includes('one') || norm.includes('প্রথম') || norm === '1') return '01';
            if (norm.includes('nursery') || norm.includes('নার্সারি')) return '12';
            if (norm.includes('play') || norm.includes('প্লে')) return '11';
            if (norm.includes('kg') || norm.includes('কেজি')) return '00';
            const digits = norm.replace(/\D/g, '');
            if (digits) return digits.padStart(2, '0');
            return '00';
        }

        // Read configured ID & Registration prefix settings from Advance page
        function getIdRegPrefix(className) {
            let settings = {};
            try {
                const stored = localStorage.getItem('school_id_reg_settings');
                if (stored) settings = JSON.parse(stored);
            } catch (e) { }
            let prefix = null;

            try {
                const classPrefixes = JSON.parse(localStorage.getItem('school_class_id_prefixes') || '[]');
                const code = getClassNumericCode(className);
                if (Array.isArray(classPrefixes)) {
                    let found = classPrefixes.find(p => p && p.class === className);
                    if (!found) {
                        found = classPrefixes.find(p => p && getClassNumericCode(p.class) === code);
                    }
                    if (found && typeof found.prefix === 'string') {
                        prefix = found.prefix;
                    }
                } else if (classPrefixes && typeof classPrefixes[className] === 'string') {
                    prefix = classPrefixes[className];
                }
            } catch (e) { }

            if (prefix === null) {
                const code = getClassNumericCode(className);
                const globalPfx = (settings.idPrefix !== undefined && settings.idPrefix !== null && settings.idPrefix !== '') ? settings.idPrefix : '26';
                prefix = `${globalPfx}${code}`;
            }

            return prefix;
        }

        // Read configured Registration prefix settings from Advance page
        function getClassRegPrefix(className) {
            let prefix = null;
            try {
                const classRegPrefixes = JSON.parse(localStorage.getItem('school_class_reg_prefixes') || '[]');
                const code = getClassNumericCode(className);
                if (Array.isArray(classRegPrefixes)) {
                    let found = classRegPrefixes.find(p => p && p.class === className);
                    if (!found) found = classRegPrefixes.find(p => p && getClassNumericCode(p.class) === code);
                    if (found && typeof found.prefix === 'string' && found.prefix.trim()) prefix = found.prefix.trim();
                }
            } catch (e) { }

            if (prefix === null) {
                try {
                    const classPrefixes = JSON.parse(localStorage.getItem('school_class_id_prefixes') || '[]');
                    const code = getClassNumericCode(className);
                    if (Array.isArray(classPrefixes)) {
                        let found = classPrefixes.find(p => p && p.class === className);
                        if (!found) found = classPrefixes.find(p => p && getClassNumericCode(p.class) === code);
                        if (found && typeof found.regPrefix === 'string' && found.regPrefix.trim()) prefix = found.regPrefix.trim();
                    }
                } catch (e) { }
            }

            if (prefix === null) {
                let settings = {};
                try {
                    const stored = localStorage.getItem('school_id_reg_settings');
                    if (stored) settings = JSON.parse(stored);
                } catch (e) { }
                const code = getClassNumericCode(className);
                const globalReg = (settings.regPrefix !== undefined && settings.regPrefix !== null && settings.regPrefix !== '') ? settings.regPrefix.replace(/[^0-9a-zA-Z-]/g, '') : new Date().getFullYear().toString();
                prefix = `${globalReg}${code}`;
            }

            return prefix;
        }

        // Format Student ID following Advance settings
        function formatStudentId(student) {
            if (!student) return '';
            if (student.studentId && student.studentId.trim()) return student.studentId.trim();

            const rawClass = student.class || student.studentClass || 'Ten';
            const prefix = getIdRegPrefix(rawClass);
            const rollNum = (student.roll || student.id || '1').toString().replace(/\D/g, '');
            const serialStr = String(rollNum || '1').padStart(3, '0');

            if (student.roll && (student.roll.startsWith(prefix) || student.roll.includes('-'))) {
                return student.roll;
            }
            return `${prefix}${serialStr}`;
        }

        function loadStudentsFromPortal() {
            const stored = localStorage.getItem('school_students');
            let settings = {};
            try {
                const s = localStorage.getItem('school_id_reg_settings');
                if (s) settings = JSON.parse(s);
            } catch (e) { }
            const defaultPrefix = settings.idPrefix || 'CMS-';

            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.map(s => {
                            const sid = formatStudentId(s);
                            const sClass = s.class || s.studentClass || 'Ten';
                            const sName = (s.nameBn && s.nameBn.trim()) ? s.nameBn.trim() : ((s.name && s.name.trim()) ? s.name.trim() : 'শিক্ষার্থী');
                            return {
                                ...s,
                                roll: sid,
                                studentId: sid,
                                name: sName,
                                studentClass: getClassKey(sClass),
                                rawClass: sClass
                            };
                        });
                    }
                } catch (e) {
                    console.error("Error parsing school_students:", e);
                }
            }
            return [
                { roll: `${defaultPrefix}101`, studentId: `${defaultPrefix}101`, name: "রাশেদ করিম", studentClass: "Ten", rawClass: "Class 10" },
                { roll: `${defaultPrefix}102`, studentId: `${defaultPrefix}102`, name: "তানজিম আহমেদ", studentClass: "Nine", rawClass: "Class 9" },
                { roll: `${defaultPrefix}103`, studentId: `${defaultPrefix}103`, name: "নুসাইবা নাহার", studentClass: "Eight", rawClass: "Class 8" },
                { roll: `${defaultPrefix}104`, studentId: `${defaultPrefix}104`, name: "সাকিব হাসান", studentClass: "Six", rawClass: "Class 6" },
                { roll: `${defaultPrefix}105`, studentId: `${defaultPrefix}105`, name: "আরিফ হোসেন", studentClass: "Seven", rawClass: "Class 7" }
            ];
        }

        let students = loadStudentsFromPortal();

        window.addEventListener('storage', (e) => {
            if (e.key === 'school_students' || e.key === 'school_id_reg_settings' || e.key === 'school_class_id_prefixes') {
                students = loadStudentsFromPortal();
                renderStudentList();
                renderTransactionTable();
            }
        });

        // Payment records structure: [{ roll, name, studentClass, feeType, month, amount, date, status }]
        let payments = JSON.parse(localStorage.getItem('school_payments')) || [
            { roll: "101", name: "রাশেদ করিম", studentClass: "Ten", feeType: "ভর্তি ফি", month: "জানুয়ারী", amount: 100, date: "2026-01-05", status: "পরিশোধিত" },
            { roll: "101", name: "রাশেদ করিম", studentClass: "Ten", feeType: "সেশন ফি", month: "জানুয়ারী", amount: 50, date: "2026-01-05", status: "পরিশোধিত" },
            { roll: "101", name: "রাশেদ করিম", studentClass: "Ten", feeType: "অন্যান্য ফি", month: "জানুয়ারী", amount: 10, date: "2026-01-05", status: "পরিশোধিত" },
            { roll: "101", name: "রাশেদ করিম", studentClass: "Ten", feeType: "মাসিক বেতন", month: "জানুয়ারী", amount: 50, date: "2026-01-10", status: "পরিশোধিত" },
            { roll: "101", name: "রাশেদ করিম", studentClass: "Ten", feeType: "মাসিক বেতন", month: "ফেব্রুয়ারী", amount: 50, date: "2026-02-08", status: "পরিশোধিত" },
            { roll: "102", name: "তানজিম আহমেদ", studentClass: "Nine", feeType: "ভর্তি ফি", month: "জানুয়ারী", amount: 100, date: "2026-01-06", status: "পরিশোধিত" },
            { roll: "102", name: "তানজিম আহমেদ", studentClass: "Nine", feeType: "মাসিক বেতন", month: "জানুয়ারী", amount: 40, date: "2026-01-12", status: "পরিশোধিত" },
            { roll: "105", name: "আরিফ হোসেন", studentClass: "Seven", feeType: "ভর্তি ফি", month: "জানুয়ারী", amount: 100, date: "2026-01-08", status: "পরিশোধিত" },
            { roll: "105", name: "আরিফ হোসেন", studentClass: "Seven", feeType: "মাসিক বেতন", month: "জানুয়ারী", amount: 20, date: "2026-01-15", status: "পরিশোধিত" }
        ];

        let currentSelectedRoll = null;

        // Set today's date and current month in form by default
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('payDate').valueAsDate = new Date();
            const currentMonthName = ALL_MONTHS[new Date().getMonth()];
            const monthSelect = document.getElementById('month');
            if (monthSelect && currentMonthName) {
                monthSelect.value = currentMonthName;
            }
            renderStudentList();
            renderTransactionTable();
            updateSummaryTotals();
        });

        // Save Data to LocalStorage
        function saveDataToStorage() {
            localStorage.setItem('school_students', JSON.stringify(students));
            localStorage.setItem('school_payments', JSON.stringify(payments));
        }

        // Bengali Number Converter for Amounts/Amounts display
        function toBengaliNumber(num) {
            if (num === null || num === undefined) return '';
            const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            return num.toString().replace(/\d/g, d => bnDigits[d]);
        }

        // English Number Converter for Student IDs
        function toEnglishNumber(str) {
            if (str === null || str === undefined) return '';
            const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            return str.toString().replace(/[০-৯]/g, d => bnDigits.indexOf(d));
        }

        // Helper to get formatted Student ID from Student Portal data
        function getStudentDisplayId(s) {
            if (!s) return '';
            return (s.studentId || s.roll || s.id || '').toString();
        }

        // Calculate and Update Summary Totals (চলতি মাসের আদায় & বকেয়া মাসের আদায়)
        function updateSummaryTotals() {
            const selectedMonth = document.getElementById('month').value;
            const currentMonthName = selectedMonth || ALL_MONTHS[new Date().getMonth()] || 'জানুয়ারী';

            let currentTotal = 0;
            let dueTotal = 0;

            payments.forEach(p => {
                const amt = Number(p.amount) || 0;
                if (p.month === currentMonthName) {
                    currentTotal += amt;
                } else {
                    dueTotal += amt;
                }
            });

            const currentElem = document.getElementById('currentMonthTotal');
            const dueElem = document.getElementById('dueMonthTotal');
            const labelElem = document.getElementById('currentMonthLabel');

            if (currentElem) currentElem.innerText = `৳ ${toBengaliNumber(currentTotal)}`;
            if (dueElem) dueElem.innerText = `৳ ${toBengaliNumber(dueTotal)}`;
            if (labelElem) {
                labelElem.innerText = selectedMonth ? `${selectedMonth} এর আদায়:` : 'চলতি মাসের আদায়:';
            }
        }

        // Render Dynamic Fee Checkboxes inside "আদায়কৃত টাকা (৳):" Box
        function renderFeeCheckboxes() {
            const month = document.getElementById('month').value;
            const studentClass = document.getElementById('studentClass').value || 'Ten';
            const roll = document.getElementById('rollNo').value.trim();

            updateSummaryTotals();

            const container = document.getElementById('feeCheckboxesContainer');
            container.innerHTML = '';

            if (!month) {
                container.innerHTML = `<div style="color: var(--text-muted); font-size: 14px; grid-column: 1/-1;">মাসের নাম নির্বাচন করলে উক্ত মাসের ফি গুলো টিক বক্স সহ দৃশ্যমান হবে।</div>`;
                document.getElementById('totalSelectedAmount').innerText = 'সর্বমোট আদায়: ৳ ০';
                return;
            }

            const tuitionFee = CLASS_TUITION[studentClass] || 50;

            // Existing payments for this student & month
            const studentMonthPayments = payments.filter(p => p.roll === roll && p.month === month);

            let feeItemsToDisplay = [];

            // 1. Monthly Tuition Fee (always applicable)
            feeItemsToDisplay.push({ type: 'মাসিক বেতন', amount: tuitionFee });

            // 2. January Only Fees: Admission Fee, Session Fee, and Other Fee (১০ ৳)
            if (month === 'জানুয়ারী') {
                feeItemsToDisplay.push({ type: 'ভর্তি ফি', amount: 100 });
                feeItemsToDisplay.push({ type: 'সেশন ফি', amount: 50 });
                feeItemsToDisplay.push({ type: 'অন্যান্য ফি', amount: 10 });
            }

            feeItemsToDisplay.forEach(item => {
                const isAlreadyPaid = studentMonthPayments.some(p => p.feeType === item.type);
                const titleText = `${item.type}: ${toBengaliNumber(item.amount)}`;

                const label = document.createElement('label');
                label.className = 'fee-checkbox-item';
                if (isAlreadyPaid) {
                    label.style.borderColor = 'var(--success)';
                    label.style.background = 'var(--success-bg)';
                }

                label.innerHTML = `
                <input type="checkbox" name="selectedFees" value="${item.type}" data-amount="${item.amount}" ${isAlreadyPaid ? 'disabled checked' : 'checked'} onchange="calculateSelectedTotal()">
                <div class="fee-info">
                    <span class="fee-title">${titleText} ${isAlreadyPaid ? '<span style="color:#047857; font-size:11px; font-weight:700;">(পরিশোধিত)</span>' : ''}</span>
                    <span class="fee-amount">৳ ${toBengaliNumber(item.amount)}</span>
                </div>
            `;
                container.appendChild(label);
            });

            calculateSelectedTotal();
        }

        // Calculate sum of selected checkboxes in real-time
        function calculateSelectedTotal() {
            const checkboxes = document.querySelectorAll('input[name="selectedFees"]:checked');
            let total = 0;
            checkboxes.forEach(cb => {
                if (!cb.disabled) {
                    total += Number(cb.getAttribute('data-amount') || 0);
                }
            });
            document.getElementById('totalSelectedAmount').innerText = `সর্বমোট আদায়: ৳ ${total.toLocaleString('bn-BD')}`;
        }

        // Helper to update active class highlight in student list without re-rendering full list
        function updateStudentListActiveState() {
            const items = document.querySelectorAll('#studentListContainer .student-item');
            items.forEach(item => {
                if (item.getAttribute('data-roll') === currentSelectedRoll) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        // Render Left Student List (Poll-proof against background DB syncs)
        function renderStudentList(filteredList = undefined) {
            const searchInput = document.getElementById('leftSearchInput');
            const activeQuery = searchInput ? searchInput.value.trim() : '';

            let list;
            if (filteredList !== undefined && filteredList !== null) {
                list = filteredList;
            } else if (activeQuery !== '') {
                // Re-apply active search query if called without arguments (e.g. from main.js polling interval or dbSynced)
                const queryClean = activeQuery.toLowerCase();
                const queryEng = toEnglishNumber(activeQuery).toLowerCase();
                const queryBn = toBengaliNumber(activeQuery).toLowerCase();

                const exact = students.filter(s => {
                    const displayId = getStudentDisplayId(s).toLowerCase();
                    const displayIdEng = toEnglishNumber(displayId).toLowerCase();
                    const displayIdBn = toBengaliNumber(displayId).toLowerCase();
                    const sid = (s.studentId || '').toString().toLowerCase();
                    const sidEng = toEnglishNumber(sid).toLowerCase();
                    const sidBn = toBengaliNumber(sid).toLowerCase();
                    const roll = (s.roll || '').toString().toLowerCase();
                    const rollEng = toEnglishNumber(roll).toLowerCase();
                    const rollBn = toBengaliNumber(roll).toLowerCase();

                    return displayId === queryClean || displayIdEng === queryEng || displayIdBn === queryBn ||
                        sid === queryClean || sidEng === queryEng || sidBn === queryBn ||
                        roll === queryClean || rollEng === queryEng || rollBn === queryBn;
                });

                if (exact.length > 0) {
                    list = exact;
                } else {
                    list = students.filter(s => {
                        const displayId = getStudentDisplayId(s).toLowerCase();
                        const displayIdEng = toEnglishNumber(displayId).toLowerCase();
                        const displayIdBn = toBengaliNumber(displayId).toLowerCase();
                        const sid = (s.studentId || '').toString().toLowerCase();
                        const sidEng = toEnglishNumber(sid).toLowerCase();
                        const sName = (s.name || s.nameBn || '').toLowerCase();

                        return displayId.includes(queryClean) || displayIdEng.includes(queryEng) || displayIdBn.includes(queryBn) ||
                            sid.includes(queryClean) || sidEng.includes(queryEng) ||
                            sName.includes(queryClean);
                    });
                }
            } else {
                list = students;
            }

            const container = document.getElementById('studentListContainer');
            if (!container) return;
            container.innerHTML = '';

            const badge = document.getElementById('studentTotalBadge');
            if (badge) badge.innerText = `${toBengaliNumber(list.length)} জন`;

            if (list.length === 0) {
                container.innerHTML = `<div class="empty-state">কোনো শিক্ষার্থী পাওয়া যায়নি</div>`;
                return;
            }

            // Sort by Class (৬ষ্ঠ -> ১০ম) and then by Student ID
            const sortedList = [...list].sort((a, b) => {
                const classA = (typeof CLASS_ORDER !== 'undefined' && CLASS_ORDER[a.studentClass] !== undefined) ? CLASS_ORDER[a.studentClass] : 99;
                const classB = (typeof CLASS_ORDER !== 'undefined' && CLASS_ORDER[b.studentClass] !== undefined) ? CLASS_ORDER[b.studentClass] : 99;
                if (classA !== classB) return classA - classB;
                const rollA = parseInt((a.roll || '').toString().replace(/\D/g, ''), 10) || 0;
                const rollB = parseInt((b.roll || '').toString().replace(/\D/g, ''), 10) || 0;
                return rollA - rollB;
            });

            sortedList.forEach(student => {
                const displayId = getStudentDisplayId(student);
                const isActive = displayId === currentSelectedRoll ? 'active' : '';
                const classLabel = formatClassName(student.rawClass || student.studentClass || student.class);

                const li = document.createElement('li');
                li.className = `student-item ${isActive}`;
                li.setAttribute('data-roll', displayId);
                li.onclick = () => selectStudent(displayId);

                li.innerHTML = `
                <div class="student-info">
                    <div class="name">${student.name}</div>
                    <div class="roll">Student ID: ${displayId} | Class : ${classLabel}</div>
                </div>
            `;
                container.appendChild(li);
            });
        }

        // Filter Student List in Left Panel
        function filterStudentList() {
            const rawQuery = document.getElementById('leftSearchInput').value.trim();
            if (!rawQuery) {
                renderStudentList(students);
                return;
            }

            const queryClean = rawQuery.toLowerCase();
            const queryEng = toEnglishNumber(rawQuery).toLowerCase();
            const queryBn = toBengaliNumber(rawQuery).toLowerCase();

            // 1. Check for Exact Match by Student ID, Roll Number, or Reg Number
            const exactMatches = students.filter(s => {
                const displayId = getStudentDisplayId(s).toLowerCase();
                const displayIdEng = toEnglishNumber(displayId).toLowerCase();
                const displayIdBn = toBengaliNumber(displayId).toLowerCase();
                const sid = (s.studentId || '').toString().toLowerCase();
                const sidEng = toEnglishNumber(sid).toLowerCase();
                const sidBn = toBengaliNumber(sid).toLowerCase();
                const roll = (s.roll || '').toString().toLowerCase();
                const rollEng = toEnglishNumber(roll).toLowerCase();
                const rollBn = toBengaliNumber(roll).toLowerCase();

                return displayId === queryClean || displayIdEng === queryEng || displayIdBn === queryBn ||
                    sid === queryClean || sidEng === queryEng || sidBn === queryBn ||
                    roll === queryClean || rollEng === queryEng || rollBn === queryBn;
            });

            if (exactMatches.length > 0) {
                // Render ONLY the exact matching student(s) - all other students invisible
                renderStudentList(exactMatches);
                selectStudent(getStudentDisplayId(exactMatches[0]));
                return;
            }

            // 2. Partial Search: Match Student ID or Name
            const filtered = students.filter(s => {
                const displayId = getStudentDisplayId(s).toLowerCase();
                const displayIdEng = toEnglishNumber(displayId).toLowerCase();
                const displayIdBn = toBengaliNumber(displayId).toLowerCase();
                const sid = (s.studentId || '').toString().toLowerCase();
                const sidEng = toEnglishNumber(sid).toLowerCase();
                const sName = (s.name || s.nameBn || '').toLowerCase();

                return displayId.includes(queryClean) || displayIdEng.includes(queryEng) || displayIdBn.includes(queryBn) ||
                    sid.includes(queryClean) || sidEng.includes(queryEng) ||
                    sName.includes(queryClean);
            });

            // Render ONLY the filtered students - all other non-matching students invisible
            renderStudentList(filtered);

            if (filtered.length === 1) {
                selectStudent(getStudentDisplayId(filtered[0]));
            }
        }

        // Select Student from Left Panel or Search
        function selectStudent(rollOrId, updateRollInput = true) {
            if (!rollOrId) return;

            const student = students.find(s => {
                const sid = getStudentDisplayId(s);
                return s.roll === rollOrId ||
                    s.studentId === rollOrId ||
                    s.id === rollOrId ||
                    sid.toLowerCase() === rollOrId.toString().toLowerCase();
            });
            if (!student) return;

            const displayId = getStudentDisplayId(student);
            currentSelectedRoll = displayId;

            // Auto populate form with exact Student List data
            if (updateRollInput) {
                document.getElementById('rollNo').value = displayId;
            }
            document.getElementById('studentName').value = student.name;
            const classSelect = document.getElementById('studentClass');
            if (classSelect) {
                const targetClass = student.studentClass || getClassKey(student.rawClass || student.class);
                classSelect.value = targetClass;
            }

            // Set current month in 'মাসের নাম:' dropdown by default
            const monthSelect = document.getElementById('month');
            if (monthSelect && (!monthSelect.value || monthSelect.value === '')) {
                monthSelect.value = ALL_MONTHS[new Date().getMonth()];
            }

            // Update left panel highlights without clearing filtered list
            updateStudentListActiveState();

            // Update right panel 12-month ledger
            renderRightLedger(student);

            // Update fee checkboxes
            renderFeeCheckboxes();
        }

        // Triggered when Roll Input Changes or Search button clicked (Auto-Search on Typing / Click)
        function onRollInputChange(isButtonClick = false) {
            let rollInput = document.getElementById('rollNo').value.trim();
            const monthSelect = document.getElementById('month');

            if (!rollInput) {
                currentSelectedRoll = null;
                document.getElementById('studentName').value = '';
                document.getElementById('summaryStudentName').innerText = 'কোনো শিক্ষার্থী নির্বাচিত হয়নি';
                document.getElementById('summaryStudentRoll').innerText = 'Student ID দিয়ে সার্চ করুন বা বামপাশ থেকে নির্বাচন করুন';
                document.getElementById('feeCheckboxesContainer').innerHTML = `<div style="color: var(--text-muted); font-size: 14px; grid-column: 1/-1;">মাসের নাম নির্বাচন করলে উক্ত মাসের ফি গুলো টিক বক্স সহ দৃশ্যমান হবে।</div>`;
                document.getElementById('totalSelectedAmount').innerText = 'সর্বমোট আদায়: ৳ ০';
                document.getElementById('monthsContainer').innerHTML = `<div class="empty-state">শিক্ষার্থীর Student ID দিয়ে সার্চ করলে অথবা বামপাশের তালিকা থেকে নির্বাচন করলে ১২ মাসের ফি স্টেটাস এখানে দেখাবে।</div>`;
                return;
            }

            // Always ensure a month is selected by default if unselected
            if (monthSelect && (!monthSelect.value || monthSelect.value === '')) {
                monthSelect.value = ALL_MONTHS[new Date().getMonth()];
            }

            const inputClean = rollInput.toLowerCase().trim();
            const inputEng = toEnglishNumber(rollInput).toLowerCase().trim();
            const inputBn = toBengaliNumber(rollInput).toLowerCase().trim();

            // Match student flexibly by ID, Roll, RegNo, Name, etc.
            const matchedStudent = students.find(s => {
                const sid = getStudentDisplayId(s).toLowerCase().trim();
                const sidEng = toEnglishNumber(sid).toLowerCase().trim();
                const sidBn = toBengaliNumber(sid).toLowerCase().trim();

                const sRoll = (s.roll || '').toString().toLowerCase().trim();
                const sRollEng = toEnglishNumber(sRoll).toLowerCase().trim();
                const sRollBn = toBengaliNumber(sRoll).toLowerCase().trim();

                const sStudentId = (s.studentId || '').toString().toLowerCase().trim();
                const sStudentIdEng = toEnglishNumber(sStudentId).toLowerCase().trim();
                const sStudentIdBn = toBengaliNumber(sStudentId).toLowerCase().trim();

                const sReg = (s.regNo || '').toString().toLowerCase().trim();
                const sId = (s.id || '').toString().toLowerCase().trim();
                const sName = (s.name || s.nameBn || '').toLowerCase().trim();

                return sid === inputClean || sidEng === inputEng || sidBn === inputBn ||
                    sid.includes(inputClean) || sidEng.includes(inputEng) || sidBn.includes(inputBn) ||
                    sStudentId === inputClean || sStudentIdEng === inputEng || sStudentIdBn === inputBn ||
                    sRoll === inputClean || sRollEng === inputEng || sRollBn === inputBn ||
                    sReg === inputClean || sId === inputClean || sName.includes(inputClean);
            });

            if (matchedStudent) {
                selectStudent(getStudentDisplayId(matchedStudent), isButtonClick);
            } else {
                // Unmatched ID
                currentSelectedRoll = null;
                document.getElementById('studentName').value = '';
                document.getElementById('summaryStudentName').innerText = 'ভুল Student ID';
                document.getElementById('summaryStudentRoll').innerText = `Student ID: ${rollInput}`;
                document.getElementById('feeCheckboxesContainer').innerHTML = `<div style="color: #ef4444; font-size: 14px; grid-column: 1/-1; font-weight: 600;">ভুল Student ID - কোনো ফি তথ্য পাওয়া যায়নি</div>`;
                document.getElementById('totalSelectedAmount').innerText = 'সর্বমোট আদায়: ৳ ০';
                document.getElementById('monthsContainer').innerHTML = `<div class="empty-state" style="font-size: 18px; font-weight: 700; color: #ef4444; padding: 60px 15px;">No Data</div>`;
            }
        }

        // Render Center Transaction Table (Sorted by Class & Student ID & Filtered by Search)
        function renderTransactionTable() {
            updateSummaryTotals();
            filterTransactionTable();
        }

        // Save Data to localStorage
        function saveDataToStorage() {
            localStorage.setItem('school_payments', JSON.stringify(payments));
            localStorage.setItem('school_students', JSON.stringify(students));
        }

        let editingPaymentId = null;

        // Edit Payment Entry
        function editPayment(payId) {
            const p = payments.find(rec => rec.id === payId);
            if (!p) return;

            editingPaymentId = payId;

            // Auto select student and populate form
            selectStudent(p.roll, true);

            if (p.month) {
                const mSelect = document.getElementById('month');
                if (mSelect) mSelect.value = p.month;
            }
            if (p.date) {
                const dInput = document.getElementById('payDate');
                if (dInput) dInput.value = p.date;
            }

            renderFeeCheckboxes();

            const submitBtn = document.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.innerHTML = `<span>✏️</span> পেমেন্ট আপডেট করুন ও সংরক্ষণ করুন`;
                submitBtn.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
            }

            document.getElementById('feeForm')?.scrollIntoView({ behavior: 'smooth' });
        }

        // Delete Payment Entry
        function deletePayment(payId) {
            const pIndex = payments.findIndex(rec => rec.id === payId);
            if (pIndex === -1) return;

            const p = payments[pIndex];
            const studentName = p.name || p.roll || 'শিক্ষার্থী';
            const feeInfo = `${p.feeType || 'ফি'} (${p.month || ''} - ৳ ${toBengaliNumber(p.amount)})`;

            if (confirm(`আপনি কি নিশ্চিত যে "${studentName}" এর ${feeInfo} জমার এন্ট্রিটি মুছে ফেলতে চান?`)) {
                payments.splice(pIndex, 1);
                saveDataToStorage();

                renderTransactionTable();

                if (currentSelectedRoll) {
                    const s = students.find(st => getStudentDisplayId(st) === currentSelectedRoll);
                    if (s) {
                        renderRightLedger(s);
                        renderFeeCheckboxes();
                    }
                }
            }
        }

        // Filter Transaction Table by Student ID or Name
        function filterTransactionTable() {
            const query = (document.getElementById('tableSearchInput')?.value || '').trim().toLowerCase();
            const tbody = document.getElementById('dataTableBody');
            tbody.innerHTML = '';

            if (payments.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-muted);">কোনো জমা রেকর্ড পাওয়া যায়নি</td></tr>`;
                return;
            }

            // Sort by Class (৬ষ্ঠ -> ১০ম) and then by Student ID
            const sortedPayments = [...payments].sort((a, b) => {
                const classA = CLASS_ORDER[a.studentClass] || 99;
                const classB = CLASS_ORDER[b.studentClass] || 99;
                if (classA !== classB) return classA - classB;

                const rollA = parseInt((a.roll || '').toString().replace(/\D/g, ''), 10) || 0;
                const rollB = parseInt((b.roll || '').toString().replace(/\D/g, ''), 10) || 0;
                if (rollA !== rollB) return rollA - rollB;

                return ALL_MONTHS.indexOf(a.month) - ALL_MONTHS.indexOf(b.month);
            });

            const filteredPayments = sortedPayments.filter(p => {
                if (!query) return true;
                const rollStr = (p.roll || '').toString().toLowerCase();
                const rollEng = toEnglishNumber(p.roll || '').toLowerCase();
                const nameStr = (p.name || '').toLowerCase();
                return rollStr.includes(query) || rollEng.includes(query) || nameStr.includes(query);
            });

            if (filteredPayments.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-muted);">কোনো রেকর্ড পাওয়া যায়নি</td></tr>`;
                return;
            }

            filteredPayments.forEach(p => {
                if (!p.id) p.id = 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
                const matchedStudent = students.find(s => s.roll === p.roll || s.studentId === p.roll || s.id === p.roll);
                const displayId = matchedStudent ? getStudentDisplayId(matchedStudent) : (p.roll || '');
                const tr = document.createElement('tr');
                const statusClass = p.status === 'পরিশোধিত' ? 'paid' : 'partial';
                const classLabel = formatClassName(matchedStudent ? (matchedStudent.rawClass || matchedStudent.studentClass || matchedStudent.class) : (p.rawClass || p.studentClass || p.class));
                tr.innerHTML = `
                <td><strong>${displayId}</strong></td>
                <td>${matchedStudent ? matchedStudent.name : p.name}</td>
                <td>${classLabel}</td>
                <td>${p.feeType || 'মাসিক বেতন'}</td>
                <td>${p.month}</td>
                <td>৳ ${toBengaliNumber(p.amount)}</td>
                <td>${p.date}</td>
                <td><span class="status-badge ${statusClass}">${p.status}</span></td>
                <td style="text-align: center;">
                    <div style="display: flex; justify-content: center; gap: 4px;">
                        <button type="button" onclick="editPayment('${p.id}')" title="সম্পাদনা / আপডেট করুন" style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; padding: 3px 7px; border-radius: 5px; font-size: 11px; cursor: pointer; font-family: inherit; font-weight: 600; display: inline-flex; align-items: center; gap: 2px;">
                            ✏️ আপডেট
                        </button>
                        <button type="button" onclick="deletePayment('${p.id}')" title="রেকর্ড মুছে ফেলুন" style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 3px 7px; border-radius: 5px; font-size: 11px; cursor: pointer; font-family: inherit; font-weight: 600; display: inline-flex; align-items: center; gap: 2px;">
                            🗑️ মুছুন
                        </button>
                    </div>
                </td>
            `;
                tbody.appendChild(tr);
            });
        }

        // Render Right Panel 12-Month Fee Ledger for Selected Student
        function renderRightLedger(student) {
            const displayId = getStudentDisplayId(student);
            const classLabel = formatClassName(student.rawClass || student.studentClass || student.class);
            document.getElementById('summaryStudentName').innerText = student.name;
            document.getElementById('summaryStudentRoll').innerText = `Student ID: ${displayId} | ${classLabel}`;

            const container = document.getElementById('monthsContainer');
            container.innerHTML = '';

            const studentPayments = payments.filter(p => p.roll === student.roll || p.roll === displayId || p.roll === student.studentId);
            const tuitionFee = CLASS_TUITION[student.studentClass] || 50;

            ALL_MONTHS.forEach(monthName => {
                const monthCard = document.createElement('div');
                monthCard.className = 'month-card';

                const monthPayments = studentPayments.filter(p => p.month === monthName);
                let monthTotalAmount = 0;

                let feeItemsHTML = '';

                // Default Fee Types for January vs Other Months
                const defaultFeeTypes = monthName === "জানুয়ারী"
                    ? [
                        { type: "মাসিক বেতন", amount: tuitionFee },
                        { type: "ভর্তি ফি", amount: 100 },
                        { type: "সেশন ফি", amount: 50 },
                        { type: "অন্যান্য ফি", amount: 10 }
                    ]
                    : [
                        { type: "মাসিক বেতন", amount: tuitionFee }
                    ];

                defaultFeeTypes.forEach(fObj => {
                    const fType = fObj.type;
                    const payRecord = monthPayments.find(p => p.feeType === fType);
                    const labelText = `${fType}: ${toBengaliNumber(fObj.amount)}`;

                    if (payRecord) {
                        monthTotalAmount += Number(payRecord.amount);
                        feeItemsHTML += `
                        <div class="fee-item">
                            <span class="fee-label">${labelText}</span>
                            <span class="fee-status paid">✓ Paid (৳ ${toBengaliNumber(payRecord.amount)})</span>
                        </div>
                    `;
                    } else {
                        feeItemsHTML += `
                        <div class="fee-item">
                            <span class="fee-label">${labelText}</span>
                            <span class="fee-status unpaid">বকেয়া</span>
                        </div>
                    `;
                    }
                });

                const gridStyle = defaultFeeTypes.length > 1 ? 'grid-template-columns: 1fr 1fr;' : 'grid-template-columns: 1fr;';

                monthCard.innerHTML = `
                <div class="month-header">
                    <span class="month-name">📅 ${monthName}</span>
                    <span class="month-total">${monthTotalAmount > 0 ? 'জমা: ৳ ' + toBengaliNumber(monthTotalAmount) : 'জমা: ৳ ০'}</span>
                </div>
                <div class="fee-items-grid" style="${gridStyle}">
                    ${feeItemsHTML}
                </div>
            `;

                container.appendChild(monthCard);
            });
        }

        // Save Data Function
        function saveData() {
            const roll = document.getElementById('rollNo').value.trim();
            const name = document.getElementById('studentName').value.trim();
            const studentClass = document.getElementById('studentClass').value;
            const month = document.getElementById('month').value;
            const date = document.getElementById('payDate').value;
            const status = document.getElementById('status').value;

            if (!roll || !name || !month || !date) {
                alert('অনুগ্রহ করে Student ID, নাম, মাসের নাম ও তারিখ পূরণ করুন!');
                return;
            }

            const checkedBoxes = Array.from(document.querySelectorAll('input[name="selectedFees"]:checked:not(:disabled)'));

            if (checkedBoxes.length === 0) {
                alert('অনুগ্রহ করে অন্তত একটি পরিশোধিত ফি নির্বাচন করুন (টিক দিন)!');
                return;
            }

            if (editingPaymentId) {
                payments = payments.filter(rec => rec.id !== editingPaymentId);
                editingPaymentId = null;
                const submitBtn = document.querySelector('.btn-submit');
                if (submitBtn) {
                    submitBtn.innerHTML = `<span>💾</span> টাকা জমা নিন ও সংরক্ষণ করুন`;
                    submitBtn.style.background = '#10b981';
                }
            }

            // Add to students list if not present
            let existingStudent = students.find(s => s.roll === roll || s.studentId === roll || getStudentDisplayId(s) === roll);
            if (!existingStudent) {
                students.push({ roll, studentId: roll, name, studentClass });
            } else {
                existingStudent.name = name;
                existingStudent.studentClass = studentClass;
            }

            let savedCount = 0;
            let grandTotal = 0;

            checkedBoxes.forEach(cb => {
                const feeType = cb.value;
                const amount = Number(cb.getAttribute('data-amount') || 0);
                grandTotal += amount;
                savedCount++;

                payments.push({
                    id: 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
                    roll,
                    name,
                    studentClass,
                    feeType,
                    month,
                    amount,
                    date,
                    status
                });
            });

            // Save to storage
            saveDataToStorage();

            // Refresh UI components
            currentSelectedRoll = roll;
            renderStudentList();
            renderTransactionTable();
            selectStudent(roll);

            alert(`সফলভাবে ${savedCount} টি ফি (সর্বমোট ৳ ${grandTotal}) এর জমা সংরক্ষণ করা হয়েছে!`);
            renderFeeCheckboxes();
        }
    
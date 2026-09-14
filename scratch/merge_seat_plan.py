# -*- coding: utf-8 -*-
import sys

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. CSS
seating_css = '''
        /* ==========================================================================
           SEATING ARRANGEMENT DETAILS STYLES (MERGED FROM Seating arrangement details.html)
           ========================================================================== */
        #subview-seating-details {
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'SolaimanLipi', 'Kalpurush', serif;
        }

        #subview-seating-details .a4-page {
            width: 210mm;
            min-height: 297mm;
            background-color: #ffffff;
            padding: 0.3in;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            margin: 0 auto 40px auto;
            display: block;
            box-sizing: border-box;
            position: relative;
        }

        #subview-seating-details .details-container {
            width: 100%;
            border: none;
            padding: 15px;
            border-radius: 4px;
            position: relative;
            box-sizing: border-box;
        }

        #subview-seating-details .school-name {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            color: #000000;
            margin-bottom: 2px;
        }

        #subview-seating-details .exam-name {
            text-align: center;
            font-size: 13.5pt;
            font-weight: bold;
            color: #000000;
            margin-bottom: 6px;
            padding-bottom: 2px;
        }

        #subview-seating-details .header-line-3 {
            display: table;
            width: 100%;
            margin-bottom: 15px;
            background-color: #ffffff;
            border: 1.00px solid #000000;
            border-radius: 4px;
            padding: 6px 10px;
            box-sizing: border-box;
        }

        #subview-seating-details .header-col-left {
            display: table-cell;
            text-align: left;
            width: 30%;
            font-weight: bold;
            font-size: 10.35pt;
            color: #000000;
            vertical-align: middle;
        }

        #subview-seating-details .header-col-center {
            display: table-cell;
            text-align: center;
            width: 40%;
            font-weight: 900 !important;
            font-size: 21.56pt;
            color: #000000;
            vertical-align: middle;
        }

        #subview-seating-details .header-col-right {
            display: table-cell;
            text-align: right;
            width: 30%;
            font-weight: bold;
            font-size: 10.35pt;
            color: #000000;
            vertical-align: middle;
        }

        #subview-seating-details .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: #ffffff;
            border: 1.00px solid #000000;
        }

        #subview-seating-details .summary-table th, 
        #subview-seating-details .summary-table td {
            border: 1.00px solid #000000;
            padding: 4px 8px;
            text-align: center;
            vertical-align: middle;
            font-size: 11pt;
            line-height: 1.4;
        }

        #subview-seating-details .summary-table th {
            background-color: #ffffff;
            color: #000000;
            font-weight: bold;
        }

        #subview-seating-details .summary-table td {
            color: #000000;
            font-weight: 600;
        }

        #subview-seating-details .summary-table tr:nth-child(even) td {
            background-color: #ffffff;
        }

        #subview-seating-details .total-row td {
            background-color: #ffffff !important;
            font-weight: bold;
            color: #000000;
        }

        #subview-seating-details .footer-signatures {
            display: table;
            width: 100%;
            margin-top: 40px;
        }

        #subview-seating-details .sig-col {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            vertical-align: bottom;
            font-size: 9.5pt;
            font-weight: bold;
            color: #000000;
        }

        #subview-seating-details .sig-line {
            border-top: 1px dashed #000000;
            width: 80%;
            margin: 0 auto 5px auto;
        }

        @media print {
            body.print-seating-details-mode .main-nav,
            body.print-seating-details-mode .nav-wrapper,
            body.print-seating-details-mode .hero-slider-container,
            body.print-seating-details-mode .notice-bar,
            body.print-seating-details-mode .school-header,
            body.print-seating-details-mode .sub-nav-tabs,
            body.print-seating-details-mode .no-print,
            body.print-seating-details-mode .modal-overlay,
            body.print-seating-details-mode footer,
            body.print-seating-details-mode .bg-grid-overlay,
            body.print-seating-details-mode .blob,
            body.print-seating-details-mode .seat-sub-view:not(#subview-seating-details) {
                display: none !important;
            }

            body.print-seating-details-mode #subview-seating-details {
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            body.print-seating-details-mode #subview-seating-details .a4-page {
                box-shadow: none !important;
                padding: 0.3in !important;
                width: 100% !important;
                page-break-after: always !important;
                break-after: page !important;
                border: none !important;
                margin-bottom: 0 !important;
            }
        }
'''

if 'SEATING ARRANGEMENT DETAILS STYLES' not in content:
    content = content.replace('    </style>\n</head>', seating_css + '    </style>\n</head>')

# 2. Dropdown Menu Item
old_nav_snippet = '''                        <li><a href="seat-plan?view=seat-distribution"
                                onclick="switchSeatTab('seat-distribution'); return false;">Seat Distribution</a></li>
                        <li><a href="seat-plan?view=admit-card"
                                onclick="switchSeatTab('admit-card'); return false;">Admit Card & Routine</a></li>'''

new_nav_snippet = '''                        <li><a href="seat-plan?view=seat-distribution"
                                onclick="switchSeatTab('seat-distribution'); return false;">Seat Distribution</a></li>
                        <li><a href="seat-plan?view=seating-details"
                                onclick="switchSeatTab('seating-details'); return false;">Seating Details (সামারি ও আসন বিন্যাস)</a></li>
                        <li><a href="seat-plan?view=admit-card"
                                onclick="switchSeatTab('admit-card'); return false;">Admit Card & Routine</a></li>'''

if 'view=seating-details' not in content:
    content = content.replace(old_nav_snippet, new_nav_snippet)

# 3. Sub-Nav Tabs Button
old_tab_buttons = '''                <button class="sub-tab-btn" id="btn-tab-seat-distribution" onclick="switchSeatTab('seat-distribution')">
                    🪑 Student Seat Distribution
                </button>
                <button class="sub-tab-btn" id="btn-tab-admit-card" onclick="switchSeatTab('admit-card')">
                    🪪 Admit Card & Routine
                </button>'''

new_tab_buttons = '''                <button class="sub-tab-btn" id="btn-tab-seat-distribution" onclick="switchSeatTab('seat-distribution')">
                    🪑 Student Seat Distribution
                </button>
                <button class="sub-tab-btn" id="btn-tab-seating-details" onclick="switchSeatTab('seating-details')">
                    🪑 Seating Details
                </button>
                <button class="sub-tab-btn" id="btn-tab-admit-card" onclick="switchSeatTab('admit-card')">
                    🪪 Admit Card & Routine
                </button>'''

if 'btn-tab-seating-details' not in content:
    content = content.replace(old_tab_buttons, new_tab_buttons)

# 4. Subview HTML
seating_subview_html = '''            <!-- TAB: SEATING ARRANGEMENT DETAILS (MERGED FROM Seating arrangement details.html) -->
            <div id="subview-seating-details" class="seat-sub-view">

                <!-- Filter Control Panel (Screenshot Filters) -->
                <div class="control-panel no-print"
                    style="max-width: 210mm; margin: 0 auto 15px auto; background: #ffffff; padding: 14px 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1.5px solid #cbd5e1; box-sizing: border-box;">
                    <div style="display: flex; gap: 12px 20px; flex-wrap: wrap; align-items: center;">

                        <!-- Class Filter -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label for="seating-filter-class" style="font-weight: 700; font-size: 0.9rem; color: #475569;">শ্রেণি (Class):</label>
                            <select id="seating-filter-class" onchange="updateSeatingDetailsLive()"
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #ffffff; color: #1e293b;">
                                <option value="all">All Classes</option>
                            </select>
                        </div>

                        <!-- Exam Filter -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label for="seating-filter-exam" style="font-weight: 700; font-size: 0.9rem; color: #475569;">পরীক্ষা (Exam):</label>
                            <select id="seating-filter-exam" onchange="updateSeatingDetailsLive()"
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #ffffff; color: #1e293b;">
                                <option value="all">সকল পরীক্ষা (All Exams / Routine Title)</option>
                            </select>
                        </div>

                        <!-- Shift Filter (Hidden for Seating Arrangement Details) -->
                        <div style="display: none !important; align-items: center; gap: 8px;">
                            <label for="seating-filter-shift" style="font-weight: 700; font-size: 0.9rem; color: #475569;">শিফট (Shift):</label>
                            <select id="seating-filter-shift" onchange="updateSeatingDetailsLive()"
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #ffffff; color: #1e293b;">
                                <option value="all">All Shifts</option>
                            </select>
                        </div>

                        <!-- Language Filter -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label for="seating-filter-lang" style="font-weight: 700; font-size: 0.9rem; color: #475569;">ভাষা (Language):</label>
                            <select id="seating-filter-lang" onchange="updateSeatingDetailsLive()"
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #ffffff; color: #1e293b;">
                                <option value="bn">বাংলা (Bangla)</option>
                                <option value="en">English</option>
                                <option value="both">বাংলা + English</option>
                            </select>
                        </div>

                        <!-- Font Size Slider -->
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <label for="seating-font-size-slider" style="font-weight: 700; font-size: 0.9rem; color: #475569;">লেখার সাইজ (Font):</label>
                            <input type="range" id="seating-font-size-slider" min="10" max="18" value="14" step="0.5"
                                oninput="updateSeatingDetailsFontSize(this.value)"
                                style="width: 90px; cursor: pointer; accent-color: #0284c7;">
                            <span id="seating-font-size-val" style="font-weight: 800; font-size: 0.9rem; color: #0284c7; min-width: 38px;">14px</span>
                        </div>

                        <!-- Search Input -->
                        <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1; min-width: 200px;">
                            <label for="seating-search-student" style="font-weight: 700; font-size: 0.9rem; color: #475569;">অনুসন্ধান (Search):</label>
                            <input type="text" id="seating-search-student" oninput="updateSeatingDetailsLive()"
                                placeholder="রুম, শ্রেণি বা রোল দিয়ে খুঁজুন..."
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; flex-grow: 1; box-sizing: border-box; background: #ffffff; color: #1e293b;">
                        </div>

                        <!-- PDF Download & Print Buttons -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button type="button" id="seating-btn-download-pdf" onclick="downloadSeatingDetailsPDF()"
                                style="padding: 6px 14px; border-radius: 6px; border: none; background: #059669; color: #ffffff; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);">
                                📥 PDF ডাউনলোড
                            </button>
                            <button type="button" onclick="printSeatingDetails()"
                                style="padding: 6px 14px; border-radius: 6px; border: none; background: #0284c7; color: #ffffff; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);">
                                🖨️ প্রিন্ট
                            </button>
                        </div>

                    </div>
                </div>

                <!-- Pages Container for Dynamic Multi-Page (Shift-wise A4 Pages) -->
                <div id="seating-pages-container" style="width: 100%; display: flex; flex-direction: column; align-items: center;"></div>

            </div>

'''

admit_tab_marker = '            <!-- TAB 4: ADMIT CARD & ROUTINE DUPLEX SYSTEM -->'
if 'id="subview-seating-details"' not in content:
    content = content.replace(admit_tab_marker, seating_subview_html + admit_tab_marker)

# 5. URL Router and switchSeatTab
old_valid_tabs = "const validSeatTabs = ['exam-routine', 'building-mgmt', 'seat-distribution', 'admit-card', 'find-seat', 'exam-document-report', 'report'];"
new_valid_tabs = "const validSeatTabs = ['exam-routine', 'building-mgmt', 'seat-distribution', 'seating-details', 'seating-arrangement-details', 'admit-card', 'find-seat', 'exam-document-report', 'report'];"
content = content.replace(old_valid_tabs, new_valid_tabs)

# In click handlers and popstate: map seating-arrangement-details to seating-details
old_mapping = "if (viewName === 'report') mappedTab = 'find-seat';"
new_mapping = "if (viewName === 'report') mappedTab = 'find-seat';\n                        if (viewName === 'seating-arrangement-details') mappedTab = 'seating-details';"
content = content.replace(old_mapping, new_mapping)

old_popstate_mapping = "if (viewParam === 'report') targetTab = 'find-seat';"
new_popstate_mapping = "if (viewParam === 'report') targetTab = 'find-seat';\n            if (viewParam === 'seating-arrangement-details') targetTab = 'seating-details';"
content = content.replace(old_popstate_mapping, new_popstate_mapping)

# In switchSeatTab: add handling for seating-details
old_switch_branch = "} else if (tabName === 'admit-card') {"
new_switch_branch = '''} else if (tabName === 'seating-details') {
                    if (titleEl) titleEl.innerText = "Seating Arrangement Details (সামারি ও আসন বিন্যাস)";
                    if (subTitleEl) subTitleEl.innerText = "A4 Preview of Room & Bench summary table with shift, building and class-wise totals";
                    if (!_renderedTabs.has('seating-details')) {
                        _renderedTabs.add('seating-details');
                        if (typeof populateSeatingClassFilter === 'function') populateSeatingClassFilter();
                        if (typeof populateSeatingExamFilter === 'function') populateSeatingExamFilter();
                        if (typeof populateSeatingShiftFilter === 'function') populateSeatingShiftFilter();
                        const currentFontSize = document.getElementById('seating-font-size-slider')?.value || '14';
                        if (typeof updateSeatingDetailsFontSize === 'function') updateSeatingDetailsFontSize(currentFontSize);
                        if (typeof updateSeatingDetailsLive === 'function') updateSeatingDetailsLive();
                    } else {
                        if (typeof updateSeatingDetailsLive === 'function') updateSeatingDetailsLive();
                    }
                } else if (tabName === 'admit-card') {'''

if 'tabName === \'seating-details\'' not in content:
    content = content.replace(old_switch_branch, new_switch_branch)

# 6. switchExamDocument update
old_switch_doc = '''        function switchExamDocument(fileName, title, subtitle, el) {
            if (fileName === 'Admit Card.html' || fileName === 'Admit Card') {
                switchSeatTab('admit-card', true);
                return;
            }'''

new_switch_doc = '''        function switchExamDocument(fileName, title, subtitle, el) {
            if (fileName === 'Admit Card.html' || fileName === 'Admit Card') {
                switchSeatTab('admit-card', true);
                return;
            }
            if (fileName === 'Seating arrangement details.html' || fileName === 'Seating arrangement details' || (fileName && fileName.includes('Seating arrangement details'))) {
                switchSeatTab('seating-details', true);
                return;
            }'''

if 'fileName.includes(\'Seating arrangement details\')' not in content:
    content = content.replace(old_switch_doc, new_switch_doc)

# 7. JS Engine
seating_engine_js = '''        // ==========================================================================
        // SEATING ARRANGEMENT DETAILS ENGINE (MERGED FROM Seating arrangement details.html)
        // ==========================================================================

        function formatSeatingClassLabel(cls) {
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

        function formatSeatingShiftLabel(shift) {
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

        function populateSeatingClassFilter() {
            const classSelect = document.getElementById('seating-filter-class');
            if (!classSelect) return;
            const currentSelected = classSelect.value || 'all';
            classSelect.innerHTML = '<option value="all">সকল শ্রেণি (All Classes)</option>';

            let classesList = [];
            try {
                classesList = JSON.parse(localStorage.getItem('school_classes') || '[]');
            } catch (e) { }

            if (!Array.isArray(classesList) || classesList.length === 0) {
                classesList = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            }

            classesList.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls;
                opt.innerText = formatSeatingClassLabel(cls);
                classSelect.appendChild(opt);
            });

            if (currentSelected && [...classSelect.options].some(o => o.value === currentSelected)) {
                classSelect.value = currentSelected;
            }
        }

        function populateSeatingExamFilter() {
            const examSelect = document.getElementById('seating-filter-exam');
            if (!examSelect) return;
            const currentSelected = examSelect.value || 'all';
            examSelect.innerHTML = '<option value="all">সকল পরীক্ষা (All Exams / Routine Title)</option>';

            const examSet = new Set();
            examSet.add('বার্ষিক পরীক্ষা - ২০২৬');
            examSet.add('অর্ধ-বার্ষিক পরীক্ষা - ২০২৬');

            try {
                const routines = JSON.parse(localStorage.getItem('school_exam_routines') || '[]');
                const seatPlansStore = JSON.parse(localStorage.getItem('school_seat_plans_store') || '{}');
                const examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]');
                
                if (typeof seatPlansStore === 'object') {
                    Object.values(seatPlansStore).forEach(plan => {
                        if (plan && plan.examName && plan.examName.trim()) examSet.add(plan.examName.trim());
                    });
                }
                if (Array.isArray(routines)) {
                    routines.forEach(r => { if (r && r.examName && r.examName.trim()) examSet.add(r.examName.trim()); });
                }
                if (Array.isArray(examTypes)) {
                    examTypes.forEach(t => { if (t && t.name && t.name.trim()) examSet.add(t.name.trim()); });
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

        function populateSeatingShiftFilter() {
            const shiftSelect = document.getElementById('seating-filter-shift');
            if (!shiftSelect) return;
            const currentSelected = shiftSelect.value || 'all';
            shiftSelect.innerHTML = '<option value="all">সকল শিফট (All Shifts)</option>';

            const shiftsSet = new Set();
            shiftsSet.add('Morning Shift');
            shiftsSet.add('Afternoon Shift');

            try {
                const shiftTimes = JSON.parse(localStorage.getItem('school_shift_times') || '[]');
                if (Array.isArray(shiftTimes)) {
                    shiftTimes.forEach(st => {
                        if (st && st.shift && st.shift.trim()) shiftsSet.add(st.shift.trim());
                    });
                }

                const seatPlansStore = JSON.parse(localStorage.getItem('school_seat_plans_store') || '{}');
                if (seatPlansStore && typeof seatPlansStore === 'object') {
                    Object.values(seatPlansStore).forEach(plan => {
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

                const savedAlloc = JSON.parse(localStorage.getItem('school_saved_seat_allocations') || '{}');
                if (savedAlloc && typeof savedAlloc === 'object') {
                    Object.values(savedAlloc).forEach(item => {
                        if (item && item.shift && item.shift.trim()) {
                            shiftsSet.add(item.shift.trim());
                        }
                    });
                }
            } catch (e) {}

            shiftsSet.forEach(shift => {
                const opt = document.createElement('option');
                opt.value = shift;
                opt.innerText = formatSeatingShiftLabel(shift);
                shiftSelect.appendChild(opt);
            });

            if (currentSelected && [...shiftSelect.options].some(o => o.value === currentSelected)) {
                shiftSelect.value = currentSelected;
            }
        }

        function updateSeatingDetailsFontSize(val) {
            const valSpan = document.getElementById('seating-font-size-val');
            if (valSpan) valSpan.innerText = val + 'px';

            const numVal = parseFloat(val) || 14;
            const scaleRatio = numVal / 14;

            const tableElements = document.querySelectorAll('#subview-seating-details .summary-table th, #subview-seating-details .summary-table td');
            tableElements.forEach(el => {
                el.style.fontSize = (11 * scaleRatio).toFixed(1) + 'pt';
            });

            const sideHeaders = document.querySelectorAll('#subview-seating-details .header-col-left, #subview-seating-details .header-col-right');
            sideHeaders.forEach(el => {
                el.style.fontSize = (10.35 * scaleRatio).toFixed(1) + 'pt';
            });

            const centerHeaders = document.querySelectorAll('#subview-seating-details .header-col-center');
            centerHeaders.forEach(el => {
                el.style.fontSize = (21.56 * scaleRatio).toFixed(1) + 'pt';
                el.style.fontWeight = '900';
            });
        }

        function isSeatingClassMatch(studentClass, selectedClass) {
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

        function isSeatingShiftMatch(studentShift, selectedShift) {
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

            const classVal = document.getElementById('seating-filter-class')?.value || 'all';
            const examVal = document.getElementById('seating-filter-exam')?.value || 'all';
            const shiftVal = document.getElementById('seating-filter-shift')?.value || 'all';
            const langVal = document.getElementById('seating-filter-lang')?.value || 'bn';
            const searchVal = (document.getElementById('seating-search-student')?.value || '').trim().toLowerCase();

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
                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', roll: String(i + 1).padStart(2, '0'), studentId: '2026080' + (i + 1) } })),
                                ...Array(17).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', roll: String(i + 1).padStart(2, '0'), studentId: '2026060' + (i + 1) } }))
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
                                ...Array(13).fill(0).map((_, i) => ({ left: { class: 'অষ্টম (EIGHT)', roll: String(109 + i), studentId: '202608' + (109 + i) } })),
                                ...Array(4).fill(0).map((_, i) => ({ right: { class: 'ষষ্ঠ (SIX)', roll: String(66 + i), studentId: '202606' + (66 + i) } })),
                                ...Array(17).fill(0).map((_, i) => ({ left: { class: 'দশম (TEN)', roll: String(44 + i), studentId: '202610' + (44 + i) } }))
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
                                ...Array(15).fill(0).map((_, i) => ({ left: { class: 'সপ্তম (SEVEN)', roll: String(i + 1).padStart(2, '0'), studentId: '2026070' + (i + 1) } })),
                                ...Array(15).fill(0).map((_, i) => ({ right: { class: 'নবম (NINE)', roll: String(i + 1).padStart(2, '0'), studentId: '2026090' + (i + 1) } }))
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
                if (!isSeatingShiftMatch(sName, shiftVal)) return;
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

            const pagesContainer = document.getElementById('seating-pages-container');
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

                    const classGroup = {};
                    item.benches.forEach(b => {
                        [b.left, b.right].forEach(st => {
                            if (st) {
                                const c = st.class || 'Unassigned';
                                if (!isSeatingClassMatch(c, classVal)) return;
                                if (!classGroup[c]) classGroup[c] = [];
                                classGroup[c].push(st);
                            }
                        });
                    });

                    const classes = Object.keys(classGroup);
                    if (classes.length === 0) return;

                    const rowCount = classes.length;
                    classes.forEach((cls, idx) => {
                        const stList = classGroup[cls];
                        stList.sort((a, b) => {
                            const idA = String(a.studentId || a.id || a.roll || '');
                            const idB = String(b.studentId || b.id || b.roll || '');
                            return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                        });
                        const studentIds = stList.map(st => st.studentId || st.id || st.roll).filter(Boolean);
                        const idDisplay = studentIds.length > 0 ? studentIds.join(', ') : '-';
                        const total = stList.length;
                        grandTotal += total;

                        tbodyHtml += '<tr>';
                        if (idx === 0) {
                            tbodyHtml += `<td rowspan="${rowCount}">${String(sl).padStart(2, '0')}</td>`;
                            tbodyHtml += `<td rowspan="${rowCount}">${roomNo}</td>`;
                        }
                        tbodyHtml += `<td>${cls}</td>`;
                        tbodyHtml += `<td>${idDisplay}</td>`;
                        tbodyHtml += `<td>${total}</td>`;
                        tbodyHtml += '</tr>';
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

            const currentFontSize = document.getElementById('seating-font-size-slider')?.value;
            if (currentFontSize) {
                updateSeatingDetailsFontSize(currentFontSize);
            }
        }

        function refreshSeatingDetailsData() {
            populateSeatingClassFilter();
            populateSeatingExamFilter();
            populateSeatingShiftFilter();
            updateSeatingDetailsLive();
        }

        function printSeatingDetails() {
            document.body.classList.add('print-seating-details-mode');
            window.print();
            setTimeout(() => {
                document.body.classList.remove('print-seating-details-mode');
            }, 1000);
        }

        async function downloadSeatingDetailsPDF() {
            const container = document.getElementById('seating-pages-container');
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

            const examVal = document.getElementById('seating-filter-exam')?.value || 'all';
            const classVal = document.getElementById('seating-filter-class')?.value || 'all';
            const safeExamName = (examVal === 'all' ? 'Seating_Details' : examVal).replace(/[^a-zA-Z0-9_\\u0980-\\u09FF-]/g, '_');
            const safeClassName = (classVal === 'all' ? 'All_Classes' : classVal).replace(/[^a-zA-Z0-9_\\u0980-\\u09FF-]/g, '_');
            const fileName = `Seating_Details_${safeClassName}_${safeExamName}.pdf`;

            const btn = document.getElementById('seating-btn-download-pdf');
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
                printSeatingDetails();
            }
        }

        window.downloadSeatingDetailsPDF = downloadSeatingDetailsPDF;
        window.updateSeatingDetailsLive = updateSeatingDetailsLive;
'''

admit_engine_marker = '        // ==========================================================================\n        // ADMIT CARD & ROUTINE DUPLEX SYSTEM ENGINE (MERGED FROM Admit Card.html)'
if 'SEATING ARRANGEMENT DETAILS ENGINE' not in content:
    content = content.replace(admit_engine_marker, seating_engine_js + '\n' + admit_engine_marker)

# 8. Add event listeners for seating details live synchronization
event_listeners_search = 'window.addEventListener(\'storage\', () => {'
if 'refreshSeatingDetailsData' not in content:
    content = content.replace('window.addEventListener(\'storage\', () => {', 'window.addEventListener(\'storage\', refreshSeatingDetailsData);\n        window.addEventListener(\'dbSynced\', refreshSeatingDetailsData);\n        window.addEventListener(\'storage\', () => {')

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('seat-plan.html updated successfully!')

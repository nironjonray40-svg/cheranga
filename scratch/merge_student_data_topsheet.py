# -*- coding: utf-8 -*-
import os, sys, re

sys.stdout.reconfigure(encoding='utf-8')

print("Starting merge of Student Data Topsheet into seat-plan.html...")

# =========================================================================
# 1. READ ORIGINAL FILES
# =========================================================================
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_plan = f.read()

with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    sdt_html = f.read()

# =========================================================================
# 2. PREPARE CSS
# =========================================================================
sdt_css = '''
        /* ==========================================================================
           STUDENT DATA TOPSHEET STYLES (MERGED FROM Student Data Topsheet.html)
           ========================================================================== */
        #subview-student-data-topsheet {
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'Kalpurush', 'SolaimanLipi', serif;
        }

        #subview-student-data-topsheet .no-print-controls {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 1.5px solid #cbd5e1;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
            border-radius: 12px;
            width: 100%;
            max-width: 297mm;
            margin: 0 auto 20px auto;
            box-sizing: border-box;
        }

        #subview-student-data-topsheet .control-group {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        #subview-student-data-topsheet .control-group label {
            font-weight: 700;
            font-size: 0.88rem;
            color: #475569;
        }

        #subview-student-data-topsheet .control-group select,
        #subview-student-data-topsheet .control-group input[type="text"] {
            padding: 6px 10px;
            border-radius: 6px;
            border: 1.5px solid #cbd5e1;
            outline: none;
            font-size: 0.88rem;
            font-weight: 600;
            background: #ffffff;
            color: #0f172a;
        }

        #subview-student-data-topsheet .btn-action {
            padding: 6px 14px;
            border-radius: 6px;
            border: none;
            font-weight: 700;
            font-size: 0.88rem;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
            transition: all 0.2s ease;
        }

        #subview-student-data-topsheet .btn-print {
            background: #0284c7;
            color: #ffffff;
        }

        #subview-student-data-topsheet .btn-print:hover {
            background: #0369a1;
        }

        #subview-student-data-topsheet .btn-pdf {
            background: #059669;
            color: #ffffff;
        }

        #subview-student-data-topsheet .btn-pdf:hover {
            background: #047857;
        }

        /* Main Page Container (A4 Landscape Preview) */
        #subview-student-data-topsheet .page-block {
            width: 100%;
            max-width: 297mm;
            min-height: 210mm;
            padding: 0.3in !important;
            background-color: #ffffff;
            margin: 15px auto;
            font-size: 1.16em;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            box-sizing: border-box;
            color: #000000 !important;
            page-break-after: always;
            break-after: page;
        }

        #subview-student-data-topsheet .page-block * {
            color: #000000 !important;
        }

        #subview-student-data-topsheet .topsheet-header {
            text-align: center;
            margin-bottom: 20px;
        }

        #subview-student-data-topsheet .topsheet-header h2 {
            margin: 0 0 6px 0;
            font-size: 1.5em;
            color: #000000 !important;
            font-weight: 800;
        }

        #subview-student-data-topsheet .building-title {
            display: none !important;
        }

        #subview-student-data-topsheet .shift-section {
            margin-bottom: 30px;
        }

        #subview-student-data-topsheet .shift-title {
            margin: 0 0 10px 0;
            text-align: left;
            font-size: 1.1em;
            font-weight: 800;
            color: #000000 !important;
        }

        #subview-student-data-topsheet .topsheet-table {
            border-collapse: collapse;
            width: 100%;
            text-align: center;
            border: 1.5px solid #000000;
            font-size: 1.16em;
            background: #ffffff;
            margin-bottom: 10px;
        }

        #subview-student-data-topsheet .topsheet-table th,
        #subview-student-data-topsheet .topsheet-table td {
            border: 1px solid #000000;
            padding: 6px 8px;
            vertical-align: middle;
        }

        #subview-student-data-topsheet .topsheet-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #000000 !important;
        }

        #subview-student-data-topsheet .topsheet-table tfoot tr {
            background-color: #e2e8f0;
            font-weight: bold;
        }

        #subview-student-data-topsheet .hide-col-lines th:first-child,
        #subview-student-data-topsheet .hide-col-lines td:first-child {
            border-left: 1px solid #000000 !important;
            border-right: 1px solid #000000 !important;
        }

        #subview-student-data-topsheet .no-data-alert {
            padding: 20px;
            background: #fef2f2;
            border: 1.5px solid #fca5a5;
            color: #991b1b;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }

        /* PRINT SPECIFIC STYLES (Strict A4 Landscape & 0.3in Margins) */
        @media print {
            body.print-student-data-topsheet-mode {
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            body.print-student-data-topsheet-mode .main-nav,
            body.print-student-data-topsheet-mode .nav-wrapper,
            body.print-student-data-topsheet-mode .hero-slider-container,
            body.print-student-data-topsheet-mode .notice-bar,
            body.print-student-data-topsheet-mode .school-header,
            body.print-student-data-topsheet-mode .sub-nav-tabs,
            body.print-student-data-topsheet-mode .no-print,
            body.print-student-data-topsheet-mode .no-print-controls,
            body.print-student-data-topsheet-mode .modal-overlay,
            body.print-student-data-topsheet-mode footer,
            body.print-student-data-topsheet-mode .bg-grid-overlay,
            body.print-student-data-topsheet-mode .blob,
            body.print-student-data-topsheet-mode .seat-sub-view:not(#subview-student-data-topsheet) {
                display: none !important;
            }

            body.print-student-data-topsheet-mode #subview-student-data-topsheet {
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            body.print-student-data-topsheet-mode #subview-student-data-topsheet .page-block {
                padding: 0.3in !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: none !important;
                min-height: auto !important;
                box-shadow: none !important;
                page-break-after: always !important;
                break-after: page !important;
            }

            body.print-student-data-topsheet-mode #subview-student-data-topsheet .page-block:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }

            body.print-student-data-topsheet-mode #subview-student-data-topsheet .topsheet-table {
                font-size: 11.6pt !important;
            }

            body.print-student-data-topsheet-mode thead {
                display: table-header-group;
            }

            body.print-student-data-topsheet-mode tr,
            body.print-student-data-topsheet-mode th,
            body.print-student-data-topsheet-mode td {
                page-break-inside: avoid;
            }
        }
'''

# Insert CSS before </style>
if '#subview-student-data-topsheet' not in seat_plan:
    seat_plan = seat_plan.replace('</style>', sdt_css + '\n    </style>', 1)
    print("✓ Added Student Data Topsheet CSS.")
else:
    print("- CSS already present.")

# =========================================================================
# 3. NAVBAR DROPDOWN LINK IN seat-plan.html
# =========================================================================
nav_target = '''<li><a href="seat-plan?view=student-attendance"
                                onclick="switchSeatTab('student-attendance'); return false;">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>'''

nav_replacement = '''<li><a href="seat-plan?view=student-attendance"
                                onclick="switchSeatTab('student-attendance'); return false;">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>
                        <li><a href="seat-plan?view=student-data-topsheet"
                                onclick="switchSeatTab('student-data-topsheet'); return false;">Student Data Topsheet (শিক্ষার্থীর তথ্য টপশীট)</a></li>'''

if 'seat-plan?view=student-data-topsheet' not in seat_plan:
    if nav_target in seat_plan:
        seat_plan = seat_plan.replace(nav_target, nav_replacement)
        print("✓ Added Student Data Topsheet to navbar dropdown.")
    else:
        print("Using regex for navbar dropdown replacement...")
        seat_plan = re.sub(
            r'(<li><a\s+href=["\']seat-plan\?view=student-attendance["\'][^>]*>.*?</a></li>)',
            r'\1\n                        <li><a href="seat-plan?view=student-data-topsheet" onclick="switchSeatTab(\'student-data-topsheet\'); return false;">Student Data Topsheet (শিক্ষার্থীর তথ্য টপশীট)</a></li>',
            seat_plan
        )
else:
    print("- Navbar dropdown link already present.")

# =========================================================================
# 4. SUB-NAV TAB BUTTON IN seat-plan.html
# =========================================================================
tab_target = '''<button class="sub-tab-btn" id="btn-tab-student-attendance" onclick="switchSeatTab('student-attendance')">
                    📝 Student Attendance Sheet
                </button>'''

tab_replacement = '''<button class="sub-tab-btn" id="btn-tab-student-attendance" onclick="switchSeatTab('student-attendance')">
                    📝 Student Attendance Sheet
                </button>
                <button class="sub-tab-btn" id="btn-tab-student-data-topsheet" onclick="switchSeatTab('student-data-topsheet')">
                    📊 Student Data Topsheet
                </button>'''

if 'id="btn-tab-student-data-topsheet"' not in seat_plan:
    if tab_target in seat_plan:
        seat_plan = seat_plan.replace(tab_target, tab_replacement)
        print("✓ Added Student Data Topsheet tab button.")
    else:
        print("Using regex for tab button replacement...")
        seat_plan = re.sub(
            r'(<button[^>]*id=["\']btn-tab-student-attendance["\'][^>]*>.*?</button>)',
            r'\1\n                <button class="sub-tab-btn" id="btn-tab-student-data-topsheet" onclick="switchSeatTab(\'student-data-topsheet\')">\n                    📊 Student Data Topsheet\n                </button>',
            seat_plan
        )
else:
    print("- Tab button already present.")

# =========================================================================
# 5. SUBVIEW HTML FOR #subview-student-data-topsheet
# =========================================================================
sdt_subview_html = '''
            <!-- TAB: STUDENT DATA TOPSHEET (MERGED FROM Student Data Topsheet.html) -->
            <div id="subview-student-data-topsheet" class="seat-sub-view">

                <!-- Non-Printable Top Control Toolbar -->
                <div class="no-print-controls no-print">

                    <!-- Exam Filter -->
                    <div class="control-group">
                        <label for="sdt-filter-exam">পরীক্ষা (Exam):</label>
                        <select id="sdt-filter-exam" onchange="updateStudentDataTopsheetLive()">
                            <option value="all">সকল সংরক্ষিত সিটপ্ল্যান (All Saved Seat Plans)</option>
                        </select>
                    </div>

                    <!-- Shift Filter -->
                    <div class="control-group">
                        <label for="sdt-filter-shift">শিফট (Shift):</label>
                        <select id="sdt-filter-shift" onchange="updateStudentDataTopsheetLive()">
                            <option value="all">সকল শিফট (All Shifts)</option>
                            <option value="Morning Shift">সকাল (Morning Shift)</option>
                            <option value="Afternoon Shift">বিকাল (Afternoon Shift)</option>
                        </select>
                    </div>

                    <!-- Building Filter -->
                    <div class="control-group">
                        <label for="sdt-filter-building">বিল্ডিং (Building):</label>
                        <select id="sdt-filter-building" onchange="updateStudentDataTopsheetLive()">
                            <option value="all">সকল বিল্ডিং (All Buildings)</option>
                        </select>
                    </div>

                    <!-- Class Filter -->
                    <div class="control-group">
                        <label for="sdt-filter-class">শ্রেণি (Class):</label>
                        <select id="sdt-filter-class" onchange="updateStudentDataTopsheetLive()">
                            <option value="all">সকল শ্রেণি (All Classes)</option>
                        </select>
                    </div>

                    <!-- Language Filter -->
                    <div class="control-group">
                        <label for="sdt-filter-lang">ভাষা (Language):</label>
                        <select id="sdt-filter-lang" onchange="updateStudentDataTopsheetLive()">
                            <option value="bn" selected>বাংলা (Bangla)</option>
                            <option value="en">English</option>
                            <option value="both">বাংলা + English</option>
                        </select>
                    </div>

                    <!-- Font Family Selector -->
                    <div class="control-group">
                        <label for="sdt-filter-font-family">ফন্ট স্টাইল (Font Style):</label>
                        <select id="sdt-filter-font-family" onchange="updateStudentDataTopsheetFontFamily(this.value)">
                            <option value="'Noto Rashi Hebrew', 'Tiro Bangla', 'Kalpurush', serif" selected>Noto Rashi Hebrew + Tiro Bangla (ডিফল্ট - গর্জিয়াস)</option>
                            <option value="'Tiro Bangla', 'Kalpurush', sans-serif">Tiro Bangla (তিরো বাংলা)</option>
                            <option value="'Kalpurush', 'SolaimanLipi', Arial, sans-serif">Kalpurush (কালপুরুষ - ক্লাসিক)</option>
                            <option value="'Hind Siliguri', 'SolaimanLipi', sans-serif">Hind Siliguri (হিন্দ শিলিগুড়ি - স্টাইলিশ)</option>
                            <option value="'SolaimanLipi', 'Kalpurush', sans-serif">SolaimanLipi (সোলাইমান লিপি - ক্লাসিক)</option>
                            <option value="'Noto Sans Bengali', sans-serif">Noto Sans Bengali (নোটো সান্স)</option>
                            <option value="'Outfit', 'Hind Siliguri', sans-serif">Outfit (আউটফিট - মডার্ন)</option>
                            <option value="'Inter', 'SolaimanLipi', sans-serif">Inter (ইন্টার - ক্লিন)</option>
                            <option value="'Noto Rashi Hebrew', 'Kalpurush', serif">Noto Rashi Hebrew (নোটো রাশি হিব্রু - গর্জিয়াস)</option>
                            <option value="Georgia, 'Times New Roman', serif">Georgia (জর্জিয়া - সেফ)</option>
                        </select>
                    </div>

                    <!-- Font Size Slider -->
                    <div class="control-group">
                        <label for="sdt-font-size-slider">ফন্ট (Font):</label>
                        <input type="range" id="sdt-font-size-slider" min="11" max="20" value="15.5" step="0.5"
                            oninput="updateStudentDataTopsheetFontSize(this.value)" style="width: 80px; cursor: pointer; accent-color: #0284c7;">
                        <span id="sdt-font-size-val" style="font-weight: 800; font-size: 0.88rem; color: #0284c7; min-width: 42px;">15.5px</span>
                    </div>

                    <!-- Search Input -->
                    <div class="control-group" style="flex-grow: 1; max-width: 220px;">
                        <input type="text" id="sdt-search-student" oninput="updateStudentDataTopsheetLive()"
                            placeholder="রুম বা শ্রেণি দিয়ে খুঁজুন..." style="width: 100%;">
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn-action btn-pdf" onclick="downloadStudentDataTopsheetPDF()">
                            📥 PDF ডাউনলোড
                        </button>
                        <button type="button" class="btn-action btn-print" onclick="printStudentDataTopsheet()">
                            🖨️ প্রিন্ট করুন
                        </button>
                    </div>
                </div>

                <!-- Main Render Container -->
                <div id="topsheet-render-container" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                    <!-- Dynamic Page Blocks Will Be Rendered Here -->
                </div>

            </div>
'''

if 'id="subview-student-data-topsheet"' not in seat_plan:
    admit_card_pos = seat_plan.find('<!-- TAB: ADMIT CARD & ROUTINE -->')
    if admit_card_pos == -1:
        admit_card_pos = seat_plan.find('<div id="subview-admit-card"')
    if admit_card_pos != -1:
        seat_plan = seat_plan[:admit_card_pos] + sdt_subview_html + '\n\n' + seat_plan[admit_card_pos:]
        print("✓ Added #subview-student-data-topsheet HTML before admit card tab.")
    else:
        print("Warning: Could not find admit-card tab anchor!")
else:
    print("- Subview HTML already present.")

# =========================================================================
# 6. JS ENGINE FOR STUDENT DATA TOPSHEET
# =========================================================================
sdt_engine_js = '''
        /* ==========================================================================
           STUDENT DATA TOPSHEET JAVASCRIPT ENGINE (MERGED FROM Student Data Topsheet.html)
           ========================================================================== */

        function getSDTElement(id) {
            return document.getElementById('sdt-' + id) || document.getElementById(id);
        }

        function toBengaliNumerals(num) {
            if (num === null || num === undefined || num === '') return '-';
            const str = String(num);
            if (!/^\\d+$/.test(str)) return str;
            const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            return str.split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
        }

        function formatClassName(c) {
            if (!c) return 'Unassigned';
            const map = {
                'play': 'Play', 'nursery': 'Nursery', 'kg': 'KG',
                'one': 'Class 1', 'two': 'Class 2', 'three': 'Class 3',
                'four': 'Class 4', 'five': 'Class 5', 'six': 'Class 6',
                'seven': 'Class 7', 'eight': 'Class 8', 'nine': 'Class 9', 'ten': 'Class 10'
            };
            const key = String(c).toLowerCase().trim();
            return map[key] || c;
        }

        function formatShiftInfo(s) {
            if (!s) return { name: 'সকাল', time: '10:00 AM - 12:30 PM' };
            const shiftTimes = safeJsonParse('school_shift_times', {
                'Morning Shift': '10:00 AM - 12:30 PM',
                'Afternoon Shift': '01:30 PM - 04:00 PM'
            });

            const match = s.match(/^(.*?)\\s*\\((.*?)\\)$/);
            let bnName = s;
            let timeStr = shiftTimes[s] || (s.toLowerCase().includes('afternoon') ? '01:30 PM - 04:00 PM' : '10:00 AM - 12:30 PM');

            if (match) {
                bnName = match[1].trim();
                timeStr = match[2].trim();
            } else {
                if (s.toLowerCase().includes('morning') || s.includes('সকাল')) {
                    bnName = 'সকাল';
                } else if (s.toLowerCase().includes('afternoon') || s.includes('বিকাল') || s.includes('দুপুর')) {
                    bnName = 'বিকাল';
                }
            }
            return { name: bnName, time: timeStr };
        }

        function updateStudentDataTopsheetFontSize(val) {
            const valSpan = getSDTElement('font-size-val');
            if (valSpan) valSpan.innerText = val + 'px';
            const container = getSDTElement('topsheet-render-container');
            if (container) container.style.fontSize = (val / 16) + 'em';
            localStorage.setItem('sdt_font_size', val);
        }

        function updateStudentDataTopsheetFontFamily(fontVal) {
            const container = getSDTElement('topsheet-render-container');
            if (container) {
                container.style.fontFamily = fontVal;
            }
            localStorage.setItem('topsheet_font_family', fontVal);
        }

        function initStudentDataTopsheetFontFamily() {
            const savedFont = localStorage.getItem('topsheet_font_family');
            const fontSelect = getSDTElement('filter-font-family');
            if (savedFont && fontSelect) {
                if ([...fontSelect.options].some(o => o.value === savedFont)) {
                    fontSelect.value = savedFont;
                }
            }
            const currentFont = fontSelect ? fontSelect.value : "'Noto Rashi Hebrew', 'Tiro Bangla', 'Kalpurush', serif";
            const container = getSDTElement('topsheet-render-container');
            if (container) {
                container.style.fontFamily = currentFont;
            }

            const savedSize = localStorage.getItem('sdt_font_size');
            const slider = getSDTElement('font-size-slider');
            if (savedSize && slider) {
                slider.value = savedSize;
                updateStudentDataTopsheetFontSize(savedSize);
            }
        }

        function populateStudentDataTopsheetDropdowns() {
            const examSelect = getSDTElement('filter-exam');
            const buildingSelect = getSDTElement('filter-building');
            const classSelect = getSDTElement('filter-class');

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
            const rInfo = sData.roomGenders ? sData.roomGenders[roomNo] : null;
            if (rInfo) {
                if (rInfo.female > 0 && rInfo.male === 0) return ' (মহিলা)';
                if (rInfo.male > 0 && rInfo.female === 0) return ' (পুরুষ)';
                if (rInfo.female > 0 && rInfo.male > 0) return ' (যৌথ)';
                if (rInfo.roomGenderAttr) {
                    const attr = String(rInfo.roomGenderAttr).toLowerCase();
                    if (/female|girl|girls|ছাত্রী|মহিলা/i.test(attr)) return ' (মহিলা)';
                    if (/male|boy|boys|ছাত্র|পুরুষ/i.test(attr)) return ' (পুরুষ)';
                    if (/both|co|যৌথ/i.test(attr)) return ' (যৌথ)';
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
                        roomsSet: new Set(['১০১', '১০২', '১০৩', '১০৪', '১০৫', '১০৬', '১০৭', '১০৮']),
                        classesData: {
                            'Play': { '১০১': 10, '১০২': 2, '১০৩': 2, '১০৪': 2, '১০৫': 2, '১০৬': 2, '১০৭': 2, '১০৮': 2 },
                            'Nursery': { '১০১': 15, '১০২': 5, '১০৩': 5, '১০৪': 5, '১০৫': 5, '১০৬': 5, '১০৭': 5, '১০৮': 5 },
                            'KG': { '১০১': 20, '১০২': 10, '১০৩': 10, '১০৪': 10, '১০৫': 10, '১০৬': 10, '১০৭': 10, '১০৮': 10 },
                            'Class 1': { '১০১': 0, '১০২': 15, '১০৩': 15, '১০৪': 15, '১০৫': 15, '১০৬': 15, '১০৭': 15, '১০৮': 15 },
                            'Class 2': { '১০১': 0, '১০২': 0, '১০৩': 20, '১০৪': 20, '১০৫': 20, '১০৬': 20, '১০৭': 20, '১০৮': 20 },
                            'Class 3': { '১০১': 0, '১০২': 0, '১০৩': 0, '১০৪': 25, '১০৫': 25, '১০৬': 25, '১০৭': 25, '১০৮': 25 }
                        }
                    },
                    'Afternoon Shift': {
                        shiftInfo: { name: 'বিকাল', time: '01:30 PM - 04:00 PM' },
                        rooms: ['১০১', '১০২', '১০৩', '১০৪', '১০৫', '১০৬', '১০৭', '১০৮'],
                        roomsSet: new Set(['১০১', '১০২', '১০৩', '১০৪', '১০৫', '১০৬', '১০৭', '১০৮']),
                        classesData: {
                            'Class 6': { '১০১': 25, '১০২': 25, '১০৩': 25, '১০৪': 25, '১০৫': 25, '১০৬': 25, '১০৭': 25, '১০৮': 25 },
                            'Class 7': { '১০১': 20, '১০২': 20, '১০৩': 20, '১০৪': 20, '১০৫': 20, '১০৬': 20, '১০৭': 20, '১০৮': 20 },
                            'Class 8': { '১০১': 15, '১০২': 15, '১০৩': 15, '১০৪': 15, '১০৫': 15, '১০৬': 15, '১০৭': 15, '১০৮': 15 }
                        }
                    }
                }
            };
        }

        function getStudentDataTopsheetLang() {
            return getSDTElement('filter-lang')?.value || 'bn';
        }

        function formatNumberByLang(num, lang) {
            if (num === null || num === undefined || num === '') return '-';
            const nStr = String(num);
            if (nStr === '-' || nStr === '0') {
                return nStr === '0' ? (lang === 'en' ? '0' : toBengaliNumerals(0)) : '-';
            }
            if (lang === 'en') {
                const bnToEnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
                return nStr.split('').map(c => bnToEnMap[c] || c).join('');
            }
            return toBengaliNumerals(nStr);
        }

        function formatClassNameByLang(clsName, lang) {
            const clean = String(clsName || '').trim();
            const classMap = {
                'play': { bn: 'প্লে', en: 'Play' },
                'nursery': { bn: 'নার্সারি', en: 'Nursery' },
                'kg': { bn: 'কেজি', en: 'KG' },
                'class 1': { bn: '১ম শ্রেণি', en: 'Class 1' },
                'class 2': { bn: '২য় শ্রেণি', en: 'Class 2' },
                'class 3': { bn: '৩য় শ্রেণি', en: 'Class 3' },
                'class 4': { bn: '৪র্থ শ্রেণি', en: 'Class 4' },
                'class 5': { bn: '৫ম শ্রেণি', en: 'Class 5' },
                'class 6': { bn: '৬ষ্ঠ শ্রেণি', en: 'Class 6' },
                'class 7': { bn: '৭ম শ্রেণি', en: 'Class 7' },
                'class 8': { bn: '৮ম শ্রেণি', en: 'Class 8' },
                'class 9': { bn: '৯ম শ্রেণি', en: 'Class 9' },
                'class 10': { bn: '১০ম শ্রেণি', en: 'Class 10' }
            };

            const low = clean.toLowerCase();
            if (classMap[low]) {
                if (lang === 'en') return classMap[low].en;
                if (lang === 'both') return `${classMap[low].bn} (${classMap[low].en})`;
                return classMap[low].bn;
            }
            return clean;
        }

        function formatShiftInfoByLang(rawShift, lang) {
            let info = formatShiftInfo(rawShift);
            let nameBn = info.name || 'সকাল';
            let nameEn = 'Morning';
            const clean = String(rawShift).toLowerCase();

            if (clean.includes('afternoon') || clean.includes('বিকাল') || clean.includes('দুপুর')) {
                nameBn = 'বিকাল';
                nameEn = 'Afternoon';
            } else if (clean.includes('morning') || clean.includes('সকাল')) {
                nameBn = 'সকাল';
                nameEn = 'Morning';
            }

            let dispName = nameBn;
            if (lang === 'en') dispName = nameEn;
            if (lang === 'both') dispName = `${nameBn} (${nameEn})`;

            return {
                name: dispName,
                time: info.time || ''
            };
        }

        function formatBuildingNameByLang(bName, lang) {
            const clean = String(bName || 'ভবন ক');
            if (lang === 'en') {
                if (clean.includes('ভবন ক')) return 'Building A';
                if (clean.includes('ভবন খ')) return 'Building B';
                if (clean.includes('ভবন গ')) return 'Building C';
                return clean.replace(/ভবন/g, 'Building');
            }
            if (lang === 'both') {
                if (clean.includes('ভবন ক')) return 'ভবন ক (Building A)';
                if (clean.includes('ভবন খ')) return 'ভবন খ (Building B)';
                if (clean.includes('ভবন গ')) return 'ভবন গ (Building C)';
                return `${clean} (Building)`;
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
            const enNum = String(roomNo).replace(/\\D/g, '') || String(roomNo);

            if (lang === 'en') {
                return enNum + suffix.replace('মহিলা', 'Female').replace('পুরুষ', 'Male').replace('যৌথ', 'Combined');
            }
            if (lang === 'both') {
                return `${bnNum} (${enNum})${suffix}`;
            }
            return bnNum + suffix;
        }

        function updateStudentDataTopsheetLive() {
            populateStudentDataTopsheetDropdowns();
            initStudentDataTopsheetFontFamily();

            const lang = getStudentDataTopsheetLang();
            const examVal = getSDTElement('filter-exam')?.value || 'all';
            const shiftVal = getSDTElement('filter-shift')?.value || 'all';
            const buildingVal = getSDTElement('filter-building')?.value || 'all';
            const classVal = getSDTElement('filter-class')?.value || 'all';
            const searchVal = (getSDTElement('search-student')?.value || '').toLowerCase().trim();

            const schoolSettings = safeJsonParse('school_settings', {});
            const schoolName = schoolSettings.schoolName || 'আল-হাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যা তীর্থ উচ্চ বিদ্যালয়';

            const store = safeJsonParse('school_seat_plans_store', {});
            const savedAlloc = safeJsonParse('school_saved_seat_allocations', null);

            let activeAllocations = [];
            let activeExamName = 'বার্ষিক পরীক্ষা - ২০২৬';
            let hasSavedPlans = false;

            if (examVal !== 'all') {
                activeExamName = examVal;
            } else if (store && typeof store === 'object' && Object.keys(store).length > 0) {
                const firstKey = Object.keys(store)[0];
                if (store[firstKey]?.examName) {
                    activeExamName = store[firstKey].examName;
                }
            }

            // 1. Gather all allocations across store matching Exam filter
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

            const container = getSDTElement('topsheet-render-container');
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
                        const na = parseInt(String(a).replace(/\\D/g, '')) || 0;
                        const nb = parseInt(String(b).replace(/\\D/g, '')) || 0;
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

        function printStudentDataTopsheet() {
            document.body.classList.add('print-student-data-topsheet-mode');
            window.print();
            setTimeout(() => {
                document.body.classList.remove('print-student-data-topsheet-mode');
            }, 1000);
        }

        function downloadStudentDataTopsheetPDF() {
            const container = getSDTElement('topsheet-render-container');
            if (!container || !container.innerHTML.trim()) {
                alert('ডাউনলোড করার মতো কোনো টপশীট পাওয়া যায়নি!');
                return;
            }
            if (typeof html2pdf === 'function') {
                const opt = {
                    margin: [0.3, 0.3, 0.3, 0.3],
                    filename: 'Student_Data_Topsheet.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
                };
                html2pdf().set(opt).from(container).save();
            } else {
                printStudentDataTopsheet();
            }
        }

        function refreshStudentDataTopsheetData() {
            updateStudentDataTopsheetLive();
        }

        window.updateStudentDataTopsheetLive = updateStudentDataTopsheetLive;
        window.populateStudentDataTopsheetDropdowns = populateStudentDataTopsheetDropdowns;
        window.updateStudentDataTopsheetFontSize = updateStudentDataTopsheetFontSize;
        window.updateStudentDataTopsheetFontFamily = updateStudentDataTopsheetFontFamily;
        window.printStudentDataTopsheet = printStudentDataTopsheet;
        window.downloadStudentDataTopsheetPDF = downloadStudentDataTopsheetPDF;
'''

# Insert JS before closing script tag
if 'function updateStudentDataTopsheetLive' not in seat_plan:
    # Find last </script>
    last_script_pos = seat_plan.rfind('</script>')
    if last_script_pos != -1:
        seat_plan = seat_plan[:last_script_pos] + sdt_engine_js + '\n' + seat_plan[last_script_pos:]
        print("✓ Added Student Data Topsheet JS Engine.")
    else:
        print("Warning: Could not find closing script tag!")
else:
    print("- JS Engine already present.")

# =========================================================================
# 7. UPDATE switchSeatTab IN seat-plan.html
# =========================================================================
switch_tab_sdt_handler = '''                } else if (tabName === 'student-data-topsheet' || tabName === 'student_data_topsheet' || tabName === 'student-topsheet' || tabName === 'topsheet') {
                    if (titleEl) titleEl.innerText = "Student Data Topsheet (শিক্ষার্থীর তথ্য টপশীট)";
                    if (subTitleEl) subTitleEl.innerText = "A4 Landscape preview of building and shift-wise student counts across all examination rooms";
                    if (typeof updateStudentDataTopsheetLive === 'function') {
                        updateStudentDataTopsheetLive();
                    }
'''

if "tabName === 'student-data-topsheet'" not in seat_plan:
    # Insert right before 'admit-card' handler
    admit_tab_pos = seat_plan.find("else if (tabName === 'admit-card')")
    if admit_tab_pos != -1:
        seat_plan = seat_plan[:admit_tab_pos] + switch_tab_sdt_handler + '                } ' + seat_plan[admit_tab_pos+5:]
        print("✓ Added student-data-topsheet handler to switchSeatTab.")
    else:
        print("Warning: Could not find admit-card branch in switchSeatTab!")
else:
    print("- switchSeatTab handler already present.")

# =========================================================================
# 8. UPDATE DOMContentLoaded & popstate ROUTERS
# =========================================================================
router_sdt_check = '''} else if (viewParam === 'student-data-topsheet' || viewParam === 'student_data_topsheet' || viewParam === 'student-topsheet' || viewParam === 'topsheet') {
                    targetTab = 'student-data-topsheet';
                '''

if "viewParam === 'student-data-topsheet'" not in seat_plan:
    seat_plan = re.sub(
        r'(\}\s*else\s*if\s*\(\s*viewParam\s*===\s*[\'"]student-attendance[\'"][^\)]*\)\s*\{[^}]*\})',
        r'\1 else if (viewParam === \'student-data-topsheet\' || viewParam === \'student_data_topsheet\' || viewParam === \'student-topsheet\' || viewParam === \'topsheet\') {\n                    targetTab = \'student-data-topsheet\';\n                }',
        seat_plan
    )
    print("✓ Updated DOMContentLoaded & popstate router handlers.")
else:
    print("- Router handlers already present.")

# =========================================================================
# 9. SAVE seat-plan.html
# =========================================================================
with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_plan)

print("Saved updated seat-plan.html successfully!")


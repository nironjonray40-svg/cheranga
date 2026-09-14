# -*- coding: utf-8 -*-
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

print("Starting Student Attendance Sheet merge into seat-plan.html...")

# =========================================================================
# 1. READ SEAT-PLAN.HTML
# =========================================================================
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_plan_content = f.read()

# =========================================================================
# 1.1 CSS TO ADD
# =========================================================================
attendance_css = '''
        /* ==========================================================================
           STUDENT ATTENDANCE SHEET STYLES (MERGED FROM Student attendance sheet.html)
           ========================================================================== */
        #subview-student-attendance {
            font-family: 'Noto Rashi Hebrew', 'Tiro Bangla', 'SolaimanLipi', 'Kalpurush', serif;
        }

        #subview-student-attendance .container {
            width: 100%;
            max-width: 13in;
            min-height: 8.5in;
            margin: 0 auto 30px auto;
            background-color: #fff;
            padding: 20px;
            box-sizing: border-box;
            border-radius: 4px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            page-break-after: always;
            position: relative;
        }

        #subview-student-attendance .header-section {
            text-align: center;
            margin-bottom: 5px;
            position: relative;
        }

        #subview-student-attendance .header-logo {
            position: absolute;
            left: 0;
            top: 0;
            height: 72px;
            width: auto;
        }

        #subview-student-attendance .school-name {
            font-size: 26.4px;
            font-weight: bold;
            margin: 0;
            padding: 0;
            line-height: 1.2;
            color: #000000;
        }

        #subview-student-attendance .exam-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.0399in 0;
        }

        #subview-student-attendance .class-placeholder,
        #subview-student-attendance .class-name {
            font-size: 17.71px;
            font-weight: bold;
            flex: 1;
            color: #000000;
        }

        #subview-student-attendance .class-placeholder {
            visibility: hidden;
        }

        #subview-student-attendance .class-name {
            text-align: right;
        }

        #subview-student-attendance .exam-name {
            font-size: 19.8px;
            font-weight: normal;
            margin: 0;
            padding: 0;
            line-height: 1.2;
            text-align: center;
            flex: 2;
            color: #000000;
        }

        #subview-student-attendance .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 4px;
        }

        #subview-student-attendance .room-no,
        #subview-student-attendance .student-count {
            font-size: 17.71px;
            font-weight: bold;
            flex: 1.2;
            color: #000000;
        }

        #subview-student-attendance .room-no {
            text-align: left;
        }

        #subview-student-attendance .student-count {
            text-align: right;
        }

        #subview-student-attendance .sheet-title {
            font-size: 22.26px;
            font-weight: bold;
            margin: 0;
            padding: 0;
            line-height: 1.2;
            text-align: center;
            flex: 2;
            color: #000000;
        }

        #subview-student-attendance table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            border: 1px solid #000000 !important;
            background-color: #ffffff;
        }

        #subview-student-attendance th,
        #subview-student-attendance td {
            border: 1px solid #000000 !important;
            text-align: center;
            vertical-align: middle;
            font-size: 15.4px;
            height: 38px;
            padding: 4px;
            color: #000000;
        }

        #subview-student-attendance thead th {
            margin-top: 0;
            margin-bottom: 0;
            padding-top: 2px;
            padding-bottom: 2px;
            font-weight: bold;
        }

        #subview-student-attendance .sig-header-cell {
            height: 34px !important;
            padding-top: 2px !important;
            padding-bottom: 0px !important;
            line-height: 1.15;
        }

        #subview-student-attendance .col-sl {
            width: 2.2%;
        }

        #subview-student-attendance .col-roll {
            width: 5.2%;
        }

        #subview-student-attendance .col-name {
            width: calc(17.75% - 0.1in);
        }

        #subview-student-attendance .student-name {
            text-align: left;
            padding-left: 12px;
            padding-right: 12px;
            font-size: 17.8px;
            color: #000000;
        }

        #subview-student-attendance .invigilator-row td {
            font-weight: bold;
            height: 42px;
        }

        #subview-student-attendance .present-count-row td {
            font-weight: bold;
            height: 21px;
        }

        #subview-student-attendance .invigilator-label {
            text-align: right;
            padding-right: 10px;
            font-weight: bold;
        }

        /* PRINT STYLES FOR ATTENDANCE SHEET */
        @media print {
            body.print-attendance-sheet-mode .main-nav,
            body.print-attendance-sheet-mode .nav-wrapper,
            body.print-attendance-sheet-mode .hero-slider-container,
            body.print-attendance-sheet-mode .notice-bar,
            body.print-attendance-sheet-mode .school-header,
            body.print-attendance-sheet-mode .sub-nav-tabs,
            body.print-attendance-sheet-mode .no-print,
            body.print-attendance-sheet-mode .modal-overlay,
            body.print-attendance-sheet-mode footer,
            body.print-attendance-sheet-mode .bg-grid-overlay,
            body.print-attendance-sheet-mode .blob,
            body.print-attendance-sheet-mode .seat-sub-view:not(#subview-student-attendance) {
                display: none !important;
            }

            body.print-attendance-sheet-mode {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            body.print-attendance-sheet-mode #subview-student-attendance {
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            body.print-attendance-sheet-mode #subview-student-attendance .container {
                width: 100% !important;
                max-width: none !important;
                min-height: auto !important;
                padding: 0 !important;
                box-shadow: none !important;
                margin-bottom: 0 !important;
                page-break-after: always;
            }
        }
'''

# Insert CSS before </style>
if '#subview-student-attendance' not in seat_plan_content:
    seat_plan_content = seat_plan_content.replace('</style>', attendance_css + '\n    </style>', 1)
    print("Added CSS for #subview-student-attendance.")
else:
    print("CSS already present.")

# =========================================================================
# 1.2 NAVBAR DROPDOWN LINK IN seat-plan.html
# =========================================================================
target_nav_item = '''                        <li><a href="seat-plan?view=room-topshet"
                                onclick="switchSeatTab('room-topshet'); return false;">Room Seat Topshet (কক্ষের আসন টপশীট)</a></li>'''

replacement_nav_item = '''                        <li><a href="seat-plan?view=room-topshet"
                                onclick="switchSeatTab('room-topshet'); return false;">Room Seat Topshet (কক্ষের আসন টপশীট)</a></li>
                        <li><a href="seat-plan?view=student-attendance"
                                onclick="switchSeatTab('student-attendance'); return false;">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>'''

if 'seat-plan?view=student-attendance' not in seat_plan_content:
    if target_nav_item in seat_plan_content:
        seat_plan_content = seat_plan_content.replace(target_nav_item, replacement_nav_item)
        print("Added Student Attendance Sheet to navbar dropdown.")
    else:
        print("Warning: target_nav_item not found for exact replacement, using regex.")
        seat_plan_content = re.sub(
            r'(<li><a\s+href=["\']seat-plan\?view=room-topshet["\'][^>]*>.*?</a></li>)',
            r'\1\n                        <li><a href="seat-plan?view=student-attendance" onclick="switchSeatTab(\'student-attendance\'); return false;">Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)</a></li>',
            seat_plan_content
        )

# =========================================================================
# 1.3 SUB-NAV TAB BUTTON IN seat-plan.html
# =========================================================================
target_tab_btn = '''                <button class="sub-tab-btn" id="btn-tab-room-topshet" onclick="switchSeatTab('room-topshet')">
                    📋 Room Seat Topshet
                </button>'''

replacement_tab_btn = '''                <button class="sub-tab-btn" id="btn-tab-room-topshet" onclick="switchSeatTab('room-topshet')">
                    📋 Room Seat Topshet
                </button>
                <button class="sub-tab-btn" id="btn-tab-student-attendance" onclick="switchSeatTab('student-attendance')">
                    📝 Student Attendance Sheet
                </button>'''

if 'id="btn-tab-student-attendance"' not in seat_plan_content:
    if target_tab_btn in seat_plan_content:
        seat_plan_content = seat_plan_content.replace(target_tab_btn, replacement_tab_btn)
        print("Added sub-tab button for Student Attendance Sheet.")
    else:
        print("Warning: target_tab_btn not found directly, trying regex.")
        seat_plan_content = re.sub(
            r'(<button[^>]*id=["\']btn-tab-room-topshet["\'][^>]*>.*?</button>)',
            r'\1\n                <button class="sub-tab-btn" id="btn-tab-student-attendance" onclick="switchSeatTab(\'student-attendance\')">\n                    📝 Student Attendance Sheet\n                </button>',
            seat_plan_content
        )

# =========================================================================
# 1.4 SUBVIEW HTML FOR #subview-student-attendance
# =========================================================================
attendance_subview_html = '''
            <!-- TAB: STUDENT ATTENDANCE SHEET (MERGED FROM Student attendance sheet.html) -->
            <div id="subview-student-attendance" class="seat-sub-view">

                <!-- Filter Control Panel -->
                <div class="control-panel no-print"
                    style="max-width: 13in; margin: 0 auto 15px auto; background: #ffffff; padding: 14px 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1.5px solid #cbd5e1; box-sizing: border-box;">
                    <div style="display: flex; gap: 12px 20px; flex-wrap: wrap; align-items: center;">

                        <!-- Class Filter -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label for="attendance-sheet-filter-class" style="font-weight: 700; font-size: 0.9rem; color: #475569;">শ্রেণি (Class):</label>
                            <select id="attendance-sheet-filter-class" onchange="updateAttendanceSheetLive()"
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #ffffff; color: #1e293b;">
                                <option value="all">All Classes</option>
                            </select>
                        </div>

                        <!-- Exam Filter -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label for="attendance-sheet-filter-exam" style="font-weight: 700; font-size: 0.9rem; color: #475569;">পরীক্ষা (Exam):</label>
                            <select id="attendance-sheet-filter-exam" onchange="updateAttendanceSheetLive()"
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #ffffff; color: #1e293b;">
                                <option value="all">সকল পরীক্ষা (All Exams / Routine Title)</option>
                            </select>
                        </div>

                        <!-- Shift Filter -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label for="attendance-sheet-filter-shift" style="font-weight: 700; font-size: 0.9rem; color: #475569;">শিফট (Shift):</label>
                            <select id="attendance-sheet-filter-shift" onchange="updateAttendanceSheetLive()"
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #ffffff; color: #1e293b;">
                                <option value="all">All Shifts</option>
                                <option value="Morning Shift">Morning Shift</option>
                                <option value="Afternoon Shift">Afternoon Shift</option>
                            </select>
                        </div>

                        <!-- Language Filter -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label for="attendance-sheet-filter-lang" style="font-weight: 700; font-size: 0.9rem; color: #475569;">ভাষা (Language):</label>
                            <select id="attendance-sheet-filter-lang" onchange="updateAttendanceSheetLive()"
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #ffffff; color: #1e293b;">
                                <option value="en" selected>English</option>
                                <option value="bn">বাংলা (Bangla)</option>
                                <option value="both">বাংলা + English</option>
                            </select>
                        </div>

                        <!-- Font Size Slider -->
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <label for="attendance-sheet-font-size-slider" style="font-weight: 700; font-size: 0.9rem; color: #475569;">লেখার সাইজ (Font):</label>
                            <input type="range" id="attendance-sheet-font-size-slider" min="10" max="18" value="14" step="0.5"
                                oninput="updateAttendanceSheetFontSize(this.value)"
                                style="width: 90px; cursor: pointer; accent-color: #0284c7;">
                            <span id="attendance-sheet-font-size-val" style="font-weight: 800; font-size: 0.9rem; color: #0284c7; min-width: 38px;">14px</span>
                        </div>

                        <!-- Student Search -->
                        <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1; min-width: 200px;">
                            <label for="attendance-sheet-search-student" style="font-weight: 700; font-size: 0.9rem; color: #475569;">অনুসন্ধান (Search):</label>
                            <input type="text" id="attendance-sheet-search-student" oninput="updateAttendanceSheetLive()"
                                placeholder="ID, নাম বা রুম দিয়ে খুঁজুন..."
                                style="padding: 6px 12px; border-radius: 6px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.9rem; font-weight: 600; flex-grow: 1; box-sizing: border-box; background: #ffffff; color: #1e293b;">
                        </div>

                        <!-- PDF Download & Print Buttons -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button type="button" id="attendance-sheet-btn-download-pdf" onclick="downloadStudentAttendancePDF()"
                                style="padding: 6px 14px; border-radius: 6px; border: none; background: #059669; color: #ffffff; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);">
                                📥 PDF ডাউনলোড
                            </button>
                            <button type="button" onclick="printStudentAttendanceSheet()"
                                style="padding: 6px 14px; border-radius: 6px; border: none; background: #0284c7; color: #ffffff; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);">
                                🖨️ প্রিন্ট
                            </button>
                        </div>

                    </div>
                </div>

                <!-- Pages Container for Multi-Page Grouped Attendance Sheets -->
                <div id="attendance-pages-container" style="width: 100%; display: flex; flex-direction: column; align-items: center;"></div>

            </div>
'''

# Insert subview after subview-room-topshet
if 'id="subview-student-attendance"' not in seat_plan_content:
    # Find closing tag of subview-room-topshet
    # It starts at <div id="subview-room-topshet" and ends before next tab or main content
    target_pos = seat_plan_content.find('<!-- TAB: ADMIT CARD & ROUTINE -->')
    if target_pos != -1:
        seat_plan_content = seat_plan_content[:target_pos] + attendance_subview_html + '\n' + seat_plan_content[target_pos:]
        print("Added #subview-student-attendance HTML.")
    else:
        # Fallback: search for subview-room-topshet closing
        room_pos = seat_plan_content.find('id="subview-room-topshet"')
        if room_pos != -1:
            next_view_pos = seat_plan_content.find('<div id="subview-', room_pos + 30)
            if next_view_pos != -1:
                seat_plan_content = seat_plan_content[:next_view_pos] + attendance_subview_html + '\n' + seat_plan_content[next_view_pos:]
                print("Added #subview-student-attendance before next subview.")
else:
    print("#subview-student-attendance HTML already present.")

# Save intermediate
with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_plan_content)

print("Saved seat-plan.html with CSS and HTML.")

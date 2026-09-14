# -*- coding: utf-8 -*-
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

print("Starting comprehensive verification...")

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

checks = [
    ("CSS #subview-student-attendance present", '#subview-student-attendance' in seat_content),
    ("CSS body.print-attendance-sheet-mode present", 'body.print-attendance-sheet-mode' in seat_content),
    ("Tab Button btn-tab-student-attendance present", 'id="btn-tab-student-attendance"' in seat_content),
    ("Dropdown link seat-plan?view=student-attendance present", 'seat-plan?view=student-attendance' in seat_content or 'seat-plan.html?view=student-attendance' in seat_content),
    ("Subview subview-student-attendance present", 'id="subview-student-attendance"' in seat_content),
    ("Filter Class attendance-sheet-filter-class present", 'id="attendance-sheet-filter-class"' in seat_content),
    ("Filter Exam attendance-sheet-filter-exam present", 'id="attendance-sheet-filter-exam"' in seat_content),
    ("Filter Shift attendance-sheet-filter-shift present", 'id="attendance-sheet-filter-shift"' in seat_content),
    ("Filter Lang attendance-sheet-filter-lang present", 'id="attendance-sheet-filter-lang"' in seat_content),
    ("Font Size Slider attendance-sheet-font-size-slider present", 'id="attendance-sheet-font-size-slider"' in seat_content),
    ("Search Student attendance-sheet-search-student present", 'id="attendance-sheet-search-student"' in seat_content),
    ("PDF Download Button attendance-sheet-btn-download-pdf present", 'id="attendance-sheet-btn-download-pdf"' in seat_content),
    ("Pages Container attendance-pages-container present", 'id="attendance-pages-container"' in seat_content),
    ("Function getAttendanceAllStudentsList defined", 'function getAttendanceAllStudentsList(' in seat_content),
    ("Function populateAttendanceSheetClassFilter defined", 'function populateAttendanceSheetClassFilter(' in seat_content),
    ("Function populateAttendanceSheetExamFilter defined", 'function populateAttendanceSheetExamFilter(' in seat_content),
    ("Function populateAttendanceSheetShiftFilter defined", 'function populateAttendanceSheetShiftFilter(' in seat_content),
    ("Function updateAttendanceSheetFontSize defined", 'function updateAttendanceSheetFontSize(' in seat_content),
    ("Function getAttendanceSubjectShortName defined", 'function getAttendanceSubjectShortName(' in seat_content),
    ("Function getAttendanceSingleSubjectBangla defined", 'function getAttendanceSingleSubjectBangla(' in seat_content),
    ("Function getAttendanceSubjectHeaderDisplay defined", 'function getAttendanceSubjectHeaderDisplay(' in seat_content),
    ("Function formatAttendanceRoutineDateForHeader defined", 'function formatAttendanceRoutineDateForHeader(' in seat_content),
    ("Function getRoutineSubjectsForAttendanceSheet defined", 'function getRoutineSubjectsForAttendanceSheet(' in seat_content),
    ("Function updateAttendanceSheetLive defined", 'function updateAttendanceSheetLive(' in seat_content),
    ("Function refreshStudentAttendanceData defined", 'function refreshStudentAttendanceData(' in seat_content),
    ("Function downloadStudentAttendancePDF defined", 'function downloadStudentAttendancePDF(' in seat_content),
    ("Function printStudentAttendanceSheet defined", 'function printStudentAttendanceSheet(' in seat_content),
    ("switchSeatTab handles student-attendance", "tabName === 'student-attendance'" in seat_content),
    ("switchExamDocument routes Student attendance sheet", "if (fileName === 'Student attendance sheet.html'" in seat_content or "includes('attendance sheet')" in seat_content),
    ("Room Seat Topshet subview intact", 'id="subview-room-topshet"' in seat_content),
    ("Room Seat Topshet CSS intact", '#subview-room-topshet' in seat_content),
    ("Room Seat Topshet updateRoomTopshetLive intact", 'function updateRoomTopshetLive(' in seat_content),
    ("Room Seat Topshet refreshRoomTopshetData intact", 'function refreshRoomTopshetData(' in seat_content),
    ("Seating Details subview intact", 'id="subview-seating-details"' in seat_content),
    ("Admit Card subview intact", 'id="subview-admit-card"' in seat_content)
]

all_passed = True
for name, passed in checks:
    status = "✅ PASS" if passed else "❌ FAIL"
    if not passed: all_passed = False
    print(f"{status}: {name}")

print("\nAll checks passed:", all_passed)

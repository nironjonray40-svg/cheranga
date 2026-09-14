# -*- coding: utf-8 -*-
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/attendance_script_3.js', 'r', encoding='utf-8') as f:
    js_text = f.read()

# Let's inspect getRoutineSubjectsForAttendanceSheet
match = re.search(r'function getRoutineSubjectsForAttendanceSheet\([^)]*\)\s*\{.*?\n        \}', js_text, re.DOTALL)
if match:
    print("getRoutineSubjectsForAttendanceSheet:")
    print(match.group(0)[:1500])

# Let's inspect downloadStudentAttendancePDF
match = re.search(r'function downloadStudentAttendancePDF\([^)]*\)\s*\{.*?\n        \}', js_text, re.DOTALL)
if match:
    print("\ndownloadStudentAttendancePDF:")
    print(match.group(0)[:1500])

# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

# Let's inspect getAttendanceAllStudentsList and updateAttendanceSheetLive in seat-plan.html
match1 = re.search(r'function getAttendanceAllStudentsList\(\)\s*\{.*?\n        \}', seat_content, re.DOTALL)
if match1:
    print("getAttendanceAllStudentsList found! Length:", len(match1.group(0)))
    print(match1.group(0)[:1500])

match2 = re.search(r'function updateAttendanceSheetLive\(\)\s*\{.*?\n        \}', seat_content, re.DOTALL)
if match2:
    print("\nupdateAttendanceSheetLive found! Length:", len(match2.group(0)))
    print(match2.group(0)[:1500])

match3 = re.search(r'function populateAttendanceSheetClassFilter\(\)\s*\{.*?\n        \}', seat_content, re.DOTALL)
if match3:
    print("\npopulateAttendanceSheetClassFilter found! Length:", len(match3.group(0)))
    print(match3.group(0)[:1500])

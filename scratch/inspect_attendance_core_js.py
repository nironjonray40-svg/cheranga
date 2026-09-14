# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/attendance_script_3.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

print("Full length of attendance JS:", len(js_content))

# Let's inspect getAllStudentsList
match = re.search(r'function getAllStudentsList\(\)\s*\{.*?\n        \}', js_content, re.DOTALL)
if match:
    print("\n--- getAllStudentsList ---")
    print(match.group(0))

# Let's inspect updateAttendanceSheetLive
match = re.search(r'function updateAttendanceSheetLive\(\)\s*\{.*?\n        \}', js_content, re.DOTALL)
if match:
    print("\n--- updateAttendanceSheetLive length ---", len(match.group(0)))
    print("Snippet (start):\n", match.group(0)[:2500])
    print("\nSnippet (end):\n", match.group(0)[-2500:])

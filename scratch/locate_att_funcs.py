import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'function getAllStudentsList' in line or 'function renderAttendanceSheetPages' in line:
        print(f"Line {idx+1}: {line.strip()}")

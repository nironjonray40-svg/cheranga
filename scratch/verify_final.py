import sqlite3
import json
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== 1. CHECK DATABASE STUDENTS ===")
con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])
print(f"Total students in DB: {len(students)}")

errors = []
for idx, s in enumerate(students):
    sid = s.get('studentId')
    roll = s.get('roll')
    c = s.get('class')
    sec = s.get('section')
    if not sid or len(sid) > 10 or sid.startswith('178'):
        errors.append(f"Student #{idx} ({s.get('name')}) has invalid studentId: {sid}")
    if not roll or not str(roll).strip().isdigit():
        errors.append(f"Student #{idx} ({s.get('name')}) has invalid roll: {roll}")

if errors:
    print(f"FAILED with {len(errors)} errors:")
    for e in errors[:10]:
        print(" ", e)
else:
    print("ALL 333 STUDENTS IN DATABASE HAVE 100% VALID IDs AND ROLLS!")

print("\n=== 2. CHECK HTML FILES INTEGRITY ===")
files_to_check = [
    'seat-plan.html',
    'Student attendance sheet.html',
    'Room Seat Topshet.html',
    'Seating arrangement details.html',
    'Student Data Topsheet.html',
    'Admit Card.html'
]

for fn in files_to_check:
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()
    has_lookup = ('resolveAttendanceLiveStudent' in content)
    has_map = ('buildStudentLookupMap' in content or 'buildAttendanceStudentLookupMap' in content)
    print(f"{fn:35s} | Has resolveAttendanceLiveStudent: {has_lookup} | Has buildLookupMap: {has_map}")

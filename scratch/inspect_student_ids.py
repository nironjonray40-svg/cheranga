import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()

cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])

print(f"Total students: {len(students)}")
id_patterns = {}
classes = {}
sections = {}
for s in students:
    sid = s.get('studentId')
    reg = s.get('regNo')
    roll = s.get('roll')
    c = s.get('class')
    sec = s.get('section')
    classes[c] = classes.get(c, 0) + 1
    sections[sec] = sections.get(sec, 0) + 1

print("\nClass distribution:")
for k, v in sorted(classes.items()):
    print(f"  {k}: {v}")

print("\nSection distribution:")
for k, v in sorted(sections.items()):
    print(f"  {k}: {v}")

print("\nSample students per class:")
for c in classes:
    sample = [s for s in students if s.get('class') == c][:3]
    print(f"\nClass {c} samples:")
    for s in sample:
        print(f"  ID: {s.get('studentId')}, Reg: {s.get('regNo')}, Roll: {s.get('roll')}, Name: {s.get('name')}, NameBn: {s.get('nameBn')}, Sec: {s.get('section')}, id: {s.get('id')}")

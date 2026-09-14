import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])

print("=== CLASS NINE STUDENTS ===")
for s in students:
    if s.get('class') == 'Nine':
        print(f"ID: {s.get('studentId')}, Reg: {s.get('regNo')}, Roll: {s.get('roll')}, Name: {s.get('name')}, NameBn: {s.get('nameBn')}, Sec: {s.get('section')}, Opt: {s.get('optionalSubject')}")

print("\n=== CLASS TEN STUDENTS ===")
for s in students:
    if s.get('class') == 'Ten':
        print(f"ID: {s.get('studentId')}, Reg: {s.get('regNo')}, Roll: {s.get('roll')}, Name: {s.get('name')}, NameBn: {s.get('nameBn')}, Sec: {s.get('section')}, Opt: {s.get('optionalSubject')}")

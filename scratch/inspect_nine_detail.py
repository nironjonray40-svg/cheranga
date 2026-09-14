import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])

print("=== CLASS NINE IN DETAIL ===")
for idx, s in enumerate(students):
    if s.get('class') == 'Nine':
        print(f"Index {idx:3d} | ID: {s.get('studentId')} | Roll: {s.get('roll')} | Reg: {s.get('regNo')} | Name: {s.get('name')} | Sec: {s.get('section')} | Opt: {s.get('optionalSubject')}")

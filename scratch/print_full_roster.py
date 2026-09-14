import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])

print("Total students:", len(students))
classes = {}
for s in students:
    c = s.get('class')
    classes.setdefault(c, []).append(s)

for c, s_list in sorted(classes.items()):
    print(f"\n==================== CLASS: {c} (Total: {len(s_list)}) ====================")
    sections = {}
    for s in s_list:
        sec = s.get('section')
        sections.setdefault(sec, []).append(s)
    
    for sec, sec_students in sorted(sections.items()):
        print(f"\n--- Section: {sec} (Count: {len(sec_students)}) ---")
        for idx, s in enumerate(sec_students):
            sid = s.get('studentId')
            roll = s.get('roll')
            reg = s.get('regNo')
            name = s.get('name')
            nameBn = s.get('nameBn')
            print(f"[{idx+1:2d}] ID: {sid:6s} | Roll: {str(roll):10s} | Reg: {str(reg):8s} | Name: {name} ({nameBn})")

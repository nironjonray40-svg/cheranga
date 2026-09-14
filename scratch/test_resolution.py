import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])

print("Total students:", len(students))
# Sample of resolved IDs
for s in students[:10]:
    sid = s.get('studentId')
    roll = s.get('roll')
    reg = s.get('regNo')
    c = s.get('class')
    sec = s.get('section')
    name = s.get('name')
    print(f"Class: {c:6s} | Sec: {sec:6s} | ID: {sid:6s} | Roll: {str(roll):4s} | Reg: {str(reg):8s} | Name: {name}")

print("\nClass 9 sample:")
for s in [st for st in students if st.get('class') == 'Nine'][:5]:
    print(f"Class: {s.get('class'):6s} | Sec: {s.get('section'):6s} | ID: {s.get('studentId'):6s} | Roll: {str(s.get('roll')):4s} | Reg: {str(s.get('regNo')):8s} | Name: {s.get('name')}")

print("\nClass 10 sample:")
for s in [st for st in students if st.get('class') == 'Ten'][:5]:
    print(f"Class: {s.get('class'):6s} | Sec: {s.get('section'):6s} | ID: {s.get('studentId'):6s} | Roll: {str(s.get('roll')):4s} | Reg: {str(s.get('regNo')):8s} | Name: {s.get('name')}")

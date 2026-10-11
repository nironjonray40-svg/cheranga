import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
r = cursor.fetchone()
students = json.loads(r[0])

for s in students:
    print(f"ID: {s.get('studentId')}, Roll: {s.get('roll')}, Class: {s.get('class')}, Sec: '{s.get('section')}', Grp: '{s.get('group')}', Name: {s.get('name')}, NameBn: {s.get('nameBn')}")

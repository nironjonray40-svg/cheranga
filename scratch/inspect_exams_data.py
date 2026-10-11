import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('exams_data.json', encoding='utf-8') as f:
    d = json.load(f)
    print(f"Number of exams in exams_data.json: {len(d)}")
    for e in d:
        print(f"  ID: {e.get('id')}, Name: {e.get('examName')}, Subject: {e.get('subject')}, Class: {e.get('class')}, TotalStudents: {len(e.get('students', []))}")

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_omr_exams'")
r = cursor.fetchone()
if r:
    omrs = json.loads(r[0])
    print(f"\nschool_omr_exams count: {len(omrs)}")
    for e in omrs:
        print(f"  OMR Exam: {e.get('examName')}, Sub: {e.get('subject')}, Cls: {e.get('class')}, Sec: {e.get('section')}")

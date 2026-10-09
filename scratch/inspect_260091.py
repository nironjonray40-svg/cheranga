import sys
sys.stdout.reconfigure(encoding='utf-8')
import sqlite3
import json

conn = sqlite3.connect('school.db')
cur = conn.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = cur.fetchone()
if row:
    marks = json.loads(row[0])
    for k, v in marks.items():
        if '260091' in k:
            print(k, "->", v)

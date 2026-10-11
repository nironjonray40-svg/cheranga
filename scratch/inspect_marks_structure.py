import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
r = cursor.fetchone()
if r:
    marks = json.loads(r[0])
    print(f"type of marks: {type(marks)}")
    if isinstance(marks, dict):
        keys = list(marks.keys())
        print(f"Total keys: {len(keys)}")
        for k in keys[:5]:
            print(f"Key: {k}")
            val = marks[k]
            print(f"   Value type: {type(val)}, sample: {json.dumps(val, ensure_ascii=False)[:200]}")

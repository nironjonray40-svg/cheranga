import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = c.fetchone()
if row:
    marks = json.loads(row[0])
    print("Type of school_student_marks:", type(marks))
    if isinstance(marks, dict):
        print("Keys count:", len(marks.keys()))
        for idx, (k, v) in enumerate(list(marks.items())[:10]):
            print(f"Key [{k}]: {type(v)} -> {str(v)[:150]}")
    elif isinstance(marks, list):
        print("Items count:", len(marks))
        for item in marks[:10]:
            print(item)
else:
    print("school_student_marks is empty or not found")

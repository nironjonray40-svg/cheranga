import sqlite3, json

c = sqlite3.connect('school.db').cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_student_marks', 'school_students')")
data = dict(c.fetchall())
with open('scratch/db_dump.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)
print("Dump ready!")

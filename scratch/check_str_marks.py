import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = c.fetchone()
marks = json.loads(row[0]) if row else {}

with open('scratch/string_marks.txt', 'w', encoding='utf-8') as out:
    for k, v in marks.items():
        if isinstance(v, str):
            out.write(f"{k}: {repr(v)}\n")

print("Done")

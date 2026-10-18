import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_exam_schedules'")
schedules = json.loads(c.fetchone()[0])
with open('scratch/exact_subjects.txt', 'w', encoding='utf-8') as out:
    for s in schedules:
        out.write(f"ID: {s.get('id')} | Term: {s.get('term')} | Class: {s.get('class')} | Subject: {s.get('subject')}\n")
print("Done")

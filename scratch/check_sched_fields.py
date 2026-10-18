import sqlite3, json
conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_exam_schedules'")
schedules = json.loads(c.fetchone()[0])
with open('scratch/schedules_fields.txt', 'w', encoding='utf-8') as out:
    for s in schedules:
        out.write(f"{s.get('term')} | {s.get('class')} | {s.get('subject')} | totalMarks: {s.get('totalMarks')} | fullMarks: {s.get('fullMarks')} | mcqMarks: {s.get('mcqMarks')} | cqMarks: {s.get('cqMarks')} | practicalMarks: {s.get('practicalMarks')}\n")
print("Done")

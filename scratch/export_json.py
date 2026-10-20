import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_exam_types', 'school_subjects')")
rows = dict(c.fetchall())

with open('scratch/exam_types.json', 'w', encoding='utf-8') as f:
    f.write(rows.get('school_exam_types', '[]'))

with open('scratch/exam_schedules.json', 'w', encoding='utf-8') as f:
    f.write(rows.get('school_exam_schedules', '[]'))

print("Clean json files exported.")

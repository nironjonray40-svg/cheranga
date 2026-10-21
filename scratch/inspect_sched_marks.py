import sqlite3, json

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key='school_student_marks'")
raw = cursor.fetchone()[0]
marks = json.loads(raw)

cursor.execute("SELECT value FROM local_storage_sync WHERE key='school_exam_schedules'")
schedules = json.loads(cursor.fetchone()[0])
e8_scheds = [s for s in schedules if 'eight' in (s.get('class') or '').lower() and s.get('term') == 'Elegileble test']
print('E8 Elegileble test schedule IDs:', [(s.get('id'), s.get('subject')) for s in e8_scheds])

sched_ids = set(s.get('id') for s in e8_scheds)

matched_marks = {}
for k, v in marks.items():
    for sid in sched_ids:
        if sid in k:
            matched_marks[k] = v

print(f'Total matched marks records for Elegileble test schedules: {len(matched_marks)}')
for k in list(matched_marks.keys())[:10]:
    print(k, '=>', matched_marks[k])

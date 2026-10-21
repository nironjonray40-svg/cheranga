import sqlite3, json

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key='school_student_marks'")
marks = json.loads(cursor.fetchone()[0])

cursor.execute("SELECT value FROM local_storage_sync WHERE key='school_exam_schedules'")
schedules = json.loads(cursor.fetchone()[0])
e8_scheds = [s for s in schedules if 'eight' in (s.get('class') or '').lower() and s.get('term') == 'Elegileble test']

st_id = '1788096574265-63478-0'
print(f'Student {st_id} marks for Class 8 Elegileble test:')
for s in e8_scheds:
    sid = s.get('id')
    sub = s.get('subject')
    rec = marks.get(f'marks_{st_id}_{sid}')
    print(f'  {sub} (sched {sid}): {rec}')

import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT key, value FROM local_storage_sync WHERE key = ?', ('school_exam_schedules',))
row = c.fetchone()
if row:
    schedules = json.loads(row[1])
    print(f'Total schedules: {len(schedules)}')
    for s in schedules:
        print(f"ID: {s.get('id')}, Term: {s.get('term')}, Sub: {s.get('subject')}, Class: {s.get('class')}, marksEntryTime: {s.get('marksEntryTime')}")

c.execute('SELECT key, value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
row = c.fetchone()
if row:
    marks = json.loads(row[1])
    print(f'Total marks keys: {len(marks)}')
    sample_keys = [k for k in marks.keys() if not k.startswith('timestamp_')][:10]
    for k in sample_keys:
        print(k, marks[k])

c.execute('SELECT key, value FROM local_storage_sync WHERE key = ?', ('school_omr_exams',))
row = c.fetchone()
if row:
    omr = json.loads(row[1])
    print(f'Total OMR exams: {len(omr)}')
    for o in omr:
        print(f"OMR ID: {o.get('id')}, Name: {o.get('examName')}, Sub: {o.get('subject')}, Students: {len(o.get('students', []))}")

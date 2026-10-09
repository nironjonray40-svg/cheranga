import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_exam_schedules'")
row = c.fetchone()
if row:
    schedules = json.loads(row[0])
    terms = set(s.get('term') for s in schedules if s.get('term'))
    print('Unique terms in schedules:', terms)
    for s in schedules:
        print(f"Schedule: {s.get('term')} | Class: {s.get('class')} | Subject: {s.get('subject')} | Date: {s.get('date')} | ID: {s.get('id')}")

# Also check saved OMR exams:
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_omr_exams'")
omr_row = c.fetchone()
if omr_row:
    omr_exams = json.loads(omr_row[0])
    print('school_omr_exams count:', len(omr_exams))
    for e in omr_exams:
        print(f"OMR Exam: {e.get('examName')} | Date: {e.get('date')} | Students: {len(e.get('students', []))}")
else:
    print('No school_omr_exams in DB')

conn.close()

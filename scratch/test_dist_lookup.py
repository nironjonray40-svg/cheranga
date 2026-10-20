import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_exam_types', 'school_subjects')")
rows = dict(c.fetchall())

schedules = json.loads(rows.get('school_exam_schedules', '[]'))
types = json.loads(rows.get('school_exam_types', '[]'))
subjects_map = json.loads(rows.get('school_subjects', '{}'))

print(f"Exam Types in DB: {[t.get('name') for t in types]}")
for t in types:
    sub_types = t.get('examTypes', [])
    print(f"  Exam: {t.get('name')}, Type: {t.get('type')}, defaultCQ: {t.get('defaultCQ')}, defaultMCQ: {t.get('defaultMCQ')}, subTypes: {[(st.get('typeName'), st.get('defaultCQ'), st.get('defaultMCQ'), st.get('defaultPractical')) for st in sub_types]}")

print("\nSchedules in DB:")
for s in schedules:
    print(f"  Class: {s.get('class')}, Term: {s.get('term')}, Subj: {s.get('subject')}, examType: {s.get('examType')}")

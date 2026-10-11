import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = c.fetchone()
marks = json.loads(row[1]) if row else {}

print(f"Total keys in school_student_marks: {len(marks)}")
for k, v in list(marks.items()):
    if '2606001' in k or '2606002' in k or '2606003' in k:
        print(f"Key: {k}")
        print(f"  Value: {json.dumps(v, ensure_ascii=False)}")

c.execute("SELECT key, value FROM local_storage_sync WHERE key = 'school_omr_exams'")
row2 = c.fetchone()
omr_exams = json.loads(row2[1]) if row2 else []
print(f"\nTotal school_omr_exams: {len(omr_exams)}")
for oe in omr_exams:
    print(f"  OMR Exam ID: {oe.get('id')}, name: {oe.get('examName')}, subject: {oe.get('subject')}, scheduleId: {oe.get('scheduleId')}, students: {len(oe.get('students', []))}")

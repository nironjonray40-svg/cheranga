import sys
sys.stdout.reconfigure(encoding='utf-8')
import sqlite3
import json

conn = sqlite3.connect('school.db')
cur = conn.cursor()
cur.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_student_marks', 'school_omr_exams', 'school_exam_schedules')")
rows = cur.fetchall()

for key, val in rows:
    data = json.loads(val)
    print(f"=== KEY: {key} (length: {len(data)})")
    if key == 'school_student_marks':
        for k in list(data.keys())[:15]:
            print(f"  {k} -> {data[k]}")
    elif key == 'school_exam_schedules':
        for s in data[:5]:
            print(f"  Schedule {s.get('id')}: {s.get('term')} - {s.get('subject')} (marksEntryTime: {s.get('marksEntryTime')})")
    elif key == 'school_omr_exams':
        for e in data[:3]:
            print(f"  OMR Exam {e.get('id')}: {e.get('examName')} (students: {len(e.get('students', []))})")
            if e.get('students'):
                st = e['students'][0]
                print(f"    first student: {st.get('id')} - {st.get('name')}, correct: {st.get('correct')}, status: {st.get('status')}")

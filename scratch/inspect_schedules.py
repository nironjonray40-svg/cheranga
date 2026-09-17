import sqlite3
import json
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_exam_types', 'school_subjects', 'school_student_marks')")
rows = dict(c.fetchall())
conn.close()

schedules = json.loads(rows.get('school_exam_schedules', '[]'))
print("Total schedules:", len(schedules))
for s in schedules:
    print("ID:", s.get('id'), "Class:", s.get('class'), "Subject:", s.get('subject'), "Term:", s.get('term'), "ExamType:", s.get('examType'))
    print("  Full obj:", json.dumps(s, indent=2))

exam_types = json.loads(rows.get('school_exam_types', '[]'))
print("\nExam Types count:", len(exam_types))
for et in exam_types[:3]:
    print("  ExamType:", et.get('name'), et.get('distribution'))

subjects = json.loads(rows.get('school_subjects', '[]'))
print("\nSubjects count:", len(subjects))
for sub in subjects[:5]:
    print("  Subject:", sub.get('name'), sub.get('class'), sub.get('code'), sub.get('type'), sub.get('practical'))

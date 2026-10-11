import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

def get_val(key):
    cursor.execute("SELECT value FROM local_storage_sync WHERE key = ?", (key,))
    r = cursor.fetchone()
    return json.loads(r[0]) if r else None

schedules = get_val('school_exam_schedules') or []
routines = get_val('school_exam_routines') or []
omrs = get_val('school_omr_exams') or []
subjects = get_val('school_subjects') or {}

print("=== EXAM SCHEDULES SUBJECTS ===")
for s in schedules:
    print(f"Term: '{s.get('term')}', Class: '{s.get('class')}', Subject: '{s.get('subject')}', ExamType: '{s.get('examType')}'")

print("\n=== EXAM ROUTINES (sample for 'বার্ষিক পরীক্ষা') ===")
r_by_class = {}
for r in routines:
    en = r.get('examName')
    cls = r.get('class')
    sub = r.get('subject')
    r_by_class.setdefault((en, cls), []).append(sub)

for (en, cls), subs in sorted(r_by_class.items()):
    print(f"Exam: '{en}', Class: '{cls}' -> {len(subs)} subjects: {subs[:4]}...")

print("\n=== OMR EXAMS ===")
for o in omrs:
    print(f"Exam: '{o.get('examName')}', Class: '{o.get('class')}', Subject: '{o.get('subject')}'")

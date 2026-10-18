import sqlite3, json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

def get_k(key):
    c.execute('SELECT value FROM local_storage_sync WHERE key = ?', (key,))
    row = c.fetchone()
    return json.loads(row[0]) if row else []

schedules = get_k('school_exam_schedules')
types = get_k('school_exam_types')

print("All types in school_exam_types:")
for t in types:
    print(" -", t.get('name') if isinstance(t, dict) else t)

# Add a mock exam type without any schedule
mock_types = list(types) + [{'id': '999', 'name': 'বিনা সাবজেক্টের পরীক্ষা'}]

def get_all_exams_filtered(schedules_list):
    exam_list = []
    seen = set()

    for s in schedules_list:
        if s and isinstance(s, dict):
            exam_name = (s.get('term') or s.get('examName') or '').strip()
            subject = (s.get('subject') or s.get('subjectName') or s.get('sub') or '').strip()
            if exam_name and subject:
                key = exam_name.lower()
                if key not in seen:
                    seen.add(key)
                    exam_list.append(exam_name)

    return exam_list

visible_exams = get_all_exams_filtered(schedules)
print("\nVisible Exams in Marksheet (strictly from Exam List with subject):")
for ex in visible_exams:
    print(" +", ex)

print("\nIs 'বিনা সাবজেক্টের পরীক্ষা' visible?", 'বিনা সাবজেক্টের পরীক্ষা' in visible_exams)

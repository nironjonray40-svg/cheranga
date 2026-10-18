import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

cursor.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_exam_types', 'school_subjects')")
rows = dict(cursor.fetchall())

schedules = json.loads(rows.get('school_exam_schedules', '[]'))
types = json.loads(rows.get('school_exam_types', '[]'))

print('=== EXAM TYPES ===')
for ex in types:
    print('Exam:', ex.get('name'), 'defaultCQ:', ex.get('defaultCQ'), 'defaultMCQ:', ex.get('defaultMCQ'), 'defaultPrac:', ex.get('defaultPractical'))
    for et in ex.get('examTypes', []):
        print('   Type:', et.get('typeName'), 'CQ:', et.get('defaultCQ'), 'MCQ:', et.get('defaultMCQ'), 'Prac:', et.get('defaultPractical'))

print('\n=== SCHEDULES ===')
for sc in schedules:
    print('Class:', sc.get('class'), 'Term:', sc.get('term'), 'Subject:', sc.get('subject'), 'ExamType:', sc.get('examType'))

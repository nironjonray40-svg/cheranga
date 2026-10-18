import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

def get_k(key):
    c.execute('SELECT value FROM local_storage_sync WHERE key = ?', (key,))
    row = c.fetchone()
    return json.loads(row[0]) if row else []

schedules = get_k('school_exam_schedules')
types = get_k('school_exam_types')

print(f"=== school_exam_types ({len(types)}) ===")
for t in types:
    print(t)

print(f"\n=== school_exam_schedules ({len(schedules)}) ===")
for s in schedules:
    print(f"ID: {s.get('id')}, Term/ExamName: '{s.get('term') or s.get('examName')}', Class: '{s.get('class') or s.get('className')}', Subject: '{s.get('subject')}'")

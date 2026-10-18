import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

def get_k(key):
    c.execute('SELECT value FROM local_storage_sync WHERE key = ?', (key,))
    row = c.fetchone()
    return json.loads(row[0]) if row else []

routines = get_k('school_exam_routines')
print(f"=== school_exam_routines ({len(routines)}) ===")
for r in routines[:10]:
    print(f"ExamName: '{r.get('examName') or r.get('term')}', Class: '{r.get('className') or r.get('class')}'")

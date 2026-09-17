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
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_types', 'school_exam_types_distributions')")
rows = dict(c.fetchall())
conn.close()

exam_types = json.loads(rows.get('school_exam_types', '[]'))
print("=== school_exam_types ===")
print(json.dumps(exam_types, indent=2))

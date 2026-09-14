import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT key, length(value) FROM local_storage_sync WHERE key LIKE '%student%' OR key LIKE '%seat%' OR key LIKE '%admit%'")
rows = cur.fetchall()
for r in rows:
    print(r)

cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
row = cur.fetchone()
if row:
    data = json.loads(row[0])
    print('Total students in school_students:', len(data) if isinstance(data, list) else type(data))
    if isinstance(data, list) and len(data) > 0:
        print('First 5 students:')
        for s in data[:5]:
            print(json.dumps(s, ensure_ascii=False, indent=2))

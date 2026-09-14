import sqlite3, json

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_routines', 'school_exam_schedules')")
rows = cursor.fetchall()
for r in rows:
    print("KEY:", r[0])
    data = json.loads(r[1])
    for item in data:
        print("  -", item)
conn.close()

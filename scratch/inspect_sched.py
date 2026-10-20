import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key='school_exam_schedules'")
row = c.fetchone()
if row:
    schedules = json.loads(row[0])
    print('Total schedules:', len(schedules))
    for s in schedules:
        print(s)

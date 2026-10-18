import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

for key in ['school_exam_schedules', 'school_exam_types', 'school_exam_routines', 'school_omr_exams']:
    c.execute('SELECT value FROM local_storage_sync WHERE key = ?', (key,))
    row = c.fetchone()
    if row:
        data = json.loads(row[0])
        print(f"=== {key} (count: {len(data)}) ===")
        for item in data[:10]:
            print(" ", item)
    else:
        print(f"=== {key} NOT FOUND ===")

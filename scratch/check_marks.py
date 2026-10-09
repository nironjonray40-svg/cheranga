import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
row = c.fetchone()
if row:
    d = json.loads(row[0])
    with open('scratch/marks_dump.json', 'w', encoding='utf-8') as f:
        json.dump({k: v for k, v in d.items() if '260091' in k}, f, ensure_ascii=False, indent=2)
    print("Dumped 260091 marks successfully")
else:
    print("No row")

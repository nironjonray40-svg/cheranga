import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_omr_exams',))
row = c.fetchone()
if row:
    d = json.loads(row[0])
    with open('scratch/school_omr_exams_dump.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    print(f"Dumped school_omr_exams: {len(d)} exams")

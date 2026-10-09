import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
row = c.fetchone()
if row:
    d = json.loads(row[0])
    exam_marks = {k: v for k, v in d.items() if '1789576252617' in k}
    with open('scratch/exam_1789576252617_marks.json', 'w', encoding='utf-8') as f:
        json.dump(exam_marks, f, ensure_ascii=False, indent=2)
    print(f"Total keys for 1789576252617: {len(exam_marks)}")

import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = c.fetchone()
if row:
    marks = json.loads(row[0])
    print('Total keys in marks:', len(marks))
    for sch_id in ['1788103216016', '1789576252617']:
        if sch_id in marks:
            print(f'Found marks for schedule {sch_id}:', marks[sch_id])
        else:
            print(f'Schedule {sch_id} not directly in marks keys')
    print('First 10 keys:', list(marks.keys())[:10])
    first_k = list(marks.keys())[0]
    print(f'Sample entry for {first_k}:', marks[first_k])

conn.close()

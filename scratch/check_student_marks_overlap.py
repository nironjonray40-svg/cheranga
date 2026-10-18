import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
marks = json.loads(c.fetchone()[0])

c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(c.fetchone()[0])
st_ids = {s.get('id'): s for s in students}

sched_marks = [k for k in marks if k.endswith('_1788103506003')]
print(f"Total marks for 1788103506003: {len(sched_marks)}")
found_in_st = sum(1 for k in sched_marks if k.replace('marks_', '').replace('_1788103506003', '') in st_ids)
print(f"How many match current school_students: {found_in_st}")

# Check other keys or files where students might be stored
c.execute("SELECT key FROM local_storage_sync WHERE key LIKE '%student%'")
print("Other student keys in db:", c.fetchall())

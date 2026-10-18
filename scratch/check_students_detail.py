import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key FROM local_storage_sync")
all_keys = [r[0] for r in c.fetchall()]

c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
row = c.fetchone()
students = json.loads(row[0]) if row else []

classes = {}
for s in students:
    cls = s.get('class') or s.get('className')
    sec = s.get('section') or s.get('group')
    k = f"{cls} - {sec}"
    classes[k] = classes.get(k, 0) + 1

with open('scratch/students_info.txt', 'w', encoding='utf-8') as out:
    out.write("Database keys matching student/exam:\n")
    for k in sorted(all_keys):
        if any(x in k.lower() for x in ['student', 'exam', 'schedule', 'marks', 'admit', 'seat']):
            out.write(f"  {k}\n")
    out.write("\nClasses in school_students:\n")
    for k, v in classes.items():
        out.write(f"  {k}: {v}\n")

print("Done")

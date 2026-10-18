import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = c.fetchone()
marks = json.loads(row[0]) if row else {}

val_types = {}
inner_keys = set()
for k, v in marks.items():
    t = type(v).__name__
    val_types[t] = val_types.get(t, 0) + 1
    if isinstance(v, dict):
        for ik, iv in v.items():
            if isinstance(iv, dict):
                inner_keys.update(iv.keys())
            else:
                inner_keys.add(ik)

print(f"Value types: {val_types}")
print(f"Inner keys in mark objects: {sorted(list(inner_keys))}")

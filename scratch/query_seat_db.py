import sqlite3

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_seat_plans_store', 'school_saved_seat_allocations', 'school_exam_routines', 'school_classes')")
rows = c.fetchall()
for k, v in rows:
    print(f"=== {k} ===")
    print(v[:300])
conn.close()

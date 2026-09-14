import sqlite3
import json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_students', 'school_saved_seat_allocations', 'school_seat_plans_store')")
rows = c.fetchall()
for k, v in rows:
    print(f"=== {k} ===")
    try:
        data = json.loads(v)
        if isinstance(data, list) and len(data) > 0:
            print("Item count:", len(data))
            print("First item sample:", json.dumps(data[0], ensure_ascii=False)[:300])
        elif isinstance(data, dict):
            print("Keys:", list(data.keys())[:5])
            first_key = list(data.keys())[0] if data else None
            if first_key:
                print(f"Sample under '{first_key}':", json.dumps(data[first_key], ensure_ascii=False)[:300])
    except Exception as e:
        print("Parse error:", e)
conn.close()

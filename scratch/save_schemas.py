import sqlite3
import json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_students', 'school_saved_seat_allocations', 'school_seat_plans_store')")
rows = c.fetchall()
with open('scratch/inspected_schemas.txt', 'w', encoding='utf-8') as out:
    for k, v in rows:
        out.write(f"=== {k} ===\n")
        try:
            data = json.loads(v)
            if isinstance(data, list) and len(data) > 0:
                out.write(f"Item count: {len(data)}\n")
                out.write(f"First item sample: {json.dumps(data[0], ensure_ascii=False, indent=2)}\n")
            elif isinstance(data, dict):
                out.write(f"Keys: {list(data.keys())[:5]}\n")
                first_key = list(data.keys())[0] if data else None
                if first_key:
                    out.write(f"Sample under '{first_key}': {json.dumps(data[first_key], ensure_ascii=False, indent=2)[:500]}\n")
        except Exception as e:
            out.write(f"Parse error: {e}\n")
conn.close()
print("Saved to scratch/inspected_schemas.txt")

import sqlite3
import json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key='school_seat_plans_store'")
row = c.fetchone()
with open('scratch/found_students.txt', 'w', encoding='utf-8') as out:
    if row:
        store = json.loads(row[0])
        for pkey, plan in store.items():
            alloc = plan.get('allocations', {})
            for rkey, room in alloc.items():
                for b in room.get('benches', []):
                    if b.get('left'):
                        out.write(f"Found left student in {pkey} {rkey}:\n{json.dumps(b['left'], ensure_ascii=False, indent=2)}\n")
                        break
                    if b.get('right'):
                        out.write(f"Found right student in {pkey} {rkey}:\n{json.dumps(b['right'], ensure_ascii=False, indent=2)}\n")
                        break
conn.close()
print("Saved to scratch/found_students.txt")

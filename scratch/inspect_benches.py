import sqlite3
import json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key='school_seat_plans_store'")
row = c.fetchone()
if row:
    store = json.loads(row[0])
    first_plan = list(store.values())[0]
    alloc = first_plan.get('allocations', {})
    first_room = list(alloc.values())[0]
    benches = first_room.get('benches', [])
    with open('scratch/bench_sample.txt', 'w', encoding='utf-8') as out:
        out.write(json.dumps(benches[:4], ensure_ascii=False, indent=2))
    print("Saved bench sample to scratch/bench_sample.txt")
conn.close()

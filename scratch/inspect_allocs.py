import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()

cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_saved_seat_allocations'")
allocs = json.loads(cur.fetchone()[0])
for rk, rdata in allocs.items():
    print(f"Room key: {rk}")
    if isinstance(rdata, dict):
        benches = rdata.get('benches', [])
        print(f"  benches type: {type(benches)}, len: {len(benches) if isinstance(benches, list) else benches}")
        if isinstance(benches, list):
            for b in benches[:2]:
                print(f"    Left: {b.get('left')}")
                print(f"    Right: {b.get('right')}")

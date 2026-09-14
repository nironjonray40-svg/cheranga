import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()

cur.execute("SELECT key, length(value) FROM local_storage_sync WHERE key IN ('school_saved_seat_allocations', 'school_seat_plans_store')")
rows = cur.fetchall()
for r in rows:
    print(r[0], r[1])

cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_seat_plans_store'")
row = cur.fetchone()
if row:
    plans = json.loads(row[0])
    print('Total plans:', len(plans) if isinstance(plans, (list, dict)) else type(plans))
    if isinstance(plans, dict):
        for k in list(plans.keys())[:3]:
            print(f"Plan Key: {k}")
            plan_obj = plans[k]
            # print sample benches
            if isinstance(plan_obj, dict) and 'rooms' in plan_obj:
                print("Rooms in plan:", len(plan_obj['rooms']))
                for r in plan_obj['rooms'][:1]:
                    print("Sample room benches:", r.get('benches', [])[:2])

cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_saved_seat_allocations'")
row2 = cur.fetchone()
if row2:
    allocs = json.loads(row2[0])
    print('\nTotal allocations:', len(allocs) if isinstance(allocs, (list, dict)) else type(allocs))
    if isinstance(allocs, dict):
        for k in list(allocs.keys())[:2]:
            print(f"Alloc Key: {k}")
            alloc_val = allocs[k]
            if isinstance(alloc_val, dict):
                for subk in list(alloc_val.keys())[:2]:
                    print(f"  Subkey: {subk}, type: {type(alloc_val[subk])}")
                    if isinstance(alloc_val[subk], dict) and 'benches' in alloc_val[subk]:
                        print("  Sample benches:", alloc_val[subk]['benches'][:2])

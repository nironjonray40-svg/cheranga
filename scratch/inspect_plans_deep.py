import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()

cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_seat_plans_store'")
row = cur.fetchone()
if row:
    plans = json.loads(row[0])
    for pk, pval in plans.items():
        print(f"=== Plan: {pk} ===")
        print("Keys in plan:", list(pval.keys()) if isinstance(pval, dict) else type(pval))
        if isinstance(pval, dict):
            # check what keys exist
            for k in pval:
                val = pval[k]
                if isinstance(val, (list, dict)):
                    print(f"  {k}: {type(val)} of len {len(val)}")
                else:
                    print(f"  {k}: {val}")

cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_saved_seat_allocations'")
row2 = cur.fetchone()
if row2:
    allocs = json.loads(row2[0])
    print(f"\n=== Allocations Keys: ===", list(allocs.keys()) if isinstance(allocs, dict) else type(allocs))
    if isinstance(allocs, dict):
        for k in list(allocs.keys()):
            val = allocs[k]
            print(f"  {k}: {type(val)} with subkeys {list(val.keys()) if isinstance(val, dict) else ''}")
            if isinstance(val, dict):
                # find benches
                for rk, rv in val.items():
                    if isinstance(rv, dict) and 'benches' in rv:
                        benches = rv['benches']
                        print(f"    Room {rk} benches: {len(benches)}")
                        for b in benches[:2]:
                            print(f"      b: Left={b.get('left')}, Right={b.get('right')}")

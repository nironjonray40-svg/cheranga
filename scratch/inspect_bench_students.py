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
        rooms = pval.get('rooms', [])
        for r in rooms[:2]:
            benches = r.get('benches', [])
            print(f"Room: {r.get('number')}, benches count: {len(benches)}")
            for b in benches[:3]:
                left = b.get('left')
                right = b.get('right')
                print("  Left:", left)
                print("  Right:", right)

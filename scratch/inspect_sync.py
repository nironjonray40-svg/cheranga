import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8')
con = sqlite3.connect('school.db')
cur = con.cursor()

cols = [c[1] for c in cur.execute("PRAGMA table_info(local_storage_sync);").fetchall()]
print("local_storage_sync columns:", cols)

rows = cur.execute("SELECT * FROM local_storage_sync;").fetchall()
print(f"Total rows in local_storage_sync: {len(rows)}")
for r in rows:
    # Print key and preview value
    key = r[0] if len(r) > 0 else 'no-key'
    val = str(r[1]) if len(r) > 1 else ''
    print(f"Key: {key} (length: {len(val)})")
    if any(k in key.lower() for k in ['school', 'profile', 'info', 'setting', 'name', 'address', 'header', 'config']):
        print(f"  Preview: {val[:200]}")

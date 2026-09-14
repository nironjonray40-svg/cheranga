import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key='school_settings'")
r = c.fetchone()
if r:
    d = json.loads(r[0])
    for k, v in d.items():
        if isinstance(v, str) and len(v) > 80:
            print(f"{k}: (length {len(v)}) {v[:80]}...")
        else:
            print(f"{k}: {v}")
conn.close()

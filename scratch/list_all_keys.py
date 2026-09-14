import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT key, substr(value, 1, 200) FROM local_storage_sync")
rows = cur.fetchall()
for k, v in rows:
    print(f"Key: {k:35s} | Value: {v}")

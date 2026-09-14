import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT key, value FROM local_storage_sync WHERE key LIKE '%prefix%' OR key LIKE '%id_reg%' OR key LIKE '%setting%'")
rows = cur.fetchall()
for k, v in rows:
    print(f"Key: {k}")
    print(f"Value: {v}\n")

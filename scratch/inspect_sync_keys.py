# -*- coding: utf-8 -*-
import sys, sqlite3, json
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

cursor.execute("SELECT key, length(value) FROM local_storage_sync")
rows = cursor.fetchall()
print("Keys in local_storage_sync:")
for k, l in rows:
    print(f"  {k}: {l} bytes")

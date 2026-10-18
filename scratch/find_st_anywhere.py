import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

c.execute("SELECT key, value FROM local_storage_sync")
for k, v in c.fetchall():
    if '1787794001272-84216-5' in v:
        print(f"Found in key: {k}")

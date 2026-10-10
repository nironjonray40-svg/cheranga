import sqlite3, json, sys, subprocess
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT key, value FROM local_storage_sync')
dbData = dict(c.fetchall())

with open('scratch/db_dump.json', 'w', encoding='utf-8') as f:
    json.dump(dbData, f, ensure_ascii=False)

print('Dumped db to scratch/db_dump.json')

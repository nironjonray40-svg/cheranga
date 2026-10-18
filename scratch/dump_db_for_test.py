import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT key, value FROM local_storage_sync')
rows = c.fetchall()

data = {}
for k, v in rows:
    try:
        data[k] = json.loads(v)
    except:
        data[k] = v

with open('scratch/db_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("scratch/db_data.json created.")

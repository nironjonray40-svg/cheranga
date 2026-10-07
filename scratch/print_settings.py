import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8')
con = sqlite3.connect('school.db')
cur = con.cursor()
row = cur.execute("SELECT value FROM local_storage_sync WHERE key='school_settings';").fetchone()
if row:
    d = json.loads(row[0])
    for k, v in d.items():
        if not str(v).startswith('data:image'):
            print(f"{k}: {v}")

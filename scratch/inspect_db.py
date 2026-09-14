import sqlite3
import json

for db_name in ['school.db', 'database.sqlite']:
    try:
        conn = sqlite3.connect(db_name)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = c.fetchall()
        print(f"Tables in {db_name}:", [t[0] for t in tables])
        
        # Check for key_value or storage tables
        for t in tables:
            tname = t[0]
            if 'key' in tname or 'store' in tname or 'storage' in tname or 'setting' in tname or 'state' in tname or 'data' in tname:
                try:
                    c.execute(f"SELECT * FROM {tname} LIMIT 10")
                    rows = c.fetchall()
                    print(f"Sample from {tname}: {len(rows)} rows")
                    for r in rows[:3]:
                        print("  ", str(r)[:100])
                except Exception as e:
                    pass
        conn.close()
    except Exception as e:
        print(f"Error reading {db_name}:", e)

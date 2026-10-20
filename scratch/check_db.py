import sqlite3, json

for db_name in ['school.db', 'database.sqlite', 'omr_results.db']:
    try:
        conn = sqlite3.connect(db_name)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in c.fetchall()]
        print(f"=== {db_name} ===")
        print("Tables:", tables)
        for t in tables:
            try:
                c.execute(f"SELECT count(*) FROM {t}")
                cnt = c.fetchone()[0]
                print(f"  {t} ({cnt} rows)")
                if 'setting' in t.lower() or 'key_value' in t.lower() or 'exam' in t.lower():
                    c.execute(f"SELECT * FROM {t} LIMIT 5")
                    for row in c.fetchall():
                        print("    ", str(row)[:120])
            except Exception as e:
                pass
    except Exception as e:
        print(f"{db_name} error:", e)

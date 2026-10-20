import sqlite3

for db in ['school.db', 'database.sqlite', 'school_data.db', 'school_database.db']:
    try:
        conn = sqlite3.connect(db)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in c.fetchall()]
        print(f'{db} tables: {tables}')
        for t in tables:
            c.execute(f"PRAGMA table_info({t})")
            cols = [col[1] for col in c.fetchall()]
            c.execute(f"SELECT COUNT(*) FROM {t}")
            cnt = c.fetchone()[0]
            print(f'   {t} ({cnt} rows): {cols}')
    except Exception as e:
        print(f'{db} error: {e}')

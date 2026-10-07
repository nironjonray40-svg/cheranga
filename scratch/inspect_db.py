import sqlite3, json

con = sqlite3.connect('school.db')
cur = con.cursor()
tables = [t[0] for t in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
print("Tables in school.db:", tables)

for t in tables:
    if any(k in t.lower() for k in ['school', 'profile', 'setting', 'config', 'info', 'institute']):
        print(f"Table {t}:")
        cols = [c[1] for c in cur.execute(f"PRAGMA table_info({t});").fetchall()]
        print("  Cols:", cols)
        rows = cur.execute(f"SELECT * FROM {t} LIMIT 3;").fetchall()
        print("  Sample rows:", rows)

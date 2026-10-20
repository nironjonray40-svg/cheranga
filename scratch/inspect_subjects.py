import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key='school_subjects'")
row = c.fetchone()
if row:
    sub_map = json.loads(row[0])
    for cls, subs in sub_map.items():
        print(f"Class: {cls} ({len(subs)} subjects)")
        for s in subs[:5]:
            print("  ", s)

import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

c.execute("SELECT key, value FROM local_storage_sync")
for k, v in c.fetchall():
    if '1788096574265-63478-0' in v:
        print(f"Found in key: {k}")
        try:
            parsed = json.loads(v)
            if isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, dict) and ('1788096574265-63478-0' in str(item)):
                        print("  Item:", item)
        except:
            pass

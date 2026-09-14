import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

c.execute("SELECT value FROM local_storage_sync WHERE key='school_users'")
row = c.fetchone()
if row:
    users = json.loads(row[0])
    print(f"Total Users: {len(users)}")
    for u in users[:5]:
        print("User:", {k: v for k, v in u.items() if k != 'photo' and k != 'permissions'})
else:
    print("No school_users found in database.")

import sqlite3
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_subjects'")
row = c.fetchone()
if row:
    data = json.loads(row[0])
    print('Keys in school_subjects:', list(data.keys()))
    for k in data.keys():
        subs = data[k]
        print(f"\n=== Class {k} (Total: {len(subs)}) ===")
        for sub in subs:
            is_opt = sub.get('isOptional', False)
            opt_tag = "[OPTIONAL]" if is_opt else ""
            print(f"  - code: {sub.get('code')}, name: {sub.get('name')}, nameBn: {sub.get('nameBn')}, section/group: {sub.get('section')}, {opt_tag}")
else:
    print('No school_subjects found in DB')
conn.close()

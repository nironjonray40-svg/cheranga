import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_subjects'")
row = cursor.fetchone()
if row:
    data = json.loads(row[0])
    for cls in ['Nine', 'Ten']:
        print(f"=== Class {cls} ===")
        subs = data.get(cls, [])
        for sub in subs:
            is_opt = sub.get('isOptional')
            sec = sub.get('section', 'All')
            name = sub.get('name')
            name_bn = sub.get('nameBn')
            code = sub.get('code')
            if is_opt:
                print(f"  [OPTIONAL] Code: {code}, Sec/Group: {sec}, Name: {name_bn} ({name})")
            else:
                print(f"  [COMPULSORY] Code: {code}, Sec/Group: {sec}, Name: {name_bn} ({name})")
else:
    print("No school_subjects found in DB")
conn.close()

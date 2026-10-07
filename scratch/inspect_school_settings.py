import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8')
con = sqlite3.connect('school.db')
cur = con.cursor()

row = cur.execute("SELECT val FROM local_storage_sync WHERE key='school_settings';").fetchone()
if row:
    val = row[0]
    try:
        data = json.loads(val)
        print("Keys in school_settings:", list(data.keys())[:30])
        for k in ['schoolName', 'schoolSubtitle', 'schoolAddress', 'schoolEmail', 'schoolPhone', 'schoolEiin', 'schoolEstYear', 'schoolCode', 'schoolDistrict', 'schoolUpazila', 'schoolPostOffice']:
            if k in data:
                print(f"  {k}: {data[k]}")
    except Exception as e:
        print("JSON parse error:", e)
else:
    print("school_settings not found in DB")

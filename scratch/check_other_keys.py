import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
for key in ['school_staff', 'school_ticker_notices', 'school_classes', 'school_class_sections', 'school_important_links', 'school_fee_structure', 'school_class_fees', 'school_exam_routines']:
    c.execute("SELECT value FROM local_storage_sync WHERE key=?", (key,))
    r = c.fetchone()
    if r and r[0]:
        try:
            d = json.loads(r[0])
            print(f"=== {key} === (type: {type(d).__name__}, count: {len(d) if isinstance(d, (list, dict)) else 1})")
            if isinstance(d, list) and len(d) > 0:
                print(" Sample item 0:", json.dumps(d[0], ensure_ascii=False)[:200])
        except Exception as e:
            print(f"=== {key} === (raw len: {len(r[0])})")
    else:
        print(f"=== {key} === NOT FOUND or EMPTY")
conn.close()

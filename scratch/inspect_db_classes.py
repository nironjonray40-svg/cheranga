import sqlite3
import json
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_classes', 'school_class_sections', 'school_class_custom_levels', 'school_subjects', 'school_settings')")
rows = c.fetchall()
for k, v in rows:
    print(f"KEY: {k}")
    try:
        parsed = json.loads(v)
        print(json.dumps(parsed, indent=2, ensure_ascii=False))
    except Exception:
        print(v[:500])
    print("="*40)
conn.close()

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
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_classes', 'school_class_sections')")
for k, v in c.fetchall():
    print(f"KEY: {k}")
    print(v)
conn.close()

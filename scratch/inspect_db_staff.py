# -*- coding: utf-8 -*-
import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables in database.sqlite:", tables)

cursor.execute("SELECT key, value FROM kv_store WHERE key IN ('school_staff', 'school_settings', 'school_users', 'current_user');")
rows = cursor.fetchall()
for k, v in rows:
    try:
        data = json.loads(v)
        if isinstance(data, list):
            print(f"\nKey '{k}' has {len(data)} items:")
            for item in data[:5]:
                print(" -", item.get('name') or item.get('nameBn'), "| Desig:", item.get('designation') or item.get('designationBn'), "| Sig length:", len(str(item.get('signature') or item.get('signatureUrl') or item.get('signatureData') or '')))
                print("   Keys in item:", list(item.keys()))
        else:
            print(f"\nKey '{k}':", data)
    except Exception as e:
        print(f"\nKey '{k}' raw len: {len(v)}")
conn.close()

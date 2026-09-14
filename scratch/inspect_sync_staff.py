# -*- coding: utf-8 -*-
import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT key, substr(value, 1, 300) FROM local_storage_sync WHERE key LIKE '%staff%' OR key LIKE '%setting%' OR key LIKE '%user%';")
rows = cursor.fetchall()
for k, v in rows:
    print(f"Key: {k}")

cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_staff';")
staff_row = cursor.fetchone()
if staff_row:
    staff_list = json.loads(staff_row[0])
    print(f"\nTotal staff members: {len(staff_list)}")
    for s in staff_list:
        sig = s.get('signature') or s.get('signatureUrl') or s.get('signatureData') or s.get('sign') or s.get('signatureImage')
        print(f"Name: {s.get('nameBn') or s.get('name')} | Post: {s.get('designation') or s.get('designationBn')} | Has Sig: {bool(sig)} (len {len(str(sig)) if sig else 0})")
        if sig:
            print("  Sig sample:", str(sig)[:50])
conn.close()

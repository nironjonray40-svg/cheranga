import sqlite3
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

print("--- SCHOOL SETTINGS KEYS ---")
c.execute("SELECT value FROM local_storage_sync WHERE key='school_settings'")
row = c.fetchone()
if row:
    d = json.loads(row[0])
    for k, v in d.items():
        if isinstance(v, str) and len(v) > 100:
            print(f"{k}: len={len(v)} (starts with {v[:30]}...)")
        else:
            print(f"{k}: {v}")

print("\n--- CMS DATA ---")
c.execute("SELECT value FROM local_storage_sync WHERE key='school_cms_data'")
row = c.fetchone()
if row:
    print(row[0])

print("\n--- STAFF HEADMASTERS / PRINCIPALS ---")
c.execute("SELECT value FROM local_storage_sync WHERE key='school_staff'")
row = c.fetchone()
if row:
    staff_list = json.loads(row[0])
    for s in staff_list:
        name = s.get('name') or s.get('staffName') or s.get('fullName')
        desig = s.get('designation') or s.get('role') or s.get('title')
        photo = s.get('photo') or s.get('image') or s.get('avatar')
        photo_info = f"len={len(photo)} (starts with {photo[:30]}...)" if photo else "None"
        print(f"Staff: {name} | Desig: {desig} | Photo: {photo_info}")

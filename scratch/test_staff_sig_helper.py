# -*- coding: utf-8 -*-
import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_staff';")
row = cursor.fetchone()
staff_list = json.loads(row[0]) if row and row[0] else []

cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_settings';")
settings_row = cursor.fetchone()
settings = json.loads(settings_row[0]) if settings_row and settings_row[0] else {}

conn.close()

print(f"Loaded {len(staff_list)} staff members.")

def is_headmaster(designation):
    if not designation: return False
    d = str(designation).strip().lower()
    if any(x in d for x in ['সহকারী', 'সহ:', 'উপাধ্যক্ষ', 'assistant', 'asst', 'vice', 'deputy']):
        return False
    return any(x in d for x in ['প্রধান শিক্ষক', 'প্রধান শিক্ষিকা', 'headmaster', 'head master', 'headteacher', 'head teacher', 'principal', 'অধ্যক্ষ', 'সুপারিনটেনডেন্ট', 'superintendent'])

def is_preparer(designation):
    if not designation: return False
    d = str(designation).strip().lower()
    return any(x in d for x in ['কম্পিউটার অপারেটর', 'অপারেটর', 'প্রস্তুতকারী', 'অফিস সহকারী', 'ডাটা এন্ট্রি', 'হিসাব রক্ষক', 'সহকারী শিক্ষক', 'সহ: শিক্ষক', 'operator', 'clerk', 'accountant', 'assistant teacher'])

# Test finding headmaster
hm = None
for s in staff_list:
    if is_headmaster(s.get('designation') or s.get('designationBn')):
        hm = s
        break

hm_sig = hm.get('signature') or hm.get('signatureUrl') or hm.get('signatureData') or hm.get('sign') if hm else ''
print("Found Headmaster:", hm.get('nameBn') or hm.get('name') if hm else 'None', "| Sig length:", len(str(hm_sig)))

# Test finding preparer
preparer = None
for s in staff_list:
    if is_preparer(s.get('designation') or s.get('designationBn')):
        preparer = s
        break

if not preparer:
    # fallback to any staff with signature who is not headmaster
    for s in staff_list:
        if not is_headmaster(s.get('designation') or s.get('designationBn')):
            sig = s.get('signature') or s.get('signatureUrl') or s.get('signatureData') or s.get('sign')
            if sig:
                preparer = s
                break

prep_sig = preparer.get('signature') or preparer.get('signatureUrl') or preparer.get('signatureData') or preparer.get('sign') if preparer else ''
print("Found Preparer:", preparer.get('nameBn') or preparer.get('name') if preparer else 'None', "| Sig length:", len(str(prep_sig)))

import sqlite3
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()

cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])

# Map students by internal id, regNo, and combo (class, roll) or (class, name)
student_id_map = {s['id']: s for s in students if 'id' in s}
student_reg_map = {s['regNo']: s for s in students if 'regNo' in s and s['regNo']}
student_name_cls_map = {f"{s.get('class','').strip().lower()}___{s.get('name','').strip().lower()}": s for s in students}
student_name_bn_cls_map = {f"{s.get('class','').strip().lower()}___{s.get('nameBn','').strip().lower()}": s for s in students}

def refresh_student_obj(st):
    if not st or not isinstance(st, dict): return st
    target = None
    if st.get('id') and st['id'] in student_id_map:
        target = student_id_map[st['id']]
    elif st.get('regNo') and st['regNo'] in student_reg_map:
        target = student_reg_map[st['regNo']]
    else:
        c = (st.get('class') or st.get('className') or '').strip().lower()
        n = (st.get('name') or '').strip().lower()
        nb = (st.get('nameBn') or '').strip().lower()
        k1 = f"{c}___{n}"
        k2 = f"{c}___{nb}"
        if k1 in student_name_cls_map:
            target = student_name_cls_map[k1]
        elif k2 in student_name_bn_cls_map:
            target = student_name_bn_cls_map[k2]
    
    if target:
        updated = dict(st)
        updated['studentId'] = target.get('studentId')
        updated['roll'] = target.get('roll')
        updated['regNo'] = target.get('regNo')
        updated['name'] = target.get('name')
        updated['nameBn'] = target.get('nameBn')
        updated['section'] = target.get('section')
        updated['class'] = target.get('class')
        return updated
    return st

# Refresh school_saved_seat_allocations
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_saved_seat_allocations'")
row = cur.fetchone()
if row and row[0]:
    allocs = json.loads(row[0])
    for rk, rdata in allocs.items():
        if isinstance(rdata, dict):
            benches = rdata.get('benches', [])
            if isinstance(benches, list):
                for b in benches:
                    if 'left' in b and b['left']:
                        b['left'] = refresh_student_obj(b['left'])
                    if 'right' in b and b['right']:
                        b['right'] = refresh_student_obj(b['right'])
    cur.execute("UPDATE local_storage_sync SET value = ?, updated_at = ? WHERE key = 'school_saved_seat_allocations'",
                (json.dumps(allocs, ensure_ascii=False), int(time.time() * 1000)))
    print("Updated school_saved_seat_allocations in school.db")

# Refresh school_seat_plans_store
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_seat_plans_store'")
row2 = cur.fetchone()
if row2 and row2[0]:
    plans = json.loads(row2[0])
    for pk, pdata in plans.items():
        if isinstance(pdata, dict) and 'allocations' in pdata and isinstance(pdata['allocations'], dict):
            for rk, rdata in pdata['allocations'].items():
                if isinstance(rdata, dict):
                    benches = rdata.get('benches', [])
                    if isinstance(benches, list):
                        for b in benches:
                            if 'left' in b and b['left']:
                                b['left'] = refresh_student_obj(b['left'])
                            if 'right' in b and b['right']:
                                b['right'] = refresh_student_obj(b['right'])
    cur.execute("UPDATE local_storage_sync SET value = ?, updated_at = ? WHERE key = 'school_seat_plans_store'",
                (json.dumps(plans, ensure_ascii=False), int(time.time() * 1000)))
    print("Updated school_seat_plans_store in school.db")

con.commit()
print("All allocations and saved seat plans refreshed!")

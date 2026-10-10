import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_exam_schedules',))
schedules = json.loads(c.fetchone()[0])

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_students',))
all_students = json.loads(c.fetchone()[0])

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
saved_marks = json.loads(c.fetchone()[0])

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_subjects',))
sub_row = c.fetchone()
sub_map = json.loads(sub_row[0]) if sub_row else {}

print(f"Total schedules to test: {len(schedules)}")

for sch in schedules:
    sch_id = sch.get('id')
    print(f"\nTesting schedule ID: {sch_id} ({type(sch_id)}) - {sch.get('subject')} ({sch.get('class')})")
    
    # 1. Check strict equality with string sch_id
    found_strict = next((s for s in schedules if s.get('id') == str(sch_id)), None)
    found_loose = next((s for s in schedules if str(s.get('id')) == str(sch_id)), None)
    if not found_strict and found_loose:
        print(f"  WARNING: String ID mismatch on strict === comparison! id={sch_id} ({type(sch_id)})")
    elif not found_loose:
        print(f"  ERROR: Schedule not found at all!")
    else:
        print(f"  Found schedule successfully.")

    # 2. Check subjects lookup
    class_subjects = sub_map.get(sch.get('class'), [])
    sub_obj = None
    for s in class_subjects:
        if s.get('name') and sch.get('subject') and s.get('name').strip().lower() == sch.get('subject').strip().lower():
            sub_obj = s
            break
    sub_code = sub_obj.get('code') if sub_obj else (sch.get('subjectCode') or sch.get('subject'))
    print(f"  Subject code resolved: {sub_code}")

conn.close()

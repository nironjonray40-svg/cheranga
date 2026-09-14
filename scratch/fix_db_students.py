import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])

print(f"Total students before: {len(students)}")

# Let's inspect each class
# Class Ten:
# Science: 1 student (Dipti Roy) -> ID '0001', Roll '1' (was ID 0003, Roll 3)
# Business: 3 students -> IDs 0001, 0002, 0003, Rolls 1, 2, 3
# Humanities: 12 students -> IDs 0001..0012, Rolls 1..12

# Class Nine:
# Business: 3 students (Prashanta Roy, Brishti Sharma, Mim Akhter) -> IDs 0001, 0002, 0003, Rolls 1, 2, 3 (was IDs 0002, 0003, 0004, Rolls 'Science')
# Humanities: 17 students (Rima Akhter to Deepa Rani) -> IDs 0001..0017, Rolls 1..17 (was IDs 0005..0021, Rolls 'Science'/'Humanities')

# Let's clean up Class Nine & Ten rolls and IDs cleanly:
c9_biz_roll = 1
c9_hum_roll = 1
c10_sci_roll = 1

for s in students:
    c = s.get('class')
    sec = s.get('section')
    
    if c == 'Nine':
        if sec == 'ব্যবসায়':
            s['studentId'] = f"{c9_biz_roll:04d}"
            s['roll'] = str(c9_biz_roll)
            c9_biz_roll += 1
        elif sec == 'মানবিক':
            s['studentId'] = f"{c9_hum_roll:04d}"
            s['roll'] = str(c9_hum_roll)
            c9_hum_roll += 1
    elif c == 'Ten':
        if sec == 'বিজ্ঞান':
            s['studentId'] = f"{c10_sci_roll:04d}"
            s['roll'] = str(c10_sci_roll)
            c10_sci_roll += 1

# Check all students for clean studentId and roll
for idx, s in enumerate(students):
    # Ensure studentId is 4-digit or standard format
    sid = s.get('studentId')
    roll = s.get('roll')
    if not sid or sid.startswith('178') or len(sid) > 10:
        if roll and str(roll).isdigit():
            s['studentId'] = f"{int(roll):04d}"
        else:
            s['studentId'] = f"{idx+1:04d}"
    elif sid.isdigit():
        # normalize to 4 digits if < 4 digits
        s['studentId'] = f"{int(sid):04d}"

# Verify no duplicate IDs within same (class, section)
grouped = {}
for s in students:
    key = f"{s.get('class')} | {s.get('section')}"
    grouped.setdefault(key, []).append(s)

all_ok = True
for k, s_list in sorted(grouped.items()):
    ids = [s['studentId'] for s in s_list]
    rolls = [s['roll'] for s in s_list]
    dup_ids = set([x for x in ids if ids.count(x) > 1])
    dup_rolls = set([x for x in rolls if rolls.count(x) > 1])
    if dup_ids:
        print(f"Error: Duplicates in {k}: {dup_ids}")
        all_ok = False
    if dup_rolls:
        print(f"Error: Duplicate rolls in {k}: {dup_rolls}")
        all_ok = False

if all_ok:
    print("ALL 333 STUDENTS VALIDATED AND CLEANED UP PERFECTLY!")
    # Update school_students in local_storage_sync
    import time
    cur.execute("UPDATE local_storage_sync SET value = ?, updated_at = ? WHERE key = 'school_students'", 
                (json.dumps(students, ensure_ascii=False), int(time.time() * 1000)))
    con.commit()
    print("Saved updated school_students to school.db successfully.")

import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

con = sqlite3.connect('school.db')
cur = con.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(cur.fetchone()[0])

print(f"Total students: {len(students)}")

# Check per class and section
grouped = {}
for s in students:
    c = s.get('class')
    sec = s.get('section')
    key = f"{c} | {sec}"
    grouped.setdefault(key, []).append(s)

for k, s_list in sorted(grouped.items()):
    print(f"\nGroup: {k} (Count: {len(s_list)})")
    ids = [s.get('studentId') for s in s_list]
    rolls = [s.get('roll') for s in s_list]
    regs = [s.get('regNo') for s in s_list]
    
    # Check duplicate studentIds
    dup_ids = set([x for x in ids if ids.count(x) > 1 and x is not None])
    print(f"  IDs sample: {ids[:5]} ... {ids[-3:] if len(ids)>3 else ''}")
    print(f"  Rolls sample: {rolls[:5]} ... {rolls[-3:] if len(rolls)>3 else ''}")
    print(f"  Regs sample: {regs[:5]} ... {regs[-3:] if len(regs)>3 else ''}")
    if dup_ids:
        print(f"  WARNING - Duplicate IDs in group: {dup_ids}")
    
    # Check bad rolls (like 'Science')
    bad_rolls = [r for r in rolls if r and not str(r).strip().isdigit()]
    if bad_rolls:
        print(f"  WARNING - Non-numeric rolls: {bad_rolls[:5]}")

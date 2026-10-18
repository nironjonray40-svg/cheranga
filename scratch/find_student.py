import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
row = c.fetchone()
students = json.loads(row[0]) if row else []

target_id = '1788096574265-63478-0'
st = next((s for s in students if s.get('id') == target_id), None)

matching_sts = [s for s in students if '1788096574265' in str(s.get('id'))]

with open('scratch/found_student.txt', 'w', encoding='utf-8') as out:
    out.write(f"Target: {json.dumps(st, ensure_ascii=False, indent=2)}\n")
    out.write(f"Total matching: {len(matching_sts)}\n")
    for s in matching_sts[:10]:
        out.write(f"  ID={s.get('id')} Roll={s.get('roll')} Name={s.get('name') or s.get('nameBn')} Class={s.get('class')} Sec={s.get('section')}\n")

print("Done")

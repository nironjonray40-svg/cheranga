import sqlite3
import json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_student_marks', 'school_students')")
rows = dict(c.fetchall())

with open('scratch/output.txt', 'w', encoding='utf-8') as out:
    schedules = json.loads(rows.get('school_exam_schedules', '[]'))
    out.write(f"Total schedules: {len(schedules)}\n")
    for s in schedules:
        out.write(f"  Schedule {s.get('id')}: term={s.get('term')}, class={s.get('class')}, sec={s.get('section')}, sub={s.get('subject')}, hasMarks={s.get('hasMarks')}\n")

    marks = json.loads(rows.get('school_student_marks', '{}'))
    out.write(f"\nTotal marks keys: {len(marks)}\n")
    for k in list(marks.keys())[:30]:
        out.write(f"  Mark key {k}: {json.dumps(marks[k], ensure_ascii=False)}\n")

    students = json.loads(rows.get('school_students', '[]'))
    out.write(f"\nTotal students: {len(students)}\n")
    for st in students[:10]:
        out.write(f"  Student: id={st.get('id')}, roll={st.get('roll')}, name={st.get('name') or st.get('nameBn')}, class={st.get('class')}, sec={st.get('section')}\n")

print("Done writing to scratch/output.txt")

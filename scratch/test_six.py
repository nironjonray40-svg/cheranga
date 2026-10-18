import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_student_marks', 'school_students')")
db = dict(c.fetchall())

schedules = json.loads(db.get('school_exam_schedules', '[]'))
marks = json.loads(db.get('school_student_marks', '{}'))
students = json.loads(db.get('school_students', '[]'))

with open('scratch/test_six_output.txt', 'w', encoding='utf-8') as out:
    test_exam = 'বার্ষিক পরীক্ষা'
    test_class = 'Six'
    test_sec = 'A'

    matched_schedules = [s for s in schedules if s.get('term', '').strip() == test_exam and s.get('class', '').strip().lower() == test_class.lower()]
    out.write(f"Matched schedules: {len(matched_schedules)}\n")
    for ms in matched_schedules:
        out.write(f"  {ms['id']}: {ms['subject']} (hasMarks={ms.get('hasMarks')})\n")

    matched_students = [st for st in students if st.get('class', '').lower() == test_class.lower() and st.get('section', '').lower() == test_sec.lower()]
    out.write(f"\nMatched students: {len(matched_students)}\n")
    for st in matched_students:
        out.write(f"\nStudent {st.get('name')} (Roll {st.get('roll')}, ID {st.get('id')}):\n")
        for ms in matched_schedules:
            sch_id = str(ms['id'])
            keys_to_try = [
                f"marks_{st.get('id')}_{sch_id}",
                f"marks_{st.get('regNo')}_{sch_id}",
                f"marks_{st.get('studentId')}_{sch_id}",
                f"marks_{st.get('roll')}_{sch_id}",
                f"marks_{st.get('id')}_{test_exam}",
            ]
            found = None
            for k in keys_to_try:
                if k in marks:
                    found = (k, marks[k])
                    break
            out.write(f"  Subject {ms['subject']} (schedule {sch_id}): found={found}\n")

print("Done")

import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_student_marks', 'school_students')")
db = dict(c.fetchall())

schedules = json.loads(db.get('school_exam_schedules', '[]'))
marks = json.loads(db.get('school_student_marks', '{}'))
students = json.loads(db.get('school_students', '[]'))

# Test for: Exam = 'Elegileble test', Class = 'Eight', Section = 'A'
test_exam = 'Elegileble test'
test_class = 'Eight'
test_sec = 'A'

# 1. Filter schedules
matched_schedules = []
for s in schedules:
    term_match = s.get('term', '').strip().lower() == test_exam.lower()
    class_match = s.get('class', '').strip().lower() == test_class.lower()
    sec_str = s.get('section', '')
    sec_match = not test_sec or test_sec.lower() in [x.strip().lower() for x in sec_str.split(',')] or sec_str == 'All'
    if term_match and class_match and sec_match:
        matched_schedules.append(s)

print(f"Matched schedules for {test_exam} / {test_class} / {test_sec}: {len(matched_schedules)}")
for ms in matched_schedules:
    print(f"  Schedule {ms['id']}: {ms['subject']} (hasMarks={ms.get('hasMarks')})")

# 2. Filter students
matched_students = [st for st in students if st.get('class', '').lower() == test_class.lower() and st.get('section', '').lower() == test_sec.lower()]
print(f"\nMatched students: {len(matched_students)}")

# 3. Test mark extraction for first student
if matched_students:
    st = matched_students[0]
    print(f"\nStudent: {st.get('name')} (Roll {st.get('roll')}, ID {st.get('id')})")
    for ms in matched_schedules:
        sch_id = str(ms['id'])
        # Look up mark
        keys_to_try = [
            f"marks_{st.get('id')}_{sch_id}",
            f"marks_{st.get('regNo')}_{sch_id}",
            f"marks_{st.get('studentId')}_{sch_id}",
            f"marks_{st.get('roll')}_{sch_id}",
            f"marks_{st.get('id')}_{test_exam}",
        ]
        found_rec = None
        for k in keys_to_try:
            if k in marks:
                found_rec = marks[k]
                break
        print(f"  Subject '{ms['subject']}': record = {found_rec}")

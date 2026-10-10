import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()

print("--- Checking school_student_marks ---")
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
row = c.fetchone()
if row:
    marks = json.loads(row[0])
    print(f"Total keys in school_student_marks: {len(marks)}")
    found = 0
    for k, v in marks.items():
        if '2606003' in str(k) or '260600' in str(k) or '1791596672085' in str(k):
            print(f"KEY: {k} => {v}")
            found += 1
            if found > 30:
                print("... truncated ...")
                break
    if found == 0:
        print("No keys found matching 2606003 or 1791596672085")

print("\n--- Checking school_students for 2606003 ---")
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_students',))
row = c.fetchone()
if row:
    students = json.loads(row[0])
    for s in students:
        if '2606003' in str(s.get('regNo', '')) or '2606003' in str(s.get('id', '')) or s.get('roll') == 3 or s.get('roll') == '3':
            if str(s.get('class', '')).lower() in ['six', '6', '৬ষ্ঠ', '৬ষ্ঠ শ্রেণি']:
                print(f"Student: id={s.get('id')}, regNo={s.get('regNo')}, roll={s.get('roll')}, name={s.get('name')}, nameBn={s.get('nameBn')}, class={s.get('class')}")

print("\n--- Checking school_exam_schedules ---")
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_exam_schedules',))
row = c.fetchone()
if row:
    schedules = json.loads(row[0])
    for sc in schedules:
        if str(sc.get('class', '')).lower() in ['six', '6'] or 'Bangla' in str(sc.get('subject', '')):
            print(f"Schedule: id={sc.get('id')}, term={sc.get('term')}, sub={sc.get('subject')}, subCode={sc.get('subjectCode')}, class={sc.get('class')}")

print("\n--- Checking school_omr_exams ---")
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_omr_exams',))
row = c.fetchone()
if row:
    omr = json.loads(row[0])
    for o in omr:
        print(f"OMR Exam: id={o.get('id')}, name={o.get('examName')}, sub={o.get('subject')}, studentsCount={len(o.get('students', []))}")
        for st in o.get('students', []):
            if '2606003' in str(st.get('regNo', '')) or '2606003' in str(st.get('id', '')):
                print(f"  OMR Student: id={st.get('id')}, regNo={st.get('regNo')}, roll={st.get('roll')}, correct={st.get('correct')}, status={st.get('status')}, isRealScanned={st.get('isRealScanned')}")

conn.close()

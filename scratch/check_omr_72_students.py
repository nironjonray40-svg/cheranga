import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_omr_exams',))
omr_exams = json.loads(c.fetchone()[0])

for ex in omr_exams:
    if str(ex.get('id')) == '1791596672085':
        print(f"Exam: {ex.get('examName')}, subject: {ex.get('subject')}, total students: {len(ex.get('students', []))}")
        for idx, st in enumerate(ex.get('students', [])):
            if str(st.get('roll')) == '3' or '2606003' in str(st.get('regNo', '')) or '2606039' in str(st.get('regNo', '')):
                print(f"[{idx}] id={st.get('id')}, regNo={st.get('regNo')}, roll={st.get('roll')}, correct={st.get('correct')}, status={st.get('status')}, isRealScanned={st.get('isRealScanned')}")

print("\n--- Checking all students in school_students for Class Six ---")
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_students',))
all_students = json.loads(c.fetchone()[0])
class_six_students = [s for s in all_students if str(s.get('class', '')).lower() in ['six', '6', '৬ষ্ঠ', '৬ষ্ঠ শ্রেণি']]
print(f"Total Class Six students: {len(class_six_students)}")
for idx, s in enumerate(class_six_students):
    if str(s.get('roll')) in ['1', '2', '3', '4', '5'] or '2606003' in str(s.get('regNo', '')) or '2606039' in str(s.get('regNo', '')):
        print(f"  [{idx}] id={s.get('id')}, regNo={s.get('regNo')}, roll={s.get('roll')}, section={s.get('section')}, name={s.get('name')}, nameBn={s.get('nameBn')}")

conn.close()

import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()

def get_k(key):
    c.execute('SELECT value FROM local_storage_sync WHERE key = ?', (key,))
    row = c.fetchone()
    return json.loads(row[0]) if row else {}

schedules = get_k('school_exam_schedules')
savedMarks = get_k('school_student_marks')
students = get_k('school_students')

print("Total students:", len(students))
for st in students[:5]:
    print("Student:", st.get('id'), st.get('studentId'), st.get('roll'), st.get('nameBn'), st.get('class'), st.get('section'))

# Check keys in savedMarks for schedule 1788103216016 (Elegileble test - English For Today)
sch_id = '1788103216016'
keys_for_sch = [k for k in savedMarks.keys() if sch_id in k]
print(f"\nKeys for schedule {sch_id} (count {len(keys_for_sch)}):")
for k in keys_for_sch[:5]:
    print(" ", k, "=>", savedMarks[k])

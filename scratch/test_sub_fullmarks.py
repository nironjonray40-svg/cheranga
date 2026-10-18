import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_exam_schedules',))
schedules = json.loads(c.fetchone()[0])
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_exam_types',))
types = json.loads(c.fetchone()[0])

def is_exam_match(t, s):
    if not t or not s: return False
    t_clean = t.replace('২০২', '').replace('202', '').strip().lower()
    s_clean = s.replace('২০২', '').replace('202', '').strip().lower()
    return t_clean == s_clean or t_clean in s_clean or s_clean in t_clean

for exam in ['Elegileble test', 'বার্ষিক পরীক্ষা']:
    matched_exam = next((t for t in types if is_exam_match(t.get('name'), exam)), None)
    sub_types = matched_exam.get('examTypes', []) if matched_exam else []
    print(f'=== Exam: {exam} ===')
    for s in schedules:
        if is_exam_match(s.get('term'), exam):
            et = s.get('examType')
            st = next((t for t in sub_types if t.get('typeName') == et), None)
            fm = (st.get('defaultCQ', 0) + st.get('defaultMCQ', 0) + st.get('defaultPractical', 0)) if st else 100
            print(f"  {s.get('subject')} (type: {et}) -> fullMarks: {fm}")

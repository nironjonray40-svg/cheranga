import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = c.fetchone()
if row:
    marks = json.loads(row[0])
    count = 0
    for k, v in marks.items():
        if '1791596672085' in k:
            count += 1
            if count <= 20:
                print(k, '=>', v)
    print(f'Total matches for 1791596672085: {count}')

c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_omr_exams'")
row_omr = c.fetchone()
if row_omr:
    omr_exams = json.loads(row_omr[0])
    for ex in omr_exams:
        if str(ex.get('id')) == '1791596672085':
            print('OMR exam found:', ex.get('examName'), 'Students count:', len(ex.get('students', [])))
            for st in ex.get('students', [])[:10]:
                print('  st:', st.get('id'), st.get('candidateReg'), st.get('roll'), st.get('score'), st.get('totalScore'), st.get('isAbsent'), st.get('status'))

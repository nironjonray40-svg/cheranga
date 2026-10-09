import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()

# 1. Clean school_student_marks
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
row = c.fetchone()
if row:
    marks = json.loads(row[0])
    cleaned_count = 0
    for k, v in marks.items():
        if isinstance(v, dict):
            for subj, sub_val in v.items():
                if isinstance(sub_val, dict):
                    is_pending = sub_val.get('status') == 'পেন্ডিং' or sub_val.get('isAbsent') is True
                    has_no_answers = not sub_val.get('answers') or len(sub_val.get('answers')) == 0
                    if is_pending or has_no_answers:
                        mcq_val = 0
                        try:
                            mcq_val = int(sub_val.get('mcq', 0))
                        except Exception:
                            pass
                        if sub_val.get('fileName') or mcq_val > 0:
                            cleaned_count += 1
                        sub_val['fileName'] = ''
                        sub_val['omrEvaluatedAt'] = None
                        sub_val['mcq'] = 0
                        cq_val = 0
                        try:
                            cq_val = int(sub_val.get('cq', 0))
                        except Exception:
                            pass
                        prac_val = 0
                        try:
                            prac_val = int(sub_val.get('practical', 0))
                        except Exception:
                            pass
                        sub_val['total'] = cq_val + prac_val
                        sub_val['percentage'] = '0.0'
                        sub_val['answers'] = {}
                        sub_val['status'] = 'পেন্ডিং'
                        sub_val['isAbsent'] = True
    c.execute('UPDATE local_storage_sync SET value = ? WHERE key = ?', (json.dumps(marks, ensure_ascii=False), 'school_student_marks'))
    print(f"Cleaned {cleaned_count} entries in school_student_marks")

# 2. Clean school_omr_exams
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_omr_exams',))
row = c.fetchone()
if row:
    exams = json.loads(row[0])
    for ex in exams:
        for st in ex.get('students', []):
            if st.get('status') == 'পেন্ডিং' or not st.get('isRealScanned') or not st.get('answers') or len(st.get('answers')) == 0:
                st['correct'] = 0
                st['wrong'] = 0
                st['blank'] = 30
                st['percentage'] = '0.0'
                st['status'] = 'পেন্ডিং'
                st['answers'] = {}
                st['fileName'] = ''
                st['file'] = None
                st['imagePreviewUrl'] = None
                st['isRealScanned'] = False
    c.execute('UPDATE local_storage_sync SET value = ? WHERE key = ?', (json.dumps(exams, ensure_ascii=False), 'school_omr_exams'))
    print("Cleaned school_omr_exams")

conn.commit()
conn.close()
print("Database cleanup complete")

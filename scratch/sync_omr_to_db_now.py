import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_students',))
all_students = json.loads(c.fetchone()[0])

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_omr_exams',))
omr_exams = json.loads(c.fetchone()[0])

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_exam_schedules',))
schedules = json.loads(c.fetchone()[0])

c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
saved_marks = json.loads(c.fetchone()[0])

def is_reg_no_match(reg_a, reg_b):
    if not reg_a or not reg_b:
        return False
    sa = str(reg_a).strip()
    sb = str(reg_b).strip()
    if sa == sb:
        return True
    stra = sa.lstrip('0')
    strb = sb.lstrip('0')
    if stra and strb and stra == strb:
        return True
    return False

def map_class_to_number(cls):
    if not cls:
        return '8'
    c_str = str(cls).strip().lower()
    m = {'six': '6', '6': '6', '৬': '6', 'seven': '7', '7': '7', '৭': '7', 'eight': '8', '8': '8', '৮': '8', 'nine': '9', '9': '9', '৯': '9', 'ten': '10', '10': '10', '১০': '10'}
    return m.get(c_str, c_str)

for omr in omr_exams:
    sch_id = str(omr.get('id'))
    exam_val = omr.get('examName') or 'Exam'
    sch = next((s for s in schedules if str(s.get('id')) == sch_id), None)
    sub_code = sch.get('subjectCode') if sch else (omr.get('subject') or '101')
    sub_name = sch.get('subject') if sch else omr.get('subject')
    target_sub_keys = [sub_code, sub_name, '101', '102', 'MCQ']
    target_sub_keys = list(set([k for k in target_sub_keys if k]))

    students = omr.get('students', [])
    print(f"Syncing OMR exam {omr.get('examName')} ({sub_name}) with {len(students)} students...")

    for st in students:
        raw_reg = str(st.get('id') or st.get('regNo') or '').strip()
        raw_roll = str(st.get('roll') or '').strip()
        sec = str(st.get('section') or '').strip()
        cls_num = map_class_to_number(st.get('class'))

        is_pending = (st.get('status') == 'পেন্ডিং' and not st.get('isRealScanned') and (not st.get('correct') or st.get('correct') == 0))
        is_absent = is_pending
        mcq_score = 0 if is_absent else int(st.get('correct') or 0)

        # 1. Exact RegNo Match
        master_st = next((s for s in all_students if is_reg_no_match(s.get('regNo'), raw_reg) or is_reg_no_match(s.get('studentId'), raw_reg) or is_reg_no_match(s.get('id'), raw_reg)), None)

        # 2. Fallback Class + Sec + Roll
        if not master_st:
            master_st = next((s for s in all_students if map_class_to_number(s.get('class')) == cls_num and str(s.get('section', '')).strip().lower() == sec.lower() and str(s.get('roll', '')).strip() == raw_roll), None)

        # 3. Fallback Class + Roll
        if not master_st:
            master_st = next((s for s in all_students if map_class_to_number(s.get('class')) == cls_num and str(s.get('roll', '')).strip() == raw_roll), None)

        target_ids = set()
        if master_st:
            if master_st.get('id'): target_ids.add(str(master_st.get('id')))
            if master_st.get('regNo'): target_ids.add(str(master_st.get('regNo')))
            if master_st.get('studentId'): target_ids.add(str(master_st.get('studentId')))
        if st.get('id'): target_ids.add(str(st.get('id')))
        if st.get('regNo'): target_ids.add(str(st.get('regNo')))
        if raw_reg: target_ids.add(raw_reg)

        for tid in target_ids:
            keys_to_update = [f"marks_{tid}_{sch_id}", f"marks_{tid}_{exam_val}"]
            for k in keys_to_update:
                if k not in saved_marks:
                    saved_marks[k] = {}
                for sk in target_sub_keys:
                    ex = saved_marks[k].get(sk, {})
                    cq_val = ex.get('cq', 0)
                    if isinstance(cq_val, str) and cq_val.upper() in ['A', 'ABS']:
                        cq_num = 0
                    else:
                        try: cq_num = int(cq_val)
                        except: cq_num = 0

                    prac_val = ex.get('practical', 0)
                    if isinstance(prac_val, str) and prac_val.upper() in ['A', 'ABS']:
                        prac_num = 0
                    else:
                        try: prac_num = int(prac_val)
                        except: prac_num = 0

                    tot = cq_num + (0 if is_absent else mcq_score) + prac_num
                    saved_marks[k][sk] = {
                        'total': tot,
                        'isAbsent': is_absent,
                        'cq': cq_val if (cq_val or cq_val == 0) else 0,
                        'mcq': 0 if is_absent else mcq_score,
                        'practical': prac_val if (prac_val or prac_val == 0) else 0,
                        'set': st.get('set') or 'ক',
                        'answers': {} if is_absent else (st.get('answers') or {}),
                        'percentage': '0.0' if is_absent else st.get('percentage', f"{(mcq_score/30)*100:.1f}"),
                        'status': 'পেন্ডিং' if is_absent else st.get('status', 'উত্তীর্ণ' if mcq_score >= 10 else 'অনুত্তীর্ণ'),
                        'fileName': '' if is_absent else (st.get('fileName') or ''),
                        'omrEvaluatedAt': None if is_absent else st.get('evaluatedAt', '2026-10-10T14:00:00Z')
                    }

# Save updated school_student_marks to SQLite DB
c.execute('UPDATE local_storage_sync SET value = ? WHERE key = ?', (json.dumps(saved_marks), 'school_student_marks'))
conn.commit()

# Verify student 2606003 in DB
print("\n--- Verifying student 2606003 after sync ---")
for k in [f"marks_1787794001271-86151-2_1791596672085", f"marks_2606003_1791596672085"]:
    print(f"{k} => {saved_marks.get(k)}")

conn.close()
print("\nSUCCESS: Synced school_student_marks in school.db!")

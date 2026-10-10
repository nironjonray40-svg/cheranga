import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key = 'school_exam_schedules'")
schedules = json.loads(c.fetchone()[1])

c.execute("SELECT key, value FROM local_storage_sync WHERE key = 'school_student_marks'")
saved_marks = json.loads(c.fetchone()[1])

c.execute("SELECT key, value FROM local_storage_sync WHERE key = 'school_omr_exams'")
omr_exams = json.loads(c.fetchone()[1])

c.execute("SELECT key, value FROM local_storage_sync WHERE key = 'school_students'")
all_students = json.loads(c.fetchone()[1])

def check_if_schedule_has_mcq_marks(sch, saved_marks, omr_exams):
    if not sch or not sch.get('id'):
        return False
    sch_id = str(sch.get('id')).strip()

    # 1. Explicit flags
    if sch.get('hasMcqMarks') is True or sch.get('omrEvaluatedAt'):
        return True

    # 2. Check OMR exams
    if omr_exams and any(str(oe.get('id')) == sch_id or str(oe.get('scheduleId')) == sch_id for oe in omr_exams):
        return True

    # 3. Saved marks in school_student_marks
    if saved_marks and isinstance(saved_marks, dict):
        target_sub_code = (sch.get('subjectCode') or sch.get('subject') or '').strip().lower()
        target_sub_name = (sch.get('subject') or '').strip().lower()

        for key, student_data in saved_marks.items():
            if key.startswith('timestamp_'):
                continue
            if key.endswith('_' + sch_id) or ('_' + sch_id) in key:
                if isinstance(student_data, dict):
                    for sub_key, sub_val in student_data.items():
                        if not isinstance(sub_val, dict):
                            continue
                        sub_key_clean = sub_key.strip().lower()
                        is_match = (not target_sub_code or
                                    sub_key_clean == target_sub_code or
                                    sub_key_clean == target_sub_name or
                                    len(student_data) == 1)
                        if is_match:
                            if sub_val.get('omrEvaluatedAt'):
                                return True
                            if sub_val.get('answers') and isinstance(sub_val.get('answers'), dict) and len(sub_val.get('answers')) > 0:
                                return True
                            if sub_val.get('mcq') is not None and sub_val.get('mcq') != '':
                                mcq_str = str(sub_val.get('mcq')).strip().upper()
                                if mcq_str.isdigit() or mcq_str in ['A', 'ABS']:
                                    return True

        if sch.get('marksEntryTime'):
            has_marks_keys = any(not k.startswith('timestamp_') and (k.endswith('_' + sch_id) or ('_' + sch_id) in k) for k in saved_marks.keys())
            if has_marks_keys:
                return True

    return False

# Simulate openImportExamModal
available_in_import_modal = []
filtered_out_exams = []

for sch in schedules:
    if check_if_schedule_has_mcq_marks(sch, saved_marks, omr_exams):
        filtered_out_exams.append(sch)
    else:
        available_in_import_modal.append(sch)

print(f"Total Exam Schedules in Exam List: {len(schedules)}")
print(f"Exams filtered out from 'Import Exam' (MCQ Marks already entered): {len(filtered_out_exams)}")
for f in filtered_out_exams:
    print(f"  [Filtered Out] ID: {f.get('id')} | Term: {f.get('term')} | Class: {f.get('class')} | Subject: {f.get('subject')}")

print(f"\nExams shown in 'Import Exam' (MCQ Marks pending/not entered): {len(available_in_import_modal)}")
for a in available_in_import_modal:
    print(f"  [Visible in Import] ID: {a.get('id')} | Term: {a.get('term')} | Class: {a.get('class')} | Subject: {a.get('subject')}")

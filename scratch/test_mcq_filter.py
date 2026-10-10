import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT key, value FROM local_storage_sync WHERE key = ?', ('school_exam_schedules',))
schedules = json.loads(c.fetchone()[1])

c.execute('SELECT key, value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
saved_marks = json.loads(c.fetchone()[1])

c.execute('SELECT key, value FROM local_storage_sync WHERE key = ?', ('school_omr_exams',))
omr_exams = json.loads(c.fetchone()[1])

def has_schedule_mcq_marks(sch, saved_marks, omr_exams):
    if not sch:
        return False
    sch_id = str(sch.get('id'))
    
    # 1. Check OMR exams
    if any(str(oe.get('id')) == sch_id or str(oe.get('scheduleId')) == sch_id for oe in omr_exams):
        return True
        
    # 2. Check schedule properties
    if sch.get('omrEvaluatedAt') or sch.get('hasMcqMarks') is True:
        return True
        
    # 3. Check saved marks
    target_sub_code = (sch.get('subjectCode') or sch.get('subject') or '').strip().lower()
    for key, student_data in saved_marks.items():
        if key.startswith('timestamp_'):
            continue
        if f'_{sch_id}' in key:
            if isinstance(student_data, dict):
                for sub_key, sub_val in student_data.items():
                    if not isinstance(sub_val, dict):
                        continue
                    is_matching = (not target_sub_code or 
                                   sub_key.strip().lower() == target_sub_code or
                                   (sch.get('subject') and sub_key.strip().lower() == sch.get('subject').strip().lower()) or
                                   len(student_data) == 1)
                    if is_matching:
                        if sub_val.get('omrEvaluatedAt'):
                            return True
                        if sub_val.get('mcq') is not None and sub_val.get('mcq') != '':
                            return True
                        if sub_val.get('answers') and isinstance(sub_val.get('answers'), dict) and len(sub_val.get('answers')) > 0:
                            return True
                            
    if sch.get('marksEntryTime'):
        has_any_key = any(f'_{sch_id}' in k for k in saved_marks.keys())
        if has_any_key:
            return True
            
    return False

print("=== TESTING has_schedule_mcq_marks ===")
available_for_import = []
excluded_because_has_mcq = []

for s in schedules:
    has_mcq = has_schedule_mcq_marks(s, saved_marks, omr_exams)
    if has_mcq:
        excluded_because_has_mcq.append(f"{s.get('term')} | {s.get('class')} | {s.get('subject')} (ID: {s.get('id')})")
    else:
        available_for_import.append(f"{s.get('term')} | {s.get('class')} | {s.get('subject')} (ID: {s.get('id')})")

print(f"EXCLUDED FROM IMPORT (Has MCQ Marks: {len(excluded_because_has_mcq)}):")
for item in excluded_because_has_mcq:
    print(f"  - {item}")

print(f"\nAVAILABLE FOR IMPORT (Pending MCQ Marks: {len(available_for_import)}):")
for item in available_for_import:
    print(f"  - {item}")

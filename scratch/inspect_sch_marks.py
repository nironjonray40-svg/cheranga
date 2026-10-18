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

print(f"Total schedules: {len(schedules)}")
for sch in schedules:
    schId = sch.get('id')
    term = sch.get('term')
    cls = sch.get('class')
    sec = sch.get('section')
    subj = sch.get('subject')
    
    # check keys in savedMarks
    matched_keys = [k for k in savedMarks.keys() if str(schId) in k]
    print(f"\nSchedule ID {schId} | Exam: '{term}' | Class: '{cls}' | Section: '{sec}' | Subject: '{subj}' | hasMarks: {sch.get('hasMarks')}")
    print(f"  Matched mark keys count in savedMarks: {len(matched_keys)}")
    if matched_keys:
        sample_key = matched_keys[0]
        print(f"  Sample key: {sample_key} => {savedMarks[sample_key]}")

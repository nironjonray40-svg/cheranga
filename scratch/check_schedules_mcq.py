import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT key, value FROM local_storage_sync WHERE key = ?', ('school_exam_schedules',))
schedules = json.loads(c.fetchone()[1])

c.execute('SELECT key, value FROM local_storage_sync WHERE key = ?', ('school_student_marks',))
marks = json.loads(c.fetchone()[1])

print(f"Total schedules: {len(schedules)}")
for s in schedules:
    sch_id = s.get('id')
    # Find all keys in marks corresponding to this schedule
    related_keys = [k for k in marks.keys() if f"_{sch_id}" in k]
    has_mcq_count = 0
    has_cq_count = 0
    total_entries = 0
    for k in related_keys:
        data = marks[k]
        if isinstance(data, dict):
            for sub, val in data.items():
                if isinstance(val, dict):
                    total_entries += 1
                    if val.get('mcq') is not None and val.get('mcq') != '' and val.get('mcq') != 'A':
                        has_mcq_count += 1
                    if val.get('cq') is not None and val.get('cq') != '' and val.get('cq') != 'A':
                        has_cq_count += 1
    print(f"Schedule: {s.get('term')} | {s.get('class')} | {s.get('subject')} (ID: {sch_id}) -> marksEntryTime: {s.get('marksEntryTime')} | keys: {len(related_keys)} | mcqCount: {has_mcq_count} | cqCount: {has_cq_count}")

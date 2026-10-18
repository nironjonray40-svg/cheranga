import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
row = c.fetchone()
marks = json.loads(row[0]) if row else {}

c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_exam_schedules'")
row2 = c.fetchone()
schedules = json.loads(row2[0]) if row2 else []
sched_ids = {str(s.get('id')): s for s in schedules}

with open('scratch/marks_analysis.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total mark records: {len(marks)}\n")
    # check how many match schedule ids
    by_sched = {}
    for k, v in marks.items():
        parts = k.split('_')
        # typical format marks_{stId}_{schedId} or marks_{stId}_{term}
        if len(parts) >= 3:
            st_id = parts[1]
            suffix = '_'.join(parts[2:])
            by_sched[suffix] = by_sched.get(suffix, 0) + 1
    
    out.write("\nMarks count grouped by suffix (schedule ID or exam name):\n")
    for sfx, count in by_sched.items():
        sched_info = sched_ids.get(sfx)
        if sched_info:
            out.write(f"  Schedule {sfx} ({sched_info.get('term')} | {sched_info.get('class')} | {sched_info.get('subject')}): {count} marks\n")
        else:
            out.write(f"  Suffix '{sfx}': {count} marks\n")

    # Sample mark record details for each schedule
    out.write("\nSample records for known schedules:\n")
    for sfx in by_sched:
        if sfx in sched_ids:
            sched_info = sched_ids[sfx]
            matching_keys = [k for k in marks if k.endswith('_' + sfx)]
            out.write(f"\n--- Suffix {sfx} ({sched_info.get('term')} - {sched_info.get('subject')}) ---\n")
            for mk in matching_keys[:3]:
                out.write(f"  {mk} => {json.dumps(marks[mk], ensure_ascii=False)}\n")

print("Done")

import sqlite3, json

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_exam_types', 'school_subjects')")
rows = dict(c.fetchall())

with open('scratch/exam_configs_dump.txt', 'w', encoding='utf-8') as out:
    if 'school_exam_types' in rows:
        types = json.loads(rows['school_exam_types'])
        out.write(f"=== school_exam_types (Total: {len(types)}) ===\n")
        out.write(json.dumps(types, ensure_ascii=False, indent=2))
        out.write("\n\n")

    if 'school_exam_schedules' in rows:
        scheds = json.loads(rows['school_exam_schedules'])
        out.write(f"=== school_exam_schedules (Total: {len(scheds)}) ===\n")
        out.write(json.dumps(scheds, ensure_ascii=False, indent=2))
        out.write("\n\n")

    if 'school_subjects' in rows:
        subs = json.loads(rows['school_subjects'])
        out.write(f"=== school_subjects ===\n")
        out.write(json.dumps(subs, ensure_ascii=False, indent=2))
        out.write("\n\n")

print("Done dumping to scratch/exam_configs_dump.txt")

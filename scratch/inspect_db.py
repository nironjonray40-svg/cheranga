import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT key, length(value) FROM local_storage_sync")
rows = cursor.fetchall()
print("Keys in local_storage_sync:")
for k, l in rows:
    print(f"  {k} (length: {l})")

print("\n--- Inspecting specific keys ---")
for target_key in ['school_classes', 'school_exam_schedules', 'school_exam_routines', 'school_exam_types', 'school_subjects', 'school_students']:
    cursor.execute("SELECT value FROM local_storage_sync WHERE key = ?", (target_key,))
    r = cursor.fetchone()
    if r:
        val = json.loads(r[0])
        if isinstance(val, list):
            print(f"\n{target_key} count: {len(val)}")
            if len(val) > 0:
                print(f"Sample item from {target_key}:", json.dumps(val[0], ensure_ascii=False)[:300])
                if target_key == 'school_classes':
                    print("All classes:", val)
                if target_key == 'school_exam_schedules':
                    print("All exam schedule terms/classes:", [(s.get('term'), s.get('class'), s.get('examName')) for s in val[:10]])
                if target_key == 'school_exam_routines':
                    print("All routines sample:", [(s.get('examName'), s.get('class'), s.get('subjectName') or s.get('subject')) for s in val[:10]])
        elif isinstance(val, dict):
            print(f"\n{target_key} keys: {list(val.keys())}")
            for k in list(val.keys())[:3]:
                print(f"  Key '{k}':", json.dumps(val[k], ensure_ascii=False)[:200])

# -*- coding: utf-8 -*-
import sys, sqlite3, json
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

def get_db_key(k):
    cursor.execute("SELECT value FROM local_storage_sync WHERE key=?", (k,))
    row = cursor.fetchone()
    if row and row[0]:
        try:
            return json.loads(row[0])
        except:
            return row[0]
    return None

store = get_db_key('school_seat_plans_store') or {}
savedAlloc = get_db_key('school_saved_seat_allocations') or {}

for planKey, plan in store.items():
    print(f"\nPlan {planKey}:")
    total_benches = 0
    total_students = 0
    sample_student = None
    for rId, item in plan.get('allocations', {}).items():
        for b in item.get('benches', []):
            total_benches += 1
            for side in [b.get('left'), b.get('right')]:
                if side:
                    total_students += 1
                    if not sample_student:
                        sample_student = side
    print(f"  Total benches: {total_benches}, Total students: {total_students}")
    print(f"  Sample student on bench:", sample_student)

print("\nsavedAlloc:")
total_benches = 0
total_students = 0
sample_student = None
for rId, item in savedAlloc.items():
    for b in item.get('benches', []):
        total_benches += 1
        for side in [b.get('left'), b.get('right')]:
            if side:
                total_students += 1
                if not sample_student:
                    sample_student = side
print(f"  Total benches: {total_benches}, Total students: {total_students}")
print(f"  Sample student on bench in savedAlloc:", sample_student)

import sqlite3
import json
import sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
r = cursor.fetchone()
if r:
    students = json.loads(r[0])
    print(f"Total students: {len(students)}")
    classes = Counter(s.get('class') for s in students)
    print("Students count per class:", classes)
    for cls in classes:
        sample_st = [s for s in students if s.get('class') == cls]
        print(f"Class '{cls}': {len(sample_st)} students. Sample names: {[s.get('name') for s in sample_st[:3]]}")

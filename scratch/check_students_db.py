import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(c.fetchone()[0])
class_counts = {}
for s in students:
    cls = s.get('class', 'Unknown')
    class_counts[cls] = class_counts.get(cls, 0) + 1
print('Student counts by class:', class_counts)

# Let's inspect a few Class Eight and Class Ten students
eight_students = [s for s in students if 'eight' in str(s.get('class')).lower()]
ten_students = [s for s in students if 'ten' in str(s.get('class')).lower() or '10' in str(s.get('class'))]
print(f'Class Eight sample ({len(eight_students)} students):', eight_students[:2])
print(f'Class Ten sample ({len(ten_students)} students):', ten_students[:2])

conn.close()

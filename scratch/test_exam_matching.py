import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = ?", ('school_exam_schedules',))
schedules = json.loads(c.fetchone()[0])
terms = set(s.get('term') for s in schedules)
print('Exam terms in schedules:', terms)
print('Testing match with "বার্ষিক পরীক্ষা ২০২৫":', any(s.get('term') == 'বার্ষিক পরীক্ষা ২০২৫' for s in schedules))
print('Testing match with "বার্ষিক পরীক্ষা":', any(s.get('term') == 'বার্ষিক পরীক্ষা' for s in schedules))

c.execute("SELECT value FROM local_storage_sync WHERE key = ?", ('school_exam_types',))
types = json.loads(c.fetchone()[0])
type_names = set(t.get('name') for t in types)
print('Exam names in types:', type_names)

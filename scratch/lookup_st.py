import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(c.fetchone()[0])

st = next((s for s in students if s.get('id') == '1787794001272-84216-5'), None)
print("Student for 1787794001272-84216-5:", st)

import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_saved_seat_allocations'")
allocs = json.loads(c.fetchone()[0])

for a in allocs:
    for st in a.get('students', []):
        if st.get('id') == '1787794001272-84216-5' or '1787794001272-84216-5' in str(st):
            print("Found student in allocs:", st)
            break

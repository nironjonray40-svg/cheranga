import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
data = json.loads(c.fetchone()[0])
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(c.fetchone()[0])
class8 = [s for s in students if s.get('class') in ['Eight', '8th', '৮ম']]
for st in class8:
    st_id = st.get('id')
    eng1 = None
    eng2 = None
    b1 = None
    b2 = None
    math = None
    for k, v in data.items():
        if st_id in k:
            if 'English 1st Paper' in v: eng1 = v['English 1st Paper'].get('cq')
            if 'English 2nd Paper' in v: eng2 = v['English 2nd Paper'].get('cq')
            if 'Bangla 1st Paper' in v: b1 = v['Bangla 1st Paper']
            if 'Bangla 2nd Paper' in v: b2 = v['Bangla 2nd Paper']
            if 'Mathematics' in v: math = v['Mathematics']
    print(f"{st.get('roll')} {st.get('name')}: Eng1={eng1}, Eng2={eng2}, B1={b1}, B2={b2}, Math={math}")

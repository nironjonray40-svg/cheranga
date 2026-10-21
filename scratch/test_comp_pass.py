import sqlite3, json, math

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
saved_marks = json.loads(c.fetchone()[0])
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_students'")
students = json.loads(c.fetchone()[0])

class8 = [s for s in students if s.get('class') in ['Eight', '8th', '৮ম']]

def is_comp_pass(mark, full, pass_pct=33):
    if not full or full <= 0: return True
    if mark is None or mark == '' or mark == '-': return False
    try:
        m = float(mark)
    except:
        return False
    min_pass = round(full * (pass_pct / 100))
    return (m >= min_pass) or ((m / full) * 100 >= pass_pct)

print("Pass mark checks:")
for f in [100, 70, 50, 35, 30, 25, 20, 15]:
    print(f"Full {f}: min_pass={round(f*0.33)}")

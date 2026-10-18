import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute('SELECT value FROM local_storage_sync WHERE key = ?', ('school_marking_system',))
rules = json.loads(c.fetchone()[0])
rules.sort(key=lambda r: float(r['min']), reverse=True)

print("=== LOADED GRADING SYSTEM FROM DB ===")
for r in rules:
    print(f"Grade: {r['name']:<3} | Range: {r['min']}% - {r['max']}% | GP: {float(r['gp']):.2f}")

def calculate_grade_and_gp(marks, full_marks=100):
    if marks is None: return {'grade': 'F', 'gp': 0.0}
    pct = (marks / full_marks) * 100
    for r in rules:
        if pct >= float(r['min']) and pct <= float(r['max']):
            return {'grade': r['name'], 'gp': float(r['gp']), 'pct': pct}
        if (pct + 0.001) >= float(r['min']):
            return {'grade': r['name'], 'gp': float(r['gp']), 'pct': pct}
    return {'grade': 'F', 'gp': 0.0, 'pct': pct}

print("\n=== TEST SUBJECT GRADING OUT OF 50 MARKS (HEADER মোট ৫০) ===")
# Out of 50:
for mark in [45, 40, 36, 32, 26, 21, 16, 12]:
    res = calculate_grade_and_gp(mark, 50)
    print(f"Obtained: {mark}/50 ({res['pct']:.1f}%) -> Grade: {res['grade']}, GP: {res['gp']}")

print("\n=== TEST SUBJECT GRADING OUT OF 100 MARKS (HEADER মোট ১০০) ===")
# Out of 100:
for mark in [92, 80, 74, 65, 55, 43, 35, 20]:
    res = calculate_grade_and_gp(mark, 100)
    print(f"Obtained: {mark}/100 ({res['pct']:.1f}%) -> Grade: {res['grade']}, GP: {res['gp']}")

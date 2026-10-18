import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
c = conn.cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_omr_exams'")
row = c.fetchone()
if row:
    omr = json.loads(row[0])
    print(f"Total omr exams: {len(omr)}")
    for o in omr[:3]:
        print("OMR exam:", o.get('id'), o.get('examName'), o.get('subject'), o.get('class'), o.get('section'))
        results = o.get('results', [])
        print(f"  Results count: {len(results)}")
        if results:
            print("  Sample result:", results[0])

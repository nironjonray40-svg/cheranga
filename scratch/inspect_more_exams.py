import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_omr_exams'")
r = cursor.fetchone()
if r:
    omr_exams = json.loads(r[0])
    print(f"school_omr_exams count: {len(omr_exams)}")
    if omr_exams:
        print("Sample omr_exam:", [(e.get('examName') or e.get('name') or e.get('title'), e.get('class'), e.get('subject')) for e in omr_exams[:5]])

try:
    with open('exams_data.json', encoding='utf-8') as f:
        edata = json.load(f)
        print("exams_data.json type:", type(edata))
        if isinstance(edata, list):
            print(f"exams_data.json items: {len(edata)}, sample: {edata[0] if edata else ''}")
        elif isinstance(edata, dict):
            print("exams_data.json keys:", list(edata.keys())[:10])
except Exception as e:
    print("exams_data.json error:", e)

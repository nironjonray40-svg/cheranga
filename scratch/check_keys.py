import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cur = conn.cursor()
cur.execute("SELECT value FROM local_storage_sync WHERE key='school_omr_exams'")
row = cur.fetchone()
if row:
    exams = json.loads(row[0])
    for ex in exams:
        print('Exam:', ex.get('examName'), 'ID:', ex.get('id'))
        keys = ex.get('answerKeys', {})
        for s in ['ক', 'খ', 'গ', 'ঘ']:
            k = keys.get(s)
            if k:
                if isinstance(k, list):
                    print(f"  Set {s} (list len {len(k)}): Q1={k[0] if len(k)>0 else None}, Q2={k[1] if len(k)>1 else None}, Q3={k[2] if len(k)>2 else None}, Q4={k[3] if len(k)>3 else None}, Q30={k[29] if len(k)>29 else None}")
                elif isinstance(k, dict):
                    print(f"  Set {s} (dict): Q1={k.get(1) or k.get('1')}, Q2={k.get(2) or k.get('2')}, Q3={k.get(3) or k.get('3')}, Q4={k.get(4) or k.get('4')}, Q30={k.get(30) or k.get('30')}")

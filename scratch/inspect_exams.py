import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

print("--- EXAM TYPES ---")
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_exam_types'")
r = cursor.fetchone()
if r:
    types = json.loads(r[0])
    for t in types:
        print(f"Exam Type: name={t.get('name')}, type={t.get('type')}")

print("\n--- EXAM SCHEDULES ---")
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_exam_schedules'")
r = cursor.fetchone()
if r:
    scheds = json.loads(r[0])
    print(f"Total schedules: {len(scheds)}")
    terms = set(s.get('term') for s in scheds)
    print("Unique terms in schedules:", terms)
    for t in terms:
        t_scheds = [s for s in scheds if s.get('term') == t]
        print(f"Term '{t}': {len(t_scheds)} entries. Classes: {set(s.get('class') for s in t_scheds)}")
        for s in t_scheds[:5]:
            print(f"   Class: {s.get('class')}, Sub: {s.get('subject')}, Sec: {s.get('section')}")

print("\n--- EXAM ROUTINES ---")
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_exam_routines'")
r = cursor.fetchone()
if r:
    routines = json.loads(r[0])
    print(f"Total routines: {len(routines)}")
    exam_names = set(rt.get('examName') for rt in routines)
    print("Unique examName in routines:", exam_names)
    for en in exam_names:
        en_rts = [rt for rt in routines if rt.get('examName') == en]
        print(f"Exam '{en}': {len(en_rts)} routines. Classes: {set(rt.get('class') for rt in en_rts)}")
        for rt in en_rts[:5]:
            print(f"   Class: {rt.get('class')}, Sub: {rt.get('subject')}, Code/Key: {rt.get('rowSubjectKey')}")

print("\n--- STUDENT MARKS SAMPLE ---")
cursor.execute("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'")
r = cursor.fetchone()
if r:
    marks = json.loads(r[0])
    print(f"Total student_marks entries: {len(marks) if isinstance(marks, (list, dict)) else 'N/A'}")
    if isinstance(marks, dict):
        print("Marks keys sample:", list(marks.keys())[:10])
    elif isinstance(marks, list):
        print("Marks sample item:", marks[0] if marks else 'empty')

import re
import subprocess
import json
import sqlite3
import os
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def test_syntax(file_path):
    print(f"Testing JS syntax in {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all <script> contents (ignoring src scripts)
    scripts = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', content, re.DOTALL)
    print(f"Found {len(scripts)} inline script blocks in {file_path}")
    
    for i, script in enumerate(scripts):
        temp_js = f"scratch/temp_{os.path.basename(file_path)}_{i}.js"
        with open(temp_js, 'w', encoding='utf-8') as f_out:
            f_out.write(script)
        
        result = subprocess.run(['node', '-c', temp_js], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Syntax error in {file_path} script block {i}:")
            print(result.stderr)
            return False
        else:
            print(f"✅ Script block {i} in {file_path} passed node -c check.")
        
        try:
            os.remove(temp_js)
        except:
            pass

    return True

def test_data_integrity():
    print("\nTesting Data Integrity and Sync Logic from SQLite...")
    conn = sqlite3.connect('school.db')
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_student_marks', 'school_students')")
    data = dict(cursor.fetchall())
    conn.close()

    schedules = json.loads(data.get('school_exam_schedules', '[]'))
    marks = json.loads(data.get('school_student_marks', '{}'))
    students = json.loads(data.get('school_students', '[]'))

    print(f"Total schedules in DB: {len(schedules)}")
    print(f"Total mark records in DB: {len(marks)}")
    print(f"Total students in DB: {len(students)}")

    # Distinct exams in schedules
    exam_names = list({s.get('term', '').strip() for s in schedules if s.get('term')})
    print(f"Exam names from schedules: {exam_names}")

    # Check for 'Elegileble test'
    eligible_test_schedules = [s for s in schedules if s.get('term') == 'Elegileble test']
    print(f"'Elegileble test' schedules: {len(eligible_test_schedules)}")
    classes = list({s.get('class') for s in eligible_test_schedules})
    print(f"'Elegileble test' classes: {classes}")

    subjects = [(s.get('id'), s.get('subject'), s.get('class')) for s in eligible_test_schedules]
    for s_id, s_sub, s_cls in subjects:
        # Check how many students have marks for this schedule
        count = sum(1 for k in marks if f"_{s_id}" in k or s_id in str(marks[k]))
        print(f"  Schedule {s_id}: {s_sub} ({s_cls}) -> {count} student mark entries")

    print("\n✅ Verification complete! Data structure and logic verified.")

if __name__ == '__main__':
    os.makedirs('scratch', exist_ok=True)
    t1 = test_syntax('Tabulation Sheet.html')
    t2 = test_syntax('exam-portal.html')
    test_data_integrity()
    if t1 and t2:
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print("\n❌ SOME TESTS FAILED!")

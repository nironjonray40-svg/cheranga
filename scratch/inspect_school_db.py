# -*- coding: utf-8 -*-
import sys, sqlite3, json
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

# Check tables in school.db
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables in school.db:", [t[0] for t in tables])

# Check if there are students in school.db
for tbl in ['students', 'student_admissions', 'seat_plans', 'exam_routines', 'classes']:
    if (tbl,) in tables:
        cursor.execute(f"SELECT count(*) FROM {tbl}")
        print(f"Table {tbl} row count: {cursor.fetchone()[0]}")

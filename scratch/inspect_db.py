import sqlite3

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

for k in ['school_active_exam_filter', 'school_marksheet_class', 'school_marksheet_exam', 'tabulation_gpa_method']:
    cursor.execute("SELECT value FROM local_storage_sync WHERE key=?", (k,))
    row = cursor.fetchone()
    print(k, '=>', row[0] if row else None)

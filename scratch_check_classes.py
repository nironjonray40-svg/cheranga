import sqlite3
import json

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute('SELECT key, value FROM local_storage_sync WHERE key = "school_subjects"')
row = cursor.fetchone()
if row:
    print("Subjects:")
    subjects = json.loads(row[1])
    print(json.dumps(subjects, indent=2))
else:
    print("No subjects key found.")
conn.close()

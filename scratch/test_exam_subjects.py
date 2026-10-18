import sqlite3, json

c = sqlite3.connect('school.db').cursor()
c.execute("SELECT value FROM local_storage_sync WHERE key = 'school_exam_schedules'")
schedules = json.loads(c.fetchone()[0])

def test_exam_subjects(exam_name, class_name):
    matched = [s for s in schedules if s.get('term') == exam_name and s.get('class') == class_name]
    with open('scratch/exam_subjects_out.txt', 'a', encoding='utf-8') as out:
        out.write(f"\nExam: {exam_name} | Class: {class_name}\n")
        out.write(f"Matched {len(matched)} schedules in Exam List:\n")
        for s in matched:
            out.write(f"  ID: {s.get('id')} -> Subject: '{s.get('subject')}'\n")

with open('scratch/exam_subjects_out.txt', 'w', encoding='utf-8') as out:
    out.write("--- SCHEDULE SUBJECTS ---\n")

test_exam_subjects('Elegileble test', 'Eight')
test_exam_subjects('বার্ষিক পরীক্ষা', 'Six')
test_exam_subjects('অর্ধ-বার্ষিক পরীক্ষা', 'Eight')

print("Done")

import json

with open('scratch/db_export.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

schedules = json.loads(data.get('school_exam_schedules', '[]'))
students = json.loads(data.get('school_students', '[]'))
savedMarks = json.loads(data.get('school_student_marks', '{}'))

# Find schedule with term 'Elegileble test' or 'Elegible test'
matched_schedules = [s for s in schedules if 'Eleg' in s.get('term', '')]
print(f"Found {len(matched_schedules)} matching schedules")

for sch in matched_schedules:
    activeExamScheduleId = sch['id']
    # If in modal: Code badge says 'Code: English 1st Paper'
    # Or '103'
    # Let's check what subjects are in savedMarks for activeExamScheduleId
    keys_for_sch = [k for k in savedMarks.keys() if str(activeExamScheduleId) in k]
    print(f"\nSchedule {sch['id']} - term: {sch.get('term')}, subject: {sch.get('subject')}, slNo: {sch.get('slNo')}")
    print(f"Total keys in savedMarks with this scheduleId: {len(keys_for_sch)}")
    if keys_for_sch:
        first_key = keys_for_sch[0]
        print(f"Sample key: {first_key} => {savedMarks[first_key]}")

with open('scratch/schedules_summary.json', 'w', encoding='utf-8') as out:
    json.dump(schedules, out, indent=2, ensure_ascii=False)

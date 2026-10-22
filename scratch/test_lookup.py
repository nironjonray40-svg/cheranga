import json

with open('scratch/db_export.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

schedules = json.loads(data.get('school_exam_schedules', '[]'))
students = json.loads(data.get('school_students', '[]'))
savedMarks = json.loads(data.get('school_student_marks', '{}'))

print("All schedules:")
for s in schedules:
    print(s['id'], s.get('class'), s.get('term'), s.get('subject'), s.get('subjectCode'))

# Let's inspect schedule 1788103216016
sch = next(s for s in schedules if s['id'] == '1788103216016')
activeExamScheduleId = sch['id']
# Let's check what activeExamSubjectCode would be if subject is 'English For Today' or 'English 1st Paper'
# In screenshot: subject name in modal is 'English 1st Paper - Elegible test (ENG)'
# Code badge says: 'Code: English 1st Paper'
activeExamSubjectCode = 'English 1st Paper'
examVal = sch.get('term', '')

cls8 = [s for s in students if 'Eight' in str(s.get('class', ''))]

print("\n--- Testing lookup for cls8 students with activeExamSubjectCode = 'English 1st Paper' ---")
for student in cls8[:5]:
    st_id = student.get('id')
    rawReg = str(student.get('regNo') or '').strip()
    rawId = str(st_id or '').strip()
    possibleKeys = [
        f"marks_{st_id}_{activeExamScheduleId}",
        f"marks_{rawReg}_{activeExamScheduleId}",
        f"marks_{rawId}_{activeExamScheduleId}",
        f"marks_{student.get('regNo')}_{activeExamScheduleId}",
        f"marks_{student.get('studentId')}_{activeExamScheduleId}",
        f"marks_{st_id}_{examVal}",
        f"marks_{rawReg}_{examVal}"
    ]
    studentExamMarks = None
    matchedKey = None
    matchedBranch = None
    for k in possibleKeys:
        if k in savedMarks and isinstance(savedMarks[k], dict):
            if activeExamSubjectCode in savedMarks[k]:
                studentExamMarks = savedMarks[k][activeExamSubjectCode]
                matchedKey = k
                matchedBranch = 'activeExamSubjectCode'
                break
            elif sch.get('subject') and sch.get('subject') in savedMarks[k]:
                studentExamMarks = savedMarks[k][sch.get('subject')]
                matchedKey = k
                matchedBranch = 'sch.subject'
                break
            elif sch.get('subjectCode') and sch.get('subjectCode') in savedMarks[k]:
                studentExamMarks = savedMarks[k][sch.get('subjectCode')]
                matchedKey = k
                matchedBranch = 'sch.subjectCode'
                break
            else:
                vals = list(savedMarks[k].values())
                if len(vals) > 0:
                    studentExamMarks = vals[0]
                    matchedKey = k
                    matchedBranch = 'fallback_firstVal'
                    break
    print(f"Student roll {student.get('roll')}, reg {student.get('regNo')}: matchedKey={matchedKey}, branch={matchedBranch}")
    print("   studentExamMarks =", studentExamMarks)

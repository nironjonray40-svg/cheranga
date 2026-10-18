import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('school.db')
cursor = conn.cursor()
cursor.execute("SELECT key, value FROM local_storage_sync WHERE key IN ('school_exam_schedules', 'school_exam_types', 'school_student_marks', 'school_students')")
db = dict(cursor.fetchall())

schedules = json.loads(db.get('school_exam_schedules', '[]'))
types = json.loads(db.get('school_exam_types', '[]'))
marks = json.loads(db.get('school_student_marks', '{}'))
students = json.loads(db.get('school_students', '[]'))

def is_exam_match(t, s):
    if not t or not s: return False
    return str(t).strip().lower() == str(s).strip().lower()

# Check for "Elegileble test"
selectedExam = "Elegileble test"
matchedExam = next((t for t in types if is_exam_match(t.get('name'), selectedExam)), None)

print(f"Exam: {selectedExam}")
for sc in schedules:
    if is_exam_match(sc.get('term'), selectedExam):
        subName = sc.get('subject')
        exType = sc.get('examType')
        cqFull = None
        mcqFull = None
        pracFull = None
        if exType and matchedExam:
            stMatch = next((t for t in matchedExam.get('examTypes', []) if (t.get('typeName') or '').strip().lower() == exType.strip().lower()), None)
            if stMatch:
                cqFull = stMatch.get('defaultCQ')
                mcqFull = stMatch.get('defaultMCQ')
                pracFull = stMatch.get('defaultPractical')
        
        normSub = (subName or '').lower()
        isEng = 'english' in normSub or 'ইংরেজি' in normSub
        if isEng:
            if cqFull is None: cqFull = 100
            mcqFull = 0
            pracFull = 0
            
        isWrittenOnly = (mcqFull == 0 and pracFull == 0) or isEng
        
        mcqDisp = '-' if (isWrittenOnly or mcqFull == 0) else 'MARKS'
        pracDisp = '-' if (isWrittenOnly or pracFull == 0) else 'MARKS'
        print(f"Subject: {subName:30} | Type: {str(exType):6} | CQ: {cqFull} MCQ: {mcqFull} Prac: {pracFull} | MCQ Disp: {mcqDisp:5} | Prac Disp: {pracDisp:5} | WrittenOnly: {isWrittenOnly}")

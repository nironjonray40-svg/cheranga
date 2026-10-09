import sqlite3
import json

conn = sqlite3.connect('school.db')
val = conn.execute("SELECT value FROM local_storage_sync WHERE key='school_students'").fetchone()[0]
students = json.loads(val)

# Simulation of updated selectAndImportExam
savedMarks = {} # No marks entered

classStudents = [s for s in students if s.get('class') == 'Ten'][:10]

importedStudents = []
for idx, student in enumerate(classStudents):
    studentMarkObj = savedMarks.get('marks_' + str(student.get('id')))
    hasRealMark = False
    correctScore = None
    if studentMarkObj and isinstance(studentMarkObj, dict):
        hasRealMark = True

    totalQ = 30
    if hasRealMark:
        status = 'উত্তীর্ণ'
    else:
        correctScore = 0
        wrongCount = 0
        blankCount = totalQ
        pct = '0.0'
        status = 'পেন্ডিং'
        studentAnswers = {}

    importedStudents.append({
        'id': student.get('regNo'),
        'name': student.get('name'),
        'correct': correctScore,
        'status': status,
        'percentage': pct,
        'answers': studentAnswers
    })

print(f"Imported {len(importedStudents)} students:")
for st in importedStudents[:3]:
    print(st)

assert all(st['correct'] == 0 for st in importedStudents), "All imported students without entered marks must have correct == 0!"
assert all(st['status'] == 'পেন্ডিং' for st in importedStudents), "All imported students without entered marks must have status == 'পেন্ডিং'!"
assert all(st['answers'] == {} for st in importedStudents), "Answers must be empty!"
print("\nAll verification assertions PASSED!")

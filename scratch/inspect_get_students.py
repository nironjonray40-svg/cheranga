import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function getAttendanceAllStudentsList()')
if idx != -1:
    print('=== getAttendanceAllStudentsList ===')
    print(text[idx:idx+1500])

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f2:
    text2 = f2.read()
idx2 = text2.find('function getAllStudentsList()')
if idx2 != -1:
    print('=== getAllStudentsList in Student attendance sheet.html ===')
    print(text2[idx2:idx2+1500])

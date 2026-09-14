import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('function getAttendanceAllStudentsList()')
idx2 = text.find('function populateAttendanceSheetClassFilter()')
print('=== getAttendanceAllStudentsList full ===')
print(text[idx1:idx2])

import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("student-portal.html has autoGenerateIdShiftSequentialIds:", 'function autoGenerateIdShiftSequentialIds' in text)
print("student-portal.html has saveStudentForm:", 'function saveStudentForm' in text)
print("student-portal.html has updateIdRegPreviews:", 'function updateIdRegPreviews' in text)

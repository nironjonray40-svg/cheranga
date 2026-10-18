import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function saveStudentMarks()')
if idx != -1:
    print(text[idx+1000:idx+3500])

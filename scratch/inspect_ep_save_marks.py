import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'marks_[a-zA-Z0-9_\$\{\}\-]+', text):
    print("Match:", m.group(0))

idx = text.find('saveMarks')
if idx == -1: idx = text.find('saveStudentMarks')
if idx == -1: idx = text.find('saveExamMarks')
if idx != -1:
    print(text[idx:idx+2500])

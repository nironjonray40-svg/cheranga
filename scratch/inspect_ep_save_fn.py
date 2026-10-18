import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function saveStudentMarks(')
if idx != -1:
    print(text[idx:idx+2500])
else:
    print("function saveStudentMarks not found, searching for saveStudentMarks...")
    for idx in [m.start() for m in re.finditer(r'saveStudentMarks', text)]:
        print("At:", idx)
        print(text[idx-50:idx+300])

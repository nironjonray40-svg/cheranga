import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("Searching for localStorage in exam-entry and exam-names...")
for m in re.finditer(r'function\s+renderExam(Entry|Names|List|Schedules|Types)[^\{]*\{', text):
    print(m.group(0))

for m in re.finditer(r'localStorage\.(get|set)Item\([\'\"]([^\'\"]+)[\'\"]', text):
    key = m.group(2)
    if 'exam' in key.lower():
        print("Exam key:", key)

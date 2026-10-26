with open('exam-portal.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
print("Matches for 'Exam List' or schedules:")
for m in re.finditer(r'school_exam_schedules', text):
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 150)
    print(text[start:end])
    print("---")
    break

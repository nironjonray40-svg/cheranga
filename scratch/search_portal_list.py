with open('exam-portal.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for idx, l in enumerate(lines, 1):
    if any(k in l for k in ['Exam List', 'exam-list', 'saveSchedule', 'renderExamList', 'addSchedule']):
        print(f"Line {idx}: {l.strip()[:120]}")

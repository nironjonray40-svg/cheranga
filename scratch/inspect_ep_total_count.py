import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'total-exam-count', text):
    start = max(0, m.start() - 200)
    end = min(len(text), m.end() + 800)
    print("Match around total-exam-count:")
    print(text[start:end])
    print("="*40)

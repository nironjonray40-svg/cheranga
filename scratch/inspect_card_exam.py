import re, sys
sys.stdout.reconfigure(encoding='utf-8')

for fname in ['Marksheet.html', 'Marksheet1.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        text = f.read()
    print(f"=== {fname} ===")
    matches = re.findall(r'(\bexam\b|\bselectedExam\b|\bdisplay-exam-name\b)[^\n]{0,80}', text, re.IGNORECASE)
    for m in matches[:15]:
        print(" ", m.strip())

import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

funcs = ['autoGenerateIdShiftSequentialIds', 'applyIdShiftAndSave', 'saveStudentForm']
for fn in funcs:
    idx = text.find(f'function {fn}(')
    if idx != -1:
        print(f"=== {fn} ===")
        print(text[idx:idx+2000])
        print("="*60)

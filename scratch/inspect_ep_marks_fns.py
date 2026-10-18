import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'function\s+([a-zA-Z0-9_]+)\s*\([^\)]*\)\s*\{', text):
    fn = m.group(1)
    if 'mark' in fn.lower() or 'entry' in fn.lower():
        start = m.start()
        fn_code = text[start:start+1200]
        if 'activeExamScheduleId' in fn_code or 'school_student_marks' in fn_code:
            print("=== Function:", fn)
            print(fn_code[:600])
            print("="*40)

import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'function\s+([a-zA-Z0-9_]+)\s*\(', text):
    fn = m.group(1)
    if 'mark' in fn.lower() or 'load' in fn.lower() or 'schedule' in fn.lower() or 'subject' in fn.lower() or 'render' in fn.lower():
        print("Function in Tabulation:", fn)

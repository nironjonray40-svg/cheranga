# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/attendance_engine.js', 'r', encoding='utf-8') as f:
    engine_code = f.read()

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    full_html = f.read()

# Find all function calls in engine_code
calls = set(re.findall(r'\b([a-zA-Z0-9_$]+)\s*\(', engine_code))
print("Total distinct function calls in attendance_engine.js:", len(calls))

# Built-in JS functions / keywords to ignore
builtins = {
    'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof',
    'parseInt', 'parseFloat', 'String', 'Array', 'Object', 'Set', 'Date', 'Math', 'JSON',
    'isNaN', 'setTimeout', 'clearTimeout', 'alert', 'console', 'window', 'document',
    'getElementById', 'querySelectorAll', 'querySelector', 'createElement', 'appendChild',
    'forEach', 'filter', 'map', 'sort', 'reduce', 'includes', 'indexOf', 'find', 'slice',
    'push', 'join', 'split', 'replace', 'trim', 'toLowerCase', 'toUpperCase', 'localeCompare',
    'startsWith', 'endsWith', 'repeat', 'substring', 'padStart', 'padEnd', 'has', 'add',
    'keys', 'values', 'entries', 'stringify', 'parse', 'getTime', 'getDate', 'getMonth',
    'getFullYear', 'min', 'max', 'addEventListener', 'removeEventListener', 'stopPropagation',
    'preventDefault', 'getAttribute', 'setAttribute', 'classList', 'focus', 'print', 'save',
    'from', 'set', 'get', 'html2canvas', 'html2pdf', 'JsPDFConstructor', 'encodeURI', 'decodeURI',
    'Error'
}

missing = []
for c in sorted(calls):
    if c in builtins: continue
    # Check if defined in full_html
    pattern = rf'function\s+{re.escape(c)}\b'
    if not re.search(pattern, full_html):
        missing.append(c)

print("\nPotentially missing functions in seat-plan.html:")
for m in missing:
    print(f"  ❌ {m}")

import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

for f in sorted(glob.glob('*.html') + glob.glob('*.js')):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    matches = re.finditer(r'params\.get\([\'\"]view[\'\"]\)[^\n;]*', content)
    for m in matches:
        print(f'{f}: {m.group(0)}')

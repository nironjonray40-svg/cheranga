import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

for f in sorted(glob.glob('*.html') + glob.glob('*.js')):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    
    matches = re.finditer(r'(?:href|onclick)=[\"\'][^\"\']*exam-portal[^\"\']*[\"\']', content, re.IGNORECASE)
    items = list(matches)
    if items:
        print(f'=== {f} ({len(items)} links) ===')
        for it in items:
            print('  ', it.group(0))

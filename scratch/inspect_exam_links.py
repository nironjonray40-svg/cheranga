import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('*.html') + glob.glob('*.js')
for f in sorted(files):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    matches = re.finditer(r'(<a\s+[^>]*href=[\"\'][^\"\']*exam[^\"]*[\"\'][^>]*>[\s\S]*?</a>|<div\s+[^>]*onclick=[\"\'][^\"\']*exam[^\"]*[\"\'][^>]*>[\s\S]*?</div>)', content, re.IGNORECASE)
    found = list(matches)
    if found:
        print(f'=== {f} ({len(found)} links) ===')
        for m in found:
            txt = ' '.join(m.group(0).split())
            print('  ', txt[:140])

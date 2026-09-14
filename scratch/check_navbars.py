import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

for f in sorted(glob.glob('*.html')):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    m = re.search(r'<li[^>]*data-tab=[\"\']exam-portal[\"\'][^>]*>[\s\S]*?</ul>\s*</li>', content, re.IGNORECASE)
    if m:
        print(f'=== {f} ===')
        print(m.group(0))

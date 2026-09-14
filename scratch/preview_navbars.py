import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

html_files = sorted(glob.glob('*.html'))
for f in html_files:
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    
    # Check for exam-portal dropdown
    m = re.search(r'<li[^>]*data-tab=[\"\']exam-portal[\"\'][^>]*>[\s\S]*?</li>\s*</ul>\s*</li>', c, re.IGNORECASE)
    if m:
        print(f"File: {f}")
        print(m.group(0))
        print("-" * 50)

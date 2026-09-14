import os
import glob
import re

files_with_advance_nav = []
for html_file in glob.glob('*.html'):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        if 'data-tab="advance"' in content or 'href="advance"' in content:
            files_with_advance_nav.append(html_file)

print("Files with advance dropdown:", files_with_advance_nav)

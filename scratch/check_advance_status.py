import glob
import re

for fname in sorted(glob.glob('*.html')):
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'data-tab="advance"' in content:
        has_cms = 'cms-portal' in content
        has_addr = 'address-structure' in content
        print(f"{fname:25} -> cms-portal: {has_cms}, address-structure: {has_addr}")

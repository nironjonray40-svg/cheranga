import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    cms_text = f.read()

# Find all occurrences of openAdmissionModal with their line numbers and surrounding HTML
lines = cms_text.splitlines()
for i, line in enumerate(lines):
    if 'openAdmissionModal' in line or 'অনলাইন ভর্তি' in line or 'ভর্তি আবেদন' in line:
        print(f"Line {i+1}: {line.strip()}")

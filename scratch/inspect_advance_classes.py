import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

with open('advance.html', 'r', encoding='utf-8') as f:
    adv_content = f.read()

for line_no, line in enumerate(adv_content.splitlines(), 1):
    if any(k.lower() in line.lower() for k in ['class & section', 'class_sections', 'classstructure', 'academic_classes', 'school_classes', 'sectionstructure', 'current class', 'class_config', 'school_class_structure']):
        print(f"Line {line_no}: {line.strip()[:140]}")

import json, re

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

ids = [
    'modal-exam-class-badge',
    'modal-exam-section-badge',
    'modal-exam-subject-code',
    'modal-exam-title-text',
    'modal-exam-meta-info',
    'modal-th-cq',
    'modal-th-mcq',
    'modal-th-practical',
    'modal-marks-entry-type-filter',
    'modal-student-search-input',
    'exam-marks-entry-modal',
    'modal-student-marks-rows'
]

for el_id in ids:
    found = f'id="{el_id}"' in text or f"id='{el_id}'" in text
    print(f"ID {el_id}:", "FOUND" if found else "*** MISSING ***")

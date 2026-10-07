with open('exam-portal.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if 'OMR READER MODALS' in line:
        print(f'Modals start: line {idx}')
    if 'ADD ACADEMIC SUBJECT MODAL' in line:
        print(f'Modals end: line {idx}')
    if '<script id="omr-reader-script">' in line:
        print(f'Script start: line {idx}')
    if '</script>' in line and idx > 12050:
        print(f'Script end: line {idx}')

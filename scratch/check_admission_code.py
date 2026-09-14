with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'handleAdmissionSubmit' in line or 'handleAdm' in line or 'submitAdmission' in line or 'onlineAdmissionForm' in line or 'openAdmissionModal' in line:
        print(f"Line {idx+1}: {line.strip()[:100]}")

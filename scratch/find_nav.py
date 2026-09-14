for fname in ['main.js', 'advance.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, line in enumerate(lines):
        if 'navigateToAdvanceView' in line:
            print(f"{fname}:{i+1} -> {line.strip()[:100]}")

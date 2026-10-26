with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f, 1):
        if '<select' in line or 'select' in line and 'id=' in line:
            print(f"Line {idx}: {line.strip()[:120]}")

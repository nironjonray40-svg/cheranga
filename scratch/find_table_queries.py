with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'table tbody' in line or "querySelector('table" in line or 'table thead' in line or 'table tfoot' in line or "querySelector(\"table" in line:
            print(f'{i}: {line.strip()[:120]}')

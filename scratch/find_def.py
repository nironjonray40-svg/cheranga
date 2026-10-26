import glob

for fn in ['Marksheet.html', 'Marksheet1.html', 'Tabulation Sheet.html']:
    with open(fn, 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f, 1):
            if 'function syncCascadingFilters' in line or 'syncCascadingFilters =' in line or 'syncCascadingFilters=' in line:
                print(f"{fn} Line {idx}: {line.strip()[:140]}")

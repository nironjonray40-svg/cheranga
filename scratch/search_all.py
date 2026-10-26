import glob

for fn in glob.glob('*.html'):
    with open(fn, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
        if 'syncCascadingFilters' in text:
            print(f"syncCascadingFilters in {fn}")
        if 'filter-exam' in text:
            print(f"filter-exam in {fn}")

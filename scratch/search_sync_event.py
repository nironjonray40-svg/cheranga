import glob, re

for fname in glob.glob('*.html') + glob.glob('*.js'):
    with open(fname, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()
    if 'dbSynced' in c or 'api/db' in c:
        print(f"Found in {fname}")

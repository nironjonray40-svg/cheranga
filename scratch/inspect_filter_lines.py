import sys
sys.stdout.reconfigure(encoding='utf-8')

def inspect_file(fname):
    print(f"=== {fname} ===")
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for idx, line in enumerate(lines):
        if 'filter-exam' in line or 'filter-class' in line or 'syncCascadingFilters' in line or 'populate' in line:
            print(f"{idx+1}: {line.strip()[:120]}")

inspect_file('Marksheet.html')
print("\n" + "="*40 + "\n")
inspect_file('Marksheet1.html')

import sys, re

sys.stdout.reconfigure(encoding='utf-8')

for fn in ['Student Data Topsheet.html', 'seat-plan.html']:
    with open(fn, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()
    
    print(f"=== Occurrences in {fn} ===")
    for target in ['৭ম শ্রেণি', 'মহিলা', 'পুরুষ']:
        matches = [m.start() for m in re.finditer(target, c)]
        print(f"Target '{target}': {len(matches)} matches")
        for pos in matches:
            start = max(0, pos - 60)
            end = min(len(c), pos + 80)
            print("  ", c[start:end].replace('\n', ' '))


import sys
sys.stdout.reconfigure(encoding='utf-8')

for fname in ['Marksheet.html', 'Marksheet1.html']:
    print(f"=== {fname} ===")
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for idx, l in enumerate(lines):
        if 'function getAllExams' in l or 'function getClassesForExam' in l or 'function getSectionsForClass' in l:
            print(f"Line {idx+1}: {l.strip()}")
            for j in range(idx, min(idx+35, len(lines))):
                print(f"  {j+1}: {lines[j].rstrip()}")
            print("-" * 30)

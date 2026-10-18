import sys
sys.stdout.reconfigure(encoding='utf-8')

def find_blocks(fname):
    print(f"=== {fname} ===")
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for idx, l in enumerate(lines):
        if 'function isExamMatch' in l or 'function getAllExams' in l or 'function getClassesForExam' in l or 'function syncCascadingFilters' in l or 'function syncSchoolHeaderInfo' in l:
            print(f"Line {idx+1}: {l.rstrip()[:80]}")

find_blocks('Marksheet.html')
print("-" * 40)
find_blocks('Marksheet1.html')

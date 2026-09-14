import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

patterns = ['studentId', 'student_id', 'stId', 'sid', 'RollRange']
for fn in sorted(glob.glob('*.html')):
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()
    
    hits = []
    for line_no, line in enumerate(content.splitlines(), 1):
        for p in ['st.studentId', 's.studentId', 'studentId', 'শিক্ষার্থীর আইডি']:
            if p in line:
                hits.append((line_no, p, line.strip()[:100]))
                break
    if hits:
        print(f"\n=== {fn} (Total hits: {len(hits)}) ===")
        for h in hits[:8]:
            print(f"  Line {h[0]}: [{h[1]}] {h[2]}")
        if len(hits) > 8:
            print(f"  ... and {len(hits)-8} more")

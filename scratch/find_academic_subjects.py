import re

with open('exam-portal.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

matches = [m.start() for m in re.finditer(r'academic\s*subject', text, re.I)]
print(f'Total matches: {len(matches)}')
with open('scratch/academic_subject_matches.txt', 'w', encoding='utf-8') as out:
    for idx, pos in enumerate(matches):
        start = max(0, pos - 300)
        end = min(len(text), pos + 300)
        out.write(f'=== MATCH {idx+1} at {pos} ===\n')
        out.write(text[start:end] + '\n\n')

print('Done writing matches to scratch/academic_subject_matches.txt')

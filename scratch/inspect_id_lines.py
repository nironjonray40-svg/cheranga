import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

for fn in ['seat-plan.html', 'Student attendance sheet.html', 'Room Seat Topshet.html', 'Seating arrangement details.html', 'student-portal.html']:
    with open(fn, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f'=== {fn} ===')
    for idx, line in enumerate(lines):
        if 'শিক্ষার্থীর আইডি' in line or 'শিক্ষার্থী আইডি' in line:
            # print surrounding lines
            start = max(0, idx - 5)
            end = min(len(lines), idx + 6)
            print(f'--- Line {idx+1} ---')
            for j in range(start, end):
                print(f'{j+1}: {lines[j].strip()}')

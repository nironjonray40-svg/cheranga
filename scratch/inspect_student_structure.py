# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = [m.start() for m in re.finditer(r'section', text, re.IGNORECASE)]
print(f"Total occurrences of 'section' in seat-plan.html: {len(matches)}")

# Check student data models or student data in localStorage
for term in ['studentId', 'st.sec', 'st.section', 'students', 'student_database', 'school_students']:
    cnt = len(list(re.finditer(re.escape(term), text, re.IGNORECASE)))
    print(f"Occurrences of '{term}': {cnt}")

# Also check how student details or allocation is built
benches_matches = [m.start() for m in re.finditer(r'benches', text, re.IGNORECASE)]
print(f"Occurrences of 'benches': {len(benches_matches)}")

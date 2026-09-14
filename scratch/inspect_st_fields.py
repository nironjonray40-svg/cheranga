# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if any(k in line for k in ['st.section', 'st.sec', 'st.studentId', 'studentId', 'school_students']):
        print(f"Line {i+1}: {line.strip()[:120]}")

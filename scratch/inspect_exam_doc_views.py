# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'switchExamDocument|subview-exam-document', text):
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 200)
    print("--- MATCH ---")
    print(text[start:end])
    print()

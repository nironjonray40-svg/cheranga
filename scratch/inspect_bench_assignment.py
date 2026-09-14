# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

# find bench assignment logic
for match in re.finditer(r'b\.left\s*=|left:\s*\{', text):
    start = max(0, match.start() - 100)
    end = min(len(text), match.end() + 200)
    print("--- MATCH ---")
    print(text[start:end])
    print()

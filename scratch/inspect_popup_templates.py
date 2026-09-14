# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
print(f"Line 14310-14325: \n" + "\n".join(lines[14309:14325]))
print(f"Line 14955-14970: \n" + "\n".join(lines[14954:14970]))

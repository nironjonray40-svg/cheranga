import sqlite3, json, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect getExamTypeConfig and getSubjectDistribution in exam-portal.html
import re
for func_name in ['function getExamTypeConfig', 'function getSubjectDistribution']:
    pos = text.find(func_name)
    if pos != -1:
        print(f"\n--- {func_name} ---")
        print(text[pos:pos+1200])

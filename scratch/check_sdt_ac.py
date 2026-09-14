import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    sdt_content = f.read()

print("Student Data Topsheet has safeJsonParse:", 'function safeJsonParse' in sdt_content)

with open('Admit Card.html', 'r', encoding='utf-8') as f:
    ac_content = f.read()

print("Admit Card has renderAdmitCards:", 'function renderAdmitCards' in ac_content)

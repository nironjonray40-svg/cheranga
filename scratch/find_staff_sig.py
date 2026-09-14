# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('staff.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Look for signature fields in staff form or staff object
matches = re.findall(r'.{0,50}sig.{0,50}', text, re.IGNORECASE)
for m in matches[:20]:
    print(m.strip())

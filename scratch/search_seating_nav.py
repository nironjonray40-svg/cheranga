# -*- coding: utf-8 -*-
import os, sys
sys.stdout.reconfigure(encoding='utf-8')

for root, dirs, files in os.walk('.'):
    if '.git' in root or '.venv' in root or '__pycache__' in root or 'scratch' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'seating-details' in content or 'Seating Details' in content:
                    print(f"Found in {path}")

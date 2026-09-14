# -*- coding: utf-8 -*-
import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

for root, dirs, files in os.walk('.'):
    if '.git' in root or '.venv' in root or '__pycache__' in root:
        continue
    for file in files:
        if file.endswith(('.html', '.js', '.py')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'Room Seat Topshet' in content or 'room-topshet' in content or 'Room%20Seat%20Topshet' in content or 'Room Seat Topsheet' in content:
                        print(f"Found in {path}")
            except Exception as e:
                pass

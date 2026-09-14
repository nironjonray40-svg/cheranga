# -*- coding: utf-8 -*-
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

for fname in ['Home.html', 'index.html', 'notice-board.html', 'Tabulation Sheet.html', 'Marksheet.html']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        c = f.read()
    print(f"\n--- {fname} ---")
    seat_links = re.findall(r'<a[^>]*href=["\'][^"\']*seat[^"\']*["\'][^>]*>.*?</a>', c, re.DOTALL)
    for sl in seat_links[:10]:
        print("  ", sl.strip())

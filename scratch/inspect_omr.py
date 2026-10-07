import os
import sys
import re
sys.stdout.reconfigure(encoding='utf-8')

p1 = r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html'
p2 = r'C:\Users\niron\OneDrive\Desktop\Omr\index.html'
p3 = r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\2O2mr.html'

for name, p in [("omr24_index", p1), ("omr_index", p2), ("2o2mr", p3)]:
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        print(f"=== {name} ({len(content)} chars) ===")
        # Find navigation links / tabs / sections
        navs = re.findall(r'<nav[^>]*>.*?</nav>', content, re.DOTALL)
        print(f"Nav count: {len(navs)}")
        for n in navs:
            print("NAV:", n[:500])
        buttons = re.findall(r'<button[^>]*id="([^"]+)"[^>]*>(.*?)</button>', content, re.DOTALL)
        print("Buttons with id:", [(b[0], re.sub(r'<[^>]+>', '', b[1]).strip()) for b in buttons[:15]])
        sections = re.findall(r'<section[^>]*id="([^"]+)"', content)
        print("Sections:", sections)
        tabs = re.findall(r'data-tab="([^"]+)"', content)
        print("data-tab:", tabs)

# -*- coding: utf-8 -*-
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    att_content = f.read()

print("Student attendance sheet.html size:", len(att_content))

# Extract style block
styles = re.findall(r'<style[^>]*>(.*?)</style>', att_content, re.DOTALL)
print("Number of style blocks:", len(styles))
for i, s in enumerate(styles):
    print(f"Style {i} length:", len(s))

# Extract body HTML before <script>
body_match = re.search(r'<body[^>]*>(.*?)<script', att_content, re.DOTALL)
if body_match:
    print("Body HTML before script length:", len(body_match.group(1)))
    print("Body HTML snippet:\n", body_match.group(1)[:2000])

# Extract script blocks
scripts = re.findall(r'<script(?:\s+[^>]*)?>(.*?)</script>', att_content, re.DOTALL)
print("Number of script blocks:", len(scripts))
for i, sc in enumerate(scripts):
    print(f"Script {i} length:", len(sc))
    # print functions in script
    funcs = re.findall(r'function\s+([a-zA-Z0-9_$]+)', sc)
    print(f"Script {i} functions count: {len(funcs)}, names:", funcs)

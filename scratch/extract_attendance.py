# -*- coding: utf-8 -*-
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    att_html = f.read()

# Let's inspect styles
style_match = re.search(r'<style[^>]*>(.*?)</style>', att_html, re.DOTALL)
if style_match:
    with open('scratch/attendance_styles.css', 'w', encoding='utf-8') as f_out:
        f_out.write(style_match.group(1))
    print("Styles saved to scratch/attendance_styles.css. Length:", len(style_match.group(1)))

# Let's inspect HTML elements in body
body_match = re.search(r'<body[^>]*>(.*?)<script', att_html, re.DOTALL)
if body_match:
    with open('scratch/attendance_body.html', 'w', encoding='utf-8') as f_out:
        f_out.write(body_match.group(1))
    print("Body saved to scratch/attendance_body.html. Length:", len(body_match.group(1)))

# Let's inspect main JS script
scripts = re.findall(r'<script(?:\s+[^>]*)?>(.*?)</script>', att_html, re.DOTALL)
for i, s in enumerate(scripts):
    if len(s) > 100:
        with open(f'scratch/attendance_script_{i}.js', 'w', encoding='utf-8') as f_out:
            f_out.write(s)
        print(f"Script {i} saved. Length:", len(s))

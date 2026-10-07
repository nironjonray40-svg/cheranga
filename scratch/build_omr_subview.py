import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Read omr_body.html, omr_script.js, omr_style.css from scratch
with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_body.html', 'r', encoding='utf-8') as f:
    body_raw = f.read()

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_script.js', 'r', encoding='utf-8') as f:
    script_raw = f.read()

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_style.css', 'r', encoding='utf-8') as f:
    style_raw = f.read()

print("Files loaded successfully:")
print("body_raw length:", len(body_raw))
print("script_raw length:", len(script_raw))
print("style_raw length:", len(style_raw))

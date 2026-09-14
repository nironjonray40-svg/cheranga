import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract all script contents
scripts = re.findall(r'<script(?:\s+[^>]*)?>(.*?)</script>', html, re.DOTALL)
print(f"Total script blocks found: {len(scripts)}")

# Let's check for any unterminated strings or syntax errors
full_js = ""
for idx, s in enumerate(scripts):
    full_js += f"\n// --- SCRIPT BLOCK {idx+1} ---\n" + s

with open('scratch/combined_seat_plan.js', 'w', encoding='utf-8') as f:
    f.write(full_js)

print("Saved scratch/combined_seat_plan.js. Size:", len(full_js))

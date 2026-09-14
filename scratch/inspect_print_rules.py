# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

# Find all @media print blocks
print_blocks = re.findall(r'@media\s+print\s*\{.*?\n        \}', seat_content, re.DOTALL)
print(f"Total @media print blocks in seat-plan.html: {len(print_blocks)}")
for i, pb in enumerate(print_blocks):
    print(f"\n--- Print Block {i} (len: {len(pb)}) ---")
    print(pb[:1000])

# Also check print functions in JS
print_funcs = re.findall(r'function\s+print[a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{.*?\n        \}', seat_content, re.DOTALL)
print(f"\nTotal print functions: {len(print_funcs)}")
for pf in print_funcs:
    print(pf[:300])

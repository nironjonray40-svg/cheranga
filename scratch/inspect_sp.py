import re
import io
import sys

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

subviews = re.findall(r'id=["\'](subview-[^"\']+)["\']', html)
print("Subviews:", subviews)

# Find header navigation or buttons
nav_matches = re.findall(r'onclick=["\']switchView\(([^)]+)\)["\'][^>]*>(.*?)<', html)
print("\nNavigation items:")
for args, text in nav_matches:
    print(f"  switchView({args}) -> {text.strip()}")

# Look at the script functions in student-portal.html
funcs = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', html)
print(f"\nFunctions count: {len(funcs)}")
print("Sample functions:", [fn for fn in funcs if any(w in fn.lower() for w in ['student', 'render', 'save', 'admit', 'admission', 'list', 'filter', 'table', 'load'])][:30])

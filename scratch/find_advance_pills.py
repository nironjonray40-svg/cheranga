import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('advance.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's find all advance-nav-pill buttons
pills = re.findall(r'<button[^>]*class=["\'][^"\']*advance-nav-pill[^"\']*["\'][^>]*data-view=["\']([^"\']+)["\'][^>]*>(.*?)</button>', text, re.DOTALL)
print("Pills in advance.html:")
for p in pills:
    clean = re.sub(r'<[^>]+>', '', p[1]).strip()
    print(f"- data-view: {p[0]} -> {clean}")

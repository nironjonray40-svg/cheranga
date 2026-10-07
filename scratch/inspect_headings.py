import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\niron\OneDrive\Desktop\omr24-main\templates\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Find main headings, cards, containers
cards = re.findall(r'<div[^>]*class="[^"]*card[^"]*"[^>]*>(.*?)</div>', html, re.DOTALL)
print(f"Cards count: {len(cards)}")

# Print all h1, h2, h3, h4
headings = re.findall(r'<(h[1-5])[^>]*>(.*?)</\1>', html, re.DOTALL)
for tag, text in headings:
    clean = re.sub(r'<[^>]+>', '', text).strip()
    print(f"<{tag}> {clean}")

# Check body structure
body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
if body_match:
    body = body_match.group(1)
    # let's look at immediate child elements or high-level containers
    lines = []
    for line in body.split('\n'):
        if re.search(r'<(div|header|nav|main|section|table)[^>]+id=', line):
            lines.append(line.strip())
    print("\nContainers with ID:")
    for l in lines[:40]:
        print(l)

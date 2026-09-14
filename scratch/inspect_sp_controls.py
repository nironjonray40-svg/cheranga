import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for switchSubview or showSubview or subview calls
matches = re.findall(r'function\s+([a-zA-Z0-9_]*subview[a-zA-Z0-9_]*|[a-zA-Z0-9_]*view[a-zA-Z0-9_]*)\s*\(', html, re.I)
print("View functions:", matches)

# Find all buttons in subview-list
pos = html.find('id="subview-list"')
list_html = html[pos:pos+4000]
btns = re.findall(r'<button[^>]*onclick=["\']([^"\']+)["\'][^>]*>(.*?)</button>', list_html, re.DOTALL)
print("\nButtons in subview-list:")
for oc, txt in btns:
    clean = re.sub(r'\s+', ' ', txt).strip()
    print(f"  onclick='{oc}' -> {clean}")


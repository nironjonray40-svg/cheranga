import re

with open('advance.html', 'r', encoding='utf-8') as f:
    content = f.read()

subviews = re.findall(r'id=["\'](subview-[^"\']+)["\']', content)
print("Subviews found:", subviews)

nav_pills = re.findall(r'data-view=["\']([^"\']+)["\']', content)
print("Nav pills data-view:", nav_pills)

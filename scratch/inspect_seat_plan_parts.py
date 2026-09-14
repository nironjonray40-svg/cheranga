# -*- coding: utf-8 -*-
import re

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("File size:", len(content))

# Look for tabs in navigation
tabs = re.findall(r'switchSeatTab\([^)]+\)', content)
print("Tabs found:", set(tabs))

# Look for tab views
subviews = re.findall(r'id=["\'](?:tab-|subview-|view-)[^"\']+["\']', content)
print("Subviews/Tabs:", set(subviews))

# Look for switchExamDocument definition
matches = [m.start() for m in re.finditer(r'function switchExamDocument', content)]
print("switchExamDocument match indices:", matches)
if matches:
    idx = matches[0]
    print(content[idx:idx+500])

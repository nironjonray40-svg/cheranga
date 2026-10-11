import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# find tr data-section
matches = re.findall(r'<tr[^>]*data-section="([^"]+)"[^>]*>', html)
print(f"Total tr with data-section: {len(matches)}")
from collections import Counter
print("Count by section:", Counter(matches))

# Find sample td name
sample_names = re.findall(r'<td class="name-col">([^<]+)</td>', html)
print(f"Total names found: {len(sample_names)}, first 5: {sample_names[:5]}")

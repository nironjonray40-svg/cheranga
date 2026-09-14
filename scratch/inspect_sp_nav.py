import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's find all buttons or nav links with class or onclick in the header/top area
header_area = html[html.find('<body'):html.find('subview-add')]
print("Header area:")
for line in header_area.splitlines()[:100]:
    print(" ", line)

# Let's inspect subview-add and subview-list and subview-promote containers
for sv in ['subview-add', 'subview-list', 'subview-promote']:
    pos = html.find(f'id="{sv}"')
    if pos != -1:
        print(f"\n=================== {sv} HEADER ===================")
        snippet = html[pos:pos+2000]
        for line in snippet.splitlines()[:30]:
            print(" ", line)

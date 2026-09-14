import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Inspect the student-table-card structure and table headers
pos = html.find('class="student-table-card"')
if pos != -1:
    print("Table HTML snippet:")
    print(html[pos:pos+2500])

# Inspect renderStudentList function
pos_render = html.find('function renderStudentList')
if pos_render != -1:
    print("\nrenderStudentList snippet:")
    print(html[pos_render:pos_render+2000])

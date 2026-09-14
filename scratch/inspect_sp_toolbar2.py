import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

pos_list = html.find('class="list-controls"')
if pos_list != -1:
    print(html[pos_list+1200:pos_list+4500])

import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

pos = html.find('function checkURLParameters')
if pos != -1:
    print(html[pos:pos+1000])

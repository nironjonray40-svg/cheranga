import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

pos = html.find('function switchPortalView')
if pos != -1:
    print("switchPortalView full definition:")
    print(html[pos:pos+2500])

pos_init = html.find('DOMContentLoaded')
if pos_init != -1:
    print("\nDOMContentLoaded in student-portal.html:")
    print(html[pos_init:pos_init+1500])

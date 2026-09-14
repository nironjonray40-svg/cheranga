import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find switchPortalView definition
pos = html.find('function switchPortalView')
if pos != -1:
    print("switchPortalView definition:")
    print(html[pos:pos+1200])

# Find the entire list-controls toolbar in subview-list
pos_list = html.find('class="list-controls"')
if pos_list != -1:
    print("\nlist-controls toolbar:")
    print(html[pos_list:pos_list+3500])

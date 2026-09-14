import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's see generateIDCard or saveStudents implementation
for fn_name in ['generateIDCard', 'saveStudents', 'loadStudents', 'generateStudentId', 'updateIdRegPreviews']:
    pos = html.find(f'function {fn_name}')
    if pos != -1:
        print(f"\n--- function {fn_name} ---")
        print(html[pos:pos+1500])

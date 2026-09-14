import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('student-portal.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines, start=1):
    if 'function switchPortalView' in l:
        print(f"switchPortalView at line {i}")
    if 'function checkURLParameters' in l:
        print(f"checkURLParameters at line {i}")
    if 'window.addEventListener(\'dbSynced\'' in l:
        print(f"dbSynced listener at line {i}")

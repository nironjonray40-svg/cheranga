import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if 'প্রধান শিক্ষক, শিক্ষক ও স্টাফ ড্যাশবোর্ড' in line:
        print(f"L{idx}: {line.strip()}")

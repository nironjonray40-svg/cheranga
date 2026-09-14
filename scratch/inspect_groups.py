import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

with open('advance.html', 'r', encoding='utf-8') as f:
    adv = f.read()

print("--- Classes and Groups in advance.html ---")
for line_no, line in enumerate(adv.splitlines(), 1):
    if any(g in line for g in ['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা', 'Science', 'Humanities', 'Business Studies']):
        print(f"Line {line_no}: {line.strip()[:140]}")

import os, re

files = [f for f in os.listdir('.') if f.endswith(('.html', '.js', '.py')) and not f.endswith(('.bak', '.bak2', '.bak3', '.bak_marks', '.bak_subject_update'))]
results = {}

for fname in files:
    try:
        with open(fname, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        matches = [m.start() for m in re.finditer(r'school_subjects', content)]
        if matches:
            results[fname] = len(matches)
    except Exception as e:
        pass

for fname, count in results.items():
    print(f'{fname}: {count} occurrences of school_subjects')

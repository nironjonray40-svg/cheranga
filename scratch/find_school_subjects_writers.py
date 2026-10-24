import os, re

files = [f for f in os.listdir('.') if f.endswith(('.html', '.js', '.py')) and not f.endswith(('.bak', '.bak2', '.bak3', '.bak_marks', '.bak_subject_update'))]
results = []

for fname in files:
    try:
        with open(fname, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        for idx, line in enumerate(lines):
            if 'school_subjects' in line and any(w in line for w in ['setItem', 'fetch', 'UPDATE', 'INSERT', 'set', 'sync', 'default', 'reset', '=']):
                results.append(f"{fname}:{idx+1}: {line.strip()[:140]}")
    except Exception as e:
        pass

with open('scratch/school_subjects_writers.txt', 'w', encoding='utf-8') as out:
    for r in results:
        out.write(r + '\n')

print(f"Found {len(results)} matches.")

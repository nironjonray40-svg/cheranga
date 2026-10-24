with open('cms.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

with open('scratch/cms_subjects_inspection.txt', 'w', encoding='utf-8') as out:
    for i, line in enumerate(lines):
        if any(k in line for k in ['school_subjects', 'loadSubjects', 'defaultSubjects', 'Academic Subject']):
            start = max(0, i - 10)
            end = min(len(lines), i + 15)
            out.write(f'=== Line {i+1} in cms.html ===\n')
            for j in range(start, end):
                out.write(f'{j+1}: {lines[j]}')
            out.write('\n' + '='*40 + '\n\n')

print('CMS inspection written to scratch/cms_subjects_inspection.txt')

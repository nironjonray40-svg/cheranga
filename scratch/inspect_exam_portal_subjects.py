with open('exam-portal.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

print(f'Total lines in exam-portal.html: {len(lines)}')

with open('scratch/exam_portal_subjects_inspection.txt', 'w', encoding='utf-8') as out:
    for i, line in enumerate(lines):
        if any(k in line for k in ['loadSubjects', 'school_subjects', 'persistAcademicSubjectsSync', 'defaultSubjects', 'getNewDefaultSubjects']):
            start = max(0, i - 15)
            end = min(len(lines), i + 20)
            out.write(f'=== Around line {i+1} ===\n')
            for j in range(start, end):
                out.write(f'{j+1}: {lines[j]}')
            out.write('\n' + '='*40 + '\n\n')

print('Inspection written to scratch/exam_portal_subjects_inspection.txt')

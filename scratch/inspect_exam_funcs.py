with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_lines = []
for idx, line in enumerate(lines, 1):
    if any(k in line for k in ['function getAllExams', 'function getClassesForExam', 'function getSectionsForClass', 'function isExamMatch']):
        output_lines.append(f"Starts at line {idx}: {line}")
        for j in range(idx - 1, min(idx + 60, len(lines))):
            output_lines.append(f"{j+1}: {lines[j]}")
        output_lines.append("\n-------------------\n")

with open('scratch/exam_funcs_bak.txt', 'w', encoding='utf-8') as out:
    out.writelines(output_lines)
print(f"Wrote {len(output_lines)} lines to scratch/exam_funcs_bak.txt")

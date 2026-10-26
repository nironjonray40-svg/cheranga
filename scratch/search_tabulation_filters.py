with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

output_lines = []
for idx, line in enumerate(lines, 1):
    if any(k in line for k in ['populateExamDropdown', 'filter-exam', 'filter-class', 'syncExamList', 'syncCascading', 'updateClassDropdown', 'getAvailableClasses']):
        output_lines.append(f"Line {idx}: {line}")

with open('scratch/tabulation_filter_search.txt', 'w', encoding='utf-8') as out:
    out.writelines(output_lines)

print(f"Found {len(output_lines)} lines in Tabulation Sheet.html")

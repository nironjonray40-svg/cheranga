with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_lines = []
for idx, line in enumerate(lines, 1):
    if 'function syncCascadingFilters' in line:
        output_lines.append(f"Starts at line {idx}\n")
        for j in range(idx - 1, min(idx + 300, len(lines))):
            output_lines.append(f"{j+1}: {lines[j]}")
        break

with open('scratch/cascading_bak.txt', 'w', encoding='utf-8') as out:
    out.writelines(output_lines)
print(f"Wrote {len(output_lines)} lines to scratch/cascading_bak.txt")

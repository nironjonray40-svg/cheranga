with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_lines = []
for i in range(2845, min(3185, len(lines))):
    if lines[i].strip().startswith('function ') or lines[i].strip().startswith('let ') or 'syncCascading' in lines[i]:
        output_lines.append(f"{i+1}: {lines[i]}")

with open('scratch/marksheet1_funcs.txt', 'w', encoding='utf-8') as out:
    out.writelines(output_lines)

print(f"Wrote {len(output_lines)} lines to scratch/marksheet1_funcs.txt")

with open('Marksheet1.html.bak', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_lines = []
for idx in range(2745, min(3825, len(lines))):
    l = lines[idx]
    if l.strip().startswith('function ') or l.strip().startswith('let ') or 'syncCascading' in l:
        output_lines.append(f"{idx+1}: {l}")

with open('scratch/marksheet1_bak_funcs.txt', 'w', encoding='utf-8') as out:
    out.writelines(output_lines)

print(f"Wrote {len(output_lines)} lines to scratch/marksheet1_bak_funcs.txt")

with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('scratch/m1_table_view.txt', 'w', encoding='utf-8') as out:
    for i in range(2850, min(2950, len(lines))):
        out.write(f"{i+1}: {lines[i]}")

print("Saved scratch/m1_table_view.txt")

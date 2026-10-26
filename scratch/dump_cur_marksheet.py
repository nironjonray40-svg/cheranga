with open('Marksheet.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in Marksheet.html: {len(lines)}")
with open('scratch/marksheet_2680_end.txt', 'w', encoding='utf-8') as out:
    for i in range(2680, min(3000, len(lines))):
        out.write(f"{i+1}: {lines[i]}")

print("Saved to scratch/marksheet_2680_end.txt")

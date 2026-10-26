with open('Marksheet.html.bak', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('scratch/renderMarksheetTable_bak.txt', 'w', encoding='utf-8') as out:
    for i in range(2410, min(2580, len(lines))):
        out.write(f"{i+1}: {lines[i]}")

print("Saved to scratch/renderMarksheetTable_bak.txt")

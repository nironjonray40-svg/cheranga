with open('Marksheet1.html.bak', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('scratch/marksheet1_card_bak.txt', 'w', encoding='utf-8') as out:
    for i in range(3470, min(3820, len(lines))):
        out.write(f"{i+1}: {lines[i]}")

print("Saved scratch/marksheet1_card_bak.txt")

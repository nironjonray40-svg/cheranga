with open('exam-portal.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

with open('scratch/portal_exam_list.txt', 'w', encoding='utf-8') as out:
    for i in range(3395, min(3550, len(lines))):
        out.write(f"{i+1}: {lines[i]}")

print("Saved scratch/portal_exam_list.txt")

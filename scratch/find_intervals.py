with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.findall(r'setInterval[\s\S]*?\);', c)
with open('scratch/intervals_in_tabulation.txt', 'w', encoding='utf-8') as out:
    for m in matches:
        out.write(m[:300] + "\n---\n")

print(f"Total intervals: {len(matches)}")

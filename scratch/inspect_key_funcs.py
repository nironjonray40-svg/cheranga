with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re

def dump_fn(name):
    m = re.search(r'function\s+' + name + r'[\s\S]*?(?=function\s+[a-zA-Z0-9_]+\s*\(|</script>)', content)
    if m:
        return f"=== {name} ===\n" + m.group(0) + "\n\n"
    return f"=== {name} NOT FOUND ===\n\n"

with open('scratch/full_funcs_dump.txt', 'w', encoding='utf-8') as out:
    for fn in ['getSubjectPracticalStatus', 'applyTableSettings', 'recalculateTableGradesAndRanks', 'getSubjectSlot']:
        out.write(dump_fn(fn))

print("Dumped to scratch/full_funcs_dump.txt")

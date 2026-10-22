import json

with open('scratch/db_export.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

subjects = json.loads(data.get('school_subjects', '{}'))
cls8_subs = subjects.get('Eight', [])
with open('scratch/cls8_subs.txt', 'w', encoding='utf-8') as out:
    for s in cls8_subs:
        out.write(f"{s.get('code')}: {s.get('name')} | {s.get('nameBn')}\n")

print("Wrote cls8 subjects to scratch/cls8_subs.txt")

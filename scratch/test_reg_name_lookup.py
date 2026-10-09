import sqlite3
import json

conn = sqlite3.connect('school.db')
val = conn.execute("SELECT value FROM local_storage_sync WHERE key='school_students'").fetchone()[0]
students = json.loads(val)

print(f"Loaded {len(students)} students from DB.")

# Simulate student mapping
def to_english_digits(s):
    bn = '০১২৩৪৫৬৭৮৯'
    res = ''
    for ch in str(s or ''):
        if ch in bn:
            res += str(bn.index(ch))
        else:
            res += ch
    return res

by_reg = {}
for s in students:
    en_name = str(s.get('name') or s.get('nameEn') or '').strip()
    if en_name:
        if s.get('regNo'):
            by_reg[to_english_digits(s.get('regNo')).strip()] = en_name
        if s.get('studentId'):
            by_reg[to_english_digits(s.get('studentId')).strip()] = en_name

print("Sample lookups:")
sample_regs = ['260091', '260112', '260092', '260093', '260094']
for reg in sample_regs:
    print(f"Reg: {reg} -> Name: {by_reg.get(reg, 'NOT FOUND')}")

assert all(by_reg.get(r) for r in sample_regs), "All sample regs must have English names!"
print("\nAll tests passed successfully!")

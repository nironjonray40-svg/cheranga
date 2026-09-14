import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

for fn in ['formatClassNameByLang', 'getRoomGenderSuffix', 'formatRoomNumberByLang']:
    pos = sp.find(f'function {fn}')
    pos_end = sp.find('function', pos + 10)
    print(f"=== SP: {fn} ===")
    print(sp[pos:pos_end])

with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    sdt = f.read()

for fn in ['formatClassNameByLang', 'getRoomGenderSuffix', 'formatRoomNumberByLang']:
    pos = sdt.find(f'function {fn}')
    pos_end = sdt.find('function', pos + 10)
    print(f"=== SDT: {fn} ===")
    print(sdt[pos:pos_end])


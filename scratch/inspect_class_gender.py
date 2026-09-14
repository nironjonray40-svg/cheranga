import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    sdt = f.read()

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

print("--- SDT: formatClassName & formatClassNameByLang & getRoomGenderSuffix ---")
for fn in ['formatClassName', 'formatClassNameByLang', 'getRoomGenderSuffix', 'formatRoomNumberByLang']:
    m = re.search(r'function\s+' + fn + r'\s*\(.*?\)\s*\{.*?\}', sdt, re.DOTALL)
    if m:
        print(f"\nSDT {fn}:\n", m.group(0))

print("\n--- SP: formatClassName & formatClassNameByLang & getRoomGenderSuffix ---")
for fn in ['formatClassNameByLang', 'getRoomGenderSuffix', 'formatRoomNumberByLang']:
    m = re.search(r'function\s+' + fn + r'\s*\(.*?\)\s*\{.*?\}', sp, re.DOTALL)
    if m:
        print(f"\nSP {fn}:\n", m.group(0))


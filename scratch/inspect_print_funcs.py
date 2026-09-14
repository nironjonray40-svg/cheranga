import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

print("--- Print functions search ---")
for fn in ['printStudentAttendanceSheet', 'printRoomTopshet', 'printSeatingDetails', 'printStudentDataTopsheet']:
    m = re.search(r'function\s+' + fn + r'\s*\(.*?\)\s*\{[\s\S]*?\}', sp)
    if m:
        print(f"\n{fn}:\n", m.group(0))


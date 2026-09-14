import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

funcs = ['updateAttendanceSheetLive', 'updateRoomTopshetLive', 'updateSeatingDetailsLive']
for fn in funcs:
    idx = text.find(f'function {fn}(')
    if idx != -1:
        print(f"=== {fn} ===")
        print(text[idx:idx+1800])
        print("="*60)

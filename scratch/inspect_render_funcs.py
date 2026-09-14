import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_plan = f.read()

# Let's find how student map is built or used in seat-plan.html
for func_name in ['renderAttendanceSheetPages', 'renderRoomTopshetPages', 'renderSeatingDetailsTable', 'renderStudentDataTopsheet', 'renderAdmitCards']:
    idx = seat_plan.find(f'function {func_name}')
    if idx != -1:
        print(f"=== Function {func_name} ===")
        print(seat_plan[idx:idx+1500])
        print("="*60)

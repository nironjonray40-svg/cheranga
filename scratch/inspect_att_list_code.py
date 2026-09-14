import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect getAttendanceAllStudentsList in seat-plan.html
idx1 = text.find('function getAttendanceAllStudentsList()')
idx2 = text.find('function updateAttendanceSheetLive()')
idx3 = text.find('function updateRoomTopshetLive()')
idx4 = text.find('function updateSeatingDetailsLive()')

print(f"getAttendanceAllStudentsList index: {idx1}")
print(text[idx1:idx1+1800])

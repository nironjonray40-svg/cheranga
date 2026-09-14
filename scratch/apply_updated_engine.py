# -*- coding: utf-8 -*-
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_content = f.read()

with open('scratch/attendance_engine_updated.js', 'r', encoding='utf-8') as f:
    new_engine = f.read()

# 1. Replace attendance engine block in seat-plan.html
old_engine_pattern = r'// ==========================================================================\s*// STUDENT ATTENDANCE SHEET ENGINE \(MERGED FROM Student attendance sheet\.html\).*?window\.printStudentAttendanceSheet = printStudentAttendanceSheet;\s*'
match = re.search(old_engine_pattern, seat_content, re.DOTALL)
if match:
    seat_content = seat_content[:match.start()] + new_engine.strip() + '\n' + seat_content[match.end():]
    print("Replaced attendance engine with updated version.")
else:
    print("Could not find old attendance engine via regex, appending new engine before </script>.")
    last_script_pos = seat_content.rfind('</script>')
    seat_content = seat_content[:last_script_pos] + '\n' + new_engine.strip() + '\n' + seat_content[last_script_pos:]

# 2. Update debouncedSyncRender
old_sync_logic = '''                } else if (activeTab === 'room-topshet' || activeTab === 'room-seat-topshet') {
                    if (typeof refreshRoomTopshetData === 'function') refreshRoomTopshetData();
                    if (typeof refreshStudentAttendanceData === 'function') refreshStudentAttendanceData();
                }'''
new_sync_logic = '''                } else if (activeTab === 'room-topshet' || activeTab === 'room-seat-topshet') {
                    if (typeof refreshRoomTopshetData === 'function') refreshRoomTopshetData();
                } else if (activeTab === 'student-attendance' || activeTab === 'attendance-sheet' || activeTab === 'student-attendance-sheet' || activeTab === 'attendance') {
                    if (typeof refreshStudentAttendanceData === 'function') refreshStudentAttendanceData();
                }'''
if old_sync_logic in seat_content:
    seat_content = seat_content.replace(old_sync_logic, new_sync_logic)
    print("Updated debouncedSyncRender logic.")

# 3. In DOMContentLoaded, ensure if targetTab is student-attendance, it initializes
old_dom_switch = "switchSeatTab(targetTab, false);"
# Ensure targetTab is switched cleanly
print("DOMContentLoaded calls switchSeatTab.")

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_content)

print("Saved updated seat-plan.html.")

# -*- coding: utf-8 -*-
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

print("Starting integration of attendance engine and handlers into seat-plan.html...")

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_plan_content = f.read()

with open('scratch/attendance_engine.js', 'r', encoding='utf-8') as f:
    engine_js = f.read()

# 1. Update switchExamDocument to route Student attendance sheet
if "if (fileName === 'Student attendance sheet.html'" not in seat_plan_content:
    old_switch_exam = '''            if (fileName === 'Room Seat Topshet.html' || fileName === 'Room Seat Topshet' || (fileName && fileName.includes('Room Seat Topshet'))) {
                switchSeatTab('room-topshet', true);
                return;
            }'''
    new_switch_exam = '''            if (fileName === 'Room Seat Topshet.html' || fileName === 'Room Seat Topshet' || (fileName && fileName.includes('Room Seat Topshet'))) {
                switchSeatTab('room-topshet', true);
                return;
            }
            if (fileName === 'Student attendance sheet.html' || fileName === 'Student attendance sheet' || (fileName && (fileName.includes('attendance sheet') || fileName.includes('Student attendance')))) {
                switchSeatTab('student-attendance', true);
                return;
            }'''
    if old_switch_exam in seat_plan_content:
        seat_plan_content = seat_plan_content.replace(old_switch_exam, new_switch_exam)
        print("Updated switchExamDocument.")
    else:
        print("Warning: old_switch_exam not found directly, checking regex...")
        seat_plan_content = re.sub(
            r'(if\s*\(\s*fileName\s*===\s*[\'"]Room Seat Topshet\.html[\'"][^}]*return;\s*\})',
            r'''\1\n            if (fileName === 'Student attendance sheet.html' || fileName === 'Student attendance sheet' || (fileName && (fileName.includes('attendance sheet') || fileName.includes('Student attendance')))) {\n                switchSeatTab('student-attendance', true);\n                return;\n            }''',
            seat_plan_content
        )

# 2. Update switchSeatTab for student-attendance
if "tabName === 'student-attendance'" not in seat_plan_content:
    target_tab_logic = '''                } else if (tabName === 'room-topshet' || tabName === 'room-seat-topshet') {
                    if (titleEl) titleEl.innerText = "Room Seat Topsheet (কক্ষের আসন টপশীট)";
                    if (subTitleEl) subTitleEl.innerText = "A4 Preview of Room-wise student seat topsheet separated by class with signatures";
                    if (typeof refreshRoomTopshetData === 'function') {
                        refreshRoomTopshetData();
                    }'''
    
    replacement_tab_logic = '''                } else if (tabName === 'room-topshet' || tabName === 'room-seat-topshet') {
                    if (titleEl) titleEl.innerText = "Room Seat Topsheet (কক্ষের আসন টপশীট)";
                    if (subTitleEl) subTitleEl.innerText = "A4 Preview of Room-wise student seat topsheet separated by class with signatures";
                    if (typeof refreshRoomTopshetData === 'function') {
                        refreshRoomTopshetData();
                    }
                } else if (tabName === 'student-attendance' || tabName === 'attendance-sheet' || tabName === 'student-attendance-sheet' || tabName === 'attendance') {
                    if (titleEl) titleEl.innerText = "Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)";
                    if (subTitleEl) subTitleEl.innerText = "Exam room attendance sheet by class, subjects and date with student signature columns";
                    if (typeof refreshStudentAttendanceData === 'function') {
                        refreshStudentAttendanceData();
                    }'''
    if target_tab_logic in seat_plan_content:
        seat_plan_content = seat_plan_content.replace(target_tab_logic, replacement_tab_logic)
        print("Updated switchSeatTab logic.")
    else:
        print("Warning: target_tab_logic not found directly, checking regex...")
        seat_plan_content = re.sub(
            r'(\}\s*else if\s*\(\s*tabName\s*===\s*[\'"]room-topshet[\'"][^}]*refreshRoomTopshetData\(\);\s*\})',
            r'''\1\n                } else if (tabName === 'student-attendance' || tabName === 'attendance-sheet' || tabName === 'student-attendance-sheet' || tabName === 'attendance') {\n                    if (titleEl) titleEl.innerText = "Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)";\n                    if (subTitleEl) subTitleEl.innerText = "Exam room attendance sheet by class, subjects and date with student signature columns";\n                    if (typeof refreshStudentAttendanceData === 'function') {\n                        refreshStudentAttendanceData();\n                    }''',
            seat_plan_content
        )

# 3. Add refreshStudentAttendanceData calls to real-time sync points
refresh_hooks = [
    ("if (typeof refreshRoomTopshetData === 'function') refreshRoomTopshetData();",
     "if (typeof refreshRoomTopshetData === 'function') refreshRoomTopshetData();\n            if (typeof refreshStudentAttendanceData === 'function') refreshStudentAttendanceData();"),
    ("refreshRoomTopshetData();",
     "refreshRoomTopshetData();\n                        if (typeof refreshStudentAttendanceData === 'function') refreshStudentAttendanceData();")
]

# We need to be careful not to duplicate inside refreshRoomTopshetData definition itself.
# Let's add it specifically where refreshRoomTopshetData is called in event listeners and mutation functions.
seat_plan_content = seat_plan_content.replace(
    "if (typeof refreshRoomTopshetData === 'function') refreshRoomTopshetData();",
    "if (typeof refreshRoomTopshetData === 'function') refreshRoomTopshetData();\n                    if (typeof refreshStudentAttendanceData === 'function') refreshStudentAttendanceData();"
)

# 4. Insert attendance engine JS before </script> at end of file
if "STUDENT ATTENDANCE SHEET ENGINE (MERGED FROM Student attendance sheet.html)" not in seat_plan_content:
    # Find position before the last </script>
    last_script_pos = seat_plan_content.rfind('</script>')
    if last_script_pos != -1:
        seat_plan_content = seat_plan_content[:last_script_pos] + '\n' + engine_js + '\n' + seat_plan_content[last_script_pos:]
        print("Inserted attendance engine JS before </script>.")
    else:
        print("Error: Could not find </script>")

# 5. Save updated seat-plan.html
with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_plan_content)

print("Saved seat-plan.html successfully.")

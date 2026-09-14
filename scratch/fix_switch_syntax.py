# -*- coding: utf-8 -*-
import sys, re

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    sp = f.read()

# Replace the malformed switchSeatTab part
bad_code = """                } else if (tabName === 'student-attendance' || tabName === 'attendance-sheet' || tabName === 'student-attendance-sheet' || tabName === 'attendance') {
                    if (titleEl) titleEl.innerText = "Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)";
                    if (subTitleEl) subTitleEl.innerText = "Exam room attendance sheet by class, subjects and date with student signature columns";
                    if (typeof refreshStudentAttendanceData === 'function') {
                        refreshStudentAttendanceData();
                    }
                }                 } else if (tabName === 'student-data-topsheet' || tabName === 'student_data_topsheet' || tabName === 'student-topsheet' || tabName === 'topsheet') {
                    if (titleEl) titleEl.innerText = "Student Data Topsheet (শিক্ষার্থীর তথ্য টপশীট)";
                    if (subTitleEl) subTitleEl.innerText = "A4 Landscape preview of building and shift-wise student counts across all examination rooms";
                    if (typeof updateStudentDataTopsheetLive === 'function') {
                        updateStudentDataTopsheetLive();
                    }
                } if (tabName === 'admit-card') {"""

good_code = """                } else if (tabName === 'student-attendance' || tabName === 'attendance-sheet' || tabName === 'student-attendance-sheet' || tabName === 'attendance') {
                    if (titleEl) titleEl.innerText = "Student Attendance Sheet (পরীক্ষার্থীদের হাজিরা শীট)";
                    if (subTitleEl) subTitleEl.innerText = "Exam room attendance sheet by class, subjects and date with student signature columns";
                    if (typeof refreshStudentAttendanceData === 'function') {
                        refreshStudentAttendanceData();
                    }
                } else if (tabName === 'student-data-topsheet' || tabName === 'student_data_topsheet' || tabName === 'student-topsheet' || tabName === 'topsheet') {
                    if (titleEl) titleEl.innerText = "Student Data Topsheet (শিক্ষার্থীর তথ্য টপশীট)";
                    if (subTitleEl) subTitleEl.innerText = "A4 Landscape preview of building and shift-wise student counts across all examination rooms";
                    if (typeof updateStudentDataTopsheetLive === 'function') {
                        updateStudentDataTopsheetLive();
                    }
                } else if (tabName === 'admit-card') {"""

if bad_code in sp:
    sp = sp.replace(bad_code, good_code)
    print("Found exact bad_code and replaced it.")
else:
    # Try regex replacement
    print("Regex replacement...")
    sp = re.sub(
        r'(\}\s*else\s*if\s*\(\s*tabName\s*===\s*[\'"]student-attendance[\'"][^}]*\}\s*)\}\s*\}\s*else\s*if\s*\(\s*tabName\s*===\s*[\'"]student-data-topsheet[\'"][^}]*\}\s*\}\s*if\s*\(\s*tabName\s*===\s*[\'"]admit-card[\'"]\s*\)',
        good_code,
        sp
    )

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(sp)

print("Saved seat-plan.html with fixed switchSeatTab syntax.")

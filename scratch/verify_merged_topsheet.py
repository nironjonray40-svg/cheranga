# -*- coding: utf-8 -*-
import sys, re

sys.stdout.reconfigure(encoding='utf-8')

print("Starting validation of seat-plan.html...")

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Check Subview existence
assert 'id="subview-student-data-topsheet"' in content, "Missing subview-student-data-topsheet"
assert 'id="topsheet-render-container"' in content, "Missing topsheet-render-container"
print("✓ Subview container verified.")

# 2. Check Sub-nav Tab button
assert 'id="btn-tab-student-data-topsheet"' in content, "Missing btn-tab-student-data-topsheet"
print("✓ Tab button verified.")

# 3. Check Navbar links
assert 'seat-plan?view=student-data-topsheet' in content, "Missing navbar link in seat-plan.html"
print("✓ Navbar link verified.")

# 4. Check CSS rules
assert '#subview-student-data-topsheet .topsheet-table' in content, "Missing topsheet-table CSS"
assert 'print-student-data-topsheet-mode' in content, "Missing print CSS mode"
print("✓ CSS rules verified.")

# 5. Check JS Engine functions
required_funcs = [
    'updateStudentDataTopsheetLive',
    'populateStudentDataTopsheetDropdowns',
    'updateStudentDataTopsheetFontSize',
    'updateStudentDataTopsheetFontFamily',
    'initStudentDataTopsheetFontFamily',
    'formatNumberByLang',
    'formatClassNameByLang',
    'formatShiftInfoByLang',
    'formatBuildingNameByLang',
    'formatRoomNumberByLang',
    'printStudentDataTopsheet',
    'downloadStudentDataTopsheetPDF',
    'getSampleDataFallback'
]

for fn in required_funcs:
    assert f'function {fn}' in content, f"Missing JS function {fn}"

print("✓ All required JS functions verified.")

# 6. Check switchSeatTab handler
assert "tabName === 'student-data-topsheet'" in content, "Missing switchSeatTab handler"
print("✓ switchSeatTab integration verified.")

# 7. Check Router popstate/DOMContentLoaded
assert "viewParam === 'student-data-topsheet'" in content, "Missing viewParam handler"
print("✓ URL router integration verified.")

# 8. Check Student Data Topsheet.html file existence and integrity
with open('Student Data Topsheet.html', 'r', encoding='utf-8') as sdt_f:
    sdt_content = sdt_f.read()

assert 'topsheet-render-container' in sdt_content, "Student Data Topsheet.html missing render container"
assert 'updateStudentDataTopsheetLive' in sdt_content, "Student Data Topsheet.html missing live update"
print("✓ Student Data Topsheet.html integrity verified.")

print("\n🎉 ALL AUTOMATED VERIFICATIONS PASSED SUCCESSFULLY!")

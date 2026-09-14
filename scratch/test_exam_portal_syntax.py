import re

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check for all key functions
expected_funcs = [
    'populateTeachersDropdown',
    'getFormattedCurrentDate',
    'toggleCreateScheduleForm',
    'setScheduleCreationMode',
    'renderBulkSubjectsTable',
    'toggleAllBulkSubjects',
    'onBulkSubjectRowToggle',
    'updateBulkSelectedCount',
    'applyBulkDateToAllSelected',
    'applyBulkTeacherToAllSelected',
    'onScheduleExamNameChangedInBulk',
    'onScheduleExamTypeChangedInBulk',
    'saveBulkExamSchedules',
    'saveExamSchedule',
    'resetScheduleForm',
    'editExamSchedule',
    'viewExamSchedule'
]

print("=== Checking functions in exam-portal.html ===")
missing = []
for fn in expected_funcs:
    if f'function {fn}' in html:
        print(f"[OK] {fn}")
    else:
        print(f"[MISSING] {fn}")
        missing.append(fn)

# Check elements
expected_elements = [
    'id="create-schedule-card"',
    'id="schedule-mode-switcher"',
    'id="btn-schedule-mode-single"',
    'id="btn-schedule-mode-bulk"',
    'id="single-subject-mode-container"',
    'id="bulk-subjects-mode-container"',
    'id="bulk-base-date"',
    'id="bulk-common-teacher"',
    'id="bulk-subjects-table-tbody"',
    'id="bulk-selected-badge"',
    'id="bulk-submit-btn-text"',
    'id="bulk-select-all-checkbox"'
]

print("\n=== Checking elements in exam-portal.html ===")
for el in expected_elements:
    if el in html:
        print(f"[OK] {el}")
    else:
        print(f"[MISSING] {el}")
        missing.append(el)

if not missing:
    print("\nALL FUNCTIONS AND ELEMENTS VERIFIED SUCCESSFULLY!")
else:
    print(f"\nMissing: {missing}")

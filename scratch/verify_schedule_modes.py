import re

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    code = f.read()

tests = []

def test(name, cond):
    tests.append((name, cond))

test("Create Exam Schedule card exists", 'id="create-schedule-card"' in code)
test("Mode switcher buttons exist", 'id="btn-schedule-mode-single"' in code and 'id="btn-schedule-mode-bulk"' in code)
test("Single subject container exists", 'id="single-subject-mode-container"' in code)
test("Bulk subjects container exists", 'id="bulk-subjects-mode-container"' in code)
test("setScheduleCreationMode function exists", 'function setScheduleCreationMode' in code)
test("renderBulkSubjectsTable function exists", 'function renderBulkSubjectsTable' in code)
test("saveBulkExamSchedules function exists", 'function saveBulkExamSchedules' in code)
test("saveExamSchedule function exists", 'function saveExamSchedule' in code)
test("applyBulkDateToAllSelected function exists", 'function applyBulkDateToAllSelected' in code)
test("applyBulkTeacherToAllSelected function exists", 'function applyBulkTeacherToAllSelected' in code)
test("toggleAllBulkSubjects function exists", 'function toggleAllBulkSubjects' in code)
test("updateBulkSelectedCount function exists", 'function updateBulkSelectedCount' in code)
test("updateScheduleClassDependencies updates bulk table", 'renderBulkSubjectsTable();' in code)

passed = 0
for name, cond in tests:
    if cond:
        print(f"[PASS] {name}")
        passed += 1
    else:
        print(f"[FAIL] {name}")

print(f"\n{passed}/{len(tests)} tests passed.")

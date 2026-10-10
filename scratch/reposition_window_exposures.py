with open('exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the misplaced block before openExamMarksEntryModal
misplaced = """        window.openExamMarksEntryModal = openExamMarksEntryModal;
        window.closeExamMarksEntryModal = closeExamMarksEntryModal;
        window.saveExamMarksModal = saveExamMarksModal;
        window.downloadExamMarksTemplate = downloadExamMarksTemplate;
        window.filterExamMarksModalStudents = filterExamMarksModalStudents;
        window.changeMarksEntryViewType = changeMarksEntryViewType;
        window.onExamMarkInputChange = onExamMarkInputChange;
        window.handleInputKeyNavigation = handleInputKeyNavigation;
        window.editExamSchedule = editExamSchedule;
        window.viewExamSchedule = viewExamSchedule;
        window.deleteExamSchedule = deleteExamSchedule;"""

if misplaced in content:
    content = content.replace(misplaced, '')
    print("SUCCESS: Removed misplaced window exposure block")

# Place properly after downloadExamMarksTemplate
target_hook = "function triggerImportExamMarks() {"
proper_block = """        window.openExamMarksEntryModal = openExamMarksEntryModal;
        window.closeExamMarksEntryModal = closeExamMarksEntryModal;
        window.saveExamMarksModal = saveExamMarksModal;
        window.downloadExamMarksTemplate = downloadExamMarksTemplate;
        window.filterExamMarksModalStudents = filterExamMarksModalStudents;
        window.changeMarksEntryViewType = changeMarksEntryViewType;
        window.onExamMarkInputChange = onExamMarkInputChange;
        window.handleInputKeyNavigation = handleInputKeyNavigation;
        window.editExamSchedule = editExamSchedule;
        window.viewExamSchedule = viewExamSchedule;
        window.deleteExamSchedule = deleteExamSchedule;

        function triggerImportExamMarks() {"""

if target_hook in content:
    content = content.replace(target_hook, proper_block, 1)
    print("SUCCESS: Attached window exposures after function declarations")

with open('exam-portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated exam-portal.html successfully!")

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Replace all occurrences of s.id === activeExamScheduleId with String(s.id) === String(activeExamScheduleId)
content = re.sub(r's\.id\s*===\s*activeExamScheduleId', 'String(s.id) === String(activeExamScheduleId)', content)

# Replace all occurrences of s.id === id with String(s.id) === String(id) in schedule lookup functions
content = re.sub(r'schedules\.find\(s\s*=>\s*s\.id\s*===\s*id\)', 'schedules.find(s => String(s.id) === String(id))', content)

# Replace s.id === scheduleId
content = re.sub(r'schedules\.find\(s\s*=>\s*s\.id\s*===\s*scheduleId\)', 'schedules.find(s => String(s.id) === String(scheduleId))', content)

# Replace schId
content = re.sub(r'schedules\.find\(s\s*=>\s*s\.id\s*===\s*schId\)', 'schedules.find(s => String(s.id) === String(schId))', content)

# Replace findIndex
content = re.sub(r'schedules\.findIndex\(s\s*=>\s*s\.id\s*===\s*activeExamScheduleId\)', 'schedules.findIndex(s => String(s.id) === String(activeExamScheduleId))', content)
content = re.sub(r'schedules\.findIndex\(s\s*=>\s*s\.id\s*===\s*schId\)', 'schedules.findIndex(s => String(s.id) === String(schId))', content)

# Expose functions to window
window_exposures = """
        window.openExamMarksEntryModal = openExamMarksEntryModal;
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
"""

if 'window.openExamMarksEntryModal =' not in content:
    pos = content.find('function openExamMarksEntryModal')
    if pos != -1:
        content = content[:pos] + window_exposures + '\n' + content[pos:]
        print("SUCCESS: Added window exposures for modal functions")

with open('exam-portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Applied all schedule ID safety fixes and window exposures to exam-portal.html!")

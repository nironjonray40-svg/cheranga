import sys
import re

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clean up closeGradingSystemModal if corrupted
pattern_modal = r'function closeGradingSystemModal\(\) \{[\s\S]*?function renderGradingSystemModalContent\(\)'
replace_modal = '''function closeGradingSystemModal() {
            const modal = document.getElementById('grading-system-modal');
            if (modal) modal.style.display = 'none';
        }

        function renderGradingSystemModalContent()'''
content = re.sub(pattern_modal, replace_modal, content)

# 2. Update activeColspan in applyTableSettings
pattern_activeColspan = r'const activeColspan = 68 - \(isCompact \? 20 : 0\) - \(isHideMCQW \? 20 : 0\);'
replace_activeColspan = 'const activeColspan = getActiveColspan();'
content = re.sub(pattern_activeColspan, replace_activeColspan, content)

# 3. Update getActiveColspan
pattern_getColspan = r'function getActiveColspan\(\) \{[\s\S]*?return total;\s*\}'
replace_getColspan = '''function getActiveColspan() {
            let total = 68;
            if (currentLayout === 'compact') total -= 20;
            if (currentMCQWritten === 'hide') total -= 20;
            const pracStatus = (typeof getSubjectPracticalStatus === 'function') ? getSubjectPracticalStatus() : { chem: false, phys: false, bio: false, agri: false };
            ['chem', 'phys', 'bio', 'agri'].forEach(k => {
                if (!pracStatus[k]) total -= 1;
            });
            return total;
        }'''
content = re.sub(pattern_getColspan, replace_getColspan, content)

# 4. In populateStudentMarksFromDatabase, ensure pracStatus is checked when injecting practical marks
# Let's inspect the switch in populateStudentMarksFromDatabase
old_chem_switch = r"case 'chem':\s*if \(mcq !== null \|\| isAbsent\) cells\[28\]\.textContent = formatCell\(mcq\);\s*if \(cq !== null \|\| isAbsent\) cells\[29\]\.textContent = formatCell\(cq\);\s*if \(prac !== null \|\| isAbsent\) cells\[30\]\.textContent = formatCell\(prac\);\s*if \(total !== null \|\| isAbsent\) cells\[31\]\.textContent = formatCell\(total\);\s*break;"
new_chem_switch = """case 'chem':
                                if (mcq !== null || isAbsent) cells[28].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[29].textContent = formatCell(cq);
                                if (pracStatus.chem) {
                                    if (prac !== null || isAbsent) cells[30].textContent = formatCell(prac);
                                } else {
                                    cells[30].textContent = '-';
                                }
                                if (total !== null || isAbsent) cells[31].textContent = formatCell(total);
                                break;"""
content = re.sub(old_chem_switch, new_chem_switch, content)

old_phys_switch = r"case 'phys':\s*if \(mcq !== null \|\| isAbsent\) cells\[34\]\.textContent = formatCell\(mcq\);\s*if \(cq !== null \|\| isAbsent\) cells\[35\]\.textContent = formatCell\(cq\);\s*if \(prac !== null \|\| isAbsent\) cells\[36\]\.textContent = formatCell\(prac\);\s*if \(total !== null \|\| isAbsent\) cells\[37\]\.textContent = formatCell\(total\);\s*break;"
new_phys_switch = """case 'phys':
                                if (mcq !== null || isAbsent) cells[34].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[35].textContent = formatCell(cq);
                                if (pracStatus.phys) {
                                    if (prac !== null || isAbsent) cells[36].textContent = formatCell(prac);
                                } else {
                                    cells[36].textContent = '-';
                                }
                                if (total !== null || isAbsent) cells[37].textContent = formatCell(total);
                                break;"""
content = re.sub(old_phys_switch, new_phys_switch, content)

old_bio_switch = r"case 'bio':\s*if \(mcq !== null \|\| isAbsent\) cells\[40\]\.textContent = formatCell\(mcq\);\s*if \(cq !== null \|\| isAbsent\) cells\[41\]\.textContent = formatCell\(cq\);\s*if \(prac !== null \|\| isAbsent\) cells\[42\]\.textContent = formatCell\(prac\);\s*if \(total !== null \|\| isAbsent\) cells\[43\]\.textContent = formatCell\(total\);\s*break;"
new_bio_switch = """case 'bio':
                                if (mcq !== null || isAbsent) cells[40].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[41].textContent = formatCell(cq);
                                if (pracStatus.bio) {
                                    if (prac !== null || isAbsent) cells[42].textContent = formatCell(prac);
                                } else {
                                    cells[42].textContent = '-';
                                }
                                if (total !== null || isAbsent) cells[43].textContent = formatCell(total);
                                break;"""
content = re.sub(old_bio_switch, new_bio_switch, content)

old_agri_switch = r"case 'agri':\s*if \(mcq !== null \|\| isAbsent\) cells\[56\]\.textContent = formatCell\(mcq\);\s*if \(cq !== null \|\| isAbsent\) cells\[57\]\.textContent = formatCell\(cq\);\s*if \(prac !== null \|\| isAbsent\) cells\[58\]\.textContent = formatCell\(prac\);\s*if \(total !== null \|\| isAbsent\) cells\[59\]\.textContent = formatCell\(total\);\s*break;"
new_agri_switch = """case 'agri':
                                if (mcq !== null || isAbsent) cells[56].textContent = formatCell(mcq);
                                if (cq !== null || isAbsent) cells[57].textContent = formatCell(cq);
                                if (pracStatus.agri) {
                                    if (prac !== null || isAbsent) cells[58].textContent = formatCell(prac);
                                } else {
                                    cells[58].textContent = '-';
                                }
                                if (total !== null || isAbsent) cells[59].textContent = formatCell(total);
                                break;"""
content = re.sub(old_agri_switch, new_agri_switch, content)

# In populateStudentMarksFromDatabase, add pracStatus call
if 'const pracStatus = getSubjectPracticalStatus();' not in content[content.find('function populateStudentMarksFromDatabase()'):]:
    content = content.replace(
        'function populateStudentMarksFromDatabase() {',
        'function populateStudentMarksFromDatabase() {\n            const pracStatus = getSubjectPracticalStatus();'
    )

# At the end of populateStudentMarksFromDatabase, ensure applyTableSettings() is called
if 'applyTableSettings();\n        }' not in content[content.find('function populateStudentMarksFromDatabase()'):content.find('function populateStudentMarksFromDatabase()') + 5000]:
    # find closing of populateStudentMarksFromDatabase
    pos = content.find('// Populate dynamic filters from local storage')
    if pos != -1:
        # Check right before it
        pass

# Ensure applyTableSettings() is called in filterExam
content = content.replace(
    'populateStudentMarksFromDatabase();\n            recalculateTableGradesAndRanks();',
    'populateStudentMarksFromDatabase();\n            applyTableSettings();\n            recalculateTableGradesAndRanks();'
)

with open('Tabulation Sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied clean edits to Tabulation Sheet.html!")

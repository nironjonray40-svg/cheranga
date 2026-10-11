# scratch/apply_remove_defaults.py
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Generate clean template rows (68 cells each)
def make_template_row(sec_letter):
    cells = ['<td>-</td>', '<td class="name-col">-</td>']
    # 60 mark cells
    for _ in range(60):
        cells.append('<td class="data-bg">-</td>')
    # 6 summary cells (Total, Fail, GPA w/o opt, Final GPA, Grade, Rank)
    for _ in range(6):
        cells.append('<td>-</td>')
    inner = '\n'.join(f'    {c}' for c in cells)
    return f'<tr data-section="{sec_letter}" style="display: none;">\n{inner}\n</tr>'

template_rows = []
for sec in ['A', 'B', 'C', 'D']:
    for _ in range(5):
        template_rows.append(make_template_row(sec))

clean_tbody_content = '\n'.join(template_rows)

# Locate tbody
start_tbody_idx = content.find('<tbody>\n\n<tr data-section="A">')
if start_tbody_idx == -1:
    start_tbody_idx = content.find('<tbody>')
    start_tbody_tag_end = content.find('>', start_tbody_idx) + 1
else:
    start_tbody_tag_end = content.find('\n', start_tbody_idx) + 1

end_tbody_idx = content.find('</tbody>', start_tbody_tag_end)

if start_tbody_idx == -1 or end_tbody_idx == -1:
    print("Error: Could not locate tbody in Tabulation Sheet.html!")
    sys.exit(1)

print(f"Replacing tbody from char {start_tbody_tag_end} to {end_tbody_idx}...")
new_content = content[:start_tbody_tag_end] + '\n' + clean_tbody_content + '\n' + content[end_tbody_idx:]

# 2. Clear studentNameMap dictionary
old_student_map_start = new_content.find('const studentNameMap = {')
old_student_map_end = new_content.find('};', old_student_map_start)
if old_student_map_start != -1 and old_student_map_end != -1:
    print("Clearing hardcoded studentNameMap dictionary...")
    new_content = new_content[:old_student_map_start] + 'const studentNameMap = {};' + new_content[old_student_map_end + 2:]

# 3. Update recalculateTableGradesAndRanks() so summary cells show '-' when student has no marks
old_recalc_marker = "const grandTotalRaw = hasAnySubject ? computedGrandTotal : (getCellFloat(62) || 0);"
new_recalc_block = """const grandTotalRaw = hasAnySubject ? computedGrandTotal : 0;

                let displayGpaNoOpt = 0.00;
                let displayFinalGpa = 0.00;
                let displayFinalGrade = failRule.name || 'F';

                if (hasValidMainSubjects) {
                    if (currentGPACalcMethod === 'total') {
                        // Total Mark Based Method (Main base = 1050)
                        const totalMax = 1050;
                        const pct = (grandTotalRaw / totalMax) * 100;
                        if (failsCount > 0) {
                            displayFinalGpa = 0.00;
                            displayFinalGrade = failRule.name || 'F';
                            displayGpaNoOpt = 0.00;
                        } else {
                            const totalGradeInfo = getGradeForPercentage(pct);
                            displayFinalGpa = totalGradeInfo.gp;
                            displayFinalGrade = totalGradeInfo.name;
                            displayGpaNoOpt = totalGradeInfo.gp;
                        }
                    } else {
                        // Standard Board GPA Method
                        if (failsCount > 0) {
                            displayFinalGpa = 0.00;
                            displayFinalGrade = failRule.name || 'F';
                            displayGpaNoOpt = 0.00;
                        } else {
                            displayGpaNoOpt = mainGPSum / mainSubCount;
                            const rawFinalGPA = (mainGPSum + optionalBonusGP) / mainSubCount;
                            displayFinalGpa = Math.min(maxScaleGP, rawFinalGPA);
                            displayFinalGrade = getGradeForGPA(displayFinalGpa);
                        }
                    }
                }

                // If student has no entered marks, display '-' for all summary cells
                if (!hasAnySubject) {
                    cells[62].textContent = '-';
                    cells[63].textContent = '-';
                    cells[64].textContent = '-';
                    cells[65].textContent = '-';
                    cells[66].textContent = '-';
                    cells[67].textContent = '-';
                } else {
                    setCellVal(62, grandTotalRaw);
                    cells[63].textContent = translateDigits(failsCount.toString(), currentLang);
                    cells[64].textContent = translateDigits(displayGpaNoOpt.toFixed(2), currentLang);
                    cells[65].textContent = translateDigits(displayFinalGpa.toFixed(2), currentLang);
                    cells[66].textContent = displayFinalGrade;
                }"""

# Find and replace the block in recalculateTableGradesAndRanks
old_recalc_end_marker = "cells[66].textContent = displayFinalGrade;"
idx_rc_start = new_content.find(old_recalc_marker)
idx_rc_end = new_content.find(old_recalc_end_marker, idx_rc_start)

if idx_rc_start != -1 and idx_rc_end != -1:
    print("Updating recalculateTableGradesAndRanks empty marks handling...")
    new_content = new_content[:idx_rc_start] + new_recalc_block + new_content[idx_rc_end + len(old_recalc_end_marker):]

# 4. Update populateStudentMarksFromDatabase() to always reset cells to '-'
old_psm_marker = """                // If this is a database student row
                if (stId || stCode || stRoll) {
                    // Reset all mark cells (index 2 to 61) to '-' before populating for the active exam
                    if (mappedSchedules.length > 0) {
                        for (let c = 2; c <= 61; c++) {
                            cells[c].textContent = '-';
                            cells[c].removeAttribute('data-orig-val');
                        }
                    }"""

new_psm_marker = """                // If this is a database student row
                if (stId || stCode || stRoll) {
                    // Reset all mark cells (index 2 to 61) to '-' before populating for the active exam
                    for (let c = 2; c <= 61; c++) {
                        cells[c].textContent = '-';
                        cells[c].removeAttribute('data-orig-val');
                        cells[c].style.backgroundColor = '';
                    }"""

if old_psm_marker in new_content:
    print("Updating populateStudentMarksFromDatabase cell reset...")
    new_content = new_content.replace(old_psm_marker, new_psm_marker)

# 5. Save modified file
with open('Tabulation Sheet.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully removed default student info and marks from Tabulation Sheet.html!")

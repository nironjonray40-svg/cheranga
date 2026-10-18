import sys

with open('scratch/apply_updates.py', 'r', encoding='utf-8') as f:
    exec(f.read())

# helper_and_subjects for Marksheet1 without 8-space indentation
helper_and_subjects_m1 = update_marksheet("").replace("\n        ", "\n").lstrip()

print("Updating Marksheet1.html...")
with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    content_m1 = f.read()

# Replace getSubjectsForClass and renderMarksheet1Table
start_marker = "// Dynamic Subject Finder directly from Exam Portal"
end_marker = "// Helper to match exam names flexibly across routines, schedules, and types\nfunction isExamMatch"

idx_start = content_m1.find(start_marker)
idx_end = content_m1.find(end_marker)

if idx_start == -1 or idx_end == -1:
    print(f"Error: Could not find markers in Marksheet1.html: {idx_start}, {idx_end}")
    sys.exit(1)

render_table_m1 = '''function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {
    const tbody = document.getElementById('transcript-tbody-1');
    if (!tbody) return;

    const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);
    let html = '';
    let grandTotal = 0;
    let totalFullMarks = 0;
    let totalGP = 0;
    let subjectCount = 0;
    let hasFailed = false;
    let hasAnyMarks = false;

    let hasCompulsoryHeader = false;
    let hasElectiveHeader = false;
    let hasOptionalHeader = false;

    subjects.forEach((sub, idx) => {
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            html += `<tr class="group-header-row"><td colspan="9">১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            html += `<tr class="group-header-row"><td colspan="9">২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            html += `<tr class="group-header-row"><td colspan="9">৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)</td></tr>`;
            hasOptionalHeader = true;
        }

        if (sub.isCombined) {
            const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;
            const m1 = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const m2 = sub.pairTotal !== null ? sub.pairTotal : ((parseInt(sub.pairMcq) || 0) + (parseInt(sub.pairCq) || 0) + (parseInt(sub.pairPr) || 0));
            const combTotal = m1 + m2;
            const fullTotal = (sub.fullMarks || 100) + (sub.pairFull || 100);
            const res = hasPaperMarks ? calculateGradeAndGP(combTotal, fullTotal) : { grade: '—', gp: 0 };

            if (hasPaperMarks) {
                hasAnyMarks = true;
                grandTotal += combTotal;
                totalFullMarks += fullTotal;
                totalGP += res.gp;
                subjectCount++;
                if (res.gp === 0) hasFailed = true;
            }

            const p1McqDisplay = sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '<span class="blank-field">—</span>';
            const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '<span class="blank-field">—</span>';
            const p1PrDisplay = sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '<span class="blank-field">—</span>';
            const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : '<span class="blank-field">—</span>';

            const p2McqDisplay = sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '<span class="blank-field">—</span>';
            const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
            const p2PrDisplay = sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '<span class="blank-field">—</span>';
            const p2TotDisplay = sub.pairHasMarks ? toBnDigits(m2) : '<span class="blank-field">—</span>';

            const combTotDisplay = hasPaperMarks ? toBnDigits(combTotal) : '<span class="blank-field">—</span>';
            const combGradeDisplay = hasPaperMarks ? res.grade : '—';
            const combGpDisplay = hasPaperMarks ? toBnDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            html += `<tr>
                <td class="sub-name">${sub.name}</td>
                <td>${toBnDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${sub.pairWith}</td>
                <td>${toBnDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;
        } else {
            const tot = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const res = sub.hasMarks ? calculateGradeAndGP(tot, sub.fullMarks) : { grade: '—', gp: 0 };

            if (sub.hasMarks) {
                hasAnyMarks = true;
                grandTotal += tot;
                totalFullMarks += sub.fullMarks;
                totalGP += res.gp;
                subjectCount++;
                if (res.gp === 0) hasFailed = true;
            }

            const isOptional = sub.group === 'optional';
            const mcqDisplay = sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '<span class="blank-field">—</span>';
            const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '<span class="blank-field">—</span>';
            const prDisplay = sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '<span class="blank-field">—</span>';
            const totDisplay = sub.hasMarks ? toBnDigits(tot) : '<span class="blank-field">—</span>';
            const gradeDisplay = sub.hasMarks ? res.grade : '—';
            const gpDisplay = sub.hasMarks ? toBnDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            html += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${sub.name}</td>
                <td>${toBnDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;
        }
    });

    tbody.innerHTML = html;

    const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
    const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))))) : '—';

    const gtEl = document.getElementById('display-grand-total-1');
    if (gtEl) gtEl.innerText = hasAnyMarks ? (toBnDigits(grandTotal) + ' / ' + toBnDigits(totalFullMarks)) : '—';
    const gpaEl = document.getElementById('display-gpa-1');
    if (gpaEl) gpaEl.innerText = finalGpaStr;
    const gradeEl = document.getElementById('display-final-grade-1');
    if (gradeEl) gradeEl.innerText = finalGrade;
    const meritEl = document.getElementById('display-merit-pos-1');
    if (meritEl) meritEl.innerText = (student && student.roll ? toBnDigits(student.roll) : '১');
}
'''

content_m1 = content_m1[:idx_start] + helper_and_subjects_m1 + "\n\n" + render_table_m1 + "\n\n" + content_m1[idx_end:]

# Update generateMarksheet1CardHTML in Marksheet1.html
card_start_marker = "    let tableHtml = '';\n    let grandTotal = 0;\n    let totalFullMarks = 0;\n    let totalGP = 0;\n    let subjectCount = 0;\n    let hasFailed = false;"
card_end_marker = "    const rankStr = toBnDigits(rankNum);\n\n    return `"

c_idx_start = content_m1.find(card_start_marker)
c_idx_end = content_m1.find(card_end_marker)

if c_idx_start == -1 or c_idx_end == -1:
    print(f"Error: Could not find card table markers in Marksheet1.html: {c_idx_start}, {c_idx_end}")
    sys.exit(1)

card_table_new_m1 = '''    let tableHtml = '';
    let grandTotal = 0;
    let totalFullMarks = 0;
    let totalGP = 0;
    let subjectCount = 0;
    let hasFailed = false;
    let hasAnyMarks = false;

    let hasCompulsoryHeader = false;
    let hasElectiveHeader = false;
    let hasOptionalHeader = false;

    subjects.forEach(sub => {
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            tableHtml += `<tr class="group-header-row"><td colspan="9">১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            tableHtml += `<tr class="group-header-row"><td colspan="9">২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            tableHtml += `<tr class="group-header-row"><td colspan="9">৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)</td></tr>`;
            hasOptionalHeader = true;
        }

        if (sub.isCombined) {
            const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;
            const m1 = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const m2 = sub.pairTotal !== null ? sub.pairTotal : ((parseInt(sub.pairMcq) || 0) + (parseInt(sub.pairCq) || 0) + (parseInt(sub.pairPr) || 0));
            const combTotal = m1 + m2;
            const fullTotal = (sub.fullMarks || 100) + (sub.pairFull || 100);
            const res = hasPaperMarks ? calculateGradeAndGP(combTotal, fullTotal) : { grade: '—', gp: 0 };

            if (hasPaperMarks) {
                hasAnyMarks = true;
                grandTotal += combTotal;
                totalFullMarks += fullTotal;
                totalGP += res.gp;
                subjectCount++;
                if (res.gp === 0) hasFailed = true;
            }

            const p1McqDisplay = sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '<span class="blank-field">—</span>';
            const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '<span class="blank-field">—</span>';
            const p1PrDisplay = sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '<span class="blank-field">—</span>';
            const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : '<span class="blank-field">—</span>';

            const p2McqDisplay = sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '<span class="blank-field">—</span>';
            const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
            const p2PrDisplay = sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '<span class="blank-field">—</span>';
            const p2TotDisplay = sub.pairHasMarks ? toBnDigits(m2) : '<span class="blank-field">—</span>';

            const combTotDisplay = hasPaperMarks ? toBnDigits(combTotal) : '<span class="blank-field">—</span>';
            const combGradeDisplay = hasPaperMarks ? res.grade : '—';
            const combGpDisplay = hasPaperMarks ? toBnDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            tableHtml += `<tr>
                <td class="sub-name">${sub.name}</td>
                <td>${toBnDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${sub.pairWith}</td>
                <td>${toBnDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;
        } else {
            const tot = sub.total !== null ? sub.total : ((parseInt(sub.mcq) || 0) + (parseInt(sub.cq) || 0) + (parseInt(sub.pr) || 0));
            const res = sub.hasMarks ? calculateGradeAndGP(tot, sub.fullMarks) : { grade: '—', gp: 0 };

            if (sub.hasMarks) {
                hasAnyMarks = true;
                grandTotal += tot;
                totalFullMarks += sub.fullMarks;
                totalGP += res.gp;
                subjectCount++;
                if (res.gp === 0) hasFailed = true;
            }

            const isOptional = sub.group === 'optional';
            const mcqDisplay = sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '<span class="blank-field">—</span>';
            const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '<span class="blank-field">—</span>';
            const prDisplay = sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '<span class="blank-field">—</span>';
            const totDisplay = sub.hasMarks ? toBnDigits(tot) : '<span class="blank-field">—</span>';
            const gradeDisplay = sub.hasMarks ? res.grade : '—';
            const gpDisplay = sub.hasMarks ? toBnDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            tableHtml += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${sub.name}</td>
                <td>${toBnDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;
        }
    });

    const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
    const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))))) : '—';
    const rankStr = toBnDigits(rankNum);'''

content_m1 = content_m1[:c_idx_start] + card_table_new_m1 + "\n\n    return `" + content_m1[c_idx_end + len(card_end_marker):]

# Update KPI in generateMarksheet1CardHTML
content_m1 = content_m1.replace(
'''                <div class="kpi-card">
                    <div class="kpi-label">সর্বমোট প্রাপ্ত নম্বর</div>
                    <div class="kpi-value">${toBnDigits(grandTotal)} / ${toBnDigits(totalFullMarks)}</div>
                </div>''',
'''                <div class="kpi-card">
                    <div class="kpi-label">সর্বমোট প্রাপ্ত নম্বর</div>
                    <div class="kpi-value">${hasAnyMarks ? (toBnDigits(grandTotal) + ' / ' + toBnDigits(totalFullMarks)) : '—'}</div>
                </div>'''
)

# Update syncLiveExamData in Marksheet1.html
sync_old_1 = "fetch('/api/db?keys=school_exam_schedules,school_exam_types,school_exam_routines,school_omr_exams,school_classes,school_students,school_settings,school_logo')"
sync_new_1 = "fetch('/api/db?keys=school_exam_schedules,school_student_marks,school_students,school_subjects,school_classes,school_exam_types,school_exam_routines,school_omr_exams,school_settings,school_logo')"
content_m1 = content_m1.replace(sync_old_1, sync_new_1)

loop_old_1 = "['school_exam_schedules', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_classes', 'school_students'].forEach(k => {"
loop_new_1 = "['school_exam_schedules', 'school_student_marks', 'school_students', 'school_subjects', 'school_classes', 'school_exam_types', 'school_exam_routines', 'school_omr_exams'].forEach(k => {"
content_m1 = content_m1.replace(loop_old_1, loop_new_1)

storage_old_1 = "if (!e.key || e.key.startsWith('school_exam_') || e.key === 'school_classes' || e.key === 'school_sections' || e.key === 'school_groups' || e.key === 'school_students') {"
storage_new_1 = "if (!e.key || e.key.startsWith('school_exam_') || e.key === 'school_student_marks' || e.key === 'school_classes' || e.key === 'school_sections' || e.key === 'school_groups' || e.key === 'school_students' || e.key === 'school_subjects') {"
content_m1 = content_m1.replace(storage_old_1, storage_new_1)

with open('Marksheet1.html', 'w', encoding='utf-8') as f:
    f.write(content_m1)
print("[OK] Marksheet1.html updated successfully!")

import sys
import subprocess

with open('scratch/apply_updates.py', 'r', encoding='utf-8') as f:
    exec(f.read())

helper_and_subjects = update_marksheet("")

# --- 1. UPDATE Marksheet.html ---
print("Updating Marksheet.html...")
with open('Marksheet.html', 'r', encoding='utf-8') as f:
    content_m = f.read()

# Replace getSubjectsForClass and renderMarksheetTable
# Locate start of getSubjectsForClass
start_marker_m = "        // Dynamic Subject Finder directly from Exam Portal"
end_marker_m = "        // Helper to match exam names flexibly across routines, schedules, and types\n        function isExamMatch"

idx_start = content_m.find(start_marker_m)
idx_end = content_m.find(end_marker_m)

if idx_start == -1 or idx_end == -1:
    print(f"Error: Could not find markers in Marksheet.html: idx_start={idx_start}, idx_end={idx_end}")
    sys.exit(1)

render_table_m = '''        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {
            const tbody = document.getElementById('marksheet-tbody');
            if (!tbody) return;

            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);
            let html = '';
            let grandTotal = 0;
            let totalFullMarks = 0;
            let totalGP = 0;
            let subjectCount = 0;
            let hasFailed = false;
            let hasAnyMarks = false;

            subjects.forEach(sub => {
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

                    const p1McqDisplay = sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—';
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
                    const p1PrDisplay = sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—';
                    const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : '—';

                    const p2McqDisplay = sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '—';
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '—';
                    const p2TotDisplay = sub.pairHasMarks ? toBnDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? toBnDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? toBnDigits(res.gp.toFixed(2)) : '—';

                    html += `<tr>
                        <td class="subject-col">${sub.name}</td>
                        <td>${p1McqDisplay}</td>
                        <td>${p1CqDisplay}</td>
                        <td>${p1PrDisplay}</td>
                        <td>${p1TotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combTotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold;">${combGradeDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combGpDisplay}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${sub.pairWith}</td>
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

                    const isPracCol = sub.pr !== '';
                    const mcqDisplay = sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—';
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
                    const prDisplay = sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—';
                    const totDisplay = sub.hasMarks ? toBnDigits(tot) : '—';
                    const gradeDisplay = sub.hasMarks ? res.grade : '—';
                    const gpDisplay = sub.hasMarks ? toBnDigits(res.gp.toFixed(2)) : '—';

                    html += `<tr>
                        <td class="subject-col">${sub.name}</td>
                        <td>${mcqDisplay}</td>
                        <td>${cqDisplay}</td>
                        <td class="${isPracCol ? 'bg-gray' : ''}">${prDisplay}</td>
                        <td>${totDisplay}</td>
                        <td style="font-weight: bold;">${totDisplay}</td>
                        <td style="font-weight: bold;">${gradeDisplay}</td>
                        <td style="font-weight: bold;">${gpDisplay}</td>
                    </tr>`;
                }
            });

            tbody.innerHTML = html;

            const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
            const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))))) : '—';

            const gtEl = document.getElementById('display-grand-total');
            if (gtEl) gtEl.innerText = hasAnyMarks ? toBnDigits(grandTotal) : '—';
            const gpaEl = document.getElementById('display-gpa');
            if (gpaEl) gpaEl.innerText = finalGpaStr;
            const gradeEl = document.getElementById('display-final-grade');
            if (gradeEl) gradeEl.innerText = finalGrade;
            const rankEl = document.getElementById('display-rank-val');
            if (rankEl) rankEl.innerText = (student && student.roll ? toBnDigits(student.roll) : '১');
        }

'''

content_m = content_m[:idx_start] + helper_and_subjects + "\n\n" + render_table_m + content_m[idx_end:]

# Update generateMarksheetCardHTML in Marksheet.html
card_table_old_start = "            let tableHtml = '';\n            let grandTotal = 0;\n            let totalFullMarks = 0;\n            let totalGP = 0;\n            let subjectCount = 0;\n            let hasFailed = false;"
card_table_old_end = "            const rankStr = toBnDigits(rankNum);\n\n            return `"

card_idx_start = content_m.find(card_table_old_start)
card_idx_end = content_m.find(card_table_old_end)

if card_idx_start == -1 or card_idx_end == -1:
    print(f"Error: Could not find card table markers in Marksheet.html: {card_idx_start}, {card_idx_end}")
    sys.exit(1)

card_table_new = '''            let tableHtml = '';
            let grandTotal = 0;
            let totalFullMarks = 0;
            let totalGP = 0;
            let subjectCount = 0;
            let hasFailed = false;
            let hasAnyMarks = false;

            subjects.forEach(sub => {
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

                    const p1McqDisplay = sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—';
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
                    const p1PrDisplay = sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—';
                    const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : '—';

                    const p2McqDisplay = sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '—';
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '—';
                    const p2TotDisplay = sub.pairHasMarks ? toBnDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? toBnDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? toBnDigits(res.gp.toFixed(2)) : '—';

                    tableHtml += `<tr>
                        <td class="subject-col">${sub.name}</td>
                        <td>${p1McqDisplay}</td>
                        <td>${p1CqDisplay}</td>
                        <td>${p1PrDisplay}</td>
                        <td>${p1TotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combTotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold;">${combGradeDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combGpDisplay}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${sub.pairWith}</td>
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

                    const isPracCol = sub.pr !== '';
                    const mcqDisplay = sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—';
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
                    const prDisplay = sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—';
                    const totDisplay = sub.hasMarks ? toBnDigits(tot) : '—';
                    const gradeDisplay = sub.hasMarks ? res.grade : '—';
                    const gpDisplay = sub.hasMarks ? toBnDigits(res.gp.toFixed(2)) : '—';

                    tableHtml += `<tr>
                        <td class="subject-col">${sub.name}</td>
                        <td>${mcqDisplay}</td>
                        <td>${cqDisplay}</td>
                        <td class="${isPracCol ? 'bg-gray' : ''}">${prDisplay}</td>
                        <td>${totDisplay}</td>
                        <td style="font-weight: bold;">${totDisplay}</td>
                        <td style="font-weight: bold;">${gradeDisplay}</td>
                        <td style="font-weight: bold;">${gpDisplay}</td>
                    </tr>`;
                }
            });

            const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
            const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))))) : '—';
            const rankStr = toBnDigits(rankNum);'''

content_m = content_m[:card_idx_start] + card_table_new + "\n\n            return `" + content_m[card_idx_end + len(card_table_old_end):]

# Update summary table in generateMarksheetCardHTML
content_m = content_m.replace(
'''                                <td style="width: 50%;">সর্বমোট</td>
                                <td style="width: 50%;">${toBnDigits(grandTotal)}</td>''',
'''                                <td style="width: 50%;">সর্বমোট</td>
                                <td style="width: 50%;">${hasAnyMarks ? toBnDigits(grandTotal) : '—'}</td>'''
)

# Update syncLiveExamData in Marksheet.html
sync_old = "fetch('/api/db?keys=school_exam_schedules,school_exam_types,school_exam_routines,school_omr_exams,school_classes,school_students,school_settings,school_logo')"
sync_new = "fetch('/api/db?keys=school_exam_schedules,school_student_marks,school_students,school_subjects,school_classes,school_exam_types,school_exam_routines,school_omr_exams,school_settings,school_logo')"
content_m = content_m.replace(sync_old, sync_new)

loop_old = "['school_exam_schedules', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_classes', 'school_students'].forEach(k => {"
loop_new = "['school_exam_schedules', 'school_student_marks', 'school_students', 'school_subjects', 'school_classes', 'school_exam_types', 'school_exam_routines', 'school_omr_exams'].forEach(k => {"
content_m = content_m.replace(loop_old, loop_new)

storage_old = "if (!e.key || e.key.startsWith('school_exam_') || e.key === 'school_classes' || e.key === 'school_sections' || e.key === 'school_groups' || e.key === 'school_students') {"
storage_new = "if (!e.key || e.key.startsWith('school_exam_') || e.key === 'school_student_marks' || e.key === 'school_classes' || e.key === 'school_sections' || e.key === 'school_groups' || e.key === 'school_students' || e.key === 'school_subjects') {"
content_m = content_m.replace(storage_old, storage_new)

with open('Marksheet.html', 'w', encoding='utf-8') as f:
    f.write(content_m)
print("[OK] Marksheet.html updated successfully!")

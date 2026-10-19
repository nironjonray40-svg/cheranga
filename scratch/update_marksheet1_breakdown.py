import sys
import re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update updateLanguageUI1 to localize marks breakdown dropdown
old_lang_ui = """    const lTemp = document.getElementById('label-template');
    if (lTemp) lTemp.innerText = isEn ? 'Filter:' : 'Filter:';"""

new_lang_ui = """    const lTemp = document.getElementById('label-template');
    if (lTemp) lTemp.innerText = isEn ? 'Filter:' : 'Filter:';
    const lMarks = document.getElementById('label-marks-breakdown');
    if (lMarks) lMarks.innerText = isEn ? 'Marks:' : 'মার্কস:';
    const selMarks = document.getElementById('filter-marks-breakdown');
    if (selMarks && selMarks.options.length >= 2) {
        selMarks.options[0].text = isEn ? 'Show' : 'প্রদর্শন (Show)';
        selMarks.options[1].text = isEn ? 'Hide' : 'লুকান (Hide)';
    }"""

if old_lang_ui in content:
    content = content.replace(old_lang_ui, new_lang_ui, 1)
    print("1. Successfully updated updateLanguageUI1")
else:
    print("1. WARNING: old_lang_ui not found")

# 2. Add helpers right before updateTableHeaderMarks
old_helpers_target = """// Dynamically update the table header column titles with clean labels
function updateTableHeaderMarks(exam, selectedClass) {"""

helpers_code = """// Helper: Get subject-specific full marks distribution (CQ, MCQ, Prac, Total)
function getSubjectFullMarksDistribution(subItem, selectedExam, selectedClass, isPaper2 = false) {
    let cq = isPaper2 ? subItem.pairCqFull : subItem.cqFull;
    let mcq = isPaper2 ? subItem.pairMcqFull : subItem.mcqFull;
    let prac = isPaper2 ? (subItem.pairPracFull || 0) : (subItem.pracFull || 0);
    let tot = isPaper2 ? subItem.pairFull : subItem.fullMarks;

    const sName = (isPaper2 ? subItem.pairWith : subItem.name) || '';
    const norm = sName.toLowerCase();
    const isEng = norm.includes('english') || norm.includes('ইংরেজি');

    if (cq === null || cq === undefined || mcq === null || mcq === undefined) {
        const curDist = getExamDistribution(selectedExam, selectedClass);
        if (isEng) {
            if (cq === null || cq === undefined) cq = tot || 50;
            if (mcq === null || mcq === undefined) mcq = 0;
            if (prac === null || prac === undefined) prac = 0;
        } else {
            if (cq === null || cq === undefined) cq = curDist.cq;
            if (mcq === null || mcq === undefined) mcq = curDist.mcq;
            if (prac === null || prac === undefined) prac = curDist.prac;
        }
    }
    if (!tot) {
        tot = (Number(cq) || 0) + (Number(mcq) || 0) + (Number(prac) || 0);
    }
    return {
        cq: Number(cq) || 0,
        mcq: Number(mcq) || 0,
        prac: Number(prac) || 0,
        total: Number(tot) || 0,
        isEng
    };
}

// Helper: Format subject name with CQ, MCQ, and Total marks at the end
function formatSubjectWithMarks(displayName, dist, isEn) {
    if (!dist) return displayName;

    const parts = [];
    parts.push(`CQ: ${formatDigits(dist.cq)}`);
    parts.push(`MCQ: ${formatDigits(dist.mcq)}`);
    if (dist.prac > 0) {
        parts.push(isEn ? `Prac: ${formatDigits(dist.prac)}` : `ব্যবহারিক: ${formatDigits(dist.prac)}`);
    }
    parts.push(isEn ? `Total: ${formatDigits(dist.total)}` : `মোট: ${formatDigits(dist.total)}`);

    const marksBadge = `<span class="subject-marks-text">(${parts.join(', ')})</span>`;
    return `${displayName} ${marksBadge}`;
}

// Toggle visibility of subject marks breakdown (CQ, MCQ, Total)
function toggleSubjectMarksBreakdown(val) {
    const isHide = (val === 'hide');
    try {
        localStorage.setItem('marksheet_show_marks_breakdown', isHide ? 'hide' : 'show');
    } catch(e) {}

    const sel = document.getElementById('filter-marks-breakdown');
    if (sel && sel.value !== val) sel.value = val;

    if (isHide) {
        document.body.classList.add('hide-subject-marks');
    } else {
        document.body.classList.remove('hide-subject-marks');
    }
}

function initSubjectMarksBreakdownPreference() {
    try {
        const pref = localStorage.getItem('marksheet_show_marks_breakdown');
        const sel = document.getElementById('filter-marks-breakdown');
        if (pref === 'hide') {
            document.body.classList.add('hide-subject-marks');
            if (sel) sel.value = 'hide';
        } else {
            document.body.classList.remove('hide-subject-marks');
            if (sel) sel.value = 'show';
        }
    } catch(e) {}
}

// Dynamically update the table header column titles with clean labels
function updateTableHeaderMarks(exam, selectedClass) {"""

if old_helpers_target in content:
    content = content.replace(old_helpers_target, helpers_code, 1)
    print("2. Successfully inserted helper functions before updateTableHeaderMarks")
else:
    print("2. WARNING: old_helpers_target not found")

# 3. Update renderMarksheet1Table paired rows
old_table_paired = """            html += `<tr>
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${getDisplaySubjectName(sub.pairWith)}</td>
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;"""

new_table_paired = """            const p1Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
            const p2Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, true);
            const p1NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), p1Dist, isEn);
            const p2NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.pairWith), p2Dist, isEn);

            html += `<tr>
                <td class="sub-name">${p1NameHtml}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${p2NameHtml}</td>
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;"""

if old_table_paired in content:
    content = content.replace(old_table_paired, new_table_paired, 1)
    print("3. Successfully updated renderMarksheet1Table paired rows")
else:
    print("3. WARNING: old_table_paired not found")

# 4. Update renderMarksheet1Table single rows
old_table_single = """            html += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;"""

new_table_single = """            const dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
            const subNameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), dist, isEn);

            html += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${subNameHtml}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;"""

if old_table_single in content:
    content = content.replace(old_table_single, new_table_single, 1)
    print("4. Successfully updated renderMarksheet1Table single rows")
else:
    print("4. WARNING: old_table_single not found")

# 5. Update generateMarksheet1CardHTML paired rows
old_card_paired = """            tableHtml += `<tr>
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${getDisplaySubjectName(sub.pairWith)}</td>
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;"""

new_card_paired = """            const p1Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
            const p2Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, true);
            const p1NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), p1Dist, isEn);
            const p2NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.pairWith), p2Dist, isEn);

            tableHtml += `<tr>
                <td class="sub-name">${p1NameHtml}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${p2NameHtml}</td>
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;"""

if old_card_paired in content:
    content = content.replace(old_card_paired, new_card_paired, 1)
    print("5. Successfully updated generateMarksheet1CardHTML paired rows")
else:
    print("5. WARNING: old_card_paired not found")

# 6. Update generateMarksheet1CardHTML single rows
old_card_single = """            tableHtml += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;"""

new_card_single = """            const dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
            const subNameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), dist, isEn);

            tableHtml += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${subNameHtml}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;"""

if old_card_single in content:
    content = content.replace(old_card_single, new_card_single, 1)
    print("6. Successfully updated generateMarksheet1CardHTML single rows")
else:
    print("6. WARNING: old_card_single not found")

# 7. Update DOMContentLoaded to initialize subject marks preference
old_dom = """    syncSchoolHeaderInfo();
    updateLanguageUI1();
    syncCascadingFilters('all');"""

new_dom = """    syncSchoolHeaderInfo();
    initSubjectMarksBreakdownPreference();
    updateLanguageUI1();
    syncCascadingFilters('all');"""

if old_dom in content:
    content = content.replace(old_dom, new_dom, 1)
    print("7. Successfully updated DOMContentLoaded")
else:
    print("7. WARNING: old_dom not found")

with open('Marksheet1.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished updating Marksheet1.html")

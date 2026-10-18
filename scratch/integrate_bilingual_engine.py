import re

def update_marksheet():
    with open('Marksheet.html', 'r', encoding='utf-8') as f:
        content = f.read()

    with open('scratch/bilingual_snippets.js', 'r', encoding='utf-8') as f:
        snippets = f.read()

    # 1. Inject bilingual snippets after toEnDigits
    old_to_en = '''        function toEnDigits(n) {
            if (n === null || n === undefined) return '';
            const en = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
            return String(n).replace(/[০-৯]/g, d => en[d]);
        }'''

    new_to_en = old_to_en + "\n\n" + snippets + """
        function updateLanguageUI() {
            const isEn = (currentLanguage === 'en');
            
            // 1. Toolbar Labels
            const lExam = document.getElementById('label-exam');
            if (lExam) lExam.innerText = isEn ? 'Exam:' : 'পরীক্ষা:';
            const lClass = document.getElementById('label-class');
            if (lClass) lClass.innerText = isEn ? 'Class:' : 'শ্রেণি:';
            const lSec = document.getElementById('label-section');
            if (lSec) lSec.innerText = isEn ? 'Section:' : 'শাখা:';
            const lSearch = document.getElementById('label-search');
            if (lSearch) lSearch.innerText = isEn ? 'Search:' : 'খুঁজুন:';
            const sInput = document.getElementById('filter-student-search');
            if (sInput) sInput.placeholder = isEn ? 'Roll / Name / ID...' : 'রোল / নাম / আইডি লিখুন...';
            const lLang = document.getElementById('label-language');
            if (lLang) lLang.innerText = isEn ? 'Language:' : 'ভাষা:';
            const sLang = document.getElementById('filter-language');
            if (sLang) sLang.value = currentLanguage;
            const lTemp = document.getElementById('label-template');
            if (lTemp) lTemp.innerText = isEn ? 'Filter:' : 'Filter:';
            const btnAllText = document.getElementById('create-all-btn-text');
            if (btnAllText) {
                if (isCreateAllMode) {
                    btnAllText.innerText = isEn ? 'All Students' : 'সকল শিক্ষার্থী (All)';
                } else {
                    btnAllText.innerText = isEn ? 'Single Student' : 'একক শিক্ষার্থী (Single)';
                }
            }
            const btnPrint = document.getElementById('btn-print-text');
            if (btnPrint) btnPrint.innerText = isEn ? 'Print' : 'প্রিন্ট (Print)';

            // 2. Student Info Labels
            const lName = document.getElementById('label-student-name');
            if (lName) lName.innerText = isEn ? 'Student Name' : 'শিক্ষার্থীর নাম';
            const lRoll = document.getElementById('label-roll-no');
            if (lRoll) lRoll.innerText = isEn ? 'Roll No' : 'রোল নং';
            const lCls = document.getElementById('label-class-name');
            if (lCls) lCls.innerText = isEn ? 'Class' : 'শ্রেণি';
            const lRel = document.getElementById('label-student-religion');
            if (lRel) lRel.innerText = isEn ? 'Religion' : 'ধর্ম (Religion)';
            const lOpt = document.getElementById('label-optional-subject');
            if (lOpt) lOpt.innerText = isEn ? 'Optional (4th)' : 'ঐচ্ছিক বিষয় (৪র্থ)';
            const lId = document.getElementById('label-student-id');
            if (lId) lId.innerText = isEn ? 'Student ID' : 'শিক্ষার্থী আইডি';

            // 3. Marks Table Header Titles
            const thSub = document.getElementById('th-header-sub');
            if (thSub) thSub.innerText = isEn ? 'Subject' : 'বিষয়';
            const thComb = document.getElementById('th-header-combined');
            if (thComb) thComb.innerText = isEn ? 'Total' : 'সর্বমোট';
            const thGrd = document.getElementById('th-header-grade');
            if (thGrd) thGrd.innerText = isEn ? 'Grade' : 'গ্রেড';
            const thPt = document.getElementById('th-header-point');
            if (thPt) thPt.innerText = isEn ? 'GPA' : 'পয়েন্ট';

            // 4. Summary & Rank Table Labels
            const tdRank = document.getElementById('td-label-rank');
            if (tdRank) tdRank.innerText = isEn ? 'Rank' : 'স্থান';
            const tdGT = document.getElementById('td-label-grand-total');
            if (tdGT) tdGT.innerText = isEn ? 'Total Marks' : 'সর্বমোট';
            const tdGpa = document.getElementById('td-label-gpa');
            if (tdGpa) tdGpa.innerText = isEn ? 'GPA' : 'পয়েন্ট';
            const tdFinalGrd = document.getElementById('td-label-grade');
            if (tdFinalGrd) tdFinalGrd.innerText = isEn ? 'Grade' : 'গ্রেড';

            // 5. Signatures Labels
            const sigG = document.getElementById('label-sig-guardian');
            if (sigG) sigG.innerText = isEn ? "Guardian's Signature" : 'অভিভাবকের স্বাক্ষর';
            const sigH = document.getElementById('label-sig-head');
            if (sigH) sigH.innerText = isEn ? "Headmaster's Signature" : 'প্রধান শিক্ষকের স্বাক্ষর';
        }
"""

    if old_to_en in content:
        content = content.replace(old_to_en, new_to_en, 1)
        print("[Marksheet.html] Injected bilingual snippets and updateLanguageUI")
    else:
        print("[Marksheet.html] ERROR: old_to_en not found")

    # 2. Update getStudentReligionInfo to include 'en'
    old_rel_fn = '''        function getStudentReligionInfo(student) {
            const relStr = String(student?.religion || '').toLowerCase();
            if (relStr.includes('hindu') || relStr.includes('হিন্দু') || relStr.includes('সনাতন')) {
                return {
                    name: 'Hindu Religion Studies',
                    nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                    display: 'সনাতন / হিন্দু'
                };
            }
            if (relStr.includes('buddh') || relStr.includes('বৌদ্ধ')) {
                return {
                    name: 'Buddhist Religion Studies',
                    nameBn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
                    display: 'বৌদ্ধ'
                };
            }
            if (relStr.includes('christ') || relStr.includes('খ্রিস্ট')) {
                return {
                    name: 'Christian Religion Studies',
                    nameBn: 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
                    display: 'খ্রিস্টান'
                };
            }
            return {
                name: 'Islamic Studies',
                nameBn: 'ইসলাম ও নৈতিক শিক্ষা',
                display: 'ইসলাম'
            };
        }'''

    new_rel_fn = '''        function getStudentReligionInfo(student) {
            const relStr = String(student?.religion || '').toLowerCase();
            if (relStr.includes('hindu') || relStr.includes('হিন্দু') || relStr.includes('সনাতন')) {
                return {
                    name: 'Hindu Religion Studies',
                    nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                    display: 'সনাতন / হিন্দু',
                    en: 'Hinduism'
                };
            }
            if (relStr.includes('buddh') || relStr.includes('বৌদ্ধ')) {
                return {
                    name: 'Buddhist Religion Studies',
                    nameBn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
                    display: 'বৌদ্ধ',
                    en: 'Buddhism'
                };
            }
            if (relStr.includes('christ') || relStr.includes('খ্রিস্ট')) {
                return {
                    name: 'Christian Religion Studies',
                    nameBn: 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
                    display: 'খ্রিস্টান',
                    en: 'Christianity'
                };
            }
            return {
                name: 'Islamic Studies',
                nameBn: 'ইসলাম ও নৈতিক শিক্ষা',
                display: 'ইসলাম',
                en: 'Islam'
            };
        }'''

    if old_rel_fn in content:
        content = content.replace(old_rel_fn, new_rel_fn, 1)
        print("[Marksheet.html] Updated getStudentReligionInfo")
    else:
        print("[Marksheet.html] ERROR: old_rel_fn not found")

    # 3. Update renderGradingScaleLegend and getGradingScaleTableHTML
    old_legend_fns = '''        function renderGradingScaleLegend() {
            const rules = loadMarkingSystem();
            const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
            const table = document.getElementById('marksheet-grading-scale-table');
            if (table) {
                let rowsHtml = '<tr><th>Range</th><th>Grade</th><th>GPA</th></tr>';
                sorted.filter(r => r.name !== 'F' && parseFloat(r.gp) > 0).forEach(r => {
                    const minStr = String(r.min);
                    const maxStr = String(r.max);
                    const gpStr = parseFloat(r.gp || 0).toFixed(2);
                    rowsHtml += `<tr><td>${minStr}-${maxStr}</td><td>${r.name}</td><td>${gpStr}</td></tr>`;
                });
                table.innerHTML = rowsHtml;
            }
        }

        function getGradingScaleTableHTML() {
            const rules = loadMarkingSystem();
            const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
            const innerRows = sorted.filter(r => r.name !== 'F' && parseFloat(r.gp) > 0).map(r => `<tr><td>${r.min}-${r.max}</td><td>${r.name}</td><td>${parseFloat(r.gp || 0).toFixed(2)}</td></tr>`).join('');
            return `<table class="grading-scale"><tr><th>Range</th><th>Grade</th><th>GPA</th></tr>${innerRows}</table>`;
        }'''

    new_legend_fns = '''        function renderGradingScaleLegend() {
            const rules = loadMarkingSystem();
            const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
            const table = document.getElementById('marksheet-grading-scale-table');
            if (table) {
                let rowsHtml = '<tr><th>Range</th><th>Grade</th><th>GPA</th></tr>';
                sorted.filter(r => r.name !== 'F' && parseFloat(r.gp) > 0).forEach(r => {
                    const minStr = formatDigits(r.min);
                    const maxStr = formatDigits(r.max);
                    const gpStr = formatDigits(parseFloat(r.gp || 0).toFixed(2));
                    rowsHtml += `<tr><td>${minStr}-${maxStr}</td><td>${r.name}</td><td>${gpStr}</td></tr>`;
                });
                table.innerHTML = rowsHtml;
            }
        }

        function getGradingScaleTableHTML() {
            const rules = loadMarkingSystem();
            const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
            const innerRows = sorted.filter(r => r.name !== 'F' && parseFloat(r.gp) > 0).map(r => {
                const minStr = formatDigits(r.min);
                const maxStr = formatDigits(r.max);
                const gpStr = formatDigits(parseFloat(r.gp || 0).toFixed(2));
                return `<tr><td>${minStr}-${maxStr}</td><td>${r.name}</td><td>${gpStr}</td></tr>`;
            }).join('');
            return `<table class="grading-scale"><tr><th>Range</th><th>Grade</th><th>GPA</th></tr>${innerRows}</table>`;
        }'''

    if old_legend_fns in content:
        content = content.replace(old_legend_fns, new_legend_fns, 1)
        print("[Marksheet.html] Updated renderGradingScaleLegend and getGradingScaleTableHTML")
    else:
        print("[Marksheet.html] ERROR: old_legend_fns not found")

    # 4. Update updateTableHeaderMarks
    old_th_marks = '''        function updateTableHeaderMarks(exam, selectedClass) {
            const dist = getExamDistribution(exam, selectedClass);
            const thMcq = document.getElementById('th-header-mcq');
            const thCq = document.getElementById('th-header-cq');
            const thPrac = document.getElementById('th-header-prac');
            const thTotal = document.getElementById('th-header-total');

            if (thMcq) thMcq.innerText = `বহুনির্বাচনি (${toBnDigits(dist.mcq)})`;
            if (thCq) thCq.innerText = `লিখিত (${toBnDigits(dist.cq)})`;
            if (thPrac) thPrac.innerText = `ব্যবহারিক (${toBnDigits(dist.prac)})`;
            if (thTotal) thTotal.innerText = `মোট (${toBnDigits(dist.total)})`;
        }'''

    new_th_marks = '''        function updateTableHeaderMarks(exam, selectedClass) {
            const dist = getExamDistribution(exam, selectedClass);
            const thMcq = document.getElementById('th-header-mcq');
            const thCq = document.getElementById('th-header-cq');
            const thPrac = document.getElementById('th-header-prac');
            const thTotal = document.getElementById('th-header-total');
            const isEn = (currentLanguage === 'en');

            if (thMcq) thMcq.innerText = isEn ? `MCQ (${formatDigits(dist.mcq)})` : `বহুনির্বাচনি (${formatDigits(dist.mcq)})`;
            if (thCq) thCq.innerText = isEn ? `CQ (${formatDigits(dist.cq)})` : `লিখিত (${formatDigits(dist.cq)})`;
            if (thPrac) thPrac.innerText = isEn ? `Practical (${formatDigits(dist.prac)})` : `ব্যবহারিক (${formatDigits(dist.prac)})`;
            if (thTotal) thTotal.innerText = isEn ? `Total (${formatDigits(dist.total)})` : `মোট (${formatDigits(dist.total)})`;
        }'''

    if old_th_marks in content:
        content = content.replace(old_th_marks, new_th_marks, 1)
        print("[Marksheet.html] Updated updateTableHeaderMarks")
    else:
        print("[Marksheet.html] ERROR: old_th_marks not found")

    # 5. In renderMarksheetTable: update display mapping
    # Replace toBnDigits with formatDigits and sub.name with getDisplaySubjectName(sub.name)
    table_render_pattern = re.compile(
        r"const p1McqDisplay = \(isP1NoMcqPrac \|\| sub\.mcqFull === 0\) \? '-' : \(sub\.mcq !== '' \? \(sub\.mcq === 'A' \? 'A' : toBnDigits\(sub\.mcq\)\) : '—'\);\s*"
        r"const p1CqDisplay = sub\.cq !== '' \? \(sub\.cq === 'A' \? 'A' : toBnDigits\(sub\.cq\)\) : '—';\s*"
        r"const p1PrDisplay = \(isP1NoMcqPrac \|\| sub\.pracFull === 0\) \? '-' : \(sub\.pr !== '' \? \(sub\.pr === 'A' \? 'A' : toBnDigits\(sub\.pr\)\) : '—';\s*"
        r"const p1TotDisplay = sub\.hasMarks \? toBnDigits\(m1\) : '—';\s*"
        r"const p2McqDisplay = \(isP2NoMcqPrac \|\| sub\.pairMcqFull === 0\) \? '-' : \(sub\.pairMcq !== '' \? \(sub\.pairMcq === 'A' \? 'A' : toBnDigits\(sub\.pairMcq\)\) : '—';\s*"
        r"const p2CqDisplay = sub\.pairCq !== '' \? \(sub\.pairCq === 'A' \? 'A' : toBnDigits\(sub\.pairCq\)\) : '—';\s*"
        r"const p2PrDisplay = \(isP2NoMcqPrac \|\| sub\.pairPracFull === 0\) \? '-' : \(sub\.pairPr !== '' \? \(sub\.pairPr === 'A' \? 'A' : toBnDigits\(sub\.pairPr\)\) : '—';\s*"
        r"const p2TotDisplay = sub\.pairHasMarks \? toBnDigits\(m2\) : '—';\s*"
        r"const combTotDisplay = hasPaperMarks \? toBnDigits\(combTotal\) : '—';\s*"
        r"const combGradeDisplay = hasPaperMarks \? res\.grade : '—';\s*"
        r"const combGpDisplay = hasPaperMarks \? toBnDigits\(res\.gp\.toFixed\(2\)\) : '—';\s*"
        r"html \+= `<tr>\s*<td class=\"subject-col\">\${sub\.name}</td>",
        re.MULTILINE
    )

    new_table_render = """const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const p1TotDisplay = sub.hasMarks ? formatDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = sub.pairHasMarks ? formatDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    html += `<tr>
                        <td class="subject-col">${getDisplaySubjectName(sub.name)}</td>"""

    if table_render_pattern.search(content):
        content = table_render_pattern.sub(new_table_render, content, count=1)
        print("[Marksheet.html] Updated paired rendering in renderMarksheetTable")
    else:
        print("[Marksheet.html] ERROR: table_render_pattern not found")

    content = content.replace('<td class="subject-col">${sub.pairWith}</td>', '<td class="subject-col">${getDisplaySubjectName(sub.pairWith)}</td>', 1)

    # Single subject in renderMarksheetTable
    old_single_render = '''                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—');
                    const totDisplay = sub.hasMarks ? toBnDigits(tot) : '—';
                    const gradeDisplay = sub.hasMarks ? res.grade : '—';
                    const gpDisplay = sub.hasMarks ? toBnDigits(res.gp.toFixed(2)) : '—';

                    html += `<tr>
                        <td class="subject-col">${sub.name}</td>'''

    new_single_render = '''                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const totDisplay = sub.hasMarks ? formatDigits(tot) : '—';
                    const gradeDisplay = sub.hasMarks ? res.grade : '—';
                    const gpDisplay = sub.hasMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    html += `<tr>
                        <td class="subject-col">${getDisplaySubjectName(sub.name)}</td>'''

    if old_single_render in content:
        content = content.replace(old_single_render, new_single_render, 1)
        print("[Marksheet.html] Updated single subject rendering in renderMarksheetTable")
    else:
        print("[Marksheet.html] ERROR: old_single_render not found")

    # Bottom summary in renderMarksheetTable
    old_bottom_render = '''            const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(boundedGpa.toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';

            const gtEl = document.getElementById('display-grand-total');
            if (gtEl) gtEl.innerText = hasAnyMarks ? toBnDigits(grandTotal) : '—';
            const gpaEl = document.getElementById('display-gpa');
            if (gpaEl) gpaEl.innerText = finalGpaStr;
            const gradeEl = document.getElementById('display-final-grade');
            if (gradeEl) gradeEl.innerText = finalGrade;
            const rankEl = document.getElementById('display-rank-val');
            if (rankEl) rankEl.innerText = (student && student.roll ? toBnDigits(student.roll) : '১');'''

    new_bottom_render = '''            const zeroGpaStr = currentLanguage === 'en' ? '0.00' : '০.০০';
            const finalGpaStr = hasAnyMarks ? (hasFailed ? zeroGpaStr : formatDigits(boundedGpa.toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';

            const gtEl = document.getElementById('display-grand-total');
            if (gtEl) gtEl.innerText = hasAnyMarks ? formatDigits(grandTotal) : '—';
            const gpaEl = document.getElementById('display-gpa');
            if (gpaEl) gpaEl.innerText = finalGpaStr;
            const gradeEl = document.getElementById('display-final-grade');
            if (gradeEl) gradeEl.innerText = finalGrade;
            const rankEl = document.getElementById('display-rank-val');
            if (rankEl) rankEl.innerText = (student && student.roll ? formatDigits(student.roll) : formatDigits('1'));'''

    if old_bottom_render in content:
        content = content.replace(old_bottom_render, new_bottom_render, 1)
        print("[Marksheet.html] Updated bottom summary in renderMarksheetTable")
    else:
        print("[Marksheet.html] ERROR: old_bottom_render not found")

    # 6. Update syncCascadingFilters in Marksheet.html
    old_sync_student = '''                const studentName = matchedStudent ? (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || 'মো: আব্দুল্লাহ আল নোমান') : 'মো: আব্দুল্লাহ আল নোমান';
                const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '১') : '১';
                const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

                const nameEl = document.getElementById('display-student-name');
                if (nameEl && nameEl.innerText !== studentName) nameEl.innerText = studentName;
                const rollEl = document.getElementById('display-roll-no');
                if (rollEl) rollEl.innerText = toBnDigits(rollNo);
                const idEl = document.getElementById('display-student-id');
                if (idEl) idEl.innerText = toBnDigits(studentId);

                const isSecondary = ['9', '10'].includes(effectiveNormClass);
                const relInfo = getStudentReligionInfo(matchedStudent);
                const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

                const relEl = document.getElementById('display-student-religion');
                if (relEl) relEl.innerText = relInfo.display;

                const optRow = document.getElementById('row-optional-subject');
                const optEl = document.getElementById('display-optional-subject');
                if (optRow) {
                    if (isSecondary) {
                        optRow.style.display = 'flex';
                        if (optEl) optEl.innerText = optInfo.nameBn;
                    } else {
                        optRow.style.display = 'none';
                    }
                }'''

    new_sync_student = '''                const isEn = (currentLanguage === 'en');
                let studentName = 'মো: আব্দুল্লাহ আল নোমান';
                if (matchedStudent) {
                    studentName = isEn && matchedStudent.nameEn ? matchedStudent.nameEn : (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || (isEn ? 'Student Name' : 'মো: আব্দুল্লাহ আল নোমান'));
                } else if (isEn) {
                    studentName = 'MD. ABDULLAH AL NOMAN';
                }

                const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '1') : '1';
                const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

                const nameEl = document.getElementById('display-student-name');
                if (nameEl && nameEl.innerText !== studentName) nameEl.innerText = studentName;
                const rollEl = document.getElementById('display-roll-no');
                if (rollEl) rollEl.innerText = formatDigits(rollNo);
                const idEl = document.getElementById('display-student-id');
                if (idEl) idEl.innerText = formatDigits(studentId);

                const classDisplay = getDisplayClassName(effectiveClass);
                const classEl = document.getElementById('display-class-name');
                if (classEl) classEl.innerText = classDisplay;

                const secDisplay = isEn ? 'Section = ' + getEnglishSectionName(effectiveSec) : 'শাখা = ' + effectiveSec;
                const secEl = document.getElementById('display-section-name');
                if (secEl) secEl.innerText = secDisplay;

                const examBadge = document.getElementById('display-exam-name');
                if (examBadge) examBadge.innerText = getDisplayExamName(selectedExam);

                const isSecondary = ['9', '10'].includes(effectiveNormClass);
                const relInfo = getStudentReligionInfo(matchedStudent);
                const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

                const relEl = document.getElementById('display-student-religion');
                if (relEl) relEl.innerText = isEn ? (relInfo.en || 'Islam') : relInfo.display;

                const optRow = document.getElementById('row-optional-subject');
                const optEl = document.getElementById('display-optional-subject');
                if (optRow) {
                    if (isSecondary) {
                        optRow.style.display = 'flex';
                        if (optEl) optEl.innerText = isEn ? optInfo.name : optInfo.nameBn;
                    } else {
                        optRow.style.display = 'none';
                    }
                }'''

    if old_sync_student in content:
        content = content.replace(old_sync_student, new_sync_student, 1)
        print("[Marksheet.html] Updated syncCascadingFilters student info")
    else:
        print("[Marksheet.html] ERROR: old_sync_student not found")

    # 7. Update generateMarksheetCardHTML in Marksheet.html for bilingual batch cards
    old_card_fn_start = '''        function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {
            const examDist = getExamDistribution(exam, selectedClass);
            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);'''

    new_card_fn_start = '''        function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {
            const isEn = (currentLanguage === 'en');
            const examDist = getExamDistribution(exam, selectedClass);
            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);'''

    content = content.replace(old_card_fn_start, new_card_fn_start, 1)

    # In generateMarksheetCardHTML: paired rows
    old_card_paired = '''                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—');
                    const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = sub.pairHasMarks ? toBnDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? toBnDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? toBnDigits(res.gp.toFixed(2)) : '—';

                    tableHtml += `<tr>
                        <td class="subject-col">${sub.name}</td>'''

    new_card_paired = '''                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const p1TotDisplay = sub.hasMarks ? formatDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = sub.pairHasMarks ? formatDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    tableHtml += `<tr>
                        <td class="subject-col">${getDisplaySubjectName(sub.name)}</td>'''

    content = content.replace(old_card_paired, new_card_paired, 1)
    content = content.replace('<td class="subject-col">${sub.pairWith}</td>', '<td class="subject-col">${getDisplaySubjectName(sub.pairWith)}</td>', 1)

    # In generateMarksheetCardHTML: single rows
    old_card_single = '''                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—');
                    const totDisplay = sub.hasMarks ? toBnDigits(tot) : '—';
                    const gradeDisplay = sub.hasMarks ? res.grade : '—';
                    const gpDisplay = sub.hasMarks ? toBnDigits(res.gp.toFixed(2)) : '—';

                    tableHtml += `<tr>
                        <td class="subject-col">${sub.name}</td>'''

    new_card_single = '''                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const totDisplay = sub.hasMarks ? formatDigits(tot) : '—';
                    const gradeDisplay = sub.hasMarks ? res.grade : '—';
                    const gpDisplay = sub.hasMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    tableHtml += `<tr>
                        <td class="subject-col">${getDisplaySubjectName(sub.name)}</td>'''

    content = content.replace(old_card_single, new_card_single, 1)

    # In generateMarksheetCardHTML: bottom summary & template
    old_card_bottom = '''            const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(boundedGpa.toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';
            const rankStr = toBnDigits(rankNum);'''

    new_card_bottom = '''            const zeroGpaStr = isEn ? '0.00' : '০.০০';
            const finalGpaStr = hasAnyMarks ? (hasFailed ? zeroGpaStr : formatDigits(boundedGpa.toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';
            const rankStr = formatDigits(rankNum);'''

    content = content.replace(old_card_bottom, new_card_bottom, 1)

    # Card template HTML labels & variables
    old_card_meta = '''            const stName = student ? (student.nameBn || student.name || 'শিক্ষার্থী') : 'শিক্ষার্থী';
            const stRoll = toBnDigits(student ? (student.roll || student.rollNo || rankNum) : rankNum);
            const stId = toBnDigits(getEffectiveStudentId(student, selectedClass, (student ? (student.roll || student.rollNo || rankNum) : rankNum)));
            const stClass = formatClassNameDisplay(selectedClass);
            const stSection = selectedSection || 'ক';'''

    new_card_meta = '''            const stName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
            const stRoll = formatDigits(student ? (student.roll || student.rollNo || rankNum) : rankNum);
            const stId = formatDigits(getEffectiveStudentId(student, selectedClass, (student ? (student.roll || student.rollNo || rankNum) : rankNum)));
            const stClass = getDisplayClassName(selectedClass);
            const stSection = isEn ? getEnglishSectionName(selectedSection) : (selectedSection || 'ক');
            const examBadgeTitle = getDisplayExamName(exam);
            const stReligion = isEn ? (relInfo.en || 'Islam') : relInfo.display;
            const stOptional = isEn ? optInfo.name : optInfo.nameBn;'''

    content = content.replace(old_card_meta, new_card_meta, 1)

    # Replace hardcoded card labels inside generateMarksheetCardHTML
    content = content.replace('<div class="exam-badge">${exam}</div>', '<div class="exam-badge">${examBadgeTitle}</div>', 1)
    content = content.replace('<div class="info-label">শিক্ষার্থীর নাম</div>', '<div class="info-label">${isEn ? "Student Name" : "শিক্ষার্থীর নাম"}</div>', 1)
    content = content.replace('<div class="info-label">রোল নং</div>', '<div class="info-label">${isEn ? "Roll No" : "রোল নং"}</div>', 1)
    content = content.replace('<div class="info-label">শ্রেণি</div>', '<div class="info-label">${isEn ? "Class" : "শ্রেণি"}</div>', 1)
    content = content.replace('শাখা = ${stSection}', '${isEn ? "Section = " + stSection : "শাখা = " + stSection}', 1)
    content = content.replace('<div class="info-label" style="width: 125px;">ধর্ম (Religion)</div>', '<div class="info-label" style="width: 125px;">${isEn ? "Religion" : "ধর্ম (Religion)"}</div>', 1)
    content = content.replace('<div>: ${relInfo.display}</div>', '<div>: ${stReligion}</div>', 1)
    content = content.replace('<div class="info-label" style="width: 125px;">ঐচ্ছিক বিষয় (৪র্থ)</div>', '<div class="info-label" style="width: 125px;">${isEn ? "Optional (4th)" : "ঐচ্ছিক বিষয় (৪র্থ)"}</div>', 1)
    content = content.replace('<div>: ${optInfo.nameBn}</div>', '<div>: ${stOptional}</div>', 1)
    content = content.replace('<div class="info-label" style="width: 125px;">শিক্ষার্থী আইডি</div>', '<div class="info-label" style="width: 125px;">${isEn ? "Student ID" : "শিক্ষার্থী আইডি"}</div>', 1)

    # Card marks table headers
    old_card_table_head = '''                        <tr>
                            <th class="subject-col">বিষয়</th>
                            <th>বহুনির্বাচনি (${toBnDigits(examDist.mcq)})</th>
                            <th>লিখিত (${toBnDigits(examDist.cq)})</th>
                            <th>ব্যবহারিক (${toBnDigits(examDist.prac)})</th>
                            <th>মোট (${toBnDigits(examDist.total)})</th>
                            <th>সর্বমোট</th>
                            <th>গ্রেড</th>
                            <th>পয়েন্ট</th>
                        </tr>'''

    new_card_table_head = '''                        <tr>
                            <th class="subject-col">${isEn ? "Subject" : "বিষয়"}</th>
                            <th>${isEn ? "MCQ (" + formatDigits(examDist.mcq) + ")" : "বহুনির্বাচনি (" + formatDigits(examDist.mcq) + ")"}</th>
                            <th>${isEn ? "CQ (" + formatDigits(examDist.cq) + ")" : "লিখিত (" + formatDigits(examDist.cq) + ")"}</th>
                            <th>${isEn ? "Practical (" + formatDigits(examDist.prac) + ")" : "ব্যবহারিক (" + formatDigits(examDist.prac) + ")"}</th>
                            <th>${isEn ? "Total (" + formatDigits(examDist.total) + ")" : "মোট (" + formatDigits(examDist.total) + ")"}</th>
                            <th>${isEn ? "Total" : "সর্বমোট"}</th>
                            <th>${isEn ? "Grade" : "গ্রেড"}</th>
                            <th>${isEn ? "GPA" : "পয়েন্ট"}</th>
                        </tr>'''

    content = content.replace(old_card_table_head, new_card_table_head, 1)

    # Card bottom summary
    content = content.replace('<td style="width: 50%;">স্থান</td>', '<td style="width: 50%;">${isEn ? "Rank" : "স্থান"}</td>', 1)
    content = content.replace('<td style="width: 50%;">সর্বমোট</td>', '<td style="width: 50%;">${isEn ? "Total Marks" : "সর্বমোট"}</td>', 1)
    content = content.replace('<td>${toBnDigits(grandTotal)}</td>', '<td>${formatDigits(grandTotal)}</td>', 1)
    content = content.replace('<td>পয়েন্ট</td>', '<td>${isEn ? "GPA" : "পয়েন্ট"}</td>', 1)
    content = content.replace('<td>গ্রেড</td>', '<td>${isEn ? "Grade" : "গ্রেড"}</td>', 1)
    content = content.replace('<div class="sig-label">অভিভাবকের স্বাক্ষর</div>', '<div class="sig-label">${isEn ? "Guardian\'s Signature" : "অভিভাবকের স্বাক্ষর"}</div>', 1)
    content = content.replace('<div class="sig-label">প্রধান শিক্ষকের স্বাক্ষর</div>', '<div class="sig-label">${isEn ? "Headmaster\'s Signature" : "প্রধান শিক্ষকের স্বাক্ষর"}</div>', 1)

    # 8. Update switchTemplate to preserve lang param
    old_switch_tmpl = '''        function switchTemplate(val) {
            let extra = isCreateAllMode ? '?mode=all' : '?mode=single';
            const roll = currentSelectedStudent ? (currentSelectedStudent.roll || currentSelectedStudent.rollNo) : '';
            if (roll) {
                extra += '&roll=' + encodeURIComponent(toEnDigits(roll));
            }
            if (val === 'Temp-01') {
                window.location.href = 'Marksheet.html' + extra;
            } else if (val === 'Temp-02') {
                window.location.href = 'Marksheet1.html' + extra;
            }
        }'''

    new_switch_tmpl = '''        function switchTemplate(val) {
            let extra = isCreateAllMode ? '?mode=all' : '?mode=single';
            const roll = currentSelectedStudent ? (currentSelectedStudent.roll || currentSelectedStudent.rollNo) : '';
            if (roll) {
                extra += '&roll=' + encodeURIComponent(toEnDigits(roll));
            }
            if (currentLanguage) {
                extra += '&lang=' + encodeURIComponent(currentLanguage);
            }
            if (val === 'Temp-01') {
                window.location.href = 'Marksheet.html' + extra;
            } else if (val === 'Temp-02') {
                window.location.href = 'Marksheet1.html' + extra;
            }
        }'''

    if old_switch_tmpl in content:
        content = content.replace(old_switch_tmpl, new_switch_tmpl, 1)
        print("[Marksheet.html] Updated switchTemplate with lang param")
    else:
        print("[Marksheet.html] ERROR: old_switch_tmpl not found")

    # 9. Update initialization / DOMContentLoaded to call updateLanguageUI()
    old_init = '''            syncLiveExamData();
            syncCascadingFilters('init');'''

    new_init = '''            syncLiveExamData();
            updateLanguageUI();
            syncCascadingFilters('init');'''

    if old_init in content:
        content = content.replace(old_init, new_init, 1)
        print("[Marksheet.html] Injected updateLanguageUI in init")
    else:
        print("[Marksheet.html] Note: old_init not matched directly, checking window.onload")

    with open('Marksheet.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[Marksheet.html] Finished integrate_bilingual_engine successfully")

update_marksheet()

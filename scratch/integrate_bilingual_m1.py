import re

def update_marksheet1():
    with open('Marksheet1.html', 'r', encoding='utf-8') as f:
        content = f.read()

    with open('scratch/bilingual_snippets.js', 'r', encoding='utf-8') as f:
        snippets = f.read()

    # 1. Inject bilingual snippets and updateLanguageUI1 after toEnDigits
    old_to_en = '''function toEnDigits(n) {
    if (n === null || n === undefined) return '';
    const en = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
    return String(n).replace(/[০-৯]/g, d => en[d]);
}'''

    new_ui_fn = """
function updateLanguageUI1() {
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
    if (sLang && sLang.value !== currentLanguage) sLang.value = currentLanguage;
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

    // 2. Profile Card Labels
    const pName = document.getElementById('p-label-name');
    if (pName) pName.innerText = isEn ? 'Student Name' : 'শিক্ষার্থীর নাম';
    const pCls = document.getElementById('p-label-class');
    if (pCls) pCls.innerText = isEn ? 'Class' : 'শ্রেণি';
    const pSec = document.getElementById('p-label-section');
    if (pSec) pSec.innerText = isEn ? 'Section / Group' : 'শাখা / গ্রুপ';
    const pId = document.getElementById('p-label-id');
    if (pId) pId.innerText = isEn ? 'ID / Reg' : 'আইডি / রেজি';
    const pRoll = document.getElementById('p-label-roll');
    if (pRoll) pRoll.innerText = isEn ? 'Roll No' : 'রোল নং';
    const pRel = document.getElementById('p-label-religion');
    if (pRel) pRel.innerText = isEn ? 'Religion' : 'ধর্ম (Religion)';
    const pOpt = document.getElementById('label-opt-val');
    if (pOpt) pOpt.innerText = isEn ? 'Optional Subject' : 'ঐচ্ছিক বিষয়';

    // 3. Legend Table Labels
    const legTitle = document.getElementById('legend-title-1');
    if (legTitle) legTitle.innerText = isEn ? 'Grading Scale' : 'গ্রেডিং নির্দেশিকা (Grading Scale)';
    const legRange = document.getElementById('legend-th-range-1');
    if (legRange) legRange.innerText = isEn ? 'Marks Range' : 'নম্বর সীমা';
    const legGrd = document.getElementById('legend-th-grade-1');
    if (legGrd) legGrd.innerText = isEn ? 'Grade' : 'গ্রেড';
    const legGp = document.getElementById('legend-th-gp-1');
    if (legGp) legGp.innerText = isEn ? 'GPA' : 'পয়েন্ট';

    // 4. Transcript Table Headers
    const thSub = document.getElementById('th-header-sub-1');
    if (thSub) thSub.innerText = isEn ? 'Subjects' : 'পাঠ্য বিষয়সমূহ';
    const thFull = document.getElementById('th-header-full-1');
    if (thFull) thFull.innerText = isEn ? 'Full Marks' : 'পূর্ণমান';
    const thObt = document.getElementById('th-header-obtained-1');
    if (thObt) thObt.innerText = isEn ? 'Marks Obtained' : 'প্রাপ্ত নম্বর';
    const thMcq = document.getElementById('th-header-mcq-1');
    if (thMcq) thMcq.innerText = isEn ? 'MCQ' : 'বহুনির্বাচনি';
    const thCq = document.getElementById('th-header-cq-1');
    if (thCq) thCq.innerText = isEn ? 'CQ' : 'লিখিত';
    const thPrac = document.getElementById('th-header-prac-1');
    if (thPrac) thPrac.innerText = isEn ? 'Prac.' : 'ব্যবহারিক';
    const thTot = document.getElementById('th-header-total-1');
    if (thTot) thTot.innerText = isEn ? 'Total' : 'মোট নম্বর';
    const thComb = document.getElementById('th-header-combined-1');
    if (thComb) thComb.innerText = isEn ? 'Grand Total' : 'সর্বমোট';
    const thGrdTbl = document.getElementById('th-header-grade-1');
    if (thGrdTbl) thGrdTbl.innerText = isEn ? 'Letter Grade' : 'লেটার গ্রেড';
    const thGpTbl = document.getElementById('th-header-gp-1');
    if (thGpTbl) thGpTbl.innerText = isEn ? 'Grade Point (GP)' : 'গ্রেড পয়েন্ট (GP)';

    // 5. KPI Row Labels
    const kpiTot = document.getElementById('kpi-label-total');
    if (kpiTot) kpiTot.innerText = isEn ? 'Total Marks Obtained' : 'সর্বমোট প্রাপ্ত নম্বর';
    const kpiGpa = document.getElementById('kpi-label-gpa');
    if (kpiGpa) kpiGpa.innerText = isEn ? 'GPA' : 'জিপিএ (GPA)';
    const kpiGrd = document.getElementById('kpi-label-grade');
    if (kpiGrd) kpiGrd.innerText = isEn ? 'Final Grade' : 'চূড়ান্ত গ্রেড';
    const kpiPos = document.getElementById('kpi-label-pos');
    if (kpiPos) kpiPos.innerText = isEn ? 'Merit Position' : 'মেধাক্রম (Merit Position)';

    // 6. Signatures Labels
    const sigG = document.getElementById('label-sig-guardian-1');
    if (sigG) sigG.innerText = isEn ? "Guardian's Signature" : 'অভিভাবকের স্বাক্ষর';
    const sigT = document.getElementById('label-sig-teacher-1');
    if (sigT) sigT.innerText = isEn ? "Class Teacher's Signature" : 'শ্রেণি শিক্ষকের স্বাক্ষর';
    const sigH = document.getElementById('label-sig-head-1');
    if (sigH) sigH.innerText = isEn ? "Head Teacher's Signature & Seal" : 'প্রধান শিক্ষকের স্বাক্ষর ও সিল';
}
"""

    if old_to_en in content:
        content = content.replace(old_to_en, old_to_en + "\n\n" + snippets + "\n" + new_ui_fn, 1)
        print("[Marksheet1.html] Injected bilingual snippets & updateLanguageUI1")
    else:
        print("[Marksheet1.html] ERROR: old_to_en not found")

    # 2. Update renderGradingScaleLegend1 & getGradingScaleLegendRowsHTML1
    old_legend = '''function renderGradingScaleLegend1() {
    const rules = loadMarkingSystem();
    const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    const tbody = document.getElementById('grading-legend-tbody-1');
    if (tbody) {
        let rowsHtml = '';
        sorted.forEach(r => {
            const minStr = toBnDigits(String(r.min).padStart(2, '০'));
            const maxStr = toBnDigits(String(r.max));
            const gpStr = toBnDigits(parseFloat(r.gp || 0).toFixed(2));
            rowsHtml += `<tr><td>${minStr}-${maxStr}</td><td><strong>${r.name}</strong></td><td>${gpStr}</td></tr>`;
        });
        tbody.innerHTML = rowsHtml;
    }
}

function getGradingScaleLegendRowsHTML1() {
    const rules = loadMarkingSystem();
    const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    return sorted.map(r => {
        const minStr = toBnDigits(String(r.min).padStart(2, '০'));
        const maxStr = toBnDigits(String(r.max));
        const gpStr = toBnDigits(parseFloat(r.gp || 0).toFixed(2));
        return `<tr><td>${minStr}-${maxStr}</td><td><strong>${r.name}</strong></td><td>${gpStr}</td></tr>`;
    }).join('');
}'''

    new_legend = '''function renderGradingScaleLegend1() {
    const rules = loadMarkingSystem();
    const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    const tbody = document.getElementById('grading-legend-tbody-1');
    if (tbody) {
        let rowsHtml = '';
        sorted.forEach(r => {
            const minStr = formatDigits(String(r.min).padStart(2, '0'));
            const maxStr = formatDigits(String(r.max));
            const gpStr = formatDigits(parseFloat(r.gp || 0).toFixed(2));
            rowsHtml += `<tr><td>${minStr}-${maxStr}</td><td><strong>${r.name}</strong></td><td>${gpStr}</td></tr>`;
        });
        tbody.innerHTML = rowsHtml;
    }
}

function getGradingScaleLegendRowsHTML1() {
    const rules = loadMarkingSystem();
    const sorted = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    return sorted.map(r => {
        const minStr = formatDigits(String(r.min).padStart(2, '0'));
        const maxStr = formatDigits(String(r.max));
        const gpStr = formatDigits(parseFloat(r.gp || 0).toFixed(2));
        return `<tr><td>${minStr}-${maxStr}</td><td><strong>${r.name}</strong></td><td>${gpStr}</td></tr>`;
    }).join('');
}'''

    if old_legend in content:
        content = content.replace(old_legend, new_legend, 1)
        print("[Marksheet1.html] Updated renderGradingScaleLegend1 & getGradingScaleLegendRowsHTML1")
    else:
        print("[Marksheet1.html] ERROR: old_legend not found")

    # 3. Update getStudentReligionInfo
    old_rel = '''function getStudentReligionInfo(student) {
    const r = String(student?.religion || student?.religionBn || 'Islam').toLowerCase();
    if (r.includes('hindu') || r.includes('হিন্দু') || r.includes('সনাতন')) {
        return {
            name: 'Hindu Religion Studies',
            nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
            display: 'হিন্দু (সনাতন)'
        };
    } else if (r.includes('buddh') || r.includes('বৌদ্ধ')) {
        return {
            name: 'Buddhist Religion Studies',
            nameBn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
            display: 'বৌদ্ধ'
        };
    } else if (r.includes('christ') || r.includes('খ্রিস্ট') || r.includes('ঈসায়ী')) {
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

    new_rel = '''function getStudentReligionInfo(student) {
    const r = String(student?.religion || student?.religionBn || 'Islam').toLowerCase();
    if (r.includes('hindu') || r.includes('হিন্দু') || r.includes('সনাতন')) {
        return {
            name: 'Hindu Religion Studies',
            nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
            display: 'হিন্দু (সনাতন)',
            en: 'Hinduism'
        };
    } else if (r.includes('buddh') || r.includes('বৌদ্ধ')) {
        return {
            name: 'Buddhist Religion Studies',
            nameBn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
            display: 'বৌদ্ধ',
            en: 'Buddhism'
        };
    } else if (r.includes('christ') || r.includes('খ্রিস্ট') || r.includes('ঈসায়ী')) {
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

    if old_rel in content:
        content = content.replace(old_rel, new_rel, 1)
        print("[Marksheet1.html] Updated getStudentReligionInfo")
    else:
        print("[Marksheet1.html] ERROR: old_rel not found")

    # 4. Update updateTableHeaderMarks
    old_th = '''function updateTableHeaderMarks(exam, selectedClass) {
    const dist = getExamDistribution(exam, selectedClass);
    const thMcq = document.getElementById('th-header-mcq-1');
    const thCq = document.getElementById('th-header-cq-1');
    const thPrac = document.getElementById('th-header-prac-1');
    const thTotal = document.getElementById('th-header-total-1');

    if (thMcq) thMcq.innerText = `বহুনির্বাচনি (${toBnDigits(dist.mcq)})`;
    if (thCq) thCq.innerText = `লিখিত (${toBnDigits(dist.cq)})`;
    if (thPrac) thPrac.innerText = `ব্যবহারিক (${toBnDigits(dist.prac)})`;
    if (thTotal) thTotal.innerText = `মোট নম্বর (${toBnDigits(dist.total)})`;
}'''

    new_th = '''function updateTableHeaderMarks(exam, selectedClass) {
    const dist = getExamDistribution(exam, selectedClass);
    const thMcq = document.getElementById('th-header-mcq-1');
    const thCq = document.getElementById('th-header-cq-1');
    const thPrac = document.getElementById('th-header-prac-1');
    const thTotal = document.getElementById('th-header-total-1');
    const isEn = (currentLanguage === 'en');

    if (thMcq) thMcq.innerText = isEn ? `MCQ (${formatDigits(dist.mcq)})` : `বহুনির্বাচনি (${formatDigits(dist.mcq)})`;
    if (thCq) thCq.innerText = isEn ? `CQ (${formatDigits(dist.cq)})` : `লিখিত (${formatDigits(dist.cq)})`;
    if (thPrac) thPrac.innerText = isEn ? `Prac. (${formatDigits(dist.prac)})` : `ব্যবহারিক (${formatDigits(dist.prac)})`;
    if (thTotal) thTotal.innerText = isEn ? `Total (${formatDigits(dist.total)})` : `মোট নম্বর (${formatDigits(dist.total)})`;
}'''

    if old_th in content:
        content = content.replace(old_th, new_th, 1)
        print("[Marksheet1.html] Updated updateTableHeaderMarks")
    else:
        print("[Marksheet1.html] ERROR: old_th not found")

    # 5. Update renderMarksheet1Table
    old_r_start = '''function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {
    const tbody = document.getElementById('transcript-tbody-1');
    if (tbody) {
        updateTableHeaderMarks(exam, selectedClass);
    }
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

    let mainSubjectsGP = 0;
    let mainSubjectCount = 0;
    let optionalBonusGP = 0;

    subjects.forEach((sub, idx) => {
        const isOpt = !!(sub.isOptional || sub.group === 'optional');
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            html += `<tr class="group-header-row"><td colspan="9">১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            html += `<tr class="group-header-row"><td colspan="9">২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            html += `<tr class="group-header-row"><td colspan="9">৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)</td></tr>`;
            hasOptionalHeader = true;
        }'''

    new_r_start = '''function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {
    const tbody = document.getElementById('transcript-tbody-1');
    if (tbody) {
        updateTableHeaderMarks(exam, selectedClass);
    }
    if (!tbody) return;

    const isEn = (currentLanguage === 'en');
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

    let mainSubjectsGP = 0;
    let mainSubjectCount = 0;
    let optionalBonusGP = 0;

    subjects.forEach((sub, idx) => {
        const isOpt = !!(sub.isOptional || sub.group === 'optional');
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`;
            hasOptionalHeader = true;
        }'''

    if old_r_start in content:
        content = content.replace(old_r_start, new_r_start, 1)
        print("[Marksheet1.html] Updated renderMarksheet1Table start & group headers")
    else:
        print("[Marksheet1.html] ERROR: old_r_start not found")

    # In renderMarksheet1Table: paired row
    old_r_paired = '''                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : '<span class="blank-field">—</span>';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '<span class="blank-field">—</span>');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '<span class="blank-field">—</span>');
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
                <td>${toBnDigits(sub.pairFull || sub.fullMarks)}</td>'''

    new_r_paired = '''                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const p1TotDisplay = sub.hasMarks ? formatDigits(m1) : '<span class="blank-field">—</span>';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '<span class="blank-field">—</span>');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '<span class="blank-field">—</span>');
                    const p2TotDisplay = sub.pairHasMarks ? formatDigits(m2) : '<span class="blank-field">—</span>';

            const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '<span class="blank-field">—</span>';
            const combGradeDisplay = hasPaperMarks ? res.grade : '—';
            const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            html += `<tr>
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
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>'''

    if old_r_paired in content:
        content = content.replace(old_r_paired, new_r_paired, 1)
        print("[Marksheet1.html] Updated paired rows in renderMarksheet1Table")
    else:
        print("[Marksheet1.html] ERROR: old_r_paired not found")

    # In renderMarksheet1Table: single row
    old_r_single = '''                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '<span class="blank-field">—</span>');
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
            </tr>`;'''

    new_r_single = '''                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const totDisplay = sub.hasMarks ? formatDigits(tot) : '<span class="blank-field">—</span>';
            const gradeDisplay = sub.hasMarks ? res.grade : '—';
            const gpDisplay = sub.hasMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            html += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;'''

    if old_r_single in content:
        content = content.replace(old_r_single, new_r_single, 1)
        print("[Marksheet1.html] Updated single rows in renderMarksheet1Table")
    else:
        print("[Marksheet1.html] ERROR: old_r_single not found")

    # In renderMarksheet1Table: bottom summary
    old_r_bottom = '''    const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(boundedGpa.toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';

    const gtEl = document.getElementById('display-grand-total-1');
    if (gtEl) gtEl.innerText = hasAnyMarks ? (toBnDigits(grandTotal) + ' / ' + toBnDigits(totalFullMarks)) : '—';
    const gpaEl = document.getElementById('display-gpa-1');
    if (gpaEl) gpaEl.innerText = finalGpaStr;
    const gradeEl = document.getElementById('display-final-grade-1');
    if (gradeEl) gradeEl.innerText = finalGrade;
    const meritEl = document.getElementById('display-merit-pos-1');
    if (meritEl) meritEl.innerText = (student && student.roll ? toBnDigits(student.roll) : '১');'''

    new_r_bottom = '''    const zeroGpaStr = isEn ? '0.00' : '০.০০';
    const finalGpaStr = hasAnyMarks ? (hasFailed ? zeroGpaStr : formatDigits(boundedGpa.toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';

    const gtEl = document.getElementById('display-grand-total-1');
    if (gtEl) gtEl.innerText = hasAnyMarks ? (formatDigits(grandTotal) + ' / ' + formatDigits(totalFullMarks)) : '—';
    const gpaEl = document.getElementById('display-gpa-1');
    if (gpaEl) gpaEl.innerText = finalGpaStr;
    const gradeEl = document.getElementById('display-final-grade-1');
    if (gradeEl) gradeEl.innerText = finalGrade;
    const meritEl = document.getElementById('display-merit-pos-1');
    if (meritEl) meritEl.innerText = (student && student.roll ? formatDigits(student.roll) : formatDigits('1'));'''

    if old_r_bottom in content:
        content = content.replace(old_r_bottom, new_r_bottom, 1)
        print("[Marksheet1.html] Updated bottom KPIs in renderMarksheet1Table")
    else:
        print("[Marksheet1.html] ERROR: old_r_bottom not found")

    # 6. Update syncCascadingFilters in Marksheet1.html
    old_sync_m1 = '''        const studentName = matchedStudent ? (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || 'মো: আব্দুল্লাহ আল নোমান') : 'মো: আব্দুল্লাহ আল নোমান';
        const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '০১') : '০১';
        const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

        const sVal = document.getElementById('display-student-val');
        if (sVal && sVal.innerText !== studentName) sVal.innerText = studentName;
        const rVal = document.getElementById('display-roll-val');
        if (rVal) rVal.innerText = toBnDigits(rollNo);
        const idVal = document.getElementById('display-id-val');
        if (idVal) idVal.innerText = toBnDigits(studentId);

        const isSecondary = ['9', '10'].includes(effectiveNormClass);
        const relInfo = getStudentReligionInfo(matchedStudent);
        const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

        const relVal = document.getElementById('display-religion-val');
        if (relVal) relVal.innerText = relInfo.display;

        const optVal = document.getElementById('display-optional-val');
        const optLbl = document.getElementById('label-opt-val');
        const optCol = document.getElementById('colon-opt-val');
        if (optVal) {
            if (isSecondary) {
                if (optLbl) optLbl.style.visibility = 'visible';
                if (optCol) optCol.style.visibility = 'visible';
                optVal.style.visibility = 'visible';
                optVal.innerText = optInfo.nameBn;
            } else {
                if (optLbl) optLbl.style.visibility = 'hidden';
                if (optCol) optCol.style.visibility = 'hidden';
                optVal.style.visibility = 'hidden';
                optVal.innerText = '—';
            }
        }'''

    new_sync_m1 = '''        const isEn = (currentLanguage === 'en');
        let studentName = 'মো: আব্দুল্লাহ আল নোমান';
        if (matchedStudent) {
            studentName = isEn && matchedStudent.nameEn ? matchedStudent.nameEn : (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || (isEn ? 'Student Name' : 'মো: আব্দুল্লাহ আল নোমান'));
        } else if (isEn) {
            studentName = 'MD. ABDULLAH AL NOMAN';
        }

        const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '01') : '01';
        const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

        const sVal = document.getElementById('display-student-val');
        if (sVal && sVal.innerText !== studentName) sVal.innerText = studentName;
        const rVal = document.getElementById('display-roll-val');
        if (rVal) rVal.innerText = formatDigits(rollNo);
        const idVal = document.getElementById('display-id-val');
        if (idVal) idVal.innerText = formatDigits(studentId);

        if (cVal) cVal.innerText = getDisplayClassName(effectiveClass);
        if (scVal) scVal.innerText = isEn ? getEnglishSectionName(effectiveSec) : effectiveSec;

        const pillTitle = document.getElementById('display-exam-name-pill');
        if (pillTitle) pillTitle.innerText = getDisplayExamName(selectedExam);

        const isSecondary = ['9', '10'].includes(effectiveNormClass);
        const relInfo = getStudentReligionInfo(matchedStudent);
        const optInfo = getStudentOptionalSubjectInfo(matchedStudent, effectiveNormSec);

        const relVal = document.getElementById('display-religion-val');
        if (relVal) relVal.innerText = isEn ? (relInfo.en || 'Islam') : relInfo.display;

        const optVal = document.getElementById('display-optional-val');
        const optLbl = document.getElementById('label-opt-val');
        const optCol = document.getElementById('colon-opt-val');
        if (optVal) {
            if (isSecondary) {
                if (optLbl) { optLbl.style.visibility = 'visible'; optLbl.innerText = isEn ? 'Optional Subject' : 'ঐচ্ছিক বিষয়'; }
                if (optCol) optCol.style.visibility = 'visible';
                optVal.style.visibility = 'visible';
                optVal.innerText = isEn ? optInfo.name : optInfo.nameBn;
            } else {
                if (optLbl) optLbl.style.visibility = 'hidden';
                if (optCol) optCol.style.visibility = 'hidden';
                optVal.style.visibility = 'hidden';
                optVal.innerText = '—';
            }
        }'''

    if old_sync_m1 in content:
        content = content.replace(old_sync_m1, new_sync_m1, 1)
        print("[Marksheet1.html] Updated syncCascadingFilters profile meta")
    else:
        print("[Marksheet1.html] ERROR: old_sync_m1 not found")

    # 7. Update generateMarksheet1CardHTML for batch cards
    old_card_fn = '''function generateMarksheet1CardHTML(student, selectedClass, selectedSection, exam, rankNum) {
    const examDist = getExamDistribution(exam, selectedClass);
    const normClass = normalizeClassString(selectedClass);
    const normSec = normalizeSectionString(selectedSection);
    const isSecondary = ['9', '10'].includes(normClass);
    const relInfo = getStudentReligionInfo(student);
    const optInfo = getStudentOptionalSubjectInfo(student, normSec);

    const studentName = student.nameBn || student.name || 'শিক্ষার্থী';
    const rollNo = student.roll || student.rollNo || String(rankNum);
    const studentId = getEffectiveStudentId(student, selectedClass, rankNum);'''

    new_card_fn = '''function generateMarksheet1CardHTML(student, selectedClass, selectedSection, exam, rankNum) {
    const isEn = (currentLanguage === 'en');
    const examDist = getExamDistribution(exam, selectedClass);
    const normClass = normalizeClassString(selectedClass);
    const normSec = normalizeSectionString(selectedSection);
    const isSecondary = ['9', '10'].includes(normClass);
    const relInfo = getStudentReligionInfo(student);
    const optInfo = getStudentOptionalSubjectInfo(student, normSec);

    const studentName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
    const rollNo = student ? (student.roll || student.rollNo || rankNum) : rankNum;
    const studentId = getEffectiveStudentId(student, selectedClass, rankNum);
    const displayCls = getDisplayClassName(selectedClass);
    const displaySec = isEn ? getEnglishSectionName(selectedSection) : (selectedSection || 'বিজ্ঞান');
    const displayExam = getDisplayExamName(exam);
    const displayRel = isEn ? (relInfo.en || 'Islam') : relInfo.display;
    const displayOpt = isEn ? optInfo.name : optInfo.nameBn;'''

    if old_card_fn in content:
        content = content.replace(old_card_fn, new_card_fn, 1)
        print("[Marksheet1.html] Updated generateMarksheet1CardHTML top")
    else:
        print("[Marksheet1.html] ERROR: old_card_fn not found")

    # In generateMarksheet1CardHTML: group headers
    content = content.replace(
        '`<tr class="group-header-row"><td colspan="9">১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)</td></tr>`',
        '`<tr class="group-header-row"><td colspan="9">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`',
        1
    )
    content = content.replace(
        '`<tr class="group-header-row"><td colspan="9">২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)</td></tr>`',
        '`<tr class="group-header-row"><td colspan="9">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`',
        1
    )
    content = content.replace(
        '`<tr class="group-header-row"><td colspan="9">৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)</td></tr>`',
        '`<tr class="group-header-row"><td colspan="9">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`',
        1
    )

    # In generateMarksheet1CardHTML: paired rows
    old_c_paired = '''                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : '<span class="blank-field">—</span>';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '<span class="blank-field">—</span>');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '<span class="blank-field">—</span>');
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
                <td>${toBnDigits(sub.pairFull || sub.fullMarks)}</td>'''

    new_c_paired = '''                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const p1TotDisplay = sub.hasMarks ? formatDigits(m1) : '<span class="blank-field">—</span>';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '<span class="blank-field">—</span>');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '<span class="blank-field">—</span>';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '<span class="blank-field">—</span>');
                    const p2TotDisplay = sub.pairHasMarks ? formatDigits(m2) : '<span class="blank-field">—</span>';

            const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '<span class="blank-field">—</span>';
            const combGradeDisplay = hasPaperMarks ? res.grade : '—';
            const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            tableHtml += `<tr>
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
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>'''

    if old_c_paired in content:
        content = content.replace(old_c_paired, new_c_paired, 1)
        print("[Marksheet1.html] Updated paired rows in generateMarksheet1CardHTML")
    else:
        print("[Marksheet1.html] ERROR: old_c_paired not found")

    # In generateMarksheet1CardHTML: single rows
    old_c_single = '''                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '<span class="blank-field">—</span>');
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
            </tr>`;'''

    new_c_single = '''                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '<span class="blank-field">—</span>');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '<span class="blank-field">—</span>';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '<span class="blank-field">—</span>');
                    const totDisplay = sub.hasMarks ? formatDigits(tot) : '<span class="blank-field">—</span>';
            const gradeDisplay = sub.hasMarks ? res.grade : '—';
            const gpDisplay = sub.hasMarks ? formatDigits(res.gp.toFixed(2)) : '<span class="blank-field">—</span>';

            tableHtml += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${getDisplaySubjectName(sub.name)}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;'''

    if old_c_single in content:
        content = content.replace(old_c_single, new_c_single, 1)
        print("[Marksheet1.html] Updated single rows in generateMarksheet1CardHTML")
    else:
        print("[Marksheet1.html] ERROR: old_c_single not found")

    # In generateMarksheet1CardHTML: bottom summaries
    old_c_bottom = '''    const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(boundedGpa.toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';
    const rankStr = toBnDigits(rankNum);'''

    new_c_bottom = '''    const zeroGpaStr = isEn ? '0.00' : '০.০০';
    const finalGpaStr = hasAnyMarks ? (hasFailed ? zeroGpaStr : formatDigits(boundedGpa.toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';
    const rankStr = formatDigits(rankNum);'''

    if old_c_bottom in content:
        content = content.replace(old_c_bottom, new_c_bottom, 1)
        print("[Marksheet1.html] Updated bottom summaries in generateMarksheet1CardHTML")
    else:
        print("[Marksheet1.html] ERROR: old_c_bottom not found")

    # In generateMarksheet1CardHTML: card markup labels and values
    content = content.replace('<span class="report-pill-title">${exam}</span>', '<span class="report-pill-title">${displayExam}</span>', 1)
    content = content.replace('<td class="p-label" id="p-label-name" style="font-size: 15.1px; font-weight: 800;">শিক্ষার্থীর নাম</td>', '<td class="p-label" id="p-label-name" style="font-size: 15.1px; font-weight: 800;">${isEn ? "Student Name" : "শিক্ষার্থীর নাম"}</td>', 1)
    content = content.replace('<td class="p-label" id="p-label-class">শ্রেণি</td>', '<td class="p-label" id="p-label-class">${isEn ? "Class" : "শ্রেণি"}</td>', 1)
    content = content.replace('<td class="p-val" style="width: 25%;">${selectedClass}</td>', '<td class="p-val" style="width: 25%;">${displayCls}</td>', 1)
    content = content.replace('<td class="p-label" id="p-label-section" style="padding-left: 15px;"> শাখা / গ্রুপ</td>', '<td class="p-label" id="p-label-section" style="padding-left: 15px;">${isEn ? "Section / Group" : "শাখা / গ্রুপ"}</td>', 1)
    content = content.replace('<td class="p-val">${selectedSection}</td>', '<td class="p-val">${displaySec}</td>', 1)
    content = content.replace('<td class="p-label" id="p-label-id">আইডি / রেজি</td>', '<td class="p-label" id="p-label-id">${isEn ? "ID / Reg" : "আইডি / রেজি"}</td>', 1)
    content = content.replace('<td class="p-val">${toBnDigits(studentId)}</td>', '<td class="p-val">${formatDigits(studentId)}</td>', 1)
    content = content.replace('<td class="p-label" id="p-label-roll" style="padding-left: 15px;">রোল নং</td>', '<td class="p-label" id="p-label-roll" style="padding-left: 15px;">${isEn ? "Roll No" : "রোল নং"}</td>', 1)
    content = content.replace('<td class="p-val">${toBnDigits(String(rollNo).padStart(2, \'0\'))}</td>', '<td class="p-val">${formatDigits(String(rollNo).padStart(2, \'0\'))}</td>', 1)
    content = content.replace('<td class="p-label" id="p-label-religion">ধর্ম (Religion)</td>', '<td class="p-label" id="p-label-religion">${isEn ? "Religion" : "ধর্ম (Religion)"}</td>', 1)
    content = content.replace('<td class="p-val">${relInfo.display}</td>', '<td class="p-val">${displayRel}</td>', 1)
    content = content.replace('<td class="p-label" style="padding-left: 15px;">ঐচ্ছিক বিষয়</td>', '<td class="p-label" style="padding-left: 15px;">${isEn ? "Optional Subject" : "ঐচ্ছিক বিষয়"}</td>', 1)
    content = content.replace('<td class="p-val">${optInfo.nameBn}</td>', '<td class="p-val">${displayOpt}</td>', 1)

    # Card legend title & headers
    content = content.replace('<div class="legend-title" id="legend-title-1">গ্রেডিং নির্দেশিকা (Grading Scale)</div>', '<div class="legend-title" id="legend-title-1">${isEn ? "Grading Scale" : "গ্রেডিং নির্দেশিকা (Grading Scale)"}</div>', 1)
    old_c_leg_head = '''                                <tr>
                                    <th>নম্বর সীমা</th>
                                    <th>গ্রেড</th>
                                    <th>পয়েন্ট</th>
                                </tr>'''
    new_c_leg_head = '''                                <tr>
                                    <th>${isEn ? "Marks Range" : "নম্বর সীমা"}</th>
                                    <th>${isEn ? "Grade" : "গ্রেড"}</th>
                                    <th>${isEn ? "GPA" : "পয়েন্ট"}</th>
                                </tr>'''
    content = content.replace(old_c_leg_head, new_c_leg_head, 1)

    # Card transcript table headers
    old_c_th = '''                    <tr>
                        <th rowspan="2" id="th-header-sub-1" style="width: 27%;">পাঠ্য বিষয়সমূহ</th>
                        <th rowspan="2" id="th-header-full-1" style="width: 8%;">পূর্ণমান</th>
                        <th colspan="3" id="th-header-obtained-1" style="width: 25%;">প্রাপ্ত নম্বর</th>
                        <th rowspan="2" style="width: 9%;">মোট নম্বর (${toBnDigits(examDist.total)})</th>
                        <th rowspan="2" id="th-header-combined-1" style="width: 11%;">সর্বমোট</th>
                        <th rowspan="2" id="th-header-grade-1" style="width: 9%;">লেটার গ্রেড</th>
                        <th rowspan="2" id="th-header-gp-1" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>
                    </tr>
                    <tr>
                        <th style="width: 8%;">বহুনির্বাচনি (${toBnDigits(examDist.mcq)})</th>
                        <th style="width: 8%;">লিখিত (${toBnDigits(examDist.cq)})</th>
                        <th style="width: 9%;">ব্যবহারিক (${toBnDigits(examDist.prac)})</th>
                    </tr>'''

    new_c_th = '''                    <tr>
                        <th rowspan="2" id="th-header-sub-1" style="width: 27%;">${isEn ? "Subjects" : "পাঠ্য বিষয়সমূহ"}</th>
                        <th rowspan="2" id="th-header-full-1" style="width: 8%;">${isEn ? "Full Marks" : "পূর্ণমান"}</th>
                        <th colspan="3" id="th-header-obtained-1" style="width: 25%;">${isEn ? "Marks Obtained" : "প্রাপ্ত নম্বর"}</th>
                        <th rowspan="2" style="width: 9%;">${isEn ? "Total (" + formatDigits(examDist.total) + ")" : "মোট নম্বর (" + formatDigits(examDist.total) + ")"}</th>
                        <th rowspan="2" id="th-header-combined-1" style="width: 11%;">${isEn ? "Grand Total" : "সর্বমোট"}</th>
                        <th rowspan="2" id="th-header-grade-1" style="width: 9%;">${isEn ? "Letter Grade" : "লেটার গ্রেড"}</th>
                        <th rowspan="2" id="th-header-gp-1" style="width: 11%;">${isEn ? "Grade Point (GP)" : "গ্রেড পয়েন্ট (GP)"}</th>
                    </tr>
                    <tr>
                        <th style="width: 8%;">${isEn ? "MCQ (" + formatDigits(examDist.mcq) + ")" : "বহুনির্বাচনি (" + formatDigits(examDist.mcq) + ")"}</th>
                        <th style="width: 8%;">${isEn ? "CQ (" + formatDigits(examDist.cq) + ")" : "লিখিত (" + formatDigits(examDist.cq) + ")"}</th>
                        <th style="width: 9%;">${isEn ? "Prac. (" + formatDigits(examDist.prac) + ")" : "ব্যবহারিক (" + formatDigits(examDist.prac) + ")"}</th>
                    </tr>'''
    content = content.replace(old_c_th, new_c_th, 1)

    # Card KPI row
    content = content.replace('<div class="kpi-label" id="kpi-label-total">সর্বমোট প্রাপ্ত নম্বর</div>', '<div class="kpi-label" id="kpi-label-total">${isEn ? "Total Marks Obtained" : "সর্বমোট প্রাপ্ত নম্বর"}</div>', 1)
    content = content.replace('<div class="kpi-value">${hasAnyMarks ? (toBnDigits(grandTotal) + \' / \' + toBnDigits(totalFullMarks)) : \'—\'}</div>', '<div class="kpi-value">${hasAnyMarks ? (formatDigits(grandTotal) + \' / \' + formatDigits(totalFullMarks)) : \'—\'}</div>', 1)
    content = content.replace('<div class="kpi-label" id="kpi-label-gpa">জিপিএ (GPA)</div>', '<div class="kpi-label" id="kpi-label-gpa">${isEn ? "GPA" : "জিপিএ (GPA)"}</div>', 1)
    content = content.replace('<div class="kpi-label" id="kpi-label-grade">চূড়ান্ত গ্রেড</div>', '<div class="kpi-label" id="kpi-label-grade">${isEn ? "Final Grade" : "চূড়ান্ত গ্রেড"}</div>', 1)
    content = content.replace('<div class="kpi-label" id="kpi-label-pos">মেধাক্রম (Merit Position)</div>', '<div class="kpi-label" id="kpi-label-pos">${isEn ? "Merit Position" : "মেধাক্রম (Merit Position)"}</div>', 1)

    # Card signatures
    content = content.replace('<div class="sig-border" id="label-sig-guardian-1">অভিভাবকের স্বাক্ষর</div>', '<div class="sig-border" id="label-sig-guardian-1">${isEn ? "Guardian\'s Signature" : "অভিভাবকের স্বাক্ষর"}</div>', 1)
    content = content.replace('<div class="sig-border" id="label-sig-teacher-1">শ্রেণি শিক্ষকের স্বাক্ষর</div>', '<div class="sig-border" id="label-sig-teacher-1">${isEn ? "Class Teacher\'s Signature" : "শ্রেণি শিক্ষকের স্বাক্ষর"}</div>', 1)
    content = content.replace('<div class="sig-border" id="label-sig-head-1">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>', '<div class="sig-border" id="label-sig-head-1">${isEn ? "Head Teacher\'s Signature & Seal" : "প্রধান শিক্ষকের স্বাক্ষর ও সিল"}</div>', 1)

    # 8. Update switchTemplate in Marksheet1.html to pass &lang=
    old_switch = '''function switchTemplate(val) {
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

    new_switch = '''function switchTemplate(val) {
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

    if old_switch in content:
        content = content.replace(old_switch, new_switch, 1)
        print("[Marksheet1.html] Updated switchTemplate with &lang=")
    else:
        print("[Marksheet1.html] ERROR: old_switch not found")

    # 9. Update DOMContentLoaded in Marksheet1.html
    old_init = '''    syncSchoolHeaderInfo();
    syncCascadingFilters('all');
});'''

    new_init = '''    syncSchoolHeaderInfo();
    updateLanguageUI1();
    syncCascadingFilters('all');
});'''

    if old_init in content:
        content = content.replace(old_init, new_init, 1)
        print("[Marksheet1.html] Added updateLanguageUI1 to DOMContentLoaded")
    else:
        print("[Marksheet1.html] ERROR: old_init not found")

    # Search input display in DOMContentLoaded
    old_init_search = "input.value = `[রোল ${toBnDigits(found.roll || '১')}] ${found.nameBn || found.name || 'শিক্ষার্থী'}`;"
    new_init_search = "input.value = currentLanguage === 'en' ? `[Roll ${formatDigits(found.roll || '1')}] ${found.nameEn || found.nameBn || found.name || 'Student'}` : `[রোল ${toBnDigits(found.roll || '১')}] ${found.nameBn || found.name || 'শিক্ষার্থী'}`;"
    if old_init_search in content:
        content = content.replace(old_init_search, new_init_search, 1)
        print("[Marksheet1.html] Updated search input in DOMContentLoaded")

    with open('Marksheet1.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[Marksheet1.html] Completed update successfully")

update_marksheet1()

import re

with open('Marksheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace generateMarksheetCardHTML body
pattern = re.compile(
    r"function generateMarksheetCardHTML\(student, selectedClass, selectedSection, exam, rankNum\) \{[\s\S]*?return `\s*<div class=\"mark-sheet-container\"[\s\S]*?<\/div>`;\s*\}",
    re.MULTILINE
)

new_func = """function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {
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
            const displaySec = isEn ? getEnglishSectionName(selectedSection) : (selectedSection || 'ক');
            const examBadgeTitle = getDisplayExamName(exam);
            const displayRel = isEn ? (relInfo.en || 'Islam') : relInfo.display;
            const displayOpt = isEn ? optInfo.name : optInfo.nameBn;

            let rawSettings = localStorage.getItem('school_settings');
            let settings = {};
            if (rawSettings) { try { settings = JSON.parse(rawSettings); } catch(e) {} }
            const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়";
            const addressText = settings.schoolAddress || "মাথাভাঙ্গা, জলঢাকা, নীলফামারী।";
            const customLogo = localStorage.getItem('school_logo') || (settings && settings.schoolLogo) || 'school_logo.svg';

            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);

            let tableHtml = '';
            let grandTotal = 0;
            let totalFullMarks = 0;
            let totalGP = 0;
            let subjectCount = 0;
            let hasFailed = false;
            let hasAnyMarks = false;

            let mainSubjectsGP = 0;
            let mainSubjectCount = 0;
            let optionalBonusGP = 0;

            subjects.forEach(sub => {
                const isOpt = !!(sub.isOptional || sub.group === 'optional');
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
                        if (isOpt) {
                            if (res.gp > 2.00) optionalBonusGP += (res.gp - 2.00);
                        } else {
                            mainSubjectsGP += res.gp;
                            mainSubjectCount++;
                            if (res.gp === 0) hasFailed = true;
                        }
                    }

                    const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
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
                        <td class="subject-col">${getDisplaySubjectName(sub.name)}</td>
                        <td>${p1McqDisplay}</td>
                        <td>${p1CqDisplay}</td>
                        <td>${p1PrDisplay}</td>
                        <td>${p1TotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combTotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold;">${combGradeDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combGpDisplay}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${getDisplaySubjectName(sub.pairWith)}</td>
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
                        if (isOpt) {
                            if (res.gp > 2.00) optionalBonusGP += (res.gp - 2.00);
                        } else {
                            mainSubjectsGP += res.gp;
                            mainSubjectCount++;
                            if (res.gp === 0) hasFailed = true;
                        }
                    }

                    const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const totDisplay = sub.hasMarks ? formatDigits(tot) : '—';
                    const gradeDisplay = sub.hasMarks ? res.grade : '—';
                    const gpDisplay = sub.hasMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    tableHtml += `<tr>
                        <td class="subject-col">${getDisplaySubjectName(sub.name)}</td>
                        <td>${mcqDisplay}</td>
                        <td>${cqDisplay}</td>
                        <td>${prDisplay}</td>
                        <td>${totDisplay}</td>
                        <td style="font-weight: bold; background: #f8fafc;">${totDisplay}</td>
                        <td style="font-weight: bold;">${gradeDisplay}</td>
                        <td style="font-weight: bold; background: #f8fafc;">${gpDisplay}</td>
                    </tr>`;
                }
            });

            if (mainSubjectCount === 0) mainSubjectCount = subjectCount || 1;
            const maxGP = getMaxScaleGP();
            const rawGpa = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
            const boundedGpa = Math.min(maxGP, rawGpa);
            const zeroGpaStr = isEn ? '0.00' : '০.০০';
            const finalGpaStr = hasAnyMarks ? (hasFailed ? zeroGpaStr : formatDigits(boundedGpa.toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';
            const rankStr = formatDigits(rankNum);

            return `
            <div class="mark-sheet-container" style="margin-bottom: 25px;">
                <div class="mark-sheet-border">
                    <!-- Header Section -->
                    <div class="header-section">
                        ${getGradingScaleTableHTML()}

                        <div class="header-center">
                            <h1 class="school-name">${schoolName}</h1>
                            <p class="address">${addressText}</p>
                            <div class="logo">
                                <img src="${customLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;">
                            </div>
                            <div class="exam-badge">${examBadgeTitle}</div>
                        </div>
                    </div>

                    <!-- Student Info Section -->
                    <div class="student-info">
                        <div style="flex: 1.1;">
                            <div class="info-row">
                                <div class="info-label">${isEn ? "Student Name" : "শিক্ষার্থীর নাম"}</div>
                                <div>: <span>${studentName}</span></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">${isEn ? "Roll No" : "রোল নং"}</div>
                                <div>: <span>${formatDigits(rollNo)}</span></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">${isEn ? "Class" : "শ্রেণি"}</div>
                                <div>: <span>${displayCls}</span> <span class="branch-info" style="margin-left: 20px;">${isEn ? "Section = " + displaySec : "শাখা = " + displaySec}</span></div>
                            </div>
                        </div>
                        <div style="flex: 0.9; padding-left: 20px;">
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">${isEn ? "Religion" : "ধর্ম (Religion)"}</div>
                                <div>: <span>${displayRel}</span></div>
                            </div>
                            ${isSecondary ? `
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">${isEn ? "Optional (4th)" : "ঐচ্ছিক বিষয় (৪র্থ)"}</div>
                                <div>: <span>${displayOpt}</span></div>
                            </div>` : ''}
                            <div class="info-row">
                                <div class="info-label" style="width: 125px;">${isEn ? "Student ID" : "শিক্ষার্থী আইডি"}</div>
                                <div>: <span>${formatDigits(studentId)}</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Marks Table -->
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th class="subject-col">${isEn ? "Subject" : "বিষয়"}</th>
                                <th>${isEn ? "MCQ (" + formatDigits(examDist.mcq) + ")" : "বহুনির্বাচনি (" + formatDigits(examDist.mcq) + ")"}</th>
                                <th>${isEn ? "CQ (" + formatDigits(examDist.cq) + ")" : "লিখিত (" + formatDigits(examDist.cq) + ")"}</th>
                                <th>${isEn ? "Practical (" + formatDigits(examDist.prac) + ")" : "ব্যবহারিক (" + formatDigits(examDist.prac) + ")"}</th>
                                <th>${isEn ? "Total (" + formatDigits(examDist.total) + ")" : "মোট (" + formatDigits(examDist.total) + ")"}</th>
                                <th>${isEn ? "Total" : "সর্বমোট"}</th>
                                <th>${isEn ? "Grade" : "গ্রেড"}</th>
                                <th>${isEn ? "GPA" : "পয়েন্ট"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableHtml}
                        </tbody>
                    </table>

                    <!-- Bottom Tables -->
                    <div class="bottom-section">
                        <table class="rank-table">
                            <tr>
                                <td style="width: 50%;">${isEn ? "Rank" : "স্থান"}</td>
                                <td style="width: 50%;">${rankStr}</td>
                            </tr>
                        </table>

                        <table class="summary-table">
                            <tr>
                                <td style="width: 50%;">${isEn ? "Total Marks" : "সর্বমোট"}</td>
                                <td style="width: 50%;">${hasAnyMarks ? formatDigits(grandTotal) : '—'}</td>
                            </tr>
                            <tr>
                                <td>${isEn ? "GPA" : "পয়েন্ট"}</td>
                                <td>${finalGpaStr}</td>
                            </tr>
                            <tr>
                                <td>${isEn ? "Grade" : "গ্রেড"}</td>
                                <td>${finalGrade}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Signatures Section -->
                    <div class="signatures">
                        <div class="sig-col">
                            <div class="sig-line"></div>
                            <div class="sig-label">${isEn ? "Guardian's Signature" : "অভিভাবকের স্বাক্ষর"}</div>
                        </div>
                        <div class="sig-col">
                            <div class="sig-line"></div>
                            <div class="sig-label">${isEn ? "Headmaster's Signature" : "প্রধান শিক্ষকের স্বাক্ষর"}</div>
                        </div>
                    </div>
                </div>
            </div>`;
        }"""

if pattern.search(content):
    content = pattern.sub(new_func, content, count=1)
    with open('Marksheet.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[Marksheet.html] Successfully updated generateMarksheetCardHTML!")
else:
    print("[Marksheet.html] ERROR: pattern not matched")

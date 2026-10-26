import re

# 1. Update Marksheet.html
with open('Marksheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Marker 1: Grading functions block
old_grading_marker_start = '        // Dynamic Grading Scale loader from "Marking System" (school_marking_system)'
old_grading_marker_end = '        function renderGradingScaleLegend() {'

idx1 = content.find(old_grading_marker_start)
idx2 = content.find(old_grading_marker_end)

if idx1 == -1 or idx2 == -1:
    raise Exception(f"Marksheet grading markers not found: idx1={idx1}, idx2={idx2}")

new_grading_block = '''        // Dynamic Grading Scale loader from "Marking System" (school_marking_system) - strictly aligned with Tabulation Sheet
        function loadMarkingSystem() {
            let rules = null;
            try {
                const str = localStorage.getItem('school_marking_system');
                if (str) rules = JSON.parse(str);
            } catch (e) { }
            if (!Array.isArray(rules) || rules.length === 0) {
                try {
                    localStorage.setItem('school_marking_system', JSON.stringify(DEFAULT_GRADE_RULES));
                } catch (e) { }
                return DEFAULT_GRADE_RULES.map(r => ({ ...r }));
            }
            return rules.map(r => ({
                id: r.id || '',
                name: (r.name || '').trim(),
                min: parseFloat(r.min) || 0,
                max: parseFloat(r.max) || 0,
                gp: parseFloat(r.gp) || 0
            })).sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
        }

        // Get Pass Mark Percentage dynamically from Exam Types (school_exam_types) - strictly aligned with Tabulation Sheet
        function getExamPassMarkPercent(examName) {
            try {
                const raw = localStorage.getItem('school_exam_types');
                if (raw) {
                    const exTypes = JSON.parse(raw);
                    if (Array.isArray(exTypes)) {
                        const matched = exTypes.find(t => isExamMatch(t.name, examName));
                        if (matched && matched.passMarkPercent !== undefined && !isNaN(matched.passMarkPercent)) {
                            return Number(matched.passMarkPercent);
                        }
                    }
                }
            } catch (e) { }
            return 33;
        }

        // Component-wise pass check - strictly aligned with Tabulation Sheet
        function checkComponentPass(mark, fullMarks, passPct = 33) {
            if (!fullMarks || fullMarks <= 0) return true; // Component not attached
            if (mark === null || mark === undefined || isNaN(mark)) return false; // Absent / missing
            const minPass = Math.round(fullMarks * (passPct / 100));
            return (mark >= minPass) || ((mark / fullMarks) * 100 >= passPct);
        }

        // Helper to check if a mark represents Absent - strictly aligned with Tabulation Sheet
        function isAbsentValue(v) {
            if (v === null || v === undefined) return false;
            const str = String(v).trim().toUpperCase();
            return str === 'A' || str === 'ABS';
        }

        // Grade for Percentage - strictly aligned with Tabulation Sheet
        function getGradeForPercentage(pct, passMarkPercent = null) {
            if (isNaN(pct) || pct === null) {
                return { name: '-', gp: 0.0 };
            }
            const rules = loadMarkingSystem();
            const sortedRules = (Array.isArray(rules) && rules.length > 0 ? [...rules] : [...DEFAULT_GRADE_RULES]).sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
            const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: "F", gp: 0.0 };
            const passingRules = sortedRules.filter(r => parseFloat(r.gp) > 0 && r.name !== 'F');
            const minPassingPct = (passMarkPercent !== null && !isNaN(passMarkPercent))
                ? passMarkPercent
                : (passingRules.length > 0 ? Math.min(...passingRules.map(r => r.min)) : 33);

            if (pct < minPassingPct) {
                return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
            }

            let match = sortedRules.find(r => pct >= parseFloat(r.min) && pct <= parseFloat(r.max));
            if (!match) {
                match = sortedRules.find(r => (pct + 0.001) >= parseFloat(r.min));
            }
            if (match && parseFloat(match.gp) > 0 && match.name !== 'F') {
                return { name: match.name, gp: parseFloat(match.gp) };
            }
            return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
        }

        // Grade for GPA - strictly aligned with Tabulation Sheet
        function getGradeForGPA(gpa) {
            const rules = loadMarkingSystem();
            const sortedRules = (Array.isArray(rules) && rules.length > 0 ? [...rules] : [...DEFAULT_GRADE_RULES]).sort((a, b) => (parseFloat(b.gp) || 0) - (parseFloat(a.gp) || 0));
            const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: "F", gp: 0.0 };
            const passingRules = sortedRules.filter(r => parseFloat(r.gp) > 0 && r.name !== 'F');
            const minPassingGP = passingRules.length > 0 ? Math.min(...passingRules.map(r => r.gp)) : 1.0;

            if (isNaN(gpa) || gpa < minPassingGP) {
                return failRule.name;
            }

            let match = sortedRules.find(r => (gpa + 0.001) >= parseFloat(r.gp));
            return match ? match.name : failRule.name;
        }

        // Calculate Grade & GP dynamically based on Grading Scale (% Percentage Scale) & full marks
        function calculateGradeAndGP(marks, fullMarks = 100, passMarkPercent = null) {
            if (marks === null || marks === undefined || isNaN(marks)) {
                return { grade: 'F', gp: 0.00 };
            }
            const fMarks = Number(fullMarks) > 0 ? Number(fullMarks) : 100;
            const pct = (Number(marks) / fMarks) * 100;
            const res = getGradeForPercentage(pct, passMarkPercent);
            return { grade: res.name, gp: res.gp };
        }

        function getMaxScaleGP() {
            const rules = loadMarkingSystem();
            const gps = rules.map(r => parseFloat(r.gp) || 0);
            return gps.length > 0 ? Math.max(...gps, 1.0) : 5.00;
        }

        function getFinalGradeFromGPA(gpa, isFailed) {
            const rules = loadMarkingSystem();
            const sortedRules = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
            const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0.0 };
            if (isFailed || gpa <= 0) return failRule.name;
            return getGradeForGPA(gpa);
        }

        // Evaluate single or combined subject according to Tabulation Sheet component-pass & absent policy
        function evaluateSubjectRow(sub, exam, selectedClass, passPct, failRule) {
            if (sub.isCombined) {
                const hasMarks = !!(sub.hasMarks || sub.pairHasMarks);
                if (!hasMarks) {
                    return { hasMarks: false, grade: '—', gp: 0.0, isAbsent: false, isFail: false, total: null, fullMarks: 0, p1Total: null, p2Total: null };
                }

                const isAbsent = !!(sub.isAbsent || sub.pairIsAbsent || isAbsentValue(sub.mcq) || isAbsentValue(sub.cq) || isAbsentValue(sub.pr) || isAbsentValue(sub.pairMcq) || isAbsentValue(sub.pairCq) || isAbsentValue(sub.pairPr));

                const p1Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                const p2Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, true);

                const p1Full = p1Dist.total || sub.fullMarks || 100;
                const p2Full = p2Dist.total || sub.pairFull || 100;
                const combFull = p1Full + p2Full;

                const p1Mcq = isAbsentValue(sub.mcq) ? 0 : ((sub.mcq !== '' && sub.mcq !== null && !isNaN(sub.mcq)) ? Number(sub.mcq) : 0);
                const p1Cq = isAbsentValue(sub.cq) ? 0 : ((sub.cq !== '' && sub.cq !== null && !isNaN(sub.cq)) ? Number(sub.cq) : 0);
                const p1Pr = isAbsentValue(sub.pr) ? 0 : ((sub.pr !== '' && sub.pr !== null && !isNaN(sub.pr)) ? Number(sub.pr) : 0);
                const p1Tot = (sub.total !== null && !isNaN(sub.total)) ? Number(sub.total) : (p1Mcq + p1Cq + p1Pr);

                const p2Mcq = isAbsentValue(sub.pairMcq) ? 0 : ((sub.pairMcq !== '' && sub.pairMcq !== null && !isNaN(sub.pairMcq)) ? Number(sub.pairMcq) : 0);
                const p2Cq = isAbsentValue(sub.pairCq) ? 0 : ((sub.pairCq !== '' && sub.pairCq !== null && !isNaN(sub.pairCq)) ? Number(sub.pairCq) : 0);
                const p2Pr = isAbsentValue(sub.pairPr) ? 0 : ((sub.pairPr !== '' && sub.pairPr !== null && !isNaN(sub.pairPr)) ? Number(sub.pairPr) : 0);
                const p2Tot = (sub.pairTotal !== null && !isNaN(sub.pairTotal)) ? Number(sub.pairTotal) : (p2Mcq + p2Cq + p2Pr);

                const combTotal = p1Tot + p2Tot;
                const combMcqFull = (p1Dist.mcq || 0) + (p2Dist.mcq || 0);
                const combCqFull = (p1Dist.cq || 0) + (p2Dist.cq || 0);
                const combPracFull = (p1Dist.prac || 0) + (p2Dist.prac || 0);

                const totalMcq = p1Mcq + p2Mcq;
                const totalCq = p1Cq + p2Cq;
                const totalPr = p1Pr + p2Pr;

                const mcqPass = (combMcqFull <= 0) || checkComponentPass(totalMcq, combMcqFull, passPct);
                const cqPass = (combCqFull <= 0) || checkComponentPass(totalCq, combCqFull, passPct);
                const pracPass = (combPracFull <= 0) || checkComponentPass(totalPr, combPracFull, passPct);
                const pct = combFull > 0 ? (combTotal / combFull) * 100 : 0;

                const overallPass = !isAbsent && mcqPass && cqPass && pracPass && (pct >= passPct);

                if (isAbsent) {
                    return { hasMarks: true, grade: 'A', gp: 0.0, isAbsent: true, isFail: false, total: combTotal, fullMarks: combFull, p1Total: p1Tot, p2Total: p2Tot };
                } else if (!overallPass) {
                    return { hasMarks: true, grade: failRule.name || 'F', gp: 0.0, isAbsent: false, isFail: true, total: combTotal, fullMarks: combFull, p1Total: p1Tot, p2Total: p2Tot };
                } else {
                    const gr = getGradeForPercentage(pct, passPct);
                    return { hasMarks: true, grade: gr.name, gp: gr.gp, isAbsent: false, isFail: false, total: combTotal, fullMarks: combFull, p1Total: p1Tot, p2Total: p2Tot };
                }
            } else {
                const hasMarks = !!(sub.hasMarks || sub.total !== null || sub.mcq !== '' || sub.cq !== '' || sub.pr !== '');
                if (!hasMarks) {
                    return { hasMarks: false, grade: '—', gp: 0.0, isAbsent: false, isFail: false, total: null, fullMarks: sub.fullMarks || 100 };
                }

                const isAbsent = !!(sub.isAbsent || isAbsentValue(sub.mcq) || isAbsentValue(sub.cq) || isAbsentValue(sub.pr));

                const dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                const fullMarks = dist.total || sub.fullMarks || 100;
                const mcqFull = dist.mcq || 0;
                const cqFull = dist.cq || 0;
                const pracFull = dist.prac || 0;

                const mcqVal = isAbsentValue(sub.mcq) ? 0 : ((sub.mcq !== '' && sub.mcq !== null && !isNaN(sub.mcq)) ? Number(sub.mcq) : 0);
                const cqVal = isAbsentValue(sub.cq) ? 0 : ((sub.cq !== '' && sub.cq !== null && !isNaN(sub.cq)) ? Number(sub.cq) : 0);
                const prVal = isAbsentValue(sub.pr) ? 0 : ((sub.pr !== '' && sub.pr !== null && !isNaN(sub.pr)) ? Number(sub.pr) : 0);
                const tot = (sub.total !== null && !isNaN(sub.total)) ? Number(sub.total) : (mcqVal + cqVal + prVal);

                const mcqPass = (mcqFull <= 0) || checkComponentPass(mcqVal, mcqFull, passPct);
                const cqPass = (cqFull <= 0) || checkComponentPass(cqVal, cqFull, passPct);
                const pracPass = (pracFull <= 0) || checkComponentPass(prVal, pracFull, passPct);
                const pct = fullMarks > 0 ? (tot / fullMarks) * 100 : 0;

                const overallPass = !isAbsent && mcqPass && cqPass && pracPass && (pct >= passPct);

                if (isAbsent) {
                    return { hasMarks: true, grade: 'A', gp: 0.0, isAbsent: true, isFail: false, total: tot, fullMarks: fullMarks };
                } else if (!overallPass) {
                    return { hasMarks: true, grade: failRule.name || 'F', gp: 0.0, isAbsent: false, isFail: true, total: tot, fullMarks: fullMarks };
                } else {
                    const gr = getGradeForPercentage(pct, passPct);
                    return { hasMarks: true, grade: gr.name, gp: gr.gp, isAbsent: false, isFail: false, total: tot, fullMarks: fullMarks };
                }
            }
        }

        // Calculate Overall Marksheet Summary strictly aligned with Tabulation Sheet policy
        function calculateOverallMarksheetSummary(subjects, exam, selectedClass) {
            const rules = loadMarkingSystem();
            const failRule = rules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0.0 };
            const passPct = getExamPassMarkPercent(exam);
            const maxScaleGP = Math.max(...rules.map(r => parseFloat(r.gp) || 0), 1.0);

            // Find minimum percentage for GP 2.00 (defaults to 40) from active scale
            const ruleFor2GP = rules.find(r => parseFloat(r.gp) === 2.00) || { min: 40 };
            const optBaseDeductPct = parseFloat(ruleFor2GP.min) || 40;

            let currentGPACalcMethod = 'gpa';
            try {
                currentGPACalcMethod = localStorage.getItem('tabulation_gpa_method') || 'gpa';
            } catch (e) { }

            let grandTotal = 0;
            let totalFullMarks = 0;
            let mainSubjectsGP = 0;
            let mainSubjectCount = 0;
            let mainSubjectsFullMarks = 0;
            let optionalBonusGP = 0;
            let optionalBonusMarks = 0;
            let failsCount = 0;
            let hasAnyAbsent = false;
            let hasAnyMarks = false;

            const evaluatedSubjects = subjects.map(sub => {
                const res = evaluateSubjectRow(sub, exam, selectedClass, passPct, failRule);
                const isOpt = !!(sub.isOptional || sub.group === 'optional');

                if (res.hasMarks) {
                    hasAnyMarks = true;
                    totalFullMarks += res.fullMarks;

                    if (isOpt) {
                        const optFull = res.fullMarks || 100;
                        const optBaseDeductMarks = (optBaseDeductPct / 100) * optFull;
                        if (!res.isAbsent) {
                            if (res.gp > 2.00) {
                                optionalBonusGP += (res.gp - 2.00);
                            }
                            if (res.total > optBaseDeductMarks) {
                                optionalBonusMarks += (res.total - optBaseDeductMarks);
                            }
                        } else {
                            hasAnyAbsent = true;
                        }
                    } else {
                        mainSubjectsGP += res.gp;
                        mainSubjectCount++;
                        mainSubjectsFullMarks += (res.fullMarks || 100);
                        grandTotal += res.total;

                        if (res.isAbsent) {
                            hasAnyAbsent = true;
                            failsCount++;
                        } else if (res.isFail || res.gp === 0) {
                            failsCount++;
                        }
                    }
                }
                return { sub, res, isOpt };
            });

            // Grand Total includes active main subjects total + Optional bonus marks above 2.00 threshold
            grandTotal += optionalBonusMarks;

            const hasFailed = failsCount > 0;
            let finalGPA = 0.00;
            let finalGradeName = hasAnyAbsent ? 'A' : (hasFailed ? (failRule.name || 'F') : '—');

            if (hasAnyMarks && mainSubjectCount > 0) {
                if (hasAnyAbsent) {
                    finalGPA = 0.00;
                    finalGradeName = 'A';
                } else if (hasFailed) {
                    finalGPA = 0.00;
                    finalGradeName = failRule.name || 'F';
                } else {
                    if (currentGPACalcMethod === 'total') {
                        const totalMax = mainSubjectsFullMarks > 0 ? mainSubjectsFullMarks : (mainSubjectCount * 100);
                        const pct = totalMax > 0 ? (grandTotal / totalMax) * 100 : 0;
                        const totalGradeInfo = getGradeForPercentage(pct, passPct);
                        finalGPA = totalGradeInfo.gp;
                        finalGradeName = totalGradeInfo.name;
                    } else {
                        const rawFinalGPA = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
                        finalGPA = Math.min(maxScaleGP, rawFinalGPA);
                        finalGradeName = getGradeForGPA(finalGPA);
                    }
                }
            }

            return {
                evaluatedSubjects,
                grandTotal,
                totalFullMarks,
                mainSubjectsGP,
                optionalBonusGP,
                optionalBonusMarks,
                mainSubjectCount,
                failsCount,
                hasAnyAbsent,
                hasFailed,
                hasAnyMarks,
                finalGPA,
                finalGradeName,
                passPct,
                failRule
            };
        }

'''

content = content[:idx1] + new_grading_block + content[idx2:]

# Marker 2: renderMarksheetTable function
old_render_start = '        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {'
old_render_end = '        // Helper to match exam names flexibly across routines, schedules, and types'

idx_r1 = content.find(old_render_start)
idx_r2 = content.find(old_render_end)

if idx_r1 == -1 or idx_r2 == -1:
    raise Exception(f"renderMarksheetTable markers not found: idx_r1={idx_r1}, idx_r2={idx_r2}")

new_render_code = '''        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {
            const tbody = document.getElementById('marksheet-tbody');
            if (tbody) {
                updateTableHeaderMarks(exam, selectedClass);
            }
            if (!tbody) return;

            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);
            const summary = calculateOverallMarksheetSummary(subjects, exam, selectedClass);

            let html = '';

            summary.evaluatedSubjects.forEach(({ sub, res, isOpt }) => {
                if (sub.isCombined) {
                    const hasPaperMarks = res.hasMarks;
                    const m1 = res.p1Total;
                    const m2 = res.p2Total;
                    const combTotal = res.total;

                    const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const p1TotDisplay = (hasPaperMarks && m1 !== null) ? formatDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = (hasPaperMarks && m2 !== null) ? formatDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    const p1Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                    const p2Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, true);

                    const p1NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), p1Dist, currentLanguage === 'en');
                    const p2NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.pairWith), p2Dist, currentLanguage === 'en');

                    html += `<tr>
                        <td class="subject-col">${p1NameHtml}</td>
                        <td>${p1McqDisplay}</td>
                        <td>${p1CqDisplay}</td>
                        <td>${p1PrDisplay}</td>
                        <td>${p1TotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combTotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold;">${combGradeDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combGpDisplay}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${p2NameHtml}</td>
                        <td>${p2McqDisplay}</td>
                        <td>${p2CqDisplay}</td>
                        <td>${p2PrDisplay}</td>
                        <td>${p2TotDisplay}</td>
                    </tr>`;
                } else {
                    const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const totDisplay = res.hasMarks ? formatDigits(res.total) : '—';
                    const gradeDisplay = res.hasMarks ? res.grade : '—';
                    const gpDisplay = res.hasMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    const dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                    const subNameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), dist, currentLanguage === 'en');

                    html += `<tr>
                        <td class="subject-col">${subNameHtml}</td>
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

            renderGradingScaleLegend();

            const zeroGpaStr = currentLanguage === 'en' ? '0.00' : '০.০০';
            const finalGpaStr = summary.hasAnyMarks ? ((summary.hasFailed || summary.hasAnyAbsent) ? zeroGpaStr : formatDigits(summary.finalGPA.toFixed(2))) : '—';
            const finalGrade = summary.hasAnyMarks ? (summary.hasAnyAbsent ? 'A' : (summary.hasFailed ? (summary.failRule.name || 'F') : summary.finalGradeName)) : '—';

            const gtEl = document.getElementById('display-grand-total');
            if (gtEl) gtEl.innerText = summary.hasAnyMarks ? formatDigits(summary.grandTotal) : '—';
            const gpaEl = document.getElementById('display-gpa');
            if (gpaEl) gpaEl.innerText = finalGpaStr;
            const gradeEl = document.getElementById('display-final-grade');
            if (gradeEl) gradeEl.innerText = finalGrade;
            const rankEl = document.getElementById('display-rank-val');
            if (rankEl) rankEl.innerText = (student && student.roll ? formatDigits(student.roll) : formatDigits('1'));
        }

'''

content = content[:idx_r1] + new_render_code + content[idx_r2:]

# Marker 3: generateMarksheetCardHTML function body
old_card_start = '            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);'
old_card_end = '            return `\n            <div class="mark-sheet-container" style="margin-bottom: 25px;">'

idx_c1 = content.find(old_card_start)
idx_c2 = content.find(old_card_end)

if idx_c1 == -1 or idx_c2 == -1:
    raise Exception(f"generateMarksheetCardHTML markers not found: idx_c1={idx_c1}, idx_c2={idx_c2}")

new_card_code = '''            const subjects = getSubjectsForClass(selectedClass, selectedSection, exam, student);
            const summary = calculateOverallMarksheetSummary(subjects, exam, selectedClass);

            let tableHtml = '';

            summary.evaluatedSubjects.forEach(({ sub, res, isOpt }) => {
                if (sub.isCombined) {
                    const hasPaperMarks = res.hasMarks;
                    const m1 = res.p1Total;
                    const m2 = res.p2Total;
                    const combTotal = res.total;

                    const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const p1TotDisplay = (hasPaperMarks && m1 !== null) ? formatDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = (hasPaperMarks && m2 !== null) ? formatDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    const p1Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                    const p2Dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, true);

                    const p1NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), p1Dist, isEn);
                    const p2NameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.pairWith), p2Dist, isEn);

                    tableHtml += `<tr>
                        <td class="subject-col">${p1NameHtml}</td>
                        <td>${p1McqDisplay}</td>
                        <td>${p1CqDisplay}</td>
                        <td>${p1PrDisplay}</td>
                        <td>${p1TotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combTotDisplay}</td>
                        <td rowspan="2" style="font-weight: bold;">${combGradeDisplay}</td>
                        <td rowspan="2" style="font-weight: bold; background: #f8fafc;">${combGpDisplay}</td>
                    </tr>
                    <tr>
                        <td class="subject-col">${p2NameHtml}</td>
                        <td>${p2McqDisplay}</td>
                        <td>${p2CqDisplay}</td>
                        <td>${p2PrDisplay}</td>
                        <td>${p2TotDisplay}</td>
                    </tr>`;
                } else {
                    const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const totDisplay = res.hasMarks ? formatDigits(res.total) : '—';
                    const gradeDisplay = res.hasMarks ? res.grade : '—';
                    const gpDisplay = res.hasMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    const dist = getSubjectFullMarksDistribution(sub, exam, selectedClass, false);
                    const subNameHtml = formatSubjectWithMarks(getDisplaySubjectName(sub.name), dist, isEn);

                    tableHtml += `<tr>
                        <td class="subject-col">${subNameHtml}</td>
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

            const zeroGpaStr = isEn ? '0.00' : '০.০০';
            const finalGpaStr = summary.hasAnyMarks ? ((summary.hasFailed || summary.hasAnyAbsent) ? zeroGpaStr : formatDigits(summary.finalGPA.toFixed(2))) : '—';
            const finalGrade = summary.hasAnyMarks ? (summary.hasAnyAbsent ? 'A' : (summary.hasFailed ? (summary.failRule.name || 'F') : summary.finalGradeName)) : '—';
            const grandTotalDisplay = summary.hasAnyMarks ? formatDigits(summary.grandTotal) : '—';
            const rankStr = formatDigits(rankNum);
'''

content = content[:idx_c1] + new_card_code + content[idx_c2:]

# Also update the summary table in generateMarksheetCardHTML to display grandTotalDisplay
old_summary_row = '<td style="width: 50%;">${hasAnyMarks ? formatDigits(grandTotal) : \'—\'}</td>'
new_summary_row = '<td style="width: 50%;">${grandTotalDisplay}</td>'
if old_summary_row in content:
    content = content.replace(old_summary_row, new_summary_row)

# Marker 4: Storage listener key addition for tabulation_gpa_method
old_storage_keys = "|| e.key === 'school_marking_system'"
new_storage_keys = "|| e.key === 'school_marking_system' || e.key === 'tabulation_gpa_method'"
if old_storage_keys in content:
    content = content.replace(old_storage_keys, new_storage_keys)

with open('Marksheet.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Marksheet.html successfully updated!")

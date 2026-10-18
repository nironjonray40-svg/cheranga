import sys
import re

def update_marksheet():
    print("Updating Marksheet.html for dynamic Grading Scale...")
    with open('Marksheet.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add id to grading-scale table in single view
    content = content.replace(
        '<table class="grading-scale">',
        '<table class="grading-scale" id="marksheet-grading-scale-table">',
        1
    )

    # 2. Replace calculateGradeAndGP with dynamic version based on school_marking_system
    old_calc = '''        function calculateGradeAndGP(marks, fullMarks = 100) {
            if (marks === null || marks === undefined || isNaN(marks)) return { grade: 'F', gp: 0.00 };
            const pct = (marks / fullMarks) * 100;
            if (pct >= 80) return { grade: 'A+', gp: 5.00 };
            if (pct >= 70) return { grade: 'A', gp: 4.00 };
            if (pct >= 60) return { grade: 'A-', gp: 3.50 };
            if (pct >= 50) return { grade: 'B', gp: 3.00 };
            if (pct >= 40) return { grade: 'C', gp: 2.00 };
            if (pct >= 33) return { grade: 'D', gp: 1.00 };
            return { grade: 'F', gp: 0.00 };
        }'''

    new_calc = '''        const DEFAULT_GRADE_RULES = [
            { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
            { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
            { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
            { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
            { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
            { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
            { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
        ];

        // Dynamic Grading Scale loader from "Marking System" (school_marking_system)
        function loadMarkingSystem() {
            try {
                const raw = localStorage.getItem('school_marking_system');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                }
            } catch(e) {}
            return DEFAULT_GRADE_RULES;
        }

        // Calculate Grade & GP dynamically based on Grading Scale (% Percentage Scale) & full marks
        function calculateGradeAndGP(marks, fullMarks = 100) {
            if (marks === null || marks === undefined || isNaN(marks)) {
                return { grade: 'F', gp: 0.00 };
            }
            const fMarks = Number(fullMarks) > 0 ? Number(fullMarks) : 100;
            const pct = (Number(marks) / fMarks) * 100;

            const rules = loadMarkingSystem();
            const sortedRules = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
            const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: 'F', gp: 0.00 };

            // Find matching rule based on customized percentage threshold
            let match = sortedRules.find(r => pct >= parseFloat(r.min) && pct <= parseFloat(r.max));
            if (!match) {
                match = sortedRules.find(r => (pct + 0.001) >= parseFloat(r.min));
            }
            if (match) {
                return { grade: match.name, gp: parseFloat(match.gp) || 0.00 };
            }
            return { grade: failRule.name, gp: parseFloat(failRule.gp) || 0.00 };
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

            const sortedByGP = [...sortedRules].sort((a, b) => (parseFloat(b.gp) || 0) - (parseFloat(a.gp) || 0));
            const matched = sortedByGP.find(r => (gpa + 0.001) >= parseFloat(r.gp));
            return matched ? matched.name : failRule.name;
        }

        function renderGradingScaleLegend() {
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

    if old_calc in content:
        content = content.replace(old_calc, new_calc, 1)
        print("[OK] Replaced calculateGradeAndGP in Marksheet.html")
    else:
        print("[WARN] old_calc not found in Marksheet.html")

    # 3. Update getSubjectsForClass to resolve fullMarks accurately matching examDist.total and examTypes
    old_fullmarks_line = "fullMarks: parseInt(sc.totalMarks || sc.fullMarks) || (normSub.includes('ict') || normSub.includes('আইসিটি') ? 50 : 100),"
    new_fullmarks_block = '''let subFull = parseInt(sc.totalMarks || sc.fullMarks) || 0;
                        if (!subFull && sc.examType) {
                            try {
                                const rawTypes = localStorage.getItem('school_exam_types');
                                if (rawTypes) {
                                    const exTypes = JSON.parse(rawTypes);
                                    const exMatch = exTypes.find(t => isExamMatch(t.name, selectedExam));
                                    if (exMatch && Array.isArray(exMatch.examTypes)) {
                                        const stMatch = exMatch.examTypes.find(t => (t.typeName || '').trim().toLowerCase() === (sc.examType || '').trim().toLowerCase());
                                        if (stMatch) {
                                            subFull = (Number(stMatch.defaultCQ) || 0) + (Number(stMatch.defaultMCQ) || 0) + (Number(stMatch.defaultPractical) || 0);
                                        }
                                    }
                                }
                            } catch(e) {}
                        }
                        if (!subFull) {
                            const curDist = getExamDistribution(selectedExam, selectedClass);
                            if (curDist && curDist.total) subFull = curDist.total;
                        }
                        if (!subFull) {
                            subFull = (normSub.includes('ict') || normSub.includes('আইসিটি')) ? 50 : 100;
                        }'''

    # Find where fullMarks is assigned in subjectGroups
    target_grp = '''                                if (!subjectGroups.has(groupKey)) {
                                    subjectGroups.set(groupKey, {
                                        schedule: sc,
                                        scheduleIds: [sc.id],
                                        name: exactSubName,
                                        rawName: exactSubName,
                                        nameBn: exactSubName,
                                        code: sc.code || '',
                                        fullMarks: parseInt(sc.totalMarks || sc.fullMarks) || (normSub.includes('ict') || normSub.includes('আইসিটি') ? 50 : 100),
                                        isOptional: !!sc.isOptional
                                    });'''

    replacement_grp = '''                                if (!subjectGroups.has(groupKey)) {
                                    ''' + new_fullmarks_block + '''
                                    subjectGroups.set(groupKey, {
                                        schedule: sc,
                                        scheduleIds: [sc.id],
                                        name: exactSubName,
                                        rawName: exactSubName,
                                        nameBn: exactSubName,
                                        code: sc.code || '',
                                        fullMarks: subFull,
                                        isOptional: !!sc.isOptional
                                    });'''

    if target_grp in content:
        content = content.replace(target_grp, replacement_grp, 1)
        print("[OK] Updated fullMarks resolution in getSubjectsForClass (Marksheet.html)")
    else:
        print("[WARN] target_grp not found in Marksheet.html")

    # 4. In renderMarksheetTable, update GPA and Grade calculation to use 4th subject rule & dynamic grade
    old_table_calc = '''            const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
            const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))))) : '—';'''

    new_table_calc = '''            renderGradingScaleLegend();
            if (mainSubjectCount === 0) mainSubjectCount = subjectCount || 1;
            const maxGP = getMaxScaleGP();
            const rawGpa = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
            const boundedGpa = Math.min(maxGP, rawGpa);
            const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(boundedGpa.toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';'''

    # Also make sure mainSubjectsGP and optionalBonusGP are accumulated in renderMarksheetTable
    old_loop_start = '''            subjects.forEach(sub => {
                if (sub.isCombined) {
                    const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;'''

    new_loop_start = '''            let mainSubjectsGP = 0;
            let mainSubjectCount = 0;
            let optionalBonusGP = 0;

            subjects.forEach(sub => {
                const isOpt = !!(sub.isOptional || sub.group === 'optional');
                if (sub.isCombined) {
                    const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;'''

    old_combined_marks = '''                    if (hasPaperMarks) {
                        hasAnyMarks = true;
                        grandTotal += combTotal;
                        totalFullMarks += fullTotal;
                        totalGP += res.gp;
                        subjectCount++;
                        if (res.gp === 0) hasFailed = true;
                    }'''

    new_combined_marks = '''                    if (hasPaperMarks) {
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
                    }'''

    old_single_marks = '''                    if (sub.hasMarks) {
                        hasAnyMarks = true;
                        grandTotal += tot;
                        totalFullMarks += sub.fullMarks;
                        totalGP += res.gp;
                        subjectCount++;
                        if (res.gp === 0) hasFailed = true;
                    }'''

    new_single_marks = '''                    if (sub.hasMarks) {
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
                    }'''

    content = content.replace(old_loop_start, new_loop_start, 1)
    content = content.replace(old_combined_marks, new_combined_marks, 1)
    content = content.replace(old_single_marks, new_single_marks, 1)
    content = content.replace(old_table_calc, new_table_calc, 1)

    # 5. In generateMarksheetCardHTML (batch cards), update grading-scale table and GPA/Grade logic
    old_card_loop_start = '''            subjects.forEach(sub => {
                if (sub.isCombined) {
                    const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;'''

    new_card_loop_start = '''            let mainSubjectsGP = 0;
            let mainSubjectCount = 0;
            let optionalBonusGP = 0;

            subjects.forEach(sub => {
                const isOpt = !!(sub.isOptional || sub.group === 'optional');
                if (sub.isCombined) {
                    const hasPaperMarks = sub.hasMarks || sub.pairHasMarks;'''

    content = content.replace(old_card_loop_start, new_card_loop_start, 1)
    content = content.replace(old_combined_marks, new_combined_marks, 1)
    content = content.replace(old_single_marks, new_single_marks, 1)

    old_card_calc = '''            const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
            const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))))) : '—';'''

    new_card_calc = '''            if (mainSubjectCount === 0) mainSubjectCount = subjectCount || 1;
            const maxGP = getMaxScaleGP();
            const rawGpa = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
            const boundedGpa = Math.min(maxGP, rawGpa);
            const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(boundedGpa.toFixed(2))) : '—';
            const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';'''

    content = content.replace(old_card_calc, new_card_calc, 1)

    # In batch card template, replace hardcoded grading table with ${getGradingScaleTableHTML()}
    old_card_scale = '''                        <table class="grading-scale">
                            <tr><th>Range</th><th>Grade</th><th>GPA</th></tr>
                            <tr><td>80-100</td><td>A+</td><td>5.00</td></tr>
                            <tr><td>70-79</td><td>A</td><td>4.00</td></tr>
                            <tr><td>60-69</td><td>A-</td><td>3.50</td></tr>
                            <tr><td>50-59</td><td>B</td><td>3.00</td></tr>
                            <tr><td>40-49</td><td>C</td><td>2.00</td></tr>
                            <tr><td>33-39</td><td>D</td><td>1.00</td></tr>
                        </table>'''
    new_card_scale = '''                        ${getGradingScaleTableHTML()}'''
    content = content.replace(old_card_scale, new_card_scale, 1)

    # 6. Update syncLiveExamData and storage listeners to include school_marking_system
    content = content.replace(
        "keys=school_exam_schedules,school_student_marks,school_students,school_subjects,school_classes,school_exam_types,school_exam_routines,school_omr_exams,school_settings,school_logo",
        "keys=school_exam_schedules,school_student_marks,school_students,school_subjects,school_classes,school_exam_types,school_exam_routines,school_omr_exams,school_marking_system,school_settings,school_logo"
    )
    content = content.replace(
        "['school_exam_schedules', 'school_student_marks', 'school_students', 'school_subjects', 'school_classes', 'school_exam_types', 'school_exam_routines', 'school_omr_exams']",
        "['school_exam_schedules', 'school_student_marks', 'school_students', 'school_subjects', 'school_classes', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_marking_system']"
    )
    content = content.replace(
        "e.key === 'school_subjects'",
        "e.key === 'school_subjects' || e.key === 'school_marking_system'"
    )

    with open('Marksheet.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[SUCCESS] Marksheet.html updated for dynamic Grading Scale!")

def update_marksheet1():
    print("Updating Marksheet1.html for dynamic Grading Scale...")
    with open('Marksheet1.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add id to grading legend table tbody
    old_legend_tbody = '''                    <table class="legend-table">
                        <thead>
                            <tr>
                                <th>নম্বর সীমা</th>
                                <th>গ্রেড</th>
                                <th>পয়েন্ট</th>
                            </tr>
                        </thead>
                        <tbody>'''
    new_legend_tbody = '''                    <table class="legend-table">
                        <thead>
                            <tr>
                                <th>নম্বর সীমা</th>
                                <th>গ্রেড</th>
                                <th>পয়েন্ট</th>
                            </tr>
                        </thead>
                        <tbody id="grading-legend-tbody-1">'''
    content = content.replace(old_legend_tbody, new_legend_tbody, 1)

    # 2. Replace calculateGradeAndGP with dynamic version based on school_marking_system
    old_calc1 = '''function calculateGradeAndGP(marks, fullMarks = 100) {
    if (marks === null || marks === undefined || isNaN(marks)) return { grade: 'F', gp: 0.00 };
    const pct = (marks / fullMarks) * 100;
    if (pct >= 80) return { grade: 'A+', gp: 5.00 };
    if (pct >= 70) return { grade: 'A', gp: 4.00 };
    if (pct >= 60) return { grade: 'A-', gp: 3.50 };
    if (pct >= 50) return { grade: 'B', gp: 3.00 };
    if (pct >= 40) return { grade: 'C', gp: 2.00 };
    if (pct >= 33) return { grade: 'D', gp: 1.00 };
    return { grade: 'F', gp: 0.00 };
}'''

    new_calc1 = '''const DEFAULT_GRADE_RULES = [
    { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
    { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
    { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
    { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
    { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
    { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
    { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
];

// Dynamic Grading Scale loader from "Marking System" (school_marking_system)
function loadMarkingSystem() {
    try {
        const raw = localStorage.getItem('school_marking_system');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch(e) {}
    return DEFAULT_GRADE_RULES;
}

// Calculate Grade & GP dynamically based on Grading Scale (% Percentage Scale) & full marks
function calculateGradeAndGP(marks, fullMarks = 100) {
    if (marks === null || marks === undefined || isNaN(marks)) {
        return { grade: 'F', gp: 0.00 };
    }
    const fMarks = Number(fullMarks) > 0 ? Number(fullMarks) : 100;
    const pct = (Number(marks) / fMarks) * 100;

    const rules = loadMarkingSystem();
    const sortedRules = [...rules].sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: 'F', gp: 0.00 };

    // Find matching rule based on customized percentage threshold
    let match = sortedRules.find(r => pct >= parseFloat(r.min) && pct <= parseFloat(r.max));
    if (!match) {
        match = sortedRules.find(r => (pct + 0.001) >= parseFloat(r.min));
    }
    if (match) {
        return { grade: match.name, gp: parseFloat(match.gp) || 0.00 };
    }
    return { grade: failRule.name, gp: parseFloat(failRule.gp) || 0.00 };
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

    const sortedByGP = [...sortedRules].sort((a, b) => (parseFloat(b.gp) || 0) - (parseFloat(a.gp) || 0));
    const matched = sortedByGP.find(r => (gpa + 0.001) >= parseFloat(r.gp));
    return matched ? matched.name : failRule.name;
}

function renderGradingScaleLegend1() {
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

    if old_calc1 in content:
        content = content.replace(old_calc1, new_calc1, 1)
        print("[OK] Replaced calculateGradeAndGP in Marksheet1.html")
    else:
        print("[WARN] old_calc1 not found in Marksheet1.html")

    # 3. Update getSubjectsForClass fullMarks resolution in Marksheet1.html
    target_grp1 = '''                                if (!subjectGroups.has(groupKey)) {
                                    subjectGroups.set(groupKey, {
                                        schedule: sc,
                                        scheduleIds: [sc.id],
                                        name: exactSubName,
                                        rawName: exactSubName,
                                        nameBn: exactSubName,
                                        code: sc.code || '',
                                        fullMarks: parseInt(sc.totalMarks || sc.fullMarks) || (normSub.includes('ict') || normSub.includes('আইসিটি') ? 50 : 100),
                                        isOptional: !!sc.isOptional
                                    });'''

    new_fullmarks_block1 = '''let subFull = parseInt(sc.totalMarks || sc.fullMarks) || 0;
                        if (!subFull && sc.examType) {
                            try {
                                const rawTypes = localStorage.getItem('school_exam_types');
                                if (rawTypes) {
                                    const exTypes = JSON.parse(rawTypes);
                                    const exMatch = exTypes.find(t => isExamMatch(t.name, selectedExam));
                                    if (exMatch && Array.isArray(exMatch.examTypes)) {
                                        const stMatch = exMatch.examTypes.find(t => (t.typeName || '').trim().toLowerCase() === (sc.examType || '').trim().toLowerCase());
                                        if (stMatch) {
                                            subFull = (Number(stMatch.defaultCQ) || 0) + (Number(stMatch.defaultMCQ) || 0) + (Number(stMatch.defaultPractical) || 0);
                                        }
                                    }
                                }
                            } catch(e) {}
                        }
                        if (!subFull) {
                            const curDist = getExamDistribution(selectedExam, selectedClass);
                            if (curDist && curDist.total) subFull = curDist.total;
                        }
                        if (!subFull) {
                            subFull = (normSub.includes('ict') || normSub.includes('আইসিটি')) ? 50 : 100;
                        }'''

    replacement_grp1 = '''                                if (!subjectGroups.has(groupKey)) {
                                    ''' + new_fullmarks_block1 + '''
                                    subjectGroups.set(groupKey, {
                                        schedule: sc,
                                        scheduleIds: [sc.id],
                                        name: exactSubName,
                                        rawName: exactSubName,
                                        nameBn: exactSubName,
                                        code: sc.code || '',
                                        fullMarks: subFull,
                                        isOptional: !!sc.isOptional
                                    });'''

    if target_grp1 in content:
        content = content.replace(target_grp1, replacement_grp1, 1)
        print("[OK] Updated fullMarks resolution in getSubjectsForClass (Marksheet1.html)")
    else:
        print("[WARN] target_grp1 not found in Marksheet1.html")

    # 4. In renderMarksheet1Table, accumulate optional bonus and calculate GPA / Grade dynamically
    old_loop_start1 = '''    subjects.forEach((sub, idx) => {
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {'''

    new_loop_start1 = '''    let mainSubjectsGP = 0;
    let mainSubjectCount = 0;
    let optionalBonusGP = 0;

    subjects.forEach((sub, idx) => {
        const isOpt = !!(sub.isOptional || sub.group === 'optional');
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {'''

    old_combined_marks1 = '''            if (hasPaperMarks) {
                hasAnyMarks = true;
                grandTotal += combTotal;
                totalFullMarks += fullTotal;
                totalGP += res.gp;
                subjectCount++;
                if (res.gp === 0) hasFailed = true;
            }'''

    new_combined_marks1 = '''            if (hasPaperMarks) {
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
            }'''

    old_single_marks1 = '''            if (sub.hasMarks) {
                hasAnyMarks = true;
                grandTotal += tot;
                totalFullMarks += sub.fullMarks;
                totalGP += res.gp;
                subjectCount++;
                if (res.gp === 0) hasFailed = true;
            }'''

    new_single_marks1 = '''            if (sub.hasMarks) {
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
            }'''

    old_table_calc1 = '''    const gpa = (subjectCount > 0 && !hasFailed) ? (totalGP / subjectCount) : 0;
    const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(Math.min(5.00, gpa).toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : (gpa >= 5 ? 'A+' : (gpa >= 4 ? 'A' : (gpa >= 3.5 ? 'A-' : (gpa >= 3 ? 'B' : (gpa >= 2 ? 'C' : 'D')))))) : '—';'''

    new_table_calc1 = '''    renderGradingScaleLegend1();
    if (mainSubjectCount === 0) mainSubjectCount = subjectCount || 1;
    const maxGP = getMaxScaleGP();
    const rawGpa = (mainSubjectsGP + optionalBonusGP) / mainSubjectCount;
    const boundedGpa = Math.min(maxGP, rawGpa);
    const finalGpaStr = hasAnyMarks ? (hasFailed ? '০.০০' : toBnDigits(boundedGpa.toFixed(2))) : '—';
    const finalGrade = hasAnyMarks ? (hasFailed ? 'F' : getFinalGradeFromGPA(boundedGpa, false)) : '—';'''

    content = content.replace(old_loop_start1, new_loop_start1, 1)
    content = content.replace(old_combined_marks1, new_combined_marks1, 1)
    content = content.replace(old_single_marks1, new_single_marks1, 1)
    content = content.replace(old_table_calc1, new_table_calc1, 1)

    # 5. In generateMarksheet1CardHTML (batch cards), update GPA/Grade logic and grading legend table
    old_batch_loop_start1 = '''    subjects.forEach(sub => {
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {'''

    new_batch_loop_start1 = '''    let mainSubjectsGP = 0;
    let mainSubjectCount = 0;
    let optionalBonusGP = 0;

    subjects.forEach(sub => {
        const isOpt = !!(sub.isOptional || sub.group === 'optional');
        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {'''

    content = content.replace(old_batch_loop_start1, new_batch_loop_start1, 1)
    content = content.replace(old_combined_marks1, new_combined_marks1, 1)
    content = content.replace(old_single_marks1, new_single_marks1, 1)
    content = content.replace(old_table_calc1, new_table_calc1, 1)

    # In batch card template, replace hardcoded grading table rows with ${getGradingScaleLegendRowsHTML1()}
    old_batch_legend_tbody = '''                            <tbody id="grading-legend-tbody-1">
                                <tr><td>৮০-১০০</td><td><strong>A+</strong></td><td>৫.০০</td></tr>
                                <tr><td>৭০-৭৯</td><td><strong>A</strong></td><td>৪.০০</td></tr>
                                <tr><td>৬০-৬৯</td><td><strong>A-</strong></td><td>৩.৫০</td></tr>
                                <tr><td>৫০-৫৯</td><td><strong>B</strong></td><td>৩.০০</td></tr>
                                <tr><td>৪০-৪৯</td><td><strong>C</strong></td><td>২.০০</td></tr>
                                <tr><td>৩৩-৩৯</td><td><strong>D</strong></td><td>১.০০</td></tr>
                                <tr><td>০০-৩২</td><td><strong>F</strong></td><td>০.০০</td></tr>
                            </tbody>'''
    # Note in batch template it doesn't have id="grading-legend-tbody-1"
    old_batch_legend_tbody_plain = '''                            <tbody>
                                <tr><td>৮০-১০০</td><td><strong>A+</strong></td><td>৫.০০</td></tr>
                                <tr><td>৭০-৭৯</td><td><strong>A</strong></td><td>৪.০০</td></tr>
                                <tr><td>৬০-৬৯</td><td><strong>A-</strong></td><td>৩.৫০</td></tr>
                                <tr><td>৫০-৫৯</td><td><strong>B</strong></td><td>৩.০০</td></tr>
                                <tr><td>৪০-৪৯</td><td><strong>C</strong></td><td>২.০০</td></tr>
                                <tr><td>৩৩-৩৯</td><td><strong>D</strong></td><td>১.০০</td></tr>
                                <tr><td>০০-৩২</td><td><strong>F</strong></td><td>০.০০</td></tr>
                            </tbody>'''
    new_batch_legend_tbody = '''                            <tbody>
                                ${getGradingScaleLegendRowsHTML1()}
                            </tbody>'''
    content = content.replace(old_batch_legend_tbody_plain, new_batch_legend_tbody, 1)

    # 6. Update syncLiveExamData and storage listeners to include school_marking_system
    content = content.replace(
        "keys=school_exam_schedules,school_student_marks,school_students,school_subjects,school_classes,school_exam_types,school_exam_routines,school_omr_exams,school_settings,school_logo",
        "keys=school_exam_schedules,school_student_marks,school_students,school_subjects,school_classes,school_exam_types,school_exam_routines,school_omr_exams,school_marking_system,school_settings,school_logo"
    )
    content = content.replace(
        "['school_exam_schedules', 'school_student_marks', 'school_students', 'school_subjects', 'school_classes', 'school_exam_types', 'school_exam_routines', 'school_omr_exams']",
        "['school_exam_schedules', 'school_student_marks', 'school_students', 'school_subjects', 'school_classes', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_marking_system']"
    )
    content = content.replace(
        "e.key === 'school_subjects'",
        "e.key === 'school_subjects' || e.key === 'school_marking_system'"
    )

    with open('Marksheet1.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[SUCCESS] Marksheet1.html updated for dynamic Grading Scale!")

if __name__ == '__main__':
    update_marksheet()
    update_marksheet1()

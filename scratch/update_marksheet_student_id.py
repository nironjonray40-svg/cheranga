import re

def update_file(filename, is_marksheet1=False):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add getEffectiveStudentId function right before matchesStudentQuery
    helper_fn = """        function getEffectiveStudentId(st, currentClass = '', rankNum = 1) {
            if (!st) return '';
            const reg = String(st.regNo || '').trim();
            const sid = String(st.studentId || '').trim();

            // 1. Valid registration / student number from database (e.g. 260091, 2606001, 2607001, 2608001)
            if (reg && !reg.startsWith('178') && reg.length <= 12) {
                return reg;
            }

            // 2. Full studentId (longer than 4 characters, e.g. 2606001, 2610001, 2026101001)
            if (sid && sid.length > 4 && !sid.startsWith('178')) {
                return sid;
            }

            // 3. Clean studentId (not internal timestamp uuid)
            if (sid && !sid.startsWith('178') && !sid.includes('-')) {
                return sid;
            }

            // 4. Standard school ID formula: '26' + 2-digit class code + 3-digit roll/rank
            const normC = normalizeClassString(st.class || st.className || currentClass || '10');
            const classCode = String(normC).padStart(2, '0');
            const rollVal = st.roll || st.rollNo || rankNum || 1;
            const rollDigits = String(toEnDigits(rollVal)).replace(/\\D/g, '') || String(rankNum || 1);
            const serial = String(rollDigits).padStart(3, '0');
            return `26${classCode}${serial}`;
        }
"""
    if 'function getEffectiveStudentId' not in content:
        target = 'function matchesStudentQuery'
        content = content.replace(target, helper_fn + '\n        ' + target, 1)
    else:
        content = re.sub(
            r'function getEffectiveStudentId[\s\S]*?\n        \}',
            lambda m: helper_fn.strip(),
            content,
            count=1
        )

    # 2. Update matchesStudentQuery to check effId, sid, and reg
    new_matches = """function matchesStudentQuery(student, query) {
            if (!query) return true;
            const cleanQ = query.trim().toLowerCase();
            const cleanQEn = toEnDigits(cleanQ).replace(/^0+/, '');

            const rollStr = String(student.roll || student.rollNo || '');
            const rollEn = toEnDigits(rollStr).replace(/^0+/, '');

            // Exact roll match or startsWith
            if (cleanQEn && (rollEn === cleanQEn || rollEn.startsWith(cleanQEn))) return true;

            // Student ID & Registration match
            const effId = typeof getEffectiveStudentId === 'function' ? getEffectiveStudentId(student) : '';
            const effIdEn = toEnDigits(effId);
            const sidEn = toEnDigits(String(student.studentId || ''));
            const regEn = toEnDigits(String(student.regNo || ''));
            if (cleanQEn && (effIdEn.includes(cleanQEn) || sidEn.includes(cleanQEn) || regEn.includes(cleanQEn))) return true;

            // Name match (Bangla & English)
            const nameBn = (student.nameBn || '').toLowerCase();
            const nameEn = (student.name || student.studentName || '').toLowerCase();
            if (nameBn.includes(cleanQ) || nameEn.includes(cleanQ)) return true;

            return false;
        }"""
    content = re.sub(
        r'function matchesStudentQuery\(student, query\) \{[\s\S]*?\n        \}',
        lambda m: new_matches,
        content,
        count=1
    )

    # 3. Update search suggestions badge
    content = re.sub(
        r'const stId = st\.studentId \|\| st\.regNo \|\| st\.id \|\| \'\';',
        'const stId = getEffectiveStudentId(st, currentClass, idx + 1);',
        content
    )

    # 4. Update syncCascadingFilters studentId resolution & DOM display
    if is_marksheet1:
        old_sync_pattern = r'const studentName = matchedStudent \? \(matchedStudent\.nameBn[\s\S]*?if \(idVal && idVal\.innerText !== studentId\) idVal\.innerText = studentId;'
        new_sync_block = """const studentName = matchedStudent ? (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || 'মো: আব্দুল্লাহ আল নোমান') : 'মো: আব্দুল্লাহ আল নোমান';
        const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '০১') : '০১';
        const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

        const sVal = document.getElementById('display-student-val');
        if (sVal && sVal.innerText !== studentName) sVal.innerText = studentName;
        const rVal = document.getElementById('display-roll-val');
        if (rVal) rVal.innerText = toBnDigits(rollNo);
        const idVal = document.getElementById('display-id-val');
        if (idVal) idVal.innerText = toBnDigits(studentId);"""
        content = re.sub(old_sync_pattern, lambda m: new_sync_block, content, count=1)
    else:
        old_sync_pattern = r'const studentName = matchedStudent \? \(matchedStudent\.nameBn[\s\S]*?if \(idEl && idEl\.innerText !== studentId\) idEl\.innerText = studentId;'
        new_sync_block = """const studentName = matchedStudent ? (matchedStudent.nameBn || matchedStudent.name || matchedStudent.studentName || 'মো: আব্দুল্লাহ আল নোমান') : 'মো: আব্দুল্লাহ আল নোমান';
                const rollNo = matchedStudent ? (matchedStudent.roll || matchedStudent.rollNo || '১') : '১';
                const studentId = getEffectiveStudentId(matchedStudent, effectiveClass, rollNo);

                const nameEl = document.getElementById('display-student-name');
                if (nameEl && nameEl.innerText !== studentName) nameEl.innerText = studentName;
                const rollEl = document.getElementById('display-roll-no');
                if (rollEl) rollEl.innerText = toBnDigits(rollNo);
                const idEl = document.getElementById('display-student-id');
                if (idEl) idEl.innerText = toBnDigits(studentId);"""
        content = re.sub(old_sync_pattern, lambda m: new_sync_block, content, count=1)

    # 5. Update batch card generation
    if is_marksheet1:
        content = re.sub(
            r'const studentId = student\.studentId \|\| student\.regNo \|\| student\.id \|\| `২০২৪১০১০\$\{rankNum\}`;',
            'const studentId = getEffectiveStudentId(student, selectedClass, rankNum);',
            content
        )
    else:
        content = re.sub(
            r'const studentId = student\.studentId \|\| student\.regNo \|\| student\.id \|\| `২০২৬১০১০০\$\{rankNum\}`;',
            'const studentId = getEffectiveStudentId(student, selectedClass, rankNum);',
            content
        )

    # 6. Update single view HTML placeholder
    if is_marksheet1:
        content = content.replace('<td class="p-val" id="display-id-val">২০২৪১০১০১</td>', '<td class="p-val" id="display-id-val">২৬১০০০১</td>')
    else:
        content = content.replace('<span id="display-student-id">২০২৬১০১০০১</span>', '<span id="display-student-id">২৬১০০০১</span>')

    # 7. Update fallback students array
    content = content.replace("'২০২৪১০১০১'", "'2610001'").replace("'২০২৪১০১০২'", "'2610002'").replace("'২০২৪১০১০৩'", "'2610003'").replace("'২০২৪১০১০৪'", "'2610004'").replace("'২০২৪১০১০৫'", "'2610005'").replace("'২০২৪১০১০৬'", "'2610006'").replace("'২০২৪১০১০৭'", "'2610007'").replace("'২০২৪১০১০৮'", "'2610008'")
    content = content.replace("'২০২৬১০১০০১'", "'2610001'").replace("'২০২৬১০১০০২'", "'2610002'").replace("'২০২৬১০১০০৩'", "'2610003'").replace("'২০২৬১০১০০৪'", "'2610004'").replace("'২০২৬১০১০০৫'", "'2610005'").replace("'২০২৬১০১০০৬'", "'2610006'").replace("'২০২৬১০১০০৭'", "'2610007'").replace("'২০২৬১০১০০৮'", "'2610008'")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename} successfully.")

if __name__ == '__main__':
    update_file('Marksheet.html', is_marksheet1=False)
    update_file('Marksheet1.html', is_marksheet1=True)

import re

def update_marksheet(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update subFull calculation in getSubjectsForClass to also calculate subCqFull, subMcqFull, subPracFull
    old_subfull_pattern = re.compile(
        r"let subFull = parseInt\(sc\.totalMarks \|\| sc\.fullMarks\) \|\| 0;\s*"
        r"if \(!subFull && sc\.examType\) \{[\s\S]*?"
        r"subFull = \(normSub\.includes\('ict'\) \|\| normSub\.includes\('আইসিটি'\)\) \? 50 : 100;\s*\}",
        re.MULTILINE
    )

    new_subfull_code = """let subFull = parseInt(sc.totalMarks || sc.fullMarks) || 0;
                        let subCqFull = null;
                        let subMcqFull = null;
                        let subPracFull = null;
                        if (sc.examType) {
                            try {
                                const rawTypes = localStorage.getItem('school_exam_types');
                                if (rawTypes) {
                                    const exTypes = JSON.parse(rawTypes);
                                    const exMatch = exTypes.find(t => isExamMatch(t.name, selectedExam));
                                    if (exMatch && Array.isArray(exMatch.examTypes)) {
                                        const stMatch = exMatch.examTypes.find(t => (t.typeName || '').trim().toLowerCase() === (sc.examType || '').trim().toLowerCase());
                                        if (stMatch) {
                                            if (stMatch.defaultCQ !== undefined && stMatch.defaultCQ !== null) subCqFull = Number(stMatch.defaultCQ);
                                            if (stMatch.defaultMCQ !== undefined && stMatch.defaultMCQ !== null) subMcqFull = Number(stMatch.defaultMCQ);
                                            if (stMatch.defaultPractical !== undefined && stMatch.defaultPractical !== null) subPracFull = Number(stMatch.defaultPractical);
                                            subFull = (subCqFull || 0) + (subMcqFull || 0) + (subPracFull || 0);
                                        }
                                    }
                                    if (subCqFull === null && exMatch) {
                                        if (exMatch.defaultCQ !== undefined && exMatch.defaultCQ !== null) subCqFull = Number(exMatch.defaultCQ);
                                        if (exMatch.defaultMCQ !== undefined && exMatch.defaultMCQ !== null) subMcqFull = Number(exMatch.defaultMCQ);
                                        if (exMatch.defaultPractical !== undefined && exMatch.defaultPractical !== null) subPracFull = Number(exMatch.defaultPractical);
                                    }
                                }
                            } catch(e) {}
                        }

                        const normSubName = exactSubName.toLowerCase();
                        const isEngSub = normSubName.includes('english') || normSubName.includes('ইংরেজি');
                        if (isEngSub) {
                            if (subCqFull === null || subCqFull === undefined) subCqFull = subFull || 100;
                            subMcqFull = 0;
                            subPracFull = 0;
                            if (!subFull) subFull = subCqFull;
                        } else if (subCqFull === null || subMcqFull === null || subPracFull === null) {
                            const curDist = getExamDistribution(selectedExam, selectedClass);
                            if (subCqFull === null) subCqFull = curDist.cq;
                            if (subMcqFull === null) subMcqFull = curDist.mcq;
                            if (subPracFull === null) subPracFull = curDist.prac;
                            if (!subFull && curDist.total) subFull = curDist.total;
                        }
                        if (!subFull) {
                            subFull = (normSubName.includes('ict') || normSubName.includes('আইসিটি')) ? 50 : 100;
                        }"""

    if old_subfull_pattern.search(content):
        content = old_subfull_pattern.sub(new_subfull_code, content, count=1)
        print(f"[{file_path}] [OK] Replaced subFull and added subCqFull, subMcqFull, subPracFull")
    else:
        print(f"[{file_path}] [FAIL] old_subfull_pattern not matched")

    # 2. Add cqFull, mcqFull, pracFull to subjectGroups.set
    old_grp_set = re.compile(
        r"subjectGroups\.set\(groupKey, \{\s*"
        r"schedule: sc,\s*"
        r"scheduleIds: \[sc\.id\],\s*"
        r"name: exactSubName,\s*"
        r"rawName: exactSubName,\s*"
        r"nameBn: exactSubName,\s*"
        r"code: sc\.code \|\| '',\s*"
        r"fullMarks: subFull,\s*"
        r"isOptional: !!sc\.isOptional\s*"
        r"\}\);",
        re.MULTILINE
    )

    new_grp_set = """subjectGroups.set(groupKey, {
                                        schedule: sc,
                                        scheduleIds: [sc.id],
                                        name: exactSubName,
                                        rawName: exactSubName,
                                        nameBn: exactSubName,
                                        code: sc.code || '',
                                        fullMarks: subFull,
                                        cqFull: subCqFull,
                                        mcqFull: subMcqFull,
                                        pracFull: subPracFull,
                                        isOptional: !!sc.isOptional
                                    });"""

    if old_grp_set.search(content):
        content = old_grp_set.sub(new_grp_set, content, count=1)
        print(f"[{file_path}] [OK] Updated subjectGroups.set")
    else:
        print(f"[{file_path}] [FAIL] old_grp_set not matched")

    # 3. Add cqFull, mcqFull, pracFull to rawList.push in subjectGroups.forEach
    old_rawlist_grp = re.compile(
        r"subjectGroups\.forEach\(grp => \{\s*"
        r"const sc = grp\.schedule;\s*"
        r"rawList\.push\(\{\s*"
        r"scheduleId: grp\.scheduleId \|\| sc\.id,\s*"
        r"scheduleIds: grp\.scheduleIds,\s*"
        r"name: grp\.name,\s*"
        r"rawName: grp\.rawName,\s*"
        r"nameBn: grp\.name,\s*"
        r"code: grp\.code,\s*"
        r"fullMarks: grp\.fullMarks,\s*"
        r"isOptional: grp\.isOptional\s*"
        r"\}\);\s*"
        r"\}\);",
        re.MULTILINE
    )

    new_rawlist_grp = """subjectGroups.forEach(grp => {
                                const sc = grp.schedule;
                                rawList.push({
                                    scheduleId: grp.scheduleId || sc.id,
                                    scheduleIds: grp.scheduleIds,
                                    name: grp.name,
                                    rawName: grp.rawName,
                                    nameBn: grp.name,
                                    code: grp.code,
                                    fullMarks: grp.fullMarks,
                                    cqFull: grp.cqFull,
                                    mcqFull: grp.mcqFull,
                                    pracFull: grp.pracFull,
                                    isOptional: grp.isOptional
                                });
                            });"""

    if old_rawlist_grp.search(content):
        content = old_rawlist_grp.sub(new_rawlist_grp, content, count=1)
        print(f"[{file_path}] [OK] Updated rawList.push in subjectGroups.forEach")
    else:
        print(f"[{file_path}] [FAIL] old_rawlist_grp not matched")

    # 4. In rawList.forEach, when extracting marks, clear item.mcq / item.pr if subject doesn't have them
    old_marks_ext = re.compile(
        r"rawList\.forEach\(item => \{\s*"
        r"const markRes = getStudentMarksForSubject\(student, item, selectedExam, savedMarks\);\s*"
        r"item\.mcq = markRes\.mcq;\s*"
        r"item\.cq = markRes\.cq;\s*"
        r"item\.pr = markRes\.pr;\s*"
        r"item\.total = markRes\.total;\s*"
        r"item\.isAbsent = markRes\.isAbsent;\s*"
        r"item\.hasMarks = markRes\.hasMarks;\s*"
        r"\}\);",
        re.MULTILINE
    )

    new_marks_ext = """rawList.forEach(item => {
                const markRes = getStudentMarksForSubject(student, item, selectedExam, savedMarks);
                item.mcq = markRes.mcq;
                item.cq = markRes.cq;
                item.pr = markRes.pr;
                item.total = markRes.total;
                item.isAbsent = markRes.isAbsent;
                item.hasMarks = markRes.hasMarks;

                const normN = (item.name || '').toLowerCase();
                const isEng = normN.includes('english') || normN.includes('ইংরেজি');
                if (item.mcqFull === 0 || isEng) {
                    item.mcq = '';
                }
                if (item.pracFull === 0 || isEng) {
                    item.pr = '';
                }
            });"""

    if old_marks_ext.search(content):
        content = old_marks_ext.sub(new_marks_ext, content, count=1)
        print(f"[{file_path}] [OK] Updated marks extraction logic")
    else:
        print(f"[{file_path}] [FAIL] old_marks_ext not matched")

    # 5. In rows.push, pass cqFull, mcqFull, pracFull
    old_paired_push = re.compile(
        r"rows\.push\(\{\s*"
        r"name: curName,\s*"
        r"fullMarks: curFull,\s*"
        r"mcq: current\.mcq,\s*"
        r"cq: current\.cq,\s*"
        r"pr: current\.pr,\s*"
        r"total: current\.total,\s*"
        r"hasMarks: current\.hasMarks,\s*"
        r"isAbsent: current\.isAbsent,\s*"
        r"isCombined: true,\s*"
        r"pairWith: pairName,\s*"
        r"pairFull: pairFull,\s*"
        r"pairMcq: pairItem\.mcq,\s*"
        r"pairCq: pairItem\.cq,\s*"
        r"pairPr: pairItem\.pr,\s*"
        r"pairTotal: pairItem\.total,\s*"
        r"pairHasMarks: pairItem\.hasMarks,\s*"
        r"pairIsAbsent: pairItem\.isAbsent,\s*"
        r"group: groupType,\s*"
        r"isOptional: false\s*"
        r"\}\);",
        re.MULTILINE
    )

    new_paired_push = """rows.push({
                        name: curName,
                        fullMarks: curFull,
                        cqFull: current.cqFull !== undefined ? current.cqFull : null,
                        mcqFull: current.mcqFull !== undefined ? current.mcqFull : null,
                        pracFull: current.pracFull !== undefined ? current.pracFull : null,
                        mcq: current.mcq,
                        cq: current.cq,
                        pr: current.pr,
                        total: current.total,
                        hasMarks: current.hasMarks,
                        isAbsent: current.isAbsent,
                        isCombined: true,
                        pairWith: pairName,
                        pairFull: pairFull,
                        pairCqFull: pairItem.cqFull !== undefined ? pairItem.cqFull : null,
                        pairMcqFull: pairItem.mcqFull !== undefined ? pairItem.mcqFull : null,
                        pairPracFull: pairItem.pracFull !== undefined ? pairItem.pracFull : null,
                        pairMcq: pairItem.mcq,
                        pairCq: pairItem.cq,
                        pairPr: pairItem.pr,
                        pairTotal: pairItem.total,
                        pairHasMarks: pairItem.hasMarks,
                        pairIsAbsent: pairItem.isAbsent,
                        group: groupType,
                        isOptional: false
                    });"""

    if old_paired_push.search(content):
        content = old_paired_push.sub(new_paired_push, content, count=1)
        print(f"[{file_path}] [OK] Updated paired rows.push")
    else:
        print(f"[{file_path}] [FAIL] old_paired_push not matched")

    old_single_push = re.compile(
        r"rows\.push\(\{\s*"
        r"name: curName,\s*"
        r"fullMarks: curFull,\s*"
        r"mcq: current\.mcq,\s*"
        r"cq: current\.cq,\s*"
        r"pr: current\.pr,\s*"
        r"total: current\.total,\s*"
        r"hasMarks: current\.hasMarks,\s*"
        r"isAbsent: current\.isAbsent,\s*"
        r"isCombined: false,\s*"
        r"group: groupType,\s*"
        r"isOptional: current\.isOptional \|\| groupType === 'optional'\s*"
        r"\}\);",
        re.MULTILINE
    )

    new_single_push = """rows.push({
                        name: curName,
                        fullMarks: curFull,
                        cqFull: current.cqFull !== undefined ? current.cqFull : null,
                        mcqFull: current.mcqFull !== undefined ? current.mcqFull : null,
                        pracFull: current.pracFull !== undefined ? current.pracFull : null,
                        mcq: current.mcq,
                        cq: current.cq,
                        pr: current.pr,
                        total: current.total,
                        hasMarks: current.hasMarks,
                        isAbsent: current.isAbsent,
                        isCombined: false,
                        group: groupType,
                        isOptional: current.isOptional || groupType === 'optional'
                    });"""

    if old_single_push.search(content):
        content = old_single_push.sub(new_single_push, content, count=1)
        print(f"[{file_path}] [OK] Updated single rows.push")
    else:
        print(f"[{file_path}] [FAIL] old_single_push not matched")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

update_marksheet('Marksheet.html')
update_marksheet('Marksheet1.html')

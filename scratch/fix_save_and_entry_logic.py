import re, json, sqlite3

file_path = 'exam-portal.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update renderExamMarksModalRows to use multi-key fallback
old_render_part = """                const key = `marks_${student.id}_${activeExamScheduleId}`;
                const studentExamMarks = savedMarks[key] ? savedMarks[key][activeExamSubjectCode] : null;"""

new_render_part = """                let studentExamMarks = null;
                const rawReg = toEnglishDigits(student.regNo || student.registrationNo || student.studentId || student.id || '').trim();
                const rawId = toEnglishDigits(student.id || '').trim();
                const possibleKeys = [
                    `marks_${student.id}_${activeExamScheduleId}`,
                    `marks_${rawReg}_${activeExamScheduleId}`,
                    `marks_${rawId}_${activeExamScheduleId}`,
                    `marks_${student.regNo}_${activeExamScheduleId}`,
                    `marks_${student.studentId}_${activeExamScheduleId}`,
                    `marks_${student.id}_${examVal}`,
                    `marks_${rawReg}_${examVal}`
                ];
                for (const k of possibleKeys) {
                    if (savedMarks[k] && typeof savedMarks[k] === 'object') {
                        if (savedMarks[k][activeExamSubjectCode] !== undefined) {
                            studentExamMarks = savedMarks[k][activeExamSubjectCode];
                            break;
                        } else if (sch && sch.subject && savedMarks[k][sch.subject] !== undefined) {
                            studentExamMarks = savedMarks[k][sch.subject];
                            break;
                        } else if (sch && sch.subjectCode && savedMarks[k][sch.subjectCode] !== undefined) {
                            studentExamMarks = savedMarks[k][sch.subjectCode];
                            break;
                        } else {
                            const firstVal = Object.values(savedMarks[k])[0];
                            if (firstVal !== undefined) {
                                studentExamMarks = firstVal;
                                break;
                            }
                        }
                    }
                }"""

if old_render_part in content:
    content = content.replace(old_render_part, new_render_part, 1)
    print("SUCCESS: Updated renderExamMarksModalRows")
else:
    print("WARNING: old_render_part not found!")

# 2. Update downloadExamMarksTemplate
old_dl_part = """            activeExamStudents.forEach((student, idx) => {
                const key = `marks_${student.id}_${activeExamScheduleId}`;
                const studentExamMarks = savedMarks[key] ? savedMarks[key][activeExamSubjectCode] : null;"""

new_dl_part = """            activeExamStudents.forEach((student, idx) => {
                let studentExamMarks = null;
                const rawReg = toEnglishDigits(student.regNo || student.registrationNo || student.studentId || student.id || '').trim();
                const rawId = toEnglishDigits(student.id || '').trim();
                const possibleKeys = [
                    `marks_${student.id}_${activeExamScheduleId}`,
                    `marks_${rawReg}_${activeExamScheduleId}`,
                    `marks_${rawId}_${activeExamScheduleId}`,
                    `marks_${student.regNo}_${activeExamScheduleId}`,
                    `marks_${student.studentId}_${activeExamScheduleId}`,
                    `marks_${student.id}_${examVal}`,
                    `marks_${rawReg}_${examVal}`
                ];
                for (const k of possibleKeys) {
                    if (savedMarks[k] && typeof savedMarks[k] === 'object') {
                        if (savedMarks[k][activeExamSubjectCode] !== undefined) {
                            studentExamMarks = savedMarks[k][activeExamSubjectCode];
                            break;
                        } else if (sch && sch.subject && savedMarks[k][sch.subject] !== undefined) {
                            studentExamMarks = savedMarks[k][sch.subject];
                            break;
                        } else if (sch && sch.subjectCode && savedMarks[k][sch.subjectCode] !== undefined) {
                            studentExamMarks = savedMarks[k][sch.subjectCode];
                            break;
                        }
                    }
                }"""

if old_dl_part in content:
    content = content.replace(old_dl_part, new_dl_part, 1)
    print("SUCCESS: Updated downloadExamMarksTemplate")
else:
    print("WARNING: old_dl_part not found!")

# 3. Update saveAndEntryExamMarks student matching
old_save_match = """                    state.students.forEach(student => {
                        const rawReg = toEnglishDigits(student.id || student.regNo || '').trim();
                        const rawRoll = toEnglishDigits(student.roll || '').trim();
                        const mcqScore = (student.status === 'পেন্ডিং' && (!student.correct || student.correct === 0)) ? 0 : (student.correct || 0);
                        const isAbsent = student.status === 'পেন্ডিং' && !student.isRealScanned;

                        // Find master student record in school_students
                        const masterSt = allStudents.find(st =>
                            isRegNoMatch(st.regNo, rawReg) ||
                            isRegNoMatch(st.studentId, rawReg) ||
                            isRegNoMatch(st.id, rawReg) ||
                            (mapClassToNumber(st.class) === mapClassToNumber(student.class) && String(st.roll) === rawRoll)
                        );"""

new_save_match = """                    state.students.forEach(student => {
                        const rawReg = toEnglishDigits(student.id || student.regNo || '').trim();
                        const rawRoll = toEnglishDigits(student.roll || '').trim();
                        const isPending = (student.status === 'পেন্ডিং' && !student.isRealScanned && (!student.correct || student.correct === 0));
                        const isAbsent = isPending;
                        const mcqScore = isAbsent ? 0 : (typeof student.correct === 'number' ? student.correct : (parseInt(student.correct, 10) || 0));

                        // Strict Step 1: Find master student record by Registration Number / Student ID / ID first (Unique Exact Match)
                        let masterSt = allStudents.find(st =>
                            isRegNoMatch(st.regNo, rawReg) ||
                            isRegNoMatch(st.studentId, rawReg) ||
                            isRegNoMatch(st.id, rawReg)
                        );

                        // Strict Step 2: Fallback ONLY if no match found by RegNo: Match by Class + Section + Roll
                        if (!masterSt) {
                            const sSec = (student.section || '').trim().toLowerCase();
                            const sCls = mapClassToNumber(student.class);
                            masterSt = allStudents.find(st =>
                                mapClassToNumber(st.class) === sCls &&
                                (String(st.section || '').trim().toLowerCase() === sSec) &&
                                toEnglishDigits(String(st.roll || '')).trim() === rawRoll
                            );
                        }

                        // Strict Step 3: Fallback ONLY if still no match and section is not specified/All: Match by Class + Roll
                        if (!masterSt) {
                            const sCls = mapClassToNumber(student.class);
                            masterSt = allStudents.find(st =>
                                mapClassToNumber(st.class) === sCls &&
                                toEnglishDigits(String(st.roll || '')).trim() === rawRoll
                            );
                        }"""

if old_save_match in content:
    content = content.replace(old_save_match, new_save_match, 1)
    print("SUCCESS: Updated saveAndEntryExamMarks matching")
else:
    print("WARNING: old_save_match not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished writing updated exam-portal.html")

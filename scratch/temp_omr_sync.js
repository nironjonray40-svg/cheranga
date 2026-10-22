                   if (schIdx !== -1) {
                            schedules[schIdx] = targetSch;
                        }
                        localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
                        fetch('/api/db/set', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: 'school_exam_schedules', value: JSON.stringify(schedules) })
                        }).catch(() => { });
                    }

                    // 2. Load all school students to guarantee matching master student records
                    let allStudents = [];
                    try {
                        if (typeof loadStudents === 'function') {
                            allStudents = loadStudents() || [];
                        } else {
                            allStudents = safeJsonParse('school_students', []);
                        }
                    } catch (e) { }

                    // 3. Update student marks in school_student_marks
                    let savedMarks = {};
                    try {
                        if (typeof loadStudentMarks === 'function') {
                            savedMarks = loadStudentMarks() || {};
                        } else {
                            savedMarks = safeJsonParse('school_student_marks', {});
                        }
                    } catch (e) { }

                    const subMap = (typeof loadSubjects === 'function') ? loadSubjects() : safeJsonParse('school_subjects', {});
                    const schClass = targetSch ? targetSch.class : (examInfo.class || '');
                    const classSubjects = subMap[schClass] || [];
                    const subObj = classSubjects.find(s => s.name && targetSch && s.name.trim().toLowerCase() === (targetSch.subject || '').trim().toLowerCase());
                    const activeExamSubjectCode = subObj ? subObj.code : ((targetSch && (targetSch.subjectCode || targetSch.subject)) || examInfo.subject || 'MCQ');
                    
                    const targetSubjectKeys = new Set([
                        activeExamSubjectCode,
                        targetSch ? targetSch.subject : null,
                        targetSch ? targetSch.subjectCode : null,
                        examInfo.subject
                    ].filter(Boolean));

                    const examVal = targetSch ? targetSch.term : (examInfo.examName || 'Exam');

                    state.students.forEach(student => {
                        const rawReg = toEnglishDigits(student.id || student.regNo || '').trim();
                        const rawRoll = toEnglishDigits(student.roll || '').trim();
                        const isPending = (student.status === 'পেন্ডিং' && !student.isRealScanned && (!student.correct || student.correct === 0));
                        
                        // Do not create unentered/absent dummy entries for students whose OMR was not evaluated
                        if (isPending) return;

                        const mcqScore = typeof student.correct === 'number' ? student.correct : (parseInt(student.correct, 10) || 0);

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
                        }

                        const targetStudentIds = new Set();
                        if (masterSt) {
                            if (masterSt.id !== undefined && masterSt.id !== null) targetStudentIds.add(String(masterSt.id));
                            if (masterSt.studentId) targetStudentIds.add(String(masterSt.studentId));
                            if (masterSt.regNo) targetStudentIds.add(String(masterSt.regNo));
                        }
                        if (student.id) targetStudentIds.add(String(student.id));
                        if (student.regNo) targetStudentIds.add(String(student.regNo));
                        if (student.studentId) targetStudentIds.add(String(student.studentId));
                        if (rawReg) targetStudentIds.add(rawReg);

                        // Discover authoritative existing CQ and Practical marks across all candidate lookup keys
                        let authoritativeExistingCq = undefined;
                        let authoritativeExistingPrac = undefined;

                        const candidateLookupKeys = [];
                        targetStudentIds.forEach(idVal => {
                            candidateLookupKeys.push(`marks_${idVal}_${schId}`);
                            candidateLookupKeys.push(`marks_${idVal}_${examVal}`);
                        });

                        for (const lookupKey of candidateLookupKeys) {
                            const record = savedMarks[lookupKey];
                            if (record && typeof record === 'object') {
                                for (const subKey of targetSubjectKeys) {
                                    const subObj = record[subKey];
                                    if (subObj && typeof subObj === 'object') {
                                        if (authoritativeExistingCq === undefined && subObj.cq !== undefined && subObj.cq !== null && subObj.cq !== '') {
                                            authoritativeExistingCq = subObj.cq;
                                        }
                                        if (authoritativeExistingPrac === undefined && subObj.practical !== undefined && subObj.practical !== null && subObj.practical !== '') {
                                            authoritativeExistingPrac = subObj.practical;
                                        }
                                    }
                                }
                            }
                        }

                        let cleanCq = undefined;
                        if (authoritativeExistingCq !== undefined && authoritativeExistingCq !== null && authoritativeExistingCq !== '') {
                            if (authoritativeExistingCq === 'A' || authoritativeExistingCq === 'ABS' || authoritativeExistingCq === 'ABSENT') {
                                cleanCq = 'A';
                            } else if (!isNaN(parseInt(authoritativeExistingCq, 10))) {
                                cleanCq = parseInt(authoritativeExistingCq, 10);
                            }
                        }

                        let cleanPrac = undefined;
                        if (authoritativeExistingPrac !== undefined && authoritativeExistingPrac !== null && authoritativeExistingPrac !== '') {
                            if (authoritativeExistingPrac === 'A' || authoritativeExistingPrac === 'ABS' || authoritativeExistingPrac === 'ABSENT') {
                                cleanPrac = 'A';
                            } else if (!isNaN(parseInt(authoritativeExistingPrac, 10))) {
                                cleanPrac = parseInt(authoritativeExistingPrac, 10);
                            }
                        }

                        const numCq = typeof cleanCq === 'number' ? cleanCq : 0;
                        const numPrac = typeof cleanPrac === 'number' ? cleanPrac : 0;
                        const totalVal = numCq + mcqScore + numPrac;

                        const studentMarkPayload = {
                            total: totalVal,
                            isAbsent: false,
                            cq: cleanCq,
                            mcq: mcqScore,
                            practical: cleanPrac,
                            set: student.set || 'ক',
                            answers: student.answers || {},
                            percentage: student.percentage || ((mcqScore / 30) * 100).toFixed(1),
                            status: student.status,
                            fileName: student.fileName || '',
                            omrEvaluatedAt: student.evaluatedAt || nowIso
                        };

                        targetStudentIds.forEach(stId => {
                            // 1. Update schedule-specific key: marks_${stId}_${schId}
                            const schKey = `marks_${stId}_${schId}`;
                            savedMarks[schKey] = savedMarks[schKey] || {};
                            targetSubjectKeys.forEach(sKey => {
                                savedMarks[schKey][sKey] = studentMarkPayload;
                            });

                            // 2. Update term-level key: marks_${stId}_${examVal} (preserving all other subjects in the term)
                            const termKey = `marks_${stId}_${examVal}`;
                            savedMarks[termKey] = savedMarks[termKey] || {};
                            savedMarks[termKey][activeExamSubjectCode] = studentMarkPayload;
                        });
                    });

                    savedMarks[`timestamp_${schId}`] = nowFormatted;

                    localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
                    fetch('/api/db/set', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'school_student_marks', value: JSON.stringify(savedMarks) })
                    }).catch(() => { });

                    // 3. Save to school_omr_exams & /api/exams
                    const examRecord = {
                        id: String(schId),
                        scheduleId: String(schId),
                        source: examInfo.source,
                        examName: examInfo.examName,
                        subject: examInfo.subject,
                        class: examInfo.class,
                        section: examInfo.section,
                        date: targetSch ? targetSch.date : new Date().toLocaleDateString('bn-BD'),
                        totalStudents: state.students.length,
                        evaluatedStudentsCount: evaluatedStudents.length,
                        students: state.students.map(s => {
                            const isAb = (s.status === 'পেন্ডিং' && !s.isRealScanned) || (!s.correct && !s.evaluatedAt);
                            return {
                                ...s,
                                correct: isAb ? 0 : s.correct,
                                wrong: isAb ? 0 : s.wrong,
                                blank: isAb ? 30 : s.blank,
                                percentage: isAb ? '0.0' : s.percentage,
                                status: isAb ? 'পেন্ডিং' : s.status,
                                answers: isAb ? {} : (s.answers || {}),
                                fileName: isAb ? '' : (s.fileName || ''),
                                isRealScanned: !isAb && !!s.isRealScanned
                            };
                        }),
                        answerKeys: state.answerKeys,
                        lastSavedAt: nowIso
                    };

                    let omrExams = safeJsonParse('school_omr_exams', []);
                    const oeIdx = omrExams.findIndex(x => String(x.id) === String(schId));
                    if (oeIdx !== -1) {
                        omrExams[oeIdx] = examRecord;
                    } else {
                        omrExams.unshift(examRecord);
                    }
                    localStorage.setItem('school_omr_exams', JSON.stri
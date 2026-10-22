tEl && inputEl.type === 'checkbox') {
                if (absIn.checked) {
                    if (cqIn && (!rawCq || rawCq === "")) cqIn.value = "A";
                }
            } else if (hasAType) {
                if (absIn) absIn.checked = true;
            }

            const isAbsent = (absIn && absIn.checked) || hasAType;

            const nCq = parseInt(rawCq, 10);
            const nMcq = parseInt(rawMcq, 10);
            const nPrac = parseInt(rawPrac, 10);

            // Validation styling
            if (cqIn) {
                if (rawCq !== "" && rawCq.toUpperCase() !== "A" && rawCq.toUpperCase() !== "ABS" && (isNaN(nCq) || nCq < 0 || nCq > activeExamDist.cq)) {
                    cqIn.style.borderColor = "#dc2626";
                } else {
                    cqIn.style.borderColor = "#cbd5e1";
                }
            }

            if (mcqIn) {
                if (rawMcq !== "" && rawMcq.toUpperCase() !== "A" && rawMcq.toUpperCase() !== "ABS" && (isNaN(nMcq) || nMcq < 0 || nMcq > activeExamDist.mcq)) {
                    mcqIn.style.borderColor = "#dc2626";
                } else {
                    mcqIn.style.borderColor = "#cbd5e1";
                }
            }

            if (pracIn) {
                if (rawPrac !== "" && rawPrac.toUpperCase() !== "A" && rawPrac.toUpperCase() !== "ABS" && (isNaN(nPrac) || nPrac < 0 || nPrac > activeExamDist.practical)) {
                    pracIn.style.borderColor = "#dc2626";
                } else {
                    pracIn.style.borderColor = "#cbd5e1";
                }
            }

            const hasEnteredAny = isAbsent || rawCq !== "" || rawMcq !== "" || rawPrac !== "";
            const totalMark = isAbsent ? "A" : (hasEnteredAny ? ((isNaN(nCq) ? 0 : nCq) + (isNaN(nMcq) ? 0 : nMcq) + (isNaN(nPrac) ? 0 : nPrac)) : "");

            const totalGradeCell = document.getElementById(`modal-cell-totalgrade-${studentId}`);

            if (isAbsent) {
                if (totalGradeCell) {
                    totalGradeCell.innerHTML = `<span class="badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; padding:2px 8px; font-weight:700;">Absent (F - 0.00)</span>`;
                }
            } else if (hasEnteredAny) {
                const gradeInfo = getGradeDetails(totalMark, activeExamDist.total, activeExamDist.passPercent, { cq: rawCq, mcq: rawMcq, practical: rawPrac }, activeExamDist);
                const isPassed = gradeInfo.gp > 0;

                if (totalGradeCell) {
                    totalGradeCell.innerHTML = `<span style="font-weight:700; color:#0f172a; margin-right:6px;">${totalMark}</span> <span style="color:${isPassed ? '#059669' : '#dc2626'}; font-weight:bold;">${gradeInfo.name} (${gradeInfo.gp.toFixed(2)})</span>`;
                }
            } else {
                if (totalGradeCell) totalGradeCell.innerText = '-';
            }

            updateExamMarksModalLiveStats();
        }

        function updateExamMarksModalLiveStats() {
            let totalCount = activeExamStudents.length;
            let enteredCount = 0;
            let passedCount = 0;
            let failedCount = 0;
            let absentCount = 0;
            let totalSum = 0;

            const studentMarksList = [];

            activeExamStudents.forEach(student => {
                const row = document.getElementById(`modal-row-student-${student.id}`);
                let absIn = null, rawCq = "", rawMcq = "", rawPrac = "";
                if (row) {
                    absIn = row.querySelector('.modal-mark-absent');
                    const cqIn = row.querySelector('.modal-mark-cq');
                    const mcqIn = row.querySelector('.modal-mark-mcq');
                    const pracIn = row.querySelector('.modal-mark-prac');
                    rawCq = cqIn ? cqIn.value.trim() : "";
                    rawMcq = mcqIn ? mcqIn.value.trim() : "";
                    rawPrac = pracIn ? pracIn.value.trim() : "";
                }

                const hasAType = rawCq.toUpperCase() === "A" || rawCq.toUpperCase() === "ABS" || rawCq.toUpperCase() === "ABSENT" ||
                    rawMcq.toUpperCase() === "A" || rawMcq.toUpperCase() === "ABS" || rawMcq.toUpperCase() === "ABSENT" ||
                    rawPrac.toUpperCase() === "A" || rawPrac.toUpperCase() === "ABS" || rawPrac.toUpperCase() === "ABSENT";
                const isAbsent = (absIn && absIn.checked) || hasAType;
                const hasEntered = isAbsent || rawCq !== "" || rawMcq !== "" || rawPrac !== "";
                let sum = 0;

                if (isAbsent) {
                    enteredCount++;
                    absentCount++;
                    failedCount++;
                } else if (hasEntered) {
                    enteredCount++;
                    sum = (parseInt(rawCq, 10) || 0) + (parseInt(rawMcq, 10) || 0) + (parseInt(rawPrac, 10) || 0);
                    totalSum += sum;
                    const gradeInfo = getGradeDetails(sum, activeExamDist.total, activeExamDist.passPercent, { cq: rawCq, mcq: rawMcq, practical: rawPrac }, activeExamDist);
                    if (gradeInfo.gp > 0) passedCount++;
                    else failedCount++;
                }

                studentMarksList.push({
                    id: student.id,
                    hasEntered: hasEntered && !isAbsent,
                    isAbsent: isAbsent,
                    total: sum
                });
            });

            // Calculate Ranks for students with entered marks (excluding absent)
            const enteredStudents = studentMarksList.filter(s => s.hasEntered).sort((a, b) => b.total - a.total);
            const rankMap = {};
            enteredStudents.forEach((st, idx) => {
                rankMap[st.id] = idx + 1;
            });

            // Update Rank cell in each student row
            studentMarksList.forEach(st => {
                const rankCell = document.getElementById(`modal-cell-rank-${st.id}`);
                if (rankCell) {
                    if (st.isAbsent) {
                        rankCell.innerHTML = `<span style="color:#dc2626; font-weight:700; font-size:1.075rem;">ABS</span>`;
                    } else if (st.hasEntered && rankMap[st.id]) {
                        const rankNum = rankMap[st.id];
                        let rankColor = "#0284c7";
                        if (rankNum === 1) rankColor = "#d97706";
                        else if (rankNum === 2) rankColor = "#475569";
                        else if (rankNum === 3) rankColor = "#b45309";
                        rankCell.innerHTML = `<span style="font-weight:700; color:${rankColor}; font-size:1.202rem;">${rankNum}</span>`;
                    } else {
                        rankCell.innerText = '-';
                    }
                }
            });

            document.getElementById('stat-total-students').innerText = totalCount;
            document.getElementById('stat-entered-students').innerText = `${enteredCount}/${totalCount}`;
            document.getElementById('stat-passed-students').innerText = passedCount;
            document.getElementById('stat-failed-students').innerText = absentCount > 0 ? `${failedCount} (${absentCount} ABS)` : failedCount;
            const nonAbsentExaminees = enteredCount - absentCount;
            document.getElementById('stat-avg-mark').innerText = nonAbsentExaminees > 0 ? (totalSum / nonAbsentExaminees).toFixed(1) : "0.0";
        }

        function saveExamMarksModal() {
            if (!activeExamScheduleId) return;

            const schedules = loadSchedules();
            const sch = schedules.find(s => String(s.id) === String(activeExamScheduleId));
            if (!sch) return;

            const examVal = sch.term;
            const savedMarks = loadStudentMarks();

            let isValid = true;
            let countSaved = 0;

            activeExamStudents.forEach(student => {
                const row = document.getElementById(`modal-row-student-${student.id}`);
                if (!row) return;

                const absIn = row.querySelector('.modal-mark-absent');
                const cqIn = row.querySelector('.modal-mark-cq');
                const mcqIn = row.querySelector('.modal-mark-mcq');
                const pracIn = row.querySelector('.modal-mark-prac');

                const rawCq = cqIn ? cqIn.value.trim() : "";
                const rawMcq = mcqIn ? mcqIn.value.trim() : "";
                const rawPrac = pracIn ? pracIn.value.trim() : "";

                const hasAType = rawCq.toUpperCase() === "A" || rawCq.toUpperCase() === "ABS" || rawCq.toUpperCase() === "ABSENT" ||
                    rawMcq.toUpperCase() === "A" || rawMcq.toUpperCase() === "ABS" || rawMcq.toUpperCase() === "ABSENT" ||
                    rawPrac.toUpperCase() === "A" || rawPrac.toUpperCase() === "ABS" || rawPrac.toUpperCase() === "ABSENT";
                const isAbsent = (absIn && absIn.checked) || hasAType;

                const key = `marks_${student.id}_${activeExamScheduleId}`;

                if (!isAbsent && rawCq === "" && rawMcq === "" && rawPrac === "") {
                    if (savedMarks[key] && savedMarks[key][activeExamSubjectCode]) {
                        delete savedMarks[key][activeExamSubjectCode];
                        if (Object.keys(savedMarks[key]).length === 0) {
                            delete savedMarks[key];
                        }
                    }
                    return;
                }

                savedMarks[key] = savedMarks[key] || {};

                if (isAbsent) {
                    savedMarks[key][activeExamSubjectCode] = {
                        total: 0,
                        isAbsent: true,
                        cq: rawCq ? rawCq.toUpperCase() : "A",
                        mcq: rawMcq ? rawMcq.toUpperCase() : "A",
                        practical: rawPrac ? rawPrac.toUpperCase() : "A"
                    };
                    countSaved++;
                } else {
                    const nCq = parseInt(rawCq, 10);
                    const nMcq = parseInt(rawMcq, 10);
                    const nPrac = parseInt(rawPrac, 10);

                    const hasCq = rawCq !== "" && !isNaN(nCq);
                    const hasMcq = rawMcq !== "" && !isNaN(nMcq);
                    const hasPrac = rawPrac !== "" && !isNaN(nPrac);

                    if (rawCq !== "" && (!hasCq || nCq < 0 || nCq > activeExamDist.cq)) isValid = false;
                    if (rawMcq !== "" && (!hasMcq || nMcq < 0 || nMcq > activeExamDist.mcq)) isValid = false;
                    if (rawPrac !== "" && (!hasPrac || nPrac < 0 || nPrac > activeExamDist.practical)) isValid = false;

                    const totalVal = (hasCq ? nCq : 0) + (hasMcq ? nMcq : 0) + (hasPrac ? nPrac : 0);

                    savedMarks[key][activeExamSubjectCode] = {
                        total: totalVal,
                        isAbsent: false,
                        cq: hasCq ? nCq : undefined,
                        mcq: hasMcq ? nMcq : undefined,
                        practical: hasPrac ? nPrac : undefined
                    };
                    countSaved++;
                }
            });

            if (!isValid) {
                alert("Some entered marks exceed the maximum distribution limit! Please check fields highlighted in red.");
                return;
            }

            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const hoursStr = String(hours).padStart(2, '0');
            const formattedTimestamp = `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;

            savedMarks[`timestamp_${activeExamScheduleId}`] = formattedTimestamp;

            if (sch) {
                sch.marksEntryTime = formattedTimestamp;
                sch.hasMarks = true;
                const scheduleIdx = schedules.findIndex(s => String(s.id) === String(activeExamScheduleId));
                if (scheduleIdx !== -1) {
                    schedules[scheduleIdx].marksEntryTime = formattedTimestamp;
                    schedules[scheduleIdx].hasMarks = true;
                }
                localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
                if (sch.term) {
                    localStorage.setItem('school_active_exam_filter', sch.term);
                }
            }

            localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
            showExamToast(`Saved exam marks for ${countSaved} students successfully!`, true);
            window.dispatchEvent(new CustomEvent('dbSynced'));
            // Refresh schedule list and dashboard routine summary so row colors and statuses update immediately
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            // Close the marks entry modal window automatically after saving
            closeExamMarksEntryModal();
        }

        function downloadExamMarksTemplate() {
            if (!activeExamScheduleId) return;
            const schedules = loadSchedules();
            const sch = schedules.find(s => String(s.id) === String(activeExamScheduleId));
            if (!sch) return;

            const savedMarks = loadStudentMarks();
            const examVal = sch.term;
            const schoolName = document.getElementById('school-name')?.innerText.trim() || 'Al-haj Mobarak Hossain Anirban Bydda Tirtha M,l High School';

            const line1 = [schoolName];
            const line2 = [`Class: ${sch.class}, Section: ${sch.section || 'All'}, Subject Name: ${sch.subject}, Subject Code: ${activeExamSubjectCode}`];
            const line3 = [`Exam Name: ${sch.term}, Exam Type: ${sch.examType || 'Main'}, Exam Date: ${sch.date}, Exam No: ${sch.slNo || '-'}, Teacher: ${sch.teacher || 'N/A'}`];
            const line4 = [`বি:দ্র: অনুপস্থিত শিক্ষার্থীর ক্ষেত্রে CQ অথবা MCQ এর ঘরে A লিখতে হবে`];
            const line5 = []; // Blank line for spacing

            // Table Headers
            const idHeader = currentMarksEntryViewType === 'reg_no' ? "Reg No" : "Student ID";
            const headers = ["SL", idHeader, "Student Name (Bangla)", "Section"];
            if (activeExamDist.cq > 0) headers.push("CQ");
            if (activeExamDist.mcq > 0) headers.push("MCQ");
            if (activeExamDist.practical > 0) headers.push("Practical");

            const rowsAoa = [line1, line2, line3, line4, line5, headers];

            activeExamStudents.forEach((student, idx) => {
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
                }

                let isAbsent = false;
                let cqVal = "";
                let mcqVal = "";
                let pracVal = "";

                if (studentExamMarks !== null && studentExamMarks !== undefined) {
                    if (typeof studentExamMarks === 'object') {
                        isAbsent = studentExamMarks.isAbsent === true ||
               
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
                } else {
                    const nCq = parseInt(rawCq, 10);
                    const nMcq = parseInt(rawMcq, 10);
                    const nPrac = parseInt(rawPrac, 10);
                    const hasCq = rawCq !== "" && !isNaN(nCq);
                    const hasMcq = rawMcq !== "" && !isNaN(nMcq);
                    const hasPrac = rawPrac !== "" && !isNaN(nPrac);

                    savedMarks[key][activeExamSubjectCode] = {
                        total: (hasCq ? nCq : 0) + (hasMcq ? nMcq : 0) + (hasPrac ? nPrac : 0),
                        isAbsent: false,
                        cq: hasCq ? nCq : undefined,
                        mcq: hasMcq ? nMcq : undefined,
                        practical: hasPrac ? nPrac : undefined
                    };
                }
            });
            localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
        }

        function changeMarksEntryViewType(newType) {
            autoSaveCurrentModalInputsToMemory();
            currentMarksEntryViewType = newType;
            localStorage.setItem('school_exam_marks_entry_view_type', newType);
            populateActiveExamStudents(newType);
            renderExamMarksModalRows();
        }

        function closeExamMarksEntryModal() {
            const modal = document.getElementById('exam-marks-entry-modal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                modal.style.pointerEvents = 'none';
            }
            activeExamScheduleId = null;
        }

        function renderExamMarksModalRows() {
            const container = document.getElementById('modal-student-marks-rows');
            if (!container) return;

            if (activeExamStudents.length === 0) {
                container.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--muted-text); font-style:italic;">No students found for this class and section. Please add students in Student Management first.</td></tr>`;
                updateExamMarksModalLiveStats();
                return;
            }

            const savedMarks = loadStudentMarks();
            const schedules = loadSchedules();
            const sch = schedules.find(s => String(s.id) === String(activeExamScheduleId));
            const examVal = sch ? sch.term : '';

            const searchInput = document.getElementById('modal-student-search-input');
            const searchKey = searchInput ? searchInput.value.trim().toLowerCase() : '';

            let html = "";
            let lastRenderedSection = null;

            activeExamStudents.forEach((student, idx) => {
                // Search filter check
                if (searchKey) {
                    const rStr = (student.roll || '').toString().toLowerCase();
                    const nStr = ((student.name || '') + ' ' + (student.nameBn || '')).toLowerCase();
                    const idStr = (student.studentId || student.id || '').toLowerCase();
                    const regStr = (student.regNo || student.registrationNo || '').toLowerCase();
                    if (!rStr.includes(searchKey) && !nStr.includes(searchKey) && !idStr.includes(searchKey) && !regStr.includes(searchKey)) {
                        return;
                    }
                }

                const currentSec = (student.section || 'A').trim();

                // Show Section Header Row above the first student of each section only in "Student ID/Roll" mode
                if (currentMarksEntryViewType === 'roll' && currentSec !== lastRenderedSection) {
                    lastRenderedSection = currentSec;
                    const secStudentsCount = activeExamStudents.filter(s => (s.section || 'A').trim() === currentSec).length;

                    html += `
                        <tr class="modal-section-header-row" style="background:#f8fafc; border-top:2px solid #e2e8f0; border-bottom:1.5px solid #cbd5e1;">
                            <td colspan="9" style="padding:8px 16px; text-align:left; background:linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%);">
                                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                                    <div style="display:flex; align-items:center; gap:8px; font-weight:800; color:#1e40af; font-size:1.02rem;">
                                        <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; background:#2563eb; color:#ffffff; border-radius:50%; font-size:0.75rem;">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        </span>
                                        <span>শাখা (Section): <strong style="color:#2563eb; font-size:1.08rem; font-weight:800;">${currentSec}</strong></span>
                                    </div>
                                    <span style="font-size:0.83rem; font-weight:700; color:#475569; background:#ffffff; border:1px solid #cbd5e1; padding:2px 10px; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                                        মোট শিক্ষার্থী: ${secStudentsCount} জন
                                    </span>
                                </div>
                            </td>
                        </tr>
                    `;
                }

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
                        } else {
                            const firstVal = Object.values(savedMarks[k])[0];
                            if (firstVal !== undefined) {
                                studentExamMarks = firstVal;
                                break;
                            }
                        }
                    }
                }

                let isAbsent = false;
                let cqVal = "";
                let mcqVal = "";
                let pracVal = "";

                if (studentExamMarks !== null && studentExamMarks !== undefined) {
                    if (typeof studentExamMarks === 'object') {
                        const rawCq = studentExamMarks.cq;
                        const rawMcq = studentExamMarks.mcq;
                        const rawPrac = studentExamMarks.practical;

                        // Check if this is an unentered/pending placeholder stub
                        const isPendingStub = (studentExamMarks.status === 'পেন্ডিং' && !studentExamMarks.fileName && !studentExamMarks.omrEvaluatedAt && (rawMcq === 0 || rawMcq === undefined || rawMcq === "") && (rawCq === 0 || rawCq === undefined || rawCq === ""));

                        if (!isPendingStub) {
                            const hasACq = String(rawCq).toUpperCase() === "A" || String(rawCq).toUpperCase() === "ABS";
                            const hasAMcq = String(rawMcq).toUpperCase() === "A" || String(rawMcq).toUpperCase() === "ABS";
                            const hasAPrac = String(rawPrac).toUpperCase() === "A" || String(rawPrac).toUpperCase() === "ABS";

                            isAbsent = (studentExamMarks.isAbsent === true && (hasACq || hasAMcq || hasAPrac || (rawCq === undefined && rawMcq === undefined && rawPrac === undefined))) ||
                                hasACq || hasAMcq || hasAPrac;

                            if (rawCq !== undefined && rawCq !== null && rawCq !== "") {
                                // If from OMR evaluation where CQ was defaulted to 0 without manual entry, leave CQ blank
                                if (rawCq === 0 && studentExamMarks.omrEvaluatedAt && studentExamMarks.fileName && (studentExamMarks.mcq !== undefined && studentExamMarks.mcq !== null)) {
                                    cqVal = "";
                                } else {
                                    cqVal = String(rawCq);
                                }
                            }
                            if (rawMcq !== undefined && rawMcq !== null && rawMcq !== "") {
                                mcqVal = String(rawMcq);
                            }
                            if (rawPrac !== undefined && rawPrac !== null && rawPrac !== "") {
                                pracVal = String(rawPrac);
                            }
                        }
                    } else {
                        cqVal = studentExamMarks !== "" ? String(studentExamMarks) : "";
                        isAbsent = String(cqVal).toUpperCase() === "A" || String(cqVal).toUpperCase() === "ABS";
                    }
                }

                // Calculate initial total, grade, status
                const numCq = parseInt(cqVal, 10);
                const numMcq = parseInt(mcqVal, 10);
                const numPrac = parseInt(pracVal, 10);

                const hasCq = cqVal !== "" && !isNaN(numCq);
                const hasMcq = mcqVal !== "" && !isNaN(numMcq);
                const hasPrac = pracVal !== "" && !isNaN(numPrac);

                const hasEnteredAny = isAbsent || hasCq || hasMcq || hasPrac;

                let totalMark = "";
                if (isAbsent) {
                    totalMark = "A";
                } else if (hasEnteredAny) {
                    totalMark = (hasCq ? numCq : 0) + (hasMcq ? numMcq : 0) + (hasPrac ? numPrac : 0);
                }

                const gradeInfo = hasEnteredAny ? (isAbsent ? { name: "F", gp: 0 } : getGradeDetails(totalMark, activeExamDist.total, activeExamDist.passPercent, { cq: cqVal, mcq: mcqVal, practical: pracVal }, activeExamDist)) : { name: "-", gp: 0 };
                const isPassed = !isAbsent && hasEnteredAny && gradeInfo.gp > 0;

                // ID / Reg display text depending on current view type
                let idDisplay = "";
                if (currentMarksEntryViewType === 'reg_no') {
                    idDisplay = student.regNo || student.registrationNo || student.studentId || student.id || '-';
                } else {
                    idDisplay = student.studentId || (student.roll ? `Roll: ${student.roll}` : student.id) || '-';
                }

                html += `
                    <tr id="modal-row-student-${student.id}" style="border-bottom:1px solid #e2e8f0;">
                        <td style="text-align:center;"><span style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-weight:700; color:#0284c7;">${idx + 1}</span></td>
                        <td style="text-align:center; color:#334155; font-size:1.02rem; font-weight:700; font-family:monospace;">${idDisplay}</td>
                        <td style="text-align:left; color:#0f172a; font-weight:600;">
                            <div>${student.nameBn || student.name}</div>
                            ${currentMarksEntryViewType === 'reg_no' && student.roll ? `<div style="font-size:0.78rem; color:#64748b; font-weight:normal;">Roll: ${student.roll}</div>` : ''}
                        </td>
                        <td style="text-align:center; color:#e11d48; font-size:1.02rem; font-weight:700;">${student.section || 'A'}</td>
                        
                        <td style="text-align:center; ${activeExamDist.cq > 0 ? '' : 'display:none;'}">
                            <input type="text" class="student-mark-input-sm modal-mark-cq" data-studentid="${student.id}" value="${cqVal}" placeholder="" style="background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" oninput="onExamMarkInputChange(this, '${student.id}')" onkeydown="handleInputKeyNavigation(event, this, 'cq')">
                        </td>
                        <td style="text-align:center; ${activeExamDist.mcq > 0 ? '' : 'display:none;'}">
                            <input type="text" class="student-mark-input-sm modal-mark-mcq" data-studentid="${student.id}" value="${mcqVal}" placeholder="" style="background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" oninput="onExamMarkInputChange(this, '${student.id}')" onkeydown="handleInputKeyNavigation(event, this, 'mcq')">
                        </td>
                        <td style="text-align:center; ${activeExamDist.practical > 0 ? '' : 'display:none;'}">
                            <input type="text" class="student-mark-input-sm modal-mark-prac" data-studentid="${student.id}" value="${pracVal}" placeholder="" style="background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" oninput="onExamMarkInputChange(this, '${student.id}')" onkeydown="handleInputKeyNavigation(event, this, 'prac')">
                        </td>

                        <td style="text-align:center; color:#0f172a;" id="modal-cell-totalgrade-${student.id}">
                            ${isAbsent ? `<span class="badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; padding:2px 8px; font-weight:700;">Absent (F - 0.00)</span>` : (hasEnteredAny ? `<span style="font-weight:700; color:#0f172a; margin-right:6px;">${totalMark}</span> <span style="color:${isPassed ? '#059669' : '#dc2626'}; font-weight:bold;">${gradeInfo.name} (${gradeInfo.gp.toFixed(2)})</span>` : '-')}
                        </td>
                        <td style="text-align:center;" id="modal-cell-rank-${student.id}">${isAbsent ? '<span style="color:#dc2626; font-weight:700; font-size:1.075rem;">ABS</span>' : '-'}</td>
                    </tr>
                `;
            });

            container.innerHTML = html;
            updateExamMarksModalLiveStats();
        }

        function filterExamMarksModalStudents() {
            renderExamMarksModalRows();
        }

        function handleInputKeyNavigation(e, currentInput, fieldType) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                const inputs = Array.from(document.querySelectorAll(`.modal-mark-${fieldType}`));
                const currIdx = inputs.indexOf(currentInput);
                if (currIdx !== -1 && currIdx < inputs.length - 1) {
                    inputs[currIdx + 1].focus();
                    inputs[currIdx + 1].select();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const inputs = Array.from(document.querySelectorAll(`.modal-mark-${fieldType}`));
                const currIdx = inputs.indexOf(currentInput);
                if (currIdx > 0) {
                    inputs[currIdx - 1].focus();
                    inputs[currIdx - 1].select();
                }
            }
        }

        function onExamMarkInputChange(inputEl, studentId) {
            const row = document.getElementById(`modal-row-student-${studentId}`);
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

            if (inputEl && inputEl.type === 'checkbox') {
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
                if (totalGradeCell
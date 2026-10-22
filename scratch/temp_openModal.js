 14.01 9 11.01"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
                </svg>
                <span>${msg}</span>
            `;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.4s ease';
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }

        


function openExamMarksEntryModal(scheduleId) {
            const schedules = loadSchedules();
            const sch = schedules.find(s => String(s.id) === String(scheduleId));
            if (!sch) {
                alert("Exam Schedule not found!");
                return;
            }

            activeExamScheduleId = scheduleId;

            // Find matching subject code
            const subMap = loadSubjects();
            const classSubjects = subMap[sch.class] || [];
            const subObj = classSubjects.find(s => s && s.name && sch && sch.subject && s.name.trim().toLowerCase() === sch.subject.trim().toLowerCase());
            const subCode = subObj ? subObj.code : (sch.subjectCode || sch.subject || '101');
            activeExamSubjectCode = subCode;

            // Get Exam Type distribution dynamically according to sch.term and sch.examType
            const examTypeConfig = getExamTypeConfig(sch.term, sch.examType);
            const dist = getSubjectDistribution(subCode, examTypeConfig, sch.subject);
            const subjectTotal = dist.cq + dist.mcq + dist.practical;
            activeExamDist = { ...dist, total: subjectTotal, passPercent: examTypeConfig.passMarkPercent !== undefined ? examTypeConfig.passMarkPercent : 33 };

            // Update modal header badges & text
            document.getElementById('modal-exam-class-badge').innerText = sch.class;
            document.getElementById('modal-exam-section-badge').innerText = `Sec: ${sch.section || 'All'}`;
            document.getElementById('modal-exam-subject-code').innerText = `Code: ${subCode}`;
            document.getElementById('modal-exam-title-text').innerText = `${sch.subject} - ${sch.term}${sch.examType ? ' (' + sch.examType + ')' : ''}`;

            let distParts = [];
            if (dist.cq > 0) distParts.push(`CQ: ${dist.cq}`);
            if (dist.mcq > 0) distParts.push(`MCQ: ${dist.mcq}`);
            if (dist.practical > 0) distParts.push(`Prac: ${dist.practical}`);
            const distStr = distParts.join(', ') || `Total: ${subjectTotal}`;

            document.getElementById('modal-exam-meta-info').innerText = `Date: ${sch.date} | Exam No: ${sch.slNo || '-'} | Type: ${sch.examType || examTypeConfig.typeName || 'Main'} | Teacher: ${sch.teacher || 'N/A'} | Distribution: ${distStr} (Max: ${subjectTotal})`;

            // Configure table columns (show/hide CQ, MCQ, Practical columns depending on distribution)
            const thCq = document.getElementById('modal-th-cq');
            const thMcq = document.getElementById('modal-th-mcq');
            const thPrac = document.getElementById('modal-th-practical');

            if (thCq) thCq.innerText = dist.cq > 0 ? `CQ (${dist.cq})` : 'CQ';
            if (thMcq) thMcq.innerText = dist.mcq > 0 ? `MCQ (${dist.mcq})` : 'MCQ';
            if (thPrac) thPrac.innerText = dist.practical > 0 ? `Prac (${dist.practical})` : 'Prac';

            if (thCq) thCq.style.display = dist.cq > 0 ? '' : 'none';
            if (thMcq) thMcq.style.display = dist.mcq > 0 ? '' : 'none';
            if (thPrac) thPrac.style.display = dist.practical > 0 ? '' : 'none';

            // Restore last saved view type from localStorage (default: 'roll')
            const savedType = localStorage.getItem('school_exam_marks_entry_view_type') || 'roll';
            currentMarksEntryViewType = savedType;
            const typeFilterEl = document.getElementById('modal-marks-entry-type-filter');
            if (typeFilterEl) typeFilterEl.value = savedType;

            // Populate active students list for saved view type
            populateActiveExamStudents(savedType);

            // Reset search input
            const searchInput = document.getElementById('modal-student-search-input');
            if (searchInput) searchInput.value = "";

            // Render table rows
            renderExamMarksModalRows();

            // Open modal
            const modal = document.getElementById('exam-marks-entry-modal');
            if (modal) {
                modal.classList.add('active');
                modal.style.display = 'flex';
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                modal.style.pointerEvents = 'auto';
            }
        }

        let currentMarksEntryViewType = localStorage.getItem('school_exam_marks_entry_view_type') || 'roll';

        function populateActiveExamStudents(viewType = 'roll') {
            if (!activeExamScheduleId) return;
            const schedules = loadSchedules();
            const sch = schedules.find(s => String(s.id) === String(activeExamScheduleId));
            if (!sch) return;

            const allStudents = loadStudents();
            const schClassClean = (sch.class || '').trim().toUpperCase();

            if (viewType === 'reg_no') {
                // Mode: "Reg No" -> Entire class students, sorted by Reg No
                activeExamStudents = allStudents.filter(s => {
                    if (!s.class) return false;
                    const sClassClean = s.class.trim().toUpperCase();
                    return sClassClean === schClassClean || sClassClean.includes(schClassClean) || schClassClean.includes(sClassClean);
                });

                // Sort by Registration No
                activeExamStudents.sort((a, b) => {
                    const rA = String(a.regNo || a.registrationNo || a.studentId || a.id || '').trim();
                    const rB = String(b.regNo || b.registrationNo || b.studentId || b.id || '').trim();
                    const numA = parseInt(rA, 10);
                    const numB = parseInt(rB, 10);
                    if (!isNaN(numA) && !isNaN(numB) && String(numA) === rA && String(numB) === rB) {
                        return numA - numB;
                    }
                    return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
                });

                // Update UI headers
                const secBadge = document.getElementById('modal-exam-section-badge');
                if (secBadge) secBadge.innerText = `Class: All Sections`;
                const thId = document.getElementById('modal-th-student-id');
                if (thId) thId.innerText = 'Reg No';
            } else {
                // Mode: "Student ID/Roll" -> Filter by schedule's Section(s) and sort by Section & Roll
                const targetSections = sch.section && sch.section !== 'All' ? sch.section.split(',').map(s => s.trim().toUpperCase()) : [];

                activeExamStudents = allStudents.filter(s => {
                    if (!s.class) return false;
                    const sClassClean = s.class.trim().toUpperCase();
                    if (sClassClean !== schClassClean && !sClassClean.includes(schClassClean) && !schClassClean.includes(sClassClean)) {
                        return false;
                    }
                    if (targetSections.length > 0 && s.section) {
                        return targetSections.includes(s.section.trim().toUpperCase());
                    }
                    return true;
                });

                // Sort by Section first, then Roll numerically
                activeExamStudents.sort((a, b) => {
                    const secA = (a.section || 'A').trim().toUpperCase();
                    const secB = (b.section || 'A').trim().toUpperCase();
                    if (secA !== secB) {
                        return secA.localeCompare(secB);
                    }
                    const rollA = parseFloat(a.roll) || 0;
                    const rollB = parseFloat(b.roll) || 0;
                    if (rollA !== rollB) {
                        return rollA - rollB;
                    }
                    return String(a.studentId || a.id || '').localeCompare(String(b.studentId || b.id || ''), undefined, { numeric: true });
                });

                // Update UI headers
                const secBadge = document.getElementById('modal-exam-section-badge');
                if (secBadge) secBadge.innerText = `Sec: ${sch.section || 'All'}`;
                const thId = document.getElementById('modal-th-student-id');
                if (thId) thId.innerText = 'Student ID/Roll';
            }
        }

        function autoSaveCurrentModalInputsToMemory() {
            if (!activeExamScheduleId || !activeExamSubjectCode) return;
            const savedMarks = loadStudentMarks();
            activeExamStudents.forEach(student => {
                const row = document.getElementById(`modal-row-student-${student.id}`);
                if (!row) return;
                const cqIn = row.querySelector('.modal-mark-cq');
                const mcqIn = row.querySelector('.modal-mark-mcq');
                const pracIn = row.querySelector('.modal-mark-prac');
                const absIn = row.querySelector('.modal-mark-absent');

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
                mo
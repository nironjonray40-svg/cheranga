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
                            String(studentExamMarks.cq).toUpperCase() === "A" || String(studentExamMarks.cq).toUpperCase() === "ABS" ||
                            String(studentExamMarks.mcq).toUpperCase() === "A" || String(studentExamMarks.mcq).toUpperCase() === "ABS";
                        cqVal = studentExamMarks.cq !== undefined ? studentExamMarks.cq : "";
                        mcqVal = studentExamMarks.mcq !== undefined ? studentExamMarks.mcq : "";
                        pracVal = studentExamMarks.practical !== undefined ? studentExamMarks.practical : "";
                    } else {
                        cqVal = studentExamMarks;
                        isAbsent = String(cqVal).toUpperCase() === "A" || String(cqVal).toUpperCase() === "ABS";
                    }
                }

                const idVal = currentMarksEntryViewType === 'reg_no' ?
                    (student.regNo || student.registrationNo || student.studentId || student.id || '') :
                    (student.studentId || student.id || (student.roll ? `Roll-${student.roll}` : ''));

                const rData = [
                    idx + 1,
                    idVal,
                    student.nameBn || student.name || '',
                    student.section || 'A'
                ];

                if (activeExamDist.cq > 0) {
                    rData.push(isAbsent ? "A" : (cqVal !== undefined && cqVal !== null ? cqVal : ""));
                }
                if (activeExamDist.mcq > 0) {
                    rData.push(isAbsent ? "A" : (mcqVal !== undefined && mcqVal !== null ? mcqVal : ""));
                }
                if (activeExamDist.practical > 0) {
                    rData.push(isAbsent ? "A" : (pracVal !== undefined && pracVal !== null ? pracVal : ""));
                }

                rowsAoa.push(rData);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(rowsAoa);

            // Set column widths: Student Name (Bangla) 35, CQ/MCQ/Practical 50% smaller (13)
            const colsWidths = [
                { wch: 8 },   // SL
                { wch: 18 },  // Student ID
                { wch: 35 }   // Student Name (Bangla)
            ];
            if (activeExamDist.cq > 0) colsWidths.push({ wch: 13 });       // CQ (50% smaller)
            if (activeExamDist.mcq > 0) colsWidths.push({ wch: 13 });      // MCQ (50% smaller)
            if (activeExamDist.practical > 0) colsWidths.push({ wch: 13 });// Practical (50% smaller)

            worksheet['!cols'] = colsWidths;

            // Apply 30% larger font size (14pt) to ALL cells in the worksheet
            const sheetRange = XLSX.utils.decode_range(worksheet['!ref']);
            for (let R = sheetRange.s.r; R <= sheetRange.e.r; R++) {
                for (let C = sheetRange.s.c; C <= sheetRange.e.c; C++) {
                    const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!worksheet[cellAddr]) continue;
                    if (!worksheet[cellAddr].s) worksheet[cellAddr].s = {};
                    if (!worksheet[cellAddr].s.font) worksheet[cellAddr].s.font = {};
                    worksheet[cellAddr].s.font.sz = 14; // 30% larger than default 11pt
                }
            }

            // Apply 30% Light Blue background style to table header cells (Row 6)
            const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            headers.forEach((_, idx) => {
                const cellRef = `${colLetters[idx]}6`;
                if (worksheet[cellRef]) {
                    worksheet[cellRef].s = {
                        fill: {
                            fgColor: { rgb: "BDD7EE" } // 30% Light Blue Fill
                        },
                        font: {
                            bold: true,
                            name: "Segoe UI",
                            sz: 14, // 30% larger font
                            color: { rgb: "000000" }
                        },
                        alignment: {
                            horizontal: "center",
                            vertical: "center"
                        },
                        border: {
                            top: { style: "thin", color: { rgb: "D9D9D9" } },
                            bottom: { style: "thin", color: { rgb: "D9D9D9" } },
                            left: { style: "thin", color: { rgb: "D9D9D9" } },
                            right: { style: "thin", color: { rgb: "D9D9D9" } }
                        }
                    };
                }
            });

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Marks Template");

            const safeClass = sch.class.replace(/[^a-zA-Z0-9]/g, '_');
            const safeSubject = sch.subject.replace(/[^a-zA-Z0-9]/g, '_');
            const safeTerm = sch.term.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `Exam_Marks_Template_${safeClass}_${safeSubject}_${safeTerm}.xlsx`;

            XLSX.writeFile(workbook, fileName);
            showExamToast("Exam Marks Excel (.xlsx) Template downloaded successfully!", true);
        }

                window.openExamMarksEntryModal = openExamMarksEntryModal;
        window.closeExamMarksEntryModal = closeExamMarksEntryModal;
        window.saveExamMarksModal = saveExamMarksModal;
        window.downloadExamMarksTemplate = downloadExamMarksTemplate;
        window.filterExamMarksModalStudents = filterExamMarksModalStudents;
        window.changeMarksEntryViewType = changeMarksEntryViewType;
        window.onExamMarkInputChange = onExamMarkInputChange;
        window.handleInputKeyNavigation = handleInputKeyNavigation;
        window.editExamSchedule = editExamSchedule;
        window.viewExamSchedule = viewExamSchedule;
        window.deleteExamSchedule = deleteExamSchedule;

        function triggerImportExamMarks() {
            const fileIn = document.getElementById('exam-marks-import-file');
    
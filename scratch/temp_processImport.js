Idx = 0;

                        const headers = lines[headerIdx].split(',').map(h => h.replace(/^"|"$/g, '').trim());
                        const rows = [];
                        for (let i = headerIdx + 1; i < lines.length; i++) {
                            const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
                            const row = {};
                            headers.forEach((h, idx) => {
                                row[h] = values[idx] || "";
                            });
                            rows.push(row);
                        }
                        processImportedExamMarksRows(rows);
                    } catch (err) {
                        alert("Error parsing CSV file: " + err.message);
                    }
                };
                reader.readAsText(file);
            }
        }

        function processImportedExamMarksRows(rows) {
            let matchedCount = 0;

            rows.forEach(importedRow => {
                const keys = Object.keys(importedRow);
                const getKeyVal = (pattern) => {
                    const matchedKey = keys.find(k => k.toLowerCase().trim().startsWith(pattern.toLowerCase()));
                    return matchedKey !== undefined ? importedRow[matchedKey] : undefined;
                };

                const impRoll = (getKeyVal('roll') || '').toString().trim();
                const impId = (getKeyVal('student id') || getKeyVal('id') || '').toString().trim();
                const impNameBn = (getKeyVal('student name (bangla)') || getKeyVal('শিক্ষার্থীর নাম') || '').toString().trim().toLowerCase();
                const impNameEn = (getKeyVal('student name') || getKeyVal('name') || '').toString().trim().toLowerCase();

                const student = activeExamStudents.find(s => {
                    if (impRoll && (s.roll || '').toString().trim() === impRoll) return true;
                    if (impId && ((s.studentId || '').toString().trim() === impId || (s.id || '').toString().trim() === impId)) return true;
                    if (impNameBn && (s.nameBn || '').toString().trim().toLowerCase() === impNameBn) return true;
                    if (impNameEn && (s.name || '').toString().trim().toLowerCase() === impNameEn) return true;
                    return false;
                });

                if (student) {
                    const rowEl = document.getElementById(`modal-row-student-${student.id}`);
                    if (rowEl) {
                        const cqIn = rowEl.querySelector('.modal-mark-cq');
                        const mcqIn = rowEl.querySelector('.modal-mark-mcq');
                        const pracIn = rowEl.querySelector('.modal-mark-prac');

                        const impCq = getKeyVal('cq');
                        const impMcq = getKeyVal('mcq');
                        const impPrac = getKeyVal('practical') || getKeyVal('prac');
                        const impTotal = getKeyVal('total');

                        if (cqIn && impCq !== undefined && impCq !== "") cqIn.value = impCq;
                        if (mcqIn && impMcq !== undefined && impMcq !== "") mcqIn.value = impMcq;
                        if (pracIn && impPrac !== undefined && impPrac !== "") pracIn.value = impPrac;

                        if (!cqIn && !mcqIn && !pracIn && impTotal !== undefined && impTotal !== "") {
                            const singleCqIn = rowEl.querySelector('.student-mark-input-sm');
                            if (singleCqIn) singleCqIn.value = impTotal;
                        }

                        onExamMarkInputChange(cqIn || mcqIn || pracIn, student.id);
                        matchedCount++;
                    }
                }
            });

            if (matchedCount > 0) {
                showExamToast(`Successfully imported marks for ${matchedCount} students!`, true);
            } else {
                alert("No matching students found in the uploaded file! Please check Roll/Student ID numbers in your file.");
            }
        }

        function sortStudentResults(list, sortBy) {
            list.sort((a, b) => {
                if (sortBy === 'regNo') {
                    const rA = String(a.regNo || a.registrationNo || a.studentId || a.id || '').trim();
                    const rB = String(b.regNo || b.registrationNo || b.studentId || b.id || '').trim();
                    const numA = parseInt(rA, 10);
                    const numB = parseInt(rB, 10);
                    if (!isNaN(numA) && !isNaN(numB) && String(numA) === rA && String(numB) === rB) {
                        return numA - numB;
                    }
                    return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
                } else {
                    // Default: Student ID/Roll
                    const rollA = parseInt((a.studentId ? a.studentId.slice(-3) : '') || a.roll || '0', 10);
                    const rollB = parseInt((b.studentId ? b.studentId.slice(-3) : '') || b.roll || '0', 10);
                    if (!isNaN(rollA) && !isNaN(rollB) && rollA !== 0 && rollB !== 0 && rollA !== rollB) {
                        return rollA - rollB;
                    }
                    const idA = String(a.studentId || a.id || a.roll || '');
                    const idB = String(b.studentId || b.id || b.roll || '');
                    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                }
            });
        }

        function viewExamMarksheet() {
            if (!activeExamScheduleId) return;

            const schedules = loadSchedules();
            const sch = schedules.find(s => String(s.id) === String(activeExamScheduleId));
            if (!sch) return;

            // Populate Section Filter Dropdown
            const sectionSelect = document.getElementById('marksheet-filter-section');
            if (sectionSelect) {
                const uniqueSections = new Set();
                activeExamStudents.forEach(s => {
                    if (s.section) uniqueSections.add(s.section.trim());
                });

                let optionsHtml = `<option value="All">সব শাখা (All Sections)</option>`;
                Array.from(uniqueSections).sort().forEach(sec => {
                    optionsHtml += `<option value="${sec}">শাখা: ${sec}</option>`;
                });
                sectionSelect.innerHTML = optionsHtml;
                sectionSelect.value = "All";
            }

            // Restore last saved Sort By selection from localStorage (default: 'studentIdRoll')
            const savedSortBy = localStorage.getItem('school_marksheet_sort_by') || 'studentIdRoll';
            const sortSelect = document.getElementById('marksheet-sort-by');
            if (sortSelect) {
                sortSelect.value = savedSortBy;
            }

            // Reset Registration No filter
            const regInput =
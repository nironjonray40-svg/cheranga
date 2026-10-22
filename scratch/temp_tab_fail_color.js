 [23, 24, 25, 26, 27], gradeIdx: 26, gpIdx: 27 },             // BGS
                { indices: [28, 29, 30, 31, 32, 33], gradeIdx: 32, gpIdx: 33 },         // Chemistry
                { indices: [34, 35, 36, 37, 38, 39], gradeIdx: 38, gpIdx: 39 },         // Physics
                { indices: [40, 41, 42, 43, 44, 45], gradeIdx: 44, gpIdx: 45 },         // Biology
                { indices: [46, 47, 48, 49, 50], gradeIdx: 49, gpIdx: 50 },             // Religion
                { indices: [51, 52, 53, 54, 55], gradeIdx: 54, gpIdx: 55 },             // ICT
                { indices: [56, 57, 58, 59, 60, 61], gradeIdx: 60, gpIdx: 61 }          // Agriculture
            ];

            document.querySelectorAll('tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 68) return; // Not a data row

                // 1. Highlight subject cells if subject grade is F / fail or Absent (A with 0 GP)
                subjectCellGroups.forEach(group => {
                    const gradeVal = cells[group.gradeIdx].textContent.trim();
                    const gpTxt = banglaToEnglishDigits(cells[group.gpIdx]?.textContent.trim() || '');
                    const isZeroGP = gpTxt === '0.00' || gpTxt === '0' || gpTxt === '0.0' || gpTxt === '০.০০';
                    const hasAbsentInGroup = group.indices.some(i => {
                        const t = cells[i]?.textContent.trim().toUpperCase();
                        return t === 'A' || t === 'ABS';
                    });
                    const isSubjectFail = (gradeVal === failGradeName || gradeVal === 'F' || (gradeVal === 'A' && (isZeroGP || hasAbsentInGroup)));
                    if (isSubjectFail) {
                        group.indices.forEach(idx => {
                            cells[idx].style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                        });
                    } else {
                        group.indices.forEach(idx => {
                            if (cells[idx].style.backgroundColor === 'rgba(255, 0, 0, 0.2)') {
                                cells[idx].style.backgroundColor = '';
                            }
                        });
                    }
                });

                // 2. Highlight final GPA and Grade columns if overall grade is F / fail or Absent (A with 0 GPA)
                const finalGradeVal = cells[66].textContent.trim();
                const finalGpaTxt = banglaToEnglishDigits(cells[65].textContent.trim() || '');
                const isFinalFail = (finalGradeVal === failGradeName || finalGradeVal === 'F' || (finalGradeVal === 'A' && (finalGpaTxt === '0.00' || finalGpaTxt === '0' || finalGpaTxt === '০.০০')));
                if (isFinalFail) {
                    cells[65].style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                    cells[66].style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                } else {
                    if (cells[65].style.backgroundColor === 'rgba(255, 0, 0, 0.2)') cells[65].style.backgroundColor = '';
                    if (cells[66].style.backgroundColor === 'rgba(255, 0, 0, 0.2)') cells[66].style.backgroundColor = '';
                }
            });
        }

        

        // Initialize default size A3 and default subjects

        

        function changeHeaderPrint(val) {

            document.body.className = document.body.className.replace(/header-print-\w+/g, '') + ' header-print-' + val;

            document.getElementById('header-print').value = val; // Sync UI

        }



                function syncStudentNamesFromDatabase() {
            let studentsList = [];
            try {
                studentsList = JSON.parse(localStorage.getItem('school_students') || '[]');
            } catch (e) { }

            function normalizeClassName(cls) {
                if (!cls) return '';
                const val = cls.toString().toLowerCase().trim();
                if (val === '10th' || val === 'ten' || val === '10' || val === '১০ম' || val.includes('ten') || val.includes('10')) return 'ten';
                if (val === '9th' || val === 'nine' || val === '9' || val === '৯ম' || val.includes('nine') || val.includes('9')) return 'nine';
                if (val === '8th' || val === 'eight' || val === '8' || val === '৮ম' || val.includes('eight') || val.includes('8')) return 'eight';
                if (val === '7th' || val === 'seven' || val === '7' || val === '৭ম' || val.includes('seven') || val.includes('7')) return 'seven';
                if (val === '6th' || val === 'six' || val === '6' || val === '৬ষ্ঠ' || val.includes('six') || val.includes('6')) return 'six';
                if (val === 'five' || val === '5' || val === '৫ম' || val.includes('five') || val.includes('5')) return 'five';
                if (val === 'four' || val === '4' || val === '৪র্থ' || val.includes('four') || val.includes('4')) return 'four';
                if (val === 'three' || val === '3' || val === 
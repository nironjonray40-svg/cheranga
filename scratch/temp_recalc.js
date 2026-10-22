ment.querySelector('table tbody');
        }

        function recalculateTableGradesAndRanks() {
            const tbody = getTabulationTbody();
            if (!tbody) return;
            const rows = Array.from(tbody.querySelectorAll('tr[data-section]'));
            if (rows.length === 0) return;

            const rules = loadMarkingSystem();
            const maxScaleGP = Math.max(...rules.map(r => parseFloat(r.gp) || 0), 1.0);
            const failRule = rules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0.0 };

            const allStudentList = [];

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 68) return;

                const getCellFloat = (idx) => {
                    const txt = banglaToEnglishDigits(cells[idx].textContent.trim());
                    if (txt === '-' || txt === '') return NaN;
                    return parseFloat(txt);
                };

                const isCellAbsent = (idx) => {
                    if (!cells[idx]) return false;
                    const txt = cells[idx].textContent.trim().toUpperCase();
                    return txt === 'A' || txt === 'ABS';
                };

                const setCellVal = (idx, num, isFloat = false) => {
                    if (isNaN(num)) {
                        cells[idx].textContent = '-';
                    } else {
                        const str = isFloat ? num.toFixed(2) : (num % 1 === 0 ? num.toString() : num.toFixed(1));
                        const translated = translateDigits(str, currentLang);
                        cells[idx].textContent = translated;
                        if (cells[idx].hasAttribute('data-orig-val')) {
                            cells[idx].setAttribute('data-orig-val', translated);
                        }
                    }
                };

                const curClass = currentFilterClass || 'Ten';
                const curExam = currentFilterExam || 'all';

                let examDef = null;
                try {
                    const examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]');
                    examDef = Array.isArray(examTypes) ? examTypes.find(et => isExamMatch(et.name, curExam)) : null;
                } catch (e) { }

                const passPct = (examDef && examDef.passMarkPercent !== undefined && !isNaN(examDef.passMarkPercent))
                    ? Number(examDef.passMarkPercent)
                    : 33;

                // Component-wise pass check: Pass if mark meets the component's minimum pass mark
                const checkComponentPass = (mark, fullMarks) => {
                    if (!fullMarks || fullMarks <= 0) return true; // Component not attached
                    if (mark === null || mark === undefined || isNaN(mark)) return false; // Absent / missing
                    const minPass = Math.round(fullMarks * (passPct / 100));
                    return (mark >= minPass) || ((mark / fullMarks) * 100 >= passPct);
                };

                // Subject marks distributions dynamically retrieved from Exam List
                const distB1 = getSubjectMarksDistribution('bangla1', curClass, curExam);
                const distB2 = getSubjectMarksDistribution('bangla2', curClass, curExam);
                const distEng1 = getSubjectMarksDistribution('english1', curClass, curExam);
                const distEng2 = getSubjectMarksDistribution('english2', curClass, curExam);
                const distMath = getSubjectMarksDistribution('math', curClass, curExam);
                const distBgs = getSubjectMarksDistribution('bgs', curClass, curExam);
                const distChem = getSubjectMarksDistribution('chem', curClass, curExam);
                const distPhys = getSubjectMarksDistribution('phys', curClass, curExam);
                const distBio = getSubjectMarksDistribution('bio', curClass, curExam);
                const distRel = getSubjectMarksDistribution('rel', curClass, curExam);
                const distIct = getSubjectMarksDistribution('ict', curClass, curExam);
                const distAgri = getSubjectMarksDistribution('agri', curClass, curExam);

                const pracStatus = (typeof getSubjectPracticalStatus === 'function') 
                    ? getSubjectPracticalStatus() 
                    : { chem: distChem.practical > 0, phys: distPhys.practical > 0, bio: distBio.practical > 0, agri: distAgri.practical > 0 };

                // 1. Bangla
                // Sub-paper 1: MCQ (cell 2), Written (cell 3), Total (cell 4)
                const b1MCQ = getCellFloat(2);
                const b1Wri = getCellFloat(3);
                let b1Total = getCellFloat(4);
                if (!isNaN(b1MCQ) || !isNaN(b1Wri)) {
                    b1Total = (isNaN(b1MCQ) ? 0 : b1MCQ) + (isNaN(b1Wri) ? 0 : b1Wri);
                    setCellVal(4, b1Total);
                }

                // Sub-paper 2: MCQ (cell 5), Written (cell 6), Total (cell 7)
                const b2MCQ = getCellFloat(5);
                const b2Wri = getCellFloat(6);
                let b2Total = getCellFloat(7);
                if (!isNaN(b2MCQ) || !isNaN(b2Wri)) {
                    b2Total = (isNaN(b2MCQ) ? 0 : b2MCQ) + (isNaN(b2Wri) ? 0 : b2Wri);
                    setCellVal(7, b2Total);
                }

                // Bangla Grand Total (cell 8) & Avg (cell 9)
                let bGrandTotal = getCellFloat(8);
                if (!isNaN(b1Total) || !isNaN(b2Total)) {
                    bGrandTotal = (isNaN(b1Total) ? 0 : b1Total) + (isNaN(b2Total) ? 0 : b2Total);
                    setCellVal(8, bGrandTotal);
                }

                const hasB1 = distB1.hasSchedule || !isNaN(b1Total);
                const hasB2 = distB2.hasSchedule || !isNaN(b2Total);
                const bPaperCount = (hasB1 && hasB2) ? 2 : 1;
                const bFullMarksTotal = (hasB1 ? (distB1.total || 100) : 0) + (hasB2 ? (distB2.total || 100) : 0) || (distB1.total || 100);
                let banglaAvg = NaN;
                if (!isNaN(bGrandTotal)) {
                    banglaAvg = bGrandTotal / bPaperCount;
                    setCellVal(9, banglaAvg);
                } else {
                    setCellVal(9, NaN);
                }

                const bFullMCQ = (hasB1 ? (distB1.mcq || 0) : 0) + (hasB2 ? (distB2.mcq || 0) : 0);
                const bFullCQ = (hasB1 ? (distB1.cq || 0) : 0) + (hasB2 ? (distB2.cq || 0) : 0);
                const bTotalMCQ = (isNaN(b1MCQ) ? 0 : b1MCQ) + (isNaN(b2MCQ) ? 0 : b2MCQ);
                const bTotalCQ = (isNaN(b1Wri) ? 0 : b1Wri) + (isNaN(b2Wri) ? 0 : b2Wri);

                const bMCQPass = (bFullMCQ <= 0) || checkComponentPass(bTotalMCQ, bFullMCQ);
                const bCQPass = (bFullCQ <= 0) || checkComponentPass(bTotalCQ, bFullCQ);
                const banglaPct = (!isNaN(bGrandTotal) && bFullMarksTotal > 0) ? (bGrandTotal / bFullMarksTotal) * 100 : banglaAvg;
                const bAbsent = isCellAbsent(2) || isCellAbsent(3) || isCellAbsent(4) || isCellAbsent(5) || isCellAbsent(6) || isCellAbsent(7);
         
       const hasBMarks = !isNaN(b1Total) || !isNaN(b2Total) || bAbsent;

                let banglaInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasBMarks) {
                    const bOverallPass = !bAbsent && bMCQPass && bCQPass && (banglaPct >= passPct);
                    banglaInfo = bAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!bOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(banglaPct, passPct), isAbsent: false });
                    cells[10].textContent = banglaInfo.name;
                    cells[11].textContent = translateDigits(banglaInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[10].textContent = '-';
                    cells[11].textContent = '-';
                }

                // 2. English
                // 1st Paper (cell 12), 2nd Paper (cell 13), Grand Total (cell 14), Avg (cell 15)
                const eng1 = getCellFloat(12);
                const eng2 = getCellFloat(13);
                let engGrandTotal = getCellFloat(14);
                if (!isNaN(eng1) || !isNaN(eng2)) {
                    engGrandTotal = (isNaN(eng1) ? 0 : eng1) + (isNaN(eng2) ? 0 : eng2);
                    setCellVal(14, engGrandTotal);
                }

                const hasEng1 = distEng1.hasSchedule || !isNaN(eng1);
                const hasEng2 = distEng2.hasSchedule || !isNaN(eng2);
                const engPaperCount = (hasEng1 && hasEng2) ? 2 : 1;
                const engFullMarksTotal = (hasEng1 ? (distEng1.total || 100) : 0) + (hasEng2 ? (distEng2.total || 100) : 0) || (distEng1.total || 100);
                let engAvg = NaN;
                if (!isNaN(engGrandTotal)) {
                    engAvg = engGrandTotal / engPaperCount;
                    setCellVal(15, engAvg);
                } else {
                    setCellVal(15, NaN);
                }

                const engPct = (!isNaN(engGrandTotal) && engFullMarksTotal > 0) ? (engGrandTotal / engFullMarksTotal) * 100 : engAvg;
                const engAbsent = isCellAbsent(12) || isCellAbsent(13) || isCellAbsent(14);
                const hasEngMarks = !isNaN(engGrandTotal) || engAbsent;

                let engInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasEngMarks) {
                    const engCQPass = checkComponentPass(engGrandTotal, engFullMarksTotal);
                    const engOverallPass = !engAbsent && engCQPass && (engPct >= passPct);
                    engInfo = engAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!engOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(engPct, passPct), isAbsent: false });
                    cells[16].textContent = engInfo.name;
                    cells[17].textContent = translateDigits(engInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[16].textContent = '-';
                    cells[17].textContent = '-';
                }

                // 3. Math (MCQ cell 18, Written cell 19, Total cell 20)
                const mathMCQ = getCellFloat(18);
                const mathWri = getCellFloat(19);
                let mathTotal = getCellFloat(20);
                if (!isNaN(mathMCQ) || !isNaN(mathWri)) {
                    mathTotal = (isNaN(mathMCQ) ? 0 : mathMCQ) + (isNaN(mathWri) ? 0 : mathWri);
                    setCellVal(20, mathTotal);
                }
                const mathFull = distMath.total || 100;
                const mathPct = !isNaN(mathTotal) ? (mathTotal / mathFull) * 100 : NaN;
                const mathAbsent = isCellAbsent(18) || isCellAbsent(19) || isCellAbsent(20);
                const hasMathMarks = !isNaN(mathTotal) || mathAbsent;

                let mathInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasMathMarks) {
                    const mathMCQFull = distMath.mcq || 0;
                    const mathCQFull = distMath.cq || 0;
                    const mathMCQPass = (mathMCQFull <= 0) || checkComponentPass(mathMCQ, mathMCQFull);
                    const mathCQPass = (mathCQFull <= 0) || checkComponentPass(mathWri, mathCQFull);
                    const mathOverallPass = !mathAbsent && mathMCQPass && mathCQPass && (mathPct >= passPct);

                    mathInfo = mathAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!mathOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(mathPct, passPct), isAbsent: false });
                    cells[21].textContent = mathInfo.name;
                    cells[22].textContent = translateDigits(mathInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[21].textContent = '-';
                    cells[22].textContent = '-';
                }

                // 4. BGS (MCQ cell 23, Written cell 24, Total cell 25)
                const bgsMCQ = getCellFloat(23);
                const bgsWri = getCellFloat(24);
                let bgsTotal = getCellFloat(25);
                if (!isNaN(bgsMCQ) || !isNaN(bgsWri)) {
                    bgsTotal = (isNaN(bgsMCQ) ? 0 : bgsMCQ) + (isNaN(bgsWri) ? 0 : bgsWri);
                    setCellVal(25, bgsTotal);
                }
                const bgsFull = distBgs.total || 100;
                const bgsPct = !isNaN(bgsTotal) ? (bgsTotal / bgsFull) * 100 : NaN;
                const bgsAbsent = isCellAbsent(23) || isCellAbsent(24) || isCellAbsent(25);
                const hasBgsMarks = !isNaN(bgsTotal) || bgsAbsent;

                let bgsInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasBgsMarks) {
                    const bgsMCQFull = distBgs.mcq || 0;
                    const bgsCQFull = distBgs.cq || 0;
                    const bgsMCQPass = (bgsMCQFull <= 0) || checkComponentPass(bgsMCQ, bgsMCQFull);
                    const bgsCQPass = (bgsCQFull <= 0) || checkComponentPass(bgsWri, bgsCQFull);
                    const bgsOverallPass = !bgsAbsent && bgsMCQPass && bgsCQPass && (bgsPct >= passPct);

                    bgsInfo = bgsAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!bgsOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(bgsPct, passPct), isAbsent: false });
                    cells[26].textContent = bgsInfo.name;
                    cells[27].textContent = translateDigits(bgsInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[26].textContent = '-';
                    cells[27].textContent = '-';
                }

                // 5. Chemistry / Science (MCQ cell 28, Written cell 29, Practical cell 30, Total cell 31)
                const chemMCQ = getCellFloat(28);
                const chemWri = getCellFloat(29);
                const chemPrac = pracStatus.chem ? getCellFloat(30) : 0;
                let chemTotal = getCellFloat(31);
                if (!isNaN(chemMCQ) || !isNaN(chemWri) || (pracStatus.chem && !isNaN(chemPrac))) {
                    chemTotal = (isNaN(chemMCQ) ? 0 : chemMCQ) + (isNaN(chemWri) ? 0 : chemWri) + (pracStatus.chem && !isNaN(chemPrac) ? chemPrac : 0);
                    setCellVal(31, chemTotal);
                }
                const chemFull = distChem.total || 100;
                const chemPct = !isNaN(chemTotal) ? (chemTotal / chemFull) * 100 : NaN;
                const chemAbsent = isCellAbsent(28) || isCellAbsent(29) || (pracStatus.chem && isCellAbsent(30)) || isCellAbsent(31);
                const hasChemM
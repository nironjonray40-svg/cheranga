# Script to update Tabulation Sheet.html:
# When any student is absent in 1 or more subjects (Abs / A):
# - Subject Grade: 'A' (with GP 0.00)
# - Final Grade ("গ্রেড"): 'A' (with Final GPA 0.00)
# - Highlight failures: red highlight for absent (Grade A with GP 0.00) as well as F.

import re

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update isCellAbsent helper in recalculateTableGradesAndRanks
old_helpers = '''                const getCellFloat = (idx) => {
                    const txt = banglaToEnglishDigits(cells[idx].textContent.trim());
                    if (txt === '-' || txt === '') return NaN;
                    return parseFloat(txt);
                };

                const setCellVal = (idx, num, isFloat = false) => {'''

new_helpers = '''                const getCellFloat = (idx) => {
                    const txt = banglaToEnglishDigits(cells[idx].textContent.trim());
                    if (txt === '-' || txt === '') return NaN;
                    return parseFloat(txt);
                };

                const isCellAbsent = (idx) => {
                    if (!cells[idx]) return false;
                    const txt = cells[idx].textContent.trim().toUpperCase();
                    return txt === 'A' || txt === 'ABS';
                };

                const setCellVal = (idx, num, isFloat = false) => {'''

if old_helpers not in content:
    raise Exception("old_helpers not found")

content = content.replace(old_helpers, new_helpers, 1)

# 2. Update subjects 1 to 10 logic inside recalculateTableGradesAndRanks
# Let's inspect the block from Bangla to the end of recalculateTableGradesAndRanks
start_marker = "                // 1. Bangla"
end_marker = "            // Assign unique 1..N rank with ZERO duplicate ranks for students with marks"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    raise Exception(f"Markers not found: start_idx={start_idx}, end_idx={end_idx}")

new_subjects_code = '''                // 1. Bangla
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
                const hasChemMarks = !isNaN(chemTotal) || chemAbsent;

                let chemInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasChemMarks) {
                    const chemMCQFull = distChem.mcq || 0;
                    const chemCQFull = distChem.cq || 0;
                    const chemPracFull = (pracStatus.chem && distChem.practical) ? distChem.practical : 0;
                    const chemMCQPass = (chemMCQFull <= 0) || checkComponentPass(chemMCQ, chemMCQFull);
                    const chemCQPass = (chemCQFull <= 0) || checkComponentPass(chemWri, chemCQFull);
                    const chemPracPass = (chemPracFull <= 0) || checkComponentPass(chemPrac, chemPracFull);
                    const chemOverallPass = !chemAbsent && chemMCQPass && chemCQPass && chemPracPass && (chemPct >= passPct);

                    chemInfo = chemAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!chemOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(chemPct, passPct), isAbsent: false });
                    cells[32].textContent = chemInfo.name;
                    cells[33].textContent = translateDigits(chemInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[32].textContent = '-';
                    cells[33].textContent = '-';
                }

                // 6. Physics (MCQ cell 34, Written cell 35, Practical cell 36, Total cell 37)
                const physMCQ = getCellFloat(34);
                const physWri = getCellFloat(35);
                const physPrac = pracStatus.phys ? getCellFloat(36) : 0;
                let physTotal = getCellFloat(37);
                if (!isNaN(physMCQ) || !isNaN(physWri) || (pracStatus.phys && !isNaN(physPrac))) {
                    physTotal = (isNaN(physMCQ) ? 0 : physMCQ) + (isNaN(physWri) ? 0 : physWri) + (pracStatus.phys && !isNaN(physPrac) ? physPrac : 0);
                    setCellVal(37, physTotal);
                }
                const physFull = distPhys.total || 100;
                const physPct = !isNaN(physTotal) ? (physTotal / physFull) * 100 : NaN;
                const physAbsent = isCellAbsent(34) || isCellAbsent(35) || (pracStatus.phys && isCellAbsent(36)) || isCellAbsent(37);
                const hasPhysMarks = !isNaN(physTotal) || physAbsent;

                let physInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasPhysMarks) {
                    const physMCQFull = distPhys.mcq || 0;
                    const physCQFull = distPhys.cq || 0;
                    const physPracFull = (pracStatus.phys && distPhys.practical) ? distPhys.practical : 0;
                    const physMCQPass = (physMCQFull <= 0) || checkComponentPass(physMCQ, physMCQFull);
                    const physCQPass = (physCQFull <= 0) || checkComponentPass(physWri, physCQFull);
                    const physPracPass = (physPracFull <= 0) || checkComponentPass(physPrac, physPracFull);
                    const physOverallPass = !physAbsent && physMCQPass && physCQPass && physPracPass && (physPct >= passPct);

                    physInfo = physAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!physOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(physPct, passPct), isAbsent: false });
                    cells[38].textContent = physInfo.name;
                    cells[39].textContent = translateDigits(physInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[38].textContent = '-';
                    cells[39].textContent = '-';
                }

                // 7. Biology (MCQ cell 40, Written cell 41, Practical cell 42, Total cell 43)
                const bioMCQ = getCellFloat(40);
                const bioWri = getCellFloat(41);
                const bioPrac = pracStatus.bio ? getCellFloat(42) : 0;
                let bioTotal = getCellFloat(43);
                if (!isNaN(bioMCQ) || !isNaN(bioWri) || (pracStatus.bio && !isNaN(bioPrac))) {
                    bioTotal = (isNaN(bioMCQ) ? 0 : bioMCQ) + (isNaN(bioWri) ? 0 : bioWri) + (pracStatus.bio && !isNaN(bioPrac) ? bioPrac : 0);
                    setCellVal(43, bioTotal);
                }
                const bioFull = distBio.total || 100;
                const bioPct = !isNaN(bioTotal) ? (bioTotal / bioFull) * 100 : NaN;
                const bioAbsent = isCellAbsent(40) || isCellAbsent(41) || (pracStatus.bio && isCellAbsent(42)) || isCellAbsent(43);
                const hasBioMarks = !isNaN(bioTotal) || bioAbsent;

                let bioInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasBioMarks) {
                    const bioMCQFull = distBio.mcq || 0;
                    const bioCQFull = distBio.cq || 0;
                    const bioPracFull = (pracStatus.bio && distBio.practical) ? distBio.practical : 0;
                    const bioMCQPass = (bioMCQFull <= 0) || checkComponentPass(bioMCQ, bioMCQFull);
                    const bioCQPass = (bioCQFull <= 0) || checkComponentPass(bioWri, bioCQFull);
                    const bioPracPass = (bioPracFull <= 0) || checkComponentPass(bioPrac, bioPracFull);
                    const bioOverallPass = !bioAbsent && bioMCQPass && bioCQPass && bioPracPass && (bioPct >= passPct);

                    bioInfo = bioAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!bioOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(bioPct, passPct), isAbsent: false });
                    cells[44].textContent = bioInfo.name;
                    cells[45].textContent = translateDigits(bioInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[44].textContent = '-';
                    cells[45].textContent = '-';
                }

                // 8. Religion (MCQ cell 46, Written cell 47, Total cell 48)
                const relMCQ = getCellFloat(46);
                const relWri = getCellFloat(47);
                let relTotal = getCellFloat(48);
                if (!isNaN(relMCQ) || !isNaN(relWri)) {
                    relTotal = (isNaN(relMCQ) ? 0 : relMCQ) + (isNaN(relWri) ? 0 : relWri);
                    setCellVal(48, relTotal);
                }
                const relFull = distRel.total || 100;
                const relPct = !isNaN(relTotal) ? (relTotal / relFull) * 100 : NaN;
                const relAbsent = isCellAbsent(46) || isCellAbsent(47) || isCellAbsent(48);
                const hasRelMarks = !isNaN(relTotal) || relAbsent;

                let relInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasRelMarks) {
                    const relMCQFull = distRel.mcq || 0;
                    const relCQFull = distRel.cq || 0;
                    const relMCQPass = (relMCQFull <= 0) || checkComponentPass(relMCQ, relMCQFull);
                    const relCQPass = (relCQFull <= 0) || checkComponentPass(relWri, relCQFull);
                    const relOverallPass = !relAbsent && relMCQPass && relCQPass && (relPct >= passPct);

                    relInfo = relAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!relOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(relPct, passPct), isAbsent: false });
                    cells[49].textContent = relInfo.name;
                    cells[50].textContent = translateDigits(relInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[49].textContent = '-';
                    cells[50].textContent = '-';
                }

                // 9. ICT (MCQ cell 51, Written cell 52, Total cell 53)
                const ictMCQ = getCellFloat(51);
                const ictWri = getCellFloat(52);
                let ictTotal = getCellFloat(53);
                if (!isNaN(ictMCQ) || !isNaN(ictWri)) {
                    ictTotal = (isNaN(ictMCQ) ? 0 : ictMCQ) + (isNaN(ictWri) ? 0 : ictWri);
                    setCellVal(53, ictTotal);
                }
                const ictFull = distIct.total || 50;
                const ictPct = !isNaN(ictTotal) ? (ictTotal / ictFull) * 100 : NaN;
                const ictAbsent = isCellAbsent(51) || isCellAbsent(52) || isCellAbsent(53);
                const hasIctMarks = !isNaN(ictTotal) || ictAbsent;

                let ictInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasIctMarks) {
                    const ictMCQFull = distIct.mcq || 0;
                    const ictCQFull = distIct.cq || 0;
                    const ictMCQPass = (ictMCQFull <= 0) || checkComponentPass(ictMCQ, ictMCQFull);
                    const ictCQPass = (ictCQFull <= 0) || checkComponentPass(ictWri, ictCQFull);
                    const ictOverallPass = !ictAbsent && ictMCQPass && ictCQPass && (ictPct >= passPct);

                    ictInfo = ictAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!ictOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(ictPct, passPct), isAbsent: false });
                    cells[54].textContent = ictInfo.name;
                    cells[55].textContent = translateDigits(ictInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[54].textContent = '-';
                    cells[55].textContent = '-';
                }

                // 10. Agriculture / Higher Math (Optional Subject)
                const optMCQ = getCellFloat(56);
                const optWri = getCellFloat(57);
                const optPrac = pracStatus.agri ? getCellFloat(58) : 0;
                let optTotal = getCellFloat(59);
                if (!isNaN(optMCQ) || !isNaN(optWri) || (pracStatus.agri && !isNaN(optPrac))) {
                    optTotal = (isNaN(optMCQ) ? 0 : optMCQ) + (isNaN(optWri) ? 0 : optWri) + (pracStatus.agri && !isNaN(optPrac) ? optPrac : 0);
                    setCellVal(59, optTotal);
                }
                const optFull = distAgri.total || 100;
                const optPct = !isNaN(optTotal) ? (optTotal / optFull) * 100 : NaN;
                const optAbsent = isCellAbsent(56) || isCellAbsent(57) || (pracStatus.agri && isCellAbsent(58)) || isCellAbsent(59);
                const hasOptMarks = !isNaN(optTotal) || optAbsent;

                let optInfo = { name: '-', gp: 0.0, isAbsent: false };
                if (hasOptMarks) {
                    const optMCQFull = distAgri.mcq || 0;
                    const optCQFull = distAgri.cq || 0;
                    const optPracFull = (pracStatus.agri && distAgri.practical) ? distAgri.practical : 0;
                    const optMCQPass = (optMCQFull <= 0) || checkComponentPass(optMCQ, optMCQFull);
                    const optCQPass = (optCQFull <= 0) || checkComponentPass(optWri, optCQFull);
                    const optPracPass = (optPracFull <= 0) || checkComponentPass(optPrac, optPracFull);
                    const optOverallPass = !optAbsent && optMCQPass && optCQPass && optPracPass && (optPct >= passPct);

                    optInfo = optAbsent
                        ? { name: 'A', gp: 0.0, isAbsent: true }
                        : (!optOverallPass
                            ? { name: failRule.name || 'F', gp: 0.0, isAbsent: false }
                            : { ...getGradeForPercentage(optPct, passPct), isAbsent: false });
                    cells[60].textContent = optInfo.name;
                    cells[61].textContent = translateDigits(optInfo.gp.toFixed(2), currentLang);
                } else {
                    cells[60].textContent = '-';
                    cells[61].textContent = '-';
                }

                // Main Subjects List (Only include active slots for current class)
                const candidateSubjects = [
                    { slot: 'bangla', info: banglaInfo, total: bGrandTotal, full: bFullMarksTotal, isAbsent: bAbsent },
                    { slot: 'english', info: engInfo, total: engGrandTotal, full: engFullMarksTotal, isAbsent: engAbsent },
                    { slot: 'math', info: mathInfo, total: mathTotal, full: mathFull, isAbsent: mathAbsent },
                    { slot: 'bgs', info: bgsInfo, total: bgsTotal, full: bgsFull, isAbsent: bgsAbsent },
                    { slot: 'chem', info: chemInfo, total: chemTotal, full: chemFull, isAbsent: chemAbsent },
                    { slot: 'phys', info: physInfo, total: physTotal, full: physFull, isAbsent: physAbsent },
                    { slot: 'bio', info: bioInfo, total: bioTotal, full: bioFull, isAbsent: bioAbsent },
                    { slot: 'rel', info: relInfo, total: relTotal, full: relFull, isAbsent: relAbsent },
                    { slot: 'ict', info: ictInfo, total: ictTotal, full: ictFull, isAbsent: ictAbsent }
                ];
                const activeMain = candidateSubjects.filter(cs => isSubjectSlotActive(cs.slot));
                const mainSubjects = activeMain.map(cs => cs.info);
                const hasValidMainSubjects = mainSubjects.some(s => s.name !== '-');

                // Check if student has Abs in one or more active subjects
                const isOptActive = isSubjectSlotActive('agri');
                const hasAnyAbsent = activeMain.some(cs => cs.isAbsent) || (isOptActive && optAbsent);

                let failsCount = 0;
                let mainGPSum = 0;
                let mainSubCount = 0;

                if (hasValidMainSubjects) {
                    mainSubjects.forEach(sub => {
                        if (sub.name !== '-') {
                            mainSubCount++;
                            mainGPSum += sub.gp;
                            if (sub.gp === 0 || sub.name === failRule.name || sub.name === 'F' || sub.name === 'A' || sub.isAbsent) {
                                failsCount++;
                            }
                        }
                    });
                }

                // Find minimum percentage for GP 2.00 (defaults to 40) from active scale
                const ruleFor2GP = rules.find(r => parseFloat(r.gp) === 2.00) || { min: 40 };
                const optBaseDeductPct = parseFloat(ruleFor2GP.min) || 40;
                const optBaseDeductMarks = (optBaseDeductPct / 100) * optFull;

                // Optional bonus: extra GP above 2.00 and extra marks above 2.00 threshold
                const optionalBonusGP = (isOptActive && !isNaN(optTotal) && !optAbsent && optInfo.name !== '-' && optInfo.gp > 2.00) ? (optInfo.gp - 2.00) : 0;
                const optionalBonusMarks = (isOptActive && !isNaN(optTotal) && !optAbsent && optTotal > optBaseDeductMarks) ? (optTotal - optBaseDeductMarks) : 0;

                // Grand Total (Cell 62): Sum of active main subjects + Optional extra marks above 2.00 (above 40 marks)
                let computedGrandTotal = 0;
                let hasAnySubject = false;
                activeMain.forEach(item => {
                    if (!isNaN(item.total)) {
                        computedGrandTotal += item.total;
                        hasAnySubject = true;
                    } else if (item.isAbsent) {
                        hasAnySubject = true;
                    }
                });
                if (isOptActive && (!isNaN(optTotal) || optAbsent)) {
                    hasAnySubject = true;
                    if (!isNaN(optTotal) && !optAbsent) {
                        computedGrandTotal += optionalBonusMarks;
                    }
                }
                const grandTotalRaw = hasAnySubject ? computedGrandTotal : 0;

                let displayGpaNoOpt = 0.00;
                let displayFinalGpa = 0.00;
                let displayFinalGrade = hasAnyAbsent ? 'A' : (failRule.name || 'F');

                if (hasValidMainSubjects && mainSubCount > 0) {
                    if (hasAnyAbsent) {
                        // Policy: If student is Abs in one or more subjects, final Grade is 'A' (Absent), GPA is 0.00
                        displayFinalGrade = 'A';
                        displayFinalGpa = 0.00;
                        displayGpaNoOpt = 0.00;
                    } else if (failsCount > 0) {
                        displayFinalGpa = 0.00;
                        displayFinalGrade = failRule.name || 'F';
                        displayGpaNoOpt = 0.00;
                    } else {
                        if (currentGPACalcMethod === 'total') {
                            // Total Mark Based Method (dynamically calculated from all active main subject full marks)
                            const totalMax = activeMain.reduce((sum, item) => sum + (item.full || 100), 0);
                            const pct = (totalMax > 0) ? (grandTotalRaw / totalMax) * 100 : 0;
                            const totalGradeInfo = getGradeForPercentage(pct);
                            displayFinalGpa = totalGradeInfo.gp;
                            displayFinalGrade = totalGradeInfo.name;
                            displayGpaNoOpt = totalGradeInfo.gp;
                        } else {
                            // Standard Board GPA Method
                            displayGpaNoOpt = mainGPSum / mainSubCount;
                            const rawFinalGPA = (mainGPSum + optionalBonusGP) / mainSubCount;
                            displayFinalGpa = Math.min(maxScaleGP, rawFinalGPA);
                            displayFinalGrade = getGradeForGPA(displayFinalGpa);
                        }
                    }
                }

                // If student has no entered marks, display '-' for all summary cells
                if (!hasAnySubject) {
                    cells[62].textContent = '-';
                    cells[63].textContent = '-';
                    cells[64].textContent = '-';
                    cells[65].textContent = '-';
                    cells[66].textContent = '-';
                    cells[67].textContent = '-';
                } else {
                    setCellVal(62, grandTotalRaw);
                    cells[63].textContent = translateDigits(failsCount.toString(), currentLang);
                    cells[64].textContent = translateDigits(displayGpaNoOpt.toFixed(2), currentLang);
                    cells[65].textContent = translateDigits(displayFinalGpa.toFixed(2), currentLang);
                    cells[66].textContent = displayFinalGrade;
                }

                const rollRaw = banglaToEnglishDigits(cells[0].textContent.trim());
                const digitsOnly = rollRaw.replace(/\\D/g, '');
                const sec = row.getAttribute('data-section') || 'Unassigned';

                allStudentList.push({
                    row: row,
                    sec: sec,
                    hasAnySubject: hasAnySubject,
                    computedGpa: displayFinalGpa,
                    computedGrade: displayFinalGrade,
                    fails: failsCount,
                    hasAbsent: hasAnyAbsent,
                    grandTotal: grandTotalRaw,
                    rollInt: parseInt(digitsOnly, 10) || 0
                });
            });

            // Calculate strictly UNIQUE sequential Merit Ranks across all students (No duplicate ranks!)
            const rankedStudents = allStudentList.filter(s => s.hasAnySubject);
            if (currentGPACalcMethod === 'total') {
                rankedStudents.sort((a, b) => {
                    const aFailed = a.fails > 0 || a.hasAbsent;
                    const bFailed = b.fails > 0 || b.hasAbsent;
                    if (aFailed !== bFailed) return aFailed ? 1 : -1;
                    if (aFailed && bFailed) {
                        // Failed / absent students are ranked strictly based on "সর্বমোট" (Grand Total) marks
                        if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
                        if (a.rollInt !== b.rollInt) return a.rollInt - b.rollInt;
                        return a.sec.localeCompare(b.sec);
                    }
                    if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
                    if (b.computedGpa !== a.computedGpa) return b.computedGpa - a.computedGpa;
                    if (a.rollInt !== b.rollInt) return a.rollInt - b.rollInt;
                    return a.sec.localeCompare(b.sec);
                });
            } else {
                rankedStudents.sort((a, b) => {
                    const aFailed = a.fails > 0 || a.hasAbsent;
                    const bFailed = b.fails > 0 || b.hasAbsent;
                    if (aFailed !== bFailed) return aFailed ? 1 : -1;
                    if (aFailed && bFailed) {
                        // Failed / absent students are ranked strictly based on "সর্বমোট" (Grand Total) marks
                        if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
                        if (a.rollInt !== b.rollInt) return a.rollInt - b.rollInt;
                        return a.sec.localeCompare(b.sec);
                    }
                    if (b.computedGpa !== a.computedGpa) return b.computedGpa - a.computedGpa;
                    if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
                    if (a.rollInt !== b.rollInt) return a.rollInt - b.rollInt;
                    return a.sec.localeCompare(b.sec);
                });
            }

'''

content = content[:start_idx] + new_subjects_code + content[end_idx:]

# 3. Update highlightFailures function to include Absent (Grade A with 0 GP)
old_highlight = '''        // Highlight subject blocks and overall GPA/Grade cells if student failed (F grade or 0 GP)
        function highlightFailures() {
            const rules = loadMarkingSystem();
            const failRule = rules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0 };
            const failGradeName = failRule.name || 'F';

            const subjectCellGroups = [
                { indices: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], gradeIdx: 10 }, // Bangla
                { indices: [12, 13, 14, 15, 16, 17], gradeIdx: 16 },         // English
                { indices: [18, 19, 20, 21, 22], gradeIdx: 21 },             // Math
                { indices: [23, 24, 25, 26, 27], gradeIdx: 26 },             // BGS
                { indices: [28, 29, 30, 31, 32, 33], gradeIdx: 32 },         // Chemistry
                { indices: [34, 35, 36, 37, 38, 39], gradeIdx: 38 },         // Physics
                { indices: [40, 41, 42, 43, 44, 45], gradeIdx: 44 },         // Biology
                { indices: [46, 47, 48, 49, 50], gradeIdx: 49 },             // Religion
                { indices: [51, 52, 53, 54, 55], gradeIdx: 54 },             // ICT
                { indices: [56, 57, 58, 59, 60, 61], gradeIdx: 60 }          // Agriculture
            ];

            document.querySelectorAll('tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 68) return; // Not a data row

                // 1. Highlight subject cells if subject grade is F / fail
                subjectCellGroups.forEach(group => {
                    const gradeVal = cells[group.gradeIdx].textContent.trim();
                    if (gradeVal === failGradeName || gradeVal === 'F') {
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

                // 2. Highlight final GPA and Grade columns if overall grade is F / fail
                const finalGradeVal = cells[66].textContent.trim();
                if (finalGradeVal === failGradeName || finalGradeVal === 'F') {
                    cells[65].style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                    cells[66].style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                } else {
                    if (cells[65].style.backgroundColor === 'rgba(255, 0, 0, 0.2)') cells[65].style.backgroundColor = '';
                    if (cells[66].style.backgroundColor === 'rgba(255, 0, 0, 0.2)') cells[66].style.backgroundColor = '';
                }
            });
        }'''

new_highlight = '''        // Highlight subject blocks and overall GPA/Grade cells if student failed (F grade or 0 GP or Absent)
        function highlightFailures() {
            const rules = loadMarkingSystem();
            const failRule = rules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0 };
            const failGradeName = failRule.name || 'F';

            const subjectCellGroups = [
                { indices: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], gradeIdx: 10, gpIdx: 11 }, // Bangla
                { indices: [12, 13, 14, 15, 16, 17], gradeIdx: 16, gpIdx: 17 },         // English
                { indices: [18, 19, 20, 21, 22], gradeIdx: 21, gpIdx: 22 },             // Math
                { indices: [23, 24, 25, 26, 27], gradeIdx: 26, gpIdx: 27 },             // BGS
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
        }'''

if old_highlight not in content:
    raise Exception("old_highlight not found")

content = content.replace(old_highlight, new_highlight, 1)

with open('Tabulation Sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated Tabulation Sheet.html for Absent students with Grade A!")

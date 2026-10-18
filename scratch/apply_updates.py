import re

def update_marksheet(content):
    # 1. Helper function getStudentMarksForSubject
    helper_code = '''        // Helper to extract student marks for a given subject from school_student_marks (Exam List & Evaluations)
        function getStudentMarksForSubject(student, subjectObj, selectedExam, savedMarks) {
            if (!student || !savedMarks || typeof savedMarks !== 'object') {
                return { mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false };
            }
            const stIds = [
                student.id,
                student.studentId,
                student.regNo,
                student.roll,
                student.rollNo,
                student.code
            ].filter(Boolean).map(x => String(x).trim());

            const schedIds = [];
            if (subjectObj.scheduleId) schedIds.push(String(subjectObj.scheduleId).trim());
            if (Array.isArray(subjectObj.scheduleIds)) {
                subjectObj.scheduleIds.forEach(id => {
                    if (id && !schedIds.includes(String(id).trim())) schedIds.push(String(id).trim());
                });
            }

            const subCodes = [];
            if (subjectObj.code) subCodes.push(String(subjectObj.code).trim());
            const subNames = [
                subjectObj.name,
                subjectObj.nameBn,
                subjectObj.rawName
            ].filter(Boolean).map(x => String(x).trim());

            let markRecord = null;

            // 1. Check schedule-specific mark keys: marks_{stId}_{schedId}
            for (const stId of stIds) {
                for (const schId of schedIds) {
                    const k = `marks_${stId}_${schId}`;
                    if (savedMarks[k]) {
                        markRecord = savedMarks[k];
                        break;
                    }
                }
                if (markRecord) break;
            }

            // 2. Check exam-name mark keys: marks_{stId}_{exam}
            if (!markRecord && selectedExam) {
                const examKeys = [selectedExam, selectedExam.trim()];
                for (const stId of stIds) {
                    for (const exKey of examKeys) {
                        const k = `marks_${stId}_${exKey}`;
                        if (savedMarks[k]) {
                            markRecord = savedMarks[k];
                            break;
                        }
                    }
                    if (markRecord) break;
                }
            }

            if (!markRecord) {
                return { mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false };
            }

            // If markRecord is a string
            if (typeof markRecord === 'string') {
                const upper = markRecord.trim().toUpperCase();
                if (upper === 'A' || upper === 'ABS') {
                    return { mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true };
                }
            }

            // Extract markData for this specific subject from markRecord
            let markData = null;
            if (typeof markRecord === 'object' && markRecord !== null) {
                for (const code of subCodes) {
                    if (markRecord[code] !== undefined) {
                        markData = markRecord[code];
                        break;
                    }
                }
                if (markData === null) {
                    for (const name of subNames) {
                        if (markRecord[name] !== undefined) {
                            markData = markRecord[name];
                            break;
                        }
                    }
                }
                if (markData === null) {
                    const recKeys = Object.keys(markRecord);
                    for (const rk of recKeys) {
                        const rkLower = rk.toLowerCase().trim();
                        for (const name of subNames) {
                            const nLower = name.toLowerCase().trim();
                            if (rkLower === nLower || rkLower.includes(nLower) || nLower.includes(rkLower)) {
                                markData = markRecord[rk];
                                break;
                            }
                        }
                        if (markData !== null) break;
                    }
                }
                if (markData === null) {
                    const keys = Object.keys(markRecord).filter(k => k !== 'timestamp');
                    if (keys.length === 1 && typeof markRecord[keys[0]] === 'object') {
                        markData = markRecord[keys[0]];
                    } else if (markRecord.mcq !== undefined || markRecord.cq !== undefined || markRecord.total !== undefined || markRecord.isAbsent !== undefined) {
                        markData = markRecord;
                    }
                }
            }

            if (markData === null || markData === undefined) {
                return { mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false };
            }

            let isAbsent = false;
            let mcq = '';
            let cq = '';
            let pr = '';
            let total = null;

            if (typeof markData === 'object' && markData !== null) {
                isAbsent = !!markData.isAbsent;
                if (!isAbsent && (String(markData.cq).toUpperCase() === 'A' || String(markData.mcq).toUpperCase() === 'A' || String(markData.practical).toUpperCase() === 'A')) {
                    isAbsent = true;
                }

                if (isAbsent) {
                    return { mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true };
                }

                if (markData.mcq !== undefined && markData.mcq !== null && markData.mcq !== '' && markData.mcq !== '-') {
                    mcq = Number(markData.mcq);
                }
                if (markData.cq !== undefined && markData.cq !== null && markData.cq !== '' && markData.cq !== '-') {
                    cq = Number(markData.cq);
                }
                if (markData.practical !== undefined && markData.practical !== null && markData.practical !== '' && markData.practical !== '-') {
                    pr = Number(markData.practical);
                }
                if (markData.total !== undefined && markData.total !== null && markData.total !== '' && markData.total !== '-') {
                    total = Number(markData.total);
                } else if (mcq !== '' || cq !== '' || pr !== '') {
                    total = (Number(mcq) || 0) + (Number(cq) || 0) + (Number(pr) || 0);
                }
            } else if (typeof markData === 'number' || (typeof markData === 'string' && markData.trim() !== '' && markData !== '-')) {
                const str = markData.toString().trim().toUpperCase();
                if (str === 'A' || str === 'ABS') {
                    return { mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true };
                }
                total = Number(markData) || 0;
                cq = total;
            }

            const hasMarks = isAbsent || total !== null || mcq !== '' || cq !== '' || pr !== '';
            return { mcq, cq, pr, total, isAbsent, hasMarks };
        }

        // Dynamic Subject Finder directly from Exam List (school_exam_schedules) and live marks (school_student_marks)
        function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {
            const normC = normalizeClassString(selectedClass);
            const normS = normalizeSectionString(selectedSection);
            const isSecondary = ['9', '10'].includes(normC);
            const isJunior = ['6', '7', '8'].includes(normC);
            const isPrimary = ['play', 'nursery', 'kg', '1', '2', '3', '4', '5'].includes(normC);

            const relInfo = getStudentReligionInfo(student);
            const optInfo = getStudentOptionalSubjectInfo(student, normS);

            let rawList = [];

            let savedMarks = {};
            try {
                const rawSavedMarks = localStorage.getItem('school_student_marks');
                if (rawSavedMarks) savedMarks = JSON.parse(rawSavedMarks);
            } catch(e) {}

            // 1. PRIMARY: Read subjects strictly created under this Exam Name in "Exam List" (school_exam_schedules)
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const schedules = JSON.parse(rawSchedules);
                    if (Array.isArray(schedules) && schedules.length > 0) {
                        const matchedSchedules = schedules.filter(sc => {
                            if (!sc) return false;
                            const matchExam = isExamMatch(sc.term || sc.examName, selectedExam);
                            const matchClass = normalizeClassString(sc.className || sc.class) === normC;
                            let matchSec = true;
                            if (normS && sc.section && sc.section !== 'All' && sc.section !== '(প্রযোজ্য না)') {
                                const scSecNorm = normalizeSectionString(sc.section);
                                const scSecs = sc.section.toString().toLowerCase().split(',').map(x => x.trim());
                                matchSec = scSecNorm === normS || scSecs.includes(normS) || scSecs.includes((selectedSection || '').toLowerCase().trim());
                            }
                            return matchExam && matchClass && matchSec;
                        });

                        if (matchedSchedules.length > 0) {
                            const subjectGroups = new Map();
                            matchedSchedules.forEach(sc => {
                                const sName = sc.subject || sc.subjectName || sc.name || '';
                                const sBnName = getSubjectNameBangla(sc) || sName;

                                const isRelSub = sBnName.includes('ইসলাম') || sBnName.includes('হিন্দু') || sBnName.includes('বৌদ্ধ') || sBnName.includes('খ্রিস্ট') || sBnName.includes('ধর্ম');
                                if (isRelSub && !sBnName.includes(relInfo.display) && !sBnName.includes('ধর্ম ও নৈতিক')) {
                                    return;
                                }
                                const finalBnName = isRelSub ? relInfo.nameBn : sBnName;
                                const groupKey = finalBnName.toLowerCase().trim();

                                if (!subjectGroups.has(groupKey)) {
                                    subjectGroups.set(groupKey, {
                                        schedule: sc,
                                        scheduleIds: [sc.id],
                                        name: sName || finalBnName,
                                        nameBn: finalBnName,
                                        code: sc.code || '',
                                        fullMarks: parseInt(sc.totalMarks || sc.fullMarks) || (finalBnName.includes('আইসিটি') || finalBnName.includes('ICT') ? 50 : 100),
                                        isOptional: !!sc.isOptional
                                    });
                                } else {
                                    const grp = subjectGroups.get(groupKey);
                                    if (sc.id && !grp.scheduleIds.includes(sc.id)) {
                                        grp.scheduleIds.push(sc.id);
                                    }
                                    if (sc.hasMarks) {
                                        grp.schedule = sc;
                                        grp.scheduleId = sc.id;
                                    }
                                }
                            });

                            subjectGroups.forEach(grp => {
                                const sc = grp.schedule;
                                rawList.push({
                                    scheduleId: grp.scheduleId || sc.id,
                                    scheduleIds: grp.scheduleIds,
                                    name: grp.name,
                                    nameBn: grp.nameBn,
                                    code: grp.code,
                                    fullMarks: grp.fullMarks,
                                    isOptional: grp.isOptional
                                });
                            });
                        }
                    }
                }
            } catch(e) {
                console.error("Error reading exam schedules from Exam List:", e);
            }

            // 2. Secondary fallback: check school_subjects catalog if no schedule found for this exam
            if (rawList.length === 0) {
                try {
                    const rawSubjectsMap = localStorage.getItem('school_subjects');
                    if (rawSubjectsMap) {
                        const subMap = JSON.parse(rawSubjectsMap);
                        if (typeof subMap === 'object' && subMap !== null) {
                            const classKeys = Object.keys(subMap);
                            const matchedKey = classKeys.find(k => {
                                const nk = normalizeClassString(k);
                                return nk === normC || k.toLowerCase().trim() === (selectedClass || '').toLowerCase().trim();
                            });
                            if (matchedKey && Array.isArray(subMap[matchedKey]) && subMap[matchedKey].length > 0) {
                                subMap[matchedKey].forEach(s => {
                                    if (!s) return;
                                    const sec = (s.section || 'All').toString().trim().toLowerCase();
                                    const sBnName = getSubjectNameBangla(s);
                                    const isRelSub = sBnName.includes('ইসলাম') || sBnName.includes('হিন্দু') || sBnName.includes('বৌদ্ধ') || sBnName.includes('খ্রিস্ট') || sBnName.includes('ধর্ম');
                                    if (isRelSub && !sBnName.includes(relInfo.display) && !sBnName.includes('ধর্ম ও নৈতিক')) {
                                        return;
                                    }
                                    if (sec === 'all' || sec === '' || sec.includes(normS) || normS.includes(sec)) {
                                        rawList.push({
                                            name: s.name || sBnName,
                                            nameBn: isRelSub ? relInfo.nameBn : sBnName,
                                            code: s.code || '',
                                            fullMarks: s.fullMarks || 100,
                                            isOptional: !!s.isOptional
                                        });
                                    }
                                });
                            }
                        }
                    }
                } catch(e) {}
            }

            // 3. Fallback standard curriculum subjects if none configured
            if (rawList.length === 0) {
                if (isPrimary) {
                    rawList = [
                        { name: 'বাংলা', nameBn: 'বাংলা', fullMarks: 100 },
                        { name: 'ইংরেজি', nameBn: 'ইংরেজি', fullMarks: 100 },
                        { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100 },
                        { name: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', nameBn: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', fullMarks: 100 },
                        { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100 }
                    ];
                } else if (isJunior) {
                    rawList = [
                        { name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', fullMarks: 100 },
                        { name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', fullMarks: 100 },
                        { name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', fullMarks: 100 },
                        { name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', fullMarks: 100 },
                        { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100 },
                        { name: 'বিজ্ঞান', nameBn: 'বিজ্ঞান', fullMarks: 100 },
                        { name: 'বাংলাদেশ ও বিশ্বপরিচয়', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', fullMarks: 100 },
                        { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100 },
                        { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', fullMarks: 50 },
                        { name: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', nameBn: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', fullMarks: 100 }
                    ];
                } else {
                    const isSci = normS === 'science';
                    const isHum = normS === 'humanities';
                    rawList = [
                        { name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', fullMarks: 100, group: 'compulsory' },
                        { name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', fullMarks: 100, group: 'compulsory' },
                        { name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', fullMarks: 100, group: 'compulsory' },
                        { name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', fullMarks: 100, group: 'compulsory' },
                        { name: 'গণিত', nameBn: 'গণিত', fullMarks: 100, group: 'compulsory' },
                        { name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', fullMarks: 50, group: 'compulsory' },
                        { name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100, group: 'compulsory' },
                        { name: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', nameBn: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', fullMarks: 100, group: 'compulsory' }
                    ];
                    if (isSci) {
                        rawList.push({ name: 'পদার্থবিজ্ঞান', nameBn: 'পদার্থবিজ্ঞান', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: 'রসায়ন', nameBn: 'রসায়ন', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: 'জীববিজ্ঞান', nameBn: 'জীববিজ্ঞান', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true });
                    } else if (isHum) {
                        rawList.push({ name: 'পৌরনীতি ও নাগরিকতা', nameBn: 'পৌরনীতি ও নাগরিকতা', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: 'ইতিহাস ও সামাজিক বিজ্ঞান', nameBn: 'ইতিহাস ও সামাজিক বিজ্ঞান', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: 'ভূগোল ও পরিবেশ', nameBn: 'ভূগোল ও পরিবেশ', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true });
                    } else {
                        rawList.push({ name: 'হিসাববিজ্ঞান', nameBn: 'হিসাববিজ্ঞান', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: 'ব্যবসায় উদ্যোগ', nameBn: 'ব্যবসায় উদ্যোগ', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: 'ফিন্যান্স ও ব্যাংকিং', nameBn: 'ফিন্যান্স ও ব্যাংকিং', fullMarks: 100, group: 'elective' });
                        rawList.push({ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true });
                    }
                }
            }

            // Sort rawList strictly by curriculum hierarchy rank
            rawList.sort((a, b) => getSubjectSortRank(a) - getSubjectSortRank(b));

            // Extract real student marks from savedMarks for each subject in rawList
            rawList.forEach(item => {
                const markRes = getStudentMarksForSubject(student, item, selectedExam, savedMarks);
                item.mcq = markRes.mcq;
                item.cq = markRes.cq;
                item.pr = markRes.pr;
                item.total = markRes.total;
                item.isAbsent = markRes.isAbsent;
                item.hasMarks = markRes.hasMarks;
            });

            // Format rawList into structured marksheet rows (combining 1st & 2nd papers where applicable)
            const rows = [];
            const pairedIndices = new Set();

            for (let i = 0; i < rawList.length; i++) {
                if (pairedIndices.has(i)) continue;
                const current = rawList[i];
                let curName = (current.nameBn || getSubjectNameBangla(current) || current.name || '').trim();
                const curFull = parseInt(current.fullMarks || current.totalMarks) || (curName.includes('আইসিটি') || curName.includes('ICT') ? 50 : 100);

                let isFirstPaper = false;
                let pairIndex = -1;

                if (curName.includes('বাংলা সাহিত্য') || curName.includes('বাংলা ১ম') || curName.toLowerCase().includes('bangla 1st')) {
                    pairIndex = rawList.findIndex((item, idx) => {
                        if (idx === i || pairedIndices.has(idx)) return false;
                        const iName = (item.nameBn || getSubjectNameBangla(item) || item.name || '').trim();
                        return iName.includes('বাংলা ভাষার ব্যাকরণ') || iName.includes('বাংলা ২য়') || iName.includes('ব্যাকরণ') || iName.toLowerCase().includes('bangla 2nd');
                    });
                    if (pairIndex !== -1) isFirstPaper = true;
                } else if (curName.includes('ইংরেজি ১ম') || curName.toLowerCase().includes('english 1st') || curName.toLowerCase().includes('english for today')) {
                    pairIndex = rawList.findIndex((item, idx) => {
                        if (idx === i || pairedIndices.has(idx)) return false;
                        const iName = (item.nameBn || getSubjectNameBangla(item) || item.name || '').trim();
                        return iName.includes('ইংরেজি ২য়') || iName.toLowerCase().includes('english 2nd') || iName.toLowerCase().includes('grammar');
                    });
                    if (pairIndex !== -1) isFirstPaper = true;
                }

                let groupType = current.group || (current.isOptional ? 'optional' : 'compulsory');
                if (!current.group && (curName.includes('রসায়ন') || curName.includes('পদার্থ') || curName.includes('জীব') || curName.includes('হিসাব') || curName.includes('পৌরনীতি') || curName.includes('ইতিহাস') || curName.includes('ভূগোল') || curName.includes('ব্যবসায়'))) {
                    groupType = 'elective';
                } else if (!current.group && (curName.includes('উচ্চতর') || curName.includes('কৃষি') || current.isOptional)) {
                    groupType = 'optional';
                }

                if (isFirstPaper && pairIndex !== -1) {
                    pairedIndices.add(i);
                    pairedIndices.add(pairIndex);
                    const pairItem = rawList[pairIndex];
                    let pairName = (pairItem.nameBn || getSubjectNameBangla(pairItem) || pairItem.name || '').trim();

                    const pairFull = parseInt(pairItem.fullMarks || pairItem.totalMarks) || 100;

                    rows.push({
                        name: curName,
                        fullMarks: curFull,
                        mcq: current.mcq,
                        cq: current.cq,
                        pr: current.pr,
                        total: current.total,
                        hasMarks: current.hasMarks,
                        isAbsent: current.isAbsent,
                        isCombined: true,
                        pairWith: pairName,
                        pairFull: pairFull,
                        pairMcq: pairItem.mcq,
                        pairCq: pairItem.cq,
                        pairPr: pairItem.pr,
                        pairTotal: pairItem.total,
                        pairHasMarks: pairItem.hasMarks,
                        pairIsAbsent: pairItem.isAbsent,
                        group: groupType,
                        isOptional: false
                    });
                } else {
                    pairedIndices.add(i);
                    rows.push({
                        name: curName,
                        fullMarks: curFull,
                        mcq: current.mcq,
                        cq: current.cq,
                        pr: current.pr,
                        total: current.total,
                        hasMarks: current.hasMarks,
                        isAbsent: current.isAbsent,
                        isCombined: false,
                        group: groupType,
                        isOptional: current.isOptional || groupType === 'optional'
                    });
                }
            }

            if (isSecondary) {
                const optIdx = rows.findIndex(r => r.group === 'optional' || r.isOptional);
                if (optIdx !== -1 && optIdx !== rows.length - 1) {
                    const optRow = rows.splice(optIdx, 1)[0];
                    rows.push(optRow);
                }
            }

            return rows;
        }'''
    return helper_code

print("Module defined")

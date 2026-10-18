import sys
import subprocess
import re

# 1. Prepare helper_and_subjects generator
def generate_helper_and_subjects(indent="        "):
    return f'''{indent}// Helper to extract student marks for a given subject from school_student_marks (Exam List & Evaluations)
{indent}function getStudentMarksForSubject(student, subjectObj, selectedExam, savedMarks) {{
{indent}    if (!student || !savedMarks || typeof savedMarks !== 'object') {{
{indent}        return {{ mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false }};
{indent}    }}
{indent}    const stIds = [
{indent}        student.id,
{indent}        student.studentId,
{indent}        student.regNo,
{indent}        student.roll,
{indent}        student.rollNo,
{indent}        student.code
{indent}    ].filter(Boolean).map(x => String(x).trim());

{indent}    const schedIds = [];
{indent}    if (subjectObj.scheduleId) schedIds.push(String(subjectObj.scheduleId).trim());
{indent}    if (Array.isArray(subjectObj.scheduleIds)) {{
{indent}        subjectObj.scheduleIds.forEach(id => {{
{indent}            if (id && !schedIds.includes(String(id).trim())) schedIds.push(String(id).trim());
{indent}        }});
{indent}    }}

{indent}    const subCodes = [];
{indent}    if (subjectObj.code) subCodes.push(String(subjectObj.code).trim());
{indent}    const subNames = [
{indent}        subjectObj.name,
{indent}        subjectObj.rawName,
{indent}        subjectObj.nameBn
{indent}    ].filter(Boolean).map(x => String(x).trim());

{indent}    let markRecord = null;

{indent}    // 1. Check schedule-specific mark keys: marks_{{stId}}_{{schedId}}
{indent}    for (const stId of stIds) {{
{indent}        for (const schId of schedIds) {{
{indent}            const k = `marks_${{stId}}_${{schId}}`;
{indent}            if (savedMarks[k]) {{
{indent}                markRecord = savedMarks[k];
{indent}                break;
{indent}            }}
{indent}        }}
{indent}        if (markRecord) break;
{indent}    }}

{indent}    // 2. Check exam-name mark keys: marks_{{stId}}_{{exam}}
{indent}    if (!markRecord && selectedExam) {{
{indent}        const examKeys = [selectedExam, selectedExam.trim()];
{indent}        for (const stId of stIds) {{
{indent}            for (const exKey of examKeys) {{
{indent}                const k = `marks_${{stId}}_${{exKey}}`;
{indent}                if (savedMarks[k]) {{
{indent}                    markRecord = savedMarks[k];
{indent}                    break;
{indent}                }}
{indent}            }}
{indent}            if (markRecord) break;
{indent}        }}
{indent}    }}

{indent}    if (!markRecord) {{
{indent}        return {{ mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false }};
{indent}    }}

{indent}    if (typeof markRecord === 'string') {{
{indent}        const upper = markRecord.trim().toUpperCase();
{indent}        if (upper === 'A' || upper === 'ABS') {{
{indent}            return {{ mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true }};
{indent}        }}
{indent}    }}

{indent}    let markData = null;
{indent}    if (typeof markRecord === 'object' && markRecord !== null) {{
{indent}        for (const code of subCodes) {{
{indent}            if (markRecord[code] !== undefined) {{
{indent}                markData = markRecord[code];
{indent}                break;
{indent}            }}
{indent}        }}
{indent}        if (markData === null) {{
{indent}            for (const name of subNames) {{
{indent}                if (markRecord[name] !== undefined) {{
{indent}                    markData = markRecord[name];
{indent}                    break;
{indent}                }}
{indent}            }}
{indent}        }}
{indent}        if (markData === null) {{
{indent}            const recKeys = Object.keys(markRecord);
{indent}            for (const rk of recKeys) {{
{indent}                const rkLower = rk.toLowerCase().trim();
{indent}                for (const name of subNames) {{
{indent}                    const nLower = name.toLowerCase().trim();
{indent}                    if (rkLower === nLower || rkLower.includes(nLower) || nLower.includes(rkLower)) {{
{indent}                        markData = markRecord[rk];
{indent}                        break;
{indent}                    }}
{indent}                }}
{indent}                if (markData !== null) break;
{indent}            }}
{indent}        }}
{indent}        if (markData === null) {{
{indent}            const keys = Object.keys(markRecord).filter(k => k !== 'timestamp');
{indent}            if (keys.length === 1 && typeof markRecord[keys[0]] === 'object') {{
{indent}                markData = markRecord[keys[0]];
{indent}            }} else if (markRecord.mcq !== undefined || markRecord.cq !== undefined || markRecord.total !== undefined || markRecord.isAbsent !== undefined) {{
{indent}                markData = markRecord;
{indent}            }}
{indent}        }}
{indent}    }}

{indent}    if (markData === null || markData === undefined) {{
{indent}        return {{ mcq: '', cq: '', pr: '', total: null, isAbsent: false, hasMarks: false }};
{indent}    }}

{indent}    let isAbsent = false;
{indent}    let mcq = '';
{indent}    let cq = '';
{indent}    let pr = '';
{indent}    let total = null;

{indent}    if (typeof markData === 'object' && markData !== null) {{
{indent}        isAbsent = !!markData.isAbsent;
{indent}        if (!isAbsent && (String(markData.cq).toUpperCase() === 'A' || String(markData.mcq).toUpperCase() === 'A' || String(markData.practical).toUpperCase() === 'A')) {{
{indent}            isAbsent = true;
{indent}        }}

{indent}        if (isAbsent) {{
{indent}            return {{ mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true }};
{indent}        }}

{indent}        if (markData.mcq !== undefined && markData.mcq !== null && markData.mcq !== '' && markData.mcq !== '-') {{
{indent}            mcq = Number(markData.mcq);
{indent}        }}
{indent}        if (markData.cq !== undefined && markData.cq !== null && markData.cq !== '' && markData.cq !== '-') {{
{indent}            cq = Number(markData.cq);
{indent}        }}
{indent}        if (markData.practical !== undefined && markData.practical !== null && markData.practical !== '' && markData.practical !== '-') {{
{indent}            pr = Number(markData.practical);
{indent}        }}
{indent}        if (markData.total !== undefined && markData.total !== null && markData.total !== '' && markData.total !== '-') {{
{indent}            total = Number(markData.total);
{indent}        }} else if (mcq !== '' || cq !== '' || pr !== '') {{
{indent}            total = (Number(mcq) || 0) + (Number(cq) || 0) + (Number(pr) || 0);
{indent}        }}
{indent}    }} else if (typeof markData === 'number' || (typeof markData === 'string' && markData.trim() !== '' && markData !== '-')) {{
{indent}        const str = markData.toString().trim().toUpperCase();
{indent}        if (str === 'A' || str === 'ABS') {{
{indent}            return {{ mcq: 'A', cq: 'A', pr: 'A', total: 0, isAbsent: true, hasMarks: true }};
{indent}        }}
{indent}        total = Number(markData) || 0;
{indent}        cq = total;
{indent}    }}

{indent}    const hasMarks = isAbsent || total !== null || mcq !== '' || cq !== '' || pr !== '';
{indent}    return {{ mcq, cq, pr, total, isAbsent, hasMarks }};
{indent}}}

{indent}// Dynamic Subject Finder: Subject names are strictly taken from "Exam List" (school_exam_schedules) and update continuously
{indent}function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {{
{indent}    const normC = normalizeClassString(selectedClass);
{indent}    const normS = normalizeSectionString(selectedSection);
{indent}    const isSecondary = ['9', '10'].includes(normC);
{indent}    const isJunior = ['6', '7', '8'].includes(normC);
{indent}    const isPrimary = ['play', 'nursery', 'kg', '1', '2', '3', '4', '5'].includes(normC);

{indent}    const relInfo = getStudentReligionInfo(student);
{indent}    const optInfo = getStudentOptionalSubjectInfo(student, normS);

{indent}    let rawList = [];

{indent}    let savedMarks = {{}};
{indent}    try {{
{indent}        const rawSavedMarks = localStorage.getItem('school_student_marks');
{indent}        if (rawSavedMarks) savedMarks = JSON.parse(rawSavedMarks);
{indent}    }} catch(e) {{}}

{indent}    // 1. PRIMARY: Read subjects strictly created under this Exam Name in "Exam List" (school_exam_schedules)
{indent}    try {{
{indent}        const rawSchedules = localStorage.getItem('school_exam_schedules');
{indent}        if (rawSchedules) {{
{indent}            const schedules = JSON.parse(rawSchedules);
{indent}            if (Array.isArray(schedules) && schedules.length > 0) {{
{indent}                const matchedSchedules = schedules.filter(sc => {{
{indent}                    if (!sc) return false;
{indent}                    const matchExam = isExamMatch(sc.term || sc.examName, selectedExam);
{indent}                    const matchClass = normalizeClassString(sc.className || sc.class) === normC;
{indent}                    let matchSec = true;
{indent}                    if (normS && sc.section && sc.section !== 'All' && sc.section !== '(প্রযোজ্য না)') {{
{indent}                        const scSecNorm = normalizeSectionString(sc.section);
{indent}                        const scSecs = sc.section.toString().toLowerCase().split(',').map(x => x.trim());
{indent}                        matchSec = scSecNorm === normS || scSecs.includes(normS) || scSecs.includes((selectedSection || '').toLowerCase().trim());
{indent}                    }}
{indent}                    return matchExam && matchClass && matchSec;
{indent}                }});

{indent}                if (matchedSchedules.length > 0) {{
{indent}                    const subjectGroups = new Map();
{indent}                    matchedSchedules.forEach(sc => {{
{indent}                        // Exact subject name as created in Exam List!
{indent}                        const exactSubName = (sc.subject || sc.subjectName || sc.name || '').trim();
{indent}                        if (!exactSubName) return;

{indent}                        // Filter out religion subjects that do not match student religion
{indent}                        const normSub = exactSubName.toLowerCase();
{indent}                        const isRelSub = normSub.includes('ইসলাম') || normSub.includes('islam') ||
{indent}                                         normSub.includes('হিন্দু') || normSub.includes('hindu') ||
{indent}                                         normSub.includes('বৌদ্ধ') || normSub.includes('buddhist') ||
{indent}                                         normSub.includes('খ্রিস্ট') || normSub.includes('christian') ||
{indent}                                         normSub.includes('ধর্ম') || normSub.includes('religion');
{indent}                        if (isRelSub) {{
{indent}                            const studentRel = String(student?.religion || '').toLowerCase();
{indent}                            const isIslamStudent = !studentRel || studentRel.includes('islam') || studentRel.includes('ইসলাম');
{indent}                            const isHinduStudent = studentRel.includes('hindu') || studentRel.includes('হিন্দু') || studentRel.includes('সনাতন');
{indent}                            const isBuddhStudent = studentRel.includes('buddh') || studentRel.includes('বৌদ্ধ');
{indent}                            const isChristStudent = studentRel.includes('christ') || studentRel.includes('খ্রিস্ট');

{indent}                            const isIslamSub = normSub.includes('islam') || normSub.includes('ইসলাম');
{indent}                            const isHinduSub = normSub.includes('hindu') || normSub.includes('হিন্দু');
{indent}                            const isBuddhSub = normSub.includes('buddh') || normSub.includes('বৌদ্ধ');
{indent}                            const isChristSub = normSub.includes('christ') || normSub.includes('খ্রিস্ট');

{indent}                            if ((isIslamSub && !isIslamStudent) || (isHinduSub && !isHinduStudent) || (isBuddhSub && !isBuddhStudent) || (isChristSub && !isChristStudent)) {{
{indent}                                return;
{indent}                            }}
{indent}                        }}

{indent}                        const groupKey = exactSubName.toLowerCase();

{indent}                        if (!subjectGroups.has(groupKey)) {{
{indent}                            subjectGroups.set(groupKey, {{
{indent}                                schedule: sc,
{indent}                                scheduleIds: [sc.id],
{indent}                                name: exactSubName,
{indent}                                rawName: exactSubName,
{indent}                                nameBn: exactSubName,
{indent}                                code: sc.code || '',
{indent}                                fullMarks: parseInt(sc.totalMarks || sc.fullMarks) || (normSub.includes('ict') || normSub.includes('আইসিটি') ? 50 : 100),
{indent}                                isOptional: !!sc.isOptional
{indent}                            }});
{indent}                        }} else {{
{indent}                            const grp = subjectGroups.get(groupKey);
{indent}                            if (sc.id && !grp.scheduleIds.includes(sc.id)) {{
{indent}                                grp.scheduleIds.push(sc.id);
{indent}                            }}
{indent}                            if (sc.hasMarks) {{
{indent}                                grp.schedule = sc;
{indent}                                grp.scheduleId = sc.id;
{indent}                            }}
{indent}                        }}
{indent}                    }});

{indent}                    subjectGroups.forEach(grp => {{
{indent}                        const sc = grp.schedule;
{indent}                        rawList.push({{
{indent}                            scheduleId: grp.scheduleId || sc.id,
{indent}                            scheduleIds: grp.scheduleIds,
{indent}                            name: grp.name,
{indent}                            rawName: grp.rawName,
{indent}                            nameBn: grp.name,
{indent}                            code: grp.code,
{indent}                            fullMarks: grp.fullMarks,
{indent}                            isOptional: grp.isOptional
{indent}                        }});
{indent}                    }});
{indent}                }}
{indent}            }}
{indent}        }}
{indent}    }} catch(e) {{
{indent}        console.error("Error reading exam schedules from Exam List:", e);
{indent}    }}

{indent}    // 2. Secondary fallback: check school_subjects catalog if no schedule found for this exam
{indent}    if (rawList.length === 0) {{
{indent}        try {{
{indent}            const rawSubjectsMap = localStorage.getItem('school_subjects');
{indent}            if (rawSubjectsMap) {{
{indent}                const subMap = JSON.parse(rawSubjectsMap);
{indent}                if (typeof subMap === 'object' && subMap !== null) {{
{indent}                    const classKeys = Object.keys(subMap);
{indent}                    const matchedKey = classKeys.find(k => {{
{indent}                        const nk = normalizeClassString(k);
{indent}                        return nk === normC || k.toLowerCase().trim() === (selectedClass || '').toLowerCase().trim();
{indent}                    }});
{indent}                    if (matchedKey && Array.isArray(subMap[matchedKey]) && subMap[matchedKey].length > 0) {{
{indent}                        subMap[matchedKey].forEach(s => {{
{indent}                            if (!s) return;
{indent}                            const sec = (s.section || 'All').toString().trim().toLowerCase();
{indent}                            const sBnName = getSubjectNameBangla(s);
{indent}                            const isRelSub = sBnName.includes('ইসলাম') || sBnName.includes('হিন্দু') || sBnName.includes('বৌদ্ধ') || sBnName.includes('খ্রিস্ট') || sBnName.includes('ধর্ম');
{indent}                            if (isRelSub && !sBnName.includes(relInfo.display) && !sBnName.includes('ধর্ম ও নৈতিক')) {{
{indent}                                return;
{indent}                            }}
{indent}                            if (sec === 'all' || sec === '' || sec.includes(normS) || normS.includes(sec)) {{
{indent}                                rawList.push({{
{indent}                                    name: s.name || sBnName,
{indent}                                    nameBn: isRelSub ? relInfo.nameBn : sBnName,
{indent}                                    code: s.code || '',
{indent}                                    fullMarks: s.fullMarks || 100,
{indent}                                    isOptional: !!s.isOptional
{indent}                                }});
{indent}                            }}
{indent}                        }});
{indent}                    }}
{indent}                }}
{indent}            }}
{indent}        }} catch(e) {{}}
{indent}    }}

{indent}    // 3. Fallback standard curriculum subjects if none configured
{indent}    if (rawList.length === 0) {{
{indent}        if (isPrimary) {{
{indent}            rawList = [
{indent}                {{ name: 'বাংলা', nameBn: 'বাংলা', fullMarks: 100 }},
{indent}                {{ name: 'ইংরেজি', nameBn: 'ইংরেজি', fullMarks: 100 }},
{indent}                {{ name: 'গণিত', nameBn: 'গণিত', fullMarks: 100 }},
{indent}                {{ name: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', nameBn: 'পরিবেশ পরিচিতি / সাধারণ বিজ্ঞান', fullMarks: 100 }},
{indent}                {{ name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100 }}
{indent}            ];
{indent}        }} else if (isJunior) {{
{indent}            rawList = [
{indent}                {{ name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', fullMarks: 100 }},
{indent}                {{ name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', fullMarks: 100 }},
{indent}                {{ name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', fullMarks: 100 }},
{indent}                {{ name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', fullMarks: 100 }},
{indent}                {{ name: 'গণিত', nameBn: 'গণিত', fullMarks: 100 }},
{indent}                {{ name: 'বিজ্ঞান', nameBn: 'বিজ্ঞান', fullMarks: 100 }},
{indent}                {{ name: 'বাংলাদেশ ও বিশ্বপরিচয়', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', fullMarks: 100 }},
{indent}                {{ name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100 }},
{indent}                {{ name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', fullMarks: 50 }},
{indent}                {{ name: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', nameBn: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', fullMarks: 100 }}
{indent}            ];
{indent}        }} else {{
{indent}            const isSci = normS === 'science';
{indent}            const isHum = normS === 'humanities';
{indent}            rawList = [
{indent}                {{ name: 'বাংলা সাহিত্য', nameBn: 'বাংলা সাহিত্য', fullMarks: 100, group: 'compulsory' }},
{indent}                {{ name: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', nameBn: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি', fullMarks: 100, group: 'compulsory' }},
{indent}                {{ name: 'ইংরেজি ১ম পত্র', nameBn: 'ইংরেজি ১ম পত্র', fullMarks: 100, group: 'compulsory' }},
{indent}                {{ name: 'ইংরেজি ২য় পত্র', nameBn: 'ইংরেজি ২য় পত্র', fullMarks: 100, group: 'compulsory' }},
{indent}                {{ name: 'গণিত', nameBn: 'গণিত', fullMarks: 100, group: 'compulsory' }},
{indent}                {{ name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', fullMarks: 50, group: 'compulsory' }},
{indent}                {{ name: relInfo.name, nameBn: relInfo.nameBn, fullMarks: 100, group: 'compulsory' }},
{indent}                {{ name: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', nameBn: isSci ? 'বাংলাদেশ ও বিশ্বপরিচয়' : 'সাধারণ বিজ্ঞান', fullMarks: 100, group: 'compulsory' }}
{indent}            ];
{indent}            if (isSci) {{
{indent}                rawList.push({{ name: 'পদার্থবিজ্ঞান', nameBn: 'পদার্থবিজ্ঞান', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: 'রসায়ন', nameBn: 'রসায়ন', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: 'জীববিজ্ঞান', nameBn: 'জীববিজ্ঞান', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true }});
{indent}            }} else if (isHum) {{
{indent}                rawList.push({{ name: 'পৌরনীতি ও নাগরিকতা', nameBn: 'পৌরনীতি ও নাগরিকতা', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: 'ইতিহাস ও সামাজিক বিজ্ঞান', nameBn: 'ইতিহাস ও সামাজিক বিজ্ঞান', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: 'ভূগোল ও পরিবেশ', nameBn: 'ভূগোল ও পরিবেশ', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true }});
{indent}            }} else {{
{indent}                rawList.push({{ name: 'হিসাববিজ্ঞান', nameBn: 'হিসাববিজ্ঞান', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: 'ব্যবসায় উদ্যোগ', nameBn: 'ব্যবসায় উদ্যোগ', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: 'ফিন্যান্স ও ব্যাংকিং', nameBn: 'ফিন্যান্স ও ব্যাংকিং', fullMarks: 100, group: 'elective' }});
{indent}                rawList.push({{ name: optInfo.name, nameBn: optInfo.nameBn, fullMarks: 100, group: 'optional', isOptional: true }});
{indent}            }}
{indent}        }}
{indent}    }}

{indent}    // Sort rawList strictly by curriculum hierarchy rank
{indent}    rawList.sort((a, b) => getSubjectSortRank(a) - getSubjectSortRank(b));

{indent}    // Extract real student marks from savedMarks for each subject in rawList
{indent}    rawList.forEach(item => {{
{indent}        const markRes = getStudentMarksForSubject(student, item, selectedExam, savedMarks);
{indent}        item.mcq = markRes.mcq;
{indent}        item.cq = markRes.cq;
{indent}        item.pr = markRes.pr;
{indent}        item.total = markRes.total;
{indent}        item.isAbsent = markRes.isAbsent;
{indent}        item.hasMarks = markRes.hasMarks;
{indent}    }});

{indent}    // Format rawList into structured marksheet rows (combining 1st & 2nd papers where applicable)
{indent}    const rows = [];
{indent}    const pairedIndices = new Set();

{indent}    for (let i = 0; i < rawList.length; i++) {{
{indent}        if (pairedIndices.has(i)) continue;
{indent}        const current = rawList[i];
{indent}        const curName = (current.name || current.rawName || current.nameBn || current.subject || '').trim();
{indent}        const curFull = parseInt(current.fullMarks || current.totalMarks) || (curName.toLowerCase().includes('ict') || curName.includes('আইসিটি') ? 50 : 100);

{indent}        let isFirstPaper = false;
{indent}        let pairIndex = -1;

{indent}        const normCur = curName.toLowerCase();
{indent}        const isBangla1 = normCur.includes('bangla 1') || normCur.includes('bangla 1st') || normCur.includes('বাংলা ১ম') || normCur.includes('বাংলা সাহিত্য');
{indent}        const isEnglish1 = normCur.includes('english 1') || normCur.includes('english 1st') || normCur.includes('english for today') || normCur.includes('ইংরেজি ১ম');

{indent}        if (isBangla1) {{
{indent}            pairIndex = rawList.findIndex((item, idx) => {{
{indent}                if (idx === i || pairedIndices.has(idx)) return false;
{indent}                const normP = (item.name || item.rawName || item.nameBn || item.subject || '').toLowerCase();
{indent}                return normP.includes('bangla 2') || normP.includes('bangla 2nd') || normP.includes('বাংলা ২য়') || normP.includes('ব্যাকরণ');
{indent}            }});
{indent}            if (pairIndex !== -1) isFirstPaper = true;
{indent}        }} else if (isEnglish1) {{
{indent}            pairIndex = rawList.findIndex((item, idx) => {{
{indent}                if (idx === i || pairedIndices.has(idx)) return false;
{indent}                const normP = (item.name || item.rawName || item.nameBn || item.subject || '').toLowerCase();
{indent}                return normP.includes('english 2') || normP.includes('english 2nd') || normP.includes('grammar') || normP.includes('ইংরেজি ২য়');
{indent}            }});
{indent}            if (pairIndex !== -1) isFirstPaper = true;
{indent}        }}

{indent}        let groupType = current.group || (current.isOptional ? 'optional' : 'compulsory');
{indent}        if (!current.group && (normCur.includes('chemistry') || normCur.includes('physics') || normCur.includes('biology') || normCur.includes('accounting') || normCur.includes('civics') || normCur.includes('history') || normCur.includes('geography') || normCur.includes('business') || normCur.includes('রসায়ন') || normCur.includes('পদার্থ') || normCur.includes('জীব') || normCur.includes('হিসাব') || normCur.includes('পৌরনীতি') || normCur.includes('ইতিহাস') || normCur.includes('ভূগোল') || normCur.includes('ব্যবসায়'))) {{
{indent}            groupType = 'elective';
{indent}        }} else if (!current.group && (normCur.includes('higher') || normCur.includes('agri') || normCur.includes('উচ্চতর') || normCur.includes('কৃষি') || current.isOptional)) {{
{indent}            groupType = 'optional';
{indent}        }}

{indent}        if (isFirstPaper && pairIndex !== -1) {{
{indent}            pairedIndices.add(i);
{indent}            pairedIndices.add(pairIndex);
{indent}            const pairItem = rawList[pairIndex];
{indent}            // Exact subject name from Exam List for Paper 2!
{indent}            const pairName = (pairItem.name || pairItem.rawName || pairItem.nameBn || pairItem.subject || '').trim();
{indent}            const pairFull = parseInt(pairItem.fullMarks || pairItem.totalMarks) || 100;

{indent}            rows.push({{
{indent}                name: curName,
{indent}                fullMarks: curFull,
{indent}                mcq: current.mcq,
{indent}                cq: current.cq,
{indent}                pr: current.pr,
{indent}                total: current.total,
{indent}                hasMarks: current.hasMarks,
{indent}                isAbsent: current.isAbsent,
{indent}                isCombined: true,
{indent}                pairWith: pairName,
{indent}                pairFull: pairFull,
{indent}                pairMcq: pairItem.mcq,
{indent}                pairCq: pairItem.cq,
{indent}                pairPr: pairItem.pr,
{indent}                pairTotal: pairItem.total,
{indent}                pairHasMarks: pairItem.hasMarks,
{indent}                pairIsAbsent: pairItem.isAbsent,
{indent}                group: groupType,
{indent}                isOptional: false
{indent}            }});
{indent}        }} else {{
{indent}            pairedIndices.add(i);
{indent}            rows.push({{
{indent}                name: curName,
{indent}                fullMarks: curFull,
{indent}                mcq: current.mcq,
{indent}                cq: current.cq,
{indent}                pr: current.pr,
{indent}                total: current.total,
{indent}                hasMarks: current.hasMarks,
{indent}                isAbsent: current.isAbsent,
{indent}                isCombined: false,
{indent}                group: groupType,
{indent}                isOptional: current.isOptional || groupType === 'optional'
{indent}            }});
{indent}        }}
{indent}    }}

{indent}    if (isSecondary) {{
{indent}        const optIdx = rows.findIndex(r => r.group === 'optional' || r.isOptional);
{indent}        if (optIdx !== -1 && optIdx !== rows.length - 1) {{
{indent}            const optRow = rows.splice(optIdx, 1)[0];
{indent}            rows.push(optRow);
{indent}        }}
{indent}    }}

{indent}    return rows;
{indent}}}'''

new_rank_fn_m = '''        function getSubjectSortRank(sub) {
            const raw = (typeof sub === 'string' ? sub : (sub.name || sub.subject || sub.rawName || sub.nameBn || '')).trim().toLowerCase();
            const isOpt = typeof sub === 'object' && (sub.isOptional || sub.group === 'optional');
            if (isOpt) return 999;

            if (raw.includes('বাংলা সাহিত্য') || raw.includes('বাংলা ১ম') || raw.includes('bangla 1')) return 1;
            if (raw.includes('বাংলা ভাষার ব্যাকরণ') || raw.includes('বাংলা ২য়') || raw.includes('bangla 2') || raw.includes('ব্যাকরণ')) return 2;
            if (raw.includes('ইংরেজি ১ম') || raw.includes('english 1') || raw.includes('english for today')) return 3;
            if (raw.includes('ইংরেজি ২য়') || raw.includes('english 2') || raw.includes('grammar')) return 4;
            if (raw.includes('গণিত') || raw.includes('mathematics') || raw === 'math') return 5;
            if (raw.includes('তথ্য ও যোগাযোগ') || raw.includes('ict') || raw.includes('আইসিটি')) return 6;
            if (raw.includes('ইসলাম') || raw.includes('হিন্দু') || raw.includes('বৌদ্ধ') || raw.includes('খ্রিস্ট') || raw.includes('ধর্ম') || raw.includes('religion') || raw.includes('islam') || raw.includes('hindu')) return 7;
            if (raw.includes('বাংলাদেশ ও বিশ্বপরিচয়') || raw.includes('bangladesh and global studies') || raw.includes('science') || raw.includes('বিজ্ঞান')) return 8;
            if (raw.includes('পদার্থবিজ্ঞান') || raw.includes('physics') || raw.includes('পৌরনীতি') || raw.includes('civics') || raw.includes('হিসাববিজ্ঞান') || raw.includes('accounting')) return 9;
            if (raw.includes('রসায়ন') || raw.includes('chemistry') || raw.includes('ইতিহাস') || raw.includes('history') || raw.includes('ব্যবসায়') || raw.includes('business')) return 10;
            if (raw.includes('জীববিজ্ঞান') || raw.includes('biology') || raw.includes('ভূগোল') || raw.includes('geography') || raw.includes('ফিন্যান্স') || raw.includes('finance')) return 11;
            if (raw.includes('অর্থনীতি') || raw.includes('economics') || raw.includes('চারু') || raw.includes('arts')) return 12;
            if (raw.includes('শারীরিক') || raw.includes('physical')) return 13;
            return 50;
        }'''

new_rank_fn_m1 = '''function getSubjectSortRank(sub) {
    const raw = (typeof sub === 'string' ? sub : (sub.name || sub.subject || sub.rawName || sub.nameBn || '')).trim().toLowerCase();
    const isOpt = typeof sub === 'object' && (sub.isOptional || sub.group === 'optional');
    if (isOpt) return 999;

    if (raw.includes('বাংলা সাহিত্য') || raw.includes('বাংলা ১ম') || raw.includes('bangla 1')) return 1;
    if (raw.includes('বাংলা ভাষার ব্যাকরণ') || raw.includes('বাংলা ২য়') || raw.includes('bangla 2') || raw.includes('ব্যাকরণ')) return 2;
    if (raw.includes('ইংরেজি ১ম') || raw.includes('english 1') || raw.includes('english for today')) return 3;
    if (raw.includes('ইংরেজি ২য়') || raw.includes('english 2') || raw.includes('grammar')) return 4;
    if (raw.includes('গণিত') || raw.includes('mathematics') || raw === 'math') return 5;
    if (raw.includes('তথ্য ও যোগাযোগ') || raw.includes('ict') || raw.includes('আইসিটি')) return 6;
    if (raw.includes('ইসলাম') || raw.includes('হিন্দু') || raw.includes('বৌদ্ধ') || raw.includes('খ্রিস্ট') || raw.includes('ধর্ম') || raw.includes('religion') || raw.includes('islam') || raw.includes('hindu')) return 7;
    if (raw.includes('বাংলাদেশ ও বিশ্বপরিচয়') || raw.includes('bangladesh and global studies') || raw.includes('science') || raw.includes('বিজ্ঞান')) return 8;
    if (raw.includes('পদার্থবিজ্ঞান') || raw.includes('physics') || raw.includes('পৌরনীতি') || raw.includes('civics') || raw.includes('হিসাববিজ্ঞান') || raw.includes('accounting')) return 9;
    if (raw.includes('রসায়ন') || raw.includes('chemistry') || raw.includes('ইতিহাস') || raw.includes('history') || raw.includes('ব্যবসায়') || raw.includes('business')) return 10;
    if (raw.includes('জীববিজ্ঞান') || raw.includes('biology') || raw.includes('ভূগোল') || raw.includes('geography') || raw.includes('ফিন্যান্স') || raw.includes('finance')) return 11;
    if (raw.includes('অর্থনীতি') || raw.includes('economics') || raw.includes('চারু') || raw.includes('arts')) return 12;
    if (raw.includes('শারীরিক') || raw.includes('physical')) return 13;
    return 50;
}'''

# --- UPDATE Marksheet.html ---
print("Updating Marksheet.html with exact subject names from Exam List...")
with open('Marksheet.html', 'r', encoding='utf-8') as f:
    text_m = f.read()

# Replace getSubjectSortRank in Marksheet.html
rank_start_m = "        function getSubjectSortRank(sub) {"
rank_end_m = "        function getStudentReligionInfo(student) {"
r_idx_start_m = text_m.find(rank_start_m)
r_idx_end_m = text_m.find(rank_end_m)
if r_idx_start_m != -1 and r_idx_end_m != -1:
    text_m = text_m[:r_idx_start_m] + new_rank_fn_m + "\n\n" + text_m[r_idx_end_m:]

# Replace helper and getSubjectsForClass in Marksheet.html
sub_start_m = "        // Helper to extract student marks for a given subject from school_student_marks"
sub_end_m = "        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {"
s_idx_start_m = text_m.find(sub_start_m)
s_idx_end_m = text_m.find(sub_end_m)
if s_idx_start_m != -1 and s_idx_end_m != -1:
    text_m = text_m[:s_idx_start_m] + generate_helper_and_subjects("        ") + "\n\n" + text_m[s_idx_end_m:]
else:
    print(f"Could not find sub markers in Marksheet.html: {s_idx_start_m}, {s_idx_end_m}")
    sys.exit(1)

with open('Marksheet.html', 'w', encoding='utf-8') as f:
    f.write(text_m)
print("[OK] Marksheet.html updated with exact Exam List subject names!")


# --- UPDATE Marksheet1.html ---
print("Updating Marksheet1.html with exact subject names from Exam List...")
with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    text_m1 = f.read()

# Replace getSubjectSortRank in Marksheet1.html
rank_start_m1 = "function getSubjectSortRank(sub) {"
rank_end_m1 = "function getStudentReligionInfo(student) {"
r_idx_start_m1 = text_m1.find(rank_start_m1)
r_idx_end_m1 = text_m1.find(rank_end_m1)
if r_idx_start_m1 != -1 and r_idx_end_m1 != -1:
    text_m1 = text_m1[:r_idx_start_m1] + new_rank_fn_m1 + "\n\n" + text_m1[r_idx_end_m1:]

# Replace helper and getSubjectsForClass in Marksheet1.html
sub_start_m1 = "// Helper to extract student marks for a given subject from school_student_marks"
sub_end_m1 = "function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {"
s_idx_start_m1 = text_m1.find(sub_start_m1)
s_idx_end_m1 = text_m1.find(sub_end_m1)
if s_idx_start_m1 != -1 and s_idx_end_m1 != -1:
    text_m1 = text_m1[:s_idx_start_m1] + generate_helper_and_subjects("") + "\n\n" + text_m1[s_idx_end_m1:]
else:
    print(f"Could not find sub markers in Marksheet1.html: {s_idx_start_m1}, {s_idx_end_m1}")
    sys.exit(1)

with open('Marksheet1.html', 'w', encoding='utf-8') as f:
    f.write(text_m1)
print("[OK] Marksheet1.html updated with exact Exam List subject names!")

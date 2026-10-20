
const schedules = [{"id": "1788103216016", "createdAt": 1788103216016, "class": "Eight", "section": "A, B, C, D", "term": "Elegileble test", "examType": "ENG", "subject": "English 1st Paper", "date": "30/08/2026", "teacher": "MD MAHTAB UDDIN", "slNo": "1", "marksEntryTime": "19/10/2026 02:35 PM", "hasMarks": true}, {"id": "1788103284828", "createdAt": 1788103284828, "class": "Eight", "section": "A, B, C, D", "term": "Elegileble test", "examType": "ENG", "subject": "English 2nd Paper", "date": "30/08/2026", "teacher": "MD MAHTAB UDDIN", "slNo": "1", "marksEntryTime": "19/10/2026 02:35 PM", "hasMarks": true}, {"id": "1788103332827", "createdAt": 1788103332827, "class": "Eight", "section": "A, B, C, D", "term": "Elegileble test", "examType": "100", "subject": "Mathematics", "date": "30/08/2026", "teacher": "MD MAHTAB UDDIN", "slNo": "1", "marksEntryTime": "19/10/2026 02:36 PM", "hasMarks": true}, {"id": "1788103362043", "createdAt": 1788103362043, "class": "Eight", "section": "A, B, C, D", "term": "Elegileble test", "examType": "Bng", "subject": "Science", "date": "30/08/2026", "teacher": "SHAH MD ROKONUZZAMAN CHOWDHURY", "slNo": "1", "marksEntryTime": "16/09/2026 08:12 PM"}, {"id": "1788103394414", "createdAt": 1788103394414, "class": "Eight", "section": "A, B, C, D", "term": "Elegileble test", "examType": "Bng", "subject": "Bangladesh And Global Studies", "date": "30/08/2026", "teacher": "SHAH MD ROKONUZZAMAN CHOWDHURY", "slNo": "1", "marksEntryTime": "19/10/2026 02:34 PM", "hasMarks": true}, {"id": "1788103481541", "createdAt": 1788103481541, "class": "Eight", "section": "A, B, C, D", "term": "Elegileble test", "examType": "Bng", "subject": "Bangla 1st Paper", "date": "30/08/2026", "teacher": "SHAH MD ROKONUZZAMAN CHOWDHURY", "slNo": "1", "marksEntryTime": "19/10/2026 02:35 PM", "hasMarks": true}, {"id": "1788103506003", "createdAt": 1788103506003, "class": "Eight", "section": "A, B, C, D", "term": "Elegileble test", "examType": "Bng", "subject": "Bangla 2nd Paper", "date": "30/08/2026", "teacher": "SHAH MD ROKONUZZAMAN CHOWDHURY", "slNo": "1", "marksEntryTime": "19/10/2026 02:35 PM", "hasMarks": true}, {"id": "1791645708587", "createdAt": 1791645708587, "class": "Six", "section": "B, C, A, D", "term": "\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be", "examType": "Bang 100", "subject": "Science", "date": "10/10/2026", "teacher": "MD MAHTAB UDDIN", "slNo": "1"}, {"id": "1791675107779", "createdAt": 1791675107779, "class": "Six", "section": "B, C, A, D", "term": "\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be", "examType": "Bang 100", "subject": "Science", "date": "11/10/2026", "teacher": "MD MAHTAB UDDIN", "slNo": "1", "marksEntryTime": "\u09e7\u09e7/\u09e7\u09e6/\u09e8\u09e6\u09e8\u09ec, \u09ec:\u09e8\u09ea:\u09e8\u09e8 AM", "hasMarks": true, "hasMcqMarks": true, "totalEntered": 9, "totalStudents": 72, "omrEvaluatedAt": "2026-10-11T00:24:22.751Z"}, {"id": "1791678556667", "createdAt": 1791678556667, "class": "Eight", "section": "A, B, C, D", "term": "\u0985\u09b0\u09cd\u09a7-\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be", "examType": "Bang 100", "subject": "Bangla 1st Paper", "date": "11/10/2026", "teacher": "SHAH MD ROKONUZZAMAN CHOWDHURY", "slNo": "1", "marksEntryTime": "\u09e7\u09e7/\u09e7\u09e6/\u09e8\u09e6\u09e8\u09ec, \u09ec:\u09ea\u09e8:\u09eb\u09e6 AM", "hasMarks": true, "hasMcqMarks": true, "totalEntered": 46, "totalStudents": 192, "omrEvaluatedAt": "2026-10-11T00:42:50.908Z"}, {"id": "1792336196877", "createdAt": 1792336196877, "class": "Six", "section": "B", "term": "lkj huh", "examType": "Main Exam", "subject": "Bangla 1st Paper", "date": "18/10/2026", "teacher": "MD MAHTAB UDDIN", "slNo": "1"}];
const examTypes = [{"id": "1787587186721", "name": "\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be", "type": "ENG", "defaultCQ": 100, "defaultMCQ": 0, "defaultPractical": 0, "passMarkPercent": 33, "overrides": [], "examTypes": [{"id": "1787587186721_t1", "typeName": "ENG", "defaultCQ": 100, "defaultMCQ": 0, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}, {"id": "1787587186721_t1787588750822", "typeName": "Bang 100", "defaultCQ": 70, "defaultMCQ": 30, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}, {"id": "1787587186721_t1787926305266", "typeName": "Pratc", "defaultCQ": 50, "defaultMCQ": 25, "defaultPractical": 25, "passMarkPercent": 33, "overrides": []}]}, {"id": "1787587241408", "name": "\u0985\u09b0\u09cd\u09a7-\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be", "type": "Half-Yearly Exam", "defaultCQ": 70, "defaultMCQ": 30, "defaultPractical": 0, "passMarkPercent": 33, "overrides": [], "examTypes": [{"id": "1787587241408_t1", "typeName": "Half-Yearly Exam", "defaultCQ": 70, "defaultMCQ": 30, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}, {"id": "1787587241408_t1787592176441", "typeName": "Bang 100", "defaultCQ": 70, "defaultMCQ": 30, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}]}, {"id": "1788102969702", "name": "Elegileble test", "type": "Bng", "defaultCQ": 30, "defaultMCQ": 20, "defaultPractical": 0, "passMarkPercent": 33, "overrides": [], "examTypes": [{"id": "1788102969702_t1", "typeName": "Bng", "defaultCQ": 30, "defaultMCQ": 20, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}, {"id": "1788102969702_t1788103065045", "typeName": "ENG", "defaultCQ": 50, "defaultMCQ": 0, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}, {"id": "1788102969702_t1788103134852", "typeName": "100", "defaultCQ": 70, "defaultMCQ": 30, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}]}, {"id": "1792258079974", "name": "\u0995\u09cd\u09b2\u09be\u09b8 \u099f\u09c7\u09b7\u09cd\u099f \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be", "type": "CQ+MCQ", "defaultCQ": 70, "defaultMCQ": 30, "defaultPractical": 0, "passMarkPercent": 33, "overrides": [], "examTypes": [{"id": "1792258079974_t1", "typeName": "CQ+MCQ", "defaultCQ": 70, "defaultMCQ": 30, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}, {"id": "1792258079974_t1792258169660", "typeName": "CQ", "defaultCQ": 100, "defaultMCQ": 0, "defaultPractical": 0, "passMarkPercent": 33, "overrides": []}]}, {"id": "1792336641985", "name": "lkj huh", "type": "Main Exam", "defaultCQ": 70, "defaultMCQ": 20, "defaultPractical": 10, "passMarkPercent": 33, "overrides": [], "examTypes": [{"id": "1792336641985_t1", "typeName": "Main Exam", "defaultCQ": 70, "defaultMCQ": 20, "defaultPractical": 10, "passMarkPercent": 33, "overrides": []}]}];
const localStorage = {
    getItem: (k) => {
        if (k === 'school_exam_schedules') return JSON.stringify(schedules);
        if (k === 'school_exam_types') return JSON.stringify(examTypes);
        return null;
    }
};
let currentFilterClass = 'Eight';
let currentFilterExam = 'Elegileble test';

// We need isExamMatch and getSubjectSlot


function getSubjectSlot(subName, subCode) {
            const sName = (subName || '').trim().toLowerCase();
            const code = (subCode || '').toString().trim();

            if (code && typeof activeClassSlotMap !== 'undefined' && activeClassSlotMap && activeClassSlotMap[code]) return activeClassSlotMap[code];
            if (sName && typeof activeClassSlotMap !== 'undefined' && activeClassSlotMap && activeClassSlotMap[sName]) return activeClassSlotMap[sName];

            if (code === '101' || /bangla.*1|বাং.*১|বাংলা সাহিত্য/i.test(sName)) return 'bangla1';
            if (code === '102' || /bangla.*2|বাং.*২|ব্যাকরণ/i.test(sName)) return 'bangla2';
            if (code === '103' || /english.*1|eng.*1|ইংরেজি ১ম|for today/i.test(sName)) return 'english1';
            if (code === '104' || /english.*2|eng.*2|ইংরেজি ২য়|grammar/i.test(sName)) return 'english2';
            if (code === '105' || /math|গণিত/i.test(sName)) return 'math';
            if (code === '107' || /bgs|global studies|বিশ্বপরিচয়/i.test(sName)) return 'bgs';
            if (code === '1111' || /physics|পদার্থ/i.test(sName)) return 'phys';
            if (code === '135' || /chemistry|রসায়ন/i.test(sName)) return 'chem';
            if (code === '108' || /science|বিজ্ঞান/i.test(sName)) return 'chem'; // General Science maps to slot 5 (chem)
            if (code === '180' || /biology|জীববিজ্ঞান/i.test(sName)) return 'bio';
            if (['110', '111', '112', '113'].includes(code) || /religion|islam|hindu|ধর্ম/i.test(sName)) return 'rel';
            if (code === '106' || /ict|information.*tech|যোগাযোগ/i.test(sName)) return 'ict';
            if (['109', '126', '505'].includes(code) || /agri|কৃষি|higher.*math|উচ্চতর/i.test(sName)) return 'agri';

            return null;
        }

        

function getSubjectMarksDistribution(slotKey, className, examName) {
            let schedules = [];
            let examTypes = [];
            try { schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]'); } catch (e) { }
            try { examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]'); } catch (e) { }

            const targetClass = (className || currentFilterClass || 'Ten').toString().trim();
            const targetExam = (examName || currentFilterExam || 'all').toString().trim();
            const isSeniorClass = ['ten', 'nine', '10', '9', '১০ম', '৯ম'].some(k => targetClass.toLowerCase().includes(k));

            // Standard baseline distributions
            const baselines = {
                bangla1: { cq: 70, mcq: 30, practical: 0 },
                bangla2: { cq: 70, mcq: 30, practical: 0 },
                english1: { cq: 100, mcq: 0, practical: 0 },
                english2: { cq: 100, mcq: 0, practical: 0 },
                math: { cq: 70, mcq: 30, practical: 0 },
                bgs: { cq: 70, mcq: 30, practical: 0 },
                chem: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 70, mcq: 30, practical: 0 },
                phys: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 0, mcq: 0, practical: 0 },
                bio: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 0, mcq: 0, practical: 0 },
                rel: { cq: 70, mcq: 30, practical: 0 },
                ict: { cq: 35, mcq: 15, practical: 0 },
                agri: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 70, mcq: 30, practical: 0 }
            };

            const defaultDist = baselines[slotKey] || { cq: 70, mcq: 30, practical: 0 };

            // Find matching schedule for this slot in (targetExam, targetClass)
            let matchedSchedule = null;
            if (Array.isArray(schedules) && schedules.length > 0) {
                matchedSchedule = schedules.find(s => {
                    if (!s) return false;
                    if (targetExam !== 'all' && !isExamMatch(s.term || s.examName, targetExam)) return false;
                    if (targetClass !== 'all') {
                        const sClass = (s.class || s.className || '').toString().toLowerCase().trim();
                        const tClass = targetClass.toLowerCase();
                        const sNorm = ['10', 'ten', '১০ম'].some(k => sClass.includes(k)) ? '10' :
                                      ['9', 'nine', '৯ম'].some(k => sClass.includes(k)) ? '9' :
                                      ['8', 'eight', '৮ম'].some(k => sClass.includes(k)) ? '8' :
                                      ['7', 'seven', '৭ম'].some(k => sClass.includes(k)) ? '7' :
                                      ['6', 'six', '৬ষ্ঠ'].some(k => sClass.includes(k)) ? '6' : sClass;
                        const tNorm = ['10', 'ten', '১০ম'].some(k => tClass.includes(k)) ? '10' :
                                      ['9', 'nine', '৯ম'].some(k => tClass.includes(k)) ? '9' :
                                      ['8', 'eight', '৮ম'].some(k => tClass.includes(k)) ? '8' :
                                      ['7', 'seven', '৭ম'].some(k => tClass.includes(k)) ? '7' :
                                      ['6', 'six', '৬ষ্ঠ'].some(k => tClass.includes(k)) ? '6' : tClass;
                        if (sNorm !== tNorm) return false;
                    }
                    return getSubjectSlot(s.subject || s.subjectName, s.code || s.subjectCode) === slotKey;
                });
            }

            if (matchedSchedule) {
                // Find corresponding exam type config in school_exam_types
                const sTerm = matchedSchedule.term || matchedSchedule.examName || targetExam;
                const examDef = Array.isArray(examTypes) ? examTypes.find(et => isExamMatch(et.name, sTerm)) : null;

                if (examDef) {
                    const subTypes = Array.isArray(examDef.examTypes) ? examDef.examTypes : [];
                    const matchedSubType = subTypes.find(st => st.typeName && matchedSchedule.examType && st.typeName.trim().toLowerCase() === matchedSchedule.examType.trim().toLowerCase())
                                        || subTypes.find(st => st.typeName && examDef.type && st.typeName.trim().toLowerCase() === examDef.type.trim().toLowerCase())
                                        || subTypes[0]
                                        || examDef;

                    const overrides = matchedSubType.overrides || examDef.overrides || [];
                    const subNameClean = (matchedSchedule.subject || matchedSchedule.subjectName || '').trim().toLowerCase();
                    const subCodeClean = (matchedSchedule.code || matchedSchedule.subjectCode || '').toString().trim();

                    let override = null;
                    if (subCodeClean) {
                        override = overrides.find(o => String(o.subjectCode).trim() === subCodeClean);
                    }
                    if (!override && subNameClean) {
                        override = overrides.find(o => o.subjectName && (o.subjectName.trim().toLowerCase() === subNameClean || subNameClean.includes(o.subjectName.trim().toLowerCase())));
                    }

                    if (override) {
                        const cq = override.cq !== undefined ? Number(override.cq) : defaultDist.cq;
                        const mcq = override.mcq !== undefined ? Number(override.mcq) : defaultDist.mcq;
                        const practical = override.practical !== undefined ? Number(override.practical) : defaultDist.practical;
                        return { cq, mcq, practical, total: cq + mcq + practical, hasSchedule: true, scheduleSubject: matchedSchedule.subject, examType: matchedSchedule.examType };
                    }

                    const cq = matchedSubType.defaultCQ !== undefined ? Number(matchedSubType.defaultCQ) : defaultDist.cq;
                    const mcq = matchedSubType.defaultMCQ !== undefined ? Number(matchedSubType.defaultMCQ) : defaultDist.mcq;
                    const practical = matchedSubType.defaultPractical !== undefined ? Number(matchedSubType.defaultPractical) : defaultDist.practical;
                    return { cq, mcq, practical, total: cq + mcq + practical, hasSchedule: true, scheduleSubject: matchedSchedule.subject, examType: matchedSchedule.examType };
                }
            }

            return { ...defaultDist, total: defaultDist.cq + defaultDist.mcq + defaultDist.practical, hasSchedule: false };
        }

        // Dynamically updates component headers (MCQ / CQ / Prac / Total) and Row 5 Full Marks from Exam List
        

console.log("Calling getSubjectMarksDistribution('bangla1', 'Eight', 'Elegileble test'):");
const res = getSubjectMarksDistribution('bangla1', 'Eight', 'Elegileble test');
console.log("RESULT:", res);

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
        
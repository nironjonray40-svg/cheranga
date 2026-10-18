import sys, re
sys.stdout.reconfigure(encoding='utf-8')

# The updated functions for Marksheet.html

M_FUNCS_OLD = """        // 1. Get all available Exams from Exam Portal / Settings
        function getAllExams() {
            const examSet = new Set();
            try {
                const rawTypes = localStorage.getItem('school_exam_types');
                if (rawTypes) {
                    const parsed = JSON.parse(rawTypes);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(t => {
                            if (t && t.name) examSet.add(t.name.trim());
                            else if (typeof t === 'string' && t.trim()) examSet.add(t.trim());
                        });
                    }
                }
            } catch(e) {}

            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => { if (r && r.examName) examSet.add(r.examName.trim()); });
                    }
                }
            } catch(e) {}

            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && s.term) examSet.add(s.term.trim());
                            if (s && s.examName) examSet.add(s.examName.trim());
                        });
                    }
                }
            } catch(e) {}

            const defaultExams = [
                "বার্ষিক পরীক্ষা ২০২৫",
                "অর্ধ-বার্ষিক পরীক্ষা ২০২৫",
                "প্রাক-নির্বাচনী পরীক্ষা ২০২৫",
                "নির্বাচনী পরীক্ষা ২০২৫",
                "১ম সাময়িক পরীক্ষা ২০২৫",
                "২য় সাময়িক পরীক্ষা ২০২৫",
                "মডেল টেস্ট ২০২৫"
            ];
            if (examSet.size === 0) defaultExams.forEach(e => examSet.add(e));
            return Array.from(examSet);
        }

        // 2. Get Classes based on Selected Exam (Cascading: Exam -> Classes)
        function getClassesForExam(examName) {
            const classSet = new Set();

            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r && (r.examName === examName || !examName) && (r.className || r.class)) {
                                classSet.add(formatClassNameDisplay(r.className || r.class));
                            }
                        });
                    }
                }
            } catch(e) {}

            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && (s.term === examName || s.examName === examName || !examName) && (s.className || s.class)) {
                                classSet.add(formatClassNameDisplay(s.className || s.class));
                            }
                        });
                    }
                }
            } catch(e) {}

            if (classSet.size === 0) {
                try {
                    const rawClasses = localStorage.getItem('school_classes');
                    if (rawClasses) {
                        const parsed = JSON.parse(rawClasses);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(c => { if (typeof c === 'string' && c.trim()) classSet.add(formatClassNameDisplay(c)); });
                        }
                    }
                } catch(e) {}

                try {
                    const rawStudents = localStorage.getItem('school_students');
                    if (rawStudents) {
                        const parsed = JSON.parse(rawStudents);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(s => { if (s && s.class) classSet.add(formatClassNameDisplay(s.class)); });
                        }
                    }
                } catch(e) {}
            }

            const defaultClasses = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            if (classSet.size === 0) defaultClasses.forEach(c => classSet.add(c));
            return sortClassesSequential(classSet);
        }"""

M_FUNCS_NEW = """        // Helper to match exam names flexibly across routines, schedules, and types
        function isExamMatch(target, selected) {
            if (!target || !selected) return false;
            const t = String(target).trim().toLowerCase();
            const s = String(selected).trim().toLowerCase();
            if (t === s) return true;
            const stripYr = str => str.replace(/২০২[০-৯]|202[0-9]/g, '').trim();
            const tNoYr = stripYr(t);
            const sNoYr = stripYr(s);
            if (tNoYr && sNoYr) {
                if (tNoYr === sNoYr) return true;
                if (tNoYr.includes(sNoYr) || sNoYr.includes(tNoYr)) return true;
            }
            return false;
        }

        // 1. Get all available Exams from "Exam List" (school_exam_schedules) and Exam Portal
        function getAllExams() {
            const examList = [];
            const seen = new Set();

            function addExam(name) {
                if (!name || typeof name !== 'string') return;
                const clean = name.trim();
                if (!clean) return;
                const key = clean.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    examList.push(clean);
                }
            }

            // Priority 1: From "Exam List" (school_exam_schedules)
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s) {
                                addExam(s.term || s.examName);
                            }
                        });
                    }
                }
            } catch(e) {}

            // Priority 2: From "Exam Names" (school_exam_types)
            try {
                const rawTypes = localStorage.getItem('school_exam_types');
                if (rawTypes) {
                    const parsed = JSON.parse(rawTypes);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(t => {
                            if (t && t.name) addExam(t.name);
                            else if (typeof t === 'string') addExam(t);
                        });
                    }
                }
            } catch(e) {}

            // Priority 3: From Routines (school_exam_routines)
            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r) addExam(r.examName || r.term);
                        });
                    }
                }
            } catch(e) {}

            // Priority 4: From OMR Exams (school_omr_exams)
            try {
                const rawOmr = localStorage.getItem('school_omr_exams');
                if (rawOmr) {
                    const parsed = JSON.parse(rawOmr);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(o => {
                            if (o) addExam(o.examName || o.term);
                        });
                    }
                }
            } catch(e) {}

            if (examList.length === 0) {
                const defaultExams = [
                    "বার্ষিক পরীক্ষা",
                    "অর্ধ-বার্ষিক পরীক্ষা",
                    "প্রাক-নির্বাচনী পরীক্ষা",
                    "নির্বাচনী পরীক্ষা",
                    "১ম সাময়িক পরীক্ষা",
                    "২য় সাময়িক পরীক্ষা",
                    "মডেল টেস্ট"
                ];
                defaultExams.forEach(addExam);
            }
            return examList;
        }

        // 2. Get Classes based strictly on Selected Exam Name ("Exam List" & Routines)
        function getClassesForExam(examName) {
            const classSet = new Set();

            // 1. Check "Exam List" (school_exam_schedules)
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s) {
                                const sExam = s.term || s.examName;
                                if (!examName || isExamMatch(sExam, examName)) {
                                    const rawCls = s.class || s.className;
                                    if (rawCls) {
                                        String(rawCls).split(',').forEach(part => {
                                            const fmt = formatClassNameDisplay(part.trim());
                                            if (fmt) classSet.add(fmt);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            // 2. Check Routines (school_exam_routines)
            try {
                const rawRoutines = localStorage.getItem('school_exam_routines');
                if (rawRoutines) {
                    const parsed = JSON.parse(rawRoutines);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(r => {
                            if (r) {
                                const rExam = r.examName || r.term;
                                if (!examName || isExamMatch(rExam, examName)) {
                                    const rawCls = r.className || r.class;
                                    if (rawCls) {
                                        String(rawCls).split(',').forEach(part => {
                                            const fmt = formatClassNameDisplay(part.trim());
                                            if (fmt) classSet.add(fmt);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            // 3. Check OMR Exams (school_omr_exams)
            try {
                const rawOmr = localStorage.getItem('school_omr_exams');
                if (rawOmr) {
                    const parsed = JSON.parse(rawOmr);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(o => {
                            if (o) {
                                const oExam = o.examName || o.term;
                                if (!examName || isExamMatch(oExam, examName)) {
                                    const rawCls = o.class || o.className;
                                    if (rawCls) {
                                        String(rawCls).split(',').forEach(part => {
                                            const fmt = formatClassNameDisplay(part.trim());
                                            if (fmt) classSet.add(fmt);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            // Fallback only if this exam has no specific schedules, routines, or omr assigned yet
            if (classSet.size === 0) {
                try {
                    const rawClasses = localStorage.getItem('school_classes');
                    if (rawClasses) {
                        const parsed = JSON.parse(rawClasses);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(c => {
                                const val = typeof c === 'string' ? c : (c && c.name ? c.name : '');
                                if (val && val.trim()) classSet.add(formatClassNameDisplay(val));
                            });
                        }
                    }
                } catch(e) {}

                try {
                    const rawStudents = localStorage.getItem('school_students');
                    if (rawStudents) {
                        const parsed = JSON.parse(rawStudents);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(s => {
                                if (s && (s.class || s.className)) classSet.add(formatClassNameDisplay(s.class || s.className));
                            });
                        }
                    }
                } catch(e) {}
            }

            const defaultClasses = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            if (classSet.size === 0) defaultClasses.forEach(c => classSet.add(c));
            return sortClassesSequential(classSet);
        }"""

print("Test script loaded successfully.")

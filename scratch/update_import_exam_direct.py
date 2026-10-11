# -*- coding: utf-8 -*-
import os, sys

def main():
    target_path = r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html'
    with open(target_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update modal HTML
    modal_old = """    <!-- ============================================== -->
    <!-- IMPORT EXAM MODAL WINDOW (Exam List Selection) -->
    <!-- ============================================== -->
    <div class="modal-overlay" id="modalImportExam">
        <div class="modal-card">
            <!-- Modal Header -->
            <div class="modal-header"
                style="padding: 1.15rem 1.8rem; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div
                        style="width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #a5b4fc;">
                        <i class="fa-solid fa-file-import"></i>
                    </div>
                    <div>
                        <h3
                            style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #ffffff; font-family: 'Outfit', 'Hind Siliguri', sans-serif;">
                            Import Exam (পরীক্ষা নির্বাচন ও ডেটা লোড)
                        </h3>
                        <p style="margin: 2px 0 0 0; font-size: 0.83rem; color: #c7d2fe;">
                            "Exam List" এ যুক্ত থাকা পরীক্ষা নির্বাচন করুন এবং ফলাফল টেবিলে ডেটা লোড করুন
                        </p>
                    </div>
                </div>
                <button type="button" class="icon-btn" onclick="closeImportExamModal()"
                    style="color: #ffffff; background: rgba(255,255,255,0.12); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; font-size: 1.1rem;"
                    title="উইনডো বন্ধ করুন (Esc)">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Filter & Search Toolbar inside Modal -->
            <div
                style="padding: 1rem 1.8rem; background: var(--bg-page); border-bottom: 1px solid var(--border-color); display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: space-between;">
                <div style="position: relative; flex: 1; min-width: 250px;">
                    <i class="fa-solid fa-magnifying-glass"
                        style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.95rem;"></i>
                    <input type="text" id="inputImportExamSearch"
                        placeholder="পরীক্ষার নাম, বিষয় বা শ্রেণি দিয়ে অনুসন্ধান করুন..."
                        style="width: 100%; padding: 0.6rem 1rem 0.6rem 2.4rem; border-radius: 8px; border: 1.5px solid var(--border-color); background: var(--bg-card); font-size: 0.92rem; color: var(--text-main); outline: none;"
                        oninput="renderImportExamList()">
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">উৎস:</span>
                    <select id="selectImportExamSource" onchange="renderImportExamList()"
                        style="padding: 0.55rem 0.9rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); font-size: 0.88rem; color: var(--text-main); cursor: pointer;">
                        <option value="ALL">সকল পরীক্ষা</option>
                        <option value="SCHEDULE">Exam List (শিডিউল)</option>
                        <option value="OMR">সংরক্ষিত OMR ফলাফল</option>
                    </select>
                </div>
            </div>

            <!-- Modal Body: Exam Cards List -->
            <div class="modal-body"
                style="padding: 1.25rem 1.8rem; overflow-y: auto; flex: 1; min-height: 260px; max-height: 52vh; background: var(--bg-card);">
                <div id="importExamListContainer" style="display: flex; flex-direction: column; gap: 10px;">
                    <!-- Rendered dynamically via JS -->
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer"
                style="padding: 0.9rem 1.8rem; background: var(--bg-page); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="font-size: 0.85rem; color: var(--text-muted);">
                    মোট উপলব্ধ পরীক্ষা: <strong id="totalAvailableExamsCount" style="color: var(--primary);">০</strong>
                    টি
                </div>
                <button type="button" class="btn btn-outline btn-sm" onclick="closeImportExamModal()">
                    <i class="fa-solid fa-xmark"></i> বন্ধ করুন
                </button>
            </div>
        </div>
    </div>"""

    modal_new = """    <!-- ============================================== -->
    <!-- IMPORT EXAM MODAL WINDOW (Exam List Selection) -->
    <!-- ============================================== -->
    <div class="modal-overlay" id="modalImportExam" onclick="if(event.target === this) closeImportExamModal()">
        <div class="modal-card">
            <!-- Modal Header -->
            <div class="modal-header"
                style="padding: 1.15rem 1.8rem; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div
                        style="width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: #a5b4fc; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <i class="fa-solid fa-file-import"></i>
                    </div>
                    <div>
                        <h3
                            style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #ffffff; font-family: 'Outfit', 'Hind Siliguri', sans-serif;">
                            Exam List (পরীক্ষার তালিকা থেকে Import)
                        </h3>
                        <p style="margin: 2px 0 0 0; font-size: 0.84rem; color: #c7d2fe;">
                            Exam Portal এ যুক্ত থাকা পরীক্ষা নির্বাচন করুন এবং OMR মূল্যায়নের জন্য ইমপোর্ট করুন
                        </p>
                    </div>
                </div>
                <button type="button" class="icon-btn" onclick="closeImportExamModal()"
                    style="color: #ffffff; background: rgba(255,255,255,0.15); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; font-size: 1.15rem; transition: all 0.2s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.15)'"
                    title="উইনডো বন্ধ করুন (Esc)">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Filter & Search Toolbar inside Modal -->
            <div
                style="padding: 1rem 1.8rem; background: var(--bg-page); border-bottom: 1px solid var(--border-color); display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: space-between;">
                <div style="position: relative; flex: 1; min-width: 250px;">
                    <i class="fa-solid fa-magnifying-glass"
                        style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.95rem;"></i>
                    <input type="text" id="inputImportExamSearch"
                        placeholder="পরীক্ষার নাম, বিষয়, শ্রেণি বা তারিখ দিয়ে খুঁজুন..."
                        style="width: 100%; padding: 0.65rem 1rem 0.65rem 2.4rem; border-radius: 8px; border: 1.5px solid var(--border-color); background: var(--bg-card); font-size: 0.92rem; color: var(--text-main); outline: none;"
                        oninput="renderImportExamList()">
                </div>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <select id="selectImportExamClass" onchange="renderImportExamList()"
                        style="padding: 0.6rem 0.9rem; border-radius: 8px; border: 1.5px solid var(--border-color); background: var(--bg-card); font-size: 0.88rem; color: var(--text-main); cursor: pointer; font-weight: 700;">
                        <option value="ALL">সকল শ্রেণি</option>
                    </select>
                    <select id="selectImportExamSource" onchange="renderImportExamList()"
                        style="padding: 0.6rem 0.9rem; border-radius: 8px; border: 1.5px solid var(--border-color); background: var(--bg-card); font-size: 0.88rem; color: var(--text-main); cursor: pointer; font-weight: 700;">
                        <option value="ALL">সকল পরীক্ষা</option>
                        <option value="SCHEDULE" selected>Exam List (শিডিউল)</option>
                        <option value="OMR">সংরক্ষিত OMR ফলাফল</option>
                    </select>
                </div>
            </div>

            <!-- Modal Body: Exam Cards List -->
            <div class="modal-body"
                style="padding: 1.25rem 1.8rem; overflow-y: auto; flex: 1; min-height: 280px; max-height: 55vh; background: var(--bg-card);">
                <div id="importExamListContainer" style="display: flex; flex-direction: column; gap: 10px;">
                    <!-- Rendered dynamically via JS -->
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer"
                style="padding: 0.9rem 1.8rem; background: var(--bg-page); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="font-size: 0.88rem; color: var(--text-muted); font-weight: 600;">
                    মোট উপলব্ধ পরীক্ষা: <strong id="totalAvailableExamsCount" style="color: #4f46e5; font-size: 1.05rem;">০</strong>
                    টি
                </div>
                <button type="button" class="btn btn-outline btn-sm" onclick="closeImportExamModal()"
                    style="border: 1.5px solid var(--border-color); padding: 7px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    <i class="fa-solid fa-xmark"></i> বন্ধ করুন
                </button>
            </div>
        </div>
    </div>"""

    if modal_old not in content:
        print("Error: modal_old not found!")
        sys.exit(1)

    content = content.replace(modal_old, modal_new, 1)

    # 2. Update JavaScript logic for Import Exam
    js_target_start = "            // --- IMPORT EXAM MODAL LOGIC (Exam List Selection) ---"
    js_target_end = "            // --- Save & Entry: Permanently save evaluated OMR marks to Exam List & Database ---"

    if js_target_start not in content or js_target_end not in content:
        print("Error: JS targets not found!")
        sys.exit(1)

    start_idx = content.find(js_target_start)
    end_idx = content.find(js_target_end)

    new_js_logic = """            // --- IMPORT EXAM MODAL LOGIC (Exam List Selection) ---
            let cachedAvailableExams = [];

            // Helper: Check if an exam schedule from Exam List already has MCQ marks entered
            window.checkIfScheduleHasMcqMarks = function (sch, savedMarks = {}, omrExams = []) {
                if (!sch || !sch.id) return false;
                const schId = String(sch.id).trim();

                // 1. Explicit flags on schedule
                if (sch.hasMcqMarks === true || sch.omrEvaluatedAt) {
                    return true;
                }

                // 2. Check if schedule is already in saved OMR exams list
                if (Array.isArray(omrExams) && omrExams.length > 0) {
                    const inOmr = omrExams.some(oe => String(oe.id) === schId || String(oe.scheduleId) === schId);
                    if (inOmr) return true;
                }

                // 3. Inspect saved student marks in school_student_marks
                if (savedMarks && typeof savedMarks === 'object') {
                    const targetSubCode = (sch.subjectCode || sch.subject || '').trim().toLowerCase();
                    const targetSubName = (sch.subject || '').trim().toLowerCase();

                    for (const [key, studentData] of Object.entries(savedMarks)) {
                        if (key.startsWith('timestamp_')) continue;
                        if (key.endsWith('_' + schId) || key.includes('_' + schId)) {
                            if (studentData && typeof studentData === 'object') {
                                for (const [subKey, subVal] of Object.entries(studentData)) {
                                    if (!subVal || typeof subVal !== 'object') continue;
                                    
                                    const subKeyClean = subKey.trim().toLowerCase();
                                    const isMatch = !targetSubCode || 
                                        subKeyClean === targetSubCode || 
                                        subKeyClean === targetSubName || 
                                        Object.keys(studentData).length === 1;

                                    if (isMatch) {
                                        if (subVal.omrEvaluatedAt) return true;
                                        if (subVal.answers && typeof subVal.answers === 'object' && Object.keys(subVal.answers).length > 0) {
                                            return true;
                                        }
                                        if (subVal.mcq !== undefined && subVal.mcq !== null && subVal.mcq !== '') {
                                            const mcqStr = String(subVal.mcq).trim().toUpperCase();
                                            if (!isNaN(Number(mcqStr)) || mcqStr === 'A' || mcqStr === 'ABS') {
                                                return true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (sch.marksEntryTime) {
                        const hasMarksKeys = Object.keys(savedMarks).some(k => !k.startsWith('timestamp_') && (k.endsWith('_' + schId) || k.includes('_' + schId)));
                        if (hasMarksKeys) {
                            return true;
                        }
                    }
                }

                return false;
            };

            window.openImportExamModal = async function () {
                const modal = document.getElementById('modalImportExam');
                if (!modal) return;

                modal.style.display = 'flex';
                modal.classList.add('active');

                // Populate Class filter dropdown dynamically
                const classSelect = document.getElementById('selectImportExamClass');
                if (classSelect) {
                    let classes = [];
                    try {
                        classes = (typeof loadClasses === 'function') ? loadClasses() : safeJsonParse('school_classes', []);
                    } catch (e) { }
                    if (!classes || classes.length === 0) {
                        classes = ["Play", "Nursery", "KG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                    }
                    let classOptions = '<option value="ALL">সকল শ্রেণি (All Classes)</option>';
                    classes.forEach(cls => {
                        const bnCls = (typeof formatClassBangla === 'function') ? formatClassBangla(cls) : cls;
                        classOptions += `<option value="${cls}">${bnCls} (${cls})</option>`;
                    });
                    classSelect.innerHTML = classOptions;
                }

                const searchInput = document.getElementById('inputImportExamSearch');
                if (searchInput) {
                    searchInput.value = '';
                    setTimeout(() => searchInput.focus(), 80);
                }

                const listContainer = document.getElementById('importExamListContainer');
                if (listContainer) {
                    listContainer.innerHTML = `
                      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #4f46e5; margin-bottom: 10px;"></i>
                        <p style="margin: 0; font-size: 0.95rem; font-weight: 600;">Exam List এবং পরীক্ষার তালিকা লোড হচ্ছে...</p>
                      </div>
                    `;
                }

                try {
                    const exams = [];

                    // 1. Fetch saved OMR evaluations
                    let omrExams = [];
                    try {
                        const res = await fetch('/api/exams');
                        if (res.ok) {
                            const data = await res.json();
                            if (Array.isArray(data)) omrExams = data;
                        }
                    } catch (e) { }

                    if (omrExams.length === 0) {
                        try {
                            omrExams = safeJsonParse('school_omr_exams', []);
                        } catch (e) { }
                    }

                    // 2. Fetch all schedules from Exam List (school_exam_schedules)
                    let schedules = [];
                    try {
                        if (typeof loadSchedules === 'function') {
                            schedules = loadSchedules() || [];
                        } else {
                            schedules = safeJsonParse('school_exam_schedules', []);
                        }
                    } catch (e) {
                        console.warn('Error reading schedules:', e);
                    }

                    // Fetch students to accurately count students per class & section
                    let allStudents = [];
                    try {
                        if (typeof loadStudents === 'function') {
                            allStudents = loadStudents() || [];
                        } else {
                            allStudents = safeJsonParse('school_students', []);
                        }
                    } catch (e) { }

                    // Fetch saved student marks to determine mark status
                    let savedMarks = {};
                    try {
                        if (typeof loadStudentMarks === 'function') {
                            savedMarks = loadStudentMarks() || {};
                        } else {
                            savedMarks = safeJsonParse('school_student_marks', {});
                        }
                    } catch (e) { }

                    // Process all schedules from Exam List - Include EVERY schedule from Exam Portal!
                    schedules.forEach(sch => {
                        const hasMcqMarks = checkIfScheduleHasMcqMarks(sch, savedMarks, omrExams);

                        const targetClassNum = mapClassToNumber(sch.class);
                        const targetSections = sch.section && sch.section !== 'All'
                            ? sch.section.split(',').map(s => s.trim().toUpperCase()) : [];

                        const classStudents = allStudents.filter(s => {
                            const sClassNum = mapClassToNumber(s.class);
                            const isClassMatch = (targetClassNum && sClassNum && sClassNum === targetClassNum) ||
                                (sch.class && String(s.class).toLowerCase() === String(sch.class).toLowerCase());
                            if (!isClassMatch) return false;

                            if (targetSections.length > 0 && s.section) {
                                return targetSections.includes(s.section.trim().toUpperCase());
                            }
                            return true;
                        });

                        const studentCount = classStudents.length > 0 ? classStudents.length : (sch.totalStudents || 0);

                        exams.push({
                            id: sch.id,
                            source: 'schedule',
                            sourceLabel: 'Exam List শিডিউল',
                            examName: sch.term || 'পরীক্ষা',
                            examType: sch.examType || '',
                            subject: sch.subject || '',
                            class: sch.class || '',
                            section: sch.section || 'All',
                            date: sch.date || '',
                            teacher: sch.teacher || '',
                            slNo: sch.slNo || '',
                            totalStudents: studentCount,
                            hasMarks: hasMcqMarks,
                            createdAt: sch.createdAt || sch.id,
                            scheduleData: sch
                        });
                    });

                    // 3. Include historical OMR evaluations (if any not linked to a schedule)
                    omrExams.forEach(oe => {
                        if (exams.some(x => String(x.id) === String(oe.id) || String(x.id) === String(oe.scheduleId))) return;
                        const firstStudent = (oe.students && oe.students[0]) ? oe.students[0] : null;
                        const classLabel = firstStudent ? formatClassBangla(firstStudent.class) : (oe.class || 'সকল শ্রেণি');
                        exams.push({
                            id: oe.id,
                            source: 'omr',
                            sourceLabel: 'OMR সংরক্ষিত',
                            examName: oe.examName || ('OMR পরীক্ষা ' + (oe.id || '')),
                            examType: '',
                            subject: oe.subject || 'MCQ ওএমআর',
                            class: classLabel,
                            section: oe.section || 'সকল শাখা',
                            date: oe.date || '',
                            teacher: oe.teacher || '',
                            slNo: '',
                            totalStudents: oe.totalStudents || (oe.students ? oe.students.length : 0),
                            hasMarks: true,
                            createdAt: oe.date || oe.id,
                            omrData: oe
                        });
                    });

                    // Sort: newest first
                    exams.sort((a, b) => {
                        const numA = parseFloat(a.createdAt) || 0;
                        const numB = parseFloat(b.createdAt) || 0;
                        return numB - numA;
                    });

                    cachedAvailableExams = exams;
                    renderImportExamList();

                } catch (err) {
                    console.error('Error loading available exams:', err);
                    if (listContainer) {
                        listContainer.innerHTML = `
                            <div style="text-align: center; padding: 2rem; color: var(--danger);">
                              <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 8px;"></i>
                              <p>পরীক্ষার তালিকা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।</p>
                            </div>
                        `;
                    }
                }
            };

            window.closeImportExamModal = function () {
                const modal = document.getElementById('modalImportExam');
                if (modal) {
                    modal.style.display = 'none';
                    modal.classList.remove('active');
                }
            };

            window.renderImportExamList = function () {
                const listContainer = document.getElementById('importExamListContainer');
                const searchInput = document.getElementById('inputImportExamSearch');
                const classSelect = document.getElementById('selectImportExamClass');
                const sourceSelect = document.getElementById('selectImportExamSource');
                const countEl = document.getElementById('totalAvailableExamsCount');
                if (!listContainer) return;

                const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
                const filterClass = (classSelect ? classSelect.value : 'ALL');
                const filterSource = (sourceSelect ? sourceSelect.value : 'ALL');

                const filtered = cachedAvailableExams.filter(exam => {
                    if (filterSource === 'SCHEDULE' && exam.source !== 'schedule') return false;
                    if (filterSource === 'OMR' && exam.source !== 'omr') return false;

                    if (filterClass !== 'ALL') {
                        const targetClsNum = mapClassToNumber(filterClass);
                        const examClsNum = mapClassToNumber(exam.class);
                        const isClassMatch = (targetClsNum && examClsNum && targetClsNum === examClsNum) ||
                            (exam.class && String(exam.class).toLowerCase() === String(filterClass).toLowerCase());
                        if (!isClassMatch) return false;
                    }

                    if (!query) return true;
                    const examName = (exam.examName || '').toLowerCase();
                    const examType = (exam.examType || '').toLowerCase();
                    const subject = (exam.subject || '').toLowerCase();
                    const cls = (exam.class || '').toLowerCase();
                    const date = (exam.date || '').toLowerCase();
                    const teacher = (exam.teacher || '').toLowerCase();
                    const section = (exam.section || '').toLowerCase();
                    return examName.includes(query) || examType.includes(query) || subject.includes(query) || cls.includes(query) || date.includes(query) || teacher.includes(query) || section.includes(query);
                });

                if (countEl) {
                    countEl.textContent = toBengaliNumber(filtered.length);
                }

                if (filtered.length === 0) {
                    listContainer.innerHTML = `
                      <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
                        <div style="width: 56px; height: 56px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; font-size: 1.5rem; color: #94a3b8;">
                          <i class="fa-solid fa-folder-open"></i>
                        </div>
                        <h4 style="margin: 0 0 6px 0; color: var(--text-main); font-size: 1.05rem; font-weight: 700;">কোনো পরীক্ষার শিডিউল পাওয়া যায়নি</h4>
                        <p style="margin: 0; font-size: 0.85rem;">অন্য কোনো নাম দিয়ে অনুসন্ধান করুন অথবা Exam List এ নতুন পরীক্ষার শিডিউল যুক্ত করুন।</p>
                      </div>
                    `;
                    return;
                }

                listContainer.innerHTML = filtered.map((exam) => {
                    const isSchedule = exam.source === 'schedule';
                    const sourceBg = isSchedule ? '#eef2ff' : '#ecfdf5';
                    const sourceColor = isSchedule ? '#4f46e5' : '#059669';
                    const sourceIcon = isSchedule ? 'fa-calendar-check' : 'fa-circle-check';
                    const badgeBg = isSchedule ? '#e0e7ff' : '#d1fae5';
                    const badgeColor = isSchedule ? '#3730a3' : '#065f46';

                    const marksStatusHtml = exam.hasMarks
                        ? `<span style="font-size: 0.75rem; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 9px; border-radius: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-check"></i> নম্বর এন্ট্রি সম্পন্ন</span>`
                        : `<span style="font-size: 0.75rem; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 3px 9px; border-radius: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-clock"></i> মূল্যায়ন পেন্ডিং</span>`;

                    const displayClass = exam.class ? (exam.class.includes('শ্রেণি') ? exam.class : (formatClassBangla(exam.class) + ` (${exam.class})`)) : 'শ্রেণি: -';
                    const classColor = typeof getClassColor === 'function' ? getClassColor(exam.class) : '#4f46e5';

                    const examTypeBadge = exam.examType ? `<span style="font-size: 0.74rem; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 6px; font-weight: 600;">${exam.examType}</span>` : '';
                    const sectionBadge = exam.section ? `<span style="font-size: 0.74rem; background: #f8fafc; color: #334155; border: 1px solid #e2e8f0; padding: 2px 7px; border-radius: 6px; font-weight: 600;">শাখা: ${exam.section}</span>` : '';
                    const teacherHtml = exam.teacher ? `<span><i class="fa-solid fa-chalkboard-user" style="color: #8b5cf6;"></i> ${exam.teacher}</span>` : '';

                    return `
                      <div class="import-exam-item-card" 
                           style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 12px; background: #ffffff; border: 1.5px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.03); cursor: pointer; gap: 14px; transition: all 0.2s ease;"
                           onmouseover="this.style.borderColor='#4f46e5'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(79, 70, 229, 0.12)';"
                           onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px rgba(0,0,0,0.03)';"
                           onclick="selectAndImportExam('${exam.id}', '${exam.source}')">
                        
                        <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;">
                          <div style="width: 46px; height: 46px; border-radius: 12px; background: ${sourceBg}; color: ${sourceColor}; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                            <i class="fa-solid ${sourceIcon}"></i>
                          </div>
                          <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                              <strong style="font-size: 1.08rem; color: #0f172a; font-family: 'Outfit', 'Hind Siliguri', sans-serif;">
                                ${exam.examName} ${exam.subject ? `— <span style="color: #4f46e5;">${exam.subject}</span>` : ''}
                              </strong>
                              <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor};">
                                ${exam.sourceLabel}
                              </span>
                              ${examTypeBadge}
                              ${marksStatusHtml}
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 0.84rem; color: #64748b;">
                              <span style="font-weight: 700; color: ${classColor};"><i class="fa-solid fa-graduation-cap"></i> ${displayClass}</span>
                              ${sectionBadge}
                              <span><i class="fa-regular fa-calendar" style="color: #f59e0b;"></i> ${exam.date || 'তারিখ নির্ধারিত নেই'}</span>
                              ${teacherHtml}
                              <span style="font-weight: 600; color: #059669;"><i class="fa-solid fa-users"></i> ${toBengaliNumber(exam.totalStudents)} জন পরীক্ষার্থী</span>
                            </div>
                          </div>
                        </div>

                        <div style="flex-shrink: 0;">
                          <button type="button" class="btn btn-sm" 
                                  style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; font-weight: 700; border-radius: 8px; padding: 8px 18px; border: none; display: inline-flex; align-items: center; gap: 7px; box-shadow: 0 3px 10px rgba(79, 70, 229, 0.3); font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease;"
                                  onclick="event.stopPropagation(); selectAndImportExam('${exam.id}', '${exam.source}')">
                            <i class="fa-solid fa-file-import"></i> Import Exam
                          </button>
                        </div>
                      </div>
                    `;
                }).join('');
            };

            window.selectAndImportExam = function (examId, source) {
                const selected = cachedAvailableExams.find(x => String(x.id) === String(examId) && x.source === source);
                if (!selected) return;

                if (source === 'omr') {
                    const oe = selected.omrData;
                    if (oe && oe.students && oe.students.length > 0) {
                        const importedOmrStudents = sortStudentsByRegNo(JSON.parse(JSON.stringify(oe.students)));
                        importedOmrStudents.forEach(st => {
                            st.id = toEnglishDigits(st.id || st.regNo || '').trim();
                            st.regNo = st.id;
                            if (st.studentId) st.studentId = toEnglishDigits(st.studentId).trim();
                        });
                        state.students = importedOmrStudents;
                        state.pendingUnmatchedList = [];
                        state.importedExamInfo = {
                            id: examId,
                            source: 'omr',
                            examName: selected.examName,
                            subject: selected.subject || 'MCQ ওএমআর',
                            class: selected.class || '',
                            section: selected.section || 'সকল শাখা',
                            omrData: oe
                        };
                        try {
                            localStorage.setItem('school_active_omr_imported_exam', JSON.stringify(state.importedExamInfo));
                        } catch (e) { }

                        if (typeof switchResultsTab === 'function') switchResultsTab('main');
                        if (typeof renderPendingList === 'function') renderPendingList();
                        const lookupMaps = getStudentsLookupMaps();
                        state.students.forEach(st => {
                            if (!st.nameEn) {
                                const rId = toEnglishDigits(st.id || '').trim();
                                const rRoll = toEnglishDigits(st.roll || '').trim();
                                const rCls = mapClassToNumber(st.class);
                                const foundName = lookupMaps.byReg.get(rId) || lookupMaps.byRollClass.get(`${rCls}_${rRoll}`) || lookupMaps.byRollClass.get(`_${rRoll}`);
                                if (foundName) {
                                    st.name = foundName;
                                    st.nameEn = foundName;
                                }
                            }
                        });
                        if (oe.answerKeys) {
                            state.answerKeys = JSON.parse(JSON.stringify(oe.answerKeys));
                            renderAnswerKeyBubbles();
                        }
                        renderResultsTable();
                        updateStatistics();
                        btnExportExcel.disabled = false;
                        btnPrintTable.disabled = false;
                        closeImportExamModal();
                        showToast(`সংরক্ষিত পরীক্ষা "${selected.examName}" (${toBengaliNumber(oe.students.length)} জন) এর ফলাফলসহ লোড হয়েছে!`, 'success', 'fa-check');

                        const targetSection = document.getElementById('tableResults') || document.getElementById('statsGrid');
                        if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return;
                    }
                }

                // Schedule source from Exam List
                const sch = selected.scheduleData;
                state.importedExamInfo = {
                    id: examId,
                    source: 'schedule',
                    examName: selected.examName,
                    subject: sch.subject || '',
                    class: sch.class || '',
                    section: sch.section || 'All',
                    scheduleData: sch
                };
                try {
                    localStorage.setItem('school_active_omr_imported_exam', JSON.stringify(state.importedExamInfo));
                } catch (e) { }

                let allStudents = [];
                try {
                    if (typeof loadStudents === 'function') {
                        allStudents = loadStudents() || [];
                    } else {
                        allStudents = safeJsonParse('school_students', []);
                    }
                } catch (e) { }

                let savedMarks = {};
                try {
                    if (typeof loadStudentMarks === 'function') {
                        savedMarks = loadStudentMarks() || {};
                    } else {
                        savedMarks = safeJsonParse('school_student_marks', {});
                    }
                } catch (e) { }

                const targetClassNum = mapClassToNumber(sch.class);
                const targetSections = sch.section && sch.section !== 'All'
                    ? sch.section.split(',').map(s => s.trim().toUpperCase()) : [];

                let classStudents = allStudents.filter(s => {
                    const sClassNum = mapClassToNumber(s.class);
                    const isClassMatch = (targetClassNum && sClassNum && sClassNum === targetClassNum) ||
                        (sch.class && String(s.class).toLowerCase() === String(sch.class).toLowerCase());
                    if (!isClassMatch) return false;

                    if (targetSections.length > 0 && s.section) {
                        return targetSections.includes(s.section.trim().toUpperCase());
                    }
                    return true;
                });

                if (classStudents.length === 0) {
                    classStudents = allStudents.filter(s => {
                        const sClassNum = mapClassToNumber(s.class);
                        return (targetClassNum && sClassNum && sClassNum === targetClassNum) ||
                            (sch.class && String(s.class).toLowerCase() === String(sch.class).toLowerCase());
                    });
                }

                if (classStudents.length === 0) {
                    classStudents = allStudents.slice(0, 30);
                }

                // Sort students sequentially by Registration Number in ascending serial order
                sortStudentsByRegNo(classStudents);

                const activeKey = (state.answerKeys && (state.answerKeys['ক'] || state.answerKeys['A'])) || {};
                const options = ['ক', 'খ', 'গ', 'ঘ'];
                const targetSubjectCode = sch.subjectCode || sch.subject;

                let totalLoadedWithMarks = 0;

                const importedStudents = classStudents.map((student, idx) => {
                    // Look up student mark across various standard keys
                    const rawReg = toEnglishDigits(student.regNo || student.id || student.studentId || '').trim();
                    const rawId = toEnglishDigits(student.id || '').trim();

                    let studentMarkObj = savedMarks['marks_' + rawReg + '_' + sch.id] ||
                        savedMarks['marks_' + rawId + '_' + sch.id] ||
                        savedMarks['marks_' + student.id + '_' + sch.id] ||
                        savedMarks['marks_' + student.studentId + '_' + sch.id] ||
                        savedMarks['marks_' + rawReg + '_' + (sch.term || sch.examType || '')] ||
                        savedMarks['marks_' + student.id + '_' + (sch.term || sch.examType || '')];

                    let hasRealMark = false;
                    let correctScore = 0;
                    let savedAnswers = null;
                    let savedSet = null;
                    let savedStatus = null;
                    let savedPct = null;
                    let savedFileName = '';

                    if (studentMarkObj && typeof studentMarkObj === 'object') {
                        const subVal = (targetSubjectCode && studentMarkObj[targetSubjectCode]) ? studentMarkObj[targetSubjectCode] : (studentMarkObj[sch.subject] || Object.values(studentMarkObj)[0]);
                        if (subVal && typeof subVal === 'object') {
                            // Strictly check for verified OMR evaluation data
                            const hasRealAnswers = subVal.answers && typeof subVal.answers === 'object' && Object.keys(subVal.answers).length > 0;
                            const isVerifiedOmr = !subVal.isAbsent && hasRealAnswers && !!subVal.omrEvaluatedAt;

                            if (isVerifiedOmr && subVal.mcq !== undefined && subVal.mcq !== null && !isNaN(parseInt(subVal.mcq))) {
                                correctScore = parseInt(subVal.mcq);
                                hasRealMark = true;
                                savedAnswers = subVal.answers;
                                if (subVal.set) savedSet = normalizeSet(subVal.set);
                                if (subVal.percentage) savedPct = subVal.percentage;
                                if (subVal.status) savedStatus = subVal.status;
                                if (subVal.fileName) savedFileName = subVal.fileName;
                            }
                        }
                    }

                    const totalQ = 30;
                    let pct = '0.0';
                    let status = 'পেন্ডিং';
                    let wrongCount = 0;
                    let blankCount = totalQ;
                    const studentAnswers = {};

                    if (hasRealMark && savedAnswers && Object.keys(savedAnswers).length > 0) {
                        correctScore = Math.max(0, Math.min(30, correctScore));
                        for (let q = 1; q <= 30; q++) {
                            studentAnswers[q] = savedAnswers[q] || savedAnswers[String(q)] || null;
                        }
                        const calcScore = calculateStudentScore(studentAnswers, savedSet || 'ক');
                        correctScore = calcScore.correct;
                        wrongCount = calcScore.wrong;
                        blankCount = calcScore.blank;
                        pct = savedPct || ((correctScore / totalQ) * 100).toFixed(1);
                        status = savedStatus || (correctScore >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ');
                        totalLoadedWithMarks++;
                    } else {
                        // No OMR evaluated yet - strictly 0 marks, 0 wrong, 30 blank, status Pending
                        correctScore = 0;
                        wrongCount = 0;
                        blankCount = totalQ;
                        pct = '0.0';
                        status = 'পেন্ডিং';
                    }

                    const setChoice = (hasRealMark && savedSet) ? savedSet : '';
                    const enName = (student.name || student.nameEn || '').trim();

                    const fallbackReg = '2211' + String(student.roll || idx + 1).padStart(3, '0');
                    const studentRegId = toEnglishDigits(student.regNo || student.studentId || student.id || fallbackReg).trim();
                    return {
                        id: studentRegId,
                        regNo: studentRegId,
                        studentId: studentRegId,
                        name: enName,
                        nameEn: enName,
                        roll: String(student.roll || idx + 1),
                        class: targetClassNum || '8',
                        section: (student.section && student.section !== 'All') ? student.section : (sch.section && sch.section !== 'All' ? sch.section.split(',')[0].trim() : 'A'),
                        set: setChoice,
                        correct: correctScore,
                        wrong: wrongCount,
                        blank: blankCount,
                        total: totalQ,
                        percentage: pct,
                        status: status,
                        fileName: hasRealMark ? savedFileName : '',
                        answers: studentAnswers,
                        isRealScanned: hasRealMark
                    };
                });

                // Sort imported students sequentially by Registration Number
                sortStudentsByRegNo(importedStudents);
                state.students = importedStudents;
                state.pendingUnmatchedList = [];
                if (typeof switchResultsTab === 'function') switchResultsTab('main');
                if (typeof renderPendingList === 'function') renderPendingList();
                renderResultsTable();
                updateStatistics();
                btnExportExcel.disabled = false;
                btnPrintTable.disabled = false;
                closeImportExamModal();

                const markInfoText = totalLoadedWithMarks > 0
                    ? ` (${toBengaliNumber(totalLoadedWithMarks)} জনের সংরক্ষিত ফলাফল সহ)`
                    : '';
                showToast(`Exam List থেকে "${selected.examName} (${sch.subject || ''})" (${toBengaliNumber(importedStudents.length)} জন শিক্ষার্থী)${markInfoText} সফলভাবে OMR এ ইমপোর্ট করা হয়েছে!`, 'success', 'fa-check');

                const targetSection = document.getElementById('tableResults') || document.getElementById('statsGrid');
                if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };

"""

    content = content[:start_idx] + new_js_logic + content[end_idx:]

    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("SUCCESS: exam-portal.html updated successfully!")

if __name__ == '__main__':
    main()

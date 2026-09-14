import os
import re

def main():
    file_path = 'exam-portal.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Target the block from `function loadTeachers()` through `function viewExamSchedule(id)`
    start_str = "        function loadTeachers() {"
    end_str = "        function viewExamSchedule(id) {"

    if start_str not in content or end_str not in content:
        print("[ERROR] Start or End anchor not found in file!")
        return False

    start_idx = content.find(start_str)
    end_idx = content.find(end_str)

    new_js_block = '''        function loadTeachers() {
            const stored = localStorage.getItem('school_staff');
            if (!stored) return [];
            try {
                const staff = JSON.parse(stored);
                return staff.filter(s => s.category === "Teacher");
            } catch (e) {
                return [];
            }
        }

        function populateTeachersDropdown() {
            const el = document.getElementById('schedule-teacher');
            const bulkEl = document.getElementById('bulk-common-teacher');
            const teachers = loadTeachers();

            let html = '<option value="" disabled selected>-- Select Teacher --</option>';
            if (teachers.length === 0) {
                html = '<option value="" disabled selected>-- No Teachers in Staff Management --</option>';
            } else {
                html += teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
            }
            if (el) {
                const currentVal = el.value;
                el.innerHTML = html;
                if (currentVal && teachers.some(t => t.name === currentVal)) {
                    el.value = currentVal;
                }
            }
            if (bulkEl) {
                const currentVal = bulkEl.value;
                bulkEl.innerHTML = '<option value="">-- Choose Common Teacher --</option>' + (teachers.length > 0 ? teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('') : '');
                if (currentVal && teachers.some(t => t.name === currentVal)) {
                    bulkEl.value = currentVal;
                }
            }
        }

        function getFormattedCurrentDate() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            return `${dd}/${mm}/${yyyy}`;
        }

        function toggleCreateScheduleForm() {
            const formCard = document.getElementById('create-schedule-card');
            const listCard = document.getElementById('exam-schedules-list-card');
            const btn = document.getElementById('toggle-schedule-form-btn');
            const icon = btn.querySelector('svg');

            if (formCard.style.display === 'none') {
                formCard.style.display = 'block';
                if (listCard) listCard.style.display = 'none';
                btn.querySelector('span').textContent = 'View Exam List';
                icon.style.transform = 'rotate(45deg)';

                populateClassDropdown('schedule-class');
                populateTeachersDropdown();
                populateExamDropdowns();
                populateScheduleExamTypesDropdown();
                updateScheduleClassDependencies();

                // Pre-fill current date in DD/MM/YYYY format
                const todayStr = getFormattedCurrentDate();
                const dateEl = document.getElementById('schedule-date');
                if (dateEl && !dateEl.value) dateEl.value = todayStr;
                const bulkBaseDateEl = document.getElementById('bulk-base-date');
                if (bulkBaseDateEl && !bulkBaseDateEl.value) bulkBaseDateEl.value = todayStr;

                const modeSwitcher = document.getElementById('schedule-mode-switcher');
                if (modeSwitcher) modeSwitcher.style.display = 'inline-flex';
            } else {
                formCard.style.display = 'none';
                if (listCard) listCard.style.display = 'block';
                btn.querySelector('span').textContent = 'Create Exam Schedule';
                icon.style.transform = 'rotate(0deg)';
            }
        }

        function setScheduleCreationMode(mode) {
            const hiddenMode = document.getElementById('schedule-creation-mode');
            if (hiddenMode) hiddenMode.value = mode;

            const btnSingle = document.getElementById('btn-schedule-mode-single');
            const btnBulk = document.getElementById('btn-schedule-mode-bulk');
            const singleContainer = document.getElementById('single-subject-mode-container');
            const bulkContainer = document.getElementById('bulk-subjects-mode-container');

            if (mode === 'single') {
                if (btnSingle) {
                    btnSingle.style.background = '#2563eb';
                    btnSingle.style.color = '#ffffff';
                    btnSingle.style.boxShadow = '0 2px 8px rgba(37,99,235,0.25)';
                }
                if (btnBulk) {
                    btnBulk.style.background = 'transparent';
                    btnBulk.style.color = '#475569';
                    btnBulk.style.boxShadow = 'none';
                }
                if (singleContainer) singleContainer.style.display = 'block';
                if (bulkContainer) bulkContainer.style.display = 'none';
                updateScheduleSubjectsDropdown();
                updateScheduleDistLivePreview();
            } else {
                if (btnBulk) {
                    btnBulk.style.background = '#059669';
                    btnBulk.style.color = '#ffffff';
                    btnBulk.style.boxShadow = '0 2px 8px rgba(5,150,105,0.25)';
                }
                if (btnSingle) {
                    btnSingle.style.background = 'transparent';
                    btnSingle.style.color = '#475569';
                    btnSingle.style.boxShadow = 'none';
                }
                if (singleContainer) singleContainer.style.display = 'none';
                if (bulkContainer) bulkContainer.style.display = 'block';
                renderBulkSubjectsTable();
            }
        }

        function renderBulkSubjectsTable() {
            const tbody = document.getElementById('bulk-subjects-table-tbody');
            if (!tbody) return;

            const classVal = document.getElementById('schedule-class')?.value;
            const examVal = document.getElementById('schedule-exam-name')?.value || '';
            const examTypeVal = document.getElementById('schedule-exam-type')?.value || '';
            const baseDate = document.getElementById('bulk-base-date')?.value || document.getElementById('schedule-date')?.value || getFormattedCurrentDate();
            const commonTeacher = document.getElementById('bulk-common-teacher')?.value || '';

            if (!classVal) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748b;">অনুগ্রহ করে প্রথমে একটি ক্লাস সিলেক্ট করুন।</td></tr>';
                updateBulkSelectedCount();
                return;
            }

            const subMap = loadSubjects();
            const subjects = subMap[classVal] || [];
            const teachers = loadTeachers();
            const config = getExamTypeConfig(examVal, examTypeVal);

            if (subjects.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#dc2626; font-weight:600;">⚠️ এই ক্লাসের জন্য কোনো বিষয় তৈরি করা হয়নি। "All Subject" ট্যাব থেকে বিষয় যুক্ত করুন।</td></tr>';
                updateBulkSelectedCount();
                return;
            }

            let teacherOptionsHtml = '<option value="">-- No Teacher Assigned --</option>';
            if (teachers.length > 0) {
                teacherOptionsHtml += teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
            }

            const schedules = loadSchedules();

            let html = '';
            subjects.forEach((s, idx) => {
                const bn = getSubjectNameBangla(s);
                const displayName = (bn && bn !== s.name) ? `${s.name} - ${bn}` : s.name;
                const subCode = s.code || '';
                const dist = getSubjectDistribution(subCode, config, s.name);
                const distTotal = dist.cq + dist.mcq + dist.practical;

                // Auto calculate exam no for this subject
                const existingCount = schedules.filter(sch =>
                    sch.class === classVal &&
                    sch.term === examVal &&
                    (!examTypeVal || !sch.examType || sch.examType === examTypeVal) &&
                    sch.subject === s.name
                ).length;
                const calculatedExamNo = existingCount + 1;

                html += `
                    <tr style="transition:all 0.15s ease;" class="bulk-subject-row" data-subname="${s.name}" data-subcode="${subCode}">
                        <td style="text-align:center; vertical-align:middle;">
                            <input type="checkbox" name="bulk-sub-check" checked data-subname="${s.name}" data-subcode="${subCode}"
                                onchange="onBulkSubjectRowToggle(this)" style="cursor:pointer; accent-color:#2563eb; width:17px; height:17px;">
                        </td>
                        <td style="text-align:center; font-weight:700; color:#64748b; vertical-align:middle;">${idx + 1}</td>
                        <td style="vertical-align:middle; padding-left:12px;">
                            <div style="font-weight:700; color:#0f172a; font-size:0.96rem;">${displayName}</div>
                            <div style="font-size:0.8rem; color:#64748b;">Code: <strong style="color:#2563eb;">${subCode || 'N/A'}</strong></div>
                        </td>
                        <td style="vertical-align:middle; padding-left:12px;">
                            <input type="text" class="form-control bulk-row-date" value="${baseDate}" placeholder="dd/mm/yyyy"
                                style="background:#ffffff; color:#0f172a; border:1.5px solid #cbd5e1; font-weight:600; font-size:0.9rem; padding:6px 10px; border-radius:6px; width:100%;">
                        </td>
                        <td style="vertical-align:middle; padding-left:12px;">
                            <select class="form-control bulk-row-teacher"
                                style="background:#ffffff; color:#0f172a; border:1.5px solid #cbd5e1; font-weight:600; font-size:0.9rem; padding:6px 10px; border-radius:6px; width:100%;">
                                ${teacherOptionsHtml}
                            </select>
                        </td>
                        <td style="text-align:center; vertical-align:middle;">
                            <input type="text" class="form-control bulk-row-slno" value="${calculatedExamNo}"
                                style="background:#ffffff; color:#0f172a; border:1.5px solid #cbd5e1; font-weight:700; font-size:0.9rem; padding:6px 6px; border-radius:6px; text-align:center; width:60px; margin:0 auto;">
                        </td>
                        <td style="text-align:center; vertical-align:middle;">
                            <span style="background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-weight:700; font-size:0.8rem; padding:3px 8px; border-radius:12px; white-space:nowrap;" title="CQ: ${dist.cq}, MCQ: ${dist.mcq}${dist.practical ? ', Prac: ' + dist.practical : ''}">
                                ${distTotal} Marks
                            </span>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;

            if (commonTeacher) {
                tbody.querySelectorAll('.bulk-row-teacher').forEach(sel => {
                    sel.value = commonTeacher;
                });
            }

            updateBulkSelectedCount();
        }

        function toggleAllBulkSubjects(checked) {
            const selectAllCb = document.getElementById('bulk-select-all-checkbox');
            if (selectAllCb) selectAllCb.checked = checked;
            const checkboxes = document.querySelectorAll('input[name="bulk-sub-check"]');
            checkboxes.forEach(cb => {
                cb.checked = checked;
                const row = cb.closest('tr');
                if (row) {
                    row.style.opacity = checked ? '1' : '0.5';
                    row.style.background = checked ? '#ffffff' : '#f8fafc';
                }
            });
            updateBulkSelectedCount();
        }

        function onBulkSubjectRowToggle(checkbox) {
            const row = checkbox.closest('tr');
            if (row) {
                row.style.opacity = checkbox.checked ? '1' : '0.5';
                row.style.background = checkbox.checked ? '#ffffff' : '#f8fafc';
            }
            updateBulkSelectedCount();
        }

        function updateBulkSelectedCount() {
            const total = document.querySelectorAll('input[name="bulk-sub-check"]').length;
            const checked = document.querySelectorAll('input[name="bulk-sub-check"]:checked').length;

            const badge = document.getElementById('bulk-selected-badge');
            if (badge) {
                badge.innerText = `(${checked} টি বিষয় নির্বাচিত / মোট ${total})`;
                if (checked === 0) {
                    badge.style.background = '#fee2e2';
                    badge.style.color = '#dc2626';
                    badge.style.borderColor = '#fca5a5';
                } else {
                    badge.style.background = '#dbeafe';
                    badge.style.color = '#1e40af';
                    badge.style.borderColor = '#bfdbfe';
                }
            }

            const btnText = document.getElementById('bulk-submit-btn-text');
            if (btnText) {
                btnText.innerText = `Save All Schedules (${checked} টি বিষয়ের শিডিউল সংরক্ষণ করুন)`;
            }

            const selectAllCb = document.getElementById('bulk-select-all-checkbox');
            if (selectAllCb) {
                selectAllCb.checked = (total > 0 && checked === total);
            }
        }

        function applyBulkDateToAllSelected(isSequential = false) {
            let baseDateStr = document.getElementById('bulk-base-date')?.value?.trim() ||
                              document.getElementById('schedule-date')?.value?.trim() ||
                              getFormattedCurrentDate();

            const rows = document.querySelectorAll('#bulk-subjects-table-tbody tr');
            let currentDate = parseDateString(baseDateStr);
            if (isNaN(currentDate.getTime())) {
                currentDate = new Date();
            }

            rows.forEach((row) => {
                const cb = row.querySelector('input[name="bulk-sub-check"]');
                const dateInput = row.querySelector('.bulk-row-date');
                if (cb && cb.checked && dateInput) {
                    const yyyy = currentDate.getFullYear();
                    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(currentDate.getDate()).padStart(2, '0');
                    dateInput.value = `${dd}/${mm}/${yyyy}`;

                    if (isSequential) {
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            });
        }

        function applyBulkTeacherToAllSelected() {
            const commonTeacher = document.getElementById('bulk-common-teacher')?.value;
            if (!commonTeacher) {
                alert("অনুগ্রহ করে প্রথমে ডিফল্ট শিক্ষক সিলেক্ট করুন!");
                return;
            }
            const rows = document.querySelectorAll('#bulk-subjects-table-tbody tr');
            rows.forEach((row) => {
                const cb = row.querySelector('input[name="bulk-sub-check"]');
                const teacherSelect = row.querySelector('.bulk-row-teacher');
                if (cb && cb.checked && teacherSelect) {
                    teacherSelect.value = commonTeacher;
                }
            });
        }

        function onScheduleExamNameChangedInBulk() {
            const mode = document.getElementById('schedule-creation-mode')?.value;
            if (mode === 'bulk') {
                renderBulkSubjectsTable();
            }
        }

        function onScheduleExamTypeChangedInBulk() {
            const mode = document.getElementById('schedule-creation-mode')?.value;
            if (mode === 'bulk') {
                renderBulkSubjectsTable();
            }
        }

        function saveBulkExamSchedules() {
            const className = document.getElementById('schedule-class')?.value;
            if (!className) {
                alert("অনুগ্রহ করে ক্লাস নির্বাচন করুন!");
                return;
            }

            const checkedBoxes = document.querySelectorAll('input[name="schedule-section-check"]:checked');
            if (checkedBoxes.length === 0) {
                alert("অনুগ্রহ করে কমপক্ষে একটি সেকশন সিলেক্ট করুন! (Please select at least one Section)");
                return;
            }
            const selectedSections = Array.from(checkedBoxes).map(cb => cb.value).join(', ');

            const termName = document.getElementById('schedule-exam-name')?.value;
            if (!termName) {
                alert("অনুগ্রহ করে পরীক্ষার নাম নির্বাচন করুন!");
                return;
            }

            const examType = document.getElementById('schedule-exam-type') ? document.getElementById('schedule-exam-type').value : '';

            const rows = document.querySelectorAll('#bulk-subjects-table-tbody tr');
            const newSchedules = [];
            let missingDateSubject = null;
            const now = Date.now();

            rows.forEach((row, idx) => {
                const cb = row.querySelector('input[name="bulk-sub-check"]');
                if (cb && cb.checked) {
                    const subName = cb.getAttribute('data-subname');
                    const dateInput = row.querySelector('.bulk-row-date');
                    const teacherSelect = row.querySelector('.bulk-row-teacher');
                    const slNoInput = row.querySelector('.bulk-row-slno');

                    const dateVal = dateInput ? dateInput.value.trim() : '';
                    const teacherVal = teacherSelect ? teacherSelect.value.trim() : '';
                    const slNoVal = slNoInput ? slNoInput.value.trim() : (newSchedules.length + 1).toString();

                    if (!dateVal) {
                        missingDateSubject = subName;
                        return;
                    }

                    newSchedules.push({
                        id: (now + idx).toString(),
                        createdAt: now + idx,
                        class: className,
                        section: selectedSections,
                        term: termName,
                        examType: examType,
                        subject: subName,
                        date: dateVal,
                        teacher: teacherVal,
                        slNo: slNoVal
                    });
                }
            });

            if (missingDateSubject) {
                alert(`"${missingDateSubject}" বিষয়ের জন্য পরীক্ষার তারিখ সঠিকভাবে দিন!`);
                return;
            }

            if (newSchedules.length === 0) {
                alert("অনুগ্রহ করে শিডিউল যুক্ত করার জন্য তালিকা থেকে কমপক্ষে একটি বিষয় সিলেক্ট করুন!");
                return;
            }

            let schedules = loadSchedules();
            schedules.push(...newSchedules);
            localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));

            resetScheduleForm();
            populateAllScheduleFilters();
            renderScheduleList();
            renderDashboardRoutineSummary();
            toggleCreateScheduleForm();

            alert(`সফলভাবে ${className}-এর ${newSchedules.length} টি বিষয়ের পরীক্ষার শিডিউল যুক্ত হয়েছে!`);
        }

        function parseDateString(dateStr) {
            if (dateStr && dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    return new Date(year, month, day);
                }
            }
            return new Date(dateStr);
        }

        // --- SUBVIEW 0: DASHBOARD CONTROLLERS ---
        function renderDashboardRoutineSummary() {
            const container = document.getElementById('dashboard-routine-rows');
            const totalCountEl = document.getElementById('dashboard-total-exam-count');
            if (!container) return;
            const schedules = loadSchedules();

            if (totalCountEl) {
                totalCountEl.innerText = `(Total: ${schedules.length})`;
            }

            if (schedules.length === 0) {
                container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted-text); font-style:italic; padding:30px 10px;">No exam schedules created yet.</td></tr>`;
                return;
            }

            // Sort schedules by date
            const sorted = [...schedules].sort((a, b) => parseDateString(a.date) - parseDateString(b.date));

            let html = "";
            const savedMarks = loadStudentMarks();
            sorted.forEach((sch, index) => {
                const marksBadges = getScheduleMarksBadgesHtml(sch.class, sch.term, sch.subject, sch.examType, true);
                const serialNumber = index + 1;
                const clsColor = getClassColor(sch.class);
                const markStatus = getExamMarkStatus(sch);
                const rowClass = markStatus === 'all' ? 'exam-row-marks-all' : markStatus === 'partial' ? 'exam-row-marks-partial' : '';

                let subjectStatusHtml = '';
                if (markStatus === 'all') {
                    const entryTime = sch.marksEntryTime || (savedMarks ? savedMarks['timestamp_' + sch.id] : null) || (sch.date ? `${sch.date} 10:00 AM` : 'Completed');
                    subjectStatusHtml = `
                        <div style="font-size:0.79rem; color:#10b981; margin-top:3px; font-weight:normal; display:flex; align-items:center; gap:4px;" title="Date & Time of Marks Entry">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span>${entryTime}</span>
                        </div>`;
                } else {
                    subjectStatusHtml = `
                        <div style="font-size:0.79rem; color:#f59e0b; margin-top:3px; font-weight:500; display:flex; align-items:center; gap:4px;" title="Marks Entry Pending">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>Pending</span>
                        </div>`;
                }

                html += `
                    <tr ondblclick="openExamMarksEntryModal('${sch.id}')" class="${rowClass}" style="cursor: pointer;" title="Double-click to open Student Marks Entry window">
                        <td style="text-align:center; font-weight:700;">${serialNumber}</td>
                        <td style="font-weight:600; font-size:1.18rem; line-height:1.1; padding-left:14px;">
                            <div style="color:${clsColor};">${sch.class}</div>
                            <div style="font-size:0.83rem; color:var(--neon-pink); margin-top:2px; font-weight:normal;">${sch.section || 'All'}</div>
                        </td>
                        <td style="font-size:1.02rem; line-height:1.1; padding-left:14px;">
                            <div style="font-weight:700;" title="${sch.examType ? 'Exam Type: ' + sch.examType : ''}">${sch.term}</div>
                            ${marksBadges}
                        </td>
                        <td style="line-height:1.1; padding-left:14px;">
                            <div style="font-weight:700;">${sch.date}</div>
                            <div style="font-size:0.83rem; color:var(--muted-text); margin-top:2px; font-weight:normal;">Exam No: ${sch.slNo || '-'}</div>
                        </td>
                        <td style="color:#fff; font-weight:600; line-height:1.2; padding-left:14px;">
                            <div>${sch.subject}</div>
                            ${subjectStatusHtml}
                        </td>
                        <td style="white-space: nowrap; text-align:center;">
                            <div style="display:flex; gap:6px; justify-content:center;">
                                <button class="action-btn-sm" onclick="openExamMarksEntryModal('${sch.id}')" style="padding:6px 10px; background:linear-gradient(135deg, #10b981, #059669); box-shadow:0 2px 8px rgba(16,185,129,0.3); font-weight:600;" title="Entry Marks (or Double-click row)">
                                    Marks
                                </button>
                                <button class="action-btn-sm btn-view-card" onclick="viewExamSchedule('${sch.id}')" style="padding:6px 8px;" title="View Details">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:block;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                </button>
                                <button class="action-btn-sm btn-edit-card" onclick="editExamSchedule('${sch.id}')" style="padding:6px 8px; background:var(--accent-grad);" title="Edit Schedule">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:block;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                </button>
                                <button class="action-btn-sm btn-delete-student" onclick="deleteExamSchedule('${sch.id}')" style="padding:6px 8px; background:#ffffff; color:#333;" title="Delete Schedule">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:block;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            container.innerHTML = html;
        }

        // --- SUBVIEW 1: EXAM ENTRY CONTROLLERS ---
        function loadClassSections() {
            const defaultSections = [
                { class: "Class 6", section: "A", capacity: 50 },
                { class: "Class 6", section: "B", capacity: 50 },
                { class: "Class 7", section: "A", capacity: 50 },
                { class: "Class 7", section: "B", capacity: 50 },
                { class: "Class 8", section: "A", capacity: 45 },
                { class: "Class 8", section: "B", capacity: 45 },
                { class: "Class 9", section: "A", capacity: 45 },
                { class: "Class 9", section: "B", capacity: 45 },
                { class: "Class 9", section: "C", capacity: 45 },
                { class: "Class 10", section: "A", capacity: 40 },
                { class: "Class 10", section: "B", capacity: 40 }
            ];
            const parsed = safeJsonParse('school_class_sections', null);
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter(s => s && typeof s === 'object' && s.class && s.section);
                if (filtered.length > 0) {
                    return filtered;
                }
            }
            return defaultSections;
        }

        function populateScheduleSectionsDropdown() {
            const classVal = document.getElementById('schedule-class').value;
            const container = document.getElementById('schedule-sections-container');
            if (!container) return;

            const sections = loadClassSections();
            const classSections = sections.filter(s => s.class === classVal);

            if (classSections.length === 0) {
                container.innerHTML = '<span style="font-style:italic; color:#64748b; font-size:0.85rem;">No sections configured.</span>';
            } else {
                container.innerHTML = classSections.map(s => `
                    <label class="section-checkbox-badge" style="display:inline-flex; align-items:center; gap:6px; background:#f1f5f9; border:1.5px solid #cbd5e1; padding:4px 12px; border-radius:20px; cursor:pointer; font-weight:700; font-size:0.84rem; color:#334155; transition:all 0.2s ease;">
                        <input type="checkbox" name="schedule-section-check" value="${s.section}" style="accent-color:#2563eb; cursor:pointer;" onchange="toggleSectionBadgeStyle(this)">
                        ${s.section}
                    </label>
                `).join('');
            }
        }

        function toggleSectionBadgeStyle(checkbox) {
            const label = checkbox.parentElement;
            if (checkbox.checked) {
                label.style.background = '#2563eb';
                label.style.borderColor = '#2563eb';
                label.style.color = '#ffffff';
                label.style.boxShadow = '0 2px 8px rgba(37,99,235,0.25)';
            } else {
                label.style.background = '#f1f5f9';
                label.style.borderColor = '#cbd5e1';
                label.style.color = '#334155';
                label.style.boxShadow = 'none';
            }
        }

        function updateScheduleClassDependencies() {
            updateScheduleSubjectsDropdown();
            populateScheduleSectionsDropdown();
            autoCalculateScheduleExamNo();
            renderBulkSubjectsTable();
        }

        function updateScheduleSubjectsDropdown() {
            const classVal = document.getElementById('schedule-class')?.value;
            const el = document.getElementById('schedule-subject');
            if (!el || !classVal) return;

            const prevVal = el.value;

            const subMap = loadSubjects();
            const subjects = subMap[classVal] || [];

            if (subjects.length === 0) {
                el.innerHTML = `<option value="" disabled selected>-- No Subjects Created --</option>`;
            } else {
                el.innerHTML = subjects.map(s => {
                    const bn = getSubjectNameBangla(s);
                    const label = (bn && bn !== s.name) ? `${s.name} - ${bn} (${s.code})` : `${s.name} (${s.code})`;
                    return `<option value="${s.name}">${label}</option>`;
                }).join('');
            }

            if (prevVal && Array.from(el.options).some(o => o.value === prevVal)) {
                el.value = prevVal;
            }
        }

        function saveExamSchedule(event) {
            event.preventDefault();
            const editId = document.getElementById('schedule-edit-id').value;
            const className = document.getElementById('schedule-class').value;

            // Get all checked sections
            const checkedBoxes = document.querySelectorAll('input[name="schedule-section-check"]:checked');
            if (checkedBoxes.length === 0) {
                alert("Please select at least one Section!");
                return;
            }
            const selectedSections = Array.from(checkedBoxes).map(cb => cb.value).join(', ');

            const termName = document.getElementById('schedule-exam-name').value;
            const examType = document.getElementById('schedule-exam-type') ? document.getElementById('schedule-exam-type').value : '';
            const subject = document.getElementById('schedule-subject').value;
            const date = document.getElementById('schedule-date').value;
            const teacher = document.getElementById('schedule-teacher').value.trim();
            const slNo = document.getElementById('schedule-sl-no').value.trim();

            if (!subject) {
                alert("Please select a subject. If none exist, add subjects in the All Subject tab first!");
                return;
            }

            let schedules = loadSchedules();
            if (editId) {
                const idx = schedules.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    const existingCreatedAt = schedules[idx].createdAt || schedules[idx].id;
                    schedules[idx] = {
                        ...schedules[idx],
                        id: editId,
                        class: className,
                        section: selectedSections,
                        term: termName,
                        examType: examType,
                        subject: subject,
                        date: date,
                        teacher: teacher,
                        slNo: slNo,
                        createdAt: existingCreatedAt
                    };
                }
                alert("Exam Schedule Routine updated successfully!");
            } else {
                const now = Date.now();
                const newSchedule = {
                    id: now.toString(),
                    createdAt: now,
                    class: className,
                    section: selectedSections,
                    term: termName,
                    examType: examType,
                    subject: subject,
                    date: date,
                    teacher: teacher,
                    slNo: slNo
                };
                schedules.push(newSchedule);
                alert("Exam Schedule Routine added successfully!");
            }
            localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));

            resetScheduleForm();
            populateAllScheduleFilters();
            renderScheduleList();
            renderDashboardRoutineSummary();
            toggleCreateScheduleForm();
        }

        function deleteExamSchedule(id) {
            if (!confirm("Are you sure you want to delete this schedule?")) return;
            const schedules = loadSchedules();
            const filtered = schedules.filter(s => s.id !== id);
            localStorage.setItem('school_exam_schedules', JSON.stringify(filtered));
            populateAllScheduleFilters();
            renderScheduleList();
            renderDashboardRoutineSummary();
        }

        function resetScheduleForm() {
            document.getElementById('exam-schedule-form').reset();
            document.getElementById('schedule-edit-id').value = "";
            document.querySelector('#create-schedule-card .portal-form-title').innerText = "Create Exam Schedule";
            document.querySelector('#exam-schedule-form button[type="submit"]').innerText = "Save Schedule";

            const modeSwitcher = document.getElementById('schedule-mode-switcher');
            if (modeSwitcher) modeSwitcher.style.display = 'inline-flex';

            // Clear checkbox styles
            document.querySelectorAll('input[name="schedule-section-check"]').forEach(cb => {
                cb.checked = false;
                toggleSectionBadgeStyle(cb);
            });
            setScheduleCreationMode('single');
            updateScheduleClassDependencies();
            populateScheduleExamTypesDropdown();
            updateScheduleDistLivePreview();
        }

        function editExamSchedule(id) {
            const schedules = loadSchedules();
            const sch = schedules.find(s => s.id === id);
            if (!sch) return;

            // Open the form
            const formCard = document.getElementById('create-schedule-card');
            const listCard = document.getElementById('exam-schedules-list-card');
            const btn = document.getElementById('toggle-schedule-form-btn');
            const icon = btn.querySelector('svg');

            formCard.style.display = 'block';
            if (listCard) listCard.style.display = 'none';
            btn.querySelector('span').textContent = 'View Exam List';
            icon.style.transform = 'rotate(45deg)';

            // Set edit ID
            document.getElementById('schedule-edit-id').value = sch.id;

            // Set single mode and hide switcher during edit
            setScheduleCreationMode('single');
            const modeSwitcher = document.getElementById('schedule-mode-switcher');
            if (modeSwitcher) modeSwitcher.style.display = 'none';

            // Pre-fill values
            populateClassDropdown('schedule-class');
            document.getElementById('schedule-class').value = sch.class;

            populateTeachersDropdown();
            document.getElementById('schedule-teacher').value = sch.teacher || '';

            // Update class dependencies first
            updateScheduleClassDependencies();

            // Set dynamic section checkboxes based on comma-separated values
            const sectionsList = sch.section ? sch.section.split(',').map(s => s.trim()) : [];
            document.querySelectorAll('input[name="schedule-section-check"]').forEach(cb => {
                cb.checked = sectionsList.includes(cb.value);
                toggleSectionBadgeStyle(cb); // update visual styling
            });

            document.getElementById('schedule-exam-name').value = sch.term;
            populateScheduleExamTypesDropdown(sch.examType || '');
            if (sch.examType && document.getElementById('schedule-exam-type')) {
                document.getElementById('schedule-exam-type').value = sch.examType;
            }
            document.getElementById('schedule-subject').value = sch.subject;
            document.getElementById('schedule-date').value = sch.date;
            document.getElementById('schedule-sl-no').value = sch.slNo || '';

            // Change titles & buttons to Update mode
            document.querySelector('#create-schedule-card .portal-form-title').innerText = "Update Exam Schedule";
            document.querySelector('#exam-schedule-form button[type="submit"]').innerText = "Update Schedule";
            updateScheduleDistLivePreview();
        }

'''

    content = content[:start_idx] + new_js_block + content[end_idx:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[SUCCESS] Successfully inserted new schedule creation JavaScript logic!")
    return True

if __name__ == '__main__':
    main()

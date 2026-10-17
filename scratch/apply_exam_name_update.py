import os

def update_portal():
    file_path = 'c:/Users/niron/OneDrive/Desktop/Cheranga/exam-portal.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update loadExamTypes()
    target_load_start = "function loadExamTypes() {"
    target_load_end = "function loadStudents() {"
    
    idx_load_start = content.find(target_load_start)
    idx_load_end = content.find(target_load_end)
    
    if idx_load_start == -1 or idx_load_end == -1:
        print("[ERROR] loadExamTypes start or end not found!")
        return False
        
    new_load_exam_types = """function loadExamTypes() {
            let stored = localStorage.getItem('school_exam_types');
            let types = [];
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        types = parsed.map(normalizeExamTypeObject);
                    }
                } catch (e) {
                    // Fallback
                }
            }
            if (!types || types.length === 0) {
                const defaults = [
                    {
                        id: "1",
                        name: "Half-Yearly Examination 2026",
                        type: "Half-Yearly Exam",
                        defaultCQ: 70,
                        defaultMCQ: 30,
                        defaultPractical: 0,
                        passMarkPercent: 33,
                        overrides: [
                            { subjectCode: "106", subjectName: "Information And Communication Technology", cq: 25, mcq: 25, practical: 25 },
                            { subjectCode: "103", subjectName: "English For Today", cq: 100, mcq: 0, practical: 0 },
                            { subjectCode: "104", subjectName: "English Grammar and Composition", cq: 100, mcq: 0, practical: 0 }
                        ],
                        examTypes: [
                            {
                                id: "1_t1",
                                typeName: "Half-Yearly Main Exam",
                                defaultCQ: 70,
                                defaultMCQ: 30,
                                defaultPractical: 0,
                                passMarkPercent: 33,
                                overrides: [
                                    { subjectCode: "106", subjectName: "Information And Communication Technology", cq: 25, mcq: 25, practical: 25 },
                                    { subjectCode: "103", subjectName: "English For Today", cq: 100, mcq: 0, practical: 0 },
                                    { subjectCode: "104", subjectName: "English Grammar and Composition", cq: 100, mcq: 0, practical: 0 }
                                ]
                            },
                            {
                                id: "1_t2",
                                typeName: "Half-Yearly Class Test",
                                defaultCQ: 20,
                                defaultMCQ: 0,
                                defaultPractical: 0,
                                passMarkPercent: 33,
                                overrides: []
                            }
                        ]
                    },
                    {
                        id: "2",
                        name: "Annual Examination 2026",
                        type: "Annual Exam",
                        defaultCQ: 70,
                        defaultMCQ: 30,
                        defaultPractical: 0,
                        passMarkPercent: 33,
                        overrides: [
                            { subjectCode: "106", subjectName: "Information And Communication Technology", cq: 25, mcq: 25, practical: 25 },
                            { subjectCode: "103", subjectName: "English For Today", cq: 100, mcq: 0, practical: 0 },
                            { subjectCode: "104", subjectName: "English Grammar and Composition", cq: 100, mcq: 0, practical: 0 }
                        ],
                        examTypes: [
                            {
                                id: "2_t1",
                                typeName: "Annual Main Exam",
                                defaultCQ: 70,
                                defaultMCQ: 30,
                                defaultPractical: 0,
                                passMarkPercent: 33,
                                overrides: [
                                    { subjectCode: "106", subjectName: "Information And Communication Technology", cq: 25, mcq: 25, practical: 25 },
                                    { subjectCode: "103", subjectName: "English For Today", cq: 100, mcq: 0, practical: 0 },
                                    { subjectCode: "104", subjectName: "English Grammar and Composition", cq: 100, mcq: 0, practical: 0 }
                                ]
                            }
                        ]
                    },
                    {
                        id: "3",
                        name: "First Term Exam 2026",
                        type: "Term Exam",
                        defaultCQ: 40,
                        defaultMCQ: 10,
                        defaultPractical: 0,
                        passMarkPercent: 33,
                        overrides: [],
                        examTypes: [
                            {
                                id: "3_t1",
                                typeName: "Term Exam",
                                defaultCQ: 40,
                                defaultMCQ: 10,
                                defaultPractical: 0,
                                passMarkPercent: 33,
                                overrides: []
                            }
                        ]
                    }
                ];
                types = defaults.map(normalizeExamTypeObject);
                localStorage.setItem('school_exam_types', JSON.stringify(types));
            }

            // Auto-merge any custom exam names from existing schedules if missing from types
            try {
                const schedRaw = localStorage.getItem('school_exam_schedules');
                if (schedRaw) {
                    const schedList = JSON.parse(schedRaw);
                    let changed = false;
                    if (Array.isArray(schedList)) {
                        schedList.forEach(s => {
                            const termName = (s.term || s.examName || '').trim();
                            if (termName && !termName.startsWith('__ACTION_') && !types.some(t => t.name.toLowerCase() === termName.toLowerCase())) {
                                const newId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4);
                                types.push(normalizeExamTypeObject({
                                    id: newId,
                                    name: termName,
                                    type: s.examType || "Main Exam",
                                    defaultCQ: s.cq !== undefined ? s.cq : 70,
                                    defaultMCQ: s.mcq !== undefined ? s.mcq : 30,
                                    defaultPractical: s.practical !== undefined ? s.practical : 0,
                                    passMarkPercent: 33,
                                    overrides: [],
                                    examTypes: [
                                        {
                                            id: `${newId}_t1`,
                                            typeName: s.examType || "Main Exam",
                                            defaultCQ: s.cq !== undefined ? s.cq : 70,
                                            defaultMCQ: s.mcq !== undefined ? s.mcq : 30,
                                            defaultPractical: s.practical !== undefined ? s.practical : 0,
                                            passMarkPercent: 33,
                                            overrides: []
                                        }
                                    ]
                                }));
                                changed = true;
                            }
                        });
                    }
                    if (changed) {
                        localStorage.setItem('school_exam_types', JSON.stringify(types));
                    }
                }
            } catch (err) {}

            return types;
        }

        """

    content = content[:idx_load_start] + new_load_exam_types + content[idx_load_end:]
    print("[OK] Replaced loadExamTypes successfully")

    # 2. Update populateExamDropdowns() & add onScheduleExamNameSelectChange()
    target_pop_start = "function populateExamDropdowns() {"
    target_pop_end = "function populateOverrideSubjectsDropdown() {"

    idx_pop_start = content.find(target_pop_start)
    idx_pop_end = content.find(target_pop_end)

    if idx_pop_start == -1 or idx_pop_end == -1:
        print("[ERROR] populateExamDropdowns start or end not found!")
        return False

    new_pop_block = """let previousValidScheduleExamName = '';

        function populateExamDropdowns() {
            const types = loadExamTypes();
            const selects = ['schedule-exam-name', 'search-result-exam', 'input-mark-exam'];
            selects.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const currentVal = el.value;
                    let html = types.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
                    if (id === 'schedule-exam-name') {
                        html += `
                            <option value="__ACTION_UPDATE__" style="color: #2563eb; font-weight: 700; background: #eff6ff;">✏️ পরীক্ষার নাম পরিবর্তন / আপডেট করুন...</option>
                            <option value="__ACTION_CREATE__" style="color: #16a34a; font-weight: 700; background: #f0fdf4;">➕ নতুন পরীক্ষার নাম তৈরি করুন...</option>
                        `;
                    }
                    el.innerHTML = html;
                    if (currentVal && types.some(t => t.name === currentVal)) {
                        el.value = currentVal;
                    } else if (types.length > 0 && id === 'schedule-exam-name') {
                        el.value = types[0].name;
                    }
                    if (id === 'schedule-exam-name' && el.value && !el.value.startsWith('__ACTION_')) {
                        previousValidScheduleExamName = el.value;
                    }
                }
            });
            populateScheduleExamTypesDropdown();
        }

        function onScheduleExamNameSelectChange() {
            const el = document.getElementById('schedule-exam-name');
            if (!el) return;
            const val = el.value;
            if (val === '__ACTION_UPDATE__') {
                if (previousValidScheduleExamName) {
                    el.value = previousValidScheduleExamName;
                } else {
                    const types = loadExamTypes();
                    if (types.length > 0) el.value = types[0].name;
                }
                openExamNameUpdateModal();
                return;
            }
            if (val === '__ACTION_CREATE__') {
                if (previousValidScheduleExamName) {
                    el.value = previousValidScheduleExamName;
                } else {
                    const types = loadExamTypes();
                    if (types.length > 0) el.value = types[0].name;
                }
                openExamNameCreateModal();
                return;
            }
            previousValidScheduleExamName = val;
            populateScheduleExamTypesDropdown();
        }

        """

    content = content[:idx_pop_start] + new_pop_block + content[idx_pop_end:]
    print("[OK] Replaced populateExamDropdowns successfully")

    # 3. Update saveCustomExamName() and add Exam Name Update & Management controllers
    target_save_start = "function saveCustomExamName(event) {"
    target_save_end = "// --- SUBVIEW 5: SMS CONTROLLERS ---"

    idx_save_start = content.find(target_save_start)
    idx_save_end = content.find(target_save_end)

    if idx_save_start == -1 or idx_save_end == -1:
        print("[ERROR] saveCustomExamName start or end not found!")
        return False

    new_save_and_update_block = """function saveCustomExamName(event) {
            event.preventDefault();
            const nameInput = document.getElementById('custom-exam-name');
            const name = nameInput ? nameInput.value.trim() : '';

            if (!name) {
                alert("অনুগ্রহ করে পরীক্ষার নাম লিখুন (Please enter an Examination Name)!");
                return;
            }

            // Determine category from name or default to General Exam
            let detectedType = "Main Exam";
            const lowerName = name.toLowerCase();
            if (lowerName.includes("half-yearly") || lowerName.includes("half yearly") || lowerName.includes("অর্ধ-বার্ষিক") || lowerName.includes("অর্ধবার্ষিক")) {
                detectedType = "Half-Yearly Main Exam";
            } else if (lowerName.includes("annual") || lowerName.includes("বার্ষিক")) {
                detectedType = "Annual Main Exam";
            } else if (lowerName.includes("pre-test") || lowerName.includes("pre test") || lowerName.includes("প্রাক-নির্বাচনী")) {
                detectedType = "Pre-Test Main Exam";
            } else if (lowerName.includes("test") || lowerName.includes("নির্বাচনী")) {
                detectedType = "Test Main Exam";
            } else if (lowerName.includes("term") || lowerName.includes("সাময়িক") || lowerName.includes("সাময়িক")) {
                detectedType = "Term Exam";
            } else if (lowerName.includes("model") || lowerName.includes("মডেল")) {
                detectedType = "Model Test";
            } else if (lowerName.includes("monthly") || lowerName.includes("মাসিক")) {
                detectedType = "Monthly Test";
            }

            const types = loadExamTypes();
            const duplicate = types.find(t => t.name.toLowerCase() === name.toLowerCase());
            if (duplicate) {
                alert(`"${name}" নামের একটি পরীক্ষা ইতিমধ্যে তালিকায় বিদ্যমান আছে!`);
                return;
            }

            const newId = Date.now().toString();
            const newExam = {
                id: newId,
                name: name,
                type: detectedType,
                defaultCQ: 70,
                defaultMCQ: 30,
                defaultPractical: 0,
                passMarkPercent: 33,
                overrides: [],
                examTypes: [
                    {
                        id: `${newId}_t1`,
                        typeName: detectedType,
                        defaultCQ: 70,
                        defaultMCQ: 30,
                        defaultPractical: 0,
                        passMarkPercent: 33,
                        overrides: []
                    }
                ]
            };

            types.push(newExam);
            localStorage.setItem('school_exam_types', JSON.stringify(types));

            // Expand the newly created exam in master-detail table
            if (typeof expandedExamTypeIds !== 'undefined') {
                expandedExamTypeIds.add(newId);
            }

            closeExamNameCreateModal();
            renderExamTypes();
            populateExamDropdowns();
            const schedSelect = document.getElementById('schedule-exam-name');
            if (schedSelect) {
                schedSelect.value = name;
                previousValidScheduleExamName = name;
            }
            populateExamTypeNamesDropdown(name);
            populateScheduleExamTypesDropdown();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();

            alert(`✅ নতুন পরীক্ষার নাম "${name}" সফলভাবে তৈরি হয়েছে! এখন প্রয়োজন অনুসারে এর অধীনে আরও Exam Type যুক্ত করতে পারেন।`);
        }

        // --- EXAM NAME UPDATE & MANAGEMENT CONTROLLERS ---
        function openExamNameUpdateModal(targetName = '') {
            const scheduleSelect = document.getElementById('schedule-exam-name');
            let currentName = targetName;
            if (!currentName && scheduleSelect) {
                const selVal = scheduleSelect.value;
                if (selVal && !selVal.startsWith('__ACTION_')) {
                    currentName = selVal;
                }
            }
            if (!currentName) {
                const types = loadExamTypes();
                if (types.length > 0) currentName = types[0].name;
            }

            const oldInput = document.getElementById('modal-update-exam-name-old');
            const nameInput = document.getElementById('modal-update-exam-name-input');
            if (oldInput) oldInput.value = currentName || '';
            if (nameInput) nameInput.value = currentName || '';

            renderExamNamesListInUpdateModal();

            const modal = document.getElementById('exam-name-update-modal');
            if (modal) {
                modal.classList.add('active');
                modal.style.display = 'flex';
                setTimeout(() => {
                    if (nameInput) {
                        nameInput.focus();
                        nameInput.select();
                    }
                }, 100);
            }
        }

        function closeExamNameUpdateModal() {
            const modal = document.getElementById('exam-name-update-modal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        }

        function setUpdateExamNamePreset(namePrefix) {
            const input = document.getElementById('modal-update-exam-name-input');
            if (input) {
                const currentVal = input.value.trim();
                const yearMatch = currentVal.match(/\\b(20\\d\\d)\\b/);
                const yearStr = yearMatch ? ` ${yearMatch[1]}` : ` ${new Date().getFullYear()}`;
                input.value = `${namePrefix}${yearStr}`;
                input.focus();
                input.select();
            }
        }

        function selectExamNameToEdit(examName) {
            const oldInput = document.getElementById('modal-update-exam-name-old');
            const nameInput = document.getElementById('modal-update-exam-name-input');
            if (oldInput) oldInput.value = examName;
            if (nameInput) {
                nameInput.value = examName;
                nameInput.focus();
                nameInput.select();
            }
        }

        function deleteExamNameFromList(examName) {
            if (!examName) return;
            if (!confirm(`আপনি কি নিশ্চিত যে "${examName}" পরীক্ষার নামটি মুছে ফেলতে চান?`)) {
                return;
            }
            let types = loadExamTypes();
            const filtered = types.filter(t => t.name.toLowerCase() !== examName.toLowerCase());
            if (filtered.length === 0) {
                alert("তালিকায় অন্তত একটি পরীক্ষার নাম থাকতে হবে, সব মুছে ফেলা যাবে না!");
                return;
            }
            localStorage.setItem('school_exam_types', JSON.stringify(filtered));
            renderExamNamesListInUpdateModal();
            populateExamDropdowns();
            renderExamTypes();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
        }

        function renderExamNamesListInUpdateModal() {
            const tbody = document.getElementById('modal-exam-names-list-tbody');
            if (!tbody) return;
            const types = loadExamTypes();
            const currentOld = document.getElementById('modal-update-exam-name-old')?.value || '';

            if (types.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:14px; color:#64748b;">কোনো সংরক্ষিত পরীক্ষার নাম পাওয়া যায়নি</td></tr>`;
                return;
            }

            let html = '';
            types.forEach((t, idx) => {
                const isSelected = t.name.toLowerCase() === currentOld.toLowerCase();
                const safeName = typeof escapeHtmlExam === 'function' ? escapeHtmlExam(t.name) : t.name;
                const encodedName = encodeURIComponent(t.name);
                const subCount = (t.examTypes && t.examTypes.length) || 1;
                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9; ${isSelected ? 'background: #eff6ff;' : ''}">
                        <td style="padding: 8px 10px; text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
                        <td style="padding: 8px 10px; font-weight: 700; color: #1e293b;">
                            <span style="font-size: 0.95rem;">${safeName}</span>
                            ${isSelected ? '<span style="margin-left: 6px; font-size: 0.72rem; background: #2563eb; color: #ffffff; padding: 2px 6px; border-radius: 4px;">বর্তমান নির্বাচন</span>' : ''}
                            <span style="margin-left: 6px; font-size: 0.75rem; color: #0284c7; background: #e0f2fe; padding: 2px 7px; border-radius: 12px; font-weight: 600;">${subCount} Exam Type(s)</span>
                        </td>
                        <td style="padding: 8px 10px; text-align: right; white-space: nowrap;">
                            <button type="button" onclick="selectExamNameToEdit(decodeURIComponent('${encodedName}'))"
                                style="background: #eff6ff; border: 1px solid #93c5fd; color: #1d4ed8; padding: 3px 9px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; margin-right: 4px;">
                                ✏️ এডিট
                            </button>
                            <button type="button" onclick="deleteExamNameFromList(decodeURIComponent('${encodedName}'))"
                                style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        function saveUpdatedExamName(event) {
            if (event) event.preventDefault();
            const oldInput = document.getElementById('modal-update-exam-name-old');
            const nameInput = document.getElementById('modal-update-exam-name-input');
            const syncCheckbox = document.getElementById('modal-sync-schedules-checkbox');

            const oldName = oldInput ? oldInput.value.trim() : '';
            const newName = nameInput ? nameInput.value.trim() : '';

            if (!newName) {
                alert("অনুগ্রহ করে পরীক্ষার নাম লিখুন (Please enter an Exam Name)!");
                if (nameInput) nameInput.focus();
                return;
            }

            let types = loadExamTypes();

            // Check if user changed the name or if it already exists under another item
            const duplicate = types.find(t => t.name.toLowerCase() === newName.toLowerCase() && t.name.toLowerCase() !== oldName.toLowerCase());
            if (duplicate) {
                alert(`"${newName}" নামের একটি পরীক্ষা ইতিমধ্যে তালিকায় বিদ্যমান আছে!`);
                return;
            }

            let updated = false;
            if (oldName) {
                const targetExam = types.find(t => t.name.toLowerCase() === oldName.toLowerCase());
                if (targetExam) {
                    targetExam.name = newName;
                    updated = true;
                }
            }

            if (!updated) {
                // If old item not found, create new exam type entry
                const newId = Date.now().toString();
                types.push(normalizeExamTypeObject({
                    id: newId,
                    name: newName,
                    type: "Main Exam",
                    defaultCQ: 70,
                    defaultMCQ: 30,
                    defaultPractical: 0,
                    passMarkPercent: 33,
                    overrides: [],
                    examTypes: [
                        {
                            id: `${newId}_t1`,
                            typeName: "Main Exam",
                            defaultCQ: 70,
                            defaultMCQ: 30,
                            defaultPractical: 0,
                            passMarkPercent: 33,
                            overrides: []
                        }
                    ]
                }));
            }

            localStorage.setItem('school_exam_types', JSON.stringify(types));

            // Sync with existing schedules if requested
            if (syncCheckbox && syncCheckbox.checked && oldName && oldName.toLowerCase() !== newName.toLowerCase()) {
                try {
                    const schedRaw = localStorage.getItem('school_exam_schedules');
                    if (schedRaw) {
                        const schedules = JSON.parse(schedRaw);
                        let schedUpdated = false;
                        if (Array.isArray(schedules)) {
                            schedules.forEach(s => {
                                if (s.term && s.term.toLowerCase() === oldName.toLowerCase()) {
                                    s.term = newName;
                                    schedUpdated = true;
                                }
                                if (s.examName && s.examName.toLowerCase() === oldName.toLowerCase()) {
                                    s.examName = newName;
                                    schedUpdated = true;
                                }
                            });
                        }
                        if (schedUpdated) {
                            localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
                        }
                    }
                } catch (e) {
                    console.error("Error syncing schedules with updated exam name:", e);
                }
            }

            // Refresh UI
            populateExamDropdowns();
            const scheduleSelect = document.getElementById('schedule-exam-name');
            if (scheduleSelect) {
                scheduleSelect.value = newName;
                previousValidScheduleExamName = newName;
            }
            populateScheduleExamTypesDropdown();
            renderExamTypes();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();

            closeExamNameUpdateModal();

            if (oldName && oldName !== newName) {
                alert(`✅ পরীক্ষার নাম সফলভাবে আপডেট করা হয়েছে!\\n"${oldName}" ➔ "${newName}"`);
            } else {
                alert(`✅ পরীক্ষার নাম সফলভাবে সংরক্ষিত হয়েছে: "${newName}"`);
            }
        }

        """

    content = content[:idx_save_start] + new_save_and_update_block + content[idx_save_end:]
    print("[OK] Replaced saveCustomExamName and added Exam Name Update controllers successfully")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("[SUCCESS] exam-portal.html updated successfully!")
    return True

if __name__ == '__main__':
    update_portal()

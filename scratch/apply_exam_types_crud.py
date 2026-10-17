import os

def update_exam_types_feature():
    file_path = 'c:/Users/niron/OneDrive/Desktop/Cheranga/exam-portal.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Create Exam Schedule section: add action buttons for schedule-exam-type
    target_exam_type_label = '<label for="schedule-exam-type"\n                                    style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Exam\n                                    Type (পরীক্ষার ধরন / নাম):</label>'
    if target_exam_type_label not in content:
        # Try CRLF
        target_exam_type_label = '<label for="schedule-exam-type"\r\n                                    style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Exam\r\n                                    Type (পরীক্ষার ধরন / নাম):</label>'

    if target_exam_type_label in content:
        new_exam_type_label = '''<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                                    <label for="schedule-exam-type"
                                        style="color: #334155; font-weight: 700; margin-bottom: 0; font-size: 1rem;">
                                        Exam Type (পরীক্ষার ধরন / নাম):
                                    </label>
                                    <div style="display: flex; align-items: center; gap: 4px;">
                                        <button type="button" onclick="openAddExamTypeForCurrentScheduleExam()"
                                            style="background: #f0fdf4; border: 1.5px solid #86efac; color: #15803d; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;"
                                            title="নির্বাচিত পরীক্ষায় নতুন Exam Type যুক্ত করুন">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            <span>যুক্ত করুন</span>
                                        </button>
                                        <button type="button" onclick="openEditExamTypeForCurrentScheduleExam()"
                                            style="background: #eff6ff; border: 1.5px solid #93c5fd; color: #1d4ed8; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;"
                                            title="নির্বাচিত Exam Type আপডেট / পরিবর্তন করুন">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            <span>আপডেট</span>
                                        </button>
                                        <button type="button" onclick="deleteCurrentScheduleExamType()"
                                            style="background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; padding: 3px 7px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center;"
                                            title="নির্বাচিত Exam Type মুছে ফেলুন">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>'''
        content = content.replace(target_exam_type_label, new_exam_type_label, 1)
        print("[OK] Added Exam Type action buttons in Create Exam Schedule")
    else:
        print("[WARN] target_exam_type_label not found!")

    # 2. Add Exam Types sub-section in subview-exam-names (Column 1)
    target_subview_chips_end = '<!-- 4. Sync Schedules Checkbox -->'
    if target_subview_chips_end in content:
        subview_exam_types_block = '''<!-- Sub-section: Exam Types Management inside selected Exam Name -->
                            <div id="subview-exam-types-section" style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:14px; margin-bottom:18px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:6px;">
                                    <span style="font-weight:800; font-size:0.92rem; color:#0f172a; display:flex; align-items:center; gap:6px;">
                                        <span>🏷️ এই পরীক্ষার আওতাধীন Exam Types:</span>
                                    </span>
                                    <button type="button" onclick="openAddExamTypeForCurrentSelectedExam()"
                                        style="background:#eff6ff; border:1.5px solid #93c5fd; color:#1d4ed8; padding:4px 12px; border-radius:6px; font-weight:800; font-size:0.82rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 4px rgba(37,99,235,0.1);">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        <span>+ Exam Type যুক্ত করুন</span>
                                    </button>
                                </div>
                                <div id="subview-exam-types-list-container" style="display:flex; flex-direction:column; gap:8px;">
                                    <!-- Dynamic list of Exam Types with Edit/Delete buttons -->
                                </div>
                            </div>

                            '''
        content = content.replace(target_subview_chips_end, subview_exam_types_block + target_subview_chips_end, 1)
        print("[OK] Added Exam Types section to subview-exam-names")
    else:
        print("[WARN] target_subview_chips_end not found!")

    # 3. Add Exam Types section in modal-exam-name-update-modal
    target_modal_chips_end = '</form>\n\n            <!-- All Saved Exam Names Table -->'
    if target_modal_chips_end not in content:
        target_modal_chips_end = '</form>\r\n\r\n            <!-- All Saved Exam Names Table -->'

    if target_modal_chips_end in content:
        modal_exam_types_block = '''    <!-- Sub-section: Exam Types Management inside selected Exam Name -->
                <div id="modal-exam-types-section" style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:12px 14px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                        <span style="font-weight:800; font-size:0.88rem; color:#0f172a;">
                            🏷️ এই পরীক্ষার আওতাধীন Exam Types:
                        </span>
                        <button type="button" onclick="openAddExamTypeForModalExam()"
                            style="background:#eff6ff; border:1px solid #93c5fd; color:#1d4ed8; padding:3px 10px; border-radius:6px; font-weight:800; font-size:0.8rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span>+ Exam Type যুক্ত করুন</span>
                        </button>
                    </div>
                    <div id="modal-exam-types-list-container" style="display:flex; flex-direction:column; gap:6px;">
                        <!-- Populated dynamically via JS -->
                    </div>
                </div>
            </form>

            <!-- All Saved Exam Names Table -->'''
        content = content.replace(target_modal_chips_end, modal_exam_types_block, 1)
        print("[OK] Added Exam Types section in exam-name-update-modal")
    else:
        print("[WARN] target_modal_chips_end not found!")

    # 4. Insert helper JavaScript functions for Exam Type CRUD inside Exam Name
    target_controllers_anchor = "// --- SUBVIEW: EXAM NAMES CONTROLLERS ---"
    if target_controllers_anchor not in content:
        print("[ERROR] target_controllers_anchor not found!")
        return False

    new_crud_js = '''// --- EXAM TYPE CRUD CONTROLLERS (INSIDE EXAM NAME) ---
        function renderExamSubTypesInSubview(examName) {
            const container = document.getElementById('subview-exam-types-list-container');
            if (!container) return;
            if (!examName) {
                const selectTarget = document.getElementById('subview-exam-name-select-target');
                examName = selectTarget ? selectTarget.value : '';
            }
            const types = loadExamTypes();
            const exam = types.find(t => t.name.toLowerCase() === (examName || '').trim().toLowerCase());

            if (!exam) {
                container.innerHTML = `<div style="text-align:center; padding:10px; color:#64748b; font-size:0.86rem;">কোনো পরীক্ষা নির্বাচিত নেই</div>`;
                return;
            }

            normalizeExamTypeObject(exam);
            const subTypes = exam.examTypes || [];

            if (subTypes.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:12px; color:#64748b; font-size:0.86rem; background:#ffffff; border-radius:8px; border:1px dashed #cbd5e1;">
                        কোনো Exam Type যুক্ত নেই। 
                        <button type="button" onclick="openAddExamTypeForExam('${escapeHtmlExam(exam.name)}')"
                            style="color:#2563eb; font-weight:700; background:none; border:none; cursor:pointer; text-decoration:underline; margin-left:4px;">
                            + নতুন ধরন যোগ করুন
                        </button>
                    </div>
                `;
                return;
            }

            let html = '';
            subTypes.forEach(st => {
                const safeTypeName = escapeHtmlExam(st.typeName || 'Main Exam');
                const encodedExamId = encodeURIComponent(exam.id);
                const encodedSubId = encodeURIComponent(st.id);
                const isOnlyOne = subTypes.length <= 1;

                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1.5px solid #e2e8f0; border-radius:10px; padding:9px 12px; gap:8px; transition:all 0.2s ease;">
                        <div>
                            <div style="font-weight:800; font-size:0.94rem; color:#0f172a; display:flex; align-items:center; gap:6px;">
                                <span>${safeTypeName}</span>
                                <span style="font-size:0.75rem; color:#059669; background:#dcfce7; padding:1px 7px; border-radius:10px; font-weight:700;">
                                    মোট: ${(st.defaultCQ || 0) + (st.defaultMCQ || 0) + (st.defaultPractical || 0)}
                                </span>
                            </div>
                            <div style="font-size:0.78rem; color:#64748b; font-weight:600; margin-top:2px;">
                                CQ: <strong style="color:#2563eb;">${st.defaultCQ || 0}</strong> | 
                                MCQ: <strong style="color:#d97706;">${st.defaultMCQ || 0}</strong> | 
                                ব্যবহারিক: <strong style="color:#7c3aed;">${st.defaultPractical || 0}</strong> | 
                                পাস: <strong>${st.passMarkPercent || 33}%</strong>
                            </div>
                        </div>
                        <div style="display:flex; gap:5px; white-space:nowrap;">
                            <button type="button" onclick="editExamSubType(decodeURIComponent('${encodedExamId}'), decodeURIComponent('${encodedSubId}'))"
                                style="background:#eff6ff; border:1px solid #93c5fd; color:#1d4ed8; padding:4px 9px; border-radius:6px; font-size:0.8rem; font-weight:700; cursor:pointer;"
                                title="এই Exam Type-এর নাম ও নম্বর বণ্টন পরিবর্তন করুন">
                                ✏️ আপডেট
                            </button>
                            <button type="button" onclick="deleteExamSubType(decodeURIComponent('${encodedExamId}'), decodeURIComponent('${encodedSubId}'), event)"
                                style="background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:4px 8px; border-radius:6px; font-size:0.8rem; font-weight:700; cursor:pointer;"
                                title="${isOnlyOne ? 'একটিমাত্র ধরন রয়েছে, মুছলে পরীক্ষাটি মুছে যাবে' : 'এই Exam Type মুছে ফেলুন'}">
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        function renderExamSubTypesInModal(examName) {
            const container = document.getElementById('modal-exam-types-list-container');
            if (!container) return;
            if (!examName) {
                const oldInput = document.getElementById('modal-update-exam-name-old');
                examName = oldInput ? oldInput.value : '';
            }
            const types = loadExamTypes();
            const exam = types.find(t => t.name.toLowerCase() === (examName || '').trim().toLowerCase());

            if (!exam) {
                container.innerHTML = `<div style="text-align:center; padding:6px; color:#64748b; font-size:0.84rem;">কোনো Exam Type পাওয়া যায়নি</div>`;
                return;
            }

            normalizeExamTypeObject(exam);
            const subTypes = exam.examTypes || [];

            if (subTypes.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:8px; color:#64748b; font-size:0.84rem;">কোনো Exam Type যুক্ত নেই</div>`;
                return;
            }

            let html = '';
            subTypes.forEach(st => {
                const safeTypeName = escapeHtmlExam(st.typeName || 'Main Exam');
                const encodedExamId = encodeURIComponent(exam.id);
                const encodedSubId = encodeURIComponent(st.id);

                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; gap:6px;">
                        <div style="font-size:0.88rem; font-weight:700; color:#1e293b;">
                            <span>${safeTypeName}</span>
                            <span style="font-size:0.75rem; color:#64748b; margin-left:6px; font-weight:500;">
                                (CQ: ${st.defaultCQ || 0}, MCQ: ${st.defaultMCQ || 0}, Prac: ${st.defaultPractical || 0})
                            </span>
                        </div>
                        <div style="display:flex; gap:4px;">
                            <button type="button" onclick="editExamSubType(decodeURIComponent('${encodedExamId}'), decodeURIComponent('${encodedSubId}'))"
                                style="background:#eff6ff; border:1px solid #93c5fd; color:#1d4ed8; padding:2px 7px; border-radius:5px; font-size:0.76rem; font-weight:700; cursor:pointer;">
                                ✏️ এডিট
                            </button>
                            <button type="button" onclick="deleteExamSubType(decodeURIComponent('${encodedExamId}'), decodeURIComponent('${encodedSubId}'), event)"
                                style="background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:2px 6px; border-radius:5px; font-size:0.76rem; font-weight:700; cursor:pointer;">
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        function openAddExamTypeForExam(examName) {
            if (!examName) {
                const select = document.getElementById('subview-exam-name-select-target') || document.getElementById('schedule-exam-name');
                examName = select ? select.value : '';
            }
            const types = loadExamTypes();
            const exam = types.find(t => t.name.toLowerCase() === (examName || '').trim().toLowerCase());
            resetExamTypeForm();
            populateOverrideSubjectsDropdown();
            populateExamTypeNamesDropdown(examName);
            if (exam) {
                document.getElementById('exam-type-id').value = exam.id;
                document.getElementById('exam-type-name').value = exam.name;
            }
            document.getElementById('exam-type-sub-id').value = "";
            document.getElementById('exam-type-form-title').innerText = `➕ Add New Exam Type under "${examName || 'Examination'}"`;
            document.getElementById('exam-type-modal').classList.add('active');
            setTimeout(() => {
                const catInput = document.getElementById('exam-type-category');
                if (catInput) {
                    catInput.focus();
                }
            }, 100);
        }

        function openAddExamTypeForCurrentSelectedExam() {
            const selectTarget = document.getElementById('subview-exam-name-select-target');
            const examName = selectTarget ? selectTarget.value : '';
            openAddExamTypeForExam(examName);
        }

        function openAddExamTypeForModalExam() {
            const oldInput = document.getElementById('modal-update-exam-name-old');
            const examName = oldInput ? oldInput.value : '';
            openAddExamTypeForExam(examName);
        }

        function openAddExamTypeForCurrentScheduleExam() {
            const scheduleSelect = document.getElementById('schedule-exam-name');
            const examName = scheduleSelect ? scheduleSelect.value : '';
            if (!examName) {
                alert("অনুগ্রহ করে প্রথমে Exam Name নির্বাচন করুন!");
                return;
            }
            openAddExamTypeForExam(examName);
        }

        function openEditExamTypeForCurrentScheduleExam() {
            const examName = document.getElementById('schedule-exam-name')?.value;
            const examTypeName = document.getElementById('schedule-exam-type')?.value;
            if (!examName || !examTypeName) {
                alert("অনুগ্রহ করে প্রথমে Exam Name এবং Exam Type নির্বাচন করুন!");
                return;
            }
            const types = loadExamTypes();
            const exam = types.find(t => t.name.toLowerCase() === examName.trim().toLowerCase());
            if (!exam) return;
            const st = (exam.examTypes || []).find(s => s.typeName.toLowerCase() === examTypeName.trim().toLowerCase()) || exam.examTypes?.[0];
            if (st) {
                editExamSubType(exam.id, st.id);
            } else {
                openAddExamTypeForExam(examName);
            }
        }

        function deleteCurrentScheduleExamType() {
            const examName = document.getElementById('schedule-exam-name')?.value;
            const examTypeName = document.getElementById('schedule-exam-type')?.value;
            if (!examName || !examTypeName) {
                alert("অনুগ্রহ করে প্রথমে Exam Name এবং Exam Type নির্বাচন করুন!");
                return;
            }
            const types = loadExamTypes();
            const exam = types.find(t => t.name.toLowerCase() === examName.trim().toLowerCase());
            if (!exam) return;
            const st = (exam.examTypes || []).find(s => s.typeName.toLowerCase() === examTypeName.trim().toLowerCase());
            if (st) {
                deleteExamSubType(exam.id, st.id);
            }
        }

        '''
    content = content.replace(target_controllers_anchor, new_crud_js + target_controllers_anchor, 1)
    print("[OK] Inserted CRUD JS functions")

    # 5. Hook renderExamSubTypesInSubview into onSubviewTargetExamSelect & renderExamNamesSubView
    target_on_subview_select = 'function onSubviewTargetExamSelect(examName) {\n            const input = document.getElementById(\'subview-exam-name-input\');\n            if (input && examName) {\n                input.value = examName;\n            }\n            renderExamNamesSubViewTable();\n        }'
    if target_on_subview_select not in content:
        target_on_subview_select = 'function onSubviewTargetExamSelect(examName) {\r\n            const input = document.getElementById(\'subview-exam-name-input\');\r\n            if (input && examName) {\r\n                input.value = examName;\r\n            }\r\n            renderExamNamesSubViewTable();\r\n        }'

    new_on_subview_select = '''function onSubviewTargetExamSelect(examName) {
            const input = document.getElementById('subview-exam-name-input');
            if (input && examName) {
                input.value = examName;
            }
            renderExamNamesSubViewTable();
            if (typeof renderExamSubTypesInSubview === 'function') {
                renderExamSubTypesInSubview(examName);
            }
        }'''
    if target_on_subview_select in content:
        content = content.replace(target_on_subview_select, new_on_subview_select, 1)
        print("[OK] Hooked renderExamSubTypesInSubview into onSubviewTargetExamSelect")

    # 6. Hook renderExamSubTypesInModal into openExamNameUpdateModal & selectExamNameToEdit
    target_modal_open_render = 'renderExamNamesListInUpdateModal();'
    new_modal_open_render = 'renderExamNamesListInUpdateModal();\n            if (typeof renderExamSubTypesInModal === \'function\') renderExamSubTypesInModal(currentName);'
    content = content.replace(target_modal_open_render, new_modal_open_render, 1)

    target_select_edit = 'function selectExamNameToEdit(examName) {\n            const oldInput = document.getElementById(\'modal-update-exam-name-old\');'
    if target_select_edit not in content:
        target_select_edit = 'function selectExamNameToEdit(examName) {\r\n            const oldInput = document.getElementById(\'modal-update-exam-name-old\');'
    new_select_edit = '''function selectExamNameToEdit(examName) {
            if (typeof renderExamSubTypesInModal === 'function') renderExamSubTypesInModal(examName);
            const oldInput = document.getElementById('modal-update-exam-name-old');'''
    if target_select_edit in content:
        content = content.replace(target_select_edit, new_select_edit, 1)
        print("[OK] Hooked renderExamSubTypesInModal into selectExamNameToEdit")

    # 7. In saveExamType and deleteExamSubType, ensure subview & modal lists are refreshed
    target_save_exam_type_end = 'if (typeof updateScheduleDistLivePreview === \'function\') updateScheduleDistLivePreview();\n        }'
    if target_save_exam_type_end not in content:
        target_save_exam_type_end = 'if (typeof updateScheduleDistLivePreview === \'function\') updateScheduleDistLivePreview();\r\n        }'

    new_save_exam_type_end = '''if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();
            if (typeof renderExamNamesSubView === 'function') renderExamNamesSubView();
            const curSubExam = document.getElementById('subview-exam-name-select-target')?.value;
            if (curSubExam && typeof renderExamSubTypesInSubview === 'function') renderExamSubTypesInSubview(curSubExam);
            const curModalExam = document.getElementById('modal-update-exam-name-old')?.value;
            if (curModalExam && typeof renderExamSubTypesInModal === 'function') renderExamSubTypesInModal(curModalExam);
        }'''
    if target_save_exam_type_end in content:
        content = content.replace(target_save_exam_type_end, new_save_exam_type_end, 1)
        print("[OK] Hooked refresh into saveExamType")

    target_del_sub_end = 'if (typeof updateScheduleDistLivePreview === \'function\') updateScheduleDistLivePreview();\n        }'
    if target_del_sub_end not in content:
        target_del_sub_end = 'if (typeof updateScheduleDistLivePreview === \'function\') updateScheduleDistLivePreview();\r\n        }'
    new_del_sub_end = '''if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();
            if (typeof renderExamNamesSubView === 'function') renderExamNamesSubView();
            const curSubExamD = document.getElementById('subview-exam-name-select-target')?.value;
            if (curSubExamD && typeof renderExamSubTypesInSubview === 'function') renderExamSubTypesInSubview(curSubExamD);
            const curModalExamD = document.getElementById('modal-update-exam-name-old')?.value;
            if (curModalExamD && typeof renderExamSubTypesInModal === 'function') renderExamSubTypesInModal(curModalExamD);
        }'''
    if target_del_sub_end in content:
        content = content.replace(target_del_sub_end, new_del_sub_end, 1)
        print("[OK] Hooked refresh into deleteExamSubType")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("[SUCCESS] All Exam Type CRUD options successfully integrated into Exam Name!")

if __name__ == '__main__':
    update_exam_types_feature()

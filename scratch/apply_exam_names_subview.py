import os

def update_portal_subview():
    file_path = 'c:/Users/niron/OneDrive/Desktop/Cheranga/exam-portal.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Sub-tab button for 'exam-names'
    target_tab_str = '<button class="sub-tab-btn active" id="btn-tab-exam-entry" onclick="navigateExamView(\'exam-entry\')">Exam\n                    List</button>'
    if target_tab_str not in content:
        # Try with CRLF
        target_tab_str = '<button class="sub-tab-btn active" id="btn-tab-exam-entry" onclick="navigateExamView(\'exam-entry\')">Exam\r\n                    List</button>'
    
    if target_tab_str not in content:
        print("[ERROR] Sub-tab target button not found!")
        return False

    new_tab_str = target_tab_str + '\n                <button class="sub-tab-btn" id="btn-tab-exam-names" onclick="navigateExamView(\'exam-names\')">Exam Names</button>'
    content = content.replace(target_tab_str, new_tab_str, 1)
    print("[OK] Added Exam Names sub-tab button")

    # 2. Add Quick Nav Card in Dashboard quick-nav-grid
    target_card_str = '<div class="quick-nav-card" onclick="navigateExamView(\'exam-entry\')">'
    if target_card_str not in content:
        print("[ERROR] Dashboard quick-nav-card target not found!")
        return False

    exam_names_card = '''<div class="quick-nav-card" onclick="navigateExamView('exam-names')">
                        <div class="quick-nav-icon" style="color:var(--neon-purple);">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </div>
                        <h4>Exam Names</h4>
                        <p>পরীক্ষার নাম আপডেট ও পরিচালনা করুন</p>
                    </div>
                    '''
    idx_card = content.find(target_card_str)
    # Insert right after the exam-entry card ends
    end_of_entry_card = content.find('</div>', content.find('</h4>', idx_card)) + 6
    # Find the closing tag of that quick-nav-card
    card_close = content.find('</div>', end_of_entry_card) + 6
    content = content[:card_close] + '\n                    ' + exam_names_card + content[card_close:]
    print("[OK] Added Exam Names dashboard quick-nav-card")

    # 3. Add link button in Create Exam Schedule label row
    target_label_btns = '<button type="button" onclick="openExamNameUpdateModal()"'
    if target_label_btns not in content:
        print("[ERROR] Label buttons target not found!")
        return False
        
    idx_label = content.find(target_label_btns)
    subview_link_btn = '''<button type="button" onclick="navigateExamView('exam-names')"
                                            style="background: #faf5ff; border: 1.5px solid #d8b4fe; color: #7e22ce; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s ease;"
                                            title="Exam Names সাব অপশনে গিয়ে বিস্তারিত পরিচালনা করুন">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                            <span>Exam Names সাব অপশন</span>
                                        </button>
                                        '''
    content = content[:idx_label] + subview_link_btn + content[idx_label:]
    print("[OK] Added Exam Names Sub-option button in Create Exam Schedule label")

    # 4. Insert SUB-VIEW: EXAM NAMES HTML markup
    target_subview_split = '<!-- SUB-VIEW 2: RESULT REPORT -->'
    if target_subview_split not in content:
        print("[ERROR] Target subview split not found!")
        return False

    subview_exam_names_html = '''<!-- SUB-VIEW: EXAM NAMES (পরীক্ষার নাম আপডেট ও ব্যবস্থাপনা) -->
            <div id="subview-exam-names" class="portal-sub-view">
                <!-- Page Top Action Bar & Header -->
                <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:18px 24px; box-shadow:0 2px 10px rgba(0,0,0,0.03); margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:14px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:260px;">
                            <h2 class="portal-section-title"
                                style="margin:0 0 4px 0; font-size:1.55rem; color:#0f172a; font-weight:800; display:flex; align-items:center; gap:10px;">
                                <span style="background:#eff6ff; color:#2563eb; width:38px; height:38px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center;">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </span>
                                <span>Exam Names (পরীক্ষার নাম আপডেট ও ব্যবস্থাপনা)</span>
                            </h2>
                            <p style="margin:0; font-size:0.9rem; color:#64748b;">
                                "Create Exam Schedule" সেকশন এবং সমগ্র পোর্টালে ব্যবহৃত সকল পরীক্ষার নাম আপডেট, সংশোধন ও পরিচালনা করুন
                            </p>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button type="button" class="btn-secondary"
                                style="background:#ffffff; border:1.5px solid #cbd5e1; box-shadow:0 2px 6px rgba(0,0,0,0.05); padding:9px 20px; border-radius:10px; font-weight:800; font-size:0.92rem; cursor:pointer; color:#0f172a; display:inline-flex; align-items:center; gap:6px; transition:all 0.2s ease;"
                                onclick="navigateExamView('exam-entry')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                <span>Back to Exam List</span>
                            </button>
                        </div>
                    </div>

                    <!-- Bottom Action Row -->
                    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; border-top:1px solid #f1f5f9; padding-top:12px;">
                        <button type="button" class="btn-primary"
                            style="background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border:none; box-shadow:0 4px 14px rgba(37,99,235,0.25); padding:9px 18px; font-size:0.92rem; font-weight:700; border-radius:10px; color:#ffffff; cursor:pointer; display:inline-flex; align-items:center; gap:8px;"
                            onclick="openExamNameCreateModal()">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span>নতুন পরীক্ষার নাম তৈরি করুন</span>
                        </button>
                        <button type="button" class="action-btn-sm"
                            style="background:#f8fafc; border:1.5px solid #cbd5e1; color:#334155; padding:9px 16px; font-size:0.9rem; font-weight:700; border-radius:10px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;"
                            onclick="renderExamNamesSubView()">
                            <span>🔄 রিফ্রেশ তালিকা</span>
                        </button>
                    </div>
                </div>

                <!-- Top 3 KPI Metric Cards -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:20px;">
                    <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                            📑
                        </div>
                        <div>
                            <div style="font-size:0.84rem; font-weight:700; color:#64748b;">মোট সংরক্ষিত পরীক্ষার নাম</div>
                            <div id="kpi-exam-names-total" style="font-size:1.6rem; font-weight:900; color:#0f172a; line-height:1.2;">0</div>
                        </div>
                    </div>
                    <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                            🗓️
                        </div>
                        <div>
                            <div style="font-size:0.84rem; font-weight:700; color:#64748b;">শিডিউলে সক্রিয় পরীক্ষার নাম</div>
                            <div id="kpi-exam-names-active-schedules" style="font-size:1.6rem; font-weight:900; color:#0f172a; line-height:1.2;">0</div>
                        </div>
                    </div>
                    <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#faf5ff; color:#9333ea; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                            ⚙️
                        </div>
                        <div>
                            <div style="font-size:0.84rem; font-weight:700; color:#64748b;">মোট কনফিগার করা Exam Types</div>
                            <div id="kpi-exam-names-total-subtypes" style="font-size:1.6rem; font-weight:900; color:#0f172a; line-height:1.2;">0</div>
                        </div>
                    </div>
                </div>

                <!-- Two-Column Main Layout: Left = Update Editor, Right = Live Directory Table -->
                <div style="display:grid; grid-template-columns:1fr 1.35fr; gap:22px; align-items:start;">
                    
                    <!-- COLUMN 1: EXAM NAME UPDATE & EDIT CARD -->
                    <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:16px; padding:22px; box-shadow:0 4px 18px rgba(0,0,0,0.04);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1.5px solid #f1f5f9; padding-bottom:12px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div style="width:32px; height:32px; border-radius:8px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </div>
                                <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#0f172a;">
                                    পরীক্ষার নাম আপডেট ও পরিবর্তন
                                </h3>
                            </div>
                            <span id="subview-editor-mode-badge" style="font-size:0.78rem; font-weight:800; background:#eff6ff; color:#2563eb; padding:3px 10px; border-radius:20px; border:1px solid #bfdbfe;">
                                এডিট মোড (Edit Mode)
                            </span>
                        </div>

                        <form id="subview-update-exam-form" onsubmit="saveUpdatedExamNameFromSubview(event)">
                            <!-- 1. Select Target Exam -->
                            <div class="form-group" style="margin-bottom:14px;">
                                <label for="subview-exam-name-select-target" style="display:block; font-weight:800; font-size:0.92rem; color:#334155; margin-bottom:6px;">
                                    🎯 যে পরীক্ষার নাম পরিবর্তন করবেন (Select Exam):
                                </label>
                                <select id="subview-exam-name-select-target" class="form-control"
                                    onchange="onSubviewTargetExamSelect(this.value)"
                                    style="width:100%; background:#f8fafc; color:#0f172a; border:1.5px solid #cbd5e1; font-weight:700; font-size:0.96rem; padding:9px 12px; border-radius:8px;">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>

                            <!-- 2. New / Updated Name Input -->
                            <div class="form-group" style="margin-bottom:14px;">
                                <label for="subview-exam-name-input" style="display:block; font-weight:800; font-size:0.92rem; color:#1e293b; margin-bottom:6px;">
                                    ✏️ নতুন / সংশোধিত নাম (Updated Exam Name): <span style="color:#dc2626;">*</span>
                                </label>
                                <input type="text" id="subview-exam-name-input" class="form-control"
                                    placeholder="যেমন: বার্ষিক পরীক্ষা ২০২৬"
                                    style="width:100%; font-size:1rem; font-weight:700; color:#0f172a; background:#ffffff; padding:10px 14px; border:2px solid #2563eb; border-radius:8px; outline:none; box-shadow:0 0 0 3px rgba(37,99,235,0.12);"
                                    required>
                            </div>

                            <!-- 3. Quick Suggestions Chips -->
                            <div style="margin-bottom:16px;">
                                <div style="font-size:0.84rem; font-weight:800; color:#475569; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                                    <span>💡 এক ক্লিকে পছন্দসই নাম বসান (Quick Suggestions):</span>
                                </div>
                                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                                    <button type="button" onclick="setSubviewExamNamePreset('অর্ধ-বার্ষিক পরীক্ষা')"
                                        style="background:#f1f5f9; border:1px solid #cbd5e1; color:#1e293b; font-size:0.8rem; font-weight:700; padding:5px 10px; border-radius:6px; cursor:pointer;">
                                        অর্ধ-বার্ষিক পরীক্ষা
                                    </button>
                                    <button type="button" onclick="setSubviewExamNamePreset('বার্ষিক পরীক্ষা')"
                                        style="background:#f1f5f9; border:1px solid #cbd5e1; color:#1e293b; font-size:0.8rem; font-weight:700; padding:5px 10px; border-radius:6px; cursor:pointer;">
                                        বার্ষিক পরীক্ষা
                                    </button>
                                    <button type="button" onclick="setSubviewExamNamePreset('১ম সাময়িক পরীক্ষা')"
                                        style="background:#f1f5f9; border:1px solid #cbd5e1; color:#1e293b; font-size:0.8rem; font-weight:700; padding:5px 10px; border-radius:6px; cursor:pointer;">
                                        ১ম সাময়িক পরীক্ষা
                                    </button>
                                    <button type="button" onclick="setSubviewExamNamePreset('২য় সাময়িক পরীক্ষা')"
                                        style="background:#f1f5f9; border:1px solid #cbd5e1; color:#1e293b; font-size:0.8rem; font-weight:700; padding:5px 10px; border-radius:6px; cursor:pointer;">
                                        ২য় সাময়িক পরীক্ষা
                                    </button>
                                    <button type="button" onclick="setSubviewExamNamePreset('প্রাক-নির্বাচনী পরীক্ষা')"
                                        style="background:#f1f5f9; border:1px solid #cbd5e1; color:#1e293b; font-size:0.8rem; font-weight:700; padding:5px 10px; border-radius:6px; cursor:pointer;">
                                        প্রাক-নির্বাচনী পরীক্ষা
                                    </button>
                                    <button type="button" onclick="setSubviewExamNamePreset('নির্বাচনী পরীক্ষা')"
                                        style="background:#f1f5f9; border:1px solid #cbd5e1; color:#1e293b; font-size:0.8rem; font-weight:700; padding:5px 10px; border-radius:6px; cursor:pointer;">
                                        নির্বাচনী পরীক্ষা
                                    </button>
                                    <button type="button" onclick="setSubviewExamNamePreset('মডেল টেস্ট')"
                                        style="background:#f1f5f9; border:1px solid #cbd5e1; color:#1e293b; font-size:0.8rem; font-weight:700; padding:5px 10px; border-radius:6px; cursor:pointer;">
                                        মডেল টেস্ট
                                    </button>
                                </div>
                            </div>

                            <!-- 4. Sync Schedules Checkbox -->
                            <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px 14px; margin-bottom:18px; display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" id="subview-sync-schedules-checkbox" checked
                                    style="width:16px; height:16px; cursor:pointer; accent-color:#2563eb;">
                                <label for="subview-sync-schedules-checkbox"
                                    style="font-size:0.85rem; color:#475569; font-weight:600; cursor:pointer; user-select:none; line-height:1.35;">
                                    পূর্ববর্তী তৈরিকৃত শিডিউলে থাকা পুরোনো নামটি এই নতুন নামে স্বয়ংক্রিয়ভাবে আপডেট করুন
                                </label>
                            </div>

                            <!-- 5. Form Action Buttons -->
                            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                <button type="submit"
                                    style="flex:1; background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color:#ffffff; border:none; padding:11px 18px; border-radius:10px; font-weight:800; font-size:0.95rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 3px 10px rgba(37,99,235,0.25);">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span>আপডেট সংরক্ষণ করুন</span>
                                </button>
                                <button type="button" onclick="saveNewExamNameFromSubview()"
                                    style="background:#f0fdf4; border:1.5px solid #86efac; color:#15803d; padding:11px 16px; border-radius:10px; font-weight:800; font-size:0.92rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    <span>নতুন নাম যোগ করুন</span>
                                </button>
                                <button type="button" onclick="resetExamNamesSubviewForm()"
                                    style="background:#f1f5f9; border:1.5px solid #cbd5e1; color:#475569; padding:11px 14px; border-radius:10px; font-weight:700; font-size:0.9rem; cursor:pointer;">
                                    রিসেট
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- COLUMN 2: EXAM NAMES DIRECTORY & MANAGEMENT TABLE -->
                    <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:16px; padding:22px; box-shadow:0 4px 18px rgba(0,0,0,0.04);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
                            <div>
                                <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:8px;">
                                    <span>📋 সংরক্ষিত পরীক্ষার নামের তালিকা</span>
                                </h3>
                                <span style="font-size:0.83rem; color:#64748b;">সকল সংরক্ষিত পরীক্ষা পরিচালনা ও শিডিউলের সাথে লিঙ্কিং</span>
                            </div>
                            <!-- Live Search Input -->
                            <div style="position:relative; min-width:200px;">
                                <input type="text" id="subview-exam-names-search-input"
                                    placeholder="🔍 পরীক্ষার নাম খুঁজুন..."
                                    onkeyup="filterExamNamesInSubview()"
                                    style="width:100%; font-size:0.88rem; padding:7px 12px; border:1.5px solid #cbd5e1; border-radius:8px; background:#f8fafc; color:#0f172a; outline:none;">
                            </div>
                        </div>

                        <!-- Table Container -->
                        <div style="border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#ffffff;">
                            <div style="max-height:420px; overflow-y:auto;">
                                <table style="width:100%; border-collapse:collapse; font-size:0.92rem;">
                                    <thead style="background:#f8fafc; position:sticky; top:0; z-index:10; border-bottom:1.5px solid #e2e8f0;">
                                        <tr>
                                            <th style="padding:10px 12px; text-align:center; width:45px; color:#475569; font-weight:800;">SL</th>
                                            <th style="padding:10px 12px; text-align:left; color:#475569; font-weight:800;">Exam Name</th>
                                            <th style="padding:10px 12px; text-align:center; color:#475569; font-weight:800;">Exam Types</th>
                                            <th style="padding:10px 12px; text-align:center; color:#475569; font-weight:800;">Schedules</th>
                                            <th style="padding:10px 12px; text-align:right; color:#475569; font-weight:800;">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="subview-exam-names-tbody">
                                        <!-- Populated dynamically via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            '''
    content = content.replace(target_subview_split, subview_exam_names_html + target_subview_split, 1)
    print("[OK] Inserted SUB-VIEW: EXAM NAMES HTML markup")

    # 5. Update switchExamView() in JS to handle 'exam-names'
    target_switch = "} else if (viewName === 'exam-types') {"
    if target_switch not in content:
        print("[ERROR] switchExamView target not found!")
        return False
        
    new_switch_branch = '''} else if (viewName === 'exam-names') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                renderExamNamesSubView();
            ''' + target_switch
    content = content.replace(target_switch, new_switch_branch, 1)
    print("[OK] Updated switchExamView to handle 'exam-names'")

    # 6. Add JavaScript Controller functions for Exam Names Sub-view
    target_js_anchor = "// --- SUBVIEW 5: SMS CONTROLLERS ---"
    if target_js_anchor not in content:
        print("[ERROR] JavaScript anchor for controllers not found!")
        return False

    subview_js_controllers = '''// --- SUBVIEW: EXAM NAMES CONTROLLERS ---
        function renderExamNamesSubView() {
            const types = loadExamTypes();
            const schedules = (typeof loadSchedules === 'function') ? loadSchedules() : safeJsonParse('school_exam_schedules', []);

            // 1. Update KPI Counters
            const kpiTotal = document.getElementById('kpi-exam-names-total');
            const kpiActive = document.getElementById('kpi-exam-names-active-schedules');
            const kpiSubtypes = document.getElementById('kpi-exam-names-total-subtypes');

            if (kpiTotal) kpiTotal.textContent = types.length;

            const activeExamNames = new Set();
            schedules.forEach(s => {
                const name = (s.term || s.examName || '').trim();
                if (name) activeExamNames.add(name.toLowerCase());
            });
            if (kpiActive) kpiActive.textContent = activeExamNames.size;

            let totalSubtypes = 0;
            types.forEach(t => {
                totalSubtypes += (t.examTypes && t.examTypes.length) ? t.examTypes.length : 1;
            });
            if (kpiSubtypes) kpiSubtypes.textContent = totalSubtypes;

            // 2. Populate Target Select in Form
            const selectTarget = document.getElementById('subview-exam-name-select-target');
            const currentSelected = selectTarget ? selectTarget.value : '';
            if (selectTarget) {
                let html = '<option value="" disabled>-- পরীক্ষার নাম নির্বাচন করুন --</option>';
                types.forEach(t => {
                    html += `<option value="${escapeHtmlExam(t.name)}">${escapeHtmlExam(t.name)}</option>`;
                });
                selectTarget.innerHTML = html;
                if (currentSelected && types.some(t => t.name.toLowerCase() === currentSelected.toLowerCase())) {
                    selectTarget.value = currentSelected;
                } else if (types.length > 0) {
                    selectTarget.selectedIndex = 1;
                }
            }

            // Sync input with selected target
            if (selectTarget && selectTarget.value) {
                onSubviewTargetExamSelect(selectTarget.value);
            }

            // 3. Render Table
            renderExamNamesSubViewTable(types, schedules);
        }

        function renderExamNamesSubViewTable(types, schedules) {
            const tbody = document.getElementById('subview-exam-names-tbody');
            if (!tbody) return;
            if (!types) types = loadExamTypes();
            if (!schedules) schedules = (typeof loadSchedules === 'function') ? loadSchedules() : safeJsonParse('school_exam_schedules', []);

            if (types.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#64748b;">কোনো সংরক্ষিত পরীক্ষার নাম পাওয়া যায়নি</td></tr>`;
                return;
            }

            const currentEditing = document.getElementById('subview-exam-name-select-target')?.value || '';

            let html = '';
            types.forEach((t, idx) => {
                const isSelected = t.name.toLowerCase() === currentEditing.toLowerCase();
                const safeName = escapeHtmlExam(t.name);
                const encodedName = encodeURIComponent(t.name);
                const subCount = (t.examTypes && t.examTypes.length) || 1;
                const scheduleCount = schedules.filter(s => (s.term || s.examName || '').trim().toLowerCase() === t.name.toLowerCase()).length;

                html += `
                    <tr class="exam-name-row" style="border-bottom: 1px solid #f1f5f9; ${isSelected ? 'background: #eff6ff;' : ''}">
                        <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
                        <td style="padding: 10px 12px; font-weight: 700; color: #1e293b;">
                            <div style="font-size: 0.96rem; display: flex; align-items: center; gap: 6px;">
                                <span class="exam-name-text">${safeName}</span>
                                ${isSelected ? '<span style="font-size: 0.72rem; background: #2563eb; color: #ffffff; padding: 2px 7px; border-radius: 4px;">বর্তমান নির্বাচন</span>' : ''}
                            </div>
                            <div style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin-top: 2px;">
                                Primary Type: <span style="color: #0f766e; font-weight: 700;">${escapeHtmlExam(t.type || 'Main Exam')}</span>
                            </div>
                        </td>
                        <td style="padding: 10px 12px; text-align: center;">
                            <span style="font-size: 0.8rem; color: #0284c7; background: #e0f2fe; padding: 3px 9px; border-radius: 12px; font-weight: 700;">
                                ${subCount} Type(s)
                            </span>
                        </td>
                        <td style="padding: 10px 12px; text-align: center;">
                            <span style="font-size: 0.8rem; ${scheduleCount > 0 ? 'color: #16a34a; background: #dcfce7;' : 'color: #64748b; background: #f1f5f9;'} padding: 3px 9px; border-radius: 12px; font-weight: 700;">
                                ${scheduleCount} Schedule(s)
                            </span>
                        </td>
                        <td style="padding: 10px 12px; text-align: right; white-space: nowrap;">
                            <button type="button" onclick="editExamNameInSubview(decodeURIComponent('${encodedName}'))"
                                style="background: #eff6ff; border: 1px solid #93c5fd; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; cursor: pointer; margin-right: 4px;"
                                title="এই পরীক্ষার নাম এডিট বা আপডেট করুন">
                                ✏️ এডিট
                            </button>
                            <button type="button" onclick="useExamNameInSchedule(decodeURIComponent('${encodedName}'))"
                                style="background: #f0fdf4; border: 1px solid #86efac; color: #15803d; padding: 4px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; cursor: pointer; margin-right: 4px;"
                                title="এই পরীক্ষার নাম দিয়ে শিডিউল তৈরি করুন">
                                📅 শিডিউল
                            </button>
                            <button type="button" onclick="deleteExamNameInSubview(decodeURIComponent('${encodedName}'))"
                                style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 4px 9px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; cursor: pointer;"
                                title="পরীক্ষার নামটি মুছে ফেলুন">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        function onSubviewTargetExamSelect(examName) {
            const input = document.getElementById('subview-exam-name-input');
            if (input && examName) {
                input.value = examName;
            }
            renderExamNamesSubViewTable();
        }

        function setSubviewExamNamePreset(namePrefix) {
            const input = document.getElementById('subview-exam-name-input');
            if (input) {
                const currentVal = input.value.trim();
                const yearMatch = currentVal.match(/\\b(20\\d\\d)\\b/);
                const yearStr = yearMatch ? ` ${yearMatch[1]}` : ` ${new Date().getFullYear()}`;
                input.value = `${namePrefix}${yearStr}`;
                input.focus();
                input.select();
            }
        }

        function editExamNameInSubview(examName) {
            const selectTarget = document.getElementById('subview-exam-name-select-target');
            if (selectTarget) {
                selectTarget.value = examName;
                onSubviewTargetExamSelect(examName);
            }
            const input = document.getElementById('subview-exam-name-input');
            if (input) {
                input.focus();
                input.select();
            }
            const formCard = document.getElementById('subview-update-exam-form');
            if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function resetExamNamesSubviewForm() {
            const form = document.getElementById('subview-update-exam-form');
            if (form) form.reset();
            const selectTarget = document.getElementById('subview-exam-name-select-target');
            if (selectTarget && selectTarget.options.length > 1) {
                selectTarget.selectedIndex = 1;
                onSubviewTargetExamSelect(selectTarget.value);
            }
        }

        function saveUpdatedExamNameFromSubview(event) {
            if (event) event.preventDefault();
            const selectTarget = document.getElementById('subview-exam-name-select-target');
            const input = document.getElementById('subview-exam-name-input');
            const syncCheckbox = document.getElementById('subview-sync-schedules-checkbox');

            const oldName = selectTarget ? selectTarget.value.trim() : '';
            const newName = input ? input.value.trim() : '';

            if (!newName) {
                alert("অনুগ্রহ করে পরীক্ষার নাম লিখুন (Please enter an Exam Name)!");
                if (input) input.focus();
                return;
            }

            let types = loadExamTypes();
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

            // Refresh UI across all components
            populateExamDropdowns();
            const scheduleSelect = document.getElementById('schedule-exam-name');
            if (scheduleSelect) {
                scheduleSelect.value = newName;
                if (typeof previousValidScheduleExamName !== 'undefined') {
                    previousValidScheduleExamName = newName;
                }
            }
            populateScheduleExamTypesDropdown();
            renderExamTypes();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();

            renderExamNamesSubView();

            if (oldName && oldName !== newName) {
                alert(`✅ পরীক্ষার নাম সফলভাবে আপডেট করা হয়েছে!\\n"${oldName}" ➔ "${newName}"`);
            } else {
                alert(`✅ পরীক্ষার নাম সফলভাবে সংরক্ষিত হয়েছে: "${newName}"`);
            }
        }

        function saveNewExamNameFromSubview() {
            const input = document.getElementById('subview-exam-name-input');
            const name = input ? input.value.trim() : '';

            if (!name) {
                alert("অনুগ্রহ করে পরীক্ষার নাম লিখুন (Please enter an Examination Name)!");
                if (input) input.focus();
                return;
            }

            const types = loadExamTypes();
            const duplicate = types.find(t => t.name.toLowerCase() === name.toLowerCase());
            if (duplicate) {
                alert(`"${name}" নামের একটি পরীক্ষা ইতিমধ্যে তালিকায় বিদ্যমান আছে!`);
                return;
            }

            // Determine category from name
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

            populateExamDropdowns();
            const schedSelect = document.getElementById('schedule-exam-name');
            if (schedSelect) {
                schedSelect.value = name;
                if (typeof previousValidScheduleExamName !== 'undefined') {
                    previousValidScheduleExamName = name;
                }
            }
            populateScheduleExamTypesDropdown();
            renderExamTypes();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
            if (typeof updateScheduleDistLivePreview === 'function') updateScheduleDistLivePreview();

            renderExamNamesSubView();
            alert(`✅ নতুন পরীক্ষার নাম "${name}" সফলভাবে যুক্ত হয়েছে!`);
        }

        function deleteExamNameInSubview(examName) {
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
            renderExamNamesSubView();
            populateExamDropdowns();
            renderExamTypes();
            if (typeof renderScheduleList === 'function') renderScheduleList();
            if (typeof renderDashboardRoutineSummary === 'function') renderDashboardRoutineSummary();
        }

        function filterExamNamesInSubview() {
            const query = (document.getElementById('subview-exam-names-search-input')?.value || '').toLowerCase().trim();
            const rows = document.querySelectorAll('#subview-exam-names-tbody tr.exam-name-row');
            rows.forEach(row => {
                const text = (row.querySelector('.exam-name-text')?.textContent || '').toLowerCase();
                if (!query || text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        function useExamNameInSchedule(examName) {
            navigateExamView('exam-entry');
            const formCard = document.getElementById('create-schedule-card');
            if (formCard && formCard.style.display === 'none') {
                if (typeof toggleCreateScheduleForm === 'function') {
                    toggleCreateScheduleForm();
                }
            }
            const scheduleSelect = document.getElementById('schedule-exam-name');
            if (scheduleSelect) {
                scheduleSelect.value = examName;
                if (typeof populateScheduleExamTypesDropdown === 'function') {
                    populateScheduleExamTypesDropdown();
                }
            }
            setTimeout(() => {
                const targetEl = document.getElementById('create-schedule-card');
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }

        '''

    content = content.replace(target_js_anchor, subview_js_controllers + '\n        ' + target_js_anchor, 1)
    print("[OK] Added JavaScript controllers for Exam Names subview")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("[SUCCESS] exam-portal.html updated with Exam Names subview successfully!")
    return True

if __name__ == '__main__':
    update_portal_subview()

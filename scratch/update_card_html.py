import os
import re

def main():
    file_path = 'exam-portal.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Target the HTML of create-schedule-card
    old_html_pattern = re.compile(
        r'<div class="glass-card" id="create-schedule-card"[\s\S]*?<!-- Dynamic Filters Grid & Status Filter Bar',
        re.DOTALL
    )

    new_html_block = '''<div class="glass-card" id="create-schedule-card"
                        style="display: none; position: relative; background: #ffffff !important; color: #0f172a; border: 1.5px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07); border-radius: 16px; padding: 22px 26px;">
                        
                        <!-- Top Header: Title, Mode Switcher & Close Button -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                                <h3 class="portal-form-title" style="margin-bottom:0; color: #1e40af; font-weight: 800; font-family: 'Outfit', 'Noto Rashi Hebrew', 'Tiro Bangla', sans-serif; font-size: 1.38rem;">Create Exam Schedule</h3>
                                
                                <!-- Mode Switcher: Single Subject vs Multiple Subjects -->
                                <div id="schedule-mode-switcher" style="display: inline-flex; background: #f1f5f9; border-radius: 24px; padding: 3px; border: 1.5px solid #cbd5e1;">
                                    <button type="button" id="btn-schedule-mode-single" onclick="setScheduleCreationMode('single')"
                                        style="padding: 6px 16px; border-radius: 20px; border: none; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s ease; background: #2563eb; color: #ffffff; box-shadow: 0 2px 8px rgba(37,99,235,0.25);">
                                        📝 একটি বিষয় (Single Subject)
                                    </button>
                                    <button type="button" id="btn-schedule-mode-bulk" onclick="setScheduleCreationMode('bulk')"
                                        style="padding: 6px 16px; border-radius: 20px; border: none; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s ease; background: transparent; color: #475569;">
                                        📚 একসাথে একাধিক বিষয় (Multiple Subjects)
                                    </button>
                                </div>
                            </div>

                            <button type="button" class="btn-danger" onclick="toggleCreateScheduleForm()"
                                style="background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.94rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                <span>Close</span>
                            </button>
                        </div>

                        <!-- Hidden Edit ID & Mode -->
                        <input type="hidden" id="schedule-edit-id">
                        <input type="hidden" id="schedule-creation-mode" value="single">
                        
                        <!-- Common Settings: Class, Sections, Exam Name, Exam Type -->
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 14px;">
                            <!-- 1. Class -->
                            <div class="form-group" style="margin-bottom: 0;">
                                <label for="schedule-class" style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Class:</label>
                                <select id="schedule-class" class="form-control"
                                    style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 1rem; margin-bottom: 0; width: 100%; padding: 9px 13px; border-radius: 8px;"
                                    onchange="updateScheduleClassDependencies()" required></select>
                            </div>

                            <!-- 2. Sections -->
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="display:block; margin-bottom:6px; color: #334155; font-weight: 700; font-size: 1rem;">Sections:</label>
                                <div id="schedule-sections-container"
                                    style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; min-height:44px; padding: 5px 12px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem;">
                                    <!-- Dynamic multi-select checkboxes populated here -->
                                </div>
                            </div>

                            <!-- 3. Exam Name -->
                            <div class="form-group" style="margin-bottom: 0;">
                                <label for="schedule-exam-name" style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Exam Name:</label>
                                <select id="schedule-exam-name" class="form-control"
                                    style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 1rem; margin-bottom: 0; width: 100%; padding: 9px 13px; border-radius: 8px;"
                                    onchange="populateScheduleExamTypesDropdown(); autoCalculateScheduleExamNo(); updateScheduleDistLivePreview(); onScheduleExamNameChangedInBulk();" required>
                                    <option value="Half-Yearly Examination 2026">Half-Yearly Examination 2026</option>
                                    <option value="Annual Examination 2026">Annual Examination 2026</option>
                                    <option value="First Term Exam 2026">First Term Exam 2026</option>
                                </select>
                            </div>

                            <!-- 4. Exam Type (পরীক্ষার ধরন / নাম): -->
                            <div class="form-group" style="margin-bottom: 0;">
                                <label for="schedule-exam-type" style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Exam Type (পরীক্ষার ধরন / নাম):</label>
                                <select id="schedule-exam-type" class="form-control"
                                    style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 1rem; margin-bottom: 0; width: 100%; padding: 9px 13px; border-radius: 8px;"
                                    onchange="autoCalculateScheduleExamNo(); updateScheduleDistLivePreview(); onScheduleExamTypeChangedInBulk();" required></select>
                            </div>
                        </div>

                        <!-- PANEL 1: SINGLE SUBJECT MODE -->
                        <div id="single-subject-mode-container" style="display: block;">
                            <form id="exam-schedule-form" onsubmit="saveExamSchedule(event)">
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
                                    <!-- 5. Subject -->
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="schedule-subject" style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Subject:</label>
                                        <select id="schedule-subject" class="form-control"
                                            style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 1rem; margin-bottom: 0; width: 100%; padding: 9px 13px; border-radius: 8px;"
                                            onchange="autoCalculateScheduleExamNo(); updateScheduleDistLivePreview();"></select>
                                    </div>

                                    <!-- 6. Exam Date -->
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="schedule-date" style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Exam Date:</label>
                                        <input type="text" id="schedule-date" class="form-control" placeholder="dd/mm/yyyy"
                                            style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 1rem; margin-bottom: 0; width: 100%; padding: 9px 13px; border-radius: 8px;">
                                    </div>

                                    <!-- 7. Teacher Name -->
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="schedule-teacher" style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Teacher Name:</label>
                                        <select id="schedule-teacher" class="form-control"
                                            style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 1rem; margin-bottom: 0; width: 100%; padding: 9px 13px; border-radius: 8px;"></select>
                                    </div>

                                    <!-- 8. Exam No -->
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="schedule-sl-no" style="color: #334155; font-weight: 700; display: block; margin-bottom: 6px; font-size: 1rem;">Exam No:</label>
                                        <input type="text" id="schedule-sl-no" class="form-control"
                                            placeholder="Enter Exam No"
                                            style="background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 1rem; margin-bottom: 0; width: 100%; padding: 9px 13px; border-radius: 8px;">
                                    </div>

                                    <!-- Live Distribution Preview -->
                                    <div id="schedule-dist-live-preview" style="grid-column: 1 / -1; background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 9px 14px; font-size: 0.94rem; color: #166534; font-weight: 600; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span style="font-size:1.05rem;">⚙️</span>
                                            <span>নম্বর বণ্টন:</span>
                                            <span id="schedule-dist-preview-text" style="color:#0f172a; font-weight:700;">CQ: 70 | MCQ: 30</span>
                                        </div>
                                        <div id="schedule-dist-preview-badges" style="display:flex; gap:6px; align-items:center;">
                                        </div>
                                    </div>
                                </div>

                                <div style="display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap;">
                                    <button type="submit" class="btn-primary"
                                        style="flex: 2; min-width: 180px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-weight: 700; font-size: 1.02rem; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25); padding: 11px 20px; border: none; cursor: pointer;">
                                        Save Schedule
                                    </button>
                                    <button type="button" class="btn-danger"
                                        style="flex: 1; min-width: 120px; background: #f1f5f9; border: 1.5px solid #cbd5e1; color: #475569; border-radius: 8px; font-weight: 700; font-size: 1.02rem; cursor: pointer; padding: 11px 20px;"
                                        onclick="toggleCreateScheduleForm()">
                                        Close
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- PANEL 2: MULTIPLE / BULK SUBJECTS MODE -->
                        <div id="bulk-subjects-mode-container" style="display: none;">
                            <!-- Bulk Quick Controls Bar -->
                            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="font-size: 0.98rem; font-weight: 700; color: #1e40af; display: inline-flex; align-items: center; gap: 6px;">
                                            ⚡ কুইক অ্যাকশন ও অটো-ফিল (Quick Controls):
                                        </span>
                                        <span id="bulk-selected-badge" style="background: #dbeafe; color: #1e40af; font-size: 0.85rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; border: 1px solid #bfdbfe;">
                                            (০ টি বিষয় নির্বাচিত)
                                        </span>
                                    </div>
                                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                        <button type="button" onclick="toggleAllBulkSubjects(true)"
                                            style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 5px 12px; border-radius: 6px; font-weight: 700; font-size: 0.84rem; cursor: pointer;">
                                            ✓ সব সিলেক্ট (Select All)
                                        </button>
                                        <button type="button" onclick="toggleAllBulkSubjects(false)"
                                            style="background: #f8fafc; border: 1px solid #cbd5e1; color: #64748b; padding: 5px 12px; border-radius: 6px; font-weight: 700; font-size: 0.84rem; cursor: pointer;">
                                            ✕ আনসিলেক্ট (Deselect All)
                                        </button>
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; align-items: end;">
                                    <!-- Bulk Base Date -->
                                    <div>
                                        <label style="display: block; font-size: 0.88rem; font-weight: 700; color: #334155; margin-bottom: 4px;">মূল শুরুর তারিখ (Base Date):</label>
                                        <div style="display: flex; gap: 6px;">
                                            <input type="text" id="bulk-base-date" class="form-control" placeholder="dd/mm/yyyy"
                                                style="background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 0.94rem; width: 100%; padding: 7px 10px; border-radius: 6px;">
                                            <button type="button" onclick="applyBulkDateToAllSelected(false)" title="সকল নির্বাচিত বিষয়ে একই তারিখ বসান"
                                                style="white-space:nowrap; background: #2563eb; color: #fff; border: none; border-radius: 6px; padding: 0 12px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
                                                একই তারিখ
                                            </button>
                                            <button type="button" onclick="applyBulkDateToAllSelected(true)" title="প্রতি বিষয়ে ১ দিন পর পর তারিখ সাজান"
                                                style="white-space:nowrap; background: #059669; color: #fff; border: none; border-radius: 6px; padding: 0 12px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
                                                +১ দিন পর পর
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Bulk Teacher -->
                                    <div>
                                        <label style="display: block; font-size: 0.88rem; font-weight: 700; color: #334155; margin-bottom: 4px;">ডিফল্ট শিক্ষক (Common Teacher):</label>
                                        <div style="display: flex; gap: 6px;">
                                            <select id="bulk-common-teacher" class="form-control"
                                                style="background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 0.94rem; width: 100%; padding: 7px 10px; border-radius: 6px;"></select>
                                            <button type="button" onclick="applyBulkTeacherToAllSelected()" title="সকল নির্বাচিত বিষয়ে এই শিক্ষক বসান"
                                                style="white-space:nowrap; background: #475569; color: #fff; border: none; border-radius: 6px; padding: 0 12px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
                                                সবার জন্য
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Subjects Table -->
                            <div style="max-height: 420px; overflow-y: auto; border: 1.5px solid #e2e8f0; border-radius: 10px; margin-bottom: 16px;">
                                <table class="modern-light-exam-table" style="margin-bottom: 0; font-size: 0.92rem;">
                                    <thead style="position: sticky; top: 0; z-index: 5; background: #f8fafc;">
                                        <tr>
                                            <th style="width: 5%; text-align: center;">
                                                <input type="checkbox" id="bulk-select-all-checkbox" checked onchange="toggleAllBulkSubjects(this.checked)" style="cursor: pointer; accent-color: #2563eb;">
                                            </th>
                                            <th style="width: 6%; text-align: center;">SL</th>
                                            <th style="width: 25%; text-align: left; padding-left: 12px;">Subject Name & Code</th>
                                            <th style="width: 20%; text-align: left; padding-left: 12px;">Exam Date</th>
                                            <th style="width: 24%; text-align: left; padding-left: 12px;">Teacher Name</th>
                                            <th style="width: 10%; text-align: center;">Exam No</th>
                                            <th style="width: 10%; text-align: center;">Distribution</th>
                                        </tr>
                                    </thead>
                                    <tbody id="bulk-subjects-table-tbody">
                                        <!-- Populated dynamically via JS -->
                                    </tbody>
                                </table>
                            </div>

                            <!-- Bulk Action Buttons -->
                            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                <button type="button" class="btn-primary" onclick="saveBulkExamSchedules()"
                                    style="flex: 2; min-width: 200px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-weight: 700; font-size: 1.05rem; border-radius: 8px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3); padding: 12px 22px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                        <polyline points="7 3 7 8 15 8"></polyline>
                                    </svg>
                                    <span id="bulk-submit-btn-text">Save All Schedules (সকল বিষয়ের শিডিউল সংরক্ষণ করুন)</span>
                                </button>
                                <button type="button" class="btn-danger"
                                    style="flex: 1; min-width: 120px; background: #f1f5f9; border: 1.5px solid #cbd5e1; color: #475569; border-radius: 8px; font-weight: 700; font-size: 1.02rem; cursor: pointer; padding: 12px 20px;"
                                    onclick="toggleCreateScheduleForm()">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>

                    <div id="exam-schedules-list-card">

                        <!-- Dynamic Filters Grid & Status Filter Bar'''

    if not old_html_pattern.search(content):
        print("[ERROR] Could not find create-schedule-card block to replace in HTML!")
        return False

    content = old_html_pattern.sub(new_html_block, content, count=1)
    print("[SUCCESS] Replaced create-schedule-card HTML structure.")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

if __name__ == '__main__':
    main()

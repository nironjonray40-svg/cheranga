import os
import glob

def update_all_navbars():
    workspace = 'c:/Users/niron/OneDrive/Desktop/Cheranga'
    
    # 1. Update exam-portal.html
    exam_portal_path = os.path.join(workspace, 'exam-portal.html')
    with open(exam_portal_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add to dropdown-menu in exam-portal.html
    target_li = '<li><a href="exam-portal?view=exam-entry">Exam List</a></li>'
    if target_li in content:
        new_li = target_li + '\n                        <li><a href="exam-portal?view=exam-names" onclick="if(typeof navigateExamView===\'function\'){ navigateExamView(\'exam-names\'); return false; }">Exam Names</a></li>'
        if 'exam-portal?view=exam-names' not in content[content.find(target_li):content.find(target_li)+400]:
            content = content.replace(target_li, new_li, 1)
            print("[OK] Added Exam Names to exam-portal.html dropdown-menu")
    else:
        print("[WARN] target_li not found in exam-portal.html")

    # Add Exam Names button in Exam List top header row
    target_header_row = '<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">\n                        <button id="toggle-exam-filter-btn"'
    if target_header_row not in content:
        # Try CRLF
        target_header_row = '<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">\r\n                        <button id="toggle-exam-filter-btn"'

    if target_header_row in content:
        exam_names_header_btn = '''<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <button id="nav-to-exam-names-btn" type="button" class="btn-secondary"
                            style="background:#eff6ff; border:1.5px solid #2563eb; box-shadow:0 2px 8px rgba(37,99,235,0.12); padding:9px 18px; border-radius:20px; font-weight:700; font-size:0.95rem; cursor:pointer; color:#2563eb; display:inline-flex; align-items:center; gap:7px; transition:all 0.25s ease;"
                            onclick="navigateExamView('exam-names')"
                            title="পরীক্ষার নামসমূহ আপডেট ও পরিচালনা করার সাব-অপশনে যান">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            <span>Exam Names</span>
                        </button>
                        <button id="toggle-exam-filter-btn"'''
        content = content.replace(target_header_row, exam_names_header_btn, 1)
        print("[OK] Added Exam Names button to Exam List top header row in exam-portal.html")
    else:
        print("[WARN] target_header_row not found in exam-portal.html")

    # Add Exam Names button in create-schedule-card header
    target_mode_switcher = '</div>\n                            </div>\n\n                            <button type="button" class="btn-danger" onclick="toggleCreateScheduleForm()"'
    if target_mode_switcher not in content:
        target_mode_switcher = '</div>\r\n                            </div>\r\n\r\n                            <button type="button" class="btn-danger" onclick="toggleCreateScheduleForm()"'

    if target_mode_switcher in content:
        new_mode_switcher = '''    <button type="button" onclick="navigateExamView('exam-names')"
                                        style="padding: 6px 14px; border-radius: 20px; border: 1.5px solid #2563eb; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s ease; background: #eff6ff; color: #2563eb; display: inline-flex; align-items: center; gap: 6px;"
                                        title="Exam Names সাব-প্যানেলে যান">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        <span>Exam Names সাব অপশন</span>
                                    </button>
                                </div>
                            </div>

                            <button type="button" class="btn-danger" onclick="toggleCreateScheduleForm()"'''
        content = content.replace(target_mode_switcher, new_mode_switcher, 1)
        print("[OK] Added Exam Names button to create-schedule-card header")
    else:
        print("[WARN] target_mode_switcher not found in exam-portal.html")

    with open(exam_portal_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # 2. Update other HTML files
    other_htmls = [
        'advance.html',
        'contact.html',
        'fees.html',
        'Money Collect.html',
        'others.html',
        'result-portal.html',
        'seat-plan.html',
        'staff.html',
        'student-portal.html'
    ]

    for fname in other_htmls:
        fpath = os.path.join(workspace, fname)
        if not os.path.exists(fpath):
            continue
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                c = f.read()
            if target_li in c:
                if 'exam-portal?view=exam-names' not in c:
                    new_item = target_li + '\n                        <li><a href="exam-portal?view=exam-names">Exam Names</a></li>'
                    c = c.replace(target_li, new_item, 1)
                    with open(fpath, 'w', encoding='utf-8') as f:
                        f.write(c)
                    print(f"[OK] Updated dropdown in {fname}")
                else:
                    print(f"[INFO] Already present in {fname}")
        except Exception as e:
            print(f"[ERROR] Updating {fname}: {e}")

    print("[SUCCESS] All files updated with Exam Names sub option!")

if __name__ == '__main__':
    update_all_navbars()

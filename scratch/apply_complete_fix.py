import re

# 1. Read existing exam-portal.html
with open('exam-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make backup just in case
with open('exam-portal.html.bak', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update CSS for OMR modals around line 1800
old_css = """    /* Modal Styling for View & Edit */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }"""

new_css = """    /* Modal Styling for View & Edit */
    #modalViewEdit.modal-overlay, #modalAnswerKey.modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(6px);
      z-index: 2500;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    #modalViewEdit.modal-overlay.active, #modalAnswerKey.modal-overlay.active {
      display: flex !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      visibility: visible !important;
    }

    #btnDownloadBlankOMR, #btnOpenKeyModal, #btnSaveToExamsApi {
      cursor: pointer !important;
      pointer-events: auto !important;
      position: relative;
      z-index: 2;
    }"""

assert old_css in html, "old_css not found!"
html = html.replace(old_css, new_css, 1)

# 3. Update the 3 header buttons
old_buttons = """      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <button type="button" id="btnDownloadBlankOMR" class="btn btn-omr" title="একটি পরিচ্ছন্ন ব্লাংক OMR শিট ডাউনলোড বা প্রিন্ট করুন">
          <i class="fa-solid fa-file-arrow-down"></i> ব্লাংক OMR শিট
        </button>
        <button type="button" id="btnOpenKeyModal" class="btn btn-outline" title="উত্তরপত্র (Answer Key) দেখুন বা পরিবর্তন করুন">
          <i class="fa-solid fa-key"></i> উত্তরপত্র সেটআপ
        </button>
        <button type="button" id="btnSaveToExamsApi" class="btn btn-outline" style="border-color: #10b981; color: #10b981;" onclick="saveOmrToExamsApi()" title="পরীক্ষার ফলাফল ডাটাবেজে সংরক্ষণ করুন">
          <i class="fa-solid fa-cloud-arrow-up"></i> পরীক্ষা সংরক্ষণ
        </button>
      </div>"""

new_buttons = """      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <button type="button" id="btnDownloadBlankOMR" class="btn btn-omr" onclick="handleBlankOmrClick()" title="একটি পরিচ্ছন্ন ব্লাংক OMR শিট ডাউনলোড বা প্রিন্ট করুন">
          <i class="fa-solid fa-file-arrow-down"></i> ব্লাংক OMR শিট
        </button>
        <button type="button" id="btnOpenKeyModal" class="btn btn-outline" onclick="openAnswerKeyModalDirect()" title="উত্তরপত্র (Answer Key) দেখুন বা পরিবর্তন করুন">
          <i class="fa-solid fa-key"></i> উত্তরপত্র সেটআপ
        </button>
        <button type="button" id="btnSaveToExamsApi" class="btn btn-outline" style="border-color: #10b981; color: #10b981;" onclick="saveOmrToExamsApi()" title="পরীক্ষার ফলাফল ডাটাবেজে সংরক্ষণ করুন">
          <i class="fa-solid fa-cloud-arrow-up"></i> পরীক্ষা সংরক্ষণ
        </button>
      </div>"""

assert old_buttons in html, "old_buttons not found!"
html = html.replace(old_buttons, new_buttons, 1)

# 4. Replace truncated modals with complete modals
with open('scratch/prepare_fix.py', 'r', encoding='utf-8') as f:
    text = f.read()
idx1 = text.find('complete_modals_html = """') + len('complete_modals_html = """')
idx2 = text.find('"""\n\nprint("Complete modals')
modals_html = text[idx1:idx2]

m_start = html.find('<!-- OMR READER MODALS -->')
m_end = html.find('<!-- ADD ACADEMIC SUBJECT MODAL -->')
assert m_start != -1 and m_end != -1, "Modal markers not found!"

html = html[:m_start] + modals_html + '\n\n    ' + html[m_end:]

# 5. Replace script with script_7_fixed.js
with open('scratch/script_7_fixed.js', 'r', encoding='utf-8') as f:
    fixed_script = f.read()

s_start = html.find('<script id="omr-reader-script">')
assert s_start != -1, "Script start marker not found!"
s_content_start = s_start + len('<script id="omr-reader-script">\n')
s_end = html.find('</script>', s_content_start)
assert s_end != -1, "Script end marker not found!"

html = html[:s_content_start] + fixed_script.strip() + '\n    ' + html[s_end:]

with open('exam-portal.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("exam-portal.html updated successfully!")

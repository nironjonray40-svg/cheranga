import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Read styles, script, and body
with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_style.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_body.html', 'r', encoding='utf-8') as f:
    body_content = f.read()

# Filter out global body, *, and navbar styles from css_content
# Replace `:root {` with `:root, #subview-omr-reader, #modalViewEdit, #modalAnswerKey {`
css_cleaned = css_content.replace(':root {', ':root, #subview-omr-reader, #modalViewEdit, #modalAnswerKey {')
css_cleaned = re.sub(r'(?:^|\n)\s*\*\s*\{[^}]*\}', '', css_cleaned)
css_cleaned = re.sub(r'(?:^|\n)\s*body\s*\{[^}]*\}', '', css_cleaned)

# Extract main content and modals from body_content
# 1. Main subview content:
# Extract everything inside <main class="app-main">...</main>
main_match = re.search(r'<main class="app-main">(.*?)</main>', body_content, re.DOTALL)
if not main_match:
    print("Could not find <main class=\"app-main\">")
    sys.exit(1)

subview_inner = main_match.group(1)

# Add a top header card inside the subview
top_header_card = '''
    <!-- OMR Header Bar -->
    <div class="omr-top-nav-card" style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.25rem 1.8rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 14px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #d91c84, #4f46e5); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; box-shadow: 0 4px 14px rgba(217, 28, 132, 0.35);">
          <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <div>
          <h2 style="margin: 0; font-size: 1.55rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 10px; font-family: 'Outfit', 'Hind Siliguri', sans-serif;">
            OMR মূল্যায়ন ও রেজাল্ট প্রসেসর
            <span style="font-size: 0.8rem; background: var(--omr-pink-light); color: var(--omr-pink); border: 1px solid rgba(217, 28, 132, 0.3); padding: 3px 10px; border-radius: 20px; font-weight: 700;">v2.5 PRO</span>
          </h2>
          <p style="margin: 2px 0 0 0; font-size: 0.88rem; color: var(--text-muted); font-weight: 500;">সহজ, নিখুঁত ও দ্রুততম ওএমআর পরীক্ষণ এবং রেজাল্ট শিট তৈরির আধুনিক সিস্টেম</p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <button type="button" id="btnDownloadBlankOMR" class="btn btn-omr" title="একটি পরিচ্ছন্ন ব্লাংক OMR শিট ডাউনলোড বা প্রিন্ট করুন">
          <i class="fa-solid fa-file-arrow-down"></i> ব্লাংক OMR শিট
        </button>
        <button type="button" id="btnOpenKeyModal" class="btn btn-outline" title="উত্তরপত্র (Answer Key) দেখুন বা পরিবর্তন করুন">
          <i class="fa-solid fa-key"></i> উত্তরপত্র সেটআপ
        </button>
        <button type="button" id="btnSaveToExamsApi" class="btn btn-outline" style="border-color: #10b981; color: #10b981;" onclick="saveOmrToExamsApi()" title="পরীক্ষার ফলাফল ডাটাবেজে সংরক্ষণ করুন">
          <i class="fa-solid fa-cloud-arrow-up"></i> পরীক্ষা সংরক্ষণ
        </button>
      </div>
    </div>
'''

final_subview_html = f'''
            <!-- SUB-VIEW 7: OMR READER (ওএমআর শিট মূল্যায়ন ও রেজাল্ট প্রসেসর) -->
            <div id="subview-omr-reader" class="portal-sub-view">
                {top_header_card}
                {subview_inner}
            </div>
'''

# 2. Extract Modals:
modal_edit_match = re.search(r'(<div class="modal-overlay" id="modalViewEdit">.*?</div>\s*</div>\s*</div>)', body_content, re.DOTALL)
modal_key_match = re.search(r'(<div class="modal-overlay" id="modalAnswerKey">.*?</div>\s*</div>\s*</div>)', body_content, re.DOTALL)

if not modal_edit_match or not modal_key_match:
    print("Could not find modals in omr_body.html")
    sys.exit(1)

modals_html = f'''
    <!-- OMR READER MODALS -->
    {modal_edit_match.group(1)}
    {modal_key_match.group(1)}
    <div class="toast-container" id="toastContainer"></div>
'''

# 3. Enhance JavaScript:
# Add downloadAnswerKeyTemplate, saveOmrToExamsApi, loadOmrFromExamsApi, initOmrReaderView
extra_js = '''
    // --- Additional Template Download Utilities ---
    window.downloadAnswerKeyTemplate = function(format) {
      if (format === 'xlsx') {
        try {
          const rows = [
            ['প্রশ্ন নং', 'সেট ক', 'সেট খ', 'সেট গ']
          ];
          for (let q = 1; q <= 30; q++) {
            rows.push([q, 'ক', 'খ', 'গ']);
          }
          const ws = XLSX.utils.aoa_to_sheet(rows);
          ws['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Answer_Key_Template');
          XLSX.writeFile(wb, 'OMR_Answer_Key_Template.xlsx');
          showToast('এক্সেল টেমপ্লেট সফলভাবে ডাউনলোড হয়েছে!', 'success', 'fa-file-excel');
        } catch(e) {
          console.error(e);
          showToast('টেমপ্লেট তৈরিতে ত্রুটি: ' + e.message, 'danger');
        }
      } else if (format === 'csv') {
        let csvContent = 'Question,Set_A,Set_B,Set_C\\n';
        for (let q = 1; q <= 30; q++) {
          csvContent += `${q},ক,খ,গ\\n`;
        }
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'OMR_Answer_Key_Template.csv';
        link.click();
        showToast('CSV টেমপ্লেট ডাউনলোড হয়েছে!', 'success', 'fa-file-csv');
      } else if (format === 'txt') {
        let txtContent = 'OMR 30 Questions Answer Key Template\\n------------------------------------\\n';
        for (let q = 1; q <= 30; q++) {
          txtContent += `${q}. ক\\n`;
        }
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'OMR_Answer_Key_Template.txt';
        link.click();
        showToast('TXT টেমপ্লেট ডাউনলোড হয়েছে!', 'success', 'fa-file-lines');
      }
    };

    // --- ERP Exam API Integration (Persistence) ---
    window.saveOmrToExamsApi = async function() {
      if (!state.students || state.students.length === 0) {
        showToast('সংরক্ষণ করার মতো কোনো শিক্ষার্থীর ফলাফল নেই', 'warning');
        return;
      }
      
      const examNamePrompt = prompt('পরীক্ষার নাম বা কোড লিখুন:', 'OMR পরীক্ষা ' + new Date().toLocaleDateString('bn-BD'));
      if (!examNamePrompt) return;
      
      const examRecord = {
        id: String(Date.now()),
        examName: examNamePrompt,
        date: new Date().toLocaleDateString('bn-BD'),
        totalStudents: state.students.length,
        students: state.students,
        answerKeys: state.answerKeys
      };
      
      try {
        let currentExams = [];
        try {
          const getRes = await fetch('/api/exams');
          if (getRes.ok) currentExams = await getRes.json();
        } catch(e) {}
        
        if (!Array.isArray(currentExams)) currentExams = [];
        currentExams.unshift(examRecord);
        
        const saveRes = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentExams)
        });
        
        if (saveRes.ok) {
          showToast('পরীক্ষার ফলাফল সার্ভারে সফলভাবে সংরক্ষিত হয়েছে!', 'success', 'fa-cloud-arrow-up');
        } else {
          localStorage.setItem('school_omr_exams', JSON.stringify(currentExams));
          showToast('ফলাফল লোকাল মেমরিতে সংরক্ষিত হয়েছে', 'info');
        }
      } catch(err) {
        localStorage.setItem('school_omr_exams', JSON.stringify([examRecord]));
        showToast('ফলাফল লোকাল মেমরিতে ব্যাকআপ করা হয়েছে', 'info');
      }
    };

    window.loadOmrFromExamsApi = async function() {
      try {
        const res = await fetch('/api/exams');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const latest = data[0];
            if (latest.students && latest.students.length > 0) {
              state.students = latest.students;
              if (latest.answerKeys) {
                state.answerKeys = latest.answerKeys;
              }
              renderResultsTable();
              updateStatistics();
              btnExportExcel.disabled = false;
              btnPrintTable.disabled = false;
              renderAnswerKeyBubbles();
              showToast(`সংরক্ষিত পরীক্ষা "${latest.examName || latest.id}" (${toBengaliNumber(latest.students.length)} জন) সফলভাবে লোড হয়েছে!`, 'success', 'fa-check');
              return true;
            }
          }
        }
      } catch(e) {
        console.warn('Could not auto-load exams:', e);
      }
      return false;
    };

    // Subview Lifecycle Initializer
    window.initOmrReaderView = function() {
      if (state.students.length === 0) {
        loadOmrFromExamsApi();
      }
    };
'''

# Safe attachment of theme toggle button if exists
full_omr_script = f'''
    <!-- OMR READER APPLICATION LOGIC -->
    <script id="omr-reader-script">
    (function() {{
{js_content}
{extra_js}
    }})();
    </script>
'''

# Read current exam-portal.html
ep_path = r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html'
with open(ep_path, 'r', encoding='utf-8') as f:
    ep_content = f.read()

# 1. Insert CSS before </style> in <head>
# First </style> in file is in <head>
first_style_end = ep_content.find('</style>')
if first_style_end != -1 and 'omr-top-nav-card' not in ep_content:
    ep_content = ep_content[:first_style_end] + '\n/* === OMR READER STYLES === */\n' + css_cleaned + '\n' + ep_content[first_style_end:]
    print("[1] Injected OMR CSS into <head><style>")
else:
    print("[!] CSS already injected or </style> not found")

# 2. Insert subview before </section>\n\n    </main>
subview_target = '</section>\n\n    </main>'
if subview_target in ep_content and 'id="subview-omr-reader"' not in ep_content:
    ep_content = ep_content.replace(subview_target, final_subview_html + '\n        ' + subview_target, 1)
    print("[2] Injected subview-omr-reader")
else:
    # Try alternative spacing
    subview_target_alt = '</section>\r\n\r\n    </main>'
    if subview_target_alt in ep_content and 'id="subview-omr-reader"' not in ep_content:
        ep_content = ep_content.replace(subview_target_alt, final_subview_html + '\r\n        ' + subview_target_alt, 1)
        print("[2] Injected subview-omr-reader (CRLF)")
    else:
        print("[!] Target for subview not found or already present")

# 3. Insert modals after </footer>
footer_target = '</footer>'
if footer_target in ep_content and 'id="modalViewEdit"' not in ep_content:
    ep_content = ep_content.replace(footer_target, footer_target + '\n' + modals_html, 1)
    print("[3] Injected OMR modals after </footer>")
else:
    print("[!] Target for modals not found or already present")

# 4. Insert script before </body> (the final one)
final_body_pos = ep_content.rfind('</body>')
if final_body_pos != -1 and 'omr-reader-script' not in ep_content:
    ep_content = ep_content[:final_body_pos] + full_omr_script + '\n' + ep_content[final_body_pos:]
    print("[4] Injected OMR script before </body>")
else:
    print("[!] Target for script not found or already present")

with open(ep_path, 'w', encoding='utf-8') as f:
    f.write(ep_content)

print("Integration complete! Saved exam-portal.html.")

import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

ep_path = r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html'
with open(ep_path, 'r', encoding='utf-8') as f:
    ep_content = f.read()

# Make backup
with open(ep_path + '.bak', 'w', encoding='utf-8') as f:
    f.write(ep_content)
print("Backup created at exam-portal.html.bak")

# 1. Add FontAwesome & Confetti in <head>
head_marker = '<link rel="stylesheet" href="style.css?v=5.0">'
head_additions = '''<link rel="stylesheet" href="style.css?v=5.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>'''
if head_marker in ep_content and 'font-awesome/6.5.1' not in ep_content:
    ep_content = ep_content.replace(head_marker, head_additions, 1)
    print("[1] Added FontAwesome and Confetti to <head>")

# 2. Add OMR button in .sub-nav-tabs
tab_marker = '<button class="sub-tab-btn" id="btn-tab-sms" onclick="navigateExamView(\'sms\')">SMS Center</button>'
tab_addition = tab_marker + '\n                <button class="sub-tab-btn" id="btn-tab-omr-reader" onclick="navigateExamView(\'omr-reader\')">Omr Reder</button>'
if tab_marker in ep_content and 'btn-tab-omr-reader' not in ep_content:
    ep_content = ep_content.replace(tab_marker, tab_addition, 1)
    print("[2] Added Omr Reder button to sub-nav-tabs")

# 3. Add Quick Nav Card in Dashboard quick-nav-grid
card_marker = '''                    <div class="quick-nav-card" onclick="navigateExamView('sms')">
                        <div class="quick-nav-icon" style="color:var(--neon-green);">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                                <path
                                    d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                            </svg>
                        </div>
                        <h4>SMS Center</h4>
                        <p>Notify guardians in real-time</p>
                    </div>'''
card_addition = card_marker + '''
                    <div class="quick-nav-card" onclick="navigateExamView('omr-reader')">
                        <div class="quick-nav-icon" style="color: #ec4899;">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        </div>
                        <h4>Omr Reder</h4>
                        <p>ওএমআর শিট মূল্যায়ন ও রেজাল্ট প্রসেসর</p>
                    </div>'''
if card_marker in ep_content and 'Omr Reder</h4>' not in ep_content:
    ep_content = ep_content.replace(card_marker, card_addition, 1)
    print("[3] Added Omr Reder quick-nav card")

# 4. Add switchExamView case
switch_marker = '''            } else if (viewName === 'exam-types') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                populateOverrideSubjectsDropdown();
                resetExamTypeForm();
                renderExamTypes();
            }'''
switch_addition = switch_marker + ''' else if (viewName === 'omr-reader') {
                if (titleWrapper) titleWrapper.style.display = 'none';
                if (typeof initOmrReaderView === 'function') {
                    initOmrReaderView();
                }
            }'''
if switch_marker in ep_content and 'viewName === \'omr-reader\'' not in ep_content:
    ep_content = ep_content.replace(switch_marker, switch_addition, 1)
    print("[4] Added omr-reader to switchExamView")

with open(ep_path, 'w', encoding='utf-8') as f:
    f.write(ep_content)

print("Base navigation updates applied successfully!")

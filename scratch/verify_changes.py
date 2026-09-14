import os
import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== Running Verification Checks ===")
errors = 0

# Check exam-portal.html
with open('exam-portal.html', 'r', encoding='utf-8') as f:
    ep = f.read()

if 'params.get(\'view\') || \'exam-entry\'' not in ep:
    print("[FAIL] exam-portal.html does not default to exam-entry")
    errors += 1
else:
    print("[PASS] exam-portal.html checkURLParameters defaults to exam-entry")

if '<button class="sub-tab-btn active" id="btn-tab-exam-entry" onclick="navigateExamView(\'exam-entry\')">Exam\n                    List</button>' not in ep:
    print("[FAIL] btn-tab-exam-entry not active or text not Exam List")
    errors += 1
else:
    print("[PASS] Sub-nav tab has active class and 'Exam List' label")

if '<div id="subview-exam-entry" class="portal-sub-view active">' not in ep:
    print("[FAIL] subview-exam-entry not active by default")
    errors += 1
else:
    print("[PASS] subview-exam-entry is active by default")

# Check all navbar dropdowns
html_files = [
    'Home.html', 'index.html', 'notice-board.html', 'student-portal.html',
    'staff.html', 'seat-plan.html', 'result-portal.html', 'fees.html',
    'others.html', 'Money Collect.html', 'contact.html', 'advance.html',
    'exam-portal.html'
]

for f in html_files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    if 'data-tab="exam-portal"' in c:
        if 'view=exam-entry' not in c:
            print(f"[FAIL] {f} does not link Exam Portal to view=exam-entry")
            errors += 1
        elif 'Exam List' not in c:
            print(f"[FAIL] {f} dropdown does not show Exam List")
            errors += 1
        else:
            print(f"[PASS] {f} navbar correctly links Exam Portal to Exam List")

# Check main.js
with open('main.js', 'r', encoding='utf-8') as f:
    mjs = f.read()
if "onclick=\"window.location.href='exam-portal.html?view=exam-entry'\"" not in mjs:
    print("[FAIL] main.js quick card does not link to exam-portal.html?view=exam-entry")
    errors += 1
else:
    print("[PASS] main.js quick card links to exam-portal.html?view=exam-entry")

if errors == 0:
    print("\nALL 15 VERIFICATION CHECKS PASSED PERFECTLY!")
else:
    print(f"\n{errors} ERRORS DETECTED!")

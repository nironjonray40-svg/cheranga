import os
import re

def update_file(filename, old_str, new_str, allow_multiple=False):
    if not os.path.exists(filename):
        print(f"[ERROR] File {filename} does not exist!")
        return False
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str not in content:
        print(f"[ERROR] Target string not found in {filename}!")
        return False
    count = content.count(old_str)
    if count > 1 and not allow_multiple:
        print(f"[ERROR] Multiple occurrences ({count}) of target string in {filename}!")
        return False
    new_content = content.replace(old_str, new_str)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"[SUCCESS] Updated {filename} ({count} occurrence(s))")
    return True

print("=== 1. Updating exam-portal.html ===")
# Update tabs and default subview classes
old_tabs = '''            <!-- Page Sub-navigation Tabs -->
            <div class="sub-nav-tabs">
                <button class="sub-tab-btn active" id="btn-tab-dashboard"
                    onclick="navigateExamView('dashboard')">Dashboard</button>
                <button class="sub-tab-btn" id="btn-tab-exam-entry" onclick="navigateExamView('exam-entry')">Exam
                    Entry</button>'''

new_tabs = '''            <!-- Page Sub-navigation Tabs -->
            <div class="sub-nav-tabs">
                <button class="sub-tab-btn" id="btn-tab-dashboard"
                    onclick="navigateExamView('dashboard')">Dashboard</button>
                <button class="sub-tab-btn active" id="btn-tab-exam-entry" onclick="navigateExamView('exam-entry')">Exam
                    List</button>'''

update_file('exam-portal.html', old_tabs, new_tabs)

# Subview 0 dashboard -> not active
update_file('exam-portal.html', '<div id="subview-dashboard" class="portal-sub-view active">', '<div id="subview-dashboard" class="portal-sub-view">')

# Subview 1 exam-entry -> active
update_file('exam-portal.html', '<div id="subview-exam-entry" class="portal-sub-view">', '<div id="subview-exam-entry" class="portal-sub-view active">')

# Quick nav card title: <h4>Exam Entry</h4> -> <h4>Exam List</h4>
old_card = '''                        <h4>Exam Entry</h4>
                        <p>Manage exam schedules & routines</p>'''
new_card = '''                        <h4>Exam List</h4>
                        <p>Manage exam schedules & routines</p>'''
update_file('exam-portal.html', old_card, new_card)

# checkURLParameters, navigateExamView, switchExamView in exam-portal.html
old_router = '''        // --- SUBVIEWS ROUTING MECHANISM ---
        function checkURLParameters() {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view') || 'dashboard';
            switchExamView(view);
        }

        function navigateExamView(viewName) {
            window.history.pushState({ view: viewName }, '', '?view=' + viewName);
            switchExamView(viewName);
        }

        function switchExamView(viewName) {'''

new_router = '''        // --- SUBVIEWS ROUTING MECHANISM ---
        function checkURLParameters() {
            const params = new URLSearchParams(window.location.search);
            let view = params.get('view') || 'exam-entry';
            if (view === 'exam-list') view = 'exam-entry';
            switchExamView(view);
        }

        function navigateExamView(viewName) {
            if (viewName === 'exam-list') viewName = 'exam-entry';
            window.history.pushState({ view: viewName }, '', '?view=' + viewName);
            switchExamView(viewName);
        }

        function switchExamView(viewName) {
            if (viewName === 'exam-list') viewName = 'exam-entry';'''

update_file('exam-portal.html', old_router, new_router)

# dbSynced in exam-portal.html
old_synced = '''        // Listen to Database Sync from Server (Periodic sync)
        window.addEventListener('dbSynced', () => {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view') || 'dashboard';'''

new_synced = '''        // Listen to Database Sync from Server (Periodic sync)
        window.addEventListener('dbSynced', () => {
            const params = new URLSearchParams(window.location.search);
            let view = params.get('view') || 'exam-entry';
            if (view === 'exam-list') view = 'exam-entry';'''

update_file('exam-portal.html', old_synced, new_synced)

print("\n=== 2. Updating Navbars Across HTML Files ===")

# Files with .html in urls (Home.html, index.html, notice-board.html)
dot_html_files = ['Home.html', 'index.html', 'notice-board.html']
old_dot_html_nav = '''                <li class="nav-item dropdown" data-tab="exam-portal">
                    <a href="exam-portal.html">Exam Portal</a>
                    <ul class="dropdown-menu">
                        <li><a href="exam-portal.html?view=exam-entry">Exam Entry</a></li>'''

new_dot_html_nav = '''                <li class="nav-item dropdown" data-tab="exam-portal">
                    <a href="exam-portal.html?view=exam-entry">Exam Portal</a>
                    <ul class="dropdown-menu">
                        <li><a href="exam-portal.html?view=exam-entry">Exam List</a></li>'''

for f in dot_html_files:
    update_file(f, old_dot_html_nav, new_dot_html_nav)

# Files with extensionless urls
extensionless_files = [
    'student-portal.html',
    'staff.html',
    'seat-plan.html',
    'result-portal.html',
    'fees.html',
    'others.html',
    'Money Collect.html',
    'contact.html',
    'advance.html'
]

old_extless_nav = '''                <li class="nav-item dropdown" data-tab="exam-portal">
                    <a href="exam-portal">Exam Portal</a>
                    <ul class="dropdown-menu">
                        <li><a href="exam-portal?view=exam-entry">Exam Entry</a></li>'''

new_extless_nav = '''                <li class="nav-item dropdown" data-tab="exam-portal">
                    <a href="exam-portal?view=exam-entry">Exam Portal</a>
                    <ul class="dropdown-menu">
                        <li><a href="exam-portal?view=exam-entry">Exam List</a></li>'''

for f in extensionless_files:
    update_file(f, old_extless_nav, new_extless_nav)

# exam-portal.html navbar (which has class="nav-item dropdown active")
old_exam_portal_nav = '''                <li class="nav-item dropdown active" data-tab="exam-portal">
                    <a href="exam-portal">Exam Portal</a>
                    <ul class="dropdown-menu">
                        <li><a href="exam-portal?view=exam-entry">Exam Entry</a></li>'''

new_exam_portal_nav = '''                <li class="nav-item dropdown active" data-tab="exam-portal">
                    <a href="exam-portal?view=exam-entry">Exam Portal</a>
                    <ul class="dropdown-menu">
                        <li><a href="exam-portal?view=exam-entry">Exam List</a></li>'''

update_file('exam-portal.html', old_exam_portal_nav, new_exam_portal_nav)

print("\n=== 3. Updating main.js ===")
old_main_card = '''                <!-- 4. Exam Portal -->
                <div onclick="window.location.href='exam-portal.html'" style="background:#1a113b; border:1px solid rgba(244,114,182,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">'''

new_main_card = '''                <!-- 4. Exam Portal -->
                <div onclick="window.location.href='exam-portal.html?view=exam-entry'" style="background:#1a113b; border:1px solid rgba(244,114,182,0.3); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.3s ease;">'''

update_file('main.js', old_main_card, new_main_card)

print("\n=== 4. Updating Tabulation Sheet.html ===")
old_tab_link = '<a href="exam-portal.html" class="grading-modal-btn-primary"'
new_tab_link = '<a href="exam-portal.html?view=marking-system" class="grading-modal-btn-primary"'
update_file('Tabulation Sheet.html', old_tab_link, new_tab_link)

print("\nAll updates completed successfully!")

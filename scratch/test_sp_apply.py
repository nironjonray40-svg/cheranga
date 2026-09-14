import io
import sys
import re

with open('student-portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update dropdown menu
dropdown_target = """                <li class="nav-item dropdown active" data-tab="student-portal">
                    <a href="student-portal.html?view=list">Student Portal</a>
                    <ul class="dropdown-menu">
                        <li><a href="student-portal.html?view=add">Add Student</a></li>
                        <li><a href="student-portal.html?view=list">Student List</a></li>
                        <li><a href="student-portal.html?view=promote">Promotion & Demotion</a></li>
                    </ul>
                </li>"""

dropdown_replacement = """                <li class="nav-item dropdown active" data-tab="student-portal">
                    <a href="student-portal.html?view=list">Student Portal</a>
                    <ul class="dropdown-menu">
                        <li><a href="student-portal.html?view=add">Add Student</a></li>
                        <li><a href="student-portal.html?view=list">Student List</a></li>
                        <li><a href="student-portal.html?view=online-admissions">Online Admissions (অনলাইন ভর্তি আবেদন)</a></li>
                        <li><a href="student-portal.html?view=promote">Promotion & Demotion</a></li>
                    </ul>
                </li>"""

assert dropdown_target in html, "Dropdown target not found"
html = html.replace(dropdown_target, dropdown_replacement, 1)

# 2. Add toolbar button to subview-list
btn_target = """                        <button id="btn-add-student-nav" class="btn-primary"
                            style="padding: 12px 20px; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; margin: 0; background: #16a34a; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 6px rgba(22,163,74,0.3);"
                            onclick="editingStudentId = null; resetAdmissionForm(); switchPortalView('add');"
                            title="নতুন শিক্ষার্থীর তথ্য এন্ট্রি ফরম খুলুন">
                            ➕ Add
                        </button>"""

btn_replacement = """                        <button id="btn-open-online-admissions-toolbar" class="btn-primary"
                            style="padding: 12px 18px; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; margin: 0; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(2,132,199,0.35);"
                            onclick="switchPortalView('online-admissions')"
                            title="CMS ওয়েবসাইট থেকে দাখিলকৃত অনলাইন ভর্তি আবেদনসমূহ দেখুন">
                            🎓 অনলাইন ভর্তি আবেদন (<span id="online-admission-badge-count-btn">০</span>)
                        </button>
                        <button id="btn-add-student-nav" class="btn-primary"
                            style="padding: 12px 20px; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; margin: 0; background: #16a34a; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 6px rgba(22,163,74,0.3);"
                            onclick="editingStudentId = null; resetAdmissionForm(); switchPortalView('add');"
                            title="নতুন শিক্ষার্থীর তথ্য এন্ট্রি ফরম খুলুন">
                            ➕ Add
                        </button>"""

assert btn_target in html, "Toolbar button target not found"
html = html.replace(btn_target, btn_replacement, 1)

print("Step 1 and 2 check passed!")

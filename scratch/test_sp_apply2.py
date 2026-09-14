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

# 3. Add subview-online-admissions right after subview-promote
subview_promote_end = """                            <tbody id="promote-list-rows">
                                <!-- Filled dynamically by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>"""

subview_online_admissions_html = """                            <tbody id="promote-list-rows">
                                <!-- Filled dynamically by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- SUB-VIEW 4: ONLINE ADMISSIONS (অনলাইন ভর্তি আবেদন তালিকা) -->
            <div id="subview-online-admissions" class="portal-sub-view"
                style="width: 100% !important; max-width: 100% !important; min-width: 100% !important; margin: 0 !important; padding: 0 !important; box-sizing: border-box !important;">
                <div class="glass-card">
                    <!-- Top Toolbar -->
                    <div class="list-controls" style="margin-top: 0.3in !important;">
                        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; width: 100%;">
                            <!-- Search -->
                            <div class="expandable-search-wrapper" style="display: flex; align-items: center; gap: 6px;">
                                <button type="button" id="btn-toggle-adm-search" class="btn-primary"
                                    style="padding: 12px 14px; font-size: 0.95rem; display: inline-flex; align-items: center; justify-content: center; margin: 0; background: #0284c7; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.3);"
                                    onclick="toggleAdmSearchInput()" title="Search">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                                        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </button>
                                <div id="adm-search-input-container" style="display: block;">
                                    <input type="text" id="adm-search-input" class="form-control"
                                        placeholder="Search by Tracking ID, Name, Phone, Birth Reg..."
                                        style="width: 280px; background: #ffffff; border: 1px solid #cbd5e1; color: #000000; font-weight: 500; padding: 11px 14px; margin: 0;"
                                        oninput="currentAdmPage=1; renderOnlineAdmissionsList()">
                                </div>
                            </div>

                            <!-- Class Filter Dropdown -->
                            <select id="adm-class-filter" class="form-control"
                                style="width: 145px; margin: 0; background: #ffffff; border: 1px solid #cbd5e1; color: #000000; font-weight: 600;"
                                onchange="currentAdmPage=1; renderOnlineAdmissionsList()">
                                <option value="">সকল শ্রেণি (All)</option>
                            </select>

                            <!-- Session Filter Dropdown -->
                            <select id="adm-session-filter" class="form-control"
                                style="width: 125px; margin: 0; background: #ffffff; border: 1px solid #cbd5e1; color: #000000; font-weight: 600;"
                                onchange="currentAdmPage=1; renderOnlineAdmissionsList()">
                                <option value="">সকল সেশন</option>
                                <option value="2026" selected>২০২৬ সেশন</option>
                                <option value="2025">২০২৫ সেশন</option>
                                <option value="2027">২০২৭ সেশন</option>
                            </select>

                            <!-- Status Filter Dropdown -->
                            <select id="adm-status-filter" class="form-control"
                                style="width: 145px; margin: 0; background: #ffffff; border: 1px solid #cbd5e1; color: #000000; font-weight: 600;"
                                onchange="currentAdmPage=1; renderOnlineAdmissionsList()">
                                <option value="">সকল অবস্থা (All)</option>
                                <option value="Submitted">অপেক্ষমাণ (Pending)</option>
                                <option value="Approved">অনুমোদিত (Approved)</option>
                                <option value="Admitted">ভর্তি নিশ্চিত (Admitted)</option>
                                <option value="Rejected">বাতিল (Rejected)</option>
                            </select>

                            <!-- Gender Filter Dropdown -->
                            <select id="adm-gender-filter" class="form-control"
                                style="width: 125px; margin: 0; background: #ffffff; border: 1px solid #cbd5e1; color: #000000; font-weight: 600;"
                                onchange="currentAdmPage=1; renderOnlineAdmissionsList()">
                                <option value="">সকল লিঙ্গ</option>
                                <option value="ছাত্র">ছাত্র (Male)</option>
                                <option value="ছাত্রী">ছাত্রী (Female)</option>
                            </select>

                            <!-- Action Buttons in Toolbar -->
                            <button class="btn-primary"
                                style="padding: 12px 18px; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; margin: 0; background: #0284c7; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
                                onclick="exportOnlineAdmissionsToExcel()" title="আবেদন তালিকা এক্সেল ফাইলে ডাউনলোড করুন">
                                📤 Export Excel
                            </button>

                            <button id="btn-adm-delete-selected" class="btn-danger"
                                style="display: none; padding: 12px 18px; font-size: 0.95rem; align-items: center; gap: 8px; margin: 0; background: #dc2626; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(220,38,38,0.35);"
                                onclick="deleteSelectedOnlineAdmissions()"
                                title="সিলেক্ট করা আবেদনসমূহ মুছে ফেলুন">
                                🗑 Delete Selected (<span id="adm-delete-selected-count">০</span>)
                            </button>

                            <button class="btn-primary"
                                style="padding: 12px 18px; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; margin: 0; background: #475569; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
                                onclick="switchPortalView('list')" title="মূল শিক্ষার্থী তালিকায় ফিরে যান">
                                ⬅️ Student List
                            </button>

                            <a href="cms.html#admission" target="_blank" class="btn-primary"
                                style="text-decoration: none; padding: 12px 18px; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; margin: 0; background: #16a34a; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 6px rgba(22,163,74,0.3);"
                                title="CMS ওয়েবসাইটে নতুন অনলাইন ভর্তি আবেদন ফরম খুলুন">
                                ➕ নতুন অনলাইন আবেদন
                            </a>
                        </div>
                    </div>

                    <!-- Summary Stats Counter Cards -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin: 16px 0;">
                        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1.5px solid #334155; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                                📑
                            </div>
                            <div>
                                <div style="color: #94a3b8; font-size: 0.82rem; font-weight: 600;">মোট অনলাইন আবেদন</div>
                                <div style="color: #ffffff; font-size: 1.4rem; font-weight: 800;" id="stat-adm-total">০</div>
                            </div>
                        </div>

                        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1.5px solid #334155; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(234, 179, 8, 0.15); color: #eab308; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                                ⏳
                            </div>
                            <div>
                                <div style="color: #94a3b8; font-size: 0.82rem; font-weight: 600;">অপেক্ষমাণ (Pending)</div>
                                <div style="color: #facc15; font-size: 1.4rem; font-weight: 800;" id="stat-adm-pending">০</div>
                            </div>
                        </div>

                        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1.5px solid #334155; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); color: #22c55e; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                                🟢
                            </div>
                            <div>
                                <div style="color: #94a3b8; font-size: 0.82rem; font-weight: 600;">ভর্তি সম্পন্ন / অনুমোদিত</div>
                                <div style="color: #4ade80; font-size: 1.4rem; font-weight: 800;" id="stat-adm-admitted">০</div>
                            </div>
                        </div>

                        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1.5px solid #334155; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                                🔴
                            </div>
                            <div>
                                <div style="color: #94a3b8; font-size: 0.82rem; font-weight: 600;">বাতিলকৃত (Rejected)</div>
                                <div style="color: #f87171; font-size: 1.4rem; font-weight: 800;" id="stat-adm-rejected">০</div>
                            </div>
                        </div>
                    </div>

                    <!-- Header Banner -->
                    <div class="student-section-header-banner">
                        <div class="student-section-header-title">
                            <span style="display:inline-flex; align-items:center; border-left: 4px solid #0284c7; padding-left: 10px; color: #0284c7 !important; font-weight: 800; font-size: 1.35rem;">অনলাইন ভর্তি আবেদন তালিকা</span>
                            <span class="title-badge">Online Admission Roster</span>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span style="color: #94a3b8; font-size: 0.88rem;">প্রতি পৃষ্ঠায়:</span>
                            <select id="adm-rows-per-page" class="form-control"
                                style="width: 80px; padding: 6px 8px; margin: 0; background: #ffffff; color: #000; border: 1px solid #cbd5e1; font-weight: 600;"
                                onchange="currentAdmPage=1; renderOnlineAdmissionsList()">
                                <option value="10">১০</option>
                                <option value="25" selected>২৫</option>
                                <option value="50">৫০</option>
                                <option value="100">১০০</option>
                                <option value="999999">সকল</option>
                            </select>
                        </div>
                    </div>

                    <!-- SaaS Data Table -->
                    <div class="student-table-wrapper">
                        <table class="student-list-table">
                            <thead>
                                <tr>
                                    <th style="width: 42px; text-align: center; padding: 10px 6px;">
                                        <input type="checkbox" id="select-all-admissions-chk"
                                            style="width: 17px; height: 17px; accent-color: #0284c7; cursor: pointer; vertical-align: middle;"
                                            title="সকল আবেদন একসাথে সিলেক্ট করুন"
                                            onchange="toggleSelectAllOnlineAdmissions(this.checked)">
                                    </th>
                                    <th style="width: 45px; text-align: center;">Sl</th>
                                    <th style="width: 140px; text-align: center;">Tracking ID & Date</th>
                                    <th style="width: 55px; text-align: center;">Photo</th>
                                    <th>Student Name & Target Class</th>
                                    <th>Guardian & Contact</th>
                                    <th>Birth Reg / DOB</th>
                                    <th>Address</th>
                                    <th style="width: 110px; text-align: center;">Status</th>
                                    <th style="text-align: center; width: 175px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="online-admission-list-rows">
                                <!-- Filled dynamically by JS -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination and Counts -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding: 0 4px; flex-wrap: wrap; gap: 12px;">
                        <div style="font-size: 0.90rem; color: #cbd5e1; font-weight: 600;" id="adm-pagination-info">
                            মোট ০ টি আবেদনের মধ্যে ০-০ দেখানো হচ্ছে
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center;" id="adm-pagination-controls">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>"""

assert subview_promote_end in html, "subview_promote_end target not found"
html = html.replace(subview_promote_end, subview_online_admissions_html, 1)

print("Step 3 check passed!")

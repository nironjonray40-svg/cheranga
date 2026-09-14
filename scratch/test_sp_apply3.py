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
                                    <th style="width: 115px; text-align: center;">Status</th>
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

# 4. Add Modals before </body>
modals_target = "</body>"
modals_html = """
    <!-- ========================================================================= -->
    <!-- ONLINE ADMISSION MODALS: DETAILS, ENROLL, EDIT & PRINT                    -->
    <!-- ========================================================================= -->

    <!-- 1. FULL DETAILS MODAL -->
    <div id="admission-details-modal" class="modal-overlay" onclick="closeOnlineAdmissionDetails()">
        <div class="modal-container" onclick="event.stopPropagation()"
            style="max-width: 900px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: #0f172a; border: 1.5px solid #334155; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #334155; padding-bottom: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        🎓
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff;" id="adm-modal-title">অনলাইন ভর্তি আবেদনপত্র — বিস্তারিত তথ্য</h3>
                        <p style="margin: 2px 0 0 0; font-size: 0.82rem; color: #94a3b8;" id="adm-modal-subtitle"></p>
                    </div>
                </div>
                <button type="button" class="modal-close-btn" onclick="closeOnlineAdmissionDetails()" style="color: #ffffff; background: none; border: none; font-size: 1.6rem; cursor: pointer;">×</button>
            </div>

            <div id="adm-modal-body" style="flex: 1; overflow-y: auto; padding-right: 6px;">
                <!-- Populated dynamically via openOnlineAdmissionDetails() -->
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1.5px solid #334155; padding-top: 14px; margin-top: 16px; flex-wrap: wrap; gap: 10px;" id="adm-modal-actions">
                <!-- Actions -->
            </div>
        </div>
    </div>

    <!-- 2. ENROLL / ADMIT STUDENT MODAL -->
    <div id="admission-enroll-modal" class="modal-overlay" onclick="closeEnrollModal()">
        <div class="modal-container" onclick="event.stopPropagation()"
            style="max-width: 580px; width: 92%; padding: 24px; border-radius: 14px; background: #0f172a; border: 1.5px solid #334155; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #334155; padding-bottom: 12px; margin-bottom: 18px;">
                <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #22c55e; display: flex; align-items: center; gap: 8px;">
                    🎓 শিক্ষার্থী ভর্তি নিশ্চিতকরণ ও রোল/আইডি প্রদান
                </h3>
                <button type="button" class="modal-close-btn" onclick="closeEnrollModal()" style="color: #fff; background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>

            <form id="admission-enroll-form" onsubmit="confirmEnrollStudent(event)">
                <input type="hidden" id="enroll-app-id">
                
                <div style="background: rgba(255,255,255,0.04); border: 1px solid #334155; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;">
                    <div style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;" id="enroll-student-name"></div>
                    <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 3px;" id="enroll-student-info"></div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                    <div class="form-group">
                        <label for="enroll-class" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">ভর্তি শ্রেণি (Class) *</label>
                        <select id="enroll-class" class="form-control" required style="background: #1e293b; color: #fff; border: 1px solid #475569;" onchange="handleEnrollClassChange()">
                            <!-- Options -->
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="enroll-section" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">শাখা (Section) *</label>
                        <select id="enroll-section" class="form-control" required style="background: #1e293b; color: #fff; border: 1px solid #475569;" onchange="generateEnrollAutoIdRoll()">
                            <option value="A">Section A</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                    <div class="form-group">
                        <label for="enroll-roll" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">শ্রেণি রোল (Roll No) *</label>
                        <input type="text" id="enroll-roll" class="form-control" required style="background: #1e293b; color: #fff; border: 1px solid #475569; font-weight: 700;">
                    </div>

                    <div class="form-group">
                        <label for="enroll-id" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">Student ID (আইডি) *</label>
                        <input type="text" id="enroll-id" class="form-control" required style="background: #1e293b; color: #fff; border: 1px solid #475569; font-weight: 700; font-family: monospace;">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="enroll-reg" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; display: block;">রেজিস্ট্রেশন নম্বর (Registration No)</label>
                    <input type="text" id="enroll-reg" class="form-control" style="background: #1e293b; color: #fff; border: 1px solid #475569;">
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" class="btn-outline-portal" onclick="closeEnrollModal()" style="padding: 10px 18px; border: 1px solid #475569; background: #334155; color: #fff; border-radius: 8px; cursor: pointer;">
                        বাতিল
                    </button>
                    <button type="submit" class="btn-primary" style="padding: 10px 24px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(22,163,74,0.4);">
                        ✅ ভর্তি সম্পন্ন করুন ও রোস্টারে যুক্ত করুন
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 3. HIDDEN PRINT VOUCHER CONTAINER -->
    <div id="admission-voucher-print-area" style="display: none;"></div>

</body>"""

assert modals_target in html, "</body> target not found"
html = html.replace(modals_target, modals_html, 1)

print("Step 4 Modals check passed!")

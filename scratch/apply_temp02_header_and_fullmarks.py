import sys
import re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS for institution-header, header-logo-box, and header-text-box
old_header_css = """        /* Top Header */
        .institution-header {
            position: relative;
            width: 100%;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
            margin-bottom: 10px;
            min-height: 72px;
        }
        .header-logo-box {
            width: 70px;
            height: 70px;
            position: absolute;
            left: 17mm;
            top: 16mm;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            user-select: none;
            touch-action: none;
            z-index: 1000;
            border-radius: 50%;
            transition: outline 0.15s, box-shadow 0.15s;
        }
        .header-logo-box:hover {
            outline: 2px dashed #0284c7;
            outline-offset: 3px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .header-logo-box.is-dragging {
            cursor: grabbing !important;
            opacity: 0.92;
            z-index: 99999 !important;
            outline: 2px solid #0284c7 !important;
            outline-offset: 3px;
            box-shadow: 0 10px 28px rgba(0,0,0,0.35) !important;
        }
        .header-logo-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
            pointer-events: none;
            display: block;
        }
        .header-logo-box svg {
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        .header-text-box {
            width: 100%;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0;
        }"""

new_header_css = """        /* Top Header */
        .institution-header {
            position: relative;
            width: 100%;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
            margin-bottom: 10px;
            min-height: 78px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .header-logo-box {
            width: 74px;
            height: 74px;
            position: absolute;
            left: 6px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 50%;
        }
        .header-logo-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
            display: block;
        }
        .header-logo-box svg {
            width: 100%;
            height: 100%;
        }
        .header-text-box {
            width: 100%;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0 82px;
            box-sizing: border-box;
        }"""

if old_header_css in content:
    content = content.replace(old_header_css, new_header_css, 1)
    print("1. Successfully updated Header CSS")
else:
    print("1. WARNING: old_header_css not found")

# 2. Put logo inside .institution-header in single certificate sheet
old_single_header = """        <!-- Header Section -->
        <div class="institution-header">
            <div class="header-text-box">
                <div class="inst-title-bn" id="display-school-name">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাপীঠ উচ্চ বিদ্যালয়</div>
                <div class="inst-subtitle" id="display-school-subtitle">মাথাভাঙ্গা, জলঢাকা, নীলফামারী। | ইআইআইএন: ১২৭৫৪৩ | কোড: ৫৬১২</div>
                <div>
                    <span class="report-pill-title" id="display-exam-name-pill">বার্ষিক পরীক্ষা</span>
                </div>
            </div>
        </div>"""

new_single_header = """        <!-- Header Section -->
        <div class="institution-header">
            <div class="header-logo-box" id="draggableLogo">
                <img id="school-logo-img-1" src="school_logo.svg" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;" onerror="this.src='school_logo.svg'">
            </div>
            <div class="header-text-box">
                <div class="inst-title-bn" id="display-school-name">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাপীঠ উচ্চ বিদ্যালয়</div>
                <div class="inst-subtitle" id="display-school-subtitle">মাথাভাঙ্গা, জলঢাকা, নীলফামারী। | ইআইআইএন: ১২৭৫৪৩ | কোড: ৫৬১২</div>
                <div>
                    <span class="report-pill-title" id="display-exam-name-pill">বার্ষিক পরীক্ষা</span>
                </div>
            </div>
        </div>"""

if old_single_header in content:
    content = content.replace(old_single_header, new_single_header, 1)
    print("2. Successfully placed logo inside single .institution-header")
else:
    print("2. WARNING: old_single_header not found")

# 3. Remove old misplaced draggable logo markup at the end of certificate sheet
old_misplaced_logo = """    <div class="header-logo-box" id="draggableLogo" title="লোগোটি মাউস দিয়ে টেনে যেকোনো স্থানে বসাতে পারেন">
        <img id="school-logo-img-1" src="school_logo.svg" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; pointer-events: none; display: block;" onerror="this.src='school_logo.svg'">
        <span class="logo-drag-hint">Move / ড্র্যাগ করুন</span>
    </div>"""

if old_misplaced_logo in content:
    content = content.replace(old_misplaced_logo, "", 1)
    print("3. Successfully removed old misplaced draggable logo markup")
else:
    print("3. WARNING: old_misplaced_logo not found")

# 4. Remove draggable logo script (lines 1170-1281)
old_drag_script = """<script>
// Draggable Logo Functionality across entire sheet
(function() {
    const logo = document.getElementById('draggableLogo');
    const container = document.querySelector('.certificate-sheet');
    if (!logo || !container) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    // Default position
    const DEFAULT_LEFT = 64; // ~17mm
    const DEFAULT_TOP = 60;  // ~16mm

    // Load saved position from localStorage
    const savedPos = localStorage.getItem('marksheet_logo_pos_v2');
    if (savedPos) {
        try {
            const { left, top } = JSON.parse(savedPos);
            logo.style.left = left + 'px';
            logo.style.top = top + 'px';
        } catch(e) {}
    }

    function onPointerDown(e) {
        if (e.button && e.button !== 0) return; // Only left click
        isDragging = true;
        logo.classList.add('is-dragging');

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const containerRect = container.getBoundingClientRect();
        const logoRect = logo.getBoundingClientRect();

        startX = clientX;
        startY = clientY;
        
        // Accurate position relative to container
        initialLeft = logoRect.left - containerRect.left;
        initialTop = logoRect.top - containerRect.top;

        document.addEventListener('mousemove', onPointerMove, { passive: false });
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);

        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        // Allow moving anywhere inside the full A4 sheet
        const containerRect = container.getBoundingClientRect();
        const logoWidth = logo.offsetWidth || 70;
        const logoHeight = logo.offsetHeight || 70;

        newLeft = Math.max(5, Math.min(newLeft, containerRect.width - logoWidth - 5));
        newTop = Math.max(5, Math.min(newTop, containerRect.height - logoHeight - 5));

        logo.style.left = newLeft + 'px';
        logo.style.top = newTop + 'px';

        if (e.cancelable) e.preventDefault();
    }

    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        logo.classList.remove('is-dragging');

        // Save position to localStorage
        const containerRect = container.getBoundingClientRect();
        const logoRect = logo.getBoundingClientRect();
        const left = logoRect.left - containerRect.left;
        const top = logoRect.top - containerRect.top;

        localStorage.setItem('marksheet_logo_pos_v2', JSON.stringify({ left, top }));
        document.querySelectorAll('#batch-marksheets-container .header-logo-box').forEach(bLogo => {
            bLogo.style.left = left + 'px';
            bLogo.style.top = top + 'px';
        });

        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
    }

    // Double click on logo to reset to original top-left position
    logo.addEventListener('dblclick', function() {
        logo.style.left = DEFAULT_LEFT + 'px';
        logo.style.top = DEFAULT_TOP + 'px';
        localStorage.removeItem('marksheet_logo_pos_v2');
        document.querySelectorAll('#batch-marksheets-container .header-logo-box').forEach(bLogo => {
            bLogo.style.left = DEFAULT_LEFT + 'px';
            bLogo.style.top = DEFAULT_TOP + 'px';
        });
    });

    logo.addEventListener('mousedown', onPointerDown);
    logo.addEventListener('touchstart', onPointerDown, { passive: false });
})();"""

new_drag_script = """<script>
// Reset any old stored logo offset to maintain perfect header alignment
try { localStorage.removeItem('marksheet_logo_pos_v2'); } catch(e) {}"""

if old_drag_script in content:
    content = content.replace(old_drag_script, new_drag_script, 1)
    print("4. Successfully removed draggable logo script and added reset")
else:
    print("4. WARNING: old_drag_script not found")

# 5. Remove "পূর্ণমান" (Full Marks) from single table header
old_single_thead = """                <tr>
                    <th rowspan="2" id="th-header-sub-1" style="width: 27%;">পাঠ্য বিষয়সমূহ</th>
                    <th rowspan="2" id="th-header-full-1" style="width: 8%;">পূর্ণমান</th>
                    <th colspan="3" id="th-header-obtained-1" style="width: 25%;">প্রাপ্ত নম্বর</th>
                    <th rowspan="2" style="width: 9%;" id="th-header-total-1">মোট নম্বর</th>
                    <th rowspan="2" id="th-header-combined-1" style="width: 11%;">সর্বমোট</th>
                    <th rowspan="2" id="th-header-grade-1" style="width: 9%;">লেটার গ্রেড</th>
                    <th rowspan="2" id="th-header-gp-1" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>
                </tr>"""

new_single_thead = """                <tr>
                    <th rowspan="2" id="th-header-sub-1" style="width: 35%;">পাঠ্য বিষয়সমূহ</th>
                    <th colspan="3" id="th-header-obtained-1" style="width: 25%;">প্রাপ্ত নম্বর</th>
                    <th rowspan="2" style="width: 9%;" id="th-header-total-1">মোট নম্বর</th>
                    <th rowspan="2" id="th-header-combined-1" style="width: 11%;">সর্বমোট</th>
                    <th rowspan="2" id="th-header-grade-1" style="width: 9%;">লেটার গ্রেড</th>
                    <th rowspan="2" id="th-header-gp-1" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>
                </tr>"""

if old_single_thead in content:
    content = content.replace(old_single_thead, new_single_thead, 1)
    print("5. Successfully removed 'পূর্ণমান' from single thead")
else:
    print("5. WARNING: old_single_thead not found")

# 6. Update renderMarksheet1Table: group header colspans from 9 to 8
old_render_groups = """        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            html += `<tr class="group-header-row"><td colspan="9">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`;
            hasOptionalHeader = true;
        }"""

new_render_groups = """        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            html += `<tr class="group-header-row"><td colspan="8">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            html += `<tr class="group-header-row"><td colspan="8">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            html += `<tr class="group-header-row"><td colspan="8">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`;
            hasOptionalHeader = true;
        }"""

if old_render_groups in content:
    content = content.replace(old_render_groups, new_render_groups, 1)
    print("6. Successfully updated renderMarksheet1Table group header colspans to 8")
else:
    print("6. WARNING: old_render_groups not found")

# 7. Update renderMarksheet1Table paired rows (remove fullMarks column)
old_render_paired = """            html += `<tr>
                <td class="sub-name">${p1NameHtml}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${p2NameHtml}</td>
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;"""

new_render_paired = """            html += `<tr>
                <td class="sub-name">${p1NameHtml}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${p2NameHtml}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;"""

if old_render_paired in content:
    content = content.replace(old_render_paired, new_render_paired, 1)
    print("7. Successfully removed fullMarks column from renderMarksheet1Table paired rows")
else:
    print("7. WARNING: old_render_paired not found")

# 8. Update renderMarksheet1Table single rows (remove fullMarks column)
old_render_single = """            html += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${subNameHtml}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;"""

new_render_single = """            html += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${subNameHtml}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;"""

if old_render_single in content:
    content = content.replace(old_render_single, new_render_single, 1)
    print("8. Successfully removed fullMarks column from renderMarksheet1Table single rows")
else:
    print("8. WARNING: old_render_single not found")

# 9. Update generateMarksheet1CardHTML group header colspans from 9 to 8
old_batch_groups = """        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            tableHtml += `<tr class="group-header-row"><td colspan="9">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            tableHtml += `<tr class="group-header-row"><td colspan="9">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            tableHtml += `<tr class="group-header-row"><td colspan="9">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`;
            hasOptionalHeader = true;
        }"""

new_batch_groups = """        if (!hasCompulsoryHeader && (!sub.group || sub.group === 'compulsory')) {
            tableHtml += `<tr class="group-header-row"><td colspan="8">${isEn ? "1. Compulsory Subjects" : "১. আবশ্যিক ও সাধারণ বিষয়াবলী (Compulsory Subjects)"}</td></tr>`;
            hasCompulsoryHeader = true;
        } else if (!hasElectiveHeader && sub.group === 'elective') {
            tableHtml += `<tr class="group-header-row"><td colspan="8">${isEn ? "2. Elective Subjects" : "২. নৈর্বাচনিক বিষয়াবলী (Elective Subjects)"}</td></tr>`;
            hasElectiveHeader = true;
        } else if (!hasOptionalHeader && sub.group === 'optional') {
            tableHtml += `<tr class="group-header-row"><td colspan="8">${isEn ? "3. Optional Subject (4th)" : "৩. অতিরিক্ত / ৪র্থ বিষয় (Optional Subject)"}</td></tr>`;
            hasOptionalHeader = true;
        }"""

if old_batch_groups in content:
    content = content.replace(old_batch_groups, new_batch_groups, 1)
    print("9. Successfully updated generateMarksheet1CardHTML group header colspans to 8")
else:
    print("9. WARNING: old_batch_groups not found")

# 10. Update generateMarksheet1CardHTML paired rows (remove fullMarks column)
old_batch_paired = """            tableHtml += `<tr>
                <td class="sub-name">${p1NameHtml}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${p2NameHtml}</td>
                <td>${formatDigits(sub.pairFull || sub.fullMarks)}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;"""

new_batch_paired = """            tableHtml += `<tr>
                <td class="sub-name">${p1NameHtml}</td>
                <td>${p1McqDisplay}</td>
                <td>${p1CqDisplay}</td>
                <td>${p1PrDisplay}</td>
                <td>${p1TotDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combTotDisplay}</td>
                <td rowspan="2" style="font-weight:800; color:#000000;">${combGradeDisplay}</td>
                <td rowspan="2" style="background:#f0fdfa; font-weight:700;">${combGpDisplay}</td>
            </tr>
            <tr>
                <td class="sub-name">${p2NameHtml}</td>
                <td>${p2McqDisplay}</td>
                <td>${p2CqDisplay}</td>
                <td>${p2PrDisplay}</td>
                <td>${p2TotDisplay}</td>
            </tr>`;"""

if old_batch_paired in content:
    content = content.replace(old_batch_paired, new_batch_paired, 1)
    print("10. Successfully removed fullMarks column from generateMarksheet1CardHTML paired rows")
else:
    print("10. WARNING: old_batch_paired not found")

# 11. Update generateMarksheet1CardHTML single rows (remove fullMarks column)
old_batch_single = """            tableHtml += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${subNameHtml}</td>
                <td>${formatDigits(sub.fullMarks)}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;"""

new_batch_single = """            tableHtml += `<tr style="${isOptional ? 'background:#f0fdf4;' : ''}">
                <td class="sub-name">${subNameHtml}</td>
                <td>${mcqDisplay}</td>
                <td>${cqDisplay}</td>
                <td>${prDisplay}</td>
                <td>${totDisplay}</td>
                <td>${totDisplay}</td>
                <td style="font-weight:800; color:#000000;">${gradeDisplay}</td>
                <td>${gpDisplay}</td>
            </tr>`;"""

if old_batch_single in content:
    content = content.replace(old_batch_single, new_batch_single, 1)
    print("11. Successfully removed fullMarks column from generateMarksheet1CardHTML single rows")
else:
    print("11. WARNING: old_batch_single not found")

# 12. Update generateMarksheet1CardHTML header markup: put logo in .institution-header
old_batch_header_markup = """            <!-- Header Section -->
            <div class="institution-header">
                <div class="header-text-box">
                    <div class="inst-title-bn">${schoolName}</div>
                    <div class="inst-subtitle">${fullSubtitle}</div>
                    <div>
                        <span class="report-pill-title">${displayExam}</span>
                    </div>
                </div>
            </div>"""

new_batch_header_markup = """            <!-- Header Section -->
            <div class="institution-header">
                <div class="header-logo-box">
                    <img src="${customLogo}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;" onerror="this.src='school_logo.svg'">
                </div>
                <div class="header-text-box">
                    <div class="inst-title-bn">${schoolName}</div>
                    <div class="inst-subtitle">${fullSubtitle}</div>
                    <div>
                        <span class="report-pill-title">${displayExam}</span>
                    </div>
                </div>
            </div>"""

if old_batch_header_markup in content:
    content = content.replace(old_batch_header_markup, new_batch_header_markup, 1)
    print("12. Successfully placed logo inside batch card .institution-header")
else:
    print("12. WARNING: old_batch_header_markup not found")

# 13. Update batch card thead: remove "Full Marks" / "পূর্ণমান" column
old_batch_thead = """            <!-- Academic Evaluation Table -->
            <table class="transcript-table">
                <thead>
                    <tr>
                        <th rowspan="2" id="th-header-sub-1" style="width: 27%;">${isEn ? "Subjects" : "পাঠ্য বিষয়সমূহ"}</th>
                        <th rowspan="2" id="th-header-full-1" style="width: 8%;">${isEn ? "Full Marks" : "পূর্ণমান"}</th>
                        <th colspan="3" id="th-header-obtained-1" style="width: 25%;">${isEn ? "Marks Obtained" : "প্রাপ্ত নম্বর"}</th>
                        <th rowspan="2" style="width: 9%;">${isEn ? "Total (" + formatDigits(examDist.total) + ")" : "মোট নম্বর (" + formatDigits(examDist.total) + ")"}</th>
                        <th rowspan="2" id="th-header-combined-1" style="width: 11%;">${isEn ? "Grand Total" : "সর্বমোট"}</th>
                        <th rowspan="2" id="th-header-grade-1" style="width: 9%;">${isEn ? "Letter Grade" : "লেটার গ্রেড"}</th>
                        <th rowspan="2" id="th-header-gp-1" style="width: 11%;">${isEn ? "Grade Point (GP)" : "গ্রেড পয়েন্ট (GP)"}</th>
                    </tr>
                    <tr>
                        <th style="width: 8%;">${isEn ? "MCQ (" + formatDigits(examDist.mcq) + ")" : "বহুনির্বাচনি (" + formatDigits(examDist.mcq) + ")"}</th>
                        <th style="width: 8%;">${isEn ? "CQ (" + formatDigits(examDist.cq) + ")" : "লিখিত (" + formatDigits(examDist.cq) + ")"}</th>
                        <th style="width: 9%;">${isEn ? "Prac. (" + formatDigits(examDist.prac) + ")" : "ব্যবহারিক (" + formatDigits(examDist.prac) + ")"}</th>
                    </tr>
                </thead>"""

new_batch_thead = """            <!-- Academic Evaluation Table -->
            <table class="transcript-table">
                <thead>
                    <tr>
                        <th rowspan="2" id="th-header-sub-1" style="width: 35%;">${isEn ? "Subjects" : "পাঠ্য বিষয়সমূহ"}</th>
                        <th colspan="3" id="th-header-obtained-1" style="width: 25%;">${isEn ? "Marks Obtained" : "প্রাপ্ত নম্বর"}</th>
                        <th rowspan="2" style="width: 9%;">${isEn ? "Total" : "মোট নম্বর"}</th>
                        <th rowspan="2" id="th-header-combined-1" style="width: 11%;">${isEn ? "Grand Total" : "সর্বমোট"}</th>
                        <th rowspan="2" id="th-header-grade-1" style="width: 9%;">${isEn ? "Letter Grade" : "লেটার গ্রেড"}</th>
                        <th rowspan="2" id="th-header-gp-1" style="width: 11%;">${isEn ? "Grade Point (GP)" : "গ্রেড পয়েন্ট (GP)"}</th>
                    </tr>
                    <tr>
                        <th style="width: 8%;">${isEn ? "MCQ" : "বহুনির্বাচনি"}</th>
                        <th style="width: 8.5%;">${isEn ? "CQ" : "লিখিত"}</th>
                        <th style="width: 8.5%;">${isEn ? "Prac." : "ব্যবহারিক"}</th>
                    </tr>
                </thead>"""

if old_batch_thead in content:
    content = content.replace(old_batch_thead, new_batch_thead, 1)
    print("13. Successfully removed 'পূর্ণমান' and cleaned batch card thead")
else:
    print("13. WARNING: old_batch_thead not found")

# 14. Remove old trailing batch logo markup at the bottom of certificate-sheet
old_batch_trailing_logo = """        <div class="header-logo-box"${logoPosStyle}>
            <img src="${customLogo}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; pointer-events: none; display: block;" onerror="this.src='school_logo.svg'">
        </div>"""

if old_batch_trailing_logo in content:
    content = content.replace(old_batch_trailing_logo, "", 1)
    print("14. Successfully removed old batch trailing logo markup")
else:
    print("14. WARNING: old_batch_trailing_logo not found")

with open('Marksheet1.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished applying all changes to Marksheet1.html")

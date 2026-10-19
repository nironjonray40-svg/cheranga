import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS
old_css = """        /* Top Header */
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
        }
        .inst-title-bn {
            font-size: 24px;
            font-weight: 800;
            color: #000000;
            line-height: 1.2;
            margin-top: 1px;
            margin-bottom: 3px;
            padding: 0;
            white-space: nowrap;
            letter-spacing: -0.35px;
            text-shadow: 0 0 0.5px #000;
        }"""

new_css = """        /* Top Header */
        .institution-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
            margin-bottom: 10px;
            min-height: 80px;
            box-sizing: border-box;
            position: relative;
        }
        .header-logo-box {
            flex: 0 0 70px;
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            overflow: hidden;
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
        .header-right-spacer {
            flex: 0 0 70px;
            width: 70px;
        }
        .header-text-box {
            flex: 1;
            min-width: 0;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0 8px;
            box-sizing: border-box;
        }
        .inst-title-bn {
            font-size: 20.5px;
            font-weight: 800;
            color: #000000;
            line-height: 1.2;
            margin-top: 1px;
            margin-bottom: 3px;
            padding: 0;
            white-space: nowrap;
            letter-spacing: -0.35px;
            text-shadow: 0 0 0.5px #000;
        }"""

if old_css in content:
    content = content.replace(old_css, new_css, 1)
    print("1. Successfully updated Header CSS with flex layout and spacer")
else:
    print("1. WARNING: old_css not found")

# 2. Update Single Certificate Sheet Header HTML
old_single_header = """        <!-- Header Section -->
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
            <div class="header-right-spacer" aria-hidden="true"></div>
        </div>"""

if old_single_header in content:
    content = content.replace(old_single_header, new_single_header, 1)
    print("2. Successfully updated Single View Header with header-right-spacer")
else:
    print("2. WARNING: old_single_header not found")

# 3. Update Batch Card Header HTML
old_batch_header = """            <!-- Header Section -->
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

new_batch_header = """            <!-- Header Section -->
            <div class="institution-header">
                <div class="header-logo-box">
                    <img src="${customLogo}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block;" onerror="this.src='school_logo.svg'">
                </div>
                <div class="header-text-box">
                    <div class="inst-title-bn"${schoolName.length > 40 ? ' style="font-size: 19.5px;"' : ''}>${schoolName}</div>
                    <div class="inst-subtitle">${fullSubtitle}</div>
                    <div>
                        <span class="report-pill-title">${displayExam}</span>
                    </div>
                </div>
                <div class="header-right-spacer" aria-hidden="true"></div>
            </div>"""

if old_batch_header in content:
    content = content.replace(old_batch_header, new_batch_header, 1)
    print("3. Successfully updated Batch Card Header with header-right-spacer")
else:
    print("3. WARNING: old_batch_header not found")

# 4. Update syncSchoolHeaderInfo to adaptively tune font-size
old_sync_name = """        // Update School Name
        const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাপীঠ উচ্চ বিদ্যালয়";
        const nameEl = document.getElementById('display-school-name');
        if (nameEl && nameEl.innerText !== schoolName) {
            nameEl.innerText = schoolName;
        }"""

new_sync_name = """        // Update School Name
        const schoolName = settings.schoolSubtitle || settings.schoolName || "আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাপীঠ উচ্চ বিদ্যালয়";
        const nameEl = document.getElementById('display-school-name');
        if (nameEl) {
            if (nameEl.innerText !== schoolName) {
                nameEl.innerText = schoolName;
            }
            if (schoolName.length > 40) {
                nameEl.style.fontSize = '19.5px';
            } else {
                nameEl.style.fontSize = '21px';
            }
        }"""

if old_sync_name in content:
    content = content.replace(old_sync_name, new_sync_name, 1)
    print("4. Successfully updated syncSchoolHeaderInfo with adaptive font-size")
else:
    print("4. WARNING: old_sync_name not found")

with open('Marksheet1.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished applying all header fixes to Marksheet1.html")

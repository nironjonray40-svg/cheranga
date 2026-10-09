import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("Original length:", len(content))

# 1. Update CSS for pending-card
css_old = """    .pending-list-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 1.25rem;
    }
    .pending-card {
      display: flex;
      gap: 16px;
      align-items: center;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-left: 5px solid #f59e0b;
      border-radius: var(--radius-md);
      padding: 14px 18px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 5px rgba(0,0,0,0.03);
    }
    .pending-card:hover {
      border-color: #f59e0b;
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.12);
    }
    .pending-thumb-wrapper {
      position: relative;
      width: 75px;
      height: 95px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #0f172a;
      cursor: pointer;
      flex-shrink: 0;
    }
    .pending-thumb-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s;
    }
    .pending-thumb-wrapper:hover img {
      transform: scale(1.08);
    }
    .pending-thumb-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .pending-thumb-wrapper:hover .pending-thumb-overlay {
      opacity: 1;
    }
    .pending-info-col {
      flex: 1;
      min-width: 220px;
    }
    .pending-assign-col {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .pending-student-select {
      min-width: 240px;
      max-width: 320px;
      padding: 8px 12px;
      font-size: 0.88rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: var(--text-main);
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .pending-student-select:focus {
      border-color: var(--primary);
    }
    .pending-reg-input {
      width: 130px;
      padding: 8px 12px;
      font-size: 0.9rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: var(--text-main);
      font-family: 'Inter', monospace;
      font-weight: 700;
      outline: none;
      transition: border-color 0.2s;
    }
    .pending-reg-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }"""

css_new = """    .pending-list-grid {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 1.25rem;
    }
    .pending-card {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 22px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-left: 5px solid #f59e0b;
      border-radius: var(--radius-lg);
      padding: 18px 22px;
      transition: all 0.25s ease;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
    }
    .pending-card:hover {
      border-color: #f59e0b;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.15);
    }
    .pending-card-left {
      flex: 1.25;
      min-width: 320px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }
    .pending-card-right {
      flex: 0.95;
      min-width: 280px;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .pending-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }
    .pending-file-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      font-family: 'Inter', monospace;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .pending-reason-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      font-size: 0.85rem;
      color: #b45309;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pending-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(95px, 1fr));
      gap: 8px;
      background: var(--bg-page);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }
    .pending-stat-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .pending-stat-item .stat-lbl {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .pending-stat-item .stat-val {
      font-size: 0.92rem;
      font-weight: 700;
      font-family: 'Inter', 'Outfit', sans-serif;
      color: var(--text-main);
    }
    .pending-stat-item .val-reg {
      color: #4338ca;
    }
    .pending-stat-item .val-unclear {
      color: #dc2626;
    }
    .pending-action-section {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .pending-inputs-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      flex-wrap: wrap;
    }
    .pending-student-select {
      width: 100%;
      padding: 8px 12px;
      font-size: 0.88rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      background: #ffffff;
      color: var(--text-main);
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .pending-student-select:focus {
      border-color: var(--primary);
    }
    .pending-reg-input {
      width: 100%;
      padding: 8px 12px;
      font-size: 0.9rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      background: #ffffff;
      color: var(--text-main);
      font-family: 'Inter', monospace;
      font-weight: 700;
      outline: none;
      transition: border-color 0.2s;
    }
    .pending-reg-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }
    .pending-btn-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    .pending-omr-viewer-box {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 270px;
      max-height: 380px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1.5px solid #cbd5e1;
      background: #0f172a;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
      transition: all 0.25s ease;
    }
    .pending-omr-viewer-box:hover {
      border-color: var(--primary);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.25);
    }
    .pending-omr-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #1e293b;
      transition: transform 0.3s ease;
    }
    .pending-omr-viewer-box:hover .pending-omr-image {
      transform: scale(1.03);
    }
    .pending-omr-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #94a3b8;
      font-size: 0.85rem;
    }
    .pending-omr-hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.95rem;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    .pending-omr-viewer-box:hover .pending-omr-hover-overlay {
      opacity: 1;
    }
    .pending-omr-badge {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(4px);
      color: #f8fafc;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.15);
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    @media (max-width: 960px) {
      .pending-card {
        flex-direction: column-reverse;
      }
      .pending-card-right {
        max-width: 100%;
        min-height: 240px;
      }
    }"""

if css_old in content:
    content = content.replace(css_old, css_new, 1)
    print("CSS updated successfully!")
else:
    print("Error: css_old not found!")
    sys.exit(1)

# 2. Update renderPendingList template
render_start_marker = "        return `\n          <div class=\"pending-card\" id=\"pending_card_${item.uid}\">"
render_end_marker = "          </div>\n        `;\n      }).join('');\n    };"

r_start = content.find(render_start_marker)
r_end = content.find(render_end_marker, r_start)

if r_start == -1 or r_end == -1:
    print("Error: render markers not found!", r_start, r_end)
    sys.exit(1)

new_render_template = """        return `
          <div class="pending-card" id="pending_card_${item.uid}">
            <!-- LEFT SIDE: Student Detected Info & Correction Controls -->
            <div class="pending-card-left">
              <!-- Header: File Name, Set, Score Badge -->
              <div class="pending-header-row">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="pending-file-title" title="${item.fileName}">
                    <i class="fa-regular fa-image" style="color: var(--primary);"></i> ${item.fileName}
                  </span>
                  <span class="set-tag" title="সেট">${item.detectedSet}</span>
                </div>
                <span class="status-badge ${passBadgeClass}">
                  <i class="fa-solid ${isPassed ? 'fa-check' : 'fa-xmark'}"></i> ${passBadgeText} (${toBengaliNumber(item.scoreInfo.correct)}/৩০)
                </span>
              </div>

              <!-- Reason / Warning Box -->
              <div class="pending-reason-box">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>${item.reason}</span>
              </div>

              <!-- Detected Stats Grid -->
              <div class="pending-stats-grid">
                <div class="pending-stat-item">
                  <span class="stat-lbl">পঠিত রেজিঃ</span>
                  <strong class="stat-val ${item.detectedId ? 'val-reg' : 'val-unclear'}">${item.detectedId ? toBengaliNumber(item.detectedId) : 'সনাক্ত হয়নি'}</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">রোল নং</span>
                  <strong class="stat-val">${item.detectedRoll ? toBengaliNumber(item.detectedRoll) : 'নেই'}</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">শুদ্ধ উত্তর</span>
                  <strong class="stat-val" style="color: #059669;">${toBengaliNumber(item.scoreInfo.correct)} টি</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">ভুল উত্তর</span>
                  <strong class="stat-val" style="color: #dc2626;">${toBengaliNumber(item.scoreInfo.wrong)} টি</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">ফাঁকা</span>
                  <strong class="stat-val" style="color: var(--text-muted);">${toBengaliNumber(item.scoreInfo.blank)} টি</strong>
                </div>
                <div class="pending-stat-item">
                  <span class="stat-lbl">প্রাপ্ত নম্বর</span>
                  <strong class="stat-val" style="color: var(--primary);">${toBengaliNumber(item.percentage)}%</strong>
                </div>
              </div>

              <!-- Correction / Assignment Form Section -->
              <div class="pending-action-section">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-user-check" style="color: var(--primary);"></i>
                  <span>OMR দেখে শিক্ষার্থী নির্বাচন বা রেজিঃ সংশোধন করুন:</span>
                </div>

                <div class="pending-inputs-row">
                  <div style="flex: 1; min-width: 200px;">
                    <label style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 3px;">শিক্ষার্থী নির্বাচন করুন:</label>
                    <select class="pending-student-select" id="selectStudent_${item.uid}" onchange="onPendingStudentSelectChange('${item.uid}', this.value)">
                      ${studentOptionsHtml}
                    </select>
                  </div>

                  <div style="width: 140px;">
                    <label style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 3px;">অথবা রেজিঃ নং:</label>
                    <input type="text" class="pending-reg-input" id="inputReg_${item.uid}" placeholder="রেজিঃ নং..." value="${item.detectedId || ''}" onkeydown="if(event.key==='Enter') assignPendingOmr('${item.uid}')">
                  </div>
                </div>

                <div class="pending-btn-row">
                  <button type="button" class="btn btn-primary btn-sm" onclick="assignPendingOmr('${item.uid}')" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); font-weight: 700; padding: 8px 18px; border: none; box-shadow: 0 3px 10px rgba(79, 70, 229, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border-radius: var(--radius-sm);" title="এই শিক্ষার্থীর সাথে ওএমআর নম্বর যুক্ত করুন">
                    <i class="fa-solid fa-check"></i> সংশোধন ও মার্ক যুক্ত করুন
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" onclick="discardPendingOmr('${item.uid}')" title="পেন্ডিং তালিকা থেকে বাদ দিন" style="padding: 8px 12px; border-color: #cbd5e1; color: var(--danger); border-radius: var(--radius-sm); cursor: pointer;">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- RIGHT SIDE: Prominent OMR Sheet View -->
            <div class="pending-card-right">
              <div class="pending-omr-viewer-box" onclick="openPendingOmrLightbox('${previewImgSrc}', '${item.fileName}')" title="ক্লিক করে বড় ভিউ দেখুন (Zoom)">
                ${previewImgSrc ? `
                  <img src="${previewImgSrc}" alt="OMR Sheet" class="pending-omr-image">
                ` : `
                  <div class="pending-omr-placeholder">
                    <i class="fa-regular fa-image" style="font-size: 2.5rem; color: #94a3b8;"></i>
                    <span>ইমেজ পাওয়া যায়নি</span>
                  </div>
                `}
                <div class="pending-omr-hover-overlay">
                  <i class="fa-solid fa-magnifying-glass-plus"></i>
                  <span>বড় করে দেখুন</span>
                </div>
                <div class="pending-omr-badge">
                  <i class="fa-regular fa-file-lines"></i> ওএমআর শিট কপি
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    };"""

content = content[:r_start] + new_render_template + content[r_end + len(render_end_marker):]

with open('exam-portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated exam-portal.html successfully! New length:", len(content))

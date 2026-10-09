import sys
import re

# Ensure standard encoding
sys.stdout.reconfigure(encoding='utf-8')

with open('exam-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("File size before:", len(content))

# 1. Insert CSS for Pending List & Tabs
css_target = """    .empty-state h3 {
      font-size: 1.2rem;
      color: var(--text-main);
      margin-bottom: 6px;
    }"""

css_replacement = """    .empty-state h3 {
      font-size: 1.2rem;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    /* Results Tab Bar & Pending List Styles */
    .results-tab-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      background: var(--bg-page);
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 10px;
    }
    .results-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0.55rem 1.15rem;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.92rem;
      font-family: 'Outfit', 'Hind Siliguri', sans-serif;
      cursor: pointer;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted);
      transition: all 0.2s ease;
    }
    .results-tab-btn:hover {
      background: rgba(79, 70, 229, 0.08);
      color: var(--primary);
    }
    .results-tab-btn.active {
      background: #ffffff;
      color: var(--primary);
      border-color: rgba(79, 70, 229, 0.25);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }
    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 800;
      background: rgba(79, 70, 229, 0.12);
      color: var(--primary);
    }
    .tab-badge.badge-warning {
      background: #fef3c7;
      color: #b45309;
    }
    .results-tab-btn.active .tab-badge.badge-warning {
      background: #dc2626;
      color: #ffffff;
    }
    .pending-alert-banner {
      padding: 0.85rem 1.25rem;
      background: #fffbeb;
      border-bottom: 1px solid #fde68a;
      color: #92400e;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      animation: fadeIn 0.3s ease;
    }
    .pending-list-grid {
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

if css_target in content:
    content = content.replace(css_target, css_replacement, 1)
    print("CSS replaced successfully!")
else:
    print("Warning: css_target not found!")

# 2. Update the HTML structure of table-container-card
html_target = """    <!-- Student Results Table Card -->
    <section class="table-container-card">
      
      <!-- Table Filter Toolbar -->
      <div class="table-header-toolbar">
        <div class="search-filter-group">
          <!-- Search Input -->
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="inputSearch" placeholder="রেজিঃ নং বা রোল নং খুঁজুন...">
          </div>

          <!-- Class Filter -->
          <select id="filterClass" class="filter-select">
            <option value="ALL">সকল শ্রেণি</option>
            <option value="10">১০ম শ্রেণি</option>
            <option value="9">৯ম শ্রেণি</option>
            <option value="8">৮ম শ্রেণি</option>
            <option value="7">৭ম শ্রেণি</option>
            <option value="6">৬ষ্ঠ শ্রেণি</option>
          </select>

          <!-- Section Filter -->
          <select id="filterSection" class="filter-select">
            <option value="ALL">সকল শাখা</option>
            <option value="ক"> শাখা: ক</option>
            <option value="খ">শাখা: খ</option>
            <option value="গ">শাখা: গ</option>
            <option value="ঘ">শাখা: ঘ</option>
          </select>

          <!-- Set Filter -->
          <select id="filterSet" class="filter-select">
            <option value="ALL">সকল সেট</option>
            <option value="ক">সেট: ক</option>
            <option value="খ">সেট: খ</option>
            <option value="গ">সেট: গ</option>
          </select>

          <!-- Status Filter -->
          <select id="filterStatus" class="filter-select">
            <option value="ALL">সকল ফলাফল</option>
            <option value="উত্তীর্ণ">উত্তীর্ণ</option>
            <option value="অনুত্তীর্ণ">অনুত্তীর্ণ</option>
            <option value="পেন্ডিং">পেন্ডিং</option>
          </select>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-muted);">
          প্রদর্শিত হচ্ছে: <strong id="textShowingCount" style="color: var(--text-main);">০</strong> জন
        </div>
      </div>

      <!-- Main Results Table -->
      <div class="table-responsive">
        <table class="results-table" id="tableResults">
          <thead>
            <tr>
              <th style="width: 50px;">ক্রমিক</th>
              <th>শিক্ষার্থী রেজিঃ নং</th>
              <th>রোল নং</th>
              <th>শ্রেণি</th>
              <th>শাখা</th>
              <th>সেট নং</th>
              <th>শুদ্ধ উত্তরের সংখ্যা</th>
              <th>প্রাপ্ত নম্বর (%)</th>
              <th>স্ট্যাটাস</th>
              <th style="text-align: right;">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody id="tableResultsBody">
            <!-- Populated dynamically via JS -->
            <tr>
              <td colspan="10">
                <div class="empty-state">
                  <i class="fa-regular fa-folder-open"></i>
                  <h3>কোনো মূল্যায়ন ডেটা লোড করা হয়নি</h3>
                  <p>উপরে ফোল্ডার আপলোড করুন অথবা 'নমুনা ডেটা লোড করুন' বাটনে ক্লিক করে পরীক্ষা করুন।</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </section>"""

# Normalize whitespaces to find cleanly if needed
html_replacement = """    <!-- Student Results Table Card -->
    <section class="table-container-card" id="resultsMainCard">
      
      <!-- Navigation Tabs & Alert Bar -->
      <div class="results-tab-bar">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" id="tabBtnMainResults" class="results-tab-btn active" onclick="switchResultsTab('main')">
            <i class="fa-solid fa-list-check"></i> রেজাল্ট শিট
            <span class="tab-badge" id="badgeMainCount">০</span>
          </button>
          <button type="button" id="tabBtnPendingResults" class="results-tab-btn" onclick="switchResultsTab('pending')">
            <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i> পেন্ডিং তালিকা (Pending List)
            <span class="tab-badge badge-warning" id="badgePendingCount">০</span>
          </button>
        </div>
        <div id="pendingAlertQuickHint" style="display: none; font-size: 0.85rem; color: #dc2626; font-weight: 600; align-items: center; gap: 6px;">
          <i class="fa-solid fa-circle-exclamation"></i> <span id="pendingQuickCountText">০ টি শিট পেন্ডিং তালিকায় রয়েছে</span>
        </div>
      </div>

      <!-- Pending Alert Banner -->
      <div id="pendingAlertBanner" class="pending-alert-banner" style="display: none;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #fef3c7; color: #d97706; font-size: 1.1rem; flex-shrink: 0;">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </span>
          <div>
            <strong style="font-size: 0.95rem; color: #78350f;">সনাক্ত না হওয়া / অমিল ওএমআর শিট রয়েছে!</strong>
            <p style="margin: 2px 0 0 0; font-size: 0.83rem; color: #92400e;" id="pendingAlertBannerDesc">
              ওএমআর শিটের রেজিঃ নং মেলেনি। "Pending List" ট্যাবে গিয়ে শিক্ষার্থীর সঠিক রেজিঃ নং দিয়ে সংশোধন করুন।
            </p>
          </div>
        </div>
        <button type="button" class="btn btn-sm" onclick="switchResultsTab('pending')" style="background: #d97706; color: #ffffff; font-weight: 700; border: none; padding: 7px 15px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3);">
          <i class="fa-solid fa-pen-to-square"></i> পেন্ডিং তালিকা দেখুন ও সংশোধন করুন ➜
        </button>
      </div>

      <!-- Main Results Table View -->
      <div id="sectionMainResultsView">
        <!-- Table Filter Toolbar -->
        <div class="table-header-toolbar">
          <div class="search-filter-group">
            <!-- Search Input -->
            <div class="search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="inputSearch" placeholder="রেজিঃ নং বা রোল নং খুঁজুন...">
            </div>

            <!-- Class Filter -->
            <select id="filterClass" class="filter-select">
              <option value="ALL">সকল শ্রেণি</option>
              <option value="10">১০ম শ্রেণি</option>
              <option value="9">৯ম শ্রেণি</option>
              <option value="8">৮ম শ্রেণি</option>
              <option value="7">৭ম শ্রেণি</option>
              <option value="6">৬ষ্ঠ শ্রেণি</option>
            </select>

            <!-- Section Filter -->
            <select id="filterSection" class="filter-select">
              <option value="ALL">সকল শাখা</option>
              <option value="ক">শাখা: ক</option>
              <option value="খ">শাখা: খ</option>
              <option value="গ">শাখা: গ</option>
              <option value="ঘ">শাখা: ঘ</option>
            </select>

            <!-- Set Filter -->
            <select id="filterSet" class="filter-select">
              <option value="ALL">সকল সেট</option>
              <option value="ক">সেট: ক</option>
              <option value="খ">সেট: খ</option>
              <option value="গ">সেট: গ</option>
            </select>

            <!-- Status Filter -->
            <select id="filterStatus" class="filter-select">
              <option value="ALL">সকল ফলাফল</option>
              <option value="উত্তীর্ণ">উত্তীর্ণ</option>
              <option value="অনুত্তীর্ণ">অনুত্তীর্ণ</option>
              <option value="পেন্ডিং">পেন্ডিং</option>
            </select>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted);">
            প্রদর্শিত হচ্ছে: <strong id="textShowingCount" style="color: var(--text-main);">০</strong> জন
          </div>
        </div>

        <!-- Main Results Table -->
        <div class="table-responsive">
          <table class="results-table" id="tableResults">
            <thead>
              <tr>
                <th style="width: 50px;">ক্রমিক</th>
                <th>শিক্ষার্থী রেজিঃ নং</th>
                <th>রোল নং</th>
                <th>শ্রেণি</th>
                <th>শাখা</th>
                <th>সেট নং</th>
                <th>শুদ্ধ উত্তরের সংখ্যা</th>
                <th>প্রাপ্ত নম্বর (%)</th>
                <th>স্ট্যাটাস</th>
                <th style="text-align: right;">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="tableResultsBody">
              <!-- Populated dynamically via JS -->
              <tr>
                <td colspan="10">
                  <div class="empty-state">
                    <i class="fa-regular fa-folder-open"></i>
                    <h3>কোনো মূল্যায়ন ডেটা লোড করা হয়নি</h3>
                    <p>উপরে ফোল্ডার আপলোড করুন অথবা 'নমুনা ডেটা লোড করুন' বাটনে ক্লিক করে পরীক্ষা করুন।</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending List View -->
      <div id="sectionPendingListView" style="display: none;">
        <div style="padding: 1rem 1.25rem; background: #fffdf5; border-bottom: 1px solid #fde68a; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="margin: 0; font-size: 1.05rem; color: #92400e; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-circle-question" style="color: #d97706;"></i> অমিল বা অপাঠ্য রেজিঃ নং বিশিষ্ট ওএমআর তালিকা (Pending List)
            </h3>
            <p style="margin: 3px 0 0 0; font-size: 0.84rem; color: #78350f;">
              যে সকল ওএমআর শিটের রেজিঃ নং বাবল সনাক্ত করা যায়নি অথবা পরীক্ষার শিক্ষার্থী তালিকায় মেলেনি, সেগুলো এখানে রয়েছে। ওএমআর শিট প্রিভিউ দেখে শিক্ষার্থী নির্বাচন করে <strong>"সংশোধন ও মার্ক যুক্ত করুন"</strong> বাটনে ক্লিক করলেই শিক্ষার্থীর MCQ নম্বর যুক্ত হয়ে যাবে।
            </p>
          </div>
          <button type="button" class="btn btn-sm btn-outline" onclick="switchResultsTab('main')">
            <i class="fa-solid fa-arrow-left"></i> রেজাল্ট শিটে ফিরুন
          </button>
        </div>

        <div id="pendingListItemsContainer" class="pending-list-grid">
          <!-- Dynamically populated via JS -->
        </div>
      </div>

    </section>"""

if html_target in content:
    content = content.replace(html_target, html_replacement, 1)
    print("HTML results card replaced successfully!")
else:
    # Try finding by section start and end
    start_pos = content.find('<!-- Student Results Table Card -->')
    end_pos = content.find('</section>', start_pos) + len('</section>')
    if start_pos != -1 and end_pos != -1:
        print("Found HTML section by boundaries!")
        content = content[:start_pos] + html_replacement + content[end_pos:]
        print("HTML results card replaced using boundaries!")
    else:
        print("Warning: HTML section not found!")

# 3. Add Lightbox Modal before modalViewEdit
lightbox_code = """    <!-- Modal: Pending OMR Image Lightbox -->
    <div class="modal-overlay" id="modalPendingOmrLightbox" style="display: none; z-index: 10050;" onclick="closePendingOmrLightbox()">
      <div class="modal-card" style="max-width: 850px; width: 95vw; max-height: 90vh; display: flex; flex-direction: column; padding: 0; overflow: hidden; background: #0f172a;" onclick="event.stopPropagation();">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; background: #1e293b; color: white;">
          <h3 style="margin: 0; font-size: 1rem; color: #f8fafc;" id="lightboxOmrTitle"><i class="fa-regular fa-image"></i> ওএমআর শিট প্রিভিউ</h3>
          <button type="button" class="icon-btn" onclick="closePendingOmrLightbox()" style="color: #cbd5e1; background: transparent; border: none; font-size: 1.2rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="flex: 1; overflow: auto; padding: 15px; display: flex; justify-content: center; align-items: center; background: #090d16;">
          <img id="lightboxOmrImage" src="" alt="OMR Sheet" style="max-width: 100%; max-height: 75vh; object-fit: contain; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        </div>
      </div>
    </div>\n\n"""

modal_target = '    <!-- OMR READER MODALS -->\n    <div class="modal-overlay" id="modalViewEdit">'
if modal_target in content:
    content = content.replace(modal_target, lightbox_code + modal_target, 1)
    print("Lightbox modal inserted successfully!")
else:
    print("Warning: modal_target not found!")

# 4. Update JS State
state_target = """    // Application Global State
    const state = {
      answerKeys: JSON.parse(JSON.stringify(defaultAnswerKeys)),
      currentEditingKeySet: 'ক',
      setSourceFiles: {
        'ক': null,
        'খ': null,
        'গ': null,
        'ঘ': null
      },
      studentFiles: [],
      answerKeyFiles: [],
      uploadedKeyPreview: null, // Stores metadata and content for preview
      activeKeyModalTab: 'bubble',
      activeStudentModalTab: 'split', // Default tab for student review modal
      studentScanZoom: 1.0,
      students: [],
      currentEditIndex: -1,
      tempEditStudent: null
    };"""

state_replacement = """    // Application Global State
    const state = {
      answerKeys: JSON.parse(JSON.stringify(defaultAnswerKeys)),
      currentEditingKeySet: 'ক',
      setSourceFiles: {
        'ক': null,
        'খ': null,
        'গ': null,
        'ঘ': null
      },
      studentFiles: [],
      answerKeyFiles: [],
      uploadedKeyPreview: null, // Stores metadata and content for preview
      activeKeyModalTab: 'bubble',
      activeStudentModalTab: 'split', // Default tab for student review modal
      studentScanZoom: 1.0,
      students: [],
      pendingUnmatchedList: [],
      activeResultsTab: 'main',
      currentEditIndex: -1,
      tempEditStudent: null
    };"""

if state_target in content:
    content = content.replace(state_target, state_replacement, 1)
    print("State updated successfully!")
else:
    print("Warning: state_target not found!")

with open('exam-portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Stage 1 complete, file saved.")

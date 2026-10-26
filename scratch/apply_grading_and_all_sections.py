import sys

sys.stdout.reconfigure(encoding='utf-8')

def apply_updates(filename):
    print(f"Applying updates to {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. getEnglishSectionName & getDisplaySectionName
    old_en_sec = """function getEnglishSectionName(sec) {
    if (!sec) return '';
    const s = String(sec).trim().toLowerCase();
    if (s.includes('বিজ্ঞান') || s === 'science') return 'Science';"""

    new_en_sec = """function getEnglishSectionName(sec) {
    if (!sec) return '';
    const s = String(sec).trim().toLowerCase();
    if (s === 'all' || s === 'সকল শাখা') return 'All Sections';
    if (s.includes('বিজ্ঞান') || s === 'science') return 'Science';"""

    old_bn_sec = """function getDisplaySectionName(sec) {
    if (!sec) return '';
    if (currentLanguage === 'en') {
        return getEnglishSectionName(sec);
    } else {
        const s = String(sec).trim();
        if (s.toLowerCase() === 'science') return 'বিজ্ঞান';"""

    new_bn_sec = """function getDisplaySectionName(sec) {
    if (!sec) return '';
    if (currentLanguage === 'en') {
        return getEnglishSectionName(sec);
    } else {
        const s = String(sec).trim();
        if (s.toLowerCase() === 'all' || s === 'সকল শাখা') return 'সকল শাখা (All)';
        if (s.toLowerCase() === 'science') return 'বিজ্ঞান';"""

    # 2. normalizeSectionString
    old_norm_sec = """        function normalizeSectionString(str) {
            if (!str) return 'science';
            const s = String(str).toLowerCase().trim();
            if (s.includes('বিজ্ঞান') || s.includes('science') || s === 'a' || s === 'ক') return 'science';"""

    new_norm_sec = """        function normalizeSectionString(str) {
            if (!str) return 'science';
            const s = String(str).toLowerCase().trim();
            if (s === 'all' || s === 'সকল শাখা') return 'all';
            if (s.includes('বিজ্ঞান') || s.includes('science') || s === 'a' || s === 'ক') return 'science';"""

    old_norm_sec_m1 = """function normalizeSectionString(str) {
    if (!str) return 'science';
    const s = String(str).toLowerCase().trim();
    if (s.includes('বিজ্ঞান') || s.includes('science') || s === 'a' || s === 'ক') return 'science';"""

    new_norm_sec_m1 = """function normalizeSectionString(str) {
    if (!str) return 'science';
    const s = String(str).toLowerCase().trim();
    if (s === 'all' || s === 'সকল শাখা') return 'all';
    if (s.includes('বিজ্ঞান') || s.includes('science') || s === 'a' || s === 'ক') return 'science';"""

    # 3. getSectionsForClass returns ['All', ...sorted]
    old_return_sec = """            const order = ['A', 'B', 'C', 'D', 'E', 'F', 'ক', 'খ', 'গ', 'ঘ', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'];
            return Array.from(sectionSet).sort((a, b) => {
                const ia = order.indexOf(a);
                const ib = order.indexOf(b);
                if (ia !== -1 && ib !== -1) return ia - ib;
                if (ia !== -1) return -1;
                if (ib !== -1) return 1;
                return a.localeCompare(b);
            });"""

    new_return_sec = """            const order = ['A', 'B', 'C', 'D', 'E', 'F', 'ক', 'খ', 'গ', 'ঘ', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'];
            const sorted = Array.from(sectionSet).filter(s => s !== 'All' && s !== 'সকল শাখা').sort((a, b) => {
                const ia = order.indexOf(a);
                const ib = order.indexOf(b);
                if (ia !== -1 && ib !== -1) return ia - ib;
                if (ia !== -1) return -1;
                if (ib !== -1) return 1;
                return a.localeCompare(b);
            });
            return ['All', ...sorted];"""

    # 4. updateMarksheetSection
    old_update_sec = """        function updateMarksheetSection(val) {
            localStorage.setItem('school_marksheet_section', val);
            if (currentSelectedStudent && normalizeSectionString(currentSelectedStudent.section || currentSelectedStudent.group) !== normalizeSectionString(val)) {
                currentSelectedStudent = null;
                currentSearchQuery = '';
                const input = document.getElementById('filter-student-search');
                const clearBtn = document.getElementById('btn-clear-search');
                if (input) input.value = '';
                if (clearBtn) clearBtn.style.display = 'none';
            }
            syncCascadingFilters('section_changed');
        }"""

    new_update_sec = """        function updateMarksheetSection(val) {
            localStorage.setItem('school_marksheet_section', val);
            if (val === 'All') {
                isCreateAllMode = true;
                const btn = document.getElementById('btn-create-all');
                const btnText = document.getElementById('create-all-btn-text');
                if (btn) btn.classList.add('active');
                if (btnText) btnText.innerText = currentLanguage === 'en' ? 'All Students' : 'সকল শিক্ষার্থী (All)';
            }
            if (val !== 'All' && currentSelectedStudent && normalizeSectionString(currentSelectedStudent.section || currentSelectedStudent.group) !== normalizeSectionString(val)) {
                currentSelectedStudent = null;
                currentSearchQuery = '';
                const input = document.getElementById('filter-student-search');
                const clearBtn = document.getElementById('btn-clear-search');
                if (input) input.value = '';
                if (clearBtn) clearBtn.style.display = 'none';
            }
            syncCascadingFilters('section_changed');
        }"""

    old_update_sec_m1 = old_update_sec.replace('        function', 'function').replace('            ', '    ')
    new_update_sec_m1 = new_update_sec.replace('        function', 'function').replace('            ', '    ')

    # 5. getSubjectsForClass
    old_sub_sec = """        function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {
            const normC = normalizeClassString(selectedClass);
            const normS = normalizeSectionString(selectedSection);"""

    new_sub_sec = """        function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {
            const normC = normalizeClassString(selectedClass);
            const effSec = (student && (student.section || student.group || student.sectionName))
                ? (student.section || student.group || student.sectionName)
                : selectedSection;
            const normS = (selectedSection === 'All' || selectedSection === 'সকল শাখা')
                ? (effSec && effSec !== 'All' ? normalizeSectionString(effSec) : '')
                : normalizeSectionString(effSec || selectedSection);"""

    old_sub_sec_m1 = """function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {
    const normC = normalizeClassString(selectedClass);
    const normS = normalizeSectionString(selectedSection);"""

    new_sub_sec_m1 = """function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {
    const normC = normalizeClassString(selectedClass);
    const effSec = (student && (student.section || student.group || student.sectionName))
        ? (student.section || student.group || student.sectionName)
        : selectedSection;
    const normS = (selectedSection === 'All' || selectedSection === 'সকল শাখা')
        ? (effSec && effSec !== 'All' ? normalizeSectionString(effSec) : '')
        : normalizeSectionString(effSec || selectedSection);"""

    # 6. Listeners & Heartbeat for school_marking_system
    old_heartbeat = """        // Continuous heartbeat sync every 2.5 seconds
        setInterval(function() {
            syncSchoolHeaderInfo();
            syncLiveExamData();
            syncCascadingFilters('exam_sync');
        }, 2500);"""

    new_heartbeat = """        let lastKnownMarkingSystemJson = '';
        try { lastKnownMarkingSystemJson = localStorage.getItem('school_marking_system') || ''; } catch(e){}

        function checkAndSyncMarkingSystem() {
            const currentMarkingSystem = localStorage.getItem('school_marking_system') || '';
            if (currentMarkingSystem !== lastKnownMarkingSystemJson) {
                lastKnownMarkingSystemJson = currentMarkingSystem;
                if (typeof renderGradingScaleLegend === 'function') renderGradingScaleLegend();
                if (typeof renderGradingScaleLegend1 === 'function') renderGradingScaleLegend1();
                syncCascadingFilters('marking_system_changed');
            }
        }

        window.addEventListener('focus', function() {
            checkAndSyncMarkingSystem();
            syncLiveExamData();
        });
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                checkAndSyncMarkingSystem();
                syncLiveExamData();
            }
        });

        // Continuous heartbeat sync every 2 seconds
        setInterval(function() {
            syncSchoolHeaderInfo();
            syncLiveExamData();
            checkAndSyncMarkingSystem();
            syncCascadingFilters('exam_sync');
        }, 2000);"""

    old_heartbeat_m1 = """// Continuous heartbeat sync every 2.5 seconds
setInterval(function() {
    syncSchoolHeaderInfo();
    syncLiveExamData();
    syncCascadingFilters('exam_sync');
}, 2500);"""

    new_heartbeat_m1 = new_heartbeat.replace('        ', '')

    # Apply substitutions
    if old_en_sec in content:
        content = content.replace(old_en_sec, new_en_sec)
        print("  Replaced getEnglishSectionName")
    if old_bn_sec in content:
        content = content.replace(old_bn_sec, new_bn_sec)
        print("  Replaced getDisplaySectionName")

    if old_norm_sec in content:
        content = content.replace(old_norm_sec, new_norm_sec)
        print("  Replaced normalizeSectionString in Marksheet")
    elif old_norm_sec_m1 in content:
        content = content.replace(old_norm_sec_m1, new_norm_sec_m1)
        print("  Replaced normalizeSectionString in Marksheet1")

    if old_return_sec in content:
        content = content.replace(old_return_sec, new_return_sec)
        print("  Replaced return in getSectionsForClass")

    if old_update_sec in content:
        content = content.replace(old_update_sec, new_update_sec)
        print("  Replaced updateMarksheetSection in Marksheet")
    elif old_update_sec_m1 in content:
        content = content.replace(old_update_sec_m1, new_update_sec_m1)
        print("  Replaced updateMarksheetSection in Marksheet1")

    if old_sub_sec in content:
        content = content.replace(old_sub_sec, new_sub_sec)
        print("  Replaced getSubjectsForClass in Marksheet")
    elif old_sub_sec_m1 in content:
        content = content.replace(old_sub_sec_m1, new_sub_sec_m1)
        print("  Replaced getSubjectsForClass in Marksheet1")

    if old_heartbeat in content:
        content = content.replace(old_heartbeat, new_heartbeat)
        print("  Replaced heartbeat in Marksheet")
    elif old_heartbeat_m1 in content:
        content = content.replace(old_heartbeat_m1, new_heartbeat_m1)
        print("  Replaced heartbeat in Marksheet1")

    # 7. Update initial HTML select options for filter-section
    old_select_html = """                <select id="filter-section" class="filter-select" onchange="updateMarksheetSection(this.value)">
                    <option value="বিজ্ঞান">বিজ্ঞান</option>"""
    new_select_html = """                <select id="filter-section" class="filter-select" onchange="updateMarksheetSection(this.value)">
                    <option value="All">সকল শাখা (All)</option>
                    <option value="বিজ্ঞান">বিজ্ঞান</option>"""
    if old_select_html in content:
        content = content.replace(old_select_html, new_select_html)
        print("  Added 'All' to initial filter-section select in Marksheet")

    old_select_html_m1 = """        <select id="filter-section" class="filter-select" onchange="updateMarksheetSection(this.value)">
            <option value="বিজ্ঞান">বিজ্ঞান</option>"""
    new_select_html_m1 = """        <select id="filter-section" class="filter-select" onchange="updateMarksheetSection(this.value)">
            <option value="All">সকল শাখা (All)</option>
            <option value="বিজ্ঞান">বিজ্ঞান</option>"""
    if old_select_html_m1 in content:
        content = content.replace(old_select_html_m1, new_select_html_m1)
        print("  Added 'All' to initial filter-section select in Marksheet1")

    # 8. Batch banner button label
    old_batch_btn = """<span>Print ${isFiltered ? 'Filtered' : 'All'}</span>"""
    new_batch_btn = """<span>${isEn ? "Print / Download (PDF)" : "একসাথে প্রিন্ট / PDF ডাউনলোড"}</span>"""
    if old_batch_btn in content:
        content = content.replace(old_batch_btn, new_batch_btn)
        print("  Updated batch banner button label")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Finished {filename}!\n")

apply_updates('Marksheet.html')
apply_updates('Marksheet1.html')

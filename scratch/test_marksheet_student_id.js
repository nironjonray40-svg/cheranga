const fs = require('fs');
const vm = require('vm');

function testStudentId(filename) {
    console.log(`=== Testing Student ID in ${filename} ===`);
    const content = fs.readFileSync(filename, 'utf8');
    const scripts = content.match(/<script[\s\S]*?<\/script>/gi);

    const testStudents = [
        { roll: '1', nameBn: 'সার্থক শর্মা — S', name: 'Sarthak Sharma', studentId: '0001', regNo: '260091', class: 'Ten', section: 'ব্যবসায়' },
        { roll: '2', nameBn: 'সন্ধ্যা রায় — S', name: 'Sandhya Roy', studentId: '0002', regNo: '260112', class: 'Ten', section: 'ব্যবসায়' },
        { roll: '1', nameBn: 'প্রশান্ত রায় — S', name: 'Prashanta Roy', studentId: '0001', regNo: '260092', class: 'Nine', section: 'ব্যবসায়' },
        { roll: '1', nameBn: 'সুশান্ত কুমার রায়', name: 'Sushanto Kumar Ray', studentId: '0001', regNo: '2606001', class: 'Six', section: 'A' },
        { roll: '1', nameBn: 'শংকর চন্দ্র রায়', name: 'Shankar Chandra Roy', studentId: '0001', regNo: '2607001', class: 'Seven', section: 'A' },
        { roll: '1', nameBn: 'সুমাইয়া আক্তার', name: 'Sumaiya Akter', studentId: '0001', regNo: '2608001', class: 'Eight', section: 'A' }
    ];

    const mockStorage = {
        'school_students': JSON.stringify(testStudents),
        'school_marksheet_class': 'Ten',
        'school_marksheet_section': 'ব্যবসায়',
        'school_marksheet_exam': 'বার্ষিক পরীক্ষা ২০২৫'
    };

    const elements = {
        'filter-class': { value: 'Ten', options: [] },
        'filter-section': { value: 'ব্যবসায়', options: [] },
        'filter-exam': { value: 'বার্ষিক পরীক্ষা ২০২৫', options: [] },
        'filter-student-search': { value: '' },
        'btn-clear-search': { style: {} },
        'search-suggestions-dropdown': { style: {}, innerHTML: '' },
        'display-student-name': { innerText: '' },
        'display-student-val': { innerText: '' },
        'display-roll-no': { innerText: '' },
        'display-roll-val': { innerText: '' },
        'display-student-id': { innerText: '' },
        'display-id-val': { innerText: '' },
        'display-class-name': { innerText: '' },
        'display-class-val': { innerText: '' },
        'display-section-name': { innerText: '' },
        'display-section-val': { innerText: '' },
        'display-exam-name': { innerText: '' },
        'display-exam-name-pill': { innerText: '' },
        'display-student-religion': { innerText: '' },
        'display-religion-val': { innerText: '' },
        'row-optional-subject': { style: {} },
        'display-optional-subject': { innerText: '' },
        'display-optional-val': { style: {}, innerText: '' },
        'label-opt-val': { style: {} },
        'colon-opt-val': { style: {} },
        'single-marksheet-container': { style: {} },
        'single-certificate-sheet': { style: {} },
        'batch-marksheets-container': { style: {}, innerHTML: '' },
        'btn-create-all': { classList: { add: () => {}, remove: () => {} } },
        'create-all-btn-text': { innerText: '' },
        'marksheet-tbody': { innerHTML: '' },
        'transcript-tbody-1': { innerHTML: '' }
    };

    const context = {
        console,
        document: {
            getElementById: (id) => elements[id] || { style: {}, innerText: '', value: '' },
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {}
        },
        sessionStorage: {
            getItem: () => 'true',
            setItem: () => {}
        },
        window: {
            addEventListener: () => {},
            location: { search: '', href: '', replace: () => {} }
        },
        localStorage: {
            getItem: (k) => mockStorage[k] || null,
            setItem: (k, v) => { mockStorage[k] = String(v); }
        },
        setTimeout: () => {},
        setInterval: () => {},
        fetch: () => Promise.resolve({ json: () => Promise.resolve({}) })
    };

    vm.createContext(context);
    scripts.forEach(s => {
        const code = s.replace(/^<script.*?>/i, '').replace(/<\/script>$/i, '');
        vm.runInContext(code, context);
    });

    // Test 1: getEffectiveStudentId unit checks
    const s1 = testStudents[0]; // Ten, regNo 260091
    const effId1 = context.getEffectiveStudentId(s1);
    console.log(`Student ${s1.nameBn} -> Effective ID:`, effId1, "Bn:", context.toBnDigits(effId1));
    console.log("Is Effective ID 260091?", effId1 === '260091' ? "PASS" : "FAIL");

    const s6 = testStudents[3]; // Six, regNo 2606001
    const effId6 = context.getEffectiveStudentId(s6);
    console.log(`Student ${s6.nameBn} -> Effective ID:`, effId6, "Bn:", context.toBnDigits(effId6));
    console.log("Is Effective ID 2606001?", effId6 === '2606001' ? "PASS" : "FAIL");

    // Test 2: Fallback when student has no regNo or studentId
    const fallbackStd = { roll: '1', class: 'Ten' };
    const fbId = context.getEffectiveStudentId(fallbackStd, 'Ten', 1);
    console.log("Fallback student Ten Roll 1 -> ID:", fbId);
    console.log("Is fallback 2610001?", fbId === '2610001' ? "PASS" : "FAIL");

    // Test 3: Single View DOM update in syncCascadingFilters
    context.isCreateAllMode = false;
    context.currentSelectedStudent = s1;
    context.syncCascadingFilters('student_searched');
    const domId = filename === 'Marksheet.html' ? elements['display-student-id'].innerText : elements['display-id-val'].innerText;
    console.log("Single View DOM ID:", domId);
    console.log("Is Single View DOM ID ২৬০০৯১?", domId === context.toBnDigits('260091') ? "PASS" : "FAIL");

    // Test 4: Search suggestions badge displays ID
    elements['filter-class'].value = 'Ten';
    context.renderSearchSuggestions('সার্থক');
    const dropdownHtml = elements['search-suggestions-dropdown'].innerHTML;
    console.log("Search suggestion contains ২৬০০৯১?", dropdownHtml.includes(context.toBnDigits('260091')) ? "PASS" : "FAIL");
}

testStudentId('Marksheet.html');
testStudentId('Marksheet1.html');

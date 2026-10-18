const fs = require('fs');

function testFile(filename) {
    console.log(`=== Testing ${filename} ===`);
    const content = fs.readFileSync(filename, 'utf8');

    // Extract JS
    const match = content.match(/<script[\s\S]*?<\/script>/gi);
    if (!match) throw new Error('No script found');

    // We can simulate the functions by creating a virtual DOM / mock environment
    const mockStorage = {
        'school_students': JSON.stringify([
            { roll: '1', nameBn: 'দশমের শিক্ষার্থী ১', name: 'Ten Student 1', studentId: '2026101', class: 'Ten', section: 'বিজ্ঞান' },
            { roll: '2', nameBn: 'দশমের শিক্ষার্থী ২', name: 'Ten Student 2', studentId: '2026102', class: 'Ten', section: 'বিজ্ঞান' },
            { roll: '1', nameBn: 'নবমের শিক্ষার্থী ১', name: 'Nine Student 1', studentId: '2026091', class: 'Nine', section: 'বিজ্ঞান' },
            { roll: '2', nameBn: 'নবমের শিক্ষার্থী ২', name: 'Nine Student 2', studentId: '2026092', class: 'Nine', section: 'বিজ্ঞান' },
            { roll: '1', nameBn: 'অষ্টমের শিক্ষার্থী ১', name: 'Eight Student 1', studentId: '2026081', class: 'Eight', section: 'ক' },
        ]),
        'school_marksheet_class': 'Ten',
        'school_marksheet_section': 'বিজ্ঞান'
    };

    const elements = {
        'filter-class': { value: 'Ten' },
        'filter-section': { value: 'বিজ্ঞান' },
        'filter-student-search': { value: '' },
        'btn-clear-search': { style: {} },
        'search-suggestions-dropdown': { style: {}, innerHTML: '' },
        'display-student-val': { innerText: '' },
        'display-student-name': { innerText: '' },
        'display-roll-val': { innerText: '' },
        'display-roll-no': { innerText: '' },
        'display-id-val': { innerText: '' },
        'display-student-id': { innerText: '' },
        'display-religion-val': { innerText: '' },
        'display-student-religion': { innerText: '' },
        'row-optional-subject': { style: {} },
        'display-optional-subject': { innerText: '' },
        'display-optional-val': { style: {}, innerText: '' },
        'label-opt-val': { style: {} },
        'colon-opt-val': { style: {} },
        'single-marksheet-container': { style: {} },
        'single-certificate-sheet': { style: {} },
        'batch-marksheets-container': { style: {}, innerHTML: '' },
        'btn-create-all': { classList: { add: () => {}, remove: () => {} } },
        'create-all-btn-text': { innerText: '' }
    };

    // Helper functions from the file
    // Let's run the file's script inside a VM or node context
    const vm = require('vm');
    const context = {
        console,
        document: {
            getElementById: (id) => elements[id] || { style: {}, innerText: '', value: '' },
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {}
        },
        sessionStorage: {
            getItem: (k) => 'true',
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
    match.forEach(scriptTag => {
        const code = scriptTag.replace(/^<script.*?>/i, '').replace(/<\/script>$/i, '');
        vm.runInContext(code, context);
    });

    // Test 1: Class is Ten, search for 'নবম' (Nine)
    elements['filter-class'].value = 'Ten';
    context.renderSearchSuggestions('নবম');
    const htmlTen = elements['search-suggestions-dropdown'].innerHTML;
    console.log("Search 'নবম' in Class Ten -> Result:", htmlTen.includes('Ten শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি') ? "PASS: Correctly blocked other class" : "FAIL: " + htmlTen);

    // Test 2: Class is Ten, search for roll 1
    context.renderSearchSuggestions('1');
    const topMatchesTen = context.window._currentSearchMatches || [];
    console.log("Search roll '1' in Class Ten -> Matches count:", topMatchesTen.length);
    console.log("Matched student class:", topMatchesTen.map(s => s.class + ' - ' + s.nameBn));
    const allAreTen = topMatchesTen.every(s => context.normalizeClassString(s.class) === '10');
    console.log("Are all matches strictly Class Ten?", allAreTen ? "PASS" : "FAIL");

    // Test 3: Change Class to Nine, search for roll 1
    elements['filter-class'].value = 'Nine';
    mockStorage['school_marksheet_class'] = 'Nine';
    context.renderSearchSuggestions('1');
    const topMatchesNine = context.window._currentSearchMatches || [];
    console.log("Search roll '1' in Class Nine -> Matches count:", topMatchesNine.length);
    console.log("Matched student class:", topMatchesNine.map(s => s.class + ' - ' + s.nameBn));
    const allAreNine = topMatchesNine.every(s => context.normalizeClassString(s.class) === '9');
    console.log("Are all matches strictly Class Nine?", allAreNine ? "PASS" : "FAIL");

    // Test 4: Clear matches, search for student of another class (e.g. 'দশমের শিক্ষার্থী ১') while in Class Nine
    context.window._currentSearchMatches = [];
    context.currentSelectedStudent = null;
    elements['filter-student-search'].value = 'দশমের শিক্ষার্থী ১';
    context.handleStudentSearchKeydown({ key: 'Enter', preventDefault: () => {} });
    console.log("Enter key searching student of another class while in Class Nine -> selectedStudent:", context.currentSelectedStudent ? context.currentSelectedStudent.nameBn : "null (BLOCKED as expected)");
    console.log("Is selection null?", context.currentSelectedStudent === null ? "PASS" : "FAIL");
}

testFile('Marksheet.html');
testFile('Marksheet1.html');

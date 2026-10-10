const fs = require('fs');
const html = fs.readFileSync('exam-portal.html', 'utf8');

const mockElements = {};
const makeMockEl = (id) => {
    if (!mockElements[id]) {
        mockElements[id] = {
            id,
            value: '',
            innerText: '',
            innerHTML: '',
            style: {},
            classList: {
                add: (c) => console.log(`[DOM ACTION] classList.add("${c}") on #${id}`),
                remove: (c) => console.log(`[DOM ACTION] classList.remove("${c}") on #${id}`),
                contains: () => false
            },
            querySelector: (sel) => makeMockEl(id + '_' + sel),
            querySelectorAll: () => [],
            addEventListener: () => {},
            remove: () => {}
        };
    }
    return mockElements[id];
};

const mockStorage = {
    'school_exam_schedules': JSON.stringify([
        { id: '1', class: 'Class 6', term: 'Half Yearly', subject: 'Bangla', date: '2026-06-15', slNo: '1', examType: 'CQ+MCQ' }
    ]),
    'school_students': JSON.stringify([
        { id: '101', class: 'Class 6', section: 'A', roll: '1', name: 'Rahim', regNo: '1001' },
        { id: '102', class: 'Class 6', section: 'A', roll: '2', name: 'Karim', regNo: '1002' }
    ]),
    'school_subjects': JSON.stringify({
        'Class 6': [{ name: 'Bangla', code: '101' }]
    }),
    'school_student_marks': JSON.stringify({})
};

global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.toBengaliNumber = num => String(num ?? '').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
global.toEnglishDigits = str => String(str ?? '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
global.XLSX = {
    utils: {
        book_new: () => ({}),
        aoa_to_sheet: () => ({ '!cols': [] }),
        book_append_sheet: () => {}
    },
    writeFile: () => {}
};
global.document = {
    getElementById: (id) => makeMockEl(id),
    querySelector: (sel) => makeMockEl(sel),
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: (tag) => makeMockEl(tag),
    body: { appendChild: () => {} }
};
global.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; }
};
global.alert = console.log;
global.confirm = () => true;

const script6 = [...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)][6][1];

try {
    eval(script6);
    console.log('Script 6 loaded.');

    console.log('\n--- 1. Testing openExamMarksEntryModal("1") ---');
    openExamMarksEntryModal('1');

    console.log('\n--- 2. Testing changeMarksEntryViewType("reg_no") ---');
    changeMarksEntryViewType('reg_no');

    console.log('\n--- 3. Testing filterExamMarksModalStudents() ---');
    filterExamMarksModalStudents();

    console.log('\n--- 4. Testing saveExamMarksModal() ---');
    saveExamMarksModal();

    console.log('\n--- 5. Testing downloadExamMarksTemplate() ---');
    downloadExamMarksTemplate();

    console.log('\n--- 6. Testing closeExamMarksEntryModal() ---');
    closeExamMarksEntryModal();

    console.log('\nALL MODAL FUNCTIONS TESTED SUCCESSFULLY WITHOUT ERRORS!');
} catch (e) {
    console.error('ERROR during testing:', e);
}

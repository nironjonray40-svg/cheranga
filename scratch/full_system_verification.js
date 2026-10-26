const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

function runTest(filename) {
    console.log(`\n=================== Testing ${filename} ===================`);
    const html = fs.readFileSync(filename, 'utf-8');

    const scripts = [];
    const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        scripts.push(match[1]);
    }

    const storage = {
        'school_exam_schedules': JSON.stringify([
            { term: '১ম সাময়িক পরীক্ষা ২০২৬', class: 'Nine', subject: 'Bangla 1st' },
            { term: '১ম সাময়িক পরীক্ষা ২০২৬', class: 'Ten', subject: 'Bangla 1st' },
            { term: 'বার্ষিক পরীক্ষা ২০২৬', class: 'Six', subject: 'Math' }
        ]),
        'school_marking_system': JSON.stringify([
            { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
            { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
            { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
            { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
            { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
            { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
            { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
        ]),
        'school_students': JSON.stringify([
            { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', class: 'Ten', section: 'বিজ্ঞান' }
        ])
    };

    const domElements = {};
    function getOrCreateElement(id) {
        if (!domElements[id]) {
            domElements[id] = {
                id,
                innerText: '',
                textContent: '',
                value: '',
                options: [],
                innerHTML: '',
                style: {},
                classList: { add: () => {}, remove: () => {} },
                setAttribute: () => {},
                getAttribute: () => null,
                appendChild: (child) => { domElements[id].options.push(child); }
            };
        }
        return domElements[id];
    }

    const sandbox = {
        window: {
            location: { search: '', replace: () => {}, href: '' },
            addEventListener: () => {}
        },
        document: {
            getElementById: (id) => getOrCreateElement(id),
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: (tag) => ({ tagName: tag, setAttribute: () => {}, textContent: '', value: '' }),
            body: { classList: { add: () => {}, remove: () => {} } },
            addEventListener: () => {}
        },
        localStorage: {
            getItem: (k) => storage[k] || null,
            setItem: (k, v) => { storage[k] = String(v); },
            removeItem: (k) => { delete storage[k]; }
        },
        URLSearchParams: class {
            constructor() {}
            get() { return null; }
        },
        setInterval: () => {},
        setTimeout: () => {},
        fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
        console: console,
        Date: Date,
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        Number: Number,
        String: String,
        Array: Array,
        Object: Object,
        Set: Set,
        Boolean: Boolean
    };
    sandbox.window.document = sandbox.document;
    sandbox.window.localStorage = sandbox.localStorage;

    const context = vm.createContext(sandbox);
    vm.runInContext(scripts[1], context);

    // Initial check
    const examList1 = vm.runInContext("getAllExams()", context);
    console.log("Initial exams:", examList1);
    assert.strictEqual(JSON.stringify(examList1), JSON.stringify(['১ম সাময়িক পরীক্ষা ২০২৬', 'বার্ষিক পরীক্ষা ২০২৬']));

    // Dynamically add a new exam schedule to "Exam List" (school_exam_schedules)
    const newScheduleList = JSON.parse(storage['school_exam_schedules']);
    newScheduleList.push({ term: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬', class: 'Seven', subject: 'English' });
    newScheduleList.push({ term: 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬', class: 'Eight', subject: 'English' });
    storage['school_exam_schedules'] = JSON.stringify(newScheduleList);

    // Verify getAllExams updates continuously
    const examList2 = vm.runInContext("getAllExams()", context);
    console.log("Updated exams after Exam List change:", examList2);
    assert(examList2.includes('প্রাক-নির্বাচনী পরীক্ষা ২০২৬'));

    // Verify getClassesForExam returns Seven and Eight
    const classesNewExam = vm.runInContext("getClassesForExam('প্রাক-নির্বাচনী পরীক্ষা ২০২৬')", context);
    console.log("Classes for 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬':", classesNewExam);
    assert.strictEqual(JSON.stringify(classesNewExam), JSON.stringify(['Seven', 'Eight']));

    // Trigger syncCascadingFilters to simulate real-time live sync
    vm.runInContext("syncCascadingFilters('exam_sync')", context);

    const examSelect = domElements['filter-exam'];
    const classSelect = domElements['filter-class'];

    // Select the new exam
    examSelect.value = 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬';
    vm.runInContext("updateMarksheetExam('প্রাক-নির্বাচনী পরীক্ষা ২০২৬')", context);

    console.log("After selecting 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬':");
    console.log("filter-class innerHTML:", classSelect.innerHTML);
    console.log("selected class:", classSelect.value);

    assert.strictEqual(classSelect.value, 'Seven');
    assert(classSelect.innerHTML.includes('Seven'));
    assert(classSelect.innerHTML.includes('Eight'));
    assert(!classSelect.innerHTML.includes('Ten'));

    // Test rendering single view table
    vm.runInContext("typeof renderMarksheetTable !== 'undefined' ? renderMarksheetTable('Seven', 'ক', { roll: '1', nameBn: 'টেস্ট শিক্ষার্থী' }, 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬') : renderMarksheet1Table('Seven', 'ক', { roll: '1', nameBn: 'টেস্ট শিক্ষার্থী' }, 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬')", context);

    // Test rendering batch view
    vm.runInContext("typeof renderBatchMarksheets !== 'undefined' ? renderBatchMarksheets('Seven', 'ক', 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬') : renderBatchMarksheets1('Seven', 'ক', 'প্রাক-নির্বাচনী পরীক্ষা ২০২৬')", context);

    console.log(`PASSED ALL TESTS for ${filename}!`);
}

runTest('Marksheet.html');
runTest('Marksheet1.html');
console.log("\n>>> ALL SYSTEM VERIFICATIONS PASSED 100% <<<");

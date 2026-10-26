const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

function runTest(filename) {
    console.log(`\n================ Testing ${filename} ================`);
    const html = fs.readFileSync(filename, 'utf-8');

    const scripts = [];
    const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        scripts.push(match[1]);
    }

    const storage = {
        'school_exam_schedules': JSON.stringify([
            { term: 'Elegible test', class: 'Eight', section: 'A, B', subject: 'Bangla 1st' }
        ]),
        'school_students': JSON.stringify([
            { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', class: 'Eight', section: 'A' },
            { roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', class: 'Eight', section: 'B' },
            { roll: '3', nameBn: 'সৌরভ কুমার রায়', class: 'Nine', section: 'বিজ্ঞান', group: 'বিজ্ঞান' }
        ]),
        'school_marking_system': JSON.stringify([
            { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
            { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
            { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
            { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
            { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
            { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
            { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
        ])
    };

    const domElements = {};
    function getOrCreateElement(id) {
        if (!domElements[id]) {
            domElements[id] = {
                id, innerText: '', textContent: '', value: '', options: [], innerHTML: '', style: {},
                classList: { add: () => {}, remove: () => {} },
                setAttribute: () => {}, getAttribute: () => null,
                appendChild: (child) => { domElements[id].options.push(child); }
            };
        }
        return domElements[id];
    }

    const sandbox = {
        window: { location: { search: '', replace: () => {}, href: '' }, addEventListener: () => {} },
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
        URLSearchParams: class { get() { return null; } },
        setInterval: () => {}, setTimeout: () => {},
        fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
        console: console, Date, Math, parseInt, parseFloat, isNaN, Number, String, Array, Object, Set, Boolean
    };
    sandbox.window.document = sandbox.document;
    sandbox.window.localStorage = sandbox.localStorage;

    const context = vm.createContext(sandbox);
    vm.runInContext(scripts[1], context);

    // 1. Verify getSectionsForClass returns 'All' as the first option
    const sectionsEight = vm.runInContext("getSectionsForClass('Eight', 'Elegible test')", context);
    console.log("Sections for Eight:", sectionsEight);
    assert.strictEqual(sectionsEight[0], 'All', "First option must be 'All'");
    assert(sectionsEight.includes('A'), "Must include 'A'");
    assert(sectionsEight.includes('B'), "Must include 'B'");

    // 2. Verify getDisplaySectionName('All') returns 'সকল শাখা (All)'
    const displayAllBn = vm.runInContext("getDisplaySectionName('All')", context);
    console.log("getDisplaySectionName('All'):", displayAllBn);
    assert.strictEqual(displayAllBn, 'সকল শাখা (All)');

    // 3. Verify getAllStudentsForClassAndSection with 'All' returns all students in that class across all sections
    const studentsAll = vm.runInContext("getAllStudentsForClassAndSection('Eight', 'All')", context);
    console.log("Students in Class 8 with section 'All':", studentsAll.map(s => ({ roll: s.roll, name: s.nameBn, sec: s.section })));
    assert.strictEqual(studentsAll.length, 2, "Must return both students of Class 8");
    assert.strictEqual(studentsAll[0].roll, '1');
    assert.strictEqual(studentsAll[0].section, 'A');
    assert.strictEqual(studentsAll[1].roll, '2');
    assert.strictEqual(studentsAll[1].section, 'B');

    // 4. Verify card rendering under 'All' shows each student's OWN section
    const cardFunc = filename.includes('Marksheet1') ? 'generateMarksheet1CardHTML' : 'generateMarksheetCardHTML';
    const card1 = vm.runInContext(`${cardFunc}(${JSON.stringify(studentsAll[0])}, 'Eight', 'All', 'Elegible test', 1)`, context);
    const card2 = vm.runInContext(`${cardFunc}(${JSON.stringify(studentsAll[1])}, 'Eight', 'All', 'Elegible test', 2)`, context);

    assert(card1.includes('শাখা = A') || card1.includes('>A<') || card1.includes('Section = A'), "Student 1 card must show section A");
    assert(card2.includes('শাখা = B') || card2.includes('>B<') || card2.includes('Section = B'), "Student 2 card must show section B");
    assert(!card1.includes('শাখা = All'), "Card 1 must NOT show 'শাখা = All'");
    assert(!card2.includes('শাখা = All'), "Card 2 must NOT show 'শাখা = All'");

    // 5. Verify dynamic Grading System & Scale Thresholds update:
    // Initially: 75 marks out of 100 should be 'A' (min 70, max 79) with gp 4.0
    const evalBefore = vm.runInContext("calculateGradeAndGP(75, 100)", context);
    console.log("Initial grade for 75/100:", evalBefore);
    assert.strictEqual(evalBefore.grade, 'A');
    assert.strictEqual(evalBefore.gp, 4.0);

    // Now user changes Grading System & Scale Thresholds in Exam Portal:
    // Custom threshold: min 75 is now A+ with gp 5.0
    const customMarkingSystem = [
        { id: "1", name: "A+", min: 75, max: 100, gp: 5.0 },
        { id: "2", name: "A", min: 65, max: 74, gp: 4.0 },
        { id: "3", name: "F", min: 0, max: 64, gp: 0.0 }
    ];
    storage['school_marking_system'] = JSON.stringify(customMarkingSystem);

    // Call checkAndSyncMarkingSystem or recalculate
    vm.runInContext("if (typeof checkAndSyncMarkingSystem === 'function') checkAndSyncMarkingSystem()", context);

    const evalAfter = vm.runInContext("calculateGradeAndGP(75, 100)", context);
    console.log("After scale update, grade for 75/100:", evalAfter);
    assert.strictEqual(evalAfter.grade, 'A+', "Grade must update to A+ based on new threshold");
    assert.strictEqual(evalAfter.gp, 5.0, "GP must update to 5.0 based on new threshold");

    console.log(`PASSED ALL TESTS for ${filename}!`);
}

runTest('Marksheet.html');
runTest('Marksheet1.html');
console.log("\n>>> ALL SYSTEM VERIFICATIONS PASSED 100% <<<");

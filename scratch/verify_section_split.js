const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

function testFile(filename) {
    console.log(`\nTesting section split logic in ${filename}...`);
    const html = fs.readFileSync(filename, 'utf-8');

    const scripts = [];
    const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        scripts.push(match[1]);
    }

    const storage = {
        'school_exam_schedules': JSON.stringify([
            { term: 'Elegible test', class: 'Eight', section: 'A, B, C, D', subject: 'Bangla 1st' }
        ]),
        'school_students': JSON.stringify([
            { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', class: 'Eight', section: 'A' },
            { roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', class: 'Eight', section: 'B' }
        ]),
        'school_marking_system': JSON.stringify([
            { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
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

    // 1. Verify getSectionsForClass splits "A, B, C, D" into individual items
    const sections = vm.runInContext("getSectionsForClass('Eight', 'Elegible test')", context);
    console.log("getSectionsForClass('Eight', 'Elegible test') returned:", sections);
    assert(sections.includes('A'), "Must include 'A'");
    assert(sections.includes('B'), "Must include 'B'");
    assert(sections.includes('C'), "Must include 'C'");
    assert(sections.includes('D'), "Must include 'D'");
    assert(!sections.includes('A, B, C, D'), "Must NOT contain combined 'A, B, C, D'");

    // 2. Test student card section rendering with specific student section
    const st1 = { roll: '1', nameBn: 'মো: আব্দুল্লাহ আল নোমান', class: 'Eight', section: 'A' };
    const st2 = { roll: '2', nameBn: 'মোছা: ফাতেমা আক্তার', class: 'Eight', section: 'B' };

    const cardFunc = filename.includes('Marksheet1') ? 'generateMarksheet1CardHTML' : 'generateMarksheetCardHTML';

    // Even if selectedSection is "A, B, C, D", the card should display the student's own section:
    const cardHtml1 = vm.runInContext(`${cardFunc}(${JSON.stringify(st1)}, 'Eight', 'A, B, C, D', 'Elegible test', 1)`, context);
    assert(cardHtml1.includes('শাখা = A') || cardHtml1.includes('>A<') || cardHtml1.includes('Section = A'), "Student 1 card must show section A");
    assert(!cardHtml1.includes('শাখা = A, B, C, D'), "Card 1 must NOT show 'শাখা = A, B, C, D'");

    const cardHtml2 = vm.runInContext(`${cardFunc}(${JSON.stringify(st2)}, 'Eight', 'A, B, C, D', 'Elegible test', 2)`, context);
    assert(cardHtml2.includes('শাখা = B') || cardHtml2.includes('>B<') || cardHtml2.includes('Section = B'), "Student 2 card must show section B");
    assert(!cardHtml2.includes('শাখা = A, B, C, D'), "Card 2 must NOT show 'শাখা = A, B, C, D'");

    console.log(`PASSED section split tests in ${filename}!`);
}

testFile('Marksheet.html');
testFile('Marksheet1.html');
console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");

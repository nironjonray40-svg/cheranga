const fs = require('fs');

function extractScripts(html) {
    const scripts = [];
    const re = /<script.*?>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        scripts.push(m[1]);
    }
    return scripts.join('\n;\n');
}

// Mock browser environment
function createMockEnvironment(langParam = null) {
    const storage = {};
    const elements = {};

    function createElement(id, tag = 'div') {
        const el = {
            id: id,
            tagName: tag.toUpperCase(),
            innerText: '',
            innerHTML: '',
            value: '',
            placeholder: '',
            style: {},
            classList: {
                add: () => {},
                remove: () => {},
                contains: () => false
            },
            options: [],
            addEventListener: () => {}
        };
        elements[id] = el;
        return el;
    }

    // Pre-create IDs expected in Marksheet.html & Marksheet1.html
    const ids = [
        'label-exam', 'label-class', 'label-section', 'label-search', 'filter-student-search',
        'label-language', 'filter-language', 'label-template', 'create-all-btn-text', 'btn-print-text',
        'label-student-name', 'label-roll-no', 'label-class-name', 'label-student-religion',
        'label-optional-subject', 'label-student-id', 'th-header-sub', 'th-header-mcq',
        'th-header-cq', 'th-header-prac', 'th-header-total', 'th-header-combined',
        'th-header-grade', 'th-header-point', 'td-label-rank', 'td-label-grand-total',
        'td-label-gpa', 'td-label-grade', 'label-sig-guardian', 'label-sig-head',
        'display-student-name', 'display-roll-no', 'display-student-id', 'display-class-name',
        'display-section-name', 'display-exam-name', 'display-student-religion', 'row-optional-subject',
        'display-optional-subject', 'marksheet-grading-scale-table', 'display-grand-total',
        'display-gpa', 'display-final-grade', 'display-rank-val',
        // Marksheet1 IDs
        'p-label-name', 'p-label-class', 'p-label-section', 'p-label-id', 'p-label-roll',
        'p-label-religion', 'label-opt-val', 'colon-opt-val', 'display-student-val',
        'display-class-val', 'display-section-val', 'display-id-val', 'display-roll-val',
        'display-religion-val', 'display-optional-val', 'legend-title-1', 'legend-th-range-1',
        'legend-th-grade-1', 'legend-th-gp-1', 'grading-legend-tbody-1', 'th-header-sub-1',
        'th-header-full-1', 'th-header-obtained-1', 'th-header-mcq-1', 'th-header-cq-1',
        'th-header-prac-1', 'th-header-total-1', 'th-header-combined-1', 'th-header-grade-1',
        'th-header-gp-1', 'transcript-tbody-1', 'kpi-label-total', 'display-grand-total-1',
        'kpi-label-gpa', 'display-gpa-1', 'kpi-label-grade', 'display-final-grade-1',
        'kpi-label-pos', 'display-merit-pos-1', 'label-sig-guardian-1', 'label-sig-teacher-1',
        'label-sig-head-1', 'display-exam-name-pill'
    ];

    ids.forEach(id => createElement(id));

    const window = {
        location: {
            search: langParam ? `?lang=${langParam}` : '',
            href: '',
            replace: () => {}
        },
        sessionStorage: {
            getItem: (k) => 'true',
            setItem: () => {},
            removeItem: () => {}
        },
        localStorage: {
            getItem: (k) => storage[k] || null,
            setItem: (k, v) => { storage[k] = String(v); },
            removeItem: (k) => { delete storage[k]; }
        },
        addEventListener: () => {},
        setInterval: () => {},
        document: {
            getElementById: (id) => elements[id] || createElement(id),
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {}
        }
    };

    return { window, document: window.document, localStorage: window.localStorage, elements };
}

// Test Marksheet.html
console.log("=== Testing Marksheet.html ===");
const html0 = fs.readFileSync('Marksheet.html', 'utf-8');
const script0 = extractScripts(html0);

// Case 1: Initial launch without lang parameter -> MUST BE 'bn'
{
    const env = createMockEnvironment();
    const sandbox = {
        window: env.window,
        document: env.document,
        localStorage: env.localStorage,
        sessionStorage: env.window.sessionStorage,
        console: console,
        URLSearchParams: URLSearchParams,
        setInterval: () => {},
        clearInterval: () => {},
        setTimeout: () => {},
        clearTimeout: () => {}
    };

    const vm = require('vm');
    const ctx = vm.createContext(sandbox);
    vm.runInContext(script0, ctx);

    console.log("[Test 1: Default Lang] currentLanguage:", ctx.window.currentLanguage);
    if (ctx.window.currentLanguage !== 'bn') {
        throw new Error("FAIL: Default language should strictly be 'bn'");
    }
    console.log("[PASS] Initial launch defaults to Bengali ('bn')!");

    // Check UI labels in Bengali
    ctx.updateLanguageUI();
    console.log("  label-exam:", env.elements['label-exam'].innerText);
    console.log("  label-class:", env.elements['label-class'].innerText);
    console.log("  th-header-sub:", env.elements['th-header-sub'].innerText);
    console.log("  th-header-point:", env.elements['th-header-point'].innerText);
    console.log("  formatDigits(10):", ctx.formatDigits(10));
    console.log("  getDisplaySubjectName('বাংলা ১ম পত্র'):", ctx.getDisplaySubjectName('বাংলা ১ম পত্র'));
    console.log("  getDisplaySubjectName('Mathematics'):", ctx.getDisplaySubjectName('Mathematics'));

    // Switch to English
    console.log("\n[Test 2: Switching to English]");
    ctx.switchLanguage('en');
    console.log("  currentLanguage after switch:", ctx.window.currentLanguage);
    console.log("  label-exam:", env.elements['label-exam'].innerText);
    console.log("  label-class:", env.elements['label-class'].innerText);
    console.log("  th-header-sub:", env.elements['th-header-sub'].innerText);
    console.log("  th-header-point:", env.elements['th-header-point'].innerText);
    console.log("  formatDigits(10):", ctx.formatDigits(10));
    console.log("  getDisplaySubjectName('বাংলা ১ম পত্র'):", ctx.getDisplaySubjectName('বাংলা ১ম পত্র'));
    console.log("  getDisplaySubjectName('Mathematics'):", ctx.getDisplaySubjectName('Mathematics'));
    console.log("  getDisplayExamName('বার্ষিক পরীক্ষা - ২০২৬'):", ctx.getDisplayExamName('বার্ষিক পরীক্ষা - ২০২৬'));
    console.log("  getDisplayClassName('10'):", ctx.getDisplayClassName('10'));

    if (env.elements['label-exam'].innerText !== 'Exam:' || ctx.formatDigits(10) !== '10') {
        throw new Error("FAIL: English UI elements not rendered correctly");
    }
    console.log("[PASS] Marksheet.html English switching verified!");
}

// Test Marksheet1.html
console.log("\n=== Testing Marksheet1.html ===");
const html1 = fs.readFileSync('Marksheet1.html', 'utf-8');
const script1 = extractScripts(html1);

// Case 1: Initial launch without lang parameter -> MUST BE 'bn'
{
    const env = createMockEnvironment();
    const sandbox = {
        window: env.window,
        document: env.document,
        localStorage: env.localStorage,
        sessionStorage: env.window.sessionStorage,
        console: console,
        URLSearchParams: URLSearchParams,
        setInterval: () => {},
        clearInterval: () => {},
        setTimeout: () => {},
        clearTimeout: () => {}
    };

    const vm = require('vm');
    const ctx = vm.createContext(sandbox);
    vm.runInContext(script1, ctx);

    console.log("[Test 1: Default Lang] currentLanguage:", ctx.window.currentLanguage);
    if (ctx.window.currentLanguage !== 'bn') {
        throw new Error("FAIL: Default language should strictly be 'bn'");
    }
    console.log("[PASS] Marksheet1.html initial launch defaults to Bengali ('bn')!");

    ctx.updateLanguageUI1();
    console.log("  p-label-name:", env.elements['p-label-name'].innerText);
    console.log("  legend-title-1:", env.elements['legend-title-1'].innerText);
    console.log("  th-header-sub-1:", env.elements['th-header-sub-1'].innerText);
    console.log("  kpi-label-total:", env.elements['kpi-label-total'].innerText);

    // Switch to English
    console.log("\n[Test 2: Switching to English]");
    ctx.switchLanguage('en');
    console.log("  currentLanguage after switch:", ctx.window.currentLanguage);
    console.log("  p-label-name:", env.elements['p-label-name'].innerText);
    console.log("  p-label-class:", env.elements['p-label-class'].innerText);
    console.log("  legend-title-1:", env.elements['legend-title-1'].innerText);
    console.log("  th-header-sub-1:", env.elements['th-header-sub-1'].innerText);
    console.log("  th-header-gp-1:", env.elements['th-header-gp-1'].innerText);
    console.log("  kpi-label-total:", env.elements['kpi-label-total'].innerText);
    console.log("  kpi-label-pos:", env.elements['kpi-label-pos'].innerText);
    console.log("  label-sig-head-1:", env.elements['label-sig-head-1'].innerText);

    if (env.elements['p-label-name'].innerText !== 'Student Name' || env.elements['kpi-label-total'].innerText !== 'Total Marks Obtained') {
        throw new Error("FAIL: Marksheet1.html English UI elements not rendered correctly");
    }
    console.log("[PASS] Marksheet1.html English switching verified!");
}

console.log("\n[SUCCESS] ALL BILINGUAL TESTS PASSED WITH 100% SUCCESS!");

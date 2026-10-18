const fs = require('fs');
const vm = require('vm');

const schedulesRaw = fs.readFileSync('scratch/schedules_dump.json', 'utf8');
const marksRaw = fs.readFileSync('scratch/marks_dump.json', 'utf8');
const typesRaw = fs.readFileSync('scratch/types_dump.json', 'utf8');

function testFile(fileName) {
    console.log(`\n================ Testing ${fileName} ================`);
    const content = fs.readFileSync(fileName, 'utf8');

    // 1. Standard scale
    const stdRules = [
        { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
        { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
        { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
        { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
        { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
        { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
        { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
    ];

    let store = {
        'school_exam_schedules': schedulesRaw,
        'school_student_marks': marksRaw,
        'school_exam_types': typesRaw,
        'school_marking_system': JSON.stringify(stdRules),
        'currentUser': JSON.stringify({ role: 'admin' })
    };

    const mockElements = {};
    const sandbox = {
        localStorage: {
            getItem: (k) => store[k] || null,
            setItem: (k, v) => { store[k] = v; }
        },
        sessionStorage: { getItem: () => 'true' },
        console: console,
        parseInt: parseInt,
        parseFloat: parseFloat,
        Number: Number,
        String: String,
        Array: Array,
        Object: Object,
        Set: Set,
        Map: Map,
        Math: Math,
        setInterval: () => {},
        window: { addEventListener: () => {}, location: { replace: () => {}, href: '' } },
        document: {
            getElementById: (id) => {
                if (!mockElements[id]) mockElements[id] = { innerText: '', innerHTML: '', style: {} };
                return mockElements[id];
            },
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {}
        }
    };

    const scripts = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
    const mainScript = scripts.find(s => s.includes('calculateGradeAndGP'));
    const scriptCode = mainScript.replace(/<script.*?>/i, '').replace(/<\/script>/i, '');

    vm.createContext(sandbox);
    vm.runInContext(scriptCode, sandbox);

    console.log("--- Test 1: Standard 5.00 Scale ---");
    const r1 = sandbox.calculateGradeAndGP(40, 50); // 80%
    console.log("40 out of 50 (80%): Grade =", r1.grade, ", GP =", r1.gp);
    const r2 = sandbox.calculateGradeAndGP(35, 50); // 70%
    console.log("35 out of 50 (70%): Grade =", r2.grade, ", GP =", r2.gp);
    const r3 = sandbox.calculateGradeAndGP(75, 100); // 75%
    console.log("75 out of 100 (75%): Grade =", r3.grade, ", GP =", r3.gp);
    const r4 = sandbox.calculateGradeAndGP(32, 100); // 32%
    console.log("32 out of 100 (32%): Grade =", r4.grade, ", GP =", r4.gp);

    console.log("\n--- Test 2: Custom Scale (A+ starting at 75%) ---");
    const customRules = [
        { id: "1", name: "A+", min: 75, max: 100, gp: 5.0 },
        { id: "2", name: "A", min: 65, max: 74, gp: 4.0 },
        { id: "3", name: "B", min: 50, max: 64, gp: 3.0 },
        { id: "4", name: "F", min: 0, max: 49, gp: 0.0 }
    ];
    store['school_marking_system'] = JSON.stringify(customRules);
    const c1 = sandbox.calculateGradeAndGP(38, 50); // 76% -> now A+
    console.log("38 out of 50 (76%): Grade =", c1.grade, ", GP =", c1.gp, "(was A, now A+)");
    const c2 = sandbox.calculateGradeAndGP(24, 50); // 48% -> now F
    console.log("24 out of 50 (48%): Grade =", c2.grade, ", GP =", c2.gp, "(now F)");

    console.log("\n--- Test 3: getSubjectsForClass fullMarks check for 'Elegileble test' ---");
    const rows = sandbox.getSubjectsForClass('Eight', 'A', 'Elegileble test', { id: '1', religion: 'Islam' });
    rows.forEach(r => {
        if (r.isCombined) {
            console.log(`  Combined: [${r.name} (${r.fullMarks})] + [${r.pairWith} (${r.pairFull})] -> Total: ${r.fullMarks + r.pairFull}`);
        } else {
            console.log(`  Single: [${r.name} (${r.fullMarks})]`);
        }
    });
}

testFile('Marksheet.html');
testFile('Marksheet1.html');

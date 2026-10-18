const fs = require('fs');
const vm = require('vm');

const schedulesRaw = fs.readFileSync('scratch/schedules_dump.json', 'utf8');
const marksRaw = fs.readFileSync('scratch/marks_dump.json', 'utf8');

function testFile(fileName) {
    console.log(`\n================ Testing ${fileName} ================`);
    const content = fs.readFileSync(fileName, 'utf8');
    
    const store = {
        'school_exam_schedules': schedulesRaw,
        'school_student_marks': marksRaw,
        'currentUser': JSON.stringify({ role: 'admin' })
    };

    const sessionStore = {
        'isLoggedIn': 'true'
    };

    const sandbox = {
        localStorage: {
            getItem: (k) => store[k] || null,
            setItem: (k, v) => { store[k] = v; }
        },
        sessionStorage: {
            getItem: (k) => sessionStore[k] || null,
            setItem: (k, v) => { sessionStore[k] = v; }
        },
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
        window: {
            addEventListener: () => {},
            location: {
                replace: () => {},
                href: 'http://localhost/'
            }
        },
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {}
        }
    };

    const scripts = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
    const mainScript = scripts.find(s => s.includes('getSubjectsForClass'));
    if (!mainScript) {
        console.error("No script match with getSubjectsForClass in", fileName);
        return;
    }
    const scriptCode = mainScript.replace(/<script.*?>/i, '').replace(/<\/script>/i, '');

    vm.createContext(sandbox);
    try {
        vm.runInContext(scriptCode, sandbox);
    } catch(e) {
        console.error("Error evaluating script:", e.message);
    }

    if (typeof sandbox.getSubjectsForClass === 'function') {
        const rows1 = sandbox.getSubjectsForClass('Eight', 'A', 'Elegileble test', { id: '1', religion: 'Islam' });
        console.log("Exam: 'Elegileble test', Class: 'Eight':");
        rows1.forEach(r => {
            if (r.isCombined) {
                console.log(`  Combined: [${r.name}] + [${r.pairWith}] (group: ${r.group})`);
            } else {
                console.log(`  Single: [${r.name}] (group: ${r.group})`);
            }
        });

        const rows2 = sandbox.getSubjectsForClass('Six', 'A', 'বার্ষিক পরীক্ষা', { id: '1', religion: 'Islam' });
        console.log("\nExam: 'বার্ষিক পরীক্ষা', Class: 'Six':");
        rows2.forEach(r => {
            if (r.isCombined) {
                console.log(`  Combined: [${r.name}] + [${r.pairWith}] (group: ${r.group})`);
            } else {
                console.log(`  Single: [${r.name}] (group: ${r.group})`);
            }
        });

        const rows3 = sandbox.getSubjectsForClass('Eight', 'A', 'অর্ধ-বার্ষিক পরীক্ষা', { id: '1', religion: 'Islam' });
        console.log("\nExam: 'অর্ধ-বার্ষিক পরীক্ষা', Class: 'Eight':");
        rows3.forEach(r => {
            if (r.isCombined) {
                console.log(`  Combined: [${r.name}] + [${r.pairWith}] (group: ${r.group})`);
            } else {
                console.log(`  Single: [${r.name}] (group: ${r.group})`);
            }
        });
    } else {
        console.error("getSubjectsForClass is not a function in sandbox");
    }
}

testFile('Marksheet.html');
testFile('Marksheet1.html');

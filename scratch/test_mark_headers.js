const fs = require('fs');
const vm = require('vm');

const schedulesRaw = fs.readFileSync('scratch/schedules_dump.json', 'utf8');
const marksRaw = fs.readFileSync('scratch/marks_dump.json', 'utf8');

const typesRaw = fs.readFileSync('scratch/types_dump.json', 'utf8');

function testFile(fileName) {
    console.log(`\n================ Testing ${fileName} ================`);
    const content = fs.readFileSync(fileName, 'utf8');
    
    const store = {
        'school_exam_schedules': schedulesRaw,
        'school_student_marks': marksRaw,
        'school_exam_types': typesRaw,
        'currentUser': JSON.stringify({ role: 'admin' })
    };

    const sessionStore = {
        'isLoggedIn': 'true'
    };

    const mockElements = {};
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
        setInterval: () => {},
        window: {
            addEventListener: () => {},
            location: {
                replace: () => {},
                href: 'http://localhost/'
            }
        },
        document: {
            getElementById: (id) => {
                if (!mockElements[id]) {
                    mockElements[id] = { innerText: '', style: {} };
                }
                return mockElements[id];
            },
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {}
        }
    };

    const scripts = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
    const mainScript = scripts.find(s => s.includes('getExamDistribution'));
    if (!mainScript) {
        console.error("No script match with getExamDistribution in", fileName);
        return;
    }
    const scriptCode = mainScript.replace(/<script.*?>/i, '').replace(/<\/script>/i, '');

    vm.createContext(sandbox);
    try {
        vm.runInContext(scriptCode, sandbox);
    } catch(e) {
        console.error("Error evaluating script:", e.message);
    }

    if (typeof sandbox.getExamDistribution === 'function' && typeof sandbox.updateTableHeaderMarks === 'function') {
        const examsToTest = ['Elegileble test', 'বার্ষিক পরীক্ষা', 'অর্ধ-বার্ষিক পরীক্ষা'];
        examsToTest.forEach(exam => {
            const dist = sandbox.getExamDistribution(exam, 'Eight');
            console.log(`\nExam: '${exam}' -> Dist: MCQ=${dist.mcq}, CQ=${dist.cq}, Prac=${dist.prac}, Total=${dist.total}`);
            sandbox.updateTableHeaderMarks(exam, 'Eight');
            
            const mcqId = fileName.includes('1') ? 'th-header-mcq-1' : 'th-header-mcq';
            const cqId = fileName.includes('1') ? 'th-header-cq-1' : 'th-header-cq';
            const pracId = fileName.includes('1') ? 'th-header-prac-1' : 'th-header-prac';
            const totId = fileName.includes('1') ? 'th-header-total-1' : 'th-header-total';

            console.log(`  Headers rendered in DOM:`);
            console.log(`    MCQ:  "${mockElements[mcqId] ? mockElements[mcqId].innerText : 'N/A'}"`);
            console.log(`    CQ:   "${mockElements[cqId] ? mockElements[cqId].innerText : 'N/A'}"`);
            console.log(`    Prac: "${mockElements[pracId] ? mockElements[pracId].innerText : 'N/A'}"`);
            console.log(`    Total:"${mockElements[totId] ? mockElements[totId].innerText : 'N/A'}"`);
        });
    } else {
        console.error("getExamDistribution or updateTableHeaderMarks not found!");
    }
}

testFile('Marksheet.html');
testFile('Marksheet1.html');

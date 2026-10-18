const fs = require('fs');

const schedules = JSON.parse(fs.readFileSync('scratch/schedules_dump.json', 'utf-8'));
const types = JSON.parse(fs.readFileSync('scratch/types_dump.json', 'utf-8'));
const marks = JSON.parse(fs.readFileSync('scratch/marks_dump.json', 'utf-8'));

const store = {
    'school_exam_schedules': JSON.stringify(schedules),
    'school_exam_types': JSON.stringify(types),
    'school_student_marks': JSON.stringify(marks),
    'school_students': JSON.stringify([
        { id: "102", name: "SAKIB HASAN", roll: "1", class: "Eight", section: "A", religion: "Islam" }
    ]),
    'school_marking_system': JSON.stringify({
        usePercentage: true,
        gradeSystem: 'school',
        classes: {
            "Eight": [
                { min: 80, max: 100, grade: "A+", gp: 5.0 },
                { min: 70, max: 79, grade: "A", gp: 4.0 },
                { min: 60, max: 69, grade: "A-", gp: 3.5 },
                { min: 50, max: 59, grade: "B", gp: 3.0 },
                { min: 40, max: 49, grade: "C", gp: 2.0 },
                { min: 33, max: 39, grade: "D", gp: 1.0 },
                { min: 0, max: 32, grade: "F", gp: 0.0 }
            ]
        }
    })
};

global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = v; }
};

const html = fs.readFileSync('Marksheet.html', 'utf-8');
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const scriptCode = html.slice(scriptStart + 8, scriptEnd);

global.window = {
    addEventListener: () => {},
    localStorage: global.localStorage
};
global.document = {
    getElementById: (id) => ({
        value: '',
        innerText: '',
        innerHTML: '',
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {} }
    }),
    querySelectorAll: () => [],
    addEventListener: () => {}
};

eval(scriptCode);

const testStudent = { id: "102", name: "SAKIB HASAN", roll: "1", class: "Eight", section: "A", religion: "Islam" };
console.log("Testing Student:", testStudent.name, "Roll:", testStudent.roll, "Class:", testStudent.class);

const subjects = getSubjectsForClass('Eight', 'A', 'Elegileble test', testStudent);
console.log("\nResolved Subjects Count:", subjects.length);

subjects.forEach((sub, i) => {
    if (sub.isCombined) {
        const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                              (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
        const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                              (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

        const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—');
        const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
        const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—');

        const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '—');
        const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '—';
        const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '—');

        console.log(`[Combined P1] ${sub.name.padEnd(25)}: MCQ='${p1McqDisplay}', CQ='${p1CqDisplay}', Prac='${p1PrDisplay}' (fullMarks: ${sub.fullMarks}, mcqFull: ${sub.mcqFull}, pracFull: ${sub.pracFull})`);
        console.log(`[Combined P2] ${sub.pairWith.padEnd(25)}: MCQ='${p2McqDisplay}', CQ='${p2CqDisplay}', Prac='${p2PrDisplay}' (fullMarks: ${sub.pairFull}, mcqFull: ${sub.pairMcqFull}, pracFull: ${sub.pairPracFull})`);
    } else {
        const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                            (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
        const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—');
        const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
        const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—');

        console.log(`[Single]      ${sub.name.padEnd(25)}: MCQ='${mcqDisplay}', CQ='${cqDisplay}', Prac='${prDisplay}' (fullMarks: ${sub.fullMarks}, mcqFull: ${sub.mcqFull}, pracFull: ${sub.pracFull})`);
    }
});

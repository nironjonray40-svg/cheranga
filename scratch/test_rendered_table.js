const fs = require('fs');

const schedules = JSON.parse(fs.readFileSync('scratch/schedules_dump.json', 'utf-8'));
const types = JSON.parse(fs.readFileSync('scratch/types_dump.json', 'utf-8'));

// Student 102 with marks
const marks = {
    // English For Today schedule: 1788103216016
    "marks_102_1788103216016": { total: 42, cq: 42, mcq: 0, practical: 0 },
    // English 2nd Paper schedule: 1788103284828
    "marks_102_1788103284828": { total: 38, cq: 38, mcq: 0, practical: 0 },
    // Science schedule: 1788103362043
    "marks_102_1788103362043": { total: 45, cq: 27, mcq: 18, practical: 0 }
};

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

// Prevent infinite timeouts
global.setTimeout = () => {};
global.setInterval = () => {};

const html = fs.readFileSync('Marksheet.html', 'utf-8');
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const scriptCode = html.slice(scriptStart + 8, scriptEnd);

global.window = {
    addEventListener: () => {},
    localStorage: global.localStorage
};
let renderedTbodyHtml = '';
global.document = {
    getElementById: (id) => ({
        value: '',
        innerText: '',
        set innerHTML(val) {
            if (id === 'marksheet-tbody') renderedTbodyHtml = val;
        },
        get innerHTML() { return ''; },
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {} }
    }),
    querySelectorAll: () => [],
    addEventListener: () => {}
};

eval(scriptCode);

const testStudent = { id: "102", name: "SAKIB HASAN", roll: "1", class: "Eight", section: "A", religion: "Islam" };
renderMarksheetTable('Eight', 'A', testStudent, 'Elegileble test');

console.log("=== RENDERED MARKSHEET TABLE HTML ROWS ===");
const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
let match;
while ((match = rowRegex.exec(renderedTbodyHtml)) !== null) {
    const rowContent = match[1].replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' ').trim();
    console.log(rowContent);
}

process.exit(0);

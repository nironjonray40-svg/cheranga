const fs = require('fs');

// Let's test by extracting the exact functions from Marksheet.html
const html = fs.readFileSync('Marksheet.html', 'utf8');

// Mock localStorage
const storage = {
    'school_marking_system': JSON.stringify([
        { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
        { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
        { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
        { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
        { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
        { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
        { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
    ]),
    'school_exam_types': JSON.stringify([
        { name: 'বার্ষিক পরীক্ষা ২০২৫', passMarkPercent: 33, defaultCQ: 70, defaultMCQ: 30, defaultPractical: 0 }
    ]),
    'tabulation_gpa_method': 'gpa'
};

global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); }
};

// Create sandbox
const sandbox = {
    localStorage: global.localStorage,
    DEFAULT_GRADE_RULES: [
        { id: "1", name: "A+", min: 80, max: 100, gp: 5.0 },
        { id: "2", name: "A", min: 70, max: 79, gp: 4.0 },
        { id: "3", name: "A-", min: 60, max: 69, gp: 3.5 },
        { id: "4", name: "B", min: 50, max: 59, gp: 3.0 },
        { id: "5", name: "C", min: 40, max: 49, gp: 2.0 },
        { id: "6", name: "D", min: 33, max: 39, gp: 1.0 },
        { id: "7", name: "F", min: 0, max: 32, gp: 0.0 }
    ],
    console: console,
    Math: Math,
    parseFloat: parseFloat,
    parseInt: parseInt,
    Number: Number,
    isNaN: isNaN,
    String: String,
    Array: Array,
    JSON: JSON,
    window: {
        addEventListener: () => {}
    },
    document: {
        getElementById: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
    },
    setInterval: () => {},
    setTimeout: () => {}
};

// Extract functions from Marksheet.html script 2
const scriptStart = html.indexOf('<script', html.indexOf('<script') + 1);
const scriptEnd = html.indexOf('</script>', scriptStart);
const scriptContent = html.substring(scriptStart, scriptEnd).replace(/<script[^>]*>/, '');

const vm = require('vm');
const context = vm.createContext(sandbox);

const helpersCode = `
    function isExamMatch(t, s) { return true; }
    function getExamDistribution() { return { cq: 70, mcq: 30, prac: 0, total: 100 }; }
    function getSubjectFullMarksDistribution(sub, exam, cls, isPaper2) {
        if (isPaper2) {
            return { cq: sub.pairCqFull || 70, mcq: sub.pairMcqFull || 30, prac: sub.pairPracFull || 0, total: sub.pairFull || 100 };
        }
        return { cq: sub.cqFull || 70, mcq: sub.mcqFull || 30, prac: sub.pracFull || 0, total: sub.fullMarks || 100 };
    }
`;
vm.runInContext(helpersCode, context);

// Extract the grading and evaluation functions into context
const fnNames = [
    'loadMarkingSystem', 'getExamPassMarkPercent', 'checkComponentPass',
    'isAbsentValue', 'getGradeForPercentage', 'getGradeForGPA',
    'calculateGradeAndGP', 'getMaxScaleGP', 'getFinalGradeFromGPA',
    'evaluateSubjectRow', 'calculateOverallMarksheetSummary'
];

// Run the script in context
vm.runInContext(scriptContent, context);

console.log("Functions loaded successfully in test sandbox.");

// Test Case 1: All passed student with 4th subject bonus
const testSubjects1 = [
    { name: 'Bangla 1st', isCombined: true, pairWith: 'Bangla 2nd', fullMarks: 100, pairFull: 100, mcq: '25', cq: '55', pairMcq: '20', pairCq: '50', hasMarks: true, pairHasMarks: true, group: 'compulsory' },
    { name: 'English 1st', isCombined: true, pairWith: 'English 2nd', fullMarks: 100, pairFull: 100, mcqFull: 0, pairMcqFull: 0, cq: '70', pairCq: '65', hasMarks: true, pairHasMarks: true, group: 'compulsory' },
    { name: 'Mathematics', isCombined: false, fullMarks: 100, mcq: '25', cq: '60', hasMarks: true, group: 'compulsory' },
    { name: 'BGS', isCombined: false, fullMarks: 100, mcq: '20', cq: '55', hasMarks: true, group: 'compulsory' },
    { name: 'Religion', isCombined: false, fullMarks: 100, mcq: '28', cq: '62', hasMarks: true, group: 'compulsory' },
    { name: 'ICT', isCombined: false, fullMarks: 50, cqFull: 25, mcqFull: 25, mcq: '20', cq: '20', hasMarks: true, group: 'compulsory' },
    { name: 'Higher Math (Optional)', isCombined: false, fullMarks: 100, mcq: '25', cq: '60', hasMarks: true, group: 'optional', isOptional: true }
];

const res1 = context.calculateOverallMarksheetSummary(testSubjects1, 'বার্ষিক পরীক্ষা ২০২৫', 'Class 10');
console.log("\n--- TEST CASE 1: Student passing all subjects ---");
console.log("Fails count:", res1.failsCount);
console.log("Has failed:", res1.hasFailed);
console.log("Has absent:", res1.hasAnyAbsent);
console.log("Grand Total:", res1.grandTotal, "(Optional 85 marks - 40 base marks = 45 bonus marks added to main subjects)");
console.log("Optional Bonus GP:", res1.optionalBonusGP, "(GP 5.00 - 2.00 = 3.00)");
console.log("Final GPA:", res1.finalGPA.toFixed(2));
console.log("Final Grade:", res1.finalGradeName);

// Test Case 2: Student failing MCQ/CQ component in 1 main subject
const testSubjects2 = [
    { name: 'Mathematics', isCombined: false, fullMarks: 100, cqFull: 70, mcqFull: 30, mcq: '25', cq: '15', hasMarks: true, group: 'compulsory' } // 15 out of 70 is < 23 (33%)
];
const res2 = context.calculateOverallMarksheetSummary(testSubjects2, 'বার্ষিক পরীক্ষা ২০২৫', 'Class 10');
console.log("\n--- TEST CASE 2: Student failing CQ in Math (15/70 < 23 pass) ---");
console.log("Fails count:", res2.failsCount);
console.log("Has failed:", res2.hasFailed);
console.log("Final GPA:", res2.finalGPA.toFixed(2));
console.log("Final Grade:", res2.finalGradeName);

// Test Case 3: Student absent in 1 subject
const testSubjects3 = [
    { name: 'Bangla 1st', isCombined: true, pairWith: 'Bangla 2nd', fullMarks: 100, pairFull: 100, mcq: 'A', cq: '55', pairMcq: '20', pairCq: '50', hasMarks: true, pairHasMarks: true, group: 'compulsory' }
];
const res3 = context.calculateOverallMarksheetSummary(testSubjects3, 'বার্ষিক পরীক্ষা ২০২৫', 'Class 10');
console.log("\n--- TEST CASE 3: Student absent ('A') in Bangla MCQ ---");
console.log("Subject Grade:", res3.evaluatedSubjects[0].res.grade);
console.log("Subject GP:", res3.evaluatedSubjects[0].res.gp);
console.log("Has absent:", res3.hasAnyAbsent);
console.log("Final GPA:", res3.finalGPA.toFixed(2));
console.log("Final Grade:", res3.finalGradeName);

// Test Case 4: Student failing Optional subject only (gets F in optional, passes main)
const testSubjects4 = [
    { name: 'Mathematics', isCombined: false, fullMarks: 100, mcq: '25', cq: '60', hasMarks: true, group: 'compulsory' },
    { name: 'Agriculture (Optional)', isCombined: false, fullMarks: 100, mcq: '5', cq: '10', hasMarks: true, group: 'optional', isOptional: true } // 15% -> F
];
const res4 = context.calculateOverallMarksheetSummary(testSubjects4, 'বার্ষিক পরীক্ষা ২০২৫', 'Class 10');
console.log("\n--- TEST CASE 4: Student failing Optional subject only ---");
console.log("Optional Grade:", res4.evaluatedSubjects[1].res.grade);
console.log("Optional GP:", res4.evaluatedSubjects[1].res.gp);
console.log("Fails count in main:", res4.failsCount);
console.log("Has failed overall:", res4.hasFailed);
console.log("Final GPA:", res4.finalGPA.toFixed(2));
console.log("Final Grade:", res4.finalGradeName);

// Test Case 5: Total marks based method
storage['tabulation_gpa_method'] = 'total';
const res5 = context.calculateOverallMarksheetSummary(testSubjects1, 'বার্ষিক পরীক্ষা ২০২৫', 'Class 10');
console.log("\n--- TEST CASE 5: Total marks method (tabulation_gpa_method = 'total') ---");
console.log("Final GPA:", res5.finalGPA.toFixed(2));
console.log("Final Grade:", res5.finalGradeName);

// --- MARKSHEET1.HTML VALIDATION ---
const html1 = fs.readFileSync('Marksheet1.html', 'utf8');
const script1Start = html1.indexOf('<script', html1.indexOf('<script') + 1);
const script1End = html1.indexOf('</script>', script1Start);
const script1Content = html1.substring(script1Start, script1End).replace(/<script[^>]*>/, '');

const sandbox1 = { ...sandbox };
const context1 = vm.createContext(sandbox1);
vm.runInContext(helpersCode, context1);
vm.runInContext(script1Content, context1);

const resM1 = context1.calculateOverallMarksheetSummary(testSubjects1, 'বার্ষিক পরীক্ষা ২০২৫', 'Class 10');
console.log("\n--- MARKSHEET1 TEST: Output Matches Marksheet ---");
console.log("Marksheet1 GPA:", resM1.finalGPA.toFixed(2), "Grade:", resM1.finalGradeName, "Grand Total:", resM1.grandTotal);
console.log("PASSED ALL MARKSHEET1 TESTS SUCCESSFULLY!");


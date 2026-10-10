const optionsBengali = ['ক', 'খ', 'গ', 'ঘ'];

function normalizeSingleOption(val) {
    if (val === null || val === undefined) return null;
    const str = String(val).trim().toUpperCase();
    if (str === 'ক' || str === 'A' || str === '1' || str === '১') return 'ক';
    if (str === 'খ' || str === 'B' || str === '2' || str === '২') return 'খ';
    if (str === 'গ' || str === 'C' || str === '3' || str === '৩') return 'গ';
    if (str === 'ঘ' || str === 'D' || str === '4' || str === '৪') return 'ঘ';
    return null;
}

function normalizeOption(val) {
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) {
        const normList = [];
        val.forEach(v => {
            const n = normalizeSingleOption(v);
            if (n && !normList.includes(n)) normList.push(n);
        });
        normList.sort((a, b) => optionsBengali.indexOf(a) - optionsBengali.indexOf(b));
        if (normList.length === 0) return null;
        if (normList.length === 1) return normList[0];
        return normList;
    }
    const str = String(val).trim();
    if (str.includes(',') || str.includes('/') || str.includes('+') || str.includes(';') || (str.length > 1 && !['ক', 'খ', 'গ', 'ঘ', 'A', 'B', 'C', 'D'].includes(str.toUpperCase()))) {
        const parts = str.split(/[,/+;\s]+/);
        const normList = [];
        parts.forEach(p => {
            const n = normalizeSingleOption(p);
            if (n && !normList.includes(n)) normList.push(n);
        });
        normList.sort((a, b) => optionsBengali.indexOf(a) - optionsBengali.indexOf(b));
        if (normList.length === 0) return null;
        if (normList.length === 1) return normList[0];
        return normList;
    }
    return normalizeSingleOption(str);
}

function isDuplicateOption(ans) {
    if (!ans) return false;
    if (Array.isArray(ans) && ans.length > 1) return true;
    if (typeof ans === 'string' && ans.includes(',')) return true;
    return false;
}

const mockKey = ['ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ',
                 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ',
                 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ', 'গ', 'ঘ', 'ক', 'খ'];

function calculateStudentScore(studentAnswers) {
    let correct = 0;
    let wrong = 0;
    let blank = 0;
    let duplicate = 0;

    for (let q = 1; q <= 30; q++) {
        let studentAns = studentAnswers ? normalizeOption(studentAnswers[q]) : null;
        const correctAns = normalizeSingleOption(mockKey[q - 1]);

        if (!studentAns || (Array.isArray(studentAns) && studentAns.length === 0)) {
            blank++;
        } else if (isDuplicateOption(studentAns)) {
            duplicate++;
            wrong++;
        } else if (correctAns && studentAns === correctAns) {
            correct++;
        } else {
            wrong++;
        }
    }
    return { correct, wrong, blank, duplicate, total: 30 };
}

// Test Case 1: Student filled Question 1 with ['ক', 'গ'] (even though 'ক' is correct answer, multiple bubbles filled means 0 mark!)
const studentAnswers1 = {
    1: ['ক', 'গ'], // Duplicate -> should be 0 mark
    2: 'খ', // Correct
    3: 'গ', // Correct
    4: 'ঘ', // Correct
    5: null, // Blank
};
// 6-30 are blank
const res1 = calculateStudentScore(studentAnswers1);
console.log("Test Case 1 (Q1 has multiple bubbles ['ক', 'গ']):", res1);
console.assert(res1.correct === 3, "Expected 3 correct marks (Q2, Q3, Q4), Q1 must NOT be credited!");
console.assert(res1.duplicate === 1, "Expected 1 duplicate question!");
console.assert(res1.wrong === 1, "Expected 1 wrong/duplicate question!");
console.assert(res1.blank === 26, "Expected 26 blank questions!");

console.log("All test cases passed successfully!");

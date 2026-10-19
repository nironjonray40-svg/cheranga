const fs = require('fs');

function testTemplate(filename) {
    const html = fs.readFileSync(filename, 'utf-8');
    
    // Check key DOM elements
    if (!html.includes('id="filter-marks-breakdown"')) {
        throw new Error(`${filename} missing filter-marks-breakdown`);
    }
    if (!html.includes('.subject-marks-text')) {
        throw new Error(`${filename} missing .subject-marks-text CSS`);
    }
    if (!html.includes('body.hide-subject-marks .subject-marks-text')) {
        throw new Error(`${filename} missing body.hide-subject-marks CSS rule`);
    }
    if (!html.includes('function toggleSubjectMarksBreakdown')) {
        throw new Error(`${filename} missing toggleSubjectMarksBreakdown function`);
    }
    if (!html.includes('function initSubjectMarksBreakdownPreference')) {
        throw new Error(`${filename} missing initSubjectMarksBreakdownPreference function`);
    }
    if (!html.includes('function formatSubjectWithMarks')) {
        throw new Error(`${filename} missing formatSubjectWithMarks function`);
    }
    if (!html.includes('initSubjectMarksBreakdownPreference()')) {
        throw new Error(`${filename} missing initSubjectMarksBreakdownPreference call`);
    }

    console.log(`[PASS] ${filename} verified all toggle & breakdown elements.`);
}

testTemplate('Marksheet.html');
testTemplate('Marksheet1.html');

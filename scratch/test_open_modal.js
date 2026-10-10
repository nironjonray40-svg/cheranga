const fs = require('fs');
const html = fs.readFileSync('exam-portal.html', 'utf-8');

// Check if jsdom is available, or mock browser globals
let jsdom;
try {
    jsdom = require('jsdom');
} catch (e) { }

if (jsdom) {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html, {
        runScripts: "dangerously",
        resources: "usable",
        url: "http://localhost:8000/exam-portal.html"
    });
    const window = dom.window;
    console.log("Window loaded successfully.");
    try {
        console.log("Testing openExamMarksEntryModal with schedule 1791596672085...");
        window.openExamMarksEntryModal('1791596672085');
        const modal = window.document.getElementById('exam-marks-entry-modal');
        console.log("Modal classList:", modal ? modal.className : 'NULL');
        console.log("Active exam students count:", window.activeExamStudents ? window.activeExamStudents.length : 0);
    } catch (err) {
        console.error("ERROR running openExamMarksEntryModal:", err);
    }
} else {
    console.log("JSDOM not installed. Running direct script simulation in Node...");
}

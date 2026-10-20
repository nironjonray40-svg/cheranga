const fs = require('fs');

// Read Tabulation Sheet.html
const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

// Read JSON dumps
const types = fs.readFileSync('scratch/exam_types.json', 'utf8');
const scheds = fs.readFileSync('scratch/exam_schedules.json', 'utf8');

// We simulate the DOM and functions
const { JSDOM } = require('jsdom') || {};
console.log("Testing using custom lightweight DOM parser or JSDOM");

let jsdom;
try {
    jsdom = require('jsdom');
} catch(e) {
    console.log("jsdom not installed, let's check with node script");
}

if (jsdom) {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    const window = dom.window;

    // inject mock localStorage
    window.localStorage.setItem('school_exam_types', types);
    window.localStorage.setItem('school_exam_schedules', scheds);

    console.log("Loaded in JSDOM successfully");
} else {
    console.log("Running functional extraction test directly in node");
}

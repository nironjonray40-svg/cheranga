const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf8');

const match = html.match(/function loadSubjects\(\)\s*\{([\s\S]*?)\n\s*function loadSchedules/);
if (!match) {
    console.error('Could not find loadSubjects in exam-portal.html');
    process.exit(1);
}

const funcBody = match[1];
console.log('loadSubjects found, length:', funcBody.length);

if (funcBody.includes('delete parsed[key]')) {
    console.error('FAIL: delete parsed[key] still found in loadSubjects!');
    process.exit(1);
}

if (funcBody.includes('Class 6')) {
    console.error('FAIL: Class 6 condition still found in loadSubjects!');
    process.exit(1);
}

// Verify server.py
const serverPy = fs.readFileSync('server.py', 'utf8');
if (serverPy.includes('new_value = update_subject_names(value)')) {
    console.error('FAIL: update_subject_names still called in server.py!');
    process.exit(1);
}

console.log('PASS: All backend and frontend subject persistence checks passed!');

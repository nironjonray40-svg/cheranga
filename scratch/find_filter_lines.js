const fs = require('fs');
const lines = fs.readFileSync('Tabulation Sheet.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function filterClass')) {
        console.log('filterClass line:', i + 1);
    }
    if (lines[i].includes('function filterExam')) {
        console.log('filterExam line:', i + 1);
    }
}

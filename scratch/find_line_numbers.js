const fs = require('fs');
const lines = fs.readFileSync('Tabulation Sheet.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function getSubjectMarksDistribution')) {
        console.log('getSubjectMarksDistribution line:', i + 1);
    }
    if (lines[i].includes('function updateDynamicSubjectMarksAndHeaders')) {
        console.log('updateDynamicSubjectMarksAndHeaders line:', i + 1);
    }
}

const fs = require('fs');
const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

const m = html.match(/function getSubjectMarksDistribution[\s\S]*?function getSubjectPracticalStatus/);
if (m) {
    console.log(m[0]);
} else {
    console.log("Not found!");
}

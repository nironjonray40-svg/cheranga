const fs = require('fs');
const html = fs.readFileSync('Tabulation Sheet.html', 'utf8');

const idxIsExamMatch = html.indexOf('function isExamMatch');
const idxGetDist = html.indexOf('function getSubjectMarksDistribution');

console.log('isExamMatch position:', idxIsExamMatch);
console.log('getSubjectMarksDistribution position:', idxGetDist);
console.log('isExamMatch is defined after getSubjectMarksDistribution?', idxIsExamMatch > idxGetDist);

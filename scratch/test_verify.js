const fs = require('fs');
const html = fs.readFileSync('exam-portal.html', 'utf8');

const checks = [
  'id="btnDownloadBlankOMR"',
  'id="btnOpenKeyModal"',
  'id="btnSaveToExamsApi"',
  'id="modalAnswerKey"',
  'id="modalViewEdit"',
  'id="modalOmrGrid"',
  'id="btnSaveEdit"',
  'id="btnCancelEdit"',
  'id="btnSaveAnswerKeys"',
  'handleBlankOmrClick',
  'openAnswerKeyModalDirect',
  'saveOmrToExamsApi'
];

checks.forEach(item => {
  console.log(`${item}: ${html.includes(item) ? 'FOUND (OK)' : 'MISSING (ERROR)'}`);
});

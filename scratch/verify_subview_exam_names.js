const fs = require('fs');

const html = fs.readFileSync('c:/Users/niron/OneDrive/Desktop/Cheranga/exam-portal.html', 'utf8');

const requiredTokens = [
  'id="btn-tab-exam-names"',
  'id="subview-exam-names"',
  'id="kpi-exam-names-total"',
  'id="kpi-exam-names-active-schedules"',
  'id="kpi-exam-names-total-subtypes"',
  'id="subview-update-exam-form"',
  'id="subview-exam-name-select-target"',
  'id="subview-exam-name-input"',
  'id="subview-sync-schedules-checkbox"',
  'id="subview-exam-names-search-input"',
  'id="subview-exam-names-tbody"',
  'function renderExamNamesSubView',
  'function renderExamNamesSubViewTable',
  'function onSubviewTargetExamSelect',
  'function setSubviewExamNamePreset',
  'function editExamNameInSubview',
  'function resetExamNamesSubviewForm',
  'function saveUpdatedExamNameFromSubview',
  'function saveNewExamNameFromSubview',
  'function deleteExamNameInSubview',
  'function filterExamNamesInSubview',
  'function useExamNameInSchedule'
];

let allPassed = true;
requiredTokens.forEach(tok => {
  if (!html.includes(tok)) {
    console.error('Missing token: ' + tok);
    allPassed = false;
  } else {
    console.log('Passed: ' + tok);
  }
});

if (allPassed) {
  console.log('ALL EXAM NAMES SUB-VIEW VERIFICATIONS PASSED 100%!');
} else {
  process.exit(1);
}

const fs = require('fs');

const html = fs.readFileSync('c:/Users/niron/OneDrive/Desktop/Cheranga/exam-portal.html', 'utf8');

const funcs = [
  'openExamNameUpdateModal',
  'closeExamNameUpdateModal',
  'setUpdateExamNamePreset',
  'selectExamNameToEdit',
  'deleteExamNameFromList',
  'renderExamNamesListInUpdateModal',
  'saveUpdatedExamName',
  'onScheduleExamNameSelectChange'
];

let allFound = true;
funcs.forEach(f => {
  if (!html.includes('function ' + f)) {
    console.error('Missing function: ' + f);
    allFound = false;
  } else {
    console.log('Found function: ' + f);
  }
});

const elements = [
  'exam-name-update-modal',
  'modal-update-exam-name-old',
  'modal-update-exam-name-input',
  'modal-sync-schedules-checkbox',
  'modal-exam-names-list-tbody',
  'schedule-exam-name'
];

elements.forEach(id => {
  if (!html.includes(`id="${id}"`)) {
    console.error('Missing element ID: ' + id);
    allFound = false;
  } else {
    console.log('Found element: ' + id);
  }
});

if (allFound) {
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}

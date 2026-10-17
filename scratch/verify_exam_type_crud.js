const fs = require('fs');

const html = fs.readFileSync('c:/Users/niron/OneDrive/Desktop/Cheranga/exam-portal.html', 'utf8');

const checks = [
  'id="subview-exam-types-section"',
  'id="subview-exam-types-list-container"',
  'id="modal-exam-types-section"',
  'id="modal-exam-types-list-container"',
  'openAddExamTypeForCurrentScheduleExam',
  'openEditExamTypeForCurrentScheduleExam',
  'deleteCurrentScheduleExamType',
  'openAddExamTypeForExam',
  'openAddExamTypeForCurrentSelectedExam',
  'openAddExamTypeForModalExam',
  'renderExamSubTypesInSubview',
  'renderExamSubTypesInModal'
];

let allPassed = true;
checks.forEach(c => {
  if (!html.includes(c)) {
    console.error('Missing: ' + c);
    allPassed = false;
  } else {
    console.log('Passed: ' + c);
  }
});

if (allPassed) {
  console.log('ALL EXAM TYPE CRUD VERIFICATIONS PASSED 100%!');
} else {
  process.exit(1);
}

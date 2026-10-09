const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf8');

// Check that the relevant elements and functions are present
const checks = [
  'getStudentsLookupMaps',
  'getStudentEnglishNameById',
  'student-name-en',
  'student-badge-id',
  'toEnglishDigits',
  'id: student.regNo || student.studentId',
  'nameEn: enName'
];

let allOk = true;
checks.forEach(c => {
  if (html.includes(c)) {
    console.log(`[OK] Contains "${c}"`);
  } else {
    console.error(`[FAIL] Missing "${c}"`);
    allOk = false;
  }
});

if (allOk) {
  console.log('\nAll verification checks passed in exam-portal.html!');
} else {
  process.exit(1);
}

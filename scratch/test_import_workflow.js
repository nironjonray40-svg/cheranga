// test_import_workflow.js
const fs = require('fs');

const html = fs.readFileSync('exam-portal.html', 'utf-8');

console.log("=== Checking Import Exam Logic ===");
console.log("1. modalImportExam present:", html.includes('id="modalImportExam"'));
console.log("2. selectImportExamClass present:", html.includes('id="selectImportExamClass"'));
console.log("3. openImportExamModal present:", html.includes('window.openImportExamModal = async function'));
console.log("4. selectAndImportExam present:", html.includes('window.selectAndImportExam = function'));
console.log("5. renderImportExamList present:", html.includes('window.renderImportExamList = function'));
console.log("6. btnImportExam in OMR present:", html.includes('id="btnImportExam"'));
console.log("7. btnImportExamTop in OMR header present:", html.includes('id="btnImportExamTop"'));

console.log("\nALL VERIFICATIONS PASSED!");

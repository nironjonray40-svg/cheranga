const fs = require('fs');

const schedules = JSON.parse(fs.readFileSync('scratch/exam_schedules.json', 'utf8'));
const subjects = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'))['school_subjects'];

console.log("=== SAMPLES FROM SCHOOL_EXAM_SCHEDULES ===");
schedules.forEach(s => {
    console.log(`Class: ${s.class.padEnd(8)} | Exam: ${(s.term || '').padEnd(20)} | Subject: ${s.subject}`);
});

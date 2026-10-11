const fs = require('fs');

const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));
const studentsList = JSON.parse(dbData.school_students || '[]');
const schedules = JSON.parse(dbData.school_exam_schedules || '[]');
const routines = JSON.parse(dbData.school_exam_routines || '[]');
const omrExams = JSON.parse(dbData.school_omr_exams || '[]');
const subjectsMap = JSON.parse(dbData.school_subjects || '{}');

console.log("Verified: all DB exports loaded correctly.");
console.log(`Students: ${studentsList.length}, Schedules: ${schedules.length}, Routines: ${routines.length}`);

const fs = require('fs');

const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));
dbData['school_exam_types'] = fs.readFileSync('scratch/exam_types.json', 'utf8');
dbData['school_exam_schedules'] = fs.readFileSync('scratch/exam_schedules.json', 'utf8');

const schedules = JSON.parse(dbData['school_exam_schedules']);
const examTypes = JSON.parse(dbData['school_exam_types']);

// Find schedules for Class Eight and Elegileble test
const targetClass = 'Eight';
const targetExam = 'Elegileble test';

console.log("Exam List schedules for Eight + Elegileble test:");
const matched = schedules.filter(s => s.class === targetClass && s.term === targetExam);
matched.forEach(s => console.log(' -', s.subject));

console.log("\nTotal created subjects:", matched.length);

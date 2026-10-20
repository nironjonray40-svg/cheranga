const fs = require('fs');

const types = JSON.parse(fs.readFileSync('scratch/exam_types.json', 'utf8'));
const scheds = JSON.parse(fs.readFileSync('scratch/exam_schedules.json', 'utf8'));

console.log('Exam schedules count:', scheds.length);
console.log('Exam types count:', types.length);

// Find schedules for Eight and Elegileble test
const eightScheds = scheds.filter(s => {
    const isTerm = s.term && s.term.toLowerCase().includes('elegileble');
    const isCls = s.class && s.class.toLowerCase().includes('eight');
    return isTerm && isCls;
});

console.log('Eight Elegileble test schedules:');
eightScheds.forEach(s => {
    console.log(`  Subject: ${s.subject} | Code: ${s.code} | ExamType: ${s.examType}`);
});

// Let's inspect school_exam_types for 'Elegileble test'
const et = types.find(t => t.name && t.name.toLowerCase().includes('elegileble'));
console.log('\nExam type for Elegileble test:', JSON.stringify(et, null, 2));

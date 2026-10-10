const fs = require('fs');

const content = fs.readFileSync('exam-portal.html', 'utf-8');

// Basic helper functions matching exam-portal.html
const toEnglishDigits = str => String(str ?? '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
const toBengaliNumber = num => String(num ?? '').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);

function sortStudentsByRegNo(studentsArray) {
    if (!Array.isArray(studentsArray)) return studentsArray;
    return studentsArray.sort((a, b) => {
        const rawA = toEnglishDigits(a.id || a.regNo || a.studentId || '').trim();
        const rawB = toEnglishDigits(b.id || b.regNo || b.studentId || '').trim();
        const numA = parseInt(rawA, 10);
        const numB = parseInt(rawB, 10);

        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
            return numA - numB;
        }
        const cmp = rawA.localeCompare(rawB, undefined, { numeric: true, sensitivity: 'base' });
        if (cmp !== 0) return cmp;

        const rollA = parseInt(toEnglishDigits(a.roll || '0'), 10) || 0;
        const rollB = parseInt(toEnglishDigits(b.roll || '0'), 10) || 0;
        return rollA - rollB;
    });
}

// 1. Test sample student data conversion from schedule import
const sampleInputStudents = [
    { regNo: '২৬০০৯১', roll: '১', class: '8', name: 'Rahim' },
    { regNo: '260113', roll: '2', class: '8', name: 'Karim' },
    { regNo: '২৬০০১৫', roll: '৩', class: '8', name: 'Salam' }
];

const imported = sampleInputStudents.map((student, idx) => {
    const fallbackReg = '2211' + String(student.roll || idx + 1).padStart(3, '0');
    const studentRegId = toEnglishDigits(student.regNo || student.studentId || student.id || fallbackReg).trim();
    return {
        id: studentRegId,
        regNo: studentRegId,
        studentId: studentRegId,
        name: student.name,
        roll: String(student.roll || idx + 1),
        class: '8'
    };
});

sortStudentsByRegNo(imported);

console.log('Imported & Sorted Students:');
imported.forEach((s, idx) => {
    console.log(`[${idx + 1}] ID/Reg: ${s.id} (type: ${typeof s.id}) | Roll: ${s.roll} | Name: ${s.name}`);
});

// Assertions
if (imported[0].id !== '260015') throw new Error('First student reg is incorrect');
if (imported[1].id !== '260091') throw new Error('Second student reg is incorrect');
if (imported[2].id !== '260113') throw new Error('Third student reg is incorrect');

// Check that regex in HTML has English font styling
if (!content.includes("font-family: 'Inter', monospace")) {
    throw new Error("Missing Inter monospace styling in exam-portal.html");
}

console.log('\nAll English Reg No assertions PASSED successfully!');

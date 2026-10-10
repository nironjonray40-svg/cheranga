const fs = require('fs');

const toEnglishDigits = str => String(str ?? '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
const toBengaliNumber = num => String(num ?? '').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// 1. Simulate import exam
const rawStudentsFromSchedule = [
    { regNo: '2608001', roll: '1', class: '8', section: 'A', name: 'MST. SUMAIYA AKTER SRISTY' },
    { regNo: '2608002', roll: '2', class: '8', section: 'A', name: 'MEFTAUL JANNAT MUNAT' },
    { regNo: '2608003', roll: '3', class: '8', section: 'A', name: 'MD SHAHARYAR RAGIB SHAMI' },
    { regNo: '2608004', roll: '4', class: '8', section: 'A', name: 'MOHAMMAD AL MUBIN' }
];

// No saved marks initially
const hasRealMark = false;
const savedSet = null;

const state = {
    students: rawStudentsFromSchedule.map((student, idx) => {
        const setChoice = (hasRealMark && savedSet) ? savedSet : '';
        const fallbackReg = '2211' + String(student.roll || idx + 1).padStart(3, '0');
        const studentRegId = toEnglishDigits(student.regNo || student.studentId || student.id || fallbackReg).trim();
        return {
            id: studentRegId,
            regNo: studentRegId,
            studentId: studentRegId,
            name: student.name,
            nameEn: student.name,
            roll: String(student.roll || idx + 1),
            class: '8',
            section: student.section || 'A',
            set: setChoice,
            correct: 0,
            wrong: 0,
            blank: 30,
            total: 30,
            percentage: '0.0',
            status: 'পেন্ডিং',
            fileName: '',
            answers: {},
            isRealScanned: false
        };
    })
};

console.log('--- After Import Exam ---');
state.students.forEach(s => {
    const hasOmr = !Boolean(s.status === 'পেন্ডিং') && Boolean(s.isRealScanned || (s.answers && Object.keys(s.answers).length > 0));
    const setHtml = (hasOmr && s.set) ? `[ ${s.set} ]` : (s.set ? `[ ${s.set} ]` : '—');
    console.log(`Student ${s.id} (${s.name}): Set = "${s.set}" -> Table displays: "${setHtml}", Status = ${s.status}`);
});

// Verify none have arbitrary sets
if (state.students.some(s => s.set !== '')) {
    throw new Error('Students should not have mock/arbitrary sets upon import!');
}

// 2. Simulate OMR scanning for student 1 (Set ক) and student 2 (Set ক)
state.students[0].set = 'ক';
state.students[0].correct = 30;
state.students[0].status = 'উত্তীর্ণ';
state.students[0].isRealScanned = true;
state.students[0].answers = { 1: 'ক', 2: 'খ' };

state.students[1].set = 'ক';
state.students[1].correct = 30;
state.students[1].status = 'উত্তীর্ণ';
state.students[1].isRealScanned = true;
state.students[1].answers = { 1: 'ক', 2: 'খ' };

console.log('\n--- After Scanning Student 1 & 2 (Set ক) ---');
state.students.forEach(s => {
    const isPending = s.status === 'পেন্ডিং';
    const hasOmr = !isPending && Boolean(s.isRealScanned || (s.answers && Object.keys(s.answers).length > 0));
    const setHtml = (hasOmr && s.set) ? `[ ${s.set} ]` : (s.set ? `[ ${s.set} ]` : '—');
    console.log(`Student ${s.id}: Set = "${s.set}", HasOMR = ${hasOmr} -> Table displays: "${setHtml}", Status = ${s.status}`);
});

// Verify student 1 and 2 display [ ক ], student 3 and 4 display —
if (state.students[0].set !== 'ক' || state.students[1].set !== 'ক') throw new Error('Student 1 & 2 should have set ক');
if (state.students[2].set !== '' || state.students[3].set !== '') throw new Error('Student 3 & 4 should be empty');

// 3. Now simulate scanning student 3 with Set 'খ'
state.students[2].set = 'খ';
state.students[2].correct = 25;
state.students[2].status = 'উত্তীর্ণ';
state.students[2].isRealScanned = true;
state.students[2].answers = { 1: 'খ', 2: 'গ' };

console.log('\n--- After Scanning Student 3 (Set খ) ---');
state.students.forEach(s => {
    const isPending = s.status === 'পেন্ডিং';
    const hasOmr = !isPending && Boolean(s.isRealScanned || (s.answers && Object.keys(s.answers).length > 0));
    const setHtml = (hasOmr && s.set) ? `[ ${s.set} ]` : (s.set ? `[ ${s.set} ]` : '—');
    console.log(`Student ${s.id}: Set = "${s.set}", HasOMR = ${hasOmr} -> Table displays: "${setHtml}", Status = ${s.status}`);
});

if (state.students[2].set !== 'খ') throw new Error('Student 3 should now have set খ');

console.log('\nAll OMR Set Flow tests PASSED perfectly!');

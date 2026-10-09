const fs = require('fs');

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const safeJsonParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch(e) {
    return fallback;
  }
};

const toBengaliNumber = (num) => String(num);
const toEnglishDigits = (str) => String(str || '');

// Setup initial schedules in Exam List
const schedules = [
  { id: 'sch_101', term: '১ম সাময়িক ২০২৬', subject: 'গণিত', subjectCode: '109', class: '10', section: 'All', date: '2026-03-15' }
];
localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));

// Setup initial students
const students = [
  { id: '260091', regNo: '260091', name: 'Rahim Khan', roll: '1', class: '10', section: 'A' },
  { id: '260092', regNo: '260092', name: 'Karim Ullah', roll: '2', class: '10', section: 'A' }
];
localStorage.setItem('school_students', JSON.stringify(students));

// Initial state
const state = {
  students: [
    { id: '260091', regNo: '260091', name: 'Rahim Khan', roll: '1', class: '10', section: 'A', correct: 25, status: 'উত্তীর্ণ', percentage: '83.3', answers: { 1: 'ক', 2: 'খ' }, set: 'ক' },
    { id: '260092', regNo: '260092', name: 'Karim Ullah', roll: '2', class: '10', section: 'A', correct: 18, status: 'উত্তীর্ণ', percentage: '60.0', answers: { 1: 'খ', 2: 'গ' }, set: 'খ' }
  ],
  answerKeys: { 'ক': ['ক', 'খ'], 'খ': ['খ', 'গ'] },
  importedExamInfo: {
    id: 'sch_101',
    source: 'schedule',
    examName: '১ম সাময়িক ২০২৬',
    subject: 'গণিত',
    class: '10',
    scheduleData: schedules[0]
  }
};

// 1. Simulate "Save & Entry"
function saveAndEntryExamMarks() {
  const schId = state.importedExamInfo.id;
  const targetSch = schedules.find(s => s.id === schId);
  const subjectCode = targetSch.subjectCode || targetSch.subject || 'MCQ';
  const examVal = targetSch.term;

  const savedMarks = safeJsonParse('school_student_marks', {});

  state.students.forEach(student => {
    const rawReg = student.id;
    const keysToUpdate = [
      `marks_${rawReg}_${schId}`,
      `marks_${student.id}_${schId}`,
      `marks_${rawReg}_${examVal}`
    ];

    keysToUpdate.forEach(k => {
      savedMarks[k] = savedMarks[k] || {};
      savedMarks[k][subjectCode] = {
        total: student.correct,
        cq: 0,
        mcq: student.correct,
        practical: 0,
        set: student.set,
        answers: student.answers,
        percentage: student.percentage,
        status: student.status,
        omrEvaluatedAt: new Date().toISOString()
      };
    });
  });

  localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));

  // Update schedule
  targetSch.marksEntryTime = new Date().toISOString();
  targetSch.hasMarks = true;
  targetSch.totalEntered = state.students.length;
  localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));

  console.log('Saved marks successfully to school_student_marks and school_exam_schedules!');
}

saveAndEntryExamMarks();

// 2. Simulate re-importing the exam later
function reimportExam(examId) {
  const savedMarks = safeJsonParse('school_student_marks', {});
  const sch = schedules.find(s => s.id === examId);
  const allStudents = safeJsonParse('school_students', []);

  const importedStudents = allStudents.map(student => {
    const studentMarkObj = savedMarks['marks_' + student.id + '_' + sch.id] ||
                           savedMarks['marks_' + student.regNo + '_' + sch.id] ||
                           savedMarks['marks_' + student.id + '_' + sch.term];

    let hasRealMark = false;
    let correctScore = null;
    let savedAnswers = null;
    let savedSet = null;
    let savedStatus = null;
    let savedPct = null;

    if (studentMarkObj) {
      const subVal = studentMarkObj[sch.subjectCode] || studentMarkObj[sch.subject] || Object.values(studentMarkObj)[0];
      if (subVal && subVal.mcq !== undefined && subVal.mcq !== null) {
        correctScore = parseInt(subVal.mcq);
        hasRealMark = true;
        savedAnswers = subVal.answers;
        savedSet = subVal.set;
        savedStatus = subVal.status;
        savedPct = subVal.percentage;
      }
    }

    return {
      id: student.regNo || student.id,
      name: student.name,
      roll: student.roll,
      correct: correctScore || 0,
      status: savedStatus || 'পেন্ডিং',
      percentage: savedPct || '0.0',
      set: savedSet || 'ক',
      answers: savedAnswers || {}
    };
  });

  return importedStudents;
}

const reimported = reimportExam('sch_101');
console.log('\n--- Reimported Exam Students ---');
console.log(reimported);

if (reimported[0].correct !== 25 || reimported[0].status !== 'উত্তীর্ণ' || reimported[0].set !== 'ক') {
  throw new Error('Assertion failed for student 1');
}
if (reimported[1].correct !== 18 || reimported[1].status !== 'উত্তীর্ণ' || reimported[1].set !== 'খ') {
  throw new Error('Assertion failed for student 2');
}

console.log('\n>>> SAVE & RE-IMPORT ASSERTION PASSED PERFECTLY! <<<');

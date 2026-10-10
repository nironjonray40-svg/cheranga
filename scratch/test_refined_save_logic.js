const storage = {};
const localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const safeJsonParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch(e) { return fallback; }
};

// Setup 3 Exam schedules
const schedules = [
  { id: '101', term: 'বার্ষিক পরীক্ষা ২০২৬', subject: 'Bangla 1st', subjectCode: '101', class: '8', section: 'A' },
  { id: '102', term: 'বার্ষিক পরীক্ষা ২০২৬', subject: 'English', subjectCode: '107', class: '8', section: 'A' },
  { id: '103', term: 'বার্ষিক পরীক্ষা ২০২৬', subject: 'Math', subjectCode: '109', class: '8', section: 'A' }
];
localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));

// Setup Students
const students = [
  { id: '1', studentId: 'ST-01', regNo: '2211001', name: 'Alim', roll: '1', class: '8', section: 'A' },
  { id: '2', studentId: 'ST-02', regNo: '2211002', name: 'Bob', roll: '2', class: '8', section: 'A' },
  { id: '3', studentId: 'ST-03', regNo: '2211003', name: 'Cal', roll: '3', class: '8', section: 'A' },
  { id: '4', studentId: 'ST-04', regNo: '2211004', name: 'Dan', roll: '4', class: '8', section: 'A' }
];
localStorage.setItem('school_students', JSON.stringify(students));

// Pre-existing marks:
// Student 1: Bangla 1st has CQ = 45. English (other exam) has CQ = 60, MCQ = 30.
// Student 2: Bangla 1st has CQ = "A".
// Student 3: Bangla 1st has NO marks yet.
// Student 4: Bangla 1st has CQ = 50. (Dan will NOT be evaluated in OMR, pending)
const initialMarks = {
  'marks_1_101': { '101': { cq: 45, total: 45 } },
  'marks_1_102': { '107': { cq: 60, mcq: 30, total: 90 } },
  'marks_1_বার্ষিক পরীক্ষা ২০২৬': { '107': { cq: 60, mcq: 30, total: 90 }, '101': { cq: 45, total: 45 } },
  'marks_2_101': { '101': { cq: 'A', total: 0, isAbsent: true } },
  'marks_4_101': { '101': { cq: 50, total: 50 } }
};
localStorage.setItem('school_student_marks', JSON.stringify(initialMarks));

// OMR State for Bangla 1st (schedule 101)
const state = {
  students: [
    { id: '2211001', regNo: '2211001', roll: '1', class: '8', section: 'A', correct: 25, status: 'উত্তীর্ণ', isRealScanned: true, answers: { 1: 'ক' }, set: 'ক' },
    { id: '2211002', regNo: '2211002', roll: '2', class: '8', section: 'A', correct: 18, status: 'উত্তীর্ণ', isRealScanned: true, answers: { 1: 'খ' }, set: 'ক' },
    { id: '2211003', regNo: '2211003', roll: '3', class: '8', section: 'A', correct: 28, status: 'উত্তীর্ণ', isRealScanned: true, answers: { 1: 'গ' }, set: 'খ' },
    { id: '2211004', regNo: '2211004', roll: '4', class: '8', section: 'A', correct: 0, status: 'পেন্ডিং', isRealScanned: false, answers: {} }
  ],
  importedExamInfo: {
    id: '101',
    source: 'schedule',
    examName: 'বার্ষিক পরীক্ষা ২০২৬',
    subject: 'Bangla 1st',
    class: '8',
    section: 'A'
  }
};

function isRegNoMatch(val1, val2) {
  if (!val1 || !val2) return false;
  return String(val1).trim().toLowerCase() === String(val2).trim().toLowerCase();
}

function saveAndEntryExamMarksLogic() {
  const examInfo = state.importedExamInfo;
  const schId = examInfo.id;
  const nowIso = new Date().toISOString();
  const nowFormatted = new Date().toLocaleString('bn-BD');

  let schedules = safeJsonParse('school_exam_schedules', []);
  let targetSch = schedules.find(s => String(s.id) === String(schId));
  if (targetSch) {
    targetSch.marksEntryTime = nowFormatted;
    targetSch.hasMarks = true;
    targetSch.hasMcqMarks = true;
    targetSch.totalEntered = 3;
    localStorage.setItem('school_exam_schedules', JSON.stringify(schedules));
  }

  let allStudents = safeJsonParse('school_students', []);
  let savedMarks = safeJsonParse('school_student_marks', {});

  const activeExamSubjectCode = (targetSch && targetSch.subjectCode) || '101';
  const targetSubjectKeys = new Set([activeExamSubjectCode, targetSch ? targetSch.subject : null, examInfo.subject].filter(Boolean));
  const examVal = targetSch ? targetSch.term : examInfo.examName;

  state.students.forEach(student => {
    const rawReg = String(student.id || student.regNo || '').trim();
    const rawRoll = String(student.roll || '').trim();
    const isPending = (student.status === 'পেন্ডিং' && !student.isRealScanned && (!student.correct || student.correct === 0));
    
    // Do not modify or create unentered records for pending/unscanned students
    if (isPending) return;

    const mcqScore = typeof student.correct === 'number' ? student.correct : (parseInt(student.correct, 10) || 0);

    let masterSt = allStudents.find(st =>
      isRegNoMatch(st.regNo, rawReg) ||
      isRegNoMatch(st.studentId, rawReg) ||
      isRegNoMatch(st.id, rawReg)
    );
    if (!masterSt) {
      masterSt = allStudents.find(st => String(st.roll || '').trim() === rawRoll);
    }

    const targetStudentIds = new Set();
    if (masterSt) {
      if (masterSt.id !== undefined && masterSt.id !== null) targetStudentIds.add(String(masterSt.id));
      if (masterSt.studentId) targetStudentIds.add(String(masterSt.studentId));
      if (masterSt.regNo) targetStudentIds.add(String(masterSt.regNo));
    }
    if (student.id) targetStudentIds.add(String(student.id));
    if (student.regNo) targetStudentIds.add(String(student.regNo));
    if (student.studentId) targetStudentIds.add(String(student.studentId));
    if (rawReg) targetStudentIds.add(rawReg);

    // Find authoritative existing CQ and Practical marks
    let authoritativeExistingCq = undefined;
    let authoritativeExistingPrac = undefined;

    const candidateLookupKeys = [];
    targetStudentIds.forEach(idVal => {
      candidateLookupKeys.push(`marks_${idVal}_${schId}`);
      candidateLookupKeys.push(`marks_${idVal}_${examVal}`);
    });

    for (const lookupKey of candidateLookupKeys) {
      const record = savedMarks[lookupKey];
      if (record && typeof record === 'object') {
        for (const subKey of targetSubjectKeys) {
          const subObj = record[subKey];
          if (subObj && typeof subObj === 'object') {
            if (authoritativeExistingCq === undefined && subObj.cq !== undefined && subObj.cq !== null && subObj.cq !== '') {
              authoritativeExistingCq = subObj.cq;
            }
            if (authoritativeExistingPrac === undefined && subObj.practical !== undefined && subObj.practical !== null && subObj.practical !== '') {
              authoritativeExistingPrac = subObj.practical;
            }
          }
        }
      }
    }

    let cleanCq = undefined;
    if (authoritativeExistingCq !== undefined && authoritativeExistingCq !== null && authoritativeExistingCq !== '') {
      if (authoritativeExistingCq === 'A' || authoritativeExistingCq === 'ABS' || authoritativeExistingCq === 'ABSENT') {
        cleanCq = 'A';
      } else if (!isNaN(parseInt(authoritativeExistingCq, 10))) {
        cleanCq = parseInt(authoritativeExistingCq, 10);
      }
    }

    let cleanPrac = undefined;
    if (authoritativeExistingPrac !== undefined && authoritativeExistingPrac !== null && authoritativeExistingPrac !== '') {
      if (authoritativeExistingPrac === 'A' || authoritativeExistingPrac === 'ABS' || authoritativeExistingPrac === 'ABSENT') {
        cleanPrac = 'A';
      } else if (!isNaN(parseInt(authoritativeExistingPrac, 10))) {
        cleanPrac = parseInt(authoritativeExistingPrac, 10);
      }
    }

    const numCq = typeof cleanCq === 'number' ? cleanCq : 0;
    const numPrac = typeof cleanPrac === 'number' ? cleanPrac : 0;
    const totalVal = numCq + mcqScore + numPrac;

    const studentMarkPayload = {
      total: totalVal,
      isAbsent: false,
      cq: cleanCq,
      mcq: mcqScore,
      practical: cleanPrac,
      set: student.set || 'ক',
      answers: student.answers || {},
      percentage: student.percentage || ((mcqScore / 30) * 100).toFixed(1),
      status: student.status,
      fileName: student.fileName || '',
      omrEvaluatedAt: nowIso
    };

    targetStudentIds.forEach(stId => {
      // 1. Update Schedule-specific marks: marks_${stId}_${schId}
      const schKey = `marks_${stId}_${schId}`;
      savedMarks[schKey] = savedMarks[schKey] || {};
      targetSubjectKeys.forEach(sKey => {
        savedMarks[schKey][sKey] = studentMarkPayload;
      });

      // 2. Update Term-level marks: marks_${stId}_${examVal} (preserving other subject keys!)
      const termKey = `marks_${stId}_${examVal}`;
      savedMarks[termKey] = savedMarks[termKey] || {};
      savedMarks[termKey][activeExamSubjectCode] = studentMarkPayload;
    });
  });

  savedMarks[`timestamp_${schId}`] = nowFormatted;
  localStorage.setItem('school_student_marks', JSON.stringify(savedMarks));
}

saveAndEntryExamMarksLogic();

const finalMarks = safeJsonParse('school_student_marks', {});
const finalSchedules = safeJsonParse('school_exam_schedules', []);

console.log('--- TEST RESULTS ---');
console.log('Student 1 (Bangla 101):', finalMarks['marks_1_101']['101']);
console.log('Student 1 (English 102 - Other Exam):', finalMarks['marks_1_102']['107']);
console.log('Student 1 (Term Level 101):', finalMarks['marks_1_বার্ষিক পরীক্ষা ২০২৬']['101']);
console.log('Student 1 (Term Level 107 - English):', finalMarks['marks_1_বার্ষিক পরীক্ষা ২০২৬']['107']);
console.log('Student 2 (Absent CQ, Present MCQ):', finalMarks['marks_2_101']['101']);
console.log('Student 3 (New Student):', finalMarks['marks_3_101']['101']);
console.log('Student 4 (Pending/Unscanned - Untouched CQ):', finalMarks['marks_4_101']['101']);
console.log('Other Schedule 102 hasMarks:', finalSchedules.find(s => s.id === '102').hasMarks);
console.log('Target Schedule 101 hasMarks:', finalSchedules.find(s => s.id === '101').hasMarks);

// Assertions
if (finalMarks['marks_1_101']['101'].cq !== 45 || finalMarks['marks_1_101']['101'].mcq !== 25 || finalMarks['marks_1_101']['101'].total !== 70) {
  throw new Error('Assertion failed: Student 1 CQ was altered or MCQ wrong!');
}
if (finalMarks['marks_1_102']['107'].cq !== 60 || finalMarks['marks_1_102']['107'].mcq !== 30) {
  throw new Error('Assertion failed: English marks in schedule 102 were corrupted!');
}
if (finalMarks['marks_1_বার্ষিক পরীক্ষা ২০২৬']['107'].cq !== 60 || finalMarks['marks_1_বার্ষিক পরীক্ষা ২০২৬']['107'].mcq !== 30) {
  throw new Error('Assertion failed: English marks in term were overwritten!');
}
if (finalMarks['marks_2_101']['101'].cq !== 'A' || finalMarks['marks_2_101']['101'].mcq !== 18) {
  throw new Error('Assertion failed: Student 2 CQ was not preserved as A!');
}
if (finalMarks['marks_3_101']['101'].cq !== undefined || finalMarks['marks_3_101']['101'].mcq !== 28 || finalMarks['marks_3_101']['101'].total !== 28) {
  throw new Error('Assertion failed: Student 3 marks wrong!');
}
if (finalMarks['marks_4_101']['101'].cq !== 50) {
  throw new Error('Assertion failed: Student 4 pending marks were corrupted!');
}

console.log('\n>>> ALL 6 RIGOROUS ASSERTIONS PASSED PERFECTLY! <<<');

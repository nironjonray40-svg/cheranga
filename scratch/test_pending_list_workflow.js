const fs = require('fs');

// Simple DOM & state mock to test the logic exactly
const toBengaliNumber = (num) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, d => bn[d]);
};

const toEnglishDigits = (str) => {
  const bn = {'০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'};
  return String(str || '').replace(/[০-৯]/g, d => bn[d]);
};

function isRegNoMatch(regA, regB) {
  if (!regA || !regB) return false;
  const sA = toEnglishDigits(String(regA)).trim();
  const sB = toEnglishDigits(String(regB)).trim();
  if (!sA || !sB) return false;
  if (sA === sB) return true;
  const strippedA = sA.replace(/^0+/, '');
  const strippedB = sB.replace(/^0+/, '');
  if (strippedA && strippedB && strippedA === strippedB) return true;
  return false;
}

// 1. Initial State: Exam imported with 3 students
const state = {
  students: [
    { id: '260091', regNo: '260091', nameEn: 'Rahim Khan', roll: '1', class: '10', correct: 0, status: 'পেন্ডিং', answers: {} },
    { id: '260092', regNo: '260092', nameEn: 'Karim Ullah', roll: '2', class: '10', correct: 0, status: 'পেন্ডিং', answers: {} },
    { id: '260093', regNo: '260093', nameEn: 'Salma Khatun', roll: '3', class: '10', correct: 0, status: 'পেন্ডিং', answers: {} }
  ],
  pendingUnmatchedList: []
};

console.log('--- Initial Imported Students ---');
console.log(state.students.map(s => `${s.id} - ${s.nameEn}: ${s.correct}/30 (${s.status})`));

// 2. Simulate 3 Scanned OMR sheets:
// Sheet A: detectedId = '260091' (Matches Rahim) -> Score: 24/30
// Sheet B: detectedId = '999999' (Unmatched unknown ID) -> Score: 18/30
// Sheet C: detectedId = '0000000' (Unclear bubbles, file name "260093_omr.jpg") -> Score: 27/30

const scannedSheets = [
  { fileName: 'scan_01.jpg', detectedId: '260091', score: { correct: 24, wrong: 4, blank: 2 } },
  { fileName: 'scan_02.jpg', detectedId: '999999', score: { correct: 18, wrong: 10, blank: 2 } },
  { fileName: 'scan_03.jpg', detectedId: '', score: { correct: 27, wrong: 2, blank: 1 } }
];

scannedSheets.forEach(sheet => {
  const rawDetectedId = toEnglishDigits(sheet.detectedId || '').trim();
  const isValidDetectedId = rawDetectedId && !/^0+$/.test(rawDetectedId);

  let matchedStudent = null;
  if (isValidDetectedId) {
    matchedStudent = state.students.find(s => isRegNoMatch(s.id, rawDetectedId));
  }

  if (matchedStudent) {
    matchedStudent.correct = sheet.score.correct;
    matchedStudent.status = sheet.score.correct >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';
    matchedStudent.fileName = sheet.fileName;
  } else {
    state.pendingUnmatchedList.push({
      uid: 'p_' + Math.random().toString(36).substr(2, 6),
      fileName: sheet.fileName,
      detectedId: isValidDetectedId ? rawDetectedId : '',
      scoreInfo: sheet.score,
      status: sheet.score.correct >= 10 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ',
      reason: !isValidDetectedId ? 'রেজিঃ বাবল অপাঠ্য' : 'রেজিঃ মেলেনি'
    });
  }
});

console.log('\n--- After Evaluation Process ---');
console.log('Main Students List:');
console.log(state.students.map(s => `${s.id} - ${s.nameEn}: ${s.correct}/30 (${s.status})`));

console.log('\nPending Unmatched List (Count: ' + state.pendingUnmatchedList.length + '):');
console.log(state.pendingUnmatchedList.map(p => `${p.fileName} (Detected Reg: "${p.detectedId || 'None'}", Score: ${p.scoreInfo.correct}/30) -> Reason: ${p.reason}`));

if (state.pendingUnmatchedList.length !== 2) {
  throw new Error(`Expected 2 pending sheets, got ${state.pendingUnmatchedList.length}`);
}

// 3. User corrects the first pending sheet (scan_02.jpg) -> assigns to Karim Ullah (Reg 260092)
const pendingItem1 = state.pendingUnmatchedList[0];
const targetStudentReg = '260092';

const targetStudent = state.students.find(s => isRegNoMatch(s.id, targetStudentReg));
if (targetStudent) {
  targetStudent.correct = pendingItem1.scoreInfo.correct;
  targetStudent.status = pendingItem1.status;
  targetStudent.fileName = pendingItem1.fileName;
  // Remove from pending
  state.pendingUnmatchedList = state.pendingUnmatchedList.filter(p => p.uid !== pendingItem1.uid);
}

console.log('\n--- After User Corrects Pending Item 1 (Assigned to 260092) ---');
console.log('Main Students List:');
console.log(state.students.map(s => `${s.id} - ${s.nameEn}: ${s.correct}/30 (${s.status})`));
console.log('Remaining Pending Items:', state.pendingUnmatchedList.length);

if (targetStudent.correct !== 18 || targetStudent.status !== 'উত্তীর্ণ') {
  throw new Error('Karim marks failed to attach correctly!');
}

// 4. User corrects the second pending sheet (scan_03.jpg) -> assigns to Salma Khatun (Reg 260093)
const pendingItem2 = state.pendingUnmatchedList[0];
const targetStudent2 = state.students.find(s => isRegNoMatch(s.id, '260093'));
if (targetStudent2) {
  targetStudent2.correct = pendingItem2.scoreInfo.correct;
  targetStudent2.status = pendingItem2.status;
  targetStudent2.fileName = pendingItem2.fileName;
  state.pendingUnmatchedList = state.pendingUnmatchedList.filter(p => p.uid !== pendingItem2.uid);
}

console.log('\n--- After User Corrects Pending Item 2 (Assigned to 260093) ---');
console.log('Main Students List:');
console.log(state.students.map(s => `${s.id} - ${s.nameEn}: ${s.correct}/30 (${s.status})`));
console.log('Remaining Pending Items:', state.pendingUnmatchedList.length);

if (state.pendingUnmatchedList.length !== 0) {
  throw new Error('Expected 0 pending items, got ' + state.pendingUnmatchedList.length);
}

console.log('\n>>> ALL TEST ASSERTIONS PASSED PERFECTLY! <<<');

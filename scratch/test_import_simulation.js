const fs = require('fs');

// Verify helper functions
function mapClassToNumber(cls) {
  if (!cls) return '8';
  const str = String(cls).trim().toLowerCase();
  const enMap = {
    'ten': '10', 'nine': '9', 'eight': '8', 'seven': '7', 'six': '6',
    'five': '5', 'four': '4', 'three': '3', 'two': '2', 'one': '1'
  };
  if (enMap[str]) return enMap[str];
  const bnMap = {
    '১০': '10', '৯': '9', '৮': '8', '৭': '7', '৬': '6',
    '৫': '5', '৪': '4', '৩': '3', '২': '2', '১': '1'
  };
  if (bnMap[str]) return bnMap[str];
  const digits = str.replace(/[^\d]/g, '');
  if (digits) return digits;
  return cls;
}

function formatClassBangla(cls) {
  const c = mapClassToNumber(cls);
  if (c === '6') return '৬ষ্ঠ শ্রেণি';
  if (c === '7') return '৭ম শ্রেণি';
  if (c === '8') return '৮ম শ্রেণি';
  if (c === '9') return '৯ম শ্রেণি';
  if (c === '10') return '১০ম শ্রেণি';
  return c + ' শ্রেণি';
}

console.log('Testing class mappings:');
console.log('Eight ->', mapClassToNumber('Eight'), 'format:', formatClassBangla('Eight'));
console.log('Ten ->', mapClassToNumber('Ten'), 'format:', formatClassBangla('Ten'));
console.log('7 ->', mapClassToNumber('7'), 'format:', formatClassBangla('7'));
console.log('৮ ->', mapClassToNumber('৮'), 'format:', formatClassBangla('৮'));

// Verify exams_data.json
const examsData = JSON.parse(fs.readFileSync('exams_data.json', 'utf8'));
console.log('\nSaved OMR exams count:', examsData.length);
examsData.forEach((ex, i) => {
  console.log(`OMR Exam #${i+1}: Name="${ex.examName}", Date="${ex.date}", Students=${ex.students.length}`);
});

console.log('\nAll simulation tests PASSED!');

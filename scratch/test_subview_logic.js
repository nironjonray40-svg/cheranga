// Test subview functional logic simulation
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = v; },
  removeItem: (k) => { delete storage[k]; }
};

storage['school_exam_types'] = JSON.stringify([
  { id: '1', name: 'Annual Examination 2026', type: 'Annual Exam', examTypes: [{ typeName: 'Main Exam' }] },
  { id: '2', name: 'Half-Yearly Examination 2026', type: 'Half-Yearly Exam', examTypes: [{ typeName: 'Main Exam' }, { typeName: 'Class Test' }] }
]);

storage['school_exam_schedules'] = JSON.stringify([
  { id: 's1', term: 'Annual Examination 2026', subject: 'Bangla' }
]);

function loadExamTypes() {
  return JSON.parse(storage['school_exam_types']);
}

function loadSchedules() {
  return JSON.parse(storage['school_exam_schedules']);
}

// Check KPI calculations
const types = loadExamTypes();
const schedules = loadSchedules();

const total = types.length;
const activeNames = new Set(schedules.map(s => s.term.toLowerCase()));
let totalSubtypes = 0;
types.forEach(t => { totalSubtypes += (t.examTypes ? t.examTypes.length : 1); });

console.log('KPIs:', { total, activeCount: activeNames.size, totalSubtypes });

if (total !== 2 || activeNames.size !== 1 || totalSubtypes !== 3) {
  throw new Error('KPI calculation error');
}

console.log('SUBVIEW LOGIC VERIFICATION PASSED!');

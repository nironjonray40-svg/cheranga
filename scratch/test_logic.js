// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = v; },
  removeItem: (k) => { delete storage[k]; }
};

// Seed schedules with user's term 'বার্ষিক পরীক্ষা'
storage['school_exam_schedules'] = JSON.stringify([
  { id: 'sch_1', term: 'বার্ষিক পরীক্ষা', examType: 'Main Exam', cq: 70, mcq: 30 }
]);

// Helper
function normalizeExamTypeObject(t) {
  if (!t.examTypes) t.examTypes = [];
  return t;
}

// Load exam types test
function loadExamTypes() {
  let stored = localStorage.getItem('school_exam_types');
  let types = [];
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        types = parsed.map(normalizeExamTypeObject);
      }
    } catch (e) {}
  }
  if (!types || types.length === 0) {
    types = [{ id: '1', name: 'Annual Examination 2026', type: 'Annual Exam' }];
  }

  // Auto-merge
  try {
    const schedRaw = localStorage.getItem('school_exam_schedules');
    if (schedRaw) {
      const schedList = JSON.parse(schedRaw);
      let changed = false;
      if (Array.isArray(schedList)) {
        schedList.forEach(s => {
          const termName = (s.term || s.examName || '').trim();
          if (termName && !termName.startsWith('__ACTION_') && !types.some(t => t.name.toLowerCase() === termName.toLowerCase())) {
            types.push({ id: 'auto_1', name: termName, type: s.examType || 'Main Exam' });
            changed = true;
          }
        });
      }
      if (changed) {
        localStorage.setItem('school_exam_types', JSON.stringify(types));
      }
    }
  } catch (e) {}
  return types;
}

const loaded = loadExamTypes();
console.log('Loaded exam types:', loaded.map(t => t.name));
if (!loaded.some(t => t.name === 'বার্ষিক পরীক্ষা')) {
  throw new Error('Auto-merge failed');
}

// Now test updating 'বার্ষিক পরীক্ষা' to 'বার্ষিক পরীক্ষা ২০২৬'
let types = loadExamTypes();
const oldName = 'বার্ষিক পরীক্ষা';
const newName = 'বার্ষিক পরীক্ষা ২০২৬';
const target = types.find(t => t.name.toLowerCase() === oldName.toLowerCase());
target.name = newName;
localStorage.setItem('school_exam_types', JSON.stringify(types));

// Sync schedules
const scheds = JSON.parse(localStorage.getItem('school_exam_schedules'));
scheds.forEach(s => {
  if (s.term === oldName) s.term = newName;
});
localStorage.setItem('school_exam_schedules', JSON.stringify(scheds));

const reloaded = loadExamTypes();
console.log('Reloaded exam types after update:', reloaded.map(t => t.name));
const reloadedScheds = JSON.parse(localStorage.getItem('school_exam_schedules'));
console.log('Synced schedule term:', reloadedScheds[0].term);

if (reloadedScheds[0].term !== 'বার্ষিক পরীক্ষা ২০২৬') {
  throw new Error('Schedule sync failed');
}

console.log('LOGIC UNIT TEST PASSED 100%!');

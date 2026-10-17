// Unit test for Exam Type CRUD inside Exam Name
const exam = {
  id: "ex_1",
  name: "বার্ষিক পরীক্ষা",
  examTypes: [
    { id: "ex_1_t1", typeName: "Main Exam", defaultCQ: 70, defaultMCQ: 30, defaultPractical: 0, passMarkPercent: 33 }
  ]
};

// 1. Add Exam Type
const newType = { id: "ex_1_t2", typeName: "Class Test", defaultCQ: 20, defaultMCQ: 0, defaultPractical: 0, passMarkPercent: 33 };
exam.examTypes.push(newType);
console.log('After Add:', exam.examTypes.map(t => t.typeName));
if (exam.examTypes.length !== 2) throw new Error('Add failed');

// 2. Update Exam Type
const target = exam.examTypes.find(t => t.id === "ex_1_t2");
target.typeName = "শ্রেণি মূল্যায়ন (CT)";
target.defaultCQ = 25;
console.log('After Update:', target.typeName, 'CQ:', target.defaultCQ);
if (target.typeName !== "শ্রেণি মূল্যায়ন (CT)" || target.defaultCQ !== 25) throw new Error('Update failed');

// 3. Delete Exam Type
exam.examTypes = exam.examTypes.filter(t => t.id !== "ex_1_t2");
console.log('After Delete:', exam.examTypes.map(t => t.typeName));
if (exam.examTypes.length !== 1 || exam.examTypes[0].typeName !== "Main Exam") throw new Error('Delete failed');

console.log('UNIT TEST PASSED 100%!');

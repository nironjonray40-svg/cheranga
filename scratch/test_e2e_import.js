// scratch/test_e2e_import.js
const fs = require('fs');

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { store = {}; },
        _getStore: () => store
    };
})();

global.localStorage = localStorageMock;
global.window = global;

const sampleSchedules = [
    { id: "1788103216016", term: "Elegileble test", examType: "", class: "Eight", section: "A", subject: "English For Today", date: "12/03/2026", teacher: "Teacher 1", slNo: "1", createdAt: 1788103216016 },
    { id: "1788103284828", term: "Elegileble test", examType: "", class: "Eight", section: "A", subject: "English Grammar and Composition", date: "13/03/2026", teacher: "Teacher 2", slNo: "2", createdAt: 1788103284828 },
    { id: "1788103332827", term: "Elegileble test", examType: "", class: "Eight", section: "B", subject: "Mathematics", date: "14/03/2026", teacher: "Teacher 3", slNo: "3", createdAt: 1788103332827 },
    { id: "1791645708587", term: "বার্ষিক পরীক্ষা", examType: "Annual Main Exam", class: "Six", section: "A, B", subject: "Science", date: "20/11/2026", teacher: "Teacher 4", slNo: "1", createdAt: 1791645708587 }
];

const sampleStudents = [
    { id: "2608001", studentId: "2608001", regNo: "2608001", name: "Rahim Uddin", nameEn: "Rahim Uddin", roll: "1", class: "Eight", section: "A" },
    { id: "2608002", studentId: "2608002", regNo: "2608002", name: "Karim Khan", nameEn: "Karim Khan", roll: "2", class: "Eight", section: "A" },
    { id: "2608003", studentId: "2608003", regNo: "2608003", name: "Sultana Akter", nameEn: "Sultana Akter", roll: "3", class: "Eight", section: "B" },
    { id: "2606001", studentId: "2606001", regNo: "2606001", name: "Nayeem Hasan", nameEn: "Nayeem Hasan", roll: "1", class: "Six", section: "A" },
    { id: "2606002", studentId: "2606002", regNo: "2606002", name: "Fahmida Begum", nameEn: "Fahmida Begum", roll: "2", class: "Six", section: "B" }
];

localStorage.setItem('school_exam_schedules', JSON.stringify(sampleSchedules));
localStorage.setItem('school_students', JSON.stringify(sampleStudents));
localStorage.setItem('school_classes', JSON.stringify(["Six", "Seven", "Eight", "Nine", "Ten"]));
localStorage.setItem('school_student_marks', JSON.stringify({}));
localStorage.setItem('school_omr_exams', JSON.stringify([]));

const elements = {
    modalImportExam: { style: {}, classList: { add: () => {}, remove: () => {} } },
    selectImportExamClass: { value: 'ALL', innerHTML: '' },
    selectImportExamSource: { value: 'ALL', innerHTML: '' },
    inputImportExamSearch: { value: '', focus: () => {} },
    importExamListContainer: { innerHTML: '' },
    totalAvailableExamsCount: { textContent: '' },
    btnExportExcel: { disabled: true },
    btnPrintTable: { disabled: true }
};

global.document = {
    getElementById: (id) => elements[id] || { style: {}, classList: { add: () => {}, remove: () => {} }, value: '', innerHTML: '', textContent: '' },
    querySelectorAll: () => []
};

global.state = {
    students: [],
    pendingUnmatchedList: [],
    importedExamInfo: null,
    answerKeys: {}
};

global.toBengaliNumber = (num) => String(num ?? '').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
global.toEnglishDigits = (str) => String(str ?? '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
global.formatClassBangla = (cls) => cls;
global.mapClassToNumber = (cls) => cls;
global.getClassColor = () => '#4f46e5';
global.safeJsonParse = (key, def) => {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
};
global.loadSchedules = () => safeJsonParse('school_exam_schedules', []);
global.loadStudents = () => safeJsonParse('school_students', []);
global.loadClasses = () => safeJsonParse('school_classes', []);
global.loadStudentMarks = () => safeJsonParse('school_student_marks', {});
global.sortStudentsByRegNo = (arr) => arr.sort((a,b) => (parseInt(a.roll) || 0) - (parseInt(b.roll) || 0));
global.renderResultsTable = () => {};
global.updateStatistics = () => {};
global.showToast = (msg, type) => console.log(`[TOAST (${type})]: ${msg}`);
global.getStudentsLookupMaps = () => ({ byReg: new Map(), byRollClass: new Map() });
global.calculateStudentScore = () => ({ correct: 0, wrong: 0, blank: 30 });
global.btnExportExcel = elements.btnExportExcel;
global.btnPrintTable = elements.btnPrintTable;

const htmlContent = fs.readFileSync('exam-portal.html', 'utf-8');
const scriptMatch = htmlContent.match(/\/\/ --- IMPORT EXAM MODAL LOGIC[\s\S]*?\/\/ --- Save & Entry/);

if (!scriptMatch) {
    console.error("Could not find script block!");
    process.exit(1);
}

// Convert 'let cachedAvailableExams' to 'global.cachedAvailableExams' for test access
const scriptCode = scriptMatch[0]
    .replace('// --- Save & Entry', '')
    .replace('let cachedAvailableExams = [];', 'global.cachedAvailableExams = [];');

eval(scriptCode);

async function runTests() {
    console.log("=== TEST 1: Open Import Exam Modal ===");
    await openImportExamModal();
    console.log("cachedAvailableExams count:", global.cachedAvailableExams.length);
    console.log("Total Available Count UI:", elements.totalAvailableExamsCount.textContent);
    console.log("Total HTML Items in container:", (elements.importExamListContainer.innerHTML.match(/import-exam-item-card/g) || []).length);
    if (global.cachedAvailableExams.length !== 4) {
        throw new Error(`Expected 4 exams, got ${global.cachedAvailableExams.length}`);
    }

    console.log("\n=== TEST 2: Filter by Class 'Eight' ===");
    elements.selectImportExamClass.value = 'Eight';
    renderImportExamList();
    console.log("Filtered count for Class Eight:", elements.totalAvailableExamsCount.textContent);
    console.log("HTML Cards for Class Eight:", (elements.importExamListContainer.innerHTML.match(/import-exam-item-card/g) || []).length);
    if ((elements.importExamListContainer.innerHTML.match(/import-exam-item-card/g) || []).length !== 3) {
        throw new Error("Expected 3 exams for Class Eight");
    }

    console.log("\n=== TEST 3: Search by 'Math' ===");
    elements.selectImportExamClass.value = 'ALL';
    elements.inputImportExamSearch.value = 'Math';
    renderImportExamList();
    console.log("Filtered count for 'Math':", elements.totalAvailableExamsCount.textContent);
    if ((elements.importExamListContainer.innerHTML.match(/import-exam-item-card/g) || []).length !== 1) {
        throw new Error("Expected 1 exam for search 'Math'");
    }

    console.log("\n=== TEST 4: Select and Import Specific Exam (Math - Class Eight) ===");
    elements.inputImportExamSearch.value = '';
    elements.selectImportExamClass.value = 'ALL';
    renderImportExamList();
    
    selectAndImportExam("1788103332827", "schedule");
    console.log("Imported Exam Info:", state.importedExamInfo.examName, "| Subject:", state.importedExamInfo.subject, "| Class:", state.importedExamInfo.class);
    console.log("Imported Students count:", state.students.length);
    state.students.forEach((s, idx) => {
        console.log(`  Student ${idx+1}: Reg=${s.regNo}, Name=${s.name}, Roll=${s.roll}, Class=${s.class}, Status=${s.status}`);
    });

    if (state.students.length === 0) {
        throw new Error("No students imported!");
    }

    console.log("\n=== ALL UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

runTests();

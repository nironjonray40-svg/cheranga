const fs = require('fs');

const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));
const examTypes = JSON.parse(fs.readFileSync('scratch/exam_types.json', 'utf8'));
const examSchedules = JSON.parse(fs.readFileSync('scratch/exam_schedules.json', 'utf8'));

const localStorageMock = {
    getItem: (k) => {
        if (k === 'school_exam_types') return JSON.stringify(examTypes);
        if (k === 'school_exam_schedules') return JSON.stringify(examSchedules);
        return dbData[k] || null;
    }
};
global.localStorage = localStorageMock;

const html = fs.readFileSync('Tabulation Sheet.html', 'utf-8');

// Extract getSubjectMarksDistribution
const fnIdx = html.indexOf('function getSubjectMarksDistribution');
const fnEnd = html.indexOf('function updateDynamicSubjectMarksAndHeaders');
const fnCode = html.slice(fnIdx, fnEnd);

// Extract getSubjectSlot
const gssIdx = html.indexOf('function getSubjectSlot');
const gssEnd = html.indexOf('// Dynamic Marks Distribution');
const gssCode = html.slice(gssIdx, gssEnd);

// Extract isExamMatch
const emIdx = html.indexOf('function isExamMatch');
const emEnd = html.indexOf('function changeGroup');
const emCode = html.slice(emIdx, emEnd);

eval(isExamMatchCode = `
function isExamMatch(examA, examB) {
    if (!examA || !examB) return false;
    const a = examA.toString().trim().toLowerCase();
    const b = examB.toString().trim().toLowerCase();
    if (a === b) return true;
    const stripYear = s => s.replace(/২০২[০-৯]|202[0-9]/g, '').replace(/[-_]/g, ' ').trim();
    const aNoYr = stripYear(a);
    const bNoYr = stripYear(b);
    if (aNoYr && bNoYr && (aNoYr === bNoYr || aNoYr.includes(bNoYr) || bNoYr.includes(aNoYr))) {
        return true;
    }
    return false;
}
`);
eval(gssCode);
eval(fnCode);

console.log("TESTING getSubjectMarksDistribution directly:");
console.log("bangla1 for Eight + Elegileble test:", getSubjectMarksDistribution('bangla1', 'Eight', 'Elegileble test'));
console.log("bangla1 for Ten + বার্ষিক পরীক্ষা:", getSubjectMarksDistribution('bangla1', 'Ten', 'বার্ষিক পরীক্ষা'));

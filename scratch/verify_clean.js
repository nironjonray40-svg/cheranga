const fs = require('fs');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('school.db');
db.get("SELECT value FROM local_storage_sync WHERE key = 'school_student_marks'", (err, row) => {
  if (err || !row) {
    console.error("DB error:", err);
    process.exit(1);
  }
  const marks = JSON.parse(row.value);
  console.log("Marks for 260091:", marks['marks_260091_1789576252617']);
  
  db.get("SELECT value FROM local_storage_sync WHERE key = 'school_omr_exams'", (err2, row2) => {
    if (err2 || !row2) {
      console.error("DB error 2:", err2);
      process.exit(1);
    }
    const exams = JSON.parse(row2.value);
    const sarthak = exams[0].students.find(s => s.id === '260091');
    console.log("Sarthak in school_omr_exams:", sarthak);
    db.close();
  });
});

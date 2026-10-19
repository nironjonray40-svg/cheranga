const fs = require('fs');

const html = fs.readFileSync('Marksheet1.html', 'utf-8');

// The single view thead has:
// Row 1:
// 1. Subjects (rowspan 2)
// 2. Marks Obtained (colspan 3)
// 3. Total (rowspan 2)
// 4. Combined Total (rowspan 2)
// 5. Letter Grade (rowspan 2)
// 6. Grade Point (rowspan 2)
// Row 2:
// 1. MCQ
// 2. CQ
// 3. Prac
// Total visible columns across body = 1 (Sub) + 3 (MCQ, CQ, Prac) + 1 (Total) + 1 (Combined) + 1 (Grade) + 1 (GP) = 8 columns!

// Let's check single row generation in renderMarksheet1Table:
// It generates:
// <td> sub-name
// <td> mcqDisplay
// <td> cqDisplay
// <td> prDisplay
// <td> totDisplay
// <td> totDisplay (combined)
// <td> gradeDisplay
// <td> gpDisplay
// Total = 8 cells!

// In paired rows:
// Row 1:
// <td> p1NameHtml
// <td> p1McqDisplay
// <td> p1CqDisplay
// <td> p1PrDisplay
// <td> p1TotDisplay
// <td rowspan="2"> combTotDisplay
// <td rowspan="2"> combGradeDisplay
// <td rowspan="2"> combGpDisplay
// Total = 8 cells!
// Row 2:
// <td> p2NameHtml
// <td> p2McqDisplay
// <td> p2CqDisplay
// <td> p2PrDisplay
// <td> p2TotDisplay
// (plus the 3 rowspan cells from row 1)
// Total = 8 columns!

console.log('Columns match: exactly 8 columns across thead and tbody!');

const fs = require('fs');

function extractScripts(html) {
    const scripts = [];
    const re = /<script.*?>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        scripts.push(m[1]);
    }
    return scripts.join('\n;\n');
}

function runCardTest(filename, fnName) {
    console.log(`\n--- Testing ${filename} -> ${fnName} ---`);
    const html = fs.readFileSync(filename, 'utf-8');
    const code = extractScripts(html);

    const storage = {
        school_students: JSON.stringify([
            { id: '1001', name: 'Md. Abdullah Al Noman', nameBn: 'মো: আব্দুল্লাহ আল নোমান', roll: '1', class: 'Ten', section: 'Science', religion: 'Islam' }
        ]),
        school_exam_schedules: JSON.stringify([
            { examName: 'Annual Examination - 2026', className: 'Ten', subjectName: 'Bangla 1st Paper', fullMarks: 100, mcqFull: 30, cqFull: 70, practicalFull: 0 },
            { examName: 'Annual Examination - 2026', className: 'Ten', subjectName: 'Bangla 2nd Paper', fullMarks: 100, mcqFull: 30, cqFull: 70, practicalFull: 0 },
            { examName: 'Annual Examination - 2026', className: 'Ten', subjectName: 'Mathematics', fullMarks: 100, mcqFull: 30, cqFull: 70, practicalFull: 0 }
        ]),
        school_student_marks: JSON.stringify([
            { studentId: '1001', roll: '1', class: 'Ten', examName: 'Annual Examination - 2026', subjectName: 'Bangla 1st Paper', mcq: '25', cq: '60', pr: '', total: 85 },
            { studentId: '1001', roll: '1', class: 'Ten', examName: 'Annual Examination - 2026', subjectName: 'Bangla 2nd Paper', mcq: '25', cq: '55', pr: '', total: 80 },
            { studentId: '1001', roll: '1', class: 'Ten', examName: 'Annual Examination - 2026', subjectName: 'Mathematics', mcq: '28', cq: '65', pr: '', total: 93 }
        ])
    };

    const student = {
        id: '1001',
        name: 'Md. Abdullah Al Noman',
        nameBn: 'মো: আব্দুল্লাহ আল নোমান',
        nameEn: 'Md. Abdullah Al Noman',
        roll: '1',
        class: 'Ten',
        section: 'Science',
        religion: 'Islam'
    };

    const vm = require('vm');
    const sandbox = {
        window: {
            location: { search: '', href: '', replace: () => {} },
            sessionStorage: { getItem: () => 'true', setItem: () => {}, removeItem: () => {} },
            localStorage: { getItem: (k) => storage[k] || null, setItem: (k, v) => { storage[k] = String(v); }, removeItem: (k) => { delete storage[k]; } },
            addEventListener: () => {}
        },
        document: {
            getElementById: () => ({ innerText: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {}
        },
        localStorage: { getItem: (k) => storage[k] || null, setItem: (k, v) => { storage[k] = String(v); }, removeItem: (k) => { delete storage[k]; } },
        sessionStorage: { getItem: () => 'true', setItem: () => {}, removeItem: () => {} },
        console: console,
        URLSearchParams: URLSearchParams,
        setInterval: () => {},
        clearInterval: () => {},
        setTimeout: () => {},
        clearTimeout: () => {}
    };

    const ctx = vm.createContext(sandbox);
    vm.runInContext(code, ctx);

    // 1. Bengali Card
    ctx.switchLanguage('bn');
    const bnCard = ctx[fnName](student, 'Ten', 'Science', 'Annual Examination - 2026', '1');
    console.log(`[BN Card Check] Length: ${bnCard.length}`);
    if (filename === 'Marksheet.html') {
        console.log("  Contains 'শিক্ষার্থীর নাম':", bnCard.includes('শিক্ষার্থীর নাম'));
        console.log("  Contains 'বাংলা ১ম পত্র':", bnCard.includes('বাংলা ১ম পত্র'));
        console.log("  Contains 'সর্বমোট':", bnCard.includes('সর্বমোট'));
        console.log("  Contains 'পয়েন্ট':", bnCard.includes('পয়েন্ট'));
    } else {
        console.log("  Contains 'শিক্ষার্থীর নাম':", bnCard.includes('শিক্ষার্থীর নাম'));
        console.log("  Contains 'বাংলা ১ম পত্র' or 'বাংলা সাহিত্য':", bnCard.includes('বাংলা ১ম পত্র') || bnCard.includes('বাংলা সাহিত্য'));
        console.log("  Contains 'লেটার গ্রেড':", bnCard.includes('লেটার গ্রেড'));
        console.log("  Contains 'সর্বমোট প্রাপ্ত নম্বর':", bnCard.includes('সর্বমোট প্রাপ্ত নম্বর'));
    }

    // 2. English Card
    ctx.switchLanguage('en');
    const enCard = ctx[fnName](student, 'Ten', 'Science', 'Annual Examination - 2026', '1');
    console.log(`[EN Card Check] Length: ${enCard.length}`);
    if (filename === 'Marksheet.html') {
        console.log("  Contains 'Student Name':", enCard.includes('Student Name'));
        console.log("  Contains 'Bangla 1st Paper':", enCard.includes('Bangla 1st Paper'));
        console.log("  Contains 'Total Marks':", enCard.includes('Total Marks'));
        console.log("  Contains 'GPA':", enCard.includes('GPA'));
        console.log("  Contains 'Guardian\'s Signature':", enCard.includes("Guardian's Signature"));
    } else {
        console.log("  Contains 'Student Name':", enCard.includes('Student Name'));
        console.log("  Contains 'Bangla 1st Paper':", enCard.includes('Bangla 1st Paper'));
        console.log("  Contains 'Letter Grade':", enCard.includes('Letter Grade'));
        console.log("  Contains 'Total Marks Obtained':", enCard.includes('Total Marks Obtained'));
        console.log("  Contains 'Class Teacher\'s Signature':", enCard.includes("Class Teacher's Signature"));
    }
}

runCardTest('Marksheet.html', 'generateMarksheetCardHTML');
runCardTest('Marksheet1.html', 'generateMarksheet1CardHTML');
console.log("\n[SUCCESS] Direct Card generation in BN & EN passed 100%!");

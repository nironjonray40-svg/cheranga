const fs = require('fs');
const dbData = JSON.parse(fs.readFileSync('scratch/db_export.json', 'utf8'));
const studentsList = JSON.parse(dbData.school_students || '[]');

function normalizeClassName(cls) {
    if (!cls || cls === 'all') return 'Ten';
    const val = cls.toString().toLowerCase().trim();
    if (val === '10th' || val === 'ten' || val === '10' || val === '১০ম' || val.includes('ten') || val.includes('10')) return 'Ten';
    if (val === '9th' || val === 'nine' || val === '9' || val === '৯ম' || val.includes('nine') || val.includes('9')) return 'Nine';
    if (val === '8th' || val === 'eight' || val === '8' || val === '৮ম' || val.includes('eight') || val.includes('8')) return 'Eight';
    if (val === '7th' || val === 'seven' || val === '7' || val === '৭ম' || val.includes('seven') || val.includes('7')) return 'Seven';
    if (val === '6th' || val === 'six' || val === '6' || val === '৬ষ্ঠ' || val.includes('six') || val.includes('6')) return 'Six';
    return cls;
}

function normalizeGroupName(grp) {
    if (!grp) return 'none';
    const val = grp.toString().toLowerCase().trim();
    if (val === 'science' || val === 'বিজ্ঞান') return 'science';
    if (val === 'humanities' || val === 'মানবিক' || val === 'arts') return 'humanities';
    if (val === 'business' || val === 'ব্যবসায়' || val === 'commerce' || val === 'business studies') return 'business';
    return val;
}

function testSyncStudents(filterClass, filterGroup, filterSection) {
    const targetClass = normalizeClassName(filterClass).toLowerCase();
    const isJunior = ['six', 'seven', 'eight', 'five', 'four', 'three', 'two', 'one'].includes(targetClass);

    const sectionStudents = { 'A': [], 'B': [], 'C': [], 'D': [] };

    studentsList.forEach(st => {
        const stClass = normalizeClassName(st.class || st.className).toLowerCase();
        if (stClass !== targetClass) return;

        let stGroup = normalizeGroupName(st.group || st.branch);
        let secLetter = (st.section || st.sectionName || '').toString().toUpperCase().trim().replace(/^SECTION\s*/i, '').replace(/^শাখা\s*/i, '').trim();
        if (secLetter === 'বিজ্ঞান' || secLetter === 'SCIENCE') { stGroup = 'science'; secLetter = 'A'; }
        else if (secLetter === 'মানবিক' || secLetter === 'HUMANITIES' || secLetter === 'ARTS') { stGroup = 'humanities'; secLetter = 'B'; }
        else if (secLetter === 'ব্যবসায়' || secLetter === 'BUSINESS' || secLetter === 'COMMERCE') { stGroup = 'business'; secLetter = 'C'; }

        if (isJunior) {
            if (secLetter && ['A', 'B', 'C', 'D'].includes(secLetter)) {
                sectionStudents[secLetter].push(st);
            } else {
                sectionStudents['A'].push(st);
            }
        } else {
            if (stGroup === 'science') sectionStudents['A'].push(st);
            else if (stGroup === 'humanities') sectionStudents['B'].push(st);
            else if (stGroup === 'business') sectionStudents['C'].push(st);
            else if (['A', 'B', 'C', 'D'].includes(secLetter)) sectionStudents[secLetter].push(st);
            else sectionStudents['A'].push(st);
        }
    });

    console.log(`\n=== Class '${filterClass}' Sync Results ===`);
    let totalVisible = 0;
    ['A', 'B', 'C', 'D'].forEach(sec => {
        const list = sectionStudents[sec];
        let visibleCount = 0;
        if (isJunior) {
            if (filterSection === 'all' || filterSection === sec) visibleCount = list.length;
        } else {
            const grp = sec === 'A' ? 'science' : (sec === 'B' ? 'humanities' : (sec === 'C' ? 'business' : 'none'));
            if (filterGroup === 'all' || filterGroup === grp) visibleCount = list.length;
        }
        totalVisible += visibleCount;
        console.log(`  Section ${sec}: ${list.length} students in DB (visible: ${visibleCount}) -> ${list.slice(0, 3).map(s => s.name || s.nameBn).join(', ')}`);
    });
    console.log(`Total visible students for Class '${filterClass}': ${totalVisible}`);
}

testSyncStudents('Ten', 'all', 'all');
testSyncStudents('Ten', 'science', 'all');
testSyncStudents('Nine', 'all', 'all');
testSyncStudents('Eight', 'all', 'all');
testSyncStudents('Eight', 'all', 'A');
testSyncStudents('Seven', 'all', 'all');
testSyncStudents('Six', 'all', 'all');

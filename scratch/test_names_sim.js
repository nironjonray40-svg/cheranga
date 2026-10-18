
const fs = require('fs');
const schedules = JSON.parse(process.argv[2]);
const student = JSON.parse(process.argv[3]);
const savedMarks = JSON.parse(process.argv[4]);

// Logic for getSubjectsForClass using EXACT subject names from Exam List
function getSubjectsForClass(selectedClass, selectedSection, selectedExam, student) {
    const normC = selectedClass.toLowerCase();
    const normS = selectedSection.toLowerCase();
    
    const matchedSchedules = schedules.filter(sc => {
        if (!sc) return false;
        const matchExam = (sc.term || sc.examName || '').trim().toLowerCase() === selectedExam.toLowerCase();
        const matchClass = (sc.className || sc.class || '').trim().toLowerCase() === normC;
        let matchSec = true;
        if (normS && sc.section && sc.section !== 'All' && sc.section !== '(প্রযোজ্য না)') {
            const scSecs = sc.section.toString().toLowerCase().split(',').map(x => x.trim());
            matchSec = scSecs.includes(normS);
        }
        return matchExam && matchClass && matchSec;
    });

    const subjectGroups = new Map();
    matchedSchedules.forEach(sc => {
        const exactSubName = (sc.subject || sc.subjectName || sc.name || '').trim();
        if (!exactSubName) return;
        const groupKey = exactSubName.toLowerCase();
        if (!subjectGroups.has(groupKey)) {
            subjectGroups.set(groupKey, {
                schedule: sc,
                scheduleIds: [sc.id],
                name: exactSubName,
                code: sc.code || '',
                fullMarks: 100
            });
        } else {
            const grp = subjectGroups.get(groupKey);
            if (sc.id && !grp.scheduleIds.includes(sc.id)) grp.scheduleIds.push(sc.id);
            if (sc.hasMarks) grp.schedule = sc;
        }
    });

    const rawList = [];
    subjectGroups.forEach(grp => {
        rawList.push({
            name: grp.name,
            scheduleId: grp.schedule.id,
            scheduleIds: grp.scheduleIds,
            code: grp.code,
            fullMarks: grp.fullMarks
        });
    });

    const rows = [];
    const pairedIndices = new Set();
    for (let i = 0; i < rawList.length; i++) {
        if (pairedIndices.has(i)) continue;
        const current = rawList[i];
        const curName = current.name;
        const normCur = curName.toLowerCase();

        let pairIndex = -1;
        if (normCur.includes('bangla 1') || normCur.includes('বাংলা ১ম')) {
            pairIndex = rawList.findIndex((it, idx) => idx !== i && !pairedIndices.has(idx) && (it.name.toLowerCase().includes('bangla 2') || it.name.includes('বাংলা ২য়')));
        } else if (normCur.includes('english 1') || normCur.includes('english for today') || normCur.includes('ইংরেজি ১ম')) {
            pairIndex = rawList.findIndex((it, idx) => idx !== i && !pairedIndices.has(idx) && (it.name.toLowerCase().includes('english 2') || it.name.includes('ইংরেজি ২য়')));
        }

        if (pairIndex !== -1) {
            pairedIndices.add(i);
            pairedIndices.add(pairIndex);
            const pairItem = rawList[pairIndex];
            rows.push({
                isCombined: true,
                name: curName,
                pairWith: pairItem.name
            });
        } else {
            pairedIndices.add(i);
            rows.push({
                isCombined: false,
                name: curName
            });
        }
    }
    return rows;
}

const st = student;
const res = getSubjectsForClass('Eight', 'A', 'Elegileble test', st);
console.log("Subjects for Elegileble test (Class Eight):");
res.forEach(r => {
    if (r.isCombined) console.log(`  Combined: "${r.name}" + "${r.pairWith}"`);
    else console.log(`  Single: "${r.name}"`);
});

const resSix = getSubjectsForClass('Six', 'A', 'বার্ষিক পরীক্ষা', st);
console.log("
Subjects for বার্ষিক পরীক্ষা (Class Six):");
resSix.forEach(r => console.log(`  Single: "${r.name}"`));

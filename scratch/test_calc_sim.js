const fs = require('fs');

const { schedules, examTypes, school_marking_system } = JSON.parse(fs.readFileSync('scratch/full_db_dump.json', 'utf8'));

let currentFilterClass = '৮ম';
let currentFilterExam = 'Elegileble test';
let currentLang = 'bn';
let currentGPACalcMethod = 'gpa';

const DEFAULT_GRADE_RULES = [
    { id: '1', name: 'A+', min: 80, max: 100, gp: 5.0 },
    { id: '2', name: 'A', min: 70, max: 79, gp: 4.0 },
    { id: '3', name: 'A-', min: 60, max: 69, gp: 3.5 },
    { id: '4', name: 'B', min: 50, max: 59, gp: 3.0 },
    { id: '5', name: 'C', min: 40, max: 49, gp: 2.0 },
    { id: '6', name: 'D', min: 33, max: 39, gp: 1.0 },
    { id: '7', name: 'F', min: 0, max: 32, gp: 0.0 }
];

function loadMarkingSystem() {
    let rules = school_marking_system;
    return rules.map(r => ({
        id: r.id || '',
        name: (r.name || '').trim(),
        min: parseFloat(r.min) || 0,
        max: parseFloat(r.max) || 0,
        gp: parseFloat(r.gp) || 0
    })).sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
}

function getGradeForPercentage(pct, passMarkPercent = null) {
    if (isNaN(pct) || pct === null) {
        return { name: '-', gp: 0.0 };
    }
    const rules = loadMarkingSystem();
    const sortedRules = (Array.isArray(rules) && rules.length > 0 ? [...rules] : [...DEFAULT_GRADE_RULES]).sort((a, b) => (parseFloat(b.min) || 0) - (parseFloat(a.min) || 0));
    const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: "F", gp: 0.0 };
    const passingRules = sortedRules.filter(r => parseFloat(r.gp) > 0 && r.name !== 'F');
    const minPassingPct = (passMarkPercent !== null && !isNaN(passMarkPercent)) 
        ? passMarkPercent 
        : (passingRules.length > 0 ? Math.min(...passingRules.map(r => r.min)) : 33);

    if (pct < minPassingPct) {
        return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
    }

    let match = sortedRules.find(r => pct >= parseFloat(r.min) && pct <= parseFloat(r.max));
    if (!match) {
        match = sortedRules.find(r => (pct + 0.001) >= parseFloat(r.min));
    }
    if (match && parseFloat(match.gp) > 0 && match.name !== 'F') {
        return { name: match.name, gp: parseFloat(match.gp) };
    }
    return { name: failRule.name, gp: parseFloat(failRule.gp) || 0.0 };
}

function getGradeForGPA(gpa) {
    const rules = loadMarkingSystem();
    const sortedRules = (Array.isArray(rules) && rules.length > 0 ? [...rules] : [...DEFAULT_GRADE_RULES]).sort((a, b) => (parseFloat(b.gp) || 0) - (parseFloat(a.gp) || 0));
    const failRule = sortedRules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || sortedRules[sortedRules.length - 1] || { name: "F", gp: 0.0 };
    const passingRules = sortedRules.filter(r => parseFloat(r.gp) > 0 && r.name !== 'F');
    const minPassingGP = passingRules.length > 0 ? Math.min(...passingRules.map(r => r.gp)) : 1.0;

    if (isNaN(gpa) || gpa < minPassingGP) {
        return failRule.name;
    }

    let match = sortedRules.find(r => (gpa + 0.001) >= parseFloat(r.gp));
    return match ? match.name : failRule.name;
}

const banglaDigits = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
const engDigits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};

function banglaToEnglishDigits(str) {
    if (str === null || str === undefined) return '';
    return (str + '').replace(/[০-৯]/g, match => banglaDigits[match]);
}

function translateDigits(str, lang) {
    if (str === null || str === undefined) return '';
    if (lang === 'bn') {
        return (str + '').replace(/[0-9]/g, match => engDigits[match]);
    }
    return (str + '').replace(/[০-৯]/g, match => banglaDigits[match]);
}

function isSubjectSlotActive(slotKey) {
    // In screenshot: Bangla, English, Math, BGS, Chem (Science), Agri are visible
    if (['bangla', 'english', 'math', 'bgs', 'chem', 'agri'].includes(slotKey)) return true;
    return false;
}

function getSubjectPracticalStatus() {
    return { chem: false, phys: false, bio: false, agri: false };
}

function isExamMatch(examA, examB) {
    if (!examA || !examB) return false;
    const a = examA.toString().trim().toLowerCase();
    const b = examB.toString().trim().toLowerCase();
    return a === b || a.includes(b) || b.includes(a);
}

function getSubjectSlot(subName, subCode) {
    const sName = (subName || '').trim().toLowerCase();
    const code = (subCode || '').toString().trim();
    if (code === '101' || /bangla.*1|বাং.*১|বাংলা সাহিত্য/i.test(sName)) return 'bangla1';
    if (code === '102' || /bangla.*2|বাং.*২|ব্যাকরণ/i.test(sName)) return 'bangla2';
    if (code === '103' || /english.*1|eng.*1|ইংরেজি ১ম|for today/i.test(sName)) return 'english1';
    if (code === '104' || /english.*2|eng.*2|ইংরেজি ২য়|grammar/i.test(sName)) return 'english2';
    if (code === '105' || /math|গণিত/i.test(sName)) return 'math';
    if (code === '107' || /bgs|global studies|বিশ্বপরিচয়/i.test(sName)) return 'bgs';
    if (code === '1111' || /physics|পদার্থ/i.test(sName)) return 'phys';
    if (code === '135' || /chemistry|রসায়ন/i.test(sName)) return 'chem';
    if (code === '108' || /science|বিজ্ঞান/i.test(sName)) return 'chem';
    if (code === '180' || /biology|জীববিজ্ঞান/i.test(sName)) return 'bio';
    if (['110', '111', '112', '113'].includes(code) || /religion|islam|hindu|ধর্ম/i.test(sName)) return 'rel';
    if (code === '106' || /ict|information.*tech|যোগাযোগ/i.test(sName)) return 'ict';
    if (['109', '126', '505'].includes(code) || /agri|কৃষি|higher.*math|উচ্চতর/i.test(sName)) return 'agri';
    return null;
}

function getSubjectMarksDistribution(slotKey, className, examName) {
    const baselines = {
        bangla1: { cq: 30, mcq: 20, practical: 0 },
        bangla2: { cq: 30, mcq: 20, practical: 0 },
        english1: { cq: 50, mcq: 0, practical: 0 },
        english2: { cq: 50, mcq: 0, practical: 0 },
        math: { cq: 70, mcq: 30, practical: 0 },
        bgs: { cq: 30, mcq: 20, practical: 0 },
        chem: { cq: 30, mcq: 20, practical: 0 },
        phys: { cq: 0, mcq: 0, practical: 0 },
        bio: { cq: 0, mcq: 0, practical: 0 },
        rel: { cq: 30, mcq: 20, practical: 0 },
        ict: { cq: 0, mcq: 0, practical: 0 },
        agri: { cq: 70, mcq: 30, practical: 0 }
    };
    const b = baselines[slotKey] || { cq: 70, mcq: 30, practical: 0 };
    return { ...b, total: b.cq + b.mcq + b.practical };
}

// Now let's test a row!
const cells = new Array(68).fill({ textContent: '-' }).map((c, i) => ({ textContent: '-', idx: i }));
cells[0].textContent = '১';
cells[1].textContent = 'মোসাম্মাৎ সুমাইয়া আক্তার সৃষ্টি';
cells[2].textContent = '০';
cells[3].textContent = '২২';
cells[4].textContent = '২২';
cells[5].textContent = '০';
cells[6].textContent = '২২';
cells[7].textContent = '২২';
cells[12].textContent = '৪০';
cells[13].textContent = '৪০';
cells[18].textContent = '০';
cells[19].textContent = '৬০';
cells[20].textContent = '৬০';
cells[23].textContent = '০';
cells[24].textContent = '২২';
cells[25].textContent = '২২';
cells[28].textContent = 'A';
cells[29].textContent = 'A';
cells[30].textContent = '-';
cells[31].textContent = 'A';

const row = {
    getAttribute(attr) {
        if (attr === 'data-section') return 'A';
        return null;
    },
    querySelectorAll(sel) {
        return cells;
    }
};

const rows = [row];

console.log('Testing calculation...');
try {
    // Run recalculate
    const rules = loadMarkingSystem();
    const maxScaleGP = Math.max(...rules.map(r => parseFloat(r.gp) || 0), 1.0);
    const failRule = rules.find(r => parseFloat(r.gp) === 0 || r.name === 'F') || { name: 'F', gp: 0.0 };

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const getCellFloat = (idx) => {
            const txt = banglaToEnglishDigits(cells[idx].textContent.trim());
            if (txt === '-' || txt === '') return NaN;
            return parseFloat(txt);
        };

        const setCellVal = (idx, num, isFloat = false) => {
            if (isNaN(num)) {
                cells[idx].textContent = '-';
            } else {
                const str = isFloat ? num.toFixed(2) : (num % 1 === 0 ? num.toString() : num.toFixed(1));
                const translated = translateDigits(str, currentLang);
                cells[idx].textContent = translated;
            }
        };

        const curClass = currentFilterClass || 'Ten';
        const curExam = currentFilterExam || 'all';

        const distB1 = getSubjectMarksDistribution('bangla1', curClass, curExam);
        const distB2 = getSubjectMarksDistribution('bangla2', curClass, curExam);
        const distEng1 = getSubjectMarksDistribution('english1', curClass, curExam);
        const distEng2 = getSubjectMarksDistribution('english2', curClass, curExam);
        const distMath = getSubjectMarksDistribution('math', curClass, curExam);
        const distBgs = getSubjectMarksDistribution('bgs', curClass, curExam);
        const distChem = getSubjectMarksDistribution('chem', curClass, curExam);
        const distPhys = getSubjectMarksDistribution('phys', curClass, curExam);
        const distBio = getSubjectMarksDistribution('bio', curClass, curExam);
        const distRel = getSubjectMarksDistribution('rel', curClass, curExam);
        const distIct = getSubjectMarksDistribution('ict', curClass, curExam);
        const distAgri = getSubjectMarksDistribution('agri', curClass, curExam);

        const pracStatus = getSubjectPracticalStatus();

        // 1. Bangla
        const b1MCQ = getCellFloat(2);
        const b1Wri = getCellFloat(3);
        let b1Total = getCellFloat(4);
        if (!isNaN(b1MCQ) || !isNaN(b1Wri)) {
            b1Total = (isNaN(b1MCQ) ? 0 : b1MCQ) + (isNaN(b1Wri) ? 0 : b1Wri);
            setCellVal(4, b1Total);
        }

        const b2MCQ = getCellFloat(5);
        const b2Wri = getCellFloat(6);
        let b2Total = getCellFloat(7);
        if (!isNaN(b2MCQ) || !isNaN(b2Wri)) {
            b2Total = (isNaN(b2MCQ) ? 0 : b2MCQ) + (isNaN(b2Wri) ? 0 : b2Wri);
            setCellVal(7, b2Total);
        }

        let bGrandTotal = getCellFloat(8);
        if (!isNaN(b1Total) || !isNaN(b2Total)) {
            bGrandTotal = (isNaN(b1Total) ? 0 : b1Total) + (isNaN(b2Total) ? 0 : b2Total);
            setCellVal(8, bGrandTotal);
        }

        const bFullMarksTotal = (distB1.total || 100) + (distB2.total || 100);
        let banglaAvg = getCellFloat(9);
        if (!isNaN(bGrandTotal)) {
            banglaAvg = (bFullMarksTotal > 0) ? (bGrandTotal / bFullMarksTotal) * 100 : bGrandTotal;
            setCellVal(9, banglaAvg);
        } else {
            setCellVal(9, NaN);
        }

        const bAbsent = (cells[2]?.textContent.trim().toUpperCase() === 'A' || cells[3]?.textContent.trim().toUpperCase() === 'A' || cells[5]?.textContent.trim().toUpperCase() === 'A' || cells[6]?.textContent.trim().toUpperCase() === 'A');
        const banglaInfo = bAbsent ? { name: 'F', gp: 0 } : (!isNaN(banglaAvg) ? getGradeForPercentage(banglaAvg) : { name: '-', gp: 0 });
        if (!isNaN(banglaAvg) || bAbsent) {
            cells[10].textContent = banglaInfo.name;
            cells[11].textContent = translateDigits(banglaInfo.gp.toFixed(2), currentLang);
        } else {
            cells[10].textContent = '-';
            cells[11].textContent = '-';
        }

        // 2. English
        const eng1 = getCellFloat(12);
        const eng2 = getCellFloat(13);
        let engGrandTotal = getCellFloat(14);
        if (!isNaN(eng1) || !isNaN(eng2)) {
            engGrandTotal = (isNaN(eng1) ? 0 : eng1) + (isNaN(eng2) ? 0 : eng2);
            setCellVal(14, engGrandTotal);
        }

        const engFullMarksTotal = (distEng1.total || 100) + (distEng2.total || 100);
        let engAvg = getCellFloat(15);
        if (!isNaN(engGrandTotal)) {
            engAvg = (engFullMarksTotal > 0) ? (engGrandTotal / engFullMarksTotal) * 100 : engGrandTotal;
            setCellVal(15, engAvg);
        } else {
            setCellVal(15, NaN);
        }

        const engAbsent = (cells[12]?.textContent.trim().toUpperCase() === 'A' || cells[13]?.textContent.trim().toUpperCase() === 'A');
        const engInfo = engAbsent ? { name: 'F', gp: 0 } : (!isNaN(engAvg) ? getGradeForPercentage(engAvg) : { name: '-', gp: 0 });
        if (!isNaN(engAvg) || engAbsent) {
            cells[16].textContent = engInfo.name;
            cells[17].textContent = translateDigits(engInfo.gp.toFixed(2), currentLang);
        } else {
            cells[16].textContent = '-';
            cells[17].textContent = '-';
        }

        // 3. Math
        const mathMCQ = getCellFloat(18);
        const mathWri = getCellFloat(19);
        let mathTotal = getCellFloat(20);
        if (!isNaN(mathMCQ) || !isNaN(mathWri)) {
            mathTotal = (isNaN(mathMCQ) ? 0 : mathMCQ) + (isNaN(mathWri) ? 0 : mathWri);
            setCellVal(20, mathTotal);
        }
        const mathFull = distMath.total || 100;
        const mathPct = !isNaN(mathTotal) ? (mathTotal / mathFull) * 100 : NaN;
        const mathAbsent = (cells[18]?.textContent.trim().toUpperCase() === 'A' || cells[19]?.textContent.trim().toUpperCase() === 'A');
        const mathInfo = mathAbsent ? { name: 'F', gp: 0 } : (!isNaN(mathPct) ? getGradeForPercentage(mathPct) : { name: '-', gp: 0 });
        if (!isNaN(mathPct) || mathAbsent) {
            cells[21].textContent = mathInfo.name;
            cells[22].textContent = translateDigits(mathInfo.gp.toFixed(2), currentLang);
        } else {
            cells[21].textContent = '-';
            cells[22].textContent = '-';
        }

        // 4. BGS
        const bgsMCQ = getCellFloat(23);
        const bgsWri = getCellFloat(24);
        let bgsTotal = getCellFloat(25);
        if (!isNaN(bgsMCQ) || !isNaN(bgsWri)) {
            bgsTotal = (isNaN(bgsMCQ) ? 0 : bgsMCQ) + (isNaN(bgsWri) ? 0 : bgsWri);
            setCellVal(25, bgsTotal);
        }
        const bgsFull = distBgs.total || 100;
        const bgsPct = !isNaN(bgsTotal) ? (bgsTotal / bgsFull) * 100 : NaN;
        const bgsAbsent = (cells[23]?.textContent.trim().toUpperCase() === 'A' || cells[24]?.textContent.trim().toUpperCase() === 'A');
        const bgsInfo = bgsAbsent ? { name: 'F', gp: 0 } : (!isNaN(bgsPct) ? getGradeForPercentage(bgsPct) : { name: '-', gp: 0 });
        if (!isNaN(bgsPct) || bgsAbsent) {
            cells[26].textContent = bgsInfo.name;
            cells[27].textContent = translateDigits(bgsInfo.gp.toFixed(2), currentLang);
        } else {
            cells[26].textContent = '-';
            cells[27].textContent = '-';
        }

        // 5. Chemistry / Science
        const chemMCQ = getCellFloat(28);
        const chemWri = getCellFloat(29);
        const chemPrac = pracStatus.chem ? getCellFloat(30) : 0;
        let chemTotal = getCellFloat(31);
        if (!isNaN(chemMCQ) || !isNaN(chemWri) || (pracStatus.chem && !isNaN(chemPrac))) {
            chemTotal = (isNaN(chemMCQ) ? 0 : chemMCQ) + (isNaN(chemWri) ? 0 : chemWri) + (pracStatus.chem && !isNaN(chemPrac) ? chemPrac : 0);
            setCellVal(31, chemTotal);
        }
        const chemFull = distChem.total || 100;
        const chemPct = !isNaN(chemTotal) ? (chemTotal / chemFull) * 100 : NaN;
        const chemAbsent = (cells[28]?.textContent.trim().toUpperCase() === 'A' || cells[29]?.textContent.trim().toUpperCase() === 'A' || (pracStatus.chem && cells[30]?.textContent.trim().toUpperCase() === 'A'));
        const chemInfo = chemAbsent ? { name: 'F', gp: 0 } : (!isNaN(chemPct) ? getGradeForPercentage(chemPct) : { name: '-', gp: 0 });
        if (!isNaN(chemPct) || chemAbsent) {
            cells[32].textContent = chemInfo.name;
            cells[33].textContent = translateDigits(chemInfo.gp.toFixed(2), currentLang);
        } else {
            cells[32].textContent = '-';
            cells[33].textContent = '-';
        }

        console.log('Bangla Total:', cells[8].textContent, 'Avg:', cells[9].textContent, 'Grade:', cells[10].textContent, 'Point:', cells[11].textContent);
        console.log('English Total:', cells[14].textContent, 'Avg:', cells[15].textContent, 'Grade:', cells[16].textContent, 'Point:', cells[17].textContent);
        console.log('Math Grade:', cells[21].textContent, 'Point:', cells[22].textContent);
        console.log('BGS Grade:', cells[26].textContent, 'Point:', cells[27].textContent);
        console.log('Science Absent:', chemAbsent, 'Grade:', cells[32].textContent, 'Point:', cells[33].textContent);

        // candidateSubjects
        const candidateSubjects = [
            { slot: 'bangla', info: banglaInfo, total: bGrandTotal },
            { slot: 'english', info: engInfo, total: engGrandTotal },
            { slot: 'math', info: mathInfo, total: mathTotal },
            { slot: 'bgs', info: bgsInfo, total: bgsTotal },
            { slot: 'chem', info: chemInfo, total: chemTotal },
            { slot: 'phys', info: { name: '-', gp: 0 }, total: NaN },
            { slot: 'bio', info: { name: '-', gp: 0 }, total: NaN },
            { slot: 'rel', info: { name: '-', gp: 0 }, total: NaN },
            { slot: 'ict', info: { name: '-', gp: 0 }, total: NaN }
        ];
        const activeMain = candidateSubjects.filter(cs => isSubjectSlotActive(cs.slot));
        const mainSubjects = activeMain.map(cs => cs.info);
        const hasValidMainSubjects = mainSubjects.some(s => s.name !== '-');

        let failsCount = 0;
        let mainGPSum = 0;
        let mainSubCount = 0;

        if (hasValidMainSubjects) {
            mainSubjects.forEach(sub => {
                if (sub.name !== '-') {
                    mainSubCount++;
                    mainGPSum += sub.gp;
                    if (sub.gp === 0 || sub.name === failRule.name || sub.name === 'F') {
                        failsCount++;
                    }
                }
            });
        }

        console.log('hasValidMainSubjects:', hasValidMainSubjects);
        console.log('mainSubCount:', mainSubCount);
        console.log('failsCount:', failsCount);
        console.log('mainGPSum:', mainGPSum);
    });
} catch(e) {
    console.error('Error during calc:', e);
}

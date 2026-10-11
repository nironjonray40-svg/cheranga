const normalizeSingleOption = (val) => {
    if (val === null || val === undefined) return null;
    const str = String(val).trim().toUpperCase();
    if (str === 'ক' || str === 'A' || str === '1' || str === '১') return 'ক';
    if (str === 'খ' || str === 'B' || str === '2' || str === '২') return 'খ';
    if (str === 'গ' || str === 'C' || str === '3' || str === '৩') return 'গ';
    if (str === 'ঘ' || str === 'D' || str === '4' || str === '৪') return 'ঘ';
    return null;
};

const getQuestionCorrectAnswersList = (targetKey, q) => {
    if (!targetKey) return [];
    let val = null;
    if (Array.isArray(targetKey)) {
        if (targetKey.length === 31 && (targetKey[0] === null || targetKey[0] === undefined)) {
            val = targetKey[q];
        } else {
            val = targetKey[q - 1];
        }
    } else if (typeof targetKey === 'object') {
        val = targetKey[q] !== undefined ? targetKey[q] : (targetKey[String(q)] !== undefined ? targetKey[String(q)] : (targetKey[q - 1] !== undefined ? targetKey[q - 1] : targetKey[String(q - 1)]));
    }
    if (val === null || val === undefined) return [];
    if (Array.isArray(val)) {
        const res = [];
        val.forEach(v => {
            const n = normalizeSingleOption(v);
            if (n && !res.includes(n)) res.push(n);
        });
        return res;
    }
    const str = String(val).trim();
    if (str.includes(',') || str.includes('/') || str.includes('+') || str.includes(';')) {
        const parts = str.split(/[,/+;\s]+/);
        const res = [];
        parts.forEach(p => {
            const n = normalizeSingleOption(p);
            if (n && !res.includes(n)) res.push(n);
        });
        return res;
    }
    const single = normalizeSingleOption(str);
    return single ? [single] : [];
};

// Test Q1-Q10 with standard key
const targetKey = ['ক', 'গ', 'খ', 'খ', 'ঘ', 'গ', 'ক', 'খ', 'গ', 'খ'];
console.log('Q1 (ক):', getQuestionCorrectAnswersList(targetKey, 1));
console.log('Q2 (গ):', getQuestionCorrectAnswersList(targetKey, 2));
console.log('Q3 (খ):', getQuestionCorrectAnswersList(targetKey, 3));
console.log('Q4 (খ):', getQuestionCorrectAnswersList(targetKey, 4));

// If student answered Q4 = 'ঘ' (wrong):
const optionsBengali = ['ক', 'খ', 'গ', 'ঘ'];
const studentAns = 'ঘ';
const selectedOpts = ['ঘ'];
const correctList = getQuestionCorrectAnswersList(targetKey, 4);

const renderedQ4 = optionsBengali.map(opt => {
    let extraClass = '';
    const isSelectedByStudent = selectedOpts.includes(opt);
    const isCorrectKeyOpt = correctList.includes(opt);

    if (isSelectedByStudent) {
        if (isCorrectKeyOpt) extraClass = 'filled-correct';
        else extraClass = 'filled-wrong';
    } else if (isCorrectKeyOpt) {
        extraClass = 'filled-key-answer';
    }
    return { opt, extraClass };
});

console.log('Q4 rendering (student filled "ঘ", key is "খ"):');
console.log(renderedQ4);

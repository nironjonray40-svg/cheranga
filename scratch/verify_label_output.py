import sys, subprocess, json

sys.stdout.reconfigure(encoding='utf-8')

# Run a quick node script to test the exact JS functions
node_test = """
const fs = require('fs');

function toBengaliNumerals(num) {
    if (num === null || num === undefined || num === '') return '-';
    const str = String(num);
    if (!/^\\d+$/.test(str)) return str;
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
}

function formatClassNameByLang(clsName, lang) {
    let clean = String(clsName || '').trim();
    const classMap = {
        'play': { bn: 'প্লে', en: 'Play' },
        'nursery': { bn: 'নার্সারি', en: 'Nursery' },
        'kg': { bn: 'কেজি', en: 'KG' },
        'class 1': { bn: '১ম', en: 'Class 1' },
        'class 2': { bn: '২য়', en: 'Class 2' },
        'class 3': { bn: '৩য়', en: 'Class 3' },
        'class 4': { bn: '৪র্থ', en: 'Class 4' },
        'class 5': { bn: '৫ম', en: 'Class 5' },
        'class 6': { bn: '৬ষ্ঠ', en: 'Class 6' },
        'class 7': { bn: '৭ম', en: 'Class 7' },
        'class 8': { bn: '৮ম', en: 'Class 8' },
        'class 9': { bn: '৯ম', en: 'Class 9' },
        'class 10': { bn: '১০ম', en: 'Class 10' },
        'one': { bn: '১ম', en: 'One' },
        'two': { bn: '২য়', en: 'Two' },
        'three': { bn: '৩য়', en: 'Three' },
        'four': { bn: '৪র্থ', en: 'Four' },
        'five': { bn: '৫ম', en: 'Five' },
        'six': { bn: '৬ষ্ঠ', en: 'Six' },
        'seven': { bn: '৭ম', en: 'Seven' },
        'eight': { bn: '৮ম', en: 'Eight' },
        'nine': { bn: '৯ম', en: 'Nine' },
        'ten': { bn: '১০ম', en: 'Ten' }
    };

    const low = clean.toLowerCase();
    if (classMap[low]) {
        if (lang === 'en') return classMap[low].en;
        if (lang === 'both') return `${classMap[low].bn} (${classMap[low].en})`;
        return classMap[low].bn;
    }
    clean = clean.replace(/\\s*শ্রেণি/g, '');
    return clean;
}

function getRoomGenderSuffix(sData, roomNo) {
    if (!sData || !roomNo) return '';
    const rInfo = sData.roomGenders ? sData.roomGenders[roomNo] : null;
    if (rInfo) {
        if (rInfo.female > 0 && rInfo.male === 0) return ' (ছাত্রী)';
        if (rInfo.male > 0 && rInfo.female === 0) return ' (ছাত্র)';
        if (rInfo.female > 0 && rInfo.male > 0) return ' (যৌথ)';
        if (rInfo.roomGenderAttr) {
            const attr = String(rInfo.roomGenderAttr).toLowerCase();
            if (/female|girl|girls|ছাত্রী|মহিলা/i.test(attr)) return ' (ছাত্রী)';
            if (/male|boy|boys|ছাত্র|পুরুষ/i.test(attr)) return ' (ছাত্র)';
            if (/both|co|যৌথ/i.test(attr)) return ' (যৌথ)';
        }
    }
    return '';
}

console.log("Class 7 bn:", formatClassNameByLang('Class 7', 'bn'));
console.log("Class 7 both:", formatClassNameByLang('Class 7', 'both'));
console.log("৭ম শ্রেণি bn:", formatClassNameByLang('৭ম শ্রেণি', 'bn'));
console.log("Male room suffix:", getRoomGenderSuffix({ roomGenders: { '101': { male: 5, female: 0 } } }, '101'));
console.log("Female room suffix:", getRoomGenderSuffix({ roomGenders: { '102': { male: 0, female: 5 } } }, '102'));
console.log("Combined room suffix:", getRoomGenderSuffix({ roomGenders: { '103': { male: 5, female: 5 } } }, '103'));
"""

with open('scratch/test_label_output.js', 'w', encoding='utf-8') as tf:
    tf.write(node_test)

res = subprocess.run(['node', 'scratch/test_label_output.js'], capture_output=True, text=True, encoding='utf-8')
print("Node Test Output:\n", res.stdout)
if res.stderr:
    print("Errors:\n", res.stderr)

# -*- coding: utf-8 -*-
import sys, re

sys.stdout.reconfigure(encoding='utf-8')

print("Applying updates: '৭ম শ্রেণি' -> '৭ম', 'মহিলা' -> 'ছাত্রী', 'পুরুষ' -> 'ছাত্র'...")

# -------------------------------------------------------------
# 1. UPDATE seat-plan.html
# -------------------------------------------------------------
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    sp = f.read()

# Update formatClassNameByLang in seat-plan.html
old_formatClassNameByLang_sp = """        function formatClassNameByLang(clsName, lang) {
            const clean = String(clsName || '').trim();
            const classMap = {
                'play': { bn: 'প্লে', en: 'Play' },
                'nursery': { bn: 'নার্সারি', en: 'Nursery' },
                'kg': { bn: 'কেজি', en: 'KG' },
                'class 1': { bn: '১ম শ্রেণি', en: 'Class 1' },
                'class 2': { bn: '২য় শ্রেণি', en: 'Class 2' },
                'class 3': { bn: '৩য় শ্রেণি', en: 'Class 3' },
                'class 4': { bn: '৪র্থ শ্রেণি', en: 'Class 4' },
                'class 5': { bn: '৫ম শ্রেণি', en: 'Class 5' },
                'class 6': { bn: '৬ষ্ঠ শ্রেণি', en: 'Class 6' },
                'class 7': { bn: '৭ম শ্রেণি', en: 'Class 7' },
                'class 8': { bn: '৮ম শ্রেণি', en: 'Class 8' },
                'class 9': { bn: '৯ম শ্রেণি', en: 'Class 9' },
                'class 10': { bn: '১০ম শ্রেণি', en: 'Class 10' }
            };

            const low = clean.toLowerCase();
            if (classMap[low]) {
                if (lang === 'en') return classMap[low].en;
                if (lang === 'both') return `${classMap[low].bn} (${classMap[low].en})`;
                return classMap[low].bn;
            }
            return clean;
        }"""

new_formatClassNameByLang_sp = """        function formatClassNameByLang(clsName, lang) {
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
        }"""

if old_formatClassNameByLang_sp in sp:
    sp = sp.replace(old_formatClassNameByLang_sp, new_formatClassNameByLang_sp)
    print("✓ Updated formatClassNameByLang in seat-plan.html")
else:
    print("Warning: old_formatClassNameByLang_sp not found for exact replacement, trying regex...")
    sp = re.sub(
        r'function\s+formatClassNameByLang\s*\([^)]*\)\s*\{[\s\S]*?return\s+clean;\s*\}',
        new_formatClassNameByLang_sp.strip(),
        sp
    )

# Update getRoomGenderSuffix in seat-plan.html
old_getRoomGenderSuffix_sp = """        function getRoomGenderSuffix(sData, roomNo) {
            if (!sData || !roomNo) return '';
            const rInfo = sData.roomGenders ? sData.roomGenders[roomNo] : null;
            if (rInfo) {
                if (rInfo.female > 0 && rInfo.male === 0) return ' (মহিলা)';
                if (rInfo.male > 0 && rInfo.female === 0) return ' (পুরুষ)';
                if (rInfo.female > 0 && rInfo.male > 0) return ' (যৌথ)';
                if (rInfo.roomGenderAttr) {
                    const attr = String(rInfo.roomGenderAttr).toLowerCase();
                    if (/female|girl|girls|ছাত্রী|মহিলা/i.test(attr)) return ' (মহিলা)';
                    if (/male|boy|boys|ছাত্র|পুরুষ/i.test(attr)) return ' (পুরুষ)';
                    if (/both|co|যৌথ/i.test(attr)) return ' (যৌথ)';
                }
            }
            return '';
        }"""

new_getRoomGenderSuffix_sp = """        function getRoomGenderSuffix(sData, roomNo) {
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
        }"""

if old_getRoomGenderSuffix_sp in sp:
    sp = sp.replace(old_getRoomGenderSuffix_sp, new_getRoomGenderSuffix_sp)
    print("✓ Updated getRoomGenderSuffix in seat-plan.html")
else:
    print("Using regex to update getRoomGenderSuffix in seat-plan.html...")
    sp = sp.replace("' (মহিলা)'", "' (ছাত্রী)'").replace("' (পুরুষ)'", "' (ছাত্র)'")

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(sp)

# -------------------------------------------------------------
# 2. UPDATE Student Data Topsheet.html
# -------------------------------------------------------------
with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    sdt = f.read()

# In Student Data Topsheet.html, update formatClassNameByLang and getRoomGenderSuffix
sdt = sdt.replace("'সপ্তম'", "'৭ম'")
sdt = sdt.replace("'প্রথম'", "'১ম'")
sdt = sdt.replace("'দ্বিতীয়'", "'২য়'")
sdt = sdt.replace("'তৃতীয়'", "'৩য়'")
sdt = sdt.replace("'চতুর্থ'", "'৪র্থ'")
sdt = sdt.replace("'পঞ্চম'", "'৫ম'")
sdt = sdt.replace("'ষষ্ঠ'", "'৬ষ্ঠ'")
sdt = sdt.replace("'অষ্টম'", "'৮ম'")
sdt = sdt.replace("'নবম'", "'৯ম'")
sdt = sdt.replace("'দশম'", "'১০ম'")

# Also update getRoomGenderSuffix if needed
sdt = sdt.replace("' (F)'", "' (ছাত্রী)'")
sdt = sdt.replace("' (M)'", "' (ছাত্র)'")
sdt = sdt.replace("' (C)'", "' (যৌথ)'")

with open('Student Data Topsheet.html', 'w', encoding='utf-8') as f:
    f.write(sdt)

print("Saved updates to seat-plan.html and Student Data Topsheet.html successfully!")

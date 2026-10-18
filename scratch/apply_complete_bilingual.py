import re

def update_marksheet():
    with open('Marksheet.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix religion function
    old_rel = '''        function getStudentReligionInfo(student) {
            const r = String(student?.religion || student?.religionBn || 'Islam').toLowerCase();
            if (r.includes('hindu') || r.includes('হিন্দু') || r.includes('সনাতন')) {
                return {
                    name: 'Hindu Religion Studies',
                    nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                    display: 'হিন্দু (সনাতন)'
                };
            } else if (r.includes('buddh') || r.includes('বৌদ্ধ')) {
                return {
                    name: 'Buddhist Religion Studies',
                    nameBn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
                    display: 'বৌদ্ধ'
                };
            } else if (r.includes('christ') || r.includes('খ্রিস্ট') || r.includes('ঈসায়ী')) {
                return {
                    name: 'Christian Religion Studies',
                    nameBn: 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
                    display: 'খ্রিস্টান'
                };
            }
            return {
                name: 'Islamic Studies',
                nameBn: 'ইসলাম ও নৈতিক শিক্ষা',
                display: 'ইসলাম'
            };
        }'''

    new_rel = '''        function getStudentReligionInfo(student) {
            const r = String(student?.religion || student?.religionBn || 'Islam').toLowerCase();
            if (r.includes('hindu') || r.includes('হিন্দু') || r.includes('সনাতন')) {
                return {
                    name: 'Hindu Religion Studies',
                    nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা',
                    display: 'হিন্দু (সনাতন)',
                    en: 'Hinduism'
                };
            } else if (r.includes('buddh') || r.includes('বৌদ্ধ')) {
                return {
                    name: 'Buddhist Religion Studies',
                    nameBn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা',
                    display: 'বৌদ্ধ',
                    en: 'Buddhism'
                };
            } else if (r.includes('christ') || r.includes('খ্রিস্ট') || r.includes('ঈসায়ী')) {
                return {
                    name: 'Christian Religion Studies',
                    nameBn: 'খ্রিস্টধর্ম ও নৈতিক শিক্ষা',
                    display: 'খ্রিস্টান',
                    en: 'Christianity'
                };
            }
            return {
                name: 'Islamic Studies',
                nameBn: 'ইসলাম ও নৈতিক শিক্ষা',
                display: 'ইসলাম',
                en: 'Islam'
            };
        }'''

    if old_rel in content:
        content = content.replace(old_rel, new_rel, 1)
        print("[Marksheet.html] Updated getStudentReligionInfo")
    else:
        print("[Marksheet.html] ERROR or already updated: old_rel not found")

    # 2. Fix paired rendering in renderMarksheetTable
    old_paired_block = '''                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : '—');
                    const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = sub.pairHasMarks ? toBnDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? toBnDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? toBnDigits(res.gp.toFixed(2)) : '—';

                    html += `<tr>
                        <td class="subject-col">${sub.name}</td>'''

    new_paired_block = '''                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : formatDigits(sub.mcq)) : '—');
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : formatDigits(sub.cq)) : '—';
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : formatDigits(sub.pr)) : '—');
                    const p1TotDisplay = sub.hasMarks ? formatDigits(m1) : '—';

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : formatDigits(sub.pairMcq)) : '—');
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : formatDigits(sub.pairCq)) : '—';
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : formatDigits(sub.pairPr)) : '—');
                    const p2TotDisplay = sub.pairHasMarks ? formatDigits(m2) : '—';

                    const combTotDisplay = hasPaperMarks ? formatDigits(combTotal) : '—';
                    const combGradeDisplay = hasPaperMarks ? res.grade : '—';
                    const combGpDisplay = hasPaperMarks ? formatDigits(res.gp.toFixed(2)) : '—';

                    html += `<tr>
                        <td class="subject-col">${getDisplaySubjectName(sub.name)}</td>'''

    if old_paired_block in content:
        content = content.replace(old_paired_block, new_paired_block, 1)
        print("[Marksheet.html] Updated paired rendering in renderMarksheetTable")
    else:
        print("[Marksheet.html] Paired block check: already modified or slightly different")

    # 3. Fix duplicate classEl and secEl in syncCascadingFilters
    old_dup_decl = '''                const classDisplay = getDisplayClassName(effectiveClass);
                const classEl = document.getElementById('display-class-name');
                if (classEl) classEl.innerText = classDisplay;

                const secDisplay = isEn ? 'Section = ' + getEnglishSectionName(effectiveSec) : 'শাখা = ' + effectiveSec;
                const secEl = document.getElementById('display-section-name');
                if (secEl) secEl.innerText = secDisplay;'''

    new_dup_decl = '''                const classDisplay = getDisplayClassName(effectiveClass);
                if (classEl) classEl.innerText = classDisplay;

                const secDisplay = isEn ? 'Section = ' + getEnglishSectionName(effectiveSec) : 'শাখা = ' + effectiveSec;
                if (secEl) secEl.innerText = secDisplay;'''

    if old_dup_decl in content:
        content = content.replace(old_dup_decl, new_dup_decl, 1)
        print("[Marksheet.html] Fixed duplicate classEl and secEl declarations")
    else:
        print("[Marksheet.html] Note: old_dup_decl not found")

    # 4. In DOMContentLoaded, make sure updateLanguageUI() is called
    old_init = '''            syncSchoolHeaderInfo();
            syncCascadingFilters('all');'''
    new_init = '''            syncSchoolHeaderInfo();
            updateLanguageUI();
            syncCascadingFilters('all');'''
    if old_init in content:
        content = content.replace(old_init, new_init, 1)
        print("[Marksheet.html] Added updateLanguageUI to DOMContentLoaded")

    # Search input display in DOMContentLoaded
    old_init_search = "input.value = `[রোল ${toBnDigits(found.roll || '১')}] ${found.nameBn || found.name || 'শিক্ষার্থী'}`;"
    new_init_search = "input.value = currentLanguage === 'en' ? `[Roll ${formatDigits(found.roll || '1')}] ${found.nameEn || found.nameBn || found.name || 'Student'}` : `[রোল ${toBnDigits(found.roll || '১')}] ${found.nameBn || found.name || 'শিক্ষার্থী'}`;"
    if old_init_search in content:
        content = content.replace(old_init_search, new_init_search, 1)
        print("[Marksheet.html] Updated search value formatting in init")

    with open('Marksheet.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[Marksheet.html] Completed update")

update_marksheet()

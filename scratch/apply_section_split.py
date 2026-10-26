import sys

sys.stdout.reconfigure(encoding='utf-8')

def update_marksheet(filename):
    print(f"Updating {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update getSectionsForClass
    old_get_sec = """        // 3. Get Sections / Groups based on Selected Class (Cascading: Class -> Sections)
        function getSectionsForClass(className, examName) {
            const sectionSet = new Set();
            const normClass = normalizeClassString(className);
            const isSecondary = ['9', '10'].includes(normClass);

            try {
                const rawStudents = localStorage.getItem('school_students');
                if (rawStudents) {
                    const parsed = JSON.parse(rawStudents);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && normalizeClassString(s.class || s.className) === normClass) {
                                if (isSecondary) {
                                    if (s.group && s.group !== '(প্রযোজ্য না)') sectionSet.add(s.group.trim());
                                    if (s.section && s.section !== '(প্রযোজ্য না)' && !['ক','খ','গ','A','B','C'].includes(s.section)) sectionSet.add(s.section.trim());
                                } else {
                                    if (s.section && s.section !== '(প্রযোজ্য না)') sectionSet.add(s.section.trim());
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && normalizeClassString(s.className || s.class) === normClass && s.section && s.section !== 'All' && s.section !== '(প্রযোজ্য না)') {
                                sectionSet.add(s.section.trim());
                            }
                        });
                    }
                }
            } catch(e) {}

            if (sectionSet.size === 0) {
                if (isSecondary) {
                    ["বিজ্ঞান", "মানবিক", "ব্যবসায় শিক্ষা"].forEach(s => sectionSet.add(s));
                } else {
                    ["ক", "খ", "গ"].forEach(s => sectionSet.add(s));
                }
            }

            return Array.from(sectionSet);
        }"""

    # For Marksheet1, check indentation if different
    old_get_sec_m1 = """// 3. Get Sections / Groups based on Selected Class (Cascading: Class -> Sections)
function getSectionsForClass(className, examName) {
    const sectionSet = new Set();
    const normClass = normalizeClassString(className);
    const isSecondary = ['9', '10'].includes(normClass);

    try {
        const rawStudents = localStorage.getItem('school_students');
        if (rawStudents) {
            const parsed = JSON.parse(rawStudents);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && normalizeClassString(s.class || s.className) === normClass) {
                        if (isSecondary) {
                            if (s.group && s.group !== '(প্রযোজ্য না)') sectionSet.add(s.group.trim());
                            if (s.section && s.section !== '(প্রযোজ্য না)' && !['ক','খ','গ','A','B','C'].includes(s.section)) sectionSet.add(s.section.trim());
                        } else {
                            if (s.section && s.section !== '(প্রযোজ্য না)') sectionSet.add(s.section.trim());
                        }
                    }
                });
            }
        }
    } catch(e) {}

    try {
        const rawSchedules = localStorage.getItem('school_exam_schedules');
        if (rawSchedules) {
            const parsed = JSON.parse(rawSchedules);
            if (Array.isArray(parsed)) {
                parsed.forEach(s => {
                    if (s && normalizeClassString(s.className || s.class) === normClass && s.section && s.section !== 'All' && s.section !== '(প্রযোজ্য না)') {
                        sectionSet.add(s.section.trim());
                    }
                });
            }
        }
    } catch(e) {}

    if (sectionSet.size === 0) {
        if (isSecondary) {
            ["বিজ্ঞান", "মানবিক", "ব্যবসায় শিক্ষা"].forEach(s => sectionSet.add(s));
        } else {
            ["ক", "খ", "গ"].forEach(s => sectionSet.add(s));
        }
    }

    return Array.from(sectionSet);
}"""

    new_get_sec = """        // 3. Get Sections / Groups based on Selected Class (Cascading: Class -> Sections)
        function getSectionsForClass(className, examName) {
            const sectionSet = new Set();
            const normClass = normalizeClassString(className);
            const isSecondary = ['9', '10'].includes(normClass);

            // 1. From Exam Schedules (Exam List)
            try {
                const rawSchedules = localStorage.getItem('school_exam_schedules');
                if (rawSchedules) {
                    const parsed = JSON.parse(rawSchedules);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (!s) return;
                            const sClass = normalizeClassString(s.className || s.class);
                            if (normClass && sClass !== normClass) return;
                            const term = s.term || s.examName || '';
                            if (examName && examName !== 'all' && typeof isExamMatch === 'function' && !isExamMatch(term, examName)) return;

                            const rawSec = s.section || '';
                            if (rawSec && rawSec !== 'All' && rawSec !== '(প্রযোজ্য না)') {
                                String(rawSec).split(',').forEach(part => {
                                    const clean = part.trim();
                                    if (clean && clean !== 'All' && clean !== '(প্রযোজ্য না)') {
                                        sectionSet.add(clean);
                                    }
                                });
                            }
                        });
                    }
                }
            } catch(e) {}

            // 2. From Students Directory
            try {
                const rawStudents = localStorage.getItem('school_students');
                if (rawStudents) {
                    const parsed = JSON.parse(rawStudents);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && normalizeClassString(s.class || s.className) === normClass) {
                                if (isSecondary) {
                                    if (s.group && s.group !== '(প্রযোজ্য না)') {
                                        String(s.group).split(',').forEach(g => {
                                            const clean = g.trim();
                                            if (clean && clean !== '(প্রযোজ্য না)') sectionSet.add(clean);
                                        });
                                    }
                                    if (s.section && s.section !== '(প্রযোজ্য না)' && !['ক','খ','গ','A','B','C','D'].includes(s.section)) {
                                        String(s.section).split(',').forEach(sec => {
                                            const clean = sec.trim();
                                            if (clean && clean !== '(প্রযোজ্য না)') sectionSet.add(clean);
                                        });
                                    }
                                } else {
                                    if (s.section && s.section !== '(প্রযোজ্য না)') {
                                        String(s.section).split(',').forEach(sec => {
                                            const clean = sec.trim();
                                            if (clean && clean !== '(প্রযোজ্য না)') sectionSet.add(clean);
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            } catch(e) {}

            if (sectionSet.size === 0) {
                if (isSecondary) {
                    ["বিজ্ঞান", "মানবিক", "ব্যবসায় শিক্ষা"].forEach(s => sectionSet.add(s));
                } else {
                    ["ক", "খ", "গ"].forEach(s => sectionSet.add(s));
                }
            }

            const order = ['A', 'B', 'C', 'D', 'E', 'F', 'ক', 'খ', 'গ', 'ঘ', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা'];
            return Array.from(sectionSet).sort((a, b) => {
                const ia = order.indexOf(a);
                const ib = order.indexOf(b);
                if (ia !== -1 && ib !== -1) return ia - ib;
                if (ia !== -1) return -1;
                if (ib !== -1) return 1;
                return a.localeCompare(b);
            });
        }"""

    new_get_sec_m1 = new_get_sec.replace('        //', '//').replace('        function', 'function')

    if old_get_sec in content:
        content = content.replace(old_get_sec, new_get_sec)
        print("  Replaced getSectionsForClass in Marksheet.html")
    elif old_get_sec_m1 in content:
        content = content.replace(old_get_sec_m1, new_get_sec_m1)
        print("  Replaced getSectionsForClass in Marksheet1.html")
    else:
        print("  WARNING: Could not find exact match for getSectionsForClass!")

    # 2. Update getAllStudentsForClassAndSection
    old_get_students = """        function getAllStudentsForClassAndSection(selectedClass, selectedSection) {
            const normC = normalizeClassString(selectedClass);
            const normS = normalizeSectionString(selectedSection);
            const isSci = normS === 'science';

            let rawStudents = localStorage.getItem('school_students');
            let students = [];
            if (rawStudents) {
                try { students = JSON.parse(rawStudents); } catch(e) {}
            }

            let filtered = [];
            if (Array.isArray(students) && students.length > 0) {
                filtered = students.filter(s => {
                    const sClass = normalizeClassString(s.class || s.className);
                    const sSec = normalizeSectionString(s.section || s.group || s.sectionName);
                    return sClass === normC && (sSec === normS || !normS);
                });
            }"""

    old_get_students_m1 = """function getAllStudentsForClassAndSection(selectedClass, selectedSection) {
    const normC = normalizeClassString(selectedClass);
    const normS = normalizeSectionString(selectedSection);
    const isSci = normS === 'science';

    let rawStudents = localStorage.getItem('school_students');
    let students = [];
    if (rawStudents) {
        try { students = JSON.parse(rawStudents); } catch(e) {}
    }

    let filtered = [];
    if (Array.isArray(students) && students.length > 0) {
        filtered = students.filter(s => {
            const sClass = normalizeClassString(s.class || s.className);
            const sSec = normalizeSectionString(s.section || s.group || s.sectionName);
            return sClass === normC && (sSec === normS || !normS);
        });
    }"""

    new_get_students = """        function getAllStudentsForClassAndSection(selectedClass, selectedSection) {
            const normC = normalizeClassString(selectedClass);
            const normS = normalizeSectionString(selectedSection);
            const isSci = normS === 'science';

            let rawStudents = localStorage.getItem('school_students');
            let students = [];
            if (rawStudents) {
                try { students = JSON.parse(rawStudents); } catch(e) {}
            }

            const isMultiSec = !selectedSection || selectedSection === 'All' || selectedSection.includes(',');
            const allowedSecNorms = (isMultiSec && selectedSection && selectedSection.includes(','))
                ? selectedSection.split(',').map(p => normalizeSectionString(p.trim()))
                : null;

            let filtered = [];
            if (Array.isArray(students) && students.length > 0) {
                filtered = students.filter(s => {
                    const sClass = normalizeClassString(s.class || s.className);
                    if (sClass !== normC) return false;
                    if (isMultiSec && !allowedSecNorms) return true;
                    const sSec = normalizeSectionString(s.section || s.group || s.sectionName);
                    if (allowedSecNorms) {
                        return allowedSecNorms.includes(sSec);
                    }
                    return sSec === normS || !normS;
                });
            }"""

    new_get_students_m1 = new_get_students.replace('        function', 'function').replace('            ', '    ')

    if old_get_students in content:
        content = content.replace(old_get_students, new_get_students)
        print("  Replaced getAllStudentsForClassAndSection in Marksheet.html")
    elif old_get_students_m1 in content:
        content = content.replace(old_get_students_m1, new_get_students_m1)
        print("  Replaced getAllStudentsForClassAndSection in Marksheet1.html")
    else:
        print("  WARNING: Could not find exact match for getAllStudentsForClassAndSection!")

    # 3. Update generateMarksheetCardHTML in Marksheet.html
    old_card_sec = """            const studentName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
            const rollNo = student ? (student.roll || student.rollNo || rankNum) : rankNum;
            const studentId = getEffectiveStudentId(student, selectedClass, rankNum);
            const displayCls = getDisplayClassName(selectedClass);
            const displaySec = isEn ? getEnglishSectionName(selectedSection) : (selectedSection || 'ক');
            const examBadgeTitle = getDisplayExamName(exam);"""

    new_card_sec = """            const studentName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
            const rollNo = student ? (student.roll || student.rollNo || rankNum) : rankNum;
            const studentId = getEffectiveStudentId(student, selectedClass, rankNum);
            const studentSec = (student && (student.section || student.group || student.sectionName))
                ? String(student.section || student.group || student.sectionName).trim()
                : '';

            let effectiveCardSec = '';
            if (studentSec && studentSec !== 'All' && studentSec !== '(প্রযোজ্য না)') {
                effectiveCardSec = studentSec;
            } else if (selectedSection && !selectedSection.includes(',') && selectedSection !== 'All') {
                effectiveCardSec = selectedSection;
            } else if (selectedSection && selectedSection.includes(',')) {
                effectiveCardSec = selectedSection.split(',')[0].trim();
            } else {
                effectiveCardSec = isSecondary ? 'বিজ্ঞান' : 'ক';
            }

            const displayCls = getDisplayClassName(selectedClass);
            const displaySec = isEn ? getEnglishSectionName(effectiveCardSec) : getDisplaySectionName(effectiveCardSec);
            const examBadgeTitle = getDisplayExamName(exam);"""

    # 4. Update generateMarksheet1CardHTML in Marksheet1.html
    old_card_sec_m1 = """    const studentName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
    const rollNo = student ? (student.roll || student.rollNo || rankNum) : rankNum;
    const studentId = getEffectiveStudentId(student, selectedClass, rankNum);
    const displayCls = getDisplayClassName(selectedClass);
    const displaySec = isEn ? getEnglishSectionName(selectedSection) : (selectedSection || 'বিজ্ঞান');
    const displayExam = getDisplayExamName(exam);"""

    new_card_sec_m1 = """    const studentName = student ? (isEn && student.nameEn ? student.nameEn : (student.nameBn || student.name || (isEn ? 'Student' : 'শিক্ষার্থী'))) : (isEn ? 'Student' : 'শিক্ষার্থী');
    const rollNo = student ? (student.roll || student.rollNo || rankNum) : rankNum;
    const studentId = getEffectiveStudentId(student, selectedClass, rankNum);
    const studentSec = (student && (student.section || student.group || student.sectionName))
        ? String(student.section || student.group || student.sectionName).trim()
        : '';

    let effectiveCardSec = '';
    if (studentSec && studentSec !== 'All' && studentSec !== '(প্রযোজ্য না)') {
        effectiveCardSec = studentSec;
    } else if (selectedSection && !selectedSection.includes(',') && selectedSection !== 'All') {
        effectiveCardSec = selectedSection;
    } else if (selectedSection && selectedSection.includes(',')) {
        effectiveCardSec = selectedSection.split(',')[0].trim();
    } else {
        effectiveCardSec = isSecondary ? 'বিজ্ঞান' : 'ক';
    }

    const displayCls = getDisplayClassName(selectedClass);
    const displaySec = isEn ? getEnglishSectionName(effectiveCardSec) : getDisplaySectionName(effectiveCardSec);
    const displayExam = getDisplayExamName(exam);"""

    if old_card_sec in content:
        content = content.replace(old_card_sec, new_card_sec)
        print("  Replaced card section display in Marksheet.html")
    elif old_card_sec_m1 in content:
        content = content.replace(old_card_sec_m1, new_card_sec_m1)
        print("  Replaced card section display in Marksheet1.html")
    else:
        print("  WARNING: Could not find exact match for card section display!")

    # 5. Update single view secEl in syncCascadingFilters
    old_single_id = """                const idEl = document.getElementById('display-student-id');
                if (idEl) idEl.innerText = formatDigits(studentId);"""

    new_single_id = """                const idEl = document.getElementById('display-student-id');
                if (idEl) idEl.innerText = formatDigits(studentId);
                if (secEl) {
                    let singleSecDisplay = effectiveSec;
                    if (singleSecDisplay && singleSecDisplay.includes(',')) {
                        singleSecDisplay = singleSecDisplay.split(',')[0].trim();
                    }
                    secEl.innerText = (currentLanguage === 'en' ? 'Section = ' : 'শাখা = ') + (isEn ? getEnglishSectionName(singleSecDisplay) : getDisplaySectionName(singleSecDisplay));
                }"""

    old_single_id_m1 = """        const idEl = document.getElementById('display-student-id');
        if (idEl) idEl.innerText = formatDigits(studentId);"""

    new_single_id_m1 = """        const idEl = document.getElementById('display-student-id');
        if (idEl) idEl.innerText = formatDigits(studentId);
        if (secEl) {
            let singleSecDisplay = effectiveSec;
            if (singleSecDisplay && singleSecDisplay.includes(',')) {
                singleSecDisplay = singleSecDisplay.split(',')[0].trim();
            }
            secEl.innerText = (currentLanguage === 'en' ? 'Section = ' : 'শাখা = ') + (isEn ? getEnglishSectionName(singleSecDisplay) : getDisplaySectionName(singleSecDisplay));
        }"""

    if old_single_id in content:
        content = content.replace(old_single_id, new_single_id)
        print("  Replaced single view secEl in Marksheet.html")
    elif old_single_id_m1 in content:
        content = content.replace(old_single_id_m1, new_single_id_m1)
        print("  Replaced single view secEl in Marksheet1.html")
    else:
        print("  WARNING: Could not find exact match for single view secEl!")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Finished updating {filename}!\n")

update_marksheet('Marksheet.html')
update_marksheet('Marksheet1.html')

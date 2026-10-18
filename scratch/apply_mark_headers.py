import sys
import re

def update_marksheet():
    with open('Marksheet.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the HTML table header in single view
    old_header = '''            <thead>
                <tr>
                    <th class="subject-col">বিষয়</th>
                    <th>বহুনির্বাচনি</th>
                    <th>লিখিত</th>
                    <th>ব্যবহারিক</th>
                    <th>মোট</th>
                    <th>সর্বমোট</th>
                    <th>গ্রেড</th>
                    <th>পয়েন্ট</th>
                </tr>
            </thead>'''
    new_header = '''            <thead>
                <tr>
                    <th class="subject-col">বিষয়</th>
                    <th id="th-header-mcq">বহুনির্বাচনি</th>
                    <th id="th-header-cq">লিখিত</th>
                    <th id="th-header-prac">ব্যবহারিক</th>
                    <th id="th-header-total">মোট</th>
                    <th>সর্বমোট</th>
                    <th>গ্রেড</th>
                    <th>পয়েন্ট</th>
                </tr>
            </thead>'''

    if old_header in content:
        content = content.replace(old_header, new_header, 1)
        print("[OK] Replaced single thead in Marksheet.html")
    else:
        print("[WARN] single thead not found in Marksheet.html")

    # 2. Add getExamDistribution and updateTableHeaderMarks before renderMarksheetTable
    dist_fns = '''        // Get Exam full marks breakdown (MCQ, Written/CQ, Practical, Total) from Exam List & Exam Types
        function getExamDistribution(selectedExam, selectedClass) {
            let cq = 70;
            let mcq = 30;
            let prac = 0;
            let total = 100;

            try {
                const rawTypes = localStorage.getItem('school_exam_types');
                if (rawTypes) {
                    const types = JSON.parse(rawTypes);
                    if (Array.isArray(types)) {
                        const matchedExam = types.find(t => isExamMatch(t.name, selectedExam));
                        if (matchedExam) {
                            if (matchedExam.defaultCQ !== undefined && matchedExam.defaultCQ !== null) cq = Number(matchedExam.defaultCQ);
                            if (matchedExam.defaultMCQ !== undefined && matchedExam.defaultMCQ !== null) mcq = Number(matchedExam.defaultMCQ);
                            if (matchedExam.defaultPractical !== undefined && matchedExam.defaultPractical !== null) prac = Number(matchedExam.defaultPractical);
                            total = cq + mcq + prac;

                            // Check matched schedules to find the dominant subtype for this class
                            const rawSchedules = localStorage.getItem('school_exam_schedules');
                            if (rawSchedules) {
                                const schedules = JSON.parse(rawSchedules);
                                if (Array.isArray(schedules)) {
                                    const normC = normalizeClassString(selectedClass);
                                    const classSchedules = schedules.filter(sc => {
                                        if (!sc) return false;
                                        const mEx = isExamMatch(sc.term || sc.examName, selectedExam);
                                        const mCls = !normC || normalizeClassString(sc.className || sc.class) === normC;
                                        return mEx && mCls;
                                    });

                                    if (classSchedules.length > 0 && Array.isArray(matchedExam.examTypes) && matchedExam.examTypes.length > 0) {
                                        const typeCounts = {};
                                        classSchedules.forEach(sc => {
                                            const et = sc.examType || sc.type;
                                            if (et) typeCounts[et] = (typeCounts[et] || 0) + 1;
                                        });
                                        let bestType = null;
                                        let maxCount = 0;
                                        Object.keys(typeCounts).forEach(et => {
                                            if (typeCounts[et] > maxCount) {
                                                maxCount = typeCounts[et];
                                                bestType = et;
                                            }
                                        });
                                        if (bestType) {
                                            const st = matchedExam.examTypes.find(t => (t.typeName || '').trim().toLowerCase() === bestType.trim().toLowerCase());
                                            if (st) {
                                                if (st.defaultCQ !== undefined) cq = Number(st.defaultCQ);
                                                if (st.defaultMCQ !== undefined) mcq = Number(st.defaultMCQ);
                                                if (st.defaultPractical !== undefined) prac = Number(st.defaultPractical);
                                                total = cq + mcq + prac;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch(e) {
                console.error("Error finding exam distribution:", e);
            }

            return { cq, mcq, prac, total };
        }

        // Dynamically update the table header column titles with exam full marks
        function updateTableHeaderMarks(exam, selectedClass) {
            const dist = getExamDistribution(exam, selectedClass);
            const thMcq = document.getElementById('th-header-mcq');
            const thCq = document.getElementById('th-header-cq');
            const thPrac = document.getElementById('th-header-prac');
            const thTotal = document.getElementById('th-header-total');

            if (thMcq) thMcq.innerText = `বহুনির্বাচনি (${toBnDigits(dist.mcq)})`;
            if (thCq) thCq.innerText = `লিখিত (${toBnDigits(dist.cq)})`;
            if (thPrac) thPrac.innerText = `ব্যবহারিক (${toBnDigits(dist.prac)})`;
            if (thTotal) thTotal.innerText = `মোট (${toBnDigits(dist.total)})`;
        }

'''

    old_render_fn = '''        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {
            const tbody = document.getElementById('marksheet-tbody');'''

    new_render_fn = dist_fns + '''        function renderMarksheetTable(selectedClass, selectedSection, student, exam) {
            const tbody = document.getElementById('marksheet-tbody');
            if (tbody) {
                updateTableHeaderMarks(exam, selectedClass);
            }'''

    if old_render_fn in content:
        content = content.replace(old_render_fn, new_render_fn, 1)
        print("[OK] Injected getExamDistribution and updateTableHeaderMarks in Marksheet.html")
    else:
        print("[WARN] old_render_fn not found in Marksheet.html")

    # 3. Update generateMarksheetCardHTML for batch printing
    old_batch_header = '''                    <!-- Marks Table -->
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th class="subject-col">বিষয়</th>
                                <th>বহুনির্বাচনি</th>
                                <th>লিখিত</th>
                                <th>ব্যবহারিক</th>
                                <th>মোট</th>
                                <th>সর্বমোট</th>
                                <th>গ্রেড</th>
                                <th>পয়েন্ট</th>
                            </tr>
                        </thead>'''

    new_batch_header = '''                    <!-- Marks Table -->
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th class="subject-col">বিষয়</th>
                                <th>বহুনির্বাচনি (${toBnDigits(examDist.mcq)})</th>
                                <th>লিখিত (${toBnDigits(examDist.cq)})</th>
                                <th>ব্যবহারিক (${toBnDigits(examDist.prac)})</th>
                                <th>মোট (${toBnDigits(examDist.total)})</th>
                                <th>সর্বমোট</th>
                                <th>গ্রেড</th>
                                <th>পয়েন্ট</th>
                            </tr>
                        </thead>'''

    old_batch_fn_start = '''        function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {'''
    new_batch_fn_start = '''        function generateMarksheetCardHTML(student, selectedClass, selectedSection, exam, rankNum) {
            const examDist = getExamDistribution(exam, selectedClass);'''

    if old_batch_fn_start in content:
        content = content.replace(old_batch_fn_start, new_batch_fn_start, 1)
        print("[OK] Injected examDist in generateMarksheetCardHTML")
    else:
        print("[WARN] old_batch_fn_start not found in Marksheet.html")

    if old_batch_header in content:
        content = content.replace(old_batch_header, new_batch_header, 1)
        print("[OK] Replaced batch thead in Marksheet.html")
    else:
        print("[WARN] old_batch_header not found in Marksheet.html")

    with open('Marksheet.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[SUCCESS] Marksheet.html updated successfully!")

def update_marksheet1():
    with open('Marksheet1.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the HTML table header in single view
    old_header1 = '''                <tr>
                    <th rowspan="2" style="width: 27%;">পাঠ্য বিষয়সমূহ</th>
                    <th rowspan="2" style="width: 8%;">পূর্ণমান</th>
                    <th colspan="3" style="width: 25%;">প্রাপ্ত নম্বর</th>
                    <th rowspan="2" style="width: 9%;">মোট নম্বর</th>
                    <th rowspan="2" style="width: 11%;">সর্বমোট</th>
                    <th rowspan="2" style="width: 9%;">লেটার গ্রেড</th>
                    <th rowspan="2" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>
                </tr>
                <tr>
                    <th style="width: 8%;">বহুনির্বাচনি</th>
                    <th style="width: 8%;">লিখিত</th>
                    <th style="width: 9%;">ব্যবহারিক</th>
                </tr>'''

    new_header1 = '''                <tr>
                    <th rowspan="2" style="width: 27%;">পাঠ্য বিষয়সমূহ</th>
                    <th rowspan="2" style="width: 8%;">পূর্ণমান</th>
                    <th colspan="3" style="width: 25%;">প্রাপ্ত নম্বর</th>
                    <th rowspan="2" style="width: 9%;" id="th-header-total-1">মোট নম্বর</th>
                    <th rowspan="2" style="width: 11%;">সর্বমোট</th>
                    <th rowspan="2" style="width: 9%;">লেটার গ্রেড</th>
                    <th rowspan="2" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>
                </tr>
                <tr>
                    <th style="width: 8%;" id="th-header-mcq-1">বহুনির্বাচনি</th>
                    <th style="width: 8%;" id="th-header-cq-1">লিখিত</th>
                    <th style="width: 9%;" id="th-header-prac-1">ব্যবহারিক</th>
                </tr>'''

    if old_header1 in content:
        content = content.replace(old_header1, new_header1, 1)
        print("[OK] Replaced single thead in Marksheet1.html")
    else:
        print("[WARN] single thead not found in Marksheet1.html")

    # 2. Add getExamDistribution and updateTableHeaderMarks before renderMarksheet1Table
    dist_fns1 = '''// Get Exam full marks breakdown (MCQ, Written/CQ, Practical, Total) from Exam List & Exam Types
function getExamDistribution(selectedExam, selectedClass) {
    let cq = 70;
    let mcq = 30;
    let prac = 0;
    let total = 100;

    try {
        const rawTypes = localStorage.getItem('school_exam_types');
        if (rawTypes) {
            const types = JSON.parse(rawTypes);
            if (Array.isArray(types)) {
                const matchedExam = types.find(t => isExamMatch(t.name, selectedExam));
                if (matchedExam) {
                    if (matchedExam.defaultCQ !== undefined && matchedExam.defaultCQ !== null) cq = Number(matchedExam.defaultCQ);
                    if (matchedExam.defaultMCQ !== undefined && matchedExam.defaultMCQ !== null) mcq = Number(matchedExam.defaultMCQ);
                    if (matchedExam.defaultPractical !== undefined && matchedExam.defaultPractical !== null) prac = Number(matchedExam.defaultPractical);
                    total = cq + mcq + prac;

                    // Check matched schedules to find the dominant subtype for this class
                    const rawSchedules = localStorage.getItem('school_exam_schedules');
                    if (rawSchedules) {
                        const schedules = JSON.parse(rawSchedules);
                        if (Array.isArray(schedules)) {
                            const normC = normalizeClassString(selectedClass);
                            const classSchedules = schedules.filter(sc => {
                                if (!sc) return false;
                                const mEx = isExamMatch(sc.term || sc.examName, selectedExam);
                                const mCls = !normC || normalizeClassString(sc.className || sc.class) === normC;
                                return mEx && mCls;
                            });

                            if (classSchedules.length > 0 && Array.isArray(matchedExam.examTypes) && matchedExam.examTypes.length > 0) {
                                const typeCounts = {};
                                classSchedules.forEach(sc => {
                                    const et = sc.examType || sc.type;
                                    if (et) typeCounts[et] = (typeCounts[et] || 0) + 1;
                                });
                                let bestType = null;
                                let maxCount = 0;
                                Object.keys(typeCounts).forEach(et => {
                                    if (typeCounts[et] > maxCount) {
                                        maxCount = typeCounts[et];
                                        bestType = et;
                                    }
                                });
                                if (bestType) {
                                    const st = matchedExam.examTypes.find(t => (t.typeName || '').trim().toLowerCase() === bestType.trim().toLowerCase());
                                    if (st) {
                                        if (st.defaultCQ !== undefined) cq = Number(st.defaultCQ);
                                        if (st.defaultMCQ !== undefined) mcq = Number(st.defaultMCQ);
                                        if (st.defaultPractical !== undefined) prac = Number(st.defaultPractical);
                                        total = cq + mcq + prac;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch(e) {
        console.error("Error finding exam distribution:", e);
    }

    return { cq, mcq, prac, total };
}

// Dynamically update the table header column titles with exam full marks
function updateTableHeaderMarks(exam, selectedClass) {
    const dist = getExamDistribution(exam, selectedClass);
    const thMcq = document.getElementById('th-header-mcq-1');
    const thCq = document.getElementById('th-header-cq-1');
    const thPrac = document.getElementById('th-header-prac-1');
    const thTotal = document.getElementById('th-header-total-1');

    if (thMcq) thMcq.innerText = `বহুনির্বাচনি (${toBnDigits(dist.mcq)})`;
    if (thCq) thCq.innerText = `লিখিত (${toBnDigits(dist.cq)})`;
    if (thPrac) thPrac.innerText = `ব্যবহারিক (${toBnDigits(dist.prac)})`;
    if (thTotal) thTotal.innerText = `মোট নম্বর (${toBnDigits(dist.total)})`;
}

'''

    old_render_fn1 = '''function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {
    const tbody = document.getElementById('transcript-tbody-1');'''

    new_render_fn1 = dist_fns1 + '''function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {
    const tbody = document.getElementById('transcript-tbody-1');
    if (tbody) {
        updateTableHeaderMarks(exam, selectedClass);
    }'''

    if old_render_fn1 in content:
        content = content.replace(old_render_fn1, new_render_fn1, 1)
        print("[OK] Injected getExamDistribution and updateTableHeaderMarks in Marksheet1.html")
    else:
        print("[WARN] old_render_fn1 not found in Marksheet1.html")

    # 3. Update generateSingleMarksheetHtml for batch printing
    old_batch_header1 = '''                    <tr>
                        <th rowspan="2" style="width: 27%;">পাঠ্য বিষয়সমূহ</th>
                        <th rowspan="2" style="width: 8%;">পূর্ণমান</th>
                        <th colspan="3" style="width: 25%;">প্রাপ্ত নম্বর</th>
                        <th rowspan="2" style="width: 9%;">মোট নম্বর</th>
                        <th rowspan="2" style="width: 11%;">সর্বমোট</th>
                        <th rowspan="2" style="width: 9%;">লেটার গ্রেড</th>
                        <th rowspan="2" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>
                    </tr>
                    <tr>
                        <th style="width: 8%;">বহুনির্বাচনি</th>
                        <th style="width: 8%;">লিখিত</th>
                        <th style="width: 9%;">ব্যবহারিক</th>
                    </tr>'''

    new_batch_header1 = '''                    <tr>
                        <th rowspan="2" style="width: 27%;">পাঠ্য বিষয়সমূহ</th>
                        <th rowspan="2" style="width: 8%;">পূর্ণমান</th>
                        <th colspan="3" style="width: 25%;">প্রাপ্ত নম্বর</th>
                        <th rowspan="2" style="width: 9%;">মোট নম্বর (${toBnDigits(examDist.total)})</th>
                        <th rowspan="2" style="width: 11%;">সর্বমোট</th>
                        <th rowspan="2" style="width: 9%;">লেটার গ্রেড</th>
                        <th rowspan="2" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>
                    </tr>
                    <tr>
                        <th style="width: 8%;">বহুনির্বাচনি (${toBnDigits(examDist.mcq)})</th>
                        <th style="width: 8%;">লিখিত (${toBnDigits(examDist.cq)})</th>
                        <th style="width: 9%;">ব্যবহারিক (${toBnDigits(examDist.prac)})</th>
                    </tr>'''

    old_batch_fn_start1 = '''function generateSingleMarksheetHtml(selectedClass, selectedSection, student, exam, index, rank, totalStudents) {'''
    new_batch_fn_start1 = '''function generateSingleMarksheetHtml(selectedClass, selectedSection, student, exam, index, rank, totalStudents) {
    const examDist = getExamDistribution(exam, selectedClass);'''

    if old_batch_fn_start1 in content:
        content = content.replace(old_batch_fn_start1, new_batch_fn_start1, 1)
        print("[OK] Injected examDist in generateSingleMarksheetHtml")
    else:
        print("[WARN] old_batch_fn_start1 not found in Marksheet1.html")

    if old_batch_header1 in content:
        content = content.replace(old_batch_header1, new_batch_header1, 1)
        print("[OK] Replaced batch thead in Marksheet1.html")
    else:
        print("[WARN] old_batch_header1 not found in Marksheet1.html")

    with open('Marksheet1.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[SUCCESS] Marksheet1.html updated successfully!")

if __name__ == '__main__':
    update_marksheet()
    update_marksheet1()

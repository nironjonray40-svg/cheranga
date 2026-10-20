import sys, shutil

sys.stdout.reconfigure(encoding='utf-8')

# 1. Backup Tabulation Sheet.html
shutil.copyfile('Tabulation Sheet.html', 'Tabulation Sheet.html.bak_marks')
print("Backup created at Tabulation Sheet.html.bak_marks")

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# -------------------------------------------------------------------------------------
# PART A: Update THEAD 6 (Row 3, Row 4, Row 5)
# -------------------------------------------------------------------------------------

old_thead_rows = """            <tr>

                <th colspan="3" class="bg-peach" data-subj="bangla1">বাংলা ১ম</th>

                <th colspan="3" class="bg-peach" data-subj="bangla2">বাংলা ২য়</th>

                <th rowspan="2" class="v-text bg-peach">সর্বমোট</th>

                <th rowspan="3" class="v-text bg-peach">গড় প্রাপ্ত</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th class="bg-peach" data-subj="english1">English 1st</th>

                <th class="bg-peach" data-subj="english2">English 2nd</th>

                <th rowspan="2" class="v-text bg-peach">সর্বমোট</th>

                <th rowspan="3" class="v-text bg-peach">গড় প্রাপ্ত</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th rowspan="2" class="v-text bg-peach">বহুনির্বাচনি</th>

                <th rowspan="2" class="v-text bg-peach">লিখিত</th>

                <th rowspan="2" class="v-text bg-peach">মোট</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th rowspan="2" class="v-text bg-peach">বহুনির্বাচনি</th>

                <th rowspan="2" class="v-text bg-peach">লিখিত</th>

                <th rowspan="2" class="v-text bg-peach">মোট</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th rowspan="2" class="v-text bg-peach">বহুনির্বাচনি</th>

                <th rowspan="2" class="v-text bg-peach">লিখিত</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="practical" data-subj="chem">ব্যবহারিক</th>

                <th rowspan="2" class="v-text bg-peach">মোট</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th rowspan="2" class="v-text bg-peach">বহুনির্বাচনি</th>

                <th rowspan="2" class="v-text bg-peach">লিখিত</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="practical" data-subj="phys">ব্যবহারিক</th>

                <th rowspan="2" class="v-text bg-peach">মোট</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th rowspan="2" class="v-text bg-peach">বহুনির্বাচনি</th>

                <th rowspan="2" class="v-text bg-peach">লিখিত</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="practical" data-subj="bio">ব্যবহারিক</th>

                <th rowspan="2" class="v-text bg-peach">মোট</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th rowspan="2" class="v-text bg-peach">বহুনির্বাচনি</th>

                <th rowspan="2" class="v-text bg-peach">লিখিত</th>

                <th rowspan="2" class="v-text bg-peach">মোট</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th rowspan="2" class="v-text bg-peach">বহুনির্বাচনি</th>

                <th rowspan="2" class="v-text bg-peach">লিখিত</th>

                <th rowspan="2" class="v-text bg-peach">মোট</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>



                <th rowspan="2" class="v-text bg-peach">বহুনির্বাচনি</th>

                <th rowspan="2" class="v-text bg-peach">লিখিত</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="practical" data-subj="agri">ব্যবহারিক</th>

                <th rowspan="2" class="v-text bg-peach">মোট</th>

                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>

                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

            </tr>



            <!-- Row 3: Detail Exam Type -->

            <tr>

                <th class="v-text bg-peach">বহুনির্বাচনি</th>

                <th class="v-text bg-peach">লিখিত</th>

                <th class="v-text bg-peach">মোট</th>

                <th class="v-text bg-peach">বহুনির্বাচনি</th>

                <th class="v-text bg-peach">লিখিত</th>

                <th class="v-text bg-peach">মোট</th>

                <th class="v-text bg-peach">লিখিত</th>

                <th class="v-text bg-peach">লিখিত</th>

            </tr>



            <!-- Row 4: Full Marks -->

            <tr>

                <th class="bg-peach">৩০</th>

                <th class="bg-peach">৭০</th>

                <th class="bg-peach">১০০</th>

                <th class="bg-peach">৩০</th>

                <th class="bg-peach">৭০</th>

                <th class="bg-peach">১০০</th>

                <th class="bg-peach">২০০</th> <!-- Bangla Grand Total -->

                <th class="bg-peach">১০০</th>

                <th class="bg-peach">১০০</th>

                <th class="bg-peach">২০০</th> <!-- English Total -->

                <th class="bg-peach">৩০</th>

                <th class="bg-peach">৭০</th>

                <th class="bg-peach">১০০</th> <!-- Math Total -->

                <th class="bg-peach">৩০</th>

                <th class="bg-peach">৭০</th>

                <th class="bg-peach">১০০</th> <!-- BGS Total -->

                <th class="bg-peach" data-fullmark="mcq" data-subj="chem">২৫</th>

                <th class="bg-peach" data-fullmark="written" data-subj="chem">৫০</th>

                <th class="bg-peach" data-col-type="practical" data-subj="chem">২৫</th>

                <th class="bg-peach" data-fullmark="total" data-subj="chem">১০০</th> <!-- Chemistry Total -->

                <th class="bg-peach" data-fullmark="mcq" data-subj="phys">২৫</th>

                <th class="bg-peach" data-fullmark="written" data-subj="phys">৫০</th>

                <th class="bg-peach" data-col-type="practical" data-subj="phys">২৫</th>

                <th class="bg-peach" data-fullmark="total" data-subj="phys">১০০</th> <!-- Physics Total -->

                <th class="bg-peach" data-fullmark="mcq" data-subj="bio">২৫</th>

                <th class="bg-peach" data-fullmark="written" data-subj="bio">৫০</th>

                <th class="bg-peach" data-col-type="practical" data-subj="bio">২৫</th>

                <th class="bg-peach" data-fullmark="total" data-subj="bio">১০০</th> <!-- Biology Total -->

                <th class="bg-peach">৩০</th>

                <th class="bg-peach">৭০</th>

                <th class="bg-peach">১০০</th> <!-- Religion Total -->

                <th class="bg-peach">১৫</th>

                <th class="bg-peach">৩৫</th>

                <th class="bg-peach">৫০</th> <!-- ICT Total -->

                <th class="bg-peach" data-fullmark="mcq" data-subj="agri">২৫</th>

                <th class="bg-peach" data-fullmark="written" data-subj="agri">৫০</th>

                <th class="bg-peach" data-col-type="practical" data-subj="agri">২৫</th>

                <th class="bg-peach" data-fullmark="total" data-subj="agri">১০০</th> <!-- Agriculture Total -->

            </tr>"""

new_thead_rows = """            <tr>
                <th colspan="3" class="bg-peach" data-subj="bangla1">বাংলা ১ম</th>
                <th colspan="3" class="bg-peach" data-subj="bangla2">বাংলা ২য়</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="grand_total" data-subj="bangla">সর্বমোট</th>
                <th rowspan="3" class="v-text bg-peach">গড় প্রাপ্ত</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th class="bg-peach" data-subj="english1">English 1st</th>
                <th class="bg-peach" data-subj="english2">English 2nd</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="grand_total" data-subj="english">সর্বমোট</th>
                <th rowspan="3" class="v-text bg-peach">গড় প্রাপ্ত</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="mcq" data-subj="math">বহুনির্বাচনি</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="written" data-subj="math">লিখিত</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="total" data-subj="math">মোট</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="mcq" data-subj="bgs">বহুনির্বাচনি</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="written" data-subj="bgs">লিখিত</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="total" data-subj="bgs">মোট</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="mcq" data-subj="chem">বহুনির্বাচনি</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="written" data-subj="chem">লিখিত</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="practical" data-subj="chem">ব্যবহারিক</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="total" data-subj="chem">মোট</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="mcq" data-subj="phys">বহুনির্বাচনি</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="written" data-subj="phys">লিখিত</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="practical" data-subj="phys">ব্যবহারিক</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="total" data-subj="phys">মোট</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="mcq" data-subj="bio">বহুনির্বাচনি</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="written" data-subj="bio">লিখিত</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="practical" data-subj="bio">ব্যবহারিক</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="total" data-subj="bio">মোট</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="mcq" data-subj="rel">বহুনির্বাচনি</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="written" data-subj="rel">লিখিত</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="total" data-subj="rel">মোট</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="mcq" data-subj="ict">বহুনির্বাচনি</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="written" data-subj="ict">লিখিত</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="total" data-subj="ict">মোট</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text bg-peach" data-col-type="mcq" data-subj="agri">বহুনির্বাচনি</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="written" data-subj="agri">লিখিত</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="practical" data-subj="agri">ব্যবহারিক</th>
                <th rowspan="2" class="v-text bg-peach" data-col-type="total" data-subj="agri">মোট</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>
            </tr>

            <!-- Row 3: Detail Exam Type -->
            <tr>
                <th class="v-text bg-peach" data-col-type="mcq" data-subj="bangla1">বহুনির্বাচনি</th>
                <th class="v-text bg-peach" data-col-type="written" data-subj="bangla1">লিখিত</th>
                <th class="v-text bg-peach" data-col-type="total" data-subj="bangla1">মোট</th>
                <th class="v-text bg-peach" data-col-type="mcq" data-subj="bangla2">বহুনির্বাচনি</th>
                <th class="v-text bg-peach" data-col-type="written" data-subj="bangla2">লিখিত</th>
                <th class="v-text bg-peach" data-col-type="total" data-subj="bangla2">মোট</th>
                <th class="v-text bg-peach" data-col-type="written" data-subj="english1">লিখিত</th>
                <th class="v-text bg-peach" data-col-type="written" data-subj="english2">লিখিত</th>
            </tr>

            <!-- Row 4: Full Marks (Dynamically updated from Exam List) -->
            <tr>
                <th class="bg-peach" data-subj="bangla1" data-fullmark="mcq">৩০</th>
                <th class="bg-peach" data-subj="bangla1" data-fullmark="written">৭০</th>
                <th class="bg-peach" data-subj="bangla1" data-fullmark="total">১০০</th>

                <th class="bg-peach" data-subj="bangla2" data-fullmark="mcq">৩০</th>
                <th class="bg-peach" data-subj="bangla2" data-fullmark="written">৭০</th>
                <th class="bg-peach" data-subj="bangla2" data-fullmark="total">১০০</th>

                <th class="bg-peach" data-subj="bangla" data-fullmark="grand_total">২০০</th> <!-- Bangla Grand Total -->

                <th class="bg-peach" data-subj="english1" data-fullmark="written">১০০</th>
                <th class="bg-peach" data-subj="english2" data-fullmark="written">১০০</th>
                <th class="bg-peach" data-subj="english" data-fullmark="grand_total">২০০</th> <!-- English Total -->

                <th class="bg-peach" data-subj="math" data-fullmark="mcq">৩০</th>
                <th class="bg-peach" data-subj="math" data-fullmark="written">৭০</th>
                <th class="bg-peach" data-subj="math" data-fullmark="total">১০০</th> <!-- Math Total -->

                <th class="bg-peach" data-subj="bgs" data-fullmark="mcq">৩০</th>
                <th class="bg-peach" data-subj="bgs" data-fullmark="written">৭০</th>
                <th class="bg-peach" data-subj="bgs" data-fullmark="total">১০০</th> <!-- BGS Total -->

                <th class="bg-peach" data-subj="chem" data-fullmark="mcq">২৫</th>
                <th class="bg-peach" data-subj="chem" data-fullmark="written">৫০</th>
                <th class="bg-peach" data-col-type="practical" data-subj="chem" data-fullmark="practical">২৫</th>
                <th class="bg-peach" data-subj="chem" data-fullmark="total">১০০</th> <!-- Chemistry Total -->

                <th class="bg-peach" data-subj="phys" data-fullmark="mcq">২৫</th>
                <th class="bg-peach" data-subj="phys" data-fullmark="written">৫০</th>
                <th class="bg-peach" data-col-type="practical" data-subj="phys" data-fullmark="practical">২৫</th>
                <th class="bg-peach" data-subj="phys" data-fullmark="total">১০০</th> <!-- Physics Total -->

                <th class="bg-peach" data-subj="bio" data-fullmark="mcq">২৫</th>
                <th class="bg-peach" data-subj="bio" data-fullmark="written">৫০</th>
                <th class="bg-peach" data-col-type="practical" data-subj="bio" data-fullmark="practical">২৫</th>
                <th class="bg-peach" data-subj="bio" data-fullmark="total">১০০</th> <!-- Biology Total -->

                <th class="bg-peach" data-subj="rel" data-fullmark="mcq">৩০</th>
                <th class="bg-peach" data-subj="rel" data-fullmark="written">৭০</th>
                <th class="bg-peach" data-subj="rel" data-fullmark="total">১০০</th> <!-- Religion Total -->

                <th class="bg-peach" data-subj="ict" data-fullmark="mcq">১৫</th>
                <th class="bg-peach" data-subj="ict" data-fullmark="written">৩৫</th>
                <th class="bg-peach" data-subj="ict" data-fullmark="total">৫০</th> <!-- ICT Total -->

                <th class="bg-peach" data-subj="agri" data-fullmark="mcq">২৫</th>
                <th class="bg-peach" data-subj="agri" data-fullmark="written">৫০</th>
                <th class="bg-peach" data-col-type="practical" data-subj="agri" data-fullmark="practical">২৫</th>
                <th class="bg-peach" data-subj="agri" data-fullmark="total">১০০</th> <!-- Agriculture Total -->
            </tr>"""

assert old_thead_rows in content, "Error: old_thead_rows not found in Tabulation Sheet.html"
content = content.replace(old_thead_rows, new_thead_rows)
print("Part A applied: THEAD Rows 3, 4, 5 updated with dynamic data attributes.")

# -------------------------------------------------------------------------------------
# PART B: Add getSubjectMarksDistribution, updateDynamicSubjectMarksAndHeaders, 
# and update getSubjectPracticalStatus
# -------------------------------------------------------------------------------------

old_practical_status_block = """        // --- SUBJECT & PRACTICAL STATUS RESOLUTION (from Exam List & Schedules) ---
        function getSubjectSlot(subName, subCode) {
            const sName = (subName || '').trim().toLowerCase();
            const code = (subCode || '').toString().trim();

            if (code && activeClassSlotMap[code]) return activeClassSlotMap[code];
            if (sName && activeClassSlotMap[sName]) return activeClassSlotMap[sName];

            if (code === '101' || /bangla.*1|বাং.*১|বাংলা সাহিত্য/i.test(sName)) return 'bangla1';
            if (code === '102' || /bangla.*2|বাং.*২|ব্যাকরণ/i.test(sName)) return 'bangla2';
            if (code === '103' || /english.*1|eng.*1|ইংরেজি ১ম|for today/i.test(sName)) return 'english1';
            if (code === '104' || /english.*2|eng.*2|ইংরেজি ২য়|grammar/i.test(sName)) return 'english2';
            if (code === '105' || /math|গণিত/i.test(sName)) return 'math';
            if (code === '107' || /bgs|global studies|বিশ্বপরিচয়/i.test(sName)) return 'bgs';
            if (code === '1111' || /physics|পদার্থ/i.test(sName)) return 'phys';
            if (code === '135' || /chemistry|রসায়ন/i.test(sName)) return 'chem';
            if (code === '108' || /science|বিজ্ঞান/i.test(sName)) return 'chem'; // General Science maps to slot 5 (chem)
            if (code === '180' || /biology|জীববিজ্ঞান/i.test(sName)) return 'bio';
            if (['110', '111', '112', '113'].includes(code) || /religion|islam|hindu|ধর্ম/i.test(sName)) return 'rel';
            if (code === '106' || /ict|information.*tech|যোগাযোগ/i.test(sName)) return 'ict';
            if (['109', '126', '505'].includes(code) || /agri|কৃষি|higher.*math|উচ্চতর/i.test(sName)) return 'agri';

            return null;
        }

        function getSubjectPracticalStatus() {
            const status = {
                chem: false,
                phys: false,
                bio: false,
                agri: false
            };

            let schedules = [];
            let examTypes = [];
            let savedMarks = {};
            try {
                schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]');
            } catch (e) {}
            try {
                examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]');
            } catch (e) {}
            try {
                savedMarks = JSON.parse(localStorage.getItem('school_student_marks') || '{}');
            } catch (e) {}

            const activeExam = (currentFilterExam || 'all').trim().toLowerCase();
            const activeClass = (currentFilterClass || 'all').trim().toLowerCase();

            function normCls(cls) {
                if (!cls) return '';
                const v = cls.toString().toLowerCase().trim();
                if (v.includes('ten') || v.includes('10')) return 'ten';
                if (v.includes('nine') || v.includes('9')) return 'nine';
                if (v.includes('eight') || v.includes('8')) return 'eight';
                if (v.includes('seven') || v.includes('7')) return 'seven';
                if (v.includes('six') || v.includes('6')) return 'six';
                return v;
            }

            const normActiveClass = normCls(activeClass);

            const matchedSchedules = schedules.filter(s => {
                if (!s) return false;
                if (activeExam !== 'all' && (s.term || '').trim().toLowerCase() !== activeExam) return false;
                if (normActiveClass && normActiveClass !== 'all') {
                    const sc = normCls(s.class);
                    if (sc && sc !== normActiveClass) return false;
                }
                return true;
            });

            matchedSchedules.forEach(s => {
                const slot = getSubjectSlot(s.subject, '');
                if (!['chem', 'phys', 'bio', 'agri'].includes(slot)) return;

                let hasPractical = false;

                // 1. Direct practical property on schedule
                if (s.practical !== undefined && Number(s.practical) > 0) {
                    hasPractical = true;
                }

                // 2. Exam type distribution config from school_exam_types
                if (!hasPractical && examTypes.length > 0) {
                    const examObj = examTypes.find(et => (et.name || '').trim().toLowerCase() === (s.term || '').trim().toLowerCase());
                    if (examObj) {
                        const subTypes = examObj.examTypes || [];
                        let matchedST = null;
                        if (s.examType) {
                            matchedST = subTypes.find(st => (st.typeName || '').trim().toLowerCase() === (s.examType || '').trim().toLowerCase());
                        }
                        if (!matchedST && subTypes.length > 0) {
                            matchedST = subTypes[0];
                        }
                        const pracNum = matchedST && matchedST.defaultPractical !== undefined
                            ? Number(matchedST.defaultPractical)
                            : (examObj.defaultPractical !== undefined ? Number(examObj.defaultPractical) : 0);
                        if (pracNum > 0) {
                            hasPractical = true;
                        }
                    }
                }

                // 3. Check actual saved student marks
                if (!hasPractical && savedMarks) {
                    for (const key of Object.keys(savedMarks)) {
                        if (key.endsWith(`_${s.id}`) || key.endsWith(`_${s.term}`)) {
                            const rec = savedMarks[key];
                            if (rec && typeof rec === 'object') {
                                for (const subK of Object.keys(rec)) {
                                    const m = rec[subK];
                                    if (m && typeof m === 'object' && m.practical !== undefined && m.practical !== '' && m.practical !== '-' && Number(m.practical) > 0) {
                                        hasPractical = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (hasPractical) break;
                    }
                }

                if (hasPractical) {
                    status[slot] = true;
                }
            });

            return status;
        }"""

new_practical_status_block = """        // --- SUBJECT & PRACTICAL STATUS RESOLUTION (from Exam List & Schedules) ---
        function getSubjectSlot(subName, subCode) {
            const sName = (subName || '').trim().toLowerCase();
            const code = (subCode || '').toString().trim();

            if (code && activeClassSlotMap[code]) return activeClassSlotMap[code];
            if (sName && activeClassSlotMap[sName]) return activeClassSlotMap[sName];

            if (code === '101' || /bangla.*1|বাং.*১|বাংলা সাহিত্য/i.test(sName)) return 'bangla1';
            if (code === '102' || /bangla.*2|বাং.*২|ব্যাকরণ/i.test(sName)) return 'bangla2';
            if (code === '103' || /english.*1|eng.*1|ইংরেজি ১ম|for today/i.test(sName)) return 'english1';
            if (code === '104' || /english.*2|eng.*2|ইংরেজি ২য়|grammar/i.test(sName)) return 'english2';
            if (code === '105' || /math|গণিত/i.test(sName)) return 'math';
            if (code === '107' || /bgs|global studies|বিশ্বপরিচয়/i.test(sName)) return 'bgs';
            if (code === '1111' || /physics|পদার্থ/i.test(sName)) return 'phys';
            if (code === '135' || /chemistry|রসায়ন/i.test(sName)) return 'chem';
            if (code === '108' || /science|বিজ্ঞান/i.test(sName)) return 'chem'; // General Science maps to slot 5 (chem)
            if (code === '180' || /biology|জীববিজ্ঞান/i.test(sName)) return 'bio';
            if (['110', '111', '112', '113'].includes(code) || /religion|islam|hindu|ধর্ম/i.test(sName)) return 'rel';
            if (code === '106' || /ict|information.*tech|যোগাযোগ/i.test(sName)) return 'ict';
            if (['109', '126', '505'].includes(code) || /agri|কৃষি|higher.*math|উচ্চতর/i.test(sName)) return 'agri';

            return null;
        }

        // Dynamic Marks Distribution (MCQ, CQ, Practical, Total) extracted directly from "Exam List" (school_exam_schedules & school_exam_types)
        function getSubjectMarksDistribution(slotKey, className, examName) {
            let schedules = [];
            let examTypes = [];
            try { schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]'); } catch (e) { }
            try { examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]'); } catch (e) { }

            const targetClass = (className || currentFilterClass || 'Ten').toString().trim();
            const targetExam = (examName || currentFilterExam || 'all').toString().trim();
            const isSeniorClass = ['ten', 'nine', '10', '9', '১০ম', '৯ম'].some(k => targetClass.toLowerCase().includes(k));

            // Standard baseline distributions
            const baselines = {
                bangla1: { cq: 70, mcq: 30, practical: 0 },
                bangla2: { cq: 70, mcq: 30, practical: 0 },
                english1: { cq: 100, mcq: 0, practical: 0 },
                english2: { cq: 100, mcq: 0, practical: 0 },
                math: { cq: 70, mcq: 30, practical: 0 },
                bgs: { cq: 70, mcq: 30, practical: 0 },
                chem: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 70, mcq: 30, practical: 0 },
                phys: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 0, mcq: 0, practical: 0 },
                bio: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 0, mcq: 0, practical: 0 },
                rel: { cq: 70, mcq: 30, practical: 0 },
                ict: { cq: 35, mcq: 15, practical: 0 },
                agri: isSeniorClass ? { cq: 50, mcq: 25, practical: 25 } : { cq: 70, mcq: 30, practical: 0 }
            };

            const defaultDist = baselines[slotKey] || { cq: 70, mcq: 30, practical: 0 };

            // Find matching schedule for this slot in (targetExam, targetClass)
            let matchedSchedule = null;
            if (Array.isArray(schedules) && schedules.length > 0) {
                matchedSchedule = schedules.find(s => {
                    if (!s) return false;
                    if (targetExam !== 'all' && !isExamMatch(s.term || s.examName, targetExam)) return false;
                    if (targetClass !== 'all') {
                        const sClass = (s.class || s.className || '').toString().toLowerCase().trim();
                        const tClass = targetClass.toLowerCase();
                        const sNorm = ['10', 'ten', '১০ম'].some(k => sClass.includes(k)) ? '10' :
                                      ['9', 'nine', '৯ম'].some(k => sClass.includes(k)) ? '9' :
                                      ['8', 'eight', '৮ম'].some(k => sClass.includes(k)) ? '8' :
                                      ['7', 'seven', '৭ম'].some(k => sClass.includes(k)) ? '7' :
                                      ['6', 'six', '৬ষ্ঠ'].some(k => sClass.includes(k)) ? '6' : sClass;
                        const tNorm = ['10', 'ten', '১০ম'].some(k => tClass.includes(k)) ? '10' :
                                      ['9', 'nine', '৯ম'].some(k => tClass.includes(k)) ? '9' :
                                      ['8', 'eight', '৮ম'].some(k => tClass.includes(k)) ? '8' :
                                      ['7', 'seven', '৭ম'].some(k => tClass.includes(k)) ? '7' :
                                      ['6', 'six', '৬ষ্ঠ'].some(k => tClass.includes(k)) ? '6' : tClass;
                        if (sNorm !== tNorm) return false;
                    }
                    return getSubjectSlot(s.subject || s.subjectName, s.code || s.subjectCode) === slotKey;
                });
            }

            if (matchedSchedule) {
                // Find corresponding exam type config in school_exam_types
                const sTerm = matchedSchedule.term || matchedSchedule.examName || targetExam;
                const examDef = Array.isArray(examTypes) ? examTypes.find(et => isExamMatch(et.name, sTerm)) : null;

                if (examDef) {
                    const subTypes = Array.isArray(examDef.examTypes) ? examDef.examTypes : [];
                    const matchedSubType = subTypes.find(st => st.typeName && matchedSchedule.examType && st.typeName.trim().toLowerCase() === matchedSchedule.examType.trim().toLowerCase())
                                        || subTypes.find(st => st.typeName && examDef.type && st.typeName.trim().toLowerCase() === examDef.type.trim().toLowerCase())
                                        || subTypes[0]
                                        || examDef;

                    const overrides = matchedSubType.overrides || examDef.overrides || [];
                    const subNameClean = (matchedSchedule.subject || matchedSchedule.subjectName || '').trim().toLowerCase();
                    const subCodeClean = (matchedSchedule.code || matchedSchedule.subjectCode || '').toString().trim();

                    let override = null;
                    if (subCodeClean) {
                        override = overrides.find(o => String(o.subjectCode).trim() === subCodeClean);
                    }
                    if (!override && subNameClean) {
                        override = overrides.find(o => o.subjectName && (o.subjectName.trim().toLowerCase() === subNameClean || subNameClean.includes(o.subjectName.trim().toLowerCase())));
                    }

                    if (override) {
                        const cq = override.cq !== undefined ? Number(override.cq) : defaultDist.cq;
                        const mcq = override.mcq !== undefined ? Number(override.mcq) : defaultDist.mcq;
                        const practical = override.practical !== undefined ? Number(override.practical) : defaultDist.practical;
                        return { cq, mcq, practical, total: cq + mcq + practical, hasSchedule: true, scheduleSubject: matchedSchedule.subject, examType: matchedSchedule.examType };
                    }

                    const cq = matchedSubType.defaultCQ !== undefined ? Number(matchedSubType.defaultCQ) : defaultDist.cq;
                    const mcq = matchedSubType.defaultMCQ !== undefined ? Number(matchedSubType.defaultMCQ) : defaultDist.mcq;
                    const practical = matchedSubType.defaultPractical !== undefined ? Number(matchedSubType.defaultPractical) : defaultDist.practical;
                    return { cq, mcq, practical, total: cq + mcq + practical, hasSchedule: true, scheduleSubject: matchedSchedule.subject, examType: matchedSchedule.examType };
                }
            }

            return { ...defaultDist, total: defaultDist.cq + defaultDist.mcq + defaultDist.practical, hasSchedule: false };
        }

        // Dynamically updates component headers (MCQ / CQ / Prac / Total) and Row 5 Full Marks from Exam List
        function updateDynamicSubjectMarksAndHeaders() {
            const cls = currentFilterClass || 'Ten';
            const exam = currentFilterExam || 'all';
            const lang = (currentLang === 'en') ? 'en' : 'bn';

            const slots = ['bangla1', 'bangla2', 'english1', 'english2', 'math', 'bgs', 'chem', 'phys', 'bio', 'rel', 'ict', 'agri'];
            const distMap = {};
            slots.forEach(k => {
                distMap[k] = getSubjectMarksDistribution(k, cls, exam);
            });

            // 1. Update component headers (MCQ / বহুনির্বাচনি, Written / লিখিত, Prac / ব্যবহারিক, Total / মোট)
            const componentLabels = {
                bn: {
                    mcq: 'বহুনির্বাচনি',
                    written: 'লিখিত',
                    practical: 'ব্যবহারিক',
                    total: 'মোট',
                    grand_total: 'সর্বমোট'
                },
                en: {
                    mcq: 'MCQ',
                    written: 'Written',
                    practical: 'Prac',
                    total: 'Total',
                    grand_total: 'Total'
                }
            };

            document.querySelectorAll('thead th[data-col-type]').forEach(th => {
                const type = th.getAttribute('data-col-type');
                if (type && componentLabels[lang] && componentLabels[lang][type]) {
                    th.textContent = componentLabels[lang][type];
                }
            });

            // 2. Update Row 5 (Full Marks Row)
            document.querySelectorAll('thead th[data-fullmark]').forEach(th => {
                const subj = th.getAttribute('data-subj');
                const ftype = th.getAttribute('data-fullmark');
                if (!subj || !ftype) return;

                let markVal = 0;
                if (ftype === 'grand_total') {
                    if (subj === 'bangla') {
                        markVal = (distMap.bangla1?.total || 100) + (distMap.bangla2?.total || 100);
                    } else if (subj === 'english') {
                        markVal = (distMap.english1?.total || 100) + (distMap.english2?.total || 100);
                    }
                } else if (distMap[subj]) {
                    if (ftype === 'mcq') markVal = distMap[subj].mcq;
                    else if (ftype === 'written') markVal = distMap[subj].cq;
                    else if (ftype === 'practical') markVal = distMap[subj].practical;
                    else if (ftype === 'total') markVal = distMap[subj].total;
                }

                th.textContent = translateDigits(String(markVal), lang);
            });
        }

        function getSubjectPracticalStatus() {
            const cls = currentFilterClass || 'Ten';
            const exam = currentFilterExam || 'all';

            const dChem = getSubjectMarksDistribution('chem', cls, exam);
            const dPhys = getSubjectMarksDistribution('phys', cls, exam);
            const dBio = getSubjectMarksDistribution('bio', cls, exam);
            const dAgri = getSubjectMarksDistribution('agri', cls, exam);

            return {
                chem: dChem.practical > 0,
                phys: dPhys.practical > 0,
                bio: dBio.practical > 0,
                agri: dAgri.practical > 0
            };
        }"""

assert old_practical_status_block in content, "Error: old_practical_status_block not found in Tabulation Sheet.html"
content = content.replace(old_practical_status_block, new_practical_status_block)
print("Part B applied: getSubjectMarksDistribution, updateDynamicSubjectMarksAndHeaders & getSubjectPracticalStatus updated.")

# -------------------------------------------------------------------------------------
# PART C: Update applyTableSettings() to invoke updateDynamicSubjectMarksAndHeaders()
# -------------------------------------------------------------------------------------

old_apply_marks_chunk = """            // Adjust Row 4 full marks for subjects without practical
            try {
                const schedules = JSON.parse(localStorage.getItem('school_exam_schedules') || '[]');
                const examTypes = JSON.parse(localStorage.getItem('school_exam_types') || '[]');
                const activeExam = (currentFilterExam || 'all').trim().toLowerCase();
                
                ['chem', 'phys', 'bio', 'agri'].forEach(k => {
                    if (!pracStatus[k]) {
                        let cqMark = 70;
                        let mcqMark = 30;
                        const sch = schedules.find(s => {
                            if (!s) return false;
                            if (activeExam !== 'all' && (s.term || '').trim().toLowerCase() !== activeExam) return false;
                            return getSubjectSlot(s.subject, '') === k;
                        });
                        if (sch && sch.term) {
                            const examDef = examTypes.find(et => (et.name || '').trim().toLowerCase() === (sch.term || '').trim().toLowerCase());
                            if (examDef) {
                                const subTypes = examDef.examTypes || [];
                                const st = subTypes.find(t => (t.typeName || '').trim().toLowerCase() === (sch.examType || '').trim().toLowerCase()) || subTypes[0];
                                if (st) {
                                    if (st.defaultCQ !== undefined) cqMark = st.defaultCQ;
                                    if (st.defaultMCQ !== undefined) mcqMark = st.defaultMCQ;
                                }
                            }
                        }
                        const mcqTh = document.querySelector(`thead th[data-fullmark="mcq"][data-subj="${k}"]`);
                        if (mcqTh) mcqTh.textContent = translateDigits(mcqMark.toString(), currentLang);
                        const wriTh = document.querySelector(`thead th[data-fullmark="written"][data-subj="${k}"]`);
                        if (wriTh) wriTh.textContent = translateDigits(cqMark.toString(), currentLang);
                    } else {
                        const mcqTh = document.querySelector(`thead th[data-fullmark="mcq"][data-subj="${k}"]`);
                        if (mcqTh) mcqTh.textContent = translateDigits('25', currentLang);
                        const wriTh = document.querySelector(`thead th[data-fullmark="written"][data-subj="${k}"]`);
                        if (wriTh) wriTh.textContent = translateDigits('50', currentLang);
                    }
                });
            } catch (e) {}"""

new_apply_marks_chunk = """            // Update Row 4 Full Marks and Component Headers dynamically from Exam List
            updateDynamicSubjectMarksAndHeaders();"""

assert old_apply_marks_chunk in content, "Error: old_apply_marks_chunk not found in Tabulation Sheet.html"
content = content.replace(old_apply_marks_chunk, new_apply_marks_chunk)
print("Part C applied: applyTableSettings updated with updateDynamicSubjectMarksAndHeaders().")

# -------------------------------------------------------------------------------------
# PART D: Update recalculateTableGradesAndRanks() to evaluate marks against dynamic totals
# -------------------------------------------------------------------------------------

old_recalc_start = """                // 1. Bangla
                // Sub-paper 1: MCQ (cell 2), Written (cell 3), Total (cell 4)
                const b1MCQ = getCellFloat(2);
                const b1Wri = getCellFloat(3);
                let b1Total = getCellFloat(4);
                if (isNaN(b1Total) && (!isNaN(b1MCQ) || !isNaN(b1Wri))) {
                    b1Total = (isNaN(b1MCQ) ? 0 : b1MCQ) + (isNaN(b1Wri) ? 0 : b1Wri);
                    setCellVal(4, b1Total);
                }

                // Sub-paper 2: MCQ (cell 5), Written (cell 6), Total (cell 7)
                const b2MCQ = getCellFloat(5);
                const b2Wri = getCellFloat(6);
                let b2Total = getCellFloat(7);
                if (isNaN(b2Total) && (!isNaN(b2MCQ) || !isNaN(b2Wri))) {
                    b2Total = (isNaN(b2MCQ) ? 0 : b2MCQ) + (isNaN(b2Wri) ? 0 : b2Wri);
                    setCellVal(7, b2Total);
                }

                // Bangla Grand Total (cell 8) & Avg (cell 9)
                let bGrandTotal = getCellFloat(8);
                if (isNaN(bGrandTotal) && (!isNaN(b1Total) || !isNaN(b2Total))) {
                    bGrandTotal = (isNaN(b1Total) ? 0 : b1Total) + (isNaN(b2Total) ? 0 : b2Total);
                    setCellVal(8, bGrandTotal);
                }
                let banglaAvg = getCellFloat(9);
                if (!isNaN(bGrandTotal)) {
                    banglaAvg = (!isNaN(b1Total) && !isNaN(b2Total)) ? (bGrandTotal / 2) : bGrandTotal;
                    setCellVal(9, banglaAvg);
                }

                const bAbsent = (cells[2]?.textContent.trim().toUpperCase() === 'A' || cells[3]?.textContent.trim().toUpperCase() === 'A' || cells[5]?.textContent.trim().toUpperCase() === 'A' || cells[6]?.textContent.trim().toUpperCase() === 'A');
                const banglaInfo = bAbsent ? { name: 'F', gp: 0 } : (!isNaN(banglaAvg) ? getGradeForPercentage(banglaAvg) : { name: '-', gp: 0 });
                if (!isNaN(banglaAvg) || bAbsent) {
                    cells[10].textContent = banglaInfo.name;
                    cells[11].textContent = translateDigits(banglaInfo.gp.toFixed(2), currentLang);
                }

                // 2. English
                // 1st Paper (cell 12), 2nd Paper (cell 13), Grand Total (cell 14), Avg (cell 15)
                const eng1 = getCellFloat(12);
                const eng2 = getCellFloat(13);
                let engGrandTotal = getCellFloat(14);
                if (isNaN(engGrandTotal) && (!isNaN(eng1) || !isNaN(eng2))) {
                    engGrandTotal = (isNaN(eng1) ? 0 : eng1) + (isNaN(eng2) ? 0 : eng2);
                    setCellVal(14, engGrandTotal);
                }
                let engAvg = getCellFloat(15);
                if (!isNaN(engGrandTotal)) {
                    engAvg = (!isNaN(eng1) && !isNaN(eng2)) ? (engGrandTotal / 2) : engGrandTotal;
                    setCellVal(15, engAvg);
                }

                const engAbsent = (cells[12]?.textContent.trim().toUpperCase() === 'A' || cells[13]?.textContent.trim().toUpperCase() === 'A');
                const engInfo = engAbsent ? { name: 'F', gp: 0 } : (!isNaN(engAvg) ? getGradeForPercentage(engAvg) : { name: '-', gp: 0 });
                if (!isNaN(engAvg) || engAbsent) {
                    cells[16].textContent = engInfo.name;
                    cells[17].textContent = translateDigits(engInfo.gp.toFixed(2), currentLang);
                }

                // 3. Math (MCQ cell 18, Written cell 19, Total cell 20)
                const mathMCQ = getCellFloat(18);
                const mathWri = getCellFloat(19);
                let mathTotal = getCellFloat(20);
                if (isNaN(mathTotal) && (!isNaN(mathMCQ) || !isNaN(mathWri))) {
                    mathTotal = (isNaN(mathMCQ) ? 0 : mathMCQ) + (isNaN(mathWri) ? 0 : mathWri);
                    setCellVal(20, mathTotal);
                }
                const mathAbsent = (cells[18]?.textContent.trim().toUpperCase() === 'A' || cells[19]?.textContent.trim().toUpperCase() === 'A');
                const mathInfo = mathAbsent ? { name: 'F', gp: 0 } : (!isNaN(mathTotal) ? getGradeForPercentage(mathTotal) : { name: '-', gp: 0 });
                if (!isNaN(mathTotal) || mathAbsent) {
                    cells[21].textContent = mathInfo.name;
                    cells[22].textContent = translateDigits(mathInfo.gp.toFixed(2), currentLang);
                }

                // 4. BGS (MCQ cell 23, Written cell 24, Total cell 25)
                const bgsMCQ = getCellFloat(23);
                const bgsWri = getCellFloat(24);
                let bgsTotal = getCellFloat(25);
                if (isNaN(bgsTotal) && (!isNaN(bgsMCQ) || !isNaN(bgsWri))) {
                    bgsTotal = (isNaN(bgsMCQ) ? 0 : bgsMCQ) + (isNaN(bgsWri) ? 0 : bgsWri);
                    setCellVal(25, bgsTotal);
                }
                const bgsAbsent = (cells[23]?.textContent.trim().toUpperCase() === 'A' || cells[24]?.textContent.trim().toUpperCase() === 'A');
                const bgsInfo = bgsAbsent ? { name: 'F', gp: 0 } : (!isNaN(bgsTotal) ? getGradeForPercentage(bgsTotal) : { name: '-', gp: 0 });
                if (!isNaN(bgsTotal) || bgsAbsent) {
                    cells[26].textContent = bgsInfo.name;
                    cells[27].textContent = translateDigits(bgsInfo.gp.toFixed(2), currentLang);
                }

                const pracStatus = (typeof getSubjectPracticalStatus === 'function') 
                    ? getSubjectPracticalStatus() 
                    : { chem: false, phys: false, bio: false, agri: false };

                // 5. Chemistry / Science (MCQ cell 28, Written cell 29, Practical cell 30, Total cell 31)
                const chemMCQ = getCellFloat(28);
                const chemWri = getCellFloat(29);
                const chemPrac = pracStatus.chem ? getCellFloat(30) : 0;
                let chemTotal = getCellFloat(31);
                if (isNaN(chemTotal) && (!isNaN(chemMCQ) || !isNaN(chemWri) || (pracStatus.chem && !isNaN(chemPrac)))) {
                    chemTotal = (isNaN(chemMCQ) ? 0 : chemMCQ) + (isNaN(chemWri) ? 0 : chemWri) + (pracStatus.chem && !isNaN(chemPrac) ? chemPrac : 0);
                    setCellVal(31, chemTotal);
                }
                const chemAbsent = (cells[28]?.textContent.trim().toUpperCase() === 'A' || cells[29]?.textContent.trim().toUpperCase() === 'A' || (pracStatus.chem && cells[30]?.textContent.trim().toUpperCase() === 'A'));
                const chemInfo = chemAbsent ? { name: 'F', gp: 0 } : (!isNaN(chemTotal) ? getGradeForPercentage(chemTotal) : { name: '-', gp: 0 });
                if (!isNaN(chemTotal) || chemAbsent) {
                    cells[32].textContent = chemInfo.name;
                    cells[33].textContent = translateDigits(chemInfo.gp.toFixed(2), currentLang);
                }

                // 6. Physics (MCQ cell 34, Written cell 35, Practical cell 36, Total cell 37)
                const physMCQ = getCellFloat(34);
                const physWri = getCellFloat(35);
                const physPrac = pracStatus.phys ? getCellFloat(36) : 0;
                let physTotal = getCellFloat(37);
                if (isNaN(physTotal) && (!isNaN(physMCQ) || !isNaN(physWri) || (pracStatus.phys && !isNaN(physPrac)))) {
                    physTotal = (isNaN(physMCQ) ? 0 : physMCQ) + (isNaN(physWri) ? 0 : physWri) + (pracStatus.phys && !isNaN(physPrac) ? physPrac : 0);
                    setCellVal(37, physTotal);
                }
                const physAbsent = (cells[34]?.textContent.trim().toUpperCase() === 'A' || cells[35]?.textContent.trim().toUpperCase() === 'A' || (pracStatus.phys && cells[36]?.textContent.trim().toUpperCase() === 'A'));
                const physInfo = physAbsent ? { name: 'F', gp: 0 } : (!isNaN(physTotal) ? getGradeForPercentage(physTotal) : { name: '-', gp: 0 });
                if (!isNaN(physTotal) || physAbsent) {
                    cells[38].textContent = physInfo.name;
                    cells[39].textContent = translateDigits(physInfo.gp.toFixed(2), currentLang);
                }

                // 7. Biology (MCQ cell 40, Written cell 41, Practical cell 42, Total cell 43)
                const bioMCQ = getCellFloat(40);
                const bioWri = getCellFloat(41);
                const bioPrac = pracStatus.bio ? getCellFloat(42) : 0;
                let bioTotal = getCellFloat(43);
                if (isNaN(bioTotal) && (!isNaN(bioMCQ) || !isNaN(bioWri) || (pracStatus.bio && !isNaN(bioPrac)))) {
                    bioTotal = (isNaN(bioMCQ) ? 0 : bioMCQ) + (isNaN(bioWri) ? 0 : bioWri) + (pracStatus.bio && !isNaN(bioPrac) ? bioPrac : 0);
                    setCellVal(43, bioTotal);
                }
                const bioAbsent = (cells[40]?.textContent.trim().toUpperCase() === 'A' || cells[41]?.textContent.trim().toUpperCase() === 'A' || (pracStatus.bio && cells[42]?.textContent.trim().toUpperCase() === 'A'));
                const bioInfo = bioAbsent ? { name: 'F', gp: 0 } : (!isNaN(bioTotal) ? getGradeForPercentage(bioTotal) : { name: '-', gp: 0 });
                if (!isNaN(bioTotal) || bioAbsent) {
                    cells[44].textContent = bioInfo.name;
                    cells[45].textContent = translateDigits(bioInfo.gp.toFixed(2), currentLang);
                }

                // 8. Religion (MCQ cell 46, Written cell 47, Total cell 48)
                const relMCQ = getCellFloat(46);
                const relWri = getCellFloat(47);
                let relTotal = getCellFloat(48);
                if (isNaN(relTotal) && (!isNaN(relMCQ) || !isNaN(relWri))) {
                    relTotal = (isNaN(relMCQ) ? 0 : relMCQ) + (isNaN(relWri) ? 0 : relWri);
                    setCellVal(48, relTotal);
                }
                const relAbsent = (cells[46]?.textContent.trim().toUpperCase() === 'A' || cells[47]?.textContent.trim().toUpperCase() === 'A');
                const relInfo = relAbsent ? { name: 'F', gp: 0 } : (!isNaN(relTotal) ? getGradeForPercentage(relTotal) : { name: '-', gp: 0 });
                if (!isNaN(relTotal) || relAbsent) {
                    cells[49].textContent = relInfo.name;
                    cells[50].textContent = translateDigits(relInfo.gp.toFixed(2), currentLang);
                }

                // 9. ICT (MCQ cell 51, Written cell 52, Total cell 53, out of 50 -> % = (total/50)*100)
                const ictMCQ = getCellFloat(51);
                const ictWri = getCellFloat(52);
                let ictTotal = getCellFloat(53);
                if (isNaN(ictTotal) && (!isNaN(ictMCQ) || !isNaN(ictWri))) {
                    ictTotal = (isNaN(ictMCQ) ? 0 : ictMCQ) + (isNaN(ictWri) ? 0 : ictWri);
                    setCellVal(53, ictTotal);
                }
                const ictAbsent = (cells[51]?.textContent.trim().toUpperCase() === 'A' || cells[52]?.textContent.trim().toUpperCase() === 'A');
                const ictPct = !isNaN(ictTotal) ? (ictTotal / 50) * 100 : NaN;
                const ictInfo = ictAbsent ? { name: 'F', gp: 0 } : (!isNaN(ictPct) ? getGradeForPercentage(ictPct) : { name: '-', gp: 0 });
                if (!isNaN(ictPct) || ictAbsent) {
                    cells[54].textContent = ictInfo.name;
                    cells[55].textContent = translateDigits(ictInfo.gp.toFixed(2), currentLang);
                }

                // 10. Agriculture / Higher Math (Optional Subject, Cell 59 = Total 100)
                const optMCQ = getCellFloat(56);
                const optWri = getCellFloat(57);
                const optPrac = pracStatus.agri ? getCellFloat(58) : 0;
                let optTotal = getCellFloat(59);
                if (isNaN(optTotal) && (!isNaN(optMCQ) || !isNaN(optWri) || (pracStatus.agri && !isNaN(optPrac)))) {
                    optTotal = (isNaN(optMCQ) ? 0 : optMCQ) + (isNaN(optWri) ? 0 : optWri) + (pracStatus.agri && !isNaN(optPrac) ? optPrac : 0);
                    setCellVal(59, optTotal);
                }
                const optAbsent = (cells[56]?.textContent.trim().toUpperCase() === 'A' || cells[57]?.textContent.trim().toUpperCase() === 'A' || (pracStatus.agri && cells[58]?.textContent.trim().toUpperCase() === 'A'));
                const optInfo = optAbsent ? { name: 'F', gp: 0 } : (!isNaN(optTotal) ? getGradeForPercentage(optTotal) : { name: '-', gp: 0 });
                if (!isNaN(optTotal) || optAbsent) {
                    cells[60].textContent = optInfo.name;
                    cells[61].textContent = translateDigits(optInfo.gp.toFixed(2), currentLang);
                }"""

new_recalc_start = """                const curClass = currentFilterClass || 'Ten';
                const curExam = currentFilterExam || 'all';

                // Subject marks distributions dynamically retrieved from Exam List
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

                const pracStatus = (typeof getSubjectPracticalStatus === 'function') 
                    ? getSubjectPracticalStatus() 
                    : { chem: distChem.practical > 0, phys: distPhys.practical > 0, bio: distBio.practical > 0, agri: distAgri.practical > 0 };

                // 1. Bangla
                // Sub-paper 1: MCQ (cell 2), Written (cell 3), Total (cell 4)
                const b1MCQ = getCellFloat(2);
                const b1Wri = getCellFloat(3);
                let b1Total = getCellFloat(4);
                if (isNaN(b1Total) && (!isNaN(b1MCQ) || !isNaN(b1Wri))) {
                    b1Total = (isNaN(b1MCQ) ? 0 : b1MCQ) + (isNaN(b1Wri) ? 0 : b1Wri);
                    setCellVal(4, b1Total);
                }

                // Sub-paper 2: MCQ (cell 5), Written (cell 6), Total (cell 7)
                const b2MCQ = getCellFloat(5);
                const b2Wri = getCellFloat(6);
                let b2Total = getCellFloat(7);
                if (isNaN(b2Total) && (!isNaN(b2MCQ) || !isNaN(b2Wri))) {
                    b2Total = (isNaN(b2MCQ) ? 0 : b2MCQ) + (isNaN(b2Wri) ? 0 : b2Wri);
                    setCellVal(7, b2Total);
                }

                // Bangla Grand Total (cell 8) & Avg / Percentage (cell 9)
                let bGrandTotal = getCellFloat(8);
                if (isNaN(bGrandTotal) && (!isNaN(b1Total) || !isNaN(b2Total))) {
                    bGrandTotal = (isNaN(b1Total) ? 0 : b1Total) + (isNaN(b2Total) ? 0 : b2Total);
                    setCellVal(8, bGrandTotal);
                }

                const bFullMarksTotal = (distB1.total || 100) + (distB2.total || 100);
                let banglaAvg = getCellFloat(9);
                if (!isNaN(bGrandTotal)) {
                    banglaAvg = (bFullMarksTotal > 0) ? (bGrandTotal / bFullMarksTotal) * 100 : bGrandTotal;
                    setCellVal(9, banglaAvg);
                }

                const bAbsent = (cells[2]?.textContent.trim().toUpperCase() === 'A' || cells[3]?.textContent.trim().toUpperCase() === 'A' || cells[5]?.textContent.trim().toUpperCase() === 'A' || cells[6]?.textContent.trim().toUpperCase() === 'A');
                const banglaInfo = bAbsent ? { name: 'F', gp: 0 } : (!isNaN(banglaAvg) ? getGradeForPercentage(banglaAvg) : { name: '-', gp: 0 });
                if (!isNaN(banglaAvg) || bAbsent) {
                    cells[10].textContent = banglaInfo.name;
                    cells[11].textContent = translateDigits(banglaInfo.gp.toFixed(2), currentLang);
                }

                // 2. English
                // 1st Paper (cell 12), 2nd Paper (cell 13), Grand Total (cell 14), Avg / Percentage (cell 15)
                const eng1 = getCellFloat(12);
                const eng2 = getCellFloat(13);
                let engGrandTotal = getCellFloat(14);
                if (isNaN(engGrandTotal) && (!isNaN(eng1) || !isNaN(eng2))) {
                    engGrandTotal = (isNaN(eng1) ? 0 : eng1) + (isNaN(eng2) ? 0 : eng2);
                    setCellVal(14, engGrandTotal);
                }

                const engFullMarksTotal = (distEng1.total || 100) + (distEng2.total || 100);
                let engAvg = getCellFloat(15);
                if (!isNaN(engGrandTotal)) {
                    engAvg = (engFullMarksTotal > 0) ? (engGrandTotal / engFullMarksTotal) * 100 : engGrandTotal;
                    setCellVal(15, engAvg);
                }

                const engAbsent = (cells[12]?.textContent.trim().toUpperCase() === 'A' || cells[13]?.textContent.trim().toUpperCase() === 'A');
                const engInfo = engAbsent ? { name: 'F', gp: 0 } : (!isNaN(engAvg) ? getGradeForPercentage(engAvg) : { name: '-', gp: 0 });
                if (!isNaN(engAvg) || engAbsent) {
                    cells[16].textContent = engInfo.name;
                    cells[17].textContent = translateDigits(engInfo.gp.toFixed(2), currentLang);
                }

                // 3. Math (MCQ cell 18, Written cell 19, Total cell 20)
                const mathMCQ = getCellFloat(18);
                const mathWri = getCellFloat(19);
                let mathTotal = getCellFloat(20);
                if (isNaN(mathTotal) && (!isNaN(mathMCQ) || !isNaN(mathWri))) {
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
                }

                // 4. BGS (MCQ cell 23, Written cell 24, Total cell 25)
                const bgsMCQ = getCellFloat(23);
                const bgsWri = getCellFloat(24);
                let bgsTotal = getCellFloat(25);
                if (isNaN(bgsTotal) && (!isNaN(bgsMCQ) || !isNaN(bgsWri))) {
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
                }

                // 5. Chemistry / Science (MCQ cell 28, Written cell 29, Practical cell 30, Total cell 31)
                const chemMCQ = getCellFloat(28);
                const chemWri = getCellFloat(29);
                const chemPrac = pracStatus.chem ? getCellFloat(30) : 0;
                let chemTotal = getCellFloat(31);
                if (isNaN(chemTotal) && (!isNaN(chemMCQ) || !isNaN(chemWri) || (pracStatus.chem && !isNaN(chemPrac)))) {
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
                }

                // 6. Physics (MCQ cell 34, Written cell 35, Practical cell 36, Total cell 37)
                const physMCQ = getCellFloat(34);
                const physWri = getCellFloat(35);
                const physPrac = pracStatus.phys ? getCellFloat(36) : 0;
                let physTotal = getCellFloat(37);
                if (isNaN(physTotal) && (!isNaN(physMCQ) || !isNaN(physWri) || (pracStatus.phys && !isNaN(physPrac)))) {
                    physTotal = (isNaN(physMCQ) ? 0 : physMCQ) + (isNaN(physWri) ? 0 : physWri) + (pracStatus.phys && !isNaN(physPrac) ? physPrac : 0);
                    setCellVal(37, physTotal);
                }
                const physFull = distPhys.total || 100;
                const physPct = !isNaN(physTotal) ? (physTotal / physFull) * 100 : NaN;
                const physAbsent = (cells[34]?.textContent.trim().toUpperCase() === 'A' || cells[35]?.textContent.trim().toUpperCase() === 'A' || (pracStatus.phys && cells[36]?.textContent.trim().toUpperCase() === 'A'));
                const physInfo = physAbsent ? { name: 'F', gp: 0 } : (!isNaN(physPct) ? getGradeForPercentage(physPct) : { name: '-', gp: 0 });
                if (!isNaN(physPct) || physAbsent) {
                    cells[38].textContent = physInfo.name;
                    cells[39].textContent = translateDigits(physInfo.gp.toFixed(2), currentLang);
                }

                // 7. Biology (MCQ cell 40, Written cell 41, Practical cell 42, Total cell 43)
                const bioMCQ = getCellFloat(40);
                const bioWri = getCellFloat(41);
                const bioPrac = pracStatus.bio ? getCellFloat(42) : 0;
                let bioTotal = getCellFloat(43);
                if (isNaN(bioTotal) && (!isNaN(bioMCQ) || !isNaN(bioWri) || (pracStatus.bio && !isNaN(bioPrac)))) {
                    bioTotal = (isNaN(bioMCQ) ? 0 : bioMCQ) + (isNaN(bioWri) ? 0 : bioWri) + (pracStatus.bio && !isNaN(bioPrac) ? bioPrac : 0);
                    setCellVal(43, bioTotal);
                }
                const bioFull = distBio.total || 100;
                const bioPct = !isNaN(bioTotal) ? (bioTotal / bioFull) * 100 : NaN;
                const bioAbsent = (cells[40]?.textContent.trim().toUpperCase() === 'A' || cells[41]?.textContent.trim().toUpperCase() === 'A' || (pracStatus.bio && cells[42]?.textContent.trim().toUpperCase() === 'A'));
                const bioInfo = bioAbsent ? { name: 'F', gp: 0 } : (!isNaN(bioPct) ? getGradeForPercentage(bioPct) : { name: '-', gp: 0 });
                if (!isNaN(bioPct) || bioAbsent) {
                    cells[44].textContent = bioInfo.name;
                    cells[45].textContent = translateDigits(bioInfo.gp.toFixed(2), currentLang);
                }

                // 8. Religion (MCQ cell 46, Written cell 47, Total cell 48)
                const relMCQ = getCellFloat(46);
                const relWri = getCellFloat(47);
                let relTotal = getCellFloat(48);
                if (isNaN(relTotal) && (!isNaN(relMCQ) || !isNaN(relWri))) {
                    relTotal = (isNaN(relMCQ) ? 0 : relMCQ) + (isNaN(relWri) ? 0 : relWri);
                    setCellVal(48, relTotal);
                }
                const relFull = distRel.total || 100;
                const relPct = !isNaN(relTotal) ? (relTotal / relFull) * 100 : NaN;
                const relAbsent = (cells[46]?.textContent.trim().toUpperCase() === 'A' || cells[47]?.textContent.trim().toUpperCase() === 'A');
                const relInfo = relAbsent ? { name: 'F', gp: 0 } : (!isNaN(relPct) ? getGradeForPercentage(relPct) : { name: '-', gp: 0 });
                if (!isNaN(relPct) || relAbsent) {
                    cells[49].textContent = relInfo.name;
                    cells[50].textContent = translateDigits(relInfo.gp.toFixed(2), currentLang);
                }

                // 9. ICT (MCQ cell 51, Written cell 52, Total cell 53)
                const ictMCQ = getCellFloat(51);
                const ictWri = getCellFloat(52);
                let ictTotal = getCellFloat(53);
                if (isNaN(ictTotal) && (!isNaN(ictMCQ) || !isNaN(ictWri))) {
                    ictTotal = (isNaN(ictMCQ) ? 0 : ictMCQ) + (isNaN(ictWri) ? 0 : ictWri);
                    setCellVal(53, ictTotal);
                }
                const ictFull = distIct.total || 50;
                const ictPct = !isNaN(ictTotal) ? (ictTotal / ictFull) * 100 : NaN;
                const ictAbsent = (cells[51]?.textContent.trim().toUpperCase() === 'A' || cells[52]?.textContent.trim().toUpperCase() === 'A');
                const ictInfo = ictAbsent ? { name: 'F', gp: 0 } : (!isNaN(ictPct) ? getGradeForPercentage(ictPct) : { name: '-', gp: 0 });
                if (!isNaN(ictPct) || ictAbsent) {
                    cells[54].textContent = ictInfo.name;
                    cells[55].textContent = translateDigits(ictInfo.gp.toFixed(2), currentLang);
                }

                // 10. Agriculture / Higher Math (Optional Subject)
                const optMCQ = getCellFloat(56);
                const optWri = getCellFloat(57);
                const optPrac = pracStatus.agri ? getCellFloat(58) : 0;
                let optTotal = getCellFloat(59);
                if (isNaN(optTotal) && (!isNaN(optMCQ) || !isNaN(optWri) || (pracStatus.agri && !isNaN(optPrac)))) {
                    optTotal = (isNaN(optMCQ) ? 0 : optMCQ) + (isNaN(optWri) ? 0 : optWri) + (pracStatus.agri && !isNaN(optPrac) ? optPrac : 0);
                    setCellVal(59, optTotal);
                }
                const optFull = distAgri.total || 100;
                const optPct = !isNaN(optTotal) ? (optTotal / optFull) * 100 : NaN;
                const optAbsent = (cells[56]?.textContent.trim().toUpperCase() === 'A' || cells[57]?.textContent.trim().toUpperCase() === 'A' || (pracStatus.agri && cells[58]?.textContent.trim().toUpperCase() === 'A'));
                const optInfo = optAbsent ? { name: 'F', gp: 0 } : (!isNaN(optPct) ? getGradeForPercentage(optPct) : { name: '-', gp: 0 });
                if (!isNaN(optPct) || optAbsent) {
                    cells[60].textContent = optInfo.name;
                    cells[61].textContent = translateDigits(optInfo.gp.toFixed(2), currentLang);
                }"""

assert old_recalc_start in content, "Error: old_recalc_start not found in Tabulation Sheet.html"
content = content.replace(old_recalc_start, new_recalc_start)
print("Part D applied: recalculateTableGradesAndRanks dynamic percentages updated.")

# Also update the optional base deduct marks logic:
old_opt_deduct = """                // Find minimum percentage for GP 2.00 (defaults to 40) from active scale
                const ruleFor2GP = rules.find(r => parseFloat(r.gp) === 2.00) || { min: 40 };
                const optBaseDeductMarks = parseFloat(ruleFor2GP.min) || 40;

                // Optional bonus: extra GP above 2.00 and extra marks above 2.00 threshold (40 marks)
                const optionalBonusGP = (!isNaN(optTotal) && optInfo.name !== '-' && optInfo.gp > 2.00) ? (optInfo.gp - 2.00) : 0;
                const optionalBonusMarks = (!isNaN(optTotal) && optTotal > optBaseDeductMarks) ? (optTotal - optBaseDeductMarks) : 0;"""

new_opt_deduct = """                // Find minimum percentage for GP 2.00 (defaults to 40) from active scale
                const ruleFor2GP = rules.find(r => parseFloat(r.gp) === 2.00) || { min: 40 };
                const optBaseDeductPct = parseFloat(ruleFor2GP.min) || 40;
                const optBaseDeductMarks = (optBaseDeductPct / 100) * optFull;

                // Optional bonus: extra GP above 2.00 and extra marks above 2.00 threshold
                const optionalBonusGP = (!isNaN(optTotal) && optInfo.name !== '-' && optInfo.gp > 2.00) ? (optInfo.gp - 2.00) : 0;
                const optionalBonusMarks = (!isNaN(optTotal) && optTotal > optBaseDeductMarks) ? (optTotal - optBaseDeductMarks) : 0;"""

assert old_opt_deduct in content, "Error: old_opt_deduct not found in Tabulation Sheet.html"
content = content.replace(old_opt_deduct, new_opt_deduct)
print("Part D2 applied: optional base deduct marks scaled to dynamic optional subject full marks.")

# Also update totalMax in total mark method:
old_total_max = """                    if (currentGPACalcMethod === 'total') {
                        // Total Mark Based Method (Main base = 1050)
                        const totalMax = 1050;"""

new_total_max = """                    if (currentGPACalcMethod === 'total') {
                        // Total Mark Based Method (dynamically calculated from all main subject full marks)
                        const totalMax = bFullMarksTotal + engFullMarksTotal + mathFull + bgsFull + chemFull + physFull + bioFull + relFull + ictFull;"""

assert old_total_max in content, "Error: old_total_max not found in Tabulation Sheet.html"
content = content.replace(old_total_max, new_total_max)
print("Part D3 applied: totalMax dynamically calculated from all main subjects.")

# -------------------------------------------------------------------------------------
# PART E: Update updateSubjects() to call updateDynamicSubjectMarksAndHeaders()
# -------------------------------------------------------------------------------------
old_update_subj_tail = """                if (dynamicSubjectMap[lang] && dynamicSubjectMap[lang][fmt] && dynamicSubjectMap[lang][fmt][key] !== undefined) {
                    el.textContent = dynamicSubjectMap[lang][fmt][key];
                }
            });
        }"""

new_update_subj_tail = """                if (dynamicSubjectMap[lang] && dynamicSubjectMap[lang][fmt] && dynamicSubjectMap[lang][fmt][key] !== undefined) {
                    el.textContent = dynamicSubjectMap[lang][fmt][key];
                }
            });

            // Dynamically update full marks and component headers
            if (typeof updateDynamicSubjectMarksAndHeaders === 'function') {
                updateDynamicSubjectMarksAndHeaders();
            }
        }"""

assert old_update_subj_tail in content, "Error: old_update_subj_tail not found in Tabulation Sheet.html"
content = content.replace(old_update_subj_tail, new_update_subj_tail)
print("Part E applied: updateSubjects() now invokes updateDynamicSubjectMarksAndHeaders().")

# -------------------------------------------------------------------------------------
# PART F: Live sync and background database polling
# -------------------------------------------------------------------------------------

old_interval_block = """        setInterval(() => {
            try {
                const currentStudentsJson = localStorage.getItem('school_students') || '';
                const currentSubjectsJson = localStorage.getItem('school_subjects') || '';
                const currentMarkingSystemJson = localStorage.getItem('school_marking_system') || '';
                const currentMarksJson = localStorage.getItem('school_student_marks') || '';
                const currentSchedulesJson = localStorage.getItem('school_exam_schedules') || '';
                const currentActiveExam = localStorage.getItem('school_active_exam_filter') || '';
                if (currentStudentsJson !== lastKnownStudentsJson || 
                    currentSubjectsJson !== lastKnownSubjectsJson || 
                    currentMarkingSystemJson !== lastKnownMarkingSystemJson ||
                    currentMarksJson !== lastKnownMarksJson ||
                    currentSchedulesJson !== lastKnownSchedulesJson ||
                    currentActiveExam !== lastKnownActiveExam) {
                    lastKnownStudentsJson = currentStudentsJson;
                    lastKnownSubjectsJson = currentSubjectsJson;
                    lastKnownMarkingSystemJson = currentMarkingSystemJson;
                    lastKnownMarksJson = currentMarksJson;
                    lastKnownSchedulesJson = currentSchedulesJson;
                    lastKnownActiveExam = currentActiveExam;
                    refreshTabulationSheetData();
                }
            } catch (e) { }
        }, 1000);"""

new_interval_block = """        // Background live database sync from server (/api/db)
        function syncLiveTabulationDbData() {
            if (window._lastTabDbFetch && (Date.now() - window._lastTabDbFetch < 2000)) return;
            window._lastTabDbFetch = Date.now();
            fetch('/api/db?keys=school_exam_schedules,school_exam_types,school_exam_routines,school_omr_exams,school_classes,school_students,school_settings,school_student_marks,school_subjects')
                .then(r => r.json())
                .then(data => {
                    if (data && typeof data === 'object') {
                        let hasChanged = false;
                        ['school_exam_schedules', 'school_exam_types', 'school_exam_routines', 'school_omr_exams', 'school_classes', 'school_students', 'school_student_marks', 'school_subjects'].forEach(k => {
                            if (data[k]) {
                                const strVal = typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]);
                                if (localStorage.getItem(k) !== strVal) {
                                    localStorage.setItem(k, strVal);
                                    hasChanged = true;
                                }
                            }
                        });
                        if (hasChanged) {
                            refreshTabulationSheetData();
                        }
                    }
                })
                .catch(() => {});
        }

        let lastKnownExamTypesJson = '';

        setInterval(() => {
            try {
                syncLiveTabulationDbData();

                const currentStudentsJson = localStorage.getItem('school_students') || '';
                const currentSubjectsJson = localStorage.getItem('school_subjects') || '';
                const currentMarkingSystemJson = localStorage.getItem('school_marking_system') || '';
                const currentMarksJson = localStorage.getItem('school_student_marks') || '';
                const currentSchedulesJson = localStorage.getItem('school_exam_schedules') || '';
                const currentExamTypesJson = localStorage.getItem('school_exam_types') || '';
                const currentActiveExam = localStorage.getItem('school_active_exam_filter') || '';

                if (currentStudentsJson !== lastKnownStudentsJson || 
                    currentSubjectsJson !== lastKnownSubjectsJson || 
                    currentMarkingSystemJson !== lastKnownMarkingSystemJson ||
                    currentMarksJson !== lastKnownMarksJson ||
                    currentSchedulesJson !== lastKnownSchedulesJson ||
                    currentExamTypesJson !== lastKnownExamTypesJson ||
                    currentActiveExam !== lastKnownActiveExam) {
                    lastKnownStudentsJson = currentStudentsJson;
                    lastKnownSubjectsJson = currentSubjectsJson;
                    lastKnownMarkingSystemJson = currentMarkingSystemJson;
                    lastKnownMarksJson = currentMarksJson;
                    lastKnownSchedulesJson = currentSchedulesJson;
                    lastKnownExamTypesJson = currentExamTypesJson;
                    lastKnownActiveExam = currentActiveExam;
                    refreshTabulationSheetData();
                }
            } catch (e) { }
        }, 1000);"""

assert old_interval_block in content, "Error: old_interval_block not found in Tabulation Sheet.html"
content = content.replace(old_interval_block, new_interval_block)
print("Part F applied: syncLiveTabulationDbData and live heartbeat interval updated.")

# Save updated Tabulation Sheet.html
with open('Tabulation Sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Tabulation Sheet.html updated with complete dynamic subject marks & headers!")

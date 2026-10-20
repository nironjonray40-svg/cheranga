import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update THEAD 6 Row 3 and Row 4 with pre-wrapped <div class="v-text-inner">
old_r3_r4 = """            <tr>
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
            </tr>"""

new_r3_r4 = """            <tr>
                <th colspan="3" class="bg-peach" data-subj="bangla1">বাংলা ১ম</th>
                <th colspan="3" class="bg-peach" data-subj="bangla2">বাংলা ২য়</th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="grand_total" data-subj="bangla"><div class="v-text-inner">সর্বমোট</div></th>
                <th rowspan="3" class="v-text bg-peach">গড় প্রাপ্ত</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th class="bg-peach" data-subj="english1">English 1st</th>
                <th class="bg-peach" data-subj="english2">English 2nd</th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="grand_total" data-subj="english"><div class="v-text-inner">সর্বমোট</div></th>
                <th rowspan="3" class="v-text bg-peach">গড় প্রাপ্ত</th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="mcq" data-subj="math"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="written" data-subj="math"><div class="v-text-inner">লিখিত</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="total" data-subj="math"><div class="v-text-inner">মোট</div></th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="mcq" data-subj="bgs"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="written" data-subj="bgs"><div class="v-text-inner">লিখিত</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="total" data-subj="bgs"><div class="v-text-inner">মোট</div></th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="mcq" data-subj="chem"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="written" data-subj="chem"><div class="v-text-inner">লিখিত</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="practical" data-subj="chem"><div class="v-text-inner">ব্যবহারিক</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="total" data-subj="chem"><div class="v-text-inner">মোট</div></th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="mcq" data-subj="phys"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="written" data-subj="phys"><div class="v-text-inner">লিখিত</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="practical" data-subj="phys"><div class="v-text-inner">ব্যবহারিক</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="total" data-subj="phys"><div class="v-text-inner">মোট</div></th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="mcq" data-subj="bio"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="written" data-subj="bio"><div class="v-text-inner">লিখিত</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="practical" data-subj="bio"><div class="v-text-inner">ব্যবহারিক</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="total" data-subj="bio"><div class="v-text-inner">মোট</div></th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="mcq" data-subj="rel"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="written" data-subj="rel"><div class="v-text-inner">লিখিত</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="total" data-subj="rel"><div class="v-text-inner">মোট</div></th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="mcq" data-subj="ict"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="written" data-subj="ict"><div class="v-text-inner">লিখিত</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="total" data-subj="ict"><div class="v-text-inner">মোট</div></th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>

                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="mcq" data-subj="agri"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="written" data-subj="agri"><div class="v-text-inner">লিখিত</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="practical" data-subj="agri"><div class="v-text-inner">ব্যবহারিক</div></th>
                <th rowspan="2" class="v-text-cell bg-peach" data-col-type="total" data-subj="agri"><div class="v-text-inner">মোট</div></th>
                <th rowspan="3" class="v-text bg-blue">গ্রেড</th>
                <th rowspan="3" class="v-text bg-peach">পয়েন্ট</th>
            </tr>

            <!-- Row 3: Detail Exam Type -->
            <tr>
                <th class="v-text-cell bg-peach" data-col-type="mcq" data-subj="bangla1"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th class="v-text-cell bg-peach" data-col-type="written" data-subj="bangla1"><div class="v-text-inner">লিখিত</div></th>
                <th class="v-text-cell bg-peach" data-col-type="total" data-subj="bangla1"><div class="v-text-inner">মোট</div></th>
                <th class="v-text-cell bg-peach" data-col-type="mcq" data-subj="bangla2"><div class="v-text-inner">বহুনির্বাচনি</div></th>
                <th class="v-text-cell bg-peach" data-col-type="written" data-subj="bangla2"><div class="v-text-inner">লিখিত</div></th>
                <th class="v-text-cell bg-peach" data-col-type="total" data-subj="bangla2"><div class="v-text-inner">মোট</div></th>
                <th class="v-text-cell bg-peach" data-col-type="written" data-subj="english1"><div class="v-text-inner">লিখিত</div></th>
                <th class="v-text-cell bg-peach" data-col-type="written" data-subj="english2"><div class="v-text-inner">লিখিত</div></th>
            </tr>"""

assert old_r3_r4 in content, "old_r3_r4 not found"
content = content.replace(old_r3_r4, new_r3_r4)
print("Step 1: THEAD Rows 3 and 4 updated with <div class='v-text-inner'>.")

# 2. Update updateDynamicSubjectMarksAndHeaders() to preserve .v-text-inner
old_update_block = """            document.querySelectorAll('thead th[data-col-type]').forEach(th => {
                const type = th.getAttribute('data-col-type');
                if (type && componentLabels[lang] && componentLabels[lang][type]) {
                    th.textContent = componentLabels[lang][type];
                }
            });"""

new_update_block = """            document.querySelectorAll('thead th[data-col-type]:not([data-fullmark])').forEach(th => {
                const type = th.getAttribute('data-col-type');
                if (type && componentLabels[lang] && componentLabels[lang][type]) {
                    const label = componentLabels[lang][type];
                    let inner = th.querySelector('.v-text-inner');
                    if (!inner) {
                        inner = document.createElement('div');
                        inner.className = 'v-text-inner';
                        inner.textContent = label;
                        th.textContent = '';
                        th.appendChild(inner);
                    } else {
                        inner.textContent = label;
                    }
                    if (!th.classList.contains('v-text-cell')) {
                        th.classList.remove('v-text');
                        th.classList.add('v-text-cell');
                    }
                }
            });"""

assert old_update_block in content, "old_update_block not found"
content = content.replace(old_update_block, new_update_block)
print("Step 2: updateDynamicSubjectMarksAndHeaders updated to preserve .v-text-inner.")

# 3. Update wrapVerticalHeaders() to avoid duplicate wrapping and ensure all vertical cells are handled
old_wrap_block = """        function wrapVerticalHeaders() {

            document.querySelectorAll('th.v-text').forEach(th => {

                const inner = document.createElement('div');

                inner.className = 'v-text-inner';

                inner.innerHTML = th.innerHTML;

                th.innerHTML = '';

                th.appendChild(inner);

                th.className = th.className.replace('v-text', 'v-text-cell');

            });

        }"""

new_wrap_block = """        function wrapVerticalHeaders() {

            document.querySelectorAll('th.v-text, th.v-text-cell').forEach(th => {

                if (!th.querySelector('.v-text-inner')) {

                    const inner = document.createElement('div');

                    inner.className = 'v-text-inner';

                    inner.innerHTML = th.innerHTML;

                    th.innerHTML = '';

                    th.appendChild(inner);

                }

                if (th.classList.contains('v-text')) {

                    th.classList.remove('v-text');

                    th.classList.add('v-text-cell');

                }

            });

        }"""

assert old_wrap_block in content, "old_wrap_block not found"
content = content.replace(old_wrap_block, new_wrap_block)
print("Step 3: wrapVerticalHeaders updated.")

# 4. Save to Tabulation Sheet.html
with open('Tabulation Sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("All changes successfully applied to Tabulation Sheet.html!")

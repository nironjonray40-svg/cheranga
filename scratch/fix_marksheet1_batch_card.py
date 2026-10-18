with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace lines inside generateMarksheet1CardHTML
old_block = '''                        <table class="profile-grid">
                            <tr>
                                <td class="p-label" id="p-label-name" style="font-size: 15.1px; font-weight: 800;">শিক্ষার্থীর নাম</td>
                                <td class="p-colon" style="font-size: 15.1px; font-weight: 800;">:</td>
                                <td class="p-val" colspan="4" style="font-size: 15.6px; font-weight: 800;">${studentName}</td>
                            </tr>
                            <tr>
                                <td class="p-label" id="p-label-class">শ্রেণি</td>
                                <td class="p-colon">:</td>
                                <td class="p-val" style="width: 25%;">${displayCls}</td>
                                <td class="p-label" id="p-label-section" style="padding-left: 15px;"> শাখা / গ্রুপ</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displaySec}</td>
                            </tr>
                            <tr>
                                <td class="p-label" id="p-label-id">আইডি / রেজি</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${formatDigits(studentId)}</td>
                                <td class="p-label" id="p-label-roll" style="padding-left: 15px;">রোল নং</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${formatDigits(String(rollNo).padStart(2, '0'))}</td>
                            </tr>
                            <tr>
                                <td class="p-label" id="p-label-religion">ধর্ম (Religion)</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displayRel}</td>
                                ${isSecondary ? `
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Optional Subject" : "ঐচ্ছিক বিষয়"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displayOpt}</td>
                                ` : `
                                <td class="p-label" style="padding-left: 15px; visibility: hidden;">—</td>
                                <td class="p-colon" style="visibility: hidden;">:</td>
                                <td class="p-val" style="visibility: hidden;">—</td>
                                `}
                            </tr>
                        </table>'''

new_block = '''                        <table class="profile-grid">
                            <tr>
                                <td class="p-label" style="font-size: 15.1px; font-weight: 800;">${isEn ? "Student Name" : "শিক্ষার্থীর নাম"}</td>
                                <td class="p-colon" style="font-size: 15.1px; font-weight: 800;">:</td>
                                <td class="p-val" colspan="4" style="font-size: 15.6px; font-weight: 800;">${studentName}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "Class" : "শ্রেণি"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val" style="width: 25%;">${displayCls}</td>
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Section / Group" : "শাখা / গ্রুপ"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displaySec}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "ID / Reg" : "আইডি / রেজি"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${formatDigits(studentId)}</td>
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Roll No" : "রোল নং"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${formatDigits(String(rollNo).padStart(2, '0'))}</td>
                            </tr>
                            <tr>
                                <td class="p-label">${isEn ? "Religion" : "ধর্ম (Religion)"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displayRel}</td>
                                ${isSecondary ? `
                                <td class="p-label" style="padding-left: 15px;">${isEn ? "Optional Subject" : "ঐচ্ছিক বিষয়"}</td>
                                <td class="p-colon">:</td>
                                <td class="p-val">${displayOpt}</td>
                                ` : `
                                <td class="p-label" style="padding-left: 15px; visibility: hidden;">—</td>
                                <td class="p-colon" style="visibility: hidden;">:</td>
                                <td class="p-val" style="visibility: hidden;">—</td>
                                `}
                            </tr>
                        </table>'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    print("[Marksheet1.html] Successfully updated batch card profile-grid")
else:
    print("[Marksheet1.html] ERROR: old_block not found")

# Replace legend title, kpi badges, and signatures in batch card
content = content.replace(
    '<div class="legend-title" id="legend-title-1">গ্রেডিং নির্দেশিকা (Grading Scale)</div>\n                        <table class="legend-table">',
    '<div class="legend-title">${isEn ? "Grading Scale" : "গ্রেডিং নির্দেশিকা (Grading Scale)"}</div>\n                        <table class="legend-table">',
    1
)

old_kpi_block = '''            <!-- Result KPI Badges -->
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-label" id="kpi-label-total">সর্বমোট প্রাপ্ত নম্বর</div>
                    <div class="kpi-value">${hasAnyMarks ? (formatDigits(grandTotal) + ' / ' + formatDigits(totalFullMarks)) : '—'}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label" id="kpi-label-gpa">জিপিএ (GPA)</div>
                    <div class="kpi-value" style="color: #000000; font-weight:800;">${finalGpaStr}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label" id="kpi-label-grade">চূড়ান্ত গ্রেড</div>
                    <div class="kpi-value" style="color: #000000; font-weight:800;">${finalGrade}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label" id="kpi-label-pos">মেধাক্রম (Merit Position)</div>
                    <div class="kpi-value">${rankStr}</div>
                </div>
            </div>

            <!-- Signatures -->
            <div class="signature-grid">
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border" id="label-sig-guardian-1">অভিভাবকের স্বাক্ষর</div>
                </div>
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border" id="label-sig-teacher-1">শ্রেণি শিক্ষকের স্বাক্ষর</div>
                </div>
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border" id="label-sig-head-1">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
                </div>
            </div>'''

new_kpi_block = '''            <!-- Result KPI Badges -->
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-label">${isEn ? "Total Marks Obtained" : "সর্বমোট প্রাপ্ত নম্বর"}</div>
                    <div class="kpi-value">${hasAnyMarks ? (formatDigits(grandTotal) + ' / ' + formatDigits(totalFullMarks)) : '—'}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "GPA" : "জিপিএ (GPA)"}</div>
                    <div class="kpi-value" style="color: #000000; font-weight:800;">${finalGpaStr}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "Final Grade" : "চূড়ান্ত গ্রেড"}</div>
                    <div class="kpi-value" style="color: #000000; font-weight:800;">${finalGrade}</div>
                </div>
                <div class="kpi-card" style="margin-left: 8px;">
                    <div class="kpi-label">${isEn ? "Merit Position" : "মেধাক্রম (Merit Position)"}</div>
                    <div class="kpi-value">${rankStr}</div>
                </div>
            </div>

            <!-- Signatures -->
            <div class="signature-grid">
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Guardian's Signature" : "অভিভাবকের স্বাক্ষর"}</div>
                </div>
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Class Teacher's Signature" : "শ্রেণি শিক্ষকের স্বাক্ষর"}</div>
                </div>
                <div class="sig-col">
                    <div class="sig-space"></div>
                    <div class="sig-border">${isEn ? "Head Teacher's Signature & Seal" : "প্রধান শিক্ষকের স্বাক্ষর ও সিল"}</div>
                </div>
            </div>'''

if old_kpi_block in content:
    content = content.replace(old_kpi_block, new_kpi_block, 1)
    print("[Marksheet1.html] Successfully updated batch card KPI and signatures")
else:
    print("[Marksheet1.html] ERROR: old_kpi_block not found")

with open('Marksheet1.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("[Marksheet1.html] Finished fixing batch card")

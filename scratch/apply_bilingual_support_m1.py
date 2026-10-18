def update_marksheet1_html():
    with open('Marksheet1.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update toolbar labels and add language filter
    old_tmpl_block = '''    <!-- Template Filter Option (Temp-01, Temp-02) -->
    <div class="filter-group" title="মার্কশিট টেমপ্লেট নির্বাচন করুন">
        <label for="template-filter" class="filter-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Filter:</span>
        </label>
        <select id="template-filter" class="filter-select" onchange="switchTemplate(this.value)">'''

    new_tmpl_block = '''    <!-- Language Switcher Option (বাংলা / English) -->
    <div class="filter-group" title="ভাষা নির্বাচন করুন (Select Language)">
        <label for="filter-language" class="filter-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span id="label-language">ভাষা:</span>
        </label>
        <select id="filter-language" class="filter-select" onchange="switchLanguage(this.value)">
            <option value="bn" selected>বাংলা</option>
            <option value="en">English</option>
        </select>
    </div>

    <!-- Template Filter Option (Temp-01, Temp-02) -->
    <div class="filter-group" title="মার্কশিট টেমপ্লেট নির্বাচন করুন">
        <label for="template-filter" class="filter-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span id="label-template">Filter:</span>
        </label>
        <select id="template-filter" class="filter-select" onchange="switchTemplate(this.value)">'''

    if old_tmpl_block in html:
        html = html.replace(old_tmpl_block, new_tmpl_block, 1)
        print("[Marksheet1.html] Added language dropdown to toolbar")
    else:
        print("[Marksheet1.html] ERROR: old_tmpl_block not found")

    # Add IDs to other toolbar labels
    html = html.replace('<label for="filter-exam" class="filter-label">\n            <span>পরীক্ষা:</span>', '<label for="filter-exam" class="filter-label">\n            <span id="label-exam">পরীক্ষা:</span>')
    html = html.replace('<label for="filter-class" class="filter-label">\n            <span>শ্রেণি:</span>', '<label for="filter-class" class="filter-label">\n            <span id="label-class">শ্রেণি:</span>')
    html = html.replace('<label for="filter-section" class="filter-label">\n            <span> শাখা:</span>', '<label for="filter-section" class="filter-label">\n            <span id="label-section">শাখা:</span>')
    html = html.replace('<span>খুঁজুন:</span>', '<span id="label-search">খুঁজুন:</span>')
    html = html.replace('<span>প্রিন্ট (Print)</span>', '<span id="btn-print-text">প্রিন্ট (Print)</span>')

    # Add IDs to profile labels
    html = html.replace('<td class="p-label" style="font-size: 15.1px; font-weight: 800;">শিক্ষার্থীর নাম</td>', '<td class="p-label" id="p-label-name" style="font-size: 15.1px; font-weight: 800;">শিক্ষার্থীর নাম</td>')
    html = html.replace('<td class="p-label">শ্রেণি</td>', '<td class="p-label" id="p-label-class">শ্রেণি</td>')
    html = html.replace('<td class="p-label" style="padding-left: 15px;"> শাখা / গ্রুপ</td>', '<td class="p-label" id="p-label-section" style="padding-left: 15px;"> শাখা / গ্রুপ</td>')
    html = html.replace('<td class="p-label">আইডি / রেজি</td>', '<td class="p-label" id="p-label-id">আইডি / রেজি</td>')
    html = html.replace('<td class="p-label" style="padding-left: 15px;">রোল নং</td>', '<td class="p-label" id="p-label-roll" style="padding-left: 15px;">রোল নং</td>')
    html = html.replace('<td class="p-label">ধর্ম (Religion)</td>', '<td class="p-label" id="p-label-religion">ধর্ম (Religion)</td>')

    # Add IDs to legend
    html = html.replace('<div class="legend-title">গ্রেডিং নির্দেশিকা (Grading Scale)</div>', '<div class="legend-title" id="legend-title-1">গ্রেডিং নির্দেশিকা (Grading Scale)</div>')
    html = html.replace('<th>নম্বর সীমা</th>\n                                <th>গ্রেড</th>\n                                <th>পয়েন্ট</th>', '<th id="legend-th-range-1">নম্বর সীমা</th>\n                                <th id="legend-th-grade-1">গ্রেড</th>\n                                <th id="legend-th-gp-1">পয়েন্ট</th>')

    # Add IDs to transcript table headers
    html = html.replace('<th rowspan="2" style="width: 27%;">পাঠ্য বিষয়সমূহ</th>', '<th rowspan="2" id="th-header-sub-1" style="width: 27%;">পাঠ্য বিষয়সমূহ</th>')
    html = html.replace('<th rowspan="2" style="width: 8%;">পূর্ণমান</th>', '<th rowspan="2" id="th-header-full-1" style="width: 8%;">পূর্ণমান</th>')
    html = html.replace('<th colspan="3" style="width: 25%;">প্রাপ্ত নম্বর</th>', '<th colspan="3" id="th-header-obtained-1" style="width: 25%;">প্রাপ্ত নম্বর</th>')
    html = html.replace('<th rowspan="2" style="width: 11%;">সর্বমোট</th>', '<th rowspan="2" id="th-header-combined-1" style="width: 11%;">সর্বমোট</th>')
    html = html.replace('<th rowspan="2" style="width: 9%;">লেটার গ্রেড</th>', '<th rowspan="2" id="th-header-grade-1" style="width: 9%;">লেটার গ্রেড</th>')
    html = html.replace('<th rowspan="2" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>', '<th rowspan="2" id="th-header-gp-1" style="width: 11%;">গ্রেড পয়েন্ট (GP)</th>')

    # Add IDs to KPI row
    html = html.replace('<div class="kpi-label">সর্বমোট প্রাপ্ত নম্বর</div>', '<div class="kpi-label" id="kpi-label-total">সর্বমোট প্রাপ্ত নম্বর</div>')
    html = html.replace('<div class="kpi-label">জিপিএ (GPA)</div>', '<div class="kpi-label" id="kpi-label-gpa">জিপিএ (GPA)</div>')
    html = html.replace('<div class="kpi-label">চূড়ান্ত গ্রেড</div>', '<div class="kpi-label" id="kpi-label-grade">চূড়ান্ত গ্রেড</div>')
    html = html.replace('<div class="kpi-label">মেধাক্রম (Merit Position)</div>', '<div class="kpi-label" id="kpi-label-pos">মেধাক্রম (Merit Position)</div>')

    # Add IDs to signatures
    html = html.replace('<div class="sig-border">অভিভাবকের স্বাক্ষর</div>', '<div class="sig-border" id="label-sig-guardian-1">অভিভাবকের স্বাক্ষর</div>')
    html = html.replace('<div class="sig-border">শ্রেণি শিক্ষকের স্বাক্ষর</div>', '<div class="sig-border" id="label-sig-teacher-1">শ্রেণি শিক্ষকের স্বাক্ষর</div>')
    html = html.replace('<div class="sig-border">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>', '<div class="sig-border" id="label-sig-head-1">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>')

    with open('Marksheet1.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("[Marksheet1.html] HTML labels updated with IDs successfully")

update_marksheet1_html()

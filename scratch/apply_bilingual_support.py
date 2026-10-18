import re

def update_marksheet_html():
    with open('Marksheet.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update toolbar labels and add language filter
    # Replace the template filter block to prepend language switcher
    old_tmpl_block = '''        <!-- Template Filter Option (Temp-01, Temp-02) -->
        <div class="filter-group" title="মার্কশিট টেমপ্লেট নির্বাচন করুন">
            <label for="template-filter" class="filter-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span>Filter:</span>
            </label>
            <select id="template-filter" class="filter-select" onchange="switchTemplate(this.value)">'''

    new_tmpl_block = '''        <!-- Language Switcher Option (বাংলা / English) -->
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
        print("[Marksheet.html] Added language dropdown to toolbar")
    else:
        print("[Marksheet.html] ERROR: old_tmpl_block not found")

    # Add IDs to other toolbar labels
    html = html.replace('<label for="filter-exam" class="filter-label">\n                <span>পরীক্ষা:</span>', '<label for="filter-exam" class="filter-label">\n                <span id="label-exam">পরীক্ষা:</span>')
    html = html.replace('<label for="filter-class" class="filter-label">\n                <span>শ্রেণি:</span>', '<label for="filter-class" class="filter-label">\n                <span id="label-class">শ্রেণি:</span>')
    html = html.replace('<label for="filter-section" class="filter-label">\n                <span>শাখা:</span>', '<label for="filter-section" class="filter-label">\n                <span id="label-section">শাখা:</span>')
    html = html.replace('<span>খুঁজুন:</span>', '<span id="label-search">খুঁজুন:</span>')
    html = html.replace('<span>প্রিন্ট (Print)</span>', '<span id="btn-print-text">প্রিন্ট (Print)</span>')

    # Add IDs to student info labels
    html = html.replace('<div class="info-label">শিক্ষার্থীর নাম</div>', '<div class="info-label" id="label-student-name">শিক্ষার্থীর নাম</div>')
    html = html.replace('<div class="info-label">রোল নং</div>', '<div class="info-label" id="label-roll-no">রোল নং</div>')
    html = html.replace('<div class="info-label">শ্রেণি</div>', '<div class="info-label" id="label-class-name">শ্রেণি</div>')
    html = html.replace('<div class="info-label" style="width: 125px;">ধর্ম (Religion)</div>', '<div class="info-label" id="label-student-religion" style="width: 125px;">ধর্ম (Religion)</div>')
    html = html.replace('<div class="info-label" style="width: 125px;">ঐচ্ছিক বিষয় (৪র্থ)</div>', '<div class="info-label" id="label-optional-subject" style="width: 125px;">ঐচ্ছিক বিষয় (৪র্থ)</div>')
    html = html.replace('<div class="info-label" style="width: 125px;">শিক্ষার্থী আইডি</div>', '<div class="info-label" id="label-student-id" style="width: 125px;">শিক্ষার্থী আইডি</div>')

    # Add IDs to marks table headers
    html = html.replace('<th class="subject-col">বিষয়</th>', '<th class="subject-col" id="th-header-sub">বিষয়</th>')
    html = html.replace('<th>সর্বমোট</th>\n                    <th>গ্রেড</th>\n                    <th>পয়েন্ট</th>', '<th id="th-header-combined">সর্বমোট</th>\n                    <th id="th-header-grade">গ্রেড</th>\n                    <th id="th-header-point">পয়েন্ট</th>')

    # Add IDs to rank & summary tables
    html = html.replace('<td style="width: 50%;">স্থান</td>', '<td style="width: 50%;" id="td-label-rank">স্থান</td>')
    html = html.replace('<td style="width: 50%;">সর্বমোট</td>', '<td style="width: 50%;" id="td-label-grand-total">সর্বমোট</td>')
    html = html.replace('<td>পয়েন্ট</td>', '<td id="td-label-gpa">পয়েন্ট</td>')
    html = html.replace('<td>গ্রেড</td>', '<td id="td-label-grade">গ্রেড</td>')

    # Add IDs to signatures
    html = html.replace('<div class="sig-label">অভিভাবকের স্বাক্ষর</div>', '<div class="sig-label" id="label-sig-guardian">অভিভাবকের স্বাক্ষর</div>')
    html = html.replace('<div class="sig-label">প্রধান শিক্ষকের স্বাক্ষর</div>', '<div class="sig-label" id="label-sig-head">প্রধান শিক্ষকের স্বাক্ষর</div>')

    with open('Marksheet.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("[Marksheet.html] HTML labels updated with IDs successfully")

update_marksheet_html()

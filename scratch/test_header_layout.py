import subprocess
import os

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

html = """<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@700;800&display=swap" rel="stylesheet">
<style>
body { font-family: 'Anek Bangla', 'Kalpurush', 'SolaimanLipi', sans-serif; margin: 0; background: #fff; padding: 20px; }
.certificate-sheet { width: 794px; margin: 0 auto; padding: 30px; box-sizing: border-box; }
.inner-border { width: 100%; border: 2px solid #000; padding: 26px 30px; box-sizing: border-box; }

.institution-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border-bottom: 2px solid #000000;
    padding-bottom: 8px;
    margin-bottom: 10px;
    min-height: 80px;
    box-sizing: border-box;
}
.header-logo-box {
    flex: 0 0 70px;
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}
.header-logo-box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
    display: block;
}
.header-right-spacer {
    flex: 0 0 70px;
    width: 70px;
}
.header-text-box {
    flex: 1;
    min-width: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    box-sizing: border-box;
}
.inst-title-bn {
    font-size: 20.5px;
    font-weight: 800;
    color: #000000;
    line-height: 1.2;
    margin: 1px 0 3px 0;
    white-space: nowrap;
    letter-spacing: -0.3px;
}
.inst-subtitle {
    font-size: 12px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
    line-height: 1.2;
}
.report-pill-title {
    display: inline-block;
    background: #e6e6e6;
    color: #000000;
    border: 1.5px solid #000000;
    font-size: 13px;
    font-weight: 800;
    padding: 2px 20px;
    border-radius: 20px;
    letter-spacing: 0.3px;
}
</style>
</head>
<body>
<div class="certificate-sheet">
    <div class="inner-border">
        <div class="institution-header">
            <div class="header-logo-box" id="logoBox">
                <img src="../school_logo.svg" alt="Logo">
            </div>
            <div class="header-text-box" id="textBox">
                <div class="inst-title-bn" id="titleBn">আলহাজ্ব মোবারক হোসেন অনির্বাণ বিদ্যাতীর্থ উচ্চ বিদ্যালয়</div>
                <div class="inst-subtitle" id="subTitle">মাথাভাঙ্গা, জলঢাকা, নীলফামারী। | ইআইআইএন: ১২৭৫৪৩ | কোড: ৫৬১২</div>
                <div>
                    <span class="report-pill-title">বার্ষিক পরীক্ষা</span>
                </div>
            </div>
            <div class="header-right-spacer" id="rightSpacer"></div>
        </div>
    </div>
</div>
<script>
window.onload = function() {
    const l = document.getElementById('logoBox').getBoundingClientRect();
    const t = document.getElementById('titleBn').getBoundingClientRect();
    const tb = document.getElementById('textBox').getBoundingClientRect();
    const res = {
        logo: { left: l.left, right: l.right, width: l.width, height: l.height },
        title: { left: t.left, right: t.right, width: t.width, height: t.height },
        textBox: { left: tb.left, right: tb.right, width: tb.width },
        overlap: l.right > t.left
    };
    const div = document.createElement('div');
    div.id = 'result-data';
    div.innerText = JSON.stringify(res);
    document.body.appendChild(div);
};
</script>
</body>
</html>"""

with open('scratch/test_layout.html', 'w', encoding='utf-8') as f:
    f.write(html)

file_path = os.path.abspath('scratch/test_layout.html').replace('\\', '/')
cmd = [edge, '--headless', '--disable-gpu', '--dump-dom', f'file:///{file_path}']
proc = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
output = proc.stdout
import re
match = re.search(r'<div id="result-data">(.*?)</div>', output)
if match:
    print("Result:", match.group(1))
else:
    print("Output length:", len(output))
    if 'আলহাজ্ব' in output:
        print("Page rendered successfully!")

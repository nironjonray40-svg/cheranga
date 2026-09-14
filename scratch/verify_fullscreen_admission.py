import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def verify_fullscreen_admission():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cms_path = os.path.join(base_dir, 'cms.html')

    with open(cms_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Fullscreen Overlay & Card CSS
    assert "#admissionModalOverlay" in html, "Missing #admissionModalOverlay styles"
    assert "width: 100vw !important;" in html, "Missing 100vw fullscreen style"
    assert "height: 100vh !important;" in html, "Missing 100vh fullscreen style"
    assert "adm-fullscreen-card" in html, "Missing adm-fullscreen-card class in cms.html"

    # 2. Header and elements
    assert "অনলাইন ভর্তি আবেদন ফরম" in html, "Missing online admission title"
    assert "admissionHeaderSchoolName" in html, "Missing admissionHeaderSchoolName element"
    assert "openAdmissionModal" in html, "Missing openAdmissionModal function"
    assert "closeAdmissionModal" in html, "Missing closeAdmissionModal function"

    # 3. URL Param Auto Launch
    assert "urlParams.has('admission')" in html or "urlParams.get('view') === 'admission'" in html, "Missing admission URL param auto-launch"
    assert "window.location.hash === '#admission'" in html, "Missing admission hash auto-launch"

    print("[PASS] Fullscreen admission modal structure and CSS verified successfully!")

if __name__ == '__main__':
    verify_fullscreen_admission()

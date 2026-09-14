import os
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def test_cms_auth_integration():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cms_path = os.path.join(base_dir, 'cms.html')
    server_path = os.path.join(base_dir, 'server.py')
    main_js_path = os.path.join(base_dir, 'main.js')
    advance_path = os.path.join(base_dir, 'advance.html')

    print("Checking files...")
    assert os.path.exists(cms_path), "cms.html missing"
    assert os.path.exists(server_path), "server.py missing"
    assert os.path.exists(main_js_path), "main.js missing"
    assert os.path.exists(advance_path), "advance.html missing"

    with open(cms_path, 'r', encoding='utf-8') as f:
        cms_content = f.read()

    with open(server_path, 'r', encoding='utf-8') as f:
        server_content = f.read()

    with open(main_js_path, 'r', encoding='utf-8') as f:
        main_js_content = f.read()

    with open(advance_path, 'r', encoding='utf-8') as f:
        advance_content = f.read()

    # 1. Verify server defaults to cms.html
    assert "raw_path = 'cms.html'" in server_content, "server.py should default root to cms.html"
    print("✓ server.py root path resolves to cms.html")

    # 2. Verify cms.html has login modal & auth functions
    assert "id=\"cmsLoginModalOverlay\"" in cms_content, "cms.html missing #cmsLoginModalOverlay"
    assert "openCmsLoginModal" in cms_content, "cms.html missing openCmsLoginModal"
    assert "closeCmsLoginModal" in cms_content, "cms.html missing closeCmsLoginModal"
    assert "handleCmsLoginSubmit" in cms_content, "cms.html missing handleCmsLoginSubmit"
    assert "loginSuccessRedirect" in cms_content, "cms.html missing loginSuccessRedirect"
    assert "updateCmsAuthUI" in cms_content, "cms.html missing updateCmsAuthUI"
    assert "Home.html" in cms_content, "cms.html should redirect to Home.html upon login"
    print("✓ cms.html contains complete ERP login modal, auth handlers, and redirect logic")

    # 3. Verify main.js logout redirect
    assert "window.location.href = '/';" in main_js_content, "main.js logout should redirect to /"
    print("✓ main.js logout redirects to / (CMS mode)")

    # 4. Verify advance.html CMS portal integration
    assert "subview-cms-portal" in advance_content, "advance.html missing subview-cms-portal"
    assert "importAllErpDataToCms" in advance_content, "advance.html missing importAllErpDataToCms"
    print("✓ advance.html contains CMS portal and data import engine")

    print("\nALL CMS AUTH INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == '__main__':
    test_cms_auth_integration()

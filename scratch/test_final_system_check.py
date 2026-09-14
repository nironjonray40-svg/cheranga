import urllib.request
import json
import re

BASE_URL = 'http://127.0.0.1:8000'

def test_endpoint(path, expected_code=200):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            data = res.read().decode('utf-8', 'replace')
            return res.status, data
    except Exception as e:
        return 500, str(e)

print("="*60)
print("RUNNING FINAL SYSTEM VERIFICATION")
print("="*60)

# Test 1: Root URL / -> CMS Portal
status, html = test_endpoint('/')
assert status == 200, f"Root failed with status {status}"
assert 'অফিসিয়াল CMS পোর্টাল' in html, "Root did not return CMS Portal HTML!"
assert '__SERVER_SYNC_BOOT__' in html, "Server sync boot script not injected into CMS!"
assert 'school_settings' in html, "school_settings not found in boot cache!"
print("[+] Test 1 PASSED: Root URL (/) serves CMS Website with live DB boot data.")

# Test 2: ERP Home URL /Home -> Home.html
status, html_home = test_endpoint('/Home')
assert status == 200, f"/Home failed with status {status}"
assert 'auth-guard' in html_home or 'isLoggedIn' in html_home, "Auth guard not found in Home.html"
print("[+] Test 2 PASSED: /Home serves ERP System with auth protection.")

# Test 3: Advance Settings /advance -> advance.html
status, html_adv = test_endpoint('/advance')
assert status == 200, f"/advance failed with status {status}"
assert 'CMS ইন্টিগ্রেশন ও ডেটা সিঙ্ক ইঞ্জিন' in html_adv or 'School CMS Website & Data Manager' in html_adv, "CMS Sync feature missing in advance.html!"
print("[+] Test 3 PASSED: /advance contains CMS Sync & Preview Management.")

# Test 4: API Database /api/db
status, db_raw = test_endpoint('/api/db')
assert status == 200, f"/api/db failed with status {status}"
db_json = json.loads(db_raw)
assert 'school_settings' in db_json, "school_settings missing in /api/db"
assert 'school_staff' in db_json, "school_staff missing in /api/db"
assert 'school_classes' in db_json, "school_classes missing in /api/db"
print(f"[+] Test 4 PASSED: /api/db is functional (returned {len(db_json)} database keys).")

# Test 5: Server Status /api/status
status, status_raw = test_endpoint('/api/status')
assert status == 200, f"/api/status failed with status {status}"
status_json = json.loads(status_raw)
assert status_json.get('status') == 'online', "Server status is not online"
print("[+] Test 5 PASSED: /api/status reports online.")

print("="*60)
print("ALL 5 TESTS PASSED SUCCESSFULLY! SYSTEM READY.")
print("="*60)

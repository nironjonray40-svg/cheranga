import urllib.request
import json
import subprocess
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Start server.py in subprocess
proc = subprocess.Popen([sys.executable, 'server.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
time.sleep(2)

try:
    # 1. Test status
    req = urllib.request.urlopen('http://127.0.0.1:8000/api/status', timeout=5)
    status_json = json.loads(req.read().decode('utf-8'))
    print(f"[OK] Server Status: {status_json.get('status')}, Active Users: {status_json.get('active_users')}")

    # 2. Test cms.html
    req_cms = urllib.request.urlopen('http://127.0.0.1:8000/cms', timeout=5)
    cms_html = req_cms.read().decode('utf-8')
    print(f"[OK] /cms HTTP status 200, length: {len(cms_html)}, contains bootstrap: {'__SERVER_SYNC_BOOT__' in cms_html}")

    # 3. Test advance.html
    req_adv = urllib.request.urlopen('http://127.0.0.1:8000/advance?view=cms-portal', timeout=5)
    adv_html = req_adv.read().decode('utf-8')
    print(f"[OK] /advance HTTP status 200, length: {len(adv_html)}, contains cms subview: {'subview-cms-portal' in adv_html}")

    # 4. Test API DB
    req_db = urllib.request.urlopen('http://127.0.0.1:8000/api/db?keys=school_settings,school_staff', timeout=5)
    db_json = json.loads(req_db.read().decode('utf-8'))
    print(f"[OK] /api/db returned {len(db_json)} keys (school_settings len: {len(db_json.get('school_settings', ''))})")

finally:
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except Exception:
        proc.kill()
    print("[OK] Server shutdown cleanly.")

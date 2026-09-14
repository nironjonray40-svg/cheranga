import os
import sys
import subprocess
import time
import urllib.request
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Start server.py in subprocess
print("Starting server.py...")
proc = subprocess.Popen([sys.executable, 'server.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
time.sleep(1.5)

try:
    # 1. Test root /
    req = urllib.request.Request('http://127.0.0.1:8000/')
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode('utf-8', errors='replace')
        status = resp.status
        print(f"GET / -> Status {status}, Length: {len(body)}")
        print("Contains CMS title:", "অফিসিয়াল CMS পোর্টাল" in body or "আলহাজ্ব মোবারক হোসেন" in body)
        print("Contains __SERVER_SYNC_DATA__:", "__SERVER_SYNC_DATA__" in body)
        
        # Check if bootstrap contains school_settings
        if "__SERVER_SYNC_DATA__" in body:
            start = body.find("var dbData = ") + len("var dbData = ")
            end = body.find(";\n    var dbMeta")
            if start > 0 and end > start:
                data_json = body[start:end]
                try:
                    parsed = json.loads(data_json)
                    print(f"Injected bootstrap keys ({len(parsed)}):", list(parsed.keys()))
                except Exception as e:
                    print("Error parsing injected bootstrap:", e)

    # 2. Test /api/db
    with urllib.request.urlopen('http://127.0.0.1:8000/api/db') as resp:
        db_raw = resp.read().decode('utf-8')
        db_data = json.loads(db_raw)
        print(f"GET /api/db -> {len(db_data)} keys returned")

finally:
    proc.terminate()
    proc.kill()
    print("Server terminated.")

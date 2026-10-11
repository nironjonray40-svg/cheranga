import subprocess
import time
import json
import urllib.request
import urllib.error

# Launch headless Chrome with remote debugging
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome_path,
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "--no-sandbox",
    "http://127.0.0.1:8000/#results"
]

proc = subprocess.Popen(cmd)
print("Chrome launched with PID:", proc.pid)

time.sleep(3)

try:
    with urllib.request.urlopen("http://127.0.0.1:9222/json") as resp:
        targets = json.loads(resp.read().decode('utf-8'))
    print("Found targets:", len(targets))
    for t in targets:
        print("Target:", t.get('title'), t.get('url'))
        ws_url = t.get('webSocketDebuggerUrl')
        print("WebSocket URL:", ws_url)
except Exception as e:
    print("Error querying Chrome:", e)
finally:
    proc.terminate()

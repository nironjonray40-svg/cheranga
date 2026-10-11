import subprocess
import time
import json
import socket
import urllib.request
import base64
import os

def run_cdp():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    user_data = os.path.abspath("scratch/chrome_test_profile")
    cmd = [
        chrome_path,
        "--headless=new",
        "--remote-debugging-port=9222",
        f"--user-data-dir={user_data}",
        "--disable-gpu",
        "--no-sandbox",
        "about:blank"
    ]
    proc = subprocess.Popen(cmd)
    time.sleep(2)

    s = None
    try:
        with urllib.request.urlopen("http://127.0.0.1:9222/json") as resp:
            targets = json.loads(resp.read().decode('utf-8'))
        page_target = None
        for t in targets:
            if t.get('type') == 'page':
                page_target = t
                break
        if not page_target:
            print("No page target found!")
            return

        ws_url = page_target['webSocketDebuggerUrl']
        print("Connecting to:", ws_url)
        ws_path = ws_url.split("9222")[1]

        s = socket.create_connection(("127.0.0.1", 9222), timeout=10)
        sec_key = base64.b64encode(os.urandom(16)).decode('ascii')
        handshake = (
            f"GET {ws_path} HTTP/1.1\r\n"
            f"Host: 127.0.0.1:9222\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {sec_key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        s.sendall(handshake.encode('latin1'))
        resp = s.recv(4096).decode('latin1')
        if "101" not in resp:
            print("WS handshake failed:\n", resp)
            return
        print("Connected to Chrome CDP WebSocket!")

        def send_cmd(cmd_id, method, params=None):
            msg = json.dumps({"id": cmd_id, "method": method, "params": params or {}}).encode('utf-8')
            header = bytearray([0x81, 0x80 | (len(msg) if len(msg) < 126 else 126)])
            if len(msg) >= 126:
                header.extend(len(msg).to_bytes(2, 'big'))
            mask = os.urandom(4)
            header.extend(mask)
            masked_msg = bytearray(b ^ mask[i % 4] for i, b in enumerate(msg))
            s.sendall(header + masked_msg)

        send_cmd(1, "Page.enable")
        send_cmd(2, "Network.enable")
        send_cmd(3, "Runtime.enable")
        send_cmd(4, "Page.navigate", {"url": "http://127.0.0.1:8000/#results"})

        t_end = time.time() + 8
        buf = bytearray()
        requests_in_flight = {}
        
        while time.time() < t_end:
            try:
                s.settimeout(1.0)
                chunk = s.recv(65536)
                if not chunk:
                    break
                buf.extend(chunk)
                while len(buf) >= 2:
                    payload_len = buf[1] & 0x7f
                    offset = 2
                    if payload_len == 126:
                        if len(buf) < 4:
                            break
                        payload_len = int.from_bytes(buf[2:4], 'big')
                        offset = 4
                    elif payload_len == 127:
                        if len(buf) < 10:
                            break
                        payload_len = int.from_bytes(buf[2:10], 'big')
                        offset = 10
                    if len(buf) < offset + payload_len:
                        break
                    frame_data = buf[offset:offset+payload_len]
                    buf = buf[offset+payload_len:]
                    try:
                        text = frame_data.decode('utf-8', errors='replace')
                        ev = json.loads(text)
                        method = ev.get('method', '')
                        params = ev.get('params', {})
                        if method == 'Network.requestWillBeSent':
                            req_id = params.get('requestId')
                            req_url = params.get('request', {}).get('url', '')
                            requests_in_flight[req_id] = req_url
                            print(f"[REQ] {req_url[:90]}")
                        elif method == 'Network.responseReceived':
                            resp_url = params.get('response', {}).get('url', '')
                            status = params.get('response', {}).get('status')
                            mime = params.get('response', {}).get('mimeType')
                            print(f"  [RESP {status}] {mime} -> {resp_url[:80]}")
                        elif method == 'Network.loadingFinished':
                            req_id = params.get('requestId')
                            if req_id in requests_in_flight:
                                del requests_in_flight[req_id]
                        elif method == 'Network.loadingFailed':
                            req_id = params.get('requestId')
                            err = params.get('errorText')
                            url = requests_in_flight.pop(req_id, 'unknown')
                            print(f"  [FAILED] {url[:80]} -> {err}")
                        elif method == 'Page.loadEventFired':
                            print(">>> PAGE LOAD EVENT FIRED! (Browser tab spinner stops!) <<<")
                        elif method == 'Page.domContentEventFired':
                            print(">>> DOM Content Loaded <<<")
                        elif method == 'Runtime.consoleAPICalled':
                            args = [a.get('value', str(a)) for a in params.get('args', [])]
                            print(f"[CONSOLE] {' '.join(str(x) for x in args)[:100]}")
                    except Exception as e:
                        pass
            except socket.timeout:
                pass

        print(f"\nRemaining pending requests in flight: {len(requests_in_flight)}")
        for r_id, r_u in requests_in_flight.items():
            print(f"  PENDING: {r_u}")

    finally:
        if s:
            s.close()
        proc.terminate()

if __name__ == '__main__':
    run_cdp()

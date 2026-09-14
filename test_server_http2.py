import asyncio
import os
import sys
import time
import httpx
import socket

PORT = 8000

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

async def run_full_suite():
    local_ip = get_local_ip()
    print("==========================================================")
    print("   STARTING SMART DUAL-PROTOCOL (HTTP + HTTPS) TESTS      ")
    print("==========================================================")
    print(f"Local LAN IP: {local_ip}")

    async with httpx.AsyncClient(verify=False) as client:
        # Test 1: Both HTTP and HTTPS Handshake & DB Meta API
        print("\n[TEST 1] Testing Dual-Protocol Handshake across all endpoints...")
        test_endpoints = [
            f"http://127.0.0.1:{PORT}/api/db/meta",
            f"https://127.0.0.1:{PORT}/api/db/meta",
            f"http://localhost:{PORT}/api/db/meta",
            f"https://localhost:{PORT}/api/db/meta",
            f"http://{local_ip}:{PORT}/api/db/meta",
            f"https://{local_ip}:{PORT}/api/db/meta",
        ]
        
        for url in test_endpoints:
            r = await client.get(url, timeout=3)
            print(f"  --> [{r.status_code} OK] {url} (HTTP Version: {r.http_version})")
            assert r.status_code == 200
        print("  [PASS] Successfully connected to BOTH Plain HTTP and Secure HTTPS!")

        # Test 2: API Operations over HTTP and HTTPS
        print("\n[TEST 2] Testing Database API Endpoints over HTTP & HTTPS...")
        test_key = "test_dual_key"
        test_val = f"school_val_{int(time.time()*1000)}"
        
        # Set via HTTP
        r_set = await client.post(f"http://127.0.0.1:{PORT}/api/db/set", json={"key": test_key, "value": test_val})
        assert r_set.status_code == 200 and r_set.json().get("status") == "success"
        print(f"  --> POST (HTTP) /api/db/set: {r_set.json()}")

        # Get via HTTPS
        r_get = await client.get(f"https://127.0.0.1:{PORT}/api/db?keys={test_key}")
        assert r_get.status_code == 200 and r_get.json().get(test_key) == test_val
        print(f"  --> GET (HTTPS) /api/db: {r_get.json()}")

        # Delete via HTTP
        r_del = await client.post(f"http://127.0.0.1:{PORT}/api/db/delete", json={"key": test_key})
        assert r_del.status_code == 200 and r_del.json().get("status") == "success"
        print(f"  --> POST (HTTP) /api/db/delete: {r_del.json()}")
        print("  [PASS] All Database API endpoints verified working on both protocols!")

        # Test 3: Static File Serving & HTML Sync Boot Injection
        print("\n[TEST 3] Testing Static Assets on LAN IP...")
        r_home = await client.get(f"http://{local_ip}:{PORT}/")
        assert r_home.status_code == 200
        assert "__SERVER_SYNC_BOOT__" in r_home.text
        assert "__SERVER_SYNC_DATA__" in r_home.text
        print(f"  --> Served Home.html on http://{local_ip}:{PORT}/: Verified")

        r_css = await client.get(f"https://{local_ip}:{PORT}/style.css")
        assert r_css.status_code == 200
        assert "text/css" in r_css.headers.get("content-type", "")
        print(f"  --> Served style.css on https://{local_ip}:{PORT}/style.css: Verified")

        r_js = await client.get(f"http://{local_ip}:{PORT}/main.js")
        assert r_js.status_code == 200
        assert "application/javascript" in r_js.headers.get("content-type", "")

        r_ico = await client.get(f"http://{local_ip}:{PORT}/favicon.ico")
        assert r_ico.status_code == 200
        assert "image/" in r_ico.headers.get("content-type", "")
        print("  [PASS] Static assets and HTML boot script injection verified on LAN IP!")

        # Test 4: Concurrent Requests across HTTP and HTTPS
        print("\n[TEST 4] Testing Concurrent Request Benchmark (Mixed HTTP/HTTPS)...")
        start_t = time.perf_counter()
        req_urls = [
            f"http://127.0.0.1:{PORT}/",
            f"https://127.0.0.1:{PORT}/",
            f"http://{local_ip}:{PORT}/student-portal",
            f"https://{local_ip}:{PORT}/student-portal",
            f"http://localhost:{PORT}/advance",
            f"https://localhost:{PORT}/advance",
            f"http://{local_ip}:{PORT}/exam-portal",
            f"https://{local_ip}:{PORT}/exam-portal",
            f"http://{local_ip}:{PORT}/seat-plan",
            f"https://{local_ip}:{PORT}/seat-plan",
            f"http://{local_ip}:{PORT}/style.css",
            f"https://{local_ip}:{PORT}/style.css",
            f"http://{local_ip}:{PORT}/main.js",
            f"https://{local_ip}:{PORT}/main.js",
            f"http://127.0.0.1:{PORT}/api/db/meta",
            f"https://127.0.0.1:{PORT}/api/db/meta",
        ]
        tasks = [client.get(u) for u in req_urls]
        responses = await asyncio.gather(*tasks)
        elapsed_ms = (time.perf_counter() - start_t) * 1000
        
        all_ok = all(resp.status_code == 200 for resp in responses)
        print(f"  --> Processed {len(responses)} mixed HTTP/HTTPS requests in parallel!")
        print(f"  --> Time taken: {elapsed_ms:.2f} ms")
        print(f"  --> All {len(responses)} responses 200 OK: {all_ok}")
        # Test 5: Status, Health & Activity Logs Endpoints
        print("\n[TEST 5] Testing /api/status, /api/health & /api/activity-logs...")
        r_status = await client.get(f"http://127.0.0.1:{PORT}/api/status")
        assert r_status.status_code == 200 and r_status.json().get("status") == "online"
        print(f"  --> GET (HTTP) /api/status: {r_status.json().get('status')} | Version: {r_status.json().get('version')}")

        r_status_s = await client.get(f"https://127.0.0.1:{PORT}/api/status")
        assert r_status_s.status_code == 200 and r_status_s.json().get("status") == "online"
        print(f"  --> GET (HTTPS) /api/status: {r_status_s.json().get('status')}")

        r_health = await client.get(f"http://127.0.0.1:{PORT}/api/health")
        assert r_health.status_code == 200 and r_health.json().get("status") == "online"

        r_log_post = await client.post(f"http://127.0.0.1:{PORT}/api/activity-logs/add", json={
            "user_name": "টেস্ট ইউজার",
            "role": "এডমিন",
            "module": "সার্ভার টেস্ট",
            "action": "টেস্ট ভেরিফিকেশন",
            "details": "API endpoint test"
        })
        assert r_log_post.status_code == 200 and r_log_post.json().get("status") == "success"
        print(f"  --> POST (HTTP) /api/activity-logs/add: {r_log_post.json()}")

        r_logs = await client.get(f"https://127.0.0.1:{PORT}/api/activity-logs")
        assert r_logs.status_code == 200 and "logs" in r_logs.json()
        print(f"  --> GET (HTTPS) /api/activity-logs: Found {len(r_logs.json().get('logs', []))} log entries")

        r_opt = await client.options(f"http://127.0.0.1:{PORT}/api/status")
        assert r_opt.status_code == 200
        print("  --> OPTIONS CORS preflight: 200 OK")
        print("  [PASS] Status & Activity Logs API endpoints verified!")

    print("\n==========================================================")
    print("  ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY (100%)    ")
    print("==========================================================")

if __name__ == '__main__':
    asyncio.run(run_full_suite())

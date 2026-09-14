import urllib.request
import urllib.error

urls = [
    'http://localhost:8000/seat-plan',
    'http://localhost:8000/seat-plan?view=seating-details',
    'http://localhost:8000/Seating%20arrangement%20details.html',
    'http://localhost:8000/index.html',
    'http://localhost:8000/Home.html'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'TestClient'})
        with urllib.request.urlopen(req, timeout=5) as res:
            data = res.read()
            print(f"[OK {res.status}] {u} -> size: {len(data)} bytes")
    except Exception as e:
        print(f"[ERR] {u} -> {e}")

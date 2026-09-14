import urllib.request

urls = [
    'http://localhost:8000/seat-plan',
    'http://localhost:8000/Student%20Data%20Topsheet.html'
]

for u in urls:
    req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            print(f"URL: {u}")
            print(f"Status: {resp.status}")
            print(f"Length: {len(content)}")
            print("Contains subview-student-data-topsheet:", 'subview-student-data-topsheet' in content)
            print("Contains topsheet-render-container:", 'topsheet-render-container' in content)
            print("---")
    except Exception as e:
        print(f"Error fetching {u}: {e}")


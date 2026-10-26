import urllib.request

for path in ['Marksheet.html', 'Marksheet1.html']:
    url = f'http://localhost:8000/{path}'
    try:
        req = urllib.request.urlopen(url)
        content = req.read().decode('utf-8')
        has_fe = 'id="filter-exam"' in content
        has_fc = 'id="filter-class"' in content
        has_sync = 'function syncCascadingFilters' in content
        has_get_exams = 'function getAllExams' in content
        has_get_classes = 'function getClassesForExam' in content
        print(f"{url}: Status {req.status}, Length: {len(content)}")
        print(f"  filter-exam: {has_fe}, filter-class: {has_fc}")
        print(f"  syncCascadingFilters: {has_sync}, getAllExams: {has_get_exams}, getClassesForExam: {has_get_classes}")
    except Exception as e:
        print(f"{url}: ERROR: {e}")

import urllib.request

def test_portal():
    url = 'http://localhost:8080/exam-portal?view=omr-reader'
    resp = urllib.request.urlopen(url)
    html = resp.read().decode('utf-8', errors='ignore')
    
    checks = [
        'id="btnImportExam"',
        'id="btnImportExamTop"',
        'id="modalImportExam"',
        'id="inputImportExamSearch"',
        'id="importExamListContainer"',
        'window.openImportExamModal',
        'window.selectAndImportExam',
        'window.formatClassBangla',
        'window.mapClassToNumber'
    ]
    
    for c in checks:
        if c not in html:
            print(f"FAILED check: {c}")
            return False
        else:
            print(f"PASSED check: {c}")
            
    print("\nALL SERVER CHECKS PASSED SUCCESSFULLY!")
    return True

if __name__ == '__main__':
    test_portal()

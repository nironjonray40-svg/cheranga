import glob, re

files = ['seat-plan.html', 'Home.html', 'index.html', 'exam-portal.html', 'notice-board.html', 'student-portal.html', 'staff.html', 'result-portal.html', 'Money Collect.html', 'advance.html', 'contact.html', 'fees.html', 'others.html', 'Tabulation Sheet.html', 'Marksheet.html', 'Marksheet1.html', 'Teacher Report.html']

for fn in files:
    try:
        with open(fn, 'r', encoding='utf-8', errors='ignore') as f:
            c = f.read()
        
        # find dropdown for seat-plan
        m = re.search(r'(<li[^>]*class=[\'"][^\'"]*dropdown[^\'"]*[\'"][^>]*>.*?seat-plan.*?</ul>\s*</li>)', c, re.DOTALL | re.I)
        if not m:
            m = re.search(r'(<ul[^>]*class=[\'"][^\'"]*dropdown[^\'"]*[\'"][^>]*>.*?seat-plan.*?</ul>)', c, re.DOTALL | re.I)
        
        if m:
            print(f"=== {fn} Dropdown ===")
            print(m.group(0)[:600])
        else:
            print(f"=== {fn} === No seat dropdown found")
    except Exception as e:
        print(f"Error {fn}: {e}")


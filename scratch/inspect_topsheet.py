import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def analyze():
    with open('Student Data Topsheet.html', 'r', encoding='utf-8', errors='ignore') as f:
        sdt = f.read()
    
    with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
        sp = f.read()
        
    print(f"Student Data Topsheet length: {len(sdt)}")
    print(f"seat-plan.html length: {len(sp)}")
    
    print("\n--- Student Data Topsheet Title & Headings ---")
    print("Title:", re.findall(r'<title>(.*?)</title>', sdt, re.I))
    
    # Check buttons in SDT
    print("\nButtons in SDT:")
    for b in re.findall(r'<button[^>]*>.*?</button>', sdt, re.I | re.DOTALL)[:10]:
        print(" ", b.strip().replace('\n', ' '))
        
    # Check divs with id in SDT
    print("\nDivs with ID in SDT:")
    for d in re.findall(r'<div[^>]*id=["\']([^"\']+)["\']', sdt, re.I):
        print(" ", d)

    print("\nTabs in seat-plan.html:")
    for tab in re.findall(r'<button[^>]*class=["\'][^"\']*tab[^"\']*["\'][^>]*>.*?</button>', sp, re.I | re.DOTALL):
        print(" ", tab.strip().replace('\n', ' '))

    print("\nAll tab buttons in seat-plan.html:")
    for tab in re.findall(r'<button[^>]*onclick=["\'][^"\']*switchTab[^"\']*["\'][^>]*>.*?</button>', sp, re.I | re.DOTALL):
        print(" ", tab.strip().replace('\n', ' '))

if __name__ == '__main__':
    analyze()

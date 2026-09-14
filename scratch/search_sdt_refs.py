import os, glob, re

files = glob.glob('*.html') + glob.glob('*.js')

print("Searching references in project files:")
for fpath in files:
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    matches_sdt = re.findall(r'Student\s+Data\s+Topsheet|student-data-topsheet|Student Data Topsheet Preview Window|topsheet-render-container', content, re.I)
    if matches_sdt:
        print(f"File {fpath}: found {len(matches_sdt)} matches -> {set(matches_sdt)}")


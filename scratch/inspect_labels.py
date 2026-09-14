import sys, re

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['Student Data Topsheet.html', 'seat-plan.html']:
    with open(fname, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    print(f"=== Matches in {fname} ===")
    
    # Check class mappings
    class_map_matches = re.findall(r"['\"]class 7['\"]\s*:\s*\{[^}]*\}", content)
    print("Class 7 maps:", class_map_matches)
    
    # Check 7ম শ্রেণি
    s_matches = re.findall(r'.{0,40}৭ম শ্রেণি.{0,40}', content)
    print(f"৭ম শ্রেণি occurrences ({len(s_matches)}):")
    for sm in s_matches[:5]:
        print("  ", sm.strip())

    # Check মহিলা / পুরুষ
    g_matches = re.findall(r'.{0,30}(?:মহিলা|পুরুষ).{0,30}', content)
    print(f"মহিলা/পুরুষ occurrences ({len(g_matches)}):")
    for gm in g_matches[:10]:
        print("  ", gm.strip())


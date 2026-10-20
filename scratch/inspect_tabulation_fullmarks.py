import sys, re

with open('Tabulation Sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

with open('scratch/tabulation_code_inspection.txt', 'w', encoding='utf-8') as out:
    # 1. Look for recalculateTableGradesAndRanks
    m = re.search(r'function recalculateTableGradesAndRanks[\s\S]*?(?=function\s+[a-zA-Z0-9_]+\s*\(|</script>)', content)
    if m:
        out.write("=== recalculateTableGradesAndRanks ===\n")
        out.write(m.group(0)[:4000])
        out.write("\n\n")

    # 2. Look for populateStudentMarksFromDatabase
    m2 = re.search(r'function populateStudentMarksFromDatabase[\s\S]*?(?=function\s+[a-zA-Z0-9_]+\s*\(|</script>)', content)
    if m2:
        out.write("=== populateStudentMarksFromDatabase ===\n")
        out.write(m2.group(0)[:4000])
        out.write("\n\n")

    # 3. Look for applyTableSettings
    m3 = re.search(r'function applyTableSettings[\s\S]*?(?=function\s+[a-zA-Z0-9_]+\s*\(|</script>)', content)
    if m3:
        out.write("=== applyTableSettings ===\n")
        out.write(m3.group(0)[:4000])
        out.write("\n\n")

print("Inspection written to scratch/tabulation_code_inspection.txt")

with open('Marksheet1.html.bak', 'r', encoding='utf-8') as f:
    text = f.read()

start_m = "function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {"
start_idx = text.find(start_m)

# Find where renderMarksheet1Table ends
end_table = text.find("function isExamMatch(target, selected) {", start_idx)
print(f"renderMarksheet1Table length: {end_table - start_idx}")

# Find where renderBatchMarksheets1 is
batch_idx = text.find("function renderBatchMarksheets1(selectedClass, selectedSection, exam) {")
print(f"batch_idx: {batch_idx}")

# The functions in between
between = text[end_table:batch_idx]
print(f"Length between table and batch: {len(between)}")

with open('scratch/m1_between.js', 'w', encoding='utf-8') as out:
    out.write(between)

print("Saved scratch/m1_between.js")

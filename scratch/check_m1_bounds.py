with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    text = f.read()

start_m = "function renderMarksheet1Table(selectedClass, selectedSection, student, exam) {"
end_m = "function updateMarksheetExam(val) {"

start_idx = text.find(start_m)
end_idx = text.find(end_m)

print(f"start_idx: {start_idx}, end_idx: {end_idx}")
print("Between lines:")
snippet = text[start_idx:start_idx+300]
print(snippet)
print("--- END SNIPPET ---")
snippet_end = text[end_idx-300:end_idx]
print(snippet_end)

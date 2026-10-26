with open('Marksheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

print('loadMarkingSystem:', 'function loadMarkingSystem()' in content)
print('renderMarksheetTable:', 'function renderMarksheetTable(' in content)
print('generateMarksheetCardHTML:', 'function generateMarksheetCardHTML(' in content)
print('storage listener:', "window.addEventListener('storage'" in content)

with open('Marksheet1.html', 'r', encoding='utf-8') as f:
    content1 = f.read()

print('Marksheet1 loadMarkingSystem:', 'function loadMarkingSystem()' in content1)
print('Marksheet1 renderMarksheet1Table:', 'function renderMarksheet1Table(' in content1)
print('Marksheet1 generateMarksheet1CardHTML:', 'function generateMarksheet1CardHTML(' in content1)

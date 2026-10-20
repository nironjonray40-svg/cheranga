import re
with open('Tabulation Sheet.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

print('getSubjectMarksDistribution:', 'getSubjectMarksDistribution' in html)
print('updateDynamicSubjectMarksAndHeaders:', 'updateDynamicSubjectMarksAndHeaders' in html)
print('syncLiveTabulationDbData:', 'syncLiveTabulationDbData' in html)

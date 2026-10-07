with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\scratch\omr_body.html', 'r', encoding='utf-8') as f:
    text = f.read()

for el in ['btnSaveEdit', 'btnCancelEdit', 'btnSaveAnswerKeys']:
    print(el, 'in omr_body.html:', el in text)

with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html', 'r', encoding='utf-8') as f:
    ep = f.read()

for el in ['btnSaveEdit', 'btnCancelEdit', 'btnSaveAnswerKeys']:
    print(el, 'in exam-portal.html:', el in ep)

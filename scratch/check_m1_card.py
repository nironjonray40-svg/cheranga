with open('scratch/m1_between.js', 'r', encoding='utf-8') as f:
    text = f.read()

card_start = text.find("function generateMarksheet1CardHTML(student, selectedClass, selectedSection, exam, rankNum) {")
print("card_start:", card_start)
print(text[card_start:card_start+1500])

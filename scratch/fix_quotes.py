with open('seat-plan.html', 'r', encoding='utf-8') as f:
    sp = f.read()

sp = sp.replace(r"\'student-data-topsheet\'", "'student-data-topsheet'")
sp = sp.replace(r"\'student_data_topsheet\'", "'student_data_topsheet'")
sp = sp.replace(r"\'student-topsheet\'", "'student-topsheet'")
sp = sp.replace(r"\'topsheet\'", "'topsheet'")

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(sp)

print("Fixed quotes in seat-plan.html.")

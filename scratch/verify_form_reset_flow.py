import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('cms.html', 'r', encoding='utf-8') as f:
    content = f.read()

checks = [
    ("clearAdmissionForm function definition", "function clearAdmissionForm() {" in content),
    ("showAdmissionFormView function with clearForm parameter", "function showAdmissionFormView(clearForm = false) {" in content),
    ("resetAdmissionFormInputs calling clearAdmissionForm", "clearAdmissionForm();" in content and "function resetAdmissionFormInputs()" in content),
    ("handleAdmissionSubmit calling clearAdmissionForm", "clearAdmissionForm();" in content and "function handleAdmissionSubmit(e)" in content),
    ("Voucher button calling showAdmissionFormView(true)", 'onclick="showAdmissionFormView(true)"' in content),
    ("Remove photo handler inside clearAdmissionForm", "removeAdmissionPhoto();" in content),
    ("handleAdmClassChange inside clearAdmissionForm", "handleAdmClassChange('');" in content),
    ("Division resets inside clearAdmissionForm", "handleDivisionChange('Pres', '');" in content and "handleDivisionChange('Perm', '');" in content),
]

all_passed = True
for name, passed in checks:
    status = "PASSED" if passed else "FAILED"
    print(f"[{status}] {name}")
    if not passed:
        all_passed = False

if all_passed:
    print("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED.")
    sys.exit(1)

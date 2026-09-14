import sys

with open('cms.html', 'r', encoding='utf-8') as f:
    content = f.read()

required_ids = [
    'admTargetClass', 'admSession', 'admShift', 'admGroup', 'admOptionalSubject', 'admMedium', 'admAppType',
    'admNameBn', 'admNameEn', 'admBirthReg', 'admDob', 'admGender', 'admReligion', 'admBloodGroup', 'admNationality', 'admDisability',
    'admPhotoInput', 'admPhotoPreviewBox', 'admPhotoImgPreview', 'admPhotoPlaceholder', 'admPhotoRemoveBtn',
    'admFatherBn', 'admFatherEn', 'admFatherNid', 'admFatherJob', 'admFatherPhone',
    'admMotherBn', 'admMotherEn', 'admMotherNid', 'admMotherJob', 'admMotherPhone',
    'admFamilyIncome',
    'admGuardianType', 'admGuardianName', 'admGuardianRelation', 'admGuardianNid', 'admGuardianPhone', 'admGuardianEmail',
    'admPresDivision', 'admPresDistrict', 'admPresUpazila', 'admPresUnion', 'admPresPost', 'admPresVillage',
    'admSameAddressCheckbox',
    'admPermDivision', 'admPermDistrict', 'admPermUpazila', 'admPermUnion', 'admPermPost', 'admPermVillage',
    'admPrevSchool', 'admPrevClassRoll', 'admPrevYear', 'admPrevGpa', 'admPrevTc',
    'admAgreementCheckbox'
]

missing = [i for i in required_ids if f'id="{i}"' not in content]
if missing:
    print(f"FAILED: Missing IDs: {missing}")
    sys.exit(1)
else:
    print(f"SUCCESS: All {len(required_ids)} required form field IDs are present!")

# Check that Quota section 7 is completely gone from form
if 'id="admQuota"' in content:
    print("WARNING: admQuota found in DOM")
else:
    print("SUCCESS: Section 7 (Quota) is confirmed removed from form!")

# Check functions
functions = [
    'function handleAdmissionSubmit',
    'function handleGuardianTypeChange',
    'function previewAdmissionPhoto',
    'function removeAdmissionPhoto',
    'function handleAdmClassChange',
    'function handleAdmGroupChange',
    'function initAdmissionGeoDropdowns',
    'function handleDivisionChange',
    'function handleDistrictChange',
    'function handleUpazilaChange',
    'function toggleSameAddress'
]

missing_funcs = [fn for fn in functions if fn not in content]
if missing_funcs:
    print(f"FAILED: Missing functions: {missing_funcs}")
    sys.exit(1)
else:
    print(f"SUCCESS: All {len(functions)} core admission functions are present!")

print("ALL ADMISSION FORM VERIFICATIONS PASSED!")

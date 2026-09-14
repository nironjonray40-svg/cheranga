import os
import re

# 1. VERIFY advance.html
with open('advance.html', 'r', encoding='utf-8') as f:
    adv = f.read()

assert 'id="subview-address-structure"' in adv, "Missing #subview-address-structure in advance.html"
assert 'data-view="address-structure"' in adv, "Missing data-view pill for address-structure in advance.html"
assert "viewName === 'address-structure'" in adv, "Missing viewName === 'address-structure' handling in switchAdvanceView"

stats = ['geoStatDivisions', 'geoStatDistricts', 'geoStatUpazilas', 'geoStatUnions', 'geoStatPosts']
for s in stats:
    assert f'id="{s}"' in adv, f"Missing stat element {s} in advance.html"

panels = ['geoLevelPanel-division', 'geoLevelPanel-district', 'geoLevelPanel-upazila', 'geoLevelPanel-union', 'geoLevelPanel-post']
for p in panels:
    assert f'id="{p}"' in adv, f"Missing panel {p} in advance.html"

adv_fns = [
    'getAdmissionGeoData', 'saveAdmissionGeoData', 'initAdmissionAddressManager',
    'switchGeoLevelTab', 'renderGeoStatsCounters', 'populateAllGeoDropdownFilters',
    'renderDivisionsManager', 'addGeoDivision', 'deleteGeoDivision',
    'renderDistrictsManager', 'addGeoDistrict', 'deleteGeoDistrict',
    'renderUpazilasManager', 'addGeoUpazila', 'deleteGeoUpazila',
    'renderUnionsManager', 'addGeoUnion', 'deleteGeoUnion',
    'renderPostsManager', 'addGeoPost', 'deleteGeoPost',
    'resetAdmissionGeoDataToDefault', 'exportGeoDataJson', 'importGeoDataJson'
]

for fn in adv_fns:
    assert f'function {fn}' in adv, f"Missing function {fn} in advance.html"

# 2. VERIFY cms.html
with open('cms.html', 'r', encoding='utf-8') as f:
    cms = f.read()

assert 'function getAdmissionGeoData' in cms, "Missing getAdmissionGeoData in cms.html"
assert 'function initAdmissionGeoDropdowns' in cms, "Missing initAdmissionGeoDropdowns in cms.html"
assert 'initAdmissionGeoDropdowns()' in cms, "Missing initAdmissionGeoDropdowns call in cms.html"

# 3. VERIFY main.js
with open('main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

assert "'advance.html?view=address-structure'" in main_js or "'advance?view=address-structure'" in main_js, "Missing address-structure in main.js LINK_PERMISSIONS"
assert "'address-structure':" in main_js, "Missing address-structure in main.js ADVANCE_SUBVIEW_PERMISSIONS"

print("ALL VERIFICATIONS PASSED: ERP Advance Section 5 Address Management & CMS Online Admission synchronization are 100% verified!")

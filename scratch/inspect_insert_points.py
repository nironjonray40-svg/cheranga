import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('seat-plan.html', 'r', encoding='utf-8', errors='ignore') as f:
    sp = f.read()

print("File length:", len(sp))

# 1. CSS insertion point: find end of style tag
css_end = sp.find('</style>')
print("CSS end position:", css_end)

# 2. Tab button insertion point: find student-attendance tab
tab_pos = sp.find('id="btn-tab-student-attendance"')
print("Tab button position:", tab_pos)
if tab_pos != -1:
    print("Tab snippet:\n", sp[tab_pos-50:tab_pos+300])

# 3. Navbar dropdown insertion point: find student-attendance in navbar
nav_pos = sp.find('seat-plan?view=student-attendance')
print("Nav position:", nav_pos)
if nav_pos != -1:
    print("Nav snippet:\n", sp[nav_pos-100:nav_pos+200])

# 4. Subview insertion point: find subview-student-attendance
subview_pos = sp.find('id="subview-student-attendance"')
print("Subview position:", subview_pos)
if subview_pos != -1:
    # find next subview or comment
    next_sub = sp.find('<div id="subview-', subview_pos + 40)
    print("Next subview position:", next_sub)
    print("Next subview snippet:\n", sp[next_sub-100:next_sub+200])

# 5. JS insertion point: find switchSeatTab and end of script
switch_pos = sp.find('function switchSeatTab')
print("switchSeatTab position:", switch_pos)


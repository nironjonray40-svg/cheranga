with open('seat-plan.html', 'r', encoding='utf-8') as f:
    c = f.read()

for fn in ['loadSavedPlanEntry', 'deleteSavedPlanEntry', 'deleteAllSavedSeatPlans']:
    idx = c.find(f'function {fn}')
    if idx != -1:
        print(f"=== {fn} ===")
        print(c[idx:idx+500])

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Check deleteSavedSeatPlan
if 'function deleteSavedSeatPlan' in c:
    idx = c.find('function deleteSavedSeatPlan')
    print("deleteSavedSeatPlan snippet:")
    print(c[idx:idx+800])

# Check clearAllSavedSeatPlans
if 'function clearAllSavedSeatPlans' in c:
    idx = c.find('function clearAllSavedSeatPlans')
    print("clearAllSavedSeatPlans snippet:")
    print(c[idx:idx+800])

with open('seat-plan.html', 'r', encoding='utf-8') as f:
    c = f.read()

target = '            tbody.innerHTML = html;\n        }'
replacement = '''            tbody.innerHTML = html;
            if (typeof refreshSeatingDetailsData === 'function') {
                refreshSeatingDetailsData();
            }
        }'''

if 'refreshSeatingDetailsData();\n        }' not in c:
    c = c.replace(target, replacement)
    with open('seat-plan.html', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Added refreshSeatingDetailsData hook inside renderSavedSeatPlansTable.")
else:
    print("Already present.")

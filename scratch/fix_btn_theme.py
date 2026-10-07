with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''    // Theme Toggle
    btnThemeToggle.addEventListener('click', () => {'''

replacement = '''    // Theme Toggle
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', () => {'''

if target in text:
    # Also need to close the if statement
    end_target = '''        btnThemeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
      }
    });'''
    end_replacement = '''        btnThemeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
      }
      });
    }'''
    text = text.replace(target, replacement, 1)
    text = text.replace(end_target, end_replacement, 1)
    with open(r'c:\Users\niron\OneDrive\Desktop\Cheranga\exam-portal.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Safely guarded btnThemeToggle!")
else:
    print("Target not found or already guarded")

import os
import re

def update_file(filename, old_str, new_str):
    if not os.path.exists(filename):
        print(f"File {filename} does not exist!")
        return False
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str not in content:
        print(f"Target string not found in {filename}!")
        return False
    new_content = content.replace(old_str, new_str)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully updated {filename}")
    return True

print("Applying changes...")

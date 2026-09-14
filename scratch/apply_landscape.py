# -*- coding: utf-8 -*-
import sys, re

sys.stdout.reconfigure(encoding='utf-8')

print("Applying Landscape Orientation for Student Data Topsheet...")

# -------------------------------------------------------------
# 1. UPDATE seat-plan.html
# -------------------------------------------------------------
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    sp = f.read()

# Update printStudentDataTopsheet function
old_print_func = """        function printStudentDataTopsheet() {
            document.body.classList.add('print-student-data-topsheet-mode');
            window.print();
            setTimeout(() => {
                document.body.classList.remove('print-student-data-topsheet-mode');
            }, 1000);
        }"""

new_print_func = """        function printStudentDataTopsheet() {
            let printStyle = document.getElementById('sdt-dynamic-print-style');
            if (!printStyle) {
                printStyle = document.createElement('style');
                printStyle.id = 'sdt-dynamic-print-style';
                document.head.appendChild(printStyle);
            }
            printStyle.innerHTML = `
                @page {
                    size: A4 landscape !important;
                    margin: 0.3in !important;
                }
            `;
            document.body.classList.add('print-student-data-topsheet-mode');
            window.print();
            setTimeout(() => {
                document.body.classList.remove('print-student-data-topsheet-mode');
                if (printStyle && printStyle.parentNode) {
                    printStyle.parentNode.removeChild(printStyle);
                }
            }, 1500);
        }

        // Automatic Landscape orientation for Ctrl+P while on Student Data Topsheet tab
        window.addEventListener('beforeprint', () => {
            const sdtView = document.getElementById('subview-student-data-topsheet');
            if (sdtView && sdtView.classList.contains('active')) {
                document.body.classList.add('print-student-data-topsheet-mode');
                let printStyle = document.getElementById('sdt-dynamic-print-style');
                if (!printStyle) {
                    printStyle = document.createElement('style');
                    printStyle.id = 'sdt-dynamic-print-style';
                    document.head.appendChild(printStyle);
                }
                printStyle.innerHTML = `
                    @page {
                        size: A4 landscape !important;
                        margin: 0.3in !important;
                    }
                `;
            }
        });

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('print-student-data-topsheet-mode');
            const printStyle = document.getElementById('sdt-dynamic-print-style');
            if (printStyle && printStyle.parentNode) {
                printStyle.parentNode.removeChild(printStyle);
            }
        });"""

if old_print_func in sp:
    sp = sp.replace(old_print_func, new_print_func)
    print("✓ Updated printStudentDataTopsheet with dynamic landscape @page style.")
else:
    print("Warning: old_print_func not matched exactly, using regex...")
    sp = re.sub(
        r'function\s+printStudentDataTopsheet\s*\(\)\s*\{[\s\S]*?setTimeout\([^}]*\}, 1000\);\s*\}',
        new_print_func.strip(),
        sp
    )

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(sp)

# -------------------------------------------------------------
# 2. UPDATE Student Data Topsheet.html
# -------------------------------------------------------------
with open('Student Data Topsheet.html', 'r', encoding='utf-8') as f:
    sdt = f.read()

# Ensure @page size: A4 landscape is enforced
if '@page' in sdt:
    sdt = re.sub(
        r'@page\s*\{[^}]*\}',
        '@page {\n            size: A4 landscape !important;\n            margin: 0.3in !important;\n        }',
        sdt
    )

with open('Student Data Topsheet.html', 'w', encoding='utf-8') as f:
    f.write(sdt)

print("Landscape orientation applied successfully!")

import glob, re

for f in sorted(glob.glob('*.html')):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    
    orig = content
    # Replace <li class="nav-item dropdown..." data-tab="seat-plan">\n<a href="...">Seat Plan</a>
    # Specifically ensuring it targets exam-routine
    if f == 'seat-plan.html':
        content = re.sub(
            r'<li\s+class="nav-item dropdown active"\s+data-tab="seat-plan">\s*<a\s+href="[^"]*"\s+onclick="[^"]*">Seat Plan</a>',
            '<li class="nav-item dropdown active" data-tab="seat-plan">\n                    <a href="seat-plan?view=exam-routine" onclick="switchSeatTab(\'exam-routine\'); return false;">Seat Plan</a>',
            content
        )
    elif f in ['index.html', 'Home.html', 'notice-board.html']:
        content = re.sub(
            r'<li\s+class="nav-item dropdown"\s+data-tab="seat-plan">\s*<a\s+href="[^"]*">Seat Plan</a>',
            '<li class="nav-item dropdown" data-tab="seat-plan">\n                    <a href="seat-plan.html?view=exam-routine">Seat Plan</a>',
            content
        )
    else:
        content = re.sub(
            r'<li\s+class="nav-item dropdown"\s+data-tab="seat-plan">\s*<a\s+href="[^"]*">Seat Plan</a>',
            '<li class="nav-item dropdown" data-tab="seat-plan">\n                    <a href="seat-plan?view=exam-routine">Seat Plan</a>',
            content
        )
    
    if content != orig:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f"Updated {f}")
    else:
        print(f"No change needed in {f}")

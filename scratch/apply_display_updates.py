import re

def update_displays(file_path, is_marksheet1=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    blank_symbol = "'<span class=\"blank-field\">—</span>'" if is_marksheet1 else "'—'"

    # 1. Update paired subject displays in renderMarksheetTable / renderMarksheet1Table
    # Pattern to match p1McqDisplay ... p2TotDisplay
    paired_pattern = re.compile(
        r"const p1McqDisplay = sub\.mcq !== '' \? \(sub\.mcq === 'A' \? 'A' : toBnDigits\(sub\.mcq\)\) : [^;]+;\s*"
        r"const p1CqDisplay = sub\.cq !== '' \? \(sub\.cq === 'A' \? 'A' : toBnDigits\(sub\.cq\)\) : [^;]+;\s*"
        r"const p1PrDisplay = sub\.pr !== '' \? \(sub\.pr === 'A' \? 'A' : toBnDigits\(sub\.pr\)\) : [^;]+;\s*"
        r"const p1TotDisplay = sub\.hasMarks \? toBnDigits\(m1\) : [^;]+;\s*"
        r"const p2McqDisplay = sub\.pairMcq !== '' \? \(sub\.pairMcq === 'A' \? 'A' : toBnDigits\(sub\.pairMcq\)\) : [^;]+;\s*"
        r"const p2CqDisplay = sub\.pairCq !== '' \? \(sub\.pairCq === 'A' \? 'A' : toBnDigits\(sub\.pairCq\)\) : [^;]+;\s*"
        r"const p2PrDisplay = sub\.pairPr !== '' \? \(sub\.pairPr === 'A' \? 'A' : toBnDigits\(sub\.pairPr\)\) : [^;]+;\s*"
        r"const p2TotDisplay = sub\.pairHasMarks \? toBnDigits\(m2\) : [^;]+;",
        re.MULTILINE
    )

    new_paired_render = f"""const isP1NoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                          (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));
                    const isP2NoMcqPrac = (sub.pairMcqFull === 0 && sub.pairPracFull === 0) || 
                                          (sub.pairWith.toLowerCase().includes('english') || sub.pairWith.includes('ইংরেজি'));

                    const p1McqDisplay = (isP1NoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : {blank_symbol});
                    const p1CqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : {blank_symbol};
                    const p1PrDisplay = (isP1NoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : {blank_symbol});
                    const p1TotDisplay = sub.hasMarks ? toBnDigits(m1) : {blank_symbol};

                    const p2McqDisplay = (isP2NoMcqPrac || sub.pairMcqFull === 0) ? '-' : (sub.pairMcq !== '' ? (sub.pairMcq === 'A' ? 'A' : toBnDigits(sub.pairMcq)) : {blank_symbol});
                    const p2CqDisplay = sub.pairCq !== '' ? (sub.pairCq === 'A' ? 'A' : toBnDigits(sub.pairCq)) : {blank_symbol};
                    const p2PrDisplay = (isP2NoMcqPrac || sub.pairPracFull === 0) ? '-' : (sub.pairPr !== '' ? (sub.pairPr === 'A' ? 'A' : toBnDigits(sub.pairPr)) : {blank_symbol});
                    const p2TotDisplay = sub.pairHasMarks ? toBnDigits(m2) : {blank_symbol};"""

    # We need to replace all occurrences of paired_pattern (there are 2: table render and batch cards)
    matches_paired = list(paired_pattern.finditer(content))
    print(f"[{file_path}] Found {len(matches_paired)} paired display blocks")
    content = paired_pattern.sub(new_paired_render, content)

    # 2. Update single subject displays
    single_pattern = re.compile(
        r"(const isPracCol = sub\.pr !== '';\s*)?"
        r"const mcqDisplay = sub\.mcq !== '' \? \(sub\.mcq === 'A' \? 'A' : toBnDigits\(sub\.mcq\)\) : [^;]+;\s*"
        r"const cqDisplay = sub\.cq !== '' \? \(sub\.cq === 'A' \? 'A' : toBnDigits\(sub\.cq\)\) : [^;]+;\s*"
        r"const prDisplay = sub\.pr !== '' \? \(sub\.pr === 'A' \? 'A' : toBnDigits\(sub\.pr\)\) : [^;]+;\s*"
        r"const totDisplay = sub\.hasMarks \? toBnDigits\(tot\) : [^;]+;",
        re.MULTILINE
    )

    new_single_render = f"""const isNoMcqPrac = (sub.mcqFull === 0 && sub.pracFull === 0) || 
                                        (sub.name.toLowerCase().includes('english') || sub.name.includes('ইংরেজি'));

                    const isPracCol = sub.pr !== '' && !isNoMcqPrac && sub.pracFull !== 0;
                    const mcqDisplay = (isNoMcqPrac || sub.mcqFull === 0) ? '-' : (sub.mcq !== '' ? (sub.mcq === 'A' ? 'A' : toBnDigits(sub.mcq)) : {blank_symbol});
                    const cqDisplay = sub.cq !== '' ? (sub.cq === 'A' ? 'A' : toBnDigits(sub.cq)) : {blank_symbol};
                    const prDisplay = (isNoMcqPrac || sub.pracFull === 0) ? '-' : (sub.pr !== '' ? (sub.pr === 'A' ? 'A' : toBnDigits(sub.pr)) : {blank_symbol});
                    const totDisplay = sub.hasMarks ? toBnDigits(tot) : {blank_symbol};"""

    matches_single = list(single_pattern.finditer(content))
    print(f"[{file_path}] Found {len(matches_single)} single display blocks")
    content = single_pattern.sub(new_single_render, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[{file_path}] [OK] Updated display logic successfully")

update_displays('Marksheet.html', is_marksheet1=False)
update_displays('Marksheet1.html', is_marksheet1=True)

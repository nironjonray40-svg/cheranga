# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

old_room_sig_vars = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.5in; max-height: 0.5in; max-width: 140px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.5in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.5in; max-height: 0.5in; max-width: 140px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.5in;"></div>`;"""

new_room_sig_vars = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.575in; max-height: 0.575in; max-width: 160px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.575in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.575in; max-height: 0.575in; max-width: 160px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.575in;"></div>`;"""

if old_room_sig_vars in room_text:
    room_text = room_text.replace(old_room_sig_vars, new_room_sig_vars, 1)
    print("[OK] Updated signature size in Room Seat Topshet.html variables")
else:
    # check if not present before
    print("[INFO] Checking if variables need to be inserted in Room Seat Topshet.html")
    target_insert = "            let roomIdx = 1;\n"
    if target_insert in room_text and new_room_sig_vars not in room_text:
        room_text = room_text.replace(target_insert, target_insert + "\n" + new_room_sig_vars + "\n", 1)
        print("[OK] Inserted 15% larger signature variables into Room Seat Topshet.html")

old_room_boxes = """                                <div class="sig-col" style="display: none !important;">

                                    <div style="height: 0.5in;"></div>"""

new_room_boxes = """                                <div class="sig-col" style="display: none !important;">

                                    <div style="height: 0.575in;"></div>"""

if old_room_boxes in room_text:
    room_text = room_text.replace(old_room_boxes, new_room_boxes, 1)

old_room_box2 = """                                    <div class="sig-img-box" style="height: 0.5in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">"""
new_room_box2 = """                                    <div class="sig-img-box" style="height: 0.575in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">"""

room_text = room_text.replace(old_room_box2, new_room_box2)

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

old_seat_sig_vars = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.5in; max-height: 0.5in; max-width: 140px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.5in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.5in; max-height: 0.5in; max-width: 140px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.5in;"></div>`;"""

new_seat_sig_vars = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.575in; max-height: 0.575in; max-width: 160px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.575in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.575in; max-height: 0.575in; max-width: 160px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.575in;"></div>`;"""

if old_seat_sig_vars in seat_text:
    seat_text = seat_text.replace(old_seat_sig_vars, new_seat_sig_vars, 1)
    print("[OK] Updated signature size in seat-plan.html variables")

old_seat_boxes = """                                <div class="sig-col" style="display: none !important;">
                                    <div style="height: 0.5in;"></div>"""
new_seat_boxes = """                                <div class="sig-col" style="display: none !important;">
                                    <div style="height: 0.575in;"></div>"""

if old_seat_boxes in seat_text:
    seat_text = seat_text.replace(old_seat_boxes, new_seat_boxes, 1)

old_seat_box2 = """                                    <div class="sig-img-box" style="height: 0.5in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">"""
new_seat_box2 = """                                    <div class="sig-img-box" style="height: 0.575in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">"""

seat_text = seat_text.replace(old_seat_box2, new_seat_box2)

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")

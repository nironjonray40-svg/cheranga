# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

old_room_sig_vars = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.575in; max-height: 0.575in; max-width: 160px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.575in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.575in; max-height: 0.575in; max-width: 160px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.575in;"></div>`;"""

new_room_sig_vars = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.69in; max-height: 0.69in; max-width: 195px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.69in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.69in; max-height: 0.69in; max-width: 195px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.69in;"></div>`;"""

if old_room_sig_vars in room_text:
    room_text = room_text.replace(old_room_sig_vars, new_room_sig_vars, 1)
    print("[OK] Updated signature variables in Room Seat Topshet.html")

room_text = room_text.replace('style="height: 0.575in;"', 'style="height: 0.69in;"')
room_text = room_text.replace('height: 0.575in;', 'height: 0.69in;')

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

old_seat_sig_vars = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.575in; max-height: 0.575in; max-width: 160px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.575in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.575in; max-height: 0.575in; max-width: 160px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.575in;"></div>`;"""

new_seat_sig_vars = """            const hmSig = getRoomTopshetHeadmasterSignature();
            const prepSig = getRoomTopshetPreparerSignature();

            const prepSigImg = prepSig ? `<img src="${prepSig}" alt="স্বাক্ষর" style="height: 0.69in; max-height: 0.69in; max-width: 195px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.69in;"></div>`;

            const hmSigImg = hmSig ? `<img src="${hmSig}" alt="স্বাক্ষর" style="height: 0.69in; max-height: 0.69in; max-width: 195px; object-fit: contain; pointer-events: none; filter: contrast(115%); display: block; margin: 0 auto;" />` : `<div style="height: 0.69in;"></div>`;"""

if old_seat_sig_vars in seat_text:
    seat_text = seat_text.replace(old_seat_sig_vars, new_seat_sig_vars, 1)
    print("[OK] Updated signature variables in seat-plan.html")

seat_text = seat_text.replace('style="height: 0.575in;"', 'style="height: 0.69in;"')
seat_text = seat_text.replace('height: 0.575in;', 'height: 0.69in;')

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")

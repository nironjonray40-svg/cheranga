# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update Room Seat Topshet.html
with open('Room Seat Topshet.html', 'r', encoding='utf-8') as f:
    room_text = f.read()

# Update CSS .sig-line
old_room_sig_line = """.sig-line {

            border-top: 1px dashed #718096;

            width: 80%;

            margin: 0 auto 1px auto;

        }"""

new_room_sig_line = """.sig-line {

            border-top: 1px dashed #718096;

            width: 80%;

            margin: 0 auto 0 auto;

        }"""

if old_room_sig_line in room_text:
    room_text = room_text.replace(old_room_sig_line, new_room_sig_line, 1)
    print("[OK] Updated .sig-line CSS in Room Seat Topshet.html")

# Update HTML footer signatures in Room Seat Topshet.html
old_room_html_col = """                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">

                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -15px; position: relative; z-index: 2;">

                                        ${prepSigImg}

                                    </div>

                                    <div class="sig-line" style="margin: 0 auto 1px auto; position: relative; z-index: 1;"></div>

                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 1px;">প্রস্তুতকারী</div>

                                </div>

                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">

                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -15px; position: relative; z-index: 2;">

                                        ${hmSigImg}

                                    </div>

                                    <div class="sig-line" style="margin: 0 auto 1px auto; position: relative; z-index: 1;"></div>

                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 1px;">প্রধান শিক্ষক</div>

                                </div>"""

new_room_html_col = """                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">

                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">

                                        ${prepSigImg}

                                    </div>

                                    <div class="sig-line" style="margin: 0 auto 0 auto; position: relative; z-index: 1;"></div>

                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রস্তুতকারী</div>

                                </div>

                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">

                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">

                                        ${hmSigImg}

                                    </div>

                                    <div class="sig-line" style="margin: 0 auto 0 auto; position: relative; z-index: 1;"></div>

                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রধান শিক্ষক</div>

                                </div>"""

if old_room_html_col in room_text:
    room_text = room_text.replace(old_room_html_col, new_room_html_col, 1)
    print("[OK] Updated HTML signature columns in Room Seat Topshet.html")
else:
    print("[WARN] Could not find exact old_room_html_col, applying flexible replacement")
    room_text = room_text.replace('margin-bottom: -15px;', 'margin-bottom: -28px;')
    room_text = room_text.replace('margin: 0 auto 1px auto;', 'margin: 0 auto 0 auto;')
    room_text = room_text.replace('margin-top: 1px;', 'margin-top: 0; padding-top: 0; line-height: 1.1;')

with open('Room Seat Topshet.html', 'w', encoding='utf-8') as f:
    f.write(room_text)
print("[SUCCESS] Room Seat Topshet.html saved!")


# 2. Update seat-plan.html
with open('seat-plan.html', 'r', encoding='utf-8') as f:
    seat_text = f.read()

# Update CSS #subview-room-topshet .sig-line
old_seat_sig_line = """        #subview-room-topshet .sig-line {
            border-top: 1px dashed #718096;
            width: 80%;
            margin: 0 auto 1px auto;
        }"""

new_seat_sig_line = """        #subview-room-topshet .sig-line {
            border-top: 1px dashed #718096;
            width: 80%;
            margin: 0 auto 0 auto;
        }"""

if old_seat_sig_line in seat_text:
    seat_text = seat_text.replace(old_seat_sig_line, new_seat_sig_line, 1)
    print("[OK] Updated CSS #subview-room-topshet .sig-line in seat-plan.html")

old_seat_html_col = """                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -15px; position: relative; z-index: 2;">
                                        ${prepSigImg}
                                    </div>
                                    <div class="sig-line" style="margin: 0 auto 1px auto; position: relative; z-index: 1;"></div>
                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 1px;">প্রস্তুতকারী</div>
                                </div>
                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -15px; position: relative; z-index: 2;">
                                        ${hmSigImg}
                                    </div>
                                    <div class="sig-line" style="margin: 0 auto 1px auto; position: relative; z-index: 1;"></div>
                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 1px;">প্রধান শিক্ষক</div>
                                </div>"""

new_seat_html_col = """                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                        ${prepSigImg}
                                    </div>
                                    <div class="sig-line" style="margin: 0 auto 0 auto; position: relative; z-index: 1;"></div>
                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রস্তুতকারী</div>
                                </div>
                                <div class="sig-col" style="vertical-align: bottom; text-align: center; position: relative;">
                                    <div class="sig-img-box" style="height: 0.86in; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -28px; position: relative; z-index: 2;">
                                        ${hmSigImg}
                                    </div>
                                    <div class="sig-line" style="margin: 0 auto 0 auto; position: relative; z-index: 1;"></div>
                                    <div class="sig-label" style="font-size: 11.55pt; font-weight: bold; margin-top: 0; padding-top: 0; line-height: 1.1;">প্রধান শিক্ষক</div>
                                </div>"""

if old_seat_html_col in seat_text:
    seat_text = seat_text.replace(old_seat_html_col, new_seat_html_col, 1)
    print("[OK] Updated HTML signature columns in seat-plan.html")
else:
    print("[WARN] Could not find old_seat_html_col, applying flexible replacement")
    seat_text = seat_text.replace('margin-bottom: -15px;', 'margin-bottom: -28px;')
    seat_text = seat_text.replace('margin: 0 auto 1px auto;', 'margin: 0 auto 0 auto;')
    seat_text = seat_text.replace('margin-top: 1px;', 'margin-top: 0; padding-top: 0; line-height: 1.1;')

with open('seat-plan.html', 'w', encoding='utf-8') as f:
    f.write(seat_text)
print("[SUCCESS] seat-plan.html saved!")

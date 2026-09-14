# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# A4 height = 297mm = 11.693 inches = 1122.5px @ 96 DPI
PAGE_HEIGHT = 1122.5
PAGE_PADDING = 0.3 * 96 * 2 # 57.6px (0.3in top and bottom)
CONTAINER_BORDER = 4 # 2px top and bottom
CONTAINER_PADDING = 15 * 2 # 30px (15px top and bottom)
AVAIL_HEIGHT = PAGE_HEIGHT - PAGE_PADDING - CONTAINER_BORDER - CONTAINER_PADDING
print(f"Total available inside container: {AVAIL_HEIGHT:.1f}px ({AVAIL_HEIGHT/96:.2f}in)")

# Header elements:
school_name = 30 + 2 # 32px
exam_name = 22 + 8 + 4 # 34px
bldg_name = 24 + 8 # 32px
header_line_3 = 24 + 10 + 12 # 46px
summary_info = 16 + 15 # 31px
HEADER_TOTAL = school_name + exam_name + bldg_name + header_line_3 + summary_info
print(f"Header total height: {HEADER_TOTAL:.1f}px ({HEADER_TOTAL/96:.2f}in)")

# Footer signatures:
# sig-box: 0.86in = 82.56px, margin-bottom: -28px => effective sig height = 54.56px
# sig-label: ~16px
# margin-bottom: 0.5in = 48px
FOOTER_TOTAL = (0.86 * 96 - 28) + 16 + (0.5 * 96)
print(f"Footer signatures total height: {FOOTER_TOTAL:.1f}px ({FOOTER_TOTAL/96:.2f}in)")

# Required gap above signatures = 0.5in = 48px
SIG_GAP = 0.5 * 96
print(f"Gap above signatures: {SIG_GAP:.1f}px ({SIG_GAP/96:.2f}in)")

# Available for table:
TABLE_AVAIL = AVAIL_HEIGHT - HEADER_TOTAL - FOOTER_TOTAL - SIG_GAP
print(f"Available height for table: {TABLE_AVAIL:.1f}px ({TABLE_AVAIL/96:.2f}in)")

# Table TH (class name + subheaders):
th_height = 30 + 24 # 54px
avail_for_rows = TABLE_AVAIL - th_height
print(f"Available for table rows: {avail_for_rows:.1f}px")

row_height = 25 # ~25px per row with padding: 3px 5px and font-size: 11.5pt
max_rows = avail_for_rows / row_height
print(f"Max rows that fit with exact 0.5in clearance: {max_rows:.1f} rows (recommended ROWS_PER_PAGE = 22)")

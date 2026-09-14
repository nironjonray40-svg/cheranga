# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# A4 height = 297mm = 11.693 inches = 1122.5px @ 96 DPI
PAGE_HEIGHT = 1122.5
PAGE_PADDING = 0.3 * 96 * 2 # 57.6px (0.3in top and bottom)
CONTAINER_BORDER = 4 # 2px top and bottom
CONTAINER_PADDING = 15 * 2 # 30px (15px top and bottom)
AVAIL_HEIGHT = PAGE_HEIGHT - PAGE_PADDING - CONTAINER_BORDER - CONTAINER_PADDING

# Header elements: ~175px
HEADER_TOTAL = 175.0

# User requirement: Bottom margin for student ID & Section = 2.00in = 192px
BOTTOM_MARGIN = 2.00 * 96 # 192px

TABLE_AVAIL = AVAIL_HEIGHT - HEADER_TOTAL - BOTTOM_MARGIN
th_height = 54 # px
avail_for_rows = TABLE_AVAIL - th_height
row_height = 28 # px

print(f"Total available inside container: {AVAIL_HEIGHT:.1f}px ({AVAIL_HEIGHT/96:.2f}in)")
print(f"Header height: {HEADER_TOTAL:.1f}px ({HEADER_TOTAL/96:.2f}in)")
print(f"Bottom margin for student tables: {BOTTOM_MARGIN:.1f}px (2.00in)")
print(f"Available height for table rows: {avail_for_rows:.1f}px ({avail_for_rows/96:.2f}in)")
print(f"Max rows per page: {avail_for_rows / row_height:.1f} rows => ROWS_PER_PAGE = 20")

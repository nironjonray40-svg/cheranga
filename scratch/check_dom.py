from bs4 import BeautifulSoup

with open("scratch/live_chrome_dom.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")

cls_sel = soup.find("select", id="class-filter")
exam_sel = soup.find("select", id="exam-filter")

print("Class options:", [(o.get("value"), o.text) for o in cls_sel.find_all("option")][:5])
print("Exam options:", [(o.get("value"), o.text) for o in exam_sel.find_all("option")][:5])

rows = soup.find_all("tr", attrs={"data-section": True})
print("Total rows:", len(rows))
for i, r in enumerate(rows[:5]):
    tds = [td.text.strip() for td in r.find_all("td")]
    print("Row", i, "roll:", tds[0] if len(tds)>0 else "", "name:", tds[1] if len(tds)>1 else "", "style:", r.get("style"))
    if len(tds) >= 68:
        print("  Bangla:", tds[2:12])
        print("  English:", tds[12:18])
        print("  Math:", tds[18:23])
        print("  Summary:", tds[62:68])

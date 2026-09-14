import re

with open('cms.html', 'r', encoding='utf-8') as f:
    text = f.read()

sections = re.findall(r'<(?:section|header|footer|div)[^>]*(?:id=[\"\'][^\"\']*[\"\']|class=[\"\'][^\"\']*(?:section-py|hero-section|stats-banner|about-section|speeches-section|class-section|staff-section|notice-section|admission-section|facilities-section|gallery-section|contact-section|footer)[^\"\']*[\"\'])[^>]*>', text)
for s in sections:
    print(s)

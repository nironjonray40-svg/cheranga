with open('server.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for term in ['EventSource', 'websocket', 'stream', 'SSE', 'chunked', 'keep_alive']:
    matches = [m.start() for m in re.finditer(term, text, re.IGNORECASE)]
    print(f"Term '{term}': {len(matches)} matches")

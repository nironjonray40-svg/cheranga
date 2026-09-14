import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('server.py', 'r', encoding='utf-8', errors='ignore') as f:
    srv = f.read()

pos = srv.find('def do_GET')
print(srv[pos:pos+1500])


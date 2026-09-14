import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('Student attendance sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Check where safeJsonParse is
print("safeJsonParse pos:", content.find('function safeJsonParse'))
print("getAllStudentsList pos:", content.find('function getAllStudentsList'))

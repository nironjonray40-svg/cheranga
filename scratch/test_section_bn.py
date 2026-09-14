# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

def formatSectionToBn(sec):
    if not sec:
        return 'ক'
    s = str(sec).strip()
    if not s:
        return 'ক'
    lower = s.lower()
    letterMap = {
        'a': 'ক', 'b': 'খ', 'c': 'গ', 'd': 'ঘ', 'e': 'ঙ', 'f': 'চ', 'g': 'ছ', 'h': 'জ', 'i': 'ঝ', 'j': 'ঞ'
    }
    if lower in letterMap:
        return letterMap[lower]
    
    nameMap = {
        'sec-a': 'ক', 'sec a': 'ক', 'section a': 'ক',
        'sec-b': 'খ', 'sec b': 'খ', 'section b': 'খ',
        'sec-c': 'গ', 'sec c': 'গ', 'section c': 'গ',
        'sec-d': 'ঘ', 'sec d': 'ঘ', 'section d': 'ঘ',
        'science': 'বিজ্ঞান', 'humanities': 'মানবিক', 'arts': 'মানবিক',
        'commerce': 'ব্যবসায় শিক্ষা', 'business': 'ব্যবসায় শিক্ষা', 'business studies': 'ব্যবসায় শিক্ষা',
        'general': 'সাধারণ', 'vocational': 'ভোকেশনাল',
        'padma': 'পদ্মা', 'meghna': 'মেঘনা', 'jamuna': 'যমুনা', 'surma': 'সুরমা',
        'karnafuli': 'কর্ণফুলী', 'karnaphuli': 'কর্ণফুলী', 'tista': 'তিস্তা', 'teesta': 'তিস্তা',
        'rose': 'গোলাপ', 'golap': 'গোলাপ', 'beli': 'বেলী', 'jaba': 'জবা', 'shapla': 'শাপলা',
        'chameli': 'চামেলী', 'tagar': 'টগর', 'hasnahena': 'হাসনাহেনা', 'bakul': 'বকুল',
        'kadam': 'কদম', 'sunflower': 'সূর্যমুখী', 'surjamukhi': 'সূর্যমুখী',
        'morning': 'প্রভাতি', 'prabhati': 'প্রভাতি', 'day': 'দিবা', 'diba': 'দিবা',
        'boys': 'বালক', 'girls': 'বালিকা'
    }
    if lower in nameMap:
        return nameMap[lower]
    
    # If string already contains Bengali characters
    for ch in s:
        if '\u0980' <= ch <= '\u09FF':
            return s
            
    cleanSec = lower.replace('section', '').replace('sec', '').replace('শাখা', '').replace(':', '').replace('-', '').strip()
    if cleanSec in letterMap:
        return letterMap[cleanSec]
    if cleanSec in nameMap:
        return nameMap[cleanSec]
    return s

test_cases = ['A', 'a', 'B', 'b', 'C', 'D', 'Science', 'Humanities', 'Commerce', 'Padma', 'Rose', 'ক', 'খ', 'বিজ্ঞান', 'Section A', 'Sec-B', '']
for t in test_cases:
    print(f"'{t}' -> '{formatSectionToBn(t)}'")

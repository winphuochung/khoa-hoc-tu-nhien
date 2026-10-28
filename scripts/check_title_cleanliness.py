import json
import re
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    data = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))
    for g, lessons in data.items():
        print(f"=== Grade {g} titles with KTTX or notes ===")
        for l in lessons:
            t = l['title']
            if re.search(r'kttx|stem|định kì', t, re.IGNORECASE):
                print(f"  Lesson {l['lesson_number']}: {t}")

if __name__ == '__main__':
    main()

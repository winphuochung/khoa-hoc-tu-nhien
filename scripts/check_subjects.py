import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    data = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))
    for g, lessons in data.items():
        subjs = {}
        for l in lessons:
            subjs.setdefault(l.get('subject'), []).append(l['lesson_number'])
        print(f"Grade {g} subjects breakdown:")
        for s, nums in subjs.items():
            print(f"  {s}: count={len(nums)}, range={min(nums)}..{max(nums)}")

if __name__ == '__main__':
    main()

import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    data = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))
    for g, lessons in data.items():
        print(f"=== CHECKING GRADE {g} ({len(lessons)} lessons) ===")
        zero_periods = []
        empty_objs = []
        total_p = 0
        for l in lessons:
            num = l['lesson_number']
            p = l.get('periods', 0)
            total_p += p
            objs = l.get('objectives', [])
            if not p or p <= 0:
                zero_periods.append((num, l['title']))
            if not objs:
                empty_objs.append((num, l['title']))
        print(f"  Total periods: {total_p}")
        print(f"  Zero periods: {len(zero_periods)} {zero_periods[:3]}")
        print(f"  Empty objectives: {len(empty_objs)} {empty_objs[:3]}")

if __name__ == '__main__':
    main()

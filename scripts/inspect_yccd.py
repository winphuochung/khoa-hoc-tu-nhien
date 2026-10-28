import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    ppct = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))
    for g in ['6', '7', '8', '9']:
        print(f"*** Grade {g} sample YCCD ***")
        for les in ppct[g][:4]:
            print(f"Lesson {les['lesson_number']}: {les['title']} ({les['periods']} tiet)")
            for obj in les['objectives']:
                print(f"   - {obj}")

if __name__ == '__main__':
    main()

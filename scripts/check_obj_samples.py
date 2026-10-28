import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    data = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))
    for g, lessons in data.items():
        print(f"=== Sample objectives Grade {g} ===")
        for l in lessons[:2]:
            print(f"Lesson {l['lesson_number']}: {l['title']}")
            for obj in l['objectives']:
                print(f"   * {obj}")

if __name__ == '__main__':
    main()

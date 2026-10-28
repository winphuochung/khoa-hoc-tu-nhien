import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    ppct = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))

    g9_lessons = {l['id']: l for l in db['lessons'] if l.get('grade') == 9 or l.get('grade') is None}
    g9_ppct = {pl['lesson_number']: pl for pl in ppct['9']}

    g9_qs = [q for q in db['questions'] if q.get('grade') == 9 or q.get('grade') is None or (isinstance(q.get('lessonId'), int) and q.get('lessonId') <= 51)]

    print(f"Total Grade 9 questions: {len(g9_qs)}")
    # Check sample questions for first 5 lessons
    for lid in range(1, 6):
        pl = g9_ppct[lid]
        lqs = [q for q in g9_qs if q['lessonId'] == lid]
        print(f"\n--- Lesson {lid}: {pl['title']} (periods={pl['periods']}) ---")
        print("  PPCT Objectives:")
        for obj in pl['objectives']:
            print(f"    * {obj}")
        print(f"  Questions ({len(lqs)} qs):")
        for q in lqs[:4]:
            print(f"    - [{q['level']}] {q['id']}: req={q.get('requirementText')}")

if __name__ == '__main__':
    main()

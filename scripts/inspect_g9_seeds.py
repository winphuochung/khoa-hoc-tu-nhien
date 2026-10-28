import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    # Let's inspect the seed files using node or python reading js
    # Let's check db.lessons for grade 9:
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    g9_lessons = sorted([l for l in db['lessons'] if l.get('grade') == 9 or l.get('grade') is None], key=lambda x: x['id'])
    print(f"Grade 9 lessons count in db: {len(g9_lessons)}")
    subjects = {}
    for l in g9_lessons:
        s = l.get('subject', 'none')
        subjects.setdefault(s, []).append(l['id'])
    print("Grade 9 subjects breakdown:")
    for s, ids in subjects.items():
        print(f"  {s}: count={len(ids)}, min={min(ids)}, max={max(ids)}")

if __name__ == '__main__':
    main()

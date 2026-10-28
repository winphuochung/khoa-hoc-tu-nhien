import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    questions = db.get('questions', [])
    for g_num in [6, 7, 8]:
        g_qs = [q for q in questions if q.get('grade') == g_num]
        print(f"Grade {g_num}: total={len(g_qs)}")
        first_les = g_qs[0]['lessonId']
        les_qs = [q for q in g_qs if q['lessonId'] == first_les]
        for q in les_qs:
            print(f"  id={q['id']}, type={q['type']}, level={q['level']}, ind={q.get('indicator')}, req={str(q.get('requirementText'))[:50]}")

if __name__ == '__main__':
    main()

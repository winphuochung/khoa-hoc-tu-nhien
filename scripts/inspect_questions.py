import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    for q in db.get('questions', [])[:15]:
        req = str(q.get('requirementText', ''))
        print(f"Q {q.get('id')}: les={q.get('lessonId')}, lvl={q.get('level')}, ind={q.get('indicator')}, req={req[:50]}...")

if __name__ == '__main__':
    main()

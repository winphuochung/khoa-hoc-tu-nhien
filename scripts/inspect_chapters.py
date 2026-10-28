import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    print("Chapters count:", len(db.get('chapters', [])))
    for c in db.get('chapters', []):
        print(f"ID={c.get('id')}, grade={c.get('grade')}, code={c.get('code')}, title={c.get('title')}")

if __name__ == '__main__':
    main()

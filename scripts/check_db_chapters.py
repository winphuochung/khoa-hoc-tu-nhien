import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    for g_num in [6, 7, 8, 9]:
        g_les = sorted([l for l in db['lessons'] if l.get('grade') == g_num], key=lambda x: x['id'])
        print(f"=== Grade {g_num} lessons in DB: {len(g_les)} ===")
        # check chapters
        chaps = set(l.get('chapterId') for l in g_les)
        print(f"  Chapters used: {len(chaps)} chapters")

if __name__ == '__main__':
    main()

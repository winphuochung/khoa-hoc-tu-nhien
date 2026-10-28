import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    ppct = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))

    g8_db = sorted([l for l in db['lessons'] if l.get('grade') == 8], key=lambda x: x['id'])
    g8_ppct = ppct['8']

    print(f"Total Grade 8: DB={len(g8_db)}, PPCT={len(g8_ppct)}")
    for i in range(len(g8_ppct)):
        dl = g8_db[i] if i < len(g8_db) else None
        pl = g8_ppct[i]
        d_title = dl['title'] if dl else 'NONE'
        d_id = dl['id'] if dl else ''
        p_title = pl['title']
        p_num = pl['lesson_number']
        print(f"[{i+1:02d}] DB#{d_id}: {d_title} <===> PPCT#{p_num}: {p_title} ({pl['periods']} tiet)")

if __name__ == '__main__':
    main()

import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    ppct = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))

    g7_db = sorted([l for l in db['lessons'] if l.get('grade') == 7], key=lambda x: x['id'])
    g7_ppct = ppct['7']

    print(f"Total Grade 7: DB={len(g7_db)}, PPCT={len(g7_ppct)}")
    for i in range(len(g7_ppct)):
        dl = g7_db[i] if i < len(g7_db) else None
        pl = g7_ppct[i]
        d_title = dl['title'] if dl else 'NONE'
        d_id = dl['id'] if dl else ''
        p_title = pl['title']
        p_num = pl['lesson_number']
        print(f"[{i+1:02d}] DB#{d_id}: {d_title} <===> PPCT#{p_num}: {p_title} ({pl['periods']} tiet)")

if __name__ == '__main__':
    main()

import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    ppct = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))

    for g in ['6', '7', '8']:
        g_num = int(g)
        db_les = sorted([l for l in db['lessons'] if l.get('grade') == g_num], key=lambda x: x['id'])
        ppct_les = ppct[g]
        print(f"\n=================== GRADE {g} ===================")
        for i in range(max(len(db_les), len(ppct_les))):
            dl = db_les[i] if i < len(db_les) else None
            pl = ppct_les[i] if i < len(ppct_les) else None
            d_str = f"DB#{dl['id']} (p={dl.get('periods')}): {dl['title']}" if dl else "NONE"
            p_str = f"PPCT#{pl['lesson_number']} (p={pl.get('periods')}): {pl['title']}" if pl else "NONE"
            print(f"{d_str:60} | {p_str}")

if __name__ == '__main__':
    main()

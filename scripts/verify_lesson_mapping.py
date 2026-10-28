import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    ppct = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))

    for g in ['6', '7', '8', '9']:
        g_num = int(g)
        db_les = sorted([l for l in db['lessons'] if l.get('grade') == g_num], key=lambda x: x['id'])
        ppct_les = ppct[g]
        print(f"\n=================== GRADE {g} (DB: {len(db_les)}, PPCT: {len(ppct_les)}) ===================")
        for i in range(len(ppct_les)):
            pl = ppct_les[i]
            dl = db_les[i] if i < len(db_les) else None
            p_match = (dl.get('periods') == pl.get('periods')) if dl else False
            flag = "MATCH" if p_match else f"DIFF PERIODS (DB:{dl.get('periods')} vs PPCT:{pl.get('periods')})"
            print(f"[{i+1}] DB#{dl.get('id') if dl else 'NONE'}: {dl.get('title') if dl else ''} | PPCT#{pl['lesson_number']}: {pl['title']} => {flag}")

if __name__ == '__main__':
    main()

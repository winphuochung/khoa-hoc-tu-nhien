import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    ppct = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))

    for g in ['6', '7', '8', '9']:
        grade_num = int(g)
        db_lessons = [l for l in db['lessons'] if l.get('grade') == grade_num]
        ppct_lessons = ppct[g]
        print(f"=== Grade {g}: db_lessons={len(db_lessons)}, ppct_lessons={len(ppct_lessons)} ===")
        # compare first 5 and check period differences across all
        diff_periods = 0
        diff_objs = 0
        for i in range(len(ppct_lessons)):
            pl = ppct_lessons[i]
            dl = db_lessons[i] if i < len(db_lessons) else None
            if dl:
                p_db = dl.get('periods')
                p_ppct = pl.get('periods')
                if p_db != p_ppct:
                    diff_periods += 1
                if dl.get('objectives') != pl.get('objectives'):
                    diff_objs += 1
                if i < 3:
                    print(f"  [{i+1}] DB (id={dl.get('id')}): {dl.get('title')} | p={p_db} | objs={len(dl.get('objectives', []))}")
                    print(f"       PPCT: {pl.get('title')} | p={p_ppct} | objs={len(pl.get('objectives', []))}")
        print(f"  Summary Grade {g}: diff_periods={diff_periods}/{len(ppct_lessons)}, diff_objectives={diff_objs}/{len(ppct_lessons)}")

if __name__ == '__main__':
    main()

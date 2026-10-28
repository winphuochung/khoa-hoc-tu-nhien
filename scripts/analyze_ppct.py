# scripts/analyze_ppct.py
import json

with open('temp_ppct_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('temp_ppct_summary.txt', 'w', encoding='utf-8') as out:
    for grade in ['6', '7', '8', '9']:
        tables = data.get(grade, [])
        out.write(f"\n================ GRADE {grade} ================\n")
        for idx, tbl in enumerate(tables):
            if not tbl:
                continue
            out.write(f"Table {idx}: {len(tbl)} rows.\n")
            headers = [c.replace('\n', ' ') for c in tbl[0]]
            out.write(f"  Cols: {headers[:8]}\n")
            if len(tbl) > 1:
                out.write(f"  Row 1: {[c.replace(chr(10), ' ')[:50] for c in tbl[1][:6]]}\n")
            if len(tbl) > 2:
                out.write(f"  Row 2: {[c.replace(chr(10), ' ')[:50] for c in tbl[2][:6]]}\n")

print("Analyzed and wrote temp_ppct_summary.txt")

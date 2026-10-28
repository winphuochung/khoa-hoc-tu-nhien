# scripts/inspect_rows.py
import json

with open('temp_extracted_raw.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('temp_rows_sample.txt', 'w', encoding='utf-8') as out:
    for grade in ['6', '7', '8', '9']:
        out.write(f"\n================ GRADE {grade} (Total rows: {len(data[grade])}) ================\n")
        for item in data[grade][:8]:
            cells = item['cells']
            out.write(f"Row {item['row_idx']} ({len(cells)} cells):\n")
            for c_i, c_val in enumerate(cells):
                flat = c_val.replace('\n', ' -- ')
                if len(flat) > 80:
                    flat = flat[:80] + '...'
                out.write(f"  [{c_i}]: {flat}\n")

print("Wrote temp_rows_sample.txt")

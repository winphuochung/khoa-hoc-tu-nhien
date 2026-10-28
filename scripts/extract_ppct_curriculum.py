# scripts/extract_ppct_curriculum.py
import json
import re

with open('temp_ppct_data.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

extracted_curriculum = {}

for grade in ['6', '7', '8', '9']:
    tbl = raw_data[grade][2] # Table 2 is the main PPCT table
    
    lessons = []
    current_term = 'Học kì 1'
    
    # Analyze table rows
    for r_idx, row in enumerate(tbl):
        # Skip header rows
        if r_idx < 2:
            continue
            
        full_row_text = " ".join([c.strip() for c in row if c])
        if not full_row_text:
            continue
            
        if 'HỌC KÌ I' in full_row_text.upper() or 'HỌC KỲ I' in full_row_text.upper():
            if 'HỌC KÌ II' in full_row_text.upper() or 'HỌC KỲ II' in full_row_text.upper():
                current_term = 'Học kì 2'
            else:
                current_term = 'Học kì 1'
            continue
        elif 'HỌC KÌ II' in full_row_text.upper() or 'HỌC KỲ II' in full_row_text.upper():
            current_term = 'Học kì 2'
            continue
            
        # Check structure
        # Often row has:
        # Col 0: Stt
        # Col 1: Bài học
        # If columns were merged, let's see how many cells
        lessons.append({
            'row_idx': r_idx,
            'term': current_term,
            'cells': row
        })
        
    extracted_curriculum[grade] = lessons

with open('temp_extracted_raw.json', 'w', encoding='utf-8') as out:
    json.dump(extracted_curriculum, out, ensure_ascii=False, indent=2)

print("Saved temp_extracted_raw.json")

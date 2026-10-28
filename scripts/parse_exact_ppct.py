# scripts/parse_exact_ppct.py
import json
import re

with open('temp_extracted_raw.json', 'r', encoding='utf-8') as f:
    raw_grades = json.load(f)

def clean_text(s):
    if not s:
        return ''
    return re.sub(r'\s+', ' ', s).strip()

def parse_lesson_number(title):
    # Match "Bài 1:", "Bài 1.", "Bài 1 ", "Bài 13."
    m = re.search(r'Bài\s+(\d+)', title, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None

def parse_periods_from_cell(cell_val):
    # e.g., "1→4" -> 4 periods, "1,2" -> 2 periods, "5" -> 1 period, "1→2" -> 2 periods
    val = clean_text(cell_val)
    if not val:
        return 0
    if '→' in val or '->' in val:
        parts = re.split(r'→|->', val)
        try:
            p1 = int(parts[0].strip())
            p2 = int(parts[1].strip())
            return p2 - p1 + 1
        except:
            return 1
    elif ',' in val:
        return len([p for p in val.split(',') if p.strip()])
    else:
        # maybe single digit or number
        m = re.match(r'^\d+$', val)
        if m:
            return 1
    return 1

# Process each grade
all_parsed_curriculum = {}

for grade in ['6', '7', '8', '9']:
    rows = raw_grades[grade]
    lessons_map = {} # lesson_num -> lesson_data
    
    current_chapter = ''
    
    for r in rows:
        cells = r['cells']
        if len(cells) == 1:
            # Chapter header row e.g. "CHƯƠNG I. MỞ ĐẦU VỀ KHTN"
            current_chapter = clean_text(cells[0])
            continue
            
        if len(cells) < 7:
            continue
            
        title_raw = clean_text(cells[1])
        if not title_raw:
            continue
            
        # Check if title_raw contains chapter info
        if 'chương' in title_raw.lower() and 'bài' in title_raw.lower():
            # split chapter and lesson
            parts = title_raw.split('--')
            for p in parts:
                if 'chương' in p.lower():
                    current_chapter = clean_text(p)
                    
        les_num = parse_lesson_number(title_raw)
        
        # Check if row is an exam row e.g., "Kiểm tra giữa kì", "Ôn tập"
        if not les_num:
            # Maybe revision or exam
            continue
            
        # Extract explicit period in title if exists e.g., "(2 tiết)"
        explicit_periods = 0
        m_per = re.search(r'\((\d+)\s*tiết\)', title_raw, re.IGNORECASE)
        if m_per:
            explicit_periods = int(m_per.group(1))
            
        # Extract periods from subject columns:
        # cells[2] = Lí, cells[3] = Hóa, cells[4] = Sinh
        li_val = clean_text(cells[2])
        hoa_val = clean_text(cells[3])
        sinh_val = clean_text(cells[4])
        
        subject = 'vat_li'
        col_periods = 0
        if li_val:
            subject = 'vat_li'
            col_periods = parse_periods_from_cell(li_val)
        elif hoa_val:
            subject = 'hoa_hoc'
            col_periods = parse_periods_from_cell(hoa_val)
        elif sinh_val:
            subject = 'sinh_hoc'
            col_periods = parse_periods_from_cell(sinh_val)
            
        # YCCĐ is at cells[6]
        yccd_raw = clean_text(cells[6])
        
        # Parse objectives list from YCCĐ text
        objectives = []
        if yccd_raw:
            # split by '-' or '–' or '+' or bullet points
            raw_objs = re.split(r'\n|--|\s+-\s+|\s+–\s+|\s+•\s+', yccd_raw)
            for ro in raw_objs:
                cleaned_obj = clean_text(ro).lstrip('-–•+* ')
                if cleaned_obj and len(cleaned_obj) > 10:
                    objectives.append(cleaned_obj)
            if not objectives:
                objectives = [yccd_raw]
                
        # Title clean
        clean_title = re.sub(r'\((\d+)\s*tiết\)', '', title_raw).strip()
        clean_title = re.sub(r'--.*$', '', clean_title).strip()
        if 'Bài' in clean_title:
            m_bt = re.search(r'(Bài\s+\d+[\.:]?\s*[^-\(\)]+)', clean_title)
            if m_bt:
                clean_title = m_bt.group(1).strip()
                
        if les_num not in lessons_map:
            lessons_map[les_num] = {
                'lesson_number': les_num,
                'title': clean_title,
                'chapter': current_chapter,
                'subject': subject,
                'explicit_periods': explicit_periods,
                'sum_col_periods': col_periods,
                'yccd_text_parts': [yccd_raw] if yccd_raw else [],
                'objectives': objectives
            }
        else:
            # Merge
            existing = lessons_map[les_num]
            if explicit_periods > existing['explicit_periods']:
                existing['explicit_periods'] = explicit_periods
            existing['sum_col_periods'] += col_periods
            if yccd_raw and yccd_raw not in existing['yccd_text_parts']:
                existing['yccd_text_parts'].append(yccd_raw)
            for o in objectives:
                if o not in existing['objectives']:
                    existing['objectives'].append(o)
                    
    # Finalize periods: prefer explicit_periods if > 0 else sum_col_periods
    final_lessons = []
    for l_num in sorted(lessons_map.keys()):
        item = lessons_map[l_num]
        p = item['explicit_periods'] if item['explicit_periods'] > 0 else max(1, item['sum_col_periods'])
        item['periods'] = p
        final_lessons.append(item)
        
    all_parsed_curriculum[grade] = final_lessons

with open('temp_parsed_curriculum.json', 'w', encoding='utf-8') as out:
    json.dump(all_parsed_curriculum, out, ensure_ascii=False, indent=2)

print("Parsed curriculum written to temp_parsed_curriculum.json")
for g, l_list in all_parsed_curriculum.items():
    print(f"Grade {g}: {len(l_list)} lessons extracted from PPCT docx.")

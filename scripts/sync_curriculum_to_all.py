import json
import re
import os
import shutil
import sys

def clean_title(title, lesson_num):
    # Remove KTTX notes
    t = re.sub(r'\s+KTTX\s+\d+.*$', '', title, flags=re.IGNORECASE).strip()
    t = re.sub(r'\.\s*KTTX\s+\d+.*$', '', t, flags=re.IGNORECASE).strip()
    # Normalize "Bài X." or "Bài X :" -> "Bài X:"
    t = re.sub(r'^Bài\s+(\d+)\s*[\.:]\s*', r'Bài \1: ', t)
    if not t.startswith(f'Bài {lesson_num}:'):
        t = f'Bài {lesson_num}: {t}'
    return t.strip()

def clean_objective(obj):
    o = str(obj).strip()
    # Remove leading dashes or bullets
    o = re.sub(r'^[–\-\*•\+]\s*', '', o)
    # Remove trailing semicolon
    if o.endswith(';'):
        o = o[:-1] + '.'
    if not o.endswith('.'):
        o += '.'
    return o.strip()

def categorize_objectives(objs):
    cleaned = [clean_objective(o) for o in objs if str(o).strip()]
    biet_list = []
    hieu_list = []
    vd_list = []
    for obj in cleaned:
        low = obj.lower()
        if any(k in low for k in ['vận dụng', 'tính được', 'thực hiện', 'tiến hành', 'chế tạo', 'đo được', 'làm được', 'đề xuất', 'thiết kế', 'tổ chức']):
            vd_list.append(obj)
        elif any(k in low for k in ['giải thích', 'trình bày', 'mô tả', 'phân biệt', 'so sánh', 'dựa vào', 'rút ra', 'phân tích', 'xác định']):
            hieu_list.append(obj)
        elif any(k in low for k in ['nêu được', 'nhận biết', 'kể tên', 'liệt kê', 'phát biểu', 'viết được', 'chỉ ra', 'đọc được', 'biết cách']):
            biet_list.append(obj)
        else:
            hieu_list.append(obj)
    if not biet_list and cleaned:
        biet_list.append(cleaned[0])
    if not hieu_list and cleaned:
        hieu_list.append(cleaned[min(1, len(cleaned)-1)])
    if not vd_list and cleaned:
        vd_list.append(cleaned[-1])
    return biet_list, hieu_list, vd_list, cleaned

def get_chem_indicator(level):
    if level == 'biet':
        return 'HH1.1'
    elif level == 'hieu':
        return 'HH1.2'
    else:
        return 'HH2.1'

def get_bio_indicator(level):
    if level == 'biet':
        return 'NT1'
    elif level == 'hieu':
        return 'TH1'
    else:
        return 'VD1'

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    ppct = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))
    db_path = 'server/data/db.json'
    backup_path = 'server/data/db.json.bak_before_ppct_sync'
    shutil.copyfile(db_path, backup_path)
    print(f"Backed up {db_path} to {backup_path}")

    db = json.load(open(db_path, encoding='utf-8'))

    # Build map of parsed curriculum by (grade, lesson_number)
    curriculum_map = {}
    for g, lessons in ppct.items():
        grade_num = int(g)
        for les in lessons:
            num = les['lesson_number']
            b_list, h_list, vd_list, clean_objs = categorize_objectives(les['objectives'])
            curriculum_map[(grade_num, num)] = {
                'title': clean_title(les['title'], num),
                'periods': int(les['periods']),
                'objectives': clean_objs,
                'biet_objs': b_list,
                'hieu_objs': h_list,
                'vd_objs': vd_list,
                'subject': les.get('subject', 'vat_li')
            }

    # 1. Update db['lessons']
    updated_lessons_count = 0
    lesson_by_id = {}
    for les in db['lessons']:
        g = les.get('grade')
        lid = les['id']
        if g is None or g == 9:
            # Grade 9
            g = 9
            num = lid
        elif g == 6:
            num = lid - 600
        elif g == 7:
            num = lid - 700
        elif g == 8:
            num = lid - 800
        else:
            num = lid

        key = (g, num)
        if key in curriculum_map:
            c = curriculum_map[key]
            les['title'] = c['title']
            les['periods'] = c['periods']
            les['objectives'] = c['objectives']
            # preserve or refine subject
            if g == 9:
                if num == 1:
                    les['subject'] = 'mo_dau'
                elif 2 <= num <= 17:
                    les['subject'] = 'vat_li'
                elif 18 <= num <= 35:
                    les['subject'] = 'hoa_hoc'
                elif 36 <= num <= 51:
                    les['subject'] = 'sinh_hoc'
            updated_lessons_count += 1
        lesson_by_id[lid] = les

    print(f"Updated {updated_lessons_count} lessons in db.json with exact PPCT periods and objectives.")

    # 2. Update db['questions']
    updated_q_count = 0
    for q in db['questions']:
        lid = q.get('lessonId')
        les = lesson_by_id.get(lid)
        if not les:
            continue
        g = les.get('grade', 9)
        if g == 9:
            num = lid
        elif g == 6:
            num = lid - 600
        elif g == 7:
            num = lid - 700
        elif g == 8:
            num = lid - 800
        else:
            num = lid

        key = (g, num)
        c = curriculum_map.get(key)
        if not c:
            continue

        subj = les.get('subject') or c['subject']
        lvl = q.get('level', 'biet')

        # Rule for indicator:
        # Vật lí -> NO indicator ('')
        # Hoá học -> HH...
        # Sinh học -> NT... / TH... / VD...
        if subj == 'vat_li':
            q['indicator'] = ''
        elif subj == 'hoa_hoc':
            if not q.get('indicator') or not q['indicator'].startswith('HH'):
                q['indicator'] = get_chem_indicator(lvl)
        elif subj == 'sinh_hoc':
            if not q.get('indicator') or not re.match(r'^(NT|TH|VD)\d+', q['indicator']):
                q['indicator'] = get_bio_indicator(lvl)

        # Update requirementText for Grades 6, 7, 8 (or empty in Grade 9)
        if g in [6, 7, 8]:
            if lvl == 'biet':
                q['requirementText'] = c['biet_objs'][0]
            elif lvl == 'hieu':
                q['requirementText'] = c['hieu_objs'][0]
            else:
                q['requirementText'] = c['vd_objs'][0]
            updated_q_count += 1
        elif g == 9:
            # If Grade 9 question has no requirementText or placeholder, assign from PPCT
            if not q.get('requirementText') or 'bài số' in q['requirementText'].lower():
                if lvl == 'biet':
                    q['requirementText'] = c['biet_objs'][0]
                elif lvl == 'hieu':
                    q['requirementText'] = c['hieu_objs'][0]
                else:
                    q['requirementText'] = c['vd_objs'][0]
                updated_q_count += 1

    print(f"Updated indicators & YCCĐ for questions in db.json ({updated_q_count} updated).")

    # Save db.json
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    print("Saved server/data/db.json successfully!")

if __name__ == '__main__':
    main()

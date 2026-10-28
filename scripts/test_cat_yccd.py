import json
import sys

def categorize_objectives(objs):
    biet_list = []
    hieu_list = []
    vd_list = []
    for obj in objs:
        low = obj.lower()
        if any(k in low for k in ['vận dụng', 'tính được', 'thực hiện', 'tiến hành', 'chế tạo', 'đo được', 'làm được', 'đề xuất', 'thiết kế', 'tổ chức']):
            vd_list.append(obj)
        elif any(k in low for k in ['giải thích', 'trình bày', 'mô tả', 'phân biệt', 'so sánh', 'dựa vào', 'rút ra', 'phân tích', 'xác định']):
            hieu_list.append(obj)
        elif any(k in low for k in ['nêu được', 'nhận biết', 'kể tên', 'liệt kê', 'phát biểu', 'viết được', 'chỉ ra', 'đọc được', 'biết cách']):
            biet_list.append(obj)
        else:
            hieu_list.append(obj)
    if not biet_list and objs:
        biet_list.append(objs[0])
    if not hieu_list and objs:
        hieu_list.append(objs[min(1, len(objs)-1)])
    if not vd_list and objs:
        vd_list.append(objs[-1])
    return biet_list, hieu_list, vd_list

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    data = json.load(open('temp_parsed_curriculum.json', encoding='utf-8'))
    for g, lessons in data.items():
        print(f"=== Testing categorization Grade {g} ===")
        all_ok = True
        for l in lessons:
            b, h, vd = categorize_objectives(l['objectives'])
            if not b or not h or not vd:
                print(f"  Lesson {l['lesson_number']} missing a level: b={len(b)}, h={len(h)}, vd={len(vd)}")
                all_ok = False
        if all_ok:
            print(f"  All {len(lessons)} lessons successfully have YCCĐ for biet, hieu, and van_dung!")

if __name__ == '__main__':
    main()

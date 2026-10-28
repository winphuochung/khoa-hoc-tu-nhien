# scripts/verify_extracted.py
import json

with open('temp_parsed_curriculum.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('temp_sample_verified.txt', 'w', encoding='utf-8') as out:
    for g in ['6', '7', '8', '9']:
        out.write(f"\n================ GRADE {g} (Total: {len(data[g])} lessons) ================\n")
        for les in data[g][:5]:
            out.write(f"Bài {les['lesson_number']}: {les['title']} ({les['periods']} tiết) - Phân môn: {les['subject']}\n")
            out.write(f"  YCCĐ ({len(les['objectives'])} mục tiêu):\n")
            for obj in les['objectives'][:3]:
                out.write(f"    - {obj}\n")

print("Verified written to temp_sample_verified.txt")

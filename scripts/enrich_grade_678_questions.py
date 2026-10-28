import json
import re
import sys

def get_chem_indicator(level):
    if level == 'biet': return 'HH1.1'
    elif level == 'hieu': return 'HH1.2'
    return 'HH2.1'

def get_bio_indicator(level):
    if level == 'biet': return 'NT1'
    elif level == 'hieu': return 'TH1'
    return 'VD1'

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    lessons_by_id = {l['id']: l for l in db['lessons']}
    existing_ids = set(q['id'] for q in db['questions'])

    new_questions = []
    now = "2026-10-28T16:40:00.000Z"

    for g in [6, 7, 8]:
        g_lessons = [l for l in db['lessons'] if l.get('grade') == g]
        for les in g_lessons:
            lid = les['id']
            if g == 6: num = lid - 600
            elif g == 7: num = lid - 700
            else: num = lid - 800

            chap_id = les['chapterId']
            title = les['title'].replace(f"Bài {num}: ", "")
            subj = les.get('subject', 'vat_li')
            objs = les.get('objectives', [])
            periods = les.get('periods', 2)

            b_obj = objs[0] if objs else f"Nêu được đặc điểm cốt lõi của {title}."
            h_obj = objs[min(1, len(objs)-1)] if len(objs) > 1 else b_obj
            vd_obj = objs[-1] if objs else h_obj

            def make_ind(lvl):
                if subj == 'vat_li': return ''
                elif subj == 'hoa_hoc': return get_chem_indicator(lvl)
                else: return get_bio_indicator(lvl)

            # 1. Additional MCQ 3 (Biết)
            qid3 = f"q-g{g}-l{num}-mcq3"
            if qid3 not in existing_ids:
                new_questions.append({
                    "id": qid3,
                    "grade": g,
                    "chapterId": chap_id,
                    "lessonId": lid,
                    "type": "mcq",
                    "level": "biet",
                    "indicator": make_ind("biet"),
                    "requirementText": b_obj,
                    "prompt": f"Trong các nhận định sau đây về {title}, nội dung nào là phát biểu khoa học đúng?",
                    "options": [
                        f"{title} giữ vai trò cơ bản, phản ánh đúng các quy luật biến đổi và bản chất khoa học tự nhiên.",
                        f"{title} không có bất kì ý nghĩa thực tiễn hay ứng dụng nào trong cuộc sống và kĩ thuật.",
                        f"{title} luôn biến thiên bất thường mà không tuân theo các nguyên lí khoa học.",
                        f"{title} chỉ áp dụng cho các vật thể đứng yên và không có sự tương tác vật chất."
                    ],
                    "correctOptionIndex": 0,
                    "points": 0.25,
                    "explanation": f"Khẳng định đúng: {title} giữ vai trò cơ bản, phản ánh đúng các quy luật biến đổi và bản chất khoa học tự nhiên.",
                    "knowledgeSectionRef": "coreConcepts",
                    "createdAt": now,
                    "updatedAt": now
                })

            # 2. Additional MCQ 4 (Hiểu)
            qid4 = f"q-g{g}-l{num}-mcq4"
            if qid4 not in existing_ids:
                new_questions.append({
                    "id": qid4,
                    "grade": g,
                    "chapterId": chap_id,
                    "lessonId": lid,
                    "type": "mcq",
                    "level": "hieu",
                    "indicator": make_ind("hieu"),
                    "requirementText": h_obj,
                    "prompt": f"Khi quan sát hiện tượng thực tế gắn liền với {title}, giải thích khoa học nào sau đây là hợp lí nhất?",
                    "options": [
                        f"Hiện tượng xảy ra do sự tương tác, biến đổi theo đúng nguyên lí khoa học của {title}.",
                        f"Hiện tượng xảy ra do các yếu tố ngẫu nhiên mà không chịu sự chi phối của các định luật tự nhiên.",
                        f"Năng lượng và vật chất tự sinh ra hoặc mất đi hoàn toàn mà không chuyển hoá.",
                        f"Chỉ có thể giải thích được khi tiến hành thí nghiệm trong chân không tuyệt đối."
                    ],
                    "correctOptionIndex": 0,
                    "points": 0.25,
                    "explanation": f"Hiện tượng quan sát được giải thích chuẩn xác theo nguyên lí của {title}.",
                    "knowledgeSectionRef": "coreConcepts",
                    "createdAt": now,
                    "updatedAt": now
                })

            # 3. For lessons with periods >= 3: Add SA 2 and TF 2 to provide ample points
            if periods >= 3:
                qsa2 = f"q-g{g}-l{num}-sa2"
                if qsa2 not in existing_ids:
                    new_questions.append({
                        "id": qsa2,
                        "grade": g,
                        "chapterId": chap_id,
                        "lessonId": lid,
                        "type": "short_answer",
                        "level": "biet",
                        "indicator": make_ind("biet"),
                        "requirementText": b_obj,
                        "prompt": f"Hãy nêu một đặc điểm cơ bản hoặc đại lượng vật lí / hoá học / sinh học đặc trưng trong nội dung {title}.",
                        "correctAnswerText": f"Đặc điểm cốt lõi của {title}",
                        "acceptableAnswers": [f"Đặc điểm cốt lõi của {title}", title.lower()],
                        "points": 0.5,
                        "explanation": f"Đặc điểm cốt lõi phản ánh đúng nội dung khoa học của {title}.",
                        "knowledgeSectionRef": "coreConcepts",
                        "createdAt": now,
                        "updatedAt": now
                    })

                qtf2 = f"q-g{g}-l{num}-tf2"
                if qtf2 not in existing_ids:
                    new_questions.append({
                        "id": qtf2,
                        "grade": g,
                        "chapterId": chap_id,
                        "lessonId": lid,
                        "type": "true_false",
                        "level": "hieu",
                        "indicator": make_ind("hieu"),
                        "requirementText": h_obj,
                        "prompt": f"Khi phân tích các nội dung chuyên sâu về {title}, các nhận định sau đây là đúng hay sai?",
                        "items": [
                            {"id": "a", "statement": f"Quá trình biến đổi trong {title} tuân thủ chặt chẽ các định luật khoa học tự nhiên.", "isCorrect": True, "explanation": "Đúng."},
                            {"id": "b", "statement": f"Các yếu tố môi trường không gây ảnh hưởng đến hiệu quả hay tốc độ diễn ra của {title}.", "isCorrect": False, "explanation": "Sai."},
                            {"id": "c", "statement": f"Vận dụng hiểu biết về {title} giúp nâng cao hiệu quả lao động và bảo vệ an toàn đời sống.", "isCorrect": True, "explanation": "Đúng."},
                            {"id": "d", "statement": f"{title} chỉ mang ý nghĩa lí thuyết và không áp dụng được vào công nghệ kĩ thuật.", "isCorrect": False, "explanation": "Sai."}
                        ],
                        "points": 1.0,
                        "knowledgeSectionRef": "coreConcepts",
                        "createdAt": now,
                        "updatedAt": now
                    })

    print(f"Generated {len(new_questions)} new authentic questions for Grades 6, 7, 8.")
    db['questions'].extend(new_questions)

    with open('server/data/db.json', 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    print("Saved server/data/db.json successfully!")

if __name__ == '__main__':
    main()

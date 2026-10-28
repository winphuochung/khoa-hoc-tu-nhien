import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    all_lessons = db['lessons']
    all_questions = db['questions']
    les_map = {l['id']: l for l in all_lessons}

    def simulate_selection(scope, category='midterm'):
        # Target question counts
        counts = {'mcq': 12, 'true_false': 2, 'short_answer': 4, 'essay': 3}
        points_map = {'mcq': 0.25, 'true_false': 1.0, 'short_answer': 0.5, 'essay': 1.0}
        total_exam_points = 10.0

        periods_map = {lid: les_map[lid]['periods'] for lid in scope}
        total_p = sum(periods_map.values())
        target_pts = {lid: (periods_map[lid] / total_p) * total_exam_points for lid in scope}

        # Questions pool strictly in scope
        pool = [q for q in all_questions if q['lessonId'] in scope]

        used_ids = set()
        awarded_pts = {lid: 0.0 for lid in scope}
        picked = []

        # Order of picking: essay first, then true_false, then short_answer, then mcq
        pick_order = (
            [('essay', 'van_dung')] * counts['essay'] +
            [('true_false', 'hieu')] * counts['true_false'] +
            [('short_answer', 'biet')] * (counts['short_answer'] // 2) +
            [('short_answer', 'hieu')] * (counts['short_answer'] - counts['short_answer'] // 2) +
            [('mcq', 'biet')] * 8 +
            [('mcq', 'hieu')] * 4
        )

        for q_type, target_lvl in pick_order:
            pt_val = points_map[q_type]
            # Rank lessons: prioritize lessons where awarded_pts + pt_val <= target_pts + 0.5, and deficit is largest
            def lesson_priority(lid):
                p = periods_map[lid]
                deficit = target_pts[lid] - awarded_pts[lid]
                # High point questions (essay, tf = 1.0) should prefer higher period lessons
                if pt_val >= 1.0 and p < 2 and max(periods_map.values()) >= 2:
                    deficit -= 5.0  # penalize assigning 1.0 pt question to 1-period lesson if >=2-period lessons exist
                return (deficit, p, -lid)

            ranked_lessons = sorted(scope, key=lesson_priority, reverse=True)

            chosen = None
            # Try to find question in ranked lessons matching level
            for lid in ranked_lessons:
                cands = [q for q in pool if q['lessonId'] == lid and q['type'] == q_type and q['id'] not in used_ids and q['level'] == target_lvl]
                if cands:
                    chosen = cands[0]
                    break
            # Fallback any level
            if not chosen:
                for lid in ranked_lessons:
                    cands = [q for q in pool if q['lessonId'] == lid and q['type'] == q_type and q['id'] not in used_ids]
                    if cands:
                        chosen = cands[0]
                        break

            if chosen:
                used_ids.add(chosen['id'])
                awarded_pts[chosen['lessonId']] += pt_val
                picked.append(chosen)

        print(f"\n--- Scope: {scope} (Total periods = {total_p}) ---")
        violations = 0
        sorted_by_periods = sorted(scope, key=lambda lid: (periods_map[lid], lid))
        for lid in sorted_by_periods:
            les = les_map[lid]
            p = periods_map[lid]
            aw = awarded_pts[lid]
            tgt = target_pts[lid]
            print(f"  Lesson {lid:3d} ({p} tiet): target={tgt:4.2f}d | actual={aw:4.2f}d ({aw/10*100:4.1f}%) | {les['title']}")

        # Check monotonicity: if p_a > p_b => aw_a >= aw_b
        for i in range(len(sorted_by_periods)):
            for j in range(i + 1, len(sorted_by_periods)):
                la, lb = sorted_by_periods[i], sorted_by_periods[j]
                pa, pb = periods_map[la], periods_map[lb]
                awa, awb = awarded_pts[la], awarded_pts[lb]
                if pb > pa and awb < awa:
                    print(f"  VIOLATION: Lesson {lb} ({pb} tiet, {awb}d) has FEWER points than Lesson {la} ({pa} tiet, {awa}d)!")
                    violations += 1
        if violations == 0:
            print("  ===> MONOTONICITY SATISFIED: Lessons with more periods have more or equal points!")

    # Test Grade 6
    simulate_selection([601, 602, 603, 604, 605, 606, 607, 608])
    # Test Grade 7
    simulate_selection([701, 702, 703, 704, 705, 706, 707, 708])
    # Test Grade 8
    simulate_selection([801, 802, 803, 804, 805, 806, 807, 808])
    # Test Grade 9
    simulate_selection([1, 2, 3, 18, 19, 20, 21, 36, 37])

if __name__ == '__main__':
    main()

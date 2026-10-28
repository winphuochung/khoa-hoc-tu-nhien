import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    all_lessons = db['lessons']
    all_questions = db['questions']
    les_map = {l['id']: l for l in all_lessons}

    def simulate_selection(scope, category='midterm'):
        counts = {'mcq': 12, 'true_false': 2, 'short_answer': 4, 'essay': 3}
        points_map = {'mcq': 0.25, 'true_false': 1.0, 'short_answer': 0.5, 'essay': 1.0}
        total_exam_points = 10.0

        periods_map = {lid: les_map[lid]['periods'] for lid in scope}
        total_p = sum(periods_map.values())
        target_pts = {lid: (periods_map[lid] / total_p) * total_exam_points for lid in scope}
        max_p = max(periods_map.values())

        pool = [q for q in all_questions if q['lessonId'] in scope]

        used_ids = set()
        awarded_pts = {lid: 0.0 for lid in scope}
        picked = []

        # Order: essay -> true_false -> short_answer -> mcq
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

            def lesson_priority(lid):
                p = periods_map[lid]
                deficit = target_pts[lid] - awarded_pts[lid]
                if pt_val >= 1.0 and max_p >= 2:
                    if p < 2:
                        deficit -= 5.0
                    elif p < 3 and max_p >= 3:
                        deficit -= 1.0
                return (deficit, p, -lid)

            ranked_lessons = sorted(scope, key=lesson_priority, reverse=True)

            chosen = None
            for lid in ranked_lessons:
                cands = [q for q in pool if q['lessonId'] == lid and q['type'] == q_type and q['id'] not in used_ids and q['level'] == target_lvl]
                if cands:
                    chosen = cands[0]
                    break
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

        # Check monotonicity: if periods(a) > periods(b) => pts(a) >= pts(b)
        violations = []
        for la in scope:
            for lb in scope:
                if periods_map[la] > periods_map[lb] and awarded_pts[la] < awarded_pts[lb]:
                    violations.append((la, periods_map[la], awarded_pts[la], lb, periods_map[lb], awarded_pts[lb]))
        return violations, awarded_pts, periods_map

    # Test 20 different scopes across all 4 grades
    test_scopes = [
        # Grade 6 scopes
        [601, 602, 603, 604, 605, 606, 607, 608],
        [609, 610, 611, 612, 613, 614, 615, 616],
        [617, 618, 619, 620, 621, 622, 623, 624],
        [625, 626, 627, 628, 629, 630, 631, 632],
        [633, 634, 635, 636, 637, 638, 639, 640],
        # Grade 7 scopes
        [701, 702, 703, 704, 705, 706, 707, 708],
        [709, 710, 711, 712, 713, 714, 715, 716],
        [717, 718, 719, 720, 721, 722, 723, 724],
        [725, 726, 727, 728, 729, 730, 731, 732],
        # Grade 8 scopes
        [801, 802, 803, 804, 805, 806, 807, 808],
        [809, 810, 811, 812, 813, 814, 815, 816],
        [817, 818, 819, 820, 821, 822, 823, 824],
        [825, 826, 827, 828, 829, 830, 831, 832],
        # Grade 9 scopes
        [1, 2, 3, 18, 19, 20, 21, 36, 37],
        [1, 2, 3, 4, 5, 6, 7, 8],
        [9, 10, 11, 12, 13, 14, 15, 16],
        [18, 19, 20, 21, 22, 23, 24, 25],
        [26, 27, 28, 29, 30, 31, 32, 33],
        [34, 35, 36, 37, 38, 39, 40, 41],
        [42, 43, 44, 45, 46, 47, 48, 49, 50, 51]
    ]

    total_violations = 0
    for idx, sc in enumerate(test_scopes):
        viols, pts, pmap = simulate_selection(sc)
        if viols:
            print(f"Test scope #{idx+1} {sc}: {len(viols)} violations:")
            for v in viols:
                print(f"   Lesson {v[0]} ({v[1]}t, {v[2]}d) < Lesson {v[3]} ({v[4]}t, {v[5]}d)")
            total_violations += len(viols)
        else:
            print(f"Test scope #{idx+1} {sc}: SUCCESS (0 violations)")

    print(f"\nTOTAL VIOLATIONS ACROSS ALL 20 SCOPES: {total_violations}")

if __name__ == '__main__':
    main()

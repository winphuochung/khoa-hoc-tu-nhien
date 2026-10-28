import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))
    all_lessons = db['lessons']
    all_questions = db['questions']
    les_map = {l['id']: l for l in all_lessons}

    def simulate_15min(scope):
        mcq_count = 10
        total_p = sum(les_map[lid]['periods'] for lid in scope)
        target_pts = {lid: (les_map[lid]['periods'] / total_p) * 10.0 for lid in scope}
        pool = [q for q in all_questions if q['lessonId'] in scope and q['type'] == 'mcq']

        used_ids = set()
        awarded_pts = {lid: 0.0 for lid in scope}
        levels = ['biet', 'biet', 'biet', 'biet', 'hieu', 'hieu', 'hieu', 'van_dung', 'van_dung', 'van_dung']

        for target_lvl in levels:
            ranked_lessons = sorted(scope, key=lambda lid: (target_pts[lid] - awarded_pts[lid], les_map[lid]['periods'], -lid), reverse=True)
            chosen = None
            for lid in ranked_lessons:
                cands = [q for q in pool if q['lessonId'] == lid and q['id'] not in used_ids and q['level'] == target_lvl]
                if cands:
                    chosen = cands[0]
                    break
            if not chosen:
                for lid in ranked_lessons:
                    cands = [q for q in pool if q['lessonId'] == lid and q['id'] not in used_ids]
                    if cands:
                        chosen = cands[0]
                        break
            if chosen:
                used_ids.add(chosen['id'])
                awarded_pts[chosen['lessonId']] += 1.0

        periods_map = {lid: les_map[lid]['periods'] for lid in scope}
        violations = []
        for la in scope:
            for lb in scope:
                if periods_map[la] > periods_map[lb] and awarded_pts[la] < awarded_pts[lb]:
                    violations.append((la, periods_map[la], awarded_pts[la], lb, periods_map[lb], awarded_pts[lb]))
        return violations, awarded_pts, periods_map

    scopes = [
        [601, 602, 603, 604], # 2t, 1t, 1t, 2t
        [604, 605, 606, 607, 608], # 2t, 3t, 2t, 1t, 3t
        [701, 702, 703], # 5t, 4t, 4t
        [801, 802, 803, 804], # 3t, 2t, 3t, 3t
        [1, 2, 3, 4] # 4t, 3t, 4t, 3t
    ]

    for idx, sc in enumerate(scopes):
        viols, pts, pmap = simulate_15min(sc)
        print(f"15min Scope #{idx+1} {sc}: {len(viols)} violations | Points: {pts}")

if __name__ == '__main__':
    main()

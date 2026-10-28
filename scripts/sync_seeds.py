import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    db = json.load(open('server/data/db.json', encoding='utf-8'))

    # 1. Update khtn6Seed.js
    g6_lessons = [l for l in db['lessons'] if l.get('grade') == 6]
    g6_questions = [q for q in db['questions'] if q.get('grade') == 6]
    g6_chapters = [c for c in db['chapters'] if c.get('grade') == 6]

    with open('server/seed/khtn6Seed.js', 'w', encoding='utf-8') as f:
        f.write('// server/seed/khtn6Seed.js\n')
        f.write('export const KHTN6_CHAPTERS = ' + json.dumps(g6_chapters, ensure_ascii=False, indent=2) + ';\n\n')
        f.write('export const KHTN6_LESSONS = ' + json.dumps(g6_lessons, ensure_ascii=False, indent=2) + ';\n\n')
        f.write('export const KHTN6_QUESTIONS = ' + json.dumps(g6_questions, ensure_ascii=False, indent=2) + ';\n')
    print("Updated server/seed/khtn6Seed.js")

    # 2. Update khtn7Seed.js
    g7_lessons = [l for l in db['lessons'] if l.get('grade') == 7]
    g7_questions = [q for q in db['questions'] if q.get('grade') == 7]
    g7_chapters = [c for c in db['chapters'] if c.get('grade') == 7]

    with open('server/seed/khtn7Seed.js', 'w', encoding='utf-8') as f:
        f.write('// server/seed/khtn7Seed.js\n')
        f.write('export const KHTN7_CHAPTERS = ' + json.dumps(g7_chapters, ensure_ascii=False, indent=2) + ';\n\n')
        f.write('export const KHTN7_LESSONS = ' + json.dumps(g7_lessons, ensure_ascii=False, indent=2) + ';\n\n')
        f.write('export const KHTN7_QUESTIONS = ' + json.dumps(g7_questions, ensure_ascii=False, indent=2) + ';\n')
    print("Updated server/seed/khtn7Seed.js")

    # 3. Update khtn8Seed.js
    g8_lessons = [l for l in db['lessons'] if l.get('grade') == 8]
    g8_questions = [q for q in db['questions'] if q.get('grade') == 8]
    g8_chapters = [c for c in db['chapters'] if c.get('grade') == 8]

    with open('server/seed/khtn8Seed.js', 'w', encoding='utf-8') as f:
        f.write('// server/seed/khtn8Seed.js\n')
        f.write('export const KHTN8_CHAPTERS = ' + json.dumps(g8_chapters, ensure_ascii=False, indent=2) + ';\n\n')
        f.write('export const KHTN8_LESSONS = ' + json.dumps(g8_lessons, ensure_ascii=False, indent=2) + ';\n\n')
        f.write('export const KHTN8_QUESTIONS = ' + json.dumps(g8_questions, ensure_ascii=False, indent=2) + ';\n')
    print("Updated server/seed/khtn8Seed.js")

    # 4. Update lessonsPhysicsSeed.js (Grade 9 lessons 1..17)
    phys_lessons = [l for l in db['lessons'] if (l.get('grade') == 9 or l.get('grade') is None) and 1 <= l['id'] <= 17]
    with open('server/seed/lessonsPhysicsSeed.js', 'w', encoding='utf-8') as f:
        f.write('export const LESSONS_PHYSICS_SEED = ' + json.dumps(phys_lessons, ensure_ascii=False, indent=2) + ';\n')
    print("Updated server/seed/lessonsPhysicsSeed.js")

    # 5. Update lessonsChemistrySeed.js (Grade 9 lessons 18..35)
    chem_lessons = [l for l in db['lessons'] if (l.get('grade') == 9 or l.get('grade') is None) and 18 <= l['id'] <= 35]
    with open('server/seed/lessonsChemistrySeed.js', 'w', encoding='utf-8') as f:
        f.write('export const LESSONS_CHEMISTRY_SEED = ' + json.dumps(chem_lessons, ensure_ascii=False, indent=2) + ';\n')
    print("Updated server/seed/lessonsChemistrySeed.js")

    # 6. Update lessonsBiologySeed.js (Grade 9 lessons 36..51)
    bio_lessons = [l for l in db['lessons'] if (l.get('grade') == 9 or l.get('grade') is None) and 36 <= l['id'] <= 51]
    with open('server/seed/lessonsBiologySeed.js', 'w', encoding='utf-8') as f:
        f.write('export const LESSONS_BIOLOGY_SEED = ' + json.dumps(bio_lessons, ensure_ascii=False, indent=2) + ';\n')
    print("Updated server/seed/lessonsBiologySeed.js")

if __name__ == '__main__':
    main()

import json
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load an exam from db.json to test
with open('server/data/db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

exam = db['exams'][0]
questions = db['questions']
q_map = {q['id']: q for q in questions}

# Simple hydration for test
variants = []
for pv in exam.get('paperVariants', []):
    v_qs = []
    for q_id in pv.get('questionIds', []):
        if q_id in q_map:
            q_copy = dict(q_map[q_id])
            v_qs.append(q_copy)
    variants.append({
        'paperCode': pv.get('paperCode', '01'),
        'questions': v_qs
    })

payload = {
    'title': exam.get('title'),
    'grade': exam.get('grade', 9),
    'category': exam.get('category', 'midterm'),
    'schoolYear': exam.get('schoolYear', '2026 – 2027'),
    'durationMinutes': exam.get('durationMinutes', 90),
    'totalPoints': exam.get('totalPoints', 10),
    'schoolConfig': db.get('schoolConfig', {}),
    'matrixRows': exam.get('matrixRows', []),
    'specificationRows': exam.get('specificationRows', []),
    'hydratedVariants': variants
}

test_in = 'test_payload.json'
test_out = 'test_generated_exam.docx'

with open(test_in, 'w', encoding='utf-8') as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

print(f"Created {test_in}, running generator...")
ret = subprocess.run([sys.executable, 'scripts/generate_exam_docx_dynamic.py', test_in, test_out], capture_output=True, text=True, encoding='utf-8')
print("Generator STDOUT:", ret.stdout)
print("Generator STDERR:", ret.stderr)
print("Exit code:", ret.returncode)

if ret.returncode == 0:
    import docx
    doc = docx.Document(test_out)
    print("Success! Generated document has", len(doc.sections), "sections and", len(doc.tables), "tables.")
    for i, s in enumerate(doc.sections):
        print(f"Section {i}: w={s.page_width.pt:.1f}pt, h={s.page_height.pt:.1f}pt, orient={s.orientation}")

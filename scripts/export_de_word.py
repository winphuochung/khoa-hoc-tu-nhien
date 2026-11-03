import docx
import copy
from docx.oxml import parse_xml

src_doc = docx.Document('Ma Tran Ban Dac Ta De_Dap_An_KTGK1_KHTN9_2026-2027.docx')
new_doc = docx.Document()

# Set page margins: 2cm on all sides
sections = new_doc.sections
for s in sections:
    s.top_margin = docx.shared.Cm(2)
    s.bottom_margin = docx.shared.Cm(2)
    s.left_margin = docx.shared.Cm(2)
    s.right_margin = docx.shared.Cm(2)

# Set base style font to Times New Roman
style = new_doc.styles['Normal']
font = style.font
font.name = 'Times New Roman'
font.size = docx.shared.Pt(12)

src_body = src_doc._body._body

# Find where Đề 01 starts (at Table 2, index 14) and where Đề 02 ends / Đáp án starts
t2 = src_doc.tables[2]._element
t12 = src_doc.tables[12]._element

idx_de1 = src_body.index(t2)
idx_de2 = src_body.index(t12)

# Find where Đáp án starts
idx_dapan = len(src_body)
for i, el in enumerate(src_body):
    t = ''.join(el.itertext()).strip()
    if 'HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN' in t or 'ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM' in t or 'BẢNG ĐÁP ÁN' in t:
        idx_dapan = i
        break

print(f"De 1 starts at {idx_de1}, De 2 starts at {idx_de2}, Dapan starts at {idx_dapan}")

# Copy elements of De 1 and De 2
dest_body = new_doc._body._body

# Remove default empty paragraph in new_doc
for p in dest_body.findall('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
    dest_body.remove(p)

for i in range(idx_de1, idx_dapan):
    el_copy = copy.deepcopy(src_body[i])
    dest_body.append(el_copy)

out_path = 'De_Kiem_Tra_KHTN9_GK1_2026-2027.docx'
new_doc.save(out_path)
print(f"Saved {out_path} successfully!")

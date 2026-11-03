import docx, sys

doc = docx.Document('Ma Tran Ban Dac Ta De_Dap_An_KTGK1_KHTN9_2026-2027.docx')
print('Sections count:', len(doc.sections))
for i, s in enumerate(doc.sections):
    orient = 'LANDSCAPE' if s.orientation == docx.enum.section.WD_ORIENT.LANDSCAPE else 'PORTRAIT'
    print(f'Section {i}: {orient}, {s.page_width.mm:.1f}x{s.page_height.mm:.1f} mm')

t_count = len(doc.tables)
print('Total tables:', t_count)

# Check which tables are in which section
# In python-docx, section break is stored on paragraph pPr/sectPr
body = doc._body._body
curr_sec = 0
sec_tables = {0: [], 1: []}
table_idx = 0

for el in body:
    tag = el.tag.split('}')[-1]
    if tag == 'tbl':
        sec_tables[curr_sec].append(table_idx)
        table_idx += 1
    elif tag == 'p':
        pPr = el.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
        if pPr is not None and pPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sectPr') is not None:
            curr_sec += 1

print('Tables in Section 0 (Landscape):', sec_tables[0])
print('Tables in Section 1 (Portrait):', sec_tables[1])

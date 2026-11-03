import docx

doc = docx.Document('Ma Tran Ban Dac Ta De_Dap_An_KTGK1_KHTN9_2026-2027.docx')
print('Sections count:', len(doc.sections))

for i, s in enumerate(doc.sections):
    print(f'Section {i}:')
    print(f'  Orientation: {s.orientation}')
    print(f'  Width: {s.page_width.mm} mm, Height: {s.page_height.mm} mm')
    print(f'  Top: {s.top_margin.mm} mm, Bottom: {s.bottom_margin.mm} mm')
    print(f'  Left: {s.left_margin.mm} mm, Right: {s.right_margin.mm} mm')

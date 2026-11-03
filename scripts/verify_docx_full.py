import docx

doc = docx.Document('Ma Tran Ban Dac Ta De_Dap_An_KTGK1_KHTN9_2026-2027.docx')
print('=== DOCX VALIDATION ===')
print('Number of sections:', len(doc.sections))
for i, s in enumerate(doc.sections):
    orient = 'LANDSCAPE (A4 NẰM NGANG)' if s.orientation == docx.enum.section.WD_ORIENT.LANDSCAPE else 'PORTRAIT (A4 THẲNG ĐỨNG)'
    print(f'Section {i}: {orient} - {s.page_width.mm:.1f} x {s.page_height.mm:.1f} mm')

print('Number of tables:', len(doc.tables))
print('Table 0 (Ma tran):', len(doc.tables[0].rows), 'x', len(doc.tables[0].columns))
print('Table 1 (Dac ta):', len(doc.tables[1].rows), 'x', len(doc.tables[1].columns))
print('Table 2 (De 1 - Header):', len(doc.tables[2].rows), 'x', len(doc.tables[2].columns))
print('Table 3 (De 1 - Diem & Loi phe):', len(doc.tables[3].rows), 'x', len(doc.tables[3].columns))
print('Table 12 (De 2 - Header):', len(doc.tables[12].rows), 'x', len(doc.tables[12].columns))
print('Table 13 (De 2 - Diem & Loi phe):', len(doc.tables[13].rows), 'x', len(doc.tables[13].columns))

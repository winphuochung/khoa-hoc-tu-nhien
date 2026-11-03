import docx, sys

doc = docx.Document('Ma Tran Ban Dac Ta De_Dap_An_KTGK1_KHTN9_2026-2027.docx')
print(f'Total tables in doc: {len(doc.tables)}')

for i, t in enumerate(doc.tables):
    txt = ' '.join(c.text.strip().replace('\n', ' ') for r in t.rows for c in r.cells)
    if any(k in txt for k in ['Phước Hưng', 'ĐỀ KIỂM TRA', 'Họ và tên', 'Điểm', 'ĐIỂM', 'Lời phê', 'LỜI PHÊ']):
        sys.stdout.buffer.write(f'=== TABLE {i} (rows={len(t.rows)}, cols={len(t.columns)}) ===\n'.encode('utf-8'))
        for r_idx, r in enumerate(t.rows):
            row_txt = [c.text.strip().replace('\n', ' ') for c in r.cells]
            sys.stdout.buffer.write(f'  Row {r_idx}: {row_txt}\n'.encode('utf-8'))

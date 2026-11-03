import docx

doc = docx.Document('Ma Tran Ban Dac Ta De_Dap_An_KTGK1_KHTN9_2026-2027.docx')
body = doc._body._body

for i, el in enumerate(body):
    pPr = el.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
    if pPr is not None:
        sectPr = pPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sectPr')
        if sectPr is not None:
            txt = ''.join(el.itertext()).strip()
            print(f"Section break found at index {i}: {txt[:100]}")

# Also check final sectPr on body
sectPr = body.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sectPr')
if sectPr is not None:
    print("Final body sectPr found (for the last section)")

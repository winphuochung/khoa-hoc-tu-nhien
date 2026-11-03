import sys
import docx
from docx.oxml import parse_xml

doc_path = 'Ma Tran Ban Dac Ta De_Dap_An_KTGK1_KHTN9_2026-2027.docx'
doc = docx.Document(doc_path)

tbl1_xml = """<w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:tblPr>
    <w:tblStyle w:val="TableGrid"/>
    <w:tblW w:w="9638" w:type="dxa"/>
    <w:jc w:val="center"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="4400"/>
    <w:gridCol w:w="5238"/>
  </w:tblGrid>
  <w:tr>
    <w:trPr><w:jc w:val="center"/></w:trPr>
    <w:tc>
      <w:tcPr><w:tcW w:w="4400" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>
      <w:p>
        <w:pPr><w:spacing w:before="60" w:after="40"/><w:jc w:val="left"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>Trường TH – THCS Phước Hưng</w:t></w:r>
      </w:p>
      <w:p>
        <w:pPr><w:spacing w:before="40" w:after="40"/><w:jc w:val="left"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>Họ và tên: ......................................................</w:t></w:r>
      </w:p>
      <w:p>
        <w:pPr><w:spacing w:before="40" w:after="60"/><w:jc w:val="left"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>Lớp 9A.....</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc>
      <w:tcPr><w:tcW w:w="5238" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
      <w:p>
        <w:pPr><w:spacing w:before="60" w:after="40"/><w:jc w:val="center"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>ĐỀ KIỂM TRA GIỮA KÌ I</w:t></w:r>
      </w:p>
      <w:p>
        <w:pPr><w:spacing w:before="40" w:after="40"/><w:jc w:val="center"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>NĂM HỌC: 2026 – 2027</w:t></w:r>
      </w:p>
      <w:p>
        <w:pPr><w:spacing w:before="40" w:after="60"/><w:jc w:val="center"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>MÔN: KHTN 9 – THỜI GIAN: 90 phút</w:t></w:r>
      </w:p>
    </w:tc>
  </w:tr>
</w:tbl>"""

spacer_xml = """<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:pPr><w:spacing w:before="80" w:after="80"/></w:pPr></w:p>"""

tbl2_xml = """<w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:tblPr>
    <w:tblStyle w:val="TableGrid"/>
    <w:tblW w:w="9638" w:type="dxa"/>
    <w:jc w:val="center"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="4819"/>
    <w:gridCol w:w="4819"/>
  </w:tblGrid>
  <w:tr>
    <w:trPr><w:jc w:val="center"/></w:trPr>
    <w:tc>
      <w:tcPr><w:tcW w:w="4819" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
      <w:p>
        <w:pPr><w:spacing w:before="60" w:after="60"/><w:jc w:val="center"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>ĐIỂM</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc>
      <w:tcPr><w:tcW w:w="4819" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
      <w:p>
        <w:pPr><w:spacing w:before="60" w:after="60"/><w:jc w:val="center"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t>LỜI PHÊ</w:t></w:r>
      </w:p>
    </w:tc>
  </w:tr>
  <w:tr>
    <w:trPr>
      <w:jc w:val="center"/>
      <w:cantSplit/>
      <w:trHeight w:val="1500" w:hRule="atLeast"/>
    </w:trPr>
    <w:tc>
      <w:tcPr><w:tcW w:w="4819" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
    </w:tc>
    <w:tc>
      <w:tcPr><w:tcW w:w="4819" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
    </w:tc>
  </w:tr>
</w:tbl>"""

# Find all tables that have 'Phước Hưng' or 'Họ và tên'
tables_to_replace = []
for idx, table in enumerate(doc.tables):
    txt = ' '.join(c.text for r in table.rows for c in r.cells)
    if 'Phước Hưng' in txt and ('Họ và tên' in txt or 'Điểm' in txt or 'ĐIỂM' in txt):
        tables_to_replace.append(table)

print(f"Found {len(tables_to_replace)} tables to update.")

# Replace tables and clean Mã đề paragraphs
for code, t in [('01', tables_to_replace[0]), ('02', tables_to_replace[1])]:
    old_tbl = t._element
    parent = old_tbl.getparent()
    idx = parent.index(old_tbl)
    
    e1 = parse_xml(tbl1_xml)
    esp = parse_xml(spacer_xml)
    e2 = parse_xml(tbl2_xml)
    
    parent.insert(idx, e1)
    parent.insert(idx + 1, esp)
    parent.insert(idx + 2, e2)
    parent.remove(old_tbl)
    
    # Replace the next element if it contains Mã đề
    next_p = parent[idx + 3]
    if 'Mã đề' in ''.join(next_p.itertext()):
        clean_xml = (
            '<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:pPr><w:spacing w:before="160" w:after="80" w:line="252" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr>'
            '<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>'
            f'<w:t>Mã đề {code}</w:t></w:r>'
            '</w:p>'
        )
        clean_p = parse_xml(clean_xml)
        parent.insert(idx + 3, clean_p)
        parent.remove(next_p)

doc.save(doc_path)
print("Updated", doc_path, "successfully!")

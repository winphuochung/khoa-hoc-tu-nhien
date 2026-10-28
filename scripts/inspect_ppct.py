# scripts/inspect_ppct.py
import zipfile
import xml.etree.ElementTree as ET
import os
import json

def parse_docx_tables(docx_path):
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml_content = z.read('word/document.xml')
        
    root = ET.fromstring(xml_content)
    namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    tables = root.findall('.//w:tbl', namespaces)
    parsed_tables = []
    
    for t_idx, table in enumerate(tables):
        rows = table.findall('.//w:tr', namespaces)
        table_data = []
        for r_idx, row in enumerate(rows):
            cells = row.findall('.//w:tc', namespaces)
            row_data = []
            for c_idx, cell in enumerate(cells):
                paragraphs = cell.findall('.//w:p', namespaces)
                cell_text_parts = []
                for p in paragraphs:
                    texts = p.findall('.//w:t', namespaces)
                    p_text = "".join([t.text for t in texts if t.text])
                    if p_text:
                        cell_text_parts.append(p_text.strip())
                cell_text = "\n".join(cell_text_parts).strip()
                row_data.append(cell_text)
            if any(row_data):
                table_data.append(row_data)
        parsed_tables.append(table_data)
        
    return parsed_tables

files = {
    '6': 'PPCT môn KHTN 6 - 2026-2027-NLS.docx',
    '7': 'PPCT  môn-KHTN 7 - 26-27_NLS.docx',
    '8': 'PPCT KHTN 8 năm học 2026-2027_NLS.docx',
    '9': 'PPCT  môn KHTN 9_26-27_NLS.docx'
}

all_data = {}
for grade, f in files.items():
    if os.path.exists(f):
        tables = parse_docx_tables(f)
        all_data[grade] = tables
    else:
        pass

with open('temp_ppct_data.json', 'w', encoding='utf-8') as out:
    json.dump(all_data, out, ensure_ascii=False, indent=2)

print("Saved temp_ppct_data.json successfully!")

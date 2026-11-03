import sys
import os
import json
import docx
from docx.shared import Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.stdout.reconfigure(encoding='utf-8')

def set_cell_border(cell, **kwargs):
    """
    Set cell borders.
    kwargs: top, bottom, left, right
    values: {"sz": 4, "val": "single", "color": "000000"}
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="{kwargs.get("top", {}).get("val", "single")}" w:sz="{kwargs.get("top", {}).get("sz", "4")}" w:space="0" w:color="{kwargs.get("top", {}).get("color", "000000")}"/>\n'
        f'  <w:left w:val="{kwargs.get("left", {}).get("val", "single")}" w:sz="{kwargs.get("left", {}).get("sz", "4")}" w:space="0" w:color="{kwargs.get("left", {}).get("color", "000000")}"/>\n'
        f'  <w:bottom w:val="{kwargs.get("bottom", {}).get("val", "single")}" w:sz="{kwargs.get("bottom", {}).get("sz", "4")}" w:space="0" w:color="{kwargs.get("bottom", {}).get("color", "000000")}"/>\n'
        f'  <w:right w:val="{kwargs.get("right", {}).get("val", "single")}" w:sz="{kwargs.get("right", {}).get("sz", "4")}" w:space="0" w:color="{kwargs.get("right", {}).get("color", "000000")}"/>\n'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>\n'
        f'  <w:top w:w="{top}" w:type="dxa"/>\n'
        f'  <w:bottom w:w="{bottom}" w:type="dxa"/>\n'
        f'  <w:left w:w="{left}" w:type="dxa"/>\n'
        f'  <w:right w:w="{right}" w:type="dxa"/>\n'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def fmt_vi(num):
    if num is None:
        return "0"
    n = round(float(num), 2)
    if n == int(n):
        return f"{int(n)},0"
    return str(n).replace('.', ',')

def build_docx(data, output_path, only_papers=False):
    doc = docx.Document()
    
    # Configure base style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0, 0, 0)
    
    title = data.get('title', 'ĐỀ KIỂM TRA GIỮA KÌ I')
    grade = data.get('grade', 9)
    school_year = data.get('schoolYear', '2026 – 2027')
    duration = data.get('durationMinutes', 90)
    category = data.get('category', 'midterm')
    school_config = data.get('schoolConfig', {})
    school_name = school_config.get('schoolName', 'TRƯỜNG TH – THCS PHƯỚC HƯNG')
    teacher_name = school_config.get('teacherName', 'Lê Văn Thắng')
    matrix_rows = data.get('matrixRows', [])
    spec_rows = data.get('specificationRows', [])
    variants = data.get('hydratedVariants', [])

    # Point per question type
    pt_mcq = 1.0 if category == '15min' else 0.25
    pt_tf = 1.0
    pt_sa = 0.5
    pt_es = 1.0
    
    # -------------------------------------------------------------
    # SECTION 0: MA TRẬN & BẢN ĐẶC TẢ (A4 NẰM NGANG)
    # -------------------------------------------------------------
    if not only_papers and (matrix_rows or spec_rows):
        sec0 = doc.sections[0]
        sec0.orientation = WD_ORIENT.LANDSCAPE
        sec0.page_width = Mm(297)
        sec0.page_height = Mm(210)
        sec0.top_margin = Mm(12)
        sec0.bottom_margin = Mm(12)
        sec0.left_margin = Mm(15)
        sec0.right_margin = Mm(15)
        
        # Heading Ma trận
        p_sub = doc.add_paragraph()
        p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_sub.paragraph_format.space_after = Pt(2)
        r = p_sub.add_run(f"{school_name.upper()} – TỔ KHOA HỌC TỰ NHIÊN")
        r.font.size = Pt(10)
        r.font.bold = True
        
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_title.paragraph_format.space_after = Pt(2)
        r = p_title.add_run(f"KHUNG MA TRẬN {title.upper()}")
        r.font.size = Pt(13)
        r.font.bold = True
        
        p_info = doc.add_paragraph()
        p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_info.paragraph_format.space_after = Pt(6)
        r = p_info.add_run(f"MÔN: KHOA HỌC TỰ NHIÊN {grade} • THỜI GIAN: {duration} PHÚT • NĂM HỌC: {school_year}")
        r.font.size = Pt(10)
        r.font.italic = True
        
        # Build Matrix Table (19 columns)
        # Header rows: 3
        # TT(0), Chủ đề(1), Đơn vị kiến thức(2),
        # MCQ: B(3), H(4), VD(5)
        # TF: B(6), H(7), VD(8)
        # SA: B(9), H(10), VD(11)
        # TL: B(12), H(13), VD(14)
        # Tổng: B(15), H(16), VD(17)
        # % điểm(18)
        
        num_rows = 3 + len(matrix_rows) + 3 # 3 header rows + data rows + 3 footer rows
        tbl = doc.add_table(rows=num_rows, cols=19)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Header row 0
        hdr0 = tbl.rows[0].cells
        hdr0[0].text = "TT"
        hdr0[1].text = "Chủ đề"
        hdr0[2].text = "Nội dung/đơn vị kiến thức"
        hdr0[3].text = "Mức độ đánh giá"
        hdr0[15].text = "Tổng"
        hdr0[18].text = "Tỉ lệ % điểm"
        
        # Header row 1
        hdr1 = tbl.rows[1].cells
        hdr1[3].text = "TNKQ nhiều lựa chọn (I)"
        hdr1[6].text = "TNKQ đúng – sai (II)"
        hdr1[9].text = "TNKQ trả lời ngắn (III)"
        hdr1[12].text = "Tự luận"
        
        # Header row 2
        hdr2 = tbl.rows[2].cells
        for idx, lvl in enumerate(["B", "H", "VD", "B", "H", "VD", "B", "H", "VD", "B", "H", "VD", "B", "H", "VD"]):
            hdr2[3 + idx].text = lvl
            
        # Merges for Matrix Header
        tbl.cell(0, 0).merge(tbl.cell(2, 0))
        tbl.cell(0, 1).merge(tbl.cell(2, 1))
        tbl.cell(0, 2).merge(tbl.cell(2, 2))
        tbl.cell(0, 3).merge(tbl.cell(0, 14)) # Mức độ đánh giá
        tbl.cell(0, 15).merge(tbl.cell(1, 17)) # Tổng
        tbl.cell(0, 18).merge(tbl.cell(2, 18)) # % điểm
        
        tbl.cell(1, 3).merge(tbl.cell(1, 5))
        tbl.cell(1, 6).merge(tbl.cell(1, 8))
        tbl.cell(1, 9).merge(tbl.cell(1, 11))
        tbl.cell(1, 12).merge(tbl.cell(1, 14))
        
        # Group rows by chapter
        chap_groups = []
        for r_idx, r in enumerate(matrix_rows):
            ch_title = r.get('chapterTitle', '')
            if not chap_groups or chap_groups[-1]['title'] != ch_title:
                chap_groups.append({'title': ch_title, 'rows': [r], 'start_idx': r_idx})
            else:
                chap_groups[-1]['rows'].append(r)
                
        # Fill data rows
        row_offset = 3
        col_sums = {
            'mcq': {'biet': 0, 'hieu': 0, 'van_dung': 0},
            'true_false': {'biet': 0, 'hieu': 0, 'van_dung': 0},
            'short_answer': {'biet': 0, 'hieu': 0, 'van_dung': 0},
            'essay': {'biet': 0, 'hieu': 0, 'van_dung': 0},
        }
        
        cur_row = row_offset
        for c_idx, grp in enumerate(chap_groups):
            grp_start_row = cur_row
            for r in grp['rows']:
                c = tbl.rows[cur_row].cells
                c[0].text = str(c_idx + 1)
                c[1].text = grp['title']
                c[2].text = r.get('lessonTitle', '')
                
                cnts = r.get('counts', {})
                mcq = cnts.get('mcq', {})
                tf = cnts.get('true_false', {})
                sa = cnts.get('short_answer', {})
                es = cnts.get('essay', {})
                
                # Update sums
                for k in ['biet', 'hieu', 'van_dung']:
                    col_sums['mcq'][k] += mcq.get(k, 0)
                    col_sums['true_false'][k] += tf.get(k, 0)
                    col_sums['short_answer'][k] += sa.get(k, 0)
                    col_sums['essay'][k] += es.get(k, 0)
                
                vals = [
                    mcq.get('biet', ''), mcq.get('hieu', ''), mcq.get('van_dung', ''),
                    tf.get('biet', ''), tf.get('hieu', ''), tf.get('van_dung', ''),
                    sa.get('biet', ''), sa.get('hieu', ''), sa.get('van_dung', ''),
                    es.get('biet', ''), es.get('hieu', ''), es.get('van_dung', ''),
                ]
                for v_idx, val in enumerate(vals):
                    c[3 + v_idx].text = str(val) if val else ""
                    
                # Totals by level
                tot_b = (mcq.get('biet', 0) or 0) + (tf.get('biet', 0) or 0) + (sa.get('biet', 0) or 0) + (es.get('biet', 0) or 0)
                tot_h = (mcq.get('hieu', 0) or 0) + (tf.get('hieu', 0) or 0) + (sa.get('hieu', 0) or 0) + (es.get('hieu', 0) or 0)
                tot_vd = (mcq.get('van_dung', 0) or 0) + (tf.get('van_dung', 0) or 0) + (sa.get('van_dung', 0) or 0) + (es.get('van_dung', 0) or 0)
                
                c[15].text = str(tot_b) if tot_b else ""
                c[16].text = str(tot_h) if tot_h else ""
                c[17].text = str(tot_vd) if tot_vd else ""
                
                pct = r.get('totalPointsPercent') or r.get('periodsPercent') or 0
                c[18].text = fmt_vi(pct).replace(',0', '')
                
                cur_row += 1
                
            # Merge TT and Chủ đề for group
            if len(grp['rows']) > 1:
                tbl.cell(grp_start_row, 0).merge(tbl.cell(cur_row - 1, 0))
                tbl.cell(grp_start_row, 1).merge(tbl.cell(cur_row - 1, 1))
                
        # Footer row 1: Tổng số câu / lệnh hỏi
        f1 = tbl.rows[cur_row].cells
        f1[0].text = "Tổng số lệnh hỏi"
        tbl.cell(cur_row, 0).merge(tbl.cell(cur_row, 2))
        
        sum_vals = [
            col_sums['mcq']['biet'], col_sums['mcq']['hieu'], col_sums['mcq']['van_dung'],
            col_sums['true_false']['biet'], col_sums['true_false']['hieu'], col_sums['true_false']['van_dung'],
            col_sums['short_answer']['biet'], col_sums['short_answer']['hieu'], col_sums['short_answer']['van_dung'],
            col_sums['essay']['biet'], col_sums['essay']['hieu'], col_sums['essay']['van_dung'],
        ]
        for v_idx, val in enumerate(sum_vals):
            f1[3 + v_idx].text = str(val) if val else "0"
            
        sum_b = sum_vals[0] + sum_vals[3] + sum_vals[6] + sum_vals[9]
        sum_h = sum_vals[1] + sum_vals[4] + sum_vals[7] + sum_vals[10]
        sum_vd = sum_vals[2] + sum_vals[5] + sum_vals[8] + sum_vals[11]
        f1[15].text = str(sum_b)
        f1[16].text = str(sum_h)
        f1[17].text = str(sum_vd)
        f1[18].text = "100"
        
        # Footer row 2: Tổng điểm
        cur_row += 1
        f2 = tbl.rows[cur_row].cells
        f2[0].text = "Tổng điểm"
        tbl.cell(cur_row, 0).merge(tbl.cell(cur_row, 2))
        
        # Point multipliers
        pt_mcq = 0.25
        pt_tf = 1.0
        pt_sa = 0.5
        pt_es = 1.0
        
        mcq_pts = (sum_vals[0] + sum_vals[1] + sum_vals[2]) * pt_mcq
        tf_pts = (sum_vals[3] + sum_vals[4] + sum_vals[5]) * pt_tf
        sa_pts = (sum_vals[6] + sum_vals[7] + sum_vals[8]) * pt_sa
        es_pts = (sum_vals[9] + sum_vals[10] + sum_vals[11]) * pt_es
        
        tbl.cell(cur_row, 3).merge(tbl.cell(cur_row, 5)).text = fmt_vi(mcq_pts)
        tbl.cell(cur_row, 6).merge(tbl.cell(cur_row, 8)).text = fmt_vi(tf_pts)
        tbl.cell(cur_row, 9).merge(tbl.cell(cur_row, 11)).text = fmt_vi(sa_pts)
        tbl.cell(cur_row, 12).merge(tbl.cell(cur_row, 14)).text = fmt_vi(es_pts)
        
        pts_b = sum_vals[0]*pt_mcq + sum_vals[3]*pt_tf + sum_vals[6]*pt_sa + sum_vals[9]*pt_es
        pts_h = sum_vals[1]*pt_mcq + sum_vals[4]*pt_tf + sum_vals[7]*pt_sa + sum_vals[10]*pt_es
        pts_vd = sum_vals[2]*pt_mcq + sum_vals[5]*pt_tf + sum_vals[8]*pt_sa + sum_vals[11]*pt_es
        f2[15].text = fmt_vi(pts_b)
        f2[16].text = fmt_vi(pts_h)
        f2[17].text = fmt_vi(pts_vd)
        f2[18].text = "10,0"
        
        # Footer row 3: Tỉ lệ %
        cur_row += 1
        f3 = tbl.rows[cur_row].cells
        f3[0].text = "Tỉ lệ %"
        tbl.cell(cur_row, 0).merge(tbl.cell(cur_row, 2))
        tbl.cell(cur_row, 3).merge(tbl.cell(cur_row, 5)).text = f"{int(round((mcq_pts/10)*100))}%"
        tbl.cell(cur_row, 6).merge(tbl.cell(cur_row, 8)).text = f"{int(round((tf_pts/10)*100))}%"
        tbl.cell(cur_row, 9).merge(tbl.cell(cur_row, 11)).text = f"{int(round((sa_pts/10)*100))}%"
        tbl.cell(cur_row, 12).merge(tbl.cell(cur_row, 14)).text = f"{int(round((es_pts/10)*100))}%"
        f3[15].text = f"{int(round((pts_b/10)*100))}%"
        f3[16].text = f"{int(round((pts_h/10)*100))}%"
        f3[17].text = f"{int(round((pts_vd/10)*100))}%"
        f3[18].text = "100%"
        
        # Style Matrix Table cells
        for row_i, r in enumerate(tbl.rows):
            for c_i, cell in enumerate(r.cells):
                set_cell_border(cell)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(0)
                    p.paragraph_format.space_after = Pt(0)
                    p.paragraph_format.line_spacing = 1.05
                    for run in p.runs:
                        run.font.name = 'Times New Roman'
                        run.font.size = Pt(8.5)
                        if row_i < 3 or row_i >= num_rows - 3:
                            run.font.bold = True
                    if c_i >= 3 and c_i < 19 and row_i >= 3:
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    elif row_i < 3:
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        
        # -------------------------------------------------------------
        # BẢN ĐẶC TẢ TRÊN TRANG MỚI (A4 NẰM NGANG)
        # -------------------------------------------------------------
        doc.add_page_break()
        
        p_sub2 = doc.add_paragraph()
        p_sub2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_sub2.paragraph_format.space_after = Pt(2)
        r = p_sub2.add_run(f"{school_name.upper()} – TỔ KHOA HỌC TỰ NHIÊN")
        r.font.size = Pt(10)
        r.font.bold = True
        
        p_title2 = doc.add_paragraph()
        p_title2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_title2.paragraph_format.space_after = Pt(2)
        r = p_title2.add_run(f"BẢN ĐẶC TẢ ĐỀ KIỂM TRA {title.upper()}")
        r.font.size = Pt(13)
        r.font.bold = True
        
        p_info2 = doc.add_paragraph()
        p_info2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_info2.paragraph_format.space_after = Pt(6)
        r = p_info2.add_run(f"MÔN: KHOA HỌC TỰ NHIÊN {grade} • THỜI GIAN: {duration} PHÚT • NĂM HỌC: {school_year}")
        r.font.size = Pt(10)
        r.font.italic = True
        
        # Build Specification Table
        # Columns: 16 (0:TT, 1:Chủ đề, 2:Đơn vị kiến thức, 3:Yêu cầu cần đạt, 4-6:MCQ, 7-9:TF, 10-12:SA, 13-15:TL)
        spec_sub_rows = []
        for s in spec_rows:
            ch_title = s.get('chapterTitle', '')
            l_title = s.get('lessonTitle', '')
            reqs = s.get('requirementsByLevel', {})
            counts = s.get('counts', {})
            cells = s.get('specCells') or s.get('questionPositions') or {}
            
            for lvl_key, lvl_label in [('biet', 'Biết'), ('hieu', 'Hiểu'), ('van_dung', 'Vận dụng')]:
                cnt = (counts.get('mcq', {}).get(lvl_key, 0) +
                       counts.get('true_false', {}).get(lvl_key, 0) +
                       counts.get('short_answer', {}).get(lvl_key, 0) +
                       counts.get('essay', {}).get(lvl_key, 0))
                req_list = reqs.get(lvl_key, [])
                if cnt == 0 and not req_list:
                    continue
                spec_sub_rows.append({
                    'chapter': ch_title,
                    'lesson': l_title,
                    'level_label': lvl_label,
                    'level_key': lvl_key,
                    'requirements': req_list,
                    'mcq': cells.get('mcq', {}).get(lvl_key, ''),
                    'true_false': cells.get('true_false', {}).get(lvl_key, ''),
                    'short_answer': cells.get('short_answer', {}).get(lvl_key, ''),
                    'essay': cells.get('essay', {}).get(lvl_key, '')
                })
                
        num_s_rows = 3 + len(spec_sub_rows) + 3
        tbl_s = doc.add_table(rows=num_s_rows, cols=16)
        tbl_s.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Headers
        h0 = tbl_s.rows[0].cells
        h0[0].text = "TT"
        h0[1].text = "Chủ đề"
        h0[2].text = "Nội dung/đơn vị kiến thức"
        h0[3].text = "Yêu cầu cần đạt"
        h0[4].text = "Số câu hỏi theo từng mức độ đánh giá"
        
        h1 = tbl_s.rows[1].cells
        h1[4].text = "TNKQ nhiều lựa chọn"
        h1[7].text = "TNKQ đúng – sai"
        h1[10].text = "TNKQ trả lời ngắn"
        h1[13].text = "Tự luận"
        
        h2 = tbl_s.rows[2].cells
        for idx, lvl in enumerate(["B", "H", "VD", "B", "H", "VD", "B", "H", "VD", "B", "H", "VD"]):
            h2[4 + idx].text = lvl
            
        tbl_s.cell(0, 0).merge(tbl_s.cell(2, 0))
        tbl_s.cell(0, 1).merge(tbl_s.cell(2, 1))
        tbl_s.cell(0, 2).merge(tbl_s.cell(2, 2))
        tbl_s.cell(0, 3).merge(tbl_s.cell(2, 3))
        tbl_s.cell(0, 4).merge(tbl_s.cell(0, 15))
        tbl_s.cell(1, 4).merge(tbl_s.cell(1, 6))
        tbl_s.cell(1, 7).merge(tbl_s.cell(1, 9))
        tbl_s.cell(1, 10).merge(tbl_s.cell(1, 12))
        tbl_s.cell(1, 13).merge(tbl_s.cell(1, 15))
        
        s_cur = 3
        for sub in spec_sub_rows:
            sc = tbl_s.rows[s_cur].cells
            sc[0].text = "1"
            sc[1].text = sub['chapter']
            sc[2].text = sub['lesson']
            
            # Format requirements text
            req_str = f"{sub['level_label']}:\n" + "\n".join([f"– {x}" for x in sub['requirements']])
            sc[3].text = req_str
            
            lvl_k = sub['level_key']
            lvl_idx = 0 if lvl_k == 'biet' else (1 if lvl_k == 'hieu' else 2)
            
            def fmt_c(val):
                if isinstance(val, list):
                    return ", ".join([str(v) for v in val])
                return str(val) if val else ""
                
            sc[4 + lvl_idx].text = fmt_c(sub['mcq'])
            sc[7 + lvl_idx].text = fmt_c(sub['true_false'])
            sc[10 + lvl_idx].text = fmt_c(sub['short_answer'])
            sc[13 + lvl_idx].text = fmt_c(sub['essay'])
            s_cur += 1
            
        # Footer rows for Spec
        sf1 = tbl_s.rows[s_cur].cells
        sf1[0].text = "Tổng số lệnh hỏi"
        tbl_s.cell(s_cur, 0).merge(tbl_s.cell(s_cur, 3))
        for v_i, v in enumerate(sum_vals):
            sf1[4 + v_i].text = str(v) if v else "0"
            
        s_cur += 1
        sf2 = tbl_s.rows[s_cur].cells
        sf2[0].text = "Tổng số điểm"
        tbl_s.cell(s_cur, 0).merge(tbl_s.cell(s_cur, 3))
        tbl_s.cell(s_cur, 4).merge(tbl_s.cell(s_cur, 6)).text = fmt_vi(mcq_pts)
        tbl_s.cell(s_cur, 7).merge(tbl_s.cell(s_cur, 9)).text = fmt_vi(tf_pts)
        tbl_s.cell(s_cur, 10).merge(tbl_s.cell(s_cur, 12)).text = fmt_vi(sa_pts)
        tbl_s.cell(s_cur, 13).merge(tbl_s.cell(s_cur, 15)).text = fmt_vi(es_pts)
        
        s_cur += 1
        sf3 = tbl_s.rows[s_cur].cells
        sf3[0].text = "Tỉ lệ %"
        tbl_s.cell(s_cur, 0).merge(tbl_s.cell(s_cur, 3))
        tbl_s.cell(s_cur, 4).merge(tbl_s.cell(s_cur, 6)).text = f"{int(round((mcq_pts/10)*100))}%"
        tbl_s.cell(s_cur, 7).merge(tbl_s.cell(s_cur, 9)).text = f"{int(round((tf_pts/10)*100))}%"
        tbl_s.cell(s_cur, 10).merge(tbl_s.cell(s_cur, 12)).text = f"{int(round((sa_pts/10)*100))}%"
        tbl_s.cell(s_cur, 13).merge(tbl_s.cell(s_cur, 15)).text = f"{int(round((es_pts/10)*100))}%"
        
        # Style Spec Table
        for row_i, r in enumerate(tbl_s.rows):
            for c_i, cell in enumerate(r.cells):
                set_cell_border(cell)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(0)
                    p.paragraph_format.space_after = Pt(0)
                    p.paragraph_format.line_spacing = 1.05
                    for run in p.runs:
                        run.font.name = 'Times New Roman'
                        run.font.size = Pt(8.5)
                        if row_i < 3 or row_i >= num_s_rows - 3:
                            run.font.bold = True
                    if c_i >= 4 and row_i >= 3:
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    elif row_i < 3:
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # -------------------------------------------------------------
    # SECTION 1: ĐỀ KIỂM TRA & ĐÁP ÁN (A4 THẲNG ĐỨNG - PORTRAIT)
    # -------------------------------------------------------------
    if not only_papers and (matrix_rows or spec_rows):
        sec1 = doc.add_section(WD_SECTION.NEW_PAGE)
    else:
        sec1 = doc.sections[0]
        
    sec1.orientation = WD_ORIENT.PORTRAIT
    sec1.page_width = Mm(210)
    sec1.page_height = Mm(297)
    sec1.top_margin = Mm(15)
    sec1.bottom_margin = Mm(15)
    sec1.left_margin = Mm(20)
    sec1.right_margin = Mm(20)
    
    # Render Exam Papers
    for v_idx, variant in enumerate(variants):
        if v_idx > 0:
            doc.add_page_break()
            
        p_code = variant.get('paperCode', f"{v_idx+1:02d}")
        questions = variant.get('questions', [])
        
        # 1. BẢNG 1: THÔNG TIN TRƯỜNG & KỲ THI
        t1 = doc.add_table(rows=1, cols=2)
        t1.alignment = WD_TABLE_ALIGNMENT.CENTER
        t1.autofit = False
        
        c0 = t1.cell(0, 0)
        c1 = t1.cell(0, 1)
        c0.width = Mm(85)
        c1.width = Mm(85)
        
        set_cell_border(c0)
        set_cell_border(c1)
        set_cell_margins(c0, top=100, bottom=100, left=120, right=120)
        set_cell_margins(c1, top=100, bottom=100, left=120, right=120)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.line_spacing = 1.3
        p0.paragraph_format.space_after = Pt(0)
        r = p0.add_run(school_name)
        r.font.bold = True
        r.font.size = Pt(10.5)
        
        r2 = p0.add_run("\nHọ và tên: ................................................................")
        r2.font.size = Pt(10)
        r3 = p0.add_run(f"\nLớp {grade}A.....")
        r3.font.size = Pt(10)
        
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p1.paragraph_format.line_spacing = 1.3
        p1.paragraph_format.space_after = Pt(0)
        r = p1.add_run(title.upper())
        r.font.bold = True
        r.font.size = Pt(11)
        
        r2 = p1.add_run(f"\nNĂM HỌC: {school_year}")
        r2.font.bold = True
        r2.font.size = Pt(10.5)
        
        r3 = p1.add_run(f"\nMÔN: KHTN {grade} – THỜI GIAN: {duration} phút")
        r3.font.bold = True
        r3.font.size = Pt(10.5)
        
        # Paragraph gap between Table 1 and Table 2 to prevent auto-merge
        p_gap = doc.add_paragraph()
        p_gap.paragraph_format.space_before = Pt(3)
        p_gap.paragraph_format.space_after = Pt(3)
        p_gap.paragraph_format.line_spacing = Pt(3)
        r_gap = p_gap.add_run()
        r_gap.font.size = Pt(3)
        
        # 2. BẢNG 2: ĐIỂM & LỜI PHÊ (50% - 50%)
        t2 = doc.add_table(rows=2, cols=2)
        t2.alignment = WD_TABLE_ALIGNMENT.CENTER
        t2.autofit = False
        
        c_score_h = t2.cell(0, 0)
        c_feed_h = t2.cell(0, 1)
        c_score_h.width = Mm(85)
        c_feed_h.width = Mm(85)
        
        set_cell_border(c_score_h)
        set_cell_border(c_feed_h)
        set_cell_shading(c_score_h, "F8FAFC")
        set_cell_shading(c_feed_h, "F8FAFC")
        set_cell_margins(c_score_h, top=80, bottom=80, left=100, right=100)
        set_cell_margins(c_feed_h, top=80, bottom=80, left=100, right=100)
        
        p_sh = c_score_h.paragraphs[0]
        p_sh.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_sh.paragraph_format.space_after = Pt(0)
        r = p_sh.add_run("ĐIỂM")
        r.font.bold = True
        r.font.size = Pt(10.5)
        
        p_fh = c_feed_h.paragraphs[0]
        p_fh.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_fh.paragraph_format.space_after = Pt(0)
        r = p_fh.add_run("LỜI PHÊ")
        r.font.bold = True
        r.font.size = Pt(10.5)
        
        c_score_b = t2.cell(1, 0)
        c_feed_b = t2.cell(1, 1)
        c_score_b.width = Mm(85)
        c_feed_b.width = Mm(85)
        set_cell_border(c_score_b)
        set_cell_border(c_feed_b)
        set_cell_margins(c_score_b, top=100, bottom=100, left=100, right=100)
        set_cell_margins(c_feed_b, top=100, bottom=100, left=100, right=100)
        
        # Set height for row 1 (~28mm = 80pt)
        trPr = t2.rows[1]._tr.get_or_add_trPr()
        trHeight = parse_xml(f'<w:trHeight {nsdecls("w")} w:val="1600" w:hRule="atLeast"/>')
        trPr.append(trHeight)
        
        # Mã đề ngay dưới Bảng 2
        p_code_p = doc.add_paragraph()
        p_code_p.paragraph_format.space_before = Pt(8)
        p_code_p.paragraph_format.space_after = Pt(8)
        r = p_code_p.add_run(f"Mã đề {p_code}")
        r.font.bold = True
        r.font.size = Pt(12)
        
        # Separate Questions by Type
        mcq_list = [q for q in questions if q.get('type') == 'mcq']
        tf_list = [q for q in questions if q.get('type') == 'true_false']
        sa_list = [q for q in questions if q.get('type') == 'short_answer']
        essay_list = [q for q in questions if q.get('type') == 'essay']
        
        tn_pts = len(mcq_list)*pt_mcq + len(tf_list)*pt_tf + len(sa_list)*pt_sa
        tl_pts = len(essay_list)*pt_es
        
        # PHẦN A. TRẮC NGHIỆM
        if mcq_list or tf_list or sa_list:
            p_a = doc.add_paragraph()
            p_a.paragraph_format.space_before = Pt(6)
            p_a.paragraph_format.space_after = Pt(4)
            r = p_a.add_run(f"A. TRẮC NGHIỆM: ({fmt_vi(tn_pts)} điểm)")
            r.font.bold = True
            r.font.size = Pt(11)
            
            # I. MCQ
            if mcq_list:
                p_i = doc.add_paragraph()
                p_i.paragraph_format.space_before = Pt(4)
                p_i.paragraph_format.space_after = Pt(2)
                r = p_i.add_run(f"I. Câu trắc nghiệm nhiều lựa chọn ({fmt_vi(len(mcq_list)*pt_mcq)} điểm)")
                r.font.bold = True
                
                p_guide = doc.add_paragraph()
                p_guide.paragraph_format.space_after = Pt(4)
                r = p_guide.add_run(f"Thí sinh trả lời từ câu 1 đến câu {len(mcq_list)}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.")
                r.font.italic = True
                r.font.size = Pt(10)
                
                for q_i, q in enumerate(mcq_list):
                    pq = doc.add_paragraph()
                    pq.paragraph_format.space_before = Pt(3)
                    pq.paragraph_format.space_after = Pt(2)
                    r_lbl = pq.add_run(f"Câu {q_i+1}: ")
                    r_lbl.font.bold = True
                    pq.add_run(q.get('prompt', ''))
                    
                    opts = q.get('displayedOptions') or q.get('options') or []
                    letters = ['A', 'B', 'C', 'D']
                    
                    # 4 options in 1 table or paragraph
                    p_opts = doc.add_paragraph()
                    p_opts.paragraph_format.left_indent = Mm(6)
                    p_opts.paragraph_format.space_after = Pt(3)
                    for o_idx, opt in enumerate(opts):
                        r_opt = p_opts.add_run(f"{letters[o_idx]}. ")
                        r_opt.font.bold = True
                        p_opts.add_run(f"{opt}    ")
                        
            # II. True / False
            if tf_list:
                p_ii = doc.add_paragraph()
                p_ii.paragraph_format.space_before = Pt(6)
                p_ii.paragraph_format.space_after = Pt(2)
                r = p_ii.add_run(f"II. Câu trắc nghiệm đúng - sai ({fmt_vi(len(tf_list)*pt_tf)} điểm)")
                r.font.bold = True
                
                p_guide = doc.add_paragraph()
                p_guide.paragraph_format.space_after = Pt(4)
                r = p_guide.add_run(f"Thí sinh trả lời từ câu 1 đến câu {len(tf_list)}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng (Đ) hoặc sai (S).")
                r.font.italic = True
                r.font.size = Pt(10)
                
                for q_i, q in enumerate(tf_list):
                    pq = doc.add_paragraph()
                    pq.paragraph_format.space_before = Pt(4)
                    pq.paragraph_format.space_after = Pt(2)
                    r_lbl = pq.add_run(f"Câu {q_i+1}: ")
                    r_lbl.font.bold = True
                    pq.add_run(q.get('prompt', ''))
                    
                    stmts = q.get('statements', [])
                    tbl_tf = doc.add_table(rows=len(stmts)+1, cols=3)
                    tbl_tf.alignment = WD_TABLE_ALIGNMENT.CENTER
                    tbl_tf.autofit = False
                    
                    h = tbl_tf.rows[0].cells
                    h[0].text = "Ý"
                    h[1].text = "Nội dung nhận định"
                    h[2].text = "Đ/S"
                    h[0].width = Mm(12)
                    h[1].width = Mm(138)
                    h[2].width = Mm(20)
                    
                    for r_tf_i, st in enumerate(stmts):
                        row_c = tbl_tf.rows[r_tf_i+1].cells
                        row_c[0].text = st.get('id', '')
                        row_c[1].text = st.get('text', '')
                        row_c[2].text = ""
                        row_c[0].width = Mm(12)
                        row_c[1].width = Mm(138)
                        row_c[2].width = Mm(20)
                        
                    for row_tf in tbl_tf.rows:
                        for c in row_tf.cells:
                            set_cell_border(c)
                            set_cell_margins(c, top=60, bottom=60, left=80, right=80)
                            for p in c.paragraphs:
                                p.paragraph_format.space_after = Pt(0)
                                for run in p.runs:
                                    run.font.name = 'Times New Roman'
                                    run.font.size = Pt(9.5)
                                    
            # III. Short Answer
            if sa_list:
                p_iii = doc.add_paragraph()
                p_iii.paragraph_format.space_before = Pt(6)
                p_iii.paragraph_format.space_after = Pt(2)
                r = p_iii.add_run(f"III. Câu trắc nghiệm trả lời ngắn ({fmt_vi(len(sa_list)*pt_sa)} điểm)")
                r.font.bold = True
                
                p_guide = doc.add_paragraph()
                p_guide.paragraph_format.space_after = Pt(4)
                r = p_guide.add_run(f"Thí sinh trả lời từ câu 1 đến câu {len(sa_list)}.")
                r.font.italic = True
                r.font.size = Pt(10)
                
                for q_i, q in enumerate(sa_list):
                    pq = doc.add_paragraph()
                    pq.paragraph_format.space_before = Pt(3)
                    pq.paragraph_format.space_after = Pt(2)
                    r_lbl = pq.add_run(f"Câu {q_i+1}: ")
                    r_lbl.font.bold = True
                    pq.add_run(q.get('prompt', ''))
                    
        # PHẦN B. TỰ LUẬN
        if essay_list:
            p_b = doc.add_paragraph()
            p_b.paragraph_format.space_before = Pt(8)
            p_b.paragraph_format.space_after = Pt(4)
            r = p_b.add_run(f"B. TỰ LUẬN: ({fmt_vi(tl_pts)} điểm)")
            r.font.bold = True
            r.font.size = Pt(11)
            
            for q_i, q in enumerate(essay_list):
                pq = doc.add_paragraph()
                pq.paragraph_format.space_before = Pt(4)
                pq.paragraph_format.space_after = Pt(4)
                r_lbl = pq.add_run(f"Câu {q_i+1} ({fmt_vi(q.get('points', 1.0))} điểm): ")
                r_lbl.font.bold = True
                pq.add_run(q.get('prompt', ''))
                
        p_end = doc.add_paragraph()
        p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_end.paragraph_format.space_before = Pt(12)
        p_end.paragraph_format.space_after = Pt(12)
        r = p_end.add_run("....................... HẾT .......................")
        r.font.bold = True
        
    # Render Answer Keys
    if not only_papers:
        for v_idx, variant in enumerate(variants):
            doc.add_page_break()
            p_code = variant.get('paperCode', f"{v_idx+1:02d}")
            questions = variant.get('questions', [])
            
            p_ans_h = doc.add_paragraph()
            p_ans_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_ans_h.paragraph_format.space_after = Pt(2)
            r = p_ans_h.add_run(f"HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN — ĐỀ {p_code}")
            r.font.bold = True
            r.font.size = Pt(13)
            
            p_ans_sub = doc.add_paragraph()
            p_ans_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_ans_sub.paragraph_format.space_after = Pt(8)
            r = p_ans_sub.add_run(f"{title.upper()} • MÔN: KHTN {grade} • NĂM HỌC: {school_year}")
            r.font.italic = True
            r.font.size = Pt(10.5)
            
            mcq_list = [q for q in questions if q.get('type') == 'mcq']
            tf_list = [q for q in questions if q.get('type') == 'true_false']
            sa_list = [q for q in questions if q.get('type') == 'short_answer']
            essay_list = [q for q in questions if q.get('type') == 'essay']
            
            # MCQ Answers Table
            if mcq_list:
                p_sec = doc.add_paragraph()
                p_sec.paragraph_format.space_before = Pt(4)
                p_sec.paragraph_format.space_after = Pt(2)
                r = p_sec.add_run(f"I. Đáp án câu hỏi trắc nghiệm nhiều lựa chọn ({fmt_vi(len(mcq_list)*pt_mcq)} điểm)")
                r.font.bold = True
                
                tbl_a_mcq = doc.add_table(rows=2, cols=len(mcq_list)+1)
                tbl_a_mcq.alignment = WD_TABLE_ALIGNMENT.CENTER
                tbl_a_mcq.rows[0].cells[0].text = "Câu"
                tbl_a_mcq.rows[1].cells[0].text = "Đáp án"
                
                for i_m, q in enumerate(mcq_list):
                    tbl_a_mcq.rows[0].cells[i_m+1].text = str(i_m+1)
                    tbl_a_mcq.rows[1].cells[i_m+1].text = q.get('displayedCorrectLetter') or 'A'
                    
                for r_m in tbl_a_mcq.rows:
                    for c_m in r_m.cells:
                        set_cell_border(c_m)
                        set_cell_margins(c_m, top=60, bottom=60, left=60, right=60)
                        p = c_m.paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        p.paragraph_format.space_after = Pt(0)
                        for run in p.runs:
                            run.font.bold = True
                            run.font.size = Pt(9.5)
                            
            # TF Answers Table
            if tf_list:
                p_sec = doc.add_paragraph()
                p_sec.paragraph_format.space_before = Pt(6)
                p_sec.paragraph_format.space_after = Pt(2)
                r = p_sec.add_run(f"II. Đáp án câu hỏi trắc nghiệm đúng - sai ({fmt_vi(len(tf_list)*pt_tf)} điểm)")
                r.font.bold = True
                
                total_stmts = sum([len(q.get('statements', [])) for q in tf_list])
                tbl_a_tf = doc.add_table(rows=total_stmts+1, cols=5)
                tbl_a_tf.alignment = WD_TABLE_ALIGNMENT.CENTER
                tbl_a_tf.autofit = False
                
                th = tbl_a_tf.rows[0].cells
                th[0].text = "Câu"
                th[1].text = "Ý"
                th[2].text = "Đáp án"
                th[3].text = "Giải thích ngắn gọn"
                th[4].text = "Điểm"
                th[0].width = Mm(14)
                th[1].width = Mm(12)
                th[2].width = Mm(16)
                th[3].width = Mm(112)
                th[4].width = Mm(16)
                
                cur_tf_r = 1
                for q_i, q in enumerate(tf_list):
                    stmts = q.get('statements', [])
                    for s_i, st in enumerate(stmts):
                        tc = tbl_a_tf.rows[cur_tf_r].cells
                        tc[0].text = str(q_i+1) if s_i == 0 else ""
                        tc[1].text = st.get('id', '')
                        tc[2].text = "Đ" if st.get('isTrue') else "S"
                        tc[3].text = st.get('explanation') or ""
                        tc[4].text = "0,1" if s_i == 0 else ("0,25" if s_i == 1 else ("0,5" if s_i == 2 else "1,0"))
                        
                        tc[0].width = Mm(14)
                        tc[1].width = Mm(12)
                        tc[2].width = Mm(16)
                        tc[3].width = Mm(112)
                        tc[4].width = Mm(16)
                        cur_tf_r += 1
                        
                for r_m in tbl_a_tf.rows:
                    for c_m in r_m.cells:
                        set_cell_border(c_m)
                        set_cell_margins(c_m, top=60, bottom=60, left=80, right=80)
                        for p in c_m.paragraphs:
                            p.paragraph_format.space_after = Pt(0)
                            for run in p.runs:
                                run.font.size = Pt(9.5)
                                
            # SA Answers Table
            if sa_list:
                p_sec = doc.add_paragraph()
                p_sec.paragraph_format.space_before = Pt(6)
                p_sec.paragraph_format.space_after = Pt(2)
                r = p_sec.add_run(f"III. Đáp án câu hỏi trắc nghiệm trả lời ngắn ({fmt_vi(len(sa_list)*pt_sa)} điểm)")
                r.font.bold = True
                
                tbl_a_sa = doc.add_table(rows=len(sa_list)+1, cols=4)
                tbl_a_sa.alignment = WD_TABLE_ALIGNMENT.CENTER
                tbl_a_sa.autofit = False
                
                sh = tbl_a_sa.rows[0].cells
                sh[0].text = "Câu"
                sh[1].text = "Lệnh hỏi"
                sh[2].text = "Đáp án ngắn"
                sh[3].text = "Điểm"
                sh[0].width = Mm(14)
                sh[1].width = Mm(110)
                sh[2].width = Mm(30)
                sh[3].width = Mm(16)
                
                for s_i, q in enumerate(sa_list):
                    sc = tbl_a_sa.rows[s_i+1].cells
                    sc[0].text = str(s_i+1)
                    sc[1].text = q.get('prompt', '')
                    sc[2].text = str(q.get('correctShortAnswer') or '')
                    sc[3].text = fmt_vi(pt_sa)
                    sc[0].width = Mm(14)
                    sc[1].width = Mm(110)
                    sc[2].width = Mm(30)
                    sc[3].width = Mm(16)
                    
                for r_m in tbl_a_sa.rows:
                    for c_m in r_m.cells:
                        set_cell_border(c_m)
                        set_cell_margins(c_m, top=60, bottom=60, left=80, right=80)
                        for p in c_m.paragraphs:
                            p.paragraph_format.space_after = Pt(0)
                            for run in p.runs:
                                run.font.size = Pt(9.5)
                                
            # Essay Answers Table
            if essay_list:
                p_sec = doc.add_paragraph()
                p_sec.paragraph_format.space_before = Pt(6)
                p_sec.paragraph_format.space_after = Pt(2)
                r = p_sec.add_run(f"B. Hướng dẫn chấm câu hỏi tự luận ({fmt_vi(tl_pts)} điểm)")
                r.font.bold = True
                
                tbl_a_es = doc.add_table(rows=len(essay_list)+1, cols=3)
                tbl_a_es.alignment = WD_TABLE_ALIGNMENT.CENTER
                tbl_a_es.autofit = False
                
                eh = tbl_a_es.rows[0].cells
                eh[0].text = "Câu"
                eh[1].text = "Nội dung đáp án / Biểu điểm chi tiết"
                eh[2].text = "Điểm"
                eh[0].width = Mm(14)
                eh[1].width = Mm(140)
                eh[2].width = Mm(16)
                
                for e_i, q in enumerate(essay_list):
                    ec = tbl_a_es.rows[e_i+1].cells
                    ec[0].text = str(e_i+1)
                    
                    rubric = q.get('rubric') or []
                    ans_text = q.get('explanation') or ""
                    if rubric:
                        ans_text += "\n" + "\n".join([f"+ {item.get('criteria', '')}: {fmt_vi(item.get('points', 0))}đ" for item in rubric])
                    ec[1].text = ans_text
                    ec[2].text = fmt_vi(q.get('points', 1.0))
                    ec[0].width = Mm(14)
                    ec[1].width = Mm(140)
                    ec[2].width = Mm(16)
                    
                for r_m in tbl_a_es.rows:
                    for c_m in r_m.cells:
                        set_cell_border(c_m)
                        set_cell_margins(c_m, top=60, bottom=60, left=80, right=80)
                        for p in c_m.paragraphs:
                            p.paragraph_format.space_after = Pt(0)
                            for run in p.runs:
                                run.font.size = Pt(9.5)
                                
            # Signatures table
            t_sig = doc.add_table(rows=1, cols=2)
            t_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
            t_sig.autofit = False
            
            sig_l = t_sig.cell(0, 0)
            sig_r = t_sig.cell(0, 1)
            sig_l.width = Mm(85)
            sig_r.width = Mm(85)
            
            p_sl = sig_l.paragraphs[0]
            p_sl.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_sl.paragraph_format.space_after = Pt(0)
            r = p_sl.add_run("DUYỆT CỦA TỔ CHUYÊN MÔN\n")
            r.font.bold = True
            r.font.size = Pt(10.5)
            r_it = p_sl.add_run("(Thống nhất nội dung ma trận, bản đặc tả và đề)\n\n\n\n")
            r_it.font.italic = True
            r_it.font.size = Pt(9)
            r_name = p_sl.add_run(teacher_name)
            r_name.font.bold = True
            r_name.font.size = Pt(10.5)
            
            p_sr = sig_r.paragraphs[0]
            p_sr.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_sr.paragraph_format.space_after = Pt(0)
            r_d = p_sr.add_run("Ngày ..... tháng ..... năm 202...\n")
            r_d.font.italic = True
            r_d.font.size = Pt(10)
            r = p_sr.add_run("GIÁO VIÊN RA ĐỀ\n\n\n\n")
            r.font.bold = True
            r.font.size = Pt(10.5)
            r_name2 = p_sr.add_run(teacher_name)
            r_name2.font.bold = True
            r_name2.font.size = Pt(10.5)
            
    # Save output docx
    doc.save(output_path)
    print(f"Exported DOCX successfully to: {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python generate_exam_docx_dynamic.py <input.json> <output.docx> [--only-papers]")
        sys.exit(1)
        
    in_json = sys.argv[1]
    out_docx = sys.argv[2]
    only_p = '--only-papers' in sys.argv
    
    with open(in_json, 'r', encoding='utf-8') as f:
        exam_data = json.load(f)
        
    build_docx(exam_data, out_docx, only_papers=only_p)

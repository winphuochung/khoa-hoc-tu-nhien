with open('src/features/exam-studio/ExamDocumentTablesView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

target = '''          <a
            href="./Ma_Tran_Ban_Dac_Ta_De_Dap_An_KTGK1_KHTN9_2026-2027.docx"
            download="Ma_Tran_Ban_Dac_Ta_De_Dap_An_KTGK1_KHTN9_2026-2027.docx"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
            title="Tải trực tiếp file Word (.docx) chuẩn của trường: Ma trận/Đặc tả nằm ngang, Đề/Đáp án thẳng đứng"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Word chuẩn (.docx)</span>
          </a>'''

repl = '''          <a
            href="./Ma_Tran_Ban_Dac_Ta_De_Dap_An_KTGK1_KHTN9_2026-2027.docx"
            download="Ma_Tran_Ban_Dac_Ta_De_Dap_An_KTGK1_KHTN9_2026-2027.docx"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
            title="Tải trực tiếp file Word (.docx) chuẩn của trường: Ma trận/Đặc tả nằm ngang, Đề/Đáp án thẳng đứng"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Word trọn bộ (.docx)</span>
          </a>

          {viewMode === 'paper' && (
            <a
              href="./De_Kiem_Tra_KHTN9_GK1_2026-2027.docx"
              download="De_Kiem_Tra_KHTN9_GK1_2026-2027.docx"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs"
              title="Tải file Word (.docx) chỉ riêng 2 Đề kiểm tra khổ A4 thẳng đứng"
            >
              <Download className="w-4 h-4" />
              <span>Tải riêng Đề thi (.docx)</span>
            </a>
          )}'''

if target in c:
    c = c.replace(target, repl)
    with open('src/features/exam-studio/ExamDocumentTablesView.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print('Button updated successfully!')
else:
    print('Target not found!')

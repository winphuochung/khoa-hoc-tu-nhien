new_btns = """<button
            type="button"
            disabled={downloadingDocx}
            onClick={() => handleDownloadDocx(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
            title={`Tải file Word (.docx) động chuẩn: Ma trận & Bản đặc tả A4 nằm ngang, 2 Đề thi & Đáp án KHTN ${grade} A4 thẳng đứng`}
          >
            <Download className="w-4 h-4" />
            <span>{downloadingDocx ? 'Đang tạo file DOCX...' : `Tải file Word trọn bộ KHTN ${grade} (.docx)`}</span>
          </button>

          {viewMode === 'paper' && (
            <button
              type="button"
              disabled={downloadingDocx}
              onClick={() => handleDownloadDocx(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
              title={`Tải riêng 2 Đề kiểm tra KHTN ${grade} khổ A4 thẳng đứng (.docx)`}
            >
              <Download className="w-4 h-4" />
              <span>{downloadingDocx ? 'Đang tạo...' : `Tải riêng Đề thi KHTN ${grade} (.docx)`}</span>
            </button>
          )}"""

repl_state = """const [selectedPaperCode, setSelectedPaperCode] = useState<string>('ALL');
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);"""

repl_dl = """  // Dynamic Export to Word (.docx) for exact current exam data (any grade, any scope)
  const handleDownloadDocx = async (onlyPapers = false) => {
    try {
      setDownloadingDocx(true);
      const payload = {
        title,
        category,
        schoolYear,
        durationMinutes,
        totalPoints,
        grade,
        schoolConfig,
        matrixRows,
        specificationRows,
        hydratedVariants,
        onlyPapers,
      };

      const res = await fetch(`/api/exams/export-docx${onlyPapers ? '?onlyPapers=true' : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Lỗi máy chủ (${res.status}): Không thể tạo file DOCX.`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (title || 'De_Kiem_Tra')
        .normalize('NFD')
        .replace(/[\\u0300-\\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]+/g, '_');
      link.download = onlyPapers
        ? `De_Thi_KHTN${grade}_${safeTitle}.docx`
        : `Ma_Tran_Ban_Dac_Ta_De_Dap_An_KHTN${grade}_${safeTitle}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Lỗi khi tải file DOCX động:', err);
      // Fallback to downloading .doc
      handleDownloadWordDoc();
    } finally {
      setDownloadingDocx(false);
    }
  };

  // Export to Word (.doc) with SectionLandscape (A4 ngang) and SectionPortrait (A4 đứng)
  const handleDownloadWordDoc = () => {"""

with open('src/features/exam-studio/ExamDocumentTablesView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

target_state = "const [selectedPaperCode, setSelectedPaperCode] = useState<string>('ALL');"
if target_state in c:
    c = c.replace(target_state, repl_state, 1)
    print("1. Added downloadingDocx state.")

target_dl = "  // Export to Word (.doc) with SectionLandscape (A4 ngang) and SectionPortrait (A4 đứng)\n  const handleDownloadWordDoc = () => {"
if target_dl in c:
    c = c.replace(target_dl, repl_dl, 1)
    print("2. Added handleDownloadDocx function.")

target_fname = "link.download = `Ma_Tran_Ban_Dac_Ta_De_Dap_An_${safeName}.doc`;"
repl_fname = "link.download = `Ma_Tran_Ban_Dac_Ta_De_Dap_An_KHTN${grade}_${safeName}.doc`;"
if target_fname in c:
    c = c.replace(target_fname, repl_fname, 1)
    print("3. Updated .doc filename.")

btn_start = '<a\n            href="./Ma_Tran_Ban_Dac_Ta_De_Dap_An_KTGK1_KHTN9_2026-2027.docx"'
btn_end = '<span>Tải riêng Đề thi (.docx)</span>\n            </a>\n          )}'

idx_s = c.find(btn_start)
idx_e = c.find(btn_end)

if idx_s != -1 and idx_e != -1:
    c = c[:idx_s] + new_btns + c[idx_e + len(btn_end):]
    print("4. Replaced download buttons successfully!")
else:
    print("4. Button markers not found:", idx_s, idx_e)

with open('src/features/exam-studio/ExamDocumentTablesView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Done!")

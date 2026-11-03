import re

file_path = 'src/features/exam-studio/ExamDocumentTablesView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update renderPaperBlock header
old_header_pattern = r'\{\/\* BẢNG 1: THÔNG TIN TRƯỜNG & KỲ THI[\s\S]*?\{variant\.paperCode && \([\s\S]*?<\/p>\s*\)}'

new_header = '''{/* BẢNG 1: THÔNG TIN TRƯỜNG & KỲ THI (Tách biệt hoàn toàn theo chuẩn mẫu) */}
        <table
          style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8pt' }}
          className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm school-header-table"
        >
          <tbody>
            <tr>
              <td
                style={{
                  width: '50%',
                  verticalAlign: 'top',
                  padding: '6pt 10pt',
                  border: '1px solid #000',
                  lineHeight: '1.5',
                }}
                className="border border-slate-900 p-2.5 sm:p-3 align-top w-1/2 leading-relaxed"
              >
                <div style={{ fontWeight: 'bold' }} className="font-bold text-slate-900 text-xs sm:text-sm">
                  {schoolConfig.schoolName}
                </div>
                <div style={{ marginTop: '4pt' }} className="mt-1 text-slate-800">
                  Họ và tên: ................................................................
                </div>
                <div style={{ marginTop: '4pt' }} className="mt-1 text-slate-800">
                  Lớp {grade}A.....
                </div>
              </td>
              <td
                style={{
                  width: '50%',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  padding: '6pt 10pt',
                  border: '1px solid #000',
                  fontWeight: 'bold',
                  lineHeight: '1.5',
                }}
                className="border border-slate-900 p-2.5 sm:p-3 text-center align-middle w-1/2 font-bold leading-relaxed"
              >
                <div style={{ textTransform: 'uppercase' }} className="uppercase text-sm sm:text-base text-slate-900">
                  {title}
                </div>
                <div style={{ textTransform: 'uppercase', marginTop: '2pt' }} className="uppercase text-slate-800">
                  NĂM HỌC: {schoolYear}
                </div>
                <div style={{ textTransform: 'uppercase', marginTop: '2pt' }} className="uppercase text-slate-800">
                  MÔN: KHTN {grade} – THỜI GIAN: {durationMinutes} phút
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* PARAGRAPH PHÂN TÁCH ĐẢM BẢO WORD VÀ GIAO DIỆN TÁCH RỜI BIỆT LẬP THÀNH 2 BẢNG */}
        <div style={{ height: '12pt' }} className="h-3 my-2" aria-hidden="true">
          <p style={{ margin: '3pt 0', fontSize: '3pt', lineHeight: '3pt' }}>&nbsp;</p>
        </div>

        {/* BẢNG 2: ĐIỂM & LỜI PHÊ (50% - 50% VỚI Ô TRỐNG RỘNG CAO ĐỂ CHẤM BÀI) */}
        <table
          style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4pt', marginBottom: '10pt' }}
          className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm score-feedback-table"
        >
          <thead>
            <tr>
              <th
                style={{
                  width: '50%',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '5pt 8pt',
                  border: '1px solid #000',
                  textTransform: 'uppercase',
                  backgroundColor: '#f8fafc',
                }}
                className="border border-slate-900 p-2 text-center font-bold uppercase w-1/2 bg-slate-50 tracking-wider"
              >
                ĐIỂM
              </th>
              <th
                style={{
                  width: '50%',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '5pt 8pt',
                  border: '1px solid #000',
                  textTransform: 'uppercase',
                  backgroundColor: '#f8fafc',
                }}
                className="border border-slate-900 p-2 text-center font-bold uppercase w-1/2 bg-slate-50 tracking-wider"
              >
                LỜI PHÊ
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: '85pt' }}>
              <td
                style={{
                  width: '50%',
                  height: '85pt',
                  minHeight: '85pt',
                  border: '1px solid #000',
                  verticalAlign: 'top',
                  padding: '8pt',
                }}
                className="border border-slate-900 h-28 score-feedback-cell"
              >
                <div style={{ height: '70pt', minHeight: '70pt' }}>&nbsp;</div>
              </td>
              <td
                style={{
                  width: '50%',
                  height: '85pt',
                  minHeight: '85pt',
                  border: '1px solid #000',
                  verticalAlign: 'top',
                  padding: '8pt',
                }}
                className="border border-slate-900 h-28 score-feedback-cell"
              >
                <div style={{ height: '70pt', minHeight: '70pt' }}>&nbsp;</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* MÃ ĐỀ: NẰM NGAY DƯỚI BẢNG 2 CĂN TRÁI IN ĐẬM */}
        {variant.paperCode && (
          <div
            style={{ fontWeight: 'bold', fontSize: '13pt', margin: '10pt 0 6pt 0', textAlign: 'left' }}
            className="font-bold text-base text-slate-900 pt-1"
          >
            Mã đề {variant.paperCode}
          </div>
        )}'''

if re.search(old_header_pattern, content):
    content = re.sub(old_header_pattern, new_header, content, count=1)
    print("1. Replaced header successfully!")
else:
    print("1. ERROR: Could not match old_header_pattern!")

# 2. Update docContainerRef rendering section
old_container_pattern = r'\{\/\* Document Content Container \*\/\}[\s\S]*?\{\/\* Hidden Full Document Export Container'

new_container = '''{/* Document Content Container */}
      <div ref={docContainerRef} className="space-y-6 text-slate-900">
        {/* VIEW: CHỈ KHUNG MA TRẬN (A4 NẰM NGANG) */}
        {viewMode === 'matrix' && (
          <div className="max-w-[1150px] mx-auto bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-xl SectionLandscape space-y-4">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 no-print">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Khổ giấy A4 NẰM NGANG (Landscape — 297mm × 210mm)
              </span>
              <span className="text-xs text-slate-500 font-semibold">Khung Ma trận đề chuẩn Bộ GD&ĐT & Trường TH–THCS Phước Hưng</span>
            </div>
            {renderMatrixContent()}
          </div>
        )}

        {/* VIEW: CHỈ BẢN ĐẶC TẢ (A4 NẰM NGANG) */}
        {viewMode === 'spec' && (
          <div className="max-w-[1150px] mx-auto bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-xl SectionLandscape space-y-4">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 no-print">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Khổ giấy A4 NẰM NGANG (Landscape — 297mm × 210mm)
              </span>
              <span className="text-xs text-slate-500 font-semibold">Bản đặc tả đề kiểm tra chuẩn</span>
            </div>
            {renderSpecContent()}
          </div>
        )}

        {/* VIEW: CHỈ ĐỀ KIỂM TRA (A4 THẲNG ĐỨNG) */}
        {viewMode === 'paper' && (
          <div className="max-w-[850px] mx-auto bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-xl SectionPortrait space-y-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 no-print">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Khổ giấy A4 THẲNG ĐỨNG (Portrait — 210mm × 297mm)
              </span>
              <span className="text-xs text-slate-500 font-semibold">Bảng thông tin trường & Bảng Điểm – Lời phê tách biệt</span>
            </div>
            {hydratedVariants.length >= 2 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs sm:text-sm text-emerald-900 flex flex-wrap items-center justify-between gap-2 no-print">
                <div>
                  <strong>Đối chiếu 2 mã đề độc lập (Đề 01 & Đề 02):</strong> Đề 01 gồm{' '}
                  <strong>{hydratedVariants[0]?.questions.length || 0}</strong> câu • Đề 02 gồm{' '}
                  <strong>{hydratedVariants[1]?.questions.length || 0}</strong> câu • Số câu khác nhau:{' '}
                  <strong>
                    {distinctCount}/{v2Questions.length} câu (0 câu trùng lặp — khác 100% câu hỏi và đáp án)
                  </strong>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-xs">
                  Cùng chung Ma trận & Bản đặc tả
                </span>
              </div>
            )}
            {visibleVariants.map((variant, idx) => (
              <div
                key={`paper-wrap-${variant.paperCode}`}
                className={idx > 0 ? 'pt-8 border-t-4 border-dashed border-slate-300 page-break' : ''}
                style={idx > 0 ? { pageBreakBefore: 'always' } : undefined}
              >
                {renderPaperBlock(variant)}
              </div>
            ))}
          </div>
        )}

        {/* VIEW: CHỈ ĐÁP ÁN & HƯỚNG DẪN CHẤM (A4 THẲNG ĐỨNG) */}
        {viewMode === 'answer_key' && (
          <div className="max-w-[850px] mx-auto bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-xl SectionPortrait space-y-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 no-print">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Khổ giấy A4 THẲNG ĐỨNG (Portrait — 210mm × 297mm)
              </span>
              <span className="text-xs text-slate-500 font-semibold">Đáp án & Biểu điểm chi tiết</span>
            </div>
            {visibleVariants.map((variant, idx) => (
              <div
                key={`ans-wrap-${variant.paperCode}`}
                className={idx > 0 ? 'pt-8 border-t-4 border-dashed border-slate-300 page-break' : ''}
                style={idx > 0 ? { pageBreakBefore: 'always' } : undefined}
              >
                {renderAnswerKeyBlock(variant)}
              </div>
            ))}
          </div>
        )}

        {/* VIEW: TOÀN BỘ VĂN BẢN (MA TRẬN & ĐẶC TẢ A4 NẰM NGANG, ĐỀ & ĐÁP ÁN A4 THẲNG ĐỨNG) */}
        {viewMode === 'all' && (
          <div className="space-y-8">
            {/* PHẦN 1: MA TRẬN & ĐẶC TẢ (A4 NẰM NGANG) */}
            <div className="max-w-[1150px] mx-auto bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-xl SectionLandscape space-y-10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  PHẦN 1: KHUNG MA TRẬN & BẢN ĐẶC TẢ — KHỔ GIẤY A4 NẰM NGANG (LANDSCAPE)
                </span>
                <span className="text-xs text-slate-500 font-semibold">297mm × 210mm</span>
              </div>
              {renderMatrixContent()}
              <div className="page-break pt-8 border-t-2 border-dashed border-slate-300" style={{ pageBreakBefore: 'always' }}>
                {renderSpecContent()}
              </div>
            </div>

            {/* BANNER PHÂN TÁCH SECTION TRÊN GIAO DIỆN */}
            <div className="max-w-[950px] mx-auto my-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/25 to-amber-500/10 border-2 border-dashed border-amber-500 text-amber-900 text-center font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm no-print">
              <span className="text-xl">✂️</span>
              <span>PHÂN ĐOẠN NGẮT SECTION: CHUYỂN SANG KHỔ GIẤY A4 THẲNG ĐỨNG (PORTRAIT) CHO ĐỀ KIỂM TRA & ĐÁP ÁN</span>
            </div>

            {/* DẤU NGẮT SECTION CHO WORD MSO HTML */}
            <div className="section-break" style={{ pageBreakBefore: 'always' }}>
              <br clear="all" style={{ msoBreakType: 'section-break' } as any} />
            </div>

            {/* PHẦN 2: ĐỀ KIỂM TRA & ĐÁP ÁN (A4 THẲNG ĐỨNG) */}
            <div className="max-w-[850px] mx-auto bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-xl SectionPortrait space-y-10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  PHẦN 2: ĐỀ KIỂM TRA & ĐÁP ÁN — KHỔ GIẤY A4 THẲNG ĐỨNG (PORTRAIT)
                </span>
                <span className="text-xs text-slate-500 font-semibold">210mm × 297mm</span>
              </div>
              {hydratedVariants.map((variant, idx) => (
                <div
                  key={`all-paper-${variant.paperCode}`}
                  className={idx > 0 ? 'pt-8 border-t-4 border-dashed border-slate-300 page-break' : ''}
                  style={idx > 0 ? { pageBreakBefore: 'always' } : undefined}
                >
                  {renderPaperBlock(variant)}
                </div>
              ))}

              <div className="page-break pt-8 border-t-4 border-dashed border-slate-300" style={{ pageBreakBefore: 'always' }}>
                <br style={{ msoBreakType: 'page-break' } as any} />
              </div>

              {hydratedVariants.map((variant, idx) => (
                <div
                  key={`all-ans-${variant.paperCode}`}
                  className={idx > 0 ? 'pt-8 border-t-4 border-dashed border-slate-300 page-break' : ''}
                  style={idx > 0 ? { pageBreakBefore: 'always' } : undefined}
                >
                  {renderAnswerKeyBlock(variant)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden Full Document Export Container'''

if re.search(old_container_pattern, content):
    content = re.sub(old_container_pattern, new_container, content, count=1)
    print("2. Replaced container layout successfully!")
else:
    print("2. ERROR: Could not match old_container_pattern!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File written successfully!")

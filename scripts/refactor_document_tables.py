import sys

with open('src/features/exam-studio/ExamDocumentTablesView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Find start of Matrix JSX:
# from `{(viewMode === 'matrix' || viewMode === 'all') && (`
# to its closing `)}` before `{/* ====== TABLE 2: BẢN ĐẶC TẢ`
m_start_str = "{(viewMode === 'matrix' || viewMode === 'all') && (\n          <div className=\"space-y-3\">"
m_end_str = "          </div>\n        )}\n\n        {/* =====================================================================\n            TABLE 2: BẢN ĐẶC TẢ ĐỀ KIỂM TRA (100% GIỐNG FILE MẪU DOCX)"

idx_m_start = content.find(m_start_str)
idx_m_end = content.find(m_end_str)

if idx_m_start == -1 or idx_m_end == -1:
    print(f"Error finding matrix indices: {idx_m_start}, {idx_m_end}")
    sys.exit(1)

matrix_inner_jsx = content[idx_m_start + len("{(viewMode === 'matrix' || viewMode === 'all') && ("):idx_m_end + len("          </div>")]

# 2. Find start of Spec JSX:
s_start_str = "{(viewMode === 'spec' || viewMode === 'all') && (\n          <div className=\"space-y-3 pt-2\">"
s_end_str = "          </div>\n        )}\n\n        {/* =====================================================================\n            VIEW 3: ĐỀ KIỂM TRA"

idx_s_start = content.find(s_start_str)
idx_s_end = content.find(s_end_str)

if idx_s_start == -1 or idx_s_end == -1:
    print(f"Error finding spec indices: {idx_s_start}, {idx_s_end}")
    sys.exit(1)

spec_inner_jsx = content[idx_s_start + len("{(viewMode === 'spec' || viewMode === 'all') && ("):idx_s_end + len("          </div>")]

# 3. Find where renderAnswerKeyBlock ends:
ans_end_str = "        </table>\n      </div>\n    );\n  };\n\n  return ("
idx_ans_end = content.find(ans_end_str)
if idx_ans_end == -1:
    print("Error finding ans_end_str")
    sys.exit(1)

render_functions = f"""
  const renderMatrixContent = () => ({matrix_inner_jsx}
  );

  const renderSpecContent = () => ({spec_inner_jsx}
  );
"""

# Replace the inner docContainerRef content:
doc_container_start = "ref={docContainerRef}\n        className=\"bg-white rounded-2xl border border-slate-300 p-4 sm:p-8 space-y-8 text-slate-900 shadow-xs\"\n      >"
idx_doc_start = content.find(doc_container_start)

# End of docContainerRef is before `</div>\n    </div>\n  );\n};`
doc_container_end = "      </div>\n    </div>\n  );\n};"
idx_doc_end = content.rfind(doc_container_end)

new_doc_container_inner = """
        {/* VIEW: CHỈ KHUNG MA TRẬN (A4 NẰM NGANG) */}
        {viewMode === 'matrix' && (
          <div className="SectionLandscape space-y-3">{renderMatrixContent()}</div>
        )}

        {/* VIEW: CHỈ BẢN ĐẶC TẢ (A4 NẰM NGANG) */}
        {viewMode === 'spec' && (
          <div className="SectionLandscape space-y-3">{renderSpecContent()}</div>
        )}

        {/* VIEW: CHỈ ĐỀ KIỂM TRA (A4 THẲNG ĐỨNG) */}
        {viewMode === 'paper' && (
          <div className="SectionPortrait space-y-8">
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
                className={idx > 0 ? 'pt-6 border-t-4 border-dashed border-slate-300 page-break' : ''}
                style={idx > 0 ? { pageBreakBefore: 'always' } : undefined}
              >
                {renderPaperBlock(variant)}
              </div>
            ))}
          </div>
        )}

        {/* VIEW: CHỈ ĐÁP ÁN & HƯỚNG DẪN CHẤM (A4 THẲNG ĐỨNG) */}
        {viewMode === 'answer_key' && (
          <div className="SectionPortrait space-y-8">
            {visibleVariants.map((variant, idx) => (
              <div
                key={`ans-wrap-${variant.paperCode}`}
                className={idx > 0 ? 'pt-6 border-t-4 border-dashed border-slate-300 page-break' : ''}
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
            {/* SECTION 1: KHUNG MA TRẬN & BẢN ĐẶC TẢ (A4 NẰM NGANG) */}
            <div className="SectionLandscape space-y-8">
              {renderMatrixContent()}
              <div className="page-break pt-4 border-t-2 border-dashed border-slate-300" style={{ pageBreakBefore: 'always' }}>
                {renderSpecContent()}
              </div>
            </div>

            {/* NGẮT SECTION SANG KHỔ A4 THẲNG ĐỨNG CHO WORD */}
            <div className="section-break my-6" style={{ pageBreakBefore: 'always' }}>
              <br clear="all" style={{ msoBreakType: 'section-break' } as any} />
            </div>

            {/* SECTION 2: ĐỀ KIỂM TRA & ĐÁP ÁN (A4 THẲNG ĐỨNG) */}
            <div className="SectionPortrait space-y-8">
              {hydratedVariants.map((variant, idx) => (
                <div
                  key={`all-paper-${variant.paperCode}`}
                  className={idx > 0 ? 'pt-6 border-t-4 border-dashed border-slate-300 page-break' : ''}
                  style={idx > 0 ? { pageBreakBefore: 'always' } : undefined}
                >
                  {renderPaperBlock(variant)}
                </div>
              ))}

              <div className="page-break pt-6" style={{ pageBreakBefore: 'always' }}>
                <br style={{ msoBreakType: 'page-break' } as any} />
              </div>

              {hydratedVariants.map((variant, idx) => (
                <div
                  key={`all-ans-${variant.paperCode}`}
                  className={idx > 0 ? 'pt-6 border-t-4 border-dashed border-slate-300 page-break' : ''}
                  style={idx > 0 ? { pageBreakBefore: 'always' } : undefined}
                >
                  {renderAnswerKeyBlock(variant)}
                </div>
              ))}
            </div>
          </div>
        )}
"""

full_export_hidden_jsx = """
      {/* Hidden Full Document Export Container (Luôn đảm bảo xuất đủ Ma trận + Bản đặc tả nằm ngang, Đề + Đáp án thẳng đứng) */}
      <div ref={fullDocExportRef} style={{ display: 'none' }}>
        <div className="SectionLandscape">
          {renderMatrixContent()}
          <div className="page-break" style={{ pageBreakBefore: 'always' }}>
            <br style={{ msoBreakType: 'page-break' } as any} />
          </div>
          {renderSpecContent()}
        </div>

        <br clear="all" style={{ pageBreakBefore: 'always', msoBreakType: 'section-break' } as any} className="section-break" />

        <div className="SectionPortrait">
          {hydratedVariants.map((variant, idx) => (
            <div
              key={`full-exp-paper-${variant.paperCode}`}
              style={idx > 0 ? { pageBreakBefore: 'always', paddingTop: '16pt' } : undefined}
            >
              {renderPaperBlock(variant)}
            </div>
          ))}

          <div className="page-break" style={{ pageBreakBefore: 'always' }}>
            <br style={{ msoBreakType: 'page-break' } as any} />
          </div>

          {hydratedVariants.map((variant, idx) => (
            <div
              key={`full-exp-ans-${variant.paperCode}`}
              style={idx > 0 ? { pageBreakBefore: 'always', paddingTop: '16pt' } : undefined}
            >
              {renderAnswerKeyBlock(variant)}
            </div>
          ))}
        </div>
      </div>
"""

# Assemble new content
# 1. insert render functions before `return (`
part1 = content[:idx_ans_end + len("        </table>\n      </div>\n    );\n  };\n")]
part2 = render_functions + "\n  return ("
part3 = content[idx_ans_end + len("        </table>\n      </div>\n    );\n  };\n\n  return ("):idx_doc_start + len(doc_container_start)]
part4 = new_doc_container_inner + "\n      </div>\n" + full_export_hidden_jsx + "\n    </div>\n  );\n};\n"

new_full_content = part1 + part2 + part3 + part4

with open('src/features/exam-studio/ExamDocumentTablesView.tsx', 'w', encoding='utf-8') as f:
    f.write(new_full_content)

print("Successfully refactored ExamDocumentTablesView.tsx!")

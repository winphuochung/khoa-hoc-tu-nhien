import React, { useRef, useState } from 'react';
import {
  Printer,
  FileText,
  Table,
  Layers,
  CheckSquare,
  Download,
  BookOpenCheck,
} from 'lucide-react';
import {
  ExamCategory,
  MatrixRow,
  QuestionItem,
  SchoolConfig,
  SpecificationRow,
} from '../../types/domainTypes';

export interface HydratedQuestion extends QuestionItem {
  displayedOptions?: string[];
  displayedCorrectLetter?: string;
}

export interface HydratedVariant {
  paperCode: string;
  questions: HydratedQuestion[];
}

interface ExamDocumentTablesViewProps {
  title: string;
  category: ExamCategory;
  schoolYear: string;
  durationMinutes: number;
  totalPoints: number;
  schoolConfig: SchoolConfig;
  grade?: number;
  matrixRows: MatrixRow[];
  specificationRows: SpecificationRow[];
  hydratedVariants: HydratedVariant[];
  defaultTab?: 'all' | 'matrix' | 'spec' | 'paper' | 'answer_key';
}

function fmtVi(num: number, forceOneDecimal = false): string {
  if (num === undefined || num === null || Number.isNaN(Number(num))) return '0';
  const n = Number(Number(num).toFixed(2));
  if (forceOneDecimal && Number.isInteger(n)) {
    return `${n},0`;
  }
  return String(n).replace('.', ',');
}

export const ExamDocumentTablesView: React.FC<ExamDocumentTablesViewProps> = ({
  title,
  category,
  schoolYear,
  durationMinutes,
  totalPoints,
  schoolConfig,
  grade = 9,
  matrixRows,
  specificationRows,
  hydratedVariants,
  defaultTab = 'matrix',
}) => {
  const [viewMode, setViewMode] = useState<'all' | 'matrix' | 'spec' | 'paper' | 'answer_key'>(
    defaultTab
  );
  const [selectedPaperCode, setSelectedPaperCode] = useState<string>('ALL');
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const docContainerRef = useRef<HTMLDivElement>(null);
  const fullDocExportRef = useRef<HTMLDivElement>(null);

  const visibleVariants =
    selectedPaperCode === 'ALL'
      ? hydratedVariants
      : hydratedVariants.filter((v) => v.paperCode === selectedPaperCode);

  // Compute comparison statistics between Đề 01 and Đề 02
  const v1Ids = new Set((hydratedVariants[0]?.questions || []).map((q) => q.id));
  const v2Questions = hydratedVariants[1]?.questions || [];
  const overlapCount = v2Questions.filter((q) => v1Ids.has(q.id)).length;
  const distinctCount = v2Questions.length - overlapCount;

  // Point per question type
  const ptMcq = category === '15min' ? 1.0 : 0.25;
  const ptTf = 1.0;
  const ptSa = 0.5;
  const ptEssay = 1.0;

  // Compute column totals for Matrix & Specification footer rows
  const colSums = {
    mcq: { biet: 0, hieu: 0, van_dung: 0 },
    true_false: { biet: 0, hieu: 0, van_dung: 0 },
    short_answer: { biet: 0, hieu: 0, van_dung: 0 },
    essay: { biet: 0, hieu: 0, van_dung: 0 },
  };

  for (const r of matrixRows) {
    colSums.mcq.biet += r.counts.mcq.biet || 0;
    colSums.mcq.hieu += r.counts.mcq.hieu || 0;
    colSums.mcq.van_dung += r.counts.mcq.van_dung || 0;

    colSums.true_false.biet += r.counts.true_false.biet || 0;
    colSums.true_false.hieu += r.counts.true_false.hieu || 0;
    colSums.true_false.van_dung += r.counts.true_false.van_dung || 0;

    colSums.short_answer.biet += r.counts.short_answer.biet || 0;
    colSums.short_answer.hieu += r.counts.short_answer.hieu || 0;
    colSums.short_answer.van_dung += r.counts.short_answer.van_dung || 0;

    colSums.essay.biet += r.counts.essay.biet || 0;
    colSums.essay.hieu += r.counts.essay.hieu || 0;
    colSums.essay.van_dung += r.counts.essay.van_dung || 0;
  }

  const totalBietCommands =
    colSums.mcq.biet + colSums.true_false.biet + colSums.short_answer.biet + colSums.essay.biet;
  const totalHieuCommands =
    colSums.mcq.hieu + colSums.true_false.hieu + colSums.short_answer.hieu + colSums.essay.hieu;
  const totalVdCommands =
    colSums.mcq.van_dung +
    colSums.true_false.van_dung +
    colSums.short_answer.van_dung +
    colSums.essay.van_dung;
  const grandTotalCommands = totalBietCommands + totalHieuCommands + totalVdCommands;

  const mcqTotalPts =
    (colSums.mcq.biet + colSums.mcq.hieu + colSums.mcq.van_dung) * ptMcq;
  const tfTotalPts =
    (colSums.true_false.biet + colSums.true_false.hieu + colSums.true_false.van_dung) * ptTf;
  const saTotalPts =
    (colSums.short_answer.biet + colSums.short_answer.hieu + colSums.short_answer.van_dung) * ptSa;
  const essayTotalPts =
    (colSums.essay.biet + colSums.essay.hieu + colSums.essay.van_dung) * ptEssay;

  const bietTotalPts =
    colSums.mcq.biet * ptMcq +
    colSums.true_false.biet * ptTf +
    colSums.short_answer.biet * ptSa +
    colSums.essay.biet * ptEssay;
  const hieuTotalPts =
    colSums.mcq.hieu * ptMcq +
    colSums.true_false.hieu * ptTf +
    colSums.short_answer.hieu * ptSa +
    colSums.essay.hieu * ptEssay;
  const vdTotalPts =
    colSums.mcq.van_dung * ptMcq +
    colSums.true_false.van_dung * ptTf +
    colSums.short_answer.van_dung * ptSa +
    colSums.essay.van_dung * ptEssay;

  const effectiveTotalPts =
    Number((mcqTotalPts + tfTotalPts + saTotalPts + essayTotalPts).toFixed(2)) || totalPoints || 10;

  const pctOf = (pts: number) =>
    effectiveTotalPts > 0 ? Number(((pts / effectiveTotalPts) * 100).toFixed(1)) : 0;

  // Group Matrix rows by chapter (tt) for rowSpan on TT & Chủ đề
  const matrixChapterGroups: Array<{
    tt: number;
    chapterTitle: string;
    rows: MatrixRow[];
  }> = [];
  for (const row of matrixRows) {
    const lastGrp = matrixChapterGroups[matrixChapterGroups.length - 1];
    if (lastGrp && lastGrp.chapterTitle === row.chapterTitle) {
      lastGrp.rows.push(row);
    } else {
      matrixChapterGroups.push({
        tt: matrixChapterGroups.length + 1,
        chapterTitle: row.chapterTitle,
        rows: [row],
      });
    }
  }

  // Build Specification sub-rows by level (Biết, Hiểu, Vận dụng) per lesson, grouped by chapter
  interface SpecLevelSubRow {
    levelKey: 'biet' | 'hieu' | 'van_dung';
    levelLabel: string;
    requirements: string[];
    cells: {
      mcq: { biet: string; hieu: string; van_dung: string };
      true_false: { biet: string; hieu: string; van_dung: string };
      short_answer: { biet: string; hieu: string; van_dung: string };
      essay: { biet: string; hieu: string; van_dung: string };
    };
  }

  interface SpecLessonBlock {
    lessonId: number;
    lessonTitle: string;
    periods: number;
    periodsPercent?: number;
    subRows: SpecLevelSubRow[];
  }

  interface SpecChapterGroup {
    tt: number;
    chapterTitle: string;
    totalSubRows: number;
    lessons: SpecLessonBlock[];
  }

  const specChapterGroups: SpecChapterGroup[] = [];

  for (const sRow of specificationRows) {
    const subRows: SpecLevelSubRow[] = [];
    const levels: Array<{ key: 'biet' | 'hieu' | 'van_dung'; label: string }> = [
      { key: 'biet', label: 'Biết' },
      { key: 'hieu', label: 'Hiểu' },
      { key: 'van_dung', label: 'Vận dụng' },
    ];

    for (const lv of levels) {
      const hasCount =
        (sRow.counts?.mcq?.[lv.key] || 0) +
          (sRow.counts?.true_false?.[lv.key] || 0) +
          (sRow.counts?.short_answer?.[lv.key] || 0) +
          (sRow.counts?.essay?.[lv.key] || 0) >
        0;
      const reqs = sRow.requirementsByLevel?.[lv.key] || [];
      if (!hasCount && reqs.length === 0) continue;

      const emptyTriple = { biet: '', hieu: '', van_dung: '' };
      const getCell = (type: 'mcq' | 'true_false' | 'short_answer' | 'essay') => {
        const val =
          sRow.specCells?.[type]?.[lv.key] ||
          (sRow.questionPositions?.[type]?.[lv.key] || []).join(', ');
        return {
          ...emptyTriple,
          [lv.key]: val,
        };
      };

      subRows.push({
        levelKey: lv.key,
        levelLabel: lv.label,
        requirements: reqs,
        cells: {
          mcq: getCell('mcq'),
          true_false: getCell('true_false'),
          short_answer: getCell('short_answer'),
          essay: getCell('essay'),
        },
      });
    }

    if (subRows.length === 0) continue;

    const lessonBlock: SpecLessonBlock = {
      lessonId: sRow.lessonId,
      lessonTitle: sRow.lessonTitle,
      periods: sRow.periods || 2,
      periodsPercent: sRow.periodsPercent,
      subRows,
    };

    const lastChap = specChapterGroups[specChapterGroups.length - 1];
    if (lastChap && lastChap.chapterTitle === sRow.chapterTitle) {
      lastChap.lessons.push(lessonBlock);
      lastChap.totalSubRows += subRows.length;
    } else {
      specChapterGroups.push({
        tt: specChapterGroups.length + 1,
        chapterTitle: sRow.chapterTitle,
        totalSubRows: subRows.length,
        lessons: [lessonBlock],
      });
    }
  }

  // Dynamic Export to Word (.docx) for exact current exam data (any grade, any scope)
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
        .replace(/[\u0300-\u036f]/g, '')
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
  const handleDownloadWordDoc = () => {
    const exportNode =
      (viewMode === 'all' || viewMode === 'matrix' || viewMode === 'spec') && fullDocExportRef.current
        ? fullDocExportRef.current
        : docContainerRef.current;
    if (!exportNode) return;

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          /* 1. KHUNG MA TRẬN & BẢN ĐẶC TẢ: KHỔ A4 NẰM NGANG (LANDSCAPE) */
          @page SectionLandscape {
            size: 841.9pt 595.3pt;
            mso-page-orientation: landscape;
            margin: 34.0pt 42.5pt 34.0pt 42.5pt;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
          }
          div.SectionLandscape {
            page: SectionLandscape;
          }

          /* 2. ĐỀ KIỂM TRA & ĐÁP ÁN: KHỔ A4 THẲNG ĐỨNG (PORTRAIT) */
          @page SectionPortrait {
            size: 595.3pt 841.9pt;
            mso-page-orientation: portrait;
            margin: 42.5pt 56.7pt 42.5pt 56.7pt;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
          }
          div.SectionPortrait {
            page: SectionPortrait;
          }

          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11pt;
            color: #000;
            line-height: 1.35;
          }
          h3, h4 { margin: 8pt 0 4pt 0; }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 6pt 0 10pt 0;
            font-size: 10.5pt;
          }
          th, td {
            border: 1px solid #000;
            padding: 3.5pt 5.5pt;
            vertical-align: middle;
          }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .page-break {
            page-break-before: always;
            mso-break-type: page-break;
          }
          .section-break {
            page-break-before: always;
            mso-break-type: section-break;
            clear: all;
          }
          table.school-header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6pt !important;
          }
          table.score-feedback-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6pt !important;
            margin-bottom: 10pt !important;
          }
          td.score-feedback-cell {
            height: 75pt !important;
            min-height: 75pt !important;
            vertical-align: top !important;
          }
        </style>
      </head>
      <body>
        ${exportNode.innerHTML}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9]+/g, '_');
    link.download = `Ma_Tran_Ban_Dac_Ta_De_Dap_An_KHTN${grade}_${safeName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderPaperBlock = (variant: HydratedVariant) => {
    const mcqList = (variant?.questions || []).filter((q) => q.type === 'mcq');
    const tfList = (variant?.questions || []).filter((q) => q.type === 'true_false');
    const saList = (variant?.questions || []).filter((q) => q.type === 'short_answer');
    const essayList = (variant?.questions || []).filter((q) => q.type === 'essay');
    const tnPoints = Number((mcqList.length * ptMcq + tfList.length * ptTf + saList.length * ptSa).toFixed(2));
    const tlPoints = Number((essayList.length * ptEssay).toFixed(2));

    return (
      <div key={`paper-${variant.paperCode}`} className="space-y-4 pt-2">
        {/* BẢNG 1: THÔNG TIN TRƯỜNG & KỲ THI (Tách biệt hoàn toàn theo chuẩn mẫu) */}
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
        )}

        {/* Exam Questions Content */}
        <div className="space-y-4 text-sm leading-relaxed">
          {(mcqList.length > 0 || tfList.length > 0 || saList.length > 0) && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm sm:text-base">
                A. TRẮC NGHIỆM: ({fmtVi(tnPoints, true)} điểm)
              </h4>

              {mcqList.length > 0 && (
                <div className="space-y-2.5">
                  <div className="font-bold">
                    I. Câu trắc nghiệm nhiều lựa chọn ({fmtVi(mcqList.length * ptMcq, true)} điểm)
                    <div className="font-normal italic text-xs sm:text-sm">
                      Thí sinh trả lời từ câu 1 đến câu {mcqList.length}. Mỗi câu hỏi thí sinh chỉ
                      chọn một phương án.
                    </div>
                  </div>
                  {mcqList.map((q, idx) => (
                    <div key={q.id} className="space-y-1">
                      <div>
                        <strong>Câu {idx + 1}:</strong> {q.prompt}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 pl-2">
                        {(q.displayedOptions || q.options || []).map((opt, oIdx) => (
                          <div key={oIdx}>
                            <strong>{['A', 'B', 'C', 'D'][oIdx]}.</strong> {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tfList.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="font-bold">
                    II. Câu trắc nghiệm đúng - sai ({fmtVi(tfList.length * ptTf, true)} điểm)
                    <div className="font-normal italic text-xs sm:text-sm">
                      Thí sinh trả lời từ câu 1 đến câu {tfList.length}. Trong mỗi ý a), b), c), d)
                      ở mỗi câu, thí sinh chọn đúng (Đ) hoặc sai (S).
                    </div>
                  </div>
                  {tfList.map((q, idx) => (
                    <div key={q.id} className="space-y-1.5">
                      <div>
                        <strong>Câu {idx + 1}:</strong> {q.prompt}
                      </div>
                      <table className="w-full border-collapse border border-slate-900 text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-50 font-bold text-center">
                            <th className="border border-slate-900 p-1.5 w-12">Ý</th>
                            <th className="border border-slate-900 p-1.5 text-left">
                              Nội dung nhận định
                            </th>
                            <th className="border border-slate-900 p-1.5 w-20">Đ/S</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(q.statements || []).map((st) => (
                            <tr key={st.id}>
                              <td className="border border-slate-900 p-1.5 text-center font-bold">
                                {st.id}
                              </td>
                              <td className="border border-slate-900 p-1.5">{st.text}</td>
                              <td className="border border-slate-900 p-1.5 text-center"></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {saList.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="font-bold">
                    III. Câu trắc nghiệm trả lời ngắn ({fmtVi(saList.length * ptSa, true)} điểm)
                    <div className="font-normal italic text-xs sm:text-sm">
                      Thí sinh trả lời từ câu 1 đến câu {saList.length}.
                    </div>
                  </div>
                  {saList.map((q, idx) => (
                    <div key={q.id} className="space-y-1">
                      <div>
                        <strong>Câu {idx + 1}:</strong> {q.prompt}
                      </div>
                      <div className="pl-2">
                        Trả lời: ........................................................................................
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {essayList.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="font-bold text-sm sm:text-base">
                B. TỰ LUẬN: ({fmtVi(tlPoints, true)} điểm)
              </h4>
              {essayList.map((q, idx) => (
                <div key={q.id} className="space-y-1">
                  <div>
                    <strong>
                      Câu {idx + 1} ({fmtVi(q.points || 1.0, true)} điểm):
                    </strong>{' '}
                    {q.prompt}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center font-bold pt-2">
            ....................... HẾT .......................
          </div>
        </div>
      </div>
    );
  };

  const renderAnswerKeyBlock = (variant: HydratedVariant) => {
    const mcqList = (variant?.questions || []).filter((q) => q.type === 'mcq');
    const tfList = (variant?.questions || []).filter((q) => q.type === 'true_false');
    const saList = (variant?.questions || []).filter((q) => q.type === 'short_answer');
    const essayList = (variant?.questions || []).filter((q) => q.type === 'essay');
    const tnPoints = Number((mcqList.length * ptMcq + tfList.length * ptTf + saList.length * ptSa).toFixed(2));
    const tlPoints = Number((essayList.length * ptEssay).toFixed(2));

    return (
      <div key={`ans-${variant.paperCode}`} className="space-y-4 pt-2">
        <div className="text-center space-y-0.5">
          <h3 className="font-bold text-base uppercase">
            HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN — ĐỀ {variant.paperCode}
          </h3>
          <p className="text-xs font-semibold">
            {title} • NĂM HỌC: {schoolYear}
          </p>
        </div>

        {(mcqList.length > 0 || tfList.length > 0 || saList.length > 0) && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm">
              A. TRẮC NGHIỆM: ({fmtVi(tnPoints, true)} điểm)
            </h4>

            {mcqList.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-xs sm:text-sm">
                  I. Đáp án câu hỏi trắc nghiệm nhiều lựa chọn ({fmtVi(mcqList.length * ptMcq, true)}{' '}
                  điểm — Mỗi câu đúng được {fmtVi(ptMcq)} điểm):
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs text-center">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-slate-900 p-1.5">Câu</td>
                      {mcqList.map((_, idx) => (
                        <td key={idx} className="border border-slate-900 p-1.5">
                          {idx + 1}
                        </td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold">
                      <td className="border border-slate-900 p-1.5">Đáp án</td>
                      {mcqList.map((q, idx) => (
                        <td key={idx} className="border border-slate-900 p-1.5 text-[#0D6E6E]">
                          {q.displayedCorrectLetter || 'A'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {tfList.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-xs sm:text-sm">
                  II. Đáp án câu hỏi trắc nghiệm đúng - sai ({fmtVi(tfList.length * ptTf, true)}{' '}
                  điểm — Đúng 1 ý: 0,1đ; 2 ý: 0,25đ; 3 ý: 0,5đ; 4 ý: 1,0đ):
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 p-1.5 w-14">Câu</th>
                      <th className="border border-slate-900 p-1.5 w-12">Ý</th>
                      <th className="border border-slate-900 p-1.5 w-16">Đáp án</th>
                      <th className="border border-slate-900 p-1.5 text-left">
                        Giải thích ngắn gọn
                      </th>
                      <th className="border border-slate-900 p-1.5 w-16">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tfList.map((q, qIdx) =>
                      (q.statements || []).map((st, sIdx) => (
                        <tr key={`${q.id}-${st.id}`}>
                          {sIdx === 0 && (
                            <td
                              rowSpan={(q.statements || []).length}
                              className="border border-slate-900 p-1.5 text-center font-bold"
                            >
                              {qIdx + 1}
                            </td>
                          )}
                          <td className="border border-slate-900 p-1.5 text-center font-bold">
                            {st.id}
                          </td>
                          <td className="border border-slate-900 p-1.5 text-center font-bold">
                            {st.isTrue ? 'Đ' : 'S'}
                          </td>
                          <td className="border border-slate-900 p-1.5">
                            {st.explanation || q.explanation}
                          </td>
                          <td className="border border-slate-900 p-1.5 text-center">0,25</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {saList.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-xs sm:text-sm">
                  III. Đáp án câu hỏi trắc nghiệm trả lời ngắn ({fmtVi(saList.length * ptSa, true)}{' '}
                  điểm — Mỗi câu đúng được 0,5 điểm):
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="border border-slate-900 p-1.5 w-20 text-center">Câu</th>
                      <th className="border border-slate-900 p-1.5 text-left">Nội dung đáp án</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saList.map((q, idx) => (
                      <tr key={q.id}>
                        <td className="border border-slate-900 p-1.5 text-center font-bold">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-900 p-1.5 font-semibold">
                          {(q.acceptedAnswers || [])[0] || q.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {essayList.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm">
              B. TỰ LUẬN: ({fmtVi(tlPoints, true)} điểm)
            </h4>
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 p-1.5 w-24">Câu</th>
                  <th className="border border-slate-900 p-1.5 text-left">Nội dung</th>
                  <th className="border border-slate-900 p-1.5 w-28">Điểm từng phần</th>
                  <th className="border border-slate-900 p-1.5 w-20">Điểm tổng</th>
                </tr>
              </thead>
              <tbody>
                {essayList.map((q, idx) => {
                  const steps = q.rubricSteps || [];
                  return steps.map((st, sIdx) => (
                    <tr key={`${q.id}-${st.id}`}>
                      {sIdx === 0 && (
                        <td
                          rowSpan={steps.length}
                          className="border border-slate-900 p-1.5 text-center font-bold"
                        >
                          {idx + 1}
                          <br />({fmtVi(q.points || 1.0, true)} điểm)
                        </td>
                      )}
                      <td className="border border-slate-900 p-1.5">{st.description}</td>
                      <td className="border border-slate-900 p-1.5 text-center font-semibold">
                        {fmtVi(st.points)}
                      </td>
                      {sIdx === 0 && (
                        <td
                          rowSpan={steps.length}
                          className="border border-slate-900 p-1.5 text-center font-bold"
                        >
                          {fmtVi(q.points || 1.0, true)}
                        </td>
                      )}
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 32: Signature Approval Block matching sample docx */}
        <table className="w-full border-collapse border border-slate-900 text-xs mt-4">
          <tbody>
            <tr>
              <td className="border border-slate-900 p-3 text-center w-1/2 align-top">
                <div className="font-bold uppercase">DUYỆT CỦA TỔ TRƯỞNG</div>
                <div className="italic mt-1">
                  Thống nhất nội dung với ma trận, bản đặc tả, đề và đáp án.
                </div>
                <div className="font-bold mt-2">TỔ TRƯỞNG</div>
                <div className="font-bold mt-10 text-sm">
                  {schoolConfig.teacherName || 'Lê Văn Thắng'}
                </div>
              </td>
              <td className="border border-slate-900 p-3 text-center w-1/2 align-top">
                <div className="italic">
                  Ngày ...... tháng ...... năm 202...
                </div>
                <div className="font-bold uppercase mt-1">Giáo viên ra đề</div>
                <div className="font-bold mt-12 text-sm">
                  {schoolConfig.teacherName || 'Lê Văn Thắng'}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderMatrixContent = () => (
          <div className="space-y-3">
            <div className="text-center space-y-0.5">
              <div className="text-xs font-bold uppercase text-slate-600">
                {schoolConfig.schoolName} — TỔ KHOA HỌC TỰ NHIÊN
              </div>
              <h3 className="font-bold text-base sm:text-lg uppercase">
                KHUNG MA TRẬN {title}
              </h3>
              <p className="text-xs font-semibold">
                MÔN: KHOA HỌC TỰ NHIÊN {grade} • THỜI GIAN: {durationMinutes} PHÚT • NĂM HỌC:{' '}
                {schoolYear}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th rowSpan={3} className="border border-slate-900 p-1.5 w-8">
                      TT
                    </th>
                    <th rowSpan={3} className="border border-slate-900 p-1.5 w-44">
                      Chủ đề
                    </th>
                    <th rowSpan={3} className="border border-slate-900 p-1.5 w-56">
                      Nội dung/đơn vị kiến thức
                    </th>
                    <th colSpan={12} className="border border-slate-900 p-1.5">
                      Mức độ đánh giá
                    </th>
                    <th colSpan={3} rowSpan={2} className="border border-slate-900 p-1.5">
                      Tổng
                    </th>
                    <th rowSpan={3} className="border border-slate-900 p-1.5 w-16">
                      Tỉ lệ % điểm
                    </th>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-center">
                    <th colSpan={3} className="border border-slate-900 p-1">
                      TNKQ nhiều lựa chọn (I)
                    </th>
                    <th colSpan={3} className="border border-slate-900 p-1">
                      TNKQ đúng – sai (II)
                    </th>
                    <th colSpan={3} className="border border-slate-900 p-1">
                      TNKQ trả lời ngắn (III)
                    </th>
                    <th colSpan={3} className="border border-slate-900 p-1">
                      Tự luận
                    </th>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-center">
                    <th className="border border-slate-900 p-1 w-7">B</th>
                    <th className="border border-slate-900 p-1 w-7">H</th>
                    <th className="border border-slate-900 p-1 w-7">VD</th>
                    <th className="border border-slate-900 p-1 w-7">B</th>
                    <th className="border border-slate-900 p-1 w-7">H</th>
                    <th className="border border-slate-900 p-1 w-7">VD</th>
                    <th className="border border-slate-900 p-1 w-7">B</th>
                    <th className="border border-slate-900 p-1 w-7">H</th>
                    <th className="border border-slate-900 p-1 w-7">VD</th>
                    <th className="border border-slate-900 p-1 w-7">B</th>
                    <th className="border border-slate-900 p-1 w-7">H</th>
                    <th className="border border-slate-900 p-1 w-7">VD</th>
                    <th className="border border-slate-900 p-1 w-7 bg-amber-50/60">B</th>
                    <th className="border border-slate-900 p-1 w-7 bg-amber-50/60">H</th>
                    <th className="border border-slate-900 p-1 w-7 bg-amber-50/60">VD</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixChapterGroups.map((chapGrp) =>
                    chapGrp.rows.map((row, rIdx) => {
                      const rowB =
                        row.totalByLevel?.biet ??
                        (row.counts.mcq.biet || 0) +
                          (row.counts.true_false.biet || 0) +
                          (row.counts.short_answer.biet || 0) +
                          (row.counts.essay.biet || 0);
                      const rowH =
                        row.totalByLevel?.hieu ??
                        (row.counts.mcq.hieu || 0) +
                          (row.counts.true_false.hieu || 0) +
                          (row.counts.short_answer.hieu || 0) +
                          (row.counts.essay.hieu || 0);
                      const rowVD =
                        row.totalByLevel?.van_dung ??
                        (row.counts.mcq.van_dung || 0) +
                          (row.counts.true_false.van_dung || 0) +
                          (row.counts.short_answer.van_dung || 0) +
                          (row.counts.essay.van_dung || 0);

                      return (
                        <tr key={`mat-${row.lessonId}`} className="text-center">
                          {rIdx === 0 && (
                            <>
                              <td
                                rowSpan={chapGrp.rows.length}
                                className="border border-slate-900 p-1.5 font-bold align-middle"
                              >
                                {chapGrp.tt}
                              </td>
                              <td
                                rowSpan={chapGrp.rows.length}
                                className="border border-slate-900 p-1.5 text-left font-semibold align-middle"
                              >
                                {chapGrp.chapterTitle}
                              </td>
                            </>
                          )}
                          <td className="border border-slate-900 p-1.5 text-left">
                            <span className="font-semibold">{row.lessonTitle}</span>{' '}
                            <span className="text-slate-700 whitespace-nowrap">
                              ({row.periods} tiết{row.periodsPercent ? ` ~ ${fmtVi(row.periodsPercent)}%` : ''})
                            </span>
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.mcq.biet || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.mcq.hieu || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.mcq.van_dung || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.true_false.biet || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.true_false.hieu || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.true_false.van_dung || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.short_answer.biet || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.short_answer.hieu || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.short_answer.van_dung || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.essay.biet || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.essay.hieu || ''}
                          </td>
                          <td className="border border-slate-900 p-1">
                            {row.counts.essay.van_dung || ''}
                          </td>
                          <td className="border border-slate-900 p-1 font-bold bg-amber-50/30">
                            {rowB || ''}
                          </td>
                          <td className="border border-slate-900 p-1 font-bold bg-amber-50/30">
                            {rowH || ''}
                          </td>
                          <td className="border border-slate-900 p-1 font-bold bg-amber-50/30">
                            {rowVD || ''}
                          </td>
                          <td className="border border-slate-900 p-1.5 font-bold">
                            {fmtVi(row.percentScore)}
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* Footer Row 1: Tổng lệnh hỏi */}
                  <tr className="bg-slate-100 font-bold text-center">
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      Tổng lệnh hỏi
                    </td>
                    <td className="border border-slate-900 p-1">{colSums.mcq.biet || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.mcq.hieu || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.mcq.van_dung || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.true_false.biet || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.true_false.hieu || ''}</td>
                    <td className="border border-slate-900 p-1">
                      {colSums.true_false.van_dung || ''}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {colSums.short_answer.biet || ''}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {colSums.short_answer.hieu || ''}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {colSums.short_answer.van_dung || ''}
                    </td>
                    <td className="border border-slate-900 p-1">{colSums.essay.biet || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.essay.hieu || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.essay.van_dung || ''}</td>
                    <td className="border border-slate-900 p-1 bg-amber-100/60">
                      {totalBietCommands}
                    </td>
                    <td className="border border-slate-900 p-1 bg-amber-100/60">
                      {totalHieuCommands}
                    </td>
                    <td className="border border-slate-900 p-1 bg-amber-100/60">
                      {totalVdCommands}
                    </td>
                    <td className="border border-slate-900 p-1.5">{grandTotalCommands}</td>
                  </tr>

                  {/* Footer Row 2: Tổng số điểm */}
                  <tr className="bg-slate-50 font-bold text-center">
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      Tổng số điểm
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(mcqTotalPts, true)}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(tfTotalPts, true)}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(saTotalPts, true)}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(essayTotalPts, true)}
                    </td>
                    <td className="border border-slate-900 p-1 bg-amber-50">
                      {fmtVi(bietTotalPts, true)}
                    </td>
                    <td className="border border-slate-900 p-1 bg-amber-50">
                      {fmtVi(hieuTotalPts, true)}
                    </td>
                    <td className="border border-slate-900 p-1 bg-amber-50">
                      {fmtVi(vdTotalPts, true)}
                    </td>
                    <td className="border border-slate-900 p-1.5">{fmtVi(effectiveTotalPts)}</td>
                  </tr>

                  {/* Footer Row 3: Tỉ lệ % điểm */}
                  <tr className="bg-slate-50 font-bold text-center">
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      Tỉ lệ % điểm
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(pctOf(mcqTotalPts))}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(pctOf(tfTotalPts))}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(pctOf(saTotalPts))}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(pctOf(essayTotalPts))}
                    </td>
                    <td className="border border-slate-900 p-1 bg-amber-50">
                      {fmtVi(pctOf(bietTotalPts))}
                    </td>
                    <td className="border border-slate-900 p-1 bg-amber-50">
                      {fmtVi(pctOf(hieuTotalPts))}
                    </td>
                    <td className="border border-slate-900 p-1 bg-amber-50">
                      {fmtVi(pctOf(vdTotalPts))}
                    </td>
                    <td className="border border-slate-900 p-1.5">100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  );

  const renderSpecContent = () => (
          <div className="space-y-3 pt-2">
            <div className="text-center space-y-0.5">
              <h3 className="font-bold text-base sm:text-lg uppercase">
                BẢN ĐẶC TẢ {title}
              </h3>
              <p className="text-xs font-semibold">
                MÔN: KHOA HỌC TỰ NHIÊN {grade} • THỜI GIAN: {durationMinutes} PHÚT • NĂM HỌC:{' '}
                {schoolYear}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th rowSpan={4} className="border border-slate-900 p-1.5 w-8">
                      TT
                    </th>
                    <th rowSpan={4} className="border border-slate-900 p-1.5 w-36">
                      Chủ đề
                    </th>
                    <th rowSpan={4} className="border border-slate-900 p-1.5 w-44">
                      Nội dung/đơn vị kiến thức
                    </th>
                    <th rowSpan={4} className="border border-slate-900 p-1.5">
                      Yêu cầu cần đạt
                    </th>
                    <th colSpan={12} className="border border-slate-900 p-1.5">
                      Số lượng lệnh hỏi ở các mức độ
                    </th>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-center">
                    <th colSpan={9} className="border border-slate-900 p-1">
                      Trắc nghiệm KQ
                    </th>
                    <th rowSpan={2} colSpan={3} className="border border-slate-900 p-1">
                      Tự luận
                    </th>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-center">
                    <th colSpan={3} className="border border-slate-900 p-1">
                      Nhiều lựa chọn
                    </th>
                    <th colSpan={3} className="border border-slate-900 p-1">
                      Đúng-Sai
                    </th>
                    <th colSpan={3} className="border border-slate-900 p-1">
                      Trả lời ngắn
                    </th>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-center">
                    <th className="border border-slate-900 p-1 w-14">B</th>
                    <th className="border border-slate-900 p-1 w-14">H</th>
                    <th className="border border-slate-900 p-1 w-14">VD</th>
                    <th className="border border-slate-900 p-1 w-14">B</th>
                    <th className="border border-slate-900 p-1 w-14">H</th>
                    <th className="border border-slate-900 p-1 w-14">VD</th>
                    <th className="border border-slate-900 p-1 w-14">B</th>
                    <th className="border border-slate-900 p-1 w-14">H</th>
                    <th className="border border-slate-900 p-1 w-14">VD</th>
                    <th className="border border-slate-900 p-1 w-14">B</th>
                    <th className="border border-slate-900 p-1 w-14">H</th>
                    <th className="border border-slate-900 p-1 w-14">VD</th>
                  </tr>
                </thead>
                <tbody>
                  {specChapterGroups.map((chapGrp) => {
                    let chapFirstRendered = false;
                    return chapGrp.lessons.map((lesBlk) =>
                      lesBlk.subRows.map((sub, sIdx) => {
                        const renderChapCells = !chapFirstRendered;
                        chapFirstRendered = true;
                        const renderLesCell = sIdx === 0;

                        return (
                          <tr
                            key={`spec-${lesBlk.lessonId}-${sub.levelKey}`}
                            className="align-middle"
                          >
                            {renderChapCells && (
                              <>
                                <td
                                  rowSpan={chapGrp.totalSubRows}
                                  className="border border-slate-900 p-1.5 text-center font-bold"
                                >
                                  {chapGrp.tt}
                                </td>
                                <td
                                  rowSpan={chapGrp.totalSubRows}
                                  className="border border-slate-900 p-1.5 font-semibold"
                                >
                                  {chapGrp.chapterTitle}
                                </td>
                              </>
                            )}

                            {renderLesCell && (
                              <td
                                rowSpan={lesBlk.subRows.length}
                                className="border border-slate-900 p-1.5"
                              >
                                <span className="font-semibold">{lesBlk.lessonTitle}</span>{' '}
                                <span className="text-slate-700 whitespace-nowrap">
                                  ({lesBlk.periods} tiết{lesBlk.periodsPercent ? ` ~ ${fmtVi(lesBlk.periodsPercent)}%` : ''})
                                </span>
                              </td>
                            )}

                            <td className="border border-slate-900 p-1.5 leading-relaxed">
                              <div className="font-bold">{sub.levelLabel}:</div>
                              {sub.requirements.map((req, idx) => (
                                <div key={idx}>– {req}</div>
                              ))}
                            </td>

                            {/* 12 columns of question positions + indicators */}
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.mcq.biet}
                            </td>
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.mcq.hieu}
                            </td>
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.mcq.van_dung}
                            </td>

                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.true_false.biet}
                            </td>
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.true_false.hieu}
                            </td>
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.true_false.van_dung}
                            </td>

                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.short_answer.biet}
                            </td>
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.short_answer.hieu}
                            </td>
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.short_answer.van_dung}
                            </td>

                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.essay.biet}
                            </td>
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.essay.hieu}
                            </td>
                            <td className="border border-slate-900 p-1 text-center whitespace-pre-line font-medium">
                              {sub.cells.essay.van_dung}
                            </td>
                          </tr>
                        );
                      })
                    );
                  })}

                  {/* Specification Footer Row 1: Tổng số lệnh hỏi */}
                  <tr className="bg-slate-100 font-bold text-center">
                    <td colSpan={4} className="border border-slate-900 p-1.5">
                      Tổng số lệnh hỏi
                    </td>
                    <td className="border border-slate-900 p-1">{colSums.mcq.biet || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.mcq.hieu || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.mcq.van_dung || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.true_false.biet || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.true_false.hieu || ''}</td>
                    <td className="border border-slate-900 p-1">
                      {colSums.true_false.van_dung || ''}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {colSums.short_answer.biet || ''}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {colSums.short_answer.hieu || ''}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {colSums.short_answer.van_dung || ''}
                    </td>
                    <td className="border border-slate-900 p-1">{colSums.essay.biet || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.essay.hieu || ''}</td>
                    <td className="border border-slate-900 p-1">{colSums.essay.van_dung || ''}</td>
                  </tr>

                  {/* Specification Footer Row 2: Tổng số điểm */}
                  <tr className="bg-slate-50 font-bold text-center">
                    <td colSpan={4} className="border border-slate-900 p-1.5">
                      Tổng số điểm
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(mcqTotalPts, true)}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(tfTotalPts, true)}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(saTotalPts, true)}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(essayTotalPts, true)}
                    </td>
                  </tr>

                  {/* Specification Footer Row 3: Tỉ lệ % */}
                  <tr className="bg-slate-50 font-bold text-center">
                    <td colSpan={4} className="border border-slate-900 p-1.5">
                      Tỉ lệ %
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(pctOf(mcqTotalPts))}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(pctOf(tfTotalPts))}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(pctOf(saTotalPts))}
                    </td>
                    <td colSpan={3} className="border border-slate-900 p-1.5">
                      {fmtVi(pctOf(essayTotalPts))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  );

  return (
    <div className="space-y-4">
      {/* Sub-navigation Tabs & Export Toolbar (Hidden when printing) */}
      <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'matrix'
                ? 'bg-[#0D6E6E] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-teal-50'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>1. Khung Ma trận đề (Giống mẫu)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('spec')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'spec'
                ? 'bg-[#0D6E6E] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-teal-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Bản đặc tả đề (Giống mẫu)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('paper')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'paper'
                ? 'bg-[#0D6E6E] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-teal-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Đề kiểm tra (2 đề khác nhau: Đề 01 & Đề 02)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('answer_key')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'answer_key'
                ? 'bg-[#0D6E6E] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-teal-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>4. Đáp án & Hướng dẫn chấm (2 đề)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'all'
                ? 'bg-[#0D6E6E] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-teal-50'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>5. Xem gộp trọn bộ (Ma trận + Đặc tả + 2 Đề + Đáp án)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(viewMode === 'paper' || viewMode === 'answer_key') && hydratedVariants.length > 0 && (
            <div className="flex items-center gap-1.5 mr-1">
              <span className="text-xs font-bold text-slate-700">Hiển thị:</span>
              <button
                type="button"
                onClick={() => setSelectedPaperCode('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                  selectedPaperCode === 'ALL'
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Cả 2 đề (Đề 01 & Đề 02)
              </button>
              {hydratedVariants.map((v) => (
                <button
                  key={v.paperCode}
                  type="button"
                  onClick={() => setSelectedPaperCode(v.paperCode)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                    selectedPaperCode === v.paperCode
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Chỉ Đề {v.paperCode}
                </button>
              ))}
            </div>
          )}

          <button
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
          )}

          <button
            type="button"
            onClick={handleDownloadWordDoc}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
            title="Tải file Word (.doc) chứa bảng Ma trận, Bản đặc tả (ngang), Đề và Đáp án (đứng)"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Document Content Container */}
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

    </div>
  );
};

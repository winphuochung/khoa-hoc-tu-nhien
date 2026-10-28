import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  FileSpreadsheet,
  Printer,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  Plus,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import {
  ChapterInfo,
  ExamCategory,
  ExamDefinition,
  LessonItem,
  MatrixRow,
  QuestionItem,
  SchoolConfig,
  SpecificationRow,
} from '../../types/domainTypes';
import { ExamPrintableViewer } from './ExamPrintableViewer';
import { ExamDocumentTablesView, HydratedVariant } from './ExamDocumentTablesView';

interface ExamStudioManagerProps {
  chapters: ChapterInfo[];
  lessons: LessonItem[];
  availableClasses: string[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
  selectedGrade?: number;
}

export const ExamStudioManager: React.FC<ExamStudioManagerProps> = ({
  chapters,
  lessons,
  availableClasses,
  onNotify,
  selectedGrade = 9,
}) => {
  const [exams, setExams] = useState<Array<ExamDefinition & { submissionsCount?: number }>>([]);
  const [bankQuestions, setBankQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Builder Mode: 'auto' (Tạo tự động theo ma trận) | 'manual' (Chọn thủ công từ ngân hàng)
  const [builderMode, setBuilderMode] = useState<'auto' | 'manual'>('auto');
  const [examTitle, setExamTitle] = useState('ĐỀ KIỂM TRA GIỮA KÌ I');
  const [category, setCategory] = useState<ExamCategory>('midterm');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [totalPoints, setTotalPoints] = useState<number>(10);
  const [variantCount, setVariantCount] = useState<number>(2);
  const [maxTabViolations, setMaxTabViolations] = useState<number>(3);
  const [assignedClasses, setAssignedClasses] = useState<string[]>(availableClasses);

  // Scope of lessons (Default: 9 lessons of Official Midterm Sample)
  const [selectedLessons, setSelectedLessons] = useState<number[]>([
    1, 2, 3, 18, 19, 20, 21, 36, 37,
  ]);
  const [countsByType, setCountsByType] = useState({
    mcq: 12,
    true_false: 2,
    short_answer: 4,
    essay: 3,
  });
  const [levelRatios, setLevelRatios] = useState({
    biet: 40,
    hieu: 30,
    van_dung: 30,
  });

  // Previewed / Selected questions & generated tables before saving
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [previewMatrix, setPreviewMatrix] = useState<MatrixRow[]>([]);
  const [previewSpec, setPreviewSpec] = useState<SpecificationRow[]>([]);
  const [previewHydratedVariants, setPreviewHydratedVariants] = useState<HydratedVariant[]>([]);
  const [previewSchoolConfig, setPreviewSchoolConfig] = useState<SchoolConfig>({
    schoolName: 'Trường TH – THCS Phước Hưng',
    teacherName: 'Lê Văn Thắng',
    schoolYear: '2026 – 2027',
    classes: ['9A1', '9A2'],
    antiCheatMaxViolations: 3,
  });

  // Print viewer modal for saved exams
  const [printingExamId, setPrintingExamId] = useState<string | null>(null);

  const generatePreviewForScope = async (
    scopeToUse: number[],
    catToUse: ExamCategory = category,
    countsToUse = countsByType,
    ratiosToUse = levelRatios,
    useOfficialPreset = false,
    silent = false
  ) => {
    if (!scopeToUse || scopeToUse.length === 0) {
      setSelectedQuestionIds([]);
      setPreviewMatrix([]);
      setPreviewSpec([]);
      setPreviewHydratedVariants([]);
      if (!silent) {
        onNotify('error', 'Vui lòng chọn ít nhất 1 bài học để sinh Ma trận, Bản đặc tả và Đề kiểm tra.');
      }
      return;
    }

    try {
      const res = await apiRequest<{
        selectedQuestions: QuestionItem[];
        questionIds: string[];
        matrixRows: MatrixRow[];
        specificationRows: SpecificationRow[];
        hydratedVariants: HydratedVariant[];
        schoolConfig?: SchoolConfig;
      }>('/api/exams/auto-generate', {
        method: 'POST',
        body: JSON.stringify({
          category: catToUse,
          lessonScope: scopeToUse,
          countsByType: countsToUse,
          levelRatios: ratiosToUse,
          totalPoints,
          variantCount,
          useOfficialMidtermPreset: useOfficialPreset,
        }),
      });
      setSelectedQuestionIds(res.questionIds);
      setPreviewMatrix(res.matrixRows);
      setPreviewSpec(res.specificationRows);
      setPreviewHydratedVariants(res.hydratedVariants || []);
      if (res.schoolConfig) setPreviewSchoolConfig(res.schoolConfig);
      if (!silent) {
        onNotify(
          'success',
          `Đã sinh Khung Ma trận, Bản đặc tả và ${res.hydratedVariants?.length || 2} Mã đề đúng theo ${scopeToUse.length} bài học đã chọn (${res.questionIds.length} lệnh hỏi)!`
        );
      }
    } catch (err: any) {
      if (!silent) {
        onNotify('error', err.message || 'Lỗi khi tự động sinh đề theo ma trận.');
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [examsRes, qRes] = await Promise.all([
        apiRequest<ExamDefinition[]>('/api/exams'),
        apiRequest<QuestionItem[]>('/api/questions'),
      ]);
      setExams(examsRes);
      setBankQuestions(qRes);
      // Auto-generate initial preview matching default selected lessons
      await generatePreviewForScope([1, 2, 3, 18, 19, 20, 21, 36, 37], 'midterm', countsByType, levelRatios, false, true);
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi tải dữ liệu soạn đề.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (lessons && lessons.length > 0) {
      const valid = selectedLessons.filter((id) => lessons.some((l) => l.id === id));
      if (valid.length === 0) {
        const newScope = lessons.slice(0, Math.min(8, lessons.length)).map((l) => l.id);
        setSelectedLessons(newScope);
        generatePreviewForScope(newScope, category, countsByType, levelRatios, false, true);
      }
    }
  }, [lessons]);

  const applyCategoryPreset = (cat: ExamCategory) => {
    setCategory(cat);
    let nextCounts = countsByType;
    let nextRatios = levelRatios;
    if (cat === 'regular') {
      setExamTitle('BÀI KIỂM TRA THƯỜNG XUYÊN');
      setDurationMinutes(15);
      setTotalPoints(10);
      nextCounts = { mcq: 10, true_false: 0, short_answer: 0, essay: 0 };
      nextRatios = { biet: 50, hieu: 30, van_dung: 20 };
    } else if (cat === '15min') {
      setExamTitle('ĐỀ KIỂM TRA 15 PHÚT');
      setDurationMinutes(15);
      setTotalPoints(10);
      nextCounts = { mcq: 10, true_false: 0, short_answer: 0, essay: 0 };
      nextRatios = { biet: 40, hieu: 30, van_dung: 30 };
    } else if (cat === 'midterm') {
      setExamTitle('ĐỀ KIỂM TRA GIỮA KÌ I');
      setDurationMinutes(90);
      setTotalPoints(10);
      nextCounts = { mcq: 12, true_false: 2, short_answer: 4, essay: 3 };
      nextRatios = { biet: 40, hieu: 30, van_dung: 30 };
    } else if (cat === 'final') {
      setExamTitle('ĐỀ KIỂM TRA CUỐI HỌC KÌ');
      setDurationMinutes(90);
      setTotalPoints(10);
      nextCounts = { mcq: 12, true_false: 2, short_answer: 4, essay: 3 };
      nextRatios = { biet: 40, hieu: 30, van_dung: 30 };
    }
    setCountsByType(nextCounts);
    setLevelRatios(nextRatios);
    generatePreviewForScope(selectedLessons, cat, nextCounts, nextRatios, false, true);
  };

  const handleSaveExam = async () => {
    if (!examTitle.trim() || selectedQuestionIds.length === 0) {
      onNotify('error', 'Vui lòng bấm "Sinh Đề, Ma trận & Bản đặc tả" trước khi lưu đề.');
      return;
    }
    try {
      const created = await apiRequest<ExamDefinition>('/api/exams', {
        method: 'POST',
        body: JSON.stringify({
          title: examTitle,
          category,
          durationMinutes,
          totalPoints,
          assignedClasses,
          lessonScope: selectedLessons,
          questionIds: selectedQuestionIds,
          variantCount,
          maxTabViolations,
          allowReview: false,
        }),
      });
      setExams((prev) => [created, ...prev]);
      onNotify(
        'success',
        `Đã lưu và phát hành "${created.title}" (${created.paperVariants.length} mã đề tương đương, đúng nội dung ${created.lessonScope.length} bài đã chọn)!`
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể lưu đề kiểm tra.');
    }
  };

  const handleToggleExamField = async (
    exam: ExamDefinition,
    field: 'allowReview' | 'isOpen'
  ) => {
    try {
      const updated = await apiRequest<ExamDefinition>(`/api/exams/${exam.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: !exam[field] }),
      });
      setExams((prev) =>
        prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
      );
      onNotify(
        'success',
        field === 'allowReview'
          ? updated.allowReview
            ? 'Đã MỞ cho phép học sinh xem điểm chi tiết, đúng/sai và lời giải.'
            : 'Đã KHOÁ xem đáp án/lời giải đối với học sinh.'
          : updated.isOpen
          ? 'Đã mở phòng kiểm tra.'
          : 'Đã đóng phòng kiểm tra.'
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể cập nhật trạng thái đề.');
    }
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await apiRequest(`/api/exams/${id}`, { method: 'DELETE' });
      setExams((prev) => prev.filter((e) => e.id !== id));
      onNotify('success', 'Đã xoá đề kiểm tra.');
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi khi xoá đề.');
    }
  };

  const toggleLessonInScope = (lessonId: number) => {
    const next = selectedLessons.includes(lessonId)
      ? selectedLessons.filter((id) => id !== lessonId)
      : [...selectedLessons, lessonId].sort((a, b) => a - b);
    setSelectedLessons(next);
    if (next.length > 0) {
      generatePreviewForScope(next, category, countsByType, levelRatios, false, true);
    } else {
      setSelectedQuestionIds([]);
      setPreviewMatrix([]);
      setPreviewSpec([]);
      setPreviewHydratedVariants([]);
    }
  };

  const selectChapterLessons = (chapterLessonIds: number[]) => {
    const allIn = chapterLessonIds.every((id) => selectedLessons.includes(id));
    let next: number[];
    if (allIn) {
      next = selectedLessons.filter((id) => !chapterLessonIds.includes(id));
    } else {
      next = Array.from(new Set([...selectedLessons, ...chapterLessonIds])).sort((a, b) => a - b);
    }
    setSelectedLessons(next);
    if (next.length > 0) {
      generatePreviewForScope(next, category, countsByType, levelRatios, false, true);
    } else {
      setSelectedQuestionIds([]);
      setPreviewMatrix([]);
      setPreviewSpec([]);
      setPreviewHydratedVariants([]);
    }
  };

  const toggleManualQuestion = async (qId: string) => {
    const nextIds = selectedQuestionIds.includes(qId)
      ? selectedQuestionIds.filter((id) => id !== qId)
      : [...selectedQuestionIds, qId];
    setSelectedQuestionIds(nextIds);
    if (nextIds.length > 0) {
      try {
        const res = await apiRequest<{
          matrixRows: MatrixRow[];
          specificationRows: SpecificationRow[];
          hydratedVariants: HydratedVariant[];
        }>('/api/exams/preview-from-questions', {
          method: 'POST',
          body: JSON.stringify({
            questionIds: nextIds,
            category,
            totalPoints,
            variantCount,
          }),
        });
        setPreviewMatrix(res.matrixRows);
        setPreviewSpec(res.specificationRows);
        setPreviewHydratedVariants(res.hydratedVariants || []);
      } catch {
        // ignore preview error
      }
    } else {
      setPreviewMatrix([]);
      setPreviewSpec([]);
      setPreviewHydratedVariants([]);
    }
  };

  const filteredManualBank = bankQuestions.filter((q) =>
    selectedLessons.length === 0 ? true : selectedLessons.includes(q.lessonId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* SECTION 1: EXAM BUILDER (AUTO MATRIX OR MANUAL) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Soạn Đề Kiểm Tra, Khung Ma Trận & Bản Đặc Tả (Chuẩn Mẫu Trường)
            </h2>
            <p className="text-sm text-slate-600">
              Chọn bài học nào thì Ma trận, Bản đặc tả và Đề kiểm tra (Mã đề 01, 02) xuất ra đúng
              100% nội dung của các bài học đó.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setBuilderMode('auto')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                builderMode === 'auto'
                  ? 'bg-[#0D6E6E] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              Cách 1: Tạo tự động theo Ma trận
            </button>
            <button
              type="button"
              onClick={() => setBuilderMode('manual')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                builderMode === 'manual'
                  ? 'bg-[#0D6E6E] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              Cách 2: Chọn câu hỏi thủ công
            </button>
          </div>
        </div>

        {/* Preset Type Selector (3 loại bài kiểm tra theo mục 6) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Bước 1 — Chọn loại bài kiểm tra:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              [
                {
                  id: 'regular',
                  title: 'a) Kiểm tra thường xuyên',
                  desc: 'Bài ngắn theo bài/cụm bài, trắc nghiệm nhanh, có kết quả ngay.',
                },
                {
                  id: '15min',
                  title: 'b) Kiểm tra 15 phút',
                  desc: 'Đúng 10 câu TN nhiều lựa chọn × 1,0đ = 10đ (4 Biết : 3 Hiểu : 3 Vận dụng).',
                },
                {
                  id: 'midterm',
                  title: 'c) Kiểm tra Giữa kì (90 phút)',
                  desc: '21 lệnh hỏi (12 MCQ + 2 Đ-S + 4 TLN + 3 TL), 70% TN - 30% TL (40:30:30).',
                },
                {
                  id: 'final',
                  title: 'd) Kiểm tra Cuối kì (90 phút)',
                  desc: '21 lệnh hỏi chuẩn cấu trúc (12 MCQ + 2 Đ-S + 4 TLN + 3 TL), thang 10 điểm.',
                },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyCategoryPreset(item.id)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  category === item.id
                    ? 'border-[#0D6E6E] bg-teal-50/70'
                    : 'border-slate-200 hover:border-teal-500 bg-slate-50/40'
                }`}
              >
                <div className="font-bold text-sm text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Exam Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên kỳ kiểm tra (hiển thị trên bản in & phòng thi)
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Thời gian làm bài (phút)
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số mã đề tương đương (≥ 2)
            </label>
            <input
              type="number"
              min={2}
              max={6}
              value={variantCount}
              onChange={(e) => setVariantCount(Math.max(2, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ngưỡng rời tab tự nộp bài
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={maxTabViolations}
              onChange={(e) => setMaxTabViolations(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        {/* STEP 2: LESSON SCOPE SELECTOR (CHỌN BÀI NÀO RA ĐÚNG ĐỀ BÀI ĐÓ) */}
        <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Sliders className="w-4 h-4 text-[#0D6E6E]" />
              <span>
                Bước 2 — Chọn phạm vi Bài học cần kiểm tra (Đang chọn:{' '}
                <span className="text-[#0D6E6E] underline">{selectedLessons.length} bài</span>:{' '}
                {selectedLessons.length > 0
                  ? selectedLessons.map((id) => `Bài ${id}`).join(', ')
                  : 'Chưa chọn bài nào'}
                )
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const scope = [1, 2, 3, 18, 19, 20, 21, 36, 37];
                  setSelectedLessons(scope);
                  generatePreviewForScope(scope, category, countsByType, levelRatios, true, false);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200"
              >
                Mẫu Giữa kì I của trường (Bài 1–3, 18–21, 36–37)
              </button>
              <button
                type="button"
                onClick={() => {
                  const allIds = lessons.map((l) => l.id);
                  setSelectedLessons(allIds);
                  generatePreviewForScope(allIds, category, countsByType, levelRatios, false, false);
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#0D6E6E] border border-teal-200 text-xs font-bold hover:bg-teal-100"
              >
                Chọn cả 51 bài
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLessons([]);
                  setSelectedQuestionIds([]);
                  setPreviewMatrix([]);
                  setPreviewSpec([]);
                  setPreviewHydratedVariants([]);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bỏ chọn hết để chọn lại</span>
              </button>
            </div>
          </div>

          {/* Quick select by Chapter */}
          <div className="flex flex-wrap gap-1.5">
            {chapters.map((chap) => {
              const allChapSelected =
                chap.lessonIds.length > 0 &&
                chap.lessonIds.every((id) => selectedLessons.includes(id));
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => selectChapterLessons(chap.lessonIds)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    allChapSelected
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-teal-600'
                  }`}
                  title={chap.title}
                >
                  {chap.code} (Bài {chap.lessonIds[0]}
                  {chap.lessonIds.length > 1
                    ? `–${chap.lessonIds[chap.lessonIds.length - 1]}`
                    : ''}
                  )
                </button>
              );
            })}
          </div>

          {/* Individual Lesson Selector Pills with full title tooltip */}
          <div className="max-h-44 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
            {lessons.map((les) => {
              const active = selectedLessons.includes(les.id);
              return (
                <button
                  key={les.id}
                  type="button"
                  onClick={() => toggleLessonInScope(les.id)}
                  title={les.title}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-left truncate transition-colors ${
                    active
                      ? 'bg-[#0D6E6E] text-white border-[#0D6E6E] shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50/50'
                  }`}
                >
                  {les.title}
                </button>
              );
            })}
          </div>

          {builderMode === 'auto' ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Số câu Nhiều lựa chọn (I)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={countsByType.mcq}
                    onChange={(e) =>
                      setCountsByType({ ...countsByType, mcq: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Số câu Đúng – Sai (II)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={countsByType.true_false}
                    onChange={(e) =>
                      setCountsByType({ ...countsByType, true_false: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Số câu Trả lời ngắn (III)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={countsByType.short_answer}
                    onChange={(e) =>
                      setCountsByType({ ...countsByType, short_answer: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Số câu Tự luận
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={countsByType.essay}
                    onChange={(e) =>
                      setCountsByType({ ...countsByType, essay: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-sky-700 mb-1">
                    % Mức Biết
                  </label>
                  <input
                    type="number"
                    value={levelRatios.biet}
                    onChange={(e) =>
                      setLevelRatios({ ...levelRatios, biet: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-700 mb-1">
                    % Mức Hiểu
                  </label>
                  <input
                    type="number"
                    value={levelRatios.hieu}
                    onChange={(e) =>
                      setLevelRatios({ ...levelRatios, hieu: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-700 mb-1">
                    % Vận dụng
                  </label>
                  <input
                    type="number"
                    value={levelRatios.van_dung}
                    onChange={(e) =>
                      setLevelRatios({ ...levelRatios, van_dung: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    generatePreviewForScope(
                      selectedLessons,
                      category,
                      countsByType,
                      levelRatios,
                      false,
                      false
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-sm font-bold shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Sinh Đề, Khung Ma trận & Bản đặc tả theo {selectedLessons.length} Bài đã chọn
                  </span>
                </button>

                {(category === 'midterm' || category === 'final') && (
                  <button
                    type="button"
                    onClick={() => {
                      const officialScope = [1, 2, 3, 18, 19, 20, 21, 36, 37];
                      const officialCounts = { mcq: 12, true_false: 2, short_answer: 4, essay: 3 };
                      setSelectedLessons(officialScope);
                      setCountsByType(officialCounts);
                      generatePreviewForScope(
                        officialScope,
                        category,
                        officialCounts,
                        levelRatios,
                        true,
                        false
                      );
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>Khôi phục đúng mẫu Đề Giữa kì I trong file Word (Bài 1–3, 18–21, 36–37)</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Manual Selection Mode */
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Chọn câu hỏi thủ công thuộc các bài đã chọn ({filteredManualBank.length} câu khả
                  dụng — Đã chọn: {selectedQuestionIds.length} câu):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuestionIds([]);
                    setPreviewMatrix([]);
                    setPreviewSpec([]);
                    setPreviewHydratedVariants([]);
                  }}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Bỏ chọn tất cả câu hỏi
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredManualBank.map((q) => {
                  const checked = selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer text-xs ${
                        checked
                          ? 'bg-teal-50 border-[#0D6E6E]'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleManualQuestion(q.id)}
                        className="mt-0.5 w-4 h-4 accent-[#0D6E6E]"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">
                          [{q.type.toUpperCase()} • {q.level.toUpperCase()}
                          {q.indicator ? ` • ${q.indicator}` : ''}]
                        </div>
                        <div className="text-slate-700 mt-0.5">{q.prompt}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Save & Publish Banner */}
        {selectedQuestionIds.length > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  Đã xuất Khung Ma trận ({previewMatrix.length} bài học), Bản đặc tả và{' '}
                  {previewHydratedVariants.length} Mã đề tương đương ({selectedQuestionIds.length}{' '}
                  lệnh hỏi) đúng theo phạm vi bài đã chọn!
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Xem chi tiết bảng Ma trận, Bản đặc tả, Đề kiểm tra và Đáp án ngay bên dưới; bấm{' '}
                <strong>Lưu & Phát hành Đề kiểm tra</strong> để đưa vào Phòng thi cho học sinh.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveExam}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Lưu & Phát hành Đề vào Phòng thi</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: LIVE INLINE MATRIX, SPECIFICATION, EXAM PAPERS & ANSWER KEY */}
      {previewMatrix.length > 0 && previewHydratedVariants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between no-print">
            <h3 className="text-lg font-bold text-[#0D6E6E]">
              Bản xem trực tiếp & In ấn: Khung Ma trận • Bản đặc tả • Đề kiểm tra • Đáp án (Theo đúng bài đã chọn)
            </h3>
          </div>
          <ExamDocumentTablesView
            title={examTitle}
            category={category}
            schoolYear={previewSchoolConfig.schoolYear || '2026 – 2027'}
            durationMinutes={durationMinutes}
            totalPoints={totalPoints}
            schoolConfig={previewSchoolConfig}
            grade={selectedGrade}
            matrixRows={previewMatrix}
            specificationRows={previewSpec}
            hydratedVariants={previewHydratedVariants}
            defaultTab="matrix"
          />
        </div>
      )}

      {/* SECTION 3: SAVED EXAMS LIST */}
      <div className="space-y-4 no-print">
        <h3 className="text-xl font-bold text-slate-900">
          Danh sách Đợt kiểm tra đã lưu & phát hành ({exams.length})
        </h3>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
            Đang tải danh sách đề kiểm tra...
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            Chưa có đề kiểm tra nào. Thầy/cô hãy bấm{' '}
            <strong>Lưu & Phát hành Đề vào Phòng thi</strong> ở trên nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0D6E6E] border border-teal-200 text-xs font-bold">
                      {ex.category === '15min'
                        ? 'Kiểm tra 15 phút'
                        : ex.category === 'midterm'
                        ? 'Kiểm tra Giữa kì (90p)'
                        : ex.category === 'final'
                        ? 'Kiểm tra Cuối kì (90p)'
                        : 'Kiểm tra thường xuyên'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {ex.durationMinutes} phút • {ex.questionIds.length} lệnh hỏi •{' '}
                      {ex.paperVariants?.length || 2} mã đề (
                      {ex.paperVariants?.map((v) => v.paperCode).join(', ')})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                      Phạm vi: {(ex.lessonScope || []).map((id) => `Bài ${id}`).join(', ')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold">
                      Đã nộp: {ex.submissionsCount || 0} bài
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{ex.title}</h4>
                  <p className="text-xs text-slate-500">
                    Lớp áp dụng: {(ex.assignedClasses || []).join(', ')} • Ngưỡng cảnh báo rời tab:{' '}
                    {ex.maxTabViolations} lần
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPrintingExamId(ex.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-xs font-bold shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Xem & In Đề / Ma trận / Đặc tả / Đáp án</span>
                  </button>

                  <button
                    onClick={() => handleToggleExamField(ex, 'allowReview')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border ${
                      ex.allowReview
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                    title="Cho phép học sinh xem điểm, câu đúng/sai và lời giải sau khi nộp"
                  >
                    {ex.allowReview ? (
                      <>
                        <Eye className="w-4 h-4" /> Đã mở xem Đáp án cho HS
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" /> Đang ẩn Đáp án với HS
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleExamField(ex, 'isOpen')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                      ex.isOpen
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {ex.isOpen ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Đang mở thi
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Đã đóng
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteExam(ex.id)}
                    className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    title="Xoá đề"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {printingExamId && (
        <ExamPrintableViewer
          examId={printingExamId}
          onClose={() => setPrintingExamId(null)}
          onNotify={onNotify}
        />
      )}
    </div>
  );
};

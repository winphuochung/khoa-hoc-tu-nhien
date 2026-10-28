import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Copy,
  Trash2,
  Edit3,
  Upload,
  Filter,
  X,
  Save,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import {
  ChapterInfo,
  CognitiveLevel,
  EssayRubricStep,
  LessonItem,
  QuestionItem,
  QuestionType,
  TrueFalseStatement,
} from '../../types/domainTypes';

interface QuestionBankManagerProps {
  chapters: ChapterInfo[];
  lessons: LessonItem[];
  selectedGrade?: number;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'TN nhiều lựa chọn (A,B,C,D)',
  true_false: 'TN Đúng – Sai (4 ý a,b,c,d)',
  short_answer: 'TN Trả lời ngắn',
  essay: 'Tự luận (chia bước 0,25đ)',
};

const LEVEL_LABELS: Record<CognitiveLevel, string> = {
  biet: 'Biết (Nhận biết)',
  hieu: 'Hiểu (Thông hiểu)',
  van_dung: 'Vận dụng',
};

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  chapters,
  lessons,
  selectedGrade = 9,
  onNotify,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [chapterFilter, setChapterFilter] = useState('ALL');
  const [lessonFilter, setLessonFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [indicatorFilter, setIndicatorFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state for Create/Edit
  const [showEditor, setShowEditor] = useState(false);
  const [editingQ, setEditingQ] = useState<QuestionItem | null>(null);

  // Form fields
  const [formLessonId, setFormLessonId] = useState<number>(1);
  const [formType, setFormType] = useState<QuestionType>('mcq');
  const [formLevel, setFormLevel] = useState<CognitiveLevel>('biet');
  const [formIndicator, setFormIndicator] = useState('HH1.1');
  const [formRequirementText, setFormRequirementText] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIdx, setFormCorrectIdx] = useState<number>(0);
  const [formStatements, setFormStatements] = useState<TrueFalseStatement[]>([
    { id: 'a', text: '', isTrue: true },
    { id: 'b', text: '', isTrue: false },
    { id: 'c', text: '', isTrue: true },
    { id: 'd', text: '', isTrue: false },
  ]);
  const [formAcceptedAnswers, setFormAcceptedAnswers] = useState('');
  const [formSampleAnswer, setFormSampleAnswer] = useState('');
  const [formRubricSteps, setFormRubricSteps] = useState<EssayRubricStep[]>([
    { id: 'step-1', description: 'Bước 1', points: 0.25 },
    { id: 'step-2', description: 'Bước 2', points: 0.25 },
    { id: 'step-3', description: 'Bước 3', points: 0.25 },
    { id: 'step-4', description: 'Bước 4', points: 0.25 },
  ]);
  const [formPoints, setFormPoints] = useState<number>(0.25);
  const [formExplanation, setFormExplanation] = useState('');

  // Bulk import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('grade', String(selectedGrade || 9));
      if (chapterFilter !== 'ALL') params.set('chapterId', chapterFilter);
      if (lessonFilter !== 'ALL') params.set('lessonId', lessonFilter);
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (levelFilter !== 'ALL') params.set('level', levelFilter);
      if (indicatorFilter.trim()) params.set('indicator', indicatorFilter.trim());
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const data = await apiRequest<QuestionItem[]>(`/api/questions?${params.toString()}`);
      setQuestions(data);
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi tải ngân hàng câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setChapterFilter('ALL');
    setLessonFilter('ALL');
  }, [selectedGrade]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedGrade, chapterFilter, lessonFilter, typeFilter, levelFilter]);

  const openCreateModal = () => {
    setEditingQ(null);
    const firstLes = lessons[0];
    setFormLessonId(firstLes?.id || 1);
    setFormType('mcq');
    setFormLevel('biet');
    setFormIndicator(
      firstLes?.subject === 'vat_li'
        ? ''
        : firstLes?.subject === 'sinh_hoc'
        ? 'NT1'
        : 'HH1.1'
    );
    setFormRequirementText(firstLes?.objectives?.[0] || '');
    setFormPrompt('');
    setFormOptions(['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D']);
    setFormCorrectIdx(0);
    setFormStatements([
      { id: 'a', text: 'Nhận định a', isTrue: true },
      { id: 'b', text: 'Nhận định b', isTrue: false },
      { id: 'c', text: 'Nhận định c', isTrue: true },
      { id: 'd', text: 'Nhận định d', isTrue: false },
    ]);
    setFormAcceptedAnswers('');
    setFormSampleAnswer('');
    setFormRubricSteps([
      { id: 'step-1', description: 'Viết công thức / PTHH đúng', points: 0.25 },
      { id: 'step-2', description: 'Thay số / Tính số mol đúng', points: 0.25 },
      { id: 'step-3', description: 'Biến đổi trung gian đúng', points: 0.25 },
      { id: 'step-4', description: 'Kết quả cuối cùng và đơn vị chuẩn', points: 0.25 },
    ]);
    setFormPoints(0.25);
    setFormExplanation('');
    setShowEditor(true);
  };

  const openEditModal = (q: QuestionItem) => {
    setEditingQ(q);
    setFormLessonId(q.lessonId);
    setFormType(q.type);
    setFormLevel(q.level);
    setFormIndicator(q.indicator || '');
    setFormRequirementText(q.requirementText || '');
    setFormPrompt(q.prompt);
    setFormOptions(q.options || ['', '', '', '']);
    setFormCorrectIdx(q.correctOptionIndex ?? 0);
    setFormStatements(
      q.statements || [
        { id: 'a', text: '', isTrue: true },
        { id: 'b', text: '', isTrue: false },
        { id: 'c', text: '', isTrue: true },
        { id: 'd', text: '', isTrue: false },
      ]
    );
    setFormAcceptedAnswers((q.acceptedAnswers || []).join(', '));
    setFormSampleAnswer(q.sampleAnswer || '');
    setFormRubricSteps(
      q.rubricSteps || [
        { id: 'step-1', description: 'Bước 1', points: 0.25 },
        { id: 'step-2', description: 'Bước 2', points: 0.25 },
        { id: 'step-3', description: 'Bước 3', points: 0.25 },
        { id: 'step-4', description: 'Bước 4', points: 0.25 },
      ]
    );
    setFormPoints(q.points);
    setFormExplanation(q.explanation || '');
    setShowEditor(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const les = lessons.find((l) => l.id === Number(formLessonId));
    const payload: Partial<QuestionItem> = {
      chapterId: les?.chapterId || 'ch-01',
      lessonId: Number(formLessonId),
      type: formType,
      level: formLevel,
      indicator: les?.subject === 'vat_li' ? '' : formIndicator.trim(),
      requirementText: formRequirementText.trim(),
      prompt: formPrompt.trim(),
      points: Number(formPoints),
      explanation: formExplanation.trim(),
    };

    if (formType === 'mcq') {
      payload.options = formOptions.map((o) => o.trim());
      payload.correctOptionIndex = Number(formCorrectIdx);
    } else if (formType === 'true_false') {
      payload.statements = formStatements;
    } else if (formType === 'short_answer') {
      payload.acceptedAnswers = formAcceptedAnswers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (formType === 'essay') {
      payload.sampleAnswer = formSampleAnswer.trim();
      payload.rubricSteps = formRubricSteps;
    }

    try {
      if (editingQ) {
        const updated = await apiRequest<QuestionItem>(`/api/questions/${editingQ.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setQuestions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        onNotify('success', 'Đã cập nhật câu hỏi thành công.');
      } else {
        const created = await apiRequest<QuestionItem>('/api/questions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setQuestions((prev) => [created, ...prev]);
        onNotify('success', 'Đã thêm câu hỏi mới vào ngân hàng đề.');
      }
      setShowEditor(false);
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi khi lưu câu hỏi.');
    }
  };

  const handleDuplicate = async (qId: string) => {
    try {
      const copy = await apiRequest<QuestionItem>(`/api/questions/${qId}/duplicate`, {
        method: 'POST',
      });
      setQuestions((prev) => [copy, ...prev]);
      onNotify('success', 'Đã nhân bản câu hỏi thành công.');
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể nhân bản câu hỏi.');
    }
  };

  const handleDelete = async (qId: string) => {
    try {
      await apiRequest(`/api/questions/${qId}`, { method: 'DELETE' });
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
      onNotify('success', 'Đã xoá câu hỏi khỏi ngân hàng đề.');
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể xoá câu hỏi.');
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    try {
      // Hỗ trợ định dạng dòng: Bài | Mức độ (biet/hieu/van_dung) | Chỉ báo | Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (A/B/C/D) | Giải thích
      const lines = bulkText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const items = lines.map((line) => {
        const parts = line.split('|').map((p) => p.trim());
        const lessonNum = Number(parts[0]) || 1;
        const levelRaw = (parts[1] || 'biet').toLowerCase();
        const level: CognitiveLevel =
          levelRaw.includes('van') || levelRaw === 'vd'
            ? 'van_dung'
            : levelRaw.includes('hieu') || levelRaw === 'h'
            ? 'hieu'
            : 'biet';
        const indicator = parts[2] || 'NT1';
        const prompt = parts[3] || line;
        const optA = parts[4] || 'Phương án A';
        const optB = parts[5] || 'Phương án B';
        const optC = parts[6] || 'Phương án C';
        const optD = parts[7] || 'Phương án D';
        const correctLetter = (parts[8] || 'A').toUpperCase();
        const correctIdx = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
        const explanation = parts[9] || 'Theo nội dung SGK KHTN 9.';

        return {
          lessonId: lessonNum,
          type: 'mcq',
          level,
          indicator,
          prompt,
          options: [optA, optB, optC, optD],
          correctOptionIndex: correctIdx >= 0 ? correctIdx : 0,
          points: 0.25,
          explanation,
        };
      });

      const added = await apiRequest<QuestionItem[]>('/api/questions/bulk', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      setQuestions((prev) => [...added, ...prev]);
      setShowBulkModal(false);
      setBulkText('');
      onNotify('success', `Đã nhập hàng loạt ${added.length} câu hỏi vào ngân hàng đề!`);
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi nhập hàng loạt.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Ngân hàng câu hỏi của Giáo viên ({questions.length} câu hỏi)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Phủ kín 14 chương, 51 bài SGK KHTN 9 (đầy đủ 4 loại câu hỏi: Nhiều lựa chọn, Đúng–Sai,
            Trả lời ngắn, Tự luận chia bước 0,25đ).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-700 text-[#0D6E6E] hover:bg-teal-50 text-sm font-bold"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập hàng loạt</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-[#0D6E6E]" />
          <span>Bộ lọc ngân hàng đề theo Chương, Bài, Loại câu, Mức độ, Chỉ báo:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <select
            value={chapterFilter}
            onChange={(e) => {
              setChapterFilter(e.target.value);
              setLessonFilter('ALL');
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
          >
            <option value="ALL">Tất cả 14 Chương (+Mở đầu)</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={lessonFilter}
            onChange={(e) => setLessonFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
          >
            <option value="ALL">Tất cả 51 Bài học</option>
            {lessons
              .filter((l) => (chapterFilter === 'ALL' ? true : l.chapterId === chapterFilter))
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
          >
            <option value="ALL">Tất cả loại câu hỏi</option>
            <option value="mcq">TN nhiều lựa chọn</option>
            <option value="true_false">TN Đúng – Sai (4 ý)</option>
            <option value="short_answer">TN Trả lời ngắn</option>
            <option value="essay">Tự luận</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
          >
            <option value="ALL">Tất cả mức độ</option>
            <option value="biet">Mức độ: Biết</option>
            <option value="hieu">Mức độ: Hiểu</option>
            <option value="van_dung">Mức độ: Vận dụng</option>
          </select>

          <input
            type="text"
            value={indicatorFilter}
            onChange={(e) => setIndicatorFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
            placeholder="Chỉ báo (VD: HH1.1, NT1)"
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
          />

          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
                placeholder="Từ khoá..."
                className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <button
              onClick={fetchQuestions}
              className="px-3 py-2 rounded-xl bg-[#0D6E6E] text-white text-xs font-bold"
            >
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Question Cards List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          Đang tải danh sách câu hỏi...
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => {
            const lessonObj = lessons.find((l) => l.id === q.lessonId);
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold">
                      #{index + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#0D6E6E] border border-teal-200 text-xs font-bold">
                      Chủ đề: {lessonObj?.title.replace(/^Bài\s*\d+\s*[:.-]\s*/i, '')}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                      {TYPE_LABELS[q.type]}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                      {LEVEL_LABELS[q.level]}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                      {q.indicator ? `Chỉ báo: ${q.indicator} • ` : ''}
                      {q.points} điểm
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(q)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      onClick={() => handleDuplicate(q.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5" /> Nhân bản
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xoá
                    </button>
                  </div>
                </div>

                {q.requirementText && (
                  <div className="text-xs text-slate-500 italic">
                    Yêu cầu cần đạt: {q.requirementText}
                  </div>
                )}

                <p className="text-sm sm:text-base font-bold text-slate-900 whitespace-pre-line">
                  {q.prompt}
                </p>

                {q.type === 'mcq' && Array.isArray(q.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border ${
                          q.correctOptionIndex === idx
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <strong>{['A', 'B', 'C', 'D'][idx]}.</strong> {opt}
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'true_false' && Array.isArray(q.statements) && (
                  <div className="space-y-1.5 text-xs">
                    {q.statements.map((st) => (
                      <div
                        key={st.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <span>
                          <strong>{st.id})</strong> {st.text}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            st.isTrue
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {st.isTrue ? 'Đúng' : 'Sai'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div className="text-xs bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-emerald-950">
                    <strong>Đáp án chấp nhận:</strong> {(q.acceptedAnswers || []).join(' | ')}
                  </div>
                )}

                {q.type === 'essay' && Array.isArray(q.rubricSteps) && (
                  <div className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                    <div className="font-bold text-amber-950">
                      Hướng dẫn chấm tự luận (chia nhỏ theo bước 0,25 điểm):
                    </div>
                    {q.rubricSteps.map((st, sIdx) => (
                      <div key={st.id} className="text-slate-800">
                        • Bước {sIdx + 1} ({st.points} điểm): {st.description}
                      </div>
                    ))}
                  </div>
                )}

                {q.explanation && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <strong>Giải thích / Hướng dẫn:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Question Create/Edit Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#0D6E6E] text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingQ ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới vào Ngân hàng đề'}
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="p-1 rounded-lg hover:bg-white/15"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thuộc Bài học (Bài 1 → Bài 51)
                  </label>
                  <select
                    value={formLessonId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setFormLessonId(id);
                      const les = lessons.find((l) => l.id === id);
                      if (les?.objectives?.[0]) setFormRequirementText(les.objectives[0]);
                      if (les?.subject === 'vat_li') {
                        setFormIndicator('');
                      } else if (les?.subject === 'sinh_hoc') {
                        setFormIndicator(
                          formLevel === 'biet' ? 'NT1' : formLevel === 'hieu' ? 'NT6' : 'VD1'
                        );
                      } else {
                        setFormIndicator(
                          formLevel === 'biet' ? 'HH1.1' : formLevel === 'hieu' ? 'HH1.3' : 'HH1.5'
                        );
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loại câu hỏi
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as QuestionType;
                      setFormType(t);
                      setFormPoints(t === 'mcq' ? 0.25 : t === 'short_answer' ? 0.5 : 1.0);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="mcq">TN nhiều lựa chọn (0,25đ)</option>
                    <option value="true_false">TN Đúng – Sai 4 ý (1,0đ)</option>
                    <option value="short_answer">TN Trả lời ngắn (0,5đ)</option>
                    <option value="essay">Tự luận (1,0đ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mức độ nhận thức
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as CognitiveLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="biet">Biết (Nhận biết)</option>
                    <option value="hieu">Hiểu (Thông hiểu)</option>
                    <option value="van_dung">Vận dụng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã chỉ báo YCCĐ (Hoá / Sinh; Lí để trống)
                  </label>
                  {lessons.find((l) => l.id === Number(formLessonId))?.subject === 'vat_li' ? (
                    <input
                      type="text"
                      value=""
                      disabled
                      placeholder="Môn Vật lí không để chỉ báo"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs"
                    />
                  ) : (
                    <>
                      <input
                        type="text"
                        list="khtn9-indicators-list"
                        value={formIndicator}
                        onChange={(e) => setFormIndicator(e.target.value)}
                        placeholder="VD: HH1.1, HH1.3, HH1.5 hoặc NT1, NT6, VD1"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                      <datalist id="khtn9-indicators-list">
                        <option value="HH1.1">HH1.1 (Biết - Nhận biết, nêu tên sự vật, hiện tượng, khái niệm)</option>
                        <option value="HH1.2">HH1.2 (Biết - Trình bày đặc điểm, vai trò, công thức, PTHH)</option>
                        <option value="HH1.3">HH1.3 (Hiểu - So sánh, phân loại, lựa chọn)</option>
                        <option value="HH1.4">HH1.4 (Hiểu - Phân tích đặc điểm theo logic)</option>
                        <option value="HH1.5">HH1.5 (Vận dụng - Sử dụng thuật ngữ, tính toán theo logic)</option>
                        <option value="HH1.6">HH1.6 (Hiểu - Giải thích mối quan hệ nguyên nhân - kết quả)</option>
                        <option value="HH1.7">HH1.7 (Vận dụng - Nhận ra điểm sai và chỉnh sửa, phản biện)</option>
                        <option value="HH2.1">HH2.1 (Hiểu/VD - Đề xuất vấn đề tìm hiểu tự nhiên)</option>
                        <option value="HH2.2">HH2.2 (Hiểu/VD - Đưa ra phán đoán và xây dựng giả thuyết)</option>
                        <option value="HH2.3">HH2.3 (Vận dụng - Lập kế hoạch thực hiện tìm hiểu)</option>
                        <option value="HH2.4">HH2.4 (Vận dụng - Thực hiện kế hoạch, thu thập xử lí dữ liệu)</option>
                        <option value="HH2.5">HH2.5 (Vận dụng - Viết, trình bày báo cáo và thảo luận)</option>
                        <option value="HH3.1">HH3.1 (Hiểu - Nhận ra, giải thích vấn đề thực tiễn)</option>
                        <option value="HH3.2">HH3.2 (Vận dụng - Giải pháp bảo vệ tự nhiên, phát triển bền vững)</option>
                        <option value="NT1">NT1 (Biết - Nhận biết, kể tên, phát biểu, nêu được đối tượng, quy luật sống)</option>
                        <option value="NT2">NT2 (Biết - Trình bày đặc điểm, vai trò bằng ngôn ngữ, công thức, sơ đồ)</option>
                        <option value="NT3">NT3 (Hiểu - Phân loại đối tượng, hiện tượng sống)</option>
                        <option value="NT4">NT4 (Hiểu - Phân tích đặc điểm đối tượng, quá trình theo logic)</option>
                        <option value="NT5">NT5 (Hiểu - So sánh, lựa chọn đối tượng, cơ chế, quá trình sống)</option>
                        <option value="NT6">NT6 (Hiểu - Giải thích mối quan hệ nguyên nhân - kết quả, cấu tạo - chức năng)</option>
                        <option value="NT7">NT7 (Vận dụng - Nhận ra và chỉnh sửa điểm sai, phản biện)</option>
                        <option value="NT8">NT8 (Vận dụng - Tìm từ khoá, kết nối thông tin khoa học có ý nghĩa)</option>
                        <option value="TH1">TH1 (Hiểu - Đề xuất vấn đề liên quan tới thế giới sống)</option>
                        <option value="TH2">TH2 (Hiểu - Đưa ra phán đoán và xây dựng giả thuyết nghiên cứu)</option>
                        <option value="TH3">TH3 (Vận dụng - Lập kế hoạch thực hiện / Thiết kế nghiên cứu)</option>
                        <option value="TH4">TH4 (Vận dụng - Thực hiện kế hoạch, thu thập và xử lí dữ liệu)</option>
                        <option value="TH5">TH5 (Vận dụng - Viết, trình bày báo cáo và tham luận)</option>
                        <option value="VD1">VD1 (Hiểu/VD - Giải thích, đánh giá hiện tượng thực tiễn, mô hình công nghệ)</option>
                        <option value="VD2">VD2 (Hiểu/VD - Giải pháp bảo vệ sức khoẻ, môi trường, phát triển bền vững)</option>
                      </datalist>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thang điểm câu hỏi
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả Yêu cầu cần đạt (hiển thị trong Bản đặc tả đề kiểm tra)
                </label>
                <input
                  type="text"
                  value={formRequirementText}
                  onChange={(e) => setFormRequirementText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi (Đề bài)
                </label>
                <textarea
                  rows={3}
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              {/* Type-specific fields */}
              {formType === 'mcq' && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">
                    4 Phương án lựa chọn (tích chọn đáp án ĐÚNG):
                  </label>
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctMcq"
                        checked={formCorrectIdx === idx}
                        onChange={() => setFormCorrectIdx(idx)}
                        className="w-4 h-4 accent-[#0D6E6E]"
                      />
                      <span className="text-xs font-bold w-6">{['A', 'B', 'C', 'D'][idx]}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...formOptions];
                          next[idx] = e.target.value;
                          setFormOptions(next);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              {formType === 'true_false' && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">
                    4 Lệnh hỏi a, b, c, d (Đúng 1 ý: 0,1đ; 2 ý: 0,25đ; 3 ý: 0,5đ; 4 ý: 1,0đ):
                  </label>
                  {formStatements.map((st, idx) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6">{st.id})</span>
                      <input
                        type="text"
                        value={st.text}
                        onChange={(e) => {
                          const next = [...formStatements];
                          next[idx] = { ...next[idx], text: e.target.value };
                          setFormStatements(next);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        required
                      />
                      <select
                        value={st.isTrue ? 'true' : 'false'}
                        onChange={(e) => {
                          const next = [...formStatements];
                          next[idx] = { ...next[idx], isTrue: e.target.value === 'true' };
                          setFormStatements(next);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                      >
                        <option value="true">Đúng</option>
                        <option value="false">Sai</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {formType === 'short_answer' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Các phương án trả lời ngắn được chấp nhận (ngăn cách bởi dấu phẩy):
                  </label>
                  <input
                    type="text"
                    value={formAcceptedAnswers}
                    onChange={(e) => setFormAcceptedAnswers(e.target.value)}
                    placeholder="VD: Hydrogen, Khí hydrogen, H2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    required
                  />
                </div>
              )}

              {formType === 'essay' && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Lời giải mẫu tự luận:
                    </label>
                    <textarea
                      rows={2}
                      value={formSampleAnswer}
                      onChange={(e) => setFormSampleAnswer(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Các bước chấm tự luận (chia nhỏ theo bước 0,25 điểm):
                    </label>
                    {formRubricSteps.map((step, sIdx) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className="text-xs font-bold w-16">Bước {sIdx + 1}:</span>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) => {
                            const next = [...formRubricSteps];
                            next[sIdx] = { ...next[sIdx], description: e.target.value };
                            setFormRubricSteps(next);
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <input
                          type="number"
                          step="0.25"
                          value={step.points}
                          onChange={(e) => {
                            const next = [...formRubricSteps];
                            next[sIdx] = { ...next[sIdx], points: Number(e.target.value) };
                            setFormRubricSteps(next);
                          }}
                          className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giải thích chi tiết đáp án
                </label>
                <input
                  type="text"
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0D6E6E] text-white text-xs font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu vào Ngân hàng đề</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Nhập hàng loạt câu hỏi từ danh sách
              </h3>
              <button onClick={() => setShowBulkModal(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mỗi dòng 1 câu hỏi theo cú pháp ngăn cách bằng dấu <code>|</code>:<br />
              <code>
                Số bài (1-51) | Mức độ (biet/hieu/van_dung) | Chỉ báo | Nội dung câu hỏi | Đáp án A
                | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (A/B/C/D) | Giải thích
              </code>
            </p>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="11 | biet | VL1.1 | Đơn vị của điện trở là gì? | Ohm (Ω) | Volt (V) | Ampere (A) | Watt (W) | A | Đơn vị điện trở là Ohm."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D6E6E] text-white text-xs font-bold"
                >
                  Nhập vào ngân hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

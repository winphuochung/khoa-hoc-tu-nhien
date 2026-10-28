import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { ChapterInfo, LessonItem } from '../../types/domainTypes';

interface LessonEditorModalProps {
  lesson: LessonItem | null; // null if creating new lesson
  chapters: ChapterInfo[];
  availableClasses: string[];
  onClose: () => void;
  onSave: (data: Partial<LessonItem>, isNew: boolean) => Promise<void>;
}

export const LessonEditorModal: React.FC<LessonEditorModalProps> = ({
  lesson,
  chapters,
  availableClasses,
  onClose,
  onSave,
}) => {
  const isNew = !lesson;

  const [chapterId, setChapterId] = useState(lesson?.chapterId || chapters[0]?.id || 'ch-01');
  const [title, setTitle] = useState(lesson?.title || '');
  const [periods, setPeriods] = useState(lesson?.periods || 2);
  const [objectivesText, setObjectivesText] = useState(
    (lesson?.objectives || []).join('\n')
  );
  const [coreConceptsText, setCoreConceptsText] = useState(
    (lesson?.coreConcepts || []).join('\n')
  );
  const [formulas, setFormulas] = useState(
    lesson?.formulasAndLaws || [{ name: '', formula: '', units: '', description: '' }]
  );
  const [examples, setExamples] = useState(
    lesson?.examples || [{ problem: '', solution: '' }]
  );
  const [commonMistakesText, setCommonMistakesText] = useState(
    (lesson?.commonMistakes || []).join('\n')
  );
  const [quickSummaryText, setQuickSummaryText] = useState(
    (lesson?.quickSummary || []).join('\n')
  );
  const [reviewNote, setReviewNote] = useState(lesson?.reviewNote || '');
  const [isHidden, setIsHidden] = useState(lesson?.isHidden || false);
  const [visibleToClasses, setVisibleToClasses] = useState<string[]>(
    lesson?.visibleToClasses || ['ALL']
  );
  const [saving, setSaving] = useState(false);

  const toggleClassVisibility = (cls: string) => {
    if (cls === 'ALL') {
      setVisibleToClasses(['ALL']);
      return;
    }
    const withoutAll = visibleToClasses.filter((c) => c !== 'ALL');
    if (withoutAll.includes(cls)) {
      const next = withoutAll.filter((c) => c !== cls);
      setVisibleToClasses(next.length > 0 ? next : ['ALL']);
    } else {
      setVisibleToClasses([...withoutAll, cls]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const chap = chapters.find((c) => c.id === chapterId);
      await onSave(
        {
          chapterId,
          subject: chap?.subject || 'vat_li',
          title: title.trim(),
          periods: Number(periods || 2),
          objectives: objectivesText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          coreConcepts: coreConceptsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          formulasAndLaws: formulas.filter((f) => f.name.trim() || f.formula.trim()),
          examples: examples.filter((ex) => ex.problem.trim() || ex.solution.trim()),
          commonMistakes: commonMistakesText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          quickSummary: quickSummaryText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          reviewNote: reviewNote.trim() || undefined,
          isHidden,
          visibleToClasses,
        },
        isNew
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-[#0D6E6E] text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {isNew ? 'Thêm bài học mới' : `Chỉnh sửa nội dung — ${lesson?.title}`}
            </h3>
            <p className="text-xs text-teal-100">
              Giáo viên cập nhật kiến thức, công thức, ẩn/hiện bài và phân quyền lớp được xem.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/15 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Thuộc Chương</label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              >
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài học</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Số tiết</label>
              <input
                type="number"
                min={1}
                max={10}
                value={periods}
                onChange={(e) => setPeriods(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* Visibility & Class Scope */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span className="text-sm font-bold text-slate-800">
                Ẩn bài học này đối với học sinh
              </span>
            </label>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Lớp được phép xem:</span>
              <button
                type="button"
                onClick={() => toggleClassVisibility('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  visibleToClasses.includes('ALL')
                    ? 'bg-[#0D6E6E] text-white border-[#0D6E6E]'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Tất cả các lớp
              </button>
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggleClassVisibility(cls)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    !visibleToClasses.includes('ALL') && visibleToClasses.includes(cls)
                      ? 'bg-[#0D6E6E] text-white border-[#0D6E6E]'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Lớp {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Mục tiêu bài học (mỗi dòng 1 ý)
              </label>
              <textarea
                rows={3}
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Khái niệm trọng tâm (mỗi dòng 1 ý)
              </label>
              <textarea
                rows={3}
                value={coreConceptsText}
                onChange={(e) => setCoreConceptsText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* 3. Formulas and Laws */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                3. Công thức và quy luật chính (viết đúng ký hiệu chuẩn)
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormulas([
                    ...formulas,
                    { name: '', formula: '', units: '', description: '' },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0D6E6E] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm công thức
              </button>
            </div>
            {formulas.map((f, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <input
                  type="text"
                  placeholder="Tên công thức/quy luật"
                  value={f.name}
                  onChange={(e) => {
                    const next = [...formulas];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setFormulas(next);
                  }}
                  className="sm:col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Biểu thức (VD: Wđ = ½mv²)"
                  value={f.formula}
                  onChange={(e) => {
                    const next = [...formulas];
                    next[idx] = { ...next[idx], formula: e.target.value };
                    setFormulas(next);
                  }}
                  className="sm:col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Đơn vị"
                  value={f.units}
                  onChange={(e) => {
                    const next = [...formulas];
                    next[idx] = { ...next[idx], units: e.target.value };
                    setFormulas(next);
                  }}
                  className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Giải thích"
                  value={f.description}
                  onChange={(e) => {
                    const next = [...formulas];
                    next[idx] = { ...next[idx], description: e.target.value };
                    setFormulas(next);
                  }}
                  className="sm:col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setFormulas(formulas.filter((_, i) => i !== idx))}
                  className="sm:col-span-1 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* 4. Examples */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">4. Ví dụ minh hoạ ngắn</label>
              <button
                type="button"
                onClick={() => setExamples([...examples, { problem: '', solution: '' }])}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0D6E6E] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm ví dụ
              </button>
            </div>
            {examples.map((ex, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <input
                  type="text"
                  placeholder="Đề bài tình huống/ví dụ"
                  value={ex.problem}
                  onChange={(e) => {
                    const next = [...examples];
                    next[idx] = { ...next[idx], problem: e.target.value };
                    setExamples(next);
                  }}
                  className="sm:col-span-5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Lời giải ngắn gọn"
                  value={ex.solution}
                  onChange={(e) => {
                    const next = [...examples];
                    next[idx] = { ...next[idx], solution: e.target.value };
                    setExamples(next);
                  }}
                  className="sm:col-span-6 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setExamples(examples.filter((_, i) => i !== idx))}
                  className="sm:col-span-1 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. Lỗi sai học sinh thường gặp (mỗi dòng 1 ý)
              </label>
              <textarea
                rows={3}
                value={commonMistakesText}
                onChange={(e) => setCommonMistakesText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                6. Phần ghi nhớ nhanh (mỗi dòng 1 ý)
              </label>
              <textarea
                rows={3}
                value={quickSummaryText}
                onChange={(e) => setQuickSummaryText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú thẩm định / Cần giáo viên duyệt (nếu có thông số thực hành mở rộng)
            </label>
            <input
              type="text"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Ghi rõ 'Cần giáo viên duyệt' ở chỗ chưa chắc chắn hoặc tuỳ điều kiện phòng thí nghiệm..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-sm font-bold shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu bài học'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

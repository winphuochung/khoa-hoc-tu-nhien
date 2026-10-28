import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  Filter,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import {
  CognitiveLevel,
  LessonProgressRecord,
  QuestionItem,
} from '../../types/domainTypes';

interface LessonPracticeSectionProps {
  lessonId: number;
  lessonTitle: string;
  onJumpToKnowledgeSection: (
    sectionKey: 'coreConcepts' | 'formulasAndLaws' | 'examples' | 'commonMistakes' | 'quickSummary'
  ) => void;
  onProgressUpdated: (updatedMap: Record<number, LessonProgressRecord>) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

const LEVEL_LABELS: Record<CognitiveLevel, { label: string; badge: string }> = {
  biet: {
    label: 'Mức độ: Biết (Nhận biết)',
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  hieu: {
    label: 'Mức độ: Hiểu (Thông hiểu)',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  van_dung: {
    label: 'Mức độ: Vận dụng',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
  },
};

const SECTION_LABELS: Record<string, string> = {
  coreConcepts: 'Mục II: Khái niệm trọng tâm',
  formulasAndLaws: 'Mục III: Công thức & Quy luật chính',
  examples: 'Mục IV: Ví dụ minh hoạ ngắn',
  commonMistakes: 'Mục V: Lỗi sai thường gặp',
  quickSummary: 'Mục VI: Ghi nhớ nhanh',
};

export const LessonPracticeSection: React.FC<LessonPracticeSectionProps> = ({
  lessonId,
  lessonTitle,
  onJumpToKnowledgeSection,
  onProgressUpdated,
  onNotify,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState<'ALL' | CognitiveLevel>('ALL');

  // Student answers state per questionId
  const [mcqChoice, setMcqChoice] = useState<Record<string, number>>({});
  const [tfChoice, setTfChoice] = useState<Record<string, Record<string, boolean>>>({});
  const [shortInput, setShortInput] = useState<Record<string, string>>({});
  const [checkedMap, setCheckedMap] = useState<
    Record<string, { isCorrect: boolean; scoreText: string }>
  >({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setMcqChoice({});
    setTfChoice({});
    setShortInput({});
    setCheckedMap({});

    apiRequest<QuestionItem[]>(`/api/lessons/${lessonId}/practice`)
      .then((data) => {
        if (mounted) setQuestions(data);
      })
      .catch((err) => {
        if (mounted) onNotify('error', err.message || 'Không tải được bài tập.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [lessonId]);

  const filteredQuestions = questions.filter((q) =>
    levelFilter === 'ALL' ? true : q.level === levelFilter
  );

  const checkSingleQuestion = async (q: QuestionItem) => {
    let isCorrect = false;
    let scoreText = '';

    if (q.type === 'mcq') {
      const chosen = mcqChoice[q.id];
      if (chosen === undefined) {
        onNotify('info', 'Em hãy chọn một đáp án A, B, C hoặc D trước khi kiểm tra nhé!');
        return;
      }
      isCorrect = chosen === q.correctOptionIndex;
      scoreText = isCorrect ? 'Chính xác!' : 'Chưa đúng';
    } else if (q.type === 'true_false') {
      const ans = tfChoice[q.id] || {};
      const statements = q.statements || [];
      let rightCount = 0;
      for (const st of statements) {
        if (typeof ans[st.id] === 'boolean' && ans[st.id] === st.isTrue) {
          rightCount += 1;
        }
      }
      isCorrect = rightCount === statements.length;
      const pts =
        rightCount === 4 ? 1.0 : rightCount === 3 ? 0.5 : rightCount === 2 ? 0.25 : rightCount === 1 ? 0.1 : 0;
      scoreText = `Đúng ${rightCount}/4 ý (${pts} điểm)`;
    } else if (q.type === 'short_answer') {
      const val = (shortInput[q.id] || '').trim().toLowerCase();
      if (!val) {
        onNotify('info', 'Em hãy nhập câu trả lời ngắn trước khi kiểm tra nhé!');
        return;
      }
      const accepted = (q.acceptedAnswers || []).map((a) => a.trim().toLowerCase());
      isCorrect = accepted.includes(val);
      scoreText = isCorrect ? 'Khớp đáp án!' : 'Chưa khớp đáp án chuẩn';
    } else if (q.type === 'essay') {
      const val = (shortInput[q.id] || '').trim();
      if (!val) {
        onNotify('info', 'Em hãy viết lời giải tự luận vào ô bên dưới trước khi đối chiếu hướng dẫn chấm nhé!');
        return;
      }
      isCorrect = true;
      scoreText = 'Đã mở hướng dẫn chấm tự luận (chia theo bước 0,25đ)';
    }

    const nextChecked = {
      ...checkedMap,
      [q.id]: { isCorrect, scoreText },
    };
    setCheckedMap(nextChecked);

    // Sync progress to server
    const totalAttempted = Object.keys(nextChecked).length;
    const correctCount = Object.values(nextChecked).filter((c) => c.isCorrect).length;

    try {
      const updatedProgress = await apiRequest<Record<number, LessonProgressRecord>>(
        `/api/lessons/${lessonId}/progress`,
        {
          method: 'POST',
          body: JSON.stringify({
            studied: true,
            replaceAttempted: totalAttempted,
            replaceCorrect: correctCount,
          }),
        }
      );
      onProgressUpdated(updatedProgress);
    } catch {
      // ignore background error
    }
  };

  const resetPractice = () => {
    setMcqChoice({});
    setTfChoice({});
    setShortInput({});
    setCheckedMap({});
  };

  const totalChecked = Object.keys(checkedMap).length;
  const totalCorrect = Object.values(checkedMap).filter((v) => v.isCorrect).length;

  return (
    <section
      id="lesson-practice-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D6E6E] bg-teal-50 px-3 py-1 rounded-full mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bộ bài tập luyện tập theo 3 mức độ</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Luyện tập củng cố — {lessonTitle}
          </h3>
          <p className="text-sm text-slate-600">
            Làm xong mỗi câu bấm <strong>Kiểm tra đáp án</strong> để xem ngay đúng/sai, lời giải
            ngắn gọn và gợi ý quay lại mục kiến thức tương ứng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {totalChecked > 0 && (
            <div className="bg-teal-50 border border-teal-200 px-3.5 py-2 rounded-xl text-sm font-bold text-teal-900">
              Đã làm: {totalChecked}/{questions.length} câu • Đúng: {totalCorrect}/{totalChecked} (
              {Math.round((totalCorrect / totalChecked) * 100)}%)
            </div>
          )}
          <button
            onClick={resetPractice}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
        </div>
      </div>

      {/* Filter by Cognitive Level: Biết / Hiểu / Vận dụng */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Chọn mức độ:
        </span>
        {(
          [
            { id: 'ALL', label: `Tất cả (${questions.length})` },
            {
              id: 'biet',
              label: `Biết (${questions.filter((q) => q.level === 'biet').length})`,
            },
            {
              id: 'hieu',
              label: `Hiểu (${questions.filter((q) => q.level === 'hieu').length})`,
            },
            {
              id: 'van_dung',
              label: `Vận dụng (${questions.filter((q) => q.level === 'van_dung').length})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setLevelFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              levelFilter === tab.id
                ? 'bg-[#0D6E6E] text-white border-[#0D6E6E]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Đang tải bộ câu hỏi luyện tập của bài học...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Không có câu hỏi ở mức độ đang lọc.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredQuestions.map((q, idx) => {
            const checked = checkedMap[q.id];
            const lvlMeta = LEVEL_LABELS[q.level];

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0D6E6E] text-white text-xs font-bold">
                      Câu {idx + 1}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${lvlMeta.badge}`}
                    >
                      {lvlMeta.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600">
                      Chỉ báo: {q.indicator}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {q.type === 'mcq'
                      ? 'Trắc nghiệm 4 lựa chọn'
                      : q.type === 'true_false'
                      ? 'Trắc nghiệm Đúng – Sai (4 ý)'
                      : q.type === 'short_answer'
                      ? 'Trả lời ngắn'
                      : 'Tự luận'}
                  </span>
                </div>

                <p className="text-base font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                  {q.prompt}
                </p>

                {/* MCQ Input */}
                {q.type === 'mcq' && Array.isArray(q.options) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = mcqChoice[q.id] === optIdx;
                      const isCorrectOption = q.correctOptionIndex === optIdx;
                      let cardStyle =
                        'bg-white border-slate-200 text-slate-800 hover:border-teal-600';
                      if (checked) {
                        if (isCorrectOption) {
                          cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                        } else if (isSelected && !isCorrectOption) {
                          cardStyle = 'bg-red-50 border-red-500 text-red-900';
                        }
                      } else if (isSelected) {
                        cardStyle = 'bg-teal-50 border-[#0D6E6E] text-[#0D6E6E] font-semibold ring-1 ring-[#0D6E6E]';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setMcqChoice((prev) => ({
                              ...prev,
                              [q.id]: optIdx,
                            }))
                          }
                          className={`text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${cardStyle}`}
                        >
                          <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {['A', 'B', 'C', 'D'][optIdx]}
                          </span>
                          <span className="text-sm leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* True / False Input */}
                {q.type === 'true_false' && Array.isArray(q.statements) && (
                  <div className="space-y-2.5">
                    {q.statements.map((st) => {
                      const curVal = tfChoice[q.id]?.[st.id];
                      return (
                        <div
                          key={st.id}
                          className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="text-sm text-slate-800">
                            <strong className="text-[#0D6E6E] mr-1.5">{st.id})</strong>
                            {st.text}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setTfChoice((prev) => ({
                                  ...prev,
                                  [q.id]: { ...(prev[q.id] || {}), [st.id]: true },
                                }))
                              }
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border ${
                                curVal === true
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-50 text-slate-700 border-slate-300'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setTfChoice((prev) => ({
                                  ...prev,
                                  [q.id]: { ...(prev[q.id] || {}), [st.id]: false },
                                }))
                              }
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border ${
                                curVal === false
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-slate-50 text-slate-700 border-slate-300'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer or Essay Input */}
                {(q.type === 'short_answer' || q.type === 'essay') && (
                  <div>
                    {q.type === 'short_answer' ? (
                      <input
                        type="text"
                        value={shortInput[q.id] || ''}
                        onChange={(e) =>
                          setShortInput((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Nhập câu trả lời ngắn của em..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    ) : (
                      <textarea
                        rows={3}
                        value={shortInput[q.id] || ''}
                        onChange={(e) =>
                          setShortInput((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Trình bày tóm tắt, công thức và các bước giải tự luận của em..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    )}
                  </div>
                )}

                {/* Action Bar & Immediate Feedback */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => checkSingleQuestion(q)}
                    className="px-5 py-2.5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-sm font-bold shadow-sm transition-all"
                  >
                    Kiểm tra đáp án
                  </button>

                  {checked && (
                    <button
                      type="button"
                      onClick={() => onJumpToKnowledgeSection(q.knowledgeSectionRef || 'coreConcepts')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors"
                    >
                      <span>
                        Xem lại kiến thức: {SECTION_LABELS[q.knowledgeSectionRef] || 'Trọng tâm bài'}
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {checked && (
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      checked.isCorrect
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        : 'bg-red-50/90 border-red-300 text-red-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {checked.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <span>{checked.scoreText}</span>
                    </div>

                    {q.type === 'short_answer' && q.acceptedAnswers && (
                      <p className="text-xs font-semibold">
                        Đáp án chuẩn: <span className="underline">{q.acceptedAnswers[0]}</span>
                      </p>
                    )}

                    <p className="text-sm leading-relaxed">
                      <strong>Lời giải ngắn gọn:</strong> {q.explanation || q.sampleAnswer}
                    </p>

                    {q.type === 'essay' && Array.isArray(q.rubricSteps) && (
                      <div className="pt-2 border-t border-black/10 space-y-1 text-xs">
                        <div className="font-bold">Các bước chấm điểm tự luận (0,25đ / bước):</div>
                        {q.rubricSteps.map((st, sIdx) => (
                          <div key={st.id}>
                            • Bước {sIdx + 1} ({st.points}đ): {st.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

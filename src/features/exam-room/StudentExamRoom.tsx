import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Maximize2,
  ShieldAlert,
  Send,
  CheckCircle2,
  Lock,
  Eye,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import {
  ExamSubmission,
  QuestionSubmissionDetail,
  StudentPaperQuestion,
} from '../../types/domainTypes';

interface StudentExamSummaryItem {
  id: string;
  title: string;
  category: string;
  schoolYear: string;
  durationMinutes: number;
  totalPoints: number;
  questionCount: number;
  allowReview: boolean;
  isOpen: boolean;
  maxTabViolations: number;
  mySubmission: {
    id: string;
    status: 'in_progress' | 'submitted_pending_grading' | 'finalized';
    paperCode: string;
    submittedAt?: string;
    totalScore: number | null;
    autoGradedScore: number | null;
  } | null;
}

interface StudentExamRoomProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const StudentExamRoom: React.FC<StudentExamRoomProps> = ({ onNotify }) => {
  const [exams, setExams] = useState<StudentExamSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active exam taking state
  const [activeExamMeta, setActiveExamMeta] = useState<{
    id: string;
    title: string;
    durationMinutes: number;
    maxTabViolations: number;
  } | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<ExamSubmission | null>(null);
  const [draftAnswers, setDraftAnswers] = useState<
    Record<string, Partial<QuestionSubmissionDetail>>
  >({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [violationCount, setViolationCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Question time tracking
  const questionStartRef = useRef<{ qId: string | null; ts: number }>({
    qId: null,
    ts: Date.now(),
  });

  // Review detail modal state (after teacher opens review)
  const [reviewDetail, setReviewDetail] = useState<any | null>(null);

  const loadExamsList = async () => {
    setLoading(true);
    try {
      const list = await apiRequest<StudentExamSummaryItem[]>('/api/exams');
      setExams(list);
    } catch (err: any) {
      onNotify('error', err.message || 'Không tải được danh sách đợt kiểm tra.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamsList();
  }, []);

  // Enter Fullscreen helper
  const requestExamFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Browser may block if not user gesture
    }
  };

  // Start or Resume Exam
  const handleStartExam = async (examId: string) => {
    try {
      await requestExamFullscreen();
      const res = await apiRequest<{
        exam: {
          id: string;
          title: string;
          durationMinutes: number;
          maxTabViolations: number;
        };
        submission: ExamSubmission;
      }>(`/api/exams/${examId}/start`, {
        method: 'POST',
        body: JSON.stringify({
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform || 'Web',
            screenResolution: `${window.screen.width}x${window.screen.height}`,
          },
        }),
      });

      setActiveExamMeta(res.exam);
      setActiveSubmission(res.submission);
      setDraftAnswers(res.submission.answers || {});
      setViolationCount(res.submission.violationCount || 0);

      // Calculate remaining seconds from startedAt
      const startedMs = new Date(res.submission.startedAt).getTime();
      const elapsedSec = Math.floor((Date.now() - startedMs) / 1000);
      const totalSec = res.exam.durationMinutes * 60;
      setRemainingSeconds(Math.max(5, totalSec - elapsedSec));
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể bắt đầu bài kiểm tra.');
    }
  };

  // Send log to server
  const sendLogEvent = async (
    eventType: string,
    detail: string,
    violationInc = 0,
    updatedAnswers?: Record<string, Partial<QuestionSubmissionDetail>>
  ) => {
    if (!activeSubmission) return;
    try {
      const res = await apiRequest<{ violationCount: number }>(
        `/api/submissions/${activeSubmission.id}/log`,
        {
          method: 'POST',
          body: JSON.stringify({
            logEntry: { eventType, detail },
            violationIncrement: violationInc,
            draftAnswers: updatedAnswers || draftAnswers,
          }),
        }
      );
      if (typeof res.violationCount === 'number') {
        setViolationCount(res.violationCount);
        const maxV = activeExamMeta?.maxTabViolations || 3;
        if (res.violationCount >= maxV) {
          onNotify(
            'error',
            `Em đã rời tab/cửa sổ ${res.violationCount}/${maxV} lần vượt ngưỡng quy định. Hệ thống tự động nộp bài và gắn cờ để giáo viên xem xét.`
          );
          handleSubmitExam('auto_submit_violation', res.violationCount);
        }
      }
    } catch {
      // ignore network blip
    }
  };

  // Countdown Timer & Auto-submit when timeout
  useEffect(() => {
    if (!activeSubmission || activeSubmission.status !== 'in_progress') return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNotify('info', 'Đã hết thời gian làm bài! Hệ thống tự động nộp bài.');
          handleSubmitExam('auto_submit_timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSubmission?.id]);

  // Anti-cheat listeners: visibilitychange, window blur, fullscreenchange
  useEffect(() => {
    if (!activeSubmission || activeSubmission.status !== 'in_progress') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onNotify(
          'error',
          'Cảnh báo kỹ thuật: Phát hiện rời tab làm bài! Sự kiện đã được ghi vào nhật ký.'
        );
        sendLogEvent('tab_blur', 'Học sinh chuyển sang tab khác hoặc ẩn trình duyệt', 1);
      }
    };

    const handleFullscreenChange = () => {
      const inFs = Boolean(document.fullscreenElement);
      setIsFullscreen(inFs);
      if (!inFs) {
        sendLogEvent('fullscreen_exit', 'Thoát chế độ toàn màn hình trong lúc làm bài', 0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [activeSubmission?.id, draftAnswers]);

  // Track time spent on each question and update answer
  const recordQuestionInteraction = (
    qId: string,
    patch: Partial<QuestionSubmissionDetail>
  ) => {
    const now = Date.now();
    let addedSec = 0;
    if (questionStartRef.current.qId === qId) {
      addedSec = Math.max(1, Math.round((now - questionStartRef.current.ts) / 1000));
    }
    questionStartRef.current = { qId, ts: now };

    setDraftAnswers((prev) => {
      const prevQ = prev[qId] || {};
      const nextQ = {
        ...prevQ,
        ...patch,
        timeSpentSeconds: (prevQ.timeSpentSeconds || 0) + addedSec,
      };
      const nextAll = { ...prev, [qId]: nextQ };
      sendLogEvent('answer_change', `Cập nhật câu trả lời (${qId})`, 0, nextAll);
      return nextAll;
    });
  };

  // Submit Exam (Locks immediately)
  const handleSubmitExam = async (
    reason: 'manual_submit' | 'auto_submit_timeout' | 'auto_submit_violation' = 'manual_submit',
    overrideViolationCount?: number
  ) => {
    if (!activeSubmission || submitting) return;
    setSubmitting(true);
    try {
      await apiRequest(`/api/submissions/${activeSubmission.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers: draftAnswers,
          submitReason: reason,
          violationCount: overrideViolationCount ?? violationCount,
        }),
      });

      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      }

      onNotify(
        'success',
        'Đã nộp bài thành công! Bài làm đã được khoá theo quy định (mỗi đợt chỉ làm 1 lần).'
      );
      setActiveSubmission(null);
      setActiveExamMeta(null);
      await loadExamsList();
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi khi nộp bài.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = async (submissionId: string) => {
    try {
      const res = await apiRequest<any>(`/api/submissions/${submissionId}/detail`);
      setReviewDetail(res);
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể xem chi tiết bài làm.');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ================= ACTIVE EXAM TAKING VIEW (ANTI-CHEAT LOCKED MODE) =================
  if (activeSubmission && activeExamMeta) {
    const questions = activeSubmission.paperSnapshot;
    const mcqList = questions.filter((q) => q.type === 'mcq');
    const tfList = questions.filter((q) => q.type === 'true_false');
    const saList = questions.filter((q) => q.type === 'short_answer');
    const essayList = questions.filter((q) => q.type === 'essay');

    return (
      <div
        className="min-h-screen bg-slate-100 select-none pb-16"
        onCopy={(e) => {
          e.preventDefault();
          onNotify('error', 'Đã chặn sao chép (Copy) trong phòng kiểm tra!');
          sendLogEvent('copy_paste_blocked', 'Chặn thao tác Copy trong lúc thi', 0);
        }}
        onCut={(e) => {
          e.preventDefault();
          sendLogEvent('copy_paste_blocked', 'Chặn thao tác Cut trong lúc thi', 0);
        }}
        onPaste={(e) => {
          e.preventDefault();
          onNotify('error', 'Đã chặn dán (Paste) trong phòng kiểm tra!');
          sendLogEvent('copy_paste_blocked', 'Chặn thao tác Paste trong lúc thi', 0);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onNotify('info', 'Chuột phải bị vô hiệu hoá trong lúc làm bài kiểm tra.');
          sendLogEvent('contextmenu_blocked', 'Chặn chuột phải trong lúc thi', 0);
        }}
      >
        {/* Sticky Exam Top Bar */}
        <div className="sticky top-0 z-40 bg-slate-900 text-white shadow-lg px-4 sm:px-6 py-3">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-extrabold">
                  {activeSubmission.paperCode}
                </span>
                <h2 className="font-bold text-base sm:text-lg">{activeExamMeta.title}</h2>
              </div>
              <p className="text-xs text-slate-300">
                Học sinh: {activeSubmission.studentName} • Lớp {activeSubmission.className} • Đề cá
                nhân hoá (Chữ ký: {activeSubmission.paperSignature})
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Violation Counter */}
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  violationCount > 0 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>
                  Rời tab: {violationCount}/{activeExamMeta.maxTabViolations}
                </span>
              </div>

              {/* Countdown Timer */}
              <div
                className={`px-4 py-1.5 rounded-xl font-mono text-base font-extrabold flex items-center gap-1.5 ${
                  remainingSeconds <= 180
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-teal-700 text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>

              {!isFullscreen && (
                <button
                  type="button"
                  onClick={requestExamFullscreen}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Toàn màn hình</span>
                </button>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitExam('manual_submit')}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Đang nộp...' : 'Nộp bài'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 pt-5 space-y-6">
          {/* Transparent Anti-Cheat Disclaimer Banner (Required by Section 9) */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <div className="font-bold">
                Quy định phòng thi trực tuyến & Minh bạch giám sát kỹ thuật:
              </div>
              <p>
                • Trong lúc làm bài, hệ thống chặn sao chép/dán/chuột phải, đếm số lần rời tab hoặc
                thoát cửa sổ và lưu nhật ký thời gian làm từng câu. Nếu rời tab vượt quá ngưỡng (
                {activeExamMeta.maxTabViolations} lần) hoặc hết giờ, bài làm sẽ tự động được nộp.
              </p>
              <p className="font-semibold text-[#0D6E6E]">
                • Lưu ý: Các dấu hiệu cảnh báo kỹ thuật này chỉ dùng để giáo viên xem xét ngữ cảnh,
                hệ thống KHÔNG tự động kết luận học sinh gian lận. Mặc định không sử dụng webcam.
              </p>
            </div>
          </div>

          {/* Part I.1: Multiple Choice */}
          {mcqList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 bg-white p-4 rounded-2xl border border-slate-200">
                PHẦN I.1 — Trắc nghiệm nhiều lựa chọn ({mcqList.length} câu)
              </h3>
              {mcqList.map((q, idx) => {
                const selectedIdx = draftAnswers[q.questionId]?.selectedShuffledIndex;
                return (
                  <div
                    key={q.questionId}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg bg-[#0D6E6E] text-white text-xs font-bold">
                        Câu {idx + 1} ({q.points} điểm)
                      </span>
                    </div>
                    <p className="text-base font-semibold text-slate-900">{q.prompt}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(q.shuffledOptions || []).map((optText, oIdx) => {
                        const isPicked = selectedIdx === oIdx;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              recordQuestionInteraction(q.questionId, {
                                selectedShuffledIndex: oIdx,
                              })
                            }
                            className={`text-left p-4 rounded-xl border-2 flex items-start gap-3 transition-all ${
                              isPicked
                                ? 'bg-teal-50 border-[#0D6E6E] text-[#0D6E6E] font-bold'
                                : 'bg-white border-slate-200 hover:border-teal-500 text-slate-800'
                            }`}
                          >
                            <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </span>
                            <span className="text-sm leading-relaxed">{optText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Part I.2: True / False */}
          {tfList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 bg-white p-4 rounded-2xl border border-slate-200">
                PHẦN I.2 — Trắc nghiệm Đúng – Sai ({tfList.length} câu • Đúng 1 ý: 0,1đ; 2 ý: 0,25đ;
                3 ý: 0,5đ; 4 ý: 1,0đ)
              </h3>
              {tfList.map((q, idx) => {
                const tfMap = draftAnswers[q.questionId]?.trueFalseAnswers || {
                  a: null,
                  b: null,
                  c: null,
                  d: null,
                };
                return (
                  <div
                    key={q.questionId}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs"
                  >
                    <span className="px-3 py-1 rounded-lg bg-[#0D6E6E] text-white text-xs font-bold">
                      Câu Đúng–Sai {idx + 1} ({q.points} điểm)
                    </span>
                    <p className="text-base font-semibold text-slate-900">{q.prompt}</p>
                    <div className="space-y-2.5">
                      {(q.statements || []).map((st) => {
                        const cur = tfMap[st.id];
                        return (
                          <div
                            key={st.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <span className="text-sm text-slate-800">
                              <strong className="text-[#0D6E6E] mr-1.5">{st.id})</strong>
                              {st.text}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  recordQuestionInteraction(q.questionId, {
                                    trueFalseAnswers: { ...tfMap, [st.id]: true },
                                  })
                                }
                                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                                  cur === true
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-slate-700 border-slate-300'
                                }`}
                              >
                                Đúng
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  recordQuestionInteraction(q.questionId, {
                                    trueFalseAnswers: { ...tfMap, [st.id]: false },
                                  })
                                }
                                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                                  cur === false
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-white text-slate-700 border-slate-300'
                                }`}
                              >
                                Sai
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Part I.3: Short Answer */}
          {saList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 bg-white p-4 rounded-2xl border border-slate-200">
                PHẦN I.3 — Trắc nghiệm Trả lời ngắn ({saList.length} câu, mỗi câu 0,5 điểm)
              </h3>
              {saList.map((q, idx) => (
                <div
                  key={q.questionId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs"
                >
                  <span className="px-3 py-1 rounded-lg bg-[#0D6E6E] text-white text-xs font-bold">
                    Câu trả lời ngắn {idx + 1} ({q.points} điểm)
                  </span>
                  <p className="text-base font-semibold text-slate-900">{q.prompt}</p>
                  <input
                    type="text"
                    value={draftAnswers[q.questionId]?.textAnswer || ''}
                    onChange={(e) =>
                      recordQuestionInteraction(q.questionId, { textAnswer: e.target.value })
                    }
                    placeholder="Nhập câu trả lời ngắn của em vào đây..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-teal-600 select-text"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Part II: Essay */}
          {essayList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 bg-white p-4 rounded-2xl border border-slate-200">
                PHẦN II — Tự luận ({essayList.length} câu, mỗi câu 1,0 điểm)
              </h3>
              {essayList.map((q, idx) => (
                <div
                  key={q.questionId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs"
                >
                  <span className="px-3 py-1 rounded-lg bg-[#0D6E6E] text-white text-xs font-bold">
                    Câu tự luận {idx + 1} ({q.points} điểm)
                  </span>
                  <p className="text-base font-semibold text-slate-900">{q.prompt}</p>
                  <textarea
                    rows={5}
                    value={draftAnswers[q.questionId]?.textAnswer || ''}
                    onChange={(e) =>
                      recordQuestionInteraction(q.questionId, { textAnswer: e.target.value })
                    }
                    placeholder="Trình bày đầy đủ Tóm tắt, Công thức / PTHH, Các bước thay số và Kết luận..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-teal-600 select-text"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bottom Submit Button */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Kiểm tra kỹ các câu trả lời trước khi bấm <strong>Hoàn thành & Nộp bài</strong>. Sau
              khi nộp bài sẽ khoá ngay và không thể chỉnh sửa.
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitExam('manual_submit')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#0D6E6E] hover:bg-teal-800 text-white font-bold text-base shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span>{submitting ? 'Đang nộp bài...' : 'Hoàn thành & Nộp bài'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= DEFAULT EXAM ROOM LIST FOR STUDENT =================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">
          Phòng Kiểm Tra Trực Tuyến & Tra Cứu Kết Quả Cá Nhân
        </h2>
        <p className="text-sm text-slate-600">
          Mỗi học sinh nhận một mã đề cá nhân hoá riêng biệt từ cùng ma trận đề của lớp. Mỗi đợt
          kiểm tra chỉ được làm 1 lần duy nhất.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          Đang tải danh sách bài kiểm tra của lớp...
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          Hiện chưa có đợt kiểm tra nào được giáo viên mở cho lớp của em.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((ex) => {
            const sub = ex.mySubmission;
            const isCompleted = sub && sub.status !== 'in_progress';

            return (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0D6E6E] border border-teal-200 text-xs font-bold">
                      Thời gian: {ex.durationMinutes} phút • {ex.questionCount} câu
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã nộp bài ({sub.paperCode})
                      </span>
                    ) : ex.isOpen ? (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                        Đang mở thi
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        Đã khoá
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{ex.title}</h3>
                  <p className="text-xs text-slate-500">
                    Thang điểm: {ex.totalPoints} điểm • Ngưỡng cảnh báo rời tab:{' '}
                    {ex.maxTabViolations} lần
                  </p>

                  {isCompleted && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div>
                        Trạng thái chấm:{' '}
                        <strong className="text-[#0D6E6E]">
                          {sub.status === 'finalized'
                            ? 'Đã chốt điểm chính thức'
                            : 'Đã chấm tự động phần trắc nghiệm — Đang chờ giáo viên chấm tự luận'}
                        </strong>
                      </div>
                      {sub.totalScore !== null && (
                        <div className="text-sm font-bold text-emerald-700">
                          Tổng điểm: {sub.totalScore} / {ex.totalPoints} điểm
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  {!isCompleted ? (
                    <button
                      disabled={!ex.isOpen}
                      onClick={() => handleStartExam(ex.id)}
                      className="w-full py-3.5 px-5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white font-bold text-sm shadow-sm disabled:opacity-50"
                    >
                      {sub?.status === 'in_progress'
                        ? 'Tiếp tục làm bài kiểm tra'
                        : 'Bắt đầu làm bài kiểm tra'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReview(sub.id)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-teal-700 text-[#0D6E6E] hover:bg-teal-50 font-bold text-sm"
                    >
                      {ex.allowReview ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Xem điểm chi tiết, đúng/sai & lời giải</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Xem trạng thái bài nộp (Chờ GV mở đáp án)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Xem Kết Quả & Lời Giải (Sau khi GV mở allowReview) */}
      {reviewDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#0D6E6E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  Kết quả bài kiểm tra — Mã đề {reviewDetail.submission?.paperCode}
                </h3>
              </div>
              <button
                onClick={() => setReviewDetail(null)}
                className="px-3 py-1 rounded-lg bg-white/15 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {!reviewDetail.allowReview ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                  <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                  <h4 className="font-bold text-base text-amber-950">
                    Giáo viên chưa mở xem đáp án & lời giải cho đợt thi này
                  </h4>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {reviewDetail.message}
                  </p>
                  {reviewDetail.submission?.totalScore !== null && (
                    <div className="pt-2 text-lg font-extrabold text-emerald-700">
                      Điểm đã chốt của em: {reviewDetail.submission.totalScore} điểm
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-emerald-800 uppercase">
                        Điểm số bài kiểm tra của em
                      </div>
                      <div className="text-2xl font-extrabold text-emerald-700">
                        Tổng điểm: {reviewDetail.submission.totalScore} /{' '}
                        {reviewDetail.exam?.totalPoints || 10} điểm
                      </div>
                      <div className="text-xs text-slate-600">
                        Chấm tự động TN: {reviewDetail.submission.autoGradedScore}đ • Chấm tự luận/tay:{' '}
                        {reviewDetail.submission.manualGradedScore}đ
                      </div>
                    </div>
                    {reviewDetail.submission.teacherOverallFeedback && (
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs max-w-sm">
                        <strong>Lời phê của Giáo viên:</strong>{' '}
                        {reviewDetail.submission.teacherOverallFeedback}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(reviewDetail.enrichedQuestions || []).map((q: any, idx: number) => {
                      const ans = q.studentAnswer;
                      const bq = q.bankQuestion;
                      return (
                        <div
                          key={q.questionId}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              Câu {idx + 1} ({q.type.toUpperCase()}):
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold ${
                                ans?.finalScore >= q.points
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ans?.finalScore > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              Đạt: {ans?.finalScore ?? 0} / {q.points} điểm
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-slate-900">{q.prompt}</p>
                          {q.type === 'mcq' && (
                            <div className="space-y-1">
                              <div>
                                Em đã chọn:{' '}
                                <strong>
                                  {typeof ans?.selectedShuffledIndex === 'number'
                                    ? `${['A', 'B', 'C', 'D'][ans.selectedShuffledIndex]}. ${
                                        q.shuffledOptions?.[ans.selectedShuffledIndex]
                                      }`
                                    : 'Chưa chọn'}
                                </strong>
                              </div>
                              <div className="text-emerald-800 font-semibold">
                                Đáp án đúng: {bq?.options?.[bq?.correctOptionIndex ?? 0]}
                              </div>
                            </div>
                          )}
                          {(q.type === 'short_answer' || q.type === 'essay') && (
                            <div className="space-y-1">
                              <div>
                                Bài làm của em: <strong>{ans?.textAnswer || '(Bỏ trống)'}</strong>
                              </div>
                              {ans?.teacherComment && (
                                <div className="text-amber-900">
                                  Nhận xét GV: <strong>{ans.teacherComment}</strong>
                                </div>
                              )}
                            </div>
                          )}
                          {(bq?.explanation || bq?.sampleAnswer) && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                              <strong>Lời giải & Hướng dẫn:</strong>{' '}
                              {bq.explanation || bq.sampleAnswer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSignature,
  BarChart3,
  ShieldAlert,
  Eye,
  X,
  Save,
} from 'lucide-react';
import { apiRequest, getCsvDownloadUrl } from '../../services/apiClient';
import { ExamDefinition, ExamSubmission } from '../../types/domainTypes';

interface ExamStatisticsResponse {
  examId: string;
  examTitle: string;
  totalSubmissions: number;
  averageScore: number;
  passCount: number;
  passRatePercent: number;
  hardestQuestions: Array<{
    questionId: string;
    lessonId: number;
    type: string;
    level: string;
    prompt: string;
    indicator: string;
    totalAttempts: number;
    wrongOrIncompleteCount: number;
    wrongRatePercent: number;
  }>;
  submissions: ExamSubmission[];
}

interface TeacherGradingAndReportsProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const TeacherGradingAndReports: React.FC<TeacherGradingAndReportsProps> = ({
  onNotify,
}) => {
  const [exams, setExams] = useState<ExamDefinition[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [stats, setStats] = useState<ExamStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Active grading/detail modal
  const [activeSubDetail, setActiveSubDetail] = useState<any | null>(null);
  const [gradeInputs, setGradeInputs] = useState<
    Record<
      string,
      {
        manualScore?: number;
        checkedRubricStepIds?: string[];
        teacherComment?: string;
      }
    >
  >({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => {
    apiRequest<ExamDefinition[]>('/api/exams')
      .then((list) => {
        setExams(list);
        if (list[0]?.id) {
          setSelectedExamId(list[0].id);
        }
      })
      .catch((err) => onNotify('error', err.message || 'Lỗi tải danh sách đợt kiểm tra.'));
  }, []);

  const loadExamStatistics = async (examId: string) => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await apiRequest<ExamStatisticsResponse>(
        `/api/exams/${examId}/statistics`
      );
      setStats(res);
    } catch (err: any) {
      onNotify('error', err.message || 'Không tải được thống kê lớp học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      loadExamStatistics(selectedExamId);
    }
  }, [selectedExamId]);

  const openGradingModal = async (submissionId: string) => {
    try {
      const res = await apiRequest<any>(`/api/submissions/${submissionId}/detail`);
      setActiveSubDetail(res);
      setOverallFeedback(res.submission?.teacherOverallFeedback || '');

      const initialGrades: Record<string, any> = {};
      for (const q of res.enrichedQuestions || []) {
        const ans = q.studentAnswer;
        if (ans) {
          initialGrades[q.questionId] = {
            manualScore:
              typeof ans.manualScore === 'number' ? ans.manualScore : ans.finalScore,
            checkedRubricStepIds: ans.checkedRubricStepIds || [],
            teacherComment: ans.teacherComment || '',
          };
        }
      }
      setGradeInputs(initialGrades);
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể mở chi tiết bài làm.');
    }
  };

  const toggleRubricStep = (qId: string, stepId: string, rubricSteps: any[]) => {
    setGradeInputs((prev) => {
      const cur = prev[qId] || { checkedRubricStepIds: [] };
      const list = cur.checkedRubricStepIds || [];
      const nextList = list.includes(stepId)
        ? list.filter((id) => id !== stepId)
        : [...list, stepId];
      const nextScore = rubricSteps
        .filter((st) => nextList.includes(st.id))
        .reduce((s, st) => s + Number(st.points || 0.25), 0);

      return {
        ...prev,
        [qId]: {
          ...cur,
          checkedRubricStepIds: nextList,
          manualScore: Number(nextScore.toFixed(2)),
        },
      };
    });
  };

  const handleSaveAndFinalizeGrade = async () => {
    if (!activeSubDetail?.submission) return;
    setSavingGrade(true);
    try {
      await apiRequest(`/api/submissions/${activeSubDetail.submission.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({
          questionGrades: gradeInputs,
          teacherOverallFeedback: overallFeedback,
          finalize: true,
        }),
      });
      onNotify(
        'success',
        `Đã chấm tự luận và chốt điểm chính thức cho học sinh ${activeSubDetail.submission.studentName}!`
      );
      setActiveSubDetail(null);
      if (selectedExamId) {
        await loadExamStatistics(selectedExamId);
      }
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể lưu kết quả chấm.');
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Exam Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Chấm Bài Tự Luận, Giám Sát Đề Cá Nhân & Báo Cáo Kết Quả Lớp
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Chấm tự động TN nhiều lựa chọn, Đúng–Sai, Trả lời ngắn; Giáo viên chấm tay Tự luận theo
            bước 0,25đ và chốt điểm, xuất CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
          >
            {exams.length === 0 && <option value="">Chưa có đợt kiểm tra</option>}
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.durationMinutes}p)
              </option>
            ))}
          </select>

          {selectedExamId && (
            <a
              href={getCsvDownloadUrl(selectedExamId)}
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-sm font-bold shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất kết quả lớp (CSV)</span>
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          Đang tải dữ liệu bài nộp và thống kê lớp học...
        </div>
      ) : !stats ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          Vui lòng chọn một đợt kiểm tra để xem báo cáo và chấm bài.
        </div>
      ) : (
        <>
          {/* Statistics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">
                TỔNG SỐ BÀI ĐÃ NỘP
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.totalSubmissions} bài
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Chờ chấm tay:{' '}
                {
                  stats.submissions.filter((s) => s.status === 'submitted_pending_grading')
                    .length
                }{' '}
                bài
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">
                ĐIỂM TRUNG BÌNH LỚP
              </div>
              <div className="text-3xl font-extrabold text-[#0D6E6E] mt-1">
                {stats.averageScore} / 10
              </div>
              <div className="text-xs text-slate-500 mt-1">Tính trên các bài đã nộp</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">
                TỈ LỆ ĐẠT (≥ 5,0 ĐIỂM)
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                {stats.passRatePercent}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Số HS đạt: {stats.passCount} / {stats.totalSubmissions} học sinh
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">
                CẢNH BÁO KỸ THUẬT CẦN XEM
              </div>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                {stats.submissions.filter((s) => s.flaggedForReview).length} bài
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Chỉ để GV xem xét, không tự kết luận gian lận
              </div>
            </div>
          </div>

          {/* Student Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Danh sách bài làm của học sinh ({stats.submissions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Mỗi học sinh có một <strong>Mã đề cá nhân</strong> và{' '}
                  <strong>Chữ ký đề</strong> riêng biệt (chứng minh không có 2 em nào nhận cùng 1 đề
                  nguyên vẹn).
                </p>
              </div>
            </div>

            {stats.submissions.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Chưa có học sinh nào nộp bài trong đợt kiểm tra này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                      <th className="p-3.5">STT</th>
                      <th className="p-3.5">Học sinh</th>
                      <th className="p-3.5">Lớp</th>
                      <th className="p-3.5">Mã đề & Chữ ký đề</th>
                      <th className="p-3.5">Điểm Tự động</th>
                      <th className="p-3.5">Điểm Tự luận/Tay</th>
                      <th className="p-3.5">Tổng điểm</th>
                      <th className="p-3.5">Trạng thái</th>
                      <th className="p-3.5">Giám sát thi</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.submissions.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold">{idx + 1}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{sub.studentName}</div>
                          <div className="text-xs text-slate-500">@{sub.studentUsername}</div>
                        </td>
                        <td className="p-3.5 font-semibold">{sub.className}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0D6E6E] border border-teal-200 font-bold text-xs">
                            {sub.paperCode}
                          </span>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            Sig: {sub.paperSignature}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {sub.autoGradedScore}đ
                        </td>
                        <td className="p-3.5 font-bold text-amber-700">
                          {sub.manualGradedScore}đ
                        </td>
                        <td className="p-3.5 font-extrabold text-base text-emerald-700">
                          {sub.totalScore}đ
                        </td>
                        <td className="p-3.5">
                          {sub.status === 'finalized' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã chốt điểm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold">
                              <FileSignature className="w-3.5 h-3.5" /> Chờ GV chấm tay
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {sub.flaggedForReview ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                              <ShieldAlert className="w-3.5 h-3.5" /> Rời tab {sub.violationCount} lần
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">
                              Rời tab: {sub.violationCount} lần
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => openGradingModal(sub.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-xs font-bold shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chấm bài & Xem Log</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hardest Questions Analytics */}
          {stats.hardestQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <BarChart3 className="w-5 h-5 text-[#0D6E6E]" />
                <span>Thống kê các câu hỏi học sinh làm sai nhiều nhất</span>
              </div>
              <div className="space-y-2.5">
                {stats.hardestQuestions.slice(0, 6).map((hq, idx) => (
                  <div
                    key={hq.questionId}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#0D6E6E]">
                        Top {idx + 1} • Bài {hq.lessonId} • Loại: {hq.type.toUpperCase()} • Chỉ báo:{' '}
                        {hq.indicator}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {hq.prompt}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                        Sai / Chưa trọn vẹn: {hq.wrongOrIncompleteCount}/{hq.totalAttempts} HS (
                        {hq.wrongRatePercent}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: CHẤM BÀI TỰ LUẬN, TRẢ LỜI NGẮN & XEM NHẬT KÝ LÀM BÀI */}
      {activeSubDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#0D6E6E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  Chấm bài & Xem Nhật ký — {activeSubDetail.submission.studentName} (Lớp{' '}
                  {activeSubDetail.submission.className})
                </h3>
                <p className="text-xs text-teal-100">
                  Mã đề cá nhân: {activeSubDetail.submission.paperCode} • Chữ ký đề:{' '}
                  {activeSubDetail.submission.paperSignature}
                </p>
              </div>
              <button
                onClick={() => setActiveSubDetail(null)}
                className="p-1.5 rounded-xl hover:bg-white/15"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Anti-Cheat Log & Disclaimer */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 uppercase">
                    Nhật ký làm bài & Thiết bị của học sinh:
                  </span>
                  <span className="text-slate-600">
                    Thiết bị: {activeSubDetail.submission.deviceInfo?.platform} • Màn hình:{' '}
                    {activeSubDetail.submission.deviceInfo?.screenResolution}
                  </span>
                </div>
                <p className="text-amber-900 bg-amber-50 border border-amber-200 p-2 rounded-lg font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                  Lưu ý minh bạch: Các dấu hiệu cảnh báo kỹ thuật (rời tab, thoát toàn màn hình...)
                  chỉ để giáo viên xem xét thêm ngữ cảnh, hệ thống KHÔNG tự động kết luận học sinh
                  gian lận. Mặc định không dùng webcam.
                </p>
                <div className="max-h-28 overflow-y-auto space-y-1 bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]">
                  {(activeSubDetail.submission.activityLogs || []).map((log: any, lIdx: number) => (
                    <div key={lIdx}>
                      [{new Date(log.timestamp).toLocaleTimeString('vi-VN')}] ({log.eventType}):{' '}
                      {log.detail}
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions & Manual Grading Controls */}
              <div className="space-y-4">
                {(activeSubDetail.enrichedQuestions || []).map((q: any, idx: number) => {
                  const ans = q.studentAnswer || {};
                  const bq = q.bankQuestion || {};
                  const gState = gradeInputs[q.questionId] || {};
                  const isManualType =
                    q.type === 'essay' || (q.type === 'short_answer' && ans.needsManualGrading);

                  return (
                    <div
                      key={q.questionId}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        q.type === 'essay' || ans.needsManualGrading
                          ? 'bg-amber-50/50 border-amber-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold">
                            Câu {idx + 1} ({q.type.toUpperCase()})
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                             Bài {q.lessonId} • Thời gian làm: {ans.timeSpentSeconds || 0} giây
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#0D6E6E]">
                          Điểm tối đa: {q.points} điểm
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900">{q.prompt}</p>

                      {/* Display student's answer */}
                      {q.type === 'mcq' && (
                        <div className="text-xs space-y-1">
                          <div>
                            Phương án đảo của HS: [
                            {(q.shuffledOptions || [])
                              .map((o: string, i: number) => `${['A', 'B', 'C', 'D'][i]}: ${o}`)
                              .join(' | ')}
                            ]
                          </div>
                          <div>
                            Học sinh chọn:{' '}
                            <strong className={ans.isCorrect ? 'text-emerald-700' : 'text-red-600'}>
                              {typeof ans.selectedShuffledIndex === 'number'
                                ? `${['A', 'B', 'C', 'D'][ans.selectedShuffledIndex]}. ${
                                    q.shuffledOptions?.[ans.selectedShuffledIndex]
                                  }`
                                : '(Chưa chọn)'}
                            </strong>{' '}
                            → Điểm tự động: <strong>{ans.autoScore}đ</strong>
                          </div>
                        </div>
                      )}

                      {q.type === 'true_false' && (
                        <div className="text-xs">
                          Số ý đúng: <strong>{ans.trueFalseCorrectCount ?? 0}/4 ý</strong> → Điểm tự
                          động: <strong>{ans.autoScore}đ</strong>
                        </div>
                      )}

                      {(q.type === 'short_answer' || q.type === 'essay') && (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-white border border-slate-300 text-sm">
                            <div className="text-xs font-bold text-slate-500 mb-1">
                              Bài làm của học sinh:
                            </div>
                            <div className="whitespace-pre-line font-semibold text-slate-900">
                              {ans.textAnswer || '(Học sinh bỏ trống câu này)'}
                            </div>
                          </div>

                          <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200">
                            <strong>Đáp án mẫu / Chuẩn:</strong>{' '}
                            {q.type === 'short_answer'
                              ? (bq.acceptedAnswers || []).join(' | ')
                              : bq.sampleAnswer || bq.explanation}
                          </div>

                          {/* Essay Rubric Steps (0,25đ per step) */}
                          {q.type === 'essay' && Array.isArray(bq.rubricSteps) && (
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-amber-300">
                              <div className="text-xs font-bold text-amber-950">
                                Tích chọn các bước chấm học sinh làm đúng (mỗi bước 0,25 điểm):
                              </div>
                              {bq.rubricSteps.map((st: any) => {
                                const checked = (gState.checkedRubricStepIds || []).includes(st.id);
                                return (
                                  <label
                                    key={st.id}
                                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-amber-50 cursor-pointer text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          toggleRubricStep(q.questionId, st.id, bq.rubricSteps)
                                        }
                                        className="w-4 h-4 accent-[#0D6E6E]"
                                      />
                                      <span>{st.description}</span>
                                    </div>
                                    <span className="font-bold text-[#0D6E6E]">+{st.points}đ</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Manual Score Input & Teacher Comment */}
                          {(isManualType || q.type === 'short_answer') && (
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                              <div className="sm:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Điểm GV chấm (tối đa {q.points}đ):
                                </label>
                                <input
                                  type="number"
                                  step="0.25"
                                  min={0}
                                  max={q.points}
                                  value={gState.manualScore ?? 0}
                                  onChange={(e) =>
                                    setGradeInputs((prev) => ({
                                      ...prev,
                                      [q.questionId]: {
                                        ...(prev[q.questionId] || {}),
                                        manualScore: Number(e.target.value),
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                                />
                              </div>
                              <div className="sm:col-span-8">
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Nhận xét riêng cho câu này:
                                </label>
                                <input
                                  type="text"
                                  value={gState.teacherComment || ''}
                                  onChange={(e) =>
                                    setGradeInputs((prev) => ({
                                      ...prev,
                                      [q.questionId]: {
                                        ...(prev[q.questionId] || {}),
                                        teacherComment: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Ghi nhận xét bước giải..."
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overall Teacher Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời phê chung của Giáo viên cho bài kiểm tra:
                </label>
                <input
                  type="text"
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  placeholder="VD: Nắm vững kiến thức cơ bản, trình bày tự luận rõ ràng..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubDetail(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={savingGrade}
                onClick={handleSaveAndFinalizeGrade}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-xs font-bold shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{savingGrade ? 'Đang lưu...' : 'Lưu điểm chấm tay & Chốt điểm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

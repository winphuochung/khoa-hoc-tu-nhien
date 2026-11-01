import React, { useEffect, useState, useMemo } from 'react';
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
  GraduationCap,
  Users,
  Filter,
} from 'lucide-react';
import { apiRequest, getCsvDownloadUrl } from '../../services/apiClient';
import { ExamDefinition, ExamSubmission, SchoolConfig } from '../../types/domainTypes';

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
  schoolConfig?: SchoolConfig;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const TeacherGradingAndReports: React.FC<TeacherGradingAndReportsProps> = ({
  schoolConfig,
  onNotify,
}) => {
  const [exams, setExams] = useState<ExamDefinition[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
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

  // Filter exams strictly by selected Grade
  const filteredExams = useMemo(() => {
    if (selectedGrade === 'ALL') return exams;
    return exams.filter((ex) => Number(ex.grade || 9) === selectedGrade);
  }, [exams, selectedGrade]);

  // Keep selectedExamId in sync with filteredExams
  useEffect(() => {
    if (filteredExams.length > 0) {
      if (!filteredExams.some((e) => e.id === selectedExamId)) {
        setSelectedExamId(filteredExams[0].id);
      }
    } else {
      setSelectedExamId('');
      setStats(null);
    }
  }, [filteredExams, selectedExamId]);

  const selectedExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId);
  }, [exams, selectedExamId]);

  // Clean classes from school configuration, strictly eliminating ghost classes
  const schoolClasses = useMemo(() => {
    const raw = schoolConfig?.classes || [];
    const clean = raw
      .map((c) => String(c || '').trim().replace(/^(?:lớp|lop)\s*/i, '').toUpperCase())
      .filter((c) => c && /\d/.test(c) && !/^9A[4-9]/.test(c) && c !== '9A6' && c !== '9A7');
    const standardDefault = ['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2', '9A3'];
    for (const cls of standardDefault) {
      if (!clean.includes(cls)) {
        clean.push(cls);
      }
    }
    const strictlyFiltered = clean.filter((c) => {
      if (/^9/i.test(c)) return ['9A1', '9A2', '9A3'].includes(c);
      return true;
    });
    return Array.from(new Set(strictlyFiltered)).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [schoolConfig?.classes]);

  // Target grade for the current view
  const targetGrade = useMemo(() => {
    if (selectedGrade !== 'ALL') return Number(selectedGrade);
    if (selectedExam?.grade) return Number(selectedExam.grade);
    return 9;
  }, [selectedGrade, selectedExam?.grade]);

  // Available classes strictly synced with schoolConfig for current grade/view
  const availableClassesForExam = useMemo(() => {
    const gradeNum = targetGrade;
    if (gradeNum === 9) {
      return ['9A1', '9A2', '9A3'];
    }
    const matched = schoolClasses.filter((c) => {
      const m = c.match(/^(\d+)/);
      return m ? Number(m[1]) === gradeNum : c.startsWith(String(gradeNum));
    });
    return Array.from(new Set(matched)).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [schoolClasses, targetGrade]);

  // Reset selectedClass if not in availableClasses
  useEffect(() => {
    if (selectedClass !== 'ALL' && !availableClassesForExam.includes(selectedClass)) {
      setSelectedClass('ALL');
    }
  }, [availableClassesForExam, selectedClass]);

  // Filtered submissions based on selectedClass
  const filteredSubmissions = useMemo(() => {
    if (!stats?.submissions) return [];
    let list = stats.submissions;
    if (selectedClass !== 'ALL') {
      list = list.filter((s) => s.className === selectedClass);
    }
    return [...list].sort((a, b) => {
      if (a.className !== b.className) return a.className.localeCompare(b.className);
      return a.studentName.localeCompare(b.studentName, 'vi');
    });
  }, [stats?.submissions, selectedClass]);

  // Recalculate statistics for the selected class
  const classStats = useMemo(() => {
    const total = filteredSubmissions.length;
    if (total === 0) {
      return {
        total: 0,
        pending: 0,
        average: 0,
        passCount: 0,
        passRatePercent: 0,
        flaggedCount: 0,
      };
    }
    const pending = filteredSubmissions.filter((s) => s.status === 'submitted_pending_grading').length;
    const avg = Number(
      (filteredSubmissions.reduce((acc, s) => acc + (s.totalScore || 0), 0) / total).toFixed(2)
    );
    const passCount = filteredSubmissions.filter((s) => (s.totalScore || 0) >= 5.0).length;
    const passRatePercent = Math.round((passCount / total) * 100);
    const flaggedCount = filteredSubmissions.filter((s) => s.flaggedForReview).length;
    return {
      total,
      pending,
      average: avg,
      passCount,
      passRatePercent,
      flaggedCount,
    };
  }, [filteredSubmissions]);

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
        if (ans && q.type === 'essay') {
          initialGrades[q.questionId] = {
            manualScore:
              typeof ans.manualScore === 'number'
                ? ans.manualScore
                : typeof ans.finalScore === 'number'
                ? ans.finalScore
                : 0,
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

  const hasEssayQuestions = useMemo(() => {
    return (activeSubDetail?.enrichedQuestions || []).some((q: any) => q.type === 'essay');
  }, [activeSubDetail]);

  const currentManualTotal = useMemo(() => {
    if (!activeSubDetail) return 0;
    let sum = 0;
    for (const q of activeSubDetail.enrichedQuestions || []) {
      if (q.type === 'essay') {
        const g = gradeInputs[q.questionId];
        const val =
          typeof g?.manualScore === 'number'
            ? g.manualScore
            : typeof q.studentAnswer?.manualScore === 'number'
            ? q.studentAnswer.manualScore
            : typeof q.studentAnswer?.finalScore === 'number'
            ? q.studentAnswer.finalScore
            : 0;
        sum += Number(val || 0);
      }
    }
    return Number(sum.toFixed(2));
  }, [activeSubDetail, gradeInputs]);

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
            bước 0,25đ và chốt điểm, xuất CSV theo từng khối và lớp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Lọc Khối */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 shadow-2xs">
            <GraduationCap className="w-4 h-4 text-[#0D6E6E]" />
            <span className="text-xs font-bold text-slate-600">Khối:</span>
            <select
              value={selectedGrade}
              onChange={(e) =>
                setSelectedGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả các khối</option>
              <option value="6">Khối 6</option>
              <option value="7">Khối 7</option>
              <option value="8">Khối 8</option>
              <option value="9">Khối 9</option>
            </select>
          </div>

          {/* Chọn Đề kiểm tra */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white max-w-sm truncate shadow-2xs"
          >
            {filteredExams.length === 0 && (
              <option value="">Chưa có đợt kiểm tra {selectedGrade !== 'ALL' ? `Khối ${selectedGrade}` : ''}</option>
            )}
            {filteredExams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                [Khối {ex.grade || 9}] {ex.title} ({ex.durationMinutes}p)
              </option>
            ))}
          </select>

          {/* Lọc Lớp */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 shadow-2xs">
            <Users className="w-4 h-4 text-[#0D6E6E]" />
            <span className="text-xs font-bold text-slate-600">Lớp:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả các lớp</option>
              {availableClassesForExam.map((cls) => (
                <option key={cls} value={cls}>
                  Lớp {cls}
                </option>
              ))}
            </select>
          </div>

          {selectedExamId && (
            <a
              href={getCsvDownloadUrl(selectedExamId, selectedClass)}
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-sm font-bold shadow-sm"
              title={selectedClass !== 'ALL' ? `Xuất kết quả lớp ${selectedClass}` : 'Xuất kết quả tất cả các lớp'}
            >
              <Download className="w-4 h-4" />
              <span>Xuất kết quả {selectedClass !== 'ALL' ? `lớp ${selectedClass}` : 'lớp'} (CSV)</span>
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
                TỔNG SỐ BÀI ĐÃ NỘP {selectedClass !== 'ALL' ? `(LỚP ${selectedClass})` : ''}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {classStats.total} bài
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Chờ chấm tay: {classStats.pending} bài
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">
                ĐIỂM TRUNG BÌNH {selectedClass !== 'ALL' ? `LỚP ${selectedClass}` : 'LỚP'}
              </div>
              <div className="text-3xl font-extrabold text-[#0D6E6E] mt-1">
                {classStats.average} / 10
              </div>
              <div className="text-xs text-slate-500 mt-1">Tính trên các bài đã nộp</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">
                TỈ LỆ ĐẠT (≥ 5,0 ĐIỂM)
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                {classStats.passRatePercent}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Số HS đạt: {classStats.passCount} / {classStats.total} học sinh
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">
                CẢNH BÁO KỸ THUẬT CẦN XEM
              </div>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                {classStats.flaggedCount} bài
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Chỉ để GV xem xét, không tự kết luận gian lận
              </div>
            </div>
          </div>

          {/* Student Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Danh sách bài làm của học sinh ({filteredSubmissions.length})
                  </h3>
                  {selectedClass !== 'ALL' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0D6E6E] text-xs font-extrabold">
                      Lớp {selectedClass}
                    </span>
                  )}
                  {selectedExam && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      Khối {selectedExam.grade || 9}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mỗi học sinh có một <strong>Mã đề cá nhân</strong> và{' '}
                  <strong>Chữ ký đề</strong> riêng biệt (chứng minh không có 2 em nào nhận cùng 1 đề
                  nguyên vẹn).
                </p>
              </div>

              {/* Class Filter Tabs Quick Pills */}
              {availableClassesForExam.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedClass('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedClass === 'ALL'
                        ? 'bg-[#0D6E6E] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({stats.submissions.length})
                  </button>
                  {availableClassesForExam.map((cls) => {
                    const count = stats.submissions.filter((s) => s.className === cls).length;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedClass === cls
                            ? 'bg-[#0D6E6E] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Lớp {cls} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Chưa có học sinh nào {selectedClass !== 'ALL' ? `lớp ${selectedClass}` : ''} nộp bài trong đợt kiểm tra này.
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
                      <th className="p-3.5">
                        <div className="font-bold text-slate-900">Điểm Tự động</div>
                        <div className="text-[10px] font-semibold text-[#0D6E6E]">Trắc nghiệm (App chấm)</div>
                      </th>
                      <th className="p-3.5">
                        <div className="font-bold text-slate-900">Điểm Tự luận</div>
                        <div className="text-[10px] font-semibold text-amber-700">Tự luận (GV chấm)</div>
                      </th>
                      <th className="p-3.5">
                        <div className="font-bold text-slate-900">Tổng điểm</div>
                        <div className="text-[10px] font-semibold text-emerald-700">Thang 10 điểm</div>
                      </th>
                      <th className="p-3.5">Trạng thái</th>
                      <th className="p-3.5">Giám sát thi</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((sub, idx) => (
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
                          <span className="text-sm font-extrabold text-[#0D6E6E]">{sub.autoGradedScore}đ</span>
                        </td>
                        <td className="p-3.5 font-bold text-amber-700">
                          <span className="text-sm font-extrabold text-amber-600">{sub.manualGradedScore}đ</span>
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
                              <FileSignature className="w-3.5 h-3.5" /> Chờ GV chấm tự luận
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
                            <span>{sub.status === 'finalized' ? 'Xem bài làm & Log' : 'Chấm tự luận & Xem Log'}</span>
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

              {/* Score Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-teal-50/70 border border-teal-200 shadow-xs">
                <div className="bg-white p-3.5 rounded-xl border border-teal-100 text-center">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    1. Điểm Tự động (Trắc nghiệm)
                  </div>
                  <div className="text-2xl font-black text-[#0D6E6E] mt-0.5">
                    {activeSubDetail.submission.autoGradedScore ?? 0}đ
                  </div>
                  <div className="text-[11px] text-teal-700 mt-0.5 font-medium">
                    App đã chấm hết các câu trắc nghiệm
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-center">
                  <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    2. Điểm Tự luận (GV chấm)
                  </div>
                  <div className="text-2xl font-black text-amber-600 mt-0.5">
                    {currentManualTotal}đ
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5 font-medium">
                    {hasEssayQuestions ? 'Giáo viên xem & chấm câu tự luận' : 'Đề không có câu tự luận'}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-center">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    3. Tổng điểm bài thi
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-0.5">
                    {Number(
                      (
                        Number(activeSubDetail.submission.autoGradedScore || 0) + currentManualTotal
                      ).toFixed(2)
                    )}{' '}
                    / 10đ
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    = Điểm Tự động + Điểm Tự luận
                  </div>
                </div>
              </div>

              {/* Questions & Manual Grading Controls */}
              <div className="space-y-4">
                {(activeSubDetail.enrichedQuestions || []).map((q: any, idx: number) => {
                  const ans = q.studentAnswer || {};
                  const bq = q.bankQuestion || {};
                  const gState = gradeInputs[q.questionId] || {};
                  const isEssay = q.type === 'essay';

                  return (
                    <div
                      key={q.questionId}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        isEssay
                          ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isEssay
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            Câu {idx + 1} ({
                              q.type === 'mcq'
                                ? 'TRẮC NGHIỆM'
                                : q.type === 'true_false'
                                ? 'ĐÚNG - SAI'
                                : q.type === 'short_answer'
                                ? 'TRẢ LỜI NGẮN'
                                : 'TỰ LUẬN (GV CHẤM)'
                            })
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                             Bài {q.lessonId} • Thời gian làm: {ans.timeSpentSeconds || 0} giây
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isEssay ? (
                            <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                              App tự động chấm
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-md">
                              Giáo viên xem & chấm
                            </span>
                          )}
                          <span className="text-xs font-bold text-[#0D6E6E]">
                            Điểm tối đa: {q.points} điểm
                          </span>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-slate-900">{q.prompt}</p>

                      {/* Display MCQ answer */}
                      {q.type === 'mcq' && (
                        <div className="text-xs space-y-1">
                          <div className="text-slate-600">
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
                            → Điểm tự động: <strong>{ans.autoScore ?? 0}đ</strong>
                          </div>
                        </div>
                      )}

                      {/* Display True/False answer */}
                      {q.type === 'true_false' && (
                        <div className="text-xs space-y-1">
                          <div>
                            Số ý đúng: <strong>{ans.trueFalseCorrectCount ?? 0}/4 ý</strong> → Điểm tự động:{' '}
                            <strong>{ans.autoScore ?? 0}đ</strong>
                          </div>
                        </div>
                      )}

                      {/* Display Short Answer (App auto-grades) */}
                      {q.type === 'short_answer' && (
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="font-bold text-slate-600">Câu trả lời của học sinh: </span>
                            <span className={`font-bold ${ans.isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                              {ans.textAnswer || '(Học sinh bỏ trống)'}
                            </span>
                          </div>
                          <div className="text-slate-600 bg-teal-50/60 p-2 rounded-lg border border-teal-200">
                            <strong>Đáp án chuẩn được chấp nhận:</strong>{' '}
                            {(bq.acceptedAnswers || []).join(' | ') || 'Theo đáp án chuẩn'}
                          </div>
                          <div className="font-semibold text-slate-700 flex items-center justify-between">
                            <span>
                              Đánh giá tự động: {ans.isCorrect ? (
                                <span className="text-emerald-700 font-bold">✓ Đúng chuẩn</span>
                              ) : (
                                <span className="text-red-600 font-bold">✗ Chưa chính xác / Bỏ trống</span>
                              )}
                            </span>
                            <span>
                              → Điểm tự động: <strong className="text-[#0D6E6E] text-sm">{ans.autoScore ?? 0}đ</strong>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Display Essay (Teacher reviews & grades) */}
                      {isEssay && (
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-sm">
                            <div className="text-xs font-bold text-amber-950 mb-1">
                              Bài làm tự luận của học sinh:
                            </div>
                            <div className="whitespace-pre-line font-semibold text-slate-900">
                              {ans.textAnswer || '(Học sinh bỏ trống câu tự luận này)'}
                            </div>
                          </div>

                          <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                            <strong>Hướng dẫn chấm / Đáp án chuẩn:</strong>{' '}
                            {bq.sampleAnswer || q.sampleAnswer || bq.explanation || q.explanation || 'Theo biểu điểm tự luận'}
                          </div>

                          {/* Essay Rubric Steps (0,25đ per step) */}
                          {Array.isArray(bq.rubricSteps || q.rubricSteps) && (bq.rubricSteps || q.rubricSteps).length > 0 && (
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-amber-300">
                              <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                                <span>Tích chọn các bước chấm học sinh làm đúng (mỗi bước 0,25 điểm):</span>
                                <span className="text-xs font-extrabold text-[#0D6E6E]">
                                  Đã chấm: {gState.manualScore ?? 0}/{q.points}đ
                                </span>
                              </div>
                              {(bq.rubricSteps || q.rubricSteps).map((st: any) => {
                                const checked = (gState.checkedRubricStepIds || []).includes(st.id);
                                return (
                                  <label
                                    key={st.id}
                                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-amber-50 cursor-pointer text-xs transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          toggleRubricStep(q.questionId, st.id, bq.rubricSteps || q.rubricSteps)
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
                                placeholder="Ghi nhận xét bước giải, cách trình bày..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                              />
                            </div>
                          </div>
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
                <span>
                  {savingGrade
                    ? 'Đang lưu...'
                    : hasEssayQuestions
                    ? 'Lưu điểm Tự luận & Chốt kết quả'
                    : 'Lưu nhận xét & Chốt kết quả'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

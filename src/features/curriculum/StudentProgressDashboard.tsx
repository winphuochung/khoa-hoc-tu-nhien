import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  Target,
} from 'lucide-react';
import {
  ChapterInfo,
  LessonItem,
  LessonProgressRecord,
} from '../../types/domainTypes';

interface StudentProgressDashboardProps {
  chapters: ChapterInfo[];
  lessons: LessonItem[];
  myProgress: Record<number, LessonProgressRecord>;
  onGoToLesson: (lessonId: number) => void;
}

export const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({
  chapters,
  lessons,
  myProgress,
  onGoToLesson,
}) => {
  const progRecords = Object.values(myProgress);
  const studiedCount = progRecords.filter((p) => p.studied).length;
  const totalAttempted = progRecords.reduce((acc, p) => acc + (p.totalAttempted || 0), 0);
  const totalCorrect = progRecords.reduce((acc, p) => acc + (p.correctCount || 0), 0);
  const accuracyPercent =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Bài còn yếu: đã làm bài tập nhưng tỉ lệ đúng < 70%
  const weakLessons = lessons.filter((les) => {
    const p = myProgress[les.id];
    if (!p || p.totalAttempted === 0) return false;
    const rate = (p.correctCount / p.totalAttempted) * 100;
    return rate < 70;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>SỐ BÀI ĐÃ HỌC</span>
            <BookOpen className="w-4 h-4 text-[#0D6E6E]" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {studiedCount} <span className="text-base font-medium text-slate-400">/ {lessons.length} bài</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0D6E6E] h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.round((studiedCount / Math.max(1, lessons.length)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>SỐ CÂU ĐÃ LUYỆN TẬP</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalAttempted} câu</div>
          <p className="text-xs text-slate-500">Số câu đúng: {totalCorrect} câu</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>TỈ LỆ LÀM ĐÚNG</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-700">{accuracyPercent}%</div>
          <p className="text-xs text-slate-500">
            {accuracyPercent >= 80
              ? 'Mức độ nắm vững tốt!'
              : accuracyPercent >= 50
              ? 'Khá — cần rèn thêm câu vận dụng'
              : 'Hãy luyện tập thêm ở từng bài'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>BÀI CÒN YẾU CẦN ÔN LẠI</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{weakLessons.length} bài</div>
          <p className="text-xs text-slate-500">Các bài có tỉ lệ đúng dưới 70%</p>
        </div>
      </div>

      {/* Weak Lessons Alert Section */}
      {weakLessons.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-900 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Gợi ý các bài còn yếu em cần ôn lại ngay:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weakLessons.map((les) => {
              const p = myProgress[les.id];
              const rate = Math.round((p.correctCount / p.totalAttempted) * 100);
              return (
                <div
                  key={les.id}
                  className="bg-white rounded-xl border border-red-200 p-3.5 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">{les.title}</div>
                    <div className="text-xs text-red-700 font-semibold mt-0.5">
                      Đã làm: {p.correctCount}/{p.totalAttempted} câu đúng ({rate}%)
                    </div>
                  </div>
                  <button
                    onClick={() => onGoToLesson(les.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex-shrink-0"
                  >
                    <span>Ôn lại bài</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Progress Table across 14 Chapters & 51 Lessons */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            Bảng theo dõi tiến độ chi tiết 14 Chương • {lessons.length} Bài học
          </h3>
        </div>
        <div className="divide-y divide-slate-200">
          {chapters.map((chap) => {
            const chapLessons = lessons.filter((l) => l.chapterId === chap.id);
            if (chapLessons.length === 0) return null;
            return (
              <div key={chap.id} className="p-4 sm:p-6 space-y-3">
                <h4 className="font-bold text-sm text-[#0D6E6E] uppercase tracking-wider">
                  {chap.title}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chapLessons.map((les) => {
                    const p = myProgress[les.id];
                    const rate =
                      p && p.totalAttempted > 0
                        ? Math.round((p.correctCount / p.totalAttempted) * 100)
                        : null;
                    return (
                      <div
                        key={les.id}
                        onClick={() => onGoToLesson(les.id)}
                        className="cursor-pointer p-3.5 rounded-xl border border-slate-200 hover:border-teal-600 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 leading-snug">
                            {les.title}
                          </span>
                          {p?.studied ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold flex-shrink-0">
                              Chưa học
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>
                            Số câu đã làm: <strong>{p?.totalAttempted || 0}</strong>
                          </span>
                          {rate !== null && (
                            <span
                              className={`font-bold ${
                                rate >= 70 ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              Đúng: {rate}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

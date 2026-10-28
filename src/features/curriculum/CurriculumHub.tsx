import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Search,
  AlertCircle,
  Lightbulb,
  Target,
  Calculator,
  ChevronRight,
  ChevronLeft,
  Video,
  Play,
  Presentation,
  FlaskConical,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  Home,
  ArrowRight,
  ArrowLeft,
  Flame,
  Zap,
  Compass,
  CheckSquare,
  Square,
  Award,
  Layers,
  Clock,
  UserCheck,
  AlertTriangle,
  FileText,
  Share2,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import {
  ChapterInfo,
  LessonItem,
  LessonProgressRecord,
  SubjectPillar,
  UserRole,
} from '../../types/domainTypes';
import { LessonPracticeSection } from './LessonPracticeSection';
import { LessonEditorModal } from './LessonEditorModal';
import { InteractiveVirtualLab } from './InteractiveVirtualLab';

interface CurriculumHubProps {
  role: UserRole;
  selectedGrade?: number;
  chapters: ChapterInfo[];
  lessons: LessonItem[];
  availableClasses: string[];
  myProgress: Record<number, LessonProgressRecord>;
  selectedLessonId: number;
  onSelectLessonId: (id: number) => void;
  onLessonsChanged: (updatedLesson: LessonItem, isNew?: boolean) => void;
  onProgressUpdated: (updatedMap: Record<number, LessonProgressRecord>) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

const SUBJECT_BADGES: Record<
  SubjectPillar,
  { label: string; colorClass: string; icon: React.ReactNode }
> = {
  mo_dau: {
    label: 'Mở đầu',
    colorClass: 'bg-teal-50 text-teal-800 border-teal-200',
    icon: <FlaskConical className="w-3.5 h-3.5 text-teal-600" />,
  },
  vat_li: {
    label: 'Phân môn Vật lí',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <Zap className="w-3.5 h-3.5 text-blue-600" />,
  },
  hoa_hoc: {
    label: 'Phân môn Hoá học',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: <Flame className="w-3.5 h-3.5 text-purple-600" />,
  },
  sinh_hoc: {
    label: 'Phân môn Sinh học',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <Eye className="w-3.5 h-3.5 text-emerald-600" />,
  },
};

export const CurriculumHub: React.FC<CurriculumHubProps> = ({
  role,
  selectedGrade = 9,
  chapters,
  lessons,
  availableClasses,
  myProgress,
  selectedLessonId,
  onSelectLessonId,
  onLessonsChanged,
  onProgressUpdated,
  onNotify,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | SubjectPillar>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [learningTab, setLearningTab] = useState<'all' | 'theory' | 'video' | 'slides' | 'practice'>('all');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideQuizAnswer, setSlideQuizAnswer] = useState<Record<number, number>>({});
  const [miniQuizSelected, setMiniQuizSelected] = useState<number | null>(null);

  useEffect(() => {
    setCurrentSlideIndex(0);
    setSlideQuizAnswer({});
    setMiniQuizSelected(null);
  }, [selectedLessonId]);

  const currentLesson =
    lessons.find((l) => l.id === selectedLessonId) || lessons[0] || null;
  const currentChapter = chapters.find((c) => c.id === currentLesson?.chapterId);

  const handleMarkStudied = async (lessonId: number, currentVal: boolean) => {
    try {
      const updated = await apiRequest<Record<number, LessonProgressRecord>>(
        `/api/lessons/${lessonId}/progress`,
        {
          method: 'POST',
          body: JSON.stringify({ studied: !currentVal }),
        }
      );
      onProgressUpdated(updated);
      onNotify(
        'success',
        !currentVal
          ? 'Đã đánh dấu hoàn thành đọc hiểu lý thuyết bài học!'
          : 'Đã bỏ đánh dấu hoàn thành bài học.'
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể cập nhật tiến độ.');
    }
  };

  const handleQuickToggleHide = async (lesson: LessonItem) => {
    try {
      const updated = await apiRequest<LessonItem>(`/api/lessons/${lesson.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isHidden: !lesson.isHidden }),
      });
      onLessonsChanged(updated, false);
      onNotify(
        'success',
        updated.isHidden
          ? `Đã ẩn "${updated.title}" đối với học sinh.`
          : `Đã hiển thị "${updated.title}" cho học sinh.`
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Lỗi khi ẩn/hiện bài học.');
    }
  };

  const handleSaveLessonModal = async (data: Partial<LessonItem>, isNew: boolean) => {
    try {
      if (isNew) {
        const created = await apiRequest<LessonItem>('/api/lessons', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        onLessonsChanged(created, true);
        onSelectLessonId(created.id);
        onNotify('success', `Đã thêm bài học mới: ${created.title}`);
      } else if (editingLesson) {
        const updated = await apiRequest<LessonItem>(
          `/api/lessons/${editingLesson.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        );
        onLessonsChanged(updated, false);
        onNotify('success', `Đã lưu cập nhật cho ${updated.title}`);
      }
    } catch (err: any) {
      onNotify('error', err.message || 'Không thể lưu bài học.');
      throw err;
    }
  };

  const filteredChapters = chapters.filter((c) =>
    subjectFilter === 'ALL' ? true : c.subject === subjectFilter
  );

  const matchesSearch = (lesson: LessonItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lesson.title.toLowerCase().includes(q) ||
      lesson.coreConcepts.some((c) => c.toLowerCase().includes(q)) ||
      lesson.formulasAndLaws.some(
        (f) => f.name.toLowerCase().includes(q) || f.formula.toLowerCase().includes(q)
      )
    );
  };

  const currentIdx = lessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx >= 0 && currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  // Calculate chapter completion progress
  const chapterLessons = lessons.filter((l) => l.chapterId === currentLesson?.chapterId);
  const completedInChapter = chapterLessons.filter((l) => myProgress[l.id]?.studied).length;
  const chapterProgressPercent =
    chapterLessons.length > 0
      ? Math.round((completedInChapter / chapterLessons.length) * 100)
      : 0;

  return (
    <div className="relative w-full min-h-screen bg-[#F8F9FF] text-slate-900 pb-16">
      {/* Subtle Ambient Glow Background Orbs from Google Stitch Design System */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 1. BREADCRUMBS NAVIGATION (Stitch Spec) */}
        <nav
          aria-label="Đường dẫn bài học"
          className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap pb-1"
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectLessonId(lessons[0]?.id || 1);
            }}
            className="hover:text-[#0D6E6E] transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Trang chủ</span>
          </a>
          <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
          <span className="text-slate-600 font-medium truncate max-w-[200px]">
            {currentChapter?.title || 'Chủ đề bài học'}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
          <span className="text-[#0D6E6E] font-bold truncate max-w-xs sm:max-w-md">
            {currentLesson?.title || 'Bài học'}
          </span>
        </nav>

        {/* 2. TWO-COLUMN LAYOUT: MAIN 8 COLS (LEFT) + STICKY SIDEBAR 4 COLS (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* PRIMARY LEARNING CONTENT (8 COLS) */}
          <main className="lg:col-span-8 space-y-6">
            {!currentLesson ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                Vui lòng chọn một bài học từ danh sách mục lục.
              </div>
            ) : (
              <>
                {/* HERO HEADER & QUICK ACTIONS CARD (Stitch Spec) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Metadata Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          SUBJECT_BADGES[currentLesson.subject]?.colorClass || ''
                        }`}
                      >
                        {SUBJECT_BADGES[currentLesson.subject]?.icon}
                        <span>{SUBJECT_BADGES[currentLesson.subject]?.label}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {currentChapter?.code || 'Chủ đề'} • Thời lượng: {currentLesson.periods} tiết
                      </span>
                      {role === 'teacher' && (
                        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                          Lớp được xem:{' '}
                          {currentLesson.visibleToClasses?.includes('ALL')
                            ? 'Tất cả các lớp'
                            : currentLesson.visibleToClasses?.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {role === 'teacher' ? (
                        <>
                          <button
                            onClick={() => handleQuickToggleHide(currentLesson)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                              currentLesson.isHidden
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {currentLesson.isHidden ? (
                              <>
                                <Eye className="w-3.5 h-3.5" /> Hiện bài cho HS
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" /> Ẩn bài với HS
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingLesson(currentLesson);
                              setShowEditorModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa bài & Phân quyền</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            handleMarkStudied(
                              currentLesson.id,
                              Boolean(myProgress[currentLesson.id]?.studied)
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            myProgress[currentLesson.id]?.studied
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-300 hover:border-teal-600'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {myProgress[currentLesson.id]?.studied
                              ? 'Đã học xong lý thuyết'
                              : 'Đánh dấu Đã học'}
                          </span>
                        </button>
                      )}

                      <a
                        href="#lesson-practice-section"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Làm bài tập ngay</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#0D6E6E] uppercase tracking-wider">
                      {currentChapter?.title}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 leading-snug">
                      {currentLesson.title}
                    </h1>
                  </div>

                  {currentLesson.reviewNote && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Ghi chú kiểm duyệt chuyên môn:</strong> {currentLesson.reviewNote}
                      </div>
                    </div>
                  )}

                  {/* Mục tiêu YCCĐ */}
                  <div className="bg-teal-50/70 border border-teal-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#0D6E6E]">
                      <Target className="w-4 h-4" />
                      <span>I. Mục tiêu bài học (Yêu cầu cần đạt chuẩn CT GDPT 2018)</span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 pl-5 list-disc leading-relaxed">
                      {currentLesson.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Progress Milestone Bar */}
                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Tiến độ chương này: {completedInChapter}/{chapterLessons.length} bài đã học</span>
                      </span>
                      <span className="font-bold text-[#0D6E6E]">{chapterProgressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-[#0D6E6E] rounded-full transition-all duration-500"
                        style={{ width: `${chapterProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE LEARNING TABS (Stitch Spec) */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5 sticky top-2 z-20">
                  <button
                    onClick={() => setLearningTab('all')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      learningTab === 'all'
                        ? 'bg-[#0D6E6E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>📑 Tất cả nội dung</span>
                  </button>
                  <button
                    onClick={() => setLearningTab('theory')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      learningTab === 'theory'
                        ? 'bg-[#0D6E6E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lý thuyết & Trọng tâm</span>
                  </button>
                  <button
                    onClick={() => setLearningTab('video')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      learningTab === 'video'
                        ? 'bg-[#0D6E6E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Thí nghiệm Ảo & Video</span>
                  </button>
                  <button
                    onClick={() => setLearningTab('slides')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      learningTab === 'slides'
                        ? 'bg-[#0D6E6E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Bài giảng Điện tử</span>
                  </button>
                  <button
                    onClick={() => setLearningTab('practice')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      learningTab === 'practice'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Luyện tập Củng cố</span>
                  </button>
                </div>

                {/* THÍ NGHIỆM ẢO & VIDEO THỰC HÀNH (Stitch Spec) */}
                {(learningTab === 'all' || learningTab === 'video') && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                        <span className="w-8 h-8 rounded-xl bg-[#0D6E6E] text-white text-xs flex items-center justify-center shadow-xs">
                          <FlaskConical className="w-4 h-4" />
                        </span>
                        <div>
                          <span>Phòng Thí nghiệm Ảo Tương tác & Thực nghiệm SGK</span>
                          <p className="text-xs font-normal text-slate-500">
                            Mô phỏng 2D sinh động, quan sát hiện tượng, thao tác đo lường và rút ra kết luận khoa học
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0D6E6E] text-xs font-bold border border-teal-200 flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5" />
                        Thí nghiệm ảo & Thực nghiệm chuẩn
                      </span>
                    </div>

                    <InteractiveVirtualLab
                      lesson={currentLesson}
                      subject={currentLesson.subject}
                      experimentData={
                        currentLesson.experimentVideos && currentLesson.experimentVideos[0]
                          ? currentLesson.experimentVideos[0]
                          : undefined
                      }
                    />
                  </div>
                )}

                {/* SECTION I: KHÁI NIỆM & TRỌNG TÂM KIẾN THỨC (Stitch Spec) */}
                {(learningTab === 'all' || learningTab === 'theory') && (
                  <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0D6E6E] text-white font-bold text-sm shadow-xs">
                        I
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Khái niệm & Trọng tâm Kiến thức</h2>
                        <p className="text-xs text-slate-500">Nền tảng quan trọng nhất bám sát sách giáo khoa Kết nối tri thức</p>
                      </div>
                    </div>

                    {/* Memo Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentLesson.coreConcepts.map((concept, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md transition-shadow"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 text-xs text-[#0D6E6E] font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Trọng tâm 0{idx + 1}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded bg-teal-100 text-[#0D6E6E] text-[10px] font-bold">
                                Bắt buộc nắm
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                              {concept}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Highlight Formula Callout Card (Stitch Spec) */}
                    {currentLesson.formulasAndLaws && currentLesson.formulasAndLaws.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <Calculator className="w-4 h-4 text-[#0D6E6E]" />
                          <span>Quy luật & Công thức Định lượng Cốt lõi:</span>
                        </div>

                        <div className="space-y-3">
                          {currentLesson.formulasAndLaws.map((f, fIdx) => (
                            <div
                              key={fIdx}
                              className="bg-slate-50 border-l-4 border-[#0D6E6E] rounded-r-2xl p-5 border-y border-r border-slate-200/80 space-y-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="font-bold text-sm text-[#0D6E6E]">{f.name}</h4>
                                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                                  Đơn vị: {f.units}
                                </span>
                              </div>

                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                                <span className="font-mono font-bold text-xl sm:text-2xl text-slate-900 tracking-wide">
                                  {f.formula}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed italic">
                                {f.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* SECTION II: VÍ DỤ MINH HỌA & ỨNG DỤNG THỰC TẾ (Stitch Spec) */}
                {(learningTab === 'all' || learningTab === 'theory') && (
                  <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-xs">
                        II
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Ví dụ Minh Họa & Ứng Dụng Thực Tế</h2>
                        <p className="text-xs text-slate-500">Phương pháp giải bài tập mẫu và mối liên hệ thực tiễn đời sống</p>
                      </div>
                    </div>

                    {currentLesson.examples && currentLesson.examples.length > 0 ? (
                      <div className="space-y-4">
                        {currentLesson.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-3"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-xs">
                                <Calculator className="w-3.5 h-3.5" />
                                <span>Ví dụ {exIdx + 1} • Bài tập định lượng</span>
                              </span>
                              <span className="text-xs text-slate-500 font-medium">Bám sát đề thi định kỳ</span>
                            </div>

                            <div className="p-3.5 bg-white rounded-xl border border-amber-200 text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
                              {ex.problem}
                            </div>

                            <div className="p-4 bg-white/80 rounded-xl border border-amber-200/60 space-y-2 text-xs sm:text-sm">
                              <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Hướng dẫn giải chi tiết từng bước:</span>
                              </div>
                              <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                                {ex.solution}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-slate-50 rounded-xl text-slate-500 text-xs">
                        Nội dung ví dụ minh họa đang được biên soạn bám sát bài học.
                      </div>
                    )}
                  </section>
                )}

                {/* SECTION III: SƠ ĐỒ TƯ DUY & GHI NHỚ NHANH (Stitch Spec) */}
                {(learningTab === 'all' || learningTab === 'theory') && (
                  <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-xs">
                          III
                        </span>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Sơ Đồ Tư Duy & Ghi Nhớ 60s</h2>
                          <p className="text-xs text-slate-500">Ôn nhanh kiến thức cốt lõi trước giờ làm bài kiểm tra</p>
                        </div>
                      </div>
                    </div>

                    {/* Mindmap Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center space-y-2">
                          <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            1
                          </span>
                          <h4 className="font-bold text-xs text-slate-900">Bản chất Tự nhiên</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {currentLesson.coreConcepts[0] || 'Quy luật biến đổi vật chất và năng lượng'}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border-2 border-[#0D6E6E] shadow-sm flex flex-col items-center space-y-2 relative">
                          <span className="w-10 h-10 rounded-full bg-teal-50 text-[#0D6E6E] flex items-center justify-center font-bold text-sm">
                            ★
                          </span>
                          <h4 className="font-bold text-xs text-[#0D6E6E]">{currentLesson.title}</h4>
                          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                            {currentLesson.formulasAndLaws[0]?.formula || 'Kiến thức trọng tâm bài học'}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center space-y-2">
                          <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                            3
                          </span>
                          <h4 className="font-bold text-xs text-slate-900">Ứng dụng Thực tiễn</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {currentLesson.quickSummary[0] || 'Vận dụng giải thích các hiện tượng đời sống'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Common Pitfalls & Mistakes Card (Stitch Spec) */}
                    {currentLesson.commonMistakes && currentLesson.commonMistakes.length > 0 && (
                      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                        <div className="font-bold text-rose-900 flex items-center gap-1.5 text-xs sm:text-sm">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Lỗi sai học sinh hay mắc khi làm bài kiểm tra:</span>
                        </div>
                        <ul className="space-y-1.5 pl-5 list-disc text-xs sm:text-sm text-rose-950 leading-relaxed">
                          {currentLesson.commonMistakes.map((mis, mIdx) => (
                            <li key={mIdx}>{mis}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {/* SECTION IV: BÀI GIẢNG ĐIỆN TỬ (SLIDES TƯƠNG TÁC 5 TRANG) */}
                {(learningTab === 'all' || learningTab === 'slides') && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white text-xs flex items-center justify-center shadow-xs">
                          <Presentation className="w-4 h-4" />
                        </span>
                        <div>
                          <span>Bài giảng Điện tử E-Learning (Slides tương tác)</span>
                          <p className="text-xs font-normal text-slate-500">
                            Trình chiếu tương tác 5 phần trọng tâm bám sát SGK Kết nối tri thức
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                        Trang {currentSlideIndex + 1} / {currentLesson.lectureSlides?.length || 5}
                      </span>
                    </div>

                    {currentLesson.lectureSlides && currentLesson.lectureSlides.length > 0 ? (
                      (() => {
                        const slide =
                          currentLesson.lectureSlides[currentSlideIndex] ||
                          currentLesson.lectureSlides[0];
                        const userChoice = slideQuizAnswer[currentSlideIndex];
                        const isAnswered = typeof userChoice === 'number';

                        return (
                          <div className="space-y-5">
                            {/* Slide Canvas */}
                            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 min-h-[380px] flex flex-col justify-between shadow-lg relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                              <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold backdrop-blur-md">
                                    {slide.section}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">
                                    Slide {slide.slideNumber} / {currentLesson.lectureSlides.length}
                                  </span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                                  {slide.title}
                                </h2>

                                <ul className="space-y-2.5 text-sm text-slate-200 pt-2">
                                  {slide.bullets.map((b, bIdx) => (
                                    <li key={bIdx} className="flex items-start gap-2.5 leading-relaxed">
                                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Slide Interactive Question */}
                              <div className="pt-6 relative z-10 space-y-3">
                                {slide.interactiveQuestion && (
                                  <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-400/30 space-y-3">
                                    <div className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                                      <HelpCircle className="w-4 h-4" />
                                      <span>Câu hỏi tương tác: {slide.interactiveQuestion.question}</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {slide.interactiveQuestion.options.map((opt, oIdx) => {
                                        const isSelected = userChoice === oIdx;
                                        const isCorrect = oIdx === slide.interactiveQuestion?.correctIndex;
                                        let btnStyle = 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/15';
                                        if (isAnswered) {
                                          if (isCorrect)
                                            btnStyle = 'bg-emerald-600/80 border-emerald-400 text-white font-bold';
                                          else if (isSelected)
                                            btnStyle = 'bg-rose-600/80 border-rose-400 text-white';
                                        }
                                        return (
                                          <button
                                            key={oIdx}
                                            onClick={() => {
                                              setSlideQuizAnswer((prev) => ({
                                                ...prev,
                                                [currentSlideIndex]: oIdx,
                                              }));
                                            }}
                                            className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between gap-2 ${btnStyle}`}
                                          >
                                            <span>
                                              {['A', 'B', 'C', 'D'][oIdx]}. {opt}
                                            </span>
                                            {isAnswered && isCorrect && (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {isAnswered && (
                                      <div className="text-xs text-slate-300 bg-white/10 p-2.5 rounded-lg border border-white/10">
                                        <strong>Giải thích:</strong> {slide.interactiveQuestion.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Slide Navigation Controls */}
                            <div className="flex items-center justify-between gap-3 pt-1">
                              <button
                                disabled={currentSlideIndex <= 0}
                                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Trang trước</span>
                              </button>

                              <div className="flex items-center gap-1.5">
                                {currentLesson.lectureSlides.map((_, dotIdx) => (
                                  <button
                                    key={dotIdx}
                                    onClick={() => setCurrentSlideIndex(dotIdx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                                      dotIdx === currentSlideIndex
                                        ? 'w-6 bg-indigo-600'
                                        : 'bg-slate-300 hover:bg-slate-400'
                                    }`}
                                  />
                                ))}
                              </div>

                              <button
                                disabled={currentSlideIndex >= currentLesson.lectureSlides.length - 1}
                                onClick={() =>
                                  setCurrentSlideIndex((prev) =>
                                    Math.min(currentLesson.lectureSlides!.length - 1, prev + 1)
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 shadow-xs transition-colors"
                              >
                                <span>Trang tiếp theo</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-500 text-xs">
                        Đang cập nhật slide bài giảng điện tử cho bài học này.
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION V: QUICK-CHECK MINI QUIZ (Stitch Spec) */}
                {(learningTab === 'all' || learningTab === 'theory') && (
                  <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-7 shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Kiểm tra nhanh hiểu bài (1 câu hỏi)</span>
                      </span>
                      <span className="text-xs text-teal-300 font-mono">+10 Điểm hiểu bài</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold leading-snug">
                      Đặc điểm nào sau đây phản ánh chính xác nhất bản chất khoa học của bài học: "{currentLesson.title}"?
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {[
                        `Các đại lượng và quy luật diễn ra tuân thủ nghiêm ngặt nguyên lí bảo toàn và chuyển hoá năng lượng.`,
                        `Hiện tượng diễn ra ngẫu nhiên và không chịu sự chi phối của bất kỳ công thức toán học nào.`,
                        `Chỉ có thể quan sát hiện tượng trong phòng thí nghiệm kín, không xảy ra ngoài thực tế.`,
                        `Không có mối quan hệ phụ thuộc nào giữa các thông số đo lường trong bài học.`,
                      ].map((opt, oIdx) => {
                        const isChosen = miniQuizSelected === oIdx;
                        const isCorrect = oIdx === 0;
                        let btnCls = 'bg-white/10 border-white/15 hover:bg-white/20 text-slate-200';
                        if (miniQuizSelected !== null) {
                          if (isCorrect) btnCls = 'bg-emerald-600 border-emerald-400 text-white font-bold';
                          else if (isChosen) btnCls = 'bg-rose-600 border-rose-400 text-white';
                        }
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setMiniQuizSelected(oIdx)}
                            className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-start gap-2.5 ${btnCls}`}
                          >
                            <span className="font-bold flex-shrink-0">{['A', 'B', 'C', 'D'][oIdx]}.</span>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {miniQuizSelected !== null && (
                      <div className="p-3 rounded-xl bg-white/10 text-xs text-teal-100 flex items-center justify-between">
                        <span>
                          {miniQuizSelected === 0
                            ? '🎉 Chính xác! Bạn đã nắm vững bản chất cốt lõi của bài học.'
                            : '💡 Chưa chính xác! Hãy đọc lại phần Khái niệm & Trọng tâm ở trên nhé.'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION VI: PHẦN BÀI TẬP LUYỆN TẬP (Stitch Spec) */}
                <div id="lesson-practice-section">
                  <LessonPracticeSection
                    lessonId={currentLesson.id}
                    lessonTitle={currentLesson.title}
                    onJumpToKnowledgeSection={(sec) => {
                      setLearningTab('theory');
                    }}
                    onProgressUpdated={onProgressUpdated}
                    onNotify={onNotify}
                  />
                </div>

                {/* SECTION VII: BOTTOM NAVIGATION TOOLBAR: PREV / QUIZ / NEXT (Stitch Spec) */}
                <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Previous Lesson Button */}
                    {prevLesson ? (
                      <button
                        onClick={() => onSelectLessonId(prevLesson.id)}
                        className="w-full md:w-auto inline-flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors group text-left border border-slate-200/60"
                      >
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            BÀI TRƯỚC
                          </span>
                          <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[180px]">
                            {prevLesson.title}
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full md:w-auto text-xs text-slate-400 italic text-center md:text-left">
                        (Đang ở bài đầu tiên)
                      </div>
                    )}

                    {/* Center Massive CTA Button (Stitch Spec) */}
                    <div className="w-full md:w-auto flex-1 max-w-sm">
                      <a
                        href="#lesson-practice-section"
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 text-center font-bold text-xs sm:text-sm"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>LUYỆN TẬP BÀI NÀY NGAY</span>
                      </a>
                    </div>

                    {/* Next Lesson Button */}
                    {nextLesson ? (
                      <button
                        onClick={() => onSelectLessonId(nextLesson.id)}
                        className="w-full md:w-auto inline-flex items-center justify-center md:justify-end gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors group text-right border border-slate-200/60"
                      >
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            BÀI TIẾP THEO
                          </span>
                          <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[180px]">
                            {nextLesson.title}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div className="w-full md:w-auto text-xs text-slate-400 italic text-center md:text-right">
                        (Đã đến bài cuối cùng)
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </main>

          {/* STICKY QUICK-NAV & LEARNING SIDEBAR (4 COLS - RIGHT COLUMN IN STITCH SPEC) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 max-h-[85vh] flex flex-col">
            {/* Table of Contents & Curriculum Tree */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0D6E6E]" />
                    <span>Mục Lục Bài Học</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {chapters.length} Chương • {lessons.length} Bài (Khối {selectedGrade})
                  </p>
                </div>
                {role === 'teacher' && (
                  <button
                    onClick={() => {
                      setEditingLesson(null);
                      setShowEditorModal(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D6E6E] text-white text-[11px] font-bold hover:bg-teal-800"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm</span>
                  </button>
                )}
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên bài, công thức..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              {/* Subject Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'vat_li', label: 'Vật lí' },
                    { id: 'hoa_hoc', label: 'Hoá học' },
                    { id: 'sinh_hoc', label: 'Sinh học' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSubjectFilter(f.id)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                      subjectFilter === f.id
                        ? 'bg-[#0D6E6E] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Chapter & Lesson Tree Scrollable */}
              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 text-xs">
                {filteredChapters.map((chap) => {
                  const chapLessons = lessons.filter(
                    (l) => l.chapterId === chap.id && matchesSearch(l)
                  );
                  if (chapLessons.length === 0) return null;

                  return (
                    <div
                      key={chap.id}
                      className="rounded-xl border border-slate-200/80 overflow-hidden"
                    >
                      <div className="bg-slate-100/90 px-3 py-1.5 text-[11px] font-bold text-slate-800">
                        {chap.title}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {chapLessons.map((les) => {
                          const isSelected = currentLesson?.id === les.id;
                          const prog = myProgress[les.id];
                          const isDone = prog?.studied;

                          return (
                            <button
                              key={les.id}
                              onClick={() => onSelectLessonId(les.id)}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors ${
                                isSelected
                                  ? 'bg-teal-50 text-[#0D6E6E] font-bold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="leading-snug line-clamp-1 flex-1">
                                {les.title}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {les.isHidden && (
                                  <span className="px-1 py-0.2 rounded bg-red-100 text-red-700 text-[9px] font-bold">
                                    Ẩn
                                  </span>
                                )}
                                {isDone && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verified Curriculum & Pedagogical Note (Stitch Spec) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-[#0D6E6E]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Chuẩn GDPT 2018</p>
                  <p className="text-[11px] text-slate-500">Bộ sách Kết nối tri thức với cuộc sống</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                “Nắm vững định nghĩa, viết đúng phương trình hoá học và đổi đơn vị vật lí chuẩn (A, V, Ω, J) trước khi tính toán.”
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Editor Modal for Teacher */}
      {showEditorModal && (
        <LessonEditorModal
          lesson={editingLesson}
          chapters={chapters}
          availableClasses={availableClasses}
          onClose={() => setShowEditorModal(false)}
          onSave={handleSaveLessonModal}
        />
      )}
    </div>
  );
};

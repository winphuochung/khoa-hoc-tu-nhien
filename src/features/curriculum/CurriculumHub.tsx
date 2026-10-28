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
  FileWarning,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  Video,
  Play,
  Presentation,
  FlaskConical,
  ShieldAlert,
  Sparkles,
  HelpCircle,
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
  { label: string; colorClass: string }
> = {
  mo_dau: {
    label: 'Mở đầu',
    colorClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  vat_li: {
    label: 'Phân môn Vật lí',
    colorClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  hoa_hoc: {
    label: 'Phân môn Hoá học',
    colorClass: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  sinh_hoc: {
    label: 'Phân môn Sinh học',
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
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
  const [highlightSection, setHighlightSection] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [learningTab, setLearningTab] = useState<'all' | 'theory' | 'video' | 'slides' | 'practice'>('all');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideQuizAnswer, setSlideQuizAnswer] = useState<Record<number, number>>({});

  useEffect(() => {
    setCurrentSlideIndex(0);
    setSlideQuizAnswer({});
  }, [selectedLessonId]);

  const sectionRefs = {
    coreConcepts: useRef<HTMLDivElement>(null),
    formulasAndLaws: useRef<HTMLDivElement>(null),
    examples: useRef<HTMLDivElement>(null),
    commonMistakes: useRef<HTMLDivElement>(null),
    quickSummary: useRef<HTMLDivElement>(null),
  };

  const currentLesson =
    lessons.find((l) => l.id === selectedLessonId) || lessons[0] || null;
  const currentChapter = chapters.find((c) => c.id === currentLesson?.chapterId);

  const handleJumpToSection = (
    sectionKey: 'coreConcepts' | 'formulasAndLaws' | 'examples' | 'commonMistakes' | 'quickSummary'
  ) => {
    const targetRef = sectionRefs[sectionKey]?.current;
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightSection(sectionKey);
      setTimeout(() => setHighlightSection(null), 3000);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR: 14 Chapters & 51 Lessons */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 lg:sticky lg:top-28 max-h-[82vh] flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-base text-slate-900">
                Mục lục {chapters.length} Chương • {lessons.length} Bài
              </h2>
              <p className="text-xs text-slate-500">
                SGK KHTN {selectedGrade} — Kết nối tri thức với cuộc sống
              </p>
            </div>
            {role === 'teacher' && (
              <button
                onClick={() => {
                  setEditingLesson(null);
                  setShowEditorModal(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0D6E6E] text-white text-xs font-bold hover:bg-teal-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm bài</span>
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên bài, công thức (Ohm, Mendel, alkane...)"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'ALL', label: 'Tất cả (51)' },
                { id: 'mo_dau', label: 'Mở đầu (1)' },
                { id: 'vat_li', label: 'Vật lí (16)' },
                { id: 'hoa_hoc', label: 'Hoá học (18)' },
                { id: 'sinh_hoc', label: 'Sinh học (16)' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setSubjectFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  subjectFilter === f.id
                    ? 'bg-[#0D6E6E] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Chapter & Lesson Tree */}
          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            {filteredChapters.map((chap) => {
              const chapLessons = lessons.filter(
                (l) => l.chapterId === chap.id && matchesSearch(l)
              );
              if (chapLessons.length === 0) return null;

              return (
                <div
                  key={chap.id}
                  className="rounded-xl border border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-100/80 px-3 py-2 text-xs font-bold text-slate-800">
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
                          className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between gap-2 transition-colors ${
                            isSelected
                              ? 'bg-teal-50/90 text-[#0D6E6E] font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="leading-snug line-clamp-2 flex-1">
                            {les.title}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {les.isHidden && (
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                                Đang ẩn
                              </span>
                            )}
                            {isDone && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
        </aside>

        {/* RIGHT MAIN CONTENT: Lesson Knowledge Page + Practice */}
        <main className="lg:col-span-8 space-y-6">
          {!currentLesson ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
              Vui lòng chọn một bài học từ danh sách bên trái.
            </div>
          ) : (
            <>
              {/* Hero Header of Lesson */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        SUBJECT_BADGES[currentLesson.subject]?.colorClass || ''
                      }`}
                    >
                      {SUBJECT_BADGES[currentLesson.subject]?.label}
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
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            currentLesson.isHidden
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {currentLesson.isHidden ? (
                            <>
                              <Eye className="w-4 h-4" /> Hiện bài cho HS
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" /> Ẩn bài với HS
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingLesson(currentLesson);
                            setShowEditorModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D6E6E] hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Sửa bài & Phân quyền lớp</span>
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
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          myProgress[currentLesson.id]?.studied
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-teal-600'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {myProgress[currentLesson.id]?.studied
                            ? 'Đã học xong lý thuyết'
                            : 'Đánh dấu Đã học bài này'}
                        </span>
                      </button>
                    )}

                    <a
                      href="#lesson-practice-section"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Làm bài tập ngay</span>
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#0D6E6E] uppercase tracking-wider">
                    {currentChapter?.title}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
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

                {/* 1. MỤC TIÊU BÀI HỌC (YÊU CẦU CẦN ĐẠT) */}
                <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0D6E6E]">
                    <Target className="w-4 h-4" />
                    <span>I. Mục tiêu bài học (Yêu cầu cần đạt theo CT GDPT 2018)</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-800 pl-5 list-disc">
                    {currentLesson.objectives.map((obj, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* INTERACTIVE LEARNING TABS */}
              <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-1.5 sticky top-2 z-20 shadow-xs">
                <button
                  onClick={() => setLearningTab('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    learningTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>📑 Tất cả nội dung</span>
                </button>
                <button
                  onClick={() => setLearningTab('theory')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    learningTab === 'theory'
                      ? 'bg-white text-[#0D6E6E] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lý thuyết SGK & Công thức</span>
                </button>
                <button
                  onClick={() => setLearningTab('video')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    learningTab === 'video'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                  <span>Thí nghiệm Ảo & Video Thực hành</span>
                </button>
                <button
                  onClick={() => setLearningTab('slides')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    learningTab === 'slides'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Presentation className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Bài giảng Điện tử (Slides)</span>
                </button>
                <button
                  onClick={() => setLearningTab('practice')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    learningTab === 'practice'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Luyện tập Củng cố</span>
                </button>
              </div>

              {/* 2. THÍ NGHIỆM ẢO & VIDEO THỰC HÀNH */}
              {(learningTab === 'all' || learningTab === 'video') && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
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

              {/* 3. BÀI GIẢNG ĐIỆN TỬ (SLIDES TƯƠNG TÁC) */}
              {(learningTab === 'all' || learningTab === 'slides') && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                      <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white text-xs flex items-center justify-center shadow-xs">
                        <Presentation className="w-4 h-4" />
                      </span>
                      <div>
                        <span>Bài giảng Điện tử (E-Learning Slides)</span>
                        <p className="text-xs font-normal text-slate-500">
                          Trình chiếu tương tác từng phần trọng tâm của bài học
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                        Slide {currentSlideIndex + 1} / {currentLesson.lectureSlides?.length || 5}
                      </span>
                    </div>
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
                          {/* Slide Screen Canvas */}
                          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 min-h-[380px] flex flex-col justify-between shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="space-y-4 relative z-10">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold backdrop-blur-md">
                                  {slide.section}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  Trang {slide.slideNumber} / {currentLesson.lectureSlides.length}
                                </span>
                              </div>

                              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                                {slide.title}
                              </h2>

                              <ul className="space-y-2.5 text-sm sm:text-base text-slate-200 pt-2">
                                {slide.bullets.map((b, bIdx) => (
                                  <li key={bIdx} className="flex items-start gap-2.5 leading-relaxed">
                                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Bottom Key takeaway or Interactive question */}
                            <div className="pt-6 relative z-10 space-y-3">
                              {slide.keyTakeaway && (
                                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-2.5 text-xs sm:text-sm text-indigo-100">
                                  <Lightbulb className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <strong>Điểm cốt lõi:</strong> {slide.keyTakeaway}
                                  </div>
                                </div>
                              )}

                              {/* Interactive Question on Slide */}
                              {slide.interactiveQuestion && (
                                <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-400/30 space-y-3">
                                  <div className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                                    <HelpCircle className="w-4 h-4" />
                                    <span>Câu hỏi tương tác nhanh: {slide.interactiveQuestion.question}</span>
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

                          {/* Slide Controller Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <button
                              disabled={currentSlideIndex <= 0}
                              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Trang trước</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              {currentLesson.lectureSlides.map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  onClick={() => setCurrentSlideIndex(dotIdx)}
                                  className={`h-2.5 rounded-full transition-all ${
                                    currentSlideIndex === dotIdx
                                      ? 'w-8 bg-indigo-600'
                                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                                  }`}
                                  title={`Slide ${dotIdx + 1}`}
                                />
                              ))}
                            </div>

                            <button
                              disabled={
                                currentSlideIndex >= currentLesson.lectureSlides.length - 1
                              }
                              onClick={() =>
                                setCurrentSlideIndex((prev) =>
                                  Math.min(currentLesson.lectureSlides!.length - 1, prev + 1)
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs"
                            >
                              <span>Trang sau</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-500 text-xs">
                      Đang cập nhật slide bài giảng cho bài học này.
                    </div>
                  )}
                </div>
              )}

              {/* 4. LÝ THUYẾT SGK & CÔNG THỨC */}
              {(learningTab === 'all' || learningTab === 'theory') && (
                <>
                  {/* KHÁI NIỆM TRỌNG TÂM */}
                  <div
                    ref={sectionRefs.coreConcepts}
                    className={`bg-white rounded-2xl border p-6 shadow-sm space-y-3 transition-all ${
                      highlightSection === 'coreConcepts'
                        ? 'border-amber-500 ring-4 ring-amber-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                      <span className="w-7 h-7 rounded-lg bg-[#0D6E6E] text-white text-xs flex items-center justify-center">
                        II
                      </span>
                      <span>Khái niệm trọng tâm (SGK Kết nối tri thức)</span>
                    </div>
                    <div className="space-y-2.5">
                      {currentLesson.coreConcepts.map((concept, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed"
                        >
                          {concept}
                        </div>
                      ))}
                    </div>
                  </div>

              {/* 3. CÔNG THỨC VÀ QUY LUẬT CHÍNH */}
              <div
                ref={sectionRefs.formulasAndLaws}
                className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-all ${
                  highlightSection === 'formulasAndLaws'
                    ? 'border-amber-500 ring-4 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                  <span className="w-7 h-7 rounded-lg bg-[#0D6E6E] text-white text-xs flex items-center justify-center">
                    III
                  </span>
                  <Calculator className="w-5 h-5 text-[#0D6E6E]" />
                  <span>Công thức và Quy luật chính (Ký hiệu chuẩn)</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentLesson.formulasAndLaws.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border-l-4 border-[#0D6E6E] border border-slate-200 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#0D6E6E]">{f.name}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900">
                          {f.units}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-teal-200 font-bold text-base sm:text-lg text-slate-900 tracking-wide">
                        {f.formula}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. VÍ DỤ MINH HOẠ NGẮN */}
              <div
                ref={sectionRefs.examples}
                className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-all ${
                  highlightSection === 'examples'
                    ? 'border-amber-500 ring-4 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                  <span className="w-7 h-7 rounded-lg bg-[#0D6E6E] text-white text-xs flex items-center justify-center">
                    IV
                  </span>
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <span>Ví dụ minh hoạ ngắn</span>
                </div>
                <div className="space-y-3">
                  {currentLesson.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2"
                    >
                      <p className="text-sm font-bold text-slate-900">
                        Bài toán / Tình huống {idx + 1}: {ex.problem}
                      </p>
                      <div className="text-sm text-slate-800 bg-white p-3 rounded-xl border border-amber-200/80 leading-relaxed">
                        <strong className="text-[#0D6E6E]">Hướng dẫn giải: </strong>
                        {ex.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. LỖI SAI HỌC SINH THƯỜNG GẶP & 6. GHI NHỚ NHANH */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  ref={sectionRefs.commonMistakes}
                  className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition-all ${
                    highlightSection === 'commonMistakes'
                      ? 'border-amber-500 ring-4 ring-amber-200'
                      : 'border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-base font-bold text-red-800">
                    <FileWarning className="w-5 h-5 text-red-600" />
                    <span>V. Lỗi sai học sinh thường gặp</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-800 list-disc pl-5">
                    {currentLesson.commonMistakes.map((m, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  ref={sectionRefs.quickSummary}
                  className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition-all ${
                    highlightSection === 'quickSummary'
                      ? 'border-amber-500 ring-4 ring-amber-200'
                      : 'border-teal-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-base font-bold text-[#0D6E6E]">
                    <BookmarkCheck className="w-5 h-5 text-[#0D6E6E]" />
                    <span>VI. Ghi nhớ nhanh (Trọng tâm ôn thi)</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-800 list-disc pl-5">
                    {currentLesson.quickSummary.map((s, idx) => (
                      <li key={idx} className="leading-relaxed font-medium">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* 5. BÀI TẬP LUYỆN TẬP TỪNG BÀI (3 MỨC ĐỘ: BIẾT - HIỂU - VẬN DỤNG) */}
          {(learningTab === 'all' || learningTab === 'practice') && (
            <div id="lesson-practice-section">
              <LessonPracticeSection
                lessonId={currentLesson.id}
                lessonTitle={currentLesson.title}
                onJumpToKnowledgeSection={handleJumpToSection}
                onProgressUpdated={onProgressUpdated}
                onNotify={onNotify}
              />
            </div>
          )}

              {/* Prev / Next Lesson Navigation */}
              <div className="flex items-center justify-between gap-4 pt-2">
                {prevLesson ? (
                  <button
                    onClick={() => onSelectLessonId(prevLesson.id)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-600 text-left text-xs font-bold text-slate-700 shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#0D6E6E] flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Bài trước</div>
                      <div className="line-clamp-1">{prevLesson.title}</div>
                    </div>
                  </button>
                ) : (
                  <div />
                )}
                {nextLesson && (
                  <button
                    onClick={() => onSelectLessonId(nextLesson.id)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-600 text-right text-xs font-bold text-slate-700 shadow-xs"
                  >
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Bài tiếp theo</div>
                      <div className="line-clamp-1">{nextLesson.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#0D6E6E] flex-shrink-0" />
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </div>

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

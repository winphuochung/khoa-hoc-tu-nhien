export type UserRole = 'teacher' | 'student';

export interface SchoolConfig {
  schoolName: string;
  teacherName: string;
  schoolYear: string;
  classes: string[];
  antiCheatMaxViolations: number;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  className?: string; // e.g., '9A1', '9A2' for students
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubjectPillar = 'mo_dau' | 'vat_li' | 'hoa_hoc' | 'sinh_hoc';

export interface ChapterInfo {
  id: string;
  grade?: number; // 6, 7, 8, 9
  number: number; // 0 for Mở đầu, 1..14 for Chương I..XIV
  code: string; // e.g., "Mở đầu", "Chương I", ..., "Chương XIV"
  title: string;
  subject: SubjectPillar;
  lessonIds: number[];
}

export interface LessonFormula {
  name: string;
  formula: string; // Standard scientific notation e.g., "Wđ = ½mv²"
  units: string;
  description: string;
}

export interface LessonExample {
  problem: string;
  solution: string;
}

export interface ExperimentVideo {
  title: string;
  youtubeId?: string; // YouTube video ID or embed URL
  videoUrl?: string; // MP4 / simulation URL
  description: string;
  steps?: string[]; // Các bước tiến hành thí nghiệm
  phenomenon?: string; // Hiện tượng quan sát được
  conclusion?: string; // Kết luận khoa học rút ra
  safetyNotes?: string; // Lưu ý an toàn khi làm thí nghiệm
}

export interface LectureSlide {
  slideNumber: number;
  title: string;
  section: string; // "Khởi động" | "Hình thành kiến thức" | "Thí nghiệm & Khám phá" | "Luyện tập & Câu hỏi nhanh" | "Vận dụng & Ghi nhớ"
  bullets: string[];
  keyTakeaway?: string;
  interactiveQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface LessonItem {
  id: number; // Unique identifier across grades
  grade?: number; // 6, 7, 8, 9 (defaults to 9 if undefined)
  chapterId: string;
  lessonNumber: number; // 1..N in textbook
  title: string;
  subject: SubjectPillar;
  periods: number; // Số tiết gợi ý theo PPCT
  objectives: string[]; // Mục tiêu bài học / Yêu cầu cần đạt
  coreConcepts: string[]; // Khái niệm trọng tâm
  formulasAndLaws: LessonFormula[]; // Công thức và quy luật chính
  examples: LessonExample[]; // Ví dụ minh hoạ ngắn
  commonMistakes: string[]; // Lỗi sai học sinh thường gặp
  quickSummary: string[]; // Phần ghi nhớ nhanh
  experimentVideos?: ExperimentVideo[]; // Video thí nghiệm & thí nghiệm ảo
  lectureSlides?: LectureSlide[]; // Bài giảng điện tử (slides tương tác)
  reviewNote?: string; // Ghi chú "Cần giáo viên duyệt" nếu có thông số thực hành/mở rộng
  isHidden: boolean; // Giáo viên có thể ẩn/hiện bài
  visibleToClasses: string[]; // Danh sách lớp được phép xem (rỗng hoặc ['ALL'] là tất cả lớp)
  updatedAt: string;
}

export type CognitiveLevel = 'biet' | 'hieu' | 'van_dung';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay';

export interface TrueFalseStatement {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  isTrue: boolean;
  explanation?: string;
}

export interface EssayRubricStep {
  id: string;
  description: string;
  points: number; // e.g., 0.25
}

export interface QuestionItem {
  id: string;
  grade?: number; // 6, 7, 8, 9
  chapterId: string;
  lessonId: number;
  type: QuestionType;
  level: CognitiveLevel;
  indicator: string; // Chỉ báo YCCĐ e.g., "NT1", "HH1.1", "VL1.2", "VD1"
  requirementText: string; // Nội dung yêu cầu cần đạt dùng cho Bản đặc tả
  prompt: string; // Nội dung câu hỏi
  // For MCQ:
  options?: string[]; // 4 phương án A, B, C, D
  correctOptionIndex?: number; // 0, 1, 2, 3
  // For True/False (4 ý a, b, c, d):
  statements?: TrueFalseStatement[];
  // For Short Answer:
  acceptedAnswers?: string[]; // Danh sách đáp án chấp nhận (không phân biệt hoa/thường)
  // For Essay:
  sampleAnswer?: string;
  rubricSteps?: EssayRubricStep[]; // Chia nhỏ theo bước 0,25 điểm
  // General:
  points: number; // Điểm mặc định (0.25 cho MCQ, 1.0 cho Đ-S, 0.5 cho TLN, 1.0 cho Tự luận, hoặc 1.0 cho KT 15p)
  explanation: string; // Lời giải ngắn gọn
  knowledgeSectionRef: 'coreConcepts' | 'formulasAndLaws' | 'examples' | 'commonMistakes' | 'quickSummary';
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgressRecord {
  lessonId: number;
  studied: boolean;
  studiedAt?: string;
  totalAttempted: number;
  correctCount: number;
  lastPracticedAt?: string;
}

export type ExamCategory = 'regular' | '15min' | 'midterm' | 'final';

export interface MatrixRow {
  tt: number;
  rowIndex?: number;
  chapterId: string;
  chapterTitle: string;
  lessonId: number;
  lessonTitle: string;
  periods: number;
  periodsPercent?: number;
  counts: {
    mcq: { biet: number; hieu: number; van_dung: number };
    true_false: { biet: number; hieu: number; van_dung: number };
    short_answer: { biet: number; hieu: number; van_dung: number };
    essay: { biet: number; hieu: number; van_dung: number };
  };
  totalByLevel?: {
    biet: number;
    hieu: number;
    van_dung: number;
  };
  totalCommands: number;
  totalPoints: number;
  percentScore: number;
}

export interface SpecificationRow {
  tt: number;
  rowIndex?: number;
  chapterId?: string;
  chapterTitle: string;
  lessonId: number;
  lessonTitle: string;
  periods?: number;
  periodsPercent?: number;
  requirementsByLevel: {
    biet: string[];
    hieu: string[];
    van_dung: string[];
  };
  indicators: string[];
  questionPositions: {
    mcq: { biet: string[]; hieu: string[]; van_dung: string[] };
    true_false: { biet: string[]; hieu: string[]; van_dung: string[] };
    short_answer: { biet: string[]; hieu: string[]; van_dung: string[] };
    essay: { biet: string[]; hieu: string[]; van_dung: string[] };
  };
  specCells?: {
    mcq: { biet: string; hieu: string; van_dung: string };
    true_false: { biet: string; hieu: string; van_dung: string };
    short_answer: { biet: string; hieu: string; van_dung: string };
    essay: { biet: string; hieu: string; van_dung: string };
  };
  counts?: {
    mcq: { biet: number; hieu: number; van_dung: number };
    true_false: { biet: number; hieu: number; van_dung: number };
    short_answer: { biet: number; hieu: number; van_dung: number };
    essay: { biet: number; hieu: number; van_dung: number };
  };
}

export interface ExamPaperVariant {
  paperCode: string; // e.g., "01", "02"
  questionIds: string[];
  // Shuffled mapping for printable paper variants
  optionOrders?: Record<string, number[]>;
}

export interface ExamDefinition {
  id: string;
  grade?: number; // 6, 7, 8, 9
  title: string;
  category: ExamCategory;
  schoolYear: string;
  durationMinutes: number; // e.g. 15, 90
  totalPoints: number; // 10
  assignedClasses: string[]; // ['9A1', '9A2']
  lessonScope: number[]; // Danh sách bài học trong phạm vi
  questionIds: string[]; // Tập câu hỏi gốc hoặc ngân hàng câu hỏi của đợt thi
  paperVariants: ExamPaperVariant[]; // Tối thiểu 2 mã đề tương đương ("01", "02", ...)
  matrixRows: MatrixRow[];
  specificationRows: SpecificationRow[];
  allowReview: boolean; // Giáo viên mở xem kết quả & đáp án cho học sinh
  isOpen: boolean; // Đang mở cho học sinh vào thi
  maxTabViolations: number; // Ngưỡng rời tab/cửa sổ tự nộp bài
  createdAt: string;
  updatedAt: string;
}

export interface StudentPaperQuestion {
  questionId: string;
  orderIndex: number;
  type: QuestionType;
  level: CognitiveLevel;
  lessonId: number;
  points: number;
  prompt: string;
  // Shuffled options for MCQ:
  shuffledOptions?: string[];
  originalOptionIndices?: number[]; // Maps shuffled index -> original index
  // Statements for True/False:
  statements?: Array<{
    id: 'a' | 'b' | 'c' | 'd';
    text: string;
  }>;
  rubricSteps?: Array<{
    id: string;
    description: string;
    points: number;
  }>;
}

export interface ActivityLogEntry {
  timestamp: string;
  eventType:
    | 'exam_start'
    | 'answer_change'
    | 'tab_blur'
    | 'fullscreen_exit'
    | 'copy_paste_blocked'
    | 'contextmenu_blocked'
    | 'auto_submit_timeout'
    | 'auto_submit_violation'
    | 'manual_submit';
  detail: string;
  questionId?: string;
  timeSpentSeconds?: number;
}

export interface QuestionSubmissionDetail {
  questionId: string;
  type: QuestionType;
  maxPoints: number;
  // Student's answer:
  selectedShuffledIndex?: number; // For MCQ
  selectedOriginalIndex?: number; // Mapped back to original option index
  trueFalseAnswers?: Record<'a' | 'b' | 'c' | 'd', boolean | null>;
  textAnswer?: string; // For short_answer & essay
  // Grading:
  autoScore: number;
  manualScore?: number;
  finalScore: number;
  isCorrect?: boolean;
  trueFalseCorrectCount?: number;
  needsManualGrading: boolean;
  gradedByTeacher: boolean;
  checkedRubricStepIds?: string[];
  teacherComment?: string;
  timeSpentSeconds: number;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  className: string;
  paperCode: string; // Mã đề cá nhân hoá cho HS (e.g., "MĐ-9A1-01-A8F")
  paperSignature: string; // Hash/chữ ký chứng minh đề khác nhau
  paperSnapshot: StudentPaperQuestion[];
  answers: Record<string, QuestionSubmissionDetail>;
  status: 'in_progress' | 'submitted_pending_grading' | 'finalized';
  startedAt: string;
  submittedAt?: string;
  finalizedAt?: string;
  autoGradedScore: number;
  manualGradedScore: number;
  totalScore: number;
  teacherOverallFeedback?: string;
  violationCount: number;
  flaggedForReview: boolean;
  flagReason?: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
  };
  activityLogs: ActivityLogEntry[];
}

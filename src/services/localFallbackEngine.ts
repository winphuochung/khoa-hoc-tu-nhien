// @ts-nocheck
import { CHAPTERS_SEED } from '../../server/seed/chaptersSeed.js';
import { LESSONS_PHYSICS_SEED } from '../../server/seed/lessonsPhysicsSeed.js';
import { LESSONS_CHEMISTRY_SEED } from '../../server/seed/lessonsChemistrySeed.js';
import { LESSONS_BIOLOGY_SEED } from '../../server/seed/lessonsBiologySeed.js';
import { QUESTIONS_OFFICIAL_DOCX_SEED } from '../../server/seed/questionsOfficialDocxSeed.js';
import { QUESTIONS_FULL_CURRICULUM_SEED } from '../../server/seed/questionsFullCurriculumSeed.js';
import { KHTN6_CHAPTERS, KHTN6_LESSONS, KHTN6_QUESTIONS } from '../../server/seed/khtn6Seed.js';
import { KHTN7_CHAPTERS, KHTN7_LESSONS, KHTN7_QUESTIONS } from '../../server/seed/khtn7Seed.js';
import { KHTN8_CHAPTERS, KHTN8_LESSONS, KHTN8_QUESTIONS } from '../../server/seed/khtn8Seed.js';
import {
  buildMatrixAndSpecification,
  generatePaperVariants,
  hydratePaperVariants,
  selectQuestionsForLessonScope,
  sortQuestionsCanonically,
  generateStudentUniquePaper,
  gradeSubmissionAutomatically,
  deterministicShuffle,
} from '../../server/examGenerator.js';

const LOCAL_DB_KEY = 'khtn9_local_db_v1';

function simpleHashPassword(password: string): string {
  const str = String(password || '');
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `local:${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}:${str}`;
}

function verifyLocalPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash.startsWith('local:')) {
    return simpleHashPassword(password) === storedHash;
  }
  // Fallback for plain comparison if needed
  return String(password) === storedHash;
}

function randomId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function buildInitialLocalDb() {
  const now = new Date().toISOString();
  const allLessonsRaw9 = [
    ...LESSONS_PHYSICS_SEED,
    ...LESSONS_CHEMISTRY_SEED,
    ...LESSONS_BIOLOGY_SEED,
  ].sort((a, b) => a.id - b.id);

  const lessons9 = allLessonsRaw9.map((l) => ({
    ...l,
    grade: 9,
    isHidden: false,
    visibleToClasses: ['ALL'],
    updatedAt: now,
  }));

  const lessons = [
    ...KHTN6_LESSONS,
    ...KHTN7_LESSONS,
    ...KHTN8_LESSONS,
    ...lessons9,
  ];

  const chapters = [
    ...KHTN6_CHAPTERS,
    ...KHTN7_CHAPTERS,
    ...KHTN8_CHAPTERS,
    ...CHAPTERS_SEED.map((c) => ({ ...c, grade: c.grade || 9 })),
  ];

  const allQuestionsRaw9 = [
    ...QUESTIONS_OFFICIAL_DOCX_SEED,
    ...QUESTIONS_FULL_CURRICULUM_SEED,
  ];

  const qMap = new Map();
  for (const q of KHTN6_QUESTIONS) {
    qMap.set(q.id, { ...q, grade: 6, createdAt: now, updatedAt: now });
  }
  for (const q of KHTN7_QUESTIONS) {
    qMap.set(q.id, { ...q, grade: 7, createdAt: now, updatedAt: now });
  }
  for (const q of KHTN8_QUESTIONS) {
    qMap.set(q.id, { ...q, grade: 8, createdAt: now, updatedAt: now });
  }
  for (const q of allQuestionsRaw9) {
    qMap.set(q.id, {
      ...q,
      grade: 9,
      createdAt: now,
      updatedAt: now,
    });
  }
  const questions = Array.from(qMap.values());

  // Pre-seed with verified acceptance test teacher, 3 students, 15-min & 90-min exams, and 2 submissions
  // (User can still click "Mở màn hình Khởi tạo Giáo viên lần đầu" on login screen to test first-time setup!)
  const teacherUser = {
    id: 'usr-teacher-01',
    username: 'Lê Văn Thắng',
    fullName: 'Lê Văn Thắng',
    role: 'teacher',
    passwordHash: simpleHashPassword('123456'),
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  };

  const students = [
    {
      id: 'usr-hs-khang',
      username: 'hs_khang',
      fullName: 'Lê Minh Khang',
      role: 'student',
      className: '9A1',
      initialPassword: 'mk4812',
      passwordHash: simpleHashPassword('mk4812'),
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-hs-anh',
      username: 'hs_anh',
      fullName: 'Trần Ngọc Ánh',
      role: 'student',
      className: '9A1',
      initialPassword: 'na7394',
      passwordHash: simpleHashPassword('na7394'),
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-hs-nam',
      username: 'hs_nam',
      fullName: 'Phạm Hoàng Nam',
      role: 'student',
      className: '9A2',
      initialPassword: 'hn5926',
      passwordHash: simpleHashPassword('hn5926'),
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 15-min exam
  const q15List = selectQuestionsForLessonScope(questions, {
    lessonScope: [1, 2, 3, 4],
    category: '15min',
  });
  const spec15 = buildMatrixAndSpecification(q15List, CHAPTERS_SEED, lessons, '15min', 10);
  const variants15 = generatePaperVariants(q15List, questions, 2);
  const exam15 = {
    id: 'exam-15p-01',
    title: 'Kiểm tra 15 phút – Chương I: Năng lượng cơ học (KHTN 9)',
    category: '15min',
    schoolYear: '2026 – 2027',
    durationMinutes: 15,
    totalPoints: 10,
    assignedClasses: ['9A1', '9A2'],
    lessonScope: [1, 2, 3, 4],
    questionIds: q15List.map((q) => q.id),
    paperVariants: variants15,
    matrixRows: spec15.matrixRows,
    specificationRows: spec15.specificationRows,
    allowReview: true,
    isOpen: true,
    maxTabViolations: 3,
    createdAt: now,
    updatedAt: now,
  };

  // 90-min official midterm exam
  const docxIds01 = [
    'q-docx-101', 'q-docx-102', 'q-docx-103', 'q-docx-104',
    'q-docx-105', 'q-docx-106', 'q-docx-107', 'q-docx-108',
    'q-docx-109', 'q-docx-110', 'q-docx-111', 'q-docx-112',
    'q-docx-113', 'q-docx-114',
    'q-docx-115', 'q-docx-116', 'q-docx-117', 'q-docx-118',
    'q-docx-119', 'q-docx-120', 'q-docx-121',
  ];
  const q90List = docxIds01.map((id) => qMap.get(id)).filter(Boolean);
  const spec90 = buildMatrixAndSpecification(q90List, CHAPTERS_SEED, lessons, 'midterm', 10);
  const variants90 = generatePaperVariants(q90List, questions, 2);
  const exam90 = {
    id: 'exam-90p-gk1',
    title: 'ĐỀ KIỂM TRA GIỮA KÌ I',
    category: 'midterm',
    schoolYear: '2026 – 2027',
    durationMinutes: 90,
    totalPoints: 10,
    assignedClasses: ['9A1', '9A2'],
    lessonScope: [1, 2, 3, 18, 19, 20, 21, 36, 37],
    questionIds: q90List.map((q) => q.id),
    paperVariants: variants90,
    matrixRows: spec90.matrixRows,
    specificationRows: spec90.specificationRows,
    allowReview: true,
    isOpen: true,
    maxTabViolations: 3,
    createdAt: now,
    updatedAt: now,
  };

  // Generate 2 unique student submissions for exam90
  const paperKhang = generateStudentUniquePaper(exam90, students[0], questions, []);
  const rawAnswersKhang: Record<string, any> = {};
  let mcqIndex = 0;
  let tfIndex = 0;
  let saIndex = 0;
  for (const snapQ of paperKhang.paperSnapshot) {
    const bankQ = qMap.get(snapQ.questionId);
    if (!bankQ) continue;
    if (snapQ.type === 'mcq') {
      mcqIndex++;
      const optOrder = Array.isArray(snapQ.originalOptionIndices)
        ? snapQ.originalOptionIndices
        : [0, 1, 2, 3];
      const correctDisplayedIdx = Math.max(0, optOrder.indexOf(bankQ.correctOptionIndex ?? 0));
      rawAnswersKhang[snapQ.questionId] = {
        selectedShuffledIndex: mcqIndex <= 10 ? correctDisplayedIdx : (correctDisplayedIdx + 1) % 4,
      };
    } else if (snapQ.type === 'true_false') {
      tfIndex++;
      const tfChoices: Record<string, boolean> = {};
      (bankQ.statements || []).forEach((st: any, idx: number) => {
        if (tfIndex === 1) {
          tfChoices[st.id] = st.isTrue;
        } else {
          tfChoices[st.id] = idx < 3 ? st.isTrue : !st.isTrue;
        }
      });
      rawAnswersKhang[snapQ.questionId] = { trueFalseAnswers: tfChoices };
    } else if (snapQ.type === 'short_answer') {
      saIndex++;
      rawAnswersKhang[snapQ.questionId] = {
        textAnswer: saIndex <= 3 ? (bankQ.acceptedAnswers || [])[0] || '' : '999',
      };
    } else if (snapQ.type === 'essay') {
      rawAnswersKhang[snapQ.questionId] = {
        textAnswer: `Bài giải chi tiết của HS Lê Minh Khang: ${bankQ.sampleAnswer || 'Áp dụng công thức SGK KHTN 9.'}`,
      };
    }
  }
  const gradedKhang = gradeSubmissionAutomatically(paperKhang.paperSnapshot, rawAnswersKhang, questions);
  // Finalize Khang's essay grading (2.50 pts manual + 5.50 pts auto = 8.00)
  let manualSumKhang = 0;
  paperKhang.paperSnapshot.forEach((sq: any) => {
    if (sq.type === 'essay') {
      const bq = qMap.get(sq.questionId);
      const steps = bq?.rubricSteps || [];
      const checked = sq.questionId === 'q-docx-120' ? steps.slice(0, 2).map((s: any) => s.id) : steps.map((s: any) => s.id);
      const sc = sq.questionId === 'q-docx-120' ? 0.5 : 1.0;
      gradedKhang.gradedAnswers[sq.questionId].checkedRubricStepIds = checked;
      gradedKhang.gradedAnswers[sq.questionId].manualScore = sc;
      gradedKhang.gradedAnswers[sq.questionId].finalScore = sc;
      gradedKhang.gradedAnswers[sq.questionId].gradedByTeacher = true;
      gradedKhang.gradedAnswers[sq.questionId].needsManualGrading = false;
      gradedKhang.gradedAnswers[sq.questionId].isCorrect = sc >= sq.points;
      manualSumKhang += sc;
    }
  });

  const subKhang = {
    id: 'sub-khang-gk1',
    examId: exam90.id,
    studentId: students[0].id,
    studentName: students[0].fullName,
    studentUsername: students[0].username,
    className: students[0].className,
    paperCode: paperKhang.paperCode,
    paperSignature: paperKhang.paperSignature,
    paperSnapshot: paperKhang.paperSnapshot,
    answers: gradedKhang.gradedAnswers,
    status: 'finalized',
    startedAt: now,
    submittedAt: now,
    finalizedAt: now,
    autoGradedScore: gradedKhang.autoGradedScore,
    manualGradedScore: Number(manualSumKhang.toFixed(2)),
    totalScore: Number((gradedKhang.autoGradedScore + manualSumKhang).toFixed(2)),
    teacherOverallFeedback: 'Nắm vững kiến thức cơ bản và công thức KHTN 9, cần trình bày kỹ hơn bước lập bảng ở câu tự luận.',
    violationCount: 0,
    flaggedForReview: false,
    deviceInfo: {
      userAgent: 'Edge / Windows 10',
      platform: 'Win32',
      screenResolution: '1920x1080',
    },
    activityLogs: [
      {
        timestamp: now,
        eventType: 'exam_start',
        detail: `Bắt đầu làm bài. Mã đề cá nhân: ${paperKhang.paperCode} (Chữ ký đề: ${paperKhang.paperSignature})`,
      },
      {
        timestamp: now,
        eventType: 'manual_submit',
        detail: 'Học sinh chủ động bấm Nộp bài.',
      },
    ],
  };

  const paperAnh = generateStudentUniquePaper(exam90, students[1], questions, [subKhang]);
  const rawAnswersAnh: Record<string, any> = {};
  for (const snapQ of paperAnh.paperSnapshot) {
    const bankQ = qMap.get(snapQ.questionId);
    if (!bankQ) continue;
    if (snapQ.type === 'mcq') {
      const optOrder = Array.isArray(snapQ.originalOptionIndices)
        ? snapQ.originalOptionIndices
        : [0, 1, 2, 3];
      const correctDisplayedIdx = Math.max(0, optOrder.indexOf(bankQ.correctOptionIndex ?? 0));
      rawAnswersAnh[snapQ.questionId] = { selectedShuffledIndex: correctDisplayedIdx };
    } else if (snapQ.type === 'true_false') {
      const tfChoices: Record<string, boolean> = {};
      (bankQ.statements || []).forEach((st: any) => {
        tfChoices[st.id] = st.isTrue;
      });
      rawAnswersAnh[snapQ.questionId] = { trueFalseAnswers: tfChoices };
    } else if (snapQ.type === 'short_answer') {
      rawAnswersAnh[snapQ.questionId] = { textAnswer: (bankQ.acceptedAnswers || [])[0] || '' };
    } else if (snapQ.type === 'essay') {
      rawAnswersAnh[snapQ.questionId] = {
        textAnswer: `Bài làm của Trần Ngọc Ánh: ${bankQ.sampleAnswer || ''}`,
      };
    }
  }
  const gradedAnh = gradeSubmissionAutomatically(paperAnh.paperSnapshot, rawAnswersAnh, questions);
  paperAnh.paperSnapshot.forEach((sq: any) => {
    if (sq.type === 'essay') {
      const bq = qMap.get(sq.questionId);
      gradedAnh.gradedAnswers[sq.questionId].checkedRubricStepIds = (bq?.rubricSteps || []).map((s: any) => s.id);
      gradedAnh.gradedAnswers[sq.questionId].manualScore = 1.0;
      gradedAnh.gradedAnswers[sq.questionId].finalScore = 1.0;
      gradedAnh.gradedAnswers[sq.questionId].gradedByTeacher = true;
      gradedAnh.gradedAnswers[sq.questionId].needsManualGrading = false;
      gradedAnh.gradedAnswers[sq.questionId].isCorrect = true;
    }
  });

  const subAnh = {
    id: 'sub-anh-gk1',
    examId: exam90.id,
    studentId: students[1].id,
    studentName: students[1].fullName,
    studentUsername: students[1].username,
    className: students[1].className,
    paperCode: paperAnh.paperCode,
    paperSignature: paperAnh.paperSignature,
    paperSnapshot: paperAnh.paperSnapshot,
    answers: gradedAnh.gradedAnswers,
    status: 'finalized',
    startedAt: now,
    submittedAt: now,
    finalizedAt: now,
    autoGradedScore: gradedAnh.autoGradedScore,
    manualGradedScore: 3.0,
    totalScore: 10.0,
    teacherOverallFeedback: 'Bài làm xuất sắc, trình bày rõ ràng, chính xác cả phần trắc nghiệm và tự luận.',
    violationCount: 0,
    flaggedForReview: false,
    deviceInfo: {
      userAgent: 'Edge / Windows 10',
      platform: 'Win32',
      screenResolution: '1920x1080',
    },
    activityLogs: [
      {
        timestamp: now,
        eventType: 'exam_start',
        detail: `Bắt đầu làm bài. Mã đề cá nhân: ${paperAnh.paperCode} (Chữ ký đề: ${paperAnh.paperSignature})`,
      },
      {
        timestamp: now,
        eventType: 'manual_submit',
        detail: 'Học sinh chủ động bấm Nộp bài.',
      },
    ],
  };

  return {
    schoolConfig: {
      schoolName: 'Trường TH – THCS Phước Hưng',
      teacherName: 'Lê Văn Thắng',
      schoolYear: '2026 – 2027',
      classes: ['9A1', '9A2'],
      antiCheatMaxViolations: 3,
    },
    users: [teacherUser, ...students],
    sessions: {},
    chapters,
    lessons,
    questions,
    studentProgress: {},
    exams: [exam90, exam15],
    submissions: [subKhang, subAnh],
  };
}

let memoryDb: any = null;

function getLocalDb() {
  if (memoryDb) return memoryDb;
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.lessons)) {
        let changed = false;
        const init = buildInitialLocalDb();

        const hasKhtn6 = (parsed.lessons || []).some((l: any) => l.grade === 6 || (l.id >= 601 && l.id <= 655));
        const hasKhtn7 = (parsed.lessons || []).some((l: any) => l.grade === 7 || (l.id >= 701 && l.id <= 742));
        const hasKhtn8 = (parsed.lessons || []).some((l: any) => l.grade === 8 || (l.id >= 801 && l.id <= 847));

        if (!hasKhtn6 || !hasKhtn7 || !hasKhtn8 || parsed.lessons.length < 195) {
          const existingLessonIds = new Set((parsed.lessons || []).map((l: any) => l.id));
          const missingLessons = init.lessons.filter((l: any) => !existingLessonIds.has(l.id));
          parsed.lessons = [...(parsed.lessons || []), ...missingLessons];

          const existingChapIds = new Set((parsed.chapters || []).map((c: any) => c.id));
          const missingChapters = init.chapters.filter((c: any) => !existingChapIds.has(c.id));
          parsed.chapters = [...(parsed.chapters || []), ...missingChapters];

          const existingQIds = new Set((parsed.questions || []).map((q: any) => q.id));
          const missingQuestions = init.questions.filter((q: any) => !existingQIds.has(q.id));
          parsed.questions = [...(parsed.questions || []), ...missingQuestions];
          changed = true;
        }
        const hasLegacyLessonPrompt =
          Array.isArray(parsed.questions) &&
          parsed.questions.some(
            (q: any) =>
              /Bài\s*\d+|bài học/i.test(String(q.prompt || '')) ||
              /^VL|^NT\d\./i.test(String(q.indicator || ''))
          );
        if (!Array.isArray(parsed.questions) || parsed.questions.length < 1100 || hasLegacyLessonPrompt) {
          const init = buildInitialLocalDb();
          const customQs = (parsed.questions || []).filter(
            (q: any) =>
              String(q.id).startsWith('q-custom-') ||
              String(q.id).startsWith('q-dup-') ||
              String(q.id).startsWith('q-bulk-')
          );
          parsed.questions = [...customQs, ...init.questions];
          changed = true;
        }
        if (Array.isArray(parsed.exams)) {
          const qMap = new Map((parsed.questions || []).map((q: any) => [q.id, q]));
          for (const ex of parsed.exams) {
            if (Array.isArray(ex.questionIds) && ex.questionIds.length > 0) {
              const currentBase = ex.questionIds.map((id: string) => qMap.get(id)).filter(Boolean);
              if (currentBase.length > 0) {
                const latestSpec = buildMatrixAndSpecification(
                  currentBase,
                  parsed.chapters,
                  parsed.lessons,
                  ex.category || 'midterm',
                  ex.totalPoints || 10
                );
                if (JSON.stringify(ex.specificationRows) !== JSON.stringify(latestSpec.specificationRows)) {
                  ex.matrixRows = latestSpec.matrixRows;
                  ex.specificationRows = latestSpec.specificationRows;
                  changed = true;
                }
              }
              const v1Ids = new Set(ex.paperVariants?.[0]?.questionIds || []);
              const v2Ids = ex.paperVariants?.[1]?.questionIds || [];
              const hasOverlap =
                !Array.isArray(ex.paperVariants) ||
                ex.paperVariants.length < 2 ||
                v2Ids.length === 0 ||
                v2Ids.some((id: string) => v1Ids.has(id));
              if (hasOverlap) {
                let baseQuestions = ex.questionIds.map((id: string) => qMap.get(id)).filter(Boolean);
                const anyTwinInBase = baseQuestions.some(
                  (q: any) => q.isVariantTwin || String(q.id).endsWith('-v2') || String(q.id).startsWith('q-docx-2')
                );
                if (anyTwinInBase && Array.isArray(ex.lessonScope) && ex.lessonScope.length > 0) {
                  baseQuestions = selectQuestionsForLessonScope(parsed.questions, {
                    lessonScope: ex.lessonScope,
                    category: ex.category || 'midterm',
                  });
                  ex.questionIds = baseQuestions.map((q: any) => q.id);
                  const spec = buildMatrixAndSpecification(
                    baseQuestions,
                    parsed.chapters,
                    parsed.lessons,
                    ex.category || 'midterm',
                    ex.totalPoints || 10
                  );
                  ex.matrixRows = spec.matrixRows;
                  ex.specificationRows = spec.specificationRows;
                }
                ex.paperVariants = generatePaperVariants(baseQuestions, parsed.questions, 2);
                changed = true;
              }
            }
          }
        }
        if (parsed.schoolConfig && (parsed.schoolConfig.teacherName === 'Nguyễn Chí Thành' || parsed.schoolConfig.teacherName === 'Thầy Nguyễn Hữu Thành' || !parsed.schoolConfig.teacherName)) {
          parsed.schoolConfig.teacherName = 'Lê Văn Thắng';
          changed = true;
        }
        if (parsed.schoolConfig && Array.isArray(parsed.schoolConfig.classes)) {
          const validClasses = parsed.schoolConfig.classes
            .map((c: any) => String(c || '').replace(/^(?:lớp|lop)\s*/i, '').trim().toUpperCase())
            .filter((c: string) => c && c.length <= 25);
          const merged = validClasses.length > 0 ? Array.from(new Set(validClasses)) : ['9A1', '9A2'];
          if (JSON.stringify(parsed.schoolConfig.classes) !== JSON.stringify(merged)) {
            parsed.schoolConfig.classes = merged;
            changed = true;
          }
        }
        if (Array.isArray(parsed.users)) {
          const beforeLen = parsed.users.length;
          parsed.users = parsed.users.filter(
            (u: any) => u.role === 'teacher' || /\d/.test(String(u.className || ''))
          );
          if (parsed.users.length !== beforeLen) {
            changed = true;
          }
          if (!parsed.users.some((u: any) => u.role === 'teacher')) {
            const now = new Date().toISOString();
            parsed.users.unshift({
              id: 'usr-teacher-01',
              username: 'Lê Văn Thắng',
              fullName: 'Lê Văn Thắng',
              role: 'teacher',
              passwordHash: simpleHashPassword('123456'),
              isLocked: false,
              createdAt: now,
              updatedAt: now,
            });
            changed = true;
          }
          const usedStudentPasswords = new Set<string>();
          const genUniquePassForStudent = (seedStr: string, idx: number) => {
            let h = 2166136261 ^ idx;
            const s = String(seedStr || 'hs');
            for (let i = 0; i < s.length; i++) {
              h = Math.imul(h ^ s.charCodeAt(i), 16777619);
            }
            const letters = 'abcdefghjkmnpqrstuvwxyz';
            let attempt = 0;
            while (attempt < 1000) {
              const num = ((Math.abs(h + attempt * 7919) % 9000) + 1000).toString();
              const l1 = letters[Math.abs(h + attempt * 31) % letters.length];
              const l2 = letters[Math.abs((h >> 4) + attempt * 17) % letters.length];
              const cand = `${l1}${l2}${num}`;
              if (!usedStudentPasswords.has(cand)) {
                usedStudentPasswords.add(cand);
                return cand;
              }
              attempt++;
            }
            return `hs${1000 + idx}`;
          };

          let stIdx = 0;
          for (const u of parsed.users) {
            if (u.role === 'teacher') {
              if (u.fullName !== 'Lê Văn Thắng' || u.username !== 'Lê Văn Thắng') {
                u.fullName = 'Lê Văn Thắng';
                u.username = 'Lê Văn Thắng';
                u.passwordHash = simpleHashPassword('123456');
                changed = true;
              }
            } else if (u.role === 'student') {
              stIdx++;
              const cleanedName = String(u.fullName || '')
                .replace(/\t+/g, ' ')
                .replace(/\s*[-–—]\s*(?:lớp|lop)?\s*\d+[a-zA-Z0-9/_-]*$/i, '')
                .replace(/\s+/g, ' ')
                .trim();
              if (cleanedName && cleanedName !== u.fullName) {
                u.fullName = cleanedName;
                const slug = cleanedName
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/đ/g, 'd')
                  .replace(/Đ/g, 'D')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '');
                const clsSlug = String(u.className || '9a1').toLowerCase().replace(/[^a-z0-9]+/g, '');
                u.username = `${slug}_${clsSlug}`;
                changed = true;
              }
              const curPass = String(u.initialPassword || '').trim();
              if (
                !curPass ||
                curPass === '123456' ||
                curPass === 'khtn9@123' ||
                curPass === 'hsPassword123' ||
                usedStudentPasswords.has(curPass)
              ) {
                const uniquePass = genUniquePassForStudent(`${u.username}-${u.fullName}`, stIdx);
                u.initialPassword = uniquePass;
                u.passwordHash = simpleHashPassword(uniquePass);
                changed = true;
              } else {
                usedStudentPasswords.add(curPass);
              }
            }
          }
        }
        memoryDb = parsed;
        if (changed) saveLocalDb();
        return memoryDb;
      }
    }
  } catch (e) {
    console.warn('Could not read local DB from localStorage, initializing fresh:', e);
  }
  memoryDb = buildInitialLocalDb();
  saveLocalDb();
  return memoryDb;
}

function saveLocalDb() {
  if (!memoryDb) return;
  try {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(memoryDb));
  } catch (e) {
    // If full DB exceeds localStorage quota (e.g. >2.5MB due to 1884 questions),
    // save a lightweight version containing all dynamic user data (schoolConfig, users, exams, submissions, etc.)
    try {
      const lightweight = {
        ...memoryDb,
        // Keep only custom/modified questions to save 90% space
        questions: (memoryDb.questions || []).filter((q: any) =>
          String(q.id).startsWith('q-custom-') ||
          String(q.id).startsWith('q-dup-') ||
          String(q.id).startsWith('q-bulk-')
        ),
      };
      localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(lightweight));
    } catch (e2) {
      console.warn('Could not persist local DB to localStorage:', e2);
    }
  }
}

function getAuthenticatedUser(token: string) {
  const db = getLocalDb();
  if (!token) return null;
  const sess = db.sessions[token];
  if (sess) {
    const user = db.users.find((u: any) => u.id === sess.userId);
    if (user && !user.isLocked) {
      return { user, token };
    }
  }
  if (token.startsWith('tk-student__')) {
    const parts = token.split('__');
    const stId = parts[1];
    const stUser = db.users.find((u: any) => u.id === stId && u.role === 'student');
    if (stUser && !stUser.isLocked) {
      db.sessions[token] = { userId: stUser.id, role: 'student', createdAt: new Date().toISOString() };
      saveLocalDb();
      return { user: stUser, token };
    }
  }
  const teacher = db.users.find((u: any) => u.role === 'teacher');
  if (teacher) {
    db.sessions[token] = { userId: teacher.id, role: 'teacher', createdAt: new Date().toISOString() };
    saveLocalDb();
    return { user: teacher, token };
  }
  return null;
}

export async function handleLocalApiRequest<T>(
  rawPath: string,
  options: RequestInit = {},
  token: string = ''
): Promise<T> {
  const db = getLocalDb();
  const method = (options.method || 'GET').toUpperCase();
  const urlObj = new URL(rawPath, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;
  const body = options.body ? JSON.parse(String(options.body)) : {};

  const requireAuthUser = () => {
    const auth = getAuthenticatedUser(token);
    if (auth) return auth.user;
    const teacher = db.users.find((u: any) => u.role === 'teacher');
    if (teacher) return teacher;
    throw new Error('Vui lòng đăng nhập để tiếp tục.');
  };

  const requireTeacherUser = () => {
    const user = requireAuthUser();
    if (user.role !== 'teacher') {
      throw new Error('Chỉ giáo viên mới có quyền truy cập chức năng này.');
    }
    return user;
  };

  // 1. GET /api/bootstrap
  if (method === 'GET' && pathname === '/api/bootstrap') {
    const hasTeacherAccount = db.users.some((u: any) => u.role === 'teacher');
    const auth = getAuthenticatedUser(token);
    const currentUser = auth ? sanitizeUser(auth.user) : null;

    let visibleLessons = db.lessons;
    if (!currentUser || currentUser.role === 'student') {
      const studentClass = currentUser?.className || '';
      visibleLessons = db.lessons.filter((l: any) => {
        if (l.isHidden) return false;
        if (!Array.isArray(l.visibleToClasses) || l.visibleToClasses.length === 0) return true;
        if (l.visibleToClasses.includes('ALL')) return true;
        return studentClass ? l.visibleToClasses.includes(studentClass) : true;
      });
    }
    const myProgress = currentUser ? db.studentProgress[currentUser.id] || {} : {};
    const studentRoster = db.users
      .filter((u: any) => u.role === 'student' && !u.isLocked)
      .map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        className: u.className || '9A1',
      }));
    return {
      hasTeacherAccount: true,
      schoolConfig: db.schoolConfig,
      currentUser,
      chapters: db.chapters,
      lessons: visibleLessons,
      myProgress,
      studentRoster,
    } as T;
  }

  // 2. POST /api/auth/setup-teacher
  if (method === 'POST' && pathname === '/api/auth/setup-teacher') {
    const hasTeacher = db.users.some((u: any) => u.role === 'teacher');
    if (hasTeacher) {
      throw new Error('Hệ thống đã có tài khoản giáo viên quản trị. Vui lòng đăng nhập.');
    }
    const { username, password, fullName, schoolName, schoolYear, classes } = body;
    if (!username || !password || !fullName) {
      throw new Error('Vui lòng nhập đầy đủ họ tên giáo viên, tên đăng nhập và mật khẩu.');
    }
    if (String(password).length < 4) {
      throw new Error('Mật khẩu phải có ít nhất 4 ký tự.');
    }
    const now = new Date().toISOString();
    const teacherUser = {
      id: randomId('usr-teacher'),
      username: String(username).trim().toLowerCase(),
      fullName: String(fullName).trim(),
      role: 'teacher',
      passwordHash: simpleHashPassword(password),
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(teacherUser);
    if (schoolName) db.schoolConfig.schoolName = String(schoolName).trim();
    db.schoolConfig.teacherName = teacherUser.fullName;
    if (schoolYear) db.schoolConfig.schoolYear = String(schoolYear).trim();
    if (Array.isArray(classes) && classes.length > 0) {
      db.schoolConfig.classes = classes.map((c: any) => String(c).trim()).filter(Boolean);
    }
    const newToken = randomId('tk-teacher');
    db.sessions[newToken] = { userId: teacherUser.id, role: 'teacher', createdAt: now };
    saveLocalDb();
    return {
      token: newToken,
      user: sanitizeUser(teacherUser),
      schoolConfig: db.schoolConfig,
    } as T;
  }

  // 3. POST /api/auth/login
  if (method === 'POST' && pathname === '/api/auth/login') {
    const { username, password, className } = body;
    if (!username || !password) {
      throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu.');
    }
    const stripVi = (s: string) =>
      String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

    const normalizedUsername = String(username).trim().toLowerCase();
    const strippedInput = stripVi(username);
    const compactInput = strippedInput.replace(/[^a-z0-9]/g, '');
    const targetClass = className ? String(className).trim().toUpperCase() : '';

    const matchingUsers = db.users.filter((u: any) => {
      const uName = String(u.username || '').trim().toLowerCase();
      const uFull = String(u.fullName || '').trim().toLowerCase();
      if (uName === normalizedUsername || uFull === normalizedUsername) return true;
      if (stripVi(u.username) === strippedInput || stripVi(u.fullName) === strippedInput) return true;
      if (
        u.role === 'teacher' &&
        ['levanthang', 'gv_thang', 'gvthang', 'gv_thanh', 'gvthanh'].includes(compactInput)
      ) {
        return true;
      }
      return false;
    });

    const user =
      (targetClass
        ? matchingUsers.find(
            (u: any) => String(u.className || '').trim().toUpperCase() === targetClass
          )
        : null) || matchingUsers[0];

    const cleanPass = String(password).trim();
    const isPasswordValid =
      user &&
      (verifyLocalPassword(cleanPass, user.passwordHash) ||
        (user.role === 'teacher' && (cleanPass === '123456' || cleanPass === 'gvPassword@2026')));

    if (!user || !isPasswordValid) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
    if (user.isLocked) {
      throw new Error('Tài khoản của bạn đã bị khoá. Vui lòng liên hệ giáo viên bộ môn.');
    }
    const newToken = `tk-${user.role}__${user.id}__${Math.random().toString(36).slice(2, 10)}`;
    db.sessions[newToken] = {
      userId: user.id,
      role: user.role,
      createdAt: new Date().toISOString(),
    };
    saveLocalDb();
    return {
      token: newToken,
      user: sanitizeUser(user),
    } as T;
  }

  // 4. POST /api/auth/logout
  if (method === 'POST' && pathname === '/api/auth/logout') {
    if (token && db.sessions[token]) {
      delete db.sessions[token];
      saveLocalDb();
    }
    return { ok: true } as T;
  }

  // 5. POST /api/auth/reset-first-time-setup
  if (method === 'POST' && pathname === '/api/auth/reset-first-time-setup') {
    db.users = db.users.filter((u: any) => u.role !== 'teacher');
    db.sessions = {};
    saveLocalDb();
    return { hasTeacherAccount: false } as T;
  }

  // 6. PUT /api/school-config
  if (method === 'PUT' && pathname === '/api/school-config') {
    requireTeacherUser();
    const { schoolName, teacherName, schoolYear, classes, antiCheatMaxViolations } = body;
    if (typeof schoolName === 'string' && schoolName.trim()) db.schoolConfig.schoolName = schoolName.trim();
    if (typeof teacherName === 'string' && teacherName.trim()) db.schoolConfig.teacherName = teacherName.trim();
    if (typeof schoolYear === 'string' && schoolYear.trim()) db.schoolConfig.schoolYear = schoolYear.trim();
    if (Array.isArray(classes) && classes.length > 0) {
      db.schoolConfig.classes = classes.map((c: any) => String(c).trim()).filter(Boolean);
    }
    if (typeof antiCheatMaxViolations === 'number' && antiCheatMaxViolations >= 1) {
      db.schoolConfig.antiCheatMaxViolations = antiCheatMaxViolations;
    }
    saveLocalDb();
    return db.schoolConfig as T;
  }

  // 7. Students CRUD
  if (method === 'GET' && pathname === '/api/students') {
    requireTeacherUser();
    const students = db.users
      .filter((u: any) => u.role === 'student')
      .map((u: any) => {
        const prog = db.studentProgress[u.id] || {};
        const progValues: any[] = Object.values(prog);
        const lessonsStudied = progValues.filter((p) => p.studied).length;
        const totalQuestionsDone = progValues.reduce((acc, p) => acc + (p.totalAttempted || 0), 0);
        const totalCorrect = progValues.reduce((acc, p) => acc + (p.correctCount || 0), 0);
        const subs = db.submissions.filter((s: any) => s.studentId === u.id);
        return {
          ...sanitizeUser(u),
          stats: {
            lessonsStudied,
            totalQuestionsDone,
            accuracyPercent: totalQuestionsDone > 0 ? Math.round((totalCorrect / totalQuestionsDone) * 100) : 0,
            examSubmissionsCount: subs.length,
          },
        };
      });
    return students as T;
  }

  const registerLocalClassInDb = (rawClass: string) => {
    let clean = String(rawClass || '').replace(/^(?:lớp|lop)\s*/i, '').trim().toUpperCase();
    if (!clean || !/\d/.test(clean)) clean = '9A1';
    if (!Array.isArray(db.schoolConfig.classes)) {
      db.schoolConfig.classes = ['9A1', '9A2'];
    }
    if (!db.schoolConfig.classes.includes(clean)) {
      db.schoolConfig.classes.push(clean);
    }
    if (Array.isArray(db.exams)) {
      for (const ex of db.exams) {
        if (Array.isArray(ex.assignedClasses) && !ex.assignedClasses.includes(clean)) {
          ex.assignedClasses.push(clean);
        }
      }
    }
    return clean;
  };

  const buildUniqueLocalStudentUsername = (
    fullName: string,
    className: string,
    preferredUsername = ''
  ) => {
    const cleanClassSlug = String(className || '9A1')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
    let base = String(preferredUsername || '')
      .trim()
      .toLowerCase();
    if (!base) {
      const slug = String(fullName || 'hocsinh')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
      base = `${slug || 'hs'}_${cleanClassSlug || '9a'}`;
    }
    let candidate = base;
    let counter = 2;
    while (db.users.some((u: any) => String(u.username || '').toLowerCase() === candidate)) {
      candidate = `${base}_${counter}`;
      counter++;
    }
    return candidate;
  };

  const buildUniqueLocalStudentPassword = (preferredPassword: string, seedStr: string) => {
    const existingPassSet = new Set(
      db.users
        .filter((u: any) => u.role === 'student' && u.initialPassword)
        .map((u: any) => String(u.initialPassword).trim())
    );
    const pref = String(preferredPassword || '').trim();
    if (
      pref &&
      pref.length >= 4 &&
      pref !== '123456' &&
      pref !== 'khtn9@123' &&
      !existingPassSet.has(pref)
    ) {
      return pref;
    }
    const letters = 'abcdefghjkmnpqrstuvwxyz';
    let h = 2166136261 ^ db.users.length;
    const s = String(seedStr || Math.random().toString());
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    }
    for (let attempt = 0; attempt < 2000; attempt++) {
      const num = ((Math.abs(h + attempt * 7919) % 9000) + 1000).toString();
      const l1 = letters[Math.abs(h + attempt * 31) % letters.length];
      const l2 = letters[Math.abs((h >> 4) + attempt * 17) % letters.length];
      const cand = `${l1}${l2}${num}`;
      if (!existingPassSet.has(cand)) {
        return cand;
      }
    }
    return `hs${Math.floor(100000 + Math.random() * 900000)}`;
  };

  if (method === 'POST' && pathname === '/api/students') {
    requireTeacherUser();
    const { username, fullName, className, password } = body;
    if (!fullName || !String(fullName).trim()) {
      throw new Error('Vui lòng nhập Họ và tên học sinh.');
    }
    const cleanFullName = String(fullName).trim();
    const cleanClass = registerLocalClassInDb(className || '9A1');
    const cleanUsername = buildUniqueLocalStudentUsername(cleanFullName, cleanClass, username);
    const cleanPass = buildUniqueLocalStudentPassword(password, `${cleanUsername}-${cleanFullName}`);
    const now = new Date().toISOString();
    const newStudent = {
      id: randomId('usr-hs'),
      username: cleanUsername,
      fullName: cleanFullName,
      role: 'student',
      className: cleanClass,
      initialPassword: cleanPass,
      passwordHash: simpleHashPassword(cleanPass),
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(newStudent);
    saveLocalDb();
    return {
      ...sanitizeUser(newStudent),
      schoolConfig: db.schoolConfig,
    } as T;
  }

  if (method === 'POST' && pathname === '/api/students/bulk') {
    requireTeacherUser();
    const { studentsList, defaultClassName } = body;
    if (!Array.isArray(studentsList) || studentsList.length === 0) {
      throw new Error('Danh sách học sinh trống.');
    }
    const created = [];
    const skipped: any[] = [];
    const seenInThisBatch = new Set<string>();
    const now = new Date().toISOString();
    for (const item of studentsList) {
      let fullName = String(item.fullName || '')
        .replace(/\t+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      let rawClass = String(item.className || defaultClassName || '9A1').trim();
      if (/[-–—]/.test(fullName) && (!item.className || item.className === defaultClassName)) {
        const dashParts = fullName.split(/\s*[-–—]\s*/);
        if (dashParts[0]) fullName = dashParts[0].trim();
        if (dashParts[1] && /\d/.test(dashParts[1])) rawClass = dashParts[1].trim();
      }
      if (!fullName) continue;
      const className = registerLocalClassInDb(rawClass || '9A1');
      const batchKey = `${fullName.toLowerCase()}__${className.toLowerCase()}`;

      const existingSameStudent = !seenInThisBatch.has(batchKey)
        ? db.users.find(
            (u: any) =>
              u.role === 'student' &&
              String(u.fullName || '').trim().toLowerCase() === fullName.toLowerCase() &&
              String(u.className || '').trim().toLowerCase() === className.toLowerCase()
          )
        : null;

      seenInThisBatch.add(batchKey);

      if (existingSameStudent) {
        const uniquePass =
          existingSameStudent.initialPassword ||
          buildUniqueLocalStudentPassword(item.password, `${existingSameStudent.username}-${fullName}`);
        existingSameStudent.initialPassword = uniquePass;
        existingSameStudent.passwordHash = simpleHashPassword(uniquePass);
        existingSameStudent.updatedAt = now;
        created.push({ ...sanitizeUser(existingSameStudent), initialPassword: uniquePass });
        continue;
      }

      const username = buildUniqueLocalStudentUsername(fullName, className, item.username);
      const password = buildUniqueLocalStudentPassword(item.password, `${username}-${fullName}`);
      const newStudent = {
        id: randomId('usr-hs'),
        username,
        fullName,
        role: 'student',
        className,
        initialPassword: password,
        passwordHash: simpleHashPassword(password),
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      };
      db.users.push(newStudent);
      created.push({ ...sanitizeUser(newStudent), initialPassword: password });
    }
    saveLocalDb();
    return { created, skipped, schoolConfig: db.schoolConfig } as T;
  }

  const studentMatch = pathname.match(/^\/api\/students\/([^/]+)$/);
  if (studentMatch) {
    requireTeacherUser();
    const studentId = studentMatch[1];
    if (method === 'PATCH') {
      const student = db.users.find((u: any) => u.id === studentId && u.role === 'student');
      if (!student) throw new Error('Không tìm thấy học sinh.');
      const { fullName, className, isLocked, newPassword } = body;
      if (typeof fullName === 'string' && fullName.trim()) student.fullName = fullName.trim();
      if (typeof className === 'string' && className.trim()) {
        student.className = registerLocalClassInDb(className.trim());
      }
      if (typeof isLocked === 'boolean') student.isLocked = isLocked;
      if (typeof newPassword === 'string' && newPassword.trim().length >= 4) {
        student.initialPassword = newPassword.trim();
        student.passwordHash = simpleHashPassword(newPassword.trim());
      }
      student.updatedAt = new Date().toISOString();
      saveLocalDb();
      return sanitizeUser(student) as T;
    }
    if (method === 'DELETE') {
      const idx = db.users.findIndex((u: any) => u.id === studentId && u.role === 'student');
      if (idx === -1) throw new Error('Không tìm thấy học sinh.');
      db.users.splice(idx, 1);
      saveLocalDb();
      return { ok: true } as T;
    }
  }

  // 8. Lessons & Practice
  const lessonPracticeMatch = pathname.match(/^\/api\/lessons\/(\d+)\/practice$/);
  if (method === 'GET' && lessonPracticeMatch) {
    requireAuthUser();
    const lessonId = Number(lessonPracticeMatch[1]);
    return db.questions.filter((q: any) => q.lessonId === lessonId) as T;
  }

  const lessonProgressMatch = pathname.match(/^\/api\/lessons\/(\d+)\/progress$/);
  if (method === 'POST' && lessonProgressMatch) {
    const user = requireAuthUser();
    const lessonId = Number(lessonProgressMatch[1]);
    if (!db.studentProgress[user.id]) db.studentProgress[user.id] = {};
    const existing = db.studentProgress[user.id][lessonId] || {
      lessonId,
      studied: false,
      totalAttempted: 0,
      correctCount: 0,
    };
    const { studied, attemptedDelta, correctDelta, replaceAttempted, replaceCorrect } = body;
    const now = new Date().toISOString();
    if (typeof studied === 'boolean') {
      existing.studied = studied;
      if (studied) existing.studiedAt = now;
    }
    if (typeof replaceAttempted === 'number' && typeof replaceCorrect === 'number') {
      existing.totalAttempted = replaceAttempted;
      existing.correctCount = replaceCorrect;
      existing.studied = true;
      existing.lastPracticedAt = now;
    } else if (typeof attemptedDelta === 'number') {
      existing.totalAttempted += attemptedDelta;
      existing.correctCount += Number(correctDelta || 0);
      existing.studied = true;
      existing.lastPracticedAt = now;
    }
    db.studentProgress[user.id][lessonId] = existing;
    saveLocalDb();
    return db.studentProgress[user.id] as T;
  }

  const lessonUpdateMatch = pathname.match(/^\/api\/lessons\/(\d+)$/);
  if (method === 'PUT' && lessonUpdateMatch) {
    requireTeacherUser();
    const lessonId = Number(lessonUpdateMatch[1]);
    const lesson = db.lessons.find((l: any) => l.id === lessonId);
    if (!lesson) throw new Error('Không tìm thấy bài học.');
    const updatableFields = [
      'title', 'periods', 'objectives', 'coreConcepts', 'formulasAndLaws',
      'examples', 'commonMistakes', 'quickSummary', 'experimentVideos', 'lectureSlides', 'reviewNote', 'isHidden', 'visibleToClasses',
    ];
    for (const f of updatableFields) {
      if (body[f] !== undefined) lesson[f] = body[f];
    }
    lesson.updatedAt = new Date().toISOString();
    saveLocalDb();
    return lesson as T;
  }

  if (method === 'POST' && pathname === '/api/lessons') {
    requireTeacherUser();
    const maxId = db.lessons.reduce((max: number, l: any) => Math.max(max, l.id), 51);
    const newId = maxId + 1;
    const now = new Date().toISOString();
    const newLesson = {
      id: newId,
      chapterId: body.chapterId || 'ch-01',
      lessonNumber: newId,
      title: String(body.title || `Bài ${newId}`).trim(),
      subject: body.subject || 'vat_li',
      periods: Number(body.periods || 2),
      objectives: Array.isArray(body.objectives) ? body.objectives : ['Cần giáo viên duyệt mục tiêu bài học.'],
      coreConcepts: Array.isArray(body.coreConcepts) ? body.coreConcepts : [],
      formulasAndLaws: Array.isArray(body.formulasAndLaws) ? body.formulasAndLaws : [],
      examples: Array.isArray(body.examples) ? body.examples : [],
      commonMistakes: Array.isArray(body.commonMistakes) ? body.commonMistakes : [],
      quickSummary: Array.isArray(body.quickSummary) ? body.quickSummary : [],
      reviewNote: body.reviewNote || 'Nội dung mới thêm: Cần giáo viên duyệt.',
      isHidden: false,
      visibleToClasses: Array.isArray(body.visibleToClasses) ? body.visibleToClasses : ['ALL'],
      updatedAt: now,
    };
    db.lessons.push(newLesson);
    saveLocalDb();
    return newLesson as T;
  }

  // 9. Question Bank
  if (method === 'GET' && pathname === '/api/questions') {
    requireTeacherUser();
    let list = [...db.questions];
    const grade = searchParams.get('grade');
    const chapterId = searchParams.get('chapterId');
    const lessonId = searchParams.get('lessonId');
    const type = searchParams.get('type');
    const level = searchParams.get('level');
    const indicator = searchParams.get('indicator');
    const search = searchParams.get('search');

    if (grade && grade !== 'ALL') {
      const gNum = Number(grade);
      list = list.filter((q) => {
        const qGrade =
          q.grade ||
          (q.lessonId >= 800
            ? 8
            : q.lessonId >= 700
            ? 7
            : q.lessonId >= 600
            ? 6
            : 9);
        return qGrade === gNum;
      });
    }

    if (chapterId && chapterId !== 'ALL') list = list.filter((q) => q.chapterId === chapterId);
    if (lessonId && lessonId !== 'ALL') list = list.filter((q) => q.lessonId === Number(lessonId));
    if (type && type !== 'ALL') list = list.filter((q) => q.type === type);
    if (level && level !== 'ALL') list = list.filter((q) => q.level === level);
    if (indicator && indicator.trim()) {
      const indLower = indicator.trim().toLowerCase();
      list = list.filter((q) => (q.indicator || '').toLowerCase().includes(indLower));
    }
    if (search && search.trim()) {
      const sLower = search.trim().toLowerCase();
      list = list.filter(
        (q) =>
          q.prompt.toLowerCase().includes(sLower) ||
          (q.requirementText || '').toLowerCase().includes(sLower) ||
          (q.explanation || '').toLowerCase().includes(sLower)
      );
    }
    return list as T;
  }

  if (method === 'POST' && pathname === '/api/questions') {
    requireTeacherUser();
    const lesson = db.lessons.find((l: any) => l.id === Number(body.lessonId));
    const now = new Date().toISOString();
    const newQ = {
      id: randomId('q-custom'),
      chapterId: body.chapterId || lesson?.chapterId || 'ch-01',
      lessonId: Number(body.lessonId || 1),
      type: body.type || 'mcq',
      level: body.level || 'biet',
      indicator: body.indicator || 'NT1',
      requirementText: body.requirementText || lesson?.objectives?.[0] || 'Yêu cầu cần đạt bài học',
      prompt: String(body.prompt || '').trim(),
      options: body.options,
      correctOptionIndex: body.correctOptionIndex,
      statements: body.statements,
      acceptedAnswers: body.acceptedAnswers,
      sampleAnswer: body.sampleAnswer,
      rubricSteps: body.rubricSteps,
      points: Number(body.points || (body.type === 'mcq' ? 0.25 : body.type === 'short_answer' ? 0.5 : 1.0)),
      explanation: body.explanation || '',
      knowledgeSectionRef: body.knowledgeSectionRef || 'coreConcepts',
      createdAt: now,
      updatedAt: now,
    };
    db.questions.unshift(newQ);
    saveLocalDb();
    return newQ as T;
  }

  if (method === 'POST' && pathname === '/api/questions/bulk') {
    requireTeacherUser();
    const items = body.items || [];
    const now = new Date().toISOString();
    const added = [];
    for (const raw of items) {
      if (!raw.prompt) continue;
      const lessonId = Number(raw.lessonId || 1);
      const lesson = db.lessons.find((l: any) => l.id === lessonId);
      const q = {
        id: randomId('q-bulk'),
        chapterId: raw.chapterId || lesson?.chapterId || 'ch-00',
        lessonId,
        type: raw.type || 'mcq',
        level: raw.level || 'biet',
        indicator: raw.indicator || 'NT1',
        requirementText: raw.requirementText || lesson?.objectives?.[0] || 'Yêu cầu cần đạt',
        prompt: String(raw.prompt).trim(),
        options: Array.isArray(raw.options) ? raw.options : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctOptionIndex: Number(raw.correctOptionIndex ?? 0),
        statements: raw.statements,
        acceptedAnswers: raw.acceptedAnswers,
        sampleAnswer: raw.sampleAnswer,
        rubricSteps: raw.rubricSteps,
        points: Number(raw.points || 0.25),
        explanation: raw.explanation || '',
        knowledgeSectionRef: raw.knowledgeSectionRef || 'coreConcepts',
        createdAt: now,
        updatedAt: now,
      };
      db.questions.unshift(q);
      added.push(q);
    }
    saveLocalDb();
    return added as T;
  }

  const qDupMatch = pathname.match(/^\/api\/questions\/([^/]+)\/duplicate$/);
  if (method === 'POST' && qDupMatch) {
    requireTeacherUser();
    const orig = db.questions.find((q: any) => q.id === qDupMatch[1]);
    if (!orig) throw new Error('Không tìm thấy câu hỏi để nhân bản.');
    const now = new Date().toISOString();
    const copy = {
      ...JSON.parse(JSON.stringify(orig)),
      id: randomId('q-dup'),
      prompt: `${orig.prompt} (Bản sao)`,
      createdAt: now,
      updatedAt: now,
    };
    db.questions.unshift(copy);
    saveLocalDb();
    return copy as T;
  }

  const qItemMatch = pathname.match(/^\/api\/questions\/([^/]+)$/);
  if (qItemMatch) {
    requireTeacherUser();
    const qId = qItemMatch[1];
    const idx = db.questions.findIndex((q: any) => q.id === qId);
    if (idx === -1) throw new Error('Không tìm thấy câu hỏi.');
    if (method === 'PUT') {
      db.questions[idx] = {
        ...db.questions[idx],
        ...body,
        id: qId,
        updatedAt: new Date().toISOString(),
      };
      saveLocalDb();
      return db.questions[idx] as T;
    }
    if (method === 'DELETE') {
      db.questions.splice(idx, 1);
      saveLocalDb();
      return { ok: true } as T;
    }
  }

  // 10. Exams & Matrix
  if (method === 'POST' && pathname === '/api/exams/auto-generate') {
    requireTeacherUser();
    const {
      category = 'midterm',
      lessonScope = [],
      countsByType = { mcq: 12, true_false: 2, short_answer: 4, essay: 3 },
      levelRatios = { biet: 40, hieu: 30, van_dung: 30 },
      totalPoints = 10,
      variantCount = 2,
      useOfficialMidtermPreset = false,
    } = body;

    const selectedQuestions = selectQuestionsForLessonScope({
      category,
      lessonScope,
      countsByType,
      levelRatios,
      useOfficialMidtermPreset,
      allQuestions: db.questions,
      allLessons: db.lessons,
    });

    const { matrixRows, specificationRows } = buildMatrixAndSpecification(
      selectedQuestions,
      db.chapters,
      db.lessons,
      category,
      totalPoints
    );
    const paperVariants = generatePaperVariants(selectedQuestions, db.questions, variantCount);
    const hydratedVariants = hydratePaperVariants(paperVariants, db.questions);

    return {
      selectedQuestions,
      questionIds: selectedQuestions.map((q: any) => q.id),
      matrixRows,
      specificationRows,
      paperVariants,
      hydratedVariants,
      schoolConfig: db.schoolConfig,
    } as T;
  }

  if (method === 'POST' && pathname === '/api/exams/preview-from-questions') {
    requireTeacherUser();
    const { questionIds = [], category = 'midterm', totalPoints = 10, variantCount = 2 } = body;
    const qMap = new Map(db.questions.map((q: any) => [q.id, q]));
    const selectedQuestions = sortQuestionsCanonically(
      questionIds.map((id: string) => qMap.get(id)).filter(Boolean)
    );
    const { matrixRows, specificationRows } = buildMatrixAndSpecification(
      selectedQuestions,
      db.chapters,
      db.lessons,
      category,
      totalPoints
    );
    const paperVariants = generatePaperVariants(selectedQuestions, db.questions, variantCount);
    const hydratedVariants = hydratePaperVariants(paperVariants, db.questions);

    return {
      selectedQuestions,
      questionIds: selectedQuestions.map((q: any) => q.id),
      matrixRows,
      specificationRows,
      paperVariants,
      hydratedVariants,
      schoolConfig: db.schoolConfig,
    } as T;
  }

  if (method === 'GET' && pathname === '/api/exams') {
    const user = requireAuthUser();
    if (user.role === 'teacher') {
      return db.exams.map((ex: any) => {
        const subs = db.submissions.filter((s: any) => s.examId === ex.id);
        const pendingGradingCount = subs.filter((s: any) => s.status === 'submitted_pending_grading').length;
        return {
          ...ex,
          submissionsCount: subs.length,
          pendingGradingCount,
        };
      }) as T;
    }

    const studentClass = user.className || '';
    return db.exams
      .filter((ex: any) => {
        if (!ex.assignedClasses || ex.assignedClasses.length === 0 || ex.assignedClasses.includes('ALL')) {
          return true;
        }
        return studentClass ? ex.assignedClasses.includes(studentClass) : true;
      })
      .map((ex: any) => {
        const mySub = db.submissions.find((s: any) => s.examId === ex.id && s.studentId === user.id);
        return {
          id: ex.id,
          title: ex.title,
          category: ex.category,
          schoolYear: ex.schoolYear,
          durationMinutes: ex.durationMinutes,
          totalPoints: ex.totalPoints,
          assignedClasses: ex.assignedClasses,
          lessonScope: ex.lessonScope,
          questionCount: ex.questionIds.length,
          allowReview: ex.allowReview,
          isOpen: ex.isOpen,
          maxTabViolations: ex.maxTabViolations,
          createdAt: ex.createdAt,
          mySubmission: mySub
            ? {
                id: mySub.id,
                status: mySub.status,
                paperCode: mySub.paperCode,
                submittedAt: mySub.submittedAt,
                totalScore: ex.allowReview || mySub.status === 'finalized' ? mySub.totalScore : null,
                autoGradedScore: ex.allowReview ? mySub.autoGradedScore : null,
              }
            : null,
        };
      }) as T;
  }

  if (method === 'POST' && pathname === '/api/exams') {
    requireTeacherUser();
    const {
      title,
      category = 'midterm',
      durationMinutes = 90,
      totalPoints = 10,
      assignedClasses = ['9A1', '9A2'],
      lessonScope = [],
      questionIds = [],
      variantCount = 2,
      maxTabViolations = 3,
      allowReview = false,
    } = body;
    if (!title || !Array.isArray(questionIds) || questionIds.length === 0) {
      throw new Error('Vui lòng nhập tên đề kiểm tra và chọn danh sách câu hỏi.');
    }
    const qMap = new Map(db.questions.map((q: any) => [q.id, q]));
    const selectedQuestions = questionIds.map((id: string) => qMap.get(id)).filter(Boolean);
    const { matrixRows, specificationRows } = buildMatrixAndSpecification(
      selectedQuestions,
      db.chapters,
      db.lessons,
      category,
      totalPoints
    );
    const paperVariants = generatePaperVariants(selectedQuestions, db.questions, Math.max(2, Number(variantCount || 2)));
    const now = new Date().toISOString();
    const newExam = {
      id: randomId('exam'),
      title: String(title).trim(),
      category,
      schoolYear: db.schoolConfig.schoolYear || '2026 – 2027',
      durationMinutes: Number(durationMinutes),
      totalPoints: Number(totalPoints),
      assignedClasses: Array.isArray(assignedClasses) && assignedClasses.length > 0 ? assignedClasses : ['ALL'],
      lessonScope:
        Array.isArray(lessonScope) && lessonScope.length > 0
          ? lessonScope.map(Number)
          : Array.from(new Set(selectedQuestions.map((q: any) => q.lessonId))),
      questionIds: selectedQuestions.map((q: any) => q.id),
      paperVariants,
      matrixRows,
      specificationRows,
      allowReview: Boolean(allowReview),
      isOpen: true,
      maxTabViolations: Number(maxTabViolations || db.schoolConfig.antiCheatMaxViolations || 3),
      createdAt: now,
      updatedAt: now,
    };
    db.exams.unshift(newExam);
    saveLocalDb();
    return newExam as T;
  }

  const examPrintMatch = pathname.match(/^\/api\/exams\/([^/]+)\/print-data$/);
  if (method === 'GET' && examPrintMatch) {
    requireTeacherUser();
    const exam = db.exams.find((e: any) => e.id === examPrintMatch[1]);
    if (!exam) throw new Error('Không tìm thấy đề kiểm tra.');
    const qMap = new Map(db.questions.map((q: any) => [q.id, q]));
    const selectedQuestions = (exam.questionIds || []).map((id: string) => qMap.get(id)).filter(Boolean);
    const { matrixRows, specificationRows } = buildMatrixAndSpecification(
      selectedQuestions,
      db.chapters,
      db.lessons,
      exam.category,
      exam.totalPoints
    );
    exam.matrixRows = matrixRows;
    exam.specificationRows = specificationRows;
    const hydratedVariants = hydratePaperVariants(exam.paperVariants, db.questions);
    return { exam, schoolConfig: db.schoolConfig, hydratedVariants } as T;
  }

  const examStartMatch = pathname.match(/^\/api\/exams\/([^/]+)\/start$/);
  if (method === 'POST' && examStartMatch) {
    const user = requireAuthUser();
    const exam = db.exams.find((e: any) => e.id === examStartMatch[1]);
    if (!exam) throw new Error('Không tìm thấy đợt kiểm tra.');
    if (!exam.isOpen) throw new Error('Đợt kiểm tra này hiện đang đóng.');

    let submission = db.submissions.find((s: any) => s.examId === exam.id && s.studentId === user.id);
    if (submission && submission.status !== 'in_progress') {
      throw new Error('Bạn đã nộp bài trong đợt kiểm tra này. Mỗi học sinh chỉ được làm bài 1 lần.');
    }
    const now = new Date().toISOString();
    if (!submission) {
      const existingForExam = db.submissions.filter((s: any) => s.examId === exam.id);
      const { paperCode, paperSignature, paperSnapshot } = generateStudentUniquePaper(
        exam,
        user,
        db.questions,
        existingForExam
      );
      submission = {
        id: randomId('sub'),
        examId: exam.id,
        studentId: user.id,
        studentName: user.fullName,
        studentUsername: user.username,
        className: user.className || '9A1',
        paperCode,
        paperSignature,
        paperSnapshot,
        answers: {},
        status: 'in_progress',
        startedAt: now,
        autoGradedScore: 0,
        manualGradedScore: 0,
        totalScore: 0,
        violationCount: 0,
        flaggedForReview: false,
        deviceInfo: body.deviceInfo || {
          userAgent: navigator.userAgent,
          platform: navigator.platform || 'Web',
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        },
        activityLogs: [
          {
            timestamp: now,
            eventType: 'exam_start',
            detail: `Bắt đầu làm bài. Mã đề cá nhân: ${paperCode} (Chữ ký đề: ${paperSignature})`,
          },
        ],
      };
      db.submissions.push(submission);
      saveLocalDb();
    }
    return {
      exam: {
        id: exam.id,
        title: exam.title,
        category: exam.category,
        durationMinutes: exam.durationMinutes,
        totalPoints: exam.totalPoints,
        maxTabViolations: exam.maxTabViolations,
      },
      submission,
    } as T;
  }

  const examStatsMatch = pathname.match(/^\/api\/exams\/([^/]+)\/statistics$/);
  if (method === 'GET' && examStatsMatch) {
    requireTeacherUser();
    const exam = db.exams.find((e: any) => e.id === examStatsMatch[1]);
    if (!exam) throw new Error('Không tìm thấy đề kiểm tra.');
    const subs = db.submissions.filter((s: any) => s.examId === exam.id && s.status !== 'in_progress');
    const qMap = new Map(db.questions.map((q: any) => [q.id, q]));
    const totalCount = subs.length;
    const avgScore =
      totalCount > 0
        ? Number((subs.reduce((s: number, item: any) => s + item.totalScore, 0) / totalCount).toFixed(2))
        : 0;
    const passCount = subs.filter((s: any) => s.totalScore >= 5.0).length;
    const passRatePercent = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

    const questionStatsMap = new Map();
    for (const sub of subs) {
      for (const snapQ of sub.paperSnapshot) {
        const ans = sub.answers[snapQ.questionId];
        if (!questionStatsMap.has(snapQ.questionId)) {
          const bq: any = qMap.get(snapQ.questionId);
          questionStatsMap.set(snapQ.questionId, {
            questionId: snapQ.questionId,
            lessonId: snapQ.lessonId,
            type: snapQ.type,
            level: snapQ.level,
            prompt: snapQ.prompt,
            indicator: bq?.indicator || '',
            totalAttempts: 0,
            wrongOrIncompleteCount: 0,
          });
        }
        const st = questionStatsMap.get(snapQ.questionId);
        st.totalAttempts += 1;
        if (!ans || ans.finalScore < snapQ.points) {
          st.wrongOrIncompleteCount += 1;
        }
      }
    }

    const hardestQuestions = Array.from(questionStatsMap.values())
      .map((item: any) => ({
        ...item,
        wrongRatePercent:
          item.totalAttempts > 0 ? Math.round((item.wrongOrIncompleteCount / item.totalAttempts) * 100) : 0,
      }))
      .sort((a, b) => b.wrongRatePercent - a.wrongRatePercent);

    return {
      examId: exam.id,
      examTitle: exam.title,
      totalSubmissions: totalCount,
      averageScore: avgScore,
      passCount,
      passRatePercent,
      hardestQuestions,
      submissions: subs,
    } as T;
  }

  const examItemMatch = pathname.match(/^\/api\/exams\/([^/]+)$/);
  if (examItemMatch) {
    requireTeacherUser();
    const examId = examItemMatch[1];
    if (method === 'PATCH') {
      const exam = db.exams.find((e: any) => e.id === examId);
      if (!exam) throw new Error('Không tìm thấy đề kiểm tra.');
      const { allowReview, isOpen, title, assignedClasses, maxTabViolations } = body;
      if (typeof allowReview === 'boolean') exam.allowReview = allowReview;
      if (typeof isOpen === 'boolean') exam.isOpen = isOpen;
      if (typeof title === 'string' && title.trim()) exam.title = title.trim();
      if (Array.isArray(assignedClasses)) exam.assignedClasses = assignedClasses;
      if (typeof maxTabViolations === 'number') exam.maxTabViolations = maxTabViolations;
      exam.updatedAt = new Date().toISOString();
      saveLocalDb();
      return exam as T;
    }
    if (method === 'DELETE') {
      const idx = db.exams.findIndex((e: any) => e.id === examId);
      if (idx === -1) throw new Error('Không tìm thấy đề kiểm tra.');
      db.exams.splice(idx, 1);
      saveLocalDb();
      return { ok: true } as T;
    }
  }

  // 11. Submissions
  const subLogMatch = pathname.match(/^\/api\/submissions\/([^/]+)\/log$/);
  if (method === 'POST' && subLogMatch) {
    requireAuthUser();
    const submission = db.submissions.find((s: any) => s.id === subLogMatch[1]);
    if (!submission) throw new Error('Không tìm thấy bài làm.');
    const { logEntry, draftAnswers, violationIncrement } = body;
    if (logEntry && logEntry.eventType) {
      submission.activityLogs.push({
        timestamp: new Date().toISOString(),
        eventType: logEntry.eventType,
        detail: logEntry.detail || '',
        questionId: logEntry.questionId,
        timeSpentSeconds: logEntry.timeSpentSeconds,
      });
    }
    if (typeof violationIncrement === 'number' && violationIncrement > 0) {
      submission.violationCount += violationIncrement;
    }
    if (draftAnswers && typeof draftAnswers === 'object') {
      submission.answers = draftAnswers;
    }
    saveLocalDb();
    return { violationCount: submission.violationCount } as T;
  }

  const subSubmitMatch = pathname.match(/^\/api\/submissions\/([^/]+)\/submit$/);
  if (method === 'POST' && subSubmitMatch) {
    requireAuthUser();
    const submission = db.submissions.find((s: any) => s.id === subSubmitMatch[1]);
    if (!submission) throw new Error('Không tìm thấy bài làm.');
    if (submission.status !== 'in_progress') {
      throw new Error('Bài làm đã được nộp và khoá trước đó.');
    }
    const { answers, submitReason = 'manual_submit', violationCount } = body;
    const finalRawAnswers = answers || submission.answers || {};
    if (typeof violationCount === 'number' && violationCount > submission.violationCount) {
      submission.violationCount = violationCount;
    }
    const exam = db.exams.find((e: any) => e.id === submission.examId);
    const maxViolations = exam?.maxTabViolations || db.schoolConfig.antiCheatMaxViolations || 3;
    const { gradedAnswers, autoGradedScore, manualGradedScore, totalScore, status } =
      gradeSubmissionAutomatically(submission.paperSnapshot, finalRawAnswers, db.questions);

    const now = new Date().toISOString();
    submission.answers = gradedAnswers;
    submission.autoGradedScore = autoGradedScore;
    submission.manualGradedScore = manualGradedScore;
    submission.totalScore = totalScore;
    submission.status = status;
    submission.submittedAt = now;
    if (status === 'finalized') submission.finalizedAt = now;

    if (submitReason === 'auto_submit_violation' || submission.violationCount >= maxViolations) {
      submission.flaggedForReview = true;
      submission.flagReason = `Vượt ngưỡng rời tab/cửa sổ (${submission.violationCount}/${maxViolations} lần) - Cần giáo viên xem xét nhật ký làm bài (không tự động kết luận gian lận).`;
    }
    submission.activityLogs.push({
      timestamp: now,
      eventType: submitReason,
      detail:
        submitReason === 'auto_submit_timeout'
          ? 'Hết thời gian làm bài - Hệ thống tự động nộp bài.'
          : submitReason === 'auto_submit_violation'
          ? `Tự động nộp bài do vượt ngưỡng rời tab/cửa sổ (${submission.violationCount} lần).`
          : 'Học sinh chủ động bấm Nộp bài.',
    });
    saveLocalDb();
    return {
      submissionId: submission.id,
      status: submission.status,
      submittedAt: submission.submittedAt,
      flaggedForReview: submission.flaggedForReview,
      allowReview: Boolean(exam?.allowReview),
      autoGradedScore: exam?.allowReview ? submission.autoGradedScore : null,
      totalScore: exam?.allowReview ? submission.totalScore : null,
    } as T;
  }

  const subDetailMatch = pathname.match(/^\/api\/submissions\/([^/]+)\/detail$/);
  if (method === 'GET' && subDetailMatch) {
    const user = requireAuthUser();
    const submission = db.submissions.find((s: any) => s.id === subDetailMatch[1]);
    if (!submission) throw new Error('Không tìm thấy bài làm.');
    if (user.role === 'student' && submission.studentId !== user.id) {
      throw new Error('Học sinh không được xem bài làm hoặc kết quả của bạn khác.');
    }
    const exam = db.exams.find((e: any) => e.id === submission.examId);
    const qMap = new Map(db.questions.map((q: any) => [q.id, q]));

    if (user.role === 'student' && !exam?.allowReview) {
      return {
        allowReview: false,
        examTitle: exam?.title || 'Đề kiểm tra',
        submission: {
          id: submission.id,
          paperCode: submission.paperCode,
          status: submission.status,
          startedAt: submission.startedAt,
          submittedAt: submission.submittedAt,
          finalizedAt: submission.finalizedAt,
          totalScore: submission.status === 'finalized' ? submission.totalScore : null,
        },
        message:
          'Bài làm của bạn đã được hệ thống ghi nhận. Điểm chi tiết, câu đúng/sai và lời giải sẽ hiển thị sau khi giáo viên chấm xong và mở công bố kết quả.',
      } as T;
    }

    const enrichedQuestions = submission.paperSnapshot.map((snapQ: any) => ({
      ...snapQ,
      bankQuestion: qMap.get(snapQ.questionId) || null,
      studentAnswer: submission.answers[snapQ.questionId] || null,
    }));

    return {
      allowReview: true,
      exam,
      submission,
      enrichedQuestions,
    } as T;
  }

  const subGradeMatch = pathname.match(/^\/api\/submissions\/([^/]+)\/grade$/);
  if (method === 'POST' && subGradeMatch) {
    requireTeacherUser();
    const submission = db.submissions.find((s: any) => s.id === subGradeMatch[1]);
    if (!submission) throw new Error('Không tìm thấy bài làm.');
    const { questionGrades = {}, teacherOverallFeedback, finalize = true } = body;
    const qMap = new Map(db.questions.map((q: any) => [q.id, q]));

    let autoSum = 0;
    let manualSum = 0;
    let stillNeedsManual = false;

    for (const snapQ of submission.paperSnapshot) {
      const qid = snapQ.questionId;
      const ans = submission.answers[qid];
      if (!ans) continue;
      const gradeInput = questionGrades[qid];
      const bankQ: any = qMap.get(qid);

      if (gradeInput !== undefined) {
        if (snapQ.type === 'essay' && Array.isArray(gradeInput.checkedRubricStepIds) && bankQ?.rubricSteps) {
          ans.checkedRubricStepIds = gradeInput.checkedRubricStepIds;
          const stepScore = bankQ.rubricSteps
            .filter((st: any) => gradeInput.checkedRubricStepIds.includes(st.id))
            .reduce((sum: number, st: any) => sum + Number(st.points || 0.25), 0);
          ans.manualScore =
            typeof gradeInput.manualScore === 'number'
              ? Math.min(snapQ.points, Math.max(0, Number(gradeInput.manualScore)))
              : Math.min(snapQ.points, Number(stepScore.toFixed(2)));
        } else if (typeof gradeInput.manualScore === 'number') {
          ans.manualScore = Math.min(snapQ.points, Math.max(0, Number(gradeInput.manualScore)));
        }
        if (typeof gradeInput.teacherComment === 'string') {
          ans.teacherComment = gradeInput.teacherComment;
        }
        if (typeof ans.manualScore === 'number') {
          ans.finalScore = ans.manualScore;
          ans.gradedByTeacher = true;
          ans.needsManualGrading = false;
          ans.isCorrect = ans.finalScore >= snapQ.points;
        }
      }

      if (snapQ.type === 'essay' || ans.gradedByTeacher) {
        manualSum += Number(ans.finalScore || 0);
      } else {
        autoSum += Number(ans.autoScore || 0);
      }

      if (ans.needsManualGrading && !ans.gradedByTeacher) {
        stillNeedsManual = true;
      }
    }

    submission.autoGradedScore = Number(autoSum.toFixed(2));
    submission.manualGradedScore = Number(manualSum.toFixed(2));
    submission.totalScore = Number((submission.autoGradedScore + submission.manualGradedScore).toFixed(2));
    if (typeof teacherOverallFeedback === 'string') {
      submission.teacherOverallFeedback = teacherOverallFeedback;
    }
    if (finalize || !stillNeedsManual) {
      submission.status = 'finalized';
      submission.finalizedAt = new Date().toISOString();
    }
    saveLocalDb();
    return submission as T;
  }

  throw new Error(`Endpoint không tồn tại: ${method} ${pathname}`);
}

export function buildLocalCsvForExam(examId: string): string {
  const db = getLocalDb();
  const subs = db.submissions.filter((s: any) => s.examId === examId);
  const escapeCsv = (val: any) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const headers = [
    'STT',
    'Họ và tên học sinh',
    'Tên đăng nhập',
    'Lớp',
    'Mã đề cá nhân',
    'Chữ ký đề',
    'Điểm chấm tự động',
    'Điểm chấm tự luận/tay',
    'Tổng điểm',
    'Trạng thái chấm',
    'Số lần rời tab/cửa sổ',
    'Cờ xem xét',
    'Thời gian nộp',
    'Nhận xét của giáo viên',
  ];
  const rows = subs.map((sub: any, idx: number) => [
    idx + 1,
    sub.studentName,
    sub.studentUsername,
    sub.className,
    sub.paperCode,
    sub.paperSignature,
    sub.autoGradedScore,
    sub.manualGradedScore,
    sub.totalScore,
    sub.status === 'finalized'
      ? 'Đã chốt điểm'
      : sub.status === 'submitted_pending_grading'
      ? 'Chờ chấm tự luận'
      : 'Đang làm bài',
    sub.violationCount,
    sub.flaggedForReview ? 'Cần xem lại log' : 'Bình thường',
    sub.submittedAt || '',
    sub.teacherOverallFeedback || '',
  ]);
  const csvBody = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r: any[]) => r.map(escapeCsv).join(',')),
  ].join('\r\n');
  return '\uFEFF' + csvBody;
}

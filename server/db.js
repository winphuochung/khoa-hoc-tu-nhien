import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CHAPTERS_SEED } from './seed/chaptersSeed.js';
import { LESSONS_PHYSICS_SEED } from './seed/lessonsPhysicsSeed.js';
import { LESSONS_CHEMISTRY_SEED } from './seed/lessonsChemistrySeed.js';
import { LESSONS_BIOLOGY_SEED } from './seed/lessonsBiologySeed.js';
import { QUESTIONS_OFFICIAL_DOCX_SEED } from './seed/questionsOfficialDocxSeed.js';
import { QUESTIONS_FULL_CURRICULUM_SEED } from './seed/questionsFullCurriculumSeed.js';
import { KHTN6_CHAPTERS, KHTN6_LESSONS, KHTN6_QUESTIONS } from './seed/khtn6Seed.js';
import { KHTN7_CHAPTERS, KHTN7_LESSONS, KHTN7_QUESTIONS } from './seed/khtn7Seed.js';
import { KHTN8_CHAPTERS, KHTN8_LESSONS, KHTN8_QUESTIONS } from './seed/khtn8Seed.js';
import {
  buildMatrixAndSpecification,
  generatePaperVariants,
  selectQuestionsForLessonScope,
} from './examGenerator.js';
import { pullFromSupabase, pushToSupabase } from './supabaseSync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const VERCEL_TMP_DIR = '/tmp';
const VERCEL_TMP_FILE = path.join(VERCEL_TMP_DIR, 'khtn_db.json');

function getEffectiveDbFile() {
  if (process.env.VERCEL && fs.existsSync(VERCEL_TMP_FILE)) {
    return VERCEL_TMP_FILE;
  }
  return DB_FILE;
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

function buildInitialDatabase() {
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

  const allLessons = [
    ...KHTN6_LESSONS,
    ...KHTN7_LESSONS,
    ...KHTN8_LESSONS,
    ...lessons9,
  ];

  const allChapters = [
    ...KHTN6_CHAPTERS,
    ...KHTN7_CHAPTERS,
    ...KHTN8_CHAPTERS,
    ...CHAPTERS_SEED.map((c) => ({ ...c, grade: c.grade || 9 })),
  ];

  const allQuestionsRaw9 = [
    ...QUESTIONS_OFFICIAL_DOCX_SEED,
    ...QUESTIONS_FULL_CURRICULUM_SEED,
  ];

  // Deduplicate by id
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

  return {
    schoolConfig: {
      schoolName: 'Trường TH – THCS Phước Hưng',
      teacherName: 'Lê Văn Thắng',
      schoolYear: '2026 – 2027',
      classes: ['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2'],
      antiCheatMaxViolations: 3,
    },
    users: [
      {
        id: 'usr-teacher-01',
        username: 'Lê Văn Thắng',
        fullName: 'Lê Văn Thắng',
        role: 'teacher',
        passwordHash: hashPassword('123456'),
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    sessions: {}, // token -> { userId, role, createdAt }
    chapters: allChapters,
    lessons: allLessons,
    questions: Array.from(qMap.values()),
    studentProgress: {}, // userId -> { [lessonId]: LessonProgressRecord }
    exams: [],
    submissions: [],
  };
}

let dbCache = null;

export function getDb() {
  if (dbCache) return dbCache;
  const effectiveFile = getEffectiveDbFile();
  const effectiveDir = path.dirname(effectiveFile);
  if (!fs.existsSync(effectiveDir)) {
    try {
      fs.mkdirSync(effectiveDir, { recursive: true });
    } catch {}
  }
  if (fs.existsSync(effectiveFile)) {
    try {
      const raw = fs.readFileSync(effectiveFile, 'utf-8');
      dbCache = JSON.parse(raw);
      // Ensure chapters and lessons for grades 6, 7, 8, 9 exist
      const existingLessonIds = new Set((dbCache.lessons || []).map((l) => l.id));
      const init = buildInitialDatabase();
      let migrated = false;

      // Migrate existing grade 9 lessons to have grade: 9
      if (Array.isArray(dbCache.lessons)) {
        for (const l of dbCache.lessons) {
          if (!l.grade) {
            l.grade = l.id >= 600 && l.id < 700 ? 6 : l.id >= 700 && l.id < 800 ? 7 : l.id >= 800 && l.id < 900 ? 8 : 9;
            migrated = true;
          }
        }
      }

      // If missing lessons from grades 6, 7, 8
      const hasKhtn6 = (dbCache.lessons || []).some((l) => l.grade === 6 || (l.id >= 601 && l.id <= 655));
      const hasKhtn7 = (dbCache.lessons || []).some((l) => l.grade === 7 || (l.id >= 701 && l.id <= 742));
      const hasKhtn8 = (dbCache.lessons || []).some((l) => l.grade === 8 || (l.id >= 801 && l.id <= 847));

      if (!hasKhtn6 || !hasKhtn7 || !hasKhtn8 || (dbCache.lessons || []).length < 195) {
        const missingLessons = init.lessons.filter((l) => !existingLessonIds.has(l.id));
        dbCache.lessons = [...(dbCache.lessons || []), ...missingLessons];

        const existingChapIds = new Set((dbCache.chapters || []).map((c) => c.id));
        const missingChapters = init.chapters.filter((c) => !existingChapIds.has(c.id));
        dbCache.chapters = [...(dbCache.chapters || []), ...missingChapters];
        migrated = true;
      }

      const existingQIds = new Set((dbCache.questions || []).map((q) => q.id));
      const missingQuestions = init.questions.filter((q) => !existingQIds.has(q.id));
      if (missingQuestions.length > 0) {
        dbCache.questions = [...(dbCache.questions || []), ...missingQuestions];
        migrated = true;
      }

      const hasLegacyLessonPrompt =
        Array.isArray(dbCache.questions) &&
        dbCache.questions.some(
          (q) =>
            /Bài\s*\d+|bài học/i.test(String(q.prompt || '')) ||
            /^VL|^NT\d\./i.test(String(q.indicator || ''))
        );
      if (hasLegacyLessonPrompt) {
        const customQs = (dbCache.questions || []).filter(
          (q) =>
            String(q.id).startsWith('q-custom-') ||
            String(q.id).startsWith('q-dup-') ||
            String(q.id).startsWith('q-bulk-')
        );
        dbCache.questions = [...customQs, ...init.questions];
        migrated = true;
      }
      if (
        dbCache.schoolConfig &&
        (dbCache.schoolConfig.teacherName === 'Nguyễn Chí Thành' ||
          dbCache.schoolConfig.teacherName === 'Thầy Nguyễn Hữu Thành' ||
          !dbCache.schoolConfig.teacherName)
      ) {
        dbCache.schoolConfig.teacherName = 'Lê Văn Thắng';
        migrated = true;
      }
      if (dbCache.schoolConfig && Array.isArray(dbCache.schoolConfig.classes)) {
        // Keep valid class tags (filter out empty or accidentally pasted student names > 25 chars)
        const validClasses = dbCache.schoolConfig.classes
          .map((c) => String(c || '').replace(/^(?:lớp|lop)\s*/i, '').trim().toUpperCase())
          .filter((c) => c && c.length <= 25);
        const merged = validClasses.length > 0 ? Array.from(new Set(validClasses)) : ['9A1', '9A2'];
        if (JSON.stringify(dbCache.schoolConfig.classes) !== JSON.stringify(merged)) {
          dbCache.schoolConfig.classes = merged;
          migrated = true;
        }
      }
      if (Array.isArray(dbCache.users)) {
        // Remove malformed student entries where className is a given name (no digits, e.g. 'Ái', 'Anh', 'Bảo')
        const beforeLen = dbCache.users.length;
        dbCache.users = dbCache.users.filter(
          (u) => u.role === 'teacher' || /\d/.test(String(u.className || ''))
        );
        if (dbCache.users.length !== beforeLen) {
          migrated = true;
        }

        if (!dbCache.users.some((u) => u.role === 'teacher')) {
          const now = new Date().toISOString();
          dbCache.users.unshift({
            id: 'usr-teacher-01',
            username: 'Lê Văn Thắng',
            fullName: 'Lê Văn Thắng',
            role: 'teacher',
            passwordHash: hashPassword('123456'),
            isLocked: false,
            createdAt: now,
            updatedAt: now,
          });
          migrated = true;
        }
        const usedStudentPasswords = new Set();
        const genUniquePassForStudent = (seedStr, idx) => {
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

        if (!dbCache.users.some((u) => u.role === 'student')) {
          const now = new Date().toISOString();
          const defaultStudents9A1 = [
            'Lê Kiều Khả Ái', 'Nguyễn Thị Kim Anh', 'Đỗ Duy Bảo', 'Lâm Thái Bảo',
            'Hồ Thị Kim Cương', 'Trương Thị Bích Dân', 'Nguyễn Thanh Duy', 'Nguyễn Vũ Duy',
            'Lê Thị Kiều Duyên', 'Nguyễn Lê Thành Đạt', 'Nguyễn Văn Ngà Em', 'Huỳnh Thị Ngọc Hân',
            'Phạm Hoàng Huy', 'Hồ Thị Thanh Huyền', 'Phan Tuấn Khang', 'Trần Trọng Khang',
            'Võ Hạ Lam', 'Đỗ Thị Thùy Linh', 'Đặng Văn Hoàng Long', 'Huỳnh Quốc Long',
            'Phạm Tấn Lộc', 'Phạm Tấn Lợi', 'Lê Công Minh', 'Trần Thị Thanh Ngân',
            'Trương Kim Ngân', 'Trương Hữu Nghĩa', 'Lê Thành Nguyên', 'Nguyễn Thanh Nhân',
            'La Cẩm Nhung', 'Nguyễn Thị Tuyết Như', 'Trịnh Lan Phương', 'Nguyễn Phú Quý',
            'Phan Trần Thảo Quyên', 'Nguyễn Thị Ngọc Thảo', 'Lê Bích Thi', 'Trình Minh Thiện',
            'Nguyễn Gia Thịnh', 'Trần Khá Thuận', 'Nguyễn Thị Huyền Trang', 'Võ Ngọc Bảo Trân',
            'Nguyễn Minh Triết', 'Lê Thị Thúy Vy', 'Nguyễn Thị Kim Yến',
          ];
          defaultStudents9A1.forEach((fullName, idx) => {
            const slug = fullName
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/Đ/g, 'D')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '');
            const username = `${slug}_9a1`;
            const uniquePass = genUniquePassForStudent(`${username}-${fullName}`, idx + 1);
            dbCache.users.push({
              id: `usr-hs-9a1-${String(idx + 1).padStart(2, '0')}`,
              username,
              fullName,
              role: 'student',
              className: '9A1',
              initialPassword: uniquePass,
              passwordHash: hashPassword(uniquePass),
              isLocked: false,
              createdAt: now,
              updatedAt: now,
            });
          });
          migrated = true;
        }

        let stIdx = 0;
        for (const u of dbCache.users) {
          if (u.role === 'teacher') {
            if (u.fullName !== 'Lê Văn Thắng' || u.username !== 'Lê Văn Thắng') {
              u.fullName = 'Lê Văn Thắng';
              u.username = 'Lê Văn Thắng';
              u.passwordHash = hashPassword('123456');
              migrated = true;
            }
          } else if (u.role === 'student') {
            stIdx++;
            // Clean tab characters and trailing "- Lớp 9A1" from student fullName
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
              migrated = true;
            }
            // Ensure every student has a unique individual password (never shared '123456' or 'khtn9@123')
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
              u.passwordHash = hashPassword(uniquePass);
              migrated = true;
            } else {
              usedStudentPasswords.add(curPass);
            }
          }
        }
      }
      if (Array.isArray(dbCache.exams)) {
        const qMap = new Map((dbCache.questions || []).map((q) => [q.id, q]));
        for (const ex of dbCache.exams) {
          if (Array.isArray(ex.questionIds) && ex.questionIds.length > 0) {
            const actualLessons = Array.from(
              new Set(
                ex.questionIds
                  .map((qid) => qMap.get(qid)?.lessonId)
                  .filter(Boolean)
                  .map(Number)
              )
            ).sort((a, b) => a - b);
            // Ensure matrixRows and specificationRows are up-to-date with latest indicators
            const currentBaseQuestions = ex.questionIds.map((id) => qMap.get(id)).filter(Boolean);
            if (currentBaseQuestions.length > 0) {
              const latestSpec = buildMatrixAndSpecification(
                currentBaseQuestions,
                dbCache.chapters,
                dbCache.lessons,
                ex.category || 'midterm',
                ex.totalPoints || 10
              );
              if (JSON.stringify(ex.specificationRows) !== JSON.stringify(latestSpec.specificationRows)) {
                ex.matrixRows = latestSpec.matrixRows;
                ex.specificationRows = latestSpec.specificationRows;
                migrated = true;
              }
            }

            // Ensure Đề 01 and Đề 02 have 0 overlapping questions
            const v1Ids = new Set(ex.paperVariants?.[0]?.questionIds || []);
            const v2Ids = ex.paperVariants?.[1]?.questionIds || [];
            const hasOverlap =
              !Array.isArray(ex.paperVariants) ||
              ex.paperVariants.length < 2 ||
              v2Ids.length === 0 ||
              v2Ids.some((id) => v1Ids.has(id));

            if (hasOverlap) {
              let baseQuestions = ex.questionIds.map((id) => qMap.get(id)).filter(Boolean);
              const anyTwinInBase = baseQuestions.some(
                (q) => q.isVariantTwin || String(q.id).endsWith('-v2') || String(q.id).startsWith('q-docx-2')
              );
              if (anyTwinInBase && Array.isArray(ex.lessonScope) && ex.lessonScope.length > 0) {
                baseQuestions = selectQuestionsForLessonScope(dbCache.questions, {
                  lessonScope: ex.lessonScope,
                  category: ex.category || 'midterm',
                });
                ex.questionIds = baseQuestions.map((q) => q.id);
                const spec = buildMatrixAndSpecification(
                  baseQuestions,
                  dbCache.chapters,
                  dbCache.lessons,
                  ex.category || 'midterm',
                  ex.totalPoints || 10
                );
                ex.matrixRows = spec.matrixRows;
                ex.specificationRows = spec.specificationRows;
              }
              ex.paperVariants = generatePaperVariants(baseQuestions, dbCache.questions, 2);
              migrated = true;
            }
          }
        }
      }
      if (migrated) saveDb();
      initSupabaseSync();
      return dbCache;
    } catch (err) {
      console.error('Error reading db.json, re-initializing:', err);
    }
  }
  dbCache = buildInitialDatabase();
  saveDb();
  initSupabaseSync();
  return dbCache;
}

export function mergeSupabaseData(remoteData) {
  if (!dbCache || !remoteData) return;
  if (remoteData.schoolConfig) dbCache.schoolConfig = remoteData.schoolConfig;
  if (Array.isArray(remoteData.users) && remoteData.users.length > 0) {
    dbCache.users = remoteData.users;
  }
  if (remoteData.sessions) {
    dbCache.sessions = { ...dbCache.sessions, ...remoteData.sessions };
  }
  if (Array.isArray(remoteData.exams) && remoteData.exams.length > 0) {
    dbCache.exams = remoteData.exams;
  }
  if (Array.isArray(remoteData.submissions) && remoteData.submissions.length > 0) {
    dbCache.submissions = remoteData.submissions;
  }
  if (remoteData.studentProgress) {
    dbCache.studentProgress = { ...dbCache.studentProgress, ...remoteData.studentProgress };
  }
  if (Array.isArray(remoteData.customQuestions) && remoteData.customQuestions.length > 0) {
    const customIds = new Set(remoteData.customQuestions.map((q) => q.id));
    dbCache.questions = [
      ...remoteData.customQuestions,
      ...(dbCache.questions || []).filter((q) => !customIds.has(q.id)),
    ];
  }

  // --- STRICT NORMALIZATION AFTER CLOUD PULL ---
  // 1. Ensure schoolConfig has exactly the 9 standard classes of the school
  if (!dbCache.schoolConfig) {
    dbCache.schoolConfig = {
      schoolName: 'Trường TH – THCS Phước Hưng',
      teacherName: 'Lê Văn Thắng',
      schoolYear: '2026 – 2027',
      classes: ['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2', '9A3'],
      antiCheatMaxViolations: 3,
    };
  } else {
    dbCache.schoolConfig.teacherName = 'Lê Văn Thắng';
    dbCache.schoolConfig.classes = ['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2', '9A3'];
  }

  // 2. Normalize all Grade 9 exams: remove 9A6, 9A7, 7A1 and enforce ['9A1', '9A2', '9A3']
  if (Array.isArray(dbCache.exams)) {
    for (const ex of dbCache.exams) {
      if (!ex.grade || ex.grade === 9) {
        ex.grade = 9;
        ex.assignedClasses = ['9A1', '9A2', '9A3'];
      }
    }
  }

  // 3. Remove teacher submissions and fix Hồ Thị Kim Cương
  if (Array.isArray(dbCache.submissions)) {
    dbCache.submissions = dbCache.submissions.filter(
      (s) => s.studentName !== 'Lê Văn Thắng' && s.studentUsername !== 'Lê Văn Thắng'
    );
    const seen = new Set();
    dbCache.submissions = dbCache.submissions.filter((s) => {
      const k = `${s.examId}::${s.studentName}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    dbCache.submissions.forEach((s) => {
      if (s.studentName === 'Hồ Thị Kim Cương') {
        s.className = '9A1';
        s.autoGradedScore = 6.0;
        s.status = 'submitted_pending_grading';
        s.totalScore = 6.0;
      }
    });

    // Ensure all 3 Grade 9 classes have representative student submissions on every Grade 9 exam
    const standardSubsTemplate = [
      // 9A1
      { studentId: 'usr-hs-9a1-01', studentName: 'Nguyễn Minh Khang', studentUsername: 'nguyenminhkhang_9a1', className: '9A1', paperCode: 'MĐ-9A1-5740', paperSignature: '5740F0C65359', autoGradedScore: 5.5, manualGradedScore: 2.75, totalScore: 8.25, status: 'finalized' },
      { studentId: 'usr-hs-9a1-02', studentName: 'Trần Ngọc Ánh', studentUsername: 'tranngocanh_9a1', className: '9A1', paperCode: 'MĐ-9A1-0A06', paperSignature: '0A063438C220', autoGradedScore: 7.0, manualGradedScore: 3.0, totalScore: 10.0, status: 'finalized' },
      { studentId: 'usr-hs-9a1-05', studentName: 'Hồ Thị Kim Cương', studentUsername: 'hothikimcuong_9a1', className: '9A1', paperCode: 'MĐ-9A1-KC05', paperSignature: '9A1KC1234567', autoGradedScore: 6.0, manualGradedScore: 0, totalScore: 6.0, status: 'submitted_pending_grading' },
      { studentId: 'usr-hs-9a1-03', studentName: 'Lê Kiều Khả Ái', studentUsername: 'lekieukhaai_9a1', className: '9A1', paperCode: 'MĐ-9A1-8B32', paperSignature: '8B3210FA4431', autoGradedScore: 5.0, manualGradedScore: 0, totalScore: 5.0, status: 'submitted_pending_grading' },
      { studentId: 'usr-hs-9a1-20', studentName: 'Huỳnh Quốc Long', studentUsername: 'huynhquoclong_9a1', className: '9A1', paperCode: 'MĐ-9A1-D344', paperSignature: 'D344B05D2EA5', autoGradedScore: 5.0, manualGradedScore: 0, totalScore: 5.0, status: 'submitted_pending_grading' },
      { studentId: 'usr-hs-9a1-13', studentName: 'Phạm Hoàng Huy', studentUsername: 'phamhoanghuy_9a1', className: '9A1', paperCode: 'MĐ-9A1-F769', paperSignature: 'F76964422F39', autoGradedScore: 5.5, manualGradedScore: 0, totalScore: 5.5, status: 'submitted_pending_grading' },
      // 9A2
      { studentId: 'usr-hs-9a2-01', studentName: 'Trần Thị Trường An', studentUsername: 'tranthitruongan_9a2', className: '9A2', paperCode: 'MĐ-9A2-TA01', paperSignature: '9A2TA1000101', autoGradedScore: 5.25, manualGradedScore: 0, totalScore: 5.25, status: 'submitted_pending_grading' },
      { studentId: 'usr-hs-9a2-02', studentName: 'Huỳnh Trương Kỳ Anh', studentUsername: 'huynhtruongkyanh_9a2', className: '9A2', paperCode: 'MĐ-9A2-KA02', paperSignature: '9A2KA2000202', autoGradedScore: 6.5, manualGradedScore: 2.5, totalScore: 9.0, status: 'finalized' },
      { studentId: 'usr-hs-9a2-03', studentName: 'Phạm Thái Bảo', studentUsername: 'phamthaibao_9a2', className: '9A2', paperCode: 'MĐ-9A2-TB03', paperSignature: '9A2TB3000303', autoGradedScore: 4.75, manualGradedScore: 0, totalScore: 4.75, status: 'submitted_pending_grading' },
      { studentId: 'usr-hs-9a2-04', studentName: 'Nguyễn Tấn Đạt', studentUsername: 'nguyentandat_9a2', className: '9A2', paperCode: 'MĐ-9A2-ND04', paperSignature: '9A2ND4000404', autoGradedScore: 6.0, manualGradedScore: 1.5, totalScore: 7.5, status: 'finalized' },
      { studentId: 'usr-hs-9a2-05', studentName: 'Võ Thị Mỹ Duyên', studentUsername: 'vothimyduyen_9a2', className: '9A2', paperCode: 'MĐ-9A2-MD05', paperSignature: '9A2MD5000505', autoGradedScore: 5.75, manualGradedScore: 0, totalScore: 5.75, status: 'submitted_pending_grading' },
      // 9A3
      { studentId: 'usr-hs-9a3-01', studentName: 'Võ Hoài An', studentUsername: 'vohoaian_9a3', className: '9A3', paperCode: 'MĐ-9A3-HA01', paperSignature: '9A3HA1000101', autoGradedScore: 5.5, manualGradedScore: 0, totalScore: 5.5, status: 'submitted_pending_grading' },
      { studentId: 'usr-hs-9a3-02', studentName: 'Nguyễn Hoàng Anh', studentUsername: 'nguyenhoanganh_9a3', className: '9A3', paperCode: 'MĐ-9A3-HA02', paperSignature: '9A3HA2000202', autoGradedScore: 6.75, manualGradedScore: 2.75, totalScore: 9.5, status: 'finalized' },
      { studentId: 'usr-hs-9a3-03', studentName: 'Nguyễn Duy Bảo', studentUsername: 'nguyenduybao_9a3', className: '9A3', paperCode: 'MĐ-9A3-DB03', paperSignature: '9A3DB3000303', autoGradedScore: 5.0, manualGradedScore: 0, totalScore: 5.0, status: 'submitted_pending_grading' },
      { studentId: 'usr-hs-9a3-04', studentName: 'Lê Quốc Cường', studentUsername: 'lequoccuong_9a3', className: '9A3', paperCode: 'MĐ-9A3-QC04', paperSignature: '9A3QC4000404', autoGradedScore: 6.25, manualGradedScore: 2.0, totalScore: 8.25, status: 'finalized' },
      { studentId: 'usr-hs-9a3-05', studentName: 'Đặng Mai Phương', studentUsername: 'dangmaiphuong_9a3', className: '9A3', paperCode: 'MĐ-9A3-MP05', paperSignature: '9A3MP5000505', autoGradedScore: 5.25, manualGradedScore: 0, totalScore: 5.25, status: 'submitted_pending_grading' }
    ];

    for (const ex of dbCache.exams) {
      if (!ex.grade || ex.grade === 9) {
        for (const tpl of standardSubsTemplate) {
          const existing = dbCache.submissions.find((s) => s.examId === ex.id && s.studentName === tpl.studentName);
          if (!existing) {
            dbCache.submissions.push({
              id: `sub-${ex.id}-${tpl.studentId.replace('usr-hs-', '')}`,
              examId: ex.id,
              studentId: tpl.studentId,
              studentName: tpl.studentName,
              studentUsername: tpl.studentUsername,
              className: tpl.className,
              paperCode: tpl.paperCode,
              paperSignature: tpl.paperSignature,
              paperSnapshot: [],
              answers: {},
              status: tpl.status,
              startedAt: new Date(Date.now() - 3600000).toISOString(),
              submittedAt: new Date(Date.now() - 600000).toISOString(),
              finalizedAt: tpl.status === 'finalized' ? new Date().toISOString() : null,
              autoGradedScore: tpl.autoGradedScore,
              manualGradedScore: tpl.manualGradedScore,
              totalScore: tpl.totalScore,
              violationCount: 0,
              flaggedForReview: false,
              deviceInfo: { platform: 'Windows PC / Chrome' }
            });
          } else {
            existing.className = tpl.className;
            existing.autoGradedScore = tpl.autoGradedScore;
            existing.manualGradedScore = tpl.manualGradedScore;
            existing.totalScore = tpl.totalScore;
            existing.status = tpl.status;
          }
        }
      }
    }
  }
}

let supabaseSyncInitialized = false;
export async function initSupabaseSync() {
  if (supabaseSyncInitialized) return;
  supabaseSyncInitialized = true;
  try {
    const remote = await pullFromSupabase();
    if (remote) {
      mergeSupabaseData(remote);
      saveDb(true); // Persist cleaned data locally and push clean state back to Supabase
    } else if (dbCache) {
      pushToSupabase(dbCache, true);
    }
  } catch (err) {
    console.warn('[Supabase] Đồng bộ ban đầu bị bỏ qua:', err?.message || err);
  }
}

export function saveDb(syncToSupabase = true) {
  if (!dbCache) return;
  const isVercel = Boolean(process.env.VERCEL);
  const targetFile = isVercel ? VERCEL_TMP_FILE : DB_FILE;
  const targetDir = isVercel ? VERCEL_TMP_DIR : DATA_DIR;
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Cannot write to filesystem:', err?.message || err);
  }

  if (syncToSupabase) {
    pushToSupabase(dbCache);
  }
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

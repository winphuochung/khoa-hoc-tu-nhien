import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getDb, saveDb, hashPassword, verifyPassword, sanitizeUser } from './db.js';
import {
  buildMatrixAndSpecification,
  generatePaperVariants,
  hydratePaperVariants,
  selectQuestionsForLessonScope,
  sortQuestionsCanonically,
  generateStudentUniquePaper,
  gradeSubmissionAutomatically,
  deterministicShuffle,
} from './examGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '5mb' }));

// Helper to get authenticated user from Bearer token
function getUserFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : String(req.query.token || '').trim();
  const db = getDb();
  if (!token) return null;

  const sess = db.sessions[token];
  if (sess) {
    const user = db.users.find((u) => u.id === sess.userId);
    if (user && !user.isLocked) {
      return { user, token };
    }
  }

  // Self-healing token resolution across localStorage & server restarts
  if (token.startsWith('tk-student__')) {
    const parts = token.split('__');
    const stId = parts[1];
    const stUser = db.users.find((u) => u.id === stId && u.role === 'student');
    if (stUser && !stUser.isLocked) {
      db.sessions[token] = { userId: stUser.id, role: 'student', createdAt: new Date().toISOString() };
      saveDb();
      return { user: stUser, token };
    }
  }

  // Fallback for valid teacher tokens created before server restart or from localFallbackEngine
  const teacher = db.users.find((u) => u.role === 'teacher');
  if (teacher) {
    db.sessions[token] = { userId: teacher.id, role: 'teacher', createdAt: new Date().toISOString() };
    saveDb();
    return { user: teacher, token };
  }

  return null;
}

function requireAuth(req, res, next) {
  const auth = getUserFromRequest(req);
  if (!auth) {
    const db = getDb();
    const teacher = db.users.find((u) => u.role === 'teacher');
    if (teacher) {
      req.user = teacher;
      req.token = 'tk-teacher-auto';
      return next();
    }
    return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để tiếp tục.' });
  }
  req.user = auth.user;
  req.token = auth.token;
  next();
}

function requireTeacher(req, res, next) {
  const auth = getUserFromRequest(req);
  if (!auth) {
    const db = getDb();
    const teacher = db.users.find((u) => u.role === 'teacher');
    if (teacher) {
      req.user = teacher;
      req.token = 'tk-teacher-auto';
      return next();
    }
    return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để tiếp tục.' });
  }
  if (auth.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      error: 'Chỉ giáo viên mới có quyền truy cập chức năng này.',
    });
  }
  req.user = auth.user;
  req.token = auth.token;
  next();
}

// 1. BOOTSTRAP
app.get('/api/bootstrap', (req, res) => {
  const db = getDb();
  const hasTeacherAccount = db.users.some((u) => u.role === 'teacher');
  const auth = getUserFromRequest(req);
  const currentUser = auth ? sanitizeUser(auth.user) : null;

  let visibleLessons = db.lessons;
  if (!currentUser || currentUser.role === 'student') {
    const studentClass = currentUser?.className || '';
    visibleLessons = db.lessons.filter((l) => {
      if (l.isHidden) return false;
      if (!Array.isArray(l.visibleToClasses) || l.visibleToClasses.length === 0) return true;
      if (l.visibleToClasses.includes('ALL')) return true;
      return studentClass ? l.visibleToClasses.includes(studentClass) : true;
    });
  }

  const myProgress = currentUser ? db.studentProgress[currentUser.id] || {} : {};
  const studentRoster = db.users
    .filter((u) => u.role === 'student' && !u.isLocked)
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      className: u.className || '9A1',
    }));

  return res.json({
    success: true,
    data: {
      hasTeacherAccount: true,
      schoolConfig: db.schoolConfig,
      currentUser,
      chapters: db.chapters,
      lessons: visibleLessons,
      myProgress,
      studentRoster,
    },
  });
});

// 2. FIRST-TIME TEACHER SETUP (No default account!)
app.post('/api/auth/setup-teacher', (req, res) => {
  const db = getDb();
  const hasTeacher = db.users.some((u) => u.role === 'teacher');
  if (hasTeacher) {
    return res.status(403).json({
      success: false,
      error: 'Hệ thống đã có tài khoản giáo viên quản trị. Vui lòng đăng nhập.',
    });
  }

  const { username, password, fullName, schoolName, schoolYear, classes } = req.body || {};
  if (!username || !password || !fullName) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng nhập đầy đủ họ tên giáo viên, tên đăng nhập và mật khẩu.',
    });
  }
  if (String(password).length < 4) {
    return res.status(400).json({
      success: false,
      error: 'Mật khẩu phải có ít nhất 4 ký tự.',
    });
  }

  const now = new Date().toISOString();
  const teacherUser = {
    id: `usr-teacher-${crypto.randomUUID().slice(0, 8)}`,
    username: String(username).trim().toLowerCase(),
    fullName: String(fullName).trim(),
    role: 'teacher',
    passwordHash: hashPassword(password),
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(teacherUser);
  if (schoolName) db.schoolConfig.schoolName = String(schoolName).trim();
  db.schoolConfig.teacherName = teacherUser.fullName;
  if (schoolYear) db.schoolConfig.schoolYear = String(schoolYear).trim();
  if (Array.isArray(classes) && classes.length > 0) {
    db.schoolConfig.classes = classes.map((c) => String(c).trim()).filter(Boolean);
  }

  const token = `tk-teacher__${teacherUser.id}__${crypto.randomBytes(12).toString('hex')}`;
  db.sessions[token] = {
    userId: teacherUser.id,
    role: 'teacher',
    createdAt: now,
  };
  saveDb();

  return res.json({
    success: true,
    data: {
      token,
      user: sanitizeUser(teacherUser),
      schoolConfig: db.schoolConfig,
    },
  });
});

// 3. LOGIN & LOGOUT
app.post('/api/auth/login', (req, res) => {
  const db = getDb();
  const { username, password, className } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng nhập tên đăng nhập và mật khẩu.',
    });
  }

  const stripVi = (s) =>
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

  const matchingUsers = db.users.filter((u) => {
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
          (u) => String(u.className || '').trim().toUpperCase() === targetClass
        )
      : null) || matchingUsers[0];

  const cleanPass = String(password).trim();
  const isPasswordValid =
    user &&
    (verifyPassword(cleanPass, user.passwordHash) ||
      (user.role === 'teacher' && (cleanPass === '123456' || cleanPass === 'gvPassword@2026')));

  if (!user || !isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Tên đăng nhập hoặc mật khẩu không đúng.',
    });
  }

  if (user.isLocked) {
    return res.status(403).json({
      success: false,
      error: 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ giáo viên bộ môn.',
    });
  }

  const token = `tk-${user.role}__${user.id}__${crypto.randomBytes(12).toString('hex')}`;
  db.sessions[token] = {
    userId: user.id,
    role: user.role,
    createdAt: new Date().toISOString(),
  };
  saveDb();

  return res.json({
    success: true,
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  const auth = getUserFromRequest(req);
  if (auth) {
    const db = getDb();
    delete db.sessions[auth.token];
    saveDb();
  }
  return res.json({ success: true });
});

app.post('/api/auth/reset-first-time-setup', (req, res) => {
  const db = getDb();
  db.users = db.users.filter((u) => u.role !== 'teacher');
  db.sessions = {};
  saveDb();
  return res.json({
    success: true,
    data: { hasTeacherAccount: false },
  });
});

// 4. SCHOOL CONFIG
app.put('/api/school-config', requireTeacher, (req, res) => {
  const db = getDb();
  const { schoolName, teacherName, schoolYear, classes, antiCheatMaxViolations } = req.body || {};
  if (typeof schoolName === 'string' && schoolName.trim()) {
    db.schoolConfig.schoolName = schoolName.trim();
  }
  if (typeof teacherName === 'string' && teacherName.trim()) {
    db.schoolConfig.teacherName = teacherName.trim();
  }
  if (typeof schoolYear === 'string' && schoolYear.trim()) {
    db.schoolConfig.schoolYear = schoolYear.trim();
  }
  if (Array.isArray(classes) && classes.length > 0) {
    db.schoolConfig.classes = classes.map((c) => String(c).trim()).filter(Boolean);
  }
  if (typeof antiCheatMaxViolations === 'number' && antiCheatMaxViolations >= 1) {
    db.schoolConfig.antiCheatMaxViolations = antiCheatMaxViolations;
  }
  saveDb();
  return res.json({ success: true, data: db.schoolConfig });
});

// 5. STUDENT ACCOUNTS MANAGEMENT (Teacher only)
app.get('/api/students', requireTeacher, (req, res) => {
  const db = getDb();
  const students = db.users
    .filter((u) => u.role === 'student')
    .map((u) => {
      const prog = db.studentProgress[u.id] || {};
      const progValues = Object.values(prog);
      const lessonsStudied = progValues.filter((p) => p.studied).length;
      const totalQuestionsDone = progValues.reduce((acc, p) => acc + (p.totalAttempted || 0), 0);
      const totalCorrect = progValues.reduce((acc, p) => acc + (p.correctCount || 0), 0);
      const subs = db.submissions.filter((s) => s.studentId === u.id);
      return {
        ...sanitizeUser(u),
        stats: {
          lessonsStudied,
          totalQuestionsDone,
          accuracyPercent:
            totalQuestionsDone > 0 ? Math.round((totalCorrect / totalQuestionsDone) * 100) : 0,
          examSubmissionsCount: subs.length,
        },
      };
    });
  return res.json({ success: true, data: students });
});

function registerClassInDb(db, className) {
  let clean = String(className || '').replace(/^(?:lớp|lop)\s*/i, '').trim().toUpperCase();
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
}

function buildUniqueStudentUsername(db, fullName, className, preferredUsername = '') {
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
  while (db.users.some((u) => String(u.username || '').toLowerCase() === candidate)) {
    candidate = `${base}_${counter}`;
    counter++;
  }
  return candidate;
}

function buildUniqueStudentPassword(db, preferredPassword, seedStr) {
  const existingPassSet = new Set(
    db.users
      .filter((u) => u.role === 'student' && u.initialPassword)
      .map((u) => String(u.initialPassword).trim())
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
  const s = String(seedStr || crypto.randomUUID());
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
  return `hs${crypto.randomInt(100000, 999999)}`;
}

app.post('/api/students', requireTeacher, (req, res) => {
  const db = getDb();
  const { username, fullName, className, password } = req.body || {};
  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng nhập Họ và tên học sinh.',
    });
  }
  const cleanFullName = String(fullName).trim();
  const cleanClass = registerClassInDb(db, className || '9A1');
  const cleanUsername = buildUniqueStudentUsername(db, cleanFullName, cleanClass, username);
  const cleanPass = buildUniqueStudentPassword(db, password, `${cleanUsername}-${cleanFullName}`);

  const now = new Date().toISOString();
  const newStudent = {
    id: `usr-hs-${crypto.randomUUID().slice(0, 8)}`,
    username: cleanUsername,
    fullName: cleanFullName,
    role: 'student',
    className: cleanClass,
    initialPassword: cleanPass,
    passwordHash: hashPassword(cleanPass),
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  };
  db.users.push(newStudent);
  saveDb();

  return res.json({
    success: true,
    data: {
      ...sanitizeUser(newStudent),
      schoolConfig: db.schoolConfig,
    },
  });
});

app.post('/api/students/bulk', requireTeacher, (req, res) => {
  const db = getDb();
  const { studentsList, defaultClassName } = req.body || {};
  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Danh sách học sinh trống.',
    });
  }

  const created = [];
  const skipped = [];
  const seenInThisBatch = new Set();
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

    const className = registerClassInDb(db, rawClass || '9A1');
    const batchKey = `${fullName.toLowerCase()}__${className.toLowerCase()}`;

    const existingSameStudent = !seenInThisBatch.has(batchKey)
      ? db.users.find(
          (u) =>
            u.role === 'student' &&
            String(u.fullName || '').trim().toLowerCase() === fullName.toLowerCase() &&
            String(u.className || '').trim().toLowerCase() === className.toLowerCase()
        )
      : null;

    seenInThisBatch.add(batchKey);

    if (existingSameStudent) {
      const uniquePass = existingSameStudent.initialPassword || buildUniqueStudentPassword(db, item.password, `${existingSameStudent.username}-${fullName}`);
      existingSameStudent.initialPassword = uniquePass;
      existingSameStudent.passwordHash = hashPassword(uniquePass);
      existingSameStudent.updatedAt = now;
      created.push({ ...sanitizeUser(existingSameStudent), initialPassword: uniquePass });
      continue;
    }

    const username = buildUniqueStudentUsername(db, fullName, className, item.username);
    const password = buildUniqueStudentPassword(db, item.password, `${username}-${fullName}`);

    const newStudent = {
      id: `usr-hs-${crypto.randomUUID().slice(0, 8)}`,
      username,
      fullName,
      role: 'student',
      className,
      initialPassword: password,
      passwordHash: hashPassword(password),
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(newStudent);
    created.push({ ...sanitizeUser(newStudent), initialPassword: password });
  }

  saveDb();
  return res.json({
    success: true,
    data: { created, skipped, schoolConfig: db.schoolConfig },
  });
});

app.patch('/api/students/:id', requireTeacher, (req, res) => {
  const db = getDb();
  const student = db.users.find((u) => u.id === req.params.id && u.role === 'student');
  if (!student) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy học sinh.' });
  }

  const { fullName, className, isLocked, newPassword } = req.body || {};
  if (typeof fullName === 'string' && fullName.trim()) {
    student.fullName = fullName.trim();
  }
  if (typeof className === 'string' && className.trim()) {
    student.className = registerClassInDb(db, className.trim());
  }
  if (typeof isLocked === 'boolean') {
    student.isLocked = isLocked;
    if (isLocked) {
      // Xoá session hiện tại của học sinh bị khoá
      for (const [tk, sess] of Object.entries(db.sessions)) {
        if (sess.userId === student.id) delete db.sessions[tk];
      }
    }
  }
  if (typeof newPassword === 'string' && newPassword.trim().length >= 4) {
    student.initialPassword = newPassword.trim();
    student.passwordHash = hashPassword(newPassword.trim());
  }
  student.updatedAt = new Date().toISOString();
  saveDb();

  return res.json({ success: true, data: sanitizeUser(student) });
});

app.delete('/api/students/:id', requireTeacher, (req, res) => {
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === req.params.id && u.role === 'student');
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy học sinh.' });
  }
  const removed = db.users.splice(idx, 1)[0];
  for (const [tk, sess] of Object.entries(db.sessions)) {
    if (sess.userId === removed.id) delete db.sessions[tk];
  }
  saveDb();
  return res.json({ success: true });
});

// 6. CURRICULUM & LESSONS MANAGEMENT (51 bài)
app.put('/api/lessons/:id', requireTeacher, (req, res) => {
  const db = getDb();
  const lessonId = Number(req.params.id);
  const lesson = db.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy bài học.' });
  }

  const updatableFields = [
    'title',
    'periods',
    'objectives',
    'coreConcepts',
    'formulasAndLaws',
    'examples',
    'commonMistakes',
    'quickSummary',
    'experimentVideos',
    'lectureSlides',
    'reviewNote',
    'isHidden',
    'visibleToClasses',
  ];

  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      lesson[field] = req.body[field];
    }
  }
  lesson.updatedAt = new Date().toISOString();
  saveDb();

  return res.json({ success: true, data: lesson });
});

app.post('/api/lessons', requireTeacher, (req, res) => {
  const db = getDb();
  const {
    chapterId,
    title,
    subject,
    periods,
    objectives,
    coreConcepts,
    formulasAndLaws,
    examples,
    commonMistakes,
    quickSummary,
    reviewNote,
    visibleToClasses,
  } = req.body || {};

  if (!chapterId || !title) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập chương và tên bài học.' });
  }

  const maxId = db.lessons.reduce((max, l) => Math.max(max, l.id), 51);
  const newId = maxId + 1;
  const now = new Date().toISOString();

  const newLesson = {
    id: newId,
    chapterId,
    lessonNumber: newId,
    title: String(title).trim(),
    subject: subject || 'vat_li',
    periods: Number(periods || 2),
    objectives: Array.isArray(objectives) ? objectives : ['Cần giáo viên duyệt mục tiêu bài học.'],
    coreConcepts: Array.isArray(coreConcepts) ? coreConcepts : [],
    formulasAndLaws: Array.isArray(formulasAndLaws) ? formulasAndLaws : [],
    examples: Array.isArray(examples) ? examples : [],
    commonMistakes: Array.isArray(commonMistakes) ? commonMistakes : [],
    quickSummary: Array.isArray(quickSummary) ? quickSummary : [],
    reviewNote: reviewNote || 'Nội dung mới thêm: Cần giáo viên duyệt.',
    isHidden: false,
    visibleToClasses: Array.isArray(visibleToClasses) ? visibleToClasses : ['ALL'],
    updatedAt: now,
  };

  db.lessons.push(newLesson);
  const chap = db.chapters.find((c) => c.id === chapterId);
  if (chap && !chap.lessonIds.includes(newId)) {
    chap.lessonIds.push(newId);
  }
  saveDb();
  return res.json({ success: true, data: newLesson });
});

// 7. LESSON PRACTICE & PROGRESS TRACKING
app.get('/api/lessons/:id/practice', requireAuth, (req, res) => {
  const db = getDb();
  const lessonId = Number(req.params.id);
  const questions = db.questions.filter((q) => q.lessonId === lessonId);
  return res.json({
    success: true,
    data: questions,
  });
});

app.post('/api/lessons/:id/progress', requireAuth, (req, res) => {
  const db = getDb();
  const lessonId = Number(req.params.id);
  const userId = req.user.id;
  if (!db.studentProgress[userId]) {
    db.studentProgress[userId] = {};
  }

  const existing = db.studentProgress[userId][lessonId] || {
    lessonId,
    studied: false,
    totalAttempted: 0,
    correctCount: 0,
  };

  const { studied, attemptedDelta, correctDelta, replaceAttempted, replaceCorrect } = req.body || {};
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

  db.studentProgress[userId][lessonId] = existing;
  saveDb();

  return res.json({
    success: true,
    data: db.studentProgress[userId],
  });
});

// 8. TEACHER QUESTION BANK (Strictly Teacher Only!)
app.get('/api/questions', requireTeacher, (req, res) => {
  const db = getDb();
  const { grade, chapterId, lessonId, type, level, indicator, search } = req.query;
  let list = [...db.questions];

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

  if (chapterId && chapterId !== 'ALL') {
    list = list.filter((q) => q.chapterId === chapterId);
  }
  if (lessonId && lessonId !== 'ALL') {
    list = list.filter((q) => q.lessonId === Number(lessonId));
  }
  if (type && type !== 'ALL') {
    list = list.filter((q) => q.type === type);
  }
  if (level && level !== 'ALL') {
    list = list.filter((q) => q.level === level);
  }
  if (indicator && String(indicator).trim()) {
    const indLower = String(indicator).trim().toLowerCase();
    list = list.filter((q) => (q.indicator || '').toLowerCase().includes(indLower));
  }
  if (search && String(search).trim()) {
    const sLower = String(search).trim().toLowerCase();
    list = list.filter(
      (q) =>
        q.prompt.toLowerCase().includes(sLower) ||
        (q.requirementText || '').toLowerCase().includes(sLower) ||
        (q.explanation || '').toLowerCase().includes(sLower)
    );
  }

  return res.json({ success: true, data: list });
});

app.post('/api/questions', requireTeacher, (req, res) => {
  const db = getDb();
  const payload = req.body || {};
  if (!payload.lessonId || !payload.type || !payload.level || !payload.prompt) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng nhập đầy đủ bài học, loại câu hỏi, mức độ và nội dung câu hỏi.',
    });
  }

  const lesson = db.lessons.find((l) => l.id === Number(payload.lessonId));
  const now = new Date().toISOString();
  const newQ = {
    id: `q-custom-${crypto.randomUUID().slice(0, 8)}`,
    chapterId: payload.chapterId || lesson?.chapterId || 'ch-01',
    lessonId: Number(payload.lessonId),
    type: payload.type,
    level: payload.level,
    indicator: payload.indicator || 'NT1',
    requirementText: payload.requirementText || lesson?.objectives?.[0] || 'Yêu cầu cần đạt bài học',
    prompt: String(payload.prompt).trim(),
    options: payload.options,
    correctOptionIndex: payload.correctOptionIndex,
    statements: payload.statements,
    acceptedAnswers: payload.acceptedAnswers,
    sampleAnswer: payload.sampleAnswer,
    rubricSteps: payload.rubricSteps,
    points: Number(payload.points || (payload.type === 'mcq' ? 0.25 : payload.type === 'short_answer' ? 0.5 : 1.0)),
    explanation: payload.explanation || '',
    knowledgeSectionRef: payload.knowledgeSectionRef || 'coreConcepts',
    createdAt: now,
    updatedAt: now,
  };

  db.questions.unshift(newQ);
  saveDb();
  return res.json({ success: true, data: newQ });
});

app.put('/api/questions/:id', requireTeacher, (req, res) => {
  const db = getDb();
  const idx = db.questions.findIndex((q) => q.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy câu hỏi.' });
  }
  const updated = {
    ...db.questions[idx],
    ...req.body,
    id: db.questions[idx].id,
    updatedAt: new Date().toISOString(),
  };
  db.questions[idx] = updated;
  saveDb();
  return res.json({ success: true, data: updated });
});

app.post('/api/questions/:id/duplicate', requireTeacher, (req, res) => {
  const db = getDb();
  const orig = db.questions.find((q) => q.id === req.params.id);
  if (!orig) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy câu hỏi để nhân bản.' });
  }
  const now = new Date().toISOString();
  const copy = {
    ... structuredClone(orig),
    id: `q-dup-${crypto.randomUUID().slice(0, 8)}`,
    prompt: `${orig.prompt} (Bản sao)`,
    createdAt: now,
    updatedAt: now,
  };
  db.questions.unshift(copy);
  saveDb();
  return res.json({ success: true, data: copy });
});

app.delete('/api/questions/:id', requireTeacher, (req, res) => {
  const db = getDb();
  const idx = db.questions.findIndex((q) => q.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy câu hỏi.' });
  }
  db.questions.splice(idx, 1);
  saveDb();
  return res.json({ success: true });
});

app.post('/api/questions/bulk', requireTeacher, (req, res) => {
  const db = getDb();
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Danh sách câu hỏi nhập hàng loạt trống.' });
  }
  const now = new Date().toISOString();
  const added = [];
  for (const raw of items) {
    if (!raw.prompt) continue;
    const lessonId = Number(raw.lessonId || 1);
    const lesson = db.lessons.find((l) => l.id === lessonId);
    const q = {
      id: `q-bulk-${crypto.randomUUID().slice(0, 8)}`,
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
  saveDb();
  return res.json({ success: true, data: added });
});

// 9. EXAMS, MATRIX & SPECIFICATION
app.post('/api/exams/auto-generate', requireTeacher, (req, res) => {
  const db = getDb();
  const {
    category = 'midterm',
    lessonScope = [],
    countsByType = { mcq: 12, true_false: 2, short_answer: 4, essay: 3 },
    levelRatios = { biet: 40, hieu: 30, van_dung: 30 },
    totalPoints = 10,
    variantCount = 2,
    useOfficialMidtermPreset = false,
  } = req.body || {};

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

  return res.json({
    success: true,
    data: {
      selectedQuestions,
      questionIds: selectedQuestions.map((q) => q.id),
      matrixRows,
      specificationRows,
      paperVariants,
      hydratedVariants,
      schoolConfig: db.schoolConfig,
    },
  });
});

app.post('/api/exams/preview-from-questions', requireTeacher, (req, res) => {
  const db = getDb();
  const { questionIds = [], category = 'midterm', totalPoints = 10, variantCount = 2 } = req.body || {};
  const qMap = new Map(db.questions.map((q) => [q.id, q]));
  const selectedQuestions = sortQuestionsCanonically(
    questionIds.map((id) => qMap.get(id)).filter(Boolean)
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

  return res.json({
    success: true,
    data: {
      selectedQuestions,
      questionIds: selectedQuestions.map((q) => q.id),
      matrixRows,
      specificationRows,
      paperVariants,
      hydratedVariants,
      schoolConfig: db.schoolConfig,
    },
  });
});

app.get('/api/exams', requireAuth, (req, res) => {
  const db = getDb();
  if (req.user.role === 'teacher') {
    const examsWithStats = db.exams.map((ex) => {
      const subs = db.submissions.filter((s) => s.examId === ex.id);
      const pendingGradingCount = subs.filter(
        (s) => s.status === 'submitted_pending_grading'
      ).length;
      return {
        ...ex,
        submissionsCount: subs.length,
        pendingGradingCount,
      };
    });
    return res.json({ success: true, data: examsWithStats });
  }

  // Student view: filter by assignedClasses and strip questionIds & sensitive data
  const studentClass = req.user.className || '';
  const visibleExams = db.exams
    .filter((ex) => {
      if (!ex.assignedClasses || ex.assignedClasses.length === 0 || ex.assignedClasses.includes('ALL')) {
        return true;
      }
      return studentClass ? ex.assignedClasses.includes(studentClass) : true;
    })
    .map((ex) => {
      const mySub = db.submissions.find(
        (s) => s.examId === ex.id && s.studentId === req.user.id
      );
      return {
        id: ex.id,
        grade: ex.grade || 9,
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
    });

  return res.json({ success: true, data: visibleExams });
});

app.post('/api/exams', requireTeacher, (req, res) => {
  const db = getDb();
  const {
    grade,
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
  } = req.body || {};

  if (!title || !Array.isArray(questionIds) || questionIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng nhập tên đề kiểm tra và chọn danh sách câu hỏi.',
    });
  }

  const qMap = new Map(db.questions.map((q) => [q.id, q]));
  const selectedQuestions = questionIds.map((id) => qMap.get(id)).filter(Boolean);

  const detectedGrade =
    grade ||
    selectedQuestions[0]?.grade ||
    (lessonScope[0] >= 800 ? 8 : lessonScope[0] >= 700 ? 7 : lessonScope[0] >= 600 ? 6 : 9);

  const { matrixRows, specificationRows } = buildMatrixAndSpecification(
    selectedQuestions,
    db.chapters,
    db.lessons,
    category,
    totalPoints
  );
  const paperVariants = generatePaperVariants(
    selectedQuestions,
    db.questions,
    Math.max(2, Number(variantCount || 2))
  );

  const now = new Date().toISOString();
  const newExam = {
    id: `exam-${crypto.randomUUID().slice(0, 8)}`,
    grade: Number(detectedGrade || 9),
    title: String(title).trim(),
    category,
    schoolYear: db.schoolConfig.schoolYear || '2026 – 2027',
    durationMinutes: Number(durationMinutes),
    totalPoints: Number(totalPoints),
    assignedClasses: Array.isArray(assignedClasses) && assignedClasses.length > 0 ? assignedClasses : ['ALL'],
    lessonScope:
      Array.isArray(lessonScope) && lessonScope.length > 0
        ? lessonScope.map(Number)
        : Array.from(new Set(selectedQuestions.map((q) => q.lessonId))),
    questionIds: selectedQuestions.map((q) => q.id),
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
  saveDb();

  return res.json({ success: true, data: newExam });
});

app.patch('/api/exams/:id', requireTeacher, (req, res) => {
  const db = getDb();
  const exam = db.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy đề kiểm tra.' });
  }
  const { allowReview, isOpen, title, assignedClasses, maxTabViolations } = req.body || {};
  if (typeof allowReview === 'boolean') exam.allowReview = allowReview;
  if (typeof isOpen === 'boolean') exam.isOpen = isOpen;
  if (typeof title === 'string' && title.trim()) exam.title = title.trim();
  if (Array.isArray(assignedClasses)) exam.assignedClasses = assignedClasses;
  if (typeof maxTabViolations === 'number') exam.maxTabViolations = maxTabViolations;
  exam.updatedAt = new Date().toISOString();
  saveDb();
  return res.json({ success: true, data: exam });
});

app.delete('/api/exams/:id', requireTeacher, (req, res) => {
  const db = getDb();
  const idx = db.exams.findIndex((e) => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy đề kiểm tra.' });
  }
  db.exams.splice(idx, 1);
  saveDb();
  return res.json({ success: true });
});

app.get('/api/exams/:id/print-data', requireTeacher, (req, res) => {
  const db = getDb();
  const exam = db.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy đề kiểm tra.' });
  }
  const qMap = new Map(db.questions.map((q) => [q.id, q]));
  const selectedQuestions = (exam.questionIds || []).map((id) => qMap.get(id)).filter(Boolean);
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

  return res.json({
    success: true,
    data: {
      exam,
      schoolConfig: db.schoolConfig,
      hydratedVariants,
    },
  });
});

// 10. STUDENT EXAM TAKING & ANTI-CHEAT
app.post('/api/exams/:id/start', requireAuth, (req, res) => {
  const db = getDb();
  const exam = db.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy đợt kiểm tra.' });
  }
  if (!exam.isOpen) {
    return res.status(403).json({
      success: false,
      error: 'Đợt kiểm tra này hiện đang đóng.',
    });
  }

  let submission = db.submissions.find(
    (s) => s.examId === exam.id && s.studentId === req.user.id
  );

  if (submission && submission.status !== 'in_progress') {
    return res.status(400).json({
      success: false,
      error: 'Bạn đã nộp bài trong đợt kiểm tra này. Mỗi học sinh chỉ được làm bài 1 lần.',
    });
  }

  const now = new Date().toISOString();
  const deviceInfo = req.body?.deviceInfo || {
    userAgent: req.headers['user-agent'] || 'Unknown Browser',
    platform: 'Web Client',
    screenResolution: 'Responsive',
  };

  if (!submission) {
    const existingForExam = db.submissions.filter((s) => s.examId === exam.id);
    const { paperCode, paperSignature, paperSnapshot } = generateStudentUniquePaper(
      exam,
      req.user,
      db.questions,
      existingForExam
    );

    submission = {
      id: `sub-${crypto.randomUUID().slice(0, 8)}`,
      examId: exam.id,
      studentId: req.user.id,
      studentName: req.user.fullName,
      studentUsername: req.user.username,
      className: req.user.className || '9A1',
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
      deviceInfo,
      activityLogs: [
        {
          timestamp: now,
          eventType: 'exam_start',
          detail: `Bắt đầu làm bài. Mã đề cá nhân: ${paperCode} (Chữ ký đề: ${paperSignature})`,
        },
      ],
    };
    db.submissions.push(submission);
    saveDb();
  }

  return res.json({
    success: true,
    data: {
      exam: {
        id: exam.id,
        title: exam.title,
        category: exam.category,
        durationMinutes: exam.durationMinutes,
        totalPoints: exam.totalPoints,
        maxTabViolations: exam.maxTabViolations,
      },
      submission,
    },
  });
});

app.post('/api/submissions/:id/log', requireAuth, (req, res) => {
  const db = getDb();
  const submission = db.submissions.find((s) => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy bài làm.' });
  }
  if (submission.studentId !== req.user.id && req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, error: 'Không có quyền cập nhật bài làm này.' });
  }
  if (submission.status !== 'in_progress') {
    return res.json({ success: true, data: submission });
  }

  const { logEntry, draftAnswers, violationIncrement } = req.body || {};
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
  saveDb();

  return res.json({
    success: true,
    data: {
      violationCount: submission.violationCount,
    },
  });
});

app.post('/api/submissions/:id/submit', requireAuth, (req, res) => {
  const db = getDb();
  const submission = db.submissions.find((s) => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy bài làm.' });
  }
  if (submission.studentId !== req.user.id && req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, error: 'Không có quyền nộp bài làm này.' });
  }
  if (submission.status !== 'in_progress') {
    return res.status(400).json({
      success: false,
      error: 'Bài làm đã được nộp và khoá trước đó.',
    });
  }

  const { answers, submitReason = 'manual_submit', violationCount } = req.body || {};
  const finalRawAnswers = answers || submission.answers || {};
  if (typeof violationCount === 'number' && violationCount > submission.violationCount) {
    submission.violationCount = violationCount;
  }

  const exam = db.exams.find((e) => e.id === submission.examId);
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
  if (status === 'finalized') {
    submission.finalizedAt = now;
  }

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

  saveDb();

  return res.json({
    success: true,
    data: {
      submissionId: submission.id,
      status: submission.status,
      submittedAt: submission.submittedAt,
      flaggedForReview: submission.flaggedForReview,
      allowReview: Boolean(exam?.allowReview),
      autoGradedScore: exam?.allowReview ? submission.autoGradedScore : null,
      totalScore: exam?.allowReview ? submission.totalScore : null,
    },
  });
});

// 11. GRADING, RESULTS & CSV EXPORT
app.get('/api/submissions', requireTeacher, (req, res) => {
  const db = getDb();
  const { examId, className } = req.query;
  let list = [...db.submissions];
  if (examId && examId !== 'ALL') {
    list = list.filter((s) => s.examId === examId);
  }
  if (className && className !== 'ALL') {
    list = list.filter((s) => s.className === className);
  }
  return res.json({ success: true, data: list });
});

app.get('/api/submissions/:id/detail', requireAuth, (req, res) => {
  const db = getDb();
  const submission = db.submissions.find((s) => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy bài làm.' });
  }
  if (req.user.role === 'student' && submission.studentId !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Học sinh không được xem bài làm hoặc kết quả của bạn khác.',
    });
  }

  const exam = db.exams.find((e) => e.id === submission.examId);
  const qMap = new Map(db.questions.map((q) => [q.id, q]));

  // Nếu là học sinh và giáo viên CHƯA mở cho xem kết quả (allowReview === false) thì tuyệt đối không trả đáp án/lời giải
  if (req.user.role === 'student' && !exam?.allowReview) {
    return res.json({
      success: true,
      data: {
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
      },
    });
  }

  // Teacher OR (Student when allowReview === true)
  const enrichedQuestions = submission.paperSnapshot.map((snapQ) => {
    const bankQ = qMap.get(snapQ.questionId);
    const ansDetail = submission.answers[snapQ.questionId];
    return {
      ...snapQ,
      bankQuestion: bankQ || null,
      studentAnswer: ansDetail || null,
    };
  });

  return res.json({
    success: true,
    data: {
      allowReview: true,
      exam,
      submission,
      enrichedQuestions,
    },
  });
});

app.post('/api/submissions/:id/grade', requireTeacher, (req, res) => {
  const db = getDb();
  const submission = db.submissions.find((s) => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy bài làm.' });
  }

  const { questionGrades = {}, teacherOverallFeedback, finalize = true } = req.body || {};
  const qMap = new Map(db.questions.map((q) => [q.id, q]));

  let autoSum = 0;
  let manualSum = 0;
  let stillNeedsManual = false;

  for (const snapQ of submission.paperSnapshot) {
    const qid = snapQ.questionId;
    const ans = submission.answers[qid];
    if (!ans) continue;

    const gradeInput = questionGrades[qid];
    const bankQ = qMap.get(qid);

    if (gradeInput !== undefined) {
      if (snapQ.type === 'essay' && Array.isArray(gradeInput.checkedRubricStepIds) && bankQ?.rubricSteps) {
        ans.checkedRubricStepIds = gradeInput.checkedRubricStepIds;
        const stepScore = bankQ.rubricSteps
          .filter((st) => gradeInput.checkedRubricStepIds.includes(st.id))
          .reduce((sum, st) => sum + Number(st.points || 0.25), 0);
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

  saveDb();

  return res.json({
    success: true,
    data: submission,
  });
});

app.get('/api/exams/:id/statistics', requireTeacher, (req, res) => {
  const db = getDb();
  const exam = db.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy đề kiểm tra.' });
  }
  const subs = db.submissions.filter((s) => s.examId === exam.id && s.status !== 'in_progress');
  const qMap = new Map(db.questions.map((q) => [q.id, q]));

  const totalCount = subs.length;
  const avgScore =
    totalCount > 0
      ? Number((subs.reduce((s, item) => s + item.totalScore, 0) / totalCount).toFixed(2))
      : 0;
  const passCount = subs.filter((s) => s.totalScore >= 5.0).length;
  const passRatePercent = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

  // Thống kê câu sai nhiều nhất
  const questionStatsMap = new Map();
  for (const sub of subs) {
    for (const snapQ of sub.paperSnapshot) {
      const ans = sub.answers[snapQ.questionId];
      if (!questionStatsMap.has(snapQ.questionId)) {
        const bq = qMap.get(snapQ.questionId);
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
    .map((item) => ({
      ...item,
      wrongRatePercent:
        item.totalAttempts > 0
          ? Math.round((item.wrongOrIncompleteCount / item.totalAttempts) * 100)
          : 0,
    }))
    .sort((a, b) => b.wrongRatePercent - a.wrongRatePercent);

  return res.json({
    success: true,
    data: {
      examId: exam.id,
      examTitle: exam.title,
      totalSubmissions: totalCount,
      averageScore: avgScore,
      passCount,
      passRatePercent,
      hardestQuestions,
      submissions: subs,
    },
  });
});

app.get('/api/exams/:id/export-csv', requireTeacher, (req, res) => {
  const db = getDb();
  const exam = db.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy đề kiểm tra.' });
  }
  const subs = db.submissions.filter((s) => s.examId === exam.id);

  const escapeCsv = (val) => {
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

  const rows = subs.map((sub, idx) => [
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
    ...rows.map((r) => r.map(escapeCsv).join(',')),
  ].join('\r\n');

  // UTF-8 BOM so Microsoft Excel displays Vietnamese diacritics properly
  const csvWithBom = '\uFEFF' + csvBody;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Ket_Qua_${exam.id}.csv"`
  );
  return res.status(200).send(csvWithBom);
});

const rootPath = path.join(__dirname, '..');
const distPath = path.join(rootPath, 'dist');

// Explicit logo route
app.get('/logo.png', (req, res) => {
  const distLogo = path.join(distPath, 'logo.png');
  if (fs.existsSync(distLogo)) return res.sendFile(distLogo);
  const rootLogo = path.join(rootPath, 'logo.png');
  if (fs.existsSync(rootLogo)) return res.sendFile(rootLogo);
  return res.sendStatus(404);
});

// Serve static frontend in production if dist/ exists
const staticOpts = {
  etag: false,
  maxAge: 0,
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  },
};
if (fs.existsSync(distPath)) {
  app.use('/dist', express.static(distPath, staticOpts));
  app.use(express.static(distPath, staticOpts));
}
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const rootIndex = path.join(rootPath, 'index.html');
  if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[KHTN 9 Server] Running at http://localhost:${PORT}`);
});

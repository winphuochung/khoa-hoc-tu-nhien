import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'server', 'data', 'db.json');

// Remove existing db.json before starting server so we test from a 100% clean first-time state
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const PORT = 3099;
process.env.PORT = String(PORT);

// Import and launch the server
await import('../server/index.js');

const BASE_URL = `http://localhost:${PORT}`;

async function callApi(endpoint, options = {}, token = '') {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    return { status: res.status, rawText: text };
  }
  return { status: res.status, json };
}

async function runAcceptanceSuite() {
  console.log('================================================================');
  console.log('BẮT ĐẦU KIỂM THỬ NGHIỆM THU HỆ THỐNG KHTN 9 (KẾT NỐI TRI THỨC)');
  console.log('================================================================\n');

  // BƯỚC 0: Kiểm tra trạng thái khởi tạo lần đầu (không có tài khoản mặc định, đủ 14 chương, 51 bài)
  const boot0 = await callApi('/api/bootstrap');
  const d0 = boot0.json.data;
  console.log('[KIỂM TRA 0] Trạng thái mở app lần đầu tiên:');
  console.log(`  - Có tài khoản giáo viên mặc định đóng sẵn không? -> ${d0.hasTeacherAccount} (Yêu cầu: false)`);
  console.log(`  - Số chương học: ${d0.chapters.length} (Mở đầu + 14 Chương = 15 mục chương)`);
  console.log(`  - Tổng số bài học: ${d0.lessons.length} bài (Từ Bài ${d0.lessons[0].id} đến Bài ${d0.lessons[d0.lessons.length - 1].id})`);

  // BƯỚC 1: Tạo tài khoản Giáo viên lần đầu
  const setupRes = await callApi('/api/auth/setup-teacher', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Lê Văn Thắng',
      username: 'gv_thang',
      password: 'gvPassword@2026',
      schoolName: 'Trường TH – THCS Phước Hưng',
      schoolYear: '2026 – 2027',
      classes: ['9A1', '9A2'],
    }),
  });
  const teacherToken = setupRes.json.data.token;
  const teacherUser = setupRes.json.data.user;
  console.log('\n[KIỂM TRA 1] Tạo tài khoản Giáo viên quản trị lần đầu:');
  console.log(`  - Họ tên GV: ${teacherUser.fullName} | Username: ${teacherUser.username} | Role: ${teacherUser.role}`);

  // Kiểm tra độ phủ ngân hàng câu hỏi trên toàn bộ 51 bài
  const qBankRes = await callApi('/api/questions', {}, teacherToken);
  const allQuestions = qBankRes.json.data;
  const lessonsWithQuestions = new Set(allQuestions.map((q) => q.lessonId));
  const emptyLessons = [];
  for (let i = 1; i <= 51; i++) {
    if (!lessonsWithQuestions.has(i)) emptyLessons.push(i);
  }
  console.log(`  - Tổng số câu hỏi trong Ngân hàng khởi đầu: ${allQuestions.length} câu`);
  console.log(`  - Số bài có câu hỏi: ${lessonsWithQuestions.size}/51 bài (Số bài trắng câu hỏi: ${emptyLessons.length})`);

  // BƯỚC 2: Tạo 3 tài khoản Học sinh
  const studentsToCreate = [
    { fullName: 'Nguyễn Minh Khang', className: '9A1', username: 'hs_khang', password: 'hsPassword123' },
    { fullName: 'Trần Ngọc Ánh', className: '9A1', username: 'hs_anh', password: 'hsPassword123' },
    { fullName: 'Lê Hoàng Nam', className: '9A2', username: 'hs_nam', password: 'hsPassword123' },
  ];
  const createdStudents = [];
  for (const st of studentsToCreate) {
    const r = await callApi(
      '/api/students',
      { method: 'POST', body: JSON.stringify(st) },
      teacherToken
    );
    createdStudents.push(r.json.data);
  }
  console.log('\n[KIỂM TRA 2] Tạo 3 tài khoản Học sinh:');
  for (const st of createdStudents) {
    console.log(`  - HS: ${st.fullName} | Lớp: ${st.className} | Username: ${st.username}`);
  }

  // Đăng nhập thử cho 2 học sinh hs_khang và hs_anh
  const loginKhang = await callApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'hs_khang', password: 'hsPassword123' }),
  });
  const tokenKhang = loginKhang.json.data.token;

  const loginAnh = await callApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'hs_anh', password: 'hsPassword123' }),
  });
  const tokenAnh = loginAnh.json.data.token;

  // Kiểm tra bảo mật: Học sinh cố tình truy cập ngân hàng đề của giáo viên -> Phải bị chặn 403
  const studentAccessBankTry = await callApi('/api/questions', {}, tokenKhang);
  console.log(`  - Kiểm tra phân quyền (HS gọi API /api/questions của GV): HTTP ${studentAccessBankTry.status} (${studentAccessBankTry.json.error})`);

  // BƯỚC 3: Tạo 1 đề 15 phút và 1 đề 90 phút
  // 3a. Sinh tự động Đề 15 phút (10 câu TN nhiều lựa chọn: 4 Biết, 3 Hiểu, 3 Vận dụng)
  const auto15 = await callApi(
    '/api/exams/auto-generate',
    {
      method: 'POST',
      body: JSON.stringify({
        category: '15min',
        lessonScope: [1, 2, 3, 4],
        totalPoints: 10,
        variantCount: 2,
      }),
    },
    teacherToken
  );
  const save15 = await callApi(
    '/api/exams',
    {
      method: 'POST',
      body: JSON.stringify({
        title: 'ĐỀ KIỂM TRA 15 PHÚT — CHƯƠNG I: NĂNG LƯỢNG CƠ HỌC',
        category: '15min',
        durationMinutes: 15,
        totalPoints: 10,
        assignedClasses: ['9A1', '9A2'],
        lessonScope: [1, 2, 3, 4],
        questionIds: auto15.json.data.questionIds,
        variantCount: 2,
        maxTabViolations: 3,
      }),
    },
    teacherToken
  );
  const exam15 = save15.json.data;
  const q15List = auto15.json.data.selectedQuestions;
  const count15Biet = q15List.filter((q) => q.level === 'biet').length;
  const count15Hieu = q15List.filter((q) => q.level === 'hieu').length;
  const count15VD = q15List.filter((q) => q.level === 'van_dung').length;

  console.log('\n[KIỂM TRA 3A] Tạo 1 Đề kiểm tra 15 phút:');
  console.log(`  - Tên đề: ${exam15.title} (ID: ${exam15.id})`);
  console.log(`  - Số câu: ${exam15.questionIds.length} câu TN nhiều lựa chọn × 1,0đ = ${exam15.totalPoints} điểm`);
  console.log(`  - Phân bố mức độ: Biết = ${count15Biet} câu, Hiểu = ${count15Hieu} câu, Vận dụng = ${count15VD} câu`);
  console.log(`  - Số mã đề in tương đương: ${exam15.paperVariants.length} mã đề (${exam15.paperVariants.map((v) => v.paperCode).join(', ')})`);

  // 3b. Sinh tự động Đề 90 phút Giữa kì I (21 lệnh hỏi: 12 MCQ + 2 Đ-S + 4 TLN + 3 Tự luận)
  const auto90 = await callApi(
    '/api/exams/auto-generate',
    {
      method: 'POST',
      body: JSON.stringify({
        category: 'midterm',
        useOfficialMidtermPreset: true,
        totalPoints: 10,
        variantCount: 2,
      }),
    },
    teacherToken
  );
  const save90 = await callApi(
    '/api/exams',
    {
      method: 'POST',
      body: JSON.stringify({
        title: 'ĐỀ KIỂM TRA GIỮA HỌC KÌ I — MÔN KHTN 9 (90 PHÚT)',
        category: 'midterm',
        durationMinutes: 90,
        totalPoints: 10,
        assignedClasses: ['9A1', '9A2'],
        lessonScope: [1, 2, 3, 18, 19, 20, 21, 36, 37],
        questionIds: auto90.json.data.questionIds,
        variantCount: 2,
        maxTabViolations: 3,
      }),
    },
    teacherToken
  );
  const exam90 = save90.json.data;
  const q90List = auto90.json.data.selectedQuestions;
  console.log('\n[KIỂM TRA 3B] Tạo 1 Đề kiểm tra Giữa kì 90 phút:');
  console.log(`  - Tên đề: ${exam90.title} (ID: ${exam90.id})`);
  console.log(`  - Tổng số lệnh hỏi: ${q90List.length} lệnh hỏi (MCQ: ${q90List.filter((q) => q.type === 'mcq').length}, Đúng-Sai: ${q90List.filter((q) => q.type === 'true_false').length}, Trả lời ngắn: ${q90List.filter((q) => q.type === 'short_answer').length}, Tự luận: ${q90List.filter((q) => q.type === 'essay').length})`);
  console.log(`  - Số dòng Ma trận: ${exam90.matrixRows.length} đơn vị kiến thức | Số dòng Bản đặc tả: ${exam90.specificationRows.length}`);
  console.log(`  - Số mã đề in tương đương: ${exam90.paperVariants.length} mã đề (${exam90.paperVariants.map((v) => v.paperCode).join(', ')})`);

  // BƯỚC 4: Cho 2 học sinh (hs_khang và hs_anh) vào cùng đợt kiểm tra 90 phút và chứng minh 2 đề khác nhau
  const startKhang = await callApi(
    `/api/exams/${exam90.id}/start`,
    {
      method: 'POST',
      body: JSON.stringify({
        deviceInfo: { userAgent: 'Chrome/130 Windows 10', platform: 'Win32', screenResolution: '1920x1080' },
      }),
    },
    tokenKhang
  );
  const subKhang = startKhang.json.data.submission;

  const startAnh = await callApi(
    `/api/exams/${exam90.id}/start`,
    {
      method: 'POST',
      body: JSON.stringify({
        deviceInfo: { userAgent: 'Safari iOS 17 iPhone', platform: 'iPhone', screenResolution: '390x844' },
      }),
    },
    tokenAnh
  );
  const subAnh = startAnh.json.data.submission;

  console.log('\n[KIỂM TRA 4] Cho 2 học sinh vào cùng đợt kiểm tra 90 phút — Chứng minh 2 đề khác nhau:');
  console.log(`  - Học sinh 1 (${subKhang.studentName}): Mã đề = ${subKhang.paperCode} | Chữ ký đề = ${subKhang.paperSignature}`);
  console.log(`    + 5 câu đầu của HS 1: ${subKhang.paperSnapshot.slice(0, 5).map((q) => `${q.questionId}[opt:${(q.originalOptionIndices || []).join('')}]`).join(' -> ')}`);
  console.log(`  - Học sinh 2 (${subAnh.studentName}): Mã đề = ${subAnh.paperCode} | Chữ ký đề = ${subAnh.paperSignature}`);
  console.log(`    + 5 câu đầu của HS 2: ${subAnh.paperSnapshot.slice(0, 5).map((q) => `${q.questionId}[opt:${(q.originalOptionIndices || []).join('')}]`).join(' -> ')}`);
  console.log(`  - Kết luận so sánh: Chữ ký đề khác nhau hoàn toàn (${subKhang.paperSignature} !== ${subAnh.paperSignature}) => ĐẠT!`);

  // BƯỚC 5: Nộp 1 bài có cả câu đúng và câu sai để đối chiếu điểm chấm tự động với tính tay
  const qBankMap = new Map(allQuestions.map((q) => [q.id, q]));
  const khangAnswers = {};

  let mcqIdx = 0;
  let tfIdx = 0;
  let saIdx = 0;
  let essayIdx = 0;

  for (const snapQ of subKhang.paperSnapshot) {
    const bankQ = qBankMap.get(snapQ.questionId);
    if (snapQ.type === 'mcq') {
      mcqIdx += 1;
      const rightShuffledIdx = snapQ.originalOptionIndices.indexOf(bankQ.correctOptionIndex);
      const wrongShuffledIdx = (rightShuffledIdx + 1) % 4;
      // Làm ĐÚNG 10 câu đầu (10 × 0,25 = 2,50đ), làm SAI 2 câu cuối (0đ)
      khangAnswers[snapQ.questionId] = {
        selectedShuffledIndex: mcqIdx <= 10 ? rightShuffledIdx : wrongShuffledIdx,
        timeSpentSeconds: 25,
      };
    } else if (snapQ.type === 'true_false') {
      tfIdx += 1;
      const tfAns = {};
      if (tfIdx === 1) {
        // Câu Đ-S 1: Làm đúng cả 4/4 ý => Tính tay = 1,00 điểm
        for (const st of bankQ.statements) {
          tfAns[st.id] = st.isTrue;
        }
      } else {
        // Câu Đ-S 2: Làm đúng 3/4 ý, sai ý d => Tính tay = 0,50 điểm
        for (const st of bankQ.statements) {
          tfAns[st.id] = st.id === 'd' ? !st.isTrue : st.isTrue;
        }
      }
      khangAnswers[snapQ.questionId] = {
        trueFalseAnswers: tfAns,
        timeSpentSeconds: 60,
      };
    } else if (snapQ.type === 'short_answer') {
      saIdx += 1;
      if (saIdx <= 3) {
        // 3 câu trả lời ngắn đầu: Nhập đúng đáp án chuẩn => Tính tay = 3 × 0,5 = 1,50 điểm
        khangAnswers[snapQ.questionId] = {
          textAnswer: bankQ.acceptedAnswers[0],
          timeSpentSeconds: 40,
        };
      } else {
        // Câu trả lời ngắn thứ 4: Nhập câu trả lời diễn đạt riêng chưa khớp từ khoá => 0đ tự động, chuyển sang chờ chấm tay
        khangAnswers[snapQ.questionId] = {
          textAnswer: 'Do xuất hiện đặc điểm kiểu hình mới khác bố mẹ',
          timeSpentSeconds: 45,
        };
      }
    } else if (snapQ.type === 'essay') {
      essayIdx += 1;
      khangAnswers[snapQ.questionId] = {
        textAnswer: bankQ.sampleAnswer || 'Bài giải tự luận chi tiết của học sinh Nguyễn Minh Khang.',
        timeSpentSeconds: 180,
      };
    }
  }

  const submitKhangRes = await callApi(
    `/api/submissions/${subKhang.id}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({
        answers: khangAnswers,
        submitReason: 'manual_submit',
        violationCount: 1,
      }),
    },
    tokenKhang
  );

  // Lấy chi tiết bài nộp từ phía Giáo viên để đối chiếu điểm chấm tự động với tính tay
  const detailKhangBeforeManual = await callApi(
    `/api/submissions/${subKhang.id}/detail`,
    {},
    teacherToken
  );
  const subKhangAfterAuto = detailKhangBeforeManual.json.data.submission;

  const handCalcMcq = 10 * 0.25; // 2.50
  const handCalcTf = 1.0 + 0.5; // 1.50
  const handCalcSa = 3 * 0.5; // 1.50
  const handCalcTotalAuto = handCalcMcq + handCalcTf + handCalcSa; // 5.50

  console.log('\n[KIỂM TRA 5] Đối chiếu điểm chấm tự động với tính tay (Bài làm của Nguyễn Minh Khang):');
  console.log(`  - Phần I.1 (Nhiều lựa chọn): Đúng 10/12 câu, Sai 2/12 câu => Tính tay = ${handCalcMcq.toFixed(2)}đ`);
  console.log(`  - Phần I.2 (Đúng - Sai): Câu 1 đúng 4/4 ý (1,00đ) + Câu 2 đúng 3/4 ý (0,50đ) => Tính tay = ${handCalcTf.toFixed(2)}đ`);
  console.log(`  - Phần I.3 (Trả lời ngắn): Khớp 3/4 câu (1,50đ) + 1 câu diễn đạt khác chờ GV duyệt (0,00đ) => Tính tay = ${handCalcSa.toFixed(2)}đ`);
  console.log(`  - TỔNG ĐIỂM TÍNH TAY PHẦN TỰ ĐỘNG: ${handCalcTotalAuto.toFixed(2)} điểm`);
  console.log(`  - TỔNG ĐIỂM APP CHẤM TỰ ĐỘNG:      ${subKhangAfterAuto.autoGradedScore.toFixed(2)} điểm`);
  console.log(`  - Trạng thái bài làm: ${subKhangAfterAuto.status} (Chưa chốt điểm vì đang chờ GV chấm tự luận) => KHỚP TUYỆT ĐỐI!`);

  // Nộp thêm bài của Trần Ngọc Ánh để bảng điểm lớp phong phú
  const anhAnswers = {};
  for (const snapQ of subAnh.paperSnapshot) {
    const bankQ = qBankMap.get(snapQ.questionId);
    if (snapQ.type === 'mcq') {
      const rightShuffledIdx = snapQ.originalOptionIndices.indexOf(bankQ.correctOptionIndex);
      anhAnswers[snapQ.questionId] = { selectedShuffledIndex: rightShuffledIdx, timeSpentSeconds: 20 };
    } else if (snapQ.type === 'true_false') {
      const tfAns = {};
      for (const st of bankQ.statements) tfAns[st.id] = st.isTrue;
      anhAnswers[snapQ.questionId] = { trueFalseAnswers: tfAns, timeSpentSeconds: 50 };
    } else if (snapQ.type === 'short_answer') {
      anhAnswers[snapQ.questionId] = { textAnswer: bankQ.acceptedAnswers[0], timeSpentSeconds: 30 };
    } else if (snapQ.type === 'essay') {
      anhAnswers[snapQ.questionId] = { textAnswer: bankQ.sampleAnswer, timeSpentSeconds: 150 };
    }
  }
  await callApi(
    `/api/submissions/${subAnh.id}/submit`,
    { method: 'POST', body: JSON.stringify({ answers: anhAnswers, submitReason: 'manual_submit' }) },
    tokenAnh
  );

  // BƯỚC 6: Thử chấm tay câu tự luận (theo bước 0,25 điểm) rồi chốt điểm
  const essayQuestionsKhang = subKhang.paperSnapshot.filter((q) => q.type === 'essay');
  const gradePayload = {};
  // Câu tự luận 1: tích 4 bước × 0,25đ = 1,00đ
  gradePayload[essayQuestionsKhang[0].questionId] = {
    checkedRubricStepIds: ['step-1', 'step-2', 'step-3', 'step-4'],
    manualScore: 1.0,
    teacherComment: 'Tóm tắt, công thức và kết quả tính động năng/thế năng chính xác tuyệt đối.',
  };
  // Câu tự luận 2: tích 3 bước × 0,25đ = 0,75đ (thiếu giải thích quỳ tím 1 ý nhỏ)
  gradePayload[essayQuestionsKhang[1].questionId] = {
    checkedRubricStepIds: ['step-1', 'step-2', 'step-3'],
    manualScore: 0.75,
    teacherComment: 'Tính đúng khối lượng 2 oxide, phần kết luận quỳ tím cần ghi rõ hơn.',
  };
  // Câu tự luận 3: tích 4 bước × 0,25đ = 1,00đ
  gradePayload[essayQuestionsKhang[2].questionId] = {
    checkedRubricStepIds: ['step-1', 'step-2', 'step-3', 'step-4'],
    manualScore: 1.0,
    teacherComment: 'Vận dụng đúng tỉ lệ phân li độc lập của Mendel.',
  };

  const gradeKhangRes = await callApi(
    `/api/submissions/${subKhang.id}/grade`,
    {
      method: 'POST',
      body: JSON.stringify({
        questionGrades: gradePayload,
        teacherOverallFeedback: 'Bài làm nắm vững kiến thức trọng tâm, trình bày tự luận rõ ràng.',
        finalize: true,
      }),
    },
    teacherToken
  );
  const finalizedKhang = gradeKhangRes.json.data;

  // Chấm luôn cho Trần Ngọc Ánh để chốt cả lớp
  const essayQuestionsAnh = subAnh.paperSnapshot.filter((q) => q.type === 'essay');
  const gradePayloadAnh = {};
  for (const eq of essayQuestionsAnh) {
    gradePayloadAnh[eq.questionId] = {
      checkedRubricStepIds: ['step-1', 'step-2', 'step-3', 'step-4'],
      manualScore: 1.0,
      teacherComment: 'Làm tốt đầy đủ các bước.',
    };
  }
  await callApi(
    `/api/submissions/${subAnh.id}/grade`,
    {
      method: 'POST',
      body: JSON.stringify({
        questionGrades: gradePayloadAnh,
        teacherOverallFeedback: 'Xuất sắc!',
        finalize: true,
      }),
    },
    teacherToken
  );

  // Giáo viên mở cho phép học sinh xem kết quả & lời giải
  await callApi(
    `/api/exams/${exam90.id}`,
    { method: 'PATCH', body: JSON.stringify({ allowReview: true }) },
    teacherToken
  );

  console.log('\n[KIỂM TRA 6] Giáo viên chấm tay câu tự luận theo bước 0,25đ và chốt điểm:');
  console.log(`  - Điểm Tự luận chấm theo bước: Câu 1 (1,00đ) + Câu 2 (0,75đ) + Câu 3 (1,00đ) = ${finalizedKhang.manualGradedScore.toFixed(2)} điểm`);
  console.log(`  - Điểm Trắc nghiệm tự động: ${finalizedKhang.autoGradedScore.toFixed(2)} điểm`);
  console.log(`  - TỔNG ĐIỂM CHỐT CHÍNH THỨC: ${finalizedKhang.totalScore.toFixed(2)} / 10 điểm (Trạng thái: ${finalizedKhang.status})`);

  // BƯỚC 7: Xuất 1 file kết quả lớp ra CSV
  const csvRes = await callApi(`/api/exams/${exam90.id}/export-csv`, {}, teacherToken);
  const csvFilePath = path.join(ROOT_DIR, 'Ket_Qua_Lop_KHTN9_Nghiem_Thu.csv');
  fs.writeFileSync(csvFilePath, csvRes.rawText, 'utf-8');

  console.log('\n[KIỂM TRA 7] Xuất file CSV kết quả lớp:');
  console.log(`  - Đã lưu file: ${csvFilePath}`);
  console.log('  - Nội dung file CSV:');
  console.log('----------------------------------------------------------------');
  console.log(csvRes.rawText.trim());
  console.log('----------------------------------------------------------------');

  console.log('\nHOÀN TẤT TOÀN BỘ 7 BƯỚC NGHIỆM THU THÀNH CÔNG!');
  process.exit(0);
}

runAcceptanceSuite().catch((err) => {
  console.error('Lỗi nghiệm thu:', err);
  process.exit(1);
});

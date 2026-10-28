# Kế Hoạch Xây Dựng Nền Tảng Học Tập & Giảng Dạy KHTN 9 (Kết Nối Tri Thức)

> **Dự án:** Ứng dụng Học tập & Giảng dạy Khoa học tự nhiên 9 (SGK Kết nối tri thức với cuộc sống - 14 Chương, 51 Bài, 230 Trang)
> **Đối tượng:** Học sinh lớp 9 (Học tập, Thí nghiệm ảo, Luyện đề, AI Tutor) & Giáo viên (Trình chiếu bài giảng, Tạo phiếu bài tập/đề kiểm tra, Quản lý lớp học)
> **Kiến trúc:** Feature-based Modular Architecture (tuân thủ 14 nguyên tắc `rules/code-architecture.md`)

---

## 1. Cấu Trúc Chương Trình SGK KHTN 9 (Đã Trích Xuất Từ NXBGD - ID `4700446949`)

- **Mở đầu:** Bài 1 (Nhận biết dụng cụ, hoá chất & thuyết trình khoa học - Trang 6–14)
- **Phân môn Vật lí (Chương I – V | Bài 2 – 17 | Trang 15 – 86):**
  - Chương I: Năng lượng cơ học (Động năng, Thế năng, Cơ năng, Công & Công suất)
  - Chương II: Ánh sáng (Khúc xạ, Phản xạ toàn phần, Lăng kính, Thấu kính, Tiêu cự thấu kính hội tụ, Kính lúp)
  - Chương III: Điện (Điện trở, Định luật Ohm, Mạch nối tiếp/song song, Năng lượng & Công suất điện)
  - Chương IV: Điện từ (Cảm ứng điện từ, Nguyên tắc tạo dòng điện xoay chiều, Tác dụng dòng xoay chiều)
  - Chương V: Năng lượng với cuộc sống (Vòng năng lượng Trái Đất, Năng lượng hoá thạch & tái tạo)
- **Phân môn Hoá học & Địa chất (Chương VI – X | Bài 18 – 35 | Trang 87 – 158):**
  - Chương VI: Kim loại & Sự khác nhau cơ bản giữa phi kim và kim loại (Tính chất kim loại, Dãy hoạt động hoá học, Tách kim loại & Hợp kim)
  - Chương VII: Hợp chất hữu cơ, Hydrocarbon & Nguồn nhiên liệu (Alkane, Alkene, Nhiên liệu)
  - Chương VIII: Ethylic alcohol và Acetic acid
  - Chương IX: Lipid, Carbohydrate (Glucose, Saccharose, Tinh bột, Cellulose), Protein, Polymer
  - Chương X: Khai thác tài nguyên từ vỏ Trái Đất (Đá vôi, Công nghiệp Silicate, Chu trình Carbon)
- **Phân môn Sinh học (Chương XI – XIV | Bài 36 – 51 | Trang 159 – 230):**
  - Chương XI: Di truyền học Mendel & Cơ sở phân tử (Nucleic acid, Gene, Tái bản DNA, Phiên mã RNA, Dịch mã, Đột biến gene)
  - Chương XII: Di truyền nhiễm sắc thể (NST, Nguyên phân, Giảm phân, NST giới tính, Di truyền liên kết, Đột biến NST)
  - Chương XIII: Di truyền học với con người và đời sống
  - Chương XIV: Tiến hoá (Chọn lọc tự nhiên,Chọn lọc nhân tạo, Cơ chế tiến hoá, Sự phát sinh sự sống)

---

## 2. Kiến Trúc Thư Mục (Feature-based Architecture)

```plaintext
khoa-hoc-tu-nhien-9/
├── src/
│   ├── app/                        # Routing, Layout chính & Role Switcher (Học sinh / Giáo viên)
│   ├── features/                   # Tách biệt từng tính năng độc lập (< 300 dòng/file)
│   │   ├── auth/                   # Đăng nhập/Đăng ký (Học sinh, Giáo viên), Supabase Auth & Local Fallback
│   │   ├── textbook-reader/        # Đọc SGK gốc 230 trang (Single/Double page, Zoom, Đồng bộ theo từng bài học)
│   │   ├── curriculum/             # Tóm tắt lý thuyết, Sơ đồ tư duy, Công thức, Flashcards cho 51 bài học
│   │   ├── virtual-lab/            # Phòng thí nghiệm ảo tương tác 4 phân môn:
│   │   │   ├── OpticsLab.tsx       # Mô phỏng Thấu kính hội tụ/phân kì, Khúc xạ & Phản xạ toàn phần
│   │   │   ├── CircuitLab.tsx      # Mô phỏng Định luật Ohm, mạch điện nối tiếp & song song
│   │   │   ├── ChemistryLab.tsx    # Mô phỏng Dãy hoạt động hoá học kim loại & Phản ứng hữu cơ
│   │   │   └── GeneticsLab.tsx     # Mô phỏng Phép lai Mendel, Tái bản DNA - Phiên mã - Dịch mã
│   │   ├── quiz-practice/          # Trắc nghiệm tương tác (ABCD, Đúng/Sai mới theo chuẩn GDPT 2018, Tự luận ngắn)
│   │   ├── ai-tutor/               # Trợ lý AI giải đáp KHTN 9, chấm bài & sinh đề tự động (Gemini API)
│   │   └── teacher-studio/         # Chế độ trình chiếu giảng dạy (Presentation Mode), Tạo phiếu bài tập & Thống kê
│   ├── components/
│   │   ├── common/                 # Button, Modal, Toast, Badge, MathFormula (KaTeX)
│   │   └── layout/                 # Header, Sidebar, RoleBanner
│   ├── services/                   # supabaseClient.ts, geminiService.ts, progressService.ts
│   ├── types/                      # curriculumTypes.ts, quizTypes.ts, userTypes.ts
│   ├── constants/                  # sgkPagesMap.ts (230 URL trang SGK), chaptersData.ts (14 chương, 51 bài)
│   └── utils/                      # formatScore.ts, exportWorksheet.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Bảng users, study_progress, quiz_attempts, custom_worksheets
└── scripts/
    └── download-sgk-pages.mjs      # Script tải 230 trang SGK về local (nếu muốn dùng offline)
```

---

## 3. Lộ Trình Triển Khai (Task Breakdown & Verification)

| Phase | Nhiệm vụ | Phụ trách | Tiêu chí nghiệm thu (Verification) |
|-------|----------|-----------|------------------------------------|
| **Phase 1** | Khởi tạo dự án React + TypeScript + Vite + Tailwind CSS + Lucide Icons + KaTeX + Supabase Client | `frontend-specialist` | `npm run build` chạy thành công, cấu trúc thư mục chuẩn 14 nguyên tắc |
| **Phase 2** | Xây dựng Database Schema (`001_initial_schema.sql`) & Dữ liệu chuẩn 14 Chương / 51 Bài học + Mapping 230 trang SGK (`sgkPagesMap.ts`) | `database-architect` | Đầy đủ 14 chương, 51 bài khớp chính xác số trang từ `taphuan.nxbgd.vn` |
| **Phase 3** | Xây dựng **Textbook Reader** (Xem SGK gốc 230 trang song song với bài học) & **Curriculum Viewer** (Lý thuyết, Công thức, Flashcard) | `frontend-specialist` | Chuyển trang mượt, nhảy đúng trang SGK khi chọn bất kỳ bài nào từ Bài 1 -> Bài 51 |
| **Phase 4** | Xây dựng **Virtual Lab** (4 mô phỏng tương tác: Quang học, Mạch điện Ohm, Hoá học Kim loại, Di truyền & DNA) | `frontend-specialist` | Kéo thả/thay đổi thông số thời gian thực, vẽ tia sáng/dòng điện/chuỗi DNA chính xác |
| **Phase 5** | Xây dựng **Quiz Engine** (Trắc nghiệm 4 lựa chọn + Đúng/Sai chuẩn đề thi mới), **AI Tutor** & **Teacher Studio** (Soạn phiếu bài tập, Chế độ trình chiếu) | `backend-specialist` & `frontend-specialist` | Chấm điểm tức thì, lưu lịch sử làm bài (Supabase + Local fallback), xuất phiếu bài tập |
| **Phase 6** | Kiểm tra chất lượng, bảo mật, build & chạy thử nghiệm | `test-engineer` | Build không lỗi TypeScript, giao diện đáp ứng (Responsive), kiểm tra toàn bộ luồng |

# Khoa Học Tự Nhiên (KHTN 6, 7, 8, 9)

> **Hệ thống Học tập, Luyện tập, Mô phỏng Thí nghiệm Ảo & Kiểm tra Đánh giá Trực tuyến**  
> Bám sát Chương trình GDPT 2018 — Bộ sách **Kết nối tri thức với cuộc sống**.

---

## 🌟 Tính Năng Nổi Bật

1. **Phân phối chương trình & Lý thuyết chuẩn mực (195 bài học)**
   - Khối 6 (55 bài), Khối 7 (42 bài), Khối 8 (47 bài), Khối 9 (51 bài).
   - Đầy đủ số tiết chuẩn, mục tiêu cần đạt (YCCĐ), công thức, ví dụ minh hoạ và lưu ý lỗi sai thường gặp.

2. **Phòng Thí nghiệm Ảo Tương tác 2D (Interactive Virtual Lab)**
   - Mô phỏng trực quan các thí nghiệm Hoá học (đun nóng, phản ứng tạo khí, kết tủa), Vật lí (quang học khúc xạ tia sáng, mạch điện & định luật Ohm, con lắc bảo toàn cơ năng), Sinh học (kính hiển vi quang học lấy nét tế bào).
   - Tích hợp checklist thao tác từng bước, hiện tượng quan sát, kết luận khoa học và quy tắc an toàn.
   - Nút liên kết mở video thực nghiệm chất lượng cao trên YouTube.

3. **Bài giảng Điện tử E-Learning (Slides tương tác)**
   - 5 trang trình chiếu tương tác cho mỗi bài học: Khởi động ➔ Hình thành kiến thức ➔ Khám phá thí nghiệm ➔ Luyện tập nhanh (có câu hỏi trắc nghiệm tương tác) ➔ Vận dụng & Ghi nhớ.

4. **Ngân hàng Đề thi & Câu hỏi phong phú (2.852 câu hỏi)**
   - Đầy đủ 4 dạng thức theo định dạng đánh giá năng lực mới:
     - Dạng 1: Trắc nghiệm 4 lựa chọn (MCQ).
     - Dạng 2: Đúng / Sai (4 ý a, b, c, d).
     - Dạng 3: Trả lời ngắn.
     - Dạng 4: Tự luận có hướng dẫn chấm rubric chia nhỏ 0,25 điểm.
   - Gắn mã chỉ báo YCCĐ chuẩn xác theo phân môn Hoá học và Sinh học.

5. **Soạn đề, Ma trận, Bản đặc tả & Phòng thi trực tuyến**
   - Tự động sinh ma trận và bản đặc tả phân bổ tỉ lệ điểm tương ứng với số tiết từng bài học.
   - Xuất đề thi và ma trận đặc tả ra file Word (.docx) và PDF chuẩn Sở / Bộ GD&ĐT.
   - Phòng thi trực tuyến chống gian lận (giám sát chuyển tab, khoá bài khi vi phạm).
   - Chấm bài tự động, thống kê phổ điểm và xuất kết quả ra file Excel/CSV.

6. **Quản trị Tài khoản Học sinh & Phân lớp**
   - Quản lý học sinh theo lớp (Khối 6 đến Khối 9).
   - Đăng nhập bảo mật, phân quyền giáo viên và học sinh riêng biệt.

---

## 🚀 Cài Đặt & Khởi Chạy

### Yêu cầu hệ thống:
- [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).
- Trình duyệt web hiện đại (Google Chrome, Microsoft Edge, Firefox, Safari).

### Các bước cài đặt:

```bash
# 1. Clone repository
git clone https://github.com/winphuochung/khoa-hoc-tu-nhien.git
cd khoa-hoc-tu-nhien

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy ứng dụng (Express backend + Frontend)
node server/index.js
# hoặc:
npm run dev
```

Sau khi khởi chạy thành công, mở trình duyệt web và truy cập:
👉 **`http://localhost:3000`**

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **Backend:** Node.js, Express, RESTful APIs, Local Embedded Database.
- **Mô phỏng Thí nghiệm:** HTML5 SVG Animated Canvas tương tác thời gian thực.
- **Xuất bản tài liệu:** Sinh mã ma trận, bản đặc tả và đề kiểm tra chuẩn quy cách sư phạm.

---

## 📄 Bản Quyền & Giấy Phép

Dự án phục vụ mục đích giáo dục và giảng dạy môn Khoa học Tự nhiên.

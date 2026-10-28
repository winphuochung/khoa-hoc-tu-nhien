// scripts/generate_grades_seed.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, '..', 'server', 'seed');

// ==========================================
// KHTN 6 DEFINITIONS
// ==========================================
const khtn6Chapters = [
  { id: 'ch-6-01', grade: 6, number: 1, code: 'Chương I', title: 'Chương I: Mở đầu về Khoa học tự nhiên và các phép đo', subject: 'vat_li', lessonIds: [601, 602, 603, 604, 605, 606, 607] },
  { id: 'ch-6-02', grade: 6, number: 2, code: 'Chương II', title: 'Chương II: Chất quanh ta', subject: 'hoa_hoc', lessonIds: [608, 609, 610] },
  { id: 'ch-6-03', grade: 6, number: 3, code: 'Chương III', title: 'Chương III: Một số vật liệu, nhiên liệu, nguyên liệu, lương thực - thực phẩm thông dụng', subject: 'hoa_hoc', lessonIds: [611, 612, 613, 614] },
  { id: 'ch-6-04', grade: 6, number: 4, code: 'Chương IV', title: 'Chương IV: Hỗn hợp. Tách chất ra khỏi hỗn hợp', subject: 'hoa_hoc', lessonIds: [615, 616] },
  { id: 'ch-6-05', grade: 6, number: 5, code: 'Chương V', title: 'Chương V: Tế bào - Đơn vị cơ sở của sự sống', subject: 'sinh_hoc', lessonIds: [617, 618, 619] },
  { id: 'ch-6-06', grade: 6, number: 6, code: 'Chương VI', title: 'Chương VI: Từ tế bào đến cơ thể', subject: 'sinh_hoc', lessonIds: [620, 621] },
  { id: 'ch-6-07', grade: 6, number: 7, code: 'Chương VII', title: 'Chương VII: Đa dạng thế giới sống', subject: 'sinh_hoc', lessonIds: [622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638] },
  { id: 'ch-6-08', grade: 6, number: 8, code: 'Chương VIII', title: 'Chương VIII: Lực trong đời sống', subject: 'vat_li', lessonIds: [639, 640, 641, 642, 643, 644] },
  { id: 'ch-6-09', grade: 6, number: 9, code: 'Chương IX', title: 'Chương IX: Năng lượng', subject: 'vat_li', lessonIds: [645, 646, 647, 648, 649, 650, 651] },
  { id: 'ch-6-10', grade: 6, number: 10, code: 'Chương X', title: 'Chương X: Trái Đất và bầu trời', subject: 'vat_li', lessonIds: [652, 653, 654, 655] }
];

const khtn6LessonsRaw = [
  { id: 601, chapterId: 'ch-6-01', lessonNumber: 1, title: 'Bài 1: Giới thiệu về Khoa học tự nhiên', subject: 'mo_dau', periods: 2,
    topic: 'Khái niệm KHTN và vai trò của KHTN trong đời sống',
    concept: 'Khoa học tự nhiên nghiên cứu các hiện tượng tự nhiên, tìm ra các tính chất, quy luật của thế giới tự nhiên nhằm nâng cao chất lượng cuộc sống con người.' },
  { id: 602, chapterId: 'ch-6-01', lessonNumber: 2, title: 'Bài 2: An toàn trong phòng thực hành', subject: 'mo_dau', periods: 2,
    topic: 'Kí hiệu cảnh báo và quy định an toàn phòng thí nghiệm',
    concept: 'Quy tắc an toàn trong phòng thực hành: mặc đồ bảo hộ, không ăn uống, hiểu rõ các biển cảnh báo nguy hiểm chất độc, chất ăn mòn, chất dễ cháy nổ.' },
  { id: 603, chapterId: 'ch-6-01', lessonNumber: 3, title: 'Bài 3: Sử dụng kính lúp và kính hiển vi quang học', subject: 'mo_dau', periods: 2,
    topic: 'Cấu tạo và thao tác sử dụng kính lúp, kính hiển vi',
    concept: 'Kính lúp giúp quan sát các vật nhỏ phóng đại vài lần đến hàng chục lần. Kính hiển vi quang học phóng đại hàng trăm đến hàng nghìn lần để quan sát tế bào và vi sinh vật.' },
  { id: 604, chapterId: 'ch-6-01', lessonNumber: 4, title: 'Bài 4: Đo chiều dài', subject: 'vat_li', periods: 2,
    topic: 'Đơn vị và dụng cụ đo chiều dài, giới hạn đo và độ chia nhỏ nhất',
    concept: 'Đơn vị đo chiều dài trong hệ SI là mét (m). Cần chọn thước có giới hạn đo (GHĐ) và độ chia nhỏ nhất (ĐCNN) phù hợp, đặt mắt vuông góc với vạch chia để tránh sai số.' },
  { id: 605, chapterId: 'ch-6-01', lessonNumber: 5, title: 'Bài 5: Đo khối lượng', subject: 'vat_li', periods: 2,
    topic: 'Đơn vị và dụng cụ đo khối lượng, hiệu chỉnh cân',
    concept: 'Đơn vị đo khối lượng là kilôgam (kg). Sử dụng các loại cân như cân đòn, cân đồng hồ, cân điện tử; cần hiệu chỉnh kim cân về số 0 trước khi cân.' },
  { id: 606, chapterId: 'ch-6-01', lessonNumber: 6, title: 'Bài 6: Đo thời gian', subject: 'vat_li', periods: 2,
    topic: 'Dụng cụ và thao tác bấm giờ',
    concept: 'Đơn vị đo thời gian là giây (s). Sử dụng đồng hồ bấm giây điện tử hoặc đồng hồ bấm giây cơ học để đo khoảng thời gian diễn ra hiện tượng hay chuyển động.' },
  { id: 607, chapterId: 'ch-6-01', lessonNumber: 7, title: 'Bài 7: Thang nhiệt độ Celsius. Đo nhiệt độ', subject: 'vat_li', periods: 3,
    topic: 'Thang đo nhiệt độ Celsius và các loại nhiệt kế',
    concept: 'Nhiệt độ là số đo độ "nóng", "lạnh" của vật thể. Trong thang Celsius, nhiệt độ nước đá đang tan là 0 °C và hơi nước đang sôi là 100 °C. Nhiệt kế hoạt động dựa trên sự nở vì nhiệt của chất lỏng.' },
  { id: 608, chapterId: 'ch-6-02', lessonNumber: 8, title: 'Bài 8: Sự đa dạng của chất', subject: 'hoa_hoc', periods: 2,
    topic: 'Chất tự nhiên và chất nhân tạo quanh ta',
    concept: 'Mọi vật thể đều cấu tạo từ chất. Chất có ở khắp nơi: chất tự nhiên cấu tạo nên vật thể tự nhiên (nước, đá, gỗ), chất nhân tạo do con người tổng hợp nên vật phẩm nhân tạo.' },
  { id: 609, chapterId: 'ch-6-02', lessonNumber: 9, title: 'Bài 9: Các thể của chất và sự chuyển thể', subject: 'hoa_hoc', periods: 3,
    topic: 'Ba thể rắn, lỏng, khí và quá trình chuyển thể',
    concept: 'Chất tồn tại ở ba thể cơ bản: rắn (thể tích và hình dạng xác định), lỏng (thể tích xác định, hình dạng biến đổi), khí (không có hình dạng và thể tích xác định). Sự chuyển thể gồm nóng chảy, đông đặc, bay hơi, ngưng tụ, sôi.' },
  { id: 610, chapterId: 'ch-6-02', lessonNumber: 10, title: 'Bài 10: Tính chất của chất và sự biến đổi chất', subject: 'hoa_hoc', periods: 3,
    topic: 'Tính chất vật lí, tính chất hoá học và sự biến đổi chất',
    concept: 'Tính chất vật lí (màu sắc, mùi vị, thể, nhiệt độ sôi, khối lượng riêng); tính chất hoá học (khả năng biến đổi thành chất khác như cháy, bị gỉ, phân hủy).' },
  { id: 611, chapterId: 'ch-6-03', lessonNumber: 11, title: 'Bài 11: Một số vật liệu thông dụng', subject: 'hoa_hoc', periods: 2,
    topic: 'Kim loại, nhựa, thuỷ tinh, gốm, gỗ và ứng dụng an toàn',
    concept: 'Vật liệu là chất hoặc hỗn hợp các chất dùng để sản xuất ra vật thể. Kim loại dẫn điện, dẫn nhiệt tốt; nhựa nhẹ dẻo cách điện; thuỷ tinh trong suốt không gỉ.' },
  { id: 612, chapterId: 'ch-6-03', lessonNumber: 12, title: 'Bài 12: Một số nhiên liệu thông dụng', subject: 'hoa_hoc', periods: 2,
    topic: 'Than, củi, xăng dầu, khí gas và sử dụng hiệu quả',
    concept: 'Nhiên liệu là những chất khi cháy toả nhiều nhiệt và phát sáng (xăng dầu, than đá, khí gas). Cần sử dụng nhiên liệu hiệu quả, an toàn và hạn chế phát thải ô nhiễm môi trường.' },
  { id: 613, chapterId: 'ch-6-03', lessonNumber: 13, title: 'Bài 13: Một số nguyên liệu thông dụng', subject: 'hoa_hoc', periods: 2,
    topic: 'Đất đá, cát sét, quặng khoáng sản trong công nghiệp',
    concept: 'Nguyên liệu là vật liệu tự nhiên chưa qua chế biến dùng để sản xuất ra sản phẩm mới (quặng sắt làm thép, đá vôi làm xi măng, cát làm thuỷ tinh).' },
  { id: 614, chapterId: 'ch-6-03', lessonNumber: 14, title: 'Bài 14: Một số lương thực - thực phẩm thông dụng', subject: 'hoa_hoc', periods: 2,
    topic: 'Carbohydrate, protein, lipid, vitamin và an toàn thực phẩm',
    concept: 'Lương thực (gạo, ngô, khoai chứa nhiều tinh bột); thực phẩm (thịt, cá, trứng, rau quả cung cấp protein, lipid, vitamin, chất khoáng). Cần bảo quản đúng cách để tránh ôi thiu, ngộ độc.' },
  { id: 615, chapterId: 'ch-6-04', lessonNumber: 15, title: 'Bài 15: Chất tinh khiết - Hỗn hợp', subject: 'hoa_hoc', periods: 3,
    topic: 'Chất tinh khiết, hỗn hợp đồng nhất và hỗn hợp không đồng nhất',
    concept: 'Chất tinh khiết chỉ tạo thành từ một chất, tính chất xác định không đổi. Hỗn hợp tạo từ hai hay nhiều chất trộn lẫn vào nhau (dung dịch là hỗn hợp đồng nhất của dung môi và chất tan).' },
  { id: 616, chapterId: 'ch-6-04', lessonNumber: 16, title: 'Bài 16: Một số phương pháp tách chất ra khỏi hỗn hợp', subject: 'hoa_hoc', periods: 3,
    topic: 'Lọc, cô cạn, chiết trong thực tiễn',
    concept: 'Dựa vào tính chất vật lí khác nhau để tách chất: lọc tách chất rắn không tan khỏi chất lỏng; cô cạn tách chất rắn tan khỏi dung dịch; chiết tách các chất lỏng không tan vào nhau.' },
  { id: 617, chapterId: 'ch-6-05', lessonNumber: 17, title: 'Bài 17: Tế bào - Đơn vị cơ sở của sự sống', subject: 'sinh_hoc', periods: 2,
    topic: 'Khái niệm tế bào và kích thước tế bào',
    concept: 'Mọi cơ thể sinh vật đều được cấu tạo từ một hoặc nhiều tế bào. Tế bào là đơn vị cấu trúc và chức năng cơ bản của mọi sinh vật sống.' },
  { id: 618, chapterId: 'ch-6-05', lessonNumber: 18, title: 'Bài 18: Cấu tạo và chức năng của tế bào', subject: 'sinh_hoc', periods: 3,
    topic: 'Màng tế bào, chất tế bào, nhân hoặc vùng nhân, lục lạp',
    concept: 'Ba thành phần chính của tế bào: Màng sinh chất (bảo vệ, kiểm soát trao đổi chất), Tế bào chất (chứa các bào quan, diễn ra chuyển hoá), Nhân/Vùng nhân (chứa vật chất di truyền, điều khiển hoạt động).' },
  { id: 619, chapterId: 'ch-6-05', lessonNumber: 19, title: 'Bài 19: Sự lớn lên và sinh sản của tế bào', subject: 'sinh_hoc', periods: 2,
    topic: 'Tế bào phân chia tạo cơ sở cho sự lớn lên của sinh vật',
    concept: 'Tế bào lớn lên đạt kích thước nhất định thì phân chia. Từ một tế bào mẹ ban đầu phân chia thành hai tế bào con, giúp cơ thể sinh vật lớn lên và thay thế tế bào già, tổn thương.' },
  { id: 620, chapterId: 'ch-6-06', lessonNumber: 20, title: 'Bài 20: Sinh vật đơn bào và sinh vật đa bào', subject: 'sinh_hoc', periods: 2,
    topic: 'Đặc điểm sinh vật đơn bào và đa bào',
    concept: 'Sinh vật đơn bào cấu tạo từ một tế bào duy nhất thực hiện mọi chức năng sống (trùng roi, vi khuẩn). Sinh vật đa bào cấu tạo từ nhiều tế bào chuyên hoá phối hợp hoạt động.' },
  { id: 621, chapterId: 'ch-6-06', lessonNumber: 21, title: 'Bài 21: Các cấp độ tổ chức trong cơ thể đa bào', subject: 'sinh_hoc', periods: 3,
    topic: 'Tế bào → Mô → Cơ quan → Hệ cơ quan → Cơ thể',
    concept: 'Cấp độ tổ chức cơ thể đa bào: Tế bào phối hợp thành Mô; nhiều mô phối hợp tạo thành Cơ quan; các cơ quan liên kết thành Hệ cơ quan; các hệ cơ quan phối hợp tạo thành Cơ thể hoàn chỉnh.' },
  { id: 622, chapterId: 'ch-6-07', lessonNumber: 22, title: 'Bài 22: Phân loại thế giới sống', subject: 'sinh_hoc', periods: 2,
    topic: 'Hệ thống 5 giới và tên khoa học của sinh vật',
    concept: 'Thế giới sống được phân chia thành 5 giới: Khởi sinh, Nguyên sinh, Nấm, Thực vật, Động vật. Tên khoa học của loài gồm hai từ: Tên chi (viết hoa) + Tên loài (viết thường).' },
  { id: 623, chapterId: 'ch-6-07', lessonNumber: 23, title: 'Bài 23: Khóa lưỡng phân', subject: 'sinh_hoc', periods: 2,
    topic: 'Nguyên tắc lập và sử dụng khóa lưỡng phân',
    concept: 'Khóa lưỡng phân là phương pháp phân loại dựa trên việc chia một nhóm sinh vật thành hai nhóm nhỏ hơn dựa vào các cặp đặc điểm đối lập nhau cho đến khi xác định được từng loài.' },
  { id: 624, chapterId: 'ch-6-07', lessonNumber: 24, title: 'Bài 24: Virus', subject: 'sinh_hoc', periods: 2,
    topic: 'Cấu tạo siêu hiển vi chưa có cấu tạo tế bào và vai trò của virus',
    concept: 'Virus chưa có cấu tạo tế bào, kích thước siêu hiển vi (vài chục đến vài trăm nanomét), gồm vỏ protein và lõi acid nucleic. Virus kí sinh nội bào bắt buộc, gây bệnh cho người và sinh vật.' },
  { id: 625, chapterId: 'ch-6-07', lessonNumber: 25, title: 'Bài 25: Vi khuẩn', subject: 'sinh_hoc', periods: 2,
    topic: 'Vi khuẩn nhân sơ, vai trò có lợi và phòng chống vi khuẩn có hại',
    concept: 'Vi khuẩn là sinh vật nhân sơ, cấu tạo đơn bào, sinh sản nhanh bằng phân đôi. Nhiều vi khuẩn có lợi (lên men, phân giải chất hữu cơ), một số vi khuẩn gây bệnh truyền nhiễm.' },
  { id: 626, chapterId: 'ch-6-07', lessonNumber: 26, title: 'Bài 26: Thực hành: Quan sát vi khuẩn. Tìm hiểu các bước làm sữa chua', subject: 'sinh_hoc', periods: 2,
    topic: 'Thao tác soi kính hiển vi và ứng dụng lên men lactic',
    concept: 'Vi khuẩn lactic lên men đường lactose trong sữa thành acid lactic làm sữa đông tụ và có vị chua thanh dịu. Quan sát giọt sữa chua pha loãng dưới kính hiển vi quang học thấy trực khuẩn và cầu khuẩn.' },
  { id: 627, chapterId: 'ch-6-07', lessonNumber: 27, title: 'Bài 27: Nguyên sinh vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Trùng biến hình, trùng giày, tảo lục đơn bào',
    concept: 'Nguyên sinh vật là những sinh vật nhân thực có kích thước hiển vi, phần lớn cấu tạo đơn bào (trùng roi, trùng giày, trùng biến hình, tảo lục).' },
  { id: 628, chapterId: 'ch-6-07', lessonNumber: 28, title: 'Bài 28: Thực hành: Làm tiêu bản và quan sát nguyên sinh vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Kĩ thuật làm tiêu bản giọt ép nước ao hồ',
    concept: 'Lấy mẫu nước ao hồ hoặc nước ngâm rơm rạ, nhỏ một giọt lên lam kính, đậy lamen không để bọt khí và soi dưới vật kính 10x rồi 40x để quan sát chuyển động của nguyên sinh vật.' },
  { id: 629, chapterId: 'ch-6-07', lessonNumber: 29, title: 'Bài 29: Nấm', subject: 'sinh_hoc', periods: 2,
    topic: 'Nấm đơn bào, nấm mốc, nấm đảm và vai trò của nấm',
    concept: 'Nấm là sinh vật nhân thực, dị dưỡng hoại sinh hoặc kí sinh. Gồm nấm men (đơn bào), nấm mốc, nấm lớn thể quả (nấm rơm, nấm hương). Chú ý không ăn nấm lạ có độc.' },
  { id: 630, chapterId: 'ch-6-07', lessonNumber: 30, title: 'Bài 30: Thực hành: Quan sát các loại nấm', subject: 'sinh_hoc', periods: 2,
    topic: 'Quan sát nấm men bánh mì, nấm mốc bánh mì, nấm rơm',
    concept: 'Quan sát hình dạng ngoài của mũ nấm, cuống nấm, phiến nấm ở nấm lớn; dùng kính hiển vi quan sát tế bào nấm men nảy chồi và sợi nấm mốc mang bào tử.' },
  { id: 631, chapterId: 'ch-6-07', lessonNumber: 31, title: 'Bài 31: Đa dạng thực vật', subject: 'sinh_hoc', periods: 3,
    topic: 'Rêu, Dương xỉ, Hạt trần, Hạt kín',
    concept: 'Bốn nhóm thực vật chính: Rêu (chưa có mạch dẫn, rễ giả), Dương xỉ (có mạch dẫn, sinh sản bằng bào tử), Hạt trần (sinh sản bằng nón, hạt hở trên lá noãn), Hạt kín (có hoa, quả, hạt được bảo vệ).' },
  { id: 632, chapterId: 'ch-6-07', lessonNumber: 32, title: 'Bài 32: Thực hành: Quan sát và phân biệt một số nhóm thực vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Phân loại mẫu vật cây rêu, cây dương xỉ, cành thông, cây có hoa',
    concept: 'Dựa vào cơ quan sinh dưỡng và cơ quan sinh sản để phân biệt các ngành thực vật: tìm ổ bào tử ở mặt dưới lá dương xỉ, nón thông đực - cái, hoa và hạt của thực vật Hạt kín.' },
  { id: 633, chapterId: 'ch-6-07', lessonNumber: 33, title: 'Bài 33: Động vật không xương sống', subject: 'sinh_hoc', periods: 3,
    topic: 'Ruột khoang, Giun, Thân mềm, Chân khớp',
    concept: 'Động vật không xương sống chiếm hơn 95% số loài động vật, cơ thể không có cột sống: Ruột khoang (thuỷ tức, sứa), Giun (giun tròn, giun đốt), Thân mềm (ốc, trai), Chân khớp (côn trùng, tôm).' },
  { id: 634, chapterId: 'ch-6-07', lessonNumber: 34, title: 'Bài 34: Động vật có xương sống', subject: 'sinh_hoc', periods: 3,
    topic: 'Cá, Lưỡng cư, Bò sát, Chim, Thú',
    concept: 'Động vật có cột sống bằng sụn hoặc xương: Cá (hô hấp bằng mang, vây bơi), Lưỡng cư (sống cạn và nước, da ẩm), Bò sát (vảy sừng, trứng có vỏ), Chim (lông vũ, cánh), Thú (đẻ con, nuôi con bằng sữa mẹ).' },
  { id: 635, chapterId: 'ch-6-07', lessonNumber: 35, title: 'Bài 35: Thực hành: Tìm hiểu sinh vật ngoài thiên nhiên', subject: 'sinh_hoc', periods: 2,
    topic: 'Điều tra đa dạng thực vật và động vật trong khuôn viên trường hoặc vườn địa phương',
    concept: 'Sử dụng máy ảnh, ống nhòm, sổ ghi chép, kính lúp cầm tay để ghi nhận loài sinh vật, mô tả nơi sống và lập danh mục phân loại sinh vật tại thực địa.' },
  { id: 636, chapterId: 'ch-6-07', lessonNumber: 36, title: 'Bài 36: Đa dạng sinh học', subject: 'sinh_hoc', periods: 2,
    topic: 'Khái niệm đa dạng gen, loài, hệ sinh thái và vai trò',
    concept: 'Đa dạng sinh học biểu thị sự phong phú về gen di truyền, số lượng loài và các hệ sinh thái trên Trái Đất. Cung cấp lương thực, thuốc men, duy trì cân bằng khí hậu toàn cầu.' },
  { id: 637, chapterId: 'ch-6-07', lessonNumber: 37, title: 'Bài 37: Thực hành: Tìm hiểu vai trò của đa dạng sinh học trong tự nhiên', subject: 'sinh_hoc', periods: 2,
    topic: 'Phân tích chuỗi thức ăn và giá trị bảo vệ đất, nước của rừng ngập mặn/rừng đầu nguồn',
    concept: 'Rừng phòng hộ và thảm thực vật giữ nước chống xói mòn đất, làm giảm thiệt hại thiên tai lũ quét; rạn san hô và rừng ngập mặn là vườn ươm tự nhiên của thuỷ hải sản.' },
  { id: 638, chapterId: 'ch-6-07', lessonNumber: 38, title: 'Bài 38: Nhận biết một số động vật có hại, có ích đối với đời sống con người', subject: 'sinh_hoc', periods: 2,
    topic: 'Động vật truyền bệnh, phá hoại mùa màng và động vật phục vụ thụ phấn, thiên địch',
    concept: 'Phân biệt động vật có ích (ong thụ phấn hoa, giun đất làm xốp đất, chim ăn sâu hại) và động vật gây hại (chuột phá mùa màng, muỗi Anopheles truyền sốt rét, bọ chét truyền dịch hạch).' },
  { id: 639, chapterId: 'ch-6-08', lessonNumber: 39, title: 'Bài 39: Lực và tác dụng của lực', subject: 'vat_li', periods: 2,
    topic: 'Khái niệm lực, tác dụng làm biến đổi chuyển động và biến dạng vật',
    concept: 'Lực là tác dụng đẩy hoặc kéo của vật này lên vật khác. Lực có thể làm thay đổi vận tốc chuyển động (nhanh lên, chậm đi, đổi hướng) hoặc làm vật bị biến dạng.' },
  { id: 640, chapterId: 'ch-6-08', lessonNumber: 40, title: 'Bài 40: Biểu diễn lực', subject: 'vat_li', periods: 2,
    topic: 'Gốc, phương, chiều, độ lớn của lực và mũi tên biểu diễn',
    concept: 'Lực là một đại lượng vectơ được biểu diễn bằng một mũi tên: gốc là điểm đặt của lực, hướng theo hướng tác dụng của lực, chiều dài tỉ lệ với độ lớn của lực theo một tỉ xích chọn trước.' },
  { id: 641, chapterId: 'ch-6-08', lessonNumber: 41, title: 'Bài 41: Trọng lượng và lực hấp dẫn', subject: 'vat_li', periods: 2,
    topic: 'Lực hút Trái Đất, mối liên hệ giữa trọng lượng và khối lượng P = 10m',
    concept: 'Lực hấp dẫn là lực hút giữa mọi vật có khối lượng trong vũ trụ. Trọng lượng là độ lớn lực hút của Trái Đất tác dụng lên vật. Hệ thức gần đúng: P ≈ 9,8m hoặc P ≈ 10m (với m tính bằng kg).' },
  { id: 642, chapterId: 'ch-6-08', lessonNumber: 42, title: 'Bài 42: Biến dạng của lò xo. Phép đo lực', subject: 'vat_li', periods: 2,
    topic: 'Độ dãn lò xo tỉ lệ với độ lớn lực kéo, cấu tạo lực kế',
    concept: 'Độ biến dạng (độ dãn) của lò xo tỉ lệ thuận với khối lượng quả cân treo vào hoặc lực kéo tác dụng lên nó. Lực kế hoạt động dựa vào đặc tính biến dạng đàn hồi của lò xo.' },
  { id: 643, chapterId: 'ch-6-08', lessonNumber: 43, title: 'Bài 43: Lực ma sát', subject: 'vat_li', periods: 3,
    topic: 'Ma sát trượt, ma sát lăn, ma sát nghỉ và ứng dụng',
    concept: 'Lực ma sát xuất hiện ở bề mặt tiếp xúc giữa hai vật và cản trở chuyển động tương đối của chúng. Ma sát có ích giúp người đi lại, xe phanh dừng; ma sát có hại làm mòn chi tiết máy, sinh nhiệt.' },
  { id: 644, chapterId: 'ch-6-08', lessonNumber: 44, title: 'Bài 44: Lực cản của nước và không khí', subject: 'vat_li', periods: 2,
    topic: 'Ảnh hưởng của hình dạng khí động học và môi trường cản trở',
    concept: 'Vật chuyển động trong chất lưu (không khí, nước) luôn chịu lực cản. Lực cản phụ thuộc vào diện tích tiếp xúc, hình dạng vật thể (hình dạng khí động học thuôn nhọn giảm sức cản) và tốc độ chuyển động.' },
  { id: 645, chapterId: 'ch-6-09', lessonNumber: 45, title: 'Bài 45: Năng lượng và các dạng năng lượng', subject: 'vat_li', periods: 2,
    topic: 'Động năng, thế năng, nhiệt năng, hoá năng, quang năng, điện năng',
    concept: 'Năng lượng tồn tại ở nhiều dạng: cơ năng (động năng của vật chuyển động, thế năng do độ cao/đàn hồi), nhiệt năng, quang năng, hoá năng trong thức ăn/nhiên liệu, điện năng.' },
  { id: 646, chapterId: 'ch-6-09', lessonNumber: 46, title: 'Bài 46: Sự truyền năng lượng', subject: 'vat_li', periods: 2,
    topic: 'Truyền nhiệt và thực hiện công',
    concept: 'Năng lượng có thể truyền từ vật này sang vật khác bằng cách truyền nhiệt (dẫn nhiệt, đối lưu, bức xạ) hoặc tác dụng lực làm sinh công (như búa đập vào đinh).' },
  { id: 647, chapterId: 'ch-6-09', lessonNumber: 47, title: 'Bài 47: Sự chuyển hóa năng lượng', subject: 'vat_li', periods: 2,
    topic: 'Chuyển đổi giữa cơ năng, điện năng, quang năng, nhiệt năng',
    concept: 'Năng lượng có thể biến đổi từ dạng này sang dạng khác. Ví dụ: quạt điện biến điện năng thành cơ năng và nhiệt năng; pin mặt trời biến quang năng thành điện năng.' },
  { id: 648, chapterId: 'ch-6-09', lessonNumber: 48, title: 'Bài 48: Định luật bảo toàn năng lượng. Năng lượng hao phí', subject: 'vat_li', periods: 2,
    topic: 'Năng lượng không tự nhiên sinh ra hay mất đi, năng lượng có ích và hao phí',
    concept: 'Định luật bảo toàn năng lượng: Năng lượng không tự sinh ra và cũng không tự mất đi, chỉ biến đổi từ dạng này sang dạng khác hoặc truyền từ vật này sang vật khác. Trong mọi quá trình luôn có phần năng lượng hao phí (chủ yếu là toả nhiệt ra môi trường).' },
  { id: 649, chapterId: 'ch-6-09', lessonNumber: 49, title: 'Bài 49: Năng lượng tái tạo', subject: 'vat_li', periods: 2,
    topic: 'Năng lượng mặt trời, gió, nước, địa nhiệt, sinh khối',
    concept: 'Nguồn năng lượng tái tạo là nguồn năng lượng liên tục được phục hồi tự nhiên, vô tận và thân thiện với môi trường (năng lượng mặt trời, năng lượng gió, thuỷ điện, địa nhiệt).' },
  { id: 650, chapterId: 'ch-6-09', lessonNumber: 50, title: 'Bài 50: Năng lượng và biến đổi khí hậu', subject: 'vat_li', periods: 2,
    topic: 'Hiệu ứng nhà kính, khí thải CO2 do nhiên liệu hoá thạch',
    concept: 'Việc đốt cháy nhiên liệu hoá thạch (than đá, dầu mỏ) thải lượng lớn khí nhà kính (CO2, CH4) gây hiện tượng ấm lên toàn cầu, băng tan và các hiện tượng thời tiết cực đoan.' },
  { id: 651, chapterId: 'ch-6-09', lessonNumber: 51, title: 'Bài 51: Tiết kiệm năng lượng', subject: 'vat_li', periods: 2,
    topic: 'Hành động tiết kiệm điện, sử dụng thiết bị dán nhãn năng lượng',
    concept: 'Tiết kiệm năng lượng giúp giảm chi phí sinh hoạt, kéo dài tuổi thọ nguồn tài nguyên và bảo vệ môi trường sinh thái: tắt thiết bị khi không dùng, dùng đèn LED, tận dụng ánh sáng tự nhiên.' },
  { id: 652, chapterId: 'ch-6-10', lessonNumber: 52, title: 'Bài 52: Chuyển động nhìn thấy của Mặt Trời. Thiên thể', subject: 'vat_li', periods: 2,
    topic: 'Trái Đất tự quay quanh trục từ Tây sang Đông và hiện tượng ngày đêm',
    concept: 'Hiện tượng Mặt Trời mọc đằng Đông lặn đằng Tây là chuyển động nhìn thấy do Trái Đất tự quay quanh trục của nó theo chiều từ Tây sang Đông.' },
  { id: 653, chapterId: 'ch-6-10', lessonNumber: 53, title: 'Bài 53: Mặt Trăng và các pha của Mặt Trăng', subject: 'vat_li', periods: 2,
    topic: 'Trăng tròn, trăng khuyết, không trăng do góc nhìn phần được chiếu sáng',
    concept: 'Mặt Trăng không tự phát sáng mà phản chiếu ánh sáng Mặt Trời. Khi Mặt Trăng chuyển động quanh Trái Đất, phần bề mặt được chiếu sáng hướng về Trái Đất thay đổi tạo nên các pha Mặt Trăng (Trăng tròn, Bán nguyệt, Trăng lưỡi liềm, Không trăng).' },
  { id: 654, chapterId: 'ch-6-10', lessonNumber: 54, title: 'Bài 54: Hệ Mặt Trời', subject: 'vat_li', periods: 2,
    topic: 'Mặt Trời và 8 hành tinh quay quanh',
    concept: 'Hệ Mặt Trời gồm Mặt Trời ở trung tâm và 8 hành tinh chuyển động xung quanh: Thủy tinh, Kim tinh, Trái Đất, Hỏa tinh, Mộc tinh, Thổ tinh, Thiên Vương tinh, Hải Vương tinh.' },
  { id: 655, chapterId: 'ch-6-10', lessonNumber: 55, title: 'Bài 55: Ngân Hà', subject: 'vat_li', periods: 2,
    topic: 'Dải Ngân Hà là một thiên hà xoắn ốc chứa Hệ Mặt Trời',
    concept: 'Ngân Hà (Milky Way) là một tập hợp khổng lồ hàng trăm tỉ ngôi sao, hành tinh, bụi và khí liên kết bởi lực hấp dẫn, có dạng hình xoắn ốc; Hệ Mặt Trời nằm ở một nhánh xoắn ốc của Ngân Hà.' }
];

console.log(`KHTN 6 has ${khtn6Chapters.length} chapters and ${khtn6LessonsRaw.length} lessons.`);

// ==========================================
// KHTN 7 DEFINITIONS
// ==========================================
const khtn7Chapters = [
  { id: 'ch-7-00', grade: 7, number: 0, code: 'Mở đầu', title: 'Mở đầu: Phương pháp và kĩ năng học tập môn Khoa học tự nhiên', subject: 'mo_dau', lessonIds: [701] },
  { id: 'ch-7-01', grade: 7, number: 1, code: 'Chương I', title: 'Chương I: Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hoá học', subject: 'hoa_hoc', lessonIds: [702, 703, 704] },
  { id: 'ch-7-02', grade: 7, number: 2, code: 'Chương II', title: 'Chương II: Phân tử. Liên kết hoá học', subject: 'hoa_hoc', lessonIds: [705, 706, 707] },
  { id: 'ch-7-03', grade: 7, number: 3, code: 'Chương III', title: 'Chương III: Tốc độ chuyển động', subject: 'vat_li', lessonIds: [708, 709, 710, 711] },
  { id: 'ch-7-04', grade: 7, number: 4, code: 'Chương IV', title: 'Chương IV: Âm thanh', subject: 'vat_li', lessonIds: [712, 713, 714] },
  { id: 'ch-7-05', grade: 7, number: 5, code: 'Chương V', title: 'Chương V: Ánh sáng', subject: 'vat_li', lessonIds: [715, 716, 717] },
  { id: 'ch-7-06', grade: 7, number: 6, code: 'Chương VI', title: 'Chương VI: Từ', subject: 'vat_li', lessonIds: [718, 719, 720] },
  { id: 'ch-7-07', grade: 7, number: 7, code: 'Chương VII', title: 'Chương VII: Trao đổi chất và chuyển hóa năng lượng ở sinh vật', subject: 'sinh_hoc', lessonIds: [721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731] },
  { id: 'ch-7-08', grade: 7, number: 8, code: 'Chương VIII', title: 'Chương VIII: Cảm ứng ở sinh vật', subject: 'sinh_hoc', lessonIds: [732, 733, 734] },
  { id: 'ch-7-09', grade: 7, number: 9, code: 'Chương IX', title: 'Chương IX: Sinh trưởng và phát triển ở sinh vật', subject: 'sinh_hoc', lessonIds: [735, 736, 737, 738] },
  { id: 'ch-7-10', grade: 7, number: 10, code: 'Chương X', title: 'Chương X: Sinh sản ở sinh vật', subject: 'sinh_hoc', lessonIds: [739, 740, 741, 742] }
];

const khtn7LessonsRaw = [
  { id: 701, chapterId: 'ch-7-00', lessonNumber: 1, title: 'Bài 1: Phương pháp và kĩ năng học tập môn Khoa học tự nhiên', subject: 'mo_dau', periods: 2,
    topic: 'Phương pháp tìm hiểu tự nhiên, kĩ năng quan sát, đo đạc, dự đoán, phân tích',
    concept: 'Phương pháp tìm hiểu tự nhiên gồm các bước: Đề xuất vấn đề → Đưa ra giả thuyết → Lập kế hoạch kiểm tra → Thực hiện kế hoạch → Viết báo cáo, thảo luận.' },
  { id: 702, chapterId: 'ch-7-01', lessonNumber: 2, title: 'Bài 2: Nguyên tử', subject: 'hoa_hoc', periods: 3,
    topic: 'Mô hình nguyên tử Rutherford - Bohr, hạt proton, neutron, electron',
    concept: 'Nguyên tử là hạt vô cùng nhỏ, trung hoà về điện. Gồm hạt nhân mang điện tích dương (chứa proton và neutron) và vỏ mang điện tích âm chứa các electron chuyển động theo từng lớp.' },
  { id: 703, chapterId: 'ch-7-01', lessonNumber: 3, title: 'Bài 3: Nguyên tố hoá học', subject: 'hoa_hoc', periods: 3,
    topic: 'Kí hiệu hoá học, số proton trong hạt nhân xác định nguyên tố',
    concept: 'Tập hợp các nguyên tử có cùng số proton trong hạt nhân thuộc cùng một nguyên tố hoá học. Mỗi nguyên tố được biểu diễn bằng một hoặc hai chữ cái theo kí hiệu quốc tế IUPAC.' },
  { id: 704, chapterId: 'ch-7-01', lessonNumber: 4, title: 'Bài 4: Sơ lược về bảng tuần hoàn các nguyên tố hoá học', subject: 'hoa_hoc', periods: 4,
    topic: 'Ô nguyên tố, chu kì, nhóm; kim loại, phi kim, khí hiếm',
    concept: 'Bảng tuần hoàn sắp xếp các nguyên tố theo chiều tăng dần của điện tích hạt nhân. Gồm 7 chu kì và 8 nhóm A (cùng các nhóm B). Phân loại thành kim loại, phi kim và khí hiếm.' },
  { id: 705, chapterId: 'ch-7-02', lessonNumber: 5, title: 'Bài 5: Phân tử - Đơn chất - Hợp chất', subject: 'hoa_hoc', periods: 3,
    topic: 'Phân tử, khối lượng phân tử (amu), đơn chất và hợp chất',
    concept: 'Phân tử là hạt đại diện cho chất, gồm một hay nhiều nguyên tử liên kết với nhau. Đơn chất tạo nên từ 1 nguyên tố (O2, Fe); hợp chất tạo nên từ 2 nguyên tố trở lên (H2O, NaCl, CO2).' },
  { id: 706, chapterId: 'ch-7-02', lessonNumber: 6, title: 'Bài 6: Giới thiệu về liên kết hoá học', subject: 'hoa_hoc', periods: 4,
    topic: 'Liên kết ion và liên kết cộng hoá trị theo quy tắc bát tử',
    concept: 'Liên kết ion hình thành do lực hút tĩnh điện giữa các ion trái dấu (như trong muối ăn NaCl). Liên kết cộng hoá trị hình thành do các cặp electron dùng chung giữa các nguyên tử (như H2O, CH4).' },
  { id: 707, chapterId: 'ch-7-02', lessonNumber: 7, title: 'Bài 7: Hoá trị và công thức hoá học', subject: 'hoa_hoc', periods: 4,
    topic: 'Quy tắc hoá trị và lập công thức hoá học',
    concept: 'Quy tắc hoá trị: Trong hợp chất AxBy có hoá trị a và b thì x.a = y.b. Công thức hoá học biểu diễn thành phần nguyên tố và số nguyên tử của từng nguyên tố trong phân tử.' },
  { id: 708, chapterId: 'ch-7-03', lessonNumber: 8, title: 'Bài 8: Tốc độ chuyển động', subject: 'vat_li', periods: 3,
    topic: 'Công thức v = s / t và ý nghĩa của tốc độ',
    concept: 'Tốc độ chuyển động cho biết mức độ nhanh hay chậm của chuyển động, xác định bằng quãng đường đi được trong một đơn vị thời gian: v = s / t (đơn vị m/s hoặc km/h; 1 m/s = 3,6 km/h).' },
  { id: 709, chapterId: 'ch-7-03', lessonNumber: 9, title: 'Bài 9: Đo tốc độ', subject: 'vat_li', periods: 3,
    topic: 'Phương pháp đo bằng đồng hồ bấm giây và cổng quang điện kết hợp đồng hồ đo thời gian hiện số',
    concept: 'Để đo tốc độ cần đo quãng đường s (bằng thước) và thời gian t (bằng đồng hồ bấm giây hoặc cổng quang điện kết nối đồng hồ hiện số MC-964).' },
  { id: 710, chapterId: 'ch-7-03', lessonNumber: 10, title: 'Bài 10: Đồ thị quãng đường - thời gian', subject: 'vat_li', periods: 3,
    topic: 'Vẽ và đọc đồ thị s - t để mô tả trạng thái chuyển động',
    concept: 'Đồ thị s - t có trục hoành biểu diễn thời gian t, trục tung biểu diễn quãng đường s. Đoạn đường thẳng dốc lên thể hiện chuyển động đều; đoạn nằm ngang biểu thị vật đứng yên.' },
  { id: 711, chapterId: 'ch-7-03', lessonNumber: 11, title: 'Bài 11: Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông', subject: 'vat_li', periods: 2,
    topic: 'Khoảng cách an toàn và quy định giới hạn tốc độ khi tham gia giao thông',
    concept: 'Tốc độ càng cao thì quãng đường phanh dừng càng dài, khả năng xử lí tình huống khẩn cấp giảm đi. Tuân thủ biển báo tốc độ và giữ khoảng cách an toàn giúp giảm thiểu tai nạn giao thông.' },
  { id: 712, chapterId: 'ch-7-04', lessonNumber: 12, title: 'Bài 12: Sóng âm', subject: 'vat_li', periods: 2,
    topic: 'Sự lan truyền dao động của nguồn âm trong các môi trường',
    concept: 'Âm thanh được tạo ra từ các vật dao động. Sóng âm truyền được qua các môi trường rắn, lỏng, khí nhưng không truyền được trong chân không (tốc độ truyền âm: rắn > lỏng > khí).' },
  { id: 713, chapterId: 'ch-7-04', lessonNumber: 13, title: 'Bài 13: Độ to và độ cao của âm', subject: 'vat_li', periods: 3,
    topic: 'Tần số quyết định độ cao (trầm/bổng), biên độ quyết định độ to (dB)',
    concept: 'Tần số dao động (số dao động trong 1 giây, đơn vị Hz) quyết định âm trầm hay bổng (tần số càng lớn âm càng bổng). Biên độ dao động quyết định độ to của âm (biên độ càng lớn âm càng to).' },
  { id: 714, chapterId: 'ch-7-04', lessonNumber: 14, title: 'Bài 14: Phản xạ âm, chống ô nhiễm tiếng ồn', subject: 'vat_li', periods: 2,
    topic: 'Sự phản xạ âm, tiếng vang và biện pháp giảm ô nhiễm tiếng ồn',
    concept: 'Sóng âm gặp bề mặt chướng ngại vật sẽ bị phản xạ trở lại. Bề mặt cứng nhẵn phản xạ âm tốt, bề mặt xốp xù xì hấp thụ âm tốt. Biện pháp chống tiếng ồn: trồng cây xanh, dùng vật liệu cách âm, lắp kính hai lớp.' },
  { id: 715, chapterId: 'ch-7-05', lessonNumber: 15, title: 'Bài 15: Năng lượng ánh sáng. Tia sáng, vùng tối', subject: 'vat_li', periods: 3,
    topic: 'Mô hình tia sáng, chùm sáng và giải thích hiện tượng nhật thực, nguyệt thực',
    concept: 'Ánh sáng truyền đi dưới dạng sóng mang năng lượng. Quy ước biểu diễn đường truyền ánh sáng bằng tia sáng (đường thẳng có mũi tên chỉ chiều). Vùng tối và vùng nửa tối hình thành sau vật cản sáng do ánh sáng truyền thẳng.' },
  { id: 716, chapterId: 'ch-7-05', lessonNumber: 16, title: 'Bài 16: Sự phản xạ ánh sáng', subject: 'vat_li', periods: 3,
    topic: 'Định luật phản xạ ánh sáng: tia phản xạ nằm trong mặt phẳng tới, góc phản xạ bằng góc tới (i\' = i)',
    concept: 'Định luật phản xạ ánh sáng: Tia phản xạ nằm trong mặt phẳng tới chứa tia tới và pháp tuyến tại điểm tới; góc phản xạ luôn luôn bằng góc tới (i\' = i).' },
  { id: 717, chapterId: 'ch-7-05', lessonNumber: 17, title: 'Bài 17: Ảnh của vật tạo bởi gương phẳng', subject: 'vat_li', periods: 2,
    topic: 'Tính chất ảnh ảo cùng chiều, lớn bằng vật và cách gương một khoảng bằng khoảng cách từ vật đến gương',
    concept: 'Ảnh tạo bởi gương phẳng là ảnh ảo không hứng được trên màn chắn, có kích thước bằng vật, cách gương một khoảng bằng khoảng cách từ vật tới gương, đối xứng với vật qua mặt gương.' },
  { id: 718, chapterId: 'ch-7-06', lessonNumber: 18, title: 'Bài 18: Nam châm', subject: 'vat_li', periods: 2,
    topic: 'Hai cực Bắc (N) và Nam (S) của nam châm, tương tác từ',
    concept: 'Mỗi thanh nam châm luôn có hai cực: cực Bắc (North - N) và cực Nam (South - S). Hai cực cùng tên đẩy nhau, hai cực khác tên hút nhau. Nam châm hút các vật liệu từ tính như sắt, thép, niken.' },
  { id: 719, chapterId: 'ch-7-06', lessonNumber: 19, title: 'Bài 19: Từ trường', subject: 'vat_li', periods: 3,
    topic: 'Khái niệm từ trường, từ phổ và đường sức từ',
    concept: 'Không gian xung quanh nam châm có từ trường, tác dụng lực từ lên kim nam châm đặt trong nó. Đường sức từ bên ngoài thanh nam châm có chiều đi ra từ cực Bắc (N) và đi vào cực Nam (S).' },
  { id: 720, chapterId: 'ch-7-06', lessonNumber: 20, title: 'Bài 20: Chế tạo nam châm điện đơn giản', subject: 'vat_li', periods: 2,
    topic: 'Cấu tạo cuộn dây quấn quanh lõi sắt non nối nguồn điện',
    concept: 'Nam châm điện gồm cuộn dây dẫn quấn quanh một lõi sắt non. Khi có dòng điện chạy qua, lõi sắt non bị nhiễm từ trở thành nam châm; khi ngắt dòng điện thì từ tính biến mất.' },
  { id: 721, chapterId: 'ch-7-07', lessonNumber: 21, title: 'Bài 21: Khái quát về trao đổi chất và chuyển hoá năng lượng', subject: 'sinh_hoc', periods: 2,
    topic: 'Mối quan hệ giữa đồng hoá và dị hoá trong cơ thể sống',
    concept: 'Trao đổi chất là quá trình cơ thể lấy các chất từ môi trường biến đổi thành chất cần thiết và thải chất cặn bã ra ngoài. Quá trình này luôn đi kèm chuyển hoá năng lượng.' },
  { id: 722, chapterId: 'ch-7-07', lessonNumber: 22, title: 'Bài 22: Quang hợp ở thực vật', subject: 'sinh_hoc', periods: 3,
    topic: 'Phương trình quang hợp: Nước + Carbon dioxide + Ánh sáng mặt trời → Glucose + Oxygen',
    concept: 'Quang hợp diễn ra tại lục lạp của lá cây: cây xanh hấp thụ ánh sáng mặt trời qua chất diệp lục, sử dụng nước và khí CO2 để tổng hợp chất hữu cơ (glucose) và giải phóng khí O2.' },
  { id: 723, chapterId: 'ch-7-07', lessonNumber: 23, title: 'Bài 23: Một số yếu tố ảnh hưởng đến quang hợp', subject: 'sinh_hoc', periods: 2,
    topic: 'Ánh sáng, nồng độ CO2, nhiệt độ, nước ảnh hưởng đến cường độ quang hợp',
    concept: 'Cường độ quang hợp phụ thuộc vào cường độ ánh sáng, nồng độ CO2 trong không khí, nhiệt độ môi trường và lượng nước cung cấp cho cây. Nắm vững yếu tố này giúp tăng năng suất cây trồng.' },
  { id: 724, chapterId: 'ch-7-07', lessonNumber: 24, title: 'Bài 24: Thực hành: Chứng minh quang hợp ở cây xanh', subject: 'sinh_hoc', periods: 2,
    topic: 'Thí nghiệm chứng minh lá cây tạo ra tinh bột và nhả khí oxygen khi có ánh sáng',
    concept: 'Thí nghiệm bịt băng giấy đen một phần lá, sau đó khử diệp lục bằng cồn sôi và nhỏ dung dịch iodine: phần lá được chiếu sáng bắt màu xanh tím chứng tỏ đã quang hợp tạo ra tinh bột.' },
  { id: 725, chapterId: 'ch-7-07', lessonNumber: 25, title: 'Bài 25: Hô hấp tế bào', subject: 'sinh_hoc', periods: 3,
    topic: 'Phương trình hô hấp: Glucose + Oxygen → Carbon dioxide + Nước + Năng lượng (ATP)',
    concept: 'Hô hấp tế bào diễn ra chủ yếu ở ti thể: phân giải chất hữu cơ (glucose) với sự tham gia của oxygen tạo thành CO2, nước và giải phóng năng lượng dưới dạng ATP cung cấp cho mọi hoạt động sống.' },
  { id: 726, chapterId: 'ch-7-07', lessonNumber: 26, title: 'Bài 26: Một số yếu tố ảnh hưởng đến hô hấp tế bào', subject: 'sinh_hoc', periods: 2,
    topic: 'Nhiệt độ, độ ẩm, hàm lượng oxygen và nồng độ CO2 trong bảo quản nông sản',
    concept: 'Hô hấp tế bào bị chi phối bởi nhiệt độ, hàm lượng nước, nồng độ O2 và CO2. Để bảo quản nông sản, cần kìm hãm hô hấp tế bào bằng cách làm khô, bảo quản lạnh hoặc bảo quản trong môi trường nồng độ CO2 cao.' },
  { id: 727, chapterId: 'ch-7-07', lessonNumber: 27, title: 'Bài 27: Thực hành: Hô hấp ở thực vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Thí nghiệm hạt nảy mầm toả nhiệt và thải khí carbon dioxide làm đục nước vôi trong',
    concept: 'Hạt nảy mầm diễn ra hô hấp tế bào mạnh mẽ: nhiệt độ bình chứa hạt nảy mầm tăng lên và khí thoát ra làm vẩn đục nước vôi trong Ca(OH)2 chứng tỏ có giải phóng CO2 và toả nhiệt.' },
  { id: 728, chapterId: 'ch-7-07', lessonNumber: 28, title: 'Bài 28: Khí khổng với sự thoát hơi nước ở lá', subject: 'sinh_hoc', periods: 2,
    topic: 'Cơ chế đóng mở của tế bào hình hạt đậu ở khí khổng',
    concept: 'Khí khổng nằm chủ yếu ở biểu bì dưới của lá. Khi no nước, tế bào hình hạt đậu căng ra làm lỗ khí mở; khi mất nước, tế bào xẹp lại làm lỗ khí đóng, điều tiết lượng nước thoát ra ngoài.' },
  { id: 729, chapterId: 'ch-7-07', lessonNumber: 29, title: 'Bài 29: Trao đổi nước và chất dinh dưỡng ở thực vật', subject: 'sinh_hoc', periods: 3,
    topic: 'Lông hút rễ hấp thụ nước/khoáng, dòng mạch gỗ và dòng mạch rây',
    concept: 'Rễ hút nước và muối khoáng nhờ lông hút; dòng mạch gỗ vận chuyển nước và ion khoáng từ rễ lên thân lá; dòng mạch rây vận chuyển chất hữu cơ từ lá đến các cơ quan dự trữ.' },
  { id: 730, chapterId: 'ch-7-07', lessonNumber: 30, title: 'Bài 30: Trao đổi nước và chất dinh dưỡng ở động vật', subject: 'sinh_hoc', periods: 3,
    topic: 'Tiêu hoá, tuần hoàn và bài tiết ở động vật',
    concept: 'Động vật lấy thức ăn và nước qua hệ tiêu hoá, biến đổi thành chất dinh dưỡng đơn giản, ngấm vào máu qua hệ tuần hoàn để nuôi cơ thể, các chất cặn bã được thải ra ngoài qua hệ bài tiết.' },
  { id: 731, chapterId: 'ch-7-07', lessonNumber: 31, title: 'Bài 31: Thực hành: Chứng minh thân vận chuyển nước và lá thoát hơi nước', subject: 'sinh_hoc', periods: 2,
    topic: 'Cắm cành hoa trắng vào nước pha mực đỏ và bọc túi nilon kín ở cành lá',
    concept: 'Sau vài giờ cắm vào nước pha mực đỏ, cánh hoa trắng chuyển màu đỏ do mạch gỗ vận chuyển nước màu lên. Túi nilon bọc cành lá xuất hiện giọt nước mờ chứng minh có hiện tượng thoát hơi nước.' },
  { id: 732, chapterId: 'ch-7-08', lessonNumber: 32, title: 'Bài 32: Cảm ứng ở sinh vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Khái niệm cảm ứng, tính hướng sáng, hướng nước, hướng trọng lực ở cây',
    concept: 'Cảm ứng là phản ứng của cơ thể sinh vật đối với kích thích từ môi trường. Ở thực vật thể hiện qua tính hướng động (hướng sáng, hướng trọng lực, hướng nước, hướng hoá) và ứng động (cụp lá ở cây trinh nữ).' },
  { id: 733, chapterId: 'ch-7-08', lessonNumber: 33, title: 'Bài 33: Tập tính ở động vật', subject: 'sinh_hoc', periods: 3,
    topic: 'Tập tính bẩm sinh và tập tính học được ở động vật',
    concept: 'Tập tính là chuỗi phản ứng của động vật trả lời kích thích. Gồm tập tính bẩm sinh (sinh ra đã có, mang tính bản năng di truyền) và tập tính học được (hình thành qua kinh nghiệm sống và rèn luyện).' },
  { id: 734, chapterId: 'ch-7-08', lessonNumber: 34, title: 'Bài 34: Thực hành: Quan sát tập tính ở động vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Quan sát tập tính săn mồi của nhện, tập tính rỉa lông của chim, phản xạ chó khi nghe kẻ kẻ chuông',
    concept: 'Quan sát và phân tích hành vi kiếm ăn, tự vệ, sinh sản, đánh dấu lãnh thổ ở các loài động vật trong tự nhiên hoặc video tư liệu thực tế.' },
  { id: 735, chapterId: 'ch-7-09', lessonNumber: 35, title: 'Bài 35: Các nhân tố ảnh hưởng đến sinh trưởng và phát triển ở sinh vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Nhiệt độ, ánh sáng, nước, dinh dưỡng chi phối sinh trưởng',
    concept: 'Sinh trưởng là sự tăng lên về kích thước và khối lượng cơ thể. Phát triển là quá trình biến đổi chất lượng gồm phân hoá tế bào và phát sinh cơ quan. Bị chi phối bởi nhiệt độ, thức ăn, ánh sáng, hormone.' },
  { id: 736, chapterId: 'ch-7-09', lessonNumber: 36, title: 'Bài 36: Sinh trưởng và phát triển ở thực vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Mô phân sinh đỉnh và mô phân sinh bên ở thực vật',
    concept: 'Mô phân sinh đỉnh giúp thân và rễ cây dài ra (sinh trưởng sơ cấp); mô phân sinh bên giúp thân cây to ra theo chiều ngang (sinh trưởng thứ cấp, hình thành vòng năm gỗ).' },
  { id: 737, chapterId: 'ch-7-09', lessonNumber: 37, title: 'Bài 37: Sinh trưởng và phát triển ở động vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Biến thái hoàn toàn (bướm, ếch) và biến thái không hoàn toàn (châu chấu) và không qua biến thái',
    concept: 'Phát triển không qua biến thái (con non sinh ra giống con trưởng thành như ở người, thú); phát triển qua biến thái hoàn toàn (ấu trùng khác hẳn con trưởng thành như bướm); qua biến thái không hoàn toàn (châu chấu qua nhiều lần lột xác).' },
  { id: 738, chapterId: 'ch-7-09', lessonNumber: 38, title: 'Bài 38: Thực hành: Quan sát sinh trưởng và phát triển ở sinh vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Theo dõi sự nảy mầm và phát triển của hạt đậu xanh theo thời gian',
    concept: 'Gieo hạt đậu xanh ẩm, mỗi ngày đo chiều dài rễ mầm, thân mầm, đếm số lá thật và vẽ biểu đồ tăng trưởng kích thước cây con.' },
  { id: 739, chapterId: 'ch-7-10', lessonNumber: 39, title: 'Bài 39: Sinh sản vô tính ở sinh vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Khái niệm sinh sản vô tính, giâm cành, chiết cành, ghép mắt',
    concept: 'Sinh sản vô tính là hình thức sinh sản không có sự kết hợp của giao tử đực và giao tử cái, con sinh ra giống hệt mẹ. Ứng dụng trong nông nghiệp: giâm cành, chiết cành, ghép cành, nuôi cấy mô tế bào.' },
  { id: 740, chapterId: 'ch-7-10', lessonNumber: 40, title: 'Bài 40: Sinh sản hữu tính ở sinh vật', subject: 'sinh_hoc', periods: 3,
    topic: 'Thụ phấn, thụ tinh, hình thành hợp tử ở thực vật và động vật',
    concept: 'Sinh sản hữu tính có sự kết hợp giữa giao tử đực (tinh trùng/hạt phấn) và giao tử cái (noãn/trứng) tạo thành hợp tử, hợp tử phát triển thành cơ thể mới mang đặc điểm của cả bố và mẹ.' },
  { id: 741, chapterId: 'ch-7-10', lessonNumber: 41, title: 'Bài 41: Các yếu tố ảnh hưởng và điều hoà, điều khiển sinh sản ở sinh vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Chiếu sáng nhân tạo, hormone sinh sản, thụ tinh nhân tạo',
    concept: 'Con người có thể chủ động điều khiển quá trình sinh sản của sinh vật bằng cách điều chỉnh ánh sáng, nhiệt độ (thắp đèn thanh long ra hoa trái vụ), tiêm hormone kích thích cá đẻ trứng, thụ tinh nhân tạo cho bò sữa.' },
  { id: 742, chapterId: 'ch-7-10', lessonNumber: 42, title: 'Bài 42: Thực hành: Nhân giống vô tính ở thực vật', subject: 'sinh_hoc', periods: 2,
    topic: 'Thao tác giâm cành rau muống/khoai lang và chiết cành cây ăn quả',
    concept: 'Chọn đoạn cành bánh tẻ, cắt vát góc 45 độ, xử lí thuốc kích rễ nếu có, cắm vào đất ẩm tơi xốp, che mát và tưới nước hàng ngày đến khi cây ra rễ mới.' }
];

console.log(`KHTN 7 has ${khtn7Chapters.length} chapters and ${khtn7LessonsRaw.length} lessons.`);

// ==========================================
// KHTN 8 DEFINITIONS
// ==========================================
const khtn8Chapters = [
  { id: 'ch-8-00', grade: 8, number: 0, code: 'Mở đầu', title: 'Mở đầu: Sử dụng một số hoá chất, thiết bị cơ bản trong phòng thí nghiệm', subject: 'mo_dau', lessonIds: [801] },
  { id: 'ch-8-01', grade: 8, number: 1, code: 'Chương I', title: 'Chương I: Phản ứng hoá học', subject: 'hoa_hoc', lessonIds: [802, 803, 804, 805, 806, 807] },
  { id: 'ch-8-02', grade: 8, number: 2, code: 'Chương II', title: 'Chương II: Một số hợp chất thông dụng', subject: 'hoa_hoc', lessonIds: [808, 809, 810, 811, 812] },
  { id: 'ch-8-03', grade: 8, number: 3, code: 'Chương III', title: 'Chương III: Khối lượng riêng và áp suất', subject: 'vat_li', lessonIds: [813, 814, 815, 816, 817] },
  { id: 'ch-8-04', grade: 8, number: 4, code: 'Chương IV', title: 'Chương IV: Tác dụng làm quay của lực', subject: 'vat_li', lessonIds: [818, 819] },
  { id: 'ch-8-05', grade: 8, number: 5, code: 'Chương V', title: 'Chương V: Điện', subject: 'vat_li', lessonIds: [820, 821, 822, 823, 824, 825] },
  { id: 'ch-8-06', grade: 8, number: 6, code: 'Chương VI', title: 'Chương VI: Nhiệt', subject: 'vat_li', lessonIds: [826, 827, 828] },
  { id: 'ch-8-07', grade: 8, number: 7, code: 'Chương VII', title: 'Chương VII: Sinh học cơ thể người', subject: 'sinh_hoc', lessonIds: [829, 830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 840] },
  { id: 'ch-8-08', grade: 8, number: 8, code: 'Chương VIII', title: 'Chương VIII: Sinh vật và môi trường', subject: 'sinh_hoc', lessonIds: [841, 842, 843, 844, 845, 846, 847] }
];

const khtn8LessonsRaw = [
  { id: 801, chapterId: 'ch-8-00', lessonNumber: 1, title: 'Bài 1: Sử dụng một số hoá chất, thiết bị cơ bản trong phòng thí nghiệm', subject: 'mo_dau', periods: 2,
    topic: 'Bình tam giác, phễu lọc, biến áp nguồn, đồng hồ vạn năng',
    concept: 'Sử dụng an toàn bình tam giác, ống hút nhỏ giọt, phễu chiết, máy khuấy từ và thiết bị đo điện năng trong phòng thí nghiệm khoa học tự nhiên.' },
  { id: 802, chapterId: 'ch-8-01', lessonNumber: 2, title: 'Bài 2: Phản ứng hoá học', subject: 'hoa_hoc', periods: 3,
    topic: 'Biến đổi hoá học, dấu hiệu phản ứng và phản ứng toả nhiệt/thu nhiệt',
    concept: 'Phản ứng hoá học là quá trình biến đổi chất này thành chất khác. Bản chất là sự liên kết giữa các nguyên tử thay đổi. Dấu hiệu: thay đổi màu sắc, xuất hiện kết tủa, sinh chất khí, toả nhiệt hoặc phát sáng.' },
  { id: 803, chapterId: 'ch-8-01', lessonNumber: 3, title: 'Bài 3: Mol và tỉ khối của chất khí', subject: 'hoa_hoc', periods: 3,
    topic: 'Số Avogadro (6,022.10^23), thể tích mol chất khí ở đkc (24,79 L) và d(A/B)',
    concept: '1 mol chất chứa 6,022.10^23 hạt vi mô. Ở điều kiện chuẩn (25 °C, 1 bar), 1 mol chất khí bất kì chiếm thể tích 24,79 L. Tỉ khối d(A/B) = MA / MB.' },
  { id: 804, chapterId: 'ch-8-01', lessonNumber: 4, title: 'Bài 4: Dung dịch và nồng độ', subject: 'hoa_hoc', periods: 3,
    topic: 'Độ tan, nồng độ phần trăm C% và nồng độ mol CM',
    concept: 'Nồng độ phần trăm: C% = (mct / mdd) * 100%. Nồng độ mol: CM = n / V (mol/L). Độ tan S là số gam chất tan trong 100 gam nước để tạo thành dung dịch bão hoà.' },
  { id: 805, chapterId: 'ch-8-01', lessonNumber: 5, title: 'Bài 5: Định luật bảo toàn khối lượng và phương trình hoá học', subject: 'hoa_hoc', periods: 3,
    topic: 'Tổng khối lượng chất tham gia bằng tổng khối lượng sản phẩm tạo thành',
    concept: 'Định luật Lomonosov - Lavoisier: Trong một phản ứng hoá học, tổng khối lượng của các chất sản phẩm bằng tổng khối lượng của các chất phản ứng. Phương trình hoá học biểu diễn tỉ lệ số nguyên tử, phân tử.' },
  { id: 806, chapterId: 'ch-8-01', lessonNumber: 6, title: 'Bài 6: Tính theo phương trình hoá học', subject: 'hoa_hoc', periods: 4,
    topic: 'Chuyển đổi n, m, V và tính lượng chất theo tỉ lệ phương trình, hiệu suất phản ứng H%',
    concept: 'Các bước tính toán hoá học: Tính số mol chất đã cho → Viết PTHH → Lập tỉ lệ số mol tìm chất cần tính → Chuyển sang khối lượng hoặc thể tích khí. Hiệu suất H% = (lượng thực tế / lượng lí thuyết) * 100%.' },
  { id: 807, chapterId: 'ch-8-01', lessonNumber: 7, title: 'Bài 7: Tốc độ phản ứng và chất xúc tác', subject: 'hoa_hoc', periods: 3,
    topic: 'Các yếu tố ảnh hưởng tốc độ: nồng độ, nhiệt độ, diện tích tiếp xúc, áp suất, chất xúc tác',
    concept: 'Tốc độ phản ứng đánh giá mức độ nhanh chậm của phản ứng. Tăng nhiệt độ, tăng nồng độ, tăng diện tích tiếp xúc chất rắn và sử dụng chất xúc tác làm tăng tốc độ phản ứng.' },
  { id: 808, chapterId: 'ch-8-02', lessonNumber: 8, title: 'Bài 8: Acid', subject: 'hoa_hoc', periods: 3,
    topic: 'Khái niệm acid phân li H+, tính chất hoá học làm đỏ quỳ tím, tác dụng kim loại trước H, bazo, oxide bazo',
    concept: 'Acid là những hợp chất mà phân tử gồm một hay nhiều nguyên tử hydrogen liên kết với gốc acid. Dung dịch acid làm quỳ tím hoá đỏ, tác dụng với kim loại đứng trước H giải phóng khí H2.' },
  { id: 809, chapterId: 'ch-8-02', lessonNumber: 9, title: 'Bài 9: Base. Thang pH', subject: 'hoa_hoc', periods: 3,
    topic: 'Base tan (kiềm) làm quỳ xanh, phenolphthalein hồng; thang pH đánh giá độ acid/base',
    concept: 'Base gồm kim loại liên kết nhóm hydroxide (-OH). Base kiềm làm quỳ tím hoá xanh, phenolphthalein hoá hồng; tác dụng với acid tạo muối và nước. Dung dịch pH < 7 có tính acid, pH = 7 trung tính, pH > 7 có tính base.' },
  { id: 810, chapterId: 'ch-8-02', lessonNumber: 10, title: 'Bài 10: Oxide', subject: 'hoa_hoc', periods: 3,
    topic: 'Phân loại oxide base, oxide acid, oxide lưỡng tính, oxide trung tính',
    concept: 'Oxide là hợp chất gồm hai nguyên tố, trong đó có một nguyên tố là oxygen. Gồm oxide base (Na2O, CaO tác dụng với acid ra muối), oxide acid (SO2, CO2 tác dụng với dung dịch kiềm), oxide lưỡng tính (Al2O3, ZnO).' },
  { id: 811, chapterId: 'ch-8-02', lessonNumber: 11, title: 'Bài 11: Muối', subject: 'hoa_hoc', periods: 3,
    topic: 'Khái niệm muối, tính chất hoá học tác dụng kim loại, acid, base, muối và điều kiện kết tủa',
    concept: 'Muối gồm kim loại (hoặc amoni NH4+) liên kết với gốc acid. Muối có thể tác dụng với kim loại mạnh hơn, dung dịch acid tạo muối mới/acid mới, dung dịch kiềm, và phản ứng trao đổi tạo kết tủa.' },
  { id: 812, chapterId: 'ch-8-02', lessonNumber: 12, title: 'Bài 12: Phân bón hoá học', subject: 'hoa_hoc', periods: 2,
    topic: 'Phân đạm (N), phân lân (P), phân kali (K) và phân NPK',
    concept: 'Phân bón hoá học cung cấp các nguyên tố dinh dưỡng khoáng cho cây trồng: đạm kích thích thân lá phát triển sinh khối; lân thúc đẩy rễ đâm sâu và phân hoá mầm hoa; kali giúp cây cứng cáp, tăng tích luỹ đường bột và chống chịu rét.' },
  { id: 813, chapterId: 'ch-8-03', lessonNumber: 13, title: 'Bài 13: Khối lượng riêng', subject: 'vat_li', periods: 2,
    topic: 'Công thức D = m / V, đơn vị kg/m3 và g/cm3',
    concept: 'Khối lượng riêng của một chất là khối lượng của một đơn vị thể tích chất đó: D = m / V (đơn vị kg/m3 hoặc g/cm3; 1 g/cm3 = 1000 kg/m3).' },
  { id: 814, chapterId: 'ch-8-03', lessonNumber: 14, title: 'Bài 14: Thực hành xác định khối lượng riêng', subject: 'vat_li', periods: 2,
    topic: 'Đo khối lượng bằng cân và thể tích bằng bình chia độ hoặc hình học',
    concept: 'Đo khối lượng m của vật bằng cân điện tử, đo thể tích V của vật rắn không thấm nước bằng phương pháp bình tràn hoặc bình chia độ, sau đó tính D = m / V.' },
  { id: 815, chapterId: 'ch-8-03', lessonNumber: 15, title: 'Bài 15: Áp suất trên một bề mặt', subject: 'vat_li', periods: 2,
    topic: 'Áp lực và công thức áp suất p = F / S (N/m2 hay Pascal Pa)',
    concept: 'Áp lực là lực ép có phương vuông góc với mặt bị ép. Áp suất là độ lớn áp lực trên một đơn vị diện tích bị ép: p = F / S (1 Pa = 1 N/m2).' },
  { id: 816, chapterId: 'ch-8-03', lessonNumber: 16, title: 'Bài 16: Áp suất chất lỏng. Áp suất khí quyển', subject: 'vat_li', periods: 3,
    topic: 'Áp suất chất lỏng p = d.h truyền đều theo mọi hướng và thí nghiệm Torricelli',
    concept: 'Chất lỏng gây áp suất theo mọi phương lên đáy bình, thành bình và các vật nhúng trong lòng nó. Khí quyển gây ra áp suất khí quyển khoảng 101300 Pa tương đương 760 mmHg.' },
  { id: 817, chapterId: 'ch-8-03', lessonNumber: 17, title: 'Bài 17: Lực đẩy Archimedes', subject: 'vat_li', periods: 3,
    topic: 'FA = d.V và điều kiện vật nổi, vật lơ lửng, vật chìm',
    concept: 'Vật nhúng chìm trong chất lỏng chịu lực đẩy hướng thẳng đứng từ dưới lên bằng trọng lượng phần chất lỏng bị chiếm chỗ: FA = d.V = D.g.V. Khi FA > P vật nổi, FA = P vật lơ lửng, FA < P vật chìm.' },
  { id: 818, chapterId: 'ch-8-04', lessonNumber: 18, title: 'Bài 18: Tác dụng làm quay của lực. Moment lực', subject: 'vat_li', periods: 2,
    topic: 'Khái niệm moment lực M = F.d và trục quay',
    concept: 'Tác dụng làm quay của lực lên một vật có trục quay cố định được đặc trưng bởi moment lực: M = F.d (đơn vị N.m), trong đó d là khoảng cách từ trục quay đến giá của lực (cánh tay đòn).' },
  { id: 819, chapterId: 'ch-8-04', lessonNumber: 19, title: 'Bài 19: Đòn bẩy và ứng dụng', subject: 'vat_li', periods: 2,
    topic: 'Ba loại đòn bẩy và điều kiện cân bằng đòn bẩy',
    concept: 'Đòn bẩy gồm điểm tựa O, điểm đặt lực cản và điểm đặt lực tác dụng. Đòn bẩy cho ta lợi về lực khi cánh tay đòn của lực tác dụng lớn hơn cánh tay đòn của lực cản (kéo cắt sắt, kìm nhổ đinh).' },
  { id: 820, chapterId: 'ch-8-05', lessonNumber: 20, title: 'Bài 20: Hiện tượng nhiễm điện do cọ xát', subject: 'vat_li', periods: 2,
    topic: 'Nhiễm điện do cọ xát, hai loại điện tích dương (+) và âm (-)',
    concept: 'Vật sau khi cọ xát có khả năng hút các vật nhẹ hoặc phóng tia lửa điện gọi là bị nhiễm điện. Có hai loại điện tích: điện tích dương và điện tích âm. Hai vật nhiễm điện cùng dấu đẩy nhau, khác dấu hút nhau.' },
  { id: 821, chapterId: 'ch-8-05', lessonNumber: 21, title: 'Bài 21: Dòng điện, nguồn điện', subject: 'vat_li', periods: 2,
    topic: 'Dòng điện là dòng chuyển dời có hướng của các hạt mang điện tích',
    concept: 'Dòng điện là dòng các điện tích dịch chuyển có hướng. Nguồn điện (pin, acquy, máy phát) có khả năng duy trì dòng điện chạy trong mạch kín nhờ tạo ra hiệu điện thế giữa hai cực.' },
  { id: 822, chapterId: 'ch-8-05', lessonNumber: 22, title: 'Bài 22: Mạch điện đơn giản', subject: 'vat_li', periods: 2,
    topic: 'Sơ đồ mạch điện, công tắc đóng mở và chiều dòng điện quy ước',
    concept: 'Mạch điện gồm nguồn điện, dây dẫn, khoá K và thiết bị tiêu thụ điện. Chiều quy ước của dòng điện trong mạch kín đi từ cực dương qua dây nối và thiết bị điện tới cực âm của nguồn điện.' },
  { id: 823, chapterId: 'ch-8-05', lessonNumber: 23, title: 'Bài 23: Tác dụng của dòng điện', subject: 'vat_li', periods: 3,
    topic: 'Năm tác dụng: nhiệt, phát sáng, từ, hoá học và sinh lí',
    concept: 'Dòng điện có các tác dụng cơ bản: Tác dụng nhiệt (bàn là, nồi cơm), phát sáng (bóng đèn LED), từ (chuông điện, cần cẩu điện), hoá học (mạ điện, tinh luyện đồng) và sinh lí (tim máy khử rung, điện giật).' },
  { id: 824, chapterId: 'ch-8-05', lessonNumber: 24, title: 'Bài 24: Cường độ dòng điện và hiệu điện thế', subject: 'vat_li', periods: 3,
    topic: 'Đơn vị Ampe (A), Vôn (V); ampe kế mắc nối tiếp, vôn kế mắc song song',
    concept: 'Cường độ dòng điện (I) đo bằng Ampe kế mắc nối tiếp. Hiệu điện thế (U) giữa hai điểm đo bằng Vôn kế mắc song song. Đơn vị đo là Ampe (A) và Vôn (V).' },
  { id: 825, chapterId: 'ch-8-05', lessonNumber: 25, title: 'Bài 25: Thực hành: Đo cường độ dòng điện và hiệu điện thế', subject: 'vat_li', periods: 2,
    topic: 'Đo I và U trong đoạn mạch nối tiếp và song song',
    concept: 'Trong đoạn mạch nối tiếp: I = I1 = I2 và U = U1 + U2. Trong đoạn mạch song song: U = U1 = U2 và I = I1 + I2. Thực hành thao tác mắc mạch và đọc đúng thang đo đồng hồ vạn năng.' },
  { id: 826, chapterId: 'ch-8-06', lessonNumber: 26, title: 'Bài 26: Năng lượng nhiệt và nội năng', subject: 'vat_li', periods: 2,
    topic: 'Năng lượng nhiệt của vật thể, nội năng thay đổi do truyền nhiệt hoặc thực hiện công',
    concept: 'Các phân tử cấu tạo nên vật luôn chuyển động hỗn loạn không ngừng gọi là chuyển động nhiệt. Nhiệt độ càng cao thì các phân tử chuyển động càng nhanh. Nội năng của vật là tổng động năng và thế năng của các phân tử cấu tạo nên vật.' },
  { id: 827, chapterId: 'ch-8-06', lessonNumber: 27, title: 'Bài 27: Sự truyền nhiệt', subject: 'vat_li', periods: 3,
    topic: 'Dẫn nhiệt (chất rắn), đối lưu (chất lỏng/khí), bức xạ nhiệt (chân không)',
    concept: 'Ba hình thức truyền nhiệt: Dẫn nhiệt là hình thức truyền nhiệt chủ yếu ở chất rắn (kim loại dẫn nhiệt tốt nhất); đối lưu là sự truyền nhiệt bằng các dòng chất lỏng hoặc chất khí; bức xạ nhiệt là sự truyền nhiệt bằng tia nhiệt đi thẳng truyền được cả trong chân không.' },
  { id: 828, chapterId: 'ch-8-06', lessonNumber: 28, title: 'Bài 28: Sự nở vì nhiệt', subject: 'vat_li', periods: 2,
    topic: 'Chất rắn, chất lỏng, chất khí nở ra khi nóng lên, co lại khi lạnh đi',
    concept: 'Hầu hết các chất nở ra khi nhiệt độ tăng và co lại khi nhiệt độ giảm. Chất khí nở vì nhiệt nhiều hơn chất lỏng, chất lỏng nở nhiều hơn chất rắn. Hiện tượng khe hở đường ray xe lửa, băng kép ngắt điện khi quá nhiệt.' },
  { id: 829, chapterId: 'ch-8-07', lessonNumber: 29, title: 'Bài 29: Khái quát về cơ thể người', subject: 'sinh_hoc', periods: 2,
    topic: 'Cấu tạo cơ thể người, các hệ cơ quan và sự phối hợp hoạt động',
    concept: 'Cơ thể người gồm 3 phần: đầu, thân, tứ chi. Được chia thành các hệ cơ quan: hệ vận động, tiêu hoá, tuần hoàn, hô hấp, bài tiết, thần kinh, nội tiết, sinh dục. Các hệ cơ quan phối hợp thống nhất dưới sự điều hòa của hệ thần kinh và hệ thể dịch.' },
  { id: 830, chapterId: 'ch-8-07', lessonNumber: 30, title: 'Bài 30: Hệ vận động ở người', subject: 'sinh_hoc', periods: 3,
    topic: 'Bộ xương, khớp xương, hệ cơ vân và tư thế ngồi học chống cong vẹo cột sống',
    concept: 'Hệ vận động gồm bộ xương và cơ vân. Khớp xương gồm khớp động, khớp bán động và khớp bất động. Cần bổ sung canxi, tắm nắng hợp lí và ngồi học đúng tư thế để tránh cong vẹo cột sống.' },
  { id: 831, chapterId: 'ch-8-07', lessonNumber: 31, title: 'Bài 31: Dinh dưỡng và tiêu hóa ở người', subject: 'sinh_hoc', periods: 3,
    topic: 'Ống tiêu hoá, tuyến tiêu hoá và sự biến đổi thức ăn cơ học/hoá học',
    concept: 'Tiêu hoá gồm biến đổi cơ học (nhai, nghiền, co bóp) và biến đổi hoá học nhờ các enzyme dịch vị, dịch tụy, dịch ruột phân giải carbohydrate, protein, lipid thành dưỡng chất ngấm vào máu qua lông ruột.' },
  { id: 832, chapterId: 'ch-8-07', lessonNumber: 32, title: 'Bài 32: Máu và hệ tuần hoàn của cơ thể người', subject: 'sinh_hoc', periods: 3,
    topic: 'Huyết tương, hồng cầu, bạch cầu, tiểu cầu, vòng tuần hoàn lớn và nhỏ, nhóm máu ABO',
    concept: 'Máu gồm huyết tương (chiếm 55%) và các tế bào máu (hồng cầu vận chuyển khí, bạch cầu bảo vệ, tiểu cầu đông máu). Hệ tuần hoàn gồm tim 4 ngăn đập co bóp đẩy máu qua vòng tuần hoàn lớn (nuôi cơ thể) và vòng tuần hoàn nhỏ (trao đổi khí ở phổi).' },
  { id: 833, chapterId: 'ch-8-07', lessonNumber: 33, title: 'Bài 33: Miễn dịch và hệ bạch huyết', subject: 'sinh_hoc', periods: 2,
    topic: 'Kháng nguyên, kháng thể, miễn dịch tự nhiên, miễn dịch nhân tạo qua tiêm vaccine',
    concept: 'Kháng nguyên là chất lạ kích thích cơ thể sinh kháng thể tương ứng. Miễn dịch là khả năng cơ thể không bị mắc một bệnh nào đó. Tiêm vaccine đưa mầm bệnh đã bất hoạt vào kích hoạt tế bào nhớ miễn dịch.' },
  { id: 834, chapterId: 'ch-8-07', lessonNumber: 34, title: 'Bài 34: Hệ hô hấp ở người', subject: 'sinh_hoc', periods: 2,
    topic: 'Đường dẫn khí và hai lá phổi; cơ chế trao đổi khí ở phế nang',
    concept: 'Hệ hô hấp gồm đường dẫn khí (mũi, họng, thanh quản, khí quản, phế quản) và hai lá phổi chứa hàng trăm triệu phế nang. Sự trao đổi khí diễn ra theo cơ chế khuếch tán: O2 từ phế nang vào máu, CO2 từ máu vào phế nang.' },
  { id: 835, chapterId: 'ch-8-07', lessonNumber: 35, title: 'Bài 35: Hệ bài tiết ở người', subject: 'sinh_hoc', periods: 2,
    topic: 'Cấu tạo đơn vị chức năng của thận (nephron) và quá trình tạo nước tiểu',
    concept: 'Hệ bài tiết nước tiểu gồm hai quả thận, ống dẫn nước tiểu, bóng đái và ống đái. Mỗi quả thận có khoảng 1 triệu nephron thực hiện quá trình lọc máu ở cầu thận, tái hấp thu ở ống thận để bài tiết chất độc hại và điều hoà nước.' },
  { id: 836, chapterId: 'ch-8-07', lessonNumber: 36, title: 'Bài 36: Điều hòa môi trường trong của cơ thể', subject: 'sinh_hoc', periods: 2,
    topic: 'Cân bằng nội môi (pH máu, đường huyết, nồng độ áp suất thẩm thấu)',
    concept: 'Môi trường trong gồm máu, dịch mô và bạch huyết. Cân bằng nội môi duy trì sự ổn định nồng độ các chất, pH và nhiệt độ. Gan và thận đóng vai trò trọng yếu trong việc điều hoà đường huyết và thải độc.' },
  { id: 837, chapterId: 'ch-8-07', lessonNumber: 37, title: 'Bài 37: Hệ thần kinh và các giác quan ở người', subject: 'sinh_hoc', periods: 3,
    topic: 'Não bộ, tuỷ sống, dây thần kinh; tật khúc xạ mắt và vệ sinh thị giác, thính giác',
    concept: 'Hệ thần kinh gồm thần kinh trung ương (não bộ, tuỷ sống) và thần kinh ngoại biên (dây thần kinh, hạch thần kinh). Điều khiển, điều hoà mọi hoạt động cảm giác và vận động. Chăm sóc mắt chống cận thị bằng việc chiếu sáng đủ và giữ khoảng cách 25-30 cm.' },
  { id: 838, chapterId: 'ch-8-07', lessonNumber: 38, title: 'Bài 38: Hệ nội tiết ở người', subject: 'sinh_hoc', periods: 2,
    topic: 'Tuyến yên, tuyến giáp, tuyến tuỵ, tuyến thượng thận và tác dụng của hormone',
    concept: 'Tuyến nội tiết tiết hormone ngấm thẳng vào máu điều hoà chuyển hoá trong cơ thể. Tuyến yên là tuyến chỉ huy điều hoà hoạt động các tuyến khác; tuyến tuỵ tiết insulin và glucagon điều hoà đường huyết.' },
  { id: 839, chapterId: 'ch-8-07', lessonNumber: 39, title: 'Bài 39: Da và điều hòa thân nhiệt ở người', subject: 'sinh_hoc', periods: 2,
    topic: 'Cấu tạo biểu bì, bì, mỡ dưới da; cơ chế toát mồ hôi, co dãn mạch máu dưới da',
    concept: 'Da bảo vệ cơ thể, cảm giác, bài tiết và điều hòa thân nhiệt. Khi trời nóng, mao mạch dưới da dãn ra, tuyến mồ hôi tiết nhiều nước bốc hơi làm mát cơ thể; khi trời lạnh, mạch máu co lại, cơ dựng lông co (nổi da gà) giữ nhiệt.' },
  { id: 840, chapterId: 'ch-8-07', lessonNumber: 40, title: 'Bài 40: Sinh sản ở người', subject: 'sinh_hoc', periods: 2,
    topic: 'Cơ quan sinh dục nam/nữ, thụ tinh, thụ thai, mang thai và sức khoẻ sinh sản vị thành niên',
    concept: 'Hệ sinh dục sản sinh giao tử và tiết hormone giới tính (testosterone ở nam, estrogen/progesterone ở nữ). Thụ tinh diễn ra ở 1/3 phía ngoài ống dẫn trứng. Giáo dục sức khoẻ sinh sản giúp phòng tránh có thai ngoài ý muốn và các bệnh lây truyền qua đường tình dục.' },
  { id: 841, chapterId: 'ch-8-08', lessonNumber: 41, title: 'Bài 41: Môi trường và các nhân tố sinh thái', subject: 'sinh_hoc', periods: 2,
    topic: 'Môi trường sống, nhân tố vô sinh, nhân tố hữu sinh và giới hạn sinh thái',
    concept: 'Môi trường sống là nơi sinh sống của sinh vật gồm môi trường đất, nước, không khí và sinh vật. Nhân tố sinh thái gồm nhân tố vô sinh (ánh sáng, nhiệt độ, độ ẩm) và nhân tố hữu sinh (con người và các loài sinh vật khác).' },
  { id: 842, chapterId: 'ch-8-08', lessonNumber: 42, title: 'Bài 42: Quần thể sinh vật', subject: 'sinh_hoc', periods: 3,
    topic: 'Khái niệm quần thể, tỉ lệ giới tính, thành phần nhóm tuổi, mật độ cá thể',
    concept: 'Quần thể sinh vật là tập hợp các cá thể cùng loài, cùng sinh sống trong một khoảng không gian xác định, vào một thời điểm nhất định và có khả năng sinh sản tạo thành thế hệ mới. Mật độ cá thể là đặc trưng cơ bản nhất.' },
  { id: 843, chapterId: 'ch-8-08', lessonNumber: 43, title: 'Bài 43: Quần xã sinh vật', subject: 'sinh_hoc', periods: 3,
    topic: 'Đặc trưng quần xã: độ đa dạng, loài ưu thế, loài đặc trưng và quan hệ cạnh tranh, hỗ trợ',
    concept: 'Quần xã sinh vật là tập hợp các quần thể sinh vật thuộc nhiều loài khác nhau cùng sống trong một sinh cảnh. Giữa các loài có mối quan hệ hỗ trợ (cộng sinh, hội sinh) hoặc đối địch (cạnh tranh, kí sinh, con mồi - vật ăn thịt).' },
  { id: 844, chapterId: 'ch-8-08', lessonNumber: 44, title: 'Bài 44: Hệ sinh thái', subject: 'sinh_hoc', periods: 3,
    topic: 'Thành phần hệ sinh thái, chuỗi và lưới thức ăn, tháp sinh thái',
    concept: 'Hệ sinh thái gồm quần xã sinh vật và sinh cảnh vô sinh. Sinh vật chia thành 3 nhóm: sản xuất (cây xanh), tiêu thụ (động vật ăn cỏ, ăn thịt), phân giải (vi khuẩn, nấm). Dòng năng lượng truyền theo chuỗi và lưới thức ăn.' },
  { id: 845, chapterId: 'ch-8-08', lessonNumber: 45, title: 'Bài 45: Sinh quyển', subject: 'sinh_hoc', periods: 2,
    topic: 'Khái niệm sinh quyển, các khu sinh học trên cạn và dưới nước',
    concept: 'Sinh quyển là toàn bộ các sinh vật sống cùng các thành phần môi trường xung quanh trên bề mặt Trái Đất bao gồm thạch quyển, thuỷ quyển và phần dưới của khí quyển. Gồm các khu sinh học (rừng mưa nhiệt đới, xa van, sa mạc, thảo nguyên, rừng taiga, đài nguyên).' },
  { id: 846, chapterId: 'ch-8-08', lessonNumber: 46, title: 'Bài 46: Cân bằng tự nhiên', subject: 'sinh_hoc', periods: 2,
    topic: 'Cơ chế khống chế sinh học và sự cân bằng số lượng cá thể trong quần xã',
    concept: 'Cân bằng tự nhiên là trạng thái ổn định động của hệ sinh thái, số lượng cá thể của các quần thể dao động quanh vị trí cân bằng nhờ cơ chế tự điều chỉnh và khống chế sinh học giữa vật dữ và con mồi.' },
  { id: 847, chapterId: 'ch-8-08', lessonNumber: 47, title: 'Bài 47: Bảo vệ môi trường', subject: 'sinh_hoc', periods: 2,
    topic: 'Ô nhiễm môi trường, nguyên nhân suy giảm đa dạng sinh học và các biện pháp bảo vệ',
    concept: 'Ô nhiễm môi trường (không khí, nước, đất, rác thải nhựa) đe dọa trực tiếp sự sống. Cần tích cực trồng rừng, phân loại rác thải tại nguồn, xử lí nước thải sinh hoạt và công nghiệp, sử dụng năng lượng sạch.' }
];

console.log(`KHTN 8 has ${khtn8Chapters.length} chapters and ${khtn8LessonsRaw.length} lessons.`);

// ==========================================
// QUESTION GENERATOR HELPER
// ==========================================
// Constraints:
// - Physics: indicator = ''
// - Chemistry: indicator = 'HH1.1'..'HH1.7', 'HH2.1'..'HH2.5', 'HH3.1', 'HH3.2'
// - Biology: indicator = 'NT1'..'NT8', 'TH1'..'TH5', 'VD1', 'VD2'
// - Real scientific context, no mention of "Bài X" or "trong bài học"

function generateQuestionsForLesson(lesson, grade) {
  const { id, chapterId, lessonNumber, title, subject, topic, concept } = lesson;
  const questions = [];

  let indBiet = '';
  let indHieu = '';
  let indVD = '';

  if (subject === 'vat_li') {
    indBiet = '';
    indHieu = '';
    indVD = '';
  } else if (subject === 'hoa_hoc') {
    indBiet = 'HH1.1';
    indHieu = 'HH2.1';
    indVD = 'HH3.1';
  } else if (subject === 'sinh_hoc') {
    indBiet = 'NT1';
    indHieu = 'TH1';
    indVD = 'VD1';
  } else {
    // mo_dau
    indBiet = '';
    indHieu = '';
    indVD = '';
  }

  const titleClean = title.replace(/^Bài\s*\d+:\s*/, '');

  // 1. MCQ Nhận biết
  questions.push({
    id: `q-g${grade}-l${lessonNumber}-mcq1`,
    grade,
    chapterId,
    lessonId: id,
    type: 'mcq',
    level: 'biet',
    indicator: indBiet,
    requirementText: `Nhận biết được đặc điểm, khái niệm cốt lõi liên quan đến ${titleClean.toLowerCase()}.`,
    prompt: `Khi tìm hiểu về ${titleClean.toLowerCase()} trong tự nhiên và đời sống, phát biểu nào sau đây là chính xác nhất?`,
    options: [
      `${concept.split('.')[0]}.`,
      `Các hiện tượng này luôn diễn ra ngẫu nhiên và không tuân theo bất kì quy luật vật lí hay hoá sinh nào.`,
      `Chỉ xảy ra trong môi trường phòng thí nghiệm kín chứ không tồn tại trong tự nhiên.`,
      `Không có bất kì sự chuyển hoá hoặc biến đổi vật chất, năng lượng nào đi kèm.`
    ],
    correctOptionIndex: 0,
    points: 0.25,
    explanation: `Theo cơ sở khoa học: ${concept.split('.')[0]}.`,
    knowledgeSectionRef: 'coreConcepts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 2. MCQ Thông hiểu
  questions.push({
    id: `q-g${grade}-l${lessonNumber}-mcq2`,
    grade,
    chapterId,
    lessonId: id,
    type: 'mcq',
    level: 'hieu',
    indicator: indHieu,
    requirementText: `Giải thích được ý nghĩa và cơ chế hoạt động của ${titleClean.toLowerCase()}.`,
    prompt: `Trong quá trình khảo sát thực nghiệm về ${topic.toLowerCase()}, nhận định nào sau đây phản ánh đúng bản chất hiện tượng?`,
    options: [
      `Quá trình luôn gắn liền với sự bảo toàn, biến đổi năng lượng hoặc tính chất đặc trưng của vật chất.`,
      `Năng lượng tự nhiên tự sinh ra thêm sau mỗi chu trình biến đổi.`,
      `Mọi biến đổi đều làm mất đi hoàn toàn khối lượng của hệ ban đầu.`,
      `Nhiệt độ môi trường hoàn toàn không ảnh hưởng đến tốc độ hoặc trạng thái của hệ.`
    ],
    correctOptionIndex: 0,
    points: 0.25,
    explanation: `Hiện tượng này tuân theo nguyên lí: ${concept.slice(0, 100)}...`,
    knowledgeSectionRef: 'coreConcepts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 3. True / False Thông hiểu
  questions.push({
    id: `q-g${grade}-l${lessonNumber}-tf1`,
    grade,
    chapterId,
    lessonId: id,
    type: 'true_false',
    level: 'hieu',
    indicator: indHieu,
    requirementText: `Đánh giá tính đúng/sai của các nhận định liên quan đến ${titleClean.toLowerCase()}.`,
    prompt: `Khi phân tích các thông số và ứng dụng thực tiễn của ${titleClean.toLowerCase()}, hãy xét tính đúng/sai của các nhận định sau:`,
    statements: [
      { id: 'a', text: `Nội dung cốt lõi: ${concept.split('.')[0]}.`, isTrue: true, explanation: 'Nhận định đúng với nguyên lí khoa học.' },
      { id: 'b', text: `Hiện tượng này mâu thuẫn hoàn toàn với các định luật bảo toàn trong khoa học tự nhiên.`, isTrue: false, explanation: 'Mọi quá trình tự nhiên đều tuân theo các định luật bảo toàn.' },
      { id: 'c', text: `Có thể ứng dụng các quy luật này vào kĩ thuật chế tạo thiết bị, chăm sóc sức khoẻ hoặc bảo vệ môi trường.`, isTrue: true, explanation: 'Khoa học tự nhiên luôn gắn liền với ứng dụng thực tiễn đời sống.' },
      { id: 'd', text: `Tất cả các biến đổi trong tự nhiên đều diễn ra tức thời mà không cần điều kiện tác nhân môi trường.`, isTrue: false, explanation: 'Tốc độ và chiều hướng biến đổi luôn phụ thuộc vào các điều kiện cụ thể của môi trường.' }
    ],
    points: 1.0,
    explanation: `Cần nắm vững bản chất khoa học: ${concept.slice(0, 120)}...`,
    knowledgeSectionRef: 'coreConcepts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 4. Short Answer Vận dụng
  questions.push({
    id: `q-g${grade}-l${lessonNumber}-sa1`,
    grade,
    chapterId,
    lessonId: id,
    type: 'short_answer',
    level: 'van_dung',
    indicator: indVD,
    requirementText: `Vận dụng hiểu biết về ${titleClean.toLowerCase()} để đưa ra kết luận hoặc tính toán ngắn gọn.`,
    prompt: `Trong một thí nghiệm đo đạc hoặc quan sát thực tế về ${topic.toLowerCase()}, yếu tố hoặc điều kiện trọng tâm nào quyết định trực tiếp đến độ chính xác và tính ổn định của kết quả?`,
    acceptedAnswers: ['điều kiện nhiệt độ', 'nhiệt độ', 'độ chính xác dụng cụ', 'thiết bị đo', 'áp suất', 'nồng độ'],
    points: 0.5,
    explanation: `Để kết quả quan sát và đo đạc đạt độ tin cậy cao, việc kiểm soát chặt chẽ các điều kiện môi trường (nhiệt độ, thiết bị đo chuẩn) là yếu tố quyết định.`,
    knowledgeSectionRef: 'examples',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 5. Essay Vận dụng
  questions.push({
    id: `q-g${grade}-l${lessonNumber}-es1`,
    grade,
    chapterId,
    lessonId: id,
    type: 'essay',
    level: 'van_dung',
    indicator: indVD,
    requirementText: `Trình bày ý nghĩa khoa học và đề xuất giải pháp thực tiễn gắn liền với ${titleClean.toLowerCase()}.`,
    prompt: `Hãy giải thích cơ sở khoa học của hiện tượng liên quan đến ${titleClean.toLowerCase()} trong thực tiễn và nêu ít nhất 2 biện pháp ứng dụng hoặc bảo vệ an toàn trong đời sống hàng ngày.`,
    sampleAnswer: `Cơ sở khoa học: ${concept}. Ứng dụng/Biện pháp: (1) Tuân thủ quy trình kĩ thuật và hướng dẫn an toàn; (2) Sử dụng hợp lí, tiết kiệm nguồn lực và giảm thiểu tác động tiêu cực đến môi trường xung quanh.`,
    rubricSteps: [
      { id: 'step-1', description: 'Nêu rõ được bản chất và cơ sở khoa học của hiện tượng', points: 0.5 },
      { id: 'step-2', description: 'Đề xuất được 2 biện pháp ứng dụng hoặc an toàn thực tiễn hợp lí', points: 0.5 }
    ],
    points: 1.0,
    explanation: `Học sinh cần liên hệ kiến thức lí thuyết với hiện tượng đời sống thực tế một cách logic và chính xác.`,
    knowledgeSectionRef: 'quickSummary',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return questions;
}

// Convert raw lesson definition into complete LessonItem
function buildCompleteLesson(raw, grade) {
  const titleClean = raw.title.replace(/^Bài\s*\d+:\s*/, '');
  return {
    id: raw.id,
    grade,
    chapterId: raw.chapterId,
    lessonNumber: raw.lessonNumber,
    title: raw.title,
    subject: raw.subject,
    periods: raw.periods,
    objectives: [
      `Trình bày được các khái niệm và bản chất cốt lõi của ${titleClean.toLowerCase()}.`,
      `Giải thích được các hiện tượng thực tế và vận dụng kiến thức vào bảo vệ môi trường, nâng cao chất lượng cuộc sống.`
    ],
    coreConcepts: [
      raw.concept,
      `Vận dụng nguyên lí khoa học của ${titleClean.toLowerCase()} để giải thích các hiện tượng quan sát được trong đời sống.`
    ],
    formulasAndLaws: [
      {
        name: `Quy tắc / Định luật liên quan đến ${titleClean}`,
        formula: raw.subject === 'vat_li' ? 'Tuân thủ các định luật vật lí thực nghiệm' : 'Tuân thủ quy luật biến đổi tự nhiên',
        units: 'Hệ SI chuẩn',
        description: `Bảo đảm tính chính xác khi đo lường, tính toán và phân tích hiện tượng ${titleClean.toLowerCase()}.`
      }
    ],
    examples: [
      {
        problem: `Một học sinh quan sát hiện tượng thực tế liên quan đến ${titleClean.toLowerCase()} và cần giải thích cơ chế diễn ra. Em hãy đưa ra lời giải thích ngắn gọn.`,
        solution: `Dựa vào tính chất khoa học: ${raw.concept.split('.')[0]}, ta giải thích được hiện tượng diễn ra đúng theo quy luật tự nhiên.`
      }
    ],
    commonMistakes: [
      `Nhầm lẫn giữa các khái niệm tương đồng nhưng khác bản chất trong ${titleClean.toLowerCase()}.`,
      `Không chú ý đến các điều kiện tiêu chuẩn khi quan sát hoặc đo đạc số liệu.`
    ],
    quickSummary: [
      raw.concept.split('.')[0] + '.',
      `Luôn chú ý tính logic khoa học và ứng dụng thực tiễn trong đời sống.`
    ],
    isHidden: false,
    visibleToClasses: ['ALL'],
    updatedAt: new Date().toISOString()
  };
}

// ==========================================
// BUILD SEED FILES
// ==========================================

// KHTN 6
const khtn6Lessons = khtn6LessonsRaw.map(l => buildCompleteLesson(l, 6));
const khtn6Questions = khtn6LessonsRaw.flatMap(l => generateQuestionsForLesson(l, 6));
const khtn6Content = `// server/seed/khtn6Seed.js
// Dữ liệu chuẩn KHTN 6 - Bộ sách Kết nối tri thức với cuộc sống
export const KHTN6_CHAPTERS = ${JSON.stringify(khtn6Chapters, null, 2)};

export const KHTN6_LESSONS = ${JSON.stringify(khtn6Lessons, null, 2)};

export const KHTN6_QUESTIONS = ${JSON.stringify(khtn6Questions, null, 2)};
`;
fs.writeFileSync(path.join(SEED_DIR, 'khtn6Seed.js'), khtn6Content, 'utf-8');
console.log(`Saved KHTN 6 seed: ${khtn6Chapters.length} chapters, ${khtn6Lessons.length} lessons, ${khtn6Questions.length} questions.`);

// KHTN 7
const khtn7Lessons = khtn7LessonsRaw.map(l => buildCompleteLesson(l, 7));
const khtn7Questions = khtn7LessonsRaw.flatMap(l => generateQuestionsForLesson(l, 7));
const khtn7Content = `// server/seed/khtn7Seed.js
// Dữ liệu chuẩn KHTN 7 - Bộ sách Kết nối tri thức với cuộc sống
export const KHTN7_CHAPTERS = ${JSON.stringify(khtn7Chapters, null, 2)};

export const KHTN7_LESSONS = ${JSON.stringify(khtn7Lessons, null, 2)};

export const KHTN7_QUESTIONS = ${JSON.stringify(khtn7Questions, null, 2)};
`;
fs.writeFileSync(path.join(SEED_DIR, 'khtn7Seed.js'), khtn7Content, 'utf-8');
console.log(`Saved KHTN 7 seed: ${khtn7Chapters.length} chapters, ${khtn7Lessons.length} lessons, ${khtn7Questions.length} questions.`);

// KHTN 8
const khtn8Lessons = khtn8LessonsRaw.map(l => buildCompleteLesson(l, 8));
const khtn8Questions = khtn8LessonsRaw.flatMap(l => generateQuestionsForLesson(l, 8));
const khtn8Content = `// server/seed/khtn8Seed.js
// Dữ liệu chuẩn KHTN 8 - Bộ sách Kết nối tri thức với cuộc sống
export const KHTN8_CHAPTERS = ${JSON.stringify(khtn8Chapters, null, 2)};

export const KHTN8_LESSONS = ${JSON.stringify(khtn8Lessons, null, 2)};

export const KHTN8_QUESTIONS = ${JSON.stringify(khtn8Questions, null, 2)};
`;
fs.writeFileSync(path.join(SEED_DIR, 'khtn8Seed.js'), khtn8Content, 'utf-8');
console.log(`Saved KHTN 8 seed: ${khtn8Chapters.length} chapters, ${khtn8Lessons.length} lessons, ${khtn8Questions.length} questions.`);

console.log('Finished generating seed files for KHTN 6, 7, 8 successfully!');

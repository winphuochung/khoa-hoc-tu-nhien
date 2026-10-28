import { LESSONS_PHYSICS_SEED } from './lessonsPhysicsSeed.js';
import { LESSONS_CHEMISTRY_SEED } from './lessonsChemistrySeed.js';
import { LESSONS_BIOLOGY_SEED } from './lessonsBiologySeed.js';

// Bộ ngữ cảnh khoa học thực nghiệm & thực tiễn chuyên biệt cho từng chủ đề (51 chủ đề KHTN 9).
// Tuyệt đối KHÔNG nhắc tới "Bài số mấy", "trong bài học", "theo SGK" mà đặt 100% câu hỏi
// vào bối cảnh thí nghiệm, hiện tượng tự nhiên, quy trình công nghệ, y sinh học có ý nghĩa khoa học.
const LESSON_SCIENTIFIC_CONTEXTS = {
  1: {
    exp1: 'Trong buổi thực hành tại phòng thí nghiệm Khoa học tự nhiên, một nhóm học sinh tiến hành lấy một lượng nhỏ dung dịch kiềm, đun nóng ống nghiệm bằng đèn cồn và ghi chép số liệu để lập báo cáo khoa học.',
    exp2: 'Một nhóm nghiên cứu học sinh chuẩn bị dụng cụ quang học (nguồn sáng laser, bản bán trụ, bảng chia độ) và dụng cụ đo thể tích chất lỏng để thực hiện đề tài thực nghiệm và thuyết trình kết quả trước hội đồng.',
    app1: 'Khi thiết kế quy trình thực hành an toàn với các hoá chất có tính ăn mòn và lập báo cáo thực nghiệm khoa học',
    app2: 'Khi phân loại dụng cụ đo thể tích chính xác trong phòng thí nghiệm và trình bày kết luận nghiên cứu khoa học',
  },
  2: {
    exp1: 'Một đoàn tàu lượn siêu tốc có khối lượng lớn đang chuyển động nhanh trên đường ray và một quả nặng được cần cẩu nâng lên độ cao xác định so với mặt đất tại công trường xây dựng.',
    exp2: 'Tại nhà máy thuỷ điện, khối nước khổng lồ tích trữ trong hồ chứa ở độ cao lớn so với tuabin được xả qua ống dẫn làm dòng nước chảy xiết vào cánh quạt máy phát điện.',
    app1: 'Khi khảo sát năng lượng cơ học của phương tiện giao thông đang chạy trên đường và vật nặng ở trên cao so với mốc tính độ cao',
    app2: 'Khi tính toán động năng của viên đạn đang bay và thế năng trọng trường của búa máy đóng cọc được nâng cao so với mặt đất',
  },
  3: {
    exp1: 'Một con lắc đơn gồm quả cầu kim loại treo vào sợi dây mảnh được kéo lệch khỏi vị trí cân bằng rồi thả nhẹ cho dao động qua lại trong không khí (khi bỏ qua sức cản).',
    exp2: 'Một vận động viên trượt ván bắt đầu trượt không vận tốc đầu từ đỉnh dốc của lòng máng hình chữ U xuống đáy lòng máng rồi lại vọt lên phía bên kia.',
    app1: 'Khi phân tích sự chuyển hoá qua lại giữa động năng và thế năng của quả bóng được ném thẳng đứng lên cao rồi rơi xuống đất',
    app2: 'Khi khảo sát định luật bảo toàn cơ năng của dòng thác nước đổ từ đỉnh đập thuỷ điện xuống chân đập',
  },
  4: {
    exp1: 'Tại một kho hàng, người công nhân dùng lực kéo không đổi để dịch chuyển kiện hàng dọc theo mặt sàn nằm ngang, trong khi một cần cẩu điện nâng kiện hàng tương tự lên tầng cao trong thời gian rất ngắn.',
    exp2: 'Hai máy bơm nước cùng đưa một thể tích nước như nhau từ bể ngầm lên bồn chứa trên sân thượng toà nhà cao tầng nhưng máy thứ nhất hoàn thành trong thời gian bằng một nửa máy thứ hai.',
    app1: 'Khi đánh giá công cơ học và tốc độ sinh công (công suất) của các động cơ điện và máy nâng trong xây dựng',
    app2: 'Khi tính toán công của lực kéo động cơ ô tô trên đoạn đường thẳng và công suất hoạt động của máy móc công nghiệp',
  },
  5: {
    exp1: 'Trong thí nghiệm quang học, học sinh chiếu một chùm tia sáng hẹp từ không khí truyền xiên góc tới mặt phân cách của một khối thuỷ tinh bán trụ trong suốt đặt trên bảng chia độ.',
    exp2: 'Khi cắm nghiêng một chiếc thước nhựa thẳng vào chậu nước trong suốt và quan sát từ phía trên mặt thoáng, người quan sát thấy phần thước ngập trong nước như bị gãy khúc tại mặt nước.',
    app1: 'Khi phân tích đường truyền của tia sáng truyền qua mặt phân cách giữa hai môi trường trong suốt có chiết suất khác nhau',
    app2: 'Khi vận dụng định luật khúc xạ ánh sáng để xác định góc khúc xạ và chiết suất tỉ đối của môi trường nước, thuỷ tinh so với không khí',
  },
  6: {
    exp1: 'Chiếu một tia sáng đơn sắc từ bên trong khối thuỷ tinh bán trụ ra ngoài không khí và tăng dần góc tới cho đến khi tia khúc xạ là là mặt phân cách rồi biến mất hoàn toàn, toàn bộ ánh sáng bị phản xạ ngược lại vào khối thuỷ tinh.',
    exp2: 'Trong công nghệ viễn thông hiện đại, các xung ánh sáng mang tín hiệu dữ liệu truyền đi hàng nghìn kilômét bên trong lõi sợi cáp quang mảnh mà hầu như không bị thất thoát ra lớp vỏ.',
    app1: 'Khi khảo sát điều kiện xảy ra hiện tượng phản xạ toàn phần và góc tới hạn tại mặt phân cách giữa hai môi trường trong suốt',
    app2: 'Khi giải thích nguyên lí truyền tín hiệu ánh sáng trong cáp quang viễn thông và nội soi y học bằng sợi quang học',
  },
  7: {
    exp1: 'Khi chiếu một chùm ánh sáng mặt trời hẹp đi qua khe hẹp tới mặt bên của một lăng kính thuỷ tinh đặt trong buồng tối, chùm tia ló ra khỏi mặt bên kia bị lệch về phía đáy và tách thành dải màu cầu vồng liên tục từ đỏ đến tím.',
    exp2: 'Chiếu lần lượt một tia sáng đơn sắc màu đỏ và một tia sáng đơn sắc màu tím qua cùng một lăng kính thuỷ tinh thì tia ló không bị đổi màu nhưng bị lệch về phía đáy lăng kính với góc lệch khác nhau.',
    app1: 'Khi nghiên cứu hiện tượng tán sắc ánh sáng trắng qua lăng kính và sự tạo thành cầu vồng sau cơn mưa trong tự nhiên',
    app2: 'Khi giải thích cơ chế tạo màu sắc của các vật thể dưới ánh sáng trắng do sự phản xạ và hấp thụ các ánh sáng màu',
  },
  8: {
    exp1: 'Trong phòng thực hành quang học, học sinh chiếu chùm tia sáng song song vuông góc với mặt một thấu kính có phần rìa mỏng hơn phần giữa và một thấu kính có phần rìa dày hơn phần giữa để quan sát chùm tia ló.',
    exp2: 'Đặt một ngọn nến đang cháy sáng trước một thấu kính hội tụ ở các khoảng cách khác nhau so với tiêu cự và di chuyển màn chắn phía sau để hứng ảnh thật hoặc quan sát ảnh ảo.',
    app1: 'Khi phân tích đường truyền của các tia sáng đặc biệt qua quang tâm, trục chính của thấu kính hội tụ và thấu kính phân kì',
    app2: 'Khi xác định tính chất ảnh (thật/ảo, cùng chiều/ngược chiều, lớn hơn/nhỏ hơn vật) tạo bởi thấu kính hội tụ và thấu kính phân kì',
  },
  9: {
    exp1: 'Một nhóm học sinh lắp đặt bộ thí nghiệm trên giá quang học gồm nguồn sáng, vật sáng hình chữ F, thấu kính hội tụ và màn chắn ảnh theo phương pháp đối xứng (d = d\' = 2f) để xác định tiêu cự của thấu kính.',
    exp2: 'Trong giờ thực hành đo tiêu cự thấu kính hội tụ, học sinh điều chỉnh khoảng cách từ vật sáng và màn ảnh tới thấu kính sao cho trên màn thu được ảnh rõ nét, ngược chiều và có chiều cao bằng đúng chiều cao của vật.',
    app1: 'Khi tiến hành phép đo thực nghiệm xác định tiêu cự của thấu kính hội tụ và xử lí sai số từ bảng số liệu đo khoảng cách',
    app2: 'Khi kiểm tra điều kiện thu được ảnh thật rõ nét và kích thước bằng vật trên màn chắn trong thí nghiệm quang học',
  },
  10: {
    exp1: 'Một người thợ sửa đồng hồ sử dụng một kính lúp có ghi ký hiệu 5x trên vành kính để quan sát các bánh răng rất nhỏ đặt trong khoảng tiêu cự của kính.',
    exp2: 'Trong giờ thực hành Sinh học, học sinh dùng kính lúp cầm tay có tiêu cự ngắn đặt gần mẫu vật côn trùng và lá cây để quan sát rõ các chi tiết nhỏ qua ảnh ảo phóng đại.',
    app1: 'Khi sử dụng kính lúp để quan sát các vật nhỏ và vận dụng tỉ số đồng dạng hình học giải bài toán tạo ảnh qua thấu kính',
    app2: 'Khi tính toán khoảng cách đặt vật, vị trí ảnh và chiều cao ảnh tạo bởi thấu kính hội tụ trong các dụng cụ quang học',
  },
  11: {
    exp1: 'Trong thí nghiệm khảo sát mạch điện một chiều, học sinh mắc một đoạn dây dẫn kim loại vào nguồn điện có hiệu điện thế điều chỉnh được, dùng vôn kế đo hiệu điện thế hai đầu dây và ampe kế đo cường độ dòng điện chạy qua dây.',
    exp2: 'Khi thiết kế dây đốt nóng cho bếp điện và đường dây tải điện dân dụng, kĩ sư điện tiến hành đo điện trở của các dây dẫn có chiều dài, tiết diện và vật liệu làm dây (đồng, nichrome) khác nhau.',
    app1: 'Khi khảo sát sự phụ thuộc của cường độ dòng điện vào hiệu điện thế (Định luật Ohm) và các yếu tố cấu tạo ảnh hưởng đến điện trở dây dẫn',
    app2: 'Khi tính toán cường độ dòng điện, hiệu điện thế và điện trở của dây dẫn kim loại theo công thức định luật Ohm và công thức điện trở suất',
  },
  12: {
    exp1: 'Một học sinh lắp mạch điện gồm hai bóng đèn điện trở R₁ và R₂ mắc nối tiếp nhau vào nguồn điện một chiều, sau đó mắc thêm ampe kế và vôn kế để kiểm tra cường độ dòng điện và hiệu điện thế trên từng đèn.',
    exp2: 'Trong mạng điện gia đình, các thiết bị như bóng đèn chiếu sáng, quạt điện và tủ lạnh đều được mắc song song vào hai dây nguồn 220 V để mỗi thiết bị có thể bật tắt độc lập.',
    app1: 'Khi phân tích đặc điểm cường độ dòng điện, hiệu điện thế và điện trở tương đương của đoạn mạch mắc nối tiếp và đoạn mạch mắc song song',
    app2: 'Khi giải bài toán tính điện trở tương đương và cường độ dòng điện qua từng nhánh trong mạch điện hỗn hợp',
  },
  13: {
    exp1: 'Trên nhãn kỹ thuật của một ấm đun nước siêu tốc dùng trong gia đình có ghi thông số định mức "220 V – 1 500 W", thiết bị được cắm vào ổ điện đúng hiệu điện thế 220 V để đun sôi nước mỗi ngày.',
    exp2: 'Cuối mỗi tháng, nhân viên điện lực ghi chỉ số công tơ điện của một hộ gia đình để xác định lượng điện năng tiêu thụ (tính bằng kWh) của toàn bộ các thiết bị điện trong nhà.',
    app1: 'Khi xác định công suất tiêu thụ điện, năng lượng dòng điện (điện năng) và số tiền điện phải trả thông qua chỉ số công tơ điện',
    app2: 'Khi vận dụng các công thức công suất điện (P = U·I) và năng lượng điện (W = P·t) để kiểm tra mức tiêu thụ điện của đồ gia dụng',
  },
  14: {
    exp1: 'Trong thí nghiệm về cảm ứng điện từ, học sinh đưa một thanh nam châm vĩnh cửu dịch chuyển lại gần hoặc ra xa một cuộn dây dẫn kín nối với hai đèn LED mắc song song ngược chiều và quan sát sự phát sáng của đèn.',
    exp2: 'Tại các nhà máy phát điện, rôto là một nam châm điện lớn quay liên tục bên trong các cuộn dây đứng yên (stato), làm số đường sức từ xuyên qua tiết diện cuộn dây biến thiên tuần hoàn.',
    app1: 'Khi khảo sát hiện tượng cảm ứng điện từ, điều kiện xuất hiện dòng điện cảm ứng và nguyên tắc cấu tạo máy phát điện xoay chiều',
    app2: 'Khi phân tích sự biến thiên số đường sức từ xuyên qua tiết diện cuộn dây dẫn kín làm đổi chiều dòng điện cảm ứng',
  },
  15: {
    exp1: 'Khi cho dòng điện xoay chiều chạy qua các thiết bị khác nhau như bóng đèn sợi đốt, quạt điện, nam châm điện nâng sắt thép và bình điện phân, người ta ghi nhận được nhiều tác dụng vật lí và sinh lí khác nhau.',
    exp2: 'Tại công trường xây dựng có sử dụng mạng điện xoay chiều 220 V, công nhân kỹ thuật kiểm tra thiết bị đóng cắt tự động (aptomat) và dây nối đất an toàn cho vỏ kim loại của máy móc.',
    app1: 'Khi khảo sát các tác dụng nhiệt, quang, từ, sinh lí của dòng điện xoay chiều và tuân thủ các quy tắc an toàn điện trong sinh hoạt',
    app2: 'Khi phân biệt tác dụng của dòng điện xoay chiều với dòng điện một chiều và xử lí tình huống phòng tránh tai nạn điện giật',
  },
  16: {
    exp1: 'Bức xạ mặt trời chiếu xuống bề mặt Trái Đất làm nóng bầu khí quyển, làm bay hơi nước tạo thành vòng tuần hoàn nước và cung cấp năng lượng cho thực vật quang hợp tạo chất hữu cơ qua hàng triệu năm.',
    exp2: 'Tại các nhà máy nhiệt điện chạy bằng than đá và dầu mỏ, quá trình đốt cháy nhiên liệu hoá thạch cung cấp nhiệt lượng lớn nhưng đồng thời thải ra bầu khí quyển lượng lớn khí carbon dioxide (CO₂) và khí độc.',
    app1: 'Khi phân tích sự chuyển hoá năng lượng trong vòng năng lượng trên Trái Đất và các hệ luỵ môi trường từ việc khai thác nhiên liệu hoá thạch',
    app2: 'Khi đánh giá nguồn gốc năng lượng từ Mặt Trời và tác động phát thải khí nhà kính của quá trình đốt than đá, dầu mỏ, khí thiên nhiên',
  },
  17: {
    exp1: 'Tại khu vực duyên hải Nam Trung Bộ và Tây Nguyên, các trang trại điện mặt trời sử dụng tấm pin quang điện (solar panel) và các trụ tuabin điện gió khổng lồ được lắp đặt để hoà lưới điện quốc gia.',
    exp2: 'Một trang trại chăn nuôi quy mô lớn xây dựng hầm ủ khí sinh học (biogas) để xử lí chất thải hữu cơ tạo nguồn khí đốt sạch, kết hợp lắp đặt bình nước nóng năng lượng mặt trời trên mái trại.',
    app1: 'Khi đánh giá ưu điểm, hạn chế và giải pháp khai thác các nguồn năng lượng tái tạo (năng lượng mặt trời, gió, thuỷ triều, địa nhiệt, sinh khối)',
    app2: 'Khi lựa chọn công nghệ chuyển hoá năng lượng sạch nhằm giảm sự phụ thuộc vào nhiên liệu hoá thạch và bảo vệ môi trường bền vững',
  },
  18: {
    exp1: 'Trong phòng thí nghiệm Hoá học, học sinh tiến hành đốt nóng dây sắt trong bình chứa khí oxygen, cho viên kẽm vào ống nghiệm đựng dung dịch hydrochloric acid (HCl) loãng và nhúng dây đồng vào dung dịch silver nitrate (AgNO₃).',
    exp2: 'Trong kĩ thuật điện và chế tác cơ khí, đồng và nhôm được kéo thành sợi dây dẫn điện mảnh, vàng và bạc được dát mỏng làm đồ trang sức, còn воlfram (W) được dùng làm dây tóc bóng đèn chịu nhiệt độ rất cao.',
    app1: 'Khi khảo sát các tính chất vật lí chung (tính dẻo, dẫn điện, dẫn nhiệt, ánh kim) và tính chất hoá học đặc trưng của kim loại',
    app2: 'Khi viết phương trình hoá học của kim loại tác dụng với phi kim, nước, dung dịch acid và dung dịch muối trong thực nghiệm',
  },
  19: {
    exp1: 'Học sinh tiến hành thí nghiệm cho ba mẩu kim loại Mg, Fe, Cu có kích thước tương đương vào ba ống nghiệm đựng dung dịch HCl loãng, đồng thời nhúng đinh sắt sạch vào dung dịch CuSO₄ màu xanh lam.',
    exp2: 'Để bảo vệ phần vỏ tàu biển bằng thép (chứa sắt) ngâm thường xuyên trong nước biển khỏi bị ăn mòn điện hoá, các kĩ sư đóng tàu gắn các khối kẽm (Zn) vào phía ngoài vỏ tàu làm "cực hi sinh".',
    app1: 'Khi vận dụng dãy hoạt động hoá học của kim loại (K, Na, Ca, Mg, Al, Zn, Fe, Pb, H, Cu, Ag, Au) để dự đoán chiều phản ứng hoá học',
    app2: 'Khi so sánh mức độ hoạt động hoá học giữa các kim loại qua hiện tượng đẩy kim loại yếu hơn ra khỏi dung dịch muối và giải phóng khí H₂ từ acid',
  },
  20: {
    exp1: 'Tại nhà máy luyện kim, quặng bauxite giàu aluminium oxide (Al₂O₃) được đưa vào bể điện phân nóng chảy có mặt cryolite để thu nhôm, trong khi quặng hematite (chứa Fe₂O₃) được khử bằng khí CO ở nhiệt độ cao trong lò cao để luyện gang thép.',
    exp2: 'Trong ngành hàng không và y tế, người ta sử dụng hợp kim duralumin (nhôm – đồng – magnesium) làm vỏ máy bay và thép không gỉ (inox chứa sắt, chromium, nickel) làm dụng cụ phẫu thuật thay vì dùng kim loại nguyên chất.',
    app1: 'Khi lựa chọn phương pháp tách kim loại (điện phân nóng chảy, nhiệt luyện, thuỷ luyện) phù hợp với mức độ hoạt động hoá học và ứng dụng hợp kim',
    app2: 'Khi giải thích ưu tính cơ học, độ cứng và khả năng chống ăn mòn vượt trội của hợp kim (gang, thép, duralumin) so với kim loại tinh khiết',
  },
  21: {
    exp1: 'Trong phòng thí nghiệm, học sinh so sánh trạng thái, tính dẫn điện của mẫu than chì (carbon), bột lưu huỳnh (sulfur), khí chlorine và đốt cháy lần lượt bột magnesium (kim loại) cùng bột lưu huỳnh (phi kim) trong khí oxygen dư rồi thử sản phẩm với nước và giấy quỳ tím.',
    exp2: 'Trong công nghiệp sản xuất vật liệu và xử lí nước, lưu huỳnh được dùng để lưu hoá cao su làm lốp xe, khí chlorine được dùng khử trùng nước sinh hoạt, còn than hoạt tính được dùng trong mặt nạ phòng độc và máy lọc nước.',
    app1: 'Khi phân biệt sự khác nhau cơ bản về tính chất vật lí và tính chất hoá học (bản chất oxide acid / oxide base) giữa phi kim và kim loại',
    app2: 'Khi khảo sát ứng dụng thực tiễn của các đơn chất phi kim quan trọng (carbon, lưu huỳnh, chlorine) và bài toán đốt cháy kim loại – phi kim',
  },
  22: {
    exp1: 'Khi phân tích thành phần nguyên tố của hàng loạt mẫu vật liệu lấy từ cơ thể sống và đời sống như bông nõn (cellulose), đường mía (saccharose), cồn y tế (ethylic alcohol) và khí gas (propane, butane), các nhà hoá học đều phát hiện sự có mặt bắt buộc của nguyên tố carbon.',
    exp2: 'Trong phòng thí nghiệm Hoá hữu cơ, học sinh quan sát mô hình phân tử rỗng và đặc của các chất có cùng công thức phân tử C₂H₆O nhưng có thứ tự liên kết giữa các nguyên tử khác nhau là CH₃–CH₂–OH và CH₃–O–CH₃.',
    app1: 'Khi phân loại hợp chất hữu cơ (hydrocarbon và dẫn xuất của hydrocarbon) dựa vào thành phần nguyên tố và viết công thức cấu tạo',
    app2: 'Khi xác định hoá trị, khả năng liên kết mạch carbon (mạch hở thẳng, mạch nhánh, mạch vòng) trong các phân tử hợp chất hữu cơ',
  },
  23: {
    exp1: 'Tại các mỏ khí thiên nhiên và hầm ủ biogas gia đình, thành phần khí cháy chủ yếu là methane (CH₄); còn trong bình gas đun nấu dân dụng là hỗn hợp khí propane (C₃H₈) và butane (C₄H₁₀) được nén hoá lỏng.',
    exp2: 'Trong phòng thí nghiệm, học sinh đốt cháy khí methane (CH₄) ở đầu ống dẫn khí rồi úp một ống nghiệm khô lên trên ngọn lửa thấy có các giọt nước nhỏ đọng lại, sau đó rót nước vôi trong Ca(OH)₂ vào ống nghiệm thì thấy nước vôi trong bị vẩn đục.',
    app1: 'Khi khảo sát cấu tạo phân tử chỉ chứa liên kết đơn (C–C, C–H), công thức chung CₙH₂ₙ₊₂ và phản ứng cháy toả nhiệt của các alkane',
    app2: 'Khi tính toán thể tích khí oxygen cần dùng và lượng khí CO₂, H₂O sinh ra trong phản ứng đốt cháy hoàn toàn các hydrocarbon no (alkane)',
  },
  24: {
    exp1: 'Trong phòng thí nghiệm, học sinh dẫn từ từ dòng khí ethylene (CH₂=CH₂) sục qua ống nghiệm đựng dung dịch nước bromine (Br₂) màu da cam thì quan sát thấy màu da cam của dung dịch nhạt dần rồi mất màu hoàn toàn, không có khí thoát ra.',
    exp2: 'Trong công nghiệp hoá chất và nông nghiệp, khí ethylene (C₂H₄) được dùng làm nguyên liệu trùng hợp sản xuất nhựa polyethylene (PE) và được sử dụng ở nồng độ thích hợp để kích thích quả xanh mau chín đều.',
    app1: 'Khi khảo sát đặc điểm liên kết đôi C=C trong phân tử alkene (ethylene), phản ứng cộng nước bromine và phản ứng trùng hợp tạo polymer',
    app2: 'Khi nhận biết khí ethylene với khí methane bằng dung dịch nước bromine và tính toán hiệu suất phản ứng cộng / phản ứng cháy của alkene',
  },
  25: {
    exp1: 'Tại nhà máy lọc – hoá dầu Dung Quất, dầu mỏ khai thác từ thềm lục địa được đưa vào tháp chưng cất phân đoạn ở các mức nhiệt độ sôi khác nhau để tách thành khí đốt hoá lỏng (LPG), xăng, dầu hoả, dầu diesel, dầu mazut và nhựa đường.',
    exp2: 'Trong quá trình sử dụng bếp gas, bếp than và vận hành động cơ xăng dầu, việc cung cấp đủ không khí (oxygen) giúp nhiên liệu cháy hoàn toàn, hạn chế phát sinh khí độc carbon monoxide (CO) và muội than.',
    app1: 'Khi phân tích thành phần, phương pháp chế biến dầu mỏ, khí thiên nhiên và các biện pháp sử dụng nhiên liệu an toàn, tiết kiệm, hiệu quả',
    app2: 'Khi giải thích nguyên tắc dập tắt đám cháy xăng dầu bằng bình chữa cháy bột/khí CO₂ hoặc cát thay vì phun nước trực tiếp',
  },
  26: {
    exp1: 'Trong phòng thí nghiệm, học sinh cho một mẩu kim loại sodium (Na) bằng hạt đậu xanh vào ống nghiệm chứa ethylic alcohol (C₂H₅OH) khan, quan sát thấy mẩu sodium tan dần và có bọt khí không màu thoát ra đều đặn.',
    exp2: 'Tại các cơ sở sản xuất nhiên liệu sinh học và y tế, tinh bột từ sắn, ngô được lên men tạo ra ethylic alcohol để pha chế cồn sát khuẩn y tế 70° và phối trộn với xăng truyền thống tạo xăng sinh học E5 (chứa 5% thể tích cồn khan).',
    app1: 'Khi khảo sát cấu tạo nhóm chức –OH, độ cồn, tính chất hoá học của ethylic alcohol (phản ứng cháy, phản ứng với Na) và ứng dụng thực tiễn',
    app2: 'Khi tính toán thể tích cồn nguyên chất từ độ rượu, lượng khí H₂ thoát ra khi tác dụng với Na và tác hại của việc lạm dụng rượu bia',
  },
  27: {
    exp1: 'Một học sinh lấy ba ống nghiệm đựng dung dịch acetic acid (CH₃COOH) loãng: ống 1 nhỏ vài giọt quỳ tím, ống 2 thả một viên kẽm (Zn), ống 3 cho một ít bột đá vôi (CaCO₃) và quan sát sự đổi màu cùng bọt khí thoát ra.',
    exp2: 'Trong phòng thí nghiệm, người ta đun nóng hỗn hợp gồm ethylic alcohol, acetic acid nguyên chất và vài giọt dung dịch H₂SO₄ đặc làm xúc tác trong ống nghiệm, sau một thời gian thu được chất lỏng nhẹ hơn nước, có mùi thơm đặc trưng của hoa quả chín.',
    app1: 'Khi khảo sát cấu tạo nhóm chức –COOH, tính acid yếu đầy đủ của acetic acid, phản ứng ester hoá tạo ethyl acetate và sản xuất giấm ăn',
    app2: 'Khi giải bài toán trung hoà dung dịch acetic acid bằng kiềm, tính hiệu suất phản ứng ester hoá và điều chế acetic acid bằng lên men giấm',
  },
  28: {
    exp1: 'Khi cho vài giọt dầu thực vật và một mẩu mỡ động vật vào hai ống nghiệm đựng nước rồi lắc mạnh, cả hai đều không tan mà nổi lên trên mặt nước; nhưng khi cho vào ống nghiệm đựng xăng hoặc dầu hoả thì chúng tan hoàn toàn.',
    exp2: 'Trong công nghiệp sản xuất chất giặt rửa, người ta đun nóng chất béo (triglyceride từ dầu dừa, dầu cọ hoặc mỡ động vật) với dung dịch kiềm sodium hydroxide (NaOH) đặc để thu được glycerol và muối sodium của các acid béo (xà phòng).',
    app1: 'Khi khảo sát bản chất cấu tạo ester của glycerol với các acid béo (lipid), phản ứng xà phòng hoá và vai trò sinh học của chất béo',
    app2: 'Khi phân biệt dầu thực vật với mỡ động vật, giải thích cơ chế làm sạch vết dầu mỡ và đề xuất chế độ dinh dưỡng phòng tránh béo phì, xơ vữa động mạch',
  },
  29: {
    exp1: 'Trong phòng thí nghiệm, học sinh cho dung dịch glucose (C₆H₁₂O₆) vào ống nghiệm chứa dung dịch silver nitrate (AgNO₃) trong ammonia dư rồi ngâm vào cốc nước nóng, sau vài phút thấy một lớp bạc sáng bóng như gương bám trên thành ống nghiệm.',
    exp2: 'Tại nhà máy sản xuất đường và thực phẩm, nước ép từ cây mía hoặc củ cải đường được tinh chế để kết tinh đường saccharose (C₁₂H₂₂O₁₁), một phần saccharose được đun nóng với xúc tác acid để thuỷ phân thành glucose và fructose làm bánh kẹo.',
    app1: 'Khi khảo sát tính chất vật lí, phản ứng tráng bạc, phản ứng lên men rượu của glucose và phản ứng thuỷ phân của saccharose',
    app2: 'Khi nhận biết hai dung dịch mất nhãn glucose và saccharose bằng phản ứng tráng bạc và tính toán khối lượng bạc kết tủa hoặc lượng rượu thu được',
  },
  30: {
    exp1: 'Trong giờ thực hành Hoá – Sinh, học sinh nhỏ vài giọt dung dịch iodine (I₂) màu vàng nâu lên mặt cắt củ khoai lang sống (hoặc hồ tinh bột để nguội) thì thấy xuất hiện màu xanh tím đặc trưng; khi đun nóng màu xanh tím biến mất và khi để nguội lại hiện ra.',
    exp2: 'Trong tự nhiên, cây xanh hấp thụ khí CO₂ và nước dưới tác dụng của ánh sáng mặt trời và chất diệp lục để tổng hợp nên tinh bột dự trữ trong hạt, củ và tạo sợi cellulose cấu thành vách tế bào thực vật bền chắc.',
    app1: 'Khi khảo sát cấu tạo polymer thiên nhiên, phản ứng thuỷ phân của tinh bột và cellulose, phản ứng màu của hồ tinh bột với iodine',
    app2: 'Khi giải thích quá trình tiêu hoá tinh bột trong cơ thể người nhờ enzyme amylase và ứng dụng cellulose trong sản xuất giấy, sợi bông, tơ nhân tạo',
  },
  31: {
    exp1: 'Khi đun nóng ống nghiệm đựng dung dịch lòng trắng trứng (albumin) hoặc nhỏ vài giọt dung dịch acid vào sữa tươi, học sinh quan sát thấy các khối kết tủa trắng đông tụ tách ra khỏi dung dịch; khi đốt một sợi tóc hoặc sợi len lông cừu thì thấy có mùi khét đặc trưng.',
    exp2: 'Trong hệ tiêu hoá của con người, các loại thực phẩm giàu protein như thịt, cá, trứng, sữa dưới tác dụng của các enzyme tiêu hoá (pepsin, trypsin) bị thuỷ phân từng bước qua các chuỗi polypeptide để tạo thành các α-amino acid hấp thụ vào máu.',
    app1: 'Khi khảo sát cấu tạo từ các đơn phân α-amino acid qua liên kết peptide, hiện tượng đông tụ, phản ứng thuỷ phân và sự phân huỷ nhiệt của protein',
    app2: 'Khi phân biệt vải dệt từ tơ tằm/lông cừu (chứa protein) với vải sợi bông (cellulose) bằng cách đốt và giải thích vai trò của protein đối với cơ thể sống',
  },
  32: {
    exp1: 'Tại phòng kiểm định vật liệu, các kĩ sư khảo sát tính chất cơ lí của các mẫu vật liệu polymer gồm ống nhựa PVC, túi màng mỏng PE (chất dẻo), sợi nylon-6,6 (tơ tổng hợp) và lốp xe lưu hoá (cao su).',
    exp2: 'Trước thực trạng rác thải nhựa dùng một lần (như túi PE, hộp xốp PS) rất bền với môi trường và mất hàng trăm năm mới phân huỷ tự nhiên, các nhà khoa học khuyến nghị áp dụng nguyên tắc 3R (Tiết giảm – Tái sử dụng – Tái chế) và phát triển nhựa phân huỷ sinh học.',
    app1: 'Khi phân tích khái niệm polymer, mắt xích, hệ số trùng hợp, phân loại polymer thiên nhiên/tổng hợp và tính chất của chất dẻo, tơ, cao su',
    app2: 'Khi viết phương trình trùng hợp tạo polyethylene (PE), polypropylene (PP) và đề xuất giải pháp khoa học giảm thiểu ô nhiễm rác thải nhựa ("ô nhiễm trắng")',
  },
  33: {
    exp1: 'Khi phân tích các mẫu khoáng vật và đá thu thập từ lớp vỏ Trái Đất, các nhà địa hoá học xác định hai nguyên tố chiếm tỉ lệ khối lượng lớn nhất là oxygen (~46,6%) và silicon (~27,7%), tồn tại chủ yếu dưới dạng các hợp chất oxide, muối silicate và muối carbonate.',
    exp2: 'Tại các mỏ khoáng sản ở Việt Nam như mỏ bauxite (Tây Nguyên), mỏ hematite (Thái Nguyên, Hà Tĩnh) và mỏ đá vôi, hoạt động khai thác quặng cung cấp nguồn nguyên liệu thiết yếu cho ngành luyện kim, xây dựng và sản xuất phân bón.',
    app1: 'Khi khảo sát thành phần các nguyên tố hoá học trong vỏ Trái Đất, các dạng khoáng vật quặng chính và lợi ích kinh tế của việc khai thác tài nguyên',
    app2: 'Khi đánh giá tác động môi trường của hoạt động khai thác khoáng sản và đề xuất giải pháp khai thác hợp lí, tiết kiệm gắn với bảo vệ tài nguyên',
  },
  34: {
    exp1: 'Tại các lò nung vôi công nghiệp, đá vôi (thành phần chính là CaCO₃) được nung ở nhiệt độ khoảng 900 – 1 000 °C tạo ra vôi sống (CaO) và khí CO₂; trong khi tại nhà máy xi măng và thuỷ tinh, đá vôi, đất sét và cát trắng (SiO₂) được nghiền mịn và nung chảy ở nhiệt độ cao.',
    exp2: 'Trong phòng thí nghiệm, học sinh nhỏ vài giọt dung dịch hydrochloric acid (HCl) lên bề mặt một mẫu đá vôi trắng thì thấy sủi bọt khí không màu mạnh mẽ, khí này dẫn qua nước vôi trong dư lại tạo kết tủa trắng CaCO₃.',
    app1: 'Khi khảo sát thành phần, tính chất hoá học của đá vôi (CaCO₃), quy trình nung vôi và công nghệ sản xuất xi măng, thuỷ tinh, đồ gốm trong công nghiệp silicate',
    app2: 'Khi giải thích hiện tượng xâm thực đá vôi tạo hang động thạch nhũ trong tự nhiên và tính toán khối lượng vôi sống thu được theo hiệu suất nung vôi',
  },
  35: {
    exp1: 'Qua các trạm quan trắc khí quyển toàn cầu, các nhà khí hậu học ghi nhận nồng độ khí carbon dioxide (CO₂) và khí methane (CH₄) trong khí quyển tăng nhanh kể từ cuộc cách mạng công nghiệp do việc khai thác và đốt cháy một lượng khổng lồ than đá, dầu mỏ, khí thiên nhiên.',
    exp2: 'Trong chu trình carbon của sinh quyển, nguyên tố carbon liên tục luân chuyển giữa khí quyển (dạng CO₂), sinh vật sản xuất – tiêu thụ – phân giải, đại dương (dạng muối hòa tan và trầm tích carbonate) và lớp vỏ Trái Đất.',
    app1: 'Khi phân tích chu trình carbon trong tự nhiên, nguyên nhân làm gia tăng hiệu ứng nhà kính và hậu quả của sự ấm lên toàn cầu, biến đổi khí hậu',
    app2: 'Khi đề xuất các giải pháp khoa học giảm phát thải khí nhà kính (trồng rừng, chuyển đổi năng lượng tái tạo, tiết kiệm năng lượng) hướng tới phát thải ròng bằng 0 (Net Zero)',
  },
  36: {
    exp1: 'Khi khảo sát sự truyền đạt các đặc điểm hình thái (như màu mắt, nhóm máu, dạng tóc ở người; màu hoa, chiều cao thân ở thực vật) qua các thế hệ gia đình và dòng giống, các nhà di truyền học ghi nhận cả sự giống nhau và sự xuất hiện những đặc điểm mới.',
    exp2: 'Tại phòng thí nghiệm Di truyền học phân tử, các nhà khoa học phân tích hệ gene của các chủng vi sinh vật và cây trồng để xác định cách thức thông tin di truyền được lưu giữ, truyền đạt và biến đổi tạo nên tính đa dạng sinh học.',
    app1: 'Khi phân tích khái niệm di truyền, biến dị, các thuật ngữ cơ bản (tính trạng, nhân tố di truyền/gene, kiểu gene, kiểu hình) và vai trò trung tâm của gene',
    app2: 'Khi giải thích mối quan hệ biện chứng giữa hiện tượng di truyền và biến dị thông qua sự bảo toàn và đột biến của phân tử gene',
  },
  37: {
    exp1: 'Trong thí nghiệm kinh điển trên cây đậu Hà Lan (Pisum sativum) có hoa lưỡng tính tự thụ phấn nghiêm ngặt, Gregor Mendel tiến hành lai các dòng thuần chủng khác nhau về một cặp tính trạng (hoa tím × hoa trắng) và hai cặp tính trạng tương phản (hạt vàng, vỏ trơn × hạt xanh, vỏ nhăn).',
    exp2: 'Tại một trại giống cây trồng, để kiểm tra một cây đậu Hà Lan có kiểu hình hạt vàng (tính trạng trội) là thuần chủng (AA) hay không thuần chủng (Aa), cán bộ kĩ thuật tiến hành phép lai phân tích bằng cách cho cây đó lai với cây hạt xanh (aa).',
    app1: 'Khi vận dụng quy luật phân li và quy luật phân li độc lập của Mendel để xác định tỉ lệ kiểu gene, tỉ lệ kiểu hình ở đời con F₁, F₂',
    app2: 'Khi giải thích cơ sở tế bào học của các quy luật Mendel và sử dụng phép lai phân tích để kiểm tra độ thuần chủng của giống trong nông nghiệp',
  },
  38: {
    exp1: 'Khi phân tích cấu trúc không gian của phân tử DNA tách chiết từ nhân tế bào theo mô hình của Watson và Crick, các nhà khoa học xác định DNA là một chuỗi xoắn kép gồm hai mạch polynucleotide song song, ngược chiều, liên kết với nhau bằng các liên kết hydrogen theo nguyên tắc bổ sung (A – T, G – C).',
    exp2: 'Trong tế bào sinh vật nhân thực, ngoài phân tử DNA mạch kép lưu giữ thông tin di truyền trong nhân, các nhà sinh học phân tử còn tách chiết được ba loại phân tử RNA mạch đơn (mRNA, tRNA, rRNA) tham gia trực tiếp vào quá trình tổng hợp protein.',
    app1: 'Khi phân tích cấu tạo hoá học từ các đơn phân nucleotide (A, T, G, C / A, U, G, C), cấu trúc không gian và chức năng của DNA, RNA và gene',
    app2: 'Khi vận dụng nguyên tắc bổ sung trong phân tử DNA mạch kép (A = T, G = C, N = 2A + 2G) để giải bài toán tính số lượng nucleotide và chiều dài gene',
  },
  39: {
    exp1: 'Trong pha S của kì trung gian trước khi tế bào bước vào phân chia, phân tử DNA mẹ trong nhân tế bào tháo xoắn và sử dụng các nucleotide tự do của môi trường nội bào để tổng hợp nên hai phân tử DNA con giống hệt nhau và giống DNA mẹ.',
    exp2: 'Khi tế bào cần tổng hợp một loại enzyme đặc hiệu, một đoạn mạch khuôn của gene trên DNA tháo xoắn để enzyme RNA polymerase trượt dọc theo mạch khuôn tổng hợp nên phân tử mRNA trưởng thành đi ra tế bào chất.',
    app1: 'Khi phân tích diễn biến, nguyên tắc bổ sung, nguyên tắc bán bảo toàn của quá trình tái bản DNA và cơ chế phiên mã tổng hợp RNA từ mạch khuôn của gene',
    app2: 'Khi xác định trình tự nucleotide của mạch DNA bổ sung và mạch mRNA được phiên mã từ một đoạn mạch khuôn của gene cấu trúc',
  },
  40: {
    exp1: 'Trong tế bào chất, các bào quan ribosome trượt dọc theo phân tử mRNA theo từng bộ ba mã sao (codon), đồng thời các phân tử tRNA mang đúng loại amino acid có bộ ba đối mã (anticodon) khớp bổ sung tới lắp ghép thành chuỗi polypeptide.',
    exp2: 'Khi nghiên cứu bệnh thiếu máu hồng cầu hình liềm hay bệnh bạch tạng ở người, các nhà y sinh học chứng minh rằng một trình tự nucleotide xác định trên gene quy định trình tự ribonucleotide trên mRNA, từ đó quy định trình tự amino acid của phân tử protein biểu hiện thành tính trạng.',
    app1: 'Khi phân tích đặc điểm của mã di truyền (mã bộ ba), diễn biến quá trình dịch mã tại ribosome và sơ đồ cơ chế truyền thông tin di truyền (Gene → mRNA → Protein → Tính trạng)',
    app2: 'Khi giải bài toán xác định trình tự amino acid được dịch mã từ phân tử mRNA và giải thích bản chất mối quan hệ giữa gene và tính trạng',
  },
  41: {
    exp1: 'Khi xử lí hạt giống lúa nảy mầm bằng tia phóng xạ gamma hoặc hoá chất gây đột biến (như EMS), các nhà chọn giống phát hiện một số cây lúa có sự thay đổi một cặp nucleotide trong gene (mất, thêm hoặc thay thế một cặp nucleotide) dẫn đến giống lúa mới thấp cây, cứng rạ, năng suất cao.',
    exp2: 'Trong y học di truyền, phân tích gene β-globin của bệnh nhân thiếu máu hồng cầu hình liềm cho thấy có sự thay thế một cặp nucleotide A – T bằng T – A làm thay đổi một amino acid trên chuỗi polypeptide của hemoglobin.',
    app1: 'Khi phân tích khái niệm, các dạng đột biến điểm (mất, thêm, thay thế một cặp nucleotide), nguyên nhân phát sinh và vai trò/tác hại của đột biến gene',
    app2: 'Khi đánh giá mức độ biến đổi cấu trúc chuỗi polypeptide do từng dạng đột biến điểm gây ra và ứng dụng gây đột biến nhân tạo trong chọn giống',
  },
  42: {
    exp1: 'Dưới kính hiển vi quang học ở độ phóng đại lớn, khi quan sát tiêu bản tế bào rễ hành đang phân chia vào kì giữa, học sinh nhận thấy các nhiễm sắc thể co xoắn cực đại, mỗi nhiễm sắc thể kép gồm hai chromatid chị em dính nhau ở tâm động và có hình dạng đặc trưng.',
    exp2: 'Khi lập bộ nhiễm sắc thể (karyotype) tế bào sinh dưỡng (2n) và tế bào giao tử (n) của các loài sinh vật khác nhau như người (2n = 46), ruồi giấm (2n = 8), đậu Hà Lan (2n = 14), các nhà tế bào học ghi nhận tính đặc trưng về số lượng và hình thái NST của mỗi loài.',
    app1: 'Khi khảo sát cấu trúc siêu hiển vi của nhiễm sắc thể (DNA và protein histone), hình thái NST qua các kì phân bào và phân biệt bộ NST lưỡng bội (2n) với đơn bội (n)',
    app2: 'Khi xác định số lượng nhiễm sắc thể trong tế bào sinh dưỡng và tế bào giao tử của loài cũng như vai trò của NST trong việc bảo quản thông tin di truyền',
  },
  43: {
    exp1: 'Khi một con thằn lằn bị đứt đuôi hoặc khi mô phân sinh đỉnh rễ cây hành phát triển, các tế bào sinh dưỡng liên tục thực hiện quá trình nguyên phân để tạo ra các tế bào mới có bộ nhiễm sắc thể 2n giống hệt tế bào mẹ ban đầu, giúp tái sinh mô và lớn lên.',
    exp2: 'Tại cơ quan sinh sản của cơ thể trưởng thành, các tế bào sinh giao tử (2n) trải qua hai lần phân bào liên tiếp của quá trình giảm phân nhưng NST chỉ nhân đôi một lần, tạo ra các giao tử đơn bội (n) để khi thụ tinh khôi phục lại bộ NST 2n của loài.',
    app1: 'Khi phân tích diễn biến các kì (kì đầu, kì giữa, kì sau, kì cuối), kết quả và ý nghĩa sinh học của quá trình nguyên phân và quá trình giảm phân',
    app2: 'Khi giải thích sự phối hợp giữa ba cơ chế nguyên phân, giảm phân và thụ tinh trong việc duy trì ổn định bộ NST 2n qua các thế hệ ở loài sinh sản hữu tính',
  },
  44: {
    exp1: 'Khi phân tích bộ nhiễm sắc thể của người (2n = 46), các nhà di truyền tế bào học xác định có 22 cặp nhiễm sắc thể thường giống nhau ở cả nam và nữ, cùng 1 cặp nhiễm sắc thể giới tính là XX ở nữ và XY ở nam.',
    exp2: 'Trong chăn nuôi gia cầm và nuôi tằm lấy tơ, người ta nhận thấy ở chim, gà, bướm (tằm) con đực mang cặp NST giới tính tương đồng ZZ còn con cái mang cặp NST giới tính ZW, đồng thời ở một số loài rùa biển nhiệt độ ấp trứng cũng ảnh hưởng tới tỉ lệ giới tính.',
    app1: 'Khi phân tích đặc điểm nhiễm sắc thể giới tính, cơ chế nhiễm sắc thể xác định giới tính ở người (XX – XY) và các yếu tố ảnh hưởng đến sự phân hoá giới tính',
    app2: 'Khi giải thích cơ sở khoa học của tỉ lệ giới tính xấp xỉ 1 nam : 1 nữ trên quy mô lớn và ý nghĩa xã hội của việc nghiêm cấm lựa chọn giới tính thai nhi',
  },
  45: {
    exp1: 'Trong thí nghiệm trên đối tượng ruồi giấm (Drosophila melanogaster), Thomas Hunt Morgan lai ruồi đực F₁ thân xám, cánh dài (Bv/bV) với ruồi cái thân đen, cánh cụt (bv/bv) và thu được ở đời con chỉ có hai loại kiểu hình là 1 thân xám, cánh dài : 1 thân đen, cánh cụt (thay vì tỉ lệ 1:1:1:1 như phân li độc lập).',
    exp2: 'Khi lập bản đồ di truyền ở cây lúa và ngô, các nhà chọn giống phát hiện nhiều gene quy định các tính trạng quý (như năng suất cao và kháng sâu bệnh) cùng nằm trên một nhiễm sắc thể và luôn di truyền cùng nhau trong quá trình phân bào.',
    app1: 'Khi phân tích thí nghiệm của Morgan trên ruồi giấm, bản chất hiện tượng di truyền liên kết hoàn toàn và nguyên nhân các gene liên kết cùng nhau trên một NST',
    app2: 'Khi giải thích ý nghĩa sinh học của hiện tượng di truyền liên kết trong việc hạn chế biến dị tổ hợp và đảm bảo sự di truyền bền vững của từng nhóm tính trạng tốt',
  },
  46: {
    exp1: 'Trong chẩn đoán tiền sản bằng xét nghiệm bộ nhiễm sắc thể (karyotype) của thai nhi, các bác sĩ phát hiện hội chứng Down do thừa một nhiễm sắc thể số 21 (có 3 NST số 21, tổng 2n + 1 = 47 NST) hoặc bệnh ung thư máu ác tính do mất một đoạn nhỏ trên NST số 21.',
    exp2: 'Trong chọn giống cây trồng nông nghiệp, các nhà khoa học sử dụng hoá chất colchicine tác động lên quá trình phân bào để cản trở sự hình thành thoi phân bào, tạo ra các giống dưa hấu tam bội (3n) không hạt và giống dâu tằm, bông vải đa bội có cơ quan sinh dưỡng to lớn.',
    app1: 'Khi phân biệt các dạng đột biến cấu trúc NST (mất đoạn, lặp đoạn, đảo đoạn, chuyển đoạn) và đột biến số lượng NST (lệch bội và đa bội)',
    app2: 'Khi giải thích cơ chế phát sinh các hội chứng di truyền do đột biến NST ở người (như hội chứng Down, Turner) và ứng dụng gây đa bội nhân tạo trong nông nghiệp',
  },
  47: {
    exp1: 'Tại trung tâm tư vấn di truyền y học, bác sĩ tiến hành lập sơ đồ phả hệ qua 3 thế hệ của một gia đình có người mắc bệnh bạch tạng (hoặc bệnh máu khó đông, mù màu) để xác định quy luật di truyền trội/lặn và tính xác suất sinh con khoẻ mạnh cho cặp vợ chồng trẻ.',
    exp2: 'Các thống kê y học và dịch tễ học chứng minh rằng phụ nữ sinh con khi tuổi đã cao (trên 35 tuổi), người làm việc trong môi trường tiếp xúc với chất độc hoá học, thuốc trừ sâu, chất độc màu da cam (dioxin) hoặc kết hôn cận huyết thống có nguy cơ cao sinh con mắc bệnh, tật di truyền.',
    app1: 'Khi phân tích một số bệnh, tật và hội chứng di truyền ở người (Down, Turner, bạch tạng, câm điếc bẩm sinh), vai trò của di truyền học với hôn nhân và kế hoạch hoá gia đình',
    app2: 'Khi giải thích cơ sở di truyền học của Luật Hôn nhân và Gia đình (cấm kết hôn gần trong phạm vi 3 đời, hôn nhân một vợ một chồng) và các biện pháp bảo vệ vốn gene loài người',
  },
  48: {
    exp1: 'Trong công nghiệp dược phẩm hiện đại, các nhà công nghệ sinh học chuyển gene quy định tổng hợp hormone insulin của người vào tế bào vi khuẩn đường ruột E. coli thông qua thể truyền plasmid, giúp nuôi cấy vi khuẩn sản xuất insulin tinh khiết số lượng lớn điều trị bệnh tiểu đường.',
    exp2: 'Tại viện nghiên cứu nông nghiệp công nghệ cao, các nhà khoa học ứng dụng công nghệ di truyền để tạo ra giống "lúa vàng" tổng hợp được tiền chất vitamin A (β-carotene), giống ngô kháng sâu đục thân và giống cừu chuyển gene tiết protein chữa bệnh trong sữa.',
    app1: 'Khi phân tích nguyên lí công nghệ gene (công nghệ DNA tái tổ hợp), quy trình tạo sinh vật biến đổi gene (GMO) và các ứng dụng trong y dược, nông nghiệp, xử lí môi trường',
    app2: 'Khi đánh giá triển vọng và các nguyên tắc đạo đức sinh học, an toàn sinh học trong việc nghiên cứu và thương mại hoá các sản phẩm biến đổi gene',
  },
  49: {
    exp1: 'Từ loài gà rừng hoang dã nhỏ bé, đẻ ít trứng, qua hàng nghìn năm nuôi dưỡng và giữ lại các cá thể có đặc tính mong muốn, con người đã tạo ra hàng chục giống gà nhà rất khác nhau như gà siêu trứng Leghorn, gà siêu thịt Brahma hay gà chọi.',
    exp2: 'Khi khảo sát quần thể bướm sâu đo bạch dương (Biston betularia) tại vùng công nghiệp nước Anh trước và sau khi thân cây bạch dương bị khói bụi nhà máy phủ đen, các nhà sinh thái học ghi nhận sự thay đổi mạnh mẽ tần số kiểu hình từ dạng cánh màu sáng sang dạng cánh màu sẫm.',
    app1: 'Khi phân tích khái niệm tiến hoá sinh học, cơ chế và vai trò của chọn lọc nhân tạo trong sản xuất và chọn lọc tự nhiên trong thiên nhiên theo quan điểm của Darwin',
    app2: 'Khi so sánh động lực, mục đích và kết quả của chọn lọc tự nhiên (hình thành đặc điểm thích nghi và loài mới) với chọn lọc nhân tạo (phục vụ nhu cầu đa dạng của con người)',
  },
  50: {
    exp1: 'Trong một quần thể côn trùng gây hại trên đồng ruộng, khi nông dân phun cùng một loại thuốc trừ sâu liên tục qua nhiều vụ mùa, hầu hết các cá thể nhạy cảm bị tiêu diệt nhưng một số ít cá thể mang gene đột biến kháng thuốc có sẵn trong quần thể sống sót và sinh sản mạnh, tạo thành quần thể kháng thuốc.',
    exp2: 'Trên quần đảo Galápagos cách biệt với đất liền Nam Mỹ, từ một loài chim sẻ tổ tiên ban đầu bay ra đảo, dưới tác động của các nhân tố tiến hoá và điều kiện thức ăn khác nhau ở từng hòn đảo đã hình thành nên hơn một chục loài chim sẻ có hình dạng mỏ thích nghi chuyên hoá.',
    app1: 'Khi phân tích quan điểm tiến hoá của Lamarck, Darwin và thuyết tiến hoá tổng hợp hiện đại (tiến hoá nhỏ và tiến hoá lớn, vai trò của đột biến, giao phối, chọn lọc tự nhiên, các cơ chế cách li)',
    app2: 'Khi giải thích cơ chế hình thành đặc điểm thích nghi (như vi khuẩn kháng kháng sinh, sâu bọ kháng thuốc trừ sâu) và quá trình hình thành loài mới theo tiến hoá hiện đại',
  },
  51: {
    exp1: 'Năm 1953, Stanley Miller và Harold Urey thiết kế hệ thống bình thuỷ tinh kín chứa hỗn hợp khí mô phỏng khí quyển nguyên thuỷ của Trái Đất (CH₄, NH₃, H₂, hơi nước H₂O) và phóng tia lửa điện liên tục trong một tuần, kết quả thu được nhiều hợp chất hữu cơ đơn giản như các amino acid.',
    exp2: 'Khi nghiên cứu các lớp địa tầng và tuổi của các hoá thạch cổ sinh vật từ đại Thái cổ, Nguyên sinh, Cổ sinh, Trung sinh đến Tân sinh, các nhà cổ sinh vật học tái dựng được lịch sử phát triển của sinh giới từ các tế bào nhân sơ đầu tiên trong đại dương đến sự xuất hiện của loài người.',
    app1: 'Khi phân tích ba giai đoạn phát sinh sự sống trên Trái Đất (tiến hoá hoá học, tiến hoá tiền sinh học, tiến hoá sinh học) và quá trình phát triển của sinh giới qua các đại địa chất',
    app2: 'Khi giải thích vì sao ngày nay sự sống trên Trái Đất không còn tự phát hình thành từ chất vô cơ theo con đường hoá học như thời kì nguyên thuỷ',
  },
};

// Hàm làm sạch hoàn toàn mọi dấu vết "Bài X", "bài học", "trong SGK" nếu có trong văn bản
function cleanScientificText(text) {
  if (!text) return '';
  return String(text)
    .replace(/^Bài\s*\d+\s*[:.-]\s*/i, '')
    .replace(/trong\s+Bài\s*\d+[^,.]*/gi, 'trong thực nghiệm khoa học')
    .replace(/theo\s+SGK\s+KHTN\s*9/gi, 'theo cơ sở khoa học')
    .trim();
}

// Bộ phương án nhiễu có ý nghĩa khoa học theo từng lĩnh vực (tuyệt đối không dùng câu meta về "bài học")
function getDomainScientificDistractors(subject, idx = 0) {
  if (subject === 'vat_li') {
    const sets = [
      [
        'Đại lượng nghiên cứu luôn tỉ lệ nghịch với cả khối lượng của vật và thời gian thực hiện quá trình trong mọi hệ quy chiếu.',
        'Trong quá trình biến đổi, tổng năng lượng của hệ tự sinh ra thêm mà không cần có công cơ học hay nhiệt lượng truyền vào.',
        'Hiện tượng chỉ xảy ra trong môi trường chân không tuyệt đối và hoàn toàn không phụ thuộc vào bản chất vật lí của môi trường truyền.',
      ],
      [
        'Khi tăng gấp đôi hiệu điện thế hoặc lực tác dụng thì đại lượng kết quả giảm đi bốn lần do sự tiêu hao năng lượng nội tại.',
        'Chiều của quá trình vật lí luôn cố định theo một chiều duy nhất, không phụ thuộc vào chiều của lực từ hay hướng truyền tia sáng.',
        'Giá trị đo được của đại lượng luôn bằng 0 khi vật chuyển động thẳng đều hoặc khi ánh sáng truyền qua mặt phân cách bất kì.',
      ],
      [
        'Mọi vật liệu cách điện và dẫn điện đều có cùng giá trị điện trở suất và chiết suất quang học ở cùng nhiệt độ phòng.',
        'Năng lượng cơ học và năng lượng điện trong mạch luôn tự động triệt tiêu lẫn nhau ngay khi đóng công tắc nguồn.',
        'Góc khúc xạ và góc phản xạ luôn bằng 90° đối với mọi góc tới của chùm tia sáng chiếu tới mặt phân cách.',
      ],
    ];
    return sets[idx % sets.length];
  }

  if (subject === 'hoa_hoc') {
    const sets = [
      [
        'Phản ứng chỉ xảy ra khi có mặt chất xúc tác sinh học ở nhiệt độ âm và giải phóng trực tiếp kim loại kiềm tự do trong dung dịch nước.',
        'Hợp chất khảo sát hoàn toàn trơ về mặt hoá học, không tham gia phản ứng cháy với oxygen cũng như không tác dụng với acid hay kiềm ở mọi điều kiện.',
        'Trong phân tử chỉ tồn tại liên kết ion bền vững giữa các nguyên tử kim loại chuyển tiếp, không có sự góp chung electron hoá trị.',
      ],
      [
        'Khi dẫn sản phẩm khí qua dung dịch nước bromine hoặc nước vôi trong thì dung dịch chuyển sang màu tím sẫm và toả khí hydrogen.',
        'Kim loại hoạt động yếu hơn như đồng (Cu), bạc (Ag) luôn đẩy được các kim loại kiềm và kiềm thổ ra khỏi dung dịch muối ở nhiệt độ thường.',
        'Quá trình biến đổi làm thay đổi số proton trong hạt nhân nguyên tử carbon tạo thành nguyên tố kim loại nặng tương ứng.',
      ],
      [
        'Dung dịch thu được sau phản ứng luôn có môi trường kiềm mạnh (pH = 14) làm giấy quỳ tím chuyển sang màu đỏ tươi và hoà tan được vàng nguyên chất.',
        'Tất cả các hợp chất trong dãy đồng đẳng đều có cùng phân tử khối và chỉ tan trong dung môi nước mà không tan trong dung môi hữu cơ.',
        'Khi đun nóng ở áp suất thường, hợp chất tự phân huỷ hoàn toàn thành khí nitrogen và kim loại nguyên chất mà không cần tác nhân khử.',
      ],
    ];
    return sets[idx % sets.length];
  }

  if (subject === 'sinh_hoc') {
    const sets = [
      [
        'Thông tin di truyền được truyền trực tiếp từ phân tử protein sang phân tử DNA trong không bào mà không cần sự tham gia của enzyme hay nucleic acid.',
        'Bộ nhiễm sắc thể của tế bào con sau phân bào luôn tăng gấp bốn lần (4n) ở mọi mô sinh dưỡng nhằm tăng kích thước cơ thể trưởng thành.',
        'Các allele nằm trên các cặp nhiễm sắc thể tương đồng khác nhau luôn hoán vị trực tiếp với các phân tử lipid của màng sinh chất trong kì trung gian.',
      ],
      [
        'Mọi biến đổi kiểu hình do điều kiện dinh dưỡng và thời tiết (thường biến) đều làm thay đổi trình tự nucleotide của gene trong giao tử và di truyền nguyên vẹn cho đời con.',
        'Quá trình tổng hợp chuỗi polypeptide diễn ra bên trong nhân con với nguyên liệu trực tiếp là các đơn phân deoxyribonucleotide (A, T, G, C).',
        'Trong phép lai giữa hai dòng thuần chủng tương phản, thế hệ F₁ luôn phân li đồng loạt theo tỉ lệ 9 trội : 7 lặn ngay ở mọi loài sinh vật nhân sơ.',
      ],
      [
        'Chọn lọc tự nhiên trực tiếp tạo ra các kiểu gene thích nghi mới chỉ trong một thế hệ cá thể để đáp ứng tức thời với nguyện vọng của con người.',
        'Ở mọi loài động vật có vú, giới tính của hợp tử chỉ được quyết định bởi nhiệt độ môi trường nước sau khi cơ thể non đã trưởng thành.',
        'Trong quá trình tái bản DNA, nguyên tắc bổ sung được thực hiện bằng cách liên kết trực tiếp hai purine (A liên kết với G) thông qua liên kết cộng hoá trị.',
      ],
    ];
    return sets[idx % sets.length];
  }

  // mo_dau (Thực hành phòng thí nghiệm & Phương pháp nghiên cứu khoa học)
  return [
    'Có thể dùng miệng hút trực tiếp các dung dịch acid và kiềm đặc qua pipet thuỷ tinh để rút ngắn thời gian thao tác thí nghiệm.',
    'Sau khi kết thúc thí nghiệm, toàn bộ hoá chất độc hại và kim loại nặng dư thừa đều được đổ trực tiếp xuống bồn rửa dân dụng mà không cần thu gom xử lí.',
    'Khi số liệu thực nghiệm đo được có sai lệch nhỏ so với công thức lí thuyết, người làm thí nghiệm được phép tự ý sửa lại số liệu trong báo cáo cho khớp hoàn toàn.',
  ];
}

function buildLessonCoverageQuestions() {
  const allLessons = [
    ...LESSONS_PHYSICS_SEED,
    ...LESSONS_CHEMISTRY_SEED,
    ...LESSONS_BIOLOGY_SEED,
  ].sort((a, b) => a.id - b.id);

  const generated = [];

  for (const lesson of allLessons) {
    // Quy tắc Chỉ báo năng lực chuẩn theo 2 file mẫu "CHỈ BÁO - CẤP ĐỘ.pdf" (Hoá học) & "Chỉ báo Sinh.docx" (Sinh học):
    // - Môn Vật lí (lesson.subject === 'vat_li', Bài 2 -> Bài 17): KHÔNG để chỉ báo (indicator: '').
    // - Môn Hoá học (lesson.subject === 'hoa_hoc' & Bài 1):
    //   + Biết: HH1.1 (Nhận biết, nêu tên sự vật, hiện tượng, khái niệm, quy luật), HH1.2 (Trình bày đặc điểm, vai trò, công thức, PTHH, sơ đồ)
    //   + Hiểu: HH1.3 (So sánh, phân loại, lựa chọn), HH1.4 (Phân tích đặc điểm theo logic), HH1.6 (Giải thích mối quan hệ nguyên nhân - kết quả, cấu tạo - tính chất), HH3.1 (Giải thích vấn đề thực tiễn)
    //   + Vận dụng: HH1.5 (Vận dụng thuật ngữ, công thức, tính toán theo logic có ý nghĩa), HH3.2 (Đề xuất giải pháp bảo vệ tự nhiên, thích ứng biến đổi khí hậu, phát triển bền vững)
    // - Môn Sinh học (lesson.subject === 'sinh_hoc', Bài 36 -> Bài 51):
    //   + Biết: NT1 (Nhận biết, kể tên, phát biểu, nêu được đối tượng, khái niệm, quy luật, quá trình sống), NT2 (Trình bày đặc điểm, vai trò bằng ngôn ngữ, công thức, sơ đồ)
    //   + Hiểu: NT3 (Phân loại), NT4 (Phân tích đặc điểm theo logic), NT5 (So sánh, lựa chọn đối tượng/cơ chế), NT6 (Giải thích mối quan hệ nguyên nhân - kết quả, cấu tạo - chức năng), TH1/TH2 (Đề xuất vấn đề / Xây dựng giả thuyết tìm hiểu thế giới sống)
    //   + Vận dụng: VD1 (Giải thích, đánh giá hiện tượng thực tiễn, vận dụng giải bài toán thực tiễn), VD2 (Đề xuất giải pháp bảo vệ sức khoẻ, môi trường, phát triển bền vững), NT7/NT8 (Phản biện, kết nối thông tin khoa học)
    const isPhysics = lesson.subject === 'vat_li';
    const isBiology = lesson.subject === 'sinh_hoc';
    const isEnvChem = [25, 32, 33, 34, 35].includes(lesson.id);
    const isEnvBio = [47, 48, 49, 50, 51].includes(lesson.id);

    const indBiet1 = isPhysics ? '' : isBiology ? 'NT1' : 'HH1.1';
    const indBiet2 = isPhysics ? '' : isBiology ? 'NT2' : 'HH1.2';
    const indBiet3 = isPhysics ? '' : isBiology ? 'NT1' : 'HH1.1';
    const indHieu1 = isPhysics ? '' : isBiology ? 'NT5' : 'HH1.3';
    const indHieu2 = isPhysics ? '' : isBiology ? 'NT6' : 'HH1.6';
    const indVdMcq = isPhysics ? '' : isBiology ? 'VD1' : 'HH1.5';
    const indTf1 = isPhysics ? '' : lesson.subject === 'mo_dau' ? '' : isBiology ? 'NT4' : 'HH1.4';
    const indTf2 = isPhysics ? '' : isBiology ? 'TH1' : 'HH3.1';
    const indSaBiet = isPhysics ? '' : isBiology ? 'NT1' : 'HH1.2';
    const indSaHieu = isPhysics ? '' : isBiology ? 'NT6' : 'HH1.3';
    const indEssay1 = isPhysics ? '' : isBiology ? 'VD1' : 'HH1.5';
    const indEssay2 = isPhysics
      ? ''
      : isBiology
      ? isEnvBio
        ? 'VD2'
        : 'VD1'
      : isEnvChem
      ? 'HH3.2'
      : 'HH1.5';

    const ctx = LESSON_SCIENTIFIC_CONTEXTS[lesson.id] || {
      exp1: 'Trong một khảo sát thực nghiệm tại phòng thí nghiệm Khoa học tự nhiên, học sinh tiến hành đo đạc và phân tích các đại lượng đặc trưng của hiện tượng.',
      exp2: 'Trong thực tiễn sản xuất và đời sống, các nhà khoa học ứng dụng các quy luật tự nhiên để giải thích và tối ưu hoá hiệu quả của quá trình kỹ thuật.',
      app1: 'Khi phân tích cơ sở khoa học của hiện tượng thực nghiệm',
      app2: 'Khi vận dụng quy luật khoa học vào giải quyết vấn đề thực tiễn',
    };

    const obj0 = cleanScientificText(lesson.objectives[0] || '');
    const obj1 = cleanScientificText(lesson.objectives[1] || lesson.objectives[0] || '');
    const objLast = cleanScientificText(lesson.objectives[lesson.objectives.length - 1] || obj0);

    const concept0 = cleanScientificText(lesson.coreConcepts[0] || obj0);
    const concept1 = cleanScientificText(lesson.coreConcepts[1] || lesson.quickSummary[0] || concept0);
    const concept2 = cleanScientificText(lesson.coreConcepts[2] || lesson.quickSummary[1] || concept1);
    const concept3 = cleanScientificText(lesson.coreConcepts[3] || lesson.quickSummary[0] || concept0);

    const mistake0 = cleanScientificText(
      lesson.commonMistakes[0] ||
        'Cần đổi đúng đơn vị chuẩn trong hệ SI và kiểm tra đầy đủ điều kiện xảy ra quá trình trước khi kết luận.'
    );
    const mistake1 = cleanScientificText(lesson.commonMistakes[1] || mistake0);

    const summary0 = cleanScientificText(lesson.quickSummary[0] || concept0);
    const summary1 = cleanScientificText(lesson.quickSummary[1] || concept1);
    const summary2 = cleanScientificText(lesson.quickSummary[2] || summary0);

    const formulaObj = lesson.formulasAndLaws[0];
    const formulaObj2 = lesson.formulasAndLaws[1] || formulaObj;
    const exampleObj = lesson.examples[0];
    const exampleObj2 = lesson.examples[1] || exampleObj;

    const distSet0 = getDomainScientificDistractors(lesson.subject, 0);
    const distSet1 = getDomainScientificDistractors(lesson.subject, 1);
    const distSet2 = getDomainScientificDistractors(lesson.subject, 2);

    // =========================================================================
    // CẶP 1: TRẮC NGHIỆM NHIỀU LỰA CHỌN — MỨC ĐỘ BIẾT (Đề 01 & Đề 02)
    // =========================================================================
    const idBiet1 = `q-les-${lesson.id}-mcq-biet-1`;
    generated.push({
      id: idBiet1,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'biet',
      indicator: indBiet1,
      requirementText: obj0,
      prompt: `${ctx.exp1} Dựa trên cơ sở khoa học của hiện tượng trên, nhận định nào sau đây là ĐÚNG?`,
      options: [
        concept0,
        distSet0[0],
        distSet0[1],
        distSet0[2],
      ],
      correctOptionIndex: 0,
      points: 0.25,
      explanation: `Cơ sở khoa học chính xác: ${concept0}`,
      knowledgeSectionRef: 'coreConcepts',
    });
    generated.push({
      id: `${idBiet1}-v2`,
      twinOf: idBiet1,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'biet',
      indicator: indBiet1,
      requirementText: obj0,
      prompt: `${ctx.exp2} Khi phân tích bản chất khoa học của quá trình trên, kết luận nào dưới đây là CHÍNH XÁC?`,
      options: [
        distSet1[0],
        summary0,
        distSet1[1],
        distSet1[2],
      ],
      correctOptionIndex: 1,
      points: 0.25,
      explanation: `Kết luận khoa học đúng: ${summary0}`,
      knowledgeSectionRef: 'quickSummary',
    });

    // =========================================================================
    // CẶP 2: TRẮC NGHIỆM NHIỀU LỰA CHỌN — MỨC ĐỘ BIẾT (Cặp 2: Đề 01 & Đề 02)
    // =========================================================================
    const idBiet2 = `q-les-${lesson.id}-mcq-biet-2`;
    generated.push({
      id: idBiet2,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'biet',
      indicator: indBiet2,
      requirementText: obj0,
      prompt: `${ctx.app1}, các nhà khoa học đã xác lập được các tính chất và quy luật đặc trưng. Phát biểu nào sau đây phản ánh ĐÚNG bản chất khoa học của quá trình này?`,
      options: [
        distSet1[0],
        distSet1[1],
        concept1,
        distSet1[2],
      ],
      correctOptionIndex: 2,
      points: 0.25,
      explanation: `Giải thích khoa học: ${concept1}`,
      knowledgeSectionRef: 'coreConcepts',
    });
    generated.push({
      id: `${idBiet2}-v2`,
      twinOf: idBiet2,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'biet',
      indicator: indBiet2,
      requirementText: obj0,
      prompt: `${ctx.app2}, người thực hiện cần nắm vững đặc điểm cốt lõi của các đại lượng và chất tham gia. Phát biểu nào dưới đây là ĐÚNG?`,
      options: [
        distSet2[0],
        distSet2[1],
        distSet2[2],
        summary1,
      ],
      correctOptionIndex: 3,
      points: 0.25,
      explanation: `Đặc điểm khoa học chuẩn xác: ${summary1}`,
      knowledgeSectionRef: 'quickSummary',
    });

    // =========================================================================
    // CẶP 3: TRẮC NGHIỆM NHIỀU LỰA CHỌN — MỨC ĐỘ BIẾT (Cặp 3: Đề 01 & Đề 02)
    // =========================================================================
    const idBiet3 = `q-les-${lesson.id}-mcq-biet-3`;
    generated.push({
      id: idBiet3,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'biet',
      indicator: indBiet3,
      requirementText: obj0,
      prompt: `Trong quá trình khảo sát thực nghiệm tại phòng bộ môn Khoa học tự nhiên: "${ctx.exp1}" — nhận định khoa học nào sau đây là ĐÚNG?`,
      options: [
        distSet2[0],
        concept2,
        distSet2[1],
        distSet2[2],
      ],
      correctOptionIndex: 1,
      points: 0.25,
      explanation: `Nhận định khoa học đúng: ${concept2}`,
      knowledgeSectionRef: 'coreConcepts',
    });
    generated.push({
      id: `${idBiet3}-v2`,
      twinOf: idBiet3,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'biet',
      indicator: indBiet3,
      requirementText: obj0,
      prompt: `Xét tình huống thực tiễn sau: "${ctx.exp2}" — phát biểu nào dưới đây mô tả ĐÚNG quy luật tự nhiên chi phối hiện tượng trên?`,
      options: [
        concept3,
        distSet0[0],
        distSet0[1],
        distSet0[2],
      ],
      correctOptionIndex: 0,
      points: 0.25,
      explanation: `Quy luật tự nhiên đúng: ${concept3}`,
      knowledgeSectionRef: 'coreConcepts',
    });

    // =========================================================================
    // CẶP 4: TRẮC NGHIỆM NHIỀU LỰA CHỌN — MỨC ĐỘ HIỂU (Cặp 1: Đề 01 & Đề 02)
    // =========================================================================
    const idHieu1 = `q-les-${lesson.id}-mcq-hieu-1`;
    generated.push({
      id: idHieu1,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'hieu',
      indicator: indHieu1,
      requirementText: obj1,
      prompt: `${ctx.exp1} Để định lượng hoặc mô tả chuẩn xác mối quan hệ giữa các yếu tố trong hiện tượng trên (${formulaObj ? formulaObj.name : 'quy luật khoa học'}), biểu thức hoặc cơ chế nào dưới đây là CHÍNH XÁC?`,
      options: [
        distSet0[1],
        formulaObj ? `${formulaObj.formula} — ${formulaObj.description}` : concept1,
        distSet1[1],
        distSet2[1],
      ],
      correctOptionIndex: 1,
      points: 0.25,
      explanation: formulaObj
        ? `Biểu thức/quy luật chuẩn xác là: ${formulaObj.formula} (${formulaObj.units}).`
        : `Giải thích cơ chế khoa học: ${concept1}`,
      knowledgeSectionRef: 'formulasAndLaws',
    });
    generated.push({
      id: `${idHieu1}-v2`,
      twinOf: idHieu1,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'hieu',
      indicator: indHieu1,
      requirementText: obj1,
      prompt: `${ctx.exp2} Để đảm bảo độ chính xác khi xử lí số liệu đo đạc và giải thích kết quả thực nghiệm trên, nguyên tắc khoa học nào sau đây cần được tuân thủ?`,
      options: [
        distSet1[0],
        distSet2[0],
        `${summary1} (Lưu ý kiểm soát sai số: ${mistake0})`,
        distSet0[2],
      ],
      correctOptionIndex: 2,
      points: 0.25,
      explanation: `Nguyên tắc khoa học cần tuân thủ: ${summary1}. Đồng thời tránh sai sót: ${mistake0}`,
      knowledgeSectionRef: 'commonMistakes',
    });

    // =========================================================================
    // CẶP 5: TRẮC NGHIỆM NHIỀU LỰA CHỌN — MỨC ĐỘ HIỂU (Cặp 2: Đề 01 & Đề 02)
    // =========================================================================
    const idHieu2 = `q-les-${lesson.id}-mcq-hieu-2`;
    generated.push({
      id: idHieu2,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'hieu',
      indicator: indHieu2,
      requirementText: obj1,
      prompt: `${ctx.app1}, khi phân tích mối liên hệ nhân quả giữa các đại lượng và điều kiện thực nghiệm, giải thích nào sau đây là phù hợp với cơ sở khoa học?`,
      options: [
        distSet0[0],
        distSet1[2],
        distSet2[2],
        concept3,
      ],
      correctOptionIndex: 3,
      points: 0.25,
      explanation: `Cơ sở khoa học: ${concept3}`,
      knowledgeSectionRef: 'coreConcepts',
    });
    generated.push({
      id: `${idHieu2}-v2`,
      twinOf: idHieu2,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'hieu',
      indicator: indHieu2,
      requirementText: obj1,
      prompt: `${ctx.app2}, vì sao trong thực tế một số kết quả tính toán hoặc thực nghiệm lại bị sai lệch nếu người thực hiện không kiểm tra kĩ các điều kiện chuẩn?`,
      options: [
        `Vì dễ gặp sai sót kỹ thuật: "${mistake1}" — do đó bắt buộc phải chuẩn hoá đơn vị và kiểm tra điều kiện áp dụng.`,
        distSet1[0],
        distSet2[0],
        distSet0[1],
      ],
      correctOptionIndex: 0,
      points: 0.25,
      explanation: `Nguyên nhân sai lệch thực nghiệm cần khắc phục: ${mistake1}`,
      knowledgeSectionRef: 'commonMistakes',
    });

    // =========================================================================
    // CẶP 6: TRẮC NGHIỆM NHIỀU LỰA CHỌN — MỨC ĐỘ VẬN DỤNG (Cặp 1: Đề 01 & Đề 02)
    // =========================================================================
    const idVd1 = `q-les-${lesson.id}-mcq-vd-1`;
    generated.push({
      id: idVd1,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'van_dung',
      indicator: indVdMcq,
      requirementText: objLast,
      prompt: exampleObj
        ? `Xét bài toán thực nghiệm sau: ${exampleObj.problem}`
        : `${ctx.exp1} Phương án giải quyết thực tiễn nào sau đây là ĐÚNG?`,
      options: [
        exampleObj ? exampleObj.solution : summary0,
        distSet0[2],
        distSet1[2],
        distSet2[2],
      ],
      correctOptionIndex: 0,
      points: 0.25,
      explanation: exampleObj
        ? `Hướng dẫn giải chi tiết: ${exampleObj.solution}`
        : `Vận dụng khoa học đúng: ${summary0}`,
      knowledgeSectionRef: 'examples',
    });
    generated.push({
      id: `${idVd1}-v2`,
      twinOf: idVd1,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'mcq',
      level: 'van_dung',
      indicator: indVdMcq,
      requirementText: objLast,
      prompt: `${ctx.exp2} Khi vận dụng quy luật khoa học để giải quyết tình huống thực tiễn trên, phương án nào dưới đây là CHÍNH XÁC?`,
      options: [
        distSet1[0],
        distSet2[1],
        formulaObj
          ? `Áp dụng biểu thức/quy luật ${formulaObj.formula} (${formulaObj.units}) kết hợp phân tích: ${exampleObj2 ? exampleObj2.solution : summary2}`
          : `${summary2} (${exampleObj2 ? exampleObj2.solution : concept0})`,
        distSet0[0],
      ],
      correctOptionIndex: 2,
      points: 0.25,
      explanation: formulaObj
        ? `Áp dụng quy luật ${formulaObj.formula}: ${exampleObj2 ? exampleObj2.solution : summary2}`
        : `Giải thích: ${summary2}`,
      knowledgeSectionRef: 'examples',
    });

    // =========================================================================
    // CẶP 7: TRẮC NGHIỆM ĐÚNG - SAI (4 Ý a, b, c, d) — MỨC ĐỘ HIỂU (Cặp 1: Đề 01 & Đề 02)
    // =========================================================================
    const idTf1 = `q-les-${lesson.id}-tf-1`;
    generated.push({
      id: idTf1,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'true_false',
      level: 'hieu',
      indicator: indTf1,
      requirementText: obj1,
      prompt: `${ctx.exp1} Sau khi quan sát và thu thập dữ liệu, nhóm nghiên cứu đưa ra 4 nhận định phân tích dưới đây. Hãy xác định mỗi nhận định là Đúng (Đ) hay Sai (S):`,
      statements: [
        {
          id: 'a',
          text: concept0,
          isTrue: true,
          explanation: `Đúng theo bản chất khoa học của hiện tượng: ${concept0}`,
        },
        {
          id: 'b',
          text: formulaObj
            ? `Mối quan hệ định lượng/quy luật chi phối quá trình trên được biểu diễn bởi: ${formulaObj.formula} (${formulaObj.description}).`
            : concept1,
          isTrue: true,
          explanation: formulaObj
            ? `Đúng theo biểu thức/quy luật chuẩn: ${formulaObj.formula}.`
            : `Đúng theo cơ chế khoa học đã kiểm chứng.`,
        },
        {
          id: 'c',
          text: distSet0[0],
          isTrue: false,
          explanation: `Sai. Lưu ý tránh sai lầm thực nghiệm: ${mistake0}`,
        },
        {
          id: 'd',
          text: summary0,
          isTrue: true,
          explanation: `Đúng theo kết luận khoa học thực nghiệm.`,
        },
      ],
      points: 1.0,
      explanation: `Đáp án chuẩn: a - Đ; b - Đ; c - S; d - Đ.`,
      knowledgeSectionRef: 'coreConcepts',
    });
    generated.push({
      id: `${idTf1}-v2`,
      twinOf: idTf1,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'true_false',
      level: 'hieu',
      indicator: indTf1,
      requirementText: obj1,
      prompt: `${ctx.exp2} Dựa trên các quy luật khoa học tự nhiên và kết quả khảo sát thực tế, hãy xác định mỗi phát biểu dưới đây là Đúng (Đ) hay Sai (S):`,
      statements: [
        {
          id: 'a',
          text: distSet1[0],
          isTrue: false,
          explanation: `Sai vì quá trình luôn tuân theo định luật bảo toàn và điều kiện xác định.`,
        },
        {
          id: 'b',
          text: concept1,
          isTrue: true,
          explanation: `Đúng theo cơ sở khoa học của quá trình.`,
        },
        {
          id: 'c',
          text: summary1,
          isTrue: true,
          explanation: `Đúng theo kết quả tổng kết thực nghiệm.`,
        },
        {
          id: 'd',
          text: distSet2[0],
          isTrue: false,
          explanation: `Sai. Cần lưu ý kiểm soát điều kiện chuẩn: ${mistake1}`,
        },
      ],
      points: 1.0,
      explanation: `Đáp án chuẩn: a - S; b - Đ; c - Đ; d - S.`,
      knowledgeSectionRef: 'quickSummary',
    });

    // =========================================================================
    // CẶP 8: TRẮC NGHIỆM ĐÚNG - SAI (4 Ý a, b, c, d) — Cặp 2 (Đề 01 & Đề 02)
    // =========================================================================
    const idTf2 = `q-les-${lesson.id}-tf-extra`;
    generated.push({
      id: idTf2,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'true_false',
      level: 'hieu',
      indicator: indTf2,
      requirementText: obj1,
      prompt: `${ctx.app1}, một hội đồng kỹ thuật tiến hành đối chiếu số liệu thực nghiệm với lí thuyết. Hãy cho biết mỗi nhận định dưới đây là Đúng (Đ) hay Sai (S):`,
      statements: [
        {
          id: 'a',
          text: concept2,
          isTrue: true,
          explanation: `Đúng theo cơ sở lí thuyết khoa học.`,
        },
        {
          id: 'b',
          text: distSet0[1],
          isTrue: false,
          explanation: `Sai vì các đại lượng biến đổi tuân theo quy luật xác định và định luật bảo toàn.`,
        },
        {
          id: 'c',
          text: exampleObj
            ? `Khi giải quyết bài toán thực tế "${exampleObj.problem}", kết quả xác định được là: ${exampleObj.solution}`
            : summary0,
          isTrue: true,
          explanation: `Đúng theo kết quả tính toán và thực nghiệm chuẩn.`,
        },
        {
          id: 'd',
          text: distSet1[2],
          isTrue: false,
          explanation: `Sai. Mọi phép đo và phản ứng đều phụ thuộc chặt chẽ vào bản chất vật chất và điều kiện môi trường.`,
        },
      ],
      points: 1.0,
      explanation: `Đáp án chuẩn: a - Đ; b - S; c - Đ; d - S.`,
      knowledgeSectionRef: 'examples',
    });
    generated.push({
      id: `${idTf2}-v2`,
      twinOf: idTf2,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'true_false',
      level: 'hieu',
      indicator: indTf2,
      requirementText: obj1,
      prompt: `${ctx.app2}, các chuyên gia đưa ra 4 nhận định đánh giá quy trình kỹ thuật sau đây. Hãy xác định tính Đúng (Đ) / Sai (S) của từng nhận định:`,
      statements: [
        {
          id: 'a',
          text: summary2,
          isTrue: true,
          explanation: `Đúng theo nguyên lí khoa học chuẩn xác.`,
        },
        {
          id: 'b',
          text: distSet2[1],
          isTrue: false,
          explanation: `Sai vì không phù hợp với thực nghiệm khoa học.`,
        },
        {
          id: 'c',
          text: `Để đảm bảo kết quả thực nghiệm chính xác, người thực hiện cần kiểm soát chặt chẽ sai số: ${mistake0}`,
          isTrue: true,
          explanation: `Đúng. Đây là nguyên tắc quan trọng trong thực nghiệm và tính toán khoa học.`,
        },
        {
          id: 'd',
          text: concept3,
          isTrue: true,
          explanation: `Đúng theo bản chất khoa học của hiện tượng.`,
        },
      ],
      points: 1.0,
      explanation: `Đáp án chuẩn: a - Đ; b - S; c - Đ; d - Đ.`,
      knowledgeSectionRef: 'quickSummary',
    });

    // =========================================================================
    // CẶP 9: TRẮC NGHIỆM TRẢ LỜI NGẮN — MỨC ĐỘ BIẾT (Cặp 1: Đề 01 & Đề 02)
    // =========================================================================
    const idSa1 = `q-les-${lesson.id}-sa-biet-1`;
    generated.push({
      id: idSa1,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'short_answer',
      level: 'biet',
      indicator: indSaBiet,
      requirementText: obj0,
      prompt: formulaObj
        ? `${ctx.exp1} Hãy viết biểu thức hoặc quy luật chuẩn của "${formulaObj.name}" dùng để xác định đại lượng/quá trình trong hiện tượng trên.`
        : `${ctx.exp1} Hãy nêu ngắn gọn tính chất hoặc quy luật khoa học cốt lõi phản ánh hiện tượng trên.`,
      acceptedAnswers: formulaObj
        ? [formulaObj.formula, formulaObj.name]
        : [summary0, concept0],
      points: 0.5,
      explanation: formulaObj
        ? `Biểu thức/quy luật chuẩn: ${formulaObj.formula}`
        : `Đáp án chuẩn: ${summary0}`,
      knowledgeSectionRef: 'formulasAndLaws',
    });
    generated.push({
      id: `${idSa1}-v2`,
      twinOf: idSa1,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'short_answer',
      level: 'biet',
      indicator: indBiet1,
      requirementText: obj0,
      prompt: formulaObj
        ? `${ctx.exp2} Khi áp dụng quy luật "${formulaObj.name}" (${formulaObj.formula}) để xử lí dữ liệu thực nghiệm, các đại lượng và đơn vị chuẩn trong hệ SI được quy ước như thế nào?`
        : `${ctx.exp2} Hãy nêu ngắn gọn kết luận khoa học rút ra từ hiện tượng thực tiễn trên.`,
      acceptedAnswers: formulaObj
        ? [formulaObj.units, formulaObj.description, formulaObj.formula]
        : [summary1, concept1],
      points: 0.5,
      explanation: formulaObj
        ? `Đơn vị và quy ước chuẩn: ${formulaObj.units}`
        : `Đáp án chuẩn: ${summary1}`,
      knowledgeSectionRef: 'quickSummary',
    });

    // =========================================================================
    // CẶP 10: TRẮC NGHIỆM TRẢ LỜI NGẮN — MỨC ĐỘ HIỂU (Cặp 2: Đề 01 & Đề 02)
    // =========================================================================
    const idSa2 = `q-les-${lesson.id}-sa-hieu-1`;
    generated.push({
      id: idSa2,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'short_answer',
      level: 'hieu',
      indicator: indSaHieu,
      requirementText: obj1,
      prompt: formulaObj2
        ? `${ctx.app1}, dựa vào "${formulaObj2.name}" (${formulaObj2.formula}), hãy nêu ngắn gọn ý nghĩa khoa học hoặc mối quan hệ tỉ lệ chính của quy luật này.`
        : `${ctx.app1}, hãy giải thích ngắn gọn cơ chế khoa học của hiện tượng quan sát được.`,
      acceptedAnswers: formulaObj2
        ? [formulaObj2.description, formulaObj2.formula]
        : [concept1, summary1],
      points: 0.5,
      explanation: formulaObj2
        ? `Ý nghĩa khoa học của quy luật: ${formulaObj2.description}`
        : `Đáp án chuẩn: ${concept1}`,
      knowledgeSectionRef: 'coreConcepts',
    });
    generated.push({
      id: `${idSa2}-v2`,
      twinOf: idSa2,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'short_answer',
      level: 'hieu',
      indicator: indHieu2,
      requirementText: obj1,
      prompt: `${ctx.app2}, để kết quả đo đạc và tính toán không bị sai lệch, người thực hiện cần đặc biệt lưu ý tránh sai sót phổ biến nào?`,
      acceptedAnswers: [mistake0, mistake1, summary0],
      points: 0.5,
      explanation: `Lưu ý kiểm soát sai sót thực nghiệm: ${mistake0}`,
      knowledgeSectionRef: 'commonMistakes',
    });

    // =========================================================================
    // CẶP 11: TỰ LUẬN (1,0 ĐIỂM - 4 BƯỚC 0,25Đ) — MỨC ĐỘ VẬN DỤNG (Cặp 1: Đề 01 & Đề 02)
    // =========================================================================
    const idEssay1 = `q-les-${lesson.id}-essay-1`;
    generated.push({
      id: idEssay1,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'essay',
      level: 'van_dung',
      indicator: indEssay1,
      requirementText: objLast,
      prompt: exampleObj
        ? `${ctx.exp1} Xét bài toán thực nghiệm cụ thể sau: ${exampleObj.problem} Hãy nêu cơ sở khoa học, viết biểu thức/quy luật áp dụng và trình bày các bước giải chi tiết.`
        : `${ctx.exp1} Bằng kiến thức Khoa học tự nhiên, hãy phân tích bản chất của hiện tượng trên, nêu quy luật chi phối và giải thích ứng dụng trong thực tiễn.`,
      sampleAnswer: exampleObj
        ? `${exampleObj.solution} (Cơ sở khoa học áp dụng: ${formulaObj ? formulaObj.formula : summary0}).`
        : `${concept0}\n${concept1}\nKết luận thực nghiệm: ${summary0}`,
      rubricSteps: [
        {
          id: `rub-${lesson.id}-1a`,
          description: `Tóm tắt đúng dữ kiện thực nghiệm và xác định đúng bản chất khoa học của hiện tượng.`,
          points: 0.25,
        },
        {
          id: `rub-${lesson.id}-1b`,
          description: formulaObj
            ? `Viết đúng biểu thức/phương trình/quy luật khoa học áp dụng: ${formulaObj.formula} (${formulaObj.units}).`
            : `Trình bày đúng nguyên lí, cơ chế khoa học của quá trình: ${concept1}`,
          points: 0.25,
        },
        {
          id: `rub-${lesson.id}-1c`,
          description: exampleObj
            ? `Thực hiện biến đổi, thay số hoặc lập luận khoa học chính xác: ${exampleObj.solution}`
            : `Phân tích mối liên hệ giữa các yếu tố và giải thích đúng tình huống thực tiễn.`,
          points: 0.25,
        },
        {
          id: `rub-${lesson.id}-1d`,
          description: `Kết luận đầy đủ, chính xác, ghi đúng đơn vị/ký hiệu chuẩn quốc tế SI (đảm bảo điều kiện: ${mistake0}).`,
          points: 0.25,
        },
      ],
      points: 1.0,
      explanation: exampleObj ? exampleObj.solution : summary0,
      knowledgeSectionRef: 'examples',
    });
    generated.push({
      id: `${idEssay1}-v2`,
      twinOf: idEssay1,
      isVariantTwin: true,
      chapterId: lesson.chapterId,
      lessonId: lesson.id,
      type: 'essay',
      level: 'van_dung',
      indicator: indEssay2,
      requirementText: objLast,
      prompt: `${ctx.exp2} Dựa vào quy luật "${formulaObj2 ? formulaObj2.name : 'khoa học tự nhiên'}", hãy phân tích cơ chế của quá trình, nêu biện pháp kiểm soát sai số thực nghiệm và giải quyết vấn đề sau: ${exampleObj2 ? exampleObj2.problem : summary1}`,
      sampleAnswer: `Cơ sở khoa học: ${concept1}\nBiểu thức/Quy luật: ${formulaObj2 ? formulaObj2.formula : summary0}\nLời giải & Phân tích chi tiết: ${exampleObj2 ? exampleObj2.solution : summary1}`,
      rubricSteps: [
        {
          id: `rub-${lesson.id}-2a`,
          description: `Nêu đúng cơ sở khoa học và xác định chính xác các đại lượng/yếu tố tham gia trong bối cảnh thực tiễn.`,
          points: 0.25,
        },
        {
          id: `rub-${lesson.id}-2b`,
          description: formulaObj2
            ? `Viết đúng công thức/phương trình/quy luật: ${formulaObj2.formula} (${formulaObj2.description}).`
            : `Giải thích đúng cơ chế trọng tâm của hiện tượng: ${summary0}`,
          points: 0.25,
        },
        {
          id: `rub-${lesson.id}-2c`,
          description: `Trình bày các bước tính toán/lập luận khoa học rõ ràng, chặt chẽ: ${exampleObj2 ? exampleObj2.solution : concept2}`,
          points: 0.25,
        },
        {
          id: `rub-${lesson.id}-2d`,
          description: `Nêu đúng điều kiện kiểm soát sai số thực nghiệm (${mistake1}) và kết luận chính xác kèm đơn vị chuẩn.`,
          points: 0.25,
        },
      ],
      points: 1.0,
      explanation: exampleObj2 ? exampleObj2.solution : summary1,
      knowledgeSectionRef: 'examples',
    });
  }

  return generated;
}

export const QUESTIONS_FULL_CURRICULUM_SEED = buildLessonCoverageQuestions();

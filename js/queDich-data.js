/**
 * ============================================================
 *  Sim Cài Vận – Dữ liệu Kinh Dịch & Bát Cực Linh Số
 *  Nguồn: Google Sheet TrungDo-SIM
 * ============================================================
 */

/* ---------- 1. Mapping số dư → Quái (Tiên Thiên Bát Quái) ----------
 * Dùng cho tính Quẻ Chủ / Quẻ Biến.
 * Khi chia tổng cho 8, số dư 1-7 ánh xạ trực tiếp; dư 0 = 8 = Khôn.
 */
const TIEN_THIEN_MAP = {
  1: { name: 'Càn',  element: 'Kim',  symbol: '☰', hao: [1,1,1] },
  2: { name: 'Đoài', element: 'Kim',  symbol: '☱', hao: [1,1,0] },
  3: { name: 'Ly',   element: 'Hỏa', symbol: '☲', hao: [1,0,1] },
  4: { name: 'Chấn', element: 'Mộc', symbol: '☳', hao: [0,0,1] },
  5: { name: 'Tốn',  element: 'Mộc', symbol: '☴', hao: [1,1,0] },
  6: { name: 'Khảm', element: 'Thủy', symbol: '☵', hao: [0,1,0] },
  7: { name: 'Cấn',  element: 'Thổ', symbol: '☶', hao: [1,0,0] },
  8: { name: 'Khôn', element: 'Thổ', symbol: '☷', hao: [0,0,0] },
};

// Reverse: tên quái → số thứ tự Tiên Thiên
const QUAI_NAME_TO_NUM = {};
for (const [k, v] of Object.entries(TIEN_THIEN_MAP)) {
  QUAI_NAME_TO_NUM[v.name] = Number(k);
}

/* ---------- 2. Mapping chữ số → Lạc Thư số ----------
 * Dùng cho phân tích từ trường (Bát Cực Linh Số / Du Niên).
 * Số 0 và 5 là đặc biệt, không nằm trong bảng Du Niên chuẩn.
 */
const LAC_THU_MAP = {
  1: { name: 'Khảm', element: 'Thủy' },
  2: { name: 'Khôn', element: 'Thổ'  },
  3: { name: 'Chấn', element: 'Mộc'  },
  4: { name: 'Tốn',  element: 'Mộc'  },
  6: { name: 'Càn',  element: 'Kim'  },
  7: { name: 'Đoài', element: 'Kim'  },
  8: { name: 'Cấn',  element: 'Thổ'  },
  9: { name: 'Ly',   element: 'Hỏa' },
};

/* ---------- 3. Bảng Du Niên (Bát Cực Linh Số) ----------
 * Grid 8x8: DU_NIEN_GRID[a][b] → mã từ trường
 * Mã: 1=Tuyệt Mệnh, 2=Phục Vị, 3=Họa Hại, 4=Ngũ Quỷ,
 *     6=Diên Niên, 7=Thiên Y, 8=Sinh Khí, 9=Lục Sát
 * (Số 5 không dùng trong code từ trường)
 */
const DU_NIEN_GRID = {
//       1  2  3  4  6  7  8  9
  1: { 1:2, 2:1, 3:7, 4:8, 6:9, 7:3, 8:4, 9:6 },
  2: { 1:1, 2:2, 3:3, 4:4, 6:6, 7:7, 8:8, 9:9 },
  3: { 1:7, 2:3, 3:2, 4:6, 6:4, 7:1, 8:9, 9:8 },
  4: { 1:8, 2:4, 3:6, 4:2, 6:3, 7:9, 8:1, 9:7 },
  6: { 1:9, 2:6, 3:4, 4:3, 6:2, 7:8, 8:7, 9:1 },
  7: { 1:3, 2:7, 3:1, 4:9, 6:8, 7:2, 8:6, 9:4 },
  8: { 1:4, 2:8, 3:9, 4:1, 6:7, 7:6, 8:2, 9:3 },
  9: { 1:6, 2:9, 3:8, 4:7, 6:1, 7:4, 8:3, 9:2 },
};

/* ---------- 4. Thông tin 8 từ trường ---------- */
const TU_TRUONG_INFO = {
  8: {
    name: 'Sinh Khí',
    type: 'cat',
    level: 'dai_cat',
    icon: '🌟',
    color: '#00e676',
    meaning: 'Tài lộc dồi dào, công danh, sức sống mãnh liệt. Quý nhân phù trợ, đi đâu cũng có hảo bằng hữu.',
    pairs: ['14','41','67','76','39','93','28','82'],
    details: {
      tinhCach: 'Lạc quan, an nhiên. Đôi khi thiếu chí tiến thủ nếu thiếu Diên Niên/Thiên Y đi kèm.',
      suNghiep: 'Quý nhân mang tiền tới (khi kết hợp Thiên Y). Giúp môi trường làm việc dễ chịu, giải tỏa áp lực.',
      canhBao: 'Sức khỏe chủ về tì vị, tiêu hóa, dạ dày. Dễ có tiểu nhân ngầm nếu dính số 0 (VD: 104).'
    }
  },
  7: {
    name: 'Thiên Y',
    type: 'cat',
    level: 'cat',
    icon: '💊',
    color: '#40c4ff',
    meaning: 'Bát phương tài (tiền đến từ mọi hướng). Đại diện cho Chính Tài, tình cảm chân thành.',
    pairs: ['13','31','68','86','49','94','27','72'],
    details: {
      tinhCach: 'Lương thiện, hào sảng, không so đo. Dễ bị lợi dụng hoặc lừa gạt tiền bạc nếu quá tin người.',
      suNghiep: 'Phù hợp mọi ngành nghề, đem lại thu nhập hợp pháp lớn. Rất cần Diên Niên chốt đuôi để giữ két sắt (VD: 1319).',
      canhBao: 'Tuyệt đối kỵ số 0 (tiền bị kẹt, nợ khó đòi, ngoại tình ẩn tàng). Chủ về huyết áp và tim mạch.'
    }
  },
  6: {
    name: 'Diên Niên',
    type: 'cat',
    level: 'cat',
    icon: '🤝',
    color: '#7c4dff',
    meaning: 'Hòa thuận, tình cảm, vững chắc, bản lĩnh. Cái khóa của két sắt (năng lực quản lý tài sản).',
    pairs: ['19','91','78','87','34','43','26','62'],
    details: {
      tinhCach: 'Lý trí cực cao, kiên định, kỷ luật. Đôi khi cứng nhắc, bảo thủ và nghiện việc (workaholic).',
      suNghiep: 'Từ trường hàng đầu để thăng quan tiến chức, là người đáng tin cậy gánh vác trách nhiệm lớn.',
      canhBao: 'Nữ giới không nên dùng đuôi 19/91 (lỗi Âm Dương, dễ cô phu, gánh vác phần nam giới). Chủ bệnh vai gáy, cột sống, mất ngủ.'
    }
  },
  2: {
    name: 'Phục Vị',
    type: 'cat',
    level: 'binh',
    icon: '☯',
    color: '#f0c040',
    meaning: 'Bình an, kiên định, tĩnh tại. Đóng vai trò tấm gương khuếch đại, kéo dài từ trường trước nó.',
    pairs: ['11','22','33','44','66','77','88','99'],
    details: {
      tinhCach: 'Ngọa hổ tàng long, nhẫn nại, cẩn trọng. Quá thận trọng đâm ra sợ thay đổi, thiếu quyết đoán.',
      suNghiep: 'Hợp công việc nghiên cứu, hành chính, duy trì sự ổn định. Tài lộc chậm nhưng chắc.',
      canhBao: 'Khóa và khuếch đại cái hung nếu đứng sau hung tinh. Suy nghĩ đa đoan dẫn tới stress ngầm, bệnh tim/não, hôn nhân tẻ nhạt.'
    }
  },
  1: {
    name: 'Tuyệt Mệnh',
    type: 'hung',
    level: 'dai_hung',
    icon: '💀',
    color: '#d50000',
    meaning: 'Liều lĩnh, phá tài, đầu tư mạo hiểm, dấn thân vì mục tiêu. Được ăn cả ngã về không.',
    pairs: ['12','21','69','96','48','84','37','73'],
    details: {
      tinhCach: 'Quyết đoán, quả cảm, nhạy bén cơ hội, tính bứt phá cao. Tuy nhiên rất cố chấp, nóng nảy, cái tôi lớn.',
      suNghiep: 'Đầu tư (chứng khoán, BĐS). Lấy công làm lãi. Đầu tư sinh lời nhưng nếu không có Diên Niên/Thiên Y sẽ trắng tay.',
      canhBao: 'Sát thủ số 1 gây Họa huyết quang, tai nạn giao thông, đổ máu. Chủ về hệ sinh dục, thận. Gây xung đột và tan vỡ gia đình nhanh chóng.'
    }
  },
  4: {
    name: 'Ngũ Quỷ',
    type: 'hung',
    level: 'dai_hung',
    icon: '👻',
    color: '#ff1744',
    meaning: 'Tốc độ tư duy, biến hóa, ý tưởng đột biến. Linh hoạt nhạy bén nhưng hay sinh đa nghi.',
    pairs: ['18','81','79','97','36','63','24','42'],
    details: {
      tinhCach: 'Bậc thầy ý tưởng, thông minh khác thường, không đi theo lối mòn. Điểm yếu là đa nghi, sáng nắng chiều mưa, khó tin người.',
      suNghiep: 'Hợp công việc chất xám cao (thiết kế, công nghệ) hoặc tâm linh, huyền học. Kiếm được Ám tài chớp nhoáng nhưng dễ đi.',
      canhBao: 'Dễ đột quỵ, bệnh tim mạch lạ, tai nạn bất ngờ không định trước. Hôn nhân suy sụp do suy nghĩ bất định. Rất cần Diên Niên để chế hóa.'
    }
  },
  9: {
    name: 'Lục Sát',
    type: 'hung',
    level: 'hung',
    icon: '💔',
    color: '#ff6d00',
    meaning: 'Đào hoa sát, rắc rối tình cảm. Tinh tế, mị lực giao tiếp lớn, có tính thẩm mỹ cao.',
    pairs: ['16','61','47','74','38','83','29','92'],
    details: {
      tinhCach: 'Tâm hồn nghệ sĩ, gu thẩm mỹ tuyệt vời, khéo léo bề ngoài. Tựu trung đa sầu đa cảm, tâm tính yếu đuối thiếu quyết đoán.',
      suNghiep: 'Ngành nghề phái đẹp (thời trang, làm đẹp, khách sạn). Tán tài do xúc cảm tình cảm, chú trọng ngoại hình.',
      canhBao: 'Sát thủ hạnh phúc gia đình (chủ về người thứ ba, không chung thủy). Chủ bệnh da liễu, tâm lý, sinh dục, trầm cảm. Cần Diên Niên dập tắt sự ủy mị.'
    }
  },
  3: {
    name: 'Họa Hại',
    type: 'hung',
    level: 'hung',
    icon: '⚠',
    color: '#ff9100',
    meaning: 'Đại diện cho lời nói, sự bảo vệ tự tôn cá nhân. Có khẩu tài thuyết phục nhưng cũng là trung tâm thị phi.',
    pairs: ['17','71','89','98','46','64','23','32'],
    details: {
      tinhCach: 'Lưỡi không xương, hoạt ngôn, logic sắc bén. Yếu điểm lớn là hiếu thắng, sĩ diện bốc đồng, khẩu nghiệp.',
      suNghiep: 'Khởi nghiệp từ nghề nói (Diễn giả, Giáo viên, Khám dư, Sale). Mở miệng đẻ ra tiền nếu bộ số tốt.',
      canhBao: 'Bệnh hệ hô hấp (phổi, họng), suy giảm năng lượng vì nói nhiều. Cần tránh thị phi, tranh chấp pháp lý. Khắc chế triệt để bằng Sinh Khí.'
    }
  }
};

/* ---------- 5. Mô tả 8 Quái (từ Trang tính9) ---------- */
const QUAI_DESCRIPTIONS = {
  Khôn: {
    number: 2,
    uu: 'Có sức chịu đựng, nghị lực, biết đợi cơ hội để 1 phát thành công. Có năng lực tiềm ẩn, tính tình hiền hòa.',
    nhuoc: 'Đa nghi, không có cảm giác an toàn, bảo thủ, nói năng hay lặp đi lặp lại vấn đề. Thích cầm tiền lương cố định, vì nghi ngờ mà không đầu tư làm ăn. Phù hợp với công chức làm công ăn lương. Dễ mắc bệnh dạ dày, gan mật'
  },
  Cấn: {
    number: 8,
    uu: 'Tâm bình an, vững chân trước những biến động bất ngờ',
    nhuoc: 'Vì tâm lý vạn sự tùy duyên, ngại tiến thủ vì ưa an nhiên, không so đo, thích trợ giúp người khác, nhiều khi bao đồng. Có quý nhân mang tiền đến hoặc có tiền ngoài ý muốn nhưng khó giữ được tiền.'
  },
  Đoài: {
    number: 7,
    uu: 'Thông minh, thiện lương, lòng dạ rộng lượng, dễ thành đạt, Dễ gặp quý nhân, dễ làm chủ hoặc trợ thủ đắc lực. Đây là năng lượng của đại tài tinh.',
    nhuoc: 'Quá thiện lương, hào phóng nên dễ bị gạt'
  },
  Càn: {
    number: 6,
    uu: 'Có tài lãnh đạo, quản trị, có hoạch định trong công việc. Sống thọ, không chịu ngồi yên trước khó khăn, thích hoạt động, ưa hành động.',
    nhuoc: 'Không dễ tiếp thu ý kiến của cấp dưới, không quan tâm đến cảm xúc của người khác trong câu nói. Muốn người khác phải phục. Can đảm, tuy vất vả kiếm tiền nhưng lại không giữ được tiền, muốn người khác phải phục tùng. Riêng cặp 191,787 không nên dùng cho nữ vì tính nết quá cương bạo, dễ khắc phu.'
  },
  Khảm: {
    number: 1,
    uu: 'Phản ứng nhanh nhạy, tâm địa hiền lương nên dễ tin bạn bè.',
  'Ly': {
    number: 9,
    uu: 'Tính cảm phong phú, biết cách thu hút người khác giỏi, có mắt thẩm mỹ, biết ăn mặc.',
    nhuoc: 'Đôi khi lụy tình, hôn nhân dễ đổ vỡ, phù hợp với nghề thiết kế thời trang. Do dự dễ đánh mất cơ hội. Không giữ được tiền.',
  },
  'Chấn': {
    number: 3,
    uu: 'Mồm miệng đỡ chân tay, nếu là người dành đa thì ngoa ngôn, biết mời chào, là những người biết dùng miệng lưỡi kiếm ăn.',
    nhuoc: 'Tính khí nóng nảy, dễ bốc đồng. Vì mồm miệng mà cũng dễ mất bạn, mất quan hệ. Sĩ diện, hay phàn nàn. Tài bạch khó giữ, mạnh miệng mà nhiều khi chỉ quá tay. Dễ mắc bệnh đường ruột, tim mạch. Hiếu thắng, sức đề kháng yếu.',
  },
  'Tốn': {
    number: 4,
    uu: 'Tài hoa, có lý luận, phản ứng mau lẹ. Thường làm những việc trái nghịch hoàn cảnh mà người khác khó có thể tưởng tượng ra.',
    nhuoc: 'Không ổn định, không an phận, dễ mang họa sát thân, chiêu thị phi. Tính đôi khi lười nhác, làm việc đầu voi đuôi chuột. Nhiều ý đồ không tốt, hay nghi ngờ, đa nghi, tiền nhanh có nhanh đi. Không có quý nhân, phù hợp với tăng đạo, dễ gần tầng giới huyền môn, tin vào tâm linh. Đi cùng Tuyệt Mệnh dễ mắc ung thư.',
  },
};

/* ---------- 6. Bảng biến quái khi hào động ----------
 * BIEN_QUAI[quaiGoc][haoDong] → quái mới
 * haoDong: 1, 2, 3 (áp dụng cho 3 hào của 1 quái đơn)
 */
const BIEN_QUAI = {
  'Càn':  { 1: 'Tốn',  2: 'Ly',   3: 'Đoài' },
  'Đoài': { 1: 'Khảm', 2: 'Chấn', 3: 'Càn'  },
  'Ly':   { 1: 'Cấn',  2: 'Càn',  3: 'Chấn' },
  'Chấn': { 1: 'Khôn', 2: 'Đoài', 3: 'Ly'   },
  'Tốn':  { 1: 'Càn',  2: 'Cấn',  3: 'Khảm' },
  'Khảm': { 1: 'Đoài', 2: 'Khôn', 3: 'Tốn'  },
  'Cấn':  { 1: 'Ly',   2: 'Tốn',  3: 'Khôn' },
  'Khôn': { 1: 'Chấn', 2: 'Khảm', 3: 'Cấn'  },
};

/* ---------- 7. Bảng 64 Quẻ Dịch ----------
 * Key: "ngoaiNum_noiNum" (theo Tiên Thiên: 1=Càn...8=Khôn)
 */
const QUE_64 = {
  '1_1': { stt: 1, name: 'Thuần Càn', ngoai: 'Càn', noi: 'Càn', unicode: '䷀', meaning: 'Trời trên trời, cương kiện, tự cường không ngừng. Quyền lực tối thượng.', hao_text: ["Tử Tôn Tý Thủy", "Thê Tài Dần Mộc", "Phụ Mẫu Thìn Thổ (Ứng)", "Quan Quỷ Ngọ Hỏa", "Huynh Đệ Thân Kim", "Phụ Mẫu Tuất Thổ (Thế)"] },
  '8_8': { stt: 2, name: 'Thuần Khôn', ngoai: 'Khôn', noi: 'Khôn', unicode: '䷁', meaning: 'Đất thuận theo trời, đức dày chở muôn vật. Nhu thuận, bao dung.', hao_text: ["- Huynh Đệ Mùi Thổ", "- Phụ Mẫu Tỵ Hỏa", "- Quan Quỷ Mão Mộc (Ứng)", "- Huynh Đệ Sửu Thổ", "- Thê Tài Hợi Thủy", "- Tử Tôn Dậu Kim (Thế)"] },
  '6_4': { stt: 3, name: 'Thủy Lôi Truân', ngoai: 'Khảm', noi: 'Chấn', unicode: '䷂', meaning: 'Khó khăn ban đầu, cần kiên nhẫn vượt qua giai đoạn khởi nghiệp.', hao_text: ["Huynh Đệ Tý Thủy", "- Tử Tôn Dần Mộc (Thế)", "- Quan Quỷ Thìn Thổ", "- Phụ Mẫu Thân Kim", "Quan Quỷ Tuất Thổ (Ứng)", "- Huynh Đệ Tý Thủy"] },
  '7_6': { stt: 4, name: 'Sơn Thủy Mông', ngoai: 'Cấn', noi: 'Khảm', unicode: '䷃', meaning: 'Non nớt, cần học hỏi. Gặp thầy tốt, biết tiếp thu sẽ thành công.', hao_text: ["- Phu Mẫu Dần Mộc (Ứng)", "Tử Tôn Thìn Thổ", "- Huynh Đệ Ngọ Hỏa", "- Tử Tôn Tuất Thổ (Thế)", "- Quan Quỷ Tý Thủy", "Phụ Mẫu Dần Mộc"] },
  '6_1': { stt: 5, name: 'Thủy Thiên Nhu', ngoai: 'Khảm', noi: 'Càn', unicode: '䷄', meaning: 'Chờ đợi đúng thời cơ, kiên nhẫn sẽ đạt được mục tiêu.', hao_text: ["Thê Tài Tý Thủy (Ứng)", "Quan Quỷ Dần", "Huynh Đệ Thìn", "- Tử Tôn Thân Thế (Thế)", "Huynh Đệ Tuất", "- Thê Tài Tý Thủy"] },
  '1_6': { stt: 6, name: 'Thiên Thủy Tụng', ngoai: 'Càn', noi: 'Khảm', unicode: '䷅', meaning: 'Tranh chấp, kiện tụng. Nên hòa giải, tránh đối đầu.', hao_text: ["- Phụ Mẫu Dần Mộc (Ứng)", "Tử Tôn Thìn Thổ", "- Huynh Đệ Ngọ Hỏa", "Huynh Đệ Ngọ Hỏa (Thế)", "Thê Tài Thân Kim", "Tử Tôn Tuất Thổ"] },
  '8_6': { stt: 7, name: 'Địa Thủy Sư', ngoai: 'Khôn', noi: 'Khảm', unicode: '䷆', meaning: 'Quân đội, lãnh đạo. Cần kỷ luật và chiến lược rõ ràng.', hao_text: ["- Tử Tôn Thân Kim", "Quan Quỷ Thìn Thổ", "- Thê Tài Ngọ Hỏa (Thế)", "- Quan Quỷ Sửu Thổ", "- Huynh Đệ Hợi Thủy", "- Phụ Mẫu Dậu Kim (Ứng)"] },
  '6_8': { stt: 8, name: 'Thủy Địa Tỷ', ngoai: 'Khảm', noi: 'Khôn', unicode: '䷇', meaning: 'Thân cận, đoàn kết. Hợp tác mang lại lợi ích chung.', hao_text: ["- Huynh Đệ Mùi Thổ", "- Phụ Mẫu Tỵ Hỏa", "- Quan Quỷ Mão Mộc (Thế)", "- Tử Tôn Thân Kim", "Huynh Đệ Tuất Thổ", "- Thê Tài Tý Thuỷ (Ứng)"] },
  '5_1': { stt: 9, name: 'Phong Thiên Tiểu Súc', ngoai: 'Tốn', noi: 'Càn', unicode: '䷈', meaning: 'Tích lũy nhỏ. Kiên trì từ việc nhỏ sẽ tạo nên thành quả lớn.', hao_text: ["Phụ Mẫu Tý Thủy (Thế)", "Huynh Đệ Dần Mộc", "Thê Tài Thìn Thổ", "- Thê Tài Mùi Thổ (Ứng)", "Tử Tôn Tỵ Hỏa", "Huynh Đệ Mão Mộc"] },
  '1_2': { stt: 10, name: 'Thiên Trạch Lý', ngoai: 'Càn', noi: 'Đoài', unicode: '䷉', meaning: 'Đạp lên đuôi hổ, lễ nghi, cẩn thận. Biết phép tắc sẽ an toàn.', hao_text: ["Phụ Mẫu Tỵ Hỏa", "Quan Quỷ Mão Mộc (Ứng)", "- Huynh Đệ Sửu Thổ", "Phụ Mẫu Ngọ Hỏa", "Tử Tôn Thân Kim (Thế)", "Huynh Đệ Tuất Thổ"] },
  '8_1': { stt: 11, name: 'Địa Thiên Thái', ngoai: 'Khôn', noi: 'Càn', unicode: '䷊', meaning: 'Thông suốt, hanh thông. Trời đất giao hòa, vạn sự thuận lợi.', hao_text: ["Thê Tài Tý Thủy", "Quan Quỷ Dần Mộc", "Huynh Đệ Thìn Thổ (Thế)", "- Huynh Đệ Sửu Thổ", "- Thê Tài Hợi Thủy", "- Tử Tôn Dậu Kim (Ứng)"] },
  '1_8': { stt: 12, name: 'Thiên Địa Bĩ', ngoai: 'Càn', noi: 'Khôn', unicode: '䷋', meaning: 'Bế tắc, trì trệ. Cần ẩn nhẫn chờ thời, giữ đức.', hao_text: ["- Phụ Mẫu Mùi Thổ", "- Quan Quỷ Tỵ Hỏa", "- Thê Tài Mão Mộc (Thế)", "Quan Quỷ Ngọ Hỏa", "Huynh Đệ Thân Kim", "Phụ Mẫu Tuất Thổ (Ứng)"] },
  '1_3': { stt: 13, name: 'Thiên Hỏa Đồng Nhân', ngoai: 'Càn', noi: 'Ly', unicode: '䷌', meaning: 'Đồng lòng, hợp tác. Cùng chí hướng sẽ thành công lớn.', hao_text: ["Phụ Mẫu Mão Mộc", "- Tử Tôn Sửu Thổ", "Quan Quỷ Hợi Thủy (Thế)", "Huynh Đệ Ngọ Hỏa", "Thê Tài Thân Kim", "Tử Tôn Tuất Thổ (Ứng)"] },
  '3_1': { stt: 14, name: 'Hỏa Thiên Đại Hữu', ngoai: 'Ly', noi: 'Càn', unicode: '䷍', meaning: 'Sở hữu lớn, giàu có. Biết khiêm tốn sẽ giữ được phúc.', hao_text: ["Tử Tôn Tý Thủy", "Thê Tài Dần Mộc", "Phụ Mẫu Thìn Thổ (Thế)", "Huynh Đệ Dậu Kim", "- Phụ Mẫu Mùi Thổ", "Quan Quỷ Tỵ Hỏa (Ứng)"] },
  '8_7': { stt: 15, name: 'Địa Sơn Khiêm', ngoai: 'Khôn', noi: 'Cấn', unicode: '䷎', meaning: 'Khiêm nhường, đức cao. Người khiêm tốn sẽ được tôn trọng.', hao_text: ["- Phụ Mẫu Thìn Thổ", "- Quan Quỷ Ngọ Hỏa (Ứng)", "Huynh Đệ Thân Kim", "- Phụ Mẫu Sửu Thổ", "- Tử Tôn Hợi Thủy (Thế)", "- Huynh Đệ Dậu Kim"] },
  '4_8': { stt: 16, name: 'Lôi Địa Dự', ngoai: 'Chấn', noi: 'Khôn', unicode: '䷏', meaning: 'Vui vẻ, hòa thuận. Biết chuẩn bị trước sẽ thành công.', hao_text: ["Thê Tài Mùi Thổ (Thế)", "- Tử Tôn Tỵ Hỏa", "- Huynh Đệ Mão Mộc", "Tử Tôn Ngọ Hỏa (Ứng)", "- Quan Quỷ Thân Kim", "- Thê Tài Tuất Thổ"] },
  '2_4': { stt: 17, name: 'Trạch Lôi Tùy', ngoai: 'Đoài', noi: 'Chấn', unicode: '䷐', meaning: 'Theo thời, thích ứng. Biết lắng nghe sẽ được ủng hộ.', hao_text: ["Phụ Mẫu Tý Thủy", "- Huynh Đệ Dân Mộc", "- Thê Tài Thìn Thổ (Thế)", "Phụ Mẫu Hợi Thủy", "Quan Quỷ Dâu Kim", "- Thê Tài Mùi Thổ (Ứng)"] },
  '7_5': { stt: 18, name: 'Sơn Phong Cổ', ngoai: 'Cấn', noi: 'Tốn', unicode: '䷑', meaning: 'Sửa chữa sai lầm, cải cách. Dũng cảm đổi mới.', hao_text: ["- Thê Tài Sửu Thổ", "Phụ Mẫu Hợi Thủy", "Quan Quỷ Dậu Kim (Thế)", "- Thê Tài Tuất Thổ", "- Phụ Mẫu Tý Thủy", "Huynh Đệ Dần Mộc (Ứng)"] },
  '8_2': { stt: 19, name: 'Địa Trạch Lâm', ngoai: 'Khôn', noi: 'Đoài', unicode: '䷒', meaning: 'Đến gần, giám sát. Thời cơ thuận lợi, nên nắm bắt.', hao_text: ["Phụ mẫu Tỵ Hỏa", "- Quan Quỷ Mão Mộc (Thế)", "- Huynh Đệ Sửu Thổ", "- Huynh Đệ Sửu Thổ", "- Thê Tài Hợi Thủy (Ứng)", "- Tử Tôn Dậu Kim"] },
  '5_8': { stt: 20, name: 'Phong Địa Quan', ngoai: 'Tốn', noi: 'Khôn', unicode: '䷓', meaning: 'Quan sát, chiêm nghiệm. Nhìn xa trông rộng, làm gương.', hao_text: ["- Phụ Mẫu Mùi Thổ (Ứng)", "- Quan Quỷ Tỵ Hỏa", "- Thê Tài Mão Mộc", "- Phụ Mẫu Mùi Thổ (Thế)", "Quan Quỷ Tỵ Hỏa", "Thê Tài Mão Mộc"] },
  '3_4': { stt: 21, name: 'Hỏa Lôi Phệ Hạp', ngoai: 'Ly', noi: 'Chấn', unicode: '䷔', meaning: 'Xử lý quyết đoán, phán xét công minh.', hao_text: ["Phụ Mẫu Tý Thủy", "- Huynh Đệ Dần Mộc (Ứng)", "- Thê Tài Thìn Thổ", "Quan Quỷ Dậu Kim", "- Thê Tài Mùi Thổ (Thế)", "Tử Tôn Tỵ Hỏa"] },
  '7_3': { stt: 22, name: 'Sơn Hỏa Bí', ngoai: 'Cấn', noi: 'Ly', unicode: '䷕', meaning: 'Trang sức, vẻ đẹp bên ngoài. Cần chú trọng nội dung bên trong.', hao_text: ["Quan Quỷ Mão Mộc (Thế)", "- Huynh Đệ Sửu Thổ", "Thê Tài Hợi Thủy", "- Huynh Đệ Tuất Thổ (Ứng)", "- Thê Tài Tý Thủy", "Quan Quỷ Dần Mộc"] },
  '7_8': { stt: 23, name: 'Sơn Địa Bác', ngoai: 'Cấn', noi: 'Khôn', unicode: '䷖', meaning: 'Bóc lột, sụp đổ dần. Cần ẩn nhẫn, không nên hành động.', hao_text: ["- Phụ Mẫu Mùi Thổ", "- Quan Quỷ Tỵ Hỏa (Ứng)", "- Thê Tài Mão Mộc", "- Phụ Mẫu Tuất Thổ", "- Tử Tôn Tý Thủy (Thế)", "Thê Tài Dần Mộc"] },
  '8_4': { stt: 24, name: 'Địa Lôi Phục', ngoai: 'Khôn', noi: 'Chấn', unicode: '䷗', meaning: 'Trở lại, phục hồi. Vận may đang quay trở lại.', hao_text: ["Thê Tài Tý Thủy (Thế)", "- Quan Quỷ Dần Mộc", "- Huynh Đệ Thìn Thổ", "- Huynh Đệ Sửu Thổ (Ứng)", "- Thê Tài Hợi Thủy", "- Tử Tôn Dậu Kim"] },
  '1_4': { stt: 25, name: 'Thiên Lôi Vô Vọng', ngoai: 'Càn', noi: 'Chấn', unicode: '䷘', meaning: 'Không vọng tưởng, thuận tự nhiên. Thành thật sẽ hanh thông.', hao_text: ["Phụ Mẫu Tý Thủy (Ứng)", "- Huynh Đệ Dần Mộc", "- Thê Tài Thìn Thổ", "Tử Tôn Ngọ Hỏa (Thế)", "Quan Quỷ Thân Kim", "Thê Tài Tuất Thổ"] },
  '7_1': { stt: 26, name: 'Sơn Thiên Đại Súc', ngoai: 'Cấn', noi: 'Càn', unicode: '䷙', meaning: 'Tích lũy lớn, nuôi dưỡng đức. Kiên trì tích góp sẽ giàu có.', hao_text: ["Thê Tài Tý Thủy", "Quan Quỷ Dần Mộc (Thế)", "Huynh Đệ Thìn Thổ", "- Huynh Đệ Tuất Thổ", "- Thê Tài Tý Thủy (Ứng)", "Quan Quỷ Dần Mộc"] },
  '7_4': { stt: 27, name: 'Sơn Lôi Di', ngoai: 'Cấn', noi: 'Chấn', unicode: '䷚', meaning: 'Nuôi dưỡng, ăn uống. Biết tiết chế sẽ khỏe mạnh.', hao_text: ["Phụ Mẫu Tý Thủy (Ứng)", "- Huynh Đệ Dần Mộc", "- Thê Tài Thìn Thổ", "- Thê Tài Tuất Thổ (Thế)", "- Phụ Mẫu Tý Thủy", "Huynh Đệ Dần Mộc"] },
  '2_5': { stt: 28, name: 'Trạch Phong Đại Quá', ngoai: 'Đoài', noi: 'Tốn', unicode: '䷛', meaning: 'Quá mức, cần cân bằng. Dũng cảm đối mặt thử thách.', hao_text: ["- Thê Tài Sửu Thổ (Ứng)", "Phụ Mẫu Hợi Thủy", "Quan Quỷ Dậu Kim", "Phụ Mẫu Hợi Thủy (Thế)", "Quan Quỷ Dậu Kim", "- Thê Tài Mùi Thổ"] },
  '6_6': { stt: 29, name: 'Thuần Khảm', ngoai: 'Khảm', noi: 'Khảm', unicode: '䷜', meaning: 'Hiểm trở liên tiếp. Kiên tâm vượt khó, giữ tín sẽ qua.', hao_text: ["- Tử Tôn Dần Mộc", "Quan Quỷ Thìn Thổ", "- Thê Tài Ngọ Hỏa (Ứng)", "- Phụ Mẫu Thân Kim", "Quan Quỷ Tuất Thổ", "- Huynh Đệ Tý Thủy (Thế)"] },
  '3_3': { stt: 30, name: 'Thuần Ly', ngoai: 'Ly', noi: 'Ly', unicode: '䷝', meaning: 'Sáng rực, gắn bó. Ánh sáng soi đường, nên nương tựa chính nghĩa.', hao_text: ["Phụ Mẫu Mão Mộc", "- Tử Tôn Sửu Thổ", "Quan Quỷ Hợi Thủy (Ứng)", "Thê Tài Dậu Kim", "- Tử Tôn Mùi Thổ", "Huynh Đệ Tỵ Hỏa (Thế)"] },
  '2_7': { stt: 31, name: 'Trạch Sơn Hàm', ngoai: 'Đoài', noi: 'Cấn', unicode: '䷞', meaning: 'Cảm ứng, tương tác. Mối quan hệ tốt đẹp, nhân duyên.', hao_text: ["- Phụ Mẫu Thìn Thổ", "- Quan Quỷ Ngọ Hỏa", "Huynh Đệ Thân Kim (Thế)", "Tử Tôn Hợi Thủy", "Huynh Đệ Dâu Kim", "- Phụ Mẫu Mùi Thổ (Ứng)"] },
  '4_5': { stt: 32, name: 'Lôi Phong Hằng', ngoai: 'Chấn', noi: 'Tốn', unicode: '䷟', meaning: 'Bền bỉ, kiên trì. Giữ đạo lâu dài sẽ hanh thông.', hao_text: ["- Thê Tài Sửu Thổ", "Phụ Mẫu Hợi Thủy", "Quan Quỷ Dậu Kim (Thế)", "Tử Tôn Ngọ Hỏa", "- Quan Quỷ Thân Kim", "- Thê Tài Tuất Thổ (Ứng)"] },
  '1_7': { stt: 33, name: 'Thiên Sơn Độn', ngoai: 'Càn', noi: 'Cấn', unicode: '䷠', meaning: 'Rút lui đúng lúc, ẩn mình. Biết lui sẽ tiến xa hơn.', hao_text: ["- Phụ Mẫu Thìn Thổ", "- Quan Quỷ Ngọ Hỏa (Thế)", "Huynh Đệ Thân Kim", "Quan Quỷ Ngọ Hỏa", "Huynh Đệ Thân Kim (Ứng)", "Phụ Mẫu Tuất Thổ"] },
  '4_1': { stt: 34, name: 'Lôi Thiên Đại Tráng', ngoai: 'Chấn', noi: 'Càn', unicode: '䷡', meaning: 'Mạnh mẽ vĩ đại. Dùng sức mạnh đúng đắn, giữ lễ nghĩa.', hao_text: ["Thê Tài Tý Thủy (Ứng)", "Quan Quỷ Dần Mộc", "Huynh Đệ Thìn Thổ", "Phụ Mẫu Ngọ Hỏa (Thế)", "- Tử Tôn Thân Kim", "- Huynh Đệ Tuất"] },
  '3_8': { stt: 35, name: 'Hỏa Địa Tấn', ngoai: 'Ly', noi: 'Khôn', unicode: '䷢', meaning: 'Tiến bước, thăng tiến. Ánh sáng chiếu rọi, sự nghiệp phát.', hao_text: ["- Phụ Mẫu Mùi Thổ (Ứng)", "- Quan Quỷ Tỵ Hỏa", "- Thê Tài Mão Mộc", "Huynh Đệ Dậu Kim (Thế)", "- Phụ Mẫu Mùi Thổ", "Quan Quỷ Tỵ Hỏa"] },
  '8_3': { stt: 36, name: 'Địa Hỏa Minh Di', ngoai: 'Khôn', noi: 'Ly', unicode: '䷣', meaning: 'Ánh sáng bị che khuất. Ẩn nhẫn, giữ sáng bên trong.', hao_text: ["Tử Tôn Mão Mộc (Ứng)", "- Quan Quỷ Sửu Thổ", "Huynh Đệ Hợi Thủy", "- Quan Quỷ Sửu Thổ (Thế)", "- Huynh Đệ Hợi Thủy", "- Phụ Mẫu Dậu Kim"] },
  '5_3': { stt: 37, name: 'Phong Hỏa Gia Nhân', ngoai: 'Tốn', noi: 'Ly', unicode: '䷤', meaning: 'Gia đình, nề nếp. Giữ gia phong, lo cho gia đạo.', hao_text: ["Huynh Đệ Mão Mộc", "- Thê Tài Sửu Thổ (Thế)", "Phụ Mẫu Hợi Thủy", "- Thê Tài Mùi Thổ", "Tử Tôn Tỵ Hỏa (Ứng)", "Huynh Đệ Mão Mộc"] },
  '3_2': { stt: 38, name: 'Hỏa Trạch Khuê', ngoai: 'Ly', noi: 'Đoài', unicode: '䷥', meaning: 'Trái ngược, bất đồng. Tìm điểm chung trong khác biệt.', hao_text: ["Phụ Mẫu Tỵ Hỏa (Ứng)", "Quan Quỷ Mão Mộc", "- Huynh Đệ Sửu Thổ", "Tử Tôn Dậu Kim (Thế)", "- Huynh Đệ Mùi Thổ", "Phụ Mẫu Tỵ Hoả"] },
  '6_7': { stt: 39, name: 'Thủy Sơn Kiển', ngoai: 'Khảm', noi: 'Cấn', unicode: '䷦', meaning: 'Khó khăn, trở ngại. Cần hợp tác, tìm người giúp đỡ.', hao_text: ["- Phụ Mẫu Thìn Thổ (Ứng)", "- Quan Quỷ Ngọ Hỏa", "Huynh Đệ Thân Kim", "- Huynh Đệ Thân Kim (Thế)", "Phụ Mẫu Tuất Thổ", "- Tử Tôn Tý Thủy"] },
  '4_6': { stt: 40, name: 'Lôi Thủy Giải', ngoai: 'Chấn', noi: 'Khảm', unicode: '䷧', meaning: 'Giải thoát, tháo gỡ. Vấn đề được giải quyết, nên hành động nhanh.', hao_text: ["- Huynh Đệ Dần Mộc", "Thê Tài Thìn Thổ (Thế)", "- Tử Tôn Ngọ Hỏa", "Tử Tôn Ngọ Hỏa", "- Quan Quỷ Thân Kim (Ứng)", "- Thê Tài Tuất Thổ"] },
  '7_2': { stt: 41, name: 'Sơn Trạch Tổn', ngoai: 'Cấn', noi: 'Đoài', unicode: '䷨', meaning: 'Giảm bớt, hy sinh. Bớt phần mình giúp người, phúc lớn.', hao_text: ["Phụ Mẫu Tỵ Hỏa", "Quan Quỷ Mão Mộc", "- Huynh Đệ Sửu Thổ (Thế)", "- Huynh Đệ Tuất Thổ", "- Thê Tài Tý Thủy", "Quan Quỷ Dần Mộc (Ứng)"] },
  '5_4': { stt: 42, name: 'Phong Lôi Ích', ngoai: 'Tốn', noi: 'Chấn', unicode: '䷩', meaning: 'Tăng thêm, lợi ích. Thời cơ tốt để phát triển mạnh.', hao_text: ["Phụ Mẫu Tý Thủy", "- Huynh Đệ Dần Mộc", "- Thê Tài Thìn Thổ (Thế)", "- Thê Tài Mùi Thổ", "Tử Tôn Tỵ Hỏa", "Huynh Đệ Mão Mộc (Ứng)"] },
  '2_1': { stt: 43, name: 'Trạch Thiên Quải', ngoai: 'Đoài', noi: 'Càn', unicode: '䷪', meaning: 'Quyết đoán, cắt bỏ. Loại trừ tiểu nhân, giữ chính đạo.', hao_text: ["Thê Tài Tý Thủy", "Quan Quỷ Dần Mộc (Ứng)", "Huynh Đệ Thìn Thổ", "Thê Tài Hợi Thủy", "Tử Tôn Dậu Kim (Thế)", "- Huynh Đệ Mùi Thổ"] },
  '1_5': { stt: 44, name: 'Thiên Phong Cấu', ngoai: 'Càn', noi: 'Tốn', unicode: '䷫', meaning: 'Gặp gỡ bất ngờ. Cẩn thận với mối quan hệ mới.', hao_text: ["- Phụ Mẫu Sữu Thổ (Thế)", "Tử Tôn Hợi Thủy", "Huynh Đệ Dậu Kim", "Quan Quỷ Ngọ Hỏa (Ứng)", "Huynh Đệ Thân Kim", "Phụ Mẫu Tuât Thổ"] },
  '2_8': { stt: 45, name: 'Trạch Địa Tụy', ngoai: 'Đoài', noi: 'Khôn', unicode: '䷬', meaning: 'Tụ họp, đoàn tụ. Quy tụ nhân tài, phòng bị chu đáo.', hao_text: ["- Phụ Mẫu Mùi Thổ", "- Quan Quỷ Tỵ Hỏa (Thế)", "- Thê Tài Mão Mộc", "Huynh Đệ Hợi Thủy", "Huynh Đệ Dậu Kim (Ứng)", "- Phụ Mẫu Mùi Thổ"] },
  '8_5': { stt: 46, name: 'Địa Phong Thăng', ngoai: 'Khôn', noi: 'Tốn', unicode: '䷭', meaning: 'Thăng tiến, phát triển. Nỗ lực đúng hướng sẽ được nâng đỡ.', hao_text: ["- Thê Tài Sửu Thổ (Ứng)", "Phụ Mẫu Hợi Thủy", "Quan Quỷ Dậu Kim", "- Thê Tài Sửu Thổ (Thế)", "- Phụ Mẫu Hợi Thủy", "- Quan Quỷ Dậu Kim"] },
  '2_6': { stt: 47, name: 'Trạch Thủy Khốn', ngoai: 'Đoài', noi: 'Khảm', unicode: '䷮', meaning: 'Khốn khó, cùng quẫn. Giữ vững ý chí, không bỏ cuộc.', hao_text: ["- Thê Tài Dần Mộc (Thế)", "Phụ Mẫu Thìn Thổ", "- Quan Quỷ Ngọ Hỏa", "Tử Tôn Hợi Thủy (Ứng)", "Huynh Đệ Dậu Kim", "- Phụ Mẫu Mùi Thổ"] },
  '6_5': { stt: 48, name: 'Thủy Phong Tỉnh', ngoai: 'Khảm', noi: 'Tốn', unicode: '䷯', meaning: 'Giếng nước, nguồn cội. Duy trì giá trị cốt lõi, không đổi.', hao_text: ["- Thê Tài Sửu Thổ", "Phụ Mẫu Hợi Thủy (Ứng)", "Quan Quỷ Dậu Kim", "- Quan Quỷ Thân Kim", "Thê Tài Tuất Thổ (Thế)", "- Phụ Mẫu Tý Thủy"] },
  '2_3': { stt: 49, name: 'Trạch Hỏa Cách', ngoai: 'Đoài', noi: 'Ly', unicode: '䷰', meaning: 'Cách mạng, đổi mới. Thay đổi triệt để đúng thời điểm.', hao_text: ["Tử Tôn Mão Mộc (Ứng)", "- Quan Quỷ Sửu Thổ", "Huynh Đệ Hợi Thủy", "Huynh Đệ Hợi Thủy (Thế)", "Phụ Mẫu Dậu Kim", "- Quan Quỷ Mùi Thổ"] },
  '3_5': { stt: 50, name: 'Hỏa Phong Đỉnh', ngoai: 'Ly', noi: 'Tốn', unicode: '䷱', meaning: 'Vạc lớn, sáng tạo mới. Đổi mới thành công, phú quý.', hao_text: ["- Tử Tôn Sửu Thổ", "Quan Quỷ Hợi Thủy (Thế)", "Thê Tài Dậu Kim", "Thê Tài Dậu Kim", "- Tử Mẫu Mùi Thổ (Ứng)", "Huynh Đệ Tỵ Hỏa"] },
  '4_4': { stt: 51, name: 'Thuần Chấn', ngoai: 'Chấn', noi: 'Chấn', unicode: '䷲', meaning: 'Sấm sét, chấn động. Sau sợ hãi đến bình tĩnh, hành động.', hao_text: ["Phụ Mẫu Tý Thủy", "- Huynh Đệ Dân Mộc", "- Thê Tài Thìn Thổ (Ứng)", "Tử Tôn Ngọ Hỏa", "- Quan Quỷ Thân Kim", "- Thê Tài Tuất Thổ (Thế)"] },
  '7_7': { stt: 52, name: 'Thuần Cấn', ngoai: 'Cấn', noi: 'Cấn', unicode: '䷳', meaning: 'Núi tĩnh, dừng lại. Biết dừng đúng lúc, tĩnh tâm suy nghĩ.', hao_text: ["Phụ Mẫu Tuất Thổ (Thế)", "Huynh Đệ Thân Kim", "Quan Quỷ Ngọ Hỏa", "Phụ Mẫu Thìn Thổ (Ứng)", "Thê Tài Dần Mộc", "Tử Tôn Tý Thủy"] },
  '5_7': { stt: 53, name: 'Phong Sơn Tiệm', ngoai: 'Tốn', noi: 'Cấn', unicode: '䷴', meaning: 'Tiến dần, từng bước. Kiên nhẫn tiến từng bước sẽ thành.', hao_text: ["- Huynh Đệ Thìn Thổ", "- Phụ Mẫu Ngọ Hỏa", "Tử Tôn Thân Kim (Thế)", "- Huynh Đệ Mùi Thổ", "Phụ Mẫu Tỵ Hỏa", "Quan Quỷ Mão Mộc (Ứng)"] },
  '4_2': { stt: 54, name: 'Lôi Trạch Quy Muội', ngoai: 'Chấn', noi: 'Đoài', unicode: '䷵', meaning: 'Gả em gái, hôn nhân. Hành động vội vàng sẽ gặp trở ngại.', hao_text: ["Quan Quỷ Tỵ Hỏa", "Thê Tài Mão Mộc", "- Phụ Mẫu Sửu Thổ (Thế)", "Quan Quỷ Ngọ Hỏa", "- Huynh Đệ Thân Kim", "- Phụ Mẫu Tuất Thổ (Ứng)"] },
  '4_3': { stt: 55, name: 'Lôi Hỏa Phong', ngoai: 'Chấn', noi: 'Ly', unicode: '䷶', meaning: 'Phong phú, cực thịnh. Đang ở đỉnh cao, cần biết giữ.', hao_text: ["Tử Tôn Mão Mộc", "- Quan Quỷ Sửu Thổ (Ứng)", "Huynh Đệ Hợi Thủy", "Thê Tài Ngọ Hỏa", "- Phụ Mẫu Thân Kim (Thế)", "- Quan Quỷ Tuất Thổ"] },
  '3_7': { stt: 56, name: 'Hỏa Sơn Lữ', ngoai: 'Ly', noi: 'Cấn', unicode: '䷷', meaning: 'Lữ khách, tha hương. Cẩn trọng khi xa nhà, giữ khiêm tốn.', hao_text: ["- Tử Tôn Thìn Thổ (Thế)", "- Huynh Đệ Ngọ Hỏa", "Thê Tài Thân Kim", "Thê Tài Dậu Kim (Ứng)", "- Tử Tôn Mùi Thổ", "Huynh Đệ Tỵ Hỏa"] },
  '5_5': { stt: 57, name: 'Thuần Tốn', ngoai: 'Tốn', noi: 'Tốn', unicode: '䷸', meaning: 'Gió nhẹ, mềm mại. Nhu thuận mà thấm sâu, kiên trì.', hao_text: ["- Thê Tài Sửu Thổ", "Phụ Mẫu Hợi Thủy", "Quan Quỷ Dậu Kim (Ứng)", "- Thê Tài Mùi Thổ", "Tử Tôn Tỵ Hỏa", "Huynh Đệ Mão Mộc (Thế)"] },
  '2_2': { stt: 58, name: 'Thuần Đoài', ngoai: 'Đoài', noi: 'Đoài', unicode: '䷹', meaning: 'Vui vẻ, hòa thuận. Vui chính đạo, lan tỏa niềm vui.', hao_text: ["Quan Quỷ Tỵ Hỏa", "Thê Tài Mão Mộc", "- Phụ Mẫu Sửu Thổ (Ứng)", "Tử Tôn Hợi Thủy", "Huynh Đệ Dậu Kim", "- Phụ Mẫu Mùi Thổ (Thế)"] },
  '5_6': { stt: 59, name: 'Phong Thủy Hoán', ngoai: 'Tốn', noi: 'Khảm', unicode: '䷺', meaning: 'Phân tán, lan tỏa. Hóa giải cách biệt, đoàn kết mọi người.', hao_text: ["- Phụ Mẫu Dần Mộc", "Tử Tôn Thìn Thổ (Ứng)", "- Huynh Đệ Ngọ Hỏa", "Tử Tôn Mùi Thổ", "Huynh Đệ Tỵ Hỏa (Thế)", "Phụ Mẫu Mão Mộc"] },
  '6_2': { stt: 60, name: 'Thủy Trạch Tiết', ngoai: 'Khảm', noi: 'Đoài', unicode: '䷻', meaning: 'Tiết chế, điều độ. Biết giới hạn, không quá mức.', hao_text: ["Thê Tài Tỵ Hỏa (Thế)", "Tử Tôn Mão Mộc", "- Quan Quỷ Sửu Thổ", "- Phụ Mẫu Thân Kim (Ứng)", "Quan Quỷ Tuất Thổ", "- Huynh Đệ Tý Thủy"] },
  '5_2': { stt: 61, name: 'Phong Trạch Trung Phu', ngoai: 'Tốn', noi: 'Đoài', unicode: '䷼', meaning: 'Trung tín, chân thành. Lòng tin tạo nên sức mạnh.', hao_text: ["Phụ Mẫu Tỵ Hỏa (Ứng)", "Quan Quỷ Mão Mộc", "- Huynh Đệ Sửu Thổ", "- Huynh Đệ Mùi Thổ (Thế)", "Phụ Mẫu Tỵ Hỏa", "Quan Quỷ Mão Mộc"] },
  '4_7': { stt: 62, name: 'Lôi Sơn Tiểu Quá', ngoai: 'Chấn', noi: 'Cấn', unicode: '䷽', meaning: 'Vượt mức nhỏ. Nên khiêm tốn, không nên quá đà.', hao_text: ["- Phụ Mẫu Thìn Thổ (Ứng)", "- Quan Quỷ Ngọ Hỏa", "Huynh Đệ Thân Kim", "Quan Quỷ Ngọ Hỏa (Thế)", "- Huynh Đệ Thân Kim", "- Phụ Mẫu Tuất Thổ"] },
  '6_3': { stt: 63, name: 'Thủy Hỏa Ký Tế', ngoai: 'Khảm', noi: 'Ly', unicode: '䷾', meaning: 'Đã hoàn thành. Lúc đỉnh cao cần phòng suy, giữ gìn.', hao_text: ["Tử Tôn Mão Mộc", "- Quan Quỷ Sửu Thổ", "Huynh Đệ Hợi Thuỷ (Thế)", "- Phụ Mẫu Thân Kim", "Quan Quỷ Tuất Thổ", "- Huynh Đệ Tý Thủy (Ứng)"] },
  '3_6': { stt: 64, name: 'Hỏa Thủy Vị Tế', ngoai: 'Ly', noi: 'Khảm', unicode: '䷿', meaning: 'Chưa hoàn thành. Sắp đạt mục tiêu, cần thêm nỗ lực.', hao_text: ["- Phụ Mẫu Dần Mộc", "Tử Tôn Thìn Thổ", "- Huynh Đệ Ngọ Hỏa (Thế)", "Thê Tài Dậu Kim", "- Tử Tôn Mùi Thổ", "Huynh Đệ Tỵ Hỏa (Ứng)"] },
};


/* ---------- 8. Quẻ hợp cầu ---------- */
const QUE_HOP_CAU = {
  "tai": [
    "Địa Thủy Sư",
    "Thủy Trạch Tiết",
    "Thiên Trạch Lý",
    "Phong Sơn Tiệm",
    "Thuần Chấn",
    "Lôi Địa Dự",
    "Lôi Thủy Giải",
    "Địa Phong Thăng",
    "Thủy Phong Tỉnh",
    "Trạch Lôi Tùy",
    "Phong Hỏa Gia Nhân",
    "Phong Lôi Ích",
    "Hỏa Lôi Phệ Hạp",
    "Sơn Lôi Di",
    "Thuần Khôn",
    "Địa Lôi Phục",
    "Trạch Thiên Quải",
    "Thủy Thiên Nhu",
    "Địa Sơn Khiêm"
  ],
  "sucKhoe": [
    "Thủy Trạch Tiết",
    "Thiên Trạch Lý",
    "Phong Sơn Tiệm",
    "Phong Hỏa Gia Nhân",
    "Thuần Khôn",
    "Trạch Thiên Quải",
    "Thủy Thiên Nhu"
  ],
  "quanHoc": [
    "Thuần Càn",
    "Phong Thiên Tiểu Súc",
    "Hỏa Thiên Đại Hữu",
    "Phong Địa Quan",
    "Trạch Phong Đại Quá",
    "Lôi Thiên Đại Tráng",
    "Thiên Phong Cấu",
    "Lôi Hỏa Phong",
    "Thuần Đoài"
  ],
  "xau": [
    "Thiên Lôi Vô Vọng",
    "Thiên Thủy Tụng",
    "Thiên Sơn Độn",
    "Thiên Địa Bĩ",
    "Trạch Thủy Khốn",
    "Hỏa Trạch Khuê",
    "Hỏa Sơn Lữ",
    "Lôi Trạch Quy Muội",
    "Lôi Sơn Tiểu Quá",
    "Phong Thiên Tiểu Súc",
    "Thủy Lôi Truân",
    "Thuần Khảm",
    "Thủy Sơn Kiển",
    "Sơn Trạch Tổn",
    "Sơn Phong Cổ",
    "Sơn Thủy Mông",
    "Sơn Địa Bác",
    "Địa Hỏa Minh Di"
  ]
};

/* ---------- 9. Nhận diện nhà mạng ---------- */
const NHA_MANG_PREFIXES = {
  '032': 'Viettel', '033': 'Viettel', '034': 'Viettel', '035': 'Viettel',
  '036': 'Viettel', '037': 'Viettel', '038': 'Viettel', '039': 'Viettel',
  '086': 'Viettel', '096': 'Viettel', '097': 'Viettel', '098': 'Viettel',
  '070': 'Mobifone', '076': 'Mobifone', '077': 'Mobifone', '078': 'Mobifone',
  '079': 'Mobifone', '089': 'Mobifone', '090': 'Mobifone', '093': 'Mobifone',
  '081': 'Vinaphone', '082': 'Vinaphone', '083': 'Vinaphone', '084': 'Vinaphone',
  '085': 'Vinaphone', '088': 'Vinaphone', '091': 'Vinaphone', '094': 'Vinaphone',
  '056': 'Vietnamobile', '058': 'Vietnamobile', '092': 'Vietnamobile',
  '099': 'Gmobile', '059': 'Gmobile',
};

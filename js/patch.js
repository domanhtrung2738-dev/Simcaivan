const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'queDich-data.js');
let content = fs.readFileSync(targetFile, 'utf8');

const anchor = '/* ========== TỪ TRƯỜNG PHỐI HỢP ========== */';
const parts = content.split(anchor);

if (parts.length > 1) {
    const newAddition = `
const TU_TRUONG_PHOI_HOP = {
  'Diên Niên': {
    'Diên Niên': 'Năng lực làm việc cao. Có tài lãnh đạo.',
    'Lục Sát': 'Tính thu liễm buồn, thiếu quyết đoán.',
    'Họa Hại': 'Quan lộ đứt gánh, ngoa ngôn.',
    'Tuyệt Mệnh': 'Lười nhác, không làm đến nơi đến chốn.'
  },
  'Sinh Khí': {
    'Diên Niên': 'Lãnh đạo, lợi cho học hành, quan lộ tốt.',
    'Sinh Khí': 'Có quý nhân đỡ đầu, chuyển nguy thành an.',
    'Thiên Y': 'Quý nhân mang tài phú đến cho.',
    'Lục Sát': 'Khéo léo.',
    'Họa Hại': 'Tự cao. Tự nhận mình giỏi, ảo tưởng.',
    'Ngũ Quỷ': 'Khéo đong đưa, tính nết hơi nhây.',
    'Tuyệt Mệnh': 'Vui vẻ, hoài bão nhưng đầu voi đuôi chuột.'
  },
  'Thiên Y': {
    'Diên Niên': 'Tự mình làm chủ, giỏi lập nghiệp.',
    'Sinh Khí': 'Nhiều bạn bè, sống hào phóng.',
    'Thiên Y': 'Tăng cường tài phú, dễ có 2 vợ.',
    'Phục Vị': 'Thiên y kéo dài.',
    'Lục Sát': 'Dễ vì nữ nhân mà tốn tài.',
    'Họa Hại': 'Sĩ diện, thích nịnh hót, thích làm chim lợn.',
    'Ngũ Quỷ': 'Suy nghĩ nông cạn mà hao tài lộc.',
    'Tuyệt Mệnh': 'Đầu tư không suy nghĩ, dễ phá tài.'
  },
  'Phục Vị': {
    'Diên Niên': 'Người có năng lực, có quyền hành.',
    'Sinh Khí': 'Cát hung càng mạnh, tăng mức độ x 2.',
    'Thiên Y': 'Nhờ lòng kiên nhẫn mà tạo ra tiền tài.',
    'Phục Vị': 'Kiên nhẫn mới thành công.',
    'Lục Sát': 'Lục sát x 2',
    'Họa Hại': 'Mạnh mồm, tự cho mình đúng.',
    'Ngũ Quỷ': 'Ngũ Quỷ x 2',
    'Tuyệt Mệnh': 'Liều lĩnh.'
  },
  'Lục Sát': {
    'Diên Niên': 'Đào hoa, quan hệ xã hội tốt.',
    'Sinh Khí': 'Nhân duyên tốt.',
    'Thiên Y': 'Làm dịch vụ, phù hợp với công việc tỉ mỉ.',
    'Phục Vị': 'Lục sát kéo dài.',
    'Lục Sát': 'U buồn, dễ lo âu trầm cảm.',
    'Họa Hại': 'Dễ mất lòng, không quan tâm đến cảm xúc người khác.',
    'Ngũ Quỷ': 'Dễ thay đổi, ba phải.',
    'Tuyệt Mệnh': 'Cảm giác đè nén không chịu được áp lực cao, bỏ dở.'
  },
  'Họa Hại': {
    'Diên Niên': 'Ăn nói tốt, dễ thuyết phục người khác.',
    'Sinh Khí': 'Nói có người nghe, đe có kẻ sợ.',
    'Thiên Y': 'Kiếm tiền bằng miệng, chốt sale.',
    'Phục Vị': 'Kéo dài.',
    'Lục Sát': 'Lời nói dễ mất lòng, cảm xúc tiêu cực.',
    'Họa Hại': 'Tính nóng nảy, nói thẳng, thiếu kiên nhẫn.',
    'Ngũ Quỷ': 'Cách nói chuyện khiến người khác hiểu lầm.',
    'Tuyệt Mệnh': 'Lời nói khiến người khác tổn thương.'
  },
  'Ngũ Quỷ': {
    'Diên Niên': 'Linh hoạt, ứng biến nhanh.',
    'Sinh Khí': 'Có nhiều ý tưởng đột phá.',
    'Thiên Y': 'Ý tưởng tài hoa mà ra tiền.',
    'Phục Vị': '.',
    'Lục Sát': 'Dễ đồng tính, xu hướng tình dục tiêu cực.',
    'Họa Hại': 'Tự suy diễn dễ mắc thị phi.',
    'Ngũ Quỷ': 'Có tài nhưng không ổn định, gặp trắc trở.',
    'Tuyệt Mệnh': 'Nhận được tín hiệu thông tin tốt là nắm bắt, nhưng dễ mắc ung thư.'
  },
  'Tuyệt Mệnh': {
    'Diên Niên': 'Liều lĩnh, đầu tư mạnh bạo.',
    'Sinh Khí': 'Vui vẻ, hài hước, thích hài hước.',
    'Thiên Y': 'Thông qua nỗ lực mà kiếm tiền.',
    'Phục Vị': '.',
    'Lục Sát': 'Buồn nhiều hơn vui, cuộc sống bí bách.',
    'Họa Hại': 'Dễ cãi vã, dễ gặp tai nạn bất ngờ.',
    'Ngũ Quỷ': 'Nhiều ý tưởng kỳ dị. Dễ mắc ung thư.',
    'Tuyệt Mệnh': 'Chủ quan, bốc đồng dễ cờ bạc nghiện ngập.'
  }
};
`;

    // Reconstruct the file: parts[0] is everything before anchor.
    content = parts[0] + anchor + newAddition;
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Successfully patched.");
} else {
    console.error("Anchor not found!");
}

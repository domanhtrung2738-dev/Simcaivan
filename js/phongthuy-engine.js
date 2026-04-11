/**
 * ============================================================
 *  Sim Cài Vận – Core Engine tính phong thủy
 * ============================================================
 */

/* ========== PARSE INPUT ========== */

/**
 * Chuẩn hóa số điện thoại: bỏ ký tự không phải số, giữ nguyên số 0 đầu
 */
function parsePhoneNumber(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 4 || digits.length > 20) return null;
  return digits;
}

/**
 * Nhận diện nhà mạng từ 3 số đầu
 */
function detectNhaMang(digits) {
  if (!digits || digits.length < 3) return 'Không xác định';
  const prefix = digits.substring(0, 3);
  return NHA_MANG_PREFIXES[prefix] || 'Không xác định';
}

/* ========== PHÂN TÍCH TỪ TRƯỜNG (Bát Cực Linh Số) ========== */

/**
 * Phân tích từ trường cho một cặp 2 chữ số
 * Trả về object { code, name, type, ... } hoặc đặc biệt cho 0/5
 */
function analyzePair(d1, d2) {
  const n1 = Number(d1);
  const n2 = Number(d2);

  // Cặp có 0 và/hoặc 5
  const isSpecial1 = (n1 === 0 || n1 === 5);
  const isSpecial2 = (n2 === 0 || n2 === 5);

  if (isSpecial1 && isSpecial2) {
    // 00, 55, 05, 50
    if (n1 === n2) {
      return {
        pair: `${d1}${d2}`,
        code: n1 === 0 ? 'an_phuc_vi' : 'hien_phuc_vi',
        name: n1 === 0 ? 'Phục Vị ẩn' : 'Phục Vị hiển',
        type: n1 === 0 ? 'neutral' : 'cat',
        icon: n1 === 0 ? '🌑' : '☀',
        color: n1 === 0 ? '#607d8b' : '#ffd740',
        meaning: n1 === 0
          ? 'Năng lượng ẩn tàng, không biểu hiện rõ ràng'
          : 'Năng lượng kích hoạt, hiển lộ mạnh mẽ',
        isSpecial: true,
      };
    } else {
      return {
        pair: `${d1}${d2}`,
        code: 'an_hien',
        name: n1 === 0 ? 'Ẩn → Hiển' : 'Hiển → Ẩn',
        type: 'neutral',
        icon: '🔄',
        color: '#90a4ae',
        meaning: 'Chuyển đổi giữa ẩn tàng và hiển lộ',
        isSpecial: true,
      };
    }
  }

  if (isSpecial1 || isSpecial2) {
    const specialNum = isSpecial1 ? n1 : n2;
    const normalNum = isSpecial1 ? n2 : n1;
    const normalQuai = LAC_THU_MAP[normalNum];

    if (specialNum === 0) {
      return {
        pair: `${d1}${d2}`,
        code: 'an_tang',
        name: `${normalQuai ? normalQuai.name : normalNum} ẩn`,
        type: 'neutral',
        icon: '🌑',
        color: '#607d8b',
        meaning: `Năng lượng số ${normalNum} bị ẩn tàng, suy giảm`,
        isSpecial: true,
        relatedNum: normalNum,
      };
    } else {
      return {
        pair: `${d1}${d2}`,
        code: 'hien_lo',
        name: `${normalQuai ? normalQuai.name : normalNum} hiển`,
        type: 'amplified',
        icon: '☀',
        color: '#ffd740',
        meaning: `Năng lượng số ${normalNum} được kích hoạt, khuếch đại`,
        isSpecial: true,
        relatedNum: normalNum,
      };
    }
  }

  // Cặp bình thường: tra bảng Du Niên
  const grid = DU_NIEN_GRID[n1];
  if (!grid) return null;
  const code = grid[n2];
  if (!code) return null;

  const info = TU_TRUONG_INFO[code];
  return {
    pair: `${d1}${d2}`,
    code: code,
    name: info.name,
    type: info.type,
    level: info.level,
    icon: info.icon,
    color: info.color,
    meaning: info.meaning,
    isSpecial: false,
  };
}

/**
 * Phân tích toàn bộ từ trường của dãy số
 * Trả về mảng các từ trường cho từng cặp liền kề
 */
function analyzeTuTruong(digits) {
  const results = [];
  for (let i = 0; i < digits.length - 1; i++) {
    const pair = analyzePair(digits[i], digits[i + 1]);
    if (pair) {
      pair.position = i;
      results.push(pair);
    }
  }
  return results;
}

/**
 * Tổng hợp thống kê từ trường
 */
function summarizeTuTruong(tuTruongList) {
  const summary = {
    totalCat: 0,
    totalHung: 0,
    totalSpecial: 0,
    breakdown: {},
  };

  tuTruongList.forEach(tt => {
    if (tt.isSpecial) {
      summary.totalSpecial++;
    } else if (tt.type === 'cat') {
      summary.totalCat++;
    } else {
      summary.totalHung++;
    }

    const key = tt.name;
    if (!summary.breakdown[key]) {
      summary.breakdown[key] = { count: 0, ...tt };
    }
    summary.breakdown[key].count++;
  });

  return summary;
}

/* ========== TÍNH QUẺ DỊCH ========== */

/**
 * Chia dãy số thành 2 phần theo quy tắc:
 * - Chẵn: chia đôi
 * - Lẻ: phần đầu ít hơn phần sau 1
 */
function splitDigits(digits) {
  const len = digits.length;
  const mid = Math.floor(len / 2);
  return {
    firstHalf: digits.substring(0, mid),
    secondHalf: digits.substring(mid),
  };
}

/**
 * Tính tổng các chữ số
 */
function sumDigits(str) {
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    total += Number(str[i]);
  }
  return total;
}

/**
 * Tính quẻ chủ, quẻ biến, hào động
 */
function calculateQueDich(digits) {
  const { firstHalf, secondHalf } = splitDigits(digits);

  // Tính tổng
  const sumFirst = sumDigits(firstHalf);
  const sumSecond = sumDigits(secondHalf);
  const sumAll = sumFirst + sumSecond;

  // Thượng quái (Ngoại quái) = tổng phần đầu % 8
  let ngoaiNum = sumFirst % 8;
  if (ngoaiNum === 0) ngoaiNum = 8;

  // Hạ quái (Nội quái) = tổng phần sau % 8
  let noiNum = sumSecond % 8;
  if (noiNum === 0) noiNum = 8;

  // Hào động = tổng tất cả % 6
  let haoDong = sumAll % 6;
  if (haoDong === 0) haoDong = 6;

  // Tra thông tin quái
  const ngoaiQuai = TIEN_THIEN_MAP[ngoaiNum];
  const noiQuai = TIEN_THIEN_MAP[noiNum];

  // Tra quẻ chủ
  const queKey = `${ngoaiNum}_${noiNum}`;
  const queChu = QUE_64[queKey];

  // Tính quẻ biến
  let bienNgoaiName, bienNoiName;
  if (haoDong <= 3) {
    // Hào 1-3: biến Nội quái, giữ Ngoại quái
    bienNoiName = BIEN_QUAI[noiQuai.name][haoDong];
    bienNgoaiName = ngoaiQuai.name;
  } else {
    // Hào 4-6: biến Ngoại quái (hào 4=1, 5=2, 6=3), giữ Nội quái
    const haoInNgoai = haoDong - 3;
    bienNgoaiName = BIEN_QUAI[ngoaiQuai.name][haoInNgoai];
    bienNoiName = noiQuai.name;
  }

  const bienNgoaiNum = QUAI_NAME_TO_NUM[bienNgoaiName];
  const bienNoiNum = QUAI_NAME_TO_NUM[bienNoiName];
  const bienKey = `${bienNgoaiNum}_${bienNoiNum}`;
  const queBien = QUE_64[bienKey];

  // Xây dựng 6 hào (dạng array)
  const haoArray = [...noiQuai.hao, ...ngoaiQuai.hao]; // hào 1-6 (từ dưới lên)
  const haoBienArray = [...haoArray];
  haoBienArray[haoDong - 1] = haoBienArray[haoDong - 1] === 1 ? 0 : 1;

  return {
    digits,
    firstHalf,
    secondHalf,
    sumFirst,
    sumSecond,
    sumAll,
    ngoaiNum,
    noiNum,
    ngoaiQuai,
    noiQuai,
    queChu,
    haoDong,
    haoArray,
    haoBienArray,
    bienNgoaiName,
    bienNoiName,
    queBien,
  };
}

/* ========== QUẺ HỢP CẦU ========== */

function checkQueHopCau(queName) {
  const result = [];
  if (!queName) return result;
  for (const [category, queList] of Object.entries(QUE_HOP_CAU)) {
    if (queList.includes(queName)) {
      const labels = { tai: 'Cầu Tài', quan: 'Cầu Quan', sucKhoe: 'Cầu Sức Khỏe', hoc: 'Cầu Học' };
      result.push(labels[category]);
    }
  }
  return result;
}

/* ========== LUẬN GIẢI TỔNG HỢP ========== */

function generateLuanGiai(queDichResult, tuTruongList) {
  const parts = [];
  const { queChu, queBien, haoDong } = queDichResult;

  // Quẻ chủ
  if (queChu) {
    parts.push(`📖 Quẻ chủ "${queChu.name}" — ${queChu.meaning}`);
  }

  // Quẻ biến
  if (queBien) {
    parts.push(`🔄 Quẻ biến "${queBien.name}" (hào ${haoDong} động) — ${queBien.meaning}`);
  }

  // Quẻ hợp cầu
  const hopCauChu = checkQueHopCau(queChu?.name);
  const hopCauBien = checkQueHopCau(queBien?.name);
  if (hopCauChu.length) {
    parts.push(`✨ Quẻ chủ hợp: ${hopCauChu.join(', ')}`);
  }
  if (hopCauBien.length) {
    parts.push(`✨ Quẻ biến hợp: ${hopCauBien.join(', ')}`);
  }

  // Từ trường
  const summary = summarizeTuTruong(tuTruongList);
  const total = tuTruongList.length;
  const catPercent = total > 0 ? Math.round((summary.totalCat / total) * 100) : 0;
  const hungPercent = total > 0 ? Math.round((summary.totalHung / total) * 100) : 0;

  if (catPercent >= 70) {
    parts.push(`🌟 Từ trường: ${catPercent}% Cát – Dãy số rất tốt, năng lượng tích cực chiếm ưu thế.`);
  } else if (catPercent >= 50) {
    parts.push(`👍 Từ trường: ${catPercent}% Cát – Dãy số khá tốt, năng lượng cân bằng nghiêng về tích cực.`);
  } else if (catPercent >= 30) {
    parts.push(`⚠️ Từ trường: ${catPercent}% Cát – Dãy số có nhiều năng lượng tiêu cực, cần cân nhắc.`);
  } else {
    parts.push(`❌ Từ trường: ${catPercent}% Cát – Dãy số có năng lượng tiêu cực chiếm ưu thế.`);
  }

  // Từ trường nổi bật
  const sortedBreakdown = Object.values(summary.breakdown)
    .sort((a, b) => b.count - a.count);

  const dominant = sortedBreakdown.slice(0, 3);
  if (dominant.length) {
    parts.push(`📊 Từ trường chủ đạo: ${dominant.map(d => `${d.name}(×${d.count})`).join(', ')}`);
  }

  return {
    parts,
    catPercent,
    hungPercent,
    summary,
  };
}

/* ========== PHÂN TÍCH TỔNG HỢP & BẢN MỆNH ========== */

/**
 * Tính Cung Phi từ năm sinh và giới tính
 */
function sumToSingleDigit(num) {
  let sum = Number(num);
  while (sum > 9) {
    sum = String(sum).split('').reduce((a, b) => a + Number(b), 0);
  }
  return sum;
}

function calculatePhiCung(year, gender) {
  if (!year || isNaN(year)) return null;
  
  const sumYear = sumToSingleDigit(year);
  
  let namCalc = 11 - sumYear;
  namCalc = sumToSingleDigit(namCalc);
  
  let finalNum;
  if (gender === 'male') {
    finalNum = namCalc;
  } else {
    finalNum = 15 - namCalc;
    finalNum = sumToSingleDigit(finalNum);
  }
  
  let cung = LAC_THU_MAP[finalNum]?.name;
  if (finalNum === 5) {
    cung = gender === 'male' ? 'Khôn (Trung cung)' : 'Cấn (Trung cung)';
  }

  return { number: finalNum, cung };
}

/**
 * Phân tích riêng cho CCCD (chỉ lấy từ trường)
 */
function analyzeCCCD(rawInput) {
  const digits = parsePhoneNumber(rawInput);
  if (!digits || digits.length !== 12) return null; // CCCD phải có 12 số

  const tuTruong = analyzeTuTruong(digits);
  // Không tính quẻ dịch cho CCCD ở phase này, chỉ lấy từ trường
  const luanGiai = generateLuanGiai({ queChu: null, queBien: null, haoDong: 0 }, tuTruong);
  
  return {
    digits,
    formatted: `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,9)} ${digits.slice(9)}`,
    tuTruong,
    luanGiai
  };
}

/**
 * Hàm chính: phân tích đầy đủ 1 số sim
 */
function analyzeSim(rawInput) {
  const digits = parsePhoneNumber(rawInput);
  if (!digits) return { error: 'Số điện thoại không hợp lệ' };

  const nhaMang = detectNhaMang(digits);
  const tuTruong = analyzeTuTruong(digits);
  const queDich = calculateQueDich(digits);
  const luanGiai = generateLuanGiai(queDich, tuTruong);

  return {
    digits,
    formatted: formatPhoneNumber(digits),
    nhaMang,
    tuTruong,
    queDich,
    luanGiai,
  };
}

/**
 * Format số điện thoại dạng đẹp
 */
function formatPhoneNumber(digits) {
  if (digits.length === 10) {
    return `${digits.slice(0,4)}.${digits.slice(4,7)}.${digits.slice(7)}`;
  }
  return digits;
}

/* ========== PARSE BATCH INPUT ========== */

/**
 * Parse input dạng batch: mỗi dòng có thể là:
 * - Chỉ số: 0987654321
 * - Có giá: 0987654321 | 500000
 * - Có giá + mạng: 0987654321 | 500000 | Viettel
 * Separator: | hoặc tab hoặc nhiều khoảng trắng
 */
function parseBatchInput(text) {
  if (!text || !text.trim()) return [];

  const lines = text.trim().split('\n');
  const results = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Thử tách bằng | hoặc tab
    const parts = trimmed.split(/[|\t]/).map(p => p.trim()).filter(p => p);

    const rawNumber = parts[0];
    const price = parts[1] || '';
    const carrier = parts[2] || '';

    const digits = parsePhoneNumber(rawNumber);
    if (!digits) continue;

    results.push({
      raw: rawNumber,
      digits,
      price,
      carrier: carrier || detectNhaMang(digits),
    });
  }

  return results;
}

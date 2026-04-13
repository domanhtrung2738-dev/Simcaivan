/**
 * ============================================================
 *  Sim Cài Vận – Quẻ Dịch Module
 * ============================================================
 */

function splitDigits(digits) {
  const len = digits.length;
  const mid = Math.floor(len / 2);
  return {
    firstHalf: digits.substring(0, mid),
    secondHalf: digits.substring(mid),
  };
}

function sumDigits(str) {
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    total += Number(str[i]);
  }
  return total;
}

function calculateQueDich(digits) {
  const { firstHalf, secondHalf } = splitDigits(digits);

  const sumFirst = sumDigits(firstHalf);
  const sumSecond = sumDigits(secondHalf);
  const sumAll = sumFirst + sumSecond;

  let ngoaiNum = sumFirst % 8;
  if (ngoaiNum === 0) ngoaiNum = 8;

  let noiNum = sumSecond % 8;
  if (noiNum === 0) noiNum = 8;

  let haoDong = sumAll % 6;
  if (haoDong === 0) haoDong = 6;

  const ngoaiQuai = TIEN_THIEN_MAP[ngoaiNum];
  const noiQuai = TIEN_THIEN_MAP[noiNum];

  const queKey = `${ngoaiNum}_${noiNum}`;
  const queChu = QUE_64[queKey];

  let bienNgoaiName, bienNoiName;
  if (haoDong <= 3) {
    bienNoiName = BIEN_QUAI[noiQuai.name][haoDong];
    bienNgoaiName = ngoaiQuai.name;
  } else {
    const haoInNgoai = haoDong - 3;
    bienNgoaiName = BIEN_QUAI[ngoaiQuai.name][haoInNgoai];
    bienNoiName = noiQuai.name;
  }

  const bienNgoaiNum = QUAI_NAME_TO_NUM[bienNgoaiName];
  const bienNoiNum = QUAI_NAME_TO_NUM[bienNoiName];
  const bienKey = `${bienNgoaiNum}_${bienNoiNum}`;
  const queBien = QUE_64[bienKey];

  const haoArray = queChu.hao_text || [...noiQuai.hao, ...ngoaiQuai.hao];
  const haoBienArray = queBien.hao_text || [...haoArray];

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

function checkQueHopCau(queName) {
  const result = [];
  if (!queName) return result;
  for (const [category, queList] of Object.entries(QUE_HOP_CAU)) {
    if (queList.includes(queName)) {
      const labels = {
        tai: 'Cầu Tài',
        quanHoc: 'Cầu Học/Quan',
        sucKhoe: 'Cầu Sức Khỏe',
        xau: 'Xấu (Nên tránh)'
      };
      if (labels[category]) result.push(labels[category]);
    }
  }
  return result;
}

function getQueColor(queName) {
  if (!queName || typeof QUE_HOP_CAU === 'undefined') return '#ffffff';
  if (QUE_HOP_CAU.tai?.includes(queName)) return 'var(--accent-gold)';
  if (QUE_HOP_CAU.sucKhoe?.includes(queName)) return 'var(--color-cat)';
  if (QUE_HOP_CAU.quanHoc?.includes(queName)) return '#ff9100';
  if (QUE_HOP_CAU.xau?.includes(queName)) return 'var(--color-hung)';
  return '#ffffff';
}

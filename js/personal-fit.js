/**
 * ============================================================
 *  Sim Cài Vận – Personal Fit Module
 * ============================================================
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
    if (gender === 'male') {
      finalNum = 8;
      cung = 'Cấn (Trung cung biến)';
    } else {
      finalNum = 2;
      cung = 'Khôn (Trung cung biến)';
    }
  }

  return { number: finalNum, cung };
}

function evaluateSimCompatibility(userPhiCung, queDichResult, luanGiai) {
  if (!userPhiCung || !queDichResult) return null;

  const userNum = Number(userPhiCung.number);
  const { ngoaiNum, noiNum, haoDong, queChu, queBien } = queDichResult;
  const scoreParts = [];
  let score = 40;

  if (userNum === ngoaiNum) {
    score += 30;
    scoreParts.push('Đồng số với quẻ ngoại');
  }

  if (userNum === noiNum) {
    score += 25;
    scoreParts.push('Đồng số với quẻ nội');
  }

  if (userNum === haoDong) {
    score += 10;
    scoreParts.push('Trùng số với hào động');
  }

  if (luanGiai && luanGiai.catPercent >= 60) {
    score += 10;
    scoreParts.push('Từ trường thiên về cát');
  } else if (luanGiai && luanGiai.catPercent >= 50) {
    score += 5;
    scoreParts.push('Từ trường khá cân bằng');
  }

  if (queChu && queBien && queChu.name === queBien.name) {
    score += 5;
    scoreParts.push('Quẻ chủ và quẻ biến ổn định');
  }

  score = Math.max(0, Math.min(100, score));

  let level = 'Trung bình';
  if (score >= 80) level = 'Rất hợp';
  else if (score >= 65) level = 'Khá hợp';
  else if (score < 45) level = 'Nên cân nhắc';

  return {
    score,
    level,
    scoreParts,
    userCung: userPhiCung.cung,
    simQue: queChu ? queChu.name : '',
  };
}

function analyzeCCCD(rawInput) {
  const digits = parsePhoneNumber(rawInput);
  if (!digits || digits.length < 8) return null; // Hỗ trợ cả CMND (9 số) và CCCD (12 số)

  const tuTruong = analyzeTuTruong(digits);
  const luanGiai = generateLuanGiai({ queChu: null, queBien: null, haoDong: 0 }, tuTruong);
  
  let formatted = digits;
  if (digits.length === 12) {
    formatted = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,9)} ${digits.slice(9)}`;
  } else if (digits.length === 9) {
    formatted = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,9)}`;
  }

  return {
    digits,
    formatted,
    tuTruong,
    luanGiai
  };
}

/**
 * ============================================================
 *  Sim Cài Vận – Analysis Core
 * ============================================================
 */

function generateLuanGiai(queDichResult, tuTruongList) {
  const parts = [];
  const { queChu, queBien, haoDong } = queDichResult;

  if (queChu) {
    parts.push(`📖 Quẻ chủ "${queChu.name}" — ${queChu.meaning}`);
  }

  if (queBien) {
    parts.push(`🔄 Quẻ biến "${queBien.name}" (hào ${haoDong} động) — ${queBien.meaning}`);
  }

  const hopCauChu = checkQueHopCau(queChu?.name);
  const hopCauBien = checkQueHopCau(queBien?.name);
  if (hopCauChu.length) {
    parts.push(`✨ Quẻ chủ hợp: ${hopCauChu.join(', ')}`);
  }
  if (hopCauBien.length) {
    parts.push(`✨ Quẻ biến hợp: ${hopCauBien.join(', ')}`);
  }

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

  const sortedBreakdown = Object.values(summary.breakdown)
    .sort((a, b) => b.count - a.count);

  const dominant = sortedBreakdown.slice(0, 3);
  if (dominant.length) {
    parts.push(`📊 Từ trường chủ đạo: ${dominant.map(d => `${d.name}(×${d.count})`).join(', ')}`);

    dominant.forEach(d => {
      if (d.code && typeof TU_TRUONG_INFO !== 'undefined' && TU_TRUONG_INFO[d.code] && TU_TRUONG_INFO[d.code].details) {
        const details = TU_TRUONG_INFO[d.code].details;
        parts.push(`
          <div class="luan-giai-detail" style="margin-top: 8px; padding-left: 10px; border-left: 2px solid var(--accent-gold); font-size: 0.95rem;">
            <strong style="color:var(--text-main);">📌 ${d.name}:</strong> <span style="font-style: italic;">${TU_TRUONG_INFO[d.code].meaning}</span>
            <div style="margin-top: 4px;"><span style="color:var(--text-muted);">• Tính cách:</span> ${details.tinhCach}</div>
            <div style="margin-top: 4px;"><span style="color:var(--text-muted);">• Sự nghiệp:</span> ${details.suNghiep}</div>
            <div style="margin-top: 4px;"><span style="color:var(--color-hung);">• Lưu ý:</span> ${details.canhBao}</div>
          </div>
        `);
      }
    });
  }

  return {
    parts,
    catPercent,
    hungPercent,
    summary,
  };
}

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

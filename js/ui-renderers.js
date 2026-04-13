/**
 * ============================================================
 *  Sim Cài Vận – UI Renderers
 * ============================================================
 */

function renderSingleResult(r) {
  const { digits, formatted, nhaMang, tuTruong, queDich, luanGiai, userPhiCung, personalFit, cccdResult } = r;

  let userHtml = '';
  if (userPhiCung) {
    userHtml = `
      <div class="result-card">
        <div class="result-card__title">👤 Bản Mệnh Cá Nhân</div>
        <div style="font-size: 0.95rem; text-align: center; margin: 10px 0;">
          Phi cung: <strong style="color: var(--accent-gold); font-size: 1.2rem; margin-left: 8px;">Số ${userPhiCung.number} — ${userPhiCung.cung}</strong>
        </div>
      </div>
    `;
  }

  let fitHtml = '';
  if (personalFit) {
    fitHtml = renderCompatibilityCard(personalFit);
  }

  let cccdHtml = '';
  if (cccdResult) {
    const cccdTuTruongHtml = renderTuTruongCard(cccdResult.tuTruong, cccdResult.luanGiai, '🪪 Năng Lượng CCCD');
    cccdHtml = cccdTuTruongHtml.replace(
      '<div class="result-card__title">🪪 Năng Lượng CCCD</div>',
      `<div class="result-card__title">🪪 Từ Trường CCCD (${cccdResult.formatted})</div>`
    );
  }

  return `
    ${userHtml}

    <div class="phone-display">
      <div class="phone-display__number">${formatted}</div>
      <div class="phone-display__carrier">📱 ${nhaMang}</div>
    </div>

    ${fitHtml}

    ${renderTuTruongCard(tuTruong, luanGiai, '🧲 Từ Trường Năng Lượng')}

    ${cccdHtml}

    ${renderQueDichCard(queDich)}

    ${renderLuanGiaiCard(luanGiai)}
  `;
}

function renderCompatibilityCard(match) {
  const scoreColor = match.score >= 80 ? 'var(--color-cat)' : match.score >= 65 ? 'var(--accent-gold)' : 'var(--color-hung)';
  const scoreLabel = match.score >= 80 ? 'Rất hợp' : match.score >= 65 ? 'Khá hợp' : 'Nên cân nhắc';
  const reasonHtml = match.scoreParts.length
    ? `<div style="margin-top:10px; color:var(--text-muted); font-size:0.92rem; line-height:1.5;">
        ${match.scoreParts.map(part => `<div>• ${part}</div>`).join('')}
      </div>`
    : '';

  return `
    <div class="result-card">
      <div class="result-card__title">🧭 Độ Hợp Theo Bản Mệnh</div>
      <div style="text-align:center; margin: 8px 0 12px;">
        <div style="font-size: 2rem; font-weight: 700; color: ${scoreColor};">${match.score}/100</div>
        <div style="font-size: 1rem; color: ${scoreColor}; font-weight: 600;">${scoreLabel}</div>
      </div>
      <div style="text-align:center; color: var(--text-muted); font-size: 0.95rem;">
        Phi cung <strong style="color: var(--accent-gold);">${match.userCung}</strong> đang đối chiếu với quẻ chủ
        <strong style="color: var(--accent-blue);">${match.simQue || '—'}</strong>
      </div>
      ${reasonHtml}
    </div>
  `;
}

function renderTuTruongCard(tuTruong, luanGiai, title = '🧲 Từ Trường Năng Lượng') {
  const { catPercent, hungPercent } = luanGiai;
  const specialPercent = 100 - catPercent - hungPercent;

  let tagsHtml = '<div class="tu-truong-flow">';
  tuTruong.forEach((tt, i) => {
    if (i > 0) {
      tagsHtml += `<span class="tu-truong-arrow">→</span>`;
    }
    tagsHtml += `
      <span class="tu-truong-tag"
            data-type="${tt.type}"
            data-level="${tt.level || ''}"
            title="${tt.meaning}">
        <span>${tt.icon}</span>
        <span>${tt.name}</span>
        <span class="tu-truong-pair">(${tt.pairStr || tt.pair})</span>
        <span class="tooltip">${tt.meaning}</span>
      </span>`;
  });
  tagsHtml += '</div>';

  return `
    <div class="result-card">
      <div class="result-card__title">${title}</div>
      ${tagsHtml}
      <div class="percent-bar" style="margin-top:16px">
        <div class="percent-bar__cat" style="width:${catPercent}%"></div>
        <div class="percent-bar__special" style="width:${specialPercent}%"></div>
        <div class="percent-bar__hung" style="width:${hungPercent}%"></div>
      </div>
      <div class="percent-labels">
        <span style="color:var(--color-cat)">🟢 Cát ${catPercent}%</span>
        <span style="color:var(--color-hung)">🔴 Hung ${hungPercent}%</span>
      </div>
    </div>`;
}

function renderQueDichCard(q) {
  const { queChu, queBien, haoDong, haoArray, haoBienArray, ngoaiQuai, noiQuai } = q;

  if (!queChu || !queBien) {
    return '<div class="result-card"><div class="result-card__title">☰ Quẻ Dịch</div><p>Không thể tính quẻ</p></div>';
  }

  const hopCauChu = checkQueHopCau(queChu.name);
  const hopCauBien = checkQueHopCau(queBien.name);

  return `
    <div class="result-card">
      <div class="result-card__title">☰ Quẻ Dịch</div>
      <div class="que-display">
        <div class="que-item">
          <div class="que-item__label">Quẻ Chủ</div>
          <div class="que-item__unicode">${queChu.unicode}</div>
          ${renderHaoViz(haoArray, haoDong)}
          <div class="que-item__name" style="color: ${getQueColor(queChu.name)}">${queChu.name}</div>
          <div class="que-item__info">${ngoaiQuai.symbol} ${ngoaiQuai.name} / ${noiQuai.symbol} ${noiQuai.name}</div>
          ${hopCauChu.length ? `<div class="hop-cau-badges">${hopCauChu.map(h => `<span class="hop-cau-badge">✨ ${h}</span>`).join('')}</div>` : ''}
        </div>

        <div class="que-arrow">
          <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px">Hào ${haoDong}</div>
          ➤
        </div>

        <div class="que-item">
          <div class="que-item__label">Quẻ Biến</div>
          <div class="que-item__unicode">${queBien.unicode}</div>
          ${renderHaoViz(haoBienArray, -1)}
          <div class="que-item__name" style="color: ${getQueColor(queBien.name)}">${queBien.name}</div>
          <div class="que-item__info">${TIEN_THIEN_MAP[QUAI_NAME_TO_NUM[q.bienNgoaiName]].symbol} ${q.bienNgoaiName} / ${TIEN_THIEN_MAP[QUAI_NAME_TO_NUM[q.bienNoiName]].symbol} ${q.bienNoiName}</div>
          ${hopCauBien.length ? `<div class="hop-cau-badges">${hopCauBien.map(h => `<span class="hop-cau-badge">✨ ${h}</span>`).join('')}</div>` : ''}
        </div>
      </div>

      <div class="que-hao-dong">
        ⚡ Hào ${haoDong} động — ${haoDong <= 3 ? 'Biến Nội quái' : 'Biến Ngoại quái'}
      </div>
    </div>`;
}

function renderHaoViz(haoArray, haoDong) {
  let html = '<div class="hao-viz" style="display:flex; flex-direction:column; gap:4px; font-size:14px; margin-top: 20px;">';
  for (let i = 5; i >= 0; i--) {
    const isDong = (i + 1) === haoDong;
    const txt = haoArray[i];

    let displayTxt = txt;
    if (txt && typeof txt === 'string') {
      displayTxt = displayTxt.replace(/^[\s-]+/, '');
      displayTxt = displayTxt.replace('(Thế)', '<strong style="color:var(--accent-gold)">(Thế)</strong>')
                             .replace('(Ứng)', '<strong style="color:#2196f3">(Ứng)</strong>');
    }

    html += `
      <div class="hao-line" style="display:flex; align-items:center; height: auto; min-height: 28px; opacity: ${isDong ? '1' : '0.85'}; ${isDong ? 'color: var(--accent-gold); font-weight: bold;' : ''}">
        <span class="hao-line__num" style="min-width: 16px; opacity:0.5">${i + 1}</span>
        <span style="flex: 1; padding: 4px 8px; line-height: 1.4; background: ${isDong ? 'rgba(255,215,64,0.1)' : 'rgba(255,255,255,0.05)'}; border-radius:4px; border-left: 2px solid ${isDong ? 'var(--accent-gold)' : 'transparent'};">
          ${displayTxt}
        </span>
      </div>`;
  }
  html += '</div>';
  return html;
}

function renderLuanGiaiCard(luanGiai) {
  return `
    <div class="result-card">
      <div class="result-card__title">📝 Luận Giải Sơ Bộ</div>
      <ul class="luan-giai-list">
        ${luanGiai.parts.map(p => `<li class="luan-giai-item">${p}</li>`).join('')}
      </ul>
    </div>
  `;
}

function getQueColor(queName) {
  if (!queName || typeof QUE_HOP_CAU === 'undefined') return '#ffffff';
  if (QUE_HOP_CAU.tai?.includes(queName)) return 'var(--accent-gold)';
  if (QUE_HOP_CAU.sucKhoe?.includes(queName)) return 'var(--color-cat)';
  if (QUE_HOP_CAU.quanHoc?.includes(queName)) return '#ff9100';
  if (QUE_HOP_CAU.xau?.includes(queName)) return 'var(--color-hung)';
  return '#ffffff';
}

function renderBatchResult(analyzed) {
  let rows = '';
  analyzed.forEach((item, idx) => {
    const r = item.result;
    if (r.error) return;

    const ttTags = r.tuTruong.map(tt =>
      `<span class="tu-truong-tag" data-type="${tt.type}" data-level="${tt.level || ''}" title="${tt.meaning}">${tt.icon} ${tt.name}</span>`
    ).join('');

    const chuColor = getQueColor(r.queDich.queChu?.name);
    const bienColor = getQueColor(r.queDich.queBien?.name);

    rows += `
      <tr>
        <td class="checkbox-cell" onclick="event.stopPropagation()"><input type="checkbox"></td>
        <td>${idx + 1}</td>
        <td class="phone-cell" data-phone="${r.digits}">${r.formatted}</td>
        <td class="tt-cell">${ttTags}</td>
        <td class="que-cell" style="color: ${chuColor}; font-weight: bold;">${r.queDich.queChu?.name || '—'}</td>
        <td class="que-cell" style="color: ${bienColor}; font-weight: bold;">${r.queDich.queBien?.name || '—'}</td>
        <td>${item.price || '—'}</td>
        <td>${item.carrier || r.nhaMang}</td>
        <td>${r.luanGiai.catPercent}%</td>
      </tr>`;
  });

  return `
    <div class="batch-count">📊 Đã phân tích ${analyzed.length} số</div>
    <div class="batch-table-wrap">
      <table class="batch-table" id="batch-table">
        <thead>
          <tr>
            <th width="40"></th>
            <th>#</th>
            <th>Số điện thoại</th>
            <th>Từ trường</th>
            <th>Quẻ chủ</th>
            <th>Quẻ biến</th>
            <th>Giá</th>
            <th>Nhà mạng</th>
            <th>Cát %</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

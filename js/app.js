/**
 * ============================================================
 *  Sim Cài Vận – App UI Logic
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ===== Tab Switching ===== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  /* ===== Single Analysis ===== */
  const inputSingle = document.getElementById('input-single');
  const btnSingle = document.getElementById('btn-single');
  const resultSingle = document.getElementById('result-single');

  function runSingleAnalysis() {
    const raw = inputSingle.value.trim();
    if (!raw) return;

    const result = analyzeSim(raw);
    if (result.error) {
      resultSingle.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⚠️</div>
          <div class="empty-state__text">${result.error}</div>
        </div>`;
      return;
    }

    resultSingle.innerHTML = renderSingleResult(result);
  }

  btnSingle.addEventListener('click', runSingleAnalysis);
  inputSingle.addEventListener('keydown', e => {
    if (e.key === 'Enter') runSingleAnalysis();
  });

  /* ===== Batch Analysis ===== */
  const inputBatch = document.getElementById('input-batch');
  const btnBatch = document.getElementById('btn-batch');
  const resultBatch = document.getElementById('result-batch');

  btnBatch.addEventListener('click', () => {
    const raw = inputBatch.value.trim();
    if (!raw) return;

    const items = parseBatchInput(raw);
    if (!items.length) {
      resultBatch.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__text">Không tìm thấy số hợp lệ</div>
        </div>`;
      return;
    }

    // Analyze all
    const analyzed = items.map(item => {
      const result = analyzeSim(item.digits);
      return { ...item, result };
    });

    resultBatch.innerHTML = renderBatchResult(analyzed);

    // Add click handler for phone cells
    document.querySelectorAll('.phone-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const phone = cell.dataset.phone;
        if (phone) {
          inputSingle.value = phone;
          // Switch to single tab
          tabBtns[0].click();
          runSingleAnalysis();
        }
      });
    });
  });
});

/* ========== RENDER FUNCTIONS ========== */

function renderSingleResult(r) {
  const { digits, formatted, nhaMang, tuTruong, queDich, luanGiai } = r;

  return `
    <!-- Phone Number Display -->
    <div class="phone-display">
      <div class="phone-display__number">${formatted}</div>
      <div class="phone-display__carrier">📱 ${nhaMang}</div>
    </div>

    <!-- Từ trường -->
    ${renderTuTruongCard(tuTruong, luanGiai)}

    <!-- Quẻ Dịch -->
    ${renderQueDichCard(queDich)}

    <!-- Luận giải -->
    ${renderLuanGiaiCard(luanGiai)}
  `;
}

function renderTuTruongCard(tuTruong, luanGiai) {
  const { catPercent, hungPercent, summary } = luanGiai;
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
        <span class="tu-truong-pair">(${tt.pair})</span>
        <span class="tooltip">${tt.meaning}</span>
      </span>`;
  });
  tagsHtml += '</div>';

  return `
    <div class="result-card">
      <div class="result-card__title">🧲 Từ Trường Năng Lượng</div>
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
        <!-- Quẻ Chủ -->
        <div class="que-item">
          <div class="que-item__label">Quẻ Chủ</div>
          <div class="que-item__unicode">${queChu.unicode}</div>
          ${renderHaoViz(haoArray, haoDong)}
          <div class="que-item__name">${queChu.name}</div>
          <div class="que-item__info">${ngoaiQuai.symbol} ${ngoaiQuai.name} / ${noiQuai.symbol} ${noiQuai.name}</div>
          ${hopCauChu.length ? `<div class="hop-cau-badges">${hopCauChu.map(h => `<span class="hop-cau-badge">✨ ${h}</span>`).join('')}</div>` : ''}
        </div>

        <!-- Arrow -->
        <div class="que-arrow">
          <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px">Hào ${haoDong}</div>
          ➤
        </div>

        <!-- Quẻ Biến -->
        <div class="que-item">
          <div class="que-item__label">Quẻ Biến</div>
          <div class="que-item__unicode">${queBien.unicode}</div>
          ${renderHaoViz(haoBienArray, -1)}
          <div class="que-item__name">${queBien.name}</div>
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
  let html = '<div class="hao-viz">';
  // Render from top (hào 6) to bottom (hào 1)
  for (let i = 5; i >= 0; i--) {
    const isDong = (i + 1) === haoDong;
    const val = haoArray[i];
    html += `
      <div class="hao-line ${isDong ? 'is-dong' : ''}" data-value="${val}">
        <span class="hao-line__num">${i + 1}</span>
        ${val === 1
          ? '<span class="hao-line__bar"></span>'
          : '<span class="hao-line__bar"></span><span class="hao-line__bar"></span>'
        }
      </div>`;
  }
  html += '</div>';
  return html;
}

function renderLuanGiaiCard(luanGiai) {
  return `
    <div class="result-card">
      <div class="result-card__title">📜 Luận Giải Sơ Bộ</div>
      <ul class="luan-giai-list">
        ${luanGiai.parts.map(p => `<li class="luan-giai-item">${p}</li>`).join('')}
      </ul>
    </div>`;
}

/* ========== BATCH RENDER ========== */

function renderBatchResult(analyzed) {
  let rows = '';
  analyzed.forEach((item, idx) => {
    const r = item.result;
    if (r.error) return;

    const ttTags = r.tuTruong.map(tt =>
      `<span class="tu-truong-tag" data-type="${tt.type}" data-level="${tt.level || ''}" title="${tt.meaning}">${tt.icon} ${tt.name}</span>`
    ).join('');

    rows += `
      <tr>
        <td>${idx + 1}</td>
        <td class="phone-cell" data-phone="${r.digits}">${r.formatted}</td>
        <td class="tt-cell">${ttTags}</td>
        <td class="que-cell">${r.queDich.queChu?.name || '—'}</td>
        <td class="que-cell">${r.queDich.queBien?.name || '—'}</td>
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

/**
 * ============================================================
 *  Sim Cài Vận – Book / Sách Tra Cứu Logic
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('book-container');
  const searchInput = document.getElementById('book-search-input');
  if (!container || !searchInput) return;

  // Chờ dữ liệu từ queDich-data.js và app.js tải xong
  setTimeout(initBook, 100);

  function initBook() {
    renderBook('');
    searchInput.addEventListener('input', (e) => {
      renderBook(e.target.value.toLowerCase().trim());
    });
  }

  function renderBook(query) {
    let html = '';

    // 1. Tiên Thiên Bát Quái
    const quaiHtml = renderBatQuai(query);
    if (quaiHtml) html += `<div class="book-chapter"><h2 class="book-chapter-title">☯ Tiên Thiên Bát Quái</h2><div class="book-grid">${quaiHtml}</div></div>`;

    // 2. Phối hợp từ trường
    const phHtml = renderPhoiHop(query);
    if (phHtml) html += `<div class="book-chapter"><h2 class="book-chapter-title">🔗 Sự Phối Hợp Giữa Các Từ Trường</h2><div class="book-grid">${phHtml}</div></div>`;

    // 3. Từ trường
    const ttHtml = renderTuTruong(query);
    if (ttHtml) html += `<div class="book-chapter"><h2 class="book-chapter-title">🧲 Từ Trường (Bát Cực Linh Số)</h2><div class="book-grid">${ttHtml}</div></div>`;

    // 4. Quẻ Dịch
    const queHtml = renderQueDich(query);
    if (queHtml) html += `<div class="book-chapter"><h2 class="book-chapter-title">☰ 64 Quẻ Dịch</h2><div class="book-grid">${queHtml}</div></div>`;

    if (!html) {
      html = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <div class="empty-state__text">Không tìm thấy kiến thức liên quan</div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function renderTuTruong(query) {
    if (typeof TU_TRUONG_INFO === 'undefined') return '';
    let items = Object.values(TU_TRUONG_INFO);
    
    // Đảo Sinh Khí, Diên Niên... lên trước (Cát trước Hung sau)
    items.sort((a,b) => a.type === 'cat' && b.type === 'hung' ? -1 : 1);

    if (query) {
      items = items.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.meaning.toLowerCase().includes(query) ||
        (t.details && t.details.tinhCach.toLowerCase().includes(query)) ||
        (t.pairs && t.pairs.join(',').includes(query))
      );
    }

    return items.map(t => {
      const typeColor = t.type === 'cat' ? 'var(--color-cat)' : 'var(--color-hung)';
      return `
        <div class="book-card" style="border-top: 3px solid ${typeColor}">
          <div class="book-card__header">
            <div class="book-card__title">${t.icon} ${t.name}</div>
            <span class="book-card__badge" style="background: ${t.type === 'cat' ? 'rgba(0,230,118,0.1)' : 'rgba(255,23,68,0.1)'}; color: ${typeColor}">${t.type === 'cat' ? 'Cát' : 'Hung'}</span>
          </div>
          <div class="book-card__content">
            <p style="margin-bottom:8px"><em>${t.meaning}</em></p>
            ${t.details ? `
              <p><strong>Tính cách:</strong> ${t.details.tinhCach}</p>
              <p><strong>Sự nghiệp:</strong> ${t.details.suNghiep}</p>
              <p><strong style="color:var(--color-hung)">Cảnh báo:</strong> ${t.details.canhBao}</p>
            ` : ''}
          </div>
          ${t.pairs ? `<div class="book-card__tag-list">${t.pairs.map(p => `<span class="book-card__tag">${p}</span>`).join('')}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function renderPhoiHop(query) {
    if (typeof TU_TRUONG_PHOI_HOP === 'undefined') return '';
    let html = '';
    
    Object.entries(TU_TRUONG_PHOI_HOP).forEach(([goc, phoiHopObj]) => {
      let contentHtml = '';
      Object.entries(phoiHopObj).forEach(([phu, meanning]) => {
         if (!query || goc.toLowerCase().includes(query) || phu.toLowerCase().includes(query) || meanning.toLowerCase().includes(query)) {
            const isCat = ['Sinh Khí', 'Diên Niên', 'Thiên Y', 'Phục Vị'].includes(phu);
            const badgeColor = isCat ? 'var(--color-cat)' : 'var(--color-hung)';
            contentHtml += `<p style="margin-bottom:8px">
              <strong style="color:var(--accent-blue)">+ ${phu}</strong>: 
              <span style="color: ${badgeColor}">${meanning}</span>
            </p>`;
         }
      });
      
      if (contentHtml) {
         html += `
          <div class="book-card" style="border-left: 3px solid var(--accent-blue)">
            <div class="book-card__header">
              <div class="book-card__title">Gốc: ${goc}</div>
            </div>
            <div class="book-card__content">
              ${contentHtml}
            </div>
          </div>
         `;
      }
    });

    return html;
  }

  function renderQueDich(query) {
    if (typeof QUE_64 === 'undefined') return '';
    let items = Object.values(QUE_64);
    
    items.sort((a,b) => a.stt - b.stt); // Sort theo STT kinh dịch (1..64)

    if (query) {
      items = items.filter(q => 
        q.name.toLowerCase().includes(query) || 
        q.meaning.toLowerCase().includes(query) ||
        q.ngoai.toLowerCase().includes(query) ||
        q.noi.toLowerCase().includes(query) ||
        (typeof checkQueHopCau === 'function' && checkQueHopCau(q.name).join(', ').toLowerCase().includes(query))
      );
    }

    return items.map(q => {
      let badges = '';
      let titleColor = 'var(--accent-gold)';
      if (typeof checkQueHopCau === 'function') {
        const hc = checkQueHopCau(q.name);
        if (hc.length) {
          badges = hc.map(h => `<span class="hop-cau-badge" style="font-size:0.65rem; padding: 2px 6px">✨ ${h}</span>`).join('');
        }
      }
      if (typeof getQueColor === 'function') {
        titleColor = getQueColor(q.name);
      }

      return `
        <div class="book-card">
          <div class="book-card__header">
            <div class="book-card__title" style="color: ${titleColor};">
               <span style="font-family: monospace; font-size: 1.5rem">${q.unicode}</span>
               ${q.name}
            </div>
            <span class="book-card__badge">#${q.stt}</span>
          </div>
          <div class="book-card__content">
            <p><strong>Cấu trúc:</strong> ${q.ngoai} (Ngoại) / ${q.noi} (Nội)</p>
            <p style="margin-top:4px"><em>"${q.meaning}"</em></p>
          </div>
          ${badges ? `<div class="book-card__tag-list">${badges}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function renderBatQuai(query) {
    if (typeof QUAI_DESCRIPTIONS === 'undefined') return '';
    let entries = Object.entries(QUAI_DESCRIPTIONS);

    if (query) {
      entries = entries.filter(([name, data]) => 
        name.toLowerCase().includes(query) || 
        data.uu.toLowerCase().includes(query) ||
        data.nhuoc.toLowerCase().includes(query) ||
        data.number.toString() === query
      );
    }

    return entries.map(([name, data]) => {
      return `
        <div class="book-card" style="border-left: 3px solid var(--accent-blue)">
          <div class="book-card__header">
            <div class="book-card__title" style="color: var(--accent-blue)">⚡ Quái ${name}</div>
            <span class="book-card__badge" style="color: var(--text-primary)">Lạc thư số ${data.number}</span>
          </div>
          <div class="book-card__content">
            <p><strong style="color: var(--color-cat)">Ưu điểm:</strong> ${data.uu}</p>
            <p style="margin-top:6px"><strong style="color: var(--color-hung)">Nhược điểm:</strong> ${data.nhuoc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

});

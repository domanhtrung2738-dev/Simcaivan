/**
 * ============================================================
 *  Book Chapter 04 – 64 Quẻ Dịch
 * ============================================================
 */

registerBookChapter({
  id: 'chapter-04-64-que-dich',
  order: 4,
  title: '☰ 64 Quẻ Dịch',
  render(query) {
    if (typeof QUE_64 === 'undefined') return '';

    let items = Object.values(QUE_64);
    items.sort((a, b) => a.stt - b.stt);

    if (query) {
      items = items.filter(q =>
        q.name.toLowerCase().includes(query) ||
        q.meaning.toLowerCase().includes(query) ||
        q.ngoai.toLowerCase().includes(query) ||
        q.noi.toLowerCase().includes(query) ||
        (typeof checkQueHopCau === 'function' && checkQueHopCau(q.name).join(', ').toLowerCase().includes(query))
      );
    }

    const bodyHtml = items.map(q => {
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

    return renderBookSection(this.title, bodyHtml);
  }
});

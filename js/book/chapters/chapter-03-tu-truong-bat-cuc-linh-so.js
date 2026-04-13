/**
 * ============================================================
 *  Book Chapter 03 – Từ Trường (Bát Cực Linh Số)
 * ============================================================
 */

registerBookChapter({
  id: 'chapter-03-tu-truong-bat-cuc-linh-so',
  order: 3,
  title: '🧲 Từ Trường (Bát Cực Linh Số)',
  render(query) {
    if (typeof TU_TRUONG_INFO === 'undefined') return '';

    let items = Object.values(TU_TRUONG_INFO);
    items.sort((a, b) => a.type === 'cat' && b.type === 'hung' ? -1 : 1);

    if (query) {
      items = items.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.meaning.toLowerCase().includes(query) ||
        (t.details && t.details.tinhCach.toLowerCase().includes(query)) ||
        (t.pairs && t.pairs.join(',').includes(query))
      );
    }

    const bodyHtml = items.map(t => {
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

    return renderBookSection(this.title, bodyHtml);
  }
});

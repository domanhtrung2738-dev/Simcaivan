/**
 * ============================================================
 *  Book Chapter 01 – Tiên Thiên Bát Quái
 * ============================================================
 */

registerBookChapter({
  id: 'chapter-01-tien-thien-bat-quai',
  order: 1,
  title: '☯ Tiên Thiên Bát Quái',
  render(query) {
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

    const bodyHtml = entries.map(([name, data]) => renderBookCard(
      `<span style="color: var(--accent-blue)">⚡ Quái ${name}</span>`,
      `<span class="book-card__badge" style="color: var(--text-primary)">Lạc thư số ${data.number}</span>`,
      `
        <p><strong style="color: var(--color-cat)">Ưu điểm:</strong> ${data.uu}</p>
        <p style="margin-top:6px"><strong style="color: var(--color-hung)">Nhược điểm:</strong> ${data.nhuoc}</p>
      `,
      'border-left: 3px solid var(--accent-blue)'
    )).join('');

    return renderBookSection(this.title, bodyHtml);
  }
});

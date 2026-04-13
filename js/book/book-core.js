/**
 * ============================================================
 *  Sim Cài Vận – Book Core
 * ============================================================
 */

window.BOOK_REGISTRY = window.BOOK_REGISTRY || [];

function registerBookChapter(chapter) {
  if (!chapter || !chapter.id || typeof chapter.render !== 'function') return;

  const existingIndex = BOOK_REGISTRY.findIndex(item => item.id === chapter.id);
  if (existingIndex >= 0) {
    BOOK_REGISTRY[existingIndex] = chapter;
    return;
  }

  BOOK_REGISTRY.push(chapter);
}

function getBookChapters() {
  return [...BOOK_REGISTRY].sort((a, b) => {
    const orderA = Number.isFinite(a.order) ? a.order : 999;
    const orderB = Number.isFinite(b.order) ? b.order : 999;
    return orderA - orderB;
  });
}

function normalizeBookQuery(query) {
  return (query || '').toLowerCase().trim();
}

function renderBookSection(title, bodyHtml) {
  if (!bodyHtml) return '';
  return `<div class="book-chapter"><h2 class="book-chapter-title">${title}</h2><div class="book-grid">${bodyHtml}</div></div>`;
}

function renderBookCard(title, badgeHtml, contentHtml, wrapperStyle = '') {
  return `
    <div class="book-card" style="${wrapperStyle}">
      <div class="book-card__header">
        <div class="book-card__title">${title}</div>
        ${badgeHtml || ''}
      </div>
      <div class="book-card__content">
        ${contentHtml}
      </div>
    </div>
  `;
}

function renderBookEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">🔍</div>
      <div class="empty-state__text">Không tìm thấy kiến thức liên quan</div>
    </div>
  `;
}

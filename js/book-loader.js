/**
 * ============================================================
 *  Sim Cài Vận – Book Loader
 * ============================================================
 */

(function () {
  const BOOK_MANIFEST_URL = 'js/book/book-manifest.js';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve(src);
      script.onerror = () => reject(new Error(`Không tải được ${src}`));
      document.head.appendChild(script);
    });
  }

  async function loadBookModules() {
    await loadScript(BOOK_MANIFEST_URL);
    const manifest = Array.isArray(window.BOOK_MANIFEST) ? window.BOOK_MANIFEST : [];
    for (const src of manifest) {
      await loadScript(src);
    }
  }

  function initBookUI() {
    const container = document.getElementById('book-container');
    const searchInput = document.getElementById('book-search-input');
    if (!container || !searchInput) return;

    const renderBook = (rawQuery) => {
      const query = (rawQuery || '').toLowerCase().trim();
      const chapters = typeof getBookChapters === 'function' ? getBookChapters() : [];
      const html = chapters
        .map(chapter => chapter.render(query))
        .filter(Boolean)
        .join('');

      container.innerHTML = html || renderBookEmptyState();
    };

    renderBook('');
    searchInput.addEventListener('input', (e) => {
      renderBook(e.target.value);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadBookModules()
      .then(initBookUI)
      .catch(err => {
        console.error(err);
        const container = document.getElementById('book-container');
        if (container) {
          container.innerHTML = `
            <div class="empty-state">
              <div class="empty-state__icon">🔍</div>
              <div class="empty-state__text">Không tải được dữ liệu Sách Tra Cứu</div>
            </div>
          `;
        }
      });
  });
})();

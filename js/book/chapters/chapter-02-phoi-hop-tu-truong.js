/**
 * ============================================================
 *  Book Chapter 02 – Sự Phối Hợp Giữa Các Từ Trường
 * ============================================================
 */

registerBookChapter({
  id: 'chapter-02-phoi-hop-tu-truong',
  order: 2,
  title: '🔗 Sự Phối Hợp Giữa Các Từ Trường',
  render(query) {
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
        html += renderBookCard(
          `<span style="color: var(--accent-blue)">Gốc: ${goc}</span>`,
          '',
          contentHtml,
          'border-left: 3px solid var(--accent-blue)'
        );
      }
    });

    return renderBookSection(this.title, html);
  }
});

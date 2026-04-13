/**
 * ============================================================
 *  Sim Cài Vận – App Controller
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
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

  const inputSingle = document.getElementById('input-single');
  const btnSingle = document.getElementById('btn-single');
  const resultSingle = document.getElementById('result-single');
  const inputYear = document.getElementById('input-year');
  const inputGender = document.getElementById('input-gender');
  const inputCCCD = document.getElementById('input-cccd');

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

    const year = inputYear.value.trim();
    const gender = inputGender.value;
    const cccd = inputCCCD.value.trim();

    if (year) {
      result.userPhiCung = calculatePhiCung(year, gender);
    }

    if (result.userPhiCung) {
      result.personalFit = evaluateSimCompatibility(result.userPhiCung, result.queDich, result.luanGiai);
    }

    if (cccd) {
      result.cccdResult = analyzeCCCDWithPersonalFit(cccd, result.userPhiCung, result.queDich, result.luanGiai);
    }

    const priceParam = inputSingle.dataset.price;
    if (priceParam) {
      result.price = priceParam;
      // Xóa dataset để không bị dính giá cũ khi Sếp tự gõ số mới tay
      inputSingle.dataset.price = '';
    }

    resultSingle.innerHTML = renderSingleResult(result);
  }

  btnSingle.addEventListener('click', runSingleAnalysis);
  inputSingle.addEventListener('keydown', e => {
    if (e.key === 'Enter') runSingleAnalysis();
  });

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

    const analyzed = items.map(item => {
      const result = analyzeSim(item.digits);
      return { ...item, result };
    });

    resultBatch.innerHTML = renderBatchResult(analyzed);

    document.querySelectorAll('.phone-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const phone = cell.dataset.phone;
        const price = cell.dataset.price;
        if (phone) {
          if (price) inputSingle.dataset.price = price;
          inputSingle.value = phone;
          tabBtns[0].click();
          runSingleAnalysis();
        }
      });
    });
  });
});

/**
 * ============================================================
 *  Sim Cài Vận – VVIP Controller
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const vvipTabBtn = document.getElementById('tab-btn-vvip');
  if(vvipTabBtn) {
    // Tải dữ liệu lần đầu khi bấm vào Tab
    vvipTabBtn.addEventListener('click', () => {
      if(!window.vvipLoaded) {
        loadVVIPData();
        window.vvipLoaded = true;
      }
    });
  }

  const filterSelect = document.getElementById('vvip-filter-carrier');
  if(filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      const activeCarrier = e.target.value;
      filterVVIPList(activeCarrier);
    });
  }
});

let allVipData = [];

async function loadVVIPData() {
  const container = document.getElementById('vvip-container');
  // Check kết nối Supabase
  if (!window.SupabaseClient || Object.keys(window.SupabaseClient).length === 0 || window.SupabaseClient.supabaseUrl === 'https://XXXX.supabase.co') {
    container.innerHTML = `
      <div class="empty-state">
         <div class="empty-state__icon">⚠️</div>
         <div class="empty-state__text" style="color:var(--color-hung)">Chưa kết nối Supabase CSDL</div>
         <div style="font-size:0.85rem;opacity:0.7;margin-top:10px;line-height:1.4">
            Vui lòng điền URL và API Key vào file <strong>js/supabase-config.js</strong>
         </div>
      </div>
    `;
    return;
  }

  // Chờ dữ liệu hiển thị trạng thái loading
  container.innerHTML = `
    <div class="empty-state">
       <div class="empty-state__icon rotating">⏳</div>
       <div class="empty-state__text">Đang lấy danh sách kho sim...</div>
    </div>
  `;

  try {
    const { data, error } = await window.SupabaseClient
      .from('sim_vvip')
      .select('*')
      .order('price', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
           <div class="empty-state__icon">📦</div>
           <div class="empty-state__text">Kho sim VVIP hiện đang trống</div>
        </div>
      `;
      return;
    }

    allVipData = data;
    renderVVIPList(allVipData);
  } catch (err) {
    console.error('Lỗi khi tải Supabase:', err);
    container.innerHTML = `
       <div class="empty-state">
         <div class="empty-state__icon">⚠️</div>
         <div class="empty-state__text" style="color:var(--color-hung)">Lỗi mạng hoặc cấu hình DB sai</div>
         <div style="font-size:0.8rem;opacity:0.7;margin-top:10px">${err.message || 'Vui lòng kiểm tra mã lỗi trong Console'}</div>
      </div>
    `;
  }
}

function renderVVIPList(data) {
  const container = document.getElementById('vvip-container');
  let html = '<div class="vvip-grid">';
  data.forEach(sim => {
    // sim.tags can be empty or comma separated string
    const tags = sim.tags ? sim.tags.split(',').map(t => `<span class="vvip-tag-chip">${t.trim()}</span>`).join('') : '';
    const formatPrice = formatVND(sim.price);
    
    html += `
      <div class="vvip-card" onclick="analyzeVvipSim('${sim.phone_number}')">
        <div class="vvip-card__header">
          <div class="vvip-phone">${formatPhone(sim.phone_number)}</div>
          <div class="vvip-price">${formatPrice}</div>
        </div>
        <div class="vvip-card__body">
          <div class="vvip-tags">
            <span class="vvip-tag-chip carrier-chip">${sim.carrier || 'KXD'}</span>
            ${tags}
          </div>
          ${sim.sim_que ? `<div class="vvip-que">☯️ Quẻ chủ: <strong>${sim.sim_que}</strong></div>` : ''}
        </div>
        <div class="vvip-card__footer">
          <button class="btn-analyze-vvip">Lý giải chi tiết ➞</button>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function filterVVIPList(carrier) {
  if (!carrier) {
    renderVVIPList(allVipData);
    return;
  }
  const filtered = allVipData.filter(s => s.carrier === carrier);
  renderVVIPList(filtered);
}

// Logic hook nhảy sang Tab phân tích 1 số
function analyzeVvipSim(phoneNumber) {
  const btnSingle = document.getElementById('tab-btn-single');
  if (btnSingle) btnSingle.click();

  const inputSingle = document.getElementById('input-single');
  const btnAnalyzeSingle = document.getElementById('btn-single');
  
  if (inputSingle && btnAnalyzeSingle) {
    inputSingle.value = phoneNumber;
    btnAnalyzeSingle.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function formatVND(n) {
  if (!n) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function formatPhone(p) {
  if(!p) return '';
  p = p.replace(/\D/g, '');
  if (p.length === 10) {
    return p.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
  }
  return p;
}

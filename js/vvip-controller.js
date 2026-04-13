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
  const searchInput = document.getElementById('vvip-search-input');

  const triggerFilter = () => {
    filterVVIPList();
  };

  if(filterSelect) {
    filterSelect.addEventListener('change', triggerFilter);
  }
  if(searchInput) {
    searchInput.addEventListener('input', triggerFilter);
  }
});

let allVipData = [];

async function loadVVIPData() {
  const container = document.getElementById('vvip-container');
  // Thử khôi phục SupabaseClient nếu thư viện load chậm
  if (!window.SupabaseClient && window.supabase && window.SUPABASE_URL) {
    window.SupabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  // Check kết nối Supabase
  if (!window.SupabaseClient || Object.keys(window.SupabaseClient).length === 0 || window.SupabaseClient.supabaseUrl === 'https://XXXX.supabase.co') {
    container.innerHTML = `
      <div class="empty-state">
         <div class="empty-state__icon">⚠️</div>
         <div class="empty-state__text" style="color:var(--color-hung)">Chưa kết nối Supabase CSDL</div>
         <div style="font-size:0.85rem;opacity:0.7;margin-top:10px;line-height:1.4">
            Vui lòng tải lại trang (F5) hoặc vô hiệu hóa trình chặn quảng cáo bảo mật khắt khe.
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
    
    // Tự động phân tích và tạo options động
    const filterSelect = document.getElementById('vvip-filter-carrier');
    if (filterSelect) {
      const carriersFromDB = [...new Set(allVipData.map(s => s.carrier).filter(Boolean))];
      const allCarriers = new Set(['Viettel', 'Vinaphone', 'Mobifone', 'Wintel']);
      carriersFromDB.forEach(c => {
         const capitalized = c.trim().charAt(0).toUpperCase() + c.trim().slice(1).toLowerCase();
         allCarriers.add(capitalized);
      });
      
      const currentVal = filterSelect.value;
      let optHtml = '<option value="">Tất cả mạng</option>';
      Array.from(allCarriers).forEach(c => {
        optHtml += `<option value="${c}">${c}</option>`;
      });
      filterSelect.innerHTML = optHtml;
      filterSelect.value = currentVal;
    }

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
    
    let queChuName = sim.sim_que || '—';
    let queBienName = '';
    
    // Auto calculate Quẻ Biến 
    if (typeof analyzeSim === 'function' && sim.phone_number) {
       const res = analyzeSim(sim.phone_number);
       if (res && res.queDich) {
          queChuName = res.queDich.queChu?.name || queChuName;
          queBienName = res.queDich.queBien?.name || '';
       }
    }
    
    let queHtml = '';
    if (queChuName && queChuName !== '—') {
      const colorChu = typeof getQueColor === 'function' ? getQueColor(queChuName) : 'inherit';
      queHtml += `<div>☯️ Quẻ chủ: <strong style="color: ${colorChu}">${queChuName}</strong></div>`;
    }
    if (queBienName && queBienName !== '—') {
      const colorBien = typeof getQueColor === 'function' ? getQueColor(queBienName) : 'inherit';
      queHtml += `<div style="margin-top:4px;">🔄 Quẻ biến: <strong style="color: ${colorBien}">${queBienName}</strong></div>`;
    }

    html += `
      <div class="vvip-card" onclick="analyzeVvipSim('${sim.phone_number}', '${formatPrice}')">
        <button class="btn-delete-vvip" onclick="deleteSimFromVvip(${sim.id}, event)" title="Xóa thẻ sim này">🗑</button>
        <div class="vvip-card__header">
          <div class="vvip-phone">${formatPhone(sim.phone_number)}</div>
          <div class="vvip-price">${formatPrice}</div>
        </div>
        <div class="vvip-card__body">
          <div class="vvip-tags">
            <span class="vvip-tag-chip carrier-chip">${sim.carrier || 'KXD'}</span>
            ${tags}
          </div>
          ${queHtml ? `<div class="vvip-que">${queHtml}</div>` : ''}
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

function filterVVIPList() {
  const carrier = document.getElementById('vvip-filter-carrier')?.value || '';
  const search = document.getElementById('vvip-search-input')?.value.trim().toLowerCase() || '';

  let filtered = allVipData;
  if (carrier) {
    filtered = filtered.filter(s => s.carrier === carrier);
  }
  if (search) {
    filtered = filtered.filter(s => 
      (s.phone_number?.toLowerCase().includes(search)) || 
      (s.tags?.toLowerCase().includes(search)) ||
      (s.sim_que?.toLowerCase().includes(search))
    );
  }
  
  // Hiển thị ra giao diện
  renderVVIPList(filtered);
}

// Logic hook nhảy sang Tab phân tích 1 số
function analyzeVvipSim(phoneNumber, priceLabel) {
  const btnSingle = document.getElementById('tab-btn-single');
  if (btnSingle) btnSingle.click();

  const inputSingle = document.getElementById('input-single');
  const btnAnalyzeSingle = document.getElementById('btn-single');
  
  if (inputSingle && btnAnalyzeSingle) {
    if (priceLabel) inputSingle.dataset.price = priceLabel;
    inputSingle.value = phoneNumber;
    btnAnalyzeSingle.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function formatVND(n) {
  if (!n) return '';
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

// Logic Lưu một thẻ sim từ màn hình phân tích trực tiếp (Không hỏi han)
window.saveCurrentSim = async function(phone) {
  if (!phone) {
    alert('Vui lòng phân tích số điện thoại trước khi lưu!');
    return;
  }
  
  const simData = window.lastAnalyzedSingle;
  if (!simData || simData.digits !== phone) return;

  const tuTruongChinh = (simData.luanGiai && simData.luanGiai.summary && simData.luanGiai.summary.breakdown) 
      ? Object.values(simData.luanGiai.summary.breakdown).sort((a,b) => b.count - a.count).slice(0,3).map(d => d.name).join(', ')
      : '';

  await doInsertVvip({
    phone_number: phone,
    carrier: simData.nhaMang || '',
    sim_que: simData.queDich?.queChu?.name || '',
    que_bien: simData.queDich?.queBien?.name || '',
    cat_percent: simData.luanGiai?.catPercent || 0,
    hung_percent: simData.luanGiai?.hungPercent || 0,
    tu_truong_chinh: tuTruongChinh,
    price: simData.price ? parseInt(String(simData.price).replace(/[^0-9]/g, ''), 10) : null,
    tags: ""
  });
};

window.saveBatchSim = async function(phone) {
  if (!phone || !window.lastAnalyzedBatch) return;

  const item = window.lastAnalyzedBatch.find(i => i.digits === phone);
  if (!item) return;

  const r = item.result;
  if (!r || r.error) return;

  const tuTruongChinh = (r.luanGiai && r.luanGiai.summary && r.luanGiai.summary.breakdown) 
      ? Object.values(r.luanGiai.summary.breakdown).sort((a,b) => b.count - a.count).slice(0,3).map(d => d.name).join(', ')
      : '';

  const cleanInt = String(item.price || '').replace(/[^0-9]/g, '');
  const priceInt = cleanInt ? parseInt(cleanInt, 10) : null;
  
  await doInsertVvip({
    phone_number: phone,
    carrier: item.carrier || r.nhaMang || '',
    sim_que: r.queDich?.queChu?.name || '',
    que_bien: r.queDich?.queBien?.name || '',
    cat_percent: r.luanGiai?.catPercent || 0,
    hung_percent: r.luanGiai?.hungPercent || 0,
    tu_truong_chinh: tuTruongChinh,
    price: priceInt,
    tags: ""
  });
};

async function doInsertVvip(data) {
  // Cố gắng tự vá lỗi nếu Supabase load chậm
  if (!window.SupabaseClient && window.supabase && window.SUPABASE_URL) {
    window.SupabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  if (!window.SupabaseClient) {
    alert('⚠️ Lỗi: Không thể kết nối với kho dữ liệu (Supabase chưa tải xong).\nMẹo: Vui lòng F5 tải lại trang hoặc thử tắt các ứng dụng chặn quảng cáo (AdBlock)!');
    return;
  }
  
  try {
    const { error } = await window.SupabaseClient.from('sim_vvip').insert([data]);
    if (error) throw error;
    
    alert('✅ Đã lưu thẻ sim thành công vào Kho VVIP!');
    
    // Tự động reload lại tab nếu đang mở
    if (window.vvipLoaded) {
      loadVVIPData();
    }
  } catch(e) {
    alert('❌ Lỗi khi lưu: ' + e.message);
  }
}

window.deleteSimFromVvip = async function(id, event) {
  event.stopPropagation(); // Không kích hoạt nhảy trang phân tích
  if (!confirm('Bạn có chắc chắn muốn xóa thẻ sim này khỏi kho VVIP không?')) return;
  
  try {
    const { error } = await window.SupabaseClient.from('sim_vvip').delete().eq('id', id);
    if (error) throw error;
    
    // Reload lại UI
    loadVVIPData();
  } catch(e) {
    alert('❌ Lỗi khi xóa: ' + e.message);
  }
};

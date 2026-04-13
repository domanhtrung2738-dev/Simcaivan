/**
 * ============================================================
 *  Sim Cài Vận – Supabase to Google Sheets Auto Backup
 * ============================================================
 * 
 * Hướng dẫn cài đặt:
 * 1. Mở Google Sheets -> Tiện ích mở rộng (Extensions) -> Apps Script
 * 2. Xóa hết code cũ, dán toàn bộ đoạn code này vào.
 * 3. Điền `SUPABASE_URL` và `SUPABASE_KEY` bên dưới.
 * 4. Nhấn nút "Lưu" (Save).
 * 5. Bấm icon Đồng hồ (Triggers / Kích hoạt) bên menu trái.
 * 6. Thêm bộ kích hoạt (Add trigger):
 *    - Hàm chạy: syncSupabaseToSheet
 *    - Sự kiện: Nguồn thời gian (Time-driven)
 *    - Kiểu kích hoạt: Bộ đếm giờ (Hour timer)
 *    - Chu kỳ: Mỗi 2 giờ (Every 2 hours)
 * 7. Lưu và Cấp quyền cho Script chạy.
 */

const SUPABASE_URL = 'https://zdxeadkxwocgkvumzprk.supabase.co'; 
// API URL của bạn (Ví dụ: https://xyz.supabase.co)

const SUPABASE_KEY = 'sb_publishable_XrTybfIlazMYUqXXqzQ_CA_rnQgQCaq'; 
// Lấy thẻ ANON_KEY hoặc SERVICE_ROLE_KEY trong mục Settings > API của Supabase

const SHEET_NAME = 'KhoSim_Backup'; 
// Tên Tab Sheet dùng để lưu dữ liệu

/**
 * Tự động tạo Menu khi mở Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💎 KHO SIM VVIP')
    .addItem('⬇️ Kéo dữ liệu mới nhất từ Supabase', 'syncSupabaseToSheet')
    .addToUi();
}

function syncSupabaseToSheet() {
  const table = 'sim_vvip';
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;

  const options = {
    method: 'get',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  try {
    // 1. Fetch data từ Supabase
    const response = UrlFetchApp.fetch(url, options);
    const jsonStr = response.getContentText();
    
    if (response.getResponseCode() !== 200) {
      Logger.log("Lỗi khi kết nối Supabase: " + jsonStr);
      return;
    }

    const data = JSON.parse(jsonStr);
    if (!data || data.length === 0) {
      Logger.log("Không có dữ liệu từ Supabase.");
      return;
    }

    // 2. Chuẩn bị thao tác với Google Sheets
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Nếu chưa có tab KhoSim_Backup thì tự động tạo mới
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Tạo tiêu đề luôn
      sheet.appendRow(["ID", "Phone", "Price", "Carrier", "Tags", "Sim_Que", "Created_At", "Last Backup Time"]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#f3f3f3");
    }

    // Xóa toàn bộ dữ liệu cũ (trừ dòng Header số 1)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }

    // 3. Đổ dữ liệu mới vào
    const rows = [];
    const now = new Date().toLocaleString("vi-VN");

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      rows.push([
        row.id || '',
        row.phone_number || '',
        row.price || '',
        row.carrier || '',
        row.tags || '',
        row.sim_que || '',
        row.created_at || '',
        now // Đóng dấu thời gian backup cuối
      ]);
    }

    // Ghi nhiều dòng cùng lúc siêu tốc độ
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    Logger.log(`Đã backup thành công ${rows.length} số sim vào lúc ${now}`);

  } catch (e) {
    Logger.log("Đã xảy ra lỗi hệ thống cục bộ: " + e.message);
  }
}

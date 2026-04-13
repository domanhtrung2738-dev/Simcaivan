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

/**
 * Hàm hỗ trợ chạy qua đường link Web App (GET)
 */
function doGet(e) {
  try {
    syncSupabaseToSheet();
    return ContentService.createTextOutput("Đồng bộ dữ liệu Supabase -> Google Sheets thành công!");
  } catch (err) {
    return ContentService.createTextOutput("Lỗi đồng bộ: " + err.message);
  }
}

/**
 * Hàm hỗ trợ chạy qua đường link Web App (POST)
 */
function doPost(e) {
  try {
    syncSupabaseToSheet();
    return ContentService.createTextOutput("Đồng bộ dữ liệu Supabase -> Google Sheets thành công!");
  } catch (err) {
    return ContentService.createTextOutput("Lỗi đồng bộ: " + err.message);
  }
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
      // Tạo tiêu đề 12 cột (thay vì 8 cột như cũ)
      sheet.appendRow(["ID", "Phone", "Price", "Carrier", "Tags", "Sim_Que", "Que_Bien", "Cat_Percent", "Hung_Percent", "Tu_Truong_Chinh", "Created_At", "Last Backup Time"]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#f3f3f3");
    }

    // Đọc dữ liệu hiện tại từ Sheet
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn() < 12 ? 12 : sheet.getLastColumn();
    let currentData = [];
    if (lastRow > 1) {
      currentData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    }

    // Map dữ liệu từ Supabase để dễ tìm kiếm
    const supabaseMap = new Map();
    data.forEach(r => supabaseMap.set(String(r.id), r));

    const finalRows = [];
    const deletedIndices = [];
    const now = new Date().toLocaleString("vi-VN");

    // Xử lý các dòng đã có trong Sheet (Giữ nguyên vị trí)
    for (let i = 0; i < currentData.length; i++) {
      const sheetRow = currentData[i];
      const id = String(sheetRow[0]);
      
      if (!id) continue;
      
      if (supabaseMap.has(id)) {
        // Sim vẫn còn tồn tại -> Cập nhật thông tin mới nhất
        const row = supabaseMap.get(id);
        finalRows.push([
          row.id || '',
          row.phone_number || '',
          row.price || '',
          row.carrier || '',
          row.tags || '',
          row.sim_que || '',
          row.que_bien || '',
          row.cat_percent || '',
          row.hung_percent || '',
          row.tu_truong_chinh || '',
          row.created_at || '',
          now 
        ]);
        supabaseMap.delete(id); // Đánh dấu đã xử lý xong
      } else {
        // Sim ĐÃ BỊ XÓA trên Web -> Giữ lại dòng cũ trên Sheet và gạch ngang
        finalRows.push(sheetRow); 
        deletedIndices.push(finalRows.length - 1); // 0-based index
      }
    }

    // Xử lý các Sim MỚI THÊM vào Supabase chưa có ở Sheet
    supabaseMap.forEach((row, id) => {
      finalRows.push([
        row.id || '',
        row.phone_number || '',
        row.price || '',
        row.carrier || '',
        row.tags || '',
        row.sim_que || '',
        row.que_bien || '',
        row.cat_percent || '',
        row.hung_percent || '',
        row.tu_truong_chinh || '',
        row.created_at || '',
        now
      ]);
    });

    if (finalRows.length > 0) {
      // 3. Xóa data cũ và đổ data mới
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
        sheet.getRange(2, 1, lastRow - 1, lastCol).setFontLine("none").setFontColor("black"); // Xóa gạch ngang cũ
      }
      
      sheet.getRange(2, 1, finalRows.length, 12).setValues(finalRows);
      
      // 4. Kẻ vạch ngang cho các Sim đã bị xóa
      if (deletedIndices.length > 0) {
        const rangesToStrike = [];
        deletedIndices.forEach(idx => {
          const rowIndex = idx + 2; // +1 vì header, +1 vì index bắt đầu từ 0
          rangesToStrike.push(`A${rowIndex}:L${rowIndex}`);
        });
        
        // Dùng RangeList để chỉnh CSS định dạng hàng loạt siêu nhanh
        const rangeList = sheet.getRangeList(rangesToStrike);
        rangeList.setFontLine("line-through");
        rangeList.setFontColor("#b0bec5"); // Bôi xám cho mờ đi
      }
    }
    
    Logger.log(`Đã backup thành công ${finalRows.length} số sim. Trong đó có ${deletedIndices.length} số đã bán/xóa.`);

  } catch (e) {
    Logger.log("Đã xảy ra lỗi hệ thống cục bộ: " + e.message);
  }
}

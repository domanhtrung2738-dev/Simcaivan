// Thay thế bằng URL và ANON_KEY từ dự án Supabase của bạn
window.SUPABASE_URL = 'https://zdxeadkxwocgkvumzprk.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_XrTybfIlazMYUqXXqzQ_CA_rnQgQCaq';

// Khởi tạo client chỉ khi thư viện supabase đã được nhúng
if (window.supabase) {
  window.SupabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  console.log('Supabase client initialized');
} else {
  console.error('Lỗi: Thư viện Supabase JS chưa được tải. Vui lòng kiểm tra mạng hoặc trình chặn quảng cáo.');
  window.SupabaseClient = null;
}

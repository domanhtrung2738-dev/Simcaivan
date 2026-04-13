/**
 * ============================================================
 *  Sim Cài Vận – Supabase Configuration
 * ============================================================
 */

// Thay thế bằng URL và ANON_KEY từ dự án Supabase của bạn
const SUPABASE_URL = 'https://XXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbG...';

// Khởi tạo client chỉ khi thư viện supabase đã được nhúng
let supabase = null;
if (window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase client initialized');
} else {
  console.warn('Supabase JS chưa được tải!');
}

window.SupabaseClient = supabase;

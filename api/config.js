// Konfigurasi awam untuk pelayar. SUPABASE_ANON_KEY memang direka untuk didedahkan
// (akses dikawal oleh Row Level Security dalam supabase/setup.sql).
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
  });
}

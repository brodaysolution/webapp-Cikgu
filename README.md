# CikguDocs

**Isi sekali, siap semua! ☺️**

Webapp untuk guru menjana dokumen program sekolah: **isi maklumat sekali, siap semua dokumen.**

## Dokumen yang dijana
- Kertas kerja / cadangan (termasuk AJK, atur cara, implikasi kewangan)
- Surat lantikan AJK (satu surat bagi setiap AJK)
- Surat jemputan (satu surat bagi setiap tetamu)
- Buku program (kulit, atur cara, kata aluan, penerima anugerah, AJK)
- Senarai kehadiran
- Jadual perbandingan sebut harga (3 pembekal, syor harga terendah, landskap)
- Laporan kewangan (peruntukan, perbelanjaan, baki + lampiran gambar resit)
- Laporan program / OPR satu muka surat dengan gambar

## Cara guna
1. Buka link hosting (lihat bahagian Hosting). `index.html` juga boleh dibuka terus, tetapi Cikgu AI Assistant hanya berfungsi melalui hosting.
2. Isi **Profil Sekolah** (nama, alamat, logo, pengetua). Tandatangan adalah pilihan.
3. **Cipta Program** dari templat "Hari Anugerah Kecemerlangan" atau templat kosong.
4. Isi tab Maklumat, Jawatankuasa, Tetamu dan lain-lain. Senarai boleh ditampal terus dari Excel.
5. Buka tab **Jana Dokumen**, kemudian **Cetak / Simpan PDF**.

Bila Supabase dikonfigurasi, pengguna log masuk (Google atau pautan e-mel) dan data serta gambar disimpan secara online.
Tanpa Supabase, data disimpan dalam pelayar (localStorage); gunakan butang **Data Backup** untuk muat turun salinan.
`contoh-output.pdf` ialah contoh hasil penjanaan.

## Cikgu AI Assistant
Butang terapung **Cikgu AI Assistant** (bawah kanan) dalam setiap program: cikgu boleh chat dan minta AI isi maklumat
(latar belakang, objektif, atur cara, AJK, bajet) serta lampirkan gambar/PDF/teks rujukan
(contoh: senarai nama, kertas kerja lama). AI terus mengemas kini data program.

Backend: `api/chat.js` (Vercel serverless function, Claude API). API key disimpan di pelayan sahaja.

## Hosting (Vercel)
1. Daftar di https://vercel.com (log masuk dengan GitHub).
2. **Add New → Project**, import repo ini, pilih branch, tekan **Deploy** (tiada build command diperlukan).
3. Di **Settings → Environment Variables** tambah:
   - `ANTHROPIC_API_KEY`: API key dari https://console.anthropic.com
   - `KOD_AKSES` (pilihan, disyorkan): kod rahsia yang cikgu perlu isi dalam Cikgu AI Assistant, supaya orang luar tidak guna kredit API anda.
4. **Redeploy**. Kongsi link `https://<projek>.vercel.app` dengan cikgu.

## Log masuk & simpanan online (Supabase)
1. Daftar di https://supabase.com dan cipta projek baharu (pilih region Singapore).
2. **SQL Editor**: tampal kandungan `supabase/setup.sql` dan tekan **Run**. Ini mencipta jadual `user_data`, bucket peribadi `gambar`, dan polisi keselamatan (setiap pengguna hanya nampak data sendiri).
3. **Authentication > URL Configuration**: Site URL = link Vercel anda (cth `https://cikgudocs.vercel.app`), dan tambah link yang sama dalam Redirect URLs.
4. **Authentication > Providers > Google**: aktifkan, masukkan Client ID dan Secret dari Google Cloud Console (OAuth client jenis Web, redirect URI = `https://<projek>.supabase.co/auth/v1/callback`). Log masuk e-mel (pautan ajaib) aktif secara lalai.
5. **Project Settings > API**: salin Project URL dan anon public key.
6. Dalam Vercel > Environment Variables tambah:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (Config, bukan rahsia)
   - `EMEL_DIBENARKAN` (pilihan): siapa boleh guna AI, cth `@moe-dl.edu.my,cikgu.ali@gmail.com`
   - `KOD_AKSES` tidak lagi digunakan bila Supabase aktif.
7. Redeploy.

Data pelayar sedia ada dipindahkan ke akaun secara automatik pada log masuk pertama.

## Fasa seterusnya
- Sijil dan backdrop
- Perkongsian program dengan AJK

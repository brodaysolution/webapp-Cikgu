# Fail Program Cikgu (MVP)

Webapp untuk guru menjana dokumen program sekolah: **isi maklumat sekali, siap semua dokumen.**

## Dokumen yang dijana
- Kertas kerja / cadangan (termasuk AJK, atur cara, implikasi kewangan)
- Surat lantikan AJK (satu surat bagi setiap AJK)
- Surat jemputan (satu surat bagi setiap tetamu)
- Buku program (kulit, atur cara, kata aluan, penerima anugerah, AJK)
- Senarai kehadiran

## Cara guna
1. Buka link hosting (lihat bahagian Hosting). `index.html` juga boleh dibuka terus, tetapi Pembantu AI hanya berfungsi melalui hosting.
2. Isi **Profil Sekolah** (nama, alamat, logo, pengetua). Tandatangan adalah pilihan.
3. **Cipta Program** dari templat "Hari Anugerah Kecemerlangan" atau templat kosong.
4. Isi tab Maklumat, Jawatankuasa, Tetamu dan lain-lain. Senarai boleh ditampal terus dari Excel.
5. Buka tab **Jana Dokumen**, kemudian **Cetak / Simpan PDF**.

Data disimpan dalam pelayar (localStorage). Gunakan butang **Sandaran** untuk muat turun salinan.
`contoh-output.pdf` ialah contoh hasil penjanaan.

## Pembantu AI
Tab **🤖 Pembantu AI** dalam setiap program: cikgu boleh chat dan minta AI isi maklumat
(latar belakang, objektif, atur cara, AJK, bajet) serta lampirkan gambar/PDF/teks rujukan
(contoh: senarai nama, kertas kerja lama). AI terus mengemas kini data program.

Backend: `api/chat.js` (Vercel serverless function, Claude API). API key disimpan di pelayan sahaja.

## Hosting (Vercel)
1. Daftar di https://vercel.com (log masuk dengan GitHub).
2. **Add New → Project**, import repo ini, pilih branch, tekan **Deploy** (tiada build command diperlukan).
3. Di **Settings → Environment Variables** tambah:
   - `ANTHROPIC_API_KEY`: API key dari https://console.anthropic.com
   - `KOD_AKSES` (pilihan, disyorkan): kod rahsia yang cikgu perlu isi dalam tab Pembantu AI, supaya orang luar tidak guna kredit API anda.
4. **Redeploy**. Kongsi link `https://<projek>.vercel.app` dengan cikgu.

## Fasa seterusnya
- Sebut harga, resit dan laporan kewangan automatik
- Laporan program / OPR dengan gambar
- Sijil dan backdrop
- Log masuk dan perkongsian dengan AJK

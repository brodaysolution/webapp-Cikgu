// Vercel serverless function: pembantu AI untuk CikguDocs.
// Env yang diperlukan: ANTHROPIC_API_KEY. Pilihan: KOD_AKSES (kod yang cikgu perlu masukkan).
import Anthropic from "@anthropic-ai/sdk";

export const config = { maxDuration: 60 };

const client = new Anthropic();

const FIELD_KEYS = ["nama", "tarikh", "masa", "tempat", "anjuran", "perasmi", "rujFail", "tarikhSurat",
  "penyelaras", "jawatanPenyelaras", "latar", "objektif", "sasaran", "sumberKewangan", "kataAlu", "penutup",
  "bilPeserta", "pencapaian", "rumusan", "kekuatan", "kelemahan", "cadangan", "pembekalA", "pembekalB", "pembekalC"];
const TABLE_KEYS = ["ajk", "tetamu", "aturcara", "penerima", "kehadiran", "bajet", "sebutharga", "peruntukan", "perbelanjaan"];

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["balasan", "medan", "jadual"],
  properties: {
    balasan: { type: "string", description: "Balasan ringkas kepada cikgu dalam Bahasa Melayu." },
    medan: {
      type: "array",
      description: "Medan maklumat program yang perlu dikemas kini. Kosong jika tiada perubahan.",
      items: {
        type: "object", additionalProperties: false, required: ["kunci", "nilai"],
        properties: { kunci: { type: "string", enum: FIELD_KEYS }, nilai: { type: "string" } },
      },
    },
    jadual: {
      type: "array",
      description: "Senarai/jadual yang perlu dikemas kini. Kosong jika tiada perubahan.",
      items: {
        type: "object", additionalProperties: false, required: ["jadual", "mod", "baris"],
        properties: {
          jadual: { type: "string", enum: TABLE_KEYS },
          mod: { type: "string", enum: ["ganti", "tambah"] },
          baris: { type: "array", items: { type: "array", items: { type: "string" } } },
        },
      },
    },
  },
};

const SYSTEM = `Anda pembantu dokumentasi program sekolah untuk guru di Malaysia, dalam webapp "CikguDocs".
Guru akan minta anda isi atau tulis maklumat program (kertas kerja, AJK, tetamu, atur cara, penerima anugerah, kehadiran, bajet, sebut harga, peruntukan, perbelanjaan/resit, laporan program). Mereka mungkin lampirkan gambar atau PDF rujukan (contoh: kertas kerja lama, senarai nama, sebut harga, poster).

Cara anda bertindak:
- Kemas kini data program melalui "medan" dan "jadual". Webapp akan menjana surat dan dokumen daripada data ini, jadi anda tidak perlu menulis surat penuh.
- Medan: ${FIELD_KEYS.join(", ")}. "tarikh" dan "tarikhSurat" dalam format YYYY-MM-DD. "objektif" satu objektif setiap baris.
- Lajur jadual (ikut susunan ini):
  ajk: [Jawatan, Nama, Bidang tugas]
  tetamu: [Nama, Jawatan, Alamat, Panggilan hormat cth "YBhg. Dato'"]
  aturcara: [Masa, Acara]
  penerima: [Nama, Kelas, Anugerah]
  kehadiran: [Nama, Kelas/Jawatan]
  bajet: [Perkara, Kuantiti (nombor), Harga seunit RM (nombor sahaja)]
  sebutharga: [Perkara, Kuantiti, Harga seunit Pembekal A, Harga seunit Pembekal B, Harga seunit Pembekal C] (nama pembekal dalam medan pembekalA/B/C)
  peruntukan: [Sumber, Jumlah RM]
  perbelanjaan: [Tarikh DD/MM/YYYY, Pembekal, No. Resit, Perkara, Jumlah RM]
- Bila guru lampirkan gambar resit/invois, ekstrak setiap resit sebagai satu baris "perbelanjaan" (mod "tambah"). Bila guru lampirkan sebut harga pembekal, isi "sebutharga" dan nama pembekal.
- Medan laporan selepas program: bilPeserta, pencapaian, rumusan (ringkasan aktiviti), kekuatan, kelemahan, cadangan. Tulis berdasarkan maklumat yang guru beri; jangan reka angka kehadiran.
- mod "ganti" menggantikan seluruh jadual; "tambah" menambah baris. Guna "ganti" untuk jadual yang anda susun semula sepenuhnya.
- Bila mengekstrak daripada lampiran, salin nama dan angka dengan tepat. Jangan reka nama orang, harga atau tarikh yang tidak diberi; tinggalkan kosong dan beritahu guru apa yang perlu dilengkapkan.
- Guna Bahasa Melayu baku yang sesuai untuk dokumen rasmi sekolah KPM.
- Jika soalan biasa (bukan permintaan mengisi data), jawab dalam "balasan" dan biarkan medan/jadual kosong.
- "balasan" mesti ringkas: nyatakan apa yang anda ubah dan apa yang guru perlu semak.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Guna POST." });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "Pelayan belum dikonfigurasi (ANTHROPIC_API_KEY tiada)." });

  const { kod, program, sejarah = [], mesej = "", lampiran = [] } = req.body || {};
  if (process.env.KOD_AKSES && kod !== process.env.KOD_AKSES) return res.status(401).json({ error: "Kod akses salah." });
  if (!mesej.trim() && !lampiran.length) return res.status(400).json({ error: "Mesej kosong." });

  // Sejarah perbualan (teks sahaja), maks 10 giliran terakhir.
  const messages = sejarah.slice(-10)
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text)
    .map(m => ({ role: m.role, content: m.text }));
  while (messages.length && messages[0].role !== "user") messages.shift();

  const content = [];
  for (const f of lampiran.slice(0, 5)) {
    if (/^image\/(png|jpeg|gif|webp)$/.test(f.type)) {
      content.push({ type: "image", source: { type: "base64", media_type: f.type, data: f.data } });
    } else if (f.type === "application/pdf") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.data }, title: f.name });
    } else if (f.text) {
      content.push({ type: "document", source: { type: "text", media_type: "text/plain", data: f.text }, title: f.name });
    }
  }
  content.push({
    type: "text",
    text: `Data program semasa (JSON):\n${JSON.stringify(program || {})}\n\nPermintaan cikgu:\n${mesej || "(lihat lampiran)"}`,
  });
  // Gabung jika giliran terakhir dalam sejarah juga 'user'.
  if (messages.length && messages[messages.length - 1].role === "user") messages.pop();
  messages.push({ role: "user", content });

  try {
    const response = await client.messages.create({
      model: "claude-haiku-5-5",
      max_tokens: 16000,
      system: SYSTEM,
      messages,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
    });
    if (response.stop_reason === "refusal") return res.status(200).json({ balasan: "Maaf, permintaan ini tidak dapat diproses. Cuba ubah ayat permintaan.", medan: [], jadual: [] });
    if (response.stop_reason === "max_tokens") return res.status(200).json({ balasan: "Jawapan terlalu panjang dan terpotong. Cuba minta sebahagian demi sebahagian.", medan: [], jadual: [] });
    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "Terlalu banyak permintaan. Cuba lagi sebentar." });
    if (err instanceof Anthropic.BadRequestError) return res.status(400).json({ error: "Permintaan ditolak: " + err.message });
    if (err instanceof Anthropic.APIError) return res.status(502).json({ error: "Ralat perkhidmatan AI. Cuba lagi." });
    if (err instanceof SyntaxError) return res.status(502).json({ error: "Jawapan AI tidak dapat dibaca. Cuba lagi." });
    console.error(err);
    return res.status(500).json({ error: "Ralat pelayan." });
  }
}

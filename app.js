/* Fail Program Cikgu — MVP. Semua data disimpan dalam pelayar (localStorage). */
const KEY = 'failProgramCikgu.v1';
const $ = s => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

let db = load();
let view = 'programs', currentId = null, tab = 'info';

function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.programs) return d; } catch (e) {}
  return { school: {}, programs: [] };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { alert('Gagal simpan. Storan pelayar mungkin penuh (cuba kecilkan saiz logo/tandatangan).'); }
}

const TABLES = {
  ajk:       { label: 'Jawatankuasa', cols: ['Jawatan', 'Nama', 'Bidang tugas (pilihan)'] },
  tetamu:    { label: 'Tetamu', cols: ['Nama', 'Jawatan', 'Alamat', 'Panggilan (cth: YBhg. Dato\')'] },
  aturcara:  { label: 'Atur Cara', cols: ['Masa', 'Acara'] },
  penerima:  { label: 'Penerima Anugerah', cols: ['Nama', 'Kelas', 'Anugerah'] },
  kehadiran: { label: 'Kehadiran', cols: ['Nama', 'Kelas / Jawatan'] },
  bajet:     { label: 'Bajet', cols: ['Perkara', 'Kuantiti', 'Harga seunit (RM)'] },
};

const TEMPLATES = {
  kosong: { nama: 'Program Baharu' },
  hak: {
    nama: 'Majlis Hari Anugerah Kecemerlangan',
    latar: 'Majlis Hari Anugerah Kecemerlangan diadakan setiap tahun bagi meraikan dan menghargai kejayaan murid dalam bidang akademik, kokurikulum dan sahsiah. Majlis ini juga menjadi medium untuk memotivasikan murid lain agar terus berusaha mencapai kecemerlangan.',
    objektif: 'Menghargai kejayaan murid dalam akademik, kokurikulum dan sahsiah.\nMemotivasikan murid untuk terus cemerlang.\nMengeratkan hubungan antara sekolah, ibu bapa dan komuniti.',
    sasaran: 'Murid penerima anugerah, ibu bapa, guru dan tetamu jemputan.',
    masa: '8.00 pagi – 12.30 tengah hari', tempat: 'Dewan Sekolah',
    ajk: [['Penaung', ''], ['Penasihat', ''], ['Pengerusi', ''], ['Naib Pengerusi', ''], ['Setiausaha', ''], ['Bendahari', ''],
          ['AJK Hadiah & Sijil', ''], ['AJK Pentas & Dekorasi', ''], ['AJK Jamuan', ''], ['AJK Protokol & Tetamu', ''],
          ['AJK Siaraya & Dokumentasi', ''], ['AJK Buku Program', ''], ['AJK Kehadiran Murid', '']],
    aturcara: [['7.30 pagi', 'Ketibaan murid, ibu bapa dan guru'], ['8.00 pagi', 'Ketibaan tetamu kehormat'],
               ['8.15 pagi', 'Nyanyian lagu Negaraku, lagu negeri dan lagu sekolah'], ['8.30 pagi', 'Bacaan doa'],
               ['8.40 pagi', 'Ucapan Pengerusi Majlis'], ['8.50 pagi', 'Ucapan Pengetua'], ['9.10 pagi', 'Ucapan perasmian'],
               ['9.30 pagi', 'Penyampaian anugerah'], ['11.30 pagi', 'Persembahan murid'], ['12.00 tengah hari', 'Jamuan dan bersurai']],
    bajet: [['Hadiah / piala', '', ''], ['Sijil & bingkai', '', ''], ['Jamuan', '', ''], ['Backdrop & dekorasi', '', ''], ['Cetakan buku program', '', '']],
  },
};

/* ===================== VIEWS ===================== */
function render() {
  document.querySelectorAll('.topbar nav button').forEach(b => b.classList.toggle('active', b.dataset.view === (view === 'program' ? 'programs' : view)));
  const app = $('#app');
  if (view === 'school') app.innerHTML = schoolView();
  else if (view === 'program') app.innerHTML = programView();
  else app.innerHTML = listView();
  bind();
}

function listView() {
  const ps = db.programs.slice().sort((a, b) => (b.tarikh || '').localeCompare(a.tarikh || ''));
  return `${!db.school.nama ? `<div class="card" style="border-color:#e0a800">⚠️ Sila lengkapkan <a href="#" data-go="school">Profil Sekolah</a> dahulu (nama, logo, pengetua) — ia digunakan dalam semua dokumen.</div>` : ''}
  <div class="card"><h2>Program Baharu</h2>
    <div class="row"><select id="tpl"><option value="hak">Templat: Hari Anugerah Kecemerlangan</option><option value="kosong">Templat: Kosong</option></select>
    <button class="primary" id="btn-new">+ Cipta Program</button></div></div>
  <div class="card prog-list"><h2>Senarai Program (${ps.length})</h2>
    ${ps.length ? ps.map(p => `<div class="item"><div><b>${esc(p.nama)}</b><div class="muted">${tarikhMs(p.tarikh, true)} · ${esc(p.tempat || '')}</div></div>
      <div class="row"><button data-open="${p.id}" class="primary small">Buka</button>
      <button data-dup="${p.id}" class="small">Salin</button><button data-del="${p.id}" class="small danger">Padam</button></div></div>`).join('')
      : '<p class="muted">Belum ada program.</p>'}</div>
  <div class="card"><h2>Sandaran Data</h2><p class="muted">Data disimpan dalam pelayar ini sahaja. Muat turun sandaran secara berkala.</p>
    <div class="row"><button id="btn-export">⬇️ Muat turun sandaran (.json)</button>
    <label class="row" style="flex-direction:row"><span>⬆️ Pulihkan:</span><input type="file" id="imp" accept=".json" style="width:auto"></label></div></div>`;
}

function field(obj, key, label, type = 'text', cls = '') {
  const v = esc(obj[key] || '');
  return `<label class="${cls}">${label}${type === 'textarea'
    ? `<textarea data-f="${key}">${v}</textarea>` : `<input type="${type}" data-f="${key}" value="${v}">`}</label>`;
}

function schoolView() {
  const S = db.school;
  return `<div class="card"><h2>Profil Sekolah</h2><p class="muted">Diisi sekali sahaja. Digunakan sebagai kepala surat & tandatangan semua dokumen.</p>
    <div class="grid" data-scope="school">
      ${field(S, 'nama', 'Nama sekolah', 'text', 'full')}
      ${field(S, 'alamat', 'Alamat', 'textarea', 'full')}
      ${field(S, 'telefon', 'No. telefon')}${field(S, 'emel', 'E-mel')}
      ${field(S, 'kodRujukan', 'Kod rujukan fail lalai (cth: SMKXX.HEM.100-1/2/3)')}
      ${field(S, 'pengetua', 'Nama Pengetua / Guru Besar')}
      ${field(S, 'jawatanPengetua', 'Jawatan (cth: Pengetua)')}
      ${field(S, 'cogankata', 'Cogan kata surat (cth: "MALAYSIA MADANI")')}
      <label>Logo sekolah<input type="file" accept="image/*" data-img="logo">${S.logo ? `<img class="thumb" src="${S.logo}"> <button class="small danger" data-rmimg="logo">Buang</button>` : ''}</label>
      <label>Tandatangan pengetua (pilihan, untuk softcopy)<input type="file" accept="image/*" data-img="tandatangan">${S.tandatangan ? `<img class="thumb" src="${S.tandatangan}"> <button class="small danger" data-rmimg="tandatangan">Buang</button>` : ''}
        <span class="muted">Guna hanya dengan kebenaran pengetua. Jika kosong, ruang tandatangan manual disediakan.</span></label>
    </div></div>`;
}

function programView() {
  const P = cur();
  if (!P) { view = 'programs'; return listView(); }
  const tabs = [['info', 'Maklumat'], ...Object.entries(TABLES).map(([k, t]) => [k, t.label]), ['docs', '📄 Jana Dokumen']];
  let body;
  if (tab === 'info') body = `<div class="grid" data-scope="program">
      ${field(P, 'nama', 'Nama program', 'text', 'full')}
      ${field(P, 'tarikh', 'Tarikh program', 'date')}${field(P, 'masa', 'Masa')}${field(P, 'tempat', 'Tempat')}
      ${field(P, 'anjuran', 'Anjuran (cth: Unit HEM)')}${field(P, 'perasmi', 'Perasmi / tetamu kehormat (nama sama seperti dalam tab Tetamu)')}
      ${field(P, 'rujFail', 'No. rujukan fail program')}${field(P, 'tarikhSurat', 'Tarikh surat', 'date')}
      ${field(P, 'penyelaras', 'Nama penyelaras / setiausaha')}${field(P, 'jawatanPenyelaras', 'Jawatan penyelaras')}
      ${field(P, 'latar', 'Pengenalan / latar belakang', 'textarea', 'full')}
      ${field(P, 'objektif', 'Objektif (satu baris = satu objektif)', 'textarea', 'full')}
      ${field(P, 'sasaran', 'Kumpulan sasaran', 'textarea', 'full')}
      ${field(P, 'sumberKewangan', 'Sumber kewangan (cth: PIBG / SUWA)', 'text', 'full')}
      ${field(P, 'kataAlu', 'Kata aluan (untuk buku program, pilihan)', 'textarea', 'full')}
      ${field(P, 'penutup', 'Penutup kertas kerja (pilihan)', 'textarea', 'full')}</div>`;
  else if (tab === 'docs') body = `<p class="muted">Pilih dokumen untuk pratonton, kemudian tekan <b>Cetak / Simpan PDF</b> (pilih "Save as PDF" dalam dialog cetak).</p>
      <div class="doc-grid">${Object.entries(DOCS).map(([k, d]) => `<button data-doc="${k}"><b>${d.tajuk}</b>
      <div class="muted">${d.perItem ? rows(P[d.perItem]).filter(r => String(r[d.perItem === 'ajk' ? 1 : 0] || '').trim()).length + ' surat' : 'Satu dokumen'}</div></button>`).join('')}
      <button data-doc="ALL"><b>📦 Semua dokumen</b><div class="muted">Satu fail PDF lengkap</div></button></div>`;
  else body = tableEditor(tab, P);
  return `<div class="row" style="justify-content:space-between;margin-bottom:10px"><button data-go="programs">← Senarai program</button><b>${esc(P.nama)}</b></div>
    <div class="tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'active' : ''}">${l}</button>`).join('')}</div>
    <div class="card">${body}</div>`;
}

function tableEditor(key, P) {
  const t = TABLES[key]; const data = P[key] || [];
  return `<h2>${t.label}</h2>
    <p class="muted">Tip: salin beberapa baris dari Excel / Google Sheets dan tampal ke dalam mana-mana sel — baris baharu akan ditambah automatik.</p>
    <div class="tbl-wrap"><table class="edit"><tr><th>#</th>${t.cols.map(c => `<th>${c}</th>`).join('')}<th></th></tr>
    ${data.map((r, i) => `<tr><td>${i + 1}</td>${t.cols.map((_, j) => `<td><input data-cell="${i},${j}" value="${esc(r[j] || '')}"></td>`).join('')}
      <td><button class="small danger" data-rmrow="${i}">✕</button></td></tr>`).join('')}</table></div>
    <div class="row" style="margin-top:8px"><button data-addrow>+ Tambah baris</button><button data-clear class="danger">Kosongkan</button>
    ${key === 'bajet' ? `<b>Jumlah: ${rm(rows(data).reduce((s, r) => s + (+r[1] || 0) * (+r[2] || 0), 0))}</b>` : ''}</div>`;
}

/* ===================== EVENTS ===================== */
const cur = () => db.programs.find(p => p.id === currentId);

function bind() {
  const app = $('#app');
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = e => { e.preventDefault(); view = b.dataset.go; render(); });
  app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); });

  const nb = $('#btn-new');
  if (nb) nb.onclick = () => {
    const t = JSON.parse(JSON.stringify(TEMPLATES[$('#tpl').value]));
    const p = { id: uid(), ...t, rujFail: db.school.kodRujukan || '' };
    db.programs.push(p); save(); currentId = p.id; view = 'program'; tab = 'info'; render();
  };
  app.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { currentId = b.dataset.open; view = 'program'; tab = 'info'; render(); });
  app.querySelectorAll('[data-dup]').forEach(b => b.onclick = () => {
    const src = db.programs.find(p => p.id === b.dataset.dup);
    const p = { ...JSON.parse(JSON.stringify(src)), id: uid(), nama: src.nama + ' (salinan)', tarikh: '', tarikhSurat: '' };
    db.programs.push(p); save(); render();
  });
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const p = db.programs.find(x => x.id === b.dataset.del);
    if (confirm(`Padam program "${p.nama}"? Tindakan ini tidak boleh dibatalkan.`)) { db.programs = db.programs.filter(x => x !== p); save(); render(); }
  });

  // medan teks
  app.querySelectorAll('[data-f]').forEach(inp => inp.oninput = () => {
    const scope = inp.closest('[data-scope]').dataset.scope;
    (scope === 'school' ? db.school : cur())[inp.dataset.f] = inp.value; save();
  });
  // imej
  app.querySelectorAll('[data-img]').forEach(inp => inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    resizeImage(f, 400, url => { db.school[inp.dataset.img] = url; save(); render(); });
  });
  app.querySelectorAll('[data-rmimg]').forEach(b => b.onclick = e => { e.preventDefault(); delete db.school[b.dataset.rmimg]; save(); render(); });

  // jadual
  if (TABLES[tab] && view === 'program') {
    const P = cur(); P[tab] = P[tab] || []; const ncol = TABLES[tab].cols.length;
    app.querySelectorAll('[data-cell]').forEach(inp => {
      const [i, j] = inp.dataset.cell.split(',').map(Number);
      inp.oninput = () => { P[tab][i][j] = inp.value; save(); };
      inp.onpaste = e => {
        const txt = (e.clipboardData || window.clipboardData).getData('text');
        if (!/[\t\n]/.test(txt.trim())) return;
        e.preventDefault();
        txt.replace(/\r/g, '').split('\n').filter(l => l.trim()).forEach((line, di) => {
          const cells = line.split('\t'); const ri = i + di;
          if (!P[tab][ri]) P[tab][ri] = Array(ncol).fill('');
          cells.forEach((c, dj) => { if (j + dj < ncol) P[tab][ri][j + dj] = c.trim(); });
        });
        save(); render();
      };
    });
    app.querySelectorAll('[data-rmrow]').forEach(b => b.onclick = () => { P[tab].splice(+b.dataset.rmrow, 1); save(); render(); });
    const add = app.querySelector('[data-addrow]'); if (add) add.onclick = () => { P[tab].push(Array(ncol).fill('')); save(); render(); };
    const clr = app.querySelector('[data-clear]'); if (clr) clr.onclick = () => { if (confirm('Kosongkan semua baris?')) { P[tab] = []; save(); render(); } };
  }

  app.querySelectorAll('[data-doc]').forEach(b => b.onclick = () => showDoc(b.dataset.doc));

  const ex = $('#btn-export');
  if (ex) ex.onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' }));
    a.download = 'sandaran-fail-program-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
  };
  const imp = $('#imp');
  if (imp) imp.onchange = () => {
    const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); if (!d.programs) throw 0;
      if (confirm('Gantikan semua data semasa dengan sandaran ini?')) { db = d; save(); render(); } } catch (e) { alert('Fail sandaran tidak sah.'); } };
    r.readAsText(imp.files[0]);
  };
}

function resizeImage(file, max, cb) {
  const img = new Image(), r = new FileReader();
  r.onload = () => { img.onload = () => {
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); cb(c.toDataURL('image/png'));
  }; img.src = r.result; };
  r.readAsDataURL(file);
}

function showDoc(key) {
  const P = cur(), S = db.school;
  const keys = key === 'ALL' ? Object.keys(DOCS) : [key];
  $('#preview').innerHTML = keys.map(k => DOCS[k].gen(S, P)).join('');
  $('#preview-title').textContent = key === 'ALL' ? 'Semua dokumen' : DOCS[key].tajuk;
  document.title = (P.nama || 'Dokumen') + ' - ' + $('#preview-title').textContent;
  $('#app').classList.add('hidden'); $('.topbar').classList.add('hidden'); $('#preview-wrap').classList.remove('hidden');
  window.scrollTo(0, 0);
}
$('#btn-back').onclick = () => {
  $('#preview-wrap').classList.add('hidden'); $('#app').classList.remove('hidden'); $('.topbar').classList.remove('hidden');
  document.title = 'Fail Program Cikgu';
};
$('#btn-print').onclick = () => window.print();
document.querySelectorAll('.topbar nav button').forEach(b => b.onclick = () => { view = b.dataset.view; render(); });

render();

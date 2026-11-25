/* Penjana dokumen. Setiap fungsi pulangkan HTML satu atau lebih .page */
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const BULAN = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const HARI = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
function tarikhMs(iso, withDay) {
  if (!iso) return '__________';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return esc(iso);
  return (withDay ? HARI[d.getDay()] + ', ' : '') + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
}
const rm = n => 'RM ' + (Number(n) || 0).toLocaleString('ms-MY', {minimumFractionDigits:2, maximumFractionDigits:2});
const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
const rows = list => (list || []).filter(r => r.some(c => String(c || '').trim()));

function letterhead(S) {
  return `<div class="lh">${S.logo ? `<img src="${S.logo}" alt="">` : ''}
    <div><div class="name">${esc(S.nama || 'NAMA SEKOLAH')}</div>
    <div class="addr">${nl(S.alamat)}</div>
    <div class="addr">${[S.telefon && 'Tel: ' + esc(S.telefon), S.emel && 'E-mel: ' + esc(S.emel)].filter(Boolean).join(' &nbsp;|&nbsp; ')}</div></div></div>`;
}
function refBlock(S, P, suffix) {
  return `<div class="ref">Ruj. Kami : ${esc(P.rujFail || S.kodRujukan || '')}${suffix ? ' (' + suffix + ')' : ''}<br>
    Tarikh &nbsp;&nbsp;&nbsp;: ${tarikhMs(P.tarikhSurat)}</div>`;
}
function signBlock(S, opts = {}) {
  const nama = opts.nama || S.pengetua, jaw = opts.jawatan || S.jawatanPengetua || 'Pengetua';
  const sig = opts.useSig !== false && S.tandatangan ? `<img src="${S.tandatangan}" alt="">` : '<br><br><br>';
  return `<div class="sign">${esc(S.cogankata || '"BERKHIDMAT UNTUK NEGARA"')}<br><br>Saya yang menjalankan amanah,<br>
    ${sig}<div>................................................</div>
    <b>(${esc(nama || 'NAMA PENGETUA')})</b><br>${esc(jaw)}<br>${esc(S.nama || '')}</div>`;
}
const progInfo = P => `<table class="doc" style="width:auto;border:none">
  ${[['Tarikh', tarikhMs(P.tarikh, true)], ['Masa', esc(P.masa)], ['Tempat', esc(P.tempat)]]
    .map(([k, v]) => `<tr><td style="border:none;padding:1px 10px 1px 0">${k}</td><td style="border:none;padding:1px">: ${v}</td></tr>`).join('')}</table>`;

const DOCS = {
  kertasKerja: { tajuk: 'Kertas Kerja / Cadangan', gen(S, P) {
    const bajet = rows(P.bajet); let jum = 0;
    const bRows = bajet.map((r, i) => { const t = (+r[1] || 0) * (+r[2] || 0); jum += t;
      return `<tr><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td class="center">${esc(r[1])}</td><td style="text-align:right">${rm(r[2])}</td><td style="text-align:right">${rm(t)}</td></tr>`; }).join('');
    const ajk = rows(P.ajk);
    return `<div class="page">${letterhead(S)}
      <h1>KERTAS CADANGAN<br>${esc((P.nama || '').toUpperCase())}</h1>
      <h3>1.0 PENGENALAN / LATAR BELAKANG</h3><p>${nl(P.latar)}</p>
      <h3>2.0 OBJEKTIF</h3><ol>${lines(P.objektif).map(o => `<li>${esc(o)}</li>`).join('')}</ol>
      <h3>3.0 KUMPULAN SASARAN</h3><p>${nl(P.sasaran)}</p>
      <h3>4.0 TARIKH, MASA DAN TEMPAT</h3>${progInfo(P)}
      <h3>5.0 ANJURAN</h3><p>${esc(P.anjuran || S.nama)}</p>
      <h3>6.0 JAWATANKUASA PELAKSANA</h3>
      <table class="doc"><tr><th style="width:35%">Jawatan</th><th>Nama</th></tr>
      ${ajk.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
      <h3>7.0 ATUR CARA</h3>
      <table class="doc"><tr><th style="width:25%">Masa</th><th>Aktiviti</th></tr>
      ${rows(P.aturcara).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
      <h3>8.0 IMPLIKASI KEWANGAN</h3>
      <table class="doc"><tr><th>Bil</th><th>Perkara</th><th>Kuantiti</th><th>Harga Seunit</th><th>Jumlah</th></tr>
      ${bRows}<tr><th colspan="4" style="text-align:right">JUMLAH KESELURUHAN</th><th style="text-align:right">${rm(jum)}</th></tr></table>
      ${P.sumberKewangan ? `<p>Sumber kewangan: ${esc(P.sumberKewangan)}</p>` : ''}
      <h3>9.0 PENUTUP</h3><p>${nl(P.penutup || 'Adalah diharapkan kertas cadangan ini mendapat pertimbangan dan kelulusan daripada pihak pentadbir sekolah.')}</p>
      <table class="doc" style="margin-top:30px"><tr>
        <td style="width:50%;height:110px">Disediakan oleh:<br><br><br><br>.............................<br>(${esc(P.penyelaras || '')})<br>${esc(P.jawatanPenyelaras || 'Penyelaras Program')}</td>
        <td>Diluluskan / Tidak diluluskan:<br><br><br><br>.............................<br>(${esc(S.pengetua || '')})<br>${esc(S.jawatanPengetua || 'Pengetua')}</td></tr></table>
    </div>`; } },

  suratLantikan: { tajuk: 'Surat Lantikan AJK', perItem: 'ajk', gen(S, P) {
    const ajk = rows(P.ajk).filter(r => String(r[1] || '').trim());
    if (!ajk.length) return '<div class="page">Tiada AJK bernama. Sila isi tab Jawatankuasa.</div>';
    return ajk.map((r, i) => `<div class="page">${letterhead(S)}${refBlock(S, P, i + 1)}
      <p><b>${esc(r[1])}</b><br>${esc(S.nama || '')}</p>
      <p>Tuan/Puan,</p>
      <p><b>PELANTIKAN SEBAGAI ${esc((r[0] || '').toUpperCase())}<br>${esc((P.nama || '').toUpperCase())}</b></p>
      <p>Dengan segala hormatnya perkara di atas adalah dirujuk.</p>
      <p>2. Sukacita dimaklumkan bahawa tuan/puan telah dilantik sebagai <b>${esc(r[0])}</b> bagi ${esc(P.nama)} yang akan diadakan seperti berikut:</p>
      <div style="margin-left:30px">${progInfo(P)}</div>
      ${r[2] ? `<p>3. Bidang tugas tuan/puan adalah seperti berikut:</p><div style="margin-left:30px">${nl(r[2])}</div><p>4.` : '<p>3.'}
      Pihak sekolah amat menghargai komitmen dan kerjasama tuan/puan bagi menjayakan program ini.</p>
      <p>Sekian, terima kasih.</p>${signBlock(S)}</div>`).join('');
  } },

  suratJemputan: { tajuk: 'Surat Jemputan', perItem: 'tetamu', gen(S, P) {
    const t = rows(P.tetamu);
    if (!t.length) return '<div class="page">Tiada tetamu. Sila isi tab Tetamu.</div>';
    return t.map((r, i) => `<div class="page">${letterhead(S)}${refBlock(S, P, 'J' + (i + 1))}
      <p><b>${esc(r[0])}</b><br>${esc(r[1])}<br>${nl(r[2])}</p>
      <p>Tuan/Puan,</p>
      <p><b>JEMPUTAN KE ${esc((P.nama || '').toUpperCase())}</b></p>
      <p>Dengan segala hormatnya perkara di atas adalah dirujuk.</p>
      <p>2. Sukacita dimaklumkan bahawa ${esc(S.nama || 'pihak sekolah')} akan mengadakan ${esc(P.nama)} seperti butiran berikut:</p>
      <div style="margin-left:30px">${progInfo(P)}</div>
      <p>3. Sehubungan dengan itu, pihak sekolah dengan besar hati menjemput ${r[3] ? esc(r[3]) : 'tuan/puan'} untuk hadir ${P.perasmi && r[0] === P.perasmi ? 'dan seterusnya menyempurnakan majlis tersebut' : 'memeriahkan majlis tersebut'}.</p>
      <p>4. Kehadiran dan kerjasama tuan/puan amatlah dihargai dan didahului dengan ucapan terima kasih.</p>
      <p>Sekian, terima kasih.</p>${signBlock(S)}</div>`).join('');
  } },

  bukuProgram: { tajuk: 'Buku Program', gen(S, P) {
    const pen = rows(P.penerima);
    return `<div class="page booklet">${S.logo ? `<img src="${S.logo}" style="height:110px;margin:0 auto" alt="">` : ''}
        <div class="big">${esc((P.nama || '').toUpperCase())}</div>
        <div>${tarikhMs(P.tarikh, true)}<br>${esc(P.masa)}<br>${esc(P.tempat)}</div>
        ${P.perasmi ? `<p style="margin-top:30px">Dengan kehadiran<br><b>${esc(P.perasmi)}</b></p>` : ''}
        <p style="margin-top:40px"><b>${esc(S.nama || '')}</b></p></div>
      <div class="page"><h1>ATUR CARA MAJLIS</h1>
        <table class="doc"><tr><th style="width:25%">Masa</th><th>Acara</th></tr>
        ${rows(P.aturcara).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
        ${P.kataAlu ? `<h1 style="margin-top:30px">KATA ALUAN</h1><p>${nl(P.kataAlu)}</p>` : ''}</div>
      ${pen.length ? `<div class="page"><h1>SENARAI PENERIMA ANUGERAH</h1>
        <table class="doc"><tr><th>Bil</th><th>Nama</th><th>Kelas</th><th>Anugerah</th></tr>
        ${pen.map((r, i) => `<tr><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</table></div>` : ''}
      <div class="page"><h1>JAWATANKUASA PELAKSANA</h1>
        <table class="doc"><tr><th style="width:40%">Jawatan</th><th>Nama</th></tr>
        ${rows(P.ajk).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
        <p class="center" style="margin-top:30px"><i>Terima kasih atas kehadiran dan sokongan anda.</i></p></div>`;
  } },

  senaraiKehadiran: { tajuk: 'Senarai Kehadiran', gen(S, P) {
    const k = rows(P.kehadiran);
    const n = Math.max(k.length, 25);
    let body = '';
    for (let i = 0; i < n; i++) { const r = k[i] || [];
      body += `<tr style="height:26px"><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td></td></tr>`; }
    return `<div class="page">${letterhead(S)}<h1>SENARAI KEHADIRAN<br>${esc((P.nama || '').toUpperCase())}</h1>
      ${progInfo(P)}
      <table class="doc"><tr><th style="width:6%">Bil</th><th>Nama</th><th style="width:25%">Kelas / Jawatan</th><th style="width:22%">Tandatangan</th></tr>${body}</table></div>`;
  } },
};
